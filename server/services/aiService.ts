import Anthropic from "@anthropic-ai/sdk";

// Lazy-initialize Claude client
let aiClient: Anthropic | null = null;
let isClaudeQuotaExceeded = false;

export function handleClaudeError(context: string, err: any) {
  const errStr = (String(err?.message || "") + " " + String(err?.status || "") + " " + String(err?.statusCode || "") + " " + String(err?.code || "")).toLowerCase();
  const isQuotaOrAuth =
    errStr.includes("quota") ||
    errStr.includes("exhausted") ||
    errStr.includes("billing") ||
    errStr.includes("plan") ||
    errStr.includes("exceeded") ||
    errStr.includes("rate limit") ||
    errStr.includes("429") ||
    errStr.includes("limit") ||
    errStr.includes("key") ||
    errStr.includes("api_key") ||
    errStr.includes("unauthorized") ||
    errStr.includes("invalid") ||
    err?.status === 429 ||
    err?.status === 401;

  if (isQuotaOrAuth) {
    isClaudeQuotaExceeded = true;
    console.log(`[Claude Info] ${context}: Quota/key limit active. Switched to alternative AI provider or high-fidelity offline mode.`);
  } else {
    console.log(`[Claude Info] ${context}: ${err?.message || err}`);
  }
}

export function getClaudeClient(): Anthropic | null {
  if (isClaudeQuotaExceeded) {
    return null;
  }
  if (!aiClient) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key && key !== "MY_ANTHROPIC_API_KEY") {
      aiClient = new Anthropic({
        apiKey: key,
        defaultHeaders: {
          'User-Agent': 'aistudio-build',
        }
      });
    }
  }
  return aiClient;
}

export function safeJsonParse<T>(text: string): T {
  let cleaned = text.trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (ignore) {}

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (ignore) {}

  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const candidate = cleaned.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch (e: any) {
      throw new Error(`JSON parsing failed: ${e.message}`);
    }
  }

  throw new Error(`Could not find valid JSON boundaries in response text.`);
}

async function generarConGeminiUnaVez(prompt: string, maxTokens: number, apiKey: string, model: string, timeoutMs: number): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens }
    }),
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${err.slice(0, 150)}`);
  }
  const data: any = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini no devolvió texto");
  return String(text).trim();
}

export async function generarConGemini(prompt: string, maxTokens = 2000): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") throw new Error("GEMINI_API_KEY no configurada");
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  // Los modelos "thinking" de Gemini pueden tardar bastante más que un modelo
  // simple en prompts largos, pero 45s de un solo intento sin reintentos
  // dejaba a "alta demanda temporal" (503) tumbar todo el llamado. Con 2
  // intentos cortos (25s c/u) se recupera de saturaciones breves sin sumar
  // mucho más tiempo total que antes.
  let lastErr: any;
  for (let intento = 1; intento <= 2; intento++) {
    try {
      return await generarConGeminiUnaVez(prompt, maxTokens, apiKey, model, 25000);
    } catch (err: any) {
      lastErr = err;
      const esSaturacion = /HTTP 503|HTTP 429/.test(err?.message || "");
      if (intento < 2 && esSaturacion) {
        await new Promise(r => setTimeout(r, 1200));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

export async function generarConGroq(prompt: string, maxTokens = 2000): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "MY_GROQ_API_KEY") throw new Error("GROQ_API_KEY no configurada");
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens
    }),
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Groq HTTP ${res.status}: ${err.slice(0, 150)}`);
  }
  const data: any = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq no devolvió texto");
  return String(text).trim();
}

export async function generarConOpenRouter(prompt: string, maxTokens = 1500): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "MY_OPENROUTER_API_KEY") throw new Error("OPENROUTER_API_KEY no configurada");

  // OpenRouter descontinúa/renombra sus modelos gratuitos con frecuencia (varios de
  // los que estaban aquí antes ya devuelven 404 "No endpoints found"), así que esta
  // lista requiere revisión periódica. Se prueban varios en orden hasta que uno
  // responda; si todos fallan (p. ej. otra vez por deprecación), el error de
  // OpenRouter no bloquea la generación: el llamador sigue con Claude directo.
  const configuredModel = process.env.OPENROUTER_MODEL;
  const models = [
    configuredModel && !configuredModel.includes("claude-3.5-haiku") ? configuredModel : undefined,
    "liquid/lfm-2.5-2.6b:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free"
  ].filter((m): m is string => Boolean(m));

  let lastError = "";
  for (const model of models) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "LegisTrack-CL",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        lastError = `OpenRouter (${model}) HTTP ${resp.status}: ${errText.slice(0, 200)}`;
        continue;
      }
      const data: any = await resp.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return String(text).trim();
    } catch (e: any) {
      lastError = e?.message || String(e);
    }
  }

  throw new Error(lastError || "OpenRouter no devolvió contenido");
}

