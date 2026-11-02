import React, { useState } from 'react';
import { INITIAL_PATIENTS } from './data/mockPatients';
import { Patient, DailyLog, TriageStatus, NeuroStatus, SyncSource } from './types/clinical';
import { Header } from './components/Header';
import { KpiCards, FilterType } from './components/KpiCards';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { SimulationModal } from './components/SimulationModal';
import { QrScannerModal } from './components/QrScannerModal';
import { RayenExportModal } from './components/RayenExportModal';
import { AudioPrescriptionModal } from './components/AudioPrescriptionModal';
import { RondaRuralModal } from './components/RondaRuralModal';
import { calculateTriageStatus, calculateRuralPriorityScore } from './utils/triageEngine';
import { CheckCircle2, ChevronLeft, AlertCircle } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0].id);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  // Modals state
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isRayenModalOpen, setIsRayenModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isRondaModalOpen, setIsRondaModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Currently selected patient
  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const triageStatus = calculateTriageStatus(selectedPatient);

  // Filtered patients based on active KPI filter
  const filteredPatients = patients.filter((patient) => {
    const status = calculateTriageStatus(patient);
    if (activeFilter === 'red') return status === 'RED';
    if (activeFilter === 'yellow') return status === 'YELLOW';
    if (activeFilter === 'ronda') {
      const isFar = patient.socioDemographic.distanceKm >= 15;
      const isBadRoad = patient.socioDemographic.roadDifficultyWeight >= 1.3;
      const hasAlert = status !== 'GREEN' || patient.lastSync.hoursAgo >= 48;
      return (isFar && isBadRoad && hasAlert) || patient.inRondaRuralRoute;
    }
    return true;
  });

  // Handle simulation injection
  const handleApplySimulation = (
    patientId: string,
    updated: {
      stools: number;
      lactuloseAdherence: boolean;
      neuroStatus: NeuroStatus;
      syncSource: SyncSource;
      symptomsNote: string;
    }
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const updatedLogs = [...p.logs];
        const lastIdx = updatedLogs.length - 1;
        updatedLogs[lastIdx] = {
          ...updatedLogs[lastIdx],
          stools: updated.stools,
          lactuloseAdherence: updated.lactuloseAdherence,
          neuroStatus: updated.neuroStatus,
          syncSource: updated.syncSource,
          symptomsNote: updated.symptomsNote,
          syncTime: new Date().toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        return {
          ...p,
          logs: updatedLogs,
          lastSync: {
            timestamp: `Hoy, ${new Date().toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
            })} hrs (Simulación en vivo)`,
            method: updated.syncSource,
            hoursAgo: 0,
          },
        };
      })
    );

    setSelectedPatientId(patientId);
    setMobileTab('detail');
    showToast(
      `Nuevo reporte registrado para ${selectedPatient.name}. El semáforo y protocolo CDS se han actualizado.`
    );
  };

  // Handle QR code offline data import
  const handleImportQrData = (patientId: string, importedLogs: DailyLog[]) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          logs: importedLogs,
          lastSync: {
            timestamp: `Hoy, ${new Date().toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
            })} hrs (Pase QR Óptico en Posta)`,
            method: 'qr_posta',
            hoursAgo: 0,
          },
        };
      })
    );

    setSelectedPatientId(patientId);
    setMobileTab('detail');
    showToast(
      `¡7 días de registros importados exitosamente vía QR para ${
        patients.find((p) => p.id === patientId)?.name || 'el paciente'
      }!`
    );
  };

  // Quick state toggle (e.g. for Sra. Rosa testing or any patient)
  const handleQuickChangeStatus = (patientId: string, targetStatus: TriageStatus) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const updatedLogs = [...p.logs];
        const lastIdx = updatedLogs.length - 1;

        if (targetStatus === 'GREEN') {
          updatedLogs[lastIdx] = {
            ...updatedLogs[lastIdx],
            stools: 2,
            lactuloseAdherence: true,
            neuroStatus: 'LUCID',
            symptomsNote: 'Simulación: Estado óptimo (2 deposiciones, lúcido).',
          };
        } else if (targetStatus === 'YELLOW') {
          const isElba = p.id === 'pat-3';
          updatedLogs[lastIdx] = {
            ...updatedLogs[lastIdx],
            stools: isElba ? 4 : 1,
            lactuloseAdherence: true,
            neuroStatus: isElba ? 'LUCID' : 'DROWSY',
            symptomsNote: isElba
              ? 'Simulación: Sobre-titulación de lactulosa con 4 deposiciones líquidas.'
              : 'Simulación: 1 sola deposición y somnolencia diurna.',
          };
        } else {
          // RED
          updatedLogs[lastIdx] = {
            ...updatedLogs[lastIdx],
            stools: 0,
            lactuloseAdherence: false,
            neuroStatus: 'CONFUSED',
            symptomsNote: 'Simulación: 0 deposiciones, confusión y asterixis agudo.',
          };
          // Also set previous day to 0 stools to trigger >=48h rule if needed
          if (updatedLogs.length >= 2) {
            updatedLogs[lastIdx - 1] = {
              ...updatedLogs[lastIdx - 1],
              stools: 0,
            };
          }
        }

        return {
          ...p,
          logs: updatedLogs,
        };
      })
    );

    showToast(
      `Semáforo de ${
        patients.find((p) => p.id === patientId)?.name
      } actualizado a ${
        targetStatus === 'RED'
          ? '🔴 Alerta Roja'
          : targetStatus === 'YELLOW'
          ? '🟡 Precaución'
          : '🟢 Estable'
      }`
    );
  };

  // Add clinical note
  const handleAddClinicalNote = (patientId: string, noteText: string) => {
    const newNote = {
      id: `cn-${Date.now()}`,
      author: 'Dra. Camila Morales',
      role: 'Médico EDF / CESFAM Nodal',
      date: `${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString(
        'es-CL',
        { hour: '2-digit', minute: '2-digit' }
      )}`,
      text: noteText,
      actionTaken: 'Evolución registrada en ficha',
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          clinicalNotes: [newNote, ...p.clinicalNotes],
        };
      })
    );

    showToast('Nota clínica guardada exitosamente en la ficha del paciente.');
  };

  // Toggle patient in rural round
  const handleTogglePatientRonda = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const newInRonda = !p.inRondaRuralRoute;
        return {
          ...p,
          inRondaRuralRoute: newInRonda,
          rondaPriorityOrder: newInRonda ? 1 : undefined,
        };
      })
    );

    const targetPatient = patients.find((p) => p.id === patientId);
    showToast(
      targetPatient?.inRondaRuralRoute
        ? `${targetPatient.name} retirado de la Hoja de Ruta de Ronda Rural.`
        : `${targetPatient?.name} agregado a la Hoja de Ruta de Ronda Rural.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenRayenExport={() => setIsRayenModalOpen(true)}
      />

      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white text-xs p-4 rounded-xl shadow-2xl border border-slate-700 flex items-start gap-2.5 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Notificación Clínica:</span>
            <span className="text-slate-300">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-1 text-sm leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col">
        {/* KPI Cards (4 1-touch filter cards) */}
        <KpiCards
          patients={patients}
          activeFilter={activeFilter}
          onSelectFilter={(filter) => {
            setActiveFilter(filter);
            setMobileTab('list');
          }}
        />

        {/* Mobile View Toggle Switch (Smartphone responsiveness) */}
        <div className="lg:hidden flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 mb-4 shadow-xs">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'list'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lista de Pacientes ({filteredPatients.length})
          </button>
          <button
            onClick={() => setMobileTab('detail')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'detail'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ficha: {selectedPatient.name.split(' ')[0]} {selectedPatient.name.split(' ')[1]}
          </button>
        </div>

        {/* 2-Column Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Prioritized Patient List (4 cols on desktop) */}
          <div
            className={`lg:col-span-4 lg:block ${
              mobileTab === 'list' ? 'block' : 'hidden'
            }`}
          >
            <PatientList
              patients={filteredPatients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                setMobileTab('detail');
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Right Column: Detailed Patient Clinical View (8 cols on desktop) */}
          <div
            className={`lg:col-span-8 lg:block ${
              mobileTab === 'detail' ? 'block' : 'hidden'
            }`}
          >
            {/* Mobile back to list helper */}
            <div className="lg:hidden mb-3">
              <button
                onClick={() => setMobileTab('list')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Volver a la lista de pacientes</span>
              </button>
            </div>

            <PatientDetail
              patient={selectedPatient}
              onOpenAudioModal={() => setIsAudioModalOpen(true)}
              onOpenRondaModal={() => setIsRondaModalOpen(true)}
              onToggleRonda={() => handleTogglePatientRonda(selectedPatient.id)}
              onAddClinicalNote={handleAddClinicalNote}
              onQuickChangeStatus={handleQuickChangeStatus}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        patients={patients}
        onApplySimulation={handleApplySimulation}
      />

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        patients={patients}
        onImportQrData={handleImportQrData}
      />

      <RayenExportModal
        isOpen={isRayenModalOpen}
        onClose={() => setIsRayenModalOpen(false)}
        patient={selectedPatient}
        triageStatus={triageStatus}
      />

      <AudioPrescriptionModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        patient={selectedPatient}
        onSentSuccess={showToast}
      />

      <RondaRuralModal
        isOpen={isRondaModalOpen}
        onClose={() => setIsRondaModalOpen(false)}
        patients={patients}
        onTogglePatientRonda={handleTogglePatientRonda}
      />

      {/* Footer with institutional acknowledgement */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 px-4 sm:px-6 lg:px-8 mt-10 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-slate-300">
              Kümelen Clínico
            </span>
            <span aria-hidden="true">·</span>
            <span>Servicio de Salud Araucanía Sur</span>
            <span aria-hidden="true">·</span>
            <span>Hepatología & Atención Primaria Rural Intercultural</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Protocolo de Prevención de Encefalopatía Hepática en Población Rural Mapuche
          </div>
        </div>
      </footer>
    </div>
  );
}
