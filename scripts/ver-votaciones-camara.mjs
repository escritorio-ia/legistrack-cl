// Guarda la respuesta original de los servicios de votaciones de la Cámara (opendata.camara.cl)
// en scripts/votaciones-crudo.txt, para revisar su estructura. Solo lectura.
// Uso:  node scripts/ver-votaciones-camara.mjs
import { writeFileSync } from "node:fs";

const WS = "https://opendata.camara.cl/camaradiputados/WServices/WSLegislativo.asmx";
const salida = [];

async function guardar(titulo, url, max = 6000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    const texto = await res.text();
    salida.push(`===== ${titulo} (HTTP ${res.status}, ${texto.length} caracteres)\n${texto.slice(0, max)}\n`);
    return texto;
  } catch (e) {
    salida.push(`===== ${titulo}: ERROR ${e.message}\n`);
    return "";
  } finally {
    writeFileSync(new URL("./votaciones-crudo.txt", import.meta.url), salida.join("\n"), "utf8");
  }
}

await guardar("Votaciones por proyecto 16777-07", `${WS}/retornarVotacionesXProyectoLey?prmNumeroBoletin=16777-07`);
const anio = await guardar("Votaciones 2026 (inicio)", `${WS}/retornarVotacionesXAnno?prmAnno=2026`, 3000);
const id = (anio.match(/<Id>(\d+)<\/Id>/) || [])[1];
if (id) await guardar(`Detalle votación ${id}`, `${WS}/retornarVotacionDetalle?prmVotacionId=${id}`, 6000);
salida.push("===== FIN");
writeFileSync(new URL("./votaciones-crudo.txt", import.meta.url), salida.join("\n"), "utf8");
console.log("Listo: scripts/votaciones-crudo.txt");