export interface AIProviderAttempt {
  provider: string;
  configured: boolean;
  error?: string;
}

/**
 * `attempts`, si se entrega, se rellena con el resultado de cada proveedor
 * probado (configurado o no, y el error si falló). Existe porque el visor de
 * Runtime Logs de Vercel no muestra el stdout/stderr de una función en
 * respuestas 200 -- sin esto, diagnosticar por qué la generación cae al
 * respaldo en producción requería adivinar a ciegas.
 */
interface ProviderRunResult {
  provider: string;
  configured: boolean;
  text?: string;
  error?: string;
}

async function intentarGemini(prompt: string, maxTokens: number): Promise<ProviderRunResult> {
  const configured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  if (!configured) return { provider: "gemini", configured };
  try {
    const text = await generarConGemini(prompt, maxTokens);
    return text ? { provider: "gemini", configured, text } : { provider: "gemini", configured, error: "respuesta vacía" };
  } catch (e: any) {
    console.log(`[Gemini Free Info]: ${e?.message || e}`);
    return { provider: "gemini", configured, error: e?.message || String(e) };
  }
}

async function intentarOpenRouter(prompt: string, maxTokens: number): Promise<ProviderRunResult> {
  const configured = !!(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== "MY_OPENROUTER_API_KEY");
  if (!configured) return { provider: "openrouter", configured };
  try {
    const text = await generarConOpenRouter(prompt, maxTokens);
    return text ? { provider: "openrouter", configured, text } : { provider: "openrouter", configured, error: "respuesta vacía" };
  } catch (e: any) {
    console.log(`[OpenRouter Info]: ${e?.message || e}`);
    return { provider: "openrouter", configured, error: e?.message || String(e) };
  }
}

async function intentarGroq(prompt: string, maxTokens: number): Promise<ProviderRunResult> {
  const configured = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "MY_GROQ_API_KEY");
  if (!configured) return { provider: "groq", configured };
  try {
    const text = await generarConGroq(prompt, maxTokens);
    return text ? { provider: "groq", configured, text } : { provider: "groq", configured, error: "respuesta vacía" };
  } catch (e: any) {
    console.log(`[Groq Free Info]: ${e?.message || e}`);
    return { provider: "groq", configured, error: e?.message || String(e) };
  }
}

async function intentarClaude(prompt: string, maxTokens: number): Promise<ProviderRunResult> {
  const claude = getClaudeClient();
  if (!claude) return { provider: "claude", configured: !!process.env.ANTHROPIC_API_KEY };
  try {
    const resp = await claude.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }]
    });
    const text = resp.content[0].type === "text" ? resp.content[0].text : "";
    return text ? { provider: "claude", configured: true, text } : { provider: "claude", configured: true, error: "respuesta vacía" };
  } catch (err: any) {
    handleClaudeError("Claude Universal", err);
    return { provider: "claude", configured: true, error: err?.message || String(err) };
  }
}

export async function generarContenidoUniversalIA(prompt: string, maxTokens = 2000, attempts?: AIProviderAttempt[]): Promise<string | null> {
  // Gemini y OpenRouter (ambos de capa gratuita, con cuotas/demanda variables)
  // se corren en PARALELO en vez de en cascada: si uno se satura o se demora,
  // no hace esperar al otro -- el que responda primero con éxito gana. Antes,
  // una cascada secuencial con timeouts largos podía sumar varios minutos de
  // espera cuando el primero fallaba.
  const [geminiRes, openrouterRes] = await Promise.all([
    intentarGemini(prompt, maxTokens),
    intentarOpenRouter(prompt, maxTokens)
  ]);

  // Se prioriza Gemini por calidad si ambos tuvieron éxito; si no, se usa el
  // que haya respondido.
  const primeraRonda = [geminiRes, openrouterRes];
  for (const r of primeraRonda) {
    attempts?.push({ provider: r.provider, configured: r.configured, error: r.error });
  }
  const exitoPrimeraRonda = primeraRonda.find(r => r.text);
  if (exitoPrimeraRonda) return exitoPrimeraRonda.text!;

  // Groq y Claude como respaldo secuencial (Claude es de pago/estable, se deja
  // al final para no gastarlo si algo gratuito ya funcionó).
  const groqRes = await intentarGroq(prompt, maxTokens);
  attempts?.push({ provider: groqRes.provider, configured: groqRes.configured, error: groqRes.error });
  if (groqRes.text) return groqRes.text;

  const claudeRes = await intentarClaude(prompt, maxTokens);
  attempts?.push({ provider: claudeRes.provider, configured: claudeRes.configured, error: claudeRes.error });
  if (claudeRes.text) return claudeRes.text;

  return null;
}

