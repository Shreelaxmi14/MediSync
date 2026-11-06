import React, { useState } from 'react';
import { Sun, CloudSun, Sunset, Moon, CheckCircle2, AlertCircle, Clock, Check, ChevronRight } from 'lucide-react';
import { TimeSlot, CareRhythmSlotData, DoseRecord } from '../../types';
import { storageService } from '../../services/storageService';

interface CareRhythmViewProps {
  patientId: string;
  isCaregiverView?: boolean;
  onDoseAction?: (dose: DoseRecord, action: 'confirm' | 'missed') => void;
}

const SLOT_ICONS = {
  morning: Sun,
  afternoon: CloudSun,
  evening: Sunset,
  night: Moon,
};

export const CareRhythmView: React.FC<CareRhythmViewProps> = ({
  patientId,
  isCaregiverView = false,
  onDoseAction,
}) => {
  const [activeSlot, setActiveSlot] = useState<TimeSlot>('morning');
  const slotsData = storageService.getCareRhythmData(patientId);

  const selectedSlotData = slotsData.find(s => s.slot === activeSlot) || slotsData[0];
  const allDoses = storageService.getDoseRecords(patientId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Signature Adherence Routine
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">MediSync Care Rhythm™</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Circadian medication map aligning daily doses with meal and rest intervals
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span> Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Missed
          </span>
        </div>
      </div>

      {/* Routine Slots Track / Interactive Circadian Timeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
        {slotsData.map(slotItem => {
          const Icon = SLOT_ICONS[slotItem.slot];
          const isSelected = activeSlot === slotItem.slot;

          // Adherence level color
          const ringColor =
            slotItem.adherenceRate >= 85
              ? 'text-teal-600'
              : slotItem.adherenceRate >= 70
              ? 'text-amber-500'
              : 'text-rose-500';

          return (
            <button
              key={slotItem.slot}
              type="button"
              onClick={() => setActiveSlot(slotItem.slot)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'border-slate-800 bg-slate-50/80 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Circular Adherence Metric */}
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold ${ringColor} tabular-nums`}>
                    {slotItem.adherenceRate}%
                  </span>
                  <p className="text-[10px] text-slate-400">14d rate</p>
                </div>
              </div>

              <h4 className="font-semibold text-slate-900 text-sm">{slotItem.label}</h4>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">{slotItem.timeRange}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {slotItem.totalScheduled} {slotItem.totalScheduled === 1 ? 'dose' : 'doses'} today
                </span>
                {slotItem.confirmed === slotItem.totalScheduled && slotItem.totalScheduled > 0 ? (
                  <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3]" />
                ) : slotItem.missed > 0 ? (
                  <span className="text-rose-600 text-[11px] font-medium">{slotItem.missed} missed</span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    {slotItem.unconfirmed > 0 ? `${slotItem.unconfirmed} open` : 'none'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Routine Detail View */}
      <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-base">
                {selectedSlotData.label} Details
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                ({selectedSlotData.timeRange})
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Status for today: <span className="font-medium text-slate-800">{selectedSlotData.statusText}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Historical consistency:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">
              {selectedSlotData.adherenceRate}%
            </span>
          </div>
        </div>

        {selectedSlotData.medicines.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No medications currently scheduled during this time window.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedSlotData.medicines.map(med => {
              const fullDose = allDoses.find(d => d.id === med.doseId);

              return (
                <div
                  key={med.id + med.time}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{med.name}</span>
                      <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {med.dosage}
                      </span>
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {med.time}
                      </span>
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-slate-500">
                        Instructions: <span className="text-slate-700">{med.instructions}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Display */}
                    {med.status === 'confirmed' ? (
                      <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span>Confirmed Taken</span>
                      </div>
                    ) : med.status === 'missed' ? (
                      <div className="flex items-center gap-1.5 text-xs text-rose-800 font-medium bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Reported Missed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Awaiting Dose</span>
                      </div>
                    )}

                    {/* Patient Interactive Actions */}
                    {!isCaregiverView && fullDose && med.status !== 'confirmed' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onDoseAction && onDoseAction(fullDose, 'confirm')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Confirm</span>
                        </button>
                        {med.status !== 'missed' && (
                          <button
                            type="button"
                            onClick={() => onDoseAction && onDoseAction(fullDose, 'missed')}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Mark Missed
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pattern Insight Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
          <span>
            {selectedSlotData.adherenceRate >= 85
              ? `Strong habit strength: Doses during ${selectedSlotData.label.toLowerCase()} are taken consistently.`
              : `Focus opportunity: ${selectedSlotData.label} shows recurring delays. Consider aligning reminders.`}
          </span>
          <span className="font-medium text-slate-700 hidden sm:inline-flex items-center gap-1">
            Tap other routines above to inspect schedule <ChevronRight className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      </div>
    </div>
  );
};
