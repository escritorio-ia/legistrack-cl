import { Integrante, Comision, Proyecto, SesionItem } from "../types";

export interface ComisionMeta {
  id: string;
  senadoId?: string;
  prmID?: string;
  nombre: string;
  descripcion: string;
  estado: string;
  chamber: "CD" | "SR";
  prefix: "cd-" | "senado-";
  icon: string;
  color?: string;
  featured?: boolean;
  temas?: string[];
  telefono?: string;
  email?: string;
  staff?: { cargo: string; nombre: string }[];
  integrantes: Integrante[];
}

export const DIPUTADOS_COMISIONES_DETALLE: ComisionMeta[] = [
  {
    "id": "gobierno-interior",
    "prmID": "4897",
    "nombre": "Comisión de Gobierno Interior, Nacionalidad, Ciudadanía y Regionalización",
    "descripcion": "Descentralización administrativa, división política, migración, extranjería y régimen municipal.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Landmark",
    "color": "blue",
    "temas": [
      "Migración",
      "Descentralización",
      "Gobernadores",
      "Municipios",
      "Extranjería",
      "Regiones"
    ],
    "telefono": "(56+32) 250 5052",
    "email": "mrequena@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Juan Carlos Herrera Infante"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Jorge Mera Schmidt"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Marcela Paz Requena Letelier"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Carolina Andrea González Holmes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1062",
        "nombre": "Joanna Pérez Olea",
        "partido": "DEM",
        "distrito": "N°21",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1062"
      },
      {
        "prmID": "1017",
        "nombre": "Álvaro Carter Fernández",
        "partido": "PREP",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1017"
      },
      {
        "prmID": "1215",
        "nombre": "Álvaro Jofré Cáceres",
        "partido": "PNL",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1215"
      },
      {
        "prmID": "1227",
        "nombre": "Claudia Mora Vega",
        "partido": "RN",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1227"
      },
      {
        "prmID": "1234",
        "nombre": "Mario Olavarría Rodríguez",
        "partido": "UDI",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1234"
      },
      {
        "prmID": "1235",
        "nombre": "Javier Olivares Avendaño",
        "partido": "PDG",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1235"
      },
      {
        "prmID": "1238",
        "nombre": "Álvaro Ortiz Vera",
        "partido": "DC",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1238"
      },
      {
        "prmID": "1061",
        "nombre": "Andrea Parra Sauterel",
        "partido": "PPD",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1061"
      },
      {
        "prmID": "1245",
        "nombre": "Alejandro Riquelme Ducci",
        "partido": "PREP",
        "distrito": "N°28",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1245"
      },
      {
        "prmID": "1248",
        "nombre": "Felipe Ross Correa",
        "partido": "PREP",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1248"
      },
      {
        "prmID": "1249",
        "nombre": "Omar Sabat Guzmán",
        "partido": "IND",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1249"
      },
      {
        "prmID": "1177",
        "nombre": "Carolina Tello Rojas",
        "partido": "FA",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1177"
      },
      {
        "prmID": "1260",
        "nombre": "César Valenzuela Maass",
        "partido": "PS",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1260"
      }
    ]
  },
  {
    "id": "rree",
    "prmID": "4889",
    "nombre": "Comisión de Relaciones Exteriores, Asuntos Interparlamentarios e Integración Latinoamericana",
    "descripcion": "Monitoreo de tratados internacionales, acuerdos bilaterales y política diplomática exterior chilena.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Globe",
    "color": "blue",
    "temas": [
      "Tratados",
      "Diplomacia",
      "Cancillería",
      "Comercio Exterior",
      "Antártica",
      "Convenios"
    ],
    "telefono": "(56+32) 250 5200",
    "email": "sherry.pena@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Pedro Nolasco Muga Ramírez"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Germán Andres Salazar Roblin"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Sherry Sacha Peña Bahamondes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1172",
        "nombre": "Stephan Schubert Rubio",
        "partido": "PREP",
        "distrito": "N°23",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1172"
      },
      {
        "prmID": "1100",
        "nombre": "Cristián Araya Lerdo de Tejada",
        "partido": "PREP",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1100"
      },
      {
        "prmID": "1108",
        "nombre": "Juan Carlos Beltrán Silva",
        "partido": "RN",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1108"
      },
      {
        "prmID": "1025",
        "nombre": "Catalina Del Real Mihovilovic",
        "partido": "PREP",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1025"
      },
      {
        "prmID": "1208",
        "nombre": "Jorge Díaz Ibarra",
        "partido": "DC",
        "distrito": "N°1",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1208"
      },
      {
        "prmID": "1143",
        "nombre": "Cristóbal Martínez Ramírez",
        "partido": "UDI",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1143"
      },
      {
        "prmID": "1054",
        "nombre": "Francesca Muñoz González",
        "partido": "PCCH",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1054"
      },
      {
        "prmID": "1240",
        "nombre": "Zandra Parisi Fernández",
        "partido": "PDG",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1240"
      },
      {
        "prmID": "1159",
        "nombre": "Lorena Pizarro Sierra",
        "partido": "PC",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1159"
      },
      {
        "prmID": "1065",
        "nombre": "Guillermo Ramírez Diez",
        "partido": "UDI",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1065"
      },
      {
        "prmID": "1077",
        "nombre": "Raúl Soto Mardones",
        "partido": "PPD",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1077"
      },
      {
        "prmID": "1181",
        "nombre": "Nelson Venegas Salazar",
        "partido": "PS",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1181"
      },
      {
        "prmID": "1086",
        "nombre": "Gonzalo Winter Etcheberry",
        "partido": "FA",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1086"
      }
    ]
  },
  {
    "id": "constitucion",
    "prmID": "4884",
    "nombre": "Comisión de Constitución, Legislación, Justicia y Reglamento",
    "descripcion": "Tramitaciones de reformas constitucionales, leyes orgánicas, códigos sustantivos y derecho procesal.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Scale",
    "color": "purple",
    "featured": true,
    "temas": [
      "Constitución",
      "Poder Judicial",
      "Nombramientos",
      "Código Penal",
      "Justicia",
      "Reglamento"
    ],
    "telefono": "(56+32) 250 5116",
    "email": "ccespede@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Patricio Alberto Velásquez Weisse"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Margarita Maria Risopatron Lemaitre"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Cecilia Elizabeth Césped Riquelme"
      }
    ],
    "integrantes": [
      {
        "prmID": "872",
        "nombre": "Jaime Mulet Martínez",
        "partido": "FRVS",
        "distrito": "N°4",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL872"
      },
      {
        "prmID": "1188",
        "nombre": "Marcos Barraza Gómez",
        "partido": "PC",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1188"
      },
      {
        "prmID": "1202",
        "nombre": "Eduardo Cretton Rebolledo",
        "partido": "UDI",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1202"
      },
      {
        "prmID": "1127",
        "nombre": "Lorena Fries Monleón",
        "partido": "FA",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1127"
      },
      {
        "prmID": "1132",
        "nombre": "Jorge Guzmán Zepeda",
        "partido": "EVOP",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1132"
      },
      {
        "prmID": "1214",
        "nombre": "Constanza Hube Portus",
        "partido": "UDI",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1214"
      },
      {
        "prmID": "1038",
        "nombre": "Marcos Ilabaca Cerda",
        "partido": "PS",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1038"
      },
      {
        "prmID": "1133",
        "nombre": "Juan Irarrázaval Rossel",
        "partido": "PREP",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1133"
      },
      {
        "prmID": "1039",
        "nombre": "Pamela Jiles Moreno",
        "partido": "PDG",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1039"
      },
      {
        "prmID": "1218",
        "nombre": "José Antonio Kast Adriasola",
        "partido": "PREP",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1218"
      },
      {
        "prmID": "1226",
        "nombre": "José Montalva Feuerhake",
        "partido": "IND",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1226"
      },
      {
        "prmID": "1237",
        "nombre": "Francisco Orrego Gutiérrez",
        "partido": "RN",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1237"
      },
      {
        "prmID": "1170",
        "nombre": "Luis Sánchez Ossa",
        "partido": "PREP",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1170"
      }
    ]
  },
  {
    "id": "educacion",
    "prmID": "4895",
    "nombre": "Comisión de Educación",
    "descripcion": "Estudio del sistema nacional de educación, financiamiento escolar y superior, y estatutos docentes.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "BookOpen",
    "color": "emerald",
    "temas": [
      "Fin al CAE",
      "Universidades",
      "SLEP",
      "Colegio de Profesores",
      "Educación Escolar",
      "Convivencia"
    ],
    "telefono": "(56+32) 250 5017",
    "email": "educam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "María Soledad Fredes Ruiz"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Paula Ávalos Purralef"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "María Teresa Garrido Bravo"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Teresita de Jesús Sandoval Lagos"
      }
    ],
    "integrantes": [
      {
        "prmID": "815",
        "nombre": "Sergio Bobadilla Muñoz",
        "partido": "UDI",
        "distrito": "N°20",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL815"
      },
      {
        "prmID": "1105",
        "nombre": "Héctor Barría Angulo",
        "partido": "DC",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1105"
      },
      {
        "prmID": "1191",
        "nombre": "Valentina Becerra Peña",
        "partido": "PREP",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1191"
      },
      {
        "prmID": "1198",
        "nombre": "Paz Charpentier Rajcevich",
        "partido": "PREP",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1198"
      },
      {
        "prmID": "1119",
        "nombre": "Sara Concha Smith",
        "partido": "PCCH",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1119"
      },
      {
        "prmID": "1233",
        "nombre": "Ricardo Neumann Bertín",
        "partido": "UDI",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1233"
      },
      {
        "prmID": "1236",
        "nombre": "Paula Olmos Contreras",
        "partido": "PDG",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1236"
      },
      {
        "prmID": "1060",
        "nombre": "Luis Pardo Sáinz",
        "partido": "RN",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1060"
      },
      {
        "prmID": "1073",
        "nombre": "Juan Santana Castillo",
        "partido": "PS",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1073"
      },
      {
        "prmID": "1171",
        "nombre": "Emilia Schneider Videla",
        "partido": "FA",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1171"
      },
      {
        "prmID": "1173",
        "nombre": "Daniela Serrano Salazar",
        "partido": "PC",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1173"
      },
      {
        "prmID": "915",
        "nombre": "Germán Verdugo Soto",
        "partido": "PNL",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL915"
      },
      {
        "prmID": "1262",
        "nombre": "Diego Vergara Rodríguez",
        "partido": "PREP",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1262"
      }
    ]
  },
  {
    "id": "hacienda",
    "prmID": "4890",
    "nombre": "Comisión de Hacienda",
    "descripcion": "Revisión del presupuesto fiscal de la nación, políticas de recaudación e inversión gubernamental.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "TrendingUp",
    "color": "blue",
    "featured": true,
    "temas": [
      "Presupuesto",
      "Impuestos",
      "Reforma Tributaria",
      "DIPRES",
      "Inversión",
      "Gasto Público"
    ],
    "telefono": "(56+32) 250 5207",
    "email": "hacicam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "María Eugenia Silva Ferrer"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Gabriela Paz Carvajal Andrade"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Lía Monserrat Arroyo Canessa"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Alejandra Vergara Gómez"
      }
    ],
    "integrantes": [
      {
        "prmID": "1165",
        "nombre": "Agustín Romero Leiva",
        "partido": "PREP",
        "distrito": "N°8",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1165"
      },
      {
        "prmID": "1012",
        "nombre": "Boris Barrera Moreno",
        "partido": "PC",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1012"
      },
      {
        "prmID": "1110",
        "nombre": "Carlos Bianchi Chelech",
        "partido": "IND",
        "distrito": "N°28",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1110"
      },
      {
        "prmID": "1015",
        "nombre": "Jorge Brito Hasbún",
        "partido": "FA",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1015"
      },
      {
        "prmID": "1196",
        "nombre": "Priscilla Castillo Gerli",
        "partido": "DC",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1196"
      },
      {
        "prmID": "1199",
        "nombre": "Jaime Coloma Álamos",
        "partido": "UDI",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1199"
      },
      {
        "prmID": "1028",
        "nombre": "Eduardo Durán Salinas",
        "partido": "RN",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1028"
      },
      {
        "prmID": "1217",
        "nombre": "Pier Karlezi Hazleby",
        "partido": "PNL",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1217"
      },
      {
        "prmID": "1146",
        "nombre": "José Carlos Meza Pereira",
        "partido": "PREP",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1146"
      },
      {
        "prmID": "1075",
        "nombre": "Diego Schalper Sepúlveda",
        "partido": "RN",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1075"
      },
      {
        "prmID": "1253",
        "nombre": "Fernando Ugarte Tejeda",
        "partido": "PREP",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1253"
      },
      {
        "prmID": "1259",
        "nombre": "Juan Marcelo Valenzuela Henríquez",
        "partido": "PDG",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1259"
      },
      {
        "prmID": "1183",
        "nombre": "Flor Weisse Novoa",
        "partido": "UDI",
        "distrito": "N°21",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1183"
      }
    ]
  },
  {
    "id": "defensa",
    "prmID": "4896",
    "nombre": "Comisión de Defensa Nacional",
    "descripcion": "Asuntos relativos a la seguridad exterior del Estado, soberanía limítrofe y gestión de las Fuerzas Armadas.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "ShieldAlert",
    "color": "red",
    "temas": [
      "Fuerzas Armadas",
      "Ejército",
      "Armada",
      "FACh",
      "Fronteras",
      "Soberanía",
      "Infraestructura Crítica"
    ],
    "telefono": "(56+32) 250 5537",
    "email": "defencam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Carlos Fernando Cámara Oyarzo"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Elizabeth Michelle Cangas Shand"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Carolina Andrea González Holmes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1017",
        "nombre": "Álvaro Carter Fernández",
        "partido": "PREP",
        "distrito": "N°12",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1017"
      },
      {
        "prmID": "1188",
        "nombre": "Marcos Barraza Gómez",
        "partido": "PC",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1188"
      },
      {
        "prmID": "1189",
        "nombre": "Jaime Bassa Mercado",
        "partido": "FA",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1189"
      },
      {
        "prmID": "1015",
        "nombre": "Jorge Brito Hasbún",
        "partido": "FA",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1015"
      },
      {
        "prmID": "1205",
        "nombre": "Carlos Cuadrado Prats",
        "partido": "PPD",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1205"
      },
      {
        "prmID": "1044",
        "nombre": "Raúl Leiva Carvajal",
        "partido": "PS",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1044"
      },
      {
        "prmID": "1223",
        "nombre": "Hans Marowski Cuevas",
        "partido": "PNL",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1223"
      },
      {
        "prmID": "1235",
        "nombre": "Javier Olivares Avendaño",
        "partido": "PDG",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1235"
      },
      {
        "prmID": "1249",
        "nombre": "Omar Sabat Guzmán",
        "partido": "IND",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1249"
      },
      {
        "prmID": "1170",
        "nombre": "Luis Sánchez Ossa",
        "partido": "PREP",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1170"
      },
      {
        "prmID": "1075",
        "nombre": "Diego Schalper Sepúlveda",
        "partido": "RN",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1075"
      },
      {
        "prmID": "1261",
        "nombre": "Daniel Valenzuela Salazar",
        "partido": "IND",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1261"
      },
      {
        "prmID": "1263",
        "nombre": "Sebastián Zamora Soto",
        "partido": "IND",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1263"
      }
    ]
  },
  {
    "id": "obras-publicas",
    "prmID": "4885",
    "nombre": "Comisión de Obras Públicas, Transportes y Telecomunicaciones",
    "descripcion": "Infraestructura vial, transportes terrestres, ferroviarios, marítimos, aéreos y telecomunicaciones.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Truck",
    "color": "amber",
    "temas": [
      "Concesiones",
      "MOP",
      "Transporte Público",
      "Carreteras",
      "EFE",
      "Telecomunicaciones"
    ],
    "telefono": "(56+32) 250 5142",
    "email": "rfuentes@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Roberto Mario Fuentes Innocenti"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Francisca Javiera Navarro Moyano"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Maria Cristina Toro Pérez"
      }
    ],
    "integrantes": [
      {
        "prmID": "843",
        "nombre": "René Manuel García García",
        "partido": "RN",
        "distrito": "N°23",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL843"
      },
      {
        "prmID": "1186",
        "nombre": "Ignacio Achurra Díaz",
        "partido": "FA",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1186"
      },
      {
        "prmID": "1110",
        "nombre": "Carlos Bianchi Chelech",
        "partido": "IND",
        "distrito": "N°28",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1110"
      },
      {
        "prmID": "1116",
        "nombre": "Felipe Camaño Cárdenas",
        "partido": "IND",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1116"
      },
      {
        "prmID": "1117",
        "nombre": "Nathalie Castillo Rojas",
        "partido": "PC",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1117"
      },
      {
        "prmID": "1204",
        "nombre": "Francisco Crisóstomo Llanos",
        "partido": "PS",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1204"
      },
      {
        "prmID": "1217",
        "nombre": "Pier Karlezi Hazleby",
        "partido": "PNL",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1217"
      },
      {
        "prmID": "1220",
        "nombre": "Leandro Kunstmann Collado",
        "partido": "PREP",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1220"
      },
      {
        "prmID": "1225",
        "nombre": "Cristian Menchaca Pinochet",
        "partido": "IND",
        "distrito": "N°18",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1225"
      },
      {
        "prmID": "872",
        "nombre": "Jaime Mulet Martínez",
        "partido": "FRVS",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL872"
      },
      {
        "prmID": "1239",
        "nombre": "Fabián Ossandón Briceño",
        "partido": "PDG",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1239"
      },
      {
        "prmID": "1157",
        "nombre": "Marlene Pérez Cartes",
        "partido": "IND",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1157"
      },
      {
        "prmID": "1166",
        "nombre": "Natalia Romero Talguia",
        "partido": "IND",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1166"
      }
    ]
  },
  {
    "id": "agricultura",
    "prmID": "4900",
    "nombre": "Comisión de Agricultura, Silvicultura y Desarrollo Rural",
    "descripcion": "Desarrollo silvoagropecuario, seguridad y soberanía alimentaria, sanidad vegetal y animal.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Wheat",
    "color": "emerald",
    "temas": [
      "Agricultura",
      "SAG",
      "INDAP",
      "Código de Aguas",
      "Soberanía Alimentaria",
      "Exportaciones Silvoagropecuarias"
    ],
    "telefono": "(56+32) 250 5289",
    "email": "agricam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Rafael Alberto Ruz Parra"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Fabiola Alejandra Urbina Rouse"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Erica Margot Sanhueza Escalona"
      }
    ],
    "integrantes": [
      {
        "prmID": "1166",
        "nombre": "Natalia Romero Talguia",
        "partido": "IND",
        "distrito": "N°15",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1166"
      },
      {
        "prmID": "803",
        "nombre": "René Alinco Bustos",
        "partido": "IND",
        "distrito": "N°27",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL803"
      },
      {
        "prmID": "1114",
        "nombre": "Félix Bugueño Sotelo",
        "partido": "FA",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1114"
      },
      {
        "prmID": "1194",
        "nombre": "Daniel Bustos Leal",
        "partido": "PREP",
        "distrito": "N°18",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1194"
      },
      {
        "prmID": "1211",
        "nombre": "Sofía González Cortés",
        "partido": "PC",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1211"
      },
      {
        "prmID": "1140",
        "nombre": "Daniel Lilayu Vivanco",
        "partido": "UDI",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1140"
      },
      {
        "prmID": "1225",
        "nombre": "Cristian Menchaca Pinochet",
        "partido": "IND",
        "distrito": "N°18",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1225"
      },
      {
        "prmID": "1229",
        "nombre": "Javier Muñoz Riquelme",
        "partido": "DC",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1229"
      },
      {
        "prmID": "1152",
        "nombre": "Gloria Naveillan Arriagada",
        "partido": "PNL",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1152"
      },
      {
        "prmID": "1056",
        "nombre": "Emilia Nuyado Ancapichun",
        "partido": "PS",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1056"
      },
      {
        "prmID": "1242",
        "nombre": "Rodrigo Ramírez Parra",
        "partido": "IND",
        "distrito": "N°18",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1242"
      },
      {
        "prmID": "1244",
        "nombre": "Claudia Reyes Larenas",
        "partido": "PREP",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1244"
      },
      {
        "prmID": "1258",
        "nombre": "Guillermo Valdés Carmona",
        "partido": "PDG",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1258"
      }
    ]
  },
  {
    "id": "medio-ambiente",
    "prmID": "4888",
    "nombre": "Comisión de Medio Ambiente y Recursos Naturales",
    "descripcion": "Protección ambiental, biodiversidad, cambio climático, glaciares y evaluación ambiental.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Leaf",
    "color": "emerald",
    "temas": [
      "Cambio Climático",
      "Biodiversidad",
      "SBAP",
      "Glaciares",
      "Humedales",
      "Evaluación Ambiental"
    ],
    "telefono": "(56+32) 250 5520",
    "email": "medioambiente@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Ana María Skoknic Defilippis"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Ignacio Sebastian Vásquez Mella"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Silvia Brisa Rivas Mena"
      }
    ],
    "integrantes": [
      {
        "prmID": "1065",
        "nombre": "Guillermo Ramírez Diez",
        "partido": "UDI",
        "distrito": "N°9",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1065"
      },
      {
        "prmID": "1099",
        "nombre": "Jaime Araya Guerrero",
        "partido": "IND",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1099"
      },
      {
        "prmID": "1104",
        "nombre": "Chiara Barchiesi Chávez",
        "partido": "PREP",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1104"
      },
      {
        "prmID": "1189",
        "nombre": "Jaime Bassa Mercado",
        "partido": "FA",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1189"
      },
      {
        "prmID": "1204",
        "nombre": "Francisco Crisóstomo Llanos",
        "partido": "PS",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1204"
      },
      {
        "prmID": "1210",
        "nombre": "Gustavo Gatica Villarroel",
        "partido": "IND",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1210"
      },
      {
        "prmID": "1220",
        "nombre": "Leandro Kunstmann Collado",
        "partido": "PREP",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1220"
      },
      {
        "prmID": "1141",
        "nombre": "Luis Malla Valenzuela",
        "partido": "PL",
        "distrito": "N°1",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1141"
      },
      {
        "prmID": "1228",
        "nombre": "Paulina Muñoz Minte",
        "partido": "PNL",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1228"
      },
      {
        "prmID": "1233",
        "nombre": "Ricardo Neumann Bertín",
        "partido": "UDI",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1233"
      },
      {
        "prmID": "1060",
        "nombre": "Luis Pardo Sáinz",
        "partido": "RN",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1060"
      },
      {
        "prmID": "1243",
        "nombre": "Tamara Ramírez Ramírez",
        "partido": "PDG",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1243"
      },
      {
        "prmID": "1244",
        "nombre": "Claudia Reyes Larenas",
        "partido": "PREP",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1244"
      }
    ]
  },
  {
    "id": "salud",
    "prmID": "4894",
    "nombre": "Comisión de Salud",
    "descripcion": "Discusión del sistema de salud público y privado, Fonasa, Isapres, hospitales y medicamentos.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Heart",
    "color": "rose",
    "temas": [
      "Isapres",
      "Fonasa",
      "Hospitales",
      "Medicamentos",
      "Listas de Espera",
      "Salud Mental",
      "Ley Corta"
    ],
    "telefono": "(56+32) 250 5520",
    "email": "saludcam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Ana María Skoknic Defilippis"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Ignacio Sebastian Vásquez Mella"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Silvia Brisa Rivas Mena"
      }
    ],
    "integrantes": [
      {
        "prmID": "1021",
        "nombre": "Andrés Celis Montt",
        "partido": "RN",
        "distrito": "N°7",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1021"
      },
      {
        "prmID": "1102",
        "nombre": "Roberto Arroyo Muñoz",
        "partido": "IND",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1102"
      },
      {
        "prmID": "1107",
        "nombre": "María Francisca Bello Campos",
        "partido": "FA",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1107"
      },
      {
        "prmID": "1025",
        "nombre": "Catalina Del Real Mihovilovic",
        "partido": "PREP",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1025"
      },
      {
        "prmID": "1209",
        "nombre": "Matías Fernández Hartwig",
        "partido": "FA",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1209"
      },
      {
        "prmID": "1140",
        "nombre": "Daniel Lilayu Vivanco",
        "partido": "UDI",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1140"
      },
      {
        "prmID": "1142",
        "nombre": "Daniel Manouchehri Lobos",
        "partido": "PS",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1142"
      },
      {
        "prmID": "1224",
        "nombre": "Cristian Mella Andaur",
        "partido": "DC",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1224"
      },
      {
        "prmID": "1240",
        "nombre": "Zandra Parisi Fernández",
        "partido": "PDG",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1240"
      },
      {
        "prmID": "1165",
        "nombre": "Agustín Romero Leiva",
        "partido": "PREP",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1165"
      },
      {
        "prmID": "1251",
        "nombre": "Macarena Santelices Cañas",
        "partido": "PREP",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1251"
      },
      {
        "prmID": "1257",
        "nombre": "Alejandra Valdebenito Torres",
        "partido": "UDI",
        "distrito": "N°27",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1257"
      },
      {
        "prmID": "1264",
        "nombre": "Fernando Zamorano Peralta",
        "partido": "PPD",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1264"
      }
    ]
  },
  {
    "id": "trabajo-y-prevision",
    "prmID": "4891",
    "nombre": "Comisión de Trabajo y Seguridad Social",
    "descripcion": "Estudio de proyectos relativos al empleo, pensiones, seguridad social y Código del Trabajo.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "HardHat",
    "color": "red",
    "featured": true,
    "temas": [
      "Pensiones",
      "Reforma Previsional",
      "Empleo",
      "40 Horas",
      "Ley Karin",
      "Sindicatos",
      "Salarios"
    ],
    "telefono": "(56+32) 250 5200",
    "email": "sherry.pena@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Pedro Nolasco Muga Ramírez"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Germán Andres Salazar Roblin"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Sherry Sacha Peña Bahamondes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1146",
        "nombre": "José Carlos Meza Pereira",
        "partido": "PREP",
        "distrito": "N°9",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1146"
      },
      {
        "prmID": "1187",
        "nombre": "Carlo Arqueros Pizarro",
        "partido": "PREP",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1187"
      },
      {
        "prmID": "1122",
        "nombre": "Luis Alberto Cuello Peña y Lillo",
        "partido": "PC",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1122"
      },
      {
        "prmID": "1212",
        "nombre": "Erich Grohs Marín",
        "partido": "PNL",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1212"
      },
      {
        "prmID": "1214",
        "nombre": "Constanza Hube Portus",
        "partido": "UDI",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1214"
      },
      {
        "prmID": "1234",
        "nombre": "Mario Olavarría Rodríguez",
        "partido": "UDI",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1234"
      },
      {
        "prmID": "1059",
        "nombre": "Ximena Ossandón Irarrázabal",
        "partido": "RN",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1059"
      },
      {
        "prmID": "1241",
        "nombre": "Patricio Pinilla Valencia",
        "partido": "DC",
        "distrito": "N°21",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1241"
      },
      {
        "prmID": "1243",
        "nombre": "Tamara Ramírez Ramírez",
        "partido": "PDG",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1243"
      },
      {
        "prmID": "1172",
        "nombre": "Stephan Schubert Rubio",
        "partido": "PREP",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1172"
      },
      {
        "prmID": "1178",
        "nombre": "Héctor Ulloa Aguilera",
        "partido": "IND",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1178"
      },
      {
        "prmID": "1181",
        "nombre": "Nelson Venegas Salazar",
        "partido": "PS",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1181"
      },
      {
        "prmID": "1087",
        "nombre": "Gael Yeomans Araya",
        "partido": "FA",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1087"
      }
    ]
  },
  {
    "id": "mineria",
    "prmID": "4892",
    "nombre": "Comisión de Minería y Energía",
    "descripcion": "Marco regulatorio de la minería metálica y no metálica (cobre, litio) y transición energética.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Pickaxe",
    "color": "amber",
    "temas": [
      "Cobre",
      "Litio",
      "Codelco",
      "ENAMI",
      "Transición Energética",
      "Cierre de Faenas"
    ],
    "telefono": "(56+32) 250 5390",
    "email": "cdiaz@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "María Cristina Díaz Fuenzalida"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Carolina Pérez Quinzacara"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Sherry Sacha Peña Bahamondes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1175",
        "nombre": "Cristián Tapia Ramos",
        "partido": "IND",
        "distrito": "N°4",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1175"
      },
      {
        "prmID": "1187",
        "nombre": "Carlo Arqueros Pizarro",
        "partido": "PREP",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1187"
      },
      {
        "prmID": "1207",
        "nombre": "Valentina Cáceres Monsálvez",
        "partido": "IND",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1207"
      },
      {
        "prmID": "1208",
        "nombre": "Jorge Díaz Ibarra",
        "partido": "DC",
        "distrito": "N°1",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1208"
      },
      {
        "prmID": "1212",
        "nombre": "Erich Grohs Marín",
        "partido": "PNL",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1212"
      },
      {
        "prmID": "1216",
        "nombre": "Stephanie Jéldrez Ortiz",
        "partido": "PREP",
        "distrito": "N°1",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1216"
      },
      {
        "prmID": "1236",
        "nombre": "Paula Olmos Contreras",
        "partido": "PDG",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1236"
      },
      {
        "prmID": "1246",
        "nombre": "José Antonio Rivas Villalobos",
        "partido": "PS",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1246"
      },
      {
        "prmID": "1250",
        "nombre": "Bernardo Salinas Maya",
        "partido": "IND",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1250"
      },
      {
        "prmID": "1174",
        "nombre": "Marco Antonio Sulantay Olivares",
        "partido": "UDI",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1174"
      },
      {
        "prmID": "1254",
        "nombre": "Ignacio Urcullú Clèment-Lund",
        "partido": "PREP",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1254"
      },
      {
        "prmID": "1261",
        "nombre": "Daniel Valenzuela Salazar",
        "partido": "IND",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1261"
      },
      {
        "prmID": "1182",
        "nombre": "Sebastián Videla Castillo",
        "partido": "IND",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1182"
      }
    ]
  },
  {
    "id": "economia",
    "prmID": "4893",
    "nombre": "Comisión de Economía, Fomento; Micro, Pequeña y Mediana Empresa; Protección de los Consumidores y Turismo",
    "descripcion": "Fomento productivo, protección de los derechos de los consumidores, pymes y turismo.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "BarChart3",
    "color": "blue",
    "temas": [
      "SERNAC",
      "Pymes",
      "Competencia",
      "FNE",
      "Turismo",
      "Innovación"
    ],
    "telefono": "(56+32) 250 5445",
    "email": "ajhalabid@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Claudia Andrea Rodríguez Andrade"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Carolina de los Ánge Salas Prussing"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Luz Alicia Barrientos Rivadeneira"
      }
    ],
    "integrantes": [
      {
        "prmID": "1248",
        "nombre": "Felipe Ross Correa",
        "partido": "PREP",
        "distrito": "N°13",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1248"
      },
      {
        "prmID": "1193",
        "nombre": "Patricio Briones Moller",
        "partido": "PDG",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1193"
      },
      {
        "prmID": "1196",
        "nombre": "Priscilla Castillo Gerli",
        "partido": "DC",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1196"
      },
      {
        "prmID": "1203",
        "nombre": "Sebastián Cristoffanini Jaraquemada",
        "partido": "PREP",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1203"
      },
      {
        "prmID": "1206",
        "nombre": "Carolina Cucumides Calderón",
        "partido": "IND",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1206"
      },
      {
        "prmID": "1213",
        "nombre": "Irací Hassler Jacob",
        "partido": "PC",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1213"
      },
      {
        "prmID": "1219",
        "nombre": "Tomás Kast Sommerhoff",
        "partido": "EVOP",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1219"
      },
      {
        "prmID": "1245",
        "nombre": "Alejandro Riquelme Ducci",
        "partido": "PREP",
        "distrito": "N°28",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1245"
      },
      {
        "prmID": "1252",
        "nombre": "Constanza Schonhaut Soto",
        "partido": "FA",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1252"
      },
      {
        "prmID": "1077",
        "nombre": "Raúl Soto Mardones",
        "partido": "PPD",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1077"
      },
      {
        "prmID": "1174",
        "nombre": "Marco Antonio Sulantay Olivares",
        "partido": "UDI",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1174"
      },
      {
        "prmID": "1176",
        "nombre": "Hotuiti Teao Drago",
        "partido": "IND",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1176"
      },
      {
        "prmID": "915",
        "nombre": "Germán Verdugo Soto",
        "partido": "PNL",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL915"
      }
    ]
  },
  {
    "id": "vivienda",
    "prmID": "4899",
    "nombre": "Comisión de Vivienda, Desarrollo Urbano y Bienes Nacionales",
    "descripcion": "Políticas habitacionales, integración social, planes reguladores y gestión de bienes nacionales.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Home",
    "color": "cyan",
    "temas": [
      "Déficit Habitacional",
      "Campamentos",
      "Subsidios",
      "Planes Reguladores",
      "Bienes Nacionales"
    ],
    "telefono": "(56+32) 250 5483",
    "email": "viviendacam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Claudia Andrea Rodríguez Andrade"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Andrés Felipe Cruz González"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Hugo Antonio Balladares Gajardo"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Evelyn Lorena Gómez Salgado"
      }
    ],
    "integrantes": [
      {
        "prmID": "1108",
        "nombre": "Juan Carlos Beltrán Silva",
        "partido": "RN",
        "distrito": "N°22",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1108"
      },
      {
        "prmID": "1198",
        "nombre": "Paz Charpentier Rajcevich",
        "partido": "PREP",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1198"
      },
      {
        "prmID": "1128",
        "nombre": "Ana María Gazmuri Vieira",
        "partido": "PAH",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1128"
      },
      {
        "prmID": "1215",
        "nombre": "Álvaro Jofré Cáceres",
        "partido": "PNL",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1215"
      },
      {
        "prmID": "1229",
        "nombre": "Javier Muñoz Riquelme",
        "partido": "DC",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1229"
      },
      {
        "prmID": "1230",
        "nombre": "Alex Nahuelquin Nahuelquin",
        "partido": "PDG",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1230"
      },
      {
        "prmID": "1232",
        "nombre": "Cristian Neira Martínez",
        "partido": "PREP",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1232"
      },
      {
        "prmID": "1056",
        "nombre": "Emilia Nuyado Ancapichun",
        "partido": "PS",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1056"
      },
      {
        "prmID": "1234",
        "nombre": "Mario Olavarría Rodríguez",
        "partido": "UDI",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1234"
      },
      {
        "prmID": "1249",
        "nombre": "Omar Sabat Guzmán",
        "partido": "IND",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1249"
      },
      {
        "prmID": "1251",
        "nombre": "Macarena Santelices Cañas",
        "partido": "PREP",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1251"
      },
      {
        "prmID": "1178",
        "nombre": "Héctor Ulloa Aguilera",
        "partido": "IND",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1178"
      },
      {
        "prmID": "1256",
        "nombre": "Tatiana Urrutia Herrera",
        "partido": "FA",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1256"
      }
    ]
  },
  {
    "id": "derechos-humanos",
    "prmID": "4887",
    "nombre": "Comisión de Derechos Humanos y Pueblos Originarios",
    "descripcion": "Promoción y defensa de los derechos humanos, memoria histórica y derechos de pueblos originarios.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "HeartHandshake",
    "color": "purple",
    "temas": [
      "INDH",
      "Pueblos Originarios",
      "Memoria",
      "Diversidad",
      "Garantías Fundamentales"
    ],
    "telefono": "(56+32) 250 5000",
    "email": "ddhhcam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Juan Carlos Herrera Infante"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Fernando Javier García Leiva"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Paula Andrea Batarce Valdés"
      }
    ],
    "integrantes": [
      {
        "prmID": "1152",
        "nombre": "Gloria Naveillan Arriagada",
        "partido": "PNL",
        "distrito": "N°22",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1152"
      },
      {
        "prmID": "1190",
        "nombre": "Enrique Bassaletti Riess",
        "partido": "IND",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1190"
      },
      {
        "prmID": "1184",
        "nombre": "Roberto Celedón Fernández",
        "partido": "IND",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1184"
      },
      {
        "prmID": "1021",
        "nombre": "Andrés Celis Montt",
        "partido": "RN",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1021"
      },
      {
        "prmID": "1205",
        "nombre": "Carlos Cuadrado Prats",
        "partido": "PPD",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1205"
      },
      {
        "prmID": "986",
        "nombre": "Marcela Hernando Pérez",
        "partido": "PR",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL986"
      },
      {
        "prmID": "1044",
        "nombre": "Raúl Leiva Carvajal",
        "partido": "PS",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1044"
      },
      {
        "prmID": "1221",
        "nombre": "Benjamín Lorca Inzunza",
        "partido": "PREP",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1221"
      },
      {
        "prmID": "1148",
        "nombre": "Javiera Morales Alvarado",
        "partido": "FA",
        "distrito": "N°28",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1148"
      },
      {
        "prmID": "1059",
        "nombre": "Ximena Ossandón Irarrázabal",
        "partido": "RN",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1059"
      },
      {
        "prmID": "1159",
        "nombre": "Lorena Pizarro Sierra",
        "partido": "PC",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1159"
      },
      {
        "prmID": "1176",
        "nombre": "Hotuiti Teao Drago",
        "partido": "IND",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1176"
      },
      {
        "prmID": "1257",
        "nombre": "Alejandra Valdebenito Torres",
        "partido": "UDI",
        "distrito": "N°27",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1257"
      }
    ]
  },
  {
    "id": "familias",
    "prmID": "4898",
    "nombre": "Comisión de la Familia",
    "descripcion": "Protección integral de las familias, infancia, adolescencia, adopción y cuidado.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Users",
    "color": "pink",
    "temas": [
      "Niñez",
      "Servicio Mejor Niñez",
      "Pensiones de Alimentos",
      "Adopción",
      "Sociedad Conyugal"
    ],
    "telefono": "(56+32) 250 5445",
    "email": "famicam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Patricio Alberto Velásquez Weisse"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Carolina de los Ánge Salas Prussing"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Luz Alicia Barrientos Rivadeneira"
      }
    ],
    "integrantes": [
      {
        "prmID": "1133",
        "nombre": "Juan Irarrázaval Rossel",
        "partido": "PREP",
        "distrito": "N°14",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1133"
      },
      {
        "prmID": "1184",
        "nombre": "Roberto Celedón Fernández",
        "partido": "IND",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1184"
      },
      {
        "prmID": "1028",
        "nombre": "Eduardo Durán Salinas",
        "partido": "RN",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1028"
      },
      {
        "prmID": "1127",
        "nombre": "Lorena Fries Monleón",
        "partido": "FA",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1127"
      },
      {
        "prmID": "1218",
        "nombre": "José Antonio Kast Adriasola",
        "partido": "PREP",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1218"
      },
      {
        "prmID": "1221",
        "nombre": "Benjamín Lorca Inzunza",
        "partido": "PREP",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1221"
      },
      {
        "prmID": "1054",
        "nombre": "Francesca Muñoz González",
        "partido": "PCCH",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1054"
      },
      {
        "prmID": "1231",
        "nombre": "Ximena Naranjo Pinto",
        "partido": "IND",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1231"
      },
      {
        "prmID": "1236",
        "nombre": "Paula Olmos Contreras",
        "partido": "PDG",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1236"
      },
      {
        "prmID": "1238",
        "nombre": "Álvaro Ortiz Vera",
        "partido": "DC",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1238"
      },
      {
        "prmID": "1240",
        "nombre": "Zandra Parisi Fernández",
        "partido": "PDG",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1240"
      },
      {
        "prmID": "1159",
        "nombre": "Lorena Pizarro Sierra",
        "partido": "PC",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1159"
      },
      {
        "prmID": "1260",
        "nombre": "César Valenzuela Maass",
        "partido": "PS",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1260"
      }
    ]
  },
  {
    "id": "ciencias",
    "prmID": "4886",
    "nombre": "Comisión de Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
    "descripcion": "Desarrollo científico, tecnológico, inteligencia artificial, ciberseguridad e innovación.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Cpu",
    "color": "cyan",
    "temas": [
      "Inteligencia Artificial",
      "Ciberseguridad",
      "Investigación",
      "ANID",
      "Innovación Tecnológica"
    ],
    "telefono": "(56+32) 250 5017",
    "email": "cienciacam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "María Soledad Fredes Ruiz"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Paula Ávalos Purralef"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Teresita de Jesús Sandoval Lagos"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "María Teresa Garrido Bravo"
      }
    ],
    "integrantes": [
      {
        "prmID": "1142",
        "nombre": "Daniel Manouchehri Lobos",
        "partido": "PS",
        "distrito": "N°5",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1142"
      },
      {
        "prmID": "1193",
        "nombre": "Patricio Briones Moller",
        "partido": "PDG",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1193"
      },
      {
        "prmID": "1021",
        "nombre": "Andrés Celis Montt",
        "partido": "RN",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1021"
      },
      {
        "prmID": "1223",
        "nombre": "Hans Marowski Cuevas",
        "partido": "PNL",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1223"
      },
      {
        "prmID": "1143",
        "nombre": "Cristóbal Martínez Ramírez",
        "partido": "UDI",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1143"
      },
      {
        "prmID": "1226",
        "nombre": "José Montalva Feuerhake",
        "partido": "IND",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1226"
      },
      {
        "prmID": "1232",
        "nombre": "Cristian Neira Martínez",
        "partido": "PREP",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1232"
      },
      {
        "prmID": "1248",
        "nombre": "Felipe Ross Correa",
        "partido": "PREP",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1248"
      },
      {
        "prmID": "1075",
        "nombre": "Diego Schalper Sepúlveda",
        "partido": "RN",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1075"
      },
      {
        "prmID": "1173",
        "nombre": "Daniela Serrano Salazar",
        "partido": "PC",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1173"
      },
      {
        "prmID": "1180",
        "nombre": "Consuelo Veloso Ávila",
        "partido": "FA",
        "distrito": "N°18",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1180"
      },
      {
        "prmID": "1086",
        "nombre": "Gonzalo Winter Etcheberry",
        "partido": "FA",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1086"
      },
      {
        "prmID": "1087",
        "nombre": "Gael Yeomans Araya",
        "partido": "FA",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1087"
      }
    ]
  },
  {
    "id": "pesca",
    "prmID": "4902",
    "nombre": "Comisión de Pesca, Acuicultura e Intereses Marítimos",
    "descripcion": "Regulación pesquera y de acuicultura, pesca artesanal, cuotas de captura y sustentabilidad marina.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Fish",
    "color": "blue",
    "temas": [
      "Ley de Pesca",
      "Acuicultura",
      "Pesca Artesanal",
      "Cuotas",
      "Sernapesca",
      "Espacios Costeros"
    ],
    "telefono": "(56+32) 250 5142",
    "email": "rfuentes@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Roberto Mario Fuentes Innocenti"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Francisca Javiera Navarro Moyano"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Maria Cristina Toro Pérez"
      }
    ],
    "integrantes": [
      {
        "prmID": "1013",
        "nombre": "Alejandro Bernales Maldonado",
        "partido": "PL",
        "distrito": "N°26",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1013"
      },
      {
        "prmID": "815",
        "nombre": "Sergio Bobadilla Muñoz",
        "partido": "UDI",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL815"
      },
      {
        "prmID": "1114",
        "nombre": "Félix Bugueño Sotelo",
        "partido": "FA",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1114"
      },
      {
        "prmID": "1195",
        "nombre": "Carlos Carvajal Gallardo",
        "partido": "IND",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1195"
      },
      {
        "prmID": "1117",
        "nombre": "Nathalie Castillo Rojas",
        "partido": "PC",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1117"
      },
      {
        "prmID": "1131",
        "nombre": "Mauro González Villarroel",
        "partido": "RN",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1131"
      },
      {
        "prmID": "1222",
        "nombre": "Andrea Macías Palma",
        "partido": "PS",
        "distrito": "N°27",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1222"
      },
      {
        "prmID": "1239",
        "nombre": "Fabián Ossandón Briceño",
        "partido": "PDG",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1239"
      },
      {
        "prmID": "1245",
        "nombre": "Alejandro Riquelme Ducci",
        "partido": "PREP",
        "distrito": "N°28",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1245"
      },
      {
        "prmID": "1074",
        "nombre": "Marisela Santibáñez Novoa",
        "partido": "IND",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1074"
      },
      {
        "prmID": "1177",
        "nombre": "Carolina Tello Rojas",
        "partido": "FA",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1177"
      },
      {
        "prmID": "1258",
        "nombre": "Guillermo Valdés Carmona",
        "partido": "PDG",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1258"
      },
      {
        "prmID": "1262",
        "nombre": "Diego Vergara Rodríguez",
        "partido": "PREP",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1262"
      }
    ]
  },
  {
    "id": "deportes",
    "prmID": "4910",
    "nombre": "Comisión de Deportes y Recreación",
    "descripcion": "Fomento del deporte recreativo y de alto rendimiento, actividad física y regulación deportiva.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Trophy",
    "color": "orange",
    "temas": [
      "Alto Rendimiento",
      "Sociedades Anónimas Deportivas",
      "Violencia en Estadios",
      "Mindep",
      "IND"
    ],
    "telefono": "(56+32) 250 5462",
    "email": "scosta@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Ximena Sonia Inostroza Dragicevic"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Milenka Stanka Kegevic Romero"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Silvia Laura Costa Diaz"
      }
    ],
    "integrantes": [
      {
        "prmID": "1074",
        "nombre": "Marisela Santibáñez Novoa",
        "partido": "IND",
        "distrito": "N°14",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1074"
      },
      {
        "prmID": "1102",
        "nombre": "Roberto Arroyo Muñoz",
        "partido": "IND",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1102"
      },
      {
        "prmID": "1193",
        "nombre": "Patricio Briones Moller",
        "partido": "PDG",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1193"
      },
      {
        "prmID": "1195",
        "nombre": "Carlos Carvajal Gallardo",
        "partido": "IND",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1195"
      },
      {
        "prmID": "1197",
        "nombre": "Carlos Chandía Alarcón",
        "partido": "RN",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1197"
      },
      {
        "prmID": "1200",
        "nombre": "Cristian Contreras Radovic",
        "partido": "PDG",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1200"
      },
      {
        "prmID": "1209",
        "nombre": "Matías Fernández Hartwig",
        "partido": "FA",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1209"
      },
      {
        "prmID": "1224",
        "nombre": "Cristian Mella Andaur",
        "partido": "DC",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1224"
      },
      {
        "prmID": "1251",
        "nombre": "Macarena Santelices Cañas",
        "partido": "PREP",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1251"
      },
      {
        "prmID": "1174",
        "nombre": "Marco Antonio Sulantay Olivares",
        "partido": "UDI",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1174"
      },
      {
        "prmID": "1175",
        "nombre": "Cristián Tapia Ramos",
        "partido": "IND",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1175"
      },
      {
        "prmID": "1176",
        "nombre": "Hotuiti Teao Drago",
        "partido": "IND",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1176"
      },
      {
        "prmID": "1263",
        "nombre": "Sebastián Zamora Soto",
        "partido": "IND",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1263"
      }
    ]
  },
  {
    "id": "zonas-extremas",
    "prmID": "4904",
    "nombre": "Comisión de Zonas Extremas y Antártica Chilena",
    "descripcion": "Legislación e incentivos especiales para las zonas extremas, aislamiento y territorio antártico.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Compass",
    "color": "blue",
    "temas": [
      "Antártica Chilena",
      "Subsidios de Aislamiento",
      "Conectividad Austral",
      "Incentivos Tributarios"
    ],
    "telefono": "(56+32) 250 5200",
    "email": "sherry.pena@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Pedro Nolasco Muga Ramírez"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Germán Andres Salazar Roblin"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Sherry Sacha Peña Bahamondes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1208",
        "nombre": "Jorge Díaz Ibarra",
        "partido": "DC",
        "distrito": "N°1",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1208"
      },
      {
        "prmID": "803",
        "nombre": "René Alinco Bustos",
        "partido": "IND",
        "distrito": "N°27",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL803"
      },
      {
        "prmID": "1012",
        "nombre": "Boris Barrera Moreno",
        "partido": "PC",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1012"
      },
      {
        "prmID": "1110",
        "nombre": "Carlos Bianchi Chelech",
        "partido": "IND",
        "distrito": "N°28",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1110"
      },
      {
        "prmID": "1216",
        "nombre": "Stephanie Jéldrez Ortiz",
        "partido": "PREP",
        "distrito": "N°1",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1216"
      },
      {
        "prmID": "1215",
        "nombre": "Álvaro Jofré Cáceres",
        "partido": "PNL",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1215"
      },
      {
        "prmID": "1141",
        "nombre": "Luis Malla Valenzuela",
        "partido": "PL",
        "distrito": "N°1",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1141"
      },
      {
        "prmID": "1148",
        "nombre": "Javiera Morales Alvarado",
        "partido": "FA",
        "distrito": "N°28",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1148"
      },
      {
        "prmID": "1230",
        "nombre": "Alex Nahuelquin Nahuelquin",
        "partido": "PDG",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1230"
      },
      {
        "prmID": "1056",
        "nombre": "Emilia Nuyado Ancapichun",
        "partido": "PS",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1056"
      },
      {
        "prmID": "1244",
        "nombre": "Claudia Reyes Larenas",
        "partido": "PREP",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1244"
      },
      {
        "prmID": "1257",
        "nombre": "Alejandra Valdebenito Torres",
        "partido": "UDI",
        "distrito": "N°27",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1257"
      },
      {
        "prmID": "1261",
        "nombre": "Daniel Valenzuela Salazar",
        "partido": "IND",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1261"
      }
    ]
  },
  {
    "id": "seguridad",
    "prmID": "4903",
    "nombre": "Comisión de Seguridad Ciudadana",
    "descripcion": "Control de delitos violentos, reforzamiento de instituciones armadas y persecución de crimen organizado.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Shield",
    "color": "blue",
    "featured": true,
    "temas": [
      "Crimen Organizado",
      "Carabineros",
      "PDI",
      "Ley de Armas",
      "Ciberseguridad",
      "Seguridad Pública",
      "Narcotráfico"
    ],
    "telefono": "(56+32) 250 5052",
    "email": "seguridadcam@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Mario Arturo Rebolledo Coddou"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Hugo Antonio Balladares Gajardo"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Claudia Andrea Mora Ramos"
      }
    ],
    "integrantes": [
      {
        "prmID": "1100",
        "nombre": "Cristián Araya Lerdo de Tejada",
        "partido": "PREP",
        "distrito": "N°11",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1100"
      },
      {
        "prmID": "1099",
        "nombre": "Jaime Araya Guerrero",
        "partido": "IND",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1099"
      },
      {
        "prmID": "1104",
        "nombre": "Chiara Barchiesi Chávez",
        "partido": "PREP",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1104"
      },
      {
        "prmID": "1190",
        "nombre": "Enrique Bassaletti Riess",
        "partido": "IND",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1190"
      },
      {
        "prmID": "1199",
        "nombre": "Jaime Coloma Álamos",
        "partido": "UDI",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1199"
      },
      {
        "prmID": "1202",
        "nombre": "Eduardo Cretton Rebolledo",
        "partido": "UDI",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1202"
      },
      {
        "prmID": "1131",
        "nombre": "Mauro González Villarroel",
        "partido": "RN",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1131"
      },
      {
        "prmID": "1044",
        "nombre": "Raúl Leiva Carvajal",
        "partido": "PS",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1044"
      },
      {
        "prmID": "1152",
        "nombre": "Gloria Naveillan Arriagada",
        "partido": "PNL",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1152"
      },
      {
        "prmID": "1241",
        "nombre": "Patricio Pinilla Valencia",
        "partido": "DC",
        "distrito": "N°21",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1241"
      },
      {
        "prmID": "1250",
        "nombre": "Bernardo Salinas Maya",
        "partido": "IND",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1250"
      },
      {
        "prmID": "1256",
        "nombre": "Tatiana Urrutia Herrera",
        "partido": "FA",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1256"
      },
      {
        "prmID": "1259",
        "nombre": "Juan Marcelo Valenzuela Henríquez",
        "partido": "PDG",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1259"
      }
    ]
  },
  {
    "id": "cultura",
    "prmID": "4905",
    "nombre": "Comisión de Cultura, Artes y Comunicaciones",
    "descripcion": "Patrimonio cultural, fomento a las artes, televisión nacional y medios de comunicación.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Palette",
    "color": "purple",
    "temas": [
      "Patrimonio Cultural",
      "Fondos de Cultura",
      "Consejo de Monumentos",
      "Televisión Pública",
      "Artes"
    ],
    "telefono": "(56+32) 250 5483",
    "email": "comcultura@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Claudia Andrea Rodríguez Andrade"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Andrés Felipe Cruz González"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Lía Monserrat Arroyo Canessa"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Evelyn Lorena Gómez Salgado"
      }
    ],
    "integrantes": [
      {
        "prmID": "1247",
        "nombre": "Javiera Rodríguez Pascual",
        "partido": "PREP",
        "distrito": "N°9",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1247"
      },
      {
        "prmID": "1186",
        "nombre": "Ignacio Achurra Díaz",
        "partido": "FA",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1186"
      },
      {
        "prmID": "1013",
        "nombre": "Alejandro Bernales Maldonado",
        "partido": "PL",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1013"
      },
      {
        "prmID": "1197",
        "nombre": "Carlos Chandía Alarcón",
        "partido": "RN",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1197"
      },
      {
        "prmID": "1200",
        "nombre": "Cristian Contreras Radovic",
        "partido": "PDG",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1200"
      },
      {
        "prmID": "1122",
        "nombre": "Luis Alberto Cuello Peña y Lillo",
        "partido": "PC",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1122"
      },
      {
        "prmID": "1150",
        "nombre": "Benjamín Moreno Bascur",
        "partido": "PREP",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1150"
      },
      {
        "prmID": "1233",
        "nombre": "Ricardo Neumann Bertín",
        "partido": "UDI",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1233"
      },
      {
        "prmID": "1237",
        "nombre": "Francisco Orrego Gutiérrez",
        "partido": "RN",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1237"
      },
      {
        "prmID": "1062",
        "nombre": "Joanna Pérez Olea",
        "partido": "DEM",
        "distrito": "N°21",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1062"
      },
      {
        "prmID": "1073",
        "nombre": "Juan Santana Castillo",
        "partido": "PS",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1073"
      },
      {
        "prmID": "1082",
        "nombre": "Cristóbal Urruticoechea Ríos",
        "partido": "PNL",
        "distrito": "N°21",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1082"
      },
      {
        "prmID": "1182",
        "nombre": "Sebastián Videla Castillo",
        "partido": "IND",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1182"
      }
    ]
  },
  {
    "id": "desarrollo-social",
    "prmID": "4907",
    "nombre": "Comisión de Desarrollo Social, Superación de la Pobreza y Planificación",
    "descripcion": "Superación de la pobreza, políticas de inclusión social, grupos vulnerables y planificación.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "LifeBuoy",
    "color": "teal",
    "temas": [
      "Registro Social de Hogares",
      "Pobreza",
      "Subsidios Sociales",
      "Chile Cuida",
      "Inclusión"
    ],
    "telefono": "(56+32) 250 5000",
    "email": "llueiza@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Leonardo Enrique Lueiza Ureta"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Camila Hernando Martel"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Lorena Pascual Rathgeb"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Jrisi Elizabeth Mo Diamantidis Biterna"
      }
    ],
    "integrantes": [
      {
        "prmID": "1243",
        "nombre": "Tamara Ramírez Ramírez",
        "partido": "PDG",
        "distrito": "N°9",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1243"
      },
      {
        "prmID": "1207",
        "nombre": "Valentina Cáceres Monsálvez",
        "partido": "IND",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1207"
      },
      {
        "prmID": "1195",
        "nombre": "Carlos Carvajal Gallardo",
        "partido": "IND",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1195"
      },
      {
        "prmID": "1119",
        "nombre": "Sara Concha Smith",
        "partido": "PCCH",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1119"
      },
      {
        "prmID": "1201",
        "nombre": "Flor Contreras Vivallo",
        "partido": "PDG",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1201"
      },
      {
        "prmID": "1203",
        "nombre": "Sebastián Cristoffanini Jaraquemada",
        "partido": "PREP",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1203"
      },
      {
        "prmID": "1210",
        "nombre": "Gustavo Gatica Villarroel",
        "partido": "IND",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1210"
      },
      {
        "prmID": "1219",
        "nombre": "Tomás Kast Sommerhoff",
        "partido": "EVOP",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1219"
      },
      {
        "prmID": "1220",
        "nombre": "Leandro Kunstmann Collado",
        "partido": "PREP",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1220"
      },
      {
        "prmID": "1222",
        "nombre": "Andrea Macías Palma",
        "partido": "PS",
        "distrito": "N°27",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1222"
      },
      {
        "prmID": "1228",
        "nombre": "Paulina Muñoz Minte",
        "partido": "PNL",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1228"
      },
      {
        "prmID": "1153",
        "nombre": "Coca Ericka Ñanco Vásquez",
        "partido": "FA",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1153"
      },
      {
        "prmID": "1157",
        "nombre": "Marlene Pérez Cartes",
        "partido": "IND",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1157"
      }
    ]
  },
  {
    "id": "recursos-hidricos",
    "prmID": "4909",
    "nombre": "Comisión de Recursos Hídricos y Desertificación",
    "descripcion": "Gestión de recursos hídricos, combate a la desertificación, fiscalización DGA y riego.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Droplet",
    "color": "cyan",
    "temas": [
      "DGA",
      "Desalación",
      "Sequía",
      "APR",
      "Cuencas Hidrográficas",
      "Riego"
    ],
    "telefono": "(56+32) 250 5000",
    "email": "com.recursos.hidricos@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Rafael Alberto Ruz Parra"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Fabiola Alejandra Urbina Rouse"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Erica Margot Sanhueza Escalona"
      }
    ],
    "integrantes": [
      {
        "prmID": "1194",
        "nombre": "Daniel Bustos Leal",
        "partido": "PREP",
        "distrito": "N°18",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1194"
      },
      {
        "prmID": "1009",
        "nombre": "Jorge Alessandri Vergara",
        "partido": "UDI",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1009"
      },
      {
        "prmID": "1105",
        "nombre": "Héctor Barría Angulo",
        "partido": "DC",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1105"
      },
      {
        "prmID": "1107",
        "nombre": "María Francisca Bello Campos",
        "partido": "FA",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1107"
      },
      {
        "prmID": "1117",
        "nombre": "Nathalie Castillo Rojas",
        "partido": "PC",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1117"
      },
      {
        "prmID": "1206",
        "nombre": "Carolina Cucumides Calderón",
        "partido": "IND",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1206"
      },
      {
        "prmID": "843",
        "nombre": "René Manuel García García",
        "partido": "RN",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL843"
      },
      {
        "prmID": "986",
        "nombre": "Marcela Hernando Pérez",
        "partido": "PR",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL986"
      },
      {
        "prmID": "1229",
        "nombre": "Javier Muñoz Riquelme",
        "partido": "DC",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1229"
      },
      {
        "prmID": "1177",
        "nombre": "Carolina Tello Rojas",
        "partido": "FA",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1177"
      },
      {
        "prmID": "1254",
        "nombre": "Ignacio Urcullú Clèment-Lund",
        "partido": "PREP",
        "distrito": "N°4",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1254"
      },
      {
        "prmID": "1255",
        "nombre": "Eileen Urqueta Rojas",
        "partido": "PDG",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1255"
      },
      {
        "prmID": "1264",
        "nombre": "Fernando Zamorano Peralta",
        "partido": "PPD",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1264"
      }
    ]
  },
  {
    "id": "emergencias",
    "prmID": "4912",
    "nombre": "Comisión de Emergencia, Desastres y Bomberos",
    "descripcion": "Prevención y respuesta ante catástrofes naturales, incendios, apoyo a Bomberos y SENAPRED.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Flame",
    "color": "red",
    "temas": [
      "SENAPRED",
      "Bomberos de Chile",
      "Incendios Forestales",
      "Gestión de Riesgos",
      "Reconstrucción"
    ],
    "telefono": "(56+32) 250 5390",
    "email": "cdiaz@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "María Cristina Díaz Fuenzalida"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Carolina Pérez Quinzacara"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Sherry Sacha Peña Bahamondes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1258",
        "nombre": "Guillermo Valdés Carmona",
        "partido": "PDG",
        "distrito": "N°17",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1258"
      },
      {
        "prmID": "1201",
        "nombre": "Flor Contreras Vivallo",
        "partido": "PDG",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1201"
      },
      {
        "prmID": "1216",
        "nombre": "Stephanie Jéldrez Ortiz",
        "partido": "PREP",
        "distrito": "N°1",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1216"
      },
      {
        "prmID": "1227",
        "nombre": "Claudia Mora Vega",
        "partido": "RN",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1227"
      },
      {
        "prmID": "1153",
        "nombre": "Coca Ericka Ñanco Vásquez",
        "partido": "FA",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1153"
      },
      {
        "prmID": "1238",
        "nombre": "Álvaro Ortiz Vera",
        "partido": "DC",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1238"
      },
      {
        "prmID": "1242",
        "nombre": "Rodrigo Ramírez Parra",
        "partido": "IND",
        "distrito": "N°18",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1242"
      },
      {
        "prmID": "1246",
        "nombre": "José Antonio Rivas Villalobos",
        "partido": "PS",
        "distrito": "N°20",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1246"
      },
      {
        "prmID": "1171",
        "nombre": "Emilia Schneider Videla",
        "partido": "FA",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1171"
      },
      {
        "prmID": "1173",
        "nombre": "Daniela Serrano Salazar",
        "partido": "PC",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1173"
      },
      {
        "prmID": "1253",
        "nombre": "Fernando Ugarte Tejeda",
        "partido": "PREP",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1253"
      },
      {
        "prmID": "1180",
        "nombre": "Consuelo Veloso Ávila",
        "partido": "FA",
        "distrito": "N°18",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1180"
      },
      {
        "prmID": "1183",
        "nombre": "Flor Weisse Novoa",
        "partido": "UDI",
        "distrito": "N°21",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1183"
      }
    ]
  },
  {
    "id": "mujeres-genero",
    "prmID": "4913",
    "nombre": "Comisión de Mujeres y Equidad de Género",
    "descripcion": "Equidad de género, erradicación de la violencia hacia las mujeres y derechos reproductivos.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Sparkles",
    "color": "pink",
    "temas": [
      "Violencia de Género",
      "Ley Integral",
      "Brecha Salarial",
      "Corresponsabilidad",
      "SernamEG"
    ],
    "telefono": "(56+32) 250 5462",
    "email": "scosta@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Ximena Sonia Inostroza Dragicevic"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Milenka Stanka Kegevic Romero"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Silvia Laura Costa Diaz"
      }
    ],
    "integrantes": [
      {
        "prmID": "1255",
        "nombre": "Eileen Urqueta Rojas",
        "partido": "PDG",
        "distrito": "N°5",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1255"
      },
      {
        "prmID": "1100",
        "nombre": "Cristián Araya Lerdo de Tejada",
        "partido": "PREP",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1100"
      },
      {
        "prmID": "1191",
        "nombre": "Valentina Becerra Peña",
        "partido": "PREP",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1191"
      },
      {
        "prmID": "1119",
        "nombre": "Sara Concha Smith",
        "partido": "PCCH",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1119"
      },
      {
        "prmID": "1206",
        "nombre": "Carolina Cucumides Calderón",
        "partido": "IND",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1206"
      },
      {
        "prmID": "1213",
        "nombre": "Irací Hassler Jacob",
        "partido": "PC",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1213"
      },
      {
        "prmID": "1227",
        "nombre": "Claudia Mora Vega",
        "partido": "RN",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1227"
      },
      {
        "prmID": "1231",
        "nombre": "Ximena Naranjo Pinto",
        "partido": "IND",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1231"
      },
      {
        "prmID": "1061",
        "nombre": "Andrea Parra Sauterel",
        "partido": "PPD",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1061"
      },
      {
        "prmID": "1247",
        "nombre": "Javiera Rodríguez Pascual",
        "partido": "PREP",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1247"
      },
      {
        "prmID": "1171",
        "nombre": "Emilia Schneider Videla",
        "partido": "FA",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1171"
      },
      {
        "prmID": "1252",
        "nombre": "Constanza Schonhaut Soto",
        "partido": "FA",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1252"
      },
      {
        "prmID": "1180",
        "nombre": "Consuelo Veloso Ávila",
        "partido": "FA",
        "distrito": "N°18",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1180"
      }
    ]
  },
  {
    "id": "personas-mayores",
    "prmID": "4914",
    "nombre": "Comisión de Personas Mayores y Discapacidad",
    "descripcion": "Derechos e inclusión de las personas mayores y personas con discapacidad.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Smile",
    "color": "teal",
    "temas": [
      "SENAMA",
      "Discapacidad",
      "Inclusión Laboral",
      "Cuidados",
      "Accesibilidad"
    ],
    "telefono": "(56+32) 250 5000",
    "email": "com.personasmayoresydiscapacidad@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Mathías Claudius Lindhorst Fernández"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Fernando Javier García Leiva"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Paula Andrea Batarce Valdés"
      }
    ],
    "integrantes": [
      {
        "prmID": "1141",
        "nombre": "Luis Malla Valenzuela",
        "partido": "PL",
        "distrito": "N°1",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1141"
      },
      {
        "prmID": "1191",
        "nombre": "Valentina Becerra Peña",
        "partido": "PREP",
        "distrito": "N°13",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1191"
      },
      {
        "prmID": "1114",
        "nombre": "Félix Bugueño Sotelo",
        "partido": "FA",
        "distrito": "N°16",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1114"
      },
      {
        "prmID": "1208",
        "nombre": "Jorge Díaz Ibarra",
        "partido": "DC",
        "distrito": "N°1",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1208"
      },
      {
        "prmID": "1128",
        "nombre": "Ana María Gazmuri Vieira",
        "partido": "PAH",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1128"
      },
      {
        "prmID": "1211",
        "nombre": "Sofía González Cortés",
        "partido": "PC",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1211"
      },
      {
        "prmID": "1132",
        "nombre": "Jorge Guzmán Zepeda",
        "partido": "EVOP",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1132"
      },
      {
        "prmID": "1230",
        "nombre": "Alex Nahuelquin Nahuelquin",
        "partido": "PDG",
        "distrito": "N°26",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1230"
      },
      {
        "prmID": "1231",
        "nombre": "Ximena Naranjo Pinto",
        "partido": "IND",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1231"
      },
      {
        "prmID": "1232",
        "nombre": "Cristian Neira Martínez",
        "partido": "PREP",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1232"
      },
      {
        "prmID": "1056",
        "nombre": "Emilia Nuyado Ancapichun",
        "partido": "PS",
        "distrito": "N°25",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1056"
      },
      {
        "prmID": "1255",
        "nombre": "Eileen Urqueta Rojas",
        "partido": "PDG",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1255"
      },
      {
        "prmID": "1256",
        "nombre": "Tatiana Urrutia Herrera",
        "partido": "FA",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1256"
      }
    ]
  },
  {
    "id": "inteligencia-estado",
    "prmID": "4911",
    "nombre": "Comisión de Control del Sistema de Inteligencia del Estado",
    "descripcion": "Supervisión y control del Sistema de Inteligencia del Estado y seguridad de la información.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Eye",
    "color": "slate",
    "temas": [
      "ANI",
      "Sistema de Inteligencia del Estado",
      "Seguridad Nacional",
      "Control Parlamentario"
    ],
    "telefono": "(56+32) 250 5000",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Carlos Fernando Cámara Oyarzo"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Elizabeth Michelle Cangas Shand"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Carolina Andrea González Holmes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1235",
        "nombre": "Javier Olivares Avendaño",
        "partido": "PDG",
        "distrito": "N°6",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1235"
      },
      {
        "prmID": "1015",
        "nombre": "Jorge Brito Hasbún",
        "partido": "FA",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1015"
      },
      {
        "prmID": "1211",
        "nombre": "Sofía González Cortés",
        "partido": "PC",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1211"
      },
      {
        "prmID": "1038",
        "nombre": "Marcos Ilabaca Cerda",
        "partido": "PS",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1038"
      },
      {
        "prmID": "1060",
        "nombre": "Luis Pardo Sáinz",
        "partido": "RN",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1060"
      },
      {
        "prmID": "1172",
        "nombre": "Stephan Schubert Rubio",
        "partido": "PREP",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1172"
      },
      {
        "prmID": "1183",
        "nombre": "Flor Weisse Novoa",
        "partido": "UDI",
        "distrito": "N°21",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1183"
      }
    ]
  },
  {
    "id": "subcomision-reglamento",
    "prmID": "4882",
    "nombre": "Comisión de Subcomisión de Reglamento",
    "descripcion": "Revisión técnica de normas reglamentarias internas y procedimientos parlamentarios.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "FileText",
    "color": "slate",
    "temas": [
      "Reglamento de la Cámara",
      "Procedimientos Parlamentarios",
      "Reformas Reglamentarias"
    ],
    "telefono": "(56+32) 250",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Patricio Alberto Velásquez Weisse"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Margarita Maria Risopatron Lemaitre"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Cecilia Elizabeth Césped Riquelme"
      }
    ],
    "integrantes": []
  },
  {
    "id": "subcomision-crimen-organizado",
    "prmID": "4883",
    "nombre": "Comisión de Subcomisión de Crimen Organizado",
    "descripcion": "Estudio especializado de proyectos y medidas contra el crimen organizado transnacional.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "ShieldAlert",
    "color": "red",
    "temas": [
      "Crimen Organizado",
      "Narcotráfico Transnacional",
      "Lavado de Activos"
    ],
    "telefono": "(56+32) 250",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Mario Arturo Rebolledo Coddou"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Hugo Antonio Balladares Gajardo"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Claudia Andrea Mora Ramos"
      }
    ],
    "integrantes": []
  },
  {
    "id": "revisora-cuentas",
    "prmID": "4908",
    "nombre": "Comisión de Revisora de Cuentas",
    "descripcion": "Fiscalización interna, examen de cuentas y presupuesto de la Cámara de Diputadas y Diputados.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Calculator",
    "color": "slate",
    "temas": [
      "Auditoría Interna",
      "Presupuesto de la Cámara",
      "Fiscalización Financiera Interna"
    ],
    "telefono": "(56+32) 250 5000",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Carlos Fernando Cámara Oyarzo"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Elizabeth Michelle Cangas Shand"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Carolina Andrea González Holmes"
      }
    ],
    "integrantes": [
      {
        "prmID": "1264",
        "nombre": "Fernando Zamorano Peralta",
        "partido": "PPD",
        "distrito": "N°15",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1264"
      },
      {
        "prmID": "1012",
        "nombre": "Boris Barrera Moreno",
        "partido": "PC",
        "distrito": "N°9",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1012"
      },
      {
        "prmID": "1209",
        "nombre": "Matías Fernández Hartwig",
        "partido": "FA",
        "distrito": "N°24",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1209"
      },
      {
        "prmID": "843",
        "nombre": "René Manuel García García",
        "partido": "RN",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL843"
      },
      {
        "prmID": "1218",
        "nombre": "José Antonio Kast Adriasola",
        "partido": "PREP",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1218"
      },
      {
        "prmID": "1150",
        "nombre": "Benjamín Moreno Bascur",
        "partido": "PREP",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1150"
      },
      {
        "prmID": "1239",
        "nombre": "Fabián Ossandón Briceño",
        "partido": "PDG",
        "distrito": "N°3",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1239"
      },
      {
        "prmID": "1174",
        "nombre": "Marco Antonio Sulantay Olivares",
        "partido": "UDI",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1174"
      },
      {
        "prmID": "1181",
        "nombre": "Nelson Venegas Salazar",
        "partido": "PS",
        "distrito": "N°6",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1181"
      }
    ]
  },
  {
    "id": "etica",
    "prmID": "4906",
    "nombre": "Comisión de Ética y Transparencia",
    "descripcion": "Vigilancia de la ética parlamentaria, probidad, deberes y sanciones a diputadas y diputados.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Scale",
    "color": "indigo",
    "temas": [
      "Conducta Parlamentaria",
      "Sanciones Disciplinarias",
      "Transparencia",
      "Probidad"
    ],
    "telefono": "(56+32) 250 5052",
    "email": "cmora@congreso.cl",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Mario Arturo Rebolledo Coddou"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Hugo Antonio Balladares Gajardo"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Claudia Andrea Mora Ramos"
      }
    ],
    "integrantes": [
      {
        "prmID": "1253",
        "nombre": "Fernando Ugarte Tejeda",
        "partido": "PREP",
        "distrito": "N°15",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1253"
      },
      {
        "prmID": "1017",
        "nombre": "Álvaro Carter Fernández",
        "partido": "PREP",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1017"
      },
      {
        "prmID": "1195",
        "nombre": "Carlos Carvajal Gallardo",
        "partido": "IND",
        "distrito": "N°2",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1195"
      },
      {
        "prmID": "1127",
        "nombre": "Lorena Fries Monleón",
        "partido": "FA",
        "distrito": "N°10",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1127"
      },
      {
        "prmID": "1210",
        "nombre": "Gustavo Gatica Villarroel",
        "partido": "IND",
        "distrito": "N°8",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1210"
      },
      {
        "prmID": "1132",
        "nombre": "Jorge Guzmán Zepeda",
        "partido": "EVOP",
        "distrito": "N°17",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1132"
      },
      {
        "prmID": "1039",
        "nombre": "Pamela Jiles Moreno",
        "partido": "PDG",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1039"
      },
      {
        "prmID": "1222",
        "nombre": "Andrea Macías Palma",
        "partido": "PS",
        "distrito": "N°27",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1222"
      },
      {
        "prmID": "1166",
        "nombre": "Natalia Romero Talguia",
        "partido": "IND",
        "distrito": "N°15",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1166"
      }
    ]
  },
  {
    "id": "regimen-interno",
    "prmID": "4901",
    "nombre": "Comisión de Régimen Interno y Administración",
    "descripcion": "Administración institucional, funcionamiento de la corporación y gestión de personal.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Building2",
    "color": "slate",
    "temas": [
      "Administración de la Cámara",
      "Personal",
      "Infraestructura",
      "Modernización Institucional"
    ],
    "telefono": "(56+32) 250 5000",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Miguel Humberto Landeros Perkic"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Sebastián Ignacio Flores Cuneo"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "Patricia del Carmen Miranda Ramos"
      }
    ],
    "integrantes": [
      {
        "prmID": "1009",
        "nombre": "Jorge Alessandri Vergara",
        "partido": "UDI",
        "distrito": "N°10",
        "rol": "Presidente de Comisión",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1009"
      },
      {
        "prmID": "1189",
        "nombre": "Jaime Bassa Mercado",
        "partido": "FA",
        "distrito": "N°7",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1189"
      },
      {
        "prmID": "1116",
        "nombre": "Felipe Camaño Cárdenas",
        "partido": "IND",
        "distrito": "N°19",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1116"
      },
      {
        "prmID": "1201",
        "nombre": "Flor Contreras Vivallo",
        "partido": "PDG",
        "distrito": "N°23",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1201"
      },
      {
        "prmID": "1025",
        "nombre": "Catalina Del Real Mihovilovic",
        "partido": "PREP",
        "distrito": "N°11",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1025"
      },
      {
        "prmID": "1142",
        "nombre": "Daniel Manouchehri Lobos",
        "partido": "PS",
        "distrito": "N°5",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1142"
      },
      {
        "prmID": "1152",
        "nombre": "Gloria Naveillan Arriagada",
        "partido": "PNL",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1152"
      },
      {
        "prmID": "1059",
        "nombre": "Ximena Ossandón Irarrázabal",
        "partido": "RN",
        "distrito": "N°12",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1059"
      },
      {
        "prmID": "1061",
        "nombre": "Andrea Parra Sauterel",
        "partido": "PPD",
        "distrito": "N°22",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1061"
      },
      {
        "prmID": "1074",
        "nombre": "Marisela Santibáñez Novoa",
        "partido": "IND",
        "distrito": "N°14",
        "rol": "Miembro Titular",
        "fotoUrl": "https://www.camara.cl/img.aspx?prmID=GRCL1074"
      }
    ]
  },
  {
    "id": "subcomision-comunicaciones",
    "prmID": "4915",
    "nombre": "Comisión de Subcomisión de Régimen Interno en materia de Comunicaciones",
    "descripcion": "Supervisión de medios de comunicación institucional, canal CDTV y radio de la Cámara.",
    "estado": "Comisión Permanente",
    "chamber": "CD",
    "prefix": "cd-",
    "icon": "Tv",
    "color": "slate",
    "temas": [
      "CDTV",
      "Radio Cámara",
      "Comunicaciones Institucionales",
      "Prensa"
    ],
    "telefono": "(56+32) 250 5000",
    "staff": [
      {
        "cargo": "Abogado Secretario",
        "nombre": "Luis Amado Rojas Gallardo"
      },
      {
        "cargo": "Abogado Ayudante",
        "nombre": "Constanza María F. Toro Justiniano"
      },
      {
        "cargo": "Secretaria Ejecutiva",
        "nombre": "María Carolina Cancino Díaz"
      }
    ],
    "integrantes": []
  }
];

