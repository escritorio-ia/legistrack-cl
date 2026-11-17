/**
 * Registro permanente de sesiones de comisión, relacionado con los boletines de su pauta.
 *
 * Junta en un documento por sesión (colección Firestore `registro_sesiones`) lo que llega de cada fuente oficial:
 *   - citacion:  citación de la Cámara (camara.cl, leída con la extensión) o del Senado (web-back.senado.cl)
 *   - historia:  lista oficial de sesiones realizadas del Senado
 *   - detalle:   detalle oficial de la sesión del Senado (puntos con boletín, aspectos, acuerdos, asistentes)
 *   - resultado: resultado oficial publicado por la Cámara
 * Cada fuente se guarda en su propio campo: una fuente que ya no está disponible (p. ej. la citación de una semana
 * pasada) no borra lo guardado. Los boletines se acumulan (nunca se quitan). No interviene la IA.
 * Credenciales: solo desde variables de entorno (VITE_FIREBASE_PROJECT_ID y VITE_FIREBASE_API_KEY).
 */
import { DIPUTADOS_COMISIONES_DETALLE, SENADO_COMISIONES_DETALLE } from "../../src/data/comisionesData";
import { boletinesEnTexto, normalizarBoletin, tiempoDeSesion } from "../../src/utils/boletines";
import { puntosDeMateria, type PuntoPauta } from "../../src/utils/pauta";
export { puntosDeMateria };
export type { PuntoPauta };
import { citacionesCamaraHistoricas, resultadosCamaraHistoricos } from "./sesionesCamaraService";
import { fetchSenadoCitacionesLive } from "./senadoService";

const COLECCION = "registro_sesiones";
const FUENTES = ["citacion", "historia", "detalle", "resultado"] as const;
type Fuente = (typeof FUENTES)[number];

function conexion(): { base: string; proy: string; key: string } {
  const proy = process.env.VITE_FIREBASE_PROJECT_ID || "";
  const key = process.env.VITE_FIREBASE_API_KEY || "";
  if (!proy || !key) throw new Error("Faltan VITE_FIREBASE_PROJECT_ID o VITE_FIREBASE_API_KEY en el entorno del servidor.");
  return { proy, key, base: `https://firestore.googleapis.com/v1/projects/${proy}/databases/(default)/documents` };
}


/** Datos de una fuente para una sesión: siempre tal como vienen de la fuente oficial. */
export interface AporteSesion {
  id: string;
  fuente: Fuente;
  camara: "Cámara" | "Senado";
  comisionId: string;
  comisionNombre: string;
  fecha: string; // aaaa-mm-dd
  datos: Record<string, unknown>;
  boletines: string[];
}

