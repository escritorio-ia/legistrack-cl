/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Users, 
  Vote, 
  Megaphone, 
  ChevronRight, 
  Search, 
  Calendar, 
  MapPin, 
  Radio, 
  FileText,
  Clock,
  ArrowRight,
  Trash2,
  Star,
  Mic,
  MicOff,
  Check,
  RotateCcw,
  Edit2,
  Sparkles,
  BookOpen,
  ExternalLink
} from "lucide-react";
import { Alerta, Proyecto } from "../types";
import { findComisionMetaById, generateFullComisionData } from "../data/comisionesData";

interface DashboardViewProps {
  setView: (view: string) => void;
  setSelectedProyectoId: (id: string) => void;
  setSelectedComisionId: (id: string) => void;
  followedComs: string[];
  toggleFollowCom: (comName: string) => void;
  followedProys: string[];
  toggleFollowProy: (proyId: string) => void;
  diputadosComisiones: any[];
  senadoComisiones: any[];
}

export default function DashboardView({
  setView,
  setSelectedProyectoId,
  setSelectedComisionId,
  followedComs = [],
  toggleFollowCom,
  followedProys = [],
  toggleFollowProy,
  diputadosComisiones = [],
  senadoComisiones = []
}: DashboardViewProps) {
  const [stats, setStats] = useState({
    proyectosEnSala: 112,
    sesionesHoy: 27,
    votacionesPendientes: 6,
    alertasActivas: 4
  });
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [proyectosList, setProyectosList] = useState<Proyecto[]>([]);

  // OpenData XML query states
  const [legislatura, setLegislatura] = useState<{
    id: string;
    numero: string;
    fechaInicio: string;
    fechaTermino: string;
    tipo: string;
  } | null>(null);

  const [recentProyecto, setRecentProyecto] = useState<{
    boletin: string;
    titulo: string;
    fechaIngreso: string;
    estado: string;
    iniciativa: string;
    autores: string[];
  } | null>({
    boletin: "17.402-05",
    titulo: "Plan de Reconstrucción Nacional y Desarrollo Económico y Social post-incendios y reactivación de inversiones.",
    fechaIngreso: "2026-06-10",
    estado: "Publicado como Ley N° 21.810",
    iniciativa: "Mensaje",
    autores: ["Presidente de la República", "Ministro de Hacienda"]
  });

  const [apiLoading, setApiLoading] = useState(true);

  // States for session & work summaries dictation
  const [customSummaries, setCustomSummaries] = useState<Record<string, Record<string, string>>>({});
  const [projectSummaries, setProjectSummaries] = useState<Record<string, string>>({});
  const [selectedComisionForModal, setSelectedComisionForModal] = useState<{ nombre: string; id: string } | null>(null);
  const [selectedSesionForSummary, setSelectedSesionForSummary] = useState<any | null>(null);
  const [selectedProyectoForSummary, setSelectedProyectoForSummary] = useState<any | null>(null);
  const [modalSessions, setModalSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Load commission summaries from localStorage
    const comSums: Record<string, Record<string, string>> = {};
    const loadComms = [...diputadosComisiones, ...senadoComisiones];
    loadComms.forEach(c => {
      const prefixes = ["cd-", "senado-"];
      prefixes.forEach(pref => {
        const key = `${pref}${c.id}`;
        const saved = localStorage.getItem(`summaries_${key}`);
        if (saved) {
          try {
            comSums[key] = JSON.parse(saved);
          } catch (e) {}
        }
      });
    });
    setCustomSummaries(comSums);

    // Load project summaries from localStorage
    const proySums: Record<string, string> = {};
    followedProys.forEach(id => {
      const saved = localStorage.getItem(`summaries_proy_${id}`);
      if (saved) {
        proySums[id] = saved;
      }
    });
    setProjectSummaries(proySums);
  }, [followedComs, followedProys, diputadosComisiones, senadoComisiones]);

  const handleOpenComisionModal = (comName: string, comId: string) => {
    setSelectedComisionForModal({ nombre: comName, id: comId });
    const meta = findComisionMetaById(comId);
    const initialSesiones = meta ? generateFullComisionData(meta).sesiones : [];
    setModalSessions(initialSesiones);
    setLoadingSessions(false);
    setSelectedSesionForSummary(null);
    setSelectedProyectoForSummary(null);

    fetch(`/api/comision/${comId}`)
      .then(res => res.json())
      .then((data: any) => {
        if (data && data.sesiones && data.sesiones.length > 0) {
          setModalSessions(data.sesiones);
        }
      })
      .catch(() => {});
  };

  const handleOpenProyectoModal = (proy: any) => {
    setSelectedProyectoForSummary(proy);
    setSelectedComisionForModal(null);
    setSelectedSesionForSummary(null);
    
    // Load existing project summary
    const saved = localStorage.getItem(`summaries_proy_${proy.id}`);
    setSummaryText(saved || "");
  };

  const handleSaveSessionSummary = () => {
    if (!selectedSesionForSummary || !selectedComisionForModal) return;
    
    const comId = selectedComisionForModal.id;
    const nextComSums = {
      ...customSummaries,
      [comId]: {
        ...(customSummaries[comId] || {}),
        [selectedSesionForSummary.id]: summaryText.trim()
      }
    };
    setCustomSummaries(nextComSums);
    localStorage.setItem(`summaries_${comId}`, JSON.stringify(nextComSums[comId]));
    
    // Reset session view but keep commission session list open
    setSelectedSesionForSummary(null);
    setSummaryText("");
  };

  const handleSaveProyectoSummary = () => {
    if (!selectedProyectoForSummary) return;
    
    const nextProySums = {
      ...projectSummaries,
      [selectedProyectoForSummary.id]: summaryText.trim()
    };
    setProjectSummaries(nextProySums);
    localStorage.setItem(`summaries_proy_${selectedProyectoForSummary.id}`, summaryText.trim());
    
    setSelectedProyectoForSummary(null);
    setSummaryText("");
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La API de reconocimiento de voz no está soportada en este navegador o bloqueada. Por favor use Google Chrome o ingrese el resumen de forma manual.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "es-CL";

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setSummaryText(prev => prev + (prev ? " " : "") + transcript.trim());
        }
      };

      rec.onerror = (err: any) => {
        console.error("Error de dictado de voz:", err);
        setIsRecording(false);
        if (err.error === "not-allowed") {
          alert("Acceso al micrófono denegado. Permita el uso del micrófono en la barra de direcciones de su navegador para poder dictar.");
        } else {
          alert("Error de captura de voz: " + err.error);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      (window as any)._activeRecognition = rec;
      rec.start();
    } catch (e) {
      console.error("SpeechRecognition error:", e);
      setIsRecording(false);
    }
  };

  const stopVoiceDictation = () => {
    if ((window as any)._activeRecognition) {
      try {
        (window as any)._activeRecognition.stop();
      } catch (e) {}
      (window as any)._activeRecognition = null;
    }
    setIsRecording(false);
  };

  const suggestAISummaryForSession = () => {
    if (!selectedSesionForSummary || !selectedComisionForModal) return;
    setSummaryText("Generando propuesta de síntesis legislativa por IA...");
    const match = selectedSesionForSummary.materia?.match(/\b\d{1,5}\.\d{1,3}-\d{2}\b/);
    const targetBoletin = match ? match[0] : "16.100-01";

    fetch("/api/comisiones/sesion/generar-informe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comisionId: selectedComisionForModal.id,
        comisionNombre: selectedComisionForModal.nombre,
        sesionId: selectedSesionForSummary.id,
        sesionMateria: selectedSesionForSummary.materia,
        sesionFecha: selectedSesionForSummary.fecha,
        boletinId: targetBoletin,
        videoId: "",
        videoTitle: ""
      })
    })
      .then(async res => {
        const data = await res.json();
        const docText = data.documento || data.text || "";
        if (docText) {
          const summaryProposal = docText
            .replace(/[#*`]/g, "")
            .split(/[.\n]/)
            .filter((s: string) => s.trim().length > 15)
            .slice(0, 3)
            .map((s: string) => s.trim() + ".")
            .join(" ");
          setSummaryText(summaryProposal || docText);
        } else {
          setSummaryText("Sesión Ordinaria de trabajo en mesa técnica bicameral. Se abordaron observaciones presentadas por los integrantes de la Comisión, fijando la orden del día para el próximo periodo de debates particulares.");
        }
      })
      .catch(() => {
        setSummaryText("Sesión Ordinaria de trabajo en mesa técnica bicameral. Se abordaron observaciones presentadas por los integrantes de la Comisión, fijando la orden del día para el próximo periodo de debates particulares.");
      });
  };

  const suggestAISummaryForProyecto = () => {
    if (!selectedProyectoForSummary) return;
    setSummaryText("Generando propuesta de síntesis legislativa por IA...");
    fetch("/api/comisiones/sesion/generar-informe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comisionId: selectedProyectoForSummary.comisionId || "general",
        comisionNombre: selectedProyectoForSummary.comisionActual || "Comisión Técnica",
        sesionId: selectedProyectoForSummary.id,
        sesionMateria: selectedProyectoForSummary.titulo,
        sesionFecha: selectedProyectoForSummary.fechaIngreso || "Hoy",
        boletinId: selectedProyectoForSummary.id,
        videoId: "",
        videoTitle: ""
      })
    })
      .then(async res => {
        const data = await res.json();
        const docText = data.documento || data.text || "";
        if (docText) {
          const summaryProposal = docText
            .replace(/[#*`]/g, "")
            .split(/[.\n]/)
            .filter((s: string) => s.trim().length > 15)
            .slice(0, 3)
            .map((s: string) => s.trim() + ".")
            .join(" ");
          setSummaryText(summaryProposal || docText);
        } else {
          setSummaryText(`Análisis del proyecto de ley Boletín N° ${selectedProyectoForSummary.id}. Se revisa el estado actual: "${selectedProyectoForSummary.estado || 'En discusión'}". Se propone avanzar en el análisis técnico de las enmiendas e indicaciones propuestas en sala.`);
        }
      })
      .catch(() => {
        setSummaryText(`Análisis del proyecto de ley Boletín N° ${selectedProyectoForSummary.id}. Se revisa el estado actual: "${selectedProyectoForSummary.estado || 'En discusión'}". Se propone avanzar en el análisis técnico de las enmiendas e indicaciones propuestas en sala.`);
      });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        if (data.alertasRecientes) setAlertas(data.alertasRecientes);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading dashboard data:", err);
        setLoading(false);
      });

    // Fetch Legislatura Actual
    fetch("/api/asistente/query?method=getLegislaturaActual")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(json.data, "text/xml");
          
          const id = xmlDoc.getElementsByTagName("Id")[0]?.textContent || xmlDoc.getElementsByTagName("id")[0]?.textContent || "";
          const numero = xmlDoc.getElementsByTagName("Numero")[0]?.textContent || xmlDoc.getElementsByTagName("numero")[0]?.textContent || "";
          const fechaInicio = xmlDoc.getElementsByTagName("FechaInicio")[0]?.textContent || xmlDoc.getElementsByTagName("fechaInicio")[0]?.textContent || "";
          const fechaTermino = xmlDoc.getElementsByTagName("FechaTermino")[0]?.textContent || xmlDoc.getElementsByTagName("fechaTermino")[0]?.textContent || "";
          const tipo = xmlDoc.getElementsByTagName("Tipo")[0]?.textContent || xmlDoc.getElementsByTagName("tipo")[0]?.textContent || "";

          setLegislatura({ id, numero, fechaInicio, fechaTermino, tipo });
        }
      })
      .catch(err => console.error("Error loading legislatura actual:", err));

    // Fetch all proyectos for recent proyecto and follow-list resolution
    fetch("/api/proyectos?solo_vigentes=false")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProyectosList(data);
          // Pick the first/latest project (e.g. 17.402-05)
          const p = data[0];
          const autoresArr = p.autores ? p.autores.split(",").map((s: string) => s.trim()) : ["Presidente de la República"];
          setRecentProyecto({
            boletin: p.id,
            titulo: p.titulo,
            fechaIngreso: p.fechaIngreso,
            estado: p.estado,
            iniciativa: p.iniciativa || "Mensaje",
            autores: autoresArr
          });
        }
        setApiLoading(false);
      })
      .catch(err => {
        console.error("Error loading projects in DashboardView:", err);
        setApiLoading(false);
      });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-6"
    >
      {/* Welcome Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" id="greeting-title">
          Hola, Ana Morales
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Bienvenida a Legislación++. Este es tu resumen personalizado de la actividad legislativa en tiempo real.
        </p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-bento-grid">
        {/* Card 1: Proyectos en sala */}
        <div 
          onClick={() => setView("proyectos")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-slate-350 hover:shadow-md transition-all group"
          id="stat-card-proyectos"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-909">{stats.proyectosEnSala}</span>
            </div>
            <p className="text-xs font-semibold text-slate-705">Proyectos en sala</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">En Sala o Comisión</p>
          </div>
        </div>

        {/* Card 2: Sesiones hoy */}
        <div 
          onClick={() => setView("comisiones")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-slate-350 hover:shadow-md transition-all group"
          id="stat-card-sesiones"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-909">{stats.sesionesHoy}</span>
            </div>
            <p className="text-xs font-semibold text-slate-705">Sesiones hoy</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">En 3 comisiones</p>
          </div>
        </div>

        {/* Card 3: Votaciones pendientes */}
        <div 
          onClick={() => {
            setView("proyectos");
            alert("Filtrado por votaciones y proyectos en sala...");
          }}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-slate-350 hover:shadow-md transition-all group"
          id="stat-card-votaciones"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50/70 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-909">{stats.votacionesPendientes}</span>
            </div>
            <p className="text-xs font-semibold text-slate-705">Votaciones pendientes</p>
            <p className="text-[10px] mt-0.5 font-bold text-amber-600 uppercase tracking-tight text-[9px]">2 en esta semana</p>
          </div>
        </div>

        {/* Card 4: Alertas activas */}
        <div 
          onClick={() => setView("alertas")}
          className="bg-blue-50/60 p-5 rounded-xl border border-blue-100 shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all group animate-pulse"
          id="stat-card-alertas"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-blue-700">{stats.alertasActivas}</span>
            </div>
            <p className="text-xs font-bold text-blue-700">Alertas activas</p>
            <p className="text-[10px] text-blue-505 mt-0.5 font-semibold text-[9px] uppercase tracking-tight">Nuevas asignaciones</p>
          </div>
        </div>
      </div>

      {/* OpenData Summary Row */}
      <div className="space-y-3" id="opendata-summary-section">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-550 animate-pulse" />
            Resumen Oficial del Congreso Nacional (Datos Abiertos)
          </h2>
          <span className="text-[10px] bg-indigo-50/60 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold uppercase border border-indigo-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Conexión Activa
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Legislatura Actual Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:shadow-xs transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/25 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">LEGISLATURA EN CURSO</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                    Activa
                  </span>
                </div>
                {apiLoading ? (
                  <div className="h-5 w-32 bg-slate-100 animate-pulse rounded mt-1"></div>
                ) : legislatura ? (
                  <>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      Periodo Ordinario N° {legislatura.numero}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Legislatura ID: <span className="font-bold text-slate-700">{legislatura.id}</span> • Tipo: <span className="font-semibold text-slate-700 capitalize">{legislatura.tipo || "Ordinaria"}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {formatDate(legislatura.fechaInicio)} — {formatDate(legislatura.fechaTermino)}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Información de legislatura no disponible.</p>
                )}
              </div>
            </div>
          </div>

          {/* Último Proyecto de Ley Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-200 hover:shadow-xs transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/25 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">ÚLTIMO PROYECTO DE LEY</span>
                    {recentProyecto?.estado && (
                      <span className="bg-blue-50 text-blue-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-blue-100/75 uppercase truncate max-w-[130px]" title={recentProyecto.estado}>
                        {recentProyecto.estado}
                      </span>
                    )}
                  </div>
                  {recentProyecto?.boletin && (
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      Boletín {recentProyecto.boletin}
                    </span>
                  )}
                </div>
                {apiLoading ? (
                  <div className="space-y-1.5 py-1">
                    <div className="h-4 w-full bg-slate-100 animate-pulse rounded"></div>
                    <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded"></div>
                  </div>
                ) : recentProyecto ? (
                  <>
                    <h4 
                      onClick={() => {
                        setSelectedProyectoId(recentProyecto.boletin);
                        setView("proyecto-detail");
                      }}
                      className="text-xs font-bold text-slate-850 hover:text-blue-600 cursor-pointer leading-tight line-clamp-1 pr-6 transition-colors"
                      title={recentProyecto.titulo}
                    >
                      {recentProyecto.titulo}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[10px] leading-none pt-0.5">
                      <p className="text-slate-500 font-medium">
                        Iniciativa: <span className="font-semibold text-slate-700">{recentProyecto.iniciativa}</span>
                      </p>
                      {recentProyecto.autores && (
                        <p className="text-slate-500 truncate max-w-[150px] font-medium" title={Array.isArray(recentProyecto.autores) ? recentProyecto.autores.join(", ") : String(recentProyecto.autores)}>
                          • Autor: <span className="font-semibold text-slate-700">{Array.isArray(recentProyecto.autores) ? recentProyecto.autores.slice(0, 2).join(", ") : String(recentProyecto.autores)}</span>
                        </p>
                      )}
                      <p className="text-slate-400 font-semibold flex items-center gap-1">
                        • Ingresado: {formatDate(recentProyecto.fechaIngreso)}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Información del proyecto no disponible.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN PERSONALIZADA DE SEGUIMIENTOS: "Mis Comisiones" y "Mis Proyectos" */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" id="my-follows-section">
        <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3" id="my-follows-title">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          Mi Panel de Seguimiento (Mis Comisiones y Mis Proyectos)
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna: Mis Comisiones */}
          <div className="space-y-4" id="mis-comisiones-column">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Mis Comisiones ({followedComs.length})
              </h3>
              <button 
                onClick={() => setView("comisiones")}
                className="text-xs font-bold text-blue-650 hover:text-blue-755 hover:underline flex items-center gap-0.5"
                id="view-all-followed-comms"
              >
                Ver todas &rsaquo;
              </button>
            </div>

            {followedComs.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-205 text-xs text-slate-505">
                Aún no estás siguiendo ninguna comisión legislativa.
                <button 
                  onClick={() => setView("comisiones")}
                  className="mt-2.5 block mx-auto text-xs font-bold text-blue-600 hover:underline"
                >
                  Ver Comisiones Disponibles
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                {[
                  ...diputadosComisiones.map(c => ({ ...c, chamber: "CD", prefix: "cd-" })),
                  ...senadoComisiones.map(c => ({ ...c, chamber: "SR", prefix: "senado-" }))
                ]
                  .filter(c => followedComs.includes(c.nombre))
                  .map(c => (
                    <div 
                      key={`${c.prefix}${c.id}`}
                      className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                          c.chamber === "CD" 
                            ? "bg-blue-50 text-blue-600 border border-blue-100" 
                            : "bg-blue-50 text-blue-650 border border-blue-100"
                        }`}>
                          {c.chamber === "CD" ? "CÁMARA" : "SENADO"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 
                            onClick={() => {
                              setSelectedComisionId(`${c.prefix}${c.id}`);
                              setView("comision-detail");
                            }}
                            className="text-xs font-bold text-slate-805 hover:text-blue-650 transition-colors cursor-pointer truncate"
                            title={c.nombre}
                          >
                            {c.nombre}
                          </h4>
                          <p className="text-[10px] text-slate-455 truncate">
                            {c.descripcion}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                          onClick={() => handleOpenComisionModal(c.nombre, `${c.prefix}${c.id}`)}
                          title="Escribir o dictar resumen del sucedido para esta comisión"
                          className="text-[10px] font-bold text-emerald-750 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Bitácora</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComisionId(`${c.prefix}${c.id}`);
                            setView("comision-detail");
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg px-2 py-1 transition-all"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => toggleFollowCom(c.nombre)}
                          title="Dejar de seguir"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Columna: Mis Proyectos */}
          <div className="space-y-4" id="mis-proyectos-column">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Mis Proyectos ({followedProys.length})
              </h3>
              <button 
                onClick={() => setView("proyectos")}
                className="text-xs font-bold text-emerald-650 hover:text-emerald-755 hover:underline flex items-center gap-0.5"
                id="view-all-followed-proys"
              >
                Ver todos &rsaquo;
              </button>
            </div>

            {followedProys.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-205 text-xs text-slate-505">
                Aún no estás vigilando ningún proyecto de ley (boletín).
                <button 
                  onClick={() => setView("proyectos")}
                  className="mt-2.5 block mx-auto text-xs font-bold text-emerald-600 hover:underline"
                >
                  Explorar Proyectos
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                {proyectosList
                  .filter(p => followedProys.includes(p.id))
                  .map((p, idx) => (
                    <div 
                      key={`${p.id}-${idx}`}
                      className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                          {p.id}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 
                            onClick={() => {
                              setSelectedProyectoId(p.id);
                              setView("proyecto-detail");
                            }}
                            className="text-xs font-bold text-slate-805 hover:text-emerald-655 transition-colors cursor-pointer truncate"
                            title={p.titulo}
                          >
                            {p.titulo}
                          </h4>
                          <p className="text-[10px] text-slate-455 truncate">
                            Comisión actual: <span className="font-semibold text-slate-600">{p.comisionActual || "No asignada"}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                          onClick={() => handleOpenProyectoModal(p)}
                          title="Escribir o dictar resumen del sucedido para este proyecto"
                          className="text-[10px] font-bold text-emerald-750 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Bitácora</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProyectoId(p.id);
                            setView("proyecto-detail");
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg px-2 py-1 transition-all"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => toggleFollowProy(p.id)}
                          title="Dejar de seguir"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {followedProys
                  .filter(id => !proyectosList.some(p => p.id === id))
                  .map(id => (
                    <div 
                      key={id}
                      className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[9px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                          {id}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 
                            onClick={() => {
                              setSelectedProyectoId(id);
                              setView("proyecto-detail");
                            }}
                            className="text-xs font-bold text-slate-805 hover:text-emerald-650 transition-colors cursor-pointer truncate"
                          >
                            Proyecto Boletín {id}
                          </h4>
                          <p className="text-[10px] text-slate-400 italic">
                            Cargando detalles...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                          onClick={() => handleOpenProyectoModal({ id, titulo: `Proyecto Boletín ${id}` })}
                          title="Escribir o dictar resumen del sucedido para este proyecto"
                          className="text-[10px] font-bold text-emerald-750 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Bitácora</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProyectoId(id);
                            setView("proyecto-detail");
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg px-2 py-1 transition-all"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => toggleFollowProy(id)}
                          title="Dejar de seguir"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-split-layout">
        
        {/* Left Column (Alerts & Followed Commissions) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Recent Alerts Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" id="recent-alerts-panel">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                Alertas recientes
              </h2>
              <button 
                onClick={() => setView("alertas")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5"
                id="view-all-alerts-btn"
              >
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100" id="alerts-list">
              {loading ? (
                <div className="py-6 text-center text-sm text-slate-400">Cargando alertas legislativas...</div>
              ) : alertas.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">No hay alertas legislativas recientes creadas.</div>
              ) : (
                alertas.map((alerta) => (
                  <div 
                    key={alerta.id}
                    onClick={() => {
                      setSelectedProyectoId(alerta.boletinId);
                      setView("proyecto-detail");
                    }}
                    className="py-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors group"
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        alerta.tipo === 'indicador' ? 'bg-blue-50 text-blue-600' :
                        alerta.tipo === 'citacion' ? 'bg-slate-100 text-slate-700' :
                        alerta.tipo === 'votacion' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-650'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600">
                          {alerta.titulo}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {alerta.subtitulo}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap ml-4">
                      {alerta.tiempo}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Quick Actions & Recent Activity Timeline) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl shadow-md p-6 flex flex-col justify-between" id="quick-actions-panel">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 h-5">Acciones rápidas</h3>
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => setView("proyectos")}
                  className="w-full text-left bg-slate-800 hover:bg-slate-755 text-slate-205 transition-all rounded-lg px-4 py-2.5 text-xs font-semibold flex items-center gap-3 border border-slate-700/50 shadow-xs hover:text-white"
                >
                  <Search className="w-4 h-4 text-slate-400" />
                  <span>Buscar proyectos de ley</span>
                </button>
                <button 
                  onClick={() => {
                    setView("proyectos");
                    const inp = document.getElementById("header-search-input");
                    if (inp) inp.focus();
                  }}
                  className="w-full text-left bg-slate-800 hover:bg-slate-755 text-slate-205 transition-all rounded-lg px-4 py-2.5 text-xs font-semibold flex items-center gap-3 border border-slate-700/50 shadow-xs hover:text-white"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Buscar boletines</span>
                </button>
                <button 
                  onClick={() => setView("comisiones")}
                  className="w-full text-left bg-slate-800 hover:bg-slate-755 text-slate-205 transition-all rounded-lg px-4 py-2.5 text-xs font-semibold flex items-center gap-3 border border-slate-700/50 shadow-xs hover:text-white"
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Ver sesiones de hoy</span>
                </button>
                <button 
                  onClick={() => {
                    setView("proyectos");
                    alert("Filtrado por votaciones y proyectos en sala...");
                  }}
                  className="w-full text-left bg-slate-800 hover:bg-slate-755 text-slate-205 transition-all rounded-lg px-4 py-2.5 text-xs font-semibold flex items-center gap-3 border border-slate-700/50 shadow-xs hover:text-white"
                >
                  <Vote className="w-4 h-4 text-slate-400" />
                  <span>Votaciones pendientes</span>
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Legis<span className="text-blue-500">Track</span> CL • Transparencia Total</span>
            </div>
          </div>

          {/* Activity Timeline Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" id="recent-activity-panel">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Actividad reciente</h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="relative border-l-2 border-slate-100 pl-5 ml-2 space-y-6" id="activity-timeline-list">
              {/* Timeline Item 1 */}
              <div className="relative" id="activity-1">
                <div className="absolute -left-[26px] top-1 w-3 h-3 bg-blue-600 rounded-full ring-4 ring-white"></div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">HOY, 10:15</span>
                  <span className="text-xs font-bold text-slate-850 leading-tight">Indicaciones presentadas</span>
                  <button 
                    onClick={() => {
                      setSelectedProyectoId("16.621-13");
                      setView("proyecto-detail");
                    }}
                    className="text-xs text-blue-650 font-bold hover:text-blue-700 hover:underline text-left mt-0.5"
                  >
                    Boletín 16.621-13
                  </button>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative" id="activity-2">
                <div className="absolute -left-[26px] top-1 w-3 h-3 bg-slate-300 rounded-full ring-4 ring-white"></div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AYER, 09:00</span>
                  <span className="text-xs font-bold text-slate-850 leading-tight">Sesión iniciada</span>
                  <button 
                    onClick={() => {
                      setSelectedComisionId("cd-hacienda");
                      setView("comision-detail");
                    }} 
                    className="text-xs text-blue-650 font-bold hover:text-blue-700 hover:underline text-left mt-0.5"
                  >
                    Comisión de Hacienda (Cámara)
                  </button>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative" id="activity-3">
                <div className="absolute -left-[26px] top-1 w-3 h-3 bg-slate-300 rounded-full ring-4 ring-white"></div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">08 MAY, 16:45</span>
                  <span className="text-xs font-bold text-slate-850 leading-tight">Documento publicado</span>
                  <span className="text-xs text-slate-500 font-medium">
                    Boletín 15.201-23
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setView("proyectos")}
              className="w-full text-center mt-6 text-xs font-bold text-blue-650 hover:text-blue-700 hover:underline flex items-center justify-center gap-1 cursor-pointer pt-3 border-t border-slate-100"
              id="view-all-history-btn"
            >
              <span>Ver todo el historial</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

      {/* MODAL: SINOPSIS / BITÁCORA DE COMISIÓN (SESIONES) */}
      {selectedComisionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-start shrink-0 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Bitácora de Comisiones
                  </span>
                  <a 
                    href={selectedComisionForModal.id.startsWith("senado") 
                      ? "https://www.senado.cl/actividad-legislativa/comisiones" 
                      : "https://www.camara.cl/legislacion/comisiones/comisiones_permanentes.aspx"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs"
                  >
                    <span>{selectedComisionForModal.id.startsWith("senado") ? "senado.cl" : "camara.cl"}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedComisionForModal.nombre}
                </h3>
              </div>
              <button 
                onClick={() => {
                  stopVoiceDictation();
                  setSelectedComisionForModal(null);
                  setSelectedSesionForSummary(null);
                }}
                className="text-slate-450 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingSessions ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando sesiones y actas desde la API...</span>
                </div>
              ) : !selectedSesionForSummary ? (
                // LIST OF SESSIONS VIEW
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A continuación se listan las sesiones de esta comisión. Selecciona una para escribir o dictar un resumen personalizado de lo sucedido:
                  </p>
                  
                  {modalSessions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                      No se encontraron registros de sesiones activas para esta comisión.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {modalSessions.map((sesion: any) => {
                        const existingSummary = customSummaries[selectedComisionForModal.id]?.[sesion.id];
                        return (
                          <div 
                            key={sesion.id} 
                            className="p-4 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                    {formatDate(sesion.fecha)}
                                  </span>
                                  {existingSummary && (
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <Check className="w-2.5 h-2.5" />
                                      Con Resumen
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 mt-1">
                                  Sesión N° {sesion.numero || sesion.id}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                  {sesion.materia || "Sin materia especificada."}
                                </p>
                                
                                {existingSummary && (
                                  <div className="mt-2 p-2 bg-white border border-slate-100 rounded text-[10px] text-slate-600 font-medium italic border-l-2 border-l-emerald-500">
                                    "{existingSummary}"
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedSesionForSummary(sesion);
                                  setSummaryText(existingSummary || "");
                                }}
                                className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer shrink-0"
                              >
                                {existingSummary ? "Editar" : "Dictar / Escribir"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // SESSION DICTATION & EDIT VIEW
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                    <span className="text-[9px] font-bold text-blue-600 uppercase">Editando Acta de Sesión</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">
                      Sesión N° {selectedSesionForSummary.numero || selectedSesionForSummary.id} ({formatDate(selectedSesionForSummary.fecha)})
                    </h4>
                    <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2">
                      {selectedSesionForSummary.materia}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {!isRecording ? (
                        <button
                          onClick={startVoiceDictation}
                          className="bg-emerald-650 text-white hover:bg-emerald-750 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Dictar por Voz</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopVoiceDictation}
                          className="bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all animate-pulse cursor-pointer shadow-sm"
                        >
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Detener Grabación</span>
                        </button>
                      )}
                      
                      <button
                        onClick={suggestAISummaryForSession}
                        title="Sugerir propuesta redactada usando la información de la sesión"
                        className="bg-slate-50 text-blue-750 hover:bg-blue-50 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Sugerir por IA</span>
                      </button>
                    </div>
                    {isRecording && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Escuchando...
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                      Resumen del Sucedido (Bitácora Ciudadana)
                    </label>
                    <textarea
                      rows={6}
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      placeholder="Escriba o dicte el resumen de lo acontecido en esta sesión parlamentaria. Se guardará directamente en su bitácora de seguimiento..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3 font-medium text-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 leading-relaxed placeholder-slate-400"
                    />
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[9px] text-slate-400">
                        {summaryText.length} caracteres
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        stopVoiceDictation();
                        setSelectedSesionForSummary(null);
                        setSummaryText("");
                      }}
                      className="text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 transition-colors cursor-pointer"
                    >
                      Volver al listado
                    </button>
                    <button
                      onClick={handleSaveSessionSummary}
                      className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Guardar en Bitácora</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SINOPSIS / BITÁCORA DE PROYECTO (TRABAJO) */}
      {selectedProyectoForSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-start shrink-0 bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bitácora de Proyecto de Ley
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Boletín N° {selectedProyectoForSummary.id}
                </h3>
              </div>
              <button 
                onClick={() => {
                  stopVoiceDictation();
                  setSelectedProyectoForSummary(null);
                }}
                className="text-slate-450 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                <span className="text-[9px] font-bold text-emerald-700 uppercase">Título del Proyecto</span>
                <h4 className="text-xs font-bold text-slate-800 mt-0.5 leading-relaxed">
                  {selectedProyectoForSummary.titulo}
                </h4>
                {selectedProyectoForSummary.estado && (
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    Estado: <span className="font-semibold text-slate-600">{selectedProyectoForSummary.estado}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {!isRecording ? (
                    <button
                      onClick={startVoiceDictation}
                      className="bg-emerald-650 text-white hover:bg-emerald-750 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Dictar por Voz</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopVoiceDictation}
                      className="bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all animate-pulse cursor-pointer shadow-sm"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Detener Grabación</span>
                    </button>
                  )}
                  
                  <button
                    onClick={suggestAISummaryForProyecto}
                    title="Sugerir propuesta redactada usando la información del proyecto"
                    className="bg-slate-50 text-blue-750 hover:bg-blue-50 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Sugerir por IA</span>
                  </button>
                </div>
                {isRecording && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Escuchando...
                  </span>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Resumen de lo Sucedido / Trabajo Realizado
                </label>
                <textarea
                  rows={6}
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Escriba o dicte el resumen de lo acontecido, observaciones o trabajo realizado en este proyecto de ley. Se guardará directamente en su bitácora de seguimiento..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3 font-medium text-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 leading-relaxed placeholder-slate-400"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[9px] text-slate-400">
                    {summaryText.length} caracteres
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    stopVoiceDictation();
                    setSelectedProyectoForSummary(null);
                    setSummaryText("");
                  }}
                  className="text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProyectoSummary}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar en Bitácora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
