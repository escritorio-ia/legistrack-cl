import React from "react";
import { type InformeSesion, type CategoriaInterviniente, CATEGORIAS, formatoMinutoInforme, intervinientes, presentacion } from "../utils/informeSesion";

/**
 * Informe de sesión en formato de documento (estilo informe de comisión): ficha, síntesis, acuerdos y votaciones,
 * desarrollo por punto de la tabla en relato, expositores clasificados (ESP/ESC/EEA) y compromisos.
 */
export default function InformeSesionHoja({ informe, comision, fecha, videoId, duracion, tramos, onMinuto }: {
  informe: InformeSesion; comision: string; fecha: string; videoId?: string; duracion?: number | null;
  tramos?: { hechos: number; total: number | null }; onMinuto?: (s: number) => void;
}) {
  const ints = intervinientes(informe);
  const cuenta = (c: CategoriaInterviniente) => ints.filter((i) => i.categoria === c).length;
  const boletines = Array.from(new Set(informe.puntos.flatMap((p) => p.boletines)));
  const votos = informe.puntos.flatMap((p) => [
    ...p.votaciones.map((v) => ({ p, texto: v.texto, resultado: v.resultado, s: v.segundos })),
    ...p.acuerdos.map((a) => ({ p, texto: a.texto, resultado: "Acordado", s: a.segundos })),
  ]).sort((a, b) => a.s - b.s);
  const Min = ({ s }: { s: number }) => (
    <button type="button" onClick={() => onMinuto?.(s)} className="font-mono text-[11px] font-semibold text-[#a4243b] hover:underline cursor-pointer whitespace-nowrap" title="Ver en el video">{formatoMinutoInforme(s)}</button>
  );
  const Chip = ({ b }: { b: string }) => <span className="inline-block font-mono text-[11px] font-bold text-[#0b3a6e] bg-[#e8f0fb] border border-[#c7d8f0] rounded px-1.5">{b}</span>;
  const H2 = ({ n, t }: { n: string; t: string }) => <h2 className="font-serif text-[15px] font-bold text-[#0b3a6e] mt-7 mb-2.5 pb-1 border-b border-slate-200"><span className="font-sans text-xs text-slate-500 mr-1.5">{n}</span>{t}</h2>;
  const colorRes = (r: string) => /aprob|acord/i.test(r) ? "text-emerald-700" : /rechaz/i.test(r) ? "text-red-700" : "text-slate-700";

  return (
    <article className="bg-white text-[#1d2733] rounded-lg border border-slate-200 shadow-sm px-6 sm:px-9 py-7 text-[13.5px] leading-relaxed" id="informe-hoja">
      <header className="flex flex-wrap justify-between items-start gap-3 border-b-[3px] border-[#0b3a6e] pb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Informe de sesión de comisión</p>
          <h1 className="font-serif text-xl font-bold text-[#0b3a6e] leading-tight mt-0.5">{comision || "Comisión no informada"}</h1>
          <p className="text-[13px] text-slate-500">{fecha || "Fecha no informada"}</p>
        </div>
        <span className="text-[11px] font-bold text-[#0b3a6e] border-[1.5px] border-[#0b3a6e] rounded px-2 py-1 whitespace-nowrap">Basado en transcripción</span>
      </header>

      <H2 n="I." t="Ficha de la sesión" />
      <table className="w-full text-[13px]"><tbody>
        <tr className="border-b border-slate-100"><td className="py-1.5 pr-3 w-40 text-slate-500 font-semibold align-top">Boletines tratados</td><td className="py-1.5 flex flex-wrap gap-1">{boletines.length ? boletines.map((b) => <Chip key={b} b={b} />) : "No informado"}</td></tr>
        <tr className="border-b border-slate-100"><td className="py-1.5 pr-3 text-slate-500 font-semibold">Video</td><td className="py-1.5">{duracion ? `${formatoMinutoInforme(duracion)} · ` : ""}{tramos ? `transcripción ${tramos.total && tramos.hechos >= tramos.total ? "completa" : "parcial"} (${tramos.hechos} de ${tramos.total ?? "?"} tramos)` : ""}</td></tr>
        <tr className="border-b border-slate-100"><td className="py-1.5 pr-3 text-slate-500 font-semibold align-top">Intervinieron</td><td className="py-1.5">{cuenta("PARL")} parlamentarios · {cuenta("ESP")} ESP · {cuenta("ESC")} ESC · {cuenta("EEA")} EEA{cuenta("ND") ? ` · ${cuenta("ND")} sin clasificar` : ""}</td></tr>
        <tr><td className="py-1.5 pr-3 text-slate-500 font-semibold">Fuente</td><td className="py-1.5">{videoId ? <a className="text-[#0b3a6e] underline" href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Video oficial de la sesión</a> : "Video oficial"} · tabla oficial de la citación</td></tr>
      </tbody></table>

      <H2 n="II." t="Síntesis" />
      {informe.resumen && <p className="mb-2">{informe.resumen}</p>}
      {informe.sintesis.length > 0 && <ul className="list-disc pl-5 space-y-1">{informe.sintesis.map((s, i) => <li key={i}>{s}</li>)}</ul>}
      {!informe.resumen && informe.sintesis.length === 0 && <p className="text-slate-500">No informado.</p>}

      <H2 n="III." t="Acuerdos y votaciones" />
      {votos.length === 0 ? <p className="text-slate-500">No se registran acuerdos ni votaciones en la transcripción.</p> : (
        <table className="w-full text-[13px]">
          <thead><tr className="bg-[#f3f6fa] text-slate-500 text-[11px] uppercase tracking-wide"><th className="text-left p-2">Punto</th><th className="text-left p-2">Acuerdo o votación</th><th className="text-left p-2">Resultado</th><th className="text-left p-2">Min.</th></tr></thead>
          <tbody>{votos.map((v, i) => (
            <tr key={i} className="border-b border-slate-100 align-top"><td className="p-2 whitespace-nowrap">{v.p.numero || "s/n"} {v.p.boletines.map((b) => <Chip key={b} b={b} />)}</td><td className="p-2">{v.texto}</td><td className={`p-2 font-bold ${colorRes(v.resultado)}`}>{v.resultado}</td><td className="p-2"><Min s={v.s} /></td></tr>
          ))}</tbody>
        </table>
      )}

      <H2 n="IV." t="Desarrollo por punto de la tabla" />
      {informe.puntos.length === 0 && <p className="text-slate-500">No informado.</p>}
      {informe.puntos.map((p, k) => {
        const eventos = [
          ...p.intervenciones.map((i) => ({ s: i.segundos, tipo: "i" as const, i })),
          ...p.votaciones.map((v) => ({ s: v.segundos, tipo: "v" as const, v })),
        ].sort((a, b) => a.s - b.s);
        return (
          <section key={k} className="mb-6">
            <h3 className="text-center font-bold text-[#0b3a6e] underline underline-offset-4 decoration-1 mb-1">
              {p.numero ? `PUNTO ${p.numero}` : "FUERA DE TABLA"}{p.boletines.length ? ` · BOLETÍN N° ${p.boletines.join(", ")}` : ""}
            </h3>
            <p className="text-center text-[13px] font-semibold mb-1">{p.titulo}</p>
            {p.estado && <p className="text-center text-[11px] text-slate-500 mb-3">Estado: {p.estado}</p>}
            {p.sintesis && <p className="indent-10 text-justify mb-3 italic text-slate-700">{p.sintesis}</p>}
            {eventos.map((e, j) => e.tipo === "i" ? (
              <div key={j} className="mb-3">
                {e.i.parrafos.map((par, n) => (
                  <p key={n} className="indent-10 text-justify mb-2">
                    {n === 0 && <b>{presentacion(e.i)} </b>}
                    {par}
                    {n === e.i.parrafos.length - 1 && <> <Min s={e.i.segundos} /></>}
                  </p>
                ))}
              </div>
            ) : (
              <p key={j} className="indent-10 text-justify font-bold mb-3">- {e.v.texto}{e.v.resultado ? `: ${e.v.resultado}` : ""}. <Min s={e.v.segundos} /></p>
            ))}
            <p className="text-center text-slate-400">- - -</p>
          </section>
        );
      })}

      <H2 n="V." t="Expositores" />
      {(["ESP", "ESC", "EEA", "ND"] as CategoriaInterviniente[]).every((c) => cuenta(c) === 0) ? <p className="text-slate-500">No intervinieron expositores externos (solo parlamentarios o secretaría).</p> : (
        <div className="space-y-3">
          {(["ESP", "ESC", "EEA", "ND"] as CategoriaInterviniente[]).filter((c) => cuenta(c) > 0).map((c) => (
            <div key={c}>
              <p className="text-[12px] font-bold text-[#0b3a6e]">{CATEGORIAS[c].largo} ({c}) · {cuenta(c)}</p>
              <ul className="list-disc pl-5">
                {ints.filter((i) => i.categoria === c).map((i) => <li key={i.orador}>{i.orador}{i.cargo ? `, ${i.cargo}` : ""}{i.institucion ? `, ${i.institucion}` : ""} <Min s={i.primera} /></li>)}
              </ul>
            </div>
          ))}
          <p className="text-[11px] text-slate-500">ESP: cargo en representación del Estado o misión diplomática (no parlamentarios). ESC: organizaciones de la sociedad civil (ONG, partido, fundación, gremio, sindicato, empresa). EEA: expertos y académicos, incluida la BCN.</p>
        </div>
      )}

      {(informe.compromisos.length > 0 || informe.pendientes.length > 0) && <H2 n="VI." t="Compromisos y próximos pasos" />}
      {informe.compromisos.length > 0 && (
        <table className="w-full text-[13px] mb-3">
          <thead><tr className="bg-[#f3f6fa] text-slate-500 text-[11px] uppercase tracking-wide"><th className="text-left p-2">Compromiso</th><th className="text-left p-2">Responsable</th><th className="text-left p-2">Min.</th></tr></thead>
          <tbody>{informe.compromisos.map((c, i) => <tr key={i} className="border-b border-slate-100 align-top"><td className="p-2">{c.texto}</td><td className="p-2">{c.responsable}</td><td className="p-2"><Min s={c.segundos} /></td></tr>)}</tbody>
        </table>
      )}
      {informe.pendientes.length > 0 && <><p className="font-semibold text-[13px]">Temas pendientes</p><ul className="list-disc pl-5">{informe.pendientes.map((t, i) => <li key={i}>{t}</li>)}</ul></>}

      <footer className="mt-7 pt-2.5 border-t border-slate-200 text-[11px] text-slate-500">
        Informe generado con IA solo a partir de la transcripción automática del video oficial{informe.parcial ? " (transcripción incompleta)" : ""}. No es un acta ni un documento oficial. Cada minuto lleva al video para verificar.
        {informe.descartados > 0 ? ` Se descartaron ${informe.descartados} elemento(s) que no se pudieron ubicar en la transcripción.` : ""}
      </footer>
    </article>
  );
}
