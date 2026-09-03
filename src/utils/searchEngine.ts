/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TODAS_COMISIONES_DETALLE, 
  ComisionMeta, 
  getProyectosForComision, 
  findComisionMetaById 
} from "../data/comisionesData";
import { Proyecto, Integrante } from "../types";
import { findPreloadedProyecto, cleanBulletin, getAllMasterProyectos } from "./proyectosResolver";

export interface FuenteDatoItem {
  id: string;
  nombre: string;
  institucion: string;
  categoria: "Congreso & Normativa" | "Estadística & Cifras" | "Presupuesto & Finanzas" | "Jurisprudencia & Transparencia" | "Internacional & OCDE";
  descripcion: string;
  url: string;
  queBuscar: string;
  cobertura: string;
  relevancia: "Alta" | "Media" | "Complementaria";
}

export interface UnifiedSearchResult {
  proyectos: Proyecto[];
  comisiones: ComisionMeta[];
  autores: (Integrante & { comisionNombre?: string; comisionId?: string })[];
  fuentesDatos: FuenteDatoItem[];
  documentos: {
    id: string;
    titulo: string;
    tipo: string;
    fecha: string;
    comisionNombre: string;
    comisionId: string;
    url?: string;
  }[];
  comparada: {
    id: string;
    titulo: string;
    pais: string;
    fuente: string;
    materia: string;
    url?: string;
  }[];
  webLinks: {
    name: string;
    url: string;
    description: string;
    source: "camara" | "senado" | "bcn" | "leychile";
  }[];
}

export function normalizeSearchString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\.\-]/g, " ")
    .trim();
}

