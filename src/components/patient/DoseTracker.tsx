import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Check
} from 'lucide-react';
import { PatientProfile, DoseRecord, DoseStatus } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';
import { ConfirmDoseModal } from '../modals/ConfirmDoseModal';
import { MissedDoseModal } from '../modals/MissedDoseModal';

interface DoseTrackerProps {
  patient: PatientProfile;
}

export const DoseTracker: React.FC<DoseTrackerProps> = ({ patient }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'today' | '7days' | '14days' | 'all'>('7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoseForConfirm, setSelectedDoseForConfirm] = useState<DoseRecord | null>(null);
  const [selectedDoseForMissed, setSelectedDoseForMissed] = useState<DoseRecord | null>(null);

  const allDoses = storageService.getDoseRecords(patient.id);
  const todayStr = getTodayDateString();

  // Filter doses
  const filteredDoses = allDoses.filter(dose => {
    // Status filter
    if (statusFilter !== 'all' && dose.status !== statusFilter) return false;

    // Date range filter
    if (dateRangeFilter === 'today' && dose.scheduledDate !== todayStr) return false;
    if (dateRangeFilter === '7days') {
      const diff = Date.now() - new Date(dose.scheduledDate).getTime();
      if (diff > 7 * 86400000) return false;
    }
    if (dateRangeFilter === '14days') {
      const diff = Date.now() - new Date(dose.scheduledDate).getTime();
      if (diff > 14 * 86400000) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        dose.medicineName.toLowerCase().includes(q) ||
        dose.scheduledTime.includes(q) ||
        (dose.missedReason && dose.missedReason.toLowerCase().includes(q))
      );
    }

    return true;
  }).sort((a, b) => {
    // Sort descending by date and time
    const cmp = b.scheduledDate.localeCompare(a.scheduledDate);
    if (cmp !== 0) return cmp;
    return b.scheduledTime.localeCompare(a.scheduledTime);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Audit & Verification Log
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Dose Tracker</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified dose records with confirmation timestamps and missed-dose reasons
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
          {(['today', '7days', '14days', 'all'] as const).map(range => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRangeFilter(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                dateRangeFilter === range
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '14days' ? 'Last 14 Days' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search medicine or reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {[
            { key: 'all', label: 'All' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'pending', label: 'Pending' },
            { key: 'unconfirmed', label: 'Unconfirmed' },
            { key: 'missed', label: 'Missed' },
          ].map(st => (
            <button
              key={st.key}
              type="button"
              onClick={() => setStatusFilter(st.key)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === st.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Doses Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredDoses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No medication doses match your active filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDoses.map(dose => {
              const isConfirmed = dose.status === 'confirmed';
              const isMissed = dose.status === 'missed';
              const isPending = dose.status === 'pending' || dose.status === 'unconfirmed';

              return (
                <div
                  key={dose.id}
                  className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
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

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">
                          {dose.medicineName}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {dose.dosage}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {dose.scheduledDate} at {dose.scheduledTime}
                        </span>
                      </div>

                      {dose.instructions && (
                        <p className="text-xs text-slate-500">{dose.instructions}</p>
                      )}

                      {/* Explicit Timestamp or Missed Reason */}
                      {isConfirmed && dose.confirmedAt && (
                        <p className="text-[11px] text-teal-800 font-mono">
                          Confirmed at: {new Date(dose.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      )}

                      {isMissed && dose.missedReason && (
                        <p className="text-[11px] text-rose-800 font-medium">
                          Patient reason: "{dose.missedReason}"
                          {dose.missedNote && <span className="text-slate-500 ml-1">· Note: {dose.missedNote}</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Status badge */}
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        isConfirmed
                          ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                          : isMissed
                          ? 'bg-rose-50 text-rose-800 border border-rose-200/80'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/80'
                      }`}
                    >
                      {isConfirmed ? 'Confirmed Taken' : isMissed ? 'Reported Missed' : 'Awaiting Confirmation'}
                    </span>

                    {/* Interactive Action if not confirmed */}
                    {isPending && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => setSelectedDoseForConfirm(dose)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => setSelectedDoseForMissed(dose)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Missed
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
