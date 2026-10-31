chrome.storage.sync.get({ token: "", app: "https://legistrack-cl.vercel.app" }, c => {
  document.getElementById("token").value = c.token;
  document.getElementById("app").value = c.app;
});
document.getElementById("guardar").onclick = () => {
  chrome.storage.sync.set({
    token: document.getElementById("token").value.trim(),
    app: document.getElementById("app").value.trim() || "https://legistrack-cl.vercel.app"
  }, () => {
    document.getElementById("ok").textContent = "Guardado.";
    chrome.runtime.sendMessage({ tipo: "senado-ahora" });
  });
};
