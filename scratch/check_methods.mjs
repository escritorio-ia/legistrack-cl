async function checkMethods() {
  const m1 = await (await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados")).text();
  console.log("getDiputados length:", m1.length, m1.slice(0, 500));

  const m2 = await (await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getSesiones?prmLegislaturaId=137")).text();
  console.log("getSesiones length:", m2.length, m2.slice(0, 500));
}
checkMethods().catch(console.error);
