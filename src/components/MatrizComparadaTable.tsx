/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Copy, Printer, Check, Globe, Filter, Scale, CheckCircle2 } from "lucide-react";

export interface MatrizColumna {
  key: string;
  nombre: string;
  bandera?: string;
  normativaReferencia?: string;
  isChile?: boolean;
}

export interface MatrizFilaDinamica {
  dimension: string;
  icono?: string;
  valores: Record<string, string>;
  lecturaJuridica: string;
  isWarmRow?: boolean;
}

export interface MatrizComparadaData {
  id?: string;
  titulo: string;
  subtitulo: string;
  boletinReferencia?: string;
  columnas: MatrizColumna[];
  filas: MatrizFilaDinamica[];
}

// 1. MATRIZ: REGULACIÓN DE INTELIGENCIA ARTIFICIAL (IA)
export const MATRIZ_IA_DATOS: MatrizComparadaData = {
  id: "ia-datos",
  titulo: "Matriz Comparada de Regulación de Inteligencia Artificial",
  subtitulo: "Unión Europea, España, Estados Unidos, Reino Unido y Chile",
  boletinReferencia: "Boletín 15.869-19 (Senado de Chile)",
  columnas: [
    { key: "ue", nombre: "Unión Europea", bandera: "🇪🇺", normativaReferencia: "AI Act (Reg. UE 2024/1689)" },
    { key: "espana", nombre: "España", bandera: "🇪🇸", normativaReferencia: "AESIA & LOPDGDD" },
    { key: "eeuu", nombre: "Estados Unidos", bandera: "🇺🇸", normativaReferencia: "NIST AI RMF & EO 14110" },
    { key: "uk", nombre: "Reino Unido", bandera: "🇬🇧", normativaReferencia: "Pro-Innovation Framework" },
    { key: "chile", nombre: "Chile", bandera: "🇨🇱", normativaReferencia: "Boletín 15.869-19", isChile: true }
  ],
  filas: [
    {
      dimension: "1. Enfoque general y clasificación",
      icono: "🎯",
      valores: {
        ue: "Pirámide estricta de 4 niveles de riesgo (Inaceptable, Alto, Limitado, Mínimo). Prohibición de manipulación cognitiva y vigilancia biométrica masiva.",
        espana: "Gobernanza anticipada mediante creación de la AESIA y entorno de pruebas controlado (Sandbox regulatorio oficial).",
        eeuu: "Marco voluntario basado en estándares técnicos NIST, directrices federales y órdenes ejecutivas sin ley federal omnicomprensiva.",
        uk: "Enfoque pro-innovación descentralizado a través de reguladores sectoriales existentes (Ofcom, FCA, CMA, ICO).",
        chile: "Proyecto de ley basado en el modelo de riesgo europeo, clasificando sistemas de IA según potencial de vulneración de derechos."
      },
      lecturaJuridica: "La tendencia comparada converge hacia la regulación ex-ante basada en niveles de riesgo objetivo con salvaguardas previas a la comercialización."
    },
    {
      dimension: "2. Ámbito subjetivo y sujetos obligados",
      icono: "👥",
      valores: {
        ue: "Proveedores, desplegadores, importadores y distribuidores de IA dentro o fuera de la UE con impacto en ciudadanos europeos.",
        espana: "Entidades públicas y privadas que desarrollen, comercialicen o utilicen sistemas de IA de alto impacto en territorio español.",
        eeuu: "Desarrolladores de modelos fundacionales que superen umbrales de capacidad de cómputo (10^26 FLOPs) y contratistas federales.",
        uk: "Operadores y empresas reguladas bajo la supervisión de agencias sectoriales en telecomunicaciones, finanzas y salud.",
        chile: "Personas naturales y jurídicas que desarrollen, comercialicen, distribuyan o utilicen sistemas de IA en el territorio nacional."
      },
      lecturaJuridica: "El alcance extraterritorial es indispensable para regular modelos globales y proveedores tecnológicos transfronterizos."
    },
    {
      dimension: "3. Obligaciones y transparencia algorítmica",
      icono: "⚙️",
      valores: {
        ue: "Auditorías técnicas independientes, gestión de datos de entrenamiento, marcado obligatorio de deepfakes y derecho a explicabilidad.",
        espana: "Registro público de algoritmos del sector público, evaluaciones de impacto algorítmico y trazabilidad de sesgos.",
        eeuu: "Notificación de resultados de pruebas de seguridad (red-teaming) y directrices de autenticación de contenido sintético.",
        uk: "Principios de transparencia, explicabilidad, seguridad y rendición de cuentas aplicados caso a caso por cada superintendencia.",
        chile: "Deber de información previa al usuario, registro nacional de sistemas de IA de alto riesgo y prohibición de sesgos discriminatorios."
      },
      lecturaJuridica: "La explicabilidad y la auditoría técnica son los pilares fundamentales para evitar la indefensión ciudadana ante decisiones automatizadas."
    },
    {
      dimension: "4. Órgano fiscalizador y gobernanza",
      icono: "🛡️",
      valores: {
        ue: "Oficina Europea de IA (AI Office) y autoridades nacionales de supervisión designadas por cada Estado miembro.",
        espana: "Agencia Española de Supervisión de Inteligencia Artificial (AESIA) adscrita al Ministerio de Transformación Digital.",
        eeuu: "NIST (estándares), Federal Trade Commission (FTC) y agencias sectoriales concurrentes.",
        uk: "Central AI Risk Function coordinada por el Department for Science, Innovation and Technology (DSIT).",
        chile: "Agencia de Protección de Datos Personales en coordinación técnica con el Ministerio de Ciencia y Tecnología."
      },
      lecturaJuridica: "La eficacia del control algorítmico depende de la autonomía presupuestaria y la alta especialización técnica del ente fiscalizador."
    },
    {
      dimension: "5. Régimen sancionatorio y responsabilidades",
      icono: "⚖️",
      valores: {
        ue: "Multas de hasta 35 millones de euros o el 7% de la facturación global anual para infracciones sobre prácticas prohibidas.",
        espana: "Régimen sancionatorio gradual con multas de hasta 30M€ o 6% del volumen de negocio, más responsabilidad civil por daños.",
        eeuu: "Acciones administrativas por prácticas engañosas e inyunciones de la FTC, más litigios de responsabilidad civil ante tribunales.",
        uk: "Sanciones administrativas según los poderes de cada regulador sectorial (multas, revocación de licencias operativas).",
        chile: "Multas disuasorias escalonadas de hasta 20.000 UTM y suspensión temporal de operación para modelos no conformes."
      },
      lecturaJuridica: "Las sanciones pecuniarias deben calcularse sobre la facturación global de las tecnológicas para tener un efecto verdaderamente disuasorio."
    },
    {
      dimension: "6. Lectura temporal y gradualidad",
      icono: "⏳",
      valores: {
        ue: "Entrada en vigor escalonada: 6 meses para prohibiciones, 12 meses para modelos de propósito general y 24-36 meses para alto riesgo.",
        espana: "AESIA operativa desde 2023 con guía de compliance y sandbox experimental previo a la plena aplicación europea.",
        eeuu: "Implementación continua mediante directrices federales y comités de seguridad de IA.",
        uk: "Monitoreo periódico por comités parlamentarios y actualización anual de directrices sectoriales.",
        chile: "Período de vacancia legal y marcha blanca de 12 a 24 meses para adaptación del ecosistema local de innovación."
      },
      lecturaJuridica: "Los períodos de transición y los entornos de pruebas controlados (sandboxes) son indispensables para no asfixiar a las PyMEs y startups locales."
    },
    {
      dimension: "7. Lecciones y recomendaciones para Chile",
      icono: "🇨🇱",
      valores: {
        ue: "Adoptar el principio de enfoque de riesgo y las categorías de sistemas inaceptables.",
        espana: "Replicar el modelo de areneras regulatorias (sandboxes) para orientar a desarrolladores antes de sancionar.",
        eeuu: "Incorporar estándares técnicos del NIST como normas de referencia voluntaria.",
        uk: "Aprovechar competencias de reguladores existentes (CMF, Subtel, ISP) para evitar duplicidades.",
        chile: "Consagrar un marco armónico entre la Ley de Protección de Datos Personales, la Ley Marco de Ciberseguridad y la futura Ley de IA."
      },
      lecturaJuridica: "La legislación chilena debe equilibrar la debida protección de derechos fundamentales con la competitividad del ecosistema científico-tecnológico nacional.",
      isWarmRow: true
    }
  ]
};

