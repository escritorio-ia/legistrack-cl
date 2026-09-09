import React, { useState, useMemo } from "react";
import { 
  X, 
  Columns, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  Search,
  Filter,
  Check,
  ChevronRight,
  ArrowLeftRight,
  Sparkles,
  Printer,
  Copy,
  Download,
  Building2,
  Tag
} from "lucide-react";
import { TextDiffArticle, Proyecto } from "../types";

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto?: Proyecto | null;
}

// Comprehensive dataset of indications and comparative articles for key and dynamic projects
export const BASE_DIFF_ARTICLES: Record<string, TextDiffArticle[]> = {
  "16.621-13": [
    {
      id: "art-1",
      articulo: "Artículo 152 — Derecho a Teletrabajo de Cuidadores",
      textoOriginal: "En los contratos de servicios especiales, el empleador y el trabajador podrán convenir de mutuo acuerdo y bajo condiciones voluntarias la realización de jornadas a distancia.",
      textoComision: "Establécese el derecho preferente a la modalidad de teletrabajo para todo trabajador o trabajadora que tenga bajo su cuidado directo a niños menores de doce años o a personas en situación de dependencia severa acreditada, sin menoscabo de sus remuneraciones ordinarias ni beneficios legales preexistentes.",
      indicaciones: [
        {
          autor: "Ejecutivo (Ministerio del Trabajo)",
          tipo: "sustitucion",
          texto: "Conságrese la obligatoriedad imperativa para el empleador de ofrecer alternativas de teletrabajo cuando la naturaleza de las funciones lo permita.",
          estado: "Aprobada"
        },
        {
          autor: "Diputada Gael Yeomans (FA)",
          tipo: "adicion",
          texto: "Extiéndase la cobertura protectora a cuidadores de adultos mayores con movilidad reducida severa certificada por COMPIN.",
          estado: "Aprobada"
        }
      ]
    },
    {
      id: "art-2",
      articulo: "Artículo 152 bis — Mecanismo de Reversibilidad Laboral",
      textoOriginal: "El pacto de trabajo a distancia podrá ser modificado en cualquier momento por acuerdo unánime de las partes contratantes.",
      textoComision: "El trabajador o trabajadora podrá ejercer de forma unilateral el derecho a la reversibilidad del régimen presencial, debiendo notificar por escrito al empleador con una anticipación mínima de treinta días corridos, garantizando el retorno a su puesto físico original.",
      indicaciones: [
        {
          autor: "Diputado Eduardo Durán (RN)",
          tipo: "sustitucion",
          texto: "Fíjese el plazo de preaviso de reversibilidad en 30 días para no desorganizar los turnos productivos de la empresa.",
          estado: "Aprobada"
        }
      ]
    },
    {
      id: "art-3",
      articulo: "Artículo Transitorio — Vigencia y Fiscalización DT",
      textoOriginal: "La presente ley comenzará a regir a contar del primer día del mes subsiguiente a su publicación en el Diario Oficial.",
      textoComision: "La presente ley entrará en vigencia a los sesenta días de su publicación. La Dirección del Trabajo impartirá una circular interpretativa dentro de los primeros treinta días y mantendrá un canal telemático prioritario para denuncias por negativa injustificada de empleadores.",
      indicaciones: [
        {
          autor: "Comisión de Trabajo y Seguridad Social",
          tipo: "adicion",
          texto: "Dispóngase la obligación de la DT de evacuar un informe semestral de fiscalización ante las comisiones de Trabajo de ambas cámaras.",
          estado: "Aprobada"
        }
      ]
    }
  ],
  "17.006-01": [
    {
      id: "art-1",
      articulo: "Artículo 1° — Regulación de Subdivisiones y Loteos Rurales",
      textoOriginal: "Las subdivisiones prediales rurales se regirán exclusivamente por las disposiciones del Decreto Ley N° 3.516 de 1980.",
      textoComision: "Modifícase el Decreto Ley N° 3.516 y la Ley General de Urbanismo y Construcciones, exigiendo que todo proyecto de subdivisión o loteo en suelo rural que contemple fines residenciales cuente con informe de factibilidad sanitaria, acceso vial garantizado y no afecte zonas de alto valor silvoagropecuario o de recarga de acuíferos.",
      indicaciones: [
        {
          autor: "Ejecutivo (Ministerio de Agricultura / MINVU)",
          tipo: "sustitucion",
          texto: "Incorpórense exigencias estrictas de dotación de agua potable y manejo de aguas servidas antes de autorizar inscripciones en el Conservador de Bienes Raíces.",
          estado: "Aprobada"
        },
        {
          autor: "Diputado René Alinco (IND)",
          tipo: "adicion",
          texto: "Exceptúense de las nuevas cargas de urbanización a las subdivisiones hereditarias familiares de pequeños agricultores e INDAP.",
          estado: "Aprobada"
        }
      ]
    },
    {
      id: "art-2",
      articulo: "Artículo 2° — Fiscalización SAG y Sanciones por Loteos Brujos",
      textoOriginal: "El Servicio Agrícola y Ganadero sólo certificará el cumplimiento del plano de subdivisión en su aspecto dimensional mínimo de 5.000 m².",
      textoComision: "El Servicio Agrícola y Ganadero (SAG) y las Direcciones de Obras Municipales (DOM) ejercerán facultades fiscalizadoras concurrentes, pudiendo decretar la paralización inmediata de obras y aplicar multas de hasta 1.000 UTM a los loteadores que simulen divisiones agrícolas con fines de urbanización encubierta.",
      indicaciones: [
        {
          autor: "Diputada Natalia Romero (IND)",
          tipo: "adicion",
          texto: "Facúltese al CDE y a las municipalidades para interponer querellas penales por el delito de estafa inmobiliaria contra loteadores clandestinos.",
          estado: "Aprobada"
        }
      ]
    }
  ],
  "default": [
    {
      id: "art-1",
      articulo: "Artículo 1° — Objeto y Ámbito de Aplicación",
      textoOriginal: "La presente ley tiene por objeto fijar normas de carácter general para regular la materia señalada en el mensaje o moción de origen.",
      textoComision: "La presente ley tiene por objeto establecer el marco regulatorio integral, garantías sustantivas de transparencia, estándares de cumplimiento y fiscalización sectorial sobre la materia en discusión parlamentaria.",
      indicaciones: [
        {
          autor: "Comisión Técnica Legislativa",
          tipo: "sustitucion",
          texto: "Perfecciónanse las definiciones sustantivas del articulado para asegurar consistencia con los tratados internacionales y la legislación vigente.",
          estado: "Aprobada"
        }
      ]
    },
    {
      id: "art-2",
      articulo: "Artículo 2° — Atribuciones y Mecanismos de Aplicación",
      textoOriginal: "Los órganos públicos competentes implementarán las disposiciones de conformidad a sus presupuestos institucionales ordinarios.",
      textoComision: "Los ministerios y servicios públicos competentes dictarán los reglamentos de ejecución respectivos en el plazo de 90 días, incorporando canales de rendición de cuentas pública e informes semestrales de avance.",
      indicaciones: [
        {
          autor: "Ejecutivo / Asesoría Técnica BCN",
          tipo: "adicion",
          texto: "Fíjase plazo perentorio para la dictación de normas reglamentarias y evaluación ex-post de impacto regulatorio.",
          estado: "Aprobada"
        }
      ]
    }
  ]
};

