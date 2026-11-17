import { test } from "node:test";
import assert from "node:assert/strict";
import {
  puntosDeMateria, idSesion, fechaISO, horaInicio, huella,
  aportesCitacionesCamara, aportesCitacionesSenado, aportesHistoriaSenado, aporteDetalleSenado, combinarSesion,
} from "../server/services/registroSesionesService";

test("pauta: separa [Parte N] (Cámara) y '1.-' (Senado), con los boletines de cada punto", () => {
  const camara = "[Parte 1] Votar en general (Boletín N°18.537-06) y (Boletín N°18.544-06). [Parte 2] Iniciar la discusión (Boletín N° 18.655-06). [Parte 3] Casinos (Boletín N° 18.781-06).";
  const p = puntosDeMateria(camara);
  assert.equal(p.length, 3);
  assert.deepEqual(p.map((x) => x.boletines), [["18537-06", "18544-06"], ["18655-06"], ["18781-06"]]);
  const senado = "1.- Proyecto de ley, boletín N° 16.621-05.\n2.- Oficio del Presidente, sin boletín.";
  assert.deepEqual(puntosDeMateria(senado).map((x) => [x.numero, x.boletines]), [[1, ["16621-05"]], [2, []]]);
  assert.deepEqual(puntosDeMateria(""), []);
});

test("identificador de sesión: el mismo para la citación y para el registro de la misma sesión", () => {
  assert.equal(fechaISO("MARTES, 17 DE NOVIEMBRE DE 2026"), "2026-11-17");
  assert.equal(fechaISO("17/11/2026"), "2026-11-17");
  assert.equal(horaInicio("15:00 a 17:00"), "1500");
  assert.equal(idSesion("Senado", "Comisión de Hacienda", "2026-11-17", "15:00 a 17:00"), idSesion("Senado", "Comisión de Hacienda", "2026-11-17", "15:00"));
  assert.notEqual(idSesion("Senado", "Comisión de Hacienda", "2026-11-17", "15:00"), idSesion("Cámara", "Comisión de Hacienda", "2026-11-17", "15:00"));
  assert.equal(huella({ a: 1 }), huella({ a: 1 }));
  assert.notEqual(huella({ a: 1 }), huella({ a: 2 }));
});

test("aportes: citación de la Cámara y del Senado, registro y detalle oficial del Senado", () => {
  const [c] = aportesCitacionesCamara([{ fecha: "MARTES, 17 DE NOVIEMBRE DE 2026", comisionNombre: "Gobierno Interior", comisionSlug: "gobierno-interior", hora: "15:00 a 17:00", lugar: "Sala X", materia: "[Parte 1] Boletín N°18.537-06.", invitados: "No informado en la citación.", boletinesRelacionados: [] }]);
  assert.equal(c.fecha, "2026-11-17");
  assert.equal(c.comisionId, "cd-gobierno-interior");
  assert.deepEqual(c.boletines, ["18537-06"]);
  assert.equal((c.datos as any).invitados, null, "'No informado' no se guarda como invitado");

  const [s] = aportesCitacionesSenado([{ fecha: "2026-11-17", idComision: 189, comision: "Comisión de Hacienda", hora: "Horario reglamentario", lugar: "Valparaíso / Santiago", materia: "1.- Boletín N° 16.621-05.", boletines: ["16621-05"], idCitacion: 99 }]);
  assert.equal((s.datos as any).hora, null, "los valores de relleno no se guardan como dato");
  assert.equal((s.datos as any).lugar, null);

  const [h] = aportesHistoriaSenado("189", [{ idSesion: 5, fecha: "17/11/2026", inicio: "15:00", termino: "17:00", lugar: "Sala 10", materia: "Boletín 16.621-05" }]);
  const d = aporteDetalleSenado("189", { fecha: "17/11/2026", inicio: "15:00" }, { disponible: true, fecha: "2026-11-17", puntos: [{ numero: "1", boletin: "16621-05", tema: "Proyecto", aspectos: "Se expuso.", acuerdos: "Pendiente.", invitados: "Ministro (ficticio)", asistentes: "Sen. A" }] })!;
  assert.equal(h.id, d.id, "registro y detalle de la misma sesión caen en el mismo documento");
  assert.equal((d.datos as any).puntos[0].acuerdos, null, "'Pendiente' no es un acuerdo");
});

test("vista combinada: el detalle oficial manda en la pauta; lo que falta queda en null", () => {
  const f = {
    camara: { stringValue: "Senado" }, comisionNombre: { stringValue: "Comisión de Hacienda" }, fecha: { stringValue: "2026-11-17" },
    boletines: { arrayValue: { values: [{ stringValue: "16621-05" }] } },
    historia: { stringValue: JSON.stringify({ inicio: "15:00", termino: "17:00", materia: "M", puntos: [{ numero: 1, texto: "M", boletines: [] }], url: "u1" }) },
    detalle: { stringValue: JSON.stringify({ puntos: [{ numero: 1, texto: "Proyecto", boletines: ["16621-05"], aspectos: "Se expuso." }], url: "u2" }) },
  };
  const r = combinarSesion("sr-hacienda-2026-11-17-1500", f);
  assert.equal(r.hora, "15:00 a 17:00");
  assert.equal(r.puntos[0].texto, "Proyecto");
  assert.deepEqual(r.boletines, ["16621-05"]);
  assert.equal(r.resultado, null);
  assert.equal(r.citacionNumero, null);
  assert.deepEqual(r.fuentes, ["registro de sesiones del Senado", "detalle oficial de la sesión"]);
});

test("pauta: urgencia y acción según el texto oficial de cada punto", async () => {
  const { urgenciaDelPunto, accionDelPunto } = await import("../src/utils/pauta");
  assert.equal(urgenciaDelPunto("con urgencia calificada de “suma”, que modifica"), "Suma urgencia");
  assert.equal(urgenciaDelPunto("con urgencia calificada de \"simple\""), "Urgencia simple");
  assert.equal(urgenciaDelPunto("sin urgencia"), "");
  assert.equal(accionDelPunto("Votar en particular los siguientes proyectos"), "Votación");
  assert.equal(accionDelPunto("Iniciar la discusión general del proyecto"), "Inicia discusión");
  assert.equal(accionDelPunto("Continuar la discusión general del proyecto"), "Continúa discusión");
  // Caso visto en producción: discusión con votación anunciada no es solo "Votación".
  assert.equal(accionDelPunto("Continuar la discusión general del proyecto de ley (Boletín N° 18.576-06). Luego de audiencia se votará en general y en particular."), "Continúa discusión y votación");
});
