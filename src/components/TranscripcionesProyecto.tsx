import React, { useEffect, useState } from "react";
import YouTubeTranscriptModal from "./YouTubeTranscriptModal";
import { getRegistrosVideoPorBoletin, type RegistroVideoSesion } from "../services/firebaseService";
import { tiempoDeSesion } from "../utils/boletines";

/**
 * Sesiones de comisión que trataron este boletín (según la tabla de su citación) y que tienen análisis o
 * transcripción guardados. Ordenadas de la más reciente a la más antigua.
 */
export default function TranscripcionesProyecto({ proyectoId }: { proyectoId: string }) {
  const [registros, setRegistros] = useState<RegistroVideoSesion[] | null>(null);
  const [abierto, setAbierto] = useState<RegistroVideoSesion | null>(null);

  const cargar = () => {
    setRegistros(null);
    getRegistrosVideoPorBoletin(proyectoId)
      .then((r) => setRegistros([...r].sort((a, b) => tiempoDeSesion(b.fecha) - tiempoDeSesion(a.fecha))))
      .catch(() => setRegistros([]));
  };
  useEffect(cargar, [proyectoId]);

  return (
    <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3" id="transcripciones-proyecto">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sesiones de comisión con análisis o transcripción</h3>
        <p className="text-xs text-slate-500">Sesiones cuya tabla incluye este boletín y cuyo video ya fue procesado. Son resultados automáticos del video oficial, no actas oficiales.</p>
      </div>
      {registros === null && <p className="text-xs text-slate-500">Buscando sesiones guardadas…</p>}
      {registros && registros.length === 0 && (
        <p className="text-xs text-slate-500 italic">
          Aún no hay sesiones guardadas bajo este boletín. Aparecen aquí cuando se analiza o transcribe el video de una sesión cuya tabla lo incluye
          (desde las sesiones de más abajo o desde la comisión).
        </p>
      )}
      {registros && registros.map((r) => (
        <div key={r.videoId} className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/60">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-slate-900 truncate">{r.comision || "Comisión no informada"} · {r.fecha || "fecha no informada"}</p>
            {r.tabla && r.tabla.length > 0 && <p className="text-[11px] text-slate-600 line-clamp-2" title={r.tabla.join(" · ")}>Tabla: {r.tabla.join(" · ")}</p>}
            <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] font-bold">
              {r.tieneTranscripcion && <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-2 py-0.5">Transcripción{r.transcripcionCompleta ? "" : " (incompleta)"}</span>}
              {r.tieneAnalisis && <span className="bg-blue-50 text-blue-800 border border-blue-200 rounded-full px-2 py-0.5">Análisis{r.analisisCompleto ? "" : " (incompleto)"}</span>}
              {r.boletines.length > 1 && <span className="bg-white text-slate-600 border border-slate-200 rounded-full px-2 py-0.5" title={r.boletines.join(", ")}>Sesión con {r.boletines.length} boletines en tabla</span>}
            </div>
          </div>
          <button onClick={() => setAbierto(r)} className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl cursor-pointer shrink-0">Abrir</button>
        </div>
      ))}
      {abierto && (
        <YouTubeTranscriptModal
          isOpen={true}
          onClose={() => { setAbierto(null); cargar(); }}
          videoTitle={abierto.titulo || `Sesión ${abierto.comision || ""}`}
          videoUrl={`https://www.youtube.com/watch?v=${abierto.videoId}`}
          videoId={abierto.videoId}
          comisionNombre={abierto.comision || ""}
          sesionFecha={abierto.fecha || ""}
          tabla={abierto.tabla}
          boletines={abierto.boletines}
        />
      )}
    </div>
  );
}
