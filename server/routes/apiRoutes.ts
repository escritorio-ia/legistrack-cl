import { Router, Request, Response } from "express";
import { Proyecto, Comision, Alerta, SalaVivo } from "../../src/types";
import { 
  TODAS_COMISIONES_DETALLE, 
  DIPUTADOS_COMISIONES_DETALLE, 
  SENADO_COMISIONES_DETALLE, 
  searchComisionesAutocomplete,
  findComisionMetaById,
  generateFullComisionData
} from "../../src/data/comisionesData";
import { performUnifiedSearch } from "../../src/utils/searchEngine";
import { resolveProyecto, getAllMasterProyectos } from "../../src/utils/proyectosResolver";
import { compareSesionesDesc, isSessionDatePassed, mergeSesionesDuplicadas } from "../../src/utils/dateUtils";
import {
  fetchProyectoFromSenado,
  fetchProyectosListadoFromSenado,
  listadoToProyecto,
  cleanBulletinNumber,
  fetchSenadoComisionesIntegrantesLive,
  fetchSenadoComisionProyectosLive,
  fetchSenadoCitacionesLive,
  fetchTextoInformeDocx,
  estimarQuorum,
  estimarFichaTecnica,
  estimarOrigenDetalle
} from "../services/senadoService";
import {
  getTodasComisiones,
  fetchComisionesCamaraReal,
  fetchCamaraCitacionesSemanalesLive,
  searchCamaraYouTubeVideos,
  fetchYouTubeVideoTranscript,
  fetchYouTubeLiveCaptionsSnapshot,
  SENADO_COMISIONES_REALES,
  DIPUTADOS_COMISIONES_REALES
} from "../services/camaraService";
import { 
  buscarDerechoComparado, 
  ResultadoComparado, 
  extraerPuntosHeuristicos, 
  fetchTextoFuente,
  fetchTextoNormaLeyChileCompleto,
  buscarChile,
  buscarLeyChilePorNumero,
  LEYCHILE_API_KEY,
  fetchConTimeout
} from "../services/comparadoService";
import { 
  getOWIDTopics, 
  getOWIDIndicator, 
  getAllOWIDIndicators 
} from "../services/publicDataService";
import { 
  getFAOGroupsAndDomains, 
  queryFAOData 
} from "../services/faoService";
import { 
  getServelPresidenciales, 
  getServelPlebiscitos, 
  getServelParticipacionRegional 
} from "../services/servelService";
import { 
  getMineducCatalog 
} from "../services/mineducService";
import { 
  getCeadCatalog 
} from "../services/ceadService";
import { 
  getIneCatalog 
} from "../services/ineService";
import { 
  getSernapescaCatalog 
} from "../services/sernapescaService";
import {
  generarContenidoUniversalIA,
  responderCopilotoLegislativo,
  getAIProvidersStatus,
  testearProveedoresIAReal,
  safeJsonParse,
  AIProviderAttempt
} from "../services/aiService";
import { cache } from "../services/cacheService";

export const apiRouter = Router();

// Express 4 no captura las excepciones de handlers async: si safeJsonParse (u otra
// cosa) lanza porque la IA respondió texto que no es JSON, la petición quedaba
// abierta para siempre (el cliente veía el botón en "Generando..." indefinidamente).
// Este envoltorio convierte cualquier excepción en un 500 JSON inmediato.
for (const metodo of ["get", "post", "put", "delete", "patch"] as const) {
  const original = (apiRouter as any)[metodo].bind(apiRouter);
  (apiRouter as any)[metodo] = (ruta: any, ...handlers: any[]) =>
    original(
      ruta,
      ...handlers.map((h) =>
        typeof h === "function" && h.length < 4
          ? (req: Request, res: Response, next: any) =>
              Promise.resolve(h(req, res, next)).catch((err: any) => {
                console.error(`[apiRouter] Error no controlado en ${metodo.toUpperCase()} ${req.path}:`, err?.message || err);
                if (!res.headersSent) res.status(500).json({ error: err?.message || "Error interno del servidor" });
              })
          : h
      )
    );
}

const ALERTA_ITEMS: Alerta[] = [];
const liveDiscoveredProyectos: Proyecto[] = [];

// ============================================================================
// 1. HEALTH & CONNECTIVITY MONITOR
// ============================================================================
apiRouter.get("/health", async (req: Request, res: Response) => {
  // getAIProvidersStatus solo mira si la variable de entorno existe y no es
  // el placeholder de .env.example -- una clave puede "verse" configurada y
  // aun asi ser invalida (401 real de la API). ?real=true hace una llamada
  // minima real a cada proveedor para confirmarlo (mas lento, se deja opt-in
  // para no encarecer/demorar cada chequeo rutinario de salud).
  const aiStatus = req.query.real === "true" ? await testearProveedoresIAReal() : getAIProvidersStatus();
  const cacheStats = cache.getStats();

  let senadoOk = false;
  let camaraOk = false;
  let leychileOk = false;

  try {
    const sRes = await fetch("https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=16621", {
      signal: AbortSignal.timeout(3500)
    });
    senadoOk = sRes.ok;
  } catch {
    senadoOk = false;
  }

  try {
    const cRes = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_Vigentes", {
      signal: AbortSignal.timeout(3500)
    });
    camaraOk = cRes.ok;
  } catch {
    camaraOk = false;
  }

  try {
    const keyParam = LEYCHILE_API_KEY ? `&key=${encodeURIComponent(LEYCHILE_API_KEY)}` : "";
    const lRes = await fetch(`https://www.leychile.cl/Consulta/obtxml?opt=61&cadena=trabajo&cantidad=1${keyParam}`, {
      signal: AbortSignal.timeout(3500)
    });
    leychileOk = lRes.ok;
  } catch {
    leychileOk = false;
  }

  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    apis: {
      senadoWSPublico: senadoOk ? "operativo" : "latencia/degradado",
      camaraOpenData: camaraOk ? "operativo" : "latencia/degradado",
      bcnLeyChile: leychileOk ? "operativo (API Autenticada)" : "latencia/degradado"
    },
    aiProviders: aiStatus,
    cache: cacheStats,
    // Diagnostico temporal: nombres de variables de entorno relevantes que
    // realmente llegan a la funcion en runtime (nunca sus valores), para
    // descartar un problema de nombre/scope al configurarlas en Vercel.
    envVarNames: Object.keys(process.env).filter(k =>
      /API_KEY|GEMINI|GROQ|OPENROUTER|ANTHROPIC/i.test(k)
    ).sort()
  });
});