export const CAMARA_CITACIONES_SEMANALES_POR_DIA = [
  {
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "totalCitaciones": 11,
    "citaciones": [
      {
        "id": "cit-semana-1",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Trabajo y Seguridad Social",
        "citacionNumero": "Citación Oficial N° 1",
        "hora": "10:00 a 12:00",
        "lugar": "Sala Multiuso 1er Piso primer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Continuar el estudio del proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de adaptabilidad de la jornada de trabajo y establece un régimen especial para el sector turismo y actividades conexas”, correspondiente al boletín N° 18.478-13, con urgencia calificada de “suma”. Para estos efectos, se ha invitado al señor Gustavo Rosenda Salazar, Subsecretario del Trabajo; a la señora María Paz Lagos Valdivieso, Subsecreraria deTurismo; al señor José Pakomio Torres, Presidente de la Cámara Nacional de Comercio (CNC); al señor Matías Rodríguez Burr, abogado laboralista y Presidente del Departamento de Derecho del Trabajo y Seguridad Social de la Universidad de Valparaíso; al señor David Bravo Urrutia, economista, académico, investigador y Director del Centro UC de Encuestas y Estudios Longitudinales; a la señora Susana Jiménez, Presidenta de la Confederación de la Producción y del Comercio (CPC); a la señora Patricia Silva Meléndez, abogada coordinadora del Programa Laboral del Instituto Igualdad y ex Directora del Trabajo, al señor Manuel Muñoz Lorca, abogado coordinador de la Asociación de Empresas de Seguridad Privada y de Transporte de Valores (ASEVA), y a la señora María Teresa Vial, Presidenta de la Cámara de Comercio de Santiago A.G.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Continuar el estudio del proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de ada..."
        ],
        "boletinesRelacionados": [
          "18.478-13"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-2",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "CEI 9 Relativa a determinados actos del Gobierno en materia de seguridad pública y prevención del delito durante la gestión de la ex Ministra de Seguridad Pública",
        "citacionNumero": "Citación Oficial N° 2",
        "hora": "10:30 a 12:30",
        "lugar": "Sala de Lectura primer nivel (Presencial)",
        "tipo": "Comisión Especial Investigadora",
        "materia": "Con el objeto de abocarse al mandato de la Comisión. Para tales efectos, se recibirá a la exministra de Seguridad Pública, doña Trinidad Steinert Herrera; a la ex Subdirectora de Inteligencia, Crimen Organizado y Seguridad Migratoria de esa institución, Prefecta General (R) doña Consuelo Peña San Miguel; a la ex Subsecretaria de Prevención del Delito, doña Ana Victoria Quintana Olguín; al Coordinador de asesores del gabinete presidencial, don Alejandro Irarrázaval Alfonso, y al abogado penalista don Juan Pablo Mañalich Raffo.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Con el objeto de abocarse al mandato de la Comisión. Para tales efectos, se recibirá a la exministra de Seguridad Pública, doña Trinidad Ste..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-3",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "CEI 8 Concesión de autopistas y determinación de peaje y tag",
        "citacionNumero": "Citación Oficial N° 3",
        "hora": "13:30 a 15:00",
        "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
        "tipo": "Comisión Especial Investigadora",
        "materia": "Con el objeto de continuar su cometido y dar cumplimiento a lo encomendado en el mandato. Se ha invitado a: - Ex Ministro de Hacienda, señor Nicolás Grau Veloso. - Ex Directora de Presupuestos, señora Javiera Martínez Fariña. Se ha citado a: - Presidente Panel Técnico de Concesiones, señor Raúl Erazo Torricelli.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Con el objeto de continuar su cometido y dar cumplimiento a lo encomendado en el mandato. Se ha invitado a: - Ex Ministro de Hacienda, señor..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-4",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Seguridad Ciudadana",
        "citacionNumero": "Citación Oficial N° 4",
        "hora": "14:50 a 16:50",
        "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "De 14:50 a 15:50 horas: Continuar la votación en particular del proyecto de ley, originado en mensaje de S. E., el Presidente de la República que, “crea el registro de actos vandálicos e incivilidades”. Boletín N°18.341-25, con urgencia calificada de “suma”. En primer trámite constitucional y primero reglamentario. Para tales efectos se invitó al biministro del Interior y de la Secretaría General de Gobierno, señor Claudio Alvarado Andrade.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "De 14:50 a 15:50 horas: Continuar la votación en particular del proyecto de ley, originado en mensaje de S. E., el Presidente de la Repúblic..."
        ],
        "boletinesRelacionados": [
          "18.341-25"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-5",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "la Familia",
        "citacionNumero": "Citación Oficial N° 5",
        "hora": "14:50 a 16:50",
        "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "continuar la discusión y votación particular del proyecto de ley, iniciado en mensaje de S. E. el Presidente de la República, que fortalece el ejercicio de la responsabilidad parental, boletín N°18378-18, en primer trámite constitucional y reglamentario, con urgencia calificada de \"suma\". NOTA: Se recuerda que el plazo para la formulación de INDICACIONES del proyecto de ley sobre RESPONSABILIDAD PARENTAL, boletín N° 18378-18 ES EL JUEVES 3 de SEPTIEMBRE DE 2026, a las 12:00 horas (mediodía). Se encuentra invitado el Ministro de Justicia y Derechos Humanos, señor Fernando Rabat, junto al Subsecretario, señor Luis Alejandro Silva para participar de la tramitación de dicha iniciativa legal, boletín N°18378-18.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "continuar la discusión y votación particular del proyecto de ley, iniciado en mensaje de S. E. el Presidente de la República, que fortalece ..."
        ],
        "boletinesRelacionados": [
          "18378-18"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-6",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Zonas Extremas y Antártica Chilena",
        "citacionNumero": "Citación Oficial N° 6",
        "hora": "14:50 a 16:50",
        "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Recibir en audiencia al señor Roberto Levin Jiménez, Director Ejecutivo de la Fundación Acrux, a fin de que exponga la experiencia de dicha institución en la realización de operativos médicos en zonas extremas y territorios aislados, y dé a conocer propuestas y alternativas destinadas a contribuir a la reducción de las listas de espera y a mejorar el acceso a prestaciones de salud en dichos territorios, atendidos los antecedentes planteados por los alcaldes y alcaldesas durante el ciclo de audiencias desarrollado por la Comisión.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Recibir en audiencia al señor Roberto Levin Jiménez, Director Ejecutivo de la Fundación Acrux, a fin de que exponga la experiencia de dicha ..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-7",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Recursos Hídricos y Desertificación",
        "citacionNumero": "Citación Oficial N° 7",
        "hora": "14:50 a 16:50",
        "lugar": "Sala N° 410 cuarto nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Iniciar la discusión particular del proyecto de ley que modifica el Código de Aguas para garantizar la participación de comités y cooperativas de agua potable rural, prestadoras de servicios sanitarios rurales, en los directorios de las comunidades de agua, correspondiente a los boletines números 17.324-33 y 17.325-33, refundidos, en primer trámite constitucional y segundo reglamentario.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Iniciar la discusión particular del proyecto de ley que modifica el Código de Aguas para garantizar la participación de comités y cooperativ..."
        ],
        "boletinesRelacionados": [
          "17.324-33",
          "17.325-33"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-8",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Cultura, Artes y Comunicaciones",
        "citacionNumero": "Citación Oficial N° 8",
        "hora": "14:50 a 16:50",
        "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Recibir en audiencia a la señora Amara Rivera, en representación de la Corporación Hijas e Hijos de Gabriela Mistral, con el objeto de que exponga acerca del destino de los derechos de autor de la obra de la poetisa y de la propuesta de destinarlos íntegramente a programas artísticos, educacionales y culturales dirigidos a los niños de Montegrande. Asimismo, para que se refiera a la posibilidad de impulsar una iniciativa legal que extienda la vigencia de dichos derechos cuando la voluntad expresa del autor o autora se funde en una finalidad social y de bien público. Se ha invitado a la señora Amara Rivera, en representación de la referida Corporación.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Recibir en audiencia a la señora Amara Rivera, en representación de la Corporación Hijas e Hijos de Gabriela Mistral, con el objeto de que e..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-9",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Desarrollo Social, Superación de la Pobreza y Planificación",
        "citacionNumero": "Citación Oficial N° 9",
        "hora": "14:50 a 16:50",
        "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "analizar, junto a las autoridades competentes, las conclusiones y propuestas contenidas en el Informe de la Mesa por la Niñez, elaborado por la Comisión de Familia, e identificar las materias vinculadas al ámbito de su competencia, así como eventuales iniciativas legislativas que puedan impulsarse a partir de dicho trabajo. Para tales efectos se encuentran invitados: - Subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. - Director del Servicio Nacional de Protección Especializada a la Niñez y Adolescencia (S), señor Gherman Welsch Chahuán.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "analizar, junto a las autoridades competentes, las conclusiones y propuestas contenidas en el Informe de la Mesa por la Niñez, elaborado por..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-10",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Control del Sistema de Inteligencia del Estado",
        "citacionNumero": "Citación Oficial N° 10",
        "hora": "15:30 a 16:50",
        "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Tratar materias propias de la competencia de la Comisión. Invitados: Director de la Agencia Nacional de Inteligencia, señor Ronald Mc Intyre Astorga. Fiscal Nacional del Ministerio Público, señor Ángel Valencia Vásquez.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Tratar materias propias de la competencia de la Comisión. Invitados: Director de la Agencia Nacional de Inteligencia, señor Ronald Mc Intyre..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-11",
        "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
        "citacionNumero": "Citación Oficial N° 11",
        "hora": "16:15 a 19:00",
        "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Sesión especial* citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. * Esta sesión reemplaza a la ordinaria, toda vez que la Comisión tiene una actividad oficial en Santiago con la ministra de Ciencia, Tecnología, Conocimiento e Innovación. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Sesión especial* citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urg..."
        ],
        "boletinesRelacionados": [
          "18224-18",
          "18246-18",
          "18318-19",
          "18415-18"
        ],
        "acuerdosCount": 0,
        "completada": false
      }
    ]
  },
  {
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "totalCitaciones": 15,
    "citaciones": [
      {
        "id": "cit-semana-12",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "CEI 2 Sobre discrepancias en las cifras de producción de Codelco durante el año 2025",
        "citacionNumero": "Citación Oficial N° 12",
        "hora": "08:30 a 09:50",
        "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
        "tipo": "Comisión Especial Investigadora",
        "materia": "recibir en audiencia, en el marco de su mandato, al Economista y Director Académico del Diplomado en Finanzas, FEN, de la Universidad de Chile, señor Jorge Berríos Vogel.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "recibir en audiencia, en el marco de su mandato, al Economista y Director Académico del Diplomado en Finanzas, FEN, de la Universidad de Chi..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-13",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
        "citacionNumero": "Citación Oficial N° 13",
        "hora": "10:30 a 13:00",
        "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urge..."
        ],
        "boletinesRelacionados": [
          "18224-18",
          "18246-18",
          "18318-19",
          "18415-18"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-14",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Ética y Transparencia",
        "citacionNumero": "Citación Oficial N° 14",
        "hora": "11:00 a 12:30",
        "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Con el objeto de tratar materias propias de su competencia.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Con el objeto de tratar materias propias de su competencia...."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-15",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Constitución, Legislación, Justicia y Reglamento",
        "citacionNumero": "Citación Oficial N° 15",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Francisco Bulnes Sanfuentes tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Continuar la tramitación en particular del proyecto de ley, en primer trámite constitucional e iniciado en mensaje, que “Amplía las hipótesis de tráfico de migrantes y modifica los textos legales que indica”. Boletín N° 18.315-07 refundido con proyecto de ley N° 16.948-07. Discusión inmediata. Se ha invitado al señor Ministro de Justicia y Derechos Humanos, y a los expertos en derecho penal señora Diva Serra (U. de Concepción); señora Tania Gajardo (U. Católica de Chile); señor Juan Pablo Castillo (U. A. Hurtado); Antonio Bascuñán (U. Adolfo Ibáñez), sin perjuicio de los invitados que propongan los (as) integrantes de la Comisión.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Continuar la tramitación en particular del proyecto de ley, en primer trámite constitucional e iniciado en mensaje, que “Amplía las hipótesi..."
        ],
        "boletinesRelacionados": [
          "18.315-07",
          "16.948-07"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-16",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Deportes y Recreación",
        "citacionNumero": "Citación Oficial N° 16",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Analizar casos de maltrato y discriminación que han sido puestos en conocimiento de la Defensoría del Deportista, por presuntas vulneraciones de derechos de deportistas, que no habrían obtenido una respuesta adecuada por parte de las instituciones correspondientes. Para tales efectos, se encuentran invitados el Director de la Defensoría del Deportista, señor Eduardo Arévalo Mateluna, y el Subsecretario de la Niñez, don Marcelo Sánchez Ahumada.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Analizar casos de maltrato y discriminación que han sido puestos en conocimiento de la Defensoría del Deportista, por presuntas vulneracione..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-17",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Agricultura, Silvicultura y Desarrollo Rural",
        "citacionNumero": "Citación Oficial N° 17",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "De 15:00 a 16:00 horas: Continuar con la discusión del proyecto de ley que “Modifica la Ley General de Urbanismo y Construcciones, y otros cuerpos legales, para regular el desarrollo de zonas residenciales en el medio rural”, Boletín N°17.006-01. Para este efecto se encuentran invitados: - El Ministro de Agricultura, don Jaime Campos. - El Ministro de Vivienda y Urbanismo, don Iván Poduje.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "De 15:00 a 16:00 horas: Continuar con la discusión del proyecto de ley que “Modifica la Ley General de Urbanismo y Construcciones, y otros c..."
        ],
        "boletinesRelacionados": [
          "17.006-01"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-18",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Gobierno Interior, Nacionalidad, Ciudadanía y Regionalización",
        "citacionNumero": "Citación Oficial N° 18",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Proyecto de ley, de origen en moción, en primer trámite constitucional y reglamentario, que declara feriado nacional el 17 de septiembre de 2026 (Boletín N° 18.600-06). Respecto de este proyecto de ley, ha sido invitado el Biministro de Economía y Energía, señor Daniel Más Valdés.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Proyecto de ley, de origen en moción, en primer trámite constitucional y reglamentario, que declara feriado nacional el 17 de septiembre de ..."
        ],
        "boletinesRelacionados": [
          "18.600-06"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-19",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Educación",
        "citacionNumero": "Citación Oficial N° 19",
        "hora": "15:00 a 17:00",
        "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Sesión ordinaria citada con objeto de ocuparse de los siguientes asuntos:",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Sesión ordinaria citada con objeto de ocuparse de los siguientes asuntos:..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-20",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Relaciones Exteriores, Asuntos Interparlamentarios e Integración Latinoamericana",
        "citacionNumero": "Citación Oficial N° 20",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Recibir en audiencia al señor Gino Casassa Rogazinski, Director del Instituto Antártico Chileno (INACH), a fin de abordar los efectos del calentamiento global y sus causas en el territorio antártico nacional. - Director del Instituto Antártico Chileno (INACH), señor Gino Casassa Rogazinski.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Recibir en audiencia al señor Gino Casassa Rogazinski, Director del Instituto Antártico Chileno (INACH), a fin de abordar los efectos del ca..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-21",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Personas Mayores y Discapacidad",
        "citacionNumero": "Citación Oficial N° 21",
        "hora": "17:30 a 19:30",
        "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Continuar el estudio, en general, de la iniciativa que \"Modifica la ley N°18.961, orgánica constitucional de Carabineros de Chile, en cuanto a los procedimientos de evaluación médica que fundamentan retiros de personal\". Boletín N° 18448-25. Para este objeto se ha invitado a General Director de Carabineros, Marcelo Araya Zapata; al director de Disalcar; al Jefe de la Dirección de Salud de Carabineros, y al Director de Dipreca.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Continuar el estudio, en general, de la iniciativa que \"Modifica la ley N°18.961, orgánica constitucional de Carabineros de Chile, en cuanto..."
        ],
        "boletinesRelacionados": [
          "18448-25"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-22",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Salud",
        "citacionNumero": "Citación Oficial N° 22",
        "hora": "17:30 a 19:30",
        "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Recibir a los representantes de los trabajadores de la atención primaria de salud, a fin de que expongan sobre la situación presupuestaria de la atención primaria, el financiamiento per cápita y los efectos de los recortes en el funcionamiento de los servicios de salud, entre otras materias.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Recibir a los representantes de los trabajadores de la atención primaria de salud, a fin de que expongan sobre la situación presupuestaria d..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-23",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Economía, Fomento; Micro, Pequeña y Mediana Empresa; Protección de los Consumidores y Turismo",
        "citacionNumero": "Citación Oficial N° 23",
        "hora": "17:30 a 19:30",
        "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "continuar la discusión y votación particular del proyecto de ley, originado en mensaje de S. E. el Presidente de la República, que modifica la ley N° 19.799, sobre documentos electrónicos, firma electrónica y servicios de certificación de dicha firma, y otros cuerpos legales relacionados, boletín N° 18286-03, con urgencia calificada de “simple”, en primer trámite constitucional y primero reglamentario. NOTA: Se recuerda que el plazo para la formulación de INDICACIONES a este l proyecto de ley es el VIERNES 4 DE SEPTIEMBRE DE 2026, a las 12:00 hrs (mediodía).. Se encuentra invitado a participar de la tramitación de esta iniciativa el Ministro de Economía, Fomento y Turismo, señor Daniel Mas; el Subsecretario de Economía, señor Karlfranz Koehler y un representante experto en la materia de dicho Ministerio.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "continuar la discusión y votación particular del proyecto de ley, originado en mensaje de S. E. el Presidente de la República, que modifica ..."
        ],
        "boletinesRelacionados": [
          "18286-03"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-24",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Trabajo y Seguridad Social",
        "citacionNumero": "Citación Oficial N° 24",
        "hora": "17:30 a 19:30",
        "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Continuar el estudio y votar en general el proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de adaptabilidad de la jornada de trabajo y establece un régimen especial para el sector turismo y actividades conexas”, correspondiente al boletín N° 18.478-13, con urgencia calificada de “suma”. Para estos efectos, se escucharán, en primer lugar, las intervenciones pendientes de las diputadas señoras Ximena Ossandón y Gael Yeomans. Asimismo, se ha invitado al señor Gustavo Rosende Salazar, Subsecretario del Trabajo; a la señora María Paz Lagos Valdivieso, Subsecretaria de Turismo, al señor Claudio Sánchez Pino, Presidente de la Central de Trabajadores de Chile (CTCH); a la señora Bettina Horst von Thadden, Directora Ejecutiva de Libertad y Desarrollo (LyD); al señor Diego Ignacio Valerio Avalosa, Presidente de la Federación de Sindicatos de Casinos de Juego y Hoteles de Chile (FENASICAJH), y al señor Juan Manuel Mira Velasco, Presidente de Chilealimentos.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Continuar el estudio y votar en general el proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los..."
        ],
        "boletinesRelacionados": [
          "18.478-13"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-25",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Defensa Nacional",
        "citacionNumero": "Citación Oficial N° 25",
        "hora": "17:30 a 19:30",
        "lugar": "Sala N° 408 cuarto nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Continuar la discusión general del proyecto de ley que aumenta la pena aplicable al delito de ingreso no autorizado a recintos militares y policiales, y fortalece la protección de la seguridad pública, correspondiente a los boletines refundidos N°18.361-02 y 18.381-02.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Continuar la discusión general del proyecto de ley que aumenta la pena aplicable al delito de ingreso no autorizado a recintos militares y p..."
        ],
        "boletinesRelacionados": [
          "18.361-02",
          "18.381-02"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-26",
        "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Obras Públicas, Transportes y Telecomunicaciones",
        "citacionNumero": "Citación Oficial N° 26",
        "hora": "17:30 a 19:30",
        "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Mensaje de S. E. el Presidente de la República, en primer trámite constitucional y con urgencia calificada de suma, por el cual da inicio a la tramitación del proyecto que \"modifica la Ley Orgánica de la Empresa de los Ferrocarriles del Estado, con el objeto de establecer una exención de derechos y tributos municipales por la ejecución de obras ferroviarias y declarar dichas obras como infraestructura ejecutada por el Estado\". BOLETÍN N°18.436-15. Se encuentra invitado el Biministro de Obras Públicas, Transportes y Telecomunicaciones, señor Louis De Grange Concha.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Mensaje de S. E. el Presidente de la República, en primer trámite constitucional y con urgencia calificada de suma, por el cual da inicio a ..."
        ],
        "boletinesRelacionados": [
          "18.436-15"
        ],
        "acuerdosCount": 0,
        "completada": false
      }
    ]
  },
  {
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "totalCitaciones": 10,
    "citaciones": [
      {
        "id": "cit-semana-27",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "CEI 3 Control migratorio de NNA extranjeros en el marco de procedimientos de reunificación familiar",
        "citacionNumero": "Citación Oficial N° 27",
        "hora": "08:30 a 09:45",
        "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
        "tipo": "Comisión Especial Investigadora",
        "materia": "Recibir, en el marco del mandato de la comisión, al director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum, para que de respuesta a las consultas formuladas por los miembros de la comisión durante la sesión pasada, y al Defensor de la Niñez, señor Anuar Quesille. El director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum. El Defensor de la Niñez, señor Anuar Quesille.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Recibir, en el marco del mandato de la comisión, al director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum, para que ..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-28",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
        "citacionNumero": "Citación Oficial N° 28",
        "hora": "10:30 a 13:00",
        "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urge..."
        ],
        "boletinesRelacionados": [
          "18224-18",
          "18246-18",
          "18318-19",
          "18415-18"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-29",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Revisora de Cuentas",
        "citacionNumero": "Citación Oficial N° 29",
        "hora": "10:30 a 11:30",
        "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Conocer los informes de auditoría externa elaborados por la empresa Xlibrium, así como aquellos del Comité de Auditoría Parlamentaria. Invitados: Pablo Oneto, Subsecretario Administrativo Patricio Leiva, Jefe de Finanzas Priscila Jara, Abogado Coordinadora del Comité de Auditoría Parlamentaria.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Conocer los informes de auditoría externa elaborados por la empresa Xlibrium, así como aquellos del Comité de Auditoría Parlamentaria. Invit..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-30",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Vivienda, Desarrollo Urbano y Bienes Nacionales",
        "citacionNumero": "Citación Oficial N° 30",
        "hora": "15:00 a 17:00",
        "lugar": "Sala N° 410 cuarto nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Recibir a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capdeville y al Presidente de la Asociación Chilena de Municipalidades (ACHM), señor Gustavo Alessandri Bascuñán, o a quienes designen en su representación, para que se refieran a las modificaciones introducidas a la Ordenanza General de Urbanismo y Construcciones por el decreto supremo N° 68, de 2026, del Ministerio de Vivienda y Urbanismo, particularmente a sus efectos sobre los planes reguladores comunales y metropolitanos y la calidad de vida de las personas. Se ha invitado a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capdeville y al Presidente de la Asociación Chilena de Municipalidades (ACHM), señor Gustavo Alessandri Bascuñán, o a quienes designen en su representación.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Recibir a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capd..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-31",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Pesca, Acuicultura e Intereses Marítimos",
        "citacionNumero": "Citación Oficial N° 31",
        "hora": "15:00 a 17:00",
        "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Continuar la votación en particular del proyecto de ley originado en Moción, en primer trámite constitucional, copatrocinada por los diputados señores Alejandro Bernales, Roberto Celedón, Mauro González, Jorge Guzmán (A), Tomás Kast, Diego Schalper, Carolina Tello y Guillermo Valdés, sobre “Fortalecimiento de la Seguridad Marítima”, BOLETÍN 18.198-15. Se encuentran invitados el Subsecretario de Justicia, señor Luis Silva Irarrázabal; el Capitán de Navío Litoral (CN LT) de la Dirección General del Territorio Marítimo y de Marina Mercante y Jefe del Servicio de Inspecciones Marítimas, señor Roberto Alfaro Pérez; el Teniente 1, señor Gastón Salinas Valdés, Asesor jurídico de la Dirección de Seguridad y Operaciones Marítimas de la Armada de Chile, y la asesora jurídica del Ministerio de Defensa, señora Maricarmen Garrido I.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Continuar la votación en particular del proyecto de ley originado en Moción, en primer trámite constitucional, copatrocinada por los diputad..."
        ],
        "boletinesRelacionados": [
          "18.198-15"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-32",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Mujeres y Equidad de Género",
        "citacionNumero": "Citación Oficial N° 32",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Iniciar la discusión y votación en particular de los siguientes proyectos de ley, refundidos: 1) Moción de las diputadas Sara Concha Smith, Valentina Becerra Peña, Francesca Muñoz González, Paulina Muñoz Minte, Ximena Naranjo Pinto, Javiera Rodríguez Pascual, Marisela Santibáñez Novoa, Eileen Urqueta Rojas y Consuelo Veloso Ávila, y del diputado Eduardo Durán Salinas, que fortalece la protección de las víctimas de violencia intrafamiliar y previene su revictimización, correspondiente al boletín N°18236-18, en primer trámite constitucional y reglamentario, con urgencia calificada de “suma”. 2) Moción de las diputadas Valentina Becerra Peña, Paz Charpentier Rajcevich, Catalina Del Real Mihovilovic, Stephanie Jéldrez Ortiz, Claudia Mora Vega, Zandra Parisi Fernández, Claudia Reyes Larenas y Marisela Santibáñez Novoa, y de los diputados Felipe Camaño Cárdenas y Eduardo Durán Salinas, que modifica cuerpos legales que indica en materia de notificaciones de medidas cautelares dictadas en procesos de violencia intrafamiliar, correspondiente al boletín N°18414-18, en primer trámite constitucional y reglamentario.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Iniciar la discusión y votación en particular de los siguientes proyectos de ley, refundidos: 1) Moción de las diputadas Sara Concha Smith, ..."
        ],
        "boletinesRelacionados": [
          "18236-18",
          "18414-18"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-33",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Medio Ambiente y Recursos Naturales",
        "citacionNumero": "Citación Oficial N° 33",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Continuar la discusión y votación particular, en segundo trámite constitucional, del proyecto de ley que modifica diversos cuerpos legales, con el objeto de fortalecer la institucionalidad ambiental y mejorar su eficiencia, correspondiente al Boletín N° 16.552-12 (S). Urgencia simple.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Continuar la discusión y votación particular, en segundo trámite constitucional, del proyecto de ley que modifica diversos cuerpos legales, ..."
        ],
        "boletinesRelacionados": [
          "16.552-12"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-34",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Derechos Humanos y Pueblos Originarios",
        "citacionNumero": "Citación Oficial N° 34",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Recibir al subsecretario de Derechos Humanos, Pablo Mira Hurtado; y al subsecretario de la Niñez, Marcelo Sánchez Ahumada, para que informen acerca del funcionamiento y estado de avance de la Comisión de Verdad y Niñez, especialmente sobre las labores desarrolladas, las metas y plazos establecidos, las dificultades que ha enfrentado y sus proyecciones futuras. Asimismo, para que efectúen una exposición acabada que comprenda el pasado, presente y futuro de dicha Comisión.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Recibir al subsecretario de Derechos Humanos, Pablo Mira Hurtado; y al subsecretario de la Niñez, Marcelo Sánchez Ahumada, para que informen..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-35",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Constitución, Legislación, Justicia y Reglamento",
        "citacionNumero": "Citación Oficial N° 35",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Francisco Bulnes Sanfuentes tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Continuar con la tramitación en particular del proyecto de ley, iniciado en moción, que “Modifica el Código Penal para sancionar toda forma de instrumentalización de niños, niñas y adolescentes para cometer delitos''. Boletín N° 18.282-07. Se acordó refundirlo con el boletín N°18.590. Urgencia suma. Se ha invitado al señor Ministro de Justicia y Derechos Humanos; a los académicos señora María Elena Santibáñez (U. Católica de Chile); Alejandra Castillo Ara (U. Diego Portales); Francisco Maldonado Fuentes (U. de Talca); Alejandro Leiva López (U. Andrés Bello); Gonzalo Berríos Díaz (U. de Chile).",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Continuar con la tramitación en particular del proyecto de ley, iniciado en moción, que “Modifica el Código Penal para sancionar toda forma ..."
        ],
        "boletinesRelacionados": [
          "18.282-07"
        ],
        "acuerdosCount": 0,
        "completada": false
      },
      {
        "id": "cit-semana-36",
        "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
        "comisionNombre": "Minería y Energía",
        "citacionNumero": "Citación Oficial N° 36",
        "hora": "15:00 a 17:00",
        "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
        "tipo": "Sesión de Comisión",
        "materia": "Analizar la aprobación por parte de la Comisión de Evaluación Ambiental (CEA) del proyecto minero de tierras raras impulsado en la comuna de Penco por la empresa minera Aclara y el Grupo CAP, y sus eventuales implicancias para la comuna y la región. - Biministro de Economía, Fomento y Turismo y Minería, señor Daniel Mas Valdés. - Subsecretario de Minería, señor Álvaro González Gorroño. - Alcalde de Penco, señor Rodrigo Vera Riquelme. - Secretario Regional Ministerial de Minería de la Región del Biobío, señor Daniel Escobar Palma. - Vicedecana de la Facultad de Ingeniería de la Universidad Católica de la Santísima Concepción, señora Matilde Basso Aránguiz.",
        "invitados": "Autoridades sectoriales convocadas.",
        "tabla": [
          "Analizar la aprobación por parte de la Comisión de Evaluación Ambiental (CEA) del proyecto minero de tierras raras impulsado en la comuna de..."
        ],
        "boletinesRelacionados": [],
        "acuerdosCount": 0,
        "completada": false
      }
    ]
  }
];

