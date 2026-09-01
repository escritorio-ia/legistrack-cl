/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardView from "./views/DashboardView";
import ProyectosView from "./views/ProyectosView";
import ProyectoDetailView from "./views/ProyectoDetailView";
import ComisionDetailView from "./views/ComisionDetailView";
import SalaLiveView from "./views/SalaLiveView";
import AlertasView from "./views/AlertasView";
import LegislacionComparadaView from "./views/LegislacionComparadaView";
import SearchResultsView from "./views/SearchResultsView";
import SettingsView from "./views/SettingsView";
import EscritorioHubView from "./views/EscritorioHubView";
import StaticDataAnalyticsView from "./views/StaticDataAnalyticsView";
import ComisionesGraficas from "./components/ComisionesGraficas";
import CitacionesCamaraWidget from "./components/CitacionesCamaraWidget";
import CopilotoLegislativo from "./components/CopilotoLegislativo";
import { 
  Users, 
  Shield, 
  Award, 
  Landmark, 
  Eye, 
  Search,
  Scale,
  Heart,
  BookOpen,
  Globe,
  HardHat,
  Leaf,
  Zap,
  TrendingUp,
  Home,
  Cpu,
  Sparkles,
  Smile,
  Droplet,
  Flame,
  Scroll,
  ShieldAlert,
  Star,
  X,
  ChevronRight,
  UserCheck,
  FileText,
  CheckCircle2,
  Tag,
  Calendar
} from "lucide-react";
import { 
  DIPUTADOS_COMISIONES_DETALLE as DIPUTADOS_COMISIONES, 
  SENADO_COMISIONES_DETALLE as SENADO_COMISIONES,
  searchComisionesAutocomplete,
  ComisionMeta,
  AutocompleteResult
} from "./data/comisionesData";

function getCommissionIcon(iconName?: string) {
  switch (iconName) {
    case "Scale": return <Scale className="w-4 h-4 text-blue-600 shrink-0" />;
    case "Heart": return <Heart className="w-4 h-4 text-rose-500 shrink-0" />;
    case "BookOpen": return <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />;
    case "Shield": return <Shield className="w-4 h-4 text-indigo-500 shrink-0" />;
    case "Globe": return <Globe className="w-4 h-4 text-teal-500 shrink-0" />;
    case "Landmark": return <Landmark className="w-4 h-4 text-slate-500 shrink-0" />;
    case "HardHat": return <HardHat className="w-4 h-4 text-yellow-650 shrink-0" />;
    case "Leaf": return <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />;
    case "Zap": return <Zap className="w-4 h-4 text-orange-400 shrink-0" fill="currentColor" />;
    case "TrendingUp": return <TrendingUp className="w-4 h-4 text-cyan-500 shrink-0" />;
    case "Home": return <Home className="w-4 h-4 text-violet-500 shrink-0" />;
    case "Users": return <Users className="w-4 h-4 text-blue-500 shrink-0" />;
    case "Cpu": return <Cpu className="w-4 h-4 text-purple-500 shrink-0" />;
    case "Sparkles": return <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor" />;
    case "Smile": return <Smile className="w-4 h-4 text-pink-500 shrink-0" />;
    case "Droplet": return <Droplet className="w-4 h-4 text-sky-500 shrink-0" fill="currentColor" />;
    case "Flame": return <Flame className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" />;
    case "Scroll": return <Scroll className="w-4 h-4 text-amber-600 shrink-0" />;
    case "ShieldAlert": return <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />;
    default: return <Landmark className="w-4 h-4 text-slate-405 shrink-0" />;
  }
}

