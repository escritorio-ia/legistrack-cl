/**
 * Informe de una sesión de comisión redactado A PARTIR DE SU TRANSCRIPCIÓN (no del video ni de otra fuente).
 * Toda afirmación lleva el minuto de la transcripción que la respalda; lo que no se puede ubicar en la
 * transcripción se descarta. Funciones puras: preparación del texto, validación y exportación.
 */
import { boletinesEnTexto, normalizarBoletin } from "./boletines";

export interface SegmentoInforme { segundos: number; orador: string; texto: string }

export interface InformeSesion {
  version: 1;
  resumen: string;
  puntos: {
    numero: number;            // número del punto de la tabla; 0 = fuera de tabla / asuntos varios
    titulo: string;
    boletines: string[];
    sintesis: string;
    intervenciones: { orador: string; cargo: string; segundos: number; postura: string }[];
    acuerdos: { texto: string; segundos: number }[];
    votaciones: { texto: string; resultado: string; segundos: number }[];
  }[];
  compromisos: { texto: string; responsable: string; segundos: number }[];
  pendientes: string[];
  parcial: boolean;            // generado con una transcripción incompleta
  descartados: number;         // elementos quitados por no poder ubicarse en la transcripción
  modelo?: string;
  generado?: string;
}

export function formatoMinutoInforme(seg: number): string {
  const s = Math.max(0, Math.round(seg));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}

/** "1:02:03", "62:03" o 3723 -> segundos; NaN si no se puede leer. */
export function minutoASegundos(v: unknown): number {
  if (typeof v === "number" && isFinite(v)) return v;
  const p = String(v ?? "").trim().split(":").map(Number);
  if (p.length < 2 || p.some((x) => !isFinite(x))) return NaN;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
}

/** Transcripción en líneas "[mm:ss] Orador: texto" para el modelo. */
export function transcripcionParaPrompt(segmentos: SegmentoInforme[]): string {
  return [...segmentos].sort((a, b) => a.segundos - b.segundos)
    .map((g) => `[${formatoMinutoInforme(g.segundos)}] ${String(g.orador || "Orador no identificado").trim()}: ${String(g.texto || "").replace(/\s+/g, " ").trim()}`)
    .join("\n");
}

const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const TOLERANCIA = 90; // segundos

/**
 * Valida el JSON del modelo contra la transcripción:
 *  - cada intervención, acuerdo, votación y compromiso debe tener un minuto que exista en la transcripción (±90 s);
 *  - el orador de una intervención debe aparecer en la transcripción (en ese tramo o en cualquier parte);
 *  - solo se aceptan boletines de la tabla o mencionados en la transcripción.
 */
