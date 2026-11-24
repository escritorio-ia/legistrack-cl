/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generarContenidoUniversalIA, safeJsonParse, AIProviderAttempt } from "./aiService";
import { cache } from "./cacheService";
import { urlPermitida, validarEnlaces, type EstadoEnlace } from "./cruceBoletinService";
import { buscarFuentesOficiales, fetchTextoOficial, PAISES_OFICIALES, type EstadoFuenteOficial, type Proveniencia } from "./fuentesOficialesService";

// La clave de LeyChile se lee SOLO desde la variable de entorno (nunca en el código).
export const LEYCHILE_API_KEY = process.env.LEYCHILE_API_KEY || "";

export interface ResultadoComparado {
  pais: string;
  fuente: string;
  titulo: string;
  tituloOriginal?: string;
  fecha?: string;
  url?: string;
  descripcion?: string;
  tipo?: string;
  relevancia?: number;
  /** oficial = devuelta por la API de la fuente; ia = propuesta por un modelo, sin verificar. */
  origen?: "oficial" | "ia";
  /** Identificador de la propia fuente (CELEX, BOE-A-…, ukpga/2018/12, idNorma). */
  idOficial?: string;
  consultadoEl?: string;
  /** Solo normas no oficiales: resultado de visitar el enlace. ok = respondió; bloqueado/no_verificable = el sitio no permite comprobarlo. */
  verificacionEnlace?: "ok" | "bloqueado" | "no_verificable";
}

export interface NormaDescartada {
  pais: string;
  titulo: string;
  url?: string;
  motivo: string;
}

/** La URL apunta a la portada de un portal (no a una norma concreta). */
export function esInicioDePortal(url: string): boolean {
  try {
    const u = new URL(url);
    return !u.search && (u.pathname === "/" || u.pathname === "" || /^\/(index\.[a-z]+|[a-z]{2})\/?$/i.test(u.pathname));
  } catch {
    return true;
  }
}

export const CODIGO_PAIS: Record<string, string> = {
  "Chile": "CL",
  "España": "ES",
  "Unión Europea": "EU",
  "Estados Unidos": "US",
  "Brasil": "BR",
  "Argentina": "AR",
  "Uruguay": "UY",
  "Colombia": "CO",
  "México": "MX",
  "Perú": "PE",
  "Panamá": "PA",
  "Reino Unido": "GB",
  "Francia": "FR",
  "Alemania": "DE",
  "Italia": "IT",
  "Portugal": "PT",
  "Canadá": "CA",
  "Australia": "AU",
  "Nueva Zelanda": "NZ",
  "Suiza": "CH",
  "Suecia": "SE",
  "Finlandia": "FI",
  "Noruega": "NO",
  "Dinamarca": "DK",
  "Países Bajos": "NL",
  "Irlanda": "IE",
  "Polonia": "PL",
  "Japón": "JP",
  "Luxemburgo": "LU"
};

// Portales oficiales de datos/APIs gubernamentales verificados para países
// UE/OCDE, curados a partir del catálogo "API-cases" del estudio APIs4DGov
// del Joint Research Centre de la Comisión Europea (data.europa.eu, dataset
// 45ca8d82-ac31-4360-b3a1-ba43b0b07377, CC-BY-4.0). Solo se incluyó un
// portal nacional "de propósito general" por país cuando el catálogo lo
// documentaba (se excluyeron las entradas que solo cubrían geodatos, para
// no dar una falsa impresión de que sirven para buscar texto legal). Se usan
// como referencia REAL y verificada para que la IA no tenga que adivinar el
// dominio oficial de cada país al construir sus resultados -- no reemplazan
// LeyChile/EUR-Lex/BOE como fuente de texto legal en sí.
export const PORTALES_DATOS_ABIERTOS_REFERENCIA: Record<string, { nombre: string; url: string }> = {
  "España": { nombre: "datos.gob.es — Catálogo Nacional de Datos Abiertos de España", url: "https://datos.gob.es" },
  "Reino Unido": { nombre: "CKAN API del Gobierno del Reino Unido (data.gov.uk)", url: "https://ckan.publishing.service.gov.uk/api/3/action/package_list" },
  "Francia": { nombre: "api.gouv.fr — Catálogo Nacional de APIs de Francia", url: "https://api.gouv.fr/" },
  "Alemania": { nombre: "offenedaten.de — Catálogo de Datos Abiertos de Alemania", url: "https://offenedaten.de/" },
  "Italia": { nombre: "dati.gov.it — Catálogo Nacional de Datos Abiertos de Italia", url: "https://www.dati.gov.it/api/3/action/package_list" },
  "Países Bajos": { nombre: "data.overheid.nl — Catálogo de Datos Abiertos de los Países Bajos", url: "https://data.overheid.nl" },
  "Irlanda": { nombre: "data.gov.ie — Catálogo Nacional de Datos Abiertos de Irlanda", url: "https://data.gov.ie/api/3/action/package_list" },
  "Suecia": { nombre: "data.riksdagen.se — API oficial del Parlamento sueco (documentos, leyes y votaciones)", url: "https://data.riksdagen.se/data/dokument/" },
  "Finlandia": { nombre: "avoindata.fi — Catálogo Nacional de Datos Abiertos de Finlandia", url: "https://www.avoindata.fi/data/en_GB/api/3" },
  "Noruega": { nombre: "fellesdatakatalog.brreg.no — Catálogo Nacional de APIs de Noruega", url: "https://fellesdatakatalog.brreg.no/apis" },
  "Dinamarca": { nombre: "datafordeler.dk — Catálogo de Datos de Dinamarca", url: "https://datafordeler.dk/dataoversigt/" }
};

