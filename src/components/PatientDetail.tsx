import React, { useState } from 'react';
import {
  Patient,
  TriageStatus,
  DailyLog,
  NeuroStatus,
} from '../types/clinical';
import {
  calculateTriageStatus,
  getCdsRecommendation,
  getPatientLatestLog,
  calculateRuralPriorityScore,
} from '../utils/triageEngine';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Volume2,
  UserCheck,
  Phone,
  Truck,
  PlusCircle,
  FileEdit,
  Clock,
  Wifi,
  QrCode,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

interface PatientDetailProps {
  patient: Patient;
  onOpenAudioModal: () => void;
  onOpenRondaModal: () => void;
  onToggleRonda: () => void;
  onAddClinicalNote: (patientId: string, noteText: string) => void;
  onQuickChangeStatus: (patientId: string, newStatus: TriageStatus) => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  onOpenAudioModal,
  onOpenRondaModal,
  onToggleRonda,
  onAddClinicalNote,
  onQuickChangeStatus,
}) => {
  const status = calculateTriageStatus(patient);
  const cds = getCdsRecommendation(patient, status);
  const latestLog = getPatientLatestLog(patient);
  const priority = calculateRuralPriorityScore(patient);

  const [newNoteText, setNewNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(patient.logs.length - 1);

  const activeLog = patient.logs[activeDayIndex] || latestLog;

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSavingNote(true);
    setTimeout(() => {
      onAddClinicalNote(patient.id, newNoteText.trim());
      setNewNoteText('');
      setIsSavingNote(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* BLOQUE A: ENCABEZADO CLÍNICO Y DETERMINANTES SOCIALES RURALES */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        {/* Header Title & Basic Clinical Tags */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {patient.code}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {patient.name}
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${
                  status === 'RED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : status === 'YELLOW'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {status === 'RED' && <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />}
                {status === 'YELLOW' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {status === 'GREEN' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>
                  {status === 'RED'
                    ? 'Alerta Roja: Riesgo EH'
                    : status === 'YELLOW'
                    ? 'Precaución: Titulación'
                    : 'Estable en Meta'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mt-2 flex-wrap">
              <span>{patient.age} años</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{patient.rut}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-800">{patient.etiology}</span>
              <span aria-hidden="true">·</span>
              <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-800">
                Child-Pugh {patient.childPugh.class} ({patient.childPugh.score} pts)
              </span>
              <span aria-hidden="true">·</span>
              <span className="bg-slate-100 font-mono font-semibold px-2 py-0.5 rounded text-slate-800">
                MELD-Na {patient.meldNa}
              </span>
            </div>
          </div>

          {/* Quick Simulation Status Toggle for Testing (1-Click Switcher) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Test Semáforo:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onQuickChangeStatus(patient.id, 'GREEN')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  status === 'GREEN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Simular paciente en meta (2-3 deposiciones, lúcido)"
              >
                🟢 Verde
              </button>
              <button
                type="button"
                onClick={() => onQuickChangeStatus(patient.id, 'YELLOW')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  status === 'YELLOW'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Simular precaución (1 dep o diarrea por lactulosa)"
              >
                🟡 Amarillo
              </button>
              <button
                type="button"
                onClick={() => onQuickChangeStatus(patient.id, 'RED')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  status === 'RED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Simular riesgo agudo (0 dep >=48h, asterixis)"
              >
                🔴 Rojo
              </button>
            </div>
          </div>
        </div>

        {/* 3 Sociodemographic Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
          {/* Card 1: Geografía y Acceso */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Geografía & Acceso Rural
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <p>
                <strong className="font-semibold text-slate-900">{patient.socioDemographic.distanceKm} km</strong> al CESFAM Nodal
              </p>
              <p className="text-slate-600 line-clamp-1">
                Posta: {patient.socioDemographic.assignedPosta}
              </p>
              <p className="text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/70 font-medium">
                {patient.socioDemographic.roadType}
              </p>
            </div>
          </div>

          {/* Card 2: Perfil Intercultural */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Perfil Intercultural
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <p>
                Idioma: <strong className="font-semibold text-slate-900">{patient.socioDemographic.languagePreference}</strong>
              </p>
              <p className="text-slate-600">
                Modalidad: <span className="font-medium text-teal-800">{patient.socioDemographic.appModality}</span>
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-slate-400" />
                {patient.socioDemographic.cellularCoverage}
              </p>
            </div>
          </div>

          {/* Card 3: Red de Apoyo y Cuidador + Ascitis */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Cuidador & Ascitis
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <p className="flex items-center justify-between">
                <span>{patient.socioDemographic.caregiver.name}</span>
                <span className="font-mono text-teal-700 font-semibold">{patient.socioDemographic.caregiver.phone}</span>
              </p>
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Ascitis semanal:</span>
                <span
                  className={`font-semibold ${
                    patient.socioDemographic.ascitesCheck.status === 'positive'
                      ? 'text-rose-700'
                      : patient.socioDemographic.ascitesCheck.status === 'mild'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {patient.socioDemographic.ascitesCheck.status === 'positive'
                    ? 'Positiva (+)'
                    : patient.socioDemographic.ascitesCheck.status === 'mild'
                    ? 'Leve (+)'
                    : 'Sin ascitis'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                {patient.socioDemographic.ascitesCheck.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BLOQUE B: MOTOR DE SOPORTE A LA DECISIÓN CLÍNICA (CDS)     */}
      {/* ========================================================= */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
          status === 'RED'
            ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400/30'
            : status === 'YELLOW'
            ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/30'
            : 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-black/5">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                status === 'RED'
                  ? 'bg-rose-600 text-white'
                  : status === 'YELLOW'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {status === 'RED' && <AlertOctagon className="w-5 h-5" />}
              {status === 'YELLOW' && <AlertTriangle className="w-5 h-5" />}
              {status === 'GREEN' && <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                Protocolo Clínico Automatizado • Hepatología Araucanía Sur
              </span>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {cds.headline}
              </h3>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                {cds.clinicalReason}
              </p>
            </div>
          </div>

          {/* Therapeutic Window Target Tag */}
          <div className="bg-white/80 rounded-xl p-3 border border-black/5 shrink-0 text-right">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Ventana Meta Terapéutica
            </span>
            <span className="text-base font-bold font-mono text-teal-800">
              2 a 3 deposiciones/día
            </span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              Consistencia Bristol 4 (blanda)
            </span>
          </div>
        </div>

        {/* Actionable Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Dose adjustment guidance */}
          <div className="bg-white/90 p-4 rounded-xl border border-black/5 space-y-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Pauta de Titulación de Lactulosa:
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-sans">
              {cds.doseAdjustmentAdvice}
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              Prescripción base registrada: <strong>{patient.baselineMedication.lactulosePrescribedDose}</strong>
            </div>
          </div>

          {/* Immediate checklist */}
          <div className="bg-white/90 p-4 rounded-xl border border-black/5 space-y-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Acciones Inmediatas del Equipo:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {cds.immediateActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Banner of CDS: Ronda Rural & Follow-up */}
        <div className="mt-4 pt-3 border-t border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <Truck className="w-4 h-4 text-slate-600 shrink-0" />
            <span>
              <strong>Ronda Rural:</strong> {cds.rondaRuralRecommendation}
            </span>
          </div>
          <span className="text-[11px] text-slate-600 font-mono">
            {cds.monitoringGuidance}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BLOQUE C: GRÁFICO Y LÍNEA DE TIEMPO LONGITUDINAL DE 7 DÍAS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Seguimiento Longitudinal de 7 Días
            </h3>
            <p className="text-xs text-slate-500">
              Correlación temporal de deposiciones, toma de lactulosa, sensorio neurológico y canal de transmisión
            </p>
          </div>

          {/* Legend for target band */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-emerald-200/90 border border-emerald-400" />
              Meta (2–3/día)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-rose-500" />
              0 (Estreñimiento)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-orange-400" />
              ≥4 (Diarrea/Exceso)
            </span>
          </div>
        </div>

        {/* 1. Bar Chart with Green Target Band */}
        <div className="relative pt-6 pb-2">
          {/* Target Zone Background Band (2 to 3 stools) */}
          <div className="absolute inset-x-0 bottom-12 h-14 bg-emerald-50/80 border-y border-dashed border-emerald-300 pointer-events-none flex items-center justify-end pr-2">
            <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase opacity-80">
              Zona Meta Terapéutica (2–3 dep)
            </span>
          </div>

          {/* Bars grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 relative z-10">
            {patient.logs.map((log, idx) => {
              const isSelected = idx === activeDayIndex;
              const isToday = idx === patient.logs.length - 1;

              // Bar height calculation (max 5)
              const maxDisplay = 5;
              const heightPct = Math.min(100, Math.max(12, (log.stools / maxDisplay) * 100));

              let barColor = 'bg-emerald-500';
              if (log.stools === 0) barColor = 'bg-rose-500';
              else if (log.stools === 1) barColor = 'bg-amber-400';
              else if (log.stools >= 4) barColor = 'bg-orange-500';

              return (
                <button
                  key={log.date}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex flex-col items-center group cursor-pointer focus:outline-none p-1.5 rounded-xl transition-all ${
                    isSelected ? 'bg-slate-100 ring-2 ring-teal-500/30' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-slate-700 mb-1 tabular-nums">
                    {log.stools}
                  </span>

                  {/* Vertical bar container */}
                  <div className="w-full max-w-[36px] h-32 bg-slate-100 rounded-t-lg flex flex-col justify-end p-1 relative overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-md transition-all duration-300 ${barColor} shadow-xs`}
                    />
                  </div>

                  <span
                    className={`text-[11px] mt-2 font-medium ${
                      isToday ? 'font-bold text-teal-800' : 'text-slate-600'
                    }`}
                  >
                    {log.dayLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Structured Longitudinal Metrics Table / Rows */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
          {/* Row A: Lactulose adherence */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 p-2 rounded-lg bg-slate-50/70 items-center">
            <div className="col-span-7 sm:col-span-7 flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase px-1">
              <span>Adherencia a Lactulosa:</span>
              <span className="font-mono text-slate-600">
                {patient.logs.filter((l) => l.lactuloseAdherence).length}/7 días tomados
              </span>
            </div>
            {patient.logs.map((log) => (
              <div key={log.date} className="text-center font-medium">
                {log.lactuloseAdherence ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    💊 Sí
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-bold bg-rose-50 px-1 py-0.5 rounded">
                    ❌ No
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Row B: Neurological Status (Pesquisa EH) */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 p-2 rounded-lg bg-slate-50/70 items-center">
            <div className="col-span-7 flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase px-1">
              <span>Pesquisa de Encefalopatía (Sensorio / Mini-test):</span>
              <span className="text-slate-600">Corte: Somnolencia / Confusión / Asterixis</span>
            </div>
            {patient.logs.map((log) => (
              <div key={log.date} className="text-center">
                <span
                  className={`block text-[11px] font-semibold truncate ${
                    log.neuroStatus === 'CONFUSED'
                      ? 'text-rose-700 font-bold'
                      : log.neuroStatus === 'DROWSY'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                  title={log.neuroStatus}
                >
                  {log.neuroStatus === 'CONFUSED'
                    ? '😵 Confuso'
                    : log.neuroStatus === 'DROWSY'
                    ? '😴 Sueño'
                    : '😊 Lúcido'}
                </span>
                {log.psychomotorTestSeconds && (
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {log.psychomotorTestSeconds}s
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Row C: Data Sync Channel / Offline traceability */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 p-2 rounded-lg bg-slate-50/70 items-center">
            <div className="col-span-7 flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase px-1">
              <span>Origen del Registro (Trazabilidad Rural):</span>
              <span className="font-mono text-slate-500">Último: {patient.lastSync.timestamp}</span>
            </div>
            {patient.logs.map((log) => (
              <div key={log.date} className="text-center text-[10px] text-slate-600">
                {log.syncSource === 'cellular' && <span title="Señal celular 3G/4G">☁️ 3G/4G</span>}
                {log.syncSource === 'qr_posta' && <span title="Pase QR óptico en Posta">📷 QR Posta</span>}
                {log.syncSource === 'offline' && <span title="Guardado offline local">📱 Offline</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Expanded Details Box */}
        {activeLog && (
          <div className="mt-4 p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="text-teal-900 font-bold">
                Detalle del {activeLog.dayLabel} ({activeLog.date}):
              </strong>{' '}
              <span className="text-slate-800">
                {activeLog.stools} deposiciones · Lactulosa:{' '}
                {activeLog.lactuloseAdherence ? 'Tomada' : 'Omitida'} · Sensorio:{' '}
                {activeLog.neuroStatus === 'CONFUSED'
                  ? 'Confusión / Asterixis'
                  : activeLog.neuroStatus === 'DROWSY'
                  ? 'Somnoliento'
                  : 'Lúcido'}
              </span>
              {activeLog.symptomsNote && (
                <p className="text-[11px] text-slate-600 mt-0.5 italic">
                  Nota registrada: "{activeLog.symptomsNote}"
                </p>
              )}
            </div>
            <span className="text-[11px] text-teal-800 font-mono shrink-0">
              Captado vía {activeLog.syncSource} a las {activeLog.syncTime} hrs
            </span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BLOQUE D: ACCIONES MÉDICAS DIRECTAS (CIERRE DEL CICLO)    */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Acciones Médicas Directas (Cierre del Ciclo Clínico)
          </h3>
          <p className="text-xs text-slate-500">
            Emisión de indicaciones al teléfono del paciente rural, gestión de rondas y registro en ficha
          </p>
        </div>

        {/* 3 Main Action Trigger Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Action 1: Enviar Ajuste de Audio Bilingüe */}
          <button
            type="button"
            onClick={onOpenAudioModal}
            className="p-4 rounded-xl border border-teal-300 bg-teal-50/60 hover:bg-teal-50 text-left transition-all cursor-pointer flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-teal-950">
                  Enviar Ajuste por Audio Bilingüe
                </h4>
                <ArrowUpRight className="w-4 h-4 text-teal-700" />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Envía indicación médica por voz pregrabada (Español y Mapuzungun) directa al teléfono del paciente rural.
              </p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-teal-800">
                Prescripción bilingüe con síntesis de voz →
              </span>
            </div>
          </button>

          {/* Action 2: Incluir en Hoja de Ruta de Ronda Rural */}
          <button
            type="button"
            onClick={onOpenRondaModal}
            className="p-4 rounded-xl border border-indigo-300 bg-indigo-50/60 hover:bg-indigo-50 text-left transition-all cursor-pointer flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-indigo-950">
                  Gestionar Hoja de Ronda Médica Rural
                </h4>
                <ArrowUpRight className="w-4 h-4 text-indigo-700" />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Priorizado en puesto #{priority.score > 70 ? '1' : priority.score > 40 ? '2' : '3'} de la ruta en móvil 4x4 ({patient.socioDemographic.distanceKm} km por {patient.socioDemographic.roadType.split(' ')[0]}).
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRonda();
                  }}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                    patient.inRondaRuralRoute
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-indigo-700 border border-indigo-300'
                  }`}
                >
                  {patient.inRondaRuralRoute ? '✓ En Nómina de Ruta' : '+ Agregar a Ruta de Hoy'}
                </span>
                <span className="text-[11px] text-indigo-800 font-medium">Ver itinerario completo →</span>
              </div>
            </div>
          </button>
        </div>

        {/* Action 3: Registrar Nota Clínica / Evolución */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileEdit className="w-4 h-4 text-teal-600" />
              Registrar Evolución / Conducta Médica
            </span>
            <span className="text-[11px] text-slate-500">
              Queda guardada en ficha local y disponible para RAYEN
            </span>
          </div>

          <form onSubmit={handleSaveNote} className="space-y-2">
            <textarea
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Ej: Se contacta a hija Marta por teléfono. Se indica subir 1 cucharada sopera de jarabe Lactulosa al almuerzo. Control telefónico por TENS en 24h..."
              className="w-full text-xs p-3 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Firma: Dra. Camila Morales (Médico EDF / CESFAM Nodal)
              </span>
              <button
                type="submit"
                disabled={isSavingNote || !newNoteText.trim()}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-40"
              >
                {isSavingNote ? 'Guardando...' : 'Guardar Evolución'}
              </button>
            </div>
          </form>

          {/* Historical notes stream */}
          {patient.clinicalNotes.length > 0 && (
            <div className="pt-3 border-t border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Notas Clínicas Previas ({patient.clinicalNotes.length}):
              </span>
              <div className="space-y-2">
                {patient.clinicalNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-white border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">
                        {note.author} · {note.role}
                      </span>
                      <span className="font-mono">{note.date}</span>
                    </div>
                    <p className="text-slate-800">{note.text}</p>
                    {note.actionTaken && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                        Acción: {note.actionTaken}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
