async function testLiveSync() {
  const base = "http://localhost:3000";

  console.log("=== Testing live Senate committee detail from backend ===");
  // Test Gobierno (ID 185)
  const res1 = await fetch(`${base}/api/comision/senado-gobierno`);
  const com1 = await res1.json();
  console.log("Comisión Gobierno (Senado):", com1.nombre);
  console.log("Integrantes count:", com1.integrantes?.length);
  com1.integrantes?.forEach(i => console.log(`  - ${i.rol}: ${i.nombre} (${i.partido})`));

  // Test Constitución (ID 186)
  const res2 = await fetch(`${base}/api/comision/senado-constitucion`);
  const com2 = await res2.json();
  console.log("\nComisión Constitución (Senado):", com2.nombre);
  console.log("Integrantes count:", com2.integrantes?.length);
  com2.integrantes?.forEach(i => console.log(`  - ${i.rol}: ${i.nombre} (${i.partido})`));

  // Test Autocomplete with current senators
  console.log("\n=== Testing Autocomplete with current senators from wspublico/comisiones.php ===");
  const resAuto = await fetch(`${base}/api/comisiones/autocomplete?q=Astudillo`);
  const autoData = await resAuto.json();
  console.log("Search 'Astudillo':", JSON.stringify(autoData.integrantes, null, 2));

  const resAuto2 = await fetch(`${base}/api/comisiones/autocomplete?q=Vanessa%20Kaiser`);
  const autoData2 = await resAuto2.json();
  console.log("Search 'Vanessa Kaiser':", JSON.stringify(autoData2.integrantes, null, 2));
}

testLiveSync().catch(console.error);
