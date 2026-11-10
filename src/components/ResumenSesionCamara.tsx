import React, { useMemo, useState } from "react";
import { construirResumenSesionCamara, type SesionCamaraBase } from "../utils/resumenSesionCamara";

const NI = <span className="text-slate-400 italic">No informado</span>;

/** Resumen completo de una sesión de la Cámara, solo con la citación, el resultado y el video oficiales (sin IA). */
export default function ResumenSesionCamara({ sesion }: { sesion: SesionCamaraBase }) {
  const [abierto, setAbierto] = useState(false);
  const r = useMemo(() => construirResumenSesionCamara(sesion), [sesion]);
  const e = r.estadisticas;
  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => setAbierto((v) => !v)} className="text-left text-[11px] font-bold text-blue-700 hover:underline cursor-pointer w-max">
        {abierto ? "▾ Ocultar resumen de la sesión" : "▸ Ver resumen de la sesión"}
      </button>
      {abierto && (
        <div className="border border-slate-200 rounded-xl bg-slate-50/60 p-3.5 flex flex-col gap-3 text-[11px] text-slate-700 leading-relaxed">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span><strong>Fecha:</strong> {r.fecha || NI}</span>
            <span><strong>Horario:</strong> {r.hora || NI}</span>
            <span><strong>Lugar:</strong> {r.lugar || NI}</span>
            <span><strong>Boletines tratados:</strong> {r.boletines.length ? r.boletines.join(", ") : NI}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
            {[`${e.puntos} punto(s) de tabla`, `${e.boletines} boletín(es)`, e.asistentes > 1 ? `${e.asistentes} diputados asistentes` : e.asistentes === 1 ? "asistencia informada" : "asistencia no informada", e.conResultado ? "con resultado oficial" : "sin resultado oficial publicado", e.conVideo ? "con video oficial" : "sin video"].map((t) => (
              <span key={t} className="bg-white border border-slate-200 rounded-full px-2 py-0.5">{t}</span>
            ))}
          </div>
          <div>
            <strong>Tabla de la citación:</strong>
            {r.puntos.length ? <ol className="list-decimal ml-5 mt-1 space-y-1">{r.puntos.map((p, i) => <li key={i} className="whitespace-pre-line">{p}</li>)}</ol> : <> {NI}</>}
          </div>
          <div><strong>Invitados según la citación:</strong> {r.invitados ? <span className="whitespace-pre-line">{r.invitados}</span> : NI}</div>
          <div className="bg-white border border-slate-200 rounded-lg p-2.5">
            <strong>Resultado oficial de la sesión:</strong>{" "}
            {r.resultado ? <span className="whitespace-pre-line">{r.resultado}</span> : <span className="text-slate-400 italic">La Cámara no ha publicado el resultado de esta sesión (o aún no se ha sincronizado).</span>}
          </div>
          <div><strong>Diputadas y diputados asistentes:</strong> {r.asistentes.length ? r.asistentes.join("; ") : NI}</div>
          {r.reemplazos && <div><strong>Reemplazos:</strong> {r.reemplazos}</div>}
          {r.otrosAsistentes && <div><strong>Otros diputados asistentes:</strong> {r.otrosAsistentes}</div>}
          {r.videoUrl && (
            <div><strong>Video oficial:</strong> <a href={r.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">ver en YouTube</a>{r.duracionVideo ? ` (${r.duracionVideo})` : ""}</div>
          )}
          <div className="text-[10px] text-slate-400">Fuente: {r.fuente || "no informada"}. Acuerdos y votaciones: no disponibles en esta fuente.</div>
        </div>
      )}
    </div>
  );
}
