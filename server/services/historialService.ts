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
import { normalizarBoletin } from "../../src/utils/boletines";
import { normalizarInforme, categoriaFinal } from "../../src/utils/informeSesion";
import { type ComisionHistorial, type HistorialProyecto, tiempoEnVentana, normComision } from "../../src/utils/historial";

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

/** Texto útil de un informe oficial de comisión (objetivo, debate, votaciones, resumen ejecutivo), recortado. */
async function extractoInformeOficial(url: string): Promise<string> {
  const texto = await conTiempo(fetchTextoInformeDocx(url), 20000, null);
  if (!texto) return "";
  const secs = seccionesInforme(texto, 0);
  const partes: string[] = [];
  for (const s of secs) {
    if (!/OBJETIVO|ASPECTOS CENTRALES|DISCUSI|VOTACI|ACORDAD|RESUMEN EJECUTIVO|MODIFICACIONES/i.test(s.titulo)) continue;
    const max = /RESUMEN EJECUTIVO|ASPECTOS CENTRALES|OBJETIVO/i.test(s.titulo) ? 2500 : 3500;
    partes.push(`## ${s.titulo}\n${texto.slice(s.inicio, s.inicio + Math.min(s.largo, max)).trim()}`);
  }
  return partes.join("\n\n").slice(0, 14000);
}

