import React, { useState } from 'react';
import { FileText, Copy, Check, Printer, X, Download, ShieldCheck } from 'lucide-react';
import { Patient, TriageStatus } from '../types/clinical';
import { generateRayenSummary } from '../utils/triageEngine';

interface RayenExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  triageStatus: TriageStatus;
}

export const RayenExportModal: React.FC<RayenExportModalProps> = ({
  isOpen,
  onClose,
  patient,
  triageStatus,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const formattedSummary = generateRayenSummary(patient, triageStatus);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Exportar Evolución Clínica para RAYEN / SIDRA
              </h2>
              <p className="text-xs text-slate-500">
                Formato oficial MINSAL • Red de Atención Primaria Araucanía Sur
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
          <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Copia este bloque estandarizado y pégalo directamente en la sección{' '}
                <strong>"Evolución / Indicaciones"</strong> de la Ficha RAYEN del paciente.
              </span>
            </div>
          </div>

          {/* Formatted Textarea / Monospace Container */}
          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-[380px] border border-slate-800 whitespace-pre-wrap select-all">
              {formattedSummary}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Paciente: <strong>{patient.name}</strong> ({patient.rut})
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition-all cursor-pointer ${
                copied ? 'bg-emerald-600' : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado para RAYEN!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar al Portapapeles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
