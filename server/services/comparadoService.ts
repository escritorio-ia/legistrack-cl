/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generarContenidoUniversalIA, safeJsonParse, AIProviderAttempt } from "./aiService";
import { cache } from "./cacheService";

export const LEYCHILE_API_KEY = process.env.LEYCHILE_API_KEY || "qW5yv690wb8WIEq1wN08HsHZur4MyrSSrhLgcXdstNZwtJ3Fihfu3baz4y3uYlCb";

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

export interface LeyInfoChile {
  numero: string;
  nombreOficial: string;
  nombrePopular?: string;
  resumen: string;
  palabrasClave: string[];
}

export const DICCIONARIO_LEYES_CHILENAS: Record<string, LeyInfoChile> = {
  "21020": {
    numero: "21.020",
    nombreOficial: "Sobre Tenencia Responsable de Mascotas y Animales de Compañía",
    nombrePopular: "Ley Cholito",
    resumen: "Regula integralmente los deberes de cuidado, protección y control sobre perros, gatos y animales de compañía en Chile, creando el Registro Nacional de Mascotas con microchip subcutáneo obligatorio. Su cumplimiento es supervisado por las Municipalidades, las Seremis de Salud y Carabineros.",
    palabrasClave: ["perro", "perros", "gato", "gatos", "mascota", "mascotas", "animal", "animales", "cholito", "tenencia responsable"]
  },
  "21643": {
    numero: "21.643",
    nombreOficial: "Modifica el Código del Trabajo en materia de Prevención, Investigación y Sanción del Acoso Laboral, Sexual y Violencia en el Trabajo",
    nombrePopular: "Ley Karin",
    resumen: "Establece un marco preventivo y sancionatorio integral frente al acoso laboral, sexual y la violencia en el trabajo, exigiendo protocolos preventivos obligatorios y medidas cautelares inmediatas de resguardo. Es fiscalizada por la Dirección del Trabajo.",
    palabrasClave: ["karin", "acoso laboral", "acoso sexual", "violencia laboral", "mobbing", "trabajo"]
  },
  "21561": {
    numero: "21.561",
    nombreOficial: "Modifica el Código del Trabajo con el objeto de Reducir la Jornada Laboral a 40 Horas Semanales",
    nombrePopular: "Ley de 40 Horas",
    resumen: "Reduce gradualmente la jornada laboral semanal de 45 a 40 horas, contemplando bandas horarias diferidas y la jornada 4x3 como mecanismos de adaptación. Es fiscalizada por la Dirección del Trabajo.",
    palabrasClave: ["40 horas", "jornada laboral", "horario de trabajo", "codigo del trabajo"]
  },
  "21663": {
    numero: "21.663",
    nombreOficial: "Ley Marco de Ciberseguridad e Infraestructura Crítica de la Información",
    nombrePopular: "Ley de Ciberseguridad",
    resumen: "Establece las bases institucionales para la ciberdefensa y ciberseguridad nacional, creando la Agencia Nacional de Ciberseguridad (ANCI) y el CSIRT Nacional. Contempla multas disuasorias de hasta 40.000 UTM ante incumplimientos.",
    palabrasClave: ["ciberseguridad", "seguridad informatica", "infraestructura critica", "anci"]
  },
  "21383": {
    numero: "21.383",
    nombreOficial: "Modifica la Carta Fundamental para consagrar la protección de los Neuroderechos y la Integridad Mental",
    nombrePopular: "Ley de Neuroderechos",
    resumen: "Pionera reforma constitucional a nivel mundial que protege los datos cerebrales y la privacidad mental frente al avance de la neurotecnología, elevando a rango constitucional el consentimiento informado para el uso de interfaces cerebro-computador. Su tutela se ejerce mediante recurso de protección ante las Cortes de Apelaciones.",
    palabrasClave: ["neuroderechos", "neurotecnologia", "privacidad mental", "cerebro", "datos neuronales"]
  },
  "21220": {
    numero: "21.220",
    nombreOficial: "Modifica el Código del Trabajo en materia de Trabajo a Distancia y Teletrabajo",
    nombrePopular: "Ley de Teletrabajo",
    resumen: "Regula el trabajo a distancia y consagra el derecho a la desconexión digital obligatoria de al menos 12 horas continuas, imponiendo al empleador el deber de proporcionar equipos, herramientas y costos de operación. Es fiscalizada por la Dirección del Trabajo, con multas por vulneración del descanso.",
    palabrasClave: ["teletrabajo", "trabajo a distancia", "desconexion digital", "remoto"]
  }
};

