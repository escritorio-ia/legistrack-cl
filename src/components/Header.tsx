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
  Home,
  Menu,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";

import { performUnifiedSearch } from "../utils/searchEngine";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const appSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        // Only close if not interacting with mobile search input
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

  useEffect(() => {
    if (!searchFilter.trim()) {
      setResults({ proyectos: [], comisiones: [], autores: [] });
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    
    // 1. Instant client-side multi-source search
    const localRes = performUnifiedSearch(searchFilter);
    setResults({
      proyectos: localRes.proyectos.slice(0, 5),
      comisiones: localRes.comisiones.slice(0, 5),
      autores: localRes.autores.slice(0, 5),
      comparada: localRes.comparada.slice(0, 3)
    });

    // 2. Fetch live server search in parallel if available
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/global-search?q=${encodeURIComponent(searchFilter)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.proyectos?.length || data.comisiones?.length || data.autores?.length)) {
            setResults(data);
          }
        }
      } catch (err) {
        // Fallback already displayed
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchFilter]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsOpen(false);
      setMobileSearchOpen(false);
      if (onSearchSubmit) {
        onSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const handleNavigate = (targetView: string) => {
    setView(targetView);
    setMobileMenuOpen(false);
    setAppSwitcherOpen(false);
    setIsOpen(false);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs flex justify-between items-center w-full px-3 sm:px-6 h-16 sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Abrir menú de navegación"
            id="mobile-menu-toggle-btn"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Hub Logo & Suite Name */}
          <button 
            onClick={() => handleNavigate("escritorio")}
            className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group"
            id="logo-button"
            title="Ir al Hub Central Escritorio++"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-slate-950 via-indigo-900 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
              E++
            </div>
            <span className="hidden xs:inline">Escritorio<span className="text-blue-600 font-extrabold">++</span></span>
          </button>

          {/* App Switcher Dropdown (Desktop & Tablet) */}
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
              <span className="max-w-[120px] sm:max-w-none truncate">{getActiveModuleName()}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${appSwitcherOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Switcher Menu */}
            {appSwitcherOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[9999] p-2 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100">
                  APLICACIONES DE LA SUITE
                </div>
                
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => handleNavigate("escritorio")}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentView === "escritorio" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block">Hub Escritorio++</span>
                      <span className="text-2xs text-slate-400 truncate block">Portal central y accesos directos</span>
                    </div>
                    {currentView === "escritorio" && <Check className="w-3.5 h-3.5 text-slate-900 shrink-0 ml-auto" />}
                  </button>

                  <button
                    onClick={() => handleNavigate("dashboard")}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                      ["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) 
                        ? "bg-blue-50 font-bold text-blue-900" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block">Legislación++</span>
                      <span className="text-2xs text-slate-400 truncate block">Proyectos de Ley &bull; Comisiones &bull; Sala</span>
                    </div>
                    {["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-auto" />
                    )}
                  </button>

                  <button
                    onClick={() => handleNavigate("legislacion-comparada")}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentView === "legislacion-comparada" ? "bg-indigo-50 font-bold text-indigo-900" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block">Derecho Comparado++</span>
                      <span className="text-2xs text-slate-400 truncate block">Marcos homólogos (27 países)</span>
                    </div>
                    {currentView === "legislacion-comparada" && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-auto" />}
                  </button>

                  <button
                    onClick={() => handleNavigate("static")}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentView === "static" ? "bg-emerald-50 font-bold text-emerald-900" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block flex items-center gap-1">
                        Statistics++
                        <span className="text-2xs px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">PRO</span>
                      </span>
                      <span className="text-2xs text-slate-400 truncate block">Analítica & Minutas DIPRES</span>
                    </div>
                    {currentView === "static" && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-auto" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Top Suite Navigation Bar (Desktop) */}
          <nav className="hidden lg:flex gap-5 items-center h-full pt-1 ml-2">
            <button
              onClick={() => handleNavigate("escritorio")}
              className={`font-bold text-xs transition-all relative py-5 flex items-center gap-1.5 cursor-pointer ${
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
              onClick={() => handleNavigate("dashboard")}
              className={`font-bold text-xs transition-all relative py-5 flex items-center gap-1.5 cursor-pointer ${
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
              onClick={() => handleNavigate("legislacion-comparada")}
              className={`font-bold text-xs transition-all relative py-5 flex items-center gap-1.5 cursor-pointer ${
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
              onClick={() => handleNavigate("static")}
              className={`font-bold text-xs transition-all relative py-5 flex items-center gap-1.5 cursor-pointer ${
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

        {/* Right Section: Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Desktop Search Bar */}
          <div className="relative hidden lg:block" ref={containerRef} id="header-search-bar-wrapper">
            <div className="flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-full px-3.5 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200 shadow-2xs" id="header-search-bar-container">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                className="bg-transparent border-none text-xs ml-2 w-56 xl:w-72 focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-400 font-sans tracking-wide"
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

            {/* Desktop Search Dropdown Results */}
            {isOpen && (
              <div 
                className="absolute right-0 mt-2 w-[480px] xl:w-[540px] max-h-[500px] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl z-[9000] p-1 font-sans animate-in fade-in slide-in-from-top-2 duration-150"
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
                    {/* Proyectos de Ley */}
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
                                if (setSelectedProyectoId) setSelectedProyectoId(p.id);
                                handleNavigate("proyecto-detail");
                              }}
                              className="p-2.5 rounded-xl hover:bg-slate-50 hover:text-slate-900 cursor-pointer flex flex-col gap-1 transition-colors text-left group"
                              id={`search-result-proyecto-${p.id}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-extrabold">
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

                    {/* Comisiones */}
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
                                if (setSelectedComisionId) setSelectedComisionId(c.id);
                                handleNavigate("comision-detail");
                              }}
                              className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex flex-col gap-1 transition-colors text-left group"
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

                    {/* Legislación Comparada */}
                    {results.comparada && results.comparada.length > 0 && (
                      <div id="search-category-comparada">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <Globe className="w-3 h-3 text-purple-600" />
                          <span>Legislación Comparada ({results.comparada.length})</span>
                        </div>
                        <div className="flex flex-col mt-1 gap-1">
                          {results.comparada.map((item: any) => (
                            <div
                              key={item.id}
                              onClick={() => handleNavigate("legislacion-comparada")}
                              className="p-2.5 rounded-xl hover:bg-purple-50/50 cursor-pointer flex flex-col gap-1 transition-colors text-left group"
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

                    {/* Autores */}
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
                                handleNavigate("proyectos");
                              }}
                              className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-left group"
                              id={`search-result-autor-${index}`}
                            >
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {a.nombre}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {a.cargo} | {a.partido} {a.distrito !== "N/A" && `| Distrito: ${a.distrito}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-mono group-hover:text-blue-600 transition-colors">
                                <span>Ver</span>
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

          {/* Mobile Search Button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Buscar"
            id="mobile-search-toggle-btn"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Alertas Button */}
          <button 
            onClick={() => handleNavigate("alertas")}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 relative transition-all cursor-pointer"
            title="Alertas y Notificaciones"
            id="header-alerts-btn"
          >
            <Bell className="w-4.5 h-4.5" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Configuración Button */}
          <button 
            onClick={() => handleNavigate("configuracion")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              currentView === "configuracion"
                ? "text-blue-600 bg-blue-50 border border-blue-200"
                : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
            }`}
            title="Configuración"
            id="header-settings-btn"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">Ana Morales</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Analista Legislativa</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-slate-100">
              AM
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-16 z-45 shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              className="bg-transparent border-none text-xs ml-2 w-full focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400"
              placeholder="Buscar boletín, comisión o parlamentario..."
              type="text"
              autoFocus
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter("")} 
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="ml-2 text-xs font-bold text-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9990] flex flex-col">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Content */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-tr from-slate-950 via-indigo-900 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-xs">
                  E++
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Escritorio++</h3>
                  <p className="text-[10px] text-slate-500">Suite de Inteligencia Legislativa</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Módulos de la Suite
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleNavigate("escritorio")}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    currentView === "escritorio" ? "bg-slate-900 text-white font-bold shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentView === "escritorio" ? "bg-white/20 text-white" : "bg-slate-900 text-white"}`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Hub Escritorio++</span>
                      <span className={`text-[10px] ${currentView === "escritorio" ? "text-slate-300" : "text-slate-500"}`}>Inicio y selector</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>

                <button
                  onClick={() => handleNavigate("dashboard")}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    ["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) 
                      ? "bg-blue-600 text-white font-bold shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) ? "bg-white/20 text-white" : "bg-blue-600 text-white"}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Legislación++</span>
                      <span className={`text-[10px] ${["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) ? "text-blue-100" : "text-slate-500"}`}>Proyectos, Comisiones, Sala</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>

                <button
                  onClick={() => handleNavigate("legislacion-comparada")}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    currentView === "legislacion-comparada" ? "bg-indigo-600 text-white font-bold shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentView === "legislacion-comparada" ? "bg-white/20 text-white" : "bg-indigo-600 text-white"}`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Derecho Comparado++</span>
                      <span className={`text-[10px] ${currentView === "legislacion-comparada" ? "text-indigo-100" : "text-slate-500"}`}>27 países y homologaciones</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>

                <button
                  onClick={() => handleNavigate("static")}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    currentView === "static" ? "bg-emerald-600 text-white font-bold shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentView === "static" ? "bg-white/20 text-white" : "bg-emerald-600 text-white"}`}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Statistics++</span>
                      <span className={`text-[10px] ${currentView === "static" ? "text-emerald-100" : "text-slate-500"}`}>Informes & Minutas DIPRES</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                  Accesos Directos
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavigate("alertas")}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span>Alertas ({activeAlertsCount})</span>
                  </button>
                  <button
                    onClick={() => handleNavigate("configuracion")}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-slate-600" />
                    <span>Ajustes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navbar for Legislación++ Module (Clean Action Tabs) */}
      {["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas"].includes(currentView) && (
        <div className="bg-slate-950 text-white px-3 sm:px-6 py-2 flex items-center border-b border-slate-800 shadow-inner sticky top-16 z-40 transition-all overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => handleNavigate("proyectos")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                ["dashboard", "proyectos", "proyecto-detail"].includes(currentView)
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              id="subnav-proyectos"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Proyectos</span>
            </button>

            <button
              onClick={() => handleNavigate("comisiones")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
              onClick={() => handleNavigate("sala")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
              onClick={() => handleNavigate("alertas")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
        </div>
      )}
    </>
  );
}
