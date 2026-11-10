/**
 * Caché por fuente, traducción única y tope de la caché. NO hacen llamadas de red.
 * Ejecutar: npm run test:fuentes
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";

for (const k of ["GEMINI_API_KEY", "GEMINI_VIDEO_API_KEY", "OPENROUTER_API_KEY", "CEREBRAS_API_KEY", "GROQ_API_KEY", "ANTHROPIC_API_KEY", "LEGIFRANCE_CLIENT_ID", "LEGIFRANCE_CLIENT_SECRET", "CONGRESS_API_KEY"]) delete process.env[k];
process.env.GEMINI_API_KEY = "clave-falsa-solo-para-pruebas";

const realFetch = globalThis.fetch;
const json = (s: string, status = 200) => new Response(s, { status, headers: { "content-type": "application/json" } });
const TRADUCCIONES = { en: "data protection", nl: "gegevensbescherming", ja: "個人情報保護", fr: "protection des données", pl: "ochron", sv: "dataskydd", de: "Datenschutz", it: "protezione", fi: "tietosuoja", pt: "proteção de dados", ko: "개인정보", et: "isikuandme", da: "databeskyttelse", he: "פרטיות", zh: "個人資料保護", nb: "personopplysning", hr: "podatak" };

let llamadasIA = 0;
let iaOk = true;
let sueciaCaida = true;
const porHost: Record<string, number> = {};

globalThis.fetch = (async (input: any) => {
  const url = String(input?.url || input);
  if (/generativelanguage\.googleapis\.com/.test(url)) {
    llamadasIA++;
    return iaOk ? json(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(TRADUCCIONES) }] } }] })) : new Response("error", { status: 500 });
  }
  const host = new URL(url).host;
  porHost[host] = (porHost[host] || 0) + 1;
  if (/riksdagen\.se/.test(url)) {
    return sueciaCaida ? new Response("error", { status: 503 }) : json(JSON.stringify({ dokumentlista: { dokument: [{ dok_id: "sfs-2099-1", titel: "Lag (2099:1) om dataskydd (ficticio)", datum: "2018-04-19", beteckning: "2099:1" }] } }));
  }
  if (/laws\.e-gov\.go\.jp/.test(url)) return json(JSON.stringify({ laws: [] }));
  return new Response("error", { status: 500 });
}) as typeof fetch;

const estado = (r: { estados: Array<{ jurisdiccion: string; estado: string }> }, j: string) => r.estados.find((e) => e.jurisdiccion === j)?.estado;

test("una fuente caída no se guarda y se reintenta; las que respondieron salen de la caché", async () => {
  const { buscarFuentesOficiales } = await import("../server/services/fuentesOficialesService");
  const q = "materia de prueba caché";

  const r1 = await buscarFuentesOficiales(q);
  assert.equal(estado(r1, "Suecia"), "no_disponible");
  assert.equal(estado(r1, "Japón"), "sin_resultados");
  assert.equal(llamadasIA, 1);
  const japon1 = porHost["laws.e-gov.go.jp"], suecia1 = porHost["data.riksdagen.se"];

  sueciaCaida = false;
  const r2 = await buscarFuentesOficiales(q);
  assert.equal(estado(r2, "Suecia"), "ok", "la fuente que había fallado se reintenta");
  assert.equal(r2.normas.filter((n) => n.pais === "Suecia").length, 1);
  assert.equal(porHost["laws.e-gov.go.jp"], japon1, "Japón respondió bien: no se vuelve a consultar");
  assert.equal(porHost["data.riksdagen.se"], suecia1 + 1);
  assert.equal(llamadasIA, 1, "la traducción quedó guardada: no se vuelve a llamar a la IA");

  const suecia2 = porHost["data.riksdagen.se"];
  await buscarFuentesOficiales(q);
  assert.equal(porHost["data.riksdagen.se"], suecia2, "Suecia ya está en caché");
});

test("la caché devuelve copias: modificar un resultado no altera el siguiente", async () => {
  const { buscarFuentesOficiales } = await import("../server/services/fuentesOficialesService");
  const q = "materia de prueba caché";
  const a = await buscarFuentesOficiales(q);
  a.normas.find((n) => n.pais === "Suecia")!.titulo = "ALTERADO";
  const b = await buscarFuentesOficiales(q);
  assert.notEqual(b.normas.find((n) => n.pais === "Suecia")!.titulo, "ALTERADO");
});

test("si la IA no traduce, el 'sin resultados' de un conector que traduce NO se guarda", async () => {
  const { buscarFuentesOficiales } = await import("../server/services/fuentesOficialesService");
  const q = "otra materia sin traducción";
  iaOk = false;
  try {
    const r1 = await buscarFuentesOficiales(q);
    assert.equal(estado(r1, "Japón"), "sin_resultados", "sin traducción no hay término en japonés");
    const ia1 = llamadasIA;
    await buscarFuentesOficiales(q);
    assert.ok(llamadasIA > ia1, "al no haberse guardado la traducción, se vuelve a pedir");
  } finally {
    iaOk = true;
  }
  const antes = porHost["laws.e-gov.go.jp"];
  const r3 = await buscarFuentesOficiales(q);
  assert.equal(estado(r3, "Japón"), "sin_resultados");
  assert.equal(porHost["laws.e-gov.go.jp"], antes + 1, "con la traducción ya disponible Japón se consulta de verdad");
});

test("la caché tiene tope: descarta las entradas más antiguas", async () => {
  const { cache } = await import("../server/services/cacheService");
  cache.clear();
  for (let i = 0; i < 2100; i++) cache.set(`k${i}`, i, 60_000);
  assert.ok(cache.getStats().size <= 2000);
  assert.equal(cache.get("k0"), null, "la más antigua se descartó");
  assert.equal(cache.get("k2099"), 2099);
  cache.clear();
});

after(() => { globalThis.fetch = realFetch; });
