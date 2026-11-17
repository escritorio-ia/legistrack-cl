import React, { useState, useEffect, useRef, useMemo } from "react";
import { arrayUnion } from "firebase/firestore";
import {
  Quote,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Tv,
  Search,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  Users,
  Gavel
} from "lucide-react";
import { getAnalisisVideoFromFirestore, saveAnalisisVideoToFirestore, getTranscripcionVideoFromFirestore, saveTranscripcionVideoToFirestore, getInformeSesion, saveInformeSesion, boletinesEnTexto, normalizarBoletin } from "../services/firebaseService";
import { type InformeSesion, informeSesionATexto } from "../utils/informeSesion";

export interface TranscriptSnippet {
  seconds: number;
  timeFormatted: string;
  text: string;
}

export interface YouTubeTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  videoUrl: string;
  videoId?: string;
  comisionNombre: string;
  sesionFecha: string;
  materia?: string;
  /** Tabla oficial de la citación (puntos a tratar). De ella salen los boletines con que se ordena la sesión. */
  tabla?: string[];
  /** Boletines adicionales conocidos (p. ej. el del proyecto desde el que se abrió el video). */
  boletines?: string[];
  /** Sesión del Senado: permite leer la tabla oficial (puntos con su boletín) del registro de senado.cl. */
  senado?: { comisionId: string; sesionId: string };
}

interface SegmentoT { segundos: number; orador: string; texto: string }
interface ParteTranscripcion { disponible: boolean; motivo?: string; parte: number; desde: number; hasta: number | null; segmentos?: SegmentoT[]; aviso?: string }

/** Texto plano de la transcripción (para copiar). */
export function transcripcionATexto(partes: ParteTranscripcion[]): string {
  return partes.filter(p => p.disponible).flatMap(p => p.segmentos || []).map(g => `[${formatoMinuto(g.segundos)}] ${g.orador || "Orador no identificado"}: ${g.texto}`).join("\n");
}

interface Intervencion { segundos: number; orador: string; cargo: string; resumen: string; cita?: string }
interface ParteAnalisis {
  disponible: boolean;
  motivo?: string;
  parte: number;
  desde: number;
  hasta: number | null;
  resumen?: string;
  temas?: string[];
  intervenciones?: Intervencion[];
  acuerdos?: string[];
  votaciones?: string[];
  modelo?: string;
}

export function formatoMinuto(seg: number): string {
  const s = Math.max(0, Math.round(seg));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}

/** Texto plano del análisis (para informes y para copiar). */
export function analisisATexto(partes: ParteAnalisis[]): string {
  return partes.filter(p => p.disponible).map(p => {
    const lineas = [
      p.resumen ? `Resumen (${formatoMinuto(p.desde)}${p.hasta ? `–${formatoMinuto(p.hasta)}` : ""}): ${p.resumen}` : "",
      ...(p.intervenciones || []).map(i => `[${formatoMinuto(i.segundos)}] ${i.orador}${i.cargo ? ` (${i.cargo})` : ""}: ${i.resumen}${i.cita ? ` «${i.cita}»` : ""}`),
      ...(p.acuerdos || []).map(a => `Acuerdo: ${a}`),
      ...(p.votaciones || []).map(v => `Votación: ${v}`)
    ];
    return lineas.filter(Boolean).join("\n");
  }).join("\n\n");
}

/**
 * Devuelve el análisis (texto) del video de una sesión. Si ya está guardado en Firestore lo usa;
 * si no, lo genera con Gemini por tramos de 30 min, lo guarda y lo devuelve. Si no se pudo analizar
 * nada, devuelve "" (el informe se redactará solo con el acta oficial, sin inventar).
 */
