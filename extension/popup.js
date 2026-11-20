function pintar(id, v) {
  const el = document.getElementById(id);
  if (!v) { el.textContent = "Sin envíos todavía."; return; }
  el.className = v.ok ? "ok" : "err";
  el.textContent = `${v.ok ? "✓" : "✗"} ${v.detalle} · ${new Date(v.fecha).toLocaleString("es-CL")}`;
}
async function refrescar() {
  const d = await chrome.storage.local.get(["senado", "camara", "sesiones", "resultados", "sala", "actas"]);
  pintar("senado", d.senado); pintar("camara", d.camara); pintar("sesiones", d.sesiones); pintar("resultados", d.resultados); pintar("sala", d.sala); pintar("actas", d.actas);
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

// Transcripción automática
const ACCIONES = { transcribir: "Transcribió", informe: "Redactó informe", sin_video: "Sin video", ya_transcrita: "Ya estaba transcrita", nada: "No queda nada", tope: "Tope diario alcanzado", ocupado: "Paso en curso", error: "Error" };
function pintarTranscripcion(t) {
  const el = document.getElementById("trEstado");
  if (!t) { el.textContent = "Sin consultar todavía."; return; }
  if (!t.ok) { el.className = "err"; el.textContent = `✗ ${t.error}`; return; }
  el.className = t.activa ? "ok" : "gris";
  const u = t.ultimoPaso;
  el.textContent = `${!t.servidor ? "Desactivada en el servidor" : t.activa ? "● En marcha" : "Detenida"} · hoy ${t.tramosHoy} de ${t.maxTramosDia} tramos`
    + (u ? ` · último: ${ACCIONES[u.accion] || u.accion}${u.sesion ? " (" + u.sesion + ")" : ""}` : "");
  document.getElementById("trIniciar").style.display = t.activa ? "none" : "";
  document.getElementById("trDetener").style.display = t.activa ? "" : "none";
}
async function transcripcionPopup(accion) {
  document.getElementById("trEstado").textContent = "Consultando…";
  pintarTranscripcion(await chrome.runtime.sendMessage({ tipo: "transcripcion", accion }));
}
document.getElementById("trIniciar").onclick = () => transcripcionPopup("iniciar");
document.getElementById("trDetener").onclick = () => transcripcionPopup("detener");
transcripcionPopup("estado");
