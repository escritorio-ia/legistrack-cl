/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Globe, Scale, FileText, BookOpen, Search, ArrowRight, 
  CheckCircle, Sparkles, Layers, Shield, Building2, ExternalLink, Download, 
  RefreshCw, Filter, BookMarked, Bookmark, Plus, Check, X, Copy, 
  SlidersHorizontal, ChevronRight, ChevronDown, ChevronUp, Tag, Share2, HelpCircle, Eye, Info,
  FileSpreadsheet, Printer, FileDown, CheckCheck, Target, ShieldAlert, Wrench, AlertTriangle, AlertCircle
} from "lucide-react";
import ContenidoProtegido from "../components/ContenidoProtegido";
import CruceBoletinPanel, { type CruceBoletinEstado, type FuenteCruceUI } from "../components/CruceBoletinPanel";
import MatrizComparadaTable, { MatrizColumna, MatrizComparadaData, MatrizFilaDinamica } from "../components/MatrizComparadaTable";
import { normalizeSearchText } from "../utils/textUtils";
import {
  saveInformeComparadoToFirestore,
  getInformesComparadoFromFirestore,
  deleteInformeComparadoFromFirestore,
  InformeComparadoGuardado
} from "../services/firebaseService";

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
  /** oficial = devuelta por la API de la fuente; ia = propuesta por un modelo, sin verificar. */
  origen?: "oficial" | "ia";
  idOficial?: string;
  consultadoEl?: string;
  verificacionEnlace?: "ok" | "bloqueado" | "no_verificable";
}

interface EstadoFuenteUI {
  jurisdiccion: string;
  fuente: string;
  estado: "ok" | "sin_resultados" | "no_disponible";
  motivo?: string;
  consultadoEl: string;
  consultaUsada?: string;
}

interface NormaDescartadaUI {
  pais: string;
  titulo: string;
  url?: string;
  motivo: string;
}

interface AIProviderAttempt {
  provider: string;
  configured: boolean;
  error?: string;
}

const CODIGO_PAIS: Record<string, string> = {
  "Chile": "CL", "España": "ES", "Unión Europea": "EU", "Estados Unidos": "US", "Brasil": "BR",
  "Argentina": "AR", "Uruguay": "UY", "Colombia": "CO", "Panamá": "PA", "Reino Unido": "GB",
  "Francia": "FR", "Alemania": "DE", "Italia": "IT", "Portugal": "PT", "Canadá": "CA",
  "Australia": "AU", "Nueva Zelanda": "NZ", "Suiza": "CH", "Suecia": "SE", "Finlandia": "FI",
  "Noruega": "NO", "Dinamarca": "DK", "Países Bajos": "NL", "Irlanda": "IE", "Polonia": "PL",
  "Japón": "JP", "Luxemburgo": "LU", "Austria": "AT", "Estonia": "EE", "Corea del Sur": "KR", "Israel": "IL",
  "Taiwán": "TW", "Croacia": "HR", "México": "MX", "Perú": "PE"
};

const BANDERA_PAIS: Record<string, string> = {
  "Chile": "🇨🇱", "España": "🇪🇸", "Unión Europea": "🇪🇺", "Estados Unidos": "🇺🇸", "Brasil": "🇧🇷",
  "Argentina": "🇦🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴", "Panamá": "🇵🇦", "Reino Unido": "🇬🇧",
  "Francia": "🇫🇷", "Alemania": "🇩🇪", "Italia": "🇮🇹", "Portugal": "🇵🇹", "Canadá": "🇨🇦",
  "Australia": "🇦🇺", "Nueva Zelanda": "🇳🇿", "Suiza": "🇨🇭", "Suecia": "🇸🇪", "Finlandia": "🇫🇮",
  "Noruega": "🇳🇴", "Dinamarca": "🇩🇰", "Países Bajos": "🇳🇱", "Irlanda": "🇮🇪", "Polonia": "🇵🇱",
  "Japón": "🇯🇵", "Luxemburgo": "🇱🇺", "Austria": "🇦🇹", "Estonia": "🇪🇪", "Corea del Sur": "🇰🇷", "Israel": "🇮🇱",
  "Taiwán": "🇹🇼", "Croacia": "🇭🇷", "México": "🇲🇽", "Perú": "🇵🇪"
};

/** Jurisdicciones extranjeras con conector a su fuente oficial (ver server/services/fuentesOficialesService.ts). */
const N_JURISDICCIONES_OFICIALES = 28;

const REGION_MAP: Record<string, string[]> = {
  "Iberoamérica": ["Chile", "España", "Brasil", "Argentina", "Uruguay", "Colombia", "Panamá", "Portugal"],
  "Unión Europea": ["Unión Europea", "España", "Francia", "Alemania", "Italia", "Portugal", "Polonia", "Suecia", "Finlandia", "Dinamarca", "Países Bajos", "Irlanda", "Luxemburgo", "Austria", "Estonia", "Croacia"],
  "OCDE / Global": ["Estados Unidos", "Reino Unido", "Canadá", "Australia", "Nueva Zelanda", "Alemania", "Francia", "Italia", "Suiza", "Noruega", "Japón", "Corea del Sur", "Israel", "Austria", "Finlandia", "Dinamarca", "Irlanda", "Estonia", "Suecia", "Países Bajos", "Polonia", "España", "Chile"],
  "Chile": ["Chile"],
  // Agrupaciones por continente -- complementan las agrupaciones temáticas
  // de arriba (Iberoamérica, UE, OCDE), que no cubren "todo un continente"
  // sino bloques político-económicos específicos.
  "Europa": ["España", "Unión Europea", "Reino Unido", "Francia", "Alemania", "Italia", "Portugal", "Suiza", "Suecia", "Finlandia", "Noruega", "Dinamarca", "Países Bajos", "Irlanda", "Polonia", "Luxemburgo", "Austria", "Estonia", "Croacia"],
  "América": ["Chile", "Estados Unidos", "Brasil", "Argentina", "Uruguay", "Colombia", "México", "Perú", "Panamá", "Canadá"],
  "Asia-Pacífico": ["Japón", "Australia", "Nueva Zelanda", "Corea del Sur", "Taiwán", "Israel"]
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
  id?: string;
  query: string;
  fecha: string;
  resultados: ResultadoComparado[];
  fuentesConsultadas: string[];
  fuentesFallidas: string[];
  parrafoAuto: string;
  redaccionIA?: string;
  marcoConceptual?: string;
  leySeleccionada?: LeySeleccionada;
  normasComparadas?: ResultadoComparado[];
  boletinVinculado?: string;
  compartidoEquipo?: boolean;
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
  const oficiales = resultados.filter(r => r.origen === "oficial").length;
  const ia = resultados.length - oficiales;
  const procedencia = ia === 0
    ? "Todos provienen de fuentes oficiales consultadas en línea."
    : `${oficiales} proviene${oficiales === 1 ? "" : "n"} de fuentes oficiales consultadas en línea y ${ia} ${ia === 1 ? "es una propuesta" : "son propuestas"} de IA cuyo enlace fue visitado (sin verificación del contenido).`;
  return `Se identificaron ${resultados.length} resultado${resultados.length === 1 ? "" : "s"} en ${paises.length} país(es) sobre "${query}": ${detallePaises}. ${procedencia} Para conocer el contenido de cada norma, abra el documento original en su enlace.`;
}

// Agrupa las fuentes consultadas por tipo de documento (Normativa,
// Jurisprudencia, Documentos), tal como lo hacen las referencias
// bibliográficas de un informe real de Asesoría Técnica Parlamentaria de la
// BCN, en vez de una lista plana sin distinción de naturaleza de la fuente.
function agruparFuentesPorTipo(resultados: ResultadoComparado[]): { grupo: string; items: ResultadoComparado[] }[] {
  const normativa = resultados.filter(r => r.tipo !== "Jurisprudencia" && r.tipo !== "Documento");
  const jurisprudencia = resultados.filter(r => r.tipo === "Jurisprudencia");
  const documentos = resultados.filter(r => r.tipo === "Documento");
  const grupos: { grupo: string; items: ResultadoComparado[] }[] = [];
  if (normativa.length > 0) grupos.push({ grupo: "Normativa", items: normativa });
  if (jurisprudencia.length > 0) grupos.push({ grupo: "Jurisprudencia", items: jurisprudencia });
  if (documentos.length > 0) grupos.push({ grupo: "Documentos", items: documentos });
  return grupos;
}

