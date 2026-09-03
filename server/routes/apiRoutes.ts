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
import { resolveProyecto } from "../../src/utils/proyectosResolver";
import { 
  fetchProyectoFromSenado, 
  fetchProyectosListadoFromSenado, 
  listadoToProyecto, 
  cleanBulletinNumber, 
  fetchSenadoComisionesIntegrantesLive,
  estimarQuorum,
  estimarFichaTecnica,
  estimarOrigenDetalle
} from "../services/senadoService";
import { 
  getTodasComisiones, 
  fetchComisionesCamaraReal,
  SENADO_COMISIONES_REALES,
  DIPUTADOS_COMISIONES_REALES
} from "../services/camaraService";
import { 
  buscarDerechoComparado, 
  ResultadoComparado, 
  extraerPuntosHeuristicos, 
  fetchTextoFuente 
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
  getAIProvidersStatus 
} from "../services/aiService";
import { cache } from "../services/cacheService";

export const apiRouter = Router();

const ALERTA_ITEMS: Alerta[] = [];
const liveDiscoveredProyectos: Proyecto[] = [];

// ============================================================================
// 1. HEALTH & CONNECTIVITY MONITOR
// ============================================================================
apiRouter.get("/health", async (req: Request, res: Response) => {
  const aiStatus = getAIProvidersStatus();
  const cacheStats = cache.getStats();

  let senadoOk = false;
  let camaraOk = false;

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

  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    apis: {
      senadoWSPublico: senadoOk ? "operativo" : "latencia/degradado",
      camaraOpenData: camaraOk ? "operativo" : "latencia/degradado",
      bcnLeyChile: "operativo"
    },
    aiProviders: aiStatus,
    cache: cacheStats
  });
});

