/**
 * Informe de una sesión de comisión redactado A PARTIR DE SU TRANSCRIPCIÓN (no del video ni de otra fuente),
 * con el estilo de los informes de comisión del Senado (relato en tercera persona por punto de la tabla).
 * Toda afirmación lleva el minuto de la transcripción que la respalda; lo que no se puede ubicar se descarta.
 * Funciones puras: preparación del texto, validación, normalización y exportación.
 */
import { boletinesEnTexto, normalizarBoletin } from "./boletines";

export interface SegmentoInforme { segundos: number; orador: string; texto: string }

/**
 * Clasificación de quienes intervienen:
 *  - PARL: parlamentarios (senadores y diputados).
 *  - ESP: Expositores del Sector Público (cargo en representación del Estado o misión diplomática; no parlamentarios).
 *  - ESC: Expositores de organizaciones de la sociedad civil (ONG, partido, fundación, agrupación, sindicato,
 *         asociación, empresa o sociedad).
 *  - EEA: Expositores expertos y académicos (académicos, especialistas, think tanks, organismos internacionales
 *         técnicos; incluye a la Biblioteca del Congreso Nacional, BCN).
 *  - SEC: Secretaría de la comisión.
 */
export type CategoriaInterviniente = "PARL" | "ESP" | "ESC" | "EEA" | "SEC" | "ND";
export const CATEGORIAS: Record<CategoriaInterviniente, { corto: string; largo: string }> = {
  PARL: { corto: "Parlamentarios", largo: "Parlamentarios" },
  ESP: { corto: "ESP", largo: "Expositores del Sector Público" },
  ESC: { corto: "ESC", largo: "Expositores de organizaciones de la sociedad civil" },
  EEA: { corto: "EEA", largo: "Expositores expertos y académicos" },
  SEC: { corto: "Secretaría", largo: "Secretaría de la comisión" },
  ND: { corto: "Sin clasificar", largo: "Sin clasificar (no se identifica en la transcripción)" },
};
const CAT_VALIDAS = new Set(Object.keys(CATEGORIAS));

export interface IntervencionInforme {
  orador: string;
  cargo: string;
  institucion: string;
  categoria: CategoriaInterviniente;
  segundos: number;
  parrafos: string[];   // relato en tercera persona, estilo informe de comisión
}

export interface InformeSesion {
  version: 1 | 2;
  resumen: string;
  sintesis: string[];
  puntos: {
    numero: number;            // número del punto de la tabla; 0 = fuera de tabla / asuntos varios
    titulo: string;
    boletines: string[];
    estado: string;            // "Votado", "En discusión", "Solo exposición", "Pendiente", ...
    sintesis: string;
    intervenciones: IntervencionInforme[];
    acuerdos: { texto: string; segundos: number }[];
    votaciones: { texto: string; resultado: string; segundos: number }[];
  }[];
  compromisos: { texto: string; responsable: string; segundos: number }[];
  pendientes: string[];
  parcial: boolean;
  descartados: number;
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
const TOLERANCIA = 90;

/** Acuerdos de trámite interno de la sesión que no son acuerdos sustantivos: prórrogas del tiempo de la sesión. */
export function esProrroga(texto: string): boolean {
  const t = norm(texto);
  return /\bprorrog/.test(t) || /\b(extender|ampliar|alargar|extension|ampliacion)\b.*\b(sesion|hora|horario|tiempo|minutos)\b/.test(t);
}

/** Clasificación final: la BCN siempre es EEA; un parlamentario reconocible por su tratamiento es PARL. */
export function categoriaFinal(cat: unknown, orador: string, cargo: string, institucion: string): CategoriaInterviniente {
  const todo = norm(`${orador} ${cargo} ${institucion}`);
  if (/biblioteca del congreso|\bbcn\b/.test(todo)) return "EEA";
  if (/\b(senador|senadora|diputado|diputada|honorable|sen|dip|h senador|h diputad)\b/.test(todo) && !/asesor/.test(todo)) return "PARL";
  const c = String(cat || "").toUpperCase().trim();
  return (CAT_VALIDAS.has(c) ? c : "ND") as CategoriaInterviniente;
}

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
    estado: txt(p?.estado),
    sintesis: txt(p?.sintesis),
    intervenciones: filtrar(lista(p?.intervenciones), (i): IntervencionInforme | null => {
      const s = minutoValido(i?.minuto ?? i?.segundos);
      const parrafos = (lista(i?.parrafos).length ? lista(i.parrafos) : [i?.postura]).map(txt).filter(Boolean);
      if (s === null || !oradorValido(i?.orador) || parrafos.length === 0) return null;
      const orador = txt(i.orador), cargo = txt(i?.cargo), institucion = txt(i?.institucion);
      return { orador, cargo, institucion, categoria: categoriaFinal(i?.categoria, orador, cargo, institucion), segundos: s, parrafos };
    }).sort((a, b) => a.segundos - b.segundos),
    acuerdos: filtrar(lista(p?.acuerdos).filter((a) => !esProrroga(`${a?.texto ?? ""}`)), (a) => { const s = minutoValido(a?.minuto ?? a?.segundos); return s !== null && txt(a?.texto) ? { texto: txt(a.texto), segundos: s } : null; }),
    votaciones: filtrar(lista(p?.votaciones).filter((v) => !esProrroga(`${v?.texto ?? ""}`)), (v) => { const s = minutoValido(v?.minuto ?? v?.segundos); return s !== null && txt(v?.texto) ? { texto: txt(v.texto), resultado: txt(v?.resultado) || "No informado", segundos: s } : null; }),
  })).filter((p) => p.sintesis || p.intervenciones.length || p.acuerdos.length || p.votaciones.length)
    .sort((a, b) => (a.numero || 999) - (b.numero || 999));

  return {
    version: 2,
    resumen: txt(raw?.resumen),
    sintesis: lista(raw?.sintesis).map(txt).filter(Boolean).slice(0, 6),
    puntos,
    compromisos: filtrar(lista(raw?.compromisos), (c) => { const s = minutoValido(c?.minuto ?? c?.segundos); return s !== null && txt(c?.texto) ? { texto: txt(c.texto), responsable: txt(c?.responsable) || "No informado", segundos: s } : null; }),
    pendientes: lista(raw?.pendientes).map(txt).filter(Boolean),
    parcial,
    descartados,
  };
}

