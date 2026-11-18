/**
 * Lectura y escritura de documentos de Firestore por REST desde el servidor (sin SDK), con conversión
 * entre valores JavaScript y el formato tipado de Firestore. Las credenciales se leen del entorno.
 */
export function conexionFirestore(): { base: string; proy: string; key: string } {
  const proy = process.env.VITE_FIREBASE_PROJECT_ID || "";
  const key = process.env.VITE_FIREBASE_API_KEY || "";
  if (!proy || !key) throw new Error("Faltan VITE_FIREBASE_PROJECT_ID o VITE_FIREBASE_API_KEY en el entorno del servidor.");
  return { proy, key, base: `https://firestore.googleapis.com/v1/projects/${proy}/databases/(default)/documents` };
}

export function aFirestore(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(aFirestore) } };
  if (typeof v === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, aFirestore(x)])) } };
  return { stringValue: String(v) };
}

export function deFirestore(v: any): any {
  if (!v || typeof v !== "object") return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return !!v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(deFirestore);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, deFirestore(x)]));
  return null;
}

export const camposAObjeto = (fields: any) => Object.fromEntries(Object.entries(fields || {}).map(([k, x]) => [k, deFirestore(x)]));

export async function leerDoc(ruta: string): Promise<Record<string, any> | null> {
  const { base, key } = conexionFirestore();
  const r = await fetch(`${base}/${ruta}?key=${key}`, { signal: AbortSignal.timeout(12000) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Firestore (${ruta}) respondió HTTP ${r.status}`);
  const d: any = await r.json();
  return camposAObjeto(d.fields);
}

/** Escribe solo los campos dados (merge). */
export async function escribirDoc(ruta: string, datos: Record<string, any>): Promise<void> {
  const { base, key } = conexionFirestore();
  const qs = new URLSearchParams({ key });
  for (const k of Object.keys(datos)) qs.append("updateMask.fieldPaths", k);
  const r = await fetch(`${base}/${ruta}?${qs}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, aFirestore(v)])) }),
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`Firestore no aceptó la escritura de ${ruta} (HTTP ${r.status}): ${(await r.text()).slice(0, 160)}`);
}

export async function consultar(structuredQuery: any): Promise<{ id: string; datos: Record<string, any> }[]> {
  const { base, key } = conexionFirestore();
  const r = await fetch(`${base}:runQuery?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery }), signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`Firestore respondió HTTP ${r.status}`);
  const filas: any[] = await r.json();
  return filas.filter((x) => x.document).map((x) => ({ id: String(x.document.name).split("/").pop() || "", datos: x.document.fields }));
}