// 2. MATRIZ: ACCESO A LA INFORMACIÓN PÚBLICA Y TRANSPARENCIA
export const MATRIZ_ACCESO_INFORMACION: MatrizComparadaData = {
  id: "acceso-info",
  titulo: "Matriz Comparada de Acceso a la Información Pública",
  subtitulo: "España, Reino Unido, Canadá, Unión Europea y Chile",
  boletinReferencia: "Ley 20.285 (Chile)",
  columnas: [
    { key: "espana", nombre: "España", bandera: "🇪🇸", normativaReferencia: "Ley 19/2013 de Transparencia" },
    { key: "reinoUnido", nombre: "Reino Unido", bandera: "🇬🇧", normativaReferencia: "Freedom of Information Act (FOIA 2000)" },
    { key: "canada", nombre: "Canadá", bandera: "🇨🇦", normativaReferencia: "Access to Information Act 1983" },
    { key: "ue", nombre: "Unión Europea", bandera: "🇪🇺", normativaReferencia: "Reglamento (CE) 1049/2001" },
    { key: "chile", nombre: "Chile", bandera: "🇨🇱", normativaReferencia: "Ley 20.285 sobre Acceso a la Información", isChile: true }
  ],
  filas: [
    {
      dimension: "1. Titularidad y legitimación activa",
      icono: "🎯",
      valores: {
        espana: "Toda persona física o jurídica sin necesidad de motivar la solicitud.",
        reinoUnido: "Cualquier persona natural o jurídica independientemente de su nacionalidad o residencia.",
        canada: "Ciudadanos canadienses y residentes permanentes, ampliado por ordenanza a toda persona.",
        ue: "Cualquier ciudadano de la Unión y cualquier persona física o jurídica que resida en un Estado miembro.",
        chile: "Toda persona, sin necesidad de acreditar interés directo ni patrocinio de abogado."
      },
      lecturaJuridica: "El estándar internacional consagra el principio de no discriminación y gratuidad en la titularidad del derecho de acceso."
    },
    {
      dimension: "2. Plazos de respuesta y silencio administrativo",
      icono: "⏳",
      valores: {
        espana: "1 mes prorrogable por 1 mes adicional; silencio administrativo con efectos desestimatorios.",
        reinoUnido: "20 días hábiles; deber formal de confirmar o negar posesión con fundamentación legal.",
        canada: "30 días corridos; prórrogas autorizadas bajo causales de volumen o consultas interministeriales.",
        ue: "15 días laborables, prorrogables por otros 15 días con notificación motivada.",
        chile: "20 días hábiles, prorrogables por 10 días; amparo por denegación expresa o silencio ante el CPLT."
      },
      lecturaJuridica: "La eficacia del plazo depende de la existencia de unidades de transparencia y sistemas integrados de gestión documental."
    },
    {
      dimension: "3. Causales de reserva y prueba de daño",
      icono: "🛡️",
      valores: {
        espana: "Límites del art. 14 tasados con test de proporcionalidad y ponderación de interés público.",
        reinoUnido: "Excepciones absolutas y cualificadas sujetas a 'Public Interest Test'.",
        canada: "Excepciones específicas sujetas a revisión externa por el Comisionado de Información.",
        ue: "Excepciones obligatorias y facultativas con control de proporcionalidad del TJUE.",
        chile: "Art. 21 de quórum calificado: seguridad de la nación, derechos de terceros y debido cumplimiento de funciones."
      },
      lecturaJuridica: "La reserva legítima exige motivación estricta, prueba de daño verificable y examen de interés público prevalente."
    },
    {
      dimension: "4. Órgano garante y potestades resolutivas",
      icono: "⚖️",
      valores: {
        espana: "Consejo de Transparencia y Buen Gobierno (CTBG) con potestad resolutiva de reclamaciones.",
        reinoUnido: "Information Commissioner's Office (ICO) con potestad de dictar decision notices vinculantes.",
        canada: "Information Commissioner of Canada con facultades de investigación y órdenes vinculantes.",
        ue: "Defensor del Pueblo Europeo y control jurisdiccional directo ante el Tribunal de Justicia de la UE.",
        chile: "Consejo para la Transparencia (CPLT) con autonomía constitucional de facto y potestad sancionadora directa."
      },
      lecturaJuridica: "El modelo chileno del CPLT es reconocido como uno de los órganos garantes con mayor capacidad sancionadora de la región."
    },
    {
      dimension: "5. Transparencia activa y reutilización",
      icono: "⚙️",
      valores: {
        espana: "Portal de Transparencia estatal con catálogo de datos abiertos reutilizables (datos.gob.es).",
        reinoUnido: "Publication Scheme obligatorio por cada autoridad pública y plataforma data.gov.uk.",
        canada: "Publicación proactiva de contratos, gastos de viaje y estadísticas en Open Government Portal.",
        ue: "Registro público de documentos de las instituciones y portal data.europa.eu.",
        chile: "Art. 7 Ley 20.285: publicación mensual actualizada de dotaciones, remuneraciones, compras y actos administrativos."
      },
      lecturaJuridica: "La transparencia activa reduce significativamente la litigiosidad y promueve la rendición de cuentas preventiva."
    },
    {
      dimension: "6. Régimen sancionatorio y cumplimiento",
      icono: "🔨",
      valores: {
        espana: "Régimen disciplinario de buen gobierno con sanciones de inhabilitación y multas.",
        reinoUnido: "Desacato al tribunal para el incumplimiento de 'Decision Notices' del ICO.",
        canada: "Sanciones penales por destrucción o alteración dolosa de documentos públicos.",
        ue: "Anulación de decisiones denegatorias por el Tribunal de Justicia de la Unión Europea.",
        chile: "Multas del 20% al 50% de la remuneración mensual de la autoridad infractora y sumarios administrativos."
      },
      lecturaJuridica: "La sanción pecuniaria directa al patrimonio del funcionario es la herramienta más eficaz contra el desacato institucional."
    },
    {
      dimension: "7. Lecciones y desafíos para Chile",
      icono: "🇨🇱",
      valores: {
        espana: "Incorporar estándares homogéneos para empresas concesionarias de servicios públicos.",
        reinoUnido: "Fortalecer el test de interés público en resoluciones de amparo.",
        canada: "Tipificar penalmente la destrucción dolosa de correos y documentos oficiales.",
        ue: "Avanzar en transparencia algorítmica en decisiones automatizadas del Estado.",
        chile: "Aprobar el proyecto de Transparencia 2.0 que consagra la autonomía constitucional del CPLT y amplía sujetos al Congreso y PJUD."
      },
      lecturaJuridica: "Chile requiere modernizar su ley pionera de 2008 hacia un ecosistema digital de transparencia algorítmica y archivos estatales.",
      isWarmRow: true
    }
  ]
};

