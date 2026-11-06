import React, { useState } from 'react';
import {
  LayoutDashboard,
  Pill,
  Calendar,
  ClipboardList,
  BarChart3,
  HeartHandshake,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { PatientOverview } from './PatientOverview';
import { MyMedicines } from './MyMedicines';
import { MedicationSchedule } from './MedicationSchedule';
import { DoseTracker } from './DoseTracker';
import { MyInsights } from './MyInsights';
import { CaregiverConnection } from './CaregiverConnection';
import { PatientNotifications } from './PatientNotifications';
import { PatientProfileView } from './PatientProfile';
import { PatientSettings } from './PatientSettings';

export const PatientLayout: React.FC = () => {
  const { user, patientProfile, logout, demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!patientProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-center">
          <Pill className="w-10 h-10 text-teal-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Setting up Patient Profile...</h2>
          <p className="text-xs text-slate-500 mt-1">
            Loading your medication schedule and health records.
          </p>
          <button
            onClick={() => demoLogin('patient')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-xl"
          >
            Load Eleanor Vance (Demo Patient)
          </button>
        </div>
      </div>
    );
  }

  const unreadCount = storageService
    .getNotifications(patientProfile.userId)
    .filter(n => !n.isRead).length;

  const NAV_ITEMS = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'medicines', label: 'My Medicines', icon: Pill },
    { key: 'schedule', label: 'Medication Schedule', icon: Calendar },
    { key: 'tracker', label: 'Dose Tracker', icon: ClipboardList },
    { key: 'insights', label: 'My Insights', icon: BarChart3 },
    { key: 'caregivers', label: 'Caregiver Connection', icon: HeartHandshake },
    { key: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">MediSync</span>
          <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
            Patient
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 z-50 transition-transform md:translate-x-0 ${
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
                <span className="text-[10px] font-semibold text-teal-400 tracking-wider uppercase mt-1 block">
                  Patient Portal
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
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-400 text-slate-950">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Patient Account & Quick Switcher */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-3 px-2">
              {patientProfile.avatarUrl ? (
                <img
                  src={patientProfile.avatarUrl}
                  alt={patientProfile.fullName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-xs shrink-0">
                  {patientProfile.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {patientProfile.fullName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Age {patientProfile.age} · Patient
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => demoLogin('caregiver')}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-medium px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Switch to Caregiver Portal"
              >
                Switch to Caregiver
              </button>

              <button
                onClick={logout}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <PatientOverview
            patient={patientProfile}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}
        {activeTab === 'medicines' && <MyMedicines patient={patientProfile} />}
        {activeTab === 'schedule' && <MedicationSchedule patient={patientProfile} />}
        {activeTab === 'tracker' && <DoseTracker patient={patientProfile} />}
        {activeTab === 'insights' && <MyInsights patient={patientProfile} />}
        {activeTab === 'caregivers' && <CaregiverConnection patient={patientProfile} />}
        {activeTab === 'notifications' && <PatientNotifications patient={patientProfile} />}
        {activeTab === 'profile' && <PatientProfileView patient={patientProfile} />}
        {activeTab === 'settings' && <PatientSettings patient={patientProfile} />}
      </main>
    </div>
  );
};
