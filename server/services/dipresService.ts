// Informes Financieros (IF) de proyectos de ley, desde la fuente oficial de la
// Dirección de Presupuestos (DIPRES). La página de búsqueda publica en una sola
// tabla todos los IF desde 2014 (N° de IF, materia, boletín, mensaje, estado,
// PDF, ministerio y año), así que se descarga una vez y se filtra localmente.
import { cache } from "./cacheService";
import { generarContenidoUniversalIA, safeJsonParse } from "./aiService";

const BASE = "https://www.dipres.gob.cl/604/";
const URL_BUSQUEDA = `${BASE}w3-propertyvalue-22563.html`;

export interface InformeFinanciero {
  numero: string;          // ej. "247-2026"
  materia: string;
  boletines: string[];     // ej. ["18643-05"]
  mensaje: string;         // ej. "193-374"
  estado: string;          // "Proyecto de Ley en Trámite" | "Ley Publicada" | ...
  ministerio: string;
  anio: string;
  pdf: string;             // URL absoluta del PDF oficial
}

const limpiar = (s: string) =>
  s.replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();

function celda(fila: string, clase: string): string {
  const m = fila.match(new RegExp(`<td[^>]*class="[^"]*\\b${clase}\\b[^"]*"[^>]*>([\\s\\S]*?)</td>`, "i"));
  return m ? limpiar(m[1]) : "";
}

export function claveBoletinIF(b: string): string {
  const m = String(b || "").replace(/\./g, "").match(/(\d{3,6})(?:-(\d{1,2}))?/);
  return m ? (m[2] ? `${m[1]}-${m[2].padStart(2, "0")}` : m[1]) : "";
}

/** Índice completo de informes financieros publicados por la DIPRES (caché 6 horas). */
export async function fetchIndiceInformesFinancieros(): Promise<InformeFinanciero[]> {
  return cache.wrap("dipres_indice_if", 6 * 60 * 60 * 1000, async () => {
    const res = await fetch(URL_BUSQUEDA, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" },
      signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(`dipres.gob.cl respondió HTTP ${res.status}`);
    const html = await res.text();
    const filas = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    const informes: InformeFinanciero[] = [];
    for (const fila of filas) {
      const numero = celda(fila, "titulo");
      if (!/^\d+-\d{4}$/.test(numero)) continue;
      const href = (fila.match(/href="([^"]+\.pdf[^"]*)"/i) || [])[1] || "";
      informes.push({
        numero,
        materia: celda(fila, "abstract"),
        boletines: (celda(fila, "nboletin").match(/\d{1,2}\.?\d{3}-\d{1,2}/g) || []).map(claveBoletinIF),
        mensaje: celda(fila, "nmensaje"),
        estado: celda(fila, "estado"),
        ministerio: celda(fila, "ministerio"),
        anio: celda(fila, "periodo"),
        pdf: href ? new URL(href, BASE).toString() : ""
      });
    }
    if (informes.length === 0) throw new Error("La página de la DIPRES no trajo informes legibles");
    return informes;
  });
}

/** Informes financieros asociados a un boletín. */
export async function informesFinancierosDeBoletin(boletin: string): Promise<InformeFinanciero[]> {
  const clave = claveBoletinIF(boletin);
  const digitos = clave.split("-")[0];
  const indice = await fetchIndiceInformesFinancieros();
  return indice.filter(i => i.boletines.some(b => b === clave || b.split("-")[0] === digitos));
}

export interface ResumenInformeFinanciero {
  disponible: boolean;
  motivo?: string;
  descripcion?: string;          // qué hace el proyecto según el IF
  efectoFiscal?: string;         // mayor/menor gasto o ingreso, o "sin efecto fiscal"
  montos?: string[];             // cifras textuales del IF (con su unidad y año)
  financiamiento?: string;       // cómo se financia
  extracto?: string;             // si no hay IA: primeras líneas del texto oficial
  fuente: string;
}

/**
 * Describe un informe financiero a partir del texto real de su PDF oficial.
 * La IA solo resume lo que dice el documento; si no está disponible, se entrega
 * un extracto literal del texto.
 */
export async function resumirInformeFinanciero(pdfUrl: string): Promise<ResumenInformeFinanciero> {
  const url = new URL(pdfUrl);
  if (!/(^|\.)dipres\.gob\.cl$/i.test(url.hostname)) {
    return { disponible: false, motivo: "Solo se aceptan documentos de dipres.gob.cl", fuente: pdfUrl };
  }
  return cache.wrap(`dipres_resumen_if_${url.pathname}`, 7 * 24 * 60 * 60 * 1000, async () => {
    let texto = "";
    try {
      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" },
        signal: AbortSignal.timeout(30000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
      const { text } = await extractText(pdf, { mergePages: true });
      texto = String(text || "").replace(/\s+/g, " ").trim();
    } catch (err: any) {
      return { disponible: false, motivo: `No se pudo leer el PDF oficial: ${err?.message || err}`, fuente: url.toString() };
    }
    if (texto.length < 80) {
      return { disponible: false, motivo: "El PDF no tiene texto legible (posiblemente escaneado).", fuente: url.toString() };
    }

    const prompt = `Eres analista de finanzas públicas. Abajo está el TEXTO COMPLETO de un Informe Financiero oficial de la DIPRES (Chile).
Resume SOLO lo que dice el texto; no agregues cifras, supuestos ni conclusiones que no estén escritas.

Responde ÚNICAMENTE con JSON válido con este esquema:
{"descripcion": "qué propone el proyecto, 1-2 frases", "efectoFiscal": "efecto fiscal tal como lo indica el informe (mayor gasto, menor ingreso, sin efecto fiscal, etc.)", "montos": ["cifras textuales con unidad y período, ej. 'M$ 1.234.567 en 2027'"], "financiamiento": "cómo se financia según el informe, o '' si no lo dice"}

TEXTO:
${texto.slice(0, 14000)}`;

    try {
      const salida = await generarContenidoUniversalIA(prompt, 900);
      const json = salida ? safeJsonParse<any>(salida) : null;
      if (json && (json.descripcion || json.efectoFiscal)) {
        return {
          disponible: true,
          descripcion: String(json.descripcion || ""),
          efectoFiscal: String(json.efectoFiscal || ""),
          montos: Array.isArray(json.montos) ? json.montos.map(String).slice(0, 8) : [],
          financiamiento: String(json.financiamiento || ""),
          fuente: url.toString()
        };
      }
    } catch { /* se entrega el extracto literal */ }
    return { disponible: true, extracto: texto.slice(0, 900), fuente: url.toString() };
  });
}
