/**
 * Sala de sesiones con datos oficiales, relacionados con boletines.
 *  - Cámara: opendata.camara.cl (WSSala sesiones y asistencia, WSLegislativo votaciones). Responde a servidores.
 *  - Senado: web-back.senado.cl/api/weekly_table (tabla semanal de la Sala). Si no responde al servidor,
 *    se usa la última lectura enviada por la extensión de navegador (sin evadir ningún control).
 * Cada sesión se guarda en Firestore (colección "sesiones_sala") con sus boletines, para el historial
 * y las métricas de cada boletín. Si una fuente falla se informa "no disponible"; nunca se inventa.
 */
import { cache } from "./cacheService";
import { normalizarBoletin } from "../../src/utils/boletines";
import {
  SesionSala, parsearTablaSenado, parsearSesionesCamara, parsearVotacionesCamara, contarAsistencia, asignarVotaciones,
} from "../../src/utils/sala";

const OPENDATA = "https://opendata.camara.cl/camaradiputados/WServices";
const SENADO_TABLA = "https://web-back.senado.cl/api/weekly_table?limit=100";
const COLECCION = "sesiones_sala";

export interface FuenteSala {
  disponible: boolean;
  motivo?: string;
  fuente: string;
  leidoEn?: string;
  sesiones: SesionSala[];
}
export interface SalaSemana {
  camara: FuenteSala & { transmision: string };
  senado: FuenteSala & { transmision: string; origen?: "directo" | "extension" };
  hoy: string;
}

function conexion(): { base: string; proy: string; key: string } {
  const proy = process.env.VITE_FIREBASE_PROJECT_ID || "";
  const key = process.env.VITE_FIREBASE_API_KEY || "";
  if (!proy || !key) throw new Error("Faltan VITE_FIREBASE_PROJECT_ID o VITE_FIREBASE_API_KEY en el entorno del servidor.");
  return { proy, key, base: `https://firestore.googleapis.com/v1/projects/${proy}/databases/(default)/documents` };
}
const sv = (v: string) => ({ stringValue: v });