function buildInformeMarkdown(
  query: string,
  resultados: ResultadoComparado[],
  parrafoAuto: string,
  redaccionIA?: string,
  comparacionDetalle?: Record<string, { resultado: ResultadoComparado; puntos: string[]; disponible: boolean; mensaje?: string }>,
  marcoConceptual?: string,
  cuerpoCompletoIA?: string
): string {
  const fecha = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  const tituloCase = query.charAt(0).toUpperCase() + query.slice(1);
  const paises = Array.from(new Set(resultados.map(r => r.pais)));
  const fuentes = Array.from(new Set(resultados.map(r => r.fuente).filter(Boolean)));
  const lines: string[] = [];
  lines.push(`# Legislación comparada: ${tituloCase}`);
  lines.push(`**Asesoría Técnica Parlamentaria**`);
  lines.push(`*Fecha de emisión: ${fecha}* | *Jurisdicciones consultadas: ${paises.length}* | *Normas analizadas: ${resultados.length}*`);
  lines.push("");

  let n = 1;
  if (cuerpoCompletoIA) {
    // Informe completo redactado por la IA en un solo llamado (Resumen e
    // Introducción / Caso [País] por cada jurisdicción / Conclusiones y
    // Análisis Comparado), basado exclusivamente en las disposiciones reales
    // ya extraídas -- reemplaza el ensamblado de fragmentos (Introducción +
    // Síntesis + Desarrollo por país) por un informe redactado de corrido,
    // según el formato pedido explícitamente para este informe.
    lines.push(cuerpoCompletoIA.trim());
    // Nota aclaratoria de IA, ya que el bloque anterior reemplaza la
    // introducción fija que normalmente la incluía.
    lines.push("");
    lines.push(`*Este documento fue generado con asistencia de inteligencia artificial a partir de fuentes oficiales en tiempo real; no reemplaza el análisis de un informe elaborado por un asesor de la BCN y su contenido debe contrastarse con las fuentes originales antes de su uso.*`);
    n = 2;
  } else {
    lines.push(`## Introducción`);
    lines.push(`De acuerdo a lo consultado, este documento analiza el tratamiento normativo de "${query}" en la experiencia comparada, a partir de registros obtenidos en tiempo real desde repositorios legislativos oficiales (${fuentes.join(", ") || "fuentes oficiales"}). El tema que aborda y sus contenidos están delimitados por la información efectivamente disponible en esas fuentes al momento de la consulta y por el alcance de una minuta de apoyo, no de un estudio académico exhaustivo. Este documento fue generado con asistencia de inteligencia artificial a partir de fuentes oficiales en tiempo real; no reemplaza el análisis de un informe elaborado por un asesor de la BCN y su contenido debe contrastarse con las fuentes originales antes de su uso.`);
    if (marcoConceptual) {
      lines.push("");
      lines.push(`## ${n}. Marco conceptual`);
      lines.push(marcoConceptual);
      n++;
    }
    lines.push("");
    lines.push(`## ${n}. Síntesis`);
    n++;
    lines.push(parrafoAuto);
    if (redaccionIA) {
      lines.push("");
      lines.push(`### Análisis y lecciones para Chile`);
      lines.push(redaccionIA);
    }
    lines.push("");
    lines.push(`## ${n}. Desarrollo por país`);
    n++;
    // Desarrollo artículo por artículo en prosa continua por país (estilo de
    // los informes reales de "Legislación Comparada" de la BCN), en vez de
    // aplastar los puntos reales extraídos del texto de cada norma dentro de
    // una celda de tabla -- que los volvía ilegibles y muy distintos del
    // formato de los documentos de referencia entregados.
    for (const r of resultados) {
      const detalle = comparacionDetalle ? comparacionDetalle[`${r.pais}|${r.titulo}`] : undefined;
      lines.push("");
      lines.push(`### ${r.pais} — ${r.titulo}`);
      lines.push(`*${r.tipo || "Ley"} | ${r.fuente}${r.fecha ? ` | ${r.fecha}` : ""}*`);
      lines.push("");
      if (detalle?.disponible && detalle.puntos.length > 0) {
        for (const p of detalle.puntos) {
          lines.push(`- ${p}`);
        }
      } else if (detalle && detalle.disponible === false) {
        lines.push(`*${detalle.mensaje || "No fue posible acceder a disposiciones sustantivas del texto oficial de esta norma."}*`);
      } else {
        lines.push(r.descripcion || "Sin descripción disponible en la fuente oficial.");
      }
    }
  }
  lines.push("");
  lines.push(`## ${n}. Fuentes consultadas`);
  for (const { grupo, items } of agruparFuentesPorTipo(resultados)) {
    lines.push("");
    lines.push(`**${grupo}**`);
    for (const r of items) {
      lines.push(`- **[${r.pais}]** ${r.titulo}${r.url ? ` — [enlace oficial](${r.url})` : ""}`);
    }
  }
  lines.push("");
  lines.push(`---`);
  lines.push(`*Nota aclaratoria: este documento fue generado con asistencia de inteligencia artificial por LegisTrack-CL a partir de fuentes legislativas oficiales consultadas en tiempo real, para apoyo al trabajo de Comisiones del Congreso Nacional de Chile. No es un documento académico, no constituye un informe oficial de la Biblioteca del Congreso Nacional, y sus contenidos están delimitados por la información disponible en las fuentes al momento de la consulta.*`);
  return lines.join("\n");
}

function renderTextoConNegrita(text: string) {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/);
  return parts.map((part, index) => (index % 2 === 1 ? <strong key={index} className="font-extrabold text-slate-900">{part}</strong> : part));
}

