import React, { useState } from "react";
import { 
  MapPin, 
  Globe, 
  Building2, 
  Users, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Landmark, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Proyecto } from "../types";

interface TerritorialImpactPanelProps {
  proyecto: Proyecto;
  onSelectCommission?: (comisionId: string) => void;
}

export interface RegionImpact {
  region: string;
  zona: "Norte" | "Centro" | "Sur" | "Austral" | "Nacional";
  intensidad: "Alta" | "Media" | "Baja";
  distritos: string[];
  focoTerritorial: string;
  parlamentariosZona: string[];
  colorBadge: string;
}

export default function TerritorialImpactPanel({
  proyecto,
  onSelectCommission
}: TerritorialImpactPanelProps) {
  const [selectedZona, setSelectedZona] = useState<string>("Todas");

  // Derive realistic territorial impact mapping based on bill subject
  const pText = `${proyecto.titulo} ${proyecto.materia || ""} ${proyecto.resumen || ""}`.toLowerCase();

  const isAgriOrRural = pText.includes("rural") || pText.includes("agrícol") || pText.includes("loteo") || pText.includes("suelo") || pText.includes("agua");
  const isMining = pText.includes("miner") || pText.includes("cobre") || pText.includes("litio") || pText.includes("fundici");
  const isMaritime = pText.includes("pesca") || pText.includes("mar") || pText.includes("puerto") || pText.includes("acuícol");
  const isSecurityOrMunicipal = pText.includes("seguridad") || pText.includes("municip") || pText.includes("delito") || pText.includes("migra");

  const regionsImpact: RegionImpact[] = [
    {
      region: "Región de Antofagasta",
      zona: "Norte",
      intensidad: isMining ? "Alta" : "Media",
      distritos: ["Distrito 3"],
      focoTerritorial: isMining ? "Centros mineros de Chuquicamata, Calama y royalties comunales." : "Regulación institucional y empleo.",
      parlamentariosZona: ["Sen. Pedro Araya", "Dip. Yovana Ahumada", "Dip. Jaime Araya"],
      colorBadge: "bg-amber-100 text-amber-900 border-amber-300"
    },
    {
      region: "Región de Coquimbo",
      zona: "Norte",
      intensidad: (isAgriOrRural || isMining) ? "Alta" : "Media",
      distritos: ["Distrito 5"],
      focoTerritorial: "Comunidades agrícolas de Choapa, Limarí y Elqui frente a disponibilidad de recursos hídricos.",
      parlamentariosZona: ["Sen. Matías Walker", "Dip. Carolina Tello", "Dip. Daniel Manouchehri"],
      colorBadge: "bg-emerald-100 text-emerald-900 border-emerald-300"
    },
    {
      region: "Región de Valparaíso",
      zona: "Centro",
      intensidad: (isMaritime || isAgriOrRural) ? "Alta" : "Media",
      distritos: ["Distrito 6", "Distrito 7"],
      focoTerritorial: "Valle de Aconcagua, cordón costero portuario y zonas periurbanas de Valparaíso/Viña del Mar.",
      parlamentariosZona: ["Sen. Francisco Chahuán", "Sen. Ricardo Lagos Weber", "Dip. Jorge Brito", "Dip. Carolina Marzán"],
      colorBadge: "bg-blue-100 text-blue-900 border-blue-300"
    },
    {
      region: "Región Metropolitana de Santiago",
      zona: "Centro",
      intensidad: isSecurityOrMunicipal ? "Alta" : "Media",
      distritos: ["Distrito 8", "Distrito 9", "Distrito 10", "Distrito 11", "Distrito 12", "Distrito 13", "Distrito 14"],
      focoTerritorial: "Gobernanza metropolitana, seguridad municipal y regulación de loteos rurales en comunas periféricas (Talagante, Melipilla).",
      parlamentariosZona: ["Sen. Luciano Cruz-Coke", "Dip. Rubén Oyarzo", "Dip. Tomás Hirsch", "Dip. Maite Orsini"],
      colorBadge: "bg-purple-100 text-purple-900 border-purple-300"
    },
    {
      region: "Región del Maule",
      zona: "Centro",
      intensidad: isAgriOrRural ? "Alta" : "Media",
      distritos: ["Distrito 17", "Distrito 18"],
      focoTerritorial: "Suelo agropecuario, comités de agua potable rural (APR) y ordenamiento territorial del valle central.",
      parlamentariosZona: ["Sen. Juan Antonio Coloma", "Sen. Paulina Vodanovic", "Dip. Felipe Donoso"],
      colorBadge: "bg-emerald-100 text-emerald-900 border-emerald-300"
    },
    {
      region: "Región del Biobío",
      zona: "Sur",
      intensidad: (isMaritime || isAgriOrRural) ? "Alta" : "Media",
      distritos: ["Distrito 20", "Distrito 21"],
      focoTerritorial: "Puertos de Talcahuano/Coronel, sector forestal e industrial y cuencas hidrográficas.",
      parlamentariosZona: ["Sen. Gastón Saavedra", "Sen. Enrique Van Rysselberghe", "Dip. Joanna Pérez", "Dip. Eric Aedo"],
      colorBadge: "bg-sky-100 text-sky-900 border-sky-300"
    },
    {
      region: "Región de La Araucanía",
      zona: "Sur",
      intensidad: "Alta",
      distritos: ["Distrito 22", "Distrito 23"],
      focoTerritorial: "Protección de comunidades rurales, orden público en macrozona sur y desarrollo intercultural.",
      parlamentariosZona: ["Sen. Francisco Huenchumilla", "Sen. Jaime Quintana", "Dip. Miguel Mellado", "Dip. Ericka Ñanco"],
      colorBadge: "bg-rose-100 text-rose-900 border-rose-300"
    },
    {
      region: "Región de Los Lagos",
      zona: "Sur",
      intensidad: (isMaritime || isAgriOrRural) ? "Alta" : "Media",
      distritos: ["Distrito 25", "Distrito 26"],
      focoTerritorial: "Acuicultura del salmón, pesca artesanal en Chiloé y parcelaciones en la cuenca del lago Llanquihue.",
      parlamentariosZona: ["Sen. Fidel Espinoza", "Sen. Carlos Kuschel", "Dip. Jaime Sáez", "Dip. Héctor Ulloa"],
      colorBadge: "bg-cyan-100 text-cyan-900 border-cyan-300"
    }
  ];

  const filteredRegions = regionsImpact.filter(r => {
    if (selectedZona === "Todas") return true;
    return r.zona === selectedZona;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 flex flex-col gap-6 shadow-sm font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Mapeo de Impacto Territorial y Distrital
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              Incidencia Subnacional
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1.5 tracking-tight flex items-center gap-2">
            <span>Zonas, Regiones y Distritos Afectados por el Proyecto</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Análisis de las regiones de Chile donde esta iniciativa legal tendrá mayor repercusión directa en términos productivos, sociales, ambientales o administrativos.
          </p>
        </div>

        {/* Zona Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-center">
          {(["Todas", "Norte", "Centro", "Sur"] as const).map(z => (
            <button
              key={z}
              onClick={() => setSelectedZona(z)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedZona === z
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Regional Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRegions.map((reg, idx) => (
          <div
            key={idx}
            className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4.5 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
          >
            <div>
              {/* Top row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      {reg.region}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      Zona {reg.zona} · {reg.distritos.join(", ")}
                    </span>
                  </div>
                </div>

                <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                  reg.intensidad === "Alta"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  Impacto {reg.intensidad}
                </span>
              </div>

              {/* Foco Territorial */}
              <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Foco & Efectos Locales:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {reg.focoTerritorial}
                </p>
              </div>
            </div>

            {/* Representative Legislators */}
            <div className="pt-2.5 border-t border-slate-200/70 flex flex-col gap-1.5">
              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-600" />
                <span>Parlamentarios Representantes de la Zona:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {reg.parlamentariosZona.map((pName, pIdx) => (
                  <span
                    key={pIdx}
                    className="text-[10.5px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 shadow-3xs"
                  >
                    {pName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
