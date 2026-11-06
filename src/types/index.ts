export type UserRole = 'patient' | 'caregiver';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export type DoseStatus = 'confirmed' | 'missed' | 'pending' | 'unconfirmed';

export type MedicationForm = 'tablet' | 'capsule' | 'injection' | 'liquid' | 'inhaler' | 'drops' | 'patch';

export type MedicationFrequency = 'daily' | 'twice_daily' | 'thrice_daily' | 'four_times_daily' | 'specific_days' | 'as_needed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  condition: string; // e.g. "Type 2 Diabetes, Hypertension"
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  avatarUrl: string;
  inviteCode: string;
  shareConsent: {
    shareSchedule: boolean;
    shareAdherence: boolean;
    shareMissedAlerts: boolean;
    shareCareRhythm: boolean;
  };
  doctorName?: string;
  preferredHospital?: string;
}

export interface CaregiverProfile {
  id: string;
  userId: string;
  fullName: string;
  relationship: string; // e.g. "Adult Son", "Home Nurse", "Primary Caregiver"
  phone: string;
  organization?: string;
  avatarUrl: string;
}

export interface Medicine {
  id: string;
  patientId: string;
  name: string;
  brandName?: string;
  dosage: string; // e.g. "500 mg", "10 ml", "10 units"
  form: MedicationForm;
  color: string; // Hex or color key
  instructions: string; // e.g. "Take with food", "Take 30 mins before breakfast"
  frequency: MedicationFrequency;
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  timeSlots: TimeSlot[]; // ['morning', 'evening']
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  totalPills: number;
  remainingPills: number;
  refillThreshold: number;
  prescribingDoctor?: string;
  rxNumber?: string;
  notes?: string;
  active: boolean;
}

export interface MedicationSchedule {
  id: string;
  medicineId: string;
  patientId: string;
  timeSlot: TimeSlot;
  scheduledTime: string; // "08:00"
  dosage: string;
  daysOfWeek: number[]; // [0,1,2,3,4,5,6] (0 = Sunday)
}

export interface DoseRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  patientId: string;
  scheduleId?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  timeSlot: TimeSlot;
  dosage: string;
  form: MedicationForm;
  instructions: string;
  status: DoseStatus;
  confirmedAt?: string; // ISO timestamp
  missedAt?: string; // ISO timestamp
  missedReason?: string; // e.g. "Side effects", "Forgot", "Ran out", "Felt well"
  missedNote?: string;
  snoozedUntil?: string;
}

export interface CaregiverPatientConnection {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverEmail: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  status: 'active' | 'pending' | 'revoked';
  relationship: string;
  permissions: {
    viewSchedule: boolean;
    viewAdherence: boolean;
    receiveAlerts: boolean;
    viewCareRhythm: boolean;
  };
  connectedAt: string;
  lastActive?: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  type: 'dose_reminder' | 'missed_dose' | 'caregiver_alert' | 'connection_request' | 'cheer' | 'system';
  relatedPatientId?: string;
  relatedDoseId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdherenceInsight {
  patientId: string;
  generatedAt: string;
  overallRate: number; // 0 - 100
  weeklyRate: number;
  monthlyRate: number;
  bestSlot: TimeSlot;
  bestSlotRate: number;
  worstSlot: TimeSlot;
  worstSlotRate: number;
  missedReasonsBreakdown: { reason: string; count: number; percentage: number }[];
  qualitativeSummary: string;
  patterns: string[];
  recommendations: string[];
  source: 'rule-engine' | 'gemini-3.8-flash';
}

export interface CareRhythmSlotData {
  slot: TimeSlot;
  label: string;
  timeRange: string;
  totalScheduled: number;
  confirmed: number;
  missed: number;
  unconfirmed: number;
  adherenceRate: number;
  statusText: string;
  color: string;
  medicines: {
    id: string;
    name: string;
    dosage: string;
    time: string;
    instructions: string;
    status: DoseStatus;
    doseId?: string;
  }[];
}

export interface UserSettings {
  userId: string;
  notificationsEnabled: boolean;
  browserNotifications: boolean;
  reminderAdvanceMinutes: number; // e.g. 15, 30
  soundEnabled: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  highContrastMode: boolean;
  fontSize: 'normal' | 'large';
  autoMissedThresholdHours: number; // e.g. 2 hours after scheduled time
}
