/**
 * Actas oficiales de sesiones de comisión de la Cámara (camara.cl/verDoc.aspx?...prmTipo=DOCUMENTO_COMISIONSESIONACTA).
 * camara.cl no responde a servidores, así que las envía la extensión de navegador cuando el usuario abre la página
 * de sesiones de una comisión. Aquí se extrae el texto del PDF y se guarda en Firestore (colección "actas_camara"),
 * con los boletines que menciona, para usarlo como fuente oficial en el historial y en los informes de sesión.
 */
import { DIPUTADOS_COMISIONES_DETALLE } from "../../src/data/comisionesData";
import { boletinesEnTexto } from "../../src/utils/boletines";
import { escribirDoc, consultar, camposAObjeto, leerDoc } from "./firestoreRest";
import { parsearSesionComisionCamara } from "./camaraService";
import { registrarAportes, idSesion } from "./registroSesionesService";

const MESES: Record<string, number> = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, set: 9, oct: 10, nov: 11, dic: 12 };
/** "17 nov. 2026" o "17/11/2026" -> "2026-11-17". */
export function fechaActaISO(t: string): string {
  const s = String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  let m = s.match(/(\d{1,2})\s+([a-z]{3})[a-z.]*\s+(\d{4})/);
  if (m && MESES[m[2]]) return `${m[3]}-${String(MESES[m[2]]).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  m = s.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : "";
}

export async function importarActaCamara(p: { comisionPrmId: string; sesionId: string; numero?: string; fecha: string; hora?: string; docId: string; pdfBase64: string }):
  Promise<{ sesionId: string; fecha: string; caracteres: number; boletines: string[] }> {
  if (!/^\d+$/.test(p.comisionPrmId) || !/^\d+$/.test(p.sesionId) || !/^\d+$/.test(p.docId)) throw new Error("Identificadores no válidos.");
  const fecha = fechaActaISO(p.fecha);
  if (!fecha) throw new Error("Fecha de la sesión no válida.");
  const buffer = Buffer.from(String(p.pdfBase64 || ""), "base64");
  if (buffer.slice(0, 4).toString("latin1") !== "%PDF") throw new Error("El acta no es un PDF.");
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const texto = String((await extractText(pdf, { mergePages: true })).text || "").replace(/\s+/g, " ").trim();
  if (texto.length < 200) throw new Error("No se pudo leer el texto del acta (¿PDF escaneado?).");
  const c = DIPUTADOS_COMISIONES_DETALLE.find((x: any) => String(x.prmID) === p.comisionPrmId);
  const boletines = boletinesEnTexto(texto);
  await escribirDoc(`actas_camara/${p.sesionId}`, {
    comisionPrmId: p.comisionPrmId, comisionId: c ? `cd-${c.id}` : "", comision: c?.nombre || `Comisión de la Cámara (${p.comisionPrmId})`,
    sesionId: p.sesionId, numero: String(p.numero || ""), fecha, hora: String(p.hora || ""), docId: p.docId,
    url: `https://www.camara.cl/verDoc.aspx?prmID=${p.docId}&prmTipo=DOCUMENTO_COMISIONSESIONACTA`,
    texto: texto.slice(0, 300000), boletines, importadoEn: new Date().toISOString(),
  });
  return { sesionId: p.sesionId, fecha, caracteres: texto.length, boletines };
}

export interface ActaCamara { sesionId: string; comision: string; comisionId: string; fecha: string; numero: string; url: string; texto: string; cuenta?: string; boletines: string[] }

