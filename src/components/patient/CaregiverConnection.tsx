import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Copy,
  Check,
  AlertCircle,
  Bell,
  Calendar,
  BarChart3,
  Activity,
  UserX
} from 'lucide-react';
import { PatientProfile } from '../../types';
import { storageService } from '../../services/storageService';

interface CaregiverConnectionProps {
  patient: PatientProfile;
}

export const CaregiverConnection: React.FC<CaregiverConnectionProps> = ({ patient }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const connections = storageService.getConnectionsForPatient(patient.id);
  const activeConnections = connections.filter(c => c.status === 'active');

  const copyInviteCode = () => {
    navigator.clipboard.writeText(patient.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTogglePermission = (
    connectionId: string,
    key: 'viewSchedule' | 'viewAdherence' | 'receiveAlerts' | 'viewCareRhythm',
    currentVal: boolean
  ) => {
    const conn = connections.find(c => c.id === connectionId);
    if (!conn) return;

    const newPermissions = {
      ...conn.permissions,
      [key]: !currentVal,
    };
    storageService.updateConsentPermissions(connectionId, newPermissions);
  };

  const handleRevoke = (connectionId: string) => {
    storageService.revokeConnection(connectionId);
    setRevokingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Authorized Care Team
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Caregiver Connection & Consent</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You maintain full sovereignty over which authorized caregivers can view your health routines
          </p>
        </div>

        {/* Invite Code Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Your Patient Invite Code
            </span>
            <span className="text-base font-mono font-bold text-slate-900 tracking-wider">
              {patient.inviteCode}
            </span>
          </div>
          <button
            onClick={copyInviteCode}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Copy Code"
          >
            {copiedCode ? (
              <Check className="w-4 h-4 text-teal-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-teal-950">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-teal-900 text-sm">Patient Consent & Data Privacy Policy</h4>
          <p className="text-teal-900/80 leading-relaxed">
            Caregivers can only see what you explicitly grant permission to share. You can toggle access to your medication schedule, adherence rate, missed-dose notifications, and Care Rhythm at any time. Revoking access takes effect immediately.
          </p>
        </div>
      </div>

      {/* Active Caregivers List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Connected Caregivers ({activeConnections.length})</h3>

        {activeConnections.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No caregivers currently connected to your account.</p>
            <p className="text-slate-400 mt-1">
              Share your invite code <span className="font-mono font-semibold text-slate-700">{patient.inviteCode}</span> with a family member or nurse to link accounts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeConnections.map(conn => (
              <div
                key={conn.id}
                className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/40 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                      {conn.caregiverName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{conn.caregiverName}</h4>
                      <p className="text-xs text-slate-500">
                        {conn.relationship} · Connected {new Date(conn.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setRevokingId(conn.id)}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors border border-rose-200/60 self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Revoke Caregiver Access</span>
                  </button>
                </div>

                {/* Granular Permission Toggles */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-700 mb-2.5">
                    Data Sharing Permissions for {conn.caregiverName}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <div>
                          <span className="text-xs font-medium text-slate-800 block">Medication Schedule</span>
                          <span className="text-[10px] text-slate-500">Allow viewing daily drug times</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={conn.permissions.viewSchedule}
                        onChange={() =>
                          handleTogglePermission(conn.id, 'viewSchedule', conn.permissions.viewSchedule)
                        }
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-teal-600" />
                        <div>
                          <span className="text-xs font-medium text-slate-800 block">Adherence Analytics</span>
                          <span className="text-[10px] text-slate-500">Allow viewing weekly rates</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={conn.permissions.viewAdherence}
                        onChange={() =>
                          handleTogglePermission(conn.id, 'viewAdherence', conn.permissions.viewAdherence)
                        }
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="text-xs font-medium text-slate-800 block">Missed Dose Alerts</span>
                          <span className="text-[10px] text-slate-500">Alert caregiver if a dose is missed</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={conn.permissions.receiveAlerts}
                        onChange={() =>
                          handleTogglePermission(conn.id, 'receiveAlerts', conn.permissions.receiveAlerts)
                        }
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-600" />
                        <div>
                          <span className="text-xs font-medium text-slate-800 block">Care Rhythm Routine</span>
                          <span className="text-[10px] text-slate-500">Share morning & evening circadian slot status</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={conn.permissions.viewCareRhythm}
                        onChange={() =>
                          handleTogglePermission(conn.id, 'viewCareRhythm', conn.permissions.viewCareRhythm)
                        }
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      {revokingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-slate-900 text-sm">Revoke Caregiver Access?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This caregiver will immediately lose access to view your schedules, adherence reports, and alerts. You can reconnect at any time using your invite code.
            </p>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setRevokingId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevoke(revokingId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
