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

export async function generarConGemini(prompt: string, maxTokens = 2000): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") throw new Error("GEMINI_API_KEY no configurada");
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens }
    }),
    signal: AbortSignal.timeout(15000)
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

  const configuredModel = process.env.OPENROUTER_MODEL;
  const models = [
    configuredModel && !configuredModel.includes("claude-3.5-haiku") ? configuredModel : undefined,
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-r1:free",
    "mistralai/mistral-7b-instruct:free",
    "anthropic/claude-3.5-haiku-20241022",
    "google/gemini-2.0-flash-001"
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

export async function generarContenidoUniversalIA(prompt: string, maxTokens = 2000): Promise<string | null> {
  // 1. Google Gemini (100% Gratis - Google AI Studio)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      const text = await generarConGemini(prompt, maxTokens);
      if (text) return text;
    } catch (e: any) {
      console.log(`[Gemini Free Info]: ${e?.message || e}`);
    }
  }

  // 2. Groq Cloud (100% Gratis - Llama 3.3 70B)
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "MY_GROQ_API_KEY") {
    try {
      const text = await generarConGroq(prompt, maxTokens);
      if (text) return text;
    } catch (e: any) {
      console.log(`[Groq Free Info]: ${e?.message || e}`);
    }
  }

  // 3. OpenRouter (Modelos gratuitos y estándar)
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== "MY_OPENROUTER_API_KEY") {
    try {
      const text = await generarConOpenRouter(prompt, maxTokens);
      if (text) return text;
    } catch (e: any) {
      console.log(`[OpenRouter Info]: ${e?.message || e}`);
    }
  }

  // 4. Anthropic Claude
  const claude = getClaudeClient();
  if (claude) {
    try {
      const resp = await claude.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }]
      });
      const text = resp.content[0].type === "text" ? resp.content[0].text : "";
      if (text) return text;
    } catch (err: any) {
      handleClaudeError("Claude Universal", err);
    }
  }

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
