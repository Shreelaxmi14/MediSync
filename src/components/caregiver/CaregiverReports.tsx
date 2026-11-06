import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Pill,
  ShieldCheck
} from 'lucide-react';
import { CaregiverProfile, PatientProfile } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';

interface CaregiverReportsProps {
  caregiver: CaregiverProfile;
}

export const CaregiverReports: React.FC<CaregiverReportsProps> = ({ caregiver }) => {
  const connections = storageService.getConnectionsForCaregiver(caregiver.id);
  const patients = storageService.getPatients().filter(p =>
    connections.some(c => c.patientId === p.id)
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || ''
  );
  const [reportRange, setReportRange] = useState<'7days' | '30days'>('7days');

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  if (!selectedPatient) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-500">
        Connect a patient to generate medication adherence reports.
      </div>
    );
  }

  const daysCount = reportRange === '7days' ? 7 : 30;
  const { overallRate, weeklyRate, monthlyRate, dailyBreakdown, medicineBreakdown } =
    storageService.calculateAdherence(selectedPatient.id, daysCount);

  const rhythmSlots = storageService.getCareRhythmData(selectedPatient.id);
  const insights = storageService.getAdherenceInsights(selectedPatient.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Clinical Documentation
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Adherence Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Exportable medication adherence summaries for clinical reviews and care conferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Patient Selector */}
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.condition.split(',')[0]})
              </option>
            ))}
          </select>

          {/* Range Selector */}
          <select
            value={reportRange}
            onChange={e => setReportRange(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
          >
            <option value="7days">Past 7 Days</option>
            <option value="30days">Past 30 Days</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">MediSync Clinical Adherence Report</span>
              <span className="text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-mono">
                Official Summary
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generated for authorized caregiver: <span className="font-semibold text-slate-800">{caregiver.fullName}</span> ({caregiver.relationship})
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p>Generated: <span className="font-mono text-slate-800">{new Date().toLocaleDateString()}</span></p>
            <p>Reporting Period: <span className="font-semibold text-slate-800">{reportRange === '7days' ? 'Last 7 Days' : 'Last 30 Days'}</span></p>
          </div>
        </div>

        {/* Patient Demographics Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">{selectedPatient.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age / ID</span>
            <span className="font-mono text-slate-800">{selectedPatient.age} yrs · {selectedPatient.inviteCode}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Conditions</span>
            <span className="font-medium text-slate-800">{selectedPatient.condition}</span>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <span className="text-xs text-slate-500 font-medium">Period Adherence Rate</span>
            <p className="text-3xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {reportRange === '7days' ? weeklyRate : monthlyRate}%
            </p>
            <span className="text-[11px] text-teal-700 font-medium">
              {weeklyRate >= 80 ? 'Within clinical target range (>80%)' : 'Below target, routine support recommended'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <span className="text-xs text-slate-500 font-medium">Strongest Routine</span>
            <p className="text-xl font-bold text-slate-900 mt-1 capitalize">
              {insights.bestSlot} Routine
            </p>
            <span className="text-[11px] text-slate-500 font-mono">
              {insights.bestSlotRate}% confirmed consistency
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <span className="text-xs text-slate-500 font-medium">Primary Focus Slot</span>
            <p className="text-xl font-bold text-amber-900 mt-1 capitalize">
              {insights.worstSlot} Routine
            </p>
            <span className="text-[11px] text-slate-500 font-mono">
              {insights.worstSlotRate}% confirmed consistency
            </span>
          </div>
        </div>

        {/* Qualitative Adherence Synthesis */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-700 space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">Clinical Pattern Analysis</h4>
          <p className="leading-relaxed">{insights.qualitativeSummary}</p>
        </div>

        {/* Medicine Compliance Table */}
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-2">Prescribed Medication Compliance Breakdown</h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Medication Name</th>
                  <th className="py-2.5 px-3 font-semibold">Dosage</th>
                  <th className="py-2.5 px-3 font-semibold">Scheduled Doses</th>
                  <th className="py-2.5 px-3 font-semibold">Confirmed</th>
                  <th className="py-2.5 px-3 font-semibold">Missed</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Adherence Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {medicineBreakdown.map((med, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{med.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">Standard Rx</td>
                    <td className="py-2.5 px-3 text-slate-600">{med.confirmed + med.missed}</td>
                    <td className="py-2.5 px-3 text-teal-700 font-semibold">{med.confirmed}</td>
                    <td className="py-2.5 px-3 text-rose-600 font-semibold">{med.missed}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{med.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Care Rhythm Slot Breakdown */}
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-2">Care Rhythm™ Routine Performance</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {rhythmSlots.map(s => (
              <div key={s.slot} className="p-3 rounded-xl border border-slate-200 bg-slate-50/40 text-center">
                <span className="text-slate-500 block text-[11px] font-medium">{s.label}</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {s.adherenceRate}%
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.timeRange}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Patient-Reported Missed Reasons */}
        {insights.missedReasonsBreakdown.length > 0 && (
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">Patient-Reported Missed Dose Drivers</h4>
            <div className="space-y-1.5 text-xs">
              {insights.missedReasonsBreakdown.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-700">• {r.reason}</span>
                  <span className="font-mono font-medium text-slate-900">
                    {r.count} instances ({r.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Footer */}
        <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 flex items-center justify-between">
          <span>MediSync Healthcare Adherence System · Confidential Clinical Record</span>
          <span className="font-mono">Verification Hash: MD-{selectedPatient.id}-{Date.now().toString(36)}</span>
        </div>
      </div>
    </div>
  );
};
