import React, { useEffect, useState } from "react";
import { Lock, LogOut, Loader2 } from "lucide-react";

/**
 * Puerta de ingreso: la aplicación solo se muestra con sesión iniciada (cookie del servidor).
 * Si cualquier llamada a la API responde 401 (sesión vencida), se vuelve a esta pantalla.
 */
export default function Ingreso({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<"cargando" | "fuera" | "dentro">("cargando");
  const [aviso, setAviso] = useState("");
  const [usuario, setUsuario] = useState("admin");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Detecta sesiones vencidas en cualquier llamada a /api.
    const original = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const r = await original(input, init);
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (r.status === 401 && /\/api\//.test(url) && !/\/api\/auth\//.test(url)) setEstado("fuera");
      return r;
    };
    original("/api/auth/estado", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.configurado) setAviso(`El ingreso no está configurado en el servidor (falta ${(d?.falta || []).join(", ")} en Vercel).`);
        setEstado(d?.autenticado ? "dentro" : "fuera");
      })
      .catch(() => { setAviso("No se pudo contactar al servidor."); setEstado("fuera"); });
    return () => { window.fetch = original; };
  }, []);

  const ingresar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true); setError("");
    try {
      const r = await fetch("/api/auth/ingresar", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ usuario, clave }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) { setClave(""); setEstado("dentro"); }
      else setError(d.error || "No se pudo ingresar.");
    } catch { setError("No se pudo contactar al servidor."); }
    finally { setEnviando(false); }
  };
  const salir = async () => { await fetch("/api/auth/salir", { method: "POST", credentials: "same-origin" }).catch(() => {}); setEstado("fuera"); };

  if (estado === "cargando") return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  if (estado === "fuera") return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form onSubmit={ingresar} className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Lock className="w-5 h-5" /></div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Legislación++</h1>
            <p className="text-xs text-slate-500">Acceso restringido · BCN</p>
          </div>
        </div>
        {aviso && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">{aviso}</p>}
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1">Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal outline-none focus:border-blue-500" />
        </label>
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1">Contraseña
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" autoFocus className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal outline-none focus:border-blue-500" />
        </label>
        {error && <p className="text-xs text-red-700">{error}</p>}
        <button type="submit" disabled={enviando || !clave} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg py-2.5 cursor-pointer flex items-center justify-center gap-2">
          {enviando && <Loader2 className="w-4 h-4 animate-spin" />} Ingresar
        </button>
      </form>
    </div>
  );

  return (
    <>
      {children}
      <button onClick={salir} title="Cerrar sesión" className="fixed bottom-3 left-3 z-40 bg-white/90 border border-slate-200 shadow-sm rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer">
        <LogOut className="w-3.5 h-3.5" /> Salir
      </button>
    </>
  );
}
