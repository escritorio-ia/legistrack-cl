/**
 * "Lo visto en comisiones" de un boletín: reúne los informes de sesión (hechos desde las transcripciones) en que
 * se trató el boletín, arma la cronología (solo con lo que dicen esos informes) y, con IA, un resumen consolidado.
 * El resumen se guarda en historial_proyectos/<boletín>.resumenComisiones con una firma de los informes usados;
 * se rehace solo cuando aparece un informe nuevo.
 */
import { consultar, camposAObjeto, leerDoc, escribirDoc } from "./firestoreRest";
import { geminiJSON } from "./informeSesionService";
import { normalizarBoletin } from "../../src/utils/boletines";
import { normalizarInforme, intervinientes, CATEGORIAS } from "../../src/utils/informeSesion";

export interface SesionDelBoletin {
  videoId: string; fecha: string; comision: string; titulo: string;
  estado: string; sintesis: string;
  acuerdos: string[]; votaciones: string[];
  expositores: { orador: string; cargo: string; institucion: string; categoria: string }[];
  parlamentarios: string[];
  intervenciones: { orador: string; texto: string }[];
}

const iso = (f: string) => {
  const m = String(f || "").match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[0];
  const d = String(f || "").match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  return d ? `${d[3]}-${d[2].padStart(2, "0")}-${d[1].padStart(2, "0")}` : String(f || "");
};

/** Sesiones con informe en que se trató el boletín, de la más reciente a la más antigua. */
export async function sesionesDelBoletin(boletin: string): Promise<SesionDelBoletin[]> {
  const b = normalizarBoletin(boletin);
  if (!b.includes("-")) return [];
  const filas = await consultar({ from: [{ collectionId: "analisis_videos_sesion" }], where: { fieldFilter: { field: { fieldPath: "boletines" }, op: "ARRAY_CONTAINS", value: { stringValue: b } } } });
  const out: SesionDelBoletin[] = [];
  for (const f of filas) {
    const d = camposAObjeto(f.datos);
    if (d.tipo !== "informe" || !d.informe) continue;
    const inf = normalizarInforme(d.informe);
    // Solo los puntos de este boletín; si el informe no separó por boletín y la sesión tuvo un solo punto, se usa ese.
    let puntos = inf.puntos.filter((p) => p.boletines.includes(b));
    if (puntos.length === 0 && inf.puntos.length === 1) puntos = inf.puntos;
    if (puntos.length === 0) continue;
    const parcial = { ...inf, puntos };
    const ints = intervinientes(parcial);
    out.push({
      videoId: String(d.videoId || f.id.replace(/__i$/, "")), fecha: iso(d.fecha), comision: String(d.comision || ""), titulo: String(d.titulo || ""),
      estado: puntos.map((p) => p.estado).filter(Boolean).join(" · "),
      sintesis: puntos.map((p) => p.sintesis).filter(Boolean).join(" "),
      acuerdos: puntos.flatMap((p) => p.acuerdos.map((a) => a.texto)),
      votaciones: puntos.flatMap((p) => p.votaciones.map((v) => `${v.texto}: ${v.resultado}`)),
      expositores: ints.filter((i) => i.categoria !== "PARL" && i.categoria !== "SEC").map((i) => ({ orador: i.orador, cargo: i.cargo, institucion: i.institucion, categoria: i.categoria })),
      parlamentarios: ints.filter((i) => i.categoria === "PARL").map((i) => i.orador),
      intervenciones: puntos.flatMap((p) => p.intervenciones.map((i) => ({ orador: i.orador, texto: i.parrafos.join(" ") }))),
    });
  }
  return out.sort((a, c) => c.fecha.localeCompare(a.fecha));
}

const firmaDe = (s: SesionDelBoletin[]) => s.map((x) => `${x.videoId}:${x.fecha}:${x.intervenciones.length}`).sort().join("|");
const S = (type: string, extra: any = {}) => ({ type, ...extra });
const ESQUEMA = S("OBJECT", {
  properties: {
    resumen: S("STRING"),
    temas: S("ARRAY", { items: S("OBJECT", { properties: { tema: S("STRING"), detalle: S("STRING"), fechas: S("ARRAY", { items: S("STRING") }) }, required: ["tema", "detalle", "fechas"] }) }),
    posiciones: S("ARRAY", { items: S("OBJECT", { properties: { actor: S("STRING"), postura: S("STRING"), fecha: S("STRING") }, required: ["actor", "postura", "fecha"] }) }),
    pendientes: S("ARRAY", { items: S("STRING") }),
  },
  required: ["resumen", "temas"],
});

