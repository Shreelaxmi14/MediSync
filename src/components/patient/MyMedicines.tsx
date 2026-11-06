import React, { useState } from 'react';
import { Pill, Plus, Edit2, Trash2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PatientProfile, Medicine } from '../../types';
import { storageService } from '../../services/storageService';
import { AddMedicineModal } from '../modals/AddMedicineModal';

interface MyMedicinesProps {
  patient: PatientProfile;
}

export const MyMedicines: React.FC<MyMedicinesProps> = ({ patient }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const medicines = storageService.getMedicines(patient.id);

  const handleDelete = (id: string) => {
    storageService.deleteMedicine(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Prescription Catalog
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">My Medications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your prescribed medications, dosage times, and refill tracking
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMedicine(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prescribed Medicine</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Prescription Verification Reminder:</span> Enter medication names, dosages, and administration intervals exactly as prescribed by your licensed healthcare provider. MediSync does not independently alter prescribed regimens.
        </div>
      </div>

      {/* Medicines Grid */}
      {medicines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No medications logged yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add your current prescribed medications to start tracking doses, generating daily schedules, and mapping your Care Rhythm.
          </p>
          <button
            onClick={() => {
              setEditingMedicine(null);
              setIsAddModalOpen(true);
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors"
          >
            Add First Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map(med => {
            const isLowSupply = med.remainingPills <= med.refillThreshold;

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: med.color || '#0D9488' }}
                      >
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{med.name}</h3>
                        {med.brandName && (
                          <p className="text-xs text-slate-500">Brand: {med.brandName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMedicine(med);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit medicine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(med.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dosage</span>
                      <span className="font-semibold text-slate-800 font-mono">{med.dosage}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Form & Cadence</span>
                      <span className="font-medium text-slate-800 capitalize">
                        {med.form} · {med.frequency.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Times */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Times:</span>
                    </span>
                    {med.scheduledTimes.map(t => (
                      <span
                        key={t}
                        className="text-xs font-mono font-medium text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-lg"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Instructions */}
                  {med.instructions && (
                    <div className="mt-3 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-medium text-slate-800">Instructions:</span> {med.instructions}
                    </div>
                  )}
                </div>

                {/* Refill / Pill Stock Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isLowSupply ? (
                      <span className="flex items-center gap-1 text-rose-600 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Low supply: {med.remainingPills} left</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Supply: <span className="font-semibold text-slate-800 font-mono">{med.remainingPills}</span> / {med.totalPills} remaining
                      </span>
                    )}
                  </div>

                  {med.prescribingDoctor && (
                    <span className="text-slate-400 text-[11px]">
                      {med.prescribingDoctor}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-slate-900 text-sm">Delete Medication?</h3>
            <p className="text-xs text-slate-500 mt-2">
              This will remove this medication from your active list and cancel future unconfirmed dose reminders. Past dose adherence logs will be preserved.
            </p>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Delete Medicine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMedicine(null);
        }}
        patientId={patient.id}
        medicineToEdit={editingMedicine}
      />
    </div>
  );
};
