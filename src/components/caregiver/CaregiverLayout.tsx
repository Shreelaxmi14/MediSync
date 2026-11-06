import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  BarChart3,
  Bell,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { CaregiverOverview } from './CaregiverOverview';
import { MyPatients } from './MyPatients';
import { PatientDetailView } from './PatientDetailView';
import { CaregiverAlerts } from './CaregiverAlerts';
import { CaregiverReports } from './CaregiverReports';
import { CaregiverProfileView } from './CaregiverProfileView';
import { CaregiverSettingsView } from './CaregiverSettingsView';

export const CaregiverLayout: React.FC = () => {
  const { user, caregiverProfile, logout, demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!caregiverProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-center">
          <ShieldCheck className="w-10 h-10 text-teal-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Setting up Caregiver Station...</h2>
          <p className="text-xs text-slate-500 mt-1">
            Loading your connected patient roster and alert telemetry.
          </p>
          <button
            onClick={() => demoLogin('caregiver')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl"
          >
            Load Dr. David Vance (Demo Caregiver)
          </button>
        </div>
      </div>
    );
  }

  const unreadAlerts = storageService
    .getNotifications(caregiverProfile.userId)
    .filter(n => !n.isRead).length;

  const NAV_ITEMS = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'patients', label: 'My Patients', icon: Users },
    { key: 'activity', label: 'Patient Activity', icon: Activity },
    { key: 'adherence', label: 'Medication Adherence', icon: BarChart3 },
    { key: 'alerts', label: 'Alerts & Notifications', icon: Bell, badge: unreadAlerts },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-teal-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">MediSync</span>
          <span className="text-[10px] uppercase font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
            Caregiver
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 text-white flex flex-col justify-between shrink-0 z-50 transition-transform md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Brand Header */}
          <div className="pb-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block leading-none">
                  MediSync
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1 block">
                  Caregiver Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="my-5 space-y-1 overflow-y-auto flex-1 pr-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key && !selectedPatientId;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setSelectedPatientId(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Caregiver Account & Switcher */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-3 px-2">
              {caregiverProfile.avatarUrl ? (
                <img
                  src={caregiverProfile.avatarUrl}
                  alt={caregiverProfile.fullName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {caregiverProfile.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {caregiverProfile.fullName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {caregiverProfile.relationship}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => demoLogin('patient')}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-medium px-2 py-1 rounded-lg hover:bg-slate-900 transition-colors"
                title="Switch to Patient Portal"
              >
                Switch to Patient
              </button>

              <button
                onClick={logout}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {selectedPatientId ? (
          <PatientDetailView
            caregiver={caregiverProfile}
            patientId={selectedPatientId}
            onBack={() => setSelectedPatientId(null)}
          />
        ) : (
          <>
            {activeTab === 'overview' && (
              <CaregiverOverview
                caregiver={caregiverProfile}
                onSelectPatient={handleSelectPatient}
                onNavigateTab={tab => setActiveTab(tab)}
              />
            )}
            {activeTab === 'patients' && (
              <MyPatients
                caregiver={caregiverProfile}
                onSelectPatient={handleSelectPatient}
              />
            )}
            {activeTab === 'activity' && (
              <MyPatients
                caregiver={caregiverProfile}
                onSelectPatient={handleSelectPatient}
              />
            )}
            {activeTab === 'adherence' && (
              <CaregiverReports caregiver={caregiverProfile} />
            )}
            {activeTab === 'alerts' && (
              <CaregiverAlerts caregiver={caregiverProfile} />
            )}
            {activeTab === 'reports' && (
              <CaregiverReports caregiver={caregiverProfile} />
            )}
            {activeTab === 'profile' && (
              <CaregiverProfileView caregiver={caregiverProfile} />
            )}
            {activeTab === 'settings' && (
              <CaregiverSettingsView caregiver={caregiverProfile} />
            )}
          </>
        )}
      </main>
    </div>
  );
};
