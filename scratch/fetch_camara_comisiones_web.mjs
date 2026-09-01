async function fetchCamaraWeb() {
  const urls = [
    "https://www.camara.cl/legislacion/comisiones/comisiones.aspx",
    "https://www.camara.cl/legislacion/comisiones/",
    "https://www.camara.cl/camara/comisiones.aspx",
    "https://www.camara.cl/transparencia/comisiones.aspx",
    "https://opendata.camara.cl/wscamaradiputados.asmx"
  ];

  for (const u of urls) {
    try {
      console.log(`\nFetching ${u}...`);
      const res = await fetch(u, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Length: ${text.length}`);
      
      // Look for commission links, names, IDs, prmId
      const matches = [...text.matchAll(/href="([^"]*(?:comision|comisiones|detalle)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];
      console.log(`Found ${matches.length} matching links.`);
      for (const m of matches.slice(0, 15)) {
        const link = m[1];
        const title = m[2].replace(/<[^>]+>/g, "").trim();
        if (title.length > 3) {
          console.log(`  - [${title}] -> ${link}`);
        }
      }
    } catch (e) {
      console.error(`Error fetching ${u}:`, e.message);
    }
  }
}

fetchCamaraWeb();
