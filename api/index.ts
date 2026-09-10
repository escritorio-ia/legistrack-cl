/**
 * Punto de entrada de la función serverless de Vercel para toda la API.
 *
 * Se usa el patrón oficial de Vercel para desplegar un backend Express (un único
 * `api/index.ts` que exporta el app, más un rewrite en vercel.json que manda todo
 * lo que empieza con /api/ hacia esta función). Se intentó primero un catch-all
 * dinámico (`api/[...all].ts`) confiando en el ruteo por sistema de archivos de
 * Vercel, pero en la práctica no resolvía las sub-rutas (`/api/comision/...`
 * devolvía 404 aun con la función ya construida) — este es el patrón documentado
 * y probado por Vercel mismo para Express, así que es más confiable.
 *
 * Un Express app es un handler (req, res) válido para el runtime Node de Vercel:
 * Vercel preserva la URL original de la petición (incluida la ruta completa bajo
 * /api/...) en req.url, así que Express sigue enrutando internamente sin cambios.
 */
import express from "express";
import { apiRouter } from "../server/routes/apiRoutes";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", apiRouter);

export default app;
