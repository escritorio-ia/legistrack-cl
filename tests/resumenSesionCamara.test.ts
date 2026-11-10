import { test } from "node:test";
import assert from "node:assert/strict";
import { construirResumenSesionCamara } from "../src/utils/resumenSesionCamara";

test("resumen Cámara: separa resultado, asistentes, reemplazos y boletines", () => {
  const r = construirResumenSesionCamara({
    fecha: "Lunes 7 de septiembre de 2026", hora: "10:00 a 12:00", lugar: "Sala 1", materia: "Proyecto boletín 16777-07",
    tabla: ["Continuar el estudio del boletín 16777-07", "Varios (boletín 15869-19)"], invitados: "Ministro X",
    actaTexto: "Se escuchó la exposición del Ministro X.\nDiputados Asistentes: Pérez, Juan; Soto, Ana\nReemplazos: Díaz por Rojas\nOtros Diputados asistentes: López, Eva",
    videoUrl: "https://www.youtube.com/watch?v=abc", fuente: "Citación oficial (camara.cl) + resultado oficial",
  });
  assert.deepEqual(r.asistentes, ["Pérez, Juan", "Soto, Ana"]);
  assert.equal(r.reemplazos, "Díaz por Rojas");
  assert.equal(r.otrosAsistentes, "López, Eva");
  assert.equal(r.resultado, "Se escuchó la exposición del Ministro X.");
  assert.deepEqual(r.boletines, ["16777-07", "15869-19"]);
  assert.deepEqual(r.estadisticas, { puntos: 2, boletines: 2, asistentes: 2, conResultado: true, conVideo: true });
});

test("resumen Cámara: lo que no viene queda vacío, nunca inventado", () => {
  const r = construirResumenSesionCamara({ fecha: "Martes 8 de septiembre de 2026", materia: "Materia no informada (sesión registrada en el canal oficial de YouTube)", invitados: "No informado en la citación." });
  assert.equal(r.resultado, null);
  assert.equal(r.invitados, null);
  assert.equal(r.hora, null);
  assert.deepEqual(r.puntos, []);
  assert.deepEqual(r.asistentes, []);
  assert.equal(r.estadisticas.conResultado, false);
});
