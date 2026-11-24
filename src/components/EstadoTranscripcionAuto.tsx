import React, { useEffect, useState } from "react";
import { Bot, Play, Square, Loader2, Star, X } from "lucide-react";
import { DIPUTADOS_COMISIONES_DETALLE, SENADO_COMISIONES_DETALLE } from "../data/comisionesData";

const OPCIONES_COMISION = [
  ...(DIPUTADOS_COMISIONES_DETALLE as any[]).map((c) => ({ id: `cd-${c.id}`, nombre: `Cámara · ${c.nombre}` })),
  ...(SENADO_COMISIONES_DETALLE as any[]).map((c) => ({ id: `sr-${c.id}`, nombre: `Senado · ${c.nombre}` })),
];
const nombreComision = (id: string) => OPCIONES_COMISION.find((o) => o.id === id)?.nombre || id;

const ETIQUETAS: Record<string, string> = {
  transcribiendo: "transcribiendo", transcrita: "transcritas", informe_pendiente: "con informe pendiente", informe_listo: "con informe",
  sin_video: "sin video en el canal", error: "con error", buscando_video: "buscando video",
};
const ACCION: Record<string, string> = {
  transcribir: "Transcribió", informe: "Redactó informe", sin_video: "Sin video", ya_transcrita: "Ya estaba transcrita",
  nada: "No queda nada por transcribir", tope: "Tope diario alcanzado", sin_credito: "Gemini sin saldo (en pausa)", inactiva: "Desactivada en el servidor", ocupado: "Otro paso en curso", error: "Error",
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
  const fijarPrioridad = async (lista: string[]) => {
    setEnviando(true);
    await fetch("/api/transcripcion/automatica/prioridad", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ comisiones: lista }) }).catch(() => {});
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
          {/* Prioridad: comisiones que se completan primero, una a una */}
          <div className="mt-2 pt-2 border-t border-slate-200">
            <p className="font-bold flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500" /> Prioridad: se completan primero todas las sesiones de estas comisiones (desde el 11 de marzo de 2026), en este orden</p>
            {(d.control?.prioridad || []).length === 0 && <p className="text-[11px] text-slate-500 mt-1">Sin prioridad: recorre todas las comisiones por fecha.</p>}
            {(d.control?.prioridad || []).map((cid: string) => {
              const a = (d.prioridad || []).find((x: any) => x.comisionId === cid);
              const e = a?.estados || {};
              const hechas = (e.informe_listo || 0) + (e.transcrita || 0) + (e.informe_pendiente || 0);
              const sinVideo = e.sin_video || 0;
              const pct = a?.total ? Math.round(((hechas + sinVideo) / a.total) * 100) : 0;
              return (
                <div key={cid} className="mt-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{nombreComision(cid)}</span>
                    <button onClick={() => fijarPrioridad((d.control.prioridad || []).filter((x: string) => x !== cid))} disabled={enviando} title="Quitar de la prioridad" className="text-slate-400 hover:text-red-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  {a ? (
                    <>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1"><div className="h-full bg-amber-500" style={{ width: `${pct}%` }} /></div>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                        {a.total} sesiones · {hechas} transcritas{e.informe_listo ? ` (${e.informe_listo} con informe)` : ""} · {e.transcribiendo || 0} en curso · {sinVideo} sin video en el canal{e.error ? ` · ${e.error} con error` : ""} · {e.sin_empezar || 0} por empezar · {pct}%
                      </p>
                    </>
                  ) : <p className="text-[10.5px] text-slate-400">Calculando avance…</p>}
                </div>
              );
            })}
            <select
              className="mt-2 w-full text-[11px] border border-slate-300 rounded-lg px-2 py-1 bg-white"
              value=""
              disabled={enviando}
              onChange={(ev) => { const v = ev.target.value; if (v) fijarPrioridad([...(d.control?.prioridad || []).filter((x: string) => x !== v), v]); }}
            >
              <option value="">+ Agregar comisión a la prioridad…</option>
              {OPCIONES_COMISION.filter((o) => !(d.control?.prioridad || []).includes(o.id)).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          {activa && <p className="mt-1 text-[10.5px] text-slate-400">Sigue sola aunque cierres el navegador. Se detiene al llegar al tope del día y se retoma cada mañana.</p>}
        </>
      )}
    </div>
  );
}
