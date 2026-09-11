import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";

// Exact Firebase Web Config for project legistrack-d75bc
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAZvd-S6AmPpV05UYEkRRULgDezD7mAkaE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "legistrack-d75bc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "legistrack-d75bc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "legistrack-d75bc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "830548763203",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:830548763203:web:f0d583c52d97e3248b6af6"
};

export const isFirebaseConfigured = true;

let app: any = null;
let db: any = null;

try {
  if (typeof window !== "undefined") {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  }
} catch (err) {
  console.warn("Firebase initialization warning (falling back gracefully):", err);
}

export { db, app };

// Firestore Collections definition
export const COLLECTIONS = {
  INFORMES_COMISION: "informes_comisiones",
  SESIONES_COMPLETADAS: "sesiones_completadas",
  CITACIONES_CUSTOM: "citaciones_custom",
  ALERTAS_LEGISLATIVAS: "alertas_legislativas",
  NOTAS_COLABORATIVAS: "notas_colaborativas",
  HISTORIAL_PROYECTOS: "historial_proyectos"
};

export interface NotaColaborativa {
  id: string;
  targetId: string; // comisionId or boletinId
  targetType: "comision" | "proyecto";
  autor: string;
  autorRol?: string;
  contenido: string;
  categoria: "Estrategia" | "Observación Jurídica" | "Alerta Política" | "Minuta";
  createdAt: string;
}

/**
 * Guarda o actualiza una nota colaborativa en Firestore
 */
export async function saveNotaColaborativaToFirestore(nota: NotaColaborativa): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.NOTAS_COLABORATIVAS, nota.id);
    await setDoc(docRef, nota, { merge: true });
    return true;
  } catch (err) {
    console.warn("Error saving collaborative note to Firestore:", err);
    return false;
  }
}

/**
 * Obtiene las notas colaborativas para una comisión o boletín
 */
export async function getNotasColaborativasFromFirestore(targetId: string): Promise<NotaColaborativa[]> {
  if (!db || !targetId) return [];
  try {
    const colRef = collection(db, COLLECTIONS.NOTAS_COLABORATIVAS);
    const q = query(colRef, where("targetId", "==", targetId));
    const snap = await getDocs(q);
    const notas: NotaColaborativa[] = [];
    snap.forEach((d) => notas.push(d.data() as NotaColaborativa));
    return notas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn(`Error fetching notes for ${targetId} from Firestore:`, err);
    return [];
  }
}

/**
 * Guarda o actualiza un informe de comisión en Firestore
 */
