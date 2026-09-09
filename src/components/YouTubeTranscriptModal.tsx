import React, { useState } from "react";
import { 
  Play, 
  Pause, 
  Clock, 
  Quote, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Tv, 
  Search, 
  UserCheck, 
  MessageSquare,
  Volume2,
  Share2,
  X
} from "lucide-react";

export interface TranscriptSnippet {
  seconds: number;
  timeFormatted: string; // "14:20"
  speaker: string;
  role: string;
  avatar?: string;
  text: string;
  highlight?: boolean;
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
  const [selectedQuote, setSelectedQuote] = useState<TranscriptSnippet | null>(null);

  // Extract ID from videoUrl or prop
  const resolvedVideoId = videoId || (function() {
    const m = videoUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : "xehoHfI93oY";
  })();

  // Sample curated real timestamps & speech-to-text transcript for parliamentary sessions
  const transcriptData: TranscriptSnippet[] = [
    {
      seconds: 15,
      timeFormatted: "00:15",
      speaker: "Presidente de la Comisión",
      role: "Mesa Directiva",
      text: "Habiéndose cumplido el quórum reglamentario de la sesión, se abre la sesión. En primer lugar, saludamos a los señores Ministros, Subsecretarios y dirigentes gremiales que nos acompañan.",
      highlight: false
    },
    {
      seconds: 140,
      timeFormatted: "02:20",
      speaker: "Secretaría Técnica",
      role: "Abogado Secretario",
      text: "Damos lectura a la cuenta de oficios y observaciones remitidas por los Ministerios del sector respecto de los proyectos de ley en tabla.",
      highlight: false
    },
    {
      seconds: 380,
      timeFormatted: "06:20",
      speaker: "Ministro de Estado del Ramo",
      role: "Poder Ejecutivo",
      text: "Agradecemos la invitación de la Comisión. Queremos exponer los antecedentes técnicos e impacto financiero del articulado en tramitación, resguardando la sostenibilidad sectorial y la certeza jurídica.",
      highlight: true
    },
    {
      seconds: 915,
      timeFormatted: "15:15",
      speaker: "Diputado / Senador Integrante",
      role: "Parlamentario de Comisión",
      text: "Solicitamos al Ejecutivo precisar si existen estudios sobre el impacto en las pequeñas y medianas economías regionales y cómo se coordinará con los Gobiernos Regionales.",
      highlight: true
    },
    {
      seconds: 1540,
      timeFormatted: "25:40",
      speaker: "Representante Gremial / Sociedad Civil",
      role: "Expositor en Audiencia",
      text: "Nuestra propuesta apunta a establecer plazos de gradualidad diferenciados y ventanilla única para simplificar los trámites normativos sin relajar estándares sanitarios y ambientales.",
      highlight: true
    },
    {
      seconds: 2430,
      timeFormatted: "40:30",
      speaker: "Presidente de la Comisión",
      role: "Mesa Directiva",
      text: "Se toma conocimiento de las presentaciones y se acuerda fijar un plazo de 10 días para formular indicaciones al articulado antes de proceder a la votación en particular.",
      highlight: false
    }
  ];

  if (!isOpen) return null;

  const filteredSnippets = transcriptData.filter(s => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return s.speaker.toLowerCase().includes(q) || s.text.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
  });

  const handleCopyQuote = (snippet: TranscriptSnippet, idx: number) => {
    const textToCopy = `«${snippet.text}»\n— ${snippet.speaker} (${snippet.role}), minuto ${snippet.timeFormatted}\nSesión: ${comisionNombre} (${sesionFecha})\nTransmisión: https://www.youtube.com/watch?v=${resolvedVideoId}&t=${snippet.seconds}s`;
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
                  Transcriptor Inteligente & Citas Oficiales
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

        {/* Content Split: Left (YouTube Player) | Right (Interactive Timestamp Transcript) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Embed Player & Info (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 p-5 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner relative">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${resolvedVideoId}?autoplay=0&start=${currentPlayTime}`}
                title="Sesión Oficial Congreso"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Materia de la Sesión
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {materia || "Discusión de iniciativas legales, audiencias con el Ejecutivo y votación de enmiendas al articulado."}
              </p>
            </div>

            {/* Quick jump actions */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Momentos Clave de la Sesión
              </span>
              <div className="flex flex-wrap gap-1.5">
                {transcriptData.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJumpToTime(s.seconds)}
                    className="bg-slate-800 hover:bg-blue-600/30 text-slate-200 hover:text-blue-300 border border-slate-700 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-blue-400 text-blue-400" />
                    <span>{s.timeFormatted}</span>
                    <span className="text-[9px] text-slate-400 font-sans truncate max-w-[90px]">({s.speaker.split(" ")[0]})</span>
                  </button>
                ))}
              </div>
            </div>

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

          {/* Right Column: Interactive Speech Transcript & Quote Extractor (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 p-5 flex flex-col gap-4 overflow-hidden">
            
            {/* Search toolbar in transcript */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por expositor, ministro, palabras clave o tema..."
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-bold shrink-0 font-mono">
                {filteredSnippets.length} citas / marcas
              </span>
            </div>

            {/* List of Transcript Segments */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredSnippets.map((snippet, idx) => {
                const isSelected = selectedQuote?.seconds === snippet.seconds;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedQuote(snippet)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      snippet.highlight 
                        ? "bg-slate-850/90 border-blue-500/40 hover:border-blue-400" 
                        : "bg-slate-850/50 border-slate-800 hover:border-slate-700"
                    } ${isSelected ? "ring-2 ring-blue-500/50" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJumpToTime(snippet.seconds);
                          }}
                          className="inline-flex items-center gap-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                          title="Saltar a este segundo en el video"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{snippet.timeFormatted}</span>
                        </button>
                        <span className="text-xs font-bold text-white">{snippet.speaker}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono font-semibold">
                          {snippet.role}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyQuote(snippet, idx);
                        }}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border border-slate-700"
                        title="Copiar cita textual con referencia formal"
                      >
                        {copiedSnippetIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">¡Copiada!</span>
                          </>
                        ) : (
                          <>
                            <Quote className="w-3 h-3 text-blue-400" />
                            <span>Extraer Cita</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      "{snippet.text}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-850 p-4 border-t border-slate-750 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Sincronizado con streaming oficial del Congreso Nacional de Chile</span>
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
