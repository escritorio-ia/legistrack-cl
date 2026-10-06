/**
 * Interruptores de funcionalidades. La Pizarra ATP está construida pero oculta
 * hasta que se defina VITE_PIZARRA_VISIBLE=true (en .env.local o en el entorno de build).
 */
export const PIZARRA_VISIBLE = import.meta.env.VITE_PIZARRA_VISIBLE === "true";

/** Búsqueda manual de datasets en data.europa.eu dentro de Statistics++ (oculta por ahora). */
export const BUSCADOR_DATASETS_UE_VISIBLE = import.meta.env.VITE_BUSCADOR_DATASETS_UE_VISIBLE === "true";
