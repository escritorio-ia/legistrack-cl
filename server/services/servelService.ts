/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EleccionPresidencial {
  year: number;
  ganador: string;
  pacto: string;
  porcentaje: number;
  totalVotantes: number;
  padronTotal: number;
  participacionPct: number;
  regimen: string;
}

export interface PlebiscitoHistorico {
  year: number;
  fecha: string;
  materia: string;
  opcion1Nombre: string;
  opcion1Pct: number;
  opcion1Votos: number;
  opcion2Nombre: string;
  opcion2Pct: number;
  opcion2Votos: number;
  totalVotosValidos: number;
  participacionPct: number;
  resultadoGanador: string;
}

export interface ParticipacionRegionalSERVEL {
  region: string;
  codigo: string;
  padron: number;
  votantesEfectivos: number;
  participacionPct: number;
}

export const ELECCIONES_PRESIDENCIALES_SERVEL: EleccionPresidencial[] = [
  {
    year: 1989,
    ganador: "Patricio Aylwin Azócar",
    pacto: "Concertación de Partidos por la Democracia",
    porcentaje: 55.17,
    totalVotantes: 7158727,
    padronTotal: 7557496,
    participacionPct: 94.72,
    regimen: "Inscripción voluntaria / Voto obligatorio"
  },
  {
    year: 1993,
    ganador: "Eduardo Frei Ruiz-Tagle",
    pacto: "Concertación de Partidos por la Democracia",
    porcentaje: 57.98,
    totalVotantes: 7374094,
    padronTotal: 8085493,
    participacionPct: 91.20,
    regimen: "Inscripción voluntaria / Voto obligatorio"
  },
  {
    year: 1999,
    ganador: "Ricardo Lagos Escobar (2da Vuelta)",
    pacto: "Concertación de Partidos por la Democracia",
    porcentaje: 51.31,
    totalVotantes: 7326753,
    padronTotal: 8084476,
    participacionPct: 90.63,
    regimen: "Inscripción voluntaria / Voto obligatorio"
  },
  {
    year: 2005,
    ganador: "Michelle Bachelet Jeria (2da Vuelta)",
    pacto: "Concertación de Partidos por la Democracia",
    porcentaje: 53.50,
    totalVotantes: 7207351,
    padronTotal: 8220897,
    participacionPct: 87.67,
    regimen: "Inscripción voluntaria / Voto obligatorio"
  },
  {
    year: 2009,
    ganador: "Sebastián Piñera Echenique (2da Vuelta)",
    pacto: "Coalición por el Cambio",
    porcentaje: 51.61,
    totalVotantes: 7203371,
    padronTotal: 8285186,
    participacionPct: 86.94,
    regimen: "Inscripción voluntaria / Voto obligatorio"
  },
  {
    year: 2013,
    ganador: "Michelle Bachelet Jeria (2da Vuelta)",
    pacto: "Nueva Mayoría",
    porcentaje: 62.17,
    totalVotantes: 5695764,
    padronTotal: 13573088,
    participacionPct: 41.96,
    regimen: "Inscripción automática / Voto voluntario (Ley 20.568)"
  },
  {
    year: 2017,
    ganador: "Sebastián Piñera Echenique (2da Vuelta)",
    pacto: "Chile Vamos",
    porcentaje: 54.57,
    totalVotantes: 7032878,
    padronTotal: 14347288,
    participacionPct: 49.02,
    regimen: "Inscripción automática / Voto voluntario"
  },
  {
    year: 2021,
    ganador: "Gabriel Boric Font (2da Vuelta)",
    pacto: "Apruebo Dignidad",
    porcentaje: 55.87,
    totalVotantes: 8364534,
    padronTotal: 15030974,
    participacionPct: 55.65,
    regimen: "Inscripción automática / Voto voluntario (Récord histórico de votos)"
  }
];