export async function actasDeBoletin(boletin: string): Promise<ActaCamara[]> {
  const filas = await consultar({ from: [{ collectionId: "actas_camara" }], where: { fieldFilter: { field: { fieldPath: "boletines" }, op: "ARRAY_CONTAINS", value: { stringValue: boletin } } } });
  return filas.map((f) => camposAObjeto(f.datos) as ActaCamara).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export async function actasDeFecha(fecha: string): Promise<ActaCamara[]> {
  const filas = await consultar({ from: [{ collectionId: "actas_camara" }], where: { fieldFilter: { field: { fieldPath: "fecha" }, op: "EQUAL", value: { stringValue: fecha } } } });
  return filas.map((f) => camposAObjeto(f.datos) as ActaCamara);
}

/** Tramo del acta que trata un boletín (alrededor de sus menciones), para no enviar el acta completa a la IA. */
export function tramoDeBoletin(texto: string, boletin: string, largo = 12000): string {
  const num = boletin.split("-")[0];
  const re = new RegExp(`${num.slice(0, -3)}\\.?${num.slice(-3)}-\\d{1,2}`, "g");
  const pos: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) pos.push(m.index);
  if (!pos.length) return texto.slice(0, largo);
  const ini = Math.max(0, pos[0] - 1500);
  return texto.slice(ini, Math.min(texto.length, Math.max(ini + largo, pos[pos.length - 1] + 3000)));
}

async function textoPdf(b64?: string): Promise<string> {
  if (!b64) return "";
  const buffer = Buffer.from(String(b64), "base64");
  if (buffer.slice(0, 4).toString("latin1") !== "%PDF") return "";
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  return String((await extractText(pdf, { mergePages: true })).text || "").replace(/\s+/g, " ").trim();
}

/**
 * Sesión completa de una comisión de la Cámara, como aparece en camara.cl: citación, cuenta, asistencia, acta,
 * votaciones y resultado. La envía la extensión al abrir la página de sesiones de la comisión.
 * Se guarda en actas_camara/<sesionId> y además se registra como "detalle oficial" en el registro de sesiones,
 * para que aparezca en la comisión, en el resumen de la comisión y en el historial de cada boletín.
 */
export async function importarSesionCamara(p: {
  comisionPrmId: string; sesionId: string; numero?: string; fecha: string; hora?: string; termino?: string; estado?: string;
  citacionHtml?: string; resultadoHtml?: string; votacionesHtml?: string; asistenciaTexto?: string;
  actaDocId?: string; actaBase64?: string; cuentaDocId?: string; cuentaBase64?: string;
}) {
  if (!/^\d+$/.test(p.comisionPrmId) || !/^\d+$/.test(p.sesionId)) throw new Error("Identificadores no válidos.");
  const fecha = fechaActaISO(p.fecha);
  if (!fecha) throw new Error("Fecha de la sesión no válida.");
  const c: any = DIPUTADOS_COMISIONES_DETALLE.find((x: any) => String(x.prmID) === p.comisionPrmId);
  const comision = c?.nombre || `Comisión de la Cámara (${p.comisionPrmId})`;
  const [acta, cuenta] = await Promise.all([textoPdf(p.actaBase64).catch(() => ""), textoPdf(p.cuentaBase64).catch(() => "")]);
  const det = parsearSesionComisionCamara(p.citacionHtml || "", p.resultadoHtml || "", p.votacionesHtml || "", "") || { puntos: [], asistencia: { asistentes: [], reemplazos: "", otrosAsistentes: "" }, votaciones: [], boletinesVistos: [] };
  const asistencia = String(p.asistenciaTexto || "").replace(/\s+/g, " ").trim().slice(0, 8000);
  const boletines = Array.from(new Set([...det.puntos.flatMap((x: any) => (x.boletines || []).map((b: string) => b)), ...boletinesEnTexto(`${acta} ${cuenta}`)]
    .map((b) => b.replace(/\./g, "")).filter((b) => /^\d{3,6}-\d{1,2}$/.test(b)).map((b) => { const [n, s] = b.split("-"); return `${n}-${s.padStart(2, "0")}`; })));
  const url = `https://www.camara.cl/legislacion/comisiones/sesiones.aspx?prmID=${p.comisionPrmId}&prmIdTipo=2101`;
  await escribirDoc(`actas_camara/${p.sesionId}`, {
    comisionPrmId: p.comisionPrmId, comisionId: c ? `cd-${c.id}` : "", comision, sesionId: p.sesionId, numero: String(p.numero || ""), fecha,
    hora: String(p.hora || ""), termino: String(p.termino || ""), estado: String(p.estado || ""),
    docId: p.actaDocId || "", url: p.actaDocId ? `https://www.camara.cl/verDoc.aspx?prmID=${p.actaDocId}&prmTipo=DOCUMENTO_COMISIONSESIONACTA` : url,
    cuentaUrl: p.cuentaDocId ? `https://www.camara.cl/verDoc.aspx?prmID=${p.cuentaDocId}&prmTipo=DOCUMENTO_COMISIONSESIONCUENTA` : "",
    texto: acta.slice(0, 300000), cuenta: cuenta.slice(0, 100000), asistencia,
    puntos: det.puntos.map((x: any, i: number) => ({ numero: i + 1, texto: x.materia, boletines: x.boletines, invitados: x.invitados || "", resultado: x.resultado || "" })),
    votaciones: det.votaciones, diputadosAsistentes: det.asistencia.asistentes,
    boletines, importadoEn: new Date().toISOString(),
  });
  // Registro de sesiones: "detalle oficial" de la sesión (puntos con acuerdos e invitados).
  if (c && det.puntos.length) {
    await registrarAportes([{
      id: idSesion("Cámara", c.id, fecha, p.hora || ""), fuente: "detalle", camara: "Cámara", comisionId: `cd-${c.id}`, comisionNombre: comision, fecha, boletines,
      datos: {
        inicio: p.hora || null, termino: p.termino || null, url,
        puntos: det.puntos.map((x: any, i: number) => ({ numero: i + 1, texto: x.materia, boletines: x.boletines, acuerdos: x.resultado || null, invitados: x.invitados || null, asistentes: det.asistencia.asistentes.join("; ") || null })),
      },
    }]).catch(() => undefined);
  }
  return { sesionId: p.sesionId, fecha, boletines, acta: acta.length > 0, cuenta: cuenta.length > 0, puntos: det.puntos.length, votaciones: det.votaciones.length };
}

