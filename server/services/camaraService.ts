import { 
  DIPUTADOS_COMISIONES_DETALLE, 
  SENADO_COMISIONES_DETALLE,
  CAMARA_CITACIONES_SEMANALES_POR_DIA,
  CAMARA_CITACIONES_POR_COMISION,
  CAMARA_CITACIONES_FULL_WEEK
} from "../../src/data/comisionesData";
import { cache } from "./cacheService";

export interface ComisionReal {
  id: string;
  nombre: string;
  descripcion: string;
  senado: boolean;
}

export const SENADO_COMISIONES_REALES: ComisionReal[] = SENADO_COMISIONES_DETALLE.map(c => ({
  id: `${c.prefix}${c.id}`,
  nombre: c.nombre,
  descripcion: c.descripcion,
  senado: true
}));

export const DIPUTADOS_COMISIONES_REALES: ComisionReal[] = DIPUTADOS_COMISIONES_DETALLE.map(c => ({
  id: `${c.prefix}${c.id}`,
  nombre: c.nombre,
  descripcion: c.descripcion,
  senado: false
}));

function getCommissionSlugFromName(name: string): string | null {
  const n = (name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes("gobierno interior")) return "gobierno-interior";
  if (n.includes("relaciones exteriores")) return "rree";
  if (n.includes("constitucion")) return "constitucion";
  if (n.includes("educacion")) return "educacion";
  if (n.includes("hacienda")) return "hacienda";
  if (n.includes("defensa")) return "defensa";
  if (n.includes("obras publicas") || n.includes("transportes")) return "obras-publicas";
  if (n.includes("agricultura")) return "agricultura";
  if (n.includes("medio ambiente")) return "medio-ambiente";
  if (n.includes("salud")) return "salud";
  if (n.includes("trabajo")) return "trabajo-y-prevision";
  if (n.includes("mineria") || n.includes("energia")) return "mineria";
  if (n.includes("economia")) return "economia";
  if (n.includes("vivienda")) return "vivienda";
  if (n.includes("derechos humanos")) return "derechos-humanos";
  if (n.includes("familia")) return "familias";
  if (n.includes("futuro") || n.includes("ciencia") || n.includes("tecnologia")) return "ciencias";
  if (n.includes("pesca")) return "pesca";
  if (n.includes("deportes")) return "deportes";
  if (n.includes("zonas extremas") || n.includes("antartica")) return "zonas-extremas";
  if (n.includes("seguridad ciudadana")) return "seguridad";
  if (n.includes("cultura") || n.includes("artes")) return "cultura";
  if (n.includes("desarrollo social")) return "desarrollo-social";
  if (n.includes("recursos hidricos") || n.includes("desertificacion")) return "recursos-hidricos";
  if (n.includes("emergencia") || n.includes("bomberos")) return "emergencias";
  if (n.includes("mujeres") || n.includes("equidad de genero")) return "mujeres-genero";
  if (n.includes("personas mayores") || n.includes("discapacidad")) return "personas-mayores";
  if (n.includes("inteligencia")) return "inteligencia-estado";
  if (n.includes("revisora de cuentas")) return "revisora-cuentas";
  if (n.includes("etica")) return "etica";
  if (n.includes("regimen interno")) return "regimen-interno";
  return null;
}