export function normalizarTexto(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const SINONIMOS_MATERIA: Record<string, string[]> = {
  "inteligencia artificial": ["ia", "ai", "algoritmo", "datos personales", "algorítmico", "deep learning", "machine learning", "modelos fundacionales"],
  "hidrogeno verde": ["hidrogeno", "gases renovables", "electrolisis", "vectores energeticos", "combustibles limpios", "transicion energetica"],
  "neuroderechos": ["neurotecnologia", "privacidad cerebral", "derechos digitales", "integridad mental", "datos neuronales"],
  "teletrabajo": ["trabajo a distancia", "home office", "desconexion digital", "jornada laboral", "remoto"],
  "40 horas": ["jornada laboral", "tiempo de trabajo", "reducción de jornada", "código del trabajo", "descanso laboral"],
  "pensiones": ["seguridad social", "jubilación", "fondos de pensiones", "retiro", "vejez", "previsión social"],
  "ciberseguridad": ["seguridad de la información", "ciberdefensa", "delitos informáticos", "infraestructura crítica", "anci", "csirt"],
  "pesca": ["acuicultura", "recursos hidrobiológicos", "zonas de pesca", "cuotas pesqueras", "marítimo"],
  "salud": ["fármacos", "medicamentos", "sistema sanitario", "isapre", "fonasa", "hospitales"],
  "medio ambiente": ["cambio climático", "emisiones", "glaciares", "biodiversidad", "residuos", "evaluación ambiental"],
  "criptoactivos": ["criptomonedas", "bitcoin", "blockchain", "fintech", "activos digitales", "tokens"],
  "eutanasia": ["muerte digna", "cuidados paliativos", "suicidio asistido", "voluntades anticipadas"]
};

/**
 * Taxonomía estándar de tipos de norma usada en toda la sección de Derecho
 * Comparado: Ley | Reglamento | Jurisprudencia | Administrativo | Documento.
 * Cualquier variante más específica (ordenanza, directiva, decreto, etc.) se
 * mapea a una de estas 5 categorías para que el filtro de la UI sea consistente.
 */
export const TIPOS_NORMA = ["Ley", "Reglamento", "Jurisprudencia", "Administrativo", "Documento"] as const;
export type TipoNorma = typeof TIPOS_NORMA[number];

export function inferirTipoNorma(titulo: string): TipoNorma {
  const t = titulo.toLowerCase();
  // Jurisprudencia: fallos y sentencias de tribunales
  if (/sentencia|jurisprudencia|fallo\b|ruling|judgment|arrêt|corte (suprema|constitucional)|tribunal/.test(t)) return "Jurisprudencia";
  // Ley: normas aprobadas por el Congreso/Parlamento nacional (o su equivalente estatal)
  if (/proyecto de ley|^ley\b|^lei\b|^loi\b|^act\b| ley | acta |\bley\b|\bact\b|estatuto federal|ley org[aá]nica|ley marco/.test(t)) return "Ley";
  // Reglamento: normas de ejecución/desarrollo de una ley, de alcance general
  if (/reglamento|regulation|verordnung|règlement|regulations\b/.test(t)) return "Reglamento";
  // Administrativo: ordenanzas, decretos, resoluciones, directivas y demás actos de la administración
  if (/ordenanza|ordinance|bylaw|by-law|satzung|decreto|resoluci[oó]n|resolution|orden administrativa|directiva|directive|circular|instructivo/.test(t)) return "Administrativo";
  // Documento: informes, minutas, estudios y cualquier otro texto que no sea norma con fuerza vinculante propia
  return "Documento";
}

/**
 * Tipo de una norma devuelta por una fuente OFICIAL. Usa el rango que informa la propia fuente; si no lo
 * informa, se intenta por el título y, si tampoco se puede, queda "Norma" (no "Documento": viene de una base
 * de legislación, pero su rango no está informado).
 */
const TIPO_OFICIAL_LEY = /^(act|lag|lei|ley|lov|lag|loi|legge|ustawa|zakon|ustavni_zakon|seadus|bundesgesetz|ley básica|法律|법률)$/i;
const TIPO_OFICIAL_REGLAMENTO = /^(verordnung|命令|대통령령|총리령|부령|määrus|reglamento|regulation)$/i;
export function tipoNormaOficial(titulo: string, tipoOficial?: string): string {
  const t = (tipoOficial || "").trim();
  if (/projeto de lei|proyecto/i.test(t)) return "Proyecto de ley";
  if (TIPO_OFICIAL_LEY.test(t)) return "Ley";
  if (TIPO_OFICIAL_REGLAMENTO.test(t)) return "Reglamento";
  const porTitulo = inferirTipoNorma(titulo);
  return porTitulo === "Documento" ? "Norma" : porTitulo;
}

export function relevanciaPorCoincidencia(q: string, r: ResultadoComparado): number {
  const normQ = normalizarTexto(q);
  const sinonimos = (SINONIMOS_MATERIA[normQ] || []).map(normalizarTexto);
  const terminosBusqueda = [normQ, ...sinonimos];
  
  const texto = normalizarTexto(`${r.titulo} ${r.descripcion || ""} ${r.pais}`);
  
  for (const term of terminosBusqueda) {
    if (term.length > 2 && texto.includes(term)) {
      const esLey = r.tipo === "Ley" || /ley\b|act\b|lei\b|reglamento\b|directiva\b/i.test(r.titulo);
      const boostChile = r.pais === "Chile" ? 2 : 0;
      return esLey ? Math.min(100, 97 + boostChile) : 92;
    }
  }

  const palabras = normQ.split(/\s+/).filter((w) => w.length > 2);
  if (palabras.length === 0) return r.pais === "Chile" ? 95 : 85;
  const coincidencias = palabras.filter((w) => texto.includes(w)).length;
  if (coincidencias > 0) {
    const esLey = r.tipo === "Ley" || /ley\b|act\b|lei\b|reglamento\b/i.test(r.titulo);
    const boostChile = r.pais === "Chile" ? 10 : 0;
    return Math.min(99, Math.round((coincidencias / palabras.length) * 75) + (esLey ? 20 : 10) + boostChile);
  }
  return r.pais === "Chile" ? 90 : 80;
}

export async function fetchConTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)", Accept: "application/json, application/atom+xml, */*" }
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Consulta oficial en LeyChile (Biblioteca del Congreso Nacional) utilizando API Key oficial
 */
