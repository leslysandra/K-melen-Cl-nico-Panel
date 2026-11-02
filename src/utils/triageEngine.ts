import { Patient, TriageStatus, CdsRecommendation } from '../types/clinical';

export function getPatientLatestLog(patient: Patient) {
  return patient.logs[patient.logs.length - 1];
}

export function calculateTriageStatus(patient: Patient): TriageStatus {
  const latest = getPatientLatestLog(patient);
  const previous = patient.logs.length >= 2 ? patient.logs[patient.logs.length - 2] : null;

  // Critically high risk (RED)
  if (latest.neuroStatus === 'CONFUSED') {
    return 'RED';
  }
  if (latest.stools === 0 && previous && previous.stools === 0) {
    return 'RED';
  }
  if (latest.stools === 0 && !latest.lactuloseAdherence && patient.socioDemographic.ascitesCheck.status === 'positive') {
    return 'RED';
  }
  if (patient.lastSync.hoursAgo >= 72 && (latest.stools === 0 || patient.socioDemographic.ascitesCheck.status === 'positive')) {
    return 'RED';
  }

  // Warning / Titration risk (YELLOW)
  if (latest.stools === 0 || latest.stools === 1) {
    return 'YELLOW';
  }
  if (latest.stools >= 4) {
    return 'YELLOW';
  }
  if (latest.neuroStatus === 'DROWSY') {
    return 'YELLOW';
  }
  if (!latest.lactuloseAdherence) {
    return 'YELLOW';
  }

  // Stable in therapeutic window (GREEN)
  return 'GREEN';
}

export function calculateRuralPriorityScore(patient: Patient): {
  score: number;
  clinicalPoints: number;
  ruralPoints: number;
  syncPoints: number;
} {
  const status = calculateTriageStatus(patient);
  const latest = getPatientLatestLog(patient);

  let clinicalPoints = status === 'RED' ? 55 : status === 'YELLOW' ? 25 : 8;

  if (latest.neuroStatus === 'CONFUSED') clinicalPoints += 20;
  else if (latest.neuroStatus === 'DROWSY') clinicalPoints += 10;

  if (patient.socioDemographic.ascitesCheck.status === 'positive') clinicalPoints += 12;
  if (patient.childPugh.class === 'C') clinicalPoints += 10;
  else if (patient.childPugh.class === 'B') clinicalPoints += 5;

  // Rural access challenge points (Distance km + Road condition)
  const dist = patient.socioDemographic.distanceKm;
  const roadMultiplier = patient.socioDemographic.roadDifficultyWeight;
  const ruralPoints = Math.round((dist * 1.4) * roadMultiplier);

  // Sync loss penalty
  let syncPoints = 0;
  if (patient.lastSync.hoursAgo > 24) {
    syncPoints = Math.min(25, Math.round((patient.lastSync.hoursAgo / 24) * 7));
  }

  const score = clinicalPoints + ruralPoints + syncPoints;

  return {
    score,
    clinicalPoints,
    ruralPoints,
    syncPoints,
  };
}

