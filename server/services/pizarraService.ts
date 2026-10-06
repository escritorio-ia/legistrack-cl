/**
 * Pizarra ATP: visión transversal de lo que se investiga, dónde se cruza y cómo
 * se conecta con la actividad semanal de las comisiones.
 *
 * Diseño pensado para instalarse en servidores propios:
 *  - La lógica de detección trabaja sobre un registro neutro (Investigacion) y NO
 *    sabe de dónde vienen los datos. La fuente se elige con PIZARRA_FUENTE:
 *      demo    -> datos ficticios de demostración (por defecto)
 *      archivo -> CSV o JSON en el servidor (PIZARRA_ARCHIVO), p. ej. una exportación
 *                 periódica del SUP depositada en una ruta compartida
 *    Para conectar el SUP directamente basta agregar un proveedor en PROVEEDORES.
 *  - Las importaciones manuales se guardan en PIZARRA_DATA_DIR (disco del servidor).
 *    Sin esa variable quedan solo en memoria (útil en demo / Vercel).
 *  - La detección es determinista y explicable (boletines, normas y palabras clave
 *    compartidas): ningún dato de pedidos se envía a proveedores de IA externos.
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export type EstadoInvestigacion = "en_curso" | "entregada" | "archivada";
export type TipoPedido = "comision" | "parlamentario";

export interface Investigacion {
  id: string;
  area: string;
  investigador: string;
  tipo: TipoPedido;
  solicitante: string;
  comision?: string;
  boletines: string[];
  materia: string;
  descripcion?: string;
  palabrasClave: string[];
  normas: string[];
  estado: EstadoInvestigacion;
  fechaIngreso: string;
  fechaEntrega?: string;
  etapa?: string;
}

/** Qué investigador/a acompaña (sigue) qué comisión. */
export interface Asignacion {
  investigador: string;
  area: string;
  comision: string;
}

export interface DatosPizarra {
  investigaciones: Investigacion[];
  asignaciones: Asignacion[];
}

export interface InfoFuente {
  tipo: "demo" | "archivo";
  nombre: string;
  demo: boolean;
  persistente: boolean;
  actualizado: string;
}

// ---------------------------------------------------------------------------
// Utilidades de normalización
// ---------------------------------------------------------------------------

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = (s: string) => sinAcentos(s).toLowerCase().trim();

export function normalizarBoletin(b: string): string {
  // 14.773-02 y 14773-2 son el mismo boletín: se quitan puntos, espacios y ceros del sufijo.
  return b.replace(/\./g, "").replace(/\s+/g, "").replace(/-0+(\d)/, "-$1").trim();
}

function normalizarNorma(n: string): string {
  return norm(n).replace(/\./g, "").replace(/\s+/g, " ");
}

const STOPWORDS = new Set([
  "sobre", "entre", "desde", "hasta", "para", "como", "donde", "cuando", "segun", "desde", "hacia", "tambien",
  "proyecto", "proyectos", "informe", "informes", "analisis", "antecedentes", "materia", "materias", "chile",
  "chilena", "chileno", "nacional", "legal", "legales", "estudio", "estudios", "comparada", "comparado", "regulacion"
]);

function raiz(p: string): string {
  if (p.length > 6 && p.endsWith("es")) return p.slice(0, -2);
  if (p.length > 5 && p.endsWith("s")) return p.slice(0, -1);
  return p;
}

/** Conjunto de términos significativos (raíces) de una investigación, con las palabras clave. */
function terminos(inv: Investigacion): Set<string> {
  const out = new Set<string>();
  const fuentes = [...inv.palabrasClave, inv.materia];
  for (const f of fuentes) {
    for (const w of norm(f).split(/[^a-z0-9ñ]+/)) {
      if (w.length >= 5 && !STOPWORDS.has(w)) out.add(raiz(w));
    }
  }
  return out;
}

function compartidos(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((x) => b.has(x));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  const inter = compartidos(a, b).length;
  return inter / (a.size + b.size - inter);
}

// ---------------------------------------------------------------------------
// Semana
// ---------------------------------------------------------------------------

