/**
 * Lógica de tramitación con datos de la ficha (funciones puras, sin red). Los hitos son ficticios.
 * Ejecutar: npm run test:fuentes
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFechaFlexible, diasEntre, etapaActual, ultimoMovimiento, detectTramite } from "../src/utils/tramitacion";

const iso = (d: Date | null) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : null);

test("fechas: dd/mm/aaaa se lee como día/mes (el 05/11 es 5 de noviembre, no 11 de mayo)", () => {
  assert.equal(iso(parseFechaFlexible("05/11/2026")), "2026-11-05");
  assert.equal(iso(parseFechaFlexible("13/05/2026")), "2026-05-13", "new Date('13/05/2026') sería inválida");
  assert.equal(iso(parseFechaFlexible("2026-11-05")), "2026-11-05");
  assert.equal(iso(parseFechaFlexible("2026-11-05T10:00:00Z")), "2026-11-05");
  assert.equal(iso(parseFechaFlexible(" 7-3-2025 ")), "2025-03-07");
});

test("fechas: lo que no es una fecha válida da null o undefined, nunca una fecha inventada", () => {
  for (const x of ["", undefined, null, "31/02/2026", "00/01/2026", "sin fecha", "2026-13-40", "12/2026"]) assert.equal(parseFechaFlexible(x as any), null, String(x));
  assert.equal(diasEntre("01/11/2026", "sin fecha"), undefined);
  assert.equal(diasEntre(undefined, "05/11/2026"), undefined);
});

test("días entre fechas: usa día/mes y nunca da negativo", () => {
  assert.equal(diasEntre("01/11/2026", "05/11/2026"), 4);
  assert.equal(diasEntre("28/10/2026", "2026-11-05"), 8);
  assert.equal(diasEntre("05/11/2026", "01/11/2026"), 0);
});

test("etapa: texto de la ficha con expresiones completas", () => {
  assert.deepEqual(etapaActual({ etapa: "Primer trámite constitucional" }), { actual: 2, enTercer: false, terminada: false, fuente: "ficha" });
  assert.equal(etapaActual({ etapa: "Segundo trámite constitucional" }).actual, 3);
  const tercer = etapaActual({ etapa: "Tercer trámite constitucional" });
  assert.equal(tercer.actual, 3);
  assert.equal(tercer.enTercer, true);
  assert.equal(etapaActual({ etapa: "Comisión Mixta" }).actual, 4);
  assert.equal(etapaActual({ etapa: "Trámite de finalización", subetapa: "Control de constitucionalidad (TC)" }).actual, 4);
});

test("etapa: un 'segundo informe de comisión' del primer trámite NO es segundo trámite", () => {
  const r = etapaActual({ etapa: "Primer trámite constitucional", subetapa: "Segundo informe de Comisión de Hacienda" });
  assert.equal(r.actual, 2);
  assert.equal(etapaActual({ subetapa: "Segundo informe de comisión" }).actual, null, "sin etapa reconocible no se adivina");
});

test("etapa: la Comisión Especial Mixta de Presupuestos no es una Comisión Mixta", () => {
  assert.equal(etapaActual({ etapa: "Primer trámite constitucional", subetapa: "Comisión Especial Mixta de Presupuestos" }).actual, 2);
});

test("etapa: publicada como ley = 5; tramitación terminada sin publicación NO se asume ley", () => {
  assert.deepEqual(etapaActual({ etapa: "Tramitación terminada", estado: "Publicado como Ley" }), { actual: 5, enTercer: false, terminada: true, fuente: "ficha" });
  const rechazado = etapaActual({ etapa: "Primer trámite constitucional", estado: "Tramitación terminada" });
  assert.equal(rechazado.actual, 2);
  assert.equal(rechazado.terminada, true);
  const sinEtapa = etapaActual({ estado: "Archivado" });
  assert.equal(sinEtapa.actual, null);
  assert.equal(sinEtapa.terminada, true);
});

test("etapa: sin dato en la ficha se usa el último hito por FECHA (no por posición); sin hitos, no informada", () => {
  const hitos = [
    { fecha: "20/03/2026", titulo: "Segundo trámite constitucional (CD)", descripcion: "Cuenta de proyecto" },
    { fecha: "05/01/2026", titulo: "Primer trámite constitucional (S)", descripcion: "Ingreso" },
    { fecha: "10/02/2026", titulo: "Primer trámite constitucional (S)", descripcion: "Aprobado en general" },
  ];
  const r = etapaActual({ etapa: "En discusión", timeline: hitos });
  assert.equal(r.actual, 3);
  assert.equal(r.fuente, "hitos");
  assert.deepEqual(etapaActual({ etapa: "No informada", timeline: [] }), { actual: null, enTercer: false, terminada: false, fuente: "no_informada" });
  assert.equal(etapaActual({ timeline: [{ fecha: "sin fecha", titulo: "Segundo trámite constitucional" }] }).actual, null, "un hito sin fecha válida no decide");
});

test("último movimiento: el más reciente por fecha real y días desde hoy", () => {
  const hoy = new Date(2026, 10, 5);
  const m = ultimoMovimiento([
    { fecha: "04/11/2026", titulo: "Informe de comisión", descripcion: "A" },
    { fecha: "12/10/2026", titulo: "Ingreso de indicaciones", descripcion: "B" },
    { fecha: "sin fecha", titulo: "Hito sin fecha" },
    { fecha: "30/10/2026", titulo: "Sesión", descripcion: "C" },
  ], hoy);
  assert.ok(m);
  assert.equal(m!.titulo, "Informe de comisión");
  assert.equal(m!.dias, 1);
  assert.equal(m!.fechaTexto, "04/11/2026");
  assert.equal(ultimoMovimiento([], hoy), null);
  assert.equal(ultimoMovimiento([{ fecha: "x", titulo: "y" }], hoy), null);
});

test("detectTramite identifica el trámite del hito", () => {
  assert.equal(detectTramite("Segundo trámite constitucional (CD)")?.key, "segundo");
  assert.equal(detectTramite("Pasa a Comisión Mixta")?.key, "mixta");
  assert.equal(detectTramite("Comisión Especial Mixta de Presupuestos"), null);
  assert.equal(detectTramite("Cuenta de proyecto"), null);
});
