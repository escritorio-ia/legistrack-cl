/**
 * Conectores agregados: Austria (RIS), Finlandia (Finlex), Brasil (Câmara), Irlanda (Oireachtas),
 * Corea del Sur (law.go.kr) y Estonia (Riigi Teataja). Sin red: fetch simulado.
 * Las respuestas reproducen la FORMA verificada de cada API (nov. 2026) con datos ficticios,
 * salvo Corea, cuya forma no se pudo verificar sin el código OC.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";

for (const k of ["GEMINI_API_KEY", "GEMINI_VIDEO_API_KEY", "OPENROUTER_API_KEY", "CEREBRAS_API_KEY", "GROQ_API_KEY", "ANTHROPIC_API_KEY", "KOREA_LAW_OC"]) delete process.env[k];
process.env.GEMINI_API_KEY = "clave-falsa-solo-para-pruebas";

const realFetch = globalThis.fetch;
after(() => { globalThis.fetch = realFetch; });
const json = (o: unknown, status = 200) => new Response(typeof o === "string" ? o : JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const TRAD = { en: "data protection", nl: "x", ja: "x", fr: "x", pl: "x", sv: "x", de: "Datenschutz", it: "x", fi: "tietosuoja", pt: "proteção de dados", ko: "개인정보", et: "isikuandme", da: "databeskyttelse", he: "פרטיות", zh: "個人資料保護", nb: "personopplysning", hr: "podatak" };
let urls: string[] = [];
function simular(rutas: Array<[RegExp, (u: string) => Response]>) {
  urls = [];
  globalThis.fetch = (async (input: any) => {
    const u = String(input?.url || input);
    if (/generativelanguage/.test(u)) return json({ candidates: [{ content: { parts: [{ text: JSON.stringify(TRAD) }] } }] });
    urls.push(u);
    for (const [re, fn] of rutas) if (re.test(u)) return fn(u);
    throw new Error("sin ruta " + u);
  }) as typeof fetch;
}
let n = 0;
const q = () => `protección de datos amp ${++n}`;
const mod = () => import("../server/services/fuentesOficialesService");

const ref = (k: string, kurz: string, typ: string) => ({ Data: { Metadaten: { Bundesrecht: { Kurztitel: kurz, Titel: kurz, BrKons: { Gesetzesnummer: k, Typ: typ, Inkrafttretensdatum: "2018-05-25", StammnormPublikationsorgan: "BGBl. I Nr.", StammnormBgblnummer: "1/2018" } } } } });

test("Austria: agrupa los § por ley, prioriza Bundesgesetz y enlaza al RIS público", async () => {
  simular([[/data\.bka\.gv\.at/, () => json({ OgdSearchResult: { OgdDocumentResults: { OgdDocumentReference: [ref("1", "Verordnung A", "V"), ref("1", "Verordnung A", "V"), ref("2", "Gesetz B", "BG")] } } })]]);
  const r = await (await mod()).buscarAustria(q());
  assert.equal(r.estado.estado, "ok");
  assert.deepEqual(r.normas.map((x) => x.idOficial), ["2", "1"]);
  assert.match(r.normas[0].url, /^https:\/\/www\.ris\.bka\.gv\.at\/GeltendeFassung\.wxe\?Abfrage=Bundesnormen&Gesetzesnummer=2$/);
  assert.match(urls[0], /Titel=Datenschutz&FassungVom=\d{4}-\d{2}-\d{2}/);
});

test("Austria: sin resultados y error de API", async () => {
  simular([[/data\.bka\.gv\.at/, () => json({ OgdSearchResult: { OgdDocumentResults: { Hits: { "#text": "0" } } } })]]);
  assert.equal((await (await mod()).buscarAustria(q())).estado.estado, "sin_resultados");
  simular([[/data\.bka\.gv\.at/, () => json("x", 500)]]);
  const r = await (await mod()).buscarAustria(q());
  assert.equal(r.estado.estado, "no_disponible");
  assert.equal(r.normas.length, 0);
});

test("Finlandia: lee título, fecha y ELI del documento oficial; descarta los que no tienen título", async () => {
  const F = "https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated";
  simular([
    [/\/list\?/, () => json([{ akn_uri: `${F}/2018/1050/fin@`, status: "MODIFIED" }, { akn_uri: `${F}/1999/1/fin@`, status: "MODIFIED" }])],
    [/2018\/1050/, () => new Response(`<akn><FRBRalias name="eli" value="http://data.finlex.fi/eli/sd/2018/1050/ajantasa"/><FRBRdate date="2018-12-05" name="dateIssued"/><docTitle>Tietosuojalaki</docTitle></akn>`, { status: 200 })],
    [/1999\/1/, () => new Response(`<akn></akn>`, { status: 200 })],
  ]);
  const r = await (await mod()).buscarFinlandia(q());
  assert.equal(r.estado.estado, "ok");
  assert.equal(r.normas.length, 1);
  assert.deepEqual([r.normas[0].titulo, r.normas[0].fecha, r.normas[0].url, r.normas[0].idOficial], ["Tietosuojalaki", "2018-12-05", "https://data.finlex.fi/eli/sd/2018/1050/ajantasa", "2018/1050"]);
  assert.match(urls[0], /titleContains=tietosuoja/);
});

test("Brasil: proyectos de ley de la Cámara, marcados como no vigentes", async () => {
  simular([[/dadosabertos\.camara\.leg\.br/, () => json({ dados: [{ id: 123, numero: 10, ano: 2026, ementa: "Dispõe sobre X.", dataApresentacao: "2026-10-01T10:00" }, { id: 124 }] })]]);
  const r = await (await mod()).buscarBrasil(q());
  assert.equal(r.normas.length, 1);
  assert.equal(r.normas[0].titulo, "PL 10/2026");
  assert.equal(r.normas[0].fecha, "2026-10-01");
  assert.match(r.normas[0].descripcion, /no es norma vigente/);
  assert.match(r.normas[0].url, /idProposicao=123$/);
});

test("Irlanda: filtra por título entre las leyes promulgadas y usa el Irish Statute Book", async () => {
  const act = (t: string, no: string) => ({ bill: { act: { shortTitleEn: t, actNo: no, actYear: "2026", dateSigned: "2026-10-24", statutebookURI: `http://www.irishstatutebook.ie/eli/2026/act/${no}` } } });
  simular([[/api\.oireachtas\.ie/, () => json({ results: [act("Data Protection (Amendment) Act 2026", "37"), act("Planning Act 2026", "38"), { bill: { act: null } }] })]]);
  const m = await mod();
  const r = await m.buscarIrlanda(q());
  assert.deepEqual(r.normas.map((x) => x.idOficial), ["2026/37"]);
  assert.equal(r.normas[0].url, "https://www.irishstatutebook.ie/eli/2026/act/37");
  await m.buscarIrlanda(q());
  assert.equal(urls.length, 1, "la lista de leyes queda en caché 24 h");
});

test("Corea: sin KOREA_LAW_OC no consulta y queda no_disponible; con clave no expone el OC en los enlaces", async () => {
  simular([]);
  const m = await mod();
  const a = await m.buscarCorea(q());
  assert.equal(a.estado.estado, "no_disponible");
  assert.equal(urls.length, 0);
  process.env.KOREA_LAW_OC = "oc-falso";
  try {
    simular([[/law\.go\.kr/, () => json({ LawSearch: { law: [{ "법령명한글": "개인정보 보호법", "공포일자": "20230314", "시행일자": "20230915", "법령구분명": "법률", "법령ID": "011357", "법령상세링크": "/DRF/lawService.do?OC=oc-falso&MST=1" }] } })]]);
    const r = await m.buscarCorea(q());
    assert.equal(r.normas.length, 1);
    assert.equal(r.normas[0].fecha, "2023-03-14");
    assert.ok(!r.normas[0].url.includes("oc-falso"));
    simular([[/law\.go\.kr/, () => json({ result: "필수입력요소 검증에 실패하였습니다.", msg: "error" })]]);
    assert.equal((await m.buscarCorea(q())).estado.estado, "no_disponible");
  } finally { delete process.env.KOREA_LAW_OC; }
});

test("Estonia: solo leyes vigentes, una por título", async () => {
  simular([[/riigiteataja\.ee/, () => json({ staatus: "OK", aktid: [
    { globaalID: 1, pealkiri: "Isikuandmete kaitse seadus", kehtivus: { algus: "2019-01-15", lopp: null }, liik: "seadus", mitteJoustunud: false },
    { globaalID: 2, pealkiri: "Isikuandmete kaitse seadus", kehtivus: { algus: "2019-01-15", lopp: null }, liik: "seadus", mitteJoustunud: false },
    { globaalID: 3, pealkiri: "Vana seadus", kehtivus: { algus: "2002-01-01", lopp: "2010-12-31" }, liik: "seadus" },
  ] })]]);
  const r = await (await mod()).buscarEstonia(q());
  assert.deepEqual(r.normas.map((x) => x.url), ["https://www.riigiteataja.ee/akt/1"]);
  assert.match(urls[0], /dokument=seadus&pealkiri=isikuandme/);
});

test("Brasil (Senado): filtra leyes federales por ementa, sin tildes, la más reciente primero, y no guarda listas incompletas", async () => {
  const doc = (id: string, ementa: string, fecha: string) => ({ id, numero: id, normaNome: `Lei nº ${id}`, ementa, dataassinatura: fecha, apelido: "" });
  simular([[/legis\.senado\.leg\.br/, (u) => {
    if (/ano=2018/.test(u)) return json({ ListaDocumento: { documentos: { documento: [doc("13709", "Lei Geral de Proteção de Dados Pessoais (LGPD).", "14/08/2018")] } } });
    if (/ano=2020/.test(u)) return json({ ListaDocumento: { documentos: { documento: doc("14010", "Altera a proteção de dados pessoais.", "10/06/2020") } } });
    if (/ano=1990/.test(u)) return json("x", 500);
    return json({ ListaDocumento: { documentos: null } });
  }]]);
  const m = await mod();
  const r = await m.buscarBrasilLeyes(q());
  assert.deepEqual(r.normas.map((x) => x.idOficial), ["14010", "13709"]);
  assert.equal(r.normas[1].fecha, "2018-08-14");
  assert.equal(r.normas[1].url, "https://legis.senado.leg.br/norma/13709");
  const antes = urls.length;
  await m.buscarBrasilLeyes(q());
  assert.ok(urls.length > antes, "con un año caído la lista no queda en caché");
});

test("Canadá: filtra el índice Legis.xml por título y solo versiones en inglés", async () => {
  const act = (id: string, t: string, lang = "eng") => `<Act><UniqueId>${id}</UniqueId><Language>${lang}</Language><LinkToHTMLToC>http://laws-lois.justice.gc.ca/eng/acts/${id}/index.html</LinkToHTMLToC><Title>${t}</Title><CurrentToDate>2026-10-19</CurrentToDate></Act>`;
  simular([[/justice\.gc\.ca/, () => new Response(`<Legis>${act("P-1", "Personal Data Protection Act")}${act("P-1f", "Data Protection Loi", "fra")}${act("X-2", "Fisheries Act")}</Legis>`, { status: 200 })]]);
  const r = await (await mod()).buscarCanada(q());
  assert.deepEqual(r.normas.map((x) => x.idOficial), ["P-1"]);
  assert.equal(r.normas[0].url, "https://laws-lois.justice.gc.ca/eng/acts/P-1/index.html");
  assert.equal(r.normas[0].fecha, undefined, "el índice no informa fecha de promulgación: no se inventa");
});

test("Dinamarca: solo proyectos convertidos en ley y enlace ELI de Retsinformation", async () => {
  simular([[/oda\.ft\.dk/, () => json({ value: [{ id: 1, titel: "Forslag til lov om ændring af databeskyttelsesloven.", titelkort: "Om databeskyttelse", nummer: "L 79 B", lovnummer: "1784", lovnummerdato: "2023-12-28T00:00:00", retsinformationsurl: null }, { id: 2, titel: "Sin ley", lovnummer: null }] })]]);
  const r = await (await mod()).buscarDinamarca(q());
  assert.equal(r.normas.length, 1);
  assert.equal(r.normas[0].url, "https://www.retsinformation.dk/eli/lta/2023/1784");
  assert.match(decodeURIComponent(urls[0]), /substringof\('databeskyttelse',titel\) and typeid eq 3 and lovnummer ne null/);
});

test("Israel: leyes vigentes del Knesset con enlace a su ficha oficial", async () => {
  simular([[/knesset\.gov\.il/, () => json({ value: [{ IsraelLawID: 2000234, Name: "חוק הגנת הפרטיות, התשמ\"א-1981", PublicationDate: "1981-03-11T00:00:00", IsBasicLaw: false, LawValidityDesc: "תקף" }, { Name: "sin id" }] })]]);
  const r = await (await mod()).buscarIsrael(q());
  assert.equal(r.normas.length, 1);
  assert.equal(r.normas[0].url, "https://main.knesset.gov.il/apps/legislation/main/laws/2000234");
  assert.equal(r.normas[0].fecha, "1981-03-11");
  assert.match(decodeURIComponent(urls[0]), /substringof\('פרטיות',Name\) and LawValidityDesc eq 'תקף'/);
});

import { deflateRawSync } from "node:zlib";
function zip(nombre: string, contenido: string): Buffer {
  const datos = deflateRawSync(Buffer.from(contenido, "utf8"));
  const h = Buffer.alloc(30); const n = Buffer.from(nombre);
  h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(8, 8); h.writeUInt32LE(datos.length, 18); h.writeUInt16LE(n.length, 26); h.writeUInt16LE(0, 28);
  return Buffer.concat([h, n, datos]);
}

test("Taiwán: lee el ZIP oficial, descarta leyes derogadas y busca en chino o en el nombre oficial en inglés", async () => {
  const ley = (n: string, en: string, abandono = "", nivel = "法律") => ({ LawLevel: nivel, LawName: n, LawURL: `https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=${n.length}X`, LawCategory: "行政", LawModifiedDate: "20251111", LawAbandonNote: abandono, EngLawName: en });
  const json = JSON.stringify({ UpdateDate: "2026/11/01", Laws: [ley("個人資料保護法", "Personal Data Protection Act"), ley("舊個人資料保護法", "Old Data Protection Act", "廢"), ley("漁業法", "Fisheries Act")] });
  simular([[/law\.moj\.gov\.tw/, () => new Response(zip("ChLaw.json", "﻿" + json), { status: 200 })]]);
  const r = await (await mod()).buscarTaiwan(q());
  assert.equal(r.estado.estado, "ok");
  assert.deepEqual(r.normas.map((x) => x.titulo), ["個人資料保護法 (Personal Data Protection Act)"]);
  assert.equal(r.normas[0].fecha, "2025-11-11");
});

const idx = (leyes: any[]) => ({ fuente: "x", url: "x", generado: "2026-11-03T06:20:00Z", total: leyes.length, leyes });

test("Noruega: sin índice generado queda no_disponible; con índice filtra por título", async () => {
  simular([]);
  const m = await mod();
  assert.equal((await m.buscarNoruega(q(), { fuente: null, url: null, generado: null, total: 0, leyes: [] })).estado.estado, "no_disponible");
  const r = await m.buscarNoruega(q(), idx([{ id: "NL/lov/2018-06-15-38", titulo: "Lov om behandling av personopplysninger", fecha: "2018-06-15", url: "https://lovdata.no/dokument/NL/lov/2018-06-15-38" }, { id: "NL/lov/1999-01-01-1", titulo: "Lov om fiske", url: "u" }]));
  assert.deepEqual(r.normas.map((x) => x.idOficial), ["NL/lov/2018-06-15-38"]);
});

test("Argentina: busca en español (sin IA) por título y resumen del índice InfoLEG", async () => {
  simular([]);
  const r = await (await mod()).buscarArgentina("protección datos personales", idx([
    { id: "64790", numero: "25326", fecha: "2000-10-04", titulo: "HABEAS DATA — Protección de los datos personales", url: "https://servicios.infoleg.gob.ar/infolegInternet/verNorma.do?id=64790" },
    { id: "1", numero: "1", titulo: "Pesca", url: "u" },
  ]));
  assert.deepEqual(r.normas.map((x) => x.idOficial), ["64790"]);
  assert.match(r.normas[0].titulo, /^Ley 25326/);
  assert.equal(urls.length, 0, "no llama a la IA ni a la red");
});

test("Uruguay: solo consulta IMPO con número y año; 404 es sin_resultados", async () => {
  const m = await mod();
  assert.deepEqual(m.leyUruguayEnConsulta("ley 18.331 de 2008"), { numero: "18331", anio: "2008" });
  assert.deepEqual(m.leyUruguayEnConsulta("Ley N° 19.889/020"), { numero: "19889", anio: "2020" });
  assert.equal(m.leyUruguayEnConsulta("protección de datos"), null);
  simular([]);
  const sin = await m.buscarUruguay("protección de datos");
  assert.equal(sin.estado.estado, "sin_resultados");
  assert.equal(urls.length, 0);
  simular([[/impo\.com\.uy/, () => new Response(Buffer.from(JSON.stringify({ tipoNorma: "Ley", nroNorma: "18331", anioNorma: "2008", nombreNorma: "LEY DE PROTECCION DE DATOS PERSONALES", fechaPromulgacion: "11/08/2008", fechaPublicacion: "18/08/2008", leyenda: " Documento Actualizado " }), "latin1"), { status: 200, headers: { "content-type": "application/json;charset=ISO-8859-1" } })]]);
  const r = await m.buscarUruguay("ley 18.331 de 2008");
  assert.equal(r.normas[0].url, "https://www.impo.com.uy/bases/leyes/18331-2008");
  assert.equal(r.normas[0].fecha, "2008-08-11");
  simular([[/impo\.com\.uy/, () => new Response("no", { status: 404 })]]);
  assert.equal((await m.buscarUruguay("ley 99.999 de 2020")).estado.estado, "sin_resultados");
});

test("Croacia: sin índice no_disponible; con índice filtra e informa si la carga está incompleta", async () => {
  simular([]);
  const m = await mod();
  assert.equal((await m.buscarCroacia(q(), { fuente: null, url: null, generado: null, total: 0, leyes: [] } as any)).estado.estado, "no_disponible");
  const r = await m.buscarCroacia(q(), { fuente: "x", url: "x", generado: "2026-11-03T10:00:00Z", total: 2, completo: false, aniosDisponibles: [2015, 2026], leyes: [
    { id: "2018/42/805", titulo: "Zakon o provedbi Opće uredbe o zaštiti podataka", tipo: "ZAKON", fecha: "2018-04-27", url: "https://narodne-novine.nn.hr/eli/sluzbeni/2018/42/805" },
    { id: "2019/1/1", titulo: "Zakon o ribarstvu", tipo: "ZAKON", url: "u" },
  ] } as any);
  assert.deepEqual(r.normas.map((x) => x.idOficial), ["2018/42/805"]);
  assert.match(r.estado.consultaUsada || "", /índice aún en carga/);
});
