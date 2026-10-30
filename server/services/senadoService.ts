import { Proyecto, ActivityItem, VotacionItem, PasoComision } from "../../src/types";
import { cache } from "./cacheService";
import { generarContenidoUniversalIA, safeJsonParse, AIProviderAttempt } from "./aiService";
import { MATERIA_COMISION_MAP } from "../../src/utils/proyectosResolver";
import { limpiarNombreComision } from "../../src/utils/comisionesNombre";

export interface ProyectoListado {
  id: string;
  titulo: string;
  estado: string;
  fecha: string;
  ley?: string;
}

export interface IntegranteLive {
  nombre: string;
  partido: string;
  rol: string;
}

export interface SenadoComisionParsed {
  titulo: string;
  integrantes: IntegranteLive[];
  secretario?: string;
}

function parseFechaDDMMYYYY(fecha: string): Date | null {
  const m = fecha.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function diffDias(desde: Date, hasta: Date): number {
  return Math.max(0, Math.round((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Calcula el historial real de paso por comisiones a partir de la línea de
 * tiempo oficial de tramitación (server/services/senadoService.ts la trae de
 * tramitacion.senado.cl). Cada vez que un trámite dice "Pasa a Comisión de
 * X" se registra la fecha de entrada; la fecha de salida de un paso es la
 * fecha de entrada del siguiente (o null si sigue actualmente ahí).
 */
export function computePasosComision(timeline: ActivityItem[]): PasoComision[] {
  const regex = /pasa a (?:la )?comisi[oó]n de ([^.(\n]+?)(?:\s*\(|\.|$)/i;
  const transiciones: { comisionNombre: string; fecha: string }[] = [];

  for (const t of timeline) {
    const m = (t.descripcion || "").match(regex);
    if (m) {
      const nombre = m[1].trim().replace(/\s+/g, " ");
      if (nombre) transiciones.push({ comisionNombre: nombre, fecha: t.fecha });
    }
  }
  if (transiciones.length === 0) return [];

  const hoy = new Date();
  return transiciones.map((tr, idx) => {
    const entrada = parseFechaDDMMYYYY(tr.fecha);
    const siguiente = transiciones[idx + 1];
    const salida = siguiente ? parseFechaDDMMYYYY(siguiente.fecha) : null;
    return {
      comisionNombre: tr.comisionNombre,
      fechaEntrada: tr.fecha,
      fechaSalida: siguiente ? siguiente.fecha : null,
      diasEnComision: entrada ? diffDias(entrada, salida || hoy) : undefined
    };
  });
}

export function formatBoletin(boletin: string): string {
  const clean = boletin.replace(/[\s\.]/g, "").trim();
  const parts = clean.split("-");
  const num = parts[0];
  const sub = parts[1] || "";
  
  if (num.length > 3) {
    const formattedNum = num.slice(0, -3) + "." + num.slice(-3);
    return sub ? `${formattedNum}-${sub}` : formattedNum;
  }
  return clean;
}

export function cleanBulletinNumber(str: string): string {
  return String(str || "").replace(/[\s\.\-]/g, "").toLowerCase();
}

export function getSenadoApiLink(id: string): string {
  const base = id.split("-")[0];
  const digits = base.replace(/[^0-9]/g, "");
  return `https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=${digits}`;
}

export function parseFechaChilena(fecha: string): string {
  const m = fecha.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return fecha.trim();
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** Los enlaces del XML apuntan al sitio antiguo (www.senado.cl/appsenado), que ya no sirve los documentos. */
export function urlOficialSenado(u: string): string {
  const s = String(u || "").trim().replace(/&amp;/g, "&");
  if (!s) return "";
  return s
    .replace(/^https?:\/\/(www\.)?senado\.cl\/appsenado/i, "https://tramitacion.senado.cl/appsenado")
    .replace(/^http:\/\/tramitacion\.senado\.cl/i, "https://tramitacion.senado.cl");
}

export function computeDiasTramitacion(fechaIngreso: string): number | undefined {
  if (!fechaIngreso) return undefined;
  const start = new Date(fechaIngreso);
  if (isNaN(start.getTime())) return undefined;
  const diffMs = Date.now() - start.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return dias >= 0 ? dias : undefined;
}

export function clasificarMateria(titulo: string): string {
  const t = titulo.toLowerCase();
  if (t.includes("pesca") || t.includes("acuicultura") || t.includes("marítimo")) return "Intereses Marítimos, Pesca y Acuicultura";
  if (t.includes("trabajo") || t.includes("previsión") || t.includes("empleo") || t.includes("jubila") || t.includes("pension")) return "Trabajo y Previsión Social";
  if (t.includes("delito") || t.includes("seguridad") || t.includes("ciberseguridad") || t.includes("carabinero") || t.includes("violencia")) return "Seguridad Ciudadana";
  if (t.includes("salud") || t.includes("médic") || t.includes("hospital") || t.includes("fármaco")) return "Salud";
  if (t.includes("impuesto") || t.includes("tribut") || t.includes("presupuesto") || t.includes("hacienda") || t.includes("financ")) return "Hacienda";
  if (t.includes("educación") || t.includes("escolar") || t.includes("universi") || t.includes("colegio")) return "Educación";
  if (t.includes("medio ambiente") || t.includes("glaciar") || t.includes("ecolog") || t.includes("contamina")) return "Medio Ambiente y Bienes Nacionales";
  return "Constitución, Legislación y Justicia";
}

export function estimarQuorum(titulo: string, materia: string): Proyecto["quorum"] {
  const text = `${titulo} ${materia}`.toLowerCase();
  
  if (text.includes("reforma constitucional") || text.includes("modifica la constitución") || text.includes("carta fundamental")) {
    return {
      tipo: "Reforma Constitucional",
      descripcion: "Requiere la aprobación de las cuatro séptimas (4/7) partes de los diputados y senadores en ejercicio (Art. 127 de la Constitución Política).",
      votosDiputados: "89 diputados (de 155)",
      votosSenadores: "29 senadores (de 50)"
    };
  }

  if (
    text.includes("orgánica") || 
    text.includes("tribunal") || 
    text.includes("poder judicial") || 
    text.includes("banco central") || 
    text.includes("fuerzas armadas") || 
    text.includes("carabineros") || 
    text.includes("contraloría") || 
    text.includes("votaciones") || 
    text.includes("electoral") || 
    text.includes("congreso nacional")
  ) {
    return {
      tipo: "Ley Orgánica Constitucional",
      descripcion: "Requiere la mayoría absoluta de los diputados y senadores en ejercicio (Art. 66 de la Constitución Política, modificado por Ley N° 21.481).",
      votosDiputados: "78 diputados (de 155)",
      votosSenadores: "26 senadores (de 50)"
    };
  }

  if (
    text.includes("quórum calificado") || 
    text.includes("seguridad social") || 
    text.includes("pension") || 
    text.includes("jubila") || 
    text.includes("pena de muerte") || 
    text.includes("conductas terroristas") || 
    text.includes("armas")
  ) {
    return {
      tipo: "Quórum Calificado",
      descripcion: "Requiere la mayoría absoluta de los diputados y senadores en ejercicio (Art. 66 de la Constitución Política).",
      votosDiputados: "78 diputados (de 155)",
      votosSenadores: "26 senadores (de 50)"
    };
  }

  return {
    tipo: "Ley Simple",
    descripcion: "Requiere la mayoría simple de los miembros presentes en la sala de cada cámara parlamentaria.",
    votosDiputados: "Mayoría de presentes (~40-78 diputados)",
    votosSenadores: "Mayoría de presentes (~13-26 senadores)"
  };
}

export function estimarFichaTecnica(titulo: string, materia: string): { objeto: string; mecanismos: string; fiscalizacion: string } {
  const t = titulo.toLowerCase();
  
  let objeto = `🎯 Objeto & Ámbito: Establece un marco normativo integral sobre "${titulo}", delimitando los sujetos obligados y las garantías jurídicas aplicables en el territorio nacional.`;
  let mecanismos = `⚙️ Mecanismos Clave: Introduce modificaciones a los cuerpos legales vigentes, fijando protocolos de cumplimiento, plazos de adecuación y deberes de información para los sectores concernidos.`;
  let fiscalizacion = `⚖️ Fiscalización & Sanciones: Otorga potestades de fiscalización a las autoridades competentes del Estado y establece sanciones administrativas y civiles proporcionales ante incumplimientos.`;

  if (t.includes("inteligencia artificial") || t.includes("datos personales") || t.includes("algoritmo")) {
    objeto = "🎯 Objeto & Ámbito: Regula el desarrollo, comercialización y uso de sistemas de inteligencia artificial y protección de datos, categorizando los modelos según su nivel de riesgo y afectación a derechos fundamentales.";
    mecanismos = "⚙️ Mecanismos Clave: Registro nacional obligatorio de modelos de alto riesgo, evaluaciones de impacto algorítmico ex-ante, deber de explicabilidad y prohibición de sistemas de manipulación biométrica masiva.";
    fiscalizacion = "⚖️ Fiscalización & Sanciones: Supervisión a cargo de la Agencia de Protección de Datos Personales y Ministerio de Ciencia, con multas disuasorias de hasta 20.000 UTM y suspensión de operaciones.";
  } else if (t.includes("40 horas") || t.includes("jornada") || t.includes("laboral") || t.includes("trabajo")) {
    objeto = "🎯 Objeto & Ámbito: Modifica el Código del Trabajo para reducir la jornada ordinaria laboral semanal y fortalecer la conciliación entre vida personal, familiar y laboral.";
    mecanismos = "⚙️ Mecanismos Clave: Gradualidad de reducción plurianual, bandas horarias diferidas para personas cuidadoras, compensación de horas extraordinarias en días de descanso y pactos 4x3.";
    fiscalizacion = "⚖️ Fiscalización & Sanciones: Fiscalización directa por la Dirección del Trabajo (DT), con multas gravísimas por exceso de jornada y restricción del artículo 22 inciso 2°.";
  } else if (t.includes("ciberseguridad") || t.includes("infraestructura crítica") || t.includes("redes")) {
    objeto = "🎯 Objeto & Ámbito: Establece las bases institucionales para la ciberdefensa y ciberseguridad nacional, obligando a órganos del Estado y operadores de importancia vital.";
    mecanismos = "⚙️ Mecanismos Clave: Obligación estricta de reporte de incidentes significativos en plazo máximo de 3 horas, planes de continuidad operacional y auditorías externas anuales.";
    fiscalizacion = "⚖️ Fiscalización & Sanciones: Fiscalizado por la Agencia Nacional de Ciberseguridad (ANCI), con multas de hasta 40.000 UTM e inhabilitación temporal de certificaciones.";
  } else if (t.includes("pension") || t.includes("previsi") || t.includes("vejez") || t.includes("jubila")) {
    objeto = "🎯 Objeto & Ámbito: Crea un nuevo sistema mixto de pensiones y fortalece el pilar solidario (PGU), resguardando la sostenibilidad financiera y la suficiencia de las tasas de reemplazo.";
    mecanismos = "⚙️ Mecanismos Clave: Cotización adicional del empleador, separación de las funciones de administración y soporte de cuentas, e incentivos a la postergación voluntaria del retiro.";
    fiscalizacion = "⚖️ Fiscalización & Sanciones: Regulación y control estricto por la Superintendencia de Pensiones y la Comisión para el Mercado Financiero (CMF).";
  } else if (t.includes("mascota") || t.includes("animal") || t.includes("cholito") || t.includes("perro") || t.includes("gato")) {
    objeto = "🎯 Objeto & Ámbito: Establece normas sobre tenencia responsable de mascotas y animales de compañía, garantizando el bienestar animal y la salud pública comunal.";
    mecanismos = "⚙️ Mecanismos Clave: Registro Nacional con microchip subcutáneo obligatorio, esterilización masiva municipal, prohibición del abandono y de peleas caninas.";
    fiscalizacion = "⚖️ Fiscalización & Sanciones: Fiscalización por Municipalidades, Seremis de Salud y Carabineros, con penas de presidio menor y multas de hasta 30 UTM por maltrato.";
  }

  return { objeto, mecanismos, fiscalizacion };
}

/**
 * Genera una Ficha Técnica real y específica del proyecto usando IA, en vez
 * del texto genérico por palabra clave de estimarFichaTecnica (que solo
 * reconoce 5 temas y usa el mismo párrafo de relleno para cualquier otro
 * proyecto). Se usa solo al cargar el detalle de UN proyecto puntual -- no en
 * listados, donde llamar a la IA por cada ítem sería demasiado costoso -- y
 * su resultado queda cacheado junto al resto de la ficha del proyecto.
 * Devuelve null si la IA no está disponible o falla, para que el llamador
 * pueda caer de vuelta al estimador heurístico en vez de dejar la ficha vacía.
 */
/** Texto del mensaje o moción (PDF oficial en tramitacion.senado.cl). Caché 7 días. */
export async function textoMensajeMocion(url: string): Promise<string> {
  if (!url || !/getDocto/i.test(url)) return "";
  const limpia = url.replace(/&amp;/g, "&").replace(/^https?:\/\/(www\.)?senado\.cl\/appsenado/i, "https://tramitacion.senado.cl/appsenado");
  if (!/^https:\/\/tramitacion\.senado\.cl\//i.test(limpia)) return "";
  const clave = `texto_mocion_${limpia}`;
  const previo = cache.get<string>(clave);
  if (previo) return previo;
  try {
    const res = await fetch(limpia, { headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) return "";
    const buf = new Uint8Array(await res.arrayBuffer());
    // Solo PDF (los documentos antiguos .doc no se pueden leer aquí).
    if (!(buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46)) return "";
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });
    const texto = String(text || "").replace(/\s+/g, " ").trim();
    if (texto.length > 200) cache.set(clave, texto, 7 * 24 * 60 * 60 * 1000);
    return texto;
  } catch (err) {
    console.warn("No se pudo leer el texto del mensaje/moción:", err);
    return "";
  }
}

/** Ficha ejecutiva (3 viñetas) de un boletín, desde el texto oficial. Caché 7 días si sale bien. */
export async function fichaEjecutivaProyecto(boletinId: string): Promise<{ disponible: boolean; motivo?: string; ficha?: { objeto: string; mecanismos: string; fiscalizacion: string; fuente: "texto" | "titulo" }; textoUrl?: string }> {
  const digits = String(boletinId || "").replace(/\./g, "").match(/\d{3,6}/)?.[0] || "";
  if (!digits) return { disponible: false, motivo: "Boletín no válido." };
  const clave = `ficha_ejecutiva_v2_${digits}`;
  const previa = cache.get<any>(clave);
  if (previa) return previa;
  const p = await fetchProyectoFromSenado(digits);
  if (!p) return { disponible: false, motivo: "No se encontró el proyecto en la ficha oficial del Senado." };
  const texto = await textoMensajeMocion(p.linkCongreso || "");
  const diag: string[] = [];
  const ficha = await generarFichaTecnicaIA(p.titulo, p.resumen, texto, diag);
  if (!ficha) return { disponible: false, motivo: `No se pudo generar la síntesis (texto oficial ${texto ? `leído, ${texto.length} caracteres` : "no leído"}). ${diag.join(" ")}`.trim() };
  const r = { disponible: true, ficha, textoUrl: p.linkCongreso };
  cache.set(clave, r, ficha.fuente === "texto" ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000);
  return r;
}

/**
 * Ficha ejecutiva del proyecto. Con el texto oficial del mensaje o moción, la IA
 * resume lo que el texto efectivamente dispone. Sin texto, solo describe lo que
 * dice el título y declara que no hay información para los otros dos campos.
 */
export async function generarFichaTecnicaIA(
  titulo: string,
  _resumen: string,
  textoProyecto = "",
  diagnostico?: string[]
): Promise<{ objeto: string; mecanismos: string; fiscalizacion: string; fuente: "texto" | "titulo" } | null> {
  const conTexto = textoProyecto.length > 300;
  const prompt = conTexto
    ? `Eres analista de Asesoría Técnica Parlamentaria de la Biblioteca del Congreso Nacional de Chile. Abajo está el título y el TEXTO OFICIAL (mensaje o moción) de un proyecto de ley chileno.

Título: "${titulo}"

TEXTO:
"""
${textoProyecto.slice(0, 18000)}
"""

Responde ÚNICAMENTE con JSON válido:
{"objeto":"...","mecanismos":"...","fiscalizacion":"..."}

- "objeto" (¿Qué cambia?): 2-3 frases concretas sobre lo que dispone el proyecto: qué leyes o artículos modifica o crea y cuál es el cambio principal. Menciona números de ley y artículos si el texto los indica.
- "mecanismos" (¿A quiénes afecta?): 1-2 frases sobre las personas, entidades u organismos obligados, beneficiados o afectados, según el texto.
- "fiscalizacion" (Fiscalización y sanciones): 1-2 frases sobre qué organismo fiscaliza y qué sanciones establece, SOLO si el texto lo dice. Si el texto no lo establece, responde exactamente: "El texto del proyecto no establece un órgano fiscalizador ni sanciones específicas."

Reglas: usa solo el texto entregado; no inventes cifras, instituciones ni efectos. Prosa formal, sin emojis, sin repetir el título.`
    : `Eres analista de la Biblioteca del Congreso Nacional de Chile. Solo dispones del título oficial de un proyecto de ley chileno:

"${titulo}"

Responde ÚNICAMENTE con JSON válido: {"objeto":"..."}
"objeto": 1-2 frases que expliquen en lenguaje claro lo que propone el proyecto según su título. No agregues nada que el título no diga.`;

  // Margen amplio: los modelos de razonamiento gastan parte de los tokens en "pensar".
  const intentos: AIProviderAttempt[] = [];
  const respuesta = await generarContenidoUniversalIA(prompt, conTexto ? 3000 : 1200, intentos);
  if (!respuesta) {
    diagnostico?.push("Ningún proveedor de IA respondió: " + intentos.filter(i => i.configured).map(i => `${i.provider}: ${(i.error || "sin respuesta").slice(0, 90)}`).join(" | "));
    return null;
  }
  try {
    const parsed = safeJsonParse<{ objeto?: string; mecanismos?: string; fiscalizacion?: string }>(respuesta);
    if (!parsed?.objeto) { diagnostico?.push("La IA respondió sin el campo 'objeto': " + respuesta.slice(0, 160)); return null; }
    if (!conTexto) {
      return {
        objeto: parsed.objeto,
        mecanismos: "No fue posible leer el texto oficial del proyecto para identificar a quiénes afecta.",
        fiscalizacion: "No fue posible leer el texto oficial del proyecto para identificar fiscalización o sanciones.",
        fuente: "titulo"
      };
    }
    return {
      objeto: parsed.objeto,
      mecanismos: parsed.mecanismos || "El texto del proyecto no permite identificar con claridad a quiénes afecta.",
      fiscalizacion: parsed.fiscalizacion || "El texto del proyecto no establece un órgano fiscalizador ni sanciones específicas.",
      fuente: "texto"
    };
  } catch {
    diagnostico?.push("La IA no devolvió JSON válido: " + respuesta.slice(0, 160));
    return null;
  }
}

export function estimarOrigenDetalle(
  titulo: string,
  materia: string,
  iniciativa: "Moción" | "Mensaje" | string,
  autores?: string
): Proyecto["origenDetalle"] {
  const t = (titulo + " " + (autores || "")).toLowerCase();
  const isMensaje = iniciativa === "Mensaje" || t.includes("presidente de la rep") || t.includes("ejecutivo") || t.includes("mensaje");

  if (isMensaje) {
    let minFirmantes: string[] = [];
    const mat = (materia + " " + titulo).toLowerCase();
    if (mat.includes("hacienda") || mat.includes("tribut") || mat.includes("pensi") || mat.includes("presupuest")) {
      minFirmantes = ["Ministerio de Hacienda", "Ministerio del Trabajo y Previsión Social"];
    } else if (mat.includes("ciberseguridad") || mat.includes("seguridad") || mat.includes("interior") || mat.includes("delito")) {
      minFirmantes = ["Ministerio del Interior y Seguridad Pública", "Ministerio de Justicia y Derechos Humanos"];
    } else if (mat.includes("salud") || mat.includes("f[aá]rmac") || mat.includes("isapre") || mat.includes("fonasa")) {
      minFirmantes = ["Ministerio de Salud", "Ministerio de Hacienda"];
    } else if (mat.includes("ciencia") || mat.includes("tecnolog") || mat.includes("inteligencia") || mat.includes("futuro")) {
      minFirmantes = ["Ministerio de Ciencia, Tecnología, Conocimiento e Innovación", "Ministerio de Economía"];
    } else if (mat.includes("miner") || mat.includes("energ") || mat.includes("cobre") || mat.includes("litio")) {
      minFirmantes = ["Ministerio de Minería", "Ministerio de Energía", "Ministerio de Hacienda"];
    } else if (mat.includes("educaci") || mat.includes("universidad")) {
      minFirmantes = ["Ministerio de Educación", "Ministerio de Hacienda"];
    } else if (mat.includes("medio ambiente") || mat.includes("agua") || mat.includes("clima")) {
      minFirmantes = ["Ministerio del Medio Ambiente", "Ministerio de Obras Públicas"];
    } else {
      minFirmantes = ["Ministerio Sectorial Competente", "Ministerio Secretaría General de la Presidencia (SEGPRES)"];
    }

    return {
      tipo: "Mensaje Presidencial",
      patrocinadorPrincipal: "S.E. el Presidente de la República",
      ministeriosFirmantes: minFirmantes,
      notaOrigen: "Iniciativa legal de origen en el Poder Ejecutivo, presentada por S.E. el Presidente de la República con el patrocinio y firma de los ministerios sectoriales."
    };
  }

  return {
    tipo: "Moción Parlamentaria",
    patrocinadorPrincipal: autores ? `Moción Parlamentaria: ${autores}` : "Moción Parlamentaria",
    notaOrigen: "Iniciativa de origen parlamentario presentada por Diputadas/os o Senadoras/es de la República en ejercicio de sus atribuciones constitucionales."
  };
}

export async function fetchProyectoFromSenado(boletinId: string): Promise<Proyecto | null> {
  const base = boletinId.split("-")[0];
  const digits = base.replace(/[^0-9]/g, "");
  if (!/^\d{3,6}$/.test(digits)) return null;

  const cacheKey = `senado_proyecto_${digits}`;
  return cache.wrap<Proyecto | null>(cacheKey, 15 * 60 * 1000, async () => {
    try {
      const url = `https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=${digits}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) return null;
      const xml = await response.text();

      if (!xml.includes("<proyecto>")) return null;

      // Los <LINK_*> del XML vienen con entidades HTML sin decodificar (ej.
      // "...&amp;ac=getDocto&amp;iddocto=26409...") -- una URL asi es invalida
      // para fetch(), aunque en un <a href> el navegador la decodifique solo
      // y el problema pase desapercibido. extractTagUrl la decodifica.
      const decodeXmlEntities = (s: string): string =>
        s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

      const extractTag = (source: string, tag: string): string => {
        const match = source.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
        return match ? match[1].trim() : "";
      };

      const extractAll = (source: string, parentTag: string): string[] => {
        const regex = new RegExp(`<${parentTag}>([\\s\\S]*?)</${parentTag}>`, "gi");
        const matches = source.match(regex) || [];
        return matches.map(m => m.replace(new RegExp(`^<${parentTag}>|</${parentTag}>$`, "gi"), "").trim());
      };

      const extractTagUrl = (source: string, tag: string): string => decodeXmlEntities(extractTag(source, tag));

      const descBlock = extractTag(xml, "descripcion");
      if (!descBlock) return null;

      const boletin = extractTag(descBlock, "boletin");
      const titulo = extractTag(descBlock, "titulo");
      // La ficha entrega dd/mm/aaaa; se normaliza a ISO para que fechas y días en trámite se calculen bien.
      const fechaIngreso = parseFechaChilena(extractTag(descBlock, "fecha_ingreso") || "");
      
      const iniciativaRaw = extractTag(descBlock, "iniciativa") || "Moción";
      const iniciativa: "Moción" | "Mensaje" = (iniciativaRaw.toLowerCase().includes("mensaje")) ? "Mensaje" : "Moción";

      const camaraOrigenRaw = extractTag(descBlock, "camara_origen") || "Senado";
      const camaraOrigen: "Diputados" | "Senado" = (camaraOrigenRaw.toLowerCase().includes("diputados") || camaraOrigenRaw.toLowerCase().includes("camara")) ? "Diputados" : "Senado";

      const urgenciaRaw = extractTag(descBlock, "urgencia_actual") || "Sin urgencia";
      let urgencia: "Simple" | "Suma" | "Discusión Inmediata" | "Sin urgencia" = "Sin urgencia";
      const uLower = urgenciaRaw.toLowerCase();
      if (uLower.includes("inmediata")) urgencia = "Discusión Inmediata";
      else if (uLower.includes("suma")) urgencia = "Suma";
      else if (uLower.includes("simple")) urgencia = "Simple";

      const etapa = extractTag(descBlock, "etapa") || "En discusión";
      const subetapa = extractTag(descBlock, "subetapa") || "";
      const estado = extractTag(descBlock, "estado") || "En discusión";
      const linkMocion = urlOficialSenado(extractTagUrl(descBlock, "link_mensaje_mocion")) || `https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=${digits}`;

      const autoresBlock = extractTag(xml, "autores");
      const autoresList = extractAll(autoresBlock, "autor").map(a => extractTag(a, "PARLAMENTARIO")).filter(Boolean);
      const autores = autoresList.join(", ");
      const patrocinantes = autoresList.length;

      // Materia según el sufijo del boletín: en Chile el número tras el guión identifica
      // la comisión a la que se dio cuenta del proyecto al ingresar (convención oficial).
      // Antes se adivinaba por palabras del título y por defecto quedaba "Constitución".
      const sufijo = (boletin.split("-")[1] || "").padStart(2, "0");
      const mapeoSufijo = MATERIA_COMISION_MAP[sufijo];
      const materia = mapeoSufijo ? mapeoSufijo.materia : "Sin clasificar";

      let comisionActual = mapeoSufijo ? mapeoSufijo.comision : "No informada";
      let siguienteSesion: string | undefined = undefined;

      if (subetapa) {
        const limpia = limpiarNombreComision(subetapa);
        if (limpia) comisionActual = limpia;
      }

      const tramitacionBlock = extractTag(xml, "tramitacion");
      const timeline: ActivityItem[] = extractAll(tramitacionBlock, "tramite").map((t, idx) => {
        const desc = extractTag(t, "DESCRIPCIONTRAMITE");
        const dLower = desc.toLowerCase();
        let tipo: "ingreso" | "sesion" | "indicaciones" | "informe" | "acuerdo" | "alerta" = "sesion";
        if (dLower.includes("ingreso")) tipo = "ingreso";
        else if (dLower.includes("indicacion")) tipo = "indicaciones";
        else if (dLower.includes("informe")) tipo = "informe";
        else if (dLower.includes("acuerdo")) tipo = "acuerdo";

        return {
          id: `t-${digits}-${idx}`,
          fecha: extractTag(t, "FECHA"),
          titulo: extractTag(t, "ETAPDESCRIPCION") || "Trámite Legislativo",
          descripcion: desc,
          tipo,
          boletinId: formatBoletin(boletin)
        };
      });

      const documentos: any[] = [];
      if (linkMocion) {
        documentos.push({
          id: `doc-${digits}-mocion`,
          titulo: "Texto Oficial Mensaje / Moción de Ingreso",
          tipo: "Moción",
          fecha: fechaIngreso,
          url: linkMocion
        });
      }

      // Nombres de tag reales del XML (verificados contra la respuesta real del
      // servicio): <LINK_INFORME>, <TRAMITE>, <FECHAINFORME> para informes;
      // <LINK_OFICIO>, <TIPO>, <FECHA> para oficios. Los nombres usados antes
      // (LINK, TIPODOC, FECHADEVOLUCION) no existen en la respuesta real, asi
      // que "url" siempre quedaba vacio y estos documentos eran inutilizables.
      const informesBlock = extractTag(xml, "informes");
      if (informesBlock) {
        extractAll(informesBlock, "informe").forEach((inf, idx) => {
          const link = urlOficialSenado(extractTagUrl(inf, "LINK_INFORME"));
          const tramite = extractTag(inf, "TRAMITE") || "Informe";
          const etapa = extractTag(inf, "ETAPA") || "";
          const fecha = parseFechaChilena(extractTag(inf, "FECHAINFORME") || "") || "";
          documentos.push({
            id: `doc-${digits}-inf-${idx}`,
            titulo: `${tramite}${etapa ? ` (${etapa})` : ""}`,
            tipo: "Informe",
            fecha,
            url: link
          });
        });
      }

      const oficiosBlock = extractTag(xml, "oficios");
      if (oficiosBlock) {
        const oficiosList = extractAll(oficiosBlock, "oficio");
        oficiosList.forEach((of, idx) => {
          const link = urlOficialSenado(extractTagUrl(of, "LINK_OFICIO"));
          const tipoDoc = extractTag(of, "TIPO") || "Oficio";
          const fecha = parseFechaChilena(extractTag(of, "FECHA") || "") || "";
          const descripcion = extractTag(of, "DESCRIPCION");
          documentos.push({
            id: `doc-${digits}-of-${idx}`,
            titulo: descripcion ? `${tipoDoc}: ${descripcion.slice(0, 80)}` : `${tipoDoc} de Trámite`,
            tipo: "Oficio",
            fecha,
            url: link
          });
        });
      }

      const diasTramitacion = computeDiasTramitacion(fechaIngreso);
      const diasTxt = diasTramitacion !== undefined ? ` Lleva ${diasTramitacion} día${diasTramitacion === 1 ? "" : "s"} en tramitación.` : "";
      const MESES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
      const fIso = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaIngreso);
      const fechaTxt = fIso ? `${parseInt(fIso[3], 10)} de ${MESES_ES[parseInt(fIso[2], 10) - 1]} de ${fIso[1]}` : fechaIngreso;
      const camaraTxt = camaraOrigen === "Diputados" ? "la Cámara de Diputadas y Diputados" : "el Senado";
      // "Apellido Apellido, Nombre" → "Nombre Apellido Apellido"
      const autoresTxt = autoresList.map(a => { const m = a.match(/^([^,]+),\s*(.+)$/); return m ? `${m[2]} ${m[1]}` : a; }).join(", ");
      const resumen = [
        `${iniciativa === "Mensaje" ? "Mensaje presidencial" : "Moción parlamentaria"} ingresada el ${fechaTxt} en ${camaraTxt}.`,
        materia !== "Sin clasificar" ? `Materia: ${materia}.` : "",
        `Etapa actual: ${etapa}${subetapa ? ` (${subetapa.trim()})` : ""}; estado: ${estado.trim()}.`,
        iniciativa === "Mensaje" ? "Autor: Presidente de la República." : (autoresTxt ? `Autores: ${autoresTxt}.` : ""),
        diasTxt.trim()
      ].filter(Boolean).join(" ");

      const votaciones: VotacionItem[] = [];
      const votacionesBlock = extractTag(xml, "votaciones");
      if (votacionesBlock) {
        const vots = extractAll(votacionesBlock, "votacion");
        vots.forEach((v, idx) => {
          const fecha = extractTag(v, "FECHA") || fechaIngreso;
          const materiaVot = extractTag(v, "MATERIA") || "Votación de articulado";
          const si = parseInt(extractTag(v, "SI")) || 0;
          const no = parseInt(extractTag(v, "NO")) || 0;
          const abst = parseInt(extractTag(v, "ABSTENCION")) || 0;
          const resultado = extractTag(v, "ETAPADESCRIPCION") || "Resultado no informado";
          votaciones.push({
            id: `v-${digits}-${idx}`,
            fecha,
            materia: materiaVot,
            si,
            no,
            abstencios: abst,
            resultado
          });
        });
      }

      const p: Proyecto = {
        id: formatBoletin(boletin),
        titulo,
        resumen,
        fechaIngreso,
        iniciativa,
        estado: estado.trim(),
        urgencia,
        camaraOrigen,
        etapa,
        subetapa: subetapa.trim(),
        materia,
        autores,
        linkCongreso: linkMocion,
        diasTramitacion,
        timeline,
        documentos,
        votaciones,
        patrocinantes,
        comisionActual,
        comisionesHistoricas: [comisionActual],
        pasosComision: computePasosComision(timeline),
        siguienteSesion,
        // Quórum: la ficha no lo informa. Solo se indica cuando el título lo hace
        // inequívoco (reforma constitucional); en otro caso queda sin informar.
        quorum: /reforma constitucional|modifica la constituci[oó]n|carta fundamental/i.test(titulo)
          ? estimarQuorum(titulo, materia)
          : undefined,
        // Ficha técnica: solo la generada por IA (más abajo); sin texto genérico de relleno.
        fichaTecnica: undefined,
        // Origen: solo lo que dice la ficha (mensaje = Presidente de la República;
        // moción = sus autores). Sin ministerios supuestos.
        origenDetalle: {
          tipo: iniciativa === "Mensaje" ? "Mensaje Presidencial" : "Moción Parlamentaria",
          patrocinadorPrincipal: iniciativa === "Mensaje"
            ? "Presidente de la República"
            : (autoresList[0] || "No informado en la ficha oficial")
        }
      };

      return p;
    } catch (error) {
      console.error(`Error fetching/parsing project from Senate XML API:`, error);
      return null;
    }
  });
}

export async function fetchProyectosListadoFromSenado(): Promise<ProyectoListado[]> {
  return cache.wrap<ProyectoListado[]>("senado_proyectos_listado", 10 * 60 * 1000, async () => {
    try {
      const url = "https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php";
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) return [];
      const html = await response.text();

      const decodeEntities = (s: string) =>
        s
          .replace(/&nbsp;/gi, " ")
          .replace(/&deg;/gi, "°")
          .replace(/&ordm;/gi, "°")
          .replace(/&amp;/gi, "&")
          .replace(/&aacute;/gi, "á")
          .replace(/&eacute;/gi, "é")
          .replace(/&iacute;/gi, "í")
          .replace(/&oacute;/gi, "ó")
          .replace(/&uacute;/gi, "ú")
          .replace(/&ntilde;/gi, "ñ")
          .replace(/&Aacute;/g, "Á")
          .replace(/&Eacute;/g, "É")
          .replace(/&Iacute;/g, "Í")
          .replace(/&Oacute;/g, "Ó")
          .replace(/&Uacute;/g, "Ú")
          .replace(/&Ntilde;/g, "Ñ")
          .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
          .replace(/&quot;/gi, '"')
          .replace(/&#39;|&apos;/gi, "'");

      const stripTags = (s: string) =>
        decodeEntities(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

      const results: ProyectoListado[] = [];
      const seen = new Set<string>();
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch: RegExpExecArray | null;

      while ((rowMatch = rowRegex.exec(html)) !== null) {
        const rowHtml = rowMatch[1];
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells: string[] = [];
        let cellMatch: RegExpExecArray | null;
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
          cells.push(stripTags(cellMatch[1]));
        }
        if (cells.length < 4) continue;

        const boletinIdx = cells.findIndex(c => /^\d{4,6}-\d{1,2}$/.test(c));
        if (boletinIdx === -1) continue;

        const boletinRaw = cells[boletinIdx];
        const id = formatBoletin(boletinRaw);
        if (seen.has(id)) continue;
        seen.add(id);

        results.push({
          id,
          titulo: decodeEntities(cells[boletinIdx + 1] || "Proyecto de ley"),
          ley: cells[boletinIdx + 2] || "",
          estado: cells[boletinIdx + 3] || "En tramitación",
          fecha: parseFechaChilena(cells[boletinIdx + 4] || "")
        });
      }

      return results;
    } catch (error) {
      console.error("Error fetching live bill listing from Senate:", error);
      return [];
    }
  });
}

export function listadoToProyecto(item: ProyectoListado): Proyecto {
  // Materia por sufijo del boletín (convención oficial), no por palabras del título.
  const sufijo = ((item.id || "").split("-")[1] || "").padStart(2, "0");
  const mapeo = MATERIA_COMISION_MAP[sufijo];
  const materia = mapeo ? mapeo.materia : "Sin clasificar";
  const estadoNorm = item.estado.toLowerCase();
  const estado = estadoNorm.includes("public")
    ? "Publicado como Ley"
    : estadoNorm.includes("tramit")
    ? "En discusión"
    : item.estado;
  const dias = computeDiasTramitacion(parseFechaChilena(item.fecha || ""));
  const diasTxt = dias !== undefined ? ` Lleva ${dias} día${dias === 1 ? "" : "s"} en tramitación.` : "";

  return {
    id: item.id,
    titulo: item.titulo,
    resumen: item.ley
      ? `Proyecto de ley (Boletín ${item.id}). ${item.ley}. Estado actual: ${item.estado}.${diasTxt}`
      : `Proyecto de ley (Boletín ${item.id}) actualmente en tramitación en el Congreso Nacional. Materia: ${materia}.${diasTxt}`,
    fechaIngreso: parseFechaChilena(item.fecha || ""),
    estado,
    camaraOrigen: "No informado", // el listado general no informa la cámara de origen
    etapa: item.estado,
    materia,
    urgencia: "Sin urgencia",
    patrocinantes: 0,
    iniciativa: "Moción",
    comisionActual: mapeo ? mapeo.comision : "No informada",
    diasTramitacion: dias,
    timeline: [],
    documentos: [],
    votaciones: [],
    linkCongreso: getSenadoApiLink(item.id),
    // Sin quórum, ficha técnica ni origen supuestos: el listado no los informa.
    // La ficha completa del boletín (fetchProyectoFromSenado) trae los datos reales.
  };
}

export async function fetchSenadoComisionesIntegrantesLive(): Promise<SenadoComisionParsed[]> {
  return cache.wrap<SenadoComisionParsed[]>("senado_comisiones_live", 30 * 60 * 1000, async () => {
    try {
      const res = await fetch("https://tramitacion.senado.cl/wspublico/comisiones.php", {
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return [];
      const xml = await res.text();

      const comisiones: SenadoComisionParsed[] = [];
      const matches = xml.matchAll(/<comision>([\s\S]*?)<\/comision>/g);

      for (const m of matches) {
        const block = m[1];
        const rawNombre = block.match(/<nombre>([^<]+)<\/nombre>/)?.[1]?.trim() || "";
        const cleanNombre = rawNombre.replace(/^de\s+/i, "Comisión de ");

        const integrantes: IntegranteLive[] = [];
        const intMatches = block.matchAll(/<integrante>([\s\S]*?)<\/integrante>/g);

        for (const im of intMatches) {
          const iblock = im[1];
          const apPaterno = iblock.match(/<APELLIDO_PATERNO>([^<]+)<\/APELLIDO_PATERNO>/)?.[1]?.trim() || "";
          const apMaterno = iblock.match(/<APELLIDO_MATERNO>([^<]+)<\/APELLIDO_MATERNO>/)?.[1]?.trim() || "";
          const nom = iblock.match(/<NOMBRE>([^<]+)<\/NOMBRE>/)?.[1]?.trim() || "";
          const funcion = iblock.match(/<FUNCION>([^<]+)<\/FUNCION>/)?.[1]?.trim() || "";

          const fullName = [nom, apPaterno, apMaterno].filter(Boolean).join(" ");
          const rol = funcion.toLowerCase().includes("presidente") ? "Presidente de Comisión" : "Miembro Titular";

          let partido = "Senado";
          if (fullName.includes("Vodanovic") || fullName.includes("De Urresti") || fullName.includes("Castro González") || fullName.includes("Espinoza Sandoval") || fullName.includes("Allende Bussi") || fullName.includes("Saavedra Chandía") || fullName.includes("Insulza")) partido = "PS";
          else if (fullName.includes("Coloma") || fullName.includes("Ebensperger") || fullName.includes("Macaya") || fullName.includes("Moreira") || fullName.includes("Gahona") || fullName.includes("Durana") || fullName.includes("Sanhueza") || fullName.includes("Sandoval") || fullName.includes("Van Rysselberghe")) partido = "UDI";
          else if (fullName.includes("Galilea") || fullName.includes("Ossandón") || fullName.includes("Chahuán") || fullName.includes("García Ruminot") || fullName.includes("Núñez Urrutia") || fullName.includes("Kuschel") || fullName.includes("Gatica") || fullName.includes("Prohens") || fullName.includes("Castro Prieto")) partido = "RN";
          else if (fullName.includes("Araya Guerrero") || fullName.includes("Quintana") || fullName.includes("Carvajal") || fullName.includes("Lagos Weber") || fullName.includes("Órdenes") || fullName.includes("Ordenes") || fullName.includes("Soria")) partido = "PPD";
          else if (fullName.includes("Núñez Arancibia") || fullName.includes("Pascual Grau")) partido = "PC";
          else if (fullName.includes("Walker") || fullName.includes("Rincón")) partido = "Demócratas";
          else if (fullName.includes("Cruz-Coke") || fullName.includes("Kast") || fullName.includes("Keitel")) partido = "Evópoli";
          else if (fullName.includes("Provoste") || fullName.includes("Flores García") || fullName.includes("Huenchumilla")) partido = "DC";
          else if (fullName.includes("Campillai") || fullName.includes("Bianchi Retamales") || fullName.includes("Sepúlveda Órdenes") || fullName.includes("Sepúlveda Orbenes") || fullName.includes("Kusanovic") || fullName.includes("Pugh")) partido = "IND";
          else if (fullName.includes("Edwards") || fullName.includes("Aravena")) partido = "PREP";
          else if (fullName.includes("Latorre")) partido = "FA";
          else if (fullName.includes("Velásquez")) partido = "FRVS";

          integrantes.push({
            nombre: fullName,
            partido,
            rol
          });
        }

        if (rawNombre && integrantes.length > 0) {
          comisiones.push({
            titulo: cleanNombre,
            integrantes
          });
        }
      }

      return comisiones;
    } catch (error) {
      console.error("Error fetching live Senate committee members from wspublico/comisiones.php:", error);
      return [];
    }
  });
}

function cleanHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&deg;/g, '°')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&aacute;/g, 'á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&eacute;/g, 'é')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&iacute;/g, 'í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&oacute;/g, 'ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&uacute;/g, 'ú')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Fetches real-time projects in tramitación for a Senate committee from tramitacion.senado.cl
 */
export async function fetchSenadoComisionProyectosLive(
  senadoId: string,
  comisionNombre = "Senado",
  forceRefresh = false
): Promise<Proyecto[]> {
  // El listado oficial (ac=boletin_x_fecha) sirve para comisiones del Senado y de la
  // Cámara, pero no informa la cámara de origen del proyecto: no se asume.
  const cacheKey = `senado_comision_proyectos_${senadoId}`;
  if (forceRefresh) {
    cache.delete(cacheKey);
  }

  return cache.wrap(cacheKey, 15 * 60 * 1000, async () => {
    try {
      const url = `https://tramitacion.senado.cl/appsenado/index.php?mo=tramitacion&ac=boletin_x_fecha&comiid=${senadoId}&titulo=${encodeURIComponent("Senado: Com. " + comisionNombre)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest"
        },
        signal: AbortSignal.timeout(7000)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const html = await res.text();
      const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      const comProjects: Proyecto[] = [];
      const seenBoletines = new Set<string>();

      for (const r of trs) {
        const tds = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(d => cleanHtmlEntities(d[1]));
        if (tds.length >= 4) {
          const boletin = tds[1];
          if (boletin && boletin.includes("-") && !seenBoletines.has(boletin)) {
            seenBoletines.add(boletin);
            // La ficha entrega dd/mm/aaaa; se normaliza a ISO para ordenar correctamente.
            const mFecha = (tds[0] || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            const fecha = mFecha ? `${mFecha[3]}-${mFecha[2].padStart(2, "0")}-${mFecha[1].padStart(2, "0")}` : (tds[0] || "");
            const titulo = tds[2];
            const estado = tds[3] || "No informado";
            const stage = "Ver ficha oficial";

            comProjects.push({
              id: boletin,
              titulo: titulo,
              resumen: `Proyecto de ley radicado en la ${comisionNombre} según el listado oficial de tramitación.`,
              estado: estado,
              etapa: stage,
              fechaIngreso: fecha,
              materia: comisionNombre,
              iniciativa: "Moción", // el listado no distingue mensaje/moción; ver ficha oficial
              patrocinantes: 0,
              urgencia: "Sin urgencia",
              camaraOrigen: "No informado",
              comisionActual: comisionNombre,
              linkCongreso: `https://tramitacion.senado.cl/appsenado/index.php?mo=tramitacion&ac=boletin_x_fecha&comiid=${senadoId}&titulo=${encodeURIComponent("Senado: Com. " + comisionNombre)}`,
              timeline: [
                {
                  id: `act-${boletin}-1`,
                  fecha: fecha,
                  titulo: "Radicado en Comisión",
                  descripcion: `En tramitación legislativa en ${comisionNombre}.`,
                  tipo: "sesion"
                }
              ],
              documentos: [
                {
                  id: `doc-${boletin}-1`,
                  titulo: `Ficha de Tramitación Oficial (Boletín ${boletin})`,
                  tipo: "Ficha Oficial",
                  fecha: fecha,
                  url: `https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=${boletin.split("-")[0]}`
                }
              ],
              votaciones: []
            });
          }
        }
      }

      // Sort newest first
      comProjects.sort((a, b) => {
        const da = new Date(a.fechaIngreso).getTime() || 0;
        const db = new Date(b.fechaIngreso).getTime() || 0;
        return db - da;
      });

      return comProjects;
    } catch (err: any) {
      console.warn(`[SenadoService] Could not fetch live projects for comision ${senadoId}:`, err.message);
      return [];
    }
  });
}

/**
 * Fetches real-time committee citations for the Senate from web-back.senado.cl API
 */
export const estadoCitacionesSenado: { fuente: "vivo" | "sin datos"; detalle: string; actualizado: string } = {
  fuente: "sin datos",
  detalle: "Sin consultar todavía",
  actualizado: ""
};

export async function fetchSenadoCitacionesLive(forceRefresh = false): Promise<{
  citaciones: any[];
  porComision: Record<string, any[]>;
  porDia: any[];
}> {
  const cacheKey = "senado_citaciones_live";
  if (forceRefresh) {
    cache.delete(cacheKey);
  }

  return cache.wrap(cacheKey, 5 * 60 * 1000, async () => {
    try {
      const url = "https://web-back.senado.cl/api/commissions_citations?limit=100";
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          // Mismos encabezados que envía el sitio oficial senado.cl al consultar esta API.
          "Origin": "https://www.senado.cl",
          "Referer": "https://www.senado.cl/"
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const raw = await res.json();
      const senadoCitacionesFlat: any[] = [];
      const senadoCitacionesByComId: Record<string, any[]> = {};
      const senadoCitacionesByDay: any[] = [];

      for (const day of raw.data || []) {
        const dayCitaciones: any[] = [];
        
        for (const c of day.CITACIONES || []) {
          const boletinesPoints = c.PUNTOS_PROPUESTOS?.map((p: any) => p.NUMERO_BOLETIN).filter(Boolean) || [];
          
          // Also extract bulletins mentioned in MATERIA text (e.g. Bol.N° 17088-12, 16.553-12, 18525-06)
          const materiaText = c.MATERIA || "";
          const materiaMatches = [...materiaText.matchAll(/(?:bol(?:et[ií]n)?\.?\s*n[°º\s]*|bolet[ií]n\s+)?([0-9]{1,2}\.?[0-9]{3}-[0-9]{2})/gi)]
            .map(m => m[1].replace(/\./g, "").trim())
            .filter(b => /^\d{3,6}-\d{2}$/.test(b));

          const allBoletines = [...new Set([...boletinesPoints, ...materiaMatches])];

          const comId = String(c.ID_COMISION);
          const comNombre = c.COMINOMBRE?.startsWith("de ") ? `Comisión ${c.COMINOMBRE}` : (c.COMINOMBRE?.startsWith("Comisión") ? c.COMINOMBRE : `Comisión de ${c.COMINOMBRE}`);

          const citItem = {
            id: `senado-cit-${c.ID_CITACION}`,
            idCitacion: c.ID_CITACION,
            idComision: c.ID_COMISION,
            comision: comNombre,
            fecha: day.FECHA,
            hora: c.HORARIO || "Horario reglamentario",
            lugar: c.LUGAR || "Valparaíso / Santiago",
            materia: materiaText.trim() || "Sesión de Comisión",
            tabla: materiaText ? materiaText.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
            boletines: allBoletines,
            boletin: allBoletines[0] || undefined,
            tipo: "Sesión de Comisión",
            canalTransmision: c.TV === 1 ? "TV Senado / Señal Online" : "Sin transmisión",
            citacionNumero: `Citación N° ${c.ID_CITACION}`,
            chamber: "SR",
            linkOficial: "https://www.senado.cl/actividad-legislativa/comisiones/citaciones"
          };

          senadoCitacionesFlat.push(citItem);
          dayCitaciones.push(citItem);

          if (!senadoCitacionesByComId[comId]) {
            senadoCitacionesByComId[comId] = [];
          }
          senadoCitacionesByComId[comId].push(citItem);
        }

        if (dayCitaciones.length > 0) {
          senadoCitacionesByDay.push({
            fecha: day.FECHA,
            citaciones: dayCitaciones
          });
        }
      }

      estadoCitacionesSenado.fuente = "vivo";
      estadoCitacionesSenado.detalle = `Leídas de web-back.senado.cl (${senadoCitacionesFlat.length} citaciones)`;
      estadoCitacionesSenado.actualizado = new Date().toISOString();
      return {
        citaciones: senadoCitacionesFlat,
        porComision: senadoCitacionesByComId,
        porDia: senadoCitacionesByDay
      };
    } catch (err: any) {
      estadoCitacionesSenado.fuente = "sin datos";
      estadoCitacionesSenado.detalle = `No se pudo consultar web-back.senado.cl: ${err?.message || err}`;
      estadoCitacionesSenado.actualizado = new Date().toISOString();
      console.warn("[SenadoService] Could not fetch live Senate citaciones:", err.message);
      return { citaciones: [], porComision: {}, porDia: [] };
    }
  });
}

/**
 * Descarga y extrae el texto plano de un informe de comisión real (los links
 * <LINK_INFORME> de la ficha de tramitación resuelven a documentos .docx de
 * Word, no PDF). Usa mammoth para leer el .docx sin depender de binarios
 * nativos, para que funcione dentro de una función serverless.
 */
export async function fetchTextoInformeDocx(url: string): Promise<string | null> {
  url = urlOficialSenado(url);
  if (!url) return null;
  const cacheKey = `documento_texto_v2_${url}`;
  const previo = cache.get<string>(cacheKey);
  if (previo) return previo;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    let texto = "";
    if (buffer.slice(0, 4).toString("latin1") === "%PDF") {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      texto = String((await extractText(pdf, { mergePages: true })).text || "");
    } else if (buffer.slice(0, 2).toString("latin1") === "PK") {
      const mammoth = await import("mammoth");
      texto = (await mammoth.extractRawText({ buffer })).value || "";
    } else if (buffer.slice(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0]))) {
      // Word antiguo (.doc, formato OLE): muchos informes del Senado vienen así.
      const WordExtractor = (await import("word-extractor")).default as any;
      const doc = await new WordExtractor().extract(buffer);
      texto = String(doc.getBody() || "");
    } else if (/text|html/i.test(res.headers.get("content-type") || "")) {
      texto = buffer.toString("utf-8").replace(/<[^>]*>/g, " ");
    }
    texto = texto.replace(/\s+/g, " ").trim();
    if (texto.length <= 200) return null;
    cache.set(cacheKey, texto, 24 * 60 * 60 * 1000);
    return texto;
  } catch (err) {
    console.warn(`No se pudo leer el documento oficial ${url}:`, err);
    return null;
  }
}



// ---------------------------------------------------------------------------
// Quórum del proyecto según los documentos oficiales del expediente.
// Los informes de comisión (y a veces el mensaje/moción) tienen una sección que
// califica las normas: "normas de carácter orgánico constitucional", "de quórum
// calificado" o "no contiene normas de quórum especial". Reglas de quórum
// (Constitución, según material de la Cámara/BCN):
//  - Reforma constitucional e interpretativa de la Constitución: 4/7 en ejercicio (89/155, 29/50).
//  - Orgánica constitucional y quórum calificado: mayoría absoluta en ejercicio (78/155, 26/50).
//  - Ley común: mayoría simple de los presentes.
// ---------------------------------------------------------------------------
export type TipoQuorum = "reforma" | "interpretativa" | "loc" | "qc" | "comun";

export const REGLAS_QUORUM: Record<TipoQuorum, { tipo: string; regla: string; diputados: string; senadores: string; orden: number }> = {
  reforma: { tipo: "Reforma Constitucional", regla: "4/7 de las diputadas/os y senadoras/es en ejercicio de cada cámara.", diputados: "89 de 155 en ejercicio", senadores: "29 de 50 en ejercicio", orden: 5 },
  interpretativa: { tipo: "Ley Interpretativa de la Constitución", regla: "4/7 de las diputadas/os y senadoras/es en ejercicio de cada cámara.", diputados: "89 de 155 en ejercicio", senadores: "29 de 50 en ejercicio", orden: 4 },
  loc: { tipo: "Ley Orgánica Constitucional", regla: "Mayoría absoluta de las diputadas/os y senadoras/es en ejercicio de cada cámara. Requiere control preventivo del Tribunal Constitucional.", diputados: "78 de 155 en ejercicio", senadores: "26 de 50 en ejercicio", orden: 3 },
  qc: { tipo: "Ley de Quórum Calificado", regla: "Mayoría absoluta de las diputadas/os y senadoras/es en ejercicio de cada cámara.", diputados: "78 de 155 en ejercicio", senadores: "26 de 50 en ejercicio", orden: 2 },
  comun: { tipo: "Ley Común (Simple)", regla: "Mayoría simple de las diputadas/os y senadoras/es presentes en la Sala de cada cámara.", diputados: "Mayoría de los presentes", senadores: "Mayoría de los presentes", orden: 1 }
};

export interface QuorumProyecto {
  disponible: boolean;
  motivo?: string;
  clave?: TipoQuorum;
  tipo?: string;
  regla?: string;
  votosDiputados?: string;
  votosSenadores?: string;
  normasEspeciales?: { norma: string; caracter: string }[];
  explicacion?: string;
  cita?: string;
  fuente?: { titulo: string; url: string };
}

const RE_QUORUM = /(normas?\s+de\s+qu[oó]rum|qu[oó]rum\s+(?:especial|calificado)|car[aá]cter\s+(?:de\s+(?:ley\s+)?)?org[aá]nic[oa]\s+constitucional|org[aá]nic[oa]s?\s+constitucional(?:es)?|ley\s+interpretativa)/gi;

function extractosQuorum(texto: string): string {
  const out: string[] = [];
  let ultimo = -1e9;
  for (const m of texto.matchAll(RE_QUORUM)) {
    const i = m.index || 0;
    if (i - ultimo < 1500) continue;
    ultimo = i;
    out.push(texto.slice(Math.max(0, i - 400), i + 1400));
    if (out.length >= 4) break;
  }
  return out.join("\n[...]\n");
}

function clasificarPorFrases(ex: string): TipoQuorum | null {
  const t = ex.toLowerCase();
  if (/ley\s+interpretativa/.test(t)) return "interpretativa";
  if (/no\s+(?:contiene|hay|existen?|tiene)[^.]{0,80}(?:qu[oó]rum|org[aá]nic)/.test(t) && !/tienen?\s+(?:el\s+)?car[aá]cter\s+(?:de\s+)?(?:ley\s+)?org[aá]nic/.test(t)) return "comun";
  if (/car[aá]cter\s+(?:de\s+(?:ley\s+)?)?org[aá]nic[oa]\s+constitucional/.test(t)) return "loc";
  if (/qu[oó]rum\s+calificado/.test(t)) return "qc";
  return null;
}

export async function determinarQuorumProyecto(boletinId: string): Promise<QuorumProyecto> {
  const digits = String(boletinId || "").replace(/\./g, "").match(/\d{3,6}/)?.[0] || "";
  if (!digits) return { disponible: false, motivo: "Boletín no válido." };
  const clave = `quorum_proyecto_v1_${digits}`;
  const previo = cache.get<QuorumProyecto>(clave);
  if (previo) return previo;

  const p = await fetchProyectoFromSenado(digits);
  if (!p) return { disponible: false, motivo: "No se encontró el proyecto en la ficha oficial del Senado." };

  const armar = (k: TipoQuorum, extra: Partial<QuorumProyecto>): QuorumProyecto => ({
    disponible: true, clave: k, tipo: REGLAS_QUORUM[k].tipo, regla: REGLAS_QUORUM[k].regla,
    votosDiputados: REGLAS_QUORUM[k].diputados, votosSenadores: REGLAS_QUORUM[k].senadores, ...extra
  });

  // Reforma constitucional: lo dice el propio título.
  if (/reforma constitucional|modifica la constituci[oó]n|carta fundamental/i.test(p.titulo)) {
    const r = armar("reforma", { explicacion: "El título oficial indica que es un proyecto de reforma constitucional.", fuente: { titulo: "Título oficial del proyecto", url: p.linkCongreso || "" } });
    cache.set(clave, r, 24 * 60 * 60 * 1000);
    return r;
  }

  // Documentos a revisar: informes de comisión (más recientes primero) y luego el mensaje/moción.
  const informes = (p.documentos || []).filter(d => d.tipo === "Informe" && d.url).sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")).slice(0, 4);
  const fuentes: { titulo: string; url: string }[] = [
    ...informes.map(d => ({ titulo: d.titulo, url: d.url! })),
    ...(p.linkCongreso ? [{ titulo: "Mensaje / Moción de ingreso", url: p.linkCongreso }] : [])
  ];

  for (const f of fuentes) {
    const texto = f.titulo.startsWith("Mensaje") ? await textoMensajeMocion(f.url) : await fetchTextoInformeDocx(f.url);
    if (!texto) continue;
    const ex = extractosQuorum(texto);
    if (!ex) continue;

    const prompt = `Eres abogado de la Biblioteca del Congreso Nacional de Chile. Abajo hay extractos de "${f.titulo}" del proyecto "${p.titulo}" (Boletín ${p.id}) donde se califican las normas según su quórum.

Tipos posibles:
- "interpretativa": ley interpretativa de la Constitución (4/7 en ejercicio).
- "loc": contiene normas de carácter orgánico constitucional (mayoría absoluta en ejercicio, control preventivo del Tribunal Constitucional).
- "qc": contiene normas de quórum calificado (mayoría absoluta en ejercicio).
- "comun": no contiene normas de quórum especial (mayoría simple de presentes).
Si hay normas de distinto tipo, "tipo" es el más exigente (interpretativa > loc > qc > comun).

EXTRACTOS:
"""
${ex.slice(0, 9000)}
"""

Responde ÚNICAMENTE con JSON:
{"tipo":"loc|qc|interpretativa|comun","normasEspeciales":[{"norma":"artículo o numeral","caracter":"orgánico constitucional | quórum calificado"}],"cita":"frase textual breve del extracto que lo respalda","explicacion":"1-2 frases"}
Usa solo lo que dicen los extractos. Si los extractos no califican las normas de este proyecto, responde {"tipo":""}.`;

    let k: TipoQuorum | null = null;
    let extra: Partial<QuorumProyecto> = {};
    try {
      const resp = await generarContenidoUniversalIA(prompt, 2500);
      const j: any = resp ? safeJsonParse<any>(resp) : null;
      if (j && ["loc", "qc", "interpretativa", "comun"].includes(j.tipo)) {
        k = j.tipo;
        extra = {
          normasEspeciales: Array.isArray(j.normasEspeciales) ? j.normasEspeciales.slice(0, 12).map((n: any) => ({ norma: String(n.norma || ""), caracter: String(n.caracter || "") })) : [],
          cita: j.cita ? String(j.cita).slice(0, 400) : undefined,
          explicacion: j.explicacion ? String(j.explicacion) : undefined
        };
      }
    } catch { /* se usa la clasificación por frases */ }
    if (!k) {
      k = clasificarPorFrases(ex);
      if (k) extra = { explicacion: "Clasificación según las frases del documento oficial (sin IA disponible)." };
    }
    if (!k) continue;
    const r = armar(k, { ...extra, fuente: f });
    cache.set(clave, r, 24 * 60 * 60 * 1000);
    return r;
  }

  return {
    disponible: false,
    motivo: fuentes.length
      ? "Los documentos oficiales disponibles todavía no califican el quórum de las normas del proyecto (suele aparecer en el primer informe de comisión)."
      : "El expediente aún no tiene documentos donde se califique el quórum."
  };
}

// ---------------------------------------------------------------------------
// Resumen del paso del proyecto por una comisión, desde sus informes oficiales:
// fechas, sesiones, expositores (nombre, cargo, qué planteó), votaciones y cambios.
// ---------------------------------------------------------------------------
export interface ResumenComision {
  disponible: boolean;
  motivo?: string;
  comision?: string;
  informes?: { titulo: string; url: string; fecha: string }[];
  periodo?: string;
  sesiones?: string;
  expositores?: { nombre: string; cargo: string; planteo: string }[];
  votaciones?: string[];
  cambios?: string[];
  resumen?: string;
  generado?: string;
}

function ventanas(texto: string, marcadores: RegExp, ancho: number, max: number): string {
  const out: string[] = [];
  let ultimo = -1e9;
  for (const m of texto.matchAll(marcadores)) {
    const i = m.index || 0;
    if (i - ultimo < ancho) continue;
    ultimo = i;
    out.push(texto.slice(Math.max(0, i - 200), i + ancho));
    if (out.length >= max) break;
  }
  return out.join("\n[...]\n");
}

export async function resumenPasoComision(boletinId: string, comision: string): Promise<ResumenComision> {
  const digits = String(boletinId || "").replace(/\./g, "").match(/\d{3,6}/)?.[0] || "";
  if (!digits || !comision) return { disponible: false, motivo: "Faltan el boletín o la comisión." };
  const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const clave = `resumen_comision_v1_${digits}_${norm(comision)}`;
  const previo = cache.get<ResumenComision>(clave);
  if (previo) return previo;

  const p = await fetchProyectoFromSenado(digits);
  if (!p) return { disponible: false, motivo: "No se encontró el proyecto en la ficha oficial del Senado." };
  const nucleo = norm(comision).replace(/^comision\s+(especial\s+)?(de\s+)?/, "").split(/[,\s]+/).filter(w => w.length > 3).slice(0, 2);
  const informes = (p.documentos || [])
    .filter(d => d.tipo === "Informe" && d.url && nucleo.every(w => norm(d.titulo).includes(w)))
    .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
    .slice(0, 2);
  if (informes.length === 0) {
    return { disponible: false, comision, motivo: "Esta comisión aún no ha emitido un informe en el expediente; el resumen estará disponible cuando lo publique." };
  }

  const bloques: string[] = [];
  for (const inf of informes) {
    const t = await fetchTextoInformeDocx(inf.url!);
    if (!t) continue;
    const inicio = t.slice(0, 9000);
    const exposiciones = ventanas(t, /(expuso|expus[oi]eron|señal[oó]|manifest[oó]|indic[oó] que|explic[oó]|sostuvo|planteó|intervino|hizo uso de la palabra)/gi, 1600, 7);
    const votos = ventanas(t, /(votaci[oó]n|aprob[oó]|rechaz[oó]|unanimidad|votos a favor)/gi, 700, 5);
    bloques.push(`=== ${inf.titulo} (${inf.fecha || "s/f"}) ===\n[INICIO]\n${inicio}\n[EXPOSICIONES]\n${exposiciones.slice(0, 11000)}\n[VOTACIONES]\n${votos.slice(0, 3500)}`);
  }
  if (bloques.length === 0) return { disponible: false, comision, motivo: "No se pudo leer el texto de los informes de esta comisión." };

  const prompt = `Eres analista de la Biblioteca del Congreso Nacional de Chile. Abajo hay extractos de los informes oficiales de la ${comision} sobre el proyecto "${p.titulo}" (Boletín ${p.id}).

${bloques.join("\n\n")}

Responde en TEXTO PLANO con exactamente este formato (sin JSON ni markdown):
PERIODO: fechas o sesiones en que la comisión trató el proyecto, según el informe ("No informado" si no aparece)
SESIONES: número de sesiones dedicadas al proyecto según el informe ("No informado" si no aparece)
EXPOSITORES:
nombre | cargo e institución | qué planteó, 1-2 frases
(una línea por expositor o invitado que intervino; no incluyas a los parlamentarios integrantes)
VOTACIONES:
- resultado de cada votación relevante (en general / en particular), con votos si el informe los da
CAMBIOS:
- principales cambios o acuerdos de la comisión sobre el texto
RESUMEN:
150-250 palabras sobre el paso del proyecto por la comisión.

Reglas: usa SOLO lo que dicen los extractos; no inventes nombres, cargos, cifras ni votos; si algo no aparece, escribe "No informado". Usa guion normal.`;

  const intentos: AIProviderAttempt[] = [];
  let resp: string | null = null;
  try { resp = await generarContenidoUniversalIA(prompt, 6000, intentos); } catch { resp = null; }
  const texto = String(resp || "").replace(/\r/g, "").replace(/[‐-―]/g, "-").replace(/[*#]+/g, "");
  const seccion = (nombre: string) => {
    const re = new RegExp(`(?:^|\\n)\\s*${nombre}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:PERIODO|SESIONES|EXPOSITORES|VOTACIONES|CAMBIOS|RESUMEN):|$)`, "i");
    return (texto.match(re)?.[1] || "").trim();
  };
  const lista = (b: string) => b.split("\n").map(l => l.replace(/^\s*[-•]\s*/, "").trim()).filter(l => l && !/^no informado\.?$/i.test(l));
  const expositores = seccion("EXPOSITORES").split("\n").map(l => l.split("|").map(x => x.trim())).filter(x => x.length >= 2 && x[0] && !/^nombre$/i.test(x[0]))
    .map(x => ({ nombre: x[0].replace(/^\s*[-•]\s*/, ""), cargo: x[1] || "", planteo: x.slice(2).join(" | ") }));
  const resumen = seccion("RESUMEN");
  if (!resumen && expositores.length === 0) {
    const det = intentos.filter(i => i.configured && i.error).map(i => `${i.provider}: ${String(i.error).slice(0, 80)}`).join(" | ");
    return { disponible: false, comision, motivo: `No fue posible generar el resumen con IA en este momento.${det ? ` Detalle: ${det}` : ""}` };
  }
  const r: ResumenComision = {
    disponible: true,
    comision,
    informes: informes.map(i => ({ titulo: i.titulo, url: i.url!, fecha: i.fecha })),
    periodo: seccion("PERIODO") || "No informado",
    sesiones: seccion("SESIONES") || "No informado",
    expositores,
    votaciones: lista(seccion("VOTACIONES")),
    cambios: lista(seccion("CAMBIOS")),
    resumen,
    generado: new Date().toISOString()
  };
  cache.set(clave, r, 7 * 24 * 60 * 60 * 1000);
  return r;
}
