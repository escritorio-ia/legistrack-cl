import { Proyecto, ActivityItem, VotacionItem } from "../../src/types";
import { cache } from "./cacheService";

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

      const extractTag = (source: string, tag: string): string => {
        const match = source.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
        return match ? match[1].trim() : "";
      };

      const extractAll = (source: string, parentTag: string): string[] => {
        const regex = new RegExp(`<${parentTag}>([\\s\\S]*?)</${parentTag}>`, "gi");
        const matches = source.match(regex) || [];
        return matches.map(m => m.replace(new RegExp(`^<${parentTag}>|</${parentTag}>$`, "gi"), "").trim());
      };

      const descBlock = extractTag(xml, "descripcion");
      if (!descBlock) return null;

      const boletin = extractTag(descBlock, "boletin");
      const titulo = extractTag(descBlock, "titulo");
      const fechaIngreso = extractTag(descBlock, "fecha_ingreso");
      
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
      const linkMocion = extractTag(descBlock, "link_mensaje_mocion") || `https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=${digits}`;

      const autoresBlock = extractTag(xml, "autores");
      const autoresList = extractAll(autoresBlock, "autor").map(a => extractTag(a, "PARLAMENTARIO")).filter(Boolean);
      const autores = autoresList.join(", ");
      const patrocinantes = autoresList.length || 5;

      const materia = clasificarMateria(titulo);

      let comisionActual = "Constitución, Legislación, Justicia y Reglamento";
      if (materia === "Trabajo y Previsión Social") comisionActual = "Trabajo y Previsión Social";
      else if (materia === "Seguridad Ciudadana") comisionActual = "Seguridad Ciudadana";
      else if (materia === "Hacienda") comisionActual = "Hacienda";
      else if (materia === "Intereses Marítimos, Pesca y Acuicultura") comisionActual = "Intereses Marítimos, Pesca y Acuicultura";
      else if (materia === "Salud") comisionActual = "Salud";
      else if (materia === "Educación") comisionActual = "Educación";
      else if (materia === "Medio Ambiente y Bienes Nacionales") comisionActual = "Medio Ambiente y Bienes Nacionales";

      let siguienteSesion = "Mié, 15 de mayo - 10:00 hrs";
      
      if (subetapa) {
        const commMatch = subetapa.match(/comisión\s+de\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s\-\,y]+)/i);
        if (commMatch) {
          const parsedComm = commMatch[1].trim();
          comisionActual = `Comisión de ${parsedComm}`;
          siguienteSesion = `Por confirmar (Pendiente citación en ${comisionActual})`;
        }
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

      const informesBlock = extractTag(xml, "informes");
      if (informesBlock) {
        const informesList = extractAll(informesBlock, "informe");
        informesList.forEach((inf, idx) => {
          const link = extractTag(inf, "LINK");
          const tipoDoc = extractTag(inf, "TIPODOC") || "Informe";
          const fecha = extractTag(inf, "FECHADEVOLUCION") || fechaIngreso;
          documentos.push({
            id: `doc-${digits}-inf-${idx}`,
            titulo: `${tipoDoc} de Comisión`,
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
          const link = extractTag(of, "LINK");
          const tipoDoc = extractTag(of, "TIPODOC") || "Oficio";
          const fecha = extractTag(of, "FECHADEVOLUCION") || fechaIngreso;
          documentos.push({
            id: `doc-${digits}-of-${idx}`,
            titulo: `${tipoDoc} de Trámite`,
            tipo: "Oficio",
            fecha,
            url: link
          });
        });
      }

      const diasTramitacion = computeDiasTramitacion(fechaIngreso);
      const diasTxt = diasTramitacion !== undefined ? ` Lleva ${diasTramitacion} día${diasTramitacion === 1 ? "" : "s"} en tramitación.` : "";
      const resumen = `Proyecto de ley iniciado el ${fechaIngreso} por vía de ${iniciativa} en el ${camaraOrigen}. Su materia principal es: ${materia}. Actualmente se encuentra en la etapa de "${etapa}" con estado de tramitación "${estado}". Autores principales: ${autores || "N/A"}.${diasTxt}`;

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
        siguienteSesion,
        quorum: estimarQuorum(titulo, materia),
        fichaTecnica: estimarFichaTecnica(titulo, materia),
        origenDetalle: estimarOrigenDetalle(titulo, materia, iniciativa, autores)
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
  const materia = clasificarMateria(item.titulo);
  const estadoNorm = item.estado.toLowerCase();
  const estado = estadoNorm.includes("public")
    ? "Publicado como Ley"
    : estadoNorm.includes("tramit")
    ? "En discusión"
    : item.estado;
  const dias = computeDiasTramitacion(item.fecha);
  const diasTxt = dias !== undefined ? ` Lleva ${dias} día${dias === 1 ? "" : "s"} en tramitación.` : "";

  return {
    id: item.id,
    titulo: item.titulo,
    resumen: item.ley
      ? `Proyecto de ley (Boletín ${item.id}). ${item.ley}. Estado actual: ${item.estado}.${diasTxt}`
      : `Proyecto de ley (Boletín ${item.id}) actualmente en tramitación en el Congreso Nacional. Materia: ${materia}.${diasTxt}`,
    fechaIngreso: item.fecha,
    estado,
    camaraOrigen: "Senado",
    etapa: item.estado,
    materia,
    urgencia: "Sin urgencia",
    patrocinantes: 0,
    iniciativa: "Moción",
    comisionActual: materia,
    diasTramitacion: dias,
    timeline: [],
    documentos: [],
    votaciones: [],
    linkCongreso: getSenadoApiLink(item.id),
    quorum: estimarQuorum(item.titulo, materia),
    fichaTecnica: estimarFichaTecnica(item.titulo, materia),
    origenDetalle: estimarOrigenDetalle(item.titulo, materia, "Moción", "")
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
