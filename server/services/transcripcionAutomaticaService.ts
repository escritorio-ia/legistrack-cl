/**
 * Transcripción automática de sesiones de comisión, en segundo plano.
 *
 * Cada llamada a `pasoTranscripcionAutomatica()` hace UNA unidad de trabajo (cabe en el límite de 5 min de Vercel):
 *  1) continúa la sesión que se está transcribiendo (1 o 2 tramos de 10 min), o
 *  2) redacta el informe de una sesión ya transcrita (si TRANSCRIPCION_AUTO_INFORME=1), o
 *  3) toma la siguiente sesión realizada del registro oficial, de la más reciente hacia atrás, busca su video
 *     en el canal oficial (solo si el título menciona la fecha) y empieza a transcribirla.
 * El avance queda en Firestore ("cola_transcripcion") y la transcripción en el mismo documento que usa la app
 * (`analisis_videos_sesion/<videoId>__t`), así que aparece en la comisión y en los proyectos de la tabla.
 * Un tope diario de tramos (TRANSCRIPCION_AUTO_MAX_TRAMOS_DIA) controla el gasto de Gemini.
 */
import { conexionFirestore, leerDoc, escribirDoc, consultar, camposAObjeto } from "./firestoreRest";
import { combinarSesion, unirSesionesLeidas, type SesionRegistrada } from "./registroSesionesService";
import { buscarVideosSesion, detallesVideos, transcribirParteVideo, SEGUNDOS_POR_PARTE_TRANSCRIPCION, youtubeApiConfigurada } from "./youtubeService";
import { generarInformeSesion } from "./informeSesionService";
import * as senado from "./senadoService";
import { fichaEjecutivaProyecto, procesarPresentacionesPendientes } from "./senadoService";
import { resumenComisionesBoletin } from "./resumenBoletinService";
import { construirHistorial } from "./historialService";
import { boletinesEnTexto } from "../../src/utils/boletines";

