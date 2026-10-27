import React, { useState, useMemo } from "react";
import { Activity, Search, ChevronRight, ExternalLink, Info } from "lucide-react";
import { Integrante, Comision } from "../types";

interface ParlamentariosMatrixProps {
  comision: Comision;
  integrantes: Integrante[];
  onSelectMember: (integrante: Integrante) => void;
  isSenado?: boolean;
}

// Enlace a la ficha oficial del parlamentario, donde están su asistencia, votaciones y
// mociones reales. Antes este componente mostraba asistencia, votos, minutos de
// intervención y proyectos patrocinados calculados a partir del largo del nombre
// (cifras inventadas). Ahora solo muestra datos reales y deriva al registro oficial.
function urlFichaOficial(i: Integrante, isSenado: boolean): string {
  if (!isSenado && i.prmID) {
    return `https://www.camara.cl/diputados/detalle/biografia.aspx?prmId=${encodeURIComponent(i.prmID)}`;
  }
  if (isSenado) {
    return `https://www.senado.cl/senadoras-y-senadores`;
  }
  return "https://www.camara.cl/diputados/diputados.aspx";
}

export default function ParlamentariosMatrix({
  comision,
  integrantes,
  onSelectMember,
  isSenado = false
}: ParlamentariosMatrixProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [partyFilter, setPartyFilter] = useState("todos");

  const uniqueParties = useMemo(() => {
    const set = new Set(integrantes.map(i => i.partido).filter(Boolean));
    return Array.from(set).sort();
  }, [integrantes]);

  const filtered = useMemo(() => {
    return integrantes
      .filter(m => {
        if (partyFilter !== "todos" && m.partido !== partyFilter) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return m.nombre.toLowerCase().includes(q) || (m.distrito && String(m.distrito).includes(q));
      })
      .sort((a, b) => {
        const aP = (a.rol || "").toLowerCase().includes("president") ? 0 : 1;
        const bP = (b.rol || "").toLowerCase().includes("president") ? 0 : 1;
        return aP - bP || a.nombre.localeCompare(b.nombre);
      });
  }, [integrantes, partyFilter, searchTerm]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-7 flex flex-col gap-6 shadow-sm font-sans">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Integrantes de la comisión
          </span>
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            {integrantes.length} legisladores
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{comision.nombre}</h3>
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-600">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
          <span>
            La asistencia, votaciones e intervenciones de cada parlamentario se consultan en su ficha oficial
            ({isSenado ? "senado.cl" : "camara.cl"}). Esta app no muestra esas cifras hasta contar con una fuente oficial conectada.
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre del parlamentario o distrito..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Partido:</span>
          <select
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 outline-none cursor-pointer w-full sm:w-auto"
          >
            <option value="todos">Todos ({uniqueParties.length})</option>
            {uniqueParties.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-slate-500 italic">Sin integrantes registrados para este filtro.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((i, idx) => {
            const isPresident = i.rol && i.rol.toLowerCase().includes("president");
            return (
              <div
                key={`${i.nombre}-${idx}`}
                className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 transition-all shadow-xs flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  {i.fotoUrl ? (
                    <img
                      src={i.fotoUrl}
                      alt={i.nombre}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm border border-blue-200 shrink-0">
                      {i.nombre.split(" ").slice(0, 2).map(w => w[0]).join("")}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      {isPresident && (
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 rounded uppercase">Preside</span>
                      )}
                      {i.partido && (
                        <span className="text-[9px] font-black px-1.5 rounded bg-slate-100 text-slate-700 border border-slate-200">{i.partido}</span>
                      )}
                      {i.distrito && (
                        <span className="text-[9px] font-mono font-bold text-slate-400">D{i.distrito}</span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-slate-900 truncate">{i.nombre}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                      {i.rol || (isSenado ? "Senador/a" : "Diputada/o")}
                    </span>
                    {i.region && <span className="text-[10px] text-slate-400 block">{i.region}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px]">
                  <a
                    href={urlFichaOficial(i, isSenado)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                  >
                    Ficha oficial <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => onSelectMember(i)}
                    className="text-slate-600 font-extrabold hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    Ver detalle <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