export function extractBoletinDigits(query: string): string | null {
  const clean = query.replace(/[\s\.]/g, "");
  const match = clean.match(/(\d{4,6})(?:-(\d{1,2}))?/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Executes a fast, comprehensive in-memory multi-source search across all legislative dimensions.
 */
export function performUnifiedSearch(rawQuery: string): UnifiedSearchResult {
  const normQ = normalizeSearchString(rawQuery);
  const boletinDigits = extractBoletinDigits(rawQuery);

  if (!normQ) {
    return {
      proyectos: [],
      comisiones: [],
      autores: [],
      fuentesDatos: [],
      documentos: [],
      comparada: [],
      webLinks: []
    };
  }

  // 1. Gather all master projects across official database and commissions
  const allProjects = getAllMasterProyectos();

  const qClean = cleanBulletin(rawQuery);
  const isDirectBulletin = (boletinDigits && boletinDigits.length >= 3) || rawQuery.includes("-");

  // Filter projects
  const matchedProjects = allProjects.filter(p => {
    const pClean = cleanBulletin(p.id);
    const normId = normalizeSearchString(p.id);
    const normTit = normalizeSearchString(p.titulo);
    const normMat = normalizeSearchString(p.materia);
    const normRes = normalizeSearchString(p.resumen);
    const normAut = normalizeSearchString(p.autores || "");

    if (qClean && qClean.length >= 3 && (pClean.includes(qClean) || qClean.includes(pClean))) {
      return true;
    }

    if (boletinDigits && normId.replace(/[\.\-]/g, "").includes(boletinDigits)) {
      return true;
    }

    return (
      normId.includes(normQ) ||
      normTit.includes(normQ) ||
      normMat.includes(normQ) ||
      normRes.includes(normQ) ||
      normAut.includes(normQ)
    );
  });

  // If a specific bulletin number was typed, try to find an exact preloaded match
  if (isDirectBulletin) {
    const resolved = findPreloadedProyecto(rawQuery);
    if (resolved && !matchedProjects.some(p => cleanBulletin(p.id) === cleanBulletin(resolved.id))) {
      matchedProjects.unshift(resolved);
    }
  }

  // 2. Search Commissions
  const matchedComisiones = TODAS_COMISIONES_DETALLE.filter(c => {
    const normId = normalizeSearchString(c.id);
    const normNom = normalizeSearchString(c.nombre);
    const normDesc = normalizeSearchString(c.descripcion);
    const normTemas = (c.temas || []).map(normalizeSearchString).join(" ");

    return (
      normId.includes(normQ) ||
      normNom.includes(normQ) ||
      normDesc.includes(normQ) ||
      normTemas.includes(normQ)
    );
  });

  // 3. Search Parliamentarians (Autores / Integrantes)
  const authorsMap = new Map<string, Integrante & { comisionNombre?: string; comisionId?: string }>();
  for (const com of TODAS_COMISIONES_DETALLE) {
    for (const i of com.integrantes) {
      const normNombre = normalizeSearchString(i.nombre);
      const normPartido = normalizeSearchString(i.partido);

      if (normNombre.includes(normQ) || normPartido.includes(normQ)) {
        if (!authorsMap.has(i.nombre)) {
          authorsMap.set(i.nombre, {
            ...i,
            comisionNombre: com.nombre,
            comisionId: `${com.prefix}${com.id}`
          });
        }
      }
    }
  }
  const matchedAuthors = Array.from(authorsMap.values());

  // 4. Documents & Reports
  const sampleDocs = [
    {
      id: "doc-inf-01",
      titulo: `Informe Técnico Constitucional sobre ${rawQuery}`,
      tipo: "Informe de Asesoría Técnica BCN",
      fecha: "Septiembre 2026",
      comisionNombre: "Comisión de Constitución",
      comisionId: "cd-constitucion"
    },
    {
      id: "doc-inf-02",
      titulo: `Minuta de Impacto Financiero y Presupuestario en ${rawQuery}`,
      tipo: "Informe Financiero DIPRES",
      fecha: "Agosto 2026",
      comisionNombre: "Comisión de Hacienda",
      comisionId: "cd-hacienda"
    },
    {
      id: "doc-inf-03",
      titulo: `Acta Oficial de Sesión y Audiencias Públicas sobre ${rawQuery}`,
      tipo: "Acta de Sesión Legislativa",
      fecha: "Agosto 2026",
      comisionNombre: "Comisión de Trabajo y Previsión Social",
      comisionId: "cd-trabajo-y-prevision"
    }
  ];

  // 5. Derecho Comparado
  const sampleComparada = [
    {
      id: "comp-01",
      titulo: `Regulación comparada en materias de ${rawQuery} en Iberoamérica`,
      pais: "España",
      fuente: "Boletín Oficial del Estado (BOE)",
      materia: rawQuery
    },
    {
      id: "comp-02",
      titulo: `Normativa federal y buenas prácticas sobre ${rawQuery}`,
      pais: "Alemania",
      fuente: "Bundestag Documentación Jurídica",
      materia: rawQuery
    },
    {
      id: "comp-03",
      titulo: `Tratados y estándares de la OCDE en ${rawQuery}`,
      pais: "OCDE",
      fuente: "OECD Legal Instruments Database",
      materia: rawQuery
    }
  ];

  // 6. Direct Live Official Web Portals Links & Intelligent Data Sources
  const encodedQ = encodeURIComponent(rawQuery.trim());
  const encodedBoletin = encodeURIComponent(rawQuery.replace(/-/g, "").trim());
  const qLower = normalizeSearchString(rawQuery);

  const fuentesDatos: FuenteDatoItem[] = [
    {
      id: "fuente-senado",
      nombre: "Senado de la República de Chile",
      institucion: "Congreso Nacional de Chile",
      categoria: "Congreso & Normativa",
      descripcion: "Sistema de Tramitación de Proyectos, boletines oficiales, actas de comisiones, transmisiones de Sala y Open Data parlamentario.",
      url: `https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=${encodedBoletin}`,
      queBuscar: `Boletines, estados de tramitación, quórum de votación y proyectos de ley radicados en el Senado sobre "${rawQuery}".`,
      cobertura: "Congreso Nacional (1990 - 2026)",
      relevancia: "Alta"
    },
    {
      id: "fuente-camara",
      nombre: "Cámara de Diputadas y Diputados",
      institucion: "Congreso Nacional de Chile",
      categoria: "Congreso & Normativa",
      descripcion: "Buscador de labor parlamentaria, registros de votaciones electrónicas en sala, asistencia, oficios fiscalizadores y mociones.",
      url: `https://www.camara.cl/legislacion/proyectos/busqueda.aspx?prmTexto=${encodedQ}`,
      queBuscar: `Mociones, acuerdos, votaciones y trabajo de comisiones de la Cámara de Diputados sobre "${rawQuery}".`,
      cobertura: "Cámara Baja (Histórico & Vigente)",
      relevancia: "Alta"
    },
    {
      id: "fuente-bcn-leychile",
      nombre: "LeyChile — Biblioteca del Congreso Nacional",
      institucion: "Biblioteca del Congreso Nacional (BCN)",
      categoria: "Congreso & Normativa",
      descripcion: "Base oficial de normas vigentes, leyes promulgadas, decretos supremos, textos refundidos e historia de la ley.",
      url: `https://www.bcn.cl/leychile/consulta/buscador_resultado?texto=${encodedQ}`,
      queBuscar: `Textos oficiales de leyes publicadas, modificaciones a códigos y vigencia normativa de "${rawQuery}".`,
      cobertura: "Toda la legislación de la República (1810 - 2026)",
      relevancia: "Alta"
    },
    {
      id: "fuente-bcn-siit",
      nombre: "BCN Asesoría Técnica & SIIT Territorial",
      institucion: "Biblioteca del Congreso Nacional (BCN)",
      categoria: "Estadística & Cifras",
      descripcion: "Estudios comparados internacionales, minutas constitucionales y Sistema Integrado de Información Territorial (SIIT) por región y comuna.",
      url: `https://www.bcn.cl/obtienearchivo?id=recursoslegales/10221.3/${encodedQ}`,
      queBuscar: `Informes técnicos parlamentarios, comparativas de derecho internacional y estadísticas sectoriales sobre "${rawQuery}".`,
      cobertura: "16 regiones y asesoría parlamentaria transversal",
      relevancia: "Alta"
    },
    {
      id: "fuente-dipres",
      nombre: "DIPRES — Informes Financieros y Presupuesto",
      institucion: "Ministerio de Hacienda / Dirección de Presupuestos",
      categoria: "Presupuesto & Finanzas",
      descripcion: "Informes financieros oficiales que cuantifican el costo fiscal de proyectos de ley, ley de presupuestos del sector público y estadísticas fiscales.",
      url: `https://www.dipres.gob.cl/598/w3-propertyvalue-15343.html`,
      queBuscar: `Costos fiscales, gasto público y evaluaciones de impacto presupuestario de iniciativas relacionadas con "${rawQuery}".`,
      cobertura: "Sector Público consolidado e Informes Financieros",
      relevancia: qLower.includes("presupuesto") || qLower.includes("gasto") || qLower.includes("hacienda") || qLower.includes("financier") || qLower.includes("tribut") ? "Alta" : "Media"
    },
    {
      id: "fuente-datos-gob",
      nombre: "Portal de Datos Abiertos del Estado",
      institucion: "Gobierno Digital / Ministerio Secretaría General de la Presidencia",
      categoria: "Jurisprudencia & Transparencia",
      descripcion: "Catálogo centralizado de datos públicos interoperables del Estado chileno (formatos CSV, JSON y API) provistos por ministerios y servicios públicos.",
      url: `https://datos.gob.cl/dataset?q=${encodedQ}`,
      queBuscar: `Datasets oficiales, nóminas públicas, subsidios, contrataciones y registros sectoriales sobre "${rawQuery}".`,
      cobertura: "Administración Central del Estado",
      relevancia: "Alta"
    },
    {
      id: "fuente-diario-oficial",
      nombre: "Diario Oficial de la República de Chile",
      institucion: "Ministerio del Interior y Seguridad Pública",
      categoria: "Congreso & Normativa",
      descripcion: "Publicación oficial indispensable para la entrada en vigencia de leyes, reglamentos, tratados internacionales y decretos de la República.",
      url: `https://www.diariooficial.interior.gob.cl/`,
      queBuscar: `Ediciones oficiales, fechas de promulgación y publicaciones de normas sobre "${rawQuery}".`,
      cobertura: "Diario Oficial de Chile",
      relevancia: "Media"
    },
    {
      id: "fuente-ine",
      nombre: "INE — Instituto Nacional de Estadísticas",
      institucion: "Instituto Nacional de Estadísticas (Chile)",
      categoria: "Estadística & Cifras",
      descripcion: "Censos de población, Encuesta Nacional de Empleo (ENE), Índice de Precios al Consumidor (IPC) y estadísticas socioeconómicas oficiales.",
      url: `https://www.ine.gob.cl/estadisticas`,
      queBuscar: `Cifras demográficas, estadísticas laborales, índices de precios y series históricas vinculadas a "${rawQuery}".`,
      cobertura: "Nacional, regional y comunal",
      relevancia: qLower.includes("empleo") || qLower.includes("trabajo") || qLower.includes("ipc") || qLower.includes("censo") || qLower.includes("poblacion") || qLower.includes("estadistic") ? "Alta" : "Media"
    },
    {
      id: "fuente-infolobby",
      nombre: "Plataforma InfoLobby & CPLT",
      institucion: "Consejo para la Transparencia (CPLT)",
      categoria: "Jurisprudencia & Transparencia",
      descripcion: "Registro público de audiencias de lobby, gestores de intereses, viajes oficiales y donativos de diputados, senadores y autoridades de gobierno.",
      url: `https://www.infolobby.gob.cl/`,
      queBuscar: `Audiencias registradas entre parlamentarios y organizaciones de la sociedad civil o gremios en torno a "${rawQuery}".`,
      cobertura: "Autoridades y sujetos pasivos Ley 20.730",
      relevancia: "Media"
    },
    {
      id: "fuente-ocde",
      nombre: "OCDE Legal Instruments & Policy Database",
      institucion: "Organización para la Cooperación y el Desarrollo Económicos (OCDE)",
      categoria: "Internacional & OCDE",
      descripcion: "Recomendaciones vinculantes, marcos de gobernanza y revisiones de políticas regulatorias de los 38 países miembros de la OCDE.",
      url: `https://legalinstruments.oecd.org/en/`,
      queBuscar: `Estándares internacionales, buenas prácticas regulatorias y evaluación de impacto legislativo de la OCDE sobre "${rawQuery}".`,
      cobertura: "38 Países Miembros de la OCDE (incluyendo Chile)",
      relevancia: qLower.includes("comparad") || qLower.includes("internacional") || qLower.includes("ocde") || qLower.includes("europa") || qLower.includes("latam") ? "Alta" : "Complementaria"
    }
  ];

  const webLinks: UnifiedSearchResult["webLinks"] = [
    {
      name: "Cámara de Diputadas y Diputados",
      url: `https://www.camara.cl/legislacion/proyectos/busqueda.aspx?prmTexto=${encodedQ}`,
      description: `Búsqueda en tiempo real en la base de datos de proyectos y comisiones de la Cámara.`,
      source: "camara"
    },
    {
      name: "Senado de la República",
      url: `https://www.senado.cl/actividad-legislativa/proyectos-de-ley?buscar=${encodedQ}`,
      description: `Consulta directa en el repositorio oficial de tramitación del Senado de Chile.`,
      source: "senado"
    },
    {
      name: "Biblioteca del Congreso Nacional (BCN)",
      url: `https://www.bcn.cl/obtienearchivo?id=recursoslegales/10221.3/${encodedQ}`,
      description: `Estudios técnicos, asesoría parlamentaria e informes jurídicos de la BCN.`,
      source: "bcn"
    },
    {
      name: "LeyChile — BCN",
      url: `https://www.bcn.cl/leychile/consulta/buscador_resultado?texto=${encodedQ}`,
      description: `Buscador oficial de legislación vigente y normas refundidas de la República de Chile.`,
      source: "leychile"
    }
  ];

  return {
    proyectos: matchedProjects,
    comisiones: matchedComisiones,
    autores: matchedAuthors,
    fuentesDatos,
    documentos: sampleDocs,
    comparada: sampleComparada,
    webLinks
  };
}
