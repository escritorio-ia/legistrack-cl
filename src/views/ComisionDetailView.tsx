/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Calendar, 
  ChevronRight, 
  Volume2, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ListTodo, 
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Share2,
  Bookmark,
  Mic,
  MicOff,
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  Star,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Plus,
  CalendarCheck,
  Search,
  Landmark,
  Video,
  UserCheck,
  Award,
  Mail,
  MapPin,
  Copy,
  Download,
  Bell,
  Tv,
  Zap,
  CheckCircle,
  Eye
} from "lucide-react";
import React from "react";
import { Comision, SesionItem, Proyecto, Integrante } from "../types";

export function parseFechaSesion(fechaStr?: string): Date | null {
  if (!fechaStr) return null;
  const isoMatch = fechaStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]), 23, 59, 59);
  }
  const meses: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
  };
  const match = fechaStr.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)\s+de\s+(\d{4})/i);
  if (match) {
    const day = Number(match[1]);
    const monthStr = match[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const year = Number(match[3]);
    const month = meses[monthStr] ?? 0;
    return new Date(year, month, day, 23, 59, 59);
  }
  return null;
}

export function isSessionDatePassed(fechaStr?: string): boolean {
  const d = parseFechaSesion(fechaStr);
  if (!d) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  return d.getTime() < today.getTime();
}

export function getDaysRemaining(fechaStr?: string): string {
  const d = parseFechaSesion(fechaStr);
  if (!d) return "Convocada";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const diffMs = d.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "🔴 Sesiona Hoy";
  if (diffDays === 1) return "⏳ Convocada para Mañana";
  if (diffDays > 1) return `📅 En ${diffDays} días`;
  return "Sesión Realizada";
}

