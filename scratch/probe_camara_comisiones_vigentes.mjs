async function probe() {
  console.log("Fetching getComisiones_Vigentes...");
  const res = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_Vigentes");
  const xml = await res.text();
  console.log("Comisiones Vigentes XML sample (length " + xml.length + "):\n", xml.slice(0, 1500));
}

probe().catch(console.error);
