// Proyectos de ley relacionados con un boletín, a partir del listado oficial de mociones y mensajes de la Cámara
// (opendata.camara.cl: todos los proyectos ingresados por año, con boletín, título, fecha y tipo).
// Sin IA: (1) proyectos que modifican la misma ley o código, según su título oficial; (2) proyectos con título
// de materia similar (términos en común, ponderados por lo poco frecuentes que son). Cada resultado dice por qué.
import { leerDoc, escribirDoc } from "./firestoreRest";

const WS = "https://opendata.camara.cl/camaradiputados/WServices/WSLegislativo.asmx";
const DESDE_ANIO = 2014;
export type ItemIndice = [string, string, string, string]; // boletín, título, fecha (AAAA-MM-DD), tipo

const decod = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
export function parsearListado(xml: string): ItemIndice[] {
  return Array.from(xml.matchAll(/<ProyectoLey>([\s\S]*?)<\/ProyectoLey>/g)).map((m) => {
    const b = m[1];
    const t = (tag: string) => decod((b.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]*)</${tag}>`)) || [])[1] || "").trim();
    return [t("NumeroBoletin"), t("Nombre"), t("FechaIngreso").slice(0, 10), t("TipoIniciativa")] as ItemIndice;
  }).filter((x) => /^\d{3,6}-\d{1,2}$/.test(x[0]) && x[1]);
}

async function listadoAnio(anio: number): Promise<ItemIndice[]> {
  const out: ItemIndice[] = [];
  for (const op of ["retornarMocionesXAnno", "retornarMensajesXAnno"]) {
    const r = await fetch(`${WS}/${op}?prmAnno=${anio}`, { headers: { "User-Agent": "LegisTrackCL/1.0 (datos abiertos)" }, signal: AbortSignal.timeout(40000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    out.push(...parsearListado(await r.text()));
  }
  return out;
}

let memoria: { hasta: number; items: ItemIndice[] } | null = null;
/** Índice de todos los proyectos desde 2014 (Firestore: indice_proyectos/a<año>; el año en curso se renueva cada día). */
export async function indiceProyectos(): Promise<{ items: ItemIndice[]; faltan: number[] }> {
  if (memoria && memoria.hasta > Date.now()) return { items: memoria.items, faltan: [] };
  const actual = new Date().getFullYear();
  const anios = Array.from({ length: actual - DESDE_ANIO + 1 }, (_, i) => DESDE_ANIO + i);
  const items: ItemIndice[] = [];
  const faltan: number[] = [];
  const cola = [...anios];
  const trabajador = async () => {
    while (cola.length) {
      const a = cola.shift()!;
      const doc: any = await leerDoc(`indice_proyectos/a${a}`).catch(() => null);
      const vigente = doc?.items && (a < actual - 1 || (doc.actualizado && Date.now() - Date.parse(doc.actualizado) < 24 * 3600 * 1000));
      if (vigente) { items.push(...JSON.parse(doc.items)); continue; }
      try {
        const lista = await listadoAnio(a);
        items.push(...lista);
        await escribirDoc(`indice_proyectos/a${a}`, { items: JSON.stringify(lista), actualizado: new Date().toISOString(), total: lista.length }).catch(() => undefined);
      } catch {
        if (doc?.items) items.push(...JSON.parse(doc.items)); else faltan.push(a);
      }
    }
  };
  await Promise.all([trabajador(), trabajador(), trabajador(), trabajador()]);
  const unicos = Array.from(new Map(items.map((x) => [x[0], x])).values());
  if (!faltan.length) memoria = { hasta: Date.now() + 6 * 3600 * 1000, items: unicos };
  return { items: unicos, faltan };
}

// ---------- Comparación de títulos ----------
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const VACIAS = new Set(("de la el los las del y a en que para por con sin su sus se al o u un una unos unas sobre como entre ante bajo desde hasta hacia " +
  "lo le les mas este esta estos estas ese esa dicho dicha cual cuales cuyo cuya no ni e otros otras otro otra todo toda todos todas " +
  "modifica modificar modificacion modificaciones introduce establece establecer crea crear dispone fija fijar regula regular declara " +
  "ley leyes n numero articulo articulos codigo decreto fuerza dfl proyecto materia materias objeto fin efecto efectos normas norma " +
  "diversos diversas cuerpos legales legal respecto relativo relativa indica senala ambito cuanto caso casos forma fecha nacional " +
  "deroga incorpora sustituye agrega perfecciona mejora fortalece facilita permite promueve aplicacion manera medidas medida " +
  "debe deben cada ano anos dia dias tal tales mismo misma demas parte").split(" "));
const raiz = (w: string) => w.length > 5 ? w.replace(/(ciones|cion|mente|idades|idad|es|s)$/, "") : w;
export function terminos(titulo: string): string[] {
  return Array.from(new Set(norm(titulo).replace(/[^a-z0-9ñ ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !VACIAS.has(w) && !/^\d+$/.test(w)).map(raiz)));
}
/** Leyes y códigos que el título dice modificar: "ley N° 18.455" → "ley 18455"; "Código del Trabajo" → "codigo del trabajo". */
export function normasEnTitulo(titulo: string): string[] {
  const t = norm(titulo);
  const out = new Set<string>();
  for (const m of t.matchAll(/\bley\s*(?:n[°º.]?|numero)?\s*(\d{1,2}\.?\d{3})\b/g)) out.add(`ley ${m[1].replace(/\./g, "")}`);
  for (const m of t.matchAll(/\bcodigo\s+((?:de\s+|del\s+|de\s+la\s+)?[a-zñ]+(?:\s+(?:de\s+|del\s+|y\s+)?[a-zñ]+)?)/g)) {
    const nombre = m[1].replace(/\s+(para|con|en|a|que|y|al|sobre|respecto|el|la|los|las)$/,"").replace(/\s+(para|con|en|a|que|al|sobre)\s.*$/, "").trim();
    if (nombre && !/^(de|del)$/.test(nombre)) out.add(`codigo ${nombre}`);
  }
  return Array.from(out);
}
const etiquetaNorma = (n: string) => n.startsWith("ley ") ? `Ley N° ${n.slice(4).replace(/(\d+)(\d{3})$/, "$1.$2")}` : n.replace(/^codigo/, "Código").replace(/\b(trabajo|penal|civil|sanitario|tributario|aguas|mineria|comercio|procedimiento|organico|tribunales|transito|aeronautico)\b/g, (w) => w[0].toUpperCase() + w.slice(1));

export interface Relacionado { boletin: string; titulo: string; fecha: string; tipo: string; motivo: string; puntaje: number }
export async function proyectosRelacionados(boletin: string, tituloPropio?: string) {
  const { items, faltan } = await indiceProyectos();
  const clave = String(boletin).split("-")[0];
  const propio = items.find((x) => x[0].split("-")[0] === clave);
  // Se prefiere el título del listado de la Cámara: suele traer el número de la ley que modifica.
  const titulo = propio?.[1] || tituloPropio || "";
  if (!titulo) return { disponible: false, motivo: "No se encontró el título oficial del proyecto en el listado de la Cámara.", mismaNorma: [], materiaSimilar: [], total: items.length, faltan };
  const otros = items.filter((x) => x[0].split("-")[0] !== clave);

  // Similitud de títulos (coseno con pesos IDF): sirve para ordenar ambos grupos.
  const docs = otros.map((x) => terminos(x[1]));
  const df = new Map<string, number>();
  for (const d of docs) for (const w of d) df.set(w, (df.get(w) || 0) + 1);
  const N = docs.length || 1;
  const idf = (w: string) => Math.log((N + 1) / ((df.get(w) || 0) + 1)) + 1;
  const mios = terminos(titulo);
  const normaMia = Math.sqrt(mios.reduce((s, w) => s + idf(w) ** 2, 0)) || 1;
  const similitud = (i: number) => {
    const d = docs[i];
    const comunes = mios.filter((w) => d.includes(w));
    const punto = comunes.reduce((s, w) => s + idf(w) ** 2, 0);
    const normaOtro = Math.sqrt(d.reduce((s, w) => s + idf(w) ** 2, 0)) || 1;
    return { sim: punto / (normaMia * normaOtro), comunes: comunes.sort((a, b) => idf(b) - idf(a)) };
  };

  // 1) Misma ley o código, según el título oficial (los de materia más parecida primero).
  const normas = normasEnTitulo(titulo);
  const mismaNorma: Relacionado[] = normas.length ? otros.map((x, i) => {
    const comunes = normasEnTitulo(x[1]).filter((n) => normas.includes(n));
    if (!comunes.length) return null;
    const { sim, comunes: palabras } = similitud(i);
    return { boletin: x[0], titulo: x[1], fecha: x[2], tipo: x[3], motivo: `También modifica: ${comunes.map(etiquetaNorma).join(", ")}${palabras.length ? ` · términos en común: ${palabras.slice(0, 3).join(", ")}` : ""}`, puntaje: comunes.length * 100 + Math.round(sim * 100) };
  }).filter(Boolean).sort((a: any, b: any) => b.puntaje - a.puntaje || b.fecha.localeCompare(a.fecha)).slice(0, 25) as Relacionado[] : [];
  const totalMismaNorma = normas.length ? otros.filter((x) => normasEnTitulo(x[1]).some((n) => normas.includes(n))).length : 0;

  // 2) Materia similar (sin repetir los anteriores).
  const yaListados = new Set(mismaNorma.map((r) => r.boletin));
  const materiaSimilar: Relacionado[] = otros.map((x, i) => {
    if (yaListados.has(x[0])) return null;
    const { sim, comunes } = similitud(i);
    if (comunes.length < 2 || sim < 0.3) return null;
    return { boletin: x[0], titulo: x[1], fecha: x[2], tipo: x[3], motivo: `Términos en común: ${comunes.slice(0, 5).join(", ")}`, puntaje: Math.round(sim * 100) };
  }).filter(Boolean).sort((a: any, b: any) => b.puntaje - a.puntaje || b.fecha.localeCompare(a.fecha)).slice(0, 15) as Relacionado[];

  return { disponible: true, titulo, normas: normas.map(etiquetaNorma), mismaNorma, totalMismaNorma, materiaSimilar, total: items.length, desde: DESDE_ANIO, faltan };
}
