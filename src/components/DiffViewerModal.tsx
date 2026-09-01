import React, { useState } from "react";
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
  ArrowLeftRight
} from "lucide-react";
import { TextDiffArticle, Proyecto } from "../types";

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto?: Proyecto | null;
}

const SAMPLE_ARTICLES: TextDiffArticle[] = [
  {
    id: "art-1",
    articulo: "Artículo 1° — Objeto y Ámbito de Aplicación",
    textoOriginal: "La presente ley tiene por objeto regular el desarrollo, comercialización, importación y uso de sistemas de inteligencia artificial en el territorio de la República de Chile, resguardando los derechos fundamentales y la seguridad de las personas.",
    textoComision: "La presente ley tiene por objeto fijar el marco general para el desarrollo ético, distribución, comercialización, importación y puesta en servicio de sistemas de inteligencia artificial y modelos algorítmicos en el territorio nacional, garantizando la dignidad humana, los derechos fundamentales, la ciberseguridad y la transparencia activa.",
    indicaciones: [
      {
        autor: "Ejecutivo (Ministerio de Ciencia)",
        tipo: "sustitucion",
        texto: "Sustitúyase la expresión 'territorio de la República' por 'territorio nacional y servicios digitales transfronterizos con impacto en residentes en Chile'.",
        estado: "Aprobada"
      },
      {
        autor: "Senador Juan Antonio Coloma (UDI)",
        tipo: "adicion",
        texto: "Incorpórase como principio rector el fomento a la innovación y competitividad de las pequeñas y medianas empresas de tecnología.",
        estado: "Aprobada"
      }
    ]
  },
  {
    id: "art-2",
    articulo: "Artículo 2° — Clasificación de Riesgos Algorítmicos",
    textoOriginal: "Los sistemas de inteligencia artificial se clasificarán en: a) Riesgo inaceptable; b) Alto riesgo; y c) Bajo riesgo.",
    textoComision: "Los sistemas de inteligencia artificial se categorizarán bajo una metodología técnica de gestión de riesgos en cuatro niveles: 1° Sistemas de riesgo inaceptable o prohibidos; 2° Sistemas de alto riesgo sujetos a evaluación de conformidad previa; 3° Sistemas de riesgo específico con obligaciones de transparencia; y 4° Sistemas de riesgo mínimo.",
    indicaciones: [
      {
        autor: "Comisión Técnica de Desafíos del Futuro",
        tipo: "sustitucion",
        texto: "Armonícese la categorización de cuatro niveles conforme al estándar del Reglamento Europeo de IA (AI Act 2024/1689).",
        estado: "Aprobada"
      },
      {
        autor: "Senador Alfonso De Urresti (PS)",
        tipo: "adicion",
        texto: "Prohíbase expresamente la identificación biométrica remota en tiempo real en espacios de acceso público sin autorización judicial previa.",
        estado: "Aprobada"
      }
    ]
  },
  {
    id: "art-3",
    articulo: "Artículo 3° — Deber de Explicabilidad y Transparencia",
    textoOriginal: "Todo usuario tendrá derecho a saber cuándo interactúa con un sistema automatizado.",
    textoComision: "Toda persona física o jurídica afectada por una decisión automatizada o asistida por sistemas de inteligencia artificial de alto riesgo tendrá derecho a una explicación clara, inteligible, razonada y oportuna sobre los parámetros, variables y criterios algorítmicos determinantes del resultado.",
    indicaciones: [
      {
        autor: "Senador Matías Walker (Demócratas)",
        tipo: "sustitucion",
        texto: "Conságrese el derecho a la revisión humana de las resoluciones administrativas o judiciales adoptadas mediante soporte algorítmico.",
        estado: "Aprobada"
      }
    ]
  },
  {
    id: "art-4",
    articulo: "Artículo 4° — Autoridad de Aplicación y Sanciones",
    textoOriginal: "La fiscalización corresponderá a los ministerios sectoriales correspondientes, aplicando multas de hasta 1.000 UTM.",
    textoComision: "La supervisión, registro nacional y potestad sancionadora corresponderá a la Agencia de Protección de Datos Personales, en coordinación con la Agencia Nacional de Ciberseguridad (ANCI), con multas graduales y proporcionales de hasta 20.000 UTM en casos gravísimos.",
    indicaciones: [
      {
        autor: "Ejecutivo (Ministerio de Hacienda)",
        tipo: "sustitucion",
        texto: "Asígnense las facultades fiscalizadoras a la Agencia de Datos Personales para evitar duplicidad de órganos estatales.",
        estado: "Aprobada"
      },
      {
        autor: "Diputado Luis Sánchez (PREP)",
        tipo: "supresion",
        texto: "Suprímanse las multas superiores a 5.000 UTM para empresas emergentes (startups).",
        estado: "Rechazada"
      }
    ]
  }
];

