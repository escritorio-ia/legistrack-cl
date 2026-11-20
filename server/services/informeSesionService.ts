/**
 * Informe de sesión generado con Gemini SOLO a partir de la transcripción guardada de la sesión.
 * El resultado se valida contra la transcripción (minutos, oradores, boletines) antes de entregarlo.
 */
import { InformeSesion, SegmentoInforme, ResultadoOficialSesion, transcripcionParaPrompt, validarInforme } from "../../src/utils/informeSesion";
import { sesionRegistradaPorFecha, fechaISO as fechaRegistroISO } from "./registroSesionesService";
import { actasDeFecha } from "./actasCamaraService";

const MAX_CARACTERES = 700_000;

/** Registro oficial de la sesión (resultado de la comisión, detalle por punto, invitados), si existe. */
async function resultadoOficial(comision: string, fecha: string, hora?: string): Promise<ResultadoOficialSesion | null> {
  const normC = (x: string) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\b(comision|de|del|la|el|y)\b/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  let base: ResultadoOficialSesion | null = null;
  try {
    const s = await sesionRegistradaPorFecha(comision, fecha, hora);
    if (s) {
      const puntos = s.puntos.map((p: any) => ({ numero: p.numero, texto: p.texto, acuerdos: p.acuerdos || null, invitados: p.invitados || null, asistentes: p.asistentes || null }));
      base = { fuentes: s.fuentes, resultado: s.resultado, invitados: s.invitados, puntos, enlaces: s.enlaces };
    }
  } catch { /* sin registro */ }
  // Acta oficial de la Cámara (si la extensión la envió).
  try {
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : fechaRegistroISO(fecha);
    const objetivo = normC(comision);
    const acta = iso ? (await actasDeFecha(iso)).find((a) => { const n = normC(a.comision); return n && objetivo && (n.includes(objetivo) || objetivo.includes(n)); }) : undefined;
    if (acta) {
      base = base || { fuentes: [], resultado: null, invitados: null, puntos: [], enlaces: [] };
      base.acta = acta.texto.slice(0, 40000);
      base.fuentes = [...base.fuentes, "acta oficial de la sesión"];
      base.enlaces = [...base.enlaces, acta.url];
    }
  } catch { /* sin acta */ }
  if (!base) return null;
  if (!base.resultado && !base.invitados && !base.acta && !base.puntos.some((p) => p.acuerdos || p.invitados || p.asistentes)) return null;
  return base;
}

function bloqueOficial(o: ResultadoOficialSesion | null): string {
  if (!o) return "No hay registro oficial de esta sesión.";
  const L = [`Fuentes: ${o.fuentes.join(", ")}`];
  if (o.resultado) L.push(`Resultado oficial: ${o.resultado}`);
  if (o.invitados) L.push(`Invitados citados: ${o.invitados}`);
  if (o.acta) L.push(`Acta oficial de la sesión:\n${o.acta}`);
  for (const p of o.puntos) {
    const extra = [p.acuerdos && `Acuerdos: ${p.acuerdos}`, p.invitados && `Invitados: ${p.invitados}`, p.asistentes && `Asistentes: ${p.asistentes}`].filter(Boolean).join(" | ");
    if (extra) L.push(`Punto ${p.numero}: ${p.texto} | ${extra}`);
  }
  return L.join("\n").slice(0, 60000);
}

