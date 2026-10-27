/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Proyecto } from "../types";
import { TODAS_COMISIONES_DETALLE, getProyectosForComision } from "../data/comisionesData";
import { PROYECTOS_REALES_CHILE } from "../data/proyectosRealData";

/**
 * Standard mapping of Chilean bulletin suffixes (-XX) to thematic commissions and subject areas.
 */
export const MATERIA_COMISION_MAP: Record<string, { comision: string; materia: string }> = {
  "07": { comision: "Comisión de Constitución, Legislación, Justicia y Reglamento", materia: "Derecho Constitucional y Justicia" },
  "13": { comision: "Comisión de Trabajo y Previsión Social", materia: "Legislación Laboral y Previsión Social" },
  "05": { comision: "Comisión de Hacienda", materia: "Finanzas Públicas y Tributación" },
  "11": { comision: "Comisión de Seguridad Ciudadana", materia: "Seguridad Pública y Orden Institucional" },
  "25": { comision: "Comisión de Seguridad Pública", materia: "Seguridad Pública y Lucha contra el Crimen" },
  "04": { comision: "Comisión de Educación", materia: "Educación y Formación Técnico-Profesional" },
  "15": { comision: "Comisión de Salud", materia: "Salud Pública y Medicamentos" },
  "19": { comision: "Comisión de Defensa Nacional", materia: "Defensa Nacional y Fuerzas Armadas" },
  "12": { comision: "Comisión de Medio Ambiente y Recursos Naturales", materia: "Medio Ambiente y Cambio Climático" },
  "14": { comision: "Comisión de Vivienda, Desarrollo Urbano y Bienes Nacionales", materia: "Vivienda, Urbanismo y Territorio" },
  "06": { comision: "Comisión de Gobierno Interior, Nacionalidad, Ciudadanía y Regionalización", materia: "Gobierno Interior y Descentralización" },
  "08": { comision: "Comisión de Relaciones Exteriores, Asuntos Interparlamentarios e Integración Latinoamericana", materia: "Relaciones Internacionales y Tratados" },
  "09": { comision: "Comisión de Obras Públicas, Transportes y Telecomunicaciones", materia: "Transportes, Infraestructura y Telecomunicaciones" },
  "10": { comision: "Comisión de Agricultura, Silvicultura y Desarrollo Rural", materia: "Agricultura, Silvicultura y Riego" },
  "02": { comision: "Comisión de Minería y Energía", materia: "Minería, Energías Renovables y Recursos Naturales" },
  "03": { comision: "Comisión de Economía, Fomento; Micro, Pequeña y Mediana Empresa, Protección de los Consumidores y Turismo", materia: "Economía y Fomento Productivo" },
  "17": { comision: "Comisión de Derechos Humanos y Pueblos Originarios", materia: "Derechos Humanos y Pueblos Originarios" },
  "18": { comision: "Comisión de Deportes y Recreación", materia: "Deportes y Actividad Física" },
  "20": { comision: "Comisión de Recursos Hídricos y Desertificación", materia: "Recursos Hídricos y Aguas" },
  "21": { comision: "Comisión de Pesca, Acuicultura e Intereses Marítimos", materia: "Pesca y Acuicultura" },
  "24": { comision: "Comisión de Pesca, Acuicultura e Intereses Marítimos", materia: "Pesca, Acuicultura e Intereses Marítimos" },
  "34": { comision: "Comisión de Mujeres y Equidad de Género", materia: "Mujeres, Equidad de Género y Cuidados" },
  "35": { comision: "Comisión de Personas Mayores y Discapacidad", materia: "Personas Mayores, Dependencia e Inclusión" },
  "36": { comision: "Comisión de Futuro, Ciencias, Tecnología, Conocimiento e Innovación", materia: "Ciencia, Inteligencia Artificial e Innovación" },
  "00": { comision: "Comisión Especial Mixta de Presupuestos", materia: "Normativa General" }
};

export function cleanBulletin(id: string): string {
  return id.replace(/[\.\s]/g, "").trim().toLowerCase();
}

/**
 * Detecta si una consulta de búsqueda tiene FORMA de número de boletín real
 * (ej. "21020", "21.020-07", "21020-07"), y no solo "contiene algún número de
 * 3+ dígitos en algún lugar". Antes, cualquier texto con un año o cifra de 3+
 * dígitos (ej. "reforma previsional 2024") se trataba como búsqueda de
 * boletín, saltándose los filtros de estado/cámara/materia e intentando
 * resolver un boletín que no existía. Un boletín real NUNCA tiene letras, así
 * que exigir que la consulta sea solo dígitos/puntos/guiones/espacios es
 * suficiente para distinguir ambos casos.
 */