export const PLEBISCITOS_HISTORICOS_SERVEL: PlebiscitoHistorico[] = [
  {
    year: 1988,
    fecha: "05-10-1988",
    materia: "Plebiscito Nacional de Continuidad Presidencial",
    opcion1Nombre: "NO",
    opcion1Pct: 55.99,
    opcion1Votos: 3967569,
    opcion2Nombre: "SÍ",
    opcion2Pct: 44.01,
    opcion2Votos: 3119110,
    totalVotosValidos: 7086679,
    participacionPct: 97.53,
    resultadoGanador: "Triunfo del NO (Apertura a la Transición Democrática)"
  },
  {
    year: 1989,
    fecha: "30-07-1989",
    materia: "Plebiscito de Reformas Constitucionales (54 reformas consensuadas)",
    opcion1Nombre: "APRUEBO",
    opcion1Pct: 91.25,
    opcion1Votos: 6069440,
    opcion2Nombre: "RECHAZO",
    opcion2Pct: 8.75,
    opcion2Votos: 581615,
    totalVotosValidos: 6651055,
    participacionPct: 93.30,
    resultadoGanador: "Aprobación masiva de reformas democráticas constitucionales"
  },
  {
    year: 2020,
    fecha: "25-10-2020",
    materia: "Plebiscito Nacional Entrada Proceso Constituyente",
    opcion1Nombre: "APRUEBO",
    opcion1Pct: 78.28,
    opcion1Votos: 5899729,
    opcion2Nombre: "RECHAZO",
    opcion2Pct: 21.72,
    opcion2Votos: 1635164,
    totalVotosValidos: 7534893,
    participacionPct: 50.91,
    resultadoGanador: "Apruebo Nueva Constitución por Convención Constitucional"
  },
  {
    year: 2022,
    fecha: "04-09-2022",
    materia: "Plebiscito Constitucional de Salida (Propuesta Convención Constitucional)",
    opcion1Nombre: "RECHAZO",
    opcion1Pct: 61.86,
    opcion1Votos: 7882958,
    opcion2Nombre: "APRUEBO",
    opcion2Pct: 38.14,
    opcion2Votos: 4860093,
    totalVotosValidos: 12743051,
    participacionPct: 85.81,
    resultadoGanador: "Rechazo de la propuesta con voto obligatorio restablecido (13.0M votos)"
  },
  {
    year: 2023,
    fecha: "17-12-2023",
    materia: "Plebiscito Constitucional (Propuesta Consejo Constitucional)",
    opcion1Nombre: "EN CONTRA",
    opcion1Pct: 55.76,
    opcion1Votos: 6894084,
    opcion2Nombre: "A FAVOR",
    opcion2Pct: 44.24,
    opcion2Votos: 5468536,
    totalVotosValidos: 12362620,
    participacionPct: 84.48,
    resultadoGanador: "En Contra de la propuesta constitucional del Consejo"
  }
];

export const PARTICIPACION_REGIONAL_SERVEL: ParticipacionRegionalSERVEL[] = [
  { region: "O'Higgins", codigo: "VI", padron: 810000, votantesEfectivos: 712800, participacionPct: 88.0 },
  { region: "Maule", codigo: "VII", padron: 920000, votantesEfectivos: 805000, participacionPct: 87.5 },
  { region: "Ñuble", codigo: "XVI", padron: 440000, votantesEfectivos: 382800, participacionPct: 87.0 },
  { region: "Metropolitana", codigo: "RM", padron: 6100000, votantesEfectivos: 5276500, participacionPct: 86.5 },
  { region: "Biobío", codigo: "VIII", padron: 1380000, votantesEfectivos: 1186800, participacionPct: 86.0 },
  { region: "Valparaíso", codigo: "V", padron: 1650000, votantesEfectivos: 1402500, participacionPct: 85.0 },
  { region: "Coquimbo", codigo: "IV", padron: 680000, votantesEfectivos: 574600, participacionPct: 84.5 },
  { region: "La Araucanía", codigo: "IX", padron: 910000, votantesEfectivos: 764400, participacionPct: 84.0 },
  { region: "Los Ríos", codigo: "XIV", padron: 360000, votantesEfectivos: 298800, participacionPct: 83.0 },
  { region: "Los Lagos", codigo: "X", padron: 790000, votantesEfectivos: 647800, participacionPct: 82.0 },
  { region: "Atacama", codigo: "III", padron: 250000, votantesEfectivos: 202500, participacionPct: 81.0 },
  { region: "Antofagasta", codigo: "II", padron: 500000, votantesEfectivos: 395000, participacionPct: 79.0 },
  { region: "Tarapacá", codigo: "I", padron: 270000, votantesEfectivos: 210600, participacionPct: 78.0 },
  { region: "Arica y Parinacota", codigo: "XV", padron: 200000, votantesEfectivos: 154000, participacionPct: 77.0 },
  { region: "Aysén", codigo: "XI", padron: 100000, votantesEfectivos: 74000, participacionPct: 74.0 },
  { region: "Magallanes", codigo: "XII", padron: 160000, votantesEfectivos: 115200, participacionPct: 72.0 }
];

export function getServelPresidenciales(): EleccionPresidencial[] {
  return ELECCIONES_PRESIDENCIALES_SERVEL;
}

export function getServelPlebiscitos(): PlebiscitoHistorico[] {
  return PLEBISCITOS_HISTORICOS_SERVEL;
}

export function getServelParticipacionRegional(): ParticipacionRegionalSERVEL[] {
  return PARTICIPACION_REGIONAL_SERVEL;
}