// ---------------------------------------------------------------------------
// Utilidades puras (con pruebas en tests/registroSesiones.test.ts)
// ---------------------------------------------------------------------------
export function fechaISO(texto: string): string {
  const t = tiempoDeSesion(texto);
  if (!t) return "";
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function horaInicio(texto: string): string {
  const m = String(texto || "").match(/(\d{1,2})[:.](\d{2})/);
  return m ? `${m[1].padStart(2, "0")}${m[2]}` : "";
}
const slug = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^comision\s+(de\s+|del\s+)?/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/** Identificador de la sesión, común a todas sus fuentes: cámara + comisión + fecha + hora de inicio. */
export function idSesion(camara: "Cámara" | "Senado", comision: string, fecha: string, hora: string): string {
  return `${camara === "Senado" ? "sr" : "cd"}-${slug(comision) || "sin-comision"}-${fecha || "sin-fecha"}-${horaInicio(hora) || "0000"}`;
}

/** Huella corta de un objeto, para no volver a escribir lo que no cambió. */
export function huella(o: unknown): string {
  const s = JSON.stringify(o);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${(h >>> 0).toString(36)}-${s.length}`;
}

// ---------------------------------------------------------------------------
// Fuentes -> aportes
// ---------------------------------------------------------------------------
const nombreCamara = (slugCamara: string, nombre: string) =>
  DIPUTADOS_COMISIONES_DETALLE.find((c) => c.id === slugCamara)?.nombre || (/^comisi[oó]n/i.test(nombre) ? nombre : `Comisión de ${nombre}`);

export function aportesCitacionesCamara(citaciones: any[]): AporteSesion[] {
  const out: AporteSesion[] = [];
  for (const c of citaciones || []) {
    const fecha = fechaISO(c.fecha);
    if (!fecha || !c.comisionNombre) continue;
    const nombre = nombreCamara(c.comisionSlug, c.comisionNombre);
    const puntos = puntosDeMateria(c.materia);
    const boletines = Array.from(new Set([...(c.boletinesRelacionados || []).map(normalizarBoletin), ...puntos.flatMap((p) => p.boletines)].filter(Boolean)));
    out.push({
      id: idSesion("Cámara", c.comisionSlug || nombre, fecha, c.hora),
      fuente: "citacion", camara: "Cámara", comisionId: c.comisionSlug ? `cd-${c.comisionSlug}` : "", comisionNombre: nombre, fecha, boletines,
      datos: {
        fechaTexto: c.fecha, hora: c.hora || null, lugar: c.lugar || null, citacionNumero: c.citacionNumero || null, tipo: c.tipo || null,
        materia: c.materia || null, puntos, invitados: c.invitados && !/^no informad/i.test(c.invitados) ? c.invitados : null,
        url: "https://www.camara.cl/legislacion/comisiones/citaciones.aspx",
      },
    });
  }
  return out;
}

export function aportesResultadosCamara(resultados: any[]): AporteSesion[] {
  const out: AporteSesion[] = [];
  for (const r of resultados || []) {
    const fecha = fechaISO(r.fecha);
    if (!fecha || !r.comisionNombre || !r.resultado) continue;
    const nombre = nombreCamara(r.comisionSlug, r.comisionNombre);
    out.push({
      id: idSesion("Cámara", r.comisionSlug || nombre, fecha, r.hora),
      fuente: "resultado", camara: "Cámara", comisionId: r.comisionSlug ? `cd-${r.comisionSlug}` : "", comisionNombre: nombre, fecha,
      boletines: Array.from(new Set([...(r.boletines || []).map(normalizarBoletin), ...boletinesEnTexto(`${r.materia || ""} ${r.resultado}`)].filter(Boolean))),
      datos: { resultado: r.resultado, materia: r.materia || null, url: "https://www.camara.cl/legislacion/comisiones/resultados.aspx" },
    });
  }
  return out;
}

const nombreSenado = (idComision: string, nombre: string) =>
  SENADO_COMISIONES_DETALLE.find((c) => c.senadoId === String(idComision))?.nombre || nombre || "Comisión del Senado";
const idSenadoApp = (idComision: string) => {
  const c = SENADO_COMISIONES_DETALLE.find((x) => x.senadoId === String(idComision));
  return c ? `senado-${c.id}` : "";
};

export function aportesCitacionesSenado(citaciones: any[]): AporteSesion[] {
  const out: AporteSesion[] = [];
  for (const c of citaciones || []) {
    const fecha = fechaISO(c.fecha);
    if (!fecha || !c.idComision) continue;
    const nombre = nombreSenado(String(c.idComision), c.comision);
    const puntos = puntosDeMateria(c.materia);
    out.push({
      id: idSesion("Senado", nombre, fecha, c.hora),
      fuente: "citacion", camara: "Senado", comisionId: idSenadoApp(String(c.idComision)), comisionNombre: nombre, fecha,
      boletines: Array.from(new Set([...(c.boletines || []).map(normalizarBoletin), ...puntos.flatMap((p) => p.boletines)].filter(Boolean))),
      datos: {
        fechaTexto: c.fecha, hora: /^horario reglamentario$/i.test(c.hora || "") ? null : c.hora || null, lugar: /^valpara[ií]so \/ santiago$/i.test(c.lugar || "") ? null : c.lugar || null,
        citacionNumero: c.idCitacion ? `Citación N° ${c.idCitacion}` : null, materia: /^sesi[oó]n de comisi[oó]n$/i.test(c.materia || "") ? null : c.materia || null, puntos,
        senadoComisionId: String(c.idComision), url: "https://www.senado.cl/actividad-legislativa/comisiones/citaciones",
      },
    });
  }
  return out;
}

export function aportesHistoriaSenado(idComision: string, sesiones: any[]): AporteSesion[] {
  const nombre = nombreSenado(idComision, "");
  return (sesiones || []).map((h: any) => {
    const fecha = fechaISO(h.fecha);
    const puntos = puntosDeMateria(h.materia);
    return {
      id: idSesion("Senado", nombre, fecha, h.inicio), fuente: "historia" as const, camara: "Senado" as const,
      comisionId: idSenadoApp(idComision), comisionNombre: nombre, fecha, boletines: puntos.flatMap((p) => p.boletines),
      datos: {
        idSesionSenado: String(h.idSesion), inicio: h.inicio || null, termino: h.termino || null, lugar: h.lugar || null, materia: h.materia || null,
        puntos, fracasada: !!h.fracasada, senadoComisionId: idComision, url: `https://www.senado.cl/actividad-legislativa/comisiones/${idComision}/${h.idSesion}`,
      },
    };
  }).filter((a) => a.fecha);
}

