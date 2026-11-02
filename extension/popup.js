function pintar(id, v) {
  const el = document.getElementById(id);
  if (!v) { el.textContent = "Sin envíos todavía."; return; }
  el.className = v.ok ? "ok" : "err";
  el.textContent = `${v.ok ? "✓" : "✗"} ${v.detalle} · ${new Date(v.fecha).toLocaleString("es-CL")}`;
}
async function refrescar() {
  const d = await chrome.storage.local.get(["senado", "camara", "sesiones"]);
  pintar("senado", d.senado); pintar("camara", d.camara); pintar("sesiones", d.sesiones);
}
document.getElementById("sync").onclick = async () => {
  document.getElementById("senado").textContent = "Sincronizando…";
  await chrome.runtime.sendMessage({ tipo: "senado-ahora" });
  refrescar();
};
document.getElementById("opc").onclick = (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); };
refrescar();

document.getElementById("syncSes").onclick = async () => {
  document.getElementById("sesiones").textContent = "Sincronizando (1-2 minutos)…";
  await chrome.runtime.sendMessage({ tipo: "sesiones-ahora" });
  refrescar();
};
