/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from "react";
import { Building2, Radio, ExternalLink, Clock, Users, Calendar, FileText, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { SesionSala, VotacionSala, votacionesPorBoletin, momentoSesion } from "../utils/sala";

interface FuenteSala { disponible: boolean; motivo?: string; fuente: string; leidoEn?: string; transmision: string; origen?: string; sesiones: SesionSala[] }
interface SalaSemana { camara: FuenteSala; senado: FuenteSala; hoy: string }

interface SalaLiveViewProps {
  setView?: (v: string) => void;
  setSelectedProyectoId?: (id: string) => void;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return "Fecha no informada";
  const f = new Date(a, m - 1, d);
  return `${DIAS[f.getDay()]} ${d} de ${MESES[m - 1]} de ${a}`;
}
const horario = (s: SesionSala) => s.horaInicio ? `${s.horaInicio}${s.horaTermino ? ` a ${s.horaTermino}` : ""} h` : "Hora no informada";
const fechaHora = (iso?: string) => iso ? new Date(iso).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" }) : "No informado";

function ChipBoletin({ boletin, abrir }: { boletin: string; abrir: (b: string) => void }) {
  if (!boletin) return <span className="text-[11px] font-bold text-slate-400">Sin boletín</span>;
  return (
    <button onClick={() => abrir(boletin)} className="text-[11px] font-extrabold font-mono bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 rounded-md px-2 py-0.5 cursor-pointer" title="Abrir el proyecto">
      Boletín {boletin}
    </button>
  );
}

function EstadoSesion({ s, hoy }: { s: SesionSala; hoy: string }) {
  const momento = momentoSesion(s.fecha, hoy);
  const etiqueta = s.estado || (momento === "hoy" ? "Hoy" : momento === "proxima" ? "En tabla" : "Fecha pasada");
  const color = s.estado === "Celebrada" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : momento === "hoy" ? "bg-amber-50 text-amber-800 border-amber-200"
    : momento === "proxima" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200";
  return <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${color}`}>{etiqueta}{momento === "hoy" && s.estado ? " · hoy" : ""}</span>;
}

function Votaciones({ votaciones, abrir }: { votaciones: VotacionSala[]; abrir: (b: string) => void }) {
  const grupos = votacionesPorBoletin(votaciones);
  return (
    <ol className="flex flex-col gap-2">
      {grupos.map((g, i) => {
        const ultima = g.votaciones[g.votaciones.length - 1];
        return (
          <li key={i} className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-blue-700">{i + 1}.</span>
              <ChipBoletin boletin={g.boletin} abrir={abrir} />
              {!g.boletin && <span className="text-xs text-slate-600">{ultima.descripcion || "Descripción no informada"}</span>}
              <span className="text-[11px] text-slate-500">{ultima.tipo || "Tipo no informado"}</span>
              <span className="text-[11px] text-slate-500">· {g.votaciones.length} {g.votaciones.length === 1 ? "votación" : "votaciones"}</span>
            </div>
            <ul className="mt-2 flex flex-col gap-1">
              {g.votaciones.map((v) => (
                <li key={v.id} className="text-[11px] text-slate-700 flex flex-wrap gap-x-3">
                  <span className="font-mono text-slate-500">{v.fecha.slice(11, 16) || "--:--"}</span>
                  <span className={`font-bold ${/aprob/i.test(v.resultado) ? "text-emerald-700" : /rechaz/i.test(v.resultado) ? "text-red-700" : "text-slate-700"}`}>{v.resultado || "Resultado no informado"}</span>
                  <span>Sí {v.si} · No {v.no} · Abst. {v.abstencion}</span>
                  <span className="text-slate-500">{v.quorum || "Quórum no informado"}</span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

function TarjetaSesion({ s, hoy, abrir, abierta: inicial }: { s: SesionSala; hoy: string; abrir: (b: string) => void; abierta: boolean }) {
  const [abierta, setAbierta] = useState(inicial);
  const n = s.camara === "Senado" ? s.puntos.length : s.votaciones.length;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <button onClick={() => setAbierta(!abierta)} className="w-full text-left p-4 flex flex-wrap items-center gap-x-4 gap-y-2 cursor-pointer hover:bg-slate-50">
        <div className="flex items-center gap-2">
          <EstadoSesion s={s} hoy={hoy} />
          <span className="text-sm font-extrabold text-slate-900">Sesión N° {s.numero || "no informado"}</span>
          <span className="text-xs text-slate-500">{s.tipo || "Tipo no informado"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fechaLarga(s.fecha)}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{horario(s)}</span>
          {s.asistencia && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Asistieron {s.asistencia.asisten} de {s.asistencia.total}</span>}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-500">
          {s.boletines.length > 0 && <span>{s.boletines.length} {s.boletines.length === 1 ? "boletín" : "boletines"}</span>}
          {abierta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {abierta && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          {s.camara === "Senado" ? (
            s.puntos.length === 0 ? <p className="text-xs italic text-slate-400">Tabla no informada.</p> : (
              <ol className="flex flex-col gap-2">
                {s.puntos.map((p) => (
                  <li key={p.posicion} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold text-blue-700">{p.posicion}.</span>
                      <ChipBoletin boletin={p.boletin} abrir={abrir} />
                      {p.parte && <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{p.parte}</span>}
                      {p.quorum && <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5">{p.quorum}</span>}
                      {p.enlace && <a href={p.enlace} target="_blank" rel="noopener noreferrer" className="ml-auto text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">Tramitación <ExternalLink className="w-3 h-3" /></a>}
                    </div>
                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed line-clamp-3">{p.materia || "Materia no informada"}</p>
                  </li>
                ))}
              </ol>
            )
          ) : n > 0 ? (
            <>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Votaciones de la Sala en esta sesión</p>
              <Votaciones votaciones={s.votaciones} abrir={abrir} />
            </>
          ) : (
            <p className="text-xs text-slate-500">
              {s.estado === "Celebrada" ? "Sin votaciones registradas en los datos abiertos para esta sesión." : "La tabla de la Cámara no se publica en sus datos abiertos."}{" "}
              <a href="https://www.camara.cl/verDoc.aspx?prmId=0&prmTipo=TABLASEMANAL" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">Ver tabla semanal oficial (camara.cl)</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SalaLiveView({ setView, setSelectedProyectoId }: SalaLiveViewProps) {
  const [datos, setDatos] = useState<SalaSemana | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState<"camara" | "senado">("camara");

  useEffect(() => {
    fetch("/api/sala")
      .then((r) => r.json())
      .then((d) => { if (d?.camara && d?.senado) setDatos(d); else setError(d?.error || "Respuesta no válida del servidor."); })
      .catch((e) => setError(e?.message || "Sin conexión con el servidor."))
      .finally(() => setCargando(false));
  }, []);

  const abrir = (b: string) => { setSelectedProyectoId?.(b); };
  const fuente = datos ? (tab === "camara" ? datos.camara : datos.senado) : null;
  const hoy = datos?.hoy || "";
  const grupos = useMemo(() => {
    const s = fuente?.sesiones || [];
    return {
      hoy: s.filter((x) => x.fecha === hoy),
      proximas: s.filter((x) => x.fecha > hoy),
      recientes: s.filter((x) => x.fecha < hoy).slice().reverse(),
    };
  }, [fuente, hoy]);

  const resumenBoletines = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of fuente?.sesiones || []) for (const b of s.boletines) m.set(b, (m.get(b) || 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [fuente]);

  const seccion = (titulo: string, lista: SesionSala[], abiertas: boolean) => lista.length === 0 ? null : (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{titulo}</h2>
      {lista.map((s, i) => <TarjetaSesion key={s.id} s={s} hoy={hoy} abrir={abrir} abierta={abiertas && i === 0} />)}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-5 pb-10">
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sala de sesiones</h1>
        <p className="text-xs text-slate-500 font-semibold">Sesiones de Sala de la semana con datos oficiales. Cada punto está ligado a su boletín.</p>
      </div>

      <div className="flex bg-slate-200/85 p-1 rounded-xl max-w-md mx-auto w-full">
        {([["camara", "Cámara de Diputadas y Diputados", Building2], ["senado", "Senado", Radio]] as const).map(([k, t, Icono]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            <Icono className="w-4 h-4" /><span>{t}</span>
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="py-16 text-center text-slate-400 font-semibold">Consultando fuentes oficiales…</div>
      ) : error || !fuente ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5" />Información de Sala no disponible: {error || "sin datos"}.</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <FileText className="w-4 h-4 text-slate-400" />
            <span><b>Fuente:</b> {fuente.fuente}</span>
            <span><b>Lectura:</b> {fechaHora(fuente.leidoEn)}</span>
            <a href={fuente.transmision} target="_blank" rel="noopener noreferrer" className="ml-auto font-bold text-blue-600 hover:underline flex items-center gap-1">Transmisión oficial <ExternalLink className="w-3.5 h-3.5" /></a>
          </div>

          {!fuente.disponible ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5" />No disponible: {fuente.motivo || "la fuente oficial no respondió"}.</div>
          ) : fuente.sesiones.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">La fuente oficial no informa sesiones de Sala para esta semana.</p>
          ) : (
            <>
              {resumenBoletines.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">Boletines en Sala esta semana ({resumenBoletines.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {resumenBoletines.map(([b, n]) => (
                      <span key={b} className="flex items-center gap-1"><ChipBoletin boletin={b} abrir={abrir} />{n > 1 && <span className="text-[10px] text-slate-500">×{n}</span>}</span>
                    ))}
                  </div>
                </div>
              )}
              {seccion("Hoy", grupos.hoy, true)}
              {seccion("Próximas sesiones", grupos.proximas, grupos.hoy.length === 0)}
              {seccion("Sesiones recientes", grupos.recientes, grupos.hoy.length === 0 && grupos.proximas.length === 0)}
            </>
          )}
          <p className="text-[11px] text-slate-400 text-center">No se indica "en vivo": las fuentes oficiales informan la citación y el horario, no la transmisión en curso.</p>
        </>
      )}
    </div>
  );
}
