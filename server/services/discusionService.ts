/**
 * Discusión de un proyecto según sus informes de comisión oficiales (tramitacion.senado.cl).
 * No usa IA: ubica las secciones del propio informe ("ASPECTOS CENTRALES DEL DEBATE", "DISCUSIÓN EN GENERAL",
 * "DISCUSIÓN EN PARTICULAR", "VOTACIÓN…") y entrega el texto tal como está publicado, por tramos.
 */
import { cache } from "./cacheService";
import { fetchProyectoFromSenado, fetchTextoInformeDocx } from "./senadoService";

export interface SeccionInforme {
  titulo: string;
  /** Posición del texto de la sección dentro del documento (después del título). */
  inicio: number;
  largo: number;
  esDebate: boolean;
  /** Primer tramo del texto, solo para las secciones de debate. */
  extracto?: string;
}

export interface DiscusionInforme {
  titulo: string;
  fecha?: string;
  url: string;
  disponible: boolean;
  motivo?: string;
  totalCaracteres?: number;
  secciones: SeccionInforme[];
}

export interface DiscusionProyecto {
  disponible: boolean;
  motivo?: string;
  boletin?: string;
  informes: DiscusionInforme[];
  fuente: string;
  consultadoEl: string;
}

const RE_DEBATE = /DISCUSI[ÓO]N|DEBATE|IDEA DE LEGISLAR|VOTACI[ÓO]N|ACUERDOS ADOPTADOS|S[ÍI]NTESIS/;
const SOLO_MAYUS = /^[^a-záéíóúñü]*[A-ZÁÉÍÓÚÑÜ][^a-záéíóúñü]*$/;
const LETRA_SUELTA = /^[A-ZÁÉÍÓÚÑ][.)-]*$/;

/** Título en mayúsculas con que parte un tramo del informe (p. ej. "DISCUSIÓN EN GENERAL"); "" si no parte con título. */
export function tituloDeTramo(tramo: string): { titulo: string; largoTitulo: number } {
  const re = /\S+/g;
  const palabras: { t: string; fin: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(tramo)) && palabras.length < 14) palabras.push({ t: m[0], fin: m.index + m[0].length });
  let n = 0;
  for (let i = 0; i < palabras.length && i < 12; i++) {
    const w = palabras[i].t;
    if (!SOLO_MAYUS.test(w)) break;
    // "A.-", "B)" o una letra suelta seguida de minúscula ("A continuación") ya son parte del texto, no del título.
    if (LETRA_SUELTA.test(w) && w !== "H." && (/[.)-]/.test(w) || /^[a-záéíóúñ]/.test(palabras[i + 1]?.t || ""))) break;
    n = i + 1;
  }
  if (n === 0) return { titulo: "", largoTitulo: 0 };
  const titulo = palabras.slice(0, n).map((p) => p.t).join(" ").replace(/[\s.:,-]+$/, "");
  return titulo.replace(/[^A-ZÁÉÍÓÚÑÜ]/g, "").length < 4 ? { titulo: "", largoTitulo: 0 } : { titulo, largoTitulo: palabras[n - 1].fin };
}

/**
 * Secciones de un informe de comisión. Los informes del Senado separan sus partes con " - - - " seguido del
 * título en mayúsculas. Un tramo sin título se considera continuación de la sección anterior. El índice final se omite.
 */
const ROMANOS: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15 };

/**
 * Inicios de sección en los informes de la Cámara: "I.- …", "II.- …", "III.- …" con el título en mayúsculas.
 * Solo se aceptan números romanos en secuencia creciente (así "artículo V." dentro del texto no corta una sección).
 */
function cortesPorRomanos(texto: string): number[] {
  // Variantes vistas en informes reales: "II.- TÍTULO", "I.-TÍTULO", "VII-TÍTULO".
  const re = /(?:^|\s)([IVX]{1,4})(?:\.\s?[-–]?|\s?[-–])\s?(?=[A-ZÁÉÍÓÚÑ]{2})/g;
  const cortes: number[] = [];
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const v = ROMANOS[m[1]];
    if (!v) continue;
    // El primero puede ser I o II (a veces el "I" no lleva título); después, solo el siguiente o el subsiguiente.
    if (ultimo === 0 ? v <= 2 : v === ultimo + 1 || v === ultimo + 2) {
      cortes.push(m.index + m[0].length);
      ultimo = v;
    }
  }
  if (cortes.length < 2) return [];
  // Dentro de la síntesis de la discusión, la Cámara titula sin número: "VOTACIÓN EN GENERAL", "DISCUSIÓN Y VOTACIÓN
  // EN PARTICULAR"… Se toman solo cuando parten una oración (después de un punto y antes de una palabra normal).
  const sub = /[.)]\s+((?:DISCUSI[ÓO]N|VOTACI[ÓO]N)(?: Y VOTACI[ÓO]N)?(?: EN)? (?:GENERAL|PARTICULAR))\s+(?=[A-ZÁÉÍÓÚÑ][a-záéíóúñ])/g;
  while ((m = sub.exec(texto))) cortes.push(m.index + m[0].indexOf(m[1]));
  return cortes.sort((a, b) => a - b);
}

