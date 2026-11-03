/**
 * Protección de contenido para Derecho Comparado.
 *
 * Bloquea: selección de texto, copiar/cortar, menú contextual, arrastrar, atajos de teclado
 * (Ctrl/Cmd + C, X, A, P, S, U) y la tecla Impr Pant (que además vacía el portapapeles).
 * Oculta (desenfoca) el contenido cuando la ventana pierde el foco o la pestaña pasa a segundo
 * plano, que es lo que ocurre al abrir una herramienta de recortes del sistema.
 *
 * Límite técnico: ningún sitio web puede impedir por completo una captura de pantalla hecha
 * con el sistema operativo o con otro dispositivo (por ejemplo, una foto con el celular);
 * estas medidas la dificultan y la desincentivan, no la hacen imposible.
 *
 * Los campos de texto (buscadores, formularios) siguen siendo editables.
 */
import React, { useEffect, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";

function esCampoEditable(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable === true;
}

export default function ContenidoProtegido({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const [oculto, setOculto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const avisoTimer = useRef<number | null>(null);
  const ocultoPorCaptura = useRef(false);

  const avisar = (msg: string) => {
    setAviso(msg);
    if (avisoTimer.current) window.clearTimeout(avisoTimer.current);
    avisoTimer.current = window.setTimeout(() => setAviso(null), 3500);
  };

  useEffect(() => {
    const onBlur = () => setOculto(true);
    const onFocus = () => { if (!ocultoPorCaptura.current) setOculto(false); };
    const onVis = () => setOculto(document.visibilityState !== "visible");

    const onKeyDown = (e: KeyboardEvent) => {
      if (esCampoEditable(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && ["c", "x", "a", "p", "s", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        avisar("Este contenido está protegido: no se puede copiar, imprimir ni guardar desde esta vista.");
      }
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) {
        setOculto(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        try { navigator.clipboard?.writeText(""); } catch { /* sin permiso */ }
        ocultoPorCaptura.current = true;
        setOculto(true);
        avisar("Las capturas de pantalla no están permitidas en Derecho Comparado.");
        window.setTimeout(() => { ocultoPorCaptura.current = false; if (document.hasFocus()) setOculto(false); }, 3000);
      }
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      if (avisoTimer.current) window.clearTimeout(avisoTimer.current);
    };
  }, []);

  const bloquear = (e: React.SyntheticEvent) => {
    if (esCampoEditable(e.target)) return;
    e.preventDefault();
    avisar("Este contenido está protegido: no se puede copiar.");
  };

  return (
    <div
      id={id}
      className={`relative ${className}`}
      onCopy={bloquear}
      onCut={bloquear}
      onContextMenu={bloquear}
      onDragStart={bloquear}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        filter: oculto ? "blur(18px)" : undefined,
        transition: "filter 120ms",
      } as React.CSSProperties}
    >
      {/* Los campos editables conservan la selección */}
      <style>{`#${id || "contenido-protegido"} input, #${id || "contenido-protegido"} textarea { user-select: text; -webkit-user-select: text; } @media print { .no-imprimir-protegido { display:none !important; } }`}</style>
      {children}
      {aviso && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2" style={{ filter: "none" }}>
          <ShieldAlert className="w-4 h-4 text-amber-400" /> {aviso}
        </div>
      )}
    </div>
  );
}
