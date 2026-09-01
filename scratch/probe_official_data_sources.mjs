async function checkSources() {
  const tests = [
    "https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Vigentes",
    "https://opendata.camara.cl/wscamaradiputados.asmx/getPeriodoLegislativoActual",
    "https://opendata.camara.cl/wscamaradiputados.asmx/getLegislaturaActual",
    "https://tramitacion.senado.cl/wspublico/comisiones.php",
    "https://tramitacion.senado.cl/wspublico/senadores_vigentes.php",
    "https://www.bcn.cl/leychile/consulta/portada_comisiones",
  ];

  for (const t of tests) {
    try {
      const res = await fetch(t, {
        headers: { "User-Agent": "Mozilla/5.0 (LegisTrack-CL Probe; +https://legistrack.cl)" },
        signal: AbortSignal.timeout(5000)
      });
      const txt = await res.text();
      console.log(`[${res.status}] ${t} -> length: ${txt.length}, preview: ${txt.slice(0, 180).replace(/\n/g, " ")}`);
    } catch (e) {
      console.log(`[ERR] ${t} -> ${e.message}`);
    }
  }
}

checkSources().catch(console.error);
