import React, { useState } from "react";
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  X, 
  Download, 
  Building2, 
  Scale, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  ExternalLink,
  Sparkles,
  Share2
} from "lucide-react";
import { Proyecto } from "../types";

interface MinutaEjecutivaModalProps {
  proyecto: Proyecto;
  isOpen: boolean;
  onClose: () => void;
}

export default function MinutaEjecutivaModal({ proyecto, isOpen, onClose }: MinutaEjecutivaModalProps) {
  const [copied, setCopied] = useState(false);
  const [incluirIndicaciones, setIncluirIndicaciones] = useState(true);
  const [incluirHitos, setIncluirHitos] = useState(true);
  const [incluirQuorum, setIncluirQuorum] = useState(true);

  if (!isOpen || !proyecto) return null;

  const fechaHoy = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `================================================================================
REPÚBLICA DE CHILE • CONGRESO NACIONAL
MINUTA EJECUTIVA Y TÉCNICA DE PROYECTO DE LEY
================================================================================
Fecha de Emisión: ${fechaHoy}
Plataforma: LegisTrack CL (https://legistrack.cl)

I. IDENTIFICACIÓN DEL PROYECTO
--------------------------------------------------------------------------------
• Boletín N°: ${proyecto.id}
• Título: ${proyecto.titulo}
• Estado: ${proyecto.estado} (${proyecto.etapa || "En tramitación"})
• Cámara de Origen: ${proyecto.camaraOrigen}
• Tipo de Iniciativa: ${proyecto.iniciativa}
• Fecha de Ingreso: ${proyecto.fechaIngreso} | Días en Tramitación: ${proyecto.diasTramitacion ?? "N/A"}
• Urgencia Vigente: ${proyecto.urgencia || "Sin urgencia"}
• Patrocinante / Autores: ${proyecto.origenDetalle?.patrocinadorPrincipal || proyecto.autores || "No informado"}

II. RÉGIMEN CONSTITUCIONAL Y QUÓRUM REQUERIDO
--------------------------------------------------------------------------------
• Tipo de Quórum: ${proyecto.quorum?.tipo || "Ley Simple"}
• Fundamento: ${proyecto.quorum?.descripcion || "Mayoría simple de los presentes en la Sala."}
${proyecto.quorum?.votosDiputados ? `• Exigencia Cámara: ${proyecto.quorum.votosDiputados} | Senado: ${proyecto.quorum.votosSenadores}` : ""}

III. SÍNTESIS TÉCNICA Y OBJETO SUSTANTIVO
--------------------------------------------------------------------------------
${proyecto.resumen || "No se registran antecedentes de resumen."}

${proyecto.fichaTecnica?.objeto ? `• Objeto: ${proyecto.fichaTecnica.objeto}\n` : ""}${proyecto.fichaTecnica?.mecanismos ? `• Mecanismos: ${proyecto.fichaTecnica.mecanismos}\n` : ""}${proyecto.fichaTecnica?.fiscalizacion ? `• Fiscalización: ${proyecto.fichaTecnica.fiscalizacion}\n` : ""}

IV. HITOS CLAVE DE TRAMITACIÓN
--------------------------------------------------------------------------------
${(proyecto.timeline || []).slice(0, 5).map(t => `• [${t.fecha}] ${t.titulo}: ${t.descripcion}`).join("\n")}

================================================================================
Documento formal de trabajo legislativo.
================================================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Action Topbar (Hidden in print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap justify-between items-center gap-3 shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Minuta Ejecutiva Formal de Proyecto</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Boletín {proyecto.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Formato institucional listo para descargar, imprimir o enviar a asesores y parlamentarios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-slate-700"
              title="Copiar texto estructurado al portapapeles"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-900/30 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white print:p-6 print:overflow-visible space-y-6 text-slate-900 font-serif">
          
          {/* Official Letterhead Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs font-sans uppercase tracking-widest text-slate-600 font-extrabold">
              <span>🏛️ República de Chile</span>
              <span>•</span>
              <span>Congreso Nacional</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-950 tracking-tight">
              MINUTA EJECUTIVA DE TRAMITACIÓN LEGISLATIVA
            </h1>
            <div className="text-xs font-sans text-slate-500 pt-1 flex items-center justify-center gap-3">
              <span><strong>Emisión:</strong> {fechaHoy}</span>
              <span>•</span>
              <span><strong>Sistema:</strong> LegisTrack CL</span>
              <span>•</span>
              <span className="font-mono text-blue-700 font-bold">BOLETÍN N° {proyecto.id}</span>
            </div>
          </div>

          {/* Bulletin Highlight Card */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 font-sans space-y-3 print:bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <span className="text-base font-extrabold text-blue-950">
                PROYECTO DE LEY BOLETÍN N° {proyecto.id}
              </span>
              <span className="text-xs px-3 py-1 bg-blue-100 text-blue-900 rounded-full font-bold">
                {proyecto.estado} ({proyecto.etapa || "1er Trámite"})
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {proyecto.titulo}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Iniciativa</span>
                <span className="font-bold text-slate-800">{proyecto.iniciativa}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cámara de Origen</span>
                <span className="font-bold text-slate-800">{proyecto.camaraOrigen}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Fecha de Ingreso</span>
                <span className="font-bold text-slate-800">{proyecto.fechaIngreso}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Urgencia Vigente</span>
                <span className="font-bold text-slate-800 text-rose-700">{proyecto.urgencia || "Sin urgencia"}</span>
              </div>
            </div>
          </div>

          {/* Section I: Quorum & Constitutional Rules */}
          {incluirQuorum && (
            <div className="space-y-2">
              <h3 className="text-xs font-sans font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-700" />
                <span>I. Régimen Constitucional y Quórum de Aprobación</span>
              </h3>
              <div className="text-xs sm:text-sm leading-relaxed text-slate-800 font-sans space-y-1">
                <p>
                  <strong>Tipo de Quórum:</strong> <span className="text-blue-900 font-bold">{proyecto.quorum?.tipo || "Ley Simple"}</span>.
                </p>
                <p className="text-slate-600 text-xs">
                  {proyecto.quorum?.descripcion || "Requiere la mayoría de los votos de las y los parlamentarios presentes en la Sala."}
                </p>
                {proyecto.quorum?.votosDiputados && (
                  <p className="text-[11px] font-mono text-slate-500 pt-0.5">
                    • Cámara de Diputadas y Diputados: <strong>{proyecto.quorum.votosDiputados}</strong> | Senado: <strong>{proyecto.quorum.votosSenadores}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Section II: Technical Scope & Mechanisms */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-sans font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>II. Objeto Sustantivo y Síntesis del Proyecto</span>
            </h3>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-800 font-sans space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
              <p className="font-medium text-slate-900">
                {proyecto.resumen || "Este proyecto busca perfeccionar la normativa vigente mediante modificaciones directas a los cuerpos legales respectivos."}
              </p>
              {proyecto.fichaTecnica?.objeto && (
                <p className="text-xs text-slate-700">
                  <strong>Objetivo específico:</strong> {proyecto.fichaTecnica.objeto}
                </p>
              )}
              {proyecto.fichaTecnica?.mecanismos && (
                <p className="text-xs text-slate-700">
                  <strong>Mecanismos regulatorios:</strong> {proyecto.fichaTecnica.mecanismos}
                </p>
              )}
              {proyecto.fichaTecnica?.fiscalizacion && (
                <p className="text-xs text-slate-700">
                  <strong>Fiscalización y sanciones:</strong> {proyecto.fichaTecnica.fiscalizacion}
                </p>
              )}
            </div>
          </div>

          {/* Section III: Authors & Sponsorship */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-sans font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              <span>III. Patrocinio y Autoría</span>
            </h3>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-800 font-sans space-y-1">
              <p>
                <strong>Patrocinador / Autores:</strong> {proyecto.origenDetalle?.patrocinadorPrincipal || proyecto.autores || "Parlamentarios del Congreso Nacional"}.
              </p>
              {proyecto.origenDetalle?.ministeriosFirmantes && proyecto.origenDetalle.ministeriosFirmantes.length > 0 && (
                <p className="text-xs text-slate-600">
                  <strong>Ministerios Involucrados:</strong> {proyecto.origenDetalle.ministeriosFirmantes.join(", ")}.
                </p>
              )}
            </div>
          </div>

          {/* Section IV: Timeline & Recent Events */}
          {incluirHitos && proyecto.timeline && proyecto.timeline.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-sans font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-700" />
                <span>IV. Hitos de Tramitación Recientes</span>
              </h3>
              <ul className="text-xs space-y-2 list-none font-sans text-slate-700">
                {proyecto.timeline.slice(0, 4).map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                    <span className="font-mono font-bold text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
                      {t.fecha}
                    </span>
                    <div>
                      <strong className="text-slate-900 block font-semibold">{t.titulo}</strong>
                      <span className="text-slate-600 text-[11px]">{t.descripcion}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Institutional Stamp Footer */}
          <div className="border-t-2 border-slate-200 pt-6 text-center text-[10px] text-slate-500 font-sans space-y-1">
            <p className="font-bold text-slate-700">
              MINUTA TÉCNICA GENERADA MEDIANTE LA PLATAFORMA LEGIS TRACK CL
            </p>
            <p>
              Datos obtenidos y sincronizados en tiempo real con el Sistema de Información de Tramitación Legislativa (SIL) y OpenData del Congreso Nacional.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
