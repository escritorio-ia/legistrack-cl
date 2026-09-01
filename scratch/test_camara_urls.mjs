async function testUrls() {
  const urls = [
    "https://www.camara.cl/legislacion/comisiones/",
    "https://www.camara.cl/transparencia/comisiones.aspx",
    "https://www.camara.cl/diputados/comisiones.aspx",
    "https://www.camara.cl/camara/comisiones.aspx",
    "https://www.camara.cl/trabajamos/comisiones.aspx",
    "https://www.camara.cl/legislacion/comisiones/detalle.aspx?prmID=411",
    "https://www.camara.cl/diputados/detallecomision.aspx?prmID=411",
    "https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_PeriodoActual",
    "https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_Vigentes",
    "https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Periodo?prmPeriodoId=56"
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(6000)
      });
      console.log(`[${res.status}] ${u} (length: ${(await res.text()).length})`);
    } catch (e) {
      console.log(`[ERR] ${u}: ${e.message}`);
    }
  }
}

testUrls().catch(console.error);
