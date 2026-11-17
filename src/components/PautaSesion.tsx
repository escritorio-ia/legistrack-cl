import React, { useMemo, useState } from "react";
import { puntosDeMateria, urgenciaDelPunto, accionDelPunto } from "../utils/pauta";

/**
 * Pauta de una sesión en puntos numerados (texto oficial de la citación), con los boletines de cada punto como enlaces.
 * Reemplaza el bloque de texto corrido de la materia.
 */
export default function PautaSesion({
  materia,
  maxPuntos = 3,
  onAbrirBoletin,
  oscuro = false,
}: {
  materia?: string;
  maxPuntos?: number;
  onAbrirBoletin?: (boletin: string) => void;
  oscuro?: boolean;
}) {
  const puntos = useMemo(() => puntosDeMateria(materia || ""), [materia]);
  const [todos, setTodos] = useState(false);
  const [abiertos, setAbiertos] = useState<Record<number, boolean>>({});
  if (puntos.length === 0) return <p className={`text-xs italic ${oscuro ? "text-slate-400" : "text-slate-400"}`}>Pauta no informada.</p>;

  const boletines = Array.from(new Set(puntos.flatMap((p) => p.boletines)));
  const visibles = todos ? puntos : puntos.slice(0, maxPuntos);
  const c = oscuro
    ? { texto: "text-slate-200", sub: "text-slate-400", caja: "bg-slate-800/60 border-slate-700", chip: "bg-slate-700 text-blue-200 hover:bg-slate-600", num: "text-amber-300" }
    : { texto: "text-slate-800", sub: "text-slate-500", caja: "bg-white border-slate-200", chip: "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100", num: "text-blue-700" };

  return (
    <div className="flex flex-col gap-2">
      <p className={`text-[10px] font-bold uppercase tracking-wider ${c.sub}`}>
        Pauta: {puntos.length} punto{puntos.length === 1 ? "" : "s"} · {boletines.length} {boletines.length === 1 ? "boletín" : "boletines"}
      </p>
      <ol className="flex flex-col gap-1.5">
        {visibles.map((p) => {
          const urg = urgenciaDelPunto(p.texto);
          const acc = accionDelPunto(p.texto);
          const abierto = !!abiertos[p.numero];
          return (
            <li key={p.numero} className={`rounded-lg border px-2.5 py-2 ${c.caja}`}>
              <div className="flex items-start gap-2">
                <span className={`text-[11px] font-black font-mono shrink-0 ${c.num}`}>{p.numero}.</span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setAbiertos((x) => ({ ...x, [p.numero]: !abierto }))}
                    className={`text-left text-[11.5px] leading-snug ${c.texto} ${abierto ? "" : "line-clamp-2"} cursor-pointer`}
                    title={abierto ? "Mostrar menos" : "Mostrar el texto completo"}
                  >
                    {p.texto}
                  </button>
                  {(p.boletines.length > 0 || urg || acc) && (
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {acc && <span className={`text-[9.5px] font-bold uppercase ${c.sub}`}>{acc}</span>}
                      {urg && <span className="text-[9.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded px-1.5 py-0.5">{urg}</span>}
                      {p.boletines.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => onAbrirBoletin?.(b)}
                          disabled={!onAbrirBoletin}
                          className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 ${c.chip} ${onAbrirBoletin ? "cursor-pointer" : "cursor-default"}`}
                          title={onAbrirBoletin ? `Abrir el proyecto ${b}` : undefined}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {puntos.length > maxPuntos && (
        <button type="button" onClick={() => setTodos((v) => !v)} className={`text-[11px] font-bold ${oscuro ? "text-blue-300" : "text-blue-700"} hover:underline cursor-pointer self-start`}>
          {todos ? "Mostrar menos" : `Ver los ${puntos.length} puntos`}
        </button>
      )}
    </div>
  );
}