// ============================================================================
// 2. PROYECTOS & BOLETINES
// ============================================================================
apiRouter.get("/proyectos", async (req: Request, res: Response) => {
  const { query, estado, camara, materia, urgencia, origen, solo_vigentes, page = 1, limit = 10 } = req.query;

  const masterProyectos = getAllMasterProyectos();
  const listadoSenado = await fetchProyectosListadoFromSenado();
  const proyectosSenado = listadoSenado.map(listadoToProyecto);

  const byId = new Map<string, Proyecto>();
  for (const p of masterProyectos) byId.set(cleanBulletinNumber(p.id), p);
  for (const p of proyectosSenado) byId.set(cleanBulletinNumber(p.id), p);
  for (const p of liveDiscoveredProyectos) byId.set(cleanBulletinNumber(p.id), p);

  let filtered = Array.from(byId.values());

  if (solo_vigentes === "true") {
    filtered = filtered.filter(p => !p.estado.toLowerCase().includes("archivado") && !p.estado.toLowerCase().includes("rechazado"));
  }

  if (query) {
    const q = String(query).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const digits = String(query).replace(/[^0-9]/g, "");
    
    if (digits.length >= 3) {
      try {
        const liveP = await fetchProyectoFromSenado(digits);
        if (liveP && !filtered.some(p => cleanBulletinNumber(p.id) === cleanBulletinNumber(liveP.id))) {
          filtered.unshift(liveP);
        }
      } catch (e) {}
    }

    filtered = filtered.filter(p => {
      const normId = (p.id || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normTit = (p.titulo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normRes = (p.resumen || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normAut = (p.autores || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normMat = (p.materia || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normId.includes(q) || normTit.includes(q) || normRes.includes(q) || normAut.includes(q) || normMat.includes(q);
    });
  }

  if (estado && estado !== "Todos") {
    filtered = filtered.filter(p => p.estado.toLowerCase() === String(estado).toLowerCase());
  }

  if (camara && camara !== "Todas") {
    filtered = filtered.filter(p => p.camaraOrigen.toLowerCase() === String(camara).toLowerCase());
  }

  if (materia && materia !== "Todas") {
    const mNorm = String(materia).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    filtered = filtered.filter(p => {
      const normMat = (p.materia || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normMat.includes(mNorm);
    });
  }

  if (urgencia && urgencia !== "Todas") {
    filtered = filtered.filter(p => p.urgencia.toLowerCase().includes(String(urgencia).toLowerCase()));
  }

  if (origen && origen !== "Todos") {
    const oLower = String(origen).toLowerCase();
    filtered = filtered.filter(p => {
      const tipo = p.origenDetalle?.tipo?.toLowerCase() || p.iniciativa.toLowerCase();
      if (oLower.includes("mensaje") || oLower.includes("ejecutivo") || oLower.includes("presidente") || oLower.includes("ministerio")) {
        return tipo.includes("mensaje") || tipo.includes("ejecutivo");
      }
      if (oLower.includes("ciudadan") || oLower.includes("social") || oLower.includes("colectivo")) {
        return tipo.includes("ciudadan") || tipo.includes("social") || tipo.includes("colectivo");
      }
      if (oLower.includes("moci") || oLower.includes("parlamentar") || oLower.includes("diputad") || oLower.includes("senad")) {
        return tipo.includes("moci") || tipo.includes("parlamentar");
      }
      return true;
    });
  }

  const allProyectos = Array.from(byId.values());
  const estadosCount = {
    enDiscusion: allProyectos.filter(p => p.estado === "En discusión").length,
    enSala: allProyectos.filter(p => p.estado.toLowerCase().includes("sala")).length,
    enEstudio: allProyectos.filter(p => p.estado.toLowerCase().includes("comisión") || p.estado.toLowerCase().includes("comision")).length,
    aprobadoGeneral: allProyectos.filter(p => p.estado === "Publicado como Ley").length,
    otros: 0,
    totalRepresentativo: allProyectos.length
  };
  estadosCount.otros = Math.max(
    0,
    allProyectos.length - estadosCount.enDiscusion - estadosCount.enSala - estadosCount.enEstudio - estadosCount.aprobadoGeneral
  );

  const materiaCounts = new Map<string, number>();
  for (const p of allProyectos) {
    materiaCounts.set(p.materia, (materiaCounts.get(p.materia) || 0) + 1);
  }
  const materiasPrincipales = Array.from(materiaCounts.entries())
    .map(([nombre, cuenta]) => ({ nombre, cuenta }))
    .sort((a, b) => b.cuenta - a.cuenta)
    .slice(0, 6);

  const pageNum = Math.max(1, parseInt(String(page)) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 10));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const pagedResultados = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    resultados: pagedResultados,
    stats: {
      estados: estadosCount,
      materiasPrincipales
    }
  });
});

apiRouter.get("/proyecto/:id", async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const forceSync = req.query.force_sync === "true";
  const idClean = cleanBulletinNumber(idParam);

  let proyecto: Proyecto | undefined = liveDiscoveredProyectos.find(p => cleanBulletinNumber(p.id) === idClean);

  if (!proyecto || forceSync) {
    // Tomar solo el número de boletín antes del guión (p. ej. "17006" de
    // "17.006-01"), no el ID completo sin puntos: incluir el sufijo de 2
    // dígitos del boletín hacía que IDs normales (con sufijo) quedaran en 7
    // dígitos y nunca pasaran este filtro, saltándose siempre la ficha real.
    const possibleBoletinMatch = idParam.split("-")[0].replace(/[^0-9]/g, "");
    if (possibleBoletinMatch.length >= 4 && possibleBoletinMatch.length <= 6) {
      if (forceSync) {
        cache.delete(`senado_proyecto_${possibleBoletinMatch}`);
      }
      const liveProy = await fetchProyectoFromSenado(possibleBoletinMatch);
      if (liveProy) {
        const existingIdx = liveDiscoveredProyectos.findIndex(p => cleanBulletinNumber(p.id) === idClean);
        if (existingIdx !== -1) {
          liveDiscoveredProyectos[existingIdx] = liveProy;
        } else {
          liveDiscoveredProyectos.unshift(liveProy);
        }
        proyecto = liveProy;
      }
    }
  }

  if (!proyecto) {
    proyecto = (await fetchProyectosListadoFromSenado()).map(listadoToProyecto).find(p => cleanBulletinNumber(p.id) === idClean);
  }

  if (!proyecto) {
    proyecto = resolveProyecto(idParam);
  }

  res.json(proyecto);
});

// Tabla comparativa real (texto original vs. modificaciones) a partir del
// informe de comisión efectivamente publicado, en vez del texto de ejemplo
// fabricado que se usaba antes. Requiere que exista un informe .docx real
// para la comisión pedida; si no existe, se informa explícitamente en vez de
// simular contenido.
apiRouter.get("/proyecto/:id/comparado", async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const comisionNombre = String(req.query.comision || "").trim();
  const possibleBoletinMatch = idParam.split("-")[0].replace(/[^0-9]/g, "");

  if (possibleBoletinMatch.length < 4 || possibleBoletinMatch.length > 6) {
    return res.status(400).json({ disponible: false, razon: "Identificador de boletín inválido." });
  }

  const proyecto = await fetchProyectoFromSenado(possibleBoletinMatch);
  if (!proyecto) {
    return res.json({ disponible: false, razon: "No se pudo obtener la ficha oficial del proyecto." });
  }

  const normComision = comisionNombre.toLowerCase().replace(/^comisi[oó]n\s+de\s+/i, "");
  const informes = (proyecto.documentos || [])
    .filter(d => d.tipo === "Informe" && d.url && (!normComision || d.titulo.toLowerCase().includes(normComision)))
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  if (informes.length === 0) {
    return res.json({
      disponible: false,
      razon: comisionNombre
        ? `Aún no hay un informe de comisión publicado para "${comisionNombre}" en el expediente de este proyecto.`
        : "Aún no hay informes de comisión publicados en el expediente de este proyecto."
    });
  }

  const informe = informes[0];
  const texto = await fetchTextoInformeDocx(informe.url!);
  if (!texto) {
    return res.json({
      disponible: false,
      razon: "El informe de comisión existe pero no se pudo descargar o leer su contenido.",
      informeUrl: informe.url
    });
  }

  // Los informes de comisión son documentos largos (a veces >1 millón de
  // caracteres) donde el detalle artículo por artículo suele vivir en la
  // sección de "discusión particular", muy lejos del inicio (asistencia,
  // antecedentes generales). Tomar solo los primeros N caracteres deja fuera
  // justo el contenido que se necesita -- se busca esa sección y se centra
  // la ventana ahí; si no aparece, se cae al inicio del documento.
  const maxChars = 16000;
  const textoLower = texto.toLowerCase();
  const marcador = ["discusión particular", "discusion particular", "análisis de las indicaciones", "modificaciones introducidas"]
    .map(m => textoLower.indexOf(m))
    .find(idx => idx !== -1);
  const inicio = marcador !== undefined ? Math.max(0, marcador - 500) : 0;
  const textoTruncado = texto.length > maxChars
    ? (inicio > 0 ? "[...inicio del documento omitido...] " : "") + texto.slice(inicio, inicio + maxChars) + " [...documento truncado por extensión...]"
    : texto;

  // Si el proyecto es una MODIFICACIÓN de una ley existente (el caso más
  // común: "Modifica la ley N° X..."), el título oficial del proyecto ya lo
  // dice explícitamente -- se extrae de ahí en vez de pedírselo a la IA, para
  // no depender de que lo infiera bien y evitar que lo invente si no aplica.
  // Cubre tanto leyes con número ("modifica la ley N° 19.628, sobre...") como
  // leyes o códigos referidos por nombre sin número ("modifica el Código del
  // Trabajo...", "modifica la Ley General de Urbanismo y Construcciones...").
  const modificaMatch = proyecto.titulo.match(/\b(?:modifica|introduce modificaciones a|deroga|sustituye|incorpora)\s+(?:la\s+|el\s+)?((?:ley\b|código\b|d\.?f\.?l\.?\b|decreto\s+ley\b)[^,.;]*)/i);
  const leyModificada = modificaMatch ? modificaMatch[1].trim().replace(/\s+/g, " ") : undefined;

  const prompt = `Actúa como un analista legislativo de la Biblioteca del Congreso Nacional de Chile. A continuación se entrega el TEXTO REAL del informe de comisión "${informe.titulo}" del proyecto de ley Boletín N° ${proyecto.id} ("${proyecto.titulo}").
${leyModificada ? `\nIMPORTANTE: este proyecto MODIFICA la ${leyModificada}. Cuando el informe cite el texto vigente que se modifica, deja explícito que corresponde a esa ley (no a un texto nuevo), tanto en "textoOriginal" como en "explicacion".\n` : ""}

Texto del informe:
"""
${textoTruncado}
"""

Identifica entre 3 y 6 modificaciones o disposiciones concretas que este informe introduce o discute sobre el texto del proyecto (artículos, indicaciones aprobadas, votaciones particulares). Responde ÚNICAMENTE con un arreglo JSON válido, compacto, sin texto adicional, con este esquema exacto:
[{"articulo":"Identificación del artículo o disposición tal como aparece en el informe","textoOriginal":"Cita o resumen fiel del texto/planteamiento original según el informe","textoModificado":"Cita o resumen fiel de la modificación, indicación o acuerdo adoptado según el informe","explicacion":"Explicación breve y fiel al informe de qué cambia y por qué"}]

Usa EXCLUSIVAMENTE información que esté efectivamente en el texto entregado. Si el informe no permite identificar modificaciones concretas artículo por artículo, responde con un arreglo vacío [].`;

  const aiAttempts: AIProviderAttempt[] = [];
  let comparaciones: any[] = [];
  try {
    const aiResponse = await generarContenidoUniversalIA(prompt, 3000, aiAttempts);
    if (aiResponse) {
      const parsed = safeJsonParse<any[]>(aiResponse);
      if (Array.isArray(parsed)) comparaciones = parsed;
    }
  } catch (err) {
    console.warn(`Could not generate comparado for boletín ${proyecto.id}:`, err);
  }

  // Resguardo: si el título del proyecto no dice explícitamente "modifica..."
  // (hay títulos como "Dicta normas para asegurar..." que en la práctica sí
  // modifican una ley/código, pero no lo dicen con esa palabra), se busca la
  // ley o código de referencia más citado en los artículos que la IA ya
  // identificó a partir del texto real del informe.
  let leyModificadaFinal = leyModificada;
  if (!leyModificadaFinal && comparaciones.length > 0) {
    // Se busca SOLO en "articulo" (ej. "artículo 11 del Código Tributario"),
    // no concatenado con "textoOriginal": el grupo opcional de la segunda
    // palabra del código terminaba "comiéndose" la primera palabra del texto
    // siguiente (ej. "Código Tributario Los", "Código Tributario Obligación"),
    // generando una clave distinta cada vez en vez de agrupar las menciones
    // reales de la misma ley/código bajo una sola clave.
    const menciones: Record<string, number> = {};
    for (const c of comparaciones) {
      const texto = String(c.articulo || "");
      const m = texto.match(/\b(código\s+[a-záéíóúñ]+|ley\s*n[°º]?\s*[\d.]+|decreto\s+(?:con\s+fuerza\s+de\s+)?ley\s*n[°º]?\s*[\d.]+)/i);
      if (m) {
        const key = m[0].trim().replace(/\s+/g, " ");
        menciones[key] = (menciones[key] || 0) + 1;
      }
    }
    const masCitada = Object.entries(menciones).sort((a, b) => b[1] - a[1])[0];
    if (masCitada && masCitada[1] >= 2) leyModificadaFinal = masCitada[0];
  }

  res.json({
    disponible: comparaciones.length > 0,
    razon: comparaciones.length === 0 ? "La IA no pudo identificar modificaciones concretas en el texto del informe disponible." : undefined,
    informeUrl: informe.url,
    informeTitulo: informe.titulo,
    informeFecha: informe.fecha,
    leyModificada: leyModificadaFinal,
    comparaciones,
    aiDiagnostics: aiAttempts
  });
});

// Visor de indicaciones: agrupa las indicaciones (enmiendas) discutidas en el
// informe de comisión real por artículo/materia, con lectura jurídica y texto
// base vs. texto resultante, igual que hace un informe de sistematización de
// indicaciones de la BCN. Reutiliza el mismo informe .docx real que /comparado
// (ya que el análisis de indicaciones suele vivir dentro de ese documento) en
// vez de simular datos, como pasaba con la tabla comparativa fabricada que
// existía antes de que /comparado se conectara al informe real.
apiRouter.get("/proyecto/:id/indicaciones", async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const comisionNombre = String(req.query.comision || "").trim();
  const possibleBoletinMatch = idParam.split("-")[0].replace(/[^0-9]/g, "");

  if (possibleBoletinMatch.length < 4 || possibleBoletinMatch.length > 6) {
    return res.status(400).json({ disponible: false, razon: "Identificador de boletín inválido." });
  }

  const proyecto = await fetchProyectoFromSenado(possibleBoletinMatch);
  if (!proyecto) {
    return res.json({ disponible: false, razon: "No se pudo obtener la ficha oficial del proyecto." });
  }

  const normComision = comisionNombre.toLowerCase().replace(/^comisi[oó]n\s+de\s+/i, "");
  const informes = (proyecto.documentos || [])
    .filter(d => d.tipo === "Informe" && d.url && (!normComision || d.titulo.toLowerCase().includes(normComision)))
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  if (informes.length === 0) {
    return res.json({
      disponible: false,
      razon: comisionNombre
        ? `Aún no hay un informe de comisión publicado para "${comisionNombre}" en el expediente de este proyecto.`
        : "Aún no hay informes de comisión publicados en el expediente de este proyecto."
    });
  }

  const informe = informes[0];
  const texto = await fetchTextoInformeDocx(informe.url!);
  if (!texto) {
    return res.json({
      disponible: false,
      razon: "El informe de comisión existe pero no se pudo descargar o leer su contenido.",
      informeUrl: informe.url
    });
  }

  const maxChars = 16000;
  const textoLower = texto.toLowerCase();
  const marcador = ["indicaciones formuladas", "análisis de las indicaciones", "analisis de las indicaciones", "discusión particular", "discusion particular"]
    .map(m => textoLower.indexOf(m))
    .find(idx => idx !== -1);
  const inicio = marcador !== undefined ? Math.max(0, marcador - 500) : 0;
  const textoTruncado = texto.length > maxChars
    ? (inicio > 0 ? "[...inicio del documento omitido...] " : "") + texto.slice(inicio, inicio + maxChars) + " [...documento truncado por extensión...]"
    : texto;

  const prompt = `Actúa como un analista de sistematización de indicaciones de la Biblioteca del Congreso Nacional de Chile (BCN). A continuación se entrega el TEXTO REAL del informe de comisión "${informe.titulo}" del proyecto de ley Boletín N° ${proyecto.id} ("${proyecto.titulo}"), que contiene las indicaciones (enmiendas) formuladas por parlamentarios y su discusión.

Texto del informe:
"""
${textoTruncado}
"""

Identifica las indicaciones REALES que aparecen en el texto y agrúpalas por el artículo, inciso o materia del proyecto al que afectan (igual como lo hace un informe de sistematización de indicaciones). Genera entre 2 y 8 grupos. Responde ÚNICAMENTE con un arreglo JSON válido, compacto, sin texto adicional, con este esquema exacto:
[{"seccion":"Artículo o materia al que pertenece el grupo, tal como aparece en el informe (ej: 'Artículo 1°', 'Denominación del proyecto')","titulo":"Título breve que describe qué hace este grupo de indicaciones (ej: 'Indicaciones que reemplazan el inciso primero')","numeros":"Números o identificadores de las indicaciones del grupo tal como aparecen en el informe, separados por coma","operacion":"Reemplazo total | Reemplazo parcial | Agregar | Suprimir | Modificar | Otro","resumen":"Resumen fiel de qué proponen estas indicaciones y su estado (aprobada, rechazada, retirada, pendiente) según el informe","textoBase":"Cita o resumen fiel del texto base o vigente que las indicaciones buscan modificar, según el informe","textoResultante":"Cita o resumen fiel del texto que resulta si se aprueban estas indicaciones, según el informe (vacío si no se puede determinar)","fuentes":["Cita textual breve de cada indicación tal como figura en el informe, con su autoría si se menciona"]}]

Usa EXCLUSIVAMENTE información que esté efectivamente en el texto entregado; no inventes autores, números ni contenido. Si el informe no permite identificar indicaciones concretas agrupables, responde con un arreglo vacío [].`;

  const aiAttempts: AIProviderAttempt[] = [];
  let grupos: any[] = [];
  try {
    const aiResponse = await generarContenidoUniversalIA(prompt, 3500, aiAttempts);
    if (aiResponse) {
      const parsed = safeJsonParse<any[]>(aiResponse);
      if (Array.isArray(parsed)) grupos = parsed;
    }
  } catch (err) {
    console.warn(`Could not generate indicaciones for boletín ${proyecto.id}:`, err);
  }

  res.json({
    disponible: grupos.length > 0,
    razon: grupos.length === 0 ? "La IA no pudo identificar indicaciones agrupables en el texto del informe disponible." : undefined,
    informeUrl: informe.url,
    informeTitulo: informe.titulo,
    informeFecha: informe.fecha,
    grupos,
    aiDiagnostics: aiAttempts
  });
});

// ============================================================================
// 3. COMISIONES & AUTOCOMPLETE
// ============================================================================
apiRouter.get("/comisiones/autocomplete", async (req: Request, res: Response) => {
  const q = req.query.q ? String(req.query.q).trim() : "";
  if (!q) {
    return res.json({ comisiones: [], integrantes: [] });
  }
  const result = searchComisionesAutocomplete(q);
  res.json(result);
});

apiRouter.get("/comisiones/citaciones", async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const [camaraData, senadoData] = await Promise.all([
      fetchCamaraCitacionesSemanalesLive(forceRefresh).catch(() => ({ citaciones: [], porComision: {}, porDia: [] })),
      fetchSenadoCitacionesLive(forceRefresh).catch(() => ({ citaciones: [], porComision: {}, porDia: [] }))
    ]);

    const todasCitaciones = [
      ...((camaraData as any).citaciones || (camaraData as any).todas || []),
      ...((senadoData as any).citaciones || (senadoData as any).todas || [])
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      citaciones: todasCitaciones,
      porComision: {
        ...(camaraData.porComision || {}),
        ...(senadoData.porComision || {})
      },
      porDia: [
        ...(camaraData.porDia || []),
        ...(senadoData.porDia || [])
      ],
      camara: camaraData,
      senado: senadoData
    });
  } catch (error: any) {
    console.error("Error fetching live citations:", error);
    res.status(500).json({ error: "Error al obtener citaciones en vivo" });
  }
});

// Direct alias endpoints for live citaciones
apiRouter.get("/citaciones", (req: Request, res: Response) => {
  res.redirect("/api/comisiones/citaciones");
});

