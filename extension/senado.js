// Respaldo: al abrir la página de citaciones de senado.cl, se consulta la misma API
// que usa esa página (desde senado.cl) y se envía a Legislación++.
(async function () {
  try {
    const r = await fetch("https://web-back.senado.cl/api/commissions_citations?limit=100", { headers: { Accept: "application/json" } });
    if (!r.ok) return;
    const raw = await r.json();
    chrome.runtime.sendMessage({ tipo: "senado-raw", raw });
  } catch (e) { /* sin acción */ }
})();
