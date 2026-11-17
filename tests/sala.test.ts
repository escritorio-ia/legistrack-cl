import { test } from "node:test";
import assert from "node:assert/strict";
import { parsearTablaSenado, parsearSesionesCamara, parsearVotacionesCamara, asignarVotaciones, contarAsistencia, fechaLargaAISO, boletinDeDescripcion, votacionesPorBoletin, momentoSesion } from "../src/utils/sala";

// Estructura real de web-back.senado.cl/api/weekly_table (17-11-2026), recortada.
const tabla = { data: [
  { ID_SESION: 10335, NUMERO_SESION: "80", FECHA: "Lunes 16 de Noviembre de 2026", HORA_INICIO: "17:17", HORA_TERMINO: "22:05", TIPO_SESION: "Especial",
    TABLA: [
      { POSICION: 2, PARTE_SESION: "ORDEN DEL DÍA", ENCABEZADO: "Mayoría Simple", MATERIA: "Proyecto ... (Boletín N° 18885-05).", BOLETIN: "18885-05", LINK_PROYECTO: "https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=18885-05" },
      { POSICION: 1, PARTE_SESION: "ORDEN DEL DÍA", ENCABEZADO: "Mayoría Simple", MATERIA: "Proyecto ... (Boletín N° 18860-15).", BOLETIN: "18860-15", LINK_PROYECTO: "https://malicioso.example/x" },
    ] },
  { ID_SESION: 10323, NUMERO_SESION: "81", FECHA: "Martes 17 de Noviembre de 2026", HORA_INICIO: "10:17", HORA_TERMINO: "14:00", TIPO_SESION: "Especial",
    TABLA: [{ POSICION: 1, PARTE_SESION: "ORDEN DEL DÍA", ENCABEZADO: "Mayoría Simple", MATERIA: "Presupuestos 2027 (Bol. N° 18.702-05)", BOLETIN: "" }] },
] };

test("tabla semanal del Senado: sesiones, puntos ordenados y boletines", () => {
  const s = parsearTablaSenado(tabla);
  assert.equal(s.length, 2);
  assert.equal(s[0].id, "sr-10335");
  assert.equal(s[0].fecha, "2026-11-16");
  assert.equal(s[0].horaInicio, "17:17");
  assert.deepEqual(s[0].puntos.map((p) => p.boletin), ["18860-15", "18885-05"]);
  assert.equal(s[0].puntos[0].enlace, "", "solo enlaces de tramitacion.senado.cl");
  assert.deepEqual(s[1].boletines, ["18702-05"], "boletín leído de la materia si el campo viene vacío");
  assert.equal(s[0].estado, "", "el Senado no informa estado: no se inventa");
});

const xmlSesiones = `<SesionesSalaColeccion>
<Sesion><Id>4854</Id><Numero>94</Numero><FechaInicio>2026-11-16T15:01:42</FechaInicio><FechaTermino>2026-11-16T16:53:14</FechaTermino><Tipo Valor="1">Ordinaria</Tipo><Estado Valor="1">Celebrada</Estado></Sesion>
<Sesion><Id>4855</Id><Numero>95</Numero><FechaInicio>2026-11-17T10:01:20</FechaInicio><FechaTermino>2026-11-17T14:00:00</FechaTermino><Tipo Valor="1">Ordinaria</Tipo><Estado Valor="0">Citada</Estado></Sesion>
</SesionesSalaColeccion>`;
const xmlVot = `<Votaciones>
<Votacion><Id>91565</Id><Descripcion>Boletín N° 18885-05</Descripcion><Fecha>2026-11-16T16:52:49</Fecha><TotalSi>54</TotalSi><TotalNo>84</TotalNo><TotalAbstencion>1</TotalAbstencion><Quorum Valor="1">Quórum Simple</Quorum><Resultado Valor="0">Rechazado</Resultado><Tipo Valor="1">Proyecto de Ley</Tipo></Votacion>
<Votacion><Id>91564</Id><Descripcion>Boletín N° 18885-05</Descripcion><Fecha>2026-11-16T16:46:35</Fecha><TotalSi>87</TotalSi><TotalNo>44</TotalNo><TotalAbstencion>7</TotalAbstencion><Quorum Valor="1">Quórum Simple</Quorum><Resultado Valor="1">Aprobado</Resultado><Tipo Valor="1">Proyecto de Ley</Tipo></Votacion>
<Votacion><Id>90000</Id><Descripcion>Resolución N° 1500</Descripcion><Fecha>2026-11-10T12:00:00</Fecha><TotalSi>1</TotalSi><TotalNo>0</TotalNo><TotalAbstencion>0</TotalAbstencion><Resultado Valor="1">Aprobado</Resultado><Tipo Valor="2">Proyecto de Resolución</Tipo></Votacion>
</Votaciones>`;

test("Cámara: votaciones asignadas a la sesión por horario y agrupadas por boletín", () => {
  const sesiones = asignarVotaciones(parsearSesionesCamara(xmlSesiones), parsearVotacionesCamara(xmlVot));
  assert.equal(sesiones[0].id, "cd-4854");
  assert.equal(sesiones[0].estado, "Celebrada");
  assert.deepEqual(sesiones[0].votaciones.map((v) => v.id), ["91564", "91565"]);
  assert.deepEqual(sesiones[0].boletines, ["18885-05"]);
  assert.equal(sesiones[1].votaciones.length, 0, "votación de otro día no se asigna");
  const g = votacionesPorBoletin(sesiones[0].votaciones);
  assert.equal(g.length, 1);
  assert.equal(g[0].votaciones.length, 2);
  assert.ok(!("_ini" in sesiones[0]));
});

test("asistencia, fechas y boletín explícito", () => {
  assert.deepEqual(contarAsistencia(`<A><Asistencia><TipoAsistencia Valor="1">Asiste</TipoAsistencia></Asistencia><Asistencia><TipoAsistencia Valor="0">No Asiste</TipoAsistencia></Asistencia></A>`), { asisten: 1, total: 2 });
  assert.equal(contarAsistencia("<x/>"), undefined);
  assert.equal(fechaLargaAISO("Miércoles 18 de Noviembre de 2026"), "2026-11-18");
  assert.equal(boletinDeDescripcion("Resolución N° 1500"), "");
  assert.equal(boletinDeDescripcion("Bol. N° 18.860-15"), "18860-15");
  assert.equal(momentoSesion("2026-11-17", "2026-11-17"), "hoy");
  assert.equal(momentoSesion("2026-11-18", "2026-11-17"), "proxima");
});
