/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Globe, Scale, FileText, BookOpen, Search, ArrowRight, 
  CheckCircle, Sparkles, Layers, Shield, Building2, ExternalLink, Download, 
  RefreshCw, Filter, BookMarked, Bookmark, Plus, Check, X, Copy, 
  SlidersHorizontal, ChevronRight, ChevronDown, ChevronUp, Tag, Share2, HelpCircle, Eye, Info,
  FileSpreadsheet, Printer, FileDown, CheckCheck, Target, ShieldAlert, Wrench
} from "lucide-react";
import MatrizComparadaTable, { MatrizColumna, MatrizComparadaData, TODAS_LAS_MATRICES } from "../components/MatrizComparadaTable";
import { normalizeSearchText } from "../utils/textUtils";

export interface ComparativeTopic {
  id: string;
  titulo: string;
  categoria: string;
  boletinReferencia: string;
  supNumero: string;
  fechaInforme: string;
  autor: string;
  comisionDestino: string;
  resumenChile: string;
  documentoAnalisis: {
    introduccion: string;
    aspectosGenerales: string;
    comparativaInternacional: string;
    impactoEstimado: string;
    conclusionComision: string;
  };
  paises: {
    nombre: string;
    bandera: string;
    normativa: string;
    enfoque: string;
    sancionesOmision: string;
    leccionParaChile: string;
  }[];
  cuadrosResumen: {
    medida: string;
    subcategorias: string[];
  }[];
  textosNormativos: {
    titulo: string;
    enlace: string;
  }[];
}

export const COMPARATIVE_TOPICS: ComparativeTopic[] = [
  {
    id: "ia-reg",
    titulo: "Regulación de Inteligencia Artificial y Datos Personales",
    categoria: "Tecnología e Innovación",
    boletinReferencia: "Boletín 15.869-19",
    supNumero: "Nº SUP: 146302",
    fechaInforme: "Junio 2025",
    autor: "Jaime Rojas Castillo (jrojas@bcn.cl)",
    comisionDestino: "Comisión de Desafíos del Futuro, Ciencia, Tecnología e Innovación del Senado",
    resumenChile: "Proyecto basado en el enfoque de riesgo europeo, exigiendo gobernanza de modelos de alto riesgo, protección de datos biométricos y fiscalización por la Agencia de Protección de Datos.",
    documentoAnalisis: {
      introduccion: "El presente informe, elaborado a solicitud de la Comisión de Desafíos del Futuro, analiza los estándares de derecho comparado sobre la regulación de sistemas de inteligencia artificial y la protección de derechos digitales en la Unión Europea y América Latina.",
      aspectosGenerales: "La obligación de regular la IA comprende la mitigación de sesgos algorítmicos, la transparencia en decisiones automatizadas y la salvaguarda de la privacidad conforme a los estándares OCDE.",
      comparativaInternacional: "A nivel comparado, la Unión Europea con el AI Act establece un estándar estricto de clasificación de riesgos. España pionera con la AESIA ofrece un modelo institucional de gobernanza pública. EE.UU. opta por directrices sectoriales NIST.",
      impactoEstimado: "Se proyecta un impacto regulatorio moderado en grandes desarrolladores y proveedores de servicios de IA de alto riesgo, con exigencias de auditorías técnicas previas a la puesta en marcha.",
      conclusionComision: "Se recomienda incorporar incentivos a la innovación y clarificar los umbrales de las sanciones para evitar frenar el ecosistema de emprendimiento tecnológico nacional."
    },
    paises: [
      {
        nombre: "Unión Europea",
        bandera: "🇪🇺",
        normativa: "AI Act (Reglamento UE 2024/1689)",
        enfoque: "Clasificación estricta por niveles de riesgo (Inaceptable, Alto, Limitado, Mínimo). Prohibición de sistemas de manipulación cognitiva y biometría en tiempo real.",
        sancionesOmision: "Multas de hasta 35 millones de euros o el 7% de la facturación global anual.",
        leccionParaChile: "Establecer areneras regulatorias (sandboxes) y autoridades de aplicación con multas proporcionales al volumen de negocio."
      },
      {
        nombre: "España",
        bandera: "🇪🇸",
        normativa: "Agencia Española de Supervisión de IA (AESIA)",
        enfoque: "Pionero en la creación de agencia específica de supervisión algorítmica previa a la entrada en vigor total del AI Act.",
        sancionesOmision: "Armonizado con la normativa europea de protección de datos (LOPDGDD).",
        leccionParaChile: "El diseño institucional chileno debe contemplar autonomía técnica y presupuesto para auditorías algorítmicas públicas."
      },
      {
        nombre: "Estados Unidos",
        bandera: "🇺🇸",
        normativa: "Executive Order on AI & NIST AI Risk Management Framework",
        enfoque: "Enfoque sectorial y voluntario basado en estándares NIST, complementado por regulaciones estatales (California, Colorado).",
        sancionesOmision: "Acciones de la FTC (Federal Trade Commission) bajo prácticas engañosas.",
        leccionParaChile: "Fomentar la coinnovación público-privada sin ahogar el desarrollo de startups tecnológicas locales."
      }
    ],
    cuadrosResumen: [
      { medida: "Gobernanza de Riesgo", subcategorias: ["I. Clasificación obligatoria de sistemas de alto riesgo", "II. Auditorías algorítmicas previas", "III. Registro público de algoritmos estatales"] },
      { medida: "Transparencia", subcategorias: ["I. Divulgación de contenidos generados por IA", "II. Derecho a la explicabilidad de decisiones", "III. Notificación previa a usuarios afectados"] },
      { medida: "Sanciones", subcategorias: ["I. Multas disuasorias proporcionales a facturación global", "II. Suspensión temporal de modelos no conformes", "III. Responsabilidad administrativa y civil de directores"] }
    ],
    textosNormativos: [
      { titulo: "AI Act (Reglamento UE 2024/1689) - Texto oficial consolidado", enlace: "https://c.bcn.cl/ia-eu-2024" },
      { titulo: "Ley de Creación de la AESIA (España)", enlace: "https://c.bcn.cl/aesia-es" }
    ]
  },
  {
    id: "jornada-40h",
    titulo: "Reducción de Jornada Laboral a 40 Horas Semanales",
    categoria: "Trabajo y Previsión Social",
    boletinReferencia: "Boletín 11.179-13",
    supNumero: "Nº SUP: 135412",
    fechaInforme: "Mayo 2023",
    autor: "Daniela Santana Silva (dasantana@bcn.cl)",
    comisionDestino: "Comisión de Trabajo y Previsión Social del Senado",
    resumenChile: "Ley 21.561 que reduce gradualmente la jornada ordinaria de 45 a 40 horas, introduciendo adaptabilidad, bandas horarias y teletrabajo.",
    documentoAnalisis: {
      introduccion: "El informe examina la experiencia comparada en la implementación de reducciones de jornada laboral semanal en economías de la OCDE, evaluando su impacto en la productividad y conciliación laboral.",
      aspectosGenerales: "El derecho al descanso y la limitación de la jornada máxima son pilares del Derecho Internacional del Trabajo (Convenios OIT).",
      comparativaInternacional: "Francia redujo a 35 horas mediante la Loi Aubry con fuertes tensiones operativas iniciales. Colombia implementa una reducción gradual de 48 a 42 horas. Alemania combina límites legales con convenios colectivos sectoriales.",
      impactoEstimado: "Reorganización de turnos en industrias de continuidad operacional y comercio, con ganancias de productividad asociadas al bienestar y menor fatiga laboral.",
      conclusionComision: "La gradualidad de 5 años ha demostrado ser clave para amortiguar el impacto en micro y pequeñas empresas."
    },
    paises: [
      {
        nombre: "Francia",
        bandera: "🇫🇷",
        normativa: "Loi Aubry (35 horas semanales)",
        enfoque: "Estableció por ley las 35 horas en el año 2000, con incentivos a la negociación colectiva por empresa y reducción de cargas sociales.",
        sancionesOmision: "Inspección laboral estricta con penalizaciones penales y civiles por exceso de horas extraordinarias.",
        leccionParaChile: "La gradualidad chilena (5 años) evita el shock operativo que enfrentó Francia en su transición inicial."
      },
      {
        nombre: "Colombia",
        bandera: "🇨🇴",
        normativa: "Ley 2101 de 2021",
        enfoque: "Reducción progresiva de 48 a 42 horas semanales en un plazo de 6 años sin reducción salarial.",
        sancionesOmision: "Sanciones administrativas del Ministerio del Trabajo.",
        leccionParaChile: "Comparte la estrategia de implementación escalonada para dar respiro a micro y pequeñas empresas (PyMEs)."
      },
      {
        nombre: "Alemania",
        bandera: "🇩🇪",
        normativa: "Arbeitszeitgesetz (Gesetzliche Arbeitszeit)",
        enfoque: "Límite de 8 horas diarias ampliables a 10 con promedio compensatorio en 6 meses, con fuerte rol de los convenios colectivos (Tarifvertrag).",
        sancionesOmision: "Multas severas a empleadores y responsabilidad personal del directorio en casos graves de fatiga laboral.",
        leccionParaChile: "El modelo chileno de promedios en bandas de 4 semanas se asemeja al modelo de compensación germano."
      }
    ],
    cuadrosResumen: [
      { medida: "Reducción Gradual", subcategorias: ["I. Implementación escalonada plurianual", "II. Excepciones para PyMEs y microempresas", "III. Monitoreo de impacto sectorial"] },
      { medida: "Adaptabilidad", subcategorias: ["I. Bancos de horas pactados colectivamente", "II. Bandas horarias de ingreso y salida", "III. Teletrabajo y desconexión digital"] }
    ],
    textosNormativos: [
      { titulo: "Loi Aubry (Francia)", enlace: "https://c.bcn.cl/loi-aubry" },
      { titulo: "Ley 2101 de 2021 (Colombia)", enlace: "https://c.bcn.cl/colombia-42h" }
    ]
  },
  {
    id: "ciberseguridad",
    titulo: "Ley Marco de Ciberseguridad e Infraestructura Crítica",
    categoria: "Seguridad y Defensa",
    boletinReferencia: "Boletín 14.847-06",
    supNumero: "Nº SUP: 141209",
    fechaInforme: "Agosto 2024",
    autor: "Jaime Rojas Castillo (jrojas@bcn.cl)",
    comisionDestino: "Comisión de Defensa Nacional y Seguridad Pública",
    resumenChile: "Crea la Agencia Nacional de Ciberseguridad (ANCI), define operadores de importancia vital y establece obligación estricta de reportar incidentes en plazos críticos.",
    documentoAnalisis: {
      introduccion: "A solicitud de la Comisión Mixta, el informe revisa los marcos institucionales de ciberdefensa y ciberseguridad en Estonia y la Unión Europea (Directiva NIS 2).",
      aspectosGenerales: "La protección de infraestructuras críticas constituye un deber ineludible del Estado para garantizar la continuidad de servicios básicos esenciales.",
      comparativaInternacional: "Estonia lidera con la arquitectura RIA de ciberdefensa integrada. La Unión Europea con la Directiva NIS 2 endurece la responsabilidad de los directorios corporativos ante brechas de seguridad.",
      impactoEstimado: "Incremento en las inversiones de infraestructura tecnológica y ciberdefensa en sectores bancario, energético, telecomunicaciones y salud.",
      conclusionComision: "Es indispensable garantizar la interoperabilidad del CSIRT Nacional con los centros sectoriales existentes."
    },
    paises: [
      {
        nombre: "Estonia",
        bandera: "🇪🇪",
        normativa: "Cybersecurity Act & RIA (State Information System)",
        enfoque: "Considerada potencia digital mundial con ciberdefensa integrada a nivel estatal, municipal y bancario.",
        sancionesOmision: "Auditorías obligatorias anuales y suspensión de licencias de operación digital.",
        leccionParaChile: "La creación de la ANCI sigue el modelo estonio de centralización de la respuesta a incidentes (CSIRT Nacional)."
      },
      {
        nombre: "Unión Europea",
        bandera: "🇪🇺",
        normativa: "Directiva NIS 2 (Network and Information Security)",
        enfoque: "Amplía los sectores regulados (salud, energía, transporte, administración pública) y endurece la gobernanza de ciberseguridad en directivos.",
        sancionesOmision: "Multas de hasta 10 millones de euros o el 2% de la facturación global de la entidad.",
        leccionParaChile: "La tipificación de delitos informáticos y las multas disuasorias chilenas están alineadas con NIS 2."
      }
    ],
    cuadrosResumen: [
      { medida: "Notificación de Incidentes", subcategorias: ["I. Alerta temprana en plazo crítico de 24 horas", "II. Reporte técnico detallado a los CSIRT sectoriales", "III. Cooperación transfronteriza ante ciberataques"] },
      { medida: "Gobernanza Corporativa", subcategorias: ["I. Responsabilidad solidaria del directorio", "II. Auditorías externas de ciberseguridad obligatorias", "III. Planes de contingencia y resiliencia digital"] }
    ],
    textosNormativos: [
      { titulo: "Directiva NIS 2 (UE)", enlace: "https://c.bcn.cl/nis2-ue" }
    ]
  },
  {
    id: "pensiones",
    titulo: "Reforma al Sistema de Pensiones y Pilar Solidario",
    categoria: "Hacienda y Previsión Social",
    boletinReferencia: "Boletín 15.480-13",
    supNumero: "Nº SUP: 144501",
    fechaInforme: "Enero 2025",
    autor: "Daniela Santana Silva (dasantana@bcn.cl)",
    comisionDestino: "Comisión de Hacienda y Trabajo del Senado",
    resumenChile: "Reforma estructural que introduce cotización adicional con cargo al empleador, separación de la industria entre gestión de inversiones y soporte, y fortalecimiento de la Pensión Garantizada Universal (PGU).",
    documentoAnalisis: {
      introduccion: "El informe analiza modelos previsionales mixtos en Suecia y Uruguay, enfocándose en la separación de la gestión de fondos y los mecanismos de solidaridad intergeneracional.",
      aspectosGenerales: "El derecho a la seguridad social es un derecho humano fundamental consagrado en el PIDESC y en la Convención Americana.",
      comparativaInternacional: "Suecia opera con cuentas nocionales de reparto combinadas con capitalización individual. Uruguay unificó regímenes previsionales en la Ley 20.130.",
      impactoEstimado: "Impacto macroeconómico en el mercado laboral formal y en la profundidad del mercado de capitales nacional.",
      conclusionComision: "Se requiere un equilibrio técnico entre la solidaridad intergeneracional y los incentivos al ahorro individual."
    },
    paises: [
      {
        nombre: "Suecia",
        bandera: "🇸🇪",
        normativa: "Inkomstpension & Premiepension System",
        enfoque: "Sistema mixto de cuentas nocionales de reparto (NDC) combinadas con fondos de capitalización individual obligatorios y fuerte componente redistributivo.",
        sancionesOmision: "Cotización previsional obligatoria retenida mediante el sistema de impuestos central (Skatteverket).",
        leccionParaChile: "La separación entre entidades pagadoras y el ente administrador estatal refleja el modelo sueco de eficiencia de costos."
      },
      {
        nombre: "Uruguay",
        bandera: "🇺🇾",
        normativa: "Reforma Previsional de la Ley 20.130",
        enfoque: "Convergencia de regímenes previsionales (BPS, AFAP, policiales y militares) en un sistema único de pilares.",
        sancionesOmision: "Control de legalidad previsional y fiscalización de aportes patronales.",
        leccionParaChile: "Uruguay comparte con Chile el desafío demográfico de envejecimiento poblacional acelerado."
      }
    ],
    cuadrosResumen: [
      { medida: "Separación de Industria", subcategorias: ["I. Licitación centralizada de cartera de afiliados", "II. Ente público autónomo de soporte y cobranza", "III. Reducción de comisiones por economías de escala"] },
      { medida: "Pilar Solidario", subcategorias: ["I. Financiamiento fiscal progresivo", "II. Garantía de pensión mínima universal", "III. Compensación por brecha de género"] }
    ],
    textosNormativos: [
      { titulo: "Ley 20.130 de Reforma Previsional (Uruguay)", enlace: "https://c.bcn.cl/uruguay-ley20130" }
    ]
  }
];

