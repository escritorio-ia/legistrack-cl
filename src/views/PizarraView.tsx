/**
 * Pizarra ATP: fotografía común de la semana (agenda legislativa, demanda y
 * trabajo en curso) y las conexiones detectadas entre investigaciones.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CalendarDays, Inbox, FlaskConical, Link2, History, Handshake, Upload, Download, RefreshCw,
  Search, X, Info, ShieldAlert, ChevronRight
} from "lucide-react";

interface Investigacion {
  id: string;
  area: string;
  investigador: string;
  tipo: "comision" | "parlamentario";
  solicitante: string;
  comision?: string;
  boletines: string[];
  materia: string;
  descripcion?: string;
  palabrasClave: string[];
  normas: string[];
  estado: "en_curso" | "entregada" | "archivada";
  fechaIngreso: string;
  fechaEntrega?: string;
  etapa?: string;
}

interface Conexion {
  id: string;
  tipo: "cruce" | "continuidad" | "coordinacion";
  titulo: string;
  mensaje: string;
  motivo: string;
  investigaciones: string[];
}

interface PizarraData {
  fuente: { tipo: "demo" | "archivo"; nombre: string; demo: boolean; persistente: boolean; actualizado: string };
  semana: { etiqueta: string; desde: string; hasta: string };
  agenda: { disponible: boolean; comisiones: number; proyectos: number; porComision: Array<{ comision: string; boletines: string[] }> };
  demanda: { nuevos: number; comisiones: number; parlamentarios: number };
  trabajo: { activas: number; areas: Array<{ area: string; cantidad: number }> };
  conexiones: { cruces: Conexion[]; continuidad: Conexion[]; coordinacion: Conexion[] };
  investigaciones: Investigacion[];
  asignaciones: Array<{ investigador: string; area: string; comision: string }>;
}

const TOKEN_KEY = "pizarra_token";

const COLOR_AREA = ["bg-blue-100 text-blue-800", "bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-800", "bg-violet-100 text-violet-800", "bg-rose-100 text-rose-800", "bg-cyan-100 text-cyan-800"];
const colorDeArea = (area: string) => {
  let h = 0;
  for (const c of area) h = (h * 31 + c.charCodeAt(0)) % COLOR_AREA.length;
  return COLOR_AREA[h];
};

const ETIQUETA_ESTADO: Record<Investigacion["estado"], string> = { en_curso: "En curso", entregada: "Entregada", archivada: "Archivada" };

export default function PizarraView() {
  const [data, setData] = useState<PizarraData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pideToken, setPideToken] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [panel, setPanel] = useState<"agenda" | "demanda" | "trabajo" | null>(null);
  const [filtroArea, setFiltroArea] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("en_curso");
  const [busqueda, setBusqueda] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const headers = useCallback((): Record<string, string> => {
    const t = sessionStorage.getItem(TOKEN_KEY);
    return t ? { "x-pizarra-token": t } : {};
  }, []);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pizarra", { headers: headers() });
      if (res.status === 401) {
        setPideToken(true);
        setData(null);
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setPideToken(false);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la Pizarra.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { cargar(); }, [cargar]);

  const porId = useMemo(() => new Map((data?.investigaciones || []).map((i) => [i.id, i])), [data]);

  const areas = useMemo(() => Array.from(new Set((data?.investigaciones || []).map((i) => i.area))).sort(), [data]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return (data?.investigaciones || []).filter((i) =>
      (filtroArea === "todas" || i.area === filtroArea) &&
      (filtroEstado === "todos" || i.estado === filtroEstado) &&
      (!q || [i.materia, i.investigador, i.comision, i.boletines.join(" "), i.palabrasClave.join(" ")].join(" ").toLowerCase().includes(q))
    );
  }, [data, filtroArea, filtroEstado, busqueda]);

  const descargarPlantilla = async () => {
    const res = await fetch("/api/pizarra/plantilla", { headers: headers() });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "plantilla_pizarra_atp.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const chip = (id: string) => {
    const i = porId.get(id);
    if (!i) return null;
    return (
      <div key={id} className="flex items-start gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
        <span className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${colorDeArea(i.area)}`}>{i.area}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-800 leading-snug">{i.materia}</p>
          <p className="text-[10px] text-slate-500">{i.investigador}{i.comision ? ` · ${i.comision}` : ""}{i.boletines.length ? ` · Bol. ${i.boletines.join(", ")}` : ""}</p>
        </div>
      </div>
    );
  };

  const tarjetaConexion = (c: Conexion, color: string) => (
    <div key={c.id} className={`rounded-xl border p-3.5 ${color} flex flex-col gap-2`}>
      <div>
        <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{c.titulo}</h4>
        <p className="text-[11px] italic text-slate-700 mt-0.5">“{c.mensaje}”</p>
      </div>
      <div className="flex flex-col gap-1.5">{c.investigaciones.map(chip)}</div>
      <p className="text-[10px] text-slate-500 font-medium">{c.motivo}</p>
    </div>
  );

  const columna = (titulo: string, subtitulo: string, icono: React.ReactNode, lista: Conexion[], color: string, vacio: string) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">{icono}</div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-2xl font-black text-blue-700 leading-none">{lista.length}</span> {titulo}
          </h3>
          <p className="text-[11px] text-slate-500 leading-snug">{subtitulo}</p>
        </div>
      </div>
      {lista.length === 0 ? (
        <div className="text-[11px] text-slate-400 font-semibold border border-dashed border-slate-300 rounded-xl p-4 text-center">{vacio}</div>
      ) : lista.map((c) => tarjetaConexion(c, color))}
    </div>
  );

  if (pideToken) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold"><ShieldAlert className="w-5 h-5 text-amber-600" /> Acceso restringido</div>
        <p className="text-xs text-slate-600">La Pizarra ATP contiene información de pedidos. Ingresa el token de acceso entregado por el administrador.</p>
        <input type="password" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="Token de acceso" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <button
          onClick={() => { sessionStorage.setItem(TOKEN_KEY, tokenInput.trim()); cargar(); }}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer"
        >Ingresar</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Asesoría Técnica Parlamentaria</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pizarra ATP · Panel de control</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5 max-w-3xl">
            Una fotografía común de la actividad legislativa, la demanda y el trabajo de ATP: qué se discute, qué se pide, qué se investiga y dónde conviene conectarse.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data && <span className="text-[11px] font-black text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> SEMANA {data.semana.etiqueta}</span>}
          <button onClick={cargar} className="text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-1.5 cursor-pointer"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Actualizar</button>
          <button onClick={() => setImportOpen(true)} className="text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-3 py-2 flex items-center gap-1.5 cursor-pointer"><Upload className="w-3.5 h-3.5" /> Importar CSV</button>
        </div>
      </div>

      {data?.fuente.demo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3 items-start">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed">
            <b>Datos de demostración (ficticios).</b> La agenda legislativa de la semana es real, pero las investigaciones son de ejemplo. Para usar datos reales, importa un CSV con los pedidos o, en el servidor, configura la fuente (variables <code>PIZARRA_FUENTE</code> / <code>PIZARRA_ARCHIVO</code>).
          </p>
        </div>
      )}
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl px-4 py-3 font-semibold">{error}</div>}
      {loading && !data && <div className="text-center text-sm text-slate-400 font-semibold py-16">Cargando la Pizarra…</div>}

      {data && (
        <>
          {/* Fotografía de la semana */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { k: "agenda", icono: <CalendarDays className="w-4 h-4" />, titulo: "Agenda legislativa", n: data.agenda.disponible ? data.agenda.comisiones : "—", sub: data.agenda.disponible ? `comisiones con actividad · ${data.agenda.proyectos} proyectos en tabla` : "no se pudo consultar la agenda oficial", ver: "Ver por comisión" },
              { k: "demanda", icono: <Inbox className="w-4 h-4" />, titulo: "Demanda ATP", n: data.demanda.nuevos, sub: `nuevos requerimientos · ${data.demanda.comisiones} comisiones · ${data.demanda.parlamentarios} parlamentarios`, ver: "Ver requerimientos" },
              { k: "trabajo", icono: <FlaskConical className="w-4 h-4" />, titulo: "Trabajo en curso", n: data.trabajo.activas, sub: `investigaciones activas · ${data.trabajo.areas.length} áreas ATP`, ver: "Ver investigaciones" }
            ] as const).map((c) => (
              <button
                key={c.k}
                onClick={() => setPanel(panel === c.k ? null : c.k)}
                className={`text-left bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${panel === c.k ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200"}`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">{c.icono} {c.titulo}</p>
                <p className="text-5xl font-black text-slate-900 mt-2 leading-none">{c.n}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-2 leading-snug">{c.sub}</p>
                <p className="text-[11px] font-bold text-blue-700 mt-3 flex items-center gap-1">{c.ver} <ChevronRight className="w-3 h-3" /></p>
              </button>
            ))}
          </div>

          {panel && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {panel === "agenda" ? "Actividad por comisión esta semana" : panel === "demanda" ? "Requerimientos nuevos esta semana" : "Investigaciones activas por área"}
                </h3>
                <button onClick={() => setPanel(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              {panel === "agenda" && (
                data.agenda.porComision.length === 0 ? <p className="text-xs text-slate-400 font-semibold">Sin actividad disponible.</p> : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {data.agenda.porComision.map((c) => (
                      <li key={c.comision} className="text-[11px] border border-slate-100 rounded-lg px-3 py-2 bg-slate-50">
                        <span className="font-bold text-slate-800">{c.comision}</span>
                        <span className="text-slate-500"> — {c.boletines.length ? `Boletines: ${c.boletines.join(", ")}` : "sin boletines en tabla"}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
              {panel === "demanda" && (
                <div className="flex flex-col gap-1.5">
                  {data.investigaciones.filter((i) => i.fechaIngreso >= data.semana.desde).map((i) => (
                    <div key={i.id} className="text-[11px] border border-slate-100 rounded-lg px-3 py-2 bg-slate-50 flex flex-wrap gap-x-3">
                      <span className="font-bold text-slate-800">{i.materia}</span>
                      <span className="text-slate-500">{i.tipo === "parlamentario" ? "Parlamentario" : "Comisión"}: {i.solicitante || "—"}</span>
                      <span className="text-slate-500">{i.area}</span>
                    </div>
                  ))}
                  {data.demanda.nuevos === 0 && <p className="text-xs text-slate-400 font-semibold">No hay requerimientos nuevos esta semana.</p>}
                </div>
              )}
              {panel === "trabajo" && (
                <div className="flex flex-wrap gap-2">
                  {data.trabajo.areas.map((a) => (
                    <span key={a.area} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${colorDeArea(a.area)}`}>{a.area} · {a.cantidad}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conexiones detectadas */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">Conexiones detectadas esta semana</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">La utilidad no está solo en ver la carga de trabajo, sino en advertir dónde conviene conectar información y personas. Son sugerencias: nada se fusiona ni se envía solo.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {columna("Cruces temáticos", "Distintas áreas investigan materias relacionadas. ¿Qué conocimiento podemos compartir?", <Link2 className="w-4 h-4" />, data.conexiones.cruces, "bg-blue-50 border-blue-200", "Sin cruces temáticos por ahora.")}
              {columna("Alertas de continuidad", "Un proyecto que entra a una nueva etapa ya fue trabajado por ATP.", <History className="w-4 h-4" />, data.conexiones.continuidad, "bg-amber-50 border-amber-200", "Sin proyectos con trabajo previo en nueva etapa.")}
              {columna("Alertas de coordinación", "Requerimientos distintos comparten materia, fuentes o antecedentes.", <Handshake className="w-4 h-4" />, data.conexiones.coordinacion, "bg-emerald-50 border-emerald-200", "Sin alertas de coordinación por ahora.")}
            </div>
          </div>

          {/* Registro */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">Investigaciones registradas ({filtradas.length})</h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Materia, investigador, boletín…" className="border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs w-56" />
                </div>
                <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                  <option value="todas">Todas las áreas</option>
                  {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                  <option value="en_curso">En curso</option>
                  <option value="entregada">Entregadas</option>
                  <option value="archivada">Archivadas</option>
                  <option value="todos">Todos los estados</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-left text-slate-600">
                    {["Área", "Materia", "Investigador/a", "Solicitante", "Boletines", "Estado", "Ingreso"].map((h) => <th key={h} className="px-3 py-2 font-extrabold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((i, k) => (
                    <tr key={i.id} className={k % 2 ? "bg-slate-50/60" : "bg-white"}>
                      <td className="px-3 py-2 align-top"><span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${colorDeArea(i.area)}`}>{i.area}</span></td>
                      <td className="px-3 py-2 align-top font-bold text-slate-800 max-w-sm">{i.materia}<div className="text-[10px] font-medium text-slate-400">{i.palabrasClave.join(" · ")}</div></td>
                      <td className="px-3 py-2 align-top text-slate-600">{i.investigador}</td>
                      <td className="px-3 py-2 align-top text-slate-600">{i.solicitante || "—"}</td>
                      <td className="px-3 py-2 align-top text-slate-600">{i.boletines.join(", ") || "—"}</td>
                      <td className="px-3 py-2 align-top text-slate-600">{ETIQUETA_ESTADO[i.estado]}</td>
                      <td className="px-3 py-2 align-top text-slate-500 whitespace-nowrap">{i.fechaIngreso}</td>
                    </tr>
                  ))}
                  {filtradas.length === 0 && <tr><td colSpan={7} className="text-center text-slate-400 font-semibold py-8">No hay investigaciones con esos filtros.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {importOpen && <ImportarModal headers={headers} onCerrar={() => setImportOpen(false)} onListo={() => { setImportOpen(false); cargar(); }} onPlantilla={descargarPlantilla} demo={!!data?.fuente.demo} />}
    </motion.div>
  );
}

function ImportarModal({ headers, onCerrar, onListo, onPlantilla, demo }: {
  headers: () => Record<string, string>;
  onCerrar: () => void;
  onListo: () => void;
  onPlantilla: () => void;
  demo: boolean;
}) {
  const [tipo, setTipo] = useState<"investigaciones" | "asignaciones">("investigaciones");
  const [modo, setModo] = useState<"reemplazar" | "agregar">("reemplazar");
  const [csv, setCsv] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  const leerArchivo = async (f: File | undefined) => {
    if (!f) return;
    setCsv(await f.text());
  };

  const enviar = async () => {
    setEnviando(true);
    setResultado(null);
    try {
      const res = await fetch("/api/pizarra/importar", { method: "POST", headers: { "Content-Type": "application/json", ...headers() }, body: JSON.stringify({ csv, tipo, modo }) });
      const j = await res.json();
      if (!res.ok) {
        setFallo(true);
        setResultado(j.error + (j.rechazados?.length ? ` Ejemplo: fila ${j.rechazados[0].fila}: ${j.rechazados[0].motivo}` : ""));
        return;
      }
      setFallo(false);
      setResultado(`Se importaron ${j.aceptados} filas${j.rechazados?.length ? ` (${j.rechazados.length} rechazadas)` : ""}. ${j.persistido ? "Guardado en el servidor." : "Solo en memoria: define PIZARRA_DATA_DIR en el servidor para conservarlo."}`);
      setTimeout(onListo, 1400);
    } catch {
      setFallo(true);
      setResultado("No se pudo enviar el archivo.");
    } finally {
      setEnviando(false);
    }
  };

  const restablecer = async () => {
    await fetch("/api/pizarra/restablecer-demo", { method: "POST", headers: headers() });
    onListo();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Importar datos a la Pizarra</h3>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Sube un CSV (columnas separadas por <b>;</b> o <b>,</b>) exportado desde el SUP o armado a mano. Las columnas con varios valores (boletines, palabras_clave, normas) se separan con <b>|</b>.
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-1.5 font-bold text-slate-700">Contenido
            <select value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)} className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white font-medium">
              <option value="investigaciones">Investigaciones / pedidos</option>
              <option value="asignaciones">Comisiones que sigue cada investigador/a</option>
            </select>
          </label>
          {tipo === "investigaciones" && (
            <label className="flex items-center gap-1.5 font-bold text-slate-700">Modo
              <select value={modo} onChange={(e) => setModo(e.target.value as typeof modo)} className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white font-medium">
                <option value="reemplazar">Reemplazar todo</option>
                <option value="agregar">Agregar / actualizar por id</option>
              </select>
            </label>
          )}
        </div>
        {tipo === "asignaciones" && <p className="text-[11px] text-slate-500">Columnas: <code>investigador;area;comision</code>. Permite avisar cuando un informe va a una comisión que sigue otra persona.</p>}
        <input type="file" accept=".csv,text/csv,.txt" onChange={(e) => leerArchivo(e.target.files?.[0])} className="text-xs" />
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="…o pega aquí el contenido CSV" className="border border-slate-200 rounded-lg p-2.5 text-[11px] font-mono h-40 resize-none" />
        {resultado && <p className={`text-xs font-semibold ${fallo ? "text-rose-700" : "text-emerald-700"}`}>{resultado}</p>}
        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex gap-2">
            <button onClick={onPlantilla} className="text-xs font-bold border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-1.5 cursor-pointer"><Download className="w-3.5 h-3.5" /> Plantilla CSV</button>
            {!demo && <button onClick={restablecer} className="text-xs font-bold text-slate-500 hover:text-rose-700 px-2 py-2 cursor-pointer">Volver a datos de demostración</button>}
          </div>
          <button onClick={enviar} disabled={enviando || csv.trim().length < 10} className="text-xs font-bold bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-lg px-4 py-2 cursor-pointer">
            {enviando ? "Importando…" : "Importar"}
          </button>
        </div>
      </div>
    </div>
  );
}
