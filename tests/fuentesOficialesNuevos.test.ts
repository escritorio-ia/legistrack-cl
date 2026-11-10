/**
 * Pruebas de los conectores oficiales nuevos (Australia, Países Bajos, Japón, Suiza, Luxemburgo, Polonia, Suecia,
 * Alemania, Francia, Estados Unidos, Italia) y de los reintentos de Reino Unido ante HTTP 202.
 * NO hacen llamadas de red. Ejecutar: npm run test:fuentes
 *
 * Los fixtures de tests/fixtures/sinteticos/ son SINTÉTICOS (títulos e identificadores ficticios): prueban la lógica
 * de cada conector, no que la API real responda así (ver su README.md).
 * La traducción de la consulta (única intervención de IA) se simula respondiendo a la llamada a Gemini hecha con una
 * clave falsa; no se contacta a ningún proveedor.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const VARS = ["GEMINI_API_KEY", "GEMINI_VIDEO_API_KEY", "OPENROUTER_API_KEY", "CEREBRAS_API_KEY", "GROQ_API_KEY", "ANTHROPIC_API_KEY", "LEGIFRANCE_CLIENT_ID", "LEGIFRANCE_CLIENT_SECRET", "LEGIFRANCE_ENV", "CONGRESS_API_KEY"];
for (const k of VARS) delete process.env[k];
process.env.GEMINI_API_KEY = "clave-falsa-solo-para-pruebas";

const fx = (n: string) => readFileSync(join(process.cwd(), "tests", "fixtures", "sinteticos", n), "utf8");
const fxReal = (n: string) => readFileSync(join(process.cwd(), "tests", "fixtures", n), "utf8");
const realFetch = globalThis.fetch;
const json = (s: string, status = 200) => new Response(s, { status, headers: { "content-type": "application/json" } });
const xml = (s: string, status = 200) => new Response(s, { status, headers: { "content-type": "application/xml" } });

// La IA se consulta UNA vez y devuelve la consulta traducida a todos los idiomas.
const TRADUCCIONES = { en: "data protection", nl: "gegevensbescherming", ja: "個人情報保護", fr: "protection des données", pl: "ochron", sv: "dataskydd", de: "Datenschutz", it: "protezione", fi: "tietosuoja", pt: "proteção de dados", ko: "개인정보", et: "isikuandme", da: "databeskyttelse", he: "פרטיות", zh: "個人資料保護", nb: "personopplysning", hr: "podatak" };

type Ruta = [RegExp, (url: string, init?: any) => Response | Promise<Response>];
let llamadas: Array<{ url: string; init?: any }> = [];
let traduccionActiva = true;
let llamadasIA = 0;

function simular(rutas: Ruta[]) {
  llamadas = [];
  llamadasIA = 0;
  globalThis.fetch = (async (input: any, init?: any) => {
    const url = String(input?.url || input);
    if (/generativelanguage\.googleapis\.com/.test(url)) {
      llamadasIA++;
      return traduccionActiva ? json(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(TRADUCCIONES) }] } }] })) : new Response("error", { status: 500 });
    }
    llamadas.push({ url, init });
    for (const [re, fn] of rutas) if (re.test(url)) return fn(url, init);
    throw new Error(`Sin respuesta simulada para ${url}`);
  }) as typeof fetch;
}

let n = 0;
async function buscar(rutas: Ruta[]) {
  const { buscarFuentesOficiales } = await import("../server/services/fuentesOficialesService");
  simular(rutas);
  const r = await buscarFuentesOficiales(`protección de datos ${++n}`); // consulta distinta en cada test: evita la caché
  const est = (j: string) => {
    const e = r.estados.find((x) => x.jurisdiccion === j);
    assert.ok(e, `falta el estado de ${j}`);
    return e!;
  };
  return { r, est, de: (p: string) => r.normas.filter((x) => x.pais === p) };
}
const llamadaA = (re: RegExp) => llamadas.filter((l) => re.test(l.url));

async function conVariables(vars: Record<string, string>, fn: () => Promise<void>) {
  Object.assign(process.env, vars);
  try { await fn(); } finally { for (const k of Object.keys(vars)) delete process.env[k]; }
}

test("Australia: leyes vigentes por fecha descendente y sin $orderby (causaba HTTP 400)", async () => {
  const { est, de } = await buscar([[/api\.prod\.legislation\.gov\.au\/v1\/titles/, () => json(fx("au_titles.json"))]]);
  assert.equal(est("Australia").estado, "ok");
  const url = decodeURIComponent(llamadaA(/legislation\.gov\.au/)[0].url);
  assert.doesNotMatch(url, /\$orderby/);
  assert.match(url, /contains\(tolower\(name\),'data'\) and contains\(tolower\(name\),'protection'\) and collection eq 'Act' and isInForce eq true/);
  const au = de("Australia");
  assert.deepEqual(au.map((x) => x.idOficial), ["C2099A00002", "C2099A00001"]);
  assert.equal(au[0].url, "https://www.legislation.gov.au/C2099A00002/latest/text");
  assert.equal(au[0].fecha, "2020-05-10");
  assert.match(est("Australia").consultaUsada!, /traducida por IA/);
});

test("Países Bajos: solo versiones vigentes, sin duplicados y con entidades decodificadas", async () => {
  const { est, de } = await buscar([[/zoekservice\.overheid\.nl\/sru/, () => xml(fx("nl_sru.xml"))]]);
  assert.equal(est("Países Bajos").estado, "ok");
  assert.match(decodeURIComponent(llamadaA(/overheid\.nl/)[0].url), /overheidbwb\.titel all "gegevensbescherming" and dcterms\.type=wet/);
  const nl = de("Países Bajos");
  assert.deepEqual(nl.map((x) => x.idOficial), ["BWBR0099001", "BWBR0099003"]);
  assert.equal(nl[0].titulo, "Voorbeeldwet gegevensbescherming & toezicht (ficticio)");
  assert.equal(nl[0].url, "https://wetten.overheid.nl/BWBR0099001");
});

test("Japón: búsqueda por título en japonés y enlace a e-Gov", async () => {
  const { est, de } = await buscar([[/laws\.e-gov\.go\.jp\/api\/2\/laws/, () => json(fx("jp_laws.json"))]]);
  assert.equal(est("Japón").estado, "ok");
  assert.match(decodeURIComponent(llamadaA(/e-gov/)[0].url), /law_title=個人情報保護&law_type=Act&repeal_status=None/);
  const jp = de("Japón");
  assert.equal(jp.length, 1, "descarta registros sin law_id o sin título");
  assert.equal(jp[0].url, "https://laws.e-gov.go.jp/law/999AC0000000001");
  assert.equal(jp[0].fecha, "2003-05-30");
});

test("Japón: si la traducción por IA falla, sin_resultados y no se consulta e-Gov", async () => {
  traduccionActiva = false;
  try {
    const { est, de } = await buscar([[/laws\.e-gov\.go\.jp/, () => json(fx("jp_laws.json"))]]);
    assert.equal(est("Japón").estado, "sin_resultados");
    assert.equal(de("Japón").length, 0);
    assert.equal(llamadaA(/e-gov/).length, 0);
  } finally {
    traduccionActiva = true;
  }
});

test("Suiza: solo compilación consolidada (cc), sin duplicados y leyes antes que ordenanzas", async () => {
  const { est, de } = await buscar([[/fedlex\.data\.admin\.ch\/sparqlendpoint/, () => json(fx("ch_sparql.json"))]]);
  assert.equal(est("Suiza").estado, "ok");
  const ch = de("Suiza");
  assert.deepEqual(ch.map((x) => x.idOficial), ["cc/2099/1", "cc/2099/2"]);
  assert.deepEqual(ch.map((x) => x.tipoOficial), ["Loi fédérale", "Ordonnance"]);
  assert.equal(ch[0].url, "https://www.fedlex.admin.ch/eli/cc/2099/1/fr");
});

test("Suiza: respuesta 200 en HTML (no JSON) = no_disponible", async () => {
  const { est, de } = await buscar([[/fedlex\.data\.admin\.ch/, () => new Response("<html>mantención</html>", { status: 200, headers: { "content-type": "text/html" } })]]);
  assert.equal(est("Suiza").estado, "no_disponible");
  assert.equal(de("Suiza").length, 0);
});

test("Luxemburgo: solo leyes, URL https, título limpio y orden por fecha", async () => {
  const { est, de } = await buscar([[/data\.legilux\.public\.lu\/sparqlendpoint/, () => json(fx("lu_sparql.json"))]]);
  assert.equal(est("Luxemburgo").estado, "ok");
  const lu = de("Luxemburgo");
  assert.deepEqual(lu.map((x) => x.fecha), ["2018-08-01", "2002-08-02"]);
  assert.equal(lu[0].url, "https://data.legilux.public.lu/eli/etat/leg/loi/2018/08/01/a999/jo");
  assert.equal(lu[0].idOficial, "etat/leg/loi/2018/08/01/a999/jo");
  assert.equal(lu[0].titulo, "Loi du 1er août 2018 portant organisation de la protection des données (ficticio)");
});

test("Polonia: solo ustawy vigentes, la más reciente primero", async () => {
  const { est, de } = await buscar([[/api\.sejm\.gov\.pl\/eli\/acts\/search/, () => json(fx("pl_eli.json"))]]);
  assert.equal(est("Polonia").estado, "ok");
  assert.match(llamadaA(/sejm/)[0].url, /title=ochron&type=Ustawa/);
  const pl = de("Polonia");
  assert.deepEqual(pl.map((x) => x.idOficial), ["DU/2021/9002", "DU/2019/9001"]);
  assert.equal(pl[1].url, "https://api.sejm.gov.pl/eli/acts/DU/2019/9001/text.html");
});

test("Suecia: solo leyes (lag/balk) con la palabra en el título", async () => {
  const { est, de } = await buscar([[/data\.riksdagen\.se\/dokumentlista/, () => json(fx("se_riksdagen.json"))]]);
  assert.equal(est("Suecia").estado, "ok");
  assert.match(llamadaA(/riksdagen/)[0].url, /doktyp=sfs&sok=dataskydd/);
  const se = de("Suecia");
  assert.deepEqual(se.map((x) => x.idOficial), ["sfs-2099-1"]);
  assert.equal(se[0].url, "https://data.riksdagen.se/dokument/sfs-2099-1.html");
});

test("Alemania: vigentes del BGBl I, una por obra y con la palabra en el título", async () => {
  const { est, de } = await buscar([[/testphase\.rechtsinformationen\.bund\.de\/v1\/legislation\?/, () => json(fx("de_rii.json"))]]);
  assert.equal(est("Alemania").estado, "ok");
  const dd = de("Alemania");
  assert.equal(dd.length, 1);
  assert.equal(dd[0].url, "https://testphase.rechtsinformationen.bund.de/v1/legislation/eli/bund/bgbl-1/2099/s1/2024-01-01/1/deu/regelungstext-1.html");
  assert.equal(dd[0].fecha, "2017-06-30");
  assert.match(dd[0].descripcion, /^BspDSG · Bundesgesetzblatt Teil I/);
});

test("Francia: sin credenciales = no_disponible y no se llama a PISTE", async () => {
  const { est, de } = await buscar([]);
  assert.equal(est("Francia").estado, "no_disponible");
  assert.match(est("Francia").motivo!, /LEGIFRANCE_CLIENT_ID/);
  assert.equal(de("Francia").length, 0);
  assert.equal(llamadaA(/piste\.gouv\.fr/).length, 0);
});

test("Francia: OAuth en sandbox, búsqueda LODA por título y enlace por CID", async () => {
  await conVariables({ LEGIFRANCE_CLIENT_ID: "id-falso", LEGIFRANCE_CLIENT_SECRET: "secreto-falso", LEGIFRANCE_ENV: "sandbox" }, async () => {
    const { est, de } = await buscar([
      [/^https:\/\/sandbox-oauth\.piste\.gouv\.fr\/api\/oauth\/token$/, () => json(JSON.stringify({ access_token: "token-falso", token_type: "Bearer" }))],
      [/^https:\/\/sandbox-api\.piste\.gouv\.fr\/dila\/legifrance\/lf-engine-app\/search$/, () => json(fx("fr_search.json"))],
    ]);
    assert.equal(est("Francia").estado, "ok");
    const tk = llamadaA(/oauth\/token/)[0];
    assert.match(String(tk.init.body), /grant_type=client_credentials/);
    const bus = llamadaA(/lf-engine-app\/search/)[0];
    assert.equal(bus.init.headers.Authorization, "Bearer token-falso");
    const cuerpo = JSON.parse(bus.init.body);
    assert.equal(cuerpo.fond, "LODA_DATE");
    assert.equal(cuerpo.recherche.champs[0].criteres[0].valeur, "protection des données");
    const fr = de("Francia");
    assert.equal(fr.length, 1, "descarta resultados sin títulos");
    assert.equal(fr[0].url, "https://www.legifrance.gouv.fr/loda/id/JORFTEXT999999999001");
    assert.equal(fr[0].fecha, "1978-01-07");
  });
});

test("Francia: token rechazado = no_disponible con el código HTTP en el motivo", async () => {
  await conVariables({ LEGIFRANCE_CLIENT_ID: "id-falso", LEGIFRANCE_CLIENT_SECRET: "secreto-falso" }, async () => {
    const { est, de } = await buscar([[/^https:\/\/oauth\.piste\.gouv\.fr\/api\/oauth\/token$/, () => json('{"error":"invalid_client"}', 401)]]);
    assert.equal(est("Francia").estado, "no_disponible");
    assert.match(est("Francia").motivo!, /autenticación PISTE HTTP 401/);
    assert.equal(de("Francia").length, 0);
    assert.equal(llamadaA(/lf-engine-app/).length, 0);
  });
});

test("Estados Unidos: leyes promulgadas con todas las palabras en el título, más recientes primero", async () => {
  const congreso = Math.floor((new Date().getUTCFullYear() - 1789) / 2) + 1;
  await conVariables({ CONGRESS_API_KEY: "clave-falsa" }, async () => {
    const { est, de } = await buscar([
      [new RegExp(`api\\.congress\\.gov/v3/law/${congreso}\\?`), () => json(fx("us_law.json"))],
      [new RegExp(`api\\.congress\\.gov/v3/law/${congreso - 1}\\?`), () => json(JSON.stringify({ bills: [] }))],
    ]);
    assert.equal(est("Estados Unidos").estado, "ok");
    assert.equal(llamadaA(/congress\.gov/).length, 2);
    assert.equal(llamadaA(/congress\.gov/)[0].init.headers["X-Api-Key"], "clave-falsa");
    const us = de("Estados Unidos");
    assert.deepEqual(us.map((x) => x.idOficial), ["119-S-9002", "119-HR-9001"]);
    assert.equal(us[1].url, "https://www.congress.gov/bill/119th-congress/house-bill/9001");
    assert.equal(us[0].url, "https://www.congress.gov/bill/119th-congress/senate-bill/9002");
  });
});

test("Italia: solo leyes y decretos con la palabra en el título, URN de Normattiva", async () => {
  const { est, de } = await buscar([[/api\.normattiva\.it\/.*\/ricerca\/semplice/, () => json(fx("it_normattiva.json"))]]);
  assert.equal(est("Italia").estado, "ok");
  assert.equal(JSON.parse(llamadaA(/normattiva/)[0].init.body).testoRicerca, "protezione");
  const it = de("Italia");
  assert.equal(it.length, 1);
  assert.equal(it[0].titulo, "Disposizioni per la protezione dei dati (ficticio)");
  assert.equal(it[0].url, "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2018-08-10;999");
  assert.equal(it[0].idOficial, "18G99999");
});

test("Reino Unido: HTTP 202 se reintenta y luego entrega resultados", async () => {
  let veces = 0;
  const { est, de } = await buscar([[/legislation\.gov\.uk\/search\/data\.feed/, () => (++veces === 1 ? new Response("", { status: 202 }) : xml(fxReal("uk_atom.xml")))]]);
  assert.equal(veces, 2);
  assert.equal(est("Reino Unido").estado, "ok");
  assert.ok(de("Reino Unido").length > 0);
});

test("Reino Unido: 202 persistente = no_disponible tras 4 intentos", async () => {
  const { est, de } = await buscar([[/legislation\.gov\.uk\/search\/data\.feed/, () => new Response("", { status: 202 })]]);
  assert.equal(llamadaA(/legislation\.gov\.uk/).length, 4);
  assert.equal(est("Reino Unido").estado, "no_disponible");
  assert.match(est("Reino Unido").motivo!, /HTTP 202/);
  assert.equal(de("Reino Unido").length, 0);
});

test("la consulta se traduce con UNA sola llamada a la IA para los 11 conectores que traducen", async () => {
  await conVariables({ LEGIFRANCE_CLIENT_ID: "id-falso", LEGIFRANCE_CLIENT_SECRET: "secreto-falso", CONGRESS_API_KEY: "clave-falsa" }, async () => {
    await buscar([[/./, () => new Response("error", { status: 500 })]]);
    assert.equal(llamadasIA, 1);
  });
});

test("todas las fuentes con HTTP 500: las 29 quedan no_disponible y NO se inventa ninguna norma", async () => {
  await conVariables({ LEGIFRANCE_CLIENT_ID: "id-falso", LEGIFRANCE_CLIENT_SECRET: "secreto-falso", CONGRESS_API_KEY: "clave-falsa" }, async () => {
    const { r } = await buscar([[/./, () => new Response("error", { status: 500 })]]);
    assert.equal(r.estados.length, 29);
    // Uruguay no consulta la red si la consulta no trae número y año de ley: queda sin_resultados.
    assert.deepEqual(r.estados.filter((e) => e.estado !== "no_disponible").map((e) => e.jurisdiccion), ["Uruguay"]);
    assert.equal(r.normas.length, 0);
  });
});

test("respuestas vacías: cada conector nuevo informa sin_resultados", async () => {
  const congreso = Math.floor((new Date().getUTCFullYear() - 1789) / 2) + 1;
  const sparqlVacio = () => json(JSON.stringify({ results: { bindings: [] } }));
  await conVariables({ LEGIFRANCE_CLIENT_ID: "id-falso", LEGIFRANCE_CLIENT_SECRET: "secreto-falso", CONGRESS_API_KEY: "clave-falsa" }, async () => {
    const { r, est } = await buscar([
      [/legislation\.gov\.au/, () => json(JSON.stringify({ value: [] }))],
      [/overheid\.nl/, () => xml("<searchRetrieveResponse><numberOfRecords>0</numberOfRecords></searchRetrieveResponse>")],
      [/e-gov\.go\.jp/, () => json(JSON.stringify({ laws: [] }))],
      [/fedlex|legilux/, sparqlVacio],
      [/sejm\.gov\.pl/, () => json(JSON.stringify({ items: [] }))],
      [/riksdagen\.se/, () => json(JSON.stringify({ dokumentlista: { "@traffar": "0" } }))],
      [/rechtsinformationen/, () => json(JSON.stringify({ member: [] }))],
      [/oauth\.piste/, () => json(JSON.stringify({ access_token: "token-falso" }))],
      [/api\.piste/, () => json(JSON.stringify({ results: [] }))],
      [new RegExp(`congress\\.gov/v3/law/(${congreso}|${congreso - 1})\\?`), () => json(JSON.stringify({ bills: [] }))],
      [/normattiva/, () => json(JSON.stringify({ listaAtti: [] }))],
    ]);
    for (const j of ["Australia", "Países Bajos", "Japón", "Suiza", "Luxemburgo", "Polonia", "Suecia", "Alemania", "Francia", "Estados Unidos", "Italia"]) {
      assert.equal(est(j).estado, "sin_resultados", j);
      assert.ok(est(j).motivo, `${j} debe explicar el motivo`);
    }
    assert.equal(r.normas.length, 0);
  });
});

after(() => {
  globalThis.fetch = realFetch;
  for (const k of VARS) delete process.env[k];
});
