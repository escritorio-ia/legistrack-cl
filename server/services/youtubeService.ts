// Videos de sesiones de comisión en los canales oficiales de YouTube del Congreso,
// usando SOLO vías oficiales:
//  - YouTube Data API v3 (requiere YOUTUBE_API_KEY) para encontrar el video de una
//    sesión y conocer su duración.
//  - API de Gemini (GEMINI_API_KEY), que acepta enlaces de videos públicos de
//    YouTube, para describir lo que se dijo: expositores, minutos, acuerdos y citas.
// Nada se inventa: si falta una clave o el servicio falla, se informa el motivo.
import { cache } from "./cacheService";
import { safeJsonParse } from "./aiService";

export const CANALES_YOUTUBE = {
  diputados: { id: "UCYd5k2TyOyOmUJNx0SH17KA", nombre: "Diputadas y Diputados de Chile" },
  senado: { id: "UC4GJ43VNn4AYfiYa0RBCHQg", nombre: "TV Senado Chile" }
} as const;

export type CamaraYT = keyof typeof CANALES_YOUTUBE;

export interface VideoSesion {
  id: string;
  videoId: string;
  title: string;
  published: string;     // ISO
  length: string;        // "1:46:36" o ""
  segundos: number | null;
  desc: string;
  url: string;
  canal: string;
}

export class YouTubeNoConfigurado extends Error {}

const ytKey = () => {
  const k = process.env.YOUTUBE_API_KEY;
  return k && k !== "MY_YOUTUBE_API_KEY" ? k : "";
};
export const youtubeApiConfigurada = () => !!ytKey();

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Convierte "08/09/2026", "2026-09-08" o "Martes 08 de septiembre de 2026" a Date (UTC). */
export function fechaSesionADate(fecha?: string): Date | null {
  if (!fecha) return null;
  const f = norm(fecha);
  let m = f.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = f.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  m = f.match(/(\d{1,2})\s+(?:de\s+)?([a-z]+)\s+(?:de\s+)?(\d{4})/);
  if (m) {
    const mes = MESES.indexOf(m[2]);
    if (mes >= 0) return new Date(Date.UTC(+m[3], mes, +m[1]));
  }
  return null;
}

function duracionISO(iso: string): number | null {
  const m = String(iso || "").match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return (+(m[1] || 0)) * 86400 + (+(m[2] || 0)) * 3600 + (+(m[3] || 0)) * 60 + (+(m[4] || 0));
}

function formatoDuracion(seg: number | null): string {
  if (seg == null || seg <= 0) return "";
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = seg % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

async function ytGet(ruta: string, params: Record<string, string>): Promise<any> {
  const key = ytKey();
  if (!key) throw new YouTubeNoConfigurado("Falta configurar YOUTUBE_API_KEY (YouTube Data API v3).");
  const qs = new URLSearchParams({ ...params, key }).toString();
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${ruta}?${qs}`, { signal: AbortSignal.timeout(12000) });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`YouTube API HTTP ${res.status}: ${data?.error?.message || ""}`.trim());
  return data;
}

/** Duración y datos básicos de videos (1 unidad de cuota por llamada, hasta 50 ids). */
export async function detallesVideos(ids: string[]): Promise<Record<string, { segundos: number | null; titulo: string; publicado: string; canal: string }>> {
  const unicos = Array.from(new Set(ids.filter(id => /^[\w-]{11}$/.test(id)))).slice(0, 50);
  if (unicos.length === 0) return {};
  return cache.wrap(`yt_det_${unicos.join(",")}`, 6 * 60 * 60 * 1000, async () => {
    const data = await ytGet("videos", { part: "snippet,contentDetails", id: unicos.join(",") });
    const out: Record<string, any> = {};
    for (const it of data.items || []) {
      out[it.id] = {
        segundos: duracionISO(it.contentDetails?.duration),
        titulo: it.snippet?.title || "",
        publicado: it.snippet?.publishedAt || "",
        canal: it.snippet?.channelTitle || ""
      };
    }
    return out;
  });
}

/**
 * Busca en el canal oficial el video de la sesión de una comisión en una fecha.
 * Usa search.list (100 unidades de cuota) acotado al canal y a ±3 días de la fecha.
 */
export async function buscarVideosSesion(comision: string, fecha?: string, camara: CamaraYT = "diputados"): Promise<VideoSesion[]> {
  const limpio = String(comision || "").replace(/^(comisi[oó]n\s+(especial\s+)?(de\s+)?)/i, "").trim();
  const dia = fechaSesionADate(fecha);
  const canal = CANALES_YOUTUBE[camara];
  const cacheKey = `yt_api_busqueda_${camara}_${norm(limpio)}_${dia ? dia.toISOString().slice(0, 10) : "sin-fecha"}`;

  return cache.wrap(cacheKey, 6 * 60 * 60 * 1000, async () => {
    const params: Record<string, string> = {
      part: "snippet",
      channelId: canal.id,
      q: `Comisión ${limpio}`,
      type: "video",
      maxResults: "15",
      order: dia ? "relevance" : "date"
    };
    if (dia) {
      params.publishedAfter = new Date(dia.getTime() - 1 * 86400000).toISOString();
      params.publishedBefore = new Date(dia.getTime() + 4 * 86400000).toISOString();
    }
    const data = await ytGet("search", params);
    const items: any[] = (data.items || []).filter((it: any) => it.id?.videoId);
    if (items.length === 0) return [];

    const det = await detallesVideos(items.map(it => it.id.videoId)).catch(() => ({} as Record<string, any>));
    const clave = norm(limpio.split(/[,\s]+/)[0] || limpio);
    const diaTxt = dia ? `${dia.getUTCDate()} ${MESES[dia.getUTCMonth()]}` : "";

    const videos = items.map((it, idx) => {
      const id = it.id.videoId as string;
      const titulo = String(it.snippet?.title || "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
      const t = norm(titulo);
      let puntaje = 0;
      if (clave && t.includes(clave)) puntaje += 2;
      if (t.includes("comision")) puntaje += 1;
      if (diaTxt && t.includes(diaTxt)) puntaje += 3;
      const seg = det[id]?.segundos ?? null;
      return {
        v: {
          id, videoId: id, title: titulo,
          published: it.snippet?.publishedAt || "",
          length: formatoDuracion(seg),
          segundos: seg,
          desc: it.snippet?.description || "",
          url: `https://www.youtube.com/watch?v=${id}`,
          canal: canal.nombre
        } as VideoSesion,
        puntaje, idx
      };
    });
    videos.sort((a, b) => (b.puntaje - a.puntaje) || (a.idx - b.idx));
    // Solo videos cuyo título menciona la comisión buscada.
    return videos.filter(x => !clave || norm(x.v.title).includes(clave)).map(x => x.v).slice(0, 10);
  });
}

