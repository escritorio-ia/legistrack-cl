/**
 * Identidad de las personas entre fuentes (informe oficial, transcripción, registro).
 * La persona se identifica por su NOMBRE, nunca por su cargo: los cargos cambian en el tiempo
 * (quien era Subsecretario puede ser Ministro después, y el cargo lo ocupa otra persona).
 * Por eso cada persona guarda un historial de cargos con las fechas en que se le vio con cada uno,
 * y una mención solo por cargo ("el Subsecretario") se resuelve únicamente dentro de la misma sesión.
 */
export interface ObservacionPersona {
  nombre: string;
  cargo?: string;
  institucion?: string;
  categoria?: string;
  fecha?: string;           // AAAA-MM-DD
  comision?: string;
  contexto?: string;        // sesión o documento (p. ej. videoId): para resolver menciones solo por cargo
  texto?: string;
  videoId?: string;
  segundos?: number | null;
  fuente?: string;
}
export interface CargoPersona { cargo: string; institucion: string; desde: string | null; hasta: string | null; veces: number }
export interface Persona {
  id: string;
  nombre: string;
  variantes: string[];
  categoria: string;
  sinNombre?: boolean;      // solo se conoce el cargo (no se identifica a la persona)
  cargos: CargoPersona[];
  intervenciones: { comision: string; fecha: string; cargo: string; texto: string; videoId?: string; segundos?: number | null; fuente: string }[];
}

const quitarTildes = (s: string) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
const TRATAMIENTOS = /\b(el|la|los|las|senor|senora|senorita|don|dona|sr|sra|srta|h|hon|honorable|honorables|sen|senador|senadora|dip|diputado|diputada|presidente|presidenta|ministro|ministra|subsecretario|subsecretaria|doctor|doctora|dr|dra|abogado|abogada|profesor|profesora)\b\.?/g;
const VACIAS = new Set(["de", "del", "la", "las", "los", "y", "e", "von", "van", "da", "do", "dos", "san"]);
/** Palabras que indican que el "nombre" es en realidad un cargo o institución. */
const DE_CARGO = /\b(ministerio|ministro|ministra|subsecretari[oa]|servicio|direcci[oó]n|director|directora|jef[ea]|asesor|asesora|secretari[oa]|presidente|presidenta|gerente|representante|investigador|investigadora|biblioteca|instituto|asociaci[oó]n|sociedad|comit[eé]|ejecutivo|gobierno|superintendente|fiscal|contralor|alcalde|alcaldesa|intendente|delegad[oa]|coordinador|coordinadora|encargad[oa]|profesional|abogad[oa] secretari[oa]|orador no identificado)\b/i;

/** Palabras del nombre propio, sin tratamientos ni tildes. */
export function palabrasNombre(nombre: string): string[] {
  return quitarTildes(nombre).toLowerCase().replace(/[^a-zñ\s.]/g, " ").replace(TRATAMIENTOS, " ")
    .split(/\s+/).map((w) => w.replace(/\./g, "")).filter((w) => w.length >= 2 && !VACIAS.has(w));
}

/**
 * ¿El texto es solo un cargo (no trae nombre propio)? "El Subsecretario", "Ministro de Hacienda" o "Jefa del
 * Departamento de Regulación" son cargos; "Subsecretario Francesco Venezian" trae nombre. Una palabra con mayúscula
 * cuenta como nombre propio solo si no viene después de "de/del/la..." (en ese caso es parte de la institución).
 */
export function esSoloCargo(nombre: string): boolean {
  const t = String(nombre || "").trim().replace(/^(el|la|los|las)\s+/i, "");
  const w = t.split(/\s+/).filter(Boolean);
  if (!w.length || !DE_CARGO.test(quitarTildes(w[0]))) return false;
  for (let k = 1; k < w.length; k++) {
    const prev = w[k - 1].toLowerCase();
    if (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(w[k]) && !["de", "del", "la", "las", "los", "y", "e"].includes(prev) && !DE_CARGO.test(quitarTildes(w[k]))) return false;
  }
  return true;
}

const PARL = (c?: string) => c === "PARL";
/** ¿Dos nombres corresponden a la misma persona? (por nombre; las categorías PARL y no PARL nunca se unen). */
export function mismaPersona(a: { nombre: string; categoria?: string }, b: { nombre: string; categoria?: string }): boolean {
  if (a.categoria && b.categoria && a.categoria !== "ND" && b.categoria !== "ND" && PARL(a.categoria) !== PARL(b.categoria)) return false;
  const A = palabrasNombre(a.nombre), B = palabrasNombre(b.nombre);
  if (!A.length || !B.length) return false;
  const [corta, larga] = A.length <= B.length ? [A, B] : [B, A];
  if (!corta.every((w) => larga.includes(w))) return false;
  // Con una sola palabra, solo si es un apellido (no la primera palabra de un nombre completo) y tiene 4 letras o más.
  if (corta.length === 1) return corta[0].length >= 4 && larga.indexOf(corta[0]) > 0;
  return true;
}

