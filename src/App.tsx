import MedicationReminders from "./MedicationReminders";
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { PatientLayout } from './components/patient/PatientLayout';
import { CaregiverLayout } from './components/caregiver/CaregiverLayout';

const AppContent: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  if (role === 'patient') {
    return <PatientLayout />;
  }

  if (role === 'caregiver') {
    return <CaregiverLayout />;
  }

  return <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <MedicationReminders />

    </AuthProvider>
  );
}