export async function saveInformeToFirestore(reportData: {
  id: string;
  sesionId: string;
  fecha: string;
  comision: string;
  boletinId?: string;
  videoUrl?: string;
  videoTitle?: string;
  reportContent: string[];
  createdAt: string;
  updatedAt?: string;
}): Promise<boolean> {
  if (!db) return false;
  try {
    const docId = `rep_${reportData.sesionId}`;
    const docRef = doc(db, COLLECTIONS.INFORMES_COMISION, docId);
    await setDoc(docRef, {
      ...reportData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[Firebase Cloud] Report saved successfully: ${docId}`);
    return true;
  } catch (err) {
    console.error("Error saving report to Firestore:", err);
    return false;
  }
}

/**
 * Obtiene un informe de comisión por ID de sesión desde Firestore
 */
export async function getInformeFromFirestore(sesionId: string): Promise<any | null> {
  if (!db) return null;
  try {
    const docId = `rep_${sesionId}`;
    const docRef = doc(db, COLLECTIONS.INFORMES_COMISION, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn("Error fetching report from Firestore:", err);
    return null;
  }
}

/**
 * Obtiene todos los informes guardados para un Boletín específico desde Firestore
 */
export async function getInformesByBoletinFromFirestore(boletinId: string): Promise<any[]> {
  if (!db || !boletinId) return [];
  try {
    const colRef = collection(db, COLLECTIONS.INFORMES_COMISION);
    const q = query(colRef, where("boletinId", "==", boletinId));
    const snap = await getDocs(q);
    const reports: any[] = [];
    snap.forEach((d) => reports.push(d.data()));
    return reports;
  } catch (err) {
    console.warn(`Error fetching reports for boletin ${boletinId} from Firestore:`, err);
    return [];
  }
}

/**
 * Guarda una sesión completada/editada en Firestore
 */
export async function saveSesionCompletadaToFirestore(comisionId: string, sesionData: any): Promise<boolean> {
  if (!db) return false;
  try {
    const docId = `${comisionId}_${sesionData.id}`;
    const docRef = doc(db, COLLECTIONS.SESIONES_COMPLETADAS, docId);
    await setDoc(docRef, {
      comisionId,
      ...sesionData,
      savedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[Firebase Cloud] Session saved successfully: ${docId}`);
    return true;
  } catch (err) {
    console.error("Error saving completed session to Firestore:", err);
    return false;
  }
}

/**
 * Carga todas las sesiones concluidas registradas para una comisión
 */
export async function getSesionesCompletadasFromFirestore(comisionId: string): Promise<any[]> {
  if (!db || !comisionId) return [];
  try {
    const colRef = collection(db, COLLECTIONS.SESIONES_COMPLETADAS);
    const q = query(colRef, where("comisionId", "==", comisionId));
    const snap = await getDocs(q);
    const sesiones: any[] = [];
    snap.forEach((d) => sesiones.push(d.data()));
    return sesiones;
  } catch (err) {
    console.warn(`Error fetching completed sessions for ${comisionId} from Firestore:`, err);
    return [];
  }
}

export interface SesionVinculadaProyecto {
  sesionId: string;
  fecha: string;
  comisionId: string;
  comisionNombre: string;
  expositores?: string;
  temasVistos?: string;
  duracionReal?: string; // largo real del video de YouTube, p. ej. "1:46:36"
  videoUrl?: string;
  videoId?: string;
  acuerdos?: string[];
}

/**
 * Vincula una sesión (con su duración real, expositores y temas ya curados) al
 * historial de tramitación de un proyecto de ley, indexado por boletín. Se
 * llama automáticamente cada vez que se genera un informe o se encuentra la
 * transmisión de una sesión — no requiere trabajo manual. Hace merge por
 * sesionId para no duplicar si la misma sesión se vuelve a indexar.
 */
export async function saveSesionVinculadaAProyecto(boletinId: string, sesion: SesionVinculadaProyecto): Promise<boolean> {
  if (!db || !boletinId || !sesion.sesionId) return false;
  try {
    const docRef = doc(db, COLLECTIONS.HISTORIAL_PROYECTOS, boletinId);
    const snap = await getDoc(docRef);
    const existentes: SesionVinculadaProyecto[] = snap.exists() ? (snap.data().sesionesVinculadas || []) : [];
    const idx = existentes.findIndex(s => s.sesionId === sesion.sesionId);
    if (idx >= 0) {
      existentes[idx] = { ...existentes[idx], ...sesion };
    } else {
      existentes.push(sesion);
    }
    await setDoc(docRef, {
      boletinId,
      sesionesVinculadas: existentes,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Error linking session to proyecto ${boletinId} in Firestore:`, err);
    return false;
  }
}

/**
 * Obtiene las sesiones de comisión vinculadas a un proyecto de ley (boletín),
 * indexadas automáticamente desde las sesiones donde apareció en tabla.
 */
export async function getSesionesVinculadasDeProyecto(boletinId: string): Promise<SesionVinculadaProyecto[]> {
  if (!db || !boletinId) return [];
  try {
    const docRef = doc(db, COLLECTIONS.HISTORIAL_PROYECTOS, boletinId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return [];
    return snap.data().sesionesVinculadas || [];
  } catch (err) {
    console.warn(`Error fetching linked sessions for proyecto ${boletinId} from Firestore:`, err);
    return [];
  }
}
