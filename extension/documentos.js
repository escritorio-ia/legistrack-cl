// Se ejecuta al abrir la página "Documentos" de una comisión en camara.cl (legislacion/comisiones/documentos.aspx):
// presentaciones de invitados, comparados y otros documentos por sesión. Envía a Legislación++ los que aún no se
// han enviado (los archivos de más de 3 MB se envían solo con sus datos y enlace).
async function enviarDocumentosDeLaPagina(prmID) {
  const filas = [...document.querySelectorAll("tr")].filter((tr) => /DOCUMENTO_COMISIONDOCUMENTO/i.test(tr.innerHTML));
  const docs = filas.map((tr) => {
    const c = [...tr.querySelectorAll("td")].map((td) => td.innerText.trim());
    return { fecha: c[0] || "", sesion: c[1] || "", tipo: c[2] || "", boletin: c[3] || "", titulo: c[4] || "", docId: (tr.innerHTML.match(/prmID=(\d+)&(?:amp;)?prmTipo=DOCUMENTO_COMISIONDOCUMENTO/i) || [])[1] };
  }).filter((d) => d.docId);
  if (!docs.length) return true;
  const { camaraDocsEnviados = [] } = await chrome.storage.local.get("camaraDocsEnviados");
  const todos = docs.filter((d) => !camaraDocsEnviados.includes(d.docId));
  const pendientes = todos.slice(0, 8);
  if (!pendientes.length) return true;
  const aviso = document.createElement("div");
  aviso.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:99999;background:#0f172a;color:#fff;padding:10px 14px;border-radius:10px;font:600 13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:360px";
  document.body.appendChild(aviso);
  let ok = 0, err = "";
  for (const [i, d] of pendientes.entries()) {
    aviso.textContent = `Legislación++: enviando documentos (${i + 1} de ${pendientes.length})…`;
    let base64 = "";
    try {
      const r = await fetch(`/verDoc.aspx?prmID=${d.docId}&prmTipo=DOCUMENTO_COMISIONDOCUMENTO`);
      if (r.ok) {
        const bytes = new Uint8Array(await r.arrayBuffer());
        if (bytes.length <= 3 * 1024 * 1024) {
          let bin = "";
          for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
          base64 = btoa(bin);
        }
      }
    } catch { /* se envía sin archivo */ }
    const resp = await chrome.runtime.sendMessage({ tipo: "camara-documentos", datos: { comisionPrmId: prmID, docs: [{ ...d, base64 }] } }).catch((e) => ({ ok: false, error: e.message }));
    if (resp?.ok) { ok++; camaraDocsEnviados.push(d.docId); await chrome.storage.local.set({ camaraDocsEnviados: camaraDocsEnviados.slice(-8000) }); }
    else err = resp?.error || "sin respuesta";
  }
  aviso.style.background = ok ? "#047857" : "#b91c1c";
  aviso.textContent = ok ? `Legislación++: ${ok} documento(s) guardados${err ? ` (alguno falló: ${err})` : ""}.` : `Legislación++: no se pudieron enviar los documentos (${err}).`;
  setTimeout(() => aviso.remove(), 7000);
  return !err && todos.length <= pendientes.length;
}

(async function () {
  const prmID = (location.search.match(/prmID=(\d+)/i) || [])[1];
  if (!prmID) return;
  let completo = false;
  try { completo = (await enviarDocumentosDeLaPagina(prmID)) === true; } catch { /* se sigue con el recorrido */ }
  const mes = document.querySelector("select[id$='ddlMes']"), anio = document.querySelector("select[id$='ddlAnnos']");
  const r = await chrome.runtime.sendMessage({ tipo: "recorrido-siguiente", fase: "documentos", prmID, mes: mes?.value, anio: anio?.value, completo }).catch(() => null);
  if (r?.accion === "mes" && mes && anio) {
    await new Promise((ok) => setTimeout(ok, 2500));
    anio.value = String(r.anio);
    mes.value = String(r.mes).padStart(2, "0");
    const f = document.forms[0];
    const objetivo = f.querySelector("input[name='__EVENTTARGET']");
    if (objetivo) objetivo.value = mes.name;
    f.submit();
  }
})();
