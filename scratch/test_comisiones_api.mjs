async function testApi() {
  const ids = ["cd-constitucion", "cd-pesca", "cd-hacienda", "cd-desarrollo-social", "senado-constitucion"];
  for (const id of ids) {
    try {
      const res = await fetch(`http://localhost:3000/api/comision/${id}`);
      const data = await res.json();
      console.log(`\n=== COMISION: ${data.nombre} (${id}) ===`);
      console.log(`Periodo: ${data.periodo}`);
      console.log(`Official URL: ${data.officialUrl}`);
      console.log(`Total Integrantes: ${data.integrantes?.length}`);
      const pres = data.integrantes?.find(i => i.rol?.toLowerCase().includes("president")) || data.integrantes?.[0];
      console.log(`Preside: ${pres?.nombre} (${pres?.partido}) - Rol: ${pres?.rol}`);
      console.log(`Secretario: ${data.proximaSesion?.secretario}`);
      console.log(`Sample Integrantes (first 3):`, data.integrantes?.slice(0, 3).map(i => `${i.nombre} [${i.partido}] - ${i.email}`));
    } catch (e) {
      console.error(`Error fetching ${id}:`, e.message);
    }
  }
}

testApi().catch(console.error);
