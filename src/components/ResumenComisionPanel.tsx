import React, { useEffect, useState } from "react";
import { Sparkles, Users, Gavel, FileText, Loader2 } from "lucide-react";
import { getResumenComisionDeProyecto, saveResumenComisionDeProyecto } from "../services/firebaseService";

/** Resumen del paso del proyecto por una comisión, generado desde sus informes oficiales. */
export default function ResumenComisionPanel({ proyectoId, comision }: { proyectoId: string; comision: string }) {
  const [datos, setDatos] = useState<any | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setDatos(null);
    getResumenComisionDeProyecto(proyectoId, comision).then(g => { if (!cancelado && g?.disponible) setDatos(g); });
    return () => { cancelado = true; };
  }, [proyectoId, comision]);

  const generar = () => {
    setCargando(true);
    fetch(`/api/proyecto/${encodeURIComponent(proyectoId)}/comision-resumen?comision=${encodeURIComponent(comision)}`)
      .then(r => r.json())
      .then(d => { setDatos(d); if (d?.disponible) saveResumenComisionDeProyecto(proyectoId, comision, d); })
      .catch(() => setDatos({ disponible: false, motivo: "No se pudo generar el resumen." }))
      .finally(() => setCargando(false));
  };

  return (
    <div className="bg-white border border-indigo-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-black text-indigo-900 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Resumen del paso por la comisión</p>
        {!datos?.disponible && (
          <button type="button" onClick={generar} disabled={cargando}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5">
            {cargando ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Leyendo el informe… (hasta 1 minuto)</> : "Generar resumen desde el informe"}
          </button>
        )}
      </div>

      {datos && !datos.disponible && <p className="text-xs text-amber-700">{datos.motivo}</p>}

      {datos?.disponible && (
        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex flex-wrap gap-2">
            <span className="bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1"><strong>Periodo:</strong> {datos.periodo}</span>
            <span className="bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1"><strong>Sesiones:</strong> {datos.sesiones}</span>
            <span className="bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1"><strong>Expositores:</strong> {datos.expositores?.length || 0}</span>
          </div>

          {datos.resumen && <div className="leading-relaxed space-y-2">{String(datos.resumen).split(/\n\s*\n/).map((p: string, i: number) => <p key={i}>{p}</p>)}</div>}

          {datos.expositores?.length > 0 && (
            <div>
              <p className="font-black text-slate-800 flex items-center gap-1.5 mb-1"><Users className="w-3.5 h-3.5" /> Expositores e invitados</p>
              <ul className="space-y-1.5">
                {datos.expositores.map((e: any, i: number) => (
                  <li key={i} className="border-l-2 border-indigo-200 pl-2">
                    <span className="font-bold text-slate-900">{e.nombre}</span>{e.cargo && <span className="text-slate-500"> · {e.cargo}</span>}
                    {e.planteo && <p className="text-slate-600">{e.planteo}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {datos.votaciones?.length > 0 && (
            <div>
              <p className="font-black text-slate-800 flex items-center gap-1.5 mb-1"><Gavel className="w-3.5 h-3.5" /> Votaciones</p>
              <ul className="list-disc ml-5 space-y-0.5">{datos.votaciones.map((v: string, i: number) => <li key={i}>{v}</li>)}</ul>
            </div>
          )}

          {datos.cambios?.length > 0 && (
            <div>
              <p className="font-black text-slate-800 mb-1">Cambios y acuerdos</p>
              <ul className="list-disc ml-5 space-y-0.5">{datos.cambios.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}

          <p className="text-[10px] text-slate-500 flex flex-wrap items-center gap-1">
            <FileText className="w-3 h-3" /> Generado con IA desde:
            {(datos.informes || []).map((inf: any, i: number) => (
              <a key={i} href={inf.url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 font-bold hover:underline">{inf.titulo}</a>
            ))}
            . Verifique en el informe original.
          </p>
        </div>
      )}
    </div>
  );
}
