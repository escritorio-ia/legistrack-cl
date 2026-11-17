import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularMetricasBoletin, registroDeSesion, type SesionRegistradaUI } from "../src/utils/metricasBoletin";

const ses = (id: string, fecha: string, comision: string, extra: Partial<SesionRegistradaUI> = {}): SesionRegistradaUI => ({
  id, camara: "Cámara", comisionNombre: comision, fecha, boletines: ["18576-06"], fuentes: ["citación oficial"], hora: null, lugar: null,
  citacionNumero: null, materia: null, puntos: [], invitados: null, resultado: null, enlaces: [], ...extra,
});

test("métricas de un boletín: conteos, fechas, acuerdos del punto y oradores con tiempo aproximado", () => {
  const sesiones = [
    ses("cd-gi-2026-10-20-1500", "2026-10-20", "Gobierno Interior", { resultado: "Se aprobó en general (ficticio)." }),
    ses("cd-gi-2026-11-03-1500", "2026-11-03", "Gobierno Interior", { puntos: [
      { numero: 1, texto: "x", boletines: ["18576-06"], acuerdos: "Aprobado (ficticio).", invitados: "Alcalde (ficticio)" },
      { numero: 2, texto: "y", boletines: ["99999-01"], acuerdos: "De otro boletín." },
    ] }),
    ses("sr-ha-2026-11-10-1200", "2026-11-10", "Hacienda", { camara: "Senado" }),
    ses("cd-gi-2026-11-25-1500", "2026-11-25", "Gobierno Interior"),
  ];
  const trans = [{ videoId: "v1", segmentos: [
    { segundos: 0, orador: "Dip. A (ficticio)", texto: "a" }, { segundos: 120, orador: "No identificado", texto: "b" },
    { segundos: 150, orador: "Dip. A (ficticio)", texto: "c" }, { segundos: 5000, orador: "Dip. B (ficticio)", texto: "d" },
  ] }];
  const m = calcularMetricasBoletin("18.576-06", sesiones, trans, new Date(2026, 10, 17));
  assert.equal(m.total, 4);
  assert.equal(m.realizadas, 3);
  assert.equal(m.programadas, 1);
  assert.equal(m.primera, "2026-10-20");
  assert.equal(m.ultima, "2026-11-10");
  assert.equal(m.diasDesdeUltima, 7);
  assert.equal(m.proxima, "2026-11-25");
  assert.deepEqual(m.porComision.map((x) => [x.nombre, x.n]), [["Gobierno Interior", 2], ["Hacienda", 1]]);
  assert.deepEqual(m.porMes, [{ mes: "2026-10", n: 1 }, { mes: "2026-11", n: 2 }]);
  assert.deepEqual(m.acuerdos.map((a) => a.texto), ["Aprobado (ficticio).", "Se aprobó en general (ficticio)."], "solo acuerdos del punto de este boletín");
  assert.equal(m.invitados.length, 1);
  assert.equal(m.oradores[0].nombre, "Dip. A (ficticio)");
  assert.equal(m.oradores[0].intervenciones, 2);
  assert.equal(m.oradores[0].segundosAprox, 120 + 600, "una intervención se limita a 10 minutos");
  assert.equal(m.segmentosSinIdentificar, 1);
});

test("registro de una sesión mostrada: por fecha y, si hay dos ese día, por hora", () => {
  const regs = [ses("cd-gi-2026-11-03-1500", "2026-11-03", "GI"), ses("cd-gi-2026-11-04-1000", "2026-11-04", "GI"), ses("cd-gi-2026-11-04-1530", "2026-11-04", "GI")];
  assert.equal(registroDeSesion(regs, "Martes 3 de noviembre de 2026")?.id, "cd-gi-2026-11-03-1500");
  assert.equal(registroDeSesion(regs, "04/11/2026", "15:30 a 17:00")?.id, "cd-gi-2026-11-04-1530");
  assert.equal(registroDeSesion(regs, "04/11/2026"), null, "dos sesiones ese día y sin hora: no se adivina");
  assert.equal(registroDeSesion(regs, "fecha ilegible"), null);
});
