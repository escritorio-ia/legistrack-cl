/**
 * Pruebas de los conectores oficiales con fixtures. NO hacen llamadas de red.
 * Ejecutar: npx tsx --test tests/fuentesOficiales.test.ts
 * Fixtures: boe_busqueda.json, cellar_sparql.json, uk_atom.xml son extractos de respuestas REALES capturadas el
 * 2026-11-04 (no son las respuestas completas); boe_texto_sintetico.xml es SINTÉTICO, escrito según el esquema
 * documentado por la AEBOE (APIconsolidada.pdf).
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

for (const k of ["GEMINI_API_KEY", "OPENROUTER_API_KEY", "CEREBRAS_API_KEY", "GROQ_API_KEY", "ANTHROPIC_API_KEY"]) delete process.env[k];

const dir = join(process.cwd(), "tests", "fixtures");
const fx = (n: string) => readFileSync(join(dir, n), "utf8");
const realFetch = globalThis.fetch;

function simular(rutas: Array<[RegExp, () => Response]>) {
  globalThis.fetch = (async (input: any) => {
    const url = String(input?.url || input);
    for (const [re, fn] of rutas) if (re.test(url)) return fn();
    throw new Error(`Sin respuesta simulada para ${url}`);
  }) as typeof fetch;
}
const json = (s: string, status = 200) => new Response(s, { status, headers: { "content-type": "application/json" } });
const xml = (s: string, status = 200) => new Response(s, { status, headers: { "content-type": "application/xml" } });
const html503 = () => new Response("<html><title>Web Site Under Maintenance</title></html>", { status: 503, headers: { "content-type": "text/html" } });

test("las tres fuentes responden: normas oficiales con identificador, sin IA", async () => {
  const { buscarFuentesOficiales } = await import("../server/services/fuentesOficialesService");
  simular([
    [/publications\.europa\.eu\/webapi\/rdf\/sparql/, () => json(fx("cellar_sparql.json"))],
    [/boe\.es\/datosabiertos\/api\/legislacion-consolidada\?/, () => json(fx("boe_busqueda.json"))],
    [/legislation\.gov\.uk\/search\/data\.feed/, () => xml(fx("uk_atom.xml"))],
  ]);
  const r = await buscarFuentesOficiales("seguridad de las redes");
  assert.deepEqual(r.estados.map((e) => e.estado), ["ok", "ok", "ok"]);
  assert.ok(r.normas.every((n) => n.origen === "oficial" && n.idOficial && n.url.startsWith("https://")));
  const ue = r.normas.filter((n) => n.pais === "Unión Europea");
  assert.deepEqual(ue.map((n) => n.idOficial), ["32017D0179", "32016L1148"], "descarta CELEX preparatorios (5…) y ordena por fecha");
  assert.equal(r.normas.find((n) => n.pais === "España")?.idOficial, "BOE-A-2021-1192");
  assert.equal(r.normas.find((n) => n.pais === "Reino Unido")?.url, "https://www.legislation.gov.uk/ukpga/2018/12");
  assert.match(r.normas.find((n) => n.pais === "Reino Unido")!.descripcion, /^An Act to make provision/);
});

test("si una fuente falla se informa no_disponible y NO se inventa ninguna norma", async () => {
  const { buscarFuentesOficiales } = await import("../server/services/fuentesOficialesService");
  simular([
    [/publications\.europa\.eu\/webapi\/rdf\/sparql/, html503],
    [/boe\.es\/datosabiertos/, () => json(fx("boe_busqueda.json"))],
    [/legislation\.gov\.uk/, () => { throw new Error("fetch failed"); }],
  ]);
  const r = await buscarFuentesOficiales("consulta con falla");
  const por = Object.fromEntries(r.estados.map((e) => [e.jurisdiccion, e.estado]));
  assert.equal(por["Unión Europea"], "no_disponible");
  assert.equal(por["España"], "ok");
  assert.equal(por["Reino Unido"], "no_disponible");
  assert.equal(r.normas.filter((n) => n.pais !== "España").length, 0);
});

test("respuesta vacía del BOE = sin_resultados", async () => {
  const { buscarFuentesOficiales } = await import("../server/services/fuentesOficialesService");
  simular([
    [/publications\.europa\.eu/, () => json(JSON.stringify({ results: { bindings: [] } }))],
    [/boe\.es/, () => json(JSON.stringify({ status: { code: "200", text: "ok" }, data: {} }))],
    [/legislation\.gov\.uk/, () => xml('<feed xmlns="http://www.w3.org/2005/Atom"></feed>')],
  ]);
  const r = await buscarFuentesOficiales("tema sin resultados xyzw");
  assert.deepEqual(r.estados.map((e) => e.estado), ["sin_resultados", "sin_resultados", "sin_resultados"]);
  assert.equal(r.normas.length, 0);
});

test("texto del BOE: última versión de cada bloque y huella SHA-256 de la respuesta original", async () => {
  const { fetchTextoOficial } = await import("../server/services/fuentesOficialesService");
  const cuerpo = fx("boe_texto_sintetico.xml");
  simular([[/legislacion-consolidada\/id\/BOE-A-2018-12257\/texto/, () => xml(cuerpo)]]);
  const r = await fetchTextoOficial("https://www.boe.es/buscar/act.php?id=BOE-A-2018-12257");
  assert.ok(r);
  assert.match(r!.texto, /tiene por objeto regular la seguridad/);
  assert.doesNotMatch(r!.texto, /versión antigua|Texto antiguo/);
  assert.equal(r!.proveniencia.sha256, createHash("sha256").update(Buffer.from(cuerpo)).digest("hex"));
  assert.equal(r!.proveniencia.bytes, Buffer.byteLength(cuerpo));
});

test("URL desconocida: sin texto oficial (no hay sustitución)", async () => {
  const { fetchTextoOficial } = await import("../server/services/fuentesOficialesService");
  simular([]);
  assert.equal(await fetchTextoOficial("https://example.org/ley/1"), null);
});

test("esInicioDePortal detecta portadas y deja pasar enlaces a normas concretas", async () => {
  const { esInicioDePortal } = await import("../server/services/comparadoService");
  for (const u of ["https://www.retsinformation.dk/", "https://elaws.e-gov.go.jp", "https://isap.sejm.gov.pl/", "https://legilux.public.lu/", "https://www.irishstatutebook.ie/", "https://sitio.org/es/", "no es una url"]) {
    assert.equal(esInicioDePortal(u), true, u);
  }
  for (const u of ["https://www.boe.es/eli/es/2011/12/28/8", "https://www.impo.com.uy/bases/decretos/124-2019-12419", "https://sitio.org/?id=7"]) {
    assert.equal(esInicioDePortal(u), false, u);
  }
});

after(() => { globalThis.fetch = realFetch; });
