import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Building2, FileText, Tag, X, ArrowRight } from "lucide-react";
import { performUnifiedSearch } from "../utils/searchEngine";
import { esPatronBoletin } from "../utils/proyectosResolver";

interface LegisSearchBarProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  onSearchSubmit?: () => void;
  setSelectedProyectoId?: (id: string) => void;
  setSelectedComisionId?: (id: string) => void;
  /** "oscuro" para la barra de navegación; "claro" para usarlo grande dentro de una página. */
  variant?: "oscuro" | "claro";
}

type Sugerencia =
  | { tipo: "boletin"; id: string; label: string }
  | { tipo: "comision"; id: string; label: string; detalle: string }
  | { tipo: "proyecto"; id: string; label: string; detalle: string }
  | { tipo: "tema"; label: string };

/**
 * Buscador de Legislación++: comisiones, número de boletín o tema.
 * Las sugerencias salen solo de datos reales indexados localmente; un boletín
 * escrito a mano abre su ficha, que se completa en vivo desde el Senado.
 */
export default function LegisSearchBar({
  searchFilter,
  setSearchFilter,
  onSearchSubmit,
  setSelectedProyectoId,
  setSelectedComisionId,
  variant = "oscuro"
}: LegisSearchBarProps) {
  const claro = variant === "claro";
  const [q, setQ] = useState(searchFilter || "");
  const [debounced, setDebounced] = useState(q);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const sugerencias: Sugerencia[] = useMemo(() => {
    const term = debounced.trim();
    if (term.length < 2) return [];
    const out: Sugerencia[] = [];

    if (esPatronBoletin(term)) {
      out.push({ tipo: "boletin", id: term, label: `Abrir Boletín N° ${term}` });
    }

    let res;
    try {
      res = performUnifiedSearch(term);
    } catch {
      res = null;
    }
    if (res) {
      for (const c of res.comisiones.slice(0, 5)) {
        out.push({
          tipo: "comision",
          id: `${(c as any).prefix || ""}${c.id}`,
          label: c.nombre,
          detalle: (c as any).chamber === "SR" ? "Senado" : "Cámara de Diputadas y Diputados"
        });
      }
      for (const p of res.proyectos.slice(0, 5)) {
        out.push({
          tipo: "proyecto",
          id: p.id,
          label: p.titulo,
          detalle: `Boletín ${p.id}${p.estado ? ` · ${p.estado}` : ""}`
        });
      }
    }

    out.push({ tipo: "tema", label: term });
    return out;
  }, [debounced]);

  useEffect(() => setActiveIdx(0), [sugerencias]);

  const elegir = (s: Sugerencia) => {
    setOpen(false);
    if (s.tipo === "boletin" || s.tipo === "proyecto") {
      setSelectedProyectoId?.(s.id);
    } else if (s.tipo === "comision") {
      setSelectedComisionId?.(s.id);
    } else {
      setSearchFilter(s.label);
      onSearchSubmit?.();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, sugerencias.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const term = q.trim();
      if (!term) return;
      // Enter sin navegar por la lista: boletín abre su ficha; lo demás busca como tema.
      if (open && sugerencias[activeIdx] && debounced.trim() === term) {
        elegir(sugerencias[activeIdx]);
      } else if (esPatronBoletin(term)) {
        elegir({ tipo: "boletin", id: term, label: term });
      } else {
        elegir({ tipo: "tema", label: term });
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const icono = (s: Sugerencia) => {
    if (s.tipo === "comision") return <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (s.tipo === "tema") return <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    return <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
  };

  return (
    <div ref={boxRef} className={claro ? "relative w-full" : "relative w-full sm:w-80 lg:w-96"}>
      <div className="relative">
        <Search className={`${claro ? "w-5 h-5 left-4" : "w-3.5 h-3.5 left-3"} text-slate-400 absolute top-1/2 -translate-y-1/2`} />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar comisión, boletín o tema…"
          aria-label="Buscar comisión, boletín o tema"
          className={claro
            ? "w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-12 pr-10 py-3.5 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none shadow-xs"
            : "w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 outline-none"}
        />
        {q && (
          <button
            onClick={() => { setQ(""); setOpen(false); }}
            className={`absolute ${claro ? "right-3 hover:text-slate-700" : "right-2 hover:text-white"} top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer`}
            aria-label="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && sugerencias.length > 0 && (
        <ul className={`absolute ${claro ? "left-0 w-full" : "right-0 w-full sm:w-[28rem]"} mt-1.5 max-h-96 overflow-y-auto bg-white text-slate-800 border border-slate-200 rounded-xl shadow-xl z-[60] py-1`}>
          {sugerencias.map((s, idx) => (
            <li key={`${s.tipo}-${idx}`}>
              <button
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => elegir(s)}
                className={`w-full text-left px-3 py-2 flex items-start gap-2.5 cursor-pointer ${idx === activeIdx ? "bg-blue-50" : "hover:bg-slate-50"}`}
              >
                <span className="mt-0.5">{icono(s)}</span>
                <span className="min-w-0 flex-1">
                  {s.tipo === "tema" ? (
                    <span className="text-xs font-bold">Buscar «{s.label}» como tema</span>
                  ) : (
                    <span className="text-xs font-bold line-clamp-2">{s.label}</span>
                  )}
                  {"detalle" in s && (
                    <span className="block text-[10px] text-slate-500 truncate">{s.detalle}</span>
                  )}
                </span>
                {s.tipo === "tema" && <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-0.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
