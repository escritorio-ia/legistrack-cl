import React, { useEffect, useState } from "react";
import { Bot } from "lucide-react";

const ETIQUETAS: Record<string, string> = {
  transcribiendo: "transcribiendo", transcrita: "transcritas", informe_pendiente: "con informe pendiente", informe_listo: "con informe",
  sin_video: "sin video en el canal", error: "con error", buscando_video: "buscando video",
};

/** Avance de la transcripción automática en segundo plano (todas las comisiones). */
export default function EstadoTranscripcionAuto() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { fetch("/api/transcripcion/automatica/estado").then((r) => r.json()).then(setD).catch(() => setD({ error: "sin conexión" })); }, []);
  if (!d) return null;
  if (d.error) return <p className="text-[11px] text-slate-400">Estado de la transcripción automática no disponible.</p>;
  const c = d.configuracion || {};
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
      <p className="font-bold flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-blue-600" /> Transcripción automática: {c.activa ? "activa" : "desactivada"}</p>
      {c.activa && (
        <p className="mt-1">
          Recorre las sesiones de la más reciente hacia atrás (hasta {c.desde}). Hoy: {d.tramosHoy} de {c.maxTramosDia} tramos de 10 min.
          {Object.keys(d.porEstado || {}).length > 0 && <> Sesiones: {Object.entries(d.porEstado).map(([k, n]) => `${n} ${ETIQUETAS[k] || k}`).join(" · ")}.</>}
        </p>
      )}
    </div>
  );
}