export function aporteDetalleSenado(idComision: string, h: any, det: any): AporteSesion | null {
  if (!det?.disponible) return null;
  const nombre = nombreSenado(idComision, det.comision);
  const fecha = fechaISO(det.fecha || h.fecha);
  if (!fecha) return null;
  const puntos = (det.puntos || []).map((p: any, i: number) => ({
    numero: Number(p.numero) || i + 1, texto: String(p.tema || "").trim(), boletines: Array.from(new Set([normalizarBoletin(p.boletin || ""), ...boletinesEnTexto(p.tema || "")].filter(Boolean))),
    aspectos: p.aspectos || null, acuerdos: p.acuerdos && !/^pendiente\.?$/i.test(String(p.acuerdos).trim()) ? p.acuerdos : null,
    invitados: p.invitados || null, asistentes: p.asistentes || null,
  }));
  return {
    id: idSesion("Senado", nombre, fecha, h.inicio || det.inicio), fuente: "detalle", camara: "Senado", comisionId: idSenadoApp(idComision), comisionNombre: nombre, fecha,
    boletines: Array.from(new Set(puntos.flatMap((p: any) => p.boletines))),
    datos: { puntos, inicio: det.inicio || null, termino: det.termino || null, lugar: det.lugar || null, presentaciones: det.presentaciones || [], url: det.url || null },
  };
}

/**
 * El resultado oficial de la Cámara a veces no trae la hora (o la trae distinta), y quedaba en otro documento que la
 * citación de la misma sesión. Si ese día la comisión tuvo UNA sola citación, el resultado se une a ella. Si tuvo varias,
 * no se adivina: el resultado queda en su propio documento.
 */
export function unirResultadosConCitaciones(aportes: AporteSesion[]): AporteSesion[] {
  const dia = (a: AporteSesion) => `${a.camara}|${a.comisionId || a.comisionNombre}|${a.fecha}`;
  const citacionesPorDia = new Map<string, Set<string>>();
  for (const a of aportes) if (a.fuente === "citacion") citacionesPorDia.set(dia(a), (citacionesPorDia.get(dia(a)) || new Set()).add(a.id));
  return aportes.map((a) => {
    if (a.fuente !== "resultado") return a;
    const ids = citacionesPorDia.get(dia(a));
    if (!ids || ids.has(a.id) || ids.size !== 1) return a;
    return { ...a, id: [...ids][0] };
  });
}

