/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MineducDatasetItem {
  id: string;
  categoria: "Estudiantes" | "Docentes" | "Establecimientos" | "Sostenedores" | "Educación Superior" | "Indicadores";
  titulo: string;
  descripcion: string;
  frecuencia: string;
  urlOficial: string;
  registrosAproximados: string;
}

export const MINEDUC_DATASETS_CATALOG: MineducDatasetItem[] = [
  {
    id: "matricula-estudiante",
    categoria: "Estudiantes",
    titulo: "Matrícula Única por Estudiante (Básica y Media)",
    descripcion: "Registro individual anonimizado de matrícula de educación parvularia, básica, media y especial, con desglose por comuna, dependencia y grado.",
    frecuencia: "Anual (Series 2004 - 2026)",
    urlOficial: "https://datosabiertos.mineduc.cl/matricula-por-estudiante-2/",
    registrosAproximados: "3,6 millones de registros/año"
  },
  {
    id: "asistencia-escolar",
    categoria: "Estudiantes",
    titulo: "Asistencia Anual y Mensual Declarada",
    descripcion: "Porcentaje de asistencia efectiva por estudiante y establecimiento para monitoreo del ausentismo crónico y reactivación educativa.",
    frecuencia: "Mensual y Anual",
    urlOficial: "https://datosabiertos.mineduc.cl/asistencia-anual-por-estudiante/",
    registrosAproximados: "3,5 millones de registros/año"
  },
  {
    id: "alumnos-sep",
    categoria: "Estudiantes",
    titulo: "Alumnos Prioritarios, Preferentes y Beneficiarios SEP",
    descripcion: "Clasificación socioeconómica de estudiantes en vulnerabilidad según la Ley 20.248 de Subvención Escolar Preferencial.",
    frecuencia: "Anual",
    urlOficial: "https://datosabiertos.mineduc.cl/alumnos-preferentes-prioritarios-y-beneficiarios-sep/",
    registrosAproximados: "2,4 millones de beneficiarios"
  },
  {
    id: "desvinculacion-escolar",
    categoria: "Indicadores",
    titulo: "Desvinculación y Retención Escolar",
    descripcion: "Estudio longitudinal de estudiantes que abandonan el sistema regular o interrumpen su trayectoria educativa.",
    frecuencia: "Semestral y Anual",
    urlOficial: "https://datosabiertos.mineduc.cl/desvinculacion/",
    registrosAproximados: "45.000 estudiantes/año en seguimiento"
  },
  {
    id: "gratuidad-superior",
    categoria: "Educación Superior",
    titulo: "Matrícula y Asignación de Gratuidad Universitaria / TP (SIES)",
    descripcion: "Beneficiarios de la Ley 21.091 de Educación Superior en universidades del CRUCH, privadas acreditadas, IP y CFT estatales.",
    frecuencia: "Anual (2016 - 2026)",
    urlOficial: "https://datosabiertos.mineduc.cl/asignaciones-de-becas-y-creditos-en-educacion-superior/",
    registrosAproximados: "530.000 estudiantes con gratuidad"
  },
  {
    id: "dotacion-docente",
    categoria: "Docentes",
    titulo: "Cargos y Dotación Docente (CPEIP)",
    descripcion: "Información de profesores y asistentes de la educación, horas de contrato, tramos del Sistema de Desarrollo Profesional Docente (Ley 20.903).",
    frecuencia: "Anual",
    urlOficial: "https://datosabiertos.mineduc.cl/cargos-docentes/",
    registrosAproximados: "260.000 docentes en ejercicio"
  },
  {
    id: "directorio-establecimientos",
    categoria: "Establecimientos",
    titulo: "Directorio Oficial de Establecimientos Educacionales",
    descripcion: "Catastro georreferenciado con RBD, dependencia (SLEP, Municipal, Subvencionado, Pagado), ruralidad y estado de funcionamiento.",
    frecuencia: "Actualización continua",
    urlOficial: "https://datosabiertos.mineduc.cl/directorio-de-establecimientos-educacionales/",
    registrosAproximados: "11.800 establecimientos activos"
  },
  {
    id: "sistema-admision-escolar",
    categoria: "Sostenedores",
    titulo: "Sistema de Admisión Escolar (SAE) y Registro Anótate en la Lista",
    descripcion: "Datos de postulaciones, asignaciones y listas de espera del sistema centralizado de admisión de la Ley de Inclusión.",
    frecuencia: "Anual",
    urlOficial: "https://datosabiertos.mineduc.cl/sistema-de-admision-escolar-sae/",
    registrosAproximados: "500.000 postulaciones/año"
  }
];

export function getMineducCatalog(): MineducDatasetItem[] {
  return MINEDUC_DATASETS_CATALOG;
}