export interface ResultadoComparado {
  pais: string;
  fuente: string;
  titulo: string;
  tituloOriginal?: string;
  fecha?: string;
  url?: string;
  descripcion?: string;
  tipo?: string;
  relevancia?: number;
}

const CODIGO_PAIS: Record<string, string> = {
  "Chile": "CL", "España": "ES", "Unión Europea": "EU", "Estados Unidos": "US", "Brasil": "BR",
  "Argentina": "AR", "Uruguay": "UY", "Colombia": "CO", "Panamá": "PA", "Reino Unido": "GB",
  "Francia": "FR", "Alemania": "DE", "Italia": "IT", "Portugal": "PT", "Canadá": "CA",
  "Australia": "AU", "Nueva Zelanda": "NZ", "Suiza": "CH", "Suecia": "SE", "Finlandia": "FI",
  "Noruega": "NO", "Dinamarca": "DK", "Países Bajos": "NL", "Irlanda": "IE", "Polonia": "PL",
  "Japón": "JP", "Luxemburgo": "LU"
};

const BANDERA_PAIS: Record<string, string> = {
  "Chile": "🇨🇱", "España": "🇪🇸", "Unión Europea": "🇪🇺", "Estados Unidos": "🇺🇸", "Brasil": "🇧🇷",
  "Argentina": "🇦🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴", "Panamá": "🇵🇦", "Reino Unido": "🇬🇧",
  "Francia": "🇫🇷", "Alemania": "🇩🇪", "Italia": "🇮🇹", "Portugal": "🇵🇹", "Canadá": "🇨🇦",
  "Australia": "🇦🇺", "Nueva Zelanda": "🇳🇿", "Suiza": "🇨🇭", "Suecia": "🇸🇪", "Finlandia": "🇫🇮",
  "Noruega": "🇳🇴", "Dinamarca": "🇩🇰", "Países Bajos": "🇳🇱", "Irlanda": "🇮🇪", "Polonia": "🇵🇱",
  "Japón": "🇯🇵", "Luxemburgo": "🇱🇺"
};

const REGION_MAP: Record<string, string[]> = {
  "Iberoamérica": ["Chile", "España", "Brasil", "Argentina", "Uruguay", "Colombia", "Panamá", "Portugal"],
  "Unión Europea": ["Unión Europea", "España", "Francia", "Alemania", "Italia", "Portugal", "Polonia", "Suecia", "Finlandia", "Dinamarca", "Países Bajos", "Irlanda", "Luxemburgo"],
  "OCDE / Global": ["Estados Unidos", "Reino Unido", "Canadá", "Australia", "Nueva Zelanda", "Alemania", "Francia", "Italia", "Suiza", "Noruega", "Japón"],
  "Chile": ["Chile"]
};

const TIPO_ESTILO: Record<string, string> = {
  "Ley": "bg-blue-50 text-blue-800 border-blue-200",
  "Reglamento": "bg-amber-50 text-amber-800 border-amber-200",
  "Jurisprudencia": "bg-purple-50 text-purple-800 border-purple-200",
  "Administrativo": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Documento": "bg-slate-100 text-slate-600 border-slate-200"
};

interface LeySeleccionada {
  resultado: ResultadoComparado;
  puntos: string[];
  disponible: boolean;
  mensaje?: string;
}

interface CustomReport {
  query: string;
  fecha: string;
  resultados: ResultadoComparado[];
  fuentesConsultadas: string[];
  fuentesFallidas: string[];
  parrafoAuto: string;
  redaccionIA?: string;
  leySeleccionada?: LeySeleccionada;
  normasComparadas?: ResultadoComparado[];
}

const SUGGESTED_SEARCHES = [
  { term: "Tenencia de Mascotas", cat: "Bienestar Animal", icon: "Heart" },
  { term: "Inteligencia Artificial", cat: "Tecnología", icon: "Cpu" },
  { term: "Ciberseguridad", cat: "Seguridad", icon: "Shield" },
  { term: "Jornada 40 Horas", cat: "Trabajo", icon: "Clock" },
  { term: "Ley Karin (Acoso)", cat: "Laboral", icon: "Shield" },
  { term: "Reforma Previsional", cat: "Hacienda", icon: "Scale" },
  { term: "Protección de Datos", cat: "Derechos Digitales", icon: "Lock" },
  { term: "Ley Papito Corazón", cat: "Familia", icon: "Scale" },
  { term: "Ley Devuélveme mi Casa", cat: "Vivienda", icon: "FileText" },
  { term: "Acceso a la Información", cat: "Transparencia", icon: "FileText" },
  { term: "Royalty Minero", cat: "Minería & Energía", icon: "Zap" },
  { term: "Recursos Hídricos", cat: "Medio Ambiente", icon: "Droplet" },
  { term: "Salud Mental", cat: "Salud", icon: "Heart" },
  { term: "Criptomonedas & Fintech", cat: "Economía", icon: "TrendingUp" },
  { term: "Neuroderechos", cat: "Bioética", icon: "Sparkles" },
  { term: "Hidrógeno Verde", cat: "Energía", icon: "Leaf" }
];

function buildParrafoAutomatico(query: string, resultados: ResultadoComparado[]): string {
  if (resultados.length === 0) {
    return `No se encontraron resultados en las fuentes internacionales disponibles para la materia "${query}".`;
  }
  const porPais = new Map<string, number>();
  for (const r of resultados) porPais.set(r.pais, (porPais.get(r.pais) || 0) + 1);
  const paises = Array.from(porPais.entries());
  const detallePaises = paises
    .map(([pais, n]) => `${pais} (${n} resultado${n === 1 ? "" : "s"})`)
    .join(", ");
  return `Se identificaron ${resultados.length} resultado${resultados.length === 1 ? "" : "s"} en ${paises.length} país(es) sobre "${query}": ${detallePaises}. Este resumen se basa en los registros normativos oficiales obtenidos en tiempo real; para conocer el contenido exhaustivo de cada iniciativa es recomendable acceder al documento original en el enlace correspondiente.`;
}

