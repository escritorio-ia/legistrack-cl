/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";
import {
  Search,
  Zap,
  Briefcase,
  Activity,
  Shield,
  Vote,
  MapPin,
  TrendingUp,
  FileDown,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Table,
  LineChart as ChartIcon,
  Map as MapIcon,
  FileText,
  Bookmark,
  Share2,
  Download,
  Building2,
  CheckCircle2,
  Sprout,
  X,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpRight,
  Filter,
  Grid,
  Maximize2,
  ArrowLeft,
  GraduationCap,
  BarChart3,
  Fish
} from "lucide-react";
import {
  OWID_TOPICS,
  OWID_INDICATORS,
  OWIDIndicator,
  OWIDTopic
} from "../../server/services/publicDataService";
import { normalizeSearchText } from "../utils/textUtils";

interface StaticDataAnalyticsViewProps {
  setView?: (view: string) => void;
  setSelectedProyectoId?: (id: string) => void;
}

const TOPIC_ICONS: Record<string, any> = {
  "energia-clima": Zap,
  "pobreza-empleo": Briefcase,
  "salud-esperanza": Activity,
  "seguridad-justicia": Shield,
  "elecciones-bcn": Vote,
  "territorio-siit": MapPin,
  "agricultura-fao": Sprout,
  "mineria-economia": TrendingUp,
  "educacion-mineduc": GraduationCap,
  "ine-estadisticas": BarChart3,
  "pesca-sernapesca": Fish
};