const COLA = "cola_transcripcion";
const VIDEOS = "analisis_videos_sesion";
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function hoyChileISO(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
const sumarDias = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export function configuracionAuto() {
  return {
    activa: /^(1|true|si|sí|on)$/i.test(String(process.env.TRANSCRIPCION_AUTO || "").trim().replace(/^["']|["']$/g, "")),
    maxTramosDia: Math.max(1, Number(process.env.TRANSCRIPCION_AUTO_MAX_TRAMOS_DIA) || 60),
    informe: /^(1|true|si|sí|on)$/i.test(String(process.env.TRANSCRIPCION_AUTO_INFORME || "").trim().replace(/^["']|["']$/g, "")),
    desde: /^\d{4}-\d{2}-\d{2}$/.test(process.env.TRANSCRIPCION_AUTO_DESDE || "") ? process.env.TRANSCRIPCION_AUTO_DESDE! : "2026-01-01",
  };
}

/** ¿El título del video menciona la fecha de la sesión? ("3 de noviembre", "03-11-2026", "3/11/2026"). */
export function tituloConFecha(titulo: string, fechaISO: string): boolean {
  const [a, m, d] = fechaISO.split("-").map(Number);
  if (!a || !m || !d) return false;
  const t = norm(titulo);
  return new RegExp(`(^|\\D)0?${d}\\s+(de\\s+)?${MESES[m - 1]}`).test(t) || new RegExp(`(^|\\D)0?${d}[-/.]0?${m}[-/.](${a}|${String(a).slice(2)})(\\D|$)`).test(t);
}

interface Trabajo {
  id: string; estado: string; camara: string; comision: string; comisionId?: string; fecha: string; hora?: string | null;
  boletines: string[]; tabla: string[]; videoId?: string; titulo?: string; duracion?: number | null; total?: number;
  intentos?: number; error?: string; reintentarDesde?: string;
}

async function contadorDia(): Promise<{ ruta: string; tramos: number }> {
  const ruta = `${COLA}/_contador_${hoyChileISO()}`;
  const d = await leerDoc(ruta).catch(() => null);
  return { ruta, tramos: Number(d?.tramos) || 0 };
}

async function leerTranscripcion(videoId: string): Promise<{ partes: any[]; completo: boolean; boletines: string[] }> {
  const d = await leerDoc(`${VIDEOS}/${videoId}__t`).catch(() => null);
  return { partes: Array.isArray(d?.partes) ? d!.partes : [], completo: !!d?.completo, boletines: Array.isArray(d?.boletines) ? d!.boletines : [] };
}

async function guardarTrabajo(t: Trabajo, cambios: Partial<Trabajo>) {
  Object.assign(t, cambios);
  await escribirDoc(`${COLA}/${t.id}`, { ...t, actualizado: new Date().toISOString() });
}

/** Siguiente sesión realizada del registro (de la más reciente hacia atrás) que aún no está en la cola. */
async function siguienteSesion(): Promise<SesionRegistrada | null> {
  const { base, proy, key } = conexionFirestore();
  const { desde } = configuracionAuto();
  let hasta = sumarDias(hoyChileISO(), -1);
  for (let pagina = 0; pagina < 15 && hasta >= desde; pagina++) {
    const filas = await consultar({
      from: [{ collectionId: "registro_sesiones" }],
      where: { compositeFilter: { op: "AND", filters: [
        { fieldFilter: { field: { fieldPath: "fecha" }, op: "LESS_THAN_OR_EQUAL", value: { stringValue: hasta } } },
        { fieldFilter: { field: { fieldPath: "fecha" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: desde } } },
      ] } },
      orderBy: [{ field: { fieldPath: "fecha" }, direction: "DESCENDING" }],
      limit: 100,
    });
    if (filas.length === 0) return null;
    const sesiones = unirSesionesLeidas(filas.map((f) => combinarSesion(f.id, f.datos)))
      .filter((s) => s.camara && s.comisionNombre)
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || String(b.hora || "").localeCompare(String(a.hora || "")));
    // ¿Cuáles ya están en la cola?
    const r = await fetch(`${base}:batchGet?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents: sesiones.map((s) => `projects/${proy}/databases/(default)/documents/${COLA}/${s.id}`) }),
      signal: AbortSignal.timeout(15000),
    });
    const existentes = new Set<string>();
    if (r.ok) for (const x of (await r.json()) as any[]) if (x.found) existentes.add(String(x.found.name).split("/").pop());
    const libre = sesiones.find((s) => !existentes.has(s.id));
    if (libre) return libre;
    const ultima = sesiones[sesiones.length - 1]?.fecha || filas.map((f) => camposAObjeto(f.datos).fecha).sort()[0];
    if (!ultima || ultima >= hasta) hasta = sumarDias(hasta, -1); else hasta = ultima;
    if (filas.length < 100) hasta = sumarDias(ultima || hasta, -1);
  }
  return null;
}

/** Sesiones sin video encontrado recientes (los videos a veces se publican días después): se reintentan. */
async function trabajoParaReintentar(): Promise<Trabajo | null> {
  const hoy = hoyChileISO();
  const filas = await consultar({ from: [{ collectionId: COLA }], where: { fieldFilter: { field: { fieldPath: "estado" }, op: "EQUAL", value: { stringValue: "sin_video" } } }, limit: 50 });
  const t = filas.map((f) => ({ id: f.id, ...camposAObjeto(f.datos) } as Trabajo))
    .find((x) => x.reintentarDesde && x.reintentarDesde <= hoy && x.fecha >= sumarDias(hoy, -10));
  return t || null;
}

async function trabajoEnEstado(estado: string): Promise<Trabajo | null> {
  const filas = await consultar({ from: [{ collectionId: COLA }], where: { fieldFilter: { field: { fieldPath: "estado" }, op: "EQUAL", value: { stringValue: estado } } }, limit: 1 });
  return filas[0] ? ({ id: filas[0].id, ...camposAObjeto(filas[0].datos) } as Trabajo) : null;
}

async function buscarVideo(t: Trabajo): Promise<string | null> {
  const camaraYT = /senado/i.test(t.camara) ? "senado" : "diputados";
  const videos = await buscarVideosSesion(t.comision, t.fecha, camaraYT as any);
  const v = videos.find((x) => tituloConFecha(x.title, t.fecha));
  if (!v) return null;
  const det = (await detallesVideos([v.id]).catch(() => ({} as any)))[v.id];
  const duracion = det?.segundos ?? v.segundos ?? null;
  await guardarTrabajo(t, { videoId: v.id, titulo: v.title, duracion, total: duracion ? Math.max(1, Math.ceil(duracion / SEGUNDOS_POR_PARTE_TRANSCRIPCION)) : 1, estado: "transcribiendo", intentos: 0, error: "" });
  return v.id;
}

/** Gemini sin saldo (prepago agotado o facturación): no es culpa de la sesión, no debe contar como intento. */
export const esSinCredito = (m?: string) => /HTTP 402|credits are depleted|billing|RESOURCE_EXHAUSTED.*prepay/i.test(String(m || ""));
const PAUSA_SIN_CREDITO_MS = 60 * 60 * 1000;
async function pausarPorCredito(motivo: string) {
  await escribirDoc(`${COLA}/_control`, { sinCreditoHasta: new Date(Date.now() + PAUSA_SIN_CREDITO_MS).toISOString(), sinCreditoMotivo: motivo.slice(0, 300) }).catch(() => undefined);
}
class SinCredito extends Error {}

/** Sesiones que quedaron en "error" solo por falta de saldo en Gemini: vuelven a la cola. */
async function recuperarErroresPorCredito(): Promise<number> {
  const filas = await consultar({ from: [{ collectionId: COLA }], where: { fieldFilter: { field: { fieldPath: "estado" }, op: "EQUAL", value: { stringValue: "error" } } }, limit: 100 }).catch(() => []);
  let n = 0;
  for (const f of filas) {
    const t = { id: f.id, ...camposAObjeto(f.datos) } as Trabajo;
    if (!esSinCredito(t.error) || !t.videoId) continue;
    await guardarTrabajo(t, { estado: "transcribiendo", intentos: 0, error: "" });
    n++;
  }
  return n;
}

/** Transcribe los tramos que falten (hasta que se acabe el tiempo de esta llamada o el tope diario). */
async function avanzarTranscripcion(t: Trabajo, limite: number): Promise<string> {
  const previa = await leerTranscripcion(t.videoId!);
  const partes = previa.partes.filter((p) => p?.disponible);
  const total = t.total || 1;
  let hechos = 0;
  for (let parte = 0; parte < total; parte++) {
    if (partes.some((p) => p.parte === parte)) continue;
    if (Date.now() > limite) break;
    const cont = await contadorDia();
    if (cont.tramos >= configuracionAuto().maxTramosDia) return `Tope diario alcanzado (${cont.tramos} tramos).`;
    const r = await transcribirParteVideo({ videoId: t.videoId!, parte, duracion: t.duracion ?? undefined, comision: t.comision, fecha: t.fecha, materia: t.tabla.join(" ") });
    if (!r.disponible && esSinCredito(r.motivo)) {
      await guardarTrabajo(t, { error: r.motivo || "" });
      await pausarPorCredito(r.motivo || "");
      throw new SinCredito(r.motivo || "Gemini sin saldo");
    }
    if (r.disponible) await escribirDoc(cont.ruta, { tramos: cont.tramos + 1, fecha: hoyChileISO() });
    if (!r.disponible) {
      const intentos = (t.intentos || 0) + 1;
      await guardarTrabajo(t, { intentos, error: r.motivo || "No se pudo transcribir el tramo", estado: intentos >= 3 ? "error" : "transcribiendo" });
      break;
    }
    partes.push(r); partes.sort((a, b) => a.parte - b.parte); hechos++;
    const completo = partes.length >= total;
    const mencionados = boletinesEnTexto(partes.flatMap((p: any) => p.segmentos || []).map((g: any) => g.texto).join(" "));
    await escribirDoc(`${VIDEOS}/${t.videoId}__t`, {
      partes, completo, tipo: "transcripcion", videoId: t.videoId, titulo: t.titulo || "", comision: t.comision, comisionId: t.comisionId || "",
      fecha: t.fecha, duracion: t.duracion ?? null, tabla: t.tabla, boletines: Array.from(new Set([...previa.boletines, ...t.boletines, ...mencionados])),
      automatica: true, updatedAt: new Date().toISOString(),
    });
    if (completo) {
      await guardarTrabajo(t, { estado: configuracionAuto().informe ? "informe_pendiente" : "transcrita", intentos: 0, error: "" });
      return `Transcripción completa (${total} tramos).`;
    }
    if (t.intentos) await guardarTrabajo(t, { intentos: 0, error: "" });
  }
  if (partes.length >= total && t.estado === "transcribiendo") await guardarTrabajo(t, { estado: configuracionAuto().informe ? "informe_pendiente" : "transcrita" });
  return `${hechos} tramo(s) transcritos; van ${partes.length} de ${total}.`;
}

async function redactarInforme(t: Trabajo): Promise<string> {
  const previa = await leerTranscripcion(t.videoId!);
  const segmentos = previa.partes.filter((p) => p?.disponible).flatMap((p) => p.segmentos || []);
  const r = await generarInformeSesion({ segmentos, tabla: t.tabla, boletines: t.boletines, comision: t.comision, fecha: t.fecha, parcial: !previa.completo });
  if (r.disponible === false) {
    const motivo = (r as { motivo: string }).motivo;
    if (esSinCredito(motivo)) { await guardarTrabajo(t, { error: motivo }); await pausarPorCredito(motivo); throw new SinCredito(motivo); }
    const intentos = (t.intentos || 0) + 1;
    await guardarTrabajo(t, { intentos, error: motivo, estado: intentos >= 3 ? "transcrita" : "informe_pendiente" });
    return `No se pudo redactar el informe: ${motivo}`;
  }
  await escribirDoc(`${VIDEOS}/${t.videoId}__i`, {
    informe: (r as { informe: any }).informe, tipo: "informe", videoId: t.videoId, titulo: t.titulo || "", comision: t.comision, comisionId: t.comisionId || "",
    fecha: t.fecha, tabla: t.tabla, boletines: Array.from(new Set([...previa.boletines, ...t.boletines])), automatica: true, updatedAt: new Date().toISOString(),
  });
  await guardarTrabajo(t, { estado: "informe_listo", intentos: 0, error: "" });
  // Los boletines de la sesión quedan en espera para rehacer su historial (se hace en un paso con tiempo libre).
  const pend = await leerDoc(`${COLA}/_historial_pendiente`).catch(() => null);
  await escribirDoc(`${COLA}/_historial_pendiente`, { boletines: Array.from(new Set([...(pend?.boletines || []), ...t.boletines])) }).catch(() => undefined);
  return "Informe redactado.";
}

/**
 * Precarga de la Ficha Ejecutiva ("1-Pager"): para los boletines que aparecen en las sesiones recientes
 * (comisiones y Sala) y aún no tienen ficha guardada, la genera en segundo plano y la deja en
 * historial_proyectos/<boletín>.fichaEjecutiva, que es donde la app la lee al abrir el proyecto.
 */
export async function precargarFichas(maximo = 1): Promise<string[]> {
  // Como máximo cada 30 minutos (cada revisión lee documentos y cuenta para la cuota diaria de Firestore).
  const marca = await leerDoc(`${COLA}/_precarga`).catch(() => null);
  if (marca?.ultima && Date.now() - Date.parse(marca.ultima) < 30 * 60 * 1000) return [];
  await escribirDoc(`${COLA}/_precarga`, { ultima: new Date().toISOString() }).catch(() => undefined);
  const desde = sumarDias(hoyChileISO(), -45);
  const filas = await consultar({
    from: [{ collectionId: "registro_sesiones" }],
    where: { fieldFilter: { field: { fieldPath: "fecha" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: desde } } },
    orderBy: [{ field: { fieldPath: "fecha" }, direction: "DESCENDING" }], limit: 80,
    select: { fields: [{ fieldPath: "boletines" }] },
  }).catch(() => []);
  const sala = await consultar({
    from: [{ collectionId: "sesiones_sala" }],
    where: { fieldFilter: { field: { fieldPath: "fecha" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: desde } } }, limit: 30,
    select: { fields: [{ fieldPath: "boletines" }] },
  }).catch(() => []);
  const boletines = Array.from(new Set([...filas, ...sala].flatMap((f) => (camposAObjeto(f.datos).boletines || []) as string[]).filter((b) => /^\d{3,6}-\d{2}$/.test(b))));
  const hechos: string[] = [];
  const hoy = hoyChileISO();
  let revisados = 0;
  for (const b of boletines) {
    if (hechos.length >= maximo || ++revisados > 15) break;
    const g = await leerDoc(`historial_proyectos/${b}`).catch(() => null);
    if (g?.fichaEjecutiva?.ficha) continue;
    if (g?.fichaIntento && g.fichaIntento >= sumarDias(hoy, -7)) continue; // no reintentar a diario si el texto no se pudo leer
    const r = await fichaEjecutivaProyecto(b).catch(() => null);
    if (r?.disponible && r.ficha?.fuente === "texto") {
      await escribirDoc(`historial_proyectos/${b}`, { boletinId: b, fichaEjecutiva: { ficha: r.ficha, guardadoEn: new Date().toISOString(), automatica: true }, updatedAt: new Date().toISOString() });
    } else {
      await escribirDoc(`historial_proyectos/${b}`, { boletinId: b, fichaIntento: hoy });
    }
    hechos.push(b);
  }
  return hechos;
}

// ---------------------------------------------------------------------------
// Control desde el navegador: el analista inicia o detiene la transcripción automática. Mientras está iniciada,
// cada paso dispara el siguiente (la app se llama a sí misma) hasta el tope diario o hasta que no quede trabajo;
// la tarea diaria de Vercel la retoma cada mañana.
// ---------------------------------------------------------------------------
export interface ControlAuto { activa: boolean; base?: string; iniciadaEn?: string; ultimoPaso?: { accion: string; sesion?: string; detalle: string; fecha: string }; cadena?: string }
export async function leerControl(): Promise<ControlAuto> {
  const d = await leerDoc(`${COLA}/_control`).catch(() => null);
  return { activa: !!d?.activa, base: d?.base, iniciadaEn: d?.iniciadaEn, ultimoPaso: d?.ultimoPaso, cadena: d?.cadena };
}
export async function fijarControl(cambios: Partial<ControlAuto>) {
  await escribirDoc(`${COLA}/_control`, cambios as any);
}
const SIN_TRABAJO = new Set(["nada", "tope", "inactiva", "sin_youtube", "ocupado", "sin_credito"]);
/** Pide el siguiente paso a la propia app (no espera el trabajo: responde al instante y sigue por detrás). */
export async function siguientePaso(base: string): Promise<void> {
  const secreto = String(process.env.CRON_SECRET || "").trim();
  if (!secreto || !base) return;
  await fetch(`${base}/api/transcripcion/automatica/paso?segundoPlano=1&cadena=1`, { headers: { Authorization: `Bearer ${secreto}` }, signal: AbortSignal.timeout(15000) }).catch(() => undefined);
}
/** Ejecuta un paso y, si la transcripción está iniciada y queda trabajo, encadena el siguiente. */
export async function pasoEncadenado(baseRespaldo?: string): Promise<void> {
  const r = await pasoTranscripcionAutomatica().catch((e: any) => ({ ok: false, accion: "error", detalle: e?.message || String(e) }));
  const control = await leerControl();
  if (r.accion !== "ocupado") await fijarControl({ ultimoPaso: { accion: r.accion, sesion: (r as any).sesion || "", detalle: r.detalle, fecha: new Date().toISOString() } }).catch(() => undefined);
  // Sin sesiones por transcribir (o con el tope del día), la cadena sigue mientras haya trabajo de fondo:
  // historiales pendientes o texto de presentaciones del Senado (salvo que el Senado haya pedido esperar).
  const fondo = !!(r as any).historial || (Number((r as any).presentaciones || 0) > 0 && !senado.senadoSaturado);
  if (!control.activa || !r.ok || (SIN_TRABAJO.has(r.accion) && !(fondo && r.accion !== "ocupado" && r.accion !== "inactiva"))) return;
  await new Promise((res) => setTimeout(res, 5000));
  await siguientePaso(control.base || baseRespaldo || "");
}

export async function pasoTranscripcionAutomatica(): Promise<{ ok: boolean; accion: string; sesion?: string; detalle: string; fichas?: string[] }> {
  // Un paso a la vez: si otro sigue en curso (dos programadores, o uno que se adelantó), este no hace nada.
  const bloqueo = await leerDoc(`${COLA}/_bloqueo`).catch(() => null);
  if (bloqueo?.hasta && Date.parse(bloqueo.hasta) > Date.now()) return { ok: true, accion: "ocupado", detalle: "Hay otro paso en curso." };
  await escribirDoc(`${COLA}/_bloqueo`, { hasta: new Date(Date.now() + 280_000).toISOString() }).catch(() => undefined);
  try { return await pasoConBloqueo(); }
  finally { await escribirDoc(`${COLA}/_bloqueo`, { hasta: new Date(0).toISOString() }).catch(() => undefined); }
}

async function pasoConBloqueo(): Promise<{ ok: boolean; accion: string; sesion?: string; detalle: string; fichas?: string[] }> {
  // La precarga de fichas no depende de la transcripción automática: corre en cada paso (una por vez).
  const fichas = await Promise.race([precargarFichas(1).catch(() => [] as string[]), new Promise<string[]>((r) => setTimeout(() => r([]), 60_000))]);
  const r = await pasoTranscripcion();
  // Con tiempo libre (pasos livianos), rehace el historial de un boletín con informes nuevos.
  let historial: string | undefined;
  if (["sin_video", "nada", "tope", "ya_transcrita", "inactiva", "sin_youtube", "sin_credito"].includes(r.accion)) {
    const pend = await leerDoc(`${COLA}/_historial_pendiente`).catch(() => null);
    const lista: string[] = pend?.boletines || [];
    if (lista.length) {
      historial = lista[0];
      await escribirDoc(`${COLA}/_historial_pendiente`, { boletines: lista.slice(1) }).catch(() => undefined);
      await Promise.race([construirHistorial(historial).catch(() => undefined), new Promise((res) => setTimeout(res, 170_000))]);
    }
  }
  // También con tiempo libre: texto de presentaciones del Senado pendientes.
  let presentaciones = 0;
  if (!historial && ["sin_video", "nada", "tope", "ya_transcrita", "inactiva", "sin_youtube", "sin_credito"].includes(r.accion)) presentaciones = await procesarPresentacionesPendientes(5, 90000).catch(() => 0);
  return { ...r, fichas, ...(historial ? { historial } : {}), ...(presentaciones ? { presentaciones } : {}) };
}

async function pasoTranscripcion(): Promise<{ ok: boolean; accion: string; sesion?: string; detalle: string }> {
  // Si Gemini se quedó sin saldo hace poco, no se gasta el paso: se reintenta una vez por hora.
  const ctrl: any = await leerDoc(`${COLA}/_control`).catch(() => null);
  if (ctrl?.sinCreditoHasta && Date.parse(ctrl.sinCreditoHasta) > Date.now()) {
    return { ok: true, accion: "sin_credito", detalle: `Gemini sin saldo (prepago agotado). Se reintenta automáticamente después de ${new Date(ctrl.sinCreditoHasta).toLocaleTimeString("es-CL", { timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit" })}. Recarga el saldo en Google AI Studio.` };
  }
  try { return await pasoTranscripcionConCredito(ctrl); }
  catch (e: any) {
    if (e instanceof SinCredito) return { ok: true, accion: "sin_credito", detalle: "Gemini sin saldo (prepago agotado). Pausado 1 hora; la sesión no pierde intentos. Recarga el saldo en Google AI Studio." };
    throw e;
  }
}

async function pasoTranscripcionConCredito(ctrl: any): Promise<{ ok: boolean; accion: string; sesion?: string; detalle: string }> {
  const conf = configuracionAuto();
  if (!conf.activa) return { ok: true, accion: "inactiva", detalle: `La transcripción automática está desactivada: TRANSCRIPCION_AUTO ${process.env.TRANSCRIPCION_AUTO === undefined ? "no existe en este despliegue" : `tiene un valor distinto de 1 (${String(process.env.TRANSCRIPCION_AUTO).length} caracteres)`}.` };
  if (!youtubeApiConfigurada()) return { ok: false, accion: "sin_youtube", detalle: "Falta YOUTUBE_API_KEY para encontrar los videos." };
  const limite = Date.now() + 100_000; // deja margen dentro de los 300 s de Vercel (la precarga de fichas usa hasta 60 s)

  // 0) Con saldo de nuevo: las sesiones que fallaron solo por falta de saldo vuelven a la cola.
  if (ctrl?.sinCreditoHasta || !ctrl?.erroresCreditoRecuperados) {
    await recuperarErroresPorCredito().catch(() => 0);
    await escribirDoc(`${COLA}/_control`, { sinCreditoHasta: "", erroresCreditoRecuperados: true }).catch(() => undefined);
  }

  // 1) Sesión en curso.
  let t = await trabajoEnEstado("transcribiendo");
  if (t?.videoId) return { ok: true, accion: "transcribir", sesion: `${t.comision} ${t.fecha}`, detalle: await avanzarTranscripcion(t, limite) };

  // 2) Informe pendiente.
  if (conf.informe) {
    t = await trabajoEnEstado("informe_pendiente");
    if (t?.videoId) return { ok: true, accion: "informe", sesion: `${t.comision} ${t.fecha}`, detalle: await redactarInforme(t) };
  }

  const cont = await contadorDia();
  if (cont.tramos >= conf.maxTramosDia) return { ok: true, accion: "tope", detalle: `Tope diario alcanzado (${cont.tramos} de ${conf.maxTramosDia} tramos). Sigue mañana.` };

  // 3) Reintento de una sesión reciente cuyo video no estaba publicado; si no, una sesión nueva.
  t = await trabajoParaReintentar();
  if (!t) {
    const s = await siguienteSesion();
    if (!s) return { ok: true, accion: "nada", detalle: `No quedan sesiones por transcribir desde ${conf.desde}.` };
    t = {
      id: s.id, estado: "buscando_video", camara: s.camara, comision: s.comisionNombre, comisionId: s.comisionId, fecha: s.fecha, hora: s.hora,
      boletines: s.boletines, tabla: s.puntos.map((p) => p.texto).filter(Boolean),
    };
    await guardarTrabajo(t, {});
  }
  const videoId = await buscarVideo(t).catch(() => null);
  if (!videoId) {
    const reciente = t.fecha >= sumarDias(hoyChileISO(), -10);
    await guardarTrabajo(t, { estado: "sin_video", reintentarDesde: reciente ? sumarDias(hoyChileISO(), 2) : "", error: "No se encontró en el canal oficial un video con la fecha de la sesión." });
    return { ok: true, accion: "sin_video", sesion: `${t.comision} ${t.fecha}`, detalle: "Sin video con esa fecha en el canal oficial." };
  }
  // Si la app ya la había transcrito a mano, se aprovecha.
  const previa = await leerTranscripcion(videoId);
  if (previa.completo) {
    await guardarTrabajo(t, { estado: conf.informe ? "informe_pendiente" : "transcrita" });
    return { ok: true, accion: "ya_transcrita", sesion: `${t.comision} ${t.fecha}`, detalle: "Ya estaba transcrita." };
  }
  return { ok: true, accion: "transcribir", sesion: `${t.comision} ${t.fecha}`, detalle: await avanzarTranscripcion(t, limite) };
}

/** Resumen del avance para mostrar en la app. */
export async function estadoTranscripcionAutomatica() {
  const conf = configuracionAuto();
  const { base, key } = conexionFirestore();
  // Conteo por estado con consultas de agregación (cuestan 1 lectura por cada 1.000 documentos contados).
  const estados = ["transcribiendo", "transcrita", "informe_pendiente", "informe_listo", "sin_video", "error", "buscando_video"];
  const porEstado: Record<string, number> = {};
  await Promise.all(estados.map(async (e) => {
    const r = await fetch(`${base}:runAggregationQuery?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredAggregationQuery: { structuredQuery: { from: [{ collectionId: COLA }], where: { fieldFilter: { field: { fieldPath: "estado" }, op: "EQUAL", value: { stringValue: e } } } }, aggregations: [{ alias: "n", count: {} }] } }),
      signal: AbortSignal.timeout(10000),
    }).catch(() => null);
    if (!r?.ok) return;
    const d: any = await r.json();
    const n = Number(d?.[0]?.result?.aggregateFields?.n?.integerValue || 0);
    if (n) porEstado[e] = n;
  }));
  const filas = await consultar({ from: [{ collectionId: COLA }], orderBy: [{ field: { fieldPath: "actualizado" }, direction: "DESCENDING" }], limit: 15 }).catch(() => []);
  const recientes = filas.filter((f) => !f.id.startsWith("_")).map((f) => ({ id: f.id, ...camposAObjeto(f.datos) } as any));
  const cont = await contadorDia();
  const control = await leerControl();
  return {
    configuracion: conf, tramosHoy: cont.tramos, porEstado, control,
    recientes: recientes.map((t) => ({ comision: t.comision, fecha: t.fecha, estado: t.estado, videoId: t.videoId || null, error: t.error || null, actualizado: t.actualizado })),
  };
}
