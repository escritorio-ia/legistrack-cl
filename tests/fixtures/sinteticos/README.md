# Fixtures SINTÉTICOS (no son respuestas reales)

Usados por `tests/fuentesOficialesNuevos.test.ts`. Escritos el 2026-11-05 sin acceso de red a las fuentes
(el proxy bloquea los hosts oficiales), siguiendo los campos que lee cada conector de
`server/services/fuentesOficialesService.ts`.

- Títulos e identificadores son **ficticios** y van marcados "(ficticio)".
- Prueban el filtrado, el orden, la construcción de URL y el manejo de errores del conector, **no** que la API
  real responda con esta forma. Eso solo lo confirma la prueba en producción (`GET /api/derecho-comparado?q=...`).
- Cuando haya red, conviene reemplazarlos por extractos reales capturados (como `../boe_busqueda.json`).
