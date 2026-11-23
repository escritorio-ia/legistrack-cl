// Se ejecuta al abrir la página "Documentos" de una comisión en camara.cl (legislacion/comisiones/documentos.aspx):
// presentaciones de invitados, comparados y otros documentos por sesión. Envía a Legislación++ los que aún no se
// han enviado (los archivos de más de 2,5 MB se envían solo con sus datos y enlace).
async function enviarDocumentosDeLaPagina(prmID) {
  const filas = [...document.querySelectorAll("tr")].filter((tr) => /DOCUMENTO_COMISIONDOCUMENTO/i.test(tr.innerHTML));
  const docs = filas.map((tr) => {
    const c = [...tr.querySelectorAll("td")].map((td) => td.innerText.trim());
    return { fecha: c[0] || "", sesion: c[1] || "", tipo: c[2] || "", boletin: c[3] || "", titulo: c[4] || "", docId: (tr.innerHTML.match(/prmID=(\d+)&(?:amp;)?prmTipo=DOCUMENTO_COMISIONDOCUMENTO/i) || [])[1] };
  }).filter((d) => d.docId);
  if (!docs.length) return true;
  const { camaraDocsEnviados = [] } = await chrome.storage.local.get("camaraDocsEnviados");
  const todos = docs.filter((d) => !camaraDocsEnviados.includes(d.docId));
  const pendientes = todos; // todos los de la página, con una pausa breve entre cada uno
  if (!pendientes.length) return true;
  const aviso = document.createElement("div");
  aviso.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:99999;background:#0f172a;color:#fff;padding:10px 14px;border-radius:10px;font:600 13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:360px";
  document.body.appendChild(aviso);
  let ok = 0, err = "";
  for (const [i, d] of pendientes.entries()) {
    if (i) await new Promise((ok) => setTimeout(ok, 1000)); // sin apuro: no cargar el servidor de la Cámara
    aviso.textContent = `Legislación++: enviando documentos (${i + 1} de ${pendientes.length})…`;
    let base64 = "";
    // La Cámara a veces rechaza la primera descarga (HTTP 403) y entrega el archivo al segundo intento.
    for (let intento = 0; intento < 2 && !base64; intento++) {
      if (intento) await new Promise((ok) => setTimeout(ok, 2000));
      try {
        const r = await fetch(`/verDoc.aspx?prmID=${d.docId}&prmTipo=DOCUMENTO_COMISIONDOCUMENTO`);
        if (!r.ok) continue;
        const bytes = new Uint8Array(await r.arrayBuffer());
        const cabeza = String.fromCharCode(...bytes.slice(0, 4));
        if (!/^%PDF|^PK/.test(cabeza)) continue; // no es un PDF ni un Word: se envía sin archivo
        if (bytes.length > 2.5 * 1024 * 1024) break; // Vercel no acepta envíos de más de 4,5 MB
        let bin = "";
        for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
        base64 = btoa(bin);
      } catch { /* se reintenta o se envía sin archivo */ }
    }
    const mandar = (b64) => chrome.runtime.sendMessage({ tipo: "camara-documentos", datos: { comisionPrmId: prmID, docs: [{ ...d, base64: b64 }] } }).catch((e) => ({ ok: false, error: e.message }));
    let resp = await mandar(base64);
    // Si falló con el archivo, al menos se guardan los datos y el enlace.
    if (!resp?.ok && base64) resp = await mandar("");
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
