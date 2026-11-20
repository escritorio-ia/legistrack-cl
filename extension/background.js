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
    await sincronizarSalaSenado();
    return { ok: true, ...j };
  } catch (e) {
    await registrar("senado", { ok: false, detalle: e.message });
    return { ok: false, error: e.message };
  }
}

// Tabla semanal de la Sala del Senado (misma API pública que usa senado.cl).
async function sincronizarSalaSenado() {
  try {
    const r = await fetch("https://web-back.senado.cl/api/weekly_table?limit=100", { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(`web-back.senado.cl respondió HTTP ${r.status}`);
    const j = await enviar("/api/senado/sala/importar", { raw: await r.json() });
    await registrar("sala", { ok: true, detalle: `${j.sesiones} sesiones de Sala (${j.puntos} puntos de tabla)` });
  } catch (e) {
    await registrar("sala", { ok: false, detalle: e.message });
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
  if (msg?.tipo === "camara-resultados") {
    enviar("/api/camara/resultados/importar", { semana: msg.semana, html: msg.html })
      .then(async j => { await registrar("resultados", { ok: true, detalle: `Semana ${j.semana}: ${j.sesiones} sesiones` }); responder({ ok: true, ...j }); })
      .catch(async e => { await registrar("resultados", { ok: false, detalle: e.message }); responder({ ok: false, error: e.message }); });
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
  // Resultados de la semana recién terminada (lo realizado en cada sesión).
  const pasada = new Date(); pasada.setDate(pasada.getDate() - ([5, 6, 0].includes(pasada.getDay()) ? 0 : 7));
  chrome.tabs.create({ url: `https://www.camara.cl/legislacion/comisiones/resultados_semana.aspx?prmSemana=${semanaISO(pasada)}`, active: false });
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
// Detalle (puntos, aspectos, acuerdos, invitados) de las sesiones de los últimos 60
// días que aún no se han enviado. Las ya enviadas se recuerdan para no repetir.
function fechaDMY(f) { const m = String(f || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; }

async function enviarDetallesRecientes(idComision, filas) {
  const limite = Date.now() - 60 * 86400000;
  const { detallesSenado = {} } = await chrome.storage.local.get("detallesSenado");
  const pendientes = filas.filter(f => { const d = fechaDMY(f.FECHA); return d && d.getTime() >= limite && d.getTime() <= Date.now() && !detallesSenado[f.ID_SESION]; }).slice(0, 15);
  const lote = [];
  for (const f of pendientes) {
    try {
      const r = await fetch(`https://web-back.senado.cl/api/commission_session?id_sesion=${f.ID_SESION}`, { headers: { Accept: "application/json" } });
      if (r.ok) lote.push({ idComision, idSesion: String(f.ID_SESION), raw: await r.json() });
    } catch { /* se reintenta en la próxima sincronización */ }
    await new Promise(r => setTimeout(r, 300));
  }
  if (lote.length === 0) return 0;
  try {
    const res = await enviar("/api/senado/sesiones/detalle/importar", { detalles: lote });
    for (const x of lote) detallesSenado[x.idSesion] = Date.now();
    await chrome.storage.local.set({ detallesSenado });
    return res.detalles || 0;
  } catch { return 0; }
}

async function sincronizarSesionesSenado() {
  try {
    const { app } = await config();
    const { ids } = await (await fetch(`${app}/api/senado/comisiones-ids`)).json();
    let ok = 0, total = 0, errores = 0, detallesEnviados = 0;
    for (const id of ids || []) {
      try {
        const r = await fetch(`https://web-back.senado.cl/api/commission_sessions?id_comision=${id}&limit=100&offset=0&sort=fecha&order=desc`, { headers: { Accept: "application/json" } });
        if (!r.ok) { errores++; continue; }
        const j = await r.json();
        const filas = j?.data?.data || [];
        if (filas.length === 0) continue;
        const res = await enviar("/api/senado/sesiones/importar", { idComision: String(id), sesiones: filas });
        ok++; total += res.sesiones || 0;
        detallesEnviados += await enviarDetallesRecientes(String(id), filas);
      } catch { errores++; }
      await new Promise(r => setTimeout(r, 400)); // sin apuro: no cargar el servidor del Senado
    }
    await registrar("sesiones", { ok: ok > 0, detalle: `${total} sesiones de ${ok} comisiones; ${detallesEnviados} detalles nuevos${errores ? ` (${errores} con error)` : ""}` });
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

// ---------------------------------------------------------------------------
// Transcripción automática de sesiones: ver el estado, iniciar o detener desde la extensión.
// Mientras el navegador está abierto, cada 10 minutos da un empujón a la cadena (por si se detuvo).
// ---------------------------------------------------------------------------
async function transcripcion(accion) {
  try {
    const j = await enviar("/api/transcripcion/automatica/extension", { accion });
    await chrome.storage.local.set({ transcripcion: { ...j, fecha: new Date().toISOString() } });
    return j;
  } catch (e) {
    const err = { ok: false, error: e.message, fecha: new Date().toISOString() };
    await chrome.storage.local.set({ transcripcion: err });
    return err;
  }
}
chrome.alarms.onAlarm.addListener(a => { if (a.name === "transcripcion") transcripcion("paso"); });
chrome.runtime.onInstalled.addListener(() => chrome.alarms.create("transcripcion", { periodInMinutes: 10 }));
chrome.runtime.onStartup.addListener(() => { chrome.alarms.create("transcripcion", { periodInMinutes: 10 }); transcripcion("paso"); });
chrome.runtime.onMessage.addListener((msg, _s, responder) => {
  if (msg?.tipo === "transcripcion") { transcripcion(msg.accion || "estado").then(responder); return true; }
});

// Actas oficiales de sesiones de comisión de la Cámara (las lee actas.js al abrir la página de sesiones).
chrome.runtime.onMessage.addListener((msg, _s, responder) => {
  if (msg?.tipo === "camara-sesion") {
    enviar("/api/camara/sesion/importar", msg.sesion)
      .then(async (j) => { await registrar("actas", { ok: true, detalle: `Sesión del ${j.fecha}: ${j.puntos} punto(s), ${j.votaciones} votación(es)${j.acta ? ", acta" : ""}${j.cuenta ? ", cuenta" : ""}` }); responder({ ok: true, ...j }); })
      .catch(async (e) => { await registrar("actas", { ok: false, detalle: e.message }); responder({ ok: false, error: e.message }); });
    return true;
  }
});

// ---------------------------------------------------------------------------
// Recorrido de sesiones de la Cámara: abre en una pestaña la página "Sesiones" de cada comisión y, mes a mes
// hacia atrás, deja que actas.js envíe citación, cuenta, asistencia, acta, votación y resultado de cada sesión.
// Se inicia y detiene desde la ventanita de la extensión. Una página a la vez, con pausas.
// ---------------------------------------------------------------------------
const URL_SESIONES = (prm) => `https://www.camara.cl/legislacion/comisiones/sesiones.aspx?prmID=${prm}&prmIdTipo=2101`;
function mesesHaciaAtras(n) {
  const out = [], d = new Date();
  for (let i = 1; i < n; i++) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push({ mes: x.getMonth() + 1, anio: x.getFullYear() }); }
  return out; // el mes actual es el que la página muestra al abrir
}
async function leerRecorrido() { return (await chrome.storage.local.get("recorrido")).recorrido || null; }
async function guardarRecorrido(r) { await chrome.storage.local.set({ recorrido: r }); }
async function iniciarRecorrido(meses) {
  const { app } = await config();
  const resp = await fetch(`${app}/api/camara/comisiones-prm`);
  const cuerpo = await resp.text();
  let lista = [];
  try { lista = JSON.parse(cuerpo).comisiones || []; }
  catch { throw new Error(`La app (${app}) no entregó la lista de comisiones (HTTP ${resp.status}). Revisa que esté publicada la última versión y la dirección en Opciones.`); }
  if (!lista.length) throw new Error("No se pudo obtener la lista de comisiones.");
  const tab = await chrome.tabs.create({ url: URL_SESIONES(lista[0].prmID), active: false });
  const r = { activo: true, meses, total: lista.length, hechas: 0, cola: lista.slice(1), actual: { ...lista[0], restantes: mesesHaciaAtras(meses) }, tabId: tab.id, inicio: new Date().toISOString(), ultimaSenal: Date.now() };
  await guardarRecorrido(r);
  chrome.alarms.create("recorrido-vigilancia", { periodInMinutes: 2 });
  return r;
}
async function detenerRecorrido(motivo) {
  const r = await leerRecorrido();
  if (!r) return null;
  r.activo = false; r.fin = new Date().toISOString(); r.motivo = motivo || "Detenido";
  await guardarRecorrido(r);
  chrome.alarms.clear("recorrido-vigilancia");
  if (r.tabId) chrome.tabs.remove(r.tabId).catch(() => {});
  return r;
}
async function avanzarComision(r) {
  r.hechas++;
  const sig = r.cola.shift();
  if (!sig) { await guardarRecorrido(r); return detenerRecorrido(`Terminado: ${r.hechas} comisiones revisadas`); }
  r.actual = { ...sig, restantes: mesesHaciaAtras(r.meses) };
  r.ultimaSenal = Date.now();
  await guardarRecorrido(r);
  await new Promise((ok) => setTimeout(ok, 3000));
  chrome.tabs.update(r.tabId, { url: URL_SESIONES(sig.prmID) }).catch(() => detenerRecorrido("Se cerró la pestaña del recorrido"));
}
chrome.runtime.onMessage.addListener((msg, sender, responder) => {
  if (msg?.tipo === "recorrido-siguiente") {
    (async () => {
      const r = await leerRecorrido();
      if (!r?.activo || sender.tab?.id !== r.tabId || r.actual?.prmID !== msg.prmID) return responder({ accion: "nada" });
      r.ultimaSenal = Date.now();
      const m = r.actual.restantes.shift();
      await guardarRecorrido(r);
      if (m) return responder({ accion: "mes", mes: m.mes, anio: m.anio });
      responder({ accion: "nada" });
      await avanzarComision(r);
    })();
    return true;
  }
  if (msg?.tipo === "recorrido") {
    (async () => {
      try {
        if (msg.accion === "iniciar") return responder({ ok: true, recorrido: await iniciarRecorrido(Number(msg.meses) || 1) });
        if (msg.accion === "detener") return responder({ ok: true, recorrido: await detenerRecorrido("Detenido por el usuario") });
        responder({ ok: true, recorrido: await leerRecorrido() });
      } catch (e) { responder({ ok: false, error: e.message }); }
    })();
    return true;
  }
});
// Vigilancia: si una página no responde en 4 minutos (sin sesiones, error de carga), se pasa a la siguiente comisión.
chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name !== "recorrido-vigilancia") return;
  const r = await leerRecorrido();
  if (!r?.activo) return chrome.alarms.clear("recorrido-vigilancia");
  if (Date.now() - (r.ultimaSenal || 0) > 4 * 60 * 1000) await avanzarComision(r);
});
chrome.tabs.onRemoved.addListener(async (id) => { const r = await leerRecorrido(); if (r?.activo && r.tabId === id) detenerRecorrido("Se cerró la pestaña del recorrido"); });

// ---------------------------------------------------------------------------
// Rescate de sesiones del Senado (equivalente al de la Cámara): el Senado publica cada sesión de comisión con sus
// puntos (tabla, aspectos considerados y acuerdos) y las presentaciones de los invitados, en la misma API pública que
// usa senado.cl. Aquí se envían TODAS las sesiones del período elegido (no solo los últimos 60 días), con su detalle.
// ---------------------------------------------------------------------------
async function rescatarSenado(meses) {
  const { app } = await config();
  const { ids } = await (await fetch(`${app}/api/senado/comisiones-ids`)).json();
  const limite = new Date(); limite.setMonth(limite.getMonth() - meses); limite.setDate(1);
  const estado = { activo: true, meses, total: (ids || []).length, hechas: 0, sesiones: 0, detalles: 0, errores: 0, inicio: new Date().toISOString() };
  await chrome.storage.local.set({ rescateSenado: estado });
  const { detallesSenado = {} } = await chrome.storage.local.get("detallesSenado");
  for (const id of ids || []) {
    if (!(await chrome.storage.local.get("rescateSenado")).rescateSenado?.activo) break;
    try {
      // Sesiones de la comisión, por páginas, hasta llegar a la fecha límite.
      let filas = [];
      for (let offset = 0; offset < 600; offset += 100) {
        const r = await fetch(`https://web-back.senado.cl/api/commission_sessions?id_comision=${id}&limit=100&offset=${offset}&sort=fecha&order=desc`, { headers: { Accept: "application/json" } });
        if (!r.ok) break;
        const pag = (await r.json())?.data?.data || [];
        filas.push(...pag);
        const ultima = fechaDMY(pag[pag.length - 1]?.FECHA);
        if (pag.length < 100 || (ultima && ultima < limite)) break;
        await new Promise((ok) => setTimeout(ok, 500));
      }
      if (filas.length) {
        const res = await enviar("/api/senado/sesiones/importar", { idComision: String(id), sesiones: filas });
        estado.sesiones += res.sesiones || 0;
        // Detalle (puntos, aspectos, acuerdos, presentaciones) de las sesiones realizadas del período, de a 10 por envío.
        const pendientes = filas.filter((f) => { const d = fechaDMY(f.FECHA); return d && d >= limite && d.getTime() <= Date.now() && f.FRACASADA !== "Si" && !detallesSenado[f.ID_SESION]; });
        for (let i = 0; i < pendientes.length; i += 10) {
          const lote = [];
          for (const f of pendientes.slice(i, i + 10)) {
            try {
              const r = await fetch(`https://web-back.senado.cl/api/commission_session?id_sesion=${f.ID_SESION}`, { headers: { Accept: "application/json" } });
              if (r.ok) lote.push({ idComision: String(id), idSesion: String(f.ID_SESION), raw: await r.json() });
            } catch { /* se reintenta en otro rescate */ }
            await new Promise((ok) => setTimeout(ok, 400)); // sin apuro: no cargar el servidor del Senado
          }
          if (!lote.length) continue;
          try {
            const res2 = await enviar("/api/senado/sesiones/detalle/importar", { detalles: lote });
            for (const x of lote) detallesSenado[x.idSesion] = Date.now();
            await chrome.storage.local.set({ detallesSenado });
            estado.detalles += res2.detalles || 0;
          } catch { estado.errores++; }
        }
      }
    } catch { estado.errores++; }
    estado.hechas++;
    await chrome.storage.local.set({ rescateSenado: { ...estado } });
  }
  estado.activo = false; estado.fin = new Date().toISOString();
  await chrome.storage.local.set({ rescateSenado: estado });
  return estado;
}
chrome.runtime.onMessage.addListener((msg, _s, responder) => {
  if (msg?.tipo === "rescate-senado") {
    (async () => {
      if (msg.accion === "iniciar") { rescatarSenado(Number(msg.meses) || 3); await new Promise((ok) => setTimeout(ok, 800)); }
      if (msg.accion === "detener") { const { rescateSenado: r } = await chrome.storage.local.get("rescateSenado"); if (r) await chrome.storage.local.set({ rescateSenado: { ...r, activo: false, fin: new Date().toISOString(), motivo: "Detenido por el usuario" } }); }
      responder({ ok: true, estado: (await chrome.storage.local.get("rescateSenado")).rescateSenado || null });
    })();
    return true;
  }
});
