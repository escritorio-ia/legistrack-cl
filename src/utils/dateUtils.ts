// Utilidades de fechas de sesiones legislativas, compartidas entre cliente y servidor.

const MESES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
};

/**
 * Parsea una fecha de sesión en formato ISO ("2026-09-08") o en formato
 * español largo ("Martes 08 de septiembre de 2026" / "LUNES, 7 DE SEPTIEMBRE DE 2026").
 * Devuelve `null` si no se puede interpretar.
 */
export function parseFechaSesion(fechaStr?: string): Date | null {
  if (!fechaStr) return null;
  const isoMatch = fechaStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]), 23, 59, 59);
  }
  const match = fechaStr.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)\s+de\s+(\d{4})/i);
  if (match) {
    const day = Number(match[1]);
    const monthStr = match[2].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const year = Number(match[3]);
    const month = MESES[monthStr] ?? 0;
    return new Date(year, month, day, 23, 59, 59);
  }
  return null;
}

/** true si la fecha de la sesión ya pasó (es anterior al día de hoy). */
export function isSessionDatePassed(fechaStr?: string): boolean {
  const d = parseFechaSesion(fechaStr);
  if (!d) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  return d.getTime() < today.getTime();
}

/**
 * Comparador cronológico descendente (más reciente primero) para sesiones.
 * Sesiones sin fecha reconocible quedan al final. Reemplaza el antiguo
 * ordenamiento lexicográfico por `id`, que producía un orden incorrecto
 * al comparar sesiones de distintos meses (p. ej. "16jun2026" ordenaba
 * después de "04ago2026" por comparar los dígitos del día antes que el mes).
 */
export function compareSesionesDesc(a: { fecha?: string; id?: string }, b: { fecha?: string; id?: string }): number {
  const da = parseFechaSesion(a.fecha);
  const db = parseFechaSesion(b.fecha);
  if (da && db) return db.getTime() - da.getTime();
  if (da && !db) return -1;
  if (!da && db) return 1;
  return (b.id || "").localeCompare(a.id || "");
}

export function getDaysRemaining(fechaStr?: string): string {
  const d = parseFechaSesion(fechaStr);
  if (!d) return "Convocada";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const diffMs = d.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "🔴 Sesiona Hoy";
  if (diffDays === 1) return "⏳ Convocada para Mañana";
  if (diffDays > 1) return `📅 En ${diffDays} días`;
  return "Sesión Realizada";
}

/** true si la sesión ya se realizó: fue marcada `completada`, o su fecha ya pasó. */
export function isSesionRealizada(ses: { completada?: boolean; fecha?: string }): boolean {
  return !!ses.completada || isSessionDatePassed(ses.fecha);
}

interface SesionLike {
  id?: string;
  fecha?: string;
  hora?: string;
  lugar?: string;
  tipo?: string;
  materia?: string;
  invitados?: string;
  citacionNumero?: string;
  acuerdosCount?: number;
  acuerdosTexto?: string[];
  actaTexto?: string;
  tabla?: string[];
  videoUrl?: string;
  completada?: boolean;
}

/**
 * Cuánta información aporta una sesión: se usa para elegir cuál de dos entradas
 * "duplicadas" del mismo día conservar como base al fusionarlas.
 */
function riquezaSesion(s: SesionLike): number {
  let score = 0;
  if (s.completada) score += 4;
  if (s.actaTexto) score += 3;
  if (s.videoUrl) score += 3;
  if (s.acuerdosTexto && s.acuerdosTexto.length > 0) score += 2;
  if (s.tabla && s.tabla.length > 0) score += 1;
  if (s.materia) score += Math.min(s.materia.length / 100, 2);
  return score;
}

/**
 * Fusiona sesiones duplicadas que caen en el mismo día. La app combina, para una
 * misma comisión, citaciones en vivo (agenda semanal desde el sitio oficial) con
 * un catálogo curado de sesiones ya realizadas; ambas fuentes usan IDs distintos
 * para la MISMA sesión real, así que un dedup por `id` no las reconoce como
 * duplicadas y terminan mostrándose dos veces en "Sesiones y Actas". Aquí se
 * agrupan por fecha real (no por el string de fecha, que puede venir en formatos
 * distintos) y, dentro de cada grupo, se conserva la entrada más completa
 * rellenando los campos que le falten con los de las demás.
 */
export function mergeSesionesDuplicadas<T extends SesionLike>(sesiones: T[]): T[] {
  const grupos = new Map<string, T[]>();
  const ordenGrupos: string[] = [];

  sesiones.forEach((s, idx) => {
    const d = parseFechaSesion(s.fecha);
    const key = d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : `__sin_fecha_${s.id || idx}`;
    if (!grupos.has(key)) {
      grupos.set(key, []);
      ordenGrupos.push(key);
    }
    grupos.get(key)!.push(s);
  });

  const resultado: T[] = [];
  for (const key of ordenGrupos) {
    const items = grupos.get(key)!;
    if (items.length === 1) {
      resultado.push(items[0]);
      continue;
    }

    const [base, ...resto] = [...items].sort((a, b) => riquezaSesion(b) - riquezaSesion(a));
    const merged: T = { ...base };
    for (const otra of resto) {
      if (!merged.hora && otra.hora) merged.hora = otra.hora;
      if (!merged.lugar && otra.lugar) merged.lugar = otra.lugar;
      if (!merged.invitados && otra.invitados) merged.invitados = otra.invitados;
      if (!merged.citacionNumero && otra.citacionNumero) merged.citacionNumero = otra.citacionNumero;
      if (!merged.actaTexto && otra.actaTexto) merged.actaTexto = otra.actaTexto;
      if (!merged.videoUrl && otra.videoUrl) merged.videoUrl = otra.videoUrl;
      if ((!merged.acuerdosTexto || merged.acuerdosTexto.length === 0) && otra.acuerdosTexto?.length) {
        merged.acuerdosTexto = otra.acuerdosTexto;
      }
      if ((!merged.tabla || merged.tabla.length === 0) && otra.tabla?.length) {
        merged.tabla = otra.tabla;
      }
      if (!merged.completada && otra.completada) merged.completada = true;
      if ((merged.acuerdosCount || 0) < (otra.acuerdosCount || 0)) merged.acuerdosCount = otra.acuerdosCount;
    }
    resultado.push(merged);
  }
  return resultado;
}
