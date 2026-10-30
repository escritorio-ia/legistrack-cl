/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Proyecto, ActivityItem, VotacionItem } from "../types";
import { formatBulletinNumber, MATERIA_COMISION_MAP } from "./proyectosResolver";

function cleanDigits(id: string): string {
  const base = id.split("-")[0];
  return base.replace(/[^0-9]/g, "");
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractAll(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const results: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1]);
  }
  return results;
}

function parseFechaChilena(fecha: string): string {
  const m = fecha.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return fecha.trim();
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function parseSenateXmlToProyecto(xml: string, originalQuery: string): Proyecto | null {
  try {
    const boletin = extractTag(xml, "boletin") || originalQuery;
    const descBlock = extractTag(xml, "descripcion");
    if (!descBlock && !xml.includes("<proyecto>")) return null;

    const rawTitulo = extractTag(descBlock || xml, "titulo") || extractTag(descBlock || xml, "nombre");
    if (!rawTitulo) return null;

    const titulo = rawTitulo.replace(/\s+/g, " ").trim();
    const fechaIngresoRaw = extractTag(descBlock, "fecha_ingreso");
    const fechaIngreso = fechaIngresoRaw ? parseFechaChilena(fechaIngresoRaw) : "";
    const rawIniciativa = extractTag(descBlock, "iniciativa") || "Moción";
    const iniciativa: "Moción" | "Mensaje" = rawIniciativa.toLowerCase().includes("mensaje") ? "Mensaje" : "Moción";
    const rawCamara = extractTag(descBlock, "camara_origen") || "Diputados";
    const camaraOrigen: "Diputados" | "Senado" = rawCamara.toLowerCase().includes("senado") ? "Senado" : "Diputados";
    const urgenciaRaw = extractTag(descBlock, "urgencia_actual");
    
    let urgencia: "Discusión Inmediata" | "Suma" | "Simple" | "Sin urgencia" = "Sin urgencia";
    const uLower = urgenciaRaw.toLowerCase();
    if (uLower.includes("inmediata")) urgencia = "Discusión Inmediata";
    else if (uLower.includes("suma")) urgencia = "Suma";
    else if (uLower.includes("simple")) urgencia = "Simple";

    const etapa = extractTag(descBlock, "etapa") || "En discusión";
    const subetapa = extractTag(descBlock, "subetapa") || "";
    const estado = extractTag(descBlock, "estado") || "En tramitación";
    const digits = cleanDigits(boletin);
    const linkMocion = extractTag(descBlock, "link_mensaje_mocion") || `https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=${digits}`;

    const autoresBlock = extractTag(xml, "autores");
    const autoresList = extractAll(autoresBlock, "autor").map(a => extractTag(a, "PARLAMENTARIO")).filter(Boolean);
    const autores = autoresList.length > 0 ? autoresList.join(", ") : (iniciativa.toLowerCase().includes("mensaje") ? "Presidente de la República" : "No informado en la ficha oficial");
    const patrocinantes = autoresList.length;

    const { formatted, suffix } = formatBulletinNumber(boletin);
    const mapping = MATERIA_COMISION_MAP[suffix] || {
      comision: "Comisión Legislativa Oficial",
      materia: "Normativa General y Legislación Nacional"
    };

    let comisionActual = mapping.comision;
    if (subetapa) {
      const commMatch = subetapa.match(/comisión\s+de\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s\-\,y]+)/i);
      if (commMatch) {
        comisionActual = `Comisión de ${commMatch[1].trim()}`;
      }
    }

    const tramitacionBlock = extractTag(xml, "tramitacion");
    const timeline: ActivityItem[] = extractAll(tramitacionBlock, "tramite").map((t, idx) => {
      const desc = extractTag(t, "DESCRIPCIONTRAMITE");
      const dLower = desc.toLowerCase();
      let tipo: "ingreso" | "sesion" | "indicaciones" | "informe" | "acuerdo" | "alerta" = "sesion";
      if (dLower.includes("ingreso")) tipo = "ingreso";
      else if (dLower.includes("indicacion")) tipo = "indicaciones";
      else if (dLower.includes("informe")) tipo = "informe";
      else if (dLower.includes("acuerdo")) tipo = "acuerdo";

      return {
        id: `t-${digits}-${idx}`,
        fecha: extractTag(t, "FECHA"),
        titulo: extractTag(t, "ETAPDESCRIPCION") || "Trámite Legislativo",
        descripcion: desc,
        tipo,
        boletinId: formatted
      };
    });

    const documentos: any[] = [];
    if (linkMocion) {
      documentos.push({
        id: `doc-${digits}-mocion`,
        titulo: "Texto Oficial Mensaje / Moción de Ingreso",
        tipo: "Moción",
        fecha: fechaIngreso,
        url: linkMocion
      });
    }

    const informesBlock = extractTag(xml, "informes");
    if (informesBlock) {
      extractAll(informesBlock, "informe").forEach((inf, idx) => {
        // Tags reales del XML: LINK_INFORME, TRAMITE, ETAPA, FECHAINFORME (dd/mm/aaaa).
        const link = extractTag(inf, "LINK_INFORME").replace(/&amp;/g, "&");
        const tramite = extractTag(inf, "TRAMITE") || "Informe de comisión";
        const etapa = extractTag(inf, "ETAPA");
        const f = extractTag(inf, "FECHAINFORME").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        const fecha = f ? `${f[3]}-${f[2].padStart(2, "0")}-${f[1].padStart(2, "0")}` : "";
        documentos.push({
          id: `doc-${digits}-inf-${idx}`,
          titulo: `${tramite}${etapa ? ` (${etapa})` : ""}`,
          tipo: "Informe",
          fecha,
          url: link
        });
      });
    }

    const votaciones: VotacionItem[] = [];
    const votacionesBlock = extractTag(xml, "votaciones");
    if (votacionesBlock) {
      extractAll(votacionesBlock, "votacion").forEach((v, idx) => {
        const fecha = extractTag(v, "FECHA") || fechaIngreso;
        const materiaVot = extractTag(v, "MATERIA") || "Votación de articulado";
        const si = parseInt(extractTag(v, "SI")) || 0;
        const no = parseInt(extractTag(v, "NO")) || 0;
        const abst = parseInt(extractTag(v, "ABSTENCION")) || 0;
        const resultado = extractTag(v, "ETAPADESCRIPCION") || extractTag(v, "RESULTADO") || "Resultado no informado";
        votaciones.push({
          id: `v-${digits}-${idx}`,
          fecha,
          materia: materiaVot,
          si,
          no,
          abstencios: abst,
          resultado
        });
      });
    }

    const resumen = `Proyecto de ley oficial radicado el ${fechaIngreso} por vía de ${iniciativa} en ${camaraOrigen}. Materia: ${mapping.materia}. Actualmente en etapa de "${etapa}" (${estado}). Radicado en ${comisionActual}. Autores: ${autores}.`;

    return {
      id: formatted,
      titulo,
      resumen,
      estado,
      etapa,
      subetapa,
      fechaIngreso,
      materia: mapping.materia,
      autores,
      iniciativa,
      patrocinantes,
      urgencia,
      camaraOrigen,
      comisionActual,
      comisionesHistoricas: [comisionActual],
      linkCongreso: linkMocion,
      timeline,
      documentos,
      votaciones
      // quorum: la ficha XML del Senado no lo informa; no se asume "Ley Simple".
    };
  } catch (err) {
    console.error("Error parsing Senate XML:", err);
    return null;
  }
}

