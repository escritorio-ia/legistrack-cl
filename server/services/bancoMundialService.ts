/**
 * Series reales de la API pública del Banco Mundial (World Development Indicators) para
 * reemplazar, en Statistics++, las series escritas a mano. Sin credenciales.
 * Chile + promedio OCDE (OED) + América Latina y el Caribe (LCN).
 */

export interface PuntoVivo {
  year: number;
  chile: number;
  oecd_avg?: number;
  latam_avg?: number;
}

export interface IndicadorVivo {
  id: string;
  serieHistorica: PuntoVivo[];
  fuente: string;
  urlFuente: string;
  definicion: string;
  frecuencia: string;
  sintesisDiagnostica: string;
  consultadoEl: string;
}

const CONFIG: { id: string; codigo: string; nombre: string; definicion: string; unidad: string; decimales: number }[] = [
  {
    id: "esperanza-vida-anos",
    codigo: "SP.DYN.LE00.IN",
    nombre: "esperanza de vida al nacer",
    definicion: "Años que viviría un recién nacido si los patrones de mortalidad del año se mantuvieran constantes (Banco Mundial, a partir de tablas de mortalidad oficiales).",
    unidad: "años",
    decimales: 1,
  },
  {
    id: "gasto-salud-pct-pib",
    codigo: "SH.XPD.GHED.GD.ZS",
    nombre: "gasto público interno en salud",
    definicion: "Gasto del gobierno general (fondos internos) en salud como porcentaje del PIB, según la base de gasto sanitario de la OMS publicada por el Banco Mundial. Puede diferir de la cifra de la partida presupuestaria del Ministerio de Salud (DIPRES).",
    unidad: "% del PIB",
    decimales: 2,
  },
  {
    id: "emisiones-co2-percapita",
    codigo: "EN.GHG.CO2.PC.CE.AR5",
    nombre: "emisiones de CO₂ per cápita (sin uso del suelo)",
    definicion: "Emisiones territoriales de CO₂ sin cambio de uso del suelo (LULUCF), en toneladas de CO₂ equivalente por habitante (Banco Mundial / Climate Watch).",
    unidad: "t CO₂e / habitante",
    decimales: 1,
  },
];

const TTL_MS = 12 * 60 * 60 * 1000;
let cache: { en: number; datos: Record<string, IndicadorVivo> } | null = null;

async function traer(codigo: string): Promise<PuntoVivo[]> {
  const url = `https://api.worldbank.org/v2/country/CHL;OED;LCN/indicator/${codigo}?format=json&per_page=500&date=1990:${new Date().getFullYear()}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`Banco Mundial ${r.status}`);
  const json: any = await r.json();
  const filas: any[] = Array.isArray(json) ? json[1] || [] : [];
  const porAnio = new Map<number, PuntoVivo>();
  for (const f of filas) {
    if (typeof f?.value !== "number") continue;
    const year = Number(f.date);
    if (!Number.isFinite(year)) continue;
    const pais = f.countryiso3code;
    const p = porAnio.get(year) || ({ year } as PuntoVivo);
    if (pais === "CHL") p.chile = f.value;
    else if (pais === "OED") p.oecd_avg = f.value;
    else if (pais === "LCN") p.latam_avg = f.value;
    porAnio.set(year, p);
  }
  return Array.from(porAnio.values())
    .filter(p => typeof p.chile === "number")
    .sort((a, b) => a.year - b.year);
}

const redondear = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

export async function getIndicadoresVivos(): Promise<Record<string, IndicadorVivo>> {
  if (cache && Date.now() - cache.en < TTL_MS) return cache.datos;
  const datos: Record<string, IndicadorVivo> = {};
  const hoy = new Date().toISOString().slice(0, 10);
  await Promise.all(
    CONFIG.map(async c => {
      try {
        const serie = (await traer(c.codigo)).map(p => ({
          year: p.year,
          chile: redondear(p.chile, c.decimales + 1),
          ...(typeof p.oecd_avg === "number" ? { oecd_avg: redondear(p.oecd_avg, c.decimales + 1) } : {}),
          ...(typeof p.latam_avg === "number" ? { latam_avg: redondear(p.latam_avg, c.decimales + 1) } : {}),
        }));
        if (serie.length < 3) return;
        const ult = serie[serie.length - 1];
        datos[c.id] = {
          id: c.id,
          serieHistorica: serie,
          fuente: "Banco Mundial (World Development Indicators)",
          urlFuente: `https://data.worldbank.org/indicator/${c.codigo}?locations=CL`,
          definicion: c.definicion,
          frecuencia: `Anual (serie ${serie[0].year} – ${ult.year}, último año publicado)`,
          sintesisDiagnostica: `Último dato publicado para Chile: ${ult.chile.toLocaleString("es-CL", { maximumFractionDigits: c.decimales })} ${c.unidad} (${ult.year}).` +
            (typeof ult.oecd_avg === "number" ? ` Promedio OCDE ese año: ${ult.oecd_avg.toLocaleString("es-CL", { maximumFractionDigits: c.decimales })}.` : "") +
            (typeof ult.latam_avg === "number" ? ` América Latina y el Caribe: ${ult.latam_avg.toLocaleString("es-CL", { maximumFractionDigits: c.decimales })}.` : "") +
            ` Serie de ${c.nombre} descargada del Banco Mundial el ${hoy}; no incluye estimaciones propias.`,
          consultadoEl: hoy,
        };
      } catch (e: any) {
        console.warn(`[bancoMundial] ${c.id}: ${e?.message}`);
      }
    })
  );
  if (Object.keys(datos).length > 0) cache = { en: Date.now(), datos };
  return datos;
}