export async function buscarChile(q: string): Promise<ResultadoComparado[]> {
  try {
    const keyParam = LEYCHILE_API_KEY ? `&key=${encodeURIComponent(LEYCHILE_API_KEY)}` : "";
    const url = `https://www.leychile.cl/Consulta/obtxml?opt=61&cadena=${encodeURIComponent(q)}&cantidad=10${keyParam}`;
    const res = await fetchConTimeout(url, 7000);
    if (!res.ok) return [];
    const xml = await res.text();

    const decodeEntities = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
    const normaBlocks = xml.match(/<Norma>[\s\S]*?<\/Norma>/g) || [];
    
    return normaBlocks
      .map((block) => {
        const rawTitulo = (block.match(/<TituloNorma>([\s\S]*?)<\/TituloNorma>/) || [, ""])[1];
        const fecha = (block.match(/<FechaPublicacion>([\s\S]*?)<\/FechaPublicacion>/) || [, undefined])[1];
        const url = (block.match(/<Url>([\s\S]*?)<\/Url>/) || [, undefined])[1];
        const tipoDesc = (block.match(/<Descripcion>([\s\S]*?)<\/Descripcion>/) || [, ""])[1];
        const compuesto = (block.match(/<Compuesto>([\s\S]*?)<\/Compuesto>/) || [, ""])[1];
        const numero = (block.match(/<Numero>([\s\S]*?)<\/Numero>/) || [, ""])[1].trim();

        // Solo datos que entrega LeyChile (título, número, fecha, tipo). No se reemplaza el título ni se redacta un
        // resumen: el listado de LeyChile no trae resumen, así que se informa como no disponible.
        let tituloFinal = rawTitulo ? decodeEntities(rawTitulo) : "Norma sin título";
        if (compuesto && compuesto.toLowerCase().startsWith("ley-") && !tituloFinal.toLowerCase().startsWith("ley")) {
          const numFormat = compuesto.replace(/^ley-/i, "").replace(/(\d+)(\d{3})$/, "$1.$2");
          tituloFinal = `Ley ${numFormat}: ${tituloFinal}`;
        }
        const descripcionFinal = [
          [tipoDesc ? decodeEntities(tipoDesc).trim() : "", numero ? `N° ${numero}` : ""].filter(Boolean).join(" "),
          fecha ? `publicada el ${fecha}` : "",
        ].filter(Boolean).join(" · ") + `${tipoDesc || numero || fecha ? ". " : ""}Resumen: no informado por LeyChile en este listado.`;

        return {
          pais: "Chile",
          fuente: "LeyChile — Biblioteca del Congreso Nacional (API Oficial BCN)",
          titulo: tituloFinal,
          fecha,
          url: url ? decodeEntities(url) : undefined,
          descripcion: descripcionFinal,
          tipo: inferirTipoNorma(tituloFinal),
          origen: "oficial" as const,
          idOficial: (block.match(/<IdNorma>(\d+)<\/IdNorma>/) || [])[1]
        };
      })
      .filter((r) => r.titulo && r.titulo !== "Norma sin título")
      // La búsqueda de texto libre de LeyChile es más permisiva que la lista
      // curada que devuelve la IA para el resto de los países (5-7 resultados)
      // y además suele traer varias ordenanzas municipales casi idénticas
      // (misma "APRUEBA ORDENANZA DE TENENCIA RESPONSABLE..." repetida con
      // solo la fecha distinta) -- sin recortar, Chile se veía con muchos más
      // resultados sueltos y redundantes que cualquier otro país. Se puntúa
      // por relevancia real, se descartan duplicados casi idénticos (mismo
      // inicio de título) y se deja solo el top 4, más acotado y parejo con
      // el resto de los países.
      .map((r) => ({ ...r, relevancia: relevanciaPorCoincidencia(q, r) }))
      .sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0))
      .filter((r, i, arr) => {
        const prefijo = normalizarTexto(r.titulo).slice(0, 40);
        return arr.findIndex((x) => normalizarTexto(x.titulo).slice(0, 40) === prefijo) === i;
      })
      .slice(0, 4);
  } catch {
    return [];
  }
}

/**
 * Consulta directa a LeyChile por número de Ley oficial
 */
export async function buscarLeyChilePorNumero(numLey: string): Promise<ResultadoComparado | null> {
  try {
    const cleanNum = numLey.replace(/\D/g, "");
    if (!cleanNum) return null;
    const keyParam = LEYCHILE_API_KEY ? `&key=${encodeURIComponent(LEYCHILE_API_KEY)}` : "";
    const url = `https://www.leychile.cl/Consulta/obtxml?opt=61&cadena=${encodeURIComponent("Ley " + cleanNum)}&cantidad=3${keyParam}`;
    const res = await fetchConTimeout(url, 6000);
    if (!res.ok) return null;
    const xml = await res.text();
    const decodeEntities = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
    const normaMatch = xml.match(/<Norma>[\s\S]*?<\/Norma>/);
    if (!normaMatch) return null;
    const block = normaMatch[0];
    const rawTitulo = (block.match(/<TituloNorma>([\s\S]*?)<\/TituloNorma>/) || [, ""])[1];
    const fecha = (block.match(/<FechaPublicacion>([\s\S]*?)<\/FechaPublicacion>/) || [, undefined])[1];
    const urlNorma = (block.match(/<Url>([\s\S]*?)<\/Url>/) || [, undefined])[1];
    const compuesto = (block.match(/<Compuesto>([\s\S]*?)<\/Compuesto>/) || [, ""])[1];

    let tituloFinal = rawTitulo ? decodeEntities(rawTitulo) : `Ley ${cleanNum}`;
    if (compuesto && compuesto.toLowerCase().startsWith("ley-") && !tituloFinal.toLowerCase().startsWith("ley")) {
      const numFormat = compuesto.replace(/^ley-/i, "").replace(/(\d+)(\d{3})$/, "$1.$2");
      tituloFinal = `Ley ${numFormat}: ${tituloFinal}`;
    }

    return {
      pais: "Chile",
      fuente: "LeyChile — Biblioteca del Congreso Nacional (API Oficial BCN)",
      titulo: tituloFinal,
      fecha,
      url: urlNorma ? decodeEntities(urlNorma) : `https://www.leychile.cl/Navegar?idNorma=${cleanNum}`,
      tipo: "Ley",
      descripcion: `Marco regulatorio oficial publicado en el Diario Oficial de Chile, bajo la jurisdicción de la República de Chile.`
    };
  } catch {
    return null;
  }
}

/**
 * Motor de IA para identificar legislación comparada internacional precisa
 */
