import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Users, 
  Building,
  FileText, 
  Radio, 
  UserCheck, 
  Tag,
  Download,
  Copy,
  ExternalLink,
  Filter,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ListOrdered,
  Table as TableIcon,
  Share2,
  Layers,
  Landmark,
  ArrowRight,
  Printer,
  Search,
  X,
  SlidersHorizontal,
  Flame,
  AlertCircle,
  Video,
  CheckCircle2,
  CalendarDays,
  ShieldAlert,
  Bookmark,
  Star,
  History,
  Eye,
  CheckSquare
} from "lucide-react";

export interface CitacionesCamaraWidgetProps {
  setView?: (view: string) => void;
  setSelectedComisionId?: (id: string) => void;
  setSelectedProyectoId?: (id: string) => void;
  followedComs?: string[];
  toggleFollowCom?: (comName: string) => void;
}

export interface Citacion {
  comision: string;
  fechaISO: string; // E.g., "Martes 11 de Agosto, 2026"
  hora: string;
  lugar: string;
  materia: string;
  invitados?: string;
  boletin?: string;
  week: number;
  // Enriched fields for absolute completeness
  presidente: string;
  tipoSesion: "Ordinaria" | "Especial" | "Constitutiva";
  canalTransmision: string;
  ordenDelDia: string[];
  chamber?: "CD" | "SR";
}

