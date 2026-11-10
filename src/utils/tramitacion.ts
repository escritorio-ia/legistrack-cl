/**
 * Lógica de tramitación basada SOLO en datos oficiales de la ficha (etapa, estado, hitos y sus fechas).
 * Funciones puras, sin red. Si la ficha no permite determinar algo, se devuelve null: no se adivina.
 */

export interface HitoTramite {
  fecha: string;
  titulo?: string;
  descripcion?: string;
}

const crearFecha = (y: number, mo: number, d: number): Date | null => {
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : null;
};

/**
 * Convierte una fecha de la ficha a Date (medianoche local). Acepta "dd/mm/aaaa" (formato de la ficha del Senado) y
 * "aaaa-mm-dd". NO usa new Date(texto): ese constructor lee "05/11/2026" como 11 de mayo y rechaza "13/05/2026".
 * Devuelve null si el texto no es una fecha válida.
 */
export function parseFechaFlexible(s?: string | null): Date | null {
  if (!s) return null;
  const t = String(s).trim();
  let m = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?!\d)/);
  if (m) return crearFecha(+m[3], +m[2], +m[1]);
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return crearFecha(+m[1], +m[2], +m[3]);
  return null;
}

/** Días completos entre dos fechas de la ficha; undefined si alguna no es una fecha válida. Nunca negativo. */
export function diasEntre(desde?: string | null, hasta?: string | null): number | undefined {
  const a = parseFechaFlexible(desde);
  const b = parseFechaFlexible(hasta);
  if (!a || !b) return undefined;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export const TRAMITE_PATTERNS: { key: "primer" | "segundo" | "tercer" | "mixta" | "finalizacion"; label: string; re: RegExp }[] = [
  { key: "primer", label: "Primer Trámite Constitucional", re: /primer\s+tr[aá]mite/i },
  { key: "segundo", label: "Segundo Trámite Constitucional", re: /segundo\s+tr[aá]mite/i },
  { key: "tercer", label: "Tercer Trámite Constitucional", re: /tercer\s+tr[aá]mite/i },
  { key: "mixta", label: "Comisión Mixta", re: /comisi[oó]n\s+mixta/i },
  { key: "finalizacion", label: "Trámite de Finalización", re: /tribunal\s+constitucional|tr[aá]mite\s+finalizaci[oó]n|control\s+de\s+constitucionalidad/i },
];

export function detectTramite(text: string) {
  return TRAMITE_PATTERNS.find((t) => t.re.test(text)) || null;
}

export interface EtapaPipeline {
  /** 1 Ingreso · 2 Primer trámite · 3 Segundo o tercer trámite · 4 Comisión Mixta / TC · 5 Ley. null = la ficha no la informa. */
  actual: 1 | 2 | 3 | 4 | 5 | null;
  enTercer: boolean;
  /** La ficha dice que la tramitación terminó (puede ser ley, rechazo, archivo o retiro: no se asume que sea ley). */
  terminada: boolean;
  /** De dónde sale: la etapa informada en la ficha, el último hito con trámite identificable, o ninguna. */
  fuente: "ficha" | "hitos" | "no_informada";
}

const PUBLICADA = /publicad|promulgad|\bley\s*n|diario oficial/;
const TERMINADA = /tramitaci[oó]n terminada|archivad|retirad|rechazad|desestimad/;
const PASO4 = /comisi[oó]n\s+mixta|tribunal\s+constitucional|veto|observaciones\s+del\s+presidente|control\s+de\s+constitucionalidad|tr[aá]mite\s+finalizaci[oó]n/;
const PASO_TERCER = /tercer\s+tr[aá]mite|3\s*[º°o]?\s*(er)?\s*tr[aá]mite/;
const PASO_SEGUNDO = /segundo\s+tr[aá]mite|2\s*[º°o]?\s*(do)?\s*tr[aá]mite/;
const PASO_PRIMER = /primer\s+tr[aá]mite|1\s*[º°o]?\s*(er)?\s*tr[aá]mite/;

export function etapaActual(p: { etapa?: string; subetapa?: string; estado?: string; timeline?: HitoTramite[] }): EtapaPipeline {
  const texto = `${p.etapa || ""} ${p.subetapa || ""} ${p.estado || ""}`.toLowerCase();
  const terminada = TERMINADA.test(texto) || PUBLICADA.test(texto);
  if (PUBLICADA.test(texto)) return { actual: 5, enTercer: false, terminada: true, fuente: "ficha" };
  // Solo se aceptan expresiones completas ("segundo trámite"): un "segundo informe de comisión" ocurre dentro del primer trámite.
  if (PASO4.test(texto)) return { actual: 4, enTercer: false, terminada, fuente: "ficha" };
  if (PASO_TERCER.test(texto)) return { actual: 3, enTercer: true, terminada, fuente: "ficha" };
  if (PASO_SEGUNDO.test(texto)) return { actual: 3, enTercer: false, terminada, fuente: "ficha" };
  if (PASO_PRIMER.test(texto)) return { actual: 2, enTercer: false, terminada, fuente: "ficha" };

  // La ficha no informa la etapa de forma reconocible: se usa el último hito (por fecha) que nombre un trámite.
  const conFecha = (p.timeline || [])
    .map((h, i) => ({ h, i, f: parseFechaFlexible(h.fecha) }))
    .filter((x) => x.f)
    .sort((a, b) => a.f!.getTime() - b.f!.getTime() || a.i - b.i);
  for (let k = conFecha.length - 1; k >= 0; k--) {
    const t = detectTramite(`${conFecha[k].h.titulo || ""} ${conFecha[k].h.descripcion || ""}`);
    if (!t) continue;
    if (t.key === "primer") return { actual: 2, enTercer: false, terminada, fuente: "hitos" };
    if (t.key === "segundo") return { actual: 3, enTercer: false, terminada, fuente: "hitos" };
    if (t.key === "tercer") return { actual: 3, enTercer: true, terminada, fuente: "hitos" };
    return { actual: 4, enTercer: false, terminada, fuente: "hitos" };
  }
  return { actual: null, enTercer: false, terminada, fuente: "no_informada" };
}

export interface UltimoMovimiento {
  fecha: Date;
  fechaTexto: string;
  titulo: string;
  descripcion: string;
  /** Días entre el último hito y hoy. */
  dias: number;
}

/** El hito más reciente por fecha real (no por posición en la lista). null si ningún hito tiene fecha válida. */
export function ultimoMovimiento(timeline: HitoTramite[] | undefined, hoy: Date = new Date()): UltimoMovimiento | null {
  let mejor: { h: HitoTramite; f: Date; i: number } | null = null;
  (timeline || []).forEach((h, i) => {
    const f = parseFechaFlexible(h.fecha);
    if (!f) return;
    if (!mejor || f.getTime() > mejor.f.getTime() || (f.getTime() === mejor.f.getTime() && i > mejor.i)) mejor = { h, f, i };
  });
  if (!mejor) return null;
  const m = mejor as { h: HitoTramite; f: Date; i: number };
  return {
    fecha: m.f,
    fechaTexto: m.h.fecha,
    titulo: (m.h.titulo || "").trim(),
    descripcion: (m.h.descripcion || "").trim(),
    dias: Math.max(0, Math.round((hoy.getTime() - m.f.getTime()) / 86400000)),
  };
}
