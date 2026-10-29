import { 
  DIPUTADOS_COMISIONES_DETALLE, 
  SENADO_COMISIONES_DETALLE,
  CAMARA_CITACIONES_SEMANALES_POR_DIA,
  CAMARA_CITACIONES_POR_COMISION,
  CAMARA_CITACIONES_FULL_WEEK
} from "../../src/data/comisionesData";
import { cache } from "./cacheService";

export interface ComisionReal {
  id: string;
  nombre: string;
  descripcion: string;
  senado: boolean;
}

export const SENADO_COMISIONES_REALES: ComisionReal[] = SENADO_COMISIONES_DETALLE.map(c => ({
  id: `${c.prefix}${c.id}`,
  nombre: c.nombre,
  descripcion: c.descripcion,
  senado: true
}));

export const DIPUTADOS_COMISIONES_REALES: ComisionReal[] = DIPUTADOS_COMISIONES_DETALLE.map(c => ({
  id: `${c.prefix}${c.id}`,
  nombre: c.nombre,
  descripcion: c.descripcion,
  senado: false
}));

function getCommissionSlugFromName(name: string): string | null {
  const n = (name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes("gobierno interior")) return "gobierno-interior";
  if (n.includes("relaciones exteriores")) return "rree";
  if (n.includes("constitucion")) return "constitucion";
  if (n.includes("educacion")) return "educacion";
  if (n.includes("hacienda")) return "hacienda";
  if (n.includes("defensa")) return "defensa";
  if (n.includes("obras publicas") || n.includes("transportes")) return "obras-publicas";
  if (n.includes("agricultura")) return "agricultura";
  if (n.includes("medio ambiente")) return "medio-ambiente";
  if (n.includes("salud")) return "salud";
  if (n.includes("trabajo")) return "trabajo-y-prevision";
  if (n.includes("mineria") || n.includes("energia")) return "mineria";
  if (n.includes("economia")) return "economia";
  if (n.includes("vivienda")) return "vivienda";
  if (n.includes("derechos humanos")) return "derechos-humanos";
  if (n.includes("familia")) return "familias";
  if (n.includes("futuro") || n.includes("ciencia") || n.includes("tecnologia")) return "ciencias";
  if (n.includes("pesca")) return "pesca";
  if (n.includes("deportes")) return "deportes";
  if (n.includes("zonas extremas") || n.includes("antartica")) return "zonas-extremas";
  if (n.includes("seguridad ciudadana")) return "seguridad";
  if (n.includes("cultura") || n.includes("artes")) return "cultura";
  if (n.includes("desarrollo social")) return "desarrollo-social";
  if (n.includes("recursos hidricos") || n.includes("desertificacion")) return "recursos-hidricos";
  if (n.includes("emergencia") || n.includes("bomberos")) return "emergencias";
  if (n.includes("mujeres") || n.includes("equidad de genero")) return "mujeres-genero";
  if (n.includes("personas mayores") || n.includes("discapacidad")) return "personas-mayores";
  if (n.includes("inteligencia")) return "inteligencia-estado";
  if (n.includes("revisora de cuentas")) return "revisora-cuentas";
  if (n.includes("etica")) return "etica";
  if (n.includes("regimen interno")) return "regimen-interno";
  return null;
}

/**
 * Estado de la última descarga de citaciones de la Cámara: "vivo" si se leyeron
 * de camara.cl, "respaldo" si se usaron los datos precargados (que pueden ser de
 * semanas anteriores). Desde 2026 camara.cl responde con un desafío anti-bots de
 * Cloudflare a las peticiones del servidor, por lo que suele quedar en "respaldo".
 */
export const estadoCitacionesCamara: { fuente: "vivo" | "respaldo"; detalle: string; actualizado: string } = {
  fuente: "respaldo",
  detalle: "Sin consultar todavía",
  actualizado: ""
};

function respaldoCamara(detalle: string) {
  estadoCitacionesCamara.fuente = "respaldo";
  estadoCitacionesCamara.detalle = detalle;
  estadoCitacionesCamara.actualizado = new Date().toISOString();
  return {
    porDia: CAMARA_CITACIONES_SEMANALES_POR_DIA,
    porComision: CAMARA_CITACIONES_POR_COMISION,
    todas: CAMARA_CITACIONES_FULL_WEEK
  };
}

