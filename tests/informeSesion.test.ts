import { test } from "node:test";
import assert from "node:assert/strict";
import { validarInforme, transcripcionParaPrompt, minutoASegundos, informeSesionATexto, categoriaFinal, intervinientes, normalizarInforme, presentacion } from "../src/utils/informeSesion";

const segs = [
  { segundos: 60, orador: "Presidente Sen. Macaya", texto: "Iniciamos el boletín 18702-05." },
  { segundos: 125, orador: "Ministro de Hacienda", texto: "El proyecto propone gradualidad." },
  { segundos: 300, orador: "Sen. Lagos", texto: "Pido que se oficie al Ministerio." },
  { segundos: 3725, orador: "Presidente Sen. Macaya", texto: "Se aprueba en general por unanimidad." },
];

test("transcripción para el modelo y lectura de minutos", () => {
  assert.equal(transcripcionParaPrompt(segs).split("\n")[0], "[1:00] Presidente Sen. Macaya: Iniciamos el boletín 18702-05.");
  assert.equal(minutoASegundos("1:02:05"), 3725);
  assert.equal(minutoASegundos("2:05"), 125);
  assert.ok(Number.isNaN(minutoASegundos("después")));
});

test("validación: descarta lo que no se puede ubicar en la transcripción", () => {
  const raw = {
    resumen: "Se discutió el proyecto.",
    puntos: [{
      numero: 1, titulo: "Presupuestos", boletines: ["18702-05", "99999-01"], sintesis: "Discusión en general.",
      intervenciones: [
        { orador: "Ministro de Hacienda", cargo: "Ministro", institucion: "Hacienda", categoria: "ESP", minuto: "2:05", parrafos: ["Propuso gradualidad.", "Agregó que el costo es acotado."] },
        { orador: "Diputada Inventada", minuto: "2:05", postura: "No existe." },
        { orador: "Sen. Lagos", minuto: "45:00", postura: "Minuto inexistente." },
      ],
      acuerdos: [{ texto: "Aprobado en general por unanimidad", minuto: "1:02:05" }],
      votaciones: [{ texto: "Votación en general", resultado: "Aprobado", minuto: "9:59:00" }],
    }],
    compromisos: [{ texto: "Oficiar al Ministerio", responsable: "Secretaría", minuto: "5:00" }],
    pendientes: ["Votación en particular"],
  };
  const inf = validarInforme(raw, segs, ["18702-05"], false);
  assert.deepEqual(inf.puntos[0].boletines, ["18702-05"]);
  assert.equal(inf.puntos[0].intervenciones.length, 1);
  assert.equal(inf.puntos[0].intervenciones[0].segundos, 125);
  assert.equal(inf.puntos[0].acuerdos.length, 1);
  assert.equal(inf.puntos[0].votaciones.length, 0);
  assert.equal(inf.compromisos.length, 1);
  assert.equal(inf.descartados, 3);
  assert.deepEqual(inf.puntos[0].intervenciones[0].parrafos, ["Propuso gradualidad.", "Agregó que el costo es acotado."]);
  assert.equal(inf.puntos[0].intervenciones[0].categoria, "ESP");
  assert.equal(presentacion(inf.puntos[0].intervenciones[0]), "Ministro de Hacienda, Ministro de Hacienda,");
  const txt = informeSesionATexto(inf, { comision: "Hacienda", fecha: "17-11-2026", videoId: "abc" });
  assert.match(txt, /Propuso gradualidad\.\nAgregó que el costo es acotado\. \[2:05\]/);
  assert.match(txt, /Expositores del Sector Público \(ESP\)/);
  assert.match(txt, /No es un documento oficial/);
});

test("clasificación de intervinientes: BCN siempre EEA, parlamentarios por tratamiento", () => {
  assert.equal(categoriaFinal("ESC", "Paco González", "Investigador", "Biblioteca del Congreso Nacional"), "EEA");
  assert.equal(categoriaFinal("ESP", "Pablo Morales", "Investigador", "BCN"), "EEA");
  assert.equal(categoriaFinal("ESP", "Sen. Urrutia", "Honorable Senador", ""), "PARL");
  assert.equal(categoriaFinal("ESC", "Susana Albarracín", "Gerente General", "IMPPA"), "ESC");
  assert.equal(categoriaFinal("ESP", "Juan Pérez", "Secretario", "Cámara de Diputados"), "ESP", "funcionario de la Cámara no es parlamentario");
  assert.equal(categoriaFinal("xx", "Alguien", "", ""), "ND");
  assert.equal(categoriaFinal("PARL", "Asesor", "asesor del Senador X", ""), "PARL");
});

test("informes guardados de la versión 1 se leen en el formato nuevo", () => {
  const v1 = { version: 1, resumen: "r", puntos: [{ numero: 1, titulo: "t", boletines: [], sintesis: "", intervenciones: [{ orador: "Sen. Lagos", cargo: "", segundos: 300, postura: "Pidió oficiar." }], acuerdos: [], votaciones: [] }], compromisos: [], pendientes: [], parcial: false, descartados: 0 };
  const n = normalizarInforme(v1);
  assert.deepEqual(n.puntos[0].intervenciones[0].parrafos, ["Pidió oficiar."]);
  assert.equal(n.puntos[0].intervenciones[0].categoria, "PARL");
  assert.equal(intervinientes(n).length, 1);
});
