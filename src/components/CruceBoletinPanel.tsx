/**
 * Panel "Cruce del boletín": proyecto chileno ↔ moción/mensaje original ↔ normas de otros países,
 * con comparador jurídico, análisis de función y de jurisdicción. Cada fuente es un hipervínculo
 * verificado (el servidor visita la URL).
 */
import React from "react";
import { Scale, FileText, Landmark, Gavel, Loader2 } from "lucide-react";
import EnlaceVerificado from "./EnlaceVerificado";

export interface FuenteCruceUI {
  n: number;
  rotulo: string;
  pais?: string;
  titulo: string;
  url?: string;
}

export interface CruceBoletinEstado {
  boletin: string;
  cargando: boolean;
  error?: string;
  titulo?: string;
  iniciativa?: string;
  autores?: string;
  fechaIngreso?: string;
  fuentes: FuenteCruceUI[];
  resultado?: {
    disponible: boolean;
    motivo?: string;
    sintesis?: string;
    original?: { funcion: string; jurisdiccion: string; refs: number[] };
    comparador?: { dimension: string; chile: string; paises: { n: number; pais: string; texto: string }[]; lectura: string }[];
    porPais?: { n: number; pais: string; funcion: string; jurisdiccion: string }[];
    fuentesDescartadas?: number[];
  };
}

/** Convierte "[3]" en un enlace verificado a la fuente 3. */
function ConRefs({ texto, fuentes }: { texto: string; fuentes: FuenteCruceUI[] }) {
  const partes = texto.split(/(\[\d+\])/g);
  return (
    <>
      {partes.map((p, i) => {
        const m = p.match(/^\[(\d+)\]$/);
        if (!m) return <React.Fragment key={i}>{p}</React.Fragment>;
        const f = fuentes.find(x => x.n === Number(m[1]));
        if (!f?.url) return <span key={i} className="text-slate-400">{p}</span>;
        return <EnlaceVerificado key={i} url={f.url} className="font-bold text-[11px] align-baseline">{p}</EnlaceVerificado>;
      })}
    </>
  );
}

