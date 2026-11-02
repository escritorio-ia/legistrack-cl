// Limpieza de nombres de comisión extraídos de textos de tramitación, p. ej.
// "Comisión de Agricultura y, posteriormente, por la Comisión de Constitución…"
// o "comisión de Agricultura para discutir en general…" → solo el nombre.

const CORTES = /\s*(?:,\s*y\b|\s+y\s*,|,?\s+posteriormente\b|,?\s+finalmente\b|,?\s+luego\b|\s+para\s|\s+con\s+ocasi[oó]n|\s+en\s+(?:el|la|los|las|su|sesi[oó]n)\b|\s+a\s+fin\b|\s+que\s|\s+por\s|[.;:(]).*$/i;

/** Devuelve solo el nombre de la comisión ("Comisión de Agricultura"), o "" si no parece una. */
export function limpiarNombreComision(raw: string): string {
  let s = String(raw || "").replace(/\s+/g, " ").trim();
  s = s.replace(/^(?:a\s+|por\s+)?(?:la|las)\s+/i, "");
  const m = s.match(/comisi[oó]n\s+(?:especial\s+)?(?:mixta(?:\s+de\s+.+)?|de\s+.+|investigadora.+)/i);
  if (!m) return "";
  s = m[0].replace(CORTES, "").replace(/[\s,\-]+$/, "").trim();
  s = s.replace(/^comisi[oó]n/i, "Comisión");
  // Un nombre real no termina en conectores sueltos.
  s = s.replace(/\s+(?:y|e|de|del|la|el)$/i, "").trim();
  if (s.length < 12 || s.length > 140) return "";
  return s;
}

/** Extrae todas las comisiones mencionadas en un texto (puede haber varias). */
export function comisionesEnTexto(texto: string): string[] {
  return String(texto || "")
    .split(/(?=comisi[oó]n\s+(?:especial\s+)?(?:de\s|mixta|investigadora))/i)
    .map(limpiarNombreComision)
    .filter(Boolean);
}

/** Une listas de comisiones quitando duplicados (sin distinguir mayúsculas ni tildes). */
export function unirComisiones(lista: (string | undefined | null)[]): string[] {
  const vistos = new Map<string, string>();
  for (const raw of lista) {
    for (const c of comisionesEnTexto(raw || "")) {
      const k = c.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (!vistos.has(k)) vistos.set(k, c);
    }
  }
  // Si un nombre es el comienzo de otro ("Economía, Fomento" / "Economía, Fomento y
  // Desarrollo"), son la misma comisión: se conserva el nombre completo.
  const claves = Array.from(vistos.keys());
  const resultado: string[] = [];
  for (const k of claves) {
    const base = k.replace(/[,\s]+$/, "");
    // Solo nombres ya cortados (con coma): "Agricultura" (Senado) y "Agricultura, Silvicultura…" (Cámara) son distintas.
    const hayMasLargo = base.includes(",") && claves.some(o => o !== k && o.length > k.length && o.startsWith(base));
    if (!hayMasLargo) resultado.push(vistos.get(k)!);
  }
  return resultado;
}
