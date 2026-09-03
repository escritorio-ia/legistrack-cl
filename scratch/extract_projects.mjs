import fs from "fs";

async function extract() {
  const url = "https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LegisTrackCL/1.0)" }
  });
  const html = await res.text();

  const decodeEntities = (s) =>
    s
      .replace(/&nbsp;/gi, " ")
      .replace(/&deg;/gi, "°")
      .replace(/&ordm;/gi, "°")
      .replace(/&amp;/gi, "&")
      .replace(/&aacute;/gi, "á")
      .replace(/&eacute;/gi, "é")
      .replace(/&iacute;/gi, "í")
      .replace(/&oacute;/gi, "ó")
      .replace(/&uacute;/gi, "ú")
      .replace(/&ntilde;/gi, "ñ")
      .replace(/&Aacute;/g, "Á")
      .replace(/&Eacute;/g, "É")
      .replace(/&Iacute;/g, "Í")
      .replace(/&Oacute;/g, "Ó")
      .replace(/&Uacute;/g, "Ú")
      .replace(/&Ntilde;/g, "Ñ")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'");

  const stripTags = (s) =>
    decodeEntities(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

  const results = [];
  const seen = new Set();
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }
    if (cells.length < 4) continue;

    const boletinIdx = cells.findIndex(c => /^\d{4,6}-\d{1,2}$/.test(c));
    if (boletinIdx === -1) continue;

    const boletinRaw = cells[boletinIdx];
    if (seen.has(boletinRaw)) continue;
    seen.add(boletinRaw);

    results.push({
      boletin: boletinRaw,
      titulo: decodeEntities(cells[boletinIdx + 1] || "Proyecto de ley"),
      ley: cells[boletinIdx + 2] || "",
      estado: cells[boletinIdx + 3] || "En tramitación",
      fecha: cells[boletinIdx + 4] || ""
    });
  }

  console.log("Extracted total items:", results.length);
  fs.writeFileSync("scratch/real_projects_sample.json", JSON.stringify(results.slice(0, 10), null, 2));
}

extract();
