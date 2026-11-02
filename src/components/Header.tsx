import React from 'react';
import { Activity, Zap, QrCode, FileText, Shield, MapPin } from 'lucide-react';

interface HeaderProps {
  onOpenSimulation: () => void;
  onOpenQrScanner: () => void;
  onOpenRayenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSimulation,
  onOpenQrScanner,
  onOpenRayenExport,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Sutil guarda geométrica Mapuche (Ñimin / Güemil estilizado intercultural) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-700 via-amber-600 via-rose-700 to-teal-800 relative overflow-hidden">
        <svg
          className="w-full h-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <pattern id="guemil-pattern" width="24" height="6" patternUnits="userSpaceOnUse">
            <path
              d="M0 3 L6 0 L12 3 L6 6 Z M12 3 L18 0 L24 3 L18 6 Z"
              fill="rgba(255,255,255,0.7)"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#guemil-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand identity zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600/90 flex items-center justify-center text-white shadow-inner shrink-0 border border-teal-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Kümelen Clínico
              </h1>
              <span className="text-xs font-medium text-teal-300/90 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                Red Asistencial Araucanía Sur
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" />
                CESFAM Nodal • Postas Rurales
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              Panel de Triage de Encefalopatía Hepática, Titulación de Lactulosa y Priorización de Ronda Rural
            </p>
          </div>
        </div>

        {/* 3 Critical action buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            onClick={onOpenSimulation}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-teal-400 cursor-pointer"
            title="Simula cómo entra un nuevo reporte desde el teléfono de un paciente rural"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span className="whitespace-nowrap">Simular Reporte App</span>
          </button>

          <button
            onClick={onOpenQrScanner}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
            title="Escanear tarjeta QR óptica traída por el paciente a la Posta sin internet"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-300" />
            <span className="whitespace-nowrap">Escanear Pase QR</span>
          </button>

          <button
            onClick={onOpenRayenExport}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
            title="Generar formato compatible con Ficha Clínica RAYEN / SIDRA MINSAL"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span className="whitespace-nowrap">Exportar Ficha RAYEN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
