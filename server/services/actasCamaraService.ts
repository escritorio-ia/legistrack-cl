/**
 * Actas oficiales de sesiones de comisión de la Cámara (camara.cl/verDoc.aspx?...prmTipo=DOCUMENTO_COMISIONSESIONACTA).
 * camara.cl no responde a servidores, así que las envía la extensión de navegador cuando el usuario abre la página
 * de sesiones de una comisión. Aquí se extrae el texto del PDF y se guarda en Firestore (colección "actas_camara"),
 * con los boletines que menciona, para usarlo como fuente oficial en el historial y en los informes de sesión.
 */
import { DIPUTADOS_COMISIONES_DETALLE } from "../../src/data/comisionesData";
import { boletinesEnTexto } from "../../src/utils/boletines";
import { escribirDoc, consultar, camposAObjeto } from "./firestoreRest";

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

export interface ActaCamara { sesionId: string; comision: string; comisionId: string; fecha: string; numero: string; url: string; texto: string; boletines: string[] }

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
