import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, X } from 'lucide-react';
import { Medicine, MedicationForm, MedicationFrequency, TimeSlot } from '../../types';
import { storageService, getTimeSlotForHour, getTodayDateString } from '../../services/storageService';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  medicineToEdit?: Medicine | null;
  onSaved?: () => void;
}

const FORM_OPTIONS: { label: string; value: MedicationForm }[] = [
  { label: 'Tablet', value: 'tablet' },
  { label: 'Capsule', value: 'capsule' },
  { label: 'Liquid / Solution', value: 'liquid' },
  { label: 'Injection', value: 'injection' },
  { label: 'Inhaler', value: 'inhaler' },
  { label: 'Drops', value: 'drops' },
  { label: 'Patch', value: 'patch' },
];

const FREQUENCY_OPTIONS: { label: string; value: MedicationFrequency; defaultTimes: string[] }[] = [
  { label: 'Once Daily', value: 'daily', defaultTimes: ['08:00'] },
  { label: 'Twice Daily', value: 'twice_daily', defaultTimes: ['08:00', '20:00'] },
  { label: 'Three Times Daily', value: 'thrice_daily', defaultTimes: ['08:00', '13:00', '20:00'] },
  { label: 'Four Times Daily', value: 'four_times_daily', defaultTimes: ['08:00', '12:00', '17:00', '21:00'] },
  { label: 'As Needed (PRN)', value: 'as_needed', defaultTimes: ['12:00'] },
];