// ---------------------------------------------------------------------------
// Sesiones y asistencia desde los datos abiertos de la Cámara (opendata.camara.cl, accesible desde el servidor).
// Completa actas_camara/<Id de sesión> (el mismo identificador que usa camara.cl) sin necesidad del navegador.
// No trae actas, cuenta, votaciones ni documentos: eso solo está en camara.cl y lo envía la extensión.
// ---------------------------------------------------------------------------
const OPENDATA_SESIONES = "https://opendata.camara.cl/camaradiputados/WServices/WSComision.asmx/retornarSesionesXComisionYAnno";
const etiqueta = (x: string, t: string) => (x.match(new RegExp(`<${t}(?:\\s[^>]*)?>([^<]*)</${t}>`)) || [])[1]?.trim() || "";
const nombrePropio = (s: string) => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_m, a, b) => a + b.toUpperCase());

export function parsearSesionesOpendata(xml: string) {
  return xml.split("<SesionComision>").slice(1).map((b0) => {
    const b = b0.split("</SesionComision>")[0];
    const inicio = etiqueta(b, "FechaInicio"), termino = etiqueta(b, "FechaTermino");
    const asistencia = Array.from(b.matchAll(/<TipoAsistencia[^>]*>([^<]*)<\/TipoAsistencia>\s*<Diputado>[\s\S]*?<Nombre>([^<]*)<\/Nombre>\s*<ApellidoPaterno>([^<]*)<\/ApellidoPaterno>\s*<ApellidoMaterno>([^<]*)<\/ApellidoMaterno>[\s\S]*?<\/Diputado>(?:\s*<TipoTitularAsistencia[^>]*>([^<]*)<\/TipoTitularAsistencia>)?/g))
      .map((m) => ({ nombre: nombrePropio(`${m[2]} ${m[3]} ${m[4]}`.replace(/\s+/g, " ").trim()), tipo: m[1].trim(), titular: (m[5] || "").trim() }));
    return {
      sesionId: etiqueta(b, "Id"), numero: etiqueta(b, "Numero"), tipoSesion: etiqueta(b, "Tipo"), estado: etiqueta(b, "Estado"),
      fecha: inicio.slice(0, 10), hora: inicio.slice(11, 16), termino: termino.slice(11, 16), asistencia,
    };
  }).filter((x) => /^\d+$/.test(x.sesionId) && /^\d{4}-\d{2}-\d{2}$/.test(x.fecha));
}

