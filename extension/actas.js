// Se ejecuta cuando abres la página de sesiones de una comisión en camara.cl (legislacion/comisiones/sesiones.aspx).
// Por cada sesión celebrada reúne lo que la propia página ofrece: citación, cuenta, asistencia, acta, votación y
// resultado (como si abrieras cada enlace tú), y lo envía a Legislación++. Solo reenvía si aparece algo nuevo.
async function enviarSesionesDeLaPagina(prmID) {
  const filas = [...document.querySelectorAll("tr")].filter((tr) => /prmIdSesion=\d+/.test(tr.innerHTML));
  const sesiones = filas.map((tr) => {
    const celdas = [...tr.querySelectorAll("td")].map((td) => td.innerText.trim());
    const html = tr.innerHTML;
    return {
      numero: celdas[0] || "", fecha: celdas[1] || "", hora: celdas[2] || "", termino: celdas[3] || "", estado: celdas[4] || "",
      sesionId: (html.match(/prmIdSesion=(\d+)/) || [])[1],
      actaDocId: (html.match(/prmID=(\d+)&(?:amp;)?prmTipo=DOCUMENTO_COMISIONSESIONACTA/i) || [])[1] || "",
      cuentaDocId: (html.match(/prmID=(\d+)&(?:amp;)?prmTipo=DOCUMENTO_COMISIONSESIONCUENTA/i) || [])[1] || "",
      asistencia: /asistencia\.aspx/i.test(html), votacion: /votaciones_sesion\.aspx/i.test(html), resultado: /resultado_detalle\.aspx/i.test(html),
    };
  }).filter((s) => s.sesionId && /celebrada/i.test(s.estado));
  if (sesiones.length === 0) return true;

  const firma = (s) => [s.sesionId, s.actaDocId, s.cuentaDocId, s.asistencia, s.votacion, s.resultado].join(":");
  const { sesionesCamaraEnviadas = [] } = await chrome.storage.local.get("sesionesCamaraEnviadas");
  const todasPendientes = sesiones.filter((s) => !sesionesCamaraEnviadas.includes(firma(s)));
  const pendientes = todasPendientes.slice(0, 10);
  if (pendientes.length === 0) return true;

  const aviso = document.createElement("div");
  aviso.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:99999;background:#0f172a;color:#fff;padding:10px 14px;border-radius:10px;font:600 13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:360px";
  document.body.appendChild(aviso);
  const texto = async (u) => { try { const r = await fetch(u); return r.ok ? await r.text() : ""; } catch { return ""; } };
  const pdf = async (id, tipo) => {
    if (!id) return "";
    try {
      const r = await fetch(`/verDoc.aspx?prmID=${id}&prmTipo=${tipo}`);
      if (!r.ok) return "";
      const bytes = new Uint8Array(await r.arrayBuffer());
      let bin = "";
      for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
      return btoa(bin);
    } catch { return ""; }
  };
  const textoPrincipal = (html) => {
    const d = document.createElement("div");
    d.innerHTML = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
    const zona = d.querySelector("#info-tabs") || d;
    zona.querySelectorAll("#menu-acordeon, nav, header, footer").forEach((n) => n.remove());
    return zona.innerText.replace(/\s+/g, " ").trim();
  };
  let ok = 0, err = "";
  for (const [i, s] of pendientes.entries()) {
    aviso.textContent = `Legislación++: enviando sesión N° ${s.numero} (${i + 1} de ${pendientes.length}): citación, cuenta, asistencia, acta, votación y resultado…`;
    const base = `/legislacion/comisiones`;
    const q = `prmId=${prmID}&prmIdSesion=${s.sesionId}`;
    const [citacionHtml, resultadoHtml, votacionesHtml, asistenciaHtml, actaBase64, cuentaBase64] = await Promise.all([
      texto(`${base}/citacion_detalle.aspx?${q}`),
      s.resultado ? texto(`${base}/resultado_detalle.aspx?${q}`) : "",
      s.votacion ? texto(`${base}/votaciones_sesion.aspx?${q}`) : "",
      s.asistencia ? texto(`${base}/asistencia.aspx?${q}`) : "",
      pdf(s.actaDocId, "DOCUMENTO_COMISIONSESIONACTA"),
      pdf(s.cuentaDocId, "DOCUMENTO_COMISIONSESIONCUENTA"),
    ]);
    const recorta = (h) => { const a = h.indexOf('id="info-tabs"'); return a > 0 ? h.slice(a - 200, a + 200000) : h.slice(0, 250000); };
    const resp = await chrome.runtime.sendMessage({ tipo: "camara-sesion", sesion: {
      comisionPrmId: prmID, sesionId: s.sesionId, numero: s.numero, fecha: s.fecha, hora: s.hora, termino: s.termino, estado: s.estado,
      citacionHtml: recorta(citacionHtml), resultadoHtml: recorta(resultadoHtml), votacionesHtml: recorta(votacionesHtml),
      asistenciaTexto: asistenciaHtml ? textoPrincipal(asistenciaHtml) : "",
      actaDocId: s.actaDocId, actaBase64, cuentaDocId: s.cuentaDocId, cuentaBase64,
    } }).catch((e) => ({ ok: false, error: e.message }));
    if (resp?.ok) {
      ok++;
      sesionesCamaraEnviadas.push(firma(s));
      await chrome.storage.local.set({ sesionesCamaraEnviadas: sesionesCamaraEnviadas.slice(-5000) });
    } else err = resp?.error || "sin respuesta";
  }
  aviso.style.background = ok ? "#047857" : "#b91c1c";
  aviso.textContent = ok ? `Legislación++: ${ok} sesión(es) guardadas con citación, cuenta, asistencia, acta, votación y resultado${err ? ` (alguna falló: ${err})` : ""}.` : `Legislación++: no se pudieron enviar las sesiones (${err}).`;
  setTimeout(() => aviso.remove(), 8000);
  // Página completa: nada falló y no quedaron sesiones sin enviar (se envían hasta 10 por visita).
  return !err && todasPendientes.length <= pendientes.length;
}

// Recorrido automático (iniciado desde la ventanita de la extensión): al terminar esta página, pregunta qué sigue
// (otro mes de esta comisión, otra comisión o terminar) y cambia el mes con el propio selector de la página.
(async function () {
  const prmID = (location.search.match(/prmID=(\d+)/i) || [])[1];
  if (!prmID) return;
  let completo = false;
  try { completo = (await enviarSesionesDeLaPagina(prmID)) === true; } catch (e) { /* se sigue con el recorrido */ }
  const mes = document.querySelector("select[id$='ddlMes']"), anio = document.querySelector("select[id$='ddlAnnos']");
  const r = await chrome.runtime.sendMessage({ tipo: "recorrido-siguiente", prmID, mes: mes?.value, anio: anio?.value, completo }).catch(() => null);
  if (r?.accion === "mes" && mes && anio) {
    await new Promise((ok) => setTimeout(ok, 2500)); // pausa entre páginas, para no recargar el sitio
    anio.value = String(r.anio);
    mes.value = String(r.mes).padStart(2, "0");
    const f = document.forms[0];
    const objetivo = f.querySelector("input[name='__EVENTTARGET']");
    if (objetivo) objetivo.value = mes.name;
    f.submit();
  }
})();
