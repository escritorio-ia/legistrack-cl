import { test } from "node:test";
import assert from "node:assert/strict";
import { tiempoEnVentana, normComision } from "../src/utils/historial";

test("tiempo de discusión dentro de la ventana del punto, con tope por intervención", () => {
  const segs = [
    { segundos: 0, orador: "Presidente" }, { segundos: 60, orador: "Ministro" }, { segundos: 300, orador: "Ministro" },
    { segundos: 420, orador: "Sen. Lagos" }, { segundos: 2000, orador: "Presidente" }, { segundos: 2100, orador: "Otro punto" },
  ];
  const r = tiempoEnVentana(segs, 60, 2100);
  // Ministro 60→420 = 360 s; Lagos 420→2000 tope 600; Presidente 2000→2100 = 100
  assert.equal(r.total, 360 + 600 + 100);
  assert.equal(r.porOrador.get("ministro")!.segundos, 360);
  assert.equal(r.porOrador.get("ministro")!.intervenciones, 1, "dos segmentos seguidos son una intervención");
  assert.equal(r.porOrador.get("sen. lagos")!.segundos, 600);
  assert.ok(!r.porOrador.has("otro punto"));
});

test("nombres de comisión comparables", () => {
  assert.equal(normComision("Comisión de Agricultura del Senado"), "agricultura");
  assert.equal(normComision("Agricultura, Silvicultura y Desarrollo Rural"), "agricultura silvicultura desarrollo rural");
});
