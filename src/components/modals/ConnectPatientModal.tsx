import React, { useState } from 'react';
import { UserPlus, ShieldCheck, X } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ConnectPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiverId: string;
  onConnected?: () => void;
}

export const ConnectPatientModal: React.FC<ConnectPatientModalProps> = ({
  isOpen,
  onClose,
  caregiverId,
  onConnected,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!inviteCode.trim()) {
      setError('Please enter a patient invite code.');
      return;
    }

    setIsSubmitting(true);
    const result = storageService.connectPatientWithInviteCode(caregiverId, inviteCode);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        if (onConnected) onConnected();
        onClose();
      }, 1200);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Connect with Patient</h3>
              <p className="text-xs text-slate-500">Enter authorized invite code provided by the patient</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Patient Invite Code
            </label>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. EV-8842 or RM-3319"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-wider uppercase text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:normal-case placeholder:font-sans"
            />
            <p className="text-xs text-slate-500 mt-1">
              Ask your patient for their 6-character code found on their Caregiver Connection tab.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Consent-Based Sharing</span>
            </div>
            <p>
              MediSync strictly enforces patient privacy. You will only see schedules and adherence metrics that the patient has explicitly consented to share.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
            >
              Connect Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
