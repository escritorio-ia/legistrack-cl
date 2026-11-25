import React, { useEffect, useState } from "react";
import { Loader2, Link2, Scale, Tags, ExternalLink } from "lucide-react";

type Rel = { boletin: string; titulo: string; fecha: string; tipo: string; motivo: string; puntaje: number };
type Datos = { disponible: boolean; motivo?: string; titulo?: string; normas?: string[]; mismaNorma: Rel[]; totalMismaNorma?: number; materiaSimilar: Rel[]; total?: number; desde?: number; faltan?: number[] };

const fecha = (iso: string) => iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" }) : "No informada";

/** Proyectos relacionados: misma ley o código que modifica y materia similar (listado oficial de la Cámara, sin IA). */
export default function ProyectosRelacionados({ boletin, titulo, onAbrir }: { boletin: string; titulo: string; onAbrir: (boletin: string) => void }) {
  const [d, setD] = useState<Datos | null>(null);
  useEffect(() => {
    let cancelado = false;
    setD(null);
    fetch(`/api/proyecto/${encodeURIComponent(boletin)}/relacionados?titulo=${encodeURIComponent(titulo || "")}`)
      .then((r) => r.json()).then((x) => { if (!cancelado) setD(x); })
      .catch(() => { if (!cancelado) setD({ disponible: false, motivo: "No fue posible consultar el listado oficial en este momento.", mismaNorma: [], materiaSimilar: [] }); });
    return () => { cancelado = true; };
  }, [boletin]);

  if (!d) return <p className="text-xs text-slate-500 flex items-center gap-2 py-6 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Buscando proyectos relacionados en el listado oficial de la Cámara (puede tardar la primera vez)…</p>;
  if (!d.disponible) return <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">Búsqueda no disponible: {d.motivo}</p>;

  const Lista = ({ items }: { items: Rel[] }) => (
    <ul className="flex flex-col gap-2">
      {items.map((r) => (
        <li key={r.boletin} className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 transition-colors">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <button onClick={() => onAbrir(r.boletin)} className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 hover:underline cursor-pointer">{r.boletin}</button>
            <span>{r.tipo || "Tipo no informado"} · ingreso {fecha(r.fecha)}</span>
            <a href={`https://www.camara.cl/legislacion/ProyectosDeLey/tramitacion.aspx?prmBOLETIN=${encodeURIComponent(r.boletin)}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-slate-400 hover:text-blue-700 flex items-center gap-0.5">ficha oficial <ExternalLink className="w-3 h-3" /></a>
          </div>
          <button onClick={() => onAbrir(r.boletin)} className="text-left text-xs font-semibold text-slate-900 mt-1 hover:text-blue-800 cursor-pointer">{r.titulo}</button>
          <p className="text-[10.5px] text-slate-500 mt-0.5">{r.motivo}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] text-slate-600 flex gap-2">
        <Link2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          Búsqueda en el listado oficial de mociones y mensajes de la Cámara ({(d.total || 0).toLocaleString("es-CL")} proyectos desde {d.desde}), comparando títulos oficiales; sin IA.
          {d.faltan && d.faltan.length > 0 && <> No se pudo leer el listado de: {d.faltan.join(", ")}.</>}
        </span>
      </div>

      <section>
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-2"><Scale className="w-4 h-4 text-indigo-600" /> Modifican la misma norma{d.normas?.length ? `: ${d.normas.join(", ")}` : ""}</h3>
        {!d.normas?.length ? <p className="text-xs text-slate-500">El título oficial no indica una ley o código que modifique.</p>
          : d.mismaNorma.length === 0 ? <p className="text-xs text-slate-500">No se encontraron otros proyectos que modifiquen esa norma.</p>
          : <>
              <Lista items={d.mismaNorma} />
              {(d.totalMismaNorma || 0) > d.mismaNorma.length && <p className="text-[10.5px] text-slate-500 mt-1">Se muestran los {d.mismaNorma.length} más parecidos de {d.totalMismaNorma}.</p>}
            </>}
      </section>

      <section>
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-2"><Tags className="w-4 h-4 text-emerald-600" /> Materia similar</h3>
        {d.materiaSimilar.length === 0 ? <p className="text-xs text-slate-500">No se encontraron otros proyectos con un título de materia parecida.</p> : <Lista items={d.materiaSimilar} />}
      </section>
    </div>
  );
}
