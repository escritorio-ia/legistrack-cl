/**
 * Conectores a fuentes OFICIALES de legislación extranjera (sin IA para elegir ni describir normas):
 *  - Unión Europea: Oficina de Publicaciones (Cellar), endpoint SPARQL público; texto vía Cellar.
 *  - España: AEBOE, API de datos abiertos "legislación consolidada".
 *  - Reino Unido: legislation.gov.uk (Atom feed de búsqueda y CLML).
 *
 * Regla: si una fuente falla o no devuelve nada, se informa "no disponible" / "sin resultados";
 * NUNCA se sustituye por una norma generada por un modelo. La única intervención de IA es la
 * traducción de la palabra de consulta al inglés para legislation.gov.uk (se informa en el estado).
 *
 * Congress.gov (EE. UU.) NO está integrado: exige clave y su documentación no muestra búsqueda por tema.
 */
import { createHash } from "node:crypto";
import indiceNoruega from "../data/indices/noruega.json";
import indiceArgentina from "../data/indices/argentina.json";
import indiceCroacia from "../data/indices/croacia.json";
import { inflateRawSync } from "node:zlib";
import { generarContenidoUniversalIA } from "./aiService";
import { cache } from "./cacheService";

export const PAISES_OFICIALES = new Set(["España", "Unión Europea", "Reino Unido", "Australia", "Países Bajos", "Japón", "Suiza", "Luxemburgo", "Polonia", "Suecia", "Alemania", "Francia", "Estados Unidos", "Italia", "Austria", "Finlandia", "Brasil", "Irlanda", "Corea del Sur", "Estonia", "Canadá", "Dinamarca", "Israel", "Taiwán", "Noruega", "Argentina", "Croacia"]);
// Uruguay NO está en la lista: su fuente oficial (IMPO) solo responde con número y año de ley, así que para
// búsquedas por tema se mantienen las propuestas de IA (etiquetadas y con enlace verificado).

export type EstadoFuente = "ok" | "sin_resultados" | "no_disponible";

export interface NormaOficial {
  pais: string;
  fuente: string;
  titulo: string;
  fecha?: string;
  url: string;
  descripcion: string;
  idOficial: string;
  /** Rango o tipo informado por la propia fuente (no inferido). */
  tipoOficial?: string;
  origen: "oficial";
  consultadoEl: string;
}

export interface EstadoFuenteOficial {
  jurisdiccion: string;
  fuente: string;
  estado: EstadoFuente;
  motivo?: string;
  consultadoEl: string;
  consultaUsada?: string;
}

export interface Proveniencia {
  fuente: string;
  urlSolicitada: string;
  urlFinal?: string;
  estadoHttp: number;
  contentType: string;
  bytes: number;
  sha256: string;
  consultadoEl: string;
}

const UA = "Mozilla/5.0 (compatible; LegisTrackCL/1.0; verificador de fuentes oficiales)";

async function descargar(url: string, headers: Record<string, string>, ms: number) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, redirect: "follow", signal: AbortSignal.timeout(ms) });
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    status: res.status,
    contentType: res.headers.get("content-type") || "",
    finalUrl: res.url && res.url !== url ? res.url : undefined,
    buf,
    sha256: createHash("sha256").update(buf).digest("hex"),
  };
}

