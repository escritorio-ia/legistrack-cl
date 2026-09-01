async function checkDipDetalle() {
  const res = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getDiputado_Detalle?prmDiputadoId=1009");
  const xml = await res.text();
  console.log("Diputado 1009 detail length:", xml.length);
  console.log(xml.slice(0, 2500));
}
checkDipDetalle().catch(console.error);
