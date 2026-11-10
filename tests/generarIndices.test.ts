import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// @ts-ignore script .mjs sin tipos
import { leyNoruega, leerCsv } from "../scripts/indices/generar-indices.mjs";

test("índice Noruega: extrae metadatos del documento de Lovdata", () => {
  const html = `<html><head><title>T</title></head><body><dl class="data-document-key-info"><dd class="dokid">NL/lov/2018-06-15-38</dd><dd class="ministry"><ul><li>Justis- og beredskapsdepartementet</li></ul></dd><dd class="lastChangeInForce">2023-07-01</dd><dd class="titleShort">Personopplysningsloven</dd><dd class="title">Lov om behandling av personopplysninger</dd></dl></body></html>`;
  assert.deepEqual(leyNoruega(html), { id: "NL/lov/2018-06-15-38", titulo: "Lov om behandling av personopplysninger", corto: "Personopplysningsloven", fecha: "2018-06-15", ministerio: "Justis- og beredskapsdepartementet", ultimaModificacion: "2023-07-01", url: "https://lovdata.no/dokument/NL/lov/2018-06-15-38" });
  assert.equal(leyNoruega("<html></html>"), null);
});

test("índice Argentina: el CSV soporta comillas, comas y saltos de línea dentro de campos", async () => {
  const ruta = join(mkdtempSync(join(tmpdir(), "csv-")), "a.csv");
  writeFileSync(ruta, '﻿id_norma,tipo_norma,titulo_sumario\r\n1,Ley,"Datos, ""personales""\ny más"\n2,Decreto,x\n');
  const filas: string[][] = [];
  await leerCsv(ruta, (c: string[]) => filas.push(c));
  assert.deepEqual(filas, [["﻿id_norma", "tipo_norma", "titulo_sumario"], ["1", "Ley", 'Datos, "personales"\ny más'], ["2", "Decreto", "x"]]);
});

// @ts-ignore
import { leyCroacia } from "../scripts/indices/generar-indices.mjs";
test("índice Croacia: solo leyes (ZAKON) con título, fecha y ELI", () => {
  const E = "http://data.europa.eu/eli/ontology#";
  const md = (tipo: string, titulo: string) => [
    { "@id": "x" },
    { "@id": "r", "@type": [`${E}LegalResource`], [`${E}type_document`]: [{ "@id": `https://narodne-novine.nn.hr/resource/authority/document-type/${tipo}` }], [`${E}date_document`]: [{ "@value": "2018-04-27" }], [`${E}date_publication`]: [{ "@value": "2018-05-09" }] },
    { "@id": "e", "@type": [`${E}LegalExpression`], [`${E}title`]: [{ "@value": titulo }] },
  ];
  assert.deepEqual(leyCroacia(md("ZAKON", "Zakon o provedbi Opće uredbe o zaštiti podataka"), 2018, 42, "805"), { id: "2018/42/805", titulo: "Zakon o provedbi Opće uredbe o zaštiti podataka", tipo: "ZAKON", fecha: "2018-04-27", publicada: "2018-05-09", url: "https://narodne-novine.nn.hr/eli/sluzbeni/2018/42/805" });
  assert.equal(leyCroacia(md("ODLUKA", "Odluka"), 2018, 42, "818"), null);
});