export async function fetchCamaraCitacionesSemanalesLive(forceRefresh: boolean = false): Promise<{
  porDia: any[];
  porComision: Record<string, any[]>;
  todas: any[];
}> {
  const cacheKey = "camara_citaciones_semanales_live";
  if (forceRefresh) {
    cache.delete(cacheKey);
  }

  return cache.wrap(cacheKey, 15 * 60 * 1000, async () => {
    try {
      const response = await fetch("https://www.camara.cl/legislacion/comisiones/citaciones_semana.aspx", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        signal: AbortSignal.timeout(9000)
      });

      if (!response.ok) {
        return {
          porDia: CAMARA_CITACIONES_SEMANALES_POR_DIA,
          porComision: CAMARA_CITACIONES_POR_COMISION,
          todas: CAMARA_CITACIONES_FULL_WEEK
        };
      }

      const html = await response.text();
      const articleRegex = /<article class="grid-12 citaciones">([\s\S]*?)<\/article>/gi;
      let artMatch;
      const daysList: any[] = [];
      const porComision: Record<string, any[]> = {};
      const todas: any[] = [];
      let totalCount = 0;

      while ((artMatch = articleRegex.exec(html)) !== null) {
        const artContent = artMatch[1];
        const dateMatch = artContent.match(/<p class="fecha">([\s\S]*?)<\/p>/i);
        const fechaStr = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : 'Fecha no especificada';

        const trRegex = /<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td colspan="2">([\s\S]*?)<\/td>\s*<\/tr>/gi;
        let trMatch;
        const dayCitaciones: any[] = [];

        while ((trMatch = trRegex.exec(artContent)) !== null) {
          totalCount++;
          const rawComision = trMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const rawHora = trMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const rawLugar = trMatch[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const rawContent = trMatch[4];

          const subRows: { materia: string; invitados: string }[] = [];
          const subTrRegex = /<tr>\s*<td class="w40"[^>]*>([\s\S]*?)<\/td>\s*<td class="w30"[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
          let subMatch;
          while ((subMatch = subTrRegex.exec(rawContent)) !== null) {
            const mat = subMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
            const inv = subMatch[2].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
            subRows.push({ materia: mat, invitados: inv });
          }

          let materia = '';
          let invitados = '';
          if (subRows.length > 0) {
            materia = subRows.map((sr, idx) => subRows.length > 1 ? `[Parte ${idx+1}] ${sr.materia}` : sr.materia).join('\n\n');
            invitados = subRows.map(sr => sr.invitados).filter(Boolean).join('\n---\n');
          } else {
            materia = rawContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }

          const boletines = materia.match(/\b\d{4,5}-\d{2}\b|\b\d{1,2}\.\d{3}-\d{2}\b/g) || [];
          const slug = getCommissionSlugFromName(rawComision);

          const citObj = {
            id: `cit-live-${totalCount}`,
            fecha: fechaStr,
            comisionNombre: rawComision,
            comisionSlug: slug || undefined,
            citacionNumero: `Citación Oficial N° ${totalCount}`,
            hora: rawHora,
            lugar: rawLugar,
            tipo: rawComision.startsWith("CEI") ? "Comisión Especial Investigadora" : "Sesión de Comisión",
            materia,
            invitados: invitados || "Autoridades sectoriales convocadas.",
            tabla: subRows.length > 0 ? subRows.map((sr, i) => `${i+1}. ${sr.materia.slice(0, 140)}...`) : [materia.slice(0, 140) + "..."],
            boletinesRelacionados: Array.from(new Set(boletines)),
            acuerdosCount: 0,
            completada: false
          };

          dayCitaciones.push(citObj);
          todas.push(citObj);

          if (slug) {
            if (!porComision[slug]) porComision[slug] = [];
            porComision[slug].push(citObj);
          }
        }

        daysList.push({
          fecha: fechaStr,
          totalCitaciones: dayCitaciones.length,
          citaciones: dayCitaciones
        });
      }

      if (todas.length > 0) {
        return {
          porDia: daysList,
          porComision,
          todas
        };
      }

      return {
        porDia: CAMARA_CITACIONES_SEMANALES_POR_DIA,
        porComision: CAMARA_CITACIONES_POR_COMISION,
        todas: CAMARA_CITACIONES_FULL_WEEK
      };
    } catch (err) {
      console.warn("Could not fetch live citaciones from Camara, using fallback:", err);
      return {
        porDia: CAMARA_CITACIONES_SEMANALES_POR_DIA,
        porComision: CAMARA_CITACIONES_POR_COMISION,
        todas: CAMARA_CITACIONES_FULL_WEEK
      };
    }
  });
}

export async function fetchComisionesCamaraReal(): Promise<ComisionReal[]> {
  return cache.wrap<ComisionReal[]>("camara_comisiones_vigentes", 30 * 60 * 1000, async () => {
    try {
      const response = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_Vigentes", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) return [];
      const xml = await response.text();
      const blocks = xml.match(/<Comision>[\s\S]*?<\/Comision>/gi) || [];

      return blocks
        .map((block) => {
          const get = (tag: string) => {
            const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
            return m ? m[1].trim() : "";
          };
          const id = get("ID");
          const nombreRaw = get("Nombre");
          const tipo = get("Tipo") || "Permanente";
          if (!id || !nombreRaw) return null;

          const nombre = /^comisi[oó]n/i.test(nombreRaw) ? nombreRaw : `Comisión de ${nombreRaw}`;
          return {
            id: `cd-${id}`,
            nombre,
            descripcion: `Comisión ${tipo.toLowerCase()} de la Cámara de Diputadas y Diputados de Chile.`,
            senado: false
          } as ComisionReal;
        })
        .filter((c): c is ComisionReal => c !== null);
    } catch (error) {
      console.error("Error fetching real Cámara commissions:", error);
      return [];
    }
  });
}

// Canales oficiales de YouTube donde se transmiten las sesiones de comisión.
// La búsqueda debe acotarse a ESTE canal según la cámara de la comisión: buscar en
// todo YouTube sin filtro de canal puede traer videos de terceros (prensa, cortes,
// resúmenes) que no son la transmisión oficial de la sesión, o directamente no
// encontrar nada relacionado con la comisión buscada.
const CANAL_OFICIAL_YOUTUBE: Record<"senado" | "diputados", string> = {
  senado: "TVSENADOCHILE",
  diputados: "diputadasydiputadosdechile"
};

function extraerFechaBusqueda(fecha?: string): string {
  let cleanFecha = (fecha || "septiembre 2026").trim();

  // Si la fecha viene en formato DD/MM/YYYY o DD-MM-YYYY, convertirla a formato legible (ej. 8 septiembre 2026)
  const dmY = cleanFecha.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmY) {
    const d = parseInt(dmY[1], 10);
    const m = parseInt(dmY[2], 10);
    const y = dmY[3];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const mesNom = meses[m - 1] || "septiembre";
    return `${d} ${mesNom} ${y}`;
  }
  return cleanFecha
    .replace(/,\s*/g, " ")
    .replace(/\bde\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerVideosDeYtInitialData(html: string): any[] {
  const startIdx = html.indexOf("ytInitialData = {");
  if (startIdx === -1) return [];
  const jsonStart = startIdx + "ytInitialData = ".length;
  const scriptEnd = html.indexOf(";</script>", jsonStart);
  if (scriptEnd === -1) return [];

  let data: any;
  try {
    data = JSON.parse(html.slice(jsonStart, scriptEnd));
  } catch {
    return [];
  }

  const videos: any[] = [];
  function extract(obj: any) {
    if (!obj || typeof obj !== "object") return;
    if (obj.videoId && (obj.title?.runs || obj.title?.simpleText)) {
      const title = obj.title.runs ? obj.title.runs.map((r: any) => r.text).join("") : obj.title.simpleText;
      const desc = obj.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join("") || obj.descriptionSnippet?.runs?.map((r: any) => r.text).join("") || "";
      const published = obj.publishedTimeText?.simpleText || "";
      const length = obj.lengthText?.simpleText || "";
      videos.push({
        id: obj.videoId,
        videoId: obj.videoId,
        title,
        published,
        length,
        desc,
        url: `https://www.youtube.com/watch?v=${obj.videoId}`
      });
    }
    for (const k of Object.keys(obj)) {
      extract(obj[k]);
    }
  }
  extract(data);

  const seen = new Set();
  const unique: any[] = [];
  for (const v of videos) {
    if (!seen.has(v.id)) {
      seen.add(v.id);
      unique.push(v);
    }
  }
  return unique;
}

function normalizarTexto(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Reordena los videos encontrados en el canal para que las transmisiones de la
 * sesión de LA comisión buscada aparezcan primero. El canal oficial también sube
 * boletines diarios genéricos ("Cámara Informa") y sesiones de OTRAS comisiones el
 * mismo día, así que sin este reordenamiento la selección automática del primer
 * resultado (videos[0]) podía terminar eligiendo un video que no es de la comisión.
 */
function priorizarVideosDeLaComision(videos: any[], cleanQuery: string): any[] {
  const primeraPalabra = cleanQuery.split(/[,\s]+/)[0] || cleanQuery;
  const keyword = normalizarTexto(primeraPalabra);
  if (!keyword) return videos;

  const scored = videos.map((v, idx) => {
    const titulo = normalizarTexto(v.title || "");
    let score = 0;
    if (titulo.includes("comision de") && titulo.includes(keyword)) score = 2;
    else if (titulo.includes(keyword)) score = 1;
    return { v, score, idx };
  });
  scored.sort((a, b) => (b.score - a.score) || (a.idx - b.idx));
  return scored.map(s => s.v);
}

export async function searchCamaraYouTubeVideos(query: string, fecha?: string, camara: "senado" | "diputados" = "diputados"): Promise<any[]> {
  const cacheKey = `yt_camara_search_${camara}_${query}_${fecha || ""}`;
  return cache.wrap(cacheKey, 10 * 60 * 1000, async () => {
    const cleanQuery = query.replace(/^(comisi[oó]n\s+de\s+|comisi[oó]n\s+)/i, "").trim();
    const cleanFecha = extraerFechaBusqueda(fecha);
    const canal = CANAL_OFICIAL_YOUTUBE[camara];
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "es-419,es;q=0.9"
    };

    // 1. Buscar directamente dentro del canal oficial de la cámara correspondiente
    // (Senado -> @TVSENADOCHILE, Cámara -> @diputadasydiputadosdechile). Esto es lo
    // que garantiza que la transmisión encontrada sea efectivamente de la sesión de
    // la comisión, y no un video de terceros que solo menciona el mismo término.
    try {
      const canalSearchTerm = `Comisión de ${cleanQuery} ${cleanFecha}`;
      const resCanal = await fetch(`https://www.youtube.com/@${canal}/search?query=${encodeURIComponent(canalSearchTerm)}`, {
        headers,
        signal: AbortSignal.timeout(8000)
      });
      if (resCanal.ok) {
        const htmlCanal = await resCanal.text();
        const videosCanal = extraerVideosDeYtInitialData(htmlCanal);
        if (videosCanal.length > 0) return priorizarVideosDeLaComision(videosCanal, cleanQuery).slice(0, 10);
      }
    } catch (err) {
      console.warn(`Could not search YouTube channel @${canal}:`, err);
    }

    // 2. Fallback: búsqueda general en YouTube, pero incluyendo el nombre del canal
    // oficial en el término de búsqueda para sesgar los resultados hacia él.
    try {
      const canalNombre = camara === "senado" ? "TV Senado" : "Cámara de Diputadas y Diputados de Chile";
      const searchTerm = `${canalNombre} Comisión de ${cleanQuery} ${cleanFecha}`;
      const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`, {
        headers,
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return [];
      const html = await res.text();
      return priorizarVideosDeLaComision(extraerVideosDeYtInitialData(html), cleanQuery).slice(0, 10);
    } catch (err) {
      console.warn("Could not search YouTube videos:", err);
      return [];
    }
  });
}

interface TranscriptResult {
  text: string;
  language: string;
  auto: boolean;
  truncated: boolean;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n/g, " ");
}

/**
 * Obtiene la transcripción (subtítulos, generalmente auto-generados por YouTube)
 * de un video de una sesión de comisión, para poder redactar un informe con
 * contenido real (intervenciones, citas textuales) en vez de relleno genérico.
 * No hay una API oficial pública para esto sin credenciales de Google Cloud, así
 * que se replica la técnica estándar: extraer las pistas de subtítulos desde
 * `ytInitialPlayerResponse` en el HTML de la página del video, y descargar la
 * pista en español (o la primera disponible) como XML de texto con marcas de tiempo.
 */
export async function fetchYouTubeVideoTranscript(videoId: string): Promise<TranscriptResult | null> {
  if (!videoId) return null;
  const cacheKey = `yt_transcript_${videoId}`;
  return cache.wrap(cacheKey, 24 * 60 * 60 * 1000, async () => {
    try {
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-419,es;q=0.9"
      };
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers,
        signal: AbortSignal.timeout(8000)
      });
      if (!pageRes.ok) return null;
      const html = await pageRes.text();

      const marker = "ytInitialPlayerResponse = ";
      const startIdx = html.indexOf(marker);
      if (startIdx === -1) return null;
      const jsonStart = startIdx + marker.length;
      const scriptEnd = html.indexOf(";var meta", jsonStart);
      const fallbackEnd = html.indexOf(";</script>", jsonStart);
      const end = scriptEnd !== -1 && scriptEnd < (fallbackEnd === -1 ? Infinity : fallbackEnd) ? scriptEnd : fallbackEnd;
      if (end === -1) return null;

      let playerResponse: any;
      try {
        playerResponse = JSON.parse(html.slice(jsonStart, end));
      } catch {
        return null;
      }

      const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (!Array.isArray(tracks) || tracks.length === 0) return null;

      const track =
        tracks.find((t: any) => (t.languageCode || "").startsWith("es") && t.kind !== "asr") ||
        tracks.find((t: any) => (t.languageCode || "").startsWith("es")) ||
        tracks.find((t: any) => t.kind !== "asr") ||
        tracks[0];
      if (!track?.baseUrl) return null;

      const trackRes = await fetch(track.baseUrl, { headers, signal: AbortSignal.timeout(8000) });
      if (!trackRes.ok) return null;
      const xml = await trackRes.text();

      const segments: string[] = [];
      const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(xml)) !== null) {
        const startSec = Math.round(Number(m[1]));
        const mm = String(Math.floor(startSec / 60)).padStart(2, "0");
        const ss = String(startSec % 60).padStart(2, "0");
        const content = decodeHtmlEntities(m[2]).trim();
        if (content) segments.push(`[${mm}:${ss}] ${content}`);
      }
      if (segments.length === 0) return null;

      const maxChars = 14000;
      const full = segments.join("\n");
      const truncated = full.length > maxChars;
      const text = truncated ? full.slice(0, maxChars) + "\n[...transcripción truncada por extensión...]" : full;

      return {
        text,
        language: track.languageCode || "es",
        auto: track.kind === "asr",
        truncated
      };
    } catch (err) {
      console.warn(`Could not fetch YouTube transcript for video ${videoId}:`, err);
      return null;
    }
  });
}

export async function getTodasComisiones(): Promise<ComisionReal[]> {
  const camaraLive = await fetchComisionesCamaraReal();
  const byId = new Map<string, ComisionReal>();
  for (const c of DIPUTADOS_COMISIONES_REALES) byId.set(c.id, c);
  for (const c of SENADO_COMISIONES_REALES) byId.set(c.id, c);
  for (const c of camaraLive) byId.set(c.id, c);
  return Array.from(byId.values());
}