/** Trae las sesiones recientes (y, la primera vez, las de todo el año) de cada comisión de la Cámara. */
export async function sincronizarSesionesCamaraOpendata(opciones: { dias?: number; presupuestoMs?: number } = {}) {
  const fin = Date.now() + (opciones.presupuestoMs ?? 200_000);
  const estado: any = await leerDoc("registro_indice/opendata_camara").catch(() => null);
  const hoy = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); // hora de Chile, aprox.
  const desde = estado?.historicoHecho ? new Date(Date.now() - (opciones.dias ?? 21) * 86400000).toISOString().slice(0, 10) : `${hoy.slice(0, 4)}-01-01`;
  const anios = Array.from(new Set([desde.slice(0, 4), hoy.slice(0, 4)]));
  const cola = (DIPUTADOS_COMISIONES_DETALLE as any[]).filter((c) => /^\d+$/.test(String(c.prmID || "")));
  let sesiones = 0, errores = 0, comisiones = 0, incompleto = false;
  const trabajador = async () => {
    while (cola.length) {
      if (Date.now() > fin) { incompleto = true; return; }
      const c = cola.shift();
      for (const anio of anios) {
        try {
          const r = await fetch(`${OPENDATA_SESIONES}?prmComisionId=${c.prmID}&prmAnno=${anio}`, { signal: AbortSignal.timeout(30000) });
          if (!r.ok) { errores++; continue; }
          for (const x of parsearSesionesOpendata(await r.text())) {
            if (x.fecha < desde || x.fecha > hoy) continue;
            await escribirDoc(`actas_camara/${x.sesionId}`, {
              comisionPrmId: String(c.prmID), comisionId: `cd-${c.id}`, comision: c.nombre, sesionId: x.sesionId, numero: x.numero,
              fecha: x.fecha, hora: x.hora, termino: x.termino, estado: x.estado, tipoSesion: x.tipoSesion,
              asistenciaOficial: x.asistencia, opendataActualizado: new Date().toISOString(),
            });
            sesiones++;
          }
        } catch { errores++; }
      }
      comisiones++;
    }
  };
  await Promise.all([trabajador(), trabajador(), trabajador(), trabajador()]);
  if (!incompleto) await escribirDoc("registro_indice/opendata_camara", { historicoHecho: true, ultima: new Date().toISOString(), sesiones, errores }).catch(() => undefined);
  return { ok: true, desde, comisiones, sesiones, errores, incompleto };
}

