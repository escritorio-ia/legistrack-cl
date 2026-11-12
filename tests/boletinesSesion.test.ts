import { test } from "node:test";
import assert from "node:assert/strict";
import { tiempoDeSesion, normalizarBoletin, boletinesEnTexto } from "../src/utils/boletines";

test("orden de sesiones: lee fechas ISO, dd/mm/aaaa y en palabras; lo ilegible queda al final", () => {
  const fechas = ["lunes 7 de septiembre de 2026", "2026-10-01", "15/08/2026", "sin fecha"];
  const orden = [...fechas].sort((a, b) => tiempoDeSesion(b) - tiempoDeSesion(a));
  assert.deepEqual(orden, ["2026-10-01", "lunes 7 de septiembre de 2026", "15/08/2026", "sin fecha"]);
});

test("boletines de la tabla: se extraen y normalizan sin repetir", () => {
  assert.equal(normalizarBoletin("16.621-13"), "16621-13");
  assert.equal(normalizarBoletin("Boletín N° 9.404-7"), "9404-07");
  assert.equal(normalizarBoletin("sin número"), "");
  assert.deepEqual(boletinesEnTexto("1. Continuar el estudio del boletín 16.621-13. 2. Boletines N°s 15869-19 y 16621-13. Ley N° 21.180."), ["16621-13", "15869-19"]);
});
