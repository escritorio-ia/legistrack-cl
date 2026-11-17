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

/**
 * Modelos de Gemini disponibles para esta clave (se consultan a la API: los nombres fijos quedan obsoletos,
 * como pasó con gemini-2.5-*). Orden: el configurado, luego los "flash" más nuevos, luego los "pro".
 */
let modelosCache: { lista: string[]; en: number } | null = null;
async function modelosGemini(apiKey: string): Promise<string[]> {
  const fijos = [process.env.GEMINI_MODEL, "gemini-3.6-flash"].filter(Boolean) as string[];
  if (modelosCache && Date.now() - modelosCache.en < 6 * 3600_000) return Array.from(new Set([...fijos, ...modelosCache.lista]));
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": apiKey }, signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const d: any = await r.json();
      const version = (n: string) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || "0");
      const lista = (d.models || [])
        .filter((m: any) => (m.supportedGenerationMethods || []).includes("generateContent"))
        .map((m: any) => String(m.name || "").replace(/^models\//, ""))
        .filter((n: string) => /^gemini-\d/.test(n) && /(flash|pro)/.test(n) && !/(image|tts|audio|live|embedding|thinking-exp|preview-tts)/.test(n))
        .sort((a: string, b: string) => (Number(/flash/.test(b)) - Number(/flash/.test(a))) || version(b) - version(a) || Number(/lite/.test(a)) - Number(/lite/.test(b)));
      modelosCache = { lista, en: Date.now() };
      return Array.from(new Set([...fijos, ...lista])).slice(0, 6);
    }
  } catch { /* se usan los fijos */ }
  return fijos;
}
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

  const candidatos = await modelosGemini(apiKey);
  const errores: string[] = [];
  const limite = Date.now() + 270_000;
  const cuerpo = JSON.stringify({
    contents: [{ parts: [{ text: prompt({ comision: p.comision, fecha: p.fecha, tabla: p.tabla || [], boletines: p.boletines || [], transcripcion }) }] }],
    generationConfig: { temperature: 0.15, maxOutputTokens: 16000, responseMimeType: "application/json" },
  });
  for (const model of candidatos) {
    // Saturación temporal (503/429/500): hasta 3 intentos con espera creciente antes de pasar al siguiente modelo.
    for (let intento = 0; intento < 3; intento++) {
      const restante = limite - Date.now();
      if (restante < 20_000) break;
      if (intento > 0) await esperar(intento * 6000);
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: cuerpo,
          signal: AbortSignal.timeout(Math.min(150_000, limite - Date.now())),
        });
        if (!r.ok) {
          errores.push(`${model}: HTTP ${r.status}${intento ? ` (intento ${intento + 1})` : ""}`);
          if ([503, 429, 500, 502, 504].includes(r.status)) continue; // reintenta el mismo modelo
          break; // 404 u otro: siguiente modelo
        }
        const data: any = await r.json();
        const texto = (data?.candidates?.[0]?.content?.parts || []).map((x: any) => x.text || "").join("");
        if (!texto) { errores.push(`${model}: respuesta vacía (${data?.candidates?.[0]?.finishReason || "sin motivo"})`); break; }
        const informe = validarInforme(extraerJSON(texto), segmentos, p.boletines || [], !!p.parcial);
        if (!informe.resumen && informe.puntos.length === 0) { errores.push(`${model}: informe sin contenido verificable`); break; }
        return { disponible: true, informe: { ...informe, modelo: model, generado: new Date().toISOString() } };
      } catch (err: any) {
        errores.push(`${model}: ${err?.name === "TimeoutError" ? "sin respuesta a tiempo" : err?.message || err}`);
        break;
      }
    }
  }
  const saturado = errores.some((e) => /HTTP (503|429)/.test(e));
  return { disponible: false, motivo: `${saturado ? "Gemini está saturado en este momento; intente de nuevo en unos minutos (la transcripción ya está guardada). " : "No se pudo generar el informe. "}Detalle: ${errores.join(" | ")}` };
}
