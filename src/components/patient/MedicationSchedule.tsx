import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sun, CloudSun, Sunset, Moon, CheckCircle2 } from 'lucide-react';
import { PatientProfile, TimeSlot } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';

interface MedicationScheduleProps {
  patient: PatientProfile;
}

export const MedicationSchedule: React.FC<MedicationScheduleProps> = ({ patient }) => {
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('all');
  const medicines = storageService.getMedicines(patient.id);
  const todayStr = getTodayDateString();
  const allDoses = storageService.getDoseRecords(patient.id);
  const todayDoses = allDoses.filter(d => d.scheduledDate === todayStr);

  const SLOTS: { key: TimeSlot; label: string; time: string; icon: any; color: string }[] = [
    { key: 'morning', label: 'Morning Routine', time: '06:00 – 11:59', icon: Sun, color: 'text-teal-700 bg-teal-50' },
    { key: 'afternoon', label: 'Afternoon Routine', time: '12:00 – 16:59', icon: CloudSun, color: 'text-sky-700 bg-sky-50' },
    { key: 'evening', label: 'Evening Routine', time: '17:00 – 20:59', icon: Sunset, color: 'text-indigo-700 bg-indigo-50' },
    { key: 'night', label: 'Night Routine', time: '21:00 – 05:59', icon: Moon, color: 'text-slate-700 bg-slate-100' },
  ];

  const filteredSlots = selectedSlotFilter === 'all'
    ? SLOTS
    : SLOTS.filter(s => s.key === selectedSlotFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Prescription Timetable
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Medication Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized by daily circadian routine time slots
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedSlotFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedSlotFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Routines
          </button>
          {SLOTS.map(s => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSelectedSlotFilter(s.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedSlotFilter === s.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Slots Breakdown */}
      <div className="space-y-4">
        {filteredSlots.map(slot => {
          const Icon = slot.icon;
          const slotMeds = medicines.filter(m => m.timeSlots.includes(slot.key));

          return (
            <div
              key={slot.key}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${slot.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{slot.label}</h3>
                    <p className="text-xs text-slate-500 font-mono">{slot.time}</p>
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  {slotMeds.length} {slotMeds.length === 1 ? 'medication' : 'medications'}
                </span>
              </div>

              {slotMeds.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center italic">
                  No medications scheduled during this routine slot.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {slotMeds.map(med => {
                    const todayDose = todayDoses.find(
                      d => d.medicineId === med.id && d.timeSlot === slot.key
                    );

                    return (
                      <div
                        key={med.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">{med.name}</span>
                            <span className="text-xs font-mono font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {med.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Times: {med.scheduledTimes.join(', ')}</span>
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-slate-600">
                              {med.instructions}
                            </p>
                          )}
                        </div>

                        {todayDose && todayDose.status === 'confirmed' && (
                          <span className="text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" /> Taken today
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