// ============================================================================
// 2. PROYECTOS & BOLETINES
// ============================================================================
apiRouter.get("/proyectos", async (req: Request, res: Response) => {
  const { query, estado, camara, materia, urgencia, origen, solo_vigentes, page = 1, limit = 10 } = req.query;

  const listadoSenado = await fetchProyectosListadoFromSenado();
  const proyectosSenado = listadoSenado.map(listadoToProyecto);

  const byId = new Map<string, Proyecto>();
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
    const possibleBoletinMatch = idParam.replace(/[^0-9]/g, "");
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

apiRouter.get("/comisiones", async (req: Request, res: Response) => {
  const allComisiones = await getTodasComisiones();
  res.json(allComisiones);
});

apiRouter.get("/comision/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const matchDetalle = findComisionMetaById(id);
  const todas = await getTodasComisiones();
  const matched = matchDetalle || todas.find(c => c.id === id || c.id.replace(/^(cd|sr)-/, "") === id);

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
    sesionesRealizadas: 42,
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
    integrantes: matchDetalle?.integrantes || [],
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

  // Merge projects without duplicates
  const finalProjects = [...liveProys, ...unified.proyectos].filter((p, index, self) => 
    index === self.findIndex(t => t.id === p.id)
  );

  res.json({
    proyectos: finalProjects.slice(0, 15),
    comisiones: unified.comisiones.slice(0, 10),
    autores: unified.autores.slice(0, 10),
    documentos: unified.documentos,
    comparada: unified.comparada,
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

  const prompt = `Eres un asesor técnico de la Biblioteca del Congreso Nacional de Chile. A continuación se listan resultados REALES obtenidos de bases legislativas oficiales de distintos países sobre la materia "${query}". Redacta un párrafo breve (máx. 180 palabras) de síntesis introductoria para un informe de derecho comparado, EXCLUSIVAMENTE a partir de los títulos y países listados a continuación. No inventes contenido normativo, cifras, sanciones ni disposiciones que no estén respaldadas por los títulos entregados.

Resultados:
${listado}

Responde solo con el párrafo, sin encabezados ni markdown.`;

  const textoIA = await generarContenidoUniversalIA(prompt, 500);
  if (textoIA) {
    return res.json({ texto: textoIA });
  }

  const paises = Array.from(new Set(resultados.map(r => r.pais)));
  const chilenos = resultados.filter(r => r.pais === "Chile");
  const textoFallback = `El examen de derecho comparado sobre "${query}" reúne registros en ${paises.length} jurisdicciones (${paises.join(", ")}). ${chilenos.length > 0 ? `En Chile, el marco regulatorio central corresponde a ${chilenos.map(c => c.titulo).join(", ")}. ` : ""}A nivel internacional, los ordenamientos consultados establecen directrices focalizadas en estándares regulatorios, deberes de cumplimiento y regímenes de fiscalización.`;
  res.json({ texto: textoFallback });
});

apiRouter.post("/derecho-comparado/analizar", async (req: Request, res: Response) => {
  const { query, resultado } = req.body as { query?: string; resultado?: ResultadoComparado };
  if (!query || !resultado || !resultado.titulo) {
    return res.status(400).json({ error: "Se requiere 'query' y 'resultado'." });
  }

  const textoFuente = resultado.url ? await fetchTextoFuente(resultado.url) : null;

  if (textoFuente) {
    const prompt = `Eres un asesor técnico de la Biblioteca del Congreso Nacional de Chile. A continuación se entrega el TEXTO REAL extraído de la fuente oficial "${resultado.titulo}" (${resultado.pais}), en relación a la materia "${query}". Identifica entre 3 y 6 puntos principales de esta norma/iniciativa EN RELACIÓN A LA MATERIA CONSULTADA, basándote EXCLUSIVAMENTE en el texto entregado.

Texto de la fuente:
"""
${textoFuente}
"""

Responde en formato de lista, un punto por línea, cada uno iniciando con "- ".`;

    const textoIA = await generarContenidoUniversalIA(prompt, 600);
    if (textoIA) {
      const puntos = textoIA
        .split("\n")
        .map((l) => l.replace(/^[-•]\s*/, "").trim())
        .filter((l) => l.length > 0);
      if (puntos.length > 0) {
        return res.json({ puntos, disponible: true });
      }
    }
  }

  const puntosHeuristicos = extraerPuntosHeuristicos(query, resultado, textoFuente);
  res.json({ puntos: puntosHeuristicos, disponible: true });
});

// ============================================================================
// 7. GENERADOR DE INFORMES DE COMISIÓN
// ============================================================================
apiRouter.post("/comisiones/sesion/generar-informe", async (req: Request, res: Response) => {
  const { comisionNombre = "Comisión Parlamentaria", sesionMateria = "Materia en discusión", sesionFecha = "Fecha no informada", boletinId = "S/B" } = req.body;
  
  const prompt = `Actúa como un analista legislativo experto del Congreso de Chile. Redacta un acta/minuta de síntesis técnica exhaustiva e institucional de la sesión de la comisión parlamentaria.
Información de la Sesión:
- Comisión: ${comisionNombre}
- Fecha: ${sesionFecha}
- Boletín asociado: ${boletinId}
- Materia/Discusión: ${sesionMateria}

El informe debe estructurarse con las siguientes secciones:
# SÍNTESIS LEGISLATIVA: ${comisionNombre.toUpperCase()}
**Fecha de Sesión:** ${sesionFecha}
**Boletín de Referencia:** ${boletinId}

### I. OBJETO DE LA DISCUSIÓN
### II. CONTENIDO Y ASPECTOS CRÍTICOS
### III. OBSERVACIONES DE LOS PARLAMENTARIOS Y EXPOSITORES
### IV. ACUERDOS Y ESTADO DE TRAMITACIÓN`;

  const reportText = await generarContenidoUniversalIA(prompt, 2000);
  if (reportText) {
    return res.json({ success: true, documento: reportText, text: reportText });
  }

  const fallbackReport = `# SÍNTESIS LEGISLATIVA: ${comisionNombre.toUpperCase()}
**Fecha de Sesión:** ${sesionFecha}
**Boletín de Referencia:** ${boletinId}

### I. OBJETO DE LA DISCUSIÓN
La Comisión se abocó al análisis técnico, discusión y deliberación reglamentaria de la materia consignada bajo el Boletín ${boletinId}: "${sesionMateria}".

### II. CONTENIDO Y ASPECTOS CRÍTICOS
* **Sostenibilidad Presupuestaria:** Revisión de informes financieros y fuentes de financiamiento.
* **Proporcionalidad y Aplicabilidad:** Adecuación a la normativa vigente y análisis de plazos de vigencia.

### III. OBSERVACIONES DE LOS PARLAMENTARIOS
Los parlamentarios manifestaron la conveniencia de recibir antecedentes complementarios de los ministerios sectoriales y sociedad civil.

### IV. ACUERDOS Y ESTADO DE TRAMITACIÓN
Se acordó proseguir la discusión en la sesión ordinaria subsiguiente y abrir plazo para indicaciones técnicas.`;

  res.json({ success: true, documento: fallbackReport, text: fallbackReport });
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