export default function App() {
  const [view, setView] = useState<string>("escritorio");
  const [selectedProyectoId, setSelectedProyectoId] = useState<string>("16.621-13");
  const [selectedComisionId, setSelectedComisionId] = useState<string>("cd-trabajo-y-prevision");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);
  const [commSearchTerm, setCommSearchTerm] = useState<string>("");
  const [commSearchFocused, setCommSearchFocused] = useState<boolean>(false);
  const [commActiveTab, setCommActiveTab] = useState<"directorio" | "citaciones" | "seguidas" | "graficas">("directorio");
  const [commChamberFilter, setCommChamberFilter] = useState<"todas" | "CD" | "SR">("todas");
  const commSearchContainerRef = useRef<HTMLDivElement>(null);

  // Deep Linking & Hash Routing Synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, "");
      if (!rawHash || rawHash === "escritorio") {
        setView("escritorio");
      } else if (rawHash === "dashboard" || rawHash === "legislacion") {
        setView("dashboard");
      } else if (rawHash === "statistics" || rawHash === "static" || rawHash === "estadisticas") {
        setView("static");
      } else if (rawHash.startsWith("proyecto/")) {
        const id = rawHash.replace("proyecto/", "");
        if (id) {
          setSelectedProyectoId(id);
          setView("proyecto-detail");
        }
      } else if (rawHash.startsWith("comision/")) {
        const id = rawHash.replace("comision/", "");
        if (id) {
          setSelectedComisionId(id);
          setView("comision-detail");
        }
      } else if (rawHash === "proyectos") {
        setView("proyectos");
      } else if (rawHash.startsWith("comisiones")) {
        setView("comisiones");
        const queryParams = new URLSearchParams(rawHash.split("?")[1] || "");
        const tab = queryParams.get("tab");
        if (tab && ["directorio", "citaciones", "seguidas", "graficas"].includes(tab)) {
          setCommActiveTab(tab as any);
        }
      } else if (rawHash === "sala") {
        setView("sala");
      } else if (rawHash === "alertas") {
        setView("alertas");
      } else if (rawHash === "derecho-comparado" || rawHash === "comparado" || rawHash === "legislacion-comparada" || rawHash === "comparative") {
        setView("legislacion-comparada");
      } else if (rawHash === "configuracion" || rawHash === "settings") {
        setView("configuracion");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateView = (newView: string) => {
    setView(newView);
    if (newView === "escritorio") window.location.hash = "#/escritorio";
    else if (newView === "dashboard") window.location.hash = "#/legislacion";
    else if (newView === "static") window.location.hash = "#/statistics";
    else if (newView === "proyectos") window.location.hash = "#/proyectos";
    else if (newView === "proyecto-detail") window.location.hash = `#/proyecto/${selectedProyectoId}`;
    else if (newView === "comisiones") window.location.hash = `#/comisiones?tab=${commActiveTab}`;
    else if (newView === "comision-detail") window.location.hash = `#/comision/${selectedComisionId}`;
    else if (newView === "sala") window.location.hash = "#/sala";
    else if (newView === "alertas") window.location.hash = "#/alertas";
    else if (newView === "legislacion-comparada") window.location.hash = "#/derecho-comparado";
    else if (newView === "configuracion") window.location.hash = "#/configuracion";
  };

  // Real per-commission stats fetched from the backend (which in turn derives them
  // from live official sources). Keyed by commission name. No invented numbers here.
  const [comisionesStats, setComisionesStats] = useState<Record<string, { proyectosContados: number }>>({});

  const [followedComs, setFollowedComs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("followedComs");
      return saved ? JSON.parse(saved) : ["Comisión de Trabajo y Previsión Social", "Comisión de Hacienda"];
    } catch {
      return ["Comisión de Trabajo y Previsión Social", "Comisión de Hacienda"];
    }
  });

  const [followedProys, setFollowedProys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("followedProys");
      return saved ? JSON.parse(saved) : ["16.621-13"];
    } catch {
      return ["16.621-13"];
    }
  });

  const toggleFollowCom = (comName: string) => {
    setFollowedComs(prev => {
      const next = prev.includes(comName) 
        ? prev.filter(n => n !== comName) 
        : [...prev, comName];
      localStorage.setItem("followedComs", JSON.stringify(next));
      return next;
    });
  };

  const toggleFollowProy = (proyId: string) => {
    setFollowedProys(prev => {
      const next = prev.includes(proyId) 
        ? prev.filter(id => id !== proyId) 
        : [...prev, proyId];
      localStorage.setItem("followedProys", JSON.stringify(next));
      return next;
    });
  };

  const refreshAlertsCount = () => {
    fetch("/api/alertas")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActiveAlertsCount(data.length);
        }
      })
      .catch(err => console.error("Error loading alerts count", err));
  };

  useEffect(() => {
    refreshAlertsCount();

    fetch("/api/comisiones")
      .then(res => res.json())
      .then((data: { nombre: string; proyectosContados: number }[]) => {
        if (!Array.isArray(data)) return;
        const byNombre: Record<string, { proyectosContados: number }> = {};
        for (const c of data) {
          byNombre[c.nombre] = { proyectosContados: c.proyectosContados };
        }
        setComisionesStats(byNombre);
      })
      .catch(err => console.error("Error loading real commission stats", err));
  }, []);

  const handleSearchSubmit = () => {
    setView("search-results");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased" id="app-root">
      {/* Global Header */}
      <Header 
        currentView={view}
        setView={setView}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        onSearchSubmit={handleSearchSubmit}
        activeAlertsCount={activeAlertsCount}
        setSelectedProyectoId={setSelectedProyectoId}
        setSelectedComisionId={setSelectedComisionId}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {view === "escritorio" && (
          <EscritorioHubView 
            setView={setView}
            setSelectedProyectoId={(id) => {
              setSelectedProyectoId(id);
              setView("proyecto-detail");
            }}
            setSelectedComisionId={(id) => {
              setSelectedComisionId(id);
              setView("comision-detail");
            }}
            followedProys={followedProys}
          />
        )}

        {view === "static" && (
          <StaticDataAnalyticsView 
            setView={setView}
            setSelectedProyectoId={(id) => {
              setSelectedProyectoId(id);
              setView("proyecto-detail");
            }}
          />
        )}

        {view === "dashboard" && (
          <DashboardView 
            setView={setView}
            setSelectedProyectoId={(id) => {
              setSelectedProyectoId(id);
              setView("proyecto-detail");
            }}
            setSelectedComisionId={(id) => {
              setSelectedComisionId(id);
              setView("comision-detail");
            }}
            followedComs={followedComs}
            toggleFollowCom={toggleFollowCom}
            followedProys={followedProys}
            toggleFollowProy={toggleFollowProy}
            diputadosComisiones={DIPUTADOS_COMISIONES}
            senadoComisiones={SENADO_COMISIONES}
          />
        )}

        {view === "proyectos" && (
          <ProyectosView 
            setView={setView}
            setSelectedProyectoId={(id) => {
              setSelectedProyectoId(id);
              setView("proyecto-detail");
            }}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
          />
        )}

        {view === "proyecto-detail" && (
          <ProyectoDetailView 
            proyectoId={selectedProyectoId}
            setView={setView}
            setSelectedComisionId={(id) => {
              setSelectedComisionId(id);
              setView("comision-detail");
            }}
            followedProys={followedProys}
            toggleFollowProy={toggleFollowProy}
          />
        )}

        {view === "comisiones" && (() => {
          const normalizedSearch = commSearchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

          const matchesCommission = (c: ComisionMeta) => {
            if (!normalizedSearch) return true;
            const normNombre = (c.nombre || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normDesc = (c.descripcion || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normId = (c.id || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normTemas = (c.temas || []).map(t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()).join(" ");
            const normIntegrantes = (c.integrantes || []).map(i => `${i.nombre} ${i.partido} ${i.rol}`).join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

            return normNombre.includes(normalizedSearch) || 
                   normDesc.includes(normalizedSearch) || 
                   normId.includes(normalizedSearch) || 
                   normTemas.includes(normalizedSearch) || 
                   normIntegrantes.includes(normalizedSearch);
          };

          const filteredDiputados = DIPUTADOS_COMISIONES.filter(matchesCommission);
          const filteredSenado = SENADO_COMISIONES.filter(matchesCommission);
          const totalCount = DIPUTADOS_COMISIONES.length + SENADO_COMISIONES.length;

          return (
            <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5" id="commissions-view-root">
              {/* Header & Sub-Navigation Tabs */}
              <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900" id="commissions-index-title">
                      Comisiones Legislativas
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Mesas técnicas de trabajo legislativo de la Cámara de Diputadas y Diputados y el Senado de la República.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 font-bold self-start sm:self-auto">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Monitoreo Bicameral ({totalCount} Comisiones)</span>
                  </div>
                </div>

                {/* Primary Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setCommActiveTab("directorio")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      commActiveTab === "directorio"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5 text-blue-600" />
                    <span>Directorio de Comisiones</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      commActiveTab === "directorio" ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {totalCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setCommActiveTab("citaciones")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      commActiveTab === "citaciones"
                        ? "bg-amber-500 text-slate-950 shadow-sm border border-amber-400 font-extrabold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Citaciones Semanales en Vivo</span>
                  </button>

                  <button
                    onClick={() => setCommActiveTab("seguidas")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      commActiveTab === "seguidas"
                        ? "bg-indigo-600 text-white shadow-sm border border-indigo-500"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-300" />
                    <span>Mis Comisiones Seguidas</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      commActiveTab === "seguidas" ? "bg-indigo-800 text-indigo-100" : "bg-slate-200 text-slate-700"
                    }`}>
                      {followedComs.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setCommActiveTab("graficas")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      commActiveTab === "graficas"
                        ? "bg-emerald-600 text-white shadow-sm border border-emerald-500"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Análisis y Carga de Trabajo</span>
                  </button>
                </div>
              </div>

              {/* ============================================================= */}
              {/* TAB 1: DIRECTORIO DE COMISIONES                               */}
              {/* ============================================================= */}
              {commActiveTab === "directorio" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  {/* Search & Chamber Filter Toolbar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Chamber Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setCommChamberFilter("todas")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          commChamberFilter === "todas"
                            ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Todas ({totalCount})
                      </button>
                      <button
                        onClick={() => setCommChamberFilter("CD")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          commChamberFilter === "CD"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-blue-700"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span>Cámara de Diputadas/os ({DIPUTADOS_COMISIONES.length})</span>
                      </button>
                      <button
                        onClick={() => setCommChamberFilter("SR")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          commChamberFilter === "SR"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span>Senado ({SENADO_COMISIONES.length})</span>
                      </button>
                    </div>

                    {/* Search Input */}
                    <div ref={commSearchContainerRef} className="relative flex-1 max-w-md w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="comm-search"
                        type="text"
                        className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 bg-white"
                        placeholder="Buscar por nombre, presidente o materia (ej. litio, salud, SAG)..."
                        value={commSearchTerm}
                        onFocus={() => setCommSearchFocused(true)}
                        onChange={(e) => {
                          setCommSearchTerm(e.target.value);
                          setCommSearchFocused(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setCommSearchFocused(false);
                        }}
                      />
                      {commSearchTerm && (
                        <button
                          onClick={() => {
                            setCommSearchTerm("");
                            setCommSearchFocused(false);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Commissions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {(() => {
                      const list = [
                        ...(commChamberFilter === "todas" || commChamberFilter === "CD" 
                          ? filteredDiputados.map(c => ({ ...c, chamber: "CD", prefix: "cd-" })) 
                          : []),
                        ...(commChamberFilter === "todas" || commChamberFilter === "SR" 
                          ? filteredSenado.map(c => ({ ...c, chamber: "SR", prefix: "senado-" })) 
                          : [])
                      ];

                      if (list.length === 0) {
                        return (
                          <div className="col-span-full py-12 text-center text-xs text-slate-400 font-semibold italic bg-white rounded-2xl border border-slate-200">
                            No se encontraron comisiones para "{commSearchTerm}". Intente con otro término.
                          </div>
                        );
                      }

                      return list.map(c => {
                        const isFollowed = followedComs.includes(c.nombre);
                        const president = c.integrantes && c.integrantes.length > 0 ? c.integrantes[0] : null;

                        return (
                          <div
                            key={`${c.prefix}${c.id}`}
                            onClick={() => {
                              setSelectedComisionId(`${c.prefix}${c.id}`);
                              setView("comision-detail");
                            }}
                            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                                    {getCommissionIcon(c.icon)}
                                  </div>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded font-mono ${
                                    c.chamber === "CD" ? "bg-blue-100 text-blue-800" : "bg-slate-900 text-white"
                                  }`}>
                                    {c.chamber === "CD" ? "CÁMARA" : "SENADO"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFollowCom(c.nombre);
                                  }}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isFollowed 
                                      ? "bg-amber-50 border-amber-300 text-amber-500" 
                                      : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500"
                                  }`}
                                  title={isFollowed ? "Siguiendo comisión" : "Seguir comisión"}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isFollowed ? "fill-amber-400" : ""}`} />
                                </button>
                              </div>

                              <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-1">
                                {c.nombre}
                              </h3>

                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-normal">
                                {c.descripcion}
                              </p>

                              {president && (
                                <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                                  <span className="truncate">
                                    <strong>Preside:</strong> {president.nombre.replace(/^(Sr\.|Sra\.|Don|Doña)\s*/i, "").split(" ").slice(0, 2).join(" ")} ({president.partido})
                                  </span>
                                  <span className="text-slate-400 font-mono shrink-0 ml-1">
                                    {c.integrantes?.length || 13} m.
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                              <span className="font-mono text-slate-500 text-[10px] font-bold">
                                {comisionesStats[c.nombre]?.proyectosContados ?? "—"} Proyectos
                              </span>
                              <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
                                <span>Ver detalle</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 2: CITACIONES SEMANALES EN VIVO                           */}
              {/* ============================================================= */}
              {commActiveTab === "citaciones" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <CitacionesCamaraWidget 
                    setView={setView}
                    setSelectedComisionId={setSelectedComisionId}
                    setSelectedProyectoId={setSelectedProyectoId}
                    followedComs={followedComs}
                    toggleFollowCom={toggleFollowCom}
                  />
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 3: MIS COMISIONES SEGUIDAS                                */}
              {/* ============================================================= */}
              {commActiveTab === "seguidas" && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span>Mis Comisiones en Seguimiento ({followedComs.length})</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Acceso directo a las comisiones parlamentarias que usted monitorea prioritariamente.
                      </p>
                    </div>
                    {followedComs.length > 0 && (
                      <button 
                        onClick={() => {
                          if (confirm("¿Está seguro de querer dejar de seguir todas las comisiones?")) {
                            setFollowedComs([]);
                            localStorage.setItem("followedComs", JSON.stringify([]));
                          }
                        }}
                        className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                      >
                        Limpiar Todo
                      </button>
                    )}
                  </div>

                  {followedComs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-medium italic">
                      Aún no sigue ninguna comisión. Para seguir una comisión, haga clic en la estrella (⭐) en el Directorio o en el detalle de la comisión.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {[
                        ...DIPUTADOS_COMISIONES.map(c => ({ ...c, chamber: "CD", prefix: "cd-" })),
                        ...SENADO_COMISIONES.map(c => ({ ...c, chamber: "SR", prefix: "senado-" }))
                      ]
                        .filter(c => followedComs.includes(c.nombre))
                        .map(c => (
                          <div 
                            key={`${c.prefix}${c.id}`}
                            onClick={() => {
                              setSelectedComisionId(`${c.prefix}${c.id}`);
                              setView("comision-detail");
                            }}
                            className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded font-mono ${
                                c.chamber === "CD" ? "bg-blue-100 text-blue-800" : "bg-slate-900 text-white"
                              }`}>
                                {c.chamber === "CD" ? "CÁMARA" : "SENADO"}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFollowCom(c.nombre);
                                }}
                                className="text-amber-500 hover:text-slate-400 p-1"
                                title="Dejar de seguir"
                              >
                                <Star className="w-4 h-4 fill-amber-400" />
                              </button>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {c.nombre}
                            </h4>

                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {c.descripcion}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                              <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
                                <span>Ir a la comisión</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 4: ANÁLISIS Y CARGA DE TRABAJO                            */}
              {/* ============================================================= */}
              {commActiveTab === "graficas" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <ComisionesGraficas 
                    diputados={DIPUTADOS_COMISIONES as any[]} 
                    senado={SENADO_COMISIONES as any[]} 
                  />
                </div>
              )}
            </div>
          );
        })()}

        {view === "comision-detail" && (
          <ComisionDetailView 
            comisionId={selectedComisionId}
            setView={setView}
            setSelectedProyectoId={(id) => {
              setSelectedProyectoId(id);
              setView("proyecto-detail");
            }}
            setSearchFilter={setSearchFilter}
            followedComs={followedComs}
            toggleFollowCom={toggleFollowCom}
          />
        )}

        {view === "sala" && (
          <SalaLiveView 
            setView={setView}
            setSelectedProyectoId={setSelectedProyectoId}
          />
        )}

        {view === "alertas" && (
          <AlertasView 
            followedProys={followedProys}
            toggleFollowProy={toggleFollowProy}
          />
        )}

        {view === "configuracion" && (
          <SettingsView 
            followedComs={followedComs}
            toggleFollowCom={toggleFollowCom}
            followedProys={followedProys}
            toggleFollowProy={toggleFollowProy}
            onAlertTriggered={refreshAlertsCount}
            setView={setView}
            setSelectedProyectoId={setSelectedProyectoId}
            setSelectedComisionId={setSelectedComisionId}
          />
        )}

        {view === "legislacion-comparada" && (
          <LegislacionComparadaView />
        )}

        {view === "search-results" && (
          <SearchResultsView 
            initialQuery={searchFilter}
            setView={setView}
            setSelectedProyectoId={setSelectedProyectoId}
            setSelectedComisionId={setSelectedComisionId}
            setSearchFilter={setSearchFilter}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Copiloto Legislativo Flotante */}
      <CopilotoLegislativo 
        contextoBoletin={view === "proyecto-detail" ? selectedProyectoId : undefined}
        contextoComision={view === "comision-detail" ? selectedComisionId : undefined}
      />
    </div>
  );
}
