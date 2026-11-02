import React from 'react';
import { Users, AlertOctagon, AlertTriangle, Truck } from 'lucide-react';
import { Patient } from '../types/clinical';
import { calculateTriageStatus } from '../utils/triageEngine';

export type FilterType = 'all' | 'red' | 'yellow' | 'ronda';

interface KpiCardsProps {
  patients: Patient[];
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  patients,
  activeFilter,
  onSelectFilter,
}) => {
  const redPatients = patients.filter((p) => calculateTriageStatus(p) === 'RED');
  const yellowPatients = patients.filter((p) => calculateTriageStatus(p) === 'YELLOW');
  const rondaPriorityPatients = patients.filter((p) => {
    const isFar = p.socioDemographic.distanceKm >= 15;
    const isBadRoad = p.socioDemographic.roadDifficultyWeight >= 1.3;
    const hasAlert = calculateTriageStatus(p) !== 'GREEN' || p.lastSync.hoursAgo >= 48;
    return (isFar && isBadRoad && hasAlert) || p.inRondaRuralRoute;
  });

  const mapuzungunCount = patients.filter(
    (p) => p.socioDemographic.languagePreference !== 'Español'
  ).length;

  const caregiverActiveCount = patients.filter(
    (p) => p.socioDemographic.caregiver.activeSupport
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Cohorte Total */}
      <button
        onClick={() => onSelectFilter('all')}
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
          activeFilter === 'all'
            ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/20'
            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cohorte Cirrosis Rural
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {patients.length}
          </span>
          <span className="text-xs text-slate-500">pacientes activos</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-500">
          <span>{mapuzungunCount} Mapuzungun / Bilingüe</span>
          <span aria-hidden="true">·</span>
          <span>{caregiverActiveCount} con Cuidador</span>
        </div>
      </button>

      {/* 2. Alerta Roja: Riesgo Encefalopatía */}
      <button
        onClick={() => onSelectFilter('red')}
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
          activeFilter === 'red'
            ? 'bg-rose-50/50 border-rose-500 shadow-md ring-2 ring-rose-500/20'
            : 'bg-white border-slate-200/80 hover:border-rose-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Alerta Roja: Riesgo EH
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">
            {redPatients.length}
          </span>
          <span className="text-xs text-rose-600 font-medium">riesgo crítico hoy</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-rose-100/60 text-[11px] text-slate-600">
          <span>0 dep ≥48h / Confusión / Asterixis</span>
        </div>
      </button>

      {/* 3. Precaución / Ajuste de Lactulosa */}
      <button
        onClick={() => onSelectFilter('yellow')}
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
          activeFilter === 'yellow'
            ? 'bg-amber-50/50 border-amber-500 shadow-md ring-2 ring-amber-500/20'
            : 'bg-white border-slate-200/80 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Precaución: Titulación
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {yellowPatients.length}
          </span>
          <span className="text-xs text-amber-700 font-medium">fuera de ventana</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-amber-100/60 text-[11px] text-slate-600">
          <span>1 dep / Diarrea ≥4 / Somnolencia diurna</span>
        </div>
      </button>

      {/* 4. Prioridad Ronda Médica Rural */}
      <button
        onClick={() => onSelectFilter('ronda')}
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
          activeFilter === 'ronda'
            ? 'bg-teal-50/50 border-teal-600 shadow-md ring-2 ring-teal-500/20'
            : 'bg-white border-slate-200/80 hover:border-teal-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
            Prioridad Ronda Rural
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-teal-700">
            {rondaPriorityPatients.length}
          </span>
          <span className="text-xs text-teal-700 font-medium">visitas de rescate</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-teal-100/60 text-[11px] text-slate-600">
          <span>&gt;15 km huella + Alerta clínica / Sin sync</span>
        </div>
      </button>
    </div>
  );
};
