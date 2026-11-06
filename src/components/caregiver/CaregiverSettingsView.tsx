import React, { useState } from 'react';
import { Bell, ShieldCheck, Save, Check } from 'lucide-react';
import { CaregiverProfile } from '../../types';

interface CaregiverSettingsViewProps {
  caregiver: CaregiverProfile;
}

export const CaregiverSettingsView: React.FC<CaregiverSettingsViewProps> = ({ caregiver }) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [missedAlertThreshold, setMissedAlertThreshold] = useState(1); // alert after 1 missed dose
  const [weeklyAdherenceThreshold, setWeeklyAdherenceThreshold] = useState(80); // alert if <80%
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
              Caregiver Configuration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Alert Preferences & Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure clinical notification rules and adherence threshold alerts
          </p>
        </div>

        {isSaved && (
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-teal-600" /> Preferences saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Threshold Rules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Adherence Alert Thresholds</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Missed Dose Trigger
            </label>
            <select
              value={missedAlertThreshold}
              onChange={e => setMissedAlertThreshold(parseInt(e.target.value, 10))}
              className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
            >
              <option value={1}>Immediate (Alert after 1st reported missed dose)</option>
              <option value={2}>After 2 consecutive missed doses</option>
              <option value={3}>After 3 missed doses within 48 hours</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              MediSync will generate a notification when a connected patient records missed doses reaching this threshold.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adherence Drop Warning Level
            </label>
            <select
              value={weeklyAdherenceThreshold}
              onChange={e => setWeeklyAdherenceThreshold(parseInt(e.target.value, 10))}
              className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
            >
              <option value={85}>Alert if weekly adherence drops below 85%</option>
              <option value={80}>Alert if weekly adherence drops below 80% (Clinical standard)</option>
              <option value={75}>Alert if weekly adherence drops below 75%</option>
            </select>
          </div>
        </div>

        {/* Communication Channels */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Delivery Channels</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Email Daily Digest</span>
                <span className="text-[11px] text-slate-500">
                  Receive a daily morning summary of all connected patients' adherence
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">SMS Critical Alerts</span>
                <span className="text-[11px] text-slate-500">
                  Receive text messages when emergency unconfirmed dose windows expire
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
