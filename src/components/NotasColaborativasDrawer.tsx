import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Sparkles, 
  Users, 
  Cloud, 
  CloudCheck, 
  Lock, 
  Share2, 
  Check, 
  Tag,
  Clock,
  RotateCcw,
  ShieldCheck,
  X
} from "lucide-react";
import { 
  NotaColaborativa, 
  saveNotaColaborativaToFirestore, 
  getNotasColaborativasFromFirestore 
} from "../services/firebaseService";

interface NotasColaborativasDrawerProps {
  targetId: string; // e.g. "cd-agricultura" or "17006-01"
  targetName: string;
  targetType: "comision" | "proyecto";
  isOpen: boolean;
  onClose: () => void;
}

export default function NotasColaborativasDrawer({
  targetId,
  targetName,
  targetType,
  isOpen,
  onClose
}: NotasColaborativasDrawerProps) {
  const [notas, setNotas] = useState<NotaColaborativa[]>([]);
  const [loading, setLoading] = useState(false);
  const [autorName, setAutorName] = useState(() => localStorage.getItem("legisTrack_user_name") || "Asesor Legislativo");
  const [autorRol, setAutorRol] = useState(() => localStorage.getItem("legisTrack_user_role") || "Analista de Políticas Públicas");
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [categoria, setCategoria] = useState<"Estrategia" | "Observación Jurídica" | "Alerta Política" | "Minuta">("Observación Jurídica");
  const [syncToast, setSyncToast] = useState(false);

  const storageKey = `local_notas_${targetId}`;

  // Load notes on open
  useEffect(() => {
    if (!isOpen || !targetId) return;

    setLoading(true);

    // 1. Load local cache
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setNotas(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load local notes cache:", e);
    }

    // 2. Fetch from Firebase Firestore
    getNotasColaborativasFromFirestore(targetId)
      .then((cloudNotas) => {
        if (cloudNotas && cloudNotas.length > 0) {
          setNotas(cloudNotas);
          localStorage.setItem(storageKey, JSON.stringify(cloudNotas));
        }
      })
      .catch(err => {
        console.warn("Firestore fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, targetId]);

  if (!isOpen) return null;

  const handleCreateNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoContenido.trim()) return;

    const nuevaNota: NotaColaborativa = {
      id: `nota_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      targetId,
      targetType,
      autor: autorName.trim() || "Asesor Legislativo",
      autorRol: autorRol.trim() || "Analista",
      contenido: nuevoContenido.trim(),
      categoria,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("legisTrack_user_name", nuevaNota.autor);
    localStorage.setItem("legisTrack_user_role", nuevaNota.autorRol || "");

    const updated = [nuevaNota, ...notas];
    setNotas(updated);
    setNuevoContenido("");
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Save to Firebase Firestore Cloud
    saveNotaColaborativaToFirestore(nuevaNota).then(() => {
      setSyncToast(true);
      setTimeout(() => setSyncToast(false), 2500);
    });
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "Alerta Política":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "Estrategia":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Minuta":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex justify-end backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-slate-900 border-l border-slate-800 text-white w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">Notas Colaborativas en la Nube</h3>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Firebase Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-xs">
                {targetName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Indicator Toast */}
        {syncToast && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/30 text-emerald-300 text-xs px-4 py-2 flex items-center gap-2 font-bold animate-fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nota sincronizada en tiempo real con Google Cloud Firestore</span>
          </div>
        )}

        {/* List of Notes */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {notas.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto border border-slate-700">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">Sin notas aún</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Escribe comentarios, acuerdos internos de bancada o análisis jurídicos para compartirlos con tu equipo en la nube.
                </p>
              </div>
            </div>
          ) : (
            notas.map((nota) => (
              <div
                key={nota.id}
                className="bg-slate-850/80 border border-slate-800 p-4 rounded-2xl space-y-2.5 transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{nota.autor}</span>
                    {nota.autorRol && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({nota.autorRol})
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getCategoryBadge(nota.categoria)}`}>
                    {nota.categoria}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                  {nota.contenido}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(nota.createdAt).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  <span className="text-emerald-400 font-bold">● Sincronizado</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleCreateNota} className="p-4 bg-slate-850 border-t border-slate-800 space-y-3 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={autorName}
              onChange={(e) => setAutorName(e.target.value)}
              placeholder="Tu Nombre / Iniciales"
              className="bg-slate-900 border border-slate-750 text-white rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:border-blue-500"
            />
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as any)}
              className="bg-slate-900 border border-slate-750 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="Observación Jurídica">Observación Jurídica</option>
              <option value="Alerta Política">Alerta Política</option>
              <option value="Estrategia">Estrategia de Votación</option>
              <option value="Minuta">Minuta Rápida</option>
            </select>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={nuevoContenido}
              onChange={(e) => setNuevoContenido(e.target.value)}
              placeholder="Escribe un apunte privado o sugerencia técnica para el equipo..."
              className="w-full bg-slate-900 border border-slate-750 text-white rounded-xl p-3 text-xs font-medium outline-none focus:border-blue-500 leading-relaxed placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Privado para tu organización
            </span>

            <button
              type="submit"
              disabled={!nuevoContenido.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Guardar en Cloud</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
