import test from "node:test";
import assert from "node:assert/strict";
import { construirResumenSesion } from "../server/services/resumenSesionService";

const det = {
  disponible: true, url: "https://www.senado.cl/x", comision: "Hacienda", fecha: "2026-10-06", inicio: "15:00", termino: "16:45", lugar: "Sala 3",
  puntos: [
    { numero: "1", boletin: "1234-05", tema: "Proyecto A", aspectos: "Se expuso el proyecto.", acuerdos: "Aprobar en general.", invitados: "Ministro X; Ministra Y", asistentes: "Sen. A; Sen. B" },
    { numero: "2", boletin: "", tema: "Proyecto B", aspectos: "", acuerdos: "Pendiente.", invitados: "Ministro X", asistentes: "Sen. B; Sen. C" }
  ],
  presentaciones: [{ titulo: "Ppt", url: "https://x/p.pdf" }, { titulo: "sin url", url: "" }]
};

test("resumen: estadísticas y agregados sin duplicados", () => {
  const r = construirResumenSesion(det as any);
  assert.equal(r.encabezado?.duracionMin, 105);
  assert.deepEqual(r.asistentes, ["Sen. A", "Sen. B", "Sen. C"]);
  assert.deepEqual(r.invitados, ["Ministro X", "Ministra Y"]);
  assert.deepEqual(r.boletines, ["1234-05"]);
  assert.deepEqual(r.estadisticas, { puntos: 2, conAcuerdos: 1, sinAcuerdos: 1, boletines: 1, invitados: 2, asistentes: 3 });
  assert.equal(r.presentaciones.length, 1);
});

test("resumen: lo no informado queda en null, nunca inventado", () => {
  const r = construirResumenSesion(det as any);
  assert.equal(r.puntos[1].acuerdos, null);
  assert.equal(r.puntos[1].aspectos, null);
  assert.equal(r.puntos[1].boletin, null);
  const v = construirResumenSesion({ disponible: true, puntos: [] } as any);
  assert.equal(v.encabezado?.lugar, null);
  assert.equal(v.encabezado?.duracionMin, null);
});

test("resumen: sesión no disponible conserva el motivo", () => {
  const r = construirResumenSesion({ disponible: false, motivo: "no sincronizada" } as any);
  assert.equal(r.disponible, false);
  assert.equal(r.motivo, "no sincronizada");
  assert.equal(r.puntos.length, 0);
});