export function getCdsRecommendation(patient: Patient, status: TriageStatus): CdsRecommendation {
  const latest = getPatientLatestLog(patient);

  if (status === 'RED') {
    const isMissedMeds = !latest.lactuloseAdherence;
    return {
      status: 'RED',
      headline: 'Riesgo Inminente de Encefalopatía Hepática Aguda (EH Grado II–III)',
      clinicalReason: `${latest.stools === 0 ? 'Constipación crítica (0 deposiciones en ≥48h)' : 'Deterioro neurológico agudo'} con ${latest.neuroStatus === 'CONFUSED' ? 'confusión/asterixis franco' : 'marcado estupor'}${isMissedMeds ? ' y abandono de lactulosa' : ''}.`,
      lactuloseAction: 'rescate_inmediato',
      doseAdjustmentAdvice: 'Iniciar de inmediato esquema de rescate: 30 mL (o 3 cucharadas soperas) de Lactulosa vía oral cada 1 a 2 horas hasta lograr al menos 2 deposiciones blandas abundantes. Si hay compromiso de conciencia o riesgo de broncoaspiración, derivar para enema de retención con Lactulosa (300 mL en 700 mL de agua).',
      immediateActions: [
        `Llamar con urgencia al cuidador ${patient.socioDemographic.caregiver.name} (${patient.socioDemographic.caregiver.phone}).`,
        'Descartar desencadenantes: Infección bacteriana (sospechar PBE si hay ascitis), sangrado digestivo alto, hipokalemia o uso accidental de sedantes/AINES.',
        'Incluir como Prioridad #1 en la Ronda Médica Rural de hoy o solicitar ambulancia 4x4 a Base SAMU / CESFAM.',
        'Suspender diuréticos temporalmente si hay sospecha de deshidratación o hipovolemia.',
      ],
      monitoringGuidance: 'Monitoreo de asterixis cada 2 horas por el cuidador. Si no presenta deposición en 6 horas o aumenta desorientación, trasladar a Servicio de Urgencia Hospital Nodal.',
      rondaRuralRecommendation: 'Visita domiciliaria PRIORITARIA con móvil 4x4 dentro de las próximas 4 a 8 horas.',
    };
  }

  if (status === 'YELLOW') {
    if (latest.stools >= 4) {
      return {
        status: 'YELLOW',
        headline: 'Sobre-titulación de Lactulosa (Diarrea inducida)',
        clinicalReason: `Presenta ${latest.stools} deposiciones líquidas al día. Alto riesgo de deshidratación, hipovolemia, hipopotasemia e injuria renal aguda (IRA) prerrenal.`,
        lactuloseAction: 'reducir',
        doseAdjustmentAdvice: 'Reducir la dosis prescrita en un 30% a 50% (ej. bajar de 30 mL c/8h a 15 mL c/12h o suspender por 12-24 horas hasta que las heces tomen consistencia pastosa Bristol 4).',
        immediateActions: [
          'Instruir al paciente o familiar hidratación oral con sales o líquidos electrolíticos.',
          'Suspender o disminuir diuréticos (Furosemida / Espironolactona) mientras persista diarrea profusa.',
          'Monitorear diuresis y solicitar perfil renal (Creatinina, Nitrógeno Ureico, Electrolitos plasmáticos) en próxima ronda.',
        ],
        monitoringGuidance: 'Meta: Bajar a 2–3 deposiciones blandas al día. Reevaluar dosis en 24 horas.',
        rondaRuralRecommendation: 'Llamada de teleasistencia hoy por TENS de la posta; control presencial en ronda programada.',
      };
    }

    return {
      status: 'YELLOW',
      headline: 'Sub-titulación de Lactulosa / Signos Tempranos de EH (Inversión Sueño-Vigilia)',
      clinicalReason: `Deposiciones insuficientes (${latest.stools}/día) y/o somnolencia diurna excesiva. Riesgo de acumulación de amonio intestinal.`,
      lactuloseAction: 'aumentar',
      doseAdjustmentAdvice: 'Aumentar la dosis de Lactulosa en 5 a 10 mL adicionales por toma (o agregar 1 cucharada sopera al mediodía o noche) para alcanzar la meta estricta de 2 a 3 deposiciones blandas diarias.',
      immediateActions: [
        'Enviar indicación de audio bilingüe (Español / Mapuzungun) al teléfono del paciente o cuidador.',
        'Sugerir mezclar el jarabe con infusión de hierbas frías/tibias (menta, manzanilla) para mejorar tolerancia gástrica.',
        'Capacitar a la familia para vigilar reflejo de temblor en manos (asterixis) al sostener el mate o la taza.',
      ],
      monitoringGuidance: 'Control telefónico en 24 horas para verificar si logró evacuar 2 a 3 veces.',
      rondaRuralRecommendation: 'Priorizar en la ronda médica de esta semana si persiste somnoliento.',
    };
  }

  // GREEN
  return {
    status: 'GREEN',
    headline: 'Estable en Ventana Terapéutica Óptima (2–3 Deposiciones/Día)',
    clinicalReason: `Excelente control clínico. ${latest.stools} deposiciones blandas (Bristol 4), sensorio lúcido sin signos de inversión de sueño, adherencia farmacológica confirmada.`,
    lactuloseAction: 'mantener',
    doseAdjustmentAdvice: `Mantener esquema actual: ${patient.baselineMedication.lactulosePrescribedDose}. No modificar dosificación.`,
    immediateActions: [
      'Reforzar adherencia sostenida y estilo de vida.',
      'Verificar abastecimiento de jarabe de lactulosa en Posta de Salud Rural para el próximo mes.',
      'Control de peso seco y perímetro abdominal semanal.',
    ],
    monitoringGuidance: 'Monitoreo preventivo habitual vía app o tarjeta QR en la próxima visita a la Posta.',
    rondaRuralRecommendation: 'Seguimiento en ronda habitual de crónicos; no requiere visita urgente.',
  };
}