function construirPromptLoteComparado(query: string, lote: string[]): string {
  const conPortalReferencia = lote.filter((p) => PORTALES_DATOS_ABIERTOS_REFERENCIA[p]);
  const bloquePortales = conPortalReferencia.length > 0
    ? `\n\nPortales oficiales de datos/APIs gubernamentales VERIFICADOS (reales, no los inventes tú) para algunas de estas jurisdicciones, por si te sirven de referencia del dominio oficial o como enlace de respaldo cuando no identifiques la página específica de la norma:\n${conPortalReferencia.map((p) => `- ${p}: ${PORTALES_DATOS_ABIERTOS_REFERENCIA[p].nombre} (${PORTALES_DATOS_ABIERTOS_REFERENCIA[p].url})`).join("\n")}\nEstos portales son catálogos de datos abiertos generales, no el texto de una norma específica --úsalos solo si no puedes identificar un enlace más específico a la norma misma; prioriza siempre un enlace directo a la norma cuando lo conozcas.`
    : "";

  return `Actúa como un analista experto en Derecho Comparado y Asesoría Técnica Parlamentaria de la Biblioteca del Congreso Nacional de Chile (BCN).
Para la materia, concepto o ámbito regulatorio: "${query}", evalúa CADA UNA de las siguientes ${lote.length} jurisdicciones e identifica, para cada una en que exista, un marco normativo o iniciativa legal REAL, VIGENTE O EN TRÁMITE relacionado con la materia:

${lote.join(", ")}
${bloquePortales}

Incluye en tu respuesta a TODAS las jurisdicciones de esta lista para las que puedas identificar honestamente una norma real y específica sobre "${query}". Omite del arreglo únicamente aquellas para las que genuinamente no exista o no puedas identificar una norma específica sobre la materia -- nunca inventes un título, número o fecha para rellenar una jurisdicción.

Responde ÚNICAMENTE con un arreglo JSON válido, compacto (sin saltos de línea ni indentación innecesarios) y SIN texto adicional antes ni después, donde cada objeto tenga este esquema exacto:
[{"pais":"Nombre del país o entidad","fuente":"Nombre del repositorio oficial (ej: EUR-Lex, BOE, Congress.gov)","titulo":"Título formal y número REAL de la norma (no inventes un título genérico)","tituloOriginal":"Título original en idioma nativo si no es español","fecha":"Año de aprobación o entrada en vigencia","url":"Enlace oficial real o portal gubernamental de referencia","tipo":"Ley | Reglamento | Jurisprudencia | Administrativo | Documento","descripcion":"Párrafo único en prosa formal (sin viñetas ni emojis, estilo Asesoría Técnica Parlamentaria de la BCN) que explique el objeto y ámbito de la norma, sus principales mecanismos o deberes, y el órgano encargado de su fiscalización, en 2 a 3 oraciones.","relevancia":95}]

Escribe "descripcion" como lo haría un analista de la Biblioteca del Congreso Nacional de Chile en un informe de Asesoría Técnica Parlamentaria: prosa formal y continua, en tercera persona, sin emojis, sin viñetas y sin encabezados dentro del texto. Mantén cada "descripcion" breve (2 a 3 oraciones, máximo 3-4 líneas).
IMPORTANTE: clasifica el campo "tipo" usando EXCLUSIVAMENTE una de estas 5 categorías, según la jerarquía normativa real:
- "Ley": norma aprobada por el Congreso/Parlamento nacional o su equivalente estatal (leyes orgánicas, actos, estatutos federales).
- "Reglamento": norma de ejecución o desarrollo de una ley, de alcance general (reglamentos, regulations).
- "Jurisprudencia": sentencias, fallos o resoluciones de tribunales.
- "Administrativo": decretos, resoluciones, ordenanzas municipales/locales, directivas de organismos administrativos y circulares. Una ordenanza municipal NUNCA es "Ley".
- "Documento": informes, minutas, estudios técnicos u otro texto de referencia sin fuerza normativa vinculante propia.`;
}

const TTL_COMPARADO_MS = 6 * 60 * 60 * 1000;

/** Chile (LeyChile): se guarda solo si hubo resultados (buscarChile devuelve [] tanto si no hay normas como si falla). */
async function buscarChileConCache(q: string): Promise<ResultadoComparado[]> {
  const key = `comparado_chile_${normalizarTexto(q)}`;
  const hit = cache.get<ResultadoComparado[]>(key);
  if (hit) return structuredClone(hit);
  const r = await buscarChile(q);
  if (r.length > 0) cache.set(key, structuredClone(r), TTL_COMPARADO_MS);
  return r;
}

/** Estado de cada enlace por URL: vigente 6 h; los rotos solo 10 min (pueden ser caídas pasajeras). */
async function validarEnlacesConCache(urls: string[]): Promise<EstadoEnlace[]> {
  const out: EstadoEnlace[] = [];
  const faltan: string[] = [];
  for (const u of Array.from(new Set(urls))) {
    const hit = cache.get<EstadoEnlace>(`comparado_enlace_${u}`);
    if (hit) out.push(hit);
    else faltan.push(u);
  }
  if (faltan.length > 0) {
    for (const e of await validarEnlaces(faltan)) {
      if (!e) continue;
      out.push(e);
      cache.set(`comparado_enlace_${e.url}`, e, e.estado === "roto" ? 10 * 60 * 1000 : TTL_COMPARADO_MS);
    }
  }
  return out;
}

export async function buscarComparadoConIA(query: string, attempts?: AIProviderAttempt[]): Promise<ResultadoComparado[]> {
  // Lista explícita de las 28 jurisdicciones que la UI anuncia como "27
  // Países" (todo CODIGO_PAIS salvo Chile, que se consulta aparte vía
  // LeyChile). Antes el prompt pedía "elige las 5 a 7 más pertinentes" de
  // una lista de 8 regiones agrupadas -- la IA nunca evaluaba realmente las
  // 27. Pedirlas todas en UN solo prompt sí las cubre, pero un modelo
  // generando ~7000 tokens de salida en un solo llamado se siente muy lento
  // (30-40s). En vez de eso, se reparte la lista en lotes más chicos y se
  // consultan EN PARALELO -- el tiempo total queda acotado por el lote más
  // lento, no por la suma de los 27 países.
  // Chile (LeyChile) y las jurisdicciones con conector oficial (UE, España, Reino Unido) no se
  // piden al modelo: sus normas salen solo de la fuente oficial.
  const jurisdicciones = Object.keys(CODIGO_PAIS).filter((p) => p !== "Chile" && !PAISES_OFICIALES.has(p));
  // OJO: bajar mucho el tamaño del lote (más lotes en paralelo) no acelera
  // la busqueda de forma segura -- cada lote dispara su propia llamada a
  // Gemini/Groq, y con muchos lotes simultáneos se satura la cuota gratuita
  // de esos proveedores (429 Too Many Requests), haciendo que varios lotes
  // fallen en silencio y se pierdan países en vez de ganar velocidad. 7 es
  // el tamaño probado que balancea latencia (~20-25s) con cobertura completa.
  const TAMANO_LOTE = 7;
  const lotes: string[][] = [];
  for (let i = 0; i < jurisdicciones.length; i += TAMANO_LOTE) {
    lotes.push(jurisdicciones.slice(i, i + TAMANO_LOTE));
  }

  const intentarUnaVez = async (p: string, maxTokens: number): Promise<ResultadoComparado[] | null> => {
    const aiResponse = await generarContenidoUniversalIA(p, maxTokens, attempts);
    if (!aiResponse) return null;
    try {
      const parsed = safeJsonParse<ResultadoComparado[]>(aiResponse);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item) => !PAISES_OFICIALES.has(item.pais)).map((item) => ({
          ...item,
          origen: "ia" as const,
          fuente: `${item.fuente || "Fuente no indicada"} — propuesta por IA, sin verificar`,
          tipo: item.tipo || inferirTipoNorma(item.titulo || ""),
          relevancia: item.relevancia || relevanciaPorCoincidencia(query, item)
        }));
      }
      return null;
    } catch (parseErr: any) {
      console.warn("[Derecho Comparado IA] La respuesta del modelo no es JSON válido:", parseErr.message, "-- inicio de la respuesta:", aiResponse.slice(0, 300));
      attempts?.push({ provider: "json-parse", configured: true, error: parseErr.message });
      return null;
    }
  };

  // Caché por lote: solo se guardan respuestas reales del modelo; un lote que falló se
  // reintenta en la próxima búsqueda sin repetir los que sí respondieron.
  const resolverLote = async (lote: string[]): Promise<ResultadoComparado[]> => {
    const claveLote = `comparado_ia_${normalizarTexto(query)}_${lote.join("|")}`;
    const enCache = cache.get<ResultadoComparado[]>(claveLote);
    if (enCache) return structuredClone(enCache);
    const resuelto = await resolverLoteSinCache(lote);
    if (resuelto.length > 0) cache.set(claveLote, structuredClone(resuelto), TTL_COMPARADO_MS);
    return resuelto;
  };

  const resolverLoteSinCache = async (lote: string[]): Promise<ResultadoComparado[]> => {
    const prompt = construirPromptLoteComparado(query, lote);
    try {
      const primerIntento = await intentarUnaVez(prompt, 2200);
      if (primerIntento) return primerIntento;

      // El modelo a veces "conversa" en vez de responder solo el JSON pedido
      // (variación normal de un LLM, no un fallo de la llamada en sí). Antes de
      // rendirse con este lote, se reintenta una vez con formato más estricto.
      const promptEstricto = `${prompt}\n\nIMPORTANTE: tu respuesta anterior no cumplió el formato. Responde EXCLUSIVAMENTE con el arreglo JSON solicitado, empezando en "[" y terminando en "]", sin ningún texto, explicación ni markdown antes o después.`;
      const segundoIntento = await intentarUnaVez(promptEstricto, 2200);
      if (segundoIntento) return segundoIntento;
    } catch (err: any) {
      console.warn("[Derecho Comparado IA] Error al consultar modelo de IA para lote:", lote.join(", "), err.message);
    }
    return [];
  };

  const resultadosPorLote = await Promise.all(lotes.map(resolverLote));
  // Si todos los lotes fallaron (IA no disponible, sin claves, etc.) no hay propuestas: nunca se completa con
  // contenido fijo del código. El llamador informa "Motor de IA no disponible".
  return resultadosPorLote.flat();
}

