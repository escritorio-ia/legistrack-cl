import dotenv from "dotenv";
import path from "path";
import dns from "dns";

// Carga variables de entorno: .env.local tiene prioridad (dev local), con .env como respaldo.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Force IPv4
dns.setDefaultResultOrder('ipv4first');

export const PORT = Number(process.env.PORT || 3000);

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
};
