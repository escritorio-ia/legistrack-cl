async function inspectDiputadosVigentes() {
  const res = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Vigentes");
  const xml = await res.text();
  console.log("Sample of getDiputados_Vigentes:\n", xml.slice(0, 2000));
}
inspectDiputadosVigentes().catch(console.error);
