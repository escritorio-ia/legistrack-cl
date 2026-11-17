import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularInformeComision, informeATexto } from "../src/utils/informeComision";

const ses = (fecha: string, puntos: any[], extra: any = {}) => ({ id: fecha, camara: "Senado", comisionNombre: "Hacienda", fecha, boletines: puntos.flatMap((p) => p.boletines), fuentes: ["citacion"], hora: "15:00", lugar: null, citacionNumero: null, materia: null, puntos, invitados: null, resultado: null, enlaces: [], ...extra });

test("informe de comisión: boletines, cronología, período y videos por fecha", () => {
  const registro = [
    ses("2026-10-01", [{ numero: 1, texto: "Inicia discusión del proyecto (Boletín N° 18702-05)", boletines: ["18702-05"] }]),
    ses("2026-11-03", [{ numero: 1, texto: "Votación en particular", boletines: ["18702-05"], acuerdos: "Se aprobó el artículo 1" }, { numero: 2, texto: "Audiencias", boletines: ["18860-15"] }], { invitados: "Ministro de Hacienda" }),
    ses("2026-12-01", [{ numero: 1, texto: "Continúa", boletines: ["18702-05"] }]),
    ses("2025-01-10", [{ numero: 1, texto: "Antigua", boletines: ["10000-01"] }]),
  ];
  const videos = [{ videoId: "v1", fechaISO: "2026-11-03", resumenes: ["Se votó el artículo 1."], acuerdos: [], votaciones: [], oradores: ["Sen. Pérez", "Sen. Pérez", "Orador no identificado"] }];
  const inf = calcularInformeComision(registro as any, videos, "2026-09-01", new Date(2026, 10, 17));
  assert.equal(inf.realizadas, 2);
  assert.equal(inf.programadas, 1);
  assert.equal(inf.boletines[0].boletin, "18702-05");
  assert.equal(inf.boletines[0].sesiones, 2);
  assert.equal(inf.boletines[0].ultima, "2026-11-03");
  assert.ok(!inf.boletines.some((b) => b.boletin === "10000-01"), "fuera del período");
  assert.equal(inf.cronologia[0].fecha, "2026-11-03");
  assert.equal(inf.cronologia[0].video?.videoId, "v1");
  assert.deepEqual(inf.oradores, [{ nombre: "Sen. Pérez", intervenciones: 2 }]);
  assert.equal(inf.sesionesConVideo, 1);
  const txt = informeATexto("Hacienda", "Senado", inf);
  assert.match(txt, /18702-05: 2 sesión/);
  assert.match(txt, /Acuerdos: Se aprobó el artículo 1/);
});
