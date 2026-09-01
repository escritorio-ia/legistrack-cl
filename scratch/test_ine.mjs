async function test() {
  const res = await fetch('http://localhost:3000/api/ine/datasets');
  const d = await res.json();
  console.log('INE datasets count:', d.count);
  console.log('Portal:', d.portal);
  console.log('Datasets:');
  d.data?.forEach((it, i) => console.log(`  ${i+1}. ${it.titulo} (${it.tema}) -> ${it.periodicidad}`));

  const resTopics = await fetch('http://localhost:3000/api/statistics/topics');
  const topics = await resTopics.json();
  const ineTopic = topics.find(t => t.id === 'ine-estadisticas');
  console.log('\nINE Topic:', ineTopic?.nombre);
  console.log('Total indicadores asociados:', ineTopic?.indicadores?.length);

  const resAll = await fetch('http://localhost:3000/api/statistics/all');
  const all = await resAll.json();
  const ineInds = all.filter(i => i.categoria === 'ine-estadisticas');
  console.log('\nIndicadores INE en Statistics++:', ineInds.length);
  ineInds.forEach((ind, i) => console.log(`  ${i+1}. ${ind.titulo} [${ind.unidad}]`));
}

test();