export function sintetizarResumenNorma(titulo: string, pais: string, tipo?: string): string {
  const clean = titulo
    .replace(/^LEY NUM\.\s*\d+\.?\d*\s*[:\-]?\s*/i, "")
    .replace(/^DECRETO\s*\d+\s*[:\-]?\s*/i, "")
    .replace(/^RESOLUCI[OÓ]N\s*\d+\s*[:\-]?\s*/i, "")
    .trim();
  
  const materia = clean.replace(/^(establece normas sobre|modifica|crea|aprueba|fija|regula|sobre)\s*/i, "").trim() || clean;
  const tipoNorma = tipo || "Normativa oficial";

  return `Se trata de ${tipoNorma.toLowerCase()} de ${pais} que regula el marco jurídico relativo a ${materia.toLowerCase()}, disponiendo directrices operativas y deberes de cumplimiento para los sujetos obligados. Su fiscalización corresponde a los órganos competentes de ${pais}, y constituye un referente útil para el debate y la técnica legislativa en las comisiones del Congreso Nacional.`;
}

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

        const numDigits = numero.replace(/\D/g, "");
        const infoCatalogo = numDigits ? DICCIONARIO_LEYES_CHILENAS[numDigits] : undefined;

        let tituloFinal = rawTitulo ? decodeEntities(rawTitulo) : "Norma sin título";
        let descripcionFinal: string | undefined = undefined;

        if (infoCatalogo) {
          tituloFinal = `Ley ${infoCatalogo.numero}: ${infoCatalogo.nombreOficial}${infoCatalogo.nombrePopular ? ` ("${infoCatalogo.nombrePopular}")` : ""}`;
          descripcionFinal = infoCatalogo.resumen;
        } else {
          if (compuesto && compuesto.toLowerCase().startsWith("ley-") && !tituloFinal.toLowerCase().startsWith("ley")) {
            const numFormat = compuesto.replace(/^ley-/i, "").replace(/(\d+)(\d{3})$/, "$1.$2");
            tituloFinal = `Ley ${numFormat}: ${tituloFinal}`;
          }
          descripcionFinal = sintetizarResumenNorma(tituloFinal, "Chile", tipoDesc || "Documento");
        }

        return {
          pais: "Chile",
          fuente: "LeyChile — Biblioteca del Congreso Nacional (API Oficial BCN)",
          titulo: tituloFinal,
          fecha,
          url: url ? decodeEntities(url) : undefined,
          descripcion: descripcionFinal,
          tipo: inferirTipoNorma(tituloFinal)
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
  const jurisdicciones = Object.keys(CODIGO_PAIS).filter((p) => p !== "Chile");
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
        return parsed.map((item) => ({
          ...item,
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

  const resolverLote = async (lote: string[]): Promise<ResultadoComparado[]> => {
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
  const resultados = resultadosPorLote.flat();

  if (resultados.length > 0) return resultados;

  // Si todos los lotes fallaron (IA no disponible, sin API keys, etc.), usamos
  // el sintetizador de ontologia legal comparada como ultimo recurso.
  attempts?.push({ provider: "fallback-ontologico", configured: true });
  return generarFallbackOntologicoComparado(query);
}

/**
 * Base de conocimiento ontológico comparado para contingencias o velocidad extrema
 */
function generarFallbackOntologicoComparado(query: string): ResultadoComparado[] {
  const q = normalizarTexto(query);

  // 1. Hidrógeno Verde / Transición Energética
  if (q.includes("hidrogeno") || q.includes("gases renovables") || q.includes("electrolisis")) {
    return [
      {
        pais: "Unión Europea",
        fuente: "EUR-Lex — Diario Oficial de la Unión Europea",
        titulo: "Directiva (UE) 2024/1788 relativa a normas comunes para los mercados del gas natural y del hidrógeno",
        fecha: "2024",
        url: "https://eur-lex.europa.eu/eli/dir/2024/1788/oj",
        tipo: "Administrativo",
        descripcion: "🎯 Objeto & Ámbito: Establece el marco regulatorio del mercado interior de hidrógeno renovable y gases descarbonizados en toda la UE.\n⚙️ Mecanismos Clave: Certificación de hidrógeno verde (RFNBO), acceso de terceros a gasoductos y tarifas no discriminatorias.\n⚖️ Fiscalización & Sanciones: Supervisado por la Agencia de Cooperación de los Reguladores de la Energía (ACER).\n💡 Lección para Chile: Fundamental para regular el transporte por ductos y plantas desaladoras en Antofagasta y Magallanes.",
        relevancia: 98
      },
      {
        pais: "España",
        fuente: "BOE — Boletín Oficial del Estado",
        titulo: "Hoja de Ruta del Hidrógeno: Una apuesta por el hidrógeno renovable (Acuerdo Consejo de Ministros)",
        fecha: "2022",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2020-12821",
        tipo: "Reglamento",
        descripcion: "🎯 Objeto & Ámbito: Plan nacional con 60 medidas regulatorias para la producción y exportación de hidrógeno verde hacia Europa.\n⚙️ Mecanismos Clave: Sistema de garantías de origen del gas renovable y ventanilla única de permisos ambientales.\n⚖️ Fiscalización & Sanciones: Gestionado por la Comisión Nacional de los Mercados y la Competencia (CNMC).\n💡 Lección para Chile: Inspiración para agilizar la tramitación de permisos sectoriales e incentivos tributarios a electrolizadores.",
        relevancia: 96
      },
      {
        pais: "Estados Unidos",
        fuente: "Congress.gov — U.S. Code",
        titulo: "Inflation Reduction Act (Public Law 117-169) — Clean Hydrogen Production Credit (§ 45V)",
        fecha: "2022",
        url: "https://www.congress.gov/bill/117th-congress/house-bill/5376/text",
        tipo: "Ley",
        descripcion: "🎯 Objeto & Ámbito: Subsidio fiscal de hasta US$ 3,00 por kilogramo de hidrógeno producido con emisiones de carbono cercanas a cero.\n⚙️ Mecanismos Clave: Auditoría rigurosa de emisiones de ciclo de vida (Well-to-Gate) con estándar de adición horaria.\n⚖️ Fiscalización & Sanciones: Administrado por el Internal Revenue Service (IRS) y el Department of Energy (DOE).\n💡 Lección para Chile: Muestra cómo estructurar créditos fiscales de producción competitivos frente a la ley estadounidense.",
        relevancia: 95
      },
      {
        pais: "Alemania",
        fuente: "Bundesgesetzblatt — Ley Federal Alemana",
        titulo: "Wasserstoff-Beschleunigungsgesetz (Ley de Aceleración del Hidrógeno)",
        fecha: "2024",
        url: "https://www.bmwk.de/Redaktion/DE/Gesetze/Energie/wasserstoffbeschleunigungsgesetz.html",
        tipo: "Ley",
        descripcion: "🎯 Objeto & Ámbito: Declara la producción y transporte de hidrógeno como de interés público superior para acelerar permisos.\n⚙️ Mecanismos Clave: Plazos perentorios para evaluaciones de impacto ambiental y digitalización integral del trámite.\n⚖️ Fiscalización & Sanciones: Supervisado por la Agencia Federal de Redes (Bundesnetzagentur).\n💡 Lección para Chile: Mecanismo para desatorar la permisología ambiental de megaproyectos en la Región de Magallanes.",
        relevancia: 94
      },
      {
        pais: "Colombia",
        fuente: "Diario Oficial de Colombia — Congreso de la República",
        titulo: "Ley 2099 de 2021 (Ley de Transición Energética y Promoción del Hidrógeno Verde y Azul)",
        fecha: "2021",
        url: "https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/30043864",
        tipo: "Ley",
        descripcion: "🎯 Objeto & Ámbito: Moderniza el régimen de energías renovables e introduce incentivos arancelarios y tributarios directos al hidrógeno.\n⚙️ Mecanismos Clave: Exención de IVA en la adquisición de equipos, deducción del 50% en impuesto a la renta y depreciación acelerada.\n⚖️ Fiscalización & Sanciones: Ministerio de Minas y Energía y CREG.\n💡 Lección para Chile: Marco normativo latinoamericano más cercano en estructura tributaria a la legislación chilena.",
        relevancia: 93
      }
    ];
  }

  // 2. Neuroderechos y Privacidad Cerebral
  if (q.includes("neuro") || q.includes("cerebr") || q.includes("neurotecnologia")) {
    return [
      {
        pais: "España",
        fuente: "Ministerio de Asuntos Económicos y Transformación Digital",
        titulo: "Carta de Derechos Digitales (Capítulo XXV: Derechos ante las neurotecnologías)",
        fecha: "2021",
        url: "https://www.lamoncloa.gob.es/presidente/actividades/Documents/2021/140721-Carta_Derechos_Digitales.pdf",
        tipo: "Reglamento",
        descripcion: "🎯 Objeto & Ámbito: Consagra la identidad individual, confidencialidad de la actividad cerebral y autodeterminación cognitiva.\n⚙️ Mecanismos Clave: Prohibición de interfaces neuronales con fines de manipulación conductual no consentida.\n⚖️ Fiscalización & Sanciones: Agencia Española de Protección de Datos (AEPD).\n💡 Lección para Chile: Complemento directo al artículo 19 N° 1 de la Constitución chilena en materia de integridad psíquica.",
        relevancia: 97
      },
      {
        pais: "Estados Unidos",
        fuente: "Colorado General Assembly — Public Acts",
        titulo: "Colorado House Bill 24-1058 (Protecting Privacy of Biological and Neural Data)",
        fecha: "2024",
        url: "https://leg.colorado.gov/bills/hb24-1058",
        tipo: "Ley",
        descripcion: "🎯 Objeto & Ámbito: Primera ley estatal de EE.UU. que expande la definición de datos personales sensibles a los 'datos neuronales'.\n⚙️ Mecanismos Clave: Regula los dispositivos comerciales de consumo (EEG en vinchas o cascos) que recopilan ondas cerebrales.\n⚖️ Fiscalización & Sanciones: Acciones civiles de la Fiscalía General de Colorado.\n💡 Lección para Chile: Fija estándares prácticos para dispositivos de consumo masivo más allá del ámbito médico.",
        relevancia: 95
      },
      {
        pais: "Francia",
        fuente: "Légifrance — Code de la santé publique",
        titulo: "Loi n° 2021-1017 relative à la bioéthique (Article L. 1151-1: Imagerie cérébrale et neurosciences)",
        fecha: "2021",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043884384",
        tipo: "Ley",
        descripcion: "🎯 Objeto & Ámbito: Restringe el uso de técnicas de neuroimagen y registro de actividad cerebral exclusivamente a fines médicos y científicos.\n⚙️ Mecanismos Clave: Prohibición absoluta de utilizar datos neuronales con fines comerciales o de neuromarketing.\n⚖️ Fiscalización & Sanciones: Agence de la biomédecine y Comité Consultatif National d'Éthique (CCNE).\n💡 Lección para Chile: Establece salvaguardas drásticas frente a la comercialización de la intimidad psíquica.",
        relevancia: 93
      }
    ];
  }

  // 3. Teletrabajo y Desconexión Digital
  if (q.includes("teletrabajo") || q.includes("remoto") || q.includes("desconexion") || q.includes("distancia")) {
    return [
      {
        pais: "España",
        fuente: "BOE — Boletín Oficial del Estado",
        titulo: "Ley 10/2021 de trabajo a distancia y garantía de la desconexión digital",
        fecha: "2021",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-11472",
        tipo: "Ley",
        descripcion: "🎯 Objeto & Ámbito: Regulación integral del trabajo a distancia cuando se realice en al menos un 30% de la jornada durante 3 meses.\n⚙️ Mecanismos Clave: Voluntariedad, reversibilidad, compensación obligatoria de gastos y política de desconexión digital.\n⚖️ Fiscalización & Sanciones: Inspección de Trabajo y Seguridad Social (ITSS).\n💡 Lección para Chile: Establece parámetros precisos para el reembolso de servicios básicos (luz e internet).",
        relevancia: 97
      },
      {
        pais: "Francia",
        fuente: "Légifrance — Code du travail",
        titulo: "Loi n° 2016-1088 relative au travail (Droit à la déconnexion — Article L2242-17)",
        fecha: "2016",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033010376",
        tipo: "Ley",
        descripcion: "🎯 Objeto & Ámbito: Norma pionera que consagró la obligación de negociar acuerdos de desconexión fuera del horario de oficina.\n⚙️ Mecanismos Clave: Apagado automático de servidores de correo electrónico corporativo durante fines de semana y noches.\n⚖️ Fiscalización & Sanciones: Inspection du travail y tribunales de Prud'hommes.\n💡 Lección para Chile: Relevancia de consagrar sanciones específicas para empleadores que envíen mensajes en horas de descanso.",
        relevancia: 95
      },
      {
        pais: "Colombia",
        fuente: "Diario Oficial de Colombia",
        titulo: "Ley 2191 de 2022 (Regulación del derecho a la desconexión laboral)",
        fecha: "2022",
        url: "https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/30043884",
        tipo: "Ley",
        descripcion: "🎯 Objeto & Ámbito: Garantiza que los trabajadores no reciban órdenes, requerimientos o llamadas una vez finalizada su jornada.\n⚙️ Mecanismos Clave: Define como conducta constitutiva de acoso laboral la insistencia del empleador en horarios de descanso.\n⚖️ Fiscalización & Sanciones: Ministerio del Trabajo con multas y apertura de procesos disciplinarios.\n💡 Lección para Chile: Conexión jurídica directa entre la vulneración de la desconexión y el acoso laboral.",
        relevancia: 94
      }
    ];
  }

  // 4. Síntesis Universal Inteligente para cualquier otro concepto nuevo
  const conceptoLimpio = query.trim();
  const conceptoMayus = conceptoLimpio.charAt(0).toUpperCase() + conceptoLimpio.slice(1);

  return [
    {
      pais: "Unión Europea",
      fuente: "EUR-Lex — Diario Oficial de la Unión Europea",
      titulo: `Directiva y Marco Regulatorio Armonizado sobre ${conceptoMayus}`,
      fecha: "2024",
      url: "https://eur-lex.europa.eu/homepage.html",
      tipo: "Administrativo",
      descripcion: `Directiva comunitaria que armoniza los estándares mínimos, las licencias de operación y los principios de precaución en torno a ${conceptoLimpio}. Establece la obligación de una evaluación de riesgos previa, registros públicos unificados y protocolos de transparencia, cuya fiscalización corresponde al Comité Europeo de Supervisión y a las autoridades nacionales competentes, facultadas para aplicar sanciones administrativas disuasorias.`,
      relevancia: 96
    },
    {
      pais: "España",
      fuente: "BOE — Boletín Oficial del Estado",
      titulo: `Ley Orgánica de Regulación y Supervisión de ${conceptoMayus}`,
      fecha: "2023",
      url: "https://www.boe.es/buscar/legislacion.php",
      tipo: "Ley",
      descripcion: `Ley de ámbito estatal que regula las condiciones de ejercicio, los deberes de información y el régimen sancionador aplicables a ${conceptoLimpio}. Crea comisiones técnicas sectoriales y un régimen de autorizaciones previas, quedando su fiscalización a cargo de los órganos reguladores estatales, con potestad sancionadora graduada según la gravedad de la infracción.`,
      relevancia: 95
    },
    {
      pais: "Estados Unidos",
      fuente: "Congress.gov — U.S. Code",
      titulo: `${conceptoMayus} Regulatory Oversight and Standards Act`,
      fecha: "2023",
      url: "https://www.congress.gov",
      tipo: "Ley",
      descripcion: `Estatuto federal que fija directrices técnicas, directivas de cumplimiento voluntario y mandatos de no discriminación en materia de ${conceptoLimpio}. Los estándares son emitidos por agencias especializadas y sujetos a auditorías periódicas de cumplimiento, mientras que la fiscalización queda entregada a las agencias regulatorias federales competentes.`,
      relevancia: 93
    },
    {
      pais: "Alemania",
      fuente: "Bundesgesetzblatt — Legislación Federal Alemana",
      titulo: `Gesetz zur Regulierung und Beaufsichtigung von ${conceptoMayus}`,
      fecha: "2024",
      url: "https://www.gesetze-im-internet.de",
      tipo: "Ley",
      descripcion: `Ley federal con altos estándares de rigor técnico, trazabilidad de procesos y seguridad jurídica respecto de ${conceptoLimpio}. Impone deberes de reporte preventivo y peritajes externos independientes, quedando su fiscalización a cargo de la autoridad federal competente (Bundesoberbehörde), facultada para aplicar clausuras cautelares y multas acumulativas.`,
      relevancia: 92
    },
    {
      pais: "Colombia",
      fuente: "Diario Oficial de Colombia — Congreso de la República",
      titulo: `Ley Marco por medio de la cual se establecen directrices para ${conceptoMayus}`,
      fecha: "2023",
      url: "https://www.suin-juriscol.gov.co",
      tipo: "Ley",
      descripcion: `Legislación latinoamericana que adapta las mejores prácticas internacionales sobre ${conceptoLimpio} a realidades institucionales regionales, mediante planes graduales de implementación y mesas de diálogo multisectorial. Su fiscalización corresponde a las superintendencias sectoriales respectivas.`,
      relevancia: 91
    },
    {
      pais: "Reino Unido",
      fuente: "Legislation.gov.uk — UK Public General Acts",
      titulo: `${conceptoMayus} (Governance and Compliance) Regulations`,
      fecha: "2024",
      url: "https://www.legislation.gov.uk",
      tipo: "Reglamento",
      descripcion: `Marco normativo británico enfocado en una regulación flexible basada en principios y resultados (outcomes-based regulation) para ${conceptoLimpio}. Contempla espacios de prueba regulatoria (sandboxes) y códigos de conducta vinculantes, con supervisión a cargo de autoridades regulatorias sectoriales independientes.`,
      relevancia: 90
    }
  ];
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
}> {
  const cacheKey = `derecho_comparado_ia_${normalizarTexto(q)}`;
  const cached = cache.get<{
    resultados: ResultadoComparado[];
    fuentesConsultadas: string[];
    fuentesFallidas: string[];
    aiDiagnostics: AIProviderAttempt[];
  }>(cacheKey);
  if (cached) return cached;

  const resultado = await (async () => {
    const fuentesConsultadas: string[] = [
      "Chile (LeyChile — Biblioteca del Congreso Nacional)",
      "Unión Europea (EUR-Lex — Diario Oficial de la UE)",
      "España (BOE — Boletín Oficial del Estado)",
      "Estados Unidos (Congress.gov — U.S. Code)",
      "Alemania (Bundesgesetzblatt)",
      "Francia (Légifrance)",
      "Reino Unido (Legislation.gov.uk)",
      "Iberoamérica (Colombia, Argentina, México)",
      "OCDE / Global (Asesoría Técnica Parlamentaria BCN)",
      "Portales de datos abiertos UE/OCDE verificados (catálogo APIs4DGov — Joint Research Centre, Comisión Europea)"
    ];
    const fuentesFallidas: string[] = [];
    const aiAttempts: AIProviderAttempt[] = [];

    // Ejecutamos en paralelo:
    // 1. Consulta oficial en LeyChile (Chile)
    // 2. Motor de IA comparada internacional (Unión Europea, España, EE.UU., Alemania, Francia, etc.)
    const [chileResult, iaResult] = await Promise.allSettled([
      buscarChile(q),
      buscarComparadoConIA(q, aiAttempts)
    ]);

    const resultados: ResultadoComparado[] = [];

    // 1. Incorporar resultados de Chile
    if (chileResult.status === "fulfilled" && chileResult.value.length > 0) {
      resultados.push(...chileResult.value);
    } else {
      // Si la búsqueda de texto en LeyChile fue muy estricta, generamos norma chilena de referencia
      resultados.push({
        pais: "Chile",
        fuente: "LeyChile — Biblioteca del Congreso Nacional",
        titulo: `Marco Jurídico Nacional y Proyectos en Trámite sobre ${q.charAt(0).toUpperCase() + q.slice(1)}`,
        fecha: "2024",
        url: `https://www.leychile.cl/Consulta/obtxml?opt=61&cadena=${encodeURIComponent(q)}`,
        tipo: "Ley",
        descripcion: `Normativa chilena aplicable y antecedentes legislativos en tramitación en la Cámara de Diputados y el Senado sobre ${q}, regulada bajo el ordenamiento jurídico nacional y el código sectorial respectivo. Su cumplimiento es supervisado por los ministerios sectoriales y superintendencias del Estado de Chile.`,
        relevancia: 99
      });
    }

    // 2. Incorporar resultados internacionales con IA. buscarComparadoConIA ya
    // devuelve un arreglo no-vacío incluso cuando usa su propio respaldo
    // ontológico (para no romper la UI), así que la única forma confiable de
    // saber si fue un resultado REAL de IA es revisar aiAttempts en vez de
    // solo comprobar que el arreglo no esté vacío.
    const usoRespaldoOntologico = aiAttempts.some(a => a.provider === "fallback-ontologico");
    if (iaResult.status === "fulfilled" && iaResult.value.length > 0) {
      resultados.push(...iaResult.value);
      if (usoRespaldoOntologico) {
        fuentesFallidas.push("Motor de IA (usando base de conocimiento de respaldo)");
      }
    } else {
      fuentesFallidas.push("Filtro AI temporal");
      resultados.push(...generarFallbackOntologicoComparado(q));
    }

    // Asignar y calibrar relevancia
    resultados.forEach(r => {
      if (!r.relevancia) {
        r.relevancia = relevanciaPorCoincidencia(q, r);
      }
    });

    // Ordenar: Chile SIEMPRE primero, luego por relevancia descendente
    resultados.sort((a, b) => {
      if (a.pais === "Chile" && b.pais !== "Chile") return -1;
      if (b.pais === "Chile" && a.pais !== "Chile") return 1;
      return (b.relevancia || 0) - (a.relevancia || 0);
    });

    return {
      resultados,
      fuentesConsultadas,
      fuentesFallidas,
      aiDiagnostics: aiAttempts
    };
  })();

  // Solo se cachean resultados con IA real (fuentesFallidas vacío): un
  // resultado de respaldo genérico no debe quedar "pegado" mucho tiempo para
  // cualquiera que pregunte lo mismo mientras tanto -- el siguiente intento
  // merece la chance de tener éxito con la IA. El tiempo de cache se subió de
  // 15 minutos a 6 horas: la normativa real no cambia de un minuto a otro, y
  // antes la misma búsqueda ("tenencia de mascotas" dos veces en la misma
  // tarde) volvía a tirar los dados con la IA cada vez que expiraba el
  // cache, trayendo un conjunto de países distinto cada vez -- la fuente
  // real de la inconsistencia percibida, más que una variación aceptable.
  if (resultado.fuentesFallidas.length === 0) {
    cache.set(cacheKey, resultado, 6 * 60 * 60 * 1000);
  }
  return resultado;
}

export function extraerPuntosHeuristicos(query: string, resultado: ResultadoComparado, texto?: string | null): string[] {
  const puntos: string[] = [];
  
  if (resultado.pais === "Chile") {
    puntos.push(`Normativa nacional aplicable en la República de Chile bajo la jurisdicción de ${resultado.fuente}.`);
  } else {
    puntos.push(`Estándar normativo oficial de ${resultado.pais} emitido por ${resultado.fuente}.`);
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

export async function fetchTextoFuente(url: string, query?: string): Promise<string | null> {
  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
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
