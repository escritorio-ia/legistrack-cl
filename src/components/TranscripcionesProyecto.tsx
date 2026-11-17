import React from "react";
import TranscripcionesSesiones from "./TranscripcionesSesiones";
import { getRegistrosVideoPorBoletin } from "../services/firebaseService";

/** Transcripciones de sesiones de comisión donde se habló del proyecto (en la tabla o mencionado en lo dicho). */
export default function TranscripcionesProyecto({ proyectoId }: { proyectoId: string }) {
  return (
    <TranscripcionesSesiones
      clave={proyectoId}
      cargar={() => getRegistrosVideoPorBoletin(proyectoId)}
      titulo="Transcripciones de comisiones donde se habló del proyecto"
      descripcion="Sesiones cuya tabla incluye este boletín o en las que se mencionó durante la sesión. Transcripción automática del video oficial (no es el acta oficial)."
      vacio="Aún no hay transcripciones de sesiones con este boletín. Aparecen aquí al transcribir el video de una sesión desde la comisión."
    />
  );
}