// Highly comprehensive, enriched legislative schedule database
const CITACIONES_CAMARA: Citacion[] = [
  {
    comision: "Comisión Especial - Medidas ante violencia desde 18 oct 2019",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "08:30 a 09:50 hrs",
    lugar: "Sala Arturo Longton Guerrero, tercer nivel (Presencial)",
    materia: "Cumplir con su mandato relativo a las medidas de orden público ante hechos de violencia.",
    invitados: "Ministro del Interior señor Claudio Alvarado Andrade, Subsecretario del Interior señor Máximo Pavez Cantillano, Ministro de Relaciones Exteriores señor Francisco Pérez Mackenna, periodista señora Mónica González.",
    week: 33,
    presidente: "Diputado Integrante Especial",
    tipoSesion: "Especial",
    canalTransmision: "Cámara de Diputados TV (CDTV) / Señal Online 1",
    ordenDelDia: [
      "1. Escuchar la exposición del Ministro del Interior, don Claudio Alvarado.",
      "2. Recibir el testimonio y análisis de la periodista Mónica González."
    ]
  },
  {
    comision: "Comisión Especial - Discrepancias producción Codelco 2025",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "08:30 a 09:50 hrs",
    lugar: "Sala Ramón Pérez Opazo, tercer nivel (Presencial)",
    materia: "Con el objeto de recibir en audiencia, en el marco de su mandato, a directivos y ex ejecutivos de Codelco para tratar discrepancias de producción.",
    invitados: "Sra. Tamara Agnic Martínez (Presidenta del Comité de Auditoría, Compensaciones y Ética de Codelco), Sr. César Márquez Márquez (ex Ejecutivo de Codelco División Chuquicamata).",
    week: 33,
    presidente: "Diputado Investigador Principal",
    tipoSesion: "Especial",
    canalTransmision: "Señal Online 3 - Cámara de Diputados",
    ordenDelDia: [
      "1. Exposición de la Sra. Tamara Agnic sobre las auditorías éticas internas.",
      "2. Audiencia con el ex Ejecutivo César Márquez sobre los procesos de Chuquicamata."
    ]
  },
  {
    comision: "Comisión de Gobierno Interior, Nacionalidad, Ciudadanía y Regionalización",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "10:15 a 13:00 hrs",
    lugar: "Sala Arturo Longton Guerrero, tercer nivel (Presencial)",
    materia: "Discutir y votar en particular el proyecto de ley que fortalece la institucionalidad municipal en materia de seguridad pública y prevención del delito (Boletín N° 18.525-06). Urgencia calificada de 'discusión inmediata'.",
    boletin: "18525-06",
    week: 33,
    presidente: "Diputado Rubén Oyarzo Figueroa",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV) / Canal Principal",
    ordenDelDia: [
      "1. Votación en particular del articulado del Boletín N° 18.525-06 sobre fortalecimiento municipal.",
      "2. Análisis de indicaciones relativas al porte de armas y equipamiento preventivo de inspectores de seguridad comunales."
    ]
  },
  {
    comision: "Comisión de Desarrollo Social, Superación de la Pobreza y Planificación",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "10:30 a 13:00 hrs",
    lugar: "Sala Juan Lobos Krause, tercer nivel (Presencial)",
    materia: "Continuar la discusión y votación en particular hasta total despacho del proyecto que establece un beneficio de compensación por la compra de pañales y de medicamentos (Boletín N° 18255-31 / 103-374). Con urgencia de discusión inmediata.",
    boletin: "18255-31",
    week: 33,
    presidente: "Diputada Carolina Marzán Pinto",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 2 - Cámara de Diputados",
    ordenDelDia: [
      "1. Discusión en particular de las enmiendas al subsidio de adquisición de pañales para adultos mayores.",
      "2. Debate y votación de la cobertura de medicamentos de alto costo no cubiertos por Isapres ni Fonasa."
    ]
  },
  {
    comision: "Comisión de Ética y Transparencia",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "11:00 a 12:30 hrs",
    lugar: "Sala Pedro Pablo Álvarez-Salamanca, tercer nivel (Presencial)",
    materia: "Tratar materias e informes propios de su competencia interna y revisión de causas disciplinarias pendientes.",
    week: 33,
    presidente: "Diputada Ana María Gazmuri",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Privada de Comisión",
    ordenDelDia: [
      "1. Análisis de los requerimientos y denuncias parlamentarias de transparencia.",
      "2. Redacción de resoluciones internas sobre conducta parlamentaria."
    ]
  },
  {
    comision: "Comisión de Constitución, Legislación, Justicia y Reglamento",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Francisco Bulnes Sanfuentes, tercer nivel (Presencial)",
    materia: "Continuar la tramitación en general de la Reforma Constitucional en materia de detención para la ejecución de expulsiones administrativas (Boletín N° 18.314-07). Con suma urgencia.",
    invitados: "Ministro de Justicia y Derechos Humanos, Director Nacional de la PDI, Subdirector de Inteligencia de la PDI; constitucionalistas Marisol Peña (UDP), Tomás Jordán (UAH), y Alan Bronfman (UCV).",
    boletin: "18314-07",
    week: 33,
    presidente: "Diputado Miguel Ángel Calisto",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 4 - Cámara de Diputados",
    ordenDelDia: [
      "1. Escuchar la exposición técnica de la Policía de Investigaciones (PDI) sobre la logística de las expulsiones.",
      "2. Análisis doctrinario de los plazos de detención con los constitucionalistas invitados.",
      "3. Votación en general de la reforma antes del término de la sesión ordinaria."
    ]
  },
  {
    comision: "Comisión de Gobierno Interior, Nacionalidad, Ciudadanía y Regionalización",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Arturo Longton Guerrero, tercer nivel (Presencial)",
    materia: "Estudio de proyectos sobre rehabilitación de nacionalidad, matrimonios falsificados de carácter migratorio y requisitos de reunificación familiar (Boletín N° 17.905-06, Boletín N° 17.511-06).",
    invitados: "Diputado Sergio Bobadilla, Director Nacional del Servicio Nacional de Migraciones, Director Nacional del Servicio de Registro Civil e Identificación (y Jefe de la oficina de San Felipe).",
    boletin: "17905-06",
    week: 33,
    presidente: "Diputado Rubén Oyarzo Figueroa",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV) / Señal Online 1",
    ordenDelDia: [
      "1. Trámite del proyecto que rehabilita la nacionalidad chilena a Karen Parada Figueroa-Lange (Boletín 17905-06).",
      "2. Abordar la eventual existencia de una red comercializadora de 'matrimonios de papel' con el Director de Migraciones y de Registro Civil.",
      "3. Iniciar el debate sobre la reunificación familiar (Boletín 17511-06)."
    ]
  },
  {
    comision: "Comisión de Agricultura, Silvicultura y Desarrollo Rural",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Pedro Pablo Álvarez-Salamanca, tercer nivel (Presencial)",
    materia: "Votar en general los proyectos refundidos sobre control de perros asilvestrados o ferales (Boletines 16962-01, 18269-01 y 18400-01) y requisitos para semillas corrientes.",
    invitados: "Director Nacional del SAG don Domingo Rojas, Presidente de la Asociación de importadores de bulbos y floricultores don Matías Jofré.",
    boletin: "16962-01",
    week: 33,
    presidente: "Diputado Juan Antonio Coloma",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 5 - Cámara de Diputados",
    ordenDelDia: [
      "1. Votación en general de los proyectos refundidos sobre perros ferales o asilvestrados.",
      "2. Exposición del SAG y gremio floricultor sobre la consulta pública que fija requisitos de semillas corrientes internas."
    ]
  },
  {
    comision: "Comisión de Deportes y Recreación",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Octavio Jara Wolff, tercer nivel (Presencial)",
    materia: "Homenaje a la Selección Chilena de Fútbol Adaptado Campeona del Mundo y votar en general el proyecto de ley que reconoce al fútbol amateur como actividad de interés público (Boletín N° 18205-29).",
    invitados: "Selección Chilena de Fútbol Adaptado, asesor de la Biblioteca del Congreso Nacional don Juan Pablo Cavada Herrera.",
    boletin: "18205-29",
    week: 33,
    presidente: "Diputado Roberto Arroyo Muñoz",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online de Deportes CDTV",
    ordenDelDia: [
      "1. Ceremonia de reconocimiento oficial a los deportistas campeones de fútbol adaptado.",
      "2. Discusión y votación en general del proyecto de regulación de seguridad y transparencia del fútbol amateur."
    ]
  },
  {
    comision: "Comisión de Educación",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala de Conferencias Inés Enríquez, segundo nivel (Presencial)",
    materia: "Iniciar tramitación del proyecto para regular deberes y derechos de apoderados en el sistema educacional (Boletín N° 18461-04) y analizar condiciones de educadoras parvularias VTF.",
    invitados: "Ministra de Educación doña María Paz Arzola, presidentas de VTF Chile y Sindicatos 1 y 2 de Fundación Integra.",
    boletin: "18461-04",
    week: 33,
    presidente: "Diputada Emilia Schneider Videla",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV)",
    ordenDelDia: [
      "1. Exposición de autores y Ministra de Educación sobre el proyecto de ley de regulación de apoderados (Boletín 18461-04).",
      "2. Audiencia de trabajadoras de educación inicial VTF e Integra para evaluar mejoras laborales de educadoras de párvulos."
    ]
  },
  {
    comision: "Comisión de Relaciones Exteriores, Asuntos Interparlamentarios e Integración Latinoamericana",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Manuel Bustos Huerta, tercer nivel (Presencial)",
    materia: "Iniciar estudio del Acuerdo de Servicios Aéreos firmado entre la República de Chile y el Sultanato de Omán suscrito en Kuala Lumpur el 2024.",
    invitados: "Ministro de Relaciones Exteriores señor Francisco Pérez Mackenna, Subsecretaria de Relaciones Económicas Internacionales (Subrei) señora Paula Estévez Weinstein, Director de Asuntos Jurídicos Felipe Tagle.",
    boletin: "17400-10",
    week: 33,
    presidente: "Diputada Carmen Hertz Cádiz",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 6 - Cámara de Diputados",
    ordenDelDia: [
      "1. Exposición ministerial sobre las rutas aéreas y facilidades arancelarias comerciales con el Sultanato de Omán.",
      "2. Análisis del informe técnico de servicios de transporte aéreo."
    ]
  },
  {
    comision: "Comisión de Hacienda",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala de Conferencias Juan Bustos Ramírez, segundo nivel (Presencial)",
    materia: "Tratar proyecto de ley que Crea la Comisión de Comercio Estratégico y regula exportación de material de uso dual (Boletín N° 14.773-02) y votación particular de enmiendas aduaneras al contrabando agropecuario (Boletín N° 17.720-05).",
    invitados: "Ministro de RREE Francisco Pérez Mackenna, Subsecretario Patricio Torres Espinosa, Ministro de Defensa Fernando Barros Tocornal, Subsecretario Rodrigo Álvarez Aguirre, Ministro de Hacienda Jorge Quiroz Castro, Subsecretario Sebastián Vallebona Espinosa.",
    boletin: "14773-02",
    week: 33,
    presidente: "Diputado Carlos Bianchi Chelech",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV) / Señal Online 1",
    ordenDelDia: [
      "1. Análisis del proyecto sobre material de defensa estratégico de uso dual con las carteras de RREE, Defensa y Hacienda.",
      "2. Votación en particular del proyecto que modifica la Ordenanza de Aduanas para sancionar contrabando agropecuario (Boletín 17720-05)."
    ]
  },
  {
    comision: "Comisión de Economía, Fomento y Desarrollo",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "17:30 a 19:30 hrs",
    lugar: "Sala Ramón Pérez Opazo, tercer nivel (Presencial)",
    materia: "Mociones de cobros improcedentes post fallecimiento en contratos de tracto sucesivo (Boletín N° 18476-03), leyenda obligatoria de IA en publicidad (Boletín N° 18512-03) y presentación de Chile Data Center.",
    invitados: "Diputados autores de las mociones, Gerente General de Chile Data Center señora Natalia López.",
    boletin: "18476-03",
    week: 33,
    presidente: "Diputada Sofía Cid Versalovic",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 3 - Cámara de Diputados",
    ordenDelDia: [
      "1. Exposición de moción parlamentaria para prohibir cobros sucesivos post mortem en retail y servicios (Boletín 18476-03).",
      "2. Debate sobre obligación de etiquetar publicidad comercial creada de forma sustantiva por Inteligencia Artificial (Boletín 18512-03).",
      "3. Recibir a la gerencia de Chile Data Center para analizar la contribución y encadenamiento del ecosistema digital chileno."
    ]
  },
  {
    comision: "Comisión de Obras Públicas, Transportes y Telecomunicaciones",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "17:30 a 19:30 hrs",
    lugar: "Sala de Conferencias Inés Enríquez, segundo nivel (Presencial)",
    materia: "Proyecto que modifica la Ley Orgánica de EFE para eximir cobros municipales por obras de infraestructura estatal (Boletín N° 18.436-15) y moción que deroga el peaje electrónico en vías públicas (Boletín N° 16.346-15).",
    invitados: "Biministro de OOPP y Transportes, Presidente de EFE señor Jorge Claude Bourdel, Alcalde de Estación Central señor Felipe Muñoz Vallejos.",
    boletin: "18436-15",
    week: 33,
    presidente: "Diputado Jaime Sáez Quiroz",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV) / Señal Online 2",
    ordenDelDia: [
      "1. Discusión del Boletín N° 18.436-15 de exenciones tributarias municipales a obras ferroviarias de EFE.",
      "2. Exposición de Jaime Mulet sobre derogación de cobro de tag/peajes electrónicos en vías públicas nacionales (Boletín 16346-15)."
    ]
  },
  {
    comision: "Comisión de Defensa Nacional",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "17:30 a 19:30 hrs",
    lugar: "Sala Pedro Pablo Álvarez-Salamanca, tercer nivel (Presencial)",
    materia: "Analizar el seguimiento del Sistema de Inteligencia del Estado (Leyes 21.821 y 19.974) y abordar el estado de la zanja de resguardo y control en la frontera norte chilena.",
    invitados: "Ministro del Interior señor Claudio Alvarado Andrade, Director de la Agencia Nacional de Inteligencia Ronald Mc Intyre, Ministro de OOPP Louis De Grange Concha.",
    week: 33,
    presidente: "Diputado Francisco Undurraga",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV)",
    ordenDelDia: [
      "1. Conocer el plan de implementación del nuevo Estatuto Especial de Inteligencia y dictación reglamentaria de la ANI.",
      "2. Recibir del Ministro de Obras Públicas el informe y catastro de conservación física de la zanja fronteriza de seguridad del norte del país."
    ]
  },
  {
    comision: "Comisión de Personas Mayores y Discapacidad",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "17:30 a 19:30 hrs",
    lugar: "Sala Octavio Jara Wolff, tercer nivel (Presencial)",
    materia: "Iniciar la discusión particular del proyecto de ley que precisa el alcance del concepto de discapacidad en el ámbito deportivo (Boletín N° 17.981-35 / 18.176-35 refundidos).",
    boletin: "17981-35",
    week: 33,
    presidente: "Diputada Catalina Del Real",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online de Deportes CDTV",
    ordenDelDia: [
      "1. Votación y discusión pormenorizada del articulado aprobado en el Senado que modifica la ley N° 19.712 del Deporte.",
      "2. Definición reglamentaria de categorías adaptadas federadas para deportistas paralímpicos."
    ]
  },
  {
    comision: "Comisión de Salud",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "17:30 a 19:30 hrs",
    lugar: "Sala Juan Lobos Krause, tercer nivel (Presencial)",
    materia: "Iniciar discusión y votación particular de proyectos sobre prevención de la infertilidad y etiquetado o rotulado sanitario del recurso jurel (Boletines N° 16708-11, N° 16709-11 y N° 17800-11).",
    boletin: "16708-11",
    week: 33,
    presidente: "Diputada Ana María Gazmuri",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 4 - Cámara de Diputados",
    ordenDelDia: [
      "1. Votación particular de la incorporación de acciones preventivas contra infertilidad en el Código Sanitario (Boletines refundidos).",
      "2. Iniciar debate del proyecto que modifica rotulado de seguridad alimenticia enlatada de recurso jurel (Boletín 17800-11)."
    ]
  },
  {
    comision: "Comisión de Trabajo y Previsión Social",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "17:30 a 19:30 hrs",
    lugar: "Sala Manuel Bustos Huerta, tercer nivel (Presencial)",
    materia: "Discutir licencias médicas fraudulentas como causal de falta de probidad (Boletín N° 17.914-13) y adaptabilidad de jornada en turismo (Boletín N° 18.478-13).",
    invitados: "Subsecretario del Trabajo señor Gustavo Rosende Salazar, Subsecretaria de Turismo señora María Paz Lagos, Presidenta de FEDETUR Sra. Mónica Zalaquett, Presidente de Hoteleros de Chile Alberto Pirola.",
    boletin: "17914-13",
    week: 33,
    presidente: "Diputado Luis Cuello Peña y Lillo",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV) / Señal Online 1",
    ordenDelDia: [
      "1. Iniciar estudio en particular de sanción laboral a licencias médicas maliciosas de trabajadores (Boletín 17914-13).",
      "2. Debate técnico con subsecretarios y gremios turísticos (FEDETUR, Hoteleros) sobre jornadas de adaptabilidad turística (Boletín 18478-13)."
    ]
  },
  {
    comision: "Comisión de Bomberos",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "17:30 a 19:30 hrs",
    lugar: "Sala Francisco Bulnes Sanfuentes, tercer nivel (Presencial)",
    materia: "Iniciar la discusión y votación particular de eximir el pago de peaje/tag en todas las autopistas concesionadas del país a los vehículos de los Cuerpos de Bomberos (Boletín N° 18.294-15).",
    boletin: "18294-15",
    week: 33,
    presidente: "Diputado Luis Malla Valenzuela",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Privada de Comisión",
    ordenDelDia: [
      "1. Exposición de autores de la moción del Boletín N° 18.294-15.",
      "2. Votación en particular de la exención de tarifa frente a emergencias y movilización rutinaria bomberil."
    ]
  },
  {
    comision: "Comisión Especial - Control migratorio de NNA extranjeros",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "08:30 a 09:45 hrs",
    lugar: "Sala Ramón Pérez Opazo, tercer nivel (Presencial)",
    materia: "Recibir testimonios en audiencia técnica sobre los procesos y regularización de control migratorio de niños, niñas y adolescentes extranjeros en territorio nacional.",
    invitados: "Director Nacional de Migraciones Frank Sauerbaum, exdirector Luis Eduardo Thayer.",
    week: 33,
    presidente: "Diputado Investigador Especial",
    tipoSesion: "Especial",
    canalTransmision: "Señal Online 3 - Cámara de Diputados",
    ordenDelDia: [
      "1. Exposición de Frank Sauerbaum sobre tasas de regularización y enrolamiento biométrico infanto-juvenil.",
      "2. Análisis del exdirector Luis Eduardo Thayer acerca de las directrices normativas aplicadas en pasos habilitados."
    ]
  },
  {
    comision: "Comisión de Derechos Humanos y Pueblos Originarios",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Ramón Pérez Opazo, tercer nivel (Presencial)",
    materia: "Iniciar la discusión en particular del proyecto de ley que restringe las causales de reconocimiento de la calidad de indígena (Boletín N° 16.172-17).",
    boletin: "16172-17",
    week: 33,
    presidente: "Diputada Lorena Fries Monleón",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 2 - Cámara de Diputados",
    ordenDelDia: [
      "1. Discusión pormenorizada del Boletín N° 16.172-17 sobre acreditación de calidad indígena por parte de la CONADI.",
      "2. Evaluación de comentarios de comunidades de pueblos originarios ingresados por correspondencia oficial."
    ]
  },
  {
    comision: "Comisión de Medio Ambiente y Recursos Naturales",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Juan Lobos Krause, tercer nivel (Presencial)",
    materia: "Continuar la discusión y votación particular del proyecto que fortalece la institucionalidad ambiental y mejora su eficiencia en la tramitación del SEIA (Boletín N° 16.552-12 (S)). Urgencia simple.",
    boletin: "16552-12",
    week: 33,
    presidente: "Diputado Daniel Melo Contreras",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV) / Señal Online 1",
    ordenDelDia: [
      "1. Debate de indicaciones parlamentarias destinadas a acotar plazos de reclamación en el comité de ministros.",
      "2. Votación de enmiendas al estatuto de participación ciudadana vinculante."
    ]
  },
  {
    comision: "Comisión de Vivienda, Desarrollo Urbano y Bienes Nacionales",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Pedro Pablo Álvarez-Salamanca, tercer nivel (Presencial)",
    materia: "Iniciar discusión general del proyecto de detectores de humo obligatorios en viviendas nuevas (Boletín 18444-14) y de exigencia de ejecución de obras de mitigación directa en proyectos inmobiliarios (Boletín 18309-14).",
    invitados: "Diputado Eduardo Durán Salinas, Diputada Ana María Gazmuri Vieira.",
    boletin: "18444-14",
    week: 33,
    presidente: "Diputado Tomás Hirsch Goldschmidt",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 1 - Cámara de Diputados",
    ordenDelDia: [
      "1. Exposición del diputado Eduardo Durán sobre alcance y obligatoriedad de detectores de humo (Boletín 18444-14).",
      "2. Presentación de la diputada Ana María Gazmuri sobre mitigación directa en el marco de la LGUC (Boletín 18309-14)."
    ]
  },
  {
    comision: "Comisión de Pesca, Acuicultura e Intereses Marítimos",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Arturo Longton Guerrero, tercer nivel (Presencial)",
    materia: "Iniciar la votación en particular del proyecto de ley copatrocinado por diputados que legisla sobre el Fortalecimiento de la Seguridad Marítima nacional (Boletín N° 18.198-15).",
    boletin: "18198-15",
    week: 33,
    presidente: "Diputado Jorge Brito Hasbún",
    tipoSesion: "Ordinaria",
    canalTransmision: "Cámara de Diputados TV (CDTV)",
    ordenDelDia: [
      "1. Revisión de las atribuciones fiscalizadoras de Directemar en zonas de exclusión económica.",
      "2. Votación particular de los primeros tres artículos del Boletín N° 18.198-15."
    ]
  },
  {
    comision: "Comisión de Mujeres y Equidad de Género",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Manuel Bustos Huerta, tercer nivel (Presencial)",
    materia: "Mociones que fortalece la protección a víctimas de violencia intrafamiliar, evitan la revictimización y regulan la notificación de medidas cautelares (Boletines N° 18236-18 y N° 18414-18).",
    invitados: "Diputada Valentina Becerra Peña, Presidenta de la Asociación de Magistrados Mariela Hernández Acevedo, Directora CAJ Paula Torres Bruna, representantes de Miles Chile y Corporación Humanas.",
    boletin: "18236-18",
    week: 33,
    presidente: "Diputada Carolina Tello",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online de Equidad CDTV",
    ordenDelDia: [
      "1. Exposición de la diputada Valentina Becerra Peña sobre los fundamentos de la moción del Boletín N° 18414-18.",
      "2. Recibir aportes y observaciones del Poder Judicial (Magistrados) y de corporaciones defensoras de derechos humanos femeninos (Miles Chile, Humanas)."
    ]
  },
  {
    comision: "Comisión de Constitución, Legislación, Justicia y Reglamento",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Francisco Bulnes Sanfuentes, tercer nivel (Presencial)",
    materia: "Continuar la tramitación general del proyecto de ley que amplía las hipótesis penales de tráfico ilícito de migrantes y endurece sus penas (Boletines refundidos N° 18.315-07 y N° 16.948-07). Con suma urgencia.",
    invitados: "Ministro de Justicia y DDHH, penalistas Diego Falcone (U. Andrés Bello), Javier Wilenmann (U. Adolfo Ibáñez) y Marcos Zamora Uribe (U. de Viña del Mar).",
    boletin: "18315-07",
    week: 33,
    presidente: "Diputado Miguel Ángel Calisto",
    tipoSesion: "Ordinaria",
    canalTransmision: "Señal Online 4 - Cámara de Diputados",
    ordenDelDia: [
      "1. Análisis dogmático penal de los nuevos agravantes de tráfico migratorio con los profesores de derecho penal invitados.",
      "2. Presentación jurídica de la secretaría sobre la refundición de los Boletines 18315-07 y 16948-07."
    ]
  },
  {
    comision: "Comisión de Minería y Energía",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:00 a 17:00 hrs",
    lugar: "Sala Octavio Jara Wolff, tercer nivel (Presencial)",
    materia: "Abordar la decisión de Codelco de suspender temporalmente las actividades de desarrollo y construcción del proyecto Andes Norte de la División El Teniente.",
    invitados: "Presidente del Directorio Bernardo Fontaine Talavera, Presidente Ejecutivo de Codelco Jorge Gómez Díaz, Biministro de Economía y Minería Daniel Mas Valdés.",
    week: 33,
    presidente: "Diputada Yovana Ahumada Flores",
    tipoSesion: "Especial",
    canalTransmision: "Señal de Minería CDTV / Online 5",
    ordenDelDia: [
      "1. Conocer los fundamentos geomecánicos de la detención provisoria de las obras del túnel Andes Norte de División El Teniente.",
      "2. Evaluar el impacto de la suspensión sobre la dotación de trabajadores contratistas e ingresos fiscales proyectados."
    ]
  }
];

