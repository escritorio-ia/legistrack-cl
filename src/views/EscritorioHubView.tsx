import React from "react";
import {
  FileText,
  Globe,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Building2,
  Scale,
  Activity,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  ShieldCheck,
  ChevronRight,
  Radio,
  FileSpreadsheet
} from "lucide-react";

interface EscritorioHubViewProps {
  setView: (view: string) => void;
  setSelectedProyectoId?: (id: string) => void;
  setSelectedComisionId?: (id: string) => void;
  followedProys?: string[];
}

export default function EscritorioHubView({
  setView,
  setSelectedProyectoId,
  setSelectedComisionId,
  followedProys = []
}: EscritorioHubViewProps) {
  return (
    <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-10" id="hub-suite-root">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              SUITE ESCRITORIO++ &bull; 2026
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API CONGRESO ONLINE
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Plataforma Integral de <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Inteligencia Legislativa</span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed max-w-2xl">
            Bienvenido a <strong>Escritorio++</strong>. Monitorea trámites parlamentarios de Chile en tiempo real, compara marcos jurídicos de 27 países u obtén minutas estadísticas sectoriales asistidas por IA.
          </p>
        </div>

        {/* Global Key Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-800/80 z-10 relative">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 text-center hover:bg-white/10 transition-colors">
            <span className="text-[10px] sm:text-2xs uppercase text-slate-400 font-mono font-bold block">Boletines Activos</span>
            <span className="text-lg sm:text-2xl font-black text-white block mt-0.5">4.820+</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 text-center hover:bg-white/10 transition-colors">
            <span className="text-[10px] sm:text-2xs uppercase text-slate-400 font-mono font-bold block">Comisiones</span>
            <span className="text-lg sm:text-2xl font-black text-blue-400 block mt-0.5">52 Mesas</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 text-center hover:bg-white/10 transition-colors">
            <span className="text-[10px] sm:text-2xs uppercase text-slate-400 font-mono font-bold block">Países Comparados</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-400 block mt-0.5">27 Países</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 text-center hover:bg-white/10 transition-colors">
            <span className="text-[10px] sm:text-2xs uppercase text-slate-400 font-mono font-bold block">Series Históricas</span>
            <span className="text-lg sm:text-2xl font-black text-amber-400 block mt-0.5">1990–2026</span>
          </div>
        </div>

      </div>

      {/* Main Suite Product Selector Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Aplicaciones de la Suite</h2>
            <p className="text-xs text-slate-500">Selecciona el módulo de trabajo que deseas abrir</p>
          </div>
          <span className="text-2xs font-mono font-bold text-slate-500 bg-slate-200/70 px-3 py-1 rounded-full self-start sm:self-auto">
            3 MÓDULOS DISPONIBLES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Card 1: Legislación++ */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  MONITOREO EN VIVO
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  Legislación++
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Monitoreo parlamentario en tiempo real de boletines de ley, comisiones de la Cámara de Diputados y el Senado, votaciones en Sala y simulador de quórums.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Proyectos de Ley:</strong> Boletines y Visor Diff</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Comisiones:</strong> 52 mesas de Cámara y Senado</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Sala en Vivo:</strong> Streaming y votaciones</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setView("dashboard")}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
              id="enter-legislacion-btn"
            >
              <span>Abrir Legislación++</span>
              <ArrowRight className="w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: Derecho Comparado++ */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  27 PAÍSES
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  Derecho Comparado++
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Ecosistema de Derecho Comparado e inteligencia normativa internacional. Matrices cruzadas de regulaciones homólogas en OCDE, UE y América Latina.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Indexación oficial BCN, BOE, EUR-Lex</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Matriz de Síntesis Jurídica Asistida por IA</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Mapas y contrastes normativos</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setView("legislacion-comparada")}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
              id="enter-derecho-comparado-btn"
            >
              <span>Abrir Derecho Comparado++</span>
              <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 3: Statistics++ */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ANALÍTICA & MINUTAS
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  Statistics++
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Explorador de datos públicos y políticas públicas con series históricas 1990–2026, estadísticas territoriales de las 16 regiones (BCN SIIT) y comparativas internacionales.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Series Temporales (Chile vs OCDE / LatAm)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Estadísticas Territoriales 16 Regiones BCN SIIT</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Generador de Minutas Técnicas en Word (.doc)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setView("static")}
              className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
              id="enter-statistics-btn"
            >
              <span>Abrir Statistics++</span>
              <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>

      {/* Quick Access Section */}
      <div className="bg-slate-50 rounded-3xl p-5 sm:p-8 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>ACCESOS DIRECTOS DE ALTA FRECUENCIA</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => {
              if (setSelectedProyectoId) setSelectedProyectoId("16.621-13");
              setView("proyecto-detail");
            }}
            className="p-4 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-2xl text-left transition-all shadow-2xs group cursor-pointer"
          >
            <span className="text-2xs font-mono font-bold text-blue-600 block">Boletín 16.621-13</span>
            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block mt-0.5">Teletrabajo y Cuidados</span>
            <span className="text-2xs text-slate-400 mt-1 block group-hover:text-blue-600 transition-colors">Simulador & Quórums &rsaquo;</span>
          </button>

          <button
            onClick={() => setView("sala")}
            className="p-4 bg-white hover:bg-rose-50/70 border border-slate-200 hover:border-rose-300 rounded-2xl text-left transition-all shadow-2xs group cursor-pointer"
          >
            <span className="text-2xs font-mono font-bold text-rose-600 block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              SALA EN VIVO
            </span>
            <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700 block mt-0.5">Sesiones de Hoy</span>
            <span className="text-2xs text-slate-400 mt-1 block group-hover:text-rose-600 transition-colors">Votaciones & Streaming &rsaquo;</span>
          </button>

          <button
            onClick={() => setView("static")}
            className="p-4 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all shadow-2xs group cursor-pointer"
          >
            <span className="text-2xs font-mono font-bold text-emerald-600 block">DIPRES ANALYTICS</span>
            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block mt-0.5">Gasto Fiscal Sectorial</span>
            <span className="text-2xs text-slate-400 mt-1 block group-hover:text-emerald-600 transition-colors">Minutas en Word &rsaquo;</span>
          </button>

          <button
            onClick={() => setView("configuracion")}
            className="p-4 bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-2xl text-left transition-all shadow-2xs group cursor-pointer"
          >
            <span className="text-2xs font-mono font-bold text-purple-600 block">DIAGNÓSTICO</span>
            <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 block mt-0.5">Salud de APIs & IA</span>
            <span className="text-2xs text-slate-400 mt-1 block group-hover:text-purple-600 transition-colors">Monitoreo de Red &rsaquo;</span>
          </button>
        </div>
      </div>

    </div>
  );
}
