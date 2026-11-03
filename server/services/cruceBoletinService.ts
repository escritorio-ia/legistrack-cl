/**
 * Derecho Comparado — cruce de un boletín con su moción/mensaje original y con las normas de
 * otros países, más validación de enlaces (se visita cada URL antes de mostrarla como válida).
 */
import { generarContenidoUniversalIA, safeJsonParse } from "./aiService";

// ---------------------------------------------------------------------------
// Validación de enlaces
// ---------------------------------------------------------------------------
export interface EstadoEnlace {
  url: string;
  /** ok = respondió (2xx/3xx); roto = 404/410/5xx/sin respuesta; bloqueado = el sitio exige verificación humana (401/403/429) */
  estado: "ok" | "roto" | "bloqueado";
  codigo?: number;
  urlFinal?: string;
  verificadoEl: string;
}

const PRIVADO = /^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:)/i;

function urlPermitida(u: string): URL | null {
  try {
    const x = new URL(u);
    if (x.protocol !== "https:" && x.protocol !== "http:") return null;
    if (PRIVADO.test(x.hostname)) return null;
    return x;
  } catch {
    return null;
  }
}

const cacheEnlaces = new Map<string, { en: number; v: EstadoEnlace }>();
const TTL_ENLACE_MS = 60 * 60 * 1000;

async function visitar(url: string): Promise<EstadoEnlace> {
  const hoy = new Date().toISOString();
  const c = cacheEnlaces.get(url);
  if (c && Date.now() - c.en < TTL_ENLACE_MS) return c.v;
  const u = urlPermitida(url);
  let v: EstadoEnlace;
  if (!u) {
    v = { url, estado: "roto", verificadoEl: hoy };
  } else {
    try {
      const r = await fetch(u.toString(), {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Legislacion++ verificador de enlaces)", Accept: "text/html,application/pdf,*/*" },
        signal: AbortSignal.timeout(12000),
      });
      try { await r.body?.cancel(); } catch { /* ignorar */ }
      const s = r.status;
      v = {
        url,
        codigo: s,
        urlFinal: r.url && r.url !== url ? r.url : undefined,
        estado: s >= 200 && s < 400 ? "ok" : s === 401 || s === 403 || s === 429 ? "bloqueado" : "roto",
        verificadoEl: hoy,
      };
    } catch {
      v = { url, estado: "roto", verificadoEl: hoy };
    }
  }
  cacheEnlaces.set(url, { en: Date.now(), v });
  return v;
}