/**
 * Función principal unificada de búsqueda de derecho comparado
 * Combina fuentes oficiales reales (Chile LeyChile BCN) + Inteligencia Artificial multinacional
 */
export async function buscarDerechoComparado(q: string): Promise<{
  resultados: ResultadoComparado[];
  fuentesConsultadas: string[];
  fuentesFallidas: string[];
  aiDiagnostics: AIProviderAttempt[];
  /** Estado real de cada fuente oficial consultada (ok / sin_resultados / no_disponible). */
  estadoFuentes?: EstadoFuenteOficial[];
  /** Normas propuestas por IA que se excluyeron por enlace roto, ausente o de portada. */
  descartadas?: NormaDescartada[];
}> {
  // Sin caché del resultado completo: cada parte se guarda por separado (fuentes oficiales por fuente, Chile, lotes
  // de IA y enlaces) para que una parte caída se reintente sin volver a consultar las que sí respondieron.
  const resultado = await (async () => {
    const fuentesFallidas: string[] = [];
    const aiAttempts: AIProviderAttempt[] = [];

    // En paralelo:
    // 1. LeyChile (BCN) para Chile.
    // 2. Fuentes OFICIALES de UE (Cellar), España (BOE) y Reino Unido (legislation.gov.uk).
    // 3. Modelo de IA SOLO para el resto de las jurisdicciones (propuestas sin verificar).
    const [chileResult, oficialesResult, iaResult] = await Promise.allSettled([
      buscarChileConCache(q),
      buscarFuentesOficiales(q),
      buscarComparadoConIA(q, aiAttempts)
    ]);

    const resultados: ResultadoComparado[] = [];
    const estadoFuentes: EstadoFuenteOficial[] = [];
    const ahora = new Date().toISOString();

    // 1. Chile: solo lo que devuelve LeyChile. Si falla o no hay resultados se informa; no se inventa una norma.
    if (chileResult.status === "fulfilled" && chileResult.value.length > 0) {
      resultados.push(...chileResult.value.map((r) => ({ ...r, consultadoEl: ahora })));
      estadoFuentes.push({ jurisdiccion: "Chile", fuente: "LeyChile — Biblioteca del Congreso Nacional (API oficial)", estado: "ok", consultadoEl: ahora });
    } else {
      const fallo = chileResult.status === "rejected";
      estadoFuentes.push({
        jurisdiccion: "Chile",
        fuente: "LeyChile — Biblioteca del Congreso Nacional (API oficial)",
        estado: fallo ? "no_disponible" : "sin_resultados",
        motivo: fallo ? "LeyChile no respondió." : "LeyChile no devolvió normas para esa consulta (o no respondió).",
        consultadoEl: ahora
      });
      fuentesFallidas.push("LeyChile (sin resultados o no disponible)");
    }

    // 2. Fuentes oficiales extranjeras
    if (oficialesResult.status === "fulfilled") {
      for (const n of oficialesResult.value.normas) {
        resultados.push({
          pais: n.pais,
          fuente: n.fuente,
          titulo: n.titulo,
          fecha: n.fecha,
          url: n.url,
          descripcion: n.descripcion,
          tipo: tipoNormaOficial(n.titulo, n.tipoOficial),
          origen: "oficial",
          idOficial: n.idOficial,
          consultadoEl: n.consultadoEl
        });
      }
      estadoFuentes.push(...oficialesResult.value.estados);
      for (const e of oficialesResult.value.estados) {
        if (e.estado === "no_disponible") fuentesFallidas.push(`${e.jurisdiccion} (fuente oficial no disponible)`);
      }
    } else {
      for (const j of PAISES_OFICIALES) {
        estadoFuentes.push({ jurisdiccion: j, fuente: "fuente oficial", estado: "no_disponible", motivo: "Error interno al consultar las fuentes oficiales.", consultadoEl: ahora });
      }
      fuentesFallidas.push("Fuentes oficiales extranjeras (error interno)");
    }

    // 3. Resto de jurisdicciones: propuestas de IA, siempre etiquetadas. Nunca para UE/España/Reino Unido.
    if (iaResult.status === "fulfilled" && iaResult.value.length > 0) {
      resultados.push(...iaResult.value.filter((r) => !PAISES_OFICIALES.has(r.pais)));
    } else {
      fuentesFallidas.push("Motor de IA no disponible: sin propuestas para las demás jurisdicciones");
    }

    const fuentesConsultadas: string[] = [
      ...estadoFuentes.map((e) => `${e.jurisdiccion} — ${e.fuente}: ${e.estado === "ok" ? "consultada" : e.estado === "sin_resultados" ? "consultada, sin resultados" : "NO disponible"}`),
      "Resto de jurisdicciones: sin consulta a fuentes oficiales; normas propuestas por modelos de IA (sin verificar)"
    ];

    // Verificación de enlaces de las normas NO oficiales: se visita cada URL. Se descartan las que no tienen
    // enlace, apuntan a la portada de un portal o están rotas; las que el sitio bloquea a clientes automáticos
    // (403/429/202) se conservan marcadas como "no verificables".
    const descartadas: NormaDescartada[] = [];
    const noOficiales = resultados.filter(r => r.origen !== "oficial");
    const estadosEnlace = await validarEnlacesConCache(noOficiales.map(r => r.url || "").filter(u => u && !esInicioDePortal(u)));
    const porUrl = new Map(estadosEnlace.map(e => [e.url, e]));
    const conservados = resultados.filter(r => {
      if (r.origen === "oficial") return true;
      if (!r.url) { descartadas.push({ pais: r.pais, titulo: r.titulo, motivo: "La propuesta no trae enlace a la norma." }); return false; }
      if (esInicioDePortal(r.url)) { descartadas.push({ pais: r.pais, titulo: r.titulo, url: r.url, motivo: "El enlace apunta a la portada de un portal, no a la norma." }); return false; }
      const e = porUrl.get(r.url);
      if (!e || e.estado === "roto") { descartadas.push({ pais: r.pais, titulo: r.titulo, url: r.url, motivo: `El enlace no responde${e?.codigo ? ` (HTTP ${e.codigo})` : ""}.` }); return false; }
      r.verificacionEnlace = e.estado === "bloqueado" || e.codigo === 202 ? (e.estado === "bloqueado" ? "bloqueado" : "no_verificable") : "ok";
      return true;
    });
    resultados.length = 0;
    resultados.push(...conservados);

    // Asignar y calibrar relevancia
    resultados.forEach(r => {
      if (!r.relevancia) {
        r.relevancia = relevanciaPorCoincidencia(q, r);
      }
    });

    // Ordenar: Chile SIEMPRE primero, luego las normas de fuente oficial y al final las propuestas de IA.
    // (La "relevancia" es una heurística sobre texto en español: no sirve para comparar títulos en otros idiomas.)
    resultados.sort((a, b) => {
      if (a.pais === "Chile" && b.pais !== "Chile") return -1;
      if (b.pais === "Chile" && a.pais !== "Chile") return 1;
      const oa = a.origen === "oficial" ? 1 : 0, ob = b.origen === "oficial" ? 1 : 0;
      if (oa !== ob) return ob - oa;
      return (b.relevancia || 0) - (a.relevancia || 0);
    });

    return {
      resultados,
      fuentesConsultadas,
      fuentesFallidas,
      aiDiagnostics: aiAttempts,
      estadoFuentes,
      descartadas
    };
  })();

  return resultado;
}

