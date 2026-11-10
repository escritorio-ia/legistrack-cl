/**
 * Resumen de una sesión de comisión de la Cámara armado SOLO con lo que ya trae la sesión desde las fuentes
 * oficiales (citación y resultado publicados en camara.cl, y el video del canal oficial). No usa IA ni completa
 * nada: lo que no viene queda en null / [] y la interfaz lo muestra como "No informado".
 */
export interface SesionCamaraBase {
  fecha?: string; hora?: string; lugar?: string; tipo?: string; materia?: string; invitados?: string;
  tabla?: string[]; actaTexto?: string; videoUrl?: string; duracionVideo?: string; fuente?: string;
}

export interface ResumenSesionCamara {
  fecha: string | null; hora: string | null; lugar: string | null; tipo: string | null;
  puntos: string[];
  boletines: string[];
  invitados: string | null;
  /** Texto del resultado oficial, sin las líneas de asistencia (que van aparte). */
  resultado: string | null;
  asistentes: string[];
  reemplazos: string | null;
  otrosAsistentes: string | null;
  videoUrl: string | null; duracionVideo: string | null;
  fuente: string | null;
  estadisticas: { puntos: number; boletines: number; asistentes: number; conResultado: boolean; conVideo: boolean };
}

const limpio = (s?: string | null): string | null => {
  const t = String(s ?? "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return !t || /^(no informad[oa]|null|undefined)\b/i.test(t) || /^materia no informada/i.test(t) ? null : t;
};
const BOLETIN = /\b\d{4,5}-\d{1,2}\b/g;
const RE_ASISTENTES = /Diputad[oa]s?(?:\s+y\s+Diputad[oa]s?)?\s+Asistentes?:\s*([^\n]+)/i;
const RE_REEMPLAZOS = /Reemplazos?:\s*([^\n]+)/i;
const RE_OTROS = /Otr[oa]s?\s+Diputad[oa]s?(?:\s+y\s+Diputad[oa]s?)?\s+asistentes?:\s*([^\n]+)/i;

export function construirResumenSesionCamara(s: SesionCamaraBase): ResumenSesionCamara {
  const acta = limpio(s.actaTexto);
  const materia = limpio(s.materia);
  const tabla = (s.tabla || []).map((t) => limpio(t)).filter((t): t is string => !!t);
  const puntos = tabla.length ? tabla : materia ? [materia] : [];
  const otros = acta?.match(RE_OTROS)?.[1]?.trim() || null;
  // Se quita primero "Otros diputados asistentes" para que no se confunda con la lista de asistentes.
  const sinOtros = acta ? acta.replace(RE_OTROS, "") : "";
  // Solo se separa por ';' (formato de camara.cl). Si la lista viene con otro separador queda como un solo texto.
  const asistentes = (sinOtros.match(RE_ASISTENTES)?.[1] || "").split(";").map((x) => x.replace(/\.$/, "").trim()).filter(Boolean);
  const reemplazos = acta?.match(RE_REEMPLAZOS)?.[1]?.trim() || null;
  const resultado = acta ? limpio(sinOtros.replace(RE_ASISTENTES, "").replace(RE_REEMPLAZOS, "")) : null;
  const boletines = Array.from(new Set(`${puntos.join(" ")} ${acta || ""}`.match(BOLETIN) || []));
  return {
    fecha: limpio(s.fecha), hora: limpio(s.hora), lugar: limpio(s.lugar), tipo: limpio(s.tipo),
    puntos, boletines, invitados: limpio(s.invitados), resultado, asistentes, reemplazos, otrosAsistentes: otros,
    videoUrl: limpio(s.videoUrl), duracionVideo: limpio(s.duracionVideo), fuente: limpio(s.fuente),
    estadisticas: { puntos: puntos.length, boletines: boletines.length, asistentes: asistentes.length, conResultado: !!resultado, conVideo: !!limpio(s.videoUrl) },
  };
}
