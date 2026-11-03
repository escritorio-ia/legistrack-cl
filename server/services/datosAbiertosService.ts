/**
 * Descubrimiento de recursos (CSV, etc.) de datos.gob.cl (CKAN). Se usa para ver, desde el
 * servidor desplegado, qué archivos publica cada institución (DIPRES, ODEPA, CNE…) antes de
 * escribir los lectores. Solo consulta el dominio datos.gob.cl.
 */

export interface RecursoCkan {
  nombre: string;
  formato: string;
  url: string;
  modificado?: string;
  tamano?: number;
}

export interface DatasetCkan {
  slug: string;
  titulo: string;
  organizacion: string;
  actualizado?: string;
  recursos: RecursoCkan[];
}

const SLUG = /^[a-z0-9][a-z0-9_\-]{2,160}$/i;

export async function ckanDataset(slug: string): Promise<DatasetCkan> {
  if (!SLUG.test(slug)) throw new Error("slug inválido");
  const r = await fetch(`https://datos.gob.cl/api/3/action/package_show?id=${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; Legislacion++)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`datos.gob.cl ${r.status}`);
  const j: any = await r.json();
  const d = j?.result;
  if (!d) throw new Error("dataset no encontrado");
  return {
    slug,
    titulo: d.title,
    organizacion: d.organization?.title || "",
    actualizado: d.metadata_modified,
    recursos: (d.resources || []).map((x: any) => ({
      nombre: x.name,
      formato: String(x.format || "").toLowerCase(),
      url: x.url,
      modificado: x.last_modified || x.metadata_modified,
      tamano: typeof x.size === "number" ? x.size : undefined,
    })),
  };
}

/** Primeras líneas de un CSV (para ver columnas sin traer el archivo completo). Solo https de datos.gob.cl / odepa / dipres. */
const HOSTS_OK = /^https:\/\/([a-z0-9.\-]+\.)?(datos\.gob\.cl|odepa\.gob\.cl|dipres\.gob\.cl|energiaabierta\.cl|cne\.cl)\//i;

export async function muestraCsv(url: string, lineas = 6): Promise<{ url: string; lineas: string[] }> {
  if (!HOSTS_OK.test(url)) throw new Error("host no permitido");
  const r = await fetch(url, {
    headers: { Range: "bytes=0-6000", "User-Agent": "Mozilla/5.0 (compatible; Legislacion++)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok && r.status !== 206) throw new Error(`HTTP ${r.status}`);
  const texto = (await r.text()).slice(0, 8000);
  return { url, lineas: texto.split(/\r?\n/).slice(0, lineas) };
}
