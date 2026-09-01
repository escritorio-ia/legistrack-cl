async function probeCamara() {
  const wsdlRes = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx?WSDL");
  const wsdl = await wsdlRes.text();
  
  // Look for comision operations
  const ops = [...wsdl.matchAll(/<wsdl:operation name="([^"]+)"/g)].map(m => m[1]);
  console.log("Operations matching 'Comision' or 'Diputado':", ops.filter(o => o.toLowerCase().includes("comision") || o.toLowerCase().includes("diputad")));

  // Let's test getComision_Integrantes or similar
  for (const op of ops.filter(o => o.toLowerCase().includes("comision"))) {
    try {
      const testRes = await fetch(`https://opendata.camara.cl/wscamaradiputados.asmx/${op}?prmComisionId=411`);
      console.log(`Testing ${op}?prmComisionId=411: status = ${testRes.status}, length = ${(await testRes.text()).length}`);
    } catch(e) {
      console.log(`Testing ${op} error:`, e.message);
    }
  }
}

probeCamara().catch(console.error);
