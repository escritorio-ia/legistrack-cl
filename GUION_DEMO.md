# Guion demo Legislación++ (~10 min)

Abrir con sesión iniciada y la app ya cargada. Cada proyecto se abre una vez antes de la demo, para que todo salga desde Firestore sin esperas.

## Proyectos y orden

1. **16.777-07 (principal, completo).** Ficha ejecutiva, quórum (ley común), 3 resúmenes de comisión, 3 comparados.
2. **18.286-03 (firma electrónica).** Pestaña **Informes**: resumen consolidado de 3 informes financieros (DIPRES). Luego **Comisiones**: resumen de Economía, con expositores reales y votación. Luego **Comparado**: Mensaje → Comisión → Indicaciones.
3. **16.335-14 (incendios forestales), solo como ejemplo de proyecto grande.** Mostrar la pestaña **Tramitación** y los **Documentos** con filtros. No abrir la ficha ejecutiva ni los informes financieros.

## Flujo sugerido

- **Proyectos:** buscar por boletín y filtrar con "💰 Con informe financiero".
- **Dentro de un proyecto:** pipeline de tramitación → quórum exigido → ficha → comisiones → comparado.
- **Citaciones semanales:** próximas primero, con filtros Cámara / Senado.
- **Mensaje clave:** todo viene de fuentes oficiales; lo que no existe dice "No informado". Nada se inventa.

## Evitar

- Video y análisis IA de sesiones (decisión tuya, no probado).
- Ficha ejecutiva del 16.335-14 (queda solo con el título; no se pudo leer el texto oficial).
- Informes financieros del 16.335-14 (10 de 14 son imágenes escaneadas).
- Directorio de comisiones: el campo "Preside" y los contadores vienen de datos estáticos; verificar antes de mostrarlos.
- Panel de comisión de la Cámara (Agricultura): depende de la extensión; abrir antes citaciones y resultados en camara.cl.

## Antes de presentar (checklist)

- [ ] Abrir los 3 proyectos y sus pestañas Comisiones / Comparado / Informes.
- [ ] Verificar `/api/health?real=true`: Claude `ok: true`.
- [ ] Extensión: abrir citaciones de la Cámara (semana actual y siguiente).
- [ ] Tener capturas de respaldo de cada pantalla por si falla internet.
- [ ] Rotar la clave de Anthropic que se pegó en el chat, después de la demo.
