import { test } from "node:test";
import assert from "node:assert/strict";
import { tiempoDeSesion, normalizarBoletin, boletinesEnTexto, boletinDiscrepante } from "../src/utils/boletines";

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

test("sesión con boletín de otro sufijo: se detecta la discrepancia (caso visto en producción)", () => {
  const cita = "reforma del Instituto Nacional de Derechos Humanos (boletines N° 18574-17 y 18331-17).";
  assert.equal(boletinDiscrepante(cita, "18.574-25"), "18574-17");
  assert.equal(boletinDiscrepante("Boletín N° 18574-25.", "18.574-25"), "");
  assert.equal(boletinDiscrepante("[Parte 1] boletín 18.434-07 [Parte 2] Boletín N° 18574-25 y 18574-17", "18.574-25"), "");
  assert.equal(boletinDiscrepante("sin boletines", "18.574-25"), "");
});
