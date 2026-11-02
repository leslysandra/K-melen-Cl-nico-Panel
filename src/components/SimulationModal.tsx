import React, { useState } from 'react';
import { Zap, X, CheckCircle2, AlertOctagon, AlertTriangle, Radio, RefreshCw, Send } from 'lucide-react';
import { Patient, NeuroStatus, SyncSource } from '../types/clinical';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onApplySimulation: (patientId: string, updatedLog: {
    stools: number;
    lactuloseAdherence: boolean;
    neuroStatus: NeuroStatus;
    syncSource: SyncSource;
    symptomsNote: string;
  }) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  patients,
  onApplySimulation,
}) => {
  if (!isOpen) return null;

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[1]?.id || patients[0]?.id);
  const [stools, setStools] = useState<number>(1);
  const [lactuloseAdherence, setLactuloseAdherence] = useState<boolean>(true);
  const [neuroStatus, setNeuroStatus] = useState<NeuroStatus>('DROWSY');
  const [syncSource, setSyncSource] = useState<SyncSource>('cellular');
  const [symptomsNote, setSymptomsNote] = useState<string>('Reporte simulado desde teléfono rural vía señal móvil.');

  // Quick Presets
  const applyPreset = (presetType: 'rosa_deterioro' | 'rosa_mejoria' | 'segundo_rescate' | 'elba_recuperada') => {
    if (presetType === 'rosa_deterioro') {
      const p = patients.find((x) => x.id === 'pat-2');
      if (p) setSelectedPatientId(p.id);
      setStools(0);
      setLactuloseAdherence(false);
      setNeuroStatus('CONFUSED');
      setSyncSource('cellular');
      setSymptomsNote('Sra. Rosa: Hija Marta reporta desorientación y que no ha obrado en 24h. No tomó jarabe.');
    } else if (presetType === 'rosa_mejoria') {
      const p = patients.find((x) => x.id === 'pat-2');
      if (p) setSelectedPatientId(p.id);
      setStools(2);
      setLactuloseAdherence(true);
      setNeuroStatus('LUCID');
      setSyncSource('cellular');
      setSymptomsNote('Sra. Rosa: 2 deposiciones consistencia adecuada tras ajustar dosis. Despierta y orientada.');
    } else if (presetType === 'segundo_rescate') {
      const p = patients.find((x) => x.id === 'pat-1');
      if (p) setSelectedPatientId(p.id);
      setStools(2);
      setLactuloseAdherence(true);
      setNeuroStatus('DROWSY');
      setSyncSource('cellular');
      setSymptomsNote('Don Segundo: Sobrino Pedro administró 3 cucharadas de Lactulosa de rescate. Obró 2 veces.');
    } else if (presetType === 'elba_recuperada') {
      const p = patients.find((x) => x.id === 'pat-3');
      if (p) setSelectedPatientId(p.id);
      setStools(2);
      setLactuloseAdherence(true);
      setNeuroStatus('LUCID');
      setSyncSource('cellular');
      setSymptomsNote('Sra. Elba: Se redujo dosis en 50%. Diarrea cedió, 2 deposiciones formadas hoy.');
    }
  };

  const handleSimulate = () => {
    onApplySimulation(selectedPatientId, {
      stools,
      lactuloseAdherence,
      neuroStatus,
      syncSource,
      symptomsNote,
    });
    onClose();
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Simular Llegada de Reporte desde App Paciente
              </h2>
              <p className="text-xs text-slate-500">
                Prueba en vivo la respuesta del motor de Triage y Titulación de Lactulosa
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

        <div className="p-4 sm:p-6 space-y-4">
          {/* Quick 1-Click Clinical Presets */}
          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              Casos Clínicos de Prueba Rápida (1 Clic):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('rosa_deterioro')}
                className="p-2.5 text-left rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-xs transition-all cursor-pointer"
              >
                <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                  Sra. Rosa: Empeoramiento Agudo
                </div>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  0 deposiciones + Confusión/Asterixis (Pasa a ROJO)
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('rosa_mejoria')}
                className="p-2.5 text-left rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs transition-all cursor-pointer"
              >
                <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Sra. Rosa: Éxito Terapéutico
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  2 deposiciones + Lúcida (Pasa a VERDE)
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('segundo_rescate')}
                className="p-2.5 text-left rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-xs transition-all cursor-pointer"
              >
                <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Don Segundo: Respuesta a Rescate
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Obró 2 veces tras dosis de emergencia de sobrino
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('elba_recuperada')}
                className="p-2.5 text-left rounded-lg border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-xs transition-all cursor-pointer"
              >
                <div className="font-semibold text-teal-900 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                  Sra. Elba: Diarrea Controlada
                </div>
                <div className="text-[11px] text-teal-700 mt-0.5">
                  Bajó de 4+ a 2 deposiciones formadas (Pasa a VERDE)
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            {/* Patient Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paciente que envía el reporte:
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.socioDemographic.sector} - {p.socioDemographic.distanceKm} km)
                  </option>
                ))}
              </select>
            </div>

            {/* Stools count slider/buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Número de deposiciones hoy (Meta clínica: 2 a 3):
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStools(num)}
                    className={`py-2 text-center rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${
                      stools === num
                        ? num === 0
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : num === 1
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : num >= 4
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {num === 5 ? '5+' : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Medication adherence */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ¿Tomó su jarabe de Lactulosa prescrito?
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setLactuloseAdherence(true)}
                  className={`p-2.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    lactuloseAdherence
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  💊 Sí, tomó la dosis completa
                </button>
                <button
                  type="button"
                  onClick={() => setLactuloseAdherence(false)}
                  className={`p-2.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    !lactuloseAdherence
                      ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ❌ No tomó (Omitido / Intolerancia)
                </button>
              </div>
            </div>

            {/* Neurological status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estado Neurológico / Sensorio reportado:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setNeuroStatus('LUCID')}
                  className={`p-2.5 rounded-lg border font-medium text-center transition-all cursor-pointer ${
                    neuroStatus === 'LUCID'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  😊 Lúcido y claro
                </button>
                <button
                  type="button"
                  onClick={() => setNeuroStatus('DROWSY')}
                  className={`p-2.5 rounded-lg border font-medium text-center transition-all cursor-pointer ${
                    neuroStatus === 'DROWSY'
                      ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  😴 Somnoliento / Duerme de día
                </button>
                <button
                  type="button"
                  onClick={() => setNeuroStatus('CONFUSED')}
                  className={`p-2.5 rounded-lg border font-medium text-center transition-all cursor-pointer ${
                    neuroStatus === 'CONFUSED'
                      ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  😵 Confuso / Temblor (Asterixis)
                </button>
              </div>
            </div>

            {/* Sync source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canal de transmisión rural:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSyncSource('cellular')}
                  className={`p-2 rounded-lg border font-medium transition-all cursor-pointer text-center ${
                    syncSource === 'cellular'
                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  ☁️ Red Móvil 3G/4G
                </button>
                <button
                  type="button"
                  onClick={() => setSyncSource('qr_posta')}
                  className={`p-2 rounded-lg border font-medium transition-all cursor-pointer text-center ${
                    syncSource === 'qr_posta'
                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  📷 Escaneo QR en Posta
                </button>
                <button
                  type="button"
                  onClick={() => setSyncSource('offline')}
                  className={`p-2 rounded-lg border font-medium transition-all cursor-pointer text-center ${
                    syncSource === 'offline'
                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  📱 Guardado Offline
                </button>
              </div>
            </div>

            {/* Symptoms note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nota de voz / Observación del cuidador:
              </label>
              <input
                type="text"
                value={symptomsNote}
                onChange={(e) => setSymptomsNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Se actualizará la base de datos local y se recalculará el semáforo al instante.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSimulate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inyectar Reporte en Vivo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
