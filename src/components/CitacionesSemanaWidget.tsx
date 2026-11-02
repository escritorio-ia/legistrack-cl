import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, RefreshCw, ChevronDown, ChevronUp, MapPin, Users, ExternalLink, Star, Clock } from "lucide-react";
import { parseFechaSesion } from "../utils/dateUtils";

export interface CitacionesSemanaWidgetProps {
  setView?: (view: string) => void;
  setSelectedComisionId?: (id: string) => void;
  setSelectedProyectoId?: (id: string) => void;
  followedComs?: string[];
  toggleFollowCom?: (comName: string) => void;
}

interface Cita {
  id: string;
  camara: "Cámara" | "Senado";
  comision: string;
  comisionId?: string;
  fecha: Date | null;
  hora: string;
  minutos: number;
  lugar: string;
  materia: string;
  invitados: string;
  boletines: string[];
  enlace: string;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function minutosDe(hora: string): number {
  const m = String(hora || "").match(/(\d{1,2})[:.](\d{2})/);
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 24 * 60;
}

function nombreComision(raw: string): string {
  const s = String(raw || "").trim();
  if (/^comisi[oó]n/i.test(s)) return s.replace(/^comisi[oó]n/i, "Comisión");
  if (/^(de|del)\s/i.test(s) || /^(especial|mixta|investigadora|cei)\b/i.test(s)) return `Comisión ${s}`;
  return `Comisión de ${s}`;
}

function normalizar(c: any): Cita {
  const esSenado = c.chamber === "SR" || String(c.id || "").startsWith("senado");
  const boletines: string[] = Array.from(new Set([...(c.boletines || []), ...(c.boletinesRelacionados || [])].map((b: string) => String(b).replace(/\./g, ""))));
  const invitados = String(c.invitados || "").trim();
  return {
    id: String(c.id || `${c.comision || c.comisionNombre}-${c.fecha}-${c.hora}`),
    camara: esSenado ? "Senado" : "Cámara",
    comision: esSenado ? nombreComision(c.comision || "") : (/^CEI\b/i.test(c.comisionNombre || "") ? c.comisionNombre : nombreComision(c.comisionNombre || c.comision || "")),
    comisionId: !esSenado && c.comisionSlug ? `cd-${c.comisionSlug}` : undefined,
    fecha: parseFechaSesion(String(c.fecha || "").replace(/^[^,]*,\s*/, "")) || parseFechaSesion(c.fecha),
    hora: String(c.hora || "").replace(/\s*hrs?\.?$/i, ""),
    minutos: minutosDe(c.hora),
    lugar: String(c.lugar || ""),
    materia: String(c.materia || "").trim(),
    invitados: /^no informado/i.test(invitados) ? "" : invitados,
    boletines,
    enlace: esSenado
      ? "https://www.senado.cl/actividad-legislativa/comisiones/citaciones"
      : "https://www.camara.cl/legislacion/comisiones/citaciones_todas.aspx"
  };
}

function etiquetaDia(d: Date | null): string {
  if (!d) return "Fecha no informada";
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const dif = Math.round((x.getTime() - hoy.getTime()) / 86400000);
  const base = `${DIAS[x.getDay()]} ${x.getDate()} ${MESES[x.getMonth()]}`;
  if (dif === 0) return `Hoy · ${base}`;
  if (dif === 1) return `Mañana · ${base}`;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function hace(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MESES[d.getMonth()]} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function CitacionesSemanaWidget({ setView, setSelectedComisionId, setSelectedProyectoId, followedComs = [], toggleFollowCom }: CitacionesSemanaWidgetProps) {
  const [citas, setCitas] = useState<Cita[] | null>(null);
  const [fuentes, setFuentes] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [camara, setCamara] = useState<"todas" | "Cámara" | "Senado">("todas");
  const [alcance, setAlcance] = useState<"proximas" | "anteriores">("proximas");
  const [soloMias, setSoloMias] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({});
  const [diasVisibles, setDiasVisibles] = useState(3);

  const cargar = (refrescar = false) => {
    setCargando(true);
    setError("");
    fetch(`/api/comisiones/citaciones${refrescar ? "?refresh=true" : ""}`)
      .then(r => r.json())
      .then(d => {
        setFuentes(d?.fuentes || null);
        const lista = [
          ...((d?.camara?.todas || d?.camara?.citaciones || []) as any[]).map(c => ({ ...c, chamber: "CD" })),
          ...((d?.senado?.citaciones || []) as any[]).map(c => ({ ...c, chamber: "SR" }))
        ];
        setCitas(lista.map(normalizar));
      })
      .catch(() => setError("No se pudieron consultar las citaciones."))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(false); }, []);

  const hoy = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }, []);

  const filtradas = useMemo(() => {
    if (!citas) return [];
    const q = busqueda.trim().toLowerCase().replace(/\./g, "");
    return citas
      .filter(c => camara === "todas" || c.camara === camara)
      .filter(c => !soloMias || followedComs.some(f => c.comision.toLowerCase().includes(f.toLowerCase().replace(/^comisi[oó]n\s+(de\s+)?/i, ""))))
      .filter(c => {
        const t = c.fecha ? new Date(c.fecha).setHours(0, 0, 0, 0) : null;
        return alcance === "proximas" ? (t === null || t >= hoy) : (t !== null && t < hoy);
      })
      .filter(c => !q || `${c.comision} ${c.materia} ${c.invitados} ${c.boletines.join(" ")}`.toLowerCase().replace(/\./g, "").includes(q))
      .sort((a, b) => {
        const fa = a.fecha?.getTime() ?? 9e15, fb = b.fecha?.getTime() ?? 9e15;
        const orden = alcance === "proximas" ? fa - fb : fb - fa;
        return orden || a.minutos - b.minutos;
      });
  }, [citas, camara, soloMias, followedComs, alcance, busqueda, hoy]);

  const porDia = useMemo(() => {
    const grupos: { clave: string; etiqueta: string; items: Cita[] }[] = [];
    for (const c of filtradas) {
      const clave = c.fecha ? c.fecha.toDateString() : "sin-fecha";
      let g = grupos.find(x => x.clave === clave);
      if (!g) { g = { clave, etiqueta: etiquetaDia(c.fecha), items: [] }; grupos.push(g); }
      g.items.push(c);
    }
    return grupos;
  }, [filtradas]);

  const cuenta = (cam: "Cámara" | "Senado") => (citas || []).filter(c => c.camara === cam && (alcance === "proximas" ? (!c.fecha || new Date(c.fecha).setHours(0, 0, 0, 0) >= hoy) : (c.fecha && new Date(c.fecha).setHours(0, 0, 0, 0) < hoy))).length;

  const chip = (activo: boolean) => `px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition ${activo ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4" id="citaciones-semana-widget">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-blue-600" /> Citaciones de comisiones</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cámara: {fuentes?.camara?.fuente === "vivo" ? `leídas ${hace(fuentes.camara.actualizado)}` : "sin datos recientes"} · Senado: {fuentes?.senado?.fuente === "vivo" ? `leídas ${hace(fuentes.senado.actualizado)}` : "sin datos recientes"}
          </p>
        </div>
        <button onClick={() => cargar(true)} disabled={cargando} className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} /> Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <button className={chip(alcance === "proximas")} onClick={() => { setAlcance("proximas"); setDiasVisibles(3); }}>Próximas</button>
        <button className={chip(alcance === "anteriores")} onClick={() => { setAlcance("anteriores"); setDiasVisibles(3); }}>Anteriores</button>
        <span className="w-px h-5 bg-slate-200 mx-1" />
        <button className={chip(camara === "todas")} onClick={() => setCamara("todas")}>Ambas</button>
        <button className={chip(camara === "Cámara")} onClick={() => setCamara("Cámara")}>Cámara ({cuenta("Cámara")})</button>
        <button className={chip(camara === "Senado")} onClick={() => setCamara("Senado")}>Senado ({cuenta("Senado")})</button>
        {followedComs.length > 0 && (
          <button className={chip(soloMias)} onClick={() => setSoloMias(!soloMias)}><Star className="w-3 h-3 inline -mt-0.5 mr-1" />Mis comisiones</button>
        )}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar comisión, tema o boletín…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
        </div>
      </div>

      {/* Lista */}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {citas === null && !error && <p className="text-xs text-slate-400">Cargando citaciones…</p>}
      {citas && porDia.length === 0 && (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">
          {alcance === "proximas"
            ? "No hay citaciones próximas con estos filtros. La Cámara suele publicar la semana siguiente el viernes; si no aparece, ábrela en camara.cl con la extensión activa."
            : "No hay citaciones anteriores con estos filtros."}
        </p>
      )}

      <div className="space-y-4">
        {porDia.slice(0, diasVisibles).map(g => (
          <div key={g.clave}>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{g.etiqueta} <span className="font-semibold text-slate-400">· {g.items.length}</span></p>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {g.items.map(c => {
                const abierta = !!abiertas[c.id];
                const seguida = followedComs.includes(c.comision);
                return (
                  <div key={c.id} className="bg-white">
                    <button type="button" onClick={() => setAbiertas(p => ({ ...p, [c.id]: !abierta }))}
                      className="w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer">
                      <span className="text-[11px] font-mono font-bold text-slate-700 w-[86px] shrink-0 pt-0.5 flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />{c.hora || "—"}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${c.camara === "Senado" ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"}`}>{c.camara === "Senado" ? "Senado" : "Cámara"}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-900">{c.comision}</span>
                        <span className={`block text-[11px] text-slate-600 ${abierta ? "" : "line-clamp-1"}`}>{c.materia || "Materia no informada"}</span>
                        {c.boletines.length > 0 && (
                          <span className="flex flex-wrap gap-1 mt-1">
                            {c.boletines.slice(0, 4).map(b => <span key={b} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{b}</span>)}
                          </span>
                        )}
                      </span>
                      {abierta ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>
                    {abierta && (
                      <div className="px-3 pb-3 pl-[110px] space-y-2 text-[11px] text-slate-700">
                        {c.lugar && <p className="flex gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{c.lugar}</p>}
                        {c.invitados && <p className="flex gap-1.5 whitespace-pre-line"><Users className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span><strong>Invitados:</strong> {c.invitados}</span></p>}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {c.boletines.map(b => (
                            <button key={b} onClick={() => { setSelectedProyectoId?.(b); setView?.("proyecto-detail"); }}
                              className="text-[10.5px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-100">Ver proyecto {b}</button>
                          ))}
                          {c.comisionId && setSelectedComisionId && (
                            <button onClick={() => { setSelectedComisionId(c.comisionId!); setView?.("comision-detail"); }}
                              className="text-[10.5px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-slate-100">Panel de la comisión</button>
                          )}
                          {toggleFollowCom && (
                            <button onClick={() => toggleFollowCom(c.comision)}
                              className="text-[10.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-amber-100">
                              <Star className="w-3 h-3 inline -mt-0.5 mr-1" />{seguida ? "Dejar de seguir" : "Seguir comisión"}
                            </button>
                          )}
                          <a href={c.enlace} target="_blank" rel="noopener noreferrer" className="text-[10.5px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Fuente oficial
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {porDia.length > diasVisibles && (
        <button onClick={() => setDiasVisibles(n => n + 3)} className="w-full text-xs font-bold text-blue-700 hover:underline cursor-pointer">
          Ver más días ({porDia.length - diasVisibles} restantes)
        </button>
      )}
    </div>
  );
}
