import React from 'react';
import { Patient } from '../types/clinical';
import { calculateTriageStatus, calculateRuralPriorityScore, getPatientLatestLog } from '../utils/triageEngine';
import { AlertOctagon, AlertTriangle, CheckCircle2, MapPin, WifiOff, Volume2, Truck } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  searchQuery,
  onSearchChange,
}) => {
  // Sort patients by rural priority score descending
  const sortedPatients = [...patients].sort((a, b) => {
    const scoreA = calculateRuralPriorityScore(a).score;
    const scoreB = calculateRuralPriorityScore(b).score;
    return scoreB - scoreA;
  });

  const filteredPatients = sortedPatients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.rut.toLowerCase().includes(q) ||
      p.socioDemographic.sector.toLowerCase().includes(q) ||
      p.socioDemographic.assignedPosta.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header and Search */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pacientes Priorizados ({filteredPatients.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Riesgo × Distancia Rural
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, RUT o sector..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs pl-3 pr-3 py-2 bg-white rounded-lg border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Patient rows list */}
      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-[780px]">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No se encontraron pacientes para este filtro o búsqueda.
          </div>
        ) : (
          filteredPatients.map((patient, index) => {
            const status = calculateTriageStatus(patient);
            const priority = calculateRuralPriorityScore(patient);
            const latest = getPatientLatestLog(patient);
            const isSelected = patient.id === selectedPatientId;

            return (
              <button
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className={`w-full text-left p-3.5 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-teal-50/80 border-l-4 border-l-teal-600'
                    : 'hover:bg-slate-50/90 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        index === 0
                          ? 'bg-rose-600 text-white shadow-xs'
                          : index === 1
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                      title={`Prioridad en Ronda Rural: Puesto #${index + 1}`}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1">
                      {patient.name}
                    </h3>
                  </div>

                  {/* Status indicator badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                      status === 'RED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : status === 'YELLOW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {status === 'RED' && <AlertOctagon className="w-3 h-3 text-rose-600" />}
                    {status === 'YELLOW' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    {status === 'GREEN' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    <span>{status === 'RED' ? 'Alerta Roja' : status === 'YELLOW' ? 'Precaución' : 'Estable'}</span>
                  </span>
                </div>

                {/* Subtitle with clinical classification */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>{patient.age} años</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-600">{patient.rut}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-700">Child-Pugh {patient.childPugh.class} ({patient.childPugh.score})</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-600">MELD-Na {patient.meldNa}</span>
                </div>

                {/* Key clinical finding of the day */}
                <div className="bg-slate-100/80 rounded-md p-2 text-xs mb-2">
                  <div className="flex items-center justify-between text-slate-700 font-medium">
                    <span className="flex items-center gap-1">
                      <span>Deposiciones hoy:</span>
                      <strong
                        className={`font-mono text-xs ${
                          latest.stools === 0
                            ? 'text-rose-600 font-bold'
                            : latest.stools >= 4
                            ? 'text-amber-600 font-bold'
                            : latest.stools === 1
                            ? 'text-amber-600 font-bold'
                            : 'text-emerald-700 font-bold'
                        }`}
                      >
                        {latest.stools} {latest.stools === 1 ? 'vez' : 'veces'}
                      </strong>
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        latest.neuroStatus === 'CONFUSED'
                          ? 'text-rose-700'
                          : latest.neuroStatus === 'DROWSY'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {latest.neuroStatus === 'CONFUSED'
                        ? 'Confusión / Asterixis'
                        : latest.neuroStatus === 'DROWSY'
                        ? 'Somnoliento / Inversión'
                        : 'Lúcido'}
                    </span>
                  </div>

                  {latest.symptomsNote && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                      "{latest.symptomsNote}"
                    </p>
                  )}
                </div>

                {/* Rural context indicators */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{patient.socioDemographic.distanceKm} km · {patient.socioDemographic.roadType.split(' ')[0]}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {patient.socioDemographic.languagePreference === 'Mapuzungun' && (
                      <span className="text-[10px] font-medium text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Volume2 className="w-2.5 h-2.5" />
                        Mapuzungun
                      </span>
                    )}
                    {patient.inRondaRuralRoute && (
                      <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-1" title="Incluido en Hoja de Ronda Rural">
                        <Truck className="w-2.5 h-2.5" />
                        Ronda
                      </span>
                    )}
                    {patient.lastSync.hoursAgo >= 48 && (
                      <span className="text-[10px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1" title="Más de 48h sin sincronizar">
                        <WifiOff className="w-2.5 h-2.5" />
                        {patient.lastSync.hoursAgo}h
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