/** Lectura: une un documento con solo el resultado al de la citación del mismo día (una sola citación ese día). */
export function unirSesionesLeidas(lista: SesionRegistrada[]): SesionRegistrada[] {
  const clave = (x: SesionRegistrada) => `${x.camara}|${x.comisionId || x.comisionNombre}|${x.fecha}`;
  const conCitacion = new Map<string, SesionRegistrada[]>();
  for (const x of lista) if (x.fuentes.includes("citación oficial")) conCitacion.set(clave(x), [...(conCitacion.get(clave(x)) || []), x]);
  const out: SesionRegistrada[] = [];
  for (const x of lista) {
    const soloResultado = x.resultado && !x.fuentes.includes("citación oficial") && x.fuentes.length === 1;
    const destino = soloResultado ? conCitacion.get(clave(x)) : undefined;
    if (destino && destino.length === 1) {
      const d = destino[0];
      if (!d.resultado) d.resultado = x.resultado;
      d.fuentes = Array.from(new Set([...d.fuentes, ...x.fuentes]));
      d.boletines = Array.from(new Set([...d.boletines, ...x.boletines]));
      d.enlaces = Array.from(new Set([...d.enlaces, ...x.enlaces]));
      continue;
    }
    out.push(x);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Firestore (REST)
// ---------------------------------------------------------------------------
async function listarDocs(coleccion: string, mascara?: string[]): Promise<any[]> {
  const { base, key } = conexion();
  const docs: any[] = [];
  let pageToken = "";
  for (let i = 0; i < 60; i++) {
    const qs = new URLSearchParams({ pageSize: "300", key, ...(pageToken ? { pageToken } : {}) });
    for (const m of mascara || []) qs.append("mask.fieldPaths", m);
    const r = await fetch(`${base}/${coleccion}?${qs}`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`Firestore (${coleccion}) respondió HTTP ${r.status}`);
    const d: any = await r.json();
    docs.push(...(d.documents || []));
    pageToken = d.nextPageToken || "";
    if (!pageToken) break;
  }
  return docs;
}
const idDoc = (d: any) => String(d.name || "").split("/").pop() || "";
const sv = (v: string) => ({ stringValue: v });

/** Agrupa los aportes por sesión y escribe solo las fuentes que cambiaron. */
async function escribirAportes(aportes: AporteSesion[]): Promise<{ sesiones: number; escrituras: number }> {
  const { base, proy, key } = conexion();
  const porSesion = new Map<string, AporteSesion[]>();
  for (const a of aportes) porSesion.set(a.id, [...(porSesion.get(a.id) || []), a]);
  const existentes = new Map<string, Record<string, string>>();
  for (const d of await listarDocs(COLECCION, FUENTES.map((f) => `h_${f}`))) {
    const f: Record<string, string> = {};
    for (const k of FUENTES) { const v = d.fields?.[`h_${k}`]?.stringValue; if (v) f[k] = v; }
    existentes.set(idDoc(d), f);
  }
  const writes: any[] = [];
  const ahora = new Date().toISOString();
  for (const [id, lista] of porSesion) {
    const previas = existentes.get(id) || {};
    const fields: Record<string, any> = {};
    const mask: string[] = [];
    for (const a of lista) {
      const h = huella(a.datos);
      if (previas[a.fuente] === h || fields[a.fuente]) continue;
      fields[a.fuente] = sv(JSON.stringify(a.datos));
      fields[`h_${a.fuente}`] = sv(h);
      mask.push(a.fuente, `h_${a.fuente}`);
    }
    if (mask.length === 0) continue;
    const primero = lista[0];
    Object.assign(fields, { camara: sv(primero.camara), comisionNombre: sv(primero.comisionNombre), fecha: sv(primero.fecha), actualizado: sv(ahora) });
    mask.push("camara", "comisionNombre", "fecha", "actualizado");
    const comisionId = lista.find((a) => a.comisionId)?.comisionId;
    if (comisionId) { fields.comisionId = sv(comisionId); mask.push("comisionId"); }
    const boletines = Array.from(new Set(lista.flatMap((a) => a.boletines).filter(Boolean)));
    writes.push({
      update: { name: `projects/${proy}/databases/(default)/documents/${COLECCION}/${id}`, fields },
      updateMask: { fieldPaths: mask },
      updateTransforms: [{ fieldPath: "boletines", appendMissingElements: { values: boletines.map(sv) } }],
    });
  }
  for (let i = 0; i < writes.length; i += 400) {
    const r = await fetch(`${base}:commit?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writes: writes.slice(i, i + 400) }), signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Firestore no aceptó la escritura (HTTP ${r.status}): ${(await r.text()).slice(0, 200)}`);
  }
  return { sesiones: porSesion.size, escrituras: writes.length };
}

// ---------------------------------------------------------------------------
// Sincronización (automática: tarea diaria de Vercel y después de cada importación de la extensión)
// ---------------------------------------------------------------------------
export interface ResultadoSincronizacion {
  ok: boolean;
  sesiones: number;
  escrituras: number;
  porFuente: Record<string, number>;
  errores: string[];
  duracionMs: number;
  omitida?: string;
}

let enCurso: Promise<ResultadoSincronizacion> | null = null;
let ultima = 0;
const INTERVALO_MIN_MS = 5 * 60 * 1000;

export async function sincronizarRegistroSesiones(opciones: { forzar?: boolean } = {}): Promise<ResultadoSincronizacion> {
  if (enCurso) return enCurso;
  if (!opciones.forzar && Date.now() - ultima < INTERVALO_MIN_MS) {
    return { ok: true, sesiones: 0, escrituras: 0, porFuente: {}, errores: [], duracionMs: 0, omitida: "Se sincronizó hace menos de 5 minutos." };
  }
  enCurso = (async () => {
    const t0 = Date.now();
    const errores: string[] = [];
    const aportes: AporteSesion[] = [];
    const porFuente: Record<string, number> = {};
    const sumar = (nombre: string, lista: AporteSesion[]) => { porFuente[nombre] = lista.length; aportes.push(...lista); };
    try { conexion(); } catch (e: any) {
      return { ok: false, sesiones: 0, escrituras: 0, porFuente, errores: [String(e?.message || e)], duracionMs: 0 };
    }
    // Cámara: citaciones importadas (todas las semanas guardadas) y resultados oficiales.
    try { sumar("citaciones Cámara", aportesCitacionesCamara(await citacionesCamaraHistoricas())); } catch (e: any) { errores.push(`Citaciones Cámara: ${e?.message || e}`); }
    try { sumar("resultados Cámara", aportesResultadosCamara(await resultadosCamaraHistoricos())); } catch (e: any) { errores.push(`Resultados Cámara: ${e?.message || e}`); }
    // Senado: citaciones de la semana, historial de sesiones por comisión y detalle de cada sesión.
    try { sumar("citaciones Senado", aportesCitacionesSenado((await fetchSenadoCitacionesLive(false)).citaciones)); } catch (e: any) { errores.push(`Citaciones Senado: ${e?.message || e}`); }
    try {
      const historias = await listarDocs("sesiones_senado");
      const detalles = new Map<string, any>();
      try {
        for (const d of await listarDocs("sesiones_senado_detalle")) {
          try { detalles.set(idDoc(d), JSON.parse(d.fields?.payload?.stringValue || "null")); } catch { /* ilegible */ }
        }
      } catch (e: any) { errores.push(`Detalle Senado: ${e?.message || e}`); }
      const hist: AporteSesion[] = [];
      const det: AporteSesion[] = [];
      for (const doc of historias) {
        const idComision = idDoc(doc);
        let sesiones: any[] = [];
        try { sesiones = JSON.parse(doc.fields?.payload?.stringValue || "[]"); } catch { continue; }
        hist.push(...aportesHistoriaSenado(idComision, sesiones));
        for (const h of sesiones) {
          const a = aporteDetalleSenado(idComision, h, detalles.get(String(h.idSesion)));
          if (a) det.push(a);
        }
      }
      sumar("historial Senado", hist);
      sumar("detalle Senado", det);
    } catch (e: any) { errores.push(`Historial Senado: ${e?.message || e}`); }

    let r = { sesiones: 0, escrituras: 0 };
    try { r = await escribirAportes(unirResultadosConCitaciones(aportes.filter((a) => a.fecha))); }
    catch (e: any) { errores.push(`Escritura: ${e?.message || e}`); }
    ultima = Date.now();
    return { ok: errores.length === 0, ...r, porFuente, errores, duracionMs: Date.now() - t0 };
  })().finally(() => { enCurso = null; });
  return enCurso;
}

// ---------------------------------------------------------------------------
// Lectura por boletín (vista combinada de todas las fuentes)
// ---------------------------------------------------------------------------
export interface SesionRegistrada {
  id: string;
  camara: string;
  comisionId?: string;
  comisionNombre: string;
  fecha: string;
  boletines: string[];
  fuentes: string[];
  hora: string | null;
  lugar: string | null;
  citacionNumero: string | null;
  materia: string | null;
  puntos: (PuntoPauta & { aspectos?: string | null; acuerdos?: string | null; invitados?: string | null; asistentes?: string | null })[];
  invitados: string | null;
  resultado: string | null;
  enlaces: string[];
  actualizado?: string;
}

export function combinarSesion(id: string, f: Record<string, any>): SesionRegistrada {
  // id = "<cámara>-<comisión>-<aaaa-mm-dd>-<hhmm>": la hora de inicio permite distinguir dos sesiones del mismo día.
  const leer = (k: string) => { try { return JSON.parse(f[k]?.stringValue || "null"); } catch { return null; } };
  const cit = leer("citacion"), his = leer("historia"), det = leer("detalle"), res = leer("resultado");
  const fuentes = [cit && "citación oficial", his && "registro de sesiones del Senado", det && "detalle oficial de la sesión", res && "resultado oficial"].filter(Boolean) as string[];
  const hora = cit?.hora || (his?.inicio ? [his.inicio, his.termino].filter(Boolean).join(" a ") : null) || (det?.inicio ? [det.inicio, det.termino].filter(Boolean).join(" a ") : null);
  return {
    id, camara: f.camara?.stringValue || "", comisionId: f.comisionId?.stringValue, comisionNombre: f.comisionNombre?.stringValue || "", fecha: f.fecha?.stringValue || "",
    boletines: (f.boletines?.arrayValue?.values || []).map((v: any) => v.stringValue).filter(Boolean),
    fuentes, hora, lugar: cit?.lugar || det?.lugar || his?.lugar || null, citacionNumero: cit?.citacionNumero || null,
    materia: cit?.materia || his?.materia || res?.materia || null,
    // El detalle oficial (con aspectos y acuerdos por punto) manda; si no existe, la pauta de la citación o del registro.
    puntos: det?.puntos?.length ? det.puntos : cit?.puntos?.length ? cit.puntos : his?.puntos || [],
    invitados: cit?.invitados || null, resultado: res?.resultado || null,
    enlaces: Array.from(new Set([cit?.url, his?.url, det?.url, res?.url].filter(Boolean))),
    actualizado: f.actualizado?.stringValue,
  };
}

export async function sesionesRegistradasDeBoletin(boletin: string): Promise<SesionRegistrada[]> {
  const b = normalizarBoletin(boletin);
  if (!b || !b.includes("-")) return [];
  const { base, key } = conexion();
  const r = await fetch(`${base}:runQuery?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: COLECCION }], where: { fieldFilter: { field: { fieldPath: "boletines" }, op: "ARRAY_CONTAINS", value: sv(b) } } } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`Firestore respondió HTTP ${r.status}`);
  const filas: any[] = await r.json();
  return unirSesionesLeidas(filas.filter((x) => x.document).map((x) => combinarSesion(idDoc(x.document), x.document.fields || {}))).sort((a, c) => c.fecha.localeCompare(a.fecha));
}

/** Sesiones registradas de una comisión (identificador de la app: "cd-<slug>" o "senado-<id>"), la más reciente primero. */
export async function sesionesRegistradasDeComision(comisionId: string): Promise<SesionRegistrada[]> {
  const id = String(comisionId || "").trim();
  if (!/^(cd|senado)-[a-z0-9-]+$/.test(id)) return [];
  const { base, key } = conexion();
  const r = await fetch(`${base}:runQuery?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    // Sin orderBy: combinado con el filtro exigiría un índice compuesto; se ordena en memoria.
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: COLECCION }], where: { fieldFilter: { field: { fieldPath: "comisionId" }, op: "EQUAL", value: sv(id) } } } }),
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`Firestore respondió HTTP ${r.status}`);
  const filas: any[] = await r.json();
  return unirSesionesLeidas(filas.filter((x) => x.document).map((x) => combinarSesion(idDoc(x.document), x.document.fields || {}))).sort((a, c) => c.fecha.localeCompare(a.fecha) || c.id.localeCompare(a.id));
}