function buildInformeMarkdown(
  query: string, 
  resultados: ResultadoComparado[], 
  parrafoAuto: string, 
  redaccionIA?: string,
  comparacionDetalle?: Record<string, { resultado: ResultadoComparado; puntos: string[]; disponible: boolean; mensaje?: string }>
): string {
  const fecha = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  const lines: string[] = [];
  lines.push(`# MINUTA DE DERECHO COMPARADO: ${query.toUpperCase()}`);
  lines.push(`**Biblioteca del Congreso Nacional de Chile — Asesoría Técnica Parlamentaria**`);
  lines.push(`*Fecha de emisión: ${fecha}* | *Normas analizadas: ${resultados.length}*`);
  lines.push("");
  lines.push(`## 1. SÍNTESIS EJECUTIVA`);
  lines.push(parrafoAuto);
  if (redaccionIA) {
    lines.push("");
    lines.push(`### Análisis Analítico y Lecciones para Chile`);
    lines.push(redaccionIA);
  }
  lines.push("");
  lines.push(`## 2. MATRIZ COMPARATIVA POR PAÍS`);
  lines.push(`| País | Normativa Oficial | Tipo | Fuente | Resumen / Puntos Clave | Enlace |`);
  lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- |`);
  for (const r of resultados) {
    const detalle = comparacionDetalle ? comparacionDetalle[`${r.pais}|${r.titulo}`] : undefined;
    const puntos = detalle?.puntos && detalle.puntos.length > 0 
      ? detalle.puntos.join("; ") 
      : (r.descripcion || "—");
    const link = r.url ? `[Ver Gaceta](${r.url})` : "—";
    lines.push(`| ${r.pais} | **${r.titulo.replace(/\|/g, "/")}** | ${r.tipo || "Ley"} | ${r.fuente} | ${puntos.replace(/\|/g, "/")} | ${link} |`);
  }
  lines.push("");
  lines.push(`---`);
  lines.push(`*Documento generado automáticamente por LegisTrack-CL para apoyo al trabajo de Comisiones del Congreso Nacional de Chile.*`);
  return lines.join("\n");
}

function exportarAWord(
  query: string, 
  resultados: ResultadoComparado[], 
  parrafoAuto: string, 
  redaccionIA?: string, 
  comparacionDetalle?: Record<string, { resultado: ResultadoComparado; puntos: string[]; disponible: boolean; mensaje?: string }>
) {
  const fecha = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  const rowsHtml = resultados.map((r, idx) => {
    const detalle = comparacionDetalle ? comparacionDetalle[`${r.pais}|${r.titulo}`] : undefined;
    const puntosHtml = detalle?.puntos && detalle.puntos.length > 0 
      ? `<ul style="margin: 4px 0; padding-left: 18px;">${detalle.puntos.map(p => `<li>${p}</li>`).join("")}</ul>` 
      : (r.descripcion || "Sin observaciones adicionales.");

    return `
      <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; width: 14%;">${r.pais}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; width: 28%;">
          ${r.titulo}
          ${r.url ? `<br><a href="${r.url}" style="color: #2563eb; font-size: 9.5pt; text-decoration: underline;">Ver gaceta oficial</a>` : ""}
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 10pt; width: 10%;">${r.tipo || "Ley"}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 10pt; width: 14%;">${r.fuente}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 10pt; width: 34%;">${puntosHtml}</td>
      </tr>
    `;
  }).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Minuta de Derecho Comparado - ${query}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; padding: 24px; }
        .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 18px; }
        .bcn-title { color: #1e3a8a; font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .bcn-sub { color: #64748b; font-size: 9.5pt; font-weight: bold; }
        h1 { color: #0f172a; font-size: 16pt; margin-top: 14px; margin-bottom: 8px; }
        .meta-box { background-color: #f1f5f9; border-left: 4px solid #1e3a8a; padding: 10px 14px; margin-bottom: 18px; font-size: 10pt; }
        .section-title { color: #1e3a8a; font-size: 12pt; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 22px; margin-bottom: 10px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; font-size: 9.5pt; }
        th { background-color: #1e3a8a; color: #ffffff; padding: 8px; border: 1px solid #1e3a8a; text-align: left; font-size: 10pt; }
        .footer { margin-top: 35px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 9pt; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="bcn-title">Biblioteca del Congreso Nacional de Chile</div>
        <div class="bcn-sub">Asesoría Técnica Parlamentaria — Minuta Oficial de Derecho Comparado</div>
      </div>

      <h1>MINUTA DE LEGISLACIÓN COMPARADA: ${query.toUpperCase()}</h1>
      
      <div class="meta-box">
        <strong>Materia:</strong> ${query}<br>
        <strong>Fecha de Emisión:</strong> ${fecha}<br>
        <strong>Jurisdicciones Analizadas:</strong> ${Array.from(new Set(resultados.map(r => r.pais))).join(", ") || "Internacional"}<br>
        <strong>Total de Normativas Identificadas:</strong> ${resultados.length}
      </div>

      <div class="section-title">1. Síntesis Ejecutiva y Panorama Internacional</div>
      <p style="text-align: justify;">${parrafoAuto}</p>
      ${redaccionIA ? `<div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px; margin-top: 10px;"><strong>Análisis Estratégico y Lecciones para Chile:</strong><br>${redaccionIA}</div>` : ""}

      <div class="section-title">2. Matriz de Legislación Comparada por País</div>
      <table>
        <thead>
          <tr>
            <th>País</th>
            <th>Normativa Oficial</th>
            <th>Tipo</th>
            <th>Fuente Oficial</th>
            <th>Resumen / Puntos Sustantivos</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="section-title">3. Marco Metodológico y Fuentes Oficiales</div>
      <p>Este informe compila información extraída en tiempo real de los repositorios y gacetas legislativas oficiales de las jurisdicciones consultadas (incluyendo LeyChile de la BCN, Boletín Oficial del Estado de España, EUR-Lex CELLAR de la Unión Europea, Cámara y Senado de Brasil, Legislation.gov.uk del Reino Unido, entre otros). Provee una panorámica sistemática de las soluciones normativas adoptadas internacionalmente.</p>

      <div class="footer">
        Documento de trabajo elaborado para el Congreso Nacional de Chile | LegisTrack-CL — Asesoría Legislativa
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  a.href = url;
  a.download = `minuta-derecho-comparado-${safeName || "informe"}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportarAExcel(query: string, resultados: ResultadoComparado[]) {
  const headers = [
    "País",
    "Código",
    "Tipo de Norma",
    "Título Oficial",
    "Fecha Publicación",
    "Fuente Oficial",
    "Relevancia (%)",
    "Enlace Gaceta Oficial",
    "Resumen / Objeto de la Norma"
  ];

  const rows = resultados.map((r) => [
    `"${(r.pais || "").replace(/"/g, '""')}"`,
    `"${(CODIGO_PAIS[r.pais] || "").replace(/"/g, '""')}"`,
    `"${(r.tipo || "Ley").replace(/"/g, '""')}"`,
    `"${(r.titulo || "").replace(/"/g, '""')}"`,
    `"${(r.fecha || "N/D").replace(/"/g, '""')}"`,
    `"${(r.fuente || "").replace(/"/g, '""')}"`,
    `"${r.relevancia ?? 90}"`,
    `"${(r.url || "").replace(/"/g, '""')}"`,
    `"${(r.descripcion || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "\ufeff" + [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  a.href = url;
  a.download = `matriz-legislacion-comparada-${safeName || "datos"}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function imprimirInformePDF(
  query: string,
  resultados: ResultadoComparado[],
  parrafoAuto: string,
  redaccionIA?: string,
  comparacionDetalle?: Record<string, { resultado: ResultadoComparado; puntos: string[]; disponible: boolean; mensaje?: string }>
) {
  const fecha = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  const rowsHtml = resultados.map((r, idx) => {
    const detalle = comparacionDetalle ? comparacionDetalle[`${r.pais}|${r.titulo}`] : undefined;
    const puntosHtml = detalle?.puntos && detalle.puntos.length > 0
      ? `<ul style="margin: 3px 0; padding-left: 16px;">${detalle.puntos.map(p => `<li>${p}</li>`).join("")}</ul>`
      : (r.descripcion || "Sin observaciones adicionales.");

    return `
      <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}; page-break-inside: avoid;">
        <td style="padding: 7px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 10px;">
          ${BANDERA_PAIS[r.pais] || "🌐"} ${r.pais}
        </td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; font-size: 10px; font-weight: 600;">
          ${r.titulo}
          ${r.url ? `<br><a href="${r.url}" style="color: #2563eb; font-size: 8.5px;">${r.url}</a>` : ""}
        </td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; font-size: 9.5px;">${r.tipo || "Ley"}</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; font-size: 9.5px;">${r.fuente}</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; font-size: 9.5px; line-height: 1.35;">${puntosHtml}</td>
      </tr>
    `;
  }).join("");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor permita las ventanas emergentes para generar el informe imprimible.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Minuta BCN - ${query}</title>
      <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.5; padding: 10px; }
        .bcn-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
        .bcn-title { color: #1e3a8a; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
        .bcn-sub { color: #64748b; font-size: 9.5px; font-weight: bold; }
        h1 { color: #0f172a; font-size: 15px; font-weight: 900; margin: 8px 0 6px 0; text-transform: uppercase; }
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; background: #f8fafc; border-left: 4px solid #1e3a8a; padding: 8px 12px; margin-bottom: 14px; border-radius: 0 6px 6px 0; font-size: 10px; }
        .section-header { color: #1e3a8a; font-size: 11.5px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin: 16px 0 6px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5px; }
        th { background-color: #1e3a8a; color: white; padding: 7px; border: 1px solid #1e3a8a; text-align: left; font-weight: 700; font-size: 10px; }
        .footer { margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 8.5px; color: #64748b; text-align: center; }
        @media print {
          .no-print { display: none; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background: #1e3a8a; color: white; padding: 10px 16px; margin-bottom: 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; font-size: 12px;">Vista previa de Impresión / Guardar como PDF</span>
        <button onclick="window.print()" style="background: white; color: #1e3a8a; font-weight: bold; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer;">Imprimir o Guardar PDF</button>
      </div>

      <div class="bcn-header">
        <div>
          <div class="bcn-title">Biblioteca del Congreso Nacional de Chile</div>
          <div class="bcn-sub">Asesoría Técnica Parlamentaria — Minuta de Derecho Comparado</div>
        </div>
        <div style="text-align: right; font-weight: bold; color: #64748b; font-size: 10px;">
          ${fecha}
        </div>
      </div>

      <h1>${query}</h1>

      <div class="meta-grid">
        <div><strong>Materia:</strong> ${query}</div>
        <div><strong>Jurisdicciones consultadas:</strong> ${Array.from(new Set(resultados.map(r => r.pais))).length} países</div>
        <div><strong>Total de normativas:</strong> ${resultados.length} registros oficiales</div>
        <div><strong>Origen:</strong> LegisTrack-CL (Asesoría Parlamentaria)</div>
      </div>

      <div class="section-header">1. Síntesis Ejecutiva</div>
      <p style="font-size: 10px; text-align: justify; margin: 0 0 8px 0;">${parrafoAuto}</p>
      ${redaccionIA ? `<div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 8px; border-radius: 6px; margin-top: 6px;"><strong>Síntesis analítica:</strong><br>${redaccionIA}</div>` : ""}

      <div class="section-header">2. Matriz de Legislación Comparada</div>
      <table>
        <thead>
          <tr>
            <th style="width: 14%;">País</th>
            <th style="width: 28%;">Normativa</th>
            <th style="width: 10%;">Tipo</th>
            <th style="width: 14%;">Fuente</th>
            <th style="width: 34%;">Resumen / Puntos Sustantivos</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        Biblioteca del Congreso Nacional de Chile · Asesoría Técnica Parlamentaria · Documento de Trabajo para Comisiones Legislativas
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function buildInformeText(rep: CustomReport): string {
  const lines: string[] = [];
  lines.push("BIBLIOTECA DEL CONGRESO NACIONAL DE CHILE");
  lines.push("Asesoría Técnica Parlamentaria — Compilación de Derecho Comparado");
  lines.push("=".repeat(70));
  lines.push(`Materia consultada: ${rep.query}`);
  lines.push(`Fecha de generación: ${rep.fecha}`);
  lines.push("");
  lines.push("1. METODOLOGÍA");
  lines.push("-".repeat(70));
  lines.push(
    "Este documento es una compilación técnica de resultados obtenidos en tiempo real " +
    "desde bases legislativas oficiales de jurisdicciones de referencia (OCDE, UE e Iberoamérica), " +
    "a partir del término de búsqueda indicado. Provee una panorámica sistemática de las soluciones " +
    "normativas adoptadas internacionalmente."
  );
  lines.push("");
  lines.push("2. SÍNTESIS EJECUTIVA");
  lines.push("-".repeat(70));
  lines.push(rep.parrafoAuto);
  if (rep.redaccionIA) {
    lines.push("");
    lines.push("Síntesis complementaria generada con asistencia analítica:");
    lines.push(rep.redaccionIA);
  }
  if (rep.leySeleccionada) {
    lines.push("");
    lines.push(`Norma destacada: [${rep.leySeleccionada.resultado.pais}] ${rep.leySeleccionada.resultado.titulo}`);
    if (rep.leySeleccionada.resultado.url) lines.push(`Enlace oficial: ${rep.leySeleccionada.resultado.url}`);
    lines.push("Puntos sustantivos principales:");
    if (rep.leySeleccionada.disponible && rep.leySeleccionada.puntos.length > 0) {
      for (const p of rep.leySeleccionada.puntos) lines.push(`  • ${p}`);
    } else {
      lines.push(`  ${rep.leySeleccionada.mensaje || "No disponible."}`);
    }
  }
  lines.push("");
  lines.push(`Fuentes consultadas (${rep.fuentesConsultadas.length}): ${rep.fuentesConsultadas.join(", ") || "—"}`);
  if (rep.fuentesFallidas.length > 0) {
    lines.push(`Fuentes sin disponibilidad temporal (${rep.fuentesFallidas.length}): ${rep.fuentesFallidas.join(", ")}`);
  }
  lines.push("");
  lines.push("3. RESULTADOS POR JURISDICCIÓN");
  lines.push("-".repeat(70));
  if (rep.resultados.length === 0) {
    lines.push("No se identificaron registros normativos para esta consulta.");
  } else {
    const porPais = new Map<string, ResultadoComparado[]>();
    for (const r of rep.resultados) {
      const arr = porPais.get(r.pais) || [];
      arr.push(r);
      porPais.set(r.pais, arr);
    }
    for (const [pais, items] of porPais) {
      lines.push("");
      lines.push(`${pais.toUpperCase()} (${items.length} norma(s))`);
      for (const it of items) {
        lines.push(`  • ${it.titulo}`);
        lines.push(`    Fuente: ${it.fuente}${it.fecha ? ` | Fecha: ${it.fecha}` : ""}${it.tipo ? ` | Tipo: ${it.tipo}` : ""}`);
        if (it.url) lines.push(`    Enlace: ${it.url}`);
      }
    }
  }
  lines.push("");
  lines.push("=".repeat(70));
  lines.push("LegisTrack-CL | Sistema de Inteligencia y Seguimiento Legislativo del Congreso Nacional de Chile");
  return lines.join("\n");
}

function downloadInforme(rep: CustomReport) {
  const text = buildInformeText(rep);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = rep.query.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
  a.href = url;
  a.download = `informe-derecho-comparado-${safeName || "consulta"}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function FormattedResumen({ descripcion }: { descripcion: string }) {
  const [expanded, setExpanded] = useState(false);
  const lineas = descripcion.split("\n").map(l => l.trim()).filter(Boolean);
  const esEstructurado = lineas.some(l => l.includes("Objeto") || l.includes("Mecanismos") || l.includes("Fiscalización") || l.includes("Sanciones") || l.includes("🎯") || l.includes("⚙️") || l.includes("⚖️"));

  if (!esEstructurado) {
    const isLong = descripcion.length > 140;
    return (
      <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 leading-relaxed flex flex-col gap-1.5">
        <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1 font-mono">
          <FileText className="w-3 h-3 text-blue-700" />
          <span>Ficha Técnica Sustantiva</span>
        </div>
        <p className={`font-medium text-slate-700 leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}>
          {descripcion}
        </p>
        {isLong && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer pt-0.5"
          >
            {expanded ? (
              <><ChevronUp className="w-3 h-3" /> Ver menos</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Leer ficha completa</>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs text-slate-700 leading-relaxed flex flex-col gap-2 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-950 flex items-center gap-1.5 font-mono">
          <FileText className="w-3.5 h-3.5 text-blue-700" />
          <span>Ficha Técnica de la Norma</span>
        </div>
        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
          {lineas.length} Dimensiones
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {lineas.slice(0, expanded ? lineas.length : 1).map((line, idx) => {
          let badge = "📌";
          let label = "";
          let content = line;

          if (line.includes("Objeto & Ámbito:") || line.startsWith("🎯")) {
            badge = "🎯";
            label = "Objeto & Ámbito:";
            content = line.replace(/^[🎯\s]*Objeto\s*&\s*Ámbito:\s*/i, "").trim();
          } else if (line.includes("Mecanismos Clave:") || line.startsWith("⚙️")) {
            badge = "⚙️";
            label = "Mecanismos Clave:";
            content = line.replace(/^[⚙️\s]*Mecanismos\s*Clave:\s*/i, "").trim();
          } else if (line.includes("Fiscalización") || line.includes("Sanciones") || line.startsWith("⚖️")) {
            badge = "⚖️";
            label = line.includes("Sanciones") ? "Fiscalización & Sanciones:" : "Fiscalización & Cumplimiento:";
            content = line.replace(/^[⚖️\s]*Fiscalización\s*&\s*(Sanciones|Cumplimiento):\s*/i, "").trim();
          }

          return (
            <div key={idx} className="text-[11px] leading-relaxed text-slate-700 bg-white border border-slate-200/80 p-2.5 rounded-lg shadow-2xs">
              {label ? (
                <div>
                  <div className="text-blue-950 font-extrabold flex items-center gap-1 mb-1 text-[10px] uppercase font-mono tracking-wider">
                    <span>{badge}</span> {label}
                  </div>
                  <div className="text-slate-700 font-medium leading-relaxed">{content}</div>
                </div>
              ) : (
                <div className="font-medium">{line}</div>
              )}
            </div>
          );
        })}
      </div>

      {lineas.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer pt-1 self-start transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Contraer ficha técnica</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Ver ficha completa ({lineas.length} ejes: Objeto, Mecanismos y Sanciones)</>
          )}
        </button>
      )}
    </div>
  );
}

interface ExportToolbarProps {
  query: string;
  resultados: ResultadoComparado[];
  parrafoAuto: string;
  redaccionIA?: string;
  comparacionDetalle?: Record<string, { resultado: ResultadoComparado; puntos: string[]; disponible: boolean; mensaje?: string }>;
  onNotify?: (msg: string) => void;
  label?: string;
}

function ExportToolbar({
  query,
  resultados,
  parrafoAuto,
  redaccionIA,
  comparacionDetalle,
  onNotify,
  label = "Exportar Minuta:"
}: ExportToolbarProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiarMD = async () => {
    const md = buildInformeMarkdown(query, resultados, parrafoAuto, redaccionIA, comparacionDetalle);
    try {
      await navigator.clipboard.writeText(md);
      setCopiado(true);
      if (onNotify) onNotify("Minuta en formato Markdown copiada al portapapeles.");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      if (onNotify) onNotify("No se pudo copiar al portapapeles.");
    }
  };

  const handleDownloadWord = () => {
    exportarAWord(query, resultados, parrafoAuto, redaccionIA, comparacionDetalle);
    if (onNotify) onNotify("Descargando documento Word (.doc) con membrete oficial BCN.");
  };

  const handleDownloadExcel = () => {
    exportarAExcel(query, resultados);
    if (onNotify) onNotify("Descargando matriz de datos en Excel (.csv).");
  };

  const handlePrintPDF = () => {
    imprimirInformePDF(query, resultados, parrafoAuto, redaccionIA, comparacionDetalle);
  };

  const handleDownloadTxt = () => {
    const rep: CustomReport = {
      query,
      fecha: new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }),
      resultados,
      fuentesConsultadas: Array.from(new Set(resultados.map(r => r.fuente))),
      fuentesFallidas: [],
      parrafoAuto,
      redaccionIA
    };
    downloadInforme(rep);
    if (onNotify) onNotify("Descargando informe oficial en texto (.txt).");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" id={`export-toolbar-${query.replace(/[^a-zA-Z0-9]+/g, "-")}`}>
      {label && (
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-mono mr-1">
          {label}
        </span>
      )}

      <button
        onClick={handleDownloadWord}
        className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
        title="Descargar documento Microsoft Word diagramado con membrete BCN"
      >
        <FileText className="w-3.5 h-3.5 text-blue-700" />
        <span>Word (.doc)</span>
      </button>

      <button
        onClick={handlePrintPDF}
        className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
        title="Imprimir o guardar como documento PDF oficial"
      >
        <Printer className="w-3.5 h-3.5 text-red-700" />
        <span>PDF / Imprimir</span>
      </button>

      <button
        onClick={handleDownloadExcel}
        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
        title="Descargar planilla de datos Excel estructurada (.csv)"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
        <span>Excel (.csv)</span>
      </button>

      <button
        onClick={handleDownloadTxt}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
        title="Descargar informe oficial en texto plano BCN (.txt)"
      >
        <FileDown className="w-3.5 h-3.5 text-slate-600" />
        <span>Texto (.txt)</span>
      </button>

      <button
        onClick={handleCopiarMD}
        className={`border px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ${
          copiado
            ? "bg-emerald-600 text-white border-emerald-600"
            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
        }`}
        title="Copiar tabla y minuta en formato Markdown para notas y chats"
      >
        {copiado ? (
          <>
            <CheckCheck className="w-3.5 h-3.5" />
            <span>¡Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copiar MD</span>
          </>
        )}
      </button>
    </div>
  );
}

function generarMatrizDinamica(
  query: string, 
  seleccion: ResultadoComparado[], 
  detalles: Record<string, LeySeleccionada>
): MatrizComparadaData {
  const columnas: MatrizColumna[] = seleccion.map((r, i) => ({
    key: `col_${i}`,
    nombre: r.pais,
    bandera: BANDERA_PAIS[r.pais] || "🌐",
    normativaReferencia: r.titulo,
    isChile: r.pais === "Chile"
  }));

  const parse3Ejes = (r: ResultadoComparado) => {
    const desc = r.descripcion || "";
    const lines = desc.split("\n").map(l => l.trim()).filter(Boolean);
    let obj = "";
    let mec = "";
    let fisc = "";

    for (const l of lines) {
      if (l.includes("Objeto") || l.startsWith("🎯")) {
        obj = l.replace(/^[🎯\s]*Objeto\s*&\s*Ámbito:\s*/i, "");
      } else if (l.includes("Mecanismos") || l.startsWith("⚙️")) {
        mec = l.replace(/^[⚙️\s]*Mecanismos\s*Clave:\s*/i, "");
      } else if (l.includes("Fiscalización") || l.includes("Sanciones") || l.startsWith("⚖️")) {
        fisc = l.replace(/^[⚖️\s]*Fiscalización\s*&\s*(Sanciones|Cumplimiento):\s*/i, "");
      }
    }

    if (!obj) obj = desc ? desc.slice(0, 180) : `Marco regulatorio de ${r.pais} aplicable a la materia de ${query}.`;
    if (!mec) mec = `Dispone directrices técnicas, obligaciones de cumplimiento y protocolos sectoriales.`;
    if (!fisc) fisc = `Supervisado bajo el régimen legal de ${r.pais} por ${r.fuente}.`;

    return { obj, mec, fisc };
  };

  const valoresObjeto: Record<string, string> = {};
  const valoresObligaciones: Record<string, string> = {};
  const valoresFiscalizacion: Record<string, string> = {};
  const valoresPuntosClave: Record<string, string> = {};
  const valoresLeccion: Record<string, string> = {};

  seleccion.forEach((r, i) => {
    const key = `col_${i}`;
    const ejes = parse3Ejes(r);
    valoresObjeto[key] = ejes.obj;
    valoresObligaciones[key] = ejes.mec;
    valoresFiscalizacion[key] = ejes.fisc;
    
    const d = detalles[`${r.pais}|${r.titulo}`];
    valoresPuntosClave[key] = d?.puntos && d.puntos.length > 0
      ? d.puntos.slice(0, 2).join("; ")
      : `Regula los deberes operativos y salvaguardas legales exigibles a los sujetos obligados.`;

    valoresLeccion[key] = r.pais === "Chile"
      ? `Marco normativo nacional de referencia sobre el cual se estructuran las indicaciones parlamentarias.`
      : `Aporta estándares de derecho comparado en ${r.pais} útiles para contrastar vacíos técnicos en la tramitación chilena.`;
  });

  return {
    id: "live-matrix",
    titulo: `Matriz Comparada Multidimensional: ${query.toUpperCase()}`,
    subtitulo: `Contraste analítico estructurado entre ${seleccion.map(s => s.pais).join(", ")}`,
    boletinReferencia: `Consulta Activa BCN`,
    columnas,
    filas: [
      {
        dimension: "1. Enfoque general y objeto de la regulación",
        icono: "🎯",
        valores: valoresObjeto,
        lecturaJuridica: `La comparación en torno a "${query}" evidencia marcos regulatorios centrados en la delimitación precisa de obligaciones y garantías jurídicas.`
      },
      {
        dimension: "2. Mecanismos clave y deberes de cumplimiento",
        icono: "⚙️",
        valores: valoresObligaciones,
        lecturaJuridica: `Los ordenamientos comparados estructuran deberes preventivos, registros obligatorios y protocolos de gestión técnica.`
      },
      {
        dimension: "3. Órgano fiscalizador y régimen de supervisión",
        icono: "🛡️",
        valores: valoresFiscalizacion,
        lecturaJuridica: `La efectividad de la norma depende de la dotación inspectiva, autonomía resolutiva y capacidad sancionadora de la autoridad competente.`
      },
      {
        dimension: "4. Disposiciones sustantivas y puntos críticos",
        icono: "📑",
        valores: valoresPuntosClave,
        lecturaJuridica: `Los puntos críticos analizados permiten identificar umbrales de proporcionalidad y salvaguardas para la protección de derechos.`
      },
      {
        dimension: "5. Lecciones y contrastes para la legislación chilena",
        icono: "🇨🇱",
        valores: valoresLeccion,
        lecturaJuridica: `El contraste multipaís orienta el diseño de indicaciones legales en el Congreso Nacional, evitando inconsistencias operativas.`,
        isWarmRow: true
      }
    ]
  };
}

export default function LegislacionComparadaView() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(COMPARATIVE_TOPICS[0].id);
  const [customQuery, setCustomQuery] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedReports, setSavedReports] = useState<CustomReport[]>([]);
  
  // Navigation tabs:
  // "live": Búsqueda en vivo internacional (19 fuentes)
  // "documento": Informe oficial BCN (Estructura formal)
  // "matriz": Matriz comparada multidimensional
  // "comparador": Comparador lado a lado de leyes seleccionadas
  // "ia": Generador y redactor de minutas
  // "guardados": Informes guardados
  const [activeTab, setActiveTab] = useState<"live" | "documento" | "matriz" | "comparador" | "ia" | "guardados">("live");
  const [vistaComparador, setVistaComparador] = useState<"matriz" | "fichas">("matriz");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live federated search state
  const [liveQuery, setLiveQuery] = useState<string>("Inteligencia Artificial y Ciberseguridad");
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveResultados, setLiveResultados] = useState<ResultadoComparado[]>([]);
  const [liveFuentesConsultadas, setLiveFuentesConsultadas] = useState<string[]>([]);
  const [liveFuentesFallidas, setLiveFuentesFallidas] = useState<string[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [redactingIdx, setRedactingIdx] = useState<number | null>(null);

  // Analysis & inspection
  const [leySeleccionada, setLeySeleccionada] = useState<LeySeleccionada | null>(null);
  const [analizandoUrl, setAnalizandoUrl] = useState<string | null>(null);
  const [modalNorma, setModalNorma] = useState<ResultadoComparado | null>(null);

  // Filters & sorting
  const [filtroRegion, setFiltroRegion] = useState<string>("Todos");
  const [filtroPais, setFiltroPais] = useState<string>("Todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const [orden, setOrden] = useState<"relevancia" | "fecha-desc" | "fecha-asc" | "pais">("relevancia");
  const [paginaResultados, setPaginaResultados] = useState(1);
  const RESULTADOS_POR_PAGINA = 9;

  // Comparison selection
  const [seleccionComparar, setSeleccionComparar] = useState<ResultadoComparado[]>([]);
  const [comparacionDetalle, setComparacionDetalle] = useState<Record<string, LeySeleccionada>>({});
  const [comparando, setComparando] = useState(false);

  // Search history
  const [historial, setHistorial] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("legiscomparada_historial");
      return raw ? JSON.parse(raw) : ["Inteligencia Artificial", "Ciberseguridad", "Jornada 40 Horas", "Reforma Previsional"];
    } catch {
      return ["Inteligencia Artificial", "Ciberseguridad", "Jornada 40 Horas"];
    }
  });

  const guardarEnHistorial = (term: string) => {
    setHistorial((prev) => {
      const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem("legiscomparada_historial", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const eliminarDeHistorial = (termToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistorial((prev) => {
      const next = prev.filter((t) => t !== termToDelete);
      try {
        localStorage.setItem("legiscomparada_historial", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const limpiarHistorial = () => {
    setHistorial([]);
    try {
      localStorage.removeItem("legiscomparada_historial");
    } catch {}
  };

  // Filter BCN topics by search term (Insensible a tildes y mayúsculas)
  const matchedBcnTopic = useMemo(() => {
    if (!searchTerm.trim()) {
      return COMPARATIVE_TOPICS.find(t => t.id === selectedTopicId) || COMPARATIVE_TOPICS[0];
    }
    const term = normalizeSearchText(searchTerm);
    return COMPARATIVE_TOPICS.find(t => 
      normalizeSearchText(t.titulo).includes(term) ||
      normalizeSearchText(t.categoria).includes(term) ||
      normalizeSearchText(t.boletinReferencia).includes(term)
    ) || COMPARATIVE_TOPICS.find(t => t.id === selectedTopicId) || COMPARATIVE_TOPICS[0];
  }, [searchTerm, selectedTopicId]);

  const currentTopic = matchedBcnTopic;

  // Execute live search
  const handleBuscarRegulacion = async (term: string, autoSwitchTab = true) => {
    if (!term.trim()) return;
    const queryClean = term.trim();
    setLiveQuery(queryClean);
    setLiveLoading(true);
    setSearchError(null);
    setPaginaResultados(1);
    guardarEnHistorial(queryClean);
    if (autoSwitchTab && activeTab !== "live" && activeTab !== "documento" && activeTab !== "matriz") {
      setActiveTab("live");
    }

    // Also match preloaded BCN topic if applicable (Insensible a tildes)
    const normQ = normalizeSearchText(queryClean);
    const matched = COMPARATIVE_TOPICS.find(t =>
      normalizeSearchText(t.titulo).includes(normQ) ||
      normalizeSearchText(t.categoria).includes(normQ) ||
      normalizeSearchText(t.boletinReferencia).includes(normQ)
    );
    if (matched) {
      setSelectedTopicId(matched.id);
    }

    try {
      const res = await fetch(`/api/derecho-comparado?q=${encodeURIComponent(queryClean)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { resultados: ResultadoComparado[]; fuentesConsultadas: string[]; fuentesFallidas: string[] } = await res.json();
      setLiveResultados(data.resultados || []);
      setLiveFuentesConsultadas(data.fuentesConsultadas || []);
      setLiveFuentesFallidas(data.fuentesFallidas || []);
    } catch (err) {
      setSearchError("No fue posible consultar algunas fuentes internacionales en tiempo real.");
      setLiveFuentesFallidas(["Reino Unido", "Brasil", "Suecia", "Nueva Zelanda"]);
    } finally {
      setLiveLoading(false);
    }
  };

  // Run initial search on mount if empty
  useEffect(() => {
    if (liveResultados.length === 0 && !liveLoading) {
      handleBuscarRegulacion("Inteligencia Artificial", false);
    }
  }, []);

  // Filter and sort live results
  const paisesDisponibles = useMemo(() => {
    return Array.from(new Set(liveResultados.map((r) => r.pais)));
  }, [liveResultados]);

  const tiposDisponibles = useMemo(() => {
    return Array.from(new Set(liveResultados.map((r) => r.tipo || "Documento")));
  }, [liveResultados]);

  const liveResultadosFiltrados = useMemo(() => {
    let arr = [...liveResultados];

    // Filter by Region
    if (filtroRegion !== "Todos") {
      const paisesEnRegion = REGION_MAP[filtroRegion] || [];
      arr = arr.filter(r => paisesEnRegion.includes(r.pais));
    }

    // Filter by Country
    if (filtroPais !== "Todos") {
      arr = arr.filter((r) => r.pais === filtroPais);
    }

    // Filter by Type
    if (filtroTipo !== "Todos") {
      arr = arr.filter((r) => (r.tipo || "Documento") === filtroTipo);
    }

    // Sort (Chile SIEMPRE primero en todos los modos de ordenamiento)
    if (orden === "fecha-desc") {
      arr.sort((a, b) => {
        if (a.pais === "Chile" && b.pais !== "Chile") return -1;
        if (b.pais === "Chile" && a.pais !== "Chile") return 1;
        return (b.fecha || "").localeCompare(a.fecha || "");
      });
    } else if (orden === "fecha-asc") {
      arr.sort((a, b) => {
        if (a.pais === "Chile" && b.pais !== "Chile") return -1;
        if (b.pais === "Chile" && a.pais !== "Chile") return 1;
        return (a.fecha || "").localeCompare(b.fecha || "");
      });
    } else if (orden === "pais") {
      arr.sort((a, b) => {
        if (a.pais === "Chile" && b.pais !== "Chile") return -1;
        if (b.pais === "Chile" && a.pais !== "Chile") return 1;
        return a.pais.localeCompare(b.pais);
      });
    } else {
      // Orden por Relevancia (Por defecto): Chile SIEMPRE primero
      arr.sort((a, b) => {
        if (a.pais === "Chile" && b.pais !== "Chile") return -1;
        if (b.pais === "Chile" && a.pais !== "Chile") return 1;
        return (b.relevancia || 0) - (a.relevancia || 0);
      });
    }

    return arr;
  }, [liveResultados, filtroRegion, filtroPais, filtroTipo, orden]);

  const totalPaginasResultados = Math.max(1, Math.ceil(liveResultadosFiltrados.length / RESULTADOS_POR_PAGINA));
  const liveResultadosPagina = useMemo(() => {
    return liveResultadosFiltrados.slice(
      (paginaResultados - 1) * RESULTADOS_POR_PAGINA,
      paginaResultados * RESULTADOS_POR_PAGINA
    );
  }, [liveResultadosFiltrados, paginaResultados]);

  const claveResultado = (r: ResultadoComparado) => `${r.pais}|${r.titulo}`;

  const toggleSeleccionComparar = (r: ResultadoComparado) => {
    setSeleccionComparar((prev) => {
      const yaEsta = prev.some((x) => claveResultado(x) === claveResultado(r));
      if (yaEsta) return prev.filter((x) => claveResultado(x) !== claveResultado(r));
      if (prev.length >= 4) {
        setSuccessMessage("Máximo 4 normativas para comparar lado a lado.");
        setTimeout(() => setSuccessMessage(null), 3000);
        return prev;
      }
      return [...prev, r];
    });
  };

  const handleComparar = async () => {
    if (seleccionComparar.length < 2) return;
    setComparando(true);
    setActiveTab("comparador");
    try {
      const entradas = await Promise.all(
        seleccionComparar.map(async (r) => {
          try {
            const res = await fetch("/api/derecho-comparado/analizar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: liveQuery, resultado: r }),
            });
            const data: { puntos: string[]; disponible: boolean; mensaje?: string } = await res.json();
            return [claveResultado(r), { resultado: r, puntos: data.puntos || [], disponible: data.disponible, mensaje: data.mensaje }] as const;
          } catch {
            return [claveResultado(r), { resultado: r, puntos: [], disponible: false, mensaje: "No fue posible analizar esta fuente." }] as const;
          }
        })
      );
      setComparacionDetalle(Object.fromEntries(entradas));
    } finally {
      setComparando(false);
    }
  };

  const handleSeleccionarResultado = async (r: ResultadoComparado) => {
    setLeySeleccionada(null);
    setAnalizandoUrl(r.url || r.titulo);
    setModalNorma(r);
    try {
      const res = await fetch("/api/derecho-comparado/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: liveQuery, resultado: r }),
      });
      const data: { puntos: string[]; disponible: boolean; mensaje?: string } = await res.json();
      setLeySeleccionada({ resultado: r, puntos: data.puntos || [], disponible: data.disponible, mensaje: data.mensaje });
    } catch {
      setLeySeleccionada({ resultado: r, puntos: [], disponible: false, mensaje: "No fue posible analizar esta fuente en este momento." });
    } finally {
      setAnalizandoUrl(null);
    }
  };

  const handleGuardarInformeBCN = () => {
    if (!liveQuery) return;
    const aGuardar = seleccionComparar.length > 0 ? seleccionComparar : liveResultados.slice(0, 8);
    const newReport: CustomReport = {
      query: liveQuery,
      fecha: new Date().toLocaleDateString("es-CL", { day: '2-digit', month: '2-digit', year: 'numeric' }),
      resultados: aGuardar,
      fuentesConsultadas: liveFuentesConsultadas,
      fuentesFallidas: liveFuentesFallidas,
      parrafoAuto: buildParrafoAutomatico(liveQuery, aGuardar),
      leySeleccionada: leySeleccionada || undefined,
      normasComparadas: aGuardar,
    };
    setSavedReports((prev) => [newReport, ...prev]);
    setActiveTab("guardados");
    setSuccessMessage("Informe oficial tipo BCN generado y guardado.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRedactarIA = async (idx: number) => {
    const rep = savedReports[idx];
    if (!rep || rep.resultados.length === 0) return;
    setRedactingIdx(idx);
    try {
      const res = await fetch("/api/derecho-comparado/redactar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: rep.query, resultados: rep.resultados }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { texto: string } = await res.json();
      setSavedReports((prev) => prev.map((r, i) => (i === idx ? { ...r, redaccionIA: data.texto } : r)));
    } catch (err) {
      setSearchError("No fue posible generar la redacción con IA en este momento.");
    } finally {
      setRedactingIdx(null);
    }
  };

  const handleGenerateCustomAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setIsGenerating(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/derecho-comparado?q=${encodeURIComponent(customQuery)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { resultados: ResultadoComparado[]; fuentesConsultadas: string[]; fuentesFallidas: string[] } = await res.json();

      const resultados = data.resultados || [];
      const newReport: CustomReport = {
        query: customQuery,
        fecha: new Date().toLocaleDateString("es-CL", { day: '2-digit', month: '2-digit', year: 'numeric' }),
        resultados,
        fuentesConsultadas: data.fuentesConsultadas || [],
        fuentesFallidas: data.fuentesFallidas || [],
        parrafoAuto: buildParrafoAutomatico(customQuery, resultados),
      };
      setSavedReports([newReport, ...savedReports]);
      setCustomQuery("");
      setActiveTab("guardados");
      setSuccessMessage(`Búsqueda completada: ${newReport.resultados.length} resultado(s) de fuentes oficiales.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setSearchError("No fue posible consultar las fuentes de derecho comparado en este momento.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-8 font-sans text-slate-800" id="legislacion-comparada-root">
      
      {/* Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">✕</button>
        </div>
      )}

      {/* Header Banner BCN Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden border-t-4 border-blue-600">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10 select-none pointer-events-none">
          <Globe className="w-96 h-96 text-blue-400" />
        </div>
        <div className="z-10 flex flex-col gap-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-extrabold px-3 py-1 text-2xs uppercase tracking-wider rounded-full font-mono flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3 h-3" /> DERECHO COMPARADO++
            </span>
            <span className="bg-blue-700 text-white font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full font-mono flex items-center gap-1.5 shadow-xs">
              <Scale className="w-3.5 h-3.5" /> Biblioteca del Congreso Nacional de Chile
            </span>
            <span className="bg-slate-800 text-slate-300 font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full font-mono border border-slate-700">
              Asesoría Técnica Parlamentaria
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Derecho Comparado & Legislación Internacional
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Centro unificado de análisis comparativo y búsqueda legislativa en tiempo real. Contraste proyectos de ley chilenos con estándares normativos de la OCDE, la Unión Europea e Iberoamérica.
          </p>
        </div>
        <div className="z-10 shrink-0 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
            <span className="block text-xl font-black text-white font-mono">{liveResultados.length > 0 ? liveResultados.length : COMPARATIVE_TOPICS.length}</span>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Normas en Memoria</span>
          </div>
        </div>
      </div>

      {/* 1. BUSCADOR PRINCIPAL MEJORADO CON IA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4" id="comparative-search-box">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Search className="w-5 h-5 text-blue-700" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Buscador Multijurisdiccional y Temático BCN
            </h2>
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 text-indigo-700 rounded-full text-2xs font-extrabold flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              IA & Repositorios Oficiales
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {liveLoading ? (
              <span className="text-blue-700 flex items-center gap-1.5 font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analizando normativa en Chile y 27 países con IA...
              </span>
            ) : liveQuery ? (
              <span>Consulta activa: <strong className="text-slate-900">"{liveQuery}"</strong> ({liveResultados.length} resultados)</span>
            ) : (
              <span>Búsqueda asistida por IA en 28 gacetas y repositorios oficiales</span>
            )}
          </span>
        </div>

        {/* Input Form with Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 shadow-inner"
              placeholder="Buscar materia, ley internacional o boletín (ej. hidrógeno verde, neuroderechos, teletrabajo, ciberseguridad, 15.869-19)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  handleBuscarRegulacion(searchTerm);
                }
              }}
              id="comparative-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpiar texto"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (searchTerm.trim()) {
                handleBuscarRegulacion(searchTerm);
              }
            }}
            disabled={liveLoading || !searchTerm.trim()}
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
            id="comparative-search-submit"
          >
            {liveLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analizando con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Buscar con IA en 27 Países</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Topics & Suggestions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Materias destacadas:
            </span>
            {SUGGESTED_SEARCHES.map((item) => (
              <button
                key={item.term}
                onClick={() => {
                  setSearchTerm(item.term);
                  handleBuscarRegulacion(item.term);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  liveQuery.toLowerCase() === item.term.toLowerCase()
                    ? "bg-blue-50 text-blue-800 border-blue-300 shadow-xs font-bold"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{item.term}</span>
                <span className="text-[9px] text-slate-400 font-mono">({item.cat})</span>
              </button>
            ))}
          </div>

          {/* Search History */}
          {historial.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <RefreshCw className="w-3 h-3 text-slate-400" /> Historial reciente:
              </span>
              {historial.map((term) => (
                <div
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    handleBuscarRegulacion(term);
                  }}
                  className="group text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-1.5 transition-colors border border-slate-200/60"
                >
                  <span>{term}</span>
                  <button
                    onClick={(e) => eliminarDeHistorial(term, e)}
                    className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                    title="Eliminar de historial"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={limpiarHistorial}
                className="text-[10px] text-slate-400 hover:text-red-600 underline cursor-pointer ml-1"
              >
                Limpiar historial
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sub-tabs structured like BCN report sections */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto" id="comparative-tabs">
        <button
          onClick={() => setActiveTab("live")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "live" 
              ? "bg-blue-700 text-white shadow-xs" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Búsqueda en Vivo Internacional ({liveResultados.length} Resultados)</span>
        </button>

        <button
          onClick={() => setActiveTab("documento")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "documento" 
              ? "bg-blue-700 text-white shadow-xs" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Informe Técnico BCN ({currentTopic.titulo.slice(0, 35)}...)</span>
        </button>

        <button
          onClick={() => setActiveTab("matriz")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "matriz" 
              ? "bg-blue-700 text-white shadow-xs" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz Comparada Multidimensional</span>
        </button>

        <button
          onClick={() => setActiveTab("comparador")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "comparador" 
              ? "bg-blue-700 text-white shadow-xs" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Comparador Lado a Lado ({seleccionComparar.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ia")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "ia" 
              ? "bg-blue-700 text-white shadow-xs" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Generador y Síntesis IA</span>
        </button>

        <button
          onClick={() => setActiveTab("guardados")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "guardados" 
              ? "bg-blue-700 text-white shadow-xs" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Informes Guardados ({savedReports.length})</span>
        </button>
      </div>

      {/* TAB 1: BÚSQUEDA EN VIVO INTERNACIONAL (19 FUENTES) */}
      {activeTab === "live" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* Summary bar */}
          <div className="bg-slate-50 border-l-4 border-blue-700 p-5 rounded-r-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Materia: {liveQuery}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {paisesDisponibles.length} países con resultados · {liveResultados.length} normativas oficiales
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {buildParrafoAutomatico(liveQuery, liveResultados)}
              </p>
              
              {liveResultados.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 mt-1">
                  <ExportToolbar
                    query={liveQuery}
                    resultados={liveResultados}
                    parrafoAuto={buildParrafoAutomatico(liveQuery, liveResultados)}
                    onNotify={(msg) => {
                      setSuccessMessage(msg);
                      setTimeout(() => setSuccessMessage(null), 3500);
                    }}
                    label="Exportar Consulta:"
                  />
                </div>
              )}
            </div>

            {liveResultados.length > 0 && (
              <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={handleGuardarInformeBCN}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Archivar en Guardados</span>
                </button>
              </div>
            )}
          </div>

          {/* Filter & Sorting Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            
            {/* Top row filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-blue-700" /> Región:
                </span>
                {["Todos", "Iberoamérica", "Unión Europea", "OCDE / Global", "Chile"].map((region) => (
                  <button
                    key={region}
                    onClick={() => { setFiltroRegion(region); setPaginaResultados(1); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      filtroRegion === region
                        ? "bg-blue-700 text-white border-blue-700 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>

              {/* Sorter and country dropdown */}
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={filtroPais}
                  onChange={(e) => { setFiltroPais(e.target.value); setPaginaResultados(1); }}
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Todos">Todos los países ({liveResultados.length})</option>
                  {paisesDisponibles.map((p) => (
                    <option key={p} value={p}>
                      {BANDERA_PAIS[p] || ""} {p} ({liveResultados.filter((r) => r.pais === p).length})
                    </option>
                  ))}
                </select>

                <select
                  value={orden}
                  onChange={(e) => { setOrden(e.target.value as typeof orden); setPaginaResultados(1); }}
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="relevancia">Mayor Relevancia</option>
                  <option value="fecha-desc">Más reciente</option>
                  <option value="fecha-asc">Más antigua</option>
                  <option value="pais">País (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Bottom row norm type filters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tipo de norma:
              </span>
              {["Todos", "Ley", "Reglamento", "Jurisprudencia", "Administrativo", "Documento"].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => { setFiltroTipo(tipo); setPaginaResultados(1); }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    filtroTipo === tipo
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tipo}
                </button>
              ))}

              <span className="text-xs text-slate-400 font-mono ml-auto">
                Mostrando {liveResultadosFiltrados.length} de {liveResultados.length} normas
              </span>
            </div>
          </div>

          {/* Floating Comparison Action Bar */}
          {seleccionComparar.length > 0 && (
            <div className="bg-blue-900 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center font-bold font-mono text-xs">
                  {seleccionComparar.length}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Normas seleccionadas para comparar</h4>
                  <p className="text-[11px] text-blue-200">
                    {seleccionComparar.map(s => s.pais).join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSeleccionComparar([])}
                  className="text-xs text-blue-200 hover:text-white px-3 py-1.5 cursor-pointer font-semibold"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleComparar}
                  disabled={seleccionComparar.length < 2 || comparando}
                  className="bg-white hover:bg-blue-50 text-blue-900 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
                  <span>{comparando ? "Analizando..." : "Comparar en tabla lado a lado"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading or Results Grid */}
          {liveLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-4 text-center">
              <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-900">Consultando gacetas legislativas internacionales en paralelo...</h3>
                <p className="text-xs text-slate-500">
                  Conectando con LeyChile, BOE (España), CELLAR EUR-Lex (UE), Dados Abertos (Brasil), Legislation.gov.uk, Oireachtas (Irlanda), Stortinget (Noruega) y 12 fuentes más.
                </p>
              </div>
            </div>
          ) : liveResultadosFiltrados.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No se encontraron normas con los filtros actuales</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Pruebe ampliando el filtro regional o de tipo de norma, o intente buscar con otro concepto legal.
              </p>
              <button
                onClick={() => { setFiltroRegion("Todos"); setFiltroPais("Todos"); setFiltroTipo("Todos"); }}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                Restablecer todos los filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveResultadosPagina.map((r, i) => {
                const isSelected = leySeleccionada?.resultado === r;
                const isAnalizando = analizandoUrl === (r.url || r.titulo);
                const estaEnComparacion = seleccionComparar.some((x) => claveResultado(x) === claveResultado(r));
                const codigo = CODIGO_PAIS[r.pais] || r.pais.slice(0, 2).toUpperCase();
                const bandera = BANDERA_PAIS[r.pais] || "🌐";
                const tipo = r.tipo || "Documento";
                const relevancia = r.relevancia ?? 0;

                return (
                  <div
                    key={i}
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all shadow-2xs hover:shadow-xs ${
                      estaEnComparacion 
                        ? "border-blue-600 ring-2 ring-blue-100" 
                        : isSelected 
                          ? "border-blue-500 ring-1 ring-blue-200" 
                          : r.pais === "Chile" 
                            ? "border-blue-200/80 bg-gradient-to-b from-blue-50/20 to-white" 
                            : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl" title={r.pais}>{bandera}</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-slate-900 leading-none">{r.pais}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{r.fuente}</span>
                          </div>
                        </div>

                        <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 select-none">
                          <input
                            type="checkbox"
                            checked={estaEnComparacion}
                            onChange={() => toggleSeleccionComparar(r)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>Comparar</span>
                        </label>
                      </div>

                      {/* Title & Link */}
                      <div className="flex flex-col gap-1">
                        {r.url ? (
                          <a 
                            href={r.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-sm font-extrabold text-blue-700 hover:text-blue-900 hover:underline leading-snug line-clamp-2"
                            title={r.titulo}
                          >
                            {r.titulo}
                          </a>
                        ) : (
                          <span className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2" title={r.titulo}>
                            {r.titulo}
                          </span>
                        )}

                        {r.tituloOriginal && r.tituloOriginal !== r.titulo && (
                          <span className="text-[10px] text-slate-400 italic line-clamp-1">
                            Orig: {r.tituloOriginal}
                          </span>
                        )}
                      </div>

                      {/* Structured Technical Summary */}
                      {r.descripcion && (
                        <FormattedResumen descripcion={r.descripcion} />
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${TIPO_ESTILO[tipo] || TIPO_ESTILO["Documento"]}`}>
                          {tipo}
                        </span>

                        <div className="flex items-center gap-3">
                          {r.fecha && (
                            <span className="text-[10px] text-slate-400 font-mono">{r.fecha}</span>
                          )}
                          <span className="flex items-center gap-1 font-mono font-bold">
                            <span className="text-[9px] text-slate-400 uppercase">Rel:</span>
                            <span className={`text-[11px] ${relevancia >= 80 ? "text-emerald-700" : relevancia >= 50 ? "text-blue-700" : "text-slate-500"}`}>
                              {relevancia}%
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => handleSeleccionarResultado(r)}
                          disabled={isAnalizando}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                        >
                          {isAnalizando ? (
                            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analizando...</>
                          ) : (
                            <><Eye className="w-3.5 h-3.5" /> Ver puntos clave</>
                          )}
                        </button>

                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                          >
                            <span>Gaceta Oficial</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPaginasResultados > 1 && !liveLoading && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPaginaResultados((p) => Math.max(1, p - 1))}
                disabled={paginaResultados === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
              >
                ‹ Anterior
              </button>
              {Array.from({ length: totalPaginasResultados }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPaginaResultados(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer ${
                    p === paginaResultados ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPaginaResultados((p) => Math.min(totalPaginasResultados, p + 1))}
                disabled={paginaResultados === totalPaginasResultados}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
              >
                Siguiente ›
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INFORME OFICIAL BCN (ESTRUCTURA TÉCNICA PARLAMENTARIA) */}
      {activeTab === "documento" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-fade-in font-sans">
          
          {/* Topic Selector Pills */}
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
              Dossiers Oficiales BCN:
            </span>
            {COMPARATIVE_TOPICS.map((topic) => {
              const isSelected = topic.id === currentTopic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-blue-700 text-white border-blue-700 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{topic.titulo}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {topic.boletinReferencia}
                  </span>
                </button>
              );
            })}
          </div>

          {/* BCN Official Header */}
          <div className="bg-blue-700 text-white px-8 py-3 flex items-center justify-between text-xs font-mono font-bold tracking-wider">
            <span>BIBLIOTECA DEL CONGRESO NACIONAL DE CHILE | Asesoría Técnica Parlamentaria</span>
            <span>{currentTopic.fechaInforme}</span>
          </div>

          <div className="p-8 md:p-12 flex flex-col gap-8">
            {/* Title & Metadata */}
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] font-mono rounded border border-slate-200">
                  {currentTopic.boletinReferencia}
                </span>
                <span className="bg-blue-50 text-blue-800 font-bold px-2.5 py-1 text-[11px] font-mono rounded border border-blue-100">
                  {currentTopic.supNumero}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-auto">
                  Comisión: {currentTopic.comisionDestino}
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {currentTopic.titulo}
              </h2>
              
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-2 font-medium">
                <div><span className="font-bold text-slate-900">Autor:</span> {currentTopic.autor}</div>
                <div><span className="font-bold text-slate-900">Materia:</span> {currentTopic.categoria}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <ExportToolbar
                  query={currentTopic.titulo}
                  resultados={currentTopic.paises.map(p => ({
                    pais: p.nombre,
                    fuente: `BCN SUP N° ${currentTopic.supNumero}`,
                    titulo: p.normativa,
                    descripcion: `Enfoque: ${p.enfoque}. Sanciones: ${p.sancionesOmision}. Lección para Chile: ${p.leccionParaChile}`,
                    tipo: "Ley"
                  }))}
                  parrafoAuto={currentTopic.resumenChile}
                  redaccionIA={currentTopic.documentoAnalisis.conclusionComision}
                  onNotify={(msg) => {
                    setSuccessMessage(msg);
                    setTimeout(() => setSuccessMessage(null), 3500);
                  }}
                  label="Exportar Informe BCN:"
                />
              </div>
            </div>

            {/* Resumen Box */}
            <div className="bg-slate-50 border-l-4 border-blue-700 p-6 rounded-r-xl flex flex-col gap-2">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-widest font-mono">
                Resumen Ejecutivo
              </h3>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {currentTopic.resumenChile}
              </p>
            </div>

            {/* Introducción */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-2">
                Introducción
              </h3>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                {currentTopic.documentoAnalisis.introduccion}
              </p>
            </div>

            {/* I. Aspectos Generales */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-2">
                I. Aspectos Generales y Marco Doctrinal
              </h3>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                {currentTopic.documentoAnalisis.aspectosGenerales}
              </p>
            </div>

            {/* II. Referencias de Derecho Comparado */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-2">
                II. Experiencia y Legislación Comparada Internacional
              </h3>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                {currentTopic.documentoAnalisis.comparativaInternacional}
              </p>
            </div>

            {/* III. Fichas por País */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {currentTopic.paises.map((p, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.bandera}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{p.nombre}</h4>
                      <span className="text-[10px] text-blue-700 font-mono font-bold">{p.normativa}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-slate-600">
                    <strong className="text-slate-800 text-[10px] uppercase">Enfoque:</strong>
                    <p className="leading-relaxed">{p.enfoque}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-xs bg-blue-50/70 p-3 rounded-lg border border-blue-100 text-blue-950 mt-auto">
                    <strong className="text-blue-900 text-[10px] uppercase flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-blue-700" /> Lección para Chile:
                    </strong>
                    <p className="leading-relaxed font-semibold">{p.leccionParaChile}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* IV. Cuadro Resumen de Medidas y Subcategorías */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-2">
                Cuadro Síntesis. Medidas y Subcategorías Normativas
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs font-mono uppercase">
                      <th className="p-4 w-1/3 border-r border-slate-800">Medida / Categoría</th>
                      <th className="p-4 w-2/3">Subcategorías y Componentes Regulatorios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {currentTopic.cuadrosResumen.map((cuadro, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                        <td className="p-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                          {cuadro.medida}
                        </td>
                        <td className="p-4 text-slate-700 align-top">
                          <ul className="flex flex-col gap-1.5">
                            {cuadro.subcategorias.map((sub, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2">
                                <span className="text-blue-700 font-bold">•</span>
                                <span>{sub}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* V. Impacto y Conclusiones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col gap-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                  Impacto Estimado en Sectores Clave
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentTopic.documentoAnalisis.impactoEstimado}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col gap-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                  Conclusiones y Recomendaciones para la Comisión
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentTopic.documentoAnalisis.conclusionComision}
                </p>
              </div>
            </div>

            {/* VI. Textos Normativos y Referencias */}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                Textos Normativos y Enlaces de Referencia BCN
              </h3>
              <ul className="flex flex-col gap-2">
                {currentTopic.textosNormativos.map((norma, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span className="font-bold text-slate-800">{norma.titulo}:</span>
                    <a href={norma.enlace} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono">
                      {norma.enlace}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: MATRICES COMPARADAS */}
      {activeTab === "matriz" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-700" />
                Matriz Comparada Multidimensional de Estándares Internacionales
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Estructura de comparación jurídica en dimensiones institucionales clave (España, Reino Unido, Canadá, México y Chile).
              </p>
            </div>
          </div>

          <MatrizComparadaTable />
        </div>
      )}

      {/* TAB 4: COMPARADOR MULTIPAÍS LADO A LADO */}
      {activeTab === "comparador" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-700" />
                Comparador y Matriz Multidimensional de Normativa Internacional
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Contraste analítico estructurado entre las legislaciones seleccionadas ({seleccionComparar.length} seleccionadas).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {seleccionComparar.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setVistaComparador("matriz")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      vistaComparador === "matriz" 
                        ? "bg-blue-700 text-white shadow-2xs font-extrabold" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Matriz Multidimensional BCN</span>
                  </button>
                  <button
                    onClick={() => setVistaComparador("fichas")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      vistaComparador === "fichas" 
                        ? "bg-blue-700 text-white shadow-2xs font-extrabold" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Fichas Lado a Lado</span>
                  </button>
                </div>
              )}

              {seleccionComparar.length > 0 && (
                <ExportToolbar
                  query={liveQuery}
                  resultados={seleccionComparar}
                  parrafoAuto={buildParrafoAutomatico(liveQuery, seleccionComparar)}
                  comparacionDetalle={comparacionDetalle}
                  onNotify={(msg) => {
                    setSuccessMessage(msg);
                    setTimeout(() => setSuccessMessage(null), 3500);
                  }}
                  label="Exportar:"
                />
              )}

              <button
                onClick={handleGuardarInformeBCN}
                disabled={seleccionComparar.length === 0}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Guardar Minuta</span>
              </button>
            </div>
          </div>

          {seleccionComparar.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <SlidersHorizontal className="w-8 h-8 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-800">No ha seleccionado normativas para comparar</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Vuelva a la pestaña "Búsqueda en Vivo Internacional" y marque las casillas "Comparar" (hasta 4 leyes de distintos países).
              </p>
              <button
                onClick={() => setActiveTab("live")}
                className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer mt-2"
              >
                Ir a Búsqueda en Vivo
              </button>
            </div>
          ) : vistaComparador === "matriz" ? (
            <div className="flex flex-col gap-4">
              <MatrizComparadaTable data={generarMatrizDinamica(liveQuery, seleccionComparar, comparacionDetalle)} />
            </div>
          ) : (
            <div 
              className="grid gap-4" 
              style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, seleccionComparar.length))}, minmax(0, 1fr))` }}
            >
              {seleccionComparar.map((r) => {
                const detalle = comparacionDetalle[claveResultado(r)];
                const bandera = BANDERA_PAIS[r.pais] || "🌐";
                const tipo = r.tipo || "Documento";

                return (
                  <div key={claveResultado(r)} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{bandera}</span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{r.pais}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{r.fuente}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSeleccionComparar(r)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Quitar de comparación"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded border ${TIPO_ESTILO[tipo] || TIPO_ESTILO["Documento"]}`}>
                        {tipo}
                      </span>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 hover:underline mt-1">
                          {r.titulo}
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-slate-900 mt-1">{r.titulo}</span>
                      )}
                      {r.fecha && <span className="text-[10px] text-slate-400 font-mono">{r.fecha}</span>}
                    </div>

                    {r.descripcion && (
                      <FormattedResumen descripcion={r.descripcion} />
                    )}

                    <div className="border-t border-slate-200 pt-3 flex flex-col gap-2 mt-auto">
                      <strong className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                        Puntos sustantivos clave:
                      </strong>
                      {comparando && !detalle ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1.5 py-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Extrayendo...
                        </span>
                      ) : detalle?.disponible && detalle.puntos.length > 0 ? (
                        <ul className="flex flex-col gap-1.5 text-xs text-slate-700">
                          {detalle.puntos.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-blue-700 font-bold">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          {detalle?.mensaje || "Revise el enlace oficial para consultar el texto completo de la norma."}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: GENERADOR Y SÍNTESIS IA */}
      {activeTab === "ia" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Generador Analítico de Derecho Comparado</h3>
              <p className="text-xs text-slate-500">
                Consulte y sintetice en vivo marcos normativos internacionales a partir de cualquier consulta específica.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateCustomAI} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Materia o Tópico Legislativo a Investigar:
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Ej. Regulación de criptomonedas, Ley de Royalty Minero, Eutanasia, Neuroderechos..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
              />
            </div>

            {searchError && (
              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">{searchError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isGenerating || !customQuery.trim()}
                className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Consultando fuentes internacionales...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Buscar y Generar Informe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: INFORMES GUARDADOS */}
      {activeTab === "guardados" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-blue-700" /> Informes y Minutas Guardadas ({savedReports.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Almacenados localmente para su uso en comisiones parlamentarias
            </span>
          </div>

          {savedReports.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No hay informes guardados aún</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Realice una búsqueda en vivo o use la pestaña "Generador IA" para crear un informe parlamentario y guardarlo aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedReports.map((rep, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-100">
                      {rep.fecha}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {rep.resultados.length} resultado(s) · {rep.fuentesConsultadas.length} fuente(s) consultada(s)
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <h4 className="text-base font-extrabold text-slate-900">{rep.query}</h4>
                    <ExportToolbar
                      query={rep.query}
                      resultados={rep.resultados}
                      parrafoAuto={rep.parrafoAuto}
                      redaccionIA={rep.redaccionIA}
                      onNotify={(msg) => {
                        setSuccessMessage(msg);
                        setTimeout(() => setSuccessMessage(null), 3500);
                      }}
                      label="Descargar Minuta:"
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{rep.parrafoAuto}</p>

                  {rep.redaccionIA ? (
                    <div className="text-xs text-slate-700 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <span className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                        Síntesis con Asistencia Analítica
                      </span>
                      {rep.redaccionIA}
                    </div>
                  ) : rep.resultados.length > 0 ? (
                    <button
                      onClick={() => handleRedactarIA(idx)}
                      disabled={redactingIdx === idx}
                      className="self-start text-[11px] font-bold text-blue-700 hover:text-blue-800 disabled:text-slate-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {redactingIdx === idx ? "Redactando..." : "Generar síntesis con IA"}
                    </button>
                  ) : null}

                  <ul className="flex flex-col gap-2 pt-2">
                    {rep.resultados.map((r, i) => (
                      <li key={i} className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            {BANDERA_PAIS[r.pais] || ""} {r.pais}
                          </span>
                          <span className="text-[10px] text-slate-400">{r.fuente}</span>
                          {r.fecha && <span className="text-[10px] text-slate-400 ml-auto">{r.fecha}</span>}
                        </div>
                        {r.url ? (
                          <a href={r.url} target="_blank" rel="noreferrer" className="font-bold text-slate-800 hover:text-blue-700 hover:underline">
                            {r.titulo}
                          </a>
                        ) : (
                          <span className="font-bold text-slate-800">{r.titulo}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal / Card for Key Points Inspection */}
      {modalNorma && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col font-sans">
            <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{BANDERA_PAIS[modalNorma.pais] || "🌐"}</span>
                <div>
                  <h3 className="text-sm font-bold">{modalNorma.pais} — Análisis Normativo</h3>
                  <span className="text-[10px] text-slate-300 font-mono">{modalNorma.fuente}</span>
                </div>
              </div>
              <button
                onClick={() => setModalNorma(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TIPO_ESTILO[modalNorma.tipo || "Documento"]}`}>
                  {modalNorma.tipo || "Documento"}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-1.5">{modalNorma.titulo}</h4>
                {modalNorma.tituloOriginal && (
                  <p className="text-xs text-slate-400 italic">Título original: {modalNorma.tituloOriginal}</p>
                )}
              </div>

              {modalNorma.descripcion && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <strong className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Descripción / Resumen:</strong>
                  {modalNorma.descripcion}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <strong className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Puntos Principales en Relación a "{liveQuery}":
                </strong>

                {analizandoUrl ? (
                  <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-700" />
                    <span>Obteniendo texto y procesando puntos sustantivos...</span>
                  </div>
                ) : leySeleccionada?.disponible && leySeleccionada.puntos.length > 0 ? (
                  <ul className="flex flex-col gap-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs text-slate-800">
                    {leySeleccionada.puntos.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {leySeleccionada?.mensaje || "Acceda directamente a la gaceta oficial mediante el enlace inferior para revisar el articulado íntegro."}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                {modalNorma.url ? (
                  <a
                    href={modalNorma.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Ver Norma en Gaceta Oficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Sin enlace web directo</span>
                )}

                <button
                  onClick={() => setModalNorma(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Footer */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex items-center gap-4 text-slate-600 mt-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-lg font-mono">
          BCN
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Nota Aclaratoria Institucional</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            La Asesoría Técnica Parlamentaria apoya el trabajo de las Comisiones Legislativas del Congreso Nacional de Chile, proveyendo análisis normativo comparado y acceso verificado a fuentes legislativas oficiales internacionales (Creative Commons Atribución 3.0 CL).
          </p>
        </div>
      </div>

    </div>
  );
}
