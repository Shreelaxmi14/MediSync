import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Pill,
  TrendingUp,
  ShieldCheck,
  User,
  Heart
} from 'lucide-react';
import { CaregiverProfile, PatientProfile } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';
import { CareRhythmView } from '../common/CareRhythmView';
import { SendNudgeModal } from '../modals/SendNudgeModal';

interface PatientDetailViewProps {
  caregiver: CaregiverProfile;
  patientId: string;
  onBack: () => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  caregiver,
  patientId,
  onBack,
}) => {
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);

  const patient = storageService.getPatientById(patientId);
  const connections = storageService.getConnectionsForCaregiver(caregiver.id);
  const connection = connections.find(c => c.patientId === patientId);

  if (!patient || !connection) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <h3 className="text-base font-bold text-slate-800">Patient records unavailable</h3>
        <p className="text-xs text-slate-500 mt-1">
          You may not have active authorization from this patient.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl"
        >
          Return to Patients List
        </button>
      </div>
    );
  }

  const todayStr = getTodayDateString();
  const allDoses = storageService.getDoseRecords(patient.id);
  const todayDoses = allDoses.filter(d => d.scheduledDate === todayStr);

  const confirmedToday = todayDoses.filter(d => d.status === 'confirmed').length;
  const missedToday = todayDoses.filter(d => d.status === 'missed').length;
  const pendingToday = todayDoses.filter(d => d.status === 'pending' || d.status === 'unconfirmed').length;

  const { overallRate, weeklyRate, monthlyRate, dailyBreakdown, medicineBreakdown } =
    storageService.calculateAdherence(patient.id, 7);

  const medicines = storageService.getMedicines(patient.id);

  const alerts = storageService
    .getNotifications(caregiver.userId)
    .filter(n => n.relatedPatientId === patient.id);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Patients</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNudgeModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Encouragement / Cheer</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {patient.avatarUrl ? (
            <img
              src={patient.avatarUrl}
              alt={patient.fullName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              {patient.fullName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{patient.fullName}</h1>
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md">
                Authorized Connection
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Age {patient.age} · {patient.condition}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Emergency: {patient.emergencyContact.name} ({patient.emergencyContact.relationship})</span>
              <span>·</span>
              <span className="font-mono">{patient.emergencyContact.phone}</span>
            </p>
          </div>
        </div>

        {/* Adherence Gauge */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-right shrink-0">
          <span className="text-xs text-slate-500 font-medium block">7-Day Adherence</span>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {weeklyRate}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Monthly: {monthlyRate}%</span>
        </div>
      </div>

      {/* Consent Status Strip */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span className="font-semibold text-slate-800">Patient Consent Active:</span>
          <span>Schedule ({connection.permissions.viewSchedule ? 'Granted' : 'Restricted'}),</span>
          <span>Analytics ({connection.permissions.viewAdherence ? 'Granted' : 'Restricted'}),</span>
          <span>Alerts ({connection.permissions.receiveAlerts ? 'Granted' : 'Restricted'})</span>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          Connected: {new Date(connection.connectedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Today's Dose Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Scheduled Today</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">{todayDoses.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total prescribed doses</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs text-teal-800 font-medium">Confirmed Taken</span>
          <p className="text-2xl font-bold font-mono text-teal-900 mt-2 tabular-nums">{confirmedToday}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Logged with timestamps</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs text-amber-800 font-medium">Pending / Open</span>
          <p className="text-2xl font-bold font-mono text-amber-900 mt-2 tabular-nums">{pendingToday}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting patient log</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs text-rose-800 font-medium">Reported Missed</span>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-2 tabular-nums">{missedToday}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Patient skipped or missed</p>
        </div>
      </div>

      {/* Signature Feature: Caregiver Care Rhythm Surveillance */}
      {connection.permissions.viewCareRhythm && (
        <CareRhythmView
          patientId={patient.id}
          isCaregiverView={true}
        />
      )}

      {/* Today's Medication Schedule Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Today's Medication Doses</h3>
        <p className="text-xs text-slate-500 mb-4">Live confirmation status for {patient.fullName}</p>

        <div className="space-y-2.5">
          {todayDoses.map(dose => {
            const isConfirmed = dose.status === 'confirmed';
            const isMissed = dose.status === 'missed';

            return (
              <div
                key={dose.id}
                className="p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 bg-slate-50/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isConfirmed
                        ? 'bg-teal-50 text-teal-700'
                        : isMissed
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isMissed ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{dose.medicineName}</span>
                      <span className="text-[11px] font-mono text-slate-500">Scheduled: {dose.scheduledTime}</span>
                    </div>
                    {isConfirmed && dose.confirmedAt && (
                      <span className="text-[10px] text-teal-700 font-mono block">
                        Confirmed taken: {new Date(dose.confirmedAt).toLocaleTimeString()}
                      </span>
                    )}
                    {isMissed && dose.missedReason && (
                      <span className="text-[10px] text-rose-700 font-medium block">
                        Patient note: "{dose.missedReason}"
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    isConfirmed
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                      : isMissed
                      ? 'bg-rose-50 text-rose-800 border border-rose-200/80'
                      : 'bg-amber-50 text-amber-800 border border-amber-200/80'
                  }`}
                >
                  {isConfirmed ? 'Confirmed' : isMissed ? 'Missed' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Adherence Performance Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Weekly Adherence Trend</h3>
        <p className="text-xs text-slate-500 mb-4">Daily dose confirmation rates over the last 7 days</p>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-36 pt-4 px-2">
          {dailyBreakdown.map((day) => {
            const barHeightPercent = Math.max(day.rate, 8);
            const isHigh = day.rate >= 80;

            return (
              <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                  {day.rate}%
                </span>
                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                  <div
                    style={{ height: `${barHeightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isHigh ? 'bg-teal-600' : 'bg-amber-500'
                    }`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-700">{day.dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Send Nudge Modal */}
      <SendNudgeModal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        caregiverId={caregiver.id}
        patientId={patient.id}
        patientName={patient.fullName}
      />
    </div>
  );
};
