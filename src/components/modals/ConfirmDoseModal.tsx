import React, { useState } from 'react';
import { CheckCircle2, Clock, Pill, AlertCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DoseRecord } from '../../types';
import { storageService, formatTimeString } from '../../services/storageService';

interface ConfirmDoseModalProps {
  dose: DoseRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed?: () => void;
}

export const ConfirmDoseModal: React.FC<ConfirmDoseModalProps> = ({
  dose,
  isOpen,
  onClose,
  onConfirmed,
}) => {
  const [takenTime, setTakenTime] = useState(formatTimeString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !dose) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    const now = new Date();
    const [hours, minutes] = takenTime.split(':');
    now.setHours(parseInt(hours, 10) || 8, parseInt(minutes, 10) || 0, 0);

    storageService.confirmDose(dose.id, now.toISOString());

    // Fire celebratory confetti for adherence motivation!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0D9488', '#14B8A6', '#0284C7', '#38BDF8'],
      });
    } catch {
      // Confetti fallback safely ignored
    }

    setIsSubmitting(false);
    if (onConfirmed) onConfirmed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Confirm Medication Dose</h3>
              <p className="text-xs text-slate-500">Scheduled for {dose.scheduledTime}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100/70 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-slate-900 text-base">{dose.medicineName}</span>
              <span className="text-xs font-mono font-medium text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                {dose.dosage}
              </span>
            </div>
            {dose.instructions && (
              <p className="text-xs text-teal-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                <span>Instructions: {dose.instructions}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Actual Time Taken
            </label>
            <div className="relative">
              <input
                type="time"
                value={takenTime}
                onChange={e => setTakenTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Recorded timestamp confirms exact adherence for your personal timeline and authorized caregivers.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/60 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Dose Taken</span>
          </button>
        </div>
      </div>
    </div>
  );
};
