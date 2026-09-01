async function test() {
  function normalizeSearchText(text = '') {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  const res = await fetch('http://localhost:3000/api/statistics/all');
  const indicators = await res.json();

  const resTopics = await fetch('http://localhost:3000/api/statistics/topics');
  const topicsList = await resTopics.json();
  const topicsMap = {};
  topicsList.forEach(t => { topicsMap[t.id] = t; });

  const testWords = ['educacion', 'energia', 'mineria', 'victimizacion', 'homicidio', 'araucania'];

  for (const term of testWords) {
    const q = normalizeSearchText(term);
    const matched = indicators.filter(ind => {
      const matchTitle = normalizeSearchText(ind.titulo).includes(q);
      const matchSub = normalizeSearchText(ind.subtitulo).includes(q);
      const matchDef = normalizeSearchText(ind.definicion).includes(q);
      const matchSource = normalizeSearchText(ind.fuente).includes(q);
      const matchTopic = normalizeSearchText(topicsMap[ind.categoria]?.nombre).includes(q);
      const matchHitos = ind.hitosLegislativos?.some(h =>
        normalizeSearchText(h.ley).includes(q) || normalizeSearchText(h.descripcion).includes(q)
      );
      return matchTitle || matchSub || matchDef || matchSource || matchTopic || matchHitos;
    });

    console.log(`Búsqueda sin tilde "${term}": ${matched.length} indicadores`);
    matched.slice(0, 2).forEach(i => console.log(`   - ${i.titulo}`));
  }
}

test();
