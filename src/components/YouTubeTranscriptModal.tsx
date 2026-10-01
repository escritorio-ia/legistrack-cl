import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Quote,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Tv,
  Search,
  MessageSquare,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X
} from "lucide-react";

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

const POLL_MS = 25000;

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
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);

  const [segments, setSegments] = useState<TranscriptSnippet[]>([]);
  const [disponible, setDisponible] = useState<boolean | null>(null);
  const [motivo, setMotivo] = useState<string>("");
  const [cargando, setCargando] = useState(false);
  const [auto, setAuto] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Extract ID from videoUrl or prop
  const resolvedVideoId = videoId || (function () {
    const m = videoUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : "";
  })();

  const cargarTranscripcion = async () => {
    if (!resolvedVideoId) {
      setDisponible(false);
      setMotivo("No se identificó el video de esta sesión.");
      return;
    }
    setCargando(true);
    try {
      const res = await fetch(`/api/comisiones/sesion/transcripcion-vivo?videoId=${encodeURIComponent(resolvedVideoId)}`);
      const data = await res.json();
      if (data.disponible && Array.isArray(data.segments) && data.segments.length > 0) {
        setSegments(data.segments);
        setAuto(!!data.auto);
        setDisponible(true);
        setMotivo("");
      } else {
        setDisponible(false);
        setMotivo(data.motivo || "Transcripción no disponible por ahora.");
      }
      setUltimaActualizacion(new Date());
    } catch {
      setDisponible(false);
      setMotivo("No se pudo conectar con el servicio de transcripción.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    setSegments([]);
    setDisponible(null);
    setMotivo("");
    cargarTranscripcion();
    pollRef.current = setInterval(cargarTranscripcion, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resolvedVideoId]);

  if (!isOpen) return null;

  const filteredSnippets = segments.filter((s) => {
    if (!searchTerm) return true;
    return s.text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCopyQuote = (snippet: TranscriptSnippet, idx: number) => {
    const textToCopy = `«${snippet.text}»\n— Transcripción automática, minuto ${snippet.timeFormatted}\nSesión: ${comisionNombre} (${sesionFecha})\nTransmisión: https://www.youtube.com/watch?v=${resolvedVideoId}&t=${snippet.seconds}s`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSnippetIdx(idx);
    setTimeout(() => setCopiedSnippetIdx(null), 2500);
  };

  const handleJumpToTime = (seconds: number) => {
    setCurrentPlayTime(seconds);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-750 text-white rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh]">

        {/* Header */}
        <div className="bg-slate-850 px-6 py-4 border-b border-slate-750 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
                  Transcripción en Vivo (Subtítulos YouTube)
                </span>
                <span className="text-[11px] text-slate-400 font-mono font-bold">
                  {sesionFecha}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-0.5 truncate max-w-xl">
                {videoTitle || `Transmisión Oficial - ${comisionNombre}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Left (YouTube Player) | Right (Real Transcript) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">

          {/* Left Column: Embed Player & Info (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 p-5 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner relative">
              {resolvedVideoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${resolvedVideoId}?autoplay=0&start=${currentPlayTime}`}
                  title="Sesión Oficial Congreso"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-semibold">
                  Video no identificado
                </div>
              )}
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Materia de la Sesión
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {materia || "Sin materia informada para esta sesión."}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Cómo funciona
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Este panel consulta cada {POLL_MS / 1000}s los subtítulos reales que YouTube genera para la transmisión oficial del canal ({comisionNombre}). No hay texto inventado: si la sesión aún no tiene subtítulos o YouTube bloquea la consulta, se indica explícitamente.
              </p>
            </div>

            <button
              onClick={cargarTranscripcion}
              disabled={cargando}
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Actualizar ahora</span>
            </button>

            <a
              href={`https://www.youtube.com/watch?v=${resolvedVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-colors"
            >
              <span>Abrir en YouTube Oficial</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column: Real Transcript */}
          <div className="lg:col-span-7 bg-slate-900 p-5 flex flex-col gap-4 overflow-hidden">

            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por palabra o tema dentro de la transcripción..."
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-bold shrink-0 font-mono">
                {filteredSnippets.length} fragmentos
              </span>
            </div>

            {disponible === false && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-300">Transcripción no disponible en este momento</p>
                  <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">{motivo}</p>
                </div>
              </div>
            )}

            {disponible === null && cargando && (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-semibold gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando subtítulos reales de la transmisión...
              </div>
            )}

            {disponible && (
              <>
                {auto && (
                  <p className="text-[10px] text-slate-500 font-semibold -mt-1">
                    Subtítulos automáticos de YouTube (no oficiales) — pueden contener errores de reconocimiento de voz.
                  </p>
                )}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {filteredSnippets.map((snippet, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-800 bg-slate-850/50 hover:border-slate-700 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleJumpToTime(snippet.seconds)}
                          className="inline-flex items-center gap-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                          title="Saltar a este segundo en el video"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{snippet.timeFormatted}</span>
                        </button>

                        <button
                          onClick={() => handleCopyQuote(snippet, idx)}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border border-slate-700"
                          title="Copiar cita textual con referencia"
                        >
                          {copiedSnippetIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">¡Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Quote className="w-3 h-3 text-blue-400" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        "{snippet.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-850 p-4 border-t border-slate-750 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            {ultimaActualizacion
              ? `Última actualización: ${ultimaActualizacion.toLocaleTimeString("es-CL")} — se refresca cada ${POLL_MS / 1000}s`
              : "Sincronizado con streaming oficial del Congreso Nacional de Chile"}
          </span>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
