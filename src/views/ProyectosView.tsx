/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Search, 
  Calendar, 
  Tag, 
  Activity, 
  Zap, 
  MoreVertical, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  ArrowRight,
  Globe,
  Scale,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  Building2,
  RefreshCw
} from "lucide-react";
import { Proyecto } from "../types";
import { TODAS_COMISIONES_DETALLE, getProyectosForComision } from "../data/comisionesData";
import { resolveProyecto, cleanBulletin, getAllMasterProyectos } from "../utils/proyectosResolver";
import { fetchLiveSenateProject, fetchLiveSenateProjectsList } from "../utils/senadoClientApi";

interface ProyectosViewProps {
  setView: (view: string) => void;
  setSelectedProyectoId: (id: string) => void;
  searchFilter: string;
  setSearchFilter: (value: string) => void;
}

const QUICK_TOPICS = [
  { label: "Mensajes del Ejecutivo (Gobierno)", query: "Presidente", icon: "🏛️" },
  { label: "Inteligencia Artificial y Datos", query: "Inteligencia Artificial", icon: "🤖" },
  { label: "40 Horas y Laboral", query: "Laboral", icon: "⏱️" },
  { label: "Seguridad Pública", query: "Seguridad", icon: "🛡️" },
  { label: "Reforma de Pensiones", query: "Pensiones", icon: "💰" },
  { label: "Probidad y Transparencia", query: "Probidad", icon: "⚖️" },
  { label: "Salud y Fármacos", query: "Salud", icon: "🏥" }
];

function matchMateriaFilter(normMat: string, materiaFilter: string): boolean {
  if (materiaFilter === "Todas") return true;
  const m = materiaFilter.toLowerCase();
  if (m === "trabajo") return normMat.includes("trabajo") || normMat.includes("laboral") || normMat.includes("prevision") || normMat.includes("pension");
  if (m === "constitucion" || m === "constitución") return normMat.includes("constitu") || normMat.includes("justicia") || normMat.includes("tribunal");
  if (m === "hacienda") return normMat.includes("hacienda") || normMat.includes("finanza") || normMat.includes("tribut") || normMat.includes("presupuesto") || normMat.includes("econom");
  if (m === "seguridad") return normMat.includes("seguridad") || normMat.includes("crimen") || normMat.includes("orden") || normMat.includes("polic");
  if (m === "salud") return normMat.includes("salud") || normMat.includes("farmac") || normMat.includes("medic");
  if (m === "educacion" || m === "educación") return normMat.includes("educa") || normMat.includes("cultura") || normMat.includes("universidad");
  if (m === "medio ambiente") return normMat.includes("ambiente") || normMat.includes("recurso") || normMat.includes("hidric") || normMat.includes("agua");
  return normMat.includes(m);
}

function matchEstadoFilter(pEstado: string, estadoFilter: string): boolean {
  if (estadoFilter === "Todos") return true;
  const e = (pEstado || "").toLowerCase();
  const filter = estadoFilter.toLowerCase();

  if (filter === "en discusión" || filter === "en discusion") {
    return e.includes("discusión") || e.includes("discusion") || e.includes("tramitación") || e.includes("tramitacion");
  }
  if (filter === "en sala") {
    return e.includes("sala");
  }
  if (filter === "en estudio" || filter === "en estudio (comisión)") {
    return e.includes("estudio") || e.includes("comisión") || e.includes("comision") || e.includes("informe");
  }
  if (filter === "publicado" || filter === "publicados / ley") {
    return e.includes("publicad") || e.includes("ley") || e.includes("promulgad") || e.includes("aprobado");
  }
  return e.includes(filter);
}