export const CAMARA_CITACIONES_POR_COMISION: Record<string, any[]> = {
  "trabajo-y-prevision": [
    {
      "id": "cit-semana-1",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Trabajo y Seguridad Social",
      "citacionNumero": "Citación Oficial N° 1",
      "hora": "10:00 a 12:00",
      "lugar": "Sala Multiuso 1er Piso primer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Continuar el estudio del proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de adaptabilidad de la jornada de trabajo y establece un régimen especial para el sector turismo y actividades conexas”, correspondiente al boletín N° 18.478-13, con urgencia calificada de “suma”. Para estos efectos, se ha invitado al señor Gustavo Rosenda Salazar, Subsecretario del Trabajo; a la señora María Paz Lagos Valdivieso, Subsecreraria deTurismo; al señor José Pakomio Torres, Presidente de la Cámara Nacional de Comercio (CNC); al señor Matías Rodríguez Burr, abogado laboralista y Presidente del Departamento de Derecho del Trabajo y Seguridad Social de la Universidad de Valparaíso; al señor David Bravo Urrutia, economista, académico, investigador y Director del Centro UC de Encuestas y Estudios Longitudinales; a la señora Susana Jiménez, Presidenta de la Confederación de la Producción y del Comercio (CPC); a la señora Patricia Silva Meléndez, abogada coordinadora del Programa Laboral del Instituto Igualdad y ex Directora del Trabajo, al señor Manuel Muñoz Lorca, abogado coordinador de la Asociación de Empresas de Seguridad Privada y de Transporte de Valores (ASEVA), y a la señora María Teresa Vial, Presidenta de la Cámara de Comercio de Santiago A.G.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Continuar el estudio del proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de ada..."
      ],
      "boletinesRelacionados": [
        "18.478-13"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "trabajo-y-prevision"
    },
    {
      "id": "cit-semana-24",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Trabajo y Seguridad Social",
      "citacionNumero": "Citación Oficial N° 24",
      "hora": "17:30 a 19:30",
      "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Continuar el estudio y votar en general el proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de adaptabilidad de la jornada de trabajo y establece un régimen especial para el sector turismo y actividades conexas”, correspondiente al boletín N° 18.478-13, con urgencia calificada de “suma”. Para estos efectos, se escucharán, en primer lugar, las intervenciones pendientes de las diputadas señoras Ximena Ossandón y Gael Yeomans. Asimismo, se ha invitado al señor Gustavo Rosende Salazar, Subsecretario del Trabajo; a la señora María Paz Lagos Valdivieso, Subsecretaria de Turismo, al señor Claudio Sánchez Pino, Presidente de la Central de Trabajadores de Chile (CTCH); a la señora Bettina Horst von Thadden, Directora Ejecutiva de Libertad y Desarrollo (LyD); al señor Diego Ignacio Valerio Avalosa, Presidente de la Federación de Sindicatos de Casinos de Juego y Hoteles de Chile (FENASICAJH), y al señor Juan Manuel Mira Velasco, Presidente de Chilealimentos.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Continuar el estudio y votar en general el proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los..."
      ],
      "boletinesRelacionados": [
        "18.478-13"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "trabajo-y-prevision"
    }
  ],
  "seguridad": [
    {
      "id": "cit-semana-4",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Seguridad Ciudadana",
      "citacionNumero": "Citación Oficial N° 4",
      "hora": "14:50 a 16:50",
      "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "De 14:50 a 15:50 horas: Continuar la votación en particular del proyecto de ley, originado en mensaje de S. E., el Presidente de la República que, “crea el registro de actos vandálicos e incivilidades”. Boletín N°18.341-25, con urgencia calificada de “suma”. En primer trámite constitucional y primero reglamentario. Para tales efectos se invitó al biministro del Interior y de la Secretaría General de Gobierno, señor Claudio Alvarado Andrade.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "De 14:50 a 15:50 horas: Continuar la votación en particular del proyecto de ley, originado en mensaje de S. E., el Presidente de la Repúblic..."
      ],
      "boletinesRelacionados": [
        "18.341-25"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "seguridad"
    }
  ],
  "familias": [
    {
      "id": "cit-semana-5",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "la Familia",
      "citacionNumero": "Citación Oficial N° 5",
      "hora": "14:50 a 16:50",
      "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "continuar la discusión y votación particular del proyecto de ley, iniciado en mensaje de S. E. el Presidente de la República, que fortalece el ejercicio de la responsabilidad parental, boletín N°18378-18, en primer trámite constitucional y reglamentario, con urgencia calificada de \"suma\". NOTA: Se recuerda que el plazo para la formulación de INDICACIONES del proyecto de ley sobre RESPONSABILIDAD PARENTAL, boletín N° 18378-18 ES EL JUEVES 3 de SEPTIEMBRE DE 2026, a las 12:00 horas (mediodía). Se encuentra invitado el Ministro de Justicia y Derechos Humanos, señor Fernando Rabat, junto al Subsecretario, señor Luis Alejandro Silva para participar de la tramitación de dicha iniciativa legal, boletín N°18378-18.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "continuar la discusión y votación particular del proyecto de ley, iniciado en mensaje de S. E. el Presidente de la República, que fortalece ..."
      ],
      "boletinesRelacionados": [
        "18378-18"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "familias"
    },
    {
      "id": "cit-semana-27",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "CEI 3 Control migratorio de NNA extranjeros en el marco de procedimientos de reunificación familiar",
      "citacionNumero": "Citación Oficial N° 27",
      "hora": "08:30 a 09:45",
      "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
      "tipo": "Comisión Especial Investigadora",
      "materia": "Recibir, en el marco del mandato de la comisión, al director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum, para que de respuesta a las consultas formuladas por los miembros de la comisión durante la sesión pasada, y al Defensor de la Niñez, señor Anuar Quesille. El director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum. El Defensor de la Niñez, señor Anuar Quesille.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Recibir, en el marco del mandato de la comisión, al director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum, para que ..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "familias"
    }
  ],
  "zonas-extremas": [
    {
      "id": "cit-semana-6",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Zonas Extremas y Antártica Chilena",
      "citacionNumero": "Citación Oficial N° 6",
      "hora": "14:50 a 16:50",
      "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Recibir en audiencia al señor Roberto Levin Jiménez, Director Ejecutivo de la Fundación Acrux, a fin de que exponga la experiencia de dicha institución en la realización de operativos médicos en zonas extremas y territorios aislados, y dé a conocer propuestas y alternativas destinadas a contribuir a la reducción de las listas de espera y a mejorar el acceso a prestaciones de salud en dichos territorios, atendidos los antecedentes planteados por los alcaldes y alcaldesas durante el ciclo de audiencias desarrollado por la Comisión.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Recibir en audiencia al señor Roberto Levin Jiménez, Director Ejecutivo de la Fundación Acrux, a fin de que exponga la experiencia de dicha ..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "zonas-extremas"
    }
  ],
  "recursos-hidricos": [
    {
      "id": "cit-semana-7",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Recursos Hídricos y Desertificación",
      "citacionNumero": "Citación Oficial N° 7",
      "hora": "14:50 a 16:50",
      "lugar": "Sala N° 410 cuarto nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Iniciar la discusión particular del proyecto de ley que modifica el Código de Aguas para garantizar la participación de comités y cooperativas de agua potable rural, prestadoras de servicios sanitarios rurales, en los directorios de las comunidades de agua, correspondiente a los boletines números 17.324-33 y 17.325-33, refundidos, en primer trámite constitucional y segundo reglamentario.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Iniciar la discusión particular del proyecto de ley que modifica el Código de Aguas para garantizar la participación de comités y cooperativ..."
      ],
      "boletinesRelacionados": [
        "17.324-33",
        "17.325-33"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "recursos-hidricos"
    }
  ],
  "cultura": [
    {
      "id": "cit-semana-8",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Cultura, Artes y Comunicaciones",
      "citacionNumero": "Citación Oficial N° 8",
      "hora": "14:50 a 16:50",
      "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Recibir en audiencia a la señora Amara Rivera, en representación de la Corporación Hijas e Hijos de Gabriela Mistral, con el objeto de que exponga acerca del destino de los derechos de autor de la obra de la poetisa y de la propuesta de destinarlos íntegramente a programas artísticos, educacionales y culturales dirigidos a los niños de Montegrande. Asimismo, para que se refiera a la posibilidad de impulsar una iniciativa legal que extienda la vigencia de dichos derechos cuando la voluntad expresa del autor o autora se funde en una finalidad social y de bien público. Se ha invitado a la señora Amara Rivera, en representación de la referida Corporación.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Recibir en audiencia a la señora Amara Rivera, en representación de la Corporación Hijas e Hijos de Gabriela Mistral, con el objeto de que e..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "cultura"
    }
  ],
  "desarrollo-social": [
    {
      "id": "cit-semana-9",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Desarrollo Social, Superación de la Pobreza y Planificación",
      "citacionNumero": "Citación Oficial N° 9",
      "hora": "14:50 a 16:50",
      "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "analizar, junto a las autoridades competentes, las conclusiones y propuestas contenidas en el Informe de la Mesa por la Niñez, elaborado por la Comisión de Familia, e identificar las materias vinculadas al ámbito de su competencia, así como eventuales iniciativas legislativas que puedan impulsarse a partir de dicho trabajo. Para tales efectos se encuentran invitados: - Subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. - Director del Servicio Nacional de Protección Especializada a la Niñez y Adolescencia (S), señor Gherman Welsch Chahuán.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "analizar, junto a las autoridades competentes, las conclusiones y propuestas contenidas en el Informe de la Mesa por la Niñez, elaborado por..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "desarrollo-social"
    }
  ],
  "inteligencia-estado": [
    {
      "id": "cit-semana-10",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Control del Sistema de Inteligencia del Estado",
      "citacionNumero": "Citación Oficial N° 10",
      "hora": "15:30 a 16:50",
      "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Tratar materias propias de la competencia de la Comisión. Invitados: Director de la Agencia Nacional de Inteligencia, señor Ronald Mc Intyre Astorga. Fiscal Nacional del Ministerio Público, señor Ángel Valencia Vásquez.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Tratar materias propias de la competencia de la Comisión. Invitados: Director de la Agencia Nacional de Inteligencia, señor Ronald Mc Intyre..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "inteligencia-estado"
    }
  ],
  "ciencias": [
    {
      "id": "cit-semana-11",
      "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
      "citacionNumero": "Citación Oficial N° 11",
      "hora": "16:15 a 19:00",
      "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Sesión especial* citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. * Esta sesión reemplaza a la ordinaria, toda vez que la Comisión tiene una actividad oficial en Santiago con la ministra de Ciencia, Tecnología, Conocimiento e Innovación. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Sesión especial* citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urg..."
      ],
      "boletinesRelacionados": [
        "18224-18",
        "18246-18",
        "18318-19",
        "18415-18"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "ciencias"
    },
    {
      "id": "cit-semana-13",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
      "citacionNumero": "Citación Oficial N° 13",
      "hora": "10:30 a 13:00",
      "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urge..."
      ],
      "boletinesRelacionados": [
        "18224-18",
        "18246-18",
        "18318-19",
        "18415-18"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "ciencias"
    },
    {
      "id": "cit-semana-28",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
      "citacionNumero": "Citación Oficial N° 28",
      "hora": "10:30 a 13:00",
      "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urge..."
      ],
      "boletinesRelacionados": [
        "18224-18",
        "18246-18",
        "18318-19",
        "18415-18"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "ciencias"
    }
  ],
  "etica": [
    {
      "id": "cit-semana-14",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Ética y Transparencia",
      "citacionNumero": "Citación Oficial N° 14",
      "hora": "11:00 a 12:30",
      "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Con el objeto de tratar materias propias de su competencia.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Con el objeto de tratar materias propias de su competencia...."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "etica"
    }
  ],
  "constitucion": [
    {
      "id": "cit-semana-15",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Constitución, Legislación, Justicia y Reglamento",
      "citacionNumero": "Citación Oficial N° 15",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Francisco Bulnes Sanfuentes tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Continuar la tramitación en particular del proyecto de ley, en primer trámite constitucional e iniciado en mensaje, que “Amplía las hipótesis de tráfico de migrantes y modifica los textos legales que indica”. Boletín N° 18.315-07 refundido con proyecto de ley N° 16.948-07. Discusión inmediata. Se ha invitado al señor Ministro de Justicia y Derechos Humanos, y a los expertos en derecho penal señora Diva Serra (U. de Concepción); señora Tania Gajardo (U. Católica de Chile); señor Juan Pablo Castillo (U. A. Hurtado); Antonio Bascuñán (U. Adolfo Ibáñez), sin perjuicio de los invitados que propongan los (as) integrantes de la Comisión.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Continuar la tramitación en particular del proyecto de ley, en primer trámite constitucional e iniciado en mensaje, que “Amplía las hipótesi..."
      ],
      "boletinesRelacionados": [
        "18.315-07",
        "16.948-07"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "constitucion"
    },
    {
      "id": "cit-semana-35",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Constitución, Legislación, Justicia y Reglamento",
      "citacionNumero": "Citación Oficial N° 35",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Francisco Bulnes Sanfuentes tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Continuar con la tramitación en particular del proyecto de ley, iniciado en moción, que “Modifica el Código Penal para sancionar toda forma de instrumentalización de niños, niñas y adolescentes para cometer delitos''. Boletín N° 18.282-07. Se acordó refundirlo con el boletín N°18.590. Urgencia suma. Se ha invitado al señor Ministro de Justicia y Derechos Humanos; a los académicos señora María Elena Santibáñez (U. Católica de Chile); Alejandra Castillo Ara (U. Diego Portales); Francisco Maldonado Fuentes (U. de Talca); Alejandro Leiva López (U. Andrés Bello); Gonzalo Berríos Díaz (U. de Chile).",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Continuar con la tramitación en particular del proyecto de ley, iniciado en moción, que “Modifica el Código Penal para sancionar toda forma ..."
      ],
      "boletinesRelacionados": [
        "18.282-07"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "constitucion"
    }
  ],
  "deportes": [
    {
      "id": "cit-semana-16",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Deportes y Recreación",
      "citacionNumero": "Citación Oficial N° 16",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Analizar casos de maltrato y discriminación que han sido puestos en conocimiento de la Defensoría del Deportista, por presuntas vulneraciones de derechos de deportistas, que no habrían obtenido una respuesta adecuada por parte de las instituciones correspondientes. Para tales efectos, se encuentran invitados el Director de la Defensoría del Deportista, señor Eduardo Arévalo Mateluna, y el Subsecretario de la Niñez, don Marcelo Sánchez Ahumada.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Analizar casos de maltrato y discriminación que han sido puestos en conocimiento de la Defensoría del Deportista, por presuntas vulneracione..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "deportes"
    }
  ],
  "agricultura": [
    {
      "id": "cit-semana-17",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Agricultura, Silvicultura y Desarrollo Rural",
      "citacionNumero": "Citación Oficial N° 17",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "De 15:00 a 16:00 horas: Continuar con la discusión del proyecto de ley que “Modifica la Ley General de Urbanismo y Construcciones, y otros cuerpos legales, para regular el desarrollo de zonas residenciales en el medio rural”, Boletín N°17.006-01. Para este efecto se encuentran invitados: - El Ministro de Agricultura, don Jaime Campos. - El Ministro de Vivienda y Urbanismo, don Iván Poduje.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "De 15:00 a 16:00 horas: Continuar con la discusión del proyecto de ley que “Modifica la Ley General de Urbanismo y Construcciones, y otros c..."
      ],
      "boletinesRelacionados": [
        "17.006-01"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "agricultura"
    }
  ],
  "gobierno-interior": [
    {
      "id": "cit-semana-18",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Gobierno Interior, Nacionalidad, Ciudadanía y Regionalización",
      "citacionNumero": "Citación Oficial N° 18",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Proyecto de ley, de origen en moción, en primer trámite constitucional y reglamentario, que declara feriado nacional el 17 de septiembre de 2026 (Boletín N° 18.600-06). Respecto de este proyecto de ley, ha sido invitado el Biministro de Economía y Energía, señor Daniel Más Valdés.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Proyecto de ley, de origen en moción, en primer trámite constitucional y reglamentario, que declara feriado nacional el 17 de septiembre de ..."
      ],
      "boletinesRelacionados": [
        "18.600-06"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "gobierno-interior"
    }
  ],
  "educacion": [
    {
      "id": "cit-semana-19",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Educación",
      "citacionNumero": "Citación Oficial N° 19",
      "hora": "15:00 a 17:00",
      "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Sesión ordinaria citada con objeto de ocuparse de los siguientes asuntos:",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Sesión ordinaria citada con objeto de ocuparse de los siguientes asuntos:..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "educacion"
    }
  ],
  "rree": [
    {
      "id": "cit-semana-20",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Relaciones Exteriores, Asuntos Interparlamentarios e Integración Latinoamericana",
      "citacionNumero": "Citación Oficial N° 20",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Recibir en audiencia al señor Gino Casassa Rogazinski, Director del Instituto Antártico Chileno (INACH), a fin de abordar los efectos del calentamiento global y sus causas en el territorio antártico nacional. - Director del Instituto Antártico Chileno (INACH), señor Gino Casassa Rogazinski.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Recibir en audiencia al señor Gino Casassa Rogazinski, Director del Instituto Antártico Chileno (INACH), a fin de abordar los efectos del ca..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "rree"
    }
  ],
  "personas-mayores": [
    {
      "id": "cit-semana-21",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Personas Mayores y Discapacidad",
      "citacionNumero": "Citación Oficial N° 21",
      "hora": "17:30 a 19:30",
      "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Continuar el estudio, en general, de la iniciativa que \"Modifica la ley N°18.961, orgánica constitucional de Carabineros de Chile, en cuanto a los procedimientos de evaluación médica que fundamentan retiros de personal\". Boletín N° 18448-25. Para este objeto se ha invitado a General Director de Carabineros, Marcelo Araya Zapata; al director de Disalcar; al Jefe de la Dirección de Salud de Carabineros, y al Director de Dipreca.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Continuar el estudio, en general, de la iniciativa que \"Modifica la ley N°18.961, orgánica constitucional de Carabineros de Chile, en cuanto..."
      ],
      "boletinesRelacionados": [
        "18448-25"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "personas-mayores"
    }
  ],
  "salud": [
    {
      "id": "cit-semana-22",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Salud",
      "citacionNumero": "Citación Oficial N° 22",
      "hora": "17:30 a 19:30",
      "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Recibir a los representantes de los trabajadores de la atención primaria de salud, a fin de que expongan sobre la situación presupuestaria de la atención primaria, el financiamiento per cápita y los efectos de los recortes en el funcionamiento de los servicios de salud, entre otras materias.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Recibir a los representantes de los trabajadores de la atención primaria de salud, a fin de que expongan sobre la situación presupuestaria d..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "salud"
    }
  ],
  "economia": [
    {
      "id": "cit-semana-23",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Economía, Fomento; Micro, Pequeña y Mediana Empresa; Protección de los Consumidores y Turismo",
      "citacionNumero": "Citación Oficial N° 23",
      "hora": "17:30 a 19:30",
      "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "continuar la discusión y votación particular del proyecto de ley, originado en mensaje de S. E. el Presidente de la República, que modifica la ley N° 19.799, sobre documentos electrónicos, firma electrónica y servicios de certificación de dicha firma, y otros cuerpos legales relacionados, boletín N° 18286-03, con urgencia calificada de “simple”, en primer trámite constitucional y primero reglamentario. NOTA: Se recuerda que el plazo para la formulación de INDICACIONES a este l proyecto de ley es el VIERNES 4 DE SEPTIEMBRE DE 2026, a las 12:00 hrs (mediodía).. Se encuentra invitado a participar de la tramitación de esta iniciativa el Ministro de Economía, Fomento y Turismo, señor Daniel Mas; el Subsecretario de Economía, señor Karlfranz Koehler y un representante experto en la materia de dicho Ministerio.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "continuar la discusión y votación particular del proyecto de ley, originado en mensaje de S. E. el Presidente de la República, que modifica ..."
      ],
      "boletinesRelacionados": [
        "18286-03"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "economia"
    }
  ],
  "defensa": [
    {
      "id": "cit-semana-25",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Defensa Nacional",
      "citacionNumero": "Citación Oficial N° 25",
      "hora": "17:30 a 19:30",
      "lugar": "Sala N° 408 cuarto nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Continuar la discusión general del proyecto de ley que aumenta la pena aplicable al delito de ingreso no autorizado a recintos militares y policiales, y fortalece la protección de la seguridad pública, correspondiente a los boletines refundidos N°18.361-02 y 18.381-02.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Continuar la discusión general del proyecto de ley que aumenta la pena aplicable al delito de ingreso no autorizado a recintos militares y p..."
      ],
      "boletinesRelacionados": [
        "18.361-02",
        "18.381-02"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "defensa"
    }
  ],
  "obras-publicas": [
    {
      "id": "cit-semana-26",
      "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Obras Públicas, Transportes y Telecomunicaciones",
      "citacionNumero": "Citación Oficial N° 26",
      "hora": "17:30 a 19:30",
      "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Mensaje de S. E. el Presidente de la República, en primer trámite constitucional y con urgencia calificada de suma, por el cual da inicio a la tramitación del proyecto que \"modifica la Ley Orgánica de la Empresa de los Ferrocarriles del Estado, con el objeto de establecer una exención de derechos y tributos municipales por la ejecución de obras ferroviarias y declarar dichas obras como infraestructura ejecutada por el Estado\". BOLETÍN N°18.436-15. Se encuentra invitado el Biministro de Obras Públicas, Transportes y Telecomunicaciones, señor Louis De Grange Concha.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Mensaje de S. E. el Presidente de la República, en primer trámite constitucional y con urgencia calificada de suma, por el cual da inicio a ..."
      ],
      "boletinesRelacionados": [
        "18.436-15"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "obras-publicas"
    }
  ],
  "revisora-cuentas": [
    {
      "id": "cit-semana-29",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Revisora de Cuentas",
      "citacionNumero": "Citación Oficial N° 29",
      "hora": "10:30 a 11:30",
      "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Conocer los informes de auditoría externa elaborados por la empresa Xlibrium, así como aquellos del Comité de Auditoría Parlamentaria. Invitados: Pablo Oneto, Subsecretario Administrativo Patricio Leiva, Jefe de Finanzas Priscila Jara, Abogado Coordinadora del Comité de Auditoría Parlamentaria.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Conocer los informes de auditoría externa elaborados por la empresa Xlibrium, así como aquellos del Comité de Auditoría Parlamentaria. Invit..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "revisora-cuentas"
    }
  ],
  "vivienda": [
    {
      "id": "cit-semana-30",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Vivienda, Desarrollo Urbano y Bienes Nacionales",
      "citacionNumero": "Citación Oficial N° 30",
      "hora": "15:00 a 17:00",
      "lugar": "Sala N° 410 cuarto nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Recibir a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capdeville y al Presidente de la Asociación Chilena de Municipalidades (ACHM), señor Gustavo Alessandri Bascuñán, o a quienes designen en su representación, para que se refieran a las modificaciones introducidas a la Ordenanza General de Urbanismo y Construcciones por el decreto supremo N° 68, de 2026, del Ministerio de Vivienda y Urbanismo, particularmente a sus efectos sobre los planes reguladores comunales y metropolitanos y la calidad de vida de las personas. Se ha invitado a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capdeville y al Presidente de la Asociación Chilena de Municipalidades (ACHM), señor Gustavo Alessandri Bascuñán, o a quienes designen en su representación.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Recibir a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capd..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "vivienda"
    }
  ],
  "pesca": [
    {
      "id": "cit-semana-31",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Pesca, Acuicultura e Intereses Marítimos",
      "citacionNumero": "Citación Oficial N° 31",
      "hora": "15:00 a 17:00",
      "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Continuar la votación en particular del proyecto de ley originado en Moción, en primer trámite constitucional, copatrocinada por los diputados señores Alejandro Bernales, Roberto Celedón, Mauro González, Jorge Guzmán (A), Tomás Kast, Diego Schalper, Carolina Tello y Guillermo Valdés, sobre “Fortalecimiento de la Seguridad Marítima”, BOLETÍN 18.198-15. Se encuentran invitados el Subsecretario de Justicia, señor Luis Silva Irarrázabal; el Capitán de Navío Litoral (CN LT) de la Dirección General del Territorio Marítimo y de Marina Mercante y Jefe del Servicio de Inspecciones Marítimas, señor Roberto Alfaro Pérez; el Teniente 1, señor Gastón Salinas Valdés, Asesor jurídico de la Dirección de Seguridad y Operaciones Marítimas de la Armada de Chile, y la asesora jurídica del Ministerio de Defensa, señora Maricarmen Garrido I.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Continuar la votación en particular del proyecto de ley originado en Moción, en primer trámite constitucional, copatrocinada por los diputad..."
      ],
      "boletinesRelacionados": [
        "18.198-15"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "pesca"
    }
  ],
  "mujeres-genero": [
    {
      "id": "cit-semana-32",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Mujeres y Equidad de Género",
      "citacionNumero": "Citación Oficial N° 32",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Iniciar la discusión y votación en particular de los siguientes proyectos de ley, refundidos: 1) Moción de las diputadas Sara Concha Smith, Valentina Becerra Peña, Francesca Muñoz González, Paulina Muñoz Minte, Ximena Naranjo Pinto, Javiera Rodríguez Pascual, Marisela Santibáñez Novoa, Eileen Urqueta Rojas y Consuelo Veloso Ávila, y del diputado Eduardo Durán Salinas, que fortalece la protección de las víctimas de violencia intrafamiliar y previene su revictimización, correspondiente al boletín N°18236-18, en primer trámite constitucional y reglamentario, con urgencia calificada de “suma”. 2) Moción de las diputadas Valentina Becerra Peña, Paz Charpentier Rajcevich, Catalina Del Real Mihovilovic, Stephanie Jéldrez Ortiz, Claudia Mora Vega, Zandra Parisi Fernández, Claudia Reyes Larenas y Marisela Santibáñez Novoa, y de los diputados Felipe Camaño Cárdenas y Eduardo Durán Salinas, que modifica cuerpos legales que indica en materia de notificaciones de medidas cautelares dictadas en procesos de violencia intrafamiliar, correspondiente al boletín N°18414-18, en primer trámite constitucional y reglamentario.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Iniciar la discusión y votación en particular de los siguientes proyectos de ley, refundidos: 1) Moción de las diputadas Sara Concha Smith, ..."
      ],
      "boletinesRelacionados": [
        "18236-18",
        "18414-18"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "mujeres-genero"
    }
  ],
  "medio-ambiente": [
    {
      "id": "cit-semana-33",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Medio Ambiente y Recursos Naturales",
      "citacionNumero": "Citación Oficial N° 33",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Continuar la discusión y votación particular, en segundo trámite constitucional, del proyecto de ley que modifica diversos cuerpos legales, con el objeto de fortalecer la institucionalidad ambiental y mejorar su eficiencia, correspondiente al Boletín N° 16.552-12 (S). Urgencia simple.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Continuar la discusión y votación particular, en segundo trámite constitucional, del proyecto de ley que modifica diversos cuerpos legales, ..."
      ],
      "boletinesRelacionados": [
        "16.552-12"
      ],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "medio-ambiente"
    }
  ],
  "derechos-humanos": [
    {
      "id": "cit-semana-34",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Derechos Humanos y Pueblos Originarios",
      "citacionNumero": "Citación Oficial N° 34",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Recibir al subsecretario de Derechos Humanos, Pablo Mira Hurtado; y al subsecretario de la Niñez, Marcelo Sánchez Ahumada, para que informen acerca del funcionamiento y estado de avance de la Comisión de Verdad y Niñez, especialmente sobre las labores desarrolladas, las metas y plazos establecidos, las dificultades que ha enfrentado y sus proyecciones futuras. Asimismo, para que efectúen una exposición acabada que comprenda el pasado, presente y futuro de dicha Comisión.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Recibir al subsecretario de Derechos Humanos, Pablo Mira Hurtado; y al subsecretario de la Niñez, Marcelo Sánchez Ahumada, para que informen..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "derechos-humanos"
    }
  ],
  "mineria": [
    {
      "id": "cit-semana-36",
      "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
      "comisionNombre": "Minería y Energía",
      "citacionNumero": "Citación Oficial N° 36",
      "hora": "15:00 a 17:00",
      "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
      "tipo": "Sesión de Comisión",
      "materia": "Analizar la aprobación por parte de la Comisión de Evaluación Ambiental (CEA) del proyecto minero de tierras raras impulsado en la comuna de Penco por la empresa minera Aclara y el Grupo CAP, y sus eventuales implicancias para la comuna y la región. - Biministro de Economía, Fomento y Turismo y Minería, señor Daniel Mas Valdés. - Subsecretario de Minería, señor Álvaro González Gorroño. - Alcalde de Penco, señor Rodrigo Vera Riquelme. - Secretario Regional Ministerial de Minería de la Región del Biobío, señor Daniel Escobar Palma. - Vicedecana de la Facultad de Ingeniería de la Universidad Católica de la Santísima Concepción, señora Matilde Basso Aránguiz.",
      "invitados": "Autoridades sectoriales convocadas.",
      "tabla": [
        "Analizar la aprobación por parte de la Comisión de Evaluación Ambiental (CEA) del proyecto minero de tierras raras impulsado en la comuna de..."
      ],
      "boletinesRelacionados": [],
      "acuerdosCount": 0,
      "completada": false,
      "comisionSlug": "mineria"
    }
  ]
};

