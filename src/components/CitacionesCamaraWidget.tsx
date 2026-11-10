import React, { useState, useMemo, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Users, 
  Building,
  FileText, 
  Radio, 
  UserCheck, 
  Tag,
  Download,
  Copy,
  ExternalLink,
  Filter,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ListOrdered,
  Table as TableIcon,
  Share2,
  Layers,
  Landmark,
  ArrowRight,
  Printer,
  Search,
  X,
  SlidersHorizontal,
  Flame,
  AlertCircle,
  Video,
  CheckCircle2,
  CalendarDays,
  ShieldAlert,
  Bookmark,
  Star,
  History,
  Eye,
  CheckSquare,
  RotateCcw
} from "lucide-react";

export interface CitacionesCamaraWidgetProps {
  setView?: (view: string) => void;
  setSelectedComisionId?: (id: string) => void;
  setSelectedProyectoId?: (id: string) => void;
  followedComs?: string[];
  toggleFollowCom?: (comName: string) => void;
}

export interface Citacion {
  comision: string;
  fechaISO: string; // E.g., "Martes 11 de Agosto, 2026"
  hora: string;
  lugar: string;
  materia: string;
  invitados?: string;
  boletin?: string;
  week: number;
  // Enriched fields for absolute completeness
  presidente: string;
  tipoSesion: "Ordinaria" | "Especial" | "Constitutiva";
  canalTransmision: string;
  ordenDelDia: string[];
  chamber?: "CD" | "SR";
}

// Las citaciones salen SOLO de lo que el servidor leyó de camara.cl y senado.cl. Antes había aquí más de mil
// líneas de citaciones precargadas (con presidentes y canales de transmisión supuestos) que se mostraban como
// agenda vigente; se eliminaron: si una fuente no responde, se informa "no disponible".

