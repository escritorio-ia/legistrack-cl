/**
 * Informe resumen de una comisión: se arma con el registro automático de sesiones (citaciones, registro,
 * detalle y resultados oficiales) y con los análisis de video guardados. Solo compila lo registrado; no inventa.
 */
import type { SesionRegistradaUI } from "./metricasBoletin";
import { accionDelPunto } from "./pauta";

export interface AnalisisVideoUI {
  videoId: string;
  fecha?: string;          // como la guardó el modal (texto de la sesión)
  fechaISO?: string;       // aaaa-mm-dd si se pudo leer
  resumenes: string[];
  acuerdos: string[];
  votaciones: string[];
  oradores: string[];      // un elemento por intervención
}

export interface InformeComision {
  desde: string | null;
  hasta: string;
  realizadas: number;
  programadas: number;
  ultima: string | null;
  proxima: string | null;
  boletines: { boletin: string; sesiones: number; ultima: string; accion: string }[];
  porMes: { mes: string; n: number }[];
  cronologia: {
    fecha: string; hora: string | null; puntos: { texto: string; boletines: string[]; acuerdos?: string | null }[];
    resultado: string | null; invitados: string | null; video?: AnalisisVideoUI;
  }[];
  oradores: { nombre: string; intervenciones: number }[];
  sesionesConVideo: number;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function calcularInformeComision(sesiones: SesionRegistradaUI[], videos: AnalisisVideoUI[], desde: string | null, hoy: Date = new Date()): InformeComision {
  const hoyIso = iso(hoy);
  const enRango = sesiones.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.fecha) && (!desde || s.fecha >= desde));
  const realizadas = enRango.filter((s) => s.fecha <= hoyIso).sort((a, b) => a.fecha.localeCompare(b.fecha) || String(a.hora).localeCompare(String(b.hora)));
  const programadas = enRango.filter((s) => s.fecha > hoyIso).sort((a, b) => a.fecha.localeCompare(b.fecha));

  const bol = new Map<string, { boletin: string; sesiones: number; ultima: string; accion: string }>();
  for (const s of realizadas) {
    const puntos = s.puntos.length ? s.puntos : [{ numero: 1, texto: s.materia || "", boletines: s.boletines }];
    const vistos = new Set<string>();
    for (const p of puntos) for (const b of p.boletines) {
      if (vistos.has(b)) continue; vistos.add(b);
      const e = bol.get(b) || { boletin: b, sesiones: 0, ultima: "", accion: "" };
      e.sesiones++; e.ultima = s.fecha; e.accion = accionDelPunto(p.texto) || e.accion;
      bol.set(b, e);
    }
    for (const b of s.boletines) if (!vistos.has(b)) { const e = bol.get(b) || { boletin: b, sesiones: 0, ultima: "", accion: "" }; e.sesiones++; e.ultima = s.fecha; bol.set(b, e); }
  }

  const porMes = new Map<string, number>();
  for (const s of realizadas) porMes.set(s.fecha.slice(0, 7), (porMes.get(s.fecha.slice(0, 7)) || 0) + 1);

  const videoPorFecha = new Map<string, AnalisisVideoUI>();
  for (const v of videos) if (v.fechaISO && !videoPorFecha.has(v.fechaISO)) videoPorFecha.set(v.fechaISO, v);

  const cronologia = [...realizadas].reverse().map((s) => ({
    fecha: s.fecha, hora: s.hora,
    puntos: (s.puntos.length ? s.puntos : s.materia ? [{ numero: 1, texto: s.materia, boletines: s.boletines }] : []).map((p: any) => ({ texto: p.texto, boletines: p.boletines, acuerdos: p.acuerdos || null })),
    resultado: s.resultado, invitados: s.invitados, video: videoPorFecha.get(s.fecha),
  }));

  const usados = videos.filter((v) => v.fechaISO && realizadas.some((s) => s.fecha === v.fechaISO));
  const oradores = new Map<string, { nombre: string; intervenciones: number }>();
  for (const v of usados) for (const o of v.oradores) {
    const n = o.trim(); if (!n || /no identificad/i.test(n)) continue;
    const k = n.toLowerCase().replace(/\s+/g, " ");
    const e = oradores.get(k) || { nombre: n, intervenciones: 0 }; e.intervenciones++; oradores.set(k, e);
  }

  return {
    desde, hasta: hoyIso,
    realizadas: realizadas.length, programadas: programadas.length,
    ultima: realizadas.at(-1)?.fecha || null, proxima: programadas[0]?.fecha || null,
    boletines: [...bol.values()].sort((a, b) => b.sesiones - a.sesiones || b.ultima.localeCompare(a.ultima)),
    porMes: [...porMes.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([mes, n]) => ({ mes, n })),
    cronologia,
    oradores: [...oradores.values()].sort((a, b) => b.intervenciones - a.intervenciones),
    sesionesConVideo: new Set(usados.map((v) => v.fechaISO)).size,
  };
}

/** Texto plano del informe, para copiar o imprimir. */
export function informeATexto(nombre: string, camara: string, inf: InformeComision): string {
  const L: string[] = [];
  L.push(`INFORME RESUMEN · ${nombre} (${camara})`);
  L.push(`Período: ${inf.desde || "todo el registro"} a ${inf.hasta}`);
  L.push(`Sesiones realizadas: ${inf.realizadas} · Programadas: ${inf.programadas} · Boletines tratados: ${inf.boletines.length} · Sesiones con video analizado: ${inf.sesionesConVideo}`);
  L.push("", "BOLETINES TRATADOS");
  for (const b of inf.boletines) L.push(`- ${b.boletin}: ${b.sesiones} sesión(es), última ${b.ultima}${b.accion ? `, ${b.accion.toLowerCase()}` : ""}`);
  L.push("", "CRONOLOGÍA DE SESIONES");
  for (const s of inf.cronologia) {
    L.push(`${s.fecha}${s.hora ? ` ${s.hora}` : ""}`);
    s.puntos.forEach((p, i) => { L.push(`  ${i + 1}. ${p.texto}`); if (p.acuerdos) L.push(`     Acuerdos: ${p.acuerdos}`); });
    if (s.resultado) L.push(`  Resultado oficial: ${s.resultado}`);
    if (s.invitados) L.push(`  Invitados: ${s.invitados}`);
    if (s.video?.resumenes.length) L.push(`  Resumen del video (IA): ${s.video.resumenes.join(" ")}`);
  }
  if (inf.oradores.length) { L.push("", "ORADORES (análisis de video)"); for (const o of inf.oradores.slice(0, 20)) L.push(`- ${o.nombre}: ${o.intervenciones} intervención(es)`); }
  L.push("", "Fuentes: registro automático de sesiones (citaciones, registro, detalle y resultados oficiales) y análisis de video con IA de las transmisiones oficiales.");
  return L.join("\n");
}
