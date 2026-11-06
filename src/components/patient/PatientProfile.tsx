import React, { useState } from 'react';
import { User, Phone, MapPin, Heart, Shield, Save, Check } from 'lucide-react';
import { PatientProfile } from '../../types';
import { storageService } from '../../services/storageService';

interface PatientProfileProps {
  patient: PatientProfile;
}

export const PatientProfileView: React.FC<PatientProfileProps> = ({ patient }) => {
  const [fullName, setFullName] = useState(patient.fullName);
  const [age, setAge] = useState(patient.age);
  const [condition, setCondition] = useState(patient.condition);
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContact.name);
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContact.phone);
  const [emergencyRel, setEmergencyRel] = useState(patient.emergencyContact.relationship);
  const [doctorName, setDoctorName] = useState(patient.doctorName || '');
  const [hospital, setHospital] = useState(patient.preferredHospital || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientProfile = {
      ...patient,
      fullName: fullName.trim(),
      age: Number(age) || 65,
      condition: condition.trim(),
      doctorName: doctorName.trim() || undefined,
      preferredHospital: hospital.trim() || undefined,
      emergencyContact: {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relationship: emergencyRel.trim(),
      },
    };

    storageService.savePatient(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Personal Medical File
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">My Patient Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your chronic health conditions, clinical contacts, and emergency information
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-teal-600" /> Saved successfully
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Personal Demographics</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={age}
                onChange={e => setAge(parseInt(e.target.value, 10) || 65)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chronic Health Conditions / Clinical Profile
            </label>
            <input
              type="text"
              required
              value={condition}
              onChange={e => setCondition(e.target.value)}
              placeholder="e.g. Type 2 Diabetes, Hypertension, Hyperlipidemia"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enables contextual categorization of medications and helps caregivers understand treatment goals.
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Emergency Contact Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Full Name
              </label>
              <input
                type="text"
                required
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                required
                value={emergencyRel}
                onChange={e => setEmergencyRel(e.target.value)}
                placeholder="e.g. Adult Son, Spouse, Daughter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Phone Number
              </label>
              <input
                type="tel"
                required
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Clinical Care Team */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Prescribing Physician & Hospital</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Physician
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Katherine Wells, MD"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Hospital / Health Center
              </label>
              <input
                type="text"
                value={hospital}
                onChange={e => setHospital(e.target.value)}
                placeholder="e.g. Memorial Medical Center"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Information</span>
          </button>
        </div>
      </form>
    </div>
  );
};
