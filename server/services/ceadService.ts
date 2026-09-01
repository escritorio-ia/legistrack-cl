/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CeadDatasetItem {
  id: string;
  categoria: "Casos Policiales" | "Encuestas" | "Homicidios" | "Enfoque de Género" | "Niñez y Juventud";
  titulo: string;
  descripcion: string;
  cobertura: string;
  fuente: string;
  urlOficial: string;
  frecuencia: string;
}

export const CEAD_DATASETS_CATALOG: CeadDatasetItem[] = [
  {
    id: "cead-casos-policiales",
    categoria: "Casos Policiales",
    titulo: "Casos Policiales Oficiales por Delitos de Mayor Connotación Social (DMCS)",
    descripcion: "Registros unificados de denuncias y detenciones en flagrancia de Carabineros de Chile y PDI a nivel comunal, provincial, regional y nacional.",
    cobertura: "346 comunas y 16 regiones (2005 - 2026)",
    fuente: "Carabineros de Chile / PDI / CEAD - Subsecretaría de Prevención del Delito",
    urlOficial: "https://cead.minsegpublica.gob.cl/estadisticas-delictuales/",
    frecuencia: "Trimestral y Anual"
  },
  {
    id: "cead-enusc-sintesis",
    categoria: "Encuestas",
    titulo: "Encuesta Nacional Urbana de Seguridad Ciudadana (ENUSC)",
    descripcion: "Medición probabilística oficial de la tasa de victimización general en hogares, cifra negra de no denuncia y percepción de inseguridad ciudadana.",
    cobertura: "Nacional, regional y comunas urbanas representativas",
    fuente: "Instituto Nacional de Estadísticas (INE) / Subsecretaría de Prevención del Delito",
    urlOficial: "https://enusc.subprevenciondeldelito.gob.cl/",
    frecuencia: "Anual (2005 - 2026)"
  },
  {
    id: "cead-homicidios-observatorio",
    categoria: "Homicidios",
    titulo: "Informe Nacional de Víctimas de Homicidios Consumados",
    descripcion: "Estadísticas validadas interinstitucionalmente sobre víctimas de homicidios, uso de armas de fuego, imputados conocidos/desconocidos y crimen organizado.",
    cobertura: "Nacional y 16 regiones",
    fuente: "Centro Nacional para la Prevención de Homicidios / CEAD / Ministerio Público / SML",
    urlOficial: "https://prevenciondehomicidios.cl/estadisticas",
    frecuencia: "Semestral y Anual"
  },
  {
    id: "cead-envcm-genero",
    categoria: "Enfoque de Género",
    titulo: "Encuesta Nacional de Violencia contra las Mujeres (ENVCM) & VIF",
    descripcion: "Medición multidimensional de violencia física, psicológica, sexual y económica en el ámbito intrafamiliar y espacios públicos.",
    cobertura: "16 regiones de Chile",
    fuente: "Subsecretaría de Prevención del Delito / Ministerio de la Mujer",
    urlOficial: "https://cead.minsegpublica.gob.cl/informacion-con-enfoque-de-genero",
    frecuencia: "Periódica (versiones 2012, 2017, 2020, 2024)"
  },
  {
    id: "cead-polivictimizacion-nna",
    categoria: "Niñez y Juventud",
    titulo: "Encuesta Nacional de Polivictimización y Trayectorias Delictuales en NNA",
    descripcion: "Estudio de factores de riesgo, reclutamiento y desenganche delictual en niños, niñas y adolescentes, Programa 24 Horas y Programa Lazos.",
    cobertura: "Nacional urbana",
    fuente: "CEAD / Subsecretaría de Prevención del Delito",
    urlOficial: "https://cead.minsegpublica.gob.cl/informacion-de-ninos-ninas-y-adolescentes",
    frecuencia: "Estudios longitudinales"
  }
];

export function getCeadCatalog(): CeadDatasetItem[] {
  return CEAD_DATASETS_CATALOG;
}