const CITACIONES_SENADO: Citacion[] = [
  {
    comision: "Comisión de Salud",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "09:30 a 11:00 hrs",
    lugar: "Sala 11, Valparaíso",
    materia: "Proyecto de ley sobre composición nutricional de alimentos libres de gluten (Boletín 18302-11); procreación asistida subrogante (Boletín 17922-11); y receta electrónica (Boletín 17355-11).",
    invitados: "Honorable Senador señor Matías Walker (autor de iniciativa); Ministra de Salud.",
    boletin: "18302-11",
    week: 33,
    presidente: "Senador Francisco Chahuán",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 1",
    ordenDelDia: [
      "1. Bol.N° 18302-11: Proyecto de ley que modifica la ley N° 20.606, sobre composición nutricional de los alimentos y su publicidad, con el objeto de facilitar el acceso a alimentos libres de gluten en establecimientos de comercio y garantizar su inocuidad.",
      "2. Bol.N° 17922-11: Proyecto de ley que regula la procreación asistida con transferencia embrionaria en una gestora subrogante, y modifica el Código Civil del modo que indica (Invitado: Senador Matías Walker).",
      "3. Bol.N° 17355-11: Proyecto de ley que modifica diversos cuerpos legales, con el objeto de establecer la prescripción médica por medio de receta electrónica y sancionar su falsificación (Invitada: Ministra de Salud)."
    ]
  },
  {
    comision: "Comisión de Economía (HA QUEDADO SIN EFECTO)",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "09:30 a 11:00 hrs",
    lugar: "Sala N° 3 de Comisiones, Valparaíso",
    materia: "Continuar el estudio del proyecto de ley sobre Propiedad Intelectual para regular las medidas tecnológicas de protección (Boletín N° 14767-03). SESIÓN SUSPENDIDA.",
    invitados: "Subsecretaria de Telecomunicaciones señora Romina Garrido; señor Francisco Nieto (IFPI); señora María Esperanza Silva (Chileactores); señor Alfie Ulloa (Chile Telcos); Biblioteca del Congreso Nacional.",
    boletin: "14767-03",
    week: 33,
    presidente: "Senadora Paulina Vodanovic",
    tipoSesion: "Especial",
    canalTransmision: "Sesión Cancelada - Sin Transmisión",
    ordenDelDia: [
      "1. Bol.N° 14767-03: Regular las medidas tecnológicas de protección en ley de Propiedad Intelectual.",
      "NOTA: ESTA SESIÓN HA QUEDADO SIN EFECTO."
    ]
  },
  {
    comision: "Comisión de Hacienda",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "10:30 a 12:30 hrs",
    lugar: "Sala 12, segundo piso, Senado en Valparaíso",
    materia: "Estudio del proyecto de ley que equipara el derecho de sala cuna para trabajadoras, trabajadores e independientes y crea fondo solidario (Boletín N° 14782-13).",
    invitados: "Asesores técnicos legislativos y representantes ministeriales.",
    boletin: "14782-13",
    week: 33,
    presidente: "Senador Ricardo Lagos Weber",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 2",
    ordenDelDia: [
      "1. Bol.N° 14782-13: Equipara el derecho de sala cuna para las trabajadoras, los trabajadores y los independientes que indica, en las condiciones que establece, modifica el Código del Trabajo para tales efectos y crea un fondo solidario de sala cuna."
    ]
  },
  {
    comision: "Comisión de Seguridad Pública",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "11:00 a 12:30 hrs",
    lugar: "Sala 10, tercer piso, Valparaíso",
    materia: "Recibir al Alcalde de Collipulli sobre hechos de violencia; tramitar proyecto de continuidad del juicio oral (Boletín 18208-25); e indicaciones de modernización de Carabineros de Chile (Boletín 17535-25).",
    invitados: "Alcalde de Collipulli señor Manuel Macaya; Ministro de Justicia señor Fernando Rabat; Ministro de Seguridad Pública señor Martín Arrau; General Director de Carabineros señor Marcelo Araya.",
    boletin: "18208-25",
    week: 33,
    presidente: "Senador Presidente de Seguridad",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 3",
    ordenDelDia: [
      "1. Audiencia con el Alcalde de Collipulli, señor Manuel Macaya, sobre atentados y violencia en su comuna.",
      "2. Bol.N° 18208-25: Asuntos pendientes sobre reforma al Código Procesal Penal para regular la continuidad del juicio oral ante incomparecencia injustificada (Invitado: Ministro Fernando Rabat).",
      "3. Bol.N° 17535-25: Estudio de indicaciones para modernizar el sistema de incentivos y extender la carrera en Carabineros de Chile (Invitados: Ministro Martín Arrau y General Director Marcelo Araya)."
    ]
  },
  {
    comision: "Comisión de Familia, Infancia y Adolescencia",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "11:15 a 12:30 hrs",
    lugar: "Sala 5, Valparaíso",
    materia: "Proyecto de ley sobre sanciones para acusaciones, denuncias o querellas falsas (Boletín 18239-36); y bono extraordinario de apoyo a la niñez (Boletín 18401-31).",
    invitados: "Ministra de Desarrollo Social y Familia señora María Jesús Wulf; Subsecretario de Evaluación Social señor Gabriel Ugarte; Subsecretaria de Previsión Social señora María Elisa Cabezón.",
    boletin: "18239-36",
    week: 33,
    presidente: "Senadora Presidenta de Familia",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 4",
    ordenDelDia: [
      "1. Bol.N° 18239-36: Estudio de proyecto que establece sanciones en el caso de acusaciones, denuncias o querellas falsas (Discusión Inmediata).",
      "2. Bol.N° 18401-31: Iniciar estudio de proyecto que entrega un bono extraordinario de apoyo a la niñez (Suma Urgencia; Invitados: Ministra María Jesús Wulf, Subsecretario Gabriel Ugarte y Subsecretaria María Elisa Cabezón)."
    ]
  },
  {
    comision: "Comisión de Defensa Nacional",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "12:15 a 13:30 hrs",
    lugar: "Comando de Operaciones Navales, Armada de Chile, Valparaíso",
    materia: "Considerar materias de competencia de la instancia legislativa en terreno.",
    invitados: "Altos mandos de la Armada de Chile.",
    week: 33,
    presidente: "Senador Kenneth Pugh Olavarría",
    tipoSesion: "Ordinaria",
    canalTransmision: "Sesión Reservada",
    ordenDelDia: [
      "1. Considerar materias de competencia de la instancia legislativa de Defensa Nacional en dependencias del Comando de Operaciones Navales de la Armada de Chile."
    ]
  },
  {
    comision: "Comisión de Gobierno, Descentralización y Regionalización",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "12:30 a 14:00 hrs",
    lugar: "Sala N° 2 de Comisiones del Senado, Valparaíso",
    materia: "Considerar materias propias de la competencia de la comisión en el ámbito regional y municipal.",
    invitados: "Representantes y asesores legislativos de gobiernos regionales.",
    week: 33,
    presidente: "Senador Presidente de Gobierno",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 5",
    ordenDelDia: [
      "1. Análisis de iniciativas sobre descentralización, competencias regionales y desarrollo de territorios subnacionales."
    ]
  },
  {
    comision: "Comisión de Medio Ambiente, Cambio Climático y Bienes Nacionales",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "12:30 a 14:00 hrs",
    lugar: "Sala N° 11, Valparaíso",
    materia: "Exposición sobre el Parque Marino 'Mar de Juan Fernández'; y fortalecimiento fiscalizador de la Superintendencia del Medio Ambiente (Boletín 16553-12).",
    invitados: "Alcalde de Juan Fernández señor Pablo Manríquez Angulo; Ministra del Medio Ambiente señora Francisca Toledo; Subsecretario señor José Ignacio Vial.",
    boletin: "16553-12",
    week: 33,
    presidente: "Senadora Paulina Vodanovic",
    tipoSesion: "Ordinaria",
    canalTransmision: "Streaming Web Senado / Canal 1",
    ordenDelDia: [
      "1. Recibir en audiencia al alcalde de la comuna de Juan Fernández, señor Pablo Manríquez Angulo, para exponer sobre el Parque Marino 'Mar de Juan Fernández'.",
      "2. Bol.N° 16553-12: Continuar el estudio de las indicaciones presentadas al proyecto de ley que fortalece y mejora la eficacia de la fiscalización de la Superintendencia del Medio Ambiente (Invitados: Ministra Francisca Toledo y Subsecretario José Ignacio Vial)."
    ]
  },
  {
    comision: "Comisión de Relaciones Exteriores",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "12:30 a 14:00 hrs",
    lugar: "Sala 1, Valparaíso",
    materia: "Estudio y aprobación de Convenio de Transporte Aéreo entre Chile y Costa Rica (Boletín 18301-10).",
    invitados: "Ministro de Relaciones Exteriores.",
    boletin: "18301-10",
    week: 33,
    presidente: "Senador Francisco Chahuán",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 1",
    ordenDelDia: [
      "1. Bol.N° 18301-10: Proyecto que aprueba el Convenio de Transporte Aéreo entre el Gobierno de la República de Chile y el Gobierno de la República de Costa Rica, suscrito en Lima, Perú, el 13 de diciembre de 2023 (Invitado: Canciller)."
    ]
  },
  {
    comision: "Quinta Subcomisión Mixta de Presupuestos",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "14:45 a 15:30 hrs",
    lugar: "Sala 5, Valparaíso",
    materia: "Constitución de la Quinta Subcomisión Mixta de Presupuestos, elección de presidencia y acuerdos de procedimiento.",
    invitados: "Parlamentarios integrantes de la subcomisión.",
    week: 33,
    presidente: "Por definir (Sesión Constitutiva)",
    tipoSesion: "Constitutiva",
    canalTransmision: "Streaming Congreso Nacional",
    ordenDelDia: [
      "1. Constituirse legalmente como Quinta Subcomisión Mixta de Presupuestos.",
      "2. Elegir Presidente(a) de la instancia.",
      "3. Adoptar los demás acuerdos que la Subcomisión estime pertinentes para el estudio de partidas presupuestarias."
    ]
  },
  {
    comision: "Comisión de Ética y Transparencia (HA QUEDADO SIN EFECTO)",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 16:00 hrs",
    lugar: "Sala N° 1 de Comisiones, Piso 3, Valparaíso",
    materia: "Tratar materias de competencia de la comisión. SESIÓN SUSPENDIDA.",
    invitados: "Asesores y secretarios de la comisión de ética.",
    week: 33,
    presidente: "Senador Presidente de Ética",
    tipoSesion: "Especial",
    canalTransmision: "Sesión Cancelada - Sin Transmisión",
    ordenDelDia: [
      "1. Tratar materias de competencia interna del Senado.",
      "NOTA: ESTA SESIÓN HA QUEDADO SIN EFECTO."
    ]
  },
  {
    comision: "Comisión de Derechos Humanos, Nacionalidad y Ciudadanía",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 16:00 hrs",
    lugar: "Sala 7, tercer piso de Comisiones, Valparaíso",
    materia: "Iniciar votación en particular de modificación a la LOC del Congreso sobre informes de tratados internacionales de DD.HH. (Boletín 16017-17).",
    invitados: "Asesores de Derechos Humanos y representantes ministeriales.",
    boletin: "16017-17",
    week: 33,
    presidente: "Senador Presidente de Derechos Humanos",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 2",
    ordenDelDia: [
      "1. Bol.N° 16017-17: Iniciar la votación en particular del proyecto de ley que modifica la LOC del Congreso Nacional, para regular la remisión y recepción de informes relativos al cumplimiento de tratados internacionales y recomendaciones de sistemas de DD.HH."
    ]
  },
  {
    comision: "Comisión Mixta para Boletín N° 15805-07 (RUF)",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:00 a 16:00 hrs",
    lugar: "Sala N° 10 de Comisiones, tercer piso, Valparaíso",
    materia: "Comisión Mixta encargada de proponer forma de resolver discrepancias sobre Reglas de Uso de la Fuerza (RUF) (Boletín 15805-07).",
    invitados: "Ministro de Seguridad Pública.",
    boletin: "15805-07",
    week: 33,
    presidente: "Senador Presidente de la Mixta RUF",
    tipoSesion: "Especial",
    canalTransmision: "TV Senado / Señal Online Comisiones",
    ordenDelDia: [
      "1. Bol.N° 15805-07: Proponer la forma y modo de resolver las divergencias surgidas con ocasión de la tramitación del proyecto que establece normas generales sobre el uso de la fuerza para el personal de orden, seguridad pública y FF.AA. (Invitado: Ministro de Seguridad Pública)."
    ]
  },
  {
    comision: "Tercera Subcomisión Mixta de Presupuestos",
    fechaISO: "Martes 11 de Agosto, 2026",
    hora: "15:30 a 16:00 hrs",
    lugar: "Sala N° 9, tercer piso Senado, Valparaíso",
    materia: "Constitución de la Tercera Subcomisión Mixta de Presupuestos, elección de presidencia y otros acuerdos.",
    invitados: "Parlamentarios integrantes de la subcomisión.",
    week: 33,
    presidente: "Por definir (Sesión Constitutiva)",
    tipoSesion: "Constitutiva",
    canalTransmision: "Streaming Congreso Nacional",
    ordenDelDia: [
      "1. Constituirse legalmente como Tercera Subcomisión Mixta de Presupuestos.",
      "2. Elegir Presidente (a) de la instancia.",
      "3. Tratar otras materias de su competencia y coordinar análisis presupuestario."
    ]
  },
  {
    comision: "Comisión de Minería y Energía",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "09:00 a 10:30 hrs",
    lugar: "Sala de Sesiones, Valparaíso",
    materia: "Proyecto de ley que modifica el Código de Minería en materia de amparo minero (Boletín 18259-08).",
    invitados: "Ministro de Minería señor Daniel Mas; Subsecretario señor Álvaro González; Vicepresidente Ejecutivo de ENAMI señor Juan Carlos Sáez; Presidente de SONAMI señor Jorge Riesco.",
    boletin: "18259-08",
    week: 33,
    presidente: "Senadora Yasna Provoste Campillay",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 1",
    ordenDelDia: [
      "1. Bol.N° 18259-08: Modifica el Código de Minería y las leyes números 21.420 y 21.649, en materia de amparo minero y otras materias (Invitados: Ministro Daniel Mas, Subsecretario Álvaro González, Vicepresidente ENAMI Juan Carlos Sáez y Presidente SONAMI Jorge Riesco)."
    ]
  },
  {
    comision: "Comisión de Transportes y Telecomunicaciones",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "09:30 a 11:00 hrs",
    lugar: "Sala 5, Valparaíso",
    materia: "Iniciar estudio de proyecto que modifica Ley de Tránsito para disponer test de alcohol y drogas en terminales para conductores (Boletines refundidos 16853-15 y 16872-15).",
    invitados: "Presidente de FENABUS señor Marcos Carter; Presidenta de Fundación Emilia señora Carolina Figueroa.",
    boletin: "16853-15",
    week: 33,
    presidente: "Senador Juan Castro Prieto",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 2",
    ordenDelDia: [
      "1. Bol.N° 16853-15 y 16.872-15 (refundidos): Iniciar el estudio del proyecto de ley que modifica la ley N° 18.290 de Tránsito, para que los operadores de transporte público mayor dispongan, en los terminales, de instrumentos de control de alcohol y drogas (Invitados: Marcos Carter de FENABUS y Carolina Figueroa de Fundación Emilia)."
    ]
  },
  {
    comision: "Comisión de Recursos Hídricos, Desertificación y Sequía",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "09:30 a 11:00 hrs",
    lugar: "Sala N° 9 de Comisiones, tercer piso del Senado, Valparaíso",
    materia: "Abordar efectos de frentes de mal tiempo en riego; indicaciones a ley de servicios sanitarios rurales (Boletín 17877-33) y escuchar a dirigentes de APR.",
    invitados: "Ministro de Agricultura señor Jaime Campos; Ministro de Obras Públicas; dirigentes de federaciones de comités y cooperativas de agua potable rural FENAPRU, APR Chile y FESAN.",
    boletin: "17877-33",
    week: 33,
    presidente: "Senador Presidente de Recursos Hídricos",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 3",
    ordenDelDia: [
      "1. Abordar los efectos de los frentes de mal tiempo en la infraestructura de riego y en la agricultura, y las medidas de mitigación y prevención (Invitado: Ministro Jaime Campos).",
      "2. Bol.N° 17877-33: Conocer del Ministro de Obras Públicas los contenidos de las indicaciones del Ejecutivo al proyecto que fortalece el régimen de servicios sanitarios rurales.",
      "3. Escuchar la opinión de dirigentes de FENAPRU, APR Chile y FESAN sobre las indicaciones presentadas.",
      "4. Iniciar la discusión de las indicaciones formuladas a la referida iniciativa legal."
    ]
  },
  {
    comision: "Comisión de Agricultura",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "11:00 a 12:30 hrs",
    lugar: "Sala 7, tercer piso de Comisiones, Valparaíso",
    materia: "Analizar impacto de nuevos aranceles impuestos por Estados Unidos a las exportaciones agrícolas chilenas.",
    invitados: "Ministro de Agricultura señor Jaime Campos; Subsecretaria de Relaciones Económicas Internacionales señora Paula Estévez Weinstein.",
    week: 33,
    presidente: "Senador Presidente de Agricultura",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 4",
    ordenDelDia: [
      "1. Analizar la situación de los nuevos aranceles impuestos por EE.UU. a las exportaciones chilenas y su impacto en el mercado agrícola nacional (Invitados: Ministro Jaime Campos y Subsecretaria Paula Estévez)."
    ]
  },
  {
    comision: "Comisión de Intereses Marítimos, Pesca y Acuicultura",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "11:00 a 12:30 hrs",
    lugar: "Sala N° 1, Valparaíso",
    materia: "Estudio de excepción de artes de pesca para extracción de jibia (Boletín 18173-21); alzas arancelarias de EE.UU. a industria del salmón; y convenios de colaboración del SBAP.",
    invitados: "Subsecretario de Pesca; dirigentes de sindicatos de Quellón del sector salmonero; Ministra del Medio Ambiente; Director Nacional del SBAP.",
    boletin: "18173-21",
    week: 33,
    presidente: "Senador Presidente de Pesca",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 5",
    ordenDelDia: [
      "1. Bol.N° 18173-21: Iniciar estudio de proyecto de excepción de prohibición de artes y aparejos para extracción de jibia, y votar la idea de legislar (Invitado: Subsecretario de Pesca).",
      "2. Recibir a dirigentes de sindicatos de Quellón sobre alzas arancelarias del 10% al 12.5% de EE.UU. a importaciones de salmón.",
      "3. Conocer convenios de colaboración suscritos entre el SBAP y diversas ONG de conservación (Invitados: Ministra del Medio Ambiente y Director Nacional del SBAP)."
    ]
  },
  {
    comision: "Comisión de Constitución, Legislación, Justicia y Reglamento",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "11:00 a 13:00 hrs",
    lugar: "Sala N° 10 de Comisiones, Valparaíso",
    materia: "Proyecto que modifica ley de responsabilidad penal de adolescentes para fortalecer respuesta sancionatoria ante delitos graves (Boletín 15589-07).",
    invitados: "Ministro de Justicia señor Fernando Rabat; Fiscal Nacional señor Ángel Valencia; Defensor de la Niñez señor Anuar Quesille.",
    boletin: "15589-07",
    week: 33,
    presidente: "Senador Alfonso de Urresti",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 1",
    ordenDelDia: [
      "1. Bol.N° 15589-07: Modifica la ley N° 20.084 sobre responsabilidad penal adolescente para fortalecer sanciones en conductas de especial gravedad (Invitados: Ministro Fernando Rabat, Fiscal Nacional Ángel Valencia y Defensor de la Niñez Anuar Quesille)."
    ]
  },
  {
    comision: "Comisión de Educación",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "12:00 a 14:00 hrs",
    lugar: "Sala 8, Comisiones, Senado, Valparaíso",
    materia: "Iniciar discusión en general de la reforma que modifica el Sistema de Educación Pública para ajustar la instalación de SLEP (Boletín 18551-04).",
    invitados: "Representantes y asesores del Ministerio de Educación.",
    boletin: "18551-04",
    week: 33,
    presidente: "Senador José García Ruminot",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 2",
    ordenDelDia: [
      "1. Bol.N° 18551-04: Iniciar la discusión en general del proyecto de ley de S.E. el Presidente, que modifica la ley N° 21.040, que crea el Sistema de Educación Pública, para ajustar la segunda etapa de instalación y traspaso de los SLEP."
    ]
  },
  {
    comision: "Comisión del Adulto Mayor y Discapacidad",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "12:30 a 14:00 hrs",
    lugar: "Sala N° 2 de Comisiones del Senado, Valparaíso",
    materia: "Discusión sobre infraestructura de asistencia para personas mayores en turismo (Boletín 18491-03); y participación de la sociedad civil (Boletín 17979-35).",
    invitados: "Subsecretaria de Turismo señora María Paz Lagos; Director Nacional del Sernatur señor Jaime Benítez; Presidenta de Fedetur señora Mónica Zalaquett.",
    boletin: "18491-03",
    week: 33,
    presidente: "Senador Presidente de Adulto Mayor",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 3",
    ordenDelDia: [
      "1. Bol.N° 18491-03: Proyecto que obliga a prestadores turísticos a contar con infraestructura de asistencia y seguridad para personas mayores (Invitados: María Paz Lagos, Jaime Benítez y Mónica Zalaquett).",
      "2. Bol.N° 17979-35: Continuar la discusión de reforma a la ley N° 21.545 para fortalecer la participación de la sociedad civil."
    ]
  },
  {
    comision: "Comisión de Obras Públicas",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "12:30 a 14:00 hrs",
    lugar: "Sala N° 4 de Comisiones, tercer piso, Valparaíso",
    materia: "Escuchar al Director Nacional (s) de Vialidad sobre pavimentación de infraestructura caminera secundaria.",
    invitados: "Director Nacional (s) de Vialidad; representantes del Consorcio Ecoterra-Blauemeer.",
    week: 33,
    presidente: "Senador Presidente de Obras Públicas",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 4",
    ordenDelDia: [
      "1. Escuchar la exposición del Director Nacional (s) de Vialidad respecto del plan nacional de pavimentación de caminos secundarios e infraestructura caminera local.",
      "2. Recibir en audiencia a representantes del Consorcio de infraestructura Ecoterra-Blauemeer."
    ]
  },
  {
    comision: "Comisión de Trabajo y Previsión Social",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "12:30 a 14:00 hrs",
    lugar: "Sala N° 9, tercer piso Senado, Valparaíso",
    materia: "Continuar estudio del proyecto que modifica el Código del Trabajo para crear el contrato por horas (Boletín 11929-13).",
    invitados: "Ex Ministro del Trabajo señor Osvaldo Andrade; representantes de la Central Unitaria de Trabajadores (CUT).",
    boletin: "11929-13",
    week: 33,
    presidente: "Senador Presidente de Trabajo",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 5",
    ordenDelDia: [
      "1. Bol.N° 11929-13: Continuar estudio de proyecto de ley que crea el contrato por horas para flexibilización y formalización laboral (Invitados: Osvaldo Andrade y representantes de la CUT)."
    ]
  },
  {
    comision: "Comisión de Ética y Transparencia",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "14:00 a 15:00 hrs",
    lugar: "Sala N° 1 de Comisiones, piso 3, Valparaíso",
    materia: "Tratar materias propias de su competencia reglamentaria interna.",
    invitados: "Secretarios legislativos de la comisión.",
    week: 33,
    presidente: "Senador Presidente de Ética",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Privada",
    ordenDelDia: [
      "1. Revisión de oficios, resoluciones y requerimientos internos en materia de ética, probidad y transparencia parlamentaria."
    ]
  },
  {
    comision: "Comisión Mixta para Boletín N° 16335-14",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "14:30 a 15:30 hrs",
    lugar: "Sala 7, tercer piso de Comisiones, Valparaíso",
    materia: "Constitución de Comisión Mixta para el proyecto de prevención y mitigación de incendios forestales (Boletín 16335-14).",
    invitados: "Parlamentarios de ambas cámaras integrantes de la comisión mixta.",
    boletin: "16335-14",
    week: 33,
    presidente: "Por definir (Sesión Constitutiva de Mixta)",
    tipoSesion: "Constitutiva",
    canalTransmision: "Streaming Congreso Nacional",
    ordenDelDia: [
      "1. Bol.N° 16335-14: Constitución de la Comisión Mixta que regula la prevención y mitigación de incendios forestales.",
      "2. Elección de Presidente de la instancia legislativa unificada.",
      "3. Acordar las normas de procedimiento y cronograma para resolver las discrepancias del proyecto."
    ]
  },
  {
    comision: "Comisión Especial de Zonas Extremas y Territorios Especiales",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:00 a 16:00 hrs",
    lugar: "Sala 11, Valparaíso",
    materia: "Analizar el contrabando de productos agrícolas en la zona fronteriza norte y sus consecuencias sanitarias y productivas.",
    invitados: "Biministro del Interior y Vocero; Ministro de Agricultura; Directora Nacional de Aduanas; Comisionado Presidencial para la Macrozona Norte.",
    week: 33,
    presidente: "Senador Presidente de Zonas Extremas",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 1",
    ordenDelDia: [
      "1. Analizar de manera intersectorial la situación del contrabando de productos agrícolas por pasos fronterizos de la macrozona norte (Invitados: Biministro del Interior, Ministro de Agricultura, Directora de Aduanas y Comisionado Macrozona Norte)."
    ]
  },
  {
    comision: "Comisión Mixta para Boletín N° 14309-04",
    fechaISO: "Miércoles 12 de Agosto, 2026",
    hora: "15:15 a 16:00 hrs",
    lugar: "Sala 8, Comisiones, Senado, Valparaíso",
    materia: "Constitución de Comisión Mixta sobre el sistema de subvenciones para la modalidad educativa de reingreso (Boletín 14309-04).",
    invitados: "Parlamentarios integrantes de la Comisión Mixta.",
    boletin: "14309-04",
    week: 33,
    presidente: "Por definir (Sesión Constitutiva)",
    tipoSesion: "Constitutiva",
    canalTransmision: "Streaming Congreso Nacional",
    ordenDelDia: [
      "1. Bol.N° 14309-04: Constitución de la Comisión Mixta encargada de proponer forma de resolver discrepancias sobre subvención de modalidad de reingreso educativo.",
      "2. Elegir Presidente de la instancia mixta.",
      "3. Adoptar las normas de procedimiento y coordinación de audiencias técnicas."
    ]
  },
  {
    comision: "Comisión de la Mujer y Equidad de Género",
    fechaISO: "Jueves 13 de Agosto, 2026",
    hora: "10:30 a 13:00 hrs",
    lugar: "Sala de Sesiones Ex Congreso Santiago",
    materia: "SEMINARIO SOBRE VIOLENCIA DIGITAL: Desafíos para su prevención, protección y sanción.",
    invitados: "Aluna Serrano (IDEA Internacional); Representante Corporación Humanas; Laura Mayer (Académica PUCV); Mitza González (Carabineros); Karen Vergara (ONG Amaranta); Juan Pablo Cavada (BCN); Daniela Santana (BCN).",
    week: 33,
    presidente: "Senadora Presidenta de la Mujer",
    tipoSesion: "Especial",
    canalTransmision: "TV Senado / Transmisión Especial Ex Congreso",
    ordenDelDia: [
      "1. Palabras de Apertura e inauguración del seminario técnico (10:30 hrs).",
      "2. Panel 1: Diagnóstico de la violencia digital en Chile, nuevas hipótesis que vulneran la dignidad (Exponen Aluna Serrano, Laura Mayer y Corporación Humanas).",
      "3. Panel 2: Propuestas legislativas y policiales para enfrentar y sancionar la violencia digital (Exponen Generala Mitza González, Karen Vergara, Juan Pablo Cavada y Daniela Santana).",
      "4. Ronda de preguntas del público asistente e inscritos vía correo comisiondelamujer@senado.cl (12:30 hrs)."
    ]
  },
  {
    comision: "Comisión de Minería y Energía",
    fechaISO: "Jueves 13 de Agosto, 2026",
    hora: "11:30 a 13:30 hrs",
    lugar: "I. Municipalidad de Illapel, calle Constitución N° 24",
    materia: "Abordar las principales problemáticas que afectan a la pequeña minería en terreno.",
    invitados: "Dirigentes pirquineros, pequeños mineros de la Provincia de Choapa, Alcalde de Illapel y autoridades comunales.",
    week: 33,
    presidente: "Senadora Yasna Provoste Campillay",
    tipoSesion: "Especial",
    canalTransmision: "Registro en diferido / Coquimbo TV",
    ordenDelDia: [
      "1. Sesión especial descentralizada en la comuna de Illapel para escuchar de primera fuente los requerimientos tributarios, logísticos y de fomento de pirquineros y pequeños mineros."
    ]
  },
  {
    comision: "Comisión de Seguridad Pública",
    fechaISO: "Jueves 13 de Agosto, 2026",
    hora: "15:00 a 18:00 hrs",
    lugar: "Salón Plenario Nelda Panicucci Bianchi, Gobierno Regional, Punta Arenas",
    materia: "Creación de Escuela de Formación de Carabineros en Magallanes; y análisis de crimen organizado patagónico y seguridad marítima austral.",
    invitados: "Ministro Martín Arrau; General Director Marcelo Araya; General Marco Alvarado; especialista Pablo Zeballos; Ministro de Defensa Fernando Barros; Fiscal Regional Cristián Crisosto; Eugenio Campos (UNAC); Vicealmirante Arturo Oxley; Fiscal Julio César Zárate (Argentina); Embajadores de Nueva Zelanda, Australia y Reino Unido.",
    week: 33,
    presidente: "Senador Presidente de Seguridad",
    tipoSesion: "Especial",
    canalTransmision: "TV Senado / Señal Austral Directa",
    ordenDelDia: [
      "1. Bloque 1 (15:00 a 16:30 hrs): Analizar factibilidad y diseño de la Escuela de Formación de Carabineros de Chile en Magallanes (Invitados: Ministro Arrau, General Araya, General Alvarado y especialista Pablo Zeballos).",
      "2. Bloque 2 (16:30 a 18:00 hrs): Seguridad estratégica y crimen organizado en extremo sur, rutas marítimas y soberanía en el Estrecho de Magallanes (Invitados: Ministro de Defensa Fernando Barros, Fiscal Federal Julio Zárate, Embajadores Nicola Somerville, Andrew Martin, David Concar, DIRECTEMAR y PDI)."
    ]
  },
  {
    comision: "Comisión de Seguridad Pública",
    fechaISO: "Viernes 14 de Agosto, 2026",
    hora: "10:00 a 12:00 hrs",
    lugar: "Salón Plenario Nelda Panicucci Bianchi, Gobierno Regional, Punta Arenas",
    materia: "Abordar de forma integral la situación de la explotación sexual de niños, niñas y adolescentes en la región de Magallanes.",
    invitados: "Ministro de Seguridad Pública señor Martín Arrau; Fiscal Regional de Magallanes señor Cristián Crisosto Rifo; Defensor de la Niñez señor Anuar Quesille; especialista señor Pablo Zeballos.",
    week: 33,
    presidente: "Senador Presidente de Seguridad",
    tipoSesion: "Especial",
    canalTransmision: "TV Senado / Señal Austral Directa",
    ordenDelDia: [
      "1. Sesión especial en Punta Arenas para diagnosticar, evaluar y coordinar medidas preventivas frente a la explotación sexual infantil (ESNNA) en el extremo sur (Invitados: Ministro Arrau, Fiscal Regional Crisosto, Defensor Quesille y especialista Zeballos)."
    ]
  },
  {
    comision: "Comisión de Economía",
    fechaISO: "Viernes 14 de Agosto, 2026",
    hora: "12:00 a 15:00 hrs",
    lugar: "Gobierno Regional de Coquimbo, calle Arturo Prat 350, La Serena",
    materia: "Analizar efectos económicos de la catástrofe por el temporal y río atmosférico en Coquimbo, y medidas de apoyo a sectores productivos.",
    invitados: "Ministro de Economía Daniel Mas; Gobernador Regional Cristóbal Juliá; parlamentarios de la región y representantes de gremios agrícolas, pesqueros y comerciales.",
    week: 33,
    presidente: "Senadora Presidenta de Economía",
    tipoSesion: "Especial",
    canalTransmision: "Señal Regional Coquimbo / Diferido TV Senado",
    ordenDelDia: [
      "1. Analizar el impacto económico del reciente temporal y río atmosférico en Coquimbo, levantando necesidades urgentes de pymes y sectores productivos regionales junto al Ministro Daniel Mas y al Gobernador Cristóbal Juliá."
    ]
  },
  {
    comision: "Primera Subcomisión Mixta de Presupuestos",
    fechaISO: "Martes 18 de Agosto, 2026",
    hora: "17:00 a 18:30 hrs",
    lugar: "Sala 7, tercer piso de Comisiones, Valparaíso",
    materia: "Constitución de la Primera Subcomisión Mixta de Presupuestos, elección de presidente y acuerdos de funcionamiento.",
    invitados: "Parlamentarios integrantes de la subcomisión.",
    week: 34,
    presidente: "Por definir (Sesión Constitutiva)",
    tipoSesion: "Constitutiva",
    canalTransmision: "Streaming Congreso Nacional",
    ordenDelDia: [
      "1. Constitución legal de la Primera Subcomisión Mixta para el estudio presupuestario.",
      "2. Elección de Presidente(a).",
      "3. Acordar la agenda de funcionamiento, priorización de partidas ministeriales y citaciones de autoridades."
    ]
  },
  {
    comision: "Comisión Especial de Zonas Extremas y Territorios Especiales",
    fechaISO: "Miércoles 19 de Agosto, 2026",
    hora: "15:00 a 16:00 hrs",
    lugar: "Sala 11, Valparaíso",
    materia: "Recibir al representante de la OPS/OMS en Chile para analizar la situación sanitaria pública en zonas insulares y extremas del país.",
    invitados: "Representante de la OPS/OMS en Chile señor Giovanni Escalante.",
    week: 34,
    presidente: "Senador Presidente de Zonas Extremas",
    tipoSesion: "Ordinaria",
    canalTransmision: "TV Senado / Señal Online 1",
    ordenDelDia: [
      "1. Escuchar la exposición detallada del representante OPS/OMS Giovanni Escalante respecto de la infraestructura médica, brechas asistenciales y planes de salud pública aplicables a las zonas extremas e insulares."
    ]
  },
  {
    comision: "Primera Subcomisión Mixta de Presupuestos",
    fechaISO: "Miércoles 19 de Agosto, 2026",
    hora: "17:00 a 18:30 hrs",
    lugar: "Sala N° 2 de Comisiones del Senado, Valparaíso",
    materia: "Análisis técnico de la ejecución presupuestaria de la Partida 27 (Ministerio de la Mujer y la Equidad de Género).",
    invitados: "Ministra de la Mujer y la Equidad de Género; analistas de la Dirección de Presupuestos (Dipres).",
    week: 34,
    presidente: "Por definir (Miembro electo presidiendo)",
    tipoSesion: "Ordinaria",
    canalTransmision: "Streaming Congreso / Señal Especial Mixta",
    ordenDelDia: [
      "1. Partida 27: Evaluar el estado de ejecución de los fondos asignados al Ministerio de la Mujer y la Equidad de Género, sus programas de prevención de VIF, fomento y equidad, detectando desvíos o necesidades de ajuste sectorial."
    ]
  }
];