const claveCargo = (c: string, i: string) => `${quitarTildes(c).toLowerCase().trim()}|${quitarTildes(i).toLowerCase().trim()}`;
const slug = (s: string) => quitarTildes(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Une las observaciones en personas. Las menciones solo por cargo se asignan a quien tenía ese cargo
 * en la MISMA sesión o documento; si no hay a quién, quedan como "persona sin nombre" de esa sesión.
 * Un apellido suelto que podría ser de más de una persona no se une a ninguna.
 */
export function unirPersonas(obs: ObservacionPersona[]): Persona[] {
  const personas: Persona[] = [];
  const conNombre = obs.filter((o) => o.nombre && !esSoloCargo(o.nombre) && !/no identificad/i.test(o.nombre));
  const soloCargo = obs.filter((o) => o.nombre && esSoloCargo(o.nombre));
  // Primero los nombres más completos, para que los apellidos sueltos se unan a ellos.
  conNombre.sort((x, y) => palabrasNombre(y.nombre).length - palabrasNombre(x.nombre).length);
  const agregar = (p: Persona, o: ObservacionPersona) => {
    if (!p.variantes.includes(o.nombre)) p.variantes.push(o.nombre);
    if (palabrasNombre(o.nombre).length > palabrasNombre(p.nombre).length) p.nombre = o.nombre;
    if ((p.categoria === "ND" || !p.categoria) && o.categoria) p.categoria = o.categoria;
    if (o.cargo || o.institucion) {
      const k = claveCargo(o.cargo || "", o.institucion || "");
      let c = p.cargos.find((x) => claveCargo(x.cargo, x.institucion) === k);
      if (!c) { c = { cargo: o.cargo || "", institucion: o.institucion || "", desde: null, hasta: null, veces: 0 }; p.cargos.push(c); }
      c.veces++;
      if (o.fecha) { if (!c.desde || o.fecha < c.desde) c.desde = o.fecha; if (!c.hasta || o.fecha > c.hasta) c.hasta = o.fecha; }
    }
    if (o.texto) p.intervenciones.push({ comision: o.comision || "", fecha: o.fecha || "", cargo: [o.cargo, o.institucion].filter(Boolean).join(", "), texto: o.texto, videoId: o.videoId, segundos: o.segundos ?? null, fuente: o.fuente || "" });
  };
  for (const o of conNombre) {
    const candidatos = personas.filter((p) => !p.sinNombre && mismaPersona({ nombre: p.nombre, categoria: p.categoria }, o));
    if (candidatos.length === 1) { agregar(candidatos[0], o); continue; }
    if (candidatos.length > 1 && palabrasNombre(o.nombre).length === 1) {
      // Apellido ambiguo: se registra aparte y marcado como tal en su variante.
      const p: Persona = { id: `${slug(o.nombre)}-${personas.length}`, nombre: o.nombre, variantes: [], categoria: o.categoria || "ND", cargos: [], intervenciones: [] };
      agregar(p, o); personas.push(p); continue;
    }
    if (candidatos.length > 1) { agregar(candidatos[0], o); continue; }
    const p: Persona = { id: slug(o.nombre) || `p${personas.length}`, nombre: o.nombre, variantes: [], categoria: o.categoria || "ND", cargos: [], intervenciones: [] };
    if (personas.some((x) => x.id === p.id)) p.id = `${p.id}-${personas.length}`;
    agregar(p, o); personas.push(p);
  }
  for (const o of soloCargo) {
    const cargo = quitarTildes(`${o.cargo || ""} ${o.nombre}`).toLowerCase();
    // Quien en la misma sesión o documento tenía un cargo que coincide.
    const mismo = personas.filter((p) => !p.sinNombre && p.intervenciones.some((i) => o.contexto && i.videoId === o.contexto) &&
      p.cargos.some((c) => { const k = quitarTildes(`${c.cargo} ${c.institucion}`).toLowerCase(); const w = palabrasCargo(cargo); return w.length > 0 && w.every((x) => k.includes(x)); }));
    if (mismo.length === 1) { agregar(mismo[0], { ...o, nombre: mismo[0].nombre, cargo: o.cargo || o.nombre }); continue; }
    const id = `cargo-${slug(o.nombre)}-${slug(o.contexto || o.fecha || "")}`;
    let p = personas.find((x) => x.id === id);
    if (!p) { p = { id, nombre: o.nombre, variantes: [], categoria: o.categoria || "ND", sinNombre: true, cargos: [], intervenciones: [] }; personas.push(p); }
    agregar(p, { ...o, cargo: o.cargo || o.nombre });
  }
  for (const p of personas) {
    p.cargos.sort((x, y) => String(x.desde || "").localeCompare(String(y.desde || "")));
    p.intervenciones.sort((x, y) => x.fecha.localeCompare(y.fecha) || (x.segundos ?? 0) - (y.segundos ?? 0));
  }
  return personas;
}

function palabrasCargo(s: string): string[] {
  return s.replace(/[^a-z\s]/g, " ").split(/\s+/).filter((w) => w.length >= 5 && !["senor", "senora"].includes(w));
}

/** Cargo que tenía la persona en una fecha (el registrado más cercano a esa fecha). */
export function cargoEnFecha(p: Persona, fecha: string): CargoPersona | null {
  if (!p.cargos.length) return null;
  const dentro = p.cargos.find((c) => c.desde && c.hasta && c.desde <= fecha && fecha <= c.hasta);
  if (dentro) return dentro;
  return [...p.cargos].sort((a, b) => Math.abs(Date.parse(a.desde || fecha) - Date.parse(fecha)) - Math.abs(Date.parse(b.desde || fecha) - Date.parse(fecha)))[0];
}

export function buscarPersona(personas: Persona[], nombre: string, categoria?: string): Persona | null {
  const c = personas.filter((p) => !p.sinNombre && mismaPersona({ nombre: p.nombre, categoria: p.categoria }, { nombre, categoria }));
  return c.length === 1 ? c[0] : null;
}