// 3. MATRIZ: REDUCCIÓN DE JORNADA LABORAL A 40 HORAS
export const MATRIZ_JORNADA_40H: MatrizComparadaData = {
  id: "jornada-40h",
  titulo: "Matriz Comparada de Reducción de Jornada Laboral",
  subtitulo: "Francia, Alemania, Colombia, España y Chile",
  boletinReferencia: "Ley 21.561 / Boletín 11.179-13",
  columnas: [
    { key: "francia", nombre: "Francia", bandera: "🇫🇷", normativaReferencia: "Loi Aubry (35h)" },
    { key: "alemania", nombre: "Alemania", bandera: "🇩🇪", normativaReferencia: "Arbeitszeitgesetz" },
    { key: "colombia", nombre: "Colombia", bandera: "🇨🇴", normativaReferencia: "Ley 2101 de 2021" },
    { key: "espana", nombre: "España", bandera: "🇪🇸", normativaReferencia: "Estatuto de los Trabajadores (37.5h)" },
    { key: "chile", nombre: "Chile", bandera: "🇨🇱", normativaReferencia: "Ley 21.561 (40 Horas)", isChile: true }
  ],
  filas: [
    {
      dimension: "1. Límite de jornada ordinaria",
      icono: "🎯",
      valores: {
        francia: "35 horas semanales fijadas legalmente desde el año 2000.",
        alemania: "8 horas diarias (máximo 48h semanales), pero con promedio real de 37.7h por convenios colectivos.",
        colombia: "Reducción progresiva de 48 a 42 horas semanales sin reducción de salarios.",
        espana: "40 horas semanales legales, con propuesta de reducción por ley a 37.5 horas.",
        chile: "Reducción de 45 a 40 horas semanales ordinarias con prohibición expresa de reducción de remuneraciones."
      },
      lecturaJuridica: "La limitación de la jornada protege la salud psicofísica y favorece la conciliación entre vida laboral y familiar."
    },
    {
      dimension: "2. Esquema de gradualidad y plazos",
      icono: "⏳",
      valores: {
        francia: "Implementación en 2 años con fuertes incentivos de exención de cotizaciones patronales.",
        alemania: "Negociación continua y descentralizada por sectores industriales (Tarifvertrag).",
        colombia: "Escalonada en 5 años (1 hora por año entre 2023 y 2026).",
        espana: "Debate legislativo para transición en 2 fases con subsidios de digitalización a PyMEs.",
        chile: "Gradualidad de 5 años: 44h al año 1 (2024), 42h al año 3 (2026) y 40h al año 5 (2028)."
      },
      lecturaJuridica: "La transición plurianual escalonada es el mecanismo estándar para amortiguar el impacto financiero en micro y pequeñas empresas."
    },
    {
      dimension: "3. Medidas de adaptabilidad y bandas horarias",
      icono: "⚙️",
      valores: {
        francia: "RTT (Réduction du Temps de Travail) con acumulación de días de descanso compensatorio.",
        alemania: "Cuentas de tiempo de trabajo (Arbeitszeitkonto) y bolsas de horas anualizadas.",
        colombia: "Distribución de la jornada diaria en común acuerdo entre 4 y 9 horas.",
        espana: "Distribución irregular de hasta el 10% de la jornada por convenio colectivo.",
        chile: "Jornada 4x3 (4 días de trabajo y 3 de descanso), bandas horarias para padres/madres y promedios en 4 semanas."
      },
      lecturaJuridica: "La adaptabilidad horaria pactada evita la precarización y permite sostener industrias de procesos continuos."
    },
    {
      dimension: "4. Excepciones y fiscalización de jornada",
      icono: "🛡️",
      valores: {
        francia: "Régimen de 'Forfait-jours' para cuadros y ejecutivos con registro electrónico obligatorio.",
        alemania: "Obligación de registrar la jornada completa de todos los trabajadores tras fallo del BAG.",
        colombia: "Excepción para cargos de dirección, confianza y manejo.",
        espana: "Registro horario diario obligatorio en todas las empresas bajo sanción de la Inspección de Trabajo.",
        chile: "Restricción severa del Art. 22 inc. 2° exclusivamente a gerentes y trabajadores sin fiscalización superior inmediata."
      },
      lecturaJuridica: "El control electrónico de asistencia y la delimitación estricta de las excepciones son vitales para evitar fraudes a la jornada máxima."
    },
    {
      dimension: "5. Lecciones para el debate chileno",
      icono: "🇨🇱",
      valores: {
        francia: "Monitorear la productividad para compensar el costo laboral por hora trabajada.",
        alemania: "Fortalecer la negociación colectiva por rama para acordar turnos adaptados.",
        colombia: "Proteger el empleo formal durante las etapas de reducción intermedia.",
        espana: "Reforzar la dotación inspectiva de la Dirección del Trabajo.",
        chile: "Consolidar el Sello 40 Horas como incentivo reputacional y asegurar el cumplimiento en pymes."
      },
      lecturaJuridica: "El éxito de la Ley 21.561 radicará en la fiscalización efectiva y en la modernización de los procesos productivos nacionales.",
      isWarmRow: true
    }
  ]
};

