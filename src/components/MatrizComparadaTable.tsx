/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Copy, Printer, Check, Globe, Filter, Scale, CheckCircle2, FileText, Loader2 } from "lucide-react";
import EnlaceVerificado from "./EnlaceVerificado";

export interface MatrizColumna {
  key: string;
  nombre: string;
  bandera?: string;
  normativaReferencia?: string;
  /** Enlace oficial a la norma (se verifica visitándolo antes de mostrarlo como válido). */
  url?: string;
  isChile?: boolean;
}

export interface MatrizFilaDinamica {
  dimension: string;
  /** Título descriptivo del punto (p. ej. "Sanciones por internación de plagas"). */
  titulo?: string;
  icono?: string;
  valores: Record<string, string>;
  lecturaJuridica: string;
  isWarmRow?: boolean;
}

export interface MatrizComparadaData {
  id?: string;
  titulo: string;
  subtitulo: string;
  boletinReferencia?: string;
  columnas: MatrizColumna[];
  filas: MatrizFilaDinamica[];
}

interface MatrizComparadaTableProps {
  /** Matriz generada a partir de las normas realmente buscadas y seleccionadas. */
  data: MatrizComparadaData;
}

export default function MatrizComparadaTable({ data }: MatrizComparadaTableProps) {
  const [copied, setCopied] = useState(false);
  const [informes, setInformes] = useState<Record<number, { cargando?: boolean; texto?: string; error?: string }>>({});

  const activeData: MatrizComparadaData = data;


  // Informe redactado de UN punto (fila) de la matriz, a partir solo de lo que dice cada norma.
  const redactarInformePunto = async (idx: number) => {
    const fila = activeData.filas[idx];
    if (!fila) return;
    setInformes(prev => ({ ...prev, [idx]: { cargando: true } }));
    try {
      const r = await fetch("/api/derecho-comparado/informe-punto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: activeData.titulo,
          dimension: fila.titulo || fila.dimension,
          lecturaJuridica: fila.lecturaJuridica,
          paises: activeData.columnas.map(c => ({
            pais: c.nombre,
            norma: c.normativaReferencia || "",
            texto: fila.valores[c.key] || "",
          })),
        }),
      });
      const j: { texto?: string | null; error?: string } = await r.json();
      if (!r.ok || !j.texto) throw new Error(j.error || "sin texto");
      setInformes(prev => ({ ...prev, [idx]: { texto: j.texto! } }));
    } catch {
      setInformes(prev => ({ ...prev, [idx]: { error: "No se pudo redactar el informe de este punto. Reintenta en un minuto." } }));
    }
  };

  const handleCopyText = () => {
    const headerCols = activeData.columnas.map(c => c.nombre).join(" | ");
    const textRepresentation = `${activeData.titulo}\n${activeData.subtitulo}\n` +
      (activeData.boletinReferencia ? `Referencia: ${activeData.boletinReferencia}\n\n` : "\n") +
      `Dimensión Normativa | ${headerCols} | Lectura Jurídica / Lección para Chile\n` +
      activeData.filas.map(f => {
        const rowVals = activeData.columnas.map(c => f.valores[c.key] || "—").join(" | ");
        return `${f.dimension} | ${rowVals} | ${f.lecturaJuridica}`;
      }).join('\n');
    
    navigator.clipboard.writeText(textRepresentation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ["Dimensión Normativa", ...activeData.columnas.map(c => `${c.nombre}${c.isChile ? " (Chile)" : ""}`), "Lectura Jurídica / Lección para Chile"];
    const rows = activeData.filas.map(f => [
      `"${f.dimension}"`,
      ...activeData.columnas.map(c => `"${(f.valores[c.key] || "").replace(/"/g, '""')}"`),
      `"${f.lecturaJuridica.replace(/"/g, '""')}"`
    ].join(";"));
    
    const csvContent = "\ufeff" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Matriz_Comparada_BCN_${activeData.titulo.replace(/[^a-zA-Z0-9]+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* Title Header with Institutional BCN Styling */}
      <div className="flex flex-col items-center justify-center text-center gap-1.5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="bg-blue-700 text-white font-bold px-3 py-0.5 text-[10px] uppercase tracking-wider rounded-full font-mono flex items-center gap-1.5 shadow-2xs">
            <Scale className="w-3.5 h-3.5" /> Asesoría Técnica Parlamentaria BCN
          </span>
          {activeData.boletinReferencia && (
            <span className="bg-slate-800 text-slate-200 font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-full font-mono">
              {activeData.boletinReferencia}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
          {activeData.titulo}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-3xl">
          {activeData.subtitulo}
        </p>
      </div>

      {/* Selector & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/90 p-3 rounded-2xl border border-slate-200 shadow-2xs">

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={handleDownloadCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Exportar planilla CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Imprimir o Guardar PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* Main Multidimensional Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-300 shadow-md bg-white">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          
          {/* Header Row */}
          <thead>
            <tr className="text-xs font-bold text-white tracking-wide">
              
              {/* Dimensión normativa */}
              <th className="bg-[#1e293b] p-4 border-r border-[#334155] w-[14%] align-middle font-bold text-slate-100 uppercase text-[11px] font-mono">
                Dimensión Normativa
              </th>

              {/* Dynamic Country Columns */}
              {activeData.columnas.map((col) => {
                const isChile = col.isChile || col.nombre.toLowerCase().includes("chile");

                return (
                  <th 
                    key={col.key} 
                    className={`p-4 border-r border-[#334155] align-middle ${
                      isChile ? "bg-[#0f172a] text-amber-300 ring-1 ring-inset ring-amber-400/30" : "bg-[#1e293b]"
                    }`}
                    style={{ width: `${Math.floor(70 / (activeData.columnas.length + 1))}%` }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        {col.bandera && <span className="text-base leading-none">{col.bandera}</span>}
                        <span className="text-xs font-black tracking-tight">{col.nombre}</span>
                        {isChile && (
                          <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ml-auto">
                            LOCAL
                          </span>
                        )}
                      </div>
                      {col.normativaReferencia && (
                        <span className="text-[10px] text-slate-300 font-mono font-normal leading-tight opacity-90 line-clamp-2">
                          {col.url
                            ? <EnlaceVerificado url={col.url} className="!text-sky-300">{col.normativaReferencia}</EnlaceVerificado>
                            : col.normativaReferencia}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Lectura Jurídica / Lección para Chile */}
              <th className="bg-[#3b82f6] text-white p-4 w-[16%] align-middle font-bold uppercase text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-white" />
                  <span>Lectura Jurídica BCN</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 text-xs leading-relaxed">
            {activeData.filas.map((fila, idx) => {
              const isWarm = fila.isWarmRow;
              
              return (
                <React.Fragment key={idx}>
                <tr 
                  className={
                    isWarm 
                      ? "bg-[#fff7ed] text-slate-900 border-t-2 border-amber-300" 
                      : (idx % 2 === 0 ? "bg-white text-slate-800" : "bg-[#f8fafc] text-slate-800")
                  }
                >
                  {/* Dimensión */}
                  <td className={`p-4 font-bold border-r align-top ${
                    isWarm 
                      ? "border-amber-200 text-amber-950 bg-amber-100/50" 
                      : "border-slate-200 text-slate-900 bg-slate-50/70"
                  }`}>
                    <div className="flex flex-col gap-1.5">
                      {fila.titulo ? (
                        <>
                          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-amber-800 font-mono">{fila.dimension}</span>
                          <span className="font-extrabold text-[12.5px] text-slate-950 leading-snug">{fila.titulo}</span>
                        </>
                      ) : (
                        <span className="font-extrabold text-[12px] text-slate-950">{fila.dimension}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => redactarInformePunto(idx)}
                        disabled={informes[idx]?.cargando}
                        className="mt-1 self-start text-[10px] font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-700 border border-blue-200 rounded-lg px-2 py-1 flex items-center gap-1 cursor-pointer disabled:opacity-60"
                      >
                        {informes[idx]?.cargando ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                        {informes[idx]?.texto ? "Volver a redactar informe" : "Redactar informe de este punto"}
                      </button>
                    </div>
                  </td>

                  {/* Country Values */}
                  {activeData.columnas.map((col) => {
                    const isChile = col.isChile || col.nombre.toLowerCase().includes("chile");
                    const val = fila.valores[col.key] || "—";

                    return (
                      <td 
                        key={col.key} 
                        className={`p-4 border-r align-top text-[11.5px] leading-relaxed ${
                          isWarm 
                            ? (isChile ? "bg-amber-100/80 border-amber-200 font-semibold text-slate-950" : "border-amber-200 text-slate-900") 
                            : (isChile ? "bg-blue-50/40 border-slate-200 font-medium text-slate-900" : "border-slate-200 text-slate-700")
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}

                  {/* Lectura Jurídica */}
                  <td className={`p-4 align-top text-[11.5px] leading-relaxed ${
                    isWarm 
                      ? "bg-amber-100/90 text-amber-950 font-bold border-l border-amber-300" 
                      : "bg-[#eff6ff] text-blue-950 font-medium border-l border-blue-100"
                  }`}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-800 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> Síntesis analítica:
                      </span>
                      <p className="leading-relaxed">
                        {fila.lecturaJuridica}
                      </p>
                    </div>
                  </td>
                </tr>
                {(informes[idx]?.texto || informes[idx]?.error || informes[idx]?.cargando) && (
                  <tr className="bg-white">
                    <td colSpan={activeData.columnas.length + 2} className="p-5 border-t border-blue-200">
                      <div className="max-w-4xl flex flex-col gap-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 font-mono">
                          Informe · {fila.titulo || fila.dimension}
                        </p>
                        {informes[idx]?.cargando && <p className="text-xs text-slate-500">Redactando el informe a partir de las normas de cada país…</p>}
                        {informes[idx]?.error && <p className="text-xs text-amber-700">{informes[idx]?.error}</p>}
                        {informes[idx]?.texto && (
                          <div className="text-[12.5px] leading-relaxed text-slate-800 space-y-2">
                            {String(informes[idx]!.texto).split(/\n\s*\n/).map((par, i) =>
                              par.startsWith("###")
                                ? <h4 key={i} className="font-extrabold text-slate-950 text-[13px] mt-1">{par.replace(/^###\s*/, "")}</h4>
                                : <p key={i}>{par}</p>
                            )}
                            <p className="text-[10px] text-slate-500 pt-1">
                              Redactado con IA solo a partir de las disposiciones de las normas comparadas. Fuentes:{" "}
                              {activeData.columnas.filter(c => c.url).map((c, i, arr) => (
                                <span key={c.key}>
                                  <EnlaceVerificado url={c.url} className="font-semibold">{c.nombre}</EnlaceVerificado>
                                  {i < arr.length - 1 ? " · " : ""}
                                </span>
                              ))}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* Footer Institutional Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="font-semibold text-slate-800">
            Biblioteca del Congreso Nacional de Chile — Asesoría Técnica Parlamentaria (Derecho Comparado)
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
          Metodología Multidimensional · 7 Dimensiones Normativas
        </span>
      </div>

    </div>
  );
}
