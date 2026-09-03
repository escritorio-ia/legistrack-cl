/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Megaphone, 
  Plus, 
  CheckSquare, 
  Search, 
  Sliders, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  Radio, 
  ShieldAlert,
  Zap,
  Tag
} from "lucide-react";
import { Alerta, Proyecto } from "../types";

interface AlertasViewProps {
  followedProys?: string[];
  toggleFollowProy?: (id: string) => void;
}

export default function AlertasView({ followedProys = [], toggleFollowProy }: AlertasViewProps) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom form state for simulated alert creation
  const [newAlertTitle, setNewAlertTitle] = useState("");
  const [newAlertDesc, setNewAlertDesc] = useState("");
  const [newAlertBoletin, setNewAlertBoletin] = useState("16.621-13");
  const [showSimulateForm, setShowSimulateForm] = useState(false);

  // Filter alert state
  const [typeFilter, setTypeFilter] = useState<"all" | "indicador" | "citacion" | "votacion">("all");

  const fetchAlerts = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/alertas").then(res => res.json()),
      fetch("/api/proyectos").then(res => res.json())
    ])
      .then(([alertsData, proysData]) => {
        setAlertas(alertsData);
        setProyectos(proysData.resultados || proysData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading alerts and projects:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSimulateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle || !newAlertDesc) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    fetch("/api/alertas/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: newAlertTitle,
        subtitulo: newAlertDesc,
        boletinId: newAlertBoletin
      })
    })
    .then(res => {
      if (res.ok) {
        setNewAlertTitle("");
        setNewAlertDesc("");
        setShowSimulateForm(false);
        fetchAlerts(); // reload
        alert("¡Alerta legislativa simulada con éxito!");
      }
    });
  };

  const filteredAlerts = alertas.filter(
    a => typeFilter === "all" || a.tipo === typeFilter
  );

  const publishedFollowedProys = proyectos.filter(
    p => followedProys.includes(p.id) && 
    (p.estado.toLowerCase().includes("publicado") || p.etapa.toLowerCase().includes("publicado"))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-6"
    >
      {/* Intro Layout header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="alerts-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Suscripciones y Alertas Legislativas</span>
            <Bell className="w-5.5 h-5.5 text-blue-600 shrink-0 animate-bounce" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-semibold">
            Gestione sus suscripciones temáticas, configure boletines preferidos y simule disparadores de alerta legislativa en tiempo real.
          </p>
        </div>
        
        <button 
          onClick={() => setShowSimulateForm(!showSimulateForm)}
          className="flex items-center gap-1.5 bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all shrink-0 cursor-pointer shadow-xs self-start md:self-center"
          id="toggle-simulate-alert-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Simular Alerta Legislativa</span>
        </button>
      </div>

      {/* Main Split Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="alerts-split-layout">
        
        {/* Left Column (Alerts Feed and Filters) - 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Simulation Form overlay/card */}
          <AnimatePresence>
            {showSimulateForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSimulateAlert}
                className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col gap-3.5 mb-2 overflow-hidden shadow-sm"
                id="simulate-alert-form"
              >
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider h-4">Formulario de Alerta Simulado</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-none">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-500 mb-0.5">Título de Alerta *</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Ingreso de indicación clave" 
                      value={newAlertTitle}
                      onChange={(e) => setNewAlertTitle(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-500 mb-0.5">ID Boletín Legislativo (Ej. 16.621-13) *</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 16.621-13" 
                      value={newAlertBoletin}
                      onChange={(e) => setNewAlertBoletin(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="font-bold text-slate-500 mb-0.5">Descripción de la Alerta *</label>
                    <textarea 
                      placeholder="Escribe la descripción de la alerta de forma sintética..." 
                      value={newAlertDesc}
                      onChange={(e) => setNewAlertDesc(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-semibold h-16 resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-1.5 h-8">
                  <button 
                    type="button" 
                    onClick={() => setShowSimulateForm(false)}
                    className="px-4 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-[10px] rounded-lg uppercase transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-[10px] rounded-lg uppercase tracking-wide transition-colors cursor-pointer"
                  >
                    Disparar Alerta
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Alertas de Proyectos Publicados para Eliminar Seguimiento */}
          {publishedFollowedProys.map((proy) => (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              key={`pub-alert-${proy.id}`}
              className="bg-amber-50/80 border border-amber-200 p-4.5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs"
              id={`alert-publication-${proy.id}`}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-850 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5.5 h-5.5 text-amber-700 font-bold animate-pulse" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-[9px] bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono tracking-wide">
                    Alerta de Publicación Oficial: Ley Aprobada
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                    El proyecto legislativo "{proy.titulo}" (Boletín {proy.id}) ha sido publicado oficialmente en el Diario Oficial.
                  </h4>
                  <p className="text-[11px] text-slate-650 mt-1 font-semibold leading-relaxed font-sans">
                    Debido a que este trámite legislativo ha concluido de forma definitiva con su publicación (<b>{proy.etapa}</b>), le sugerimos eliminar el seguimiento político y avisos de este documento para mantener limpio su panel de control.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
                {toggleFollowProy && (
                  <button
                    onClick={() => {
                      toggleFollowProy(proy.id);
                      alert(`Se ha eliminado exitosamente el seguimiento del Proyecto Boletín ${proy.id} ya que fue publicado como Ley.`);
                    }}
                    className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 justify-center"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.5px]" />
                    <span>Eliminar Seguimiento</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Quick tab filters for category alert types */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center justify-between" id="alerts-filters-card">
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold" id="alerts-feed-type-toggles">
              <button 
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  typeFilter === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Todas
              </button>
              <button 
                onClick={() => setTypeFilter("indicador")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  typeFilter === "indicador" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Indicadores
              </button>
              <button 
                onClick={() => setTypeFilter("citacion")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  typeFilter === "citacion" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Citaciones
              </button>
              <button 
                onClick={() => setTypeFilter("votacion")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  typeFilter === "votacion" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Votaciones
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              FILTRADO: {filteredAlerts.length} alertas activas
            </span>
          </div>

          {/* Live Alerts list feed */}
          <div className="flex flex-col gap-3" id="alerts-live-feed-list">
            {loading ? (
              <div className="bg-white py-12 text-center text-sm text-slate-400 border border-slate-200 rounded-xl font-semibold">
                Cargando historial de alertas...
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="bg-white py-12 text-center text-sm text-slate-400 border border-slate-200 rounded-xl font-semibold">
                No hay alertas de esta categoría activas en tu panel.
              </div>
            ) : (
              filteredAlerts.map((alerta) => (
                <div 
                  key={alerta.id}
                  className="bg-white p-4.5 rounded-xl border border-slate-200 hover:border-slate-350 shadow-sm transition-all relative flex justify-between items-center group"
                >
                  <div className="flex gap-3.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                      alerta.tipo === 'indicador' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' :
                      alerta.tipo === 'citacion' ? 'bg-blue-50 text-blue-600 border-blue-150' :
                      alerta.tipo === 'votacion' ? 'bg-amber-50 text-amber-700 border-amber-150' : 'bg-blue-50 text-blue-700 border-blue-150'
                    }`}>
                      <Megaphone className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {alerta.titulo}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-snug font-semibold">
                        {alerta.subtitulo}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2.5 text-[10px] font-semibold text-slate-400">
                        <span className="bg-slate-100 text-slate-600 border border-slate-200/50 px-1.5 py-0.2 rounded font-sans uppercase">
                          Boletín {alerta.boletinId}
                        </span>
                        <span className="flex items-center gap-1 font-medium font-mono text-[10px]">
                          <Calendar className="w-3.5 h-3.5" />
                          {alerta.tiempo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert(`Marcando alerta de Boletín ${alerta.boletinId} como leída.`)}
                    className="p-1 px-3.5 text-[10px] font-semibold border border-slate-200 rounded-lg hover:border-slate-400 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Leída
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Column (Manage subscription rules & keywords) - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Active Rules Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm" id="sub-rules-panel">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              Filtros de Suscripción Activa
            </h3>

            <div className="space-y-3.5 text-xs text-slate-700 font-semibold leading-none" id="rules-boxes">
              
              {/* Rule 1 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-150">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span>Materia: Trabajo y Previsión</span>
                </div>
                <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-50" />
              </div>

              {/* Rule 2 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-150">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span>Materia: Hacienda y Presupuesto</span>
                </div>
                <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-50" />
              </div>

              {/* Rule 3 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-150">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span>Urgencias: Discusión Inmediata</span>
                </div>
                <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-50" />
              </div>
            </div>

            <button 
              onClick={() => alert("Mostrando panel de administración avanzada de correo y avisos legislativos...")}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs py-2 rounded-lg mt-5 text-center transition-colors shadow-xs cursor-pointer"
            >
              Configurar Avisos por Correo
            </button>
          </div>

          {/* Keywords monitor panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm" id="sub-keywords-panel">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              Palabras Clave en Monitoreo
            </h3>

            <div className="flex flex-wrap gap-1.5" id="keywords-badges-row">
              <span className="p-1 px-2.5 bg-slate-50 border border-slate-150 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-full text-[10px] font-semibold cursor-pointer transition-colors">
                teletrabajo
              </span>
              <span className="p-1 px-2.5 bg-slate-50 border border-slate-150 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-full text-[10px] font-semibold cursor-pointer transition-colors">
                sala cuna
              </span>
              <span className="p-1 px-2.5 bg-slate-50 border border-slate-150 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-full text-[10px] font-semibold cursor-pointer transition-colors">
                inteligencia artificial
              </span>
              <span className="p-1 px-2.5 bg-slate-50 border border-slate-150 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-full text-[10px] font-semibold cursor-pointer transition-colors">
                impuesto
              </span>
              <span className="p-1 px-2.5 bg-white text-blue-600 border border-blue-600 rounded-full text-[10px] font-bold cursor-pointer hover:bg-blue-50 transition-colors">
                + Nueva
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed font-sans">
              Le avisamos en cuanto se indexen nuevos boletines o indicaciones de reforma que integren las palabras clave en monitoreo.
            </p>
          </div>

          {/* Educational panel alert */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-xs text-blue-900 flex gap-3 relative overflow-hidden">
            <ShieldAlert className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900">Mesa de Control de Plazos</h4>
              <p className="text-blue-700 font-sans mt-0.5 leading-relaxed text-[11px] font-medium">
                Se detectaron 4 proyectos prioritarios con plazos urgentes gubernamentales por vencer en los próximos 7 días laborales.
              </p>
              <button 
                onClick={() => alert("Abriendo minuta prioritaria de control de plazos y caducidad de urgencias...")}
                className="mt-2.5 text-blue-800 text-[10px] font-extrabold hover:underline cursor-pointer"
              >
                Revisar Informe de Plazos &rsaquo;
              </button>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