export async function responderCopilotoLegislativo(params: {
  mensaje: string;
  contextoBoletin?: string;
  contextoComision?: string;
  historial?: { role: "user" | "assistant"; content: string }[];
}): Promise<{ respuesta: string; sugerencias: string[]; fuente: "ia" | "fallback" }> {
  const { mensaje, contextoBoletin, contextoComision, historial = [] } = params;

  const prompt = `Eres el "Copiloto Legislativo", un asistente experto en técnica legislativa, derecho parlamentario y transparencia del Congreso Nacional de Chile.
Tu misión es explicar con claridad técnica, objetiva y sobria el proceso legislativo, el estado de los proyectos de ley (boletines), el rol de las comisiones, quórums requeridos y antecedentes comparados.

Contexto actual del usuario:
- Boletín en pantalla: ${contextoBoletin || "No especificado"}
- Comisión en pantalla: ${contextoComision || "No especificado"}

Pregunta del usuario:
"${mensaje}"

Instrucciones:
1. Responde de forma directa, sobria y técnicamente rigurosa (máximo 160 palabras).
2. Si el usuario pregunta por quórums, cita el artículo correspondiente (ej. Art. 66 o Art. 127 de la CPR).
3. Utiliza formato Markdown limpio (viñetas cortas y negritas en conceptos clave).
4. No inventes artículos ni resultados de votaciones inexistentes.

Responde únicamente con el texto de la respuesta.`;

  const textoIA = await generarContenidoUniversalIA(prompt, 800);
  if (textoIA) {
    return {
      respuesta: textoIA,
      sugerencias: [
        "¿Cuáles son los plazos según la urgencia vigente?",
        "¿Qué quórum se requiere para aprobar este proyecto?",
        "¿Qué ministerios están involucrados?"
      ],
      fuente: "ia"
    };
  }

  // High-fidelity fallback for Copilot
  let respuestaFallback = `El proceso legislativo chileno contempla distintas etapas constitucionales (Primer Trámite, Segundo Trámite, Comisión Mixta y Promulgación). `;
  if (contextoBoletin) {
    respuestaFallback += `Para el **Boletín ${contextoBoletin}**, puedes revisar el desglose del hemiciclo en la pestaña *Simulador de Quórum*, las diferencias de redacción en el *Comparador de Textos* o descargar la *Ficha Ejecutiva* formal con antecedentes oficiales.`;
  } else {
    respuestaFallback += `Puedes explorar el catálogo de proyectos vigentes, las citaciones en vivo de comisiones o buscar antecedentes en la sección de *Legislación Comparada*.`;
  }

  return {
    respuesta: respuestaFallback,
    sugerencias: [
      "¿Cómo funciona una Comisión Mixta?",
      "¿Qué diferencia hay entre Moción y Mensaje?",
      "¿Cómo se calculan las 4/7 partes?"
    ],
    fuente: "fallback"
  };
}

export function getAIProvidersStatus() {
  return {
    gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    groq: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "MY_GROQ_API_KEY"),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== "MY_OPENROUTER_API_KEY"),
    claude: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "MY_ANTHROPIC_API_KEY" && !isClaudeQuotaExceeded),
    claudeQuotaExceeded: isClaudeQuotaExceeded
  };
}

/**
 * A diferencia de getAIProvidersStatus (que solo mira si la variable de
 * entorno existe y no es el placeholder de .env.example), esto hace una
 * llamada real y minima a cada proveedor configurado para confirmar que la
 * clave efectivamente funciona. Se detecto en produccion que una clave podia
 * "verse" configurada (no vacia, no el placeholder) y aun asi ser invalida
 * (401 real de la API) -- getAIProvidersStatus no puede distinguir eso.
 */
export async function testearProveedoresIAReal(): Promise<Record<string, { configured: boolean; ok: boolean; error?: string }>> {
  const promptTrivial = 'Responde solo con: {"ok":true}';
  const [gemini, openrouter, groq, claude] = await Promise.all([
    intentarGemini(promptTrivial, 30),
    intentarOpenRouter(promptTrivial, 30),
    intentarGroq(promptTrivial, 30),
    intentarClaude(promptTrivial, 30)
  ]);
  const toResult = (r: ProviderRunResult) => ({ configured: r.configured, ok: !!r.text, error: r.error });
  return {
    gemini: toResult(gemini),
    openrouter: toResult(openrouter),
    groq: toResult(groq),
    claude: toResult(claude)
  };
}
