import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { generarContenidoUniversalIA } from "../server/services/aiService.ts";

async function run() {
  const query = "hidrógeno verde";
  const prompt = `Eres un jurista experto de la Biblioteca del Congreso Nacional de Chile (BCN). Para el concepto jurídico/regulatorio "${query}", identifica entre 5 y 8 marcos normativos REALES y específicos vigentes o en trámite en ordenamientos jurídicos comparados internacionales (excluyendo Chile, como Unión Europea, España, Estados Unidos, Alemania, Francia, Reino Unido, Colombia, etc.).

Debes responder ÚNICAMENTE con un arreglo JSON válido con este formato:
[
  {
    "pais": "Unión Europea",
    "fuente": "EUR-Lex — Diario Oficial de la UE",
    "titulo": "Directiva (UE) 2024/... sobre...",
    "fecha": "2024",
    "url": "https://eur-lex.europa.eu",
    "tipo": "Directiva",
    "descripcion": "🎯 Objeto & Ámbito: ...\\n⚙️ Mecanismos Clave: ...\\n⚖️ Fiscalización: ...\\n💡 Lección para Chile: ...",
    "relevancia": 96
  }
]`;

  try {
    console.log("Consultando IA...");
    const res = await generarContenidoUniversalIA(prompt, 1800);
    console.log("Respuesta recibida:\n", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