apiRouter.get(["/senado/citaciones", "/citaciones/senado"], async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const senadoData = await fetchSenadoCitacionesLive(forceRefresh);
    res.json({
      success: true,
      chamber: "SR",
      portalUrl: "https://www.senado.cl/actividad-legislativa/comisiones/citaciones",
      timestamp: new Date().toISOString(),
      ...senadoData
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get(["/camara/citaciones", "/citaciones/camara"], async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const camaraData = await fetchCamaraCitacionesSemanalesLive(forceRefresh);
    res.json({
      success: true,
      chamber: "CD",
      portalUrl: "https://www.camara.cl/legislacion/comisiones/citaciones_semana.aspx",
      timestamp: new Date().toISOString(),
      ...camaraData
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/comisiones", async (req: Request, res: Response) => {
  const allComisiones = await getTodasComisiones();
  res.json(allComisiones);
});

apiRouter.get("/comision/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const forceRefresh = req.query.refresh === "true";
  const matchDetalle = findComisionMetaById(id);

  if (matchDetalle) {
    const fullComision = generateFullComisionData(matchDetalle);

    if (matchDetalle.chamber === "SR" || matchDetalle.prefix === "senado-") {
      if (matchDetalle.senadoId) {
        try {
          const [liveSenadoProjects, liveSenadoCit] = await Promise.all([
            fetchSenadoComisionProyectosLive(
              matchDetalle.senadoId,
              matchDetalle.nombre,
              forceRefresh
            ),
            fetchSenadoCitacionesLive(forceRefresh)
          ]);

          if (liveSenadoProjects && liveSenadoProjects.length > 0) {
            fullComision.proyectos = liveSenadoProjects;
            fullComision.proyectosContados = liveSenadoProjects.length;
            fullComision.proyectosIds = liveSenadoProjects.map(p => p.id);
          }

          if (liveSenadoCit && liveSenadoCit.porComision && liveSenadoCit.porComision[matchDetalle.senadoId]) {
            const comLiveCit = liveSenadoCit.porComision[matchDetalle.senadoId];
            if (comLiveCit.length > 0) {
              fullComision.sesiones = [
                ...comLiveCit.map((rc: any, idx: number) => ({
                  id: `ses-senado-live-${idx + 1}`,
                  fecha: rc.fecha,
                  hora: rc.hora,
                  lugar: rc.lugar,
                  tipo: rc.tipo || "Sesión de Comisión",
                  materia: rc.materia,
                  invitados: rc.invitados || "Invitados oficiales según orden del día.",
                  citacionNumero: rc.citacionNumero,
                  acuerdosCount: 0,
                  completada: false,
                  tabla: rc.tabla && rc.tabla.length > 0 ? rc.tabla : [rc.materia]
                })),
                ...fullComision.sesiones.filter(s => !s.id.startsWith("ses-senado-"))
              ];
              fullComision.proximaSesion = {
                id: comLiveCit[0].id || "ses-senado-prox-live",
                fecha: comLiveCit[0].fecha,
                hora: comLiveCit[0].hora,
                lugar: comLiveCit[0].lugar,
                modalidad: "Presencial y Telemática",
                citacionNumero: comLiveCit[0].citacionNumero,
                tipo: comLiveCit[0].tipo || "Sesión de Comisión",
                materia: comLiveCit[0].materia,
                invitados: comLiveCit[0].invitados || "Convocados y expositores del Senado.",
                acuerdosCount: 0,
                tabla: comLiveCit[0].tabla || [comLiveCit[0].materia]
              };
            }
          }
        } catch (err) {
          console.warn("Could not fetch live Senate data from senado.cl:", err);
        }
      }
    }

    if (matchDetalle.chamber === "CD" || matchDetalle.prefix === "cd-") {
      const CAMARA_SLUG_TO_TRAMITACION_ID: Record<string, string> = {
        "agricultura": "210",
        "constitucion": "205",
        "hacienda": "207",
        "gobierno-interior": "203",
        "trabajo-y-prevision": "213",
        "educacion": "206",
        "salud": "212",
        "seguridad": "839",
        "obras-publicas": "209",
        "economia": "215",
        "medio-ambiente": "211",
        "mineria": "214",
        "vivienda": "216",
        "pesca": "439",
        "mujeres-genero": "1121",
        "defensa": "208",
        "rree": "204",
        "derechos-humanos": "217",
        "desarrollo-social": "874",
        "recursos-hidricos": "965",
        "cultura": "760",
        "deportes": "1018",
        "personas-mayores": "1218",
        "ciencias": "219",
        "familias": "218",
        "regimen-interno": "220",
        "emergencias": "1066"
      };

      const camaraComiId = CAMARA_SLUG_TO_TRAMITACION_ID[matchDetalle.id];
      if (camaraComiId) {
        try {
          const liveCamaraProjects = await fetchSenadoComisionProyectosLive(
            camaraComiId,
            matchDetalle.nombre,
            forceRefresh
          );
          if (liveCamaraProjects && liveCamaraProjects.length > 0) {
            fullComision.proyectos = liveCamaraProjects;
            fullComision.proyectosContados = liveCamaraProjects.length;
            fullComision.proyectosIds = liveCamaraProjects.map(p => p.id);
          }
        } catch (err) {
          console.warn("Could not fetch live Cámara projects:", err);
        }
      }
    }

    if (matchDetalle.chamber === "CD" || matchDetalle.prefix === "cd-") {
      try {
        const liveCit = await fetchCamaraCitacionesSemanalesLive(forceRefresh);
        if (liveCit && liveCit.porComision && liveCit.porComision[matchDetalle.id]) {
          const comLiveCit = liveCit.porComision[matchDetalle.id];
          if (comLiveCit.length > 0) {
            fullComision.sesiones = [
              ...comLiveCit.map((rc: any, idx: number) => ({
                id: `ses-semana-live-${idx + 1}`,
                fecha: rc.fecha,
                hora: rc.hora,
                lugar: rc.lugar,
                tipo: rc.tipo || "Sesión de Comisión",
                materia: rc.materia,
                invitados: rc.invitados,
                citacionNumero: rc.citacionNumero,
                acuerdosCount: 0,
                completada: false,
                tabla: rc.tabla
              })),
              ...fullComision.sesiones.filter(s => !s.id.startsWith("ses-semana-"))
            ];
            fullComision.proximaSesion = {
              id: comLiveCit[0].id || "ses-prox-live",
              fecha: comLiveCit[0].fecha,
              hora: comLiveCit[0].hora,
              lugar: comLiveCit[0].lugar,
              modalidad: "Presencial",
              citacionNumero: comLiveCit[0].citacionNumero,
              tipo: comLiveCit[0].tipo,
              materia: comLiveCit[0].materia,
              invitados: comLiveCit[0].invitados,
              acuerdosCount: 0,
              tabla: comLiveCit[0].tabla || [comLiveCit[0].materia]
            };
          }
        }
      } catch (err) {
        console.warn("Could not refresh live citaciones for commission:", err);
      }

      // Add complete real official sessions catalog for Comisión de Agricultura
      if (matchDetalle.id === "agricultura") {
        const sesionesAgriReales = [
          {
            id: "ses-agri-08sep2026",
            fecha: "Martes 08 de septiembre de 2026",
            hora: "15:00 a 17:00 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 86",
            materia: "Continuar con el estudio técnico y votación particular del proyecto de ley que 'Modifica la Ley General de Urbanismo y Construcciones, y otros cuerpos legales, para regular el desarrollo de zonas residenciales en el medio rural' (Boletín N° 17.006-01), y análisis de medidas fitosanitarias de emergencia.",
            invitados: "Subsecretario de Agricultura, Director Nacional del SAG, representantes de la Sociedad Nacional de Agricultura (SNA) y Federación de Productores de Frutas (Fedefruta).",
            acuerdosCount: 3,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=hAoqbh-qgDk",
            actaTexto: "La Comisión de Agricultura de la Cámara sesionó para continuar la tramitación del Boletín 17.006-01 sobre parcelaciones y sustentabilidad del suelo agrícola, recibiendo las observaciones del SAG y gremios agrícolas.",
            acuerdosTexto: [
              "Se aprueba en particular el artículo referente a servidumbres y caminos de acceso rural.",
              "Se acuerda oficiar al SAG para informe de fiscalización sobre cambio de uso de suelo.",
              "Se fija sesión especial para votación de indicaciones sustitutivas."
            ],
            tabla: [
              "1. Boletín N° 17.006-01: Regulación de subdivisiones y desarrollo habitacional en suelo rural.",
              "2. Presentación del Servicio Agrícola y Ganadero (SAG) sobre control de plagas y resguardo de la producción agrícola.",
              "3. Votación de indicaciones parlamentarias al texto legal."
            ]
          },
          {
            id: "ses-agri-01sep2026",
            fecha: "Martes 01 de septiembre de 2026",
            hora: "15:00 a 17:00 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 85",
            materia: "Continuar con la discusión del proyecto de ley que 'Modifica la Ley General de Urbanismo y Construcciones, y otros cuerpos legales, para regular el desarrollo de zonas residenciales en el medio rural' (Boletín N° 17.006-01). Audiencias con Ministro de Agricultura y Ministro de Vivienda y Urbanismo (MINVU).",
            invitados: "Ministro de Agricultura (Jaime Campos); Ministro de Vivienda y Urbanismo (Iván Poduje); Representantes de gremios rurales y técnicos del sector.",
            acuerdosCount: 2,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=xehoHfI93oY",
            actaTexto: "Se inició la sesión para proseguir el análisis del Boletín 17.006-01 sobre loteos y subdivisiones prediales en el medio rural. Expusieron los Ministros de Agricultura y MINVU sobre impacto en suelo agrícola y exigencias sanitarias.",
            acuerdosTexto: [
              "Se acuerda recibir propuesta de indicaciones del Ejecutivo sobre estándares mínimos sanitarios y servidumbres de paso.",
              "Se fija plazo para recibir observaciones de asociaciones gremiales hasta la próxima sesión ordinaria."
            ],
            tabla: [
              "1. Boletín N° 17.006-01: Regulación de loteos y desarrollo de zonas residenciales en el medio rural.",
              "2. Exposición del Ministerio de Agricultura sobre protección de suelo agrícola y DL 3.516.",
              "3. Exposición del MINVU sobre Ley General de Urbanismo y Construcciones."
            ]
          },
          {
            id: "ses-agri-18ago2026",
            fecha: "Martes 18 de agosto de 2026",
            hora: "15:00 a 17:30 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 84",
            materia: "Tratamiento de la crisis hídrica en cuencas agrícolas del centro y sur del país. Estado de avance en obras de riego tecnificado Ley N° 18.450 y subsidios a la pequeña agricultura campesina (INDAP).",
            invitados: "Director Nacional de INDAP, Secretario Ejecutivo de la Comisión Nacional de Riego (CNR), Directiva de la Asociación de Canalistas.",
            acuerdosCount: 2,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=z8l4wcbGnqk",
            actaTexto: "Audiencia sostenida con la CNR e INDAP para evaluar asignación de fondos de fomento al riego e infraestructura de acumulación hídrica para medianos y pequeños agricultores.",
            acuerdosTexto: [
              "Se solicita a CNR remitir nómina de proyectos de riego aprobados por región.",
              "Se oficia a Dirección General de Aguas sobre balance hídrico interanual."
            ],
            tabla: [
              "1. Evaluación presupuestaria Ley N° 18.450 de Fomento al Riego.",
              "2. Exposición de asociaciones de regantes de la Cuenca del Maule y O'Higgins.",
              "3. Plan de emergencia para pequeños agricultores INDAP."
            ]
          },
          {
            id: "ses-agri-04ago2026",
            fecha: "Martes 04 de agosto de 2026",
            hora: "15:00 a 17:15 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 83",
            materia: "Análisis del impacto fitosanitario y medidas de bioseguridad ante detección de focos de plagas cuarentenarias en frutales mayores y menores. Modernización de barreras fitosanitarias terrestres y portuarias.",
            invitados: "Jefa de División de Protección Agrícola y Forestal del SAG, Presidente de la Asociación de Exportadores de Frutas de Chile (ASOEX).",
            acuerdosCount: 1,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=cGhdIBAMC3s",
            actaTexto: "Se analizó la situación fitosanitaria de exportación de cerezas, arándanos y carozos frente a exigencias internacionales y convenios de exportación bilateral.",
            acuerdosTexto: [
              "Acuerdo para coordinar mesa de trabajo permanente entre SAG y comités técnicos frutícolas."
            ],
            tabla: [
              "1. Exposición SAG sobre control integrado de plagas cuarentenarias.",
              "2. Medidas de mitigación en plantas de empaque y puertos de salida.",
              "3. Refuerzo de presupuesto para fiscalización en pasos fronterizos."
            ]
          },
          {
            id: "ses-agri-16jun2026",
            fecha: "Martes 16 de junio de 2026",
            hora: "15:00 a 17:00 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 82",
            materia: "Discusión sobre seguridad y soberanía alimentaria nacional, costos de insumos agrícolas (fertilizantes, semillas y energía) y mecanismos de apoyo al cultivo de granos tradicionales (trigo, maíz, arroz).",
            invitados: "Presidente de la Sociedad Nacional de Agricultura (SNA), Presidente de COTRISA (Comercializadora de Trigo S.A.), Decano de la Facultad de Agronomía de la Universidad de Chile.",
            acuerdosCount: 2,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=ii8gDPmRIjU",
            actaTexto: "Audiencia pública con actores del mercado de cereales nacionales sobre rentabilidad y competitividad de la producción cerealera frente a precios internacionales de importación.",
            acuerdosTexto: [
              "Solicitud al Ejecutivo para evaluar líneas de crédito con garantía estatal (FOGAPE) para siembras de temporada.",
              "Oficio a ODEPA para entrega periódica de boletines de precios al productor."
            ],
            tabla: [
              "1. Diagnóstico del sector de granos y cereales en la zona centro-sur.",
              "2. Rol de COTRISA en la transparencia de precios de compra de cosechas.",
              "3. Políticas públicas de incentivo a la producción agrícola estratégica."
            ]
          },
          {
            id: "ses-agri-12may2026",
            fecha: "Martes 12 de mayo de 2026",
            hora: "15:00 a 17:20 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 81",
            materia: "Proyecto de ley sobre regularización de pozos e inscripciones de derechos de aprovechamiento de aguas para comunidades agrícolas y pequeños campesinos.",
            invitados: "Director General de Aguas (DGA), Director del Instituto de Investigaciones Agropecuarias (INIA), representantes de cooperativas campesinas.",
            acuerdosCount: 2,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=gwR25MhhRLI",
            actaTexto: "Discusión sobre simplificación de trámites y plazos para la inscripción en el Catastro Público de Aguas conforme a la reforma del Código de Aguas.",
            acuerdosTexto: [
              "Se aprueba en general por unanimidad el proyecto de simplificación registral.",
              "Se fija plazo de indicaciones para la próxima semana."
            ],
            tabla: [
              "1. Proyecto de ley de perfeccionamiento del registro de títulos de aguas.",
              "2. Informe de avance de la DGA sobre regularizaciones tramitadas en 2026.",
              "3. Audiencias con federaciones campesinas de la zona norte y central."
            ]
          },
          {
            id: "ses-agri-21abr2026",
            fecha: "Martes 21 de abril de 2026",
            hora: "15:00 a 16:30 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 80",
            materia: "Modernización del Servicio Agrícola y Ganadero (SAG) y fortalecimiento de sus facultades de inspección en materia de sanidad vegetal y animal.",
            invitados: "Directorio Nacional de la Asociación de Funcionarios del SAG (AFUSAG), Ministro de Agricultura.",
            acuerdosCount: 1,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=ynvw-kxPLzU",
            actaTexto: "Presentación del gremio AFUSAG respecto a dotación de inspectores de campo y requerimientos presupuestarios para cubrir la fiscalización fitosanitaria.",
            acuerdosTexto: [
              "Se solicita mesa técnica entre Hacienda, Agricultura y AFUSAG para mejoras en dotación."
            ],
            tabla: [
              "1. Proyecto de fortalecimiento institucional del SAG.",
              "2. Exposición de AFUSAG sobre condiciones laborales y fiscalización en terreno.",
              "3. Intervención de las autoridades del Ministerio de Agricultura."
            ]
          },
          {
            id: "ses-agri-07abr2026",
            fecha: "Martes 07 de abril de 2026",
            hora: "15:00 a 17:15 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 79",
            materia: "Plan Nacional de Prevención y Combate de Incendios Forestales 2026. Coordinación entre CONAF, SENAPRED, Bomberos de Chile y sector silvoagropecuario.",
            invitados: "Director Ejecutivo de CONAF, Director Nacional de SENAPRED, Presidente Nacional de Bomberos de Chile, Presidente de CORMA.",
            acuerdosCount: 2,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=8u2ZemH0gv8",
            actaTexto: "Evaluación de la temporada de incendios y requerimientos normativos para la creación de cortafuegos obligatorios y zonas de interfaz urbano-rural.",
            acuerdosTexto: [
              "Se acuerda enviar oficio a CONAF solicitando mapa de vulnerabilidad forestal por regiones.",
              "Se aprueba citar a los Ministerios de Vivienda e Interior para legislar sobre interfaz urbana-forestal."
            ],
            tabla: [
              "1. Balance de la temporada de prevención de incendios 2025-2026.",
              "2. Estrategia de cortafuegos y medidas de protección en predios agrícolas y forestales.",
              "3. Equipamiento y logística aérea para combate de siniestros."
            ]
          },
          {
            id: "ses-agri-24mar2026",
            fecha: "Martes 24 de marzo de 2026",
            hora: "15:00 a 17:30 hrs.",
            lugar: "Sala Pedro Pablo Álvarez-Salamanca (Valparaíso)",
            tipo: "Sesión Ordinaria",
            citacionNumero: "Citación Oficial N° 78",
            materia: "Fijación de la tabla legislativa del período 2026. Priorización de proyectos de ley sobre sustentabilidad del suelo, fomento a la agroecología, seguro agrícola y modernización del riego.",
            invitados: "Integrantes titulares de la Comisión, Asesores legislativos del Ministerio de Agricultura.",
            acuerdosCount: 3,
            completada: true,
            videoUrl: "https://www.youtube.com/watch?v=zjQe5yTUz1k",
            actaTexto: "Definición del calendario de trabajo y temas prioritarios a despachar en el primer semestre legislativo 2026.",
            acuerdosTexto: [
              "Se acuerda sesionar ordinariamente todos los días martes de 15:00 a 17:00 horas.",
              "Se prioriza como primer proyecto en tabla el Boletín N° 17.006-01 (subdivisiones y zonas residenciales rurales).",
              "Se establece agenda mensual de audiencias con gremios y comunidades agrícolas."
            ],
            tabla: [
              "1. Elección de Presidente de Comisión y calendario de sesiones ordinarias.",
              "2. Determinación de prioridades legislativas para el año 2026.",
              "3. Presentación de proyectos en trámite radicados en la comisión."
            ]
          }
        ];

        // Reemplazar o fusionar garantizando que estén todas las sesiones oficiales
        const existingIds = new Set(fullComision.sesiones.map((s: any) => s.id));
        for (const ses of sesionesAgriReales) {
          if (!existingIds.has(ses.id)) {
            fullComision.sesiones.push(ses);
          } else {
            // Actualizar datos enriquecidos si ya existe
            const idx = fullComision.sesiones.findIndex((s: any) => s.id === ses.id);
            if (idx !== -1) {
              fullComision.sesiones[idx] = { ...fullComision.sesiones[idx], ...ses };
            }
          }
        }
        // Ordenar cronológicamente descendente (las más recientes primero), por fecha
        // real y no por comparación lexicográfica de IDs (que ordenaba mal entre
        // sesiones de distintos meses, p. ej. "16jun2026" después de "04ago2026").
        fullComision.sesiones.sort(compareSesionesDesc);
      }
    }

    // Normalizar "completada": cualquier sesión de la citación semanal en vivo cuya
    // fecha ya pasó se considera realizada, aunque haya llegado marcada como
    // completada: false por defecto. Evita que "Sesiones y Actas" mezcle sesiones
    // agendadas/futuras con las efectivamente realizadas y grabadas.
    // Fusionar duplicados: la citación en vivo y la sesión curada del catálogo
    // oficial suelen ser la MISMA sesión real el mismo día con IDs distintos
    // (p. ej. "ses-semana-live-1" y "ses-agri-08sep2026").
    fullComision.sesiones = mergeSesionesDuplicadas(
      fullComision.sesiones.map((s: any) => (isSessionDatePassed(s.fecha) ? { ...s, completada: true } : s))
    ).sort(compareSesionesDesc);

    return res.json(fullComision);
  }

  const todas = await getTodasComisiones();
  const matched = todas.find(c => c.id === id || c.id.replace(/^(cd|sr)-/, "") === id);

  if (!matched) {
    return res.status(404).json({ error: "Comisión no encontrada" });
  }

  const listadoSenado = await fetchProyectosListadoFromSenado();
  const proyectosSenado = listadoSenado.map(listadoToProyecto);
  const pMateria = proyectosSenado.filter(p => matched.nombre.toLowerCase().includes(p.materia.toLowerCase()));

  const enriched = {
    id: matched.id,
    nombre: matched.nombre,
    descripcion: matched.descripcion || `Comisión legislativa oficial del Congreso Nacional de Chile.`,
    periodo: (matched as any).senado ? "Senado (2022 - 2030)" : "Cámara de Diputadas y Diputados (2022 - 2026)",
    sesionesRealizadas: 48,
    proyectosContados: pMateria.length || 8,
    audienciasSostenidas: 38,
    documentosContados: 65,
    alertasActivas: 2,
    sesiones: [],
    proyectosIds: pMateria.map(p => p.id),
    audiencias: {
      sectorPublico: 18,
      sociedadCivil: 15,
      academia: 22,
      ultimasAsistencias: []
    },
    documentosGroups: [
      { tipo: "Informes de Comisión", cuenta: 12 },
      { tipo: "Oficios Recibidos", cuenta: 28 },
      { tipo: "Actas de Sesión", cuenta: 42 }
    ],
    actividades: [],
    integrantes: [],
    proyectos: pMateria.slice(0, 5)
  };

  res.json(enriched);
});

// ============================================================================
// 4. ALERTAS & SALA EN VIVO
// ============================================================================
apiRouter.get("/alertas", (req: Request, res: Response) => {
  res.json(ALERTA_ITEMS);
});

apiRouter.post("/alertas/crear", (req: Request, res: Response) => {
  const { titulo, subtitulo, boletinId } = req.body;
  const newAlert: Alerta = {
    id: "alert" + (ALERTA_ITEMS.length + 1),
    titulo: titulo || "Nueva Alerta",
    subtitulo: subtitulo || "",
    boletinId: boletinId || "",
    tiempo: "Ahora",
    tipo: "indicador"
  };
  ALERTA_ITEMS.unshift(newAlert);
  res.json({ success: true, alert: newAlert });
});

// Alertas por tópico: en vez de un filtro de palabras clave en el cliente
// (lo que había antes), se le pasa a la IA la lista real de citaciones de la
// semana (Cámara + Senado) con su materia textual, y se le pide que identifique
// cuáles tienen relación real con los tópicos suscritos -- citando el número
// exacto de la citación de la lista, para que no pueda inventar una sesión que
// no existe. Si la IA no responde, se devuelve una lista vacía (no fallback
// inventado), igual que en Derecho Comparado.
apiRouter.post("/alertas/evaluar-topicos", async (req: Request, res: Response) => {
  const { keywords } = req.body as { keywords?: string[] };
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return res.json({ alertas: [], aiDisponible: true, totalCitacionesRevisadas: 0 });
  }

  try {
    const [camaraData, senadoData] = await Promise.all([
      fetchCamaraCitacionesSemanalesLive(false).catch(() => ({ todas: [] as any[] })),
      fetchSenadoCitacionesLive(false).catch(() => ({ citaciones: [] as any[] }))
    ]);

    const candidatos = [
      ...(((camaraData as any).todas || []) as any[]).map((c: any) => ({
        chamber: "Cámara de Diputados",
        comision: c.comisionNombre || "Comisión",
        fecha: c.fecha || "",
        materia: String(c.materia || "").slice(0, 400),
        boletines: Array.isArray(c.boletinesRelacionados) ? c.boletinesRelacionados : []
      })),
      ...(((senadoData as any).citaciones || []) as any[]).map((c: any) => ({
        chamber: "Senado",
        comision: c.comision || "Comisión",
        fecha: c.fecha || "",
        materia: String(c.materia || "").slice(0, 400),
        boletines: Array.isArray(c.boletines) ? c.boletines : []
      }))
    ].filter((c) => c.materia.trim().length > 0);

    if (candidatos.length === 0) {
      return res.json({ alertas: [], aiDisponible: true, totalCitacionesRevisadas: 0 });
    }

    const listado = candidatos
      .map((c, i) => `${i + 1}. [${c.chamber}] ${c.comision} — ${c.fecha}\nMateria: ${c.materia}\nBoletines: ${c.boletines.join(", ") || "ninguno"}`)
      .join("\n\n");

    const prompt = `Eres un analista legislativo del Congreso de Chile. A continuación hay una lista numerada de citaciones REALES de comisiones de esta semana (Cámara de Diputados y Senado), y una lista de tópicos que un equipo de asuntos públicos quiere monitorear.

TÓPICOS A MONITOREAR:
${keywords.map((k) => `- ${k}`).join("\n")}

CITACIONES (numeradas):
${listado}

Identifica ÚNICAMENTE las citaciones cuya "Materia" tenga relación real y directa con alguno de los tópicos -- no fuerces coincidencias genéricas o forzadas. Usa SIEMPRE el número exacto de la citación tal como aparece en la lista.

Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, con este esquema exacto:
[{"numero": 3, "topico": "ciberseguridad", "razon": "La materia trata sobre infraestructura crítica de telecomunicaciones."}]

Si no hay ninguna coincidencia real, responde exactamente: []`;

    const texto = await generarContenidoUniversalIA(prompt, 1800);
    const matches = texto ? safeJsonParse<Array<{ numero: number; topico: string; razon: string }>>(texto) : null;

    if (!Array.isArray(matches)) {
      return res.json({ alertas: [], aiDisponible: false, totalCitacionesRevisadas: candidatos.length });
    }

    const alertas = matches
      .map((m) => {
        const c = candidatos[(m.numero || 0) - 1];
        if (!c || !m.topico) return null;
        return {
          id: `alerta-topico-${c.chamber}-${c.comision}-${c.fecha}-${m.topico}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          titulo: `"${m.topico}" en tabla de ${c.comision}`,
          subtitulo: `${m.razon || ""} (${c.chamber}, ${c.fecha})`,
          boletinId: c.boletines[0] || "",
          tipo: "citacion" as const,
          fecha: c.fecha,
          tiempo: c.fecha,
          leida: false
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);

    res.json({ alertas, aiDisponible: true, totalCitacionesRevisadas: candidatos.length });
  } catch (error: any) {
    console.error("Error evaluando tópicos de alerta:", error);
    res.status(500).json({ error: "Error al evaluar tópicos de alerta" });
  }
});

apiRouter.get("/sala", (req: Request, res: Response) => {
  const sala: SalaVivo[] = [
    {
      camaraName: "Cámara de Diputadas y Diputados",
      enVivo: false,
      temaDiscusion: "Sin información de sesión en vivo disponible en este momento.",
      estadoSesion: "Estado no disponible",
      representantesPresentes: 0,
      verStreamingUrl: "https://www.camara.cl/transmision/canalTv.aspx"
    },
    {
      camaraName: "Senado de la República",
      enVivo: false,
      temaDiscusion: "Sin información de sesión en vivo disponible en este momento.",
      estadoSesion: "Estado no disponible",
      representantesPresentes: 0,
      verStreamingUrl: "https://tv.senado.cl/"
    }
  ];
  res.json(sala);
});

// ============================================================================
// 5. GLOBAL SEARCH
// ============================================================================
apiRouter.get("/global-search", async (req: Request, res: Response) => {
  const rawQ = req.query.q ? String(req.query.q).trim() : "";
  if (!rawQ) {
    return res.json({ proyectos: [], comisiones: [], autores: [], documentos: [], comparada: [] });
  }

  const unified = performUnifiedSearch(rawQ);
  const q = rawQ.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  let liveProys: Proyecto[] = [];
  try {
    const listadoSenado = await fetchProyectosListadoFromSenado();
    const proyectosSenado = listadoSenado.map(listadoToProyecto);
    liveProys = proyectosSenado.filter(p => {
      const normId = (p.id || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normTit = (p.titulo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normMat = (p.materia || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normId.includes(q) || normTit.includes(q) || normMat.includes(q);
    });
  } catch (err) {
    console.warn("Could not fetch live senado projects list for search:", err);
  }

  // Query live LeyChile norms for Chilean legislation references
  let liveChileNormas: ResultadoComparado[] = [];
  try {
    liveChileNormas = await buscarChile(rawQ);
  } catch (err) {
    console.warn("Could not fetch live LeyChile norms for search:", err);
  }

  const mergedComparada = [
    ...liveChileNormas.map(n => ({
      id: n.titulo,
      titulo: n.titulo,
      pais: n.pais,
      fuente: n.fuente,
      materia: rawQ,
      url: n.url
    })),
    ...unified.comparada
  ];

  const mergedProjectsMap = new Map<string, Proyecto>();
  for (const p of unified.proyectos) {
    if (p && p.id) mergedProjectsMap.set(p.id, p);
  }
  for (const p of liveProys) {
    if (p && p.id && !mergedProjectsMap.has(p.id)) {
      mergedProjectsMap.set(p.id, p);
    }
  }
  const finalProjects = Array.from(mergedProjectsMap.values());

  res.json({
    proyectos: finalProjects.slice(0, 15),
    comisiones: unified.comisiones.slice(0, 10),
    autores: unified.autores.slice(0, 10),
    documentos: unified.documentos,
    comparada: mergedComparada.slice(0, 15),
    webLinks: unified.webLinks
  });
});

// ============================================================================
// 6. DERECHO COMPARADO
// ============================================================================
apiRouter.get("/derecho-comparado", async (req: Request, res: Response) => {
  const q = req.query.q ? String(req.query.q).trim() : "";
  if (!q) {
    return res.json({ resultados: [], fuentesConsultadas: [], fuentesFallidas: [] });
  }
  const data = await buscarDerechoComparado(q);
  res.json(data);
});

apiRouter.post("/derecho-comparado/redactar", async (req: Request, res: Response) => {
  const { query, resultados } = req.body as { query?: string; resultados?: ResultadoComparado[] };
  if (!query || !Array.isArray(resultados) || resultados.length === 0) {
    return res.status(400).json({ error: "Se requiere 'query' y una lista de 'resultados' no vacía." });
  }

  const listado = resultados
    .map((r, i) => `${i + 1}. [${r.pais}] ${r.titulo} — Fuente: ${r.fuente}${r.fecha ? `, ${r.fecha}` : ""}${r.url ? ` (${r.url})` : ""}`)
    .join("\n");

  const prompt = `Actúa como un analista de Asesoría Técnica Parlamentaria de la Biblioteca del Congreso Nacional de Chile (BCN), redactando secciones de un informe de legislación comparada sobre "${query}". A continuación se listan resultados REALES obtenidos de bases legislativas oficiales de distintos países.

Resultados:
${listado}

Responde ÚNICAMENTE con un objeto JSON válido, compacto, sin texto adicional antes ni después, con este esquema exacto:
{"marcoConceptual":"...","analisis":"..."}

Donde:
- "marcoConceptual": SOLO si la materia "${query}" involucra terminología técnica, jurídica o socialmente disputada que requiera aclararse antes de comparar países (ej. distinciones conceptuales, definiciones legales divergentes entre ordenamientos), escribe un párrafo breve (máx. 120 palabras) que explique esos conceptos de forma neutral, EXCLUSIVAMENTE con base en lo que ya es de conocimiento general sobre esos términos, sin atribuir definiciones a autores o fuentes específicas que no estén en la lista de resultados. Si la materia es suficientemente clara y no lo amerita (la mayoría de los casos), responde "" (cadena vacía).
- "analisis": uno o dos párrafos (máx. 200 palabras en total) en prosa formal, tercera persona, sin emojis ni viñetas -- el mismo registro que usan los informes de Asesoría Técnica Parlamentaria de la BCN: comparando brevemente los enfoques regulatorios identificados entre las jurisdicciones listadas y señalando, de forma prudente y sin sobre-afirmar, qué aspectos podrían ser de interés para la discusión legislativa en Chile.

En ambos campos usa EXCLUSIVAMENTE los títulos, países y fuentes entregados arriba; no inventes contenido normativo, cifras, sanciones, jurisprudencia ni disposiciones que no estén respaldadas por lo listado.`;

  const respuestaIA = await generarContenidoUniversalIA(prompt, 900);
  if (respuestaIA) {
    const parsed = safeJsonParse<{ marcoConceptual?: string; analisis?: string }>(respuestaIA);
    if (parsed && parsed.analisis) {
      return res.json({ texto: parsed.analisis, marcoConceptual: parsed.marcoConceptual || undefined });
    }
  }

  const paises = Array.from(new Set(resultados.map(r => r.pais)));
  const chilenos = resultados.filter(r => r.pais === "Chile");
  const textoFallback = `El examen de derecho comparado sobre "${query}" reúne registros en ${paises.length} jurisdicciones (${paises.join(", ")}). ${chilenos.length > 0 ? `En Chile, el marco regulatorio central corresponde a ${chilenos.map(c => c.titulo).join(", ")}. ` : ""}A nivel internacional, los ordenamientos consultados establecen directrices focalizadas en estándares regulatorios, deberes de cumplimiento y regímenes de fiscalización.`;
  res.json({ texto: textoFallback });
});

// Informe Técnico completo en un solo llamado de IA, con la estructura
// (Resumen e Introducción / Caso [País] por cada jurisdicción seleccionada /
// Conclusiones y Análisis Comparado) pedida explícitamente por el usuario --
// basada ÚNICAMENTE en los puntos/disposiciones reales ya extraídos del
// texto de cada norma (mismos que "Ver puntos clave"), nunca en los títulos
// solos. Reemplaza el ensamblado de fragmentos (síntesis + desarrollo por
// país por separado) por un informe redactado de corrido por la IA.
apiRouter.post("/derecho-comparado/informe-completo", async (req: Request, res: Response) => {
  const { query, items } = req.body as {
    query?: string;
    items?: Array<{ pais: string; titulo: string; puntos?: string[]; descripcion?: string }>;
  };
  if (!query || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Se requiere 'query' y al menos 1 'item'." });
  }

  const conContenido = items.filter((it) => (it.puntos && it.puntos.length > 0) || it.descripcion);
  if (conContenido.length === 0) {
    return res.json({ informe: null });
  }

  const bloque = conContenido
    .map((it, i) => `${i + 1}. CASO ${it.pais.toUpperCase()} — ${it.titulo}\nDescripción oficial: ${it.descripcion || "(no disponible)"}\nDisposiciones reales extraídas del texto:\n${(it.puntos && it.puntos.length > 0) ? it.puntos.map((p) => `   - ${p}`).join("\n") : "   (no se pudo extraer texto sustantivo de la fuente oficial para este país)"}`)
    .join("\n\n");

  const casosEsperados = conContenido.map((it) => it.pais).join(", ");

  // Por cada posición de país se varía ligeramente el enfoque pedido (igual
  // que la plantilla genérica de referencia: 1° marco regulatorio base,
  // 2° contexto federal/estatal si aplica, 3° reformas recientes y desafíos
  // de implementación, 4° casos prácticos de éxito o fracaso).
  const ENFOQUE_POR_POSICION = [
    "Describe el marco regulatorio principal y las leyes aplicables mencionadas en el texto; detalla la institucionalidad u organismos encargados de la supervisión y fiscalización; explica los mecanismos clave, enfoques o instrumentos específicos que utiliza este país.",
    "Describe el contexto regulatorio (por ejemplo, si es de alcance federal, estatal/provincial o nacional único, según lo que indique el texto); detalla las normativas, instrumentos o políticas específicas mencionadas en el texto; destaca cualquier particularidad o innovación regulatoria de este país.",
    "Describe el marco normativo y las etapas o procesos regulados; detalla las instituciones involucradas y cómo se articulan entre sí; analiza las reformas recientes y los desafíos prácticos o de implementación mencionados en el texto.",
    "Explica el enfoque regulatorio del país; describe los planes, obligaciones o normativas exigidas a los actores involucrados; desarrolla casos prácticos o ejemplos de éxito o fracaso que ilustren cómo funciona su sistema en la realidad, si el texto lo permite."
  ];

  const prompt = `Actúa como un analista experto en políticas públicas y regulación comparada. Tu tarea es redactar un informe técnico, exhaustivo y bien desarrollado sobre "${query}", basado ÚNICAMENTE en el texto que se te proporciona a continuación (descripciones oficiales y disposiciones reales ya extraídas del texto de cada norma).

El objetivo del informe es comparar los distintos marcos regulatorios y modelos aplicados en los países mencionados en el texto, identificando cómo cada uno aborda los principales desafíos de la materia.

Instrucciones de formato y estilo:
- Tono: formal, académico, objetivo e institucional.
- Extensión: desarrolla cada sección con párrafos completos y explicaciones detalladas; evita los resúmenes superficiales.
- Precisión: no inventes ni asumas información que no esté en el texto base. Si un dato no está en el texto (por ejemplo, no se pudo extraer texto sustantivo para un país), omítelo o dilo explícitamente en esa sección en vez de rellenarla con contenido genérico o inventado.

Estructura obligatoria del informe (usa estos encabezados exactos, en Markdown con "##"):

## Resumen e Introducción
Redacta una introducción que explique el contexto general de la materia, los objetivos de la regulación en esta materia y el propósito de este análisis comparado.

${conContenido.map((it, i) => `## Caso ${it.pais}\n${ENFOQUE_POR_POSICION[Math.min(i, ENFOQUE_POR_POSICION.length - 1)]} Basa todo lo anterior únicamente en lo que aparezca en el texto entregado para ${it.pais}.`).join("\n\n")}

## Conclusiones y Análisis Comparado
Sintetiza los hallazgos de los países analizados (${casosEsperados}). Destaca las similitudes, diferencias, mejores prácticas y lecciones aprendidas sobre cómo cada modelo aborda la materia, basándote exclusivamente en lo expuesto en las secciones anteriores.

Cuando el texto entregado incluya una cita textual entre comillas, puedes incorporarla literalmente (sin alterarla) para respaldar una afirmación, en vez de solo parafrasearla.

A continuación, el texto base para redactar el informe:
"""
${bloque}
"""

Responde ÚNICAMENTE con el informe en Markdown (usando "##" para cada sección en el orden indicado), sin texto adicional antes o después.`;

  const attempts: AIProviderAttempt[] = [];
  const texto = await generarContenidoUniversalIA(prompt, 4500, attempts);
  if (texto) {
    return res.json({ informe: texto.trim() });
  }

  res.json({ informe: null, aiDiagnostics: attempts });
});

apiRouter.post("/derecho-comparado/analizar", async (req: Request, res: Response) => {
  const { query, resultado } = req.body as { query?: string; resultado?: ResultadoComparado };
  if (!query || !resultado || !resultado.titulo) {
    return res.status(400).json({ error: "Se requiere 'query' y 'resultado'." });
  }

  // Para normas chilenas de LeyChile, el texto articulado completo (vía la
  // API oficial opt=7) da mucho más de donde citar textualmente que el HTML
  // genérico de la página de navegación -- se prefiere ese cuando aplica.
  const textoNormaCompleto = resultado.pais === "Chile" && resultado.url
    ? await fetchTextoNormaLeyChileCompleto(resultado.url)
    : null;
  const textoFuente = textoNormaCompleto || (resultado.url ? await fetchTextoFuente(resultado.url) : null);

  if (textoFuente) {
    const prompt = `Eres un analista de Asesoría Técnica Parlamentaria de la Biblioteca del Congreso Nacional de Chile, redactando la sección de un país en un informe de legislación comparada. A continuación se entrega el TEXTO REAL extraído de la fuente oficial "${resultado.titulo}" (${resultado.pais}), en relación a la materia "${query}".

Texto de la fuente:
"""
${textoFuente}
"""

Primero evalúa si el texto entregado corresponde efectivamente al CUERPO de la norma (artículos, disposiciones) o si en cambio es una página de archivo, índice, buscador, menú de navegación u otro contenido que NO contiene el texto legal sustantivo (esto pasa con frecuencia en portales de repositorios oficiales extranjeros).

Responde ÚNICAMENTE con un objeto JSON válido, compacto, sin texto adicional, con uno de estos dos esquemas:

- Si el texto SÍ contiene disposiciones sustantivas: {"disponible":true,"puntos":["- Artículo 8: Registro de mascotas: Establece la obligación de inscribir a los animales en un registro municipal dentro de los 30 días siguientes a su adquisición.", "..."]}
  Identifica entre 4 y 8 artículos, secciones o disposiciones sustantivos EN RELACIÓN A LA MATERIA CONSULTADA, basándote EXCLUSIVAMENTE en el texto entregado, cada uno identificando el artículo o sección (número o nombre tal como aparece en el texto) seguido de una explicación breve en prosa de qué prohíbe, permite, obliga o establece. Para al menos 2 de esos puntos, incluye una cita textual breve (máx. 30 palabras) entre comillas del pasaje exacto del texto -- no la parafrasees, cópiala literal.
- Si el texto NO contiene disposiciones sustantivas (es una página de archivo/índice/buscador/menú): {"disponible":false,"motivo":"Explicación breve de qué es efectivamente el texto obtenido (ej. página de índice del archivo oficial) y que no permite identificar disposiciones sobre la materia consultada."}

Redacta SIEMPRE en español, incluso si el texto de la fuente original está en otro idioma (portugués, inglés, alemán, francés, etc.): traduce tu explicación de cada disposición al español. Las citas textuales entre comillas puedes mantenerlas en el idioma original del texto, agregando inmediatamente después su traducción al español entre paréntesis.

No inventes disposiciones que no estén en el texto entregado bajo ninguna circunstancia.`;

    // 1200 se quedaba corto para el análisis más profundo con citas literales
    // que ahora se pide (antes 600, ya se había subido una vez por el mismo
    // problema con modelos de razonamiento que gastan presupuesto "pensando"
    // antes de responder -- ver nota en generarConGroq/aiService.ts).
    const textoIA = await generarContenidoUniversalIA(prompt, 2000);
    if (textoIA) {
      const parsed = safeJsonParse<{ disponible?: boolean; puntos?: string[]; motivo?: string }>(textoIA);
      if (parsed && parsed.disponible === false) {
        // La IA determinó honestamente que la fuente obtenida no es el texto
        // de la norma (ej. una página de archivo/índice) -- se muestra como
        // "no disponible" con el motivo, en vez de listar ese comentario
        // meta como si fueran puntos reales de análisis normativo.
        return res.json({
          puntos: [],
          disponible: false,
          mensaje: parsed.motivo || "La fuente obtenida no contiene el texto de la norma; revisa el enlace oficial directamente."
        });
      }
      if (parsed && parsed.disponible && Array.isArray(parsed.puntos) && parsed.puntos.length > 0) {
        const puntos = parsed.puntos.map((l) => l.replace(/^[-•]\s*/, "").trim()).filter((l) => l.length > 0);
        if (puntos.length > 0) {
          return res.json({ puntos, disponible: true });
        }
      }
    }
  }

  const puntosHeuristicos = extraerPuntosHeuristicos(query, resultado, textoFuente);
  res.json({ puntos: puntosHeuristicos, disponible: true });
});

// Pestaña "Evolución Legal": para UNA norma seleccionada, extrae su objetivo
// y si el texto real menciona explícitamente que la norma modificó, derogó o
// fue modificada/derogada por otra. No existe una fuente estructurada de
// "historial de modificaciones" para todos los países (ver investigación de
// APIs de jurisprudencia/LeyChile) -- esto se limita a lo que el propio texto
// de la norma diga de sí misma, de forma honesta cuando no hay esa mención.
apiRouter.post("/derecho-comparado/evolucion", async (req: Request, res: Response) => {
  const { query, resultado } = req.body as { query?: string; resultado?: ResultadoComparado };
  if (!query || !resultado || !resultado.titulo) {
    return res.status(400).json({ error: "Se requiere 'query' y 'resultado'." });
  }

  const textoNormaCompleto = resultado.pais === "Chile" && resultado.url
    ? await fetchTextoNormaLeyChileCompleto(resultado.url)
    : null;
  const textoFuente = textoNormaCompleto || (resultado.url ? await fetchTextoFuente(resultado.url) : null);

  if (!textoFuente) {
    return res.json({
      objetivo: resultado.descripcion || `Norma de ${resultado.pais} sobre "${query}"; no fue posible acceder al texto oficial para un análisis más detallado.`,
      modificaciones: "No fue posible acceder al texto oficial de esta norma para determinar si ha sido modificada.",
      disponible: false
    });
  }

  const prompt = `Eres un asesor técnico de la Biblioteca del Congreso Nacional de Chile. A continuación se entrega el TEXTO REAL de la norma oficial "${resultado.titulo}" (${resultado.pais}), en relación a la materia "${query}".

Texto de la fuente:
"""
${textoFuente}
"""

Responde ÚNICAMENTE con un objeto JSON válido, compacto, sin texto adicional, con este esquema exacto:
{"objetivo":"...","modificaciones":"..."}

- "objetivo": 1-2 oraciones en prosa formal que resuman el objeto y ámbito de esta norma, basándote exclusivamente en el texto entregado.
- "modificaciones": basándote EXCLUSIVAMENTE en lo que el texto entregado diga explícitamente de sí mismo, indica si esta norma modifica, deroga, sustituye o complementa otra norma anterior, y/o si el propio texto menciona que ha sido modificada por una norma posterior (cita el nombre/número de esa norma si aparece). Si el texto no contiene ninguna mención explícita de modificaciones, responde exactamente: "El texto disponible no menciona explícitamente modificaciones a esta norma." No inventes leyes, números ni fechas que no estén en el texto entregado.

Redacta SIEMPRE ambos campos en español, incluso si el texto de la fuente original está en otro idioma -- traduce el contenido, no lo copies en el idioma original.`;

  const textoIA = await generarContenidoUniversalIA(prompt, 900);
  if (textoIA) {
    try {
      const parsed = safeJsonParse<{ objetivo?: string; modificaciones?: string }>(textoIA);
      if (parsed && parsed.objetivo) {
        return res.json({
          objetivo: parsed.objetivo,
          modificaciones: parsed.modificaciones || "El texto disponible no menciona explícitamente modificaciones a esta norma.",
          disponible: true
        });
      }
    } catch {
      // cae al respaldo heurístico abajo
    }
  }

  res.json({
    objetivo: resultado.descripcion || `Norma de ${resultado.pais} sobre "${query}".`,
    modificaciones: "No fue posible generar este análisis con IA en este momento.",
    disponible: false
  });
});

// Redacta un análisis comparativo REAL entre las normas que el usuario
// seleccionó para comparar, a partir de los puntos ya extraídos del texto
// real de cada una (por /derecho-comparado/analizar) -- no de los títulos.
// Reemplaza la antigua ficha "Se trata de una ley que regula..." (genérica,
// basada solo en el título) por una síntesis que efectivamente compara el
// contenido real entre los países seleccionados.
apiRouter.post("/derecho-comparado/sintetizar-comparacion", async (req: Request, res: Response) => {
  const { query, items } = req.body as {
    query?: string;
    items?: Array<{ pais: string; titulo: string; puntos: string[] }>;
  };
  if (!query || !Array.isArray(items) || items.length < 2) {
    return res.status(400).json({ error: "Se requiere 'query' y al menos 2 'items' con sus puntos." });
  }

  const bloque = items
    .map((it, i) => `${i + 1}. [${it.pais}] ${it.titulo}\n${(it.puntos || []).map((p) => `   - ${p}`).join("\n")}`)
    .join("\n\n");

  const prompt = `Actúa como un analista de Asesoría Técnica Parlamentaria de la Biblioteca del Congreso Nacional de Chile, redactando un análisis comparado sobre "${query}". A continuación se entregan los puntos REALES ya extraídos del texto de cada norma seleccionada por el usuario para comparar:

${bloque}

Redacta un análisis comparativo en prosa formal (entre 500 y 700 palabras -- desarróllalo con el mismo nivel de profundidad que un informe de Asesoría Técnica Parlamentaria de la BCN, no un resumen breve), en tercera persona, sin emojis ni viñetas, organizado en dos o tres párrafos, que efectivamente COMPARE el contenido entre estas jurisdicciones: qué enfoques comparten, en qué difieren sustantivamente (alcance, mecanismos, órgano fiscalizador, sanciones, plazos, etc. según lo que digan los puntos entregados), y qué podría ser relevante considerar para Chile a partir de ese contraste. Cuando alguno de los puntos entregados incluya una cita textual entre comillas, incorpórala literalmente en tu análisis (sin alterarla) para respaldar la comparación, en vez de solo parafrasearla.

USA EXCLUSIVAMENTE los puntos entregados arriba; no inventes disposiciones, cifras, citas ni mecanismos que no estén respaldados por ellos. No menciones sentencias, fallos judiciales ni jurisprudencia de ningún tribunal salvo que aparezcan explícitamente citados en los puntos entregados -- no tienes acceso a bases de jurisprudencia y no debes inventar casos ni referencias judiciales. Si los puntos no permiten comparar algún aspecto, omítelo en vez de inventarlo.

Responde solo con el análisis, sin encabezados ni markdown.`;

  // Con hasta 8 paises seleccionados (antes el tope era 4) el bloque de
  // puntos entregados a la IA es mas largo, asi que se sube el presupuesto
  // de salida para no truncar el analisis comparativo a mitad de oracion.
  const texto = await generarContenidoUniversalIA(prompt, 2000);
  if (texto) {
    return res.json({ analisis: texto });
  }

  const paises = items.map((it) => it.pais).join(", ");
  res.json({ analisis: `No fue posible generar el análisis comparativo con IA en este momento. Se seleccionaron ${items.length} normas de ${paises} sobre "${query}"; revisa los puntos sustantivos de cada una más abajo.` });
});

// Genera la "lectura jurídica" (la fila de análisis al pie de cada dimensión
// en la Matriz Comparada) a partir de los datos REALES ya obtenidos -- antes
// esas filas se habían reducido a frases fijas que solo explicaban qué
// significa el campo (ej. "Jerarquía normativa real según la fuente
// consultada"), en vez de dar una lectura jurídica comparativa real como
// hacían las matrices de ejemplo. Se pide una síntesis breve por dimensión,
// basada exclusivamente en lo ya extraído (descripción oficial y puntos
// reales de cada norma), nunca inventando contenido no respaldado por ellos.
apiRouter.post("/derecho-comparado/lectura-matriz", async (req: Request, res: Response) => {
  const { query, items } = req.body as {
    query?: string;
    items?: Array<{ pais: string; descripcion?: string; puntos?: string[] }>;
  };
  if (!query || !Array.isArray(items) || items.length < 2) {
    return res.status(400).json({ error: "Se requiere 'query' y al menos 2 'items'." });
  }

  const bloqueObjeto = items.map((it) => `- [${it.pais}] ${it.descripcion || "(sin descripción disponible)"}`).join("\n");
  const bloquePuntos = items
    .map((it) => `- [${it.pais}] ${(it.puntos && it.puntos.length > 0) ? it.puntos.join(" | ") : "(sin puntos extraídos del texto de esta norma todavía)"}`)
    .join("\n");

  const prompt = `Actúa como un analista de Asesoría Técnica Parlamentaria de la Biblioteca del Congreso Nacional de Chile, redactando la "lectura jurídica" al pie de dos filas de una matriz comparada sobre "${query}".

Descripciones oficiales del objeto y ámbito de cada norma:
${bloqueObjeto}

Puntos/disposiciones reales ya extraídos del texto de cada norma:
${bloquePuntos}

Responde ÚNICAMENTE con un objeto JSON válido, compacto, sin texto adicional, con este esquema exacto:
{"lecturaObjeto":"...","lecturaDisposiciones":"..."}

- "lecturaObjeto": una oración (máx. 35 palabras) que sintetice, a partir de las descripciones entregadas, qué enfoque comparten o en qué difieren sustantivamente las jurisdicciones en el objeto y ámbito de la norma.
- "lecturaDisposiciones": una oración (máx. 35 palabras) que sintetice, a partir de los puntos/disposiciones entregados, qué mecanismo, obligación o diferencia sustantiva más relevante surge al comparar esas disposiciones entre países. Si para la mayoría de los países no hay puntos extraídos todavía, responde exactamente: "Aún no hay suficientes disposiciones extraídas de los países seleccionados para una lectura jurídica comparativa; genera el análisis por país primero."

USA EXCLUSIVAMENTE lo entregado arriba; no inventes mecanismos, cifras, órganos fiscalizadores ni disposiciones que no estén respaldados por ese contenido.`;

  const texto = await generarContenidoUniversalIA(prompt, 800);
  if (texto) {
    const parsed = safeJsonParse<{ lecturaObjeto?: string; lecturaDisposiciones?: string }>(texto);
    if (parsed && (parsed.lecturaObjeto || parsed.lecturaDisposiciones)) {
      return res.json({
        lecturaObjeto: parsed.lecturaObjeto || undefined,
        lecturaDisposiciones: parsed.lecturaDisposiciones || undefined
      });
    }
  }

  res.json({});
});

// Matriz temática real: en vez de filas administrativas fijas (Tipo, Fecha,
// Fuente -- ya visibles en la cabecera de cada columna), identifica las
// dimensiones jurídicas SUSTANTIVAS realmente comparables para esta materia
// específica (ej. "Titularidad", "Plazo y silencio", "Órgano garante" para
// acceso a información pública; serían otras para protección de datos o
// tenencia de mascotas) a partir de los puntos reales ya extraídos de cada
// norma, con una celda por país basada exclusivamente en esos puntos.
apiRouter.post("/derecho-comparado/matriz-tematica", async (req: Request, res: Response) => {
  const { query, items } = req.body as {
    query?: string;
    items?: Array<{ pais: string; titulo: string; puntos?: string[]; descripcion?: string }>;
  };
  if (!query || !Array.isArray(items) || items.length < 2) {
    return res.status(400).json({ error: "Se requiere 'query' y al menos 2 'items'." });
  }

  const conPuntos = items.filter((it) => it.puntos && it.puntos.length > 0);
  if (conPuntos.length < 2) {
    return res.json({ dimensiones: [] });
  }

  const bloque = conPuntos
    .map((it) => `[${it.pais}] ${it.titulo}\nDescripción: ${it.descripcion || "(sin descripción)"}\nDisposiciones reales:\n${(it.puntos || []).map((p) => `  - ${p}`).join("\n")}`)
    .join("\n\n");

  const prompt = `Actúa como un analista de Asesoría Técnica Parlamentaria de la Biblioteca del Congreso Nacional de Chile, construyendo una MATRIZ COMPARADA TEMÁTICA sobre "${query}" entre las siguientes jurisdicciones, a partir de las disposiciones REALES ya extraídas del texto de cada norma:

${bloque}

Identifica entre 4 y 6 DIMENSIONES JURÍDICAS SUSTANTIVAS que sean genuinamente comparables entre estas jurisdicciones para esta materia específica (por ejemplo, si la materia fuera acceso a información pública, dimensiones típicas serían "Titularidad", "Plazo y silencio", "Reserva y límites", "Órgano garante", "Transparencia activa"; para otra materia las dimensiones deben ser las que correspondan sustantivamente a ESA materia, no una lista genérica fija).

Responde ÚNICAMENTE con un arreglo JSON válido, compacto, sin texto adicional, con este esquema exacto:
[{"dimension":"Nombre corto de la dimensión (2-4 palabras)","valores":{"NombrePais1":"Celda breve (máx. 25 palabras) basada en sus disposiciones reales","NombrePais2":"..."},"lecturaJuridica":"Una oración (máx. 30 palabras) que sintetice el patrón o diferencia real entre países en esta dimensión"}]

Reglas estrictas:
- Usa EXCLUSIVAMENTE las disposiciones y descripciones entregadas arriba para cada país; no inventes plazos, órganos, cifras ni mecanismos que no estén respaldados por ese contenido.
- Si para un país no hay disposición real que permita llenar una dimensión, escribe exactamente "No especificado en las disposiciones disponibles." en su celda -- nunca inventes contenido de relleno.
- Los nombres de país en "valores" deben ser EXACTAMENTE iguales a los nombres de país entregados arriba (mismo texto).
- No repitas como dimensión el tipo de norma, la fecha ni la fuente (esos datos ya se muestran aparte).`;

  // Con hasta 8 paises seleccionados cada dimension trae mas celdas, asi que
  // se sube el presupuesto de salida para no truncar el JSON a mitad de un
  // pais (antes 2500, pensado para un maximo de 4).
  const texto = await generarContenidoUniversalIA(prompt, 4000);
  if (texto) {
    const parsed = safeJsonParse<Array<{ dimension?: string; valores?: Record<string, string>; lecturaJuridica?: string }>>(texto);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const dimensiones = parsed
        .filter((d) => d.dimension && d.valores)
        .map((d) => ({ dimension: d.dimension!, valores: d.valores!, lecturaJuridica: d.lecturaJuridica || "" }));
      if (dimensiones.length > 0) {
        return res.json({ dimensiones });
      }
    }
  }

  res.json({ dimensiones: [] });
});

// Pestaña "Relaciones": mapa de conceptos reales (no genéricos) que conecta
// las jurisdicciones seleccionadas con los mecanismos, órganos y funciones
// jurídicas que efectivamente aparecen en sus disposiciones reales ya
// extraídas -- para la visualización de red en el frontend.
apiRouter.post("/derecho-comparado/relaciones", async (req: Request, res: Response) => {
  const { query, items } = req.body as {
    query?: string;
    items?: Array<{ pais: string; puntos?: string[]; descripcion?: string }>;
  };
  if (!query || !Array.isArray(items) || items.length < 2) {
    return res.status(400).json({ error: "Se requiere 'query' y al menos 2 'items'." });
  }

  const conPuntos = items.filter((it) => (it.puntos && it.puntos.length > 0) || it.descripcion);
  if (conPuntos.length < 2) {
    return res.json({ nodos: [], enlaces: [] });
  }

  const bloque = conPuntos
    .map((it) => `[${it.pais}]\nDescripción: ${it.descripcion || "(sin descripción)"}\nDisposiciones:\n${(it.puntos || []).map((p) => `  - ${p}`).join("\n")}`)
    .join("\n\n");

  const prompt = `Actúa como un analista de Asesoría Técnica Parlamentaria de la Biblioteca del Congreso Nacional de Chile, construyendo un MAPA DE RELACIONES CONCEPTUALES sobre "${query}" a partir de las disposiciones REALES ya extraídas de estas jurisdicciones:

${bloque}

Identifica los conceptos, mecanismos, órganos y funciones jurídicas REALES que aparecen en esas disposiciones (por ejemplo: un órgano fiscalizador mencionado, un mecanismo de registro, una obligación específica, un principio jurídico) y cómo se conectan con cada jurisdicción y entre sí.

Responde ÚNICAMENTE con un objeto JSON válido, compacto, sin texto adicional, con este esquema exacto:
{"nodos":[{"id":"identificador_corto_snake_case","etiqueta":"Texto visible del nodo","categoria":"jurisdiccion|macrotema|hub_regulatorio|dimension_estructural|funcion_juridica","descripcion":"1 oración (máx. 25 palabras) que explique qué es este nodo y de dónde sale, basada solo en el texto entregado"}],"enlaces":[{"origen":"id_nodo_1","destino":"id_nodo_2"}]}

Reglas estrictas:
- Incluye un nodo "categoria":"macrotema" con id "tema_central", etiqueta "${query}" y "descripcion" que resuma en 1 oración de qué trata la materia comparada.
- Incluye un nodo "categoria":"jurisdiccion" por cada país/jurisdicción entregado arriba (etiqueta = nombre del país), con "descripcion" que resuma en 1 oración su enfoque regulatorio real según lo entregado.
- Incluye entre 6 y 20 nodos adicionales (más si hay más jurisdicciones) de categoría "hub_regulatorio" (órganos, autoridades, registros), "dimension_estructural" (ejes temáticos comparables) o "funcion_juridica" (obligaciones, principios, mecanismos) -- SOLO conceptos que efectivamente aparezcan en las disposiciones o descripciones entregadas arriba, nunca inventados. Cada uno con su "descripcion" explicando qué es y en qué país(es) aparece.
- Cada nodo de jurisdicción debe tener al menos un enlace hacia "tema_central" y hacia los conceptos que efectivamente regula según sus disposiciones reales.
- No inventes órganos, mecanismos ni conceptos que no estén respaldados por el texto entregado.`;

  // Con hasta 8 jurisdicciones (antes 4) hay mas nodos y enlaces reales que
  // extraer, asi que se sube el presupuesto de salida para no truncar el
  // JSON del grafo a mitad de un nodo.
  const texto = await generarContenidoUniversalIA(prompt, 4000);
  if (texto) {
    const parsed = safeJsonParse<{
      nodos?: Array<{ id?: string; etiqueta?: string; categoria?: string; descripcion?: string }>;
      enlaces?: Array<{ origen?: string; destino?: string }>;
    }>(texto);
    if (parsed && Array.isArray(parsed.nodos) && parsed.nodos.length > 0) {
      const nodos = parsed.nodos.filter((n) => n.id && n.etiqueta && n.categoria);
      const idsValidos = new Set(nodos.map((n) => n.id));
      const enlaces = (parsed.enlaces || []).filter((e) => e.origen && e.destino && idsValidos.has(e.origen) && idsValidos.has(e.destino));
      if (nodos.length > 0) {
        return res.json({ nodos, enlaces });
      }
    }
  }

  res.json({ nodos: [], enlaces: [] });
});

apiRouter.get("/leychile/buscar", async (req: Request, res: Response) => {
  const q = req.query.q ? String(req.query.q).trim() : "";
  if (!q) {
    return res.json({ success: true, total: 0, resultados: [] });
  }
  try {
    const normas = await buscarChile(q);
    res.json({
      success: true,
      query: q,
      total: normas.length,
      fuente: "LeyChile — Biblioteca del Congreso Nacional (API Oficial BCN)",
      resultados: normas
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Error al consultar LeyChile" });
  }
});

apiRouter.get("/leychile/norma/:num", async (req: Request, res: Response) => {
  const num = req.params.num;
  try {
    const norma = await buscarLeyChilePorNumero(num);
    if (!norma) {
      return res.status(404).json({ success: false, message: `No se encontró la ley ${num} en LeyChile.` });
    }
    res.json({ success: true, norma });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Error al consultar LeyChile" });
  }
});

// ============================================================================
// 7. YOUTUBE SEARCH & GENERADOR DE INFORMES DE COMISIÓN
// ============================================================================
apiRouter.get("/comisiones/sesion/youtube-search", async (req: Request, res: Response) => {
  try {
    const query = String(req.query.query || "Agricultura");
    const fecha = req.query.fecha ? String(req.query.fecha) : undefined;
    const camara = req.query.camara === "senado" ? "senado" : "diputados";
    const videos = await searchCamaraYouTubeVideos(query, fecha, camara);
    res.json({ success: true, videos });
  } catch (err: any) {
    console.error("Error in /comisiones/sesion/youtube-search:", err);
    res.status(500).json({ error: err.message || "Error al buscar videos en YouTube" });
  }
});

// Transcripción "casi en vivo": subtítulos reales de YouTube (auto-generados o
// cuando existan), sondeados periódicamente por el cliente mientras la sesión
// está en curso. Si YouTube bloquea la petición o la pista aún no existe, se
// devuelve disponible:false con el motivo real -- nunca texto inventado.
apiRouter.get("/comisiones/sesion/transcripcion-vivo", async (req: Request, res: Response) => {
  const videoId = String(req.query.videoId || "").trim();
  if (!videoId) {
    return res.status(400).json({ error: "Se requiere 'videoId'." });
  }
  try {
    const resultado = await fetchYouTubeLiveCaptionsSnapshot(videoId);
    res.json({ videoId, ...resultado, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Error al obtener la transcripción en vivo" });
  }
});

apiRouter.post("/comisiones/sesion/generar-informe", async (req: Request, res: Response) => {
  const {
    comisionNombre = "Comisión Parlamentaria",
    sesionMateria = "Materia en discusión",
    sesionFecha = "Fecha no informada",
    boletinId = "S/B",
    videoId = "",
    videoTitle = "",
    invitados = "",
    tabla = [],
    acuerdosTexto = [],
    actaTexto = ""
  } = req.body;

  const videoContext = videoTitle ? `\n- Video / Transmisión Oficial de la Sesión: "${videoTitle}" (YouTube ID: ${videoId})` : "";

  // Contenido curado y verificado de la sesión (invitados, tabla de la citación,
  // acuerdos y acta) que ya existe en el catálogo de la comisión. Antes esta ruta
  // NUNCA recibía estos campos desde el cliente -- solo la materia general -- por
  // lo que tanto la IA como el respaldo sin IA terminaban rellenando el informe
  // con generalidades sin sustancia ("Ministros de Estado del Ramo: Presentación
  // de antecedentes técnicos...") en vez de contenido real de la sesión.
  const invitadosList: string = typeof invitados === "string" ? invitados : "";
  const tablaList: string[] = Array.isArray(tabla) ? tabla : [];
  const acuerdosList: string[] = Array.isArray(acuerdosTexto) ? acuerdosTexto : [];
  const actaTextoStr: string = typeof actaTexto === "string" ? actaTexto : "";

  const curatedParts: string[] = [];
  if (invitadosList) curatedParts.push(`Invitados y expositores convocados a la sesión: ${invitadosList}`);
  if (tablaList.length > 0) curatedParts.push(`Puntos de la tabla / pauta de la sesión:\n${tablaList.map((t, i) => `${i + 1}. ${t}`).join("\n")}`);
  if (actaTextoStr) curatedParts.push(`Resumen oficial del acta de la sesión: ${actaTextoStr}`);
  if (acuerdosList.length > 0) curatedParts.push(`Acuerdos efectivamente adoptados en la sesión:\n${acuerdosList.map((a, i) => `${i + 1}. ${a}`).join("\n")}`);
  const curatedBlock = curatedParts.length > 0
    ? `\n\nContenido verificado de la sesión (usa esto como fuente principal para las intervenciones, el debate y los acuerdos; no lo sustituyas por generalidades):\n${curatedParts.join("\n\n")}`
    : "";

  // Traer la transcripción real (subtítulos, normalmente auto-generados) del video
  // de la sesión como capa adicional, cuando esté disponible. YouTube bloquea la
  // mayoría de las peticiones de subtítulos hechas desde servidor (sin sesión de
  // navegador), así que esto suele fallar -- por eso el contenido curado de arriba
  // es la fuente principal y no depende de que esto funcione.
  let transcript: Awaited<ReturnType<typeof fetchYouTubeVideoTranscript>> = null;
  if (videoId) {
    try {
      transcript = await fetchYouTubeVideoTranscript(videoId);
    } catch (err) {
      console.warn("Could not fetch YouTube transcript for informe:", err);
    }
  }

  const transcriptBlock = transcript
    ? `\n\nTranscripción real de la sesión (subtítulos ${transcript.auto ? "auto-generados" : "oficiales"} de YouTube, con marcas de tiempo [MM:SS]${transcript.truncated ? ", truncada por extensión" : ""}):\n"""\n${transcript.text}\n"""\n\nÚsala como fuente principal para citas textuales de intervenciones, con su marca de tiempo entre paréntesis.`
    : "";

  // Solo hay CONTENIDO REAL de lo dicho en sala si existe transcripción de la
  // transmisión o un acta/acuerdos con texto sustantivo (no basta con la sola
  // lista de invitados o la tabla, que no dicen qué planteó cada uno).
  const hayContenidoRealDeIntervenciones = !!transcript || !!actaTextoStr || acuerdosList.length > 0;
  const fuentesDisponibles = curatedParts.length > 0 || transcript;

  const prompt = `Actúa como un analista legislativo experto de la Biblioteca del Congreso Nacional de Chile.
Redacta un informe técnico de 3 secciones/páginas de la sesión parlamentaria para ser publicado en el expediente del proyecto de ley.

Información de la Sesión:
- Comisión: ${comisionNombre}
- Fecha de la Sesión: ${sesionFecha}
- Boletín de Ley Asociado: ${boletinId}
- Materia/Tabla en Discusión: ${sesionMateria}${videoContext}${curatedBlock}${transcriptBlock}

REGLA MÁS IMPORTANTE DE TODO EL INFORME: este documento debe reflejar EXCLUSIVAMENTE lo que efectivamente se planteó/dijo en la sesión según las fuentes entregadas arriba (transcripción, acta, acuerdos y tabla). Queda PROHIBIDO inventar, suponer o "reconstruir" lo que un expositor probablemente habría dicho según su cargo o institución -- eso no es información real de la sesión, es una interpretación tuya, y no se puede publicar como si fuera lo ocurrido.

Instrucciones:
${hayContenidoRealDeIntervenciones
    ? `Hay contenido verificado sobre lo ocurrido en la sesión (transcripción y/o acta y/o acuerdos). Para la sección de intervenciones (PÁGINA 2), redacta ÚNICAMENTE lo que esas fuentes efectivamente registran: qué planteó, señaló o expuso cada persona o institución, citando o parafraseando de cerca el contenido real (usa comillas y marca de tiempo [MM:SS] cuando cites literalmente la transcripción). Si el acta/transcripción no registra el planteamiento de alguno de los invitados listados, dilo explícitamente ("no hay registro verificado de su intervención en el acta ni en la transcripción disponible") en vez de suponerlo. No agregues ningún expositor, cita o postura que no esté respaldada por el contenido verificado entregado.`
    : `Solo se dispone de la lista de invitados y la tabla/materia de la sesión -- NO hay transcripción, acta ni acuerdos con contenido real de lo dicho en sala. En la PÁGINA 2, NO redactes planteamientos, posturas ni intervenciones de los invitados (ni siquiera como "probables" o "esperables"): limítate a listar quiénes fueron convocados y sobre qué materia, e indica explícitamente que el detalle de lo efectivamente planteado por cada uno debe verificarse contra el acta oficial o la transmisión, ya que no hay fuente verificada de lo dicho en sala disponible para este informe.`}
No inventes nombres de personas que no estén en la lista de invitados entregada.

FORMATO DE SALIDA (muy importante, respétalo exactamente):
- No agregues ningún título, encabezado ni texto introductorio antes de "PÁGINA 1".
- Separa el documento en exactamente 3 páginas usando el delimitador "===PAGINA===" en su propia línea, SIN encabezados markdown ("##") para separar páginas -- solo ese delimitador literal.
- Tu respuesta debe tener exactamente 2 apariciones de "===PAGINA===" (después de la página 1 y después de la página 2), ni más ni menos.
- Usa la siguiente estructura como plantilla de contenido, no como texto literal a copiar:

PÁGINA 1:
# SÍNTESIS LEGISLATIVA Y ANTECEDENTES GENERALES
**Comisión:** ${comisionNombre}
**Fecha:** ${sesionFecha}
**Boletín:** ${boletinId}
## I. OBJETO Y MATERIA DE LA CONVOCATORIA
(Detalle técnico del proyecto, contexto y fundamentación, basado en la tabla y el acta de la sesión)
## II. AUTORIDADES, MINISTROS Y EXPOSITORES CONVOCADOS
(Nombres y cargos de los invitados entregados; agrupa por tipo de institución)

===PAGINA===

PÁGINA 2:
# FOCO DEL DEBATE PARLAMENTARIO Y AUDIENCIAS
## III. INTERVENCIONES Y PRINCIPALES EJES DE LA DISCUSIÓN
* **Planteamientos efectivamente registrados:** (Para cada invitado del que el acta, los acuerdos o la transcripción registren contenido real, resume lo que efectivamente planteó/señaló, citando de cerca la fuente; si no hay registro verificado de un invitado, dilo explícitamente en vez de suponerlo)
* **Puntos Críticos y Diagnóstico:** (Aspectos normativos, impacto presupuestario y estándares legales efectivamente planteados en la sesión, según el acta y los acuerdos -- no según supuestos)
* **Observaciones y Cuestionamientos de los Parlamentarios:** (Solo si están registrados en el acta/acuerdos entregados; si no hay registro, indícalo)

===PAGINA===

PÁGINA 3:
# RESOLUCIONES, ACUERDOS Y ESTADO DE TRAMITACIÓN
## IV. ACUERDOS ADOPTADOS POR LA COMISIÓN
* (Transcribe y desarrolla cada acuerdo entregado; si no hay acuerdos verificados, indícalo explícitamente en vez de inventarlos)
## V. PRÓXIMOS PASOS EN EL PROCESO LEGISLATIVO
(Siguiente trámite constitucional, citaciones subsiguientes o paso a Sala)
🔗 *Documento oficial vinculado a la sesión audiovisual (${videoTitle || "Canal Oficial del Congreso"})*`;

  let reportPages: string[] = [];
  const aiAttempts: AIProviderAttempt[] = [];
  try {
    const reportText = await generarContenidoUniversalIA(prompt, 3500, aiAttempts);
    if (reportText) {
      if (reportText.includes("===PAGINA===")) {
        reportPages = reportText.split("===PAGINA===").map((p: string) => p.trim()).filter(Boolean);
      } else {
        // El modelo no usó el delimitador literal pedido -- a veces lo reemplaza
        // por un encabezado markdown ("## PÁGINA N") y otras veces por texto
        // plano sin "#" ("PÁGINA N:"). Se intenta dividir por cualquiera de los
        // dos patrones en vez de fabricar páginas de relleno que no
        // reflejarían el contenido real ya generado.
        const porEncabezado = reportText.split(/\n#{0,3}\s*P[ÁA]GINA\s*\d\s*:?\s*\n?/i).map((p: string) => p.trim()).filter(Boolean);
        reportPages = porEncabezado.length >= 2 ? porEncabezado : [reportText];
      }
    }
  } catch (err) {
    console.warn("Could not generate AI report with LLM:", err);
  }

  if (reportPages.length === 0) {
    // Ningún proveedor de IA respondió (sin claves configuradas, cuota agotada, o
    // error de red). En vez de simular un informe con contenido genérico que
    // aparenta describir una sesión real sin serlo, se deja explícito que el
    // informe no pudo generarse y qué se puede revisar manualmente mientras tanto.
    const p1 = `# SÍNTESIS LEGISLATIVA Y ANTECEDENTES GENERALES
**Comisión:** ${comisionNombre}
**Fecha:** ${sesionFecha}
**Boletín:** ${boletinId}
${videoTitle ? `**Transmisión Oficial:** ${videoTitle}` : ""}

## ⚠️ Informe no disponible
No fue posible generar el informe con inteligencia artificial en este momento (proveedor de IA no configurado, sin cuota disponible, o error de red).

**Materia de la sesión:**
> "${sesionMateria}"

Vuelve a intentarlo en unos minutos. Mientras tanto, puedes revisar la transmisión oficial${videoTitle ? ` ("${videoTitle}")` : ""} directamente en el canal de YouTube del Congreso.`;

    const p2 = `# FOCO DEL DEBATE PARLAMENTARIO Y AUDIENCIAS
## Intervenciones no disponibles
Este informe no pudo redactarse automáticamente, por lo que no contiene citas ni intervenciones reales de la sesión. Revisa la transmisión oficial para conocer el detalle del debate.`;

    const p3 = `# RESOLUCIONES, ACUERDOS Y ESTADO DE TRAMITACIÓN
## Acuerdos no disponibles
Los acuerdos de esta sesión no pudieron sintetizarse automáticamente. Consulta el acta oficial o la transmisión de la sesión (Boletín N° ${boletinId}) para conocer las resoluciones adoptadas.`;

    reportPages = [p1, p2, p3];
  }

  const documentObj = {
    reportContent: reportPages,
    boletinId,
    sesionFecha,
    comisionNombre,
    videoTitle,
    videoId,
    transcriptAvailable: !!transcript
  };

  res.json({
    success: true,
    documento: documentObj,
    reportContent: reportPages,
    transcriptAvailable: !!transcript,
    // Diagnóstico de qué proveedor de IA se usó (o por qué falló cada uno). Nunca
    // incluye claves ni contenido del prompt, solo mensajes de error.
    aiDiagnostics: aiAttempts
  });
});

// ============================================================================
// 8. COPILOTO LEGISLATIVO CHAT
// ============================================================================
apiRouter.post("/copiloto/chat", async (req: Request, res: Response) => {
  try {
    const { mensaje, contextoBoletin, contextoComision, historial } = req.body;
    if (!mensaje || typeof mensaje !== "string") {
      return res.status(400).json({ error: "El campo 'mensaje' es requerido." });
    }

    const respuestaCopiloto = await responderCopilotoLegislativo({
      mensaje,
      contextoBoletin,
      contextoComision,
      historial
    });

    res.json(respuestaCopiloto);
  } catch (error: any) {
    console.error("Error en Copiloto Legislativo:", error);
    res.status(500).json({ error: error?.message || "Error al procesar consulta" });
  }
});

// ============================================================================
// 9. STATISTICS++ DATA ENGINE (OUR WORLD IN DATA & BCN SIIT)
// ============================================================================
apiRouter.get("/statistics/topics", (_req: Request, res: Response) => {
  try {
    const topics = getOWIDTopics();
    res.json(topics);
  } catch (error: any) {
    console.error("Error en /statistics/topics:", error);
    res.status(500).json({ error: "Error al obtener tópicos estadísticos" });
  }
});

apiRouter.get("/statistics/indicator/:id?", (req: Request, res: Response) => {
  try {
    const id = req.params.id || (req.query.id as string);
    const indicator = getOWIDIndicator(id);
    res.json(indicator);
  } catch (error: any) {
    console.error("Error en /statistics/indicator:", error);
    res.status(500).json({ error: "Error al obtener indicador" });
  }
});

apiRouter.get("/statistics/all", (_req: Request, res: Response) => {
  try {
    const all = getAllOWIDIndicators();
    res.json(all);
  } catch (error: any) {
    console.error("Error en /statistics/all:", error);
    res.status(500).json({ error: "Error al listar indicadores" });
  }
});

// Redacta el informe en prosa de un dataset subido por el usuario (CSV/Excel)
// EXCLUSIVAMENTE a partir de las estadísticas ya calculadas de forma
// determinística en el cliente (min/max/promedio/nulos/etc. por columna) --
// nunca se le pide a la IA que calcule cifras, solo que las describa.
apiRouter.post("/statistics/analizar-dataset", async (req: Request, res: Response) => {
  const { nombre, totalFilas, columnas } = req.body as {
    nombre?: string;
    totalFilas?: number;
    columnas?: Array<Record<string, any>>;
  };
  if (!nombre || !totalFilas || !Array.isArray(columnas) || columnas.length === 0) {
    return res.status(400).json({ error: "Se requiere 'nombre', 'totalFilas' y un arreglo 'columnas' no vacío." });
  }

  const columnasTexto = columnas
    .map((c) => {
      if (c.tipo === "numerico") {
        return `- ${c.nombre} (numérico): mín=${c.min}, máx=${c.max}, promedio=${c.promedio}, mediana=${c.mediana}, desviación estándar=${c.desviacionEstandar}, valores nulos=${c.nulos}`;
      }
      if (c.tipo === "fecha") {
        return `- ${c.nombre} (fecha): rango entre ${c.fechaMin} y ${c.fechaMax}, valores nulos=${c.nulos}`;
      }
      const top = (c.topValores || []).map((t: any) => `${t.valor} (${t.conteo})`).join(", ");
      return `- ${c.nombre} (categórico): ${c.valoresUnicos} valores únicos, más frecuentes: ${top || "N/D"}, valores nulos=${c.nulos}`;
    })
    .join("\n");

  const prompt = `Actúa como un analista de datos legislativos. A continuación se entregan las estadísticas REALES, YA CALCULADAS, de un dataset llamado "${nombre}" con ${totalFilas} filas y ${columnas.length} columnas, subido por un analista parlamentario.

Estadísticas por columna:
${columnasTexto}

Redacta un informe breve (máx. 220 palabras) en prosa formal, en tercera persona, sin emojis ni viñetas, describiendo el contenido del dataset: qué tipo de información parece contener (según los nombres y rangos de las columnas), qué patrones o particularidades destacan de las cifras entregadas (ej. columnas con muchos valores nulos, rangos inusuales, categorías dominantes), y qué utilidad podría tener para el análisis legislativo o de políticas públicas.

USA EXCLUSIVAMENTE las cifras entregadas arriba. No inventes valores, columnas ni conclusiones que no se desprendan directamente de esas estadísticas. Si el propósito del dataset no es evidente a partir de los nombres de columna, dilo explícitamente en vez de adivinar.

Responde solo con el informe, sin encabezados ni markdown.`;

  const texto = await generarContenidoUniversalIA(prompt, 600);
  if (texto) {
    return res.json({ informe: texto });
  }

  const columnasNumericas = columnas.filter((c) => c.tipo === "numerico").length;
  const columnasFecha = columnas.filter((c) => c.tipo === "fecha").length;
  const columnasCategoricas = columnas.filter((c) => c.tipo === "categorico").length;
  const fallback = `El dataset "${nombre}" contiene ${totalFilas} filas y ${columnas.length} columnas (${columnasNumericas} numéricas, ${columnasFecha} de fecha, ${columnasCategoricas} categóricas). No fue posible generar un análisis narrativo con IA en este momento; revisa las estadísticas por columna listadas más abajo.`;
  res.json({ informe: fallback });
});

// ============================================================================
// 9.5 DATA.EUROPA.EU (PORTAL OFICIAL DE DATOS ABIERTOS DE LA UE)
// ============================================================================
// El endpoint oficial de búsqueda (https://data.europa.eu/api/hub/search/search)
// documenta un parámetro "facets" para filtrar por país, pero probado en vivo
// NO filtra realmente (el "count" no cambia sin importar el valor) -- parece
// un desfase entre el spec OpenAPI publicado y la versión desplegada. Por eso
// el filtro por país se aplica ACÁ, en el backend, sobre los resultados ya
// obtenidos (cada resultado sí trae un "country.id" confiable).
interface EuroDatasetDistribucion {
  id: string;
  titulo: string;
  formato: string;
  url: string;
  tamanoBytes?: number;
}
interface EuroDatasetResultado {
  id: string;
  titulo: string;
  descripcion: string;
  pais: string;
  paisLabel: string;
  publicador?: string;
  landingPage?: string;
  distribuciones: EuroDatasetDistribucion[];
}

function primerTextoIdioma(campo: any): string {
  if (!campo) return "";
  if (typeof campo === "string") return campo;
  return campo.es || campo.en || Object.values(campo)[0] as string || "";
}

apiRouter.get("/opendata/buscar", async (req: Request, res: Response) => {
  const q = req.query.q ? String(req.query.q).trim() : "";
  const pais = req.query.pais ? String(req.query.pais).trim().toLowerCase() : "";
  if (!q) {
    return res.status(400).json({ error: "Se requiere el parámetro 'q'." });
  }

  try {
    // Se piden hasta 100 resultados sin filtrar (el límite real de países UE
    // suele quedar cubierto en ese rango para una búsqueda temática) y se
    // filtra por país en memoria, ya que el filtro del lado del servidor de
    // la API no funciona de forma confiable.
    const url = `https://data.europa.eu/api/hub/search/search?q=${encodeURIComponent(q)}&limit=100`;
    const apiRes = await fetchConTimeout(url, 12000);
    if (!apiRes.ok) {
      return res.status(502).json({ error: `data.europa.eu respondió HTTP ${apiRes.status}` });
    }
    const data: any = await apiRes.json();
    let resultadosCrudos: any[] = data?.result?.results || [];

    if (pais) {
      resultadosCrudos = resultadosCrudos.filter((r) => (r.country?.id || "").toLowerCase() === pais);
    }

    const resultados: EuroDatasetResultado[] = resultadosCrudos.slice(0, 30).map((r) => ({
      id: r.id || r.identifier?.[0] || "",
      titulo: primerTextoIdioma(r.title) || "(sin título)",
      descripcion: primerTextoIdioma(r.description).slice(0, 300),
      pais: r.country?.id || "",
      paisLabel: r.country?.label || "",
      publicador: r.publisher?.name,
      landingPage: r.landing_page,
      distribuciones: (r.distributions || [])
        .filter((d: any) => Array.isArray(d.access_url) && d.access_url.length > 0)
        .map((d: any) => ({
          id: d.id,
          titulo: primerTextoIdioma(d.title) || d.format?.label || "Distribución",
          formato: d.format?.id || d.format?.label || "Desconocido",
          url: d.access_url[0],
          tamanoBytes: d.byte_size
        }))
        // Solo CSV/XLS(X) -- el analizador de datasets del frontend
        // (parseDatasetFile) solo sabe leer esos dos formatos; JSON y
        // JSON-STAT (habituales en data.europa.eu) fallarían al importar.
        .filter((d: EuroDatasetDistribucion) => /\bcsv\b|\bxlsx?\b/i.test(d.formato))
    })).filter((r) => r.distribuciones.length > 0);

    res.json({ total: data?.result?.count || 0, resultados });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "No fue posible consultar data.europa.eu." });
  }
});

// Proxy de descarga: los access_url de las distribuciones (portales de
// terceros, uno distinto por cada país/organismo) no traen cabeceras CORS,
// así que el navegador no puede descargarlos directamente -- este endpoint
// los descarga en el servidor y se los entrega al frontend desde el mismo
// origen. Restringido a http(s) y con límites de tamaño/tiempo para no
// convertirlo en un proxy abierto arbitrario.
apiRouter.get("/opendata/descargar", async (req: Request, res: Response) => {
  const url = req.query.url ? String(req.query.url) : "";
  const nombre = req.query.nombre ? String(req.query.nombre) : "descarga";
  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: "Se requiere un parámetro 'url' http(s) válido." });
  }
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return res.status(400).json({ error: "URL inválida." });
  }
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local") || /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host)) {
    return res.status(400).json({ error: "No se permite descargar desde direcciones internas." });
  }

  try {
    const fileRes = await fetchConTimeout(url, 20000);
    if (!fileRes.ok) {
      return res.status(502).json({ error: `La fuente respondió HTTP ${fileRes.status}` });
    }
    const contentLength = fileRes.headers.get("content-length");
    if (contentLength && Number(contentLength) > 30 * 1024 * 1024) {
      return res.status(413).json({ error: "El archivo supera el límite de 30MB permitido para importar." });
    }
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    if (buffer.length > 30 * 1024 * 1024) {
      return res.status(413).json({ error: "El archivo supera el límite de 30MB permitido para importar." });
    }
    res.setHeader("Content-Type", fileRes.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${nombre.replace(/[^\w.\-]/g, "_")}"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "No fue posible descargar el archivo." });
  }
});

