async function probeDiputadosDetalle() {
  const dipIds = ["1009", "1012", "1044", "1056"];
  for (const id of dipIds) {
    try {
      const res = await fetch(`https://opendata.camara.cl/wscamaradiputados.asmx/getDiputado_Detalle?prmDiputadoId=${id}`);
      const text = await res.text();
      console.log(`Diputado ${id} detail (length: ${text.length}):\n`, text.slice(0, 800));
    } catch (e) {
      console.log(`Error dip ${id}:`, e.message);
    }
  }

  // Also test getComision_Detalle or similar
  try {
    const resCom = await fetch(`https://opendata.camara.cl/wscamaradiputados.asmx/getComision_Detalle?prmComisionId=411`);
    console.log(`Comision 411 detail:\n`, (await resCom.text()).slice(0, 800));
  } catch (e) {
    console.log("Comision detail error:", e.message);
  }
}

probeDiputadosDetalle().catch(console.error);
