import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Activity,
  Bell,
  TrendingUp,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Send,
  Clock
} from 'lucide-react';
import { CaregiverProfile, PatientProfile } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';
import { ConnectPatientModal } from '../modals/ConnectPatientModal';
import { SendNudgeModal } from '../modals/SendNudgeModal';

interface CaregiverOverviewProps {
  caregiver: CaregiverProfile;
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const CaregiverOverview: React.FC<CaregiverOverviewProps> = ({
  caregiver,
  onSelectPatient,
  onNavigateTab,
}) => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [nudgePatient, setNudgePatient] = useState<PatientProfile | null>(null);

  const connections = storageService.getConnectionsForCaregiver(caregiver.id);
  const activePatientIds = connections.map(c => c.patientId);
  const patients = storageService.getPatients().filter(p => activePatientIds.includes(p.id));

  // Compute metrics
  const todayStr = getTodayDateString();
  const allDoses = storageService.getDoseRecords();

  let totalScheduledToday = 0;
  let totalConfirmedToday = 0;
  let totalMissedToday = 0;
  let patientsNeedingAttentionCount = 0;

  const patientSummaries = patients.map(p => {
    const pDoses = allDoses.filter(d => d.patientId === p.id && d.scheduledDate === todayStr);
    const confirmed = pDoses.filter(d => d.status === 'confirmed').length;
    const missed = pDoses.filter(d => d.status === 'missed').length;
    const pending = pDoses.filter(d => d.status === 'pending' || d.status === 'unconfirmed').length;

    totalScheduledToday += pDoses.length;
    totalConfirmedToday += confirmed;
    totalMissedToday += missed;

    const { weeklyRate } = storageService.calculateAdherence(p.id, 7);
    const needsAttention = missed > 0 || weeklyRate < 80;
    if (needsAttention) patientsNeedingAttentionCount++;

    return {
      patient: p,
      todayTotal: pDoses.length,
      confirmed,
      missed,
      pending,
      weeklyRate,
      needsAttention,
    };
  });

  const alerts = storageService
    .getNotifications(caregiver.userId)
    .filter(n => n.type === 'missed_dose' || n.type === 'caregiver_alert');

  const pendingAlertsCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Caregiver Monitoring Station
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{caregiver.relationship}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Welcome, {caregiver.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time adherence surveillance and supportive care coordination for authorized patients
          </p>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <UserCheck className="w-4 h-4 text-teal-400" />
          <span>Connect New Patient</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Connected Patients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {patients.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">With active consent</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Requires Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-900 mt-2 tabular-nums">
            {patientsNeedingAttentionCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Missed doses or low rates</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-teal-800">Doses Confirmed Today</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-teal-900 mt-2 tabular-nums">
            {totalConfirmedToday} <span className="text-sm font-normal text-slate-400">/ {totalScheduledToday}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across authorized patients</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Pending Alerts</span>
            <Bell className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-2 tabular-nums">
            {pendingAlertsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Unread alerts</p>
        </div>
      </div>

      {/* Patient Adherence Overview Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Authorized Patient Rosters</h2>
            <p className="text-xs text-slate-500">Live routine status and weekly adherence metrics</p>
          </div>
          <button
            onClick={() => onNavigateTab('patients')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
          >
            <span>View All Patients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patientSummaries.map(({ patient, todayTotal, confirmed, missed, pending, weeklyRate, needsAttention }) => (
            <div
              key={patient.id}
              className={`p-5 rounded-2xl border transition-all ${
                needsAttention
                  ? 'border-amber-200/90 bg-amber-50/15'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {patient.avatarUrl ? (
                    <img
                      src={patient.avatarUrl}
                      alt={patient.fullName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                      {patient.fullName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{patient.fullName}</h3>
                    <p className="text-xs text-slate-500">Age {patient.age} · {patient.condition}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">7-Day Adherence</span>
                  <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                    {weeklyRate}%
                  </span>
                </div>
              </div>

              {/* Today's Dose Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Today's Schedule:</span>
                  <span className="text-slate-500 font-mono">
                    {confirmed} confirmed · {pending} open {missed > 0 ? `· ${missed} missed` : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${todayTotal > 0 ? (confirmed / todayTotal) * 100 : 0}%` }}
                    className="bg-teal-600 h-full"
                  />
                  <div
                    style={{ width: `${todayTotal > 0 ? (missed / todayTotal) * 100 : 0}%` }}
                    className="bg-rose-500 h-full"
                  />
                  <div
                    style={{ width: `${todayTotal > 0 ? (pending / todayTotal) * 100 : 0}%` }}
                    className="bg-amber-400 h-full"
                  />
                </div>
              </div>

              {/* Actions Strip */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setNudgePatient(patient)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-teal-600" />
                  <span>Send Nudge / Cheer</span>
                </button>

                <button
                  onClick={() => onSelectPatient(patient.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Clinical & Adherence Alerts</h3>
            <p className="text-xs text-slate-500">Alerts dispatched in accordance with patient consent</p>
          </div>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900"
          >
            Manage Alerts
          </button>
        </div>

        {alerts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            No active alerts at this time. All patients are tracking normally.
          </p>
        ) : (
          <div className="space-y-2.5">
            {alerts.slice(0, 4).map(alert => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  !alert.isRead ? 'border-amber-200/80 bg-amber-50/20' : 'border-slate-100 bg-slate-50/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{alert.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    storageService.markNotificationAsRead(alert.id);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 shrink-0"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      <ConnectPatientModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        caregiverId={caregiver.id}
      />

      {/* Nudge Modal */}
      {nudgePatient && (
        <SendNudgeModal
          isOpen={!!nudgePatient}
          onClose={() => setNudgePatient(null)}
          caregiverId={caregiver.id}
          patientId={nudgePatient.id}
          patientName={nudgePatient.fullName}
        />
      )}
    </div>
  );
};
