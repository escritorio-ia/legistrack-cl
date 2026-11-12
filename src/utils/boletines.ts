import { parseFechaFlexible } from "./tramitacion";

/** Boletín en forma única para indexar: "16.621-13" -> "16621-13". Devuelve "" si no tiene forma de boletín. */
export function normalizarBoletin(b: string): string {
  const m = String(b || "").replace(/\./g, "").match(/(\d{3,6})(?:-(\d{1,2}))?/);
  return m ? (m[2] ? `${m[1]}-${m[2].padStart(2, "0")}` : m[1]) : "";
}

/** Boletines mencionados en un texto (tabla o materia de una citación), normalizados y sin repetir. */
export function boletinesEnTexto(texto: string): string[] {
  const hallados = String(texto || "").match(/\b\d{1,2}\.?\d{3}-\d{1,2}\b/g) || [];
  return Array.from(new Set(hallados.map(normalizarBoletin).filter(Boolean)));
}

const MESES: Record<string, number> = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };
/** Fecha de la sesión para ordenar (acepta "2026-09-07", "07/09/2026" o "lunes 7 de septiembre de 2026"); 0 si no se puede leer. */
export function tiempoDeSesion(fecha?: string): number {
  const d = parseFechaFlexible(fecha);
  if (d) return d.getTime();
  const m = String(fecha || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/);
  return m && m[2] in MESES ? new Date(Number(m[3]), MESES[m[2]], Number(m[1])).getTime() : 0;
}