export async function validarEnlaces(urls: string[]): Promise<EstadoEnlace[]> {
  const unicas = Array.from(new Set(urls.filter(u => typeof u === "string" && u.trim())) ).slice(0, 60);
  const out: EstadoEnlace[] = [];
  let i = 0;
  const worker = async () => {
    while (i < unicas.length) {
      const mi = i++;
      out[mi] = await visitar(unicas[mi]);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}

// ---------------------------------------------------------------------------
// Cruce con IA (solo con las fuentes entregadas)
// ---------------------------------------------------------------------------
export interface FuenteCruce {
  n: number; // índice citable [n]
  rotulo: string; // "Moción original", "Chile — Ley N° …", "España — …"
  pais?: string;
  titulo: string;
  url?: string;
  descripcion?: string;
}

export interface EntradaCruce {
  boletin: string;
  titulo: string;
  iniciativa?: string;
  autores?: string;
  resumen?: string;
  fichaTecnica?: { objeto?: string; mecanismos?: string; fiscalizacion?: string; sanciones?: string };
  fuentes: FuenteCruce[];
}

export interface SalidaCruce {
  disponible: boolean;
  motivo?: string;
  sintesis?: string;
  original?: { funcion: string; jurisdiccion: string; refs: number[] };
  comparador?: { dimension: string; chile: string; paises: { n: number; pais: string; texto: string }[]; lectura: string }[];
  porPais?: { n: number; pais: string; funcion: string; jurisdiccion: string }[];
}

export async function cruzarBoletin(e: EntradaCruce): Promise<SalidaCruce> {
  const fuentes = (e.fuentes || []).slice(0, 14);
  const extranjeras = fuentes.filter(f => f.pais && f.pais !== "Chile");
  if (extranjeras.length === 0) {
    return { disponible: false, motivo: "No hay normas de otros países con enlace para cruzar con este boletín." };
  }
  const bloqueFuentes = fuentes
    .map(f => `[${f.n}] ${f.rotulo}${f.pais ? ` (${f.pais})` : ""} — ${f.titulo}\n   Descripción: ${f.descripcion || "(sin descripción en la fuente)"}`)
    .join("\n");

  const ficha = e.fichaTecnica
    ? `Objeto: ${e.fichaTecnica.objeto || "—"}\nMecanismos: ${e.fichaTecnica.mecanismos || "—"}\nFiscalización: ${e.fichaTecnica.fiscalizacion || "—"}\nSanciones: ${e.fichaTecnica.sanciones || "—"}`
    : "(sin ficha técnica)";

  const prompt = `Eres analista de Asesoría Técnica Parlamentaria. Cruza el proyecto de ley chileno (Boletín ${e.boletin}) con las normas de otros países listadas, usando EXCLUSIVAMENTE los datos de abajo.

PROYECTO (${e.iniciativa || "iniciativa no informada"}${e.autores ? `, autores: ${e.autores}` : ""}):
Título: ${e.titulo}
Resumen oficial: ${e.resumen || "(sin resumen)"}
${ficha}

FUENTES (cita siempre con su número entre corchetes):
${bloqueFuentes}

Entrega SOLO un objeto JSON compacto, sin texto adicional:
{
 "sintesis": "3 a 4 oraciones: qué regula el proyecto y cómo se compara en general con las demás normas (cita [n])",
 "original": {"funcion": "Función jurídica del proyecto (p. ej. tipifica un delito, crea una institución, regula un procedimiento, impone obligaciones, modifica un código) en 2 oraciones", "jurisdiccion": "Ámbito de aplicación y competencia: territorio, órgano o tribunal competente, nivel (nacional/regional) en 2 oraciones; si el material no lo indica, escribe exactamente 'No informado en las fuentes.'", "refs": [n]},
 "comparador": [{"dimension": "2-4 palabras", "chile": "Qué dispone el proyecto en esta dimensión (1-2 oraciones, [n])", "paises": [{"n": numeroDeFuente, "pais": "Nombre", "texto": "Qué dispone esa norma (1-2 oraciones)"}], "lectura": "1-2 oraciones: coincidencias y diferencias"}],
 "porPais": [{"n": numeroDeFuente, "pais": "Nombre", "funcion": "Función jurídica de esa norma (1-2 oraciones)", "jurisdiccion": "Jurisdicción y órgano competente (1-2 oraciones o 'No informado en las fuentes.')"}]
}
Reglas estrictas: entre 5 y 7 dimensiones en "comparador"; una entrada de "porPais" por cada fuente extranjera; no inventes artículos, plazos, cifras ni órganos que no aparezcan en los datos; si un país no permite llenar una dimensión, omítelo de esa dimensión; "n" debe ser el número exacto de la fuente.`;

  const texto = await generarContenidoUniversalIA(prompt, 8000);
  if (!texto) return { disponible: false, motivo: "No se pudo generar el cruce con IA en este momento. Reintenta en un minuto." };
  try {
    const j: any = safeJsonParse<any>(texto);
    const nValidos = new Set(fuentes.map(f => f.n));
    const limpiaN = (n: any) => (nValidos.has(Number(n)) ? Number(n) : null);
    return {
      disponible: true,
      sintesis: String(j.sintesis || ""),
      original: j.original
        ? { funcion: String(j.original.funcion || ""), jurisdiccion: String(j.original.jurisdiccion || ""), refs: (j.original.refs || []).map(limpiaN).filter((x: any) => x !== null) }
        : undefined,
      comparador: (Array.isArray(j.comparador) ? j.comparador : []).map((d: any) => ({
        dimension: String(d.dimension || ""),
        chile: String(d.chile || ""),
        lectura: String(d.lectura || ""),
        paises: (Array.isArray(d.paises) ? d.paises : [])
          .map((p: any) => ({ n: limpiaN(p.n), pais: String(p.pais || ""), texto: String(p.texto || "") }))
          .filter((p: any) => p.n !== null),
      })).filter((d: any) => d.dimension),
      porPais: (Array.isArray(j.porPais) ? j.porPais : [])
        .map((p: any) => ({ n: limpiaN(p.n), pais: String(p.pais || ""), funcion: String(p.funcion || ""), jurisdiccion: String(p.jurisdiccion || "") }))
        .filter((p: any) => p.n !== null),
    };
  } catch {
    return { disponible: false, motivo: "La IA devolvió una respuesta incompleta. Reintenta." };
  }
}
