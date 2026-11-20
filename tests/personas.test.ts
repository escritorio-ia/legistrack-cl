import { test } from "node:test";
import assert from "node:assert/strict";
import { unirPersonas, mismaPersona, esSoloCargo, cargoEnFecha, buscarPersona } from "../src/utils/personas";

test("la misma persona en distintas fuentes, con cargos que cambian en el tiempo", () => {
  const ps = unirPersonas([
    { nombre: "Óscar Camacho", cargo: "Subdirector de Operaciones", institucion: "SAG", categoria: "ESP", fecha: "2026-06-03", texto: "Explicó la iniciativa.", contexto: "v1", videoId: "v1" },
    { nombre: "El señor Oscar Camacho", categoria: "ESP", fecha: "2026-07-20", texto: "Apoyó separar infracciones.", contexto: "v2", videoId: "v2" },
    { nombre: "Francesco Venezian", cargo: "Subsecretario", institucion: "Ministerio de Agricultura", categoria: "ESP", fecha: "2026-06-03", texto: "Sostuvo...", videoId: "v1" },
    { nombre: "Francesco Venezian", cargo: "Ministro", institucion: "Ministerio de Agricultura", categoria: "ESP", fecha: "2026-10-01", texto: "Ahora como ministro...", videoId: "v9" },
  ]);
  const cam = ps.find((p) => /camacho/i.test(p.nombre))!;
  assert.equal(cam.intervenciones.length, 2);
  const ven = ps.find((p) => /venezian/i.test(p.nombre))!;
  assert.equal(ven.cargos.length, 2, "dos cargos distintos en el tiempo");
  assert.equal(cargoEnFecha(ven, "2026-06-03")!.cargo, "Subsecretario");
  assert.equal(cargoEnFecha(ven, "2026-10-01")!.cargo, "Ministro");
});

test("parlamentario y funcionario con el mismo apellido no se unen; apellido suelto ambiguo tampoco", () => {
  assert.equal(mismaPersona({ nombre: "Alejandra Sepúlveda", categoria: "PARL" }, { nombre: "Miguel Sepúlveda", categoria: "ESP" }), false);
  assert.equal(mismaPersona({ nombre: "Sepúlveda", categoria: "PARL" }, { nombre: "Alejandra Sepúlveda Orbenes", categoria: "PARL" }), true);
  assert.equal(mismaPersona({ nombre: "Alejandra", categoria: "PARL" }, { nombre: "Alejandra Sepúlveda", categoria: "PARL" }), false, "un nombre de pila suelto no basta");
  const ps = unirPersonas([
    { nombre: "Ignacio Urrutia", categoria: "PARL" }, { nombre: "Juan Urrutia", categoria: "PARL" }, { nombre: "Senador Urrutia", categoria: "PARL", texto: "x" },
  ]);
  assert.equal(ps.length, 3, "el apellido suelto no se asigna a ninguno de los dos");
  assert.equal(buscarPersona(ps, "Urrutia", "PARL"), null);
});

test("mención solo por cargo: se resuelve dentro de la misma sesión, nunca entre sesiones", () => {
  assert.ok(esSoloCargo("El Subsecretario"));
  assert.ok(esSoloCargo("Ministro de Hacienda"));
  assert.ok(!esSoloCargo("Francesco Venezian"));
  const ps = unirPersonas([
    { nombre: "Francesco Venezian", cargo: "Subsecretario de Agricultura", categoria: "ESP", fecha: "2026-06-03", texto: "a", videoId: "v1", contexto: "v1" },
    { nombre: "El Subsecretario", categoria: "ESP", fecha: "2026-06-03", texto: "b", videoId: "v1", contexto: "v1" },
    { nombre: "El Subsecretario", categoria: "ESP", fecha: "2026-11-10", texto: "c", videoId: "v7", contexto: "v7" },
  ]);
  const ven = ps.find((p) => /venezian/i.test(p.nombre))!;
  assert.equal(ven.intervenciones.length, 2, "la mención de la misma sesión se asigna");
  assert.ok(ps.some((p) => p.sinNombre && p.intervenciones[0].texto === "c"), "la de otra sesión no se asume que es la misma persona");
});
