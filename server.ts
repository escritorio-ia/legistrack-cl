import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ENV, PORT } from "./server/config/env";
import { apiRouter } from "./server/routes/apiRoutes";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Register all API routes
app.use("/api", apiRouter);

// Configure Vite in dev or serve production bundle
async function startServer() {
  if (ENV.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LegisTrack CL] Servidor activo en http://localhost:${PORT} (${ENV.NODE_ENV})`);
  });
}

// Error handling to prevent unhandled network crashes
process.on("unhandledRejection", (reason) => {
  console.error("[LegisTrack Unhandled Rejection]", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[LegisTrack Uncaught Exception]", err);
});

startServer();
