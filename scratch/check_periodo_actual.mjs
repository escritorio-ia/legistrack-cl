async function checkPeriodoActual() {
  const res = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getPeriodoLegislativoActual");
  const xml = await res.text();
  console.log("Periodo actual XML:\n", xml);
}

checkPeriodoActual().catch(console.error);
