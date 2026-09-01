/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Tv, 
  Users, 
  ShieldCheck, 
  Bell, 
  TrendingUp, 
  ArrowRight, 
  Play, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio,
  Clock,
  Building2,
  Lock,
  Search,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { SalaVivo } from "../types";

interface ScheduledBill {
  orden: string;
  boletin: string;
  titulo: string;
  tramite: string;
  urgencia: "Simple" | "Suma" | "Discusión Inmediata" | "Sin urgencia";
  comision: string;
  estadoDiscusion: "En debate" | "Para votación" | "Fácil Despacho" | "Pendiente";
}

const CAMARA_TABLA_PROYECTOS: ScheduledBill[] = [
  {
    orden: "1° de la Tabla",
    boletin: "16.621-13",
    titulo: "Modifica el Código del Trabajo regulando el teletrabajo para personas cuidadoras y promoviendo la conciliación de vida personal, familiar y laboral.",
    tramite: "Primer Trámite Constitucional",
    urgencia: "Suma",
    comision: "Trabajo y Previsión Social",
    estadoDiscusion: "En debate"
  },
  {
    orden: "2° de la Tabla",
    boletin: "15.431-11",
    titulo: "Ley Marco de Ciberseguridad e Infraestructura Crítica de la Información. Crea la Agencia Nacional de Ciberseguridad.",
    tramite: "Segundo Trámite Constitucional",
    urgencia: "Discusión Inmediata",
    comision: "Seguridad Ciudadana",
    estadoDiscusion: "Para votación"
  },
  {
    orden: "3° de la Tabla",
    boletin: "16.120-07",
    titulo: "Establece normas para la prevención de delitos, protección de víctimas y fortalecimiento de las municipalidades en seguridad pública.",
    tramite: "Primer Trámite Constitucional",
    urgencia: "Simple",
    comision: "Constitución y Justicia",
    estadoDiscusion: "Fácil Despacho"
  },
  {
    orden: "4° de la Tabla",
    boletin: "15.900-05",
    titulo: "Introduce modificaciones tributarias transitorias para incentivar la inversión y acelerar la regularización de activos de Pymes locales.",
    tramite: "Segundo Trámite Constitucional",
    urgencia: "Sin urgencia",
    comision: "Hacienda",
    estadoDiscusion: "Pendiente"
  }
];

const SENADO_TABLA_PROYECTOS: ScheduledBill[] = [
  {
    orden: "1° de la Tabla",
    boletin: "16.789-07",
    titulo: "Reforma Constitucional en materia de nombramiento, responsabilidad y régimen ético de ministros y jueces del Poder Judicial.",
    tramite: "Segundo Trámite Constitucional",
    urgencia: "Simple",
    comision: "Constitución, Legislación, Justicia",
    estadoDiscusion: "En debate"
  },
  {
    orden: "2° de la Tabla",
    boletin: "15.980-05",
    titulo: "Moderniza los procedimientos del impuesto al valor agregado (IVA) aplicable a las plataformas transnacionales y servicios de comercio digital.",
    tramite: "Primer Trámite Constitucional",
    urgencia: "Suma",
    comision: "Hacienda",
    estadoDiscusion: "Para votación"
  },
  {
    orden: "3° de la Tabla",
    boletin: "16.442-13",
    titulo: "Regula las jornadas de excepción laboral frente a estados decretados bajo estado de catástrofe y la protección integral del empleo.",
    tramite: "Segundo Trámite Constitucional",
    urgencia: "Discusión Inmediata",
    comision: "Trabajo y Previsión Social",
    estadoDiscusion: "Fácil Despacho"
  }
];

interface SalaLiveViewProps {
  setView?: (v: string) => void;
  setSelectedProyectoId?: (id: string) => void;
}