function inicioDeSemana(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - dow);
  return d;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function semanaActual(ref = new Date()) {
  const desde = inicioDeSemana(ref);
  const hasta = new Date(desde);
  hasta.setDate(hasta.getDate() + 6);
  const f = (d: Date) => `${d.getDate()} ${MESES[d.getMonth()].toUpperCase()}`;
  return { desde, hasta, etiqueta: `${f(desde)} – ${f(hasta)}` };
}

// ---------------------------------------------------------------------------
// Datos de demostración (FICTICIOS; fechas relativas a la semana en curso para
// que las alertas siempre se vean). Reflejan los ejemplos de la propuesta.
// ---------------------------------------------------------------------------

function iso(base: Date, diasOffset: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + diasOffset);
  return d.toISOString().slice(0, 10);
}

function datosDemo(): DatosPizarra {
  const lunes = semanaActual().desde;
  const inv = (x: Partial<Investigacion> & Pick<Investigacion, "id" | "area" | "investigador" | "materia">): Investigacion => ({
    tipo: "comision",
    solicitante: "",
    boletines: [],
    palabrasClave: [],
    normas: [],
    estado: "en_curso",
    fechaIngreso: iso(lunes, -3),
    ...x
  });

  const investigaciones: Investigacion[] = [
    inv({ id: "DEMO-001", area: "Economía", investigador: "Investigador Economía 1", materia: "IA, empleo y productividad", tipo: "comision", solicitante: "Comisión de Trabajo y Previsión Social", comision: "Comisión de Trabajo y Previsión Social", palabrasClave: ["inteligencia artificial", "empleo", "productividad", "automatización"], fechaIngreso: iso(lunes, -4) }),
    inv({ id: "DEMO-002", area: "Legal", investigador: "Investigador Legal 1", materia: "IA y derechos fundamentales", tipo: "parlamentario", solicitante: "Parlamentario (demo)", palabrasClave: ["inteligencia artificial", "sesgos", "privacidad", "transparencia", "responsabilidad"], fechaIngreso: iso(lunes, -2) }),
    inv({ id: "DEMO-003", area: "Políticas Sociales", investigador: "Investigador Pol. Sociales 1", materia: "IA en la sala de clases", comision: "Comisión de Educación", solicitante: "Comisión de Educación", palabrasClave: ["inteligencia artificial", "educación", "estudiantes", "evaluación"], fechaIngreso: iso(lunes, -1) }),
    inv({ id: "DEMO-004", area: "Ciencia y Recursos Naturales", investigador: "Investigador Ciencia 1", materia: "IA para anticipar riesgos ambientales", tipo: "parlamentario", solicitante: "Parlamentario (demo)", palabrasClave: ["inteligencia artificial", "incendios", "sequía", "monitoreo"], fechaIngreso: iso(lunes, 0) }),
    inv({ id: "DEMO-005", area: "Gobierno y Defensa", investigador: "Investigador Defensa 1", materia: "IA y nuevas capacidades de defensa", comision: "Comisión de Defensa Nacional", solicitante: "Comisión de Defensa Nacional", palabrasClave: ["inteligencia artificial", "defensa", "sistemas autónomos", "ciberdefensa"], fechaIngreso: iso(lunes, 0) }),

    inv({ id: "DEMO-006", area: "Políticas Sociales", investigador: "Investigador Pol. Sociales 2", materia: "Protección de niños, niñas y adolescentes en plataformas digitales", comision: "Comisión de Familia", solicitante: "Comisión de Familia", palabrasClave: ["plataformas digitales", "niños y adolescentes", "protección", "derechos"], fechaIngreso: iso(lunes, -1) }),
    inv({ id: "DEMO-007", area: "Legal", investigador: "Investigador Legal 2", materia: "Retiro de contenidos y responsabilidad de plataformas digitales", tipo: "parlamentario", solicitante: "Parlamentario (demo)", palabrasClave: ["plataformas digitales", "retiro de contenidos", "responsabilidad", "jurisprudencia", "derechos"], fechaIngreso: iso(lunes, 0) }),

    inv({ id: "DEMO-008", area: "Legal", investigador: "Investigador Legal 3", materia: "Regulación de plataformas digitales (primer trámite)", boletines: ["18456-7"], comision: "Comisión de Educación (Cámara)", solicitante: "Comisión de Educación (Cámara)", palabrasClave: ["plataformas digitales", "regulación"], estado: "entregada", fechaIngreso: iso(lunes, -150), fechaEntrega: iso(lunes, -120), etapa: "Primer trámite · Cámara · Comisión de Educación" }),
    inv({ id: "DEMO-009", area: "Políticas Sociales", investigador: "Investigador Pol. Sociales 3", materia: "Regulación de plataformas digitales (segundo trámite)", boletines: ["18456-7"], comision: "Comisión de Cultura (Senado)", solicitante: "Comisión de Cultura (Senado)", palabrasClave: ["plataformas digitales", "regulación"], fechaIngreso: iso(lunes, -2), etapa: "Segundo trámite · Senado · Comisión de Cultura" }),

    inv({ id: "DEMO-010", area: "Economía", investigador: "Investigador Economía 2", materia: "Costo fiscal de la sala cuna universal", boletines: ["14782-13"], comision: "Comisión de Hacienda", solicitante: "Comisión de Hacienda", palabrasClave: ["sala cuna", "costo fiscal", "cuidado infantil"], fechaIngreso: iso(lunes, -1) }),
    inv({ id: "DEMO-011", area: "Legal", investigador: "Investigador Legal 4", materia: "Teletrabajo y cuidados: derecho comparado", boletines: ["16621-13"], comision: "Comisión de Trabajo y Previsión Social", solicitante: "Comisión de Trabajo y Previsión Social", palabrasClave: ["teletrabajo", "cuidados", "conciliación"], fechaIngreso: iso(lunes, -2) }),
    inv({ id: "DEMO-012", area: "Ciencia y Recursos Naturales", investigador: "Investigador Ciencia 2", materia: "Gestión del recurso hídrico en zonas de sequía", tipo: "parlamentario", solicitante: "Parlamentario (demo)", palabrasClave: ["recursos hídricos", "sequía", "gestión del agua"], estado: "entregada", fechaIngreso: iso(lunes, -30), fechaEntrega: iso(lunes, -10) })
  ];

  const asignaciones: Asignacion[] = [
    { investigador: "Investigador Pol. Sociales 4", area: "Políticas Sociales", comision: "Comisión de Familia" },
    { investigador: "Investigador Legal 3", area: "Legal", comision: "Comisión de Educación (Cámara)" },
    { investigador: "Investigador Pol. Sociales 3", area: "Políticas Sociales", comision: "Comisión de Cultura (Senado)" },
    { investigador: "Investigador Economía 3", area: "Economía", comision: "Comisión de Hacienda" }
  ];

  return { investigaciones, asignaciones };
}

