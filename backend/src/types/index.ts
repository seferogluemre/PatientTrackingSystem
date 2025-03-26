// User Types
export enum UserRole {
    patient = "patient",
    doctor = "doctor",
    secretary = "secretary"
}

export interface CreateUserBody {
    first_name: string;
    last_name: string;
    tc_no: string;
    email: string;
    password: string;
    role: UserRole;
    birthDate: Date;
    specialty?: string;
    clinic_id?: number;
}

export interface UpdateUserBody {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    phone?: string;
    address?: string
}

// Appointment Types
export enum AppointmentStatus {
    pending = "pending",
    completed = "completed",
    cancelled = "cancelled"
}

export interface CreateAppointmentBody {
    patient_id: number,
    doctor_id: number,
    date: Date,
    status: AppointmentStatus,
    description: string,
    secretary_id: number,
}

export interface UpdateAppointmentBody {
    data?: Date,
    status?: AppointmentStatus,
}

// Examination Types
export interface CreateExaminationBody {
    appointment_id: number;
    diagnosis: string;
    treatment: string;
    notes?: string;
}

export interface UpdateExaminationBody {
    diagnosis?: string;
    treatment?: string;
    notes?: string;
}

// Clinic Types
export interface CreateClinicBody {
    name: string
}
export interface UpdateClinicBody {
    name: string;
}