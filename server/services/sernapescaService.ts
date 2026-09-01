/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SernapescaReportItem {
  id: string;
  categoria: "Acuicultura" | "Desembarques" | "Pesca Artesanal" | "Pesca Industrial" | "Fiscalización" | "Anuarios";
  titulo: string;
  descripcion: string;
  cobertura: string;
  frecuencia: string;
  urlOficial: string;
}

export const SERNAPESCA_CATALOG: SernapescaReportItem[] = [
  {
    id: "cosechas-acuicultura",
    categoria: "Acuicultura",
    titulo: "Cosechas de Centros de Cultivo de Salmónidos y Mitílidos",
    descripcion: "Producción por especie (Salmón del Atlántico, Coho, Trucha Arcoíris, Chorito) en centros de engorda de Los Lagos, Aysén y Magallanes.",
    cobertura: "Regiones X, XI y XII (Series 1990 - 2026)",
    frecuencia: "Mensual y Anual",
    urlOficial: "https://www.sernapesca.cl/informes/estadisticas/"
  },
  {
    id: "desembarques-totales",
    categoria: "Desembarques",
    titulo: "Desembarque Pesquero Total (Artesanal e Industrial)",
    descripcion: "Estadísticas oficiales de capturas desembarcadas por especie (Jurel, Sardina común, Anchoveta, Merluza, Jibia) por puerto y caleta.",
    cobertura: "3.200 km de costa y 16 regiones de Chile",
    frecuencia: "Mensual y Anual",
    urlOficial: "https://www.sernapesca.cl/informes/estadisticas/"
  },
  {
    id: "registro-pesquero-artesanal",
    categoria: "Pesca Artesanal",
    titulo: "Registro Pesquero Artesanal (RPA) y Caletas Pesqueras",
    descripcion: "Padrón oficial de pescadores, buzos, recolectores de orilla y embarcaciones artesanales inscritas en las 460 caletas pesqueras del país.",
    cobertura: "Nacional por caleta (Ley 21.027 de Caletas)",
    frecuencia: "Actualización continua",
    urlOficial: "https://www.sernapesca.cl/informes/estadisticas/"
  },
  {
    id: "fiscalizacion-pesca-ilegal",
    categoria: "Fiscalización",
    titulo: "Control y Combate a la Pesca Ilegal, No Declarada y No Reglamentada (INDNR)",
    descripcion: "Acciones de control en puertos, puntos de desembarque y plantas de proceso bajo las facultades de la Ley 21.132 de Modernización de SERNAPESCA.",
    cobertura: "Nacional (Zonas de veda y áreas marinas protegidas)",
    frecuencia: "Semestral y Anual",
    urlOficial: "https://www.sernapesca.cl/informes/estadisticas/"
  },
  {
    id: "anuarios-estadisticos-pesca",
    categoria: "Anuarios",
    titulo: "Anuarios Estadísticos de Pesca y Acuicultura",
    descripcion: "Publicación consolidada histórica oficial que recopila series de extracción, acuicultura, plantas procesadoras y comercio exterior.",
    cobertura: "Series históricas desde 1978 a la fecha",
    frecuencia: "Anual",
    urlOficial: "https://www.sernapesca.cl/informes/estadisticas/"
  }
];

export function getSernapescaCatalog(): SernapescaReportItem[] {
  return SERNAPESCA_CATALOG;
}