// ---------------------------------------------------------------------------
// Lectura/validación de CSV y JSON
// ---------------------------------------------------------------------------

const lista = (v: unknown): string[] =>
  String(v ?? "")
    .split(/[;|]/)
    .map((x) => x.trim())
    .filter(Boolean);

function aEstado(v: unknown): EstadoInvestigacion {
  const s = norm(String(v ?? ""));
  if (s.startsWith("entreg") || s === "cerrada" || s === "finalizada") return "entregada";
  if (s.startsWith("archiv")) return "archivada";
  return "en_curso";
}

function aFechaIso(v: unknown): string | undefined {
  const s = String(v ?? "").trim();
  if (!s) return undefined;
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

export interface ResultadoImportacion<T> {
  registros: T[];
  rechazados: Array<{ fila: number; motivo: string }>;
}

export function parsearInvestigacionesCsv(texto: string): ResultadoImportacion<Investigacion> {
  const parsed = Papa.parse<Record<string, string>>(texto.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => norm(h).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
  });
  const registros: Investigacion[] = [];
  const rechazados: Array<{ fila: number; motivo: string }> = [];
  parsed.data.forEach((r, idx) => {
    const fila = idx + 2;
    const id = (r.id || r.id_pedido || r.pedido || "").trim();
    const area = (r.area || "").trim();
    const materia = (r.materia || r.titulo || "").trim();
    if (!id || !area || !materia) {
      rechazados.push({ fila, motivo: "Faltan campos obligatorios (id, area, materia)." });
      return;
    }
    registros.push({
      id,
      area,
      investigador: (r.investigador || "").trim() || "(sin asignar)",
      tipo: norm(r.tipo || "").startsWith("parl") ? "parlamentario" : "comision",
      solicitante: (r.solicitante || r.comision || "").trim(),
      comision: (r.comision || "").trim() || undefined,
      boletines: lista(r.boletines || r.boletin).map(normalizarBoletin),
      materia,
      descripcion: (r.descripcion || "").trim() || undefined,
      palabrasClave: lista(r.palabras_clave || r.palabrasclave),
      normas: lista(r.normas),
      estado: aEstado(r.estado),
      fechaIngreso: aFechaIso(r.fecha_ingreso || r.ingreso) || new Date().toISOString().slice(0, 10),
      fechaEntrega: aFechaIso(r.fecha_entrega || r.entrega),
      etapa: (r.etapa || "").trim() || undefined
    });
  });
  return { registros, rechazados };
}

