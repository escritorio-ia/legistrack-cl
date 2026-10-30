// Informes Financieros (IF) de proyectos de ley, desde la fuente oficial de la
// Dirección de Presupuestos (DIPRES). La página de búsqueda publica en una sola
// tabla todos los IF desde 2014 (N° de IF, materia, boletín, mensaje, estado,
// PDF, ministerio y año), así que se descarga una vez y se filtra localmente.
import { cache } from "./cacheService";
import { generarContenidoUniversalIA, safeJsonParse, AIProviderAttempt } from "./aiService";

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

/** Texto completo del PDF de un informe financiero (solo dipres.gob.cl). Caché 7 días. */
export async function textoInformeFinanciero(pdfUrl: string): Promise<string> {
  const url = new URL(pdfUrl);
  if (!/(^|\.)dipres\.gob\.cl$/i.test(url.hostname)) throw new Error("Solo se aceptan documentos de dipres.gob.cl");
  const clave = `dipres_texto_if_${url.pathname}`;
  const previo = cache.get<string>(clave);
  if (previo) return previo;
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: true });
  const texto = String(text || "").replace(/\s+/g, " ").trim();
  if (texto.length > 80) cache.set(clave, texto, 7 * 24 * 60 * 60 * 1000);
  return texto;
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
      texto = await textoInformeFinanciero(url.toString());
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

// ---------------------------------------------------------------------------
// Resumen consolidado (~500 palabras) de todos los informes financieros de un
// boletín: cuántos hay, a qué etapa corresponde cada uno, qué medidas costean,
// cómo evoluciona el efecto fiscal y cómo se financia. Solo con el texto oficial.
// ---------------------------------------------------------------------------
export interface ResumenConsolidadoIF {
  disponible: boolean;
  motivo?: string;
  total?: number;
  resumen?: string;
  filas?: { numero: string; anio: string; estado: string; materia: string; pdf: string; etapa: string; efectoFiscal: string }[];
  leidos?: number;
  generado?: string;
}

const ordenIF = (n: string) => { const [num, anio] = n.split("-").map(x => parseInt(x, 10) || 0); return anio * 10000 + num; };

export async function resumenConsolidadoInformesFinancieros(boletin: string): Promise<ResumenConsolidadoIF> {
  const informes = (await informesFinancierosDeBoletin(boletin)).sort((a, b) => ordenIF(a.numero) - ordenIF(b.numero));
  if (informes.length === 0) return { disponible: false, motivo: "La DIPRES no registra informes financieros para este boletín.", total: 0 };

  const clave = `dipres_consolidado_${claveBoletinIF(boletin)}_${informes.map(i => i.numero).join(",")}`;
  const previo = cache.get<ResumenConsolidadoIF>(clave);
  if (previo) return previo;

  // Cada informe aporta su texto; se reparte el espacio para que quepan todos.
  const porInforme = Math.max(2500, Math.floor(26000 / informes.length));
  const bloques: string[] = [];
  let leidos = 0;
  for (const inf of informes) {
    let texto = "";
    try { texto = inf.pdf ? await textoInformeFinanciero(inf.pdf) : ""; } catch { texto = ""; }
    if (texto) leidos++;
    bloques.push(`=== IF N° ${inf.numero} (año ${inf.anio}; estado: ${inf.estado}; mensaje ${inf.mensaje || "s/n"}) ===
Materia: ${inf.materia}
${texto ? `Texto: ${texto.slice(0, porInforme)}` : "(No se pudo leer el PDF; usa solo la materia.)"}`);
  }

  const prompt = `Eres analista de finanzas públicas de la Biblioteca del Congreso Nacional de Chile. Abajo están, en orden cronológico, los ${informes.length} Informes Financieros (IF) oficiales de la DIPRES asociados al proyecto de ley Boletín ${boletin}.

${bloques.join("\n\n")}

Redacta un RESUMEN CONSOLIDADO de aproximadamente 500 palabras (entre 420 y 560), en prosa formal en español, en 4 a 6 párrafos, que cubra:
1. Cuántos informes financieros se han presentado y a qué corresponde cada uno (proyecto original / mensaje, indicaciones, etapa o comisión si el texto lo indica).
2. Qué medidas o disposiciones del proyecto costea cada informe.
3. El efecto fiscal de cada uno y cómo evoluciona entre informes (mayor o menor gasto, montos con su unidad y año, régimen permanente vs. transitorio), comparando explícitamente los cambios.
4. Cómo se financia el mayor gasto, según los informes.
5. Observaciones relevantes que los propios informes señalen (supuestos, gradualidad, efectos en otros organismos).
Reglas: usa SOLO lo que dicen los textos; no inventes cifras; cita los números de IF al referirte a cada uno; si un informe dice que no irroga mayor gasto, dilo.

Responde en TEXTO PLANO con exactamente este formato (sin JSON, sin markdown):
RESUMEN:
(el resumen de ~500 palabras, con párrafos separados por una línea en blanco)
TABLA:
N° del IF | a qué corresponde, breve | efecto fiscal en una frase con su monto si existe
(una línea por informe)`;

  const intentos: AIProviderAttempt[] = [];
  let resp: string | null = null;
  try { resp = await generarContenidoUniversalIA(prompt, 6000, intentos); } catch { resp = null; }
  const texto = String(resp || "").replace(/\r/g, "");
  const iRes = texto.search(/RESUMEN:\s*/i);
  const iTab = texto.search(/\n\s*TABLA:\s*/i);
  const resumen = (iRes >= 0 ? texto.slice(iRes, iTab > iRes ? iTab : undefined).replace(/^RESUMEN:\s*/i, "") : texto).replace(/[*#]+/g, "").trim();
  const j: any = { resumen: resumen.split(/\s+/).length >= 150 ? resumen : "", filas: [] as any[] };
  if (iTab >= 0) {
    for (const linea of texto.slice(iTab).split("\n").slice(1)) {
      const partes = linea.split("|").map(x => x.trim());
      if (partes.length >= 3 && /\d+-\d{4}/.test(partes[0])) j.filas.push({ numero: partes[0], etapa: partes[1], efectoFiscal: partes.slice(2).join(" | ") });
    }
  }
  if (!j.resumen) {
    const det = intentos.filter(i => i.configured && i.error).map(i => `${i.provider}: ${String(i.error).slice(0, 80)}`).join(" | ");
    return { disponible: false, motivo: `No fue posible generar el resumen con IA en este momento.${det ? ` Detalle: ${det}` : texto ? " La respuesta de la IA vino incompleta." : ""}`, total: informes.length };
  }
  const filasIA: any[] = Array.isArray(j.filas) ? j.filas : [];
  const r: ResumenConsolidadoIF = {
    disponible: true,
    total: informes.length,
    leidos,
    resumen: String(j.resumen).trim(),
    filas: informes.map(inf => {
      const f = filasIA.find(x => String(x?.numero || "").includes(inf.numero)) || {};
      return { numero: inf.numero, anio: inf.anio, estado: inf.estado, materia: inf.materia, pdf: inf.pdf, etapa: String(f.etapa || ""), efectoFiscal: String(f.efectoFiscal || "") };
    }),
    generado: new Date().toISOString()
  };
  cache.set(clave, r, 7 * 24 * 60 * 60 * 1000);
  return r;
}