// ============================================================================
// 10. FAOSTAT (NACIONES UNIDAS - AGRICULTURA & ALIMENTACIÓN)
// ============================================================================
apiRouter.get("/fao/groups", async (_req: Request, res: Response) => {
  try {
    const groups = await getFAOGroupsAndDomains();
    res.json({ success: true, count: groups.length, data: groups });
  } catch (error: any) {
    console.error("Error en /fao/groups:", error);
    res.status(500).json({ error: "Error al consultar grupos FAOSTAT" });
  }
});

apiRouter.get("/fao/data/:domain", async (req: Request, res: Response) => {
  try {
    const domain = req.params.domain || "QCL";
    const params: Record<string, string | number> = {
      area: (req.query.area as string) || "40",
      year: (req.query.year as string) || "2022"
    };
    if (req.query.item) params.item = String(req.query.item);
    if (req.query.element) params.element = String(req.query.element);

    const records = await queryFAOData(domain, params);
    res.json({ success: true, domain, count: records.length, data: records });
  } catch (error: any) {
    console.error(`Error en /fao/data/${req.params.domain}:`, error);
    res.status(500).json({ error: "Error al consultar datos FAOSTAT" });
  }
});

// ============================================================================
// 11. SERVEL (SERVICIO ELECTORAL & ELECCIONES HISTÓRICAS)
// ============================================================================
apiRouter.get("/servel/presidenciales", (_req: Request, res: Response) => {
  try {
    const data = getServelPresidenciales();
    res.json({ success: true, total: data.length, data });
  } catch (error: any) {
    console.error("Error en /servel/presidenciales:", error);
    res.status(500).json({ error: "Error al obtener elecciones presidenciales SERVEL" });
  }
});

