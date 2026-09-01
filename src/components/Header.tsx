import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Bell, 
  Settings, 
  Building2, 
  FileText, 
  Landmark, 
  User, 
  X, 
  Loader2, 
  ArrowRight, 
  Globe,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Check,
  Layers,
  Home
} from "lucide-react";

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  onSearchSubmit?: () => void;
  activeAlertsCount: number;
  setSelectedProyectoId?: (id: string) => void;
  setSelectedComisionId?: (id: string) => void;
}

export default function Header({
  currentView,
  setView,
  searchFilter,
  setSearchFilter,
  onSearchSubmit,
  activeAlertsCount,
  setSelectedProyectoId,
  setSelectedComisionId
}: HeaderProps) {
  const [results, setResults] = useState<{
    proyectos: any[];
    comisiones: any[];
    autores: any[];
    comparada?: any[];
  }>({ proyectos: [], comisiones: [], autores: [], comparada: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const appSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (appSwitcherRef.current && !appSwitcherRef.current.contains(e.target as Node)) {
        setAppSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getActiveModuleName = () => {
    if (currentView === "escritorio") return "Hub Suite";
    if (currentView === "legislacion-comparada") return "Derecho Comparado++";
    if (currentView === "static") return "Statistics++";
    return "Legislación++";
  };

  const getActiveModuleColor = () => {
    if (currentView === "legislacion-comparada") return "bg-indigo-500 text-white";
    if (currentView === "static") return "bg-emerald-500 text-white";
    return "bg-blue-600 text-white";
  };

  useEffect(() => {
    if (!searchFilter.trim()) {
      setResults({ proyectos: [], comisiones: [], autores: [] });
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setLoading(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/global-search?q=${encodeURIComponent(searchFilter)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Error performing global search:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchFilter]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsOpen(false);
      if (onSearchSubmit) {
        onSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 shadow-sm flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50">
      <div className="flex items-center gap-5">
        {/* Hub Logo & Suite Name */}
        <button 
          onClick={() => setView("escritorio")}
          className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer group"
          id="logo-button"
          title="Ir al Hub Central Escritorio++"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-slate-950 via-indigo-900 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
            E++
          </div>
          <span>Escritorio<span className="text-blue-600 font-extrabold">++</span></span>
        </button>

        {/* App Switcher Dropdown */}
        <div className="relative" ref={appSwitcherRef}>
          <button
            onClick={() => setAppSwitcherOpen(!appSwitcherOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-2xs font-bold rounded-xl border border-slate-200/90 transition-all cursor-pointer shadow-2xs"
            id="suite-app-switcher-btn"
          >
            <span className={`w-2 h-2 rounded-full ${
              currentView === "legislacion-comparada" ? "bg-indigo-600" :
              currentView === "static" ? "bg-emerald-600" :
              currentView === "escritorio" ? "bg-slate-900" : "bg-blue-600"
            }`} />
            <span>{getActiveModuleName()}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${appSwitcherOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Switcher Menu */}
          {appSwitcherOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[9999] p-2 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100">
                APLICACIONES DE LA SUITE
              </div>
              
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => {
                    setView("escritorio");
                    setAppSwitcherOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentView === "escritorio" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Hub Escritorio++</span>
                    <span className="text-2xs text-slate-400">Portal y selector central</span>
                  </div>
                  {currentView === "escritorio" && <Check className="w-3.5 h-3.5 text-slate-900 ml-auto" />}
                </button>

                <button
                  onClick={() => {
                    setView("dashboard");
                    setAppSwitcherOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    ["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) 
                      ? "bg-blue-50 font-bold text-blue-900" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Legislación++</span>
                    <span className="text-2xs text-slate-400">Proyectos de Ley &bull; Comisiones &bull; Sala</span>
                  </div>
                  {["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) && (
                    <Check className="w-3.5 h-3.5 text-blue-600 ml-auto" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setView("legislacion-comparada");
                    setAppSwitcherOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentView === "legislacion-comparada" ? "bg-indigo-50 font-bold text-indigo-900" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Derecho Comparado++</span>
                    <span className="text-2xs text-slate-400">Marcos homólogos (27 países)</span>
                  </div>
                  {currentView === "legislacion-comparada" && <Check className="w-3.5 h-3.5 text-indigo-600 ml-auto" />}
                </button>

                <button
                  onClick={() => {
                    setView("static");
                    setAppSwitcherOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentView === "static" ? "bg-emerald-50 font-bold text-emerald-900" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block flex items-center gap-1">
                      Statistics++
                      <span className="text-2xs px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">PRO</span>
                    </span>
                    <span className="text-2xs text-slate-400">Analítica & Minutas DIPRES</span>
                  </div>
                  {currentView === "static" && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Top Suite Navigation Bar */}
        <nav className="hidden lg:flex gap-5 items-center h-full pt-1">
          <button
            onClick={() => setView("escritorio")}
            className={`font-bold text-xs transition-colors relative py-5 flex items-center gap-1 cursor-pointer ${
              currentView === "escritorio"
                ? "text-slate-900 border-b-2 border-slate-900 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            id="nav-escritorio"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => setView("dashboard")}
            className={`font-bold text-xs transition-colors relative py-5 flex items-center gap-1 cursor-pointer ${
              ["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView)
                ? "text-blue-600 border-b-2 border-blue-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            id="nav-legislacion"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Legislación++</span>
          </button>

          <button
            onClick={() => setView("legislacion-comparada")}
            className={`font-bold text-xs transition-colors relative py-5 flex items-center gap-1 cursor-pointer ${
              currentView === "legislacion-comparada"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            id="nav-comparative"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Derecho Comparado++</span>
          </button>

          <button
            onClick={() => setView("static")}
            className={`font-bold text-xs transition-colors relative py-5 flex items-center gap-1 cursor-pointer ${
              currentView === "static"
                ? "text-emerald-600 border-b-2 border-emerald-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            id="nav-static"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Statistics++</span>
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar Wrapper */}
        <div className="relative hidden lg:block" ref={containerRef} id="header-search-bar-wrapper">
          <div className="flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-full px-4 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-205 shadow-xs" id="header-search-bar-container">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              className="bg-transparent border-none text-xs ml-2 w-64 focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-400 font-sans tracking-wide"
              placeholder="Buscar comisiones, boletines, autores..."
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={handleKeyDown}
              id="header-search-input"
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter("")} 
                className="p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                id="header-clear-search-btn"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Floating results dropdown for all types */}
          {isOpen && (
            <div 
              className="absolute right-0 mt-2 w-[520px] max-h-[500px] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl z-[9000] p-1 font-sans animate-fade-in"
              id="header-search-dropdown"
            >
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-2.5 text-slate-400 text-xs font-semibold" id="search-loading-state">
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-600" />
                  <span>Buscando comisiones, proyectos y autores en tiempo real...</span>
                </div>
              ) : results.proyectos.length === 0 && results.comisiones.length === 0 && results.autores.length === 0 ? (
                <div className="text-center py-8 px-4 text-slate-500 text-xs" id="search-empty-state">
                  <p className="font-semibold text-slate-700">No se encontraron resultados para "{searchFilter}"</p>
                  <p className="text-[10px] text-slate-400 mt-1">Intente buscando por boletín (ej. 16621-13), comisiones (ej. trabajo, hacienda), o autores.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-2">
                  {/* Category: Proyectos de Ley */}
                  {results.proyectos.length > 0 && (
                    <div id="search-category-proyectos">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span>Proyectos de Ley ({results.proyectos.length})</span>
                      </div>
                      <div className="flex flex-col mt-1 gap-1">
                        {results.proyectos.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (setSelectedProyectoId) {
                                setSelectedProyectoId(p.id);
                              }
                              setView("proyecto-detail");
                              setIsOpen(false);
                            }}
                            className="p-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 cursor-pointer flex flex-col gap-1 transition-colors text-left group"
                            id={`search-result-proyecto-${p.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-blue-50/70 text-blue-700 px-1.5 py-0.5 rounded font-extrabold">
                                Boletín {p.id}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold font-mono">
                                {p.fechaIngreso || p.fecha}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 leading-snug break-words transition-colors">
                              {p.titulo}
                            </h4>
                            {p.autores && (
                              <p className="text-[10px] text-slate-500 font-medium truncate">
                                Autores: {p.autores}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Comisiones */}
                  {results.comisiones.length > 0 && (
                    <div id="search-category-comisiones">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <Landmark className="w-3 h-3 text-emerald-500" />
                        <span>Comisiones Legislativas ({results.comisiones.length})</span>
                      </div>
                      <div className="flex flex-col mt-1 gap-1">
                        {results.comisiones.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              if (setSelectedComisionId) {
                                setSelectedComisionId(c.id);
                              }
                              setView("comision-detail");
                              setIsOpen(false);
                            }}
                            className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex flex-col gap-1 transition-colors text-left group"
                            id={`search-result-comision-${c.id}`}
                          >
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 leading-snug transition-colors">
                              {c.nombre}
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold line-clamp-2">
                              {c.descripcion}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Legislación Comparada */}
                  {results.comparada && results.comparada.length > 0 && (
                    <div id="search-category-comparada">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <Globe className="w-3 h-3 text-purple-600" />
                        <span>Legislación Comparada e Internacional ({results.comparada.length})</span>
                      </div>
                      <div className="flex flex-col mt-1 gap-1">
                        {results.comparada.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setView("legislacion-comparada");
                              setIsOpen(false);
                            }}
                            className="p-2.5 rounded-lg hover:bg-purple-50/50 cursor-pointer flex flex-col gap-1 transition-colors text-left group"
                            id={`search-result-comparada-${item.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded font-mono">
                                {item.boletinReferencia}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold font-mono">
                                {item.paises.join(" · ")}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 leading-snug transition-colors">
                              {item.titulo}
                            </h4>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {item.resumen}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Autores */}
                  {results.autores.length > 0 && (
                    <div id="search-category-autores">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <User className="w-3 h-3 text-amber-500" />
                        <span>Autores y Parlamentarios ({results.autores.length})</span>
                      </div>
                      <div className="flex flex-col mt-1 gap-1">
                        {results.autores.map((a, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSearchFilter(a.nombre);
                              setView("proyectos");
                              setIsOpen(false);
                            }}
                            className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-left group"
                            id={`search-result-autor-${index}`}
                          >
                            <div>
                              <h4 className="text-xs font-bold text-slate-850 group-hover:text-blue-600 transition-colors">
                                {a.nombre}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {a.cargo} | Partido: {a.partido} {a.distrito !== "N/A" && `| Distrito: ${a.distrito}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-mono group-hover:text-blue-600 transition-colors">
                              <span>Ver proyectos</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action icons */}
        <button 
          onClick={() => setView("alertas")}
          className="p-1.5 rounded-full text-slate-500 hover:text-blue-650 hover:bg-slate-50 relative transition-all"
          title="Alertas"
          id="header-alerts-btn"
        >
          <Bell className="w-5 h-5" />
          {activeAlertsCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
          )}
        </button>

        <button 
          onClick={() => setView("configuracion")}
          className={`p-1.5 rounded-full transition-all ${
            currentView === "configuracion"
              ? "text-blue-650 bg-blue-50"
              : "text-slate-500 hover:text-blue-650 hover:bg-slate-50"
          }`}
          title="Configuración"
          id="header-settings-btn"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Ana Morales</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Analista Legislativa</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold overflow-hidden border border-slate-200">
            <img 
              alt="Ana Morales" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>

    {/* Sub-Navbar Exclusivo para el Módulo Legislación++ */}
    {["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) && (
      <div className="bg-slate-950 text-white px-6 py-2 flex items-center justify-between border-b border-slate-800 shadow-inner sticky top-16 z-40 transition-all">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-0.5 rounded-full font-mono mr-2 hidden sm:flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            LEGISLACIÓN++
          </span>

          <button
            onClick={() => setView("proyectos")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              ["dashboard", "proyectos", "proyecto-detail"].includes(currentView)
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            id="subnav-proyectos"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Proyectos de Ley</span>
          </button>

          <button
            onClick={() => setView("comisiones")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              ["comisiones", "comision-detail"].includes(currentView)
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            id="subnav-comisiones"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Comisiones</span>
          </button>

          <button
            onClick={() => setView("sala")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === "sala"
                ? "bg-rose-600 text-white shadow-xs font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            id="subnav-sala"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Sala en Vivo</span>
          </button>

          <button
            onClick={() => setView("alertas")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === "alertas"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            id="subnav-alertas"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alertas</span>
            {activeAlertsCount > 0 && (
              <span className="bg-blue-500 text-white text-2xs px-1.5 py-0.2 rounded-full font-bold">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-2xs text-slate-400 font-mono">
          <span>Congreso Nacional de Chile &bull; Cámara & Senado</span>
        </div>
      </div>
    )}
  </>
  );
}
