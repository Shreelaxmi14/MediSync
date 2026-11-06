import React, { useState } from 'react';
import { Heart, Send, Sparkles, X } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface SendNudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiverId: string;
  patientId: string;
  patientName: string;
  onSent?: () => void;
}

const TEMPLATES = [
  'Great job completing your morning routine today! Keep up the great consistency.',
  'Just a gentle reminder to take your evening medication with dinner.',
  'Thinking of you! Remember to drink plenty of water with your doses today.',
  'Checking in on how you are feeling after your latest dose.',
];

export const SendNudgeModal: React.FC<SendNudgeModalProps> = ({
  isOpen,
  onClose,
  caregiverId,
  patientId,
  patientName,
  onSent,
}) => {
  const [message, setMessage] = useState(TEMPLATES[0]);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    storageService.sendCaregiverNudge(caregiverId, patientId, message.trim());
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      if (onSent) onSent();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-teal-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Send Cheer or Reminder</h3>
              <p className="text-xs text-slate-500">To {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4">
          {sentSuccess && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Message sent to {patientName}!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quick Suggestions
            </label>
            <div className="space-y-1.5">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(tmpl)}
                  className="w-full text-left p-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-200 text-xs text-slate-700 transition-colors"
                >
                  "{tmpl}"
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Personal Note
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sentSuccess}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
