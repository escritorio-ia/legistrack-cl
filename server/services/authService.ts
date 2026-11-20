/**
 * Ingreso a la aplicación con una cuenta de administración.
 * El usuario y la contraseña se leen SOLO de variables de entorno (ADMIN_USUARIO, ADMIN_CLAVE); nunca del código.
 * La sesión es una cookie HttpOnly firmada con AUTH_SECRET (HMAC-SHA256) que vence a los 7 días.
 * Si faltan las variables, la API queda cerrada (se informa qué falta) en vez de quedar abierta.
 */
import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response, NextFunction } from "express";

const COOKIE = "lpp_sesion";
const DURACION_S = 7 * 24 * 3600;

export function authConfigurada(): { ok: boolean; falta: string[] } {
  const falta = ["ADMIN_CLAVE", "AUTH_SECRET"].filter((k) => !process.env[k]);
  return { ok: falta.length === 0, falta };
}
const usuarioEsperado = () => (process.env.ADMIN_USUARIO || "admin").trim().toLowerCase();

function igualSeguro(a: string, b: string): boolean {
  const x = createHmac("sha256", "cmp").update(a).digest();
  const y = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(x, y);
}
const firma = (datos: string) => createHmac("sha256", process.env.AUTH_SECRET || "").update(datos).digest("base64url");

export function credencialesValidas(usuario: string, clave: string): boolean {
  if (!authConfigurada().ok) return false;
  const u = igualSeguro(String(usuario || "").trim().toLowerCase(), usuarioEsperado());
  const c = igualSeguro(String(clave || ""), process.env.ADMIN_CLAVE || "");
  return u && c;
}

export function crearToken(usuario: string, ahora = Date.now()): string {
  const datos = Buffer.from(JSON.stringify({ u: usuario, exp: Math.floor(ahora / 1000) + DURACION_S })).toString("base64url");
  return `${datos}.${firma(datos)}`;
}

export function leerToken(token: string, ahora = Date.now()): { u: string } | null {
  if (!authConfigurada().ok) return null;
  const [datos, f] = String(token || "").split(".");
  if (!datos || !f || !igualSeguro(f, firma(datos))) return null;
  try {
    const p = JSON.parse(Buffer.from(datos, "base64url").toString());
    return p?.exp > Math.floor(ahora / 1000) ? { u: String(p.u) } : null;
  } catch { return null; }
}

function cookieDe(req: Request): string {
  const m = String(req.headers.cookie || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : "";
}
const esSeguro = (req: Request) => req.secure || String(req.headers["x-forwarded-proto"] || "").includes("https");

export function fijarSesion(req: Request, res: Response, usuario: string) {
  res.setHeader("Set-Cookie", `${COOKIE}=${encodeURIComponent(crearToken(usuario))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DURACION_S}${esSeguro(req) ? "; Secure" : ""}`);
}
export function cerrarSesion(req: Request, res: Response) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${esSeguro(req) ? "; Secure" : ""}`);
}
export function sesionActual(req: Request): { u: string } | null {
  return leerToken(cookieDe(req));
}

/**
 * Rutas que no exigen sesión porque tienen su propia protección: el ingreso, la tarea diaria de Vercel
 * (CRON_SECRET) y los envíos de la extensión de navegador (clave CITACIONES_IMPORT_TOKEN).
 */
export function rutaPublica(metodo: string, ruta: string): boolean {
  if (ruta.startsWith("/auth/")) return true;
  if (ruta === "/registro-sesiones/sincronizar") return true;
  if (ruta === "/senado/comisiones-ids") return true;
  if (ruta === "/transcripcion/automatica/paso") return true; // exige CRON_SECRET
  if (metodo === "POST" && /\/importar$/.test(ruta)) return true;
  if (metodo === "POST" && ruta === "/transcripcion/automatica/extension") return true; // exige la clave de importación
  return false;
}

export function exigirSesion(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS" || rutaPublica(req.method, req.path)) return next();
  if (sesionActual(req)) return next();
  const conf = authConfigurada();
  return res.status(401).json({ error: conf.ok ? "Debe ingresar a la aplicación." : `Ingreso no configurado en el servidor (falta ${conf.falta.join(", ")}).`, ingreso: true });
}

// Freno simple contra intentos repetidos (por instancia del servidor).
const intentos = new Map<string, { n: number; desde: number }>();
export function demasiadosIntentos(ip: string): boolean {
  const e = intentos.get(ip);
  if (!e || Date.now() - e.desde > 15 * 60 * 1000) return false;
  return e.n >= 8;
}
export function registrarFallo(ip: string) {
  const e = intentos.get(ip);
  if (!e || Date.now() - e.desde > 15 * 60 * 1000) intentos.set(ip, { n: 1, desde: Date.now() });
  else e.n++;
}
export function limpiarFallos(ip: string) { intentos.delete(ip); }
