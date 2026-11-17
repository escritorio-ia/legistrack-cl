/**
 * Informe de sesión generado con Gemini SOLO a partir de la transcripción guardada de la sesión.
 * El resultado se valida contra la transcripción (minutos, oradores, boletines) antes de entregarlo.
 */
import { InformeSesion, SegmentoInforme, transcripcionParaPrompt, validarInforme } from "../../src/utils/informeSesion";

const MAX_CARACTERES = 700_000;

function prompt(p: { comision: string; fecha: string; tabla: string[]; boletines: string[]; transcripcion: string }): string {
  return `Eres asesor parlamentario de la Biblioteca del Congreso Nacional de Chile. Redacta el informe de una sesión de comisión
usando EXCLUSIVAMENTE la transcripción que sigue. No agregues nada que no esté dicho en ella: ni antecedentes, ni cifras, ni nombres externos.

Comisión: ${p.comision || "No informada"}
Fecha: ${p.fecha || "No informada"}
Tabla oficial de la sesión:
${p.tabla.length ? p.tabla.map((t, i) => `${i + 1}. ${t}`).join("\n") : "No informada"}
Boletines de la tabla: ${p.boletines.join(", ") || "ninguno"}

Reglas:
- Ordena el informe por los puntos de la tabla (usa su número). Lo que no corresponda a la tabla va con "numero": 0.
- "minuto" es el minuto EXACTO de la línea de la transcripción que respalda el dato, copiado tal cual aparece entre corchetes (ej. "1:02:15").
- "orador" se copia tal cual aparece en la transcripción. Si es "Orador no identificado", no lo incluyas como intervención.
- "postura": qué planteó o pidió el orador, en una o dos oraciones, en tercera persona.
- Acuerdos y votaciones: solo si se dicen explícitamente en la transcripción (incluye el resultado si se dice).
- Compromisos: tareas o envíos de información comprometidos (quién y qué).
- Pendientes: temas que quedaron para otra sesión, si se dice.
- Si algo no está en la transcripción, deja la lista vacía. Español formal y conciso.

Responde solo JSON con esta forma:
{"resumen":"3 a 5 oraciones","puntos":[{"numero":1,"titulo":"","boletines":["00000-00"],"sintesis":"","intervenciones":[{"orador":"","cargo":"","minuto":"","postura":""}],"acuerdos":[{"texto":"","minuto":""}],"votaciones":[{"texto":"","resultado":"","minuto":""}]}],"compromisos":[{"texto":"","responsable":"","minuto":""}],"pendientes":[""]}

TRANSCRIPCIÓN:
${p.transcripcion}`;
}

function extraerJSON(texto: string): any {
  const t = String(texto || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(t); } catch { /* sigue */ }
  const i = t.indexOf("{"), j = t.lastIndexOf("}");
  if (i >= 0 && j > i) return JSON.parse(t.slice(i, j + 1));
  throw new Error("La respuesta del modelo no es JSON válido.");
}

export async function generarInformeSesion(p: {
  segmentos: SegmentoInforme[]; tabla: string[]; boletines: string[]; comision: string; fecha: string; parcial: boolean;
}): Promise<{ disponible: true; informe: InformeSesion } | { disponible: false; motivo: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { disponible: false, motivo: "GEMINI_API_KEY no está configurada en el servidor." };
  const segmentos = (p.segmentos || []).filter((g) => g && Number.isFinite(Number(g.segundos)) && String(g.texto || "").trim())
    .map((g) => ({ segundos: Number(g.segundos), orador: String(g.orador || ""), texto: String(g.texto) }));
  if (segmentos.length < 5) return { disponible: false, motivo: "La transcripción tiene muy poco texto para redactar un informe." };
  let transcripcion = transcripcionParaPrompt(segmentos);
  if (transcripcion.length > MAX_CARACTERES) return { disponible: false, motivo: "La transcripción excede el tamaño que se puede procesar en una sola consulta." };

  const candidatos = Array.from(new Set([process.env.GEMINI_MODEL, "gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"].filter(Boolean) as string[]));
  const errores: string[] = [];
  const limite = Date.now() + 270_000;
  for (const model of candidatos) {
    const restante = limite - Date.now();
    if (restante < 20_000) break;
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt({ comision: p.comision, fecha: p.fecha, tabla: p.tabla || [], boletines: p.boletines || [], transcripcion }) }] }],
          generationConfig: { temperature: 0.15, maxOutputTokens: 16000, responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(Math.min(150_000, restante)),
      });
      if (!r.ok) {
        errores.push(`${model}: HTTP ${r.status}`);
        if ([429, 404, 500, 502, 503, 504].includes(r.status)) continue;
        break;
      }
      const data: any = await r.json();
      const texto = (data?.candidates?.[0]?.content?.parts || []).map((x: any) => x.text || "").join("");
      if (!texto) { errores.push(`${model}: respuesta vacía (${data?.candidates?.[0]?.finishReason || "sin motivo"})`); continue; }
      const informe = validarInforme(extraerJSON(texto), segmentos, p.boletines || [], !!p.parcial);
      if (!informe.resumen && informe.puntos.length === 0) { errores.push(`${model}: informe sin contenido verificable`); continue; }
      return { disponible: true, informe: { ...informe, modelo: model, generado: new Date().toISOString() } };
    } catch (err: any) {
      errores.push(`${model}: ${err?.name === "TimeoutError" ? "sin respuesta a tiempo" : err?.message || err}`);
    }
  }
  return { disponible: false, motivo: `No se pudo generar el informe. ${errores.join(" | ")}` };
}
