import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Pill,
  ArrowRight,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';
import { PatientProfile, DoseRecord } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';
import { CareRhythmView } from '../common/CareRhythmView';
import { ConfirmDoseModal } from '../modals/ConfirmDoseModal';
import { MissedDoseModal } from '../modals/MissedDoseModal';

interface PatientOverviewProps {
  patient: PatientProfile;
  onNavigateTab: (tab: string) => void;
}

export const PatientOverview: React.FC<PatientOverviewProps> = ({
  patient,
  onNavigateTab,
}) => {
  const [selectedDoseForConfirm, setSelectedDoseForConfirm] = useState<DoseRecord | null>(null);
  const [selectedDoseForMissed, setSelectedDoseForMissed] = useState<DoseRecord | null>(null);

  const todayStr = getTodayDateString();
  const allDoses = storageService.getDoseRecords(patient.id);
  const todayDoses = allDoses
    .filter(d => d.scheduledDate === todayStr)
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const confirmedCount = todayDoses.filter(d => d.status === 'confirmed').length;
  const missedCount = todayDoses.filter(d => d.status === 'missed').length;
  const pendingCount = todayDoses.filter(d => d.status === 'pending' || d.status === 'unconfirmed').length;
  const totalCount = todayDoses.length;

  const { weeklyRate } = storageService.calculateAdherence(patient.id, 7);

  // Next upcoming dose
  const nowTime = new Date().toTimeString().slice(0, 5);
  const nextDose = todayDoses.find(
    d => (d.status === 'pending' || d.status === 'unconfirmed') && d.scheduledTime >= nowTime
  ) || todayDoses.find(d => d.status === 'pending' || d.status === 'unconfirmed');

  // Format today's date
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDoseAction = (dose: DoseRecord, action: 'confirm' | 'missed') => {
    if (action === 'confirm') {
      setSelectedDoseForConfirm(dose);
    } else {
      setSelectedDoseForMissed(dose);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Date Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-800 font-semibold uppercase tracking-wider">
            <span>Patient Health Portal</span>
            <span aria-hidden="true">·</span>
            <span>{patient.condition}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Good day, {patient.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateFormatted}</span>
          </p>
        </div>

        {/* Quick Adherence Status Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-right">
            <span className="text-xs text-slate-500 block">7-Day Adherence</span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {weeklyRate}%
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('insights')}
            className="px-4 py-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
          >
            View Insights
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Scheduled Today</span>
            <Pill className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Prescribed daily doses</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-teal-800">Confirmed Taken</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-teal-900 mt-2 tabular-nums">{confirmedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {totalCount > 0 ? `${Math.round((confirmedCount / totalCount) * 100)}% complete` : '0%'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Pending / Upcoming</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-900 mt-2 tabular-nums">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting confirmation</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Missed Doses</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-2 tabular-nums">{missedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Reported skipped or missed</p>
        </div>
      </div>

      {/* Next Dose Banner (if pending) */}
      {nextDose && (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300">
                Next Scheduled Dose
              </span>
              <span className="text-xs text-slate-300 font-mono">
                · Scheduled at {nextDose.scheduledTime}
              </span>
            </div>
            <h3 className="text-lg font-bold">{nextDose.medicineName}</h3>
            {nextDose.instructions && (
              <p className="text-xs text-slate-300">Instructions: {nextDose.instructions}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDoseAction(nextDose, 'confirm')}
              className="px-4 py-2.5 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Taken Now</span>
            </button>
            <button
              onClick={() => handleDoseAction(nextDose, 'missed')}
              className="px-3 py-2.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              Mark Missed
            </button>
          </div>
        </div>
      )}

      {/* Today's Medication Journey - Visual Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Medication Journey</h2>
            <p className="text-xs text-slate-500">Timeline of prescribed doses scheduled for today</p>
          </div>
          <button
            onClick={() => onNavigateTab('schedule')}
            className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayDoses.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Pill className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p>No medication doses scheduled for today.</p>
            <button
              onClick={() => onNavigateTab('medicines')}
              className="mt-3 px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
            >
              Add Your Medications
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayDoses.map((dose) => {
              const isConfirmed = dose.status === 'confirmed';
              const isMissed = dose.status === 'missed';

              return (
                <div
                  key={dose.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isConfirmed
                      ? 'border-teal-200/90 bg-teal-50/20'
                      : isMissed
                      ? 'border-rose-200/90 bg-rose-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isConfirmed
                          ? 'bg-teal-100 text-teal-700'
                          : isMissed
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isMissed ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{dose.medicineName}</span>
                        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {dose.dosage}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          Scheduled: {dose.scheduledTime}
                        </span>
                      </div>
                      {dose.instructions && (
                        <p className="text-xs text-slate-500">
                          {dose.instructions}
                        </p>
                      )}
                      {isConfirmed && dose.confirmedAt && (
                        <p className="text-[11px] text-teal-700 font-medium">
                          Confirmed taken at {new Date(dose.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {isMissed && dose.missedReason && (
                        <p className="text-[11px] text-rose-700 font-medium">
                          Reason: {dose.missedReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {isConfirmed ? (
                      <span className="px-3 py-1.5 rounded-lg bg-teal-100/70 text-teal-800 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                      </span>
                    ) : isMissed ? (
                      <span className="px-3 py-1.5 rounded-lg bg-rose-100/70 text-rose-800 text-xs font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missed
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDoseAction(dose, 'confirm')}
                          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Dose</span>
                        </button>
                        <button
                          onClick={() => handleDoseAction(dose, 'missed')}
                          className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          Mark Missed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Signature Care Rhythm Feature embedded */}
      <CareRhythmView
        patientId={patient.id}
        onDoseAction={handleDoseAction}
      />

      {/* Caregiver Connection Quick Bar */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100/80 flex items-center justify-center text-teal-800 shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Caregiver Connection Active</h4>
            <p className="text-xs text-slate-500">
              Your authorized caregivers can monitor confirmed routines and receive alerts based on your consent.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('caregivers')}
          className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
        >
          Manage Sharing Permissions
        </button>
      </div>

      {/* Modals */}
      <ConfirmDoseModal
        dose={selectedDoseForConfirm}
        isOpen={!!selectedDoseForConfirm}
        onClose={() => setSelectedDoseForConfirm(null)}
      />

      <MissedDoseModal
        dose={selectedDoseForMissed}
        isOpen={!!selectedDoseForMissed}
        onClose={() => setSelectedDoseForMissed(null)}
      />
    </div>
  );
};
