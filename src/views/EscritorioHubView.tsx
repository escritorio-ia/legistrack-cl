import React from "react";
import { motion } from "motion/react";
import {
  FileText,
  Globe,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Scale,
  Activity,
  Zap,
  Briefcase,
  Layers,
  Search,
  BookOpen,
  Calendar,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu
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
    <div className="max-w-[1440px] mx-auto w-full px-6 py-8 space-y-10">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              SUITE ESCRITORIO++
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Plataforma Integral de <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Inteligencia Legislativa</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Bienvenido a <strong>Escritorio++</strong>. Selecciona una de las aplicaciones especializadas para monitorear trámites parlamentarios, comparar marcos jurídicos de 27 países o generar informes estadísticos sectoriales.
          </p>
        </div>

        {/* Global Key Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-8 border-t border-slate-800/80 z-10 relative">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
            <span className="text-2xs uppercase text-slate-400 font-mono font-bold">Boletines en Trámite</span>
            <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">4.820+</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
            <span className="text-2xs uppercase text-slate-400 font-mono font-bold">Comisiones Activas</span>
            <span className="text-xl sm:text-2xl font-black text-blue-400 block mt-0.5">52</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
            <span className="text-2xs uppercase text-slate-400 font-mono font-bold">Países Comparados</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 block mt-0.5">27</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
            <span className="text-2xs uppercase text-slate-400 font-mono font-bold">Sectores Analizados</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 block mt-0.5">10</span>
          </div>
        </div>

      </div>

      {/* Main Suite Product Selector Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Aplicaciones de la Suite</h2>
            <p className="text-xs text-slate-500">Selecciona el entorno de trabajo que deseas abrir</p>
          </div>
          <span className="text-2xs font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            3 MÓDULOS ACTIVOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Legislación++ */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  OPERATIVO
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  Legislación++
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Monitoreo parlamentario en tiempo real de boletines de ley, comisiones de la Cámara de Diputados y el Senado, votaciones en Sala y cálculo de quórums.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Proyectos de Ley:</strong> Boletines, Quórums y Visor Diff</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Comisiones:</strong> 52 mesas técnicas de Cámara y Senado</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Sala en Vivo:</strong> Sesiones plenarias, streaming y votaciones</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setView("dashboard")}
              className="mt-6 w-full py-3 bg-[#003366] hover:bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02]"
              id="enter-legislacion-btn"
            >
              <span>Abrir Legislación++</span>
              <ArrowRight className="w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: Derecho Comparado++ */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  27 PAÍSES
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  Derecho Comparado++
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Ecosistema de Derecho Comparado e inteligencia normativa internacional. Matrices cruzadas de regulaciones homólogas en la OCDE, Unión Europea y América Latina.
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
                  <span>Mapas y contrastes normativos artículo a artículo</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setView("legislacion-comparada")}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02]"
              id="enter-derecho-comparado-btn"
            >
              <span>Abrir Derecho Comparado++</span>
              <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 3: Statistics++ */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ESTADÍSTICAS & INFORMES
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  Statistics++
                  <span className="text-2xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">ESTADÍSTICA PÚBLICA</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Explorador de datos públicos y políticas públicas con series históricas 1990–2026, estadísticas territoriales de las 16 regiones (BCN SIIT), elecciones históricas y comparativa internacional OCDE / América Latina.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Series Temporales (Chile vs OCDE / LatAm)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Estadísticas Territoriales & Elecciones BCN SIIT</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Generador de Minutas Técnicas en Word (.doc)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setView("static")}
              className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02]"
              id="enter-statistics-btn"
            >
              <span>Abrir Statistics++</span>
              <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>

      {/* Quick Access to Key Features */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-mono">
          ACCESOS DIRECTOS DE ALTA FRECUENCIA
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              if (setSelectedProyectoId) setSelectedProyectoId("16.621-13");
              setView("proyecto-detail");
            }}
            className="p-4 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl text-left transition-all shadow-2xs group cursor-pointer"
          >
            <span className="text-2xs font-mono font-bold text-blue-600 block">Boletín 16.621-13</span>
            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block mt-0.5">Teletrabajo y Cuidados</span>
            <span className="text-2xs text-slate-400 mt-1 block">Simulador & Quórums &rsaquo;</span>
          </button>

          <button
            onClick={() => setView("sala")}
            className="p-4 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-2xl text-left transition-all shadow-2xs group cursor-pointer"
          >
            <span className="text-2xs font-mono font-bold text-rose-600 block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              SALA EN VIVO
            </span>
            <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700 block mt-0.5">Sesiones de Hoy</span>
            <span className="text-2xs text-slate-400 mt-1 block">Votaciones & Streaming &rsaquo;</span>
          </button>

          <button
            onClick={() => setView("static")}
            className="p-4 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all shadow-2xs group cursor-pointer"
          >
            <span className="text-2xs font-mono font-bold text-emerald-600 block">DIPRES ANALYTICS</span>
            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block mt-0.5">Gasto Fiscal Sectorial</span>
            <span className="text-2xs text-slate-400 mt-1 block">Minutas en Word &rsaquo;</span>
          </button>

          <button
            onClick={() => setView("configuracion")}
            className="p-4 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-2xl text-left transition-all shadow-2xs group cursor-pointer"
          >
            <span className="text-2xs font-mono font-bold text-purple-600 block">SISTEMA & SALUD</span>
            <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 block mt-0.5">Diagnóstico de Red</span>
            <span className="text-2xs text-slate-400 mt-1 block">APIs Congreso & IA &rsaquo;</span>
          </button>
        </div>
      </div>

    </div>
  );
}
