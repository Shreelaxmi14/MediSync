import {
  User,
  PatientProfile,
  CaregiverProfile,
  Medicine,
  MedicationSchedule,
  DoseRecord,
  CaregiverPatientConnection,
  NotificationItem,
  AdherenceInsight,
  CareRhythmSlotData,
  UserSettings,
  TimeSlot,
  DoseStatus
} from '../types';

const STORAGE_KEYS = {
  USERS: 'medisync_users_v1',
  PATIENTS: 'medisync_patients_v1',
  CAREGIVERS: 'medisync_caregivers_v1',
  MEDICINES: 'medisync_medicines_v1',
  SCHEDULES: 'medisync_schedules_v1',
  DOSES: 'medisync_doses_v1',
  CONNECTIONS: 'medisync_connections_v1',
  NOTIFICATIONS: 'medisync_notifications_v1',
  SETTINGS: 'medisync_settings_v1',
  CURRENT_USER: 'medisync_current_user_v1',
};

// Event emitter for reactive updates
const listeners: Array<() => void> = [];
export const subscribeToStorage = (callback: () => void) => {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifySubscribers = () => {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
};

// Helper date utilities
export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const formatTimeString = (date = new Date()): string => {
  return date.toTimeString().slice(0, 5);
};

export const getTimeSlotForHour = (hour: number): TimeSlot => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// INITIAL SEED DATA
const SEED_USERS: User[] = [
  {
    id: 'user_patient_1',
    email: 'eleanor.vance@medisync.app',
    role: 'patient',
    fullName: 'Eleanor Vance',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'user_patient_2',
    email: 'robert.miller@medisync.app',
    role: 'patient',
    fullName: 'Robert Miller',
    createdAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 'user_caregiver_1',
    email: 'dr.david.vance@medisync.app',
    role: 'caregiver',
    fullName: 'Dr. David Vance',
    createdAt: '2026-10-01T08:30:00Z',
  },
];

const SEED_PATIENTS: PatientProfile[] = [
  {
    id: 'pat_1',
    userId: 'user_patient_1',
    fullName: 'Eleanor Vance',
    age: 68,
    condition: 'Type 2 Diabetes, Hypertension & Hyperlipidemia',
    emergencyContact: {
      name: 'Dr. David Vance',
      relationship: 'Son & Physician',
      phone: '+1 (555) 234-8901',
    },
    avatarUrl: '/src/assets/images/patient_avatar_eleanor_1793943653924.jpg',
    inviteCode: 'EV-8842',
    shareConsent: {
      shareSchedule: true,
      shareAdherence: true,
      shareMissedAlerts: true,
      shareCareRhythm: true,
    },
    doctorName: 'Dr. Katherine Wells, MD (Endocrinology)',
    preferredHospital: 'Memorial Medical Center',
  },
  {
    id: 'pat_2',
    userId: 'user_patient_2',
    fullName: 'Robert Miller',
    age: 74,
    condition: 'Post-Cardiac Bypass Recovery & Atrial Fibrillation',
    emergencyContact: {
      name: 'Sarah Miller',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543',
    },
    avatarUrl: '',
    inviteCode: 'RM-3319',
    shareConsent: {
      shareSchedule: true,
      shareAdherence: true,
      shareMissedAlerts: true,
      shareCareRhythm: true,
    },
    doctorName: 'Dr. James Harrison, MD (Cardiology)',
    preferredHospital: 'St. Jude Heart Institute',
  },
];

const SEED_CAREGIVERS: CaregiverProfile[] = [
  {
    id: 'cg_1',
    userId: 'user_caregiver_1',
    fullName: 'Dr. David Vance',
    relationship: 'Son & Primary Family Physician',
    phone: '+1 (555) 234-8901',
    organization: 'Cascade Health Network',
    avatarUrl: '/src/assets/images/caregiver_avatar_david_1793943655818.jpg',
  },
];

const SEED_MEDICINES: Medicine[] = [
  {
    id: 'med_1',
    patientId: 'pat_1',
    name: 'Metformin HCl',
    brandName: 'Glucophage',
    dosage: '500 mg',
    form: 'tablet',
    color: '#0D9488', // teal
    instructions: 'Take with food to reduce stomach upset',
    frequency: 'twice_daily',
    scheduledTimes: ['08:00', '20:00'],
    timeSlots: ['morning', 'evening'],
    startDate: '2026-08-01',
    totalPills: 60,
    remainingPills: 38,
    refillThreshold: 10,
    prescribingDoctor: 'Dr. Katherine Wells',
    rxNumber: 'RX-774910',
    notes: 'Primary medication for glycemic control',
    active: true,
  },
  {
    id: 'med_2',
    patientId: 'pat_1',
    name: 'Lisinopril',
    brandName: 'Zestril',
    dosage: '10 mg',
    form: 'tablet',
    color: '#3B82F6', // blue
    instructions: 'Take in the morning with a full glass of water',
    frequency: 'daily',
    scheduledTimes: ['08:00'],
    timeSlots: ['morning'],
    startDate: '2026-07-15',
    totalPills: 30,
    remainingPills: 14,
    refillThreshold: 7,
    prescribingDoctor: 'Dr. Katherine Wells',
    rxNumber: 'RX-882103',
    notes: 'Blood pressure control',
    active: true,
  },
  {
    id: 'med_3',
    patientId: 'pat_1',
    name: 'Atorvastatin Calcium',
    brandName: 'Lipitor',
    dosage: '20 mg',
    form: 'tablet',
    color: '#8B5CF6', // purple
    instructions: 'Take in the evening before bed',
    frequency: 'daily',
    scheduledTimes: ['21:30'],
    timeSlots: ['night'],
    startDate: '2026-08-10',
    totalPills: 30,
    remainingPills: 22,
    refillThreshold: 5,
    prescribingDoctor: 'Dr. Katherine Wells',
    rxNumber: 'RX-994121',
    notes: 'Lipid and cholesterol management',
    active: true,
  },
  {
    id: 'med_4',
    patientId: 'pat_1',
    name: 'Vitamin D3 & Calcium',
    brandName: 'Caltrate Plus',
    dosage: '1000 IU / 600 mg',
    form: 'capsule',
    color: '#F59E0B', // amber
    instructions: 'Take with midday lunch',
    frequency: 'daily',
    scheduledTimes: ['13:00'],
    timeSlots: ['afternoon'],
    startDate: '2026-09-01',
    totalPills: 90,
    remainingPills: 45,
    refillThreshold: 15,
    prescribingDoctor: 'Dr. Katherine Wells',
    rxNumber: 'OTC-10492',
    notes: 'Bone density support',
    active: true,
  },
  // Patient 2 meds
  {
    id: 'med_5',
    patientId: 'pat_2',
    name: 'Metoprolol Succinate',
    brandName: 'Toprol-XL',
    dosage: '50 mg',
    form: 'tablet',
    color: '#0D9488',
    instructions: 'Take morning with breakfast',
    frequency: 'daily',
    scheduledTimes: ['08:30'],
    timeSlots: ['morning'],
    startDate: '2026-09-15',
    totalPills: 30,
    remainingPills: 18,
    refillThreshold: 7,
    prescribingDoctor: 'Dr. James Harrison',
    rxNumber: 'RX-330192',
    active: true,
  },
  {
    id: 'med_6',
    patientId: 'pat_2',
    name: 'Aspirin Low Dose',
    brandName: 'Bayer',
    dosage: '81 mg',
    form: 'tablet',
    color: '#EF4444',
    instructions: 'Cardioprotective low dose',
    frequency: 'daily',
    scheduledTimes: ['08:30'],
    timeSlots: ['morning'],
    startDate: '2026-09-15',
    totalPills: 100,
    remainingPills: 82,
    refillThreshold: 15,
    prescribingDoctor: 'Dr. James Harrison',
    rxNumber: 'RX-330194',
    active: true,
  },
];

const SEED_CONNECTIONS: CaregiverPatientConnection[] = [
  {
    id: 'conn_1',
    caregiverId: 'cg_1',
    caregiverName: 'Dr. David Vance',
    caregiverEmail: 'dr.david.vance@medisync.app',
    patientId: 'pat_1',
    patientName: 'Eleanor Vance',
    patientEmail: 'eleanor.vance@medisync.app',
    status: 'active',
    relationship: 'Son & Primary Family Physician',
    permissions: {
      viewSchedule: true,
      viewAdherence: true,
      receiveAlerts: true,
      viewCareRhythm: true,
    },
    connectedAt: '2026-10-02T10:00:00Z',
    lastActive: '2026-11-05T20:15:00Z',
  },
  {
    id: 'conn_2',
    caregiverId: 'cg_1',
    caregiverName: 'Dr. David Vance',
    caregiverEmail: 'dr.david.vance@medisync.app',
    patientId: 'pat_2',
    patientName: 'Robert Miller',
    patientEmail: 'robert.miller@medisync.app',
    status: 'active',
    relationship: 'Attending Physician & Care Coordinator',
    permissions: {
      viewSchedule: true,
      viewAdherence: true,
      receiveAlerts: true,
      viewCareRhythm: true,
    },
    connectedAt: '2026-10-12T14:30:00Z',
    lastActive: '2026-11-05T18:00:00Z',
  },
];

// Generate 14 days of historical doses + today
const generateSeedDoseRecords = (): DoseRecord[] => {
  const records: DoseRecord[] = [];
  const today = new Date();

  // Generate 14 past days
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;

    // Eleanor Vance doses:
    // 1. Metformin Morning (08:00)
    records.push({
      id: `dose_ev_met_m_${dateStr}`,
      medicineId: 'med_1',
      medicineName: 'Metformin HCl 500 mg',
      patientId: 'pat_1',
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      timeSlot: 'morning',
      dosage: '500 mg',
      form: 'tablet',
      instructions: 'Take with breakfast',
      status: isToday ? 'confirmed' : (i % 7 === 3 ? 'missed' : 'confirmed'),
      confirmedAt: isToday ? `${dateStr}T08:14:22Z` : (i % 7 === 3 ? undefined : `${dateStr}T08:07:11Z`),
      missedAt: i % 7 === 3 && !isToday ? `${dateStr}T11:00:00Z` : undefined,
      missedReason: i % 7 === 3 && !isToday ? 'Felt slightly nauseated' : undefined,
    });

    // 2. Lisinopril Morning (08:00)
    records.push({
      id: `dose_ev_lis_m_${dateStr}`,
      medicineId: 'med_2',
      medicineName: 'Lisinopril 10 mg',
      patientId: 'pat_1',
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      timeSlot: 'morning',
      dosage: '10 mg',
      form: 'tablet',
      instructions: 'Take with full glass of water',
      status: isToday ? 'confirmed' : (i === 5 ? 'missed' : 'confirmed'),
      confirmedAt: isToday ? `${dateStr}T08:14:25Z` : (i === 5 ? undefined : `${dateStr}T08:07:45Z`),
      missedAt: i === 5 && !isToday ? `${dateStr}T11:00:00Z` : undefined,
      missedReason: i === 5 && !isToday ? 'Forgot / away from morning routine' : undefined,
    });

    // 3. Vitamin D3 Afternoon (13:00)
    records.push({
      id: `dose_ev_vit_a_${dateStr}`,
      medicineId: 'med_4',
      medicineName: 'Vitamin D3 & Calcium',
      patientId: 'pat_1',
      scheduledDate: dateStr,
      scheduledTime: '13:00',
      timeSlot: 'afternoon',
      dosage: '1000 IU',
      form: 'capsule',
      instructions: 'Take with lunch',
      status: isToday ? 'confirmed' : (i % 5 === 2 ? 'missed' : 'confirmed'),
      confirmedAt: isToday ? `${dateStr}T13:25:00Z` : (i % 5 === 2 ? undefined : `${dateStr}T13:10:00Z`),
      missedAt: i % 5 === 2 && !isToday ? `${dateStr}T16:00:00Z` : undefined,
      missedReason: i % 5 === 2 && !isToday ? 'Out running errands' : undefined,
    });

    // 4. Metformin Evening (20:00)
    records.push({
      id: `dose_ev_met_e_${dateStr}`,
      medicineId: 'med_1',
      medicineName: 'Metformin HCl 500 mg',
      patientId: 'pat_1',
      scheduledDate: dateStr,
      scheduledTime: '20:00',
      timeSlot: 'evening',
      dosage: '500 mg',
      form: 'tablet',
      instructions: 'Take with dinner',
      status: isToday ? 'pending' : (i % 4 === 1 ? 'missed' : 'confirmed'),
      confirmedAt: !isToday && i % 4 !== 1 ? `${dateStr}T20:22:10Z` : undefined,
      missedAt: !isToday && i % 4 === 1 ? `${dateStr}T23:00:00Z` : undefined,
      missedReason: !isToday && i % 4 === 1 ? 'Fell asleep early / forgot' : undefined,
    });

    // 5. Atorvastatin Night (21:30)
    records.push({
      id: `dose_ev_ato_n_${dateStr}`,
      medicineId: 'med_3',
      medicineName: 'Atorvastatin Calcium 20 mg',
      patientId: 'pat_1',
      scheduledDate: dateStr,
      scheduledTime: '21:30',
      timeSlot: 'night',
      dosage: '20 mg',
      form: 'tablet',
      instructions: 'Take at bedtime',
      status: isToday ? 'unconfirmed' : (i % 3 === 0 ? 'missed' : 'confirmed'),
      confirmedAt: !isToday && i % 3 !== 0 ? `${dateStr}T21:45:00Z` : undefined,
      missedAt: !isToday && i % 3 === 0 ? `${dateStr}T23:59:00Z` : undefined,
      missedReason: !isToday && i % 3 === 0 ? 'Fell asleep / skipped' : undefined,
    });

    // Robert Miller doses:
    records.push({
      id: `dose_rm_met_${dateStr}`,
      medicineId: 'med_5',
      medicineName: 'Metoprolol Succinate 50 mg',
      patientId: 'pat_2',
      scheduledDate: dateStr,
      scheduledTime: '08:30',
      timeSlot: 'morning',
      dosage: '50 mg',
      form: 'tablet',
      instructions: 'Take with breakfast',
      status: isToday ? 'confirmed' : (i % 6 === 2 ? 'missed' : 'confirmed'),
      confirmedAt: isToday ? `${dateStr}T08:35:00Z` : `${dateStr}T08:40:00Z`,
      missedReason: i % 6 === 2 && !isToday ? 'Felt dizzy in morning' : undefined,
    });
    records.push({
      id: `dose_rm_asp_${dateStr}`,
      medicineId: 'med_6',
      medicineName: 'Aspirin Low Dose 81 mg',
      patientId: 'pat_2',
      scheduledDate: dateStr,
      scheduledTime: '08:30',
      timeSlot: 'morning',
      dosage: '81 mg',
      form: 'tablet',
      instructions: 'Cardioprotective low dose',
      status: isToday ? 'confirmed' : 'confirmed',
      confirmedAt: isToday ? `${dateStr}T08:35:10Z` : `${dateStr}T08:40:30Z`,
    });
  }

  return records;
};

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientUserId: 'user_patient_1',
    recipientRole: 'patient',
    title: 'Evening Dose Reminder',
    message: 'Time for your Metformin HCl (500 mg) with dinner.',
    type: 'dose_reminder',
    relatedDoseId: `dose_ev_met_e_${getTodayDateString()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif_2',
    recipientUserId: 'user_patient_1',
    recipientRole: 'patient',
    title: 'Caregiver Cheer',
    message: 'Dr. David Vance: "Great job completing your morning routine on time, Mom!"',
    type: 'cheer',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'notif_3',
    recipientUserId: 'user_caregiver_1',
    recipientRole: 'caregiver',
    title: 'Adherence Milestone Reached',
    message: 'Eleanor Vance maintained 93% morning adherence over the last 14 days.',
    type: 'caregiver_alert',
    relatedPatientId: 'pat_1',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'notif_4',
    recipientUserId: 'user_caregiver_1',
    recipientRole: 'caregiver',
    title: 'Unconfirmed Dose Alert',
    message: 'Eleanor Vance has an unconfirmed evening dose pending from yesterday.',
    type: 'missed_dose',
    relatedPatientId: 'pat_1',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SEED_SETTINGS: UserSettings = {
  userId: 'user_patient_1',
  notificationsEnabled: true,
  browserNotifications: false,
  reminderAdvanceMinutes: 15,
  soundEnabled: true,
  emailAlerts: true,
  smsAlerts: false,
  highContrastMode: false,
  fontSize: 'normal',
  autoMissedThresholdHours: 2,
};

// STORAGE SERVICE CLASS
class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAREGIVERS)) {
      localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(SEED_CAREGIVERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(SEED_MEDICINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOSES)) {
      localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(generateSeedDoseRecords()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONNECTIONS)) {
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(SEED_CONNECTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify([SEED_SETTINGS]));
    }
  }

  // --- USERS & AUTH ---
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  }

  saveUser(user: User) {
    const users = this.getUsers().filter(u => u.id !== user.id);
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifySubscribers();
  }

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    notifySubscribers();
  }

  // --- PATIENTS & CAREGIVERS ---
  getPatients(): PatientProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return data ? JSON.parse(data) : SEED_PATIENTS;
    } catch {
      return SEED_PATIENTS;
    }
  }

  getPatientByUserId(userId: string): PatientProfile | undefined {
    return this.getPatients().find(p => p.userId === userId);
  }

  getPatientById(patientId: string): PatientProfile | undefined {
    return this.getPatients().find(p => p.id === patientId);
  }

  savePatient(patient: PatientProfile) {
    const list = this.getPatients().filter(p => p.id !== patient.id);
    list.push(patient);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(list));
    notifySubscribers();
  }

  getCaregivers(): CaregiverProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAREGIVERS);
      return data ? JSON.parse(data) : SEED_CAREGIVERS;
    } catch {
      return SEED_CAREGIVERS;
    }
  }

  getCaregiverByUserId(userId: string): CaregiverProfile | undefined {
    return this.getCaregivers().find(c => c.userId === userId);
  }

  getCaregiverById(caregiverId: string): CaregiverProfile | undefined {
    return this.getCaregivers().find(c => c.id === caregiverId);
  }

  saveCaregiver(caregiver: CaregiverProfile) {
    const list = this.getCaregivers().filter(c => c.id !== caregiver.id);
    list.push(caregiver);
    localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(list));
    notifySubscribers();
  }

  // --- MEDICINES ---
  getMedicines(patientId?: string): Medicine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      const list: Medicine[] = data ? JSON.parse(data) : SEED_MEDICINES;
      return patientId ? list.filter(m => m.patientId === patientId) : list;
    } catch {
      return [];
    }
  }

  addMedicine(med: Omit<Medicine, 'id'>): Medicine {
    const newMed: Medicine = {
      ...med,
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      active: true,
    };
    const meds = this.getMedicines();
    meds.push(newMed);
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(meds));

    // Generate today's dose records for this medicine
    this.generateTodayDosesForMedicine(newMed);

    notifySubscribers();
    return newMed;
  }

  updateMedicine(id: string, updates: Partial<Medicine>): Medicine | null {
    const meds = this.getMedicines();
    const index = meds.findIndex(m => m.id === id);
    if (index === -1) return null;

    meds[index] = { ...meds[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(meds));
    notifySubscribers();
    return meds[index];
  }

  deleteMedicine(id: string) {
    const meds = this.getMedicines().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(meds));

    // Also remove pending doses for this medicine
    const doses = this.getDoseRecords().filter(
      d => !(d.medicineId === id && (d.status === 'pending' || d.status === 'unconfirmed'))
    );
    localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(doses));

    notifySubscribers();
  }

  private generateTodayDosesForMedicine(med: Medicine) {
    const today = getTodayDateString();
    const existing = this.getDoseRecords().filter(
      d => d.medicineId === med.id && d.scheduledDate === today
    );

    if (existing.length === 0) {
      const newDoses: DoseRecord[] = med.scheduledTimes.map((time, idx) => {
        const hour = parseInt(time.split(':')[0], 10) || 8;
        const slot = getTimeSlotForHour(hour);

        return {
          id: `dose_${med.id}_${today}_${idx}`,
          medicineId: med.id,
          medicineName: `${med.name} ${med.dosage}`,
          patientId: med.patientId,
          scheduledDate: today,
          scheduledTime: time,
          timeSlot: slot,
          dosage: med.dosage,
          form: med.form,
          instructions: med.instructions,
          status: 'pending',
        };
      });

      const doses = this.getDoseRecords();
      doses.push(...newDoses);
      localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(doses));
    }
  }

  // --- DOSES & TRACKING ---
  getDoseRecords(patientId?: string): DoseRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOSES);
      let list: DoseRecord[] = data ? JSON.parse(data) : [];

      // Auto ensure today has doses if none exist
      const today = getTodayDateString();
      const hasToday = list.some(d => d.scheduledDate === today);
      if (!hasToday && list.length > 0) {
        const medicines = this.getMedicines();
        medicines.forEach(med => {
          if (!med.active) return;
          med.scheduledTimes.forEach((time, idx) => {
            const hour = parseInt(time.split(':')[0], 10) || 8;
            list.push({
              id: `dose_${med.id}_${today}_${idx}`,
              medicineId: med.id,
              medicineName: `${med.name} ${med.dosage}`,
              patientId: med.patientId,
              scheduledDate: today,
              scheduledTime: time,
              timeSlot: getTimeSlotForHour(hour),
              dosage: med.dosage,
              form: med.form,
              instructions: med.instructions,
              status: 'pending',
            });
          });
        });
        localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(list));
      }

      return patientId ? list.filter(d => d.patientId === patientId) : list;
    } catch {
      return [];
    }
  }

  confirmDose(doseId: string, customTimestamp?: string): DoseRecord | null {
    const doses = this.getDoseRecords();
    const index = doses.findIndex(d => d.id === doseId);
    if (index === -1) return null;

    const confirmedAt = customTimestamp || new Date().toISOString();
    doses[index] = {
      ...doses[index],
      status: 'confirmed',
      confirmedAt,
      missedReason: undefined,
      missedNote: undefined,
    };

    // Decrement pill count for medicine
    const medId = doses[index].medicineId;
    const medicines = this.getMedicines();
    const medIndex = medicines.findIndex(m => m.id === medId);
    if (medIndex !== -1 && medicines[medIndex].remainingPills > 0) {
      medicines[medIndex].remainingPills -= 1;
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    }

    localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(doses));
    notifySubscribers();
    return doses[index];
  }

  markDoseMissed(doseId: string, reason: string, note?: string): DoseRecord | null {
    const doses = this.getDoseRecords();
    const index = doses.findIndex(d => d.id === doseId);
    if (index === -1) return null;

    doses[index] = {
      ...doses[index],
      status: 'missed',
      missedAt: new Date().toISOString(),
      missedReason: reason,
      missedNote: note,
    };

    localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(doses));

    // If patient has authorized caregiver alerts for missed doses, trigger caregiver alert
    const patient = this.getPatientById(doses[index].patientId);
    if (patient?.shareConsent?.shareMissedAlerts) {
      const connections = this.getConnectionsForPatient(patient.id);
      connections.forEach(conn => {
        if (conn.status === 'active' && conn.permissions.receiveAlerts) {
          const caregiver = this.getCaregiverById(conn.caregiverId);
          if (caregiver) {
            this.addNotification({
              recipientUserId: caregiver.userId,
              recipientRole: 'caregiver',
              title: `Missed Dose Alert: ${patient.fullName}`,
              message: `${patient.fullName} reported missing ${doses[index].medicineName} scheduled at ${doses[index].scheduledTime}. Reason: "${reason}".`,
              type: 'missed_dose',
              relatedPatientId: patient.id,
              relatedDoseId: doseId,
              isRead: false,
            });
          }
        }
      });
    }

    notifySubscribers();
    return doses[index];
  }

  snoozeDose(doseId: string, minutes = 15): DoseRecord | null {
    const doses = this.getDoseRecords();
    const index = doses.findIndex(d => d.id === doseId);
    if (index === -1) return null;

    const snoozedUntil = new Date(Date.now() + minutes * 60000).toISOString();
    doses[index] = {
      ...doses[index],
      snoozedUntil,
    };

    localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(doses));
    notifySubscribers();
    return doses[index];
  }

  // --- CARE RHYTHM COMPUTATION ---
  getCareRhythmData(patientId: string, dateStr = getTodayDateString()): CareRhythmSlotData[] {
    const allDoses = this.getDoseRecords(patientId);
    const dayDoses = allDoses.filter(d => d.scheduledDate === dateStr);

    const slotConfigs: { slot: TimeSlot; label: string; timeRange: string; color: string }[] = [
      { slot: 'morning', label: 'Morning Routine', timeRange: '06:00 – 11:59', color: '#0D9488' },
      { slot: 'afternoon', label: 'Afternoon Routine', timeRange: '12:00 – 16:59', color: '#0284C7' },
      { slot: 'evening', label: 'Evening Routine', timeRange: '17:00 – 20:59', color: '#6366F1' },
      { slot: 'night', label: 'Night Routine', timeRange: '21:00 – 05:59', color: '#475569' },
    ];

    // Compute historical slot rate over past 14 days
    const past14DaysDoses = allDoses.filter(d => {
      const dDate = new Date(d.scheduledDate).getTime();
      const cutoff = Date.now() - 14 * 86400000;
      return dDate >= cutoff;
    });

    return slotConfigs.map(config => {
      const slotDayDoses = dayDoses.filter(d => d.timeSlot === config.slot);
      const slotHistoricalDoses = past14DaysDoses.filter(d => d.timeSlot === config.slot);

      const confirmedHistorical = slotHistoricalDoses.filter(d => d.status === 'confirmed').length;
      const totalHistorical = slotHistoricalDoses.filter(d => d.status === 'confirmed' || d.status === 'missed').length;
      const slotAdherenceRate = totalHistorical > 0 ? Math.round((confirmedHistorical / totalHistorical) * 100) : 100;

      const confirmed = slotDayDoses.filter(d => d.status === 'confirmed').length;
      const missed = slotDayDoses.filter(d => d.status === 'missed').length;
      const unconfirmed = slotDayDoses.filter(d => d.status === 'unconfirmed' || d.status === 'pending').length;

      let statusText = 'No medications scheduled';
      if (slotDayDoses.length > 0) {
        if (confirmed === slotDayDoses.length) {
          statusText = 'All doses confirmed';
        } else if (missed > 0) {
          statusText = `${missed} dose reported missed`;
        } else if (unconfirmed > 0) {
          statusText = `${unconfirmed} dose awaiting confirmation`;
        }
      }

      return {
        slot: config.slot,
        label: config.label,
        timeRange: config.timeRange,
        color: config.color,
        totalScheduled: slotDayDoses.length,
        confirmed,
        missed,
        unconfirmed,
        adherenceRate: slotAdherenceRate,
        statusText,
        medicines: slotDayDoses.map(d => ({
          id: d.medicineId,
          name: d.medicineName,
          dosage: d.dosage,
          time: d.scheduledTime,
          instructions: d.instructions,
          status: d.status,
          doseId: d.id,
        })),
      };
    });
  }

  // --- ADHERENCE ANALYTICS ---
  calculateAdherence(patientId: string, days = 7): {
    overallRate: number;
    weeklyRate: number;
    monthlyRate: number;
    dailyBreakdown: { date: string; dayName: string; confirmed: number; missed: number; rate: number }[];
    medicineBreakdown: { name: string; confirmed: number; missed: number; rate: number }[];
  } {
    const allDoses = this.getDoseRecords(patientId);
    const now = new Date();

    // Past 7 days breakdown
    const dailyBreakdown: { date: string; dayName: string; confirmed: number; missed: number; rate: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayDoses = allDoses.filter(item => item.scheduledDate === dateStr);
      const confirmed = dayDoses.filter(item => item.status === 'confirmed').length;
      const missed = dayDoses.filter(item => item.status === 'missed').length;
      const total = confirmed + missed;
      const rate = total > 0 ? Math.round((confirmed / total) * 100) : 100;

      dailyBreakdown.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        confirmed,
        missed,
        rate,
      });
    }

    // Weekly rate
    const weeklyDoses = allDoses.filter(item => {
      const diff = now.getTime() - new Date(item.scheduledDate).getTime();
      return diff <= 7 * 86400000;
    });
    const weeklyConfirmed = weeklyDoses.filter(item => item.status === 'confirmed').length;
    const weeklyTotal = weeklyDoses.filter(item => item.status === 'confirmed' || item.status === 'missed').length;
    const weeklyRate = weeklyTotal > 0 ? Math.round((weeklyConfirmed / weeklyTotal) * 100) : 100;

    // Monthly rate
    const monthlyDoses = allDoses.filter(item => {
      const diff = now.getTime() - new Date(item.scheduledDate).getTime();
      return diff <= 30 * 86400000;
    });
    const monthlyConfirmed = monthlyDoses.filter(item => item.status === 'confirmed').length;
    const monthlyTotal = monthlyDoses.filter(item => item.status === 'confirmed' || item.status === 'missed').length;
    const monthlyRate = monthlyTotal > 0 ? Math.round((monthlyConfirmed / monthlyTotal) * 100) : 100;

    // Overall rate
    const allCompleted = allDoses.filter(item => item.status === 'confirmed' || item.status === 'missed');
    const allConfirmed = allCompleted.filter(item => item.status === 'confirmed').length;
    const overallRate = allCompleted.length > 0 ? Math.round((allConfirmed / allCompleted.length) * 100) : 100;

    // Medicine-wise breakdown
    const medicines = this.getMedicines(patientId);
    const medicineBreakdown = medicines.map(med => {
      const medDoses = allDoses.filter(d => d.medicineId === med.id && (d.status === 'confirmed' || d.status === 'missed'));
      const confirmed = medDoses.filter(d => d.status === 'confirmed').length;
      const missed = medDoses.filter(d => d.status === 'missed').length;
      const rate = medDoses.length > 0 ? Math.round((confirmed / medDoses.length) * 100) : 100;
      return {
        name: med.name,
        confirmed,
        missed,
        rate,
      };
    });

    return {
      overallRate,
      weeklyRate,
      monthlyRate,
      dailyBreakdown,
      medicineBreakdown,
    };
  }

  // --- REASON ANALYSIS & INTELLIGENT INSIGHT ENGINE ---
  getAdherenceInsights(patientId: string): AdherenceInsight {
    const allDoses = this.getDoseRecords(patientId);
    const { overallRate, weeklyRate, monthlyRate } = this.calculateAdherence(patientId);

    // Group missed reasons
    const missedDoses = allDoses.filter(d => d.status === 'missed' && d.missedReason);
    const reasonCounts: Record<string, number> = {};
    missedDoses.forEach(d => {
      const r = d.missedReason || 'Unspecified';
      reasonCounts[r] = (reasonCounts[r] || 0) + 1;
    });

    const totalMissedWithReason = missedDoses.length || 1;
    const missedReasonsBreakdown = Object.entries(reasonCounts).map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / totalMissedWithReason) * 100),
    })).sort((a, b) => b.count - a.count);

    // Find best & worst time slot
    const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night'];
    const slotStats = slots.map(slot => {
      const slotDoses = allDoses.filter(d => d.timeSlot === slot && (d.status === 'confirmed' || d.status === 'missed'));
      const confirmed = slotDoses.filter(d => d.status === 'confirmed').length;
      const rate = slotDoses.length > 0 ? Math.round((confirmed / slotDoses.length) * 100) : 100;
      return { slot, rate, total: slotDoses.length };
    });

    slotStats.sort((a, b) => b.rate - a.rate);
    const best = slotStats[0] || { slot: 'morning', rate: 95 };
    const worst = slotStats[slotStats.length - 1] || { slot: 'evening', rate: 70 };

    // Format human-readable rule-based summary
    const qualitativeSummary = `Adherence is strongest during the ${best.slot} routine (${best.rate}% confirmation rate), reliably anchored around daily start routines. However, the ${worst.slot} routine experiences lower consistency (${worst.rate}%), with doses frequently delayed past the 2-hour confirmation window.`;

    const patterns = [
      `${best.slot.toUpperCase()} regularity remains above 90% across the 14-day tracking window.`,
      `${worst.slot.toUpperCase()} doses drop notably during social or travel evenings.`,
      missedReasonsBreakdown.length > 0
        ? `Top patient-reported factor: "${missedReasonsBreakdown[0].reason}" (${missedReasonsBreakdown[0].percentage}% of missed doses).`
        : `Doses are occasionally postponed when outside the home.`,
    ];

    const recommendations = [
      `Review reminder schedule: Shifting ${worst.slot} reminders 30 minutes earlier to coincide with dinner may improve follow-through.`,
      `Consider setting up a portable travel pill case for doses scheduled while away from home.`,
      `Caregiver synchronization: Keep your caregiver connected to receive gentle encouragement for evening routines.`,
    ];

    return {
      patientId,
      generatedAt: new Date().toISOString(),
      overallRate,
      weeklyRate,
      monthlyRate,
      bestSlot: best.slot,
      bestSlotRate: best.rate,
      worstSlot: worst.slot,
      worstSlotRate: worst.rate,
      missedReasonsBreakdown,
      qualitativeSummary,
      patterns,
      recommendations,
      source: 'rule-engine',
    };
  }

  // --- CAREGIVER CONNECTIONS & PERMISSIONS ---
  getConnections(): CaregiverPatientConnection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      return data ? JSON.parse(data) : SEED_CONNECTIONS;
    } catch {
      return SEED_CONNECTIONS;
    }
  }

  getConnectionsForCaregiver(caregiverId: string): CaregiverPatientConnection[] {
    return this.getConnections().filter(c => c.caregiverId === caregiverId && c.status === 'active');
  }

  getConnectionsForPatient(patientId: string): CaregiverPatientConnection[] {
    return this.getConnections().filter(c => c.patientId === patientId);
  }

  updateConsentPermissions(connectionId: string, permissions: CaregiverPatientConnection['permissions']) {
    const list = this.getConnections();
    const index = list.findIndex(c => c.id === connectionId);
    if (index !== -1) {
      list[index].permissions = { ...list[index].permissions, ...permissions };
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(list));
      notifySubscribers();
    }
  }

  revokeConnection(connectionId: string) {
    const list = this.getConnections();
    const index = list.findIndex(c => c.id === connectionId);
    if (index !== -1) {
      list[index].status = 'revoked';
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(list));
      notifySubscribers();
    }
  }

  connectPatientWithInviteCode(caregiverId: string, inviteCode: string): { success: boolean; message: string; patient?: PatientProfile } {
    const cleanCode = inviteCode.trim().toUpperCase();
    const patient = this.getPatients().find(p => p.inviteCode.toUpperCase() === cleanCode);

    if (!patient) {
      return { success: false, message: 'Invalid or expired invite code. Please check with the patient.' };
    }

    const caregiver = this.getCaregiverById(caregiverId);
    if (!caregiver) {
      return { success: false, message: 'Caregiver profile not found.' };
    }

    // Check if already connected
    const existing = this.getConnections().find(
      c => c.caregiverId === caregiverId && c.patientId === patient.id && c.status === 'active'
    );
    if (existing) {
      return { success: false, message: `You are already actively connected to ${patient.fullName}.` };
    }

    const newConnection: CaregiverPatientConnection = {
      id: `conn_${Date.now()}`,
      caregiverId,
      caregiverName: caregiver.fullName,
      caregiverEmail: caregiver.phone || 'Caregiver',
      patientId: patient.id,
      patientName: patient.fullName,
      patientEmail: '',
      status: 'active',
      relationship: caregiver.relationship,
      permissions: {
        viewSchedule: patient.shareConsent.shareSchedule,
        viewAdherence: patient.shareConsent.shareAdherence,
        receiveAlerts: patient.shareConsent.shareMissedAlerts,
        viewCareRhythm: patient.shareConsent.shareCareRhythm,
      },
      connectedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    const list = this.getConnections();
    list.push(newConnection);
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(list));

    // Notify patient
    this.addNotification({
      recipientUserId: patient.userId,
      recipientRole: 'patient',
      title: 'Caregiver Connected',
      message: `${caregiver.fullName} has connected to your care team using your invite code.`,
      type: 'connection_request',
      isRead: false,
    });

    notifySubscribers();
    return { success: true, message: `Successfully connected to ${patient.fullName}!`, patient };
  }

  sendCaregiverNudge(caregiverId: string, patientId: string, message: string) {
    const caregiver = this.getCaregiverById(caregiverId);
    const patient = this.getPatientById(patientId);
    if (!caregiver || !patient) return;

    this.addNotification({
      recipientUserId: patient.userId,
      recipientRole: 'patient',
      title: `Message from ${caregiver.fullName}`,
      message,
      type: 'cheer',
      isRead: false,
    });
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId?: string): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const list: NotificationItem[] = data ? JSON.parse(data) : SEED_NOTIFICATIONS;
      return userId ? list.filter(n => n.recipientUserId === userId) : list;
    } catch {
      return [];
    }
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt'>) {
    const newItem: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const list = this.getNotifications();
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    notifySubscribers();
  }

  markNotificationAsRead(id: string) {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      notifySubscribers();
    }
  }

  markAllNotificationsAsRead(userId: string) {
    const list = this.getNotifications();
    list.forEach(n => {
      if (n.recipientUserId === userId) n.isRead = true;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    notifySubscribers();
  }

  // --- USER SETTINGS ---
  getSettings(userId: string): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const list: UserSettings[] = data ? JSON.parse(data) : [SEED_SETTINGS];
      const found = list.find(s => s.userId === userId);
      return found || { ...SEED_SETTINGS, userId };
    } catch {
      return { ...SEED_SETTINGS, userId };
    }
  }

  updateSettings(userId: string, updates: Partial<UserSettings>): UserSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    let list: UserSettings[] = data ? JSON.parse(data) : [];
    const index = list.findIndex(s => s.userId === userId);

    let updated: UserSettings;
    if (index !== -1) {
      updated = { ...list[index], ...updates };
      list[index] = updated;
    } else {
      updated = { ...SEED_SETTINGS, userId, ...updates };
      list.push(updated);
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(list));
    notifySubscribers();
    return updated;
  }
}

export const storageService = new StorageService();
