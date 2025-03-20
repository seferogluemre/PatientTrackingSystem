
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { 
  UserRound, 
  CalendarDays, 
  ClipboardCheck, 
  Clock,
  Users,
  CalendarClock,
  CheckCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Layout from '@/components/ui-custom/Layout';
import StatsCard from '@/components/ui-custom/StatsCard';
import AppointmentCard from '@/components/ui-custom/AppointmentCard';
import PatientCard from '@/components/ui-custom/PatientCard';
import { User, Appointment, Patient, AppointmentStatus, Doctor } from '@/types';
import { 
  mockStatsData, 
  mockAppointments, 
  mockPatients, 
  getDoctorByUserId,
  getPatientAppointments,
  getDoctorAppointments,
} from '@/data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  
  // Get the user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('clinicUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      if (parsedUser.role === 'doctor') {
        const doctorInfo = getDoctorByUserId(parsedUser.id);
        if (doctorInfo) {
          setDoctor(doctorInfo);
        }
      }
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  // Get appointments and patients based on user role
  useEffect(() => {
    if (user) {
      let appointments: Appointment[] = [];
      
      if (user.role === 'doctor' && doctor) {
        appointments = getDoctorAppointments(doctor.id);
      } else if (user.role === 'patient') {
        const patientWithSameEmail = mockPatients.find(p => p.email === user.email);
        if (patientWithSameEmail) {
          appointments = getPatientAppointments(patientWithSameEmail.id);
        }
      } else if (user.role === 'secretary') {
        appointments = [...mockAppointments];
      }
      
      // Sort appointments by date (newest first)
      appointments.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
      
      // Recent appointments (last 5)
      setRecentAppointments(appointments.slice(0, 5));
      
      // Today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayAppts = appointments.filter(appointment => {
        const apptDate = new Date(appointment.appointmentDate);
        return apptDate >= today && apptDate < tomorrow;
      });
      
      setTodayAppointments(todayAppts);
      
      // Recent patients (for doctor and secretary roles)
      if (user.role !== 'patient') {
        setRecentPatients(mockPatients.slice(0, 4));
      }
    }
  }, [user, doctor, navigate]);
  
  const handleStatusChange = (id: number, status: AppointmentStatus) => {
    // Update the status in both recent and today's appointments
    const updatedRecent = recentAppointments.map(appointment => 
      appointment.id === id ? { ...appointment, status } : appointment
    );
    
    const updatedToday = todayAppointments.map(appointment => 
      appointment.id === id ? { ...appointment, status } : appointment
    );
    
    setRecentAppointments(updatedRecent);
    setTodayAppointments(updatedToday);
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Welcome section */}
        <motion.div variants={item} className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hoş geldiniz, {user.firstName} {user.lastName}</h1>
            <p className="text-slate-500 mt-1">
              {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
            </p>
          </div>
          
          {(user.role === 'doctor' || user.role === 'secretary') && (
            <Button onClick={() => navigate('/appointments')}>
              <CalendarClock className="mr-2 h-4 w-4" />
              Randevu Oluştur
            </Button>
          )}
        </motion.div>
        
        {/* Stats cards */}
        {(user.role === 'doctor' || user.role === 'secretary') && (
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Toplam Hasta"
              value={mockStatsData.totalPatients}
              icon={<Users className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Toplam Randevu"
              value={mockStatsData.totalAppointments}
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <StatsCard
              title="Bekleyen Randevular"
              value={mockStatsData.pendingAppointments}
              icon={<Clock className="h-5 w-5" />}
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Tamamlanan Randevular"
              value={mockStatsData.completedAppointments}
              icon={<CheckCircle className="h-5 w-5" />}
              trend={{ value: 8, isPositive: true }}
            />
          </motion.div>
        )}
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <motion.div variants={item} className="lg:col-span-2 space-y-6">
            {/* Today's appointments */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Bugünkü Randevular</CardTitle>
                    <CardDescription>
                      {format(new Date(), 'd MMMM', { locale: tr })} tarihindeki randevularınız
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
                    Tümünü Gör
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {todayAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {todayAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            appointment.status === 'pending' 
                              ? 'bg-amber-100 text-amber-800' 
                              : appointment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status === 'pending' ? (
                              <Clock className="h-5 w-5" />
                            ) : appointment.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {format(new Date(appointment.appointmentDate), 'HH:mm')}
                            </p>
                            <p className="text-sm text-slate-500">
                              {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Hasta bilgisi yok'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Dr. {appointment.doctor && appointment.doctor.user ? `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}` : 'Doktor bilgisi yok'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {appointment.doctor ? appointment.doctor.specialty : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-lg font-medium">Bugün için randevu yok</h3>
                    <p className="text-sm text-slate-500 mt-1">Bugün için planlanmış randevunuz bulunmamaktadır.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent appointments */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Son Randevular</CardTitle>
                    <CardDescription>Son 5 randevunuz</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
                    Tümünü Gör
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      userRole={user.role}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Right column */}
          <motion.div variants={item} className="space-y-6">
            {/* User info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Profil Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-clinic/10 flex items-center justify-center flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <UserRound className="h-8 w-8 text-clinic" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-500">E-posta</span>
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-500">Telefon</span>
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                  {user.role === 'doctor' && doctor && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-slate-500">Uzmanlık</span>
                        <span className="text-sm">{doctor.specialty}</span>
                      </div>
                      {doctor.clinic && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-500">Klinik</span>
                          <span className="text-sm">{doctor.clinic.name}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                  Profili Görüntüle
                </Button>
              </CardFooter>
            </Card>
            
            {/* Recent patients (only for doctor and secretary) */}
            {(user.role === 'doctor' || user.role === 'secretary') && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Son Hastalar</CardTitle>
                      <CardDescription>Son eklenen hastalar</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
                      Tümünü Gör
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPatients.slice(0, 3).map((patient) => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        onViewHistory={() => navigate(`/patients/${patient.id}`)}
                        onCreateAppointment={() => navigate(`/appointments/new?patientId=${patient.id}`)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
