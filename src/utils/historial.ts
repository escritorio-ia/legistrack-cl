/**
 * Historial del proyecto ("anamnesis legislativa"): tipos compartidos y cálculos puros
 * (tiempo de discusión desde las transcripciones, agrupación por comisión).
 */
export interface ExpositorHistorial { orador: string; cargo: string; institucion: string; categoria: string; fechas: string[]; planteo: string; videoId?: string; segundos?: number }
export interface EstadisticaComision {
  sesionesCitadas: number;          // sesiones realizadas con el boletín en tabla (registro oficial)
  sesionesConInforme: number;       // de ellas, con informe de sesión (transcripción)
  sesionesSinTratar: number;        // el registro dice que no alcanzó a tratarse
  diasEnComision: number | null;
  minutosDiscusion: number | null;  // aprox., solo de sesiones transcritas
  minutosPorCategoria: Record<string, number>;
  oradores: { nombre: string; categoria: string; minutos: number; intervenciones: number }[];
  minutosPorSesion: { fecha: string; minutos: number }[];
}
export interface ComisionHistorial {
  clave: string;
  nombre: string;
  camara: string;
  desde: string | null;
  hasta: string | null;
  programadas: string[];
  expositores: ExpositorHistorial[];
  parlamentarios: { orador: string; fechas: string[] }[];
  acuerdos: { texto: string; fecha: string; fuente: string; videoId?: string; segundos?: number | null }[];
  votaciones: { texto: string; resultado: string; fecha: string; fuente: string; videoId?: string; segundos?: number | null }[];
  compromisos: { texto: string; responsable: string; fecha: string; videoId?: string; segundos?: number }[];
  pendientes: string[];
  informeOficial: { titulo: string; url: string; fecha?: string } | null;
  /** Actas oficiales de sesión (Cámara) disponibles para esta comisión. */
  actas?: { fecha: string; numero: string; url: string }[];
  sesiones: { fecha: string; videoId?: string; estado?: string; sintesis?: string }[];
  estadistica: EstadisticaComision;
  // Síntesis con IA (validada contra las fechas de las sesiones):
  temas?: { id?: string; tema: string; detalle: string; fechas: string[]; estado: string; actores?: string[]; actoresIds?: string[]; votacionesRel?: string[] }[];
  posiciones?: { actor: string; postura: string; fecha: string }[];
  contrapuntos?: { tema: string; aFavor: string[]; enContra: string[]; fecha: string }[];
  cierre?: { recibio: string; despacho: string; cambios: string; pendientes: string[] } | null;
}
export interface HistorialProyecto {
  disponible: boolean;
  motivo?: string;
  boletin: string;
  firma?: string;
  generado?: string;
  comisiones: ComisionHistorial[];
  sala: { fecha: string; camara: string; numero: string; detalle: string }[];
  hilo?: { tema: string; pasos: { comision: string; fecha: string; estado: string }[] }[];
  /** Objetivo del proyecto según el informe oficial de comisión (para el motivo de ingreso si no se leyó el mensaje o moción). */
  objetivoOficial?: string;
  /** Personas unificadas entre fuentes, con su historial de cargos e intervenciones en este proyecto. */
  personas?: import("./personas").Persona[];
  sintesisIA?: { disponible: boolean; motivo?: string; modelo?: string };
}

export const SEG_MAX_INTERVENCION = 600;

/**
 * Minutos de habla por orador dentro de una ventana de la transcripción (el punto de la tabla del boletín).
 * Cada segmento dura hasta el siguiente, con un tope de 10 minutos (evita sumar recesos).
 */
export function tiempoEnVentana(segmentos: { segundos: number; orador: string }[], ini: number, fin: number):
  { total: number; porOrador: Map<string, { nombre: string; segundos: number; intervenciones: number }> } {
  const segs = [...segmentos].sort((a, b) => a.segundos - b.segundos);
  const porOrador = new Map<string, { nombre: string; segundos: number; intervenciones: number }>();
  let total = 0;
  segs.forEach((g, i) => {
    if (g.segundos < ini || g.segundos >= fin) return;
    const sig = segs[i + 1]?.segundos ?? g.segundos;
    const dur = Math.max(0, Math.min(SEG_MAX_INTERVENCION, Math.min(sig, fin) - g.segundos));
    total += dur;
    const nombre = String(g.orador || "Orador no identificado").trim();
    const k = nombre.toLowerCase();
    const e = porOrador.get(k) || { nombre, segundos: 0, intervenciones: 0 };
    e.segundos += dur;
    if (!segs[i - 1] || String(segs[i - 1].orador).trim().toLowerCase() !== k) e.intervenciones++;
    porOrador.set(k, e);
  });
  return { total, porOrador };
}

export const normComision = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/\b(comision|comisiones|permanente|especial|de|del|la|las|el|los|y|e|senado|camara|diputados|diputadas)\b/g, " ")
  .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