// ---------------------------------------------------------------------------
// Análisis del video con Gemini
// ---------------------------------------------------------------------------

export interface IntervencionVideo {
  segundos: number;
  orador: string;
  cargo: string;
  resumen: string;
  cita?: string;
}

export interface AnalisisParteVideo {
  disponible: boolean;
  motivo?: string;
  parte: number;
  desde: number;
  hasta: number | null;
  resumen?: string;
  temas?: string[];
  intervenciones?: IntervencionVideo[];
  acuerdos?: string[];
  votaciones?: string[];
  modelo?: string;
}

/** Segundos por parte. Partes de 1 hora para no exceder el límite de tiempo de la función. */
export const SEGUNDOS_POR_PARTE = 3600;

function aSegundos(v: any): number {
  if (typeof v === "number" && isFinite(v)) return Math.max(0, Math.round(v));
  const p = String(v || "").trim().split(":").map(n => parseInt(n, 10));
  if (p.some(n => isNaN(n))) return 0;
  return p.reduce((acc, n) => acc * 60 + n, 0);
}

export async function analizarParteVideo(params: {
  videoId: string;
  parte: number;
  duracion?: number | null;
  comision?: string;
  fecha?: string;
  materia?: string;
}): Promise<AnalisisParteVideo> {
  const { videoId, parte } = params;
  const apiKey = process.env.GEMINI_API_KEY;
  const desde = parte * SEGUNDOS_POR_PARTE;
  const hasta = params.duracion ? Math.min(params.duracion, desde + SEGUNDOS_POR_PARTE) : (params.duracion === null ? null : desde + SEGUNDOS_POR_PARTE);
  if (!/^[\w-]{11}$/.test(videoId)) return { disponible: false, motivo: "Identificador de video no válido.", parte, desde, hasta };
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return { disponible: false, motivo: "Falta configurar GEMINI_API_KEY.", parte, desde, hasta };
  }

  // Solo se guardan en caché los análisis exitosos (los errores se reintentan).
  const claveCache = `yt_analisis_${videoId}_${parte}_${hasta ?? "fin"}`;
  const previo = cache.get<AnalisisParteVideo>(claveCache);
  if (previo) return previo;
  const resultado = await (async (): Promise<AnalisisParteVideo> => {
    const contexto = [
      params.comision ? `Comisión: ${params.comision}` : "",
      params.fecha ? `Fecha de la sesión: ${params.fecha}` : "",
      params.materia ? `Materia citada: ${params.materia}` : ""
    ].filter(Boolean).join("\n");

    const prompt = `Este video es la transmisión oficial de una sesión de comisión del Congreso de Chile.
${contexto}

Analiza SOLO lo que efectivamente se ve y se escucha en el tramo indicado del video. No inventes nombres, cargos, cifras ni acuerdos: si no se identifica a quien habla, usa "No identificado". Si el tramo no contiene la sesión (pantalla en espera, receso), indícalo en "resumen" y deja las listas vacías.

Responde ÚNICAMENTE con JSON válido:
{
  "resumen": "qué ocurrió en este tramo, 3-5 frases",
  "temas": ["temas o boletines tratados"],
  "intervenciones": [
    {"minuto": "H:MM:SS desde el inicio del video", "orador": "nombre tal como se presenta", "cargo": "cargo o institución, o ''", "resumen": "qué planteó, 1-3 frases", "cita": "frase textual breve y relevante, o ''"}
  ],
  "acuerdos": ["acuerdos adoptados, si se mencionan"],
  "votaciones": ["votaciones realizadas y su resultado, si las hay"]
}
Ordena las intervenciones cronológicamente y registra cada cambio relevante de orador.`;

    const videoMetadata: any = { startOffset: `${desde}s` };
    if (hasta != null) videoMetadata.endOffset = `${hasta}s`;

    // Se prueban varios modelos: si uno no tiene cuota (429) o no existe (404), se pasa al siguiente.
    const candidatos = Array.from(new Set([
      process.env.GEMINI_VIDEO_MODEL, process.env.GEMINI_MODEL,
      "gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"
    ].filter(Boolean) as string[]));
    let res: Response | null = null;
    let model = candidatos[0];
    const errores: string[] = [];
    for (const m of candidatos) {
      model = m;
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { fileData: { fileUri: `https://www.youtube.com/watch?v=${videoId}` }, videoMetadata },
                { text: prompt }
              ]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 16000,
              responseMimeType: "application/json",
              mediaResolution: "MEDIA_RESOLUTION_LOW"
            }
          }),
          signal: AbortSignal.timeout(270000)
        });
      } catch (err: any) {
        return { disponible: false, motivo: `No se pudo contactar a Gemini: ${err?.message || err}`, parte, desde, hasta };
      }
      if (res.ok) break;
      const txt = await res.text().catch(() => "");
      let detalle = "";
      try {
        const j = JSON.parse(txt);
        const viol = (j?.error?.details || []).flatMap((d: any) => d?.violations || []);
        detalle = viol.map((v: any) => v.quotaId || v.quotaMetric).filter(Boolean).join(", ") || String(j?.error?.message || "").slice(0, 160);
      } catch { detalle = txt.slice(0, 160); }
      errores.push(`${m}: HTTP ${res.status}${detalle ? ` (${detalle})` : ""}`);
      if (res.status !== 429 && res.status !== 404) break;
      res = null;
    }
    if (!res || !res.ok) {
      const sinCuota = errores.some(e => e.includes("HTTP 429"));
      return {
        disponible: false,
        motivo: `${sinCuota ? "La clave de Gemini no tiene cuota disponible (límite gratuito agotado o sin facturación activa). " : ""}Detalle: ${errores.join(" | ")}`,
        parte, desde, hasta
      };
    }
    const data: any = await res.json();
    const texto = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("");
    const json: any = texto ? (() => { try { return safeJsonParse<any>(texto); } catch { return null; } })() : null;
    if (!json) {
      return { disponible: false, motivo: "Gemini no devolvió un análisis legible para este tramo.", parte, desde, hasta };
    }
    const lista = (v: any) => (Array.isArray(v) ? v.map((x: any) => String(x || "").trim()).filter(Boolean) : []);
    let intervenciones: IntervencionVideo[] = (Array.isArray(json.intervenciones) ? json.intervenciones : []).map((i: any) => ({
      segundos: aSegundos(i.minuto ?? i.segundos),
      orador: String(i.orador || "No identificado"),
      cargo: String(i.cargo || ""),
      resumen: String(i.resumen || ""),
      cita: i.cita ? String(i.cita) : undefined
    }));
    // Si el modelo entregó minutos relativos al tramo (todos antes de su inicio),
    // se pasan a minutos del video completo para que los enlaces al minuto funcionen.
    if (desde > 0 && intervenciones.length > 0 && intervenciones.every(i => i.segundos < desde)) {
      intervenciones = intervenciones.map(i => ({ ...i, segundos: i.segundos + desde }));
    }
    return {
      disponible: true,
      parte, desde, hasta,
      resumen: String(json.resumen || ""),
      temas: lista(json.temas),
      intervenciones,
      acuerdos: lista(json.acuerdos),
      votaciones: lista(json.votaciones),
      modelo: model
    };
  })();
  if (resultado.disponible) cache.set(claveCache, resultado, 7 * 24 * 60 * 60 * 1000);
  return resultado;
}
