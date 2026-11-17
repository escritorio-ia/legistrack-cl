import React, { useState } from "react";
import type { SesionRegistradaUI } from "../utils/metricasBoletin";

/** Lo que el registro oficial guarda de una sesión: pauta con lo tratado y acordado por punto, resultado y fuentes. */
export default function RegistroSesionDetalle({ registro, onAbrirBoletin }: { registro: SesionRegistradaUI; onAbrirBoletin?: (b: string) => void }) {
  const [abierto, setAbierto] = useState(false);
  const conDetalle = registro.puntos.some((p) => p.aspectos || p.acuerdos || p.asistentes);
  const asistentes = Array.from(new Set(registro.puntos.flatMap((p) => String(p.asistentes || "").split(";").map((x) => x.trim()).filter(Boolean))));
  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => setAbierto((v) => !v)} className="text-left text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer w-max">
        {abierto ? "▾ Ocultar registro oficial" : "▸ Registro oficial de la sesión"}
        <span className="text-slate-400 font-normal"> · {registro.fuentes.join(", ")}</span>
      </button>
      {abierto && (
        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-3 flex flex-col gap-2.5 text-[11px] text-slate-700">
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            <span><strong>Horario:</strong> {registro.hora || "No informado"}</span>
            <span><strong>Lugar:</strong> {registro.lugar || "No informado"}</span>
            {registro.citacionNumero && <span><strong>{registro.citacionNumero}</strong></span>}
          </div>
          {registro.puntos.length > 0 && (
            <ol className="flex flex-col gap-2">
              {registro.puntos.map((p) => (
                <li key={p.numero} className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <p className="font-bold text-slate-900">{p.numero}. {p.texto}</p>
                  {p.boletines.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.boletines.map((b) => (
                        <button key={b} onClick={() => onAbrirBoletin?.(b)} className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded px-1.5 py-0.5 cursor-pointer hover:bg-blue-100">{b}</button>
                      ))}
                    </div>
                  )}
                  {conDetalle && <p className="mt-1"><strong>Lo tratado:</strong> {p.aspectos ? <span className="whitespace-pre-line">{p.aspectos}</span> : <span className="italic text-slate-400">No informado</span>}</p>}
                  {conDetalle && <p className="mt-1"><strong>Acuerdo:</strong> {p.acuerdos ? <span className="whitespace-pre-line">{p.acuerdos}</span> : <span className="italic text-slate-400">Sin acuerdo registrado</span>}</p>}
                  {p.invitados && <p className="mt-1"><strong>Invitados:</strong> {p.invitados}</p>}
                </li>
              ))}
            </ol>
          )}
          {registro.invitados && <p><strong>Invitados según la citación:</strong> {registro.invitados}</p>}
          {registro.resultado && <div className="bg-white border border-slate-200 rounded-lg p-2.5"><strong>Resultado oficial:</strong> <span className="whitespace-pre-line">{registro.resultado}</span></div>}
          {asistentes.length > 0 && <p><strong>Asistentes:</strong> {asistentes.join("; ")}</p>}
          {!conDetalle && !registro.resultado && <p className="italic text-slate-500">Aún no hay detalle ni resultado oficial publicado para esta sesión; solo la citación.</p>}
          {registro.enlaces.length > 0 && (
            <p className="text-[10px] text-slate-500">Fuentes: {registro.enlaces.map((u, i) => <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="underline mr-2">enlace {i + 1}</a>)}</p>
          )}
        </div>
      )}
    </div>
  );
}