export default function DiffViewerModal({ isOpen, onClose, proyecto }: DiffViewerModalProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string>("art-1");
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side");
  const [filterIndicaciones, setFilterIndicaciones] = useState<"todas" | "aprobadas" | "rechazadas">("todas");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const currentArticle = SAMPLE_ARTICLES.find(a => a.id === selectedArticleId) || SAMPLE_ARTICLES[0];

  const filteredArticles = SAMPLE_ARTICLES.filter(a => 
    a.articulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.textoComision.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                Comparador de Textos e Indicaciones (Diff Viewer)
              </h3>
              <p className="text-xs text-slate-400">
                {proyecto?.id ? `Boletín ${proyecto.id}: ${proyecto.titulo.slice(0, 70)}…` : "Comparación de redacción normativa: Texto Original vs Informe de Comisión"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setViewMode("side-by-side")}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  viewMode === "side-by-side" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Lado a Lado
              </button>
              <button
                onClick={() => setViewMode("unified")}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  viewMode === "unified" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Vista Unificada
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar + Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Articles Sidebar */}
          <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col p-4 shrink-0 overflow-y-auto">
            <div className="mb-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar artículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Articulado del Proyecto ({filteredArticles.length})
            </span>

            <div className="space-y-1.5 flex-1">
              {filteredArticles.map((art) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all ${
                    selectedArticleId === art.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <div className="font-bold line-clamp-1">{art.articulo}</div>
                  <div className={`text-2xs mt-1 line-clamp-1 ${selectedArticleId === art.id ? "text-blue-100" : "text-slate-500"}`}>
                    {art.indicaciones.length} indicación(es) formulada(s)
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Diff Main Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white space-y-6">
            
            {/* Active Article Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-base font-bold text-slate-900">
                {currentArticle.articulo}
              </h4>
              <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200">
                Primer Trámite Constitucional
              </span>
            </div>

            {/* Diff Comparison View */}
            {viewMode === "side-by-side" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Original Text */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Texto Original (Moción / Mensaje)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200/80">
                    {currentArticle.textoOriginal}
                  </p>
                </div>

                {/* Right: Commission Modified Text */}
                <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/40">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                      Texto Aprobado en Comisión (Informe)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-emerald-200">
                    {currentArticle.textoComision}
                  </p>
                </div>
              </div>
            ) : (
              /* Unified View */
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs sm:text-sm text-rose-900 line-through">
                  <span className="font-bold block text-2xs uppercase text-rose-600 mb-1 font-sans">Texto Previo:</span>
                  {currentArticle.textoOriginal}
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs sm:text-sm text-emerald-900">
                  <span className="font-bold block text-2xs uppercase text-emerald-600 mb-1 font-sans">Texto Sustitutivo Comisión:</span>
                  {currentArticle.textoComision}
                </div>
              </div>
            )}

            {/* Indications Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Indicaciones Formuladas a este Artículo ({currentArticle.indicaciones.length})
                </h5>
              </div>

              <div className="space-y-2.5">
                {currentArticle.indicaciones.map((ind, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{ind.autor}</span>
                        <span className="text-2xs px-2 py-0.5 bg-slate-200 text-slate-700 font-semibold rounded">
                          {ind.tipo.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        "{ind.texto}"
                      </p>
                    </div>

                    <span className={`text-2xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                      ind.estado === "Aprobada" 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}>
                      {ind.estado === "Aprobada" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {ind.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Fuente: Biblioteca del Congreso Nacional / Informes de Comisión</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            Cerrar Comparador
          </button>
        </div>

      </div>
    </div>
  );
}
