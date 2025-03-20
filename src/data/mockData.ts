
import { User, Patient, Doctor, Secretary, Appointment, Examination, Clinic, UserRole, StatsData } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    role: 'doctor',
    phone: '+90 555 123 4567',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 2,
    firstName: 'Ayşe',
    lastName: 'Demir',
    email: 'ayse.demir@example.com',
    role: 'secretary',
    phone: '+90 555 765 4321',
    profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 3,
    firstName: 'Mehmet',
    lastName: 'Kaya',
    email: 'mehmet.kaya@example.com',
    role: 'patient',
    phone: '+90 555 987 6543',
    profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: 4,
    firstName: 'Zeynep',
    lastName: 'Çelik',
    email: 'zeynep.celik@example.com',
    role: 'patient',
    phone: '+90 555 345 6789',
    profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 5,
    firstName: 'Ali',
    lastName: 'Öztürk',
    email: 'ali.ozturk@example.com',
    role: 'doctor',
    phone: '+90 555 678 9012',
    profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];

// Mock Clinics
export const mockClinics: Clinic[] = [
  {
    id: 1,
    name: 'Anadolu Tıp Merkezi',
    address: 'Bağdat Caddesi No: 123, Kadıköy, İstanbul',
    phone: '+90 216 555 1234',
  },
  {
    id: 2,
    name: 'Acıbadem Hastanesi',
    address: 'Ataşehir Bulvarı No: 456, Ataşehir, İstanbul',
    phone: '+90 216 555 5678',
  },
];

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: 1,
    userId: 1,
    specialty: 'Kardiyoloji',
    clinicId: 1,
    user: mockUsers.find(u => u.id === 1),
    clinic: mockClinics.find(c => c.id === 1),
  },
  {
    id: 2,
    userId: 5,
    specialty: 'Nöroloji',
    clinicId: 2,
    user: mockUsers.find(u => u.id === 5),
    clinic: mockClinics.find(c => c.id === 2),
  },
];

// Mock Secretaries
export const mockSecretaries: Secretary[] = [
  {
    id: 1,
    userId: 2,
    user: mockUsers.find(u => u.id === 2),
  },
];

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 1,
    firstName: 'Mehmet',
    lastName: 'Kaya',
    dob: new Date('1985-05-15'),
    email: 'mehmet.kaya@example.com',
    phone: '+90 555 987 6543',
    address: 'Mecidiyeköy Mah. No: 123, Şişli, İstanbul',
  },
  {
    id: 2,
    firstName: 'Zeynep',
    lastName: 'Çelik',
    dob: new Date('1990-10-20'),
    email: 'zeynep.celik@example.com',
    phone: '+90 555 345 6789',
    address: 'Bostancı Mah. No: 456, Kadıköy, İstanbul',
  },
  {
    id: 3,
    firstName: 'Emre',
    lastName: 'Şahin',
    dob: new Date('1978-12-03'),
    email: 'emre.sahin@example.com',
    phone: '+90 555 234 5678',
    address: 'Levent Mah. No: 789, Beşiktaş, İstanbul',
  },
  {
    id: 4,
    firstName: 'Seda',
    lastName: 'Yıldız',
    dob: new Date('1995-03-25'),
    email: 'seda.yildiz@example.com',
    phone: '+90 555 876 5432',
    address: 'Kozyatağı Mah. No: 321, Kadıköy, İstanbul',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    appointmentDate: new Date('2023-06-15T10:00:00'),
    status: 'completed',
    description: 'Rutin kontrol',
    patient: mockPatients.find(p => p.id === 1),
    doctor: mockDoctors.find(d => d.id === 1),
  },
  {
    id: 2,
    patientId: 2,
    doctorId: 1,
    appointmentDate: new Date('2023-06-16T11:30:00'),
    status: 'completed',
    description: 'Baş ağrısı şikayeti',
    patient: mockPatients.find(p => p.id === 2),
    doctor: mockDoctors.find(d => d.id === 1),
  },
  {
    id: 3,
    patientId: 3,
    doctorId: 2,
    appointmentDate: new Date('2023-06-17T14:00:00'),
    status: 'pending',
    description: 'Yıllık kontrol',
    patient: mockPatients.find(p => p.id === 3),
    doctor: mockDoctors.find(d => d.id === 2),
  },
  {
    id: 4,
    patientId: 4,
    doctorId: 2,
    appointmentDate: new Date('2023-06-18T15:30:00'),
    status: 'pending',
    description: 'Mide ağrısı şikayeti',
    patient: mockPatients.find(p => p.id === 4),
    doctor: mockDoctors.find(d => d.id === 2),
  },
  {
    id: 5,
    patientId: 1,
    doctorId: 2,
    appointmentDate: new Date('2023-06-20T09:00:00'),
    status: 'pending',
    description: 'Kontrol randevusu',
    patient: mockPatients.find(p => p.id === 1),
    doctor: mockDoctors.find(d => d.id === 2),
  },
];

// Mock Examinations
export const mockExaminations: Examination[] = [
  {
    id: 1,
    appointmentId: 1,
    diagnosis: 'Hipertansiyon',
    treatment: 'İlaç tedavisi ve diyet önerileri',
    notes: 'Hasta 6 ay sonra kontrole gelmeli',
    appointment: mockAppointments.find(a => a.id === 1),
  },
  {
    id: 2,
    appointmentId: 2,
    diagnosis: 'Migren',
    treatment: 'İlaç tedavisi ve stres yönetimi',
    notes: 'Baş ağrısı sıklığı artarsa erken kontrole gelmeli',
    appointment: mockAppointments.find(a => a.id === 2),
  },
];

// Mock Stats Data
export const mockStatsData: StatsData = {
  totalPatients: mockPatients.length,
  totalAppointments: mockAppointments.length,
  pendingAppointments: mockAppointments.filter(a => a.status === 'pending').length,
  completedAppointments: mockAppointments.filter(a => a.status === 'completed').length,
};

// Helper function to get a random user for demo login
export const getRandomUser = (role?: UserRole): User => {
  if (role) {
    const filteredUsers = mockUsers.filter(user => user.role === role);
    return filteredUsers[Math.floor(Math.random() * filteredUsers.length)];
  }
  return mockUsers[Math.floor(Math.random() * mockUsers.length)];
};

// Helper function to get appointments for a specific doctor
export const getDoctorAppointments = (doctorId: number): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.doctorId === doctorId);
};

// Helper function to get appointments for a specific patient
export const getPatientAppointments = (patientId: number): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.patientId === patientId);
};

// Helper function to get patient history (appointments and examinations)
export const getPatientHistory = (patientId: number) => {
  const appointments = getPatientAppointments(patientId);
  const examinationIds = appointments.map(a => a.id);
  const examinations = mockExaminations.filter(e => examinationIds.includes(e.appointmentId));
  
  return { appointments, examinations };
};

// Helper function to get doctor by user ID
export const getDoctorByUserId = (userId: number): Doctor | undefined => {
  return mockDoctors.find(doctor => doctor.userId === userId);
};

// Helper function to get secretary by user ID
export const getSecretaryByUserId = (userId: number): Secretary | undefined => {
  return mockSecretaries.find(secretary => secretary.userId === userId);
};

// Helper function to get a patient by ID
export const getPatientById = (patientId: number): Patient | undefined => {
  return mockPatients.find(patient => patient.id === patientId);
};

// Helper function to get a doctor by ID
export const getDoctorById = (doctorId: number): Doctor | undefined => {
  return mockDoctors.find(doctor => doctor.id === doctorId);
};

// Helper function to get user data
export const getUserById = (userId: number): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};