/** Convierte el HTML de la página semanal de citaciones de camara.cl en datos. */
export function parsearCitacionesCamaraHtml(html: string): { porDia: any[]; porComision: Record<string, any[]>; todas: any[] } {
  const articleRegex = /<article class="grid-12 citaciones">([\s\S]*?)<\/article>/gi;
  let artMatch;
  const daysList: any[] = [];
  const porComision: Record<string, any[]> = {};
  const todas: any[] = [];
  let totalCount = 0;

  while ((artMatch = articleRegex.exec(html)) !== null) {
    const artContent = artMatch[1];
    const dateMatch = artContent.match(/<p class="fecha">([\s\S]*?)<\/p>/i);
    const fechaStr = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : 'Fecha no especificada';

    // La 4ª celda contiene una tabla interna (materia | invitados); se captura completa
    // para no cortar en el primer </td></tr> interno.
    const trRegex = /<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td colspan="2">\s*(<table[\s\S]*?<\/table>|[\s\S]*?)\s*<\/td>\s*<\/tr>/gi;
    let trMatch;
    const dayCitaciones: any[] = [];

    while ((trMatch = trRegex.exec(artContent)) !== null) {
      totalCount++;
      const rawComision = trMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const rawHora = trMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const rawLugar = trMatch[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const rawContent = trMatch[4];

      const subRows: { materia: string; invitados: string }[] = [];
      const subTrRegex = /<tr>\s*<td class="w40"[^>]*>([\s\S]*?)<\/td>\s*<td class="w30"[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
      let subMatch;
      while ((subMatch = subTrRegex.exec(rawContent)) !== null) {
        const mat = subMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
        const inv = subMatch[2].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
        subRows.push({ materia: mat, invitados: inv });
      }

      let materia = '';
      let invitados = '';
      if (subRows.length > 0) {
        materia = subRows.map((sr, idx) => subRows.length > 1 ? `[Parte ${idx+1}] ${sr.materia}` : sr.materia).join('\n\n');
        invitados = subRows.map(sr => sr.invitados).filter(Boolean).join('\n---\n');
      } else {
        materia = rawContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }

      const boletines = materia.match(/\b\d{4,5}-\d{2}\b|\b\d{1,2}\.\d{3}-\d{2}\b/g) || [];
      const slug = getCommissionSlugFromName(rawComision);

      const citObj = {
        id: `cit-live-${totalCount}`,
        fecha: fechaStr,
        comisionNombre: rawComision,
        comisionSlug: slug || undefined,
        citacionNumero: `Citación Oficial N° ${totalCount}`,
        hora: rawHora,
        lugar: rawLugar,
        tipo: rawComision.startsWith("CEI") ? "Comisión Especial Investigadora" : "Sesión de Comisión",
        materia,
        invitados: invitados || "No informado en la citación.",
        tabla: subRows.length > 0 ? subRows.map((sr, i) => `${i+1}. ${sr.materia.slice(0, 140)}...`) : [materia.slice(0, 140) + "..."],
        boletinesRelacionados: Array.from(new Set(boletines)),
        acuerdosCount: 0,
        completada: false
      };

      dayCitaciones.push(citObj);
      todas.push(citObj);

      if (slug) {
        if (!porComision[slug]) porComision[slug] = [];
        porComision[slug].push(citObj);
      }
    }

    daysList.push({
      fecha: fechaStr,
      totalCitaciones: dayCitaciones.length,
      citaciones: dayCitaciones
    });
  }
  return { porDia: daysList, porComision, todas };
}

// ---------------------------------------------------------------------------
// Citaciones importadas: camara.cl bloquea al servidor, pero se puede leer con
// un navegador normal. Una tarea programada abre la página en el navegador y
// envía su HTML a /api/camara/citaciones/importar. Se guardan en Firestore para
// que sobrevivan reinicios (y en Vercel, entre instancias).
// ---------------------------------------------------------------------------
const FS_PROYECTO = process.env.VITE_FIREBASE_PROJECT_ID || "legistrack-d75bc";
const FS_KEY = process.env.VITE_FIREBASE_API_KEY || "AIzaSyAZvd-S6AmPpV05UYEkRRULgDezD7mAkaE";
const FS_DOC = (id: string) => `https://firestore.googleapis.com/v1/projects/${FS_PROYECTO}/databases/(default)/documents/citaciones_camara/${id}?key=${FS_KEY}`;

interface SemanaImportada { semana: string; importadoEn: string; datos: { porDia: any[]; porComision: Record<string, any[]>; todas: any[] } }
let semanasImportadas: Record<string, SemanaImportada> | null = null;
let semanasLeidasEn = 0;

async function leerSemanasImportadas(): Promise<Record<string, SemanaImportada>> {
  if (semanasImportadas && Date.now() - semanasLeidasEn < 5 * 60 * 1000) return semanasImportadas;
  try {
    const r = await fetch(FS_DOC("actual"), { signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const d: any = await r.json();
      const txt = d?.fields?.payload?.stringValue;
      semanasImportadas = txt ? JSON.parse(txt) : {};
    } else if (r.status === 404) {
      semanasImportadas = {};
    }
    semanasLeidasEn = Date.now();
  } catch (err) {
    console.warn("No se pudieron leer las citaciones importadas de Firestore:", err);
  }
  return semanasImportadas || {};
}

async function guardarDocFirestore(id: string, campos: Record<string, string>): Promise<void> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(campos)) fields[k] = { stringValue: v };
  const r = await fetch(FS_DOC(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
    signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) throw new Error(`Firestore respondió HTTP ${r.status}: ${(await r.text().catch(() => "")).slice(0, 200)}`);
}

/** Recibe el HTML de una semana de citaciones leída con un navegador y la guarda. */
export async function importarCitacionesCamara(html: string, semana: string): Promise<{ semana: string; citaciones: number; dias: number }> {
  const datos = parsearCitacionesCamaraHtml(html);
  if (datos.todas.length === 0) throw new Error("El HTML recibido no contiene citaciones legibles.");
  const clave = /^\d{4}-\d{1,2}$/.test(semana) ? semana : new Date().toISOString().slice(0, 10);
  const registro: SemanaImportada = { semana: clave, importadoEn: new Date().toISOString(), datos };
  const actuales = { ...(await leerSemanasImportadas()) };
  actuales[clave] = registro;
  // Se conservan las 3 semanas más recientes.
  const claves = Object.keys(actuales).sort().slice(-3);
  const recortado: Record<string, SemanaImportada> = {};
  for (const k of claves) recortado[k] = actuales[k];
  await guardarDocFirestore(`semana_${clave}`, { semana: clave, importadoEn: registro.importadoEn, payload: JSON.stringify(registro) });
  await guardarDocFirestore("actual", { actualizado: registro.importadoEn, payload: JSON.stringify(recortado) });
  semanasImportadas = recortado;
  semanasLeidasEn = Date.now();
  cache.delete("camara_citaciones_semanales_live");
  return { semana: clave, citaciones: datos.todas.length, dias: datos.porDia.length };
}

/** Citaciones importadas recientes (últimos 10 días), unidas en orden cronológico. */
async function citacionesImportadasVigentes(): Promise<{ datos: { porDia: any[]; porComision: Record<string, any[]>; todas: any[] }; importadoEn: string } | null> {
  const semanas = Object.values(await leerSemanasImportadas())
    .filter(s => Date.now() - new Date(s.importadoEn).getTime() < 10 * 86400000)
    .sort((a, b) => a.semana.localeCompare(b.semana));
  if (semanas.length === 0) return null;
  const porDia: any[] = [];
  const todas: any[] = [];
  const porComision: Record<string, any[]> = {};
  for (const s of semanas) {
    porDia.push(...s.datos.porDia);
    for (const c of s.datos.todas) {
      const cit = { ...c, id: `cit-${s.semana}-${c.id}` };
      todas.push(cit);
      if (cit.comisionSlug) (porComision[cit.comisionSlug] ||= []).push(cit);
    }
  }
  const importadoEn = semanas.map(s => s.importadoEn).sort().slice(-1)[0];
  return { datos: { porDia, porComision, todas }, importadoEn };
}

/** Si camara.cl no responde al servidor, usa las citaciones importadas con navegador; si no hay, el respaldo. */
async function respaldoOImportadas(detalle: string) {
  const imp = await citacionesImportadasVigentes().catch(() => null);
  if (imp && imp.datos.todas.length > 0) {
    estadoCitacionesCamara.fuente = "vivo";
    estadoCitacionesCamara.detalle = `Leídas de camara.cl con navegador (última lectura: ${imp.importadoEn})`;
    estadoCitacionesCamara.actualizado = imp.importadoEn;
    return imp.datos;
  }
  return respaldoCamara(detalle);
}

export async function fetchCamaraCitacionesSemanalesLive(forceRefresh: boolean = false): Promise<{
  porDia: any[];
  porComision: Record<string, any[]>;
  todas: any[];
}> {
  const cacheKey = "camara_citaciones_semanales_live";
  if (forceRefresh) {
    cache.delete(cacheKey);
  }

  return cache.wrap(cacheKey, 15 * 60 * 1000, async () => {
    try {
      const response = await fetch("https://www.camara.cl/legislacion/comisiones/citaciones_semana.aspx", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        signal: AbortSignal.timeout(9000)
      });

      if (!response.ok) {
        return respaldoOImportadas(`camara.cl respondió HTTP ${response.status}`);
      }

      const html = await response.text();
      const { porDia: daysList, porComision, todas } = parsearCitacionesCamaraHtml(html);

      if (todas.length > 0) {
        estadoCitacionesCamara.fuente = "vivo";
        estadoCitacionesCamara.detalle = "Leídas de camara.cl";
        estadoCitacionesCamara.actualizado = new Date().toISOString();
        return {
          porDia: daysList,
          porComision,
          todas
        };
      }

      return respaldoOImportadas(
        /challenge|cf_chl|cloudflare/i.test(html)
          ? "camara.cl bloqueó la consulta del servidor (desafío anti-bots de Cloudflare)"
          : "La página de citaciones de camara.cl no trajo citaciones legibles"
      );
    } catch (err: any) {
      console.warn("Could not fetch live citaciones from Camara, using fallback:", err);
      return respaldoOImportadas(`Error de conexión con camara.cl: ${err?.message || err}`);
    }
  });
}

export async function fetchComisionesCamaraReal(): Promise<ComisionReal[]> {
  return cache.wrap<ComisionReal[]>("camara_comisiones_vigentes", 30 * 60 * 1000, async () => {
    try {
      const response = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_Vigentes", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) return [];
      const xml = await response.text();
      const blocks = xml.match(/<Comision>[\s\S]*?<\/Comision>/gi) || [];

      return blocks
        .map((block) => {
          const get = (tag: string) => {
            const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
            return m ? m[1].trim() : "";
          };
          const id = get("ID");
          const nombreRaw = get("Nombre");
          const tipo = get("Tipo") || "Permanente";
          if (!id || !nombreRaw) return null;

          const nombre = /^comisi[oó]n/i.test(nombreRaw) ? nombreRaw : `Comisión de ${nombreRaw}`;
          return {
            id: `cd-${id}`,
            nombre,
            descripcion: `Comisión ${tipo.toLowerCase()} de la Cámara de Diputadas y Diputados de Chile.`,
            senado: false
          } as ComisionReal;
        })
        .filter((c): c is ComisionReal => c !== null);
    } catch (error) {
      console.error("Error fetching real Cámara commissions:", error);
      return [];
    }
  });
}

// La búsqueda de videos y el análisis de sesiones en YouTube viven en
// ./youtubeService.ts y usan solo vías oficiales (YouTube Data API y Gemini).

// ============================================================================
// SESIONES REALES DE COMISIÓN (camara.cl) — citación, invitados, resultado
// efectivo, votaciones y asistencia real, tal como quedaron registrados por la
// Secretaría de la Cámara. Esto reemplaza el uso de contenido curado/inventado
// a mano para el Informe IA: en vez de "reconstruir" lo que probablemente se
// dijo, se usa lo que efectivamente ocurrió según el propio sitio oficial.
// ============================================================================

const CAMARA_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchCamaraHtml(path: string, ms = 9000): Promise<string | null> {
  try {
    const res = await fetch(`https://www.camara.cl/legislacion/comisiones/${path}`, {
      headers: { "User-Agent": CAMARA_UA, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8" },
      signal: AbortSignal.timeout(ms)
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.warn(`Could not fetch camara.cl path ${path}:`, err);
    return null;
  }
}

// Convierte una celda HTML (con <br/> como separador real de línea) en texto
// plano, preservando los saltos de línea en vez de colapsarlos a espacios --
// a diferencia de decodeHtmlEntities() de más arriba, pensada para subtítulos.
function celdaHtmlATexto(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface SesionRealCamara {
  numero: string;
  fecha: string;
  horaInicio: string;
  horaTermino: string;
  estado: string;
  sesionId: string;
  citada: boolean;
  celebrada: boolean;
  tieneResultado: boolean;
  tieneVotacion: boolean;
  actaDocId?: string;
  videoUrl?: string;
}

/**
 * Lista las sesiones reales de una comisión (Cámara) para un mes/año dado,
 * con el `sesionId` numérico interno que usan el resto de los endpoints.
 * prmIdTipo=2101 es el código fijo que usa camara.cl para "sesión de comisión".
 */
export async function fetchSesionesRealesCamara(comisionPrmId: string, mes?: number, anio?: number): Promise<SesionRealCamara[]> {
  const cacheKey = `camara_sesiones_reales_${comisionPrmId}_${mes || "cur"}_${anio || "cur"}`;
  return cache.wrap(cacheKey, 15 * 60 * 1000, async () => {
    const qs = new URLSearchParams({ prmID: comisionPrmId, prmIdTipo: "2101" });
    if (mes) qs.set("mes", String(mes).padStart(2, "0"));
    if (anio) qs.set("anio", String(anio));
    const html = await fetchCamaraHtml(`sesiones.aspx?${qs.toString()}`);
    if (!html) return [];

    const filas = html.match(/<tr>\s*<td><strong>[\s\S]*?<\/tr>/g) || [];
    const sesiones: SesionRealCamara[] = [];
    for (const fila of filas) {
      const numero = (fila.match(/<strong>(\d+)<\/strong>/) || [, ""])[1];
      const celdas = fila.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
      if (celdas.length < 5) continue;
      const fecha = celdaHtmlATexto(celdas[1]);
      const horaInicio = celdaHtmlATexto(celdas[2]);
      const horaTermino = celdaHtmlATexto(celdas[3]);
      const estado = celdaHtmlATexto(celdas[4]);
      const sesionIdMatch = fila.match(/prmIdSesion=(\d+)/);
      if (!sesionIdMatch) continue;
      const actaMatch = fila.match(/prmID=(\d+)&(?:amp;)?prmTipo=DOCUMENTO_COMISIONSESIONACTA/);
      const videoMatch = fila.match(/href="([^"]*Reproductor\.aspx\?prmCpeid=\d+&(?:amp;)?prmSesId=\d+)"[^>]*title="Ver Video"[^>]*style="display: block"/);
      sesiones.push({
        numero,
        fecha,
        horaInicio,
        horaTermino,
        estado,
        sesionId: sesionIdMatch[1],
        citada: estado.toLowerCase().includes("citada"),
        celebrada: estado.toLowerCase().includes("celebrada"),
        tieneResultado: fila.includes("resultado_detalle.aspx"),
        tieneVotacion: fila.includes("votaciones_sesion.aspx"),
        actaDocId: actaMatch ? actaMatch[1] : undefined,
        videoUrl: videoMatch ? `https://www.camara.cl/prensa/${videoMatch[1].replace(/^(\.\.\/)+/, "").replace(/^prensa\//, "")}` : undefined
      });
    }
    return sesiones;
  });
}

export interface PuntoTablaReal {
  horario: string;
  materia: string;
  boletines: string[];
  invitados: string;
  resultado: string;
}

export interface AsistenciaReal {
  asistentes: string[];
  reemplazos: string;
  otrosAsistentes: string;
}

export interface VotacionReal {
  boletin: string;
  materia: string;
  tipo: string;
  afirmativos: number;
  negativos: number;
  abstenciones: number;
}

export interface SesionComisionCompleta {
  puntos: PuntoTablaReal[];
  asistencia: AsistenciaReal;
  votaciones: VotacionReal[];
  boletinesVistos: string[];
}

// Extrae las filas <tr> de dos columnas (materia/citación | invitados o resultado)
// que comparten estructura tanto citacion_detalle.aspx como resultado_detalle.aspx.
function extraerFilasDosColumnas(html: string): { col1: string; col2: string }[] {
  const filas = html.match(/<tr>\s*<td style="width: 50%;">[\s\S]*?<\/tr>/g) || [];
  return filas.map(fila => {
    const celdas = fila.match(/<td style="width: 50%;">([\s\S]*?)<\/td>/g) || [];
    return {
      col1: celdas[0] ? celdaHtmlATexto(celdas[0].replace(/^<td[^>]*>/, "").replace(/<\/td>$/, "")) : "",
      col2: celdas[1] ? celdaHtmlATexto(celdas[1].replace(/^<td[^>]*>/, "").replace(/<\/td>$/, "")) : ""
    };
  });
}

const BOLETIN_REGEX = /\b\d{4,5}-\d{1,2}\b/g;

/**
 * Obtiene el contenido REAL de una sesión ya celebrada: por cada punto de la
 * tabla, qué se citó a tratar, quiénes fueron invitados, y qué resultado
 * efectivo tuvo (quién asistió/expuso realmente, qué se aprobó, etc.) — más la
 * asistencia y las votaciones reales. Esto es lo que debe alimentar el Informe
 * IA en vez de una reconstrucción "probable" de lo que se habría dicho.
 */
export async function fetchSesionComisionCompleta(comisionPrmId: string, sesionId: string): Promise<SesionComisionCompleta | null> {
  const cacheKey = `camara_sesion_completa_${comisionPrmId}_${sesionId}`;
  return cache.wrap(cacheKey, 60 * 60 * 1000, async () => {
    const [citacionHtml, resultadoHtml, votacionesHtml, asistenciaHtml] = await Promise.all([
      fetchCamaraHtml(`citacion_detalle.aspx?prmId=${comisionPrmId}&prmIdSesion=${sesionId}`),
      fetchCamaraHtml(`resultado_detalle.aspx?prmId=${comisionPrmId}&prmIdSesion=${sesionId}`),
      fetchCamaraHtml(`votaciones_sesion.aspx?prmId=${comisionPrmId}&prmIdSesion=${sesionId}`),
      fetchCamaraHtml(`asistencia.aspx?prmId=${comisionPrmId}&prmIdSesion=${sesionId}`)
    ]);

    if (!citacionHtml && !resultadoHtml) return null;

    const filasCitacion = citacionHtml ? extraerFilasDosColumnas(citacionHtml) : [];
    const filasResultado = resultadoHtml ? extraerFilasDosColumnas(resultadoHtml) : [];

    const puntos: PuntoTablaReal[] = filasCitacion.map((fc, idx) => {
      const [horarioLinea, ...restoMateria] = fc.col1.split("\n").filter(Boolean);
      const esHorario = /^De\s.*horas?:?$/i.test(horarioLinea || "");
      const horario = esHorario ? horarioLinea : "";
      const materia = (esHorario ? restoMateria.join(" ") : fc.col1).trim();
      const boletines = Array.from(new Set(materia.match(BOLETIN_REGEX) || []));
      const resultadoTexto = filasResultado[idx]?.col2 || "";
      return {
        horario,
        materia,
        boletines,
        invitados: fc.col2.replace(/^Para este efecto se encuentran invitados:\s*/i, "").trim(),
        resultado: resultadoTexto
      };
    });

    // Asistencia: viene embebida como texto dentro de la última columna de
    // resultado_detalle.aspx ("Diputados Asistentes: ...", "Reemplazos: ...",
    // "Otros Diputados asistentes: ..."), agregada de todos los puntos.
    const resultadoTextoCompleto = filasResultado.map(f => f.col2).join("\n\n");
    const asistentesMatch = resultadoTextoCompleto.match(/Diputados? Asistentes?:\s*([^\n]+)/i);
    const reemplazosMatch = resultadoTextoCompleto.match(/Reemplazos?:\s*([^\n]+)/i);
    const otrosMatch = resultadoTextoCompleto.match(/Otros? Diputados? asistentes?:\s*([^\n]+)/i);
    const asistencia: AsistenciaReal = {
      asistentes: asistentesMatch ? asistentesMatch[1].split(";").map(s => s.trim()).filter(Boolean) : [],
      reemplazos: reemplazosMatch ? reemplazosMatch[1].trim() : "",
      otrosAsistentes: otrosMatch ? otrosMatch[1].trim() : ""
    };
    void asistenciaHtml; // reservado por si en el futuro se necesita el detalle completo de asistencia.aspx

    const votaciones: VotacionReal[] = [];
    if (votacionesHtml) {
      const filasVot = votacionesHtml.match(/<tr>\s*<td align="center">\d{4,5}-\d{1,2}<\/td>[\s\S]*?<\/tr>/g) || [];
      for (const fila of filasVot) {
        const celdas = fila.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
        if (celdas.length < 6) continue;
        const clean = (c: string) => celdaHtmlATexto(c.replace(/^<td[^>]*>/, "").replace(/<\/td>$/, ""));
        votaciones.push({
          boletin: clean(celdas[0]),
          materia: clean(celdas[1]),
          tipo: clean(celdas[2]),
          afirmativos: parseInt(clean(celdas[3]), 10) || 0,
          negativos: parseInt(clean(celdas[4]), 10) || 0,
          abstenciones: parseInt(clean(celdas[5]), 10) || 0
        });
      }
    }

    const boletinesVistos = Array.from(new Set(puntos.flatMap(p => p.boletines)));

    return { puntos, asistencia, votaciones, boletinesVistos };
  });
}

export async function getTodasComisiones(): Promise<ComisionReal[]> {
  const camaraLive = await fetchComisionesCamaraReal();
  const byId = new Map<string, ComisionReal>();
  for (const c of DIPUTADOS_COMISIONES_REALES) byId.set(c.id, c);
  for (const c of SENADO_COMISIONES_REALES) byId.set(c.id, c);
  for (const c of camaraLive) byId.set(c.id, c);
  return Array.from(byId.values());
}

// ============================================================================
// Datos Abiertos oficiales de la Cámara (opendata.camara.cl, WSLegislativo).
// A diferencia de camara.cl (protegido por Cloudflare), esta API pública
// responde a servidores. Se usa para la ficha oficial del proyecto en la Cámara
// y sus votaciones reales (con el voto de cada diputado bajo demanda).
// ============================================================================
const OPENDATA_WS = "https://opendata.camara.cl/camaradiputados/WServices";

function xmlTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
}
function xmlBloques(xml: string, tag: string): string[] {
  return xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?</${tag}>`, "gi")) || [];
}
async function opendataGet(path: string): Promise<string> {
  const res = await fetch(`${OPENDATA_WS}/${path}`, {
    headers: { "User-Agent": "LegisTrackCL/1.0 (datos abiertos)" },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`opendata.camara.cl HTTP ${res.status}`);
  return res.text();
}

export interface VotacionCamaraOficial {
  id: string;
  fecha: string;
  descripcion: string;
  si: number;
  no: number;
  abstencion: number;
  dispensado: number;
  quorum: string;
  resultado: string;
  tipo: string;
  tramite: string;
}

export interface ProyectoCamaraOficial {
  disponible: boolean;
  motivo?: string;
  proyecto?: {
    id: string;
    boletin: string;
    nombre: string;
    fechaIngreso: string;
    iniciativa: string;
    camaraOrigen: string;
    ministerios: string[];
    autores: string[];
  };
  votaciones: VotacionCamaraOficial[];
  fuente: string;
}

/** Ficha oficial del proyecto en la Cámara y sus votaciones (datos abiertos). */
export async function fetchCamaraProyectoOficial(boletinRaw: string): Promise<ProyectoCamaraOficial> {
  const m = String(boletinRaw).replace(/\./g, "").match(/(\d{3,6})-(\d{1,2})/);
  const fuente = "Datos Abiertos de la Cámara de Diputadas y Diputados (opendata.camara.cl)";
  if (!m) return { disponible: false, motivo: "Número de boletín no válido", votaciones: [], fuente };
  const boletin = `${m[1]}-${m[2].padStart(2, "0")}`;

  return cache.wrap(`camara_opendata_proyecto_${boletin}`, 30 * 60 * 1000, async () => {
    try {
      const [xmlProy, xmlVot] = await Promise.all([
        opendataGet(`WSLegislativo.asmx/retornarProyectoLey?prmNumeroBoletin=${boletin}`),
        opendataGet(`WSLegislativo.asmx/retornarVotacionesXProyectoLey?prmNumeroBoletin=${boletin}`).catch(() => "")
      ]);

      const vacio = /xsi:nil="true"\s*\/?>\s*$/.test(xmlProy.trim()) || !xmlTag(xmlProy, "NumeroBoletin");
      const proyecto = vacio ? undefined : {
        id: xmlTag(xmlProy, "Id"),
        boletin: xmlTag(xmlProy, "NumeroBoletin"),
        nombre: xmlTag(xmlProy, "Nombre"),
        fechaIngreso: xmlTag(xmlProy, "FechaIngreso").slice(0, 10),
        iniciativa: xmlTag(xmlProy, "TipoIniciativa"),
        camaraOrigen: xmlTag(xmlProy, "CamaraOrigen"),
        ministerios: xmlBloques(xmlProy, "Ministerio").map(b => xmlTag(b, "Nombre")).filter(Boolean),
        autores: xmlBloques(xmlProy, "ParlamentarioAutor").map(b => {
          const esSenador = /<Senador/i.test(b);
          const nombre = [xmlTag(b, "Nombre"), xmlTag(b, "ApellidoPaterno"), xmlTag(b, "ApellidoMaterno")].filter(Boolean).join(" ");
          return nombre ? `${nombre}${esSenador ? " (senador/a)" : " (diputado/a)"}` : "";
        }).filter(Boolean)
      };

      // Votaciones: primero el servicio por proyecto; si no trae ninguna, se buscan en
      // las votaciones del año (servicio verificado con datos al día) las que citan
      // este boletín en su descripción.
      // Etiqueta real del servicio por proyecto: <VotacionProyectoLey> (verificado).
      let bloquesVot = xmlBloques(xmlVot, "VotacionProyectoLey");
      if (bloquesVot.length === 0) {
        const anioActual = new Date().getFullYear();
        const digitos = m[1];
        for (const anio of [anioActual, anioActual - 1]) {
          try {
            const xmlAnio = await cache.wrap(`camara_opendata_votaciones_${anio}`, 30 * 60 * 1000, () =>
              opendataGet(`WSLegislativo.asmx/retornarVotacionesXAnno?prmAnno=${anio}`)
            );
            bloquesVot.push(...xmlBloques(xmlAnio, "Votacion").filter(b => {
              const d = xmlTag(b, "Descripcion").replace(/\./g, "");
              return new RegExp(`\\b${digitos}-\\d{1,2}\\b`).test(d);
            }));
          } catch { /* año sin datos */ }
        }
      }

      const votaciones: VotacionCamaraOficial[] = bloquesVot.map(b => ({
        id: xmlTag(b, "Id"),
        fecha: xmlTag(b, "Fecha"),
        descripcion: xmlTag(b, "Articulo") || xmlTag(b, "Descripcion") || "Votación",
        si: parseInt(xmlTag(b, "TotalSi")) || 0,
        no: parseInt(xmlTag(b, "TotalNo")) || 0,
        abstencion: parseInt(xmlTag(b, "TotalAbstencion")) || 0,
        dispensado: parseInt(xmlTag(b, "TotalDispensado")) || 0,
        quorum: xmlTag(b, "Quorum"),
        resultado: xmlTag(b, "Resultado") || "Resultado no informado",
        tipo: xmlTag(b, "TipoVotacionProyectoLey") || xmlTag(b, "Tipo"),
        tramite: [xmlTag(b, "TramiteConstitucional"), xmlTag(b, "TramiteReglamentario")].filter(Boolean).join(" · ")
      })).filter(v => v.id);

      votaciones.sort((a, b) => b.fecha.localeCompare(a.fecha));

      if (!proyecto && votaciones.length === 0) {
        return { disponible: false, motivo: "La Cámara no registra este boletín en sus datos abiertos", votaciones: [], fuente };
      }
      return { disponible: true, proyecto, votaciones, fuente };
    } catch (err: any) {
      return { disponible: false, motivo: `No se pudo consultar la API de la Cámara: ${err?.message || err}`, votaciones: [], fuente };
    }
  });
}

export interface VotoDiputado {
  nombre: string;
  opcion: string;
}

/** Detalle nominal de una votación: cómo votó cada diputado. */
export async function fetchCamaraVotacionDetalle(votacionId: string): Promise<{ disponible: boolean; motivo?: string; votos: VotoDiputado[] }> {
  const id = String(votacionId).replace(/[^0-9]/g, "");
  if (!id) return { disponible: false, motivo: "Id de votación no válido", votos: [] };
  return cache.wrap(`camara_opendata_votacion_${id}`, 6 * 60 * 60 * 1000, async () => {
    try {
      const xml = await opendataGet(`WSLegislativo.asmx/retornarVotacionDetalle?prmVotacionId=${id}`);
      const votos = xmlBloques(xml, "Voto").map(b => {
        const dip = xmlBloques(b, "Diputado")[0] || b;
        const nombre = [xmlTag(dip, "Nombre"), xmlTag(dip, "ApellidoPaterno"), xmlTag(dip, "ApellidoMaterno")]
          .filter(Boolean).join(" ");
        return { nombre, opcion: xmlTag(b, "OpcionVoto") || xmlTag(b, "Opcion") || "No informado" };
      }).filter(v => v.nombre);
      if (votos.length === 0) return { disponible: false, motivo: "La API no trae el detalle nominal de esta votación", votos: [] };
      votos.sort((a, b) => a.opcion.localeCompare(b.opcion) || a.nombre.localeCompare(b.nombre));
      return { disponible: true, votos };
    } catch (err: any) {
      return { disponible: false, motivo: `No se pudo consultar la API de la Cámara: ${err?.message || err}`, votos: [] };
    }
  });
}
