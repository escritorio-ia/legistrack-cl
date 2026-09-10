/**
 * Punto de entrada de las funciones serverless de Vercel para toda la API.
 *
 * El nombre de archivo `[...all].ts` es un catch-all dinámico: Vercel invoca esta
 * función para cualquier ruta bajo /api/* y le pasa la URL completa, así que el
 * mismo Express app + apiRouter que ya usa server.ts en desarrollo/Node se puede
 * reutilizar tal cual (un Express app es un handler (req, res) válido para el
 * runtime Node de Vercel).
 */
import express from "express";
import { apiRouter } from "../server/routes/apiRoutes";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", apiRouter);

export default app;