function prompt(p: { comision: string; fecha: string; tabla: string[]; boletines: string[]; transcripcion: string; oficial: ResultadoOficialSesion | null }): string {
  return `Eres asesor parlamentario de la Biblioteca del Congreso Nacional de Chile. Redacta el informe de una sesión de comisión
usando EXCLUSIVAMENTE dos fuentes: la transcripción de la sesión y el registro oficial de la comisión (resultado, acuerdos e invitados).
No agregues nada que no esté en ellas: ni antecedentes, ni cifras, ni nombres, ni cargos externos.

Comisión: ${p.comision || "No informada"}
Fecha: ${p.fecha || "No informada"}
Tabla oficial de la sesión:
${p.tabla.length ? p.tabla.map((t, i) => `${i + 1}. ${t}`).join("\n") : "No informada"}
Boletines de la tabla: ${p.boletines.join(", ") || "ninguno"}

REGISTRO OFICIAL DE LA COMISIÓN (resultado de la sesión):
${bloqueOficial(p.oficial)}

USO DEL REGISTRO OFICIAL:
- Acuerdos y votaciones: inclúyelos aunque no se escuchen en la transcripción, con "fuente":"oficial" y "minuto":"" (copia el texto del acuerdo tal como está en el registro). Si también se escuchan en la transcripción, usa "fuente":"transcripcion" con su minuto. No repitas el mismo acuerdo dos veces.
- Nombre completo, cargo e institución de los expositores: tómalos de los invitados del registro cuando correspondan a quien habla en la transcripción.
- Si el registro oficial y la transcripción se contradicen en un resultado, prevalece el registro oficial.

ESTILO del desarrollo (como los informes de comisión del Senado de Chile):
- Relato en tercera persona y en pretérito, en orden cronológico dentro de cada punto de la tabla.
- Cada intervención se presenta con cargo e institución y nombre, si se dicen en la transcripción: "El Subsecretario de Agricultura, señor ...,";
  para parlamentarios: "El Honorable Senador señor ..." / "La Honorable Diputada señora ...". Si no se dice el cargo, déjalo vacío.
- Verbos de relato variados: explicó, señaló, precisó, sostuvo, agregó, consultó, respondió, manifestó, propuso, concluyó.
- Cada intervención en 1 a 4 párrafos de 2 a 4 oraciones, con las ideas, cifras y argumentos que se dicen (solo los dichos).
- Si una misma persona habla varias veces separadas por otras intervenciones, son intervenciones distintas, cada una con su minuto.
- Votaciones como se informan: "Puesto en votación el proyecto, en general, fue aprobado por ..." con el resultado y los votos si se dicen.

CLASIFICACIÓN de cada interviniente ("categoria"):
- "PARL": senadores y diputados.
- "ESP": Expositores del Sector Público: exponen en función de un cargo en representación del Estado (ministerios, servicios, Ejecutivo) o de una misión diplomática; no parlamentarios.
- "ESC": Expositores de organizaciones de la sociedad civil: representan una ONG, partido político, fundación, agrupación, sindicato, asociación gremial, empresa o sociedad.
- "EEA": Expositores expertos y académicos: por su experiencia o trayectoria profesional o académica, o una opinión técnica; académicos, especialistas, think tanks, organismos internacionales técnicos. La Biblioteca del Congreso Nacional (BCN) es siempre "EEA".
- "SEC": secretaría o abogado(a) secretario(a) de la comisión.

Reglas:
- En cada punto se presentan primero las exposiciones de los expositores y al final lo que señalaron los parlamentarios (la app las ordena por categoría; tú solo clasifica bien a cada uno).
- Ordena por los puntos de la tabla (usa su número). Lo que no corresponda a la tabla va con "numero": 0.
- "minuto": el minuto EXACTO de la línea de la transcripción donde empieza esa intervención o dato, copiado tal cual aparece entre corchetes (ej. "1:02:15").
- "orador": tal cual aparece en la transcripción. No incluyas intervenciones de "Orador no identificado".
- "estado" del punto: "Votado", "En discusión", "Solo exposición" o "Pendiente", según lo dicho.
- Acuerdos y votaciones: solo si se dicen explícitamente y son de fondo. NO son acuerdos las prórrogas o extensiones del tiempo de la sesión: no las incluyas. Compromisos: tareas o envíos de información comprometidos (quién y qué).
- Si algo no está en la transcripción, deja el campo vacío o la lista vacía. Español formal.

Responde solo JSON con esta forma:
{"resumen":"un párrafo de 3 a 5 oraciones","sintesis":["3 a 5 ideas clave, una oración cada una"],
"puntos":[{"numero":1,"titulo":"","boletines":["00000-00"],"estado":"","sintesis":"qué se discutió, 2 a 3 oraciones",
"intervenciones":[{"orador":"","cargo":"","institucion":"","categoria":"PARL|ESP|ESC|EEA|SEC","minuto":"","parrafos":["",""]}],
"acuerdos":[{"texto":"","minuto":"","fuente":"transcripcion|oficial"}],"votaciones":[{"texto":"","resultado":"","minuto":"","fuente":"transcripcion|oficial"}]}],
"compromisos":[{"texto":"","responsable":"","minuto":""}],"pendientes":[""]}

TRANSCRIPCIÓN:
${p.transcripcion}`;
}

/**
 * Esquema de salida para Gemini (salida estructurada): obliga a entregar JSON válido con esta forma,
 * evitando respuestas mal formadas (comillas sin escapar, comas faltantes).
 */
