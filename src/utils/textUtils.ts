/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Normaliza cualquier texto para búsquedas insensibles a mayúsculas y tildes/acentos.
 * Ej: "Educación" -> "educacion", "Araucanía" -> "araucania", "Hidrógeno" -> "hidrogeno".
 */
export function normalizeSearchText(text: string = ""): string {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Retorna true si target contiene query ignorando tildes y mayúsculas.
 */
export function matchesWithoutAccents(target: string = "", query: string = ""): boolean {
  if (!query) return true;
  return normalizeSearchText(target).includes(normalizeSearchText(query));
}