/** Sesiones de la Cámara guardadas de una comisión (por su identificador de la app, "cd-<slug>"). */
export async function sesionesActasCamaraDeComision(comisionId: string) {
  const filas = await consultar({ from: [{ collectionId: "actas_camara" }], where: { fieldFilter: { field: { fieldPath: "comisionId" }, op: "EQUAL", value: { stringValue: comisionId } } } });
  return filas.map((f) => { const d: any = camposAObjeto(f.datos); return { sesionId: d.sesionId, numero: d.numero, fecha: d.fecha, hora: d.hora, url: d.url, cuentaUrl: d.cuentaUrl, tieneActa: !!d.texto, tieneCuenta: !!d.cuenta, asistentes: Math.max((d.diputadosAsistentes || []).length, (d.asistenciaOficial || []).filter((x: any) => /^asiste/i.test(x.tipo || "")).length),
      asistenciaOficial: d.asistenciaOficial || [], estado: d.estado || "", votaciones: d.votaciones || [], puntos: d.puntos || [] }; })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ---------------------------------------------------------------------------
// Documentos de comisión de la Cámara (documentos.aspx): presentaciones de invitados, comparados, minutas, etc.
// Los envía la extensión al abrir esa página; se extrae el texto si viene el archivo (PDF o Word).
// ---------------------------------------------------------------------------
async function textoArchivo(b64?: string): Promise<{ texto: string; formato: string }> {
  if (!b64) return { texto: "", formato: "" };
  const buf = Buffer.from(String(b64), "base64");
  try {
    if (buf.slice(0, 4).toString("latin1") === "%PDF") {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      return { texto: String((await extractText(pdf, { mergePages: true })).text || "").replace(/\s+/g, " ").trim(), formato: "pdf" };
    }
    if (buf.slice(0, 2).toString("latin1") === "PK") {
      const mammoth = await import("mammoth");
      const t = ((await mammoth.extractRawText({ buffer: buf })).value || "").replace(/\s+/g, " ").trim();
      return { texto: t, formato: t ? "docx" : "zip" };
    }
  } catch { /* sin texto */ }
  return { texto: "", formato: "otro" };
}

export async function importarDocumentosCamara(p: { comisionPrmId: string; docs: { docId: string; fecha: string; sesion?: string; tipo?: string; boletin?: string; titulo?: string; base64?: string }[] }) {
  if (!/^\d+$/.test(p.comisionPrmId)) throw new Error("Comisión no válida.");
  const c: any = DIPUTADOS_COMISIONES_DETALLE.find((x: any) => String(x.prmID) === p.comisionPrmId);
  let n = 0;
  for (const d of (p.docs || []).slice(0, 10)) {
    if (!/^\d+$/.test(String(d.docId))) continue;
    const { texto, formato } = await textoArchivo(d.base64);
    const bol = String(d.boletin || "").replace(/\./g, "").match(/(\d{3,6})-(\d{1,2})/);
    await escribirDoc(`documentos_camara/${d.docId}`, {
      docId: String(d.docId), comisionPrmId: p.comisionPrmId, comisionId: c ? `cd-${c.id}` : "", comision: c?.nombre || "",
      fecha: fechaActaISO(d.fecha), sesion: String(d.sesion || ""), tipo: String(d.tipo || ""), boletin: bol ? `${bol[1]}-${bol[2].padStart(2, "0")}` : "",
      titulo: String(d.titulo || "").slice(0, 600), url: `https://www.camara.cl/verDoc.aspx?prmID=${d.docId}&prmTipo=DOCUMENTO_COMISIONDOCUMENTO`,
      texto: texto.slice(0, 80000), formato, sinArchivo: !d.base64, importadoEn: new Date().toISOString(),
    });
    n++;
  }
  return { documentos: n };
}

export async function documentosCamaraDeBoletin(boletin: string) {
  const filas = await consultar({ from: [{ collectionId: "documentos_camara" }], where: { fieldFilter: { field: { fieldPath: "boletin" }, op: "EQUAL", value: { stringValue: boletin } } } }).catch(() => []);
  return filas.map((f) => camposAObjeto(f.datos) as any).sort((a: any, b: any) => String(a.fecha).localeCompare(String(b.fecha)));
}
export async function documentosCamaraDeComision(comisionId: string) {
  const filas = await consultar({ from: [{ collectionId: "documentos_camara" }], where: { fieldFilter: { field: { fieldPath: "comisionId" }, op: "EQUAL", value: { stringValue: comisionId } } }, select: { fields: ["docId", "fecha", "sesion", "tipo", "boletin", "titulo", "url"].map((f) => ({ fieldPath: f })) } }).catch(() => []);
  return filas.map((f) => camposAObjeto(f.datos) as any).sort((a: any, b: any) => String(b.fecha).localeCompare(String(a.fecha)));
}
