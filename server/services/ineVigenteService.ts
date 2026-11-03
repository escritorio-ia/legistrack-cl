/**
 * Indicadores vigentes publicados por el INE en su sitio (ine.gob.cl). No hay API pública de
 * series, así que se lee el recuadro de "indicadores" de cada página de resultados. Si el
 * texto no coincide (el INE cambió el diseño), el valor queda en null → la app muestra
 * "No informado" y nunca un número viejo o inventado.
 */

export interface DatoIne {
  valor: number;
  texto: string; // "9,8%"
  periodo: string; // "julio – septiembre 2026"
  fuenteUrl: string;
  consultadoEl: string;
}

export interface IneVigente {
  desocupacion: DatoIne | null;
  informalidad: DatoIne | null;
  ipcMensual: DatoIne | null;
}

const URL_EMPLEO = "https://www.ine.gob.cl/estadisticas-por-tema/mercado-laboral/ocupacion-y-desocupacion";
const URL_IPC = "https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor";

const TTL_MS = 6 * 60 * 60 * 1000;
let cache: { en: number; datos: IneVigente } | null = null;

function aTexto(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;|&#8211;/g, "–")
    .replace(/&aacute;/g, "á").replace(/&eacute;/g, "é").replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó").replace(/&uacute;/g, "ú").replace(/&ntilde;/g, "ñ")
    .replace(/\s+/g, " ");
}

function extraer(texto: string, re: RegExp, url: string, hoy: string): DatoIne | null {
  const m = texto.match(re);
  if (!m) return null;
  const valor = Number(m[1].replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(valor)) return null;
  return { valor, texto: `${m[1]}%`, periodo: m[2].trim(), fuenteUrl: url, consultadoEl: hoy };
}

async function bajar(url: string): Promise<string> {
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Legislacion++)", "Accept-Language": "es-CL,es;q=0.9" },
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`INE ${r.status}`);
  return aTexto(await r.text());
}

export async function getIneVigente(): Promise<IneVigente> {
  if (cache && Date.now() - cache.en < TTL_MS) return cache.datos;
  const hoy = new Date().toISOString().slice(0, 10);
  const datos: IneVigente = { desocupacion: null, informalidad: null, ipcMensual: null };
  const PERIODO_TRIM = "([A-Za-zÁÉÍÓÚáéíóúñ]+\\s*[–-]\\s*[A-Za-zÁÉÍÓÚáéíóúñ]+\\s+\\d{4})";
  try {
    const t = await bajar(URL_EMPLEO);
    datos.desocupacion = extraer(t, new RegExp(`Tasa de desocupaci[oó]n nacional\\s*(-?[\\d.,]+)\\s*%\\s*Trimestre m[oó]vil\\s*${PERIODO_TRIM}`, "i"), URL_EMPLEO, hoy);
    datos.informalidad = extraer(t, new RegExp(`Tasa de ocupaci[oó]n informal nacional\\s*(-?[\\d.,]+)\\s*%\\s*Trimestre m[oó]vil\\s*${PERIODO_TRIM}`, "i"), URL_EMPLEO, hoy);
  } catch (e: any) {
    console.warn("[ine] empleo:", e?.message);
  }
  try {
    const t = await bajar(URL_IPC);
    datos.ipcMensual = extraer(t, /[ÍI]ndice de Precios al Consumidor\s*-\s*IPC\s*(-?[\d.,]+)\s*%\s*Variaci[oó]n mensual\s*([A-Za-zÁÉÍÓÚáéíóúñ]+\s+\d{4})/i, URL_IPC, hoy);
  } catch (e: any) {
    console.warn("[ine] ipc:", e?.message);
  }
  if (datos.desocupacion || datos.informalidad || datos.ipcMensual) cache = { en: Date.now(), datos };
  return datos;
}