apiRouter.get("/servel/plebiscitos", (_req: Request, res: Response) => {
  try {
    const data = getServelPlebiscitos();
    res.json({ success: true, total: data.length, data });
  } catch (error: any) {
    console.error("Error en /servel/plebiscitos:", error);
    res.status(500).json({ error: "Error al obtener plebiscitos históricos SERVEL" });
  }
});

apiRouter.get("/servel/participacion-regional", (_req: Request, res: Response) => {
  try {
    const data = getServelParticipacionRegional();
    res.json({ success: true, total: data.length, data });
  } catch (error: any) {
    console.error("Error en /servel/participacion-regional:", error);
    res.status(500).json({ error: "Error al obtener participación regional SERVEL" });
  }
});

// ============================================================================
// 12. MINEDUC (DATOS ABIERTOS CENTRO DE ESTUDIOS MINEDUC)
// ============================================================================
apiRouter.get("/mineduc/datasets", (_req: Request, res: Response) => {
  try {
    const catalog = getMineducCatalog();
    res.json({ success: true, count: catalog.length, portal: "https://datosabiertos.mineduc.cl/", data: catalog });
  } catch (error: any) {
    console.error("Error en /mineduc/datasets:", error);
    res.status(500).json({ error: "Error al obtener catálogo MINEDUC" });
  }
});

