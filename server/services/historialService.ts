/**
 * Historial del proyecto ("anamnesis legislativa"), armado solo con datos ya reunidos por la app:
 *  - registro oficial de sesiones (registro_sesiones), con el boletín en la tabla;
 *  - informes de sesión hechos desde las transcripciones (analisis_videos_sesion/<video>__i) y sus transcripciones (__t);
 *  - informes oficiales de comisión (tramitacion.senado.cl);
 *  - Sala (sesiones_sala).
 * Lo determinista (períodos, expositores, acuerdos, tiempos) se calcula; la síntesis (temas, posiciones,
 * contrapuntos, cierre de cada comisión e hilo de temas) se redacta con IA y se valida contra las fechas reales.
 * Se guarda en historial_proyectos/<boletín>.historial con una firma de los datos usados; se rehace si cambian.
 */
import { consultar, camposAObjeto, leerDoc, escribirDoc } from "./firestoreRest";
import { sesionesRegistradasDeBoletin } from "./registroSesionesService";
import { sesionesSalaDeBoletin } from "./salaService";
import { discusionDeProyecto, seccionesInforme } from "./discusionService";
import { fetchTextoInformeDocx } from "./senadoService";
import { geminiJSON } from "./informeSesionService";
import { actasDeBoletin, tramoDeBoletin, type ActaCamara } from "./actasCamaraService";
import { normalizarBoletin } from "../../src/utils/boletines";
import { normalizarInforme, categoriaFinal } from "../../src/utils/informeSesion";
import { type ComisionHistorial, type HistorialProyecto, tiempoEnVentana, normComision } from "../../src/utils/historial";
import { unirPersonas, buscarPersona, type ObservacionPersona } from "../../src/utils/personas";

