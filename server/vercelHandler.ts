/**
 * Punto de entrada de la función serverless de Vercel para toda la API.
 *
 * Se usa el patrón oficial de Vercel para desplegar un backend Express (una
 * función en api/index.js que exporta el app, más un rewrite en vercel.json que
 * manda todo lo que empieza con /api/ hacia esta función).
 *
 * Este archivo NO se despliega tal cual: se compila con esbuild a un único
 * archivo autocontenido `api/index.js` (ver el script "bundle:api" en
 * package.json). El tracer de archivos de Vercel (@vercel/nft) no estaba
 * incluyendo correctamente todo el árbol de imports locales (server/, src/) en
 * el bundle de la función — el runtime fallaba con
 * `ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/server/routes/apiRoutes'`
 * porque ese archivo simplemente no llegaba al deployment. Empaquetar todo el
 * código propio en un solo archivo (dejando los paquetes de npm como
 * dependencias externas normales, instaladas por Vercel) elimina esa
 * dependencia del tracing automático.
 *
 * Un Express app es un handler (req, res) válido para el runtime Node de Vercel:
 * Vercel preserva la URL original de la petición (incluida la ruta completa bajo
 * /api/...) en req.url, así que Express sigue enrutando internamente sin cambios.
 */
import express from "express";
import { apiRouter } from "./routes/apiRoutes";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", apiRouter);

export default app;
