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

// ---------------------------------------------------------------------------
// Recordatorio de la Cámara: camara.cl no permite lectura automática, así que
// entre viernes y lunes, si hace más de 4 días que no se envían citaciones, se
// avisa con una notificación. Al hacer clic se abre la semana correspondiente
// y el envío ocurre al cargar la página (con una persona mirando).
// ---------------------------------------------------------------------------
function semanaISO(fecha) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dia = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dia);
  const inicio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const n = Math.ceil(((d - inicio) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(n).padStart(2, "0")}`;
}

function urlSemanaCamara() {
  const hoy = new Date();
  // De viernes a domingo interesa la semana siguiente; el lunes, la que empieza.
  const objetivo = new Date(hoy);
  if ([5, 6, 0].includes(hoy.getDay())) objetivo.setDate(hoy.getDate() + (8 - (hoy.getDay() || 7)));
  return `https://www.camara.cl/legislacion/comisiones/citaciones_semana.aspx?prmSemana=${semanaISO(objetivo)}`;
}

async function revisarRecordatorioCamara() {
  const dia = new Date().getDay();
  if (![5, 6, 0, 1].includes(dia)) return;
  const { camara, ultimoAviso } = await chrome.storage.local.get(["camara", "ultimoAviso"]);
  const ultimoEnvio = camara?.ok ? new Date(camara.fecha).getTime() : 0;
  if (Date.now() - ultimoEnvio < 4 * 86400000) return;
  if (ultimoAviso && Date.now() - ultimoAviso < 12 * 3600000) return;
  await chrome.storage.local.set({ ultimoAviso: Date.now() });
  chrome.notifications.create("recordatorio-camara", {
    type: "basic",
    iconUrl: "icono128.png",
    title: "Legislación++: citaciones de la Cámara",
    message: "Hay una semana de citaciones por enviar. Haz clic para abrirla; se envía sola al cargar.",
    priority: 1
  });
}

chrome.notifications.onClicked.addListener(id => {
  if (id !== "recordatorio-camara") return;
  chrome.tabs.create({ url: urlSemanaCamara() });
  chrome.notifications.clear(id);
});

chrome.alarms.onAlarm.addListener(a => { if (a.name === "recordatorio-camara") revisarRecordatorioCamara(); });
chrome.runtime.onInstalled.addListener(() => chrome.alarms.create("recordatorio-camara", { periodInMinutes: 120 }));
chrome.runtime.onStartup.addListener(() => { chrome.alarms.create("recordatorio-camara", { periodInMinutes: 120 }); revisarRecordatorioCamara(); });

// ---------------------------------------------------------------------------
// Sesiones de comisiones del Senado (historial): cada 12 horas se piden las 100
// sesiones más recientes de cada comisión a la API pública que usa senado.cl
// y se envían a la app.
// ---------------------------------------------------------------------------
async function sincronizarSesionesSenado() {
  try {
    const { app } = await config();
    const { ids } = await (await fetch(`${app}/api/senado/comisiones-ids`)).json();
    let ok = 0, total = 0, errores = 0;
    for (const id of ids || []) {
      try {
        const r = await fetch(`https://web-back.senado.cl/api/commission_sessions?id_comision=${id}&limit=100&offset=0&sort=fecha&order=desc`, { headers: { Accept: "application/json" } });
        if (!r.ok) { errores++; continue; }
        const j = await r.json();
        const filas = j?.data?.data || [];
        if (filas.length === 0) continue;
        const res = await enviar("/api/senado/sesiones/importar", { idComision: String(id), sesiones: filas });
        ok++; total += res.sesiones || 0;
      } catch { errores++; }
      await new Promise(r => setTimeout(r, 400)); // sin apuro: no cargar el servidor del Senado
    }
    await registrar("sesiones", { ok: ok > 0, detalle: `${total} sesiones de ${ok} comisiones${errores ? ` (${errores} con error)` : ""}` });
  } catch (e) {
    await registrar("sesiones", { ok: false, detalle: e.message });
  }
}

chrome.alarms.onAlarm.addListener(a => { if (a.name === "sesiones-senado") sincronizarSesionesSenado(); });
chrome.runtime.onInstalled.addListener(() => { chrome.alarms.create("sesiones-senado", { periodInMinutes: 720 }); sincronizarSesionesSenado(); });
chrome.runtime.onStartup.addListener(() => chrome.alarms.create("sesiones-senado", { periodInMinutes: 720 }));
chrome.runtime.onMessage.addListener((msg, _s, responder) => {
  if (msg?.tipo === "sesiones-ahora") { sincronizarSesionesSenado().then(() => responder({ ok: true })); return true; }
});
