/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cache } from "./cacheService";

export const FAO_CONFIG = {
  baseUrl: "https://faostatservices.fao.org/api/v1/en",
  userEmail: "pgonzalez@bcn.cl",
  token: process.env.FAO_API_TOKEN || "eyJraWQiOiJVSFE2dmwrekFTaGRpSGpsOFFSK0d2ZW13RWIzSjZNdytYNTRURXZtNUNJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3MmU1YzQ2NC0wMGIxLTcwMTUtYzIwZC0xOGU0OGFlZWFmYWEiLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2V1LXdlc3QtMV9iTkVMTk9DMnYiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIyY3NsdHNpZ2FvODVpdmhwNm9qcDFhaWM3byIsIm9yaWdpbl9qdGkiOiJkODYzODEyZS05MDlkLTQ2YmQtODkyMS01ZmU3ODk5MDI3MWEiLCJldmVudF9pZCI6IjZkZGM3NGM3LWVlM2UtNGYyYy04ZGI5LWY4MjZkYzY2YjM3YiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE3ODc2OTM4OTcsImV4cCI6MTc4NzY5NzQ5NywiaWF0IjoxNzg3NjkzODk3LCJqdGkiOiIzMjBlMjhjMS01NWU4LTRjZGYtOWQ4Ni0yNTNlYjA0YjhhNzAiLCJ1c2VybmFtZSI6InBnb256YWxleiJ9.CvVDO-7qNww_aPd8bHMKhC-lzTWBg4Myz3AKaOCAvcCn_xYNqidOpyA2lGYW8bamERQSL2MTP8nu_XQ0lvxV-NmC2ZotTQqd9wwJZEmSuLosKL8laG-ke-a57uFClRjugkgrUeLO6WxqBewf26AO4zGniYtyOgxYWMq_AWa70NTkf2fS8bo3cFxCOyy73EnochwDQHCofVX_FCRvBy88Mwp6ve--QvvTjzdf18iT0xaf32xUN1DydlZRVc2wn5aZQCWb077VzeszRdw0ZZ-cFG5XpIFB392URT5x5HhEonZJzBfw9_-CEVNUBEeGcOgMICzUgLDpJPaXX9RzS1_EbA",
  chileAreaCode: "40"
};

/**
 * Obtiene los grupos y dominios disponibles en FAOSTAT
 */
export async function getFAOGroupsAndDomains(): Promise<any[]> {
  const cacheKey = "faostat_groups_domains";
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${FAO_CONFIG.baseUrl}/groupsanddomains`, {
      headers: {
        "Authorization": `Bearer ${FAO_CONFIG.token}`,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      console.warn(`[FAOSTAT] Error ${res.status} al consultar groupsanddomains`);
      return [];
    }

    const json = await res.json();
    const data = json?.data || [];
    cache.set(cacheKey, data, 3600); // 1 hora de cache
    return data;
  } catch (error: any) {
    console.error("[FAOSTAT] Error de conexión:", error.message);
    return [];
  }
}

/**
 * Consulta datos específicos de un dominio FAOSTAT
 */
export async function queryFAOData(domain: string, params: Record<string, string | number> = {}): Promise<any[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("area", String(params.area || FAO_CONFIG.chileAreaCode));
  
  if (params.year) queryParams.set("year", String(params.year));
  if (params.item) queryParams.set("item", String(params.item));
  if (params.element) queryParams.set("element", String(params.element));

  const cacheKey = `faostat_data_${domain}_${queryParams.toString()}`;
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${FAO_CONFIG.baseUrl}/data/${domain}?${queryParams.toString()}`;
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${FAO_CONFIG.token}`,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      console.warn(`[FAOSTAT] Error ${res.status} al consultar ${url}`);
      return [];
    }

    const json = await res.json();
    const data = json?.data || [];
    cache.set(cacheKey, data, 1800); // 30 minutos de cache
    return data;
  } catch (error: any) {
    console.error(`[FAOSTAT] Error al consultar dominio ${domain}:`, error.message);
    return [];
  }
}