const nombreComisionNorm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/\b(comision|especial|permanente|mixta|unida|unidas|de|del|la|las|el|los|y|e)\b/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/**
 * Registro oficial de una sesión a partir del nombre de la comisión y la fecha (texto como lo muestra la app).
 * Si hay más de una sesión ese día, usa la hora de inicio para elegir. null si no hay registro.
 */
export async function sesionRegistradaPorFecha(comision: string, fechaTexto: string, hora?: string): Promise<SesionRegistrada | null> {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(fechaTexto) ? fechaTexto : fechaISO(fechaTexto);
  const objetivo = nombreComisionNorm(comision);
  if (!iso || !objetivo) return null;
  const { base, key } = conexion();
  const r = await fetch(`${base}:runQuery?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: COLECCION }], where: { fieldFilter: { field: { fieldPath: "fecha" }, op: "EQUAL", value: sv(iso) } } } }),
    signal: AbortSignal.timeout(12000),
  });
  if (!r.ok) return null;
  const filas: any[] = await r.json();
  const candidatas = unirSesionesLeidas(filas.filter((x) => x.document).map((x) => combinarSesion(idDoc(x.document), x.document.fields || {})))
    .filter((s) => { const n = nombreComisionNorm(s.comisionNombre); return n && (n === objetivo || n.includes(objetivo) || objetivo.includes(n)); });
  if (candidatas.length === 0) return null;
  const hh = String(hora || "").match(/(\d{1,2}):(\d{2})/);
  if (hh && candidatas.length > 1) {
    const h = `${hh[1].padStart(2, "0")}:${hh[2]}`;
    const exacta = candidatas.find((s) => String(s.hora || "").includes(h));
    if (exacta) return exacta;
  }
  // La más completa (con detalle o resultado oficial) primero.
  return candidatas.sort((a, b) => (b.fuentes.length - a.fuentes.length))[0];
}
