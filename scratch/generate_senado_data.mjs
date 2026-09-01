async function generateOfficialSenadoData() {
  const res = await fetch("https://tramitacion.senado.cl/wspublico/comisiones.php");
  const xml = await res.text();

  const comisiones = [];
  const matches = xml.matchAll(/<comision>([\s\S]*?)<\/comision>/g);
  for (const m of matches) {
    const block = m[1];
    const id = block.match(/<id>([^<]+)<\/id>/)?.[1]?.trim();
    const nombre = block.match(/<nombre>([^<]+)<\/nombre>/)?.[1]?.trim();
    const tipo = block.match(/<tipo>([^<]+)<\/tipo>/)?.[1]?.trim();
    const email = block.match(/<email>([^<]+)<\/email>/)?.[1]?.trim() || "";

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

      integrantes.push({
        id: parlId,
        nombre: fullName,
        partido: "Senado",
        rol,
        email: parlEmail
      });
    }

    comisiones.push({ id, nombre, tipo, email, integrantes });
  }

  console.log("Found", comisiones.length, "comisiones in wspublico/comisiones.php");
  
  // Let's print out the exact structure for each commission
  for (const c of comisiones) {
    console.log(`\n// ${c.nombre} (ID: ${c.id})`);
    console.log(JSON.stringify(c.integrantes, null, 2));
  }
}

generateOfficialSenadoData().catch(console.error);
