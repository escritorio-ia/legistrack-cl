/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IneProductItem {
  id: string;
  tema: "Precios e inflación" | "Mercado laboral" | "Demografía y población" | "Industria y minería" | "Comercio y servicios" | "Sociedad y género";
  titulo: string;
  descripcion: string;
  periodicidad: string;
  fuenteOficial: string;
  urlOficial: string;
  herramientaAsociada?: string;
}

export const INE_PRODUCTOS_CATALOG: IneProductItem[] = [
  {
    id: "ipc",
    tema: "Precios e inflación",
    titulo: "Índice de Precios al Consumidor (IPC)",
    descripcion: "Indicador mensual representativo del gasto de consumo de los hogares en 12 divisiones de productos y servicios con canasta referencial actualizada.",
    periodicidad: "Mensual",
    fuenteOficial: "Instituto Nacional de Estadísticas (INE Chile)",
    urlOficial: "https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor",
    herramientaAsociada: "https://calculadoraipc.ine.cl"
  },
  {
    id: "ene-desempleo",
    tema: "Mercado laboral",
    titulo: "Encuesta Nacional de Empleo (ENE)",
    descripcion: "Medición continua trimestral móvil de la fuerza de trabajo: ocupación, desocupación, tasa de participación, brecha de género e inactividad laboral.",
    periodicidad: "Mensual (Trimestre móvil)",
    fuenteOficial: "Instituto Nacional de Estadísticas (INE Chile)",
    urlOficial: "https://www.ine.gob.cl/estadisticas-por-tema/mercado-laboral/ocupacion-y-desocupacion",
    herramientaAsociada: "https://bancodatosene.ine.cl/"
  },
  {
    id: "informalidad-laboral",
    tema: "Mercado laboral",
    titulo: "Tasa de Ocupación Informal (TOI)",
    descripcion: "Seguimiento de personas ocupadas dependientes sin contrato o sin cotizaciones de salud/pensión, y trabajadores por cuenta propia en el sector informal.",
    periodicidad: "Mensual (Trimestre móvil)",
    fuenteOficial: "Instituto Nacional de Estadísticas (INE Chile)",
    urlOficial: "https://www.ine.gob.cl/estadisticas-por-tema/mercado-laboral/informalidad-laboral"
  },
  {
    id: "remuneraciones-ir-icmo",
    tema: "Mercado laboral",
    titulo: "Índices Nominales y Reales de Remuneraciones (IR y ICMO)",
    descripcion: "Evolución mensual de las remuneraciones ordinarias y extraordinarias y costo de la mano de obra por hora pagada en empresas de 5 y más trabajadores.",
    periodicidad: "Mensual",
    fuenteOficial: "Instituto Nacional de Estadísticas (INE Chile)",
    urlOficial: "https://www.ine.gob.cl/estadisticas-por-tema/mercado-laboral/remuneraciones-y-costos-laborales"
  },
  {
    id: "censo-poblacion",
    tema: "Demografía y población",
    titulo: "Censo de Población y Vivienda (Censo 2024 / Censo 2017)",
    descripcion: "Recuento y caracterización sociodemográfica exhaustiva de todos los habitantes, hogares y viviendas del territorio nacional.",
    periodicidad: "Decenal / Quinquenal",
    fuenteOficial: "Instituto Nacional de Estadísticas (INE Chile)",
    urlOficial: "https://www.ine.gob.cl/estadisticas-por-tema/demografia-y-poblacion/censo-de-poblacion-y-vivienda",
    herramientaAsociada: "https://redatam-ine.ine.cl"
  },
  {
    id: "ipi-mineria-industria",
    tema: "Industria y minería",
    titulo: "Índice de Producción Industrial (IPI) e IPMin",
    descripcion: "Indicador de volumen físico mensual de los sectores Minería (cobre, litio), Industria Manufacturera y Electricidad, Gas y Agua (EGA).",
    periodicidad: "Mensual",
    fuenteOficial: "Instituto Nacional de Estadísticas (INE Chile)",
    urlOficial: "https://www.ine.gob.cl/estadisticas-por-tema/industria-energia-y-construccion/indice-de-produccion-industrial"
  },
  {
    id: "epf-presupuestos-familiares",
    tema: "Sociedad y género",
    titulo: "Encuesta de Presupuestos Familiares (EPF)",
    descripcion: "Estructura de ingresos y gastos de los hogares urbanos en las capitales regionales, utilizada como base para la ponderación de la canasta del IPC.",
    periodicidad: "Quinquenal",
    fuenteOficial: "Instituto Nacional de Estadísticas (INE Chile)",
    urlOficial: "https://www.ine.gob.cl/estadisticas-por-tema/sociedad-y-condiciones-de-vida/encuesta-de-presupuestos-familiares"
  },
  {
    id: "atlas-genero",
    tema: "Sociedad y género",
    titulo: "Atlas de Género y Brecha Salarial",
    descripcion: "Monitoreo territorializado de brechas de género en participación económica, ingresos, uso del tiempo y trabajo de cuidados no remunerado.",
    periodicidad: "Anual",
    fuenteOficial: "Instituto Nacional de Estadísticas (INE Chile)",
    urlOficial: "https://www.ine.gob.cl/estadisticas-por-tema/sociedad-y-condiciones-de-vida/atlas-de-genero"
  }
];

export function getIneCatalog(): IneProductItem[] {
  return INE_PRODUCTOS_CATALOG;
}