export interface ResumenComisiones {
  disponible: boolean; motivo?: string; firma?: string; generado?: string; modelo?: string;
  resumen?: string;
  temas?: { tema: string; detalle: string; fechas: string[] }[];
  posiciones?: { actor: string; postura: string; fecha: string }[];
  pendientes?: string[];
  sesiones: SesionDelBoletin[];
}

function prompt(b: string, sesiones: SesionDelBoletin[]): string {
  const bloques = sesiones.slice().reverse().map((s) => [
    `### Sesión ${s.fecha} · ${s.comision}`,
    s.sintesis && `Qué se discutió: ${s.sintesis}`,
    ...s.intervenciones.map((i) => `- ${i.orador}: ${i.texto}`),
    ...s.acuerdos.map((a) => `Acuerdo: ${a}`),
    ...s.votaciones.map((v) => `Votación: ${v}`),
  ].filter(Boolean).join("\n")).join("\n\n");
  return `Eres asesor parlamentario de la Biblioteca del Congreso Nacional de Chile. Resume lo que se ha visto en comisiones sobre el boletín ${b},
usando EXCLUSIVAMENTE los informes de sesión que siguen (hechos a partir de las transcripciones). No agregues nada externo.
- "resumen": un párrafo de 4 a 6 oraciones sobre el estado de la discusión en comisión.
- "temas": 3 a 6 temas principales del debate, cada uno con 1 a 2 oraciones y las fechas (AAAA-MM-DD) de las sesiones donde se trató.
- "posiciones": las posturas más relevantes (actor con su cargo o institución si aparece, y su postura en una oración), con la fecha de la sesión.
- "pendientes": lo que quedó pendiente según los informes.
Español formal, tercera persona.

${bloques.slice(0, 200000)}`;
}

/** Resumen guardado o, si hay informes nuevos (o se pide), uno nuevo. */
export async function resumenComisionesBoletin(boletin: string, opciones: { forzar?: boolean; soloGuardado?: boolean } = {}): Promise<ResumenComisiones> {
  const b = normalizarBoletin(boletin);
  const sesiones = await sesionesDelBoletin(b);
  if (sesiones.length === 0) return { disponible: false, motivo: "Aún no hay informes de sesiones de comisión con este boletín.", sesiones: [] };
  const firma = firmaDe(sesiones);
  const guardado = await leerDoc(`historial_proyectos/${b}`).catch(() => null);
  const prev = guardado?.resumenComisiones;
  if (prev?.firma === firma && !opciones.forzar) return { ...prev, disponible: true, sesiones };
  if (opciones.soloGuardado) return prev ? { ...prev, disponible: true, desactualizado: true, sesiones } as any : { disponible: false, motivo: "pendiente", sesiones };
  const r = await geminiJSON(prompt(b, sesiones), ESQUEMA, { maxTokens: 6000, presupuestoMs: 120_000 });
  if (r.ok === false) return { ...(prev || {}), disponible: !!prev, motivo: `No se pudo actualizar el resumen: ${(r as any).motivo}`, sesiones };
  const fechas = new Set(sesiones.map((s) => s.fecha));
  const txt = (v: any) => String(v ?? "").replace(/\s+/g, " ").trim();
  const d: any = (r as any).datos;
  const resultado = {
    firma, generado: new Date().toISOString(), modelo: (r as any).modelo,
    resumen: txt(d?.resumen),
    // Solo se aceptan temas y posturas ligados a sesiones que existen.
    temas: (Array.isArray(d?.temas) ? d.temas : []).map((t: any) => ({ tema: txt(t?.tema), detalle: txt(t?.detalle), fechas: (Array.isArray(t?.fechas) ? t.fechas : []).map(txt).filter((f: string) => fechas.has(f)) }))
      .filter((t: any) => t.tema && t.detalle && t.fechas.length),
    posiciones: (Array.isArray(d?.posiciones) ? d.posiciones : []).map((p: any) => ({ actor: txt(p?.actor), postura: txt(p?.postura), fecha: txt(p?.fecha) }))
      .filter((p: any) => p.actor && p.postura && fechas.has(p.fecha)),
    pendientes: (Array.isArray(d?.pendientes) ? d.pendientes : []).map(txt).filter(Boolean),
  };
  await escribirDoc(`historial_proyectos/${b}`, { boletinId: b, resumenComisiones: resultado, updatedAt: new Date().toISOString() }).catch(() => undefined);
  return { ...resultado, disponible: true, sesiones };
}

export const ETIQUETA_CATEGORIA = (c: string) => (CATEGORIAS as any)[c]?.corto || c;
