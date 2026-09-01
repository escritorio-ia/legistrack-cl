async function checkDiputadosPeriodo() {
  const res = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Periodo?prmPeriodoId=56");
  const xml = await res.text();
  console.log("Periodo 56 response length:", xml.length);
  const matches = [...xml.matchAll(/<Diputado>([\s\S]*?)<\/Diputado>/g)];
  console.log("Diputados in Periodo 56:", matches.length);
  if (matches.length > 0) {
    console.log("Sample Diputado Periodo 56:\n", matches[0][0]);
  }
}

checkDiputadosPeriodo().catch(console.error);