export function validarInforme(raw: any, segmentos: SegmentoInforme[], boletinesTabla: string[], parcial: boolean): InformeSesion {
  const tiempos = segmentos.map((g) => g.segundos).sort((a, b) => a - b);
  const oradores = Array.from(new Set(segmentos.map((g) => norm(g.orador)).filter((o) => o && !/no identificad/.test(o))));
  const permitidos = new Set([...boletinesTabla.map(normalizarBoletin), ...boletinesEnTexto(segmentos.map((g) => g.texto).join(" "))].filter(Boolean));
  let descartados = 0;
  const minutoValido = (v: unknown): number | null => {
    const s = minutoASegundos(v);
    if (!isFinite(s)) return null;
    return tiempos.some((t) => Math.abs(t - s) <= TOLERANCIA) ? s : null;
  };
  const oradorValido = (o: string) => {
    const n = norm(o);
    if (!n) return false;
    return oradores.some((x) => x === n || x.includes(n) || n.includes(x));
  };
  const txt = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();
  const lista = (v: unknown): any[] => (Array.isArray(v) ? v : []);
  const filtrar = <T,>(items: any[], f: (x: any) => T | null): T[] => items.map((x) => { const r = f(x); if (!r) descartados++; return r; }).filter(Boolean) as T[];

  const puntos = lista(raw?.puntos).map((p: any) => ({
    numero: Number.isFinite(Number(p?.numero)) ? Number(p.numero) : 0,
    titulo: txt(p?.titulo) || "Punto sin título",
    boletines: Array.from(new Set(lista(p?.boletines).map((b) => normalizarBoletin(String(b))).filter((b) => b.includes("-") && permitidos.has(b)))),
    sintesis: txt(p?.sintesis),
    intervenciones: filtrar(lista(p?.intervenciones), (i) => {
      const s = minutoValido(i?.minuto ?? i?.segundos);
      return s !== null && oradorValido(i?.orador) && txt(i?.postura) ? { orador: txt(i.orador), cargo: txt(i?.cargo), segundos: s, postura: txt(i.postura) } : null;
    }),
    acuerdos: filtrar(lista(p?.acuerdos), (a) => { const s = minutoValido(a?.minuto ?? a?.segundos); return s !== null && txt(a?.texto) ? { texto: txt(a.texto), segundos: s } : null; }),
    votaciones: filtrar(lista(p?.votaciones), (v) => { const s = minutoValido(v?.minuto ?? v?.segundos); return s !== null && txt(v?.texto) ? { texto: txt(v.texto), resultado: txt(v?.resultado) || "No informado", segundos: s } : null; }),
  })).filter((p) => p.sintesis || p.intervenciones.length || p.acuerdos.length || p.votaciones.length)
    .sort((a, b) => (a.numero || 999) - (b.numero || 999));

  return {
    version: 1,
    resumen: txt(raw?.resumen),
    puntos,
    compromisos: filtrar(lista(raw?.compromisos), (c) => { const s = minutoValido(c?.minuto ?? c?.segundos); return s !== null && txt(c?.texto) ? { texto: txt(c.texto), responsable: txt(c?.responsable) || "No informado", segundos: s } : null; }),
    pendientes: lista(raw?.pendientes).map(txt).filter(Boolean),
    parcial,
    descartados,
  };
}

/** Texto del informe para copiar o pegar en un documento. */
export function informeSesionATexto(inf: InformeSesion, meta: { comision: string; fecha: string; videoId?: string }): string {
  const L: string[] = [`INFORME DE SESIÓN · ${meta.comision} · ${meta.fecha}`, "", "RESUMEN", inf.resumen || "No informado"];
  for (const p of inf.puntos) {
    L.push("", `${p.numero ? `PUNTO ${p.numero}: ` : ""}${p.titulo}${p.boletines.length ? ` (Boletín ${p.boletines.join(", ")})` : ""}`);
    if (p.sintesis) L.push(p.sintesis);
    for (const i of p.intervenciones) L.push(`- [${formatoMinutoInforme(i.segundos)}] ${i.orador}${i.cargo ? ` (${i.cargo})` : ""}: ${i.postura}`);
    for (const a of p.acuerdos) L.push(`  Acuerdo [${formatoMinutoInforme(a.segundos)}]: ${a.texto}`);
    for (const v of p.votaciones) L.push(`  Votación [${formatoMinutoInforme(v.segundos)}]: ${v.texto} · ${v.resultado}`);
  }
  if (inf.compromisos.length) { L.push("", "COMPROMISOS"); for (const c of inf.compromisos) L.push(`- [${formatoMinutoInforme(c.segundos)}] ${c.texto} (responsable: ${c.responsable})`); }
  if (inf.pendientes.length) { L.push("", "TEMAS PENDIENTES"); for (const t of inf.pendientes) L.push(`- ${t}`); }
  L.push("", `Informe generado con IA a partir de la transcripción automática del video oficial${inf.parcial ? " (transcripción incompleta)" : ""}. No es un documento oficial; verifique cada minuto en el video${meta.videoId ? `: https://www.youtube.com/watch?v=${meta.videoId}` : ""}.`);
  return L.join("\n");
}
