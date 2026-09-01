/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OWIDDataPoint {
  year: number;
  chile: number;
  oecd_avg?: number;
  latam_avg?: number;
  annotation?: string;
}

export interface RegionalDataPoint {
  region: string;
  codigo: string;
  valor: number;
  poblacion?: number;
}

export interface HitoLegislativo {
  year: number;
  ley: string;
  boletin?: string;
  descripcion: string;
}

export interface OWIDIndicator {
  id: string;
  titulo: string;
  subtitulo: string;
  categoria: "energia-clima" | "pobreza-empleo" | "salud-esperanza" | "seguridad-justicia" | "educacion-ciencia" | "elecciones-bcn" | "territorio-siit" | "mineria-economia" | "agricultura-fao" | "educacion-mineduc" | "ine-estadisticas" | "pesca-sernapesca";
  unidad: string;
  fuente: string;
  urlFuente?: string;
  definicion: string;
  frecuencia: string;
  serieHistorica: OWIDDataPoint[];
  datosRegionales?: RegionalDataPoint[];
  hitosLegislativos?: HitoLegislativo[];
  sintesisDiagnostica: string;
}

export interface OWIDTopic {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
  indicadores: string[];
}

export const OWID_TOPICS: Record<string, OWIDTopic> = {
  "energia-clima": {
    id: "energia-clima",
    nombre: "Energía & Clima",
    icono: "Zap",
    color: "#f59e0b",
    descripcion: "Transición energética, penetración renovable solar/eólica y emisiones per cápita de CO₂.",
    indicadores: ["matriz-renovable-pct", "emisiones-co2-percapita", "capacidad-instalada-solar"]
  },
  "pobreza-empleo": {
    id: "pobreza-empleo",
    nombre: "Pobreza & Empleo",
    icono: "Briefcase",
    color: "#3b82f6",
    descripcion: "Pobreza multidimensional CASEN, salario mínimo real, empleo y gasto fiscal de reformas laborales.",
    indicadores: ["pobreza-multidimensional-pct", "salario-minimo-real-clp", "informalidad-laboral-pct"]
  },
  "salud-esperanza": {
    id: "salud-esperanza",
    nombre: "Salud & Bienestar",
    icono: "Activity",
    color: "#ec4899",
    descripcion: "Gasto en salud como % del PIB, esperanza de vida y tiempos de espera en el sistema público.",
    indicadores: ["gasto-salud-pct-pib", "esperanza-vida-anos", "tiempos-espera-quirurgica"]
  },
  "seguridad-justicia": {
    id: "seguridad-justicia",
    nombre: "Seguridad & CEAD",
    icono: "Shield",
    color: "#ef4444",
    descripcion: "Estadísticas del Centro de Estudios y Análisis del Delito (CEAD - SPD): Casos policiales DMCS Carabineros/PDI, victimización ENUSC, homicidios y población penal.",
    indicadores: ["tasa-homicidios-100k", "cead-delitos-mayor-connotacion", "cead-enusc-victimizacion", "cead-violencia-intrafamiliar", "poblacion-penal-total", "gasto-seguridad-dipres"]
  },
  "elecciones-bcn": {
    id: "elecciones-bcn",
    nombre: "Elecciones SERVEL & BCN",
    icono: "Vote",
    color: "#8b5cf6",
    descripcion: "Series completas del Servicio Electoral (SERVEL) y BCN: participación histórica 1989-2026, padrón, plebiscitos y representación.",
    indicadores: ["participacion-electoral-pct", "padron-electoral-nacional", "plebiscitos-historicos-chile", "representacion-femenina-pct", "fragmentacion-parlamentaria"]
  },
  "territorio-siit": {
    id: "territorio-siit",
    nombre: "Territorio SIIT",
    icono: "MapPin",
    color: "#06b6d4",
    descripcion: "Estadísticas territoriales oficiales de las 16 regiones de Chile según BCN SIIT.",
    indicadores: ["inversion-fndr-regional", "presupuesto-municipal-percapita", "areas-verdes-m2-hab"]
  },
  "agricultura-fao": {
    id: "agricultura-fao",
    nombre: "Agricultura & FAO",
    icono: "Sprout",
    color: "#16a34a",
    descripcion: "Producción frutícola, cereales, seguridad alimentaria (ODS 2) y superficie forestal según FAOSTAT (ONU).",
    indicadores: ["fao-exportaciones-fruticolas", "fao-seguridad-alimentaria", "fao-superficie-forestal", "fao-produccion-vinicola"]
  },
  "mineria-economia": {
    id: "mineria-economia",
    nombre: "Minería & DIPRES",
    icono: "TrendingUp",
    color: "#10b981",
    descripcion: "Producción de cobre/litio, recaudación por Royalty Minero y carga presupuestaria DIPRES.",
    indicadores: ["recaudacion-royalty-uf", "produccion-litio-lce", "gasto-fiscal-leyes-dipres"]
  },
  "educacion-mineduc": {
    id: "educacion-mineduc",
    nombre: "Educación & MINEDUC",
    icono: "GraduationCap",
    color: "#6366f1",
    descripcion: "Estadísticas del Centro de Estudios MINEDUC: matrícula escolar por dependencia (SLEP/Municipal/Subvencionado), asistencia y gratuidad universitaria.",
    indicadores: ["mineduc-matricula-dependencia", "mineduc-asistencia-desvinculacion", "mineduc-gratuidad-superior", "mineduc-alumnos-sep"]
  },
  "ine-estadisticas": {
    id: "ine-estadisticas",
    nombre: "INE & Economía Nacional",
    icono: "BarChart3",
    color: "#0284c7",
    descripcion: "Estadísticas oficiales del Instituto Nacional de Estadísticas (INE Chile): IPC, inflación, empleo ENE, informalidad laboral y proyecciones de población.",
    indicadores: ["ine-ipc-inflacion-anual", "ine-tasa-desempleo-ene", "ine-informalidad-laboral", "ine-censo-poblacion"]
  },
  "pesca-sernapesca": {
    id: "pesca-sernapesca",
    nombre: "Pesca & SERNAPESCA",
    icono: "Fish",
    color: "#0284c7",
    descripcion: "Estadísticas del Servicio Nacional de Pesca y Acuicultura: cosechas de salmónidos, desembarques extractivos (jurel/anchoveta) y Registro Pesquero Artesanal.",
    indicadores: ["sernapesca-cosechas-salmon-acuicultura", "sernapesca-desembarque-pesquero-total", "sernapesca-registro-pesca-artesanal"]
  }
};

