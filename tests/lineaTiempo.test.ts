import { test } from "node:test";
import assert from "node:assert/strict";
import { construirLineaTiempo, fechaISO } from "../src/utils/lineaTiempo";

test("línea de tiempo: une tramitación, comisión con informe, Sala y votaciones sin duplicar", () => {
  const ev = construirLineaTiempo({
    boletin: "18.702-05", hoy: "2026-11-18",
    tramites: [{ fecha: "01/10/2026", titulo: "Cuenta de proyecto" }],
    votacionesSenado: [{ id: "s1", fecha: "05/11/2026", materia: "En general", si: 30, no: 2, abstenciones: 1, resultado: "Aprobado" }],
    votacionesCamara: [{ id: "91565", fecha: "2026-11-16T16:52:49", descripcion: "Boletín N° 18702-05", si: 54, no: 84, abstencion: 1, resultado: "Rechazado" }, { id: "900", fecha: "2026-10-02T10:00:00", descripcion: "x", si: 1, no: 0, abstencion: 0, resultado: "Aprobado" }],
    sesionesComision: [
      { id: "sr-hacienda-2026-11-03-1500", camara: "Senado", comisionNombre: "Comisión de Hacienda", fecha: "2026-11-03", hora: "15:00", puntos: [{ texto: "Proyecto de presupuestos (Boletín 18702-05)", boletines: ["18702-05"] }], resultado: null, materia: null, enlaces: [] },
      { id: "sr-hacienda-2026-11-20-1500", camara: "Senado", comisionNombre: "Comisión de Hacienda", fecha: "2026-11-20", hora: "15:00", puntos: [{ texto: "Continúa", boletines: ["18702-05"] }], resultado: null, materia: null, enlaces: [] },
    ],
    informes: [{ videoId: "abc", fecha: "2026-11-03", comision: "Hacienda", sintesis: "Se discutió en general.", acuerdos: ["Oficiar a Dipres"], votaciones: [], estado: "En discusión" }],
    sala: [{ id: "cd-4854", camara: "Cámara", numero: "94", fecha: "2026-11-16", horaInicio: "15:01", tipo: "Ordinaria", estado: "Celebrada", puntos: [], votaciones: [{ id: "91565", fecha: "2026-11-16T16:52:49", boletin: "18702-05", si: 54, no: 84, abstencion: 1, resultado: "Rechazado", quorum: "Quórum Simple", tipo: "Proyecto de Ley" }] }],
  });
  assert.equal(ev.filter((e) => e.id.includes("91565")).length, 1, "la votación de Sala no se repite");
  const com = ev.find((e) => e.id === "c-sr-hacienda-2026-11-03-1500")!;
  assert.equal(com.videoId, "abc");
  assert.equal(com.detalle, "Se discutió en general.");
  assert.match(com.resultado!, /Oficiar a Dipres/);
  assert.ok(ev.find((e) => e.fecha === "2026-11-20")!.futuro);
  assert.equal(ev[0].fecha, "2026-11-20", "lo más reciente primero");
  assert.equal(ev.find((e) => e.tipo === "tramite")!.fecha, "2026-10-01");
  assert.equal(fechaISO("2026-11-16T16:52:49"), "2026-11-16");
});