// 4. MATRIZ: CIBERSEGURIDAD E INFRAESTRUCTURA CRÍTICA
export const MATRIZ_CIBERSEGURIDAD: MatrizComparadaData = {
  id: "ciberseguridad",
  titulo: "Matriz Comparada de Ciberseguridad e Infraestructura Crítica",
  subtitulo: "Unión Europea, Estonia, Estados Unidos, Reino Unido y Chile",
  boletinReferencia: "Ley 21.663 / Boletín 14.847-06",
  columnas: [
    { key: "ue", nombre: "Unión Europea", bandera: "🇪🇺", normativaReferencia: "Directiva NIS 2 (2022/2555)" },
    { key: "estonia", nombre: "Estonia", bandera: "🇪🇪", normativaReferencia: "Cybersecurity Act & RIA" },
    { key: "eeuu", nombre: "Estados Unidos", bandera: "🇺🇸", normativaReferencia: "CIRCIA & CISA Standards" },
    { key: "uk", nombre: "Reino Unido", bandera: "🇬🇧", normativaReferencia: "NCSC NIS Regulations" },
    { key: "chile", nombre: "Chile", bandera: "🇨🇱", normativaReferencia: "Ley 21.663 Marco de Ciberseguridad", isChile: true }
  ],
  filas: [
    {
      dimension: "1. Enfoque institucional y gobernanza",
      icono: "🎯",
      valores: {
        ue: "Armonización europea mediante ENISA, red de CSIRT nacionales y cooperación operacional EU-CyCLONe.",
        estonia: "Ciberdefensa integrada estatal-privada bajo la Autoridad del Sistema de Información (RIA).",
        eeuu: "CISA (Cybersecurity and Infrastructure Security Agency) como coordinador federal principal.",
        uk: "National Cyber Security Centre (NCSC) como autoridad técnica nacional integrada al GCHQ.",
        chile: "Creación de la Agencia Nacional de Ciberseguridad (ANCI), el CSIRT Nacional y el Consejo Multisectorial."
      },
      lecturaJuridica: "La creación de una autoridad nacional civil con facultades de comando y fiscalización es el estándar internacional imperante."
    },
    {
      dimension: "2. Sujetos obligados y operadores esenciales",
      icono: "👥",
      valores: {
        ue: "Entidades esenciales e importantes en 18 sectores (energía, transporte, banca, salud, espacio, digital).",
        estonia: "Todos los prestadores de servicios de confianza, infraestructura digital del Estado y banca.",
        eeuu: "Operadores de infraestructura crítica designados bajo el marco CISA en 16 sectores estratégicos.",
        uk: "Operadores de Servicios Esenciales (OES) y Proveedores de Servicios Digitales Relevantes (RDSP).",
        chile: "Operadores de Importancia Vital (OIV) públicos y privados y prestadores de servicios esenciales."
      },
      lecturaJuridica: "La definición legal de operadores vitales previene vacíos regulatorios en sectores con riesgo de interrupción sistémica."
    },
    {
      dimension: "3. Plazos de notificación obligatoria de incidentes",
      icono: "⏳",
      valores: {
        ue: "Alerta temprana en 24 horas, notificación técnica en 72 horas e informe final en 1 mes.",
        estonia: "Reporte inmediato (sin demora indebida) y máximo 24 horas para incidentes significativos.",
        eeuu: "CIRCIA fija 72 horas para incidentes graves y 24 horas para pagos de rescate (ransomware).",
        uk: "Notificación al regulador competente dentro de las 72 horas siguientes al conocimiento del incidente.",
        chile: "Reporte de incidentes de efecto significativo en plazo máximo de 3 horas al CSIRT Nacional (ANCI)."
      },
      lecturaJuridica: "El plazo chileno de 3 horas es uno de los más exigentes del mundo, diseñado para contener ciberataques en tiempo real."
    },
    {
      dimension: "4. Régimen sancionatorio y multas",
      icono: "⚖️",
      valores: {
        ue: "Multas de hasta 10 millones de euros o el 2% de la facturación global anual para entidades esenciales.",
        estonia: "Multas coercitivas diarias y sanciones penales por negligencia grave en protección digital.",
        eeuu: "Inhabilitación de contratos federales, multas de agencias reguladoras (SEC, FTC) y litigios civiles.",
        uk: "Multas administrativas escalonadas de hasta 17 millones de libras esterlinas.",
        chile: "Multas gravísimas de hasta 40.000 UTM (más de $2.600 millones) y multas acumulativas diarias."
      },
      lecturaJuridica: "Las multas millonarias obligan a los directorios a considerar la ciberseguridad como un riesgo corporativo de primer orden."
    },
    {
      dimension: "5. Lecciones y recomendaciones para Chile",
      icono: "🇨🇱",
      valores: {
        ue: "Exigir programas continuos de capacitación en ciberhigiene para el personal directivo.",
        estonia: "Incentivar la reserva técnica de voluntarios en ciberdefensa.",
        eeuu: "Fortalecer el intercambio de inteligencia de amenazas en tiempo real.",
        uk: "Promover la certificación Cyber Essentials para proveedores del Estado.",
        chile: "Acelerar la dotación técnica de la ANCI y la promulgación de los reglamentos sectoriales de la Ley 21.663."
      },
      lecturaJuridica: "La arquitectura institucional chilena está a la vanguardia de la OCDE; el desafío radica en su despliegue operativo integral.",
      isWarmRow: true
    }
  ]
};

