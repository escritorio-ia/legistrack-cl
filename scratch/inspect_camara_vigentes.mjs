async function inspectCamaraVigentes() {
  console.log("=== getComisiones_Vigentes ===");
  const resCom = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getComisiones_Vigentes");
  const xmlCom = await resCom.text();
  console.log("Comisiones count:", [...xmlCom.matchAll(/<Comision>/g)].length);

  // Parse each comision
  const comMatches = [...xmlCom.matchAll(/<Comision>([\s\S]*?)<\/Comision>/g)];
  for (const m of comMatches) {
    const block = m[1];
    const id = block.match(/<ID>([^<]+)<\/ID>/)?.[1];
    const nombre = block.match(/<Nombre>([^<]+)<\/Nombre>/)?.[1];
    const tipo = block.match(/<Tipo[^>]*>([^<]+)<\/Tipo>/)?.[1];
    const correo = block.match(/<Correo_Electronico>([^<]*)<\/Correo_Electronico>/)?.[1];
    const intCount = [...block.matchAll(/<Diputado>/g)].length;
    console.log(`[ID ${id}] ${nombre} (${tipo}) - email: ${correo} - integrantes in tag: ${intCount}`);
  }

  console.log("\n=== getDiputados_Vigentes (Full Fields) ===");
  const resDip = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Vigentes");
  const xmlDip = await resDip.text();
  const firstDip = xmlDip.match(/<Diputado>([\s\S]*?)<\/Diputado>/)?.[0];
  console.log("Sample Diputado XML:\n", firstDip);

  console.log("\n=== getDiputados (Full) ===");
  const resAllDip = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados");
  const xmlAllDip = await resAllDip.text();
  console.log("getDiputados snippet:\n", xmlAllDip.slice(0, 1000));
}

inspectCamaraVigentes().catch(console.error);
