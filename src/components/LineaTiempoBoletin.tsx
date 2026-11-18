import React, { useEffect, useMemo, useState } from "react";
import { Landmark, Users, Gavel, FileText, CalendarClock, ExternalLink, Loader2 } from "lucide-react";
import { construirLineaTiempo, type EventoLinea, type TipoEvento } from "../utils/lineaTiempo";
import YouTubeTranscriptModal from "./YouTubeTranscriptModal";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fmtDia = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MESES[m - 1].slice(0, 3)}`; };
const fmtMes = (k: string) => { const [y, m] = k.split("-").map(Number); return `${MESES[m - 1][0].toUpperCase()}${MESES[m - 1].slice(1)} ${y}`; };
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

const TIPOS: Record<TipoEvento, { t: string; icono: any; color: string; punto: string }> = {
  tramite: { t: "Tramitación", icono: Landmark, color: "text-sky-700 bg-sky-50 border-sky-200", punto: "bg-sky-500" },
  comision: { t: "Comisiones", icono: Users, color: "text-rose-700 bg-rose-50 border-rose-200", punto: "bg-rose-500" },
  sala: { t: "Sala", icono: FileText, color: "text-amber-800 bg-amber-50 border-amber-200", punto: "bg-amber-500" },
  votacion: { t: "Votaciones", icono: Gavel, color: "text-emerald-700 bg-emerald-50 border-emerald-200", punto: "bg-emerald-600" },
};

/** Línea de tiempo única del boletín: tramitación, comisiones, Sala y votaciones en una sola vista. */
export default function LineaTiempoBoletin({ proyecto, votacionesCamara, etapas = [] }: { proyecto: any; votacionesCamara: any[]; etapas?: any[] }) {
  const [registro, setRegistro] = useState<any[] | null>(null);
  const [informes, setInformes] = useState<any[]>([]);
  const [sala, setSala] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<TipoEvento | "todos">("todos");
  const [verTodo, setVerTodo] = useState(false);
  const [abierto, setAbierto] = useState<EventoLinea | null>(null);
  const id = proyecto.id;

  useEffect(() => {
    let vigente = true;
    setRegistro(null); setInformes([]); setSala([]);
    const j = (u: string) => fetch(u).then((r) => r.json()).catch(() => null);
    Promise.all([
      j(`/api/proyecto/${encodeURIComponent(id)}/registro-sesiones`),
      j(`/api/proyecto/${encodeURIComponent(id)}/resumen-comisiones?rapido=1`),
      j(`/api/proyecto/${encodeURIComponent(id)}/sala`),
    ]).then(([r, i, s]) => {
      if (!vigente) return;
      setRegistro(r?.sesiones || []);
      setInformes(i?.sesiones || []);
      setSala(s?.sesiones || []);
    });
    return () => { vigente = false; };
  }, [id]);

  const eventos = useMemo(() => registro === null ? [] : construirLineaTiempo({
    boletin: id, hoy: hoyISO(),
    tramites: proyecto.timeline || [],
    votacionesSenado: proyecto.votaciones || [],
    votacionesCamara: votacionesCamara || [],
    sesionesComision: registro, informes, sala,
  }), [registro, informes, sala, proyecto, votacionesCamara, id]);

  const conteo = (t: TipoEvento) => eventos.filter((e) => e.tipo === t).length;
  const filtrados = eventos.filter((e) => filtro === "todos" || e.tipo === filtro);
  const futuros = filtrados.filter((e) => e.futuro).reverse();
  const pasados = filtrados.filter((e) => !e.futuro);
  const visibles = verTodo ? pasados : pasados.slice(0, 12);
  const porMes: [string, EventoLinea[]][] = [];
  for (const e of visibles) {
    const k = e.fecha.slice(0, 7);
    const g = porMes.find(([m]) => m === k);
    if (g) g[1].push(e); else porMes.push([k, [e]]);
  }

  const Tarjeta = ({ e }: { e: EventoLinea }) => {
    const T = TIPOS[e.tipo];
    const Icono = T.icono;
    return (
      <li className="relative pl-6">
        <span className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${T.punto}`} />
        <div className={`border rounded-xl p-3 ${e.futuro ? "border-blue-300 bg-blue-50/40" : "border-slate-200 bg-white"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 w-14 shrink-0">{fmtDia(e.fecha)}{e.hora ? ` ${String(e.hora).slice(0, 5)}` : ""}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wide border rounded px-1.5 py-0.5 flex items-center gap-1 ${T.color}`}><Icono className="w-3 h-3" />{T.t}</span>
            {e.futuro && <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 border border-blue-200 rounded px-1.5 py-0.5">Próximo</span>}
            <span className="text-xs font-extrabold text-slate-900">{e.titulo}</span>
            {e.lugar && <span className="text-xs text-slate-500">· {e.lugar}</span>}
          </div>
          {e.detalle && <p className="text-xs text-slate-700 mt-1 leading-relaxed line-clamp-3">{e.detalle}</p>}
          {(e.resultado || e.votos) && (
            <p className={`text-xs mt-1 font-semibold ${/aprob|acord/i.test(e.resultado || "") ? "text-emerald-700" : /rechaz/i.test(e.resultado || "") ? "text-red-700" : "text-slate-700"}`}>
              {e.resultado}{e.votos ? ` · Sí ${e.votos.si} · No ${e.votos.no} · Abst. ${e.votos.abstencion}` : ""}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <span className="text-[10px] text-slate-400">{e.fuente}</span>
            {e.videoId && <button onClick={() => setAbierto(e)} className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer">Ver informe y transcripción</button>}
            {e.enlace && <a href={e.enlace} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-0.5">Fuente oficial <ExternalLink className="w-3 h-3" /></a>}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6" id="linea-tiempo-boletin">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-blue-600" />Trámite legislativo</h3>
          <p className="text-[11px] text-slate-500">Etapas del expediente y, debajo, todo lo ocurrido (tramitación, comisiones, Sala y votaciones) de lo más reciente a lo más antiguo.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["todos", "tramite", "comision", "sala", "votacion"] as const).map((k) => (
            <button key={k} onClick={() => setFiltro(k)} className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${filtro === k ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {k === "todos" ? `Todo (${eventos.length})` : `${TIPOS[k].t} (${conteo(k)})`}
            </button>
          ))}
        </div>
      </div>

      {/* Etapas del trámite (resumen del expediente): dónde está el proyecto, sin repetir los eventos de abajo. */}
      {etapas.length > 0 && (
        <div className="mb-5 border border-slate-200 rounded-xl p-3 bg-slate-50/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Etapas del trámite</p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">{proyecto.etapa || "Etapa no informada"}</span>
              {proyecto.subetapa && <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">{proyecto.subetapa}</span>}
              {proyecto.estado !== "Publicado como Ley" && proyecto.comisionActual && <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">En estudio: {proyecto.comisionActual}</span>}
            </div>
          </div>
          <ol className="flex flex-wrap items-stretch gap-1.5">
            {etapas.map((e: any, i: number) => {
              const ultimaTramite = etapas.map((x: any) => x.tipo).lastIndexOf("tramite");
              const actual = i === ultimaTramite && proyecto.estado !== "Publicado como Ley";
              return (
                <li key={e.id || i} className="flex items-center gap-1.5">
                  <div className={`rounded-lg px-2.5 py-1.5 border text-[11px] max-w-[15rem] ${actual ? "bg-emerald-600 text-white border-emerald-600" : e.tipo === "final" && proyecto.estado === "Publicado como Ley" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"}`} title={[e.descripcion, (e.comisiones || []).join(", ")].filter(Boolean).join(" · ")}>
                    <p className="font-black uppercase tracking-wide text-[10px] leading-tight">{e.titulo}</p>
                    {(e.fechaRango || e.subtitulo) && <p className={`text-[10px] ${actual ? "text-emerald-50" : "text-slate-500"}`}>{e.fechaRango || e.subtitulo}</p>}
                    {e.comisiones?.length > 0 && <p className={`text-[10px] truncate ${actual ? "text-white" : "text-slate-600"}`}>{e.comisiones.join(" · ")}</p>}
                  </div>
                  {i < etapas.length - 1 && <span className="text-slate-300 text-xs">›</span>}
                </li>
              );
            })}
          </ol>
          {proyecto.linkCongreso && <a href={proyecto.linkCongreso} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-blue-700 hover:underline">Ver expediente oficial en el Congreso <ExternalLink className="w-3 h-3" /></a>}
        </div>
      )}

      {registro === null ? <p className="text-xs text-slate-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reuniendo tramitación, comisiones y Sala…</p>
        : filtrados.length === 0 ? <p className="text-xs text-slate-500">No informado: no hay eventos registrados{filtro !== "todos" ? " de este tipo" : ""}.</p> : (
          <>
            {futuros.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">Próximamente</p>
                <ol className="relative border-l-2 border-blue-100 ml-1 space-y-2.5">{futuros.map((e) => <Tarjeta key={e.id} e={e} />)}</ol>
              </div>
            )}
            {porMes.map(([mes, lista]) => (
              <div key={mes} className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">{fmtMes(mes)}</p>
                <ol className="relative border-l-2 border-slate-100 ml-1 space-y-2.5">{lista.map((e) => <Tarjeta key={e.id} e={e} />)}</ol>
              </div>
            ))}
            {pasados.length > 12 && <button onClick={() => setVerTodo(!verTodo)} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">{verTodo ? "Ver menos" : `Ver los ${pasados.length} eventos`}</button>}
          </>
        )}

      {abierto?.videoId && (
        <YouTubeTranscriptModal isOpen={true} onClose={() => setAbierto(null)} videoTitle={`Sesión ${abierto.lugar || ""}`} videoUrl={`https://www.youtube.com/watch?v=${abierto.videoId}`}
          videoId={abierto.videoId} comisionNombre={abierto.lugar || ""} sesionFecha={abierto.fecha} boletines={[id]} />
      )}
    </div>
  );
}