export async function obtenerAnalisisVideo(
  id: string,
  meta: { titulo?: string; comision?: string; fecha?: string; materia?: string },
  onProgreso?: (msg: string) => void
): Promise<string> {
  if (!id) return "";
  try {
    const guardado = await getAnalisisVideoFromFirestore(id);
    if (Array.isArray(guardado?.partes) && guardado.partes.some((p: ParteAnalisis) => p.disponible) && guardado.completo) {
      return analisisATexto(guardado.partes);
    }
  } catch { /* se analiza de nuevo */ }

  const det: any = await fetch(`/api/videos/${id}/detalle`).then(r => r.json()).catch(() => null);
  const total = det?.partes || 1;
  const duracion = det?.segundos || null;
  const acumuladas: ParteAnalisis[] = [];
  for (let parte = 0; parte < total; parte++) {
    onProgreso?.(total > 1 ? `Analizando el video con IA: parte ${parte + 1} de ${total}…` : "Analizando el video con IA…");
    const qs = new URLSearchParams({
      parte: String(parte),
      ...(duracion ? { duracion: String(duracion) } : {}),
      comision: meta.comision || "", fecha: meta.fecha || "", materia: meta.materia || ""
    });
    let r: ParteAnalisis;
    try { r = await fetch(`/api/videos/${id}/analisis?${qs}`).then(x => x.json()); }
    catch { r = { disponible: false, parte, desde: parte * 1800, hasta: null }; }
    if (!r.disponible) break;
    acumuladas.push(r);
  }
  if (acumuladas.length === 0) return "";
  saveAnalisisVideoToFirestore(id, {
    partes: acumuladas, completo: acumuladas.length >= total,
    titulo: meta.titulo, comision: meta.comision, fecha: meta.fecha, duracion
  }).catch(() => {});
  return analisisATexto(acumuladas);
}

