import { DIPUTADOS_COMISIONES_DETALLE, SENADO_COMISIONES_DETALLE } from "../../src/data/comisionesData";
import { cache } from "./cacheService";

export interface ComisionReal {
  id: string;
  nombre: string;
  descripcion: string;
  senado: boolean;
}

export const SENADO_COMISIONES_REALES: ComisionReal[] = SENADO_COMISIONES_DETALLE.map(c => ({
  id: `${c.prefix}${c.id}`,
  nombre: c.nombre,
  descripcion: c.descripcion,
  senado: true
}));

export const DIPUTADOS_COMISIONES_REALES: ComisionReal[] = DIPUTADOS_COMISIONES_DETALLE.map(c => ({
  id: `${c.prefix}${c.id}`,
  nombre: c.nombre,
  descripcion: c.descripcion,
  senado: false
}));

export async function fetchComisionesCamaraReal(): Promise<ComisionReal[]> {
  return cache.wrap<ComisionReal[]>("camara_comisiones_vigentes", 30 * 60 * 1000, async () => {
    try {
      const response = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_Vigentes", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) return [];
      const xml = await response.text();
      const blocks = xml.match(/<Comision>[\s\S]*?<\/Comision>/gi) || [];

      return blocks
        .map((block) => {
          const get = (tag: string) => {
            const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
            return m ? m[1].trim() : "";
          };
          const id = get("ID");
          const nombreRaw = get("Nombre");
          const tipo = get("Tipo") || "Permanente";
          if (!id || !nombreRaw) return null;

          const nombre = /^comisi[oó]n/i.test(nombreRaw) ? nombreRaw : `Comisión de ${nombreRaw}`;
          return {
            id: `cd-${id}`,
            nombre,
            descripcion: `Comisión ${tipo.toLowerCase()} de la Cámara de Diputadas y Diputados de Chile.`,
            senado: false
          } as ComisionReal;
        })
        .filter((c): c is ComisionReal => c !== null);
    } catch (error) {
      console.error("Error fetching real Cámara commissions:", error);
      return [];
    }
  });
}

export async function getTodasComisiones(): Promise<ComisionReal[]> {
  const camaraLive = await fetchComisionesCamaraReal();
  const byId = new Map<string, ComisionReal>();
  for (const c of DIPUTADOS_COMISIONES_REALES) byId.set(c.id, c);
  for (const c of SENADO_COMISIONES_REALES) byId.set(c.id, c);
  for (const c of camaraLive) byId.set(c.id, c);
  return Array.from(byId.values());
}
