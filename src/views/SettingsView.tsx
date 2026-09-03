/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sliders, 
  Building2, 
  Bell, 
  FileText, 
  Check, 
  Plus, 
  X, 
  PlayCircle, 
  BookmarkCheck, 
  Volume2, 
  Cpu, 
  Activity, 
  HelpCircle,
  Clock,
  ExternalLink,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  ShieldCheck
} from "lucide-react";
import { Comision, Proyecto, HealthStatus } from "../types";

interface SettingsViewProps {
  followedComs: string[];
  toggleFollowCom: (comName: string) => void;
  followedProys: string[];
  toggleFollowProy: (proyId: string) => void;
  onAlertTriggered?: () => void;
  setView: (v: string) => void;
  setSelectedProyectoId: (id: string) => void;
  setSelectedComisionId: (id: string) => void;
}

export default function SettingsView({
  followedComs,
  toggleFollowCom,
  followedProys,
  toggleFollowProy,
  onAlertTriggered,
  setView,
  setSelectedProyectoId,
  setSelectedComisionId
}: SettingsViewProps) {
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"comisiones" | "proyectos" | "simulador" | "health">("comisiones");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  
  // New sub-tabs and search features for Commissions
  const [comisionSubTab, setComisionSubTab] = useState<"diputados" | "senado">("diputados");
  const [comisionSearch, setComisionSearch] = useState<string>("");
  
  // Simulation logs
  const [simLog, setSimLog] = useState<{ id: string; msg: string; type: "success" | "info" | "warning"; time: string }[]>([]);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  const fetchHealth = () => {
    setHealthLoading(true);
    fetch("/api/health")
      .then(r => r.json())
      .then((data: HealthStatus) => {
        setHealth(data);
        setHealthLoading(false);
      })
      .catch(err => {
        console.error("Error fetching health:", err);
        setHealthLoading(false);
      });
  };

  // Load all commissions, projects and health status
  useEffect(() => {
    setLoading(true);
    fetchHealth();
    Promise.all([
      fetch("/api/comisiones").then(res => res.json()),
      fetch("/api/proyectos").then(res => res.json())
    ])
      .then(([allComms, allProys]) => {
        setComisiones(allComms);
        setProyectos(allProys.resultados || allProys || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading settings lists:", err);
        setLoading(false);
      });
  }, []);

  const addSimLog = (msg: string, type: "success" | "info" | "warning" = "info") => {
    const time = new Date().toLocaleTimeString();
    setSimLog(prev => [{ id: "log_" + Date.now() + Math.random(), msg, type, time }, ...prev.slice(0, 15)]);
  };

  // Simulate a commission session citation
  const triggerComisionCitation = () => {
    if (followedComs.length === 0) {
      addSimLog("No sigues ninguna comisión. Sigue al menos una comisión para simular sus citaciones.", "warning");
      return;
    }
    
    setIsSimulating("citation");
    // Pick random followed commission
    const randomComName = followedComs[Math.floor(Math.random() * followedComs.length)];
    // Find its ID or just use its name
    const matches = comisiones.find(c => c.nombre === randomComName);
    const comIdValue = matches ? matches.id : "cd-trabajo-y-prevision";

    addSimLog(`Estableciendo canal de transmisión... Generando citación para la comisión: "${randomComName}"`, "info");

    setTimeout(() => {
      const isUrgent = Math.random() > 0.4;
      const hour = "10:30 hrs";
      const room = "Sala de Sesiones B";
      const title = `Citación Legislativa Directa: ${randomComName}`;
      const subtitulo = isUrgent 
        ? `Sesión Especial de Urgencia en ${room} para tratar indicaciones parlamentarias prioritarias sobre conciliación de plazos a las ${hour}.`
        : `Sesión ordinaria convocada en ${room} a las ${hour} para recibir a expositores de la sociedad civil y sindicatos asociados.`;

      fetch("/api/alertas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: title,
          subtitulo: subtitulo,
          boletinId: "16.621-13", // Fallback boletin
          tipo: "citacion"
        })
      })
        .then(res => {
          if (res.ok) {
            addSimLog(`¡Citación enviada con éxito! Alerta generada para subscriptores de "${randomComName}"`, "success");
            if (onAlertTriggered) onAlertTriggered();
          } else {
            addSimLog("Fallo al enviar la alerta de citación al servidor.", "warning");
          }
          setIsSimulating(null);
        })
        .catch(err => {
          addSimLog("Error de red al intentar despachar la alerta.", "warning");
          setIsSimulating(null);
        });
    }, 1200);
  };

  // Simulate a project being analyzed in some commission
  const triggerProyectoHearing = () => {
    if (followedProys.length === 0) {
      addSimLog("No sigues ningún proyecto de ley. Sigue al menos un proyecto para simular su debate.", "warning");
      return;
    }

    setIsSimulating("hearing");
    // Pick random followed project
    const randomProyId = followedProys[Math.floor(Math.random() * followedProys.length)];
    const matchingProy = proyectos.find(p => p.id === randomProyId) || {
      id: randomProyId,
      titulo: `Proyecto de Ley Boletín ${randomProyId}`,
      comisionActual: "Trabajo y Previsión Social"
    };

    addSimLog(`Extrayendo expediente del boletín ${randomProyId}... Simulando posicionamiento en debate en comisiones.`, "info");

    setTimeout(() => {
      const commToDebate = matchingProy.comisionActual || "Trabajo y Previsión Social";
      const cleanComm = /^comisi[oó]n/i.test(commToDebate) ? commToDebate : `Comisión de ${commToDebate}`;
      const title = `Proyecto de Ley en Tabla: Boletín ${randomProyId}`;
      const truncatedTitle = matchingProy.titulo.length > 80 ? matchingProy.titulo.slice(0, 80) + "..." : matchingProy.titulo;
      const subtitulo = `El proyecto "${truncatedTitle}" se encuentra en el primer punto de la tabla de debate hoy en la ${cleanComm} para proceder con la discusión en particular de sus artículos constitutivos.`;

      fetch("/api/alertas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: title,
          subtitulo: subtitulo,
          boletinId: randomProyId,
          tipo: "indicador"
        })
      })
        .then(res => {
          if (res.ok) {
            addSimLog(`¡Simulación exitosa! Alerta generada: El Boletín ${randomProyId} ha sido analizado en la ${cleanComm}.`, "success");
            if (onAlertTriggered) onAlertTriggered();
          } else {
            addSimLog("Fallo al registrar la alerta de comisión en el servidor.", "warning");
          }
          setIsSimulating(null);
        })
        .catch(err => {
          addSimLog("Error de red al intentar registrar la audiencia del proyecto.", "warning");
          setIsSimulating(null);
        });
    }, 1200);
  };

  const totalDiputadosCount = comisiones.filter(c => !c.id.startsWith("senado-")).length;
  const totalSenadoCount = comisiones.filter(c => c.id.startsWith("senado-")).length;

  const filteredDiputados = comisiones.filter(c => 
    !c.id.startsWith("senado-") && 
    (c.nombre.toLowerCase().includes(comisionSearch.toLowerCase()) || 
     c.descripcion.toLowerCase().includes(comisionSearch.toLowerCase()))
  );

  const filteredSenado = comisiones.filter(c => 
    c.id.startsWith("senado-") && 
    (c.nombre.toLowerCase().includes(comisionSearch.toLowerCase()) || 
     c.descripcion.toLowerCase().includes(comisionSearch.toLowerCase()))
  );

  // Sort comisiones based on isFollowed so followed comisiones show first by default
  const sortedDiputados = [...filteredDiputados].sort((a, b) => {
    const aFollowed = followedComs.includes(a.nombre);
    const bFollowed = followedComs.includes(b.nombre);
    if (aFollowed && !bFollowed) return -1;
    if (!aFollowed && bFollowed) return 1;
    return 0;
  });

  const sortedSenado = [...filteredSenado].sort((a, b) => {
    const aFollowed = followedComs.includes(a.nombre);
    const bFollowed = followedComs.includes(b.nombre);
    if (aFollowed && !bFollowed) return -1;
    if (!aFollowed && bFollowed) return 1;
    return 0;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-6"
    >
      {/* Settings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            <span>Configuración de Seguimiento</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1 max-w-2xl leading-relaxed">
            Personalice y gestione las comisiones legislativas y los de proyectos de ley que de forma activa sigue para la recepción y simulación de alertas instantáneas de transparencia.
          </p>
        </div>
        
        {/* Navigation back and stats */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => setView("alertas")}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4 text-blue-500" />
            <span>Ver Alertas</span>
          </button>
          <button 
            onClick={() => setView("dashboard")}
            className="px-4 py-2 bg-[#003366] text-white hover:bg-opacity-90 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Volver al Panel
          </button>
        </div>
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Comisiones Seguidas</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{followedComs.length} <span className="text-xs font-medium text-slate-500">activas</span></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Boletines Seguidos</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{followedProys.length} <span className="text-xs font-medium text-slate-500">vigilando</span></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Estado Monitor</div>
            <div className="text-xs font-bold text-emerald-600 mt-1 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              En ejecución y alerta listos
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Selection */}
      <div className="flex border-b border-slate-200 gap-1 mt-2">
        <button
          onClick={() => setActiveTab("comisiones")}
          className={`px-4.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "comisiones" 
              ? "border-blue-600 text-blue-600 font-extrabold bg-blue-50/10" 
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Comisiones a Seguir</span>
        </button>

        <button
          onClick={() => setActiveTab("proyectos")}
          className={`px-4.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "proyectos" 
              ? "border-blue-600 text-blue-600 font-extrabold bg-blue-50/10" 
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Proyectos bajo Seguimiento</span>
        </button>

        <button
          onClick={() => setActiveTab("simulador")}
          className={`px-4.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "simulador" 
              ? "border-blue-600 text-blue-600 font-extrabold bg-blue-50/10" 
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span className="flex items-center gap-1">
            Simulador de Alertas
            <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">PRO</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab("health")}
          className={`px-4.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "health" 
              ? "border-blue-600 text-blue-600 font-extrabold bg-blue-50/10" 
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
          id="tab-btn-settings-health"
        >
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>Estado & Salud del Sistema</span>
        </button>
      </div>

      {/* Main Tab Render Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="bg-white py-16 text-center text-slate-400 font-bold text-xs border rounded-2xl shadow-xs">
            Cargando la base de datos legislativa...
          </div>
        ) : (
          <>
            {/* TABS 1: COMISIONES CONFIGURATION */}
            {activeTab === "comisiones" && (
              <div className="flex flex-col gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-extrabold text-slate-900">Configuración de Comisiones Activas</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                    Seleccione qué comisiones técnicas legislativas desea vigilar. Una vez seguidas, se activará el despachador de alertas para avisarle en tiempo real ante citaciones de sesión, tablas del orden del día y expositores agendados.
                  </p>
                </div>

                 {/* Sub-tabs and Search row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
                  {/* Left part: Sub-tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
                    <button
                      onClick={() => setComisionSubTab("diputados")}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        comisionSubTab === "diputados"
                          ? "bg-white text-blue-700 shadow-xs font-black text-slate-900"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Cámara de Diputadas y Diputados ({totalDiputadosCount || 23})</span>
                    </button>
                    <button
                      onClick={() => setComisionSubTab("senado")}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        comisionSubTab === "senado"
                          ? "bg-white text-blue-750 shadow-xs font-black text-slate-900"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Senado ({totalSenadoCount || 10})</span>
                    </button>
                  </div>

                  {/* Right part: Search bar */}
                  <div className="relative flex-1 max-w-md w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-450">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar comisiones por nombre o descripción..."
                      value={comisionSearch}
                      onChange={(e) => setComisionSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-hidden transition-all placeholder:text-slate-400 font-sans"
                    />
                    {comisionSearch && (
                      <button
                        onClick={() => setComisionSearch("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-650 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Sub-tab Content: Cámara de Diputados */}
                {comisionSubTab === "diputados" && (
                  <div>
                    {filteredDiputados.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 p-8 text-center rounded-2xl text-slate-500 text-xs font-bold font-sans">
                        No se encontraron comisiones de la Cámara de Diputados que coincidan con su búsqueda.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {sortedDiputados.map((comm) => {
                          const isFollowed = followedComs.includes(comm.nombre);
                          return (
                            <div 
                              key={comm.id}
                              className={`p-4 bg-white border rounded-2xl transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs h-40 ${
                                isFollowed 
                                  ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/5" 
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <span 
                                    onClick={() => {
                                      setSelectedComisionId(comm.id);
                                      setView("comision-detail");
                                    }}
                                    className="text-xs font-bold text-[#003366] hover:underline cursor-pointer leading-tight line-clamp-2 text-left"
                                  >
                                    {comm.nombre}
                                  </span>
                                  <span className="text-[8px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded font-mono font-bold uppercase shrink-0">
                                    CÁMARA
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-550 leading-relaxed font-semibold mt-1.5 line-clamp-2 text-left">
                                  {comm.descripcion}
                                </p>
                              </div>

                              <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-auto">
                                <span className="text-[9px] font-semibold text-slate-400 font-mono">
                                  {comm.sesionesRealizadas || 0} sesiones
                                </span>
                                <button
                                  onClick={() => toggleFollowCom(comm.nombre)}
                                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    isFollowed
                                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                                      : "bg-slate-100/80 hover:bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {isFollowed ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                      <span>Siguiendo</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Seguir</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Active Sub-tab Content: Senado de la República */}
                {comisionSubTab === "senado" && (
                  <div>
                    {filteredSenado.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 p-8 text-center rounded-2xl text-slate-500 text-xs font-bold font-sans">
                        No se encontraron comisiones del Senado que coincidan con su búsqueda.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {sortedSenado.map((comm) => {
                          const isFollowed = followedComs.includes(comm.nombre);
                          return (
                            <div 
                              key={comm.id}
                              className={`p-4 bg-white border rounded-2xl transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs h-40 ${
                                isFollowed 
                                  ? "border-blue-500 ring-1 ring-blue-450 bg-blue-50/5" 
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <span 
                                    onClick={() => {
                                      setSelectedComisionId(comm.id);
                                      setView("comision-detail");
                                    }}
                                    className="text-xs font-bold text-blue-900 hover:underline cursor-pointer leading-tight line-clamp-2 text-left"
                                  >
                                    {comm.nombre}
                                  </span>
                                  <span className="text-[8px] px-1.5 py-0.2 bg-blue-50 text-blue-650 rounded font-mono font-bold uppercase shrink-0">
                                    SENADO
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-550 leading-relaxed font-semibold mt-1.5 line-clamp-2 text-left">
                                  {comm.descripcion}
                                </p>
                              </div>

                              <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-auto">
                                <span className="text-[9px] font-semibold text-slate-400 font-mono">
                                  {comm.sesionesRealizadas || 0} sesiones
                                </span>
                                <button
                                  onClick={() => toggleFollowCom(comm.nombre)}
                                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    isFollowed
                                      ? "bg-blue-750 text-white hover:bg-blue-800 shadow-xs"
                                      : "bg-slate-100/80 hover:bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {isFollowed ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                      <span>Siguiendo</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Seguir</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TABS 2: PROYECTOS CONFIGURATION */}
            {activeTab === "proyectos" && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-extrabold text-slate-900">Monitoreo Indidual de Proyectos de Ley</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                    Los boletines de ley que seleccione para seguir se integrarán en su motor de vigilancia prioritaria. Recibirá notificaciones críticas cuando ingresen a votación en particular, se realicen enmiendas o sean puestos en tabla del día dentro de sus respectivas comisiones.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {proyectos.map((proy) => {
                    const isFollowed = followedProys.includes(proy.id);
                    return (
                      <div 
                        key={proy.id}
                        className={`p-5 bg-white border rounded-2xl transition-all duration-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isFollowed 
                            ? "border-blue-500 bg-blue-50/10 ring-1 ring-blue-500" 
                            : "border-slate-200 hover:border-slate-350"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-[10px] font-black text-blue-700 px-2.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full font-mono">
                              Boletín {proy.id}
                            </span>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                              {proy.iniciativa}
                            </span>
                            <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded uppercase">
                              Urgencia: {proy.urgencia}
                            </span>
                          </div>
                          
                          <span 
                            onClick={() => {
                              setSelectedProyectoId(proy.id);
                              setView("proyecto-detail");
                            }}
                            className="text-xs font-extrabold text-slate-900 hover:underline hover:text-blue-700 cursor-pointer block mt-2 font-sans text-left leading-normal"
                          >
                            {proy.titulo}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-400 mt-2.5">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              Comisión Actual: <strong className="text-slate-650">{proy.comisionActual}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              Ingreso: {proy.fechaIngreso}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-start md:self-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 w-full md:w-auto">
                          <button
                            onClick={() => {
                              setSelectedProyectoId(proy.id);
                              setView("proyecto-detail");
                            }}
                            className="flex-1 md:flex-initial px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-[11px] font-bold text-slate-700 font-sans transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Ver Expediente</span>
                            <ExternalLink className="w-3 h-3 text-slate-450" />
                          </button>

                          <button
                            onClick={() => toggleFollowProy(proy.id)}
                            className={`flex-1 md:flex-initial px-4.5 py-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                              isFollowed
                                ? "bg-amber-600 hover:bg-amber-700 text-white border border-amber-600"
                                : "bg-slate-900 hover:bg-slate-800 text-white"
                            }`}
                          >
                            {isFollowed ? (
                              <>
                                <BookmarkCheck className="w-4 h-4 text-amber-100" />
                                <span>Siguiendo</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Seguir</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TABS 3: LEGISLATIVE SIMULATOR FEED */}
            {activeTab === "simulador" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                
                {/* Left controls side - 7 cols */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <span>Panel de Inyección de Alertas Simulado</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
                      Este centro de simulación le permite simular el transcurso de las horas y de los debates legislativos. Verifique de forma dinámica cómo reacciona el motor frente a las suscripciones seleccionadas.
                    </p>
                  </div>

                  {/* Trigger Boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trigger 1: Comm Citations */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mt-3.5">
                          Citaciones de Comisión
                        </h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed font-semibold mt-1.5 h-16">
                          Genera un evento de citación para sesionar en cualquiera de las comisiones que estás siguiendo. Si estás suscrito a esa comisión, se emitirá una alerta instantánea de reunión.
                        </p>
                        
                        <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg text-[9px] text-slate-500 font-bold font-mono mt-1 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
                          SEGUIDAS: {followedComs.length > 0 ? followedComs.join(", ") : "Ninguna (siga alguna de la sección)"}
                        </div>
                      </div>

                      <button
                        onClick={triggerComisionCitation}
                        disabled={isSimulating !== null}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSimulating === "citation"
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isSimulating === "citation" ? "Despachando..." : "Simular Citación"}</span>
                      </button>
                    </div>

                    {/* Trigger 2: Project Hearings */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mt-3.5">
                          Proyectos Vistos en Tabla
                        </h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed font-semibold mt-1.5 h-16">
                          Simula que uno de tus boletines legislativos seguidos ingresa a tabla en las comisiones de trabajo para revisión o redacción de comparado.
                        </p>

                        <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg text-[9px] text-slate-500 font-bold font-mono mt-1 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
                          SEGUIDOS: {followedProys.length > 0 ? followedProys.join(", ") : "Ninguno (Siga en sección proyectos)"}
                        </div>
                      </div>

                      <button
                        onClick={triggerProyectoHearing}
                        disabled={isSimulating !== null}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSimulating === "hearing"
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-md"
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isSimulating === "hearing" ? "Estudiando..." : "Simular Debate de Proyecto"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Clarification help panel */}
                  <div className="bg-blue-50/70 border border-blue-150 p-5 rounded-2xl text-xs text-blue-900 font-sans leading-relaxed flex gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-blue-950">¿Cómo opera el despacho?</h4>
                      <p className="text-blue-800 font-medium text-[11px] mt-0.5">
                        Al gatillar los inyectores de este simulador, el sistema registra una alerta real en la base de datos a través de la API. Estas alertas correspondientes a citaciones e indicadores aparecerán instantáneamente en su panel de alarmas (ícono de campana en cabecera) y se incrementará el acumulador global de alertas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right console side (Logs) - 5 cols */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="bg-slate-900 border border-slate-950 text-slate-100 p-5 rounded-2xl shadow-md min-h-[440px] flex flex-col justify-between font-mono">
                    
                    <div>
                      {/* Terminal header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] font-bold text-slate-400 ml-1.5">INTEGRITY_BUS_SIMULATOR</span>
                        </div>
                        <span className="text-[9px] font-semibold text-slate-500 uppercase">Interactive Shell</span>
                      </div>

                      {/* Title description */}
                      <p className="text-[10px] text-slate-400 mb-4 bg-slate-850 p-2.5 rounded border border-slate-800 leading-normal">
                        $ monitoring -e "legislative_follow_rules" --verbose
                        <br />
                        <span className="text-emerald-400 text-[9px] font-sans">Alineación del despachador de vigas iniciada. Listo para recibir eventos de inyección.</span>
                      </p>

                      {/* Log feed */}
                      <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1" id="simulator-logs-feed">
                        {simLog.length === 0 ? (
                          <div className="text-[10px] text-slate-600 italic py-8 text-center">
                            Ningún evento de inyección encolado en los buffers. Presione alguno de los inyectores simulados para desplegar telemetría aquí.
                          </div>
                        ) : (
                          simLog.map((log) => (
                            <div key={log.id} className="text-[10.5px] border-l border-slate-800 pl-2 leading-relaxed">
                              <span className="text-slate-500 text-[9.5px] mr-1.5 font-bold">[{log.time}]</span>
                              <span className={`font-semibold ${
                                log.type === "success" ? "text-emerald-400" :
                                log.type === "warning" ? "text-amber-500 font-extrabold" : "text-blue-350"
                              }`}>
                                {log.msg}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Terminal footer option */}
                    <div className="border-t border-slate-800 pt-3.5 mt-4 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Procesos activos: 0</span>
                      <button 
                        onClick={() => {
                          setSimLog([]);
                          addSimLog("Consola de simulación purgada e inicializada.", "info");
                        }} 
                        className="hover:text-white underline cursor-pointer"
                      >
                        Limpiar consola
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* TABS 4: HEALTH & CONNECTIVITY MONITOR */}
            {activeTab === "health" && (
              <div className="flex flex-col gap-6 animate-fade-in" id="tabpanel-health-monitor">
                
                {/* Header & Refresh */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Monitor de Salud del Sistema y Conexiones Oficiales
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verificación en tiempo real de conectividad con servidores del Congreso Nacional, proveedores de IA y caché inteligente.
                    </p>
                  </div>

                  <button
                    onClick={fetchHealth}
                    disabled={healthLoading}
                    className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition-all shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? "animate-spin" : ""}`} />
                    <span>{healthLoading ? "Verificando..." : "Actualizar Diagnóstico"}</span>
                  </button>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* 1. Official Congress APIs */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        APIs del Congreso Nacional
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="font-bold text-slate-800 block">Senado de Chile</span>
                          <span className="text-2xs text-slate-400 font-mono">tramitacion.senado.cl/wspublico</span>
                        </div>
                        <span className={`text-2xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          health?.apis.senadoWSPublico === "operativo" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {health?.apis.senadoWSPublico || "Verificando..."}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="font-bold text-slate-800 block">Cámara de Diputadas/os</span>
                          <span className="text-2xs text-slate-400 font-mono">opendata.camara.cl (WSDL)</span>
                        </div>
                        <span className={`text-2xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          health?.apis.camaraOpenData === "operativo" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {health?.apis.camaraOpenData || "Verificando..."}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="font-bold text-slate-800 block">Biblioteca del Congreso (BCN)</span>
                          <span className="text-2xs text-slate-400 font-mono">leychile.cl / obtxml</span>
                        </div>
                        <span className="text-2xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                          {health?.apis.bcnLeyChile || "Operativo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. AI Providers Status */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Motores de IA Conectados
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="font-bold text-slate-800 block">Google Gemini</span>
                          <span className="text-2xs text-slate-400">Gemini 2.0 Flash (Free AI Studio)</span>
                        </div>
                        <span className={`text-2xs px-2.5 py-0.5 rounded-full font-bold ${
                          health?.aiProviders.gemini ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {health?.aiProviders.gemini ? "Configurado" : "Sin API Key"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="font-bold text-slate-800 block">Groq Cloud</span>
                          <span className="text-2xs text-slate-400">Llama 3.3 70B Versatile</span>
                        </div>
                        <span className={`text-2xs px-2.5 py-0.5 rounded-full font-bold ${
                          health?.aiProviders.groq ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {health?.aiProviders.groq ? "Configurado" : "Sin API Key"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="font-bold text-slate-800 block">Anthropic Claude</span>
                          <span className="text-2xs text-slate-400">Claude 3.5 Haiku / Sonnet</span>
                        </div>
                        <span className={`text-2xs px-2.5 py-0.5 rounded-full font-bold ${
                          health?.aiProviders.claude ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {health?.aiProviders.claude ? "Activo" : "Offline Fallback"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Cache & Performance Metrics */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Server className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Caché Inteligente & Uptime
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>Aciertos de Caché (Hit Rate):</span>
                          <span className="text-indigo-600">{Number(health?.cache.hitRate || 0) * 100}%</span>
                        </div>
                        <div className="flex justify-between text-2xs text-slate-500">
                          <span>Lecturas en memoria: {health?.cache.hits || 0}</span>
                          <span>Consultas remotas: {health?.cache.misses || 0}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>Objetos en Memoria:</span>
                          <span className="text-slate-900">{health?.cache.size || 0} recursos</span>
                        </div>
                        <div className="flex justify-between text-2xs text-slate-500">
                          <span>Tiempo de actividad: {Math.floor((health?.uptimeSeconds || 0) / 60)} min</span>
                          <span className="text-emerald-600 font-bold">● ONLINE</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}
          </>
        )}
      </div>

    </motion.div>
  );
}
