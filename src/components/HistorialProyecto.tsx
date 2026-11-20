import React, { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Loader2, RefreshCw, Copy, Check, Printer, ChevronDown, ChevronRight, ExternalLink, AlertTriangle, Clock, ArrowDown } from "lucide-react";
import type { HistorialProyecto as H, ComisionHistorial } from "../utils/historial";
import { CATEGORIAS } from "../utils/informeSesion";
import { fechaISO } from "../utils/lineaTiempo";
import { buscarPersona, cargoEnFecha, type Persona } from "../utils/personas";
import { X } from "lucide-react";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fmt = (iso?: string | null) => { if (!iso) return "No informado"; const [y, m, d] = String(iso).split("-").map(Number); return y && m && d ? `${d} ${MESES[m - 1]} ${y}` : String(iso); };
const hm = (min?: number | null) => min == null ? "No informado" : min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const informado = (t?: string | null) => !!t && !/^\s*(no informad|no fue posible|sin informaci)/i.test(String(t));
const limpiar = (t?: string) => String(t || "").replace(/^[^\w¿¡]*\s*(Objeto\s*&\s*Ámbito|Mecanismos\s*Clave|Fiscalización\s*&\s*(Sanciones|Cumplimiento))\s*:\s*/i, "");
const CAT_COLOR: Record<string, string> = { PARL: "bg-slate-700", ESP: "bg-sky-600", ESC: "bg-amber-500", EEA: "bg-emerald-600", SEC: "bg-slate-400", ND: "bg-slate-300" };
const corto = (c: string) => (CATEGORIAS as any)[c]?.corto || c;
const ytLink = (v?: string, s?: number | null) => v ? `https://www.youtube.com/watch?v=${v}${s != null ? `&t=${Math.round(s)}s` : ""}` : undefined;

interface Props {
  proyecto: any;
  ficha: any;
  fichaCargando: boolean;
  informesFin: any;
  consolidadoIF: any;
  votacionesCamara: any[];
  onVerTab: (tab: string) => void;
  onExportarMinuta: () => void;
}

