import React, { useEffect, useMemo, useState } from "react";
import { FileText, Copy, Printer, Video } from "lucide-react";
import type { SesionRegistradaUI } from "../utils/metricasBoletin";
import { calcularInformeComision, informeATexto, type AnalisisVideoUI } from "../utils/informeComision";
import { getInformesSesionPorComision } from "../services/firebaseService";
import type { InformeSesion } from "../utils/informeSesion";
import { formatoMinutoInforme, normalizarInforme } from "../utils/informeSesion";
import { tiempoDeSesion } from "../utils/boletines";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fmt = (iso: string | null) => { if (!iso) return "No informado"; const [y, m, d] = iso.split("-").map(Number); return `${d} ${MESES[m - 1]} ${y}`; };
const isoDe = (t: number) => { if (!t) return undefined; const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const restarDias = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return isoDe(d.getTime())!; };

const PERIODOS = [
  { k: "30", t: "Último mes", desde: () => restarDias(30) },
  { k: "90", t: "Últimos 3 meses", desde: () => restarDias(90) },
  { k: "365", t: "Último año", desde: () => restarDias(365) },
  { k: "todo", t: "Todo el registro", desde: () => null },
] as const;

/** Informe resumen de la comisión, compilado de sesiones registradas y análisis de video guardados. */
export default function InformeComision({ nombre, camara, registro, onAbrirBoletin }: {
  nombre: string; camara: string; registro: SesionRegistradaUI[] | null; onAbrirBoletin?: (b: string) => void;
}) {
  const [videos, setVideos] = useState<AnalisisVideoUI[]>([]);
  const [periodo, setPeriodo] = useState<string>("90");
  const [copiado, setCopiado] = useState(false);
  const [verTodas, setVerTodas] = useState(false);

  useEffect(() => {
    let vigente = true;
    getInformesSesionPorComision(nombre).then((docs) => {
      if (!vigente) return;
      setVideos(docs.map((x: any) => {
        const inf: InformeSesion = normalizarInforme(x.informe);
        const intervenciones = inf.puntos.flatMap((p) => p.intervenciones.map((i) => ({ orador: i.orador, cargo: [i.cargo, i.institucion].filter(Boolean).join(", "), postura: i.parrafos.join(" "), segundos: i.segundos, boletines: p.boletines })));
        return {
          videoId: x.videoId, fecha: x.fecha, fechaISO: isoDe(tiempoDeSesion(x.fecha)),
          resumenes: inf.resumen ? [inf.resumen] : [],
          acuerdos: inf.puntos.flatMap((p) => [...p.acuerdos.map((a) => a.texto), ...p.votaciones.map((v) => `${v.texto} · ${v.resultado}`)]),
          votaciones: [],
          oradores: intervenciones.map((i) => i.orador),
          intervenciones,
        };
      }));
    });
    return () => { vigente = false; };
  }, [nombre]);

  const inf = useMemo(() => registro ? calcularInformeComision(registro, videos, PERIODOS.find((p) => p.k === periodo)!.desde()) : null, [registro, videos, periodo]);

  const copiar = async () => { if (!inf) return; try { await navigator.clipboard.writeText(informeATexto(nombre, camara, inf)); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sin portapapeles */ } };
  const imprimir = () => {
    if (!inf) return;
    const w = window.open("", "_blank"); if (!w) return;
    const pre = w.document.createElement("pre");
    pre.style.cssText = "font:12px/1.5 system-ui,sans-serif;white-space:pre-wrap;margin:24px";
    pre.textContent = informeATexto(nombre, camara, inf);
    w.document.title = `Informe ${nombre}`; w.document.body.appendChild(pre); w.print();
  };

  const Kpi = ({ t, v, s }: { t: string; v: string | number; s?: string }) => (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t}</p><p className="text-lg font-black text-slate-900 leading-tight">{v}</p>{s && <p className="text-[10px] text-slate-500">{s}</p>}</div>
  );
  const chip = (b: string) => <button key={b} onClick={() => onAbrirBoletin?.(b)} className="text-[11px] font-mono font-extrabold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 rounded px-1.5 cursor-pointer">{b}</button>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4" id="informe-comision">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" />Informe resumen de la comisión</h3>
          <p className="text-[11px] text-slate-500">Compilado del registro automático de sesiones (fuentes oficiales) y de los informes de sesión hechos desde las transcripciones. Se actualiza solo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white">
            {PERIODOS.map((p) => <option key={p.k} value={p.k}>{p.t}</option>)}
          </select>
          <button onClick={copiar} disabled={!inf} className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1 hover:bg-slate-50 cursor-pointer"><Copy className="w-3.5 h-3.5" />{copiado ? "Copiado" : "Copiar"}</button>
          <button onClick={imprimir} disabled={!inf} className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1 hover:bg-slate-50 cursor-pointer"><Printer className="w-3.5 h-3.5" />Imprimir</button>
        </div>
      </div>

      {!inf ? <p className="text-xs text-slate-400">Cargando registro de sesiones…</p>
        : inf.realizadas === 0 && inf.programadas === 0 ? <p className="text-xs text-slate-500 italic">No informado: no hay sesiones registradas de esta comisión en el período.</p>
        : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Kpi t="Sesiones realizadas" v={inf.realizadas} s={inf.programadas ? `${inf.programadas} programada(s)` : undefined} />
              <Kpi t="Boletines tratados" v={inf.boletines.length} />
              <Kpi t="Última sesión" v={fmt(inf.ultima)} s={inf.proxima ? `próxima: ${fmt(inf.proxima)}` : undefined} />
              <Kpi t="Con informe de sesión" v={`${inf.sesionesConVideo} de ${inf.realizadas}`} />
            </div>

            {inf.boletines.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Boletines tratados</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500"><tr><th className="text-left px-3 py-1.5">Boletín</th><th className="text-right px-3 py-1.5">Sesiones</th><th className="text-left px-3 py-1.5">Última</th><th className="text-left px-3 py-1.5">Última acción en pauta</th></tr></thead>
                    <tbody>
                      {inf.boletines.map((b) => (
                        <tr key={b.boletin} className="border-t border-slate-100"><td className="px-3 py-1.5">{chip(b.boletin)}</td><td className="px-3 py-1.5 text-right font-bold">{b.sesiones}</td><td className="px-3 py-1.5">{fmt(b.ultima)}</td><td className="px-3 py-1.5 text-slate-600">{b.accion || "No informado"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Cronología de sesiones</p>
              <ol className="flex flex-col gap-2">
                {(verTodas ? inf.cronologia : inf.cronologia.slice(0, 6)).map((s) => (
                  <li key={`${s.fecha}${s.hora}`} className="border border-slate-200 rounded-xl p-3 text-xs">
                    <p className="font-extrabold text-slate-900">{fmt(s.fecha)}{s.hora ? ` · ${s.hora} h` : ""}</p>
                    {s.puntos.length === 0 ? <p className="text-slate-400 italic">Pauta no informada.</p> : (
                      <ol className="mt-1 flex flex-col gap-1">
                        {s.puntos.map((p, i) => (
                          <li key={i} className="text-slate-700">
                            <span className="font-bold text-blue-700 mr-1">{i + 1}.</span><span className="line-clamp-2 inline">{p.texto}</span>
                            {p.boletines.length > 0 && <span className="ml-1 inline-flex gap-1">{p.boletines.map(chip)}</span>}
                            {p.acuerdos && <p className="text-emerald-800 mt-0.5"><b>Acuerdos:</b> {p.acuerdos}</p>}
                          </li>
                        ))}
                      </ol>
                    )}
                    {s.resultado && <p className="mt-1 text-emerald-800"><b>Resultado oficial:</b> {s.resultado}</p>}
                    {s.invitados && <p className="mt-1 text-slate-600"><b>Invitados:</b> {s.invitados}</p>}
                    {s.video && s.video.resumenes.length > 0 && (
                      <div className="mt-1.5 text-slate-700 bg-rose-50/60 border border-rose-100 rounded-lg p-2">
                        <p><Video className="w-3 h-3 inline mr-1 text-rose-600" /><b>Informe de la sesión (desde la transcripción):</b> {s.video.resumenes.join(" ")}</p>
                        {s.video.acuerdos.map((a, j) => <p key={j} className="text-emerald-800 mt-0.5">• {a}</p>)}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {inf.cronologia.length > 6 && <button onClick={() => setVerTodas(!verTodas)} className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer">{verTodas ? "Ver menos" : `Ver las ${inf.cronologia.length} sesiones`}</button>}
            </div>

            {inf.posturas.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Posturas por boletín (desde las transcripciones)</p>
                <div className="flex flex-col gap-2">
                  {inf.posturas.map((p) => (
                    <details key={p.boletin} className="border border-slate-200 rounded-xl p-3 text-xs">
                      <summary className="cursor-pointer flex items-center gap-2">{chip(p.boletin)}<span className="text-slate-600">{p.items.length} {p.items.length === 1 ? "intervención" : "intervenciones"}</span></summary>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {p.items.map((i, j) => (
                          <li key={j} className="text-slate-700">
                            <a href={`https://www.youtube.com/watch?v=${i.videoId}&t=${Math.round(i.segundos)}s`} target="_blank" rel="noopener noreferrer" className="font-mono text-rose-700 hover:underline mr-1">{fmt(i.fecha)} {formatoMinutoInforme(i.segundos)}</a>
                            <b>{i.orador}</b>{i.cargo ? ` (${i.cargo})` : ""}: {i.postura}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {inf.oradores.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Quiénes intervinieron (transcripciones)</p>
                <div className="flex flex-wrap gap-1.5">{inf.oradores.slice(0, 24).map((o) => <span key={o.nombre} className="text-[11px] bg-slate-100 text-slate-700 rounded-md px-2 py-0.5">{o.nombre} · {o.intervenciones}</span>)}</div>
              </div>
            )}
          </>
        )}
    </div>
  );
}
