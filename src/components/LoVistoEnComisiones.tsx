import React, { useEffect, useState } from "react";
import { MessagesSquare, Loader2, RefreshCw, FileText } from "lucide-react";
import YouTubeTranscriptModal from "./YouTubeTranscriptModal";
import { CATEGORIAS } from "../utils/informeSesion";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fmt = (iso: string) => { const [y, m, d] = String(iso).split("-").map(Number); return y && m && d ? `${d} ${MESES[m - 1]} ${y}` : iso || "Fecha no informada"; };

/**
 * Resumen de lo que se ha visto en comisiones sobre el boletín, a partir de los informes de sesión
 * (hechos desde las transcripciones). Se muestra primero lo guardado y, si hay informes nuevos, se actualiza solo.
 */
export default function LoVistoEnComisiones({ proyectoId }: { proyectoId: string }) {
  const [d, setD] = useState<any>(null);
  const [actualizando, setActualizando] = useState(false);
  const [verTodas, setVerTodas] = useState(false);
  const [abierto, setAbierto] = useState<any>(null);

  const cargar = (forzar = false) => {
    setActualizando(true);
    fetch(`/api/proyecto/${encodeURIComponent(proyectoId)}/resumen-comisiones${forzar ? "?forzar=1" : ""}`)
      .then((r) => r.json()).then((x) => setD(x)).catch(() => {}).finally(() => setActualizando(false));
  };
  useEffect(() => {
    let vigente = true;
    setD(null);
    fetch(`/api/proyecto/${encodeURIComponent(proyectoId)}/resumen-comisiones?rapido=1`)
      .then((r) => r.json())
      .then((x) => {
        if (!vigente) return;
        setD(x);
        // Hay informes nuevos o aún no hay resumen: se genera en segundo plano.
        if (x?.sesiones?.length && (x.desactualizado || x.motivo === "pendiente")) cargar();
      })
      .catch(() => { if (vigente) setD({ disponible: false, motivo: "No se pudo consultar.", sesiones: [] }); });
    return () => { vigente = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  const sesiones: any[] = d?.sesiones || [];
  const comisiones = Array.from(new Set(sesiones.map((s) => s.comision).filter(Boolean)));
  const visibles = verTodas ? sesiones : sesiones.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4" id="lo-visto-en-comisiones">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200"><MessagesSquare className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Lo visto en comisiones</h3>
            <p className="text-[11px] text-slate-500">
              {sesiones.length ? `${sesiones.length} ${sesiones.length === 1 ? "sesión" : "sesiones"} con informe · ${comisiones.join(" · ")}` : "Desde los informes de las sesiones transcritas"}
            </p>
          </div>
        </div>
        {sesiones.length > 0 && (
          <button onClick={() => cargar(true)} disabled={actualizando} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer disabled:opacity-50">
            {actualizando ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} {actualizando ? "Actualizando resumen…" : "Actualizar"}
          </button>
        )}
      </div>

      {!d && <p className="text-xs text-slate-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando sesiones…</p>}
      {d && sesiones.length === 0 && (
        <p className="text-xs text-slate-500">
          Aún no hay informes de sesiones de comisión en que se haya tratado este boletín. Se agregan solos a medida que la transcripción automática procesa las sesiones.
        </p>
      )}

      {sesiones.length > 0 && (
        <>
          {d?.resumen ? <p className="text-[13px] text-slate-800 leading-relaxed">{d.resumen}</p>
            : actualizando ? <p className="text-xs text-slate-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Redactando el resumen consolidado (1 a 2 minutos)…</p>
            : d?.motivo && d.motivo !== "pendiente" ? <p className="text-xs text-amber-700">{d.motivo}</p> : null}

          {d?.temas?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {d.temas.map((t: any, i: number) => (
                <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                  <p className="text-xs font-extrabold text-slate-900">{t.tema}</p>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{t.detalle}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{t.fechas.map(fmt).join(" · ")}</p>
                </div>
              ))}
            </div>
          )}

          {d?.posiciones?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Posiciones expresadas</p>
              <ul className="space-y-1">
                {d.posiciones.map((p: any, i: number) => <li key={i} className="text-xs text-slate-700"><b>{p.actor}</b>: {p.postura} <span className="text-slate-400">· {fmt(p.fecha)}</span></li>)}
              </ul>
            </div>
          )}

          {d?.pendientes?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Pendiente</p>
              <ul className="list-disc pl-5 space-y-0.5">{d.pendientes.map((t: string, i: number) => <li key={i} className="text-xs text-slate-700">{t}</li>)}</ul>
            </div>
          )}

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Sesiones</p>
            <ol className="space-y-2">
              {visibles.map((s) => (
                <li key={s.videoId} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-extrabold text-slate-900">{fmt(s.fecha)} · {s.comision || "Comisión no informada"}{s.estado ? <span className="font-medium text-slate-500"> · {s.estado}</span> : null}</p>
                    <button onClick={() => setAbierto(s)} className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"><FileText className="w-3 h-3" />Ver informe y transcripción</button>
                  </div>
                  {s.sintesis && <p className="text-xs text-slate-700 mt-1 leading-relaxed">{s.sintesis}</p>}
                  {(s.acuerdos.length > 0 || s.votaciones.length > 0) && (
                    <div className="mt-1.5 space-y-0.5">
                      {s.votaciones.map((v: string, j: number) => <p key={`v${j}`} className="text-xs text-emerald-800 font-semibold">• {v}</p>)}
                      {s.acuerdos.map((a: string, j: number) => <p key={`a${j}`} className="text-xs text-emerald-800">• {a}</p>)}
                    </div>
                  )}
                  {s.expositores.length > 0 && (
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      <b>Expositores:</b> {s.expositores.map((e: any) => `${e.orador}${e.cargo ? `, ${e.cargo}` : ""}${e.institucion ? ` (${e.institucion})` : ""} [${(CATEGORIAS as any)[e.categoria]?.corto || e.categoria}]`).join("; ")}
                    </p>
                  )}
                </li>
              ))}
            </ol>
            {sesiones.length > 4 && <button onClick={() => setVerTodas(!verTodas)} className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer">{verTodas ? "Ver menos" : `Ver las ${sesiones.length} sesiones`}</button>}
          </div>

          <p className="text-[10.5px] text-slate-500">
            Elaborado con IA solo a partir de los informes de sesión, que se hacen desde la transcripción automática de los videos oficiales y el registro oficial de cada comisión. No es un documento oficial.
            {d?.generado ? ` Resumen actualizado el ${new Date(d.generado).toLocaleDateString("es-CL")}.` : ""}
          </p>
        </>
      )}

      {abierto && (
        <YouTubeTranscriptModal isOpen={true} onClose={() => setAbierto(null)} videoTitle={abierto.titulo || `Sesión ${abierto.comision}`}
          videoUrl={`https://www.youtube.com/watch?v=${abierto.videoId}`} videoId={abierto.videoId} comisionNombre={abierto.comision} sesionFecha={abierto.fecha} boletines={[proyectoId]} />
      )}
    </div>
  );
}