const S = (type: string, extra: any = {}) => ({ type, ...extra });
const ESQUEMA = S("OBJECT", {
  properties: {
    resumen: S("STRING"),
    sintesis: S("ARRAY", { items: S("STRING") }),
    puntos: S("ARRAY", { items: S("OBJECT", { properties: {
      numero: S("INTEGER"), titulo: S("STRING"), boletines: S("ARRAY", { items: S("STRING") }), estado: S("STRING"), sintesis: S("STRING"),
      intervenciones: S("ARRAY", { items: S("OBJECT", { properties: {
        orador: S("STRING"), cargo: S("STRING"), institucion: S("STRING"),
        categoria: S("STRING", { enum: ["PARL", "ESP", "ESC", "EEA", "SEC"] }), minuto: S("STRING"),
        parrafos: S("ARRAY", { items: S("STRING") }),
      }, required: ["orador", "categoria", "minuto", "parrafos"] }) }),
      acuerdos: S("ARRAY", { items: S("OBJECT", { properties: { texto: S("STRING"), minuto: S("STRING"), fuente: S("STRING", { enum: ["transcripcion", "oficial"] }) }, required: ["texto", "fuente"] }) }),
      votaciones: S("ARRAY", { items: S("OBJECT", { properties: { texto: S("STRING"), resultado: S("STRING"), minuto: S("STRING"), fuente: S("STRING", { enum: ["transcripcion", "oficial"] }) }, required: ["texto", "fuente"] }) }),
    }, required: ["numero", "titulo", "intervenciones"] }) }),
    compromisos: S("ARRAY", { items: S("OBJECT", { properties: { texto: S("STRING"), responsable: S("STRING"), minuto: S("STRING") }, required: ["texto"] }) }),
    pendientes: S("ARRAY", { items: S("STRING") }),
  },
  required: ["resumen", "puntos"],
});

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

  const oficial = await resultadoOficial(p.comision, p.fecha);
  const candidatos = await modelosGemini(apiKey);
  const errores: string[] = [];
  const limite = Date.now() + 270_000;
  const cuerpo = JSON.stringify({
    contents: [{ parts: [{ text: prompt({ comision: p.comision, fecha: p.fecha, tabla: p.tabla || [], boletines: p.boletines || [], transcripcion, oficial }) }] }],
    generationConfig: { temperature: 0.15, maxOutputTokens: 32000, responseMimeType: "application/json", responseSchema: ESQUEMA },
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
          signal: AbortSignal.timeout(Math.min(230_000, limite - Date.now())),
        });
        if (!r.ok) {
          errores.push(`${model}: HTTP ${r.status}${intento ? ` (intento ${intento + 1})` : ""}`);
          if ([503, 429, 500, 502, 504].includes(r.status)) continue; // reintenta el mismo modelo
          break; // 404 u otro: siguiente modelo
        }
        const data: any = await r.json();
        const texto = (data?.candidates?.[0]?.content?.parts || []).map((x: any) => x.text || "").join("");
        if (!texto) { errores.push(`${model}: respuesta vacía (${data?.candidates?.[0]?.finishReason || "sin motivo"})`); break; }
        let crudo: any;
        try { crudo = extraerJSON(texto); }
        catch (e: any) {
          const fin = data?.candidates?.[0]?.finishReason;
          errores.push(`${model}: JSON no válido${fin && fin !== "STOP" ? ` (${fin})` : ""}`);
          continue; // reintenta el mismo modelo
        }
        const informe = validarInforme(crudo, segmentos, p.boletines || [], !!p.parcial, oficial);
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

/** Consulta genérica a Gemini con salida JSON estructurada (con reintentos y modelos de respaldo). */
export async function geminiJSON(texto: string, esquema: any, opciones: { maxTokens?: number; presupuestoMs?: number } = {}):
  Promise<{ ok: true; datos: any; modelo: string } | { ok: false; motivo: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: "GEMINI_API_KEY no está configurada en el servidor." };
  const candidatos = await modelosGemini(apiKey);
  const limite = Date.now() + (opciones.presupuestoMs ?? 120_000);
  const errores: string[] = [];
  const cuerpo = JSON.stringify({
    contents: [{ parts: [{ text: texto }] }],
    generationConfig: { temperature: 0.15, maxOutputTokens: opciones.maxTokens ?? 8000, responseMimeType: "application/json", responseSchema: esquema },
  });
  for (const model of candidatos) {
    for (let intento = 0; intento < 3; intento++) {
      const restante = limite - Date.now();
      if (restante < 15_000) break;
      if (intento > 0) await esperar(intento * 5000);
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: cuerpo,
          signal: AbortSignal.timeout(restante),
        });
        if (!r.ok) { errores.push(`${model}: HTTP ${r.status}`); if ([503, 429, 500, 502, 504].includes(r.status)) continue; break; }
        const data: any = await r.json();
        const t = (data?.candidates?.[0]?.content?.parts || []).map((x: any) => x.text || "").join("");
        if (!t) { errores.push(`${model}: respuesta vacía`); break; }
        try { return { ok: true, datos: extraerJSON(t), modelo: model }; }
        catch { errores.push(`${model}: JSON no válido`); continue; }
      } catch (err: any) { errores.push(`${model}: ${err?.name === "TimeoutError" ? "sin respuesta a tiempo" : err?.message || err}`); break; }
    }
  }
  return { ok: false, motivo: errores.join(" | ") || "Sin modelos disponibles." };
}
