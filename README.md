# Legislación++ (LegisTrack CL)

Plataforma de seguimiento legislativo y transparencia del Congreso Nacional de Chile.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `ANTHROPIC_API_KEY` in `.env.local` to your Anthropic API key (optional — the app falls back to high-fidelity offline mode without it)
3. Run the app:
   `npm run dev`

## Despliegue en servidores propios

La app corre como un único proceso Node (frontend + API), sin depender de Vercel:

```bash
npm install
npm run build        # compila el frontend y el servidor en dist/
npm start            # sirve todo en http://0.0.0.0:3000  (puerto: variable PORT)
```

Las variables se leen de `.env.local` o `.env` (ver `.env.example`).

### Pizarra ATP: conectar los datos reales

La Pizarra no sabe de dónde vienen los pedidos: trabaja sobre un registro neutro y la fuente se elige por configuración.
La detección de cruces es determinista (boletines, normas y palabras clave compartidas): **ningún dato de pedidos se envía a proveedores de IA ni a servicios externos**.

| Variable | Qué hace |
|---|---|
| `PIZARRA_FUENTE` | `demo` (datos ficticios, por defecto) o `archivo` |
| `PIZARRA_ARCHIVO` | Ruta a un `.csv` o `.json` con las investigaciones (p. ej. exportación periódica del SUP). Se relee solo cuando el archivo cambia |
| `PIZARRA_ASIGNACIONES_ARCHIVO` | Opcional: CSV `investigador;area;comision` con las comisiones que sigue cada persona |
| `PIZARRA_DATA_DIR` | Carpeta donde se guardan las importaciones hechas desde la pantalla |
| `PIZARRA_TOKEN` | Si se define, la API `/api/pizarra` exige este token |
| `PIZARRA_OCULTAR_SOLICITANTE` | `true` oculta el nombre del solicitante en pedidos de parlamentarios |

Formato del CSV (columnas separadas por `;` o `,`; valores múltiples dentro de una celda —boletines, palabras_clave, normas— separados por `|`; plantilla descargable desde la propia pantalla):
`id;area;investigador;tipo;solicitante;comision;boletines;materia;descripcion;palabras_clave;normas;estado;fecha_ingreso;fecha_entrega;etapa`.
Obligatorios: `id`, `area`, `materia`. `tipo` = `comision` | `parlamentario`; `estado` = `en_curso` | `entregada` | `archivada`.

Para conectar el SUP directamente (sin archivo intermedio), agregar un proveedor de datos en `server/services/pizarraService.ts` (función `obtenerDatos`) que entregue `Investigacion[]`; el resto (detección, API y pantalla) no cambia.

> Antes de cargar pedidos reales: la app aún no tiene inicio de sesión. Mientras tanto, proteger el acceso con `PIZARRA_TOKEN` y/o la red interna, y revisar con quien corresponda qué campos pueden mostrarse a otros equipos.