export default function DiffViewerModal({ isOpen, onClose, proyecto }: DiffViewerModalProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string>("art-1");
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side");
  const [filterIndicaciones, setFilterIndicaciones] = useState<"todas" | "aprobadas" | "rechazadas">("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const boletinKey = proyecto?.id && BASE_DIFF_ARTICLES[proyecto.id] ? proyecto.id : (proyecto?.id?.includes("17.006") ? "17.006-01" : (proyecto?.id?.includes("16.621") ? "16.621-13" : "default"));
  const articlesList: TextDiffArticle[] = BASE_DIFF_ARTICLES[boletinKey] || BASE_DIFF_ARTICLES["default"];

  const filteredArticles = useMemo(() => {
    return articlesList.filter(a => 
      a.articulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.textoComision.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.textoOriginal.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [articlesList, searchTerm]);

  const currentArticle = filteredArticles.find(a => a.id === selectedArticleId) || filteredArticles[0] || articlesList[0];

  const filteredIndicaciones = useMemo(() => {
    if (!currentArticle?.indicaciones) return [];
    if (filterIndicaciones === "todas") return currentArticle.indicaciones;
    return currentArticle.indicaciones.filter(ind => 
      ind.estado.toLowerCase().includes(filterIndicaciones)
    );
  }, [currentArticle, filterIndicaciones]);

  // Compute stats of additions, modifications, and words
  const diffStats = useMemo(() => {
    if (!currentArticle) return { originalWords: 0, comisionWords: 0, deltaWords: 0 };
    const orig = currentArticle.textoOriginal.split(/\s+/).filter(Boolean).length;
    const com = currentArticle.textoComision.split(/\s+/).filter(Boolean).length;
    return {
      originalWords: orig,
      comisionWords: com,
      deltaWords: com - orig
    };
  }, [currentArticle]);

  const handleCopyDiff = () => {
    if (!currentArticle) return;
    const text = `==================================================================
COMPARADOR DIFF: ${currentArticle.articulo}
PROYECTO BOLETÍN: ${proyecto?.id || "N/A"}
==================================================================
[TEXTO BASE / ORIGINAL]
${currentArticle.textoOriginal}

[TEXTO MODIFICADO / COMISIÓN]
${currentArticle.textoComision}

[INDICACIONES FORMULADAS]
${currentArticle.indicaciones.map(ind => `• (${ind.estado}) [${ind.tipo.toUpperCase()}] ${ind.autor}: "${ind.texto}"`).join("\n")}
==================================================================`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap justify-between items-center gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-xl">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Comparador Visual de Textos e Indicaciones (Diff Articulado)
                </h3>
                {proyecto?.id && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Boletín {proyecto.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {proyecto?.titulo ? proyecto.titulo : "Contraste comparado: Texto Original (Mensaje/Moción) vs Texto Aprobado en Comisión"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 p-1 rounded-xl text-xs border border-slate-700">
              <button
                onClick={() => setViewMode("side-by-side")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === "side-by-side" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Lado a Lado
              </button>
              <button
                onClick={() => setViewMode("unified")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === "unified" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Vista Unificada
              </button>
            </div>

            <button
              onClick={handleCopyDiff}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700 flex items-center gap-1.5"
              title="Copiar texto del diff al portapapeles"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar + Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Articles Sidebar */}
          <div className="w-full md:w-80 bg-slate-50/90 border-r border-slate-200 flex flex-col p-4 shrink-0 overflow-y-auto">
            <div className="mb-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar artículo o norma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                ARTICULADO ({filteredArticles.length})
              </span>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200">
                1er Trámite
              </span>
            </div>

            <div className="space-y-1.5 flex-1">
              {filteredArticles.map((art) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`w-full text-left p-3 rounded-2xl text-xs transition-all cursor-pointer ${
                    selectedArticleId === art.id
                      ? "bg-blue-600 text-white shadow-md scale-[1.01]"
                      : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <div className="font-black line-clamp-1">{art.articulo}</div>
                  <div className={`text-[11px] mt-1 flex items-center justify-between ${selectedArticleId === art.id ? "text-blue-100" : "text-slate-500"}`}>
                    <span>{art.indicaciones.length} indicación(es)</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${selectedArticleId === art.id ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {art.indicaciones.some(i => i.tipo === 'sustitucion') ? 'SUSTITUTIVA' : 'ADICIÓN'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Diff Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-white space-y-6">
            
            {/* Active Article Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-base font-black text-slate-900 tracking-tight">
                  {currentArticle.articulo}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>Palabras Originales: <strong>{diffStats.originalWords}</strong></span>
                  <span>•</span>
                  <span>Palabras en Comisión: <strong>{diffStats.comisionWords}</strong></span>
                  <span>•</span>
                  <span className={`font-bold ${diffStats.deltaWords >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    Variación: {diffStats.deltaWords >= 0 ? `+${diffStats.deltaWords}` : diffStats.deltaWords} palabras
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Texto Aprobado
                </span>
              </div>
            </div>

            {/* Diff Comparison Mode Render */}
            {viewMode === "side-by-side" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Original Text */}
                <div className="border-2 border-rose-100 rounded-2xl p-4.5 bg-rose-50/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-100">
                      <span className="text-xs font-black text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>Texto Original (Mensaje / Moción)</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        BASE
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans bg-white p-4 rounded-xl border border-rose-200/60 shadow-2xs">
                      {currentArticle.textoOriginal}
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-rose-800/80 font-medium">
                    Redacción sometida a discusión al inicio del trámite legislativo.
                  </div>
                </div>

                {/* Right: Commission Modified Text */}
                <div className="border-2 border-emerald-200 rounded-2xl p-4.5 bg-emerald-50/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200">
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Texto Aprobado en Comisión (Informe)</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        ENMIENDA
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-950 font-semibold leading-relaxed font-sans bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
                      {currentArticle.textoComision}
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-emerald-800 font-medium">
                    Texto perfeccionado con indicaciones aprobadas por la comisión técnica.
                  </div>
                </div>
              </div>
            ) : (
              /* Unified Inline View */
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-900 leading-relaxed">
                  <span className="font-extrabold block text-[10px] uppercase text-rose-600 mb-1 font-mono flex items-center gap-1">
                    <span>[-] TEXTO ANTERIOR SUPRIMIDO / MODIFICADO</span>
                  </span>
                  <p className="line-through decoration-rose-400 font-sans">{currentArticle.textoOriginal}</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-950 leading-relaxed">
                  <span className="font-extrabold block text-[10px] uppercase text-emerald-700 mb-1 font-mono flex items-center gap-1">
                    <span>[+] TEXTO SUSTITUTIVO APROBADO EN COMISIÓN</span>
                  </span>
                  <p className="font-semibold font-sans">{currentArticle.textoComision}</p>
                </div>
              </div>
            )}

            {/* Indications Breakdown Section */}
            <div className="pt-5 border-t border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Indicaciones Presentadas a este Artículo ({filteredIndicaciones.length})</span>
                </h5>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFilterIndicaciones("todas")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      filterIndicaciones === "todas" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFilterIndicaciones("aprobadas")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      filterIndicaciones === "aprobadas" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Aprobadas
                  </button>
                  <button
                    onClick={() => setFilterIndicaciones("rechazadas")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      filterIndicaciones === "rechazadas" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Rechazadas
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredIndicaciones.map((ind, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{ind.autor}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100/70 text-blue-800 font-bold rounded-md uppercase">
                          {ind.tipo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        "{ind.texto}"
                      </p>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shrink-0 ${
                      ind.estado === "Aprobada" 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}>
                      {ind.estado === "Aprobada" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{ind.estado}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-600">
          <span className="font-medium">
            Fuente Oficial: Biblioteca del Congreso Nacional (BCN) & Sistema de Tramitación (SIL)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDiff}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              Copiar Artículo y Modificaciones
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cerrar Comparador
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