const hoy = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const isoDe = (f: any) => { const t = String(f || ""); const m = t.match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0]; const d = t.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/); return d ? `${d[3]}-${d[2].padStart(2, "0")}-${d[1].padStart(2, "0")}` : ""; };
const dias = (a: string, b: string) => Math.round((new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / 86400000);
const conTiempo = <T,>(p: Promise<T>, ms: number, def: T) => Promise.race([p.catch(() => def), new Promise<T>((r) => setTimeout(() => r(def), ms))]);
const mismaComision = (a: string, b: string) => { const x = normComision(a), y = normComision(b); return !!x && !!y && (x === y || x.includes(y) || y.includes(x)); };

interface InformeSesionLeido { videoId: string; fecha: string; comision: string; inf: ReturnType<typeof normalizarInforme> }

async function informesDeSesion(b: string): Promise<InformeSesionLeido[]> {
  const filas = await consultar({ from: [{ collectionId: "analisis_videos_sesion" }], where: { fieldFilter: { field: { fieldPath: "boletines" }, op: "ARRAY_CONTAINS", value: { stringValue: b } } } });
  return filas.map((f) => camposAObjeto(f.datos)).filter((d) => d.tipo === "informe" && d.informe)
    .map((d) => ({ videoId: String(d.videoId), fecha: isoDe(d.fecha), comision: String(d.comision || ""), inf: normalizarInforme(d.informe) }));
}

/** Texto completo de un informe oficial de comisión (recortado a un tamaño que la IA procesa bien). */
async function textoInformeOficial(url: string): Promise<{ texto: string; motivo?: string }> {
  const texto = await conTiempo(fetchTextoInformeDocx(url), 40000, null);
  if (!texto) return { texto: "", motivo: "No se pudo leer el informe oficial de la comisión." };
  // Se omite el texto del proyecto al final (articulado) si el informe es muy largo.
  const corte = texto.search(/TEXTO DEL PROYECTO|PROYECTO DE LEY\s*:/);
  const util = corte > 20000 ? texto.slice(0, corte) + " " + texto.slice(texto.search(/ACORDADO/) > corte ? texto.search(/ACORDADO/) : texto.length) : texto;
  return { texto: util.slice(0, 120000) };
}

const MESES_TXT = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const normT = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
/** ¿La fecha ISO aparece en el texto? ("3 de junio de 2026", "03 de junio", "03/06/2026"). */
export function fechaEnTexto(iso: string, corpus: string): boolean {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return false;
  const t = normT(corpus);
  return new RegExp(`(^|\\D)0?${d}\\s+de\\s+${MESES_TXT[m - 1]}`).test(t) || new RegExp(`(^|\\D)0?${d}[/.-]0?${m}[/.-]${a}`).test(t);
}
/** ¿El nombre aparece en el texto? (se exige el apellido más largo). */
export function nombreEnTexto(nombre: string, corpus: string): boolean {
  const palabras = normT(nombre).replace(/\b(senor|senora|don|dona|honorable|senador|senadora|diputado|diputada|sr|sra)\b/g, " ").split(/[^a-z]+/).filter((w) => w.length >= 4);
  if (palabras.length === 0) return false;
  const t = normT(corpus);
  return palabras.sort((x, y) => y.length - x.length).slice(0, 1).every((w) => t.includes(w));
}

export async function construirHistorial(boletin: string, opciones: { forzar?: boolean; soloGuardado?: boolean } = {}): Promise<HistorialProyecto> {
  const b = normalizarBoletin(boletin);
  if (!b.includes("-")) return { disponible: false, motivo: "Número de boletín no válido.", boletin: b, comisiones: [], sala: [] };
  const [registro, informes, sala, discusion, actas] = await Promise.all([
    conTiempo(sesionesRegistradasDeBoletin(b), 15000, []),
    conTiempo(informesDeSesion(b), 15000, [] as InformeSesionLeido[]),
    conTiempo(sesionesSalaDeBoletin(b), 10000, []),
    conTiempo(discusionDeProyecto(b), 25000, { disponible: false, informes: [] } as any),
    conTiempo(actasDeBoletin(b), 12000, [] as ActaCamara[]),
  ]);
  const informesOficiales: { titulo: string; url: string; fecha?: string }[] = (discusion?.informes || []).map((i: any) => ({ titulo: i.titulo, url: i.url, fecha: i.fecha }));
  const firma = [
    "v4",
    registro.map((s) => `${s.id}:${s.resultado ? 1 : 0}`).sort().join(","),
    informes.map((i) => `${i.videoId}:${i.inf.generado || ""}`).sort().join(","),
    informesOficiales.map((i) => i.url).sort().join(","),
    actas.map((a) => a.sesionId).sort().join(","),
  ].join("|");

  const guardado = await leerDoc(`historial_proyectos/${b}`).catch(() => null);
  const prev = guardado?.historial as HistorialProyecto | undefined;
  if (prev && prev.firma === firma && !opciones.forzar) return prev;
  if (opciones.soloGuardado) return prev ? { ...prev, desactualizado: true } as any : { disponible: false, motivo: "pendiente", boletin: b, comisiones: [], sala: [] };

  const H = hoy();
  // --- Comisiones (de los registros oficiales y de los informes de sesión) ---
  const comisiones: ComisionHistorial[] = [];
  const obtener = (nombre: string, camara: string): ComisionHistorial => {
    let c = comisiones.find((x) => mismaComision(x.nombre, nombre));
    if (!c) {
      c = { clave: normComision(nombre).replace(/ /g, "-") || `c${comisiones.length}`, nombre, camara, desde: null, hasta: null, programadas: [], expositores: [], parlamentarios: [], acuerdos: [], votaciones: [], compromisos: [], pendientes: [], informeOficial: null, sesiones: [],
        estadistica: { sesionesCitadas: 0, sesionesConInforme: 0, sesionesSinTratar: 0, diasEnComision: null, minutosDiscusion: null, minutosPorCategoria: {}, oradores: [], minutosPorSesion: [] } };
      comisiones.push(c);
    }
    if (!c.camara && camara) c.camara = camara;
    return c;
  };
  for (const s of registro) {
    if (!s.comisionNombre || !s.fecha) continue;
    const c = obtener(s.comisionNombre, s.camara);
    if (s.fecha > H) { c.programadas.push(s.fecha); continue; }
    c.estadistica.sesionesCitadas++;
    if (/no alcanz|no se trat|no fue tratad|quedó pendiente para/i.test(String(s.resultado || ""))) c.estadistica.sesionesSinTratar++;
    c.desde = !c.desde || s.fecha < c.desde ? s.fecha : c.desde;
    c.hasta = !c.hasta || s.fecha > c.hasta ? s.fecha : c.hasta;
    const puntos = s.puntos.filter((p: any) => (p.boletines || []).includes(b));
    for (const p of puntos as any[]) if (p.acuerdos) c.acuerdos.push({ texto: p.acuerdos, fecha: s.fecha, fuente: "Detalle oficial de la sesión" });
    if (s.resultado) c.acuerdos.push({ texto: s.resultado, fecha: s.fecha, fuente: "Resultado oficial de la sesión" });
    if (!c.sesiones.some((x) => x.fecha === s.fecha)) c.sesiones.push({ fecha: s.fecha });
  }

  // --- Actas oficiales de la Cámara (enviadas por la extensión) ---
  for (const a of actas) {
    if (!a.fecha || a.fecha > H) continue;
    const c = obtener(a.comision, "Cámara");
    (c.actas ||= []).push({ fecha: a.fecha, numero: a.numero, url: a.url });
    if (!c.sesiones.some((x) => x.fecha === a.fecha)) c.sesiones.push({ fecha: a.fecha });
    if (!c.desde || a.fecha < c.desde) c.desde = a.fecha;
    if (!c.hasta || a.fecha > c.hasta) c.hasta = a.fecha;
  }

  // --- Informes de sesión (transcripción) y estadística de tiempo ---
  const minutosPorCat: Record<string, Record<string, number>> = {};
  for (const i of informes) {
    let puntos = i.inf.puntos.filter((p) => p.boletines.includes(b));
    if (puntos.length === 0 && i.inf.puntos.length === 1) puntos = i.inf.puntos;
    if (puntos.length === 0 || !i.fecha) continue;
    const c = obtener(i.comision || "Comisión no informada", "");
    c.estadistica.sesionesConInforme++;
    if (!c.desde || i.fecha < c.desde) c.desde = i.fecha;
    if (!c.hasta || i.fecha > c.hasta) c.hasta = i.fecha;
    const ses = c.sesiones.find((x) => x.fecha === i.fecha) || (c.sesiones.push({ fecha: i.fecha }), c.sesiones[c.sesiones.length - 1]);
    ses.videoId = i.videoId; ses.estado = puntos.map((p) => p.estado).filter(Boolean).join(" · "); ses.sintesis = puntos.map((p) => p.sintesis).filter(Boolean).join(" ");
    const categoriaDe = new Map<string, string>();
    for (const p of puntos) {
      for (const it of p.intervenciones) {
        categoriaDe.set(it.orador.toLowerCase(), it.categoria);
        if (it.categoria === "PARL") {
          const e = c.parlamentarios.find((x) => x.orador.toLowerCase() === it.orador.toLowerCase());
          if (e) { if (!e.fechas.includes(i.fecha)) e.fechas.push(i.fecha); } else c.parlamentarios.push({ orador: it.orador, fechas: [i.fecha] });
        } else if (it.categoria !== "SEC") {
          const e = c.expositores.find((x) => x.orador.toLowerCase() === it.orador.toLowerCase());
          if (e) { if (!e.fechas.includes(i.fecha)) e.fechas.push(i.fecha); e.cargo ||= it.cargo; e.institucion ||= it.institucion; }
          else c.expositores.push({ orador: it.orador, cargo: it.cargo, institucion: it.institucion, categoria: it.categoria, fechas: [i.fecha], planteo: it.parrafos[0] || "", videoId: i.videoId, segundos: it.segundos });
        }
      }
      for (const a of p.acuerdos) c.acuerdos.push({ texto: a.texto, fecha: i.fecha, fuente: a.fuente === "oficial" ? "Registro oficial (en el informe de sesión)" : "Transcripción de la sesión", videoId: i.videoId, segundos: a.segundos });
      for (const v of p.votaciones) c.votaciones.push({ texto: v.texto, resultado: v.resultado, fecha: i.fecha, fuente: v.fuente === "oficial" ? "Registro oficial (en el informe de sesión)" : "Transcripción de la sesión", videoId: i.videoId, segundos: v.segundos });
    }
    // Compromisos y pendientes: solo si la sesión trató únicamente este boletín (si no, no se puede atribuir).
    if (i.inf.puntos.every((p) => p.boletines.length === 0 || p.boletines.includes(b))) {
      for (const k of i.inf.compromisos) c.compromisos.push({ texto: k.texto, responsable: k.responsable, fecha: i.fecha, videoId: i.videoId, segundos: k.segundos });
      for (const t of i.inf.pendientes) if (!c.pendientes.includes(t)) c.pendientes.push(t);
    }
    // Tiempo: ventana del punto del boletín en el video, desde la primera intervención del punto hasta la primera de otro punto.
    const t = await leerDoc(`analisis_videos_sesion/${i.videoId}__t`).catch(() => null);
    const segmentos = (Array.isArray(t?.partes) ? t!.partes : []).filter((p: any) => p?.disponible).flatMap((p: any) => p.segmentos || []);
    if (segmentos.length) {
      const propios = puntos.flatMap((p) => p.intervenciones.map((x) => x.segundos));
      const ajenos = i.inf.puntos.filter((p) => !puntos.includes(p)).flatMap((p) => p.intervenciones.map((x) => x.segundos));
      const ini = propios.length ? Math.min(...propios) : 0;
      const finPropio = propios.length ? Math.max(...propios) : Infinity;
      const sigAjeno = ajenos.filter((s) => s > finPropio).sort((x, y) => x - y)[0];
      const fin = puntos.length === i.inf.puntos.length ? Infinity : (sigAjeno ?? Infinity);
      const { total, porOrador } = tiempoEnVentana(segmentos, ini, fin);
      const min = Math.round(total / 60);
      c.estadistica.minutosDiscusion = (c.estadistica.minutosDiscusion || 0) + min;
      c.estadistica.minutosPorSesion.push({ fecha: i.fecha, minutos: min });
      const mc = (minutosPorCat[c.clave] ||= {});
      for (const o of porOrador.values()) {
        const cat = categoriaDe.get(o.nombre.toLowerCase()) || (/no identificad/i.test(o.nombre) ? "ND" : categoriaFinal("", o.nombre, "", ""));
        mc[cat] = (mc[cat] || 0) + o.segundos / 60;
        const e = c.estadistica.oradores.find((x) => x.nombre.toLowerCase() === o.nombre.toLowerCase());
        if (e) { e.minutos += o.segundos / 60; e.intervenciones += o.intervenciones; }
        else c.estadistica.oradores.push({ nombre: o.nombre, categoria: cat, minutos: o.segundos / 60, intervenciones: o.intervenciones });
      }
    }
  }
  for (const c of comisiones) {
    c.sesiones.sort((x, y) => x.fecha.localeCompare(y.fecha));
    c.programadas = Array.from(new Set(c.programadas)).sort();
    c.estadistica.diasEnComision = c.desde && c.hasta ? dias(c.desde, c.hasta) + 1 : null;
    c.estadistica.minutosPorCategoria = Object.fromEntries(Object.entries(minutosPorCat[c.clave] || {}).map(([k, v]) => [k, Math.round(v)]));
    c.estadistica.oradores = c.estadistica.oradores.map((o) => ({ ...o, minutos: Math.round(o.minutos) })).sort((x, y) => y.minutos - x.minutos).slice(0, 12);
    c.estadistica.minutosPorSesion.sort((x, y) => x.fecha.localeCompare(y.fecha));
    c.informeOficial = informesOficiales.find((i) => normComision(i.titulo).includes(normComision(c.nombre)) || mismaComision(i.titulo, c.nombre)) || null;
    // Acuerdos sin repetir (mismo texto el mismo día).
    const vistos = new Set<string>();
    c.acuerdos = c.acuerdos.filter((a) => { const k = `${a.fecha}|${a.texto.toLowerCase().slice(0, 80)}`; if (vistos.has(k)) return false; vistos.add(k); return true; });
  }
  // Comisiones que solo aparecen en un informe oficial (sesiones antiguas no registradas).
  for (const i of informesOficiales) {
    if (comisiones.some((c) => c.informeOficial?.url === i.url)) continue;
    const m = i.titulo.match(/comisi[oó]n(?:es)?\s+(?:unidas\s+)?(?:de\s+|del\s+)?([^,.;]+)/i);
    if (!m) continue;
    const c = obtener(`Comisión de ${m[1].trim()}`, "");
    c.informeOficial = i;
    const f = isoDe(i.fecha);
    if (f) { c.hasta = c.hasta && c.hasta > f ? c.hasta : f; c.desde = c.desde || f; }
  }
  comisiones.sort((x, y) => String(x.desde || "9999").localeCompare(String(y.desde || "9999")));

  const salaEventos = sala.map((s: any) => ({
    fecha: s.fecha, camara: s.camara, numero: s.numero,
    detalle: [s.puntos.filter((p: any) => p.boletin === b).map((p: any) => `En tabla${p.parte ? ` (${p.parte.toLowerCase()})` : ""}${p.quorum ? ` · ${p.quorum}` : ""}`).join(" · "),
      ...s.votaciones.filter((v: any) => v.boletin === b).map((v: any) => `Votación: ${v.resultado} (Sí ${v.si}, No ${v.no}, Abst. ${v.abstencion})`)].filter(Boolean).join(" · "),
  })).sort((x: any, y: any) => x.fecha.localeCompare(y.fecha));

  const historial: HistorialProyecto = { disponible: comisiones.length > 0 || salaEventos.length > 0, boletin: b, firma, generado: new Date().toISOString(), comisiones, sala: salaEventos };
  if (!historial.disponible) historial.motivo = "No hay sesiones de comisión ni de Sala registradas para este boletín.";

  // --- Lectura de cada comisión con IA: informe oficial (fuente principal) + informes de sesión ---
  const S = (type: string, extra: any = {}) => ({ type, ...extra });
  const esquema = S("OBJECT", { properties: {
    objetivo: S("STRING"),
    sesiones: S("ARRAY", { items: S("STRING") }),
    expositores: S("ARRAY", { items: S("OBJECT", { properties: { nombre: S("STRING"), cargo: S("STRING"), institucion: S("STRING"), categoria: S("STRING", { enum: ["ESP", "ESC", "EEA"] }), planteo: S("STRING") }, required: ["nombre", "categoria"] }) }),
    votaciones: S("ARRAY", { items: S("OBJECT", { properties: { texto: S("STRING"), resultado: S("STRING"), fecha: S("STRING") }, required: ["texto", "resultado"] }) }),
    temas: S("ARRAY", { items: S("OBJECT", { properties: { tema: S("STRING"), detalle: S("STRING"), fechas: S("ARRAY", { items: S("STRING") }), estado: S("STRING", { enum: ["resuelto", "pendiente", "en debate"] }), actores: S("ARRAY", { items: S("STRING") }), votaciones: S("ARRAY", { items: S("STRING") }) }, required: ["tema", "detalle", "estado"] }) }),
    posiciones: S("ARRAY", { items: S("OBJECT", { properties: { actor: S("STRING"), postura: S("STRING"), fecha: S("STRING") }, required: ["actor", "postura"] }) }),
    contrapuntos: S("ARRAY", { items: S("OBJECT", { properties: { tema: S("STRING"), aFavor: S("ARRAY", { items: S("STRING") }), enContra: S("ARRAY", { items: S("STRING") }), fecha: S("STRING") }, required: ["tema", "aFavor", "enContra"] }) }),
    cierre: S("OBJECT", { properties: { recibio: S("STRING"), despacho: S("STRING"), cambios: S("STRING"), pendientes: S("ARRAY", { items: S("STRING") }) } }),
  }, required: ["temas"] });
  const txt = (v: any) => String(v ?? "").replace(/\s+/g, " ").trim();
  const motivosIA: string[] = [];
  let objetivoOficial = "";
  await Promise.all(comisiones.filter((c) => c.estadistica.sesionesConInforme > 0 || c.informeOficial || (c.actas || []).length).map(async (c) => {
    const actasCom = actas.filter((a) => mismaComision(a.comision, c.nombre)).slice(-8);
    const textoActas = actasCom.map((a) => [
      a.texto ? `### Acta de la sesión ${a.numero ? `N° ${a.numero} ` : ""}del ${a.fecha}\n${tramoDeBoletin(a.texto, b, 12000)}` : "",
      a.cuenta && a.cuenta.includes(b.split("-")[0].slice(-3)) ? `### Cuenta de la sesión del ${a.fecha} (documentos recibidos)\n${tramoDeBoletin(a.cuenta, b, 3000)}` : "",
    ].filter(Boolean).join("\n")).join("\n\n").slice(0, 60000);
    const oficial = c.informeOficial ? await textoInformeOficial(c.informeOficial.url) : { texto: "" };
    if (c.informeOficial && !oficial.texto) motivosIA.push(`${c.nombre}: ${oficial.motivo}`);
    const ses = informes.filter((i) => mismaComision(i.comision, c.nombre));
    const textoSes = ses.map((i) => {
      const pts = i.inf.puntos.filter((p) => p.boletines.includes(b) || i.inf.puntos.length === 1);
      return `### Sesión ${i.fecha}\n${pts.map((p) => [p.sintesis, ...p.intervenciones.map((x) => `- ${x.orador}${x.cargo ? ` (${x.cargo}${x.institucion ? `, ${x.institucion}` : ""})` : ""} [${x.categoria}]: ${x.parrafos.join(" ").slice(0, 900)}`), ...p.acuerdos.map((a) => `Acuerdo: ${a.texto}`), ...p.votaciones.map((v) => `Votación: ${v.texto}: ${v.resultado}`)].filter(Boolean).join("\n")).join("\n")}`;
    }).join("\n\n").slice(0, 40000);
    if (!oficial.texto && !textoSes && !textoActas) return;
    const prompt = `Eres asesor parlamentario de la Biblioteca del Congreso Nacional de Chile. Lee el material sobre el boletín ${b} en la ${c.nombre}
y extrae su historial en esa comisión, usando EXCLUSIVAMENTE ese material. No agregues nada externo. Redacción neutral, tercera persona, sin adjetivos valorativos.
- "objetivo": el objetivo del proyecto tal como lo describe el informe oficial (2 a 4 oraciones); vacío si no hay informe oficial.
- "sesiones": fechas (AAAA-MM-DD) de las sesiones que la comisión dedicó al proyecto, según el informe (p. ej. la sección "Acordado") o los informes de sesión.
- "expositores": personas que expusieron que NO son parlamentarios: nombre, cargo, institución y categoría:
   ESP = sector público (cargo en representación del Estado o misión diplomática); ESC = sociedad civil (ONG, partido, fundación, gremio, sindicato, asociación, empresa);
   EEA = expertos y académicos (incluida la Biblioteca del Congreso Nacional). "planteo": lo principal que planteó, en 1 a 2 oraciones.
- "votaciones": cada votación (en general, en particular, indicaciones) con su resultado y votos si se indican, y la fecha si se indica.
- "temas": 3 a 6 temas del debate (1 a 2 oraciones), con fechas si se conocen, su estado ("resuelto", "pendiente", "en debate"),
   "actores": nombres de las personas que hablaron de ese tema (tal como aparecen) y "votaciones": textos de las votaciones que lo resolvieron.
- "posiciones": posturas de los PARLAMENTARIOS (actor y postura en una oración, con fecha si se conoce).
- "contrapuntos": solo temas con posturas opuestas de personas identificadas.
- "cierre" (solo con informe oficial): con qué texto recibió el proyecto, qué despachó (votación final), qué cambió en esta comisión y qué quedó pendiente.

${oficial.texto ? `INFORME OFICIAL DE LA COMISIÓN (${c.informeOficial!.titulo}):\n${oficial.texto}\n\n` : ""}${textoActas ? `ACTAS OFICIALES DE LAS SESIONES (solo lo relativo a este boletín):\n${textoActas}\n\n` : ""}${textoSes ? `INFORMES DE SESIÓN (desde las transcripciones):\n${textoSes}` : ""}`;
    const r = await geminiJSON(prompt, esquema, { maxTokens: 12000, presupuestoMs: 140_000 });
    if (r.ok === false) { motivosIA.push(`${c.nombre}: ${(r as any).motivo}`); return; }
    const d: any = (r as any).datos;
    const corpus = `${oficial.texto}\n${textoActas}\n${textoSes}`;
    // Sesiones del informe oficial (solo fechas que aparecen en el texto) se suman a las del registro.
    for (const f of (d.sesiones || []).map(txt)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || !(fechaEnTexto(f, corpus) || ses.some((i) => i.fecha === f))) continue;
      if (!c.sesiones.some((x) => x.fecha === f)) c.sesiones.push({ fecha: f });
      if (!c.desde || f < c.desde) c.desde = f;
      if (!c.hasta || f > c.hasta) c.hasta = f;
    }
    // Expositores del informe oficial (nombre presente en el texto), sin duplicar los de las transcripciones.
    for (const e of d.expositores || []) {
      const nombre = txt(e?.nombre);
      if (!nombre || !nombreEnTexto(nombre, corpus)) continue;
      const cat = categoriaFinal(e?.categoria, nombre, txt(e?.cargo), txt(e?.institucion));
      if (cat === "PARL") continue;
      const ya = c.expositores.find((x) => nombreEnTexto(x.orador, nombre) || nombreEnTexto(nombre, x.orador));
      if (ya) { ya.cargo ||= txt(e?.cargo); ya.institucion ||= txt(e?.institucion); if (!ya.planteo) ya.planteo = txt(e?.planteo); continue; }
      c.expositores.push({ orador: nombre, cargo: txt(e?.cargo), institucion: txt(e?.institucion), categoria: cat, fechas: [], planteo: txt(e?.planteo) });
    }
    for (const v of d.votaciones || []) {
      const t = txt(v?.texto), res = txt(v?.resultado);
      if (!t || !res) continue;
      const f = txt(v?.fecha);
      if (c.votaciones.some((x) => x.texto.toLowerCase() === t.toLowerCase())) continue;
      c.votaciones.push({ texto: t, resultado: res, fecha: /^\d{4}-\d{2}-\d{2}$/.test(f) ? f : (c.hasta || ""), fuente: oficial.texto ? "Informe oficial de la comisión" : textoActas ? "Actas oficiales de sesión" : "Informes de sesión" });
    }
    const fechas = new Set(c.sesiones.map((x) => x.fecha));
    c.temas = (d.temas || []).map((t: any, k: number) => ({ id: `${c.clave}-t${k}`, tema: txt(t?.tema), detalle: txt(t?.detalle), fechas: (t?.fechas || []).map(txt).filter((f: string) => fechas.has(f)), estado: txt(t?.estado),
      actores: (t?.actores || []).map(txt).filter((n: string) => n && nombreEnTexto(n, corpus)), votacionesRel: (t?.votaciones || []).map(txt).filter(Boolean) })).filter((t: any) => t.tema && t.detalle);
    c.posiciones = (d.posiciones || []).map((p: any) => ({ actor: txt(p?.actor), postura: txt(p?.postura), fecha: fechas.has(txt(p?.fecha)) ? txt(p?.fecha) : "" }))
      .filter((p: any) => p.actor && p.postura && nombreEnTexto(p.actor, corpus));
    c.contrapuntos = (d.contrapuntos || []).map((p: any) => ({ tema: txt(p?.tema), aFavor: (p?.aFavor || []).map(txt).filter((n: string) => n && nombreEnTexto(n, corpus)), enContra: (p?.enContra || []).map(txt).filter((n: string) => n && nombreEnTexto(n, corpus)), fecha: fechas.has(txt(p?.fecha)) ? txt(p?.fecha) : "" }))
      .filter((p: any) => p.tema && p.aFavor.length && p.enContra.length);
    const ci = d.cierre || {};
    c.cierre = oficial.texto && (txt(ci.despacho) || txt(ci.cambios)) ? { recibio: txt(ci.recibio), despacho: txt(ci.despacho), cambios: txt(ci.cambios), pendientes: (ci.pendientes || []).map(txt).filter(Boolean) } : null;
    if (!objetivoOficial && oficial.texto && txt(d.objetivo)) objetivoOficial = txt(d.objetivo);
  }));
  // Recalcula fechas y cobertura con las sesiones del informe oficial.
  for (const c of comisiones) {
    c.sesiones.sort((x, y) => x.fecha.localeCompare(y.fecha));
    c.estadistica.sesionesCitadas = Math.max(c.estadistica.sesionesCitadas, c.sesiones.filter((x) => x.fecha <= H).length);
    c.estadistica.diasEnComision = c.desde && c.hasta ? dias(c.desde, c.hasta) + 1 : null;
  }
  comisiones.sort((x, y) => String(x.desde || "9999").localeCompare(String(y.desde || "9999")));
  historial.objetivoOficial = objetivoOficial || undefined;
  historial.sintesisIA = motivosIA.length ? { disponible: false, motivo: motivosIA.join(" | ") } : { disponible: true };
  // --- Personas: la misma persona en todas las fuentes, con su historial de cargos (el cargo puede cambiar en el tiempo) ---
  const obs: ObservacionPersona[] = [];
  for (const i of informes) {
    let pts = i.inf.puntos.filter((p) => p.boletines.includes(b));
    if (pts.length === 0 && i.inf.puntos.length === 1) pts = i.inf.puntos;
    for (const p of pts) for (const it of p.intervenciones) obs.push({ nombre: it.orador, cargo: it.cargo, institucion: it.institucion, categoria: it.categoria, fecha: i.fecha, comision: i.comision, contexto: i.videoId, texto: it.parrafos.join(" ").slice(0, 700), videoId: i.videoId, segundos: it.segundos, fuente: "Transcripción de la sesión" });
  }
  for (const c of comisiones) {
    for (const e of c.expositores) if (!e.videoId) obs.push({ nombre: e.orador, cargo: e.cargo, institucion: e.institucion, categoria: e.categoria, fecha: c.desde || undefined, comision: c.nombre, contexto: c.informeOficial?.url, texto: e.planteo, fuente: "Informe oficial de la comisión" });
    for (const p of c.posiciones || []) obs.push({ nombre: p.actor, categoria: "PARL", fecha: p.fecha || c.hasta || undefined, comision: c.nombre, contexto: c.informeOficial?.url || c.clave, texto: p.postura, fuente: c.informeOficial ? "Informe oficial (síntesis con IA)" : "Informes de sesión (síntesis con IA)" });
  }
  historial.personas = unirPersonas(obs);
  for (const c of comisiones) for (const t of c.temas || []) {
    t.actoresIds = Array.from(new Set((t.actores || []).map((n) => buscarPersona(historial.personas!, n)?.id).filter(Boolean) as string[]));
  }

  // Hilo de temas entre comisiones (si hay más de una con temas).
  const conTemas = comisiones.filter((c) => (c.temas || []).length);
  if (conTemas.length >= 2) {
    const r = await geminiJSON(`Con estos temas por comisión del boletín ${b}, indica los temas que aparecen en más de una comisión y su estado en cada una. Usa solo esta información.\n\n${conTemas.map((c) => `${c.nombre}:\n${c.temas!.map((t) => `- ${t.tema} (${t.estado}; ${t.fechas.join(", ")}): ${t.detalle}`).join("\n")}`).join("\n\n")}`,
      S("OBJECT", { properties: { hilo: S("ARRAY", { items: S("OBJECT", { properties: { tema: S("STRING"), pasos: S("ARRAY", { items: S("OBJECT", { properties: { comision: S("STRING"), fecha: S("STRING"), estado: S("STRING") }, required: ["comision", "estado"] }) }) }, required: ["tema", "pasos"] }) }) } }),
      { maxTokens: 3000, presupuestoMs: 40_000 });
    if (r.ok) {
      const nombres = comisiones.map((c) => c.nombre);
      historial.hilo = ((r as any).datos?.hilo || []).map((h: any) => ({ tema: txt(h?.tema), pasos: (h?.pasos || []).map((p: any) => ({ comision: txt(p?.comision), fecha: txt(p?.fecha), estado: txt(p?.estado) })).filter((p: any) => nombres.some((n) => mismaComision(n, p.comision))) }))
        .filter((h: any) => h.tema && h.pasos.length >= 2);
    }
  }
  await escribirDoc(`historial_proyectos/${b}`, { boletinId: b, historial, updatedAt: new Date().toISOString() }).catch(() => undefined);
  return historial;
}
