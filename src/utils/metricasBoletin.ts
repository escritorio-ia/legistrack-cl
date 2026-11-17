import { normalizarBoletin, tiempoDeSesion } from "./boletines";

/** Forma de una sesión registrada tal como la entrega /api/proyecto/:id/registro-sesiones. */
export interface SesionRegistradaUI {
  id: string;
  camara: string;
  comisionId?: string;
  comisionNombre: string;
  fecha: string; // aaaa-mm-dd
  boletines: string[];
  fuentes: string[];
  hora: string | null;
  lugar: string | null;
  citacionNumero: string | null;
  materia: string | null;
  puntos: { numero: number; texto: string; boletines: string[]; aspectos?: string | null; acuerdos?: string | null; invitados?: string | null; asistentes?: string | null }[];
  invitados: string | null;
  resultado: string | null;
  enlaces: string[];
}

export interface TranscripcionUI { videoId: string; fecha?: string; comision?: string; segmentos: { segundos: number; orador: string; texto: string }[] }

export interface MetricasBoletin {
  total: number;
  realizadas: number;
  programadas: number;
  primera: string | null;
  ultima: string | null;
  diasDesdeUltima: number | null;
  proxima: string | null;
  porComision: { nombre: string; camara: string; n: number }[];
  porMes: { mes: string; n: number }[];
  acuerdos: { fecha: string; comision: string; texto: string; fuente: string }[];
  invitados: { fecha: string; comision: string; texto: string }[];
  oradores: { nombre: string; intervenciones: number; segundosAprox: number; sesiones: number }[];
  segmentosSinIdentificar: number;
  sesionesConTranscripcion: number;
}

const dia = (iso: string) => new Date(`${iso}T12:00:00`).getTime();
const SEG_MAX = 600; // una intervención no se cuenta como más de 10 minutos (evita sumar recesos)

/**
 * Métricas de un boletín a partir del registro de sesiones (datos oficiales) y de las transcripciones guardadas
 * (automáticas). Solo cuenta lo que está registrado; no extrapola.
 */
export function calcularMetricasBoletin(boletin: string, sesiones: SesionRegistradaUI[], transcripciones: TranscripcionUI[] = [], hoy: Date = new Date()): MetricasBoletin {
  const b = normalizarBoletin(boletin);
  const hoyIso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  const conFecha = sesiones.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.fecha)).sort((a, c) => a.fecha.localeCompare(c.fecha));
  const realizadas = conFecha.filter((s) => s.fecha <= hoyIso);
  const programadas = conFecha.filter((s) => s.fecha > hoyIso);
  const ultima = realizadas.at(-1)?.fecha || null;

  const porComision = new Map<string, { nombre: string; camara: string; n: number }>();
  for (const s of realizadas) {
    const k = `${s.camara}|${s.comisionNombre}`;
    const e = porComision.get(k) || { nombre: s.comisionNombre, camara: s.camara, n: 0 };
    e.n++;
    porComision.set(k, e);
  }
  const porMes = new Map<string, number>();
  for (const s of realizadas) porMes.set(s.fecha.slice(0, 7), (porMes.get(s.fecha.slice(0, 7)) || 0) + 1);

  // Acuerdos: del detalle oficial por punto (solo los puntos de este boletín) y el resultado oficial de la Cámara.
  const acuerdos: MetricasBoletin["acuerdos"] = [];
  const invitados: MetricasBoletin["invitados"] = [];
  for (const s of [...realizadas].reverse()) {
    const puntos = s.puntos.filter((p) => p.boletines.includes(b));
    for (const p of puntos) {
      if (p.acuerdos) acuerdos.push({ fecha: s.fecha, comision: s.comisionNombre, texto: p.acuerdos, fuente: "detalle oficial de la sesión" });
      if (p.invitados) invitados.push({ fecha: s.fecha, comision: s.comisionNombre, texto: p.invitados });
    }
    if (s.resultado) acuerdos.push({ fecha: s.fecha, comision: s.comisionNombre, texto: s.resultado, fuente: "resultado oficial" });
    if (s.invitados && !puntos.some((p) => p.invitados)) invitados.push({ fecha: s.fecha, comision: s.comisionNombre, texto: s.invitados });
  }

  // Oradores: de las transcripciones automáticas. Tiempo aproximado = hasta la siguiente intervención (máx. 10 min).
  const oradores = new Map<string, { nombre: string; intervenciones: number; segundosAprox: number; sesiones: Set<string> }>();
  let sinIdentificar = 0;
  for (const t of transcripciones) {
    const segs = [...(t.segmentos || [])].sort((a, c) => a.segundos - c.segundos);
    segs.forEach((g, i) => {
      const nombre = String(g.orador || "").trim();
      if (!nombre || /no identificad/i.test(nombre)) { sinIdentificar++; return; }
      const dur = i + 1 < segs.length ? Math.min(SEG_MAX, Math.max(0, segs[i + 1].segundos - g.segundos)) : 0;
      const k = nombre.toLowerCase().replace(/\s+/g, " ");
      const e = oradores.get(k) || { nombre, intervenciones: 0, segundosAprox: 0, sesiones: new Set<string>() };
      e.intervenciones++;
      e.segundosAprox += dur;
      e.sesiones.add(t.videoId);
      oradores.set(k, e);
    });
  }

  return {
    total: conFecha.length,
    realizadas: realizadas.length,
    programadas: programadas.length,
    primera: realizadas[0]?.fecha || null,
    ultima,
    diasDesdeUltima: ultima ? Math.round((dia(hoyIso) - dia(ultima)) / 86400000) : null,
    proxima: programadas[0]?.fecha || null,
    porComision: [...porComision.values()].sort((a, c) => c.n - a.n),
    porMes: [...porMes.entries()].sort((a, c) => a[0].localeCompare(c[0])).map(([mes, n]) => ({ mes, n })),
    acuerdos,
    invitados,
    oradores: [...oradores.values()].map((o) => ({ nombre: o.nombre, intervenciones: o.intervenciones, segundosAprox: o.segundosAprox, sesiones: o.sesiones.size }))
      .sort((a, c) => c.segundosAprox - a.segundosAprox || c.intervenciones - a.intervenciones),
    segmentosSinIdentificar: sinIdentificar,
    sesionesConTranscripcion: transcripciones.filter((t) => (t.segmentos || []).length > 0).length,
  };
}

/** Busca el registro de una sesión mostrada en pantalla: misma fecha y, si hay varias ese día, misma hora de inicio. */
export function registroDeSesion(registros: SesionRegistradaUI[], fechaTexto: string, horaTexto?: string): SesionRegistradaUI | null {
  const t = tiempoDeSesion(fechaTexto);
  if (!t) return null;
  const d = new Date(t);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const delDia = registros.filter((r) => r.fecha === iso);
  if (delDia.length <= 1) return delDia[0] || null;
  const h = String(horaTexto || "").match(/(\d{1,2})[:.](\d{2})/);
  if (!h) return null;
  const hhmm = `${h[1].padStart(2, "0")}${h[2]}`;
  return delDia.find((r) => r.id.endsWith(`-${hhmm}`)) || null;
}