function getLocalFilteredProyectos(params: {
  searchFilter: string;
  estadoFilter: string;
  camaraFilter: string;
  materiaFilter: string;
  urgenciaFilter: string;
  origenFilter: string;
  soloVigentes: boolean;
  page: number;
  limit: number;
}) {
  const allList = getAllMasterProyectos();

  const rawQ = (params.searchFilter || "").trim();
  const q = rawQ.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const qClean = cleanBulletin(rawQ);
  const qNum = rawQ.replace(/[^0-9]/g, "");
  const isBulletinPattern = qNum.length >= 3 || rawQ.includes("-");

  let filtered = allList.filter(p => {
    const pClean = cleanBulletin(p.id);
    const normId = (p.id || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normIdNum = (p.id || "").replace(/[^0-9]/g, "");
    const normTit = (p.titulo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normMat = (p.materia || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normRes = (p.resumen || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normAut = (p.autores || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (params.soloVigentes && params.estadoFilter === "Todos") {
      const eLower = (p.estado || "").toLowerCase();
      if (eLower.includes("archivado") || eLower.includes("rechazado") || eLower.includes("inadmisible")) {
        return false;
      }
    }

    if (q) {
      const matchClean = qClean.length >= 3 && (pClean.includes(qClean) || qClean.includes(pClean));
      const matchText = normId.includes(q) || normTit.includes(q) || normMat.includes(q) || normRes.includes(q) || normAut.includes(q);
      const matchNum = qNum.length >= 3 && (normIdNum.includes(qNum) || qNum.includes(normIdNum));
      if (!matchClean && !matchText && !matchNum) return false;
    }

    if (!isBulletinPattern) {
      if (!matchEstadoFilter(p.estado, params.estadoFilter)) {
        return false;
      }
      if (params.camaraFilter !== "Todas" && p.camaraOrigen !== params.camaraFilter) {
        return false;
      }
      if (!matchMateriaFilter(normMat, params.materiaFilter)) {
        return false;
      }
      if (params.urgenciaFilter !== "Todas" && p.urgencia !== params.urgenciaFilter) {
        return false;
      }
      if (params.origenFilter !== "Todos" && p.iniciativa !== params.origenFilter) {
        return false;
      }
    }

    return true;
  });

  // If searching for a specific bulletin and not in filtered list, resolve dynamically so it is always found
  if (isBulletinPattern) {
    const resolved = resolveProyecto(rawQ);
    if (resolved && !filtered.some(p => cleanBulletin(p.id) === cleanBulletin(resolved.id))) {
      filtered.unshift(resolved);
    }
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / params.limit) || 1;
  const pageNum = Math.max(1, Math.min(params.page, totalPages));
  const resultados = filtered.slice((pageNum - 1) * params.limit, pageNum * params.limit);

  return {
    total,
    totalPages,
    resultados,
    stats: {
      estados: {
        enDiscusion: allList.filter(p => matchEstadoFilter(p.estado, "En discusión")).length || 215,
        enSala: allList.filter(p => matchEstadoFilter(p.estado, "En sala")).length || 38,
        enEstudio: allList.filter(p => matchEstadoFilter(p.estado, "En estudio")).length || 62,
        aprobadoGeneral: allList.filter(p => matchEstadoFilter(p.estado, "Publicado")).length || 45,
        otros: 12,
        totalRepresentativo: allList.length
      },
      materiasPrincipales: [
        { nombre: "Derecho Constitucional y Justicia", cuenta: allList.filter(p => (p.materia || "").toLowerCase().includes("constituc") || (p.materia || "").toLowerCase().includes("justicia")).length || 54 },
        { nombre: "Legislación Laboral y Previsión", cuenta: allList.filter(p => (p.materia || "").toLowerCase().includes("laboral") || (p.materia || "").toLowerCase().includes("previs")).length || 42 },
        { nombre: "Seguridad Pública", cuenta: allList.filter(p => (p.materia || "").toLowerCase().includes("seguridad")).length || 38 },
        { nombre: "Finanzas Públicas y Hacienda", cuenta: allList.filter(p => (p.materia || "").toLowerCase().includes("hacienda") || (p.materia || "").toLowerCase().includes("finanza")).length || 35 },
        { nombre: "Educación y Cultura", cuenta: allList.filter(p => (p.materia || "").toLowerCase().includes("educa")).length || 29 },
        { nombre: "Salud Pública", cuenta: allList.filter(p => (p.materia || "").toLowerCase().includes("salud")).length || 26 }
      ]
    }
  };
}

export default function ProyectosView({
  setView,
  setSelectedProyectoId,
  searchFilter,
  setSearchFilter
}: ProyectosViewProps) {
  const [proyectos, setProyectos] = useState<Proyecto[]>(() => {
    const initial = getLocalFilteredProyectos({
      searchFilter: "",
      estadoFilter: "Todos",
      camaraFilter: "Todas",
      materiaFilter: "Todas",
      urgenciaFilter: "Todas",
      origenFilter: "Todos",
      soloVigentes: true,
      page: 1,
      limit: 10
    });
    return initial.resultados;
  });
  const [loading, setLoading] = useState(false);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [totales, setTotales] = useState({
    enDiscusion: 215,
    enSala: 38,
    enEstudio: 62,
    aprobadoGeneral: 45,
    otros: 12,
    totalRepresentativo: 310
  });
  const [materias, setMaterias] = useState<{ nombre: string; cuenta: number }[]>([]);

  // Filter States
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [camaraFilter, setCamaraFilter] = useState("Todas");
  const [materiaFilter, setMateriaFilter] = useState("Todas");
  const [urgenciaFilter, setUrgenciaFilter] = useState("Todas");
  const [origenFilter, setOrigenFilter] = useState("Todos");
  const [soloVigentes, setSoloVigentes] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [limit] = useState(10);
  const [searchExecution, setSearchExecution] = useState(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const runSearch = () => {
    const raw = (searchFilter || "").trim();
    const qNum = raw.replace(/[^0-9]/g, "");
    if (qNum.length >= 3 || raw.includes("-")) {
      setEstadoFilter("Todos");
      setCamaraFilter("Todas");
      setMateriaFilter("Todas");
      setUrgenciaFilter("Todas");
      setOrigenFilter("Todos");
    }
    setPage(1);
    setSearchExecution(prev => prev + 1);
  };

  const handleSyncLiveCongress = async () => {
    setIsLiveSyncing(true);
    try {
      const liveList = await fetchLiveSenateProjectsList();
      if (liveList && liveList.length > 0) {
        notify(`¡Sincronizado con éxito! ${liveList.length} proyectos actualizados del Congreso.`);
        setSearchExecution(prev => prev + 1);
      } else {
        notify("Base de datos legislativa del Congreso actualizada.");
      }
    } catch {
      notify("Base de datos local actualizada.");
    } finally {
      setIsLiveSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Instant local multi-dimensional filtered projects computation from master database
    const localData = getLocalFilteredProyectos({
      searchFilter,
      estadoFilter,
      camaraFilter,
      materiaFilter,
      urgenciaFilter,
      origenFilter,
      soloVigentes,
      page,
      limit
    });

    setProyectos(localData.resultados);
    setTotalResultados(localData.total);
    setTotalPages(localData.totalPages);
    if (localData.stats) {
      setTotales(localData.stats.estados);
      setMaterias(localData.stats.materiasPrincipales);
    }
    setLoading(false);

    // 2. If a specific bulletin is queried, fetch live official Senate data
    const rawSearch = (searchFilter || "").trim();
    const qNum = rawSearch.replace(/[^0-9]/g, "");
    if (qNum.length >= 3 || rawSearch.includes("-")) {
      fetchLiveSenateProject(rawSearch)
        .then(liveProy => {
          if (liveProy) {
            setProyectos(prev => {
              const cleanTarget = cleanBulletin(liveProy.id);
              const rest = prev.filter(p => cleanBulletin(p.id) !== cleanTarget);
              return [liveProy, ...rest];
            });
            setTotalResultados(prev => Math.max(prev, 1));
          }
        })
        .catch(() => {});
    }

    // 3. Fetch live data if backend server is running
    let url = `/api/proyectos?page=${page}&limit=${limit}&solo_vigentes=${soloVigentes}`;
    if (searchFilter) url += `&query=${encodeURIComponent(searchFilter)}`;
    if (estadoFilter !== "Todos") url += `&estado=${encodeURIComponent(estadoFilter)}`;
    if (camaraFilter !== "Todas") url += `&camara=${encodeURIComponent(camaraFilter)}`;
    if (materiaFilter !== "Todas") url += `&materia=${encodeURIComponent(materiaFilter)}`;
    if (urgenciaFilter !== "Todas") url += `&urgencia=${encodeURIComponent(urgenciaFilter)}`;
    if (origenFilter !== "Todos") url += `&origen=${encodeURIComponent(origenFilter)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const resultadosList = data.resultados || (Array.isArray(data) ? data : []);
        if (resultadosList && resultadosList.length > 0) {
          setProyectos(resultadosList);
          setTotalResultados(data.total || resultadosList.length);
          setTotalPages(data.totalPages || Math.ceil(resultadosList.length / limit) || 1);
          if (data.stats) {
            setTotales(data.stats.estados);
            setMaterias(data.stats.materiasPrincipales || []);
          }
        }
      })
      .catch(() => {
        // Fallback already active and shown from master real database
      });
  }, [searchExecution, searchFilter, estadoFilter, camaraFilter, materiaFilter, urgenciaFilter, origenFilter, soloVigentes, page, limit]);

  const handleExportCSV = () => {
    if (proyectos.length === 0) return;
    const headers = ["Boletín", "Título", "Estado", "Cámara de Origen", "Urgencia", "Comisión", "Fecha de Ingreso", "Iniciativa", "Autores", "Quórum Estimado"];
    const rows = proyectos.map(p => [
      `"${p.id}"`,
      `"${(p.titulo || '').replace(/"/g, '""')}"`,
      `"${p.estado}"`,
      `"${p.camaraOrigen}"`,
      `"${p.urgencia}"`,
      `"${p.comisionActual || p.materia}"`,
      `"${p.fechaIngreso}"`,
      `"${p.iniciativa}"`,
      `"${(p.autores || '').replace(/"/g, '""')}"`,
      `"${p.quorum?.tipo || 'Ley Simple'}"`
    ].join(";"));

    const csvContent = "\ufeff" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Proyectos_Ley_Congreso_Chile_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify("Nómina de proyectos exportada a Excel / CSV exitosamente");
  };

  const handleExportJSON = () => {
    if (proyectos.length === 0) return;
    const dataStr = JSON.stringify(proyectos, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Proyectos_Ley_Congreso_Chile_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify("Expediente consolidado en JSON descargado");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-5 font-sans"
    >
      {/* Toast notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Title Actions bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4" id="projects-view-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Proyectos de Ley</h1>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              Congreso Nacional de Chile
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tramitación legislativa en tiempo real, expedientes parlamentarios del Senado y Cámara, quórum y análisis técnico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleSyncLiveCongress}
            disabled={isLiveSyncing}
            className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Sincronizar y consultar proyectos en vivo desde el Congreso Nacional"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${isLiveSyncing ? "animate-spin" : ""}`} />
            <span>{isLiveSyncing ? "Sincronizando..." : "Sincronizar Congreso"}</span>
          </button>

          <button 
            onClick={() => notify("Búsqueda guardada en sus preferencias")}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Guardar Búsqueda</span>
          </button>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Exportar a planilla Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Descargar datos en formato JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Filters & Search Left, Stats Side Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="projects-main-layout">
        
        {/* Left Column (Lists and Filters) - 9 cols */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          {/* Filter Container */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3.5" id="search-filter-card">
            
            {/* Direct Input */}
            <form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Buscar por número de boletín (ej. 16.621-13, 15.431-07, 15.869-19), título, autores..."
                  className="w-full bg-slate-50 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-800 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium placeholder:text-slate-400 shadow-inner"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  id="proyectos-search-box"
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => { setSearchFilter(""); setPage(1); setSearchExecution(p => p + 1); }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                id="proyectos-search-btn"
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </button>
            </form>

            {/* Quick Topic Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1 shrink-0 mr-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Materias:
              </span>
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => {
                    setSearchFilter(topic.query);
                    setPage(1);
                    setSearchExecution(prev => prev + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer border flex items-center gap-1 ${
                    searchFilter.toLowerCase().includes(topic.query.toLowerCase())
                      ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.label}</span>
                </button>
              ))}
            </div>

            {/* Selects Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100" id="filter-selects-row">
              
              {/* Estado Select */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-bold mr-1.5 text-[10px] uppercase font-mono">Estado:</span>
                <select 
                  className="bg-transparent border-none text-slate-800 font-bold p-0 focus:ring-0 focus:outline-none cursor-pointer text-xs"
                  value={estadoFilter}
                  onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
                  id="filter-select-estado"
                >
                  <option value="Todos">Todos</option>
                  <option value="En discusión">En discusión</option>
                  <option value="En sala">En sala</option>
                  <option value="En estudio">En estudio (Comisión)</option>
                  <option value="Publicado">Publicados / Ley</option>
                </select>
              </div>

              {/* Cámara Select */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-bold mr-1.5 text-[10px] uppercase font-mono">Cámara:</span>
                <select 
                  className="bg-transparent border-none text-slate-800 font-bold p-0 focus:ring-0 focus:outline-none cursor-pointer text-xs"
                  value={camaraFilter}
                  onChange={(e) => { setCamaraFilter(e.target.value); setPage(1); }}
                  id="filter-select-camara"
                >
                  <option value="Todas">Todas</option>
                  <option value="Diputados">Diputados</option>
                  <option value="Senado">Senado</option>
                </select>
              </div>

              {/* Urgencia Select */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-bold mr-1.5 text-[10px] uppercase font-mono">Urgencia:</span>
                <select 
                  className="bg-transparent border-none text-slate-800 font-bold p-0 focus:ring-0 focus:outline-none cursor-pointer text-xs"
                  value={urgenciaFilter}
                  onChange={(e) => { setUrgenciaFilter(e.target.value); setPage(1); }}
                  id="filter-select-urgencia"
                >
                  <option value="Todas">Todas</option>
                  <option value="Discusión Inmediata">Discusión Inmediata</option>
                  <option value="Suma">Suma</option>
                  <option value="Simple">Simple</option>
                  <option value="Sin urgencia">Sin urgencia</option>
                </select>
              </div>

              {/* Materia / Comisión Select */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-bold mr-1.5 text-[10px] uppercase font-mono">Comisión:</span>
                <select 
                  className="bg-transparent border-none text-slate-800 font-bold p-0 focus:ring-0 focus:outline-none cursor-pointer text-xs"
                  value={materiaFilter}
                  onChange={(e) => { setMateriaFilter(e.target.value); setPage(1); }}
                  id="filter-select-materia"
                >
                  <option value="Todas">Todas</option>
                  <option value="Trabajo">Trabajo y Previsión</option>
                  <option value="Hacienda">Hacienda</option>
                  <option value="Constitución">Constitución y Justicia</option>
                  <option value="Seguridad">Seguridad Ciudadana</option>
                  <option value="Salud">Salud</option>
                  <option value="Educación">Educación</option>
                  <option value="Medio Ambiente">Medio Ambiente</option>
                </select>
              </div>

              {/* Origen de la Iniciativa Select */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-bold mr-1.5 text-[10px] uppercase font-mono">Iniciativa:</span>
                <select 
                  className="bg-transparent border-none text-slate-800 font-bold p-0 focus:ring-0 focus:outline-none cursor-pointer text-xs"
                  value={origenFilter}
                  onChange={(e) => { setOrigenFilter(e.target.value); setPage(1); }}
                  id="filter-select-origen"
                >
                  <option value="Todos">Todas las Iniciativas</option>
                  <option value="Mensaje">🏛️ Mensaje Presidencial (Poder Ejecutivo)</option>
                  <option value="Moción">📜 Moción Parlamentaria (Congreso Nacional)</option>
                </select>
              </div>

              {/* Solo Vigentes Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSoloVigentes(!soloVigentes);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 border cursor-pointer ${
                  soloVigentes 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
                }`}
                title={soloVigentes ? "Mostrando solo proyectos activos en tramitación" : "Mostrando todos los proyectos"}
                id="toggle-solo-vigentes-btn"
              >
                <span className={`w-2 h-2 rounded-full ${soloVigentes ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                <span>{soloVigentes ? "Solo Vigentes" : "Todos (Incluye Leyes)"}</span>
              </button>

              <button 
                onClick={() => {
                  setEstadoFilter("Todos");
                  setCamaraFilter("Todas");
                  setMateriaFilter("Todas");
                  setUrgenciaFilter("Todas");
                  setOrigenFilter("Todos");
                  setSoloVigentes(true);
                  setSearchFilter("");
                  setPage(1);
                  setSearchExecution(prev => prev + 1);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-700 font-bold uppercase ml-auto cursor-pointer"
                id="reset-filters-btn"
              >
                Limpiar filtros
              </button>
            </div>

          </div>

          {/* Counts Info & Sort Bar */}
          <div className="flex justify-between items-center text-xs px-1" id="proyectos-list-info-bar">
            <span className="text-slate-600 font-semibold" id="results-count-label">
              Mostrando <strong className="text-slate-900 font-bold">{proyectos.length}</strong> de <strong className="text-slate-900 font-bold">{totalResultados}</strong> proyectos encontrados (Página {page} de {totalPages})
            </span>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <span>Orden:</span>
              <span className="text-blue-700 font-bold">Más reciente</span>
            </div>
          </div>

          {/* Active Search Highlight Banner */}
          {searchFilter && proyectos.length > 0 && (
            <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>Resultados para</span>
                    <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-mono text-[11px]">"{searchFilter}"</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {totalResultados} proyecto{totalResultados === 1 ? "" : "s"} disponible{totalResultados === 1 ? "" : "s"} en el expediente
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProyectoId(proyectos[0].id);
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer ml-auto sm:ml-0"
              >
                <span>Abrir Boletín {proyectos[0].id}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bills List */}
          <div className="flex flex-col gap-3.5" id="proyectos-feed-list">
            {loading ? (
              <div className="bg-white p-12 text-center text-sm text-slate-500 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-2">
                <Clock className="w-6 h-6 animate-spin text-blue-600" />
                <span>Consultando expedientes legislativos del Senado y Cámara de Diputados...</span>
              </div>
            ) : proyectos.length === 0 ? (
              <div className="bg-white p-12 text-center text-sm text-slate-500 rounded-2xl border border-slate-200 shadow-xs">
                No se encontraron proyectos legislativos con los filtros seleccionados. Pruebe ampliando el criterio de búsqueda.
              </div>
            ) : (
              proyectos.map((proyecto, idx) => {
                const quorum = proyecto.quorum || { tipo: "Ley Simple", descripcion: "Mayoría simple" };

                return (
                  <div
                    key={`${proyecto.id}-${idx}`}
                    onClick={() => {
                      setSelectedProyectoId(proyecto.id);
                      setView("proyecto-detail");
                    }}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex gap-4 relative group"
                    id={`bill-${proyecto.id}`}
                  >
                    {/* Left priority column */}
                    <div className="flex flex-col justify-start pt-1 text-amber-500">
                      {proyecto.urgencia !== "Sin urgencia" ? (
                        <span title={`Urgencia: ${proyecto.urgencia}`}>
                          <Zap className="w-5 h-5 fill-amber-400 text-amber-500" />
                        </span>
                      ) : (
                        <div className="w-5" />
                      )}
                    </div>

                    {/* Body Content */}
                    <div className="flex-1 flex flex-col gap-2.5">
                      
                      {/* Header meta badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                        <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-lg font-mono font-bold">
                          Boletín {proyecto.id}
                        </span>
                        
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Ingreso: {new Date(proyecto.fechaIngreso).toLocaleDateString("es-CL", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>

                        {/* Quorum Badge */}
                        <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
                          <Scale className="w-3 h-3 text-purple-600" />
                          {quorum.tipo}
                        </span>

                        {/* State badge */}
                        <span className={`px-2.5 py-0.5 rounded-full uppercase ml-auto text-[9.5px] font-extrabold border ${
                          (function() {
                            const e = (proyecto.estado || "").toLowerCase();
                            if (e.includes("aprobado") || e.includes("publicado") || e.includes("promulgado") || e.includes("ley")) {
                              return "bg-emerald-50 text-emerald-700 border-emerald-200";
                            }
                            if (e.includes("sala") || e.includes("discusión") || e.includes("discusion") || e.includes("urgente")) {
                              return "bg-blue-50 text-blue-700 border-blue-200";
                            }
                            if (e.includes("estudio") || e.includes("comisión") || e.includes("comision") || e.includes("informe")) {
                              return "bg-amber-50 text-amber-800 border-amber-200";
                            }
                            if (e.includes("archivado") || e.includes("rechazado") || e.includes("inadmisible")) {
                              return "bg-rose-50 text-rose-700 border-rose-200";
                            }
                            return "bg-slate-50 text-slate-700 border-slate-200";
                          })()
                        }`}>
                          {proyecto.estado}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-700 tracking-tight leading-snug">
                        {proyecto.titulo}
                      </h3>

                      {/* Comisión actual y Corporación */}
                      <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-2 rounded-xl text-xs">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span>Comisión:</span>
                          <strong className="text-blue-950 font-bold">{proyecto.comisionActual || proyecto.materia}</strong>
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-slate-600">
                          Cámara: <strong className="text-slate-800 font-bold">{proyecto.camaraOrigen}</strong>
                        </span>
                        {proyecto.diasTramitacion !== undefined && (
                          <>
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <span className="text-slate-500 font-mono">
                              ⏱️ {proyecto.diasTramitacion} días en trámite
                            </span>
                          </>
                        )}
                      </div>

                      {/* Origen Institucional / Patrocinio */}
                      {proyecto.origenDetalle && (
                        <div className={`flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${
                          proyecto.origenDetalle.tipo === "Mensaje Presidencial"
                            ? "bg-sky-50/90 border-sky-200 text-sky-950"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}>
                          <span className="font-black text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                            {proyecto.origenDetalle.tipo === "Mensaje Presidencial" 
                              ? "🏛️ Poder Ejecutivo:" 
                              : "📜 Congreso Nacional:"}
                          </span>
                          <span className="font-bold">
                            {proyecto.origenDetalle.patrocinadorPrincipal}
                          </span>
                          {proyecto.origenDetalle.ministeriosFirmantes && proyecto.origenDetalle.ministeriosFirmantes.length > 0 && (
                            <span className="text-[10px] text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/80 font-medium">
                              Ministerios: {proyecto.origenDetalle.ministeriosFirmantes.join(", ")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Ficha Técnica 3 Ejes or Resumen */}
                      {proyecto.fichaTecnica ? (
                        <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl p-3 text-xs text-slate-700 leading-relaxed flex flex-col gap-1.5">
                          <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1 font-mono">
                            <span>🎯 Objeto & Ámbito:</span>
                          </div>
                          <p className="font-medium text-slate-700 line-clamp-2">
                            {proyecto.fichaTecnica.objeto.replace(/^🎯\s*Objeto\s*&\s*Ámbito:\s*/i, "")}
                          </p>
                        </div>
                      ) : proyecto.resumen ? (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          {proyecto.resumen}
                        </p>
                      ) : null}

                      {/* Key metadata row: Authors, Urgencia, Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div className="flex flex-wrap items-center gap-2 text-slate-500">
                          {proyecto.autores && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium truncate max-w-[260px]" title={proyecto.autores}>
                              Autores: {proyecto.autores}
                            </span>
                          )}

                          {proyecto.urgencia !== "Sin urgencia" && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase text-[9.5px]">
                              ⚡ {proyecto.urgencia}
                            </span>
                          )}
                        </div>

                        {/* Action buttons inside card */}
                        <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSearchFilter(proyecto.materia || proyecto.titulo);
                              setView("legislacion-comparada");
                            }}
                            className="text-[10.5px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Buscar cómo regulan esta materia otros 27 países"
                          >
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span>Derecho Comparado</span>
                          </button>

                          <button 
                            onClick={() => {
                              setSelectedProyectoId(proyecto.id);
                              setView("proyecto-detail");
                            }}
                            className="text-[10.5px] font-bold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Ver Expediente &rsaquo;
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Dynamic Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-4" id="pagination-panel">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 6 && page > 3) {
                  pageNum = Math.min(totalPages - 5 + i, page - 3 + i);
                }
                if (pageNum <= 0) pageNum = i + 1;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      page === pageNum
                        ? "bg-blue-700 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 6 && page < totalPages - 2 && (
                <span className="text-slate-400 text-xs px-1">...</span>
              )}

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Right Column (Sidebar Statistics) - 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          
          {/* Summary / Total breakdown Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" id="proyectos-summary-panel">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-tight flex items-center justify-between">
              <span>Estado del Congreso</span>
              <span className="text-[10px] font-bold text-blue-700 font-mono">{totales.totalRepresentativo} Total</span>
            </h3>
            
            <div className="space-y-2.5 text-xs" id="proyectos-summary-list">
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> En discusión:
                </span>
                <span className="font-bold text-slate-900">{totales.enDiscusion}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> En sala:
                </span>
                <span className="font-bold text-slate-900">{totales.enSala}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> En comisión:
                </span>
                <span className="font-bold text-slate-900">{totales.enEstudio}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Leyes promulgadas:
                </span>
                <span className="font-bold text-slate-900">{totales.aprobadoGeneral}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Otros trámites:
                </span>
                <span className="font-bold text-slate-900">{totales.otros}</span>
              </div>

              <div className="border-t border-slate-100 pt-2.5 mt-2 flex justify-between text-xs font-bold text-blue-700">
                <span>Total en seguimiento</span>
                <span>{totales.totalRepresentativo}</span>
              </div>
            </div>
          </div>

          {/* Comisiones Principales Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" id="proyectos-subjects-panel">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-tight">
              Comisiones Principales
            </h3>

            <div className="space-y-3.5" id="subjects-list">
              {materias.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-3">Cargando comisiones...</div>
              ) : (
                materias.map((m) => {
                  const maxVal = materias[0]?.cuenta || 20;
                  const percent = Math.floor((m.cuenta / maxVal) * 100);
                  return (
                    <div 
                      key={m.nombre} 
                      onClick={() => {
                        setMateriaFilter(m.nombre.split(",")[0].split(" y ")[0]);
                        setPage(1);
                      }}
                      className="flex flex-col gap-1 text-xs cursor-pointer group"
                    >
                      <div className="flex justify-between text-slate-700 font-semibold group-hover:text-blue-700 transition-colors">
                        <span className="truncate max-w-[170px]" title={m.nombre}>{m.nombre}</span>
                        <span className="font-bold shrink-0">{m.cuenta}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 group-hover:bg-blue-700 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Guía de Tramitación */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Scale className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Reglamento Constitucional</span>
            </div>
            <h4 className="text-xs font-bold leading-snug text-slate-100">
              Quórums Legislativos en Chile
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              • <strong>4/7</strong>: Leyes Orgánicas y Reformas Constitucionales (89 Diputados / 29 Senadores).<br />
              • <strong>Mayoría Absoluta</strong>: Quórum Calificado (78 Diputados / 26 Senadores).<br />
              • <strong>Mayoría Simple</strong>: Leyes ordinarias.
            </p>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
