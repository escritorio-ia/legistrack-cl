async function inspect() {
  console.log("=== PARSING SENADO COMISIONES.PHP ===");
  const resSenado = await fetch("https://tramitacion.senado.cl/wspublico/comisiones.php");
  const xmlSenado = await resSenado.text();

  // Parse comisiones
  const comisionesSenado = [];
  const comisionMatches = xmlSenado.matchAll(/<comision>([\s\S]*?)<\/comision>/g);
  for (const match of comisionMatches) {
    const block = match[1];
    const id = block.match(/<id>([^<]+)<\/id>/)?.[1]?.trim();
    const nombre = block.match(/<nombre>([^<]+)<\/nombre>/)?.[1]?.trim();
    const tipo = block.match(/<tipo>([^<]+)<\/tipo>/)?.[1]?.trim();
    const email = block.match(/<email>([^<]+)<\/email>/)?.[1]?.trim();

    const integrantes = [];
    const intMatches = block.matchAll(/<integrante>([\s\S]*?)<\/integrante>/g);
    for (const im of intMatches) {
      const iblock = im[1];
      const parlId = iblock.match(/<PARLID>([^<]+)<\/PARLID>/)?.[1]?.trim();
      const apellidoPaterno = iblock.match(/<APELLIDO_PATERNO>([^<]+)<\/APELLIDO_PATERNO>/)?.[1]?.trim();
      const apellidoMaterno = iblock.match(/<APELLIDO_MATERNO>([^<]+)<\/APELLIDO_MATERNO>/)?.[1]?.trim();
      const nom = iblock.match(/<NOMBRE>([^<]+)<\/NOMBRE>/)?.[1]?.trim();
      const funcion = iblock.match(/<FUNCION>([^<]+)<\/FUNCION>/)?.[1]?.trim() || "";
      const cargo = iblock.match(/<CARGO>([^<]+)<\/CARGO>/)?.[1]?.trim() || "Senador/a";
      const parlEmail = iblock.match(/<PARLEMAIL>([^<]+)<\/PARLEMAIL>/)?.[1]?.trim() || "";

      const fullName = [nom, apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ");
      const rol = funcion.toLowerCase().includes("presidente") ? "Presidente de Comisión" : "Miembro Titular";
      integrantes.push({
        id: parlId,
        nombre: fullName,
        rol,
        cargo,
        email: parlEmail
      });
    }

    comisionesSenado.push({
      id,
      nombre,
      tipo,
      email,
      integrantesCount: integrantes.length,
      integrantes
    });
  }

  console.log(`Parsed ${comisionesSenado.length} comisiones del Senado.`);
  comisionesSenado.forEach(c => {
    console.log(`- [ID ${c.id}] ${c.nombre} (${c.tipo}): ${c.integrantes.length} integrantes`);
    c.integrantes.forEach(i => console.log(`    • ${i.rol}: ${i.nombre} (${i.email})`));
  });

  console.log("\n=== PARSING CAMARA DIPUTADOS_VIGENTES ===");
  const resDip = await fetch("https://opendata.camara.cl/wscamaradiputados.asmx/getDiputados_Vigentes");
  const xmlDip = await resDip.text();

  const diputados = [];
  const dipMatches = xmlDip.matchAll(/<Diputado>([\s\S]*?)<\/Diputado>/g);
  for (const dm of dipMatches) {
    const dblock = dm[1];
    const dipId = dblock.match(/<DIPID>([^<]+)<\/DIPID>/)?.[1]?.trim();
    const nombre = dblock.match(/<Nombre>([^<]+)<\/Nombre>/)?.[1]?.trim();
    const nombre2 = dblock.match(/<Nombre2>([^<]*)<\/Nombre2>/)?.[1]?.trim();
    const apPaterno = dblock.match(/<Apellido_Paterno>([^<]+)<\/Apellido_Paterno>/)?.[1]?.trim();
    const apMaterno = dblock.match(/<Apellido_Materno>([^<]+)<\/Apellido_Materno>/)?.[1]?.trim();
    const fullName = [nombre, nombre2, apPaterno, apMaterno].filter(Boolean).join(" ");
    diputados.push({
      id: dipId,
      nombre: fullName
    });
  }
  console.log(`Parsed ${diputados.length} Diputados Vigentes.`);
  console.log("Sample 10 diputados:", diputados.slice(0, 10));
}

inspect().catch(console.error);
