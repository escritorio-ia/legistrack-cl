import React, { useState, useEffect, useRef } from "react";
import { PIZARRA_VISIBLE } from "../config/features";
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
  ChevronRight,
  Database,
  ExternalLink,
  LayoutDashboard
} from "lucide-react";

import LegisSearchBar from "./LegisSearchBar";

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  onSearchSubmit?: () => void;
  activeAlertsCount: number;
  setSelectedProyectoId?: (id: string) => void;
  setSelectedComisionId?: (id: string) => void;
  /** Nombre de lo que se está viendo en una vista de detalle (boletín o comisión), para la ruta de navegación. */
  detalleActual?: string;
}

/** Secciones de Legislación++: vista, dirección (para abrir en otra pestaña) y vistas que la marcan como activa. */
const SECCIONES_LEGIS: { vista: string; href: string; etiqueta: string; activas: string[] }[] = [
  { vista: "dashboard", href: "#/legislacion", etiqueta: "Inicio", activas: ["dashboard"] },
  { vista: "proyectos", href: "#/proyectos", etiqueta: "Proyectos", activas: ["proyectos", "proyecto-detail"] },
  { vista: "comisiones", href: "#/comisiones", etiqueta: "Comisiones", activas: ["comisiones", "comision-detail"] },
  { vista: "sala", href: "#/sala", etiqueta: "Sala en Vivo", activas: ["sala"] },
  { vista: "alertas", href: "#/alertas", etiqueta: "Alertas", activas: ["alertas"] },
];
const VISTAS_LEGIS = ["dashboard", "proyectos", "proyecto-detail", "comisiones", "comision-detail", "sala", "alertas", "search-results"];

export default function Header({
  currentView,
  setView,
  searchFilter,
  setSearchFilter,
  onSearchSubmit,
  activeAlertsCount,
  setSelectedProyectoId,
  setSelectedComisionId,
  detalleActual
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (targetView: string) => {
    setView(targetView);
    setMobileMenuOpen(false);
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

            {PIZARRA_VISIBLE && (
            <button
              onClick={() => handleNavigate("pizarra")}
              className={`font-bold text-xs transition-all relative py-5 flex items-center gap-1.5 cursor-pointer ${
                currentView === "pizarra"
                  ? "text-violet-600 border-b-2 border-violet-600 font-extrabold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              id="nav-pizarra"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Pizarra ATP</span>
            </button>
            )}

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

                {PIZARRA_VISIBLE && (
                <button
                  onClick={() => handleNavigate("pizarra")}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    currentView === "pizarra" ? "bg-violet-600 text-white font-bold shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentView === "pizarra" ? "bg-white/20 text-white" : "bg-violet-600 text-white"}`}>
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Pizarra ATP</span>
                      <span className={`text-[10px] ${currentView === "pizarra" ? "text-violet-100" : "text-slate-500"}`}>Agenda, demanda y conexiones</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
                )}

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

      {/* Sub-Navbar de Legislación++: enlaces reales (se pueden abrir en otra pestaña) y ruta de navegación */}
      {VISTAS_LEGIS.includes(currentView) && (
        <div className="bg-slate-950 text-white px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-800 shadow-inner sticky top-16 z-40 transition-all">
          <nav aria-label="Secciones de Legislación++" className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar">
            {SECCIONES_LEGIS.map((sec) => {
              const activa = sec.activas.includes(currentView);
              const Icono = sec.vista === "dashboard" ? Home : sec.vista === "proyectos" ? FileText : sec.vista === "comisiones" ? Building2 : sec.vista === "alertas" ? Bell : null;
              return (
                <a
                  key={sec.vista}
                  href={sec.href}
                  onClick={(e) => {
                    // Clic normal: navegación interna. Con Ctrl/Cmd/Shift o botón central se deja abrir en otra pestaña.
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    handleNavigate(sec.vista);
                  }}
                  aria-current={activa ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                    activa
                      ? (sec.vista === "sala" ? "bg-rose-600 text-white shadow-xs" : "bg-blue-600 text-white shadow-xs")
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                  id={`subnav-${sec.vista === "dashboard" ? "inicio" : sec.vista}`}
                >
                  {Icono ? <Icono className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-rose-400" />}
                  <span>{sec.etiqueta}</span>
                  {sec.vista === "alertas" && activeAlertsCount > 0 && (
                    <span className="bg-blue-500 text-white text-2xs px-1.5 py-0.2 rounded-full font-bold" aria-label={`${activeAlertsCount} alertas activas`}>
                      {activeAlertsCount}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Ruta de navegación en las vistas de detalle y en los resultados de búsqueda */}
          {["proyecto-detail", "comision-detail", "search-results"].includes(currentView) && (
            <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 shrink-0 hidden sm:block" />
              {currentView !== "search-results" && (
                <>
                  <button
                    onClick={() => handleNavigate(currentView === "proyecto-detail" ? "proyectos" : "comisiones")}
                    className="font-bold text-slate-300 hover:text-white hover:underline cursor-pointer shrink-0"
                    id="subnav-volver"
                  >
                    ← {currentView === "proyecto-detail" ? "Todos los proyectos" : "Todas las comisiones"}
                  </button>
                  <span className="shrink-0">/</span>
                </>
              )}
              <span className="font-semibold text-white truncate" title={detalleActual || ""}>
                {currentView === "search-results" ? `Resultados de búsqueda${searchFilter ? `: "${searchFilter}"` : ""}` : (detalleActual || "Detalle")}
              </span>
            </nav>
          )}

          <div className="sm:ml-auto">
            <LegisSearchBar
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              onSearchSubmit={onSearchSubmit}
              setSelectedProyectoId={setSelectedProyectoId}
              setSelectedComisionId={setSelectedComisionId}
            />
          </div>
        </div>
      )}
    </>
  );
}