/** Historial del proyecto ("anamnesis legislativa"): identificación, motivo, antecedentes, evolución por comisión con traspasos, estado y puntos críticos. */
export default function HistorialProyecto({ proyecto, ficha, fichaCargando, informesFin, consolidadoIF, votacionesCamara, onVerTab, onExportarMinuta }: Props) {
  const [h, setH] = useState<H | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({});
  const [copiado, setCopiado] = useState(false);
  const [panel, setPanel] = useState<{ tipo: "persona"; p: Persona } | { tipo: "tema"; c: ComisionHistorial; t: NonNullable<ComisionHistorial["temas"]>[number] } | null>(null);
  const id = proyecto.id;

  const cargar = (forzar = false) => {
    setActualizando(true);
    fetch(`/api/proyecto/${encodeURIComponent(id)}/historial${forzar ? "?forzar=1" : ""}`).then((r) => r.json()).then(setH).catch(() => {}).finally(() => setActualizando(false));
  };
  useEffect(() => {
    let vigente = true;
    setH(null);
    fetch(`/api/proyecto/${encodeURIComponent(id)}/historial?rapido=1`).then((r) => r.json()).then((x) => {
      if (!vigente) return;
      if (x?.motivo === "pendiente") { cargar(); return; }
      setH(x);
      if (x?.desactualizado) cargar();
    }).catch(() => { if (vigente) cargar(); });
    return () => { vigente = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const comisiones: ComisionHistorial[] = h?.comisiones || [];
  const hoy = hoyISO();

  // --- Votaciones de todo el proyecto (para "qué se ha decidido" y puntos críticos) ---
  const votos = useMemo(() => {
    const out: { fecha: string; lugar: string; texto: string; resultado: string; si?: number; no?: number; fuente: string; link?: string }[] = [];
    for (const c of comisiones) for (const v of c.votaciones) out.push({ fecha: v.fecha, lugar: c.nombre, texto: v.texto, resultado: v.resultado, fuente: v.fuente, link: ytLink(v.videoId, v.segundos) });
    for (const v of proyecto.votaciones || []) out.push({ fecha: fechaISO(v.fecha), lugar: "Senado", texto: v.materia, resultado: v.resultado, si: v.conteoInformado === false ? undefined : v.si, no: v.conteoInformado === false ? undefined : v.no, fuente: "Tramitación oficial del Senado" });
    for (const v of votacionesCamara || []) out.push({ fecha: fechaISO(v.fecha), lugar: "Cámara", texto: v.descripcion, resultado: v.resultado, si: v.si, no: v.no, fuente: "Datos abiertos de la Cámara" });
    // Se descartan registros sin contenido (la ficha a veces trae votaciones sin materia ni resultado).
    const vacio = (t: string) => !t || /no informad/i.test(t);
    return out.filter((v) => v.fecha && !(vacio(v.texto) && vacio(v.resultado))).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [comisiones, proyecto, votacionesCamara]);

  const proximas = useMemo(() => comisiones.flatMap((c) => c.programadas.map((f) => ({ fecha: f, lugar: c.nombre }))).filter((x) => x.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha)), [comisiones, hoy]);
  const ultimaDecision = votos[0] || comisiones.flatMap((c) => c.acuerdos.map((a) => ({ fecha: a.fecha, lugar: c.nombre, texto: a.texto, resultado: "Acuerdo", fuente: a.fuente }))).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];

  // --- Traspaso entre comisiones: hitos de tramitación entre el fin de una y el inicio de la siguiente ---
  const timeline = useMemo(() => (proyecto.timeline || []).map((t: any) => ({ ...t, iso: fechaISO(t.fecha) })).filter((t: any) => t.iso), [proyecto]);
  const derivacion = (a: ComisionHistorial, b: ComisionHistorial) => {
    if (!a.hasta || !b.desde) return [];
    const nb = b.nombre.toLowerCase().replace(/comisi[oó]n\s+(de\s+|del\s+)?/, "").split(/[ ,]/)[0];
    return timeline.filter((t: any) => t.iso >= a.hasta! && t.iso <= b.desde!)
      .filter((t: any) => new RegExp(`${nb}|pasa a|sala|discusi[oó]n general|indicaciones|cuenta`, "i").test(`${t.titulo} ${t.descripcion || ""}`))
      .slice(-3);
  };
  const plazoIndicaciones = timeline.filter((t: any) => /plazo.*indicaciones|indicaciones.*plazo/i.test(`${t.titulo} ${t.descripcion || ""}`)).slice(-1)[0];

  // --- Puntos críticos (señales verificables) ---
  const criticos = useMemo(() => {
    const out: { tipo: string; texto: string; fecha: string; fuente: string; link?: string }[] = [];
    for (const v of votos) {
      const m = String(v.resultado + " " + v.texto).match(/\b(\d{1,3})\s*[x×-]\s*(\d{1,3})\b/);
      const si = v.si ?? (m ? Number(m[1]) : undefined), no = v.no ?? (m ? Number(m[2]) : undefined);
      if (si != null && no != null && no > 0 && si > 0 && Math.abs(si - no) <= Math.max(1, Math.round((si + no) * 0.2))) out.push({ tipo: "Votación dividida", texto: `${v.lugar}: ${v.texto} — ${v.resultado} (${si} a ${no})`, fecha: v.fecha, fuente: v.fuente, link: v.link });
      else if (/rechaz/i.test(v.resultado)) out.push({ tipo: /indicaci/i.test(v.texto) ? "Indicación rechazada" : "Votación rechazada", texto: `${v.lugar}: ${v.texto} — ${v.resultado}`, fecha: v.fecha, fuente: v.fuente, link: v.link });
    }
    for (const c of comisiones) {
      for (const a of c.acuerdos) if (/indicaci/i.test(a.texto) && /rechaz/i.test(a.texto)) out.push({ tipo: "Indicación rechazada", texto: `${c.nombre}: ${a.texto}`, fecha: a.fecha, fuente: a.fuente, link: ytLink(a.videoId, a.segundos) });
      for (const k of c.compromisos) out.push({ tipo: "Compromiso pendiente de verificar", texto: `${c.nombre}: ${k.texto} (responsable: ${k.responsable})`, fecha: k.fecha, fuente: "Transcripción de la sesión", link: ytLink(k.videoId, k.segundos) });
      for (const p of c.contrapuntos || []) out.push({ tipo: "Posiciones opuestas", texto: `${c.nombre} · ${p.tema}: a favor ${p.aFavor.join(", ")}; en contra ${p.enContra.join(", ")}`, fecha: p.fecha, fuente: "Síntesis de los informes (IA)" });
    }
    return out.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [votos, comisiones]);

  // --- Recorrido (comisiones y Sala en orden) ---
  const recorrido = useMemo(() => {
    const nodos = [
      ...comisiones.map((c) => ({ fecha: c.desde || c.hasta || "9999", texto: c.nombre.replace(/^Comisi[oó]n\s+(de\s+|del\s+)?/i, ""), tipo: "comision", clave: c.clave })),
      ...Object.values((h?.sala || []).reduce((acc: any, s) => { const k = `${s.camara}`; (acc[k] ||= { fecha: s.fecha, texto: `Sala ${s.camara}`, tipo: "sala", clave: `sala-${k}` }); return acc; }, {})) as any[],
    ];
    return nodos.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [comisiones, h]);

  const texto = () => {
    const L: string[] = [`HISTORIAL DEL PROYECTO · Boletín ${id}`, proyecto.titulo || "", ""];
    L.push("I. IDENTIFICACIÓN", `Origen: ${proyecto.camaraOrigen || "No informado"} · Iniciativa: ${proyecto.iniciativa || "No informada"} · Urgencia: ${proyecto.urgencia || "No informada"}`, `Etapa: ${proyecto.etapa || "No informada"}${proyecto.comisionActual ? ` · En estudio: ${proyecto.comisionActual}` : ""}`);
    L.push("", "II. MOTIVO DE INGRESO", limpiar(ficha?.objeto) || proyecto.titulo || "No informado");
    L.push("", "IV. EVOLUCIÓN POR COMISIÓN");
    for (const c of comisiones) {
      L.push("", `${c.nombre} (${fmt(c.desde)} a ${fmt(c.hasta)}) · ${c.estadistica.sesionesCitadas} sesiones citadas · ${c.estadistica.sesionesConInforme} con informe${c.informeOficial ? " · informe oficial publicado" : ""}`);
      if (c.cierre) L.push(`Despachó: ${c.cierre.despacho}`, c.cierre.cambios ? `Cambios: ${c.cierre.cambios}` : "");
      for (const t of c.temas || []) L.push(`- Tema: ${t.tema} (${t.estado}): ${t.detalle}`);
      for (const e of c.expositores) L.push(`- Expositor ${corto(e.categoria)}: ${e.orador}${e.cargo ? `, ${e.cargo}` : ""}${e.institucion ? `, ${e.institucion}` : ""}`);
      for (const p of c.posiciones || []) L.push(`- ${p.actor}: ${p.postura} (${fmt(p.fecha)})`);
      for (const a of c.acuerdos) L.push(`- Acuerdo (${fmt(a.fecha)}): ${a.texto}`);
      for (const v of c.votaciones) L.push(`- Votación (${fmt(v.fecha)}): ${v.texto}: ${v.resultado}`);
      if (c.estadistica.minutosDiscusion != null) L.push(`Tiempo de discusión aprox.: ${hm(c.estadistica.minutosDiscusion)} (en ${c.estadistica.sesionesConInforme} sesiones transcritas)`);
    }
    if (criticos.length) { L.push("", "VI. PUNTOS CRÍTICOS"); for (const k of criticos) L.push(`- ${k.tipo} (${fmt(k.fecha)}): ${k.texto}`); }
    L.push("", "Fuentes: tramitación oficial, registro oficial de sesiones, informes de comisión, informes de sesión desde la transcripción automática de los videos oficiales. No es un documento oficial.");
    return L.filter((x) => x !== undefined).join("\n");
  };

  const Sec = ({ n, t, tab, children }: { n: string; t: string; tab?: string; children: React.ReactNode }) => (
    <section className="mt-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2.5">
        <h3 className="font-serif text-[15px] font-bold text-[#0b3a6e]"><span className="font-sans text-xs text-slate-500 mr-1.5">{n}</span>{t}</h3>
        {tab && <button onClick={() => onVerTab(tab)} className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer">Ver detalle ›</button>}
      </div>
      {children}
    </section>
  );
  const Fila = ({ k, v }: { k: string; v: React.ReactNode }) => <tr className="border-b border-slate-100"><td className="py-1.5 pr-3 w-44 text-slate-500 font-semibold align-top text-[13px]">{k}</td><td className="py-1.5 text-[13px]">{v || "No informado"}</td></tr>;
  const Min = ({ v, s }: { v?: string; s?: number | null }) => v ? <a href={ytLink(v, s)} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-[#a4243b] hover:underline whitespace-nowrap">video{s != null ? ` ${Math.floor(s / 60)}′` : ""}</a> : null;

  const personas: Persona[] = h?.personas || [];
  /** Nombre que abre el panel de la persona (si se pudo identificar sin ambigüedad). */
  const Nombre = ({ n, cat, children }: { n: string; cat?: string; children?: React.ReactNode }) => {
    const p = buscarPersona(personas, n, cat) || personas.find((x) => x.variantes.includes(n));
    return p ? <button type="button" onClick={() => setPanel({ tipo: "persona", p })} className="font-bold text-[#0b3a6e] hover:underline cursor-pointer text-left">{children || n}</button> : <b>{children || n}</b>;
  };
  const temasDe = (p: Persona) => comisiones.flatMap((c) => (c.temas || []).filter((t) => (t.actoresIds || []).includes(p.id)).map((t) => ({ c, t })));

  return (
    <article className="bg-white text-[#1d2733] rounded-3xl border border-slate-200 shadow-sm px-5 sm:px-8 py-6" id="historial-proyecto">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-[#0b3a6e] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0b3a6e] text-white flex items-center justify-center"><BookOpenCheck className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Historial del proyecto · Boletín {id}</p>
            <h2 className="font-serif text-lg font-bold text-[#0b3a6e] leading-tight">{proyecto.titulo || "Título no informado"}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => { navigator.clipboard.writeText(texto()).catch(() => {}); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }} className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1 hover:bg-slate-50 cursor-pointer">{copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar</button>
          <button onClick={() => { const w = window.open("", "_blank"); if (!w) return; const pre = w.document.createElement("pre"); pre.style.cssText = "font:12px/1.5 system-ui;white-space:pre-wrap;margin:24px"; pre.textContent = texto(); w.document.body.appendChild(pre); w.print(); }} className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1 hover:bg-slate-50 cursor-pointer"><Printer className="w-3.5 h-3.5" /> Imprimir</button>
          <button onClick={onExportarMinuta} className="text-xs font-bold bg-[#0b3a6e] text-white rounded-lg px-2.5 py-1.5 hover:bg-[#0a3260] cursor-pointer">Minuta PDF / Word</button>
          <button onClick={() => cargar(true)} disabled={actualizando} className="text-xs font-bold text-slate-500 hover:text-slate-900 px-1.5 flex items-center gap-1 cursor-pointer disabled:opacity-50" title="Rehacer el historial con los últimos datos">{actualizando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}</button>
        </div>
      </header>

      {/* En 30 segundos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">¿Dónde está?</p><p className="text-[13px] font-semibold mt-0.5">{proyecto.etapa || "Etapa no informada"}</p>{informado(proyecto.comisionActual) && proyecto.estado !== "Publicado como Ley" && <p className="text-xs text-slate-600">En estudio: {proyecto.comisionActual}</p>}{informado(proyecto.subetapa) && <p className="text-xs text-slate-600">{proyecto.subetapa}</p>}</div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">¿Qué se ha decidido?</p>{ultimaDecision ? <><p className="text-[13px] font-semibold mt-0.5 line-clamp-2">{ultimaDecision.texto}{ultimaDecision.resultado ? `: ${ultimaDecision.resultado}` : ""}</p><p className="text-xs text-slate-600">{ultimaDecision.lugar} · {fmt(ultimaDecision.fecha)}</p></> : <p className="text-[13px] text-slate-500 mt-0.5">Sin votaciones ni acuerdos registrados.</p>}</div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">¿Qué viene?</p>{proximas[0] ? <><p className="text-[13px] font-semibold mt-0.5">{proximas[0].lugar}</p><p className="text-xs text-slate-600">Citada para el {fmt(proximas[0].fecha)}</p></>
          : /aprobaci[oó]n presidencial|observaciones|promulgaci|tribunal constitucional|publicad/i.test(`${proyecto.etapa} ${proyecto.subetapa || ""}`)
            ? <><p className="text-[13px] font-semibold mt-0.5">Fuera de comisiones</p><p className="text-xs text-slate-600">{[proyecto.etapa, proyecto.subetapa].filter(informado).join(" · ")}</p></>
            : <p className="text-[13px] text-slate-500 mt-0.5">Sin citación próxima registrada.</p>}{proyecto.urgencia && !/no informada|sin urgencia/i.test(proyecto.urgencia) && <p className="text-xs text-amber-800 font-semibold">Urgencia: {proyecto.urgencia}</p>}</div>
      </div>

      {/* Recorrido */}
      {recorrido.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="font-bold uppercase tracking-wider text-slate-500 mr-1">Recorrido:</span>
          {recorrido.map((n, i) => (
            <React.Fragment key={n.clave}>
              <span className={`px-2 py-0.5 rounded-md border font-semibold ${n.tipo === "sala" ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-white border-slate-300 text-slate-800"}`}>{n.texto}</span>
              {i < recorrido.length - 1 && <span className="text-slate-400">›</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      <Sec n="I." t="Identificación" tab="tramitacion">
        <table className="w-full"><tbody>
          <Fila k="Boletín" v={id} />
          <Fila k="Origen e iniciativa" v={`${proyecto.iniciativa || "No informada"} · ${proyecto.camaraOrigen || "No informado"}`} />
          <Fila k="Autores" v={proyecto.autores} />
          <Fila k="Ingreso" v={`${proyecto.fechaIngreso || "No informado"}${proyecto.diasTramitacion != null ? ` · ${proyecto.diasTramitacion} días en trámite` : ""}`} />
          <Fila k="Urgencia" v={proyecto.urgencia} />
          <Fila k="Etapa actual" v={[proyecto.etapa, proyecto.subetapa].filter(Boolean).join(" · ")} />
        </tbody></table>
      </Sec>

      <Sec n="II." t="Motivo de ingreso">
        {fichaCargando && !ficha ? <p className="text-xs text-slate-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Leyendo el mensaje o moción…</p> : (
          <ul className="space-y-1.5 text-[13px]">
            <li><b>Qué propone:</b> {ficha?.fuente === "texto" ? limpiar(ficha?.objeto) : (h?.objetivoOficial || limpiar(ficha?.objeto) || proyecto.titulo || "No informado")}</li>
            {informado(limpiar(ficha?.mecanismos)) && <li><b>A quiénes impacta:</b> {limpiar(ficha.mecanismos)}</li>}
            {informado(limpiar(ficha?.fiscalizacion)) && <li><b>Fiscalización e impacto:</b> {limpiar(ficha.fiscalizacion)}</li>}
          </ul>
        )}
        <p className="text-[10.5px] text-slate-500 mt-1">{ficha?.fuente === "texto" ? "Síntesis con IA del texto oficial del mensaje o moción." : h?.objetivoOficial ? "Objetivo del proyecto según el informe oficial de la comisión (no se pudo leer el mensaje o moción)." : "Sin texto oficial disponible: se muestra el título."}</p>
      </Sec>

      <Sec n="III." t="Antecedentes" tab="documentos">
        <table className="w-full"><tbody>
          <Fila k="Informe financiero" v={informesFin?.informes?.length ? <span>{informesFin.informes.length} informe(s) de la DIPRES{consolidadoIF?.resumen ? ` · ${String(consolidadoIF.resumen).split(/\n/)[0].slice(0, 260)}…` : ""} <button onClick={() => onVerTab("informes-bcn")} className="text-blue-700 font-bold hover:underline cursor-pointer">ver</button></span> : informesFin === null ? "Consultando…" : "La DIPRES no registra informes para este boletín."} />
          <Fila k="Documentos del expediente" v={`${(proyecto.documentos || []).length} documento(s): mensaje o moción, informes de comisión y oficios`} />
          <Fila k="Asesorías BCN" v={<a href="https://www.bcn.cl/asesoriasparlamentarias" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Buscar por boletín en bcn.cl</a>} />
        </tbody></table>
      </Sec>

      <Sec n="IV." t="Evolución por comisión" tab="comisiones">
        {!h ? <p className="text-xs text-slate-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Armando el historial por comisión (la primera vez puede tardar 1 a 2 minutos)…</p>
          : comisiones.length === 0 ? <p className="text-[13px] text-slate-500">No informado: no hay sesiones de comisión registradas para este boletín.</p> : (
          <div className="space-y-3">
            {comisiones.map((c, i) => {
              const abierta = abiertas[c.clave] ?? (i === comisiones.length - 1 || comisiones.length <= 2);
              const est = c.estadistica;
              const cats = Object.entries(est.minutosPorCategoria).filter(([, v]) => v > 0);
              const totalCat = cats.reduce((s, [, v]) => s + v, 0);
              const deriv = i < comisiones.length - 1 ? derivacion(c, comisiones[i + 1]) : [];
              return (
                <React.Fragment key={c.clave}>
                  <div className="border border-slate-200 rounded-2xl">
                    <button onClick={() => setAbiertas({ ...abiertas, [c.clave]: !abierta })} className="w-full text-left px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 cursor-pointer hover:bg-slate-50 rounded-2xl">
                      {abierta ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      <span className="font-bold text-[14px] text-[#0b3a6e]">{c.nombre}</span>
                      <span className="text-xs text-slate-500">{fmt(c.desde)} a {fmt(c.hasta)}{est.diasEnComision ? ` · ${est.diasEnComision} días` : ""}</span>
                      <span className="ml-auto flex flex-wrap gap-1.5 text-[10px] font-bold">
                        <span className="px-1.5 py-0.5 rounded border bg-slate-50 border-slate-200 text-slate-700">{est.sesionesConInforme} de {Math.max(est.sesionesCitadas, est.sesionesConInforme)} sesiones con informe</span>
                        <span className={`px-1.5 py-0.5 rounded border ${c.informeOficial ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>{c.informeOficial ? "Informe oficial publicado" : "Sin informe oficial aún"}</span>
                        {(c.actas || []).length > 0 && <span className="px-1.5 py-0.5 rounded border bg-sky-50 border-sky-200 text-sky-800">{c.actas!.length} acta(s) oficial(es)</span>}
                      </span>
                    </button>
                    {abierta && (
                      <div className="px-4 pb-4 space-y-3 text-[13px]">
                        {c.cierre && (
                          <div className="bg-[#f2f8f4] border-l-[3px] border-emerald-600 rounded p-3 space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Cierre de la comisión (informe oficial)</p>
                            {c.cierre.recibio && <p><b>Recibió:</b> {c.cierre.recibio}</p>}
                            {c.cierre.despacho && <p><b>Despachó:</b> {c.cierre.despacho}</p>}
                            {c.cierre.cambios && <p><b>Qué cambió:</b> {c.cierre.cambios}</p>}
                            {c.cierre.pendientes.length > 0 && <p><b>Quedó pendiente:</b> {c.cierre.pendientes.join("; ")}</p>}
                          </div>
                        )}
                        {(c.actas || []).length > 0 && <p className="text-xs text-slate-600">Actas oficiales: {c.actas!.map((a, k) => <a key={k} href={a.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline mr-2">{a.numero ? `N° ${a.numero} · ` : ""}{fmt(a.fecha)}</a>)}</p>}
                        {c.informeOficial && <p className="text-xs"><a href={c.informeOficial.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1">{c.informeOficial.titulo} <ExternalLink className="w-3 h-3" /></a></p>}

                        {(c.temas || []).length > 0 && (
                          <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Temas debatidos</p>
                            <ul className="space-y-1">{c.temas!.map((t, k) => <li key={k}><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded mr-1.5 ${t.estado === "resuelto" ? "bg-emerald-100 text-emerald-800" : t.estado === "pendiente" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>{t.estado}</span><button type="button" onClick={() => setPanel({ tipo: "tema", c, t })} className="font-bold text-[#0b3a6e] hover:underline cursor-pointer text-left">{t.tema}:</button> {t.detalle} <span className="text-[11px] text-slate-400">{t.fechas.map(fmt).join(" · ")}</span>{(t.actoresIds || []).length > 0 && <span className="text-[11px] text-slate-500"> · {t.actoresIds!.length} persona(s)</span>}</li>)}</ul>
                          </div>
                        )}

                        {c.expositores.length > 0 && (
                          <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Expositores</p>
                            {(["ESP", "ESC", "EEA", "ND"]).filter((cat) => c.expositores.some((e) => e.categoria === cat)).map((cat) => (
                              <div key={cat} className="mb-1.5"><p className="text-[11px] font-bold text-[#0b3a6e]">{(CATEGORIAS as any)[cat]?.largo || cat}{cat !== "ND" ? ` (${cat})` : ""}</p>
                                <ul className="space-y-1">{c.expositores.filter((e) => e.categoria === cat).map((e) => <li key={e.orador}><Nombre n={e.orador} cat={e.categoria} />{e.cargo ? ` · ${e.cargo}` : ""}{e.institucion ? ` · ${e.institucion}` : ""} <span className="text-[11px] text-slate-400">{e.fechas.map(fmt).join(", ")}</span> <Min v={e.videoId} s={e.segundos} />{e.planteo && <p className="text-xs text-slate-600 line-clamp-2">{e.planteo}</p>}</li>)}</ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {(c.posiciones || []).length > 0 && (
                          <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Posiciones de los parlamentarios</p>
                            <ul className="space-y-0.5">{c.posiciones!.map((p, k) => <li key={k}><Nombre n={p.actor} cat="PARL" />: {p.postura} <span className="text-[11px] text-slate-400">{fmt(p.fecha)}</span></li>)}</ul>
                          </div>
                        )}

                        {(c.acuerdos.length > 0 || c.votaciones.length > 0) && (
                          <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Votaciones y acuerdos</p>
                            <ul className="space-y-0.5">
                              {c.votaciones.map((v, k) => <li key={`v${k}`}><span className="text-slate-500">{fmt(v.fecha)}</span> · {v.texto}: <b className={/aprob/i.test(v.resultado) ? "text-emerald-700" : /rechaz/i.test(v.resultado) ? "text-red-700" : ""}>{v.resultado}</b> <span className="text-[10px] text-slate-400">{v.fuente}</span> <Min v={v.videoId} s={v.segundos} /></li>)}
                              {c.acuerdos.map((a, k) => <li key={`a${k}`}><span className="text-slate-500">{fmt(a.fecha)}</span> · {a.texto} <span className="text-[10px] text-slate-400">{a.fuente}</span> <Min v={a.videoId} s={a.segundos} /></li>)}
                            </ul>
                          </div>
                        )}

                        {(c.compromisos.length > 0 || c.pendientes.length > 0) && (
                          <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Compromisos y pendientes</p>
                            <ul className="space-y-0.5">{c.compromisos.map((k, j) => <li key={`k${j}`}>{k.texto} <span className="text-slate-500">· {k.responsable} · {fmt(k.fecha)}</span> <Min v={k.videoId} s={k.segundos} /></li>)}{c.pendientes.map((t, j) => <li key={`p${j}`}>Pendiente: {t}</li>)}</ul>
                          </div>
                        )}

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Estadísticas de la discusión en esta comisión</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div><p className="text-slate-500">Sesiones citadas</p><p className="font-bold text-sm">{est.sesionesCitadas}</p></div>
                            <div><p className="text-slate-500">Con informe (transcritas)</p><p className="font-bold text-sm">{est.sesionesConInforme}</p></div>
                            <div><p className="text-slate-500">Tiempo de discusión (aprox.)</p><p className="font-bold text-sm">{hm(est.minutosDiscusion)}</p></div>
                            <div><p className="text-slate-500">Citado sin tratarse</p><p className="font-bold text-sm">{est.sesionesSinTratar}</p></div>
                          </div>
                          {totalCat > 0 && (
                            <div className="mt-2">
                              <div className="flex h-2.5 rounded-full overflow-hidden">{cats.map(([k, v]) => <div key={k} className={CAT_COLOR[k] || "bg-slate-300"} style={{ width: `${(v / totalCat) * 100}%` }} title={`${corto(k)}: ${hm(v)}`} />)}</div>
                              <p className="text-[11px] text-slate-600 mt-1">{cats.map(([k, v]) => `${corto(k)} ${Math.round((v / totalCat) * 100)} %`).join(" · ")}</p>
                            </div>
                          )}
                          {est.oradores.length > 0 && <p className="text-[11px] text-slate-600 mt-1"><b>Más tiempo:</b> {est.oradores.slice(0, 5).map((o) => `${o.nombre} (${hm(o.minutos)})`).join(", ")}</p>}
                          {est.minutosPorSesion.length > 1 && <p className="text-[11px] text-slate-600 mt-0.5"><b>Por sesión:</b> {est.minutosPorSesion.map((s) => `${fmt(s.fecha)}: ${hm(s.minutos)}`).join(" · ")}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">Tiempos aproximados calculados desde las transcripciones de {est.sesionesConInforme} de {Math.max(est.sesionesCitadas, est.sesionesConInforme)} sesiones; no incluyen las sesiones sin transcribir.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {i < comisiones.length - 1 && (
                    <div className="flex items-start gap-2 pl-4 text-xs text-slate-600">
                      <ArrowDown className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-700">Traspaso a {comisiones[i + 1].nombre}</p>
                        {deriv.length ? deriv.map((t: any, k: number) => <p key={k}>{fmt(t.iso)} · {t.titulo}{t.descripcion && t.descripcion !== t.titulo ? `: ${t.descripcion}` : ""}</p>) : <p className="text-slate-400">Motivo del traspaso no informado en la tramitación.</p>}
                        {c.cierre?.pendientes?.length ? <p><b>Pasa con pendientes:</b> {c.cierre.pendientes.join("; ")}</p> : null}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            {h?.sintesisIA?.disponible === false && <p className="text-[11px] text-amber-700">La síntesis de temas y posiciones no se pudo redactar ahora ({h.sintesisIA.motivo}); los datos de cada comisión sí están completos. Pulse actualizar más tarde.</p>}
          </div>
        )}
      </Sec>

      {(h?.hilo || []).length > 0 && (
        <Sec n="" t="Hilo de temas entre comisiones">
          <ul className="space-y-1.5 text-[13px]">{h!.hilo!.map((t, k) => <li key={k}><b>{t.tema}:</b> {t.pasos.map((p) => `${p.comision.replace(/^Comisi[oó]n\s+(de\s+|del\s+)?/i, "")} (${fmt(p.fecha)}): ${p.estado}`).join(" → ")}</li>)}</ul>
        </Sec>
      )}

      <Sec n="V." t="Estado actual" tab="tramitacion">
        <table className="w-full"><tbody>
          <Fila k="Etapa" v={[proyecto.etapa, proyecto.subetapa].filter(Boolean).join(" · ")} />
          <Fila k="En estudio" v={proyecto.estado === "Publicado como Ley" ? "Publicado como ley" : informado(proyecto.comisionActual) ? proyecto.comisionActual : "Ninguna comisión (según la etapa actual)"} />
          <Fila k="Próximas citaciones" v={proximas.length ? proximas.slice(0, 4).map((p) => `${p.lugar} · ${fmt(p.fecha)}`).join(" | ") : "Sin citaciones próximas registradas"} />
          <Fila k="Urgencia" v={proyecto.urgencia} />
          <Fila k="Plazo de indicaciones" v={plazoIndicaciones ? `${fmt(plazoIndicaciones.iso)} · ${plazoIndicaciones.titulo}${plazoIndicaciones.descripcion && plazoIndicaciones.descripcion !== plazoIndicaciones.titulo ? `: ${plazoIndicaciones.descripcion}` : ""}` : "No informado en la tramitación"} />
        </tbody></table>
      </Sec>

      <Sec n="VI." t="Puntos críticos" tab="votaciones">
        {criticos.length === 0 ? <p className="text-[13px] text-slate-500">No se registran votaciones divididas, rechazos, compromisos ni posiciones opuestas en los datos disponibles.</p> : (
          <ul className="space-y-1.5">{criticos.slice(0, 15).map((k, j) => (
            <li key={j} className="text-[13px] flex gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /><span><b>{k.tipo}:</b> {k.texto} <span className="text-[11px] text-slate-400">· {fmt(k.fecha)} · {k.fuente}</span> {k.link && <a href={k.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#a4243b] hover:underline">video</a>}</span></li>
          ))}</ul>
        )}
      </Sec>

      {panel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setPanel(null)}>
          <div className="absolute inset-0 bg-slate-900/30" />
          <aside className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto p-5 text-[13px]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPanel(null)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
            {panel.tipo === "persona" ? (() => {
              const p = panel.p;
              const porComision = p.intervenciones.reduce((acc: Record<string, typeof p.intervenciones>, i) => { (acc[i.comision || "Sin comisión"] ||= []).push(i); return acc; }, {});
              return (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{(CATEGORIAS as any)[p.categoria]?.largo || "Persona"}{p.sinNombre ? " · identificada solo por su cargo" : ""}</p>
                  <h3 className="font-serif text-lg font-bold text-[#0b3a6e] pr-8">{p.nombre}</h3>
                  {p.variantes.length > 1 && <p className="text-[11px] text-slate-500">También aparece como: {p.variantes.filter((v) => v !== p.nombre).join("; ")}</p>}
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-1">Cargos con que aparece</p>
                  {p.cargos.length === 0 ? <p className="text-slate-500">Cargo no mencionado en las fuentes.</p> : (
                    <ul className="space-y-1">{p.cargos.map((c, k) => <li key={k}>{[c.cargo, c.institucion].filter(Boolean).join(", ") || "Sin cargo"} <span className="text-[11px] text-slate-400">{c.desde ? (c.hasta && c.hasta !== c.desde ? `${fmt(c.desde)} a ${fmt(c.hasta)}` : fmt(c.desde)) : ""}</span></li>)}</ul>
                  )}
                  {p.cargos.length > 1 && <p className="text-[10.5px] text-amber-700 mt-1">Esta persona aparece con distintos cargos según la fecha; en cada intervención se muestra el que tenía en ese momento.</p>}
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-1">Intervenciones en este proyecto ({p.intervenciones.length})</p>
                  {Object.entries(porComision).map(([com, lista]) => (
                    <div key={com} className="mb-3"><p className="text-xs font-bold text-[#0b3a6e]">{com}</p>
                      <ul className="space-y-2 mt-1">{lista.map((i, k) => {
                        const cargo = i.cargo || [cargoEnFecha(p, i.fecha)?.cargo, cargoEnFecha(p, i.fecha)?.institucion].filter(Boolean).join(", ");
                        return <li key={k} className="border-l-2 border-slate-200 pl-2"><p className="text-[11px] text-slate-500">{fmt(i.fecha)}{cargo ? ` · como ${cargo}` : ""} · {i.fuente} <Min v={i.videoId} s={i.segundos} /></p><p className="text-slate-700">{i.texto}</p></li>;
                      })}</ul>
                    </div>
                  ))}
                  {temasDe(p).length > 0 && (<><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-1">Temas en que participó</p>
                    <ul className="space-y-1">{temasDe(p).map(({ c, t }, k) => <li key={k}><button type="button" onClick={() => setPanel({ tipo: "tema", c, t })} className="text-[#0b3a6e] font-semibold hover:underline cursor-pointer text-left">{t.tema}</button> <span className="text-[11px] text-slate-400">· {c.nombre}</span></li>)}</ul></>)}
                </>
              );
            })() : (() => {
              const { c, t } = panel;
              const actores = (t.actoresIds || []).map((x) => personas.find((p) => p.id === x)).filter(Boolean) as Persona[];
              const posturas = (c.posiciones || []).filter((p) => actores.some((a) => buscarPersona([a], p.actor, "PARL")));
              const votosRel = c.votaciones.filter((v) => (t.votacionesRel || []).some((x) => x && (v.texto.toLowerCase().includes(x.toLowerCase().slice(0, 25)) || x.toLowerCase().includes(v.texto.toLowerCase().slice(0, 25)))));
              const hilo = (h?.hilo || []).find((x) => x.tema.toLowerCase().split(/\s+/).filter((w) => w.length > 4).some((w) => t.tema.toLowerCase().includes(w)));
              return (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tema · {c.nombre}</p>
                  <h3 className="font-serif text-lg font-bold text-[#0b3a6e] pr-8">{t.tema}</h3>
                  <p className="mt-1"><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded mr-1.5 ${t.estado === "resuelto" ? "bg-emerald-100 text-emerald-800" : t.estado === "pendiente" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>{t.estado}</span>{t.detalle}</p>
                  {t.fechas.length > 0 && <p className="text-[11px] text-slate-500 mt-1">Sesiones: {t.fechas.map(fmt).join(" · ")}</p>}
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-1">Quiénes hablaron de este tema</p>
                  {actores.length === 0 ? <p className="text-slate-500">No identificado.</p> : <ul className="space-y-1">{actores.map((a) => <li key={a.id}><button type="button" onClick={() => setPanel({ tipo: "persona", p: a })} className="font-bold text-[#0b3a6e] hover:underline cursor-pointer">{a.nombre}</button> <span className="text-[11px] text-slate-500">{[(CATEGORIAS as any)[a.categoria]?.corto, a.cargos[a.cargos.length - 1]?.cargo].filter(Boolean).join(" · ")}</span></li>)}</ul>}
                  {posturas.length > 0 && (<><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-1">Posturas de parlamentarios</p><ul className="space-y-1">{posturas.map((p, k) => <li key={k}><b>{p.actor}:</b> {p.postura}</li>)}</ul></>)}
                  {votosRel.length > 0 && (<><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-1">Votaciones relacionadas</p><ul className="space-y-1">{votosRel.map((v, k) => <li key={k}>{fmt(v.fecha)} · {v.texto}: <b>{v.resultado}</b></li>)}</ul></>)}
                  {hilo && (<><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-1">Recorrido del tema entre comisiones</p><p>{hilo.pasos.map((x) => `${x.comision} (${fmt(x.fecha)}): ${x.estado}`).join(" → ")}</p></>)}
                </>
              );
            })()}
            <p className="text-[10.5px] text-slate-400 mt-6">Las personas se identifican por su nombre, no por su cargo. Una mención solo por cargo se asocia a una persona únicamente dentro de la misma sesión.</p>
          </aside>
        </div>
      )}

      <footer className="mt-6 pt-2.5 border-t border-slate-200 text-[11px] text-slate-500">
        Armado con la tramitación oficial, el registro oficial de sesiones, los informes oficiales de comisión y los informes de sesión hechos desde la transcripción automática de los videos oficiales. Temas, posiciones, contrapuntos y cierres se redactan con IA y solo se aceptan si corresponden a sesiones reales. No es un documento oficial.
        {h?.generado ? ` Actualizado el ${new Date(h.generado).toLocaleString("es-CL")}.` : ""}
      </footer>
    </article>
  );
}
