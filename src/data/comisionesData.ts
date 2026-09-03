import { Integrante, Comision, Proyecto } from "../types";

export interface ComisionMeta {
  id: string;
  senadoId?: string;
  nombre: string;
  descripcion: string;
  estado: string;
  chamber: "CD" | "SR";
  prefix: "cd-" | "senado-";
  icon: string;
  color?: string;
  featured?: boolean;
  temas?: string[];
  email?: string;
  integrantes: Integrante[];
}

export const DIPUTADOS_COMISIONES_DETALLE: ComisionMeta[] = [
  {
    id: "constitucion",
    nombre: "Comisión de Constitución, Legislación, Justicia y Reglamento",
    descripcion: "Tramitaciones de reformas constitucionales, leyes orgánicas, códigos sustantivos y derecho procesal.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Scale",
    temas: ["Constitución", "Poder Judicial", "Nombramientos", "Código Penal", "Justicia", "Reglamento"],
    integrantes: [
      { nombre: "Miguel Ángel Calisto Águila", partido: "Demócratas", rol: "Presidente de Comisión", email: "mcalisto@congreso.cl" },
      { nombre: "Raúl Leiva Carvajal", partido: "PS", rol: "Miembro Titular", email: "rleiva@congreso.cl" },
      { nombre: "Jorge Alessandri Vergara", partido: "UDI", rol: "Miembro Titular", email: "jalessandri@congreso.cl" },
      { nombre: "Luis Sánchez Ossa", partido: "PREP", rol: "Miembro Titular", email: "lsanchez@congreso.cl" },
      { nombre: "Camila Flores Oporto", partido: "RN", rol: "Miembro Titular", email: "cflores@congreso.cl" },
      { nombre: "Marcos Ilabaca Cerda", partido: "PS", rol: "Miembro Titular", email: "milabaca@congreso.cl" },
      { nombre: "Leonardo Soto Ferrada", partido: "PS", rol: "Miembro Titular", email: "lsoto@congreso.cl" },
      { nombre: "Andrés Longton Herrera", partido: "RN", rol: "Miembro Titular", email: "alongton@congreso.cl" },
      { nombre: "Javiera Morales Alvarado", partido: "FA", rol: "Miembro Titular", email: "jmorales@congreso.cl" },
      { nombre: "Catalina Pérez Salinas", partido: "FA", rol: "Miembro Titular", email: "cperez@congreso.cl" },
      { nombre: "Maite Orsini Pascal", partido: "FA", rol: "Miembro Titular", email: "morsini@congreso.cl" },
      { nombre: "Pamela Jiles Moreno", partido: "PH", rol: "Miembro Titular", email: "pjiles@congreso.cl" },
      { nombre: "Raúl Soto Mardones", partido: "PPD", rol: "Miembro Titular", email: "rsoto@congreso.cl" }
    ]
  },
  {
    id: "hacienda",
    nombre: "Comisión de Hacienda",
    descripcion: "Revisión del presupuesto fiscal de la nación, políticas de recaudación e inversión gubernamental.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "TrendingUp",
    color: "blue",
    featured: true,
    temas: ["Presupuesto", "Impuestos", "Reforma Tributaria", "DIPRES", "Inversión", "Gasto Público"],
    integrantes: [
      { nombre: "Carlos Bianchi Chelech", partido: "IND-PPD", rol: "Presidente de Comisión", email: "cbianchi@congreso.cl" },
      { nombre: "Gael Yeomans Araya", partido: "FA", rol: "Miembro Titular", email: "gyeomans@congreso.cl" },
      { nombre: "Guillermo Ramírez Diez", partido: "UDI", rol: "Miembro Titular", email: "gramirez@congreso.cl" },
      { nombre: "Boris Barrera Moreno", partido: "PC", rol: "Miembro Titular", email: "bbarrera@congreso.cl" },
      { nombre: "Frank Sauerbaum Muñoz", partido: "RN", rol: "Miembro Titular", email: "fsauerbaum@congreso.cl" },
      { nombre: "Jaime Naranjo Ortiz", partido: "PS", rol: "Miembro Titular", email: "jnaranjo@congreso.cl" },
      { nombre: "Sofía Cid Versalovic", partido: "IND-RN", rol: "Miembro Titular", email: "scid@congreso.cl" },
      { nombre: "Agustín Romero Leiva", partido: "PREP", rol: "Miembro Titular", email: "aromero@congreso.cl" },
      { nombre: "Alexis Sepúlveda Soto", partido: "PR", rol: "Miembro Titular", email: "asepulveda@congreso.cl" },
      { nombre: "Miguel Mellado Suazo", partido: "RN", rol: "Miembro Titular", email: "mmellado@congreso.cl" },
      { nombre: "Gastón Von Mühlenbrock Zamora", partido: "UDI", rol: "Miembro Titular", email: "gvonmuhlenbrock@congreso.cl" },
      { nombre: "Vlado Mirosevic Verdugo", partido: "PL", rol: "Miembro Titular", email: "vmirosevic@congreso.cl" },
      { nombre: "Ricardo Cifuentes Lillo", partido: "DC", rol: "Miembro Titular", email: "rcifuentes@congreso.cl" }
    ]
  },
  {
    id: "trabajo-y-prevision",
    nombre: "Comisión de Trabajo y Previsión Social",
    descripcion: "Estudio de proyectos relativos al empleo, pensiones, indemnizaciones y reformas del Código del Trabajo.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "HardHat",
    color: "red",
    featured: true,
    temas: ["Pensiones", "Reforma Previsional", "Empleo", "40 Horas", "Ley Karin", "Sindicatos", "Salarios"],
    integrantes: [
      { nombre: "Luis Alberto Cuello Peña y Lillo", partido: "PC", rol: "Presidente de Comisión", email: "lcuello@congreso.cl" },
      { nombre: "Daniella Cicardini Milla", partido: "PS", rol: "Miembro Titular", email: "dcicardini@congreso.cl" },
      { nombre: "Andrés Giordano Salazar", partido: "FA", rol: "Miembro Titular", email: "agiordano@congreso.cl" },
      { nombre: "Eduardo Durán Salinas", partido: "RN", rol: "Miembro Titular", email: "eduran@congreso.cl" },
      { nombre: "Henry Leal Bizama", partido: "UDI", rol: "Miembro Titular", email: "hleal@congreso.cl" },
      { nombre: "Héctor Ulloa Aguilera", partido: "IND-PPD", rol: "Miembro Titular", email: "hulloa@congreso.cl" },
      { nombre: "Alberto Undurraga Vicuña", partido: "DC", rol: "Miembro Titular", email: "aundurraga@congreso.cl" },
      { nombre: "Diego Schalper Sepúlveda", partido: "RN", rol: "Miembro Titular", email: "dschalper@congreso.cl" },
      { nombre: "Cristián Labbé Martínez", partido: "UDI", rol: "Miembro Titular", email: "clabbe@congreso.cl" },
      { nombre: "Juan Santana Castillo", partido: "PS", rol: "Miembro Titular", email: "jsantana@congreso.cl" },
      { nombre: "Frank Sauerbaum Muñoz", partido: "RN", rol: "Miembro Titular", email: "fsauerbaum@congreso.cl" },
      { nombre: "Maite Orsini Pascal", partido: "FA", rol: "Miembro Titular", email: "morsini@congreso.cl" },
      { nombre: "Rubén Oyarzo Figueroa", partido: "IND", rol: "Miembro Titular", email: "royarzo@congreso.cl" }
    ]
  },
  {
    id: "seguridad",
    nombre: "Comisión de Seguridad Ciudadana",
    descripcion: "Control de delitos violentos, reforzamiento de instituciones armadas y persecución de crimen organizado.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Shield",
    color: "blue",
    featured: true,
    temas: ["Crimen Organizado", "Carabineros", "PDI", "Ley de Armas", "Ciberseguridad", "Seguridad Pública", "Narcotráfico"],
    integrantes: [
      { nombre: "Andrés Longton Herrera", partido: "RN", rol: "Presidente de Comisión", email: "alongton@congreso.cl" },
      { nombre: "Alejandra Placencia Cabello", partido: "PC", rol: "Miembro Titular", email: "aplacencia@congreso.cl" },
      { nombre: "Jorge Alessandri Vergara", partido: "UDI", rol: "Miembro Titular", email: "jalessandri@congreso.cl" },
      { nombre: "Jaime Araya Guerrero", partido: "IND-PPD", rol: "Miembro Titular", email: "jaraya@congreso.cl" },
      { nombre: "Gloria Naveillan Arriagada", partido: "IND", rol: "Miembro Titular", email: "gnaveillan@congreso.cl" },
      { nombre: "Cristián Araya Lerdo de Tejada", partido: "PREP", rol: "Miembro Titular", email: "caraya@congreso.cl" },
      { nombre: "Lorena Fries Monleón", partido: "FA", rol: "Miembro Titular", email: "lfries@congreso.cl" },
      { nombre: "Maite Orsini Pascal", partido: "FA", rol: "Miembro Titular", email: "morsini@congreso.cl" },
      { nombre: "Diego Schalper Sepúlveda", partido: "RN", rol: "Miembro Titular", email: "dschalper@congreso.cl" },
      { nombre: "Henry Leal Bizama", partido: "UDI", rol: "Miembro Titular", email: "hleal@congreso.cl" },
      { nombre: "José Miguel Castro Bascuñán", partido: "RN", rol: "Miembro Titular", email: "jcastro@congreso.cl" },
      { nombre: "Raúl Leiva Carvajal", partido: "PS", rol: "Miembro Titular", email: "rleiva@congreso.cl" },
      { nombre: "Jaime Sáez Quiroz", partido: "FA", rol: "Miembro Titular", email: "jsaez@congreso.cl" }
    ]
  },
  {
    id: "salud",
    nombre: "Comisión de Salud",
    descripcion: "Discusión de ley de Isapres, Fonasa, financiamiento para hospitales, medicamentos y políticas sanitarias del país.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Heart",
    temas: ["Isapres", "Fonasa", "Hospitales", "Medicamentos", "Listas de Espera", "Salud Mental", "Ley Corta"],
    integrantes: [
      { nombre: "Ana María Gazmuri Vieira", partido: "AH", rol: "Presidenta de Comisión", email: "agazmuri@congreso.cl" },
      { nombre: "Danisa Astudillo Peiretti", partido: "PS", rol: "Miembro Titular", email: "dastudillo@congreso.cl" },
      { nombre: "Karol Cariola Oliva", partido: "PC", rol: "Miembro Titular", email: "kcariola@congreso.cl" },
      { nombre: "Tomás Lagomarsino Guzmán", partido: "IND-PR", rol: "Miembro Titular", email: "tlagomarsino@congreso.cl" },
      { nombre: "Daniel Lilayu Vivanco", partido: "UDI", rol: "Miembro Titular", email: "dlilayu@congreso.cl" },
      { nombre: "Andrés Celis Montt", partido: "RN", rol: "Miembro Titular", email: "acelis@congreso.cl" },
      { nombre: "Helia Molina Milman", partido: "PPD", rol: "Miembro Titular", email: "hmolina@congreso.cl" },
      { nombre: "Hernán Palma Pérez", partido: "IND", rol: "Miembro Titular", email: "hpalma@congreso.cl" },
      { nombre: "Agustín Romero Leiva", partido: "PREP", rol: "Miembro Titular", email: "aromero@congreso.cl" },
      { nombre: "Marta Bravo Salinas", partido: "UDI", rol: "Miembro Titular", email: "mbravo@congreso.cl" },
      { nombre: "Patricio Rosas Barrientos", partido: "FA", rol: "Miembro Titular", email: "prosas@congreso.cl" },
      { nombre: "Eric Aedo Jeldres", partido: "DC", rol: "Miembro Titular", email: "eaedo@congreso.cl" },
      { nombre: "María Luisa Cordero Velásquez", partido: "IND-RN", rol: "Miembro Titular", email: "mcordero@congreso.cl" }
    ]
  },
  {
    id: "educacion",
    nombre: "Comisión de Educación",
    descripcion: "Estudio del sistema nacional de educación, financiamiento escolar y superior, y estatutos docentes.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "BookOpen",
    temas: ["Fin al CAE", "Universidades", "SLEP", "Colegio de Profesores", "Educación Escolar", "Convivencia"],
    integrantes: [
      { nombre: "Emilia Schneider Videla", partido: "FA", rol: "Presidenta de Comisión", email: "eschneider@congreso.cl" },
      { nombre: "Daniela Serrano Salazar", partido: "PC", rol: "Miembro Titular", email: "dserrano@congreso.cl" },
      { nombre: "Stephan Schubert Rubio", partido: "PREP", rol: "Miembro Titular", email: "sschubert@congreso.cl" },
      { nombre: "Eduardo Cornejo Lagos", partido: "UDI", rol: "Miembro Titular", email: "ecornejo@congreso.cl" },
      { nombre: "Hugo Rey Martínez", partido: "RN", rol: "Miembro Titular", email: "hrey@congreso.cl" },
      { nombre: "Alejandra Placencia Cabello", partido: "PC", rol: "Miembro Titular", email: "aplacencia@congreso.cl" },
      { nombre: "Marcia Raphael Mora", partido: "RN", rol: "Miembro Titular", email: "mraphael@congreso.cl" },
      { nombre: "Viviana Delgado Riquelme", partido: "IND", rol: "Miembro Titular", email: "vdelgado@congreso.cl" },
      { nombre: "Mónica Arce Castro", partido: "IND", rol: "Miembro Titular", email: "marce@congreso.cl" },
      { nombre: "Gaspar Rivas Sánchez", partido: "IND", rol: "Miembro Titular", email: "grivas@congreso.cl" },
      { nombre: "Juan Santana Castillo", partido: "PS", rol: "Miembro Titular", email: "jsantana@congreso.cl" },
      { nombre: "Sara Concha Smith", partido: "PSC", rol: "Miembro Titular", email: "sconcha@congreso.cl" },
      { nombre: "Héctor Barría Angulo", partido: "DC", rol: "Miembro Titular", email: "hbarria@congreso.cl" }
    ]
  },
  {
    id: "defensa",
    nombre: "Comisión de Defensa Nacional",
    descripcion: "Asuntos relativos a la seguridad exterior del Estado, soberanía limítrofe y gestión de las Fuerzas Armadas.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "ShieldAlert",
    temas: ["Fuerzas Armadas", "Ejército", "Armada", "FACh", "Fronteras", "Soberanía", "Infraestructura Crítica"],
    integrantes: [
      { nombre: "Francisco Undurraga Gazitúa", partido: "Evópoli", rol: "Presidente de Comisión", email: "fundurraga@congreso.cl" },
      { nombre: "Tomás De Rementería Venegas", partido: "PS", rol: "Miembro Titular", email: "tderementeria@congreso.cl" },
      { nombre: "Carmen Hertz Cádiz", partido: "PC", rol: "Miembro Titular", email: "chertz@congreso.cl" },
      { nombre: "Álvaro Carter Fernández", partido: "UDI", rol: "Miembro Titular", email: "acarter@congreso.cl" },
      { nombre: "Jorge Brito Hasbún", partido: "FA", rol: "Miembro Titular", email: "jbrito@congreso.cl" },
      { nombre: "Andrés Jouannet Valderrama", partido: "Amarillos", rol: "Miembro Titular", email: "ajouannet@congreso.cl" },
      { nombre: "Miguel Ángel Becker Alvear", partido: "RN", rol: "Miembro Titular", email: "mbecker@congreso.cl" },
      { nombre: "Camila Flores Oporto", partido: "RN", rol: "Miembro Titular", email: "cflores@congreso.cl" },
      { nombre: "Luis Sánchez Ossa", partido: "PREP", rol: "Miembro Titular", email: "lsanchez@congreso.cl" },
      { nombre: "Johannes Kaiser Barents-von Hohenhagen", partido: "IND-PREP", rol: "Miembro Titular", email: "jkaiser@congreso.cl" },
      { nombre: "Camila Musante Müller", partido: "IND-PPD", rol: "Miembro Titular", email: "cmusante@congreso.cl" },
      { nombre: "Rubén Oyarzo Figueroa", partido: "IND", rol: "Miembro Titular", email: "royarzo@congreso.cl" },
      { nombre: "Cristhian Moreira Barros", partido: "UDI", rol: "Miembro Titular", email: "cmoreira@congreso.cl" }
    ]
  },
  {
    id: "rree",
    nombre: "Comisión de Relaciones Exteriores",
    descripcion: "Monitoreo de tratados internacionales, acuerdos bilaterales y política diplomática exterior chilena.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Globe",
    temas: ["Tratados", "Diplomacia", "Cancillería", "Comercio Exterior", "Antártica", "Convenios"],
    integrantes: [
      { nombre: "Vlado Mirosevic Verdugo", partido: "PL", rol: "Presidente de Comisión", email: "vmirosevic@congreso.cl" },
      { nombre: "Carmen Hertz Cádiz", partido: "PC", rol: "Miembro Titular", email: "chertz@congreso.cl" },
      { nombre: "Tomás De Rementería Venegas", partido: "PS", rol: "Miembro Titular", email: "tderementeria@congreso.cl" },
      { nombre: "Cristhian Moreira Barros", partido: "UDI", rol: "Miembro Titular", email: "cmoreira@congreso.cl" },
      { nombre: "Catalina Del Real Mihovilovic", partido: "PREP", rol: "Miembro Titular", email: "cdelreal@congreso.cl" },
      { nombre: "Cristián Labbé Martínez", partido: "UDI", rol: "Miembro Titular", email: "clabbe@congreso.cl" },
      { nombre: "Ximena Ossandón Irarrázabal", partido: "RN", rol: "Miembro Titular", email: "xossandon@congreso.cl" },
      { nombre: "Stephan Schubert Rubio", partido: "PREP", rol: "Miembro Titular", email: "sschubert@congreso.cl" },
      { nombre: "Alberto Undurraga Vicuña", partido: "DC", rol: "Miembro Titular", email: "aundurraga@congreso.cl" },
      { nombre: "Diego Schalper Sepúlveda", partido: "RN", rol: "Miembro Titular", email: "dschalper@congreso.cl" },
      { nombre: "Raúl Soto Mardones", partido: "PPD", rol: "Miembro Titular", email: "rsoto@congreso.cl" },
      { nombre: "Ericka Ñanco Vásquez", partido: "FA", rol: "Miembro Titular", email: "enanco@congreso.cl" },
      { nombre: "Félix González Gatica", partido: "PEV", rol: "Miembro Titular", email: "fgonzalez@congreso.cl" }
    ]
  },
  {
    id: "gobierno-interior",
    nombre: "Comisión de Gobierno Interior, Nacionalidad, Ciudadanía y Regionalización",
    descripcion: "Descentralización administrativa, división política, migración, extranjería y régimen municipal.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Landmark",
    temas: ["Migración", "Descentralización", "Gobernadores", "Municipios", "Extranjería", "Regiones"],
    integrantes: [
      { nombre: "Rubén Oyarzo Figueroa", partido: "IND", rol: "Presidente de Comisión", email: "royarzo@congreso.cl" },
      { nombre: "Miguel Ángel Becker Alvear", partido: "RN", rol: "Miembro Titular", email: "mbecker@congreso.cl" },
      { nombre: "Danisa Astudillo Peiretti", partido: "PS", rol: "Miembro Titular", email: "dastudillo@congreso.cl" },
      { nombre: "Javiera Morales Alvarado", partido: "FA", rol: "Miembro Titular", email: "jmorales@congreso.cl" },
      { nombre: "Carolina Tello Bravo", partido: "FA", rol: "Miembro Titular", email: "ctello@congreso.cl" },
      { nombre: "Renzo Trisotti Martínez", partido: "PREP", rol: "Miembro Titular", email: "rtrisotti@congreso.cl" },
      { nombre: "Juan Fuenzalida Cobo", partido: "UDI", rol: "Miembro Titular", email: "jfuenzalida@congreso.cl" },
      { nombre: "Joanna Pérez Olea", partido: "Demócratas", rol: "Miembro Titular", email: "jperez@congreso.cl" },
      { nombre: "Bernardo Berger Fett", partido: "IND-RN", rol: "Miembro Titular", email: "bberger@congreso.cl" },
      { nombre: "Cosme Mellado Pino", partido: "PR", rol: "Miembro Titular", email: "cmellado@congreso.cl" },
      { nombre: "Catalina Pérez Salinas", partido: "FA", rol: "Miembro Titular", email: "cperez@congreso.cl" },
      { nombre: "Cristián Araya Lerdo de Tejada", partido: "PREP", rol: "Miembro Titular", email: "caraya@congreso.cl" },
      { nombre: "Marta González Olea", partido: "IND-PPD", rol: "Miembro Titular", email: "mgonzalez@congreso.cl" }
    ]
  },
  {
    id: "obras-publicas",
    nombre: "Comisión de Obras Públicas, Transportes y Telecomunicaciones",
    descripcion: "Revisión de concesiones viales, infraestructura pública, sistema de transportes y conectividad digital.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "HardHat",
    temas: ["Concesiones", "Transporte Público", "Metro", "Carreteras", "Puertos", "Internet", "Telecomunicaciones"],
    integrantes: [
      { nombre: "Cosme Mellado Pino", partido: "PR", rol: "Presidente de Comisión", email: "cmellado@congreso.cl" },
      { nombre: "Jaime Mulet Martínez", partido: "FRVS", rol: "Miembro Titular", email: "jmulet@congreso.cl" },
      { nombre: "René Alinco Bustos", partido: "IND", rol: "Miembro Titular", email: "ralinco@congreso.cl" },
      { nombre: "Juan Antonio Coloma Álamos", partido: "UDI", rol: "Miembro Titular", email: "jcoloma@congreso.cl" },
      { nombre: "Felipe Camaño Cárdenas", partido: "IND-DC", rol: "Miembro Titular", email: "fcamano@congreso.cl" },
      { nombre: "Mauro González Villarroel", partido: "RN", rol: "Miembro Titular", email: "mgonzalezv@congreso.cl" },
      { nombre: "Jaime Sáez Quiroz", partido: "FA", rol: "Miembro Titular", email: "jsaez@congreso.cl" },
      { nombre: "Sergio Bobadilla Muñoz", partido: "UDI", rol: "Miembro Titular", email: "sbobadilla@congreso.cl" },
      { nombre: "Mauricio Ojeda Rebolledo", partido: "IND", rol: "Miembro Titular", email: "mojeda@congreso.cl" },
      { nombre: "Félix Bugueño Campos", partido: "FA", rol: "Miembro Titular", email: "fbugueno@congreso.cl" },
      { nombre: "Chiara Barchiesi Chávez", partido: "PREP", rol: "Miembro Titular", email: "cbarchiesi@congreso.cl" },
      { nombre: "José Carlos Meza Pereira", partido: "PREP", rol: "Miembro Titular", email: "jmeza@congreso.cl" },
      { nombre: "Emilia Nuyado Ancapichún", partido: "PS", rol: "Miembro Titular", email: "enuyado@congreso.cl" }
    ]
  },
  {
    id: "agricultura",
    nombre: "Comisión de Agricultura, Silvicultura y Desarrollo Rural",
    descripcion: "Fomento de la producción del agro, legislación vitivinícola, forestal y resguardo de la seguridad alimentaria.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Leaf",
    temas: ["Agricultura", "SAG", "Riego", "Forestal", "Parcelaciones", "Alimentos", "Campo"],
    integrantes: [
      { nombre: "Juan Antonio Coloma Álamos", partido: "UDI", rol: "Presidente de Comisión", email: "jcoloma@congreso.cl" },
      { nombre: "René Alinco Bustos", partido: "IND", rol: "Miembro Titular", email: "ralinco@congreso.cl" },
      { nombre: "Felipe Camaño Cárdenas", partido: "IND-DC", rol: "Miembro Titular", email: "fcamano@congreso.cl" },
      { nombre: "Benjamín Moreno Bascur", partido: "PREP", rol: "Miembro Titular", email: "bmoreno@congreso.cl" },
      { nombre: "Emilia Nuyado Ancapichún", partido: "PS", rol: "Miembro Titular", email: "enuyado@congreso.cl" },
      { nombre: "Paula Labra Besserer", partido: "IND-RN", rol: "Miembro Titular", email: "plabra@congreso.cl" },
      { nombre: "Harry Jürgensen Rundshagen", partido: "IND-PREP", rol: "Miembro Titular", email: "hjurgensen@congreso.cl" },
      { nombre: "Gloria Naveillan Arriagada", partido: "IND", rol: "Miembro Titular", email: "gnaveillan@congreso.cl" },
      { nombre: "Mercedes Bulnes Núñez", partido: "FA", rol: "Miembro Titular", email: "mbulnes@congreso.cl" },
      { nombre: "Nathalie Castillo Rojas", partido: "PC", rol: "Miembro Titular", email: "ncastillo@congreso.cl" },
      { nombre: "Héctor Barría Angulo", partido: "DC", rol: "Miembro Titular", email: "hbarria@congreso.cl" },
      { nombre: "Jorge Rathgeb Schifferli", partido: "RN", rol: "Miembro Titular", email: "jrathgeb@congreso.cl" },
      { nombre: "Félix Bugueño Campos", partido: "FA", rol: "Miembro Titular", email: "fbugueno@congreso.cl" }
    ]
  },
  {
    id: "medio-ambiente",
    nombre: "Comisión de Medio Ambiente y Recursos Naturales",
    descripcion: "Legislación contra el cambio climático, control de contaminación, áreas protegidas y biodiversidad.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Leaf",
    temas: ["Cambio Climático", "Biodiversidad", "Contaminación", "Humedales", "Evaluación Ambiental", "Reciclaje"],
    integrantes: [
      { nombre: "Félix González Gatica", partido: "PEV", rol: "Presidente de Comisión", email: "fgonzalez@congreso.cl" },
      { nombre: "Daniel Melo Contreras", partido: "PS", rol: "Miembro Titular", email: "dmelo@congreso.cl" },
      { nombre: "Marisela Santibáñez Novoa", partido: "PC", rol: "Miembro Titular", email: "msantibanez@congreso.cl" },
      { nombre: "José Carlos Meza Pereira", partido: "PREP", rol: "Miembro Titular", email: "jmeza@congreso.cl" },
      { nombre: "Cristóbal Martínez Ramírez", partido: "UDI", rol: "Miembro Titular", email: "cmartinez@congreso.cl" },
      { nombre: "Eduardo Cornejo Lagos", partido: "UDI", rol: "Miembro Titular", email: "ecornejo@congreso.cl" },
      { nombre: "Camila Musante Müller", partido: "IND-PPD", rol: "Miembro Titular", email: "cmusante@congreso.cl" },
      { nombre: "Viviana Delgado Riquelme", partido: "IND", rol: "Miembro Titular", email: "vdelgado@congreso.cl" },
      { nombre: "Hugo Rey Martínez", partido: "RN", rol: "Miembro Titular", email: "hrey@congreso.cl" },
      { nombre: "Daniella Cicardini Milla", partido: "PS", rol: "Miembro Titular", email: "dcicardini@congreso.cl" },
      { nombre: "Clara Sagardía Cabezas", partido: "FA", rol: "Miembro Titular", email: "csagardia@congreso.cl" },
      { nombre: "Jaime Sáez Quiroz", partido: "FA", rol: "Miembro Titular", email: "jsaez@congreso.cl" },
      { nombre: "Diego Ibáñez Cotroneo", partido: "FA", rol: "Miembro Titular", email: "dibanez@congreso.cl" }
    ]
  },
  {
    id: "mineria",
    nombre: "Comisión de Minería y Energía",
    descripcion: "Normativa minera, patentes de explotación, energías renovables, litio, cobre y generación eléctrica.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Zap",
    temas: ["Litio", "Cobre", "Codelco", "Energía Solar", "Tarifas Eléctricas", "Hidrógeno Verde", "Royalty"],
    integrantes: [
      { nombre: "Marco Antonio Sulantay Olivares", partido: "UDI", rol: "Presidente de Comisión", email: "msulantay@congreso.cl" },
      { nombre: "Yovana Ahumada Palma", partido: "IND", rol: "Miembro Titular", email: "yahumada@congreso.cl" },
      { nombre: "Cristián Tapia Ramos", partido: "IND-PPD", rol: "Miembro Titular", email: "ctapia@congreso.cl" },
      { nombre: "José Miguel Castro Bascuñán", partido: "RN", rol: "Miembro Titular", email: "jcastro@congreso.cl" },
      { nombre: "Marcela Riquelme Aliaga", partido: "FA", rol: "Miembro Titular", email: "mriquelme@congreso.cl" },
      { nombre: "Sebastián Videla Castillo", partido: "IND-PL", rol: "Miembro Titular", email: "svidela@congreso.cl" },
      { nombre: "Jaime Mulet Martínez", partido: "FRVS", rol: "Miembro Titular", email: "jmulet@congreso.cl" },
      { nombre: "Nelson Venegas Salazar", partido: "PS", rol: "Miembro Titular", email: "nvenegas@congreso.cl" },
      { nombre: "Andrés Celis Montt", partido: "RN", rol: "Miembro Titular", email: "acelis@congreso.cl" },
      { nombre: "Benjamín Moreno Bascur", partido: "PREP", rol: "Miembro Titular", email: "bmoreno@congreso.cl" },
      { nombre: "Álvaro Carter Fernández", partido: "UDI", rol: "Miembro Titular", email: "acarter@congreso.cl" },
      { nombre: "Daniel Manouchehri Moghadam Kashan Lobos", partido: "PS", rol: "Miembro Titular", email: "dmanouchehri@congreso.cl" },
      { nombre: "Nathalie Castillo Rojas", partido: "PC", rol: "Miembro Titular", email: "ncastillo@congreso.cl" }
    ]
  },
  {
    id: "economia",
    nombre: "Comisión de Economía, Fomento; Pymes, Consumidores y Turismo",
    descripcion: "Incentivo a la inversión, competitividad industrial, protección de datos y defensa de derechos del consumidor.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "TrendingUp",
    temas: ["Pymes", "SERNAC", "Consumidores", "Permisología", "Inversión", "Competencia", "Turismo"],
    integrantes: [
      { nombre: "Víctor Alejandro Pino Fuentes", partido: "Demócratas", rol: "Presidente de Comisión", email: "vpino@congreso.cl" },
      { nombre: "Daniel Manouchehri Moghadam Kashan Lobos", partido: "PS", rol: "Miembro Titular", email: "dmanouchehri@congreso.cl" },
      { nombre: "Boris Barrera Moreno", partido: "PC", rol: "Miembro Titular", email: "bbarrera@congreso.cl" },
      { nombre: "Miguel Mellado Suazo", partido: "RN", rol: "Miembro Titular", email: "mmellado@congreso.cl" },
      { nombre: "Flor Weisse Novoa", partido: "UDI", rol: "Miembro Titular", email: "fweisse@congreso.cl" },
      { nombre: "Gonzalo Winter Etcheberry", partido: "FA", rol: "Miembro Titular", email: "gwinter@congreso.cl" },
      { nombre: "Joaquín Lavín León", partido: "UDI", rol: "Miembro Titular", email: "jlavin@congreso.cl" },
      { nombre: "Javiera Morales Alvarado", partido: "FA", rol: "Miembro Titular", email: "jmorales@congreso.cl" },
      { nombre: "Sofía Cid Versalovic", partido: "IND-RN", rol: "Miembro Titular", email: "scid@congreso.cl" },
      { nombre: "Christian Matheson Villán", partido: "IND-Evópoli", rol: "Miembro Titular", email: "cmatheson@congreso.cl" },
      { nombre: "Ana María Bravo Castro", partido: "PS", rol: "Miembro Titular", email: "abravo@congreso.cl" },
      { nombre: "Alejandro Bernales Maldonado", partido: "PL", rol: "Miembro Titular", email: "abernales@congreso.cl" },
      { nombre: "Roberto Arroyo Muñoz", partido: "PSC", rol: "Miembro Titular", email: "rarroyo@congreso.cl" }
    ]
  },
  {
    id: "vivienda",
    nombre: "Comisión de Vivienda, Desarrollo Urbano y Bienes Nacionales",
    descripcion: "Regulación de planes reguladores, subsidios habitacionales, integración social y administración territorial.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Home",
    temas: ["Vivienda Social", "Campamentos", "Subsidios", "Planes Reguladores", "Bienes Nacionales", "Urbanismo"],
    integrantes: [
      { nombre: "Tomás Hirsch Goldschmidt", partido: "AH", rol: "Presidente de Comisión", email: "thirsch@congreso.cl" },
      { nombre: "Marcia Raphael Mora", partido: "RN", rol: "Miembro Titular", email: "mraphael@congreso.cl" },
      { nombre: "Juan Carlos Beltrán Silva", partido: "RN", rol: "Miembro Titular", email: "jbeltran@congreso.cl" },
      { nombre: "Jorge Saffirio Espinoza", partido: "Demócratas", rol: "Miembro Titular", email: "jsaffirio@congreso.cl" },
      { nombre: "Emilia Nuyado Ancapichún", partido: "PS", rol: "Miembro Titular", email: "enuyado@congreso.cl" },
      { nombre: "Cristhian Moreira Barros", partido: "UDI", rol: "Miembro Titular", email: "cmoreira@congreso.cl" },
      { nombre: "Daniel Lilayu Vivanco", partido: "UDI", rol: "Miembro Titular", email: "dlilayu@congreso.cl" },
      { nombre: "Sergio Bobadilla Muñoz", partido: "UDI", rol: "Miembro Titular", email: "sbobadilla@congreso.cl" },
      { nombre: "Ericka Ñanco Vásquez", partido: "FA", rol: "Miembro Titular", email: "enanco@congreso.cl" },
      { nombre: "Mercedes Bulnes Núñez", partido: "FA", rol: "Miembro Titular", email: "mbulnes@congreso.cl" },
      { nombre: "Boris Barrera Moreno", partido: "PC", rol: "Miembro Titular", email: "bbarrera@congreso.cl" },
      { nombre: "Viviana Delgado Riquelme", partido: "IND", rol: "Miembro Titular", email: "vdelgado@congreso.cl" },
      { nombre: "Chiara Barchiesi Chávez", partido: "PREP", rol: "Miembro Titular", email: "cbarchiesi@congreso.cl" }
    ]
  },
  {
    id: "derechos-humanos",
    nombre: "Comisión de Derechos Humanos y Pueblos Originarios",
    descripcion: "Protección de libertades individuales, memoria histórica, convenios internacionales y reconocimiento indígena.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Users",
    temas: ["Derechos Humanos", "Pueblos Originarios", "Pueblo Mapuche", "Convenio 169", "Memoria", "Libertades"],
    integrantes: [
      { nombre: "Lorena Fries Monleón", partido: "FA", rol: "Presidenta de Comisión", email: "lfries@congreso.cl" },
      { nombre: "Carmen Hertz Cádiz", partido: "PC", rol: "Miembro Titular", email: "chertz@congreso.cl" },
      { nombre: "Tomás Hirsch Goldschmidt", partido: "AH", rol: "Miembro Titular", email: "thirsch@congreso.cl" },
      { nombre: "Ericka Ñanco Vásquez", partido: "FA", rol: "Miembro Titular", email: "enanco@congreso.cl" },
      { nombre: "Hernán Palma Pérez", partido: "IND", rol: "Miembro Titular", email: "hpalma@congreso.cl" },
      { nombre: "Cristián Labbé Martínez", partido: "UDI", rol: "Miembro Titular", email: "clabbe@congreso.cl" },
      { nombre: "Johannes Kaiser Barents-von Hohenhagen", partido: "IND-PREP", rol: "Miembro Titular", email: "jkaiser@congreso.cl" },
      { nombre: "Gloria Naveillan Arriagada", partido: "IND", rol: "Miembro Titular", email: "gnaveillan@congreso.cl" },
      { nombre: "Ximena Ossandón Irarrázabal", partido: "RN", rol: "Miembro Titular", email: "xossandon@congreso.cl" },
      { nombre: "Jorge Rathgeb Schifferli", partido: "RN", rol: "Miembro Titular", email: "jrathgeb@congreso.cl" },
      { nombre: "Helia Molina Milman", partido: "PPD", rol: "Miembro Titular", email: "hmolina@congreso.cl" },
      { nombre: "Emilia Nuyado Ancapichún", partido: "PS", rol: "Miembro Titular", email: "enuyado@congreso.cl" },
      { nombre: "Cristhian Moreira Barros", partido: "UDI", rol: "Miembro Titular", email: "cmoreira@congreso.cl" }
    ]
  },
  {
    id: "ciencias",
    nombre: "Comisión de Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
    descripcion: "Políticas de innovación nacional, investigación espacial, inteligencia artificial y presupuestos de ciencias.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Cpu",
    temas: ["Inteligencia Artificial", "Innovación", "CENIA", "Tecnología", "Datos Personales", "Investigación"],
    integrantes: [
      { nombre: "Eric Aedo Jeldres", partido: "DC", rol: "Presidente de Comisión", email: "eaedo@congreso.cl" },
      { nombre: "Gael Yeomans Araya", partido: "FA", rol: "Miembro Titular", email: "gyeomans@congreso.cl" },
      { nombre: "Diego Schalper Sepúlveda", partido: "RN", rol: "Miembro Titular", email: "dschalper@congreso.cl" },
      { nombre: "Gonzalo Winter Etcheberry", partido: "FA", rol: "Miembro Titular", email: "gwinter@congreso.cl" },
      { nombre: "Daniel Lilayu Vivanco", partido: "UDI", rol: "Miembro Titular", email: "dlilayu@congreso.cl" },
      { nombre: "Helia Molina Milman", partido: "PPD", rol: "Miembro Titular", email: "hmolina@congreso.cl" },
      { nombre: "Rubén Oyarzo Figueroa", partido: "IND", rol: "Miembro Titular", email: "royarzo@congreso.cl" },
      { nombre: "Karen Medina Vásquez", partido: "IND", rol: "Miembro Titular", email: "kmedina@congreso.cl" },
      { nombre: "Hotuiti Teao Drago", partido: "IND-Evópoli", rol: "Miembro Titular", email: "hteao@congreso.cl" },
      { nombre: "Viviana Delgado Riquelme", partido: "IND", rol: "Miembro Titular", email: "vdelgado@congreso.cl" },
      { nombre: "Erika Olivera De la Fuente", partido: "Demócratas", rol: "Miembro Titular", email: "eolivera@congreso.cl" },
      { nombre: "Jorge Brito Hasbún", partido: "FA", rol: "Miembro Titular", email: "jbrito@congreso.cl" },
      { nombre: "Stephan Schubert Rubio", partido: "PREP", rol: "Miembro Titular", email: "sschubert@congreso.cl" }
    ]
  },
  {
    id: "mujeres-genero",
    nombre: "Comisión de Mujeres y Equidad de Género",
    descripcion: "Normativas de brecha salarial, pensiones de alimentos, violencia interfamiliar y derechos de la mujer.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Sparkles",
    temas: ["Mujeres", "Violencia de Género", "Equidad Salarial", "Pensiones de Alimentos", "Sociedad Conyugal"],
    integrantes: [
      { nombre: "Carolina Tello Bravo", partido: "FA", rol: "Presidenta de Comisión", email: "ctello@congreso.cl" },
      { nombre: "Ana María Gazmuri Vieira", partido: "AH", rol: "Miembro Titular", email: "agazmuri@congreso.cl" },
      { nombre: "Emilia Schneider Videla", partido: "FA", rol: "Miembro Titular", email: "eschneider@congreso.cl" },
      { nombre: "Daniela Serrano Salazar", partido: "PC", rol: "Miembro Titular", email: "dserrano@congreso.cl" },
      { nombre: "Marisela Santibáñez Novoa", partido: "PC", rol: "Miembro Titular", email: "msantibanez@congreso.cl" },
      { nombre: "Flor Weisse Novoa", partido: "UDI", rol: "Miembro Titular", email: "fweisse@congreso.cl" },
      { nombre: "Marta Bravo Salinas", partido: "UDI", rol: "Miembro Titular", email: "mbravo@congreso.cl" },
      { nombre: "Paula Labra Besserer", partido: "IND-RN", rol: "Miembro Titular", email: "plabra@congreso.cl" },
      { nombre: "Carla Morales Maldonado", partido: "RN", rol: "Miembro Titular", email: "cmorales@congreso.cl" },
      { nombre: "Chiara Barchiesi Chávez", partido: "PREP", rol: "Miembro Titular", email: "cbarchiesi@congreso.cl" },
      { nombre: "Gloria Naveillan Arriagada", partido: "IND", rol: "Miembro Titular", email: "gnaveillan@congreso.cl" },
      { nombre: "Danisa Astudillo Peiretti", partido: "PS", rol: "Miembro Titular", email: "dastudillo@congreso.cl" },
      { nombre: "Maite Orsini Pascal", partido: "FA", rol: "Miembro Titular", email: "morsini@congreso.cl" }
    ]
  },
  {
    id: "familias",
    nombre: "Comisión de la Familia",
    descripcion: "Derechos de infancia, cuidado de la tercera edad, adopciones y fortalecimiento del núcleo familiar.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Smile",
    temas: ["Familia", "Infancia", "Adopción", "Mejor Niñez", "Cuidado", "Matrimonio"],
    integrantes: [
      { nombre: "Francesca Muñoz González", partido: "PSC", rol: "Presidenta de Comisión", email: "fmunoz@congreso.cl" },
      { nombre: "Ana María Gazmuri Vieira", partido: "AH", rol: "Miembro Titular", email: "agazmuri@congreso.cl" },
      { nombre: "Mónica Arce Castro", partido: "IND", rol: "Miembro Titular", email: "marce@congreso.cl" },
      { nombre: "Maite Orsini Pascal", partido: "FA", rol: "Miembro Titular", email: "morsini@congreso.cl" },
      { nombre: "Natalia Romero Talguia", partido: "IND-UDI", rol: "Miembro Titular", email: "nromero@congreso.cl" },
      { nombre: "Eduardo Cornejo Lagos", partido: "UDI", rol: "Miembro Titular", email: "ecornejo@congreso.cl" },
      { nombre: "Carla Morales Maldonado", partido: "RN", rol: "Miembro Titular", email: "cmorales@congreso.cl" },
      { nombre: "Sara Concha Smith", partido: "PSC", rol: "Miembro Titular", email: "sconcha@congreso.cl" },
      { nombre: "Catalina Del Real Mihovilovic", partido: "PREP", rol: "Miembro Titular", email: "cdelreal@congreso.cl" },
      { nombre: "Claudia Mix Jiménez", partido: "FA", rol: "Miembro Titular", email: "cmix@congreso.cl" },
      { nombre: "Luis Malla Valenzuela", partido: "PL", rol: "Miembro Titular", email: "lmalla@congreso.cl" },
      { nombre: "Marlene Pérez Cartes", partido: "IND-UDI", rol: "Miembro Titular", email: "mperez@congreso.cl" },
      { nombre: "Felipe Donoso Castro", partido: "UDI", rol: "Miembro Titular", email: "fdonoso@congreso.cl" }
    ]
  },
  {
    id: "cultura",
    nombre: "Comisión de Cultura, Artes y Comunicaciones",
    descripcion: "Políticas de patrimonio cultural de la nación, fomento de artes escénicas de Chile y libertad de prensa.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Sparkles",
    temas: ["Patrimonio", "Cultura", "Artes", "Música", "Libertad de Prensa", "Teatro", "Cine"],
    integrantes: [
      { nombre: "Marta González Olea", partido: "IND-PPD", rol: "Presidenta de Comisión", email: "mgonzalez@congreso.cl" },
      { nombre: "Alejandro Bernales Maldonado", partido: "PL", rol: "Miembro Titular", email: "abernales@congreso.cl" },
      { nombre: "Viviana Delgado Riquelme", partido: "IND", rol: "Miembro Titular", email: "vdelgado@congreso.cl" },
      { nombre: "Daniela Serrano Salazar", partido: "PC", rol: "Miembro Titular", email: "dserrano@congreso.cl" },
      { nombre: "Eduardo Durán Salinas", partido: "RN", rol: "Miembro Titular", email: "eduran@congreso.cl" },
      { nombre: "Gastón Von Mühlenbrock Zamora", partido: "UDI", rol: "Miembro Titular", email: "gvonmuhlenbrock@congreso.cl" },
      { nombre: "Mauricio Ojeda Rebolledo", partido: "IND", rol: "Miembro Titular", email: "mojeda@congreso.cl" },
      { nombre: "Catalina Pérez Salinas", partido: "FA", rol: "Miembro Titular", email: "cperez@congreso.cl" },
      { nombre: "Hotuiti Teao Drago", partido: "IND-Evópoli", rol: "Miembro Titular", email: "hteao@congreso.cl" },
      { nombre: "Gaspar Rivas Sánchez", partido: "IND", rol: "Miembro Titular", email: "grivas@congreso.cl" },
      { nombre: "Claudia Mix Jiménez", partido: "FA", rol: "Miembro Titular", email: "cmix@congreso.cl" },
      { nombre: "Jorge Rathgeb Schifferli", partido: "RN", rol: "Miembro Titular", email: "jrathgeb@congreso.cl" },
      { nombre: "Nathalie Castillo Rojas", partido: "PC", rol: "Miembro Titular", email: "ncastillo@congreso.cl" }
    ]
  },
  {
    id: "deportes",
    nombre: "Comisión de Deportes y Recreación",
    descripcion: "Políticas de fomento del deporte de alto rendimiento, recintos deportivos y vida saludable.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Award",
    temas: ["Deportes", "Alto Rendimiento", "Estadios", "Sociedades Anónimas Deportivas", "Fútbol", "Atletas"],
    integrantes: [
      { nombre: "Roberto Arroyo Muñoz", partido: "PSC", rol: "Presidente de Comisión", email: "rarroyo@congreso.cl" },
      { nombre: "Cristián Tapia Ramos", partido: "IND-PPD", rol: "Miembro Titular", email: "ctapia@congreso.cl" },
      { nombre: "Marisela Santibáñez Novoa", partido: "PC", rol: "Miembro Titular", email: "msantibanez@congreso.cl" },
      { nombre: "Erika Olivera De la Fuente", partido: "Demócratas", rol: "Miembro Titular", email: "eolivera@congreso.cl" },
      { nombre: "Jorge Guzmán Zepeda", partido: "Evópoli", rol: "Miembro Titular", email: "jguzman@congreso.cl" },
      { nombre: "José Carlos Meza Pereira", partido: "PREP", rol: "Miembro Titular", email: "jmeza@congreso.cl" },
      { nombre: "Marco Antonio Sulantay Olivares", partido: "UDI", rol: "Miembro Titular", email: "msulantay@congreso.cl" },
      { nombre: "Jaime Mulet Martínez", partido: "FRVS", rol: "Miembro Titular", email: "jmulet@congreso.cl" },
      { nombre: "Felipe Camaño Cárdenas", partido: "IND-DC", rol: "Miembro Titular", email: "fcamano@congreso.cl" },
      { nombre: "Andrés Celis Montt", partido: "RN", rol: "Miembro Titular", email: "acelis@congreso.cl" },
      { nombre: "Daniel Manouchehri Moghadam Kashan Lobos", partido: "PS", rol: "Miembro Titular", email: "dmanouchehri@congreso.cl" },
      { nombre: "Cristián Labbé Martínez", partido: "UDI", rol: "Miembro Titular", email: "clabbe@congreso.cl" },
      { nombre: "Juan Santana Castillo", partido: "PS", rol: "Miembro Titular", email: "jsantana@congreso.cl" }
    ]
  },
  {
    id: "recursos-hidricos",
    nombre: "Comisión de Recursos Hídricos y Desertificación",
    descripcion: "Regulación de caudales, código de aguas, sequía e infraestructura de desalinización de agua.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Droplet",
    temas: ["Agua", "Código de Aguas", "Sequía", "Desaladoras", "Cuencas", "APR", "DGA"],
    integrantes: [
      { nombre: "Nelson Venegas Salazar", partido: "PS", rol: "Presidente de Comisión", email: "nvenegas@congreso.cl" },
      { nombre: "Chiara Barchiesi Chávez", partido: "PREP", rol: "Miembro Titular", email: "cbarchiesi@congreso.cl" },
      { nombre: "Jaime Mulet Martínez", partido: "FRVS", rol: "Miembro Titular", email: "jmulet@congreso.cl" },
      { nombre: "Víctor Alejandro Pino Fuentes", partido: "Demócratas", rol: "Miembro Titular", email: "vpino@congreso.cl" },
      { nombre: "Nathalie Castillo Rojas", partido: "PC", rol: "Miembro Titular", email: "ncastillo@congreso.cl" },
      { nombre: "René Alinco Bustos", partido: "IND", rol: "Miembro Titular", email: "ralinco@congreso.cl" },
      { nombre: "Marco Antonio Sulantay Olivares", partido: "UDI", rol: "Miembro Titular", email: "msulantay@congreso.cl" },
      { nombre: "Cristóbal Martínez Ramírez", partido: "UDI", rol: "Miembro Titular", email: "cmartinez@congreso.cl" },
      { nombre: "Francisco Pulgar Castillo", partido: "IND", rol: "Miembro Titular", email: "fpulgar@congreso.cl" },
      { nombre: "Alexis Sepúlveda Soto", partido: "PR", rol: "Miembro Titular", email: "asepulveda@congreso.cl" },
      { nombre: "Jorge Rathgeb Schifferli", partido: "RN", rol: "Miembro Titular", email: "jrathgeb@congreso.cl" },
      { nombre: "Benjamín Moreno Bascur", partido: "PREP", rol: "Miembro Titular", email: "bmoreno@congreso.cl" },
      { nombre: "Daniel Melo Contreras", partido: "PS", rol: "Miembro Titular", email: "dmelo@congreso.cl" }
    ]
  },
  {
    id: "emergencias",
    nombre: "Comisión de Emergencias, Desastres Naturales y Bomberos",
    descripcion: "Financiamiento de cuerpos de bomberos chilenos, gestión del Senapred y planes nacionales ante siniestros.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Flame",
    temas: ["Bomberos", "SENAPRED", "Incendios", "Terremotos", "Emergencias", "Protección Civil"],
    integrantes: [
      { nombre: "Jaime Araya Guerrero", partido: "IND-PPD", rol: "Presidente de Comisión", email: "jaraya@congreso.cl" },
      { nombre: "Felipe Camaño Cárdenas", partido: "IND-DC", rol: "Miembro Titular", email: "fcamano@congreso.cl" },
      { nombre: "Mauro González Villarroel", partido: "RN", rol: "Miembro Titular", email: "mgonzalezv@congreso.cl" },
      { nombre: "Marta Bravo Salinas", partido: "UDI", rol: "Miembro Titular", email: "mbravo@congreso.cl" },
      { nombre: "Francisco Pulgar Castillo", partido: "IND", rol: "Miembro Titular", email: "fpulgar@congreso.cl" },
{ nombre: "Luis Sánchez Ossa", partido: "PREP", rol: "Miembro Titular", email: "lsanchez@congreso.cl" },
      { nombre: "Sebastián Videla Castillo", partido: "IND-PL", rol: "Miembro Titular", email: "svidela@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Tomás Lagomarsino Guzmán", partido: "IND-PR", rol: "Miembro Titular", email: "tlagomarsino@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Nelson Venegas Salazar", partido: "PS", rol: "Miembro Titular", email: "nvenegas@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Jorge Guzmán Zepeda", partido: "Evópoli", rol: "Miembro Titular", email: "jguzman@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Harry Jürgensen Rundshagen", partido: "IND-PREP", rol: "Miembro Titular", email: "hjurgensen@congreso.cl", camara: "Cámara de Diputadas y Diputados" }
    ]
  },
  {
    id: "pesca",
    nombre: "Comisión de Pesca, Acuicultura e Intereses Marítimos",
    descripcion: "Regulación de cuotas pesqueras, acuicultura de salmónidos, caletas pesqueras y sustentabilidad de recursos marinos.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Anchor",
    temas: ["Pesca", "Acuicultura", "Ley de Pesca", "Caletas", "Sernapesca", "Recursos Marinos", "Salmones"],
    integrantes: [
      { nombre: "Alejandro Bernales Maldonado", partido: "PL", rol: "Presidente de Comisión", email: "abernales@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Mauro González Villarroel", partido: "RN", rol: "Miembro Titular", email: "mgonzalezv@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Sergio Bobadilla Muñoz", partido: "UDI", rol: "Miembro Titular", email: "sbobadilla@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Carolina Tello Bravo", partido: "FA", rol: "Miembro Titular", email: "ctello@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Félix Bugueño Campos", partido: "FA", rol: "Miembro Titular", email: "fbugueno@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Nathalie Castillo Rojas", partido: "PC", rol: "Miembro Titular", email: "ncastillo@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Ana María Gazmuri Vieira", partido: "AH", rol: "Miembro Titular", email: "agazmuri@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Chiara Barchiesi Chávez", partido: "PREP", rol: "Miembro Titular", email: "cbarchiesi@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "José Carlos Meza Pereira", partido: "PREP", rol: "Miembro Titular", email: "jmeza@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Jaime Sáez Quiroz", partido: "FA", rol: "Miembro Titular", email: "jsaez@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Tomás De Rementería Venegas", partido: "PS", rol: "Miembro Titular", email: "tderementeria@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Cosme Mellado Pino", partido: "PR", rol: "Miembro Titular", email: "cmellado@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Carlos Bianchi Chelech", partido: "IND-PPD", rol: "Miembro Titular", email: "cbianchi@congreso.cl", camara: "Cámara de Diputadas y Diputados" }
    ]
  },
  {
    id: "desarrollo-social",
    nombre: "Comisión de Desarrollo Social, Superación de la Pobreza y Planificación",
    descripcion: "Políticas de subsidios estatales, superación de la pobreza, registro social de hogares y sistema nacional de apoyos y cuidados.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "HeartHandshake",
    temas: ["Pobreza", "Registro Social de Hogares", "Chile Cuida", "FOSIS", "Subsidios", "Inclusión Social", "MDSF"],
    integrantes: [
      { nombre: "Marlene Pérez Cartes", partido: "IND-UDI", rol: "Presidenta de Comisión", email: "mperez@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Joanna Pérez Olea", partido: "Demócratas", rol: "Miembro Titular", email: "jperez@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Clara Sagardía Cabezas", partido: "FA", rol: "Miembro Titular", email: "csagardia@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Daniela Serrano Salazar", partido: "PC", rol: "Miembro Titular", email: "dserrano@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Catalina Pérez Salinas", partido: "FA", rol: "Miembro Titular", email: "cperez@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Eduardo Cornejo Lagos", partido: "UDI", rol: "Miembro Titular", email: "ecornejo@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Carla Morales Maldonado", partido: "RN", rol: "Miembro Titular", email: "cmorales@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Frank Sauerbaum Muñoz", partido: "RN", rol: "Miembro Titular", email: "fsauerbaum@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Mónica Arce Castro", partido: "IND", rol: "Miembro Titular", email: "marce@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Sara Concha Smith", partido: "PSC", rol: "Miembro Titular", email: "sconcha@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Héctor Barría Angulo", partido: "DC", rol: "Miembro Titular", email: "hbarria@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Danisa Astudillo Peiretti", partido: "PS", rol: "Miembro Titular", email: "dastudillo@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Marcos Ilabaca Cerda", partido: "PS", rol: "Miembro Titular", email: "milabaca@congreso.cl", camara: "Cámara de Diputadas y Diputados" }
    ]
  },
  {
    id: "personas-mayores",
    nombre: "Comisión de Personas Mayores y Discapacidad",
    descripcion: "Protección y bienestar de personas de la tercera edad, accesibilidad universal y derechos de personas con discapacidad.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "UserCheck",
    temas: ["Adultos Mayores", "Discapacidad", "SENAMA", "SENADIS", "Accesibilidad", "Cuidados", "Inclusión"],
    integrantes: [
      { nombre: "Yovana Ahumada Palma", partido: "IND", rol: "Presidenta de Comisión", email: "yahumada@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Carolina Tello Bravo", partido: "FA", rol: "Miembro Titular", email: "ctello@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Marta Bravo Salinas", partido: "UDI", rol: "Miembro Titular", email: "mbravo@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "María Luisa Cordero Velásquez", partido: "IND-RN", rol: "Miembro Titular", email: "mcordero@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Hernán Palma Pérez", partido: "IND", rol: "Miembro Titular", email: "hpalma@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Natalia Romero Talguia", partido: "IND-UDI", rol: "Miembro Titular", email: "nromero@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Carla Morales Maldonado", partido: "RN", rol: "Miembro Titular", email: "cmorales@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Daniel Lilayu Vivanco", partido: "UDI", rol: "Miembro Titular", email: "dlilayu@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Emilia Nuyado Ancapichún", partido: "PS", rol: "Miembro Titular", email: "enuyado@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Claudia Mix Jiménez", partido: "FA", rol: "Miembro Titular", email: "cmix@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Luis Malla Valenzuela", partido: "PL", rol: "Miembro Titular", email: "lmalla@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Roberto Arroyo Muñoz", partido: "PSC", rol: "Miembro Titular", email: "rarroyo@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Héctor Barría Angulo", partido: "DC", rol: "Miembro Titular", email: "hbarria@congreso.cl", camara: "Cámara de Diputadas y Diputados" }
    ]
  },
  {
    id: "etica",
    nombre: "Comisión de Ética y Transparencia",
    descripcion: "Control de probidad, disciplina reglamentaria, declaraciones de patrimonio y sanciones a conductas parlamentarias.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "CheckCircle",
    temas: ["Probidad", "Ética", "Transparencia", "Sanciones", "Reglamento", "Conflictos de Interés"],
    integrantes: [
      { nombre: "Bernardo Berger Fett", partido: "IND-RN", rol: "Presidente de Comisión", email: "bberger@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Carmen Hertz Cádiz", partido: "PC", rol: "Miembro Titular", email: "chertz@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Raúl Leiva Carvajal", partido: "PS", rol: "Miembro Titular", email: "rleiva@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Guillermo Ramírez Diez", partido: "UDI", rol: "Miembro Titular", email: "gramirez@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Renzo Trisotti Martínez", partido: "PREP", rol: "Miembro Titular", email: "rtrisotti@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Marcos Ilabaca Cerda", partido: "PS", rol: "Miembro Titular", email: "milabaca@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Andrés Jouannet Valderrama", partido: "Amarillos", rol: "Miembro Titular", email: "ajouannet@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Matías Walker Prieto", partido: "Demócratas", rol: "Miembro Titular", email: "mwalker@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Jaime Sáez Quiroz", partido: "FA", rol: "Miembro Titular", email: "jsaez@congreso.cl", camara: "Cámara de Diputadas y Diputados" }
    ]
  },
  {
    id: "regimen-interno",
    nombre: "Comisión de Régimen Interno y Administración",
    descripcion: "Gestión administrativa, presupuesto institucional de la corporación y régimen funcional de la Cámara.",
    estado: "Comisión Permanente",
    chamber: "CD",
    prefix: "cd-",
    icon: "Building",
    temas: ["Administración", "Presupuesto de la Cámara", "Personal", "Infraestructura", "Régimen Interno"],
    integrantes: [
      { nombre: "Jorge Alessandri Vergara", partido: "UDI", rol: "Presidente de Comisión", email: "jalessandri@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Raúl Soto Mardones", partido: "PPD", rol: "Miembro Titular", email: "rsoto@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Vlado Mirosevic Verdugo", partido: "PL", rol: "Miembro Titular", email: "vmirosevic@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Ricardo Cifuentes Lillo", partido: "DC", rol: "Miembro Titular", email: "rcifuentes@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Frank Sauerbaum Muñoz", partido: "RN", rol: "Miembro Titular", email: "fsauerbaum@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Luis Sánchez Ossa", partido: "PREP", rol: "Miembro Titular", email: "lsanchez@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Daniel Manouchehri Moghadam Kashan Lobos", partido: "PS", rol: "Miembro Titular", email: "dmanouchehri@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Gonzalo Winter Etcheberry", partido: "FA", rol: "Miembro Titular", email: "gwinter@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Boris Barrera Moreno", partido: "PC", rol: "Miembro Titular", email: "bbarrera@congreso.cl", camara: "Cámara de Diputadas y Diputados" }
    ]
  }
];

// Integrantes del Senado sincronizados directamente con el Web Service Oficial del Senado:
// https://tramitacion.senado.cl/wspublico/comisiones.php
export const SENADO_COMISIONES_DETALLE: ComisionMeta[] = [
  {
    id: "constitucion",
    senadoId: "186",
    nombre: "Comisión de Constitución, Legislación, Justicia y Reglamento",
    descripcion: "Reformas de rango constitucional, leyes de cuórum calificado, nombramientos de ministros de Corte y TC.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Scale",
    color: "slate",
    featured: true,
    email: "constitucion@senado.cl",
    temas: ["Constitución", "Corte Suprema", "Tribunal Constitucional", "Justicia", "Leyes Orgánicas"],
    integrantes: [
      { nombre: "Paulina Núñez Urrutia", partido: "RN", rol: "Presidenta de Comisión", email: "paulinanunez@senado.cl", camara: "Senado de la República" },
      { nombre: "Pedro Araya Guerrero", partido: "PPD", rol: "Miembro Titular", email: "paraya@senado.cl", camara: "Senado de la República" },
      { nombre: "Luz Eliana Ebensperger Orrego", partido: "UDI", rol: "Miembro Titular", email: "lebensperger@senado.cl", camara: "Senado de la República" },
      { nombre: "Rodrigo Galilea Vial", partido: "RN", rol: "Miembro Titular", email: "rgalilea@senado.cl", camara: "Senado de la República" },
      { nombre: "Alfonso De Urresti Longton", partido: "PS", rol: "Miembro Titular", email: "adeurresti@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "hacienda",
    senadoId: "188",
    nombre: "Comisión de Hacienda",
    descripcion: "Control de partidas de presupuesto anual, financiamiento de salud, educación y convenios internacionales.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "TrendingUp",
    color: "emerald",
    featured: true,
    email: "hacienda@senado.cl",
    temas: ["Presupuesto", "Sostenibilidad Fiscal", "Pacto Fiscal", "Tributaria", "CFA", "Deuda"],
    integrantes: [
      { nombre: "Felipe Kast Sommerhoff", partido: "Evópoli", rol: "Presidente de Comisión", email: "fkast@senado.cl", camara: "Senado de la República" },
      { nombre: "Juan Antonio Coloma Correa", partido: "UDI", rol: "Miembro Titular", email: "jcoloma@senado.cl", camara: "Senado de la República" },
      { nombre: "José García Ruminot", partido: "RN", rol: "Miembro Titular", email: "jgarcia@senado.cl", camara: "Senado de la República" },
      { nombre: "Ricardo Lagos Weber", partido: "PPD", rol: "Miembro Titular", email: "rlagos@senado.cl", camara: "Senado de la República" },
      { nombre: "Daniel Núñez Arancibia", partido: "PC", rol: "Miembro Titular", email: "danielnunez@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "trabajo-y-prevision",
    senadoId: "194",
    nombre: "Comisión de Trabajo y Previsión Social",
    descripcion: "Revisión del Senado para proyectos de pensiones, jornada laboral flexible y seguridad física ocupacional.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "HardHat",
    color: "emerald",
    featured: true,
    email: "trabasen@senado.cl",
    temas: ["Pensiones", "Reforma Previsional", "Seguridad Social", "Jornada Laboral", "Superintendencia"],
    integrantes: [
      { nombre: "Juan Luis Castro González", partido: "PS", rol: "Presidente de Comisión", email: "juanluiscastro@senado.cl", camara: "Senado de la República" },
      { nombre: "Loreto Carvajal Ambiado", partido: "PPD", rol: "Miembro Titular", email: "lcarvajal@senado.cl", camara: "Senado de la República" },
      { nombre: "Rodrigo Galilea Vial", partido: "RN", rol: "Miembro Titular", email: "rgalilea@senado.cl", camara: "Senado de la República" },
      { nombre: "Gastón Saavedra Chandía", partido: "PS", rol: "Miembro Titular", email: "gsaavedra@senado.cl", camara: "Senado de la República" },
      { nombre: "Alejandra Sepúlveda Orbenes", partido: "IND", rol: "Miembro Titular", email: "asepulveda@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "seguridad-publica",
    senadoId: "615",
    nombre: "Comisión de Seguridad Pública",
    descripcion: "Discusión parlamentaria de combate al delito, modernización de policías, ley de armas y de fronteras.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Shield",
    email: "seguridadpublica@senado.cl",
    temas: ["Seguridad Pública", "Ley Antiterrorista", "Ministerio de Seguridad", "Reglas Uso Fuerza", "Carabineros"],
    integrantes: [
      { nombre: "Iván Flores García", partido: "DC", rol: "Presidente de Comisión", email: "iflores@senado.cl", camara: "Senado de la República" },
      { nombre: "José Miguel Insulza Salinas", partido: "PS", rol: "Miembro Titular", email: "jminsulza@senado.cl", camara: "Senado de la República" },
      { nombre: "Manuel José Ossandón Irarrázabal", partido: "RN", rol: "Miembro Titular", email: "mjossandon@senado.cl", camara: "Senado de la República" },
      { nombre: "Paulina Vodanovic Rojas", partido: "PS", rol: "Miembro Titular", email: "pvodanovic@senado.cl", camara: "Senado de la República" },
      { nombre: "Felipe Kast Sommerhoff", partido: "Evópoli", rol: "Miembro Titular", email: "fkast@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "salud",
    senadoId: "195",
    nombre: "Comisión de Salud",
    descripcion: "Fiscalización de red hospitalaria nacional, ley de isapres, aseguradoras y planes preventivos estatales.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Heart",
    email: "saludsen@senado.cl",
    temas: ["Isapres", "Fonasa", "Hospitales", "Deuda Isapres", "Cobertura Complementaria"],
    integrantes: [
      { nombre: "Javier Macaya Danús", partido: "UDI", rol: "Presidente de Comisión", email: "jmacaya@senado.cl", camara: "Senado de la República" },
      { nombre: "Juan Luis Castro González", partido: "PS", rol: "Miembro Titular", email: "juanluiscastro@senado.cl", camara: "Senado de la República" },
      { nombre: "Francisco Chahuán Chahuán", partido: "RN", rol: "Miembro Titular", email: "fchahuan@senado.cl", camara: "Senado de la República" },
      { nombre: "Sergio Gahona Salazar", partido: "UDI", rol: "Miembro Titular", email: "sgahona@senado.cl", camara: "Senado de la República" },
      { nombre: "Ximena Órdenes Neira", partido: "PPD", rol: "Miembro Titular", email: "xordenes@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "educacion",
    senadoId: "189",
    nombre: "Comisión de Educación y Cultura",
    descripcion: "Estatuto docente, financiamiento escolar técnico-profesional y resguardo del patrimonio histórico.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "BookOpen",
    email: "edusen@senado.cl",
    temas: ["Educación Superior", "CRUCH", "Estatuto Docente", "Gratuidad", "Patrimonio"],
    integrantes: [
      { nombre: "José García Ruminot", partido: "RN", rol: "Presidente de Comisión", email: "jgarcia@senado.cl", camara: "Senado de la República" },
      { nombre: "Carmen Gloria Aravena Acuña", partido: "PREP", rol: "Miembro Titular", email: "cgaravena@senado.cl", camara: "Senado de la República" },
      { nombre: "Fidel Espinoza Sandoval", partido: "PS", rol: "Miembro Titular", email: "fespinoza@senado.cl", camara: "Senado de la República" },
      { nombre: "Yasna Provoste Campillay", partido: "DC", rol: "Miembro Titular", email: "yasnaprovoste@senado.cl", camara: "Senado de la República" },
      { nombre: "Gustavo Sanhueza Dueñas", partido: "UDI", rol: "Miembro Titular", email: "gsanhueza@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "defensa",
    senadoId: "190",
    nombre: "Comisión de Defensa Nacional",
    descripcion: "Asuntos estratégicos de seguridad exterior, ciberseguridad militar, radares y personal de las FF.AA.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "ShieldAlert",
    email: "defensasen@senado.cl",
    temas: ["Fuerzas Armadas", "Ciberdefensa", "Defensa Estratégica", "Soberanía", "Militares"],
    integrantes: [
      { nombre: "Kenneth Pugh Olavarría", partido: "IND", rol: "Presidente de Comisión", email: "kpugh@senado.cl", camara: "Senado de la República" },
      { nombre: "Pedro Araya Guerrero", partido: "PPD", rol: "Miembro Titular", email: "paraya@senado.cl", camara: "Senado de la República" },
      { nombre: "Francisco Huenchumilla Jaramillo", partido: "DC", rol: "Miembro Titular", email: "fhuenchumilla@senado.cl", camara: "Senado de la República" },
      { nombre: "Javier Macaya Danús", partido: "UDI", rol: "Miembro Titular", email: "jmacaya@senado.cl", camara: "Senado de la República" },
      { nombre: "Gastón Saavedra Chandía", partido: "PS", rol: "Miembro Titular", email: "gsaavedra@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "rree",
    senadoId: "221",
    nombre: "Comisión de Relaciones Exteriores",
    descripcion: "Discusión y sanción parlamentaria de tratados de libre comercio, misiones internacionales y fronteras.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Globe",
    email: "rreesen@senado.cl",
    temas: ["Tratados Internacionales", "Cancillería", "Límites", "Tratados Bilaterales", "Diplomacia"],
    integrantes: [
      { nombre: "José Miguel Insulza Salinas", partido: "PS", rol: "Presidente de Comisión", email: "jminsulza@senado.cl", camara: "Senado de la República" },
      { nombre: "Francisco Chahuán Chahuán", partido: "RN", rol: "Miembro Titular", email: "fchahuan@senado.cl", camara: "Senado de la República" },
      { nombre: "Rojo Edwards", partido: "PREP", rol: "Miembro Titular", email: "redwards@senado.cl", camara: "Senado de la República" },
      { nombre: "Iván Moreira Barros", partido: "UDI", rol: "Miembro Titular", email: "imoreira@senado.cl", camara: "Senado de la República" },
      { nombre: "Jaime Quintana Leal", partido: "PPD", rol: "Miembro Titular", email: "jquintana@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "gobierno",
    senadoId: "185",
    nombre: "Comisión de Gobierno, Descentralización y Regionalización",
    descripcion: "Transparencia del Estado, elección de gobernadores, atribuciones de cores y ley de compras públicas.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Landmark",
    email: "gobsen@senado.cl",
    temas: ["Descentralización", "Gobernaciones", "Compras Públicas", "Probidad", "Regionalización"],
    integrantes: [
      { nombre: "Manuel José Ossandón Irarrázabal", partido: "RN", rol: "Presidente de Comisión", email: "mjossandon@senado.cl", camara: "Senado de la República" },
      { nombre: "Carlos Ignacio Kuschel Silva", partido: "RN", rol: "Miembro Titular", email: "ckuschel@senado.cl", camara: "Senado de la República" },
      { nombre: "Paulina Vodanovic Rojas", partido: "PS", rol: "Miembro Titular", email: "pvodanovic@senado.cl", camara: "Senado de la República" },
      { nombre: "Loreto Carvajal Ambiado", partido: "PPD", rol: "Miembro Titular", email: "lcarvajal@senado.cl", camara: "Senado de la República" },
      { nombre: "Esteban Velásquez Núñez", partido: "FRVS", rol: "Miembro Titular", email: "evelasquez@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "obras-publicas",
    senadoId: "191",
    nombre: "Comisión de Obras Públicas",
    descripcion: "Legislación en concesiones de autopistas, pavimentación escolar y planes de embalses hídricos.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "HardHat",
    email: "oopsen@senado.cl",
    temas: ["Concesiones", "MOP", "Infraestructura", "Carreteras", "Embalses"],
    integrantes: [
      { nombre: "Carlos Ignacio Kuschel Silva", partido: "RN", rol: "Presidente de Comisión", email: "ckuschel@senado.cl", camara: "Senado de la República" },
      { nombre: "Juan Castro Prieto", partido: "RN", rol: "Miembro Titular", email: "jcastro@senado.cl", camara: "Senado de la República" },
      { nombre: "Alfonso De Urresti Longton", partido: "PS", rol: "Miembro Titular", email: "adeurresti@senado.cl", camara: "Senado de la República" },
      { nombre: "Sergio Gahona Salazar", partido: "UDI", rol: "Miembro Titular", email: "sgahona@senado.cl", camara: "Senado de la República" },
      { nombre: "Yasna Provoste Campillay", partido: "DC", rol: "Miembro Titular", email: "yasnaprovoste@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "agricultura",
    senadoId: "192",
    nombre: "Comisión de Agricultura",
    descripcion: "Normas de parcelaciones rurales, sanidad animal del SAG, seguros apícolas y fomento del sector agrícola.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Leaf",
    email: "agrisen@senado.cl",
    temas: ["Agricultura", "SAG", "INDAP", "Suelo Agrícola", "Sanidad Vegetal", "Productores"],
    integrantes: [
      { nombre: "Juan Castro Prieto", partido: "RN", rol: "Presidente de Comisión", email: "jcastro@senado.cl", camara: "Senado de la República" },
      { nombre: "Carmen Gloria Aravena Acuña", partido: "PREP", rol: "Miembro Titular", email: "cgaravena@senado.cl", camara: "Senado de la República" },
      { nombre: "Fidel Espinoza Sandoval", partido: "PS", rol: "Miembro Titular", email: "fespinoza@senado.cl", camara: "Senado de la República" },
      { nombre: "Iván Flores García", partido: "DC", rol: "Miembro Titular", email: "iflores@senado.cl", camara: "Senado de la República" },
      { nombre: "Alejandra Sepúlveda Orbenes", partido: "IND", rol: "Miembro Titular", email: "asepulveda@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "medio-ambiente",
    senadoId: "193",
    nombre: "Comisión de Medio Ambiente, Cambio Climático y Bienes Nacionales",
    descripcion: "Protección ambiental de humedales, ley de reciclaje, borde costero y restitución de terrenos fiscales.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Leaf",
    email: "mambsen@senado.cl",
    temas: ["Humedales", "Bienes Nacionales", "Servicio Biodiversidad (SBAP)", "Reciclaje", "Contaminación"],
    integrantes: [
      { nombre: "Isabel Allende Bussi", partido: "PS", rol: "Presidenta de Comisión", email: "iallenbussi@senado.cl", camara: "Senado de la República" },
      { nombre: "Ricardo Lagos Weber", partido: "PPD", rol: "Miembro Titular", email: "rlagos@senado.cl", camara: "Senado de la República" },
      { nombre: "Paulina Núñez Urrutia", partido: "RN", rol: "Miembro Titular", email: "paulinanunez@senado.cl", camara: "Senado de la República" },
      { nombre: "Sergio Gahona Salazar", partido: "UDI", rol: "Miembro Titular", email: "sgahona@senado.cl", camara: "Senado de la República" },
      { nombre: "Matías Walker Prieto", partido: "Demócratas", rol: "Miembro Titular", email: "mwalker@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "mineria",
    senadoId: "196",
    nombre: "Comisión de Minería y Energía",
    descripcion: "Políticas del cobre, royalty minero, descarbonización industrial de Chile y reforma al mercado del gas.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Zap",
    email: "mineriaysen@senado.cl",
    temas: ["Royalty", "Cobre", "Litio", "Estrategia Nacional del Litio", "Gas", "Energía Eléctrica"],
    integrantes: [
      { nombre: "Juan Luis Castro González", partido: "PS", rol: "Presidente de Comisión", email: "juanluiscastro@senado.cl", camara: "Senado de la República" },
      { nombre: "Loreto Carvajal Ambiado", partido: "PPD", rol: "Miembro Titular", email: "lcarvajal@senado.cl", camara: "Senado de la República" },
      { nombre: "José Miguel Durana Semir", partido: "UDI", rol: "Miembro Titular", email: "jdurana@senado.cl", camara: "Senado de la República" },
      { nombre: "Luz Eliana Ebensperger Orrego", partido: "UDI", rol: "Miembro Titular", email: "lebensperger@senado.cl", camara: "Senado de la República" },
      { nombre: "Rafael Prohens Espinosa", partido: "RN", rol: "Miembro Titular", email: "rprohens@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "economia",
    senadoId: "187",
    nombre: "Comisión de Economía",
    descripcion: "Revisión de proyectos de fomento productivo, protección de datos bancarios, quiebras de empresas y mipymes.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "TrendingUp",
    email: "economiasen@senado.cl",
    temas: ["Inversión", "Pymes", "SERNAC", "Mercado Financiero", "Competencia"],
    integrantes: [
      { nombre: "Loreto Carvajal Ambiado", partido: "PPD", rol: "Presidenta de Comisión", email: "lcarvajal@senado.cl", camara: "Senado de la República" },
      { nombre: "José Miguel Durana Semir", partido: "UDI", rol: "Miembro Titular", email: "jdurana@senado.cl", camara: "Senado de la República" },
      { nombre: "Daniel Núñez Arancibia", partido: "PC", rol: "Miembro Titular", email: "danielnunez@senado.cl", camara: "Senado de la República" },
      { nombre: "Kenneth Pugh Olavarría", partido: "IND", rol: "Miembro Titular", email: "kpugh@senado.cl", camara: "Senado de la República" },
      { nombre: "Gustavo Sanhueza Dueñas", partido: "UDI", rol: "Miembro Titular", email: "gsanhueza@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "vivienda",
    senadoId: "197",
    nombre: "Comisión de Vivienda y Urbanismo",
    descripcion: "Políticas de regularización de campamentos, comités de vivienda social y ley de copropiedad inmobiliaria.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Home",
    email: "vivsen@senado.cl",
    temas: ["Vivienda", "Plan de Emergencia Habitacional", "Urbanismo", "Campamentos", "Copropiedad"],
    integrantes: [
      { nombre: "Fidel Espinoza Sandoval", partido: "PS", rol: "Presidente de Comisión", email: "fespinoza@senado.cl", camara: "Senado de la República" },
      { nombre: "María José Gatica Bertin", partido: "RN", rol: "Miembro Titular", email: "mjgatica@senado.cl", camara: "Senado de la República" },
      { nombre: "Carlos Ignacio Kuschel Silva", partido: "RN", rol: "Miembro Titular", email: "ckuschel@senado.cl", camara: "Senado de la República" },
      { nombre: "Claudia Pascual Grau", partido: "PC", rol: "Miembro Titular", email: "cpascual@senado.cl", camara: "Senado de la República" },
      { nombre: "David Sandoval Plaza", partido: "UDI", rol: "Miembro Titular", email: "dsandoval@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "derechos-humanos",
    senadoId: "199",
    nombre: "Comisión de Derechos Humanos, Nacionalidad y Ciudadanía",
    descripcion: "Revisión de cartas de nacionalidad por gracia chilena, convenios de la OEA y derechos fundamentales.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Users",
    email: "ddhhsen@senado.cl",
    temas: ["Derechos Humanos", "Nacionalidad por Gracia", "INDH", "Garantías", "Convenios"],
    integrantes: [
      { nombre: "Fabiola Campillai Rojas", partido: "IND", rol: "Presidenta de Comisión", email: "fcampillai@senado.cl", camara: "Senado de la República" },
      { nombre: "Francisco Chahuán Chahuán", partido: "RN", rol: "Miembro Titular", email: "fchahuan@senado.cl", camara: "Senado de la República" },
      { nombre: "Fidel Espinoza Sandoval", partido: "PS", rol: "Miembro Titular", email: "fespinoza@senado.cl", camara: "Senado de la República" },
      { nombre: "Enrique Van Rysselberghe Herrera", partido: "UDI", rol: "Miembro Titular", email: "evr@senado.cl", camara: "Senado de la República" },
      { nombre: "Gastón Saavedra Chandía", partido: "PS", rol: "Miembro Titular", email: "gsaavedra@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "desafios-futuro",
    senadoId: "941",
    nombre: "Comisión de Desafíos del Futuro, Ciencia, Tecnología e Innovación",
    descripcion: "Organizadores del 'Congreso Futuro', regulación de neuroderechos, metaverso y ética de datos masivos.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Cpu",
    email: "comisionfuturo@senado.cl",
    temas: ["Congreso Futuro", "Inteligencia Artificial", "Neuroderechos", "Espacio", "Biotecnología"],
    integrantes: [
      { nombre: "Juan Antonio Coloma Correa", partido: "UDI", rol: "Presidente de Comisión", email: "jcoloma@senado.cl", camara: "Senado de la República" },
      { nombre: "Francisco Chahuán Chahuán", partido: "RN", rol: "Miembro Titular", email: "fchahuan@senado.cl", camara: "Senado de la República" },
      { nombre: "Alfonso De Urresti Longton", partido: "PS", rol: "Miembro Titular", email: "adeurresti@senado.cl", camara: "Senado de la República" },
      { nombre: "Felipe Kast Sommerhoff", partido: "Evópoli", rol: "Miembro Titular", email: "fkast@senado.cl", camara: "Senado de la República" },
      { nombre: "Kenneth Pugh Olavarría", partido: "IND", rol: "Miembro Titular", email: "kpugh@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "mujeres-genero",
    senadoId: "1126",
    nombre: "Comisión de la Mujer y Equidad de Género",
    descripcion: "Igualdad salarial de género, de cupos en directorios y prevención de femicidios.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Sparkles",
    email: "comisiondelamujer@senado.cl",
    temas: ["Mujer", "Equidad de Género", "Ley Integral contra la Violencia", "Cuidados"],
    integrantes: [
      { nombre: "Loreto Carvajal Ambiado", partido: "PPD", rol: "Presidenta de Comisión", email: "lcarvajal@senado.cl", camara: "Senado de la República" },
      { nombre: "Paulina Núñez Urrutia", partido: "RN", rol: "Miembro Titular", email: "paulinanunez@senado.cl", camara: "Senado de la República" },
      { nombre: "Claudia Pascual Grau", partido: "PC", rol: "Miembro Titular", email: "cpascual@senado.cl", camara: "Senado de la República" },
      { nombre: "Carmen Gloria Aravena Acuña", partido: "PREP", rol: "Miembro Titular", email: "cgaravena@senado.cl", camara: "Senado de la República" },
      { nombre: "Isabel Allende Bussi", partido: "PS", rol: "Miembro Titular", email: "iallenbussi@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "infancia",
    senadoId: "1323",
    nombre: "Comisión de Familia, Infancia y Adolescencia",
    descripcion: "Seguimiento legislativo a la ley de garantías de la infancia, SENAME, Mejor Niñez e integración juvenil.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Smile",
    email: "comisioninfancia@senado.cl",
    temas: ["Infancia", "Adolescencia", "Mejor Niñez", "Protección Integral", "Garantías de la Niñez"],
    integrantes: [
      { nombre: "Fabiola Campillai Rojas", partido: "IND", rol: "Presidenta de Comisión", email: "fcampillai@senado.cl", camara: "Senado de la República" },
      { nombre: "Paulina Núñez Urrutia", partido: "RN", rol: "Miembro Titular", email: "paulinanunez@senado.cl", camara: "Senado de la República" },
      { nombre: "Loreto Carvajal Ambiado", partido: "PPD", rol: "Miembro Titular", email: "lcarvajal@senado.cl", camara: "Senado de la República" },
      { nombre: "Enrique Van Rysselberghe Herrera", partido: "UDI", rol: "Miembro Titular", email: "evr@senado.cl", camara: "Senado de la República" },
      { nombre: "Carmen Gloria Aravena Acuña", partido: "PREP", rol: "Miembro Titular", email: "cgaravena@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "transportes",
    senadoId: "198",
    nombre: "Comisión de Transportes y Telecomunicaciones",
    descripcion: "Regulación de empresas de aplicaciones de transporte (Ley EAT), puertos, trenes para Chile y 5G.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "HardHat",
    email: "transen@senado.cl",
    temas: ["Trenes para Chile", "Ley EAT / Uber", "Puertos", "5G", "Subsidio Transporte"],
    integrantes: [
      { nombre: "Enrique Van Rysselberghe Herrera", partido: "UDI", rol: "Presidente de Comisión", email: "evr@senado.cl", camara: "Senado de la República" },
      { nombre: "Alejandro Kusanovic Glusevic", partido: "IND", rol: "Miembro Titular", email: "akusanovic@senado.cl", camara: "Senado de la República" },
      { nombre: "Ximena Órdenes Neira", partido: "PPD", rol: "Miembro Titular", email: "xordenes@senado.cl", camara: "Senado de la República" },
      { nombre: "Juan Luis Castro González", partido: "PS", rol: "Miembro Titular", email: "juanluiscastro@senado.cl", camara: "Senado de la República" },
      { nombre: "Francisco Chahuán Chahuán", partido: "RN", rol: "Miembro Titular", email: "fchahuan@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "pesca",
    senadoId: "200",
    nombre: "Comisión de Intereses Marítimos, Pesca y Acuicultura",
    descripcion: "Tramitación de la Nueva Ley de Pesca, fraccionamiento pesquero, acuicultura sustentable y salmones.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Droplet",
    email: "pescasen@senado.cl",
    temas: ["Nueva Ley de Pesca", "Fraccionamiento", "Pesca Artesanal", "Acuicultura", "Salmones", "Borde Costero"],
    integrantes: [
      { nombre: "Fidel Espinoza Sandoval", partido: "PS", rol: "Presidente de Comisión", email: "fespinoza@senado.cl", camara: "Senado de la República" },
      { nombre: "Carlos Ignacio Kuschel Silva", partido: "RN", rol: "Miembro Titular", email: "ckuschel@senado.cl", camara: "Senado de la República" },
      { nombre: "Iván Flores García", partido: "DC", rol: "Miembro Titular", email: "iflores@senado.cl", camara: "Senado de la República" },
      { nombre: "Alejandro Kusanovic Glusevic", partido: "IND", rol: "Miembro Titular", email: "akusanovic@senado.cl", camara: "Senado de la República" },
      { nombre: "David Sandoval Plaza", partido: "UDI", rol: "Miembro Titular", email: "dsandoval@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "recursos-hidricos",
    senadoId: "1009",
    nombre: "Comisión de Recursos Hídricos, Desertificación y Sequía",
    descripcion: "Políticas de seguridad hídrica, embalses estratégicos, fiscalización de extracciones ilegales y reúso de aguas.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Droplet",
    email: "recursoshidricos@senado.cl",
    temas: ["Seguridad Hídrica", "Sequía", "Embalses", "Desalación", "Juntas de Vigilancia"],
    integrantes: [
      { nombre: "Sergio Gahona Salazar", partido: "UDI", rol: "Presidente de Comisión", email: "sgahona@senado.cl", camara: "Senado de la República" },
      { nombre: "Yasna Provoste Campillay", partido: "DC", rol: "Miembro Titular", email: "yasnaprovoste@senado.cl", camara: "Senado de la República" },
      { nombre: "Carlos Ignacio Kuschel Silva", partido: "RN", rol: "Miembro Titular", email: "ckuschel@senado.cl", camara: "Senado de la República" },
      { nombre: "Daniel Núñez Arancibia", partido: "PC", rol: "Miembro Titular", email: "danielnunez@senado.cl", camara: "Senado de la República" },
      { nombre: "Juan Castro Prieto", partido: "RN", rol: "Miembro Titular", email: "jcastro@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "regimen-interior",
    senadoId: "201",
    nombre: "Comisión de Régimen Interior",
    descripcion: "Administración institucional del Senado, presupuesto interno, ceremonial y auditoría parlamentaria.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Landmark",
    email: "regimeninterior@senado.cl",
    temas: ["Régimen Interior", "Presupuesto Senado", "Auditoría", "Administración"],
    integrantes: [
      { nombre: "José García Ruminot", partido: "RN", rol: "Presidente de Comisión", email: "jgarcia@senado.cl", camara: "Senado de la República" },
      { nombre: "Juan Luis Castro González", partido: "PS", rol: "Miembro Titular", email: "juanluiscastro@senado.cl", camara: "Senado de la República" },
      { nombre: "Sergio Gahona Salazar", partido: "UDI", rol: "Miembro Titular", email: "sgahona@senado.cl", camara: "Senado de la República" },
      { nombre: "Iván Moreira Barros", partido: "UDI", rol: "Miembro Titular", email: "imoreira@senado.cl", camara: "Senado de la República" },
      { nombre: "Manuel José Ossandón Irarrázabal", partido: "RN", rol: "Miembro Titular", email: "mjossandon@senado.cl", camara: "Senado de la República" },
      { nombre: "Yasna Provoste Campillay", partido: "DC", rol: "Miembro Titular", email: "yasnaprovoste@senado.cl", camara: "Senado de la República" },
      { nombre: "Pedro Araya Guerrero", partido: "PPD", rol: "Miembro Titular", email: "paraya@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "cultura-deportes",
    senadoId: "1324",
    nombre: "Comisión de Cultura, Patrimonio, Artes, Deportes y Recreación",
    descripcion: "Legislación de fomento cultural nacional, resguardo del patrimonio histórico y fomento del deporte.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Award",
    email: "culturaydeportes@senado.cl",
    temas: ["Cultura", "Patrimonio", "Artes", "Deportes", "Recreación", "Atletas"],
    integrantes: [
      { nombre: "Alfonso De Urresti Longton", partido: "PS", rol: "Presidente de Comisión", email: "adeurresti@senado.cl", camara: "Senado de la República" },
      { nombre: "Sebastián Keitel Bianchi", partido: "IND-Evópoli", rol: "Miembro Titular", email: "skeitel@senado.cl", camara: "Senado de la República" },
      { nombre: "Luciano Cruz-Coke Carvallo", partido: "Evópoli", rol: "Miembro Titular", email: "lcruzcoke@senado.cl", camara: "Senado de la República" },
      { nombre: "Fidel Espinoza Sandoval", partido: "PS", rol: "Miembro Titular", email: "fespinoza@senado.cl", camara: "Senado de la República" },
      { nombre: "Alejandra Sepúlveda Órdenes", partido: "IND", rol: "Miembro Titular", email: "asepulveda@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "adulto-mayor",
    senadoId: "1133",
    nombre: "Comisión del Adulto Mayor y Discapacidad",
    descripcion: "Normas de protección a personas mayores, inclusión laboral de personas con discapacidad y pensiones.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "Users",
    email: "adultomydiscapacidad@senado.cl",
    temas: ["Adulto Mayor", "Discapacidad", "Inclusión", "SENADIS", "Cuidados"],
    integrantes: [
      { nombre: "David Sandoval Plaza", partido: "UDI", rol: "Presidente de Comisión", email: "dsandoval@senado.cl", camara: "Senado de la República" },
      { nombre: "Sebastián Keitel Bianchi", partido: "IND-Evópoli", rol: "Miembro Titular", email: "skeitel@senado.cl", camara: "Senado de la República" },
      { nombre: "Fabiola Campillai Rojas", partido: "IND", rol: "Miembro Titular", email: "fcampillai@senado.cl", camara: "Senado de la República" },
      { nombre: "Juan Luis Castro González", partido: "PS", rol: "Miembro Titular", email: "juanluiscastro@senado.cl", camara: "Senado de la República" },
      { nombre: "Enrique Van Rysselberghe Herrera", partido: "UDI", rol: "Miembro Titular", email: "evr@senado.cl", camara: "Senado de la República" }
    ]
  },
  {
    id: "presupuestos-mixta",
    senadoId: "367",
    nombre: "Comisión Especial Mixta de Presupuestos",
    descripcion: "Comisión bicameral encargada de la tramitación de la Ley de Presupuestos de la Nación y fiscalización de partidas.",
    estado: "Comisión Permanente",
    chamber: "SR",
    prefix: "senado-",
    icon: "TrendingUp",
    email: "compres@senado.cl",
    temas: ["Presupuesto Nacional", "Partidas Presupuestarias", "Hacienda", "DIPRES", "Gasto Público"],
    integrantes: [
      { nombre: "Felipe Kast Sommerhoff", partido: "Evópoli", rol: "Presidente de Comisión", email: "fkast@senado.cl", camara: "Senado de la República" },
      { nombre: "Juan Antonio Coloma Correa", partido: "UDI", rol: "Miembro Titular", email: "jcoloma@senado.cl", camara: "Senado de la República" },
      { nombre: "José García Ruminot", partido: "RN", rol: "Miembro Titular", email: "jgarcia@senado.cl", camara: "Senado de la República" },
      { nombre: "Ricardo Lagos Weber", partido: "PPD", rol: "Miembro Titular", email: "rlagos@senado.cl", camara: "Senado de la República" },
      { nombre: "Daniel Núñez Arancibia", partido: "PC", rol: "Miembro Titular", email: "danielnunez@senado.cl", camara: "Senado de la República" },
      { nombre: "Alfonso De Urresti Longton", partido: "PS", rol: "Miembro Titular", email: "adeurresti@senado.cl", camara: "Senado de la República" },
      { nombre: "María José Gatica Bertin", partido: "RN", rol: "Miembro Titular", email: "mjgatica@senado.cl", camara: "Senado de la República" },
      { nombre: "Ximena Órdenes Neira", partido: "PPD", rol: "Miembro Titular", email: "xordenes@senado.cl", camara: "Senado de la República" },
      { nombre: "Yasna Provoste Campillay", partido: "DC", rol: "Miembro Titular", email: "yasnaprovoste@senado.cl", camara: "Senado de la República" },
      { nombre: "Gustavo Sanhueza Dueñas", partido: "UDI", rol: "Miembro Titular", email: "gsanhueza@senado.cl", camara: "Senado de la República" },
      { nombre: "Paulina Vodanovic Rojas", partido: "PS", rol: "Miembro Titular", email: "pvodanovic@senado.cl", camara: "Senado de la República" },
      { nombre: "Luciano Cruz-Coke Carvallo", partido: "Evópoli", rol: "Miembro Titular", email: "lcruzcoke@senado.cl", camara: "Senado de la República" },
      { nombre: "Carlos Ignacio Kuschel Silva", partido: "RN", rol: "Miembro Titular", email: "ckuschel@senado.cl", camara: "Senado de la República" },
      { nombre: "Carlos Bianchi Chelech", partido: "IND-PPD", rol: "Miembro Titular", email: "cbianchi@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Gael Yeomans Araya", partido: "FA", rol: "Miembro Titular", email: "gyeomans@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Guillermo Ramírez Diez", partido: "UDI", rol: "Miembro Titular", email: "gramirez@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Boris Barrera Moreno", partido: "PC", rol: "Miembro Titular", email: "bbarrera@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Frank Sauerbaum Muñoz", partido: "RN", rol: "Miembro Titular", email: "fsauerbaum@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Jaime Naranjo Ortiz", partido: "PS", rol: "Miembro Titular", email: "jnaranjo@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Sofía Cid Versalovic", partido: "IND-RN", rol: "Miembro Titular", email: "scid@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Agustín Romero Leiva", partido: "PREP", rol: "Miembro Titular", email: "aromero@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Alexis Sepúlveda Soto", partido: "PR", rol: "Miembro Titular", email: "asepulveda@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Miguel Mellado Suazo", partido: "RN", rol: "Miembro Titular", email: "mmellado@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Gastón Von Mühlenbrock Zamora", partido: "UDI", rol: "Miembro Titular", email: "gvonmuhlenbrock@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Vlado Mirosevic Verdugo", partido: "PL", rol: "Miembro Titular", email: "vmirosevic@congreso.cl", camara: "Cámara de Diputadas y Diputados" },
      { nombre: "Ricardo Cifuentes Lillo", partido: "DC", rol: "Miembro Titular", email: "rcifuentes@congreso.cl", camara: "Cámara de Diputadas y Diputados" }
    ]
  }
];

export const TODAS_COMISIONES_DETALLE: ComisionMeta[] = [
  ...DIPUTADOS_COMISIONES_DETALLE,
  ...SENADO_COMISIONES_DETALLE
];

export interface AutocompleteResult {
  comisiones: Array<ComisionMeta & { matchReason?: string }>;
  integrantes: Array<{
    nombre: string;
    partido: string;
    rol: string;
    email?: string;
    comisionId: string;
    comisionNombre: string;
    chamber: "CD" | "SR";
  }>;
  temas: Array<{
    nombre: string;
    comisionId: string;
    comisionNombre: string;
    chamber: "CD" | "SR";
  }>;
}

export function searchComisionesAutocomplete(query: string): AutocompleteResult {
  const normQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if (!normQuery) {
    return {
      comisiones: TODAS_COMISIONES_DETALLE.slice(0, 6),
      integrantes: [],
      temas: []
    };
  }

  const queryWords = normQuery.split(/\s+/).filter(w => w.length > 1);

  // 1. Match commissions
  const matchedComs: Array<ComisionMeta & { matchReason?: string }> = [];
  for (const c of TODAS_COMISIONES_DETALLE) {
    const normNombre = c.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normDesc = c.descripcion.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normId = c.id.toLowerCase();
    const normChamber = c.chamber === "CD" ? "camara diputados diputadas" : "senado republica";

    if (normNombre.includes(normQuery)) {
      matchedComs.push({ ...c, matchReason: "Nombre de comisión" });
    } else if (normDesc.includes(normQuery)) {
      matchedComs.push({ ...c, matchReason: "Materia / Descripción" });
    } else if (queryWords.every(w => normNombre.includes(w) || normDesc.includes(w) || normId.includes(w) || normChamber.includes(w))) {
      matchedComs.push({ ...c, matchReason: "Término relacionado" });
    }
  }

  // 2. Match parliamentarians / committee members
  const matchedIntegrantes: AutocompleteResult["integrantes"] = [];
  const seenMemberComMap = new Set<string>();

  for (const c of TODAS_COMISIONES_DETALLE) {
    for (const i of c.integrantes) {
      const normMemberName = i.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const normParty = (i.partido || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const normRole = (i.rol || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const matchesName = normMemberName.includes(normQuery) || queryWords.every(w => normMemberName.includes(w));
      const matchesParty = normParty.includes(normQuery) && normQuery.length >= 3;
      const matchesRole = normRole.includes(normQuery) && normQuery.length >= 4;

      if (matchesName || matchesParty || matchesRole) {
        const key = `${i.nombre}_${c.id}`;
        if (!seenMemberComMap.has(key)) {
          seenMemberComMap.add(key);
          matchedIntegrantes.push({
            nombre: i.nombre,
            partido: i.partido || "Parlamentario",
            rol: i.rol,
            email: i.email,
            comisionId: `${c.prefix}${c.id}`,
            comisionNombre: c.nombre,
            chamber: c.chamber
          });
        }
      }
    }
  }

  // 3. Match topics / tags
  const matchedTemas: AutocompleteResult["temas"] = [];
  for (const c of TODAS_COMISIONES_DETALLE) {
    if (c.temas) {
      for (const t of c.temas) {
        const normTema = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        if (normTema.includes(normQuery)) {
          matchedTemas.push({
            nombre: t,
            comisionId: `${c.prefix}${c.id}`,
            comisionNombre: c.nombre,
            chamber: c.chamber
          });
        }
      }
    }
  }

  return {
    comisiones: matchedComs.slice(0, 6),
    integrantes: matchedIntegrantes.slice(0, 8),
    temas: matchedTemas.slice(0, 4)
  };
}

/**
 * Robust Commission Resolver: Matches any format like "cd-constitucion", "constitucion",
 * "senado-constitucion", "cd-trabajo-y-prevision", "trabajo", "hacienda", etc.
 */
export function findComisionMetaById(rawId: string): ComisionMeta | undefined {
  if (!rawId) return undefined;
  const cleanId = rawId.toLowerCase().trim();
  const strippedId = cleanId.replace(/^(cd-|senado-|sr-)/, "");

  // 1. Exact match on id
  let found = TODAS_COMISIONES_DETALLE.find(c => c.id.toLowerCase() === cleanId);
  if (found) return found;

  // 2. Full prefixed match: `${c.prefix}${c.id}` === cleanId (e.g. "cd-constitucion", "senado-constitucion")
  found = TODAS_COMISIONES_DETALLE.find(c => `${c.prefix}${c.id}`.toLowerCase() === cleanId);
  if (found) return found;

  // 3. Match stripped with chamber priority
  const isSenadoReq = cleanId.startsWith("senado") || cleanId.startsWith("sr");
  found = TODAS_COMISIONES_DETALLE.find(c => {
    const cStripped = c.id.replace(/^(cd-|senado-|sr-)/, "").toLowerCase();
    const matches = cStripped === strippedId || c.id.toLowerCase() === strippedId;
    if (matches) {
      if (isSenadoReq && c.chamber === "SR") return true;
      if (!isSenadoReq && c.chamber === "CD") return true;
    }
    return false;
  });
  if (found) return found;

  // Any stripped match
  found = TODAS_COMISIONES_DETALLE.find(c => {
    const cStripped = c.id.replace(/^(cd-|senado-|sr-)/, "").toLowerCase();
    return cStripped === strippedId || c.id.toLowerCase() === strippedId;
  });
  if (found) return found;

  // 4. Token & Substring Match
  found = TODAS_COMISIONES_DETALLE.find(c => {
    const normCId = c.id.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normCNombre = c.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const matchesName = normCNombre.includes(strippedId) || strippedId.includes(normCId);
    if (matchesName) {
      if (isSenadoReq && c.chamber === "SR") return true;
      if (!isSenadoReq && c.chamber === "CD") return true;
    }
    return false;
  });
  if (found) return found;

  // 5. Fallback first match containing search token
  return TODAS_COMISIONES_DETALLE.find(c => {
    const normCId = c.id.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normCNombre = c.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return normCNombre.includes(strippedId) || normCId.includes(strippedId) || strippedId.includes(normCId);
  });
}

/**
 * Generates tailored priority bills for any commission based on its thematic area and chamber.
 */
export function getProyectosForComision(meta: ComisionMeta): Proyecto[] {
  const isSenado = meta.chamber === "SR" || meta.prefix === "senado-";
  const camaraStr = isSenado ? "Senado" : "Diputados";
  const idLower = meta.id.toLowerCase();
  const nombreLower = meta.nombre.toLowerCase();

  const baseProyectos: Proyecto[] = [];

  // 1. Constitución
  if (idLower.includes("constitucion") || nombreLower.includes("constitucion")) {
    baseProyectos.push(
      {
        id: "16.621-07",
        titulo: "Reforma Constitucional sobre probidad, transparencia y modernización de la función pública.",
        resumen: "Modifica las bases de la institucionalidad consagrando el principio de transparencia algorítmica y régimen estricto de inhabilidades públicas.",
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2024-03-12",
        materia: "Derecho Constitucional",
        autores: "Diputados y Senadores de la Comisión de Constitución",
        iniciativa: "Moción",
        patrocinantes: 10,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [
          { id: "act-c1", fecha: "02 Sep 2026", titulo: "Aprobación en particular de indicaciones", descripcion: "Comisión aprueba por unanimidad el articulado sobre transparencia.", tipo: "acuerdo" },
          { id: "act-c2", fecha: "26 Ago 2026", titulo: "Audiencia de expertos constitucionalistas", descripcion: "Exposición de profesores de derecho sobre límites competenciales.", tipo: "sesion" }
        ],
        documentos: [],
        votaciones: []
      },
      {
        id: "15.869-07",
        titulo: "Modifica el Código Orgánico de Tribunales y Código Penal en materia de cibercrimen y prueba digital.",
        resumen: "Establece reglas procesales claras para la preservación de evidencia digital y cooperación judicial internacional en delitos informáticos.",
        estado: "En sala",
        etapa: "Segundo Trámite Constitucional",
        fechaIngreso: "2023-08-20",
        materia: "Justicia y Código Penal",
        autores: "Ministerio de Justicia y Derechos Humanos",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Discusión Inmediata",
        camaraOrigen: isSenado ? "Diputados" : "Senado",
        comisionActual: meta.nombre,
        timeline: [
          { id: "act-c3", fecha: "28 Ago 2026", titulo: "Despacho de segundo informe a Sala", descripcion: "La Comisión concluye el debate y despacha el texto a votación plenaria.", tipo: "informe" }
        ],
        documentos: [],
        votaciones: []
      },
      {
        id: "16.442-07",
        titulo: "Perfecciona el estatuto de fiscalización de la Contraloría General de la República.",
        resumen: "Refuerza los mecanismos de auditoría previa y dictámenes vinculantes sobre compras públicas y contratos de concesiones.",
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2024-01-15",
        materia: "Derecho Administrativo",
        autores: "Integrantes de la Comisión",
        iniciativa: "Moción",
        patrocinantes: 8,
        urgencia: "Simple",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      },
      {
        id: "15.431-07",
        titulo: "Ley Orgánica que regula el Consejo de Nombramientos de la Magistratura y carrera judicial.",
        resumen: "Crea un sistema transparente basado exclusivamente en mérito, carrera judicial y audiencias públicas de oposición.",
        estado: "En estudio",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2023-05-18",
        materia: "Poder Judicial",
        autores: "Presidente de la República",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      }
    );
  }
  // 2. Trabajo
  else if (idLower.includes("trabajo") || nombreLower.includes("trabajo")) {
    baseProyectos.push(
      {
        id: "16.621-13",
        titulo: "Modifica el Código del Trabajo regulando el teletrabajo para personas cuidadoras y conciliación familiar.",
        resumen: "Garantiza el derecho preferente a jornadas remotas o híbridas para trabajadoras y trabajadores con personas en situación de dependencia a su cargo.",
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2024-04-10",
        materia: "Legislación Laboral",
        autores: "Diputados y Senadores de Trabajo y Previsión",
        iniciativa: "Moción",
        patrocinantes: 10,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [
          { id: "act-t1", fecha: "01 Sep 2026", titulo: "Votación de articulado en particular", descripcion: "Aprobadas indicaciones sobre compensación de gastos de conectividad.", tipo: "acuerdo" },
          { id: "act-t2", fecha: "25 Ago 2026", titulo: "Audiencia de la Dirección del Trabajo", descripcion: "Dictamen sobre criterios de fiscalización remota.", tipo: "sesion" }
        ],
        documentos: [],
        votaciones: []
      },
      {
        id: "16.442-13",
        titulo: "Regula las jornadas de excepción laboral frente a estados decretados bajo estado de catástrofe.",
        resumen: "Mecanismo de salvaguarda de remuneraciones y suspensión contractual temporal ante emergencias climáticas y desastres naturales.",
        estado: "En sala",
        etapa: "Segundo Trámite Constitucional",
        fechaIngreso: "2024-01-20",
        materia: "Seguridad Social y Empleo",
        autores: "Ministerio del Trabajo y Previsión Social",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Discusión Inmediata",
        camaraOrigen: isSenado ? "Diputados" : "Senado",
        comisionActual: meta.nombre,
        timeline: [
          { id: "act-t3", fecha: "29 Ago 2026", titulo: "Informe favorable aprobado por unanimidad", descripcion: "Se despacha a Tabla de Sala para votación general.", tipo: "informe" }
        ],
        documentos: [],
        votaciones: []
      },
      {
        id: "15.869-13",
        titulo: "Perfecciona la Ley Karin de prevención del acoso laboral y sexual en el sector privado y público.",
        resumen: "Establece protocolos de acompañamiento psicológico y plazos perentorios de investigación en la Inspección del Trabajo.",
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2023-09-05",
        materia: "Derechos Fundamentales del Trabajo",
        autores: "Moción de Parlamentarios de la Comisión",
        iniciativa: "Moción",
        patrocinantes: 9,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      },
      {
        id: "17.402-13",
        titulo: "Reforma previsional integral: crea el Seguro Social Previsional y moderniza la cotización del empleador.",
        resumen: "Aumento de pensiones actuales y futuras mediante componente solidario intergeneracional y licitación periódica de carteras.",
        estado: "En estudio",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2024-06-01",
        materia: "Pensiones y Previsión Social",
        autores: "Presidente de la República y Ministra del Trabajo",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      }
    );
  }
  // 3. Hacienda
  else if (idLower.includes("hacienda") || nombreLower.includes("hacienda")) {
    baseProyectos.push(
      {
        id: "17.402-05",
        titulo: "Plan de Reconstrucción Nacional y Reactivación de Inversiones post-incendios.",
        resumen: "Beneficios de depreciación acelerada, fondos de garantía FOGAPE preferentes y exenciones arancelarias temporales para zonas afectadas.",
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2024-06-10",
        materia: "Finanzas Públicas y Tributación",
        autores: "Presidente de la República y Ministro de Hacienda",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Discusión Inmediata",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [
          { id: "act-h1", fecha: "02 Sep 2026", titulo: "Informe Financiero de DIPRES expuesto en sesión", descripcion: "Se analiza el impacto fiscal en el Presupuesto 2026.", tipo: "informe" }
        ],
        documentos: [],
        votaciones: []
      },
      {
        id: "16.621-05",
        titulo: "Ley de Cumplimiento de las Obligaciones Tributarias y modernización del SII.",
        resumen: "Herramientas de fiscalización contra la informalidad comercial, levantamiento de secreto bancario judicializado y delator compensado.",
        estado: "En sala",
        etapa: "Segundo Trámite Constitucional",
        fechaIngreso: "2024-03-22",
        materia: "Tributaria y Recaudación",
        autores: "Ministerio de Hacienda",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Suma",
        camaraOrigen: isSenado ? "Diputados" : "Senado",
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      },
      {
        id: "15.932-05",
        titulo: "Moderniza la Ley de Compras Públicas y refuerza la probidad en transferencias del Estado.",
        resumen: "Obligatoriedad de licitación estándar y registro nacional de beneficiarios finales para cualquier traspaso de fondos fiscales.",
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2023-11-14",
        materia: "Gasto Fiscal",
        autores: "Diputados de la Comisión de Hacienda",
        iniciativa: "Moción",
        patrocinantes: 8,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      }
    );
  }
  // 4. Seguridad
  else if (idLower.includes("seguridad") || nombreLower.includes("seguridad")) {
    baseProyectos.push(
      {
        id: "15.431-11",
        titulo: "Ley Marco de Ciberseguridad e Infraestructura Crítica de la Información. Crea la Agencia Nacional de Ciberseguridad.",
        resumen: "Marco normativo nacional para operadores de servicios esenciales frente a ciberataques, incidentes informáticos y rescate de datos.",
        estado: "En sala",
        etapa: "Segundo Trámite Constitucional",
        fechaIngreso: "2023-04-18",
        materia: "Seguridad Nacional y Telecomunicaciones",
        autores: "Ministerio del Interior y Seguridad Pública",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Discusión Inmediata",
        camaraOrigen: isSenado ? "Diputados" : "Senado",
        comisionActual: meta.nombre,
        timeline: [
          { id: "act-s1", fecha: "31 Ago 2026", titulo: "Comisión despacha informe para votación en Sala", descripcion: "Se aprueba el régimen sancionatorio de la ANCI.", tipo: "informe" }
        ],
        documentos: [],
        votaciones: []
      },
      {
        id: "16.120-25",
        titulo: "Crea el Ministerio de Seguridad Pública y moderniza el Sistema de Inteligencia del Estado.",
        resumen: "Separa la coordinación política de Interior de la gestión táctica y tecnológica de la seguridad ciudadana.",
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2023-12-05",
        materia: "Institucionalidad de Seguridad",
        autores: "Presidente de la República",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      },
      {
        id: "15.940-25",
        titulo: "Tipifica el delito de extorsión agravada, sicariato y porte de armamento de guerra.",
        resumen: "Aumento de penas a presidio mayor y restricción de beneficios carcelarios para integrantes de crimen organizado.",
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2023-10-30",
        materia: "Código Penal",
        autores: "Moción Parlamentaria",
        iniciativa: "Moción",
        patrocinantes: 9,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      }
    );
  }
  // 5. Default para cualquier otra comisión
  else {
    const mainTema = (meta.temas && meta.temas[0]) || meta.nombre.replace(/^Comisión de /i, "");
    const secTema = (meta.temas && meta.temas[1]) || "Normativa Sectorial";
    const thirdTema = (meta.temas && meta.temas[2]) || "Fiscalización";

    baseProyectos.push(
      {
        id: "16.710-00",
        titulo: `Ley Marco de modernización y fomento regulatorio en materias de ${mainTema}.`,
        resumen: `Establece nuevos estándares de eficiencia, transparencia y sustentabilidad operativa en los ámbitos regulados por la ${meta.nombre}.`,
        estado: "En discusión",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2024-05-14",
        materia: mainTema,
        autores: meta.integrantes && meta.integrantes[0] ? meta.integrantes[0].nombre : "Parlamentarios de la Comisión",
        iniciativa: "Moción",
        patrocinantes: 8,
        urgencia: "Suma",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [
          { id: "act-g1", fecha: "01 Sep 2026", titulo: "Inicio de votación en particular", descripcion: "Debate técnico sobre las indicaciones ingresadas al articulado.", tipo: "sesion" },
          { id: "act-g2", fecha: "26 Ago 2026", titulo: "Audiencias técnicas concluidas", descripcion: "Recepción de expositores gremiales y académicos.", tipo: "informe" }
        ],
        documentos: [],
        votaciones: []
      },
      {
        id: "16.430-00",
        titulo: `Perfecciona los mecanismos de fiscalización y régimen de sanciones en el sector de ${secTema}.`,
        resumen: `Otorga mayores facultades a los organismos reguladores para supervisar el estricto cumplimiento de la normativa vigente.`,
        estado: "En sala",
        etapa: "Segundo Trámite Constitucional",
        fechaIngreso: "2024-02-18",
        materia: secTema,
        autores: "Ministerio del Ramo y Presidente de la República",
        iniciativa: "Mensaje",
        patrocinantes: 1,
        urgencia: "Discusión Inmediata",
        camaraOrigen: isSenado ? "Diputados" : "Senado",
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      },
      {
        id: "15.920-00",
        titulo: `Promueve la innovación tecnológica y agilización de trámites sectoriales en ${thirdTema}.`,
        resumen: `Implementación de ventanillas únicas digitales y plazos máximos para resoluciones administrativas sectoriales.`,
        estado: "En estudio",
        etapa: "Primer Trámite Constitucional",
        fechaIngreso: "2023-11-09",
        materia: thirdTema,
        autores: "Integrantes de la Comisión",
        iniciativa: "Moción",
        patrocinantes: 7,
        urgencia: "Simple",
        camaraOrigen: camaraStr,
        comisionActual: meta.nombre,
        timeline: [],
        documentos: [],
        votaciones: []
      }
    );
  }

  return baseProyectos;
}

/**
 * Builds a complete, rich Comision object from ComisionMeta for offline / client-side execution.
 */
export function generateFullComisionData(meta: ComisionMeta): Comision {
  const isSenado = meta.chamber === "SR" || meta.prefix === "senado-";
  const periodoStr = isSenado ? "Senado de la República (2022 - 2030)" : "56º Período Legislativo (2022 - 2026)";

  const sampleDate1 = "02 de septiembre de 2026";
  const sampleDate2 = "26 de agosto de 2026";
  const sampleDate3 = "19 de agosto de 2026";

  const proyectosLista = getProyectosForComision(meta);

  return {
    id: `${meta.prefix}${meta.id}`,
    nombre: meta.nombre,
    descripcion: meta.descripcion,
    periodo: periodoStr,
    officialUrl: isSenado 
      ? `https://www.senado.cl/comisiones/${meta.id}`
      : `https://www.camara.cl/legislacion/comisiones/detalle.aspx?prmID=${meta.id}`,
    citacionesUrl: isSenado
      ? "https://www.senado.cl/actividad-legislativa/citaciones-a-comisiones"
      : "https://www.camara.cl/legislacion/comisiones/citaciones.aspx",
    sesionesRealizadas: 48,
    proyectosContados: proyectosLista.length,
    audienciasSostenidas: 34,
    documentosContados: 76,
    alertasActivas: 2,
    integrantes: meta.integrantes,
    temas: meta.temas || ["Legislación", "Trámite Constitucional", "Debate Técnico"],
    proyectos: proyectosLista,
    proyectosIds: proyectosLista.map(p => p.id),
    audiencias: {
      sectorPublico: 18,
      sociedadCivil: 11,
      academia: 5,
      ultimasAsistencias: [
        { entidad: "Ministerio de Hacienda / DIPRES", expositores: 3 },
        { entidad: "Colegio de Abogados de Chile", expositores: 2 },
        { entidad: "Asociación Chilena de Municipalidades (AChM)", expositores: 2 },
        { entidad: "Centro de Estudios Públicos (CEP)", expositores: 1 }
      ]
    },
    proximaSesion: {
      id: "ses-prox-01",
      fecha: "Martes 08 de septiembre de 2026",
      hora: "10:30 a 13:00 hrs.",
      lugar: "Sala N° 3 del Congreso Nacional, Valparaíso (Híbrida)",
      modalidad: "Presencial y Telemática",
      citacionNumero: "Citación Ordinaria N° 142/56",
      tipo: "Sesión Ordinaria",
      materia: `Continuar con el estudio en particular de los proyectos de ley radicados en la ${meta.nombre}.`,
      invitados: "Subsecretario del Ramo, Especialistas Constitucionales y Representantes Gremiales.",
      acuerdosCount: 0,
      tabla: [
        "1. Aprobación de actas anteriores.",
        "2. Votación de indicaciones formuladas al articulado.",
        "3. Fijación de plazos para audiencias públicas."
      ]
    },
    sesiones: [
      {
        id: "ses-01",
        fecha: sampleDate1,
        hora: "10:30 a 13:00 hrs.",
        lugar: "Valparaíso",
        tipo: "Sesión Ordinaria",
        materia: `Audiencias técnicas y debate de indicaciones sobre las materias de competencia de la ${meta.nombre}.`,
        invitados: "DIPRES, Expertos Académicos y Asociaciones Sectoriales.",
        acuerdosCount: 3,
        completada: true,
        actaTexto: "Se inició la sesión con la asistencia reglamentaria de los miembros titulares. Se escucharon exposiciones y se acordó votar en general en la próxima citación.",
        acuerdosTexto: [
          "Se acordó oficiar al Ejecutivo solicitando informe financiero complementario.",
          "Se aprueba en general por unanimidad de los presentes.",
          "Se fija plazo para recibir indicaciones hasta el próximo viernes a las 18:00 hrs."
        ],
        tabla: [
          "1. Análisis de observaciones ingresadas.",
          "2. Exposición del Ejecutivo.",
          "3. Acuerdos de tramitación."
        ]
      },
      {
        id: "ses-02",
        fecha: sampleDate2,
        hora: "11:00 a 13:30 hrs.",
        lugar: "Valparaíso",
        tipo: "Sesión Especial",
        materia: `Revisión exhaustiva y recepción de audiencias públicas en materia sectorial.`,
        invitados: "Representantes de la sociedad civil y gremios convocados.",
        acuerdosCount: 2,
        completada: true,
        acuerdosTexto: [
          "Se escucharon 4 audiencias públicas.",
          "Se remiten actas a la Secretaría General de la Presidencia."
        ]
      },
      {
        id: "ses-03",
        fecha: sampleDate3,
        hora: "10:00 a 12:30 hrs.",
        lugar: "Valparaíso",
        tipo: "Sesión Ordinaria",
        materia: `Votación de articulado y despacho de informe a Sala.`,
        invitados: "Ministros y asesores legislativos.",
        acuerdosCount: 4,
        completada: true,
        acuerdosTexto: [
          "Se despacha el informe a Sala.",
          "Se designa parlamentario informante."
        ]
      }
    ],
    documentosGroups: [
      { tipo: "Informes de Comisión", cuenta: 18 },
      { tipo: "Actas de Sesión", cuenta: 48 },
      { tipo: "Minutas Técnicas Asesoría BCN", cuenta: 12 },
      { tipo: "Oficios y Respuestas Ministeriales", cuenta: 26 },
      { tipo: "Presentaciones de Expositores", cuenta: 34 }
    ],
    actividades: [
      {
        id: "act-01",
        fecha: "02 Sep 2026",
        titulo: "Sesión Ordinaria Concluida",
        descripcion: "Finalizó el debate técnico sobre indicaciones particulares.",
        tipo: "sesion"
      },
      {
        id: "act-02",
        fecha: "26 Ago 2026",
        titulo: "Audiencias Públicas Sostenidas",
        descripcion: "Exposición de organismos públicos y gremios en sala de sesiones.",
        tipo: "sesion"
      },
      {
        id: "act-03",
        fecha: "19 Ago 2026",
        titulo: "Informe de Trámite Despachado",
        descripcion: "Solicitud de antecedentes remitida al Ministerio respectivo.",
        tipo: "informe"
      }
    ]
  };
}

