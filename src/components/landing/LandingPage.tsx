import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Heart,
  Users,
  Brain,
  ArrowRight,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Sparkles,
  Pill,
  Lock,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../../types';
import { AuthModal } from '../auth/AuthModal';

export const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (role: UserRole, mode: 'login' | 'register') => {
    setSelectedRole(role);
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a href="#" className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              MediSync
            </span>
          </a>

          {/* Zone 2: 4-5 single-line clean text links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#care-rhythm" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Care Rhythm
            </a>
            <a href="#caregivers" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              For Caregivers
            </a>
            <a href="#security" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Privacy & Consent
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openAuth('patient', 'login')}
              className="hidden sm:inline-block text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('patient', 'register')}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full">
                <span>Intelligent Medication Adherence</span>
                <span aria-hidden="true">·</span>
                <span>Patient & Caregiver Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] text-balance">
                Take Control of Your Medication Journey.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                A smarter way to manage medication routines, understand adherence patterns and stay connected with the people who care. Every Dose Matters. Every Life Counts.
              </p>

              {/* Two Prominent Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={() => openAuth('patient', 'login')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Get Started as Patient</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => openAuth('caregiver', 'login')}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 text-teal-700" />
                  <span>Access Caregiver Portal</span>
                </button>
              </div>

              {/* Trust Evidence Adjacency */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-6 max-w-lg text-xs">
                <div>
                  <span className="text-2xl font-bold font-mono text-slate-950 block tabular-nums">
                    94.2%
                  </span>
                  <span className="text-slate-500">Avg. 30-Day Routine Adherence</span>
                </div>
                <div>
                  <span className="text-2xl font-bold font-mono text-slate-950 block tabular-nums">
                    4 Slots
                  </span>
                  <span className="text-slate-500">Circadian Care Rhythm™ Mapping</span>
                </div>
                <div>
                  <span className="text-2xl font-bold font-mono text-slate-950 block tabular-nums">
                    100%
                  </span>
                  <span className="text-slate-500">Patient Consent Protected</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Hero Image & Interactive Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 aspect-16/10">
                <img
                  src="/src/assets/images/hero_medisync_care_1793943654755.jpg"
                  alt="MediSync Patient and Caregiver reviewing medication schedule"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                      Shared Care Ecosystem
                    </span>
                    <p className="text-xs text-slate-200">
                      "MediSync bridges the gap between daily routines and peace of mind for family caregivers."
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Live Dose Card */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 p-4 shadow-lg hidden sm:block max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Dose Confirmed · 08:14 AM</span>
                    <span className="text-[11px] text-slate-500">Metformin HCl 500 mg with breakfast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How MediSync Works */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block mb-1">
              Streamlined Three-Step Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              How MediSync Empowers Better Health
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Designed specifically for patients with chronic conditions and the authorized family members who support them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Enter Prescribed Schedule</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log your existing physician prescriptions with clear dosage amounts, instructions, and target times. MediSync organizes them into circadian routines.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">One-Tap Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive timely gentle reminders. Confirm taken doses with a single tap to log verified timestamps, or record reasons if a dose was skipped.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Caregiver Synchronization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your authorized caregivers stay informed in real-time. Unconfirmed doses alert your care network before missed windows create health risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Feature: The Care Rhythm Showcase */}
      <section id="care-rhythm" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>The Signature MediSync Innovation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                MediSync Care Rhythm™
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instead of treating medication management as an endless list of alarms, Care Rhythm aligns your treatments with your body's natural circadian rhythms: Morning, Afternoon, Evening, and Night.
              </p>
              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Visual routine arcs that match meal and rest intervals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Identifies time-of-day drop-offs before routines fail</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Provides caregivers with actionable visibility</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => openAuth('patient', 'login')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Explore Interactive Care Rhythm
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <Sun className="w-5 h-5 text-teal-600" />
                    <span className="text-xs font-bold font-mono text-teal-700">95% Adherence</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Morning Routine</h4>
                  <p className="text-[11px] text-slate-500 font-mono">06:00 – 11:59 AM</p>
                  <p className="text-xs text-slate-600 mt-2">Metformin HCl · Lisinopril</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <CloudSun className="w-5 h-5 text-sky-600" />
                    <span className="text-xs font-bold font-mono text-sky-700">88% Adherence</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Afternoon Routine</h4>
                  <p className="text-[11px] text-slate-500 font-mono">12:00 – 16:59 PM</p>
                  <p className="text-xs text-slate-600 mt-2">Vitamin D3 & Calcium</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <Sunset className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold font-mono text-amber-600">68% Focus Slot</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Evening Routine</h4>
                  <p className="text-[11px] text-slate-500 font-mono">17:00 – 20:59 PM</p>
                  <p className="text-xs text-slate-600 mt-2">Metformin HCl (500 mg)</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <Moon className="w-5 h-5 text-slate-700" />
                    <span className="text-xs font-bold font-mono text-slate-700">72% Adherence</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Night Routine</h4>
                  <p className="text-[11px] text-slate-500 font-mono">21:00 – 05:59 AM</p>
                  <p className="text-xs text-slate-600 mt-2">Atorvastatin Calcium</p>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-3 text-xs text-teal-950 flex items-center gap-2">
                <Brain className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  <strong>Pattern Analysis:</strong> Evening routines benefit from 30-minute advance reminders anchored to dinner routines.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient & Caregiver Portals Split */}
      <section id="caregivers" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block mb-1">
              Two Tailored Environments
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              One Unified Healthcare Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Patient Portal Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Patient Portal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Engineered with senior-friendly large touch targets and accessible contrast. Patients easily confirm doses, track remaining pill supplies, view their Care Rhythm, and manage sharing permissions.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>One-tap dose confirmation with exact timestamp recording</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Missed dose reasoning log (nausea, forgot, ran out)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Refill stock alerts and prescription details</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuth('patient', 'login')}
                className="w-full py-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors"
              >
                Enter Patient Experience
              </button>
            </div>

            {/* Caregiver Portal Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Caregiver Portal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tailored for family caregivers and care coordinators. Provides multi-patient surveillance, instant alerts for unconfirmed doses, compliance reports, and the ability to send supportive cheers.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Multi-patient dashboard with live adherence percentages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Clinical missed dose notifications & alert triage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Exportable clinical adherence reports with doctor review format</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuth('caregiver', 'login')}
                className="w-full py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Enter Caregiver Experience
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Consent Policy */}
      <section id="security" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-teal-700 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-950">
            Patient Sovereignty & Privacy by Design
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Healthcare data requires uncompromising trust. MediSync implements consent-based sharing: caregivers only view what patients explicitly authorize. Access can be toggled or revoked at any moment with immediate effect.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight">MediSync</span>
            <span className="text-slate-500 text-xs ml-2">Every Dose Matters. Every Life Counts.</span>
          </div>

          <div className="flex items-center gap-6">
            <span>HIPAA-aligned Architecture</span>
            <span>·</span>
            <span>Consent-Governed Sharing</span>
            <span>·</span>
            <span>Support: support@medisync.health</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} MediSync Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={selectedRole}
        initialMode={authMode}
      />
    </div>
  );
};
