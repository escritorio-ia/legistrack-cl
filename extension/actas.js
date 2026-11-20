// Se ejecuta cuando abres la página de sesiones de una comisión en camara.cl
// (legislacion/comisiones/sesiones.aspx). Lee las actas oficiales que aparecen en pantalla
// y envía a Legislación++ las que aún no se han enviado (como si las descargaras tú).
(async function () {
  const prmID = (location.search.match(/prmID=(\d+)/i) || [])[1];
  if (!prmID) return;
  const filas = [...document.querySelectorAll("tr")].filter((tr) => /prmIdSesion=\d+/.test(tr.innerHTML));
  const sesiones = filas.map((tr) => {
    const celdas = [...tr.querySelectorAll("td")].map((td) => td.innerText.trim());
    const html = tr.innerHTML;
    return {
      numero: celdas[0] || "", fecha: celdas[1] || "", hora: celdas[2] || "", estado: celdas[4] || "",
      sesionId: (html.match(/prmIdSesion=(\d+)/) || [])[1],
      docId: (html.match(/prmID=(\d+)&(?:amp;)?prmTipo=DOCUMENTO_COMISIONSESIONACTA/i) || [])[1],
    };
  }).filter((s) => s.sesionId && s.docId);
  if (sesiones.length === 0) return;

  const { actasEnviadas = [] } = await chrome.storage.local.get("actasEnviadas");
  const pendientes = sesiones.filter((s) => !actasEnviadas.includes(s.docId)).slice(0, 12);
  if (pendientes.length === 0) return;

  const aviso = document.createElement("div");
  aviso.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:99999;background:#0f172a;color:#fff;padding:10px 14px;border-radius:10px;font:600 13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.3)";
  document.body.appendChild(aviso);
  let ok = 0, err = "";
  for (const [i, s] of pendientes.entries()) {
    aviso.textContent = `Legislación++: enviando actas (${i + 1} de ${pendientes.length})…`;
    try {
      const r = await fetch(`/verDoc.aspx?prmID=${s.docId}&prmTipo=DOCUMENTO_COMISIONSESIONACTA`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const bytes = new Uint8Array(await r.arrayBuffer());
      let bin = "";
      for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
      const resp = await chrome.runtime.sendMessage({ tipo: "camara-acta", acta: { comisionPrmId: prmID, sesionId: s.sesionId, numero: s.numero, fecha: s.fecha, hora: s.hora, docId: s.docId, pdfBase64: btoa(bin) } });
      if (!resp?.ok) throw new Error(resp?.error || "sin respuesta");
      actasEnviadas.push(s.docId);
      await chrome.storage.local.set({ actasEnviadas: actasEnviadas.slice(-3000) });
      ok++;
    } catch (e) { err = e.message; }
  }
  aviso.style.background = ok ? "#047857" : "#b91c1c";
  aviso.textContent = ok ? `Legislación++: ${ok} acta(s) guardadas${err ? ` (alguna falló: ${err})` : ""}.` : `Legislación++: no se pudieron enviar las actas (${err}).`;
  setTimeout(() => aviso.remove(), 7000);
})();
