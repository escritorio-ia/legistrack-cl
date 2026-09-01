async function audit() {
  const endpoints = [
    { url: 'http://localhost:3000/api/statistics/topics', label: 'Tópicos Estadísticos' },
    { url: 'http://localhost:3000/api/statistics/all', label: 'Todos los Indicadores Statistics++' },
    { url: 'http://localhost:3000/api/mineduc/datasets', label: 'Bases de Datos MINEDUC' },
    { url: 'http://localhost:3000/api/cead/datasets', label: 'Bases de Datos CEAD' },
    { url: 'http://localhost:3000/api/ine/datasets', label: 'Bases de Datos INE' },
    { url: 'http://localhost:3000/api/sernapesca/datasets', label: 'Bases de Datos SERNAPESCA' },
    { url: 'http://localhost:3000/api/global-search?q=educacion', label: 'Búsqueda Global (sin tilde)' },
    { url: 'http://localhost:3000/api/proyectos?query=mineria', label: 'Proyectos de Ley (sin tilde)' },
    { url: 'http://localhost:3000/api/derecho-comparado?q=hidrogeno', label: 'Derecho Comparado IA (sin tilde)' }
  ];

  console.log('=== AUDITORÍA GENERAL DE SERVICIOS Y RUTAS LEGIS TRACK ===\n');

  for (const ep of endpoints) {
    const t0 = Date.now();
    try {
      const res = await fetch(ep.url);
      const latency = Date.now() - t0;
      const ok = res.status === 200;
      const data = await res.json();
      
      let summary = '';
      if (Array.isArray(data)) {
        summary = `${data.length} elementos`;
      } else if (data.count !== undefined) {
        summary = `${data.count} datasets`;
      } else if (data.resultados !== undefined) {
        summary = `${data.resultados.length} resultados`;
      } else if (data.proyectos !== undefined) {
        summary = `${data.proyectos.length} proys, ${data.comisiones?.length} coms`;
      } else if (data.total !== undefined) {
        summary = `${data.total} total`;
      } else {
        summary = 'OK';
      }

      console.log(`[${ok ? 'OK' : 'FAIL'} ${res.status}] ${ep.label.padEnd(38)} (${latency}ms) -> ${summary}`);
    } catch (err) {
      console.log(`[ERROR] ${ep.label.padEnd(38)} -> ${err.message}`);
    }
  }
}

audit();
