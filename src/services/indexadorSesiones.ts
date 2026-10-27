import { saveSesionVinculadaAProyecto, SesionVinculadaProyecto } from "./firebaseService";

const CLAVE_ULTIMA = "indexador_sesiones_ultima_ejecucion";
const CADA_MS = 6 * 60 * 60 * 1000; // cada 6 horas como máximo por navegador

/**
 * Registra en el historial de cada boletín (Firestore) las sesiones de comisión de
 * la semana publicada donde aparece en tabla, según las citaciones oficiales de la
 * Cámara y el Senado. Así el historial "Sesiones donde se trató este proyecto" se
 * va completando solo, aunque nadie abra ese boletín esa semana. Las sesiones ya
 * guardadas se fusionan por sesionId (no se duplican).
 */
export async function indexarSesionesDeLaSemana(): Promise<void> {
  try {
    const ultima = Number(localStorage.getItem(CLAVE_ULTIMA) || 0);
    if (Date.now() - ultima < CADA_MS) return;
    localStorage.setItem(CLAVE_ULTIMA, String(Date.now()));
  } catch {
    // sin localStorage: se indexa igual
  }

  try {
    const res = await fetch("/api/sesiones-por-boletin");
    if (!res.ok) return;
    const data: { porBoletin?: Record<string, SesionVinculadaProyecto[]> } = await res.json();
    const entradas = Object.entries(data.porBoletin || {});
    for (const [boletin, sesiones] of entradas) {
      for (const ses of sesiones) {
        await saveSesionVinculadaAProyecto(boletin, ses);
      }
    }
  } catch (err) {
    console.warn("No se pudieron indexar las sesiones de la semana:", err);
  }
}
