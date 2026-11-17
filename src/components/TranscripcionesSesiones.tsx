import React, { useEffect, useState } from "react";
import { FileText, ScrollText } from "lucide-react";
import YouTubeTranscriptModal from "./YouTubeTranscriptModal";
import type { RegistroVideoSesion } from "../services/firebaseService";
import { tiempoDeSesion } from "../utils/boletines";

/**
 * Lista de sesiones de comisión con transcripción o informe guardados. Cada una se puede abrir directamente en la
 * transcripción o en el informe. Se usa en la comisión (todas sus sesiones) y en el proyecto (sesiones donde se habló de él).
 */
export default function TranscripcionesSesiones({ cargar, clave, titulo, descripcion, vacio, mostrarComision = true }: {
  cargar: () => Promise<RegistroVideoSesion[]>;
  clave: string;
  titulo: string;
  descripcion: string;
  vacio: string;
  mostrarComision?: boolean;
}) {
  const [registros, setRegistros] = useState<RegistroVideoSesion[] | null>(null);
  const [abierto, setAbierto] = useState<{ r: RegistroVideoSesion; vista: "informe" | "transcripcion" } | null>(null);

  const leer = () => {
    setRegistros(null);
    cargar().then((r) => setRegistros([...r].sort((a, b) => tiempoDeSesion(b.fecha) - tiempoDeSesion(a.fecha)))).catch(() => setRegistros([]));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(leer, [clave]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{titulo}</h3>
        <p className="text-xs text-slate-500">{descripcion}</p>
      </div>
      {registros === null && <p className="text-xs text-slate-500">Buscando sesiones guardadas…</p>}
      {registros && registros.length === 0 && <p className="text-xs text-slate-500 italic">{vacio}</p>}
      {registros && registros.map((r) => (
        <div key={r.videoId} className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/60">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-slate-900 truncate">{mostrarComision ? `${r.comision || "Comisión no informada"} · ` : ""}{r.fecha || "Fecha no informada"}</p>
            {r.tabla && r.tabla.length > 0 && <p className="text-[11px] text-slate-600 line-clamp-2" title={r.tabla.join(" · ")}>Tabla: {r.tabla.join(" · ")}</p>}
            <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] font-bold">
              {r.tieneTranscripcion && <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-2 py-0.5">Transcripción{r.transcripcionCompleta ? "" : " (incompleta)"}</span>}
              {r.tieneInforme && <span className="bg-blue-50 text-blue-800 border border-blue-200 rounded-full px-2 py-0.5">Informe</span>}
              {r.boletines.length > 0 && <span className="bg-white text-slate-600 border border-slate-200 rounded-full px-2 py-0.5" title={r.boletines.join(", ")}>{r.boletines.length} {r.boletines.length === 1 ? "boletín" : "boletines"}</span>}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {r.tieneTranscripcion && (
              <button onClick={() => setAbierto({ r, vista: "transcripcion" })} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1"><ScrollText className="w-3.5 h-3.5" />Ver transcripción</button>
            )}
            <button onClick={() => setAbierto({ r, vista: "informe" })} className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{r.tieneInforme ? "Ver informe" : "Generar informe"}</button>
          </div>
        </div>
      ))}
      {abierto && (
        <YouTubeTranscriptModal
          isOpen={true}
          onClose={() => { setAbierto(null); leer(); }}
          videoTitle={abierto.r.titulo || `Sesión ${abierto.r.comision || ""}`}
          videoUrl={`https://www.youtube.com/watch?v=${abierto.r.videoId}`}
          videoId={abierto.r.videoId}
          comisionNombre={abierto.r.comision || ""}
          sesionFecha={abierto.r.fecha || ""}
          tabla={abierto.r.tabla}
          boletines={abierto.r.boletines}
          vistaInicial={abierto.vista}
        />
      )}
    </div>
  );
}
