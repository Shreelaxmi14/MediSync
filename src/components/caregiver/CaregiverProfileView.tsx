import React, { useState } from 'react';
import { User, Phone, Building, Save, Check, Shield } from 'lucide-react';
import { CaregiverProfile } from '../../types';
import { storageService } from '../../services/storageService';

interface CaregiverProfileViewProps {
  caregiver: CaregiverProfile;
}

export const CaregiverProfileView: React.FC<CaregiverProfileViewProps> = ({ caregiver }) => {
  const [fullName, setFullName] = useState(caregiver.fullName);
  const [relationship, setRelationship] = useState(caregiver.relationship);
  const [phone, setPhone] = useState(caregiver.phone);
  const [organization, setOrganization] = useState(caregiver.organization || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CaregiverProfile = {
      ...caregiver,
      fullName: fullName.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
      organization: organization.trim() || undefined,
    };

    storageService.saveCaregiver(updated);
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
              Caregiver Account
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Caregiver Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your caregiver credentials, healthcare affiliations, and contact information
          </p>
        </div>

        {isSaved && (
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-teal-600" /> Saved successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Professional & Personal Details</h3>

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
              Relationship / Role
            </label>
            <input
              type="text"
              required
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              placeholder="e.g. Son, Daughter, Home Health Nurse, Attending Physician"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Healthcare Organization (Optional)
            </label>
            <input
              type="text"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="e.g. Cascade Health Network, Private Practice"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
