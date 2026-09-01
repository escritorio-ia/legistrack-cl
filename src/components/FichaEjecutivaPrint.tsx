import React from "react";
import { 
  Printer, 
  Download, 
  X, 
  Share2, 
  Check, 
  Building2, 
  Scale, 
  FileText, 
  Clock, 
  Calendar,
  Layers,
  Copy
} from "lucide-react";
import { Proyecto } from "../types";

interface FichaEjecutivaPrintProps {
  proyecto: Proyecto;
  isOpen: boolean;
  onClose: () => void;
}

export default function FichaEjecutivaPrint({ proyecto, isOpen, onClose }: FichaEjecutivaPrintProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !proyecto) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `CONGRESO NACIONAL DE CHILE — FICHA EJECUTIVA DE PROYECTO DE LEY
===================================================================
BOLETÍN: ${proyecto.id}
TÍTULO: ${proyecto.titulo}
ESTADO: ${proyecto.estado} (${proyecto.etapa || "En tramitación"})
CÁMARA DE ORIGEN: ${proyecto.camaraOrigen} | INICIATIVA: ${proyecto.iniciativa}
FECHA INGRESO: ${proyecto.fechaIngreso} | DÍAS EN PROCESO: ${proyecto.diasTramitacion ?? "N/A"}
URGENCIA: ${proyecto.urgencia}
QUÓRUM REQUERIDO: ${proyecto.quorum?.tipo || "Ley Simple"} — ${proyecto.quorum?.descripcion || ""}

RESUMEN TÉCNICO:
${proyecto.resumen}

OBJETO & MECANISMOS:
${proyecto.fichaTecnica?.objeto || ""}
${proyecto.fichaTecnica?.mecanismos || ""}
${proyecto.fichaTecnica?.fiscalizacion || ""}

GENERADO POR: Plataforma LegisTrack CL (https://legistrack.cl)
===================================================================`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Action Header (hidden in print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold">
              Ficha Ejecutiva Formal de Proyecto (Boletín {proyecto.id})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado" : "Copiar Texto"}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto font-serif text-slate-900 space-y-8 bg-white print:p-6 print:overflow-visible">
          
          {/* Institutional Crest & Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1">
            <div className="text-xs font-sans uppercase tracking-widest text-slate-600 font-bold">
              República de Chile • Congreso Nacional
            </div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
              MINUTA EJECUTIVA DE ANÁLISIS LEGISLATIVO
            </h1>
            <div className="text-xs font-mono text-slate-500 pt-1">
              Plataforma de Seguimiento y Transparencia Parlamentaria LegisTrack CL • Fecha de Emisión: {new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Bulletin Key Header Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 font-sans space-y-3 print:bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="text-sm font-bold text-blue-900">
                BOLETÍN N° {proyecto.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">
                Estado: {proyecto.estado}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {proyecto.titulo}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div>
                <span className="text-slate-500 block font-medium">Iniciativa:</span>
                <span className="font-bold text-slate-800">{proyecto.iniciativa}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Cámara de Origen:</span>
                <span className="font-bold text-slate-800">{proyecto.camaraOrigen}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Fecha de Ingreso:</span>
                <span className="font-bold text-slate-800">{proyecto.fechaIngreso}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Urgencia Vigente:</span>
                <span className="font-bold text-slate-800">{proyecto.urgencia}</span>
              </div>
            </div>
          </div>

          {/* Section I: Quorum & Constitutional Requirements */}
          <div className="space-y-2">
            <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              I. Régimen Constitucional y Quórum de Aprobación
            </h3>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-800 space-y-1">
              <p>
                <strong>Tipo de Quórum:</strong> {proyecto.quorum?.tipo || "Ley Simple"}.
              </p>
              <p className="text-slate-600">
                {proyecto.quorum?.descripcion || "Requiere mayoría simple de los miembros presentes en la sala."}
              </p>
              {proyecto.quorum?.votosDiputados && (
                <p className="text-2xs font-mono text-slate-500 pt-1">
                  • Exigencia Cámara de Diputadas/os: {proyecto.quorum.votosDiputados} | Exigencia Senado: {proyecto.quorum.votosSenadores}
                </p>
              )}
            </div>
          </div>

          {/* Section II: Technical Scope & Mechanisms */}
          <div className="space-y-3">
            <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              II. Objeto Sustantivo y Mecanismos de Aplicación
            </h3>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-800 space-y-2">
              <p>{proyecto.fichaTecnica?.objeto || proyecto.resumen}</p>
              {proyecto.fichaTecnica?.mecanismos && (
                <p>{proyecto.fichaTecnica.mecanismos}</p>
              )}
              {proyecto.fichaTecnica?.fiscalizacion && (
                <p>{proyecto.fichaTecnica.fiscalizacion}</p>
              )}
            </div>
          </div>

          {/* Section III: Sponsors & Ministerial Backing */}
          <div className="space-y-2">
            <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              III. Patrocinio y Autoría Institucional
            </h3>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-800 space-y-1">
              <p>
                <strong>Patrocinante Principal:</strong> {proyecto.origenDetalle?.patrocinadorPrincipal || proyecto.autores || "No informado"}
              </p>
              {proyecto.origenDetalle?.ministeriosFirmantes && proyecto.origenDetalle.ministeriosFirmantes.length > 0 && (
                <p>
                  <strong>Ministerios Firmantes:</strong> {proyecto.origenDetalle.ministeriosFirmantes.join(", ")}.
                </p>
              )}
            </div>
          </div>

          {/* Section IV: Key Milestones */}
          {proyecto.timeline && proyecto.timeline.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                IV. Principales Hitos de Tramitación
              </h3>
              <ul className="text-xs space-y-1.5 list-disc pl-5 text-slate-700">
                {proyecto.timeline.slice(0, 5).map((t, idx) => (
                  <li key={idx}>
                    <strong>{t.fecha}:</strong> {t.titulo} — <em>{t.descripcion}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formal Footer */}
          <div className="border-t border-slate-300 pt-6 text-center text-2xs text-slate-400 font-sans">
            Documento de trabajo técnico generado automáticamente a partir de registros oficiales del Sistema de Información de Tramitación Legislativa (SIL) y Valparaíso OpenData.
          </div>

        </div>

      </div>
    </div>
  );
}
