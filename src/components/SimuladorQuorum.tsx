import React, { useState, useMemo } from "react";
import { 
  Scale, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Users, 
  Info, 
  HelpCircle,
  Sliders,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from "lucide-react";
import { QuorumBancada, Proyecto } from "../types";

interface SimuladorQuorumProps {
  proyecto?: Proyecto;
  defaultCamara?: "Diputados" | "Senado";
}

const BANCADAS_DIPUTADOS_INIT: QuorumBancada[] = [
  { id: "fa", nombre: "Frente Amplio (FA)", color: "#10b981", bloque: "Oficialismo", escanosTotales: 22, aFavor: 22, enContra: 0, abstencion: 0, ausente: 0 },
  { id: "ps", nombre: "Partido Socialista (PS)", color: "#ef4444", bloque: "Oficialismo", escanosTotales: 13, aFavor: 13, enContra: 0, abstencion: 0, ausente: 0 },
  { id: "pc", nombre: "Partido Comunista (PC)", color: "#dc2626", bloque: "Oficialismo", escanosTotales: 12, aFavor: 12, enContra: 0, abstencion: 0, ausente: 0 },
  { id: "ppd", nombre: "PPD e Independientes", color: "#f97316", bloque: "Oficialismo", escanosTotales: 9, aFavor: 9, enContra: 0, abstencion: 0, ausente: 0 },
  { id: "dc", nombre: "Democracia Cristiana (DC)", color: "#3b82f6", bloque: "Centro/Independiente", escanosTotales: 5, aFavor: 4, enContra: 1, abstencion: 0, ausente: 0 },
  { id: "dem", nombre: "Demócratas y Amarillos", color: "#eab308", bloque: "Centro/Independiente", escanosTotales: 6, aFavor: 3, enContra: 3, abstencion: 0, ausente: 0 },
  { id: "rn", nombre: "Renovación Nacional (RN)", color: "#2563eb", bloque: "Oposición", escanosTotales: 22, aFavor: 2, enContra: 18, abstencion: 2, ausente: 0 },
  { id: "udi", nombre: "Unión Demócrata Independiente (UDI)", color: "#1d4ed8", bloque: "Oposición", escanosTotales: 21, aFavor: 0, enContra: 20, abstencion: 1, ausente: 0 },
  { id: "prep", nombre: "Partido Republicano (PREP)", color: "#1e3a8a", bloque: "Oposición", escanosTotales: 12, aFavor: 0, enContra: 12, abstencion: 0, ausente: 0 },
  { id: "evop", nombre: "Evópoli", color: "#06b6d4", bloque: "Oposición", escanosTotales: 4, aFavor: 1, enContra: 3, abstencion: 0, ausente: 0 },
  { id: "ind", nombre: "Independientes y Otros", color: "#64748b", bloque: "Centro/Independiente", escanosTotales: 29, aFavor: 14, enContra: 12, abstencion: 3, ausente: 0 },
];

const BANCADAS_SENADO_INIT: QuorumBancada[] = [
  { id: "s_ps", nombre: "Partido Socialista (PS)", color: "#ef4444", bloque: "Oficialismo", escanosTotales: 7, aFavor: 7, enContra: 0, abstencion: 0, ausente: 0 },
  { id: "s_ppd", nombre: "PPD e Independientes", color: "#f97316", bloque: "Oficialismo", escanosTotales: 6, aFavor: 6, enContra: 0, abstencion: 0, ausente: 0 },
  { id: "s_pc_fa", nombre: "PC y Frente Amplio", color: "#dc2626", bloque: "Oficialismo", escanosTotales: 3, aFavor: 3, enContra: 0, abstencion: 0, ausente: 0 },
  { id: "s_dc_dem", nombre: "Demócratas y DC", color: "#eab308", bloque: "Centro/Independiente", escanosTotales: 4, aFavor: 2, enContra: 2, abstencion: 0, ausente: 0 },
  { id: "s_rn", nombre: "Renovación Nacional (RN)", color: "#2563eb", bloque: "Oposición", escanosTotales: 11, aFavor: 1, enContra: 9, abstencion: 1, ausente: 0 },
  { id: "s_udi", nombre: "Unión Demócrata Independiente (UDI)", color: "#1d4ed8", bloque: "Oposición", escanosTotales: 9, aFavor: 0, enContra: 8, abstencion: 1, ausente: 0 },
  { id: "s_evop", nombre: "Evópoli", color: "#06b6d4", bloque: "Oposición", escanosTotales: 2, aFavor: 0, enContra: 2, abstencion: 0, ausente: 0 },
  { id: "s_prep", nombre: "Partido Republicano / PSC", color: "#1e3a8a", bloque: "Oposición", escanosTotales: 2, aFavor: 0, enContra: 2, abstencion: 0, ausente: 0 },
  { id: "s_ind", nombre: "Senadores Independientes", color: "#64748b", bloque: "Centro/Independiente", escanosTotales: 6, aFavor: 3, enContra: 2, abstencion: 1, ausente: 0 },
];

export default function SimuladorQuorum({ proyecto, defaultCamara = "Diputados" }: SimuladorQuorumProps) {
  const [camara, setCamara] = useState<"Diputados" | "Senado">(
    (proyecto?.camaraOrigen as any) === "Senado" ? "Senado" : defaultCamara
  );

  const initialQuorumType = proyecto?.quorum?.tipo || "Ley Simple";
  const [tipoQuorum, setTipoQuorum] = useState<"Ley Simple" | "Quórum Calificado" | "Ley Orgánica Constitucional" | "Reforma Constitucional">(
    initialQuorumType as any
  );

  const [bancadas, setBancadas] = useState<QuorumBancada[]>(
    camara === "Diputados" ? BANCADAS_DIPUTADOS_INIT : BANCADAS_SENADO_INIT
  );

  const handleCamaraChange = (c: "Diputados" | "Senado") => {
    setCamara(c);
    setBancadas(c === "Diputados" ? BANCADAS_DIPUTADOS_INIT : BANCADAS_SENADO_INIT);
  };

  const handleVoteChange = (id: string, field: "aFavor" | "enContra" | "abstencion" | "ausente", value: number) => {
    setBancadas(prev => prev.map(b => {
      if (b.id !== id) return b;
      const total = b.escanosTotales;
      const val = Math.max(0, Math.min(total, value));
      
      const newB = { ...b, [field]: val };
      // Balance remaining
      const sum = newB.aFavor + newB.enContra + newB.abstencion + newB.ausente;
      if (sum > total) {
        // Adjust other fields
        const diff = sum - total;
        if (field !== "enContra" && newB.enContra >= diff) newB.enContra -= diff;
        else if (field !== "aFavor" && newB.aFavor >= diff) newB.aFavor -= diff;
      }
      return newB;
    }));
  };

  const resetPreset = (preset: "oficialismo" | "oposicion" | "unanimidad" | "empate") => {
    setBancadas(prev => prev.map(b => {
      const tot = b.escanosTotales;
      if (preset === "unanimidad") {
        return { ...b, aFavor: tot, enContra: 0, abstencion: 0, ausente: 0 };
      }
      if (preset === "oficialismo") {
        if (b.bloque === "Oficialismo") return { ...b, aFavor: tot, enContra: 0, abstencion: 0, ausente: 0 };
        if (b.bloque === "Centro/Independiente") return { ...b, aFavor: Math.ceil(tot / 2), enContra: Math.floor(tot / 2), abstencion: 0, ausente: 0 };
        return { ...b, aFavor: 0, enContra: tot, abstencion: 0, ausente: 0 };
      }
      if (preset === "oposicion") {
        if (b.bloque === "Oposición") return { ...b, aFavor: tot, enContra: 0, abstencion: 0, ausente: 0 };
        if (b.bloque === "Centro/Independiente") return { ...b, aFavor: Math.ceil(tot / 2), enContra: Math.floor(tot / 2), abstencion: 0, ausente: 0 };
        return { ...b, aFavor: 0, enContra: tot, abstencion: 0, ausente: 0 };
      }
      if (preset === "empate") {
        const half = Math.floor(tot / 2);
        return { ...b, aFavor: half, enContra: tot - half, abstencion: 0, ausente: 0 };
      }
      return b;
    }));
  };

  const stats = useMemo(() => {
    const totalEscanos = camara === "Diputados" ? 155 : 50;
    const votosFavor = bancadas.reduce((acc, b) => acc + b.aFavor, 0);
    const votosContra = bancadas.reduce((acc, b) => acc + b.enContra, 0);
    const votosAbstencion = bancadas.reduce((acc, b) => acc + b.abstencion, 0);
    const votosAusente = bancadas.reduce((acc, b) => acc + b.ausente, 0);
    const votosPresentes = votosFavor + votosContra + votosAbstencion;

    let umbral = 0;
    let descripcionUmbral = "";

    if (tipoQuorum === "Ley Simple") {
      // Mayoría simple de presentes
      umbral = Math.floor(votosPresentes / 2) + 1;
      descripcionUmbral = `Mayoría simple de presentes (${umbral} votos con ${votosPresentes} parlamentarios en Sala)`;
    } else if (tipoQuorum === "Quórum Calificado" || tipoQuorum === "Ley Orgánica Constitucional") {
      // Mayoría absoluta de parlamentarios en ejercicio
      umbral = camara === "Diputados" ? 78 : 26;
      descripcionUmbral = `Mayoría absoluta de miembros en ejercicio (${umbral} de ${totalEscanos} escaños - Art. 66 CPR)`;
    } else if (tipoQuorum === "Reforma Constitucional") {
      // 4/7 de parlamentarios en ejercicio
      umbral = camara === "Diputados" ? 89 : 29;
      descripcionUmbral = `Cuatro séptimos (4/7) de miembros en ejercicio (${umbral} de ${totalEscanos} escaños - Art. 127 CPR)`;
    }

    const aprobado = votosFavor >= umbral;

    return {
      totalEscanos,
      votosFavor,
      votosContra,
      votosAbstencion,
      votosAusente,
      votosPresentes,
      umbral,
      descripcionUmbral,
      aprobado,
      porcentajeFavor: ((votosFavor / totalEscanos) * 100).toFixed(1),
      diferencia: votosFavor - umbral
    };
  }, [bancadas, camara, tipoQuorum]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              Simulador de Votación y Quórum Parlamentario
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Proyecta votaciones en Sala por bancadas políticas y calcula si el proyecto alcanza el quórum constitucional necesario.
          </p>
        </div>

        {/* Chamber & Quorum selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => handleCamaraChange("Diputados")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                camara === "Diputados" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cámara de Diputadas/os (155)
            </button>
            <button
              onClick={() => handleCamaraChange("Senado")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                camara === "Senado" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Senado (50)
            </button>
          </div>

          <select
            value={tipoQuorum}
            onChange={(e) => setTipoQuorum(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="Ley Simple">Ley Simple (Mayoría Simple)</option>
            <option value="Quórum Calificado">Quórum Calificado (Mayoría Absoluta 78/26)</option>
            <option value="Ley Orgánica Constitucional">Ley Orgánica Constitucional (Mayoría Absoluta 78/26)</option>
            <option value="Reforma Constitucional">Reforma Constitucional (4/7 partes 89/29)</option>
          </select>
        </div>
      </div>

      {/* Result Status Banner */}
      <div className={`mt-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
        stats.aprobado
          ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
          : "bg-rose-50/80 border-rose-200 text-rose-900"
      }`}>
        <div className="flex items-center gap-3">
          {stats.aprobado ? (
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="text-base font-bold flex items-center gap-2">
              <span>{stats.aprobado ? "PROYECTO APROBADO EN SALA" : "PROYECTO RECHAZADO / INSUFICIENTE"}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/70">
                {stats.votosFavor} a favor vs {stats.umbral} requeridos
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {stats.descripcionUmbral}. {stats.diferencia >= 0 ? `Supera el umbral por +${stats.diferencia} voto(s).` : `Faltan ${Math.abs(stats.diferencia)} voto(s) para su aprobación.`}
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <span className="text-xs font-semibold text-slate-500 mr-1">Escenarios:</span>
          <button
            onClick={() => resetPreset("oficialismo")}
            className="px-2 py-1 text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded font-medium shadow-2xs"
          >
            Bloque Oficialista
          </button>
          <button
            onClick={() => resetPreset("oposicion")}
            className="px-2 py-1 text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded font-medium shadow-2xs"
          >
            Bloque Oposición
          </button>
          <button
            onClick={() => resetPreset("unanimidad")}
            className="px-2 py-1 text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded font-medium shadow-2xs"
          >
            Unanimidad
          </button>
        </div>
      </div>

      {/* Progress Bar & Hemiciclo Summary */}
      <div className="mt-6">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
          <span>Distribución de Votos en Sala</span>
          <span>{stats.votosFavor} A favor | {stats.votosContra} En contra | {stats.votosAbstencion} Abstención | {stats.votosAusente} Ausentes</span>
        </div>

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex relative">
          {/* Threshold marker */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-slate-900 z-10"
            style={{ left: `${(stats.umbral / stats.totalEscanos) * 100}%` }}
            title={`Umbral requerido: ${stats.umbral} votos`}
          />
          <div 
            className="bg-emerald-500 transition-all duration-300" 
            style={{ width: `${(stats.votosFavor / stats.totalEscanos) * 100}%` }} 
          />
          <div 
            className="bg-rose-500 transition-all duration-300" 
            style={{ width: `${(stats.votosContra / stats.totalEscanos) * 100}%` }} 
          />
          <div 
            className="bg-amber-400 transition-all duration-300" 
            style={{ width: `${(stats.votosAbstencion / stats.totalEscanos) * 100}%` }} 
          />
          <div 
            className="bg-slate-300 transition-all duration-300" 
            style={{ width: `${(stats.votosAusente / stats.totalEscanos) * 100}%` }} 
          />
        </div>

        <div className="flex justify-between items-center text-2xs text-slate-400 mt-1.5 font-mono">
          <span>0 escaños</span>
          <span className="font-bold text-slate-700">▲ Umbral requerido: {stats.umbral} votos</span>
          <span>{stats.totalEscanos} escaños</span>
        </div>
      </div>

      {/* Parliamentary Groups Table & Sliders */}
      <div className="mt-8">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Composición y Votación por Bancadas ({camara})
        </h4>

        <div className="space-y-3">
          {bancadas.map((b) => (
            <div key={b.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-lg transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                  <span className="text-sm font-semibold text-slate-900">{b.nombre}</span>
                  <span className="text-2xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-medium">
                    {b.escanosTotales} escaños • {b.bloque}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                  <span className="text-emerald-600 font-bold">{b.aFavor} Sí</span>
                  <span className="text-rose-600 font-bold">{b.enContra} No</span>
                  <span className="text-amber-600 font-bold">{b.abstencion} Abst.</span>
                  <span className="text-slate-400">{b.ausente} Aus.</span>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <label className="text-2xs font-semibold text-emerald-700">A Favor:</label>
                  <input
                    type="number"
                    min="0"
                    max={b.escanosTotales}
                    value={b.aFavor}
                    onChange={(e) => handleVoteChange(b.id, "aFavor", parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-0.5 text-xs bg-white border border-emerald-300 rounded font-bold text-emerald-800 text-center"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-2xs font-semibold text-rose-700">En Contra:</label>
                  <input
                    type="number"
                    min="0"
                    max={b.escanosTotales}
                    value={b.enContra}
                    onChange={(e) => handleVoteChange(b.id, "enContra", parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-0.5 text-xs bg-white border border-rose-300 rounded font-bold text-rose-800 text-center"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-2xs font-semibold text-amber-700">Abstención:</label>
                  <input
                    type="number"
                    min="0"
                    max={b.escanosTotales}
                    value={b.abstencion}
                    onChange={(e) => handleVoteChange(b.id, "abstencion", parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-0.5 text-xs bg-white border border-amber-300 rounded font-bold text-amber-800 text-center"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-2xs font-semibold text-slate-500">Ausentes:</label>
                  <input
                    type="number"
                    min="0"
                    max={b.escanosTotales}
                    value={b.ausente}
                    onChange={(e) => handleVoteChange(b.id, "ausente", parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-bold text-slate-600 text-center"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