export function parsearAsignacionesCsv(texto: string): ResultadoImportacion<Asignacion> {
  const parsed = Papa.parse<Record<string, string>>(texto.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => norm(h).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
  });
  const registros: Asignacion[] = [];
  const rechazados: Array<{ fila: number; motivo: string }> = [];
  parsed.data.forEach((r, idx) => {
    const investigador = (r.investigador || "").trim();
    const comision = (r.comision || "").trim();
    if (!investigador || !comision) {
      rechazados.push({ fila: idx + 2, motivo: "Faltan campos obligatorios (investigador, comision)." });
      return;
    }
    registros.push({ investigador, area: (r.area || "").trim(), comision });
  });
  return { registros, rechazados };
}

function sanear(inv: Investigacion): Investigacion {
  return {
    ...inv,
    boletines: (inv.boletines || []).map(normalizarBoletin),
    palabrasClave: inv.palabrasClave || [],
    normas: inv.normas || [],
    estado: inv.estado || "en_curso",
    tipo: inv.tipo === "parlamentario" ? "parlamentario" : "comision",
    solicitante: inv.solicitante || ""
  };
}

// ---------------------------------------------------------------------------
// Almacén (memoria + disco opcional) y proveedores de datos
// ---------------------------------------------------------------------------

let memoria: DatosPizarra | null = null;
let fuenteMemoria: InfoFuente | null = null;
let archivoCache: { mtime: number; datos: DatosPizarra } | null = null;

function dirDatos(): string | null {
  return process.env.PIZARRA_DATA_DIR ? path.resolve(process.env.PIZARRA_DATA_DIR) : null;
}

function leerDisco(): DatosPizarra | null {
  const dir = dirDatos();
  if (!dir) return null;
  try {
    const f = path.join(dir, "pizarra.json");
    if (!fs.existsSync(f)) return null;
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    return { investigaciones: (j.investigaciones || []).map(sanear), asignaciones: j.asignaciones || [] };
  } catch {
    return null;
  }
}

