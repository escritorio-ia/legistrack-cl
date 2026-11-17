/**
 * Sala de sesiones (Cámara y Senado): lectura de las fuentes oficiales, todo relacionado con boletines.
 *  - Senado: tabla semanal de la Sala (web-back.senado.cl/api/weekly_table, la misma que usa senado.cl).
 *  - Cámara: sesiones de Sala (opendata WSSala), votaciones de Sala (opendata WSLegislativo) y asistencia.
 * Funciones puras: sin red. No se inventa nada; lo que falta queda vacío.
 */
import { normalizarBoletin } from "./boletines";

export interface PuntoTablaSala {
  posicion: number;
  boletin: string;      // normalizado ("18860-15") o "" si el punto no es un proyecto con boletín
  materia: string;
  parte: string;        // "ORDEN DEL DÍA", "FÁCIL DESPACHO", ...
  quorum: string;       // encabezado oficial ("Mayoría Simple", "Quórum Calificado", ...)
  enlace: string;       // ficha oficial en tramitacion.senado.cl
}

export interface VotacionSala {
  id: string;
  fecha: string;        // ISO con hora
  descripcion: string;
  boletin: string;      // "" si la descripción no cita un boletín
  si: number;
  no: number;
  abstencion: number;
  quorum: string;
  resultado: string;
  tipo: string;
}

export interface SesionSala {
  id: string;           // "sr-<ID_SESION>" (Senado) o "cd-<Id>" (Cámara)
  camara: "Cámara" | "Senado";
  numero: string;
  fecha: string;        // AAAA-MM-DD
  horaInicio: string;   // "HH:MM" o ""
  horaTermino: string;
  tipo: string;         // Ordinaria / Especial
  estado: string;       // Cámara: "Celebrada" / "Citada"; Senado: "" (la tabla no lo informa)
  puntos: PuntoTablaSala[];
  votaciones: VotacionSala[];
  asistencia?: { asisten: number; total: number };
  boletines: string[];
}

const MESES: Record<string, number> = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
const dos = (n: number | string) => String(n).padStart(2, "0");

/** "Lunes 16 de Noviembre de 2026" -> "2026-11-16" ("" si no se puede leer). */
export function fechaLargaAISO(texto: string): string {
  const m = String(texto || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/);
  return m && MESES[m[2]] ? `${m[3]}-${dos(MESES[m[2]])}-${dos(m[1])}` : "";
}

const hhmm = (s: any) => { const m = String(s || "").match(/(\d{1,2}):(\d{2})/); return m ? `${dos(m[1])}:${m[2]}` : ""; };
const limpio = (s: any) => String(s ?? "").replace(/\s+/g, " ").trim();
const unicos = (xs: string[]) => Array.from(new Set(xs.filter(Boolean)));

/** Boletín citado expresamente como tal ("Boletín N° 18885-05", "Bol. N° 18.860-15"). */
export function boletinDeDescripcion(texto: string): string {
  const m = String(texto || "").match(/bol(?:et[ií]n|\.)?\s*(?:n[°º.]*\s*)?(\d{1,2}\.?\d{3}-\d{1,2})/i);
  return m ? normalizarBoletin(m[1]) : "";
}

/** Respuesta de web-back.senado.cl/api/weekly_table -> sesiones de Sala del Senado con su tabla. */
export function parsearTablaSenado(raw: any): SesionSala[] {
  const data: any[] = Array.isArray(raw?.data) ? raw.data : [];
  return data.map((s) => {
    const puntos: PuntoTablaSala[] = (Array.isArray(s.TABLA) ? s.TABLA : []).map((p: any, i: number) => ({
      posicion: Number(p.POSICION) || i + 1,
      boletin: normalizarBoletin(limpio(p.BOLETIN)).includes("-") ? normalizarBoletin(limpio(p.BOLETIN)) : boletinDeDescripcion(p.MATERIA),
      materia: limpio(p.MATERIA),
      parte: limpio(p.PARTE_SESION),
      quorum: limpio(p.ENCABEZADO || p.QUORUM),
      enlace: /^https:\/\/tramitacion\.senado\.cl\//.test(String(p.LINK_PROYECTO || "")) ? String(p.LINK_PROYECTO) : "",
    })).sort((a: PuntoTablaSala, b: PuntoTablaSala) => a.posicion - b.posicion);
    return {
      id: `sr-${limpio(s.ID_SESION)}`,
      camara: "Senado" as const,
      numero: limpio(s.NUMERO_SESION),
      fecha: fechaLargaAISO(s.FECHA),
      horaInicio: hhmm(s.HORA_INICIO),
      horaTermino: hhmm(s.HORA_TERMINO),
      tipo: limpio(s.TIPO_SESION),
      estado: "",
      puntos,
      votaciones: [],
      boletines: unicos(puntos.map((p) => p.boletin)),
    };
  }).filter((s) => s.id !== "sr-" && s.fecha);
}

function xmlTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
}
function xmlBloques(xml: string, tag: string): string[] {
  return xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?</${tag}>`, "gi")) || [];
}

/** opendata WSSala retornarSesionesXAnno -> sesiones de Sala de la Cámara (sin votaciones aún). */
export function parsearSesionesCamara(xml: string): SesionSala[] {
  return xmlBloques(xml, "Sesion").map((b) => {
    const ini = xmlTag(b, "FechaInicio"), fin = xmlTag(b, "FechaTermino");
    return {
      id: `cd-${xmlTag(b, "Id")}`,
      camara: "Cámara" as const,
      numero: xmlTag(b, "Numero"),
      fecha: ini.slice(0, 10),
      horaInicio: hhmm(ini.slice(11)),
      horaTermino: hhmm(fin.slice(11)),
      tipo: xmlTag(b, "Tipo"),
      estado: xmlTag(b, "Estado"),
      puntos: [],
      votaciones: [],
      boletines: [],
      _ini: ini, _fin: fin,
    } as SesionSala & { _ini: string; _fin: string };
  }).filter((s) => s.id !== "cd-" && /^\d{4}-\d{2}-\d{2}$/.test(s.fecha));
}

/** opendata WSLegislativo retornarVotacionesXAnno -> votaciones de Sala. */
export function parsearVotacionesCamara(xml: string): VotacionSala[] {
  return xmlBloques(xml, "Votacion").map((b) => {
    const descripcion = xmlTag(b, "Descripcion");
    return {
      id: xmlTag(b, "Id"),
      fecha: xmlTag(b, "Fecha"),
      descripcion,
      boletin: boletinDeDescripcion(descripcion),
      si: parseInt(xmlTag(b, "TotalSi")) || 0,
      no: parseInt(xmlTag(b, "TotalNo")) || 0,
      abstencion: parseInt(xmlTag(b, "TotalAbstencion")) || 0,
      quorum: xmlTag(b, "Quorum"),
      resultado: xmlTag(b, "Resultado"),
      tipo: xmlTag(b, "Tipo"),
    };
  }).filter((v) => v.id && v.fecha);
}

/** opendata WSSala retornarSesionAsistencia -> diputados que asisten / total de la lista oficial. */
export function contarAsistencia(xml: string): { asisten: number; total: number } | undefined {
  const filas = xmlBloques(xml, "Asistencia");
  if (filas.length === 0) return undefined;
  return { asisten: filas.filter((f) => /<TipoAsistencia[^>]*Valor="1"/i.test(f)).length, total: filas.length };
}

/**
 * Asigna cada votación a la sesión de Sala en cuyo horario oficial ocurrió (con 1 h de holgura antes y
 * 3 h después del término, porque las sesiones se prorrogan). Votación sin sesión que calce: queda fuera.
 */
export function asignarVotaciones(sesiones: (SesionSala & { _ini?: string; _fin?: string })[], votaciones: VotacionSala[]): SesionSala[] {
  const t = (s: string) => new Date(s.length <= 10 ? `${s}T00:00:00` : s).getTime();
  return sesiones.map((s) => {
    const ini = t(s._ini || s.fecha) - 3600_000;
    const fin = t(s._fin || s._ini || s.fecha) + 3 * 3600_000;
    const propias = votaciones.filter((v) => { const x = t(v.fecha); return x >= ini && x <= fin; })
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    const { _ini, _fin, ...resto } = s as any;
    return { ...resto, votaciones: propias, boletines: unicos([...s.boletines, ...propias.map((v) => v.boletin)]) };
  });
}

/** Votaciones de una sesión agrupadas por boletín (en el orden en que se votaron). */
export function votacionesPorBoletin(votaciones: VotacionSala[]): { boletin: string; votaciones: VotacionSala[] }[] {
  const grupos = new Map<string, VotacionSala[]>();
  for (const v of votaciones) {
    const k = v.boletin || `sin:${v.descripcion}`;
    grupos.set(k, [...(grupos.get(k) || []), v]);
  }
  return Array.from(grupos.entries()).map(([k, vs]) => ({ boletin: k.startsWith("sin:") ? "" : k, votaciones: vs }));
}

/** Ubicación de la sesión respecto de hoy (solo por fecha; no afirma que esté transmitiéndose). */
export function momentoSesion(fecha: string, hoyISO: string): "hoy" | "proxima" | "pasada" {
  return fecha === hoyISO ? "hoy" : fecha > hoyISO ? "proxima" : "pasada";
}
