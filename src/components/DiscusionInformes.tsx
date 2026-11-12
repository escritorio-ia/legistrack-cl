import React, { useEffect, useState } from "react";

interface Seccion { titulo: string; inicio: number; largo: number; esDebate: boolean; extracto?: string }
interface Informe { titulo: string; fecha?: string; url: string; disponible: boolean; motivo?: string; totalCaracteres?: number; secciones: Seccion[] }
interface Discusion { disponible: boolean; motivo?: string; informes: Informe[]; fuente?: string }

const TRAMO = 6000;
const paginas = (caracteres: number) => Math.max(1, Math.round(caracteres / 2500));

/** Una sección de debate: muestra el primer tramo y permite seguir leyendo el texto oficial por tramos. */
function SeccionDebate({ url, s }: { url: string; s: Seccion }) {
  const [abierta, setAbierta] = useState(false);
  const [texto, setTexto] = useState(s.extracto || "");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restante = Math.max(0, s.largo - texto.length);

  const cargarMas = async () => {
    setCargando(true);
    setError(null);
    try {
      const desde = s.inicio + texto.length;
      const largo = Math.max(1000, Math.min(TRAMO, restante));
      const r = await fetch(`/api/documento/texto?desde=${desde}&largo=${largo}&url=${encodeURIComponent(url)}`).then((x) => x.json());
      if (!r?.disponible) throw new Error(r?.motivo || "sin respuesta");
      // El último tramo no debe pasar al contenido de la sección siguiente.
      setTexto((t) => t + String(r.texto || "").slice(0, restante));
    } catch (e: any) {
      setError(`No se pudo cargar el tramo siguiente (${e?.message || e}).`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      <button onClick={() => setAbierta((v) => !v)} className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left cursor-pointer hover:bg-slate-50 rounded-lg" aria-expanded={abierta}>
        <span className="text-xs font-extrabold text-slate-900">{abierta ? "▾" : "▸"} {s.titulo}</span>
        <span className="text-[10px] text-slate-500 font-mono shrink-0">≈ {paginas(s.largo)} pág.</span>
      </button>
      {abierta && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{texto || <span className="italic text-slate-400">Sección sin texto.</span>}{restante > 0 ? " …" : ""}</p>
          {error && <p className="text-[11px] text-rose-700">{error}</p>}
          {restante > 0 && (
            <div className="flex items-center gap-3">
              <button onClick={cargarMas} disabled={cargando} className="text-[11px] font-bold text-blue-700 hover:underline disabled:text-slate-400 cursor-pointer">
                {cargando ? "Cargando…" : "Seguir leyendo"}
              </button>
              <span className="text-[10px] text-slate-400">Leído {Math.round((texto.length / Math.max(1, s.largo)) * 100)} % de esta sección</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Discusión del proyecto tal como consta en sus informes de comisión oficiales (texto oficial, sin IA). */
export default function DiscusionInformes({ proyectoId }: { proyectoId: string }) {
  const [d, setD] = useState<Discusion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [pedido, setPedido] = useState(false);

  // Al cambiar de proyecto se parte de cero.
  useEffect(() => { setD(null); setPedido(false); setCargando(false); }, [proyectoId]);

  const cargar = async () => {
    setPedido(true);
    setCargando(true);
    try {
      setD(await fetch(`/api/proyecto/${encodeURIComponent(proyectoId)}/discusion`).then((x) => x.json()));
    } catch {
      setD({ disponible: false, motivo: "No se pudo consultar el servidor.", informes: [] });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 flex flex-col gap-3" id="discusion-informes">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Discusión según los informes de comisión</h3>
          <p className="text-xs text-slate-500">Texto oficial de las secciones de debate y votación de cada informe. No es una transcripción de la sesión ni un resumen hecho por IA.</p>
        </div>
        {!pedido && (
          <button onClick={cargar} className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shrink-0">Leer los informes</button>
        )}
      </div>

      {cargando && <p className="text-xs text-slate-600">Leyendo los informes oficiales… (pueden ser documentos de cientos de páginas; tarda hasta medio minuto)</p>}

      {d && !cargando && d.informes.length === 0 && (
        <p className="text-xs text-amber-800">No disponible: {d.motivo || "sin informes"}. <button onClick={cargar} className="font-bold underline cursor-pointer">Reintentar</button></p>
      )}

      {d && !cargando && d.informes.map((inf) => {
        const debate = inf.secciones.filter((s) => s.esDebate);
        const otras = inf.secciones.filter((s) => !s.esDebate);
        return (
          <div key={inf.url} className="bg-white/70 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-900">{inf.titulo}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {inf.fecha || "Fecha no informada"}{inf.totalCaracteres ? ` · ≈ ${paginas(inf.totalCaracteres)} pág.` : ""} ·{" "}
                <a href={inf.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">documento oficial</a>
              </span>
            </div>
            {!inf.disponible && <p className="text-[11px] text-amber-800">No disponible: {inf.motivo}</p>}
            {inf.disponible && debate.length === 0 && <p className="text-[11px] text-slate-500 italic">Este informe no tiene secciones tituladas de discusión o votación.</p>}
            {debate.map((s) => <SeccionDebate key={`${inf.url}-${s.inicio}`} url={inf.url} s={s} />)}
            {otras.length > 0 && (
              <p className="text-[10px] text-slate-400">Otras secciones del informe: {otras.map((s) => s.titulo).join(" · ")}</p>
            )}
          </div>
        );
      })}

      {d && !cargando && d.fuente && <p className="text-[10px] text-slate-400">Fuente: {d.fuente}. La extensión en páginas es aproximada.</p>}
    </div>
  );
}
