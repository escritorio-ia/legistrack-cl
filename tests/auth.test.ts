import { test } from "node:test";
import assert from "node:assert/strict";
import { credencialesValidas, crearToken, leerToken, rutaPublica, authConfigurada } from "../server/services/authService";

test("ingreso: cerrado si faltan variables, token firmado y vencimiento", () => {
  delete process.env.ADMIN_CLAVE; delete process.env.AUTH_SECRET;
  assert.equal(authConfigurada().ok, false);
  assert.equal(credencialesValidas("admin", "x"), false, "sin configuración no se entra");
  process.env.ADMIN_CLAVE = "clave-de-prueba"; process.env.AUTH_SECRET = "secreto-de-prueba";
  assert.equal(credencialesValidas("Admin ", "clave-de-prueba"), true);
  assert.equal(credencialesValidas("admin", "otra"), false);
  assert.equal(credencialesValidas("otro", "clave-de-prueba"), false);
  const t = crearToken("admin", Date.now());
  assert.deepEqual(leerToken(t), { u: "admin" });
  assert.equal(leerToken(t.slice(0, -2) + "xx"), null, "firma alterada");
  assert.equal(leerToken(crearToken("admin", Date.now() - 8 * 86400000)), null, "vencido");
  process.env.AUTH_SECRET = "otro-secreto";
  assert.equal(leerToken(t), null, "cambiar AUTH_SECRET cierra las sesiones");
});

test("rutas públicas solo las de protección propia", () => {
  assert.ok(rutaPublica("POST", "/auth/ingresar"));
  assert.ok(rutaPublica("POST", "/senado/citaciones/importar"));
  assert.ok(rutaPublica("GET", "/registro-sesiones/sincronizar"));
  assert.ok(!rutaPublica("GET", "/sala"));
  assert.ok(!rutaPublica("POST", "/sesion/informe"));
  assert.ok(!rutaPublica("GET", "/senado/citaciones/importar"));
});
