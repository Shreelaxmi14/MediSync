import React, { useState } from 'react';
import {
  Bell,
  Volume2,
  Clock,
  Type,
  Shield,
  Save,
  Check
} from 'lucide-react';
import { PatientProfile, UserSettings } from '../../types';
import { storageService } from '../../services/storageService';

interface PatientSettingsProps {
  patient: PatientProfile;
}

export const PatientSettings: React.FC<PatientSettingsProps> = ({ patient }) => {
  const [settings, setSettings] = useState<UserSettings>(() =>
    storageService.getSettings(patient.userId)
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateSettings(patient.userId, settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              User Preferences
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Settings & Accessibility</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure medication reminder timing, alert sounds, and display preferences
          </p>
        </div>

        {isSaved && (
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-teal-600" /> Settings updated
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Medication Reminder Timing */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">Medication Reminders Timing</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Advance Notification Window
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { mins: 0, label: 'At dose time' },
                { mins: 15, label: '15 mins before' },
                { mins: 30, label: '30 mins before' },
                { mins: 60, label: '1 hour before' },
              ].map(opt => (
                <button
                  key={opt.mins}
                  type="button"
                  onClick={() => setSettings({ ...settings, reminderAdvanceMinutes: opt.mins })}
                  className={`p-3 rounded-xl border text-xs text-left transition-colors ${
                    settings.reminderAdvanceMinutes === opt.mins
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Controls when early dose reminders appear prior to your prescribed time.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                Audible Alert Chime
              </span>
              <span className="text-[11px] text-slate-500">
                Play gentle chime when it is time to take your medication
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={e => setSettings({ ...settings, soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-teal-600 rounded"
            />
          </div>
        </div>

        {/* Accessibility & Typography */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">Display & Senior Accessibility</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Text & Interface Scale
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, fontSize: 'normal' })}
                className={`p-3 rounded-xl border text-xs text-left transition-colors ${
                  settings.fontSize === 'normal'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Standard (15px)
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, fontSize: 'large' })}
                className={`p-3 rounded-xl border text-xs text-left transition-colors ${
                  settings.fontSize === 'large'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Large Readable (Senior)
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Larger fonts provide high readability and larger touch target buttons.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