export async function construirHistorial(boletin: string, opciones: { forzar?: boolean; soloGuardado?: boolean } = {}): Promise<HistorialProyecto> {
  const b = normalizarBoletin(boletin);
  if (!b.includes("-")) return { disponible: false, motivo: "Número de boletín no válido.", boletin: b, comisiones: [], sala: [] };
  const [registro, informes, sala, discusion] = await Promise.all([
    conTiempo(sesionesRegistradasDeBoletin(b), 15000, []),
    conTiempo(informesDeSesion(b), 15000, [] as InformeSesionLeido[]),
    conTiempo(sesionesSalaDeBoletin(b), 10000, []),
    conTiempo(discusionDeProyecto(b), 25000, { disponible: false, informes: [] } as any),
  ]);
  const informesOficiales: { titulo: string; url: string; fecha?: string }[] = (discusion?.informes || []).map((i: any) => ({ titulo: i.titulo, url: i.url, fecha: i.fecha }));
  const firma = [
    registro.map((s) => `${s.id}:${s.resultado ? 1 : 0}`).sort().join(","),
    informes.map((i) => `${i.videoId}:${i.inf.generado || ""}`).sort().join(","),
    informesOficiales.map((i) => i.url).sort().join(","),
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

  // --- Síntesis con IA (temas, posiciones, contrapuntos, cierre, hilo) ---
  const conMaterial = comisiones.filter((c) => c.estadistica.sesionesConInforme > 0 || c.informeOficial);
  if (conMaterial.length) {
    const bloques: string[] = [];
    for (const c of conMaterial) {
      const ses = informes.filter((i) => mismaComision(i.comision, c.nombre));
      const textoSes = ses.map((i) => {
        const pts = i.inf.puntos.filter((p) => p.boletines.includes(b) || i.inf.puntos.length === 1);
        return `### Sesión ${i.fecha}\n${pts.map((p) => [p.sintesis, ...p.intervenciones.map((x) => `- ${x.orador}${x.cargo ? ` (${x.cargo}${x.institucion ? `, ${x.institucion}` : ""})` : ""} [${x.categoria}]: ${x.parrafos.join(" ").slice(0, 900)}`), ...p.acuerdos.map((a) => `Acuerdo: ${a.texto}`), ...p.votaciones.map((v) => `Votación: ${v.texto}: ${v.resultado}`)].filter(Boolean).join("\n")).join("\n")}`;
      }).join("\n\n").slice(0, 40000);
      const oficial = c.informeOficial ? await extractoInformeOficial(c.informeOficial.url) : "";
      bloques.push(`=== COMISIÓN: ${c.nombre} (clave: ${c.clave}) · sesiones con fecha: ${c.sesiones.map((s) => s.fecha).join(", ") || "sin fecha"} ===\n${oficial ? `INFORME OFICIAL DE LA COMISIÓN (${c.informeOficial!.titulo}):\n${oficial}\n\n` : ""}${textoSes ? `INFORMES DE SESIÓN (desde las transcripciones):\n${textoSes}` : ""}`);
    }
    const S = (type: string, extra: any = {}) => ({ type, ...extra });
    const esquema = S("OBJECT", { properties: {
      comisiones: S("ARRAY", { items: S("OBJECT", { properties: {
        clave: S("STRING"),
        temas: S("ARRAY", { items: S("OBJECT", { properties: { tema: S("STRING"), detalle: S("STRING"), fechas: S("ARRAY", { items: S("STRING") }), estado: S("STRING", { enum: ["resuelto", "pendiente", "en debate"] }) }, required: ["tema", "detalle", "fechas", "estado"] }) }),
        posiciones: S("ARRAY", { items: S("OBJECT", { properties: { actor: S("STRING"), postura: S("STRING"), fecha: S("STRING") }, required: ["actor", "postura", "fecha"] }) }),
        contrapuntos: S("ARRAY", { items: S("OBJECT", { properties: { tema: S("STRING"), aFavor: S("ARRAY", { items: S("STRING") }), enContra: S("ARRAY", { items: S("STRING") }), fecha: S("STRING") }, required: ["tema", "aFavor", "enContra", "fecha"] }) }),
        cierre: S("OBJECT", { properties: { recibio: S("STRING"), despacho: S("STRING"), cambios: S("STRING"), pendientes: S("ARRAY", { items: S("STRING") }) } }),
      }, required: ["clave", "temas"] }) }),
      hilo: S("ARRAY", { items: S("OBJECT", { properties: { tema: S("STRING"), pasos: S("ARRAY", { items: S("OBJECT", { properties: { comision: S("STRING"), fecha: S("STRING"), estado: S("STRING") }, required: ["comision", "fecha", "estado"] }) }) }, required: ["tema", "pasos"] }) }),
    }, required: ["comisiones"] });
    const prompt = `Eres asesor parlamentario de la Biblioteca del Congreso Nacional de Chile. Arma el historial del boletín ${b} por comisión,
usando EXCLUSIVAMENTE el material que sigue (informes oficiales de comisión e informes de sesión hechos desde las transcripciones). No agregues nada externo.
Redacción neutral, en tercera persona y sin adjetivos valorativos; toda postura atribuida a quien la expresó.
Por cada comisión (usa su "clave"):
- "temas": 3 a 6 temas del debate, cada uno con 1 a 2 oraciones, las fechas (AAAA-MM-DD) de las sesiones donde se trató (solo fechas listadas para esa comisión) y su estado ("resuelto", "pendiente", "en debate").
- "posiciones": posturas de los PARLAMENTARIOS (actor y postura en una oración, con fecha).
- "contrapuntos": solo temas donde hay posturas opuestas expresadas por personas identificadas (quiénes a favor, quiénes en contra). Si no hay, lista vacía.
- "cierre": solo si hay INFORME OFICIAL: con qué texto recibió el proyecto, qué despachó (y votación final), qué cambió en esa comisión, y qué quedó pendiente. Si no hay informe oficial, deja los campos vacíos.
"hilo": temas que aparecen en más de una comisión, con cada paso (comisión, fecha, estado).

${bloques.join("\n\n")}`;
    const r = await geminiJSON(prompt, esquema, { maxTokens: 12000, presupuestoMs: 150_000 });
    if (r.ok === false) historial.sintesisIA = { disponible: false, motivo: (r as any).motivo };
    else {
      const d: any = (r as any).datos;
      const txt = (v: any) => String(v ?? "").replace(/\s+/g, " ").trim();
      for (const x of Array.isArray(d?.comisiones) ? d.comisiones : []) {
        const c = comisiones.find((k) => k.clave === txt(x?.clave));
        if (!c) continue;
        const fechas = new Set(c.sesiones.map((s) => s.fecha));
        if (c.informeOficial?.fecha) fechas.add(isoDe(c.informeOficial.fecha));
        c.temas = (x.temas || []).map((t: any) => ({ tema: txt(t?.tema), detalle: txt(t?.detalle), fechas: (t?.fechas || []).map(txt).filter((f: string) => fechas.has(f)), estado: txt(t?.estado) }))
          .filter((t: any) => t.tema && t.detalle && (t.fechas.length || c.informeOficial));
        c.posiciones = (x.posiciones || []).map((p: any) => ({ actor: txt(p?.actor), postura: txt(p?.postura), fecha: txt(p?.fecha) })).filter((p: any) => p.actor && p.postura && (fechas.has(p.fecha) || c.informeOficial));
        c.contrapuntos = (x.contrapuntos || []).map((p: any) => ({ tema: txt(p?.tema), aFavor: (p?.aFavor || []).map(txt).filter(Boolean), enContra: (p?.enContra || []).map(txt).filter(Boolean), fecha: txt(p?.fecha) }))
          .filter((p: any) => p.tema && p.aFavor.length && p.enContra.length);
        const ci = x.cierre || {};
        c.cierre = c.informeOficial && (txt(ci.despacho) || txt(ci.cambios)) ? { recibio: txt(ci.recibio), despacho: txt(ci.despacho), cambios: txt(ci.cambios), pendientes: (ci.pendientes || []).map(txt).filter(Boolean) } : null;
      }
      const nombres = comisiones.map((c) => c.nombre);
      historial.hilo = (Array.isArray(d?.hilo) ? d.hilo : []).map((h: any) => ({ tema: txt(h?.tema), pasos: (h?.pasos || []).map((p: any) => ({ comision: txt(p?.comision), fecha: txt(p?.fecha), estado: txt(p?.estado) })).filter((p: any) => nombres.some((n) => mismaComision(n, p.comision))) }))
        .filter((h: any) => h.tema && h.pasos.length >= 2);
      historial.sintesisIA = { disponible: true, modelo: (r as any).modelo };
    }
  }
  await escribirDoc(`historial_proyectos/${b}`, { boletinId: b, historial, updatedAt: new Date().toISOString() }).catch(() => undefined);
  return historial;
}
