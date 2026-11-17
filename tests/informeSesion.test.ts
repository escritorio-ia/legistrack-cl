import { test } from "node:test";
import assert from "node:assert/strict";
import { validarInforme, transcripcionParaPrompt, minutoASegundos, informeSesionATexto } from "../src/utils/informeSesion";

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
        { orador: "Ministro de Hacienda", cargo: "Ministro", minuto: "2:05", postura: "Propone gradualidad." },
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
  const txt = informeSesionATexto(inf, { comision: "Hacienda", fecha: "17-11-2026", videoId: "abc" });
  assert.match(txt, /\[2:05\] Ministro de Hacienda \(Ministro\): Propone gradualidad\./);
  assert.match(txt, /No es un documento oficial/);
});