export default function CitacionesCamaraWidget({
  setView,
  setSelectedComisionId,
  setSelectedProyectoId,
  followedComs = [],
  toggleFollowCom
}: CitacionesCamaraWidgetProps) {
  // Scopes: "mis-comisiones" | "proximas" | "todas" | "historial"
  const [scope, setScope] = useState<"mis-comisiones" | "proximas" | "todas" | "historial">(
    () => (followedComs && followedComs.length > 0 ? "mis-comisiones" : "proximas")
  );

  const [activeChamber, setActiveChamber] = useState<"camara" | "senado" | "todas">("todas");
  const [selectedCommissionFilter, setSelectedCommissionFilter] = useState<string>("todas");
  const [week, setWeek] = useState<number | "all">("all");
  const [dayFilter, setDayFilter] = useState<"todos" | "lunes" | "martes" | "miercoles" | "jueves" | "viernes">("todos");
  const [typeFilter, setTypeFilter] = useState<"todos" | "Ordinaria" | "Especial">("todos");
  const [onlyWithGuests, setOnlyWithGuests] = useState<boolean>(false);
  const [onlyWithBills, setOnlyWithBills] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"timeline" | "grid" | "table">("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const currentYear = 2026;

  // Tag dataset with chambers
  const allEnrichedCitaciones = useMemo(() => {
    const camaraTagged = CITACIONES_CAMARA.map(c => ({ ...c, chamber: "CD" as const }));
    const senadoTagged = CITACIONES_SENADO.map(c => ({ ...c, chamber: "SR" as const }));
    return [...camaraTagged, ...senadoTagged];
  }, []);

  // Deduplicated unique commissions for the quick-select dropdown
  const uniqueCommissions = useMemo(() => {
    const map = new Map<string, { nombre: string; chamber: "CD" | "SR"; count: number }>();
    for (const c of allEnrichedCitaciones) {
      const key = `${c.chamber}-${c.comision}`;
      if (!map.has(key)) {
        map.set(key, { nombre: c.comision, chamber: c.chamber, count: 1 });
      } else {
        map.get(key)!.count++;
      }
    }
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [allEnrichedCitaciones]);

  // Helper to test if a commission is followed
  const isCommissionFollowed = (comisionNombre: string): boolean => {
    if (!followedComs || followedComs.length === 0) return false;
    const normCard = comisionNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^comisi[oó]n (especial - |de )?/i, "").trim();
    return followedComs.some(f => {
      const normF = f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^comisi[oó]n (especial - |de )?/i, "").trim();
      return normCard.includes(normF) || normF.includes(normCard);
    });
  };

  // Extract day name helper
  const getDayName = (fechaISO: string): string => {
    const fLower = fechaISO.toLowerCase();
    if (fLower.includes("lunes")) return "Lunes";
    if (fLower.includes("martes")) return "Martes";
    if (fLower.includes("miércoles") || fLower.includes("miercoles")) return "Miércoles";
    if (fLower.includes("jueves")) return "Jueves";
    if (fLower.includes("viernes")) return "Viernes";
    return "Otro";
  };

  // Helper to map commission name to canonical ID
  const mapToComisionId = (comisionNombre: string, chamber: "CD" | "SR"): string => {
    const norm = comisionNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (chamber === "SR") {
      if (norm.includes("constitucion")) return "senado-constitucion";
      if (norm.includes("hacienda")) return "senado-hacienda";
      if (norm.includes("trabajo")) return "senado-trabajo-y-prevision";
      if (norm.includes("seguridad")) return "senado-seguridad-publica";
      if (norm.includes("salud")) return "senado-salud";
      if (norm.includes("educacion")) return "senado-educacion";
      if (norm.includes("defensa")) return "senado-defensa";
      if (norm.includes("rree") || norm.includes("relaciones")) return "senado-rree";
      if (norm.includes("gobierno")) return "senado-gobierno";
      if (norm.includes("obras")) return "senado-obras-publicas";
      if (norm.includes("agricultura")) return "senado-agricultura";
      if (norm.includes("medio ambiente")) return "senado-medio-ambiente";
      if (norm.includes("mineria")) return "senado-mineria";
      if (norm.includes("economia")) return "senado-economia";
      if (norm.includes("vivienda")) return "senado-vivienda";
      if (norm.includes("futuro")) return "senado-desafios-futuro";
      if (norm.includes("mujer")) return "senado-mujeres-genero";
      if (norm.includes("infancia") || norm.includes("familia")) return "senado-infancia";
      if (norm.includes("transporte")) return "senado-transportes";
      if (norm.includes("pesca")) return "senado-pesca";
      if (norm.includes("hidricos") || norm.includes("agua")) return "senado-recursos-hidricos";
      if (norm.includes("presupuesto")) return "senado-presupuestos-mixta";
      return "senado-constitucion";
    } else {
      if (norm.includes("constitucion")) return "cd-constitucion";
      if (norm.includes("hacienda")) return "cd-hacienda";
      if (norm.includes("trabajo")) return "cd-trabajo-y-prevision";
      if (norm.includes("seguridad")) return "cd-seguridad";
      if (norm.includes("salud")) return "cd-salud";
      if (norm.includes("educacion")) return "cd-educacion";
      if (norm.includes("defensa")) return "cd-defensa";
      if (norm.includes("rree") || norm.includes("relaciones")) return "cd-rree";
      if (norm.includes("gobierno")) return "cd-gobierno-interior";
      if (norm.includes("obras")) return "cd-obras-publicas";
      if (norm.includes("agricultura")) return "cd-agricultura";
      if (norm.includes("medio ambiente")) return "cd-medio-ambiente";
      if (norm.includes("mineria")) return "cd-mineria";
      if (norm.includes("economia")) return "cd-economia";
      if (norm.includes("vivienda")) return "cd-vivienda";
      if (norm.includes("ciencia")) return "cd-ciencias";
      if (norm.includes("mujer")) return "cd-mujeres-genero";
      if (norm.includes("familia")) return "cd-familias";
      if (norm.includes("cultura")) return "cd-cultura";
      if (norm.includes("deporte")) return "cd-deportes";
      if (norm.includes("pesca")) return "cd-pesca";
      if (norm.includes("hidricos") || norm.includes("agua")) return "cd-recursos-hidricos";
      return "cd-constitucion";
    }
  };

  // Filtered citations with all criteria (followed commissions, upcoming vs past, commission picker)
  const filteredCitaciones = useMemo(() => {
    return allEnrichedCitaciones.filter(c => {
      // Chamber filter
      if (activeChamber === "camara" && c.chamber !== "CD") return false;
      if (activeChamber === "senado" && c.chamber !== "SR") return false;

      // Commission picker filter
      if (selectedCommissionFilter !== "todas" && c.comision !== selectedCommissionFilter) return false;

      // Temporal & Followed Scope Filter:
      // Note: Week 33 (11-14 Agosto) is past; Week 34+ (17-21 Agosto) is active / upcoming
      const isPastSession = c.week <= 33;

      if (scope === "mis-comisiones") {
        // Must be in followed commissions and active/upcoming
        if (!isCommissionFollowed(c.comision)) return false;
        // Exclude past sessions by default in followed view
        if (isPastSession) return false;
      } else if (scope === "proximas") {
        // Exclude past dates
        if (isPastSession) return false;
      } else if (scope === "historial") {
        // Only include past dates
        if (!isPastSession) return false;
      }

      // Week filter (if manually set)
      const matchesWeek = week === "all" || c.week === week;
      if (!matchesWeek) return false;

      // Type filter
      const matchesType = typeFilter === "todos" || c.tipoSesion === typeFilter;
      if (!matchesType) return false;

      // Guest filter
      const matchesGuests = !onlyWithGuests || (Boolean(c.invitados) && c.invitados.trim().length > 0);
      if (!matchesGuests) return false;

      // Bill filter
      const matchesBills = !onlyWithBills || (Boolean(c.boletin) && c.boletin.trim().length > 0);
      if (!matchesBills) return false;
      
      // Day filter
      const dayName = getDayName(c.fechaISO).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const matchesDay = dayFilter === "todos" || dayName === dayFilter;
      if (!matchesDay) return false;

      // Search Query
      const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const ordenStr = Array.isArray(c.ordenDelDia) ? c.ordenDelDia.join(" ") : String(c.ordenDelDia || "");
      const fullText = `${c.comision} ${c.materia} ${c.presidente} ${c.boletin || ""} ${c.invitados || ""} ${c.lugar} ${ordenStr}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const matchesSearch = searchQuery === "" || fullText.includes(q);
      if (!matchesSearch) return false;

      return true;
    });
  }, [allEnrichedCitaciones, activeChamber, selectedCommissionFilter, scope, followedComs, week, typeFilter, onlyWithGuests, onlyWithBills, dayFilter, searchQuery]);

  // Group citations by day of week
  const citationsByDay = useMemo(() => {
    const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Otro"];
    const groups: Record<string, typeof filteredCitaciones> = {};
    for (const d of daysOrder) {
      groups[d] = [];
    }
    for (const cit of filteredCitaciones) {
      const dName = getDayName(cit.fechaISO);
      if (!groups[dName]) groups[dName] = [];
      groups[dName].push(cit);
    }
    return groups;
  }, [filteredCitaciones]);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = filteredCitaciones.length;
    const withGuests = filteredCitaciones.filter(c => Boolean(c.invitados) && c.invitados.trim().length > 0).length;
    const withBills = filteredCitaciones.filter(c => Boolean(c.boletin) && c.boletin.trim().length > 0).length;
    const specials = filteredCitaciones.filter(c => c.tipoSesion === "Especial").length;
    const liveOnline = filteredCitaciones.filter(c => c.canalTransmision && !c.canalTransmision.toLowerCase().includes("privada")).length;
    return { total, withGuests, withBills, specials, liveOnline };
  }, [filteredCitaciones]);

  // Toggle card expansion
  const toggleExpandCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Robust clipboard copy with fallback
  const robustCopyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (err) {
      console.warn("Clipboard copy failed", err);
    }
  };

  // Copy individual citation
  const handleCopyCitacion = (cit: Citacion, e: React.MouseEvent) => {
    e.stopPropagation();
    const chamberLabel = cit.chamber === "SR" ? "Senado de la República" : "Cámara de Diputadas y Diputados";
    const text = `🏛️ CITACIÓN LEGISLATIVA OFICIAL - CONGRESO NACIONAL DE CHILE
📌 Comisión: ${cit.comision} (${chamberLabel})
📅 Fecha: ${cit.fechaISO} (Semana ${cit.week})
⏰ Horario: ${cit.hora}
📍 Sala / Lugar: ${cit.lugar}
👤 Preside: ${cit.presidente}
🔖 Tipo de Sesión: Sesión ${cit.tipoSesion}
${cit.boletin ? `📜 Boletín Asociado: ${cit.boletin}\n` : ""}
📝 Materia en Tabla:
${cit.materia}

📋 Orden del Día:
${cit.ordenDelDia.map(i => `  • ${i}`).join("\n")}
${cit.invitados ? `\n👥 Autoridades e Invitados Citados:\n  ${cit.invitados}` : ""}
📡 Transmisión Oficial: ${cit.canalTransmision}`;

    robustCopyToClipboard(text);
    setCopiedToast(`Citación de "${cit.comision}" copiada`);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Download .ics calendar file
  const handleDownloadICS = (cit: Citacion, e: React.MouseEvent) => {
    e.stopPropagation();
    let year = 2026;
    let month = 8;
    let day = 18;

    const dayMatch = cit.fechaISO.match(/(\d{1,2})\s+de\s+([A-Za-z]+)/i);
    if (dayMatch) {
      day = parseInt(dayMatch[1], 10);
      const mStr = dayMatch[2].toLowerCase();
      const mNames: Record<string, number> = {
        enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
        julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
      };
      if (mNames[mStr]) month = mNames[mStr];
    }

    let sHour = 10, sMin = 0, eHour = 12, eMin = 30;
    const tMatch = cit.hora.match(/(\d{1,2}):(\d{2})\s*a\s*(\d{1,2}):(\d{2})/i);
    if (tMatch) {
      sHour = parseInt(tMatch[1], 10);
      sMin = parseInt(tMatch[2], 10);
      eHour = parseInt(tMatch[3], 10);
      eMin = parseInt(tMatch[4], 10);
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const dtStart = `${year}${pad(month)}${pad(day)}T${pad(sHour)}${pad(sMin)}00`;
    const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(eHour)}${pad(eMin)}00`;
    const chamberLabel = cit.chamber === "SR" ? "Senado de Chile" : "Cámara de Diputadas y Diputados de Chile";

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LegisTrack CL//Legislative Calendar//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:sesion-${Date.now()}-${Math.random().toString(36).substring(2, 7)}@legistrack.cl
DTSTAMP:${dtStart}Z
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:Sesión ${cit.tipoSesion}: ${cit.comision}
DESCRIPTION:Materia: ${cit.materia}\\n\\nOrden del día:\\n${cit.ordenDelDia.join("\\n")}${cit.invitados ? `\\n\\nInvitados:\\n${cit.invitados}` : ""}\\n\\nPreside: ${cit.presidente}\\nTransmisión: ${cit.canalTransmision}
LOCATION:${cit.lugar} (${chamberLabel})
STATUS:CONFIRMED
CATEGORIES:Legislativo,Congreso,Comisiones
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `citacion_${cit.comision.slice(0, 24).replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedToast("Evento .ics descargado para tu calendario");
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Copy full week executive briefing in Markdown
  const handleCopyWeekDigest = () => {
    const lines: string[] = [
      `# 🏛️ MINUTA EJECUTIVA DE CITACIONES - CONGRESO NACIONAL`,
      `*Vista: ${scope === "mis-comisiones" ? "Mis Comisiones Seguidas" : scope === "proximas" ? "Próximas Sesiones Vigentes" : "Agenda Legislativa"} (${currentYear}) | Total convocatorias: ${filteredCitaciones.length}*`,
      ``,
      `| Horario | Corporación | Comisión | Sala | Materia / Boletín | Preside |`,
      `|---|---|---|---|---|---|`
    ];

    for (const c of filteredCitaciones) {
      const corp = c.chamber === "SR" ? "Senado" : "Cámara";
      const bol = c.boletin ? ` (Bol. ${c.boletin})` : "";
      const mat = c.materia.length > 70 ? c.materia.slice(0, 67) + "..." : c.materia;
      lines.push(`| ${c.fechaISO.split(",")[0]} ${c.hora} | ${corp} | ${c.comision} | ${c.lugar.split(",")[0]} | ${mat}${bol} | ${c.presidente} |`);
    }

    lines.push(``, `*Generado por LegisTrack CL - Plataforma de Seguimiento Legislativo del Congreso Nacional de Chile.*`);
    robustCopyToClipboard(lines.join("\n"));
    setCopiedToast("Minuta ejecutiva copiada al portapapeles");
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  // Handle navigate to commission
  const handleGoToCommission = (cit: Citacion, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setSelectedComisionId && setView) {
      const comId = mapToComisionId(cit.comision, cit.chamber || (activeChamber === "senado" ? "SR" : "CD"));
      setSelectedComisionId(comId);
      setView("comision-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle navigate to bill
  const handleGoToProject = (boletinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setSelectedProyectoId && setView) {
      setSelectedProyectoId(boletinId);
      setView("proyecto-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden font-sans" id="citaciones-camara-widget-container">
      {/* Toast Feedback Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-950/95 border border-emerald-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Atmospheric dynamic gradient accents */}
      <div className="absolute -right-28 -top-28 w-72 h-72 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-28 -bottom-28 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* Top Header and Branding Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6 relative z-10">
        <div className="text-left space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Landmark className="w-3 h-3 text-blue-400" />
              Congreso Nacional de Chile
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Agenda Oficial en Vivo
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
              Valparaíso • Año Legislativo {currentYear}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Calendario de Citaciones Semanales
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl font-medium leading-relaxed">
            Acceso unificado y detallado a la tabla, invitados, actas y órdenes del día de cada comisión legislativa.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          <button 
            onClick={handleCopyWeekDigest}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Copiar resumen estructurado de las citaciones visibles en Markdown"
          >
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            <span>Copiar Minuta</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Primary Scope Tabs: [⭐ Mis Comisiones] [📅 Próximas y Hoy] [🌐 Todas] [🕰️ Historial] */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-2 rounded-2xl border border-slate-800 relative z-10">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setScope("mis-comisiones");
              setSelectedCommissionFilter("todas");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              scope === "mis-comisiones"
                ? "bg-amber-500 text-slate-950 shadow-lg font-black border border-amber-400"
                : "text-slate-300 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${scope === "mis-comisiones" ? "fill-slate-950 text-slate-950" : "text-amber-400"}`} />
            <span>Mis Comisiones Seguidas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              scope === "mis-comisiones" ? "bg-slate-900 text-amber-300" : "bg-slate-800 text-slate-400"
            }`}>
              {followedComs.length}
            </span>
          </button>

          <button
            onClick={() => {
              setScope("proximas");
              setSelectedCommissionFilter("todas");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              scope === "proximas"
                ? "bg-blue-600 text-white shadow-lg border border-blue-400/50"
                : "text-slate-300 hover:text-white hover:bg-slate-850"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-300" />
            <span>Próximas y Hoy</span>
          </button>

          <button
            onClick={() => {
              setScope("todas");
              setSelectedCommissionFilter("todas");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              scope === "todas"
                ? "bg-indigo-600 text-white shadow-lg border border-indigo-400/50"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <span>Todas las Comisiones</span>
          </button>

          <button
            onClick={() => {
              setScope("historial");
              setSelectedCommissionFilter("todas");
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              scope === "historial"
                ? "bg-slate-800 text-slate-200 border border-slate-700 shadow-xs"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-850"
            }`}
            title="Ver actas y citaciones de sesiones pasadas"
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial Pasado</span>
          </button>
        </div>

        {/* View Layout Mode Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "timeline" 
                ? "bg-slate-800 text-white shadow-xs border border-slate-700" 
                : "text-slate-400 hover:text-white"
            }`}
            title="Vista de cronograma diario"
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Cronograma</span>
          </button>

          <button 
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid" 
                ? "bg-slate-800 text-white shadow-xs border border-slate-700" 
                : "text-slate-400 hover:text-white"
            }`}
            title="Vista de tarjetas en cuadrícula"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Tarjetas</span>
          </button>

          <button 
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "table" 
                ? "bg-slate-800 text-white shadow-xs border border-slate-700" 
                : "text-slate-400 hover:text-white"
            }`}
            title="Vista de tabla ejecutiva"
          >
            <TableIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-inner backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Citaciones Visibles</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-white">{metrics.total}</span>
            <span className="text-[10px] text-slate-400 font-semibold">sesiones</span>
          </div>
        </div>

        <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-inner backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Con Invitados / Ministros</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-sky-300">{metrics.withGuests}</span>
            <span className="text-[10px] text-slate-400 font-semibold">audiencias</span>
          </div>
        </div>

        <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-inner backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Proyectos en Tabla</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-300">{metrics.withBills}</span>
            <span className="text-[10px] text-slate-400 font-semibold">boletines de ley</span>
          </div>
        </div>

        <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-inner backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Transmisión Online</span>
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-rose-300">{metrics.liveOnline}</span>
            <span className="text-[10px] text-slate-400 font-semibold">canales CDTV / Senado</span>
          </div>
        </div>
      </div>

      {/* Secondary Controls Bar: Chamber Filter & Commission Dropdown Picker */}
      <div className="bg-slate-850/90 border border-slate-800/90 p-3.5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 shadow-md">
        {/* Chamber Selection */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1 hidden sm:inline">
            Corporación:
          </span>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveChamber("todas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChamber === "todas" 
                  ? "bg-indigo-600 text-white shadow-md border border-indigo-500/40" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Ambas Cámaras
            </button>
            <button 
              onClick={() => setActiveChamber("camara")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChamber === "camara" 
                  ? "bg-blue-600 text-white shadow-md border border-blue-500/40" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cámara
            </button>
            <button 
              onClick={() => setActiveChamber("senado")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChamber === "senado" 
                  ? "bg-amber-600 text-white shadow-md border border-amber-500/40" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Senado
            </button>
          </div>
        </div>

        {/* Commission Dropdown Picker */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 hidden md:inline">
            Comisión:
          </span>
          <div className="relative w-full">
            <select
              value={selectedCommissionFilter}
              onChange={(e) => setSelectedCommissionFilter(e.target.value)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none pr-8 truncate"
            >
              <option value="todas">🏛️ Todas las comisiones ({uniqueCommissions.length} disponibles)</option>
              <optgroup label="Cámara de Diputadas y Diputados">
                {uniqueCommissions.filter(c => c.chamber === "CD").map(c => (
                  <option key={`cd-${c.nombre}`} value={c.nombre}>
                    {c.nombre} ({c.count} {c.count === 1 ? 'sesión' : 'sesiones'})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Senado de la República">
                {uniqueCommissions.filter(c => c.chamber === "SR").map(c => (
                  <option key={`sr-${c.nombre}`} value={c.nombre}>
                    {c.nombre} ({c.count} {c.count === 1 ? 'sesión' : 'sesiones'})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedCommissionFilter !== "todas" && (
            <button
              onClick={() => setSelectedCommissionFilter("todas")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
              title="Limpiar filtro de comisión"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col gap-3 relative z-10">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por comisión, materia en tabla, ministro o invitado, presidente, sala o número de boletín..."
            className="w-full bg-slate-850 hover:bg-slate-800/90 border border-slate-800 focus:border-blue-500/60 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner font-semibold"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Day-of-week Pills and Feature Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Day filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Día:</span>
            {[
              { id: "todos", label: "Todos los días" },
              { id: "lunes", label: "Lunes" },
              { id: "martes", label: "Martes" },
              { id: "miercoles", label: "Miércoles" },
              { id: "jueves", label: "Jueves" },
              { id: "viernes", label: "Viernes" }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDayFilter(d.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dayFilter === d.id
                    ? "bg-blue-600 text-white shadow-xs border border-blue-400/50"
                    : "bg-slate-850 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Feature toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyWithGuests(!onlyWithGuests)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                onlyWithGuests
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  : "bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-800"
              }`}
            >
              <Users className="w-3 h-3 text-sky-400" />
              <span>Solo con Invitados</span>
            </button>

            <button
              onClick={() => setOnlyWithBills(!onlyWithBills)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                onlyWithBills
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-800"
              }`}
            >
              <FileText className="w-3 h-3 text-emerald-400" />
              <span>Con Boletín</span>
            </button>

            <button
              onClick={() => setTypeFilter(typeFilter === "Especial" ? "todos" : "Especial")}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                typeFilter === "Especial"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-800"
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Especiales / Urgentes</span>
            </button>

            {(dayFilter !== "todos" || onlyWithGuests || onlyWithBills || typeFilter !== "todos" || searchQuery || selectedCommissionFilter !== "todas") && (
              <button
                onClick={() => {
                  setDayFilter("todos");
                  setOnlyWithGuests(false);
                  setOnlyWithBills(false);
                  setTypeFilter("todos");
                  setSearchQuery("");
                  setSelectedCommissionFilter("todas");
                }}
                className="px-2.5 py-1 text-[11px] font-extrabold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Restablecer Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mt-2">
        {filteredCitaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-850 rounded-2xl border border-dashed border-slate-800 gap-3 text-center p-6">
            <AlertCircle className="w-12 h-12 text-slate-600 animate-bounce" />
            <h4 className="text-base font-extrabold text-slate-200">
              {scope === "mis-comisiones"
                ? "No hay citaciones programadas para tus comisiones seguidas en esta vista"
                : "No se encontraron citaciones para los filtros seleccionados"}
            </h4>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              {scope === "mis-comisiones"
                ? `Actualmente sigues ${followedComs.length} ${followedComs.length === 1 ? "comisión" : "comisiones"}. Puedes ver la agenda de todas las próximas sesiones o seleccionar una comisión específica arriba.`
                : "Intenta cambiar el día de la semana, la corporación o limpiar los términos de búsqueda."}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {scope === "mis-comisiones" ? (
                <>
                  <button 
                    onClick={() => setScope("proximas")}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Ver Próximas Sesiones del Congreso</span>
                  </button>

                  <button 
                    onClick={() => setScope("todas")}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Ver Todas las Comisiones
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setWeek("all");
                    setDayFilter("todos");
                    setOnlyWithGuests(false);
                    setOnlyWithBills(false);
                    setTypeFilter("todos");
                    setSelectedCommissionFilter("todas");
                    setScope("proximas");
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Restaurar filtros y ver agenda vigente
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "timeline" ? (
          /* ========================================================= */
          /* MODE 1: TIMELINE CRONOGRAMA POR DÍA                       */
          /* ========================================================= */
          <div className="flex flex-col gap-8 text-left">
            {(Object.entries(citationsByDay) as [string, Citacion[]][]).map(([dayTitle, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={dayTitle} className="flex flex-col gap-4">
                  {/* Day Sticky Header */}
                  <div className="sticky top-20 z-20 bg-slate-900/90 backdrop-blur-md py-2 border-b border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                      <h4 className="text-base md:text-lg font-black text-white tracking-tight">
                        {dayTitle} ({items[0]?.fechaISO.split(",")[0] || dayTitle})
                      </h4>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                        {items.length} {items.length === 1 ? "sesión" : "sesiones"}
                      </span>
                    </div>
                  </div>

                  {/* Day Sessions List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pl-2 md:pl-4 border-l-2 border-slate-800/80">
                    {items.map((cit, idx) => {
                      const cardId = `timeline-${cit.week}-${cit.comision}-${idx}`;
                      const isExpanded = Boolean(expandedCards[cardId]);
                      const isSR = cit.chamber === "SR";
                      const followed = isCommissionFollowed(cit.comision);

                      return (
                        <div 
                          key={cardId}
                          className="bg-slate-850 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col gap-4 relative overflow-hidden group shadow-lg"
                        >
                          {/* Accent line for chamber */}
                          <div className={`absolute top-0 left-0 right-0 h-[3px] ${isSR ? "bg-amber-500" : "bg-blue-500"}`} />

                          {/* Top Row: Chamber, Week, Type, Bookmark & Quick Actions */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                isSR ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                              }`}>
                                {isSR ? "Senado" : "Cámara"}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                cit.tipoSesion === "Especial" 
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30" 
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}>
                                {cit.tipoSesion}
                              </span>

                              {followed && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                                  <span>Seguida</span>
                                </span>
                              )}
                            </div>

                            {/* Bookmark & Quick Share/ICS icons */}
                            <div className="flex items-center gap-1.5">
                              {toggleFollowCom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFollowCom(cit.comision);
                                    setCopiedToast(followed ? `Dejaste de seguir ${cit.comision}` : `⭐ Siguiendo ${cit.comision}`);
                                    setTimeout(() => setCopiedToast(null), 3000);
                                  }}
                                  title={followed ? "Siguiendo esta comisión (clic para dejar de seguir)" : "Seguir esta comisión"}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                                    followed
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                      : "bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-750 border-slate-700"
                                  }`}
                                >
                                  <Star className={`w-3.5 h-3.5 ${followed ? "fill-amber-400 text-amber-400" : ""}`} />
                                </button>
                              )}

                              <button 
                                onClick={(e) => handleCopyCitacion(cit, e)}
                                title="Copiar citación oficial"
                                className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleDownloadICS(cit, e)}
                                title="Descargar evento .ics para tu calendario"
                                className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Commission Title (Clickable) */}
                          <div className="space-y-1">
                            <h5 
                              onClick={(e) => handleGoToCommission(cit, e)}
                              className="text-base font-extrabold text-white leading-snug group-hover:text-blue-300 transition-colors cursor-pointer flex items-center justify-between gap-2"
                              title="Ver ficha completa de comisión"
                            >
                              <span>{cit.comision}</span>
                              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 shrink-0 group-hover:translate-x-0.5 transition-all" />
                            </h5>
                          </div>

                          {/* Time and Location Box */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>{cit.hora}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate" title={cit.lugar}>{cit.lugar}</span>
                            </div>
                          </div>

                          {/* Main Matter */}
                          <div className="space-y-1 text-xs text-slate-300">
                            <span className="font-extrabold text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              Materia en Tabla:
                            </span>
                            <p className="leading-relaxed font-semibold text-slate-200">
                              {cit.materia}
                            </p>
                          </div>

                          {/* Collapsible Order of the Day */}
                          <div className="border-t border-slate-800/80 pt-2.5">
                            <button
                              onClick={() => toggleExpandCard(cardId)}
                              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 text-xs font-extrabold transition-colors py-1 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
                                Orden del Día ({cit.ordenDelDia.length} puntos)
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isExpanded && (
                              <ul className="space-y-1.5 mt-2 pl-3 border-l border-blue-500/40 animate-fade-in text-xs text-slate-300">
                                {cit.ordenDelDia.map((point, pIdx) => (
                                  <li key={pIdx} className="leading-relaxed">
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Guests and Authorities Box */}
                          {cit.invitados && (
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                              <span className="font-extrabold text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                                <Users className="w-3.5 h-3.5 text-sky-400" />
                                Autoridades e Invitados Citados:
                              </span>
                              <p className="text-slate-300 leading-relaxed font-medium">
                                {cit.invitados}
                              </p>
                            </div>
                          )}

                          {/* Card Footer: President, Bulletin Badge & Live Channel */}
                          <div className="mt-auto pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="text-[11px] truncate max-w-[200px]">Preside: <strong className="text-slate-300">{cit.presidente}</strong></span>
                            </div>

                            {cit.boletin && (
                              <button 
                                onClick={(e) => handleGoToProject(cit.boletin!, e)}
                                className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Ver expediente del boletín de ley"
                              >
                                <span>Bol. {cit.boletin}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Live Transmission Ribbon */}
                          <div className="bg-slate-900 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold text-slate-300 border border-slate-800">
                            <div className="flex items-center gap-2">
                              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                              <span>{cit.canalTransmision}</span>
                            </div>
                            <button
                              onClick={(e) => handleGoToCommission(cit, e)}
                              className="text-[10px] uppercase tracking-wider text-blue-400 hover:text-blue-300 font-black flex items-center gap-1 cursor-pointer"
                            >
                              Ver Comisión
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === "grid" ? (
          /* ========================================================= */
          /* MODE 2: BENTO GRID VIEW                                   */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {filteredCitaciones.map((cit, idx) => {
              const cardId = `grid-${cit.week}-${cit.comision}-${idx}`;
              const isExpanded = Boolean(expandedCards[cardId]);
              const isSR = cit.chamber === "SR";
              const followed = isCommissionFollowed(cit.comision);

              return (
                <div 
                  key={cardId} 
                  className="bg-slate-850 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col gap-4 relative overflow-hidden group shadow-lg"
                >
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${isSR ? "bg-amber-500" : "bg-blue-500"}`} />

                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        isSR ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      }`}>
                        {isSR ? "Senado" : "Cámara"}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {cit.fechaISO.split(",")[0]}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        cit.tipoSesion === "Especial" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}>
                        {cit.tipoSesion}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {toggleFollowCom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowCom(cit.comision);
                            setCopiedToast(followed ? `Dejaste de seguir ${cit.comision}` : `⭐ Siguiendo ${cit.comision}`);
                            setTimeout(() => setCopiedToast(null), 3000);
                          }}
                          title={followed ? "Siguiendo esta comisión" : "Seguir esta comisión"}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                            followed
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-750 border-slate-700"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${followed ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      )}

                      <button 
                        onClick={(e) => handleCopyCitacion(cit, e)}
                        title="Copiar citación oficial"
                        className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDownloadICS(cit, e)}
                        title="Descargar evento .ics"
                        className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Commission Title */}
                  <h4 
                    onClick={(e) => handleGoToCommission(cit, e)}
                    className="text-base font-extrabold text-white leading-snug group-hover:text-blue-300 transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <span>{cit.comision}</span>
                    {followed && <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 shrink-0 group-hover:translate-x-0.5 transition-all" />
                  </h4>

                  {/* Hour and Room */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{cit.hora}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate" title={cit.lugar}>{cit.lugar}</span>
                    </div>
                  </div>

                  {/* Matter */}
                  <div className="space-y-1 text-xs text-slate-300">
                    <span className="font-extrabold text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Materia Principal:
                    </span>
                    <p className="leading-relaxed font-semibold text-slate-200">
                      {cit.materia}
                    </p>
                  </div>

                  {/* Order of the Day */}
                  <div className="border-t border-slate-800/80 pt-2.5">
                    <button
                      onClick={() => toggleExpandCard(cardId)}
                      className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 text-xs font-extrabold transition-colors py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
                        Orden del Día ({cit.ordenDelDia.length} puntos)
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <ul className="space-y-1.5 mt-2 pl-3 border-l border-blue-500/40 animate-fade-in text-xs text-slate-300">
                        {cit.ordenDelDia.map((point, pIdx) => (
                          <li key={pIdx} className="leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Guests */}
                  {cit.invitados && (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                      <span className="font-extrabold text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        Invitados y Autoridades:
                      </span>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {cit.invitados}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-400 font-bold">
                      Preside: <strong className="text-slate-300">{cit.presidente}</strong>
                    </span>
                    {cit.boletin && (
                      <button 
                        onClick={(e) => handleGoToProject(cit.boletin!, e)}
                        className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Bol. {cit.boletin}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Live Stream */}
                  <div className="bg-slate-900 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold text-slate-300 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>{cit.canalTransmision}</span>
                    </div>
                    <button
                      onClick={(e) => handleGoToCommission(cit, e)}
                      className="text-[10px] uppercase tracking-wider text-blue-400 hover:text-blue-300 font-black"
                    >
                      Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* MODE 3: EXECUTIVE TABLE / MINUTA VIEW                     */
          /* ========================================================= */
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-850 shadow-xl text-left">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 px-4">Día & Horario</th>
                  <th className="py-3 px-3">Cámara</th>
                  <th className="py-3 px-4">Comisión</th>
                  <th className="py-3 px-3">Lugar / Sala</th>
                  <th className="py-3 px-4">Materia / Boletín</th>
                  <th className="py-3 px-3">Invitados</th>
                  <th className="py-3 px-3">Preside</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-semibold">
                {filteredCitaciones.map((cit, idx) => {
                  const isSR = cit.chamber === "SR";
                  const followed = isCommissionFollowed(cit.comision);

                  return (
                    <tr key={idx} className="hover:bg-slate-800/60 transition-colors group">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-white text-xs">{cit.fechaISO.split(",")[0]}</div>
                        <div className="text-[11px] text-blue-400 font-mono font-bold mt-0.5">{cit.hora}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                          isSR ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        }`}>
                          {isSR ? "Senado" : "Cámara"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={(e) => handleGoToCommission(cit, e)}
                            className="font-extrabold text-white hover:text-blue-300 cursor-pointer transition-colors block"
                          >
                            {cit.comision}
                          </span>
                          {followed && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{cit.canalTransmision}</span>
                      </td>
                      <td className="py-3.5 px-3 min-w-[150px] text-slate-400 text-[11px]">
                        {cit.lugar}
                      </td>
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <p className="line-clamp-2 text-xs text-slate-200 font-medium leading-relaxed">
                          {cit.materia}
                        </p>
                        {cit.boletin && (
                          <button 
                            onClick={(e) => handleGoToProject(cit.boletin!, e)}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-extrabold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded hover:bg-blue-900 transition-colors cursor-pointer"
                          >
                            Boletín {cit.boletin} <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-3 max-w-[180px] text-[11px] text-slate-400">
                        {cit.invitados ? (
                          <span className="line-clamp-2" title={cit.invitados}>{cit.invitados}</span>
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px]">Sin audiencia externa</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-300 text-[11px]">
                        {cit.presidente}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {toggleFollowCom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFollowCom(cit.comision);
                                setCopiedToast(followed ? `Dejaste de seguir ${cit.comision}` : `⭐ Siguiendo ${cit.comision}`);
                                setTimeout(() => setCopiedToast(null), 3000);
                              }}
                              title={followed ? "Siguiendo" : "Seguir"}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                followed
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : "bg-slate-800 hover:bg-slate-750 text-slate-400 border-slate-700"
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${followed ? "fill-amber-400" : ""}`} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => handleCopyCitacion(cit, e)}
                            title="Copiar citación"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => handleDownloadICS(cit, e)}
                            title="Descargar .ics"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
