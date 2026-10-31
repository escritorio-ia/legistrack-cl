const estado = document.getElementById("ok");
function mostrar(texto, color) { estado.textContent = texto; estado.style.color = color || "#047857"; }

if (typeof chrome === "undefined" || !chrome.storage) {
  mostrar("Esta página debe abrirse desde la extensión (ícono de la extensión → Opciones), no como archivo.", "#b91c1c");
} else {
  chrome.storage.sync.get({ token: "", app: "https://legistrack-cl.vercel.app" }, c => {
    document.getElementById("token").value = c.token;
    document.getElementById("app").value = c.app;
    if (c.token) mostrar("Clave guardada anteriormente.", "#64748b");
  });

  document.getElementById("guardar").onclick = async () => {
    const token = document.getElementById("token").value.trim();
    const app = document.getElementById("app").value.trim() || "https://legistrack-cl.vercel.app";
    if (!token) { mostrar("Falta la clave de importación.", "#b91c1c"); return; }
    try {
      await chrome.storage.sync.set({ token, app });
      mostrar("Guardado. Sincronizando el Senado…", "#0f172a");
      const r = await chrome.runtime.sendMessage({ tipo: "senado-ahora" });
      if (r?.ok) mostrar(`Guardado. Senado sincronizado: ${r.citaciones} citaciones (${r.dias} días).`);
      else mostrar(`Guardado, pero el Senado falló: ${r?.error || "sin respuesta del servicio de la extensión"}.`, "#b45309");
    } catch (e) {
      mostrar(`Error: ${e.message}`, "#b91c1c");
    }
  };
}
