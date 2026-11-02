// Se ejecuta solo cuando abres una semana de citaciones en camara.cl.
// Lee lo que ya está en pantalla y lo envía a Legislación++.
(function () {
  const articulos = [...document.querySelectorAll("article.citaciones")];
  if (articulos.length === 0) return;
  const html = articulos.map(a => a.outerHTML).join("\n");
  const semana = (location.search.match(/prmSemana=([\d-]+)/) || [])[1] || "";
  const esResultados = /resultados_semana/i.test(location.pathname);

  const aviso = document.createElement("div");
  aviso.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:99999;background:#0f172a;color:#fff;padding:10px 14px;border-radius:10px;font:600 13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.3)";
  aviso.textContent = esResultados ? "Legislación++: enviando resultados…" : "Legislación++: enviando citaciones…";
  document.body.appendChild(aviso);

  chrome.runtime.sendMessage({ tipo: esResultados ? "camara-resultados" : "camara", semana, html }, (r) => {
    if (r?.ok) {
      aviso.style.background = "#047857";
      aviso.textContent = esResultados
        ? `Legislación++: resultados de ${r.sesiones} sesiones guardados (semana ${r.semana}).`
        : `Legislación++: ${r.citaciones} citaciones guardadas (semana ${r.semana}).`;
    } else {
      aviso.style.background = "#b91c1c";
      aviso.textContent = `Legislación++: no se pudo enviar (${(r && r.error) || "sin respuesta"}).`;
    }
    setTimeout(() => aviso.remove(), 6000);
  });
})();