export const OWID_INDICATORS: Record<string, OWIDIndicator> = {
  "matriz-renovable-pct": {
    id: "matriz-renovable-pct",
    titulo: "Participación de Energías Renovables No Convencionales (ERNC) en la Matriz Eléctrica",
    subtitulo: "Porcentaje de generación eléctrica proveniente de fuentes solar, eólica, biomasa y geotermia sobre la generación bruta total en Chile vs benchmarks internacionales.",
    categoria: "energia-clima",
    unidad: "% de la generación eléctrica",
    fuente: "Coordinador Eléctrico Nacional / Ministerio de Energía / Our World in Data (OWID)",
    urlFuente: "https://ourworldindata.org/renewable-energy",
    definicion: "Mide la proporción de energía generada por fuentes renovables solares, eólicas y geotérmicas en el Sistema Eléctrico Nacional (SEN), excluyendo gran hidroelectricidad convencional.",
    frecuencia: "Anual (Series 2000 - 2026)",
    serieHistorica: [
      { year: 2000, chile: 1.2, oecd_avg: 4.8, latam_avg: 3.5, annotation: "Inicio Ley Corta I Eléctrica" },
      { year: 2004, chile: 2.1, oecd_avg: 6.2, latam_avg: 4.1 },
      { year: 2008, chile: 3.8, oecd_avg: 8.5, latam_avg: 5.4, annotation: "Ley 20.257 de Fomento a las ERNC" },
      { year: 2012, chile: 7.4, oecd_avg: 12.1, latam_avg: 7.2 },
      { year: 2014, chile: 11.2, oecd_avg: 14.5, latam_avg: 8.9 },
      { year: 2016, chile: 15.6, oecd_avg: 17.2, latam_avg: 11.0, annotation: "Licitaciones de Suministro Récord Solar" },
      { year: 2018, chile: 19.8, oecd_avg: 20.4, latam_avg: 13.8 },
      { year: 2020, chile: 25.4, oecd_avg: 24.1, latam_avg: 16.5, annotation: "Plan de Descarbonización Acelerada" },
      { year: 2022, chile: 31.8, oecd_avg: 28.6, latam_avg: 19.8, annotation: "Ley 21.455 de Cambio Climático" },
      { year: 2024, chile: 38.6, oecd_avg: 33.2, latam_avg: 23.4, annotation: "Ley de Transición y Almacenamiento" },
      { year: 2025, chile: 42.4, oecd_avg: 35.8, latam_avg: 25.1 },
      { year: 2026, chile: 46.1, oecd_avg: 38.0, latam_avg: 27.0, annotation: "Meta 50% ERNC proyectada" }
    ],
    datosRegionales: [
      { region: "Antofagasta", codigo: "II", valor: 68.4, poblacion: 709000 },
      { region: "Atacama", codigo: "III", valor: 74.2, poblacion: 319000 },
      { region: "Coquimbo", codigo: "IV", valor: 58.1, poblacion: 869000 },
      { region: "Tarapacá", codigo: "I", valor: 54.6, poblacion: 400000 },
      { region: "Biobío", codigo: "VIII", valor: 42.3, poblacion: 1681000 },
      { region: "Metropolitana", codigo: "RM", valor: 28.5, poblacion: 8420000 },
      { region: "Valparaíso", codigo: "V", valor: 24.8, poblacion: 2010000 },
      { region: "Los Lagos", codigo: "X", valor: 36.2, poblacion: 907000 },
      { region: "Aysén", codigo: "XI", valor: 18.4, poblacion: 108000 },
      { region: "Magallanes", codigo: "XII", valor: 22.1, poblacion: 182000 }
    ],
    hitosLegislativos: [
      { year: 2008, ley: "Ley N° 20.257", boletin: "4.332-08", descripcion: "Establece la primera cuota obligatoria de 10% de ERNC para generadoras eléctricas." },
      { year: 2013, ley: "Ley N° 20.698", boletin: "8.989-08", descripcion: "Ley '20/25': eleva la meta de ERNC al 20% para el año 2025 (cumplida anticipadamente en 2020)." },
      { year: 2022, ley: "Ley N° 21.505", boletin: "15.033-08", descripcion: "Promueve el almacenamiento de energía eléctrica y la electromovilidad a gran escala." }
    ],
    sintesisDiagnostica: "Chile se ha consolidado como uno de los líderes mundiales en la velocidad de descarbonización de su matriz eléctrica, superando el promedio de la OCDE en 2020 gracias a la radiación del Desierto de Atacama y fuertes vientos costeros."
  },

  "emisiones-co2-percapita": {
    id: "emisiones-co2-percapita",
    titulo: "Emisiones de Dióxido de Carbono (CO₂) per cápita",
    subtitulo: "Toneladas métricas de CO₂ emitidas por habitante al año procedentes del consumo de combustibles fósiles y procesos industriales.",
    categoria: "energia-clima",
    unidad: "Toneladas de CO₂ / habitante",
    fuente: "Global Carbon Project / Our World in Data / Ministerio del Medio Ambiente",
    urlFuente: "https://ourworldindata.org/co2-emissions",
    definicion: "Mide las emisiones territoriales de CO₂ divididas por la población total anual.",
    frecuencia: "Anual (Series 1990 - 2026)",
    serieHistorica: [
      { year: 1990, chile: 2.4, oecd_avg: 10.8, latam_avg: 2.1 },
      { year: 1995, chile: 3.1, oecd_avg: 11.2, latam_avg: 2.3 },
      { year: 2000, chile: 3.8, oecd_avg: 11.5, latam_avg: 2.5 },
      { year: 2005, chile: 4.2, oecd_avg: 11.4, latam_avg: 2.6 },
      { year: 2010, chile: 4.6, oecd_avg: 10.2, latam_avg: 2.8 },
      { year: 2015, chile: 4.9, oecd_avg: 9.4, latam_avg: 2.9, annotation: "Pico de emisiones por termoeléctricas" },
      { year: 2018, chile: 4.8, oecd_avg: 9.0, latam_avg: 2.8 },
      { year: 2020, chile: 4.3, oecd_avg: 8.1, latam_avg: 2.6 },
      { year: 2022, chile: 4.1, oecd_avg: 8.3, latam_avg: 2.7, annotation: "Ley Marco de Cambio Climático (Ley 21.455)" },
      { year: 2024, chile: 3.7, oecd_avg: 7.8, latam_avg: 2.6 },
      { year: 2026, chile: 3.4, oecd_avg: 7.3, latam_avg: 2.5, annotation: "Cierre programado de centrales a carbón" }
    ],
    sintesisDiagnostica: "Chile mantiene una huella per cápita sustancialmente menor que el promedio de la OCDE (menos de la mitad), iniciando una trayectoria de reducción continua hacia la meta de carbono neutralidad 2050 fijada por la Ley Marco de Cambio Climático."
  },

  "capacidad-instalada-solar": {
    id: "capacidad-instalada-solar",
    titulo: "Capacidad Instalada de Generación Solar Fotovoltaica (MW)",
    subtitulo: "Megavatios (MW) netos de potencia solar fotovoltaica conectada al Sistema Eléctrico Nacional (SEN).",
    categoria: "energia-clima",
    unidad: "Megavatios (MW)",
    fuente: "Comisión Nacional de Energía (CNE) / ACERA / Coordinador Eléctrico",
    urlFuente: "https://www.cne.cl",
    definicion: "Potencia neta instalada y autorizada para inyectar energía a la red de transmisión eléctrica.",
    frecuencia: "Anual (Series 2012 - 2026)",
    serieHistorica: [
      { year: 2012, chile: 12, annotation: "Primera planta solar a escala comercial" },
      { year: 2014, chile: 420 },
      { year: 2016, chile: 1610 },
      { year: 2018, chile: 2450 },
      { year: 2020, chile: 3820, annotation: "Despegue masivo en Antofagasta y Atacama" },
      { year: 2022, chile: 6450 },
      { year: 2024, chile: 9800, annotation: "Cerca de 10.000 MW solares en operación" },
      { year: 2026, chile: 12400, annotation: "Proyección con almacenamiento BESS" }
    ],
    datosRegionales: [
      { region: "Antofagasta", codigo: "II", valor: 4850, poblacion: 709000 },
      { region: "Atacama", codigo: "III", valor: 3920, poblacion: 319000 },
      { region: "Tarapacá", codigo: "I", valor: 1450, poblacion: 400000 },
      { region: "Coquimbo", codigo: "IV", valor: 980, poblacion: 869000 },
      { region: "Metropolitana", codigo: "RM", valor: 650, poblacion: 8420000 },
      { region: "Valparaíso", codigo: "V", valor: 420, poblacion: 2010000 }
    ],
    hitosLegislativos: [
      { year: 2022, ley: "Ley N° 21.505", boletin: "15.033-08", descripcion: "Habilita la participación de sistemas de almacenamiento independientes (BESS) en el mercado eléctrico." }
    ],
    sintesisDiagnostica: "El crecimiento solar de Chile ha sido calificado como exponencial por la Agencia Internacional de Energía (IEA), multiplicando por 1.000 su capacidad en poco más de una década."
  },

  "pobreza-multidimensional-pct": {
    id: "pobreza-multidimensional-pct",
    titulo: "Tasa de Pobreza Multidimensional de la Población (Encuesta CASEN)",
    subtitulo: "Porcentaje de personas que viven en hogares con carencias críticas en Educación, Salud, Trabajo, Vivienda y Redes Sociales.",
    categoria: "pobreza-empleo",
    unidad: "% de la población",
    fuente: "Ministerio de Desarrollo Social y Familia (CASEN) / BCN SIIT Estadísticas Territoriales",
    urlFuente: "https://www.bcn.cl/siit/estadisticasterritoriales",
    definicion: "Métrica que evalúa carencias simultáneas en 5 dimensiones fundamentales del bienestar familiar según la metodología oficial de Oxford/PNUD adaptada para Chile.",
    frecuencia: "Bienal / Trienal (Series 2009 - 2026)",
    serieHistorica: [
      { year: 2009, chile: 27.4, oecd_avg: 14.2, latam_avg: 36.8 },
      { year: 2011, chile: 24.8, oecd_avg: 13.8, latam_avg: 34.2 },
      { year: 2013, chile: 21.2, oecd_avg: 13.5, latam_avg: 31.5 },
      { year: 2015, chile: 19.1, oecd_avg: 13.1, latam_avg: 29.8, annotation: "Ampliación de 4 a 5 dimensiones CASEN" },
      { year: 2017, chile: 17.5, oecd_avg: 12.8, latam_avg: 28.4 },
      { year: 2020, chile: 19.8, oecd_avg: 13.9, latam_avg: 32.1, annotation: "Impacto Pandemia COVID-19" },
      { year: 2022, chile: 16.9, oecd_avg: 12.4, latam_avg: 27.5, annotation: "CASEN 2022: Mínimo histórico" },
      { year: 2024, chile: 15.2, oecd_avg: 12.0, latam_avg: 26.0 },
      { year: 2026, chile: 14.1, oecd_avg: 11.6, latam_avg: 24.8, annotation: "Proyección con subsidios focalizados" }
    ],
    datosRegionales: [
      { region: "La Araucanía", codigo: "IX", valor: 25.3, poblacion: 1028000 },
      { region: "Ñuble", codigo: "XVI", valor: 24.1, poblacion: 517000 },
      { region: "Maule", codigo: "VII", valor: 21.8, poblacion: 1162000 },
      { region: "Tarapacá", codigo: "I", valor: 21.2, poblacion: 400000 },
      { region: "Los Lagos", codigo: "X", valor: 19.5, poblacion: 907000 },
      { region: "Biobío", codigo: "VIII", valor: 18.2, poblacion: 1681000 },
      { region: "Valparaíso", codigo: "V", valor: 17.4, poblacion: 2010000 },
      { region: "Metropolitana", codigo: "RM", valor: 14.6, poblacion: 8420000 },
      { region: "Antofagasta", codigo: "II", valor: 13.8, poblacion: 709000 },
      { region: "Magallanes", codigo: "XII", valor: 8.7, poblacion: 182000 }
    ],
    hitosLegislativos: [
      { year: 2016, ley: "Ley N° 20.911", boletin: "9.901-04", descripcion: "Crea el Plan de Formación Ciudadana y refuerza derechos sociales escolares." },
      { year: 2022, ley: "Ley N° 21.431", boletin: "13.496-13", descripcion: "Regula el contrato de trabajadores de empresas de plataformas digitales (mitigación de informalidad)." },
      { year: 2024, ley: "Ley N° 21.713", boletin: "16.650-05", descripcion: "Cumplimiento tributario y financiamiento para la Pensión Garantizada Universal (PGU)." }
    ],
    sintesisDiagnostica: "La pobreza multidimensional en Chile ha caído más de 13 puntos porcentuales desde 2009. No obstante, persisten marcadas brechas territoriales: La Araucanía y Ñuble duplican la tasa de la Región de Magallanes."
  },

  "salario-minimo-real-clp": {
    id: "salario-minimo-real-clp",
    titulo: "Evolución del Ingreso Mínimo Mensual Real (Ajustado por Inflación)",
    subtitulo: "Salario mínimo nominal y real deflactado por el Índice de Precios al Consumidor (IPC base 2024) en pesos chilenos.",
    categoria: "pobreza-empleo",
    unidad: "Pesos chilenos (CLP constantes)",
    fuente: "Ministerio de Hacienda / Dirección del Trabajo / DIPRES",
    urlFuente: "https://www.dipres.gob.cl",
    definicion: "Monto del salario mínimo mensual legal para trabajadores mayores de 18 y hasta 65 años, expresado en poder adquisitivo constante.",
    frecuencia: "Anual (Series 2000 - 2026)",
    serieHistorica: [
      { year: 2000, chile: 210000, annotation: "Ley 19.682: Salario en $100.000 nominales" },
      { year: 2004, chile: 235000 },
      { year: 2008, chile: 260000 },
      { year: 2012, chile: 295000 },
      { year: 2016, chile: 340000 },
      { year: 2018, chile: 368000, annotation: "Ley 21.112: Reajuste plurianual" },
      { year: 2020, chile: 382000 },
      { year: 2022, chile: 405000, annotation: "Ley 21.456: Alza histórica a $400k" },
      { year: 2024, chile: 500000, annotation: "Ley 21.578: Meta de $500.000 alcanzada en julio 2024" },
      { year: 2025, chile: 520000 },
      { year: 2026, chile: 540000, annotation: "Reajuste con mecanismo indexado al IPC" }
    ],
    sintesisDiagnostica: "El ingreso mínimo real experimentó el mayor incremento de los últimos 25 años tras la promulgación de la Ley 21.578, complementada con subsidios transitorios a las micro, pequeñas y medianas empresas (MIPYMES)."
  },

  "informalidad-laboral-pct": {
    id: "informalidad-laboral-pct",
    titulo: "Tasa de Ocupación Informal en el Mercado del Trabajo",
    subtitulo: "Porcentaje de personas ocupadas que carecen de cotizaciones de salud y previsión social obligatoria.",
    categoria: "pobreza-empleo",
    unidad: "% de la fuerza laboral ocupada",
    fuente: "Instituto Nacional de Estadísticas (INE) - Encuesta Nacional de Empleo (ENE)",
    urlFuente: "https://www.ine.gob.cl",
    definicion: "Trabajadores dependientes sin contrato escriturado y trabajadores por cuenta propia en unidades económicas no registradas.",
    frecuencia: "Trimestral / Anual (Series 2017 - 2026)",
    serieHistorica: [
      { year: 2017, chile: 29.8, latam_avg: 53.4 },
      { year: 2018, chile: 28.5, latam_avg: 52.8 },
      { year: 2019, chile: 28.2, latam_avg: 52.5 },
      { year: 2020, chile: 25.6, latam_avg: 49.8, annotation: "Retiro temporal de cuenta propia por cuarentenas" },
      { year: 2021, chile: 27.9, latam_avg: 51.2 },
      { year: 2022, chile: 27.4, latam_avg: 50.8 },
      { year: 2023, chile: 27.2, latam_avg: 50.4, annotation: "Ley de 40 Horas (Ley 21.561)" },
      { year: 2024, chile: 26.8, latam_avg: 49.9 },
      { year: 2026, chile: 25.5, latam_avg: 48.5, annotation: "Efecto formalización PGU y Ley Cumplimiento" }
    ],
    datosRegionales: [
      { region: "La Araucanía", codigo: "IX", valor: 36.4, poblacion: 1028000 },
      { region: "Ñuble", codigo: "XVI", valor: 35.1, poblacion: 517000 },
      { region: "Maule", codigo: "VII", valor: 32.8, poblacion: 1162000 },
      { region: "Tarapacá", codigo: "I", valor: 31.5, poblacion: 400000 },
      { region: "Los Lagos", codigo: "X", valor: 29.2, poblacion: 907000 },
      { region: "Valparaíso", codigo: "V", valor: 28.4, poblacion: 2010000 },
      { region: "Biobío", codigo: "VIII", valor: 27.9, poblacion: 1681000 },
      { region: "Metropolitana", codigo: "RM", valor: 24.8, poblacion: 8420000 },
      { region: "Antofagasta", codigo: "II", valor: 21.2, poblacion: 709000 },
      { region: "Magallanes", codigo: "XII", valor: 18.5, poblacion: 182000 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Ley N° 21.561 (40 Horas)", boletin: "11.179-13", descripcion: "Reduce la jornada laboral semanal de 45 a 40 horas con gradualidad de 5 años y fomento a la formalidad." }
    ],
    sintesisDiagnostica: "Chile exhibe una de las tasas de informalidad laboral más bajas de América Latina (cerca de la mitad del promedio regional), aunque persisten brechas zonales marcadas en regiones agrícolas del sur."
  },

  "gasto-salud-pct-pib": {
    id: "gasto-salud-pct-pib",
    titulo: "Gasto Público en Salud como Porcentaje del PIB",
    subtitulo: "Recursos fiscales destinados a la red asistencial, Fonasa, Cenabast e infraestructura hospitalaria respecto al Producto Interno Bruto.",
    categoria: "salud-esperanza",
    unidad: "% del PIB",
    fuente: "DIPRES / Ministerio de Salud / OCDE Health Statistics",
    urlFuente: "https://ourworldindata.org/financing-healthcare",
    definicion: "Gasto consolidado del Gobierno Central en la partida del Ministerio de Salud expresado como porcentaje del PIB de cada año.",
    frecuencia: "Anual (Series 1995 - 2026)",
    serieHistorica: [
      { year: 1995, chile: 2.1, oecd_avg: 5.6, latam_avg: 2.8 },
      { year: 2000, chile: 2.6, oecd_avg: 6.1, latam_avg: 3.1 },
      { year: 2005, chile: 3.0, oecd_avg: 6.5, latam_avg: 3.4, annotation: "Implementación Plan AUGE (Ley 19.966)" },
      { year: 2010, chile: 3.6, oecd_avg: 7.2, latam_avg: 3.8 },
      { year: 2015, chile: 4.2, oecd_avg: 7.5, latam_avg: 4.1, annotation: "Ley Ricarte Soto (Ley 20.850)" },
      { year: 2018, chile: 4.6, oecd_avg: 7.8, latam_avg: 4.3 },
      { year: 2020, chile: 5.8, oecd_avg: 8.9, latam_avg: 5.1, annotation: "Gasto extraordinario emergencia COVID-19" },
      { year: 2022, chile: 5.2, oecd_avg: 8.4, latam_avg: 4.7, annotation: "Copago Cero en Fonasa" },
      { year: 2024, chile: 5.4, oecd_avg: 8.3, latam_avg: 4.8, annotation: "Ley Corta de Isapres (Ley 21.674)" },
      { year: 2026, chile: 5.7, oecd_avg: 8.5, latam_avg: 5.0, annotation: "Meta 6% recomendación OMS" }
    ],
    sintesisDiagnostica: "El gasto público en salud en Chile se ha más que duplicado como proporción del PIB desde 1995, impulsado por reformas estructurales como el Plan AUGE/GES, la Ley Ricarte Soto y el Copago Cero, aproximándose a la meta del 6% recomendada por la OMS."
  },

  "esperanza-vida-anos": {
    id: "esperanza-vida-anos",
    titulo: "Esperanza de Vida al Nacer en Chile (Años)",
    subtitulo: "Número promedio de años que viviría un recién nacido si los patrones de mortalidad se mantuvieran constantes.",
    categoria: "salud-esperanza",
    unidad: "Años de vida",
    fuente: "Instituto Nacional de Estadísticas (INE) / Banco Mundial / Our World in Data",
    urlFuente: "https://ourworldindata.org/life-expectancy",
    definicion: "Expectativa de vida al nacer calculada a partir de las tablas de mortalidad oficiales.",
    frecuencia: "Anual (Series 1990 - 2026)",
    serieHistorica: [
      { year: 1990, chile: 73.8, oecd_avg: 74.8, latam_avg: 68.2 },
      { year: 1995, chile: 75.2, oecd_avg: 75.8, latam_avg: 69.8 },
      { year: 2000, chile: 76.9, oecd_avg: 77.0, latam_avg: 71.4 },
      { year: 2005, chile: 78.4, oecd_avg: 78.5, latam_avg: 73.0 },
      { year: 2010, chile: 79.5, oecd_avg: 79.8, latam_avg: 74.2 },
      { year: 2015, chile: 80.2, oecd_avg: 80.6, latam_avg: 75.1 },
      { year: 2018, chile: 80.6, oecd_avg: 80.9, latam_avg: 75.4 },
      { year: 2020, chile: 79.8, oecd_avg: 80.1, latam_avg: 73.8, annotation: "Efecto sobremortalidad COVID-19" },
      { year: 2022, chile: 80.8, oecd_avg: 81.0, latam_avg: 75.2 },
      { year: 2024, chile: 81.4, oecd_avg: 81.5, latam_avg: 75.8 },
      { year: 2026, chile: 82.0, oecd_avg: 82.1, latam_avg: 76.2, annotation: "Líder regional indiscutido en Sudamérica" }
    ],
    sintesisDiagnostica: "Chile lidera la esperanza de vida en América Latina y se sitúa a la par del promedio de la OCDE (81.4 años), gracias al acceso extendido a agua potable, saneamiento y cobertura de vacunación infantil."
  },

  "tiempos-espera-quirurgica": {
    id: "tiempos-espera-quirurgica",
    titulo: "Días Promedio de Espera para Intervenciones Quirúrgicas No GES",
    subtitulo: "Mediana y promedio de días transcurridos desde la indicación médica hasta la realización de la cirugía en hospitales públicos.",
    categoria: "salud-esperanza",
    unidad: "Días de espera",
    fuente: "Subsecretaría de Redes Asistenciales / MINSAL / DIPRES",
    urlFuente: "https://www.minsal.cl",
    definicion: "Tiempo de espera en lista activa no garantizada por el régimen GES.",
    frecuencia: "Semestral / Anual (Series 2016 - 2026)",
    serieHistorica: [
      { year: 2016, chile: 485 },
      { year: 2018, chile: 420 },
      { year: 2020, chile: 640, annotation: "Suspensión de cirugías electivas por pandemia" },
      { year: 2022, chile: 530, annotation: "Plan Nacional de Reducción de Listas de Espera" },
      { year: 2024, chile: 380, annotation: "Uso de pabellones en horario extendido y fin de semana" },
      { year: 2026, chile: 280, annotation: "Meta sanitaria nacional" }
    ],
    sintesisDiagnostica: "Los tiempos de espera quirúrgica alcanzaron un pico de 640 días tras la pandemia, logrando una reducción de más del 40% a 2024 mediante presupuestos extraordinarios de reactivación asistencial aprobados en el Congreso."
  },

  "tasa-homicidios-100k": {
    id: "tasa-homicidios-100k",
    titulo: "Tasa de Homicidios Consumados por cada 100.000 Habitantes",
    subtitulo: "Número anual de víctimas de homicidio consumado por cada 100.000 habitantes en Chile comparado con promedios internacionales.",
    categoria: "seguridad-justicia",
    unidad: "Homicidios / 100k hab.",
    fuente: "Centro Nacional para la Prevención del Homicidio y Delito Violento / CEAD / UNODC / OWID",
    urlFuente: "https://ourworldindata.org/homicides",
    definicion: "Métrica consolidada y unificada por el Ministerio del Interior, Carabineros, PDI, Ministerio Público y Servicio Médico Legal.",
    frecuencia: "Anual (Series 2010 - 2026)",
    serieHistorica: [
      { year: 2010, chile: 2.8, oecd_avg: 2.1, latam_avg: 22.4 },
      { year: 2012, chile: 2.9, oecd_avg: 2.0, latam_avg: 23.1 },
      { year: 2014, chile: 3.1, oecd_avg: 1.9, latam_avg: 23.8 },
      { year: 2016, chile: 3.6, oecd_avg: 1.9, latam_avg: 24.2 },
      { year: 2018, chile: 4.5, oecd_avg: 1.8, latam_avg: 23.5 },
      { year: 2020, chile: 5.7, oecd_avg: 1.8, latam_avg: 21.8, annotation: "Inicio de registro unificado interinstitucional" },
      { year: 2022, chile: 6.7, oecd_avg: 1.9, latam_avg: 20.9, annotation: "Pico de homicidios por crimen organizado" },
      { year: 2023, chile: 6.3, oecd_avg: 1.8, latam_avg: 20.4, annotation: "Fast Track de Seguridad: Ley Naín-Retamal" },
      { year: 2024, chile: 5.8, oecd_avg: 1.8, latam_avg: 19.8, annotation: "Operación Plan Calles Sin Violencia" },
      { year: 2025, chile: 5.3, oecd_avg: 1.7, latam_avg: 19.2 },
      { year: 2026, chile: 4.8, oecd_avg: 1.7, latam_avg: 18.6, annotation: "Proyección con nuevo Ministerio de Seguridad" }
    ],
    datosRegionales: [
      { region: "Tarapacá", codigo: "I", valor: 12.9, poblacion: 400000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 11.2, poblacion: 259000 },
      { region: "Antofagasta", codigo: "II", valor: 8.4, poblacion: 709000 },
      { region: "Coquimbo", codigo: "IV", valor: 7.8, poblacion: 869000 },
      { region: "Valparaíso", codigo: "V", valor: 7.1, poblacion: 2010000 },
      { region: "Metropolitana", codigo: "RM", valor: 6.9, poblacion: 8420000 },
      { region: "Biobío", codigo: "VIII", valor: 6.2, poblacion: 1681000 },
      { region: "Los Lagos", codigo: "X", valor: 3.8, poblacion: 907000 },
      { region: "Magallanes", codigo: "XII", valor: 2.1, poblacion: 182000 },
      { region: "Aysén", codigo: "XI", valor: 1.9, poblacion: 108000 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Ley N° 21.560 (Naín-Retamal)", boletin: "15.788-25", descripcion: "Fortalece las facultades policiales y la legítima defensa privilegiada para Carabineros y PDI." },
      { year: 2023, ley: "Ley N° 21.595 (Delitos Económicos)", boletin: "13.204-07", descripcion: "Reforma integral contra delitos económicos y ambientales." },
      { year: 2024, ley: "Ley N° 21.694 (Crimen Organizado)", boletin: "15.995-25", descripcion: "Crea técnicas especiales de investigación, interceptación y comiso de ganancias ilícitas." }
    ],
    sintesisDiagnostica: "A pesar del aumento registrado entre 2018 y 2022 atribuido a bandas de crimen organizado trasnacional, Chile mantiene una tasa de homicidios tres veces inferior al promedio de América Latina, con una tendencia a la baja a partir del paquete de leyes del Fast Track de Seguridad."
  },

  "cead-delitos-mayor-connotacion": {
    id: "cead-delitos-mayor-connotacion",
    titulo: "Tasa de Delitos de Mayor Connotación Social - DMCS (Casos Policiales CEAD)",
    subtitulo: "Frecuencia de denuncias y detenciones por robos con violencia, robos con fuerza, hurtos, lesiones y homicidios por cada 100.000 habitantes en Chile.",
    categoria: "seguridad-justicia",
    unidad: "Casos policiales / 100k hab.",
    fuente: "Centro de Estudios y Análisis del Delito (CEAD) / Carabineros de Chile / PDI (cead.minsegpublica.gob.cl)",
    urlFuente: "https://cead.minsegpublica.gob.cl/estadisticas-delictuales/",
    definicion: "Suma anual de casos policiales correspondientes a los ocho delitos de mayor connotación pública (robo con violencia, robo con intimidación, robo por sorpresa, robo en lugar habitado, robo en lugar no habitado, robo de vehículos, hurto y lesiones) registrados por Carabineros y la PDI.",
    frecuencia: "Anual (Series 2005 - 2026)",
    serieHistorica: [
      { year: 2005, chile: 2850, oecd_avg: 3100, latam_avg: 4200 },
      { year: 2010, chile: 2980, oecd_avg: 3050, latam_avg: 4350 },
      { year: 2015, chile: 3120, oecd_avg: 2980, latam_avg: 4480 },
      { year: 2018, chile: 3010, oecd_avg: 2920, latam_avg: 4390 },
      { year: 2020, chile: 2150, oecd_avg: 2450, latam_avg: 3600, annotation: "Mínimo histórico por cuarentenas COVID-19" },
      { year: 2022, chile: 2680, oecd_avg: 2750, latam_avg: 4050, annotation: "Reactivación post-pandemia y nuevas modalidades" },
      { year: 2023, chile: 2740, oecd_avg: 2780, latam_avg: 4120, annotation: "Implementación Fast Track legislativo de seguridad" },
      { year: 2024, chile: 2590, oecd_avg: 2720, latam_avg: 4080, annotation: "Plan Calles Sin Violencia y Ley de Usurpaciones" },
      { year: 2026, chile: 2420, oecd_avg: 2680, latam_avg: 3950, annotation: "Proyección con nuevo Ministerio de Seguridad Pública" }
    ],
    datosRegionales: [
      { region: "Tarapacá", codigo: "I", valor: 3380, poblacion: 400000 },
      { region: "Antofagasta", codigo: "II", valor: 3250, poblacion: 710000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 3100, poblacion: 255000 },
      { region: "Metropolitana", codigo: "XIII", valor: 2920, poblacion: 8420000 },
      { region: "Valparaíso", codigo: "V", valor: 2780, poblacion: 2010000 },
      { region: "Coquimbo", codigo: "IV", valor: 2620, poblacion: 869000 },
      { region: "Biobío", codigo: "VIII", valor: 2450, poblacion: 1681000 },
      { region: "Atacama", codigo: "III", valor: 2410, poblacion: 320000 },
      { region: "O'Higgins", codigo: "VI", valor: 2350, poblacion: 1010000 },
      { region: "Los Lagos", codigo: "X", valor: 2180, poblacion: 907000 },
      { region: "Maule", codigo: "VII", valor: 2120, poblacion: 1150000 },
      { region: "La Araucanía", codigo: "IX", valor: 2080, poblacion: 1020000 },
      { region: "Ñuble", codigo: "XVI", valor: 1950, poblacion: 517000 },
      { region: "Los Ríos", codigo: "XIV", valor: 1890, poblacion: 408000 },
      { region: "Magallanes", codigo: "XII", valor: 1450, poblacion: 180000 },
      { region: "Aysén", codigo: "XI", valor: 1320, poblacion: 108000 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Ley N° 21.633 (Regula la Usurpación de Inmuebles)", boletin: "14.015-25", descripcion: "Sanciona penalmente la ocupación ilegal de terrenos e introduce flagrancia permanente." },
      { year: 2023, ley: "Ley N° 21.560 (Naín-Retamal)", boletin: "15.788-25", descripcion: "Refuerza la presunción legal de legítima defensa en el actuar policial y eleva penas por ataques." }
    ],
    sintesisDiagnostica: "Los Delitos de Mayor Connotación Social (DMCS) son la métrica rectora de la política policial chilena compilada por el CEAD. Tras la anomalía estadística del confinamiento de 2020, las cifras de 2024 muestran un descenso a 2.590 casos por 100 mil habitantes, concentrándose las mayores tasas en las macrozonas norte y metropolitana."
  },

  "cead-enusc-victimizacion": {
    id: "cead-enusc-victimizacion",
    titulo: "Tasa de Victimización General en Hogares (ENUSC - INE / SPD)",
    subtitulo: "Porcentaje de hogares donde al menos un integrante fue víctima de un delito durante los últimos doce meses según la encuesta oficial ENUSC.",
    categoria: "seguridad-justicia",
    unidad: "% de hogares victimizados",
    fuente: "Encuesta Nacional Urbana de Seguridad Ciudadana (ENUSC) - INE / CEAD (enusc.subprevenciondeldelito.gob.cl)",
    urlFuente: "https://enusc.subprevenciondeldelito.gob.cl/",
    definicion: "Indicador probabilístico representativo nacional de hogares urbanos que han sido objeto de al menos un delito de connotación personal o patrimonial, midiendo además la cifra negra de no denuncia.",
    frecuencia: "Anual (Series 2005 - 2026)",
    serieHistorica: [
      { year: 2005, chile: 38.3, oecd_avg: 24.5, latam_avg: 36.0 },
      { year: 2008, chile: 33.6, oecd_avg: 23.8, latam_avg: 35.2 },
      { year: 2010, chile: 31.1, oecd_avg: 23.0, latam_avg: 34.8 },
      { year: 2014, chile: 25.0, oecd_avg: 22.1, latam_avg: 33.5 },
      { year: 2017, chile: 28.0, oecd_avg: 21.8, latam_avg: 32.9 },
      { year: 2019, chile: 23.6, oecd_avg: 21.5, latam_avg: 32.0 },
      { year: 2020, chile: 19.2, oecd_avg: 18.0, latam_avg: 28.5, annotation: "Disminución por restricciones sanitarias" },
      { year: 2021, chile: 16.9, oecd_avg: 17.5, latam_avg: 27.2, annotation: "Mínimo histórico ENUSC" },
      { year: 2022, chile: 21.8, oecd_avg: 19.8, latam_avg: 29.5, annotation: "Retorno a niveles prepandemia" },
      { year: 2023, chile: 21.7, oecd_avg: 19.5, latam_avg: 29.1, annotation: "Estabilización de victimización" },
      { year: 2024, chile: 20.9, oecd_avg: 19.2, latam_avg: 28.4 },
      { year: 2026, chile: 19.5, oecd_avg: 18.8, latam_avg: 27.5, annotation: "Meta de reducción de brecha de inseguridad" }
    ],
    datosRegionales: [
      { region: "Tarapacá", codigo: "I", valor: 26.5 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 24.8 },
      { region: "Metropolitana", codigo: "XIII", valor: 24.2 },
      { region: "Antofagasta", codigo: "II", valor: 23.9 },
      { region: "Valparaíso", codigo: "V", valor: 22.4 },
      { region: "Coquimbo", codigo: "IV", valor: 21.6 },
      { region: "Atacama", codigo: "III", valor: 20.8 },
      { region: "Biobío", codigo: "VIII", valor: 19.5 },
      { region: "O'Higgins", codigo: "VI", valor: 18.9 },
      { region: "Maule", codigo: "VII", valor: 17.8 },
      { region: "Los Lagos", codigo: "X", valor: 17.2 },
      { region: "La Araucanía", codigo: "IX", valor: 16.8 },
      { region: "Ñuble", codigo: "XVI", valor: 16.2 },
      { region: "Los Ríos", codigo: "XIV", valor: 15.5 },
      { region: "Aysén", codigo: "XI", valor: 12.8 },
      { region: "Magallanes", codigo: "XII", valor: 11.4 }
    ],
    hitosLegislativos: [
      { year: 2024, ley: "Creación del Ministerio de Seguridad Pública", boletin: "14.614-07", descripcion: "Separa las funciones de gobierno interior de las de prevención, control y orden público." }
    ],
    sintesisDiagnostica: "La tasa de victimización ENUSC muestra que aproximadamente 1 de cada 5 hogares en Chile (21,7%) es víctima de un delito al año. Si bien esta tasa es sustancialmente inferior a la de 2005 (38,3%), la percepción de inseguridad ('temor al delito') alcanza picos superiores al 85%, constituyendo la principal brecha de política pública en materia de seguridad."
  },

  "cead-violencia-intrafamiliar": {
    id: "cead-violencia-intrafamiliar",
    titulo: "Casos Policiales y Denuncias de Violencia Intrafamiliar - VIF (CEAD)",
    subtitulo: "Ingresos policiales anuales por agresión física y psicológica en el entorno familiar registrados por Carabineros y PDI.",
    categoria: "seguridad-justicia",
    unidad: "Casos anuales / 100k hab.",
    fuente: "Centro de Estudios y Análisis del Delito (CEAD) - Subsecretaría de Prevención del Delito (cead.minsegpublica.gob.cl)",
    urlFuente: "https://cead.minsegpublica.gob.cl/informacion-con-enfoque-de-genero",
    definicion: "Denuncias y detenciones por violencia intrafamiliar (Ley 20.066) tipificadas hacia cónyuges, convivientes, ascendientes o descendientes directos.",
    frecuencia: "Anual (Series 2010 - 2026)",
    serieHistorica: [
      { year: 2010, chile: 590, annotation: "Línea de base Ley 20.066 de Violencia Intrafamiliar" },
      { year: 2014, chile: 685 },
      { year: 2018, chile: 720 },
      { year: 2020, chile: 760, annotation: "Aumento durante confinamiento obligatorio" },
      { year: 2022, chile: 735, annotation: "Ley 21.378 de Monitoreo Telemático para agresores" },
      { year: 2024, chile: 690, annotation: "Ley Integral contra la Violencia hacia las Mujeres (21.675)" },
      { year: 2026, chile: 640, annotation: "Consolidación de brazaletes de control telemático" }
    ],
    datosRegionales: [
      { region: "La Araucanía", codigo: "IX", valor: 840 },
      { region: "Los Lagos", codigo: "X", valor: 810 },
      { region: "Maule", codigo: "VII", valor: 780 },
      { region: "Aysén", codigo: "XI", valor: 760 },
      { region: "Ñuble", codigo: "XVI", valor: 750 },
      { region: "Biobío", codigo: "VIII", valor: 730 },
      { region: "Valparaíso", codigo: "V", valor: 710 },
      { region: "O'Higgins", codigo: "VI", valor: 695 },
      { region: "Metropolitana", codigo: "XIII", valor: 680 },
      { region: "Coquimbo", codigo: "IV", valor: 670 },
      { region: "Los Ríos", codigo: "XIV", valor: 660 },
      { region: "Tarapacá", codigo: "I", valor: 650 },
      { region: "Atacama", codigo: "III", valor: 640 },
      { region: "Antofagasta", codigo: "II", valor: 620 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 590 },
      { region: "Magallanes", codigo: "XII", valor: 540 }
    ],
    hitosLegislativos: [
      { year: 2021, ley: "Ley N° 21.378 (Monitoreo Telemático)", boletin: "12.122-07", descripcion: "Autoriza el uso de tobilleras electrónicas para supervisar órdenes de alejamiento en causas de violencia intrafamiliar." },
      { year: 2024, ley: "Ley N° 21.675 (Ley Integral de Violencia)", boletin: "11.077-07", descripcion: "Marco integral para prevenir, sancionar y erradicar la violencia contra las mujeres en razón de su género." }
    ],
    sintesisDiagnostica: "La Violencia Intrafamiliar supera los 130.000 casos policiales al año en Chile, representando una de las demandas prioritarias de auxilio policial. Las regiones del sur (La Araucanía, Los Lagos y Maule) presentan las mayores tasas por habitante. La implementación del monitoreo telemático y la Ley 21.675 de 2024 representan los avances normativos clave para la prevención de femicidios."
  },

  "poblacion-penal-total": {
    id: "poblacion-penal-total",
    titulo: "Población Recluida en el Sistema Penitenciario Nacional",
    subtitulo: "Número total de internos atendidos en recintos carcelarios cerrados según estadísticas de Gendarmería de Chile.",
    categoria: "seguridad-justicia",
    unidad: "Personas recluidas",
    fuente: "Gendarmería de Chile / Ministerio de Justicia y Derechos Humanos",
    urlFuente: "https://www.gendarmeria.gob.cl",
    definicion: "Total de personas en calidad de imputados en prisión preventiva y condenados en establecimientos penitenciarios.",
    frecuencia: "Anual (Series 2015 - 2026)",
    serieHistorica: [
      { year: 2015, chile: 42800 },
      { year: 2017, chile: 41900 },
      { year: 2019, chile: 43200 },
      { year: 2021, chile: 40800, annotation: "Indultos sanitarios conmutativos por COVID-19" },
      { year: 2022, chile: 45600 },
      { year: 2023, chile: 52400, annotation: "Alza acelerada de prisión preventiva por crimen organizado" },
      { year: 2024, chile: 56800, annotation: "Ocupación sobre el 130% de la capacidad de diseño" },
      { year: 2026, chile: 61000, annotation: "Plan de ampliación de plazas carcelarias" }
    ],
    sintesisDiagnostica: "El sistema penitenciario chileno experimenta su mayor presión de sobrepoblación en dos décadas, superando las 56.000 personas recluidas producto del incremento de imputados en prisión preventiva por delitos de alta connotación social."
  },

  "gasto-seguridad-dipres": {
    id: "gasto-seguridad-dipres",
    titulo: "Presupuesto Fiscal Destinado a Seguridad Pública y Orden",
    subtitulo: "Recursos asignados en la Ley de Presupuestos a Carabineros, PDI, Gendarmería y Ministerio del Interior en miles de millones de pesos.",
    categoria: "seguridad-justicia",
    unidad: "Miles de millones de CLP",
    fuente: "Dirección de Presupuestos (DIPRES) / Ministerio de Hacienda",
    urlFuente: "https://www.dipres.gob.cl",
    definicion: "Gasto devengado consolidado en programas de seguridad pública y administración de justicia.",
    frecuencia: "Anual (Series 2018 - 2026)",
    serieHistorica: [
      { year: 2018, chile: 2150 },
      { year: 2020, chile: 2280 },
      { year: 2022, chile: 2450 },
      { year: 2023, chile: 2840, annotation: "Incremento presupuestario histórico del 4.4%" },
      { year: 2024, chile: 3220, annotation: "Financiamiento integral Plan Calles Sin Violencia" },
      { year: 2025, chile: 3450 },
      { year: 2026, chile: 3700, annotation: "Consolidación Ministerio de Seguridad Pública" }
    ],
    sintesisDiagnostica: "El presupuesto de seguridad pública registró el mayor salto de la década entre 2022 y 2024, con más de 1.000 millones de dólares adicionales dirigidos a equipamiento blindado, armas, sistemas biométricos y control fronterizo."
  },

  "participacion-electoral-pct": {
    id: "participacion-electoral-pct",
    titulo: "Participación Electoral Histórica en Chile (1989 - 2026)",
    subtitulo: "Porcentaje de votantes efectivos sobre el padrón electoral habilitado según el régimen de votación (Inscripción voluntaria vs Voto voluntario vs Voto obligatorio).",
    categoria: "elecciones-bcn",
    unidad: "% del padrón electoral",
    fuente: "Servicio Electoral (SERVEL) / BCN SIIT Elecciones Históricas",
    urlFuente: "https://www.bcn.cl/siit/elecciones_historicas/",
    definicion: "Relación porcentual entre los votos válidamente emitidos (más nulos y blancos) y la población habilitada para sufragar en elecciones presidenciales y plebiscitos.",
    frecuencia: "Por ciclo electoral (1989 - 2026)",
    serieHistorica: [
      { year: 1989, chile: 94.7, oecd_avg: 76.2, annotation: "Presidenciales 1989 (Inscripción voluntaria, voto obligatorio)" },
      { year: 1993, chile: 91.2, oecd_avg: 74.8 },
      { year: 1999, chile: 89.4, oecd_avg: 72.4 },
      { year: 2005, chile: 87.7, oecd_avg: 71.0 },
      { year: 2009, chile: 86.9, oecd_avg: 69.5 },
      { year: 2013, chile: 49.3, oecd_avg: 68.2, annotation: "Ley 20.568: Entrada en vigencia del Voto Voluntario" },
      { year: 2017, chile: 46.7, oecd_avg: 67.8, annotation: "Mínimo histórico de participación electoral" },
      { year: 2020, chile: 50.9, oecd_avg: 68.5, annotation: "Plebiscito Nacional 2020 (Pandemia)" },
      { year: 2021, chile: 55.6, oecd_avg: 68.0, annotation: "Segunda vuelta Presidencial 2021" },
      { year: 2022, chile: 85.8, oecd_avg: 69.2, annotation: "Ley 21.524: Retorno al Voto Obligatorio (Plebiscito 2022)" },
      { year: 2023, chile: 84.5, oecd_avg: 68.8, annotation: "Plebiscito Constitucional Diciembre 2023" },
      { year: 2024, chile: 84.9, oecd_avg: 69.0, annotation: "Elecciones Regionales y Municipales en 2 días" },
      { year: 2025, chile: 85.2, oecd_avg: 69.4 },
      { year: 2026, chile: 86.0, oecd_avg: 69.5, annotation: "Proyección Presidencial y Parlamentaria" }
    ],
    datosRegionales: [
      { region: "O'Higgins", codigo: "VI", valor: 88.0, poblacion: 1000000 },
      { region: "Maule", codigo: "VII", valor: 87.5, poblacion: 1162000 },
      { region: "Ñuble", codigo: "XVI", valor: 87.0, poblacion: 517000 },
      { region: "Metropolitana", codigo: "RM", valor: 86.5, poblacion: 8420000 },
      { region: "Biobío", codigo: "VIII", valor: 86.0, poblacion: 1681000 },
      { region: "Valparaíso", codigo: "V", valor: 85.0, poblacion: 2010000 },
      { region: "Coquimbo", codigo: "IV", valor: 84.5, poblacion: 869000 },
      { region: "La Araucanía", codigo: "IX", valor: 84.0, poblacion: 1028000 },
      { region: "Los Ríos", codigo: "XIV", valor: 83.0, poblacion: 407000 },
      { region: "Los Lagos", codigo: "X", valor: 82.0, poblacion: 907000 },
      { region: "Atacama", codigo: "III", valor: 81.0, poblacion: 319000 },
      { region: "Antofagasta", codigo: "II", valor: 79.0, poblacion: 709000 },
      { region: "Tarapacá", codigo: "I", valor: 78.0, poblacion: 400000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 77.0, poblacion: 259000 },
      { region: "Aysén", codigo: "XI", valor: 74.0, poblacion: 108000 },
      { region: "Magallanes", codigo: "XII", valor: 72.0, poblacion: 182000 }
    ],
    hitosLegislativos: [
      { year: 2012, ley: "Ley N° 20.568", boletin: "7.785-06", descripcion: "Inscripción automática y voto voluntario (provocó caída del 40% en participación)." },
      { year: 2022, ley: "Ley N° 21.524", boletin: "13.212-07", descripcion: "Reforma constitucional que restablece el voto obligatorio en todas las elecciones populares." },
      { year: 2024, ley: "Ley N° 21.693", boletin: "16.729-06", descripcion: "Regula votación en dos días y sanciones por abstención injustificada." }
    ],
    sintesisDiagnostica: "El restablecimiento del voto obligatorio mediante la Ley 21.524 generó una recuperación masiva de la participación electoral en Chile, pasando de menos del 50% en 2017 a más del 85% a partir de 2022, posicionando a Chile entre las democracias con mayor afluencia a las urnas de la OCDE."
  },

  "padron-electoral-nacional": {
    id: "padron-electoral-nacional",
    titulo: "Evolución del Padrón Electoral Habilitado (Chile y Voto en el Exterior)",
    subtitulo: "Millones de personas habilitadas para sufragar en territorio nacional y en el extranjero según registros auditados del Servicio Electoral (SERVEL).",
    categoria: "elecciones-bcn",
    unidad: "Millones de electores",
    fuente: "Servicio Electoral (SERVEL) - Dirección del Padrón Electoral",
    urlFuente: "https://www.servel.cl",
    definicion: "Nómina oficial de ciudadanos chilenos y extranjeros con derecho a sufragio mayores de 18 años habilitados para votar en cada acto eleccionario.",
    frecuencia: "Por ciclo electoral (1989 - 2026)",
    serieHistorica: [
      { year: 1989, chile: 7.55, annotation: "Padrón manual con inscripción voluntaria" },
      { year: 1993, chile: 8.08 },
      { year: 1999, chile: 8.08 },
      { year: 2005, chile: 8.22 },
      { year: 2009, chile: 8.28, annotation: "Estancamiento del padrón por falta de inscripción juvenil" },
      { year: 2013, chile: 13.57, annotation: "Ley 20.568: Incorporación automática de 5M de nuevos electores" },
      { year: 2017, chile: 14.30, annotation: "Ley 20.960: Inicio del Voto de Chilenos en el Exterior" },
      { year: 2020, chile: 14.85 },
      { year: 2021, chile: 15.03 },
      { year: 2022, chile: 15.17 },
      { year: 2024, chile: 15.45, annotation: "Padrón auditado elecciones regionales y municipales" },
      { year: 2026, chile: 15.65, annotation: "Proyección padrón elecciones presidenciales" }
    ],
    datosRegionales: [
      { region: "Metropolitana", codigo: "RM", valor: 6.10, poblacion: 8420000 },
      { region: "Valparaíso", codigo: "V", valor: 1.65, poblacion: 2010000 },
      { region: "Biobío", codigo: "VIII", valor: 1.38, poblacion: 1681000 },
      { region: "Maule", codigo: "VII", valor: 0.92, poblacion: 1162000 },
      { region: "La Araucanía", codigo: "IX", valor: 0.91, poblacion: 1028000 },
      { region: "O'Higgins", codigo: "VI", valor: 0.81, poblacion: 1000000 },
      { region: "Los Lagos", codigo: "X", valor: 0.79, poblacion: 907000 },
      { region: "Coquimbo", codigo: "IV", valor: 0.68, poblacion: 869000 },
      { region: "Antofagasta", codigo: "II", valor: 0.50, poblacion: 709000 },
      { region: "Ñuble", codigo: "XVI", valor: 0.44, poblacion: 517000 }
    ],
    hitosLegislativos: [
      { year: 2012, ley: "Ley N° 20.568", boletin: "7.785-06", descripcion: "Inscripción automática en el padrón electoral para todos los ciudadanos mayores de 18 años." },
      { year: 2016, ley: "Ley N° 20.960", boletin: "9.317-06", descripcion: "Regula el derecho a sufragio en el extranjero para elecciones presidenciales y plebiscitos." }
    ],
    sintesisDiagnostica: "El padrón electoral en Chile se duplicó en 2012 con la reforma de inscripción automática. La Región Metropolitana concentra el 40% del electorado nacional, seguida por Valparaíso y Biobío."
  },

  "plebiscitos-historicos-chile": {
    id: "plebiscitos-historicos-chile",
    titulo: "Resultados Electorales de Plebiscitos Nacionales (SERVEL 1988 - 2024)",
    subtitulo: "Porcentaje de adhesión de la opción ganadora en los 5 plebiscitos nacionales que marcaron la historia constitucional de Chile.",
    categoria: "elecciones-bcn",
    unidad: "% de votos válidamente emitidos",
    fuente: "Servicio Electoral (SERVEL) / Tribunal Calificador de Elecciones (TRICEL)",
    urlFuente: "https://www.servel.cl",
    definicion: "Porcentaje oficial obtenido por la alternativa vencedora respecto al total de votos válidamente emitidos en plebiscitos nacionales sancionados por el TRICEL.",
    frecuencia: "Histórico por plebiscito (1988 - 2023)",
    serieHistorica: [
      { year: 1988, chile: 55.99, annotation: "Plebiscito 1988: Triunfo del NO (55.99% vs SI 44.01%)" },
      { year: 1989, chile: 91.25, annotation: "Plebiscito 1989: Aprobación Reformas (91.25% vs Rechazo 8.75%)" },
      { year: 2020, chile: 78.28, annotation: "Plebiscito 2020: Apruebo Nueva Constitución (78.28% vs Rechazo 21.72%)" },
      { year: 2022, chile: 61.86, annotation: "Plebiscito 2022: Rechazo Propuesta Convención (61.86% vs Apruebo 38.14%)" },
      { year: 2023, chile: 55.76, annotation: "Plebiscito 2023: En Contra Propuesta Consejo (55.76% vs A Favor 44.24%)" }
    ],
    hitosLegislativos: [
      { year: 1988, ley: "Constitución 1980 (Art. 8 transitorio)", boletin: "TRICEL", descripcion: "Plebiscito fundacional que abrió el camino a elecciones democráticas competitivas." },
      { year: 2019, ley: "Ley N° 21.200", boletin: "13.080-07", descripcion: "Reforma constitucional que habilita el proceso constituyente y el plebiscito nacional 2020." },
      { year: 2022, ley: "Ley N° 21.533", boletin: "15.480-07", descripcion: "Acuerdo por Chile que reguló el segundo proceso constitucional (Consejo Constitucional)." }
    ],
    sintesisDiagnostica: "Los plebiscitos en Chile han convocado a los mayores contingentes de votantes de la historia (más de 13 millones en 2022 y 2023), demostrando una fuerte cultura institucional para resolver encrucijadas políticas y constitucionales por la vía electoral."
  },

  "representacion-femenina-pct": {
    id: "representacion-femenina-pct",
    titulo: "Representación Femenina en el Congreso Nacional (Cámara y Senado)",
    subtitulo: "Porcentaje de escaños ocupados por mujeres en el Congreso Nacional de Chile antes y después de la Ley de Cuotas de Género (Ley 20.840).",
    categoria: "elecciones-bcn",
    unidad: "% de escaños parlamentarios",
    fuente: "Servicio Electoral (SERVEL) / BCN SIIT Elecciones Históricas",
    urlFuente: "https://www.bcn.cl/siit/elecciones_historicas/",
    definicion: "Proporción de parlamentarias mujeres electas sobre el total de parlamentarios en ejercicio en la Cámara de Diputados y el Senado.",
    frecuencia: "Por legislatura (1989 - 2026)",
    serieHistorica: [
      { year: 1989, chile: 5.8, oecd_avg: 12.5, annotation: "Primer Congreso democrático (7 diputadas / 3 senadoras)" },
      { year: 1993, chile: 6.7, oecd_avg: 14.8 },
      { year: 1997, chile: 9.2, oecd_avg: 17.1 },
      { year: 2001, chile: 11.7, oecd_avg: 19.8 },
      { year: 2005, chile: 14.2, oecd_avg: 22.4 },
      { year: 2009, chile: 13.9, oecd_avg: 24.5 },
      { year: 2013, chile: 15.8, oecd_avg: 27.2 },
      { year: 2017, chile: 22.6, oecd_avg: 30.1, annotation: "Ley 20.840: Primera aplicación de cuota de género (40% candidatas)" },
      { year: 2021, chile: 35.5, oecd_avg: 33.8, annotation: "Superación del promedio OCDE (55 diputadas y 12 senadoras)" },
      { year: 2024, chile: 36.8, oecd_avg: 34.5 },
      { year: 2026, chile: 38.5, oecd_avg: 35.2, annotation: "Proyección paridad parlamentaria" }
    ],
    hitosLegislativos: [
      { year: 2015, ley: "Ley N° 20.840", boletin: "9.333-07", descripcion: "Sustituye el sistema binominal por un sistema proporcional inclusivo y establece la regla de paridad de candidaturas (máximo 60% por sexo)." }
    ],
    sintesisDiagnostica: "La representación femenina en el Congreso Nacional pasó de un 5.8% en 1989 al 35.5% en la actual legislatura, superando por primera vez el promedio de los países miembros de la OCDE como resultado directo de la Ley de Cuotas (Ley 20.840)."
  },

  "fragmentacion-parlamentaria": {
    id: "fragmentacion-parlamentaria",
    titulo: "Índice de Fragmentación Parlamentaria (Número Efectivo de Partidos NEP)",
    subtitulo: "Número efectivo de partidos con representación en la Cámara de Diputadas y Diputados según la fórmula internacional de Laakso-Taagepera.",
    categoria: "elecciones-bcn",
    unidad: "Partidos efectivos (NEP)",
    fuente: "Servicio Electoral (SERVEL) / BCN Asesoría Técnica Parlamentaria",
    urlFuente: "https://www.bcn.cl/siit/elecciones_historicas/",
    definicion: "Índice que pondera el número de bancadas legislativas según su tamaño relativo en escaños para medir la gobernabilidad y dispersión política.",
    frecuencia: "Por legislatura (1989 - 2026)",
    serieHistorica: [
      { year: 1989, chile: 5.2, oecd_avg: 4.8, annotation: "Sistema Binominal (2 grandes bloques)" },
      { year: 1993, chile: 5.0, oecd_avg: 5.1 },
      { year: 1997, chile: 5.4, oecd_avg: 5.3 },
      { year: 2001, chile: 5.2, oecd_avg: 5.4 },
      { year: 2005, chile: 5.1, oecd_avg: 5.6 },
      { year: 2009, chile: 5.6, oecd_avg: 5.8 },
      { year: 2013, chile: 5.8, oecd_avg: 6.0 },
      { year: 2017, chile: 9.8, oecd_avg: 6.2, annotation: "Ley 20.840: Sistema proporcional D'Hondt con 28 distritos" },
      { year: 2021, chile: 14.2, oecd_avg: 6.4, annotation: "Pico de fragmentación: 21 partidos con escaños" },
      { year: 2024, chile: 16.5, oecd_avg: 6.5, annotation: "Discusión umbral electoral del 5%" },
      { year: 2026, chile: 15.8, oecd_avg: 6.6, annotation: "Proyección con reforma al sistema político" }
    ],
    hitosLegislativos: [
      { year: 2015, ley: "Ley N° 20.840", boletin: "9.333-07", descripcion: "Termina con el binominal e introduce el sistema proporcional D'Hondt con distritos medianos y grandes." }
    ],
    sintesisDiagnostica: "La fragmentación parlamentaria en Chile se triplicó tras la reforma electoral de 2015, alcanzando un NEP superior a 14 partidos efectivos, lo que ha impulsado debates legislativos sobre umbrales mínimos del 5% para frenar la dispersión de bancadas."
  },

  "inversion-fndr-regional": {
    id: "inversion-fndr-regional",
    titulo: "Distribución de la Inversión Pública Regional (FNDR y Sectorial)",
    subtitulo: "Fondo Nacional de Desarrollo Regional (FNDR) asignado a los Gobiernos Regionales por habitante en miles de pesos chilenos.",
    categoria: "territorio-siit",
    unidad: "Miles de CLP / habitante",
    fuente: "Subsecretaría de Desarrollo Regional (SUBDERE) / BCN SIIT Estadísticas Territoriales / DIPRES",
    urlFuente: "https://www.bcn.cl/siit/estadisticasterritoriales",
    definicion: "Monto de recursos públicos transferidos a los Gobiernos Regionales para obras de infraestructura, salud, educación y fomento productivo dividido por la población regional.",
    frecuencia: "Anual (Series 2015 - 2026)",
    serieHistorica: [
      { year: 2015, chile: 68.4 },
      { year: 2017, chile: 74.2 },
      { year: 2019, chile: 82.5 },
      { year: 2021, chile: 94.8, annotation: "Elección democrática de Gobernadores Regionales" },
      { year: 2023, chile: 112.4, annotation: "Ley de Royalty Minero (Fondos Regionales)" },
      { year: 2024, chile: 128.6, annotation: "Primer desembolso Fondo de Equidad Territorial" },
      { year: 2026, chile: 145.0, annotation: "Proyección con descentralización fiscal plena" }
    ],
    datosRegionales: [
      { region: "Aysén", codigo: "XI", valor: 420.5, poblacion: 108000 },
      { region: "Magallanes", codigo: "XII", valor: 360.2, poblacion: 182000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 285.4, poblacion: 259000 },
      { region: "Atacama", codigo: "III", valor: 240.1, poblacion: 319000 },
      { region: "Tarapacá", codigo: "I", valor: 215.8, poblacion: 400000 },
      { region: "Los Ríos", codigo: "XIV", valor: 198.5, poblacion: 407000 },
      { region: "La Araucanía", codigo: "IX", valor: 175.2, poblacion: 1028000 },
      { region: "Ñuble", codigo: "XVI", valor: 168.4, poblacion: 517000 },
      { region: "Coquimbo", codigo: "IV", valor: 135.0, poblacion: 869000 },
      { region: "Antofagasta", codigo: "II", valor: 132.8, poblacion: 709000 },
      { region: "Los Lagos", codigo: "X", valor: 124.6, poblacion: 907000 },
      { region: "Maule", codigo: "VII", valor: 118.2, poblacion: 1162000 },
      { region: "Biobío", codigo: "VIII", valor: 105.4, poblacion: 1681000 },
      { region: "O'Higgins", codigo: "VI", valor: 98.7, poblacion: 1000000 },
      { region: "Valparaíso", codigo: "V", valor: 76.5, poblacion: 2010000 },
      { region: "Metropolitana", codigo: "RM", valor: 38.2, poblacion: 8420000 }
    ],
    hitosLegislativos: [
      { year: 2018, ley: "Ley N° 21.074", boletin: "11.200-06", descripcion: "Fortalecimiento de la regionalización del país y transferencia de competencias." },
      { year: 2023, ley: "Ley N° 21.591 (Royalty Minero)", boletin: "12.093-08", descripcion: "Crea el Fondo para la Equidad Territorial (US$ 225M) y Fondo Comunas Mineras (US$ 55M)." }
    ],
    sintesisDiagnostica: "El modelo redistributivo del FNDR favorece intensamente a las regiones extremas (Aysén, Magallanes y Arica), que reciben hasta 10 veces más inversión per cápita que la Región Metropolitana, compensando costos de aislamiento y dispersión geográfica."
  },

  "presupuesto-municipal-percapita": {
    id: "presupuesto-municipal-percapita",
    titulo: "Ingresos Municipales Propios y Fondo Común Municipal per cápita",
    subtitulo: "Promedio de ingresos municipales por habitante en miles de pesos según el Sistema Nacional de Información Municipal (SINIM).",
    categoria: "territorio-siit",
    unidad: "Miles de CLP / habitante",
    fuente: "SINIM / SUBDERE / BCN SIIT Estadísticas Territoriales",
    urlFuente: "https://www.bcn.cl/siit/estadisticasterritoriales",
    definicion: "Presupuesto total municipal anual dividido por la población comunal.",
    frecuencia: "Anual (Series 2015 - 2026)",
    serieHistorica: [
      { year: 2015, chile: 185 },
      { year: 2018, chile: 215 },
      { year: 2020, chile: 240 },
      { year: 2022, chile: 275 },
      { year: 2024, chile: 320, annotation: "Inyección Fondo Común Municipal por Ley de Royalty" },
      { year: 2026, chile: 360, annotation: "Proyección descentralización comunal" }
    ],
    datosRegionales: [
      { region: "Metropolitana", codigo: "RM", valor: 480, poblacion: 8420000 },
      { region: "Antofagasta", codigo: "II", valor: 395, poblacion: 709000 },
      { region: "Tarapacá", codigo: "I", valor: 340, poblacion: 400000 },
      { region: "Valparaíso", codigo: "V", valor: 310, poblacion: 2010000 },
      { region: "Magallanes", codigo: "XII", valor: 295, poblacion: 182000 },
      { region: "Biobío", codigo: "VIII", valor: 260, poblacion: 1681000 },
      { region: "Maule", codigo: "VII", valor: 240, poblacion: 1162000 },
      { region: "La Araucanía", codigo: "IX", valor: 220, poblacion: 1028000 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Ley N° 21.591", boletin: "12.093-08", descripcion: "Distribuye US$ 450M directos al Fondo Común Municipal para 307 comunas de menores recursos." }
    ],
    sintesisDiagnostica: "Persiste una elevada desigualdad de ingresos propios entre municipios del sector oriente de Santiago y comunas rurales del sur, la cual se mitiga gradualmente a través del Fondo Común Municipal y los nuevos fondos del Royalty Minero."
  },

  "areas-verdes-m2-hab": {
    id: "areas-verdes-m2-hab",
    titulo: "Disponibilidad de Áreas Verdes Urbanas con Mantenimiento (m²/hab)",
    subtitulo: "Superficie de plazas y parques con mantenimiento efectivo por habitante en las principales ciudades de Chile según BCN SIIT.",
    categoria: "territorio-siit",
    unidad: "m² / habitante",
    fuente: "Ministerio de Vivienda y Urbanismo (MINVU) / BCN SIIT / INE",
    urlFuente: "https://www.bcn.cl/siit/estadisticasterritoriales",
    definicion: "Metros cuadrados de parques urbanos y plazas públicas con mantenimiento regular divididos por el número de residentes urbanos.",
    frecuencia: "Trienal (Series 2015 - 2026)",
    serieHistorica: [
      { year: 2015, chile: 4.2, oecd_avg: 9.0 },
      { year: 2018, chile: 4.6, oecd_avg: 9.2 },
      { year: 2021, chile: 5.1, oecd_avg: 9.4, annotation: "Política Nacional de Parques Urbanos" },
      { year: 2024, chile: 5.8, oecd_avg: 9.5 },
      { year: 2026, chile: 6.4, oecd_avg: 9.6, annotation: "Meta estándar OMS 9 m²/hab" }
    ],
    datosRegionales: [
      { region: "Los Ríos", codigo: "XIV", valor: 8.4, poblacion: 407000 },
      { region: "Magallanes", codigo: "XII", valor: 7.8, poblacion: 182000 },
      { region: "Biobío", codigo: "VIII", valor: 6.5, poblacion: 1681000 },
      { region: "Metropolitana", codigo: "RM", valor: 5.4, poblacion: 8420000 },
      { region: "Valparaíso", codigo: "V", valor: 4.8, poblacion: 2010000 },
      { region: "Maule", codigo: "VII", valor: 4.5, poblacion: 1162000 },
      { region: "Coquimbo", codigo: "IV", valor: 3.8, poblacion: 869000 },
      { region: "Antofagasta", codigo: "II", valor: 2.9, poblacion: 709000 },
      { region: "Tarapacá", codigo: "I", valor: 2.4, poblacion: 400000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 2.1, poblacion: 259000 }
    ],
    hitosLegislativos: [
      { year: 2021, ley: "Decreto Supremo N° 12 (MINVU)", boletin: "MINVU", descripcion: "Aprueba la Política Nacional de Parques Urbanos para asegurar justicia territorial en acceso a áreas verdes." }
    ],
    sintesisDiagnostica: "Las ciudades del centro y sur de Chile duplican la disponibilidad de áreas verdes respecto a las urbes del norte grande desértico (Arica, Iquique y Antofagasta), evidenciando marcadas disparidades de justicia ambiental urbana."
  },

  "fao-exportaciones-fruticolas": {
    id: "fao-exportaciones-fruticolas",
    titulo: "Producción y Exportación Frutícola de Chile (Cerezas, Uvas, Arándanos)",
    subtitulo: "Volumen anual de envíos frutícolas de Chile al exterior en miles de toneladas métricas según registros consolidados de FAOSTAT y ODEPA.",
    categoria: "agricultura-fao",
    unidad: "Miles de toneladas métricas",
    fuente: "FAOSTAT (Crops and Livestock Products - QCL) / ODEPA / SAG",
    urlFuente: "https://www.fao.org/faostat/en/#data/QCL",
    definicion: "Suma anual del volumen físico exportado de frutas frescas y procesadas (cerezas, arándanos, uva de mesa, paltas, manzanas y ciruelas) de origen nacional.",
    frecuencia: "Anual (Series 1990 - 2026)",
    serieHistorica: [
      { year: 1990, chile: 820, latam_avg: 450, annotation: "Inicio de inserción exportadora frutícola" },
      { year: 1995, chile: 1150, latam_avg: 610 },
      { year: 2000, chile: 1450, latam_avg: 820, annotation: "Acuerdo de Asociación con Unión Europea" },
      { year: 2005, chile: 1920, latam_avg: 1100, annotation: "TLC Chile - Estados Unidos" },
      { year: 2010, chile: 2480, latam_avg: 1350, annotation: "Apertura del mercado asiático para cerezas" },
      { year: 2015, chile: 2850, latam_avg: 1540 },
      { year: 2018, chile: 3200, latam_avg: 1680 },
      { year: 2020, chile: 3420, latam_avg: 1720 },
      { year: 2022, chile: 3680, latam_avg: 1810, annotation: "Récord histórico exportación cerezas a China" },
      { year: 2024, chile: 3950, latam_avg: 1900, annotation: "Ley 21.670: Modernización Ley de Fomento al Riego" },
      { year: 2025, chile: 4100, latam_avg: 1950 },
      { year: 2026, chile: 4280, latam_avg: 2010, annotation: "Proyección consolidada temporada 2025/2026" }
    ],
    datosRegionales: [
      { region: "O'Higgins", codigo: "VI", valor: 1420.5, poblacion: 1000000 },
      { region: "Maule", codigo: "VII", valor: 1250.0, poblacion: 1162000 },
      { region: "Valparaíso", codigo: "V", valor: 480.2, poblacion: 2010000 },
      { region: "Metropolitana", codigo: "RM", valor: 410.8, poblacion: 8420000 },
      { region: "Coquimbo", codigo: "IV", valor: 280.4, poblacion: 869000 },
      { region: "Ñuble", codigo: "XVI", valor: 220.6, poblacion: 517000 },
      { region: "La Araucanía", codigo: "IX", valor: 140.2, poblacion: 1028000 },
      { region: "Biobío", codigo: "VIII", valor: 78.3, poblacion: 1681000 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Ley N° 21.670", boletin: "15.914-01", descripcion: "Modifica la Ley N° 18.450 de Fomento a la Inversión Privada en Obras de Riego y Drenaje para apoyar a la pequeña y mediana agricultura." },
      { year: 2023, ley: "Ley N° 21.537 (Ley Apícola)", boletin: "13.528-01", descripcion: "Regula la actividad apícola, protección de polinizadores y trazabilidad de la miel para exportación." }
    ],
    sintesisDiagnostica: "Chile es el principal exportador de frutas frescas del hemisferio sur y líder mundial en cerezas y ciruelas deshidratadas. La actividad frutícola se concentra fuertemente en las regiones de O'Higgins y Maule, representando más del 65% de los envíos nacionales."
  },

  "fao-seguridad-alimentaria": {
    id: "fao-seguridad-alimentaria",
    titulo: "Prevalencia de Inseguridad Alimentaria Moderada o Grave (FAOSTAT - ODS 2)",
    subtitulo: "Porcentaje de personas que enfrentan incertidumbre sobre su capacidad para obtener alimentos, medido según la escala FIES (Food Insecurity Experience Scale) de la FAO.",
    categoria: "agricultura-fao",
    unidad: "% de la población",
    fuente: "FAOSTAT (Food Security Indicators - SDG 2.1.2) / Encuesta CASEN / CEPAL",
    urlFuente: "https://www.fao.org/faostat/en/#data/FS",
    definicion: "Indicador ODS 2.1.2 que mide la proporción de la población que experimenta restricciones en la calidad o cantidad de alimentos debido a falta de dinero u otros recursos.",
    frecuencia: "Trienal / Bienal (Series 2014 - 2026)",
    serieHistorica: [
      { year: 2014, chile: 11.8, oecd_avg: 8.2, latam_avg: 27.5 },
      { year: 2016, chile: 12.4, oecd_avg: 8.0, latam_avg: 29.8 },
      { year: 2018, chile: 13.1, oecd_avg: 7.9, latam_avg: 31.4 },
      { year: 2020, chile: 17.2, oecd_avg: 9.8, latam_avg: 39.2, annotation: "Shock global por Pandemia COVID-19" },
      { year: 2022, chile: 15.6, oecd_avg: 9.1, latam_avg: 37.5, annotation: "Plan Siembra por Chile y Bolsillo Familiar Electrónico" },
      { year: 2024, chile: 13.8, oecd_avg: 8.5, latam_avg: 34.2, annotation: "Estabilización de precios de canasta básica" },
      { year: 2026, chile: 12.0, oecd_avg: 8.1, latam_avg: 31.0, annotation: "Proyección convergencia a promedio OCDE" }
    ],
    datosRegionales: [
      { region: "La Araucanía", codigo: "IX", valor: 21.4, poblacion: 1028000 },
      { region: "Ñuble", codigo: "XVI", valor: 19.8, poblacion: 517000 },
      { region: "Tarapacá", codigo: "I", valor: 18.2, poblacion: 400000 },
      { region: "Maule", codigo: "VII", valor: 16.5, poblacion: 1162000 },
      { region: "Biobío", codigo: "VIII", valor: 15.2, poblacion: 1681000 },
      { region: "Valparaíso", codigo: "V", valor: 14.0, poblacion: 2010000 },
      { region: "Metropolitana", codigo: "RM", valor: 12.8, poblacion: 8420000 },
      { region: "Los Lagos", codigo: "X", valor: 12.1, poblacion: 907000 },
      { region: "Antofagasta", codigo: "II", valor: 10.4, poblacion: 709000 },
      { region: "Magallanes", codigo: "XII", valor: 6.8, poblacion: 182000 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Ley N° 21.550", boletin: "15.664-05", descripcion: "Crea el Bolsillo Familiar Electrónico y duplica el Aporte Familiar Permanente para aliviar el costo de alimentos." },
      { year: 2024, ley: "Ley N° 21.705", boletin: "16.890-01", descripcion: "Crea la Comisión Nacional de Seguridad y Soberanía Alimentaria." }
    ],
    sintesisDiagnostica: "Chile mantiene los niveles de inseguridad alimentaria más bajos de Sudamérica (tres veces menor al promedio de América Latina), con una reducción sostenida post-pandemia impulsada por subsidios alimentarios directos y apoyos a la producción agrícola local."
  },

  "fao-superficie-forestal": {
    id: "fao-superficie-forestal",
    titulo: "Superficie de Bosque Nativo y Plantaciones Forestales",
    subtitulo: "Millones de hectáreas cubiertas por formaciones boscosas según el Censo Forestal Nacional y la base de datos Global Forest Resources Assessment de la FAO.",
    categoria: "agricultura-fao",
    unidad: "Millones de hectáreas",
    fuente: "FAOSTAT Forestry Database / CONAF / Instituto Forestal (INFOR)",
    urlFuente: "https://www.fao.org/faostat/en/#data/FO",
    definicion: "Extensión total de tierras con cubierta de copas superior al 10% y superficie mayor a 0,5 hectáreas, desagregada entre bosque nativo de conservación y plantaciones comerciales.",
    frecuencia: "Quinquenal / Anual (Series 1990 - 2026)",
    serieHistorica: [
      { year: 1990, chile: 15.2, annotation: "Línea base Evaluación Recursos Forestales Mundiales" },
      { year: 1995, chile: 15.6 },
      { year: 2000, chile: 16.1 },
      { year: 2005, chile: 16.8 },
      { year: 2010, chile: 17.3, annotation: "Entrada en vigor Ley 20.283 de Bosque Nativo" },
      { year: 2015, chile: 17.9 },
      { year: 2018, chile: 17.6, annotation: "Impacto incendios forestales de gran magnitud (Tormenta de Fuego)" },
      { year: 2020, chile: 17.8 },
      { year: 2022, chile: 18.0, annotation: "Estrategia Nacional de Restauración de Paisajes" },
      { year: 2024, chile: 18.2, annotation: "Servicio de Biodiversidad y Áreas Protegidas (SBAP)" },
      { year: 2026, chile: 18.5, annotation: "Meta 500.000 ha reforestadas" }
    ],
    datosRegionales: [
      { region: "Aysén", codigo: "XI", valor: 4.8, poblacion: 108000 },
      { region: "Los Lagos", codigo: "X", valor: 3.4, poblacion: 907000 },
      { region: "Magallanes", codigo: "XII", valor: 2.6, poblacion: 182000 },
      { region: "Biobío", codigo: "VIII", valor: 2.1, poblacion: 1681000 },
      { region: "La Araucanía", codigo: "IX", valor: 1.9, poblacion: 1028000 },
      { region: "Los Ríos", codigo: "XIV", valor: 1.5, poblacion: 407000 },
      { region: "Maule", codigo: "VII", valor: 1.1, poblacion: 1162000 }
    ],
    hitosLegislativos: [
      { year: 2008, ley: "Ley N° 20.283", boletin: "1.698-01", descripcion: "Ley sobre Recuperación del Bosque Nativo y Fomento Forestal." },
      { year: 2023, ley: "Ley N° 21.600 (SBAP)", boletin: "9.404-12", descripcion: "Crea el Servicio de Biodiversidad y Áreas Protegidas y el Sistema Nacional de Áreas Protegidas." }
    ],
    sintesisDiagnostica: "Chile cuenta con más de 18 millones de hectáreas de bosque (24% del territorio continental), donde el 82% corresponde a bosque nativo protegido y el 18% a plantaciones productivas, concentrándose la mayor biomasa nativa en la Patagonia (Aysén, Los Lagos y Magallanes)."
  },

  "fao-produccion-vinicola": {
    id: "fao-produccion-vinicola",
    titulo: "Producción Vitivinícola Nacional y Denominaciones de Origen",
    subtitulo: "Millones de litros de vino con y sin denominación de origen producidos anualmente según estadísticas de FAOSTAT y el Catastro Vitícola del SAG.",
    categoria: "agricultura-fao",
    unidad: "Millones de litros",
    fuente: "FAOSTAT (Crops and Livestock Products: Wine) / Servicio Agrícola y Ganadero (SAG) / Vinos de Chile",
    urlFuente: "https://www.fao.org/faostat/en/#data/QCL",
    definicion: "Volumen total de vino declarado al Servicio Agrícola y Ganadero (SAG) procedente de la molienda de uvas viníferas en las distintas zonas y valles vitivinícolas del país.",
    frecuencia: "Anual (Series 2005 - 2026)",
    serieHistorica: [
      { year: 2005, chile: 788, latam_avg: 620 },
      { year: 2010, chile: 915, latam_avg: 710, annotation: "Reconstrucción post-terremoto 27F" },
      { year: 2015, chile: 1286, latam_avg: 890, annotation: "Cosecha récord histórica nacional" },
      { year: 2018, chile: 1290, latam_avg: 905 },
      { year: 2020, chile: 1033, latam_avg: 820 },
      { year: 2022, chile: 1244, latam_avg: 870 },
      { year: 2024, chile: 1100, latam_avg: 840, annotation: "Impacto olas de calor y adaptación climática" },
      { year: 2026, chile: 1180, latam_avg: 860, annotation: "Proyección vendimia 2026" }
    ],
    datosRegionales: [
      { region: "Maule", codigo: "VII", valor: 540.2, poblacion: 1162000 },
      { region: "O'Higgins", codigo: "VI", valor: 420.5, poblacion: 1000000 },
      { region: "Metropolitana", codigo: "RM", valor: 78.4, poblacion: 8420000 },
      { region: "Ñuble", codigo: "XVI", valor: 65.1, poblacion: 517000 },
      { region: "Valparaíso", codigo: "V", valor: 48.6, poblacion: 2010000 },
      { region: "Coquimbo", codigo: "IV", valor: 27.2, poblacion: 869000 }
    ],
    hitosLegislativos: [
      { year: 2021, ley: "Decreto 464 (Zonificación Vitícola)", boletin: "SAG", descripcion: "Actualiza las subdenominaciones de origen para vinos de zonas extremas (Valle del Huasco, Chiloé y Pampa del Tamarugal)." }
    ],
    sintesisDiagnostica: "Chile se ubica entre los 5 mayores exportadores mundiales de vino, con más del 80% de su producción originada en las regiones del Maule y O'Higgins (Valles del Maipo, Colchagua, Cachapoal, Curicó y Maule)."
  },

  "recaudacion-royalty-uf": {
    id: "recaudacion-royalty-uf",
    titulo: "Recaudación del Royalty a la Gran Minería y Aportes a Fondos de Desarrollo",
    subtitulo: "Recaudación fiscal neta generada por el componente ad valorem y sobre el margen operacional de la gran minería del cobre y litio en Unidades de Fomento (UF).",
    categoria: "mineria-economia",
    unidad: "Millones de UF anuales",
    fuente: "Dirección de Presupuestos (DIPRES) / Servicio de Impuestos Internos (SII) / Cochilco",
    urlFuente: "https://www.dipres.gob.cl",
    definicion: "Tributo especial a la explotación de sustancias minerales de carácter concesible aplicable a explotadores mineros cuyas ventas anuales superan las 50.000 toneladas métricas de cobre fino.",
    frecuencia: "Anual (Series 2018 - 2026)",
    serieHistorica: [
      { year: 2018, chile: 11.2, annotation: "Régimen anterior Ley 20.469" },
      { year: 2020, chile: 12.8 },
      { year: 2022, chile: 15.4, annotation: "Ingreso extraordinario por precios de cobre y litio" },
      { year: 2024, chile: 24.8, annotation: "Entrada en vigencia Ley 21.591 de Royalty Minero" },
      { year: 2025, chile: 28.5, annotation: "Plena operación de fondos regionales y comunales" },
      { year: 2026, chile: 31.2, annotation: "Recaudación consolidada de régimen minero" }
    ],
    datosRegionales: [
      { region: "Antofagasta", codigo: "II", valor: 54.2, poblacion: 709000 },
      { region: "Atacama", codigo: "III", valor: 18.5, poblacion: 319000 },
      { region: "Tarapacá", codigo: "I", valor: 12.4, poblacion: 400000 },
      { region: "Coquimbo", codigo: "IV", valor: 8.2, poblacion: 869000 },
      { region: "O'Higgins", codigo: "VI", valor: 4.8, poblacion: 1000000 },
      { region: "Valparaíso", codigo: "V", valor: 1.9, poblacion: 2010000 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Ley N° 21.591", boletin: "12.093-08", descripcion: "Nuevo Royalty a la Gran Minería: establece tasa ad valorem máxima y distribuye US$ 450 millones anuales a regiones y 307 comunas vulnerables." }
    ],
    sintesisDiagnostica: "La Ley 21.591 duplicó el aporte fiscal de la gran minería para beneficio directo de los gobiernos regionales y municipios, consagrando el mayor traspaso de recursos hacia regiones mineras y comunas de menores ingresos en la historia de Chile."
  },

  "produccion-litio-lce": {
    id: "produccion-litio-lce",
    titulo: "Producción Nacional de Carbonato de Litio Equivalente (LCE)",
    subtitulo: "Miles de toneladas métricas de LCE extraídas y procesadas en el Salar de Atacama según Cochilco y CORFO.",
    categoria: "mineria-economia",
    unidad: "Miles de toneladas LCE",
    fuente: "Comisión Chilena del Cobre (Cochilco) / CORFO / Estrategia Nacional del Litio",
    urlFuente: "https://www.cochilco.cl",
    definicion: "Volumen anual de producción y exportación de carbonato e hidróxido de litio calidad batería.",
    frecuencia: "Anual (Series 2015 - 2026)",
    serieHistorica: [
      { year: 2015, chile: 58.4 },
      { year: 2018, chile: 94.2, annotation: "Renegociación de contratos de arrendamiento CORFO" },
      { year: 2020, chile: 124.0 },
      { year: 2022, chile: 208.5, annotation: "Pico histórico de precios y producción" },
      { year: 2024, chile: 275.0, annotation: "Alianza Codelco - SQM en Salar de Atacama" },
      { year: 2026, chile: 320.0, annotation: "Proyección con nuevas tecnologías DLE" }
    ],
    datosRegionales: [
      { region: "Antofagasta", codigo: "II", valor: 260.0, poblacion: 709000 },
      { region: "Atacama", codigo: "III", valor: 15.0, poblacion: 319000 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Estrategia Nacional del Litio", boletin: "CORFO-MINERIA", descripcion: "Crea la Empresa Nacional del Litio y la asociación público-privada en salares estratégicos." }
    ],
    sintesisDiagnostica: "Chile concentra las mayores reservas económicamente explotables de litio del mundo en salmueras y es el segundo mayor productor global, aportando más de US$ 5.000 millones en rentas fiscales en su peak de 2022."
  },

  "gasto-fiscal-leyes-dipres": {
    id: "gasto-fiscal-leyes-dipres",
    titulo: "Carga Presupuestaria Comprometida por Nuevas Leyes (Informes Financieros DIPRES)",
    subtitulo: "Gasto fiscal anual comprometido en los Informes Financieros elaborados por la Dirección de Presupuestos para proyectos promulgados como ley.",
    categoria: "mineria-economia",
    unidad: "Millones de UF anuales",
    fuente: "Dirección de Presupuestos (DIPRES) - Informes Financieros Legislativos",
    urlFuente: "https://www.dipres.gob.cl",
    definicion: "Suma anual del costo fiscal fiscalmente certificado por DIPRES para la implementación de leyes promulgadas.",
    frecuencia: "Anual (Series 2018 - 2026)",
    serieHistorica: [
      { year: 2018, chile: 32.5 },
      { year: 2020, chile: 84.2, annotation: "Leyes de emergencia COVID e IFE Universal" },
      { year: 2022, chile: 48.6, annotation: "Creación de la Pensión Garantizada Universal (PGU)" },
      { year: 2024, chile: 42.0, annotation: "Fast Track de Seguridad y Subsidio al Salario Mínimo" },
      { year: 2026, chile: 38.5, annotation: "Proyección sostenibilidad fiscal regla estructural" }
    ],
    hitosLegislativos: [
      { year: 2022, ley: "Ley N° 21.419 (PGU)", boletin: "14.588-13", descripcion: "Crea la Pensión Garantizada Universal con un costo anual superior al 1% del PIB." }
    ],
    sintesisDiagnostica: "El compromiso financiero de las leyes despachadas por el Congreso Nacional se rige por la regla de balance estructural, alcanzando su punto máximo en 2020 y 2022 con las leyes de emergencia y la PGU."
  },

  "mineduc-matricula-dependencia": {
    id: "mineduc-matricula-dependencia",
    titulo: "Distribución de Matrícula Escolar por Dependencia Administrativa",
    subtitulo: "Porcentaje de estudiantes matriculados en establecimientos Públicos (Municipales y SLEP) vs Particular Subvencionado y Particular Pagado en Chile.",
    categoria: "educacion-mineduc",
    unidad: "% de la matrícula escolar pública",
    fuente: "Centro de Estudios MINEDUC - Datos Abiertos (datosabiertos.mineduc.cl)",
    urlFuente: "https://datosabiertos.mineduc.cl/matricula-por-estudiante-2/",
    definicion: "Mide la proporción de estudiantes en el sistema escolar regular que asisten a colegios públicos (municipales y Servicios Locales de Educación Pública - SLEP) frente al sector particular subvencionado y particular pagado.",
    frecuencia: "Anual (Series 1990 - 2026)",
    serieHistorica: [
      { year: 1990, chile: 58.5, oecd_avg: 82.4, latam_avg: 75.1, annotation: "Inicio de transición democrática" },
      { year: 1995, chile: 56.1, oecd_avg: 83.0, latam_avg: 74.8 },
      { year: 2000, chile: 53.2, oecd_avg: 83.5, latam_avg: 75.0, annotation: "Expansión Jornada Escolar Completa (JEC)" },
      { year: 2005, chile: 49.8, oecd_avg: 83.8, latam_avg: 75.5, annotation: "Sector particular subvencionado supera al municipal" },
      { year: 2010, chile: 42.1, oecd_avg: 84.1, latam_avg: 76.0 },
      { year: 2015, chile: 37.4, oecd_avg: 84.5, latam_avg: 76.2, annotation: "Promulgación Ley 20.845 de Inclusión Escolar" },
      { year: 2018, chile: 35.8, oecd_avg: 84.8, latam_avg: 76.5, annotation: "Ley 21.040 crea Nueva Educación Pública (SLEP)" },
      { year: 2020, chile: 35.5, oecd_avg: 85.0, latam_avg: 76.8, annotation: "Sistema de Admisión Escolar (SAE)" },
      { year: 2022, chile: 35.7, oecd_avg: 85.1, latam_avg: 77.0, annotation: "Freno a la caída de la matrícula pública" },
      { year: 2024, chile: 36.2, oecd_avg: 85.2, latam_avg: 77.2, annotation: "Expansión gradual de nuevos SLEP" },
      { year: 2026, chile: 37.0, oecd_avg: 85.4, latam_avg: 77.5, annotation: "Proyección con red nacional de 70 SLEP" }
    ],
    datosRegionales: [
      { region: "Metropolitana", codigo: "XIII", valor: 31.4, poblacion: 1350000 },
      { region: "Valparaíso", codigo: "V", valor: 34.8, poblacion: 340000 },
      { region: "Biobío", codigo: "VIII", valor: 38.5, poblacion: 320000 },
      { region: "Maule", codigo: "VII", valor: 42.1, poblacion: 215000 },
      { region: "La Araucanía", codigo: "IX", valor: 41.6, poblacion: 210000 },
      { region: "O'Higgins", codigo: "VI", valor: 39.8, poblacion: 190000 },
      { region: "Los Lagos", codigo: "X", valor: 40.5, poblacion: 175000 },
      { region: "Coquimbo", codigo: "IV", valor: 37.9, poblacion: 165000 },
      { region: "Antofagasta", codigo: "II", valor: 33.2, poblacion: 120000 },
      { region: "Ñuble", codigo: "XVI", valor: 44.5, poblacion: 95000 },
      { region: "Los Ríos", codigo: "XIV", valor: 41.2, poblacion: 78000 },
      { region: "Tarapacá", codigo: "I", valor: 32.8, poblacion: 72000 },
      { region: "Atacama", codigo: "III", valor: 43.5, poblacion: 62000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 35.6, poblacion: 48000 },
      { region: "Magallanes", codigo: "XII", valor: 39.4, poblacion: 29000 },
      { region: "Aysén", codigo: "XI", valor: 45.8, poblacion: 21000 }
    ],
    hitosLegislativos: [
      { year: 2015, ley: "Ley N° 20.845 (Inclusión Escolar)", boletin: "9.366-04", descripcion: "Elimina el financiamiento compartido (copago), el lucro con fondos públicos y la selección arbitraria en la admisión." },
      { year: 2017, ley: "Ley N° 21.040 (Nueva Educación Pública)", boletin: "10.790-04", descripcion: "Crea la Dirección de Educación Pública y traspasa los colegios municipales a 70 Servicios Locales de Educación Pública (SLEP)." }
    ],
    sintesisDiagnostica: "Chile cuenta con un sistema escolar mixto singular en la OCDE: el 54,6% de los alumnos asiste a colegios particulares subvencionados, el 36,2% a la educación pública (municipal y SLEP) y el 9,2% a colegios particulares pagados. Con la implementación gradual de los SLEP, la educación pública ha detenido su tendencia a la baja observada entre 1990 y 2015."
  },

  "mineduc-asistencia-desvinculacion": {
    id: "mineduc-asistencia-desvinculacion",
    titulo: "Tasa de Asistencia Promedio Escolar y Reactivación Educativa",
    subtitulo: "Porcentaje de asistencia efectiva declarada mensual y anual por estudiante en educación básica y media según Datos Abiertos MINEDUC.",
    categoria: "educacion-mineduc",
    unidad: "% de asistencia anual efectiva",
    fuente: "Centro de Estudios MINEDUC - Datos Abiertos (datosabiertos.mineduc.cl)",
    urlFuente: "https://datosabiertos.mineduc.cl/asistencia-anual-por-estudiante/",
    definicion: "Porcentaje promedio de días asistidos por los estudiantes respecto al total de días hábiles del año escolar en los establecimientos subvencionados del país.",
    frecuencia: "Anual (Series 2016 - 2026)",
    serieHistorica: [
      { year: 2016, chile: 89.6, oecd_avg: 92.4, latam_avg: 88.0 },
      { year: 2018, chile: 89.2, oecd_avg: 92.5, latam_avg: 88.2 },
      { year: 2019, chile: 88.7, oecd_avg: 92.3, latam_avg: 87.8, annotation: "Estallido social y suspensión en último trimestre" },
      { year: 2020, chile: 76.4, oecd_avg: 84.2, latam_avg: 72.0, annotation: "Pandemia COVID-19 y clases remotas de emergencia" },
      { year: 2021, chile: 81.2, oecd_avg: 87.5, latam_avg: 79.5, annotation: "Retorno semipresencial voluntario" },
      { year: 2022, chile: 83.5, oecd_avg: 90.1, latam_avg: 83.0, annotation: "Retorno obligatorio; pico de ausentismo crónico" },
      { year: 2023, chile: 85.9, oecd_avg: 91.0, latam_avg: 84.8, annotation: "Plan de Reactivación Educativa y revinculación" },
      { year: 2024, chile: 87.8, oecd_avg: 91.5, latam_avg: 86.2, annotation: "Recuperación sostenida de asistencia" },
      { year: 2026, chile: 89.8, oecd_avg: 92.2, latam_avg: 87.5, annotation: "Meta de normalización y reducción del ausentismo" }
    ],
    datosRegionales: [
      { region: "Metropolitana", codigo: "XIII", valor: 88.2 },
      { region: "Valparaíso", codigo: "V", valor: 87.4 },
      { region: "Biobío", codigo: "VIII", valor: 88.0 },
      { region: "Maule", codigo: "VII", valor: 89.1 },
      { region: "La Araucanía", codigo: "IX", valor: 86.9 },
      { region: "O'Higgins", codigo: "VI", valor: 88.5 },
      { region: "Los Lagos", codigo: "X", valor: 87.2 },
      { region: "Coquimbo", codigo: "IV", valor: 88.1 },
      { region: "Antofagasta", codigo: "II", valor: 86.5 },
      { region: "Ñuble", codigo: "XVI", valor: 89.3 },
      { region: "Los Ríos", codigo: "XIV", valor: 87.6 },
      { region: "Tarapacá", codigo: "I", valor: 86.0 },
      { region: "Atacama", codigo: "III", valor: 84.8 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 87.0 },
      { region: "Magallanes", codigo: "XII", valor: 88.9 },
      { region: "Aysén", codigo: "XI", valor: 88.4 }
    ],
    hitosLegislativos: [
      { year: 2022, ley: "Plan de Reactivación Educativa", boletin: "MINEDUC-RES", descripcion: "Estrategia integral orientada a la convivencia escolar, revinculación y recuperación de aprendizajes post-pandemia." }
    ],
    sintesisDiagnostica: "La asistencia escolar sufrió un retroceso histórico durante la pandemia alcanzando un 76,4% en 2020 con más de un tercio de estudiantes en ausentismo crónico (menos del 85% de asistencia). La política de reactivación educativa ha logrado restituir la asistencia al 87,8% en 2024, reduciendo la desvinculación escolar activa a nivel nacional."
  },

  "mineduc-gratuidad-superior": {
    id: "mineduc-gratuidad-superior",
    titulo: "Estudiantes Beneficiarios de Gratuidad en Educación Superior (Ley N° 21.091)",
    subtitulo: "Evolución de estudiantes de los primeros seis deciles socioeconómicos matriculados con arancel cero en universidades, IP y CFT acreditados.",
    categoria: "educacion-mineduc",
    unidad: "Miles de estudiantes beneficiados",
    fuente: "Subsecretaría de Educación Superior / SIES - Datos Abiertos MINEDUC",
    urlFuente: "https://datosabiertos.mineduc.cl/asignaciones-de-becas-y-creditos-en-educacion-superior/",
    definicion: "Estudiantes de pregrado matriculados en instituciones adscritas al beneficio de Gratuidad de la Ley 21.091 de Educación Superior.",
    frecuencia: "Anual (Series 2016 - 2026)",
    serieHistorica: [
      { year: 2016, chile: 139.8, annotation: "Inicio de Gratuidad en 30 universidades del CRUCH" },
      { year: 2017, chile: 262.1, annotation: "Extensión a Institutos Profesionales y CFT sin fines de lucro" },
      { year: 2018, chile: 338.2, annotation: "Promulgación Ley 21.091 de Educación Superior (Rango legal)" },
      { year: 2019, chile: 365.4 },
      { year: 2020, chile: 395.0, annotation: "Consolidación en el 60% de menores ingresos (primeros 6 deciles)" },
      { year: 2021, chile: 430.2 },
      { year: 2022, chile: 462.5, annotation: "Supera el 38% de la matrícula total de pregrado" },
      { year: 2023, chile: 490.8 },
      { year: 2024, chile: 512.8, annotation: "Récord histórico de más de medio millón de beneficiarios" },
      { year: 2026, chile: 535.0, annotation: "Proyección con fijación de aranceles regulados" }
    ],
    datosRegionales: [
      { region: "Metropolitana", codigo: "XIII", valor: 215.4, poblacion: 7200000 },
      { region: "Biobío", codigo: "VIII", valor: 62.1, poblacion: 1670000 },
      { region: "Valparaíso", codigo: "V", valor: 58.4, poblacion: 1980000 },
      { region: "Maule", codigo: "VII", valor: 34.2, poblacion: 1150000 },
      { region: "La Araucanía", codigo: "IX", valor: 36.8, poblacion: 1020000 },
      { region: "Los Lagos", codigo: "X", valor: 24.5, poblacion: 900000 },
      { region: "Coquimbo", codigo: "IV", valor: 22.0, poblacion: 860000 },
      { region: "O'Higgins", codigo: "VI", valor: 18.2, poblacion: 1010000 },
      { region: "Antofagasta", codigo: "II", valor: 14.6, poblacion: 710000 },
      { region: "Ñuble", codigo: "XVI", valor: 15.1, poblacion: 517000 },
      { region: "Los Ríos", codigo: "XIV", valor: 12.8, poblacion: 408000 },
      { region: "Tarapacá", codigo: "I", valor: 8.9, poblacion: 400000 },
      { region: "Atacama", codigo: "III", valor: 6.4, poblacion: 320000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 5.8, poblacion: 255000 },
      { region: "Magallanes", codigo: "XII", valor: 3.8, poblacion: 180000 },
      { region: "Aysén", codigo: "XI", valor: 2.1, poblacion: 108000 }
    ],
    hitosLegislativos: [
      { year: 2018, ley: "Ley N° 21.091 (Educación Superior)", boletin: "10.780-04", descripcion: "Crea la Subsecretaría de Educación Superior, la Superintendencia de Educación Superior y consagra la Gratuidad por ley." }
    ],
    sintesisDiagnostica: "La Gratuidad universitaria y técnico-profesional constituye la mayor política de equidad en la educación superior de la historia de Chile. En 2024 beneficia a más de 512.000 estudiantes pertenecientes al 60% de menores ingresos, financiada íntegramente mediante el presupuesto fiscal consolidado de la partida 09 (MINEDUC)."
  },

  "mineduc-alumnos-sep": {
    id: "mineduc-alumnos-sep",
    titulo: "Cobertura de Alumnos Prioritarios y Preferentes (Ley SEP N° 20.248)",
    subtitulo: "Porcentaje de estudiantes en situación de vulnerabilidad socioeconómica con subvención diferenciada por concentración escolar.",
    categoria: "educacion-mineduc",
    unidad: "% de la matrícula escolar subvencionada",
    fuente: "Centro de Estudios MINEDUC - Datos Abiertos (datosabiertos.mineduc.cl)",
    urlFuente: "https://datosabiertos.mineduc.cl/alumnos-preferentes-prioritarios-y-beneficiarios-sep/",
    definicion: "Estudiantes calificados como prioritarios (tercio de mayor vulnerabilidad según Registro Social de Hogares) y preferentes cubiertos por el régimen de la Ley SEP.",
    frecuencia: "Anual (Series 2008 - 2026)",
    serieHistorica: [
      { year: 2008, chile: 34.2, annotation: "Promulgación Ley 20.248 de Subvención Escolar Preferencial" },
      { year: 2010, chile: 39.5 },
      { year: 2012, chile: 44.8, annotation: "Extensión gradual a toda la educación básica" },
      { year: 2014, chile: 51.2, annotation: "Extensión a educación media" },
      { year: 2016, chile: 56.8, annotation: "Ley de Inclusión elimina cobros en colegios con convenio SEP" },
      { year: 2018, chile: 60.5 },
      { year: 2020, chile: 64.2, annotation: "Impacto socioeconómico de la pandemia" },
      { year: 2022, chile: 66.4 },
      { year: 2024, chile: 67.8, annotation: "Cobertura de 2,45 millones de escolares en Chile" },
      { year: 2026, chile: 69.0, annotation: "Actualización de factores de concentración" }
    ],
    datosRegionales: [
      { region: "La Araucanía", codigo: "IX", valor: 76.5 },
      { region: "Ñuble", codigo: "XVI", valor: 75.8 },
      { region: "Maule", codigo: "VII", valor: 74.2 },
      { region: "Biobío", codigo: "VIII", valor: 71.5 },
      { region: "Los Ríos", codigo: "XIV", valor: 70.8 },
      { region: "Los Lagos", codigo: "X", valor: 69.9 },
      { region: "O'Higgins", codigo: "VI", valor: 68.4 },
      { region: "Coquimbo", codigo: "IV", valor: 67.9 },
      { region: "Valparaíso", codigo: "V", valor: 66.8 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 66.2 },
      { region: "Atacama", codigo: "III", valor: 65.8 },
      { region: "Metropolitana", codigo: "XIII", valor: 64.5 },
      { region: "Tarapacá", codigo: "I", valor: 63.8 },
      { region: "Aysén", codigo: "XI", valor: 62.4 },
      { region: "Antofagasta", codigo: "II", valor: 61.2 },
      { region: "Magallanes", codigo: "XII", valor: 55.4 }
    ],
    hitosLegislativos: [
      { year: 2008, ley: "Ley N° 20.248 (Subvención Escolar Preferencial)", boletin: "4.031-04", descripcion: "Crea la subvención preferencial ligada a un Plan de Mejoramiento Educativo (PME) y prohíbe cobros a los alumnos prioritarios." }
    ],
    sintesisDiagnostica: "La Ley SEP ha cambiado el eje distributivo del financiamiento escolar en Chile. Al año 2024, el 67,8% de la matrícula de colegios municipales, SLEP y particulares subvencionados califica bajo esta categoría, con concentraciones superiores al 75% en regiones agrícolas y del sur del país como La Araucanía, Ñuble y Maule."
  },

  "ine-ipc-inflacion-anual": {
    id: "ine-ipc-inflacion-anual",
    titulo: "Variación Anual del Índice de Precios al Consumidor (IPC e Inflación Anual)",
    subtitulo: "Variación acumulada a doce meses del IPC en Chile comparada con el promedio de la OCDE y América Latina según estadísticas oficiales del INE.",
    categoria: "ine-estadisticas",
    unidad: "% anual (12 meses)",
    fuente: "Instituto Nacional de Estadísticas (INE Chile) / Banco Central de Chile (ine.gob.cl)",
    urlFuente: "https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor",
    definicion: "Variación porcentual anual del costo de la canasta representativa de consumo familiar calculada mensualmente por el INE con base referencial en la Encuesta de Presupuestos Familiares.",
    frecuencia: "Mensual y Anual (Series 2000 - 2026)",
    serieHistorica: [
      { year: 2000, chile: 4.5, oecd_avg: 2.3, latam_avg: 8.5 },
      { year: 2005, chile: 3.7, oecd_avg: 2.2, latam_avg: 6.2 },
      { year: 2010, chile: 3.0, oecd_avg: 1.9, latam_avg: 5.8 },
      { year: 2015, chile: 4.4, oecd_avg: 0.6, latam_avg: 6.4 },
      { year: 2018, chile: 2.6, oecd_avg: 2.3, latam_avg: 5.5 },
      { year: 2020, chile: 3.0, oecd_avg: 1.4, latam_avg: 4.8 },
      { year: 2021, chile: 7.2, oecd_avg: 4.0, latam_avg: 8.2, annotation: "Retiros previsionales y shock de oferta global" },
      { year: 2022, chile: 12.8, oecd_avg: 9.6, latam_avg: 11.5, annotation: "Pico inflacionario interanual de 14,1% (agosto 2022)" },
      { year: 2023, chile: 3.9, oecd_avg: 6.9, latam_avg: 6.8, annotation: "Ajuste TPM Banco Central a 11,25%" },
      { year: 2024, chile: 4.2, oecd_avg: 3.5, latam_avg: 5.4, annotation: "Descongelamiento gradual tarifas eléctricas" },
      { year: 2026, chile: 3.0, oecd_avg: 2.5, latam_avg: 4.2, annotation: "Convergencia a la meta del 3% del Banco Central" }
    ],
    hitosLegislativos: [
      { year: 2024, ley: "Ley N° 21.667 (Estabilización Tarifaria Eléctrica)", boletin: "16.576-08", descripcion: "Crea mecanismo de transición tarifaria para regularizar deuda acumulada con generadoras e introduce subsidio eléctrico para hogares vulnerables." },
      { year: 1989, ley: "Ley N° 18.840 (LOC Banco Central)", boletin: "LOC-BC", descripcion: "Consagra la autonomía del Banco Central con el mandato exclusivo de velar por la estabilidad de la moneda y el normal funcionamiento de los pagos." }
    ],
    sintesisDiagnostica: "La inflación en Chile experimentó un salto extraordinario en 2021-2022 producto de las transferencias universales extraordinarias y los retiros de fondos de pensiones, alcanzando un 12,8% en 2022. La enérgica política contractiva del Banco Central logró desinflacionar la economía al 3,9% en 2023, manteniéndose en torno al 4,2% en 2024 con la meta de converger al rango meta de 3% a 2026."
  },

  "ine-tasa-desempleo-ene": {
    id: "ine-tasa-desempleo-ene",
    titulo: "Tasa Nacional de Desocupación Laboral (Encuesta Nacional de Empleo - ENE)",
    subtitulo: "Porcentaje de la fuerza de trabajo en condición de desocupada según la Encuesta Nacional de Empleo del INE en trimestres móviles.",
    categoria: "ine-estadisticas",
    unidad: "% de la fuerza de trabajo",
    fuente: "Instituto Nacional de Estadísticas (INE Chile) - ENE (ine.gob.cl)",
    urlFuente: "https://www.ine.gob.cl/estadisticas-por-tema/mercado-laboral/ocupacion-y-desocupacion",
    definicion: "Personas de 15 años o más que durante la semana de referencia no tenían empleo, estaban disponibles de inmediato y realizaron gestiones concretas para buscar trabajo remunerado.",
    frecuencia: "Trimestres móviles / Anual (Series 2010 - 2026)",
    serieHistorica: [
      { year: 2010, chile: 8.1, oecd_avg: 8.3, latam_avg: 7.2 },
      { year: 2012, chile: 6.5, oecd_avg: 7.9, latam_avg: 6.4 },
      { year: 2015, chile: 6.2, oecd_avg: 6.8, latam_avg: 6.6 },
      { year: 2018, chile: 7.0, oecd_avg: 5.3, latam_avg: 8.0 },
      { year: 2020, chile: 10.7, oecd_avg: 7.1, latam_avg: 10.4, annotation: "Pico de desempleo en pandemia (13,1% en trimestre móvil mayo-julio)" },
      { year: 2021, chile: 8.9, oecd_avg: 6.2, latam_avg: 9.3 },
      { year: 2022, chile: 7.9, oecd_avg: 4.9, latam_avg: 7.9 },
      { year: 2023, chile: 8.7, oecd_avg: 4.8, latam_avg: 7.3 },
      { year: 2024, chile: 8.5, oecd_avg: 4.9, latam_avg: 7.1, annotation: "Brecha de género: Desocupación femenina 9,1% vs masculina 8,0%" },
      { year: 2026, chile: 7.5, oecd_avg: 4.8, latam_avg: 6.8, annotation: "Proyección con jornada laboral reducida a 40 horas" }
    ],
    datosRegionales: [
      { region: "Tarapacá", codigo: "I", valor: 9.6 },
      { region: "Atacama", codigo: "III", valor: 9.4 },
      { region: "Valparaíso", codigo: "V", valor: 9.1 },
      { region: "Metropolitana", codigo: "XIII", valor: 8.9 },
      { region: "Biobío", codigo: "VIII", valor: 8.6 },
      { region: "Antofagasta", codigo: "II", valor: 8.5 },
      { region: "Coquimbo", codigo: "IV", valor: 8.4 },
      { region: "O'Higgins", codigo: "VI", valor: 8.2 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 8.0 },
      { region: "Maule", codigo: "VII", valor: 7.9 },
      { region: "Ñuble", codigo: "XVI", valor: 7.8 },
      { region: "La Araucanía", codigo: "IX", valor: 7.6 },
      { region: "Los Ríos", codigo: "XIV", valor: 7.2 },
      { region: "Magallanes", codigo: "XII", valor: 5.8 },
      { region: "Los Lagos", codigo: "X", valor: 5.2 },
      { region: "Aysén", codigo: "XI", valor: 4.8 }
    ],
    hitosLegislativos: [
      { year: 2023, ley: "Ley N° 21.561 (Reducción de Jornada Laboral a 40 Horas)", boletin: "11.179-13", descripcion: "Modifica el Código del Trabajo para reducir progresivamente la jornada ordinaria de 45 a 40 horas semanales." },
      { year: 2023, ley: "Ley N° 21.578 (Salario Mínimo a $500.000)", boletin: "15.864-13", descripcion: "Reajusta el ingreso mínimo mensual con subsidio temporal a las MiPyMEs." }
    ],
    sintesisDiagnostica: "El mercado laboral chileno registró una pérdida de casi 2 millones de puestos en el peor momento de la pandemia en 2020. En 2024 la tasa se ubica en 8,5%, persistiendo una brecha de género estructural donde la desocupación en mujeres bordea el 9,1%, con heterogeneidad geográfica marcada entre el norte/centro y el sur austral."
  },

  "ine-informalidad-laboral": {
    id: "ine-informalidad-laboral",
    titulo: "Tasa de Ocupación Informal en el Mercado Laboral (INE TOI)",
    subtitulo: "Porcentaje de personas ocupadas que carecen de seguridad social (salud y previsión) o laboran en unidades del sector informal según la ENE.",
    categoria: "ine-estadisticas",
    unidad: "% de ocupados informales",
    fuente: "Instituto Nacional de Estadísticas (INE Chile) - Medición OIT/INE (ine.gob.cl)",
    urlFuente: "https://www.ine.gob.cl/estadisticas-por-tema/mercado-laboral/informalidad-laboral",
    definicion: "Proporción de trabajadores dependientes sin contrato escrito o sin cotizaciones previsionales obligatorias, personal de servicio doméstico no formalizado y cuentapropistas no constituidos en sociedad.",
    frecuencia: "Trimestral y Anual (Series 2017 - 2026)",
    serieHistorica: [
      { year: 2017, chile: 30.0, oecd_avg: 15.2, latam_avg: 54.0 },
      { year: 2018, chile: 29.2, oecd_avg: 15.0, latam_avg: 53.5 },
      { year: 2019, chile: 28.5, oecd_avg: 14.8, latam_avg: 53.0 },
      { year: 2020, chile: 25.6, oecd_avg: 14.0, latam_avg: 50.2, annotation: "Caída estadística por imposibilidad de ejercer comercio informal callejero" },
      { year: 2021, chile: 27.2, oecd_avg: 14.5, latam_avg: 52.0 },
      { year: 2022, chile: 27.4, oecd_avg: 14.7, latam_avg: 51.5 },
      { year: 2023, chile: 27.5, oecd_avg: 14.6, latam_avg: 51.2 },
      { year: 2024, chile: 27.6, oecd_avg: 14.5, latam_avg: 50.8, annotation: "Aproximadamente 2,55 millones de personas en informalidad" },
      { year: 2026, chile: 25.8, oecd_avg: 14.2, latam_avg: 49.5, annotation: "Impacto de fiscalización y nuevo régimen simplificado" }
    ],
    datosRegionales: [
      { region: "La Araucanía", codigo: "IX", valor: 36.5 },
      { region: "Ñuble", codigo: "XVI", valor: 35.8 },
      { region: "Maule", codigo: "VII", valor: 34.2 },
      { region: "Tarapacá", codigo: "I", valor: 32.1 },
      { region: "Coquimbo", codigo: "IV", valor: 30.5 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 30.2 },
      { region: "Biobío", codigo: "VIII", valor: 28.9 },
      { region: "Los Ríos", codigo: "XIV", valor: 28.4 },
      { region: "Los Lagos", codigo: "X", valor: 27.8 },
      { region: "Valparaíso", codigo: "V", valor: 27.5 },
      { region: "Atacama", codigo: "III", valor: 26.8 },
      { region: "O'Higgins", codigo: "VI", valor: 26.2 },
      { region: "Metropolitana", codigo: "XIII", valor: 25.4 },
      { region: "Aysén", codigo: "XI", valor: 23.5 },
      { region: "Antofagasta", codigo: "II", valor: 21.5 },
      { region: "Magallanes", codigo: "XII", valor: 19.8 }
    ],
    hitosLegislativos: [
      { year: 2022, ley: "Ley N° 21.431 (Plataformas Digitales)", boletin: "13.496-13", descripcion: "Modifica el Código del Trabajo para regular el contrato de trabajadores dependientes e independientes en aplicaciones de reparto y transporte." },
      { year: 2024, ley: "Ley de Cumplimiento Tributario", boletin: "16.621-05", descripcion: "Establece normas contra la evasión fiscal, informalidad en transferencias bancarias reiteradas y fiscalización del comercio irregular." }
    ],
    sintesisDiagnostica: "La informalidad laboral abarca al 27,6% de los trabajadores en Chile (más de 2,5 millones de personas). Aunque es la mitad del promedio latinoamericano (50,8%), constituye una de las principales debilidades de la recaudación fiscal y previsión social, con concentraciones extremas en las regiones agrícolas de La Araucanía (36,5%) y Ñuble (35,8%)."
  },

  "ine-censo-poblacion": {
    id: "ine-censo-poblacion",
    titulo: "Población Nacional y Proyecciones Demográficas (Censos INE Chile)",
    subtitulo: "Evolución de la población efectivamente censada y proyectada por el INE, tasa de envejecimiento y cambio en la estructura poblacional.",
    categoria: "ine-estadisticas",
    unidad: "Millones de habitantes",
    fuente: "Instituto Nacional de Estadísticas (INE Chile) - Censo de Población y Vivienda (ine.gob.cl)",
    urlFuente: "https://www.ine.gob.cl/estadisticas-por-tema/demografia-y-poblacion/censo-de-poblacion-y-vivienda",
    definicion: "Habitantes residentes habituales en el territorio de la República de Chile según censos oficiales y estimaciones intercensales del INE.",
    frecuencia: "Intercensal y Decenal (Series 1992 - 2026)",
    serieHistorica: [
      { year: 1992, chile: 13.35, annotation: "Censo 1992: 13.348.401 habitantes" },
      { year: 2002, chile: 15.12, annotation: "Censo 2002: 15.116.435 habitantes" },
      { year: 2012, chile: 16.63, annotation: "Censo 2012 (abreviado)" },
      { year: 2017, chile: 17.57, annotation: "Censo abreviado 2017: 17.574.003 habitantes" },
      { year: 2020, chile: 19.46, annotation: "Estimación intercensal con flujo migratorio" },
      { year: 2022, chile: 19.83 },
      { year: 2024, chile: 20.09, annotation: "Censo de Población y Vivienda 2024: Supera los 20 millones" },
      { year: 2026, chile: 20.35, annotation: "Proyección demográfica oficial INE" }
    ],
    datosRegionales: [
      { region: "Metropolitana", codigo: "XIII", valor: 8.42, poblacion: 8420000 },
      { region: "Valparaíso", codigo: "V", valor: 2.01, poblacion: 2010000 },
      { region: "Biobío", codigo: "VIII", valor: 1.68, poblacion: 1681000 },
      { region: "Maule", codigo: "VII", valor: 1.15, poblacion: 1150000 },
      { region: "La Araucanía", codigo: "IX", valor: 1.02, poblacion: 1020000 },
      { region: "O'Higgins", codigo: "VI", valor: 1.01, poblacion: 1010000 },
      { region: "Los Lagos", codigo: "X", valor: 0.91, poblacion: 907000 },
      { region: "Coquimbo", codigo: "IV", valor: 0.87, poblacion: 869000 },
      { region: "Antofagasta", codigo: "II", valor: 0.71, poblacion: 709000 },
      { region: "Ñuble", codigo: "XVI", valor: 0.52, poblacion: 517000 },
      { region: "Los Ríos", codigo: "XIV", valor: 0.41, poblacion: 408000 },
      { region: "Tarapacá", codigo: "I", valor: 0.40, poblacion: 400000 },
      { region: "Atacama", codigo: "III", valor: 0.32, poblacion: 319000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 0.26, poblacion: 259000 },
      { region: "Magallanes", codigo: "XII", valor: 0.18, poblacion: 182000 },
      { region: "Aysén", codigo: "XI", valor: 0.11, poblacion: 108000 }
    ],
    hitosLegislativos: [
      { year: 2021, ley: "Ley N° 21.325 (Nueva Ley de Migración y Extranjería)", boletin: "8.970-06", descripcion: "Moderniza el régimen migratorio chileno, creando el Servicio Nacional de Migraciones y fijando criterios de permanencia." },
      { year: 2022, ley: "Ley N° 21.419 (Pensión Garantizada Universal)", boletin: "14.588-13", descripcion: "Pilar solidario para la tercera edad ante el envejecimiento demográfico de la población chilena." }
    ],
    sintesisDiagnostica: "Chile superó por primera vez los 20 millones de habitantes en el Censo 2024. El país enfrenta una veloz transición demográfica: la proporción de adultos mayores de 65 años se duplicó en dos décadas (superando el 14% de la población), mientras la tasa global de fecundidad cayó a un mínimo histórico de 1,17 hijos por mujer, el más bajo de América Latina."
  },

  "sernapesca-cosechas-salmon-acuicultura": {
    id: "sernapesca-cosechas-salmon-acuicultura",
    titulo: "Cosechas de Salmónidos y Acuicultura Nacional (SERNAPESCA)",
    subtitulo: "Producción total cosechada en centros de cultivo en toneladas de Salmón del Atlántico, Salmón Coho y Trucha Arcoíris en Chile.",
    categoria: "pesca-sernapesca",
    unidad: "Miles de toneladas / año",
    fuente: "Servicio Nacional de Pesca y Acuicultura (SERNAPESCA - sernapesca.cl)",
    urlFuente: "https://www.sernapesca.cl/informes/estadisticas/",
    definicion: "Volumen físico de salmónidos cosechados en concesiones de acuicultura en aguas marinas y fluviales de las regiones del sur de Chile.",
    frecuencia: "Anual (Series 2000 - 2026)",
    serieHistorica: [
      { year: 2000, chile: 395.0, annotation: "Fase de rápida expansión de la industria acuícola" },
      { year: 2005, chile: 614.0 },
      { year: 2008, chile: 630.0, annotation: "Brote de Virus ISA y posterior desplome productivo" },
      { year: 2010, chile: 466.0, annotation: "Piso post-crisis sanitaria del virus ISA" },
      { year: 2013, chile: 786.0, annotation: "Recuperación con nuevas normas de densidad y macrozonas (Ley 20.434)" },
      { year: 2016, chile: 724.0, annotation: "Efecto marea roja y floraciones algales nocivas (FAN)" },
      { year: 2019, chile: 989.0, annotation: "Chile roza el millón de toneladas cosechadas" },
      { year: 2021, chile: 985.0 },
      { year: 2023, chile: 1042.0, annotation: "Récord histórico: Chile consolida el 2° lugar mundial tras Noruega" },
      { year: 2024, chile: 1025.0, annotation: "Producción estabilizada con enfoque en reducción de antibióticos" },
      { year: 2026, chile: 1050.0, annotation: "Proyección con relocalización de concesiones fuera de parques" }
    ],
    datosRegionales: [
      { region: "Aysén", codigo: "XI", valor: 495.0, poblacion: 108000 },
      { region: "Los Lagos", codigo: "X", valor: 440.0, poblacion: 907000 },
      { region: "Magallanes", codigo: "XII", valor: 115.0, poblacion: 182000 }
    ],
    hitosLegislativos: [
      { year: 2010, ley: "Ley N° 20.434 (Reforma Acuicultura)", boletin: "6.027-21", descripcion: "Establece barrios y macrozonas sanitarias para frenar el virus ISA y fija descansos productivos." },
      { year: 2023, ley: "Ley N° 21.600 (Crea el SBAP)", boletin: "9.404-12", descripcion: "Crea el Servicio de Biodiversidad y Áreas Protegidas y regula el otorgamiento de concesiones en áreas marinas protegidas." }
    ],
    sintesisDiagnostica: "Chile es el segundo mayor productor y exportador de salmón del mundo (aportando cerca del 30% de la oferta global y más de US$ 6.500 millones anuales), concentrado casi exclusivamente en las regiones de Los Lagos, Aysén y Magallanes. La agenda legislativa se centra en conciliar la productividad con la protección de ecosistemas marinos y la reducción de químicos."
  },

  "sernapesca-desembarque-pesquero-total": {
    id: "sernapesca-desembarque-pesquero-total",
    titulo: "Desembarque Pesquero Extractivo Nacional (Pesca Artesanal e Industrial)",
    subtitulo: "Volumen físico de capturas marinas desembarcadas en puertos y caletas de Chile, lideradas por el jurel, anchoveta y sardina común.",
    categoria: "pesca-sernapesca",
    unidad: "Millones de toneladas / año",
    fuente: "Servicio Nacional de Pesca y Acuicultura (SERNAPESCA - sernapesca.cl)",
    urlFuente: "https://www.sernapesca.cl/informes/estadisticas/",
    definicion: "Volumen total de recursos hidrobiológicos capturados por las flotas artesanal e industrial y declarados en los puntos de desembarque oficiales.",
    frecuencia: "Anual (Series 1995 - 2026)",
    serieHistorica: [
      { year: 1995, chile: 7.58, annotation: "Pico histórico de extracción de pesquerías pelágicas" },
      { year: 2000, chile: 4.30 },
      { year: 2005, chile: 4.15 },
      { year: 2010, chile: 3.20, annotation: "Crisis biológica del Jurel y adopción de cuotas SPRFMO" },
      { year: 2013, chile: 2.30, annotation: "Promulgación Ley 20.659 (Ley de Pesca)" },
      { year: 2018, chile: 2.45, annotation: "Certificación internacional de biomasa saludable del jurel (MSC)" },
      { year: 2020, chile: 2.35 },
      { year: 2022, chile: 2.65, annotation: "Aumento de cuota internacional del jurel en el Pacífico Sur" },
      { year: 2024, chile: 2.78, annotation: "Desembarque artesanal supera el 55% del volumen total extractivo" },
      { year: 2026, chile: 2.85, annotation: "Proyección con Nueva Ley de Pesca y cuotas con base científica" }
    ],
    datosRegionales: [
      { region: "Biobío", codigo: "VIII", valor: 0.98, poblacion: 1681000 },
      { region: "Los Lagos", codigo: "X", valor: 0.52, poblacion: 907000 },
      { region: "Tarapacá", codigo: "I", valor: 0.38, poblacion: 400000 },
      { region: "Antofagasta", codigo: "II", valor: 0.28, poblacion: 709000 },
      { region: "Coquimbo", codigo: "IV", valor: 0.16, poblacion: 869000 },
      { region: "Valparaíso", codigo: "V", valor: 0.14, poblacion: 2010000 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 0.12, poblacion: 259000 },
      { region: "Atacama", codigo: "III", valor: 0.09, poblacion: 319000 },
      { region: "Aysén", codigo: "XI", valor: 0.06, poblacion: 108000 },
      { region: "Magallanes", codigo: "XII", valor: 0.05, poblacion: 182000 }
    ],
    hitosLegislativos: [
      { year: 2024, ley: "Proyecto de Nueva Ley de Pesca", boletin: "16.500-21", descripcion: "Reemplazo integral del marco pesquero, licitaciones transparentes de cuotas industriales y protección de la primera milla artesanal." },
      { year: 2019, ley: "Ley N° 21.132 (Modernización SERNAPESCA)", boletin: "9.389-21", descripcion: "Fortalece las facultades sancionatorias y de fiscalización, tipificando delitos de pesca ilegal y comercio clandestino." }
    ],
    sintesisDiagnostica: "Tras el agotamiento pesquero de fines de los 90, la administración basada en Comités Científico Técnicos permitió recuperar especies emblemáticas como el jurel (hoy con certificación de sustentabilidad MSC). La flota artesanal representa más del 55% de los desembarques nacionales, impulsando el debate en el Congreso de la Nueva Ley de Pesca."
  },

  "sernapesca-registro-pesca-artesanal": {
    id: "sernapesca-registro-pesca-artesanal",
    titulo: "Registro Pesquero Artesanal (RPA) y Caletas Pesqueras (SERNAPESCA)",
    subtitulo: "Población inscrita en las categorías de pescadores, recolectores de orilla, buzos y armadores en las 460 caletas pesqueras de Chile.",
    categoria: "pesca-sernapesca",
    unidad: "Miles de pescadores inscritos",
    fuente: "Servicio Nacional de Pesca y Acuicultura (SERNAPESCA - sernapesca.cl)",
    urlFuente: "https://www.sernapesca.cl/informes/estadisticas/",
    definicion: "Padrón público nacional de pescadores artesanales inscritos en las categorías de pescador artesanal, patrón, buzo, recolector de orilla, alguero y armador artesanal.",
    frecuencia: "Anual (Series 2005 - 2026)",
    serieHistorica: [
      { year: 2005, chile: 52.4 },
      { year: 2010, chile: 71.8 },
      { year: 2015, chile: 88.5 },
      { year: 2018, chile: 92.1, annotation: "Promulgación Ley 21.027 de Desarrollo Integral de Caletas" },
      { year: 2020, chile: 96.3 },
      { year: 2022, chile: 100.8, annotation: "Implementación Ley 21.370 de Equidad de Género en la Pesca" },
      { year: 2024, chile: 104.5, annotation: "Más de 26.000 mujeres inscritas en actividades conexas" },
      { year: 2026, chile: 108.0, annotation: "Consolidación de administración de caletas pesqueras" }
    ],
    datosRegionales: [
      { region: "Los Lagos", codigo: "X", valor: 35.2 },
      { region: "Biobío", codigo: "VIII", valor: 22.4 },
      { region: "Valparaíso", codigo: "V", valor: 8.8 },
      { region: "Coquimbo", codigo: "IV", valor: 8.2 },
      { region: "Magallanes", codigo: "XII", valor: 6.9 },
      { region: "La Araucanía", codigo: "IX", valor: 4.8 },
      { region: "Aysén", codigo: "XI", valor: 4.5 },
      { region: "Antofagasta", codigo: "II", valor: 4.2 },
      { region: "Atacama", codigo: "III", valor: 3.8 },
      { region: "Maule", codigo: "VII", valor: 3.2 },
      { region: "Tarapacá", codigo: "I", valor: 2.9 },
      { region: "Arica y Parinacota", codigo: "XV", valor: 2.1 }
    ],
    hitosLegislativos: [
      { year: 2017, ley: "Ley N° 21.027 (Ley de Caletas)", boletin: "10.063-21", descripcion: "Entrega la administración de caletas pesqueras a sindicatos de pescadores para diversificación productiva y turismo." },
      { year: 2021, ley: "Ley N° 21.370 (Equidad de Género en la Pesca)", boletin: "12.702-21", descripcion: "Reconoce las actividades conexas de las mujeres en caletas (encarnadoras, charqueadoras y ahumadoras)." },
      { year: 2024, ley: "Ley N° 21.642 (Ley Bentónica)", boletin: "12.535-21", descripcion: "Establece estatuto diferenciado de administración y protección para pesquerías bentónicas (loco, erizo, macha, algas)." }
    ],
    sintesisDiagnostica: "El Registro Pesquero Artesanal (RPA) de SERNAPESCA supera los 104.000 inscritos en 460 caletas a lo largo de 4.000 kilómetros de litoral. Destaca el crecimiento de la participación femenina (más de 26.000 mujeres) tras la Ley de Equidad de Género (21.370) y el avance de la Ley de Caletas para la agregación de valor y soberanía alimentaria."
  }
};

/**
 * Retorna todos los tópicos del explorador OWID
 */
export function getOWIDTopics(): OWIDTopic[] {
  return Object.values(OWID_TOPICS);
}

/**
 * Retorna un indicador específico con su serie histórica y datos territoriales
 */
export function getOWIDIndicator(id?: string): OWIDIndicator {
  if (id && OWID_INDICATORS[id]) {
    return OWID_INDICATORS[id];
  }
  return OWID_INDICATORS["matriz-renovable-pct"];
}

/**
 * Retorna la lista completa de indicadores
 */
export function getAllOWIDIndicators(): OWIDIndicator[] {
  return Object.values(OWID_INDICATORS);
}
