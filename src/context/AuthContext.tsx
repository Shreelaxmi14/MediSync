import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PatientProfile, CaregiverProfile } from '../types';
import { storageService, subscribeToStorage } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  patientProfile: PatientProfile | null;
  caregiverProfile: CaregiverProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => { success: boolean; error?: string };
  registerPatient: (data: {
    fullName: string;
    email: string;
    age: number;
    condition: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }) => { success: boolean; error?: string };
  registerCaregiver: (data: {
    fullName: string;
    email: string;
    relationship: string;
    phone: string;
    organization?: string;
  }) => { success: boolean; error?: string };
  demoLogin: (role: UserRole) => void;
  logout: () => void;
  refreshProfiles: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storageService.getCurrentUser());
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [caregiverProfile, setCaregiverProfile] = useState<CaregiverProfile | null>(null);

  const refreshProfiles = () => {
    const currentUser = storageService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      if (currentUser.role === 'patient') {
        const pat = storageService.getPatientByUserId(currentUser.id);
        setPatientProfile(pat || null);
        setCaregiverProfile(null);
      } else {
        const cg = storageService.getCaregiverByUserId(currentUser.id);
        setCaregiverProfile(cg || null);
        setPatientProfile(null);
      }
    } else {
      setPatientProfile(null);
      setCaregiverProfile(null);
    }
  };

  useEffect(() => {
    refreshProfiles();
    const unsubscribe = subscribeToStorage(() => {
      refreshProfiles();
    });
    return unsubscribe;
  }, []);

  const login = (email: string, role: UserRole) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = storageService.getUsers().find(
      u => u.email.toLowerCase() === cleanEmail && u.role === role
    );

    if (!existing) {
      return { success: false, error: `No active ${role} account found for this email address.` };
    }

    storageService.setCurrentUser(existing);
    refreshProfiles();
    return { success: true };
  };

  const demoLogin = (role: UserRole) => {
    if (role === 'patient') {
      const eleanor = storageService.getUsers().find(u => u.id === 'user_patient_1');
      if (eleanor) {
        storageService.setCurrentUser(eleanor);
      }
    } else {
      const david = storageService.getUsers().find(u => u.id === 'user_caregiver_1');
      if (david) {
        storageService.setCurrentUser(david);
      }
    }
    refreshProfiles();
  };

  const registerPatient = (data: {
    fullName: string;
    email: string;
    age: number;
    condition: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }) => {
    const existing = storageService.getUsers().find(
      u => u.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const userId = `user_pat_${Date.now()}`;
    const newUser: User = {
      id: userId,
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      role: 'patient',
      createdAt: new Date().toISOString(),
    };

    const newPatient: PatientProfile = {
      id: `pat_${Date.now()}`,
      userId,
      fullName: data.fullName.trim(),
      age: data.age,
      condition: data.condition.trim() || 'General Health Maintenance',
      emergencyContact: {
        name: data.emergencyContactName.trim() || 'Primary Contact',
        relationship: 'Family Member',
        phone: data.emergencyContactPhone.trim() || '+1 (555) 000-0000',
      },
      avatarUrl: '',
      inviteCode: `MS-${Math.floor(1000 + Math.random() * 9000)}`,
      shareConsent: {
        shareSchedule: true,
        shareAdherence: true,
        shareMissedAlerts: true,
        shareCareRhythm: true,
      },
    };

    storageService.saveUser(newUser);
    storageService.savePatient(newPatient);
    storageService.setCurrentUser(newUser);
    refreshProfiles();
    return { success: true };
  };

  const registerCaregiver = (data: {
    fullName: string;
    email: string;
    relationship: string;
    phone: string;
    organization?: string;
  }) => {
    const existing = storageService.getUsers().find(
      u => u.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const userId = `user_cg_${Date.now()}`;
    const newUser: User = {
      id: userId,
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      role: 'caregiver',
      createdAt: new Date().toISOString(),
    };

    const newCaregiver: CaregiverProfile = {
      id: `cg_${Date.now()}`,
      userId,
      fullName: data.fullName.trim(),
      relationship: data.relationship.trim() || 'Family Caregiver',
      phone: data.phone.trim() || '+1 (555) 000-0000',
      organization: data.organization?.trim() || '',
      avatarUrl: '',
    };

    storageService.saveUser(newUser);
    storageService.saveCaregiver(newCaregiver);
    storageService.setCurrentUser(newUser);
    refreshProfiles();
    return { success: true };
  };

  const logout = () => {
    storageService.setCurrentUser(null);
    setUser(null);
    setPatientProfile(null);
    setCaregiverProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        patientProfile,
        caregiverProfile,
        isAuthenticated: !!user,
        login,
        registerPatient,
        registerCaregiver,
        demoLogin,
        logout,
        refreshProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
