async function probe() {
  console.log("=== Probing Senado: https://tramitacion.senado.cl/wspublico/comisiones.php ===");
  try {
    const resSenado = await fetch("https://tramitacion.senado.cl/wspublico/comisiones.php");
    const textSenado = await resSenado.text();
    console.log("Senado response status:", resSenado.status);
    console.log("Senado length:", textSenado.length);
    console.log("Senado snippet (first 1000 chars):\n", textSenado.slice(0, 1000));
  } catch (err) {
    console.error("Senado error:", err);
  }

  console.log("\n=== Probing Camara Diputados Vigentes: https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Vigentes ===");
  try {
    const resDip = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Vigentes");
    const textDip = await resDip.text();
    console.log("Diputados response status:", resDip.status);
    console.log("Diputados length:", textDip.length);
    console.log("Diputados snippet (first 1000 chars):\n", textDip.slice(0, 1000));
  } catch (err) {
    console.error("Diputados error:", err);
  }

  console.log("\n=== Probing Camara Comisiones Vigentes ===");
  try {
    const resCom = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_Vigentes");
    const textCom = await resCom.text();
    console.log("Camara Comisiones status:", resCom.status);
    console.log("Camara Comisiones snippet (first 1000 chars):\n", textCom.slice(0, 1000));
  } catch (err) {
    console.error("Camara comisiones error:", err);
  }
}

probe().catch(console.error);
