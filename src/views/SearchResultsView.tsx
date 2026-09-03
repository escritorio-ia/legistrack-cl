/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { 
  Search, FileText, Landmark, User, FileSpreadsheet, Calendar, 
  ArrowRight, Sparkles, Filter, Bookmark, AlertCircle, FileCheck, Globe, ExternalLink, Database 
} from "lucide-react";
import { performUnifiedSearch, UnifiedSearchResult } from "../utils/searchEngine";

interface SearchResultsViewProps {
  initialQuery: string;
  setView: (view: string) => void;
  setSelectedProyectoId: (id: string) => void;
  setSelectedComisionId: (id: string) => void;
  setSearchFilter: (value: string) => void;
}

export default function SearchResultsView({
  initialQuery,
  setView,
  setSelectedProyectoId,
  setSelectedComisionId,
  setSearchFilter
}: SearchResultsViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searchingWeb, setSearchingWeb] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "proyectos" | "comisiones" | "fuentes" | "informes" | "autores" | "comparada">("all");
  const [results, setResults] = useState<UnifiedSearchResult>({ 
    proyectos: [], 
    comisiones: [], 
    autores: [], 
    fuentesDatos: [],
    documentos: [], 
    comparada: [],
    webLinks: []
  });

  const fetchResults = async (searchStr: string, forceWeb: boolean = false) => {
    if (!searchStr.trim()) return;
    setLoading(true);
    if (forceWeb) {
      setSearchingWeb(true);
    }

    // 1. Instant robust local multi-dimensional search
    const localRes = performUnifiedSearch(searchStr);
    setResults(localRes);

    // 2. Query live API in background if available
    try {
      const url = `/api/global-search?q=${encodeURIComponent(searchStr)}${forceWeb ? "&force_web=true" : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults({
          proyectos: data.proyectos && data.proyectos.length > 0 ? data.proyectos : localRes.proyectos,
          comisiones: data.comisiones && data.comisiones.length > 0 ? data.comisiones : localRes.comisiones,
          autores: data.autores && data.autores.length > 0 ? data.autores : localRes.autores,
          fuentesDatos: data.fuentesDatos && data.fuentesDatos.length > 0 ? data.fuentesDatos : localRes.fuentesDatos,
          documentos: localRes.documentos,
          comparada: localRes.comparada,
          webLinks: localRes.webLinks
        });
      }
    } catch (error) {
      console.warn("Live API global-search unavailable, using comprehensive client index:", error);
    } finally {
      setLoading(false);
      setSearchingWeb(false);
    }
  };

  useEffect(() => {
    fetchResults(initialQuery);
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFilter(query);
    fetchResults(query);
  };

  const handleQuickSearch = (keyword: string) => {
    setQuery(keyword);
    setSearchFilter(keyword);
    fetchResults(keyword);
  };

  const totalCount = 
    results.proyectos.length + 
    results.comisiones.length + 
    (results.fuentesDatos ? results.fuentesDatos.length : 0) +
    results.documentos.length + 
    results.autores.length +
    (results.comparada ? results.comparada.length : 0);

  return (
    <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-8 animate-fade-in" id="search-results-page">
      {/* Header section with search box */}
      <div className="bg-white border border-slate-200/85 p-6 rounded-2xl shadow-xs flex flex-col gap-6" id="search-results-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-extrabold uppercase tracking-wider">
              Centro de Búsqueda Unificada
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight" id="special-search-title">
              Resultados de Búsqueda Legislativa
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Explora boletines de ley, comisiones, derecho comparado internacional, informes técnicos y autores parlamentarios.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-bold self-start md:self-auto font-mono">
            <span>Query:</span>
            <span className="text-blue-700 font-extrabold">"{initialQuery || "Vacío"}"</span>
          </div>
        </div>

        {/* Big Search Input */}
        <form onSubmit={handleSubmit} className="relative w-full flex gap-3" id="main-search-results-form">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold tracking-wide text-slate-800 transition"
              placeholder="Buscar comisiones, proyectos de ley, materias, autores y más..."
              id="search-results-main-input"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-blue-700 active:transform active:scale-95 transition shadow-sm"
          >
            Buscar ahora
          </button>
        </form>

        {/* Quick terms suggestions */}
        <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Consultas frecuentes:
          </span>
          {["40 horas", "hacienda", "criptoactivos", "salubridad", "Karol Cariola", "reforma previsional"].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleQuickSearch(term)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200/50 transition"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Deep Web AI Search bar */}
      <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/30 border border-blue-200/60 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs" id="web-ai-search-banner">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-200">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">¿Buscas datos reales en vivo del Congreso de Chile?</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Si buscas un boletín de ley, comisiones u opiniones recientes y no están indexados localmente, puedes forzar una búsqueda en la web de <strong>senado.cl</strong> y <strong>camara.cl</strong>.
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchResults(query, true)}
          disabled={loading}
          className="text-xs font-extrabold text-blue-700 bg-white hover:bg-blue-50/70 border border-blue-200 active:scale-95 px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-xs self-stretch md:self-auto justify-center"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
              Buscando en la Web...
            </>
          ) : (
            <>
              Buscar en la Web con IA
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </>
          )}
        </button>
      </div>

      {/* Grid containing tabs and count cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="search-grid-container">
        
        {/* Left column: Categories Navigation & Stats */}
        <div className="flex flex-col gap-6" id="search-sidebar-controls">
          
          {/* Quick Stats Summary */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col gap-4 shadow-sm">
            <div className="absolute right-0 top-0 translate-y-3 translate-x-3 opacity-10 select-none pointer-events-none">
              <Landmark className="w-32 h-32 text-white" />
            </div>
            
            <div className="z-10">
              <span className="text-[9px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                Métricas del Hallazgo
              </span>
              <h3 className="text-2xl font-black mt-2 tracking-tight">
                {loading ? "..." : totalCount}
              </h3>
              <p className="text-[10px] text-slate-300 font-medium">
                Sectores públicos indexados para esta consulta legislativa
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 border-t border-slate-800 pt-3 text-[10px] font-semibold text-slate-400 font-mono">
              <div className="flex flex-col">
                <span className="text-slate-500">Proyectos:</span>
                <span className="text-white font-bold">{results.proyectos.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Fuentes Oficiales:</span>
                <span className="text-blue-400 font-bold">{results.fuentesDatos ? results.fuentesDatos.length : 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Comisiones:</span>
                <span className="text-white font-bold">{results.comisiones.length}</span>
              </div>
              <div className="flex flex-col mt-1">
                <span className="text-slate-500">Comparada:</span>
                <span className="text-purple-400 font-bold">{results.comparada ? results.comparada.length : 0}</span>
              </div>
              <div className="flex flex-col mt-1">
                <span className="text-slate-500">Autores:</span>
                <span className="text-white font-bold">{results.autores.length}</span>
              </div>
            </div>
          </div>

          {/* Navigation Category Tabs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col gap-1 shadow-xs" id="search-category-tabs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 py-2">
              Filtrar por Categoría
            </span>
            
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center justify-between w-full p-2.5 rounded-lg text-xs font-bold transition text-left ${activeTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <span className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Todo lo Encontrado
              </span>
              <span className="font-mono text-[10px] tracking-tight">{totalCount}</span>
            </button>

            <button
              onClick={() => setActiveTab("proyectos")}
              className={`flex items-center justify-between w-full p-2.5 rounded-lg text-xs font-bold transition text-left ${activeTab === "proyectos" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Proyectos de Ley
              </span>
              <span className="font-mono text-[10px] tracking-tight">{results.proyectos.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("fuentes")}
              className={`flex items-center justify-between w-full p-2.5 rounded-lg text-xs font-bold transition text-left ${activeTab === "fuentes" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" /> Fuentes de Datos
              </span>
              <span className="font-mono text-[10px] tracking-tight">{results.fuentesDatos ? results.fuentesDatos.length : 0}</span>
            </button>

            <button
              onClick={() => setActiveTab("comisiones")}
              className={`flex items-center justify-between w-full p-2.5 rounded-lg text-xs font-bold transition text-left ${activeTab === "comisiones" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <span className="flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5" /> Comisiones
              </span>
              <span className="font-mono text-[10px] tracking-tight">{results.comisiones.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("comparada")}
              className={`flex items-center justify-between w-full p-2.5 rounded-lg text-xs font-bold transition text-left ${activeTab === "comparada" ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Legislación Comparada
              </span>
              <span className="font-mono text-[10px] tracking-tight">{results.comparada ? results.comparada.length : 0}</span>
            </button>

            <button
              onClick={() => setActiveTab("informes")}
              className={`flex items-center justify-between w-full p-2.5 rounded-lg text-xs font-bold transition text-left ${activeTab === "informes" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Informes de Comisión
              </span>
              <span className="font-mono text-[10px] tracking-tight">{results.documentos.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("autores")}
              className={`flex items-center justify-between w-full p-2.5 rounded-lg text-xs font-bold transition text-left ${activeTab === "autores" ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <span className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Autores y Parlamentarios
              </span>
              <span className="font-mono text-[10px] tracking-tight">{results.autores.length}</span>
            </button>
          </div>

        </div>

        {/* Right column: Results Render Area */}
        <div className="lg:col-span-3 flex flex-col gap-6" id="search-main-results-renderer">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">
                  {searchingWeb ? "Realizando búsqueda profunda e indexación en la Web en vivo..." : "Consultando múltiples fuentes legislativas..."}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {searchingWeb ? "Esto puede tardar unos segundos. Claude está consultando la web del Senado, la Cámara y BCN de Chile." : "Refinado cruzado del Senado, la Cámara y bases de Datos Abiertos parlamentarios."}
                </p>
              </div>
            </div>
          ) : totalCount === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-6 shadow-xs">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <div className="max-w-md">
                <h3 className="font-extrabold text-slate-800 text-sm">Sin resultados para tu búsqueda</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  No se encontraron resultados locales de boletines para <span className="font-bold text-slate-700">"{query}"</span>. ¿Quieres conectarte en tiempo real con el Congreso de Chile?
                </p>
              </div>
              <button
                onClick={() => fetchResults(query, true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-xl flex items-center gap-2 uppercase tracking-wide transition shadow-md hover:shadow-lg active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                Buscar en la Web con IA (BCN y Congreso)
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              
              {/* Category Segment: FUENTES DE DATOS & REPOSITORIOS OFICIALES */}
              {(activeTab === "all" || activeTab === "fuentes") && results.fuentesDatos && results.fuentesDatos.length > 0 && (
                <div className="flex flex-col gap-4" id="section-fuentes-datos">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Fuentes de Datos Oficiales & Dónde está la Información ({results.fuentesDatos.length})
                      </h2>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-100 font-mono">
                      Portales del Estado & Organismos Públicos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.fuentesDatos.map((f) => (
                      <div
                        key={f.id}
                        className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 flex flex-col justify-between gap-4 transition hover:shadow-sm group"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                              {f.institucion}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                              {f.categoria}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {f.nombre}
                          </h3>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-700 leading-relaxed">
                            <strong className="text-slate-900 block font-bold mb-0.5">Qué información encontrar:</strong>
                            {f.queBuscar}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {f.descripcion}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Cobertura: {f.cobertura}
                          </span>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <span>Consultar repositorio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Segment: PROYECTOS DE LEY */}
              {(activeTab === "all" || activeTab === "proyectos") && results.proyectos.length > 0 && (
                <div className="flex flex-col gap-4" id="section-proyectos">
                  <div className="flex items-center gap-2 px-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Proyectos de Ley Encontrados ({results.proyectos.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {results.proyectos.map((p) => (
                      <div 
                        key={p.id}
                        className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-blue-400 hover:shadow-xs transition flex flex-col md:flex-row justify-between gap-4 group"
                        id={`search-card-proyecto-${p.id}`}
                      >
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-extrabold font-mono">
                              Boletín {p.id}
                            </span>
                            {p.materia && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                                {p.materia}
                              </span>
                            )}
                            {p.urgencia && p.urgencia !== "Sin urgencia" && (
                              <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-extrabold tracking-wide uppercase">
                                Urgencia {p.urgencia}
                              </span>
                            )}
                          </div>

                          <h3 
                            className="text-sm font-extrabold text-slate-950 group-hover:text-blue-600 transition-colors leading-snug cursor-pointer font-sans"
                            onClick={() => {
                              setSelectedProyectoId(p.id);
                              setView("proyecto-detail");
                            }}
                          >
                            <strong>{p.titulo}</strong>
                          </h3>

                          {/* Comisión actual y Corporación */}
                          <div className="flex flex-wrap items-center gap-3 mt-2 mb-1.5 bg-blue-50/40 border border-blue-100/60 px-3 py-2 rounded-xl">
                            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 flex-wrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <strong>Comisión donde está:</strong>{" "}
                              <span className="text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md font-extrabold text-[10px] tracking-wide uppercase">
                                {(function() {
                                  const cName = p.comisionActual || p.materia || "Trabajo y Previsión Social";
                                  return /^comisi[oó]n/i.test(cName) ? cName : `Comisión de ${cName}`;
                                })()}
                              </span>
                            </span>
                            <span className="text-slate-300 hidden sm:inline px-1">|</span>
                            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 flex-wrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                              <strong>Corporación:</strong>{" "}
                              <span className="text-indigo-800 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md font-extrabold text-[10px] tracking-wide uppercase">
                                {p.camaraOrigen || "Cámara de Diputados"}
                              </span>
                            </span>
                          </div>

                          {p.resumen && (
                            <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                              {p.resumen}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400 mt-2">
                            {p.autores && (
                              <span className="text-slate-500 truncate max-w-[320px]">
                                Autores: <strong className="text-slate-600">{p.autores}</strong>
                              </span>
                            )}
                            <span>|</span>
                            {p.camaraOrigen && (
                              <span>Origen: {p.camaraOrigen}</span>
                            )}
                            <span>|</span>
                            {p.fechaIngreso && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {p.fechaIngreso}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end gap-3 shrink-0">
                          <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full inline-block text-center border font-sans ${
                            (function() {
                              const e = (p.estado || "").toLowerCase();
                              if (e.includes("aprobado") || e.includes("publicado") || e.includes("promulgado") || e.includes("ley")) {
                                return "bg-emerald-50 text-emerald-700 border-emerald-200";
                              }
                              if (e.includes("sala") || e.includes("discusión") || e.includes("discusion") || e.includes("urgente") || e.includes("sesion") || e.includes("sesión")) {
                                return "bg-blue-50 text-blue-700 border-blue-200";
                              }
                              if (e.includes("estudio") || e.includes("comisión") || e.includes("comision") || e.includes("informe")) {
                                return "bg-amber-50 text-amber-700 border-amber-200";
                              }
                              if (e.includes("archivado") || e.includes("rechazado") || e.includes("inadmisible") || e.includes("retirado")) {
                                return "bg-rose-50 text-rose-700 border-rose-200";
                              }
                              return "bg-slate-50 text-slate-700 border-slate-200";
                            })()
                          }`}>
                            {p.estado || "En tramitación"}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedProyectoId(p.id);
                              setView("proyecto-detail");
                            }}
                            className="text-[10px] font-black text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider"
                          >
                            Ver Expediente <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Segment: COMISIONES */}
              {(activeTab === "all" || activeTab === "comisiones") && results.comisiones.length > 0 && (
                <div className="flex flex-col gap-4" id="section-comisiones">
                  <div className="flex items-center gap-2 px-1">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Comisiones Legislativas ({results.comisiones.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.comisiones.map((c) => (
                      <div 
                        key={c.id}
                        onClick={() => {
                          setSelectedComisionId(c.id);
                          setView("comision-detail");
                        }}
                        className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-emerald-500 hover:shadow-xs transition cursor-pointer flex flex-col justify-between gap-4 group"
                        id={`search-card-comision-${c.id}`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                              {c.chamber === "SR" ? "Senado" : "Cámara de Diputadas y Diputados"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono">
                              {(c as any).periodo || (c.chamber === "SR" ? "2022 - 2030" : "2022 - 2026")}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-2.5 leading-snug">
                            {c.nombre}
                          </h3>

                          {c.descripcion && (
                            <p className="text-xs text-slate-500 mt-1 lines-clamp-2 leading-relaxed">
                              {c.descripcion}
                            </p>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold font-mono">
                          <span>{(c as any).proyectosContados || 12} Proyectos en expediente</span>
                          <span className="text-emerald-600 flex items-center gap-0.5 group-hover:underline">
                            Ver detalles &rsaquo;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Segment: LEGISLACIÓN COMPARADA */}
              {(activeTab === "all" || activeTab === "comparada") && results.comparada && results.comparada.length > 0 && (
                <div className="flex flex-col gap-4" id="section-comparada">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-600" />
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Legislación Comparada y Derecho Internacional ({results.comparada.length})
                      </h2>
                    </div>
                    <button
                      onClick={() => setView("legislacion-comparada")}
                      className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Abrir Buscador Comparado Completo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.comparada.map((item: any) => (
                      <div 
                        key={item.id}
                        onClick={() => setView("legislacion-comparada")}
                        className="bg-white border border-slate-200/90 hover:border-purple-400 rounded-xl p-5 hover:shadow-xs transition cursor-pointer flex flex-col justify-between gap-4 group"
                        id={`search-card-comparada-${item.id}`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">
                              {item.boletinReferencia}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                              {item.categoria}
                            </span>
                          </div>

                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-700 leading-snug transition-colors">
                            {item.titulo}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {item.resumen}
                          </p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-mono">
                            Países analizados: <strong className="text-slate-700">{item.paises.join(", ")}</strong>
                          </span>
                          <span className="text-purple-700 font-bold group-hover:underline flex items-center gap-0.5">
                            Ver informe comparado &rsaquo;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Segment: INFORMES Y DOCUMENTOS */}
              {(activeTab === "all" || activeTab === "informes") && results.documentos.length > 0 && (
                <div className="flex flex-col gap-4" id="section-informes">
                  <div className="flex items-center gap-2 px-1">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Informes y Documentos Relacionados ({results.documentos.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {results.documentos.map((doc) => (
                      <div 
                        key={doc.id}
                        className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition"
                        id={`search-card-documento-${doc.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FileCheck className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                              {doc.tipo || "Archivo Legislativo"}
                            </span>
                            <h4 className="text-xs font-bold text-slate-850 mt-1 leading-snug group-hover:text-indigo-600 transition-colors">
                              {doc.titulo}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                              Anclado a la Comisión: <span className="font-semibold text-slate-600 hover:underline cursor-pointer" onClick={() => {
                                setSelectedComisionId(doc.comisionId);
                                setView("comision-detail");
                              }}>{doc.comisionNombre}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end shrink-0">
                          {doc.fecha && (
                            <span className="text-[10px] font-semibold text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {doc.fecha}
                            </span>
                          )}
                          <button
                            onClick={() => alert(`Abriendo visor de informe legislativo para: ${doc.titulo}`)}
                            className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-indigo-700 transition"
                          >
                            Ver Informe
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Segment: AUTORES */}
              {(activeTab === "all" || activeTab === "autores") && results.autores.length > 0 && (
                <div className="flex flex-col gap-4" id="section-autores">
                  <div className="flex items-center gap-2 px-1">
                    <User className="w-4 h-4 text-amber-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Autores y Parlamentarios Relacionados ({results.autores.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.autores.map((auth, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setSearchFilter(auth.nombre);
                          setView("proyectos");
                        }}
                        className="bg-white border border-slate-200/80 rounded-xl p-4 hover:border-amber-400 hover:shadow-xs transition cursor-pointer flex items-center gap-3.5 group"
                        id={`search-card-autor-${index}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors truncate">
                            {auth.nombre}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                            {auth.rol || (auth.camara ? auth.camara : "Parlamentario/a")}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-semibold font-mono">
                            <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{auth.partido}</span>
                            {auth.comisionNombre && <span className="text-[9px] text-slate-400 truncate">({auth.comisionNombre})</span>}
                          </div>
                        </div>
                        <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Segment: LIVE OFFICIAL WEB PORTALS */}
              {results.webLinks && results.webLinks.length > 0 && (
                <div className="flex flex-col gap-4 mt-2" id="section-web-portals">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Consultas en Línea en Portales Oficiales del Congreso
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Búsqueda en Vivo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {results.webLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/30 hover:border-emerald-300 transition-all flex items-start justify-between gap-3 group shadow-2xs"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                              {link.source === "camara" ? "Cámara" : link.source === "senado" ? "Senado" : link.source === "bcn" ? "BCN" : "LeyChile"}
                            </span>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {link.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {link.description}
                          </p>
                          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1.5">
                            <span>Consultar "{query}" en {link.name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
