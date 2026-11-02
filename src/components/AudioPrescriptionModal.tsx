import React, { useState } from 'react';
import { Volume2, Play, Square, Send, CheckCircle2, Globe, Sparkles, X } from 'lucide-react';
import { Patient } from '../types/clinical';

interface AudioPrescriptionModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSentSuccess: (messageSummary: string) => void;
}

interface AudioPreset {
  id: string;
  title: string;
  clinicalType: 'aumentar' | 'reducir' | 'mantener' | 'urgente';
  spanishText: string;
  mapuzungunText: string;
}

export const AudioPrescriptionModal: React.FC<AudioPrescriptionModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSentSuccess,
}) => {
  if (!isOpen) return null;

  const presets: AudioPreset[] = [
    {
      id: 'subir_dosis',
      title: 'Aumentar Lactulosa (+10 mL / 1 cucharada adicional)',
      clinicalType: 'aumentar',
      spanishText: `Mari mari ${patient.name.split(' ')[0]} ${patient.name.split(' ')[1]}. Le habla el equipo médico del CESFAM. Le pedimos aumentar una cucharada sopera más de su jarabe de Lactulosa con agua o té de hierbas hoy. La meta es que pueda obrar 2 a 3 veces al baño para que su mente siga despejada y sus manos no tiemblen.`,
      mapuzungunText: `Mari mari lamngen. Fütra küme mongen. Yenie tufa chi lawen Lactulosa, doykünunge kiñe cucharada aliwen ko mew, fey mew küme miyawaimi, amuleai tami küme rakiduam ka tremon.`,
    },
    {
      id: 'bajar_dosis',
      title: 'Reducir Lactulosa (Diarrea 4+ / Cuidar riñones)',
      clinicalType: 'reducir',
      spanishText: `Mari mari ${patient.name.split(' ')[0]} ${patient.name.split(' ')[1]}. El equipo médico le indica bajar a la mitad su jarabe de Lactulosa hoy porque está yendo más de 4 veces al baño. Beba bastante agua o infusión para hidratarse y cuidar sus riñones hasta que las deposiciones sean blandas.`,
      mapuzungunText: `Mari mari lamngen. Yenie tufa chi lawen pichiñma mew, tami rüpü poyengei. Pütunge ko aliwen, küme mongen tami piwke ka tami kuram, fey mew weñangkelayaymi.`,
    },
    {
      id: 'mantener_dosis',
      title: 'Mantener Esquema (Ventana óptima 2-3 veces)',
      clinicalType: 'mantener',
      spanishText: `Mari mari ${patient.name.split(' ')[0]}. Felicitaciones por su constancia. Su cuerpo está funcionando perfecto con 2 a 3 veces al baño al día. Siga tomando la misma dosis de jarabe todos los días a la misma hora.`,
      mapuzungunText: `Mari mari peñi. Küme mongen, feyentunge tami lawen, kiñeprou küme rüpü nieymi. Feymew feyentuleaymi tami amun lawen mew.`,
    },
    {
      id: 'urgente_cuidador',
      title: 'Rescate Urgente Cuidador (Encefalopatía en curso)',
      clinicalType: 'urgente',
      spanishText: `Aviso urgente para ${patient.socioDemographic.caregiver.name}: Don ${patient.name.split(' ')[1]} lleva más de 48 horas sin obrar y presenta somnolencia y temblor. Debe administrarle 3 cucharadas soperas de Lactulosa de inmediato y avisar a la Posta ${patient.socioDemographic.assignedPosta}.`,
      mapuzungunText: `Mari mari ${patient.socioDemographic.caregiver.name}. Tüfa küpa feypien: ${patient.name.split(' ')[1]} trülke tranan niey, ngelay rüpü. Elunge lawen fewla, fey kintunge tami Posta ruka fey mew witruntukuaymi.`,
    },
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(presets[0].id);
  const [activeLanguage, setActiveLanguage] = useState<'both' | 'es' | 'map'>('both');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

  const handlePlayVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Síntesis de voz no disponible en este navegador.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    if (activeLanguage === 'both') {
      textToSpeak = `${selectedPreset.spanishText}. En mapuzungun: ${selectedPreset.mapuzungunText}`;
    } else if (activeLanguage === 'es') {
      textToSpeak = selectedPreset.spanishText;
    } else {
      textToSpeak = selectedPreset.mapuzungunText;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-CL';
    utterance.rate = 0.92; // slightly slower cadence for rural accessibility
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = () => {
    setIsSending(true);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }

    setTimeout(() => {
      setIsSending(false);
      onSentSuccess(
        `Instrucción enviada por audio al teléfono de ${patient.name}: "${selectedPreset.title}". Se sincronizará apenas capte señal celular o Wi-Fi en Posta.`
      );
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ajuste de Dosis por Audio Intercultural
              </h2>
              <p className="text-xs text-slate-500">
                Paciente: <span className="font-semibold text-slate-700">{patient.name}</span> ({patient.socioDemographic.languagePreference})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlaying) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Target Audience context notice */}
          <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-100 flex items-start gap-2.5 text-xs text-teal-900">
            <Globe className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Pertinencia Cultural Araucanía:</strong>{' '}
              {patient.socioDemographic.languagePreference === 'Mapuzungun'
                ? 'El paciente utiliza la interfaz por voz. El mensaje se reproduce automáticamente al abrir la app o cuando el cuidador recibe la notificación de rescate.'
                : 'El paciente es bilingüe. Se envía versión en Español con saludo y refuerzo en Mapuzungun para mayor adherencia y vínculo terapéutico.'}
            </div>
          </div>

          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Seleccionar Indicación Médica:
            </label>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    if (isPlaying) {
                      window.speechSynthesis.cancel();
                      setIsPlaying(false);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                    selectedPresetId === preset.id
                      ? 'bg-teal-50 border-teal-600 shadow-xs ring-1 ring-teal-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        preset.clinicalType === 'urgente'
                          ? 'bg-rose-500'
                          : preset.clinicalType === 'aumentar'
                          ? 'bg-amber-500'
                          : preset.clinicalType === 'reducir'
                          ? 'bg-orange-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-semibold text-slate-900">{preset.title}</span>
                  </div>
                  {selectedPresetId === preset.id && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Audio script preview cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Guion de Audio que Escuchará el Paciente:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px]">
                <button
                  onClick={() => setActiveLanguage('both')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeLanguage === 'both' ? 'bg-white font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Bilingüe
                </button>
                <button
                  onClick={() => setActiveLanguage('es')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeLanguage === 'es' ? 'bg-white font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Solo Español
                </button>
                <button
                  onClick={() => setActiveLanguage('map')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeLanguage === 'map' ? 'bg-white font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Solo Mapuzungun
                </button>
              </div>
            </div>

            {/* Spanish script */}
            {(activeLanguage === 'both' || activeLanguage === 'es') && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Audio en Español (Voz Médica CESFAM):
                </span>
                <p className="text-slate-800 leading-relaxed font-sans">
                  "{selectedPreset.spanishText}"
                </p>
              </div>
            )}

            {/* Mapuzungun script */}
            {(activeLanguage === 'both' || activeLanguage === 'map') && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Audio en Mapuzungun (Pertinencia Intercultural):
                </span>
                <p className="text-amber-950 font-sans leading-relaxed italic">
                  "{selectedPreset.mapuzungunText}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handlePlayVoice}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isPlaying
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>Detener Reproducción</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                <span>Escuchar Audio de Muestra</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if (isPlaying) window.speechSynthesis.cancel();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Transmitiendo...' : 'Enviar al Teléfono Rural'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