// 5. MATRIZ: TENENCIA RESPONSABLE DE MASCOTAS Y PROTECCIÓN ANIMAL
export const MATRIZ_MASCOTAS_BIENESTAR: MatrizComparadaData = {
  id: "mascotas-bienestar",
  titulo: "Matriz Comparada de Tenencia Responsable y Bienestar Animal",
  subtitulo: "España, Reino Unido, Estados Unidos, Alemania y Chile",
  boletinReferencia: "Ley 21.020 (Ley Cholito) y Ley 20.380",
  columnas: [
    { key: "espana", nombre: "España", bandera: "🇪🇸", normativaReferencia: "Ley 7/2023 de Bienestar Animal" },
    { key: "reinoUnido", nombre: "Reino Unido", bandera: "🇬🇧", normativaReferencia: "Animal Welfare Act 2006" },
    { key: "eeuu", nombre: "Estados Unidos", bandera: "🇺🇸", normativaReferencia: "Animal Welfare Act & State Laws" },
    { key: "alemania", nombre: "Alemania", bandera: "🇩🇪", normativaReferencia: "Tierschutzgesetz (TierSchG)" },
    { key: "chile", nombre: "Chile", bandera: "🇨🇱", normativaReferencia: "Ley 21.020 (Ley Cholito)", isChile: true }
  ],
  filas: [
    {
      dimension: "1. Estatuto jurídico del animal",
      icono: "🎯",
      valores: {
        espana: "Seres sintientes (Ley 17/2021 del Código Civil), desprovistos del carácter de cosas o bienes muebles.",
        reinoUnido: "Animal Sentience Act 2022 reconoce formalmente a los animales vertebrados como seres sintientes.",
        eeuu: "Régimen mixto estatal: reconocidos como propiedad con estatuto de protección especial contra la crueldad.",
        alemania: "Protección constitucional expresa en el Art. 20a de la Ley Fundamental de Bonn y seres vivos en el BGB.",
        chile: "Seres vivos y sintientes bajo la Ley 20.380, con proyectos para adecuar el Código Civil a ser no cosas."
      },
      lecturaJuridica: "La descosificación jurídica del animal es la premisa dogmática que fundamenta los deberes de custodia y no maltrato."
    },
    {
      dimension: "2. Identificación y registro obligatorio",
      icono: "⚙️",
      valores: {
        espana: "Sistema Central de Registros para la Protección Animal y microchip obligatorio para perros, gatos y hurones.",
        reinoUnido: "Microchipping of Dogs/Cats Regulations: microchip obligatorio con base de datos nacional vinculada.",
        eeuu: "Registro y licencias a nivel de condado/ciudad con obligatoriedad de microchip en refugios y criaderos.",
        alemania: "Registro mediante chip y censo canino municipal ligado al impuesto sobre tenencia de perros (Hundesteuer).",
        chile: "Registro Nacional de Mascotas o Animales de Compañía con microchip subcutáneo obligatorio administrado por Subdere."
      },
      lecturaJuridica: "La trazabilidad mediante microchip es la herramienta técnica más eficaz para erradicar el abandono y responsabilizar al tenedor."
    },
    {
      dimension: "3. Prohibiciones y control del abandono",
      icono: "🛡️",
      valores: {
        espana: "Prohibición del sacrificio por motivos de espacio, prohibición de dejar animales solos más de 24h (perros).",
        reinoUnido: "Deber legal de proveer las 5 libertades del bienestar animal (alimentación, alojamiento, salud, conducta).",
        eeuu: "Leyes estatales contra el encadenamiento prolongado y abandono con confiscación inmediata.",
        alemania: "Prohibición absoluta del abandono y de la cría con fines de crueldad estética (Qualzucht).",
        chile: "Prohibición del abandono (calificado penalmente como maltrato), prohibición de corridas de perros y sacrificios masivos."
      },
      lecturaJuridica: "La legislación prohíbe taxativamente la eutanasia como método de control poblacional, priorizando la esterilización."
    },
    {
      dimension: "4. Régimen sancionatorio y maltrato",
      icono: "⚖️",
      valores: {
        espana: "Multas administrativas de hasta 200.000€ y penas de prisión de hasta 24 meses por maltrato con resultado de muerte.",
        reinoUnido: "Penas de prisión de hasta 5 años bajo la Animal Welfare (Sentencing) Act e inhabilitación perpetua.",
        eeuu: "Delito grave (felony) en los 50 estados bajo la PACT Act federal para crueldad extrema.",
        alemania: "Pena de prisión de hasta 3 años o multas de hasta 25.000 euros por muerte o sufrimiento injustificado.",
        chile: "Presidio menor en sus grados medio a máximo, multas de 2 a 30 UTM e inhabilidad absoluta perpetua para la tenencia."
      },
      lecturaJuridica: "Las penas privativas de libertad efectiva e inhabilitación perpetua son los mecanismos disuasorios más efectivos."
    },
    {
      dimension: "5. Lecciones para Chile",
      icono: "🇨🇱",
      valores: {
        espana: "Exigir curso básico de tenencia responsable y seguro de responsabilidad civil.",
        reinoUnido: "Endurecer penas de cárcel para el maltrato animal grave y zoocidio.",
        eeuu: "Crear registros públicos de condenados por maltrato animal.",
        alemania: "Fortalecer el rol fiscalizador y los recursos sanitarios de los municipios.",
        chile: "Aumentar el presupuesto municipal para esterilizaciones masivas y albergues éticos en regiones."
      },
      lecturaJuridica: "Chile debe avanzar en educación para la tenencia responsable y fiscalización efectiva en zonas rurales y urbanas.",
      isWarmRow: true
    }
  ]
};