const COLOR_OPTIONS = [
  { label: 'Teal', value: '#0D9488' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Purple', value: '#9333EA' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Emerald', value: '#059669' },
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  patientId,
  medicineToEdit,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [color, setColor] = useState('#0D9488');
  const [instructions, setInstructions] = useState('');
  const [frequency, setFrequency] = useState<MedicationFrequency>('daily');
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(['08:00']);
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [totalPills, setTotalPills] = useState<number>(30);
  const [remainingPills, setRemainingPills] = useState<number>(30);
  const [refillThreshold, setRefillThreshold] = useState<number>(7);
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [rxNumber, setRxNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (medicineToEdit) {
      setName(medicineToEdit.name);
      setBrandName(medicineToEdit.brandName || '');
      setDosage(medicineToEdit.dosage);
      setForm(medicineToEdit.form);
      setColor(medicineToEdit.color || '#0D9488');
      setInstructions(medicineToEdit.instructions);
      setFrequency(medicineToEdit.frequency);
      setScheduledTimes(medicineToEdit.scheduledTimes || ['08:00']);
      setStartDate(medicineToEdit.startDate);
      setTotalPills(medicineToEdit.totalPills);
      setRemainingPills(medicineToEdit.remainingPills);
      setRefillThreshold(medicineToEdit.refillThreshold);
      setPrescribingDoctor(medicineToEdit.prescribingDoctor || '');
      setRxNumber(medicineToEdit.rxNumber || '');
      setNotes(medicineToEdit.notes || '');
    } else {
      setName('');
      setBrandName('');
      setDosage('');
      setForm('tablet');
      setColor('#0D9488');
      setInstructions('Take with food');
      setFrequency('daily');
      setScheduledTimes(['08:00']);
      setStartDate(getTodayDateString());
      setTotalPills(30);
      setRemainingPills(30);
      setRefillThreshold(7);
      setPrescribingDoctor('');
      setRxNumber('');
      setNotes('');
    }
    setError('');
  }, [medicineToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFrequencyChange = (newFreq: MedicationFrequency) => {
    setFrequency(newFreq);
    const config = FREQUENCY_OPTIONS.find(f => f.value === newFreq);
    if (config) {
      setScheduledTimes(config.defaultTimes);
    }
  };

  const addTimeSlot = () => {
    if (scheduledTimes.length >= 6) return;
    setScheduledTimes([...scheduledTimes, '12:00']);
  };

  const removeTimeSlot = (index: number) => {
    if (scheduledTimes.length <= 1) return;
    setScheduledTimes(scheduledTimes.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, val: string) => {
    const updated = [...scheduledTimes];
    updated[index] = val;
    setScheduledTimes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the prescribed medication name.');
      return;
    }
    if (!dosage.trim()) {
      setError('Please enter the prescribed dosage (e.g., 500 mg).');
      return;
    }

    const timeSlots: TimeSlot[] = scheduledTimes.map(t => {
      const h = parseInt(t.split(':')[0], 10) || 8;
      return getTimeSlotForHour(h);
    });

    if (medicineToEdit) {
      storageService.updateMedicine(medicineToEdit.id, {
        name: name.trim(),
        brandName: brandName.trim() || undefined,
        dosage: dosage.trim(),
        form,
        color,
        instructions: instructions.trim(),
        frequency,
        scheduledTimes,
        timeSlots,
        startDate,
        totalPills: Number(totalPills) || 30,
        remainingPills: Number(remainingPills) || 30,
        refillThreshold: Number(refillThreshold) || 7,
        prescribingDoctor: prescribingDoctor.trim() || undefined,
        rxNumber: rxNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      storageService.addMedicine({
        patientId,
        name: name.trim(),
        brandName: brandName.trim() || undefined,
        dosage: dosage.trim(),
        form,
        color,
        instructions: instructions.trim(),
        frequency,
        scheduledTimes,
        timeSlots,
        startDate,
        totalPills: Number(totalPills) || 30,
        remainingPills: Number(remainingPills) || 30,
        refillThreshold: Number(refillThreshold) || 7,
        prescribingDoctor: prescribingDoctor.trim() || undefined,
        rxNumber: rxNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        active: true,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {medicineToEdit ? 'Edit Prescribed Medicine' : 'Add Prescribed Medicine'}
              </h3>
              <p className="text-xs text-slate-500">
                Enter details exactly according to your medical prescription
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Metformin HCl, Lisinopril"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand Name (Optional)
              </label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="e.g. Glucophage, Zestril"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dosage *
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                placeholder="e.g. 500 mg, 10 ml"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Form
              </label>
              <select
                value={form}
                onChange={e => setForm(e.target.value as MedicationForm)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                {FORM_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pill Color Tag
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      color === c.value ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prescription Frequency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FREQUENCY_OPTIONS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleFrequencyChange(f.value)}
                  className={`px-3 py-2 text-xs rounded-xl border text-left transition-colors ${
                    frequency === f.value
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-medium'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Scheduled Daily Times
              </label>
              {scheduledTimes.length < 5 && (
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Time</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {scheduledTimes.map((time, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <input
                    type="time"
                    value={time}
                    onChange={e => updateTimeSlot(idx, e.target.value)}
                    className="text-xs font-mono text-slate-800 bg-transparent focus:outline-hidden"
                  />
                  {scheduledTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(idx)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions & Precautions
            </label>
            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Take with food, Take 30 mins before breakfast with water"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Supply (Pills/Units)
              </label>
              <input
                type="number"
                min={1}
                value={totalPills}
                onChange={e => setTotalPills(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remaining Pills
              </label>
              <input
                type="number"
                min={0}
                value={remainingPills}
                onChange={e => setRemainingPills(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Refill Alert Threshold
              </label>
              <input
                type="number"
                min={1}
                value={refillThreshold}
                onChange={e => setRefillThreshold(parseInt(e.target.value, 10) || 7)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Prescribing Doctor (Optional)
              </label>
              <input
                type="text"
                value={prescribingDoctor}
                onChange={e => setPrescribingDoctor(e.target.value)}
                placeholder="e.g. Dr. Wells, MD"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Rx Number (Optional)
              </label>
              <input
                type="text"
                value={rxNumber}
                onChange={e => setRxNumber(e.target.value)}
                placeholder="e.g. RX-774910"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Note: MediSync helps you track adherence to your existing prescription. MediSync does not recommend medications or change prescribed dosages.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
            >
              {medicineToEdit ? 'Save Changes' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