// Renderer de markdown liviano (encabezados, listas, negrita y tablas) para
// mostrar el Informe Técnico generado en vivo, con una tipografía y
// jerarquía visual cercana a los informes reales de Asesoría Técnica
// Parlamentaria de la BCN (título grande, secciones con línea divisoria,
// "Introducción" destacada como recuadro) en vez de texto plano chico.
function renderInformeMarkdown(markdown: string) {
  if (!markdown) return null;
  const lines = markdown.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  // Cuando la sección activa es "Introducción" (o "Marco conceptual"), su
  // primer párrafo se destaca como recuadro -- igual al "Resumen Ejecutivo"
  // de un informe real -- en vez de mezclarse como texto plano más.
  let seccionDestacada = false;
  let primerParrafoDeSeccion = true;

  while (i < lines.length) {
    const raw = lines[i];
    const text = raw.trim();

    if (text.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const rows = tableLines.filter(l => !/^\|[\s:|-]+\|$/.test(l)).map(l => l.slice(1, -1).split("|").map(c => c.trim()));
      const [header, ...body] = rows;
      blocks.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-slate-200">
          <table className="w-full text-xs border-collapse">
            {header && (
              <thead>
                <tr className="bg-slate-100">
                  {header.map((h, hi) => <th key={hi} className="text-left font-extrabold text-slate-700 px-3.5 py-2.5 border-b border-slate-200">{h}</th>)}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                  {row.map((cell, ci) => <td key={ci} className="align-top px-3.5 py-2.5 border-b border-slate-100 text-slate-600">{renderTextoConNegrita(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (text === "") { blocks.push(<div key={i} className="h-1" />); i++; continue; }
    if (text === "---") { blocks.push(<hr key={i} className="my-5 border-t border-slate-200" />); i++; continue; }
    if (text.startsWith("# ")) {
      blocks.push(<h1 key={i} className="text-2xl font-black text-slate-900 tracking-tight border-b-2 border-blue-700 pb-3 mb-1">{text.slice(2)}</h1>);
      i++; continue;
    }
    if (text.startsWith("### ")) { blocks.push(<h3 key={i} className="text-xs font-extrabold text-blue-900 uppercase tracking-wide mt-4 mb-1.5">{text.slice(4)}</h3>); i++; continue; }
    if (text.startsWith("## ")) {
      const titulo = text.slice(3);
      seccionDestacada = /^(introducci[oó]n|marco conceptual)\b/i.test(titulo);
      primerParrafoDeSeccion = true;
      blocks.push(
        <h2 key={i} className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mt-5 mb-2.5">
          {titulo}
        </h2>
      );
      i++; continue;
    }
    if (text.startsWith("* ") || text.startsWith("- ")) { blocks.push(<li key={i} className="ml-4 list-disc text-sm text-slate-700 leading-relaxed py-0.5">{renderTextoConNegrita(text.slice(2))}</li>); i++; continue; }

    if (seccionDestacada && primerParrafoDeSeccion) {
      blocks.push(
        <p key={i} className="text-sm text-slate-800 leading-relaxed bg-slate-50 border-l-4 border-blue-700 rounded-r-xl px-4 py-3 my-2">
          {renderTextoConNegrita(text)}
        </p>
      );
      primerParrafoDeSeccion = false;
    } else {
      blocks.push(<p key={i} className="text-sm text-slate-700 leading-relaxed my-1.5">{renderTextoConNegrita(text)}</p>);
    }
    i++;
  }
  return blocks;
}

function exportarAWord(
  query: string,
  resultados: ResultadoComparado[],
  parrafoAuto: string,
  redaccionIA?: string,
  comparacionDetalle?: Record<string, { resultado: ResultadoComparado; puntos: string[]; disponible: boolean; mensaje?: string }>,
  marcoConceptual?: string
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
        <div class="bcn-title">LegisTrack-CL</div>
        <div class="bcn-sub">Asesoría Técnica Parlamentaria — Minuta de Derecho Comparado (generada con IA)</div>
      </div>

      <h1>Legislación comparada: ${query.charAt(0).toUpperCase() + query.slice(1)}</h1>
      
      <div class="meta-box">
        <strong>Materia:</strong> ${query}<br>
        <strong>Fecha de Emisión:</strong> ${fecha}<br>
        <strong>Jurisdicciones Analizadas:</strong> ${Array.from(new Set(resultados.map(r => r.pais))).join(", ") || "Internacional"}<br>
        <strong>Total de Normativas Identificadas:</strong> ${resultados.length}
      </div>

      ${marcoConceptual ? `<div class="section-title">1. Marco Conceptual</div><p style="text-align: justify;">${marcoConceptual}</p>` : ""}

      <div class="section-title">${marcoConceptual ? "2" : "1"}. Síntesis Ejecutiva y Panorama Internacional</div>
      <p style="text-align: justify;">${parrafoAuto}</p>
      ${redaccionIA ? `<div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px; margin-top: 10px;"><strong>Análisis Estratégico y Lecciones para Chile:</strong><br>${redaccionIA}</div>` : ""}

      <div class="section-title">${marcoConceptual ? "3" : "2"}. Matriz de Legislación Comparada por País</div>
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

      <div class="section-title">${marcoConceptual ? "4" : "3"}. Marco Metodológico y Fuentes Oficiales</div>
      <p>Este informe compila información extraída en tiempo real de los repositorios y gacetas legislativas oficiales de las jurisdicciones consultadas (incluyendo LeyChile de la BCN, Boletín Oficial del Estado de España, EUR-Lex CELLAR de la Unión Europea, Cámara y Senado de Brasil, Legislation.gov.uk del Reino Unido, entre otros). Provee una panorámica sistemática de las soluciones normativas adoptadas internacionalmente.</p>

      <div class="footer">
        Documento de trabajo generado con asistencia de IA por LegisTrack-CL a partir de fuentes oficiales, para apoyo al trabajo de Comisiones del Congreso Nacional de Chile. No constituye un informe oficial de la Biblioteca del Congreso Nacional.
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
    "Origen del dato",
    "Enlace Gaceta Oficial",
    "Resumen / Objeto de la Norma"
  ];

  const rows = resultados.map((r) => [
    `"${(r.pais || "").replace(/"/g, '""')}"`,
    `"${(CODIGO_PAIS[r.pais] || "").replace(/"/g, '""')}"`,
    `"${(r.tipo || "No informado").replace(/"/g, '""')}"`,
    `"${(r.titulo || "").replace(/"/g, '""')}"`,
    `"${(r.fecha || "N/D").replace(/"/g, '""')}"`,
    `"${(r.fuente || "").replace(/"/g, '""')}"`,
    `"${r.origen === "oficial" ? "Fuente oficial" : "Propuesta de IA (enlace visitado)"}"`,
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
  comparacionDetalle?: Record<string, { resultado: ResultadoComparado; puntos: string[]; disponible: boolean; mensaje?: string }>,
  marcoConceptual?: string
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
          <div class="bcn-title">LegisTrack-CL</div>
          <div class="bcn-sub">Asesoría Técnica Parlamentaria — Minuta de Derecho Comparado (generada con IA)</div>
        </div>
        <div style="text-align: right; font-weight: bold; color: #64748b; font-size: 10px;">
          ${fecha}
        </div>
      </div>

      <h1>${query.charAt(0).toUpperCase() + query.slice(1)}</h1>

      <div class="meta-grid">
        <div><strong>Materia:</strong> ${query}</div>
        <div><strong>Jurisdicciones consultadas:</strong> ${Array.from(new Set(resultados.map(r => r.pais))).length} países</div>
        <div><strong>Total de normativas:</strong> ${resultados.length} registros oficiales</div>
        <div><strong>Origen:</strong> LegisTrack-CL (Asesoría Parlamentaria)</div>
      </div>

      ${marcoConceptual ? `<div class="section-header">1. Marco Conceptual</div><p style="font-size: 10px; text-align: justify; margin: 0 0 8px 0;">${marcoConceptual}</p>` : ""}

      <div class="section-header">${marcoConceptual ? "2" : "1"}. Síntesis Ejecutiva</div>
      <p style="font-size: 10px; text-align: justify; margin: 0 0 8px 0;">${parrafoAuto}</p>
      ${redaccionIA ? `<div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 8px; border-radius: 6px; margin-top: 6px;"><strong>Síntesis analítica:</strong><br>${redaccionIA}</div>` : ""}

      <div class="section-header">${marcoConceptual ? "3" : "2"}. Matriz de Legislación Comparada</div>
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
        Documento generado con asistencia de IA por LegisTrack-CL a partir de fuentes oficiales en tiempo real · No constituye un informe oficial de la Biblioteca del Congreso Nacional · Documento de Trabajo para Comisiones Legislativas
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function buildInformeText(rep: CustomReport): string {
  const lines: string[] = [];
  lines.push("LEGISTRACK-CL");
  lines.push("Asesoría Técnica Parlamentaria — Compilación de Derecho Comparado (generada con IA)");
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
  if (rep.marcoConceptual) {
    lines.push("");
    lines.push("2. MARCO CONCEPTUAL");
    lines.push("-".repeat(70));
    lines.push(rep.marcoConceptual);
  }
  lines.push("");
  lines.push(`${rep.marcoConceptual ? "3" : "2"}. SÍNTESIS EJECUTIVA`);
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
  marcoConceptual?: string;
  comparacionDetalle?: Record<string, { resultado: ResultadoComparado; puntos: string[]; disponible: boolean; mensaje?: string }>;
  onNotify?: (msg: string) => void;
  label?: string;
}

function ExportToolbar({
  query,
  resultados,
  parrafoAuto,
  redaccionIA,
  marcoConceptual,
  comparacionDetalle,
  onNotify,
  label = "Exportar Minuta:"
}: ExportToolbarProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiarMD = async () => {
    const md = buildInformeMarkdown(query, resultados, parrafoAuto, redaccionIA, comparacionDetalle, marcoConceptual);
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
    exportarAWord(query, resultados, parrafoAuto, redaccionIA, comparacionDetalle, marcoConceptual);
    if (onNotify) onNotify("Descargando documento Word (.doc) generado con IA.");
  };

  const handleDownloadExcel = () => {
    exportarAExcel(query, resultados);
    if (onNotify) onNotify("Descargando matriz de datos en Excel (.csv).");
  };

  const handlePrintPDF = () => {
    imprimirInformePDF(query, resultados, parrafoAuto, redaccionIA, comparacionDetalle, marcoConceptual);
  };

  const handleDownloadTxt = () => {
    const rep: CustomReport = {
      query,
      fecha: new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }),
      resultados,
      fuentesConsultadas: Array.from(new Set(resultados.map(r => r.fuente))),
      fuentesFallidas: [],
      parrafoAuto,
      redaccionIA,
      marcoConceptual
    };
    downloadInforme(rep);
    if (onNotify) onNotify("Descargando informe en texto (.txt).");
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

// Detecta un número de Boletín de ley chileno (ej. "17.006-01") en los
// resultados de Chile de una búsqueda de Derecho Comparado, para poder
// vincular el informe generado directamente al proyecto de ley relacionado.
function detectarBoletinChile(resultados: ResultadoComparado[]): string | null {
  for (const r of resultados) {
    if (r.pais !== "Chile") continue;
    const m = r.titulo.match(/\b\d{1,2}\.\d{3}-\d{2}\b|\b\d{4,5}-\d{2}\b/);
    if (m) return m[0];
  }
  return null;
}

// Chile siempre debe aparecer primero en cualquier columna/ficha comparativa,
// sin importar el orden en que el usuario haya ido marcando las normativas.
function ordenarChilePrimero<T extends { pais: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.pais === "Chile" && b.pais !== "Chile") return -1;
    if (b.pais === "Chile" && a.pais !== "Chile") return 1;
    return 0;
  });
}

// Título corto y descriptivo para un punto extraído del texto de una norma
// (ej. "Art. 5: Los prestadores deberán informar..." → "Art. 5 · Los prestadores deberán informar").
function tituloDePunto(punto: string | undefined, fallback: string): string {
  if (!punto) return fallback;
  let t = punto.replace(/\s+/g, " ").trim().replace(/^["“«]+/, "");
  const art = t.match(/^((?:art[íi]culo|art\.?|secci[óo]n|§)\s*[\w.\-°º]+)\s*[:.\-–—]?\s*/i);
  const prefijo = art ? art[1].replace(/\s+/g, " ") : "";
  if (art) t = t.slice(art[0].length);
  const corte = t.search(/[.;:]\s|[.;:]$/);
  if (corte > 12) t = t.slice(0, corte);
  const palabras = t.split(" ");
  if (palabras.length > 9) t = palabras.slice(0, 9).join(" ") + "…";
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return prefijo ? `${prefijo} · ${t}` : t;
}

// Antes esta función rellenaba "Mecanismos clave", "Fiscalización" y
// "Lecciones para Chile" con frases genéricas fijas (idénticas sin importar
// el país o la materia buscada) cuando no encontraba esas 3 dimensiones
// dentro de la descripción -- y como el formato de "descripcion" ya no trae
// esas 3 etiquetas (se cambió a prosa continua), esas 3 filas SIEMPRE caían
// al texto genérico fabricado, para cualquier búsqueda. Ahora la matriz solo
// muestra dimensiones respaldadas por datos reales: el objeto/ámbito (de la
// descripción real obtenida) y los puntos sustantivos reales extraídos del
// texto de la norma (mismos que "Ver puntos clave"/Análisis Comparado) --
// sin filas rellenas con contenido inventado cuando no hay esa información.
function generarMatrizDinamica(
  query: string,
  seleccionSinOrdenar: ResultadoComparado[],
  detalles: Record<string, LeySeleccionada>,
  lecturas?: { lecturaObjeto?: string; lecturaDisposiciones?: string },
  matrizTematica?: Array<{ dimension: string; valores: Record<string, string>; lecturaJuridica: string }>
): MatrizComparadaData {
  const seleccion = ordenarChilePrimero(seleccionSinOrdenar);
  const columnas: MatrizColumna[] = seleccion.map((r, i) => ({
    key: `col_${i}`,
    nombre: r.pais,
    bandera: BANDERA_PAIS[r.pais] || "🌐",
    normativaReferencia: r.titulo,
    url: r.url,
    isChile: r.pais === "Chile"
  }));

  let filas: MatrizFilaDinamica[];

  if (matrizTematica && matrizTematica.length > 0) {
    // Dimensiones jurídicas sustantivas reales para ESTA materia específica
    // (ej. "Titularidad", "Órgano garante" para acceso a información; serían
    // otras para otra materia), generadas por /matriz-tematica a partir de
    // las disposiciones reales ya extraídas -- en vez de filas administrativas
    // fijas (Tipo/Fecha/Fuente, ya visibles en la cabecera de cada columna).
    filas = matrizTematica.map((d) => {
      const valores: Record<string, string> = {};
      seleccion.forEach((r, i) => {
        valores[`col_${i}`] = d.valores[r.pais] || "No especificado en las disposiciones disponibles.";
      });
      return { dimension: d.dimension, icono: "⚖️", valores, lecturaJuridica: d.lecturaJuridica };
    });
  } else {
    const valoresObjeto: Record<string, string> = {};
    // Hasta 3 filas de "disposición destacada" -- una por cada punto real ya
    // extraído del texto (por país, en el orden en que la IA los entregó),
    // como respaldo honesto mientras la matriz temática real (arriba) no se
    // ha generado todavía.
    const valoresPunto: Record<string, string>[] = [{}, {}, {}];

    seleccion.forEach((r, i) => {
      const key = `col_${i}`;
      valoresObjeto[key] = r.descripcion || `Sin descripción disponible en la fuente oficial para ${r.pais}.`;

      const d = detalles[`${r.pais}|${r.titulo}`];
      const puntosDisponibles = d?.disponible ? d.puntos : [];
      for (let p = 0; p < 3; p++) {
        valoresPunto[p][key] = puntosDisponibles[p]
          || (d?.disponible === false
            ? "No disponible: la fuente obtenida no contiene disposiciones sustantivas."
            : "Aún no analizado — presiona \"Comparar y Generar Todo\" para extraer los puntos reales del texto de esta norma.");
      }
    });

    filas = [
      {
        dimension: "Objeto y ámbito de la norma",
        icono: "🎯",
        valores: valoresObjeto,
        lecturaJuridica: lecturas?.lecturaObjeto || "Presiona \"Comparar y Generar Todo\" para obtener la lectura jurídica comparativa de esta dimensión."
      },
      ...valoresPunto.map((valores, idx) => {
        // Título del punto: se toma del texto real de la norma de Chile (si existe) o de la primera norma con ese punto.
        const colChile = columnas.find(c => c.isChile)?.key;
        const fuenteTitulo = [colChile, ...columnas.map(c => c.key)]
          .filter((k): k is string => !!k)
          .map(k => valores[k])
          .find(v => v && !/^(No disponible|Aún no analizado)/i.test(v));
        return ({
        titulo: tituloDePunto(fuenteTitulo, "Punto pendiente de análisis"),
        dimension: `Disposición destacada ${idx + 1}`,
        icono: "📑",
        valores,
        lecturaJuridica: idx === 0
          ? (lecturas?.lecturaDisposiciones || "Presiona \"Comparar y Generar Todo\" para obtener la lectura jurídica comparativa de las disposiciones reales.")
          : "Extraído del texto oficial de cada norma cuando el análisis por país ya fue generado; de lo contrario, se indica explícitamente.",
        isWarmRow: true
      });
      })
    ];
  }

  return {
    id: "live-matrix",
    titulo: `Matriz Comparada: ${query.charAt(0).toUpperCase()}${query.slice(1)}`,
    subtitulo: `Contraste analítico estructurado entre ${seleccion.map(s => s.pais).join(", ")}`,
    boletinReferencia: `Consulta Activa BCN`,
    columnas,
    filas
  };
}

interface LegislacionComparadaViewProps {
  // Navega al detalle de un proyecto de ley por su Boletín -- permite vincular
  // un informe de Derecho Comparado directamente al proyecto chileno relacionado.
  setSelectedProyectoId?: (id: string) => void;
  // Materia con la que se debe buscar automáticamente al abrir la vista (ej.
  // al venir del banner "¿Cómo regulan esta materia otros 27 países?" de un
  // proyecto de ley específico) -- sin esto, el usuario tenía que volver a
  // escribir manualmente la misma materia que ya se le mostró en el banner.
  initialQuery?: string;
}

export default function LegislacionComparadaView({ setSelectedProyectoId, initialQuery }: LegislacionComparadaViewProps = {}) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [savedReports, setSavedReports] = useState<CustomReport[]>([]);
  const [cargandoCompartidos, setCargandoCompartidos] = useState<boolean>(false);

  // Los informes guardados por CUALQUIER analista del equipo (Firestore), no
  // solo los del navegador local -- antes cada persona veía únicamente sus
  // propias búsquedas guardadas en localStorage.
  useEffect(() => {
    let cancelado = false;
    setCargandoCompartidos(true);
    getInformesComparadoFromFirestore(30)
      .then((compartidos) => {
        if (cancelado) return;
        const mapeados: CustomReport[] = compartidos.map((c) => ({
          id: c.id,
          query: c.query,
          fecha: c.fecha,
          resultados: c.resultados,
          fuentesConsultadas: c.fuentesConsultadas,
          fuentesFallidas: c.fuentesFallidas,
          parrafoAuto: c.parrafoAuto,
          redaccionIA: c.redaccionIA,
          boletinVinculado: c.boletinVinculado,
          compartidoEquipo: true
        }));
        setSavedReports((prev) => {
          const idsExistentes = new Set(prev.map((r) => r.id).filter(Boolean));
          const nuevos = mapeados.filter((r) => !idsExistentes.has(r.id));
          return [...nuevos, ...prev];
        });
      })
      .finally(() => { if (!cancelado) setCargandoCompartidos(false); });
    return () => { cancelado = true; };
  }, []);
  const [materiasDestacadasAbiertas, setMateriasDestacadasAbiertas] = useState<boolean>(false);
  // Diagnóstico técnico de qué proveedor de IA respondió (o falló y por qué) en
  // la última búsqueda -- antes solo se podía ver llamando a la API por curl.
  const [liveAiDiagnostics, setLiveAiDiagnostics] = useState<AIProviderAttempt[]>([]);
  const [diagnosticoAbierto, setDiagnosticoAbierto] = useState<boolean>(false);
  // Informe Técnico BCN generado en vivo a partir del tema efectivamente buscado (liveResultados).
  // Se genera al seleccionar/pedir el informe desde la pestaña de Búsqueda en Vivo.
  const [informeLiveMarkdown, setInformeLiveMarkdown] = useState<string | null>(null);
  const [informeLiveQuery, setInformeLiveQuery] = useState<string>("");
  
  // Navigation tabs:
  // "live": Búsqueda en vivo internacional (19 fuentes)
  // "documento": Informe oficial BCN (Estructura formal)
  // "comparador": Comparador lado a lado / matriz dinámica de leyes seleccionadas
  // "guardados": Informes guardados
  const [activeTab, setActiveTab] = useState<"live" | "documento" | "comparador" | "guardados">("live");
  const [vistaComparador, setVistaComparador] = useState<"matriz" | "fichas">("matriz");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live federated search state
  const [cruceBoletin, setCruceBoletin] = useState<CruceBoletinEstado | null>(null);
  const [liveQuery, setLiveQuery] = useState<string>("");
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveResultados, setLiveResultados] = useState<ResultadoComparado[]>([]);
  const [liveFuentesConsultadas, setLiveFuentesConsultadas] = useState<string[]>([]);
  const [liveFuentesFallidas, setLiveFuentesFallidas] = useState<string[]>([]);
  const [liveEstadoFuentes, setLiveEstadoFuentes] = useState<EstadoFuenteUI[]>([]);
  const [liveDescartadas, setLiveDescartadas] = useState<NormaDescartadaUI[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const busquedaActual = useRef(0);
  // Segundos transcurridos de la búsqueda en curso (la primera del día puede tardar: varias fuentes se descargan completas).
  const [segundosBusqueda, setSegundosBusqueda] = useState(0);
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
  // Estado del botón "Comparar y Generar Informe", que ahora dispara TODO de
  // una vez (matriz, informe, análisis comparado)
  // -- distinto de "comparando" (solo cubre la extracción de puntos +
  // matriz) porque el resto de las piezas sigue generándose después de que
  // "comparando" ya volvió a false.
  const [generandoTodo, setGenerandoTodo] = useState(false);
  const [etapaInforme, setEtapaInforme] = useState("");
  // Dimensiones de la matriz temática más recientes: el informe las usa como insumo
  // por país, y el estado de React no está disponible dentro de la misma ejecución.
  const matrizTematicaRef = useRef<Array<{ dimension: string; valores: Record<string, string>; lecturaJuridica: string }>>([]);
  // Análisis comparativo REAL entre las normas seleccionadas (a partir de sus
  // puntos ya extraídos del texto real, no de los títulos) -- "analisisKey"
  // guarda para qué selección exacta se generó, para saber si quedó obsoleto.
  const [analisisComparadoIA, setAnalisisComparadoIA] = useState<string | null>(null);
  const [analisisComparadoKey, setAnalisisComparadoKey] = useState<string>("");
  const [analisisComparadoLoading, setAnalisisComparadoLoading] = useState(false);

  // "Lectura jurídica" real por dimensión de la Matriz Comparada (antes eran
  // frases fijas que solo explicaban qué significaba el campo, no un análisis
  // real) -- se genera junto con comparacionDetalle, a partir de las
  // descripciones y puntos ya extraídos.
  const [lecturasMatriz, setLecturasMatriz] = useState<{ lecturaObjeto?: string; lecturaDisposiciones?: string }>({});
  const [lecturasMatrizKey, setLecturasMatrizKey] = useState<string>("");

  // Dimensiones jurídicas temáticas reales de la Matriz (ej. "Titularidad",
  // "Órgano garante" para acceso a información -- específicas de cada
  // materia, no una lista fija), generadas junto con las lecturas jurídicas.
  const [matrizTematica, setMatrizTematica] = useState<Array<{ dimension: string; valores: Record<string, string>; lecturaJuridica: string }>>([]);
  const [matrizTematicaKey, setMatrizTematicaKey] = useState<string>("");



  // Search history
  const [historial, setHistorial] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("legiscomparada_historial");
      const guardado = raw ? JSON.parse(raw) : [];
      return Array.isArray(guardado) ? guardado.filter((t) => typeof t === "string") : [];
    } catch {
      return [];
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

  // Execute live search
  const handleBuscarRegulacion = async (term: string, autoSwitchTab = true) => {
    if (!term.trim()) return;
    let queryClean = term.replace(/\s+/g, " ").trim().slice(0, 200);
    // Cada búsqueda lleva un número: si llega la respuesta de una búsqueda anterior (más lenta), se ignora.
    const miBusqueda = ++busquedaActual.current;
    const vigente = () => busquedaActual.current === miBusqueda;
    // Se limpia lo de la búsqueda anterior para no mostrar sus normas bajo la consulta nueva.
    setLiveResultados([]);
    setLiveEstadoFuentes([]);
    setLiveDescartadas([]);
    setLiveFuentesFallidas([]);
    setLiveAiDiagnostics([]);
    setInformeLiveMarkdown(null);
    setLeySeleccionada(null);
    setSearchError(null);
    setFiltroRegion("Todos");
    setFiltroPais("Todos");
    setFiltroTipo("Todos");

    // Si se nombra un Boletín (ej. "16777-07" o "Boletín 16.777-07"): se busca la ficha oficial
    // del proyecto y se usa su materia para buscar las normas de otros países; después se cruza
    // todo con la moción/mensaje original (ver más abajo).
    let proyectoCruce: any = null;
    const mBol = queryClean.match(/(\d{1,2}\.?\d{3}-\d{2})/);
    const soloBoletin = !!mBol && queryClean.replace(mBol[0], "").replace(/bolet[ií]n|n[°º.]|n\.?o/gi, "").replace(/[\s:,.\-]/g, "") === "";
    if (soloBoletin && mBol) {
      setLiveLoading(true);
      setLiveQuery(queryClean);
      setCruceBoletin({ boletin: mBol[1], cargando: true, fuentes: [] });
      try {
        const rp = await fetch(`/api/proyecto/${encodeURIComponent(mBol[1])}`);
        if (rp.ok) proyectoCruce = await rp.json();
      } catch { /* se informa abajo */ }
      if (!vigente()) return;
      if (proyectoCruce?.titulo) {
        queryClean = String(proyectoCruce.titulo).replace(/^\s*(proyecto de ley|modifica|establece)\s*[,:]?\s*/i, "$1 ").slice(0, 160).trim();
        setCruceBoletin({ boletin: mBol[1], cargando: true, titulo: proyectoCruce.titulo, iniciativa: proyectoCruce.iniciativa, autores: proyectoCruce.autores, fechaIngreso: proyectoCruce.fechaIngreso, fuentes: [] });
      } else {
        setCruceBoletin({ boletin: mBol[1], cargando: false, fuentes: [], error: `No se encontró la ficha oficial del boletín ${mBol[1]}. Se muestran resultados de búsqueda por el texto ingresado.` });
      }
    } else {
      setCruceBoletin(null);
    }

    setLiveQuery(queryClean);
    setLiveLoading(true);
    setSearchError(null);
    setPaginaResultados(1);
    // Cada búsqueda nueva parte de cero en la selección para comparar -- si no
    // se limpiara, quedaban marcadas normativas de la búsqueda anterior (de
    // otra materia) mezcladas con los resultados de la nueva en "Comparador
    // Lado a Lado".
    setSeleccionComparar([]);
    setComparacionDetalle({});
    guardarEnHistorial(queryClean);
    if (autoSwitchTab && activeTab !== "live" && activeTab !== "documento") {
      setActiveTab("live");
    }

    try {
      const res = await fetch(`/api/derecho-comparado?q=${encodeURIComponent(queryClean)}`);
      if (!vigente()) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { resultados: ResultadoComparado[]; fuentesConsultadas: string[]; fuentesFallidas: string[]; aiDiagnostics?: AIProviderAttempt[]; estadoFuentes?: EstadoFuenteUI[]; descartadas?: NormaDescartadaUI[] } = await res.json();
      if (!vigente()) return;
      const resultados = data.resultados || [];
      setLiveResultados(resultados);
      setLiveFuentesConsultadas(data.fuentesConsultadas || []);
      setLiveFuentesFallidas(data.fuentesFallidas || []);
      setLiveEstadoFuentes(data.estadoFuentes || []);
      setLiveDescartadas(data.descartadas || []);
      setLiveAiDiagnostics(data.aiDiagnostics || []);

      // Genera automáticamente el Informe Técnico BCN del tema efectivamente buscado, para que la pestaña
      // esté lista al llegar, sin exigir un clic extra en "Generar Informe".
      if (proyectoCruce?.titulo && mBol) {
        // Fuentes citables: [1] ficha oficial, [2..] moción/mensaje y documentos del expediente, luego las normas.
        const docs: any[] = Array.isArray(proyectoCruce.documentos) ? proyectoCruce.documentos : [];
        const original = docs.find(d => d?.url && /mensaje|moci[oó]n|texto inicial|proyecto de ley/i.test(`${d.tipo || ""} ${d.titulo || ""}`));
        const fuentes: FuenteCruceUI[] = [];
        let n = 1;
        if (proyectoCruce.linkCongreso) fuentes.push({ n: n++, rotulo: "Ficha oficial del boletín", titulo: `Boletín ${mBol[1]} — ficha de tramitación`, url: proyectoCruce.linkCongreso });
        if (original) fuentes.push({ n: n++, rotulo: proyectoCruce.iniciativa === "Mensaje" ? "Mensaje original" : "Moción original", titulo: original.titulo || "Texto original del proyecto", url: original.url });
        ordenarChilePrimero(resultados).slice(0, 12).forEach(r => {
          fuentes.push({ n: n++, rotulo: r.fuente || "Norma", pais: r.pais, titulo: r.titulo, url: r.url });
        });
        setCruceBoletin(prev => ({ ...(prev as CruceBoletinEstado), boletin: mBol[1], cargando: true, fuentes }));
        fetch("/api/derecho-comparado/cruce-boletin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boletin: mBol[1],
            titulo: proyectoCruce.titulo,
            iniciativa: proyectoCruce.iniciativa,
            autores: proyectoCruce.autores,
            resumen: proyectoCruce.resumen,
            fichaTecnica: proyectoCruce.fichaTecnica,
            fuentes: fuentes.map(f => ({ ...f, descripcion: resultados.find(r => r.titulo === f.titulo && r.pais === f.pais)?.descripcion })),
          }),
        })
          .then(r => r.json())
          .then(resultado => { if (vigente()) setCruceBoletin(prev => ({ ...(prev as CruceBoletinEstado), cargando: false, fuentes, resultado })); })
          .catch(() => { if (vigente()) setCruceBoletin(prev => ({ ...(prev as CruceBoletinEstado), cargando: false, fuentes, error: "No se pudo generar el cruce. Reintenta en un minuto." })); });
      } else if (soloBoletin) {
        setCruceBoletin(prev => (prev ? { ...prev, cargando: false } : prev));
      }

      if (resultados.length > 0) {
        const md = buildInformeMarkdown(queryClean, ordenarChilePrimero(resultados), buildParrafoAutomatico(queryClean, resultados));
        setInformeLiveMarkdown(md);
        setInformeLiveQuery(queryClean);
      } else {
        setInformeLiveMarkdown(null);
        setInformeLiveQuery("");
      }
    } catch (err) {
      if (!vigente()) return;
      setCruceBoletin(prev => (prev ? { ...prev, cargando: false, error: prev.error || "No fue posible consultar las normas de otros países para cruzar con el boletín." } : prev));
      // No se sabe qué fuentes fallaron: solo se informa que la búsqueda no se completó (no se listan fuentes supuestas).
      setSearchError(`La búsqueda no se pudo completar (${(err as Error)?.message || "sin conexión con el servidor"}). No se muestran resultados parciales.`);
      setLiveResultados([]);
      setInformeLiveMarkdown(null);
      setInformeLiveQuery("");
    } finally {
      if (vigente()) setLiveLoading(false);
    }
  };

  useEffect(() => {
    if (!liveLoading) return;
    setSegundosBusqueda(0);
    const t = setInterval(() => setSegundosBusqueda((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [liveLoading]);

  // Si se llega a esta vista con una materia ya definida (ej. desde el banner
  // "¿Cómo regulan esta materia otros 27 países?" de un proyecto de ley),
  // dispara la búsqueda automáticamente en vez de dejar al usuario con la
  // pantalla vacía teniendo que volver a escribir la misma materia.
  useEffect(() => {
    if (!initialQuery || !initialQuery.trim()) return;
    setSearchTerm(initialQuery);
    handleBuscarRegulacion(initialQuery);
    // Solo debe dispararse una vez al llegar con una materia inicial, no cada
    // vez que cambie handleBuscarRegulacion (se recrea en cada render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Si el usuario deselecciona todas las normativas mientras está en "Informe
  // Técnico BCN" o "Comparador Lado a Lado" (pestañas que solo existen con
  // selección activa), lo devuelve a "Búsqueda en Vivo" en vez de dejarlo en
  // una pestaña cuyo botón ya no está visible.
  useEffect(() => {
    if (seleccionComparar.length === 0 && (activeTab === "documento" || activeTab === "comparador")) {
      setActiveTab("live");
    }
  }, [seleccionComparar, activeTab]);

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
        const oa = a.origen === "oficial" ? 1 : 0, ob = b.origen === "oficial" ? 1 : 0;
        if (oa !== ob) return ob - oa;
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
    // OJO: no cambiar activeTab acá -- handleComparar se usa como helper
    // desde handleGenerarAnalisisComparado y handleCompararYGenerarInforme,
    // cada uno con su propio destino de pestaña.
    try {
      const entradas = await Promise.all(
        seleccionComparar.map(async (r) => {
          try {
            const res = await fetch("/api/derecho-comparado/analizar", {
              signal: AbortSignal.timeout(100000),
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
      const detalleActualizado = Object.fromEntries(entradas) as Record<string, LeySeleccionada>;
      setComparacionDetalle(detalleActualizado);
      // Se espera a que termine la lectura jurídica + matriz temática antes
      // de soltar "comparando" -- antes esto corría en paralelo sin esperar,
      // así que la pestaña Matriz mostraba de inmediato las filas de
      // respaldo genéricas (Objeto/Disposición) y recién después, sin aviso,
      // se reemplazaban por las dimensiones reales. Ahora el usuario ve el
      // estado de carga hasta que la matriz está lista con la información
      // definitiva, en vez de un resultado a medias que cambia solo.
      await handleGenerarLecturasMatriz(seleccionComparar, detalleActualizado);
      return detalleActualizado;
    } finally {
      setComparando(false);
    }
  };

  // Lectura jurídica real (no genérica) al pie de las filas "Objeto y
  // ámbito" y "Disposición destacada" de la Matriz, y las dimensiones
  // jurídicas temáticas reales -- se espera a que ambas terminen (ver nota
  // en handleComparar) antes de mostrar la matriz como lista.
  const handleGenerarLecturasMatriz = async (seleccion: ResultadoComparado[], detalle: Record<string, LeySeleccionada>) => {
    if (seleccion.length < 2) return;
    const key = seleccion.map(claveResultado).sort().join("||");
    const items = seleccion.map((r) => ({
      pais: r.pais,
      descripcion: r.descripcion,
      puntos: detalle[claveResultado(r)]?.puntos || []
    }));
    try {
      const res = await fetch("/api/derecho-comparado/lectura-matriz", {
        signal: AbortSignal.timeout(100000),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: liveQuery, items })
      });
      if (res.ok) {
        const data: { lecturaObjeto?: string; lecturaDisposiciones?: string } = await res.json();
        setLecturasMatriz(data);
        setLecturasMatrizKey(key);
      }
    } catch {
      // si falla, la matriz se queda con las lecturas genéricas por defecto
    }

    try {
      const resTematica = await fetch("/api/derecho-comparado/matriz-tematica", {
        signal: AbortSignal.timeout(100000),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: liveQuery, items: seleccion.map((r) => ({ pais: r.pais, titulo: r.titulo, descripcion: r.descripcion, puntos: detalle[claveResultado(r)]?.puntos || [] })) })
      });
      if (resTematica.ok) {
        const dataTematica: { dimensiones?: Array<{ dimension: string; valores: Record<string, string>; lecturaJuridica: string }> } = await resTematica.json();
        if (dataTematica.dimensiones && dataTematica.dimensiones.length > 0) {
          setMatrizTematica(dataTematica.dimensiones);
          matrizTematicaRef.current = dataTematica.dimensiones as Array<{ dimension: string; valores: Record<string, string>; lecturaJuridica: string }>;
          setMatrizTematicaKey(key);
        }
      }
    } catch {
      // si falla, la matriz se queda con las filas de respaldo (Objeto/Disposiciones)
    }
  };

  // Combina en un solo clic lo que antes eran tres pasos separados: extraer
  // los puntos reales de cada norma seleccionada (handleComparar), generar
  // el análisis comparativo real en prosa a partir de esos puntos
  // (sintetizar-comparacion) y recién entonces armar el Informe Técnico --
  // antes este botón solo hacía el primer paso y el documento resultante
  // salía sin el análisis redactado en prosa (estilo de los ejemplos BCN
  // reales que se usaron de referencia), solo con la tabla de puntos crudos.
  const handleCompararYGenerarInforme = async () => {
    if (seleccionComparar.length < 2) return;
    setGenerandoTodo(true);
    matrizTematicaRef.current = [];
    setEtapaInforme("Analizando las normas y construyendo la matriz...");
    try {
      const detalleActualizado = await handleComparar();
      const detalleFinal = detalleActualizado || comparacionDetalle;
      const base = ordenarChilePrimero(seleccionComparar);

      const items = base.map((r) => ({
        pais: r.pais,
        titulo: r.titulo,
        puntos: detalleFinal[claveResultado(r)]?.puntos || []
      })).filter((it) => it.puntos.length > 0);

      const generarAnalisisYRedaccion = async () => {
        // Informe Técnico por secciones (una llamada de IA por país, más
        // introducción y conclusiones): un solo llamado para todo el informe
        // topaba el límite de tokens de salida de los modelos gratuitos y salía
        // corto y genérico. Es secuencial para no saturar la cuota por minuto.
        const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const pedirSeccion = async (payload: Record<string, unknown>): Promise<string | null> => {
          for (let intento = 1; intento <= 2; intento++) {
            if (intento === 2) await dormir(15000);
            try {
              const res = await fetch("/api/derecho-comparado/informe-seccion", {
                signal: AbortSignal.timeout(100000),
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: liveQuery, ...payload })
              });
              if (res.ok) {
                const data: { texto: string | null } = await res.json();
                if (data.texto) return data.texto;
              }
            } catch {
              // se reintenta una vez; si vuelve a fallar la sección queda con su aviso honesto
            }
          }
          return null;
        };

        const itemsCompletos = base.map((r) => ({
          pais: r.pais,
          titulo: r.titulo,
          descripcion: r.descripcion,
          puntos: detalleFinal[claveResultado(r)]?.puntos || []
        }));
        const dimensiones = matrizTematicaRef.current;

        const secciones: Array<{ pais: string; titulo: string; texto: string | null }> = [];
        for (let i = 0; i < itemsCompletos.length; i++) {
          const it = itemsCompletos[i];
          setEtapaInforme(`Redactando informe: ${it.pais} (${i + 1} de ${itemsCompletos.length})...`);
          const matrizPais = dimensiones
            .map((d) => ({ dimension: d.dimension, valor: d.valores[it.pais] || "" }))
            .filter((m) => m.valor);
          const texto = await pedirSeccion({ tipo: "pais", item: it, matrizPais });
          secciones.push({ pais: it.pais, titulo: it.titulo, texto });
        }

        setEtapaInforme("Redactando introducción...");
        const introduccion = await pedirSeccion({ tipo: "introduccion", items: itemsCompletos });

        const previas = secciones.filter((s) => s.texto).map((s) => ({ pais: s.pais, texto: s.texto as string }));
        let conclusiones: string | null = null;
        if (previas.length >= 2) {
          setEtapaInforme("Redactando conclusiones...");
          conclusiones = await pedirSeccion({ tipo: "conclusiones", seccionesPrevias: previas });
        }

        let cuerpoCompletoIA: string | undefined;
        if (previas.length > 0) {
          const NOTA = "*No fue posible redactar esta sección con IA en este momento (límite de capacidad de los modelos). Las disposiciones extraídas de la norma están disponibles en la Matriz Comparada.*";
          const tituloCorto = (t: string) => {
            const l = t.replace(/\s+/g, " ").trim();
            return l.length > 90 ? l.slice(0, 87).trimEnd() + "…" : l;
          };
          cuerpoCompletoIA = [
            "## Resumen e Introducción",
            introduccion || NOTA,
            ...secciones.flatMap((s) => [`## ${s.pais} — ${tituloCorto(s.titulo)}`, s.texto || NOTA]),
            "## Conclusiones y Análisis Comparado",
            conclusiones || NOTA
          ].join("\n\n");
        }

        const md = buildInformeMarkdown(liveQuery, base, buildParrafoAutomatico(liveQuery, base), undefined, detalleFinal, undefined, cuerpoCompletoIA);
        setInformeLiveMarkdown(md);
        setInformeLiveQuery(liveQuery);
      };

      // Al seleccionar países y pedir la comparación, se genera Matriz e
      // Informe de una vez. Cada etapa falla de forma aislada (timeout/red):
      // una etapa colgada no debe dejar el botón en "Generando...".
      await generarAnalisisYRedaccion().catch(() => {});

      // El Informe Técnico queda listo para cuando el usuario abra esa
      // pestaña, pero lo primero que debe VER al comparar es la Matriz.
      setActiveTab("comparador");
    } finally {
      setGenerandoTodo(false);
      setEtapaInforme("");
    }
  };

  // Genera el análisis comparativo real (prosa) entre las normas
  // seleccionadas, a partir de los puntos ya extraídos de su texto real
  // (comparacionDetalle) -- si aún no se extrajeron (usuario no apretó
  // "Comparar en tabla lado a lado" primero), los extrae antes.
  const handleGenerarAnalisisComparado = async () => {
    if (seleccionComparar.length < 2) return;
    const key = seleccionComparar.map(claveResultado).sort().join("||");
    setAnalisisComparadoLoading(true);
    setAnalisisComparadoIA(null);
    try {
      let detalleActual = comparacionDetalle;
      const faltaAnalisis = seleccionComparar.some((r) => !detalleActual[claveResultado(r)]?.disponible);
      if (faltaAnalisis) {
        detalleActual = (await handleComparar()) || detalleActual;
      }

      const items = seleccionComparar.map((r) => ({
        pais: r.pais,
        titulo: r.titulo,
        puntos: detalleActual[claveResultado(r)]?.puntos || []
      })).filter((it) => it.puntos.length > 0);

      if (items.length < 2) {
        setAnalisisComparadoIA("No fue posible extraer suficientes puntos reales de las normas seleccionadas para compararlas. Prueba con otras normas que tengan enlace a su fuente oficial.");
        setAnalisisComparadoKey(key);
        return;
      }

      const res = await fetch("/api/derecho-comparado/sintetizar-comparacion", {
        signal: AbortSignal.timeout(100000),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: liveQuery, items })
      });
      const data: { analisis: string } = await res.json();
      setAnalisisComparadoIA(data.analisis);
      setAnalisisComparadoKey(key);
    } catch {
      setAnalisisComparadoIA("No fue posible generar el análisis comparativo en este momento.");
      setAnalisisComparadoKey(key);
    } finally {
      setAnalisisComparadoLoading(false);
    }
  };


  const handleSeleccionarResultado = async (r: ResultadoComparado) => {
    setLeySeleccionada(null);
    setAnalizandoUrl(r.url || r.titulo);
    setModalNorma(r);
    try {
      const res = await fetch("/api/derecho-comparado/analizar", {
        signal: AbortSignal.timeout(100000),
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
    const boletinVinculado = detectarBoletinChile(aGuardar) || undefined;
    const newReport: CustomReport = {
      id: `dc_${Date.now()}`,
      query: liveQuery,
      fecha: new Date().toLocaleDateString("es-CL", { day: '2-digit', month: '2-digit', year: 'numeric' }),
      resultados: aGuardar,
      fuentesConsultadas: liveFuentesConsultadas,
      fuentesFallidas: liveFuentesFallidas,
      parrafoAuto: buildParrafoAutomatico(liveQuery, aGuardar),
      leySeleccionada: leySeleccionada || undefined,
      normasComparadas: aGuardar,
      boletinVinculado,
      compartidoEquipo: true
    };
    setSavedReports((prev) => [newReport, ...prev]);
    saveInformeComparadoToFirestore({
      id: newReport.id!,
      query: newReport.query,
      fecha: newReport.fecha,
      resultados: newReport.resultados,
      fuentesConsultadas: newReport.fuentesConsultadas,
      fuentesFallidas: newReport.fuentesFallidas,
      parrafoAuto: newReport.parrafoAuto,
      boletinVinculado,
      createdAt: new Date().toISOString()
    }).catch((err) => console.warn("Could not sync informe comparado to Firestore:", err));
    setActiveTab("guardados");
    setSuccessMessage(
      boletinVinculado
        ? `Informe oficial tipo BCN generado, guardado y vinculado al Boletín N° ${boletinVinculado}.`
        : "Informe oficial tipo BCN generado y guardado para todo el equipo."
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRedactarIA = async (idx: number) => {
    const rep = savedReports[idx];
    if (!rep || rep.resultados.length === 0) return;
    setRedactingIdx(idx);
    try {
      const res = await fetch("/api/derecho-comparado/redactar", {
        signal: AbortSignal.timeout(100000),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: rep.query, resultados: rep.resultados }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { texto: string; marcoConceptual?: string } = await res.json();
      setSavedReports((prev) => prev.map((r, i) => (i === idx ? { ...r, redaccionIA: data.texto, marcoConceptual: data.marcoConceptual } : r)));
    } catch (err) {
      setSearchError("No fue posible generar la redacción con IA en este momento.");
    } finally {
      setRedactingIdx(null);
    }
  };

  return (
    <ContenidoProtegido className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-8 font-sans text-slate-800" id="legislacion-comparada-root">
      
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Derecho Comparado & Legislación Internacional
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Centro unificado de análisis comparativo y búsqueda legislativa en tiempo real. Contraste proyectos de ley chilenos con estándares normativos de la OCDE, la Unión Europea e Iberoamérica.
          </p>
        </div>
        <div className="z-10 shrink-0 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
            <span className="block text-xl font-black text-white font-mono">{liveResultados.length}</span>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Normas en esta búsqueda</span>
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
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Consultando Chile y {N_JURISDICCIONES_OFICIALES} fuentes oficiales extranjeras… {segundosBusqueda} s
              </span>
            ) : liveQuery ? (
              <span>Consulta activa: <strong className="text-slate-900">"{liveQuery}"</strong> ({liveResultados.length} resultados)</span>
            ) : (
              <span>LeyChile y {N_JURISDICCIONES_OFICIALES} fuentes oficiales extranjeras; el resto, propuestas de IA con enlace verificado</span>
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
                if (e.key === 'Enter' && searchTerm.trim() && !liveLoading) {
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
                <span>Buscando… {segundosBusqueda} s</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Buscar en fuentes oficiales</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Topics & Suggestions (plegable para no ocupar espacio de forma permanente) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setMateriasDestacadasAbiertas(v => !v)}
            className="flex items-center gap-1 mr-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 w-fit"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Materias destacadas</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${materiasDestacadasAbiertas ? "rotate-180" : ""}`} />
          </button>
          {materiasDestacadasAbiertas && (
            <div className="flex flex-wrap items-center gap-2 animate-fade-in">
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
          )}

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
                    if (liveLoading) return;
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

      {/* Navigation Sub-tabs structured like BCN report sections -- antes de
          la primera búsqueda no tiene sentido mostrar pestañas ni paneles
          vacíos ("0 resultados", filtros sin nada que filtrar, etc.). Solo se
          deja siempre accesible "Informes Guardados", que no depende de que
          haya una consulta activa. */}
      {!liveQuery && activeTab !== "guardados" ? (
        <div className="flex items-center justify-end border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("guardados")}
            className="text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            <Bookmark className="w-4 h-4" />
            <span>Informes Guardados ({savedReports.length})</span>
          </button>
        </div>
      ) : (
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

        {/* "Informe Técnico BCN" y "Comparador Lado a Lado" son el paso
            siguiente a la búsqueda, no algo que tenga sentido abrir antes de
            elegir qué países comparar -- por eso solo aparecen una vez que el
            usuario marcó al menos una normativa con el checkbox "Comparar" en
            los resultados de "Búsqueda en Vivo". */}
        {seleccionComparar.length > 0 && (
        <>
        <button
          onClick={() => setActiveTab("documento")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "documento" 
              ? "bg-blue-700 text-white shadow-xs" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>
            Informe Técnico{informeLiveMarkdown && informeLiveQuery === liveQuery ? ` (${liveQuery.slice(0, 35)}...)` : ""}
          </span>
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
          <span>Matriz ({seleccionComparar.length})</span>
        </button>
        </>
        )}

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
      )}

      {/* TAB 1: BÚSQUEDA EN VIVO INTERNACIONAL */}
      {liveQuery && activeTab === "live" && (
        <div className="flex flex-col gap-6 animate-fade-in">

          {cruceBoletin && <CruceBoletinPanel cruce={cruceBoletin} />}

          {/* Aviso honesto: cuando el motor de IA no pudo responder (saturado,
              rate-limited, o clave invalida), la busqueda cae a una base de
              conocimiento de referencia generica en vez de fallar por completo
              -- pero eso NO es lo mismo que un resultado verificado por IA en
              vivo, y no debe presentarse como si lo fuera. */}
          {!liveLoading && searchError && (
            <div className="bg-red-50 border border-red-300 text-red-900 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">No se pudo completar la búsqueda</p>
                <p className="mt-0.5">{searchError}</p>
              </div>
              <button onClick={() => handleBuscarRegulacion(liveQuery)} className="shrink-0 bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer">Reintentar</button>
            </div>
          )}

          {!liveLoading && liveEstadoFuentes.length > 0 && (() => {
            const conResultados = liveEstadoFuentes.filter(e => e.estado === "ok");
            const sinResultados = liveEstadoFuentes.filter(e => e.estado === "sin_resultados");
            const caidas = liveEstadoFuentes.filter(e => e.estado === "no_disponible");
            const fila = (e: EstadoFuenteUI, i: number) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                <span className={e.estado === "ok" ? "text-emerald-700 font-bold" : e.estado === "sin_resultados" ? "text-slate-500 font-bold" : "text-red-700 font-bold"}>
                  {e.estado === "ok" ? "✓ con resultados" : e.estado === "sin_resultados" ? "○ sin resultados" : "✗ no disponible"}
                </span>
                <span className="font-semibold text-slate-800">{BANDERA_PAIS[e.jurisdiccion] || ""} {e.jurisdiccion}</span>
                <span className="text-slate-500">{e.fuente}</span>
                {e.motivo && e.estado !== "ok" && <span className="text-slate-500 italic">— {e.motivo}</span>}
                {e.consultaUsada && <span className="text-slate-400">· búsqueda: {e.consultaUsada}</span>}
              </li>
            );
            return (
              <div className="border border-slate-200 rounded-xl bg-white px-4 py-3 text-xs flex flex-col gap-2" id="estado-fuentes-oficiales">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] font-mono mr-1">Fuentes oficiales consultadas: {liveEstadoFuentes.length}</p>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">{conResultados.length} con resultados</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 font-bold">{sinResultados.length} sin resultados</span>
                  <span className={`px-2 py-0.5 rounded-full border font-bold ${caidas.length ? "bg-red-50 text-red-800 border-red-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>{caidas.length} no disponibles</span>
                </div>
                {caidas.length > 0 && (
                  <details className="text-slate-700">
                    <summary className="cursor-pointer font-semibold text-red-800">Ver las {caidas.length} fuente(s) que no respondieron (sus países no aparecen en los resultados)</summary>
                    <ul className="mt-1 flex flex-col gap-1">{caidas.map(fila)}</ul>
                  </details>
                )}
                <details className="text-slate-700">
                  <summary className="cursor-pointer font-semibold text-slate-700">Ver el detalle de cada fuente y la búsqueda que se usó</summary>
                  <ul className="mt-1 flex flex-col gap-1">{[...conResultados, ...sinResultados].map(fila)}</ul>
                </details>
                <p className="text-slate-500">
                  Las demás jurisdicciones no se consultan en fuentes oficiales: sus normas son propuestas por IA y solo se muestran si el enlace fue visitado y responde.
                </p>
                {liveDescartadas.length > 0 && (
                  <details className="text-slate-600">
                    <summary className="cursor-pointer font-semibold text-amber-800">
                      {liveDescartadas.length} propuesta(s) de IA excluida(s) por enlace roto, ausente o de portada
                    </summary>
                    <ul className="mt-1 ml-4 list-disc space-y-0.5">
                      {liveDescartadas.map((d, i) => (
                        <li key={i}><span className="font-semibold">{d.pais}</span>: {d.titulo} — {d.motivo}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })()}

          {!liveLoading && !searchError && liveFuentesFallidas.some(f => /motor de ia/i.test(f)) && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">El motor de IA no respondió en esta búsqueda</p>
                <p className="text-amber-800/90 mt-0.5">
                  Solo se muestran las normas de Chile y de las fuentes oficiales. Los países sin fuente oficial conectada no aparecen esta vez; puede reintentar en unos minutos.
                </p>
              </div>
            </div>
          )}

          {/* Diagnóstico técnico: qué proveedor de IA respondió (o por qué falló)
              en esta búsqueda -- antes solo se podía ver llamando a la API directo. */}
          {!liveLoading && liveAiDiagnostics.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setDiagnosticoAbierto(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Diagnóstico técnico IA ({liveAiDiagnostics.length} intento{liveAiDiagnostics.length === 1 ? "" : "s"})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${diagnosticoAbierto ? "rotate-180" : ""}`} />
              </button>
              {diagnosticoAbierto && (
                <div className="px-4 py-3 bg-white flex flex-col gap-1.5">
                  {liveAiDiagnostics.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] font-mono">
                      {a.error ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <span>
                        <strong className="text-slate-800">{a.provider}</strong>
                        {!a.configured && <span className="text-slate-400"> (no configurado)</span>}
                        {a.error ? <span className="text-rose-700"> — {a.error}</span> : !a.error && a.configured ? <span className="text-emerald-700"> — respondió correctamente</span> : null}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary bar -- antes se renderizaba de inmediato apenas se
              fijaba "liveQuery" (sincrónico, al tipear/hacer clic), mostrando
              "0 países · 0 normativas" con los resultados vacíos/obsoletos
              de la búsqueda anterior MIENTRAS el fetch real todavía estaba en
              curso -- no era un error real, pero parecía que la búsqueda
              hubiera fallado al instante. Ahora muestra un estado de carga
              explícito en vez del resumen de "0 resultados". */}
          {liveLoading ? (
            <div className="bg-slate-50 border-l-4 border-blue-700 p-5 rounded-r-2xl border border-slate-200 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-blue-700 animate-spin shrink-0" />
              <span className="text-xs text-slate-600 font-bold">Buscando "{liveQuery}" en LeyChile y {N_JURISDICCIONES_OFICIALES} fuentes oficiales extranjeras… {segundosBusqueda} s</span>
            </div>
          ) : (
            <div className="bg-slate-50 border-l-4 border-blue-700 p-5 rounded-r-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Materia: {liveQuery}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {paisesDisponibles.length} países con resultados · {liveResultados.filter(r => r.origen === "oficial").length} de fuente oficial · {liveResultados.filter(r => r.origen !== "oficial").length} propuestas de IA
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
          )}

          {/* Filter & Sorting Controls (solo cuando hay algo que filtrar) */}
          {!liveLoading && liveResultados.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            
            {/* Top row filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-blue-700" /> Región:
                </span>
                {["Todos", "Chile", "Europa", "América", "Asia-Pacífico", "Iberoamérica", "Unión Europea", "OCDE / Global"].map((region) => (
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
                  <option value="relevancia">Chile y fuentes oficiales primero</option>
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
              {["Todos", ...tiposDisponibles].map((tipo) => (
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
          )}

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
                  onClick={handleCompararYGenerarInforme}
                  disabled={seleccionComparar.length < 2 || generandoTodo}
                  title="Genera de una vez la Matriz comparada y el Informe Técnico"
                  className="bg-white hover:bg-blue-50 text-blue-900 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
                  <span>{generandoTodo ? (etapaInforme || "Generando Matriz e Informe...") : "Comparar y Generar Todo"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading or Results Grid */}
          {liveLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-4 text-center">
              <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-900">Consultando las fuentes oficiales en paralelo… {segundosBusqueda} s</h3>
                <p className="text-xs text-slate-500 max-w-xl">
                  LeyChile y {N_JURISDICCIONES_OFICIALES} fuentes oficiales extranjeras (Unión Europea, España, Reino Unido, Alemania, Francia, Brasil, Japón y otras).
                  La primera búsqueda del día puede tardar hasta un minuto, porque algunas fuentes se descargan completas; las siguientes son más rápidas.
                </p>
              </div>
            </div>
          ) : !liveQuery ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <Search className="w-8 h-8 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">Ingrese un concepto para iniciar la búsqueda</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Escriba una materia, ley internacional o número de boletín (ej. hidrógeno verde, neuroderechos, teletrabajo, ciberseguridad) y presione Enter o el botón de búsqueda.
              </p>
            </div>
          ) : searchError ? null : liveResultados.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">Ninguna fuente devolvió normas para "{liveQuery}"</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Pruebe con un término más corto o más general (por ejemplo "protección de datos" en vez de una frase larga).
                Las fuentes extranjeras buscan la palabra traducida en el título de la norma. Arriba puede revisar qué respondió cada fuente.
              </p>
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

                return (
                  <div
                    key={`${claveResultado(r)}__${i}`}
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
                            {r.origen && (
                              <span
                                className={`self-start mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${r.origen === "oficial" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}
                                title={r.origen === "oficial" ? `Obtenida de la API oficial${r.idOficial ? ` · ${r.idOficial}` : ""}${r.consultadoEl ? ` · consultada ${new Date(r.consultadoEl).toLocaleString("es-CL")}` : ""}` : r.verificacionEnlace && r.verificacionEnlace !== "ok" ? "Propuesta por IA; el sitio bloquea la comprobación automática del enlace" : "Propuesta por IA: el enlace respondió, pero el contenido no fue contrastado"}
                              >
                                {r.origen === "oficial" ? "Fuente oficial" : r.verificacionEnlace && r.verificacionEnlace !== "ok" ? "IA · enlace no verificable" : "IA · enlace verificado"}
                              </span>
                            )}
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
                            <span>{r.origen === "oficial" ? "Fuente oficial" : "Abrir enlace"}</span>
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

          {/* CTA: abrir el Informe Técnico ya generado automáticamente con
              todos los resultados. Solo tiene sentido cuando no hay países
              marcados -- si ya seleccionaste países, el botón "Comparar y
              Generar Informe" de la barra de arriba hace justo esto mismo
              (y con más contexto), así que mostrar los dos era redundante. */}
          {!liveLoading && liveResultadosFiltrados.length > 0 && seleccionComparar.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-blue-900">Informe Técnico de este tema</h4>
                  <p className="text-[11px] text-blue-800/80 mt-0.5 max-w-lg">
                    Marca los países que te interesan (casilla junto a cada resultado) para un informe acotado, o ábrelo directo con los {liveResultadosFiltrados.length} resultados encontrados para &quot;{liveQuery}&quot;.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const md = buildInformeMarkdown(liveQuery, ordenarChilePrimero(liveResultadosFiltrados), buildParrafoAutomatico(liveQuery, liveResultadosFiltrados), undefined, comparacionDetalle);
                  setInformeLiveMarkdown(md);
                  setInformeLiveQuery(liveQuery);
                  setActiveTab("documento");
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-xs flex items-center gap-2 shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Abrir Informe Técnico</span>
              </button>
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
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Informe Técnico BCN generado EN VIVO a partir de la búsqueda real. Solo se muestra
              si corresponde a la consulta actualmente activa. */}
          {informeLiveMarkdown && informeLiveQuery === liveQuery && (
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden">
              <div className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between text-xs font-mono font-bold tracking-wider">
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> INFORME TÉCNICO — GENERADO EN VIVO PARA &quot;{liveQuery.toUpperCase()}&quot;</span>
                <button onClick={() => setInformeLiveMarkdown(null)} className="hover:text-blue-200 cursor-pointer" title="Cerrar">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Vínculo directo al Boletín de ley chileno relacionado (si se
                  detectó uno entre los resultados) y acceso rápido para
                  guardarlo como informe compartido del equipo. */}
              {(() => {
                const boletin = detectarBoletinChile(liveResultados);
                return (
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center gap-2">
                    {boletin ? (
                      setSelectedProyectoId ? (
                        <button
                          onClick={() => setSelectedProyectoId(boletin)}
                          className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 hover:bg-indigo-100 cursor-pointer"
                        >
                          <BookMarked className="w-3 h-3" /> Ver Boletín N° {boletin} vinculado
                        </button>
                      ) : (
                        <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <BookMarked className="w-3 h-3" /> Detectado: Boletín N° {boletin}
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">No se detectó un Boletín chileno en los resultados de esta búsqueda.</span>
                    )}
                    <button
                      onClick={handleGuardarInformeBCN}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Guardar como informe del equipo
                    </button>
                  </div>
                );
              })()}

              <div className="p-6 md:p-10 lg:p-12 flex flex-col gap-1 bg-white">
                {renderInformeMarkdown(informeLiveMarkdown)}
              </div>
            </div>
          )}

        {!(informeLiveMarkdown && informeLiveQuery === liveQuery) && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Aún no hay un informe para esta consulta. Busque una materia y genere el informe técnico: se redacta solo con las normas
            obtenidas de las fuentes consultadas.
          </div>
        )}
        </div>
      )}

      {/* TAB 4: COMPARADOR MULTIPAÍS LADO A LADO (vista de matriz dinámica real y fichas lado a lado,
          siempre a partir de las normas buscadas y seleccionadas). */}
      {activeTab === "comparador" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-700" />
                Matriz Comparada de Normativa Internacional
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

          {/* Análisis comparativo REAL a partir del texto de cada norma
              seleccionada (no solo del título) -- reemplaza el vacío que
              dejaban las fichas genéricas por país cuando el usuario quería
              una comparación de fondo, no solo la matriz de datos. */}
          {seleccionComparar.length >= 2 && (
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Análisis Comparado Real (a partir del texto de cada norma)
                </span>
                <button
                  onClick={handleGenerarAnalisisComparado}
                  disabled={analisisComparadoLoading || comparando}
                  className="bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {analisisComparadoLoading || comparando ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analizando texto real...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> {analisisComparadoIA ? "Regenerar Análisis" : "Generar Análisis Comparado"}</>
                  )}
                </button>
              </div>
              {analisisComparadoIA && analisisComparadoKey === seleccionComparar.map(claveResultado).sort().join("||") ? (
                <p className="text-xs text-indigo-950 leading-relaxed">{analisisComparadoIA}</p>
              ) : (
                <p className="text-[11px] text-indigo-800/70">
                  Extrae el texto real de cada norma seleccionada (LeyChile y las demás fuentes oficiales) y le pide a la IA que las compare de verdad -- no solo un resumen del título de cada una.
                </p>
              )}
            </div>
          )}

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
            comparando ? (
              <div className="p-14 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-7 h-7 text-blue-700 animate-spin" />
                <h4 className="text-sm font-bold text-slate-800">Construyendo la matriz comparada...</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Extrayendo el texto real de cada norma y generando las dimensiones jurídicas propias de esta materia -- puede tardar unos segundos para mostrar la matriz completa de una vez.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <MatrizComparadaTable data={generarMatrizDinamica(
                  liveQuery,
                  seleccionComparar,
                  comparacionDetalle,
                  lecturasMatrizKey === seleccionComparar.map(claveResultado).sort().join("||") ? lecturasMatriz : undefined,
                  matrizTematicaKey === seleccionComparar.map(claveResultado).sort().join("||") ? matrizTematica : undefined
                )} />
              </div>
            )
          ) : (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {ordenarChilePrimero(seleccionComparar).map((r) => {
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

      {/* TAB 5: INFORMES GUARDADOS */}
      {activeTab === "guardados" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-blue-700" /> Informes y Minutas Guardadas ({savedReports.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {cargandoCompartidos ? "Sincronizando informes del equipo…" : "Compartidos con todo el equipo (Firestore) para uso en comisiones parlamentarias"}
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
                <div key={rep.id || idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-100">
                        {rep.fecha}
                      </span>
                      {rep.compartidoEquipo && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
                          <Share2 className="w-3 h-3" /> Compartido con el equipo
                        </span>
                      )}
                      {rep.boletinVinculado && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-full flex items-center gap-1">
                          <BookMarked className="w-3 h-3" /> Boletín N° {rep.boletinVinculado}
                        </span>
                      )}
                    </div>
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
                      marcoConceptual={rep.marcoConceptual}
                      onNotify={(msg) => {
                        setSuccessMessage(msg);
                        setTimeout(() => setSuccessMessage(null), 3500);
                      }}
                      label="Descargar Minuta:"
                    />
                  </div>

                  {rep.marcoConceptual && (
                    <div className="text-xs text-slate-700 leading-relaxed bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                      <span className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                        Marco Conceptual
                      </span>
                      {rep.marcoConceptual}
                    </div>
                  )}

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

    </ContenidoProtegido>
  );
}
