import { test } from "node:test";
import assert from "node:assert/strict";
import { seccionesInforme, tituloDeTramo } from "../server/services/discusionService";

test("título de tramo: toma solo las palabras en mayúsculas del inicio", () => {
  assert.equal(tituloDeTramo("DISCUSIÓN EN GENERAL A.- Presentación del proyecto").titulo, "DISCUSIÓN EN GENERAL");
  assert.equal(tituloDeTramo("TEXTO DEL PROYECTO A continuación, se transcribe").titulo, "TEXTO DEL PROYECTO");
  assert.equal(tituloDeTramo("CONSTANCIAS - Normas de quórum especial: Sí tiene.").titulo, "CONSTANCIAS");
  assert.equal(tituloDeTramo("CONSULTA EXCMA. CORTE SUPREMA Se hace presente").titulo, "CONSULTA EXCMA. CORTE SUPREMA");
  assert.equal(tituloDeTramo("el señor Ministro señaló").titulo, "");
  // Casos vistos en producción (boletín 16.621-05).
  assert.equal(tituloDeTramo("DISCUSIÓN EN particular A.- Análisis previo").titulo, "DISCUSIÓN EN PARTICULAR");
  assert.equal(tituloDeTramo("OBJETIVOS DEL PROYECTO DE LEY ESTABLECIDOS EN EL MENSAJE 1.-FINANCIAMIENTO DE PENSIONES El proyecto").titulo, "OBJETIVOS DEL PROYECTO DE LEY ESTABLECIDOS EN EL MENSAJE");
});

test("secciones del informe: separa por ' - - - ', marca las de debate y omite el índice", () => {
  // Forma real de un informe del Senado (texto ficticio): partes separadas por " - - - " con título en mayúsculas.
  const t = "INFORME DE LA COMISIÓN DE PRUEBA. HONORABLE SENADO: texto inicial. - - - OBJETIVOS DEL PROYECTO Los objetivos son de prueba. - - - ASPECTOS CENTRALES DEL DEBATE El proyecto consta de tres artículos. - - - DISCUSIÓN EN GENERAL A.- Presentación. El señor Ministro (ficticio) expuso. - - - continuó la sesión con más intervenciones. - - - INFORME FINANCIERO El informe N° 1. - - - ÍNDICE OBJETIVOS 1 DISCUSIÓN EN GENERAL 2";
  const s = seccionesInforme(t);
  assert.deepEqual(s.map((x) => x.titulo), ["OBJETIVOS DEL PROYECTO", "ASPECTOS CENTRALES DEL DEBATE", "DISCUSIÓN EN GENERAL", "INFORME FINANCIERO"]);
  assert.deepEqual(s.map((x) => x.esDebate), [false, true, true, false]);
  const disc = s[2];
  assert.ok(disc.extracto!.startsWith("A.- Presentación."));
  assert.ok(t.slice(disc.inicio, disc.inicio + disc.largo).includes("continuó la sesión"), "un tramo sin título continúa la sección anterior");
  assert.equal(s[0].extracto, undefined);
  assert.deepEqual(seccionesInforme("Documento sin separadores ni títulos."), []);
});

test("secciones del informe de la Cámara: títulos con números romanos en secuencia", () => {
  const t = "INFORME DE LA COMISIÓN DE PRUEBA. HONORABLE CÁMARA: texto. Diputado informante: Fulano (ficticio). II.- ANTECEDENTES GENERALES DE LA INICIATIVA: El mensaje señala, según el artículo V.- DE LA LEY, algo. III.- DISCUSIÓN ACERCA DE LAS ENMIENDAS INTRODUCIDAS POR EL H. SENADO. La Subsecretaria (ficticia) explicó. IV.- ACUERDOS ADOPTADOS EN ESTE TRÁMITE En definitiva se aprobó.";
  const s = seccionesInforme(t);
  assert.deepEqual(s.map((x) => x.titulo), ["ANTECEDENTES GENERALES DE LA INICIATIVA", "DISCUSIÓN ACERCA DE LAS ENMIENDAS INTRODUCIDAS POR EL H. SENADO", "ACUERDOS ADOPTADOS EN ESTE TRÁMITE"]);
  assert.deepEqual(s.map((x) => x.esDebate), [false, true, true]);
  assert.ok(s[1].extracto!.startsWith("La Subsecretaria"));
});

test("informe de la Cámara: 'III-TÍTULO' y subtítulos de votación dentro de la síntesis", () => {
  const t = "HONORABLE CÁMARA: texto. I.-CONSTANCIAS REGLAMENTARIAS 1.- Idea matriz. II.- ANTECEDENTES El mensaje. III-SÍNTESIS DE LA DISCUSIÓN EN LA COMISIÓN Y ACUERDOS ADOPTADOS La Comisión recibió al Ministro (ficticio). SE DIO INICIO A LA DISCUSIÓN Y VOTACIÓN DEL ARTÍCULO PRIMERO. Fin de la exposición. VOTACIÓN EN GENERAL En definitiva, fue aprobado. DISCUSIÓN Y VOTACIÓN EN PARTICULAR El señor Fulano (ficticio) mencionó algo.";
  const s = seccionesInforme(t);
  assert.deepEqual(s.map((x) => x.titulo), ["CONSTANCIAS REGLAMENTARIAS", "ANTECEDENTES", "SÍNTESIS DE LA DISCUSIÓN EN LA COMISIÓN Y ACUERDOS ADOPTADOS", "VOTACIÓN EN GENERAL", "DISCUSIÓN Y VOTACIÓN EN PARTICULAR"]);
});