export function seccionesInforme(texto: string, largoExtracto = 2500): SeccionInforme[] {
  const out: SeccionInforme[] = [];
  const sep = /\s-\s-\s-\s/g;
  let cortes: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = sep.exec(texto))) cortes.push(m.index + m[0].length);
  // Informes de la Cámara: no usan " - - - " sino títulos con números romanos.
  if (cortes.length < 3) cortes = cortesPorRomanos(texto);
  for (let i = 0; i < cortes.length; i++) {
    const ini = cortes[i];
    const fin = i + 1 < cortes.length ? cortes[i + 1] : texto.length;
    const { titulo, largoTitulo } = tituloDeTramo(texto.slice(ini, Math.min(fin, ini + 400)));
    if (!titulo) {
      const previa = out[out.length - 1];
      if (previa) previa.largo = fin - previa.inicio;
      continue;
    }
    if (/^[ÍI]NDICE\b/.test(titulo)) break;
    out.push({ titulo, inicio: ini + largoTitulo, largo: fin - (ini + largoTitulo), esDebate: RE_DEBATE.test(titulo) });
  }
  for (const s of out) {
    s.largo = Math.max(0, s.largo);
    if (s.esDebate) s.extracto = texto.slice(s.inicio, s.inicio + Math.min(s.largo, largoExtracto)).trim();
  }
  return out;
}

const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_INFORMES = 6;

export async function discusionDeProyecto(boletinId: string): Promise<DiscusionProyecto> {
  const fuente = "Informes de comisión publicados en tramitacion.senado.cl";
  const consultadoEl = new Date().toISOString();
  const digits = String(boletinId || "").replace(/\./g, "").match(/\d{3,6}/)?.[0] || "";
  if (!digits) return { disponible: false, motivo: "Número de boletín no válido.", informes: [], fuente, consultadoEl };
  const clave = `discusion_proyecto_v1_${digits}`;
  const previo = cache.get<DiscusionProyecto>(clave);
  if (previo) return previo;

  const p = await fetchProyectoFromSenado(digits);
  if (!p) return { disponible: false, motivo: "No se encontró el proyecto en la ficha oficial del Senado.", informes: [], fuente, consultadoEl };
  const informes = (p.documentos || [])
    .filter((d: any) => d?.tipo === "Informe" && /^https:\/\/tramitacion\.senado\.cl\//.test(String(d.url || "")))
    .slice(0, MAX_INFORMES);
  if (informes.length === 0) {
    return { disponible: false, motivo: "La ficha oficial no registra informes de comisión para este proyecto.", boletin: p.id, informes: [], fuente, consultadoEl };
  }
  const resultado = await Promise.all(informes.map(async (d: any): Promise<DiscusionInforme> => {
    const base = { titulo: String(d.titulo || "Informe de comisión"), fecha: d.fecha || undefined, url: String(d.url) };
    try {
      const texto = await fetchTextoInformeDocx(base.url);
      if (!texto) return { ...base, disponible: false, motivo: "No se pudo leer el documento del informe.", secciones: [] };
      const secciones = seccionesInforme(texto);
      if (secciones.length === 0) {
        return { ...base, disponible: false, motivo: "El informe no usa el formato de secciones reconocible; ábralo en el enlace oficial.", totalCaracteres: texto.length, secciones: [] };
      }
      return { ...base, disponible: true, totalCaracteres: texto.length, secciones };
    } catch (e: any) {
      return { ...base, disponible: false, motivo: `No se pudo leer el informe: ${e?.message || e}`, secciones: [] };
    }
  }));
  const res: DiscusionProyecto = { disponible: resultado.some((r) => r.disponible), boletin: p.id, informes: resultado, fuente, consultadoEl };
  if (!res.disponible) res.motivo = "No se pudo leer ninguno de los informes de comisión.";
  // Solo se guarda si todos los informes se leyeron (un informe caído se reintenta en la próxima consulta).
  if (resultado.every((r) => r.disponible)) cache.set(clave, res, TTL_MS);
  return res;
}
