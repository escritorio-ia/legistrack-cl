/**
 * Línea de tiempo única de un boletín: une los hitos de tramitación, las sesiones de comisión (registro oficial,
 * con el resumen del informe de sesión cuando existe), la Sala (tabla del Senado y votaciones de la Cámara) y
 * las votaciones registradas. Función pura: recibe los datos ya leídos y devuelve los eventos ordenados.
 */
import { parseFechaFlexible } from "./tramitacion";
import { normalizarBoletin } from "./boletines";

export type TipoEvento = "tramite" | "comision" | "sala" | "votacion";

export interface EventoLinea {
  id: string;
  tipo: TipoEvento;
  fecha: string;            // AAAA-MM-DD
  hora?: string | null;
  titulo: string;
  lugar?: string;           // comisión o cámara
  detalle?: string;
  resultado?: string;       // aprobado / rechazado / acuerdo
  votos?: { si: number; no: number; abstencion: number };
  futuro?: boolean;
  videoId?: string;         // sesión con informe/transcripción
  enlace?: string;
  fuente: string;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function fechaISO(f?: string | null): string {
  const t = String(f || "");
  const m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[0];
  const d = parseFechaFlexible(t);
  return d ? iso(d) : "";
}
const normCom = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\b(comision|de|del|la|el|y)\b/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export function construirLineaTiempo(p: {
  boletin: string;
  hoy: string;
  tramites: { id?: string; fecha: string; titulo: string; descripcion?: string; tipo?: string }[];
  votacionesSenado: { id: string; fecha: string; materia: string; si: number; no: number; abstenciones?: number; abstencios?: number; resultado: string; conteoInformado?: boolean }[];
  votacionesCamara: { id: string; fecha: string; descripcion: string; si: number; no: number; abstencion: number; resultado: string; tipo?: string; tramite?: string }[];
  sesionesComision: { id: string; camara: string; comisionNombre: string; fecha: string; hora: string | null; puntos: { texto: string; boletines: string[]; acuerdos?: string | null }[]; resultado: string | null; materia: string | null; enlaces: string[] }[];
  informes: { videoId: string; fecha: string; comision: string; sintesis: string; acuerdos: string[]; votaciones: string[]; estado: string }[];
  sala: { id: string; camara: string; numero: string; fecha: string; horaInicio: string; tipo: string; estado: string; puntos: { boletin: string; parte: string; quorum: string; posicion: number; enlace: string }[]; votaciones: { id: string; fecha: string; boletin: string; si: number; no: number; abstencion: number; resultado: string; quorum: string; tipo: string }[] }[];
}): EventoLinea[] {
  const b = normalizarBoletin(p.boletin);
  const ev: EventoLinea[] = [];

  for (const t of p.tramites) {
    const fecha = fechaISO(t.fecha);
    if (!fecha) continue;
    ev.push({ id: `t-${t.id || fecha + t.titulo}`, tipo: "tramite", fecha, titulo: t.titulo || "Trámite", detalle: t.descripcion && t.descripcion !== t.titulo ? t.descripcion : undefined, fuente: "Tramitación oficial" });
  }

  // Comisiones: una entrada por sesión, con el resumen del informe de sesión si existe (misma fecha y comisión).
  const usados = new Set<string>();
  for (const s of p.sesionesComision) {
    const fecha = fechaISO(s.fecha);
    if (!fecha) continue;
    const puntos = s.puntos.filter((x) => x.boletines.includes(b));
    const inf = p.informes.find((i) => !usados.has(i.videoId) && i.fecha === fecha && (normCom(i.comision).includes(normCom(s.comisionNombre)) || normCom(s.comisionNombre).includes(normCom(i.comision))));
    if (inf) usados.add(inf.videoId);
    const acuerdos = [...puntos.map((x) => x.acuerdos).filter(Boolean) as string[], ...(inf?.acuerdos || []), ...(inf?.votaciones || [])];
    ev.push({
      id: `c-${s.id}`, tipo: "comision", fecha, hora: s.hora, titulo: inf?.estado ? `Sesión de comisión · ${inf.estado}` : "Sesión de comisión",
      lugar: s.comisionNombre,
      detalle: inf?.sintesis || puntos.map((x) => x.texto).join(" · ") || s.materia || undefined,
      resultado: [s.resultado, ...acuerdos].filter(Boolean).join(" · ") || undefined,
      futuro: fecha > p.hoy, videoId: inf?.videoId, enlace: s.enlaces[0],
      fuente: inf ? "Registro oficial e informe de la sesión (transcripción)" : "Registro oficial de la sesión",
    });
  }
  // Informes de sesiones que no están en el registro (p. ej. sesiones antiguas).
  for (const i of p.informes) {
    if (usados.has(i.videoId) || !i.fecha) continue;
    ev.push({ id: `i-${i.videoId}`, tipo: "comision", fecha: i.fecha, titulo: i.estado ? `Sesión de comisión · ${i.estado}` : "Sesión de comisión", lugar: i.comision, detalle: i.sintesis || undefined, resultado: [...i.acuerdos, ...i.votaciones].join(" · ") || undefined, futuro: i.fecha > p.hoy, videoId: i.videoId, fuente: "Informe de la sesión (transcripción)" });
  }

  // Sala: tabla del Senado y votaciones de la Cámara.
  const votosSala = new Set<string>();
  for (const s of p.sala) {
    const fecha = fechaISO(s.fecha);
    if (!fecha) continue;
    const puntos = s.puntos.filter((x) => x.boletin === b);
    const votos = s.votaciones.filter((v) => v.boletin === b);
    votos.forEach((v) => votosSala.add(v.id));
    if (puntos.length) {
      ev.push({ id: `s-${s.id}`, tipo: "sala", fecha, hora: s.horaInicio, titulo: `En tabla de Sala · Sesión N° ${s.numero || "s/n"}`, lugar: s.camara, detalle: puntos.map((x) => `Punto ${x.posicion}${x.parte ? ` (${x.parte.toLowerCase()})` : ""}${x.quorum ? ` · ${x.quorum}` : ""}`).join(" · "), futuro: fecha > p.hoy, enlace: puntos[0].enlace || undefined, fuente: "Tabla oficial de la Sala" });
    }
    for (const v of votos) {
      ev.push({ id: `sv-${v.id}`, tipo: "votacion", fecha: fechaISO(v.fecha) || fecha, hora: v.fecha.slice(11, 16), titulo: `Votación en Sala${v.tipo ? ` · ${v.tipo}` : ""}`, lugar: s.camara, resultado: v.resultado, votos: { si: v.si, no: v.no, abstencion: v.abstencion }, detalle: v.quorum || undefined, fuente: "Votaciones de la Sala (datos abiertos)" });
    }
  }
  for (const v of p.votacionesCamara) {
    if (votosSala.has(v.id)) continue;
    const fecha = fechaISO(v.fecha);
    if (!fecha) continue;
    ev.push({ id: `vc-${v.id}`, tipo: "votacion", fecha, hora: v.fecha.slice(11, 16) || null, titulo: `Votación${v.tipo ? ` · ${v.tipo}` : ""}`, lugar: "Cámara", detalle: [v.descripcion, v.tramite].filter(Boolean).join(" · "), resultado: v.resultado, votos: { si: v.si, no: v.no, abstencion: v.abstencion }, fuente: "Datos abiertos de la Cámara" });
  }
  for (const v of p.votacionesSenado) {
    const fecha = fechaISO(v.fecha);
    if (!fecha) continue;
    ev.push({ id: `vs-${v.id}`, tipo: "votacion", fecha, titulo: "Votación", lugar: "Senado", detalle: v.materia, resultado: v.resultado, votos: v.conteoInformado === false ? undefined : { si: v.si, no: v.no, abstencion: v.abstenciones ?? v.abstencios ?? 0 }, fuente: "Tramitación oficial del Senado" });
  }

  const orden: Record<TipoEvento, number> = { tramite: 0, comision: 1, sala: 2, votacion: 3 };
  return ev.sort((a, c) => c.fecha.localeCompare(a.fecha) || String(c.hora || "").localeCompare(String(a.hora || "")) || orden[a.tipo] - orden[c.tipo]);
}