const MESES_CIT: Record<string, number> = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };
/** Fecha real de una citación ("LUNES, 7 DE SEPTIEMBRE DE 2026", "Martes 11 de Agosto, 2026" o "2026-09-07"); null si no se puede leer. */
export function fechaDeCitacion(texto?: string): Date | null {
  const t = String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const iso = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const m = t.match(/(\d{1,2})\s+de\s+([a-z]+)(?:\s+de)?[\s,]+(\d{4})/);
  if (!m || !(m[2] in MESES_CIT)) return null;
  return new Date(Number(m[3]), MESES_CIT[m[2]], Number(m[1]));
}
/** Semana ISO de una fecha (0 si no hay fecha). */
function semanaISO(d: Date | null): number {
  if (!d) return 0;
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - dia);
  return Math.ceil(((x.getTime() - Date.UTC(x.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
}

export default function CitacionesCamaraWidget({
  setView,
  setSelectedComisionId,
  setSelectedProyectoId,
  followedComs = [],
  toggleFollowCom
}: CitacionesCamaraWidgetProps) {
  // Scopes: "mis-comisiones" | "proximas" | "todas" | "historial"
  const [scope, setScope] = useState<"mis-comisiones" | "proximas" | "todas" | "historial">(
    () => (followedComs && followedComs.length > 0 ? "mis-comisiones" : "proximas")
  );

  const [activeChamber, setActiveChamber] = useState<"camara" | "senado" | "todas">("todas");
  const [selectedCommissionFilter, setSelectedCommissionFilter] = useState<string>("todas");
  const [week, setWeek] = useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<"todos" | "marzo" | "abril" | "mayo" | "junio" | "julio" | "agosto" | "septiembre">("todos");
  const [dayFilter, setDayFilter] = useState<"todos" | "lunes" | "martes" | "miercoles" | "jueves" | "viernes">("todos");
  const [typeFilter, setTypeFilter] = useState<"todos" | "Ordinaria" | "Especial">("todos");
  const [onlyWithGuests, setOnlyWithGuests] = useState<boolean>(false);
  const [onlyWithBills, setOnlyWithBills] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"timeline" | "grid" | "table">("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [liveWeekCitaciones, setLiveWeekCitaciones] = useState<Citacion[]>([]);
  const [errorCitaciones, setErrorCitaciones] = useState<string | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  // Origen real de las citaciones (el servidor informa si son de esta semana o de respaldo).
  const [fuentesCitaciones, setFuentesCitaciones] = useState<{
    camara?: { fuente: string; detalle: string };
    senado?: { fuente: string; detalle: string };
  } | null>(null);
  const currentYear = 2026;

  const fetchLiveCitaciones = (forceRefresh = false) => {
    setIsLiveSyncing(true);
    fetch(`/api/comisiones/citaciones${forceRefresh ? "?refresh=true" : ""}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.fuentes) setFuentesCitaciones(data.fuentes);
        const rawCitList: any[] = Array.isArray(data?.citaciones) ? data.citaciones : Array.isArray(data?.todas) ? data.todas : [];
        const mapped: Citacion[] = rawCitList.map((c: any) => {
          const isSR = c.chamber === "SR" || c.id?.startsWith("senado-") || c.comision?.toLowerCase().includes("senado");
          const normName = c.comisionNombre
            ? (c.comisionNombre.startsWith("Comisión") ? c.comisionNombre : `Comisión de ${c.comisionNombre}`)
            : (c.comision || "Comisión no informada");
          return {
            comision: normName,
            fechaISO: c.fecha || "Fecha no informada",
            hora: c.hora ? (c.hora.includes("hrs") ? c.hora : `${c.hora} hrs`) : "Hora no informada",
            lugar: c.lugar || "Lugar no informado",
            materia: c.materia || "Materia no informada",
            invitados: c.invitados,
            boletin: c.boletin || (c.boletinesRelacionados && c.boletinesRelacionados.length > 0 ? c.boletinesRelacionados[0] : undefined),
            week: semanaISO(fechaDeCitacion(c.fecha)),
            presidente: c.presidente || "No informado",
            tipoSesion: (c.tipo && c.tipo.includes("Especial")) ? "Especial" : "Ordinaria",
            canalTransmision: c.canalTransmision || "No informado",
            ordenDelDia: c.tabla && c.tabla.length > 0 ? c.tabla : (c.materia ? [c.materia] : []),
            chamber: isSR ? ("SR" as const) : ("CD" as const)
          };
        });
        // Se muestra exactamente lo que entregó el servidor, aunque sea una lista vacía.
        setLiveWeekCitaciones(mapped);
        setErrorCitaciones(null);
        if (forceRefresh) {
          const vivas = data?.fuentes?.camara?.fuente === "vivo" && data?.fuentes?.senado?.fuente === "vivo";
          setCopiedToast(vivas ? "Citaciones de la Cámara y del Senado actualizadas desde los sitios oficiales." : "Actualización parcial: revise el aviso sobre las fuentes que no respondieron.");
          setTimeout(() => setCopiedToast(null), 3500);
        }
      })
      .catch(err => {
        console.warn("Could not fetch live citaciones:", err);
        setErrorCitaciones("No se pudo consultar el servidor de citaciones. Reintente en un momento.");
      })
      .finally(() => {
        setIsLiveSyncing(false);
      });
  };

  useEffect(() => {
    fetchLiveCitaciones(false);

    // Continuous auto-refresh every 60 seconds from official portals
    const interval = setInterval(() => {
      fetchLiveCitaciones(false);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Tag dataset with chambers
  const allEnrichedCitaciones = useMemo(() => {
    const camaraTagged = liveWeekCitaciones.filter(c => c.chamber === "CD");
    const senadoTagged = liveWeekCitaciones.filter(c => c.chamber === "SR");

    return [...camaraTagged, ...senadoTagged];
  }, [liveWeekCitaciones]);

  // Deduplicated unique commissions for the quick-select dropdown
  const uniqueCommissions = useMemo(() => {
    const map = new Map<string, { nombre: string; chamber: "CD" | "SR"; count: number }>();
    for (const c of allEnrichedCitaciones) {
      const key = `${c.chamber}-${c.comision}`;
      if (!map.has(key)) {
        map.set(key, { nombre: c.comision, chamber: c.chamber, count: 1 });
      } else {
        map.get(key)!.count++;
      }
    }
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [allEnrichedCitaciones]);

  // Helper to test if a commission is followed
  // Antes esta función comparaba por substring en ambas direcciones
  // (normCard.includes(normF) || normF.includes(normCard)) -- un nombre
  // seguido podía "colarse" como coincidencia de OTRA comisión sin relación
  // real solo por compartir una palabra o ser más corto/largo, mezclando
  // citaciones de comisiones distintas bajo "Mis Comisiones Seguidas" y
  // llevando, al navegar, a una comisión distinta de la que se sigue de
  // verdad. Ahora compara por igualdad exacta tras normalizar, igual que el
  // resto de la app (App.tsx usa followedComs.includes(c.nombre) sin fuzzy match).
  const isCommissionFollowed = (comisionNombre: string): boolean => {
    if (!followedComs || followedComs.length === 0) return false;
    const normCard = comisionNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^comisi[oó]n (especial - |de )?/i, "").trim();
    return followedComs.some(f => {
      const normF = f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^comisi[oó]n (especial - |de )?/i, "").trim();
      return normCard === normF;
    });
  };

  // Extract day name helper
  const getDayName = (fechaISO: string): string => {
    const fLower = fechaISO.toLowerCase();
    if (fLower.includes("lunes")) return "Lunes";
    if (fLower.includes("martes")) return "Martes";
    if (fLower.includes("miércoles") || fLower.includes("miercoles")) return "Miércoles";
    if (fLower.includes("jueves")) return "Jueves";
    if (fLower.includes("viernes")) return "Viernes";
    return "Otro";
  };

  // Helper to map commission name to canonical ID
  const mapToComisionId = (comisionNombre: string, chamber: "CD" | "SR"): string => {
    const norm = comisionNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (chamber === "SR") {
      if (norm.includes("constitucion")) return "senado-constitucion";
      if (norm.includes("hacienda")) return "senado-hacienda";
      if (norm.includes("trabajo")) return "senado-trabajo-y-prevision";
      if (norm.includes("seguridad")) return "senado-seguridad-publica";
      if (norm.includes("salud")) return "senado-salud";
      if (norm.includes("educacion")) return "senado-educacion";
      if (norm.includes("defensa")) return "senado-defensa";
      if (norm.includes("rree") || norm.includes("relaciones")) return "senado-relaciones-exteriores";
      if (norm.includes("gobierno")) return "senado-gobierno";
      if (norm.includes("obras")) return "senado-obras-publicas";
      if (norm.includes("agricultura")) return "senado-agricultura";
      if (norm.includes("medio ambiente")) return "senado-medio-ambiente";
      if (norm.includes("mineria")) return "senado-mineria-y-energia";
      if (norm.includes("economia")) return "senado-economia";
      if (norm.includes("vivienda")) return "senado-vivienda";
      if (norm.includes("futuro") || norm.includes("ciencia")) return "senado-desafios-futuro";
      if (norm.includes("mujer")) return "senado-mujer-genero";
      if (norm.includes("infancia") || norm.includes("familia")) return "senado-familia-infancia";
      if (norm.includes("adulto mayor") || norm.includes("discapacidad")) return "senado-adulto-mayor-discapacidad";
      if (norm.includes("cultura") || norm.includes("deporte")) return "senado-cultura-deportes";
      if (norm.includes("transporte")) return "senado-transportes";
      if (norm.includes("pesca") || norm.includes("maritimo")) return "senado-pesca";
      if (norm.includes("hidricos") || norm.includes("agua") || norm.includes("sequia")) return "senado-recursos-hidricos";
      if (norm.includes("primera subcomision")) return "senado-subcomision-1-presupuestos";
      if (norm.includes("segunda subcomision")) return "senado-subcomision-2-presupuestos";
      if (norm.includes("tercera subcomision")) return "senado-subcomision-3-presupuestos";
      if (norm.includes("cuarta subcomision")) return "senado-subcomision-4-presupuestos";
      if (norm.includes("quinta subcomision")) return "senado-subcomision-5-presupuestos";
      if (norm.includes("presupuesto")) return "senado-especial-mixta-presupuestos";
      if (norm.includes("zonas extremas")) return "senado-zonas-extremas";
      if (norm.includes("etica")) return "senado-etica";
      if (norm.includes("regimen")) return "senado-regimen-interior";
      if (norm.includes("revisora")) return "senado-revisora-cuentas";
      if (norm.includes("ruf") || norm.includes("15805")) return "senado-mixta-ruf-15805-07";
      if (norm.includes("15975")) return "senado-mixta-15975-25";
      if (norm.includes("16335")) return "senado-mixta-16335-14";
      if (norm.includes("16569")) return "senado-mixta-16569-25";
      return "senado-constitucion";
    } else {
      if (norm.includes("constitucion")) return "cd-constitucion";
      if (norm.includes("hacienda")) return "cd-hacienda";
      if (norm.includes("trabajo")) return "cd-trabajo-y-prevision";
      if (norm.includes("seguridad")) return "cd-seguridad";
      if (norm.includes("salud")) return "cd-salud";
      if (norm.includes("educacion")) return "cd-educacion";
      if (norm.includes("defensa")) return "cd-defensa";
      if (norm.includes("rree") || norm.includes("relaciones")) return "cd-rree";
      if (norm.includes("gobierno")) return "cd-gobierno-interior";
      if (norm.includes("obras")) return "cd-obras-publicas";
      if (norm.includes("agricultura")) return "cd-agricultura";
      if (norm.includes("medio ambiente")) return "cd-medio-ambiente";
      if (norm.includes("mineria")) return "cd-mineria";
      if (norm.includes("economia")) return "cd-economia";
      if (norm.includes("vivienda")) return "cd-vivienda";
      if (norm.includes("ciencia")) return "cd-ciencias";
      if (norm.includes("mujer")) return "cd-mujeres-genero";
      if (norm.includes("familia")) return "cd-familias";
      if (norm.includes("cultura")) return "cd-cultura";
      if (norm.includes("deporte")) return "cd-deportes";
      if (norm.includes("pesca")) return "cd-pesca";
      if (norm.includes("hidricos") || norm.includes("agua")) return "cd-recursos-hidricos";
      return "cd-constitucion";
    }
  };

  // Filtered citations with all criteria (followed commissions, upcoming vs past, commission picker)
  const filteredCitaciones = useMemo(() => {
    return allEnrichedCitaciones.filter(c => {
      // Chamber filter
      if (activeChamber === "camara" && c.chamber !== "CD") return false;
      if (activeChamber === "senado" && c.chamber !== "SR") return false;

      // Commission picker filter
      if (selectedCommissionFilter !== "todas" && c.comision !== selectedCommissionFilter) return false;

      // Month filter (From March 11 onwards)
      const fNorm = c.fechaISO.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (selectedMonth !== "todos") {
        if (!fNorm.includes(selectedMonth)) return false;
      }

      // Temporal & Followed Scope Filter:
      // Note: Week 33 (11-14 Agosto) and earlier/specific past months are past; Week 34+ is active / upcoming
      // Pasada = su fecha real es anterior a hoy (si la fecha no se puede leer, no se da por pasada).
      const fechaReal = fechaDeCitacion(c.fechaISO);
      const hoy0 = new Date(); hoy0.setHours(0, 0, 0, 0);
      const isPastSession = !!fechaReal && fechaReal.getTime() < hoy0.getTime();

      if (scope === "mis-comisiones") {
        // Must be in followed commissions
        if (!isCommissionFollowed(c.comision)) return false;
      } else if (scope === "proximas") {
        // Exclude past dates
        if (isPastSession) return false;
      } else if (scope === "historial") {
        // Only include historical dates from March 11 onwards
        if (!isPastSession) return false;
      }

      // Week filter (if manually set)
      const matchesWeek = week === "all" || c.week === week;
      if (!matchesWeek) return false;

      // Type filter
      const matchesType = typeFilter === "todos" || c.tipoSesion === typeFilter;
      if (!matchesType) return false;

      // Guest filter
      const matchesGuests = !onlyWithGuests || (Boolean(c.invitados) && c.invitados.trim().length > 0);
      if (!matchesGuests) return false;

      // Bill filter
      const matchesBills = !onlyWithBills || (Boolean(c.boletin) && c.boletin.trim().length > 0);
      if (!matchesBills) return false;
      
      // Day filter
      const dayName = getDayName(c.fechaISO).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const matchesDay = dayFilter === "todos" || dayName === dayFilter;
      if (!matchesDay) return false;

      // Search Query
      const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const ordenStr = Array.isArray(c.ordenDelDia) ? c.ordenDelDia.join(" ") : String(c.ordenDelDia || "");
      const fullText = `${c.comision} ${c.materia} ${c.presidente} ${c.boletin || ""} ${c.invitados || ""} ${c.lugar} ${ordenStr} ${c.fechaISO}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const matchesSearch = searchQuery === "" || fullText.includes(q);
      if (!matchesSearch) return false;

      return true;
    });
  }, [allEnrichedCitaciones, activeChamber, selectedCommissionFilter, selectedMonth, scope, followedComs, week, typeFilter, onlyWithGuests, onlyWithBills, dayFilter, searchQuery]);

  // Group citations by day of week
  const citationsByDay = useMemo(() => {
    const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Otro"];
    const groups: Record<string, typeof filteredCitaciones> = {};
    for (const d of daysOrder) {
      groups[d] = [];
    }
    for (const cit of filteredCitaciones) {
      const dName = getDayName(cit.fechaISO);
      if (!groups[dName]) groups[dName] = [];
      groups[dName].push(cit);
    }
    return groups;
  }, [filteredCitaciones]);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = filteredCitaciones.length;
    const withGuests = filteredCitaciones.filter(c => Boolean(c.invitados) && c.invitados.trim().length > 0).length;
    const withBills = filteredCitaciones.filter(c => Boolean(c.boletin) && c.boletin.trim().length > 0).length;
    const specials = filteredCitaciones.filter(c => c.tipoSesion === "Especial").length;
    const liveOnline = filteredCitaciones.filter(c => c.canalTransmision && !c.canalTransmision.toLowerCase().includes("privada")).length;
    return { total, withGuests, withBills, specials, liveOnline };
  }, [filteredCitaciones]);

  // Toggle card expansion
  const toggleExpandCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Robust clipboard copy with fallback
  const robustCopyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (err) {
      console.warn("Clipboard copy failed", err);
    }
  };

  // Copy individual citation
  const handleCopyCitacion = (cit: Citacion, e: React.MouseEvent) => {
    e.stopPropagation();
    const chamberLabel = cit.chamber === "SR" ? "Senado de la República" : "Cámara de Diputadas y Diputados";
    const text = `🏛️ CITACIÓN LEGISLATIVA OFICIAL - CONGRESO NACIONAL DE CHILE
📌 Comisión: ${cit.comision} (${chamberLabel})
📅 Fecha: ${cit.fechaISO}${cit.week ? ` (Semana ${cit.week})` : ""}
⏰ Horario: ${cit.hora}
📍 Sala / Lugar: ${cit.lugar}
👤 Preside: ${cit.presidente}
🔖 Tipo de Sesión: Sesión ${cit.tipoSesion}
${cit.boletin ? `📜 Boletín Asociado: ${cit.boletin}\n` : ""}
📝 Materia en Tabla:
${cit.materia}

📋 Orden del Día:
${cit.ordenDelDia.map(i => `  • ${i}`).join("\n")}
${cit.invitados ? `\n👥 Autoridades e Invitados Citados:\n  ${cit.invitados}` : ""}
📡 Transmisión Oficial: ${cit.canalTransmision}`;

    robustCopyToClipboard(text);
    setCopiedToast(`Citación de "${cit.comision}" copiada`);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Download .ics calendar file
  const handleDownloadICS = (cit: Citacion, e: React.MouseEvent) => {
    e.stopPropagation();
    let year = 2026;
    let month = 8;
    let day = 18;

    const dayMatch = cit.fechaISO.match(/(\d{1,2})\s+de\s+([A-Za-z]+)/i);
    if (dayMatch) {
      day = parseInt(dayMatch[1], 10);
      const mStr = dayMatch[2].toLowerCase();
      const mNames: Record<string, number> = {
        enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
        julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
      };
      if (mNames[mStr]) month = mNames[mStr];
    }

    let sHour = 10, sMin = 0, eHour = 12, eMin = 30;
    const tMatch = cit.hora.match(/(\d{1,2}):(\d{2})\s*a\s*(\d{1,2}):(\d{2})/i);
    if (tMatch) {
      sHour = parseInt(tMatch[1], 10);
      sMin = parseInt(tMatch[2], 10);
      eHour = parseInt(tMatch[3], 10);
      eMin = parseInt(tMatch[4], 10);
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const dtStart = `${year}${pad(month)}${pad(day)}T${pad(sHour)}${pad(sMin)}00`;
    const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(eHour)}${pad(eMin)}00`;
    const chamberLabel = cit.chamber === "SR" ? "Senado de Chile" : "Cámara de Diputadas y Diputados de Chile";

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LegisTrack CL//Legislative Calendar//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:sesion-${Date.now()}-${Math.random().toString(36).substring(2, 7)}@legistrack.cl
DTSTAMP:${dtStart}Z
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:Sesión ${cit.tipoSesion}: ${cit.comision}
DESCRIPTION:Materia: ${cit.materia}\\n\\nOrden del día:\\n${cit.ordenDelDia.join("\\n")}${cit.invitados ? `\\n\\nInvitados:\\n${cit.invitados}` : ""}\\n\\nPreside: ${cit.presidente}\\nTransmisión: ${cit.canalTransmision}
LOCATION:${cit.lugar} (${chamberLabel})
STATUS:CONFIRMED
CATEGORIES:Legislativo,Congreso,Comisiones
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `citacion_${cit.comision.slice(0, 24).replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedToast("Evento .ics descargado para tu calendario");
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Copy full week executive briefing in Markdown
  const handleCopyWeekDigest = () => {
    const lines: string[] = [
      `# 🏛️ MINUTA EJECUTIVA DE CITACIONES - CONGRESO NACIONAL`,
      `*Vista: ${scope === "mis-comisiones" ? "Mis Comisiones Seguidas" : scope === "proximas" ? "Próximas Sesiones Vigentes" : "Agenda Legislativa"} (${currentYear}) | Total convocatorias: ${filteredCitaciones.length}*`,
      ``,
      `| Horario | Corporación | Comisión | Sala | Materia / Boletín | Preside |`,
      `|---|---|---|---|---|---|`
    ];

    for (const c of filteredCitaciones) {
      const corp = c.chamber === "SR" ? "Senado" : "Cámara";
      const bol = c.boletin ? ` (Bol. ${c.boletin})` : "";
      const mat = c.materia.length > 70 ? c.materia.slice(0, 67) + "..." : c.materia;
      lines.push(`| ${c.fechaISO.split(",")[0]} ${c.hora} | ${corp} | ${c.comision} | ${c.lugar.split(",")[0]} | ${mat}${bol} | ${c.presidente} |`);
    }

    lines.push(``, `*Generado por LegisTrack CL - Plataforma de Seguimiento Legislativo del Congreso Nacional de Chile.*`);
    robustCopyToClipboard(lines.join("\n"));
    setCopiedToast("Minuta ejecutiva copiada al portapapeles");
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  // Handle navigate to commission
  const handleGoToCommission = (cit: Citacion, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setSelectedComisionId && setView) {
      const comId = mapToComisionId(cit.comision, cit.chamber || (activeChamber === "senado" ? "SR" : "CD"));
      setSelectedComisionId(comId);
      setView("comision-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle navigate to bill
  const handleGoToProject = (boletinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setSelectedProyectoId && setView) {
      setSelectedProyectoId(boletinId);
      setView("proyecto-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden font-sans" id="citaciones-camara-widget-container">
      {errorCitaciones && (
        <div className="bg-rose-500/10 border border-rose-400/40 text-rose-100 rounded-2xl px-4 py-3 text-[11px]" role="alert">{errorCitaciones}</div>
      )}
      {fuentesCitaciones && (fuentesCitaciones.camara?.fuente !== "vivo" || fuentesCitaciones.senado?.fuente !== "vivo") && (
        <div className="bg-amber-500/10 border border-amber-400/40 text-amber-100 rounded-2xl px-4 py-3 text-[11px] leading-relaxed">
          <strong className="text-amber-300">Atención:</strong>{" "}
          {fuentesCitaciones.camara?.fuente !== "vivo" && (
            <span>Las citaciones de la Cámara no están disponibles ({fuentesCitaciones.camara?.detalle}); no se muestran datos antiguos en su lugar. </span>
          )}
          {fuentesCitaciones.senado?.fuente !== "vivo" && (
            <span>Las citaciones del Senado no están disponibles ({fuentesCitaciones.senado?.detalle}). </span>
          )}
          Revisa el sitio oficial para la agenda vigente.
        </div>
      )}
      {/* Toast Feedback Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-950/95 border border-emerald-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Atmospheric dynamic gradient accents */}
      <div className="absolute -right-28 -top-28 w-72 h-72 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-28 -bottom-28 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* Top Header and Branding Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6 relative z-10">
        <div className="text-left space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Landmark className="w-3 h-3 text-blue-400" />
              Congreso Nacional de Chile
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Agenda Oficial en Vivo
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
              Valparaíso • Año Legislativo {currentYear}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Calendario de Citaciones Semanales
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl font-medium leading-relaxed">
            Acceso unificado y detallado a la tabla, invitados, actas y órdenes del día de cada comisión legislativa.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          <button 
            onClick={() => fetchLiveCitaciones(true)}
            disabled={isLiveSyncing}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-400/50 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Sincronizar citaciones en vivo desde los portales oficiales del Senado y Cámara"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLiveSyncing ? "animate-spin text-white" : "text-blue-200"}`} />
            <span>{isLiveSyncing ? "Sincronizando..." : "Sincronizar"}</span>
          </button>
          <a
            href="https://www.senado.cl/actividad-legislativa/comisiones/citaciones"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Abrir portal oficial de citaciones a comisiones del Senado de Chile"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Portal Senado</span>
          </a>
          <a
            href="https://www.camara.cl/legislacion/comisiones/citaciones_semana.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Abrir portal oficial de citaciones de la Cámara de Diputadas y Diputados"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Portal Cámara</span>
          </a>
          <button 
            onClick={handleCopyWeekDigest}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Copiar resumen estructurado de las citaciones visibles en Markdown"
          >
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            <span>Copiar Minuta</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Primary Scope Tabs: [⭐ Mis Comisiones] [📅 Próximas y Hoy] [🌐 Todas] [🕰️ Historial] */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-2 rounded-2xl border border-slate-800 relative z-10">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setScope("mis-comisiones");
              setSelectedCommissionFilter("todas");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              scope === "mis-comisiones"
                ? "bg-amber-500 text-slate-950 shadow-lg font-black border border-amber-400"
                : "text-slate-300 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${scope === "mis-comisiones" ? "fill-slate-950 text-slate-950" : "text-amber-400"}`} />
            <span>Mis Comisiones Seguidas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              scope === "mis-comisiones" ? "bg-slate-900 text-amber-300" : "bg-slate-800 text-slate-400"
            }`}>
              {followedComs.length}
            </span>
          </button>

          <button
            onClick={() => {
              setScope("proximas");
              setSelectedCommissionFilter("todas");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              scope === "proximas"
                ? "bg-blue-600 text-white shadow-lg border border-blue-400/50"
                : "text-slate-300 hover:text-white hover:bg-slate-850"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-300" />
            <span>Próximas y Hoy</span>
          </button>

          <button
            onClick={() => {
              setScope("todas");
              setSelectedCommissionFilter("todas");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              scope === "todas"
                ? "bg-indigo-600 text-white shadow-lg border border-indigo-400/50"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <span>Todas las Comisiones</span>
          </button>

          <button
            onClick={() => {
              setScope("historial");
              setSelectedCommissionFilter("todas");
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              scope === "historial"
                ? "bg-slate-800 text-slate-200 border border-slate-700 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title="Ver actas y citaciones de sesiones pasadas desde el 11 de Marzo"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Historial (Desde 11 Marzo)</span>
          </button>
        </div>

        {/* Month Quick Filters (March to September) */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Mes:</span>
          {(["todos", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                selectedMonth === m
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {m === "todos" ? "Todos" : m.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* View Layout Mode Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "timeline" 
                ? "bg-slate-800 text-white shadow-xs border border-slate-700" 
                : "text-slate-400 hover:text-white"
            }`}
            title="Vista de cronograma diario"
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Cronograma</span>
          </button>

          <button 
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid" 
                ? "bg-slate-800 text-white shadow-xs border border-slate-700" 
                : "text-slate-400 hover:text-white"
            }`}
            title="Vista de tarjetas en cuadrícula"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Tarjetas</span>
          </button>

          <button 
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "table" 
                ? "bg-slate-800 text-white shadow-xs border border-slate-700" 
                : "text-slate-400 hover:text-white"
            }`}
            title="Vista de tabla ejecutiva"
          >
            <TableIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-inner backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Citaciones Visibles</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-white">{metrics.total}</span>
            <span className="text-[10px] text-slate-400 font-semibold">sesiones</span>
          </div>
        </div>

        <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-inner backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Con Invitados / Ministros</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-sky-300">{metrics.withGuests}</span>
            <span className="text-[10px] text-slate-400 font-semibold">audiencias</span>
          </div>
        </div>

        <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-inner backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Proyectos en Tabla</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-300">{metrics.withBills}</span>
            <span className="text-[10px] text-slate-400 font-semibold">boletines de ley</span>
          </div>
        </div>

        <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-inner backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Transmisión Online</span>
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-rose-300">{metrics.liveOnline}</span>
            <span className="text-[10px] text-slate-400 font-semibold">canales CDTV / Senado</span>
          </div>
        </div>
      </div>

      {/* Secondary Controls Bar: Chamber Filter & Commission Dropdown Picker */}
      <div className="bg-slate-850/90 border border-slate-800/90 p-3.5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 shadow-md">
        {/* Chamber Selection */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1 hidden sm:inline">
            Corporación:
          </span>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveChamber("todas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChamber === "todas" 
                  ? "bg-indigo-600 text-white shadow-md border border-indigo-500/40" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Ambas Cámaras
            </button>
            <button 
              onClick={() => setActiveChamber("camara")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChamber === "camara" 
                  ? "bg-blue-600 text-white shadow-md border border-blue-500/40" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cámara
            </button>
            <button 
              onClick={() => setActiveChamber("senado")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChamber === "senado" 
                  ? "bg-amber-600 text-white shadow-md border border-amber-500/40" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Senado
            </button>
          </div>
        </div>

        {/* Commission Dropdown Picker */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 hidden md:inline">
            Comisión:
          </span>
          <div className="relative w-full">
            <select
              value={selectedCommissionFilter}
              onChange={(e) => setSelectedCommissionFilter(e.target.value)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none pr-8 truncate"
            >
              <option value="todas">🏛️ Todas las comisiones ({uniqueCommissions.length} disponibles)</option>
              <optgroup label="Cámara de Diputadas y Diputados">
                {uniqueCommissions.filter(c => c.chamber === "CD").map(c => (
                  <option key={`cd-${c.nombre}`} value={c.nombre}>
                    {c.nombre} ({c.count} {c.count === 1 ? 'sesión' : 'sesiones'})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Senado de la República">
                {uniqueCommissions.filter(c => c.chamber === "SR").map(c => (
                  <option key={`sr-${c.nombre}`} value={c.nombre}>
                    {c.nombre} ({c.count} {c.count === 1 ? 'sesión' : 'sesiones'})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedCommissionFilter !== "todas" && (
            <button
              onClick={() => setSelectedCommissionFilter("todas")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
              title="Limpiar filtro de comisión"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col gap-3 relative z-10">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por comisión, materia en tabla, ministro o invitado, presidente, sala o número de boletín..."
            className="w-full bg-slate-850 hover:bg-slate-800/90 border border-slate-800 focus:border-blue-500/60 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner font-semibold"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Day-of-week Pills and Feature Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Day filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Día:</span>
            {[
              { id: "todos", label: "Todos los días" },
              { id: "lunes", label: "Lunes" },
              { id: "martes", label: "Martes" },
              { id: "miercoles", label: "Miércoles" },
              { id: "jueves", label: "Jueves" },
              { id: "viernes", label: "Viernes" }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDayFilter(d.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dayFilter === d.id
                    ? "bg-blue-600 text-white shadow-xs border border-blue-400/50"
                    : "bg-slate-850 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Feature toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyWithGuests(!onlyWithGuests)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                onlyWithGuests
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  : "bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-800"
              }`}
            >
              <Users className="w-3 h-3 text-sky-400" />
              <span>Solo con Invitados</span>
            </button>

            <button
              onClick={() => setOnlyWithBills(!onlyWithBills)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                onlyWithBills
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-800"
              }`}
            >
              <FileText className="w-3 h-3 text-emerald-400" />
              <span>Con Boletín</span>
            </button>

            <button
              onClick={() => setTypeFilter(typeFilter === "Especial" ? "todos" : "Especial")}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                typeFilter === "Especial"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-800"
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Especiales / Urgentes</span>
            </button>

            {(dayFilter !== "todos" || onlyWithGuests || onlyWithBills || typeFilter !== "todos" || searchQuery || selectedCommissionFilter !== "todas") && (
              <button
                onClick={() => {
                  setDayFilter("todos");
                  setOnlyWithGuests(false);
                  setOnlyWithBills(false);
                  setTypeFilter("todos");
                  setSearchQuery("");
                  setSelectedCommissionFilter("todas");
                }}
                className="px-2.5 py-1 text-[11px] font-extrabold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Restablecer Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mt-2">
        {filteredCitaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-850 rounded-2xl border border-dashed border-slate-800 gap-3 text-center p-6">
            <AlertCircle className="w-12 h-12 text-slate-600 animate-bounce" />
            <h4 className="text-base font-extrabold text-slate-200">
              {scope === "mis-comisiones"
                ? "No hay citaciones programadas para tus comisiones seguidas en esta vista"
                : "No se encontraron citaciones para los filtros seleccionados"}
            </h4>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              {scope === "mis-comisiones"
                ? `Actualmente sigues ${followedComs.length} ${followedComs.length === 1 ? "comisión" : "comisiones"}. Puedes ver la agenda de todas las próximas sesiones o seleccionar una comisión específica arriba.`
                : "Intenta cambiar el día de la semana, la corporación o limpiar los términos de búsqueda."}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {scope === "mis-comisiones" ? (
                <>
                  <button 
                    onClick={() => setScope("proximas")}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Ver Próximas Sesiones del Congreso</span>
                  </button>

                  <button 
                    onClick={() => setScope("todas")}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Ver Todas las Comisiones
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setWeek("all");
                    setDayFilter("todos");
                    setOnlyWithGuests(false);
                    setOnlyWithBills(false);
                    setTypeFilter("todos");
                    setSelectedCommissionFilter("todas");
                    setScope("proximas");
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Restaurar filtros y ver agenda vigente
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "timeline" ? (
          /* ========================================================= */
          /* MODE 1: TIMELINE CRONOGRAMA POR DÍA                       */
          /* ========================================================= */
          <div className="flex flex-col gap-8 text-left">
            {(Object.entries(citationsByDay) as [string, Citacion[]][]).map(([dayTitle, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={dayTitle} className="flex flex-col gap-4">
                  {/* Day Sticky Header */}
                  <div className="sticky top-20 z-20 bg-slate-900/90 backdrop-blur-md py-2 border-b border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                      <h4 className="text-base md:text-lg font-black text-white tracking-tight">
                        {dayTitle} ({items[0]?.fechaISO.split(",")[0] || dayTitle})
                      </h4>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                        {items.length} {items.length === 1 ? "sesión" : "sesiones"}
                      </span>
                    </div>
                  </div>

                  {/* Day Sessions List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pl-2 md:pl-4 border-l-2 border-slate-800/80">
                    {items.map((cit, idx) => {
                      const cardId = `timeline-${cit.week}-${cit.comision}-${idx}`;
                      const isExpanded = Boolean(expandedCards[cardId]);
                      const isSR = cit.chamber === "SR";
                      const followed = isCommissionFollowed(cit.comision);

                      return (
                        <div 
                          key={cardId}
                          className="bg-slate-850 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col gap-4 relative overflow-hidden group shadow-lg"
                        >
                          {/* Accent line for chamber */}
                          <div className={`absolute top-0 left-0 right-0 h-[3px] ${isSR ? "bg-amber-500" : "bg-blue-500"}`} />

                          {/* Top Row: Chamber, Week, Type, Bookmark & Quick Actions */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                isSR ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                              }`}>
                                {isSR ? "Senado" : "Cámara"}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                cit.tipoSesion === "Especial" 
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30" 
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}>
                                {cit.tipoSesion}
                              </span>

                              {followed && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                                  <span>Seguida</span>
                                </span>
                              )}
                            </div>

                            {/* Bookmark & Quick Share/ICS icons */}
                            <div className="flex items-center gap-1.5">
                              {toggleFollowCom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFollowCom(cit.comision);
                                    setCopiedToast(followed ? `Dejaste de seguir ${cit.comision}` : `⭐ Siguiendo ${cit.comision}`);
                                    setTimeout(() => setCopiedToast(null), 3000);
                                  }}
                                  title={followed ? "Siguiendo esta comisión (clic para dejar de seguir)" : "Seguir esta comisión"}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                                    followed
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                      : "bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-750 border-slate-700"
                                  }`}
                                >
                                  <Star className={`w-3.5 h-3.5 ${followed ? "fill-amber-400 text-amber-400" : ""}`} />
                                </button>
                              )}

                              <button 
                                onClick={(e) => handleCopyCitacion(cit, e)}
                                title="Copiar citación oficial"
                                className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleDownloadICS(cit, e)}
                                title="Descargar evento .ics para tu calendario"
                                className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Commission Title (Clickable) */}
                          <div className="space-y-1">
                            <h5 
                              onClick={(e) => handleGoToCommission(cit, e)}
                              className="text-base font-extrabold text-white leading-snug group-hover:text-blue-300 transition-colors cursor-pointer flex items-center justify-between gap-2"
                              title="Ver ficha completa de comisión"
                            >
                              <span>{cit.comision}</span>
                              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 shrink-0 group-hover:translate-x-0.5 transition-all" />
                            </h5>
                          </div>

                          {/* Time and Location Box */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>{cit.hora}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate" title={cit.lugar}>{cit.lugar}</span>
                            </div>
                          </div>

                          {/* Main Matter */}
                          <div className="space-y-1 text-xs text-slate-300">
                            <span className="font-extrabold text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              Materia en Tabla:
                            </span>
                            <p className="leading-relaxed font-semibold text-slate-200">
                              {cit.materia}
                            </p>
                          </div>

                          {/* Collapsible Order of the Day */}
                          <div className="border-t border-slate-800/80 pt-2.5">
                            <button
                              onClick={() => toggleExpandCard(cardId)}
                              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 text-xs font-extrabold transition-colors py-1 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
                                Orden del Día ({cit.ordenDelDia.length} puntos)
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isExpanded && (
                              <ul className="space-y-1.5 mt-2 pl-3 border-l border-blue-500/40 animate-fade-in text-xs text-slate-300">
                                {cit.ordenDelDia.map((point, pIdx) => (
                                  <li key={pIdx} className="leading-relaxed">
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Guests and Authorities Box */}
                          {cit.invitados && (
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                              <span className="font-extrabold text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                                <Users className="w-3.5 h-3.5 text-sky-400" />
                                Autoridades e Invitados Citados:
                              </span>
                              <p className="text-slate-300 leading-relaxed font-medium">
                                {cit.invitados}
                              </p>
                            </div>
                          )}

                          {/* Card Footer: President, Bulletin Badge & Live Channel */}
                          <div className="mt-auto pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="text-[11px] truncate max-w-[200px]">Preside: <strong className="text-slate-300">{cit.presidente}</strong></span>
                            </div>

                            {cit.boletin && (
                              <button 
                                onClick={(e) => handleGoToProject(cit.boletin!, e)}
                                className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Ver expediente del boletín de ley"
                              >
                                <span>Bol. {cit.boletin}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Live Transmission Ribbon */}
                          <div className="bg-slate-900 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold text-slate-300 border border-slate-800">
                            <div className="flex items-center gap-2">
                              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                              <span>{cit.canalTransmision}</span>
                            </div>
                            <button
                              onClick={(e) => handleGoToCommission(cit, e)}
                              className="text-[10px] uppercase tracking-wider text-blue-400 hover:text-blue-300 font-black flex items-center gap-1 cursor-pointer"
                            >
                              Ver Comisión
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === "grid" ? (
          /* ========================================================= */
          /* MODE 2: BENTO GRID VIEW                                   */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {filteredCitaciones.map((cit, idx) => {
              const cardId = `grid-${cit.week}-${cit.comision}-${idx}`;
              const isExpanded = Boolean(expandedCards[cardId]);
              const isSR = cit.chamber === "SR";
              const followed = isCommissionFollowed(cit.comision);

              return (
                <div 
                  key={cardId} 
                  className="bg-slate-850 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col gap-4 relative overflow-hidden group shadow-lg"
                >
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${isSR ? "bg-amber-500" : "bg-blue-500"}`} />

                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        isSR ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      }`}>
                        {isSR ? "Senado" : "Cámara"}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {cit.fechaISO.split(",")[0]}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        cit.tipoSesion === "Especial" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}>
                        {cit.tipoSesion}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {toggleFollowCom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowCom(cit.comision);
                            setCopiedToast(followed ? `Dejaste de seguir ${cit.comision}` : `⭐ Siguiendo ${cit.comision}`);
                            setTimeout(() => setCopiedToast(null), 3000);
                          }}
                          title={followed ? "Siguiendo esta comisión" : "Seguir esta comisión"}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                            followed
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-750 border-slate-700"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${followed ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      )}

                      <button 
                        onClick={(e) => handleCopyCitacion(cit, e)}
                        title="Copiar citación oficial"
                        className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDownloadICS(cit, e)}
                        title="Descargar evento .ics"
                        className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Commission Title */}
                  <h4 
                    onClick={(e) => handleGoToCommission(cit, e)}
                    className="text-base font-extrabold text-white leading-snug group-hover:text-blue-300 transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <span>{cit.comision}</span>
                    {followed && <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 shrink-0 group-hover:translate-x-0.5 transition-all" />
                  </h4>

                  {/* Hour and Room */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{cit.hora}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate" title={cit.lugar}>{cit.lugar}</span>
                    </div>
                  </div>

                  {/* Matter */}
                  <div className="space-y-1 text-xs text-slate-300">
                    <span className="font-extrabold text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Materia Principal:
                    </span>
                    <p className="leading-relaxed font-semibold text-slate-200">
                      {cit.materia}
                    </p>
                  </div>

                  {/* Order of the Day */}
                  <div className="border-t border-slate-800/80 pt-2.5">
                    <button
                      onClick={() => toggleExpandCard(cardId)}
                      className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 text-xs font-extrabold transition-colors py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
                        Orden del Día ({cit.ordenDelDia.length} puntos)
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <ul className="space-y-1.5 mt-2 pl-3 border-l border-blue-500/40 animate-fade-in text-xs text-slate-300">
                        {cit.ordenDelDia.map((point, pIdx) => (
                          <li key={pIdx} className="leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Guests */}
                  {cit.invitados && (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                      <span className="font-extrabold text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        Invitados y Autoridades:
                      </span>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {cit.invitados}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-400 font-bold">
                      Preside: <strong className="text-slate-300">{cit.presidente}</strong>
                    </span>
                    {cit.boletin && (
                      <button 
                        onClick={(e) => handleGoToProject(cit.boletin!, e)}
                        className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Bol. {cit.boletin}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Live Stream */}
                  <div className="bg-slate-900 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold text-slate-300 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>{cit.canalTransmision}</span>
                    </div>
                    <button
                      onClick={(e) => handleGoToCommission(cit, e)}
                      className="text-[10px] uppercase tracking-wider text-blue-400 hover:text-blue-300 font-black"
                    >
                      Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* MODE 3: EXECUTIVE TABLE / MINUTA VIEW                     */
          /* ========================================================= */
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-850 shadow-xl text-left">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 px-4">Día & Horario</th>
                  <th className="py-3 px-3">Cámara</th>
                  <th className="py-3 px-4">Comisión</th>
                  <th className="py-3 px-3">Lugar / Sala</th>
                  <th className="py-3 px-4">Materia / Boletín</th>
                  <th className="py-3 px-3">Invitados</th>
                  <th className="py-3 px-3">Preside</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-semibold">
                {filteredCitaciones.map((cit, idx) => {
                  const isSR = cit.chamber === "SR";
                  const followed = isCommissionFollowed(cit.comision);

                  return (
                    <tr key={idx} className="hover:bg-slate-800/60 transition-colors group">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-white text-xs">{cit.fechaISO.split(",")[0]}</div>
                        <div className="text-[11px] text-blue-400 font-mono font-bold mt-0.5">{cit.hora}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                          isSR ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        }`}>
                          {isSR ? "Senado" : "Cámara"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={(e) => handleGoToCommission(cit, e)}
                            className="font-extrabold text-white hover:text-blue-300 cursor-pointer transition-colors block"
                          >
                            {cit.comision}
                          </span>
                          {followed && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{cit.canalTransmision}</span>
                      </td>
                      <td className="py-3.5 px-3 min-w-[150px] text-slate-400 text-[11px]">
                        {cit.lugar}
                      </td>
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <p className="line-clamp-2 text-xs text-slate-200 font-medium leading-relaxed">
                          {cit.materia}
                        </p>
                        {cit.boletin && (
                          <button 
                            onClick={(e) => handleGoToProject(cit.boletin!, e)}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-extrabold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded hover:bg-blue-900 transition-colors cursor-pointer"
                          >
                            Boletín {cit.boletin} <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-3 max-w-[180px] text-[11px] text-slate-400">
                        {cit.invitados ? (
                          <span className="line-clamp-2" title={cit.invitados}>{cit.invitados}</span>
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px]">Sin audiencia externa</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-300 text-[11px]">
                        {cit.presidente}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {toggleFollowCom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFollowCom(cit.comision);
                                setCopiedToast(followed ? `Dejaste de seguir ${cit.comision}` : `⭐ Siguiendo ${cit.comision}`);
                                setTimeout(() => setCopiedToast(null), 3000);
                              }}
                              title={followed ? "Siguiendo" : "Seguir"}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                followed
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : "bg-slate-800 hover:bg-slate-750 text-slate-400 border-slate-700"
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${followed ? "fill-amber-400" : ""}`} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => handleCopyCitacion(cit, e)}
                            title="Copiar citación"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => handleDownloadICS(cit, e)}
                            title="Descargar .ics"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