export default function CruceBoletinPanel({ cruce }: { cruce: CruceBoletinEstado }) {
  const { resultado, fuentes } = cruce;
  const refsOriginal = (resultado?.original?.refs || []).map(n => fuentes.find(f => f.n === n)).filter(Boolean) as FuenteCruceUI[];

  return (
    <section className="bg-white border-2 border-indigo-200 rounded-2xl shadow-sm overflow-hidden" id="cruce-boletin">
      <div className="bg-indigo-700 text-white px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Scale className="w-4 h-4" />
        <h3 className="text-sm font-extrabold tracking-tight">Cruce del Boletín {cruce.boletin}</h3>
        <span className="text-[11px] text-indigo-100 font-medium">
          proyecto ↔ {cruce.iniciativa === "Mensaje" ? "mensaje" : cruce.iniciativa === "Moción" ? "moción" : "moción/mensaje"} original ↔ normas de otros países
        </span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {cruce.titulo && <p className="text-sm font-bold text-slate-900 leading-snug">{cruce.titulo}</p>}
        {(cruce.iniciativa || cruce.autores || cruce.fechaIngreso) && (
          <p className="text-[11px] text-slate-500">
            {[cruce.iniciativa, cruce.autores && `Autores: ${cruce.autores}`, cruce.fechaIngreso && `Ingreso: ${cruce.fechaIngreso}`].filter(Boolean).join(" · ")}
          </p>
        )}

        {cruce.cargando && (
          <p className="text-xs text-indigo-800 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cruzando el boletín con la moción o mensaje original y las normas de otros países…</p>
        )}
        {cruce.error && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{cruce.error}</p>}
        {resultado && !resultado.disponible && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{resultado.motivo}</p>
        )}

        {resultado?.disponible && (
          <>
            {resultado.sintesis && (
              <p className="text-[13px] leading-relaxed text-slate-800"><ConRefs texto={resultado.sintesis} fuentes={fuentes} /></p>
            )}

            {/* Función y jurisdicción del proyecto */}
            {resultado.original && (
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 font-mono flex items-center gap-1.5"><Gavel className="w-3.5 h-3.5" /> Función del proyecto</p>
                  <p className="text-[12.5px] text-slate-800 mt-1.5 leading-relaxed"><ConRefs texto={resultado.original.funcion} fuentes={fuentes} /></p>
                </div>
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 font-mono flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Jurisdicción y competencia</p>
                  <p className="text-[12.5px] text-slate-800 mt-1.5 leading-relaxed"><ConRefs texto={resultado.original.jurisdiccion} fuentes={fuentes} /></p>
                </div>
              </div>
            )}
            {refsOriginal.length > 0 && (
              <p className="text-[11px] text-slate-500">Fuentes de este análisis: {refsOriginal.map((f, i) => (
                <span key={f.n}><EnlaceVerificado url={f.url} className="font-semibold">[{f.n}] {f.rotulo}</EnlaceVerificado>{i < refsOriginal.length - 1 ? " · " : ""}</span>
              ))}</p>
            )}

            {/* Comparador jurídico */}
            {resultado.comparador && resultado.comparador.length > 0 && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">Comparador jurídico</h4>
                {resultado.comparador.map((d, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-800 text-white text-[11px] font-extrabold px-4 py-2">{d.dimension}</div>
                    <div className="divide-y divide-slate-100 text-[12px] leading-relaxed">
                      <div className="px-4 py-2.5 bg-blue-50/50"><span className="font-extrabold text-blue-900">🇨🇱 Proyecto (Boletín {cruce.boletin}): </span><ConRefs texto={d.chile} fuentes={fuentes} /></div>
                      {d.paises.map((p, j) => (
                        <div key={j} className="px-4 py-2.5">
                          <span className="font-extrabold text-slate-900">{p.pais} </span>
                          <ConRefs texto={`[${p.n}]`} fuentes={fuentes} />
                          <span>: {p.texto}</span>
                        </div>
                      ))}
                      {d.lectura && <div className="px-4 py-2.5 bg-amber-50 text-amber-950 font-medium"><span className="font-extrabold">Lectura: </span>{d.lectura}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Función y jurisdicción por país */}
            {resultado.porPais && resultado.porPais.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">Función y jurisdicción por país</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-[12px] leading-relaxed">
                    <thead className="bg-slate-100 text-slate-700 text-left">
                      <tr><th className="p-2.5">País / norma</th><th className="p-2.5">Función jurídica</th><th className="p-2.5">Jurisdicción y órgano competente</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 align-top">
                      {resultado.porPais.map((p, i) => {
                        const f = fuentes.find(x => x.n === p.n);
                        return (
                          <tr key={i}>
                            <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">
                              {p.pais}<br />
                              {f?.url ? <EnlaceVerificado url={f.url} className="font-semibold text-[11px]">[{p.n}] ver norma</EnlaceVerificado> : <span className="text-slate-400">[{p.n}]</span>}
                            </td>
                            <td className="p-2.5 text-slate-800">{p.funcion}</td>
                            <td className="p-2.5 text-slate-800">{p.jurisdiccion}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {resultado?.fuentesDescartadas && resultado.fuentesDescartadas.length > 0 && (
          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Se excluyeron del análisis {resultado.fuentesDescartadas.length} fuente(s) cuyo enlace no pudo comprobarse al visitarlo
            ({resultado.fuentesDescartadas.map(n => `[${n}]`).join(", ")}), para no basar el cruce en normas no verificadas.
          </p>
        )}

        {/* Fuentes: todas con hipervínculo verificado */}
        {fuentes.length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Fuentes (enlaces verificados)</h4>
            <ol className="mt-2 space-y-1 text-[12px]">
              {fuentes.map(f => (
                <li key={f.n} className="flex flex-wrap gap-x-2">
                  <span className="font-mono text-slate-400">[{f.n}]</span>
                  <span className="font-semibold text-slate-700">{f.rotulo}:</span>
                  {f.url
                    ? <EnlaceVerificado url={f.url}>{f.titulo}</EnlaceVerificado>
                    : <span className="text-slate-500">{f.titulo} <em className="text-slate-400">(sin enlace en la fuente)</em></span>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