function escribirDisco(datos: DatosPizarra): boolean {
  const dir = dirDatos();
  if (!dir) return false;
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "pizarra.json"), JSON.stringify(datos, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

function leerArchivoConfigurado(): DatosPizarra | null {
  const ruta = process.env.PIZARRA_ARCHIVO;
  if (!ruta) return null;
  try {
    const abs = path.resolve(ruta);
    const mtime = fs.statSync(abs).mtimeMs;
    if (archivoCache && archivoCache.mtime === mtime) return archivoCache.datos;
    const texto = fs.readFileSync(abs, "utf8");
    let datos: DatosPizarra;
    if (abs.toLowerCase().endsWith(".json")) {
      const j = JSON.parse(texto);
      datos = Array.isArray(j)
        ? { investigaciones: j.map(sanear), asignaciones: [] }
        : { investigaciones: (j.investigaciones || []).map(sanear), asignaciones: j.asignaciones || [] };
    } else {
      datos = { investigaciones: parsearInvestigacionesCsv(texto).registros, asignaciones: [] };
      const rutaAsig = process.env.PIZARRA_ASIGNACIONES_ARCHIVO;
      if (rutaAsig && fs.existsSync(path.resolve(rutaAsig))) {
        datos.asignaciones = parsearAsignacionesCsv(fs.readFileSync(path.resolve(rutaAsig), "utf8")).registros;
      }
    }
    archivoCache = { mtime, datos };
    return datos;
  } catch (e) {
    console.warn("[Pizarra] No se pudo leer PIZARRA_ARCHIVO:", (e as Error).message);
    return null;
  }
}

/** Entrega los datos vigentes según la fuente configurada. */
export function obtenerDatos(): { datos: DatosPizarra; fuente: InfoFuente } {
  const modo = (process.env.PIZARRA_FUENTE || "demo").toLowerCase();
  const ahora = new Date().toISOString();

  if (modo === "archivo") {
    const datos = leerArchivoConfigurado();
    if (datos) {
      return { datos, fuente: { tipo: "archivo", nombre: `Archivo del servidor (${path.basename(process.env.PIZARRA_ARCHIVO || "")})`, demo: false, persistente: true, actualizado: ahora } };
    }
  }

  // Importación manual guardada (disco) o en memoria; si no hay nada, demostración.
  const guardado = memoria || leerDisco();
  if (guardado && guardado.investigaciones.length > 0) {
    memoria = guardado;
    return {
      datos: guardado,
      fuente: { tipo: "archivo", nombre: "Importación manual", demo: false, persistente: !!dirDatos(), actualizado: fuenteMemoria?.actualizado || ahora }
    };
  }
  return { datos: datosDemo(), fuente: { tipo: "demo", nombre: "Datos de demostración (ficticios)", demo: true, persistente: false, actualizado: ahora } };
}

export function guardarImportacion(
  nuevos: { investigaciones?: Investigacion[]; asignaciones?: Asignacion[] },
  modo: "reemplazar" | "agregar"
): { total: number; asignaciones: number; persistido: boolean } {
  let base: DatosPizarra = { investigaciones: [], asignaciones: [] };
  if (modo === "agregar") {
    const actual = obtenerDatos();
    if (!actual.fuente.demo) base = actual.datos;
  }
  const porId = new Map(base.investigaciones.map((i) => [i.id, i]));
  for (const i of nuevos.investigaciones || []) porId.set(i.id, sanear(i));
  const asig = nuevos.asignaciones && nuevos.asignaciones.length > 0 ? nuevos.asignaciones : base.asignaciones;
  memoria = { investigaciones: [...porId.values()], asignaciones: asig };
  fuenteMemoria = { tipo: "archivo", nombre: "Importación manual", demo: false, persistente: !!dirDatos(), actualizado: new Date().toISOString() };
  const persistido = escribirDisco(memoria);
  return { total: memoria.investigaciones.length, asignaciones: memoria.asignaciones.length, persistido };
}

export function restablecerDemo(): void {
  memoria = null;
  fuenteMemoria = null;
  const dir = dirDatos();
  if (dir) {
    try { fs.rmSync(path.join(dir, "pizarra.json"), { force: true }); } catch {}
  }
}

export const PLANTILLA_CSV =
  "id;area;investigador;tipo;solicitante;comision;boletines;materia;descripcion;palabras_clave;normas;estado;fecha_ingreso;fecha_entrega;etapa\n" +
  "P-0001;Legal;Nombre Apellido;comision;Comisión de Familia;Comisión de Familia;18456-7;Regulación de plataformas digitales;Descripción breve;plataformas digitales|niños y adolescentes;Ley 21.719;en_curso;2026-09-28;;Primer trámite · Cámara\n";

// ---------------------------------------------------------------------------
// Detección de conexiones
// ---------------------------------------------------------------------------

export interface Conexion {
  id: string;
  tipo: "cruce" | "continuidad" | "coordinacion";
  titulo: string;
  mensaje: string;
  motivo: string;
  investigaciones: string[];
}

function enMarcha(i: Investigacion) {
  return i.estado === "en_curso";
}

export function detectarConexiones(
  datos: DatosPizarra,
  agenda: { boletines: Set<string>; porBoletin: Map<string, string[]> }
): { cruces: Conexion[]; continuidad: Conexion[]; coordinacion: Conexion[] } {
  const activas = datos.investigaciones.filter(enMarcha);
  const term = new Map(datos.investigaciones.map((i) => [i.id, terminos(i)]));

  // --- Coordinación: requerimientos distintos, trabajos activos, insumos comunes ---
  const coordinacion: Conexion[] = [];
  const paresFuertes = new Set<string>();
  for (let a = 0; a < activas.length; a++) {
    for (let b = a + 1; b < activas.length; b++) {
      const A = activas[a], B = activas[b];
      if (A.id === B.id) continue;
      const ta = term.get(A.id)!, tb = term.get(B.id)!;
      const compBol = A.boletines.filter((x) => B.boletines.includes(x));
      const compNor = A.normas.map(normalizarNorma).filter((x) => B.normas.map(normalizarNorma).includes(x));
      const compTerm = compartidos(ta, tb);
      const jac = jaccard(ta, tb);
      // Mismo boletín en comisiones/etapas distintas se trata como continuidad, no coordinación.
      const mismoBoletinMismaEtapa = compBol.length > 0 && (A.comision || "") === (B.comision || "");
      const fuerte = mismoBoletinMismaEtapa || compNor.length > 0 || (compBol.length === 0 && (compTerm.length >= 3 || (compTerm.length >= 2 && jac >= 0.3)));
      if (!fuerte) continue;
      if (A.investigador === B.investigador && A.area === B.area) continue;
      paresFuertes.add([A.id, B.id].sort().join("|"));
      const motivos: string[] = [];
      if (compBol.length) motivos.push(`mismo boletín ${compBol.join(", ")}`);
      if (compNor.length) motivos.push(`norma(s) común(es): ${compNor.join(", ")}`);
      if (compTerm.length) motivos.push(`materia compartida: ${compTerm.slice(0, 5).join(", ")}`);
      coordinacion.push({
        id: `coord-${A.id}-${B.id}`,
        tipo: "coordinacion",
        titulo: `${A.area} ↔ ${B.area}`,
        mensaje: "Esto también se está trabajando ahora. Conéctense.",
        motivo: motivos.join(" · "),
        investigaciones: [A.id, B.id]
      });
    }
  }

  // --- Coordinación: informe destinado a una comisión que sigue otro investigador de ATP ---
  for (const inv of activas) {
    if (!inv.comision) continue;
    const seguidores = datos.asignaciones.filter(
      (s) => norm(s.comision) === norm(inv.comision!) && norm(s.investigador) !== norm(inv.investigador)
    );
    for (const s of seguidores) {
      coordinacion.push({
        id: `com-${inv.id}-${norm(s.investigador).replace(/\s+/g, "-")}`,
        tipo: "coordinacion",
        titulo: `Informe para ${inv.comision}`,
        mensaje: `${s.investigador} (${s.area || "ATP"}) acompaña esta comisión y quizá no sabe que se está elaborando este trabajo.`,
        motivo: `Pedido ${inv.id} de ${inv.area} destinado a una comisión que sigue otro investigador`,
        investigaciones: [inv.id]
      });
    }
  }

  // --- Continuidad: el mismo proyecto aparece en otra etapa/comisión y ya fue trabajado ---
  const continuidad: Conexion[] = [];
  const porBoletin = new Map<string, Investigacion[]>();
  for (const i of datos.investigaciones) for (const b of i.boletines) porBoletin.set(b, [...(porBoletin.get(b) || []), i]);
  for (const [bol, lista] of porBoletin) {
    const ordenadas = [...lista].sort((x, y) => x.fechaIngreso.localeCompare(y.fechaIngreso));
    for (let k = 1; k < ordenadas.length; k++) {
      const nueva = ordenadas[k];
      const previas = ordenadas.slice(0, k).filter((p) => (p.comision || "") !== (nueva.comision || ""));
      if (previas.length === 0) continue;
      continuidad.push({
        id: `cont-${bol}-${nueva.id}`,
        tipo: "continuidad",
        titulo: `Boletín ${bol}`,
        mensaje: "Ojo: este proyecto ya fue trabajado antes por ATP; no partas de cero.",
        motivo: `Antes: ${previas.map((p) => `${p.area} (${p.etapa || p.comision || "etapa previa"})`).join("; ")} → Ahora: ${nueva.etapa || nueva.comision || "nueva etapa"}`,
        investigaciones: [...previas.map((p) => p.id), nueva.id]
      });
    }
  }
  // Boletines que esta semana están en tabla de una comisión distinta a las ya trabajadas por ATP.
  for (const bol of agenda.boletines) {
    const previas = porBoletin.get(bol);
    if (!previas || previas.length === 0) continue;
    const comisionesAgenda = agenda.porBoletin.get(bol) || [];
    const yaCubierto = continuidad.some((c) => c.id.startsWith(`cont-${bol}-`));
    const comisionesATP = new Set(previas.map((p) => norm(p.comision || "")));
    const nuevaComision = comisionesAgenda.find((c) => !comisionesATP.has(norm(c)));
    if (yaCubierto || !nuevaComision) continue;
    continuidad.push({
      id: `cont-agenda-${bol}`,
      tipo: "continuidad",
      titulo: `Boletín ${bol} en tabla esta semana`,
      mensaje: "Este proyecto está en discusión en una comisión nueva y ATP ya tiene trabajo previo sobre él.",
      motivo: `En tabla: ${nuevaComision}. Trabajo previo: ${previas.map((p) => `${p.area} (${p.id})`).join("; ")}`,
      investigaciones: previas.map((p) => p.id)
    });
  }

  // --- Cruces temáticos: grupos de ≥2 áreas distintas sobre una misma temática ---
  const padre = new Map<string, string>(activas.map((i) => [i.id, i.id]));
  const raizDe = (x: string): string => {
    let r = x;
    while (padre.get(r) !== r) r = padre.get(r)!;
    return r;
  };
  const unidos = new Set<string>();
  for (let a = 0; a < activas.length; a++) {
    for (let b = a + 1; b < activas.length; b++) {
      const A = activas[a], B = activas[b];
      if (A.area === B.area) continue;
      const comp = compartidos(term.get(A.id)!, term.get(B.id)!);
      if (comp.length >= 2 || jaccard(term.get(A.id)!, term.get(B.id)!) >= 0.2) {
        padre.set(raizDe(A.id), raizDe(B.id));
        unidos.add(A.id);
        unidos.add(B.id);
      }
    }
  }
  const grupos = new Map<string, Investigacion[]>();
  for (const i of activas) {
    if (!unidos.has(i.id)) continue;
    const r = raizDe(i.id);
    grupos.set(r, [...(grupos.get(r) || []), i]);
  }
  const cruces: Conexion[] = [];
  for (const [, miembros] of grupos) {
    const areas = new Set(miembros.map((m) => m.area));
    if (areas.size < 2) continue;
    // Términos presentes en la mayoría de los miembros = la temática común.
    const cuenta = new Map<string, number>();
    for (const m of miembros) for (const t of term.get(m.id)!) cuenta.set(t, (cuenta.get(t) || 0) + 1);
    const comunes = [...cuenta.entries()].filter(([, n]) => n >= Math.max(2, Math.ceil(miembros.length / 2))).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    cruces.push({
      id: `cruce-${miembros.map((m) => m.id).sort().join("-")}`,
      tipo: "cruce",
      titulo: comunes.slice(0, 3).join(" · ") || "Temática común",
      mensaje: "Distintas áreas investigan materias relacionadas. ¿Qué conocimiento podemos compartir?",
      motivo: `${areas.size} áreas: ${[...areas].join(", ")}`,
      investigaciones: miembros.map((m) => m.id)
    });
  }

  // Un par ya señalado como coordinación no se repite dentro de un cruce de solo 2 trabajos.
  const crucesFiltrados = cruces.filter((c) => !(c.investigaciones.length === 2 && paresFuertes.has([...c.investigaciones].sort().join("|"))));

  return { cruces: crucesFiltrados, continuidad, coordinacion };
}

export function enmascarar(inv: Investigacion): Investigacion {
  if (process.env.PIZARRA_OCULTAR_SOLICITANTE === "true" && inv.tipo === "parlamentario") {
    return { ...inv, solicitante: "Parlamentario (reservado)" };
  }
  return inv;
}