export const TODAS_LAS_MATRICES: Record<string, MatrizComparadaData> = {
  "ia-datos": MATRIZ_IA_DATOS,
  "acceso-info": MATRIZ_ACCESO_INFORMACION,
  "jornada-40h": MATRIZ_JORNADA_40H,
  "ciberseguridad": MATRIZ_CIBERSEGURIDAD,
  "mascotas-bienestar": MATRIZ_MASCOTAS_BIENESTAR
};

interface MatrizComparadaTableProps {
  data?: MatrizComparadaData;
  onSelectMatrix?: (key: string) => void;
}

export default function MatrizComparadaTable({ data, onSelectMatrix }: MatrizComparadaTableProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTopicKey, setSelectedTopicKey] = useState<string>(data?.id || "ia-datos");

  const activeData: MatrizComparadaData = (data && data.id === selectedTopicKey)
    ? data
    : (TODAS_LAS_MATRICES[selectedTopicKey] || data || MATRIZ_IA_DATOS);

  const handleCopyText = () => {
    const headerCols = activeData.columnas.map(c => c.nombre).join(" | ");
    const textRepresentation = `${activeData.titulo}\n${activeData.subtitulo}\n` +
      (activeData.boletinReferencia ? `Referencia: ${activeData.boletinReferencia}\n\n` : "\n") +
      `Dimensión Normativa | ${headerCols} | Lectura Jurídica / Lección para Chile\n` +
      activeData.filas.map(f => {
        const rowVals = activeData.columnas.map(c => f.valores[c.key] || "—").join(" | ");
        return `${f.dimension} | ${rowVals} | ${f.lecturaJuridica}`;
      }).join('\n');
    
    navigator.clipboard.writeText(textRepresentation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ["Dimensión Normativa", ...activeData.columnas.map(c => `${c.nombre}${c.isChile ? " (Chile)" : ""}`), "Lectura Jurídica / Lección para Chile"];
    const rows = activeData.filas.map(f => [
      `"${f.dimension}"`,
      ...activeData.columnas.map(c => `"${(f.valores[c.key] || "").replace(/"/g, '""')}"`),
      `"${f.lecturaJuridica.replace(/"/g, '""')}"`
    ].join(";"));
    
    const csvContent = "\ufeff" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Matriz_Comparada_BCN_${activeData.titulo.replace(/[^a-zA-Z0-9]+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* Title Header with Institutional BCN Styling */}
      <div className="flex flex-col items-center justify-center text-center gap-1.5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="bg-blue-700 text-white font-bold px-3 py-0.5 text-[10px] uppercase tracking-wider rounded-full font-mono flex items-center gap-1.5 shadow-2xs">
            <Scale className="w-3.5 h-3.5" /> Asesoría Técnica Parlamentaria BCN
          </span>
          {activeData.boletinReferencia && (
            <span className="bg-slate-800 text-slate-200 font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-full font-mono">
              {activeData.boletinReferencia}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
          {activeData.titulo}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-3xl">
          {activeData.subtitulo}
        </p>
      </div>

      {/* Selector & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/90 p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 ml-1 font-mono">
            <Filter className="w-3.5 h-3.5 text-blue-700" /> Dossier:
          </span>
          
          <button
            onClick={() => { setSelectedTopicKey("ia-datos"); if (onSelectMatrix) onSelectMatrix("ia-datos"); }}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedTopicKey === "ia-datos" 
                ? "bg-[#1e293b] text-white shadow-xs ring-2 ring-blue-600" 
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <span>🤖</span>
            <span>Inteligencia Artificial</span>
          </button>

          <button
            onClick={() => { setSelectedTopicKey("acceso-info"); if (onSelectMatrix) onSelectMatrix("acceso-info"); }}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedTopicKey === "acceso-info" 
                ? "bg-[#1e293b] text-white shadow-xs ring-2 ring-blue-600" 
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <span>📑</span>
            <span>Transparencia & Acceso</span>
          </button>

          <button
            onClick={() => { setSelectedTopicKey("jornada-40h"); if (onSelectMatrix) onSelectMatrix("jornada-40h"); }}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedTopicKey === "jornada-40h" 
                ? "bg-[#1e293b] text-white shadow-xs ring-2 ring-blue-600" 
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <span>⏱️</span>
            <span>Jornada 40 Horas</span>
          </button>

          <button
            onClick={() => { setSelectedTopicKey("ciberseguridad"); if (onSelectMatrix) onSelectMatrix("ciberseguridad"); }}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedTopicKey === "ciberseguridad" 
                ? "bg-[#1e293b] text-white shadow-xs ring-2 ring-blue-600" 
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <span>🛡️</span>
            <span>Ciberseguridad</span>
          </button>

          <button
            onClick={() => { setSelectedTopicKey("mascotas-bienestar"); if (onSelectMatrix) onSelectMatrix("mascotas-bienestar"); }}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedTopicKey === "mascotas-bienestar" 
                ? "bg-[#1e293b] text-white shadow-xs ring-2 ring-blue-600" 
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <span>🐕</span>
            <span>Tenencia Mascotas</span>
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={handleCopyText}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copiar texto estructurado de la matriz"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? "¡Copiado!" : "Copiar"}</span>
          </button>
          
          <button
            onClick={handleDownloadCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Exportar planilla CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Imprimir o Guardar PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* Main Multidimensional Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-300 shadow-md bg-white">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          
          {/* Header Row */}
          <thead>
            <tr className="text-xs font-bold text-white tracking-wide">
              
              {/* Dimensión normativa */}
              <th className="bg-[#1e293b] p-4 border-r border-[#334155] w-[14%] align-middle font-bold text-slate-100 uppercase text-[11px] font-mono">
                Dimensión Normativa
              </th>

              {/* Dynamic Country Columns */}
              {activeData.columnas.map((col) => {
                const isChile = col.isChile || col.nombre.toLowerCase().includes("chile");

                return (
                  <th 
                    key={col.key} 
                    className={`p-4 border-r border-[#334155] align-middle ${
                      isChile ? "bg-[#0f172a] text-amber-300 ring-1 ring-inset ring-amber-400/30" : "bg-[#1e293b]"
                    }`}
                    style={{ width: `${Math.floor(70 / (activeData.columnas.length + 1))}%` }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        {col.bandera && <span className="text-base leading-none">{col.bandera}</span>}
                        <span className="text-xs font-black tracking-tight">{col.nombre}</span>
                        {isChile && (
                          <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ml-auto">
                            LOCAL
                          </span>
                        )}
                      </div>
                      {col.normativaReferencia && (
                        <span className="text-[10px] text-slate-300 font-mono font-normal leading-tight opacity-90 line-clamp-1">
                          {col.normativaReferencia}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Lectura Jurídica / Lección para Chile */}
              <th className="bg-[#3b82f6] text-white p-4 w-[16%] align-middle font-bold uppercase text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-white" />
                  <span>Lectura Jurídica BCN</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 text-xs leading-relaxed">
            {activeData.filas.map((fila, idx) => {
              const isWarm = fila.isWarmRow;
              
              return (
                <tr 
                  key={idx}
                  className={
                    isWarm 
                      ? "bg-[#fff7ed] text-slate-900 border-t-2 border-amber-300" 
                      : (idx % 2 === 0 ? "bg-white text-slate-800" : "bg-[#f8fafc] text-slate-800")
                  }
                >
                  {/* Dimensión */}
                  <td className={`p-4 font-bold border-r align-top ${
                    isWarm 
                      ? "border-amber-200 text-amber-950 bg-amber-100/50" 
                      : "border-slate-200 text-slate-900 bg-slate-50/70"
                  }`}>
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-[12px] text-slate-950">
                        {fila.dimension}
                      </span>
                    </div>
                  </td>

                  {/* Country Values */}
                  {activeData.columnas.map((col) => {
                    const isChile = col.isChile || col.nombre.toLowerCase().includes("chile");
                    const val = fila.valores[col.key] || "—";

                    return (
                      <td 
                        key={col.key} 
                        className={`p-4 border-r align-top text-[11.5px] leading-relaxed ${
                          isWarm 
                            ? (isChile ? "bg-amber-100/80 border-amber-200 font-semibold text-slate-950" : "border-amber-200 text-slate-900") 
                            : (isChile ? "bg-blue-50/40 border-slate-200 font-medium text-slate-900" : "border-slate-200 text-slate-700")
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}

                  {/* Lectura Jurídica */}
                  <td className={`p-4 align-top text-[11.5px] leading-relaxed ${
                    isWarm 
                      ? "bg-amber-100/90 text-amber-950 font-bold border-l border-amber-300" 
                      : "bg-[#eff6ff] text-blue-950 font-medium border-l border-blue-100"
                  }`}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-800 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> Síntesis analítica:
                      </span>
                      <p className="leading-relaxed">
                        {fila.lecturaJuridica}
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* Footer Institutional Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="font-semibold text-slate-800">
            Biblioteca del Congreso Nacional de Chile — Asesoría Técnica Parlamentaria (Derecho Comparado)
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
          Metodología Multidimensional · 7 Dimensiones Normativas
        </span>
      </div>

    </div>
  );
}
