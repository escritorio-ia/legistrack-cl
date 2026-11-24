// Aplica una instrucción de modificación de un proyecto de ley ("Intercálase…", "Reemplázase…", "Suprímese…",
// "Incorpórase… luego del punto…") al texto vigente de un artículo, sin IA: solo si la instrucción se puede ubicar
// con exactitud en el texto oficial. Si hay ambigüedad o no se encuentra, se informa y no se aplica.
export type Parte = { t: string; tipo: "igual" | "ins" | "del" };
export type ResultadoAplicacion = { ok: true; partes: Parte[] } | { ok: false; motivo: string };

const ORDINALES = ["primero", "segundo", "tercero", "cuarto", "quinto", "sexto", "septimo", "octavo", "noveno", "decimo"];
const sinTildes = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const citas = (s: string) => Array.from(s.matchAll(/["“”«»]([^"“”«»]+)["“”«»]/g)).map((m) => m[1]);
const ocurrencias = (texto: string, buscado: string) => {
  const out: number[] = [];
  if (!buscado) return out;
  for (let i = texto.indexOf(buscado); i >= 0; i = texto.indexOf(buscado, i + 1)) out.push(i);
  return out;
};

/** Divide el artículo en párrafos (incisos) y ubica el inciso o numeral que nombra la instrucción. */
function ubicarAlcance(texto: string, instr: string): { ini: number; fin: number } {
  const parrafos: { ini: number; fin: number; t: string }[] = [];
  let pos = 0;
  for (const linea of texto.split("\n")) {
    if (linea.trim()) parrafos.push({ ini: pos, fin: pos + linea.length, t: linea });
    pos += linea.length + 1;
  }
  const todo = { ini: 0, fin: texto.length };
  if (!parrafos.length) return todo;
  const i = sinTildes(instr);
  const num = i.match(/\bnumeral\s+(\d+)/);
  if (num) {
    const p = parrafos.find((x) => new RegExp(`^\\s*${num[1]}\\s*[.)°º-]`).test(x.t));
    if (p) return p;
  }
  const inc = i.match(/\binciso\s+(primero|segundo|tercero|cuarto|quinto|sexto|septimo|octavo|noveno|decimo|final)\b/);
  if (inc) {
    const k = inc[1] === "final" ? parrafos.length - 1 : ORDINALES.indexOf(inc[1]);
    if (parrafos[k]) return parrafos[k];
  }
  return todo;
}

export function aplicarModificacion(textoArticulo: string, instruccion: string): ResultadoAplicacion {
  const texto = String(textoArticulo || "");
  const instr = String(instruccion || "").replace(/\s+/g, " ").trim();
  const i = sinTildes(instr);
  const q = citas(instr);
  if (!texto || !instr) return { ok: false, motivo: "Falta el texto vigente o la instrucción." };
  const alc = ubicarAlcance(texto, instr);
  const tramo = texto.slice(alc.ini, alc.fin);
  const armar = (ini: number, fin: number, ins: string, del = ""): ResultadoAplicacion => {
    const partes: Parte[] = [{ t: texto.slice(0, ini), tipo: "igual" }];
    if (del) partes.push({ t: del, tipo: "del" });
    if (ins) partes.push({ t: ins, tipo: "ins" });
    partes.push({ t: texto.slice(fin), tipo: "igual" });
    return { ok: true, partes: partes.filter((p) => p.t) };
  };
  const unica = (buscado: string): number | string => {
    const o = ocurrencias(tramo, buscado);
    if (o.length === 0) return `No se encontró "${buscado}" en el texto vigente${alc.ini || alc.fin < texto.length ? " del inciso o numeral indicado" : ""}.`;
    if (o.length > 1) return `"${buscado}" aparece ${o.length} veces: no se puede saber con exactitud dónde va el cambio.`;
    return alc.ini + o[0];
  };

  // Intercálase / agrégase … entre las palabras "A" y "B" … "X"
  if (/\bentre\b/.test(i) && q.length >= 3 && /intercal|agreg|incorpor|anad/.test(i)) {
    const [a, b] = q;
    const x = q[q.length - 1];
    const pa = unica(a);
    if (typeof pa === "string") return { ok: false, motivo: pa };
    const finA = pa + a.length;
    const pb = texto.indexOf(b, finA);
    if (pb < 0 || pb - finA > 3) return { ok: false, motivo: `"${a}" y "${b}" no aparecen seguidas en el texto vigente.` };
    // Lo que había entre A y B (normalmente un espacio) se reemplaza por la frase nueva, con un espacio antes de B.
    const inserto = (/^[,;:.)]/.test(x.trim()) ? "" : " ") + x.trim() + " ";
    return { ok: true, partes: [
      { t: texto.slice(0, finA), tipo: "igual" as const }, { t: inserto, tipo: "ins" as const }, { t: texto.slice(pb), tipo: "igual" as const },
    ].filter((p) => p.t) };
  }

  // Reemplázase / sustitúyese "A" por "X"
  if (/reemplaz|sustitu/.test(i) && q.length >= 2 && /\bpor\b/.test(i)) {
    const [a, x] = [q[0], q[q.length - 1]];
    const pa = unica(a);
    if (typeof pa === "string") return { ok: false, motivo: pa };
    return armar(pa, pa + a.length, x, a);
  }

  // Suprímese / elimínase "A"
  if (/suprim|elimin/.test(i) && q.length >= 1) {
    const a = q[0];
    const pa = unica(a);
    if (typeof pa === "string") return { ok: false, motivo: pa };
    return armar(pa, pa + a.length, "", a);
  }

  // Incorpórase / agrégase … luego del punto y seguido / al final / luego del punto aparte … "X"
  if (/incorpor|agreg|anad|intercal/.test(i) && q.length >= 1) {
    const x = q[q.length - 1].trim();
    if (/punto (y )?seguido/.test(i)) {
      const puntos = Array.from(tramo.matchAll(/\.\s+(?=[A-ZÁÉÍÓÚÑ])/g));
      if (puntos.length !== 1) return { ok: false, motivo: puntos.length ? `El inciso tiene ${puntos.length} puntos seguidos: no se puede saber con exactitud después de cuál va la oración.` : "El inciso no tiene un punto seguido." };
      const p = alc.ini + (puntos[0].index || 0) + 1;
      return { ok: true, partes: [{ t: texto.slice(0, p), tipo: "igual" }, { t: ` ${x}.`, tipo: "ins" }, { t: texto.slice(p), tipo: "igual" }].filter((y) => y.t) as Parte[] };
    }
    if (/punto (y )?aparte|al final|a continuacion|final del/.test(i) && (alc.ini > 0 || alc.fin < texto.length || /articulo/.test(i))) {
      const p = alc.fin;
      return { ok: true, partes: [{ t: texto.slice(0, p), tipo: "igual" }, { t: ` ${x}`, tipo: "ins" }, { t: texto.slice(p), tipo: "igual" }].filter((y) => y.t) as Parte[] };
    }
  }
  return { ok: false, motivo: "Este tipo de instrucción no se aplica automáticamente." };
}