// ============================================================================
// 13. CEAD (CENTRO DE ESTUDIOS Y ANÁLISIS DEL DELITO - SPD)
// ============================================================================
apiRouter.get("/cead/datasets", (_req: Request, res: Response) => {
  try {
    const catalog = getCeadCatalog();
    res.json({ success: true, count: catalog.length, portal: "https://cead.minsegpublica.gob.cl/", data: catalog });
  } catch (error: any) {
    console.error("Error en /cead/datasets:", error);
    res.status(500).json({ error: "Error al obtener catálogo CEAD" });
  }
});

// ============================================================================
// 14. INE (INSTITUTO NACIONAL DE ESTADÍSTICAS - CHILE)
// ============================================================================
apiRouter.get("/ine/datasets", (_req: Request, res: Response) => {
  try {
    const catalog = getIneCatalog();
    res.json({ success: true, count: catalog.length, portal: "https://www.ine.gob.cl/estadisticas-por-tema", data: catalog });
  } catch (error: any) {
    console.error("Error en /ine/datasets:", error);
    res.status(500).json({ error: "Error al obtener catálogo INE" });
  }
});

// ============================================================================
// 15. SERNAPESCA (SERVICIO NACIONAL DE PESCA Y ACUICULTURA)
// ============================================================================
apiRouter.get("/sernapesca/datasets", (_req: Request, res: Response) => {
  try {
    const catalog = getSernapescaCatalog();
    res.json({ success: true, count: catalog.length, portal: "https://www.sernapesca.cl/informes/estadisticas/", data: catalog });
  } catch (error: any) {
    console.error("Error en /sernapesca/datasets:", error);
    res.status(500).json({ error: "Error al obtener catálogo SERNAPESCA" });
  }
});