/** Fecha de hoy en Chile (AAAA-MM-DD). */
export function hoyChile(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
const sumarDias = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

async function opendata(path: string, ms = 20000): Promise<string> {
  const r = await fetch(`${OPENDATA}/${path}`, { headers: { "User-Agent": "LegisTrackCL/1.0 (datos abiertos)" }, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(`opendata.camara.cl HTTP ${r.status}`);
  return r.text();
}

// ---------------------------------------------------------------------------
// Cámara
// ---------------------------------------------------------------------------
/** Todas las sesiones de Sala del año con sus votaciones (y asistencia de las celebradas recientes). */
export async function sesionesSalaCamara(anio: number, conAsistenciaDesde?: string): Promise<SesionSala[]> {
  return cache.wrap(`sala_camara_${anio}_${conAsistenciaDesde || ""}`, 15 * 60 * 1000, async () => {
    const [xmlS, xmlV] = await Promise.all([
      opendata(`WSSala.asmx/retornarSesionesXAnno?prmAnno=${anio}`),
      opendata(`WSLegislativo.asmx/retornarVotacionesXAnno?prmAnno=${anio}`, 30000).catch(() => ""),
    ]);
    const sesiones = asignarVotaciones(parsearSesionesCamara(xmlS), xmlV ? parsearVotacionesCamara(xmlV) : []);
    if (conAsistenciaDesde) {
      await Promise.all(sesiones.filter((s) => s.estado === "Celebrada" && s.fecha >= conAsistenciaDesde).map(async (s) => {
        const id = s.id.replace(/^cd-/, "");
        try {
          const xml = await cache.wrap(`sala_asistencia_${id}`, 12 * 3600 * 1000, () => opendata(`WSSala.asmx/retornarSesionAsistencia?prmSesionId=${id}`, 12000));
          s.asistencia = contarAsistencia(xml);
        } catch { /* asistencia no disponible */ }
      }));
    }
    return sesiones;
  });
}

async function salaCamaraSemana(hoy: string): Promise<SalaSemana["camara"]> {
  const fuente = "Datos Abiertos de la Cámara (opendata.camara.cl): sesiones de Sala, votaciones y asistencia";
  const transmision = "https://www.camara.cl/prensa/television.aspx";
  const desde = sumarDias(hoy, -7), hasta = sumarDias(hoy, 7);
  try {
    const anios = Array.from(new Set([desde.slice(0, 4), hasta.slice(0, 4)])).map(Number);
    const todas = (await Promise.all(anios.map((a) => sesionesSalaCamara(a, desde)))).flat();
    const sesiones = todas.filter((s) => s.fecha >= desde && s.fecha <= hasta).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio));
    return { disponible: true, fuente, transmision, leidoEn: new Date().toISOString(), sesiones };
  } catch (err: any) {
    return { disponible: false, motivo: `No se pudo consultar opendata.camara.cl: ${err?.message || err}`, fuente, transmision, sesiones: [] };
  }
}

// ---------------------------------------------------------------------------
// Senado
// ---------------------------------------------------------------------------
async function leerImportadoSenado(): Promise<{ raw: any; importadoEn: string } | null> {
  try {
    const { base, key } = conexion();
    const r = await fetch(`${base}/sala_senado/actual?key=${key}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const d: any = await r.json();
    const txt = d?.fields?.payload?.stringValue;
    return txt ? JSON.parse(txt) : null;
  } catch { return null; }
}

/** Tabla semanal del Senado enviada por la extensión de navegador. */
export async function importarTablaSenado(raw: any): Promise<{ sesiones: number; puntos: number }> {
  const sesiones = parsearTablaSenado(raw);
  if (sesiones.length === 0) throw new Error("La respuesta del Senado no contiene sesiones de Sala.");
  const { base, key } = conexion();
  const registro = { raw, importadoEn: new Date().toISOString() };
  const r = await fetch(`${base}/sala_senado/actual?key=${key}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { payload: sv(JSON.stringify(registro)), actualizado: sv(registro.importadoEn) } }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`Firestore respondió HTTP ${r.status}`);
  cache.delete("sala_senado_semana");
  await guardarSesionesSala(sesiones).catch(() => undefined);
  return { sesiones: sesiones.length, puntos: sesiones.reduce((n, s) => n + s.puntos.length, 0) };
}

async function salaSenadoSemana(): Promise<SalaSemana["senado"]> {
  const transmision = "https://tv.senado.cl/";
  const fuente = "Tabla semanal de la Sala del Senado (senado.cl)";
  return cache.wrap("sala_senado_semana", 10 * 60 * 1000, async () => {
    let motivoDirecto = "";
    try {
      const r = await fetch(SENADO_TABLA, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const sesiones = parsearTablaSenado(await r.json());
      if (sesiones.length > 0) return { disponible: true, fuente, transmision, origen: "directo" as const, leidoEn: new Date().toISOString(), sesiones };
      motivoDirecto = "la tabla vino vacía";
    } catch (err: any) { motivoDirecto = err?.message || String(err); }
    const imp = await leerImportadoSenado();
    if (imp) {
      const sesiones = parsearTablaSenado(imp.raw);
      if (sesiones.length > 0) return { disponible: true, fuente: `${fuente}, leída con la extensión de navegador`, transmision, origen: "extension" as const, leidoEn: imp.importadoEn, sesiones };
    }
    return { disponible: false, motivo: `senado.cl no respondió al servidor (${motivoDirecto}) y no hay lectura de la extensión.`, fuente, transmision, sesiones: [] };
  });
}

// ---------------------------------------------------------------------------
// Semana completa y registro persistente
// ---------------------------------------------------------------------------
let ultimoGuardado = 0;
export async function salaSemana(): Promise<SalaSemana> {
  const hoy = hoyChile();
  const [camara, senado] = await Promise.all([salaCamaraSemana(hoy), salaSenadoSemana()]);
  // Registro automático (como máximo cada 30 min por instancia), sin bloquear la respuesta más de 4 s.
  if (Date.now() - ultimoGuardado > 30 * 60 * 1000) {
    ultimoGuardado = Date.now();
    const lote = [...camara.sesiones, ...senado.sesiones].filter((s) => s.fecha <= hoy || s.puntos.length > 0);
    await Promise.race([guardarSesionesSala(lote).catch(() => undefined), new Promise((r) => setTimeout(r, 4000))]);
  }
  return { camara, senado, hoy };
}

function huella(o: unknown): string {
  const s = JSON.stringify(o); let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Guarda (o actualiza si cambió) cada sesión de Sala con sus boletines. */
export async function guardarSesionesSala(sesiones: SesionSala[]): Promise<{ escritas: number }> {
  if (sesiones.length === 0) return { escritas: 0 };
  const { base, proy, key } = conexion();
  const previas = new Map<string, string>();
  let pageToken = "";
  for (let i = 0; i < 20; i++) {
    const qs = new URLSearchParams({ pageSize: "300", key, ...(pageToken ? { pageToken } : {}) });
    qs.append("mask.fieldPaths", "h");
    const r = await fetch(`${base}/${COLECCION}?${qs}`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) break;
    const d: any = await r.json();
    for (const doc of d.documents || []) previas.set(String(doc.name).split("/").pop() || "", doc.fields?.h?.stringValue || "");
    pageToken = d.nextPageToken || "";
    if (!pageToken) break;
  }
  const ahora = new Date().toISOString();
  const writes = sesiones.flatMap((s) => {
    const h = huella(s);
    if (previas.get(s.id) === h) return [];
    return [{
      update: {
        name: `projects/${proy}/databases/(default)/documents/${COLECCION}/${s.id}`,
        fields: {
          camara: sv(s.camara), fecha: sv(s.fecha), numero: sv(s.numero), datos: sv(JSON.stringify(s)), h: sv(h), actualizado: sv(ahora),
          boletines: { arrayValue: { values: s.boletines.map(sv) } },
        },
      },
    }];
  });
  for (let i = 0; i < writes.length; i += 400) {
    const r = await fetch(`${base}:commit?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writes: writes.slice(i, i + 400) }), signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Firestore no aceptó la escritura (HTTP ${r.status})`);
  }
  return { escritas: writes.length };
}

/** Sincronización diaria: todas las sesiones de Sala de la Cámara del año (con votaciones) y la tabla del Senado. */
export async function sincronizarSala(): Promise<{ camara: number; senado: number; escritas: number }> {
  const anio = Number(hoyChile().slice(0, 4));
  const camara = (await sesionesSalaCamara(anio).catch(() => [] as SesionSala[])).filter((s) => s.estado === "Celebrada" || s.fecha <= hoyChile());
  const senado = (await salaSenadoSemana()).sesiones;
  const { escritas } = await guardarSesionesSala([...camara, ...senado]);
  return { camara: camara.length, senado: senado.length, escritas };
}

/** Paso de un boletín por la Sala (ambas cámaras), la sesión más reciente primero. */
export async function sesionesSalaDeBoletin(boletin: string): Promise<SesionSala[]> {
  const b = normalizarBoletin(boletin);
  if (!b.includes("-")) return [];
  const { base, key } = conexion();
  const r = await fetch(`${base}:runQuery?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: COLECCION }], where: { fieldFilter: { field: { fieldPath: "boletines" }, op: "ARRAY_CONTAINS", value: sv(b) } } } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`Firestore respondió HTTP ${r.status}`);
  const filas: any[] = await r.json();
  const guardadas: SesionSala[] = filas.filter((x) => x.document?.fields?.datos?.stringValue).map((x) => {
    try { return JSON.parse(x.document.fields.datos.stringValue); } catch { return null; }
  }).filter(Boolean);
  return guardadas.sort((a, c) => c.fecha.localeCompare(a.fecha) || c.horaInicio.localeCompare(a.horaInicio));
}
