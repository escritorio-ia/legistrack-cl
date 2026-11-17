import React, { useEffect, useState } from "react";
import type { SesionSala } from "../utils/sala";
import { normalizarBoletin } from "../utils/boletines";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fmt = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return y ? `${d} ${MESES[m - 1]} ${y}` : "Fecha no informada"; };

/** Paso del boletín por la Sala de ambas cámaras: tablas del Senado y votaciones de la Cámara (registro automático). */
export default function SalaBoletin({ proyectoId }: { proyectoId: string }) {
  const [sesiones, setSesiones] = useState<SesionSala[] | null>(null);
  const [motivo, setMotivo] = useState("");
  const b = normalizarBoletin(proyectoId);

  useEffect(() => {
    let vigente = true;
    setSesiones(null); setMotivo("");
    fetch(`/api/proyecto/${encodeURIComponent(proyectoId)}/sala`).then((r) => r.json())
      .then((d) => { if (!vigente) return; if (d.disponible) setSesiones(d.sesiones || []); else { setMotivo(d.motivo || "no disponible"); setSesiones([]); } })
      .catch((e) => { if (vigente) { setMotivo(e?.message || "sin conexión"); setSesiones([]); } });
    return () => { vigente = false; };
  }, [proyectoId]);

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Paso por la Sala (registro de sesiones)</h4>
      <p className="text-[11px] text-slate-500 mb-3">Tablas de la Sala del Senado y votaciones de la Sala de la Cámara en que figura el boletín {b}. Se registra automáticamente desde las fuentes oficiales.</p>
      {sesiones === null ? <p className="text-xs text-slate-400">Cargando…</p>
        : motivo ? <p className="text-xs text-amber-800">Registro no disponible: {motivo}.</p>
        : sesiones.length === 0 ? <p className="text-xs text-slate-500">No informado: el boletín no figura en las sesiones de Sala registradas.</p>
        : (
          <ol className="flex flex-col gap-2">
            {sesiones.map((s) => {
              const puntos = s.puntos.filter((p) => p.boletin === b);
              const votos = s.votaciones.filter((v) => v.boletin === b);
              return (
                <li key={s.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                    <span className={`font-extrabold ${s.camara === "Senado" ? "text-emerald-700" : "text-blue-700"}`}>{s.camara}</span>
                    <span className="font-bold text-slate-900">{fmt(s.fecha)}</span>
                    <span className="text-slate-600">Sesión N° {s.numero || "no informado"} · {s.tipo || "tipo no informado"}{s.horaInicio ? ` · ${s.horaInicio} h` : ""}</span>
                    {s.estado && <span className="text-slate-500">{s.estado}</span>}
                  </div>
                  {puntos.map((p) => (
                    <p key={p.posicion} className="mt-1 text-slate-700">En tabla, punto {p.posicion}{p.parte ? ` (${p.parte.toLowerCase()})` : ""}{p.quorum ? ` · ${p.quorum}` : ""}.</p>
                  ))}
                  {votos.map((v) => (
                    <p key={v.id} className="mt-1 text-slate-700">
                      Votación {v.fecha.slice(11, 16)}: <b className={/aprob/i.test(v.resultado) ? "text-emerald-700" : /rechaz/i.test(v.resultado) ? "text-red-700" : ""}>{v.resultado || "resultado no informado"}</b> · Sí {v.si}, No {v.no}, Abst. {v.abstencion} · {v.quorum || "quórum no informado"}
                    </p>
                  ))}
                </li>
              );
            })}
          </ol>
        )}
    </div>
  );
}