export default function SalaLiveView({ setView, setSelectedProyectoId }: SalaLiveViewProps) {
  const [salas, setSalas] = useState<SalaVivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSessionSimulator, setActiveSessionSimulator] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"diputados" | "senado">("diputados");

  useEffect(() => {
    fetch("/api/sala")
      .then(res => res.json())
      .then(data => {
        setSalas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading live floor sessions:", err);
        setLoading(false);
      });
  }, []);

  const activeProjects = activeTab === "diputados" ? CAMARA_TABLA_PROYECTOS : SENADO_TABLA_PROYECTOS;
  const currentSala = salas.find(s => 
    activeTab === "diputados" 
      ? s.camaraName.includes("Diputadas") 
      : s.camaraName.includes("Senado")
  );

  const getUrgencyBadge = (urgencia: ScheduledBill["urgencia"]) => {
    switch (urgencia) {
      case "Discusión Inmediata":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-blue-250 animate-pulse">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            DISC. INMEDIATA
          </span>
        );
      case "Suma":
        return (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-orange-200">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            SUMA URGENCIA
          </span>
        );
      case "Simple":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-blue-200">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            URGENCIA SIMPLE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-55 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-205">
            SIN URGENCIA
          </span>
        );
    }
  };

  const getStatusBadge = (status: ScheduledBill["estadoDiscusion"]) => {
    switch (status) {
      case "En debate":
        return (
          <span className="inline-flex items-center bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-blue-200 uppercase tracking-wider">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-1.5 animate-ping"></span>
            DEBATIÉNDOSE
          </span>
        );
      case "Para votación":
        return (
          <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-emerald-250 uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 bg-emerald-600 rounded-full mr-1.5"></span>
            A VOTACIÓN
          </span>
        );
      case "Fácil Despacho":
        return (
          <span className="inline-flex items-center bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-amber-200 uppercase tracking-wider">
            FÁCIL DESPACHO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-slate-100 text-slate-500 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wider">
            PENDIENTE
          </span>
        );
    }
  };

  const handleProjectClick = (boletin: string) => {
    if (setView && setSelectedProyectoId) {
      // clean it first to avoid mismatch
      const cleanB = boletin.trim();
      setSelectedProyectoId(cleanB);
      setView("proyecto-detail");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto w-full px-6 py-8 flex flex-col gap-6"
    >
      {/* Intro section */}
      <div className="text-center max-w-2xl mx-auto flex flex-col justify-center items-center gap-2 mb-2" id="live-floor-intro">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Tabla de Sesión de Sala
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Orden del día, pautas de debates y tabla oficial legislativa "como estado" para ambas cámaras del Congreso Nacional de Chile.
        </p>
      </div>

      {/* Interactive Tabs for Cámara and Senado */}
      <div className="flex bg-slate-200/85 p-1 rounded-xl max-w-md mx-auto w-full mb-2" id="chamber-tab-container">
        <button
          onClick={() => setActiveTab("diputados")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "diputados" 
              ? "bg-white text-slate-905 shadow-sm" 
              : "text-slate-600 hover:text-slate-900"
          }`}
          id="tab-chamber-diputados"
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Cámara de Diputados</span>
        </button>
        <button
          onClick={() => setActiveTab("senado")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "senado" 
              ? "bg-white text-slate-905 shadow-sm" 
              : "text-slate-600 hover:text-slate-900"
          }`}
          id="tab-chamber-senado"
        >
          <Radio className="w-4 h-4 text-emerald-600" />
          <span>Senado de la República</span>
        </button>
      </div>

      {/* Main Floor Sessions Row */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold" id="loading-table-signals">
          Cargando señales legislativas de la tabla...
        </div>
      ) : (
        <div className="flex flex-col gap-6" id="sala-main-interactive-container">
          
          {/* Active Chamber Header & Stream */}
          {currentSala && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col lg:flex-row gap-6 p-6" id="chamber-info-card-panel">
              {/* Left detail Column: Current State and Broadcast */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {currentSala.enVivo ? (
                      <span className="bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-pulse border border-blue-500 shadow-xs">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        EN VIVO
                      </span>
                    ) : (
                      <span className="bg-blue-650 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                        <Clock className="w-3 h-3 text-amber-400" />
                        SESIÓN DE TABLA
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-bold">{currentSala.estadoSesion}</span>
                  </div>
                  
                  <a 
                    href={currentSala.verStreamingUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1"
                  >
                    <span>Sitio Oficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="py-2.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    TEMA EN TABLA OFICIAL DISCUTIÉNDOSE
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                    {currentSala.temaDiscusion}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2" id="reps-present-counter">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      {currentSala.enVivo 
                        ? `${currentSala.representantesPresentes} parlamentarios confirmados en sala`
                        : "Asistencia de mesa cerrada"
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Lunes a Jueves • Régimen ordinario pauta oficial</span>
                  </div>
                </div>

                {/* Simulated Scrutiny Trigger */}
                {currentSala.enVivo && (
                  <div className="mt-2" id="simulado-escrutinio-container">
                    <button 
                      onClick={() => setActiveSessionSimulator(activeTab)}
                      className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Simulador de Escrutinio y Quórum</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right detail Column: Broadcast Preview Link */}
              <div className="lg:w-[380px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 flex flex-col justify-between p-5 min-h-[160px] shadow-inner shrink-0" id="chamber-signal-box">
                <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent opacity-60" />
                <div className="z-10 flex justify-between items-start">
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <Tv className="w-3.5 h-3.5 text-blue-500" />
                    Señal Legislativa Oficial
                  </span>
                  <span className="w-2.5 h-2.5 bg-blue-650 rounded-full animate-ping"></span>
                </div>

                <div className="z-10 my-4" id="stream-tv-action">
                  <p className="text-xs text-slate-350 leading-relaxed font-medium">
                    Siga el audio y debate íntegro de la sesión con traducción de señas en directo.
                  </p>
                </div>

                <div className="z-10 flex gap-2" id="external-web-room-links">
                  <a 
                    href={currentSala.verStreamingUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Ver Streaming
                  </a>
                  <a 
                    href="https://www.camara.cl/sala/default.aspx"
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-755 font-bold text-xs px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-center"
                    title="Ver Tabla Oficial original"
                  >
                    Ver Original
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* TABLE OF THE SESSION (como estado https://www.camara.cl/sala/default.aspx) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" id="official-pauta-session-table">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-slate-500" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider leading-none">
                    ORDEN DEL DÍA / TABLA DE LA SESIÓN
                  </h3>
                  <p className="text-[10px] text-slate-450 font-bold mt-1">
                    Proyectos agendados, urgencias constitucionales y orden de discusión pública.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-bold shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Sesión Ordinaria {activeTab === "diputados" ? "N° 142 " : "N° 95"}</span>
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left whitespace-nowrap lg:whitespace-normal font-sans">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-205 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3 w-28 text-center">N° Prioridad</th>
                    <th className="px-4 py-3 w-32">Boletín</th>
                    <th className="px-4 py-3 min-w-[340px]">Proyecto de Ley / Materia</th>
                    <th className="px-4 py-3 w-44">Trámite</th>
                    <th className="px-4 py-3 w-40">Urgencia</th>
                    <th className="px-4 py-3 w-44">Pleno / Comisión</th>
                    <th className="px-5 py-3 w-36 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activeProjects.map((p) => {
                    const isMainInteractive = p.boletin === "16.621-13" || p.boletin === "16.789-07";
                    return (
                      <tr 
                        key={p.boletin}
                        className={`hover:bg-slate-50/70 transition-colors ${isMainInteractive ? "bg-blue-50/15" : ""}`}
                      >
                        {/* Priority Order */}
                        <td className="px-5 py-4 text-center font-bold text-slate-500">
                          <span className={`px-2 py-1 rounded text-[10px] ${isMainInteractive ? "bg-blue-100/60 text-blue-800 font-extrabold" : "bg-slate-100 text-slate-600"}`}>
                            {p.orden}
                          </span>
                        </td>

                        {/* Bulletin (Boletín N°) */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleProjectClick(p.boletin)}
                            className="bg-blue-50/80 hover:bg-blue-100 text-blue-650 font-bold px-2.5 py-1 rounded border border-blue-100 uppercase tracking-wider text-[11px] select-none hover:underline"
                            title="Haz clic para ver el expediente y documentos del proyecto"
                          >
                            {p.boletin}
                          </button>
                        </td>

                        {/* Title of the project */}
                        <td className="px-4 py-4 leading-relaxed font-semibold text-slate-800 max-w-[420px]">
                          <div>
                            <span className="block text-slate-805 hover:text-blue-650 cursor-pointer transition-colors" onClick={() => handleProjectClick(p.boletin)}>
                              {p.titulo}
                            </span>
                          </div>
                        </td>

                        {/* Legislative stage (Trámite) */}
                        <td className="px-4 py-4 font-bold text-slate-500 text-[11px]">
                          {p.tramite}
                        </td>

                        {/* Urgencia badge */}
                        <td className="px-4 py-4">
                          {getUrgencyBadge(p.urgencia)}
                        </td>

                        {/* Comision technical desk */}
                        <td className="px-4 py-4 text-[10px] font-bold text-slate-450 uppercase tracking-tight">
                          {p.comision}
                        </td>

                        {/* Current discussion stage */}
                        <td className="px-5 py-4 text-right">
                          {getStatusBadge(p.estadoDiscusion)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Fallback to preserve great responsive design */}
            <div className="block lg:hidden divide-y divide-slate-150 border-t border-slate-100 bg-slate-50">
              {activeProjects.map((p) => (
                <div key={p.boletin} className="p-4 flex flex-col gap-3 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase font-mono">
                      {p.orden}
                    </span>
                    <button
                      onClick={() => handleProjectClick(p.boletin)}
                      className="text-blue-650 bg-blue-50 border border-blue-100 text-xs font-bold px-2 py-0.5 rounded hover:underline"
                    >
                      Boletín {p.boletin}
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-800 leading-snug" onClick={() => handleProjectClick(p.boletin)}>
                    {p.titulo}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold border-t border-slate-50 pt-2.5">
                    <div>
                      <span className="text-slate-400 block mb-0.5 uppercase">Urgencia</span>
                      {getUrgencyBadge(p.urgencia)}
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 uppercase">Estado</span>
                      {getStatusBadge(p.estadoDiscusion)}
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-0.5 uppercase">Mesa Informante</span>
                      <span className="text-slate-650">{p.comision} • {p.tramite}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanatory footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-start gap-2.5 text-[11px] text-slate-500 font-semibold leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Esta tabla legislativa representa fielmente el estado actual del Orden del Día del pleno parlamentario chileno. Puede acceder a los detalles completos, informes técnicos de comisiones y enmiendas registradas haciendo clic en los botones de <strong>Boletín N°</strong>.
              </span>
            </div>

          </div>

        </div>
      )}

      {/* Simulator Modal overlay */}
      <AnimatePresence>
        {activeSessionSimulator && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-white w-full max-w-lg p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-4 font-sans"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">PANEL DE ESCRUTINIO SIMULADO</span>
                  <h4 className="text-base font-bold text-white mt-1">
                    Escrutinio - {activeTab === "diputados" ? "Chamber of Deputies" : "Senate"}
                  </h4>
                </div>
                <button 
                  onClick={() => setActiveSessionSimulator(null)}
                  className="text-slate-400 hover:text-white font-semibold text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4 font-semibold">
                  Simule las proyecciones de aprobación en tiempo real según la asistencia de diputados y bancadas de partidos representadas en la Cámara.
                </p>

                <div className="grid grid-cols-3 gap-2 text-center my-2">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-xl font-bold text-emerald-400 block">74</span>
                    <span className="text-[9px] text-emerald-400 font-semibold uppercase">A Favor</span>
                  </div>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <span className="text-xl font-bold text-rose-400 block">32</span>
                    <span className="text-[9px] text-rose-400 font-semibold uppercase">En Contra</span>
                  </div>
                  <div className="p-3 bg-slate-500/15 border border-slate-500/20 rounded-xl">
                    <span className="text-xl font-bold text-slate-300 block">12</span>
                    <span className="text-[9px] text-slate-350 font-semibold uppercase">Abstención</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2.5 rounded-lg font-semibold mt-4">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Quórum aprobado: 4/7 alcanzado con éxito (+5 votos de margen).</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bento benefits row card list (Transparencia Total, Alertas en Vivo, Quórum Real-Time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-150 pt-8" id="live-floor-bento-cards">
        
        {/* Benefit 1 */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-205 shadow-xs flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Transparencia Total</h4>
            <p className="text-xs text-slate-550 mt-1 leading-relaxed font-semibold">
              Acceso abierto a actas oficiales, pautas de votaciones, actas consagradas de comités y transmisiones sin cortes. El historial completo está disponible para consulta en el repositorio.
            </p>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-205 shadow-xs flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-100">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Alertas en Vivo</h4>
            <p className="text-xs text-slate-550 mt-1 leading-relaxed font-semibold">
              Configure notificaciones push para ser avisado directamente en tu correo o panel principal cuando un proyecto de su interés entre a votación en sala o deba sesionar en comisiones técnicas.
            </p>
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-205 shadow-xs flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-105">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Quórum Real-Time</h4>
            <p className="text-xs text-slate-550 mt-1 leading-relaxed font-semibold">
              Monitoreo dinámico del registro de asistencia con control estricto de parlamentarios en sala. Visualiza el quórum mínimo necesario de aprobación según el tipo de Ley en discusión.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
