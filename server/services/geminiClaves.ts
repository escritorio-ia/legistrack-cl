// Claves de Gemini con respaldo automático.
// Orden: GEMINI_VIDEO_API_KEY (solo videos) → GEMINI_API_KEY → GEMINI_API_KEY_RESPALDO.
// Si una clave responde "sin saldo" (HTTP 402) o "cuota diaria agotada" (HTTP 429 de cuota), se aparta por 1 hora
// (en esta instancia del servidor) y se usa la siguiente. Las claves nunca se escriben en código ni en la base.
const valida = (k?: string) => !!k && k !== "MY_GEMINI_API_KEY";

export function clavesGemini(video = false): string[] {
  const l = [video ? process.env.GEMINI_VIDEO_API_KEY : undefined, process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_RESPALDO]
    .map((x) => String(x || "").trim()).filter(valida);
  return Array.from(new Set(l));
}

const apartadas = new Map<string, number>();
/** Claves para probar, en orden: primero las no apartadas; si todas lo están, igual se prueban (por si volvió el saldo). */
export function clavesDisponibles(video = false): string[] {
  const l = clavesGemini(video);
  const libres = l.filter((k) => !((apartadas.get(k) || 0) > Date.now()));
  return libres.length ? [...libres, ...l.filter((k) => !libres.includes(k))] : l;
}
export function apartarClave(k: string) { apartadas.set(k, Date.now() + 60 * 60 * 1000); }

/** ¿El error indica que esa clave no puede seguir (sin saldo o cuota agotada), y conviene probar con otra? */
export function esAgotamiento(motivo?: string): boolean {
  const m = String(motivo || "");
  return /HTTP 402|credits are depleted|prepayment|billing/i.test(m) || /HTTP 429[^|]*(quota|exceeded|RESOURCE_EXHAUSTED|per day)/i.test(m);
}
