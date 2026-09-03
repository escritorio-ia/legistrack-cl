/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ActivityItem {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  tipo: 'ingreso' | 'sesion' | 'indicaciones' | 'informe' | 'acuerdo' | 'alerta';
  boletinId?: string;
}

export interface DocumentoItem {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  url?: string;
  isReport?: boolean;
  reportContent?: string[];
  videoUrl?: string;
}

export interface VotacionItem {
  id: string;
  fecha: string;
  materia: string;
  si: number;
  no: number;
  abstencios: number;
  abstenciones?: number;
  resultado: string;
}

export interface Proyecto {
  id: string; // e.g. "16.621-13"
  titulo: string;
  resumen: string;
  fechaIngreso: string;
  estado: string;
  camaraOrigen: "Diputados" | "Senado";
  etapa: string;
  materia: string;
  urgencia: "Simple" | "Suma" | "Discusión Inmediata" | "Sin urgencia";
  patrocinantes: number;
  iniciativa: "Moción" | "Mensaje";
  autores?: string;
  comisionActual: string;
  comisionesHistoricas?: string[];
  timeline: ActivityItem[];
  documentos: DocumentoItem[];
  votaciones: VotacionItem[];
  linkCongreso?: string;
  subetapa?: string;
  siguienteSesion?: string;
  diasTramitacion?: number;
  fichaTecnica?: {
    objeto: string;
    mecanismos: string;
    fiscalizacion: string;
  };
  quorum?: {
    tipo: "Ley Simple" | "Quórum Calificado" | "Ley Orgánica Constitucional" | "Reforma Constitucional";
    descripcion: string;
    votosDiputados: string;
    votosSenadores: string;
  };
  origenDetalle?: {
    tipo: "Mensaje Presidencial" | "Moción Parlamentaria";
    patrocinadorPrincipal: string;
    ministeriosFirmantes?: string[];
    notaOrigen?: string;
  };
}

export interface Integrante {
  nombre: string;
  partido: string;
  rol: string;
  distrito?: string;
  region?: string;
  email?: string;
  fotoUrl?: string;
  camara?: "Cámara de Diputadas y Diputados" | "Senado de la República";
}

export interface SesionItem {
  id: string;
  fecha: string;
  fechaISO?: string;
  hora?: string;
  lugar?: string;
  modalidad?: string;
  secretario?: string;
  citacionNumero?: string;
  tipo: string;
  materia: string;
  invitados: string;
  acuerdosCount: number;
  acuerdosTexto?: string[];
  actaTexto?: string;
  tabla?: string[];
  videoUrl?: string;
  completada?: boolean;
}

export interface DocGroupItem {
  tipo: string;
  cuenta: number;
}

export interface AudienciaStats {
  sectorPublico: number;
  sociedadCivil: number;
  academia: number;
  ultimasAsistencias: { entidad: string; expositores: number }[];
}

export interface Comision {
  id: string;
  nombre: string;
  descripcion: string;
  periodo: string;
  officialUrl?: string;
  citacionesUrl?: string;
  sesionesRealizadas: number;
  proyectosContados: number;
  audienciasSostenidas: number;
  documentosContados: number;
  alertasActivas: number;
  sesiones: SesionItem[];
  proyectosIds: string[];
  audiencias: AudienciaStats;
  proximaSesion?: SesionItem;
  documentosGroups: DocGroupItem[];
  actividades: ActivityItem[];
  integrantes?: Integrante[];
  proyectos?: Proyecto[];
  temas?: string[];
}

export interface Alerta {
  id: string;
  titulo: string;
  subtitulo: string;
  boletinId: string;
  tiempo: string;
  tipo: 'indicador' | 'citacion' | 'votacion' | 'general';
}

export interface SalaVivo {
  camaraName: "Cámara de Diputadas y Diputados" | "Senado de la República";
  enVivo: boolean;
  temaDiscusion: string;
  estadoSesion: string;
  representantesPresentes: number;
  verStreamingUrl: string;
  proximaSesionStr?: string;
  proximoTema?: string;
  asistentesLista?: string[];
}

export interface QuorumBancada {
  id: string;
  nombre: string;
  color: string;
  bloque: "Oficialismo" | "Oposición" | "Centro/Independiente";
  escanosTotales: number;
  aFavor: number;
  enContra: number;
  abstencion: number;
  ausente: number;
}

export interface QuorumSimulationState {
  camara: "Diputados" | "Senado";
  tipoQuorum: "Ley Simple" | "Quórum Calificado" | "Ley Orgánica Constitucional" | "Reforma Constitucional";
  votosFavor: number;
  votosContra: number;
  votosAbstencion: number;
  votosAusente: number;
  totalVotosValidos: number;
  umbralRequerido: number;
  aprobado: boolean;
}

export interface TextDiffArticle {
  id: string;
  articulo: string;
  textoOriginal: string;
  textoComision: string;
  indicaciones: {
    autor: string;
    tipo: "adicion" | "supresion" | "sustitucion";
    texto: string;
    estado: "Aprobada" | "Rechazada" | "Retirada" | "Pendiente";
  }[];
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sugerencias?: string[];
  contextoBoletin?: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  apis: {
    senadoWSPublico: string;
    camaraOpenData: string;
    bcnLeyChile: string;
  };
  aiProviders: {
    gemini: boolean;
    groq: boolean;
    openrouter: boolean;
    claude: boolean;
    claudeQuotaExceeded: boolean;
  };
  cache: {
    size: number;
    hits: number;
    misses: number;
    hitRate: string;
  };
}

