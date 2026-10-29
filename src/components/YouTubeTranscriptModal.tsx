import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { getAnalisisVideoFromFirestore, saveAnalisisVideoToFirestore } from "../services/firebaseService";

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

export default function YouTubeTranscriptModal({
  isOpen,
  onClose,
  videoTitle,
  videoUrl,
  videoId,
  comisionNombre,
  sesionFecha,
  materia
}: YouTubeTranscriptModalProps) {
  const [inicio, setInicio] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [copiado, setCopiado] = useState<number | null>(null);
  const [partes, setPartes] = useState<ParteAnalisis[]>([]);
  const [duracion, setDuracion] = useState<number | null>(null);
  const [totalPartes, setTotalPartes] = useState<number | null>(null);
  const [estado, setEstado] = useState<"cargando" | "sin-analisis" | "analizando" | "listo" | "error">("cargando");
  const [mensaje, setMensaje] = useState("");
  const cancelado = useRef(false);

  const id = videoId || (videoUrl.match(/(?:v=|\/embed\/|youtu\.be\/|\/live\/)([\w-]{11})/) || [])[1] || "";

  // 1) ¿Ya existe un análisis guardado? 2) Duración del video.
  useEffect(() => {
    if (!isOpen || !id) return;
    cancelado.current = false;
    setEstado("cargando");
    (async () => {
      const [guardado, det] = await Promise.all([
        getAnalisisVideoFromFirestore(id),
        fetch(`/api/videos/${id}/detalle`).then(r => r.json()).catch(() => null)
      ]);
      if (cancelado.current) return;
      if (det?.segundos) setDuracion(det.segundos);
      setTotalPartes(det?.partes ?? null);
      const previas: ParteAnalisis[] = Array.isArray(guardado?.partes) ? guardado.partes : [];
      if (previas.length > 0) {
        setPartes(previas);
        const completo = guardado?.completo || (det?.partes ? previas.filter(p => p.disponible).length >= det.partes : true);
        setEstado(completo ? "listo" : "sin-analisis");
      } else {
        setEstado("sin-analisis");
      }
    })();
    return () => { cancelado.current = true; };
  }, [isOpen, id]);

  const analizar = async () => {
    if (!id) return;
    setEstado("analizando");
    const total = totalPartes || 1;
    const acumuladas: ParteAnalisis[] = partes.filter(p => p.disponible);
    for (let parte = 0; parte < total; parte++) {
      if (cancelado.current) return;
      if (acumuladas.some(p => p.parte === parte)) continue;
      setMensaje(total > 1 ? `Analizando parte ${parte + 1} de ${total} (1 hora de video cada una)…` : "Analizando el video… puede tardar 1 a 3 minutos.");
      const qs = new URLSearchParams({
        parte: String(parte),
        ...(duracion ? { duracion: String(duracion) } : {}),
        comision: comisionNombre || "",
        fecha: sesionFecha || "",
        materia: materia || ""
      });
      let r: ParteAnalisis;
      try {
        r = await fetch(`/api/videos/${id}/analisis?${qs}`).then(x => x.json());
      } catch (e: any) {
        r = { disponible: false, motivo: "No se pudo conectar con el servidor (el análisis pudo exceder el tiempo máximo).", parte, desde: parte * 3600, hasta: null };
      }
      if (cancelado.current) return;
      if (!r.disponible) {
        setMensaje(r.motivo || "No se pudo analizar el video.");
        setEstado(acumuladas.length ? "listo" : "error");
        setPartes([...acumuladas]);
        if (acumuladas.length) saveAnalisisVideoToFirestore(id, { partes: acumuladas, completo: false, titulo: videoTitle, comision: comisionNombre, fecha: sesionFecha });
        return;
      }
      acumuladas.push(r);
      acumuladas.sort((a, b) => a.parte - b.parte);
      setPartes([...acumuladas]);
    }
    setEstado("listo");
    setMensaje("");
    saveAnalisisVideoToFirestore(id, { partes: acumuladas, completo: true, titulo: videoTitle, comision: comisionNombre, fecha: sesionFecha, duracion });
  };

  const intervenciones = useMemo(() => {
    const todas = partes.filter(p => p.disponible).flatMap(p => p.intervenciones || []);
    const f = filtro.trim().toLowerCase();
    return f ? todas.filter(i => `${i.orador} ${i.cargo} ${i.resumen} ${i.cita || ""}`.toLowerCase().includes(f)) : todas;
  }, [partes, filtro]);

  const expositores = useMemo(() => {
    const m = new Map<string, { orador: string; cargo: string; primera: number; veces: number }>();
    for (const i of partes.filter(p => p.disponible).flatMap(p => p.intervenciones || [])) {
      if (/no identificad/i.test(i.orador)) continue;
      const k = i.orador.toLowerCase();
      const e = m.get(k);
      if (e) e.veces++;
      else m.set(k, { orador: i.orador, cargo: i.cargo, primera: i.segundos, veces: 1 });
    }
    return Array.from(m.values()).sort((a, b) => a.primera - b.primera);
  }, [partes]);

  const acuerdos = partes.flatMap(p => p.acuerdos || []);
  const votaciones = partes.flatMap(p => p.votaciones || []);

  const copiar = (i: Intervencion, idx: number) => {
    const texto = `${i.cita ? `«${i.cita}»` : i.resumen}\n— ${i.orador}${i.cargo ? `, ${i.cargo}` : ""} (minuto ${formatoMinuto(i.segundos)}; análisis automático, no oficial)\nSesión: ${comisionNombre} (${sesionFecha})\nVideo: https://www.youtube.com/watch?v=${id}&t=${i.segundos}s`;
    navigator.clipboard.writeText(texto).catch(() => {});
    setCopiado(idx);
    setTimeout(() => setCopiado(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md font-sans">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
                  Video oficial + análisis IA
                </span>
                <span className="text-[11px] text-slate-400 font-mono font-bold">{sesionFecha}</span>
                {duracion && <span className="text-[11px] text-slate-400 font-mono">Duración {formatoMinuto(duracion)}</span>}
              </div>
              <h2 className="text-base font-extrabold text-white mt-0.5 truncate">{videoTitle || `Sesión - ${comisionNombre}`}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Video */}
          <div className="lg:col-span-5 bg-slate-950 p-5 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black">
              {id ? (
                <iframe
                  key={inicio}
                  src={`https://www.youtube-nocookie.com/embed/${id}?start=${inicio}${inicio ? "&autoplay=1" : ""}`}
                  title="Sesión oficial"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-semibold">Video no identificado</div>
              )}
            </div>

            {materia && <p className="text-xs text-slate-400 leading-relaxed"><span className="font-bold text-slate-300">Materia citada: </span>{materia}</p>}

            {expositores.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Quiénes hablaron</p>
                <ul className="space-y-1.5">
                  {expositores.map(e => (
                    <li key={e.orador} className="text-xs flex items-start gap-2">
                      <button onClick={() => setInicio(e.primera)} className="font-mono text-rose-300 hover:text-rose-200 cursor-pointer shrink-0">{formatoMinuto(e.primera)}</button>
                      <span><span className="font-bold text-white">{e.orador}</span>{e.cargo && <span className="text-slate-400"> · {e.cargo}</span>}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(acuerdos.length > 0 || votaciones.length > 0) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Gavel className="w-3.5 h-3.5" /> Acuerdos y votaciones mencionados</p>
                {acuerdos.map((a, i) => <p key={`a${i}`} className="text-xs text-slate-200">• {a}</p>)}
                {votaciones.map((v, i) => <p key={`v${i}`} className="text-xs text-slate-200">• {v}</p>)}
              </div>
            )}

            <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl">
              <ExternalLink className="w-4 h-4" /> Abrir en YouTube (canal oficial)
            </a>
          </div>

          {/* Análisis */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Filtrar por orador, tema o palabra…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500" />
              </div>
              {estado === "listo" && partes.some(p => p.disponible) && (
                <button onClick={() => { navigator.clipboard.writeText(analisisATexto(partes)).catch(() => {}); setCopiado(-1); setTimeout(() => setCopiado(null), 2000); }}
                  className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  {copiado === -1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar todo
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {estado === "cargando" && <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Buscando análisis guardado…</div>}

              {(estado === "sin-analisis" || estado === "error") && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                  <Sparkles className="w-7 h-7 text-rose-400 mx-auto" />
                  <p className="text-sm font-bold">{partes.length ? "El análisis quedó incompleto" : "Este video aún no ha sido analizado"}</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    La IA (Gemini) verá el video oficial y registrará quién habló, en qué minuto, qué planteó, y los acuerdos o votaciones mencionados.
                    {totalPartes && totalPartes > 1 ? ` Este video dura ${formatoMinuto(duracion || 0)} y se analizará en ${totalPartes} partes.` : ""}
                    {" "}El resultado se guarda para todos los usuarios.
                  </p>
                  {estado === "error" && mensaje && <p className="text-xs text-amber-300 flex items-center justify-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {mensaje}</p>}
                  <button onClick={analizar} disabled={!id}
                    className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer">
                    {estado === "error" ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />} {partes.length ? "Continuar análisis" : "Analizar video"}
                  </button>
                </div>
              )}

              {estado === "analizando" && (
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
                  <Loader2 className="w-4 h-4 animate-spin" /> {mensaje}
                </div>
              )}
              {estado === "listo" && mensaje && (
                <p className="text-xs text-amber-300 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {mensaje}</p>
              )}

              {partes.filter(p => p.disponible && p.resumen).map(p => (
                <div key={`r${p.parte}`} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Resumen {partes.length > 1 ? `(${formatoMinuto(p.desde)}${p.hasta ? `–${formatoMinuto(p.hasta)}` : ""})` : ""}
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">{p.resumen}</p>
                  {p.temas && p.temas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">{p.temas.map(t => <span key={t} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{t}</span>)}</div>
                  )}
                </div>
              ))}

              {intervenciones.map((i, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 hover:border-slate-700">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setInicio(i.segundos)} className="font-mono text-[11px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded cursor-pointer hover:bg-rose-500/20">
                        ▶ {formatoMinuto(i.segundos)}
                      </button>
                      <span className="text-xs font-bold text-white">{i.orador}</span>
                      {i.cargo && <span className="text-[11px] text-slate-400">{i.cargo}</span>}
                    </div>
                    <button onClick={() => copiar(i, idx)} className="text-slate-500 hover:text-white cursor-pointer" title="Copiar con referencia">
                      {copiado === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{i.resumen}</p>
                  {i.cita && <p className="text-xs text-slate-200 italic mt-1.5 flex gap-1.5"><Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />{i.cita}</p>}
                </div>
              ))}

              {estado === "listo" && partes.some(p => p.disponible) && (
                <p className="text-[10px] text-slate-500 leading-relaxed pt-2">
                  Análisis automático generado por IA a partir del video oficial publicado en YouTube. No es una versión taquigráfica oficial: puede contener errores en nombres, cargos o citas. Verifique en el video usando los minutos indicados.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
