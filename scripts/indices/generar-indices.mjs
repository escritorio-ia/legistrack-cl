/**
 * Genera índices livianos (número, título, fecha y enlace oficial) de fuentes que solo
 * publican descargas masivas. Lo ejecuta la acción .github/workflows/indices-leyes.yml.
 *   node scripts/indices/generar-indices.mjs [noruega] [argentina]
 * Reglas: solo datos tal como vienen de la fuente oficial; si una fuente falla o entrega
 * menos registros de lo esperable, NO se sobrescribe su índice y el proceso termina con error.
 */
import { execFileSync } from "node:child_process";
import { createReadStream, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SALIDA = join(process.cwd(), "server", "data", "indices");
const UA = "LegisTrackCL/1.0 (indice de fuentes oficiales)";

async function descargar(url, destino) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
  writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
  return statSync(destino).size;
}
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const texto = (s = "") => s.replace(/<[^>]+>/g, " ").replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e] ?? m).replace(/\s+/g, " ").trim();
const archivos = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? archivos(join(dir, d.name)) : [join(dir, d.name)]));
function guardar(nombre, datos) {
  writeFileSync(join(SALIDA, `${nombre}.json`), JSON.stringify(datos) + "\n");
  console.log(`${nombre}: ${datos.total} leyes`);
}

