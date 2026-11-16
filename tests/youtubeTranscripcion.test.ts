/**
 * Transcripción y análisis de videos de sesiones (Gemini con el enlace de YouTube). NO hacen llamadas de red:
 * las respuestas de Gemini están simuladas (los textos son ficticios). Ejecutar: npm run test:fuentes
 * Cubren también el análisis por tramos (analizarParteVideo), cuya llamada a Gemini se movió a un helper compartido.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";

for (const k of ["GEMINI_VIDEO_API_KEY", "GEMINI_VIDEO_MODEL", "GEMINI_MODEL"]) delete process.env[k];
process.env.GEMINI_API_KEY = "clave-falsa-solo-para-pruebas";

const realFetch = globalThis.fetch;
type Llamada = { url: string; body: any; headers: Record<string, string> };
let llamadas: Llamada[] = [];
let responder: (n: number, url: string) => Response = () => new Response("sin escenario", { status: 500 });

globalThis.fetch = (async (input: any, init?: any) => {
  const url = String(input?.url || input);
  llamadas.push({ url, body: JSON.parse(String(init?.body || "{}")), headers: init?.headers || {} });
  return responder(llamadas.length, url);
}) as typeof fetch;

const gemini = (obj: unknown) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: typeof obj === "string" ? obj : JSON.stringify(obj) }] } }] }), { status: 200, headers: { "content-type": "application/json" } });
const error = (status: number, mensaje = "error") => new Response(JSON.stringify({ error: { message: mensaje } }), { status, headers: { "content-type": "application/json" } });
const reiniciar = (fn: typeof responder) => { llamadas = []; responder = fn; };

test("transcripción: segmentos con minuto absoluto, orador por defecto y tramo pedido a Gemini", async () => {
  const { transcribirParteVideo, AVISO_TRANSCRIPCION } = await import("../server/services/youtubeService");
  reiniciar(() => gemini({ segmentos: [
    { minuto: "0:00:40", orador: "Presidenta (ficticia)", texto: "Se abre la sesión (texto ficticio)." },
    { minuto: "0:00:05", orador: "", texto: "Buenos días (texto ficticio)." },
    { minuto: "0:01:10", orador: "Diputado Prueba", texto: "   " },
  ] }));
  const r = await transcribirParteVideo({ videoId: "trans_00001", parte: 1, duracion: 5000, comision: "Comisión de Prueba", fecha: "2026-11-03" });
  assert.equal(r.disponible, true);
  assert.equal(r.desde, 600);
  assert.equal(r.hasta, 1200);
  const b = llamadas[0].body;
  assert.equal(b.contents[0].parts[0].videoMetadata.startOffset, "600s");
  assert.equal(b.contents[0].parts[0].videoMetadata.endOffset, "1200s");
  assert.equal(b.contents[0].parts[0].fileData.fileUri, "https://www.youtube.com/watch?v=trans_00001");
  assert.match(b.contents[0].parts[1].text, /Comisión de Prueba/);
  assert.equal(llamadas[0].headers["x-goog-api-key"], "clave-falsa-solo-para-pruebas", "la clave va en el encabezado, no en la URL");
  assert.doesNotMatch(llamadas[0].url, /clave-falsa/);
  // los minutos venían relativos al tramo (todos < 600 s): se pasan al video completo y se ordenan; el segmento vacío se descarta
  assert.deepEqual(r.segmentos!.map((x) => x.segundos), [605, 640]);
  assert.equal(r.segmentos![0].orador, "No identificado");
  assert.equal(r.segmentos![1].orador, "Presidenta (ficticia)");
  assert.equal(r.aviso, AVISO_TRANSCRIPCION);
  assert.match(r.aviso!, /no es el texto oficial/);
});

test("transcripción: los minutos ya absolutos no se alteran", async () => {
  const { transcribirParteVideo } = await import("../server/services/youtubeService");
  reiniciar(() => gemini({ segmentos: [{ minuto: "0:10:30", orador: "A", texto: "uno (ficticio)" }, { minuto: "0:15:00", orador: "B", texto: "dos (ficticio)" }] }));
  const r = await transcribirParteVideo({ videoId: "trans_00002", parte: 1, duracion: 5000 });
  assert.deepEqual(r.segmentos!.map((x) => x.segundos), [630, 900]);
});

test("transcripción: solo se guarda el éxito; un fallo se reintenta", async () => {
  const { transcribirParteVideo } = await import("../server/services/youtubeService");
  reiniciar(() => error(429, "cuota"));
  const falla = await transcribirParteVideo({ videoId: "trans_00003", parte: 0, duracion: 900 });
  assert.equal(falla.disponible, false);
  assert.match(falla.motivo!, /no tiene cuota disponible/);
  assert.equal(llamadas.length, 3, "se probaron los 3 modelos");

  reiniciar(() => gemini({ segmentos: [{ minuto: "0:00:10", orador: "A", texto: "hola (ficticio)" }] }));
  const ok = await transcribirParteVideo({ videoId: "trans_00003", parte: 0, duracion: 900 });
  assert.equal(ok.disponible, true, "el fallo anterior no quedó en caché");
  assert.equal(llamadas.length, 1);

  reiniciar(() => error(500));
  const cacheado = await transcribirParteVideo({ videoId: "trans_00003", parte: 0, duracion: 900 });
  assert.equal(cacheado.disponible, true);
  assert.equal(llamadas.length, 0, "el éxito se sirve desde la caché sin llamar a Gemini");
});

test("transcripción: pasa al siguiente modelo si el primero no existe (404)", async () => {
  const { transcribirParteVideo } = await import("../server/services/youtubeService");
  reiniciar((n) => (n === 1 ? error(404, "modelo no encontrado") : gemini({ segmentos: [{ minuto: "0:00:03", orador: "A", texto: "ok (ficticio)" }] })));
  const r = await transcribirParteVideo({ videoId: "trans_00004", parte: 0, duracion: 600 });
  assert.equal(r.disponible, true);
  assert.equal(llamadas.length, 2);
  assert.match(llamadas[0].url, /gemini-3\.6-flash/);
  assert.match(llamadas[1].url, /gemini-2\.5-flash:/);
  assert.equal(r.modelo, "gemini-2.5-flash");
});

test("transcripción: validaciones sin llamar a Gemini (ID inválido, tramo fuera del video, JSON ilegible, sin clave)", async () => {
  const { transcribirParteVideo } = await import("../server/services/youtubeService");
  reiniciar(() => gemini({ segmentos: [] }));
  assert.match((await transcribirParteVideo({ videoId: "corto", parte: 0 })).motivo!, /no válido/);
  assert.match((await transcribirParteVideo({ videoId: "trans_00005", parte: 9, duracion: 1000 })).motivo!, /fuera de la duración/);
  assert.equal(llamadas.length, 0);

  reiniciar(() => gemini("esto no es JSON"));
  assert.match((await transcribirParteVideo({ videoId: "trans_00006", parte: 0, duracion: 600 })).motivo!, /no devolvió texto para este tramo/);

  const clave = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    reiniciar(() => gemini({ segmentos: [] }));
    assert.match((await transcribirParteVideo({ videoId: "trans_00007", parte: 0, duracion: 600 })).motivo!, /GEMINI_API_KEY/);
    assert.equal(llamadas.length, 0);
  } finally {
    process.env.GEMINI_API_KEY = clave;
  }
});

test("transcripción: un tramo sin habla solo es válido si el modelo lo declara; una respuesta vacía es una falla", async () => {
  const { transcribirParteVideo } = await import("../server/services/youtubeService");
  reiniciar(() => gemini({ segmentos: [], sinVoz: true }));
  const r = await transcribirParteVideo({ videoId: "trans_00008", parte: 0, duracion: 600 });
  assert.equal(r.disponible, true);
  assert.deepEqual(r.segmentos, []);
  // Vacío sin declarar "sinVoz" (lo observado en producción): no se presenta como transcripción completa ni se guarda.
  reiniciar(() => gemini({ segmentos: [] }));
  const v = await transcribirParteVideo({ videoId: "trans_00009", parte: 0, duracion: 600 });
  assert.equal(v.disponible, false);
  assert.match(v.motivo!, /no devolvió texto/);
  const antes = llamadas.length;
  await transcribirParteVideo({ videoId: "trans_00009", parte: 0, duracion: 600 });
  assert.ok(llamadas.length > antes, "la falla no queda en caché: se reintenta");
});

test("análisis por tramos (refactor): intervenciones con minuto absoluto y tramo de 30 min", async () => {
  const { analizarParteVideo } = await import("../server/services/youtubeService");
  reiniciar(() => gemini({
    resumen: "Resumen ficticio.", temas: ["Boletín 0000-00 (ficticio)"],
    intervenciones: [{ minuto: "0:02:00", orador: "Ministra (ficticia)", cargo: "Ministerio de Prueba", resumen: "Planteó algo (ficticio).", cita: "frase breve (ficticia)" }, { minuto: "0:01:00", resumen: "Sin orador (ficticio)." }],
    acuerdos: ["Acuerdo ficticio"], votaciones: [],
  }));
  const r = await analizarParteVideo({ videoId: "anal_000001", parte: 1, duracion: 4000 });
  assert.equal(r.disponible, true);
  assert.equal(r.desde, 1800);
  assert.equal(r.hasta, 3600);
  assert.equal(llamadas[0].body.contents[0].parts[0].videoMetadata.startOffset, "1800s");
  assert.deepEqual(r.intervenciones!.map((i) => i.segundos), [1920, 1860], "minutos relativos pasados al video completo");
  assert.equal(r.intervenciones![1].orador, "No identificado");
  assert.deepEqual(r.acuerdos, ["Acuerdo ficticio"]);
  assert.equal(r.modelo, "gemini-3.6-flash");
});

test("análisis por tramos (refactor): errores y caché igual que antes", async () => {
  const { analizarParteVideo } = await import("../server/services/youtubeService");
  reiniciar(() => error(403, "clave rechazada"));
  const falla = await analizarParteVideo({ videoId: "anal_000002", parte: 0, duracion: 900 });
  assert.equal(falla.disponible, false);
  assert.match(falla.motivo!, /HTTP 403/);
  assert.equal(llamadas.length, 1, "un 403 no se reintenta con otro modelo");

  reiniciar(() => gemini({ resumen: "Resumen ficticio.", intervenciones: [] }));
  assert.equal((await analizarParteVideo({ videoId: "anal_000002", parte: 0, duracion: 900 })).disponible, true);
  reiniciar(() => error(500));
  assert.equal((await analizarParteVideo({ videoId: "anal_000002", parte: 0, duracion: 900 })).disponible, true);
  assert.equal(llamadas.length, 0);
});

after(() => { globalThis.fetch = realFetch; delete process.env.GEMINI_API_KEY; });

test("transcripción: acepta las formas de respuesta del modelo y rescata JSON cortado", async () => {
  const { segmentosDeRespuesta } = await import("../server/services/youtubeService");
  const seg = { minuto: "0:10:05", orador: "Persona (ficticia)", texto: "Texto de prueba." };
  assert.equal(segmentosDeRespuesta(JSON.stringify({ segmentos: [seg] })).crudos.length, 1);
  assert.equal(segmentosDeRespuesta(JSON.stringify([seg, seg])).crudos.length, 2, "arreglo directo");
  assert.equal(segmentosDeRespuesta(JSON.stringify({ transcripcion: [seg] })).crudos.length, 1, "otra clave");
  assert.equal(segmentosDeRespuesta(`{"segmentos":[${JSON.stringify(seg)},{"minuto":"0:11:00","orador":"X","texto":"cortad`).crudos.length, 1, "JSON cortado: se rescata el segmento completo");
  assert.deepEqual(segmentosDeRespuesta(JSON.stringify({ segmentos: [], sinVoz: true })), { crudos: [], sinVoz: true });
  assert.deepEqual(segmentosDeRespuesta(JSON.stringify({ segmentos: [] })), { crudos: [], sinVoz: false });
  assert.deepEqual(segmentosDeRespuesta(""), { crudos: [], sinVoz: false });
});
