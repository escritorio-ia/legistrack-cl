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

export const PAISES_OFICIALES = new Set(["España", "Unión Europea", "Reino Unido"]);

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
// Búsqueda conjunta (con caché de 6 h solo si ninguna fuente falló)
// ---------------------------------------------------------------------------
export async function buscarFuentesOficiales(q: string): Promise<{ normas: NormaOficial[]; estados: EstadoFuenteOficial[] }> {
  const key = `fuentes_oficiales_${q.trim().toLowerCase()}`;
  const hit = cache.get<{ normas: NormaOficial[]; estados: EstadoFuenteOficial[] }>(key);
  if (hit) return hit;
  const partes = await Promise.all([buscarUE(q), buscarEspana(q), buscarReinoUnido(q)]);
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
