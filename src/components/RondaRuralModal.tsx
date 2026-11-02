import React from 'react';
import { Truck, MapPin, User, Calendar, CheckCircle2, AlertOctagon, X, Printer, Phone } from 'lucide-react';
import { Patient } from '../types/clinical';
import { calculateTriageStatus } from '../utils/triageEngine';

interface RondaRuralModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onTogglePatientRonda: (patientId: string) => void;
}

export const RondaRuralModal: React.FC<RondaRuralModalProps> = ({
  isOpen,
  onClose,
  patients,
  onTogglePatientRonda,
}) => {
  if (!isOpen) return null;

  const rondaPatients = patients
    .filter((p) => p.inRondaRuralRoute)
    .sort((a, b) => (a.rondaPriorityOrder || 99) - (b.rondaPriorityOrder || 99));

  const totalKm = rondaPatients.reduce((sum, p) => sum + p.socioDemographic.distanceKm, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hoja de Ruta — Ronda Médica Rural de Rescate
              </h2>
              <p className="text-xs text-slate-500">
                Servicio de Salud Araucanía Sur • Móvil 4x4 N° 3 (Salida: 08:15 hrs)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Metadata Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">Equipo Asignado:</span>
              <p className="font-semibold text-slate-800">
                Dra. C. Morales + TENS M. Curiche
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">Vehículo & Chofer:</span>
              <p className="font-semibold text-slate-800">
                Camioneta 4x4 (Don Raúl Antileo)
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">Ruta Estimada:</span>
              <p className="font-semibold text-slate-800 font-mono">
                {rondaPatients.length} visitas · ~{totalKm} km ida/vuelta
              </p>
            </div>
          </div>

          {/* Patient Itinerary */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Paradas Programadas por Prioridad Clínica & Geográfica:
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {rondaPatients.length} en hoja de ruta
              </span>
            </div>

            <div className="space-y-2.5">
              {rondaPatients.map((patient, idx) => {
                const status = calculateTriageStatus(patient);

                return (
                  <div
                    key={patient.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{patient.name}</h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              status === 'RED'
                                ? 'bg-rose-100 text-rose-800'
                                : status === 'YELLOW'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {status === 'RED' ? '🔴 Riesgo Agudo' : status === 'YELLOW' ? '🟡 Ajuste Dosis' : '🟢 Control'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {patient.socioDemographic.sector} ({patient.socioDemographic.distanceKm} km)
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 font-medium">
                            {patient.socioDemographic.roadType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5">
                          <Phone className="w-3 h-3 text-teal-600" />
                          <span>
                            Cuidador: <strong>{patient.socioDemographic.caregiver.name}</strong> ({patient.socioDemographic.caregiver.phone})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span className="text-[11px] font-mono text-slate-500">
                        Puesto {idx + 1} de ruta
                      </span>
                      <button
                        onClick={() => onTogglePatientRonda(patient.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium hover:underline cursor-pointer"
                      >
                        Quitar de ruta
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add more patients section */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Otros Pacientes Disponibles para Añadir:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {patients
                .filter((p) => !p.inRondaRuralRoute)
                .map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => onTogglePatientRonda(patient.id)}
                    className="p-2.5 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{patient.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {patient.socioDemographic.sector} ({patient.socioDemographic.distanceKm} km)
                      </p>
                    </div>
                    <span className="text-indigo-600 font-medium shrink-0 ml-2">
                      + Añadir
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Vehículo equipado con kit de Lactulosa, enemas, sonda nasogástrica y solución glucosalina.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
            >
              Guardar Hoja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
