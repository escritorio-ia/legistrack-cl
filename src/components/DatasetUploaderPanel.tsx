/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BUSCADOR_DATASETS_UE_VISIBLE } from "../config/features";
import { useEffect, useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, Loader2, AlertTriangle, ChevronDown, Trash2, Download, Sparkles, Globe2, Search } from "lucide-react";
import { parseDatasetFile, calcularStatsColumnas, combinarDatasetsParaAnalisis } from "../utils/datasetAnalysis";
import {
  DatasetEstadistico,
  ColumnaDatasetStats,
  subirArchivoDatasetAStorage,
  saveDatasetEstadisticoToFirestore,
  getDatasetsEstadisticosFromFirestore,
  deleteDatasetEstadisticoFromFirestore
} from "../services/firebaseService";

const AUTOR_ACTUAL = "Ana Morales";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ColumnaStatsRow({ col }: { col: ColumnaDatasetStats }) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="py-2 pr-3 font-bold text-slate-800 whitespace-nowrap">{col.nombre}</td>
      <td className="py-2 pr-3">
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
          col.tipo === "numerico" ? "bg-blue-50 text-blue-700" : col.tipo === "fecha" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"
        }`}>
          {col.tipo}
        </span>
      </td>
      <td className="py-2 pr-3 text-slate-600">
        {col.tipo === "numerico" && (
          <span>min {col.min} · máx {col.max} · promedio {col.promedio} · mediana {col.mediana} · desv. est. {col.desviacionEstandar}</span>
        )}
        {col.tipo === "fecha" && <span>entre {col.fechaMin} y {col.fechaMax}</span>}
        {col.tipo === "categorico" && (
          <span>
            {col.valoresUnicos} valores únicos
            {col.topValores && col.topValores.length > 0 && (
              <> · más frecuentes: {col.topValores.map(t => `${t.valor} (${t.conteo})`).join(", ")}</>
            )}
          </span>
        )}
      </td>
      <td className="py-2 text-slate-400 text-right whitespace-nowrap">{col.nulos} nulos</td>
    </tr>
  );
}

function DatasetCard({ dataset, onDelete }: { dataset: DatasetEstadistico; onDelete: (d: DatasetEstadistico) => void }) {
  const [abierto, setAbierto] = useState(false);
  const tamanoTotal = dataset.archivos.reduce((acc, a) => acc + a.fileSize, 0);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <h4 className="text-sm font-extrabold text-slate-900 truncate">{dataset.nombre}</h4>
            {dataset.archivos.length > 1 && (
              <span className="text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full">
                {dataset.archivos.length} archivos combinados
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Subido por <strong>{dataset.autor}</strong> · {new Date(dataset.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })} · {dataset.totalFilas.toLocaleString("es-CL")} filas · {dataset.columnas.length} columnas · {formatFileSize(tamanoTotal)}
          </p>
        </div>
        <button
          onClick={() => setAbierto(v => !v)}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
        </button>
      </div>

      {abierto && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
          {dataset.informeIA && (
            <div className="bg-white border border-indigo-200 rounded-xl p-3.5">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Informe generado con IA
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{dataset.informeIA}</p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-3.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Archivo{dataset.archivos.length > 1 ? "s" : ""} original{dataset.archivos.length > 1 ? "es" : ""}
            </span>
            <div className="flex flex-col gap-1.5">
              {dataset.archivos.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600 truncate">{a.fileName} <span className="text-slate-400">({formatFileSize(a.fileSize)})</span></span>
                  <a
                    href={a.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-1.5 pr-3 font-bold">Columna</th>
                  <th className="py-1.5 pr-3 font-bold">Tipo</th>
                  <th className="py-1.5 pr-3 font-bold">Estadísticas</th>
                  <th className="py-1.5 text-right font-bold">Nulos</th>
                </tr>
              </thead>
              <tbody>
                {dataset.columnas.map((c, i) => <ColumnaStatsRow key={i} col={c} />)}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onDelete(dataset)}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar dataset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface EuroDatasetDistribucion {
  id: string;
  titulo: string;
  formato: string;
  url: string;
  tamanoBytes?: number;
}
interface EuroDatasetResultado {
  id: string;
  titulo: string;
  descripcion: string;
  pais: string;
  paisLabel: string;
  publicador?: string;
  landingPage?: string;
  distribuciones: EuroDatasetDistribucion[];
}

// Solo los países que ya tienen bandera/etiqueta útil en la UI -- el campo
// país es opcional, así que igual se puede buscar sin filtrar.
const PAISES_EU_FILTRO: Array<{ code: string; label: string }> = [
  { code: "de", label: "🇩🇪 Alemania" },
  { code: "es", label: "🇪🇸 España" },
  { code: "fr", label: "🇫🇷 Francia" },
  { code: "it", label: "🇮🇹 Italia" },
  { code: "pt", label: "🇵🇹 Portugal" },
  { code: "nl", label: "🇳🇱 Países Bajos" },
  { code: "ie", label: "🇮🇪 Irlanda" },
  { code: "se", label: "🇸🇪 Suecia" },
  { code: "fi", label: "🇫🇮 Finlandia" },
  { code: "no", label: "🇳🇴 Noruega" },
  { code: "dk", label: "🇩🇰 Dinamarca" },
  { code: "gb", label: "🇬🇧 Reino Unido" },
  { code: "pl", label: "🇵🇱 Polonia" },
  { code: "gr", label: "🇬🇷 Grecia" },
  { code: "at", label: "🇦🇹 Austria" },
  { code: "be", label: "🇧🇪 Bélgica" }
];

function nombreDataset(files: File[]): string {
  if (files.length === 1) return files[0].name;
  const listado = files.map(f => f.name).join(", ");
  const listadoCorto = listado.length > 80 ? `${listado.slice(0, 77)}...` : listado;
  return `Dataset combinado (${files.length} archivos): ${listadoCorto}`;
}

export default function DatasetUploaderPanel() {
  const [datasets, setDatasets] = useState<DatasetEstadistico[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoTexto, setProgresoTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Búsqueda de datasets reales en data.europa.eu (portal oficial de datos
  // abiertos de la UE) -- al importar una distribución, reutiliza el mismo
  // pipeline de análisis que un archivo subido manualmente.
  const [euAbierto, setEuAbierto] = useState(false);
  const [euQuery, setEuQuery] = useState("");
  const [euPais, setEuPais] = useState("");
  const [euBuscando, setEuBuscando] = useState(false);
  const [euResultados, setEuResultados] = useState<EuroDatasetResultado[]>([]);
  const [euError, setEuError] = useState<string | null>(null);
  const [euImportandoId, setEuImportandoId] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    getDatasetsEstadisticosFromFirestore(50)
      .then((d) => { if (!cancelado) setDatasets(d); })
      .finally(() => { if (!cancelado) setCargandoLista(false); });
    return () => { cancelado = true; };
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    setError(null);
    setSubiendo(true);
    try {
      setProgresoTexto(files.length > 1 ? `Leyendo ${files.length} archivos...` : "Leyendo archivo...");
      const parseados = await Promise.all(
        files.map(async (file) => ({ nombre: file.name, datos: await parseDatasetFile(file) }))
      );

      setProgresoTexto(files.length > 1 ? "Combinando archivos en un solo dataset..." : "Calculando estadísticas...");
      const combinado = combinarDatasetsParaAnalisis(parseados);
      const columnas = calcularStatsColumnas(combinado.headers, combinado.rows);

      const id = `ds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      setProgresoTexto(files.length > 1 ? "Subiendo archivos..." : "Subiendo archivo...");
      const archivos = [];
      for (const file of files) {
        const subida = await subirArchivoDatasetAStorage(id, file);
        if (!subida) throw new Error(`No fue posible subir "${file.name}" al almacenamiento. Intenta nuevamente.`);
        archivos.push({ fileName: file.name, fileSize: file.size, storagePath: subida.storagePath, downloadUrl: subida.downloadUrl });
      }

      const nombre = nombreDataset(files);

      setProgresoTexto("Redactando informe con IA...");
      let informeIA: string | undefined;
      try {
        const res = await fetch("/api/statistics/analizar-dataset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, totalFilas: combinado.rows.length, columnas })
        });
        if (res.ok) {
          const data = await res.json();
          informeIA = data.informe;
        }
      } catch {
        // El informe con IA es un plus -- si falla, el dataset y sus
        // estadísticas reales igual quedan guardados y disponibles.
      }

      const dataset: DatasetEstadistico = {
        id,
        nombre,
        autor: AUTOR_ACTUAL,
        createdAt: new Date().toISOString(),
        archivos,
        totalFilas: combinado.rows.length,
        columnas,
        informeIA
      };

      setProgresoTexto("Guardando...");
      await saveDatasetEstadisticoToFirestore(dataset);
      setDatasets((prev) => [dataset, ...prev]);
    } catch (err: any) {
      setError(err?.message || "No fue posible procesar los archivos.");
    } finally {
      setSubiendo(false);
      setProgresoTexto("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (dataset: DatasetEstadistico) => {
    if (!confirm(`¿Eliminar el dataset "${dataset.nombre}"? Esta acción no se puede deshacer.`)) return;
    setDatasets((prev) => prev.filter((d) => d.id !== dataset.id));
    await deleteDatasetEstadisticoFromFirestore(dataset);
  };

  const handleBuscarEuropa = async () => {
    const term = euQuery.trim();
    if (!term) return;
    setEuBuscando(true);
    setEuError(null);
    setEuResultados([]);
    try {
      const params = new URLSearchParams({ q: term });
      if (euPais) params.set("pais", euPais);
      const res = await fetch(`/api/opendata/buscar?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setEuResultados(data.resultados || []);
      if ((data.resultados || []).length === 0) {
        setEuError("No se encontraron datasets con distribuciones descargables (CSV/Excel/JSON) para esa búsqueda.");
      }
    } catch (err: any) {
      setEuError(err?.message || "No fue posible consultar data.europa.eu.");
    } finally {
      setEuBuscando(false);
    }
  };

  const handleImportarDistribucion = async (dataset: EuroDatasetResultado, dist: EuroDatasetDistribucion) => {
    setEuImportandoId(dist.id);
    setEuError(null);
    try {
      const ext = (dist.formato || "").toLowerCase().includes("csv") ? "csv" : (dist.formato || "").toLowerCase().includes("json") ? "json" : "xlsx";
      const nombreArchivo = `${dataset.titulo.replace(/[^\w.\- ]/g, "").slice(0, 60) || "dataset"}.${ext}`;
      const res = await fetch(`/api/opendata/descargar?url=${encodeURIComponent(dist.url)}&nombre=${encodeURIComponent(nombreArchivo)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const file = new File([blob], nombreArchivo, { type: blob.type });
      await handleFilesSelected([file]);
      setEuAbierto(false);
    } catch (err: any) {
      setEuError(err?.message || "No fue posible importar esta distribución.");
    } finally {
      setEuImportandoId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4" id="dataset-uploader-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            <span>Subir Dataset Propio (CSV / Excel)</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Sube uno o varios archivos (CSV o .xlsx). Si eliges varios a la vez, se combinan en un solo dataset y el análisis (estadísticas e informe de IA) se hace sobre el conjunto -- compartido con todo el equipo.
          </p>
        </div>
      </div>

      <label
        htmlFor="dataset-file-input"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!subiendo) setArrastrando(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setArrastrando(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setArrastrando(false);
          if (subiendo) return;
          const dropped = Array.from(e.dataTransfer.files || []);
          const validos = dropped.filter((f) => /\.(csv|xlsx|xls)$/i.test(f.name));
          if (validos.length === 0) {
            setError(dropped.length > 0 ? "Ninguno de los archivos arrastrados es .csv, .xlsx o .xls." : null);
            return;
          }
          handleFilesSelected(validos);
        }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-8 px-4 text-center transition-colors ${
          subiendo
            ? "border-slate-200 bg-slate-50 cursor-not-allowed"
            : arrastrando
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer"
        }`}
      >
        {subiendo ? (
          <>
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="text-xs font-bold text-slate-600">{progresoTexto || "Procesando..."}</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-6 h-6 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Haz clic para elegir uno o varios archivos, o arrástralos aquí</span>
            <span className="text-[10px] text-slate-400">Formatos soportados: .csv, .xlsx, .xls · selección múltiple = un solo dataset combinado</span>
          </>
        )}
        <input
          ref={fileInputRef}
          id="dataset-file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          multiple
          disabled={subiendo}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) handleFilesSelected(files);
          }}
        />
      </label>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {BUSCADOR_DATASETS_UE_VISIBLE && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setEuAbierto((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
              <Globe2 className="w-4 h-4 text-blue-600" />
              Buscar dataset real en data.europa.eu (portal oficial de la UE)
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${euAbierto ? "rotate-180" : ""}`} />
          </button>
  
          {euAbierto && (
            <div className="p-4 space-y-3 border-t border-slate-200">
              <p className="text-[11px] text-slate-500">
                Busca en el catálogo oficial de datos abiertos de la Unión Europea (data.europa.eu) y trae directamente el archivo real al análisis -- sin descargar y volver a subir manualmente.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={euQuery}
                  onChange={(e) => setEuQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleBuscarEuropa(); }}
                  placeholder="Ej. desempleo, presupuesto municipal, emisiones CO2..."
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <select
                  value={euPais}
                  onChange={(e) => setEuPais(e.target.value)}
                  className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                >
                  <option value="">Todos los países</option>
                  {PAISES_EU_FILTRO.map((p) => (
                    <option key={p.code} value={p.code}>{p.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleBuscarEuropa}
                  disabled={euBuscando || !euQuery.trim()}
                  className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 justify-center shrink-0"
                >
                  {euBuscando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Buscar
                </button>
              </div>
  
              {euError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2.5 text-[11px]">
                  {euError}
                </div>
              )}
  
              {euResultados.length > 0 && (
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {euResultados.map((r) => (
                    <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="text-xs font-extrabold text-slate-800 truncate">{r.titulo}</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {r.paisLabel || "Sin país"} {r.publicador ? `· ${r.publicador}` : ""}
                          </p>
                          {r.descripcion && <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{r.descripcion}</p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.distribuciones.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleImportarDistribucion(r, d)}
                            disabled={euImportandoId !== null || subiendo}
                            className="text-[10px] font-bold bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 disabled:opacity-50 text-slate-600 px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5"
                          >
                            {euImportandoId === d.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            {d.formato}{d.tamanoBytes ? ` · ${formatFileSize(d.tamanoBytes)}` : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {cargandoLista ? (
          <div className="text-center py-6 text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando datasets guardados...
          </div>
        ) : datasets.length === 0 ? null : (
          datasets.map((d) => <DatasetCard key={d.id} dataset={d} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  );
}