export function extraerPuntosHeuristicos(query: string, resultado: ResultadoComparado, texto?: string | null): string[] {
  const puntos: string[] = [];
  
  if (resultado.pais === "Chile") {
    puntos.push(`Normativa nacional aplicable en la República de Chile bajo la jurisdicción de ${resultado.fuente}.`);
  } else {
    puntos.push(resultado.origen === "oficial"
      ? `Norma de ${resultado.pais} obtenida de ${resultado.fuente}.`
      : `Norma propuesta para ${resultado.pais} (${resultado.fuente}); su texto no pudo recuperarse y no está verificada.`);
  }

  if (resultado.descripcion && resultado.descripcion.length > 20) {
    const lineas = resultado.descripcion.split("\n").map(l => l.trim()).filter(Boolean);
    for (const l of lineas) {
      if (!puntos.includes(l)) puntos.push(l);
    }
  }

  if (texto && texto.length > 50) {
    const oraciones = texto
      .split(/[.\n;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 35 && s.length < 220 && !s.includes("<") && !s.includes("{") && !s.includes("function"));

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const relevantes = oraciones.filter(o => queryWords.some(w => o.toLowerCase().includes(w)));
    const seleccionadas = (relevantes.length > 0 ? relevantes : oraciones).slice(0, 2);
    for (const s of seleccionadas) {
      if (!puntos.includes(s)) puntos.push(s);
    }
  }

  if (puntos.length < 3) {
    puntos.push(`Establece directrices jurídicas, ámbito de aplicación y mecanismos de cumplimiento aplicables a ${query}.`);
    puntos.push(`Fija deberes para los sujetos obligados y competencias para las autoridades fiscalizadoras.`);
  }

  return puntos.slice(0, 6);
}

const ENTIDADES_HTML: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", ordm: "º", ordf: "ª", sect: "§", laquo: "«", raquo: "»",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  agrave: "à", egrave: "è", ograve: "ò", acirc: "â", ecirc: "ê", ocirc: "ô", atilde: "ã", otilde: "õ", ccedil: "ç", Ccedil: "Ç",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", ouml: "ö", auml: "ä", szlig: "ß", ndash: "–", mdash: "—", hellip: "…", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’"
};

function decodificarEntidadesHtml(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-zA-Z]+);/g, (m, nombre) => ENTIDADES_HTML[nombre] ?? m);
}

