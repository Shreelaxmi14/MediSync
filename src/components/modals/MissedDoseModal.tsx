import React, { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { DoseRecord } from '../../types';
import { storageService } from '../../services/storageService';

interface MissedDoseModalProps {
  dose: DoseRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRecorded?: () => void;
}

const COMMON_REASONS = [
  'Forgot / routine interrupted',
  'Felt fine / decided to skip',
  'Experienced side effects / nausea',
  'Away from home / left meds behind',
  'Ran out of medication / refill pending',
  'Doctor or clinic advised temporary hold',
  'Stomach sensitivity / missed meal',
  'Other personal reason',
];

export const MissedDoseModal: React.FC<MissedDoseModalProps> = ({
  dose,
  isOpen,
  onClose,
  onRecorded,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !dose) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    storageService.markDoseMissed(dose.id, selectedReason, customNote.trim() || undefined);
    setIsSubmitting(false);
    if (onRecorded) onRecorded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Record Missed Medication Dose</h3>
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
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="font-medium text-slate-900 text-sm">{dose.medicineName}</span>
            <span className="text-xs text-slate-500 ml-2">· {dose.dosage}</span>
            <p className="text-xs text-slate-500 mt-1">
              Tracking why doses are missed helps understand adherence patterns and alerts caregivers if needed.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Reason for Missing this Dose
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_REASONS.map(reason => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`flex items-start gap-2 p-2.5 rounded-xl text-left text-xs transition-colors border ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="leading-tight">{reason}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Additional Note for Yourself or Caregiver (Optional)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="e.g., Felt nauseated after breakfast, plan to resume tomorrow..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs transition-colors"
          >
            Record Missed Dose
          </button>
        </div>
      </div>
    </div>
  );
};
