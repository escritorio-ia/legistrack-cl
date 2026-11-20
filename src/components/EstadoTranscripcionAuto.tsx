import React, { useEffect, useState } from "react";
import { Bot, Play, Square, Loader2 } from "lucide-react";

const ETIQUETAS: Record<string, string> = {
  transcribiendo: "transcribiendo", transcrita: "transcritas", informe_pendiente: "con informe pendiente", informe_listo: "con informe",
  sin_video: "sin video en el canal", error: "con error", buscando_video: "buscando video",
};
const ACCION: Record<string, string> = {
  transcribir: "Transcribió", informe: "Redactó informe", sin_video: "Sin video", ya_transcrita: "Ya estaba transcrita",
  nada: "No queda nada por transcribir", tope: "Tope diario alcanzado", inactiva: "Desactivada en el servidor", ocupado: "Otro paso en curso", error: "Error",
};

/** Transcripción automática: iniciar o detener desde el navegador y ver el avance. */
export default function EstadoTranscripcionAuto() {
  const [d, setD] = useState<any>(null);
  const [enviando, setEnviando] = useState(false);
  const leer = () => fetch("/api/transcripcion/automatica/estado").then((r) => r.json()).then(setD).catch(() => setD({ error: "sin conexión" }));
  useEffect(() => { leer(); const t = setInterval(leer, 120000); return () => clearInterval(t); }, []);
  const accion = async (que: "iniciar" | "detener") => {
    setEnviando(true);
    await fetch(`/api/transcripcion/automatica/${que}`, { method: "POST" }).catch(() => {});
    await leer();
    setEnviando(false);
  };
  if (!d) return null;
  if (d.error) return <p className="text-[11px] text-slate-400">Estado de la transcripción automática no disponible.</p>;
  const c = d.configuracion || {};
  const activa = !!d.control?.activa;
  const u = d.control?.ultimoPaso;
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-blue-600" /> Transcripción automática:
          <span className={activa ? "text-emerald-700" : "text-slate-500"}>{!c.activa ? "desactivada en el servidor" : activa ? "en marcha" : "detenida"}</span>
          {activa && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
        </p>
        {c.activa && (
          activa
            ? <button onClick={() => accion("detener")} disabled={enviando} className="text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1 cursor-pointer disabled:opacity-50">{enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />} Detener</button>
            : <button onClick={() => accion("iniciar")} disabled={enviando} className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 py-1 flex items-center gap-1 cursor-pointer disabled:opacity-50">{enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Iniciar</button>
        )}
      </div>
      {c.activa && (
        <>
          <p className="mt-1">
            Recorre las sesiones de la más reciente hacia atrás (hasta {c.desde}). Hoy: <b>{d.tramosHoy} de {c.maxTramosDia}</b> tramos de 10 min.
            {Object.keys(d.porEstado || {}).length > 0 && <> Sesiones: {Object.entries(d.porEstado).map(([k, n]) => `${n} ${ETIQUETAS[k] || k}`).join(" · ")}.</>}
          </p>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (d.tramosHoy / Math.max(1, c.maxTramosDia)) * 100)}%` }} /></div>
          {u && <p className="mt-1.5 text-[11px] text-slate-500">Último paso ({new Date(u.fecha).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}): {ACCION[u.accion] || u.accion}{u.sesion ? ` · ${u.sesion}` : ""}{u.detalle && u.accion !== "transcribir" ? "" : u.detalle ? ` · ${u.detalle}` : ""}</p>}
          {activa && <p className="mt-1 text-[10.5px] text-slate-400">Sigue sola aunque cierres el navegador. Se detiene al llegar al tope del día y se retoma cada mañana.</p>}
        </>
      )}
    </div>
  );
}