export const CAMARA_CITACIONES_FULL_WEEK: any[] = [
  {
    "id": "cit-semana-1",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Trabajo y Seguridad Social",
    "citacionNumero": "Citación Oficial N° 1",
    "hora": "10:00 a 12:00",
    "lugar": "Sala Multiuso 1er Piso primer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Continuar el estudio del proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de adaptabilidad de la jornada de trabajo y establece un régimen especial para el sector turismo y actividades conexas”, correspondiente al boletín N° 18.478-13, con urgencia calificada de “suma”. Para estos efectos, se ha invitado al señor Gustavo Rosenda Salazar, Subsecretario del Trabajo; a la señora María Paz Lagos Valdivieso, Subsecreraria deTurismo; al señor José Pakomio Torres, Presidente de la Cámara Nacional de Comercio (CNC); al señor Matías Rodríguez Burr, abogado laboralista y Presidente del Departamento de Derecho del Trabajo y Seguridad Social de la Universidad de Valparaíso; al señor David Bravo Urrutia, economista, académico, investigador y Director del Centro UC de Encuestas y Estudios Longitudinales; a la señora Susana Jiménez, Presidenta de la Confederación de la Producción y del Comercio (CPC); a la señora Patricia Silva Meléndez, abogada coordinadora del Programa Laboral del Instituto Igualdad y ex Directora del Trabajo, al señor Manuel Muñoz Lorca, abogado coordinador de la Asociación de Empresas de Seguridad Privada y de Transporte de Valores (ASEVA), y a la señora María Teresa Vial, Presidenta de la Cámara de Comercio de Santiago A.G.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Continuar el estudio del proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de ada..."
    ],
    "boletinesRelacionados": [
      "18.478-13"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "trabajo-y-prevision"
  },
  {
    "id": "cit-semana-2",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "CEI 9 Relativa a determinados actos del Gobierno en materia de seguridad pública y prevención del delito durante la gestión de la ex Ministra de Seguridad Pública",
    "citacionNumero": "Citación Oficial N° 2",
    "hora": "10:30 a 12:30",
    "lugar": "Sala de Lectura primer nivel (Presencial)",
    "tipo": "Comisión Especial Investigadora",
    "materia": "Con el objeto de abocarse al mandato de la Comisión. Para tales efectos, se recibirá a la exministra de Seguridad Pública, doña Trinidad Steinert Herrera; a la ex Subdirectora de Inteligencia, Crimen Organizado y Seguridad Migratoria de esa institución, Prefecta General (R) doña Consuelo Peña San Miguel; a la ex Subsecretaria de Prevención del Delito, doña Ana Victoria Quintana Olguín; al Coordinador de asesores del gabinete presidencial, don Alejandro Irarrázaval Alfonso, y al abogado penalista don Juan Pablo Mañalich Raffo.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Con el objeto de abocarse al mandato de la Comisión. Para tales efectos, se recibirá a la exministra de Seguridad Pública, doña Trinidad Ste..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false
  },
  {
    "id": "cit-semana-3",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "CEI 8 Concesión de autopistas y determinación de peaje y tag",
    "citacionNumero": "Citación Oficial N° 3",
    "hora": "13:30 a 15:00",
    "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
    "tipo": "Comisión Especial Investigadora",
    "materia": "Con el objeto de continuar su cometido y dar cumplimiento a lo encomendado en el mandato. Se ha invitado a: - Ex Ministro de Hacienda, señor Nicolás Grau Veloso. - Ex Directora de Presupuestos, señora Javiera Martínez Fariña. Se ha citado a: - Presidente Panel Técnico de Concesiones, señor Raúl Erazo Torricelli.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Con el objeto de continuar su cometido y dar cumplimiento a lo encomendado en el mandato. Se ha invitado a: - Ex Ministro de Hacienda, señor..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false
  },
  {
    "id": "cit-semana-4",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Seguridad Ciudadana",
    "citacionNumero": "Citación Oficial N° 4",
    "hora": "14:50 a 16:50",
    "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "De 14:50 a 15:50 horas: Continuar la votación en particular del proyecto de ley, originado en mensaje de S. E., el Presidente de la República que, “crea el registro de actos vandálicos e incivilidades”. Boletín N°18.341-25, con urgencia calificada de “suma”. En primer trámite constitucional y primero reglamentario. Para tales efectos se invitó al biministro del Interior y de la Secretaría General de Gobierno, señor Claudio Alvarado Andrade.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "De 14:50 a 15:50 horas: Continuar la votación en particular del proyecto de ley, originado en mensaje de S. E., el Presidente de la Repúblic..."
    ],
    "boletinesRelacionados": [
      "18.341-25"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "seguridad"
  },
  {
    "id": "cit-semana-5",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "la Familia",
    "citacionNumero": "Citación Oficial N° 5",
    "hora": "14:50 a 16:50",
    "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "continuar la discusión y votación particular del proyecto de ley, iniciado en mensaje de S. E. el Presidente de la República, que fortalece el ejercicio de la responsabilidad parental, boletín N°18378-18, en primer trámite constitucional y reglamentario, con urgencia calificada de \"suma\". NOTA: Se recuerda que el plazo para la formulación de INDICACIONES del proyecto de ley sobre RESPONSABILIDAD PARENTAL, boletín N° 18378-18 ES EL JUEVES 3 de SEPTIEMBRE DE 2026, a las 12:00 horas (mediodía). Se encuentra invitado el Ministro de Justicia y Derechos Humanos, señor Fernando Rabat, junto al Subsecretario, señor Luis Alejandro Silva para participar de la tramitación de dicha iniciativa legal, boletín N°18378-18.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "continuar la discusión y votación particular del proyecto de ley, iniciado en mensaje de S. E. el Presidente de la República, que fortalece ..."
    ],
    "boletinesRelacionados": [
      "18378-18"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "familias"
  },
  {
    "id": "cit-semana-6",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Zonas Extremas y Antártica Chilena",
    "citacionNumero": "Citación Oficial N° 6",
    "hora": "14:50 a 16:50",
    "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Recibir en audiencia al señor Roberto Levin Jiménez, Director Ejecutivo de la Fundación Acrux, a fin de que exponga la experiencia de dicha institución en la realización de operativos médicos en zonas extremas y territorios aislados, y dé a conocer propuestas y alternativas destinadas a contribuir a la reducción de las listas de espera y a mejorar el acceso a prestaciones de salud en dichos territorios, atendidos los antecedentes planteados por los alcaldes y alcaldesas durante el ciclo de audiencias desarrollado por la Comisión.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Recibir en audiencia al señor Roberto Levin Jiménez, Director Ejecutivo de la Fundación Acrux, a fin de que exponga la experiencia de dicha ..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "zonas-extremas"
  },
  {
    "id": "cit-semana-7",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Recursos Hídricos y Desertificación",
    "citacionNumero": "Citación Oficial N° 7",
    "hora": "14:50 a 16:50",
    "lugar": "Sala N° 410 cuarto nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Iniciar la discusión particular del proyecto de ley que modifica el Código de Aguas para garantizar la participación de comités y cooperativas de agua potable rural, prestadoras de servicios sanitarios rurales, en los directorios de las comunidades de agua, correspondiente a los boletines números 17.324-33 y 17.325-33, refundidos, en primer trámite constitucional y segundo reglamentario.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Iniciar la discusión particular del proyecto de ley que modifica el Código de Aguas para garantizar la participación de comités y cooperativ..."
    ],
    "boletinesRelacionados": [
      "17.324-33",
      "17.325-33"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "recursos-hidricos"
  },
  {
    "id": "cit-semana-8",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Cultura, Artes y Comunicaciones",
    "citacionNumero": "Citación Oficial N° 8",
    "hora": "14:50 a 16:50",
    "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Recibir en audiencia a la señora Amara Rivera, en representación de la Corporación Hijas e Hijos de Gabriela Mistral, con el objeto de que exponga acerca del destino de los derechos de autor de la obra de la poetisa y de la propuesta de destinarlos íntegramente a programas artísticos, educacionales y culturales dirigidos a los niños de Montegrande. Asimismo, para que se refiera a la posibilidad de impulsar una iniciativa legal que extienda la vigencia de dichos derechos cuando la voluntad expresa del autor o autora se funde en una finalidad social y de bien público. Se ha invitado a la señora Amara Rivera, en representación de la referida Corporación.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Recibir en audiencia a la señora Amara Rivera, en representación de la Corporación Hijas e Hijos de Gabriela Mistral, con el objeto de que e..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "cultura"
  },
  {
    "id": "cit-semana-9",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Desarrollo Social, Superación de la Pobreza y Planificación",
    "citacionNumero": "Citación Oficial N° 9",
    "hora": "14:50 a 16:50",
    "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "analizar, junto a las autoridades competentes, las conclusiones y propuestas contenidas en el Informe de la Mesa por la Niñez, elaborado por la Comisión de Familia, e identificar las materias vinculadas al ámbito de su competencia, así como eventuales iniciativas legislativas que puedan impulsarse a partir de dicho trabajo. Para tales efectos se encuentran invitados: - Subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. - Director del Servicio Nacional de Protección Especializada a la Niñez y Adolescencia (S), señor Gherman Welsch Chahuán.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "analizar, junto a las autoridades competentes, las conclusiones y propuestas contenidas en el Informe de la Mesa por la Niñez, elaborado por..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "desarrollo-social"
  },
  {
    "id": "cit-semana-10",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Control del Sistema de Inteligencia del Estado",
    "citacionNumero": "Citación Oficial N° 10",
    "hora": "15:30 a 16:50",
    "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Tratar materias propias de la competencia de la Comisión. Invitados: Director de la Agencia Nacional de Inteligencia, señor Ronald Mc Intyre Astorga. Fiscal Nacional del Ministerio Público, señor Ángel Valencia Vásquez.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Tratar materias propias de la competencia de la Comisión. Invitados: Director de la Agencia Nacional de Inteligencia, señor Ronald Mc Intyre..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "inteligencia-estado"
  },
  {
    "id": "cit-semana-11",
    "fecha": "LUNES, 7 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
    "citacionNumero": "Citación Oficial N° 11",
    "hora": "16:15 a 19:00",
    "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Sesión especial* citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. * Esta sesión reemplaza a la ordinaria, toda vez que la Comisión tiene una actividad oficial en Santiago con la ministra de Ciencia, Tecnología, Conocimiento e Innovación. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Sesión especial* citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urg..."
    ],
    "boletinesRelacionados": [
      "18224-18",
      "18246-18",
      "18318-19",
      "18415-18"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "ciencias"
  },
  {
    "id": "cit-semana-12",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "CEI 2 Sobre discrepancias en las cifras de producción de Codelco durante el año 2025",
    "citacionNumero": "Citación Oficial N° 12",
    "hora": "08:30 a 09:50",
    "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
    "tipo": "Comisión Especial Investigadora",
    "materia": "recibir en audiencia, en el marco de su mandato, al Economista y Director Académico del Diplomado en Finanzas, FEN, de la Universidad de Chile, señor Jorge Berríos Vogel.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "recibir en audiencia, en el marco de su mandato, al Economista y Director Académico del Diplomado en Finanzas, FEN, de la Universidad de Chi..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false
  },
  {
    "id": "cit-semana-13",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
    "citacionNumero": "Citación Oficial N° 13",
    "hora": "10:30 a 13:00",
    "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urge..."
    ],
    "boletinesRelacionados": [
      "18224-18",
      "18246-18",
      "18318-19",
      "18415-18"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "ciencias"
  },
  {
    "id": "cit-semana-14",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Ética y Transparencia",
    "citacionNumero": "Citación Oficial N° 14",
    "hora": "11:00 a 12:30",
    "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Con el objeto de tratar materias propias de su competencia.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Con el objeto de tratar materias propias de su competencia...."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "etica"
  },
  {
    "id": "cit-semana-15",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Constitución, Legislación, Justicia y Reglamento",
    "citacionNumero": "Citación Oficial N° 15",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Francisco Bulnes Sanfuentes tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Continuar la tramitación en particular del proyecto de ley, en primer trámite constitucional e iniciado en mensaje, que “Amplía las hipótesis de tráfico de migrantes y modifica los textos legales que indica”. Boletín N° 18.315-07 refundido con proyecto de ley N° 16.948-07. Discusión inmediata. Se ha invitado al señor Ministro de Justicia y Derechos Humanos, y a los expertos en derecho penal señora Diva Serra (U. de Concepción); señora Tania Gajardo (U. Católica de Chile); señor Juan Pablo Castillo (U. A. Hurtado); Antonio Bascuñán (U. Adolfo Ibáñez), sin perjuicio de los invitados que propongan los (as) integrantes de la Comisión.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Continuar la tramitación en particular del proyecto de ley, en primer trámite constitucional e iniciado en mensaje, que “Amplía las hipótesi..."
    ],
    "boletinesRelacionados": [
      "18.315-07",
      "16.948-07"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "constitucion"
  },
  {
    "id": "cit-semana-16",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Deportes y Recreación",
    "citacionNumero": "Citación Oficial N° 16",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Analizar casos de maltrato y discriminación que han sido puestos en conocimiento de la Defensoría del Deportista, por presuntas vulneraciones de derechos de deportistas, que no habrían obtenido una respuesta adecuada por parte de las instituciones correspondientes. Para tales efectos, se encuentran invitados el Director de la Defensoría del Deportista, señor Eduardo Arévalo Mateluna, y el Subsecretario de la Niñez, don Marcelo Sánchez Ahumada.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Analizar casos de maltrato y discriminación que han sido puestos en conocimiento de la Defensoría del Deportista, por presuntas vulneracione..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "deportes"
  },
  {
    "id": "cit-semana-17",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Agricultura, Silvicultura y Desarrollo Rural",
    "citacionNumero": "Citación Oficial N° 17",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "De 15:00 a 16:00 horas: Continuar con la discusión del proyecto de ley que “Modifica la Ley General de Urbanismo y Construcciones, y otros cuerpos legales, para regular el desarrollo de zonas residenciales en el medio rural”, Boletín N°17.006-01. Para este efecto se encuentran invitados: - El Ministro de Agricultura, don Jaime Campos. - El Ministro de Vivienda y Urbanismo, don Iván Poduje.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "De 15:00 a 16:00 horas: Continuar con la discusión del proyecto de ley que “Modifica la Ley General de Urbanismo y Construcciones, y otros c..."
    ],
    "boletinesRelacionados": [
      "17.006-01"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "agricultura"
  },
  {
    "id": "cit-semana-18",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Gobierno Interior, Nacionalidad, Ciudadanía y Regionalización",
    "citacionNumero": "Citación Oficial N° 18",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Proyecto de ley, de origen en moción, en primer trámite constitucional y reglamentario, que declara feriado nacional el 17 de septiembre de 2026 (Boletín N° 18.600-06). Respecto de este proyecto de ley, ha sido invitado el Biministro de Economía y Energía, señor Daniel Más Valdés.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Proyecto de ley, de origen en moción, en primer trámite constitucional y reglamentario, que declara feriado nacional el 17 de septiembre de ..."
    ],
    "boletinesRelacionados": [
      "18.600-06"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "gobierno-interior"
  },
  {
    "id": "cit-semana-19",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Educación",
    "citacionNumero": "Citación Oficial N° 19",
    "hora": "15:00 a 17:00",
    "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Sesión ordinaria citada con objeto de ocuparse de los siguientes asuntos:",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Sesión ordinaria citada con objeto de ocuparse de los siguientes asuntos:..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "educacion"
  },
  {
    "id": "cit-semana-20",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Relaciones Exteriores, Asuntos Interparlamentarios e Integración Latinoamericana",
    "citacionNumero": "Citación Oficial N° 20",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Recibir en audiencia al señor Gino Casassa Rogazinski, Director del Instituto Antártico Chileno (INACH), a fin de abordar los efectos del calentamiento global y sus causas en el territorio antártico nacional. - Director del Instituto Antártico Chileno (INACH), señor Gino Casassa Rogazinski.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Recibir en audiencia al señor Gino Casassa Rogazinski, Director del Instituto Antártico Chileno (INACH), a fin de abordar los efectos del ca..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "rree"
  },
  {
    "id": "cit-semana-21",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Personas Mayores y Discapacidad",
    "citacionNumero": "Citación Oficial N° 21",
    "hora": "17:30 a 19:30",
    "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Continuar el estudio, en general, de la iniciativa que \"Modifica la ley N°18.961, orgánica constitucional de Carabineros de Chile, en cuanto a los procedimientos de evaluación médica que fundamentan retiros de personal\". Boletín N° 18448-25. Para este objeto se ha invitado a General Director de Carabineros, Marcelo Araya Zapata; al director de Disalcar; al Jefe de la Dirección de Salud de Carabineros, y al Director de Dipreca.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Continuar el estudio, en general, de la iniciativa que \"Modifica la ley N°18.961, orgánica constitucional de Carabineros de Chile, en cuanto..."
    ],
    "boletinesRelacionados": [
      "18448-25"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "personas-mayores"
  },
  {
    "id": "cit-semana-22",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Salud",
    "citacionNumero": "Citación Oficial N° 22",
    "hora": "17:30 a 19:30",
    "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Recibir a los representantes de los trabajadores de la atención primaria de salud, a fin de que expongan sobre la situación presupuestaria de la atención primaria, el financiamiento per cápita y los efectos de los recortes en el funcionamiento de los servicios de salud, entre otras materias.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Recibir a los representantes de los trabajadores de la atención primaria de salud, a fin de que expongan sobre la situación presupuestaria d..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "salud"
  },
  {
    "id": "cit-semana-23",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Economía, Fomento; Micro, Pequeña y Mediana Empresa; Protección de los Consumidores y Turismo",
    "citacionNumero": "Citación Oficial N° 23",
    "hora": "17:30 a 19:30",
    "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "continuar la discusión y votación particular del proyecto de ley, originado en mensaje de S. E. el Presidente de la República, que modifica la ley N° 19.799, sobre documentos electrónicos, firma electrónica y servicios de certificación de dicha firma, y otros cuerpos legales relacionados, boletín N° 18286-03, con urgencia calificada de “simple”, en primer trámite constitucional y primero reglamentario. NOTA: Se recuerda que el plazo para la formulación de INDICACIONES a este l proyecto de ley es el VIERNES 4 DE SEPTIEMBRE DE 2026, a las 12:00 hrs (mediodía).. Se encuentra invitado a participar de la tramitación de esta iniciativa el Ministro de Economía, Fomento y Turismo, señor Daniel Mas; el Subsecretario de Economía, señor Karlfranz Koehler y un representante experto en la materia de dicho Ministerio.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "continuar la discusión y votación particular del proyecto de ley, originado en mensaje de S. E. el Presidente de la República, que modifica ..."
    ],
    "boletinesRelacionados": [
      "18286-03"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "economia"
  },
  {
    "id": "cit-semana-24",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Trabajo y Seguridad Social",
    "citacionNumero": "Citación Oficial N° 24",
    "hora": "17:30 a 19:30",
    "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Continuar el estudio y votar en general el proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los mecanismos de adaptabilidad de la jornada de trabajo y establece un régimen especial para el sector turismo y actividades conexas”, correspondiente al boletín N° 18.478-13, con urgencia calificada de “suma”. Para estos efectos, se escucharán, en primer lugar, las intervenciones pendientes de las diputadas señoras Ximena Ossandón y Gael Yeomans. Asimismo, se ha invitado al señor Gustavo Rosende Salazar, Subsecretario del Trabajo; a la señora María Paz Lagos Valdivieso, Subsecretaria de Turismo, al señor Claudio Sánchez Pino, Presidente de la Central de Trabajadores de Chile (CTCH); a la señora Bettina Horst von Thadden, Directora Ejecutiva de Libertad y Desarrollo (LyD); al señor Diego Ignacio Valerio Avalosa, Presidente de la Federación de Sindicatos de Casinos de Juego y Hoteles de Chile (FENASICAJH), y al señor Juan Manuel Mira Velasco, Presidente de Chilealimentos.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Continuar el estudio y votar en general el proyecto de ley, originado en mensaje de S.E. el Presidente de la República, que “Perfecciona los..."
    ],
    "boletinesRelacionados": [
      "18.478-13"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "trabajo-y-prevision"
  },
  {
    "id": "cit-semana-25",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Defensa Nacional",
    "citacionNumero": "Citación Oficial N° 25",
    "hora": "17:30 a 19:30",
    "lugar": "Sala N° 408 cuarto nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Continuar la discusión general del proyecto de ley que aumenta la pena aplicable al delito de ingreso no autorizado a recintos militares y policiales, y fortalece la protección de la seguridad pública, correspondiente a los boletines refundidos N°18.361-02 y 18.381-02.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Continuar la discusión general del proyecto de ley que aumenta la pena aplicable al delito de ingreso no autorizado a recintos militares y p..."
    ],
    "boletinesRelacionados": [
      "18.361-02",
      "18.381-02"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "defensa"
  },
  {
    "id": "cit-semana-26",
    "fecha": "MARTES, 8 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Obras Públicas, Transportes y Telecomunicaciones",
    "citacionNumero": "Citación Oficial N° 26",
    "hora": "17:30 a 19:30",
    "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Mensaje de S. E. el Presidente de la República, en primer trámite constitucional y con urgencia calificada de suma, por el cual da inicio a la tramitación del proyecto que \"modifica la Ley Orgánica de la Empresa de los Ferrocarriles del Estado, con el objeto de establecer una exención de derechos y tributos municipales por la ejecución de obras ferroviarias y declarar dichas obras como infraestructura ejecutada por el Estado\". BOLETÍN N°18.436-15. Se encuentra invitado el Biministro de Obras Públicas, Transportes y Telecomunicaciones, señor Louis De Grange Concha.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Mensaje de S. E. el Presidente de la República, en primer trámite constitucional y con urgencia calificada de suma, por el cual da inicio a ..."
    ],
    "boletinesRelacionados": [
      "18.436-15"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "obras-publicas"
  },
  {
    "id": "cit-semana-27",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "CEI 3 Control migratorio de NNA extranjeros en el marco de procedimientos de reunificación familiar",
    "citacionNumero": "Citación Oficial N° 27",
    "hora": "08:30 a 09:45",
    "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
    "tipo": "Comisión Especial Investigadora",
    "materia": "Recibir, en el marco del mandato de la comisión, al director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum, para que de respuesta a las consultas formuladas por los miembros de la comisión durante la sesión pasada, y al Defensor de la Niñez, señor Anuar Quesille. El director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum. El Defensor de la Niñez, señor Anuar Quesille.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Recibir, en el marco del mandato de la comisión, al director nacional del Servicio Nacional de Migraciones, señor Frank Sauerbaum, para que ..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "familias"
  },
  {
    "id": "cit-semana-28",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Futuro, Ciencias, Tecnología, Conocimiento e Innovación",
    "citacionNumero": "Citación Oficial N° 28",
    "hora": "10:30 a 13:00",
    "lugar": "Sala Arturo Longton Guerrero tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urgencia calificada de “suma”, originado en las siguientes mociones refundidas: 1) El que establece un marco integral de protección de niñas, niños y adolescentes en el uso de redes sociales (boletín N° 18224-18), de los diputados y diputadas Lorena Fries (A), Jaime Araya, Matías Fernández, Ana María Gazmuri, Andrea Macías, Luis Malla, Cristian Mella, José Montalva, Zandra Parisi y Gonzalo Winter. 2) El que protege a los menores de edad frente a la adicción a las nuevas tecnologías y prohíbe el acceso a redes sociales y otras plataformas (boletín N° 18246-18), de las diputadas y diputados Diego Schalper (A), Héctor Barría, Patricio Briones, Andrés Celis, Tomás Kast, Raúl Leiva, Paula Olmos, Ximena Ossandón, Macarena Santelices y Héctor Ulloa. 3) El que establece un estatuto de responsabilidad algorítmica y protección digital de niños, niñas y adolescentes (boletín N° 18318-19), de las diputadas y diputados Daniel Manouchehri (A), Patricio Briones, Andrés Celis, Carolina Cucumides, Cristóbal Martínez, José Montalva, Daniela Serrano, Consuelo Veloso, Gonzalo Winter y Gael Yeomans. 4) El que modifica la ley N° 21.663, marco de ciberseguridad, para incorporar los principios de protección a la infancia y adolescencia, restricción etaria e información preventiva en entornos digitales (boletín N° 18415-18), de los diputados y diputadas Sara Concha (A), Patricio Briones, Andrés Celis, Tomás Kast, José Montalva, Francesca Muñoz y Tamara Ramírez. En razón de lo anterior, la Comisión ha invitado a la ministra de Desarrollo Social y Familia, señora María Jesús Wulf Le May, y/o al subsecretario de la Niñez, señor Marcelo Sánchez Ahumada. • Ministra de Desarrollo Social y Familia, y/o • Subsecretario de la Niñez.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Sesión especial citada con objeto de continuar con la votación en particular del proyecto de ley, en primer trámite constitucional, con urge..."
    ],
    "boletinesRelacionados": [
      "18224-18",
      "18246-18",
      "18318-19",
      "18415-18"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "ciencias"
  },
  {
    "id": "cit-semana-29",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Revisora de Cuentas",
    "citacionNumero": "Citación Oficial N° 29",
    "hora": "10:30 a 11:30",
    "lugar": "Sala Pedro Pablo Álvarez-Salamanca tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Conocer los informes de auditoría externa elaborados por la empresa Xlibrium, así como aquellos del Comité de Auditoría Parlamentaria. Invitados: Pablo Oneto, Subsecretario Administrativo Patricio Leiva, Jefe de Finanzas Priscila Jara, Abogado Coordinadora del Comité de Auditoría Parlamentaria.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Conocer los informes de auditoría externa elaborados por la empresa Xlibrium, así como aquellos del Comité de Auditoría Parlamentaria. Invit..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "revisora-cuentas"
  },
  {
    "id": "cit-semana-30",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Vivienda, Desarrollo Urbano y Bienes Nacionales",
    "citacionNumero": "Citación Oficial N° 30",
    "hora": "15:00 a 17:00",
    "lugar": "Sala N° 410 cuarto nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Recibir a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capdeville y al Presidente de la Asociación Chilena de Municipalidades (ACHM), señor Gustavo Alessandri Bascuñán, o a quienes designen en su representación, para que se refieran a las modificaciones introducidas a la Ordenanza General de Urbanismo y Construcciones por el decreto supremo N° 68, de 2026, del Ministerio de Vivienda y Urbanismo, particularmente a sus efectos sobre los planes reguladores comunales y metropolitanos y la calidad de vida de las personas. Se ha invitado a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capdeville y al Presidente de la Asociación Chilena de Municipalidades (ACHM), señor Gustavo Alessandri Bascuñán, o a quienes designen en su representación.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Recibir a la Contralora General de la República, señora Dorothy Pérez Gutiérrez; al Ministro de Vivienda y Urbanismo, señor Iván Poduje Capd..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "vivienda"
  },
  {
    "id": "cit-semana-31",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Pesca, Acuicultura e Intereses Marítimos",
    "citacionNumero": "Citación Oficial N° 31",
    "hora": "15:00 a 17:00",
    "lugar": "Sala de Conferencias Inés Enríquez segundo nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Continuar la votación en particular del proyecto de ley originado en Moción, en primer trámite constitucional, copatrocinada por los diputados señores Alejandro Bernales, Roberto Celedón, Mauro González, Jorge Guzmán (A), Tomás Kast, Diego Schalper, Carolina Tello y Guillermo Valdés, sobre “Fortalecimiento de la Seguridad Marítima”, BOLETÍN 18.198-15. Se encuentran invitados el Subsecretario de Justicia, señor Luis Silva Irarrázabal; el Capitán de Navío Litoral (CN LT) de la Dirección General del Territorio Marítimo y de Marina Mercante y Jefe del Servicio de Inspecciones Marítimas, señor Roberto Alfaro Pérez; el Teniente 1, señor Gastón Salinas Valdés, Asesor jurídico de la Dirección de Seguridad y Operaciones Marítimas de la Armada de Chile, y la asesora jurídica del Ministerio de Defensa, señora Maricarmen Garrido I.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Continuar la votación en particular del proyecto de ley originado en Moción, en primer trámite constitucional, copatrocinada por los diputad..."
    ],
    "boletinesRelacionados": [
      "18.198-15"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "pesca"
  },
  {
    "id": "cit-semana-32",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Mujeres y Equidad de Género",
    "citacionNumero": "Citación Oficial N° 32",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Manuel Bustos Huerta tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Iniciar la discusión y votación en particular de los siguientes proyectos de ley, refundidos: 1) Moción de las diputadas Sara Concha Smith, Valentina Becerra Peña, Francesca Muñoz González, Paulina Muñoz Minte, Ximena Naranjo Pinto, Javiera Rodríguez Pascual, Marisela Santibáñez Novoa, Eileen Urqueta Rojas y Consuelo Veloso Ávila, y del diputado Eduardo Durán Salinas, que fortalece la protección de las víctimas de violencia intrafamiliar y previene su revictimización, correspondiente al boletín N°18236-18, en primer trámite constitucional y reglamentario, con urgencia calificada de “suma”. 2) Moción de las diputadas Valentina Becerra Peña, Paz Charpentier Rajcevich, Catalina Del Real Mihovilovic, Stephanie Jéldrez Ortiz, Claudia Mora Vega, Zandra Parisi Fernández, Claudia Reyes Larenas y Marisela Santibáñez Novoa, y de los diputados Felipe Camaño Cárdenas y Eduardo Durán Salinas, que modifica cuerpos legales que indica en materia de notificaciones de medidas cautelares dictadas en procesos de violencia intrafamiliar, correspondiente al boletín N°18414-18, en primer trámite constitucional y reglamentario.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Iniciar la discusión y votación en particular de los siguientes proyectos de ley, refundidos: 1) Moción de las diputadas Sara Concha Smith, ..."
    ],
    "boletinesRelacionados": [
      "18236-18",
      "18414-18"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "mujeres-genero"
  },
  {
    "id": "cit-semana-33",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Medio Ambiente y Recursos Naturales",
    "citacionNumero": "Citación Oficial N° 33",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Juan Lobos Krause tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Continuar la discusión y votación particular, en segundo trámite constitucional, del proyecto de ley que modifica diversos cuerpos legales, con el objeto de fortalecer la institucionalidad ambiental y mejorar su eficiencia, correspondiente al Boletín N° 16.552-12 (S). Urgencia simple.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Continuar la discusión y votación particular, en segundo trámite constitucional, del proyecto de ley que modifica diversos cuerpos legales, ..."
    ],
    "boletinesRelacionados": [
      "16.552-12"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "medio-ambiente"
  },
  {
    "id": "cit-semana-34",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Derechos Humanos y Pueblos Originarios",
    "citacionNumero": "Citación Oficial N° 34",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Ramón Pérez Opazo tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Recibir al subsecretario de Derechos Humanos, Pablo Mira Hurtado; y al subsecretario de la Niñez, Marcelo Sánchez Ahumada, para que informen acerca del funcionamiento y estado de avance de la Comisión de Verdad y Niñez, especialmente sobre las labores desarrolladas, las metas y plazos establecidos, las dificultades que ha enfrentado y sus proyecciones futuras. Asimismo, para que efectúen una exposición acabada que comprenda el pasado, presente y futuro de dicha Comisión.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Recibir al subsecretario de Derechos Humanos, Pablo Mira Hurtado; y al subsecretario de la Niñez, Marcelo Sánchez Ahumada, para que informen..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "derechos-humanos"
  },
  {
    "id": "cit-semana-35",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Constitución, Legislación, Justicia y Reglamento",
    "citacionNumero": "Citación Oficial N° 35",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Francisco Bulnes Sanfuentes tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Continuar con la tramitación en particular del proyecto de ley, iniciado en moción, que “Modifica el Código Penal para sancionar toda forma de instrumentalización de niños, niñas y adolescentes para cometer delitos''. Boletín N° 18.282-07. Se acordó refundirlo con el boletín N°18.590. Urgencia suma. Se ha invitado al señor Ministro de Justicia y Derechos Humanos; a los académicos señora María Elena Santibáñez (U. Católica de Chile); Alejandra Castillo Ara (U. Diego Portales); Francisco Maldonado Fuentes (U. de Talca); Alejandro Leiva López (U. Andrés Bello); Gonzalo Berríos Díaz (U. de Chile).",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Continuar con la tramitación en particular del proyecto de ley, iniciado en moción, que “Modifica el Código Penal para sancionar toda forma ..."
    ],
    "boletinesRelacionados": [
      "18.282-07"
    ],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "constitucion"
  },
  {
    "id": "cit-semana-36",
    "fecha": "MIÉRCOLES, 9 DE SEPTIEMBRE DE 2026",
    "comisionNombre": "Minería y Energía",
    "citacionNumero": "Citación Oficial N° 36",
    "hora": "15:00 a 17:00",
    "lugar": "Sala Octavio Jara Wolff tercer nivel (Presencial)",
    "tipo": "Sesión de Comisión",
    "materia": "Analizar la aprobación por parte de la Comisión de Evaluación Ambiental (CEA) del proyecto minero de tierras raras impulsado en la comuna de Penco por la empresa minera Aclara y el Grupo CAP, y sus eventuales implicancias para la comuna y la región. - Biministro de Economía, Fomento y Turismo y Minería, señor Daniel Mas Valdés. - Subsecretario de Minería, señor Álvaro González Gorroño. - Alcalde de Penco, señor Rodrigo Vera Riquelme. - Secretario Regional Ministerial de Minería de la Región del Biobío, señor Daniel Escobar Palma. - Vicedecana de la Facultad de Ingeniería de la Universidad Católica de la Santísima Concepción, señora Matilde Basso Aránguiz.",
    "invitados": "Autoridades sectoriales convocadas.",
    "tabla": [
      "Analizar la aprobación por parte de la Comisión de Evaluación Ambiental (CEA) del proyecto minero de tierras raras impulsado en la comuna de..."
    ],
    "boletinesRelacionados": [],
    "acuerdosCount": 0,
    "completada": false,
    "comisionSlug": "mineria"
  }
];

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
/**
 * Generates tailored priority bills for any commission based on its thematic area, chamber, and official weekly agendas.
 */
