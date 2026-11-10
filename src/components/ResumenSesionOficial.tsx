import React, { useState } from "react";

interface Punto { numero: string; boletin: string | null; tema: string; aspectos: string | null; acuerdos: string | null; invitados: string[]; asistentes: string[] }
interface Resumen {
  disponible: boolean; motivo?: string; url?: string; fuente: string;
  encabezado?: { comision: string | null; fecha: string | null; inicio: string | null; termino: string | null; duracionMin: number | null; lugar: string | null };
  asistentes: string[]; invitados: string[]; boletines: string[]; puntos: Punto[]; presentaciones: { titulo: string; url: string }[];
  estadisticas?: { puntos: number; conAcuerdos: number; sinAcuerdos: number; boletines: number; invitados: number; asistentes: number };
}

const NI = <span className="text-slate-400 italic">No informado</span>;
const dur = (m: number | null) => (m === null ? null : m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);

/** Resumen completo de una sesión del Senado, solo con el registro oficial (sin IA). */
export default function ResumenSesionOficial({ comisionId, sesionId }: { comisionId: string; sesionId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [r, setR] = useState<Resumen | null>(null);

  const alternar = async () => {
    const nuevo = !abierto;
    setAbierto(nuevo);
    if (nuevo && !r && !cargando) {
      setCargando(true);
      try {
        const res = await fetch(`/api/senado/sesion/${comisionId}/${sesionId}/resumen`);
        setR(await res.json());
      } catch {
        setR({ disponible: false, motivo: "No se pudo consultar el resumen.", fuente: "", asistentes: [], invitados: [], boletines: [], puntos: [], presentaciones: [] });
      } finally { setCargando(false); }
    }
  };

  const e = r?.encabezado;
  return (
    <div className="flex flex-col gap-2">
      <button onClick={alternar} className="text-left text-[11px] font-bold text-blue-700 hover:underline cursor-pointer w-max">
        {abierto ? "▾ Ocultar resumen de la sesión" : "▸ Ver resumen de la sesión"}
      </button>
      {abierto && (
        <div className="border border-slate-200 rounded-xl bg-slate-50/60 p-3.5 flex flex-col gap-3 text-[11px] text-slate-700 leading-relaxed">
          {cargando && <span className="text-slate-500">Cargando registro oficial…</span>}
          {r && !r.disponible && <span className="text-amber-700">Resumen no disponible: {r.motivo}</span>}
          {r?.disponible && e && (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span><strong>Fecha:</strong> {e.fecha || NI}</span>
                <span><strong>Horario:</strong> {e.inicio ? `${e.inicio}${e.termino ? ` a ${e.termino}` : ""}` : NI}{dur(e.duracionMin) ? ` (${dur(e.duracionMin)})` : ""}</span>
                <span><strong>Lugar:</strong> {e.lugar || NI}</span>
                <span><strong>Boletines tratados:</strong> {r.boletines.length ? r.boletines.join(", ") : NI}</span>
              </div>
              {r.estadisticas && (
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  {[`${r.estadisticas.puntos} punto(s) de tabla`, `${r.estadisticas.conAcuerdos} con acuerdo`, `${r.estadisticas.sinAcuerdos} sin acuerdo registrado`, `${r.estadisticas.asistentes} integrante(s)`, `${r.estadisticas.invitados} invitado(s)`].map(t => (
                    <span key={t} className="bg-white border border-slate-200 rounded-full px-2 py-0.5">{t}</span>
                  ))}
                </div>
              )}
              <div><strong>Integrantes presentes:</strong> {r.asistentes.length ? r.asistentes.join("; ") : NI}</div>
              <div><strong>Invitados y expositores:</strong> {r.invitados.length ? r.invitados.join("; ") : NI}</div>
              <div className="flex flex-col gap-2.5">
                {r.puntos.length === 0 && <span>Puntos de tabla: {NI}</span>}
                {r.puntos.map((p, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <div className="font-extrabold text-slate-900">{p.numero ? `${p.numero}. ` : ""}{p.tema}{p.boletin ? ` (Boletín ${p.boletin})` : ""}</div>
                    <div className="mt-1"><strong>Lo tratado:</strong> {p.aspectos ? <span className="whitespace-pre-line">{p.aspectos}</span> : NI}</div>
                    <div className="mt-1"><strong>Acuerdo:</strong> {p.acuerdos ? <span className="whitespace-pre-line">{p.acuerdos}</span> : <span className="text-slate-400 italic">Sin acuerdo registrado</span>}</div>
                    {p.invitados.length > 0 && <div className="mt-1"><strong>Invitados:</strong> {p.invitados.join("; ")}</div>}
                  </div>
                ))}
              </div>
              {r.presentaciones.length > 0 && (
                <div><strong>Presentaciones:</strong>{" "}
                  {r.presentaciones.map((x, i) => <a key={i} href={x.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline mr-2">{x.titulo}</a>)}
                </div>
              )}
              <div className="text-[10px] text-slate-400">Fuente: {r.fuente}{r.url ? <> · <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">ver original</a></> : null}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