/** Descarga una página respetando su codificación (Planalto/Brasil usa windows-1252, no UTF-8). */
async function descargarHtmlDecodificado(url: string, headers: Record<string, string>, ms: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, headers, redirect: "follow" });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0) return null;
    const ct = res.headers.get("content-type") || "";
    let charset = (ct.match(/charset=([\w-]+)/i) || [])[1];
    if (!charset) {
      const cabecera = new TextDecoder("latin1").decode(buf.slice(0, 4096));
      charset = (cabecera.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1];
    }
    // Algunos portales (p. ej. Planalto, Brasil) declaran UTF-8 pero sirven
    // latin1: si los bytes no son UTF-8 válido se cae a la codificación declarada
    // (o windows-1252) en vez de dejar caracteres corruptos en el texto.
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(buf);
    } catch {
      const alternativa = charset && !/utf-?8/i.test(charset) ? charset.toLowerCase() : "windows-1252";
      try {
        return new TextDecoder(alternativa).decode(buf);
      } catch {
        return new TextDecoder("windows-1252").decode(buf);
      }
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function htmlATextoLegible(html: string): string {
  return decodificarEntidadesHtml(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<!\[[^\]]*\]>/g, " ")
      .replace(/<(script|style|noscript|nav|header|footer|aside|svg|form)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/(p|div|li|tr|h[1-6]|br)>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

const PALABRAS_JURIDICAS = /sanci|multa|infracci|autoridad|agencia|organismo|derecho|obligaci|deber|plazo|fiscaliz|vigencia|definici|responsable|titular|consentimiento|penalt|fine|authority|right|obligation|controller|processor|penalty|supervis|prazo|san[cç]|autoridade|direito|dever/i;

/**
 * Elige hasta `max` caracteres de una norma larga: el inicio (título, objeto y
 * ámbito) más los fragmentos que mencionan los términos de la materia y los
 * ejes jurídicos típicos (autoridad, sanciones, plazos, derechos...). Antes se
 * tomaban los primeros caracteres, que en leyes extensas son solo menús y
 * considerandos, y la IA no tenía de dónde extraer sanciones o autoridad.
 */
function seleccionarFragmentosRelevantes(texto: string, query: string | undefined, max: number): string {
  if (texto.length <= max) return texto;
  const terminos = (query || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);
  const TAM = 1400;
  const trozos: { i: number; txt: string; score: number }[] = [];
  for (let i = 0, k = 0; i < texto.length; i += TAM, k++) {
    const txt = texto.slice(i, i + TAM);
    const plano = txt.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const hits = terminos.reduce((n, w) => n + (plano.includes(w) ? 1 : 0), 0);
    const juridico = (txt.match(new RegExp(PALABRAS_JURIDICAS.source, "gi")) || []).length;
    trozos.push({ i: k, txt, score: hits * 3 + Math.min(juridico, 6) });
  }
  const elegidos = new Set<number>([0, 1, 2]);
  let largo = trozos.slice(0, 3).reduce((n, t) => n + t.txt.length, 0);
  for (const t of [...trozos].sort((a, b) => b.score - a.score)) {
    if (largo >= max) break;
    if (elegidos.has(t.i) || t.score === 0) continue;
    elegidos.add(t.i);
    largo += t.txt.length;
  }
  return trozos
    .filter((t) => elegidos.has(t.i))
    .map((t) => t.txt)
    .join("\n[...]\n")
    .slice(0, max);
}

const IDIOMA_CELLAR: Record<string, string> = { ES: "spa", EN: "eng", FR: "fra", DE: "deu", PT: "por", IT: "ita" };

/**
 * Texto de una norma con su proveniencia. Primero intenta las fuentes oficiales con API (BOE,
 * legislation.gov.uk, Cellar) y conserva la huella SHA-256 de la respuesta original; si la URL no es
 * de esas fuentes, usa la descarga genérica (sin proveniencia).
 */
export async function fetchTextoFuenteConProveniencia(url: string, query?: string): Promise<{ texto: string | null; proveniencia?: Proveniencia }> {
  const oficial = await fetchTextoOficial(url);
  if (oficial) {
    let texto = oficial.texto;
    const inicio = texto.search(/(^|\n)\s*(Art[íi]culo|Article|Section)\s*(1|primero|único)\s*(\n|[.º°ª-])/i);
    if (inicio > 0 && inicio < texto.length * 0.7) texto = texto.slice(Math.max(0, inicio - 300));
    texto = texto.replace(/\s+/g, " ");
    return { texto: texto.length > 200 ? seleccionarFragmentosRelevantes(texto, query, 12000) : null, proveniencia: oficial.proveniencia };
  }
  return { texto: await fetchTextoFuente(url, query) };
}

export async function fetchTextoFuente(url: string, query?: string): Promise<string | null> {
  // Protección SSRF: la URL viene del cliente o de un modelo; no se descargan direcciones privadas.
  if (!urlPermitida(url)) return null;
  const UA ="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  try {
    let html: string | null = null;

    // EUR-Lex bloquea scrapers (responde 202 vacío); el mismo texto oficial se
    // obtiene completo desde el repositorio Cellar de la Oficina de Publicaciones.
    const eur = url.match(/eur-lex\.europa\.eu\/legal-content\/([A-Za-z]{2})\/[^?]*\?uri=CELEX(?:%3A|:)(\w+)/i);
    if (eur) {
      html = await descargarHtmlDecodificado(
        `https://publications.europa.eu/resource/celex/${eur[2]}`,
        { "User-Agent": UA, Accept: "application/xhtml+xml, text/html", "Accept-Language": IDIOMA_CELLAR[eur[1].toUpperCase()] || "eng" },
        20000
      );
    } else {
      html = await descargarHtmlDecodificado(url, { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "es,en;q=0.8" }, 12000);
    }
    if (!html) return null;

    let texto = htmlATextoLegible(html);
    // Salta menús, cabeceras y considerandos: arranca donde empieza el articulado
    // (encabezado "Artículo 1" en su propia línea), si se encuentra.
    const inicioArticulado = texto.search(/(^|\n)\s*(Art[íi]culo|Article|Artigo|Artikel|Articolo|Art\.)\s*(1|primero|único)\s*(\n|[.º°ª-])/i);
    if (inicioArticulado > 0 && inicioArticulado < texto.length * 0.7) {
      texto = texto.slice(Math.max(0, inicioArticulado - 300));
    }
    texto = texto.replace(/\s+/g, " ");
    return texto.length > 200 ? seleccionarFragmentosRelevantes(texto, query, 12000) : null;
  } catch {
    return null;
  }
}

/**
 * Texto REAL y completo (articulado, no resumen) de una norma chilena, vía la
 * API oficial de LeyChile (obtxml?opt=7&idNorma=X), que devuelve la norma
 * consolidada estructurada por artículos en vez del HTML de la página de
 * navegación (que fetchTextoFuente scrapea genérico y suele traer menos
 * contenido útil). Permite que el análisis cite artículos textualmente en
 * vez de solo parafrasear el título, como pedía el usuario. Devuelve null si
 * la URL no es de LeyChile o no se pudo obtener el texto.
 */
export async function fetchTextoNormaLeyChileCompleto(url: string): Promise<string | null> {
  const match = url.match(/leychile\.cl\/Navegar\?idNorma=(\d+)/i);
  if (!match) return null;
  const idNorma = match[1];
  try {
    const keyParam = LEYCHILE_API_KEY ? `&key=${encodeURIComponent(LEYCHILE_API_KEY)}` : "";
    const apiUrl = `https://www.leychile.cl/Consulta/obtxml?opt=7&idNorma=${idNorma}${keyParam}`;
    const res = await fetchConTimeout(apiUrl, 10000);
    if (!res.ok) return null;
    const xml = await res.text();
    const texto = xml
      .replace(/<[^>]*>/g, " ")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    return texto.length > 200 ? texto.slice(0, 20000) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Ley vigente que modifica un proyecto: texto oficial de sus artículos desde LeyChile (BCN, API con clave).
// Solo texto oficial: si LeyChile no responde o no se encuentra la norma, se informa "no disponible".
// ---------------------------------------------------------------------------
export interface ArticuloLey { numero: string; texto: string }
export interface LeyVigente { disponible: boolean; motivo?: string; numero?: string; titulo?: string; url?: string; idNorma?: string; articulos: ArticuloLey[]; numerosEncontrados?: string[] }

const decodificarXml = (s: string) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
  .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCharCode(parseInt(c, 16)))
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/gi, " ").replace(/&amp;/g, "&");

/** Número normalizado de artículo: "16", "16 bis", "45". */
export const numeroArticulo = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[°º.\-]/g, " ").replace(/\s+/g, " ").trim().replace(/^(\d+)\s*(bis|ter|quater|quinquies|sexies)?.*$/, (_m, n, b) => b ? `${n} ${b}` : n);