/** Lleva un informe guardado (incluidos los de la versión 1) a la forma actual. */
export function normalizarInforme(inf: any): InformeSesion {
  const lista = (v: unknown): any[] => (Array.isArray(v) ? v : []);
  return {
    version: 2,
    resumen: String(inf?.resumen || ""),
    sintesis: lista(inf?.sintesis),
    puntos: lista(inf?.puntos).map((p: any) => ({
      numero: Number(p?.numero) || 0, titulo: String(p?.titulo || ""), boletines: lista(p?.boletines), estado: String(p?.estado || ""), sintesis: String(p?.sintesis || ""),
      intervenciones: lista(p?.intervenciones).map((i: any) => ({
        orador: String(i?.orador || ""), cargo: String(i?.cargo || ""), institucion: String(i?.institucion || ""),
        categoria: categoriaFinal(i?.categoria, String(i?.orador || ""), String(i?.cargo || ""), String(i?.institucion || "")),
        segundos: Number(i?.segundos) || 0, parrafos: lista(i?.parrafos).length ? lista(i.parrafos) : [String(i?.postura || "")].filter(Boolean),
      })),
      acuerdos: lista(p?.acuerdos).filter((a: any) => !esProrroga(String(a?.texto || ""))),
      votaciones: lista(p?.votaciones).filter((v: any) => !esProrroga(String(v?.texto || ""))),
    })),
    compromisos: lista(inf?.compromisos), pendientes: lista(inf?.pendientes),
    parcial: !!inf?.parcial, descartados: Number(inf?.descartados) || 0, modelo: inf?.modelo, generado: inf?.generado,
  };
}

/** Intervinientes únicos con su clasificación (para la ficha y el cuadro de expositores). */
export function intervinientes(inf: InformeSesion): { orador: string; cargo: string; institucion: string; categoria: CategoriaInterviniente; primera: number; veces: number }[] {
  const m = new Map<string, { orador: string; cargo: string; institucion: string; categoria: CategoriaInterviniente; primera: number; veces: number }>();
  for (const p of inf.puntos) for (const i of p.intervenciones) {
    const k = norm(i.orador);
    const e = m.get(k);
    if (e) { e.veces++; e.primera = Math.min(e.primera, i.segundos); if (!e.cargo) e.cargo = i.cargo; if (!e.institucion) e.institucion = i.institucion; if (e.categoria === "ND") e.categoria = i.categoria; }
    else m.set(k, { orador: i.orador, cargo: i.cargo, institucion: i.institucion, categoria: i.categoria, primera: i.segundos, veces: 1 });
  }
  return Array.from(m.values()).sort((a, b) => a.primera - b.primera);
}