export function generateRayenSummary(patient: Patient, status: TriageStatus): string {
  const latest = getPatientLatestLog(patient);
  const cds = getCdsRecommendation(patient, status);
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const last7DaysStools = patient.logs.map((l) => `${l.dayLabel}: ${l.stools} dep`).join(' | ');
  const totalStools = patient.logs.reduce((acc, l) => acc + l.stools, 0);
  const avgStools = (totalStools / patient.logs.length).toFixed(1);
  const adherenceCount = patient.logs.filter((l) => l.lactuloseAdherence).length;
  const adherencePct = Math.round((adherenceCount / patient.logs.length) * 100);

  return `=== SERVICIO DE SALUD ARAUCANÍA SUR — RED DE ATENCIÓN PRIMARIA ===
FICHA CLÍNICA ELECTRÓNICA (REGISTRO PARA RAYEN / SIDRA)
PROGRAMA DE SALUD CARDIOVASCULAR / HEPATOLOGÍA RURAL INTERCULTURAL
FECHA/HORA: ${dateStr} ${timeStr} hrs
CENTRO ASISTENCIAL: CESFAM Nodal / ${patient.socioDemographic.assignedPosta}

1. ANTECEDENTES DEL PACIENTE:
- Nombre: ${patient.name}
- RUT: ${patient.rut} | Edad: ${patient.age} años
- Diagnóstico: ${patient.etiology}
- Estadificación: Child-Pugh ${patient.childPugh.class} (${patient.childPugh.score} pts) | MELD-Na: ${patient.meldNa}
- Sector Geográfico: ${patient.socioDemographic.sector} (${patient.socioDemographic.distanceKm} km al CESFAM)
- Condición Camino: ${patient.socioDemographic.roadType}
- Pertinencia Intercultural: ${patient.socioDemographic.languagePreference} (Modalidad: ${patient.socioDemographic.appModality})
- Cuidador Responsable: ${patient.socioDemographic.caregiver.name} (${patient.socioDemographic.caregiver.kinship}) - Fono: ${patient.socioDemographic.caregiver.phone}

2. TELEMONITOREO LONGITUDINAL (ÚLTIMOS 7 DÍAS - SISTEMA KÜMELEN):
- Registro de Deposiciones: ${last7DaysStools}
- Promedio Semanal: ${avgStools} deposiciones/día (Meta clínica: 2 a 3)
- Adherencia a Lactulosa: ${adherencePct}% (${adherenceCount}/7 días registrados)
- Estado Neurológico Hoy: ${latest.neuroStatus === 'LUCID' ? 'Lúcido y orientado' : latest.neuroStatus === 'DROWSY' ? 'Somnoliento / Inversión vigilia-sueño' : 'Confusión / Asterixis positivo'}
- Estado de Ascitis / Edemas: ${patient.socioDemographic.ascitesCheck.description} (${patient.socioDemographic.ascitesCheck.peripheralEdema})
- Última Sincronización: ${patient.lastSync.timestamp} [${patient.lastSync.method === 'cellular' ? 'Red Móvil 3G/4G' : patient.lastSync.method === 'qr_posta' ? 'Pase QR Óptico en Posta' : 'Memoria Local'}]

3. EVALUACIÓN DE TRIAGE Y MOTOR DE DECISIÓN (CDS):
- Nivel de Alerta: ${status === 'RED' ? '🔴 ALERTA ROJA (RIESGO AGUDO EH)' : status === 'YELLOW' ? '🟡 PRECAUCIÓN (AJUSTE DOSIS LACTULOSA)' : '🟢 ESTABLE (EN VENTANA TERAPÉUTICA)'}
- Diagnóstico Situacional: ${cds.headline}
- Fundamento Clínico: ${cds.clinicalReason}

4. PLAN Y CONDUCTA MÉDICA:
- Ajuste de Lactulosa: ${cds.doseAdjustmentAdvice}
- Acciones Inmediatas:
${cds.immediateActions.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}
- Hoja de Ruta Ronda Rural: ${patient.inRondaRuralRoute ? 'INCLUIDO en nómina de visita prioritaria con móvil 4x4' : 'No requiere móvil prioritario; control habitual'}

PROFESIONAL RESPONSABLE: Dra. Camila Morales (Médico EDF / Hepatología Rural)
SUPERVISIÓN: Servicio de Salud Araucanía Sur — Proyecto Kümelen Salud Rural`;
}