const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decodificar(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
}
function xmlATexto(s: string): string {
  return decodificar(s.replace(/<\/(p|bloque|P1|P2|Title|Number)>/g, "\n").replace(/<[^>]+>/g, " "))
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

const STOP = new Set(["de", "la", "el", "los", "las", "del", "para", "con", "por", "que", "una", "uno", "sobre", "en", "como", "sus", "este", "esta"]);
export function terminosDeConsulta(q: string): string[] {
  return Array.from(new Set((q.toLowerCase().match(/[\p{L}\d]+/gu) || []).filter((w) => w.length >= 4 && !STOP.has(w)))).slice(0, 5);
}

function fechaISO(d?: string): string | undefined {
  if (!d) return undefined;
  const m = d.match(/^(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : d;
}

// ---------------------------------------------------------------------------
// Unión Europea (Cellar, SPARQL)
// ---------------------------------------------------------------------------
const CELLAR_SPARQL = "https://publications.europa.eu/webapi/rdf/sparql";

async function buscarUE(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Unión Europea", fuente: "Oficina de Publicaciones de la UE — Cellar (SPARQL)", consultadoEl: ahora };
  const ts = terminosDeConsulta(q);
  if (ts.length === 0) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };

  const consultar = async (cond: string) => {
    const sparql = `PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
SELECT DISTINCT ?celex ?title ?date WHERE {
 ?e cdm:expression_title ?title .
 ?title bif:contains "${cond}" .
 ?e cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/SPA> .
 ?e cdm:expression_belongs_to_work ?w .
 ?w cdm:resource_legal_id_celex ?celex .
 ?w cdm:work_date_document ?date .
 FILTER(STRSTARTS(STR(?celex),"3"))
} LIMIT 40`;
    const url = `${CELLAR_SPARQL}?query=${encodeURIComponent(sparql)}&format=${encodeURIComponent("application/sparql-results+json")}`;
    const r = await descargar(url, { Accept: "application/sparql-results+json" }, 25000);
    if (r.status !== 200 || !/json/i.test(r.contentType)) throw new Error(`HTTP ${r.status} (${r.contentType || "sin content-type"})`);
    const j = JSON.parse(r.buf.toString("utf8"));
    return (j?.results?.bindings || []) as any[];
  };

  try {
    const and = ts.map((t) => `'${t}'`).join(" AND ");
    // Todos los términos deben aparecer en el título; sin "plan B" por una sola palabra (traería actos poco relacionados).
    const usada = and;
    const filas = await consultar(and);
    const vistos = new Set<string>();
    const normas = filas
      .map((f) => ({ celex: String(f.celex?.value || ""), titulo: String(f.title?.value || ""), fecha: String(f.date?.value || "") }))
      .filter((f) => /^3\d{4}[LRD]\d{4}$/.test(f.celex) && f.titulo && !vistos.has(f.celex) && !!vistos.add(f.celex))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 4)
      .map<NormaOficial>((f) => ({
        pais: "Unión Europea",
        fuente: "EUR-Lex / Cellar — Oficina de Publicaciones de la UE (oficial)",
        titulo: f.titulo,
        fecha: f.fecha,
        url: `https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:${f.celex}`,
        descripcion: `Acto de la Unión Europea con CELEX ${f.celex}, fecha del documento ${f.fecha}. Metadatos tomados de Cellar; el texto se recupera al analizar la norma.`,
        idOficial: f.celex,
        tipoOficial: (({ L: "Directiva", R: "Reglamento", D: "Decisión" }) as Record<string, string>)[f.celex[5]] || undefined,
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: usada, motivo: normas.length ? undefined : "Cellar no devolvió actos legislativos para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Cellar no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// España (AEBOE, legislación consolidada)
// ---------------------------------------------------------------------------
const BOE_API = "https://www.boe.es/datosabiertos/api/legislacion-consolidada";

async function buscarEspana(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "España", fuente: "AEBOE — API de datos abiertos, legislación consolidada", consultadoEl: ahora };
  const ts = terminosDeConsulta(q);
  if (ts.length === 0) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };

  const consultar = async (cond: string) => {
    const query = JSON.stringify({ query: { query_string: { query: cond } }, sort: [{ fecha_publicacion: "desc" }] });
    const r = await descargar(`${BOE_API}?limit=25&query=${encodeURIComponent(query)}`, { Accept: "application/json" }, 15000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const j = JSON.parse(r.buf.toString("utf8"));
    const data = j?.data;
    return (Array.isArray(data) ? data : []) as any[];
  };

  try {
    // Todos los términos deben aparecer en el título. Sin "plan B" por una sola palabra: traería normas poco relacionadas.
    const usada = `titulo:(${ts.join(" and ")})`;
    const items = await consultar(usada);
    const peso = (rango: string) => (/^Ley/i.test(rango) ? 0 : /Real Decreto-ley|Real Decreto Legislativo/i.test(rango) ? 1 : 2);
    const normas = items
      .filter((i) => i?.identificador && i?.titulo)
      .sort((a, b) => peso(String(a.rango?.texto || "")) - peso(String(b.rango?.texto || "")))
      .slice(0, 4)
      .map<NormaOficial>((i) => ({
        pais: "España",
        fuente: "BOE — legislación consolidada, AEBOE (oficial; texto consolidado informativo)",
        titulo: String(i.titulo),
        fecha: fechaISO(String(i.fecha_publicacion || "")),
        url: String(i.url_html_consolidada || `https://www.boe.es/buscar/act.php?id=${i.identificador}`),
        descripcion: `${i.rango?.texto || "Norma"} · ${i.departamento?.texto || "departamento no informado"} · ámbito ${i.ambito?.texto || "no informado"} · estado de consolidación: ${i.estado_consolidacion?.texto || "no informado"}. Metadatos de la API del BOE.`,
        idOficial: String(i.identificador),
        tipoOficial: i.rango?.texto ? String(i.rango.texto) : undefined,
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: usada, motivo: normas.length ? undefined : "El BOE no devolvió normas para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `El BOE no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Traducción de la palabra de consulta (única intervención de IA; se informa en el estado).
// UNA sola llamada al modelo traduce la consulta a todos los idiomas que usan los conectores; se comparte entre
// ellos (las llamadas simultáneas se unen en una) y se guarda 24 h. Antes eran ~12 llamadas en paralelo por búsqueda.
// ---------------------------------------------------------------------------
const IDIOMAS_TRADUCCION = ["en", "nl", "ja", "fr", "pl", "sv", "de", "it", "fi", "pt", "ko", "et", "da", "he", "zh", "nb", "hr"] as const;
type ClaveIdioma = (typeof IDIOMAS_TRADUCCION)[number];
type Traducciones = Partial<Record<ClaveIdioma, string>>;
const TTL_TRADUCCION_MS = 24 * 60 * 60 * 1000;
const traduccionesEnVuelo = new Map<string, Promise<Traducciones>>();

const claveTraduccion = (q: string) => `traduccion_consulta_${q.trim().toLowerCase()}`;
const traduccionEnCache = (q: string) => cache.get<Traducciones>(claveTraduccion(q)) !== null;

function claveIdioma(idioma: string): ClaveIdioma | null {
  const i = idioma.toLowerCase();
  const tabla: Array<[string, ClaveIdioma]> = [["ingl", "en"], ["neerl", "nl"], ["japon", "ja"], ["franc", "fr"], ["polaco", "pl"], ["sueco", "sv"], ["alem", "de"], ["italiano", "it"], ["finl", "fi"], ["portug", "pt"], ["corean", "ko"], ["estonio", "et"], ["danes", "da"], ["danés", "da"], ["hebreo", "he"], ["chino", "zh"], ["norueg", "nb"], ["croat", "hr"]];
  return tabla.find(([pref]) => i.startsWith(pref))?.[1] ?? null;
}

async function pedirTraducciones(q: string): Promise<Traducciones> {
  try {
    const t = await generarContenidoUniversalIA(
      `Traduce esta materia legislativa chilena a varios idiomas para buscar en TÍTULOS de leyes. Responde SOLO con un objeto JSON (sin markdown ni explicación) con exactamente estas claves: ` +
        `"en" (inglés jurídico, 1 a 4 palabras), "nl" (neerlandés, 1 a 3 palabras), "ja" (japonés, 1 a 3 palabras), "fr" (francés, 1 a 3 palabras), ` +
        `"pl" (polaco: usa la raíz de la palabra, p. ej. "ochron" para protección), "sv" (sueco: una sola palabra o raíz), "de" (alemán, 1 a 3 palabras), "it" (italiano, 1 a 3 palabras), ` +
        `"fi" (finés: raíz de una sola palabra, p. ej. "tietosuoja"), "pt" (portugués de Brasil, 1 a 3 palabras), "ko" (coreano, 1 a 3 palabras), "et" (estonio: raíz de una sola palabra, p. ej. "isikuandme"), "da" (danés: raíz de una sola palabra, p. ej. "databeskyttelse"), "he" (hebreo: una sola palabra, p. ej. "פרטיות"), "zh" (chino tradicional de Taiwán, 2 a 6 caracteres, p. ej. "個人資料保護"), "nb" (noruego bokmål: raíz de una sola palabra, p. ej. "personopplysning"), "hr" (croata: raíz de una sola palabra, p. ej. "podatak"). Materia: ${q}`,
      500
    );
    const bruto = (t || "").match(/\{[\s\S]*\}/)?.[0];
    if (!bruto) return {};
    const obj = JSON.parse(bruto) as Record<string, unknown>;
    const out: Traducciones = {};
    for (const k of IDIOMAS_TRADUCCION) {
      const v = typeof obj[k] === "string" ? (obj[k] as string).replace(/["'\n]/g, " ").replace(/\s+/g, " ").trim() : "";
      if (v && v.length <= 60) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

async function traducciones(q: string): Promise<Traducciones> {
  const clave = claveTraduccion(q);
  const hit = cache.get<Traducciones>(clave);
  if (hit) return hit;
  let enVuelo = traduccionesEnVuelo.get(clave);
  if (!enVuelo) {
    enVuelo = pedirTraducciones(q).then((t) => {
      // Solo se guarda si llegaron todos los idiomas: una respuesta incompleta se reintenta en la próxima búsqueda.
      if (IDIOMAS_TRADUCCION.every((k) => t[k])) cache.set(clave, t, TTL_TRADUCCION_MS);
      return t;
    }).finally(() => traduccionesEnVuelo.delete(clave));
    traduccionesEnVuelo.set(clave, enVuelo);
  }
  return enVuelo;
}

/** Palabra de consulta en el idioma pedido; si la IA no la entregó se devuelve la consulta original (como antes). */
async function traducirConsulta(q: string, idioma: string): Promise<string> {
  const k = claveIdioma(idioma);
  if (!k) return q;
  return (await traducciones(q))[k] ?? q;
}

// ---------------------------------------------------------------------------
// Reino Unido (legislation.gov.uk)
// ---------------------------------------------------------------------------
async function traducirAIngles(q: string): Promise<string> {
  return traducirConsulta(q, "inglés");
}

async function buscarReinoUnido(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Reino Unido", fuente: "legislation.gov.uk (Atom feed de búsqueda)", consultadoEl: ahora };
  try {
    const ingles = await traducirAIngles(q);
    const buscar = async (campo: "title" | "text") => {
      const url = `https://www.legislation.gov.uk/search/data.feed?type=primary&${campo}=${encodeURIComponent(ingles)}&results-count=10&sort=modified`;
      // legislation.gov.uk responde 202 mientras prepara la búsqueda: se reintenta unos segundos.
      let r = await descargar(url, { Accept: "application/atom+xml" }, 15000);
      for (let i = 0; i < 3 && r.status === 202; i++) {
        await new Promise((ok) => setTimeout(ok, 1500));
        r = await descargar(url, { Accept: "application/atom+xml" }, 15000);
      }
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
      return r.buf.toString("utf8");
    };
    let usada = `title="${ingles}"`;
    let xml = await buscar("title");
    let entradas: string[] = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    let porTexto = false;
    if (entradas.length === 0) {
      porTexto = true;
      usada = `text="${ingles}"`;
      xml = await buscar("text");
      entradas = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    }
    const normas = entradas
      .map<NormaOficial | null>((e) => {
        const id = e.match(/<id>https?:\/\/www\.legislation\.gov\.uk\/id\/([a-z]+)\/(\d{4})\/(\d+)<\/id>/);
        const titulo = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
        if (!id || !titulo) return null;
        const publicado = (e.match(/<published>(\d{4}-\d{2}-\d{2})/) || [])[1];
        const resumen = (e.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1];
        return {
          pais: "Reino Unido",
          fuente: "legislation.gov.uk — The National Archives (oficial)",
          titulo: decodificar(titulo),
          fecha: publicado,
          url: `https://www.legislation.gov.uk/${id[1]}/${id[2]}/${id[3]}`,
          descripcion:
            (porTexto ? "Coincidencia en el texto de la norma, no en su título (legislation.gov.uk no ordena por relevancia). " : "") +
            (resumen ? decodificar(resumen).trim() : `Norma ${id[1]} ${id[2]}/${id[3]} publicada en legislation.gov.uk (la fuente no incluye resumen).`),
          idOficial: `${id[1]}/${id[2]}/${id[3]}`,
          tipoOficial: (e.match(/<ukm:DocumentMainType Value="([^"]+)"/) || [])[1],
          origen: "oficial",
          consultadoEl: ahora,
        };
      })
      .filter((x): x is NormaOficial => !!x)
      .slice(0, 4);
    return {
      normas,
      estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: usada + (ingles !== q ? " (palabra de consulta traducida por IA)" : ""), motivo: normas.length ? undefined : "legislation.gov.uk no devolvió leyes para esa consulta." },
    };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `legislation.gov.uk no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Australia (Federal Register of Legislation, API OData)
// ---------------------------------------------------------------------------
async function buscarAustralia(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Australia", fuente: "Federal Register of Legislation (API OData)", consultadoEl: ahora };
  try {
    const ingles = (await traducirConsulta(q, "inglés")).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    const palabras = ingles.split(" ").filter((w) => w.length >= 3).slice(0, 3);
    if (!palabras.length) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const filtro = `${palabras.map((w) => `contains(tolower(name),'${w}')`).join(" and ")} and collection eq 'Act' and isInForce eq true`;
    const url = `https://api.prod.legislation.gov.au/v1/titles?$filter=${encodeURIComponent(filtro)}&$top=50`;
    const r = await descargar(url, { Accept: "application/json" }, 15000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const items = (JSON.parse(r.buf.toString("utf8"))?.value || []) as any[];
    const normas = items
      .filter((i) => i?.id && i?.name)
      .sort((a, b) => String(b.makingDate || "").localeCompare(String(a.makingDate || "")))
      .slice(0, 4)
      .map<NormaOficial>((i) => ({
        pais: "Australia",
        fuente: "Federal Register of Legislation — Gobierno de Australia (oficial)",
        titulo: String(i.name),
        fecha: i.makingDate ? String(i.makingDate).slice(0, 10) : undefined,
        url: `https://www.legislation.gov.au/${i.id}/latest/text`,
        descripcion: `Ley federal (${i.seriesType || "Act"} n.º ${i.number ?? "?"}/${i.year ?? "?"}), estado informado por la fuente: ${i.status || "no informado"}. Metadatos del Federal Register of Legislation.`,
        idOficial: String(i.id),
        tipoOficial: i.collection ? String(i.collection) : undefined,
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `name contiene ${palabras.join(" y ")}${ingles !== q.toLowerCase() ? " (palabra de consulta traducida por IA)" : ""}`, motivo: normas.length ? undefined : "El registro no devolvió leyes vigentes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `El Federal Register no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Países Bajos (wetten.overheid.nl, SRU BWB)
// ---------------------------------------------------------------------------
async function buscarPaisesBajos(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Países Bajos", fuente: "overheid.nl — Basiswettenbestand (SRU)", consultadoEl: ahora };
  try {
    const neerl = (await traducirConsulta(q, "neerlandés")).toLowerCase().replace(/[^\p{L}\d ]/gu, " ").replace(/\s+/g, " ").trim();
    if (!neerl) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const cql = `overheidbwb.titel all "${neerl}" and dcterms.type=wet`;
    const url = `https://zoekservice.overheid.nl/sru/Search?version=1.2&operation=searchRetrieve&x-connection=BWB&query=${encodeURIComponent(cql)}&maximumRecords=30`;
    const r = await descargar(url, { Accept: "application/xml" }, 15000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const xml = r.buf.toString("utf8");
    const vistos = new Set<string>();
    const normas: NormaOficial[] = [];
    for (const rec of xml.match(/<record>[\s\S]*?<\/record>/g) || []) {
      const id = (rec.match(/<dcterms:identifier>(BWBR\d+)<\/dcterms:identifier>/) || [])[1];
      const titulo = (rec.match(/<dcterms:title>([\s\S]*?)<\/dcterms:title>/) || [])[1];
      const fin = (rec.match(/geldigheidsperiode_einddatum>([^<]+)</) || [])[1];
      if (!id || !titulo || vistos.has(id) || (fin && fin !== "9999-12-31")) continue; // solo toestand vigente
      vistos.add(id);
      const tipo = (rec.match(/<dcterms:type>([^<]+)</) || [])[1];
      normas.push({
        pais: "Países Bajos",
        fuente: "wetten.overheid.nl — Gobierno de los Países Bajos (oficial)",
        titulo: decodificar(titulo),
        fecha: (rec.match(/geldigheidsperiode_startdatum>([^<]+)</) || [])[1],
        url: `https://wetten.overheid.nl/${id}`,
        descripcion: `${tipo || "Norma"} · autoridad: ${decodificar((rec.match(/<overheid:authority>([^<]+)</) || [])[1] || "no informada")}. Metadatos del Basiswettenbestand; el título está en neerlandés.`,
        idOficial: id,
        tipoOficial: tipo,
        origen: "oficial",
        consultadoEl: ahora,
      });
      if (normas.length >= 4) break;
    }
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `${cql} (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "El BWB no devolvió leyes vigentes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `overheid.nl no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Japón (e-Gov Law API v2, Agencia Digital)
// ---------------------------------------------------------------------------
async function buscarJapon(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Japón", fuente: "e-Gov Law API v2 (Agencia Digital)", consultadoEl: ahora };
  try {
    const jp = (await traducirConsulta(q, "japonés")).replace(/\s+/g, "").trim();
    if (!jp || !/[぀-ヿ一-鿿]/.test(jp)) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "No se pudo obtener un término de búsqueda en japonés." } };
    const url = `https://laws.e-gov.go.jp/api/2/laws?law_title=${encodeURIComponent(jp)}&law_type=Act&repeal_status=None&limit=4`;
    const r = await descargar(url, { Accept: "application/json" }, 15000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const items = (JSON.parse(r.buf.toString("utf8"))?.laws || []) as any[];
    const normas = items
      .filter((l) => l?.law_info?.law_id && l?.revision_info?.law_title)
      .map<NormaOficial>((l) => ({
        pais: "Japón",
        fuente: "e-Gov Law API v2 — Gobierno de Japón (oficial)",
        titulo: String(l.revision_info.law_title),
        fecha: l.law_info.promulgation_date,
        url: `https://laws.e-gov.go.jp/law/${l.law_info.law_id}`,
        descripcion: `${l.law_info.law_num || "Ley"} · vigente desde ${l.revision_info.amendment_enforcement_date || "fecha no informada"} · estado: ${l.revision_info.current_revision_status || "no informado"}. Metadatos de e-Gov; el texto está en japonés.`,
        idOficial: String(l.law_info.law_id),
        tipoOficial: l.law_info.law_type,
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `law_title="${jp}" (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "e-Gov no devolvió leyes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `e-Gov no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Suiza (Fedlex, SPARQL JOLux; compilación consolidada del derecho federal)
// ---------------------------------------------------------------------------
async function buscarSuiza(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Suiza", fuente: "Fedlex — Cancillería Federal (SPARQL)", consultadoEl: ahora };
  try {
    const fr = (await traducirConsulta(q, "francés")).toLowerCase().replace(/["\\\n]/g, " ").replace(/\s+/g, " ").trim();
    if (!fr || fr.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const sparql = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?act ?title WHERE { ?act a jolux:ConsolidationAbstract ; jolux:isRealizedBy ?e . ?e jolux:language <http://publications.europa.eu/resource/authority/language/FRA> ; jolux:title ?title . FILTER(CONTAINS(LCASE(STR(?title)),"${fr}")) } LIMIT 40`;
    const r = await descargar(`https://fedlex.data.admin.ch/sparqlendpoint?query=${encodeURIComponent(sparql)}`, { Accept: "application/sparql-results+json" }, 25000);
    if (r.status !== 200 || !/json/i.test(r.contentType)) throw new Error(`HTTP ${r.status} (${r.contentType || "sin content-type"})`);
    const filas = (JSON.parse(r.buf.toString("utf8"))?.results?.bindings || []) as any[];
    const vistos = new Set<string>();
    const normas = filas
      .map((f) => ({ act: String(f.act?.value || ""), titulo: String(f.title?.value || "") }))
      .filter((f) => /^https:\/\/fedlex\.data\.admin\.ch\/eli\/cc\/[\w/]+$/.test(f.act) && f.titulo && !vistos.has(f.act) && !!vistos.add(f.act))
      .sort((a, b) => (/^loi/i.test(a.titulo) ? 0 : 1) - (/^loi/i.test(b.titulo) ? 0 : 1) || a.titulo.length - b.titulo.length)
      .slice(0, 4)
      .map<NormaOficial>((f) => {
        const eli = f.act.replace("https://fedlex.data.admin.ch/eli/cc/", "");
        return {
          pais: "Suiza",
          fuente: "Fedlex — Cancillería Federal Suiza (oficial)",
          titulo: f.titulo,
          url: `https://www.fedlex.admin.ch/eli/cc/${eli}/fr`,
          descripcion: `Acto de la compilación sistemática del derecho federal (ELI cc/${eli}). Metadatos de Fedlex; título en francés.`,
          idOficial: `cc/${eli}`,
          tipoOficial: /^loi/i.test(f.titulo) ? "Loi fédérale" : /^ordonnance/i.test(f.titulo) ? "Ordonnance" : undefined,
          origen: "oficial",
          consultadoEl: ahora,
        };
      });
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `título contiene "${fr}" (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "Fedlex no devolvió actos para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Fedlex no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Luxemburgo (Legilux, SPARQL JOLux; solo leyes: ELI /eli/etat/leg/loi/)
// ---------------------------------------------------------------------------
async function buscarLuxemburgo(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Luxemburgo", fuente: "Legilux — Journal officiel (SPARQL)", consultadoEl: ahora };
  try {
    const fr = (await traducirConsulta(q, "francés")).toLowerCase().replace(/["\\\n]/g, " ").replace(/\s+/g, " ").trim();
    if (!fr || fr.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const sparql = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?act ?title WHERE { ?act a jolux:Act ; jolux:isRealizedBy ?e . ?e jolux:title ?title . FILTER(CONTAINS(STR(?act),"/eli/etat/leg/loi/") && CONTAINS(LCASE(STR(?title)),"${fr}")) } LIMIT 40`;
    const r = await descargar(`https://data.legilux.public.lu/sparqlendpoint?query=${encodeURIComponent(sparql)}`, { Accept: "application/sparql-results+json" }, 25000);
    if (r.status !== 200 || !/json/i.test(r.contentType)) throw new Error(`HTTP ${r.status} (${r.contentType || "sin content-type"})`);
    const filas = (JSON.parse(r.buf.toString("utf8"))?.results?.bindings || []) as any[];
    const vistos = new Set<string>();
    const normas = filas
      .map((f) => ({ act: String(f.act?.value || "").replace(/^http:/, "https:"), titulo: String(f.title?.value || "").replace(/\\n/g, " ").trim() }))
      .filter((f) => /^https:\/\/data\.legilux\.public\.lu\/eli\/etat\/leg\/loi\/\d{4}\/\d{2}\/\d{2}\/[\w]+\/jo$/.test(f.act) && f.titulo && !vistos.has(f.act) && !!vistos.add(f.act))
      .map((f) => ({ ...f, fecha: (f.act.match(/\/loi\/(\d{4})\/(\d{2})\/(\d{2})\//) || []).slice(1, 4).join("-") }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 4)
      .map<NormaOficial>((f) => ({
        pais: "Luxemburgo",
        fuente: "Legilux — Journal officiel du Grand-Duché de Luxembourg (oficial)",
        titulo: f.titulo,
        fecha: f.fecha,
        url: f.act,
        descripcion: "Ley publicada en el Journal officiel (ELI). Es el acto tal como se publicó; no incluye necesariamente modificaciones posteriores. Título en francés.",
        idOficial: f.act.replace("https://data.legilux.public.lu/eli/", ""),
        tipoOficial: "Loi",
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `título contiene "${fr}" (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "Legilux no devolvió leyes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Legilux no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Polonia (Sejm, API ELI de Dziennik Ustaw / Monitor Polski)
// ---------------------------------------------------------------------------
async function buscarPolonia(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Polonia", fuente: "Sejm — API ELI (Dziennik Ustaw)", consultadoEl: ahora };
  try {
    const pl = (await traducirConsulta(q, "polaco (usa la raíz de la palabra, p. ej. 'ochron' para protección)")).toLowerCase().replace(/[^\p{L}\d ]/gu, " ").replace(/\s+/g, " ").trim();
    if (!pl || pl.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const url = `https://api.sejm.gov.pl/eli/acts/search?title=${encodeURIComponent(pl)}&type=Ustawa&limit=40`;
    const r = await descargar(url, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const items = (JSON.parse(r.buf.toString("utf8"))?.items || []) as any[];
    const normas = items
      .filter((a) => a?.ELI && a?.title && a.inForce === "IN_FORCE")
      .sort((a, b) => String(b.announcementDate || "").localeCompare(String(a.announcementDate || "")))
      .slice(0, 4)
      .map<NormaOficial>((a) => ({
        pais: "Polonia",
        fuente: "Sejm de la República de Polonia — ELI (oficial)",
        titulo: String(a.title),
        fecha: a.announcementDate,
        url: `https://api.sejm.gov.pl/eli/acts/${a.ELI}/text.html`,
        descripcion: `${a.displayAddress || a.ELI} · estado informado: ${a.status || "no informado"} · entrada en vigor: ${a.entryIntoForce || "no informada"}. Metadatos del API ELI del Sejm; texto en polaco.`,
        idOficial: String(a.ELI),
        tipoOficial: a.type,
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `title="${pl}", type=Ustawa (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "El Sejm no devolvió leyes vigentes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `El API del Sejm no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Suecia (Riksdagen, datos abiertos: Svensk författningssamling)
// ---------------------------------------------------------------------------
async function buscarSuecia(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Suecia", fuente: "Riksdagen — datos abiertos (SFS)", consultadoEl: ahora };
  try {
    const sv = (await traducirConsulta(q, "sueco")).toLowerCase().replace(/[^\p{L}\d]/gu, "").trim();
    if (!sv || sv.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const url = `https://data.riksdagen.se/dokumentlista/?doktyp=sfs&sok=${encodeURIComponent(sv)}&utformat=json&sz=40`;
    const r = await descargar(url, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const docs = (JSON.parse(r.buf.toString("utf8"))?.dokumentlista?.dokument || []) as any[];
    const normas = docs
      .filter((d) => d?.dok_id && d?.titel && String(d.titel).toLowerCase().includes(sv) && /^(lag|balk)\b/i.test(String(d.titel)))
      .sort((a, b) => String(b.datum || "").localeCompare(String(a.datum || "")))
      .slice(0, 4)
      .map<NormaOficial>((d) => ({
        pais: "Suecia",
        fuente: "Sveriges riksdag — Svensk författningssamling (oficial)",
        titulo: String(d.titel),
        fecha: d.datum || undefined,
        url: `https://data.riksdagen.se/dokument/${d.dok_id}.html`,
        descripcion: `Ley sueca ${d.beteckning || d.dok_id}${d.undertitel ? ` (${d.undertitel})` : ""} · órgano: ${d.organ || "no informado"}. Metadatos de Riksdagen; texto en sueco.`,
        idOficial: String(d.dok_id),
        tipoOficial: "Lag",
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `doktyp=sfs, "${sv}" en el título (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "Riksdagen no devolvió leyes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Riksdagen no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Alemania (Rechtsinformationen des Bundes, API de la fase de prueba)
// ---------------------------------------------------------------------------
async function buscarAlemania(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Alemania", fuente: "Rechtsinformationen des Bundes (API en fase de prueba)", consultadoEl: ahora };
  try {
    const de = (await traducirConsulta(q, "alemán")).replace(/["\n]/g, " ").replace(/\s+/g, " ").trim();
    if (!de || de.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const host = "https://testphase.rechtsinformationen.bund.de";
    const r = await descargar(`${host}/v1/legislation?searchTerm=${encodeURIComponent(de)}&size=30`, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const miembros = (JSON.parse(r.buf.toString("utf8"))?.member || []) as any[];
    const vistos = new Set<string>();
    const normas = miembros
      .map((m) => m?.item)
      .filter((i) => i?.name && i?.legislationIdentifier && i.legislationLegalForce === "InForce" && /^eli\/bund\/bgbl-1\//.test(i.legislationIdentifier))
      .filter((i) => {
        const obra = i.exampleOfWork?.legislationIdentifier || i.legislationIdentifier;
        return !vistos.has(obra) && !!vistos.add(obra);
      })
      .filter((i) => String(i.name).toLowerCase().includes(de.toLowerCase().split(" ")[0]))
      .slice(0, 4)
      .map<NormaOficial>((i) => {
        const html = (i.encoding || []).find((e: any) => e?.encodingFormat === "text/html")?.contentUrl;
        return {
          pais: "Alemania",
          fuente: "Rechtsinformationen des Bundes — Gobierno Federal alemán (oficial, fase de prueba)",
          titulo: String(i.name),
          fecha: i.exampleOfWork?.legislationDate,
          url: html ? `${host}${html}` : `${host}/v1/legislation/${i.legislationIdentifier}`,
          descripcion: `${i.abbreviation ? i.abbreviation + " · " : ""}${i.exampleOfWork?.isPartOf?.name || "Bundesgesetzblatt"} · vigente según la fuente. El portal declara estar en fase de prueba; texto en alemán.`,
          idOficial: String(i.legislationIdentifier),
          tipoOficial: "Bundesrecht",
          origen: "oficial",
          consultadoEl: ahora,
        };
      });
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `searchTerm="${de}" (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "La API no devolvió normas federales vigentes con esa palabra en el título." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `La API de Rechtsinformationen no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Francia (Légifrance vía PISTE, OAuth2 client_credentials).
// Requiere LEGIFRANCE_CLIENT_ID y LEGIFRANCE_CLIENT_SECRET en variables de entorno (nunca en el código).
// SIN VERIFICAR contra la API real: si la respuesta no tiene la forma esperada se informa "no disponible".
// ---------------------------------------------------------------------------
async function buscarFrancia(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Francia", fuente: "Légifrance — API PISTE (DILA)", consultadoEl: ahora };
  const id = process.env.LEGIFRANCE_CLIENT_ID;
  const secret = process.env.LEGIFRANCE_CLIENT_SECRET;
  if (!id || !secret) return { normas: [], estado: { ...base, estado: "no_disponible", motivo: "Credenciales de PISTE no configuradas (LEGIFRANCE_CLIENT_ID / LEGIFRANCE_CLIENT_SECRET)." } };
  try {
    const fr = (await traducirConsulta(q, "francés")).replace(/["\n]/g, " ").replace(/\s+/g, " ").trim();
    if (!fr || fr.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: `La consulta no tiene términos útiles (traducción obtenida: "${fr}").` } };
    // Las credenciales de sandbox no sirven en producción (y viceversa): LEGIFRANCE_ENV=sandbox usa los hosts de sandbox.
    const sandbox = (process.env.LEGIFRANCE_ENV || "").toLowerCase() === "sandbox";
    const hostOauth = sandbox ? "https://sandbox-oauth.piste.gouv.fr" : "https://oauth.piste.gouv.fr";
    const hostApi = sandbox ? "https://sandbox-api.piste.gouv.fr" : "https://api.piste.gouv.fr";
    const tk = await fetch(`${hostOauth}/api/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "openid" }),
      signal: AbortSignal.timeout(15000),
    });
    if (!tk.ok) throw new Error(`autenticación PISTE HTTP ${tk.status}`);
    const token = String((await tk.json())?.access_token || "");
    if (!token) throw new Error("PISTE no entregó token");
    const cuerpo = {
      fond: "LODA_DATE",
      recherche: {
        champs: [{ typeChamp: "TITLE", criteres: [{ typeRecherche: "TOUS_LES_MOTS_DANS_UN_CHAMP", valeur: fr, operateur: "ET" }], operateur: "ET" }],
        filtres: [{ facette: "NATURE", valeurs: ["LOI"] }],
        pageNumber: 1,
        pageSize: 10,
        sort: "PERTINENCE",
        operateur: "ET",
        typePagination: "DEFAUT",
      },
    };
    const res = await fetch(`${hostApi}/dila/legifrance/lf-engine-app/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", "User-Agent": UA },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`búsqueda HTTP ${res.status}`);
    const lista = ((await res.json())?.results || []) as any[];
    const normas = lista
      .map((x) => ({ t: x?.titles?.[0], nature: x?.nature, etat: x?.etat, fecha: x?.date }))
      .filter((x) => x.t?.title && (x.t?.cid || x.t?.id))
      .slice(0, 4)
      .map<NormaOficial>((x) => ({
        pais: "Francia",
        fuente: "Légifrance — Direction de l'information légale et administrative (oficial)",
        titulo: String(x.t.title),
        fecha: x.fecha ? String(x.fecha).slice(0, 10) : undefined,
        url: `https://www.legifrance.gouv.fr/loda/id/${x.t.cid || x.t.id}`,
        descripcion: `${x.nature || "Ley"} · estado informado: ${x.etat || "no informado"}. Metadatos de la API de Légifrance; título en francés.`,
        idOficial: String(x.t.cid || x.t.id),
        tipoOficial: x.nature ? String(x.nature) : undefined,
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `TITLE todos los mots "${fr}", nature=LOI (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "Légifrance no devolvió leyes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Légifrance no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Estados Unidos (Congress.gov API v3). Requiere CONGRESS_API_KEY en variables de entorno.
// La API no busca por tema: se listan las leyes promulgadas del Congreso vigente y se filtra por
// palabra en el título. SIN VERIFICAR contra la API real: si la forma no coincide, "no disponible".
// ---------------------------------------------------------------------------
async function buscarEstadosUnidos(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Estados Unidos", fuente: "Congress.gov API v3 (Library of Congress)", consultadoEl: ahora };
  const key = process.env.CONGRESS_API_KEY;
  if (!key) return { normas: [], estado: { ...base, estado: "no_disponible", motivo: "Clave de Congress.gov no configurada (CONGRESS_API_KEY)." } };
  try {
    const en = (await traducirConsulta(q, "inglés")).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    const palabras = en.split(" ").filter((w) => w.length >= 4).slice(0, 3);
    if (!palabras.length) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const congreso = Math.floor((new Date().getUTCFullYear() - 1789) / 2) + 1;
    const encontradas: any[] = [];
    for (const c of [congreso, congreso - 1]) {
      const res = await fetch(`https://api.congress.gov/v3/law/${c}?format=json&limit=250`, { headers: { "X-Api-Key": key, Accept: "application/json", "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bills = ((await res.json())?.bills || []) as any[];
      encontradas.push(...bills.filter((b) => b?.title && palabras.every((w) => String(b.title).toLowerCase().includes(w))));
    }
    const tipo: Record<string, string> = { HR: "house-bill", S: "senate-bill", HJRES: "house-joint-resolution", SJRES: "senate-joint-resolution" };
    const normas = encontradas
      .filter((b) => b.number && b.congress && tipo[String(b.type).toUpperCase()])
      .sort((a, b) => String(b.latestAction?.actionDate || "").localeCompare(String(a.latestAction?.actionDate || "")))
      .slice(0, 4)
      .map<NormaOficial>((b) => ({
        pais: "Estados Unidos",
        fuente: "Congress.gov — Library of Congress (oficial)",
        titulo: String(b.title),
        fecha: b.latestAction?.actionDate,
        url: `https://www.congress.gov/bill/${b.congress}th-congress/${tipo[String(b.type).toUpperCase()]}/${b.number}`,
        descripcion: `Ley promulgada (${b.type} ${b.number}, Congreso ${b.congress}). Última acción: ${b.latestAction?.text || "no informada"}. Metadatos de Congress.gov.`,
        idOficial: `${b.congress}-${b.type}-${b.number}`,
        tipoOficial: "Public Law",
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `leyes promulgadas de los Congresos ${congreso - 1}-${congreso} con "${palabras.join(" ")}" en el título (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "No hay leyes promulgadas recientes con esas palabras en el título." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Congress.gov no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Italia (Normattiva, API Open Data — búsqueda simple, sin clave)
// ---------------------------------------------------------------------------
async function buscarItalia(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Italia", fuente: "Normattiva — Open Data (IPZS)", consultadoEl: ahora };
  try {
    const it = (await traducirConsulta(q, "italiano")).toLowerCase().replace(/["\\\n]/g, " ").replace(/\s+/g, " ").trim();
    if (!it || it.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const res = await fetch("https://api.normattiva.it/t/normattiva.api/bff-opendata/v1/api/v1/ricerca/semplice", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": UA },
      body: JSON.stringify({ testoRicerca: it, orderType: "recente", paginazione: { paginaCorrente: 1, numeroElementiPerPagina: 40 } }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const lista = ((await res.json())?.listaAtti || []) as any[];
    const urn: Record<string, string> = { "LEGGE": "legge", "DECRETO LEGISLATIVO": "decreto.legislativo", "DECRETO-LEGGE": "decreto.legge" };
    const normas = lista
      .filter((a) => a?.titoloAtto && urn[String(a.denominazioneAtto)] && a.dataEmanazione && a.numeroProvvedimento && String(a.titoloAtto).toLowerCase().includes(it.split(" ")[0]))
      .slice(0, 4)
      .map<NormaOficial>((a) => {
        const fecha = String(a.dataEmanazione).slice(0, 10);
        return {
          pais: "Italia",
          fuente: "Normattiva — Istituto Poligrafico e Zecca dello Stato (oficial)",
          titulo: String(a.titoloAtto).replace(/^\[\s*/, "").replace(/\s*\]$/, "").replace(/\s+/g, " ").trim(),
          fecha,
          url: `https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:${urn[String(a.denominazioneAtto)]}:${fecha};${a.numeroProvvedimento}`,
          descripcion: `${a.descrizioneAtto || a.denominazioneAtto} · Gazzetta Ufficiale n.º ${a.numeroGU || "?"} del ${a.dataGU || "?"}. Metadatos de Normattiva; título en italiano. La API ordena por fecha y no por relevancia.`,
          idOficial: String(a.codiceRedazionale || `${fecha};${a.numeroProvvedimento}`),
          tipoOficial: String(a.denominazioneAtto),
          origen: "oficial",
          consultadoEl: ahora,
        };
      });
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `testoRicerca="${it}", solo leyes y decretos con la palabra en el título (palabra de consulta traducida por IA)`, motivo: normas.length ? undefined : "Normattiva no devolvió leyes con esa palabra en el título." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Normattiva no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Búsqueda conjunta. Caché POR FUENTE (6 h): una fuente caída no se guarda y se reintenta en la próxima búsqueda,
// sin repetir las que sí respondieron. Tampoco se guarda el resultado de un conector que usa la traducción cuando la
// traducción falló (un "sin resultados" causado por eso no debe quedar fijo).
// ---------------------------------------------------------------------------
const TTL_FUENTE_MS = 6 * 60 * 60 * 1000;
type ResultadoFuente = { normas: NormaOficial[]; estado: EstadoFuenteOficial };

// ---------------------------------------------------------------------------
// Austria (RIS — Rechtsinformationssystem des Bundes, API OGD v2.6)
// ---------------------------------------------------------------------------
export async function buscarAustria(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Austria", fuente: "RIS — Rechtsinformationssystem des Bundes (OGD)", consultadoEl: ahora };
  try {
    const de = (await traducirConsulta(q, "alemán")).trim();
    if (!de) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const hoy = ahora.slice(0, 10);
    const url = `https://data.bka.gv.at/ris/api/v2.6/Bundesrecht?Applikation=BrKons&Titel=${encodeURIComponent(de)}&FassungVom=${hoy}&DokumenteProSeite=Fifty`;
    const r = await descargar(url, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const res = JSON.parse(r.buf.toString("utf8"))?.OgdSearchResult;
    if (res?.Error) throw new Error(String(res.Error?.Message || "error de la API"));
    const refs = ([] as any[]).concat(res?.OgdDocumentResults?.OgdDocumentReference || []);
    // La API devuelve un resultado por artículo (§): se agrupa por número de ley.
    const vistas = new Set<string>();
    const normas: NormaOficial[] = [];
    for (const x of refs) {
      const b = x?.Data?.Metadaten?.Bundesrecht;
      const k = b?.BrKons?.Gesetzesnummer;
      if (!b || !k || vistas.has(k)) continue;
      vistas.add(k);
      const titulo = String(b.Kurztitel || b.Titel || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (!titulo) continue;
      const typ = String(b.BrKons.Typ || "").trim();
      normas.push({
        pais: "Austria",
        fuente: "RIS — Bundeskanzleramt (oficial)",
        titulo,
        fecha: b.BrKons.Inkrafttretensdatum || undefined,
        url: `https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=${encodeURIComponent(k)}`,
        descripcion: `Norma federal austriaca vigente al ${hoy}${b.BrKons.StammnormBgblnummer ? ` · ${b.BrKons.StammnormPublikationsorgan || "BGBl."} ${b.BrKons.StammnormBgblnummer}` : ""}. Metadatos del RIS; texto en alemán.`,
        idOficial: String(k),
        tipoOficial: typ === "BG" ? "Bundesgesetz" : typ === "V" ? "Verordnung" : typ || undefined,
        origen: "oficial",
        consultadoEl: ahora,
      });
    }
    normas.sort((a, b) => Number(b.tipoOficial === "Bundesgesetz") - Number(a.tipoOficial === "Bundesgesetz"));
    const top = normas.slice(0, 4);
    return { normas: top, estado: { ...base, estado: top.length ? "ok" : "sin_resultados", consultaUsada: `"${de}" en el título, versión vigente (palabra traducida por IA)`, motivo: top.length ? undefined : "El RIS no devolvió normas vigentes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `El RIS no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Finlandia (Finlex — avoin data API, Akoma Ntoso)
// ---------------------------------------------------------------------------
const FINLEX = "https://opendata.finlex.fi/finlex/avoindata/v1";
export async function buscarFinlandia(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Finlandia", fuente: "Finlex — avoin data (Ministerio de Justicia)", consultadoEl: ahora };
  try {
    const fi = (await traducirConsulta(q, "finlandés")).toLowerCase().trim();
    if (!fi || fi.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const r = await descargar(`${FINLEX}/akn/fi/act/statute-consolidated/list?format=json&page=1&limit=6&langAndVersion=fin@&titleContains=${encodeURIComponent(fi)}`, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const lista = (JSON.parse(r.buf.toString("utf8")) || []) as any[];
    // La lista solo trae el identificador: el título y la fecha se leen del documento oficial (Akoma Ntoso).
    const docs = await Promise.all(lista.slice(0, 4).map(async (it) => {
      const uri = String(it?.akn_uri || "");
      const m = uri.match(/statute-consolidated\/(\d{4})\/([\w-]+)\//);
      if (!m || !uri.startsWith(FINLEX)) return null;
      try {
        const d = await descargar(uri, { Accept: "application/xml" }, 15000);
        if (d.status !== 200) return null;
        const xml = d.buf.toString("utf8");
        const titulo = xmlATexto(xml.match(/<(?:akn:)?docTitle[^>]*>([\s\S]*?)<\/(?:akn:)?docTitle>/)?.[1] || "");
        if (!titulo) return null;
        const fecha = xml.match(/FRBRdate[^>]*date="([^"]+)"[^>]*name="dateIssued"/)?.[1];
        const eli = xml.match(/FRBRalias[^>]*name="eli"[^>]*value="([^"]+)"/)?.[1];
        return { anio: m[1], numero: m[2], titulo, fecha, eli, uri };
      } catch { return null; }
    }));
    const normas = docs.filter(Boolean).map<NormaOficial>((d: any) => ({
      pais: "Finlandia",
      fuente: "Finlex — oikeusministeriö (oficial)",
      titulo: d.titulo,
      fecha: d.fecha || undefined,
      url: d.eli ? d.eli.replace(/^http:/, "https:") : d.uri,
      descripcion: `Norma finlandesa ${d.numero}/${d.anio}, texto consolidado (ajantasa). Metadatos de Finlex; texto en finés.`,
      idOficial: `${d.anio}/${d.numero}`,
      origen: "oficial",
      consultadoEl: ahora,
    }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${fi}" en el título, textos consolidados (palabra traducida por IA)`, motivo: normas.length ? undefined : "Finlex no devolvió normas para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Finlex no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Brasil (Câmara dos Deputados — Dados Abertos v2). Son PROYECTOS de ley, no normas vigentes.
// ---------------------------------------------------------------------------
export async function buscarBrasil(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Brasil", fuente: "Câmara dos Deputados — Dados Abertos", consultadoEl: ahora };
  try {
    const pt = (await traducirConsulta(q, "portugués")).trim();
    if (!pt) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?keywords=${encodeURIComponent(pt)}&siglaTipo=PL&itens=4&ordem=DESC&ordenarPor=id`;
    const r = await descargar(url, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const dados = (JSON.parse(r.buf.toString("utf8"))?.dados || []) as any[];
    const normas = dados.filter((d) => d?.id && d?.ementa).map<NormaOficial>((d) => ({
      pais: "Brasil",
      fuente: "Câmara dos Deputados (oficial)",
      titulo: `PL ${d.numero}/${d.ano}`,
      fecha: d.dataApresentacao ? String(d.dataApresentacao).slice(0, 10) : undefined,
      url: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${d.id}`,
      descripcion: `Proyecto de ley (no es norma vigente). Ementa: ${String(d.ementa).replace(/\s+/g, " ").trim()}`,
      idOficial: String(d.id),
      tipoOficial: "Projeto de Lei",
      origen: "oficial",
      consultadoEl: ahora,
    }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `proyectos de ley (PL) con "${pt}" (palabra traducida por IA)`, motivo: normas.length ? undefined : "La Cámara no devolvió proyectos para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `La API de la Cámara no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Brasil — leyes federales (Senado Federal, Dados Abertos: legislacao/lista).
// La API no filtra por texto: se descargan las leyes numeradas desde 1988, año por año
// (la lista completa tarda ~30 s), se guardan 24 h y se filtra por la ementa.
// ---------------------------------------------------------------------------
type LeyBrasil = { id: string; nombre: string; ementa: string; fecha?: string; apelido: string };
const TTL_LISTAS_MS = 24 * 60 * 60 * 1000;
const ANIO_INICIO_BR = 1988;
let brasilEnVuelo: Promise<LeyBrasil[]> | null = null;
async function leyesBrasil(): Promise<LeyBrasil[]> {
  const hit = cache.get<LeyBrasil[]>("brasil_leyes_federales");
  if (hit) return hit;
  if (!brasilEnVuelo) {
    brasilEnVuelo = (async () => {
      const anios: number[] = [];
      for (let a = new Date().getUTCFullYear(); a >= ANIO_INICIO_BR; a--) anios.push(a);
      const out: LeyBrasil[] = [];
      let fallos = 0;
      for (let i = 0; i < anios.length; i += 8) {
        const lote = await Promise.all(anios.slice(i, i + 8).map(async (a) => {
          try {
            const r = await descargar(`https://legis.senado.leg.br/dadosabertos/legislacao/lista?tipo=LEI&ano=${a}`, { Accept: "application/json" }, 20000);
            if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
            return ([] as any[]).concat(JSON.parse(r.buf.toString("utf8"))?.ListaDocumento?.documentos?.documento || []);
          } catch { fallos++; return []; }
        }));
        for (const d of lote.flat()) {
          if (!d?.id || !d?.ementa) continue;
          const f = String(d.dataassinatura || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          out.push({ id: String(d.id), nombre: String(d.normaNome || d.norma || "").trim(), ementa: String(d.ementa).replace(/\s+/g, " ").trim(), fecha: f ? `${f[3]}-${f[2]}-${f[1]}` : undefined, apelido: String(d.apelido || "") });
        }
      }
      if (!out.length) throw new Error("ningún año respondió");
      // Solo se guarda si respondieron todos los años: una lista incompleta no queda 24 h en caché.
      if (fallos === 0) cache.set("brasil_leyes_federales", out, TTL_LISTAS_MS);
      return out;
    })().finally(() => { brasilEnVuelo = null; });
  }
  return brasilEnVuelo;
}
const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export async function buscarBrasilLeyes(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Brasil", fuente: "Senado Federal — Dados Abertos (legislación federal)", consultadoEl: ahora };
  try {
    const pt = sinTildes(await traducirConsulta(q, "portugués"));
    const terms = pt.split(/[^\p{L}\d]+/u).filter((t) => t.length >= 4);
    if (!terms.length) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const leyes = await leyesBrasil();
    const normas = leyes
      .filter((l) => { const t = sinTildes(`${l.ementa} ${l.apelido}`); return terms.every((x) => t.includes(x)); })
      .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")))
      .slice(0, 4)
      .map<NormaOficial>((l) => ({
        pais: "Brasil",
        fuente: "Senado Federal — legislação federal (oficial)",
        titulo: l.nombre || `Lei ${l.id}`,
        fecha: l.fecha,
        url: `https://legis.senado.leg.br/norma/${l.id}`,
        descripcion: `Ley federal brasileña. Ementa: ${l.ementa}`,
        idOficial: l.id,
        tipoOficial: "Lei",
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${terms.join(" ")}" en la ementa de las leyes numeradas desde ${ANIO_INICIO_BR} (palabras traducidas por IA)`, motivo: normas.length ? undefined : "Ninguna ley federal coincide con esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `La API del Senado Federal no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Canadá (Justice Laws Website — índice oficial Legis.xml de leyes federales consolidadas)
// ---------------------------------------------------------------------------
type LeyCanada = { id: string; titulo: string; vigenteAl?: string; url: string };
let canadaEnVuelo: Promise<LeyCanada[]> | null = null;
async function leyesCanada(): Promise<LeyCanada[]> {
  const hit = cache.get<LeyCanada[]>("canada_leyes_federales");
  if (hit) return hit;
  if (!canadaEnVuelo) {
    canadaEnVuelo = (async () => {
      const r = await descargar("https://laws-lois.justice.gc.ca/eng/XML/Legis.xml", { Accept: "*/*" }, 30000) // con Accept: application/xml el sitio responde 406;
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
      const xml = r.buf.toString("utf8");
      const tag = (b: string, t: string) => decodificar((b.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || "").trim();
      const out = (xml.match(/<Act>[\s\S]*?<\/Act>/g) || [])
        .map((b) => ({ id: tag(b, "UniqueId"), titulo: tag(b, "Title"), vigenteAl: tag(b, "CurrentToDate") || undefined, url: tag(b, "LinkToHTMLToC").replace(/^http:/, "https:"), lang: tag(b, "Language") }))
        .filter((a) => a.id && a.titulo && a.url && a.lang === "eng")
        .map(({ lang, ...a }) => a);
      if (out.length) cache.set("canada_leyes_federales", out, TTL_LISTAS_MS);
      return out;
    })().finally(() => { canadaEnVuelo = null; });
  }
  return canadaEnVuelo;
}
export async function buscarCanada(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Canadá", fuente: "Justice Laws Website (Department of Justice Canada)", consultadoEl: ahora };
  try {
    const terms = (await traducirAIngles(q)).toLowerCase().split(/[^\p{L}\d]+/u).filter((t) => t.length >= 4);
    if (!terms.length) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const leyes = await leyesCanada();
    const normas = leyes.filter((l) => terms.every((t) => l.titulo.toLowerCase().includes(t))).slice(0, 4).map<NormaOficial>((l) => ({
      pais: "Canadá",
      fuente: "Justice Laws Website (oficial)",
      titulo: l.titulo,
      url: l.url,
      descripcion: `Ley federal canadiense ${l.id}, texto consolidado${l.vigenteAl ? ` actualizado al ${l.vigenteAl}` : ""}. Fecha de promulgación: no informada en el índice. Texto en inglés y francés.`,
      idOficial: l.id,
      tipoOficial: "Act",
      origen: "oficial",
      consultadoEl: ahora,
    }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${terms.join(" ")}" en el título de las ${leyes.length} leyes federales consolidadas (palabras traducidas por IA)`, motivo: normas.length ? undefined : "Ninguna ley federal consolidada coincide con esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Justice Laws no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Dinamarca (Folketinget — Åbne Data, OData). Proyectos de ley ya convertidos en ley (con lovnummer).
// ---------------------------------------------------------------------------
export async function buscarDinamarca(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Dinamarca", fuente: "Folketinget — Åbne Data (ODA)", consultadoEl: ahora };
  try {
    const da = (await traducirConsulta(q, "danés")).toLowerCase().replace(/[^\p{L}\d]/gu, "").trim();
    if (!da || da.length < 4) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const filtro = `substringof('${da}',titel) and typeid eq 3 and lovnummer ne null`;
    const url = `https://oda.ft.dk/api/Sag?$format=json&$top=4&$orderby=id%20desc&$select=id,titel,titelkort,nummer,lovnummer,lovnummerdato,retsinformationsurl&$filter=${encodeURIComponent(filtro)}`;
    const r = await descargar(url, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const casos = (JSON.parse(r.buf.toString("utf8"))?.value || []) as any[];
    const normas = casos.filter((c) => c?.id && c?.titel && c?.lovnummer).map<NormaOficial>((c) => {
      const fecha = c.lovnummerdato ? String(c.lovnummerdato).slice(0, 10) : undefined;
      const anio = fecha?.slice(0, 4);
      return {
        pais: "Dinamarca",
        fuente: "Folketinget / Retsinformation (oficial)",
        titulo: String(c.titelkort || c.titel).trim(),
        fecha,
        url: c.retsinformationsurl ? String(c.retsinformationsurl).replace(/^http:/, "https:") : anio ? `https://www.retsinformation.dk/eli/lta/${anio}/${c.lovnummer}` : `https://oda.ft.dk/api/Sag(${c.id})`,
        descripcion: `Ley danesa N° ${c.lovnummer}${fecha ? ` de ${fecha}` : ""} (proyecto ${c.nummer || "s/n"}). Título del proyecto: ${String(c.titel).trim()} Texto en danés.`,
        idOficial: `${anio || "s/a"}/${c.lovnummer}`,
        tipoOficial: "Lov",
        origen: "oficial",
        consultadoEl: ahora,
      };
    });
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `proyectos convertidos en ley con "${da}" en el título (palabra traducida por IA)`, motivo: normas.length ? undefined : "Folketinget no devolvió leyes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `La API del Folketinget no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Israel (Knesset — OData ParliamentInfo, tabla KNS_IsraelLaw: leyes del Estado de Israel)
// ---------------------------------------------------------------------------
export async function buscarIsrael(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Israel", fuente: "Knesset — Open Data (OData)", consultadoEl: ahora };
  try {
    const he = (await traducirConsulta(q, "hebreo")).replace(/['"]/g, "").trim();
    if (!he || he.length < 2) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const filtro = `substringof('${he}',Name) and LawValidityDesc eq 'תקף'`;
    const url = `https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_IsraelLaw()?$format=json&$top=4&$orderby=${encodeURIComponent("PublicationDate desc")}&$filter=${encodeURIComponent(filtro)}`;
    const r = await descargar(url, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const leyes = (JSON.parse(r.buf.toString("utf8"))?.value || []) as any[];
    const normas = leyes.filter((l) => l?.IsraelLawID && l?.Name).map<NormaOficial>((l) => ({
      pais: "Israel",
      fuente: "Knesset (oficial)",
      titulo: String(l.Name).trim(),
      fecha: l.PublicationDate ? String(l.PublicationDate).slice(0, 10) : undefined,
      url: `https://main.knesset.gov.il/apps/legislation/main/laws/${l.IsraelLawID}`,
      descripcion: `Ley israelí vigente${l.IsBasicLaw ? " (Ley Básica)" : ""}${l.LatestPublicationDate ? ` · última publicación: ${String(l.LatestPublicationDate).slice(0, 10)}` : ""}. Metadatos del Knesset; texto en hebreo.`,
      idOficial: String(l.IsraelLawID),
      tipoOficial: l.IsBasicLaw ? "Ley Básica" : "Ley",
      origen: "oficial",
      consultadoEl: ahora,
    }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `leyes vigentes con "${he}" en el nombre (palabra traducida por IA)`, motivo: normas.length ? undefined : "El Knesset no devolvió leyes vigentes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `La API del Knesset no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Taiwán (Base Nacional de Leyes, Ministerio de Justicia — API de datos abiertos).
// La API entrega todas las leyes en un ZIP (~6 MB): se descarga, se guarda 24 h y se filtra.
// ---------------------------------------------------------------------------
type LeyTaiwan = { nombre: string; nombreEn: string; url: string; nivel: string; modificada?: string; categoria: string };
/** Extrae los archivos de un ZIP (métodos 0 y 8) recorriendo los encabezados locales. */
export function leerZip(buf: Buffer): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  let p = 0;
  while (p + 30 <= buf.length && buf.readUInt32LE(p) === 0x04034b50) {
    const metodo = buf.readUInt16LE(p + 8), comp = buf.readUInt32LE(p + 18), nl = buf.readUInt16LE(p + 26), el = buf.readUInt16LE(p + 28);
    const nombre = buf.subarray(p + 30, p + 30 + nl).toString("utf8");
    const ini = p + 30 + nl + el;
    const datos = buf.subarray(ini, ini + comp);
    if (metodo === 0) out.set(nombre, Buffer.from(datos));
    else if (metodo === 8) out.set(nombre, inflateRawSync(datos));
    p = ini + comp;
  }
  return out;
}
let taiwanEnVuelo: Promise<LeyTaiwan[]> | null = null;
async function leyesTaiwan(): Promise<LeyTaiwan[]> {
  const hit = cache.get<LeyTaiwan[]>("taiwan_leyes");
  if (hit) return hit;
  if (!taiwanEnVuelo) {
    taiwanEnVuelo = (async () => {
      const r = await descargar("https://law.moj.gov.tw/api/ch/law/json", { Accept: "application/zip" }, 45000);
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
      const zip = leerZip(r.buf);
      const archivo = [...zip.entries()].find(([n]) => /\.json$/i.test(n))?.[1];
      if (!archivo) throw new Error("el ZIP no trae el JSON de leyes");
      const leyes = (JSON.parse(archivo.toString("utf8").replace(/^﻿/, ""))?.Laws || []) as any[];
      const out = leyes
        .filter((l) => l?.LawName && l?.LawURL && !String(l.LawAbandonNote || "").trim())
        .map<LeyTaiwan>((l) => ({ nombre: String(l.LawName).trim(), nombreEn: String(l.EngLawName || "").trim(), url: String(l.LawURL), nivel: String(l.LawLevel || "").trim(), modificada: /^\d{8}$/.test(l.LawModifiedDate || "") ? `${l.LawModifiedDate.slice(0, 4)}-${l.LawModifiedDate.slice(4, 6)}-${l.LawModifiedDate.slice(6, 8)}` : undefined, categoria: String(l.LawCategory || "").trim() }));
      if (out.length) cache.set("taiwan_leyes", out, TTL_LISTAS_MS);
      return out;
    })().finally(() => { taiwanEnVuelo = null; });
  }
  return taiwanEnVuelo;
}
export async function buscarTaiwan(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Taiwán", fuente: "Base Nacional de Leyes (Ministerio de Justicia)", consultadoEl: ahora };
  try {
    const [zh, en] = await Promise.all([traducirConsulta(q, "chino"), traducirAIngles(q)]);
    const zhT = zh.replace(/\s+/g, "").trim();
    const enT = en.toLowerCase().split(/[^\p{L}\d]+/u).filter((t) => t.length >= 4);
    if (!zhT && !enT.length) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const leyes = await leyesTaiwan();
    const coincide = (l: LeyTaiwan) => (zhT && zhT !== q && l.nombre.includes(zhT)) || (enT.length > 0 && enT.every((t) => l.nombreEn.toLowerCase().includes(t)));
    const normas = leyes.filter(coincide)
      .sort((a, b) => Number(b.nivel === "法律") - Number(a.nivel === "法律"))
      .slice(0, 4)
      .map<NormaOficial>((l) => ({
        pais: "Taiwán",
        fuente: "law.moj.gov.tw — Ministerio de Justicia (oficial)",
        titulo: l.nombreEn ? `${l.nombre} (${l.nombreEn})` : l.nombre,
        fecha: l.modificada,
        url: l.url,
        descripcion: `Norma vigente de Taiwán${l.nivel ? ` (${l.nivel})` : ""}${l.categoria ? ` · ${l.categoria}` : ""}. La fecha es la de su última modificación; el nombre en inglés es la traducción oficial cuando existe.`,
        idOficial: (l.url.match(/pcode=([\w]+)/) || [])[1] || l.nombre,
        tipoOficial: l.nivel || undefined,
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${zhT}" en el nombre o "${enT.join(" ")}" en el nombre oficial en inglés, entre ${leyes.length} leyes vigentes (palabras traducidas por IA)`, motivo: normas.length ? undefined : "Ninguna ley vigente coincide con esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `La API de leyes de Taiwán no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Noruega y Argentina: índices oficiales generados cada mes por .github/workflows/indices-leyes.yml
// (scripts/indices/generar-indices.mjs) desde la descarga masiva de cada fuente.
// ---------------------------------------------------------------------------
type Indice<T> = { fuente: string | null; url: string | null; generado: string | null; total: number; leyes: T[] };
const sinIndice = (i: Indice<unknown>) => !i?.generado || !Array.isArray(i.leyes) || i.leyes.length === 0;
const motivoSinIndice = "El índice oficial aún no se ha generado (ejecutar la tarea \"Indices de leyes\" en GitHub Actions).";

type LeyNoruega = { id: string; titulo: string; corto?: string; fecha?: string; ministerio?: string; ultimaModificacion?: string; url: string };
export async function buscarNoruega(q: string, indice: Indice<LeyNoruega> = indiceNoruega as Indice<LeyNoruega>): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Noruega", fuente: "Lovdata — leyes vigentes (índice mensual de datos públicos)", consultadoEl: ahora };
  if (sinIndice(indice)) return { normas: [], estado: { ...base, estado: "no_disponible", motivo: motivoSinIndice } };
  try {
    const nb = (await traducirConsulta(q, "noruego")).toLowerCase().replace(/[^\p{L}\d]/gu, "").trim();
    if (!nb || nb.length < 4) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const normas = indice.leyes.filter((l) => `${l.titulo} ${l.corto || ""}`.toLowerCase().includes(nb)).slice(0, 4).map<NormaOficial>((l) => ({
      pais: "Noruega",
      fuente: "Lovdata (oficial)",
      titulo: l.titulo,
      fecha: l.fecha,
      url: l.url,
      descripcion: `Ley noruega vigente ${l.id}${l.corto ? ` (${l.corto})` : ""}${l.ministerio ? ` · ministerio: ${l.ministerio}` : ""}${l.ultimaModificacion ? ` · última modificación en vigor: ${l.ultimaModificacion}` : ""}. Índice del ${String(indice.generado).slice(0, 10)}; texto en noruego.`,
      idOficial: l.id,
      tipoOficial: "Lov",
      origen: "oficial",
      consultadoEl: ahora,
    }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${nb}" en el título, entre ${indice.total} leyes vigentes (índice del ${String(indice.generado).slice(0, 10)}; palabra traducida por IA)`, motivo: normas.length ? undefined : "Ninguna ley vigente coincide con esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `No se pudo consultar el índice de Lovdata: ${e?.message || e}` } };
  }
}

type LeyArgentina = { id: string; numero: string; fecha?: string; titulo: string; resumen?: string; url: string };
export async function buscarArgentina(q: string, indice: Indice<LeyArgentina> = indiceArgentina as Indice<LeyArgentina>): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Argentina", fuente: "InfoLEG — normativa nacional (índice mensual de datos abiertos)", consultadoEl: ahora };
  if (sinIndice(indice)) return { normas: [], estado: { ...base, estado: "no_disponible", motivo: motivoSinIndice } };
  const terms = terminosDeConsulta(q).map(sinTildes).filter((t) => t.length >= 4);
  if (!terms.length) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
  const normas = indice.leyes.filter((l) => { const t = sinTildes(`${l.titulo} ${l.resumen || ""}`); return terms.every((x) => t.includes(x)); }).slice(0, 4).map<NormaOficial>((l) => ({
    pais: "Argentina",
    fuente: "InfoLEG — Ministerio de Justicia (oficial)",
    titulo: `Ley ${l.numero}${l.titulo ? ` — ${l.titulo}` : ""}`,
    fecha: l.fecha,
    url: l.url,
    descripcion: `${l.resumen ? `Resumen InfoLEG: ${l.resumen}` : "Resumen: no informado en la base."} Índice del ${String(indice.generado).slice(0, 10)}.`,
    idOficial: l.id,
    tipoOficial: "Ley",
    origen: "oficial",
    consultadoEl: ahora,
  }));
  return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${terms.join(" ")}" en título y resumen, entre ${indice.total} leyes (índice del ${String(indice.generado).slice(0, 10)}; sin traducción)`, motivo: normas.length ? undefined : "Ninguna ley nacional coincide con esa consulta." } };
}

type LeyCroacia = { id: string; titulo: string; tipo: string; fecha?: string; publicada?: string; url: string };
export async function buscarCroacia(q: string, indice: Indice<LeyCroacia> & { completo?: boolean; aniosDisponibles?: number[] } = indiceCroacia as any): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Croacia", fuente: "Narodne novine — leyes (índice mensual de la API ELI)", consultadoEl: ahora };
  if (sinIndice(indice)) return { normas: [], estado: { ...base, estado: "no_disponible", motivo: motivoSinIndice } };
  try {
    const hr = (await traducirConsulta(q, "croata")).toLowerCase().replace(/[^\p{L}\d]/gu, "").trim();
    if (!hr || hr.length < 4) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const normas = indice.leyes.filter((l) => l.titulo.toLowerCase().includes(hr)).slice(0, 4).map<NormaOficial>((l) => ({
      pais: "Croacia",
      fuente: "Narodne novine — Diario Oficial (oficial)",
      titulo: l.titulo,
      fecha: l.fecha,
      url: l.url,
      descripcion: `${l.tipo === "ZAKON" ? "Ley" : "Ley constitucional"} croata publicada en Narodne novine ${l.id.replace(/^(\d+)\/(\d+)\/(\d+)$/, "$2/$1 (acto $3)")}${l.publicada ? ` el ${l.publicada}` : ""}. Puede ser una ley modificatoria. Texto en croata.`,
      idOficial: l.id,
      tipoOficial: l.tipo,
      origen: "oficial",
      consultadoEl: ahora,
    }));
    const cobertura = indice.aniosDisponibles?.length === 2 ? `publicaciones ${indice.aniosDisponibles[0]}–${indice.aniosDisponibles[1]}` : "publicaciones con metadatos ELI";
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${hr}" en el título, entre ${indice.total} leyes (${cobertura}${indice.completo === false ? ", índice aún en carga" : ""}; índice del ${String(indice.generado).slice(0, 10)}; palabra traducida por IA)`, motivo: normas.length ? undefined : "Ninguna ley del índice coincide con esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `No se pudo consultar el índice de Narodne novine: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Uruguay (IMPO — Base de leyes). IMPO no tiene buscador público: solo se consulta
// una ley cuando la consulta indica su número y año (p. ej. "ley 18.331 de 2008").
// ---------------------------------------------------------------------------
export function leyUruguayEnConsulta(q: string): { numero: string; anio: string } | null {
  const m = q.match(/\bley\s*(?:n[°ºo.]*\s*)?(\d{1,2}\.?\d{3})\s*(?:de(?:l)?\s*(?:\d{1,2}\/\d{1,2}\/)?|\/|-|,)\s*(\d{4}|0\d{2}|9\d{2})\b/i);
  if (!m) return null;
  const anio = m[2].length === 4 ? m[2] : m[2].startsWith("0") ? `2${m[2]}` : `1${m[2]}`;
  return { numero: m[1].replace(".", ""), anio };
}
export async function buscarUruguay(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Uruguay", fuente: "IMPO — Base de leyes", consultadoEl: ahora };
  const ley = leyUruguayEnConsulta(q);
  if (!ley) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "IMPO no tiene buscador por tema; solo se consulta indicando número y año (p. ej. \"ley 18.331 de 2008\")." } };
  try {
    const pagina = `https://www.impo.com.uy/bases/leyes/${ley.numero}-${ley.anio}`;
    const r = await descargar(`${pagina}?json=true`, { Accept: "application/json" }, 20000);
    if (r.status === 404) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: `IMPO no tiene la ley ${ley.numero} de ${ley.anio}.` } };
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const charset = (r.contentType.match(/charset=([\w-]+)/i) || [])[1] || "utf-8";
    const cuerpo = new TextDecoder(charset.toLowerCase()).decode(r.buf);
    let j: any;
    try { j = JSON.parse(cuerpo); } catch { return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: `IMPO no tiene la ley ${ley.numero} de ${ley.anio}.` } }; }
    if (!j?.nroNorma || !j?.nombreNorma) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: `IMPO no tiene la ley ${ley.numero} de ${ley.anio}.` } };
    const f = String(j.fechaPromulgacion || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const normas: NormaOficial[] = [{
      pais: "Uruguay",
      fuente: "IMPO — Centro de Información Oficial (oficial)",
      titulo: `Ley N° ${j.nroNorma} — ${String(j.nombreNorma).trim()}`,
      fecha: f ? `${f[3]}-${f[2]}-${f[1]}` : undefined,
      url: pagina,
      descripcion: `Ley uruguaya promulgada el ${j.fechaPromulgacion || "fecha no informada"}, publicada el ${j.fechaPublicacion || "fecha no informada"}.${String(j.leyenda || "").trim() ? ` ${String(j.leyenda).trim()}.` : ""}`,
      idOficial: `${j.nroNorma}-${j.anioNorma || ley.anio}`,
      tipoOficial: String(j.tipoNorma || "Ley"),
      origen: "oficial",
      consultadoEl: ahora,
    }];
    return { normas, estado: { ...base, estado: "ok", consultaUsada: `ley ${ley.numero} de ${ley.anio} (número y año tomados de la consulta)` } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `IMPO no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Irlanda (Houses of the Oireachtas — Open Data API). La API no filtra por texto:
// se descargan las 1.000 leyes promulgadas más recientes (cache 24 h) y se filtra por título.
// ---------------------------------------------------------------------------
type LeyIrlanda = { titulo: string; actNo: string; actYear: string; fecha?: string; url: string };
const TTL_IRLANDA_MS = 24 * 60 * 60 * 1000;
let irlandaEnVuelo: Promise<LeyIrlanda[]> | null = null;
async function leyesIrlanda(): Promise<LeyIrlanda[]> {
  const hit = cache.get<LeyIrlanda[]>("irlanda_leyes_promulgadas");
  if (hit) return hit;
  if (!irlandaEnVuelo) {
    irlandaEnVuelo = (async () => {
      const r = await descargar("https://api.oireachtas.ie/v1/legislation?bill_status=Enacted&limit=1000&lang=en", { Accept: "application/json" }, 45000);
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
      const res = (JSON.parse(r.buf.toString("utf8"))?.results || []) as any[];
      const out = res.map((x) => x?.bill?.act).filter((a) => a?.shortTitleEn && a?.actNo && a?.actYear).map<LeyIrlanda>((a) => ({
        titulo: String(a.shortTitleEn).trim(), actNo: String(a.actNo), actYear: String(a.actYear), fecha: a.dateSigned || undefined,
        url: String(a.statutebookURI || a.uri || "").replace(/^http:/, "https:"),
      })).filter((a) => a.url);
      if (out.length) cache.set("irlanda_leyes_promulgadas", out, TTL_IRLANDA_MS);
      return out;
    })().finally(() => { irlandaEnVuelo = null; });
  }
  return irlandaEnVuelo;
}
export async function buscarIrlanda(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Irlanda", fuente: "Houses of the Oireachtas — Open Data", consultadoEl: ahora };
  try {
    const en = (await traducirAIngles(q)).toLowerCase();
    const terms = en.split(/[^\p{L}\d]+/u).filter((t) => t.length >= 4);
    if (!terms.length) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const leyes = await leyesIrlanda();
    const normas = leyes.filter((l) => terms.every((t) => l.titulo.toLowerCase().includes(t))).slice(0, 4).map<NormaOficial>((l) => ({
      pais: "Irlanda",
      fuente: "Oireachtas / Irish Statute Book (oficial)",
      titulo: l.titulo,
      fecha: l.fecha,
      url: l.url,
      descripcion: `Ley irlandesa N° ${l.actNo} de ${l.actYear}. Metadatos del Oireachtas; texto en inglés.`,
      idOficial: `${l.actYear}/${l.actNo}`,
      tipoOficial: "Act",
      origen: "oficial",
      consultadoEl: ahora,
    }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${terms.join(" ")}" en el título, entre las ${leyes.length} leyes promulgadas más recientes (palabras traducidas por IA)`, motivo: normas.length ? undefined : "Ninguna de las leyes recientes del Oireachtas coincide con esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `La API del Oireachtas no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Corea del Sur (law.go.kr — 국가법령정보 공동활용 Open API). Requiere el código OC
// gratuito en la variable de entorno KOREA_LAW_OC; sin ella la fuente queda "no disponible".
// ---------------------------------------------------------------------------
export async function buscarCorea(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Corea del Sur", fuente: "law.go.kr — Centro Nacional de Información Legal", consultadoEl: ahora };
  const oc = (process.env.KOREA_LAW_OC || "").trim();
  if (!oc) return { normas: [], estado: { ...base, estado: "no_disponible", motivo: "Falta configurar KOREA_LAW_OC (código gratuito de law.go.kr) en el servidor." } };
  try {
    const ko = (await traducirConsulta(q, "coreano")).trim();
    if (!ko) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const r = await descargar(`https://www.law.go.kr/DRF/lawSearch.do?OC=${encodeURIComponent(oc)}&target=law&type=JSON&display=4&query=${encodeURIComponent(ko)}`, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const j = JSON.parse(r.buf.toString("utf8"));
    if (j?.result && !j?.LawSearch) throw new Error(String(j.msg || j.result));
    const leyes = ([] as any[]).concat(j?.LawSearch?.law || []);
    const fmt = (d?: string) => (d && /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : undefined);
    const normas = leyes.filter((l) => l?.["법령명한글"]).slice(0, 4).map<NormaOficial>((l) => {
      const nombre = String(l["법령명한글"]).trim();
      return {
        pais: "Corea del Sur",
        fuente: "law.go.kr — Ministerio de Legislación (oficial)",
        titulo: nombre,
        fecha: fmt(l["공포일자"]),
        // Enlace público por nombre: el enlace de la API lleva el código OC y no se expone.
        url: `https://www.law.go.kr/법령/${encodeURIComponent(nombre)}`,
        descripcion: `Norma coreana${l["법령구분명"] ? ` (${l["법령구분명"]})` : ""}${l["소관부처명"] ? ` · ministerio: ${l["소관부처명"]}` : ""}${fmt(l["시행일자"]) ? ` · vigente desde ${fmt(l["시행일자"])}` : ""}. Texto en coreano.`,
        idOficial: String(l["법령ID"] || l["법령일련번호"] || nombre),
        tipoOficial: l["법령구분명"] || undefined,
        origen: "oficial",
        consultadoEl: ahora,
      };
    });
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `"${ko}" (palabra traducida por IA)`, motivo: normas.length ? undefined : "law.go.kr no devolvió normas para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `law.go.kr no respondió: ${e?.message || e}` } };
  }
}

// ---------------------------------------------------------------------------
// Estonia (Riigi Teataja — API de búsqueda de actos jurídicos)
// ---------------------------------------------------------------------------
export async function buscarEstonia(q: string): Promise<ResultadoFuente> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Estonia", fuente: "Riigi Teataja (Diario Oficial de Estonia)", consultadoEl: ahora };
  try {
    const et = (await traducirConsulta(q, "estonio")).toLowerCase().trim();
    if (!et || et.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
    const r = await descargar(`https://www.riigiteataja.ee/api/oigusakt_otsing/1/otsi?leht=1&limiit=40&dokument=seadus&pealkiri=${encodeURIComponent(et)}`, { Accept: "application/json" }, 20000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const j = JSON.parse(r.buf.toString("utf8"));
    if (j?.staatus && j.staatus !== "OK") throw new Error(String(j.staatus));
    // Solo versiones vigentes (sin fecha de término) y una por ley.
    const vistos = new Set<string>();
    const normas = ((j?.aktid || []) as any[])
      .filter((a) => a?.globaalID && a?.pealkiri && !a?.kehtivus?.lopp && !a?.mitteJoustunud)
      .filter((a) => { const k = String(a.pealkiri).toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true; })
      .slice(0, 4)
      .map<NormaOficial>((a) => ({
        pais: "Estonia",
        fuente: "Riigi Teataja (oficial)",
        titulo: String(a.pealkiri),
        fecha: a.kehtivus?.algus || undefined,
        url: `https://www.riigiteataja.ee/akt/${a.globaalID}`,
        descripcion: `Ley estonia vigente desde ${a.kehtivus?.algus || "fecha no informada"}${a.valjaandja ? ` · emisor: ${a.valjaandja}` : ""}. Texto en estonio.`,
        idOficial: String(a.globaalID),
        tipoOficial: a.liik || "seadus",
        origen: "oficial",
        consultadoEl: ahora,
      }));
    return { normas, estado: { ...base, estado: normas.length ? "ok" : "sin_resultados", consultaUsada: `leyes (seadus) vigentes con "${et}" en el título (palabra traducida por IA)`, motivo: normas.length ? undefined : "Riigi Teataja no devolvió leyes vigentes para esa consulta." } };
  } catch (e: any) {
    return { normas: [], estado: { ...base, estado: "no_disponible", motivo: `Riigi Teataja no respondió: ${e?.message || e}` } };
  }
}


async function conCache(clave: string, q: string, usaTraduccion: boolean, buscar: (q: string) => Promise<ResultadoFuente>): Promise<ResultadoFuente> {
  const key = `fuente_oficial_${clave}_${q.trim().toLowerCase()}`;
  const hit = cache.get<ResultadoFuente>(key);
  if (hit) return structuredClone(hit);
  const r = await buscar(q);
  if (r.estado.estado !== "no_disponible" && (!usaTraduccion || traduccionEnCache(q))) cache.set(key, structuredClone(r), TTL_FUENTE_MS);
  return r;
}

export async function buscarFuentesOficiales(q: string): Promise<{ normas: NormaOficial[]; estados: EstadoFuenteOficial[] }> {
  const partes = await Promise.all([
    conCache("ue", q, false, buscarUE),
    conCache("es", q, false, buscarEspana),
    conCache("uk", q, true, buscarReinoUnido),
    conCache("au", q, true, buscarAustralia),
    conCache("nl", q, true, buscarPaisesBajos),
    conCache("jp", q, true, buscarJapon),
    conCache("ch", q, true, buscarSuiza),
    conCache("lu", q, true, buscarLuxemburgo),
    conCache("pl", q, true, buscarPolonia),
    conCache("se", q, true, buscarSuecia),
    conCache("de", q, true, buscarAlemania),
    conCache("fr", q, true, buscarFrancia),
    conCache("us", q, true, buscarEstadosUnidos),
    conCache("it", q, true, buscarItalia),
    conCache("at", q, true, buscarAustria),
    conCache("fi", q, true, buscarFinlandia),
    conCache("br", q, true, buscarBrasil),
    conCache("ie", q, true, buscarIrlanda),
    conCache("kr", q, true, buscarCorea),
    conCache("ee", q, true, buscarEstonia),
    conCache("brl", q, true, buscarBrasilLeyes),
    conCache("ca", q, true, buscarCanada),
    conCache("dk", q, true, buscarDinamarca),
    conCache("il", q, true, buscarIsrael),
    conCache("tw", q, true, buscarTaiwan),
    conCache("no", q, true, (x) => buscarNoruega(x)),
    conCache("ar", q, false, (x) => buscarArgentina(x)),
    conCache("uy", q, false, buscarUruguay),
    conCache("hr", q, true, (x) => buscarCroacia(x)),
  ]);
  return { normas: partes.flatMap((p) => p.normas), estados: partes.map((p) => p.estado) };
}

// ---------------------------------------------------------------------------
// Recuperación de texto oficial con proveniencia (huella SHA-256 de la respuesta original)
// ---------------------------------------------------------------------------
const IDIOMA_CELLAR: Record<string, string> = { ES: "spa", EN: "eng", FR: "fra", DE: "deu", PT: "por", IT: "ita" };

export async function fetchTextoOficial(url: string): Promise<{ texto: string; proveniencia: Proveniencia } | null> {
  const consultadoEl = new Date().toISOString();
  try {
    // España: texto consolidado, última versión de cada bloque
    const boe = url.match(/boe\.es\/(?:buscar\/act\.php\?id=|datosabiertos\/api\/legislacion-consolidada\/id\/)(BOE-[A-Z]-\d{4}-\d+)/i);
    if (boe) {
      const api = `${BOE_API}/id/${boe[1]}/texto`;
      const r = await descargar(api, { Accept: "application/xml" }, 20000);
      if (r.status !== 200) return null;
      const xml = r.buf.toString("utf8");
      const bloques = xml.match(/<bloque\b[\s\S]*?<\/bloque>/g) || [];
      const partes = bloques.map((b) => {
        const versiones = b.match(/<version\b[\s\S]*?<\/version>/g) || [];
        const ultima = versiones[versiones.length - 1] || "";
        const tit = (b.match(/<bloque\b[^>]*\btitulo="([^"]*)"/) || [])[1];
        return `${tit && !/^\[/.test(tit) ? decodificar(tit) + "\n" : ""}${xmlATexto(ultima)}`;
      });
      const texto = partes.join("\n").trim();
      if (texto.length < 200) return null;
      return { texto, proveniencia: { fuente: "AEBOE — legislación consolidada (API)", urlSolicitada: api, estadoHttp: r.status, contentType: r.contentType, bytes: r.buf.length, sha256: r.sha256, consultadoEl } };
    }

    // Reino Unido: CLML
    const uk = url.match(/legislation\.gov\.uk\/(?:id\/)?([a-z]+)\/(\d{4})\/(\d+)/i);
    if (uk) {
      const api = `https://www.legislation.gov.uk/${uk[1]}/${uk[2]}/${uk[3]}/data.xml`;
      const r = await descargar(api, { Accept: "application/xml" }, 30000);
      if (r.status !== 200) return null;
      const texto = xmlATexto(r.buf.toString("utf8"));
      if (texto.length < 200) return null;
      return { texto, proveniencia: { fuente: "legislation.gov.uk — CLML", urlSolicitada: api, urlFinal: r.finalUrl, estadoHttp: r.status, contentType: r.contentType, bytes: r.buf.length, sha256: r.sha256, consultadoEl } };
    }

    // UE: Cellar a partir del CELEX
    const eur = url.match(/eur-lex\.europa\.eu\/legal-content\/([A-Za-z]{2})\/[^?]*\?uri=CELEX(?:%3A|:)(\w+)/i);
    if (eur) {
      const api = `https://publications.europa.eu/resource/celex/${eur[2]}`;
      const r = await descargar(api, { Accept: "application/xhtml+xml, text/html", "Accept-Language": IDIOMA_CELLAR[eur[1].toUpperCase()] || "eng" }, 25000);
      if (r.status !== 200) return null;
      const texto = xmlATexto(r.buf.toString("utf8").replace(/<(script|style)[\s\S]*?<\/\1>/gi, " "));
      if (texto.length < 200) return null;
      return { texto, proveniencia: { fuente: "Cellar — Oficina de Publicaciones de la UE", urlSolicitada: api, urlFinal: r.finalUrl, estadoHttp: r.status, contentType: r.contentType, bytes: r.buf.length, sha256: r.sha256, consultadoEl } };
    }
  } catch {
    return null;
  }
  return null;
}
