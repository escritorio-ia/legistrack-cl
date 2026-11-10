/**
 * La búsqueda de derecho comparado no muestra contenido de demostración ni escrito en el código:
 *  - Chile: título y datos tal como los entrega LeyChile; sin resumen inventado ("no informado").
 *  - Si la IA no responde: sin propuestas (no hay "respaldo" fijo).
 * NO hacen llamadas de red. El XML de LeyChile es SINTÉTICO (títulos ficticios; el número 21020 es el de una ley real
 * a propósito: antes el código reemplazaba su título por un texto propio). Ejecutar: npm run test:fuentes
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";

for (const k of ["GEMINI_API_KEY", "GEMINI_VIDEO_API_KEY", "OPENROUTER_API_KEY", "CEREBRAS_API_KEY", "GROQ_API_KEY", "ANTHROPIC_API_KEY", "LEGIFRANCE_CLIENT_ID", "LEGIFRANCE_CLIENT_SECRET", "CONGRESS_API_KEY"]) delete process.env[k];
process.env.GEMINI_API_KEY = "clave-falsa-solo-para-pruebas";

const realFetch = globalThis.fetch;
const LEYCHILE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Normas>
  <Norma><IdNorma>1000001</IdNorma><TituloNorma>TITULO OFICIAL DE PRUEBA SOBRE MASCOTAS (ficticio)</TituloNorma><Numero>21020</Numero><Compuesto>ley-21020</Compuesto>
    <Descripcion>Ley</Descripcion><FechaPublicacion>2017-08-02</FechaPublicacion><Url>https://www.bcn.cl/leychile/navegar?idNorma=1000001</Url></Norma>
  <Norma><IdNorma>1000002</IdNorma><TituloNorma>Norma sin número sobre mascotas (ficticio)</TituloNorma><Numero></Numero><Compuesto></Compuesto>
    <Descripcion>Decreto</Descripcion><FechaPublicacion></FechaPublicacion><Url>https://www.bcn.cl/leychile/navegar?idNorma=1000002</Url></Norma>
</Normas>`;

function simular() {
  globalThis.fetch = (async (input: any) => {
    const url = String(input?.url || input);
    if (/leychile\.cl\/Consulta\/obtxml/.test(url)) return new Response(LEYCHILE_XML, { status: 200, headers: { "content-type": "application/xml" } });
    return new Response("error", { status: 500 }); // IA y demás fuentes caídas
  }) as typeof fetch;
}

test("Chile: se muestra el título de LeyChile (no un texto propio) y el resumen figura como no informado", async () => {
  simular();
  const { buscarChile } = await import("../server/services/comparadoService");
  const r = await buscarChile("mascotas");
  const ley = r.find((x) => x.idOficial === "1000001");
  assert.ok(ley, "debe devolver la norma de LeyChile");
  assert.match(ley!.titulo, /TITULO OFICIAL DE PRUEBA SOBRE MASCOTAS \(ficticio\)/);
  assert.doesNotMatch(ley!.titulo, /Cholito|Sobre Tenencia Responsable de Mascotas y Animales de Compañía/);
  assert.match(ley!.descripcion!, /Resumen: no informado por LeyChile/);
  assert.match(ley!.descripcion!, /N° 21020/);
  assert.match(ley!.descripcion!, /publicada el 2017-08-02/);
  assert.doesNotMatch(ley!.descripcion!, /Registro Nacional de Mascotas|microchip|Se trata de/);
  assert.equal(ley!.origen, "oficial");
});

test("sin IA ni fuentes extranjeras: solo lo que entregó LeyChile y se informa que el motor de IA no está disponible", async () => {
  simular();
  const { buscarDerechoComparado } = await import("../server/services/comparadoService");
  const r = await buscarDerechoComparado("mascotas sin ia");
  assert.ok(r.resultados.length > 0);
  assert.ok(r.resultados.every((x) => x.pais === "Chile" && x.origen === "oficial"), "ningún resultado de IA ni de contenido fijo");
  assert.ok(r.fuentesFallidas.some((f) => /Motor de IA no disponible/.test(f)));
  assert.ok(!r.aiDiagnostics.some((a) => /fallback|ontol/i.test(a.provider)));
});

after(() => { globalThis.fetch = realFetch; delete process.env.GEMINI_API_KEY; });

test("tipo de norma oficial: usa el rango informado por la fuente y no rotula leyes extranjeras como 'Documento'", async () => {
  const { tipoNormaOficial } = await import("../server/services/comparadoService");
  assert.equal(tipoNormaOficial("Tietosuojalaki", undefined), "Norma");
  assert.equal(tipoNormaOficial("Zakon o provedbi Opće uredbe o zaštiti podataka", "ZAKON"), "Ley");
  assert.equal(tipoNormaOficial("個人資料保護法", "法律"), "Ley");
  assert.equal(tipoNormaOficial("Datenschutz-Folgenabschätzung", "Verordnung"), "Reglamento");
  assert.equal(tipoNormaOficial("PL 10/2026", "Projeto de Lei"), "Proyecto de ley");
  assert.equal(tipoNormaOficial("Data Protection Act 2018", undefined), "Ley");
});
