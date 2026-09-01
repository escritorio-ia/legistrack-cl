async function getWsdlMethods() {
  const res = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx?WSDL");
  const xml = await res.text();

  const methods = new Set();
  for (const m of xml.matchAll(/<wsdl:operation name="([^"]+)"/g)) {
    methods.add(m[1]);
  }
  console.log("All WSDL operations:", Array.from(methods));
}

getWsdlMethods().catch(console.error);
