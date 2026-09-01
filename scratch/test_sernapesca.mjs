async function test() {
  const res = await fetch('http://localhost:3000/api/sernapesca/datasets');
  const d = await res.json();
  console.log('SERNAPESCA datasets count:', d.count);
  console.log('Portal:', d.portal);
  console.log('Datasets:');
  d.data?.forEach((it, i) => console.log(`  ${i+1}. ${it.titulo} (${it.categoria}) -> ${it.frecuencia}`));

  const resTopics = await fetch('http://localhost:3000/api/statistics/topics');
  const topics = await resTopics.json();
  const pescaTopic = topics.find(t => t.id === 'pesca-sernapesca');
  console.log('\nSERNAPESCA Topic:', pescaTopic?.nombre);
  console.log('Total indicadores asociados:', pescaTopic?.indicadores?.length);

  const resAll = await fetch('http://localhost:3000/api/statistics/all');
  const all = await resAll.json();
  const pescaInds = all.filter(i => i.categoria === 'pesca-sernapesca');
  console.log('\nIndicadores Pesca & SERNAPESCA en Statistics++:', pescaInds.length);
  pescaInds.forEach((ind, i) => console.log(`  ${i+1}. ${ind.titulo} [${ind.unidad}]`));

  function normalize(t='') { return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }
  const searchTerms = ['salmon', 'salmón', 'sernapesca', 'pesca', 'acuicultura', 'caletas'];
  console.log('\nPruebas de búsqueda con y sin tilde:');
  for (const st of searchTerms) {
    const q = normalize(st);
    const matched = all.filter(ind => {
      const matchTitle = normalize(ind.titulo).includes(q);
      const matchSub = normalize(ind.subtitulo).includes(q);
      const matchDef = normalize(ind.definicion).includes(q);
      const matchSource = normalize(ind.fuente).includes(q);
      return matchTitle || matchSub || matchDef || matchSource;
    });
    console.log(`  [${st}]: ${matched.length} coincidencias`);
  }
}

test();
