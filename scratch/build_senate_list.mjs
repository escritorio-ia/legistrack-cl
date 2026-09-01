async function buildSenateList() {
  const res = await fetch("https://tramitacion.senado.cl/wspublico/comisiones.php");
  const xml = await res.text();

  const comisiones = [];
  const matches = xml.matchAll(/<comision>([\s\S]*?)<\/comision>/g);
  for (const m of matches) {
    const block = m[1];
    const id = block.match(/<id>([^<]+)<\/id>/)?.[1]?.trim();
    const rawNombre = block.match(/<nombre>([^<]+)<\/nombre>/)?.[1]?.trim();
    const tipo = block.match(/<tipo>([^<]+)<\/tipo>/)?.[1]?.trim();
    const email = block.match(/<email>([^<]+)<\/email>/)?.[1]?.trim() || "";

    const cleanNombre = rawNombre.replace(/^de\s+/i, "Comisión de ");

    const integrantes = [];
    const intMatches = block.matchAll(/<integrante>([\s\S]*?)<\/integrante>/g);
    for (const im of intMatches) {
      const iblock = im[1];
      const parlId = iblock.match(/<PARLID>([^<]+)<\/PARLID>/)?.[1]?.trim();
      const apPaterno = iblock.match(/<APELLIDO_PATERNO>([^<]+)<\/APELLIDO_PATERNO>/)?.[1]?.trim() || "";
      const apMaterno = iblock.match(/<APELLIDO_MATERNO>([^<]+)<\/APELLIDO_MATERNO>/)?.[1]?.trim() || "";
      const nom = iblock.match(/<NOMBRE>([^<]+)<\/NOMBRE>/)?.[1]?.trim() || "";
      const funcion = iblock.match(/<FUNCION>([^<]+)<\/FUNCION>/)?.[1]?.trim() || "";
      const cargo = iblock.match(/<CARGO>([^<]+)<\/CARGO>/)?.[1]?.trim() || "Senador/a";
      const parlEmail = iblock.match(/<PARLEMAIL>([^<]+)<\/PARLEMAIL>/)?.[1]?.trim() || "";

      const fullName = [nom, apPaterno, apMaterno].filter(Boolean).join(" ");
      const rol = funcion.toLowerCase().includes("presidente") ? "Presidente de Comisión" : "Miembro Titular";

      // Infer party/bancada based on well known senators or email domain
      let partido = "Senado";
      if (fullName.includes("Vodanovic") || fullName.includes("De Urresti") || fullName.includes("Castro González") || fullName.includes("Espinoza Sandoval") || fullName.includes("Allende Bussi") || fullName.includes("Saavedra Chandía") || fullName.includes("Insulza")) partido = "PS";
      else if (fullName.includes("Coloma") || fullName.includes("Ebensperger") || fullName.includes("Macaya") || fullName.includes("Moreira") || fullName.includes("Gahona") || fullName.includes("Durana") || fullName.includes("Sanhueza") || fullName.includes("Sandoval") || fullName.includes("Van Rysselberghe")) partido = "UDI";
      else if (fullName.includes("Galilea") || fullName.includes("Ossandón") || fullName.includes("Chahuán") || fullName.includes("García Ruminot") || fullName.includes("Núñez Urrutia") || fullName.includes("Kuschel") || fullName.includes("Gatica") || fullName.includes("Prohens")) partido = "RN";
      else if (fullName.includes("Araya Guerrero") || fullName.includes("Quintana") || fullName.includes("Carvajal") || fullName.includes("Lagos Weber") || fullName.includes("Ordenes")) partido = "PPD";
      else if (fullName.includes("Núñez Arancibia") || fullName.includes("Pascual Grau") || fullName.includes("Cariola")) partido = "PC";
      else if (fullName.includes("Walker") || fullName.includes("Rincón")) partido = "Demócratas";
      else if (fullName.includes("Cruz-Coke") || fullName.includes("Kast")) partido = "Evópoli";
      else if (fullName.includes("Provoste") || fullName.includes("Flores García") || fullName.includes("Huenchumilla")) partido = "DC";
      else if (fullName.includes("Campillai") || fullName.includes("Bianchi Retamales") || fullName.includes("Sepúlveda Orbenes") || fullName.includes("Kusanovic") || fullName.includes("Pugh") || fullName.includes("Lee")) partido = "IND";
      else if (fullName.includes("Edwards") || fullName.includes("Aravena") || fullName.includes("Kaiser")) partido = "PREP";
      else if (fullName.includes("Sánchez Muñoz") || fullName.includes("Ibáñez")) partido = "FA";
      else if (fullName.includes("Velásquez")) partido = "FRVS";

      integrantes.push({
        nombre: fullName,
        partido,
        rol,
        email: parlEmail,
        camara: "Senado de la República"
      });
    }

    comisiones.push({
      id,
      nombre: cleanNombre,
      email,
      tipo,
      integrantes
    });
  }

  console.log("Senate commissions map:");
  console.log(JSON.stringify(comisiones, null, 2));
}

buildSenateList().catch(console.error);
