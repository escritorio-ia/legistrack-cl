/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parseo y cálculo estadístico determinístico de datasets subidos por el
 * usuario (CSV/Excel) para Statistics++. Todo el cálculo numérico (min, max,
 * promedio, mediana, desviación estándar, conteos) se hace aquí con código,
 * nunca pidiéndole a la IA que "calcule" -- la IA solo redacta el informe en
 * prosa a partir de estas cifras ya calculadas y verificadas.
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ColumnaDatasetStats } from "../services/firebaseService";

export interface DatasetParseado {
  headers: string[];
  rows: Record<string, string>[];
}

const MAX_FILAS = 100000;

export async function parseDatasetFile(file: File): Promise<DatasetParseado> {
  const nombreLower = file.name.toLowerCase();
  if (nombreLower.endsWith(".csv")) {
    return parseCsv(file);
  }
  if (nombreLower.endsWith(".xlsx") || nombreLower.endsWith(".xls")) {
    return parseExcel(file);
  }
  throw new Error("Formato de archivo no soportado. Sube un archivo .csv o .xlsx.");
}

function parseCsv(file: File): Promise<DatasetParseado> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        const headers = (results.meta.fields || []).filter(Boolean);
        const rows = (results.data as Record<string, string>[]).slice(0, MAX_FILAS);
        if (headers.length === 0 || rows.length === 0) {
          reject(new Error("El archivo CSV no tiene columnas o filas reconocibles."));
          return;
        }
        resolve({ headers, rows });
      },
      error: (err: Error) => reject(err)
    });
  });
}

async function parseExcel(file: File): Promise<DatasetParseado> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("El archivo Excel no tiene hojas.");
  const sheet = workbook.Sheets[firstSheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
  if (json.length === 0) throw new Error("La primera hoja del archivo Excel está vacía.");
  const headers = Object.keys(json[0]);
  const rows: Record<string, string>[] = json.slice(0, MAX_FILAS).map((r) => {
    const out: Record<string, string> = {};
    for (const h of headers) out[h] = r[h] === undefined || r[h] === null ? "" : String(r[h]);
    return out;
  });
  return { headers, rows };
}

function esNumero(v: string): boolean {
  if (v.trim() === "") return false;
  const normalizado = v.trim().replace(/\./g, "").replace(",", ".");
  return !isNaN(Number(v.trim())) || !isNaN(Number(normalizado));
}

function aNumero(v: string): number {
  const directo = Number(v.trim());
  if (!isNaN(directo)) return directo;
  const normalizado = v.trim().replace(/\./g, "").replace(",", ".");
  return Number(normalizado);
}

function esFecha(v: string): boolean {
  if (v.trim() === "") return false;
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(v.trim()) || /^\d{4}-\d{2}-\d{2}/.test(v.trim())) {
    return !isNaN(Date.parse(v.trim()));
  }
  return false;
}

function mediana(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function desviacionEstandar(nums: number[], promedio: number): number {
  if (nums.length < 2) return 0;
  const varianza = nums.reduce((acc, n) => acc + (n - promedio) ** 2, 0) / (nums.length - 1);
  return Math.sqrt(varianza);
}

export function calcularStatsColumnas(headers: string[], rows: Record<string, string>[]): ColumnaDatasetStats[] {
  return headers.map((nombre) => {
    const valoresCrudos = rows.map((r) => (r[nombre] ?? "").toString());
    const noVacios = valoresCrudos.filter((v) => v.trim() !== "");
    const nulos = valoresCrudos.length - noVacios.length;

    if (noVacios.length === 0) {
      return { nombre, tipo: "categorico", nulos, valoresUnicos: 0, topValores: [] };
    }

    const proporcionNumerica = noVacios.filter(esNumero).length / noVacios.length;
    const proporcionFecha = noVacios.filter(esFecha).length / noVacios.length;

    if (proporcionNumerica >= 0.9) {
      const nums = noVacios.filter(esNumero).map(aNumero);
      const promedio = nums.reduce((a, b) => a + b, 0) / nums.length;
      return {
        nombre,
        tipo: "numerico",
        nulos,
        min: Math.min(...nums),
        max: Math.max(...nums),
        promedio: Number(promedio.toFixed(4)),
        mediana: Number(mediana(nums).toFixed(4)),
        desviacionEstandar: Number(desviacionEstandar(nums, promedio).toFixed(4))
      };
    }

    if (proporcionFecha >= 0.9) {
      const fechas = noVacios.filter(esFecha).map((v) => new Date(v).getTime());
      return {
        nombre,
        tipo: "fecha",
        nulos,
        fechaMin: new Date(Math.min(...fechas)).toISOString().slice(0, 10),
        fechaMax: new Date(Math.max(...fechas)).toISOString().slice(0, 10)
      };
    }

    const conteos = new Map<string, number>();
    for (const v of noVacios) conteos.set(v, (conteos.get(v) || 0) + 1);
    const topValores = Array.from(conteos.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([valor, conteo]) => ({ valor, conteo }));

    return { nombre, tipo: "categorico", nulos, valoresUnicos: conteos.size, topValores };
  });
}
