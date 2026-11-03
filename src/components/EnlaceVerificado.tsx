/**
 * Hipervínculo con verificación real: el servidor visita cada URL y devuelve su estado.
 *  ✓ verificado   — el sitio respondió (2xx/3xx)
 *  ⚠ no verificable — el sitio exige verificación humana (401/403/429): el enlace puede ser válido
 *  ✗ roto          — no respondió o dio error (404/5xx): se muestra tachado y sin enlace
 */
import React, { useEffect, useState } from "react";
import { ExternalLink, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

export interface EstadoEnlace {
  url: string;
  estado: "ok" | "roto" | "bloqueado";
  codigo?: number;
  urlFinal?: string;
  verificadoEl: string;
}

const memoria = new Map<string, EstadoEnlace>();
const pendientes = new Set<string>();
const suscriptores = new Set<() => void>();
let timer: number | null = null;

async function volcar() {
  timer = null;
  const lote = Array.from(pendientes).slice(0, 60);
  lote.forEach(u => pendientes.delete(u));
  if (lote.length === 0) return;
  try {
    const r = await fetch("/api/derecho-comparado/validar-enlaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: lote }),
    });
    const j: { enlaces?: EstadoEnlace[] } = await r.json();
    (j.enlaces || []).forEach(e => e && memoria.set(e.url, e));
  } catch {
    // Sin respuesta del servidor: no se marca ninguno como verificado.
  }
  suscriptores.forEach(f => f());
  if (pendientes.size > 0) timer = window.setTimeout(volcar, 50);
}

export function pedirVerificacion(urls: (string | undefined)[]) {
  let nuevo = false;
  urls.forEach(u => {
    if (u && /^https?:\/\//i.test(u) && !memoria.has(u)) { pendientes.add(u); nuevo = true; }
  });
  if (nuevo && timer === null) timer = window.setTimeout(volcar, 150);
}

export function useEstadoEnlace(url?: string): EstadoEnlace | "pendiente" | null {
  const [, forzar] = useState(0);
  useEffect(() => {
    if (!url) return;
    const f = () => forzar(n => n + 1);
    suscriptores.add(f);
    pedirVerificacion([url]);
    return () => { suscriptores.delete(f); };
  }, [url]);
  if (!url) return null;
  return memoria.get(url) || "pendiente";
}

export default function EnlaceVerificado({ url, children, className = "" }: { url?: string; children: React.ReactNode; className?: string }) {
  const est = useEstadoEnlace(url);
  if (!url) return <span className={className}>{children}</span>;

  if (est === "pendiente" || est === null) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`} title="Verificando el enlace…">
        {children} <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
      </span>
    );
  }
  if (est.estado === "roto") {
    return (
      <span className={`inline-flex items-center gap-1 line-through text-slate-400 ${className}`} title={`Enlace roto${est.codigo ? ` (HTTP ${est.codigo})` : ""} — verificado ${new Date(est.verificadoEl).toLocaleString("es-CL")}`}>
        {children} <XCircle className="w-3 h-3 text-red-500 shrink-0" />
      </span>
    );
  }
  const ok = est.estado === "ok";
  return (
    <a
      href={est.urlFinal || url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-700 hover:underline ${className}`}
      title={ok ? `Enlace verificado ${new Date(est.verificadoEl).toLocaleString("es-CL")} (HTTP ${est.codigo})` : "El sitio no permite verificación automática (exige verificación humana); el enlace puede ser válido"}
    >
      {children}
      {ok ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />}
      <ExternalLink className="w-3 h-3 shrink-0" />
    </a>
  );
}
