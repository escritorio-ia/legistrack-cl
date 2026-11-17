import React, { useEffect, useState } from "react";
import { calcularMetricasBoletin, type MetricasBoletin as M, type SesionRegistradaUI, type TranscripcionUI } from "../utils/metricasBoletin";
import { getRegistrosVideoPorBoletin, getTranscripcionVideoFromFirestore } from "../services/firebaseService";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fmtFecha = (iso: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
};
const fmtDur = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min` : s >= 60 ? `${Math.round(s / 60)} min` : `${s} s`);

/** Métricas del boletín a partir del registro automático de sesiones y de las transcripciones guardadas. */
export default function MetricasBoletin({ proyectoId }: { proyectoId: string }) {
  const [m, setM] = useState<M | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verAcuerdos, setVerAcuerdos] = useState(false);
  const [verInvitados, setVerInvitados] = useState(false);

  useEffect(() => {
    let vigente = true;
    setM(null); setError(null);
    (async () => {
      try {
        const d = await fetch(`/api/proyecto/${encodeURIComponent(proyectoId)}/registro-sesiones`).then((r) => r.json());
        if (!d?.disponible) throw new Error(d?.motivo || "registro no disponible");
        const sesiones: SesionRegistradaUI[] = d.sesiones || [];
        // Transcripciones guardadas de sesiones de este boletín (automáticas).
        const videos = await getRegistrosVideoPorBoletin(proyectoId).catch(() => []);
        const transcripciones: TranscripcionUI[] = [];
        for (const v of videos.filter((x) => x.tieneTranscripcion)) {
          const t = await getTranscripcionVideoFromFirestore(v.videoId).catch(() => null);
          const segmentos = (t?.partes || []).filter((p: any) => p?.disponible).flatMap((p: any) => p.segmentos || []);
          if (segmentos.length) transcripciones.push({ videoId: v.videoId, fecha: v.fecha, comision: v.comision, segmentos });
        }
        if (vigente) setM(calcularMetricasBoletin(proyectoId, sesiones, transcripciones));
      } catch (e: any) {
        if (vigente) setError(e?.message || String(e));
      }
    })();
    return () => { vigente = false; };
  }, [proyectoId]);

  const Kpi = ({ titulo, valor, sub }: { titulo: string; valor: string | number; sub?: string }) => (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{titulo}</p>
      <p className="text-lg font-black text-slate-900 leading-tight">{valor}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  );

  return (
    <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 flex flex-col gap-4" id="metricas-boletin">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Métricas del boletín en comisiones</h3>
        <p className="text-xs text-slate-500">Calculadas con el registro automático de sesiones (citaciones, registro y detalle oficiales) y, para los oradores, con las transcripciones automáticas guardadas.</p>
      </div>
      {!m && !error && <p className="text-xs text-slate-500">Calculando…</p>}
      {error && <p className="text-xs text-amber-800">Métricas no disponibles: {error}</p>}
      {m && m.total === 0 && <p className="text-xs text-slate-500 italic">Aún no hay sesiones registradas con este boletín en su pauta. El registro se actualiza solo cada día y cuando llegan citaciones nuevas.</p>}
      {m && m.total > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Kpi titulo="Sesiones realizadas" valor={m.realizadas} sub={m.programadas ? `${m.programadas} programada(s)` : undefined} />
            <Kpi titulo="Comisiones" valor={m.porComision.length} />
            <Kpi titulo="Última sesión" valor={fmtFecha(m.ultima)} sub={m.diasDesdeUltima !== null ? `hace ${m.diasDesdeUltima} día${m.diasDesdeUltima === 1 ? "" : "s"}` : undefined} />
            <Kpi titulo="Próxima citación" valor={fmtFecha(m.proxima)} sub={m.primera ? `primera registrada: ${fmtFecha(m.primera)}` : undefined} />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sesiones por comisión</p>
              {m.porComision.map((c) => (
                <div key={`${c.camara}${c.nombre}`} className="mb-1.5">
                  <div className="flex justify-between text-[11px] text-slate-700"><span className="truncate pr-2" title={c.nombre}>{c.nombre} <span className="text-slate-400">({c.camara})</span></span><span className="font-bold">{c.n}</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.n / Math.max(...m.porComision.map((x) => x.n))) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sesiones por mes</p>
              <div className="flex items-end gap-1.5 h-24">
                {m.porMes.map((x) => (
                  <div key={x.mes} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0" title={`${x.n} sesión(es)`}>
                    <span className="text-[10px] font-bold text-slate-700">{x.n}</span>
                    <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${(x.n / Math.max(...m.porMes.map((y) => y.n))) * 64}px` }} />
                    <span className="text-[9px] text-slate-500 truncate">{MESES[Number(x.mes.slice(5)) - 1]} {x.mes.slice(2, 4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Quiénes hablaron</p>
            {m.oradores.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Ninguna sesión de este boletín tiene transcripción guardada todavía. Transcríbala desde el video de la sesión ("Video y transcripción").</p>
            ) : (
              <>
                <table className="w-full text-[11px]">
                  <thead><tr className="text-left text-slate-500"><th className="font-semibold py-1">Orador</th><th className="font-semibold">Intervenciones</th><th className="font-semibold">Tiempo aprox.</th><th className="font-semibold">Sesiones</th></tr></thead>
                  <tbody>
                    {m.oradores.slice(0, 12).map((o) => (
                      <tr key={o.nombre} className="border-t border-slate-100"><td className="py-1 pr-2 text-slate-800 font-semibold">{o.nombre}</td><td>{o.intervenciones}</td><td>{fmtDur(o.segundosAprox)}</td><td>{o.sesiones}</td></tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  De {m.sesionesConTranscripcion} sesión(es) transcrita(s) automáticamente{m.segmentosSinIdentificar ? `; ${m.segmentosSinIdentificar} intervención(es) sin orador identificado` : ""}. Si la sesión trató varios boletines, cuenta lo hablado en toda la sesión. El tiempo es aproximado.
                </p>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <button onClick={() => setVerAcuerdos((v) => !v)} className="text-[11px] font-bold uppercase tracking-wider text-slate-600 cursor-pointer">{verAcuerdos ? "▾" : "▸"} Acuerdos y resultados oficiales ({m.acuerdos.length})</button>
              {verAcuerdos && (m.acuerdos.length === 0 ? <p className="text-[11px] text-slate-500 italic mt-1">No registrados.</p> : (
                <ul className="mt-2 flex flex-col gap-2">
                  {m.acuerdos.map((a, i) => <li key={i} className="text-[11px] text-slate-700"><span className="font-bold">{fmtFecha(a.fecha)} · {a.comision}</span> <span className="text-slate-400">({a.fuente})</span><br /><span className="whitespace-pre-line">{a.texto}</span></li>)}
                </ul>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <button onClick={() => setVerInvitados((v) => !v)} className="text-[11px] font-bold uppercase tracking-wider text-slate-600 cursor-pointer">{verInvitados ? "▾" : "▸"} Invitados según las citaciones ({m.invitados.length})</button>
              {verInvitados && (m.invitados.length === 0 ? <p className="text-[11px] text-slate-500 italic mt-1">No informados.</p> : (
                <ul className="mt-2 flex flex-col gap-2">
                  {m.invitados.map((a, i) => <li key={i} className="text-[11px] text-slate-700"><span className="font-bold">{fmtFecha(a.fecha)} · {a.comision}</span><br />{a.texto}</li>)}
                </ul>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400">El registro guarda las sesiones desde que empezó a funcionar (y el historial ya sincronizado del Senado y de la Cámara); las sesiones anteriores no se cuentan.</p>
        </>
      )}
    </div>
  );
}