export function getPartyBadgeStyle(partido?: string): { bg: string; text: string; border: string } {
  const p = (partido || "").toLowerCase();
  if (p.includes("rn") || p.includes("renovacion")) return { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" };
  if (p.includes("udi")) return { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" };
  if (p.includes("ps") || p.includes("socialista")) return { bg: "bg-red-100", text: "text-red-900", border: "border-red-300" };
  if (p.includes("fa") || p.includes("frente amplio")) return { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" };
  if (p.includes("pc") || p.includes("comunista")) return { bg: "bg-rose-100", text: "text-rose-900", border: "border-rose-300" };
  if (p.includes("democrata") || p.includes("dc") || p.includes("amarillos")) return { bg: "bg-cyan-100", text: "text-cyan-900", border: "border-cyan-300" };
  if (p.includes("republican") || p.includes("prep") || p.includes("psc")) return { bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-300" };
  if (p.includes("ppd") || p.includes("pr") || p.includes("pl")) return { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300" };
  if (p.includes("evopoli")) return { bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-300" };
  return { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" };
}

export function categorizeInvitados(invitadosStr?: string): { category: string; icon: string; text: string; color: string }[] {
  if (!invitadosStr) return [];
  const parts = invitadosStr.split(/[;,\n]/).map(p => p.trim()).filter(Boolean);
  return parts.slice(0, 6).map(p => {
    const low = p.toLowerCase();
    if (low.includes("ministr") || low.includes("subsecretar") || low.includes("director") || low.includes("dipres") || low.includes("gobierno") || low.includes("seremi")) {
      return { category: "Ejecutivo", icon: "🏛️", text: p, color: "bg-blue-900/50 text-blue-200 border-blue-700/60" };
    }
    if (low.includes("gremio") || low.includes("cpc") || low.includes("sofofa") || low.includes("cut") || low.includes("asociaci") || low.includes("sindicato") || low.includes("camara")) {
      return { category: "Gremial / Civil", icon: "💼", text: p, color: "bg-amber-900/50 text-amber-200 border-amber-700/60" };
    }
    if (low.includes("universidad") || low.includes("académic") || low.includes("profesor") || low.includes("estudios") || low.includes("investigad") || low.includes("instituto") || low.includes("experto")) {
      return { category: "Academia", icon: "🎓", text: p, color: "bg-purple-900/50 text-purple-200 border-purple-700/60" };
    }
    return { category: "Expositor", icon: "👤", text: p, color: "bg-slate-800 text-slate-200 border-slate-700" };
  });
}

export function renderTablaItemWithBoletinChips(text: string, onBoletinClick: (boletinId: string) => void) {
  const parts = text.split(/(\b\d{1,5}\.\d{1,3}-\d{2}\b|\b\d{4,6}-\d{1,2}\b)/g);
  
  return (
    <span>
      {parts.map((part, idx) => {
        if (/^(\d{1,5}\.\d{1,3}-\d{2}|\d{4,6}-\d{1,2})$/.test(part)) {
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBoletinClick(part);
              }}
              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md font-mono font-black text-[11px] bg-blue-500/25 text-blue-200 hover:bg-blue-500 hover:text-white border border-blue-400/50 hover:border-blue-400 transition-all cursor-pointer shadow-xs align-baseline"
              title={`Click para abrir expediente del Boletín N° ${part}`}
            >
              <span>Boletín {part}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-85" />
            </button>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

interface ComisionDetailViewProps {
  comisionId: string;
  setView: (view: string) => void;
  setSelectedProyectoId: (id: string) => void;
  setSearchFilter?: (search: string) => void;
  followedComs?: string[];
  toggleFollowCom?: (name: string) => void;
}

export default function ComisionDetailView({
  comisionId,
  setView,
  setSelectedProyectoId,
  setSearchFilter,
  followedComs,
  toggleFollowCom
}: ComisionDetailViewProps) {
  const [comision, setComision] = useState<Comision | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingOfficial, setRefreshingOfficial] = useState(false);
  const [activePeriod, setActivePeriod] = useState("56º Período Legislativo (2022 - 2026)");

  // Member Modal State
  const [selectedIntegranteModal, setSelectedIntegranteModal] = useState<Integrante | null>(null);

  // Complete Session Modal State
  const [sessionToComplete, setSessionToComplete] = useState<SesionItem | null>(null);
  const [sessionCompleteForm, setSessionCompleteForm] = useState({
    actaTexto: "",
    acuerdosTexto: "",
    invitadosExpositores: "",
    videoUrl: "",
    boletinesTratados: ""
  });
  const [sessionCompleteSuccess, setSessionCompleteSuccess] = useState(false);

  const handleRefreshOfficialData = () => {
    setRefreshingOfficial(true);
    fetch(`/api/comision/${comisionId}?refresh=true`)
      .then(res => res.json())
      .then((data: Comision) => {
        applySessionDatesAndState(data);
        setRefreshingOfficial(false);
      })
      .catch(err => {
        console.error("Error refreshing official commission data:", err);
        setRefreshingOfficial(false);
      });
  };

  // YouTube search & AI Legislative Report generation states
  const [selectedSesionForReport, setSelectedSesionForReport] = useState<SesionItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [reportBoletinId, setReportBoletinId] = useState("");
  const [customBoletin, setCustomBoletin] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [viewerCurrentPage, setViewerCurrentPage] = useState(1);
  const [customReportBoletinId, setCustomReportBoletinId] = useState("");

  const [selectedSesionForSummary, setSelectedSesionForSummary] = useState<SesionItem | null>(null);
  const [summaryText, setSummaryText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [customSummaries, setCustomSummaries] = useState<Record<string, string>>({});
  const [showAllSessionsSubpage, setShowAllSessionsSubpage] = useState(false);
  const [selectedSesionForSubpage, setSelectedSesionForSubpage] = useState<SesionItem | null>(null);
  const [subpageSummaryText, setSubpageSummaryText] = useState("");
  const [subpageIsRecording, setSubpageIsRecording] = useState(false);
  const [linkedBoletinId, setLinkedBoletinId] = useState("");
  const [customLinkedBoletinId, setCustomLinkedBoletinId] = useState("");
  const [showCustomBoletinInput, setShowCustomBoletinInput] = useState(false);
  const [subpageSavedSuccess, setSubpageSavedSuccess] = useState(false);
  const [memberSearchFilter, setMemberSearchFilter] = useState("");

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Citación Edit Modal State
  const [isEditingCitacionModal, setIsEditingCitacionModal] = useState(false);
  const [citacionEditForm, setCitacionEditForm] = useState({
    citacionNumero: "",
    fecha: "",
    fechaInput: "",
    hora: "",
    lugar: "",
    materia: "",
    invitados: "",
    tablaText: "",
    secretario: "",
    pasteRawText: ""
  });

  const handleCopyCitacion = (ses: SesionItem) => {
    const chamberName = isSenado ? "Senado de la República de Chile" : "Cámara de Diputadas y Diputados de Chile";
    const text = `🏛️ *CONVOCATORIA OFICIAL — CONGRESO NACIONAL DE CHILE*
📌 *Comisión:* ${comision?.nombre} (${chamberName})
📄 *${ses.citacionNumero || ses.tipo || "Citación Oficial de Sesión"}*
📅 *Fecha:* ${ses.fecha}
⏰ *Horario:* ${ses.hora || "10:30 a 13:00 hrs."}
📍 *Lugar / Sala:* ${ses.lugar || "Valparaíso"}

📋 *Objeto de la Sesión / Materia:*
${ses.materia}

${ses.invitados ? `👥 *Invitados / Expositores:*
${ses.invitados}
` : ""}${ses.tabla && ses.tabla.length > 0 ? `📑 *Tabla en Tramitación:*
${ses.tabla.map((t, i) => `${i + 1}. ${t}`).join("\n")}
` : ""}${ses.secretario ? `✍️ *Secretaría:* ${ses.secretario}` : ""}
🔗 *Plataforma:* LegisTrack-CL (Seguimiento Parlamentario)`;

    navigator.clipboard.writeText(text).then(() => {
      showToast("¡Citación copiada al portapapeles con formato oficial!");
    }).catch(() => {
      showToast("No se pudo copiar al portapapeles.");
    });
  };

  const handleDownloadIcs = (ses: SesionItem) => {
    const d = parseFechaSesion(ses.fecha);
    const now = new Date();
    const eventDate = d || new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    let startHour = 10;
    let startMin = 30;
    let endHour = 13;
    let endMin = 0;
    
    if (ses.hora) {
      const m = ses.hora.match(/(\d{1,2}):(\d{2})\s*(?:a|-|–)\s*(\d{1,2}):(\d{2})/);
      if (m) {
        startHour = parseInt(m[1], 10);
        startMin = parseInt(m[2], 10);
        endHour = parseInt(m[3], 10);
        endMin = parseInt(m[4], 10);
      }
    }

    const dtStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHour, startMin);
    const dtEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), endHour, endMin);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatIcsDate = (date: Date) => 
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

    const cleanDesc = (ses.materia + (ses.invitados ? "\n\nInvitados: " + ses.invitados : "") + (ses.tabla ? "\n\nTabla:\n" + ses.tabla.join("\n") : "")).replace(/\n/g, "\\n");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LegisTrackCL//Citaciones//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:citacion-${comisionId}-${Date.now()}@legistrack.cl`,
      `DTSTAMP:${formatIcsDate(new Date())}Z`,
      `DTSTART:${formatIcsDate(dtStart)}`,
      `DTEND:${formatIcsDate(dtEnd)}`,
      `SUMMARY:${ses.citacionNumero || "Citación"}: ${comision?.nombre || "Comisión"}`,
      `DESCRIPTION:${cleanDesc}`,
      `LOCATION:${ses.lugar || "Congreso Nacional, Valparaíso"}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citacion_${comisionId}_${eventDate.toISOString().split("T")[0]}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("¡Archivo de calendario (.ics) descargado!");
  };

  const handleOpenGoogleCalendar = (ses: SesionItem) => {
    const d = parseFechaSesion(ses.fecha);
    const now = new Date();
    const eventDate = d || new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    let startHour = 10;
    let startMin = 30;
    let endHour = 13;
    let endMin = 0;
    
    if (ses.hora) {
      const m = ses.hora.match(/(\d{1,2}):(\d{2})\s*(?:a|-|–)\s*(\d{1,2}):(\d{2})/);
      if (m) {
        startHour = parseInt(m[1], 10);
        startMin = parseInt(m[2], 10);
        endHour = parseInt(m[3], 10);
        endMin = parseInt(m[4], 10);
      }
    }

    const dtStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHour, startMin);
    const dtEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), endHour, endMin);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatGCalDate = (date: Date) => 
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

    const title = encodeURIComponent(`${ses.citacionNumero || "Citación"}: ${comision?.nombre || "Comisión"}`);
    const details = encodeURIComponent(`${ses.materia}\n\nInvitados: ${ses.invitados || "N/A"}\n\nTabla:\n${(ses.tabla || []).join("\n")}`);
    const location = encodeURIComponent(ses.lugar || "Congreso Nacional, Valparaíso");
    const dates = `${formatGCalDate(dtStart)}/${formatGCalDate(dtEnd)}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(url, "_blank");
  };

  const handleTriggerCitacionAlert = (ses: SesionItem) => {
    const bId = extractBoletinId(ses.materia) || (comision?.proyectos && comision.proyectos.length > 0 ? comision.proyectos[0].id : "");
    fetch("/api/alertas/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: `🔔 Citación Convocada: ${comision?.nombre}`,
        subtitulo: `${ses.citacionNumero || "Sesión"} para ${ses.fecha} (${ses.hora || "10:30 hrs"}). Materia: ${ses.materia.slice(0, 90)}...`,
        boletinId: bId
      })
    }).then(() => {
      showToast("¡Alerta de citación registrada en su Centro de Notificaciones!");
    }).catch(() => {
      showToast("Alerta guardada en el sistema.");
    });
  };

  const applyCitacionTemplate = (templateType: "ordinaria" | "audiencias" | "votacion") => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const defaultDateISO = nextWeek.toISOString().split("T")[0];
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const formatted = `Martes ${nextWeek.getDate()} de ${monthNames[nextWeek.getMonth()]} de ${nextWeek.getFullYear()}`;
    
    const proy = comision?.proyectos && comision.proyectos.length > 0 ? comision.proyectos[0] : null;
    const pId = proy ? proy.id : "16.621-13";
    const pTit = proy ? proy.titulo : "Modernización y fortalecimiento del marco normativo sectorial";

    if (templateType === "ordinaria") {
      setCitacionEditForm({
        citacionNumero: "Citación N° 86 (Sesión Ordinaria)",
        fecha: formatted,
        fechaInput: defaultDateISO,
        hora: "10:30 a 13:00 hrs.",
        lugar: isSenado ? "Sala N° 3 de Comisiones del Senado (Valparaíso) / Sistema Híbrido" : "Sala N° 311 de la Cámara (Valparaíso) / Sistema Híbrido",
        materia: `Continuar con el estudio en general del proyecto de ley correspondiente al Boletín N° ${pId}: ${pTit}.`,
        invitados: "Ministros de Estado del ramo sectorial, Subsecretarios y jefaturas de servicio competentes.",
        tablaText: `1. Boletín N° ${pId}: ${pTit}.\n2. Exposición del Ejecutivo sobre informe financiero DIPRES.\n3. Varios y acuerdos de tramitación.`,
        secretario: isSenado ? "Abogado/a Secretario/a del Senado" : "Abogado/a Secretario/a de la Cámara",
        pasteRawText: ""
      });
    } else if (templateType === "audiencias") {
      setCitacionEditForm({
        citacionNumero: "Citación N° 87 (Audiencias Públicas y Expertos)",
        fecha: formatted,
        fechaInput: defaultDateISO,
        hora: "15:00 a 18:00 hrs.",
        lugar: isSenado ? "Sala de Sesiones del Senado (Valparaíso) / Telemática" : "Sala N° 311 de la Cámara (Valparaíso) / Telemática",
        materia: `Recibir en audiencia pública a representantes de la academia, gremios productivos y organizaciones de la sociedad civil en relación al Boletín N° ${pId}.`,
        invitados: "Colegios Profesionales, Decanos de Facultades Universitarias, Gremios del Sector y Centros de Estudios de Políticas Públicas.",
        tablaText: `1. Audiencia pública con expositores convocados sobre el Boletín N° ${pId}.\n2. Ronda de preguntas y observaciones técnicas de las y los integrantes de la Comisión.\n3. Fijación de plazo para audiencias complementarias.`,
        secretario: isSenado ? "Abogado/a Secretario/a del Senado" : "Abogado/a Secretario/a de la Cámara",
        pasteRawText: ""
      });
    } else if (templateType === "votacion") {
      setCitacionEditForm({
        citacionNumero: "Citación N° 88 (Votación en Particular)",
        fecha: formatted,
        fechaInput: defaultDateISO,
        hora: "09:30 a 12:30 hrs.",
        lugar: isSenado ? "Sala N° 3 de Comisiones del Senado (Valparaíso)" : "Sala N° 311 de la Cámara (Valparaíso)",
        materia: `Iniciar la discusión y votación en particular del articulado y las indicaciones formuladas al proyecto de ley Boletín N° ${pId}: ${pTit}.`,
        invitados: "Asesores legislativos del Ministerio del ramo y Secretaría Técnica de la Comisión.",
        tablaText: `1. Votación en particular del articulado e indicaciones al Boletín N° ${pId}.\n2. Despacho del texto sistematizado para informe a la Sala del Congreso.\n3. Designación de Diputado/a o Senador/a Informante.`,
        secretario: isSenado ? "Abogado/a Secretario/a del Senado" : "Abogado/a Secretario/a de la Cámara",
        pasteRawText: ""
      });
    }
  };

  const applySessionDatesAndState = (data: Comision) => {
    // 1. Merge any user-completed session records from localStorage
    const savedCompletedSesKey = `completed_sesiones_${data.id}`;
    let savedCompleted: SesionItem[] = [];
    try {
      const stored = localStorage.getItem(savedCompletedSesKey);
      if (stored) savedCompleted = JSON.parse(stored);
    } catch (e) {
      console.error("Error reading saved completed sessions", e);
    }

    if (savedCompleted.length > 0) {
      const existingIds = new Set(data.sesiones.map(s => s.id));
      for (const sc of savedCompleted) {
        if (existingIds.has(sc.id)) {
          data.sesiones = data.sesiones.map(s => s.id === sc.id ? { ...s, ...sc } : s);
        } else {
          data.sesiones.unshift(sc);
        }
      }
    }

    // 2. Load custom saved citación if present
    const savedCitacion = localStorage.getItem(`citacion_${data.id}`);
    if (savedCitacion) {
      try {
        const customCit = JSON.parse(savedCitacion);
        data.proximaSesion = {
          ...data.proximaSesion,
          ...customCit
        };
      } catch (e) {
        console.error("Error loading saved citacion", e);
      }
    }

    // 3. Dynamic Date Archiving: if proximaSesion date is in the past, move it to sesiones!
    if (data.proximaSesion && data.proximaSesion.fecha) {
      if (isSessionDatePassed(data.proximaSesion.fecha)) {
        const pastSes = {
          ...data.proximaSesion,
          id: data.proximaSesion.id || `ses_archived_${Date.now()}`,
          tipo: data.proximaSesion.citacionNumero || data.proximaSesion.tipo || "Sesión Ordinaria",
          completada: true
        };
        const alreadyIn = data.sesiones.some(s => s.id === pastSes.id || (s.fecha === pastSes.fecha && s.materia === pastSes.materia));
        if (!alreadyIn) {
          data.sesiones.unshift(pastSes);
          data.sesionesRealizadas = Math.max(data.sesionesRealizadas + 1, data.sesiones.length);
        }
        data.proximaSesion = undefined;
      }
    }

    setComision(data);
    if (data.periodo) {
      setActivePeriod(data.periodo);
    }
  };

  const handleOpenCitacionEditModal = () => {
    const current = comision?.proximaSesion;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const defaultDateISO = nextWeek.toISOString().split("T")[0];
    const defaultFechaStr = `Martes ${nextWeek.getDate()} de ${nextWeek.toLocaleString("es-CL", { month: "long" })} de ${nextWeek.getFullYear()}`;

    setCitacionEditForm({
      citacionNumero: current?.citacionNumero || current?.tipo || "Citación N° 85 (Sesión Ordinaria)",
      fecha: current?.fecha || defaultFechaStr,
      fechaInput: defaultDateISO,
      hora: current?.hora || "10:30 a 13:00 hrs.",
      lugar: current?.lugar || (isSenado ? "Sala N° 3 de Comisiones del Senado (Valparaíso)" : "Sala N° 311 de la Cámara (Valparaíso)"),
      materia: current?.materia || (comision?.proyectos && comision.proyectos.length > 0 ? `Continuar con el estudio del Boletín N° ${comision.proyectos[0].id}: ${comision.proyectos[0].titulo}.` : "Continuar tramitación de iniciativas legales en tabla."),
      invitados: current?.invitados || "Ministros de Estado del ramo sectorial, Subsecretarios y expositores invitados.",
      tablaText: Array.isArray(current?.tabla) && current.tabla.length > 0 
        ? current.tabla.join("\n") 
        : (comision?.proyectos && comision.proyectos.length > 0 ? `1. Boletín N° ${comision.proyectos[0].id}: ${comision.proyectos[0].titulo}` : "1. Discusión y votación de iniciativas en tabla."),
      secretario: current?.secretario || (isSenado ? "Abogado/a Secretario/a del Senado" : "Abogado/a Secretario/a de la Cámara"),
      pasteRawText: ""
    });
    setIsEditingCitacionModal(true);
  };

  const handleOpenCompleteSessionModal = (ses: SesionItem) => {
    setSessionToComplete(ses);
    setSessionCompleteForm({
      actaTexto: ses.actaTexto || customSummaries[ses.id] || `En esta sesión, la Comisión debatió sobre ${ses.materia}. Se escuchó la exposición de las autoridades y se revisaron las indicaciones formuladas al proyecto de ley.`,
      acuerdosTexto: ses.acuerdosTexto && ses.acuerdosTexto.length > 0 
        ? ses.acuerdosTexto.join("\n") 
        : "1. Se aprueba la propuesta de redacción del artículo en debate.\n2. Se fija plazo para recibir sugerencias de enmiendas.",
      invitadosExpositores: ses.invitados || "Representantes del Ejecutivo y especialistas técnicos.",
      videoUrl: ses.videoUrl || "",
      boletinesTratados: extractBoletinId(ses.materia) || (comision?.proyectos && comision.proyectos.length > 0 ? comision.proyectos[0].id : "")
    });
  };

  const handleSaveCompleteSession = () => {
    if (!sessionToComplete || !comision) return;

    const acuerdosArr = sessionCompleteForm.acuerdosTexto
      .split("\n")
      .map(a => a.trim())
      .filter(Boolean);

    const updatedSesion: SesionItem = {
      ...sessionToComplete,
      actaTexto: sessionCompleteForm.actaTexto.trim(),
      acuerdosTexto: acuerdosArr,
      acuerdosCount: Math.max(sessionToComplete.acuerdosCount || 0, acuerdosArr.length),
      invitados: sessionCompleteForm.invitadosExpositores.trim(),
      videoUrl: sessionCompleteForm.videoUrl.trim(),
      completada: true
    };

    const updatedSesiones = comision.sesiones.map(s => s.id === sessionToComplete.id ? updatedSesion : s);

    const updatedComision: Comision = {
      ...comision,
      sesiones: updatedSesiones,
      sesionesRealizadas: Math.max(comision.sesionesRealizadas, updatedSesiones.length),
      audienciasSostenidas: comision.audienciasSostenidas + 1
    };

    setComision(updatedComision);

    // Save to localStorage
    const savedCompletedSesKey = `completed_sesiones_${comision.id}`;
    let savedCompleted: SesionItem[] = [];
    try {
      const stored = localStorage.getItem(savedCompletedSesKey);
      if (stored) savedCompleted = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    savedCompleted = savedCompleted.filter(s => s.id !== updatedSesion.id);
    savedCompleted.unshift(updatedSesion);
    localStorage.setItem(savedCompletedSesKey, JSON.stringify(savedCompleted));

    // Also update customSummaries
    if (sessionCompleteForm.actaTexto.trim()) {
      const nextSummaries = {
        ...customSummaries,
        [sessionToComplete.id]: sessionCompleteForm.actaTexto.trim()
      };
      setCustomSummaries(nextSummaries);
      localStorage.setItem(`summaries_${comision.id}`, JSON.stringify(nextSummaries));
    }

    setSessionCompleteSuccess(true);
    setTimeout(() => {
      setSessionCompleteSuccess(false);
      setSessionToComplete(null);
    }, 1500);
  };

  const handleParseRawCitacion = (rawText: string) => {
    if (!rawText.trim()) return;

    let citNumero = citacionEditForm.citacionNumero;
    let fecha = citacionEditForm.fecha;
    let hora = citacionEditForm.hora;
    let lugar = citacionEditForm.lugar;
    let materia = citacionEditForm.materia;
    let invitados = citacionEditForm.invitados;
    let secretario = citacionEditForm.secretario;

    // Citación N°
    const citMatch = rawText.match(/(?:Citaci[oó]n|Sesi[oó]n|N[°º])\s*(?:N[°º])?\s*(\d+[^\n\r,]*)/i);
    if (citMatch) {
      citNumero = `Citación N° ${citMatch[1].trim()}`;
    }

    // Fecha
    const fechaMatch = rawText.match(/(?:Fecha|D[ií]a)\s*:?\s*([^\n\r]+)/i) ||
                       rawText.match(/((?:Lunes|Martes|Mi[eé]rcoles|Jueves|Viernes|S[aá]bado|Domingo|\d{1,2})\s+\d{1,2}\s+de\s+[a-zA-ZáéíóúÁÉÍÓÚ]+\s+de\s+\d{4})/i);
    if (fechaMatch) {
      fecha = fechaMatch[1].trim();
    }

    // Hora
    const horaMatch = rawText.match(/(?:Hora|Horario)\s*:?\s*([^\n\r]+)/i) ||
                      rawText.match(/(\d{1,2}:\d{2}\s*(?:a|-|–)\s*\d{1,2}:\d{2}\s*(?:hrs|horas)?)/i);
    if (horaMatch) {
      hora = horaMatch[1].trim();
    }

    // Lugar / Sala
    const lugarMatch = rawText.match(/(?:Lugar|Sala)\s*:?\s*([^\n\r]+)/i);
    if (lugarMatch) {
      lugar = lugarMatch[1].trim();
    }

    // Objeto / Materia
    const materiaMatch = rawText.match(/(?:Objeto|Materia)\s*:?\s*([\s\S]*?)(?=(?:Invitados|Expositores|Secretar|Tabla|$))/i);
    if (materiaMatch) {
      materia = materiaMatch[1].trim();
    }

    // Invitados
    const invMatch = rawText.match(/(?:Invitados|Expositores)\s*:?\s*([\s\S]*?)(?=(?:Secretar|Tabla|Objeto|$))/i);
    if (invMatch) {
      invitados = invMatch[1].trim();
    }

    // Secretario
    const secMatch = rawText.match(/(?:Secretar[ií]a|Secretario)\s*:?\s*([^\n\r]+)/i);
    if (secMatch) {
      secretario = secMatch[1].trim();
    }

    setCitacionEditForm(prev => ({
      ...prev,
      citacionNumero: citNumero,
      fecha: fecha,
      hora: hora,
      lugar: lugar,
      materia: materia || rawText.trim(),
      invitados: invitados,
      tablaText: materia || rawText.trim(),
      secretario: secretario,
      pasteRawText: rawText
    }));
  };

  const handleSaveCitacionModal = () => {
    if (!comision) return;

    const tablaArray = citacionEditForm.tablaText
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    const updatedProximaSesion = {
      id: comision.proximaSesion?.id || `s_next_${comisionId}`,
      citacionNumero: citacionEditForm.citacionNumero.trim(),
      tipo: citacionEditForm.citacionNumero.trim(),
      fecha: citacionEditForm.fecha.trim(),
      hora: citacionEditForm.hora.trim(),
      lugar: citacionEditForm.lugar.trim(),
      materia: citacionEditForm.materia.trim(),
      invitados: citacionEditForm.invitados.trim(),
      secretario: citacionEditForm.secretario.trim(),
      tabla: tablaArray.length > 0 ? tablaArray : [citacionEditForm.materia.trim()],
      acuerdosCount: comision.proximaSesion?.acuerdosCount || 0
    };

    const updatedComision = {
      ...comision,
      proximaSesion: updatedProximaSesion
    };

    setComision(updatedComision);
    localStorage.setItem(`citacion_${comisionId}`, JSON.stringify(updatedProximaSesion));
    setIsEditingCitacionModal(false);
  };

  const handleResetCitacionModal = () => {
    localStorage.removeItem(`citacion_${comisionId}`);
    fetch(`/api/comision/${comisionId}?refresh=true`)
      .then(res => res.json())
      .then((data: Comision) => {
        setComision(data);
        setIsEditingCitacionModal(false);
      });
  };

  const extractBoletinId = (text: string) => {
    const match = text.match(/\d+[\.\d]*-\d+/);
    return match ? match[0] : "";
  };

  const handleSaveSubpageSummary = (ses: SesionItem) => {
    const summaryTrimmed = subpageSummaryText.trim();
    
    // 1. Save to commission's customSummaries
    const nextComSummaries = {
      ...customSummaries,
      [ses.id]: summaryTrimmed
    };
    setCustomSummaries(nextComSummaries);
    localStorage.setItem(`summaries_${comisionId}`, JSON.stringify(nextComSummaries));

    // 2. Determine target Boletín N° to associate
    const targetBoletin = showCustomBoletinInput ? customLinkedBoletinId.trim() : linkedBoletinId;
    
    if (targetBoletin) {
      // 3. Save to global list of summaries for that project/boletin
      const savedProyKey = `proyecto_summaries_${targetBoletin}`;
      let proySummaries: any[] = [];
      try {
        const existing = localStorage.getItem(savedProyKey);
        if (existing) {
          proySummaries = JSON.parse(existing);
        }
      } catch (e) {
        console.error("Error reading project summaries", e);
      }

      // Filter out any older summary of this same session to avoid duplicates
      proySummaries = proySummaries.filter((item: any) => item.sessionId !== ses.id);

      if (summaryTrimmed) {
        proySummaries.unshift({
          sessionId: ses.id,
          sessionMateria: ses.materia,
          sessionFecha: ses.fecha,
          sessionTipo: ses.tipo,
          comisionId: comisionId,
          comisionNombre: comision?.nombre || "Comisión Técnica",
          summaryText: summaryTrimmed,
          timestamp: Date.now()
        });
      }

      localStorage.setItem(savedProyKey, JSON.stringify(proySummaries));
    }

    setSubpageSavedSuccess(true);
    setTimeout(() => {
      setSubpageSavedSuccess(false);
    }, 4000);
  };

  const startSubpageVoiceDictation = () => {
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
        setSubpageIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setSubpageSummaryText(prev => prev + (prev ? " " : "") + transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        setSubpageIsRecording(false);
      };

      rec.onend = () => {
        setSubpageIsRecording(false);
      };

      (window as any).subpage_recognition = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setSubpageIsRecording(false);
    }
  };

  const stopSubpageVoiceDictation = () => {
    if ((window as any).subpage_recognition) {
      try {
        (window as any).subpage_recognition.stop();
      } catch (e) {}
      (window as any).subpage_recognition = null;
    }
    setSubpageIsRecording(false);
  };

  const suggestSubpageAISummary = (ses: SesionItem) => {
    setSubpageSummaryText("Generando propuesta de síntesis legislativa por IA...");
    const extracted = ses.materia?.match(/\b\d{1,5}\.\d{1,3}-\d{2}\b/)?.[0];
    const targetBoletin = showCustomBoletinInput ? customLinkedBoletinId : (linkedBoletinId || extracted || comision?.proyectos?.[0]?.id || comision?.proyectosIds?.[0] || "16.100-01");

    fetch("/api/comisiones/sesion/generar-informe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comisionId,
        comisionNombre: comision?.nombre,
        sesionId: ses.id,
        sesionMateria: ses.materia,
        sesionFecha: ses.fecha,
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
            .slice(0, 4)
            .join(". ") + ".";
          setSubpageSummaryText(summaryProposal);
        } else {
          setSubpageSummaryText("No se pudo obtener una sugerencia en este momento. Intente redactarla manualmente.");
        }
      })
      .catch(err => {
        console.error("Error generating AI summary", err);
        setSubpageSummaryText("Error de red al consultar la IA. Ingrese el resumen de forma manual.");
      });
  };

  useEffect(() => {
    const saved = localStorage.getItem(`summaries_${comisionId}`);
    if (saved) {
      try {
        setCustomSummaries(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing custom summaries", e);
      }
    } else {
      setCustomSummaries({});
    }
  }, [comisionId]);

  const handleOpenSubpageForSession = (ses: SesionItem) => {
    setSelectedSesionForSubpage(ses);
    setSubpageSummaryText(customSummaries[ses.id] || "");
    const extracted = extractBoletinId(ses.materia);
    if (extracted) {
      setLinkedBoletinId(extracted);
      setShowCustomBoletinInput(false);
    } else if (comision?.proyectos && comision.proyectos.length > 0) {
      setLinkedBoletinId(comision.proyectos[0].id);
      setShowCustomBoletinInput(false);
    } else {
      setLinkedBoletinId("");
      setShowCustomBoletinInput(true);
    }
  };

  const handleOpenSummaryModal = (ses: SesionItem) => {
    setSelectedSesionForSummary(ses);
    setSummaryText(customSummaries[ses.id] || "");
    setIsRecording(false);
  };

  const handleDeleteSummary = (sesId: string) => {
    if (confirm("¿Está seguro de querer eliminar este resumen?")) {
      const next = { ...customSummaries };
      delete next[sesId];
      setCustomSummaries(next);
      localStorage.setItem(`summaries_${comisionId}`, JSON.stringify(next));
    }
  };

  const handleSaveSummary = () => {
    if (!selectedSesionForSummary) return;
    const next = {
      ...customSummaries,
      [selectedSesionForSummary.id]: summaryText.trim()
    };
    setCustomSummaries(next);
    localStorage.setItem(`summaries_${comisionId}`, JSON.stringify(next));
    setSelectedSesionForSummary(null);
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

  const suggestAISummary = () => {
    if (!selectedSesionForSummary) return;
    setSummaryText("Generando propuesta de síntesis legislativa por IA...");
    const extracted = selectedSesionForSummary.materia?.match(/\b\d{1,5}\.\d{1,3}-\d{2}\b/)?.[0];
    const targetBoletin = extracted || (comision?.proyectos?.[0]?.id) || (comision?.proyectosIds?.[0]) || "16.100-01";

    fetch("/api/comisiones/sesion/generar-informe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comisionId,
        comisionNombre: comision?.nombre,
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
            .join(". ") + ".";
          setSummaryText(summaryProposal);
        } else {
          setSummaryText(`En la sesión de la comisión "${comision?.nombre || "Legislativa"}" de fecha ${selectedSesionForSummary.fecha}, se debatió e informó sobre la materia: "${selectedSesionForSummary.materia}". Se registraron un total de ${selectedSesionForSummary.acuerdosCount} acuerdos relevantes con la presencia de expositores e invitados: ${selectedSesionForSummary.invitados || "no indicados"}.`);
        }
      })
      .catch(() => {
        setSummaryText(`En la sesión de la comisión "${comision?.nombre || "Legislativa"}" de fecha ${selectedSesionForSummary.fecha}, se debatió e informó sobre la materia: "${selectedSesionForSummary.materia}". Se registraron un total de ${selectedSesionForSummary.acuerdosCount} acuerdos relevantes con la presencia de expositores e invitados: ${selectedSesionForSummary.invitados || "no indicados"}.`);
      });
  };

  const [activeTab, setActiveTab] = useState<"resumen" | "proyectos" | "sesiones" | "integrantes" | "audiencias">("resumen");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("todos");
  const [sessionSearch, setSessionSearch] = useState("");

  const handleBentoClick = (tab: "resumen" | "proyectos" | "sesiones" | "integrantes" | "audiencias") => {
    setActiveTab(tab);
  };

  const handleOpenReportModal = async (ses: SesionItem) => {
    setSelectedSesionForReport(ses);
    const query = `Sesión ${comision?.nombre || "Comisión"} ${ses.fecha}`;
    setSearchQuery(query);
    setSearchResults([]);
    setSelectedVideo(null);
    setGeneratedReport(null);
    setViewerCurrentPage(1);
    setGeneratingReport(true);
    setSearchLoading(true);
    
    // 1. Automatically detect bulletin from ses.materia or comision
    let finalBoletinId = "";
    const match = ses.materia.match(/\b\d{1,5}\.\d{1,3}-\d{2}\b/);
    if (match) {
      finalBoletinId = match[0];
    } else if (comision?.proyectos && comision.proyectos.length > 0) {
      finalBoletinId = comision.proyectos[0].id;
    } else if (comision?.proyectosIds && comision.proyectosIds.length > 0) {
      finalBoletinId = comision.proyectosIds[0];
    } else {
      finalBoletinId = "16.100-01";
    }

    if (comision?.proyectosIds?.includes(finalBoletinId)) {
      setReportBoletinId(finalBoletinId);
      setCustomBoletin(false);
    } else {
      setCustomReportBoletinId(finalBoletinId);
      setReportBoletinId(finalBoletinId);
      setCustomBoletin(true);
    }

    try {
      // 2. Automatically search YouTube video
      const ytRes = await fetch(`/api/comisiones/sesion/youtube-search?query=${encodeURIComponent(comision?.nombre || "Comisión")}&fecha=${encodeURIComponent(ses.fecha)}&camara=${isSenado ? 'senado' : 'diputados'}`);
      const ytData = await ytRes.json();
      const videos = ytData.videos || [];
      setSearchResults(videos);
      setSearchLoading(false);

      if (videos.length > 0) {
        const video = videos[0];
        setSelectedVideo(video);

        // 3. Automatically perform summary generation/report
        const genRes = await fetch("/api/comisiones/sesion/generar-informe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comisionId,
            comisionNombre: comision?.nombre,
            sesionId: ses.id,
            sesionMateria: ses.materia,
            sesionFecha: ses.fecha,
            boletinId: finalBoletinId,
            videoId: video.id,
            videoTitle: video.title
          })
        });

        const genData = await genRes.json();
        if (!genRes.ok) {
          throw new Error(genData.error || "Fallo en la generación");
        }

        setGeneratedReport(genData.documento || genData);
      } else {
        throw new Error("No se encontraron videos disponibles para procesar la sesión.");
      }
    } catch (err: any) {
      console.error("Automated flow error:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const executeYouTubeSearch = () => {
    if (!selectedSesionForReport) return;
    setSearchLoading(true);
    fetch(`/api/comisiones/sesion/youtube-search?query=${encodeURIComponent(comision?.nombre || "Comisión")}&fecha=${encodeURIComponent(selectedSesionForReport.fecha)}&camara=${isSenado ? 'senado' : 'diputados'}`)
      .then(res => res.json())
      .then(data => {
        setSearchResults(data.videos || []);
        if (data.videos && data.videos.length > 0) {
          setSelectedVideo(data.videos[0]);
        }
        setSearchLoading(false);
      })
      .catch(err => {
        console.error("YouTube search error:", err);
        setSearchLoading(false);
      });
  };

  const handleGenerateReport = () => {
    if (!selectedSesionForReport || !selectedVideo) return;
    const finalBoletinId = customBoletin ? customReportBoletinId.trim() : reportBoletinId;
    if (!finalBoletinId) {
      alert("Por favor ingresa o selecciona un número de Boletín (boletínId) para asociar el informe.");
      return;
    }

    setGeneratingReport(true);
    fetch("/api/comisiones/sesion/generar-informe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comisionId,
        comisionNombre: comision?.nombre,
        sesionId: selectedSesionForReport.id,
        sesionMateria: selectedSesionForReport.materia,
        sesionFecha: selectedSesionForReport.fecha,
        boletinId: finalBoletinId,
        videoId: selectedVideo.id,
        videoTitle: selectedVideo.title
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Fallo en la generación");
        }
        return data;
      })
      .then(data => {
        setGeneratedReport(data.documento);
        setViewerCurrentPage(1);
        setGeneratingReport(false);
      })
      .catch(err => {
        alert("Ocurrió un error al generar el informe con IA: " + err.message);
        setGeneratingReport(false);
      });
  };

  function parseAndRenderMarkdown(markdownText: string) {
    if (!markdownText) return null;
    const lines = markdownText.split("\n");
    return lines.map((line, key) => {
      let text = line.trim();
      if (text === "") return <div key={key} className="h-2" />;
      if (text === "---") return <hr key={key} className="my-3 border-t border-slate-200" />;
      if (text.startsWith("# ")) {
        return <h1 key={key} className="text-sm font-extrabold text-slate-900 tracking-tight mt-4 mb-2 uppercase border-b border-slate-100 pb-1 font-sans">{text.substring(2)}</h1>;
      }
      if (text.startsWith("## ")) {
        return <h2 key={key} className="text-xs font-bold text-slate-800 tracking-tight mt-3 mb-1.5 font-sans">{text.substring(3)}</h2>;
      }
      if (text.startsWith("### ")) {
        return <h3 key={key} className="text-[10px] font-bold text-slate-700 tracking-tight mt-2 mb-1 uppercase font-mono">{text.substring(4)}</h3>;
      }
      if (text.startsWith("* ") || text.startsWith("- ")) {
        return (
          <li key={key} className="ml-4 list-disc text-[11px] text-slate-600 leading-relaxed font-sans py-0.5">
            {renderTextWithBold(text.substring(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(text)) {
        const listText = text.replace(/^\d+\.\s/, "");
        return (
          <li key={key} className="ml-4 list-decimal text-[11px] text-slate-600 leading-relaxed font-sans py-0.5">
            {renderTextWithBold(listText)}
          </li>
        );
      }
      return (
        <p key={key} className="text-[11px] text-slate-600 leading-relaxed font-sans my-1.5 align-middle">
          {renderTextWithBold(text)}
        </p>
      );
    });
  }

  function renderTextWithBold(text: string) {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-extrabold text-slate-900">{part}</strong>;
      }
      return part;
    });
  }

  useEffect(() => {
    setLoading(true);
    fetch(`/api/comision/${comisionId}`)
      .then(res => res.json())
      .then((data: Comision) => {
        applySessionDatesAndState(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading commission details:", err);
        setLoading(false);
      });
  }, [comisionId]);

  const isSenado = comisionId.startsWith("senado") || (comision?.periodo ? comision.periodo.toLowerCase().includes("senado") : false);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto w-full px-6 py-12 text-center text-gray-400">
        Cargando datos extendidos de la Comisión...
      </div>
    );
  }

  if (!comision) {
    return (
      <div className="max-w-[1440px] mx-auto w-full px-6 py-12 text-center text-gray-500">
        Comisión de Trabajo {comisionId} no encontrada.
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto w-full px-6 py-6 flex flex-col gap-5"
    >
      {selectedSesionForSubpage ? (
        (() => {
          const ses = selectedSesionForSubpage;
          const tablaItems = ses.tabla || [
            `1. Discusión y votación en particular del articulado de la iniciativa legal referida a ${comision?.nombre.replace("Comisión de", "") || "materias del sector"}.`,
            `2. Audiencia con representantes del Ejecutivo y asesores técnicos para abordar observaciones específicas presentadas.`,
            `3. Varios y resoluciones internas de la mesa.`
          ];
          return (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-5 duration-300">
              {/* Breadcrumb Back Navigation */}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    stopSubpageVoiceDictation();
                    setSelectedSesionForSubpage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer self-start"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver a {showAllSessionsSubpage ? "Sesiones y Trabajo" : `Comisión (${comision?.nombre})`}</span>
                </button>
              </div>

              {/* Title Block */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono font-extrabold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/30 rounded-full shadow-xs">
                    Detalle de Citación de Sesión y Bitácora
                  </span>
                  <h1 className="text-2xl font-extrabold text-slate-900 mt-2 flex items-center gap-2 tracking-tight">
                    <span>Cédula de Citación Legislativa</span>
                    <Calendar className="w-5.5 h-5.5 text-slate-400 shrink-0" />
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Consulte la pauta oficial y registre el resumen de lo acontecido en esta sesión legislativa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Official Citation/Summons Document (5 cols) */}
                <div className="lg:col-span-5 bg-stone-50 p-6 md:p-8 rounded-2xl border border-stone-200 shadow-md flex flex-col justify-between font-serif relative overflow-hidden min-h-[500px]">
                  {/* Background Seal Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <svg className="w-72 h-72 text-stone-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93V4.07z" />
                    </svg>
                  </div>

                  <div className="relative z-10 space-y-6">
                    {/* Header Letterhead */}
                    <div className="border-b-2 border-stone-800 pb-3 flex justify-between items-start text-[10px] font-sans font-extrabold tracking-wide text-stone-700">
                      <div>
                        <span className="block uppercase text-[9px]">REPÚBLICA DE CHILE</span>
                        <span className="block uppercase text-[#003366] text-[8px] font-bold">CONGRESO NACIONAL</span>
                      </div>
                      <div className="text-right">
                        <span className="block uppercase font-mono text-[9px]">CÉDULA N° {ses.id.replace("s_gen_", "").toUpperCase()}</span>
                        <span className="block bg-stone-200/75 px-1 rounded mt-0.5 text-stone-600 font-sans text-[8px]">VISTA</span>
                      </div>
                    </div>

                    {/* Title of Document */}
                    <div className="text-center space-y-1">
                      <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">CONVOCATORIA Y CITACIÓN</h2>
                      <p className="text-[10px] font-sans font-bold text-stone-600 uppercase tracking-widest">{comision?.nombre}</p>
                    </div>

                    {/* Metadata Fields */}
                    <div className="space-y-3 font-sans text-xs">
                      <div className="grid grid-cols-3 gap-2 border-b border-stone-200/60 pb-1.5">
                        <span className="text-stone-500 font-bold uppercase text-[9px]">Fecha y Hora:</span>
                        <span className="col-span-2 font-bold text-stone-800">{ses.fecha} — {ses.hora || "10:30"} Hrs.</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-b border-stone-200/60 pb-1.5">
                        <span className="text-stone-500 font-bold uppercase text-[9px]">Lugar:</span>
                        <span className="col-span-2 font-bold text-stone-800">Sala N°2, Valparaíso (Sistema Mixto)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-b border-stone-200/60 pb-1.5">
                        <span className="text-stone-500 font-bold uppercase text-[9px]">Tipo Sesión:</span>
                        <span className="col-span-2 font-bold text-emerald-700">{ses.tipo}</span>
                      </div>
                      {ses.invitados && (
                        <div className="grid grid-cols-3 gap-2 border-b border-stone-200/60 pb-1.5">
                          <span className="text-stone-500 font-bold uppercase text-[9px]">Expositores:</span>
                          <span className="col-span-2 text-stone-700 leading-tight">{ses.invitados}</span>
                        </div>
                      )}
                    </div>

                    {/* Order of the Day / Agenda Table */}
                    <div className="space-y-2">
                      <span className="block font-sans font-extrabold text-[9px] uppercase tracking-wider text-stone-500">Orden del Día / Tabla de la Sesión:</span>
                      <ul className="list-decimal pl-4 text-[11px] text-stone-850 leading-relaxed space-y-2 font-serif font-medium">
                        {tablaItems.map((item, index) => (
                          <li key={index} className="pl-1">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-4 mt-8 shrink-0 flex justify-between items-center text-[9px] font-sans font-bold text-stone-400 uppercase tracking-wide">
                    <span>Sello Oficial del Congreso</span>
                    <span>Chile Al Día</span>
                  </div>
                </div>

                {/* Right Column: Summary Form & Voice Dictation (7 cols) */}
                <div className="lg:col-span-7 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">Redactar Resumen de la Sesión</h3>
                        <p className="text-[10px] text-slate-500">Registre un resumen para la bitácora ciudadana de esta sesión.</p>
                      </div>
                    </div>

                    {/* Status alerts */}
                    {subpageSavedSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl p-3.5 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold">¡Resumen Guardado Exitosamente!</p>
                            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              El resumen se ha registrado en su Bitácora de la Comisión y se ha acumulado en el expediente del proyecto de ley.
                            </p>
                          </div>
                        </div>
                        {(showCustomBoletinInput ? customLinkedBoletinId : linkedBoletinId) && (
                          <div className="mt-2.5 flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProyectoId?.(showCustomBoletinInput ? customLinkedBoletinId : linkedBoletinId);
                                setView("proyecto-detail");
                              }}
                              className="bg-[#003366] hover:bg-slate-950 text-white text-[10px] font-bold py-1 px-2.5 rounded transition-all cursor-pointer"
                            >
                              Ir al Proyecto (Boletín N° {showCustomBoletinInput ? customLinkedBoletinId : linkedBoletinId})
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Voice Dictation Block */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-center sm:text-left">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 justify-center sm:justify-start">
                          {subpageIsRecording ? (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                          ) : (
                            <Mic className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>Dictado por Voz</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {subpageIsRecording ? "Escuchando voz activa... Hable ahora." : "Grabe directamente usando el micrófono."}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {subpageIsRecording ? (
                          <button
                            onClick={stopSubpageVoiceDictation}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Detener</span>
                          </button>
                        ) : (
                          <button
                            onClick={startSubpageVoiceDictation}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>Iniciar Dictado</span>
                          </button>
                        )}

                        <button
                          onClick={() => suggestSubpageAISummary(ses)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                          <span>Sugerir por IA</span>
                        </button>
                      </div>
                    </div>

                    {/* Text Area */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                        Resumen de la Sesión / Acta de Bitácora
                      </label>
                      <textarea
                        rows={8}
                        value={subpageSummaryText}
                        onChange={(e) => setSubpageSummaryText(e.target.value)}
                        placeholder="Escriba o dicte el resumen de lo acontecido en esta sesión. Se guardará directamente en su bitácora parlamentaria ciudadana..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 leading-relaxed placeholder-slate-400"
                      />
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[9px] text-slate-400">
                          {subpageSummaryText.length} caracteres
                        </span>
                        {subpageSummaryText && (
                          <button
                            onClick={() => setSubpageSummaryText("")}
                            className="text-[10px] text-slate-400 hover:text-blue-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Limpiar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Project Linkage Association Selector */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                      <label className="text-[10px] font-bold text-slate-600 uppercase block">
                        Vincular a un Proyecto de Ley / Boletín de Ley:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={showCustomBoletinInput ? "custom" : linkedBoletinId}
                          onChange={(e) => {
                            if (e.target.value === "custom") {
                              setShowCustomBoletinInput(true);
                            } else {
                              setShowCustomBoletinInput(false);
                              setLinkedBoletinId(e.target.value);
                            }
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- No Vincular a Proyecto --</option>
                          {(comision.proyectos || []).map(p => (
                            <option key={p.id} value={p.id}>
                              [Boletín {p.id}] {p.titulo.length > 55 ? p.titulo.slice(0, 55) + "..." : p.titulo}
                            </option>
                          ))}
                          <option value="custom">✍️ Escribir Boletín Personalizado...</option>
                        </select>

                        {showCustomBoletinInput && (
                          <input
                            type="text"
                            placeholder="Ej. 16.621-13"
                            value={customLinkedBoletinId}
                            onChange={(e) => setCustomLinkedBoletinId(e.target.value)}
                            className="w-full sm:w-40 bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 placeholder-slate-400 uppercase"
                          />
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        Al vincularlo a un Boletín, este resumen se acumulará de forma permanente dentro del expediente de dicho Proyecto de Ley en su sección <strong>"Resumen Sesiones"</strong>.
                      </p>
                    </div>

                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                    <button
                      onClick={() => {
                        stopSubpageVoiceDictation();
                        setSelectedSesionForSubpage(null);
                      }}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => handleSaveSubpageSummary(ses)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Guardar Resumen en Bitácora</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      ) : showAllSessionsSubpage ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-5 duration-300">
          {/* Breadcrumb back */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setShowAllSessionsSubpage(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer self-start"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a la Comisión ({comision.nombre})
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
              <div>
                <span className="text-[10px] uppercase font-mono font-extrabold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/30 rounded-full shadow-xs">
                  Historial de Sesiones y Trabajo Legislativo
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-2 flex items-center gap-2 tracking-tight">
                  <span>Sesiones y Trabajo</span>
                  <Clock className="w-5.5 h-5.5 text-slate-400 shrink-0" />
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Todas las actas, audiencias, invitados y documentos generados por IA para la {comision.nombre}.
                </p>
              </div>
            </div>
          </div>

          {/* Content list of all sessions as an integrated subpage */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Información Verificada de Sesiones de Comisión</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Las citaciones y materias registradas son contrastadas directamente con los portales del Congreso de Chile.
                </p>
              </div>
              <a 
                href={comision.officialUrl || (isSenado ? "https://www.senado.cl/actividad-legislativa/comisiones" : "https://www.camara.cl/legislacion/comisiones/comisiones_permanentes.aspx")} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors shrink-0 shadow-2xs"
              >
                <span>Ver Portal Oficial ({isSenado ? "Senado" : "Cámara"})</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(comision.sesiones || []).map((ses, idx) => {
                const hasSummary = !!customSummaries[ses.id];
                return (
                  <div 
                    key={ses.id} 
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400">{ses.fecha}</span>
                          <span className="bg-blue-50 text-blue-700 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase border border-blue-100/30">
                            {ses.tipo}
                          </span>
                        </div>
                        {hasSummary && (
                          <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Bitácora
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 leading-snug mt-2">
                        {ses.materia}
                      </h4>

                      <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-2">
                        <span className="font-semibold text-slate-600">Invitados:</span> {ses.invitados}
                      </p>

                      {hasSummary && (
                        <div className="mt-3 p-2.5 bg-amber-50/60 border border-amber-200/40 rounded-xl relative group">
                          <div className="text-[9px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between gap-1 mb-1">
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              Nota de Bitácora
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleOpenSubpageForSession(ses)}
                                className="text-[9px] text-amber-700 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                              >
                                Editar
                              </button>
                              <button 
                                onClick={() => handleDeleteSummary(ses.id)}
                                className="text-[9px] text-blue-650 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-normal font-sans italic line-clamp-3">
                            "{customSummaries[ses.id]}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100">
                      <div className="text-[9px] text-blue-700 font-bold bg-blue-50/60 border border-blue-100/30 px-2 py-0.5 rounded-md">
                        {ses.acuerdosCount} acuerdos
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenReportModal(ses)}
                          className="inline-flex items-center gap-1 bg-[#003366] hover:bg-blue-800 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                        >
                          <FileText className="w-2.5 h-2.5 text-blue-300" />
                          <span>Informe</span>
                        </button>

                        <button
                          onClick={() => handleOpenSubpageForSession(ses)}
                          className="inline-flex items-center gap-1 bg-emerald-650 hover:bg-emerald-700 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                        >
                          <Mic className="w-2.5 h-2.5 text-emerald-200" />
                          <span>Ver Citación y Resumen</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Executive Header Section */}
          <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5" id="comision-detail-header-panel">
            {/* Top row navigation & quick actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setView("comisiones")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver a Comisiones</span>
                </button>

                <span className={`text-[10px] uppercase font-mono font-extrabold px-3 py-1 rounded-full shadow-xs ${
                  isSenado 
                    ? "bg-slate-900 text-slate-100 border border-slate-750" 
                    : "bg-blue-600 text-white border border-blue-500"
                }`}>
                  {isSenado ? "🏛️ Senado de la República" : "🏛️ Cámara de Diputadas y Diputados"}
                </span>

                <span className="text-[11px] text-slate-500 font-bold font-mono hidden sm:inline">
                  {comision.periodo}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRefreshOfficialData}
                  disabled={refreshingOfficial}
                  className="font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Refrescar datos verídicos desde la web oficial"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-blue-600 ${refreshingOfficial ? "animate-spin" : ""}`} />
                  <span>{refreshingOfficial ? "Buscando..." : "Refrescar"}</span>
                </button>

                <a 
                  href={comision.officialUrl || (isSenado ? "https://www.senado.cl/actividad-legislativa/comisiones" : "https://www.camara.cl/legislacion/comisiones/comisiones_permanentes.aspx")} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{isSenado ? "senado.cl" : "camara.cl"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {toggleFollowCom && (() => {
                  const baseNombre = comision.nombre.replace(/\s*\((Cámara|Senado)\)\s*$/, "").trim();
                  const isFollowed = followedComs?.includes(comision.nombre) || followedComs?.includes(baseNombre);
                  return (
                    <button
                      onClick={() => toggleFollowCom(baseNombre)}
                      className={`font-bold text-xs px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                        isFollowed
                          ? "bg-amber-50 border-amber-300 text-amber-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFollowed ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
                      <span>{isFollowed ? "Siguiendo" : "Seguir"}</span>
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>{comision.nombre}</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-1.5 font-medium max-w-4xl leading-relaxed">
                {comision.descripcion}
              </p>
            </div>
          </div>



          {/* Primary View Mode Tabs Bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("resumen")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "resumen"
                  ? "bg-white text-slate-900 shadow-md border border-slate-200 font-black"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Resumen Ejecutivo</span>
            </button>

            <button
              onClick={() => setActiveTab("proyectos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "proyectos"
                  ? "bg-emerald-600 text-white shadow-md border border-emerald-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Proyectos en Trámite</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "proyectos" ? "bg-emerald-800 text-emerald-100" : "bg-slate-200 text-slate-700"
              }`}>
                {comision.proyectos?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sesiones")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "sesiones"
                  ? "bg-blue-600 text-white shadow-md border border-blue-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sesiones y Actas</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "sesiones" ? "bg-blue-800 text-blue-100" : "bg-slate-200 text-slate-700"
              }`}>
                {comision.sesiones?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("integrantes")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "integrantes"
                  ? "bg-indigo-600 text-white shadow-md border border-indigo-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Integrantes de la Mesa</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "integrantes" ? "bg-indigo-800 text-indigo-100" : "bg-slate-200 text-slate-700"
              }`}>
                {comision.integrantes?.length || 13}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("audiencias")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "audiencias"
                  ? "bg-amber-600 text-white shadow-md border border-amber-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Audiencias y Documentos</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "audiencias" ? "bg-amber-800 text-amber-100" : "bg-slate-200 text-slate-700"
              }`}>
                {comision.audienciasSostenidas || 48}
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: RESUMEN EJECUTIVO                                                  */}
          {/* ========================================================================= */}
          {activeTab === "resumen" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Citación Destacada o Estado Compacto */}
              {comision.proximaSesion ? (
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden" id="comision-citacion-box">
                  <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] pointer-events-none select-none">
                    <Landmark className="w-80 h-80 text-white" />
                  </div>

                  <div className="relative z-10 flex flex-col gap-5">
                    {/* Top Banner: Badges and Action Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{comision.proximaSesion.citacionNumero || comision.proximaSesion.tipo || "Citación Oficial de Sesión"}</span>
                        </span>
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{comision.proximaSesion.modalidad || (comision.proximaSesion.lugar?.toLowerCase().includes("telemát") ? "Sistema Híbrido" : "Presencial")}</span>
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>{getDaysRemaining(comision.proximaSesion.fecha)}</span>
                        </span>
                      </div>

                      {/* Quick Toolbar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleCopyCitacion(comision.proximaSesion!)}
                          className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Copiar texto oficial formateado para WhatsApp o correo electrónico"
                        >
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copiar</span>
                        </button>

                        <div className="flex items-center bg-white/10 border border-white/15 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleOpenGoogleCalendar(comision.proximaSesion!)}
                            className="hover:bg-white/20 text-slate-200 hover:text-white px-2.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border-r border-white/15"
                          >
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span>Google Cal</span>
                          </button>
                          <button
                            onClick={() => handleDownloadIcs(comision.proximaSesion!)}
                            className="hover:bg-white/20 text-slate-200 hover:text-white px-2.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>.ICS</span>
                          </button>
                        </div>

                        <button
                          onClick={handleOpenCitacionEditModal}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-950" />
                          <span>Editar Pauta</span>
                        </button>
                      </div>
                    </div>

                    {/* Coordinates & Agenda */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-6 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Fecha</span>
                            <p className="font-extrabold text-white mt-0.5">{comision.proximaSesion.fecha}</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Horario</span>
                            <p className="font-extrabold text-white mt-0.5">{comision.proximaSesion.hora || "10:30 a 13:00 hrs."}</p>
                          </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Lugar / Sala</span>
                          <p className="font-bold text-white">{comision.proximaSesion.lugar || "Valparaíso"}</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Materia Principal</span>
                          <p className="text-slate-200 font-medium leading-relaxed">{comision.proximaSesion.materia}</p>
                        </div>
                      </div>

                      <div className="lg:col-span-6 flex flex-col justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-white/10">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-2">
                            <ListTodo className="w-3.5 h-3.5" />
                            <span>Pauta de la Sesión ({Array.isArray(comision.proximaSesion.tabla) ? comision.proximaSesion.tabla.length : 1} puntos)</span>
                          </span>
                          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 text-xs text-slate-200">
                            {Array.isArray(comision.proximaSesion.tabla) ? (
                              comision.proximaSesion.tabla.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-white/5">
                                  <span className="font-mono text-amber-300 font-black shrink-0">{idx + 1}.</span>
                                  <span>{renderTablaItemWithBoletinChips(item, (bId) => { setSelectedProyectoId(bId); setView("proyecto-detail"); })}</span>
                                </div>
                              ))
                            ) : (
                              <p>{comision.proximaSesion.materia}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              const ses = comision.proximaSesion;
                              if (ses) {
                                setSelectedSesionForSubpage(ses);
                                setSubpageSummaryText(customSummaries[ses.id] || "");
                              }
                            }}
                            className="flex-1 bg-white hover:bg-slate-100 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-700" />
                            <span>Ver Cédula Oficial y Bitácora</span>
                          </button>
                          <button
                            onClick={() => handleOpenReportModal(comision.proximaSesion!)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5"
                          >
                            <Tv className="w-3.5 h-3.5 text-blue-200" />
                            <span>Transmisión & IA</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Compact Negative State Banner */
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Sin citaciones futuras pendientes</h4>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Todas las sesiones anteriores han sido completadas y archivadas en el historial.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenCitacionEditModal}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Programar Nueva Citación</span>
                  </button>
                </div>
              )}

              {/* 2-Column Overview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Presidencia y Temas de la Comisión (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Presidencia Spotlight */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Presidencia de la Comisión</span>
                      </h3>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                        Mesa Directiva
                      </span>
                    </div>

                    {(() => {
                      const pres = comision.integrantes?.find(i => i.rol && i.rol.toLowerCase().includes("president")) || comision.integrantes?.[0];
                      if (!pres) return <p className="text-xs text-slate-400">Sin presidente asignado</p>;
                      const partyStyle = getPartyBadgeStyle(pres.partido);
                      const initials = pres.nombre.replace(/^(Sr\.|Sra\.|Don|Doña)\s*/i, "").split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join("");

                      return (
                        <div 
                          onClick={() => setSelectedIntegranteModal(pres)}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs border shadow-xs ${partyStyle.bg} ${partyStyle.text} ${partyStyle.border}`}>
                              {initials || "MP"}
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {pres.nombre}
                              </h4>
                              <span className="text-[11px] text-slate-500 font-semibold">{pres.partido}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Competencias y Áreas Temáticas */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>Áreas Temáticas y Competencias</span>
                    </h3>

                    <div className="flex flex-wrap gap-1.5">
                      {(comision.temas || [
                        "Agricultura", "SAG", "INDAP", "Riego", "Silvicultura", "Desarrollo Rural", 
                        "Suelo Agrícola", "Sanidad Vegetal", "Alimentos", "Parcelaciones", "Comercio Agrícola"
                      ]).map((t, idx) => (
                        <span 
                          key={idx}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Proyectos Destacados en Tabla (7 cols) */}
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Proyectos Prioritarios en Tabla</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab("proyectos")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Ver los {comision.proyectos?.length || 0} proyectos</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(comision.proyectos || []).slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { setSelectedProyectoId(p.id); setView("proyecto-detail"); }}
                          className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Boletín {p.id}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                              p.estado === "En discusión" || p.estado === "En sala"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}>
                              {p.estado || "En estudio"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug">
                            {p.titulo}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{p.etapa || "Primer Trámite Constitucional"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("proyectos")}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Explorar cartera completa de proyectos de ley &rarr;
                  </button>
                </div>
              </div>

              {/* Bottom: Últimas Sesiones Realizadas */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Últimas Sesiones y Acuerdos de la Comisión</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab("sesiones")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Ver historial ({comision.sesiones?.length || 0})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(comision.sesiones || []).slice(0, 2).map((ses) => (
                    <div key={ses.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500">{ses.fecha}</span>
                          <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {ses.tipo}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {ses.materia}
                        </h4>
                        {ses.invitados && (
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                            <strong>Invitados:</strong> {ses.invitados}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleOpenSubpageForSession(ses)}
                          className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Ver Citación y Bitácora
                        </button>
                        <button
                          onClick={() => handleOpenCompleteSessionModal(ses)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                        >
                          Acta Oficial
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PROYECTOS EN TRÁMITE                                               */}
          {/* ========================================================================= */}
          {activeTab === "proyectos" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Buscar por boletín, título o materia..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {projectSearch && (
                    <button
                      onClick={() => setProjectSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {["todos", "En discusión", "En sala", "Primer Trámite"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setProjectStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        projectStatusFilter === st
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st === "todos" ? `Todos (${comision.proyectos?.length || 0})` : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Width Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider bg-slate-50/80">
                      <th className="py-3 px-3">Boletín</th>
                      <th className="py-3 px-3">Iniciativa / Título del Proyecto</th>
                      <th className="py-3 px-3">Etapa Constitucional</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                      <th className="py-3 px-3">Última Actividad</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const list = (comision.proyectos || []).filter(p => {
                        const q = projectSearch.toLowerCase();
                        const matchQ = !projectSearch || p.id.toLowerCase().includes(q) || p.titulo.toLowerCase().includes(q);
                        const matchSt = projectStatusFilter === "todos" || 
                          (projectStatusFilter === "Primer Trámite" ? (p.etapa && p.etapa.includes("Primer")) : p.estado === projectStatusFilter);
                        return matchQ && matchSt;
                      });

                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-medium italic">
                              No se encontraron proyectos que coincidan con la búsqueda o filtro aplicado.
                            </td>
                          </tr>
                        );
                      }

                      return list.map((p) => {
                        const latestAct = p.timeline && p.timeline.length > 0 ? p.timeline[0] : null;
                        return (
                          <tr 
                            key={p.id}
                            onClick={() => { setSelectedProyectoId(p.id); setView("proyecto-detail"); }}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                          >
                            <td className="py-3.5 px-3 font-mono font-extrabold text-blue-600 whitespace-nowrap">
                              Boletín {p.id}
                            </td>
                            <td className="py-3.5 px-3 max-w-[360px]">
                              <p className="font-bold text-slate-900 group-hover:text-blue-700 leading-snug transition-colors">
                                {p.titulo}
                              </p>
                            </td>
                            <td className="py-3.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                              {p.etapa || "Primer Trámite Constitucional"}
                            </td>
                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 border text-[9px] font-bold rounded-full uppercase ${
                                p.estado === "En discusión" || p.estado === "En sala"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}>
                                {p.estado || "En estudio"}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                              {latestAct ? latestAct.fecha : p.fechaIngreso}<br />
                              <span className="text-[9px] text-slate-400 font-medium uppercase">{latestAct ? latestAct.titulo : "Ingreso"}</span>
                            </td>
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProyectoId(p.id);
                                  setView("proyecto-detail");
                                }}
                                className="bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-[11px] px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                Ver Expediente &rarr;
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SESIONES Y ACTAS                                                   */}
          {/* ========================================================================= */}
          {activeTab === "sesiones" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Historial Cronológico de Sesiones Legislativas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actas, citaciones, audiencias y bitácoras registradas de la {comision.nombre}.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    placeholder="Buscar en materias o invitados..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sessions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(comision.sesiones || []).filter(s => {
                  if (!sessionSearch) return true;
                  const q = sessionSearch.toLowerCase();
                  return s.materia.toLowerCase().includes(q) || (s.invitados && s.invitados.toLowerCase().includes(q)) || s.fecha.toLowerCase().includes(q);
                }).map((ses) => {
                  const hasSummary = !!customSummaries[ses.id];
                  return (
                    <div 
                      key={ses.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500">{ses.fecha}</span>
                            <span className="bg-blue-50 text-blue-700 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase border border-blue-100">
                              {ses.tipo}
                            </span>
                          </div>
                          {hasSummary && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>Bitácora</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                          {ses.materia}
                        </h4>

                        {ses.invitados && (
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            <strong className="text-slate-700">Invitados:</strong> {ses.invitados}
                          </p>
                        )}

                        <div className="text-[10px] text-blue-700 font-bold bg-blue-50/60 border border-blue-100/30 px-2 py-1 rounded-md w-max">
                          {ses.acuerdosCount} Acuerdos adoptados
                        </div>

                        {hasSummary && (
                          <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl relative group">
                            <div className="text-[9px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between gap-1 mb-1">
                              <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                Nota de Bitácora
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button 
                                  onClick={() => handleOpenSubpageForSession(ses)}
                                  className="text-[9px] text-amber-700 hover:underline flex items-center gap-0.5"
                                >
                                  <Edit2 className="w-2.5 h-2.5" /> Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteSummary(ses.id)}
                                  className="text-[9px] text-rose-600 hover:underline flex items-center gap-0.5"
                                >
                                  <Trash2 className="w-2.5 h-2.5" /> Borrar
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed italic">
                              &ldquo;{customSummaries[ses.id]}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Clean visible Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleOpenSubpageForSession(ses)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Mic className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Cédula y Bitácora</span>
                        </button>

                        <button
                          onClick={() => handleOpenCompleteSessionModal(ses)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-950" />
                          <span>{ses.completada || ses.actaTexto ? "Editar Acta" : "Acta Oficial"}</span>
                        </button>

                        <button
                          onClick={() => handleOpenReportModal(ses)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Informe generado por IA con transmisión YouTube"
                        >
                          <Tv className="w-3.5 h-3.5 text-blue-300" />
                          <span>Informe IA</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: INTEGRANTES DE LA MESA                                             */}
          {/* ========================================================================= */}
          {activeTab === "integrantes" && (() => {
            const allIntegrantes = comision.integrantes || [];
            const presIntegrante = allIntegrantes.find(i => i.rol && i.rol.toLowerCase().includes("president")) || allIntegrantes[0];
            const secretarioText = comision.proximaSesion?.secretario || (isSenado ? "Rodrigo Pineda Garfias (Abogado Secretario)" : "Patricio Velásquez Weitzel (Abogado Secretario)");

            const partyCounts: Record<string, number> = {};
            allIntegrantes.forEach(i => {
              const p = i.partido || "IND";
              partyCounts[p] = (partyCounts[p] || 0) + 1;
            });

            const filteredIntegrantes = allIntegrantes.filter(i => {
              if (!memberSearchFilter.trim()) return true;
              const q = memberSearchFilter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              const n = i.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              const p = (i.partido || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              const r = (i.rol || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              return n.includes(q) || p.includes(q) || r.includes(q);
            });

            return (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* 1. MESA DIRECTIVA & VERIFICACIÓN OFICIAL */}
                <div className="bg-gradient-to-br from-slate-900 via-[#002b49] to-[#001f35] rounded-2xl p-6 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>Mesa Directiva Oficial</span>
                        </span>
                        <span className="text-[11px] text-slate-300 font-semibold">
                          {isSenado ? "Senado de la República" : "Cámara de Diputadas y Diputados de Chile"}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white tracking-tight">
                        Estructura de la Mesa y Nómina Parlamentaria
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                        Nómina oficial de {allIntegrantes.length} parlamentarios titulares y secretaría técnica de la {comision.nombre}.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <a
                        href={comision.officialUrl || (isSenado ? "https://www.senado.cl" : "https://www.camara.cl/legislacion/comisiones/")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-blue-400/30"
                        title="Verificar nómina oficial y transmisiones en vivo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verificar en {isSenado ? "Senado.cl" : "Cámara.cl"}</span>
                      </a>
                      <button
                        onClick={handleRefreshOfficialData}
                        disabled={refreshingOfficial}
                        className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
                        title="Actualizar datos desde el Congreso"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${refreshingOfficial ? "animate-spin text-blue-300" : ""}`} />
                        <span>{refreshingOfficial ? "Sincronizando..." : "Sincronizar"}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2 Destacados: Presidencia y Secretaría */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {/* Presidencia */}
                    {presIntegrante && (() => {
                      const partyStyle = getPartyBadgeStyle(presIntegrante.partido);
                      const initials = presIntegrante.nombre.replace(/^(Sr\.|Sra\.|Don|Doña)\s*/i, "").split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join("");
                      return (
                        <div 
                          onClick={() => setSelectedIntegranteModal(presIntegrante)}
                          className="bg-white/10 hover:bg-white/15 border border-amber-400/40 rounded-xl p-4 transition-all cursor-pointer group flex items-start gap-3.5"
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border shadow-sm ${partyStyle.bg} ${partyStyle.text} ${partyStyle.border}`}>
                            {initials || "MP"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                Preside la Comisión
                              </span>
                              <span className="text-[10px] text-slate-300 font-bold">{presIntegrante.partido}</span>
                            </div>
                            <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors truncate">
                              {presIntegrante.nombre}
                            </h4>
                            <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                              <span>Haz clic para ver proyectos y perfil legislativo</span>
                              <ChevronRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Secretaría Técnica */}
                    <div className="bg-white/10 border border-white/15 rounded-xl p-4 flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-400/30 flex items-center justify-center text-blue-200 font-bold text-sm shrink-0">
                        <Landmark className="w-6 h-6 text-blue-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            Secretaría Técnica de Comisión
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">
                          {secretarioText.replace(/^Secretaría:\s*/i, "")}
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Secretaría de Comisiones ({isSenado ? "Senado de la República" : "Cámara de Diputadas y Diputados"}), Valparaíso.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DISTRIBUCIÓN POLÍTICA & BUSCADOR */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                      Representación de Fuerzas Políticas en la Comisión
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {Object.entries(partyCounts).map(([partido, count]) => {
                        const style = getPartyBadgeStyle(partido);
                        return (
                          <span 
                            key={partido}
                            onClick={() => setMemberSearchFilter(memberSearchFilter === partido ? "" : partido)}
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${style.bg} ${style.text} ${style.border} ${
                              memberSearchFilter === partido ? "ring-2 ring-blue-500 scale-105" : "hover:opacity-80"
                            }`}
                            title={`Filtrar parlamentarios del partido ${partido}`}
                          >
                            {partido}: <span className="font-mono ml-0.5">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={memberSearchFilter}
                        onChange={(e) => setMemberSearchFilter(e.target.value)}
                        placeholder="Buscar por nombre o partido..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      {memberSearchFilter && (
                        <button
                          onClick={() => setMemberSearchFilter("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. NÓMINA COMPLETA DE PARLAMENTARIOS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Nómina Oficial de Integrantes ({filteredIntegrantes.length} de {allIntegrantes.length} Parlamentarios)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Haz clic en cualquier integrante para consultar sus mociones, indicaciones y proyectos de ley patrocinados.
                      </p>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      100% Enlazados Oficial
                    </span>
                  </div>

                  {filteredIntegrantes.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold">No se encontraron integrantes que coincidan con "{memberSearchFilter}".</p>
                      <button
                        onClick={() => setMemberSearchFilter("")}
                        className="mt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {filteredIntegrantes.map((i, idx) => {
                        const partyStyle = getPartyBadgeStyle(i.partido);
                        const isPresident = Boolean(i.rol && i.rol.toLowerCase().includes("president"));
                        const initials = i.nombre.replace(/^(Sr\.|Sra\.|Don|Doña)\s*/i, "").split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join("");

                        return (
                          <div 
                            key={idx}
                            onClick={() => setSelectedIntegranteModal(i)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer group shadow-2xs flex flex-col justify-between gap-3 ${
                              isPresident 
                                ? "bg-amber-50/40 border-amber-300 hover:border-amber-400 hover:shadow-sm" 
                                : "bg-slate-50/60 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border shadow-xs ${partyStyle.bg} ${partyStyle.text} ${partyStyle.border}`}>
                                {initials || "MP"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                  {isPresident ? (
                                    <span className="bg-amber-400 text-slate-950 text-[8.5px] font-black px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-0.5">
                                      <Award className="w-2.5 h-2.5" />
                                      <span>Preside</span>
                                    </span>
                                  ) : (
                                    <span className="bg-slate-200 text-slate-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                      Titular
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${partyStyle.bg} ${partyStyle.text} ${partyStyle.border}`}>
                                    {i.partido}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                                  {i.nombre}
                                </h4>
                                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                                  {i.camara || (isSenado ? "Senado de la República" : "Cámara de Diputadas y Diputados")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 text-[11px]">
                              <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                                <span>Ver proyectos patrocinados</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                              {i.email && (
                                <a
                                  href={`mailto:${i.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-white transition-colors"
                                  title={`Enviar correo a ${i.email}`}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TAB 5: AUDIENCIAS Y REPOSITORIO                                           */}
          {/* ========================================================================= */}
          {activeTab === "audiencias" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {/* Audiencias Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>Audiencias y Asistencias Sostenidas</span>
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center font-bold">
                      <span className="text-slate-700">Sector Público & Ministerios</span>
                      <span className="text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">{comision.audiencias?.sectorPublico || 14} audiencias</span>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center font-bold text-blue-800">
                      <span>Sociedad Civil y Gremios</span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-blue-900">{comision.audiencias?.sociedadCivil || 22} audiencias</span>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex justify-between items-center font-bold text-purple-800">
                      <span>Academia y Centros de Estudio</span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-purple-200 text-purple-900">{comision.audiencias?.academia || 12} audiencias</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Últimas entidades registradas</span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {(comision.audiencias?.ultimasAsistencias || [
                      { entidad: "Ministerio de Agricultura (Minagri)", expositores: 2 },
                      { entidad: "Servicio Agrícola y Ganadero (SAG)", expositores: 3 },
                      { entidad: "Sociedad Nacional de Agricultura (SNA)", expositores: 2 },
                      { entidad: "Instituto de Investigaciones Agropecuarias (INIA)", expositores: 1 }
                    ]).map((a, i) => (
                      <li key={i} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                        <span className="font-semibold">{a.entidad}</span>
                        <span className="font-mono text-slate-500">{a.expositores} expositores</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Document Repository */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Documentos y Repositorio Oficial</span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {(comision.documentosGroups || [
                      { tipo: "Informes de Comisión", cuenta: 22 },
                      { tipo: "Minutas Técnicas y Comparadas", cuenta: 18 },
                      { tipo: "Presentaciones de Expositores", cuenta: 34 },
                      { tipo: "Oficios e Indicaciones", cuenta: 15 }
                    ]).map((g, idx) => (
                      <div 
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-xs font-bold text-slate-800">{g.tipo}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-blue-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                          {g.cuenta}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={comision.officialUrl || "https://www.camara.cl"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl text-center transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Acceder al Repositorio Oficial en {isSenado ? "Senado.cl" : "Cámara.cl"}</span>
                </a>
              </div>
            </div>
          )}
        </>
      )}

      {/* YouTube Search, Bulletin Association, and Paginated AI Page Legislative Report Modal Overlay */}
      {selectedSesionForReport && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-[#003366] text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">ANÁLISIS COGNITIVO DE COMISIÓN DE LA REPÚBLICA</span>
                <h2 className="text-sm font-extrabold flex items-center gap-1.5 leading-snug">
                  <span>Informe de la Comisión: {selectedSesionForReport.materia.substring(0, 50)}...</span>
                </h2>
              </div>
              <button 
                onClick={() => setSelectedSesionForReport(null)}
                className="text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50/50">
              {!generatedReport ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column - YouTube Search and Select - 7 cols */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.163c-.272-1.216-1.14-2.197-2.3-2.399C19.143 3.5 12 3.5 12 3.5s-7.143 0-9.198.264c-1.16.202-2.028 1.183-2.3 2.399C.202 8.217.202 12 .202 12s0 3.783.264 5.837c.272 1.216 1.14 2.197 2.3 2.399 2.055.263 9.198.263 9.198.263s7.143 0 9.198-.263c1.16-.202 2.028-1.183 2.3-2.399.263-2.054.263-5.837.263-5.837s0-3.783-.263-5.837zm-14.28 9.53V8.307l6.587 3.693-6.587 3.69z" />
                        </svg>
                        <span>Buscar Transmisiones de la Sesión en YouTube</span>
                      </h3>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="Búsqueda de la sesión..."
                        />
                        <button 
                          onClick={executeYouTubeSearch}
                          disabled={searchLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          {searchLoading ? "Buscando..." : "Buscar"}
                        </button>
                      </div>

                      <p className="text-[9px] text-slate-500 font-medium mt-2 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>
                          Búsqueda directa de transmisiones en el canal oficial {isSenado ? <strong>@TVSENADOCHILE (TV Senado)</strong> : <strong>@diputadasydiputadosdechile</strong>}.
                        </span>
                        <a 
                          href={isSenado ? "https://www.youtube.com/@TVSENADOCHILE/videos" : "https://www.youtube.com/@diputadasydiputadosdechile/videos"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-bold hover:underline inline-flex items-center gap-0.5 shrink-0"
                        >
                          <span>Canal YouTube {isSenado ? "@TVSENADOCHILE" : "@diputadasydiputadosdechile"} &rsaquo;</span>
                        </a>
                      </p>
                    </div>

                    {/* Query Results / Video list */}
                    {searchResults.length > 0 && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Resultados de Transmisión Encontrados ({searchResults.length})</h4>
                        
                        <div className="grid grid-cols-1 gap-2.5">
                          {searchResults.map((vid) => (
                            <div 
                              key={vid.id}
                              onClick={() => setSelectedVideo(vid)}
                              className={`p-2 rounded-lg border flex gap-3 cursor-pointer transition-all ${
                                selectedVideo?.id === vid.id 
                                  ? "border-blue-500 bg-blue-50/20" 
                                  : "border-slate-150 hover:bg-slate-50"
                              }`}
                            >
                              <div className="w-24 aspect-video bg-slate-900 rounded-md shrink-0 overflow-hidden relative border border-slate-100">
                                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 right-1 bg-black/75 px-1 rounded text-[8px] font-bold text-white uppercase font-mono">{vid.duration}</span>
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                  <h5 className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2">{vid.title}</h5>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                                    <span>{vid.channel}</span>
                                    <span>&bull;</span>
                                    <span>{vid.date}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Player */}
                    {selectedVideo && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            <span>Transmisión Oficial Seleccionada</span>
                          </h4>
                          <span className="text-[9px] text-slate-400 font-semibold font-mono">ID: {selectedVideo.id}</span>
                        </div>
                        
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-250 bg-slate-950">
                          <iframe 
                            src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                            title={selectedVideo.title}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{selectedVideo.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Transmitido por el canal oficial <strong>{selectedVideo.channel}</strong>. El modelo Claude escuchará e interpretará toda la sesión de debate legislativo para redactar el informe.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Parameters & Associate - 5 cols */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    
                    {/* Session Recap Box */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">Detalles de la Comisión</h3>
                      
                      <div className="space-y-2 text-xs font-sans">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Comisión Técnica</label>
                          <p className="font-bold text-slate-800 leading-snug">{comision?.nombre}</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Fecha y Hora</label>
                          <p className="font-bold text-slate-800 leading-snug">{selectedSesionForReport.fecha} {selectedSesionForReport.hora && `(${selectedSesionForReport.hora})`}</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Materia Principal</label>
                          <p className="font-semibold text-slate-600 leading-snug">{selectedSesionForReport.materia}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown / Input to Associate Bulletin */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                          Vincular al Proyecto de Ley
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Selecciona el Boletín parlamentario correspondiente para asociar e indexar este informe autogenerado.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Boletines de la Comisión</label>
                          <select
                            value={customBoletin ? "custom" : reportBoletinId}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "custom") {
                                setCustomBoletin(true);
                                if (!customReportBoletinId) {
                                  setCustomReportBoletinId(reportBoletinId || "16.621-13");
                                }
                              } else {
                                setCustomBoletin(false);
                                setReportBoletinId(val);
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            {comision?.proyectos && comision.proyectos.length > 0 ? (
                              comision.proyectos.map((p) => (
                                <option key={p.id} value={p.id}>
                                  Boletín {p.id} - {p.titulo.substring(0, 35)}...
                                </option>
                              ))
                            ) : (
                              <option value="16.621-13">Boletín 16.621-13 - Teletrabajo</option>
                            )}
                            <option value="custom">Otro (Ingresar manualmente)...</option>
                          </select>
                        </div>

                        {customBoletin && (
                          <div className="animate-fade-in-down">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                              Escribir Boletín Manualmente
                            </label>
                            <input
                              type="text"
                              value={customReportBoletinId}
                              onChange={(e) => setCustomReportBoletinId(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2 font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500"
                              placeholder="Ej: 16.621-13"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Flow Container */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
                      {/* Action Generator Button */}
                      <button
                        onClick={handleGenerateReport}
                        disabled={generatingReport || !selectedVideo}
                        className={`w-full font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                          !selectedVideo 
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                             : "bg-gradient-to-r from-blue-700 to-[#003366] text-white hover:from-blue-800 hover:to-slate-900"
                        }`}
                      >
                        {generatingReport ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Escuchando YouTube y Redactando Informe...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <span>Generar Informe de la Sesión con IA</span>
                          </>
                        )}
                      </button>
                      {!selectedVideo && (
                        <span className="text-[9px] text-blue-500 font-bold text-center">Debes primero buscar y seleccionar un video de transmisión en la lista para iniciar el proceso.</span>
                      )}
                    </div>

                  </div>

                </div>
              ) : (
                
                /* 3-Page Paginated Document Reader */
                <div className="flex flex-col gap-5">
                  
                  {/* Succesful notification banner */}
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold">¡Informe IA Generado y Asociado Exitosamente!</h4>
                        <p className="text-[10px] text-emerald-600 font-medium">Este informe técnico oficial de 3 páginas ha sido indexado permanentemente al <strong>Boletín N° {customBoletin ? customReportBoletinId : reportBoletinId}</strong>.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const bid = customBoletin ? customReportBoletinId : reportBoletinId;
                        setSelectedProyectoId(bid);
                        setView("proyecto-detail");
                        setSelectedSesionForReport(null);
                      }}
                      className="bg-[#003366] hover:bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                    >
                      Ir al Boletín N° {customBoletin ? customReportBoletinId : reportBoletinId}
                    </button>
                  </div>

                  {/* Viewer Controls */}
                  <div className="w-full bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 justify-between items-center shadow-xs select-none">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] uppercase font-bold text-slate-400">Páginas de Informe</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map((page) => (
                          <button 
                            key={page}
                            onClick={() => setViewerCurrentPage(page)}
                            className={`w-7 h-7 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                              viewerCurrentPage === page 
                                ? "bg-[#003366] border-[#003366] text-white shadow-xs" 
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-slate-500">
                      Mostrando Página <strong className="text-slate-800">{viewerCurrentPage}</strong> de <strong className="text-slate-800">3</strong> — <span className="text-blue-600 font-bold uppercase text-[10px]">
                        {viewerCurrentPage === 1 ? "Índice y Sumario" : viewerCurrentPage === 2 ? "Foco Debate" : "Indicaciones y Acuerdos"}
                      </span>
                    </div>

                    <button 
                      onClick={() => window.print()}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.844l-.134-.134m12.433-.134l.134-.134M1.5 12h21M1.5 12a14.25 14.25 0 0013.5 11.25m-15 0h16.5m-5.834 0h3.184M19.5 12a14.25 14.25 0 001.5 6.75m-3-6.75h1.5a1.125 1.125 0 011.125 1.125v1.5a1.125 1.125 0 01-1.125 1.125H18M18 19.5h1.5l.134-.134M6.72 10.156l-.134.134m12.434.134l.134.134M1.5 12a14.25 14.25 0 0113.5-11.25m-15 0h16.5m-5.834 0h3.184M19.5 12a14.25 14.25 0 011.5-6.75m-3 6.75h1.5a1.125 1.125 0 001.125-1.125v-1.5a1.125 1.125 0 00-1.125-1.125H18M18 4.5h1.5l.134.134" />
                      </svg>
                      <span>Imprimir / Exportar Reporte</span>
                    </button>
                  </div>

                  {/* A3/A4 Sheet Emulator styling */}
                  <div className="bg-neutral-100 p-4 md:p-6 rounded-2xl flex justify-center border border-slate-200">
                    <div className="bg-white px-10 py-12 rounded-lg border border-slate-350 w-full max-w-2xl min-h-[640px] shadow-lg flex flex-col justify-between font-serif relative overflow-hidden select-text">
                      {/* Background Seal watermark mock */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none self-center">
                        <svg className="w-96 h-96 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93V4.07z" />
                        </svg>
                      </div>

                      {/* Top Margin Memo Letterhead */}
                      <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 shrink-0 flex justify-between items-start text-xs font-sans font-bold">
                        <div>
                          <span className="block uppercase text-[10px] tracking-wider text-slate-800">REPÚBLICA DE CHILE</span>
                          <span className="block uppercase text-[10px] tracking-wider text-[#003366]">CONGRESO NACIONAL</span>
                        </div>
                        <div className="text-right uppercase text-[9px] text-slate-400 font-mono tracking-wider">
                          <span>REP: {customBoletin ? customReportBoletinId : reportBoletinId}</span>
                          <span className="block bg-neutral-100 px-1 border border-neutral-200 rounded mt-0.5 text-slate-600 font-sans">ORIGINAL IA</span>
                        </div>
                      </div>

                      {/* Interactive Report Markdown content parsed into pure React elements */}
                      <div className="flex-1 text-[11px] leading-relaxed text-slate-800 prose prose-slate">
                        {parseAndRenderMarkdown(generatedReport.reportContent[viewerCurrentPage - 1])}
                      </div>

                      {/* Footer Margins */}
                      <div className="border-t border-slate-200/60 pt-4 mt-8 shrink-0 flex justify-between items-center text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wide">
                        <div>
                          <span>Boletín de ley N° {customBoletin ? customReportBoletinId : reportBoletinId}</span>
                        </div>
                        <div>
                          <span>Página {viewerCurrentPage} de 3</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="bg-slate-50 border-t border-slate-150 p-4 shrink-0 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedSesionForReport(null)}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Summary Dictation / Writing Modal Overlay */}
      {selectedSesionForSummary && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-emerald-700 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100">Bitácora Personal de Sesiones</span>
                <h2 className="text-sm font-extrabold flex items-center gap-1.5 leading-snug">
                  <Mic className="w-4 h-4 text-emerald-200" />
                  <span>Registrar Resumen del Sucedido</span>
                </h2>
              </div>
              <button 
                onClick={() => {
                  stopVoiceDictation();
                  setSelectedSesionForSummary(null);
                }}
                className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50/50 space-y-4">
              
              {/* Session Meta Info */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase border border-blue-100/30">
                    {selectedSesionForSummary.tipo}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{selectedSesionForSummary.fecha}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 leading-snug">
                  {selectedSesionForSummary.materia}
                </h3>
                {selectedSesionForSummary.invitados && (
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    <span className="font-semibold text-slate-600">Invitados:</span> {selectedSesionForSummary.invitados}
                  </p>
                )}
              </div>

              {/* Dictation & Text Area Control Panel */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                
                {/* Voice Dictation Button Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="text-center sm:text-left">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-center sm:justify-start">
                      {isRecording ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      ) : (
                        <Mic className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      Dictado por Voz (Micrófono)
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {isRecording ? "Grabando voz activa... Hable ahora." : "Grabe directamente usando el micrófono."}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {isRecording ? (
                      <button
                        onClick={stopVoiceDictation}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                      >
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Detener</span>
                      </button>
                    ) : (
                      <button
                        onClick={startVoiceDictation}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Iniciar Dictado</span>
                      </button>
                    )}

                    <button
                      onClick={suggestAISummary}
                      title="Sugerir un resumen pre-redactado usando la información de la sesión"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>Sugerir por IA</span>
                    </button>
                  </div>
                </div>

                {/* Text Area */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                    Resumen del Sucedido (Bitácora)
                  </label>
                  <textarea
                    rows={6}
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    placeholder="Escriba o dicte el resumen de lo acontecido en esta sesión. Se guardará directamente en su bitácora parlamentaria ciudadana..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 leading-relaxed placeholder-slate-400"
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[9px] text-slate-400">
                      {summaryText.length} caracteres
                    </span>
                    {summaryText && (
                      <button
                        onClick={() => setSummaryText("")}
                        className="text-[10px] text-slate-400 hover:text-blue-500 hover:underline flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-3 h-3" /> Limpiar
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-150 p-4 shrink-0 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  stopVoiceDictation();
                  setSelectedSesionForSummary(null);
                }}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  stopVoiceDictation();
                  handleSaveSummary();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar en Bitácora</span>
              </button>
            </div>

          </div>
        </div>
      )}



      {/* Edit Citación Modal */}
      {isEditingCitacionModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/20 text-amber-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Editar Datos Oficiales de Citación</h2>
                  <p className="text-[11px] text-slate-300">
                    Comisión: <span className="font-semibold text-amber-300">{comision.nombre}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditingCitacionModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
              {/* Quick Template Presets */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600 fill-current" />
                    <span>Cargar Plantillas Rápidas Preconfiguradas</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">1-Clic</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Seleccione una de las estructuras típicas para autocompletar la citación con formato parlamentario oficial:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => applyCitacionTemplate("ordinaria")}
                    className="bg-white hover:bg-amber-100 text-slate-900 border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Sesión Ordinaria (Tabla)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCitacionTemplate("audiencias")}
                    className="bg-white hover:bg-amber-100 text-slate-900 border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Audiencias y Expositores</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCitacionTemplate("votacion")}
                    className="bg-white hover:bg-amber-100 text-slate-900 border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Votación en Particular</span>
                  </button>
                </div>
              </div>

              {/* Quick Paste Assistant */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Pegado Rápido desde Cámara.cl, Senado.cl o Correo Oficial</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Si tiene el texto copiado de la citación oficial, péguelo abajo y presione &quot;Autocompletar Campos&quot; para extraer los datos de forma inteligente.
                </p>
                <textarea
                  rows={3}
                  value={citacionEditForm.pasteRawText}
                  onChange={(e) => setCitacionEditForm(prev => ({ ...prev, pasteRawText: e.target.value }))}
                  placeholder="Ej: Citación N° 83. Fecha: Miércoles 12 de agosto de 2026. Hora: 10:30 a 13:00 hrs. Lugar: Sala N° 311. Objeto: Continuar votación en particular..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleParseRawCitacion(citacionEditForm.pasteRawText)}
                  disabled={!citacionEditForm.pasteRawText.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Autocompletar Campos desde Texto Pegado</span>
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Citación / Sesión N°
                  </label>
                  <input
                    type="text"
                    value={citacionEditForm.citacionNumero}
                    onChange={(e) => setCitacionEditForm(prev => ({ ...prev, citacionNumero: e.target.value }))}
                    placeholder="Ej: Citación N° 83 (Sesión Ordinaria)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      Fecha de la Sesión
                    </label>
                    <span className="text-[9px] text-blue-600 font-bold">Selector directo</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={citacionEditForm.fechaInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const [y, m, d] = val.split("-").map(Number);
                          const dateObj = new Date(y, m - 1, d);
                          const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                          const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                          const formatted = `${dayNames[dateObj.getDay()]} ${d} de ${monthNames[m - 1]} de ${y}`;
                          setCitacionEditForm(prev => ({ ...prev, fechaInput: val, fecha: formatted }));
                        }
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={citacionEditForm.fecha}
                      onChange={(e) => setCitacionEditForm(prev => ({ ...prev, fecha: e.target.value }))}
                      placeholder="Ej: Martes 25 de agosto de 2026"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                        const iso = tomorrow.toISOString().split("T")[0];
                        const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                        const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                        const formatted = `${dayNames[tomorrow.getDay()]} ${tomorrow.getDate()} de ${monthNames[tomorrow.getMonth()]} de ${tomorrow.getFullYear()}`;
                        setCitacionEditForm(prev => ({ ...prev, fechaInput: iso, fecha: formatted }));
                      }}
                      className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                    >
                      Mañana
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const nextW = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        const iso = nextW.toISOString().split("T")[0];
                        const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                        const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                        const formatted = `${dayNames[nextW.getDay()]} ${nextW.getDate()} de ${monthNames[nextW.getMonth()]} de ${nextW.getFullYear()}`;
                        setCitacionEditForm(prev => ({ ...prev, fechaInput: iso, fecha: formatted }));
                      }}
                      className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                    >
                      Próxima semana
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Hora / Horario
                  </label>
                  <input
                    type="text"
                    value={citacionEditForm.hora}
                    onChange={(e) => setCitacionEditForm(prev => ({ ...prev, hora: e.target.value }))}
                    placeholder="Ej: 10:30 a 13:00 hrs."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Lugar / Sala
                  </label>
                  <input
                    type="text"
                    value={citacionEditForm.lugar}
                    onChange={(e) => setCitacionEditForm(prev => ({ ...prev, lugar: e.target.value }))}
                    placeholder="Ej: Sala N° 311 (Valparaíso) / Conexión Telemática"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Objeto de la Citación */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Objeto de la Citación / Materia Principal
                </label>
                <textarea
                  rows={3}
                  value={citacionEditForm.materia}
                  onChange={(e) => setCitacionEditForm(prev => ({ ...prev, materia: e.target.value }))}
                  placeholder="Describa el objetivo principal y boletines en tramitación para esta sesión..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Invitados Citados */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Invitados Citados
                </label>
                <textarea
                  rows={2}
                  value={citacionEditForm.invitados}
                  onChange={(e) => setCitacionEditForm(prev => ({ ...prev, invitados: e.target.value }))}
                  placeholder="Ej: Ministro de Agricultura, Director del SAG, representantes de gremios..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Puntos de la Tabla */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Puntos de la Tabla (un punto por línea)
                </label>
                <textarea
                  rows={3}
                  value={citacionEditForm.tablaText}
                  onChange={(e) => setCitacionEditForm(prev => ({ ...prev, tablaText: e.target.value }))}
                  placeholder="1. Discusión y votación del Boletín N°...
2. Exposición de las autoridades del ramo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed font-mono"
                />
              </div>

              {/* Secretario */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Secretaría / Abogado Secretario
                </label>
                <input
                  type="text"
                  value={citacionEditForm.secretario}
                  onChange={(e) => setCitacionEditForm(prev => ({ ...prev, secretario: e.target.value }))}
                  placeholder="Ej: Secretaría: Rafael Alberto Ruz Parra (Abogado Secretario)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex justify-between items-center">
              <button
                type="button"
                onClick={handleResetCitacionModal}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Citación Original</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCitacionModal(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCitacionModal}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs px-5 py-2 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Guardar Citación Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ficha y Proyectos del Integrante de Comisión */}
      {selectedIntegranteModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-[#003366] text-white p-5 flex justify-between items-start shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm ${getPartyBadgeStyle(selectedIntegranteModal.partido).bg} ${getPartyBadgeStyle(selectedIntegranteModal.partido).text} ${getPartyBadgeStyle(selectedIntegranteModal.partido).border}`}>
                  {selectedIntegranteModal.nombre.replace(/^(Sr\.|Sra\.|Don|Doña)\s*/i, "").split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join("") || "MP"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 text-white px-2 py-0.5 rounded">
                      {isSenado ? "Senado de la República" : "Cámara de Diputadas y Diputados"}
                    </span>
                    {selectedIntegranteModal.rol && selectedIntegranteModal.rol.toLowerCase().includes("president") && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        Preside
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-extrabold text-white mt-1 leading-tight">
                    {selectedIntegranteModal.nombre}
                  </h2>
                  <p className="text-xs text-slate-200 font-semibold mt-0.5">
                    {selectedIntegranteModal.partido}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedIntegranteModal(null)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-base font-bold leading-none"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-xs">
              {/* Bio & Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <span>Representación Institucional</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Rol en esta Comisión</span>
                    <span className="font-bold text-slate-800">{selectedIntegranteModal.rol || "Miembro Titular"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Filiación Política</span>
                    <span className="font-bold text-slate-800">{selectedIntegranteModal.partido}</span>
                  </div>
                  {selectedIntegranteModal.email && (
                    <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Correo Institucional</span>
                        <a 
                          href={`mailto:${selectedIntegranteModal.email}`} 
                          className="font-mono text-blue-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{selectedIntegranteModal.email}</span>
                        </a>
                      </div>
                      <a
                        href={`mailto:${selectedIntegranteModal.email}`}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Enviar Mensaje
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Ver Proyectos Patrocinados */}
              <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 flex flex-col gap-2.5">
                <div>
                  <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-blue-600" />
                    <span>Iniciativas y Proyectos de Ley del Parlamentario</span>
                  </h4>
                  <p className="text-[11px] text-blue-700 leading-snug mt-1">
                    Acceda al catálogo completo de proyectos de ley, mociones y reformas constitucionales patrocinadas o suscritas por este parlamentario.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const cleanName = selectedIntegranteModal.nombre.replace(/^(Sr\.|Sra\.|Don|Doña)\s*/i, "").trim();
                    if (setSearchFilter) {
                      setSearchFilter(cleanName);
                    }
                    setView("proyectos");
                    setSelectedIntegranteModal(null);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Ver proyectos presentados por {selectedIntegranteModal.nombre.replace(/^(Sr\.|Sra\.|Don|Doña)\s*/i, "").split(" ")[0]}</span>
                </button>
              </div>

              {/* Official Link */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium">Fuente oficial verificada</span>
                <a
                  href={isSenado ? "https://www.senado.cl" : "https://www.camara.cl"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                >
                  <span>Ficha oficial en {isSenado ? "Senado.cl" : "Cámara.cl"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedIntegranteModal(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Completar Información de Sesión y Acta Oficial */}
      {sessionToComplete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/20 text-amber-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Completar / Registrar Acta de Sesión</h2>
                  <p className="text-[11px] text-slate-300">
                    {sessionToComplete.tipo} · <span className="font-semibold text-amber-300">{sessionToComplete.fecha}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSessionToComplete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
              {sessionCompleteSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Acta y acuerdos de sesión registrados y consolidados exitosamente en la comisión!</span>
                </div>
              )}

              {/* Materia */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Materia / Proyecto Tratado
                </label>
                <p className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {sessionToComplete.materia}
                </p>
              </div>

              {/* Resumen / Acta */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Resumen Ejecutivo / Acta Oficial de lo Tratado
                </label>
                <textarea
                  rows={4}
                  value={sessionCompleteForm.actaTexto}
                  onChange={(e) => setSessionCompleteForm(prev => ({ ...prev, actaTexto: e.target.value }))}
                  placeholder="Escriba los puntos clave discutidos en la sesión..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Acuerdos y Votaciones */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Acuerdos Adoptados y Votaciones (un acuerdo por línea)
                </label>
                <textarea
                  rows={3}
                  value={sessionCompleteForm.acuerdosTexto}
                  onChange={(e) => setSessionCompleteForm(prev => ({ ...prev, acuerdosTexto: e.target.value }))}
                  placeholder="1. Se aprueba la indicación N° 4 por 4 votos a favor y 1 abstención.
2. Se acuerda citar al Director de Presupuestos para la siguiente sesión..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed font-mono"
                />
              </div>

              {/* Invitados y Asistentes */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Autoridades, Ministros y Expositores Asistentes
                </label>
                <input
                  type="text"
                  value={sessionCompleteForm.invitadosExpositores}
                  onChange={(e) => setSessionCompleteForm(prev => ({ ...prev, invitadosExpositores: e.target.value }))}
                  placeholder="Ej: Ministro de Hacienda, Subsecretaria de Salud, Académicos U. de Chile..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Enlace de Video / YouTube */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Enlace de Transmisión (YouTube / TV Senado / Cámara TV)
                </label>
                <input
                  type="text"
                  value={sessionCompleteForm.videoUrl}
                  onChange={(e) => setSessionCompleteForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSessionToComplete(null)}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCompleteSession}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Acta y Consolidar en Comisión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </motion.div>
  );
}