export function esPatronBoletin(raw: string): boolean {
  const q = (raw || "").trim();
  if (!q) return false;
  if (!/^[\d.\-\s]+$/.test(q)) return false;
  const soloNumeros = q.replace(/[^0-9]/g, "");
  return soloNumeros.length >= 3;
}

/**
 * Returns the entire master consolidated list of all real Chilean legislative projects.
 */
export function getAllMasterProyectos(): Proyecto[] {
  const allMap = new Map<string, Proyecto>();

  // 1. Add real legislative projects from official Senate database
  for (const p of PROYECTOS_REALES_CHILE) {
    const cleanId = cleanBulletin(p.id);
    if (!allMap.has(cleanId)) {
      allMap.set(cleanId, p);
    }
  }

  // 2. Add commission-indexed projects
  for (const com of TODAS_COMISIONES_DETALLE) {
    const list = getProyectosForComision(com);
    for (const p of list) {
      const cleanId = cleanBulletin(p.id);
      if (!allMap.has(cleanId)) {
        allMap.set(cleanId, p);
      }
    }
  }

  return Array.from(allMap.values());
}

/**
 * Searches across all indexed master projects and returns the match.
 */
export function findPreloadedProyecto(id: string): Proyecto | null {
  const cleanTarget = cleanBulletin(id);
  const targetNumbersOnly = id.replace(/[^0-9]/g, "");

  const allProjects = getAllMasterProyectos();

  for (const p of allProjects) {
    const cleanP = cleanBulletin(p.id);
    const pNumbersOnly = p.id.replace(/[^0-9]/g, "");

    if (cleanP === cleanTarget || pNumbersOnly === targetNumbersOnly) {
      return p;
    }
    if (cleanTarget.length >= 4 && (cleanP.includes(cleanTarget) || cleanTarget.includes(cleanP))) {
      return p;
    }
  }
  return null;
}

/**
 * Formats a raw bulletin query into standard Chilean format: XX.XXX-YY
 */
export function formatBulletinNumber(raw: string): { formatted: string; baseNum: string; suffix: string } {
  const clean = raw.replace(/[^0-9\-]/g, "");
  const parts = clean.split("-");
  const baseNum = parts[0];
  const suffix = parts[1] || "07";

  let formattedBase = baseNum;
  if (baseNum.length > 3) {
    formattedBase = `${baseNum.slice(0, -3)}.${baseNum.slice(-3)}`;
  }
  const formatted = `${formattedBase}-${suffix.padStart(2, "0")}`;

  return { formatted, baseNum, suffix: suffix.padStart(2, "0") };
}

/**
 * Ficha mínima y honesta para un boletín que no está en la base local. NO inventa
 * título, autores, fechas, tramitación ni votaciones: solo indica que no hay datos
 * locales y entrega el enlace a la fuente oficial. La vista de detalle intenta luego
 * traer la ficha real desde el Senado (fetchLiveSenateProject) y la reemplaza.
 */
export function generateDynamicProyecto(id: string): Proyecto {
  const { formatted, baseNum } = formatBulletinNumber(id);
  const urlSenado = `https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=${encodeURIComponent(baseNum)}`;

  return {
    id: formatted,
    titulo: `Boletín N° ${formatted}`,
    resumen: "No hay información local para este boletín. Se está consultando la ficha oficial de tramitación del Senado; si no aparece, verifica que el número sea correcto en el sitio oficial.",
    estado: "Sin información",
    etapa: "Sin información",
    fechaIngreso: "",
    materia: "Sin información",
    autores: "No disponible",
    iniciativa: "Moción",
    patrocinantes: 0,
    urgencia: "Sin urgencia",
    camaraOrigen: "Diputados",
    comisionActual: "Sin información",
    comisionesHistoricas: [],
    linkCongreso: urlSenado,
    timeline: [],
    documentos: [
      {
        id: "doc-oficial",
        titulo: "Consultar ficha oficial de tramitación (Senado)",
        tipo: "Enlace oficial",
        fecha: "",
        url: urlSenado
      }
    ],
    votaciones: []
  };
}

/**
 * Universal project resolver: tries preloaded commission lists -> local match -> dynamic generation.
 */
export function resolveProyecto(id: string): Proyecto {
  const match = findPreloadedProyecto(id);
  if (match) {
    return match;
  }
  return generateDynamicProyecto(id);
}
