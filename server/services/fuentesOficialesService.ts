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
import { generarContenidoUniversalIA } from "./aiService";
import { cache } from "./cacheService";

export const PAISES_OFICIALES = new Set(["España", "Unión Europea", "Reino Unido", "Australia", "Países Bajos", "Japón", "Suiza", "Luxemburgo", "Polonia", "Suecia", "Alemania", "Francia", "Estados Unidos"]);

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
// Reino Unido (legislation.gov.uk)
// ---------------------------------------------------------------------------
async function traducirAIngles(q: string): Promise<string> {
  try {
    const t = await generarContenidoUniversalIA(
      `Traduce al inglés jurídico británico esta materia legislativa para buscar en títulos de leyes. Responde SOLO con 1 a 4 palabras, sin comillas ni explicación: ${q}`,
      40
    );
    const limpio = (t || "").replace(/["'\n]/g, " ").replace(/\s+/g, " ").trim();
    return limpio && limpio.length <= 60 ? limpio : q;
  } catch {
    return q;
  }
}

async function buscarReinoUnido(q: string): Promise<{ normas: NormaOficial[]; estado: EstadoFuenteOficial }> {
  const ahora = new Date().toISOString();
  const base = { jurisdiccion: "Reino Unido", fuente: "legislation.gov.uk (Atom feed de búsqueda)", consultadoEl: ahora };
  try {
    const ingles = await traducirAIngles(q);
    const buscar = async (campo: "title" | "text") => {
      const url = `https://www.legislation.gov.uk/search/data.feed?type=primary&${campo}=${encodeURIComponent(ingles)}&results-count=10&sort=modified`;
      const r = await descargar(url, { Accept: "application/atom+xml" }, 15000);
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
// Traducción de la palabra de consulta (única intervención de IA; se informa en el estado)
// ---------------------------------------------------------------------------
async function traducirConsulta(q: string, idioma: string): Promise<string> {
  try {
    const t = await generarContenidoUniversalIA(
      `Traduce al ${idioma} jurídico esta materia legislativa para buscar en títulos de leyes. Responde SOLO con 1 a 3 palabras en ${idioma}, sin comillas ni explicación: ${q}`,
      40
    );
    const limpio = (t || "").replace(/["'\n]/g, " ").replace(/\s+/g, " ").trim();
    return limpio && limpio.length <= 40 ? limpio : q;
  } catch {
    return q;
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
    const url = `https://api.prod.legislation.gov.au/v1/titles?$filter=${encodeURIComponent(filtro)}&$orderby=${encodeURIComponent("makingDate desc")}&$top=4`;
    const r = await descargar(url, { Accept: "application/json" }, 15000);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const items = (JSON.parse(r.buf.toString("utf8"))?.value || []) as any[];
    const normas = items
      .filter((i) => i?.id && i?.name)
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
    if (!fr || fr.length < 3) return { normas: [], estado: { ...base, estado: "sin_resultados", motivo: "La consulta no tiene términos útiles." } };
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
// Búsqueda conjunta (con caché de 6 h solo si ninguna fuente falló)
// ---------------------------------------------------------------------------
export async function buscarFuentesOficiales(q: string): Promise<{ normas: NormaOficial[]; estados: EstadoFuenteOficial[] }> {
  const key = `fuentes_oficiales_${q.trim().toLowerCase()}`;
  const hit = cache.get<{ normas: NormaOficial[]; estados: EstadoFuenteOficial[] }>(key);
  if (hit) return hit;
  const partes = await Promise.all([buscarUE(q), buscarEspana(q), buscarReinoUnido(q), buscarAustralia(q), buscarPaisesBajos(q), buscarJapon(q), buscarSuiza(q), buscarLuxemburgo(q), buscarPolonia(q), buscarSuecia(q), buscarAlemania(q), buscarFrancia(q), buscarEstadosUnidos(q)]);
  const out = { normas: partes.flatMap((p) => p.normas), estados: partes.map((p) => p.estado) };
  if (out.estados.every((e) => e.estado !== "no_disponible")) cache.set(key, out, 6 * 60 * 60 * 1000);
  return out;
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
