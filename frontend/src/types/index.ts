export type UserRole = 'doctor' | 'secretary' | 'patient';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profilePicture?: string;
  tc_no?: string;
  birthDate?: string;
  firstName?: string;
  lastName?: string;
  tcNo?: string;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  dob: Date;
  email: string;
  phone?: string;
  address?: string;
  // Aliases for frontend compatibility
  birthDate?: string;
  firstName?: string;
  lastName?: string;
  user?: User;
}

export interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string;
  birthDate?: string;
  specialization?: string;
  tc_no?: string;
  user_id?: number;
  specialty?: string;
  clinic_id?: number;
  user?: {
    birthDate?: string;
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: UserRole;
  };
}

export interface Secretary {
  id: number;
  userId: number;
  user?: User;
}

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: Date;
  appointmentDate?: Date;
  patientId?: number;
  doctorId?: number;
  status: AppointmentStatus;
  description?: string;
  patient?: Patient;
  doctor?: Doctor;
  examination?: Examination;
}

export interface Examination {
  id: number;
  appointmentId: number;
  diagnosis: string;
  treatment: string;
  notes?: string;
  appointment?: Appointment;
}

export interface Clinic {
  id: number;
  name: string;
  address: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface StatsData {
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}
