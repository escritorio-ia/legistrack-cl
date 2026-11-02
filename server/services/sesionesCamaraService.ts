// Historial de sesiones de comisiones de la Cámara, armado solo con fuentes reales:
//  1) Videos del canal oficial de YouTube de la Cámara (YouTube Data API): cada
//     sesión se sube con un título como "Comisión de Agricultura - Martes 8
//     septiembre 2026". Indica qué sesiones se realizaron, con video y duración.
//  2) Citaciones semanales guardadas en Firestore (citaciones_camara/semana_*),
//     que envía la extensión: aportan hora, sala, materia, tabla e invitados.
// Ambas se unen por comisión y fecha. No se agrega contenido que no esté en ellas.
import { cache } from "./cacheService";
import { CANALES_YOUTUBE, detallesVideos } from "./youtubeService";

const MESES: Record<string, number> = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };
const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

const FS_PROY = process.env.VITE_FIREBASE_PROJECT_ID || "legistrack-d75bc";
const FS_KEY = process.env.VITE_FIREBASE_API_KEY || "AIzaSyAZvd-S6AmPpV05UYEkRRULgDezD7mAkaE";

export interface VideoSesionCamara { videoId: string; comision: string; fecha: string; duracion: string; titulo: string }

function fechaISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "Comisión de Agricultura - Martes 8 septiembre 2026" → { comision, fecha ISO } */
export function parsearTituloSesion(titulo: string): { comision: string; fecha: string } | null {
  const t = String(titulo || "").replace(/\s+/g, " ").trim();
  const m = t.match(/^((?:comisi[oó]n|cei|subcomisi[oó]n)\b.*?)\s*[-–|]\s*(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)?\s*,?\s*(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)\s+(?:de\s+)?(\d{4})/i);
  if (!m) return null;
  const mes = MESES[norm(m[3])];
  if (mes === undefined) return null;
  return { comision: m[1].trim(), fecha: fechaISO(new Date(+m[4], mes, +m[2])) };
}

function formatoDuracion(seg: number | null): string {
  if (!seg) return "";
  const h = Math.floor(seg / 3600), mi = Math.floor((seg % 3600) / 60), s = seg % 60;
  return h ? `${h}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${mi}:${String(s).padStart(2, "0")}`;
}

/** Videos de sesiones de comisión subidos al canal oficial en los últimos ~9 meses (caché 6 h). */
export async function videosSesionesCamara(): Promise<VideoSesionCamara[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  return cache.wrap("yt_sesiones_camara_v1", 6 * 60 * 60 * 1000, async () => {
    const playlist = "UU" + CANALES_YOUTUBE.diputados.id.slice(2);
    const limite = Date.now() - 270 * 86400000;
    const items: { videoId: string; titulo: string }[] = [];
    let pageToken = "";
    for (let pagina = 0; pagina < 40; pagina++) {
      const qs = new URLSearchParams({ part: "snippet", playlistId: playlist, maxResults: "50", key, ...(pageToken ? { pageToken } : {}) });
      const r = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${qs}`, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) break;
      const d: any = await r.json();
      let viejo = false;
      for (const it of d.items || []) {
        const publicado = new Date(it.snippet?.publishedAt || 0).getTime();
        if (publicado && publicado < limite) { viejo = true; continue; }
        const id = it.snippet?.resourceId?.videoId;
        if (id) items.push({ videoId: id, titulo: String(it.snippet?.title || "") });
      }
      pageToken = d.nextPageToken || "";
      if (!pageToken || viejo) break;
    }
    const sesiones = items.map(i => ({ ...i, p: parsearTituloSesion(i.titulo) })).filter(i => i.p);
    // Duración: videos.list acepta 50 ids por llamada.
    const duraciones: Record<string, number | null> = {};
    for (let i = 0; i < sesiones.length; i += 50) {
      const det = await detallesVideos(sesiones.slice(i, i + 50).map(s => s.videoId)).catch(() => ({} as Record<string, any>));
      for (const [id, v] of Object.entries(det)) duraciones[id] = (v as any).segundos ?? null;
    }
    return sesiones.map(s => ({ videoId: s.videoId, comision: s.p!.comision, fecha: s.p!.fecha, duracion: formatoDuracion(duraciones[s.videoId] ?? null), titulo: s.titulo }));
  });
}

/** Todas las semanas de citaciones de la Cámara guardadas en Firestore (caché 15 min). */
export async function citacionesCamaraHistoricas(): Promise<any[]> {
  return cache.wrap("citaciones_camara_historicas_v1", 15 * 60 * 1000, async () => {
    const out: any[] = [];
    let pageToken = "";
    for (let i = 0; i < 10; i++) {
      const qs = new URLSearchParams({ pageSize: "100", key: FS_KEY, ...(pageToken ? { pageToken } : {}) });
      const r = await fetch(`https://firestore.googleapis.com/v1/projects/${FS_PROY}/databases/(default)/documents/citaciones_camara?${qs}`, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) break;
      const d: any = await r.json();
      for (const doc of d.documents || []) {
        if (!/\/semana_[^/]+$/.test(doc.name || "")) continue;
        try {
          const reg = JSON.parse(doc.fields?.payload?.stringValue || "null");
          for (const c of reg?.datos?.todas || []) out.push({ ...c, _semana: reg.semana });
        } catch { /* documento ilegible */ }
      }
      pageToken = d.nextPageToken || "";
      if (!pageToken) break;
    }
    return out;
  });
}

