import type { DetalleSesionSenado } from "./senadoService";

/**
 * Resumen estructurado de una sesión de comisión armado SOLO con el registro oficial
 * (senado.cl). No usa IA ni completa nada: lo que la fuente no trae queda en null/[]
 * y la interfaz lo muestra como "No informado".
 */
export interface PuntoResumen {
  numero: string;
  boletin: string | null;
  tema: string;
  aspectos: string | null;
  acuerdos: string | null;
  invitados: string[];
  asistentes: string[];
}

export interface ResumenSesion {
  disponible: boolean;
  motivo?: string;
  url?: string;
  encabezado?: { comision: string | null; fecha: string | null; inicio: string | null; termino: string | null; duracionMin: number | null; lugar: string | null };
  asistentes: string[];
  invitados: string[];
  boletines: string[];
  puntos: PuntoResumen[];
  presentaciones: { titulo: string; url: string }[];
  estadisticas?: { puntos: number; conAcuerdos: number; sinAcuerdos: number; boletines: number; invitados: number; asistentes: number };
  fuente: string;
}

const vacio = (s?: string | null) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return !t || /^(null|undefined|n\/?a|-+)$/i.test(t) ? null : t;
};
const lista = (s?: string | null): string[] =>
  String(s ?? "").split(/[;\n]+/).map(x => x.replace(/\s+/g, " ").trim()).filter(x => x && !/^(null|undefined)$/i.test(x));
const unicos = (xs: string[]) => {
  const vistos = new Set<string>();
  return xs.filter(x => { const k = x.toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true; });
};
const minutos = (h?: string | null): number | null => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(h ?? "").trim());
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
};

export function construirResumenSesion(det: DetalleSesionSenado): ResumenSesion {
  const fuente = "Registro oficial de la sesión en senado.cl";
  if (!det?.disponible) {
    return { disponible: false, motivo: det?.motivo || "Detalle de la sesión no disponible.", url: det?.url, asistentes: [], invitados: [], boletines: [], puntos: [], presentaciones: [], fuente };
  }
  const puntos: PuntoResumen[] = (det.puntos || []).map(p => {
    const acu = vacio(p.acuerdos);
    return {
      numero: vacio(p.numero) || "",
      boletin: vacio(p.boletin),
      tema: vacio(p.tema) || "Tema no informado",
      aspectos: vacio(p.aspectos),
      acuerdos: acu && !/^pendiente\.?$/i.test(acu) ? acu : null,
      invitados: unicos(lista(p.invitados)),
      asistentes: unicos(lista(p.asistentes))
    };
  });
  const ini = minutos(det.inicio), fin = minutos(det.termino);
  const duracionMin = ini !== null && fin !== null && fin >= ini ? fin - ini : null;
  const asistentes = unicos(puntos.flatMap(p => p.asistentes));
  const invitados = unicos(puntos.flatMap(p => p.invitados));
  const boletines = unicos(puntos.map(p => p.boletin || "").filter(Boolean));
  const conAcuerdos = puntos.filter(p => p.acuerdos).length;
  return {
    disponible: true, url: det.url, fuente,
    encabezado: { comision: vacio(det.comision), fecha: vacio(det.fecha), inicio: vacio(det.inicio), termino: vacio(det.termino), duracionMin, lugar: vacio(det.lugar) },
    asistentes, invitados, boletines, puntos,
    presentaciones: (det.presentaciones || []).filter(x => x.url),
    estadisticas: { puntos: puntos.length, conAcuerdos, sinAcuerdos: puntos.length - conAcuerdos, boletines: boletines.length, invitados: invitados.length, asistentes: asistentes.length }
  };
}
