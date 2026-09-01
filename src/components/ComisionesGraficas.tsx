/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps
} from "recharts";
import { 
  BarChart3, 
  PieChart as PieIcon, 
  HelpCircle,
  TrendingUp,
  Landmark,
  Building2,
  CalendarCheck2,
  ListRestart
} from "lucide-react";

interface CommissionData {
  id: string;
  nombre: string;
  descripcion: string;
  proyectos: number;
  sesiones: number;
  estado: string;
}

interface ComisionesGraficasProps {
  diputados: CommissionData[];
  senado: CommissionData[];
}

export default function ComisionesGraficas({ diputados, senado }: ComisionesGraficasProps) {
  const [chartType, setChartType] = useState<"bicameral" | "ranking" | "totales">("bicameral");

  // Calculations for High-level Stats
  const totalProyectosDiputados = diputados.reduce((sum, c) => sum + (c.proyectos || 0), 0);
  const totalProyectosSenado = senado.reduce((sum, c) => sum + (c.proyectos || 0), 0);
  const totalGlobalProyectos = totalProyectosDiputados + totalProyectosSenado;

  const maxDiputadosCom = [...diputados].sort((a, b) => b.proyectos - a.proyectos)[0];
  const maxSenadoCom = [...senado].sort((a, b) => b.proyectos - a.proyectos)[0];

  // Helper function to simplify commission names for chart readability
  const simplifyName = (name: string) => {
    return name
      .replace(/^Comisión de\s+/i, "")
      .replace(/, Legislación, Justicia y Reglamento/i, "")
      .replace(/ y Previsión Social/i, "")
      .replace(/ Ciudadana/i, "")
      .replace(/ Pública/i, "")
      .replace(/ y Relaciones Internacionales/i, "")
      .trim();
  };

  // 1. BICAMERAL COMPARISON (Matched major commissions)
  // Let's identify matching commissions that exist in both chambers
  const commonAreas = [
    { key: "hacienda", label: "Hacienda" },
    { key: "trabajo", label: "Trabajo" },
    { key: "seguridad", label: "Seguridad" },
    { key: "constitucion", label: "Constitución" },
    { key: "salud", label: "Salud" },
    { key: "educacion", label: "Educación" },
    { key: "defensa", label: "Defensa" },
    { key: "rree", label: "RREE / RR.EE." },
  ];

  const bicameralData = commonAreas.map(area => {
    // find in diputados
    const dCom = diputados.find(c => 
      c.id === area.key || 
      c.nombre.toLowerCase().includes(area.key) ||
      (area.key === "rree" && c.nombre.toLowerCase().includes("relaciones"))
    );
    // find in senado
    const sCom = senado.find(c => 
      c.id === area.key || 
      c.nombre.toLowerCase().includes(area.key) ||
      (area.key === "rree" && c.nombre.toLowerCase().includes("relaciones"))
    );

    return {
      name: area.label,
      "Cámara (CD)": dCom ? dCom.proyectos : 0,
      "Senado (SR)": sCom ? sCom.proyectos : 0,
    };
  });

  // 2. Ranking of Top 12 Commissions by Workload (any chamber)
  const allCommissionsMerged = [
    ...diputados.map(c => ({
      name: simplifyName(c.nombre),
      chamber: "Cámara (CD)",
      proyectos: c.proyectos,
      sesiones: c.sesiones,
      fullName: `${c.nombre} (Cámara)`
    })),
    ...senado.map(c => ({
      name: simplifyName(c.nombre),
      chamber: "Senado (SR)",
      proyectos: c.proyectos,
      sesiones: c.sesiones,
      fullName: `${c.nombre} (Senado)`
    }))
  ];

  const topCommissionsRanking = [...allCommissionsMerged]
    .sort((a, b) => b.proyectos - a.proyectos)
    .slice(0, 12);

  // 3. Totales Globales Data (Chamber vs Senate shares)
  const totalSharesData = [
    { name: "Cámara (CD)", value: totalProyectosDiputados, color: "#2563eb" }, // blue-600
    { name: "Senado (SR)", value: totalProyectosSenado, color: "#dc2626" }     // blue-600
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-xl text-white text-left text-xs font-semibold font-sans">
          <p className="font-extrabold text-slate-200 border-b border-slate-700 pb-1 mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 mt-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-350">{entry.name}:</span>
              <span className="font-mono font-black text-amber-400">{entry.value} proyectos</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomRankingTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-705 p-3.5 rounded-xl shadow-xl text-white text-left text-xs font-semibold font-sans">
          <span className={`text-[8.5px] px-2 py-0.5 rounded font-black uppercase tracking-wide inline-block mb-1.5 ${
            data.chamber === "Cámara (CD)" ? "bg-blue-600/20 border border-blue-500/30 text-blue-400" : "bg-blue-600/20 border border-blue-500/30 text-blue-400"
          }`}>
            {data.chamber}
          </span>
          <p className="font-extrabold text-white leading-snug">
            {data.fullName}
          </p>
          <div className="mt-2.5 flex flex-col gap-1 border-t border-slate-800 pt-2 font-mono text-[11px]">
            <div className="flex justify-between gap-6">
              <span className="text-slate-400 font-bold">Proyectos Activos:</span>
              <span className="text-amber-400 font-black">{data.proyectos}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-400 font-bold">Sesiones Realizadas:</span>
              <span className="text-indigo-300 font-black">{data.sesiones}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 text-slate-800" 
      id="workload-charts-section"
    >
      {/* Chart Segment Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase rounded-full tracking-wider font-mono">
              Visualización Analítica
            </span>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Análisis de Carga de Trabajo Bicameral
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
            Consulte la distribución de proyectos de ley en curso y compare visualmente la congestión legislativa entre ambas cámaras legislativas.
          </p>
        </div>

        {/* View Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setChartType("bicameral")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              chartType === "bicameral"
                ? "bg-white text-indigo-700 shadow-xs font-black text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Áreas Comunes</span>
          </button>
          <button
            onClick={() => setChartType("ranking")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              chartType === "ranking"
                ? "bg-white text-indigo-700 shadow-xs font-black text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top Congestión</span>
          </button>
          <button
            onClick={() => setChartType("totales")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              chartType === "totales"
                ? "bg-white text-indigo-700 shadow-xs font-black text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Reparto Global</span>
          </button>
        </div>
      </div>

      {/* KPI Overviews Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1 */}
        <div className="bg-slate-50/70 border border-slate-150 p-4.5 rounded-xl text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-105 flex items-center justify-center shrink-0">
            <Building2 className="w-5.5 h-5.5 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block leading-none">
              Proyectos Cámara (CD)
            </span>
            <span className="text-xl font-mono font-black text-slate-900 block mt-1.5">
              {totalProyectosDiputados} <span className="text-xs font-sans font-bold text-slate-400">ítems</span>
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-50/70 border border-slate-150 p-4.5 rounded-xl text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-105 flex items-center justify-center shrink-0">
            <Landmark className="w-5.5 h-5.5 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block leading-none">
              Proyectos Senado (SR)
            </span>
            <span className="text-xl font-mono font-black text-slate-900 block mt-1.5">
              {totalProyectosSenado} <span className="text-xs font-sans font-bold text-slate-400">ítems</span>
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-50/70 border border-slate-150 p-4.5 rounded-xl text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-105 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5.5 h-5.5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block leading-none truncate">
              Mayor Carga Diputados
            </span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-2 leading-tight">
              {maxDiputadosCom?.nombre || "Hacienda"}
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-600 block mt-0.5">
              {maxDiputadosCom?.proyectos || 0} proyectos activos
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-50/70 border border-slate-150 p-4.5 rounded-xl text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-155 flex items-center justify-center shrink-0">
            <CalendarCheck2 className="w-5.5 h-5.5 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block leading-none truncate">
              Mayor Carga Senado
            </span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-2 leading-tight">
              {maxSenadoCom?.nombre || "Hacienda"}
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-650 block mt-0.5">
              {maxSenadoCom?.proyectos || 0} proyectos activos
            </span>
          </div>
        </div>
      </div>

      {/* Main Dynamic Interactive Graphic Container */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[380px] w-full relative">
        
        {/* Dynamic description of the shown chart */}
        <div className="text-left w-full mb-3 text-slate-500 text-[11px] font-bold">
          {chartType === "bicameral" && (
            <span>📊 Comparativa side-by-side de proyectos activos en las 8 comisiones equivalentes prioritarias en ambas cámaras.</span>
          )}
          {chartType === "ranking" && (
            <span>📈 Ranking unificado de las 12 comisiones permanentes más sobrecargadas de trabajo en todo el Congreso.</span>
          )}
          {chartType === "totales" && (
            <span>🍩 Reparto porcentual del total de las propuestas de ley bajo estudio en el Congreso Nacional ({totalGlobalProyectos} Proyectos totales).</span>
          )}
        </div>

        <div className="w-full h-80 sm:h-90 font-sans" style={{ minWidth: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bicameral" ? (
              <BarChart
                data={bicameralData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  label={{ value: "Proyectos activos", angle: -90, position: "insideLeft", offset: 15, style: { fontSize: 10, fill: '#64748b', fontWeight: 'bold' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 'bold' }} 
                  verticalAlign="bottom" 
                  height={36} 
                />
                <Bar 
                  dataKey="Cámara (CD)" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={45} 
                />
                <Bar 
                  dataKey="Senado (SR)" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={45} 
                />
              </BarChart>
            ) : chartType === "ranking" ? (
              <BarChart
                data={topCommissionsRanking}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#334155', fontSize: 10, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  width={140}
                />
                <Tooltip content={<CustomRankingTooltip />} />
                <Bar dataKey="proyectos" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {topCommissionsRanking.map((entry, index) => {
                    const color = entry.chamber === "Cámara (CD)" ? "#3b82f6" : "#ef4444";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={totalSharesData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {totalSharesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} proyectos (${((value / totalGlobalProyectos) * 100).toFixed(1)}%)`, "Carga activa"]} 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "white" }}
                  itemStyle={{ color: "#fbbf24", fontWeight: "bold" }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={40}
                  content={({ payload }) => (
                    <div className="flex justify-center gap-6 text-xs font-bold pt-4">
                      {payload?.map((entry: any, index: number) => {
                        const raw = totalSharesData[index];
                        return (
                          <div key={`legend-${index}`} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: raw.color }} />
                            <span className="text-slate-600">{raw.name}:</span>
                            <span className="text-slate-900 font-mono font-extrabold">
                              {raw.value} ({((raw.value / totalGlobalProyectos) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Auxiliary informative disclaimer footer */}
      <div className="mt-4 bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-start gap-2.5 text-left text-[11px] leading-relaxed text-slate-550 font-semibold font-sans">
        <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p>
          Debido a la naturaleza bicameral del sistema legislativo de Chile, determinados proyectos de ley (p. ej. Presupuesto Fiscal, Reformas de Trabajo o Leyes de Seguridad) requieren de constante debate tanto en las comisiones de la Cámara de origen como en las de revisión en el Senado. El gráfico de <b>Áreas Comunes</b> le permite observar paralelamente dónde se concentran los esfuerzos técnicos del Congreso.
        </p>
      </div>
    </div>
  );
}