const DIA_CIT = /(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i;
function fechaCitacion(f: string): string {
  const m = String(f || "").match(DIA_CIT);
  if (!m) return "";
  const mes = MESES[norm(m[2])];
  return mes === undefined ? "" : fechaISO(new Date(+m[3], mes, +m[1]));
}

/** ¿El nombre de comisión del video corresponde a esta comisión? (por palabras clave del nombre) */
function mismaComision(nombreVideo: string, nombreComision: string): boolean {
  const limpiar = (s: string) => norm(s).replace(/^(sub)?comision\s+(especial\s+)?(investigadora\s+)?(de\s+|del\s+|sobre\s+)?/, "").replace(/[,.]/g, " ");
  const v = limpiar(nombreVideo).split(" ").filter(w => w.length > 3 && !["para", "sobre", "como"].includes(w));
  const c = limpiar(nombreComision);
  if (v.length === 0) return false;
  return v.slice(0, 2).every(w => c.includes(w));
}

export interface SesionCamaraHist {
  id: string; fecha: string; hora?: string; lugar?: string; tipo: string; materia: string; invitados: string;
  tabla?: string[]; videoUrl?: string; duracionVideo?: string; completada: boolean; acuerdosCount: number; fuente: string;
}

export async function sesionesCamaraDeComision(slug: string, nombre: string): Promise<SesionCamaraHist[]> {
  const [videos, citas] = await Promise.all([
    videosSesionesCamara().catch(() => [] as VideoSesionCamara[]),
    citacionesCamaraHistoricas().catch(() => [] as any[])
  ]);
  const porFecha = new Map<string, SesionCamaraHist>();
  const hoy = fechaISO(new Date());

  for (const c of citas) {
    if (c.comisionSlug !== slug) continue;
    const f = fechaCitacion(c.fecha);
    if (!f) continue;
    porFecha.set(f, {
      id: `ses-cd-hist-${f}`, fecha: f, hora: c.hora, lugar: c.lugar, tipo: c.tipo || "Sesión de Comisión",
      materia: c.materia || "Materia no informada", invitados: /^no informado/i.test(c.invitados || "") ? "" : (c.invitados || ""),
      tabla: c.tabla, completada: f < hoy, acuerdosCount: 0, fuente: "Citación oficial (camara.cl)"
    });
  }
  for (const v of videos) {
    if (!mismaComision(v.comision, nombre)) continue;
    const previa = porFecha.get(v.fecha);
    const video = { videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`, duracionVideo: v.duracion };
    if (previa) porFecha.set(v.fecha, { ...previa, ...video, completada: true, fuente: "Citación oficial y video oficial" });
    else porFecha.set(v.fecha, {
      id: `ses-cd-hist-${v.fecha}`, fecha: v.fecha, tipo: "Sesión de Comisión", materia: "Materia no informada (sesión registrada en el canal oficial de YouTube)",
      invitados: "", completada: true, acuerdosCount: 0, ...video, fuente: "Video oficial (YouTube de la Cámara)"
    });
  }
  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const NOMBRES_MES = Object.keys(MESES).filter(k => k !== "setiembre");
  return Array.from(porFecha.values())
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map(s => {
      const [y, m, d] = s.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return { ...s, fecha: `${DIAS[dt.getDay()]} ${d} de ${NOMBRES_MES[m - 1]} de ${y}` };
    });
}
