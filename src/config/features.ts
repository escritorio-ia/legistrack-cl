/**
 * Interruptores de funcionalidades. La Pizarra ATP está construida pero oculta
 * hasta que se defina VITE_PIZARRA_VISIBLE=true (en .env.local o en el entorno de build).
 */
export const PIZARRA_VISIBLE = import.meta.env.VITE_PIZARRA_VISIBLE === "true";