/** Presentación de quien habla, al estilo de los informes: "El Subsecretario de Agricultura, señor X,". */
export function presentacion(i: { orador: string; cargo: string; institucion: string }): string {
  const cargo = [i.cargo, i.institucion && !norm(i.cargo).includes(norm(i.institucion)) ? i.institucion : ""].filter(Boolean).join(" de ");
  return cargo ? `${cargo[0].toUpperCase()}${cargo.slice(1)}, ${i.orador},` : `${i.orador}`;
}

/** Texto del informe para copiar o pegar en un documento. */
export function informeSesionATexto(inf: InformeSesion, meta: { comision: string; fecha: string; videoId?: string }): string {
  const L: string[] = [`INFORME DE SESIÓN · ${meta.comision} · ${meta.fecha}`, ""];
  L.push("I. SÍNTESIS", inf.resumen || "No informado");
  for (const s of inf.sintesis) L.push(`- ${s}`);
  const votos = inf.puntos.flatMap((p) => [...p.votaciones.map((v) => ({ p, t: `${v.texto}: ${v.resultado}`, s: v.segundos })), ...p.acuerdos.map((a) => ({ p, t: a.texto, s: a.segundos }))]);
  L.push("", "II. ACUERDOS Y VOTACIONES");
  if (!votos.length) L.push("No se registran acuerdos ni votaciones en la transcripción.");
  for (const v of votos) L.push(`- Punto ${v.p.numero || "s/n"}${v.p.boletines.length ? ` (Boletín ${v.p.boletines.join(", ")})` : ""}: ${v.t} [${formatoMinutoInforme(v.s)}]`);
  L.push("", "III. DESARROLLO POR PUNTO DE LA TABLA");
  for (const p of inf.puntos) {
    L.push("", `${p.numero ? `PUNTO ${p.numero}. ` : "FUERA DE TABLA. "}${p.titulo}${p.boletines.length ? ` (Boletín N° ${p.boletines.join(", ")})` : ""}`);
    if (p.sintesis) L.push(p.sintesis);
    const bloque = (lista: IntervencionInforme[]) => lista.sort((a, b) => a.segundos - b.segundos).forEach((i) => L.push("", `${presentacion(i)} ${i.parrafos.join("\n")} [${formatoMinutoInforme(i.segundos)}]`));
    const expos = p.intervenciones.filter((i) => i.categoria !== "PARL" && i.categoria !== "SEC");
    const parls = p.intervenciones.filter((i) => i.categoria === "PARL" || i.categoria === "SEC");
    if (expos.length) { L.push("", "Exposiciones"); bloque([...expos]); }
    if (parls.length) { L.push("", "Lo que señalaron los parlamentarios"); bloque([...parls]); }
    for (const v of p.votaciones) L.push("", `- ${v.texto}: ${v.resultado}. [${formatoMinutoInforme(v.segundos)}]`);
    for (const a of p.acuerdos) L.push("", `- ${a.texto}. [${formatoMinutoInforme(a.segundos)}]`);
  }
  const ints = intervinientes(inf).filter((i) => i.categoria !== "PARL" && i.categoria !== "SEC");
  if (ints.length) {
    L.push("", "EXPOSITORES");
    for (const c of ["ESP", "ESC", "EEA", "ND"] as CategoriaInterviniente[]) {
      const g = ints.filter((i) => i.categoria === c);
      if (!g.length) continue;
      L.push(`${CATEGORIAS[c].largo} (${c})`);
      for (const i of g) L.push(`- ${i.orador}${i.cargo ? `, ${i.cargo}` : ""}${i.institucion ? `, ${i.institucion}` : ""}`);
    }
  }
  if (inf.compromisos.length) { L.push("", "V. COMPROMISOS"); for (const c of inf.compromisos) L.push(`- ${c.texto} (responsable: ${c.responsable}) [${formatoMinutoInforme(c.segundos)}]`); }
  if (inf.pendientes.length) { L.push("", "TEMAS PENDIENTES"); for (const t of inf.pendientes) L.push(`- ${t}`); }
  L.push("", `Informe generado con IA a partir de la transcripción automática del video oficial${inf.parcial ? " (transcripción incompleta)" : ""}. No es un documento oficial; verifique cada minuto en el video${meta.videoId ? `: https://www.youtube.com/watch?v=${meta.videoId}` : ""}.`);
  return L.join("\n");
}
