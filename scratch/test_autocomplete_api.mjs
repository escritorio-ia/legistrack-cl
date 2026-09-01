async function test() {
  const base = "http://localhost:3000";
  
  console.log("=== Testing /api/comisiones/autocomplete ===");
  const res1 = await fetch(`${base}/api/comisiones/autocomplete?q=calisto`);
  const data1 = await res1.json();
  console.log("Search 'calisto':", JSON.stringify(data1, null, 2));

  const res2 = await fetch(`${base}/api/comisiones/autocomplete?q=litio`);
  const data2 = await res2.json();
  console.log("Search 'litio':", JSON.stringify(data2, null, 2));

  const res3 = await fetch(`${base}/api/comisiones/autocomplete?q=senado`);
  const data3 = await res3.json();
  console.log("Search 'senado' count comisiones:", data3.comisiones.length);

  console.log("\n=== Testing /api/comision/:id ===");
  const resCom1 = await fetch(`${base}/api/comision/constitucion`);
  const com1 = await resCom1.json();
  console.log("Comision 'constitucion' integrantes count:", com1.integrantes?.length);
  console.log("Presidente:", com1.integrantes?.[0]?.nombre, "(", com1.integrantes?.[0]?.partido, ")");

  const resCom2 = await fetch(`${base}/api/comision/senado-seguridad-publica`);
  const com2 = await resCom2.json();
  console.log("Comision 'senado-seguridad-publica' integrantes count:", com2.integrantes?.length);
  console.log("Presidente:", com2.integrantes?.[0]?.nombre, "(", com2.integrantes?.[0]?.partido, ")");
}

test().catch(console.error);
