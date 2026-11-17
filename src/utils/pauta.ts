import { boletinesEnTexto } from "./boletines";

export interface PuntoPauta { numero: number; texto: string; boletines: string[] }

/**
 * Pauta en puntos a partir de la materia de la citación: "[Parte 1] … [Parte 2] …" (Cámara) o "1.- … 2.- …" / una línea
 * por punto (Senado). Cada punto lleva los boletines que menciona. El texto de cada punto es el oficial, sin cambios.
 */
export function puntosDeMateria(materia: string): PuntoPauta[] {
  const t = String(materia || "").trim();
  if (!t) return [];
  let partes: string[];
  if (/\[Parte \d+\]/i.test(t)) partes = t.split(/\[Parte \d+\]/i);
  else if (/(?:^|\n)\s*\d{1,2}\s*[.)]-?\s/.test(t)) partes = t.split(/(?:^|\n)\s*(?=\d{1,2}\s*[.)]-?\s)/);
  else partes = t.split(/\n+/);
  return partes
    .map((p) => p.replace(/^\s*\d{1,2}\s*[.)]-?\s*/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((texto, i) => ({ numero: i + 1, texto, boletines: boletinesEnTexto(texto) }));
}

/** Urgencia que la propia citación informa para un punto ("urgencia calificada de “suma”"); "" si no la informa. */
export function urgenciaDelPunto(texto: string): string {
  const m = String(texto || "").match(/urgencia\s+calificada\s+de\s+[“"']?\s*(discusi[oó]n inmediata|suma|simple)/i);
  if (!m) return "";
  const u = m[1].toLowerCase();
  return u.startsWith("discusi") ? "Discusión inmediata" : u === "suma" ? "Suma urgencia" : "Urgencia simple";
}

/** Acción del punto según el texto oficial (para destacar si se vota o se discute). */
export function accionDelPunto(texto: string): string {
  const t = String(texto || "").toLowerCase().trim();
  // Lo que dice el inicio del punto manda: "Continuar la discusión… luego se votará" es discusión con votación anunciada.
  const votaDespues = /se votar[aá]|para votar|y votar/.test(t);
  if (/^votar\b|^votaci[oó]n/.test(t)) return "Votación";
  if (/^iniciar (la )?discusi[oó]n|^iniciar (el )?estudio/.test(t)) return votaDespues ? "Inicia discusión y votación" : "Inicia discusión";
  if (/^continuar (con )?(la discusi[oó]n|el estudio)/.test(t)) return votaDespues ? "Continúa discusión y votación" : "Continúa discusión";
  if (/^(recibir|escuchar|audiencia)|exposici[oó]n de/.test(t)) return "Audiencias";
  if (/\bvotar\b/.test(t)) return "Votación";
  return "";
}