export default function YouTubeTranscriptModal({
  isOpen,
  onClose,
  videoTitle,
  videoUrl,
  videoId,
  comisionNombre,
  sesionFecha,
  materia,
  tabla,
  boletines,
  senado
}: YouTubeTranscriptModalProps) {
  const cancelado = useRef(false);

  // Tabla oficial del Senado (puntos con boletín), si la sesión es del Senado y su detalle está sincronizado.
  const [tablaSenado, setTablaSenado] = useState<string[] | null>(null);
  useEffect(() => {
    setTablaSenado(null);
    if (!isOpen || !senado?.comisionId || !senado?.sesionId) return;
    let vigente = true;
    fetch(`/api/senado/sesion/${encodeURIComponent(senado.comisionId)}/${encodeURIComponent(senado.sesionId)}/resumen`)
      .then(r => r.json())
      .then(d => {
        if (!vigente || !d?.disponible || !Array.isArray(d.puntos) || d.puntos.length === 0) return;
        setTablaSenado(d.puntos.map((p: any) => `${p.boletin ? `Boletín ${p.boletin}: ` : ""}${p.tema}`));
      })
      .catch(() => { /* se usa la tabla recibida */ });
    return () => { vigente = false; };
  }, [isOpen, senado?.comisionId, senado?.sesionId]);
  // Relación sesión -> tabla -> boletines: los boletines se toman de la tabla oficial (y de la materia citada).
  const puntosTabla = useMemo(() => (tablaSenado || tabla || []).map(t => String(t || "").trim()).filter(Boolean), [tablaSenado, tabla]);
  const boletinesSesion = useMemo(
    () => Array.from(new Set([...(boletines || []).map(normalizarBoletin), ...boletinesEnTexto(`${puntosTabla.join(" ")} ${materia || ""}`)].filter(Boolean))),
    [boletines, puntosTabla, materia]
  );
  const indice = useMemo(() => ({ boletines: boletinesSesion, ...(puntosTabla.length ? { tabla: puntosTabla } : {}) }), [boletinesSesion, puntosTabla]);

  const [vista, setVista] = useState<"informe" | "transcripcion">("informe");
  const [partesT, setPartesT] = useState<ParteTranscripcion[]>([]);
  const [totalPartesT, setTotalPartesT] = useState<number | null>(null);
  const [estadoT, setEstadoT] = useState<"cargando" | "sin" | "transcribiendo" | "listo" | "error">("cargando");
  const [mensajeT, setMensajeT] = useState("");
  const [informe, setInforme] = useState<InformeSesion | null>(null);
  const [estadoI, setEstadoI] = useState<"sin" | "generando" | "listo" | "error">("sin");
  const [mensajeI, setMensajeI] = useState("");
  const [duracion, setDuracion] = useState<number | null>(null);
  const [inicio, setInicio] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);

  const id = videoId || (videoUrl.match(/(?:v=|\/embed\/|youtu\.be\/|\/live\/)([\w-]{11})/) || [])[1] || "";

  // Transcripción e informe guardados, y duración del video.
  useEffect(() => {
    if (!isOpen || !id) return;
    cancelado.current = false;
    setEstadoT("cargando");
    (async () => {
      const [det, guardadoT, guardadoI] = await Promise.all([
        fetch(`/api/videos/${id}/detalle`).then(r => r.json()).catch(() => null),
        getTranscripcionVideoFromFirestore(id),
        getInformeSesion(id)
      ]);
      if (cancelado.current) return;
      if (det?.segundos) setDuracion(det.segundos);
      setTotalPartesT(det?.partesTranscripcion ?? null);
      const previasT: ParteTranscripcion[] = Array.isArray(guardadoT?.partes) ? guardadoT.partes : [];
      setPartesT(previasT);
      setEstadoT(previasT.some(p => p.disponible) ? "listo" : "sin");
      setMensajeT(previasT.length && !guardadoT?.completo ? "La transcripción guardada está incompleta; puede continuarla." : "");
      if (guardadoI?.informe) { setInforme(guardadoI.informe); setEstadoI("listo"); }
      else { setInforme(null); setEstadoI("sin"); }
    })();
    return () => { cancelado.current = true; };
  }, [isOpen, id]);

  const hayTranscripcion = partesT.some(p => p.disponible);
  const claveIndice = `${indice.boletines.join(",")}|${puntosTabla.length}`;
  useEffect(() => {
    if (!isOpen || !id || indice.boletines.length === 0 || !hayTranscripcion) return;
    saveTranscripcionVideoToFirestore(id, { ...indice, boletines: arrayUnion(...indice.boletines) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, id, claveIndice, hayTranscripcion]);

  const metaGuardado = () => ({ titulo: videoTitle, comision: comisionNombre, fecha: sesionFecha, duracion, ...indice, ...(indice.boletines.length ? { boletines: arrayUnion(...indice.boletines) } : {}) });

  // Paso 1: transcripción automática por tramos de 10 minutos (se guarda a medida que avanza).
  const transcribir = async (): Promise<{ partes: ParteTranscripcion[]; completa: boolean } | null> => {
    if (!id) return null;
    setEstadoT("transcribiendo");
    const total = totalPartesT || 1;
    const acumuladas: ParteTranscripcion[] = partesT.filter(p => p.disponible);
    const guardar = (completo: boolean) => saveTranscripcionVideoToFirestore(id, { partes: acumuladas, completo, ...metaGuardado() });
    for (let parte = 0; parte < total; parte++) {
      if (cancelado.current) return null;
      if (acumuladas.some(p => p.parte === parte)) continue;
      setMensajeT(`Transcribiendo tramo ${parte + 1} de ${total} (10 minutos de video cada uno)…`);
      const qs = new URLSearchParams({ modo: "transcripcion", parte: String(parte), ...(duracion ? { duracion: String(duracion) } : {}), comision: comisionNombre || "", fecha: sesionFecha || "", materia: materia || "" });
      let r: ParteTranscripcion;
      try { r = await fetch(`/api/videos/${id}/analisis?${qs}`).then(x => x.json()); }
      catch { r = { disponible: false, motivo: "No se pudo conectar con el servidor.", parte, desde: parte * 600, hasta: null }; }
      if (cancelado.current) return null;
      if (!r.disponible) {
        setMensajeT(r.motivo || "No se pudo transcribir este tramo.");
        setEstadoT(acumuladas.length ? "listo" : "error");
        setPartesT([...acumuladas]);
        if (acumuladas.length) guardar(false);
        return { partes: acumuladas, completa: false };
      }
      acumuladas.push(r);
      acumuladas.sort((a, b) => a.parte - b.parte);
      setPartesT([...acumuladas]);
      if (acumuladas.length % 3 === 0) guardar(false);
    }
    setEstadoT("listo");
    setMensajeT("");
    guardar(true);
    return { partes: acumuladas, completa: true };
  };

  // Paso 2: informe redactado solo con la transcripción (el servidor descarta lo que no puede ubicar en ella).
  const generarInforme = async (partes: ParteTranscripcion[], completa: boolean) => {
    const segs = partes.filter(p => p.disponible).flatMap(p => p.segmentos || []);
    if (segs.length === 0) { setEstadoI("error"); setMensajeI("No hay transcripción con texto para redactar el informe."); return; }
    setEstadoI("generando");
    setMensajeI("Redactando el informe a partir de la transcripción… (1 a 3 minutos)");
    try {
      const r = await fetch("/api/sesion/informe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentos: segs, tabla: puntosTabla, boletines: boletinesSesion, comision: comisionNombre, fecha: sesionFecha, parcial: !completa })
      }).then(x => x.json());
      if (cancelado.current) return;
      if (!r?.disponible) { setEstadoI("error"); setMensajeI(r?.motivo || "No se pudo generar el informe."); return; }
      setInforme(r.informe); setEstadoI("listo"); setMensajeI("");
      saveInformeSesion(id, { informe: r.informe, ...metaGuardado() });
    } catch {
      if (!cancelado.current) { setEstadoI("error"); setMensajeI("No se pudo conectar con el servidor."); }
    }
  };

  const transcripcionIncompleta = partesT.filter(p => p.disponible).length < (totalPartesT || 1);
  const crearInforme = async () => {
    if (!transcripcionIncompleta) return generarInforme(partesT, true);
    const r = await transcribir();
    if (r && r.partes.length) await generarInforme(r.partes, r.completa);
  };

  const segmentos = useMemo(() => {
    const todos = partesT.filter(p => p.disponible).flatMap(p => p.segmentos || []);
    const f = filtro.trim().toLowerCase();
    return f ? todos.filter(g => `${g.orador} ${g.texto}`.toLowerCase().includes(f)) : todos;
  }, [partesT, filtro]);

  // Quiénes hablaron: desde la transcripción (primer minuto y número de intervenciones).
  const oradores = useMemo(() => {
    const m = new Map<string, { orador: string; primera: number; veces: number }>();
    for (const g of partesT.filter(p => p.disponible).flatMap(p => p.segmentos || [])) {
      const n = String(g.orador || "").trim();
      if (!n || /no identificad/i.test(n)) continue;
      const k = n.toLowerCase();
      const e = m.get(k);
      if (e) e.veces++; else m.set(k, { orador: n, primera: g.segundos, veces: 1 });
    }
    return Array.from(m.values()).sort((a, b) => a.primera - b.primera);
  }, [partesT]);

  const copiarTexto = (clave: string, texto: string) => {
    navigator.clipboard.writeText(texto).catch(() => {});
    setCopiado(clave);
    setTimeout(() => setCopiado(null), 2000);
  };
  const Minuto = ({ s }: { s: number }) => (
    <button onClick={() => setInicio(s)} className="font-mono text-[11px] font-bold text-rose-300 hover:text-rose-200 cursor-pointer shrink-0" title="Ir a este minuto del video">{formatoMinuto(s)}</button>
  );
  const ocupado = estadoT === "transcribiendo" || estadoI === "generando";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md font-sans">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh]">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0"><Tv className="w-5 h-5" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">Video oficial · transcripción · informe</span>
                <span className="text-[11px] text-slate-400 font-mono font-bold">{sesionFecha}</span>
                {duracion && <span className="text-[11px] text-slate-400 font-mono">Duración {formatoMinuto(duracion)}</span>}
              </div>
              <h2 className="text-base font-extrabold text-white mt-0.5 truncate">{videoTitle || `Sesión - ${comisionNombre}`}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Video, tabla y oradores */}
          <div className="lg:col-span-5 bg-slate-950 p-5 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black">
              {id ? (
                <iframe key={inicio} src={`https://www.youtube-nocookie.com/embed/${id}?start=${inicio}${inicio ? "&autoplay=1" : ""}`} title="Sesión oficial" className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-semibold">Video no identificado en el canal oficial</div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4" id="tabla-sesion">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Tabla de la sesión</p>
              {puntosTabla.length > 0 ? (
                <ol className="list-decimal ml-4 space-y-1.5 text-xs text-slate-200">{puntosTabla.map((t, i) => <li key={i} className="leading-relaxed">{t}</li>)}</ol>
              ) : <p className="text-xs text-slate-500 italic">Tabla no informada para esta sesión.</p>}
              <p className="text-[11px] text-slate-400 mt-2"><span className="font-bold text-slate-300">Boletines: </span>{boletinesSesion.length ? boletinesSesion.join(", ") : "ninguno identificado"}</p>
              <p className="text-[10px] text-slate-500 mt-1">La transcripción y el informe quedan guardados bajo estos boletines.</p>
            </div>

            {oradores.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Quiénes hablaron (transcripción)</p>
                <ul className="space-y-1.5">
                  {oradores.map(e => (
                    <li key={e.orador} className="text-xs flex items-start gap-2"><Minuto s={e.primera} /><span><span className="font-bold text-white">{e.orador}</span><span className="text-slate-400"> · {e.veces} {e.veces === 1 ? "intervención" : "intervenciones"}</span></span></li>
                  ))}
                </ul>
              </div>
            )}

            {id && (
              <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl">
                <ExternalLink className="w-4 h-4" /> Abrir en YouTube (canal oficial)
              </a>
            )}
          </div>

          {/* Informe y transcripción */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden">
            <div className="px-4 pt-3 flex items-center gap-1.5" role="tablist">
              {(["informe", "transcripcion"] as const).map(v => (
                <button key={v} role="tab" aria-selected={vista === v} onClick={() => setVista(v)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer ${vista === v ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                  {v === "informe" ? `Informe${informe ? " ✓" : ""}` : `Transcripción${hayTranscripcion ? (transcripcionIncompleta ? " (parcial)" : " ✓") : ""}`}
                </button>
              ))}
              <div className="ml-auto flex gap-1.5">
                {vista === "informe" && informe && (
                  <button onClick={() => copiarTexto("i", informeSesionATexto(informe, { comision: comisionNombre, fecha: sesionFecha, videoId: id }))} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer">
                    {copiado === "i" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar informe
                  </button>
                )}
                {vista === "transcripcion" && hayTranscripcion && (
                  <button onClick={() => copiarTexto("t", `${transcripcionATexto(partesT)}\n\n(Transcripción automática, no oficial. ${comisionNombre}, ${sesionFecha}. Video: https://www.youtube.com/watch?v=${id})`)} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer">
                    {copiado === "t" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar transcripción
                  </button>
                )}
              </div>
            </div>

            {/* Estado del proceso: un solo botón para transcribir y redactar el informe */}
            {(estadoT !== "cargando") && (!informe || ocupado) && (
              <div className="m-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <ol className="text-xs space-y-1.5">
                  <li className="flex items-center gap-2">
                    {estadoT === "transcribiendo" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-300" /> : hayTranscripcion && !transcripcionIncompleta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-3.5 text-center text-slate-500">1</span>}
                    <span><b>Transcripción</b> del video oficial: {partesT.filter(p => p.disponible).length} de {totalPartesT || "?"} tramos de 10 min.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {estadoI === "generando" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-300" /> : informe ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-3.5 text-center text-slate-500">2</span>}
                    <span><b>Informe</b> redactado solo con la transcripción, ordenado por la tabla y con el minuto de cada dato.</span>
                  </li>
                </ol>
                {(mensajeT || mensajeI) && <p className="text-xs text-amber-300 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {estadoI === "generando" || estadoI === "error" ? mensajeI : mensajeT}</p>}
                {!ocupado && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={crearInforme} disabled={!id} className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer">
                      <Sparkles className="w-3.5 h-3.5" /> {transcripcionIncompleta ? (hayTranscripcion ? "Continuar transcripción y generar informe" : "Transcribir y generar informe") : "Generar informe"}
                    </button>
                    {hayTranscripcion && transcripcionIncompleta && (
                      <button onClick={() => generarInforme(partesT, false)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer">Informe con lo transcrito hasta ahora</button>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-slate-500">Se guarda para todos los usuarios y queda ligado a los boletines de la tabla.</p>
              </div>
            )}
            {estadoT === "cargando" && id && <div className="m-4 flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Buscando transcripción e informe guardados…</div>}

            {vista === "informe" && informe && (
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3" id="panel-informe">
                {informe.parcial && <p className="text-xs text-amber-300 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Informe hecho con una transcripción incompleta.</p>}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Resumen</p>
                  <p className="text-xs text-slate-200 leading-relaxed">{informe.resumen || "No informado"}</p>
                </div>
                {informe.puntos.map((p, k) => (
                  <div key={k} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black text-rose-300">{p.numero ? `Punto ${p.numero}` : "Fuera de tabla"}</span>
                      <span className="text-xs font-bold text-white">{p.titulo}</span>
                      {p.boletines.map(b => <span key={b} className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-200 border border-blue-500/40 px-1.5 rounded">Boletín {b}</span>)}
                    </div>
                    {p.sintesis && <p className="text-xs text-slate-300 leading-relaxed">{p.sintesis}</p>}
                    {p.intervenciones.length > 0 && (
                      <ul className="space-y-1.5">
                        {p.intervenciones.map((i, j) => (
                          <li key={j} className="text-xs flex items-start gap-2"><Minuto s={i.segundos} /><span className="text-slate-200"><b className="text-white">{i.orador}</b>{i.cargo && <span className="text-slate-400"> ({i.cargo})</span>}: {i.postura}</span></li>
                        ))}
                      </ul>
                    )}
                    {(p.acuerdos.length > 0 || p.votaciones.length > 0) && (
                      <div className="border-t border-slate-800 pt-2 space-y-1">
                        {p.acuerdos.map((a, j) => <p key={`a${j}`} className="text-xs text-emerald-300 flex gap-2"><Gavel className="w-3.5 h-3.5 shrink-0" /><Minuto s={a.segundos} /><span><b>Acuerdo:</b> {a.texto}</span></p>)}
                        {p.votaciones.map((v, j) => <p key={`v${j}`} className="text-xs text-emerald-300 flex gap-2"><Gavel className="w-3.5 h-3.5 shrink-0" /><Minuto s={v.segundos} /><span><b>Votación:</b> {v.texto} · {v.resultado}</span></p>)}
                      </div>
                    )}
                  </div>
                ))}
                {informe.compromisos.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Compromisos</p>
                    {informe.compromisos.map((c, j) => <p key={j} className="text-xs text-slate-200 flex gap-2"><Minuto s={c.segundos} /><span>{c.texto} <span className="text-slate-400">· {c.responsable}</span></span></p>)}
                  </div>
                )}
                {informe.pendientes.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Temas pendientes</p>
                    {informe.pendientes.map((t, j) => <p key={j} className="text-xs text-slate-200">• {t}</p>)}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-md">
                    Generado con IA solo a partir de la transcripción automática del video oficial. No es un documento oficial. Cada minuto es un enlace al video.
                    {informe.descartados > 0 ? ` Se descartaron ${informe.descartados} elemento(s) que no se pudieron ubicar en la transcripción.` : ""}
                  </p>
                  {!ocupado && <button onClick={crearInforme} className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"><RefreshCw className="w-3 h-3" /> Regenerar</button>}
                </div>
              </div>
            )}
            {vista === "informe" && !informe && estadoT !== "cargando" && !ocupado && (
              <p className="px-4 text-xs text-slate-500">Esta sesión aún no tiene informe.</p>
            )}

            {vista === "transcripcion" && (
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3" id="panel-transcripcion">
                {hayTranscripcion && (
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar orador o palabra…" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500" />
                  </div>
                )}
                {segmentos.map((g, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <span className="pt-0.5"><Minuto s={g.segundos} /></span>
                    <p className="text-slate-200 leading-relaxed"><span className="font-bold text-white">{g.orador || "Orador no identificado"}: </span>{g.texto}</p>
                  </div>
                ))}
                {hayTranscripcion && <p className="text-[10px] text-slate-500 leading-relaxed pt-2">Transcripción automática generada por IA a partir del video oficial. No es la versión taquigráfica oficial y puede contener errores: verifique en el video.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
