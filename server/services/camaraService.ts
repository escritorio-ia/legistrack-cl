import { 
  DIPUTADOS_COMISIONES_DETALLE, 
  SENADO_COMISIONES_DETALLE,
  CAMARA_CITACIONES_SEMANALES_POR_DIA,
  CAMARA_CITACIONES_POR_COMISION,
  CAMARA_CITACIONES_FULL_WEEK
} from "../../src/data/comisionesData";
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

function getCommissionSlugFromName(name: string): string | null {
  const n = (name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes("gobierno interior")) return "gobierno-interior";
  if (n.includes("relaciones exteriores")) return "rree";
  if (n.includes("constitucion")) return "constitucion";
  if (n.includes("educacion")) return "educacion";
  if (n.includes("hacienda")) return "hacienda";
  if (n.includes("defensa")) return "defensa";
  if (n.includes("obras publicas") || n.includes("transportes")) return "obras-publicas";
  if (n.includes("agricultura")) return "agricultura";
  if (n.includes("medio ambiente")) return "medio-ambiente";
  if (n.includes("salud")) return "salud";
  if (n.includes("trabajo")) return "trabajo-y-prevision";
  if (n.includes("mineria") || n.includes("energia")) return "mineria";
  if (n.includes("economia")) return "economia";
  if (n.includes("vivienda")) return "vivienda";
  if (n.includes("derechos humanos")) return "derechos-humanos";
  if (n.includes("familia")) return "familias";
  if (n.includes("futuro") || n.includes("ciencia") || n.includes("tecnologia")) return "ciencias";
  if (n.includes("pesca")) return "pesca";
  if (n.includes("deportes")) return "deportes";
  if (n.includes("zonas extremas") || n.includes("antartica")) return "zonas-extremas";
  if (n.includes("seguridad ciudadana")) return "seguridad";
  if (n.includes("cultura") || n.includes("artes")) return "cultura";
  if (n.includes("desarrollo social")) return "desarrollo-social";
  if (n.includes("recursos hidricos") || n.includes("desertificacion")) return "recursos-hidricos";
  if (n.includes("emergencia") || n.includes("bomberos")) return "emergencias";
  if (n.includes("mujeres") || n.includes("equidad de genero")) return "mujeres-genero";
  if (n.includes("personas mayores") || n.includes("discapacidad")) return "personas-mayores";
  if (n.includes("inteligencia")) return "inteligencia-estado";
  if (n.includes("revisora de cuentas")) return "revisora-cuentas";
  if (n.includes("etica")) return "etica";
  if (n.includes("regimen interno")) return "regimen-interno";
  return null;
}

export async function fetchCamaraCitacionesSemanalesLive(forceRefresh: boolean = false): Promise<{
  porDia: any[];
  porComision: Record<string, any[]>;
  todas: any[];
}> {
  const cacheKey = "camara_citaciones_semanales_live";
  if (forceRefresh) {
    cache.delete(cacheKey);
  }

  return cache.wrap(cacheKey, 15 * 60 * 1000, async () => {
    try {
      const response = await fetch("https://www.camara.cl/legislacion/comisiones/citaciones_semana.aspx", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        signal: AbortSignal.timeout(9000)
      });

      if (!response.ok) {
        return {
          porDia: CAMARA_CITACIONES_SEMANALES_POR_DIA,
          porComision: CAMARA_CITACIONES_POR_COMISION,
          todas: CAMARA_CITACIONES_FULL_WEEK
        };
      }

      const html = await response.text();
      const articleRegex = /<article class="grid-12 citaciones">([\s\S]*?)<\/article>/gi;
      let artMatch;
      const daysList: any[] = [];
      const porComision: Record<string, any[]> = {};
      const todas: any[] = [];
      let totalCount = 0;

      while ((artMatch = articleRegex.exec(html)) !== null) {
        const artContent = artMatch[1];
        const dateMatch = artContent.match(/<p class="fecha">([\s\S]*?)<\/p>/i);
        const fechaStr = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : 'Fecha no especificada';

        const trRegex = /<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td colspan="2">([\s\S]*?)<\/td>\s*<\/tr>/gi;
        let trMatch;
        const dayCitaciones: any[] = [];

        while ((trMatch = trRegex.exec(artContent)) !== null) {
          totalCount++;
          const rawComision = trMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const rawHora = trMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const rawLugar = trMatch[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const rawContent = trMatch[4];

          const subRows: { materia: string; invitados: string }[] = [];
          const subTrRegex = /<tr>\s*<td class="w40"[^>]*>([\s\S]*?)<\/td>\s*<td class="w30"[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
          let subMatch;
          while ((subMatch = subTrRegex.exec(rawContent)) !== null) {
            const mat = subMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
            const inv = subMatch[2].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
            subRows.push({ materia: mat, invitados: inv });
          }

          let materia = '';
          let invitados = '';
          if (subRows.length > 0) {
            materia = subRows.map((sr, idx) => subRows.length > 1 ? `[Parte ${idx+1}] ${sr.materia}` : sr.materia).join('\n\n');
            invitados = subRows.map(sr => sr.invitados).filter(Boolean).join('\n---\n');
          } else {
            materia = rawContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }

          const boletines = materia.match(/\b\d{4,5}-\d{2}\b|\b\d{1,2}\.\d{3}-\d{2}\b/g) || [];
          const slug = getCommissionSlugFromName(rawComision);

          const citObj = {
            id: `cit-live-${totalCount}`,
            fecha: fechaStr,
            comisionNombre: rawComision,
            comisionSlug: slug || undefined,
            citacionNumero: `Citación Oficial N° ${totalCount}`,
            hora: rawHora,
            lugar: rawLugar,
            tipo: rawComision.startsWith("CEI") ? "Comisión Especial Investigadora" : "Sesión de Comisión",
            materia,
            invitados: invitados || "Autoridades sectoriales convocadas.",
            tabla: subRows.length > 0 ? subRows.map((sr, i) => `${i+1}. ${sr.materia.slice(0, 140)}...`) : [materia.slice(0, 140) + "..."],
            boletinesRelacionados: Array.from(new Set(boletines)),
            acuerdosCount: 0,
            completada: false
          };

          dayCitaciones.push(citObj);
          todas.push(citObj);

          if (slug) {
            if (!porComision[slug]) porComision[slug] = [];
            porComision[slug].push(citObj);
          }
        }

        daysList.push({
          fecha: fechaStr,
          totalCitaciones: dayCitaciones.length,
          citaciones: dayCitaciones
        });
      }

      if (todas.length > 0) {
        return {
          porDia: daysList,
          porComision,
          todas
        };
      }

      return {
        porDia: CAMARA_CITACIONES_SEMANALES_POR_DIA,
        porComision: CAMARA_CITACIONES_POR_COMISION,
        todas: CAMARA_CITACIONES_FULL_WEEK
      };
    } catch (err) {
      console.warn("Could not fetch live citaciones from Camara, using fallback:", err);
      return {
        porDia: CAMARA_CITACIONES_SEMANALES_POR_DIA,
        porComision: CAMARA_CITACIONES_POR_COMISION,
        todas: CAMARA_CITACIONES_FULL_WEEK
      };
    }
  });
}

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
