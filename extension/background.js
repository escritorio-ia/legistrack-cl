// Legislación++ · Citaciones — servicio en segundo plano.
// Senado: cada 3 horas consulta la API pública que usa senado.cl y la envía a la app.
// Cámara: recibe lo que el script de contenido lee cuando TÚ abres la página de citaciones.

const APP_DEFECTO = "https://legistrack-cl.vercel.app";
const SENADO_API = "https://web-back.senado.cl/api/commissions_citations?limit=100";

async function config() {
  const c = await chrome.storage.sync.get({ app: APP_DEFECTO, token: "" });
  return { app: (c.app || APP_DEFECTO).replace(/\/+$/, ""), token: c.token || "" };
}

async function registrar(clave, valor) {
  await chrome.storage.local.set({ [clave]: { ...valor, fecha: new Date().toISOString() } });
}

async function enviar(ruta, cuerpo) {
  const { app, token } = await config();
  if (!token) throw new Error("Falta la clave de importación (abre Opciones de la extensión).");
  const r = await fetch(`${app}${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ ...cuerpo, token })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.error || `La app respondió HTTP ${r.status}`);
  return j;
}

async function sincronizarSenado() {
  try {
    const r = await fetch(SENADO_API, { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(`web-back.senado.cl respondió HTTP ${r.status}`);
    const raw = await r.json();
    const j = await enviar("/api/senado/citaciones/importar", { raw });
    await registrar("senado", { ok: true, detalle: `${j.citaciones} citaciones (${j.dias} días)` });
    return { ok: true, ...j };
  } catch (e) {
    await registrar("senado", { ok: false, detalle: e.message });
    return { ok: false, error: e.message };
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("senado", { periodInMinutes: 180 });
  sincronizarSenado();
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("senado", { periodInMinutes: 180 });
  sincronizarSenado();
});
chrome.alarms.onAlarm.addListener(a => { if (a.name === "senado") sincronizarSenado(); });

chrome.runtime.onMessage.addListener((msg, _sender, responder) => {
  if (msg?.tipo === "camara") {
    enviar("/api/camara/citaciones/importar", { semana: msg.semana, html: msg.html })
      .then(async j => { await registrar("camara", { ok: true, detalle: `Semana ${j.semana}: ${j.citaciones} citaciones` }); responder({ ok: true, ...j }); })
      .catch(async e => { await registrar("camara", { ok: false, detalle: e.message }); responder({ ok: false, error: e.message }); });
    return true;
  }
  if (msg?.tipo === "senado-raw") {
    enviar("/api/senado/citaciones/importar", { raw: msg.raw })
      .then(async j => { await registrar("senado", { ok: true, detalle: `${j.citaciones} citaciones (${j.dias} días) desde senado.cl` }); responder({ ok: true }); })
      .catch(async e => { await registrar("senado", { ok: false, detalle: e.message }); responder({ ok: false }); });
    return true;
  }
  if (msg?.tipo === "senado-ahora") {
    sincronizarSenado().then(responder);
    return true;
  }
});
