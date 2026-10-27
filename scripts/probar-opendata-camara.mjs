// Prueba de la API oficial de Datos Abiertos de la Cámara (opendata.camara.cl).
// Uso:  node scripts/probar-opendata-camara.mjs
// Solo consultas GET de lectura.

import { writeFileSync } from "node:fs";

const WS = "https://opendata.camara.cl/camaradiputados/WServices";

// Todo lo que se imprime también queda en scripts/resultado-opendata.txt
const lineas = [];
const logOriginal = console.log;
console.log = (...args) => {
  const texto = args.join(" ");
  lineas.push(texto);
  writeFileSync(new URL("./resultado-opendata.txt", import.meta.url), lineas.join("\n"), "utf8");
  logOriginal(...args);
};

async function get(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "LegisTrackCL/1.0 (datos abiertos)" },
      signal: AbortSignal.timeout(25000)
    });
    return { status: res.status, texto: await res.text() };
  } catch (e) {
    return { status: 0, texto: "ERROR " + e.message };
  }
}
const tag = (xml, t) => (xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1]?.trim() || "";
const corto = (s, n = 400) => s.replace(/\s+/g, " ").slice(0, n);

// 1) Períodos legislativos
const per = await get(`${WS}/WSLegislativo.asmx/retornarPeriodosLegislativos`);
const periodos = [...per.texto.matchAll(/<PeriodoLegislativo>([\s\S]*?)<\/PeriodoLegislativo>/g)].map(m => ({
  id: tag(m[1], "Id"), nombre: tag(m[1], "Nombre"), inicio: tag(m[1], "FechaInicio"), fin: tag(m[1], "FechaTermino")
}));
console.log(`Períodos (HTTP ${per.status}):`, periodos.slice(-3).map(p => `${p.id} ${p.nombre} ${p.inicio}→${p.fin}`).join(" | ") || corto(per.texto));

// 2) Comisiones del período más reciente (y el anterior)
let comisiones = [];
for (const p of periodos.slice(-2).reverse()) {
  const r = await get(`${WS}/WSComision.asmx/retornarComisionesXPeriodo?prmPeriodoLegislativoId=${p.id}`);
  const lista = [...r.texto.matchAll(/<Comision>([\s\S]*?)<\/Comision>/g)].map(m => ({ id: tag(m[1], "Id"), nombre: tag(m[1], "Nombre") }));
  console.log(`\nComisiones del período ${p.id} (HTTP ${r.status}): ${lista.length}`);
  if (lista.length) { comisiones = lista; break; }
  console.log("   Respuesta:", corto(r.texto, 250));
}
for (const c of comisiones) console.log(`  ${c.id}\t${c.nombre}`);

// 3) Sesiones: Salud (411) y algunas del período, varios años
const aProbar = [{ id: "411", nombre: "Salud" }, ...comisiones.filter(c => /trabajo|hacienda|derechos humanos/i.test(c.nombre)).slice(0, 3)];
const anno = new Date().getFullYear();
for (const c of aProbar) {
  for (const a of [anno, anno - 1, anno - 2, anno - 4]) {
    const r = await get(`${WS}/WSComision.asmx/retornarSesionesXComisionYAnno?prmComisionId=${c.id}&prmAnno=${a}`);
    // La etiqueta de cada sesión puede llamarse distinto; se detecta la más repetida.
    const conteo = {};
    for (const m of r.texto.matchAll(/<(\w*Sesion\w*)[\s>]/g)) conteo[m[1]] = (conteo[m[1]] || 0) + 1;
    const etiqueta = Object.entries(conteo).sort((x, y) => y[1] - x[1])[0]?.[0] || "Sesion";
    const sesiones = r.texto.match(new RegExp(`<${etiqueta}[\\s>][\\s\\S]*?</${etiqueta}>`, "g")) || [];
    console.log(`\n== ${c.nombre} (Id ${c.id}), ${a}: HTTP ${r.status}, ${sesiones.length} <${etiqueta}>, ${r.texto.length} caracteres`);
    if (!sesiones.length) console.log("   Respuesta:", corto(r.texto, 300));
    if (sesiones.length) {
      console.log("   Campos:", [...new Set([...sesiones[0].matchAll(/<(\w+)[\s>]/g)].map(m => m[1]))].join(", "));
      console.log("   Ejemplo:", corto(sesiones[sesiones.length - 1], 1500));
      break;
    }
  }
}

// 4) Otros servicios del catálogo de Datos Abiertos que podrían servir a la app
const extra = [
  ["Comisión 411 (detalle)", `${WS}/WSComision.asmx/retornarComision?prmComisionId=411`],
  ["Diputados período actual", `${WS}/WSDiputado.asmx/retornarDiputadosPeriodoActual`],
  ["Sesiones de Sala " + anno, `${WS}/WSSala.asmx/retornarSesionesXAnno?prmAnno=${anno}`],
  ["Votaciones " + anno, `${WS}/WSLegislativo.asmx/retornarVotacionesXAnno?prmAnno=${anno}`],
  ["Proyecto 18754-17", `${WS}/WSLegislativo.asmx/retornarProyectoLey?prmNumeroBoletin=18754-17`],
  ["Votaciones del 18478-13", `${WS}/WSLegislativo.asmx/retornarVotacionesXProyectoLey?prmNumeroBoletin=18478-13`],
  ["Mociones " + anno, `${WS}/WSLegislativo.asmx/retornarMocionesXAnno?prmAnno=${anno}`],
  ["Portal opendata.congreso.cl", "https://opendata.congreso.cl/"]
];
for (const [nombre, url] of extra) {
  const r = await get(url);
  const fechas = [...r.texto.matchAll(/<Fecha\w*>(\d{4}-\d{2}-\d{2})/g)].map(m => m[1]).sort();
  console.log(`\n== ${nombre}: HTTP ${r.status}, ${r.texto.length} caracteres${fechas.length ? `, fechas ${fechas[0]} → ${fechas[fechas.length - 1]}` : ""}`);
  console.log("   ", corto(r.texto, 500));
}

console.log("\n== FIN: prueba completa ==");