// --- Noruega: Lovdata, "Gjeldende lover" (leyes vigentes consolidadas) ---------------------
export function leyNoruega(html) {
  const dd = (c) => texto((html.match(new RegExp(`<dd class="${c}"[^>]*>([\\s\\S]*?)</dd>`)) || [])[1] || "");
  const dokid = dd("dokid");
  const m = dokid.match(/^NL\/lov\/(\d{4}-\d{2}-\d{2})-(\d+)$/);
  const titulo = dd("title") || texto((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
  if (!dokid || !titulo) return null;
  return { id: dokid, titulo, corto: dd("titleShort") || undefined, fecha: m ? m[1] : undefined, ministerio: dd("ministry") || undefined, ultimaModificacion: dd("lastChangeInForce") || undefined, url: `https://lovdata.no/dokument/${dokid}` };
}
async function noruega() {
  const tmp = mkdtempSync(join(tmpdir(), "lovdata-"));
  const url = "https://api.lovdata.no/v1/publicData/get/gjeldende-lover.tar.bz2";
  await descargar(url, join(tmp, "l.tar.bz2"));
  execFileSync("tar", ["-xjf", join(tmp, "l.tar.bz2"), "-C", tmp]);
  const leyes = archivos(tmp).filter((f) => f.endsWith(".xml")).map((f) => leyNoruega(readFileSync(f, "utf8"))).filter(Boolean);
  if (leyes.length < 300) throw new Error(`Noruega: solo ${leyes.length} leyes (se esperaban más de 300)`);
  leyes.sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
  guardar("noruega", { fuente: "Lovdata — Gjeldende lover (datos públicos, licencia NLOD 2.0)", url, generado: new Date().toISOString(), total: leyes.length, leyes });
}

// --- Argentina: InfoLEG, Base de normativa nacional (datos.jus.gob.ar) ---------------------
/** Parser CSV en flujo (comillas dobles, saltos de línea dentro de campos). Llama a fila(campos). */
export async function leerCsv(ruta, fila) {
  let campo = "", campos = [], comillas = false, previa = "";
  for await (const trozo of createReadStream(ruta, { encoding: "utf8" })) {
    for (const c of trozo) {
      if (comillas) {
        if (c === '"') comillas = false; else campo += c;
      } else if (c === '"') { if (previa === '"') campo += '"'; comillas = true; }
      else if (c === ",") { campos.push(campo); campo = ""; }
      else if (c === "\n") { campos.push(campo.replace(/\r$/, "")); fila(campos); campos = []; campo = ""; }
      else campo += c;
      previa = c;
    }
  }
  if (campo || campos.length) { campos.push(campo); fila(campos); }
}
async function argentina() {
  const tmp = mkdtempSync(join(tmpdir(), "infoleg-"));
  const url = "https://datos.jus.gob.ar/dataset/d9a963ea-8b1d-4ca3-9dd9-07a4773e8c23/resource/bf0ec116-ad4e-4572-a476-e57167a84403/download/base-infoleg-normativa-nacional.zip";
  await descargar(url, join(tmp, "b.zip"));
  execFileSync("unzip", ["-q", "-o", join(tmp, "b.zip"), "-d", tmp]);
  const csv = archivos(tmp).find((f) => f.toLowerCase().endsWith(".csv"));
  if (!csv) throw new Error("Argentina: el ZIP no trae un CSV");
  let idx = null;
  const leyes = [];
  await leerCsv(csv, (c) => {
    if (!idx) {
      const h = c.map((x) => x.replace(/^﻿/, "").trim().toLowerCase());
      const col = (n) => h.indexOf(n);
      idx = { id: col("id_norma"), tipo: col("tipo_norma"), num: col("numero_norma"), fecha: col("fecha_sancion"), sumario: col("titulo_sumario"), resumido: col("titulo_resumido"), texto: col("texto_resumido") };
      const faltan = ["id", "tipo", "num", "fecha"].filter((k) => idx[k] < 0);
      if (faltan.length || (idx.sumario < 0 && idx.resumido < 0)) throw new Error(`Argentina: el CSV cambió de columnas (faltan ${faltan.join(", ") || "título"}). Encabezado: ${h.join("|")}`);
      return;
    }
    if (String(c[idx.tipo] || "").trim().toLowerCase() !== "ley") return;
    const id = String(c[idx.id] || "").trim();
    const titulo = texto([c[idx.resumido], c[idx.sumario]].filter(Boolean).join(" — "));
    if (!/^\d+$/.test(id) || !titulo) return;
    const resumen = idx.texto >= 0 ? texto(c[idx.texto] || "").slice(0, 300) : "";
    leyes.push({ id, numero: String(c[idx.num] || "").trim(), fecha: String(c[idx.fecha] || "").trim().slice(0, 10) || undefined, titulo, resumen: resumen || undefined, url: `https://servicios.infoleg.gob.ar/infolegInternet/verNorma.do?id=${id}` });
  });
  if (leyes.length < 5000) throw new Error(`Argentina: solo ${leyes.length} leyes (se esperaban más de 5.000)`);
  leyes.sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
  guardar("argentina", { fuente: "InfoLEG — Base de normativa nacional (Ministerio de Justicia, datos abiertos)", url, generado: new Date().toISOString(), total: leyes.length, leyes });
}

// --- Croacia: Narodne novine, API ELI (metadatos por acto; límite oficial 3 consultas/s) -----
// No hay búsqueda por texto: se recorren ediciones y actos y se guardan solo las leyes (ZAKON).
// Es incremental: guarda las ediciones ya procesadas y, si se acaba el tiempo, sigue en la próxima ejecución.
const NN = "https://narodne-novine.nn.hr/api";
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
async function nn(ruta, cuerpo) {
  for (let intento = 1; intento <= 3; intento++) {
    await pausa(450); // < 3 consultas por segundo
    const r = await fetch(`${NN}/${ruta}`, cuerpo ? { method: "POST", headers: { "Content-Type": "application/json", "User-Agent": UA }, body: JSON.stringify(cuerpo) } : { headers: { "User-Agent": UA } });
    if (r.ok) return r.json();
    if (intento === 3) throw new Error(`HTTP ${r.status} en ${ruta}`);
    await pausa(3000 * intento);
  }
}
const ELI = "http://data.europa.eu/eli/ontology#";
export function leyCroacia(jsonld, anio, numero, acto) {
  const nodos = (Array.isArray(jsonld) ? jsonld : []).filter((n) => Array.isArray(n?.["@type"]));
  const res = nodos.find((n) => n["@type"].some((t) => t.endsWith("LegalResource")));
  const exp = nodos.find((n) => n["@type"].some((t) => t.endsWith("LegalExpression")));
  const tipo = String(res?.[`${ELI}type_document`]?.[0]?.["@id"] || "").split("/").pop();
  const titulo = String(exp?.[`${ELI}title`]?.[0]?.["@value"] || "").replace(/\s+/g, " ").trim();
  if (!/^(ZAKON|USTAVNI_ZAKON)/.test(tipo) || !titulo) return null;
  return { id: `${anio}/${numero}/${acto}`, titulo, tipo, fecha: res?.[`${ELI}date_document`]?.[0]?.["@value"] || undefined, publicada: res?.[`${ELI}date_publication`]?.[0]?.["@value"] || undefined, url: `https://narodne-novine.nn.hr/eli/sluzbeni/${anio}/${numero}/${acto}` };
}
async function croacia() {
  const archivo = join(SALIDA, "croacia.json");
  let previo = { leyes: [], procesadas: [] };
  try { previo = JSON.parse(readFileSync(archivo, "utf8")); } catch {}
  const procesadas = new Set(previo.procesadas || []);
  const leyes = new Map((previo.leyes || []).map((l) => [l.id, l]));
  const limite = Date.now() + Number(process.env.CROACIA_MINUTOS || 300) * 60000;
  const anios = (await nn("index")).filter((a) => Number.isInteger(a)).sort((a, b) => b - a);
  let completo = true, nuevas = 0, errores = 0;
  fuera: for (const anio of anios) {
    const ediciones = (await nn("editions", { part: "SL", year: anio })).filter((e) => Number.isInteger(e)).sort((a, b) => b - a);
    for (const numero of ediciones) {
      const clave = `${anio}/${numero}`;
      if (procesadas.has(clave)) continue;
      if (Date.now() > limite) { completo = false; break fuera; }
      try {
        const actos = await nn("acts", { part: "SL", year: anio, number: numero });
        for (const acto of actos) {
          const ley = leyCroacia(await nn("act", { part: "SL", year: anio, number: numero, act_num: String(acto), format: "JSON-LD" }), anio, numero, acto);
          if (ley) leyes.set(ley.id, ley);
        }
        procesadas.add(clave); nuevas++;
      } catch (e) { errores++; console.error(`Croacia ${clave}: ${e.message} (se reintenta en la próxima ejecución)`); }
    }
  }
  const lista = [...leyes.values()].sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
  if (!lista.length) throw new Error("Croacia: no se obtuvo ninguna ley");
  const total = anios.length;
  writeFileSync(archivo, JSON.stringify({ fuente: "Narodne novine — API ELI (leyes publicadas en la parte oficial)", url: NN, generado: new Date().toISOString(), completo: completo && errores === 0, aniosDisponibles: [anios.at(-1), anios[0]], total: lista.length, leyes: lista, procesadas: [...procesadas].sort() }) + "\n");
  console.log(`croacia: ${lista.length} leyes, ${nuevas} ediciones nuevas, ${errores} con error, ${completo ? "recorrido completo" : "continúa en la próxima ejecución"} (${total} años)`);
}

const pedidas = process.argv.slice(2);
const tareas = { noruega, argentina, croacia };
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  let error = false;
  for (const [n, f] of Object.entries(tareas)) {
    if (pedidas.length && !pedidas.includes(n)) continue;
    try { await f(); } catch (e) { error = true; console.error(`ERROR ${n}: ${e.message}`); }
  }
  process.exit(error ? 1 : 0);
}