export function getProyectosForComision(meta: ComisionMeta): Proyecto[] {
  const isSenado = meta.chamber === "SR" || meta.prefix === "senado-";
  const camaraStr = isSenado ? "Senado" : "Diputados";
  const idLower = meta.id.toLowerCase();
  const nombreLower = meta.nombre.toLowerCase();

  const baseProyectos: Proyecto[] = [];

  // Helper to add project
  const addP = (p: {
    id: string;
    titulo: string;
    resumen: string;
    estado?: string;
    etapa?: string;
    fechaIngreso?: string;
    materia: string;
    autores?: string;
    iniciativa?: "Mensaje" | "Moción";
    patrocinantes?: number;
    urgencia?: "Discusión Inmediata" | "Suma" | "Simple" | "Sin urgencia";
    timeline?: any[];
  }) => {
    baseProyectos.push({
      id: p.id,
      titulo: p.titulo,
      resumen: p.resumen,
      estado: p.estado || "En discusión",
      etapa: p.etapa || "Primer Trámite Constitucional",
      fechaIngreso: p.fechaIngreso || "2024-03-15",
      materia: p.materia,
      autores: p.autores || (meta.integrantes && meta.integrantes[0] ? meta.integrantes[0].nombre : "Parlamentarios de la Comisión"),
      iniciativa: p.iniciativa || "Moción",
      patrocinantes: p.patrocinantes || 8,
      urgencia: p.urgencia || "Suma",
      camaraOrigen: camaraStr,
      comisionActual: meta.nombre,
      timeline: p.timeline || [
        { id: "act-1", fecha: "02 Sep 2026", titulo: "Discusión en particular de indicaciones", descripcion: "Debate técnico de enmiendas al articulado.", tipo: "sesion" }
      ],
      documentos: [],
      votaciones: []
    });
  };

  // 1. Gobierno Interior & Regionalización
  if (idLower.includes("gobierno") || nombreLower.includes("gobierno interior") || nombreLower.includes("descentralizacion")) {
    addP({
      id: "18.525-06",
      titulo: "Fortalece la institucionalidad municipal en materia de seguridad pública y prevención del delito.",
      resumen: "Otorga mayores facultades preventivas y equipamiento a inspectores municipales, coordinando su labor con Carabineros y delegaciones presidenciales.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Seguridad Municipal y Gobiernos Locales",
      urgencia: "Discusión Inmediata"
    });
    addP({
      id: "17.905-06",
      titulo: "Rehabilita la nacionalidad chilena por gracia a ciudadanos con arraigo y contribución probada.",
      resumen: "Tramitación de rehabilitación de nacionalidad en casos calificados de vinculación familiar y social con el país.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Nacionalidad y Ciudadanía",
      urgencia: "Simple"
    });
    addP({
      id: "17.511-06",
      titulo: "Regula los requisitos de reunificación familiar y sanciona los matrimonios fraudulentos migratorios.",
      resumen: "Establece causales de nulidad inmediata y persecución penal ante uniones concertadas exclusivamente para fines de residencia migratoria.",
      estado: "En estudio",
      etapa: "Primer Trámite Constitucional",
      materia: "Extranjería y Migraciones",
      urgencia: "Suma"
    });
  }
  // 2. Relaciones Exteriores
  else if (idLower.includes("rree") || nombreLower.includes("relaciones exteriores")) {
    addP({
      id: "17.400-10",
      titulo: "Aprueba el Acuerdo de Servicios Aéreos entre la República de Chile y el Sultanato de Omán suscrito en 2024.",
      resumen: "Apertura de frecuencias aeronáuticas, derechos de tráfico comercial y facilidades arancelarias mutuas para el transporte aéreo de carga y pasajeros.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Tratados y Acuerdos Internacionales",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
    addP({
      id: "18.301-10",
      titulo: "Aprueba el Convenio de Transporte Aéreo entre el Gobierno de Chile y el Gobierno de Costa Rica.",
      resumen: "Modernización del marco bilateral de aviación civil y conectividad turística y comercial en Centroamérica.",
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: "Convenios Bilaterales",
      iniciativa: "Mensaje",
      urgencia: "Simple"
    });
  }
  // 3. Constitución & Justicia
  else if (idLower.includes("constitucion") || nombreLower.includes("constitucion")) {
    addP({
      id: "18.314-07",
      titulo: "Reforma Constitucional en materia de detención para la ejecución de expulsiones administrativas de extranjeros.",
      resumen: "Amplía el plazo constitucional de detención preventiva de extranjeros sujetos a decreto de expulsión de 48 horas a un máximo de 5 días hábiles.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Derecho Constitucional",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
    addP({
      id: "18.315-07",
      titulo: "Amplía las hipótesis penales de tráfico ilícito de migrantes y endurece sus penas.",
      resumen: "Crea nuevas agravantes de organización criminal armada, explotación laboral y tráfico de menores en pasos no habilitados.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Código Penal",
      urgencia: "Suma"
    });
    addP({
      id: "16.621-07",
      titulo: "Reforma Constitucional sobre probidad, transparencia y modernización de la función pública.",
      resumen: "Consagra el principio de transparencia algorítmica y régimen estricto de inhabilidades públicas para altas autoridades.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Derecho Constitucional",
      urgencia: "Suma"
    });
  }
  // 4. Educación
  else if (idLower.includes("educacion") || nombreLower.includes("educacion")) {
    addP({
      id: "18.461-04",
      titulo: "Regula deberes y derechos de apoderados en el sistema educacional y convivencia escolar.",
      resumen: "Establece protocolos de resolución de conflictos, deber de respeto a docentes y sanciones frente a agresiones físicas o verbales en recintos educativos.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Convivencia Escolar",
      urgencia: "Suma"
    });
    addP({
      id: "18.551-04",
      titulo: "Modifica el Sistema de Educación Pública (Ley N° 21.040) para ajustar la instalación y traspaso de los SLEP.",
      resumen: "Fija nuevos plazos, auditorías financieras previas y garantías de continuidad pedagógica en la transferencia de colegios municipales a los Servicios Locales.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Educación Pública",
      iniciativa: "Mensaje",
      urgencia: "Discusión Inmediata"
    });
    addP({
      id: "14.309-04",
      titulo: "Regula el sistema de subvenciones para la modalidad educativa de reingreso escolar para jóvenes.",
      resumen: "Crea financiamiento preferente por alumno para escuelas de segunda oportunidad y reinserción educativa.",
      estado: "En sala",
      etapa: "Comisión Mixta",
      materia: "Subvenciones Escolares",
      urgencia: "Suma"
    });
  }
  // 5. Hacienda
  else if (idLower.includes("hacienda") || nombreLower.includes("hacienda")) {
    addP({
      id: "14.773-02",
      titulo: "Crea la Comisión de Comercio Estratégico y regula la exportación de material de uso dual y defensa.",
      resumen: "Establece régimen de fiscalización y trazabilidad a la transferencia de insumos tecnológicos, biológicos o industriales susceptibles de uso bélico.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Comercio Exterior y Defensa",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
    addP({
      id: "17.720-05",
      titulo: "Modifica la Ordenanza de Aduanas para tipificar y sancionar el contrabando agropecuario y de mercancías peligrosas.",
      resumen: "Agrava penas privativas de libertad e introduce comiso anticipado a organizaciones dedicadas al contrabando de alimentos por fronteras no habilitadas.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Tributaria y Aduanera",
      urgencia: "Suma"
    });
    addP({
      id: "16.621-05",
      titulo: "Ley de Cumplimiento de las Obligaciones Tributarias y modernización del Servicio de Impuestos Internos.",
      resumen: "Herramientas de fiscalización contra la informalidad, levantamiento judicializado del secreto bancario y delator tributario compensado.",
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: "Recaudación Fiscal",
      urgencia: "Discusión Inmediata"
    });
  }
  // 6. Defensa Nacional
  else if (idLower.includes("defensa") || nombreLower.includes("defensa")) {
    addP({
      id: "15.805-07",
      titulo: "Normas generales sobre el Uso de la Fuerza (RUF) para el personal de las FF.AA. y de Orden y Seguridad.",
      resumen: "Sistematiza principios de proporcionalidad, gradualidad, legítima defensa y eximentes de responsabilidad penal en misiones de resguardo constitucional.",
      estado: "En sala",
      etapa: "Comisión Mixta",
      materia: "Seguridad y Defensa",
      iniciativa: "Mensaje",
      urgencia: "Discusión Inmediata"
    });
    addP({
      id: "16.120-02",
      titulo: "Modernización del Sistema de Inteligencia del Estado y estatuto orgánico de la Agencia Nacional de Inteligencia.",
      resumen: "Reorganiza las direcciones de inteligencia de las FF.AA., controles judiciales de interceptación y resguardo de ciberinteligencia.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Inteligencia Estratégica",
      urgencia: "Suma"
    });
  }
  // 7. Obras Públicas, Transportes y Telecomunicaciones
  else if (idLower.includes("obras-publicas") || idLower.includes("transporte") || nombreLower.includes("obras") || nombreLower.includes("transportes")) {
    addP({
      id: "18.436-15",
      titulo: "Modifica la Ley Orgánica de EFE para eximir cobros municipales por obras de infraestructura ferroviaria estatal.",
      resumen: "Evita cobros por ocupación de bien nacional de uso público en la construcción de pasos bajo nivel, vías férreas y estaciones de trenes.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Infraestructura Ferroviaria",
      urgencia: "Simple"
    });
    addP({
      id: "16.346-15",
      titulo: "Derogación de cobros abusivos de peajes electrónicos y tag en autopistas públicas concesionadas.",
      resumen: "Elimina multas asociadas a pases diarios tardíos y fija techos de reajustabilidad tarifaria a las concesionarias viales.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Concesiones Viales",
      urgencia: "Suma"
    });
    addP({
      id: "16.853-15",
      titulo: "Obligación de test de alcohol y drogas aleatorios en terminales de buses para choferes de transporte interurbano.",
      resumen: "Protocolos sanitarios de control a conductores profesionales antes del inicio de recorridos nacionales.",
      estado: "En estudio",
      etapa: "Primer Trámite Constitucional",
      materia: "Seguridad Vial",
      urgencia: "Suma"
    });
  }
  // 8. Agricultura, Silvicultura y Desarrollo Rural
  else if (idLower.includes("agricultura") || nombreLower.includes("agricultura")) {
    addP({
      id: "17.006-01",
      titulo: "Regula el desarrollo de zonas residenciales en el medio rural y subdivisión de predios rústicos (parcelaciones).",
      resumen: "Establece criterios de conservación agroecológica, factibilidad hídrica y ordenamiento territorial para loteos habitacionales fuera del radio urbano.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Desarrollo Rural y Parcelaciones",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
    addP({
      id: "16.962-01",
      titulo: "Control de perros asilvestrados o ferales y protección a la ganadería y fauna silvestre nativa.",
      resumen: "Habilita medidas de captura y control poblacional de jaurías de perros asilvestrados que atacan ganado y especies protegidas.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Sanidad y Protección Ganadera",
      urgencia: "Suma"
    });
  }
  // 9. Medio Ambiente y Recursos Naturales
  else if (idLower.includes("medio-ambiente") || nombreLower.includes("medio ambiente")) {
    addP({
      id: "16.552-12",
      titulo: "Fortalece la institucionalidad ambiental y mejora la eficiencia en la tramitación del SEIA.",
      resumen: "Elimina el Comité de Ministros político y traslada las decisiones a paneles técnicos regionales, acortando plazos de resolución de permisos.",
      estado: "En discusión",
      etapa: "Segundo Trámite Constitucional",
      materia: "Evaluación de Impacto Ambiental",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
    addP({
      id: "16.553-12",
      titulo: "Fortalece y moderniza la fiscalización de la Superintendencia del Medio Ambiente (SMA).",
      resumen: "Aumenta las facultades sancionatorias y crea planes de cumplimiento acelerados para empresas infractoras de normas de emisión.",
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: "Fiscalización Ambiental",
      urgencia: "Simple"
    });
    addP({
      id: "16.335-14",
      titulo: "Ley marco de prevención y mitigación de incendios forestales y periurbanos.",
      resumen: "Obliga la creación de cortafuegos perimetrales y restringe plantaciones de monocultivos forestales colindantes a centros poblados.",
      estado: "En sala",
      etapa: "Comisión Mixta",
      materia: "Prevención de Desastres",
      urgencia: "Discusión Inmediata"
    });
  }
  // 10. Salud
  else if (idLower.includes("salud") || nombreLower.includes("salud")) {
    addP({
      id: "18.302-11",
      titulo: "Facilita el acceso a alimentos libres de gluten en establecimientos de comercio y garantiza su inocuidad alimentaria.",
      resumen: "Obliga a supermercados y locales de expendio a reservar góndolas de productos para personas con celiaquía con certificación libre de contaminación cruzada.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Salud Pública y Nutrición",
      urgencia: "Suma"
    });
    addP({
      id: "17.355-11",
      titulo: "Establece la prescripción médica obligatoria por medio de receta electrónica y sanciona su falsificación.",
      resumen: "Sistema nacional interoperable de recetas digitales para fármacos controlados con validación biométrica del profesional facultativo.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Regulación Farmacéutica",
      urgencia: "Simple"
    });
    addP({
      id: "16.708-11",
      titulo: "Incorpora acciones preventivas contra la infertilidad y cobertura en el Código Sanitario.",
      resumen: "Garantiza acceso preferente a estudios diagnósticos tempranos de fertilidad y preservación de gametos en Fonasa e Isapres.",
      estado: "En estudio",
      etapa: "Primer Trámite Constitucional",
      materia: "Salud Reproductiva",
      urgencia: "Suma"
    });
  }
  // 11. Trabajo y Previsión Social
  else if (idLower.includes("trabajo") || nombreLower.includes("trabajo")) {
    addP({
      id: "17.914-13",
      titulo: "Sanciona el uso fraudulento de licencias médicas como causal grave de falta de probidad y despido justificado.",
      resumen: "Inhabilita a médicos emisores masivos de licencias falsas y faculta la desvinculación inmediata sin indemnización del trabajador que haga mal uso.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Legislación Laboral",
      urgencia: "Discusión Inmediata"
    });
    addP({
      id: "18.478-13",
      titulo: "Regula la adaptabilidad de jornada laboral especial en el sector turismo, hotelería y gastronomía.",
      resumen: "Permite pactar turnos distribuidos en temporadas de alta demanda con descansos compensatorios continuos.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Jornada Laboral y Turismo",
      urgencia: "Suma"
    });
    addP({
      id: "16.621-13",
      titulo: "Modifica el Código del Trabajo regulando el teletrabajo para personas cuidadoras y conciliación familiar.",
      resumen: "Garantiza el derecho preferente a jornadas remotas para trabajadores a cargo de dependientes severos o menores de 12 años.",
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: "Conciliación Laboral",
      urgencia: "Suma"
    });
  }
  // 12. Minería y Energía
  else if (idLower.includes("mineria") || nombreLower.includes("mineria") || nombreLower.includes("energia")) {
    addP({
      id: "18.259-08",
      titulo: "Modifica el Código de Minería y leyes N° 21.420 y 21.649 en materia de amparo minero y fomento pirquinero.",
      resumen: "Readecúa el pago de patentes mineras para pequeños productores y acelera la liberación de concesiones no explotadas por grandes empresas.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Legislación Minera",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
    addP({
      id: "16.300-08",
      titulo: "Marco regulatorio de transición energética y almacenamiento en baterías a escala utility.",
      resumen: "Incentiva la inversión en líneas de transmisión y sistemas BESS para evitar el vertimiento de energía solar y eólica.",
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: "Energía y Electricidad",
      urgencia: "Discusión Inmediata"
    });
  }
  // 13. Economía, Fomento y Desarrollo
  else if (idLower.includes("economia") || nombreLower.includes("economia")) {
    addP({
      id: "18.476-03",
      titulo: "Prohíbe cobros improcedentes post fallecimiento en contratos de tracto sucesivo (servicios, telecomunicaciones, retail).",
      resumen: "Obliga a las empresas a extinguir de oficio las cuotas y planes mensuales de usuarios fallecidos desde la inscripción de defunción en el Registro Civil.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Protección al Consumidor",
      urgencia: "Suma"
    });
    addP({
      id: "18.512-03",
      titulo: "Dispone la leyenda obligatoria en avisos publicitarios creados o alterados sustancialmente por Inteligencia Artificial.",
      resumen: "Garantiza la transparencia al consumidor respecto a imágenes, voces y videos sintéticos generados algorítmicamente con fines comerciales.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Publicidad e Inteligencia Artificial",
      urgencia: "Simple"
    });
    addP({
      id: "14.767-03",
      titulo: "Modifica la Ley de Propiedad Intelectual regulando las medidas tecnológicas de protección digital.",
      resumen: "Protección a derechos de autor en el entorno digital e interoperabilidad de software de código abierto.",
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: "Propiedad Intelectual",
      urgencia: "Simple"
    });
  }
  // 14. Vivienda y Desarrollo Urbano
  else if (idLower.includes("vivienda") || nombreLower.includes("vivienda")) {
    addP({
      id: "18.444-14",
      titulo: "Obliga la instalación de detectores de humo y alarmas de incendio certificadas en toda vivienda nueva.",
      resumen: "Modifica la Ley General de Urbanismo y Construcciones para exigir sensores autónomos de detección temprana de fuego y monóxido de carbono.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Seguridad Habitacional",
      urgencia: "Suma"
    });
    addP({
      id: "18.309-14",
      titulo: "Exige la ejecución de obras de mitigación directa en proyectos inmobiliarios en el marco de la LGUC.",
      resumen: "Impide la recepción definitiva de obras si las empresas no ejecutan las mitigaciones viales y de transporte comprometidas en sus informes EISTU/IMIV.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Urbanismo y Mitigación Vial",
      urgencia: "Simple"
    });
  }
  // 15. Derechos Humanos y Pueblos Originarios
  else if (idLower.includes("derechos-humanos") || nombreLower.includes("derechos humanos")) {
    addP({
      id: "16.172-17",
      titulo: "Restringe las causales de reconocimiento y acreditación de la calidad de indígena ante CONADI.",
      resumen: "Exige trazabilidad genealógica fidedigna y arraigo comunitario para evitar fraudes en certificaciones y beneficios estatales indígenas.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Pueblos Originarios",
      urgencia: "Suma"
    });
    addP({
      id: "16.017-17",
      titulo: "Modifica la LOC del Congreso para regular la remisión periódica de informes sobre tratados de DD.HH.",
      resumen: "Obliga al Ejecutivo a enviar anualmente un balance del cumplimiento de sentencias y recomendaciones de la Corte Interamericana de DD.HH.",
      estado: "En discusión",
      etapa: "Segundo Trámite Constitucional",
      materia: "Tratados Internacionales",
      urgencia: "Simple"
    });
  }
  // 16. Futuro, Ciencias, Tecnología e Innovación
  else if (idLower.includes("ciencias") || idLower.includes("futuro") || nombreLower.includes("ciencia") || nombreLower.includes("futuro")) {
    addP({
      id: "18.224-18",
      titulo: "Marco integral de protección de niñas, niños y adolescentes en el uso de plataformas y redes sociales.",
      resumen: "Establece control parental estricto, verificación de edad por terceros certificados y prohibición de algoritmos de enganche dopaminérgico en menores.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Protección Digital Infantil",
      urgencia: "Suma"
    });
    addP({
      id: "18.246-18",
      titulo: "Protege a menores de edad frente a la adicción a nuevas tecnologías y restringe acceso a redes sociales.",
      resumen: "Prohíbe la creación de cuentas en redes sociales a menores de 14 años sin autorización notarial o biométrica de los padres o tutores legales.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Salud Mental y Redes Sociales",
      urgencia: "Suma"
    });
    addP({
      id: "18.318-19",
      titulo: "Estatuto de responsabilidad algorítmica y protección de datos digitales en sistemas de IA generativa.",
      resumen: "Auditorías de sesgo algorítmico, deber de explicabilidad técnica y resguardo de la privacidad infantil en modelos de machine learning.",
      estado: "En estudio",
      etapa: "Primer Trámite Constitucional",
      materia: "Inteligencia Artificial y Ética",
      urgencia: "Suma"
    });
  }
  // 17. Pesca y Acuicultura
  else if (idLower.includes("pesca") || nombreLower.includes("pesca")) {
    addP({
      id: "18.198-15",
      titulo: "Fortalece la Seguridad Marítima nacional y moderniza las facultades de fiscalización de DIRECTEMAR.",
      resumen: "Mayor equipamiento de vigilancia costera, persecución del crimen organizado marítimo, robo de salmones y pesca ilegal internacional.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Seguridad Marítima y Puertos",
      urgencia: "Suma"
    });
    addP({
      id: "18.173-21",
      titulo: "Excepción de prohibición de artes y aparejos de pesca para la extracción sustentable del recurso jibia.",
      resumen: "Permite cuotas artesanales reguladas bajo estricto control de descarte y selectividad pesquera.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Pesca Artesanal",
      urgencia: "Simple"
    });
  }
  // 18. Deportes y Recreación
  else if (idLower.includes("deportes") || nombreLower.includes("deportes")) {
    addP({
      id: "18.205-29",
      titulo: "Reconoce al fútbol amateur como actividad de interés público y regula estándares de seguridad y fomento.",
      resumen: "Asignación prioritaria de fondos FNDR para infraestructura de canchas de barrio, iluminación y botiquines de reanimación cardiopulmonar obligatorios.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Fomento Deportivo Amateur",
      urgencia: "Simple"
    });
    addP({
      id: "17.981-35",
      titulo: "Precisa el alcance del concepto de discapacidad en la Ley del Deporte y fomenta ligas paralímpicas.",
      resumen: "Equiparación de premios, becas PRODAR y facilidades laborales para deportistas de alto rendimiento adaptado.",
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: "Deporte Paralímpico e Inclusión",
      urgencia: "Suma"
    });
  }
  // 19. Seguridad Ciudadana / Seguridad Pública
  else if (idLower.includes("seguridad") || nombreLower.includes("seguridad")) {
    addP({
      id: "15.431-11",
      titulo: "Ley Marco de Ciberseguridad e Infraestructura Crítica de la Información. Crea la Agencia Nacional de Ciberseguridad.",
      resumen: "Marco normativo nacional para operadores de servicios esenciales frente a incidentes informáticos y rescate de datos.",
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: "Ciberseguridad Nacional",
      iniciativa: "Mensaje",
      urgencia: "Discusión Inmediata"
    });
    addP({
      id: "16.120-25",
      titulo: "Crea el Ministerio de Seguridad Pública y moderniza la gestión policial en el territorio nacional.",
      resumen: "Separa la coordinación política de Interior de la gestión táctica, tecnológica y financiera de las policías.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Institucionalidad de Seguridad",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
    addP({
      id: "18.208-25",
      titulo: "Reforma al Código Procesal Penal para regular la continuidad del juicio oral ante incomparecencia injustificada.",
      resumen: "Evita la prescripción o dilación maliciosa de juicios por crimen organizado cuando imputados o defensas no asisten a audiencias fijadas.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Proceso Penal",
      urgencia: "Discusión Inmediata"
    });
  }
  // 20. Mujeres y Equidad de Género
  else if (idLower.includes("mujeres") || idLower.includes("mujer") || nombreLower.includes("mujeres") || nombreLower.includes("mujer") || nombreLower.includes("genero")) {
    addP({
      id: "18.236-18",
      titulo: "Fortalece la protección a víctimas de violencia intrafamiliar y agiliza notificación electrónica de medidas cautelares.",
      resumen: "Notificación telemática inmediata de órdenes de alejamiento a agresores y conexión directa de botones de pánico a comisarías de Carabineros.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Violencia Intrafamiliar",
      urgencia: "Suma"
    });
    addP({
      id: "18.414-18",
      titulo: "Previene la revictimización de mujeres en declaraciones judiciales por delitos de violencia de género.",
      resumen: "Salas especiales con circuito cerrado de televisión y declaración única videograbada en juzgados de garantía y familia.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Protección Judicial Femenina",
      urgencia: "Simple"
    });
  }
  // 21. Bomberos y Emergencias
  else if (idLower.includes("bomberos") || idLower.includes("emergencia") || nombreLower.includes("bomberos") || nombreLower.includes("emergencias")) {
    addP({
      id: "18.294-15",
      titulo: "Exime del pago de peajes y tags en autopistas concesionadas a vehículos de los Cuerpos de Bomberos.",
      resumen: "Paso liberado permanente a carros bomba, escalas mecánicas y unidades de rescate en autopistas urbanas y carreteras interurbanas.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Tránsito y Emergencias",
      urgencia: "Discusión Inmediata"
    });
  }
  // 22. Recursos Hídricos y Sequía
  else if (idLower.includes("hidricos") || idLower.includes("agua") || nombreLower.includes("recursos hidricos") || nombreLower.includes("agua")) {
    addP({
      id: "17.877-33",
      titulo: "Fortalece el régimen de fiscalización y subsidios de los Servicios Sanitarios Rurales (APR).",
      resumen: "Financiamiento del Estado para obras de recambio de matrices, pozos profundos y subsidio al consumo de agua potable en sectores campesinos.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Servicios Sanitarios Rurales",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
  }
  // 23. Personas Mayores y Discapacidad
  else if (idLower.includes("personas-mayores") || idLower.includes("adulto-mayor") || nombreLower.includes("personas mayores") || nombreLower.includes("adulto mayor") || nombreLower.includes("discapacidad")) {
    addP({
      id: "18.491-03",
      titulo: "Obliga a prestadores de servicios turísticos a contar con infraestructura de asistencia y seguridad para adultos mayores.",
      resumen: "Rampas normalizadas, barandas en senderos y protocolos de evacuación preferente para la tercera edad en hoteles y balnearios.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Accesibilidad Universal",
      urgencia: "Simple"
    });
    addP({
      id: "17.979-35",
      titulo: "Fortalece la participación de la sociedad civil y cuidadores en la Ley TEA (Ley N° 21.545).",
      resumen: "Mesa consultiva vinculante ante el Ministerio de Salud y Mineduc para fiscalizar el cumplimiento de apoyos a personas en el espectro autista.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Inclusión y Neurodivergencia",
      urgencia: "Suma"
    });
  }
  // 24. Familia, Infancia y Adolescencia
  else if (idLower.includes("familia") || idLower.includes("infancia") || nombreLower.includes("familia") || nombreLower.includes("infancia")) {
    addP({
      id: "18.239-36",
      titulo: "Establece sanciones en el caso de acusaciones, denuncias o querellas falsas en juicios de familia.",
      resumen: "Sanciones pecuniarias y responsabilidad penal ante denuncias infundadas de vulneración de derechos que obstaculicen el régimen de visitas.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Tribunales de Familia",
      urgencia: "Discusión Inmediata"
    });
    addP({
      id: "18.401-31",
      titulo: "Entrega un bono extraordinario de apoyo a la niñez vulnerable y cuidadores de menores dependientes.",
      resumen: "Aporte económico directo no tributable para familias del 40% más vulnerable según el Registro Social de Hogares.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Beneficios Sociales y Niñez",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
  }
  // 25. Cultura, Artes y Comunicaciones
  else if (idLower.includes("cultura") || nombreLower.includes("cultura") || nombreLower.includes("artes")) {
    addP({
      id: "17.200-24",
      titulo: "Ley de Fomento a la Música Chilena, Artes Escénicas y Estatuto del Trabajador Cultural.",
      resumen: "Acceso a seguridad social, fondos concursables de asignación directa y cuotas de emisión en medios audiovisuales para artistas nacionales.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Fomento Cultural y Artístico",
      urgencia: "Simple"
    });
  }
  // 26. Desarrollo Social y Superación de la Pobreza
  else if (idLower.includes("desarrollo-social") || nombreLower.includes("desarrollo social") || nombreLower.includes("pobreza")) {
    addP({
      id: "18.255-31",
      titulo: "Establece un beneficio de compensación por la compra de pañales y medicamentos para personas dependientes.",
      resumen: "Subsidio mensual para cuidadores de personas en situación de postración o dependencia severa inscritas en el Registro Nacional de Cuidadores.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Políticas de Cuidados y Asistencia",
      urgencia: "Discusión Inmediata"
    });
  }
  // 27. Zonas Extremas y Territorios Especiales
  else if (idLower.includes("zonas-extremas") || nombreLower.includes("zonas extremas") || nombreLower.includes("territorios especiales")) {
    addP({
      id: "16.800-28",
      titulo: "Estatuto especial de incentivos tributarios y bonificación a la inversión en zonas extremas e insulares.",
      resumen: "Prorroga y perfecciona las leyes de excepción de Arica y Parinacota, Tarapacá, Aysén, Magallanes, Rapa Nui y Juan Fernández.",
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: "Fomento a Zonas Extremas",
      iniciativa: "Mensaje",
      urgencia: "Suma"
    });
  }
  // Default genérico robusto si no calza en ninguno de los anteriores
  else {
    const mainTema = (meta.temas && meta.temas[0]) || meta.nombre.replace(/^Comisión (Especial|Permanente)?s*(des*)?/i, "");
    const secTema = (meta.temas && meta.temas[1]) || "Normativa Sectorial";
    const thirdTema = (meta.temas && meta.temas[2]) || "Fiscalización";

    addP({
      id: "16.710-00",
      titulo: `Ley Marco de modernización, probidad y fomento regulatorio en materias de ${mainTema}.`,
      resumen: `Establece nuevos estándares de eficiencia técnica, sustentabilidad y transparencia en los ámbitos de competencia de la ${meta.nombre}.`,
      estado: "En discusión",
      etapa: "Primer Trámite Constitucional",
      materia: mainTema,
      urgencia: "Suma"
    });
    addP({
      id: "16.430-00",
      titulo: `Perfecciona los mecanismos de fiscalización y régimen sancionatorio en el sector de ${secTema}.`,
      resumen: `Otorga mayores facultades a los organismos reguladores para supervisar el estricto cumplimiento de la normativa vigente.`,
      estado: "En sala",
      etapa: "Segundo Trámite Constitucional",
      materia: secTema,
      iniciativa: "Mensaje",
      urgencia: "Discusión Inmediata"
    });
    addP({
      id: "15.920-00",
      titulo: `Promueve la innovación y agilización de trámites sectoriales en ${thirdTema}.`,
      resumen: `Ventanillas únicas digitales y plazos máximos para resoluciones administrativas en materias afines a la comisión.`,
      estado: "En estudio",
      etapa: "Primer Trámite Constitucional",
      materia: thirdTema,
      urgencia: "Simple"
    });
  }

  return baseProyectos;
}


export function generateFullComisionData(meta: ComisionMeta): Comision {
  const isSenado = meta.chamber === "SR" || meta.prefix === "senado-";
  const periodoStr = isSenado ? "Senado de la República (2022 - 2030)" : "56º Período Legislativo (2022 - 2026)";

  const sampleDate1 = "02 de septiembre de 2026";
  const sampleDate2 = "26 de agosto de 2026";
  const sampleDate3 = "19 de agosto de 2026";

  const proyectosLista = getProyectosForComision(meta);

  // All official sessions & citaciones of the entire week for this commission
  const weekCitaciones = !isSenado && CAMARA_CITACIONES_POR_COMISION[meta.id] 
    ? CAMARA_CITACIONES_POR_COMISION[meta.id] 
    : [];

  const proximaReal = weekCitaciones.length > 0 ? weekCitaciones[0] : null;

  return {
    id: `${meta.prefix}${meta.id}`,
    nombre: meta.nombre,
    descripcion: meta.descripcion,
    periodo: periodoStr,
    officialUrl: isSenado 
      ? `https://www.senado.cl/comisiones/${meta.id}`
      : `https://www.camara.cl/legislacion/comisiones/integrantes.aspx?prmID=${meta.prmID || meta.id}`,
    citacionesUrl: isSenado
      ? "https://www.senado.cl/actividad-legislativa/citaciones-a-comisiones"
      : "https://www.camara.cl/legislacion/comisiones/citaciones_semana.aspx",
    sesionesRealizadas: 48,
    proyectosContados: proyectosLista.length,
    audienciasSostenidas: 34,
    documentosContados: 76,
    alertasActivas: 2,
    prmID: meta.prmID,
    telefono: meta.telefono,
    email: meta.email,
    staff: meta.staff,
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
    proximaSesion: proximaReal ? {
      id: proximaReal.id || "ses-prox-real",
      fecha: proximaReal.fecha,
      hora: proximaReal.hora,
      lugar: proximaReal.lugar,
      modalidad: "Presencial",
      citacionNumero: proximaReal.citacionNumero,
      tipo: proximaReal.tipo,
      materia: proximaReal.materia,
      invitados: proximaReal.invitados,
      acuerdosCount: 0,
      tabla: proximaReal.tabla && proximaReal.tabla.length > 0 ? proximaReal.tabla : [proximaReal.materia]
    } : {
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
      // 1. Convocatorias oficiales de toda la semana
      ...weekCitaciones.map((rc, idx) => ({
        id: `ses-semana-${idx + 1}`,
        fecha: rc.fecha,
        hora: rc.hora,
        lugar: rc.lugar,
        tipo: rc.tipo || "Sesión de Comisión",
        materia: rc.materia,
        invitados: rc.invitados,
        citacionNumero: rc.citacionNumero,
        acuerdosCount: 0,
        completada: false,
        tabla: rc.tabla
      })),
      // 2. Sesiones concluidas anteriores
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