const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string; badge: string; chartColor: string }> = {
  "energia-clima": { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30", badge: "bg-amber-50 text-amber-700 border-amber-200", chartColor: "#f59e0b" },
  "pobreza-empleo": { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30", badge: "bg-blue-50 text-blue-700 border-blue-200", chartColor: "#3b82f6" },
  "salud-esperanza": { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/30", badge: "bg-pink-50 text-pink-700 border-pink-200", chartColor: "#ec4899" },
  "seguridad-justicia": { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-500/30", badge: "bg-rose-50 text-rose-700 border-rose-200", chartColor: "#ef4444" },
  "elecciones-bcn": { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/30", badge: "bg-purple-50 text-purple-700 border-purple-200", chartColor: "#8b5cf6" },
  "territorio-siit": { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/30", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", chartColor: "#06b6d4" },
  "agricultura-fao": { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", chartColor: "#16a34a" },
  "mineria-economia": { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-500/30", badge: "bg-teal-50 text-teal-700 border-teal-200", chartColor: "#0d9488" },
  "educacion-mineduc": { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/30", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", chartColor: "#6366f1" },
  "ine-estadisticas": { bg: "bg-sky-500/10", text: "text-sky-600", border: "border-sky-500/30", badge: "bg-sky-50 text-sky-700 border-sky-200", chartColor: "#0284c7" },
  "pesca-sernapesca": { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-500/30", badge: "bg-teal-50 text-teal-700 border-teal-200", chartColor: "#0d9488" }
};

export default function StaticDataAnalyticsView({ setView: _setView, setSelectedProyectoId: _setSelectedProyectoId }: StaticDataAnalyticsViewProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("all");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>("all");
  
  // Active Deep Dive Indicator (when inspecting an indicator in detail)
  const [activeIndicatorId, setActiveIndicatorId] = useState<string>("matriz-renovable-pct");
  const [displayMode, setDisplayMode] = useState<"catalog" | "deep-dive">("catalog");
  const [viewMode, setViewMode] = useState<"chart" | "map" | "table" | "briefing">("chart");
  const [timeRange, setTimeRange] = useState<"all" | "2000" | "recent">("all");
  const [showOECD, setShowOECD] = useState<boolean>(true);
  const [showLatAm, setShowLatAm] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState(false);

  const allIndicators = useMemo(() => Object.values(OWID_INDICATORS), []);
  const allTopics = useMemo(() => Object.values(OWID_TOPICS), []);

  // Filter indicators by search query and topic
  const filteredIndicators = useMemo(() => {
    return allIndicators.filter(ind => {
      // Topic filter
      if (selectedTopicFilter !== "all" && ind.categoria !== selectedTopicFilter) {
        return false;
      }
      
      // Source filter
      if (selectedSourceFilter !== "all") {
        if (!normalizeSearchText(ind.fuente).includes(normalizeSearchText(selectedSourceFilter))) {
          return false;
        }
      }

      // Text search query (Insensible a tildes / acentos y mayúsculas)
      if (searchQuery.trim()) {
        const q = normalizeSearchText(searchQuery);
        const matchTitle = normalizeSearchText(ind.titulo).includes(q);
        const matchSub = normalizeSearchText(ind.subtitulo).includes(q);
        const matchDef = normalizeSearchText(ind.definicion).includes(q);
        const matchSource = normalizeSearchText(ind.fuente).includes(q);
        const matchHitos = ind.hitosLegislativos?.some(h => 
          normalizeSearchText(h.ley).includes(q) || normalizeSearchText(h.descripcion).includes(q)
        );
        const matchTopic = normalizeSearchText(OWID_TOPICS[ind.categoria]?.nombre).includes(q);
        
        return matchTitle || matchSub || matchDef || matchSource || matchHitos || matchTopic;
      }

      return true;
    });
  }, [allIndicators, selectedTopicFilter, selectedSourceFilter, searchQuery]);

  const activeIndicator: OWIDIndicator = OWID_INDICATORS[activeIndicatorId] || OWID_INDICATORS["matriz-renovable-pct"];
  const activeTopic = OWID_TOPICS[activeIndicator.categoria] || OWID_TOPICS["energia-clima"];
  const activeTheme = TOPIC_COLORS[activeIndicator.categoria] || TOPIC_COLORS["energia-clima"];

  // Filter time series based on time range
  const filteredTimeSeries = useMemo(() => {
    if (!activeIndicator.serieHistorica) return [];
    if (timeRange === "recent") {
      return activeIndicator.serieHistorica.filter(p => p.year >= 2018);
    }
    if (timeRange === "2000") {
      return activeIndicator.serieHistorica.filter(p => p.year >= 2000);
    }
    return activeIndicator.serieHistorica;
  }, [activeIndicator, timeRange]);

  // Sort regional data high to low
  const sortedRegionalData = useMemo(() => {
    if (!activeIndicator.datosRegionales) return [];
    return [...activeIndicator.datosRegionales].sort((a, b) => b.valor - a.valor);
  }, [activeIndicator]);

  const handleOpenDeepDive = (indicatorId: string) => {
    setActiveIndicatorId(indicatorId);
    setDisplayMode("deep-dive");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate Word Document (.doc) for any indicator
  const handleDownloadWordReport = (ind: OWIDIndicator = activeIndicator) => {
    const topic = OWID_TOPICS[ind.categoria] || OWID_TOPICS["energia-clima"];
    const contentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
      <meta charset='utf-8'>
      <title>${ind.titulo}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.5; color: #1e293b; padding: 24pt; }
        h1 { color: #003366; font-size: 18pt; border-bottom: 2pt solid #003366; padding-bottom: 6pt; margin-top: 18pt; }
        h2 { color: #0f172a; font-size: 14pt; margin-top: 14pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 4pt; }
        p { font-size: 11pt; margin-bottom: 8pt; }
        .kpi-table { width: 100%; border-collapse: collapse; margin-top: 12pt; }
        .kpi-table td { padding: 8pt; border: 1pt solid #cbd5e1; vertical-align: top; }
        .kpi-val { font-size: 14pt; font-weight: bold; color: #003366; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10pt; font-size: 10pt; }
        .data-table th, .data-table td { padding: 6pt 8pt; border: 1pt solid #cbd5e1; text-align: left; }
        .data-table th { background-color: #003366; color: white; }
        .box { background: #f8fafc; border-left: 4pt solid #003366; padding: 10pt; margin: 12pt 0; font-style: italic; }
      </style>
      </head>
      <body>
        <div style="text-align: right; font-size: 9pt; color: #64748b; margin-bottom: 12pt;">
          <strong>STATISTICS++ LEGISLATIVE ANALYTICS SUITE</strong><br/>
          Congreso Nacional de Chile &bull; Dirección de Estudios y Analítica Pública
        </div>

        <h1>INFORME TÉCNICO: ${ind.titulo.toUpperCase()}</h1>
        <p><strong>Tema:</strong> ${topic.nombre}</p>
        <p><strong>Variable:</strong> ${ind.subtitulo}</p>
        <p><strong>Unidad de Medida:</strong> ${ind.unidad}</p>
        <p><strong>Fuente Oficial:</strong> ${ind.fuente}</p>
        <p><strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}</p>
        
        <div class="box">
          <strong>Síntesis Diagnóstica:</strong> ${ind.sintesisDiagnostica}
        </div>

        <h2>1. Serie Histórica de Datos</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Año</th>
              <th>Chile (${ind.unidad})</th>
              <th>Promedio OCDE</th>
              <th>Promedio LatAm</th>
              <th>Hito / Anotación</th>
            </tr>
          </thead>
          <tbody>
            ${ind.serieHistorica.map(p => `
              <tr>
                <td><strong>${p.year}</strong></td>
                <td>${p.chile.toLocaleString("es-CL")}</td>
                <td>${p.oecd_avg !== undefined ? p.oecd_avg.toLocaleString("es-CL") : "-"}</td>
                <td>${p.latam_avg !== undefined ? p.latam_avg.toLocaleString("es-CL") : "-"}</td>
                <td>${p.annotation || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        ${ind.datosRegionales && ind.datosRegionales.length > 0 ? `
          <h2>2. Distribución Territorial por Regiones</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Región</th>
                <th>Código</th>
                <th>Valor (${ind.unidad})</th>
                <th>Población Aprox.</th>
              </tr>
            </thead>
            <tbody>
              ${ind.datosRegionales.map(r => `
                <tr>
                  <td><strong>${r.region}</strong></td>
                  <td>${r.codigo}</td>
                  <td>${r.valor.toLocaleString("es-CL")}</td>
                  <td>${r.poblacion ? r.poblacion.toLocaleString("es-CL") : "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : ""}

        ${ind.hitosLegislativos && ind.hitosLegislativos.length > 0 ? `
          <h2>3. Principales Hitos y Reformas Legales Aprobadas</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Año</th>
                <th>Ley / Norma</th>
                <th>Boletín</th>
                <th>Descripción del Impacto</th>
              </tr>
            </thead>
            <tbody>
              ${ind.hitosLegislativos.map(h => `
                <tr>
                  <td><strong>${h.year}</strong></td>
                  <td><strong>${h.ley}</strong></td>
                  <td>${h.boletin || "-"}</td>
                  <td>${h.descripcion}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : ""}

        <div style="margin-top: 24pt; font-size: 8.5pt; color: #64748b; border-top: 1pt solid #cbd5e1; padding-top: 8pt;">
          Documento elaborado automáticamente por el motor analítico <strong>Statistics++</strong> de la suite <strong>Escritorio++</strong>, integrando fuentes y series oficiales de políticas públicas.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + contentHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Minuta_${ind.id}_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export CSV for any indicator
  const handleExportCSV = (ind: OWIDIndicator = activeIndicator) => {
    let csv = "Año,Chile,Promedio_OCDE,Promedio_LatAm,Anotacion\n";
    ind.serieHistorica.forEach(row => {
      csv += `${row.year},${row.chile},${row.oecd_avg || ""},${row.latam_avg || ""},"${row.annotation || ""}"\n`;
    });

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datos_${ind.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const summary = `${activeIndicator.titulo} (${activeIndicator.subtitulo})\n\nDiagnóstico: ${activeIndicator.sintesisDiagnostica}\n\nFuente: ${activeIndicator.fuente}\nÚltimo valor registrado: ${activeIndicator.serieHistorica[activeIndicator.serieHistorica.length - 1]?.chile} ${activeIndicator.unidad}`;
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-slate-50 min-h-screen pb-16"
    >
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. HERO SEARCH & DISCOVERY BAR */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl space-y-4 z-10 relative">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-2xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3 h-3" />
                STATISTICS++ DATA EXPLORER
              </span>
              <span className="text-2xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                {allIndicators.length} Indicadores Oficiales Disponibles
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Buscador de Estadísticas Sectoriales & Políticas Públicas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Consulte y explore series multidecenales (1990–2026), comparativas internacionales y datos de las 16 regiones de Chile buscando por tema, institución o palabra clave.
            </p>

            {/* Main Interactive Search Input */}
            <div className="pt-2">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (displayMode === "deep-dive" && e.target.value.trim().length > 0) {
                      setDisplayMode("catalog");
                    }
                  }}
                  placeholder="Buscar por tema o indicador (ej. cerezas, salario mínimo, homicidios, plebiscito, litio, SERVEL, FAOSTAT, CASEN, BCN)..."
                  className="w-full pl-12 pr-10 py-3.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 rounded-2xl border border-white/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-sm font-medium transition-all shadow-inner outline-none placeholder:text-slate-400"
                  id="search-statistics-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1.5 text-slate-400 hover:text-white focus:text-slate-900 rounded-full cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. THEMATIC FILTER PILLS */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                Filtrar por Eje Temático:
              </span>
            </div>

            {/* Quick Layout Mode Buttons */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setDisplayMode("catalog")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  displayMode === "catalog"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Catálogo de Resultados ({filteredIndicators.length})
              </button>
              <button
                onClick={() => setDisplayMode("deep-dive")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  displayMode === "deep-dive"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Explorador Detallado
              </button>
            </div>
          </div>

          {/* Topic Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedTopicFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedTopicFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todos los Temas</span>
              <span className={`text-2xs px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedTopicFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {allIndicators.length}
              </span>
            </button>

            {allTopics.map(topic => {
              const Icon = TOPIC_ICONS[topic.id] || Layers;
              const isSelected = selectedTopicFilter === topic.id;
              const count = allIndicators.filter(i => i.categoria === topic.id).length;

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicFilter(topic.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? "white" : topic.color }} />
                  <span>{topic.nombre}</span>
                  <span className={`text-2xs px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CATALOG VIEW (GRID OF INTERACTIVE RESULTS) */}
        {/* ========================================================================= */}
        {displayMode === "catalog" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                {filteredIndicators.length} indicadores coincidentes
                {searchQuery ? ` para "${searchQuery}"` : ""}
              </span>
              
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>

            {filteredIndicators.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No se encontraron indicadores</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  No hay resultados que coincidan con <strong>"{searchQuery}"</strong>. Intenta buscar términos como <em>"energía", "salario", "pobreza", "elecciones", "frutas", "litio"</em> o selecciona otro eje temático.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTopicFilter("all");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Ver todos los indicadores
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredIndicators.map((ind) => {
                  const topic = OWID_TOPICS[ind.categoria] || OWID_TOPICS["energia-clima"];
                  const Icon = TOPIC_ICONS[ind.categoria] || Layers;
                  const theme = TOPIC_COLORS[ind.categoria] || TOPIC_COLORS["energia-clima"];
                  const latestPoint = ind.serieHistorica[ind.serieHistorica.length - 1];
                  const firstPoint = ind.serieHistorica[0];
                  const deltaPct = firstPoint?.chile ? (((latestPoint.chile - firstPoint.chile) / firstPoint.chile) * 100).toFixed(1) : null;

                  return (
                    <motion.div
                      key={ind.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      <div className="p-5 space-y-4">
                        {/* Header: Topic badge & Source */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold border flex items-center gap-1.5 ${theme.badge}`}>
                            <Icon className="w-3 h-3" />
                            {topic.nombre}
                          </span>
                          <span className="text-2xs font-mono text-slate-400 truncate max-w-[150px]" title={ind.fuente}>
                            {ind.fuente.split("/")[0]}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <h3 
                            onClick={() => handleOpenDeepDive(ind.id)}
                            className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug cursor-pointer flex items-center justify-between"
                          >
                            <span>{ind.titulo}</span>
                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </h3>
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {ind.subtitulo}
                          </p>
                        </div>

                        {/* KPI Display */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-2xs text-slate-400 uppercase font-mono block">Último Dato ({latestPoint?.year})</span>
                            <span className="text-2xl font-black text-slate-900">
                              {typeof latestPoint?.chile === "number" ? latestPoint.chile.toLocaleString("es-CL") : latestPoint?.chile}
                            </span>
                            <span className="text-2xs font-bold text-slate-500 ml-1.5">{ind.unidad}</span>
                          </div>
                          {deltaPct && (
                            <span className={`text-2xs font-mono font-bold px-2 py-0.5 rounded-md ${
                              Number(deltaPct) >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {Number(deltaPct) >= 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                            </span>
                          )}
                        </div>

                        {/* Mini Sparkline Chart Preview */}
                        <div className="h-24 w-full pt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ind.serieHistorica} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`grad-${ind.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={theme.chartColor} stopOpacity={0.4} />
                                  <stop offset="95%" stopColor={theme.chartColor} stopOpacity={0.0} />
                                </linearGradient>
                              </defs>
                              <Area
                                type="monotone"
                                dataKey="chile"
                                stroke={theme.chartColor}
                                strokeWidth={2.5}
                                fill={`url(#grad-${ind.id})`}
                                dot={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenDeepDive(ind.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          Explorar Gráfico & Regiones
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDownloadWordReport(ind)}
                            title="Descargar Ficha en Word (.doc)"
                            className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-blue-700 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExportCSV(ind)}
                            title="Exportar CSV"
                            className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-emerald-700 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DEEP-DIVE EXPANDED VIEW (FULL EXPLORER WITH 4 MODES) */}
        {/* ========================================================================= */}
        {displayMode === "deep-dive" && (
          <div className="space-y-6">
            
            {/* Navigation back to search catalog */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setDisplayMode("catalog")}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Catálogo de Indicadores
              </button>

              {/* Indicator Quick Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">Cambiar indicador:</span>
                <select
                  value={activeIndicatorId}
                  onChange={(e) => setActiveIndicatorId(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer max-w-[280px] sm:max-w-md truncate"
                >
                  {allTopics.map(topic => (
                    <optgroup key={topic.id} label={topic.nombre}>
                      {allIndicators
                        .filter(i => i.categoria === topic.id)
                        .map(i => (
                          <option key={i.id} value={i.id}>
                            {i.titulo}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Indicator Hero Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold border flex items-center gap-1.5 ${activeTheme.badge}`}>
                      {React.createElement(TOPIC_ICONS[activeIndicator.categoria] || Layers, { className: "w-3 h-3" })}
                      {activeTopic.nombre}
                    </span>
                    <span className="text-2xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Frecuencia: {activeIndicator.frecuencia}
                    </span>
                    <span className="text-2xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Unidad: {activeIndicator.unidad}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {activeIndicator.titulo}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {activeIndicator.subtitulo}
                  </p>
                </div>

                {/* Export & Actions Toolbar */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleDownloadWordReport(activeIndicator)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    id="btn-deepdive-download-word"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Descargar Word (.doc)
                  </button>
                  <button
                    onClick={() => handleExportCSV(activeIndicator)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    id="btn-deepdive-download-csv"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>
                  <button
                    onClick={handleCopySummary}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Copiar resumen"
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Diagnostic Box */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex items-start gap-3.5">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
                  <span className="font-bold text-slate-900 block">Diagnóstico & Síntesis Técnica:</span>
                  <p>{activeIndicator.sintesisDiagnostica}</p>
                </div>
              </div>

              {/* View Mode Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pt-2 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("chart")}
                    className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      viewMode === "chart"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <ChartIcon className="w-4 h-4" />
                    Evolución Temporal
                  </button>

                  {activeIndicator.datosRegionales && activeIndicator.datosRegionales.length > 0 && (
                    <button
                      onClick={() => setViewMode("map")}
                      className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                        viewMode === "map"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <MapIcon className="w-4 h-4" />
                      16 Regiones SIIT ({activeIndicator.datosRegionales.length})
                    </button>
                  )}

                  <button
                    onClick={() => setViewMode("table")}
                    className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Table className="w-4 h-4" />
                    Tabla de Datos
                  </button>

                  <button
                    onClick={() => setViewMode("briefing")}
                    className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      viewMode === "briefing"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Minuta Ejecutiva
                  </button>
                </div>

                {/* Chart Mode Controls */}
                {viewMode === "chart" && (
                  <div className="flex items-center gap-3 pb-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                      <button
                        onClick={() => setTimeRange("all")}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          timeRange === "all" ? "bg-white font-bold text-slate-900 shadow-xs" : "text-slate-600"
                        }`}
                      >
                        Histórico
                      </button>
                      <button
                        onClick={() => setTimeRange("2000")}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          timeRange === "2000" ? "bg-white font-bold text-slate-900 shadow-xs" : "text-slate-600"
                        }`}
                      >
                        2000-2026
                      </button>
                      <button
                        onClick={() => setTimeRange("recent")}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          timeRange === "recent" ? "bg-white font-bold text-slate-900 shadow-xs" : "text-slate-600"
                        }`}
                      >
                        2018-2026
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-2xs font-medium">
                      <label className="flex items-center gap-1 text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showOECD}
                          onChange={(e) => setShowOECD(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span>OCDE</span>
                      </label>
                      <label className="flex items-center gap-1 text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showLatAm}
                          onChange={(e) => setShowLatAm(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-0"
                        />
                        <span>LatAm</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* View Mode 1: Interactive Chart */}
              {viewMode === "chart" && (
                <div className="space-y-6 pt-2">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredTimeSeries} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                        <defs>
                          <linearGradient id="chileGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeTheme.chartColor} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={activeTheme.chartColor} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#64748b" 
                          fontSize={12} 
                          tickLine={false} 
                          dy={10} 
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={12} 
                          tickLine={false} 
                          dx={-10}
                          tickFormatter={(val) => val.toLocaleString("es-CL")}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderRadius: "12px",
                            border: "none",
                            color: "#fff",
                            fontSize: "12px",
                            padding: "10px 14px",
                            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
                          }}
                          formatter={(value: any, name: string) => [
                            `${Number(value).toLocaleString("es-CL")} ${activeIndicator.unidad}`,
                            name === "chile" ? "🇨🇱 Chile" : name === "oecd_avg" ? "🌐 Promedio OCDE" : "🌎 América Latina"
                          ]}
                          labelFormatter={(label) => `Año ${label}`}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        
                        <Area
                          type="monotone"
                          dataKey="chile"
                          name="chile"
                          stroke={activeTheme.chartColor}
                          strokeWidth={3}
                          fill="url(#chileGrad)"
                          activeDot={{ r: 6, stroke: activeTheme.chartColor, strokeWidth: 2, fill: "#fff" }}
                        />

                        {showOECD && (
                          <Line
                            type="monotone"
                            dataKey="oecd_avg"
                            name="oecd_avg"
                            stroke="#64748b"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={false}
                          />
                        )}

                        {showLatAm && (
                          <Line
                            type="monotone"
                            dataKey="latam_avg"
                            name="latam_avg"
                            stroke="#059669"
                            strokeWidth={2}
                            strokeDasharray="2 2"
                            dot={false}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legislative Milestones Timeline Bar */}
                  {activeIndicator.hitosLegislativos && activeIndicator.hitosLegislativos.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                          Hitos & Reformas Legislativas Aprobadas en esta Materia:
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeIndicator.hitosLegislativos.map((hito, idx) => (
                          <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{hito.ley}</span>
                              <span className="text-2xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                Año {hito.year}
                              </span>
                            </div>
                            {hito.boletin && (
                              <span className="text-2xs font-mono text-slate-500 block">Boletín: {hito.boletin}</span>
                            )}
                            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                              {hito.descripcion}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode 2: 16 Regions BarChart */}
              {viewMode === "map" && activeIndicator.datosRegionales && (
                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Ranking ordenado por valor regional ({activeIndicator.unidad})</span>
                    <span className="font-mono">Total: {sortedRegionalData.length} Regiones</span>
                  </div>

                  <div className="h-[460px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sortedRegionalData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.toLocaleString("es-CL")} />
                        <YAxis 
                          type="category" 
                          dataKey="region" 
                          stroke="#334155" 
                          fontSize={11} 
                          tickLine={false} 
                          width={95}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderRadius: "12px",
                            border: "none",
                            color: "#fff",
                            fontSize: "12px",
                            padding: "8px 12px"
                          }}
                          formatter={(value: any) => [`${Number(value).toLocaleString("es-CL")} ${activeIndicator.unidad}`, "Valor Regional"]}
                        />
                        <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                          {sortedRegionalData.map((_entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? activeTheme.chartColor : index < 3 ? "#3b82f6" : "#64748b"} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* View Mode 3: Data Table */}
              {viewMode === "table" && (
                <div className="pt-2 overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-900 text-white font-mono text-2xs uppercase">
                      <tr>
                        <th className="p-3">Año</th>
                        <th className="p-3">Chile ({activeIndicator.unidad})</th>
                        <th className="p-3">Promedio OCDE</th>
                        <th className="p-3">Promedio LatAm</th>
                        <th className="p-3">Hito / Observación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeIndicator.serieHistorica.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 font-medium text-slate-700">
                          <td className="p-3 font-bold font-mono text-slate-900">{row.year}</td>
                          <td className="p-3 font-bold text-blue-700">{row.chile.toLocaleString("es-CL")}</td>
                          <td className="p-3 font-mono">{row.oecd_avg !== undefined ? row.oecd_avg.toLocaleString("es-CL") : "-"}</td>
                          <td className="p-3 font-mono">{row.latam_avg !== undefined ? row.latam_avg.toLocaleString("es-CL") : "-"}</td>
                          <td className="p-3 text-slate-500 italic">{row.annotation || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* View Mode 4: Minuta Ejecutiva */}
              {viewMode === "briefing" && (
                <div className="space-y-6 pt-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-2xs font-mono font-bold text-slate-400 uppercase">Minuta Parlamentaria Oficial</span>
                        <h4 className="text-base font-bold text-slate-900">{activeIndicator.titulo}</h4>
                      </div>
                      <button
                        onClick={() => handleDownloadWordReport(activeIndicator)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Descargar Word (.doc)
                      </button>
                    </div>

                    <div className="prose prose-sm text-slate-700 max-w-none space-y-3">
                      <p><strong>1. Definición Operativa:</strong> {activeIndicator.definicion}</p>
                      <p><strong>2. Diagnóstico y Evolución Histórica:</strong> {activeIndicator.sintesisDiagnostica}</p>
                      <p><strong>3. Fuente Oficial & Cita:</strong> {activeIndicator.fuente}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Methodological Citation Box */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700">Ficha Metodológica & Fuente Oficial:</span>
                  <p className="font-mono text-2xs">{activeIndicator.fuente}</p>
                </div>
                {activeIndicator.urlFuente && (
                  <a
                    href={activeIndicator.urlFuente}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Consultar Fuente Original</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