export function parsearArticulosLeyChile(xml: string): ArticuloLey[] {
  // Se juntan, en orden, los textos de todas las partes de la norma y se separa por encabezado de artículo
  // ("Artículo 16.-", "ARTICULO 16°.-", "Art. 16 bis.-"): así funciona aunque varios artículos vengan en un mismo bloque.
  const textos = Array.from(xml.matchAll(/<Texto[^>]*>([\s\S]*?)<\/Texto>/gi))
    .map((m) => decodificarXml(m[1]).replace(/<[^>]+>/g, " ").replace(/[ \t]+/g, " ").replace(/\r/g, "").trim()).filter(Boolean);
  const todo = "\n" + textos.join("\n");
  const enc = /\n\s*(Art(?:[íiÍI]culo|\.)\s*(\d+)\s*[°º]?\s*(bis|ter|qu[aá]ter|quinquies|sexies)?\s*[°º.]*\s*(transitori[oa])?\s*[°º.]*\s*[-–:])/gi;
  const marcas = Array.from(todo.matchAll(enc)).map((m) => ({ pos: (m.index || 0) + 1, numero: numeroArticulo(`${m[2]}${m[3] ? " " + m[3] : ""}`), resto: m[4] ? "transitorio" : "" }));
  const out: ArticuloLey[] = [];
  const vistos = new Set<string>();
  marcas.forEach((m, i) => {
    if (/^\s*transitori/i.test(m.resto)) return; // artículos transitorios: otra numeración
    const fin = i + 1 < marcas.length ? marcas[i + 1].pos : todo.length;
    const texto = todo.slice(m.pos, fin).replace(/\n\s*\n+/g, "\n").trim();
    if (vistos.has(m.numero)) return; // el primero es el del cuerpo permanente de la ley
    vistos.add(m.numero);
    out.push({ numero: m.numero, texto: texto.slice(0, 12000) });
  });
  return out;
}

/** Busca la norma en LeyChile (por número de ley o por su nombre) y entrega sus artículos vigentes. */
export async function leyVigenteLeyChile(referencia: string): Promise<LeyVigente> {
  if (!LEYCHILE_API_KEY) return { disponible: false, motivo: "LeyChile no disponible: falta configurar LEYCHILE_API_KEY en el servidor.", articulos: [] };
  const ref = String(referencia || "").trim();
  const num = (ref.match(/\bley\s*(?:n[°º.]?\s*)?(\d{1,2}\.?\d{3})\b/i) || [])[1]?.replace(/\./g, "");
  const cadena = num ? `Ley ${num}` : ref;
  if (!cadena) return { disponible: false, motivo: "No se identificó la ley que modifica el proyecto.", articulos: [] };
  const claveCache = `ley_vigente_v2_${cadena.toLowerCase()}`;
  const previo = cache.get<LeyVigente>(claveCache);
  if (previo) return previo;
  const key = `&key=${encodeURIComponent(LEYCHILE_API_KEY)}`;
  try {
    const rb = await fetchConTimeout(`https://www.leychile.cl/Consulta/obtxml?opt=61&cadena=${encodeURIComponent(cadena)}&cantidad=5${key}`, 10000);
    if (!rb.ok) return { disponible: false, motivo: `LeyChile no disponible (HTTP ${rb.status}).`, articulos: [] };
    const xb = await rb.text();
    const normas = (xb.match(/<Norma\b[\s\S]*?<\/Norma>/g) || []).map((b) => ({
      id: (b.match(/<IdNorma>(\d+)<\/IdNorma>/) || [])[1] || "",
      titulo: decodificarXml((b.match(/<TituloNorma>([\s\S]*?)<\/TituloNorma>/) || [])[1] || ""),
      compuesto: (b.match(/<Compuesto>([\s\S]*?)<\/Compuesto>/) || [])[1] || "",
      url: decodificarXml((b.match(/<Url>([\s\S]*?)<\/Url>/) || [])[1] || ""),
    })).filter((n) => n.id);
    // Con número de ley, solo se acepta la norma cuyo identificador corresponde exactamente a esa ley.
    const norma = num ? normas.find((n) => n.compuesto.replace(/\D/g, "") === num || new RegExp(`\\b${num.replace(/(\d+)(\d{3})$/, "$1\\.?$2")}\\b`).test(n.titulo)) : normas[0];
    if (!norma) return { disponible: false, motivo: `No se encontró ${num ? `la Ley N° ${num}` : `"${cadena}"`} en LeyChile.`, articulos: [] };
    const rn = await fetchConTimeout(`https://www.leychile.cl/Consulta/obtxml?opt=7&idNorma=${norma.id}${key}`, 15000);
    if (!rn.ok) return { disponible: false, motivo: `LeyChile no entregó el texto de la norma (HTTP ${rn.status}).`, articulos: [] };
    const articulos = parsearArticulosLeyChile(await rn.text());
    const r: LeyVigente = {
      disponible: articulos.length > 0, motivo: articulos.length ? undefined : "LeyChile no entregó artículos legibles de esta norma.",
      numero: num, titulo: norma.titulo || cadena, idNorma: norma.id, url: norma.url || `https://www.bcn.cl/leychile/navegar?idNorma=${norma.id}`, articulos,
      numerosEncontrados: articulos.map((a) => a.numero).slice(0, 400),
    };
    if (r.disponible) cache.set(claveCache, r, 24 * 60 * 60 * 1000);
    return r;
  } catch (e: any) {
    return { disponible: false, motivo: `LeyChile no disponible (${e?.name === "TimeoutError" ? "sin respuesta a tiempo" : e?.message || e}).`, articulos: [] };
  }
}
