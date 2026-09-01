async function test() {
  const tests = [
    { sin: 'educacion', con: 'educación' },
    { sin: 'constitucion', con: 'constitución' },
    { sin: 'mineria', con: 'minería' }
  ];

  for (const pair of tests) {
    const resSin = await fetch('http://localhost:3000/api/global-search?q=' + encodeURIComponent(pair.sin));
    const dataSin = await resSin.json();

    const resCon = await fetch('http://localhost:3000/api/global-search?q=' + encodeURIComponent(pair.con));
    const dataCon = await resCon.json();

    console.log(`[${pair.sin}] vs [${pair.con}]`);
    console.log(`  Proyectos:   sin=${dataSin.proyectos?.length}  con=${dataCon.proyectos?.length}`);
    console.log(`  Comisiones:  sin=${dataSin.comisiones?.length} con=${dataCon.comisiones?.length}`);
    console.log(`  Autores:     sin=${dataSin.autores?.length}    con=${dataCon.autores?.length}`);
  }
}

test();