/**
 * Direct Live Senate Fetcher with localStorage cache & multiple fallback gateways.
 */
export async function fetchLiveSenateProject(query: string): Promise<Proyecto | null> {
  const digits = cleanDigits(query);
  if (!digits || digits.length < 3) return null;

  // v2: la versión anterior guardaba fichas sin vencimiento (y con datos supuestos);
  // se cambia la clave para descartarlas y ahora vencen a los 30 minutos.
  const cacheKey = `senado_live_proy_v3_${digits}`;
  const cacheTsKey = `${cacheKey}_ts`;
  const cached = localStorage.getItem(cacheKey);
  const cachedTs = Number(localStorage.getItem(cacheTsKey) || 0);
  if (cached && Date.now() - cachedTs < 30 * 60 * 1000) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.id) return parsed;
    } catch (e) {}
  }
  const guardar = (data: Proyecto) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheTsKey, String(Date.now()));
    } catch (e) {}
  };

  // 1. Try local Express backend API
  try {
    const res = await fetch(`/api/proyecto/${digits}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id && data.titulo && !data.titulo.includes("Asociada al Boletín") && data.estado !== "Sin información") {
        guardar(data);
        return data;
      }
    }
  } catch (e) {}

  // 2. Try official Senate OpenData directly
  const senadoUrl = `https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=${digits}`;
  
  // Direct fetch (if CORS allowed)
  try {
    const res = await fetch(senadoUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const xml = await res.text();
      const parsed = parseSenateXmlToProyecto(xml, query);
      if (parsed) {
        guardar(parsed);
        return parsed;
      }
    }
  } catch (e) {}

  // 3. Try fast CORS Gateway for static GitHub Pages
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(senadoUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const xml = await res.text();
      const parsed = parseSenateXmlToProyecto(xml, query);
      if (parsed) {
        guardar(parsed);
        return parsed;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Direct Live Senate project listing fetcher with multiple fallback gateways.
 */
export async function fetchLiveSenateProjectsList(): Promise<Proyecto[]> {
  const cacheKey = "senado_live_list_cache";
  const cached = localStorage.getItem(cacheKey);
  const cacheTimestamp = localStorage.getItem(`${cacheKey}_ts`);
  const isFresh = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp, 10) < 10 * 60 * 1000);

  if (cached && isFresh) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  // 1. Try local Express backend API
  try {
    const res = await fetch("/api/proyectos?solo_vigentes=false&limit=100", { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const list = data.resultados || (Array.isArray(data) ? data : []);
      if (list.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(list));
        localStorage.setItem(`${cacheKey}_ts`, Date.now().toString());
        return list;
      }
    }
  } catch (e) {}

  return [];
}
