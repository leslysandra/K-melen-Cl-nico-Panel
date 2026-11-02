export type TriageStatus = 'RED' | 'YELLOW' | 'GREEN';

export type NeuroStatus = 'LUCID' | 'DROWSY' | 'CONFUSED';

export type SyncSource = 'cellular' | 'qr_posta' | 'offline';

export interface DailyLog {
  date: string;
  dayLabel: string;
  stools: number; // 0, 1, 2, 3, 4+
  lactuloseAdherence: boolean;
  rifaximinAdherence?: boolean;
  neuroStatus: NeuroStatus;
  psychomotorTestSeconds?: number | null; // e.g., Number Connection Test (<30s normal, >45s EH)
  syncSource: SyncSource;
  syncTime: string;
  symptomsNote?: string;
}

export interface CaregiverInfo {
  name: string;
  kinship: string;
  phone: string;
  activeSupport: boolean;
}

export interface AscitesCheck {
  status: 'positive' | 'negative' | 'mild';
  description: string;
  abdominalGirthChangeCm?: number;
  peripheralEdema: string;
  lastCheckDate: string;
}

export interface SocioDemographic {
  sector: string;
  commune: string;
  assignedPosta: string;
  distanceKm: number;
  roadType: 'Huella 4x4 intransitable en lluvia' | 'Camino de ripio con baches' | 'Camino rural ripio regular' | 'Pavimentado / Mixto';
  roadDifficultyWeight: number; // 1.0 (easy) to 2.0 (hard 4x4)
  languagePreference: 'Mapuzungun' | 'Bilingüe Mapuzungun/Español' | 'Español';
  appModality: '100% Audio y pictogramas' | 'Iconos táctiles y voz' | 'Texto asistido';
  cellularCoverage: 'Sin señal en ruka (Solo en Posta)' | '3G débil en loma' | '4G intermitente' | '4G estable';
  caregiver: CaregiverInfo;
  ascitesCheck: AscitesCheck;
}

export interface ClinicalNote {
  id: string;
  author: string;
  role: string;
  date: string;
  text: string;
  actionTaken?: string;
}

export interface Patient {
  id: string;
  code: string;
  name: string;
  age: number;
  rut: string;
  etiology: string; // e.g. "Cirrosis OH (Abstinente)", "Cirrosis MASLD/NASH", "Cirrosis Biliar Primaria"
  childPugh: {
    class: 'A' | 'B' | 'C';
    score: number;
  };
  meldNa: number;
  baselineMedication: {
    lactulosePrescribedDose: string;
    rifaximinPrescribed?: string;
    diureticPrescribed?: string;
  };
  socioDemographic: SocioDemographic;
  logs: DailyLog[]; // 7 consecutive days, [6] is today
  lastSync: {
    timestamp: string;
    method: SyncSource;
    hoursAgo: number;
  };
  inRondaRuralRoute: boolean;
  rondaPriorityOrder?: number;
  clinicalNotes: ClinicalNote[];
}

export interface CdsRecommendation {
  status: TriageStatus;
  headline: string;
  clinicalReason: string;
  lactuloseAction: 'aumentar' | 'reducir' | 'mantener' | 'rescate_inmediato';
  doseAdjustmentAdvice: string;
  immediateActions: string[];
  monitoringGuidance: string;
  rondaRuralRecommendation: string;
}
