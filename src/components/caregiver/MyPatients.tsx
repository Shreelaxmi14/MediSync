import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Send,
  Pill
} from 'lucide-react';
import { CaregiverProfile, PatientProfile } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';
import { ConnectPatientModal } from '../modals/ConnectPatientModal';
import { SendNudgeModal } from '../modals/SendNudgeModal';

interface MyPatientsProps {
  caregiver: CaregiverProfile;
  onSelectPatient: (patientId: string) => void;
}

export const MyPatients: React.FC<MyPatientsProps> = ({
  caregiver,
  onSelectPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [nudgePatient, setNudgePatient] = useState<PatientProfile | null>(null);

  const connections = storageService.getConnectionsForCaregiver(caregiver.id);
  const activePatientIds = connections.map(c => c.patientId);
  const allPatients = storageService.getPatients().filter(p => activePatientIds.includes(p.id));

  const filteredPatients = allPatients.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q) ||
      p.inviteCode.toLowerCase().includes(q)
    );
  });

  const todayStr = getTodayDateString();
  const allDoses = storageService.getDoseRecords();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Care Roster
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">My Patients</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Patients who have authorized you as an active member of their care network
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

      {/* Search and Consent Policy Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient by name or condition..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Protected by Patient Consent & Privacy Controls</span>
        </span>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No connected patients found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Connect your first patient by entering their 6-character patient invite code.
          </p>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Connect Patient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map(patient => {
            const conn = connections.find(c => c.patientId === patient.id);
            const { weeklyRate, overallRate } = storageService.calculateAdherence(patient.id, 7);
            const pDosesToday = allDoses.filter(d => d.patientId === patient.id && d.scheduledDate === todayStr);
            const confirmedToday = pDosesToday.filter(d => d.status === 'confirmed').length;
            const missedToday = pDosesToday.filter(d => d.status === 'missed').length;
            const patientMeds = storageService.getMedicines(patient.id);

            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
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
                        <p className="text-xs text-slate-500">
                          Age {patient.age} · Code: <span className="font-mono text-slate-700">{patient.inviteCode}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Conditions:</span> {patient.condition}
                  </div>

                  {/* Adherence & Regimen Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Weekly Rate</span>
                      <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        {weeklyRate}%
                      </span>
                    </div>

                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Overall</span>
                      <span className="text-base font-bold font-mono text-teal-800 tabular-nums">
                        {overallRate}%
                      </span>
                    </div>

                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Active Meds</span>
                      <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        {patientMeds.length}
                      </span>
                    </div>
                  </div>

                  {/* Today's Activity Strip */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Today: <span className="font-semibold text-slate-800">{confirmedToday}</span> / {pDosesToday.length} confirmed
                    </span>
                    {missedToday > 0 ? (
                      <span className="text-rose-600 font-semibold">{missedToday} missed</span>
                    ) : (
                      <span className="text-teal-700 font-medium">On track</span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setNudgePatient(patient)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-600" />
                    <span>Send Cheer</span>
                  </button>

                  <button
                    onClick={() => onSelectPatient(patient.id)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
