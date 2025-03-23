import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  CalendarDays, 
  Clock,
  Users,
  CheckCircle,
  XCircle,
  ChevronRight,
  Stethoscope,
  ClipboardList,
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
import AppointmentCard from '@/components/ui-custom/AppointmentCard';
import StatsCard from '@/components/ui-custom/StatsCard';
import PatientCard from '@/components/ui-custom/PatientCard';
import { User, Appointment, Patient, AppointmentStatus, Doctor } from '@/types';
import { getAllAppointments, editAppointment } from '@/services/appointmentService';
import { getPatients } from '@/services/userService';
import { 
  mockStatsData, 
  getDoctorByUserId,
} from '@/data/mockData';

interface DoctorDashboardProps {
  user: User;
}

const DoctorDashboard = ({ user }: DoctorDashboardProps) => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Şimdilik mock data kullanıyoruz, backend hazır olduğunda gerçek API'ye bağlanacak
          const doctorInfo = getDoctorByUserId(user.id);
          if (doctorInfo) {
            setDoctor(doctorInfo);
            
            // Tüm randevuları getir
            const response = await fetch('http://localhost:3000/api/appointments');
            const data = await response.json();
            
            if (data && data.results) {
              // Doktorun randevularını filtrele
              const doctorAppointments = data.results.filter(
                (appointment: any) => appointment.doctor_id === doctorInfo.id
              );
              
              // Format appointments
              const formattedAppointments = doctorAppointments.map((appointment: any) => ({
                id: appointment.id,
                patientId: appointment.patient_id,
                doctorId: appointment.doctor_id,
                appointmentDate: new Date(appointment.appointment_date),
                status: appointment.status as AppointmentStatus,
                description: appointment.description,
                patient: appointment.patient ? {
                  id: appointment.patient.id,
                  firstName: appointment.patient.first_name,
                  lastName: appointment.patient.last_name,
                  email: appointment.patient.email,
                  dob: new Date(),
                  phone: appointment.patient.phone || '',
                  address: appointment.patient.address || ''
                } : undefined,
                doctor: appointment.doctor ? {
                  id: appointment.doctor.id,
                  userId: 0,
                  specialty: appointment.doctor.specialty,
                  clinicId: appointment.doctor.clinic_id,
                  user: {
                    id: 0,
                    firstName: '',
                    lastName: '',
                    email: '',
                    role: 'doctor'
                  }
                } : undefined,
                examination: appointment.examination
              }));
              
              // Sort appointments by date (newest first)
              formattedAppointments.sort((a: Appointment, b: Appointment) => 
                new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
              );
              
              // Recent appointments (last 5)
              setRecentAppointments(formattedAppointments.slice(0, 5));
              
              // Today's appointments
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const todayAppts = formattedAppointments.filter((appointment: Appointment) => {
                const apptDate = new Date(appointment.appointmentDate);
                return apptDate >= today && apptDate < tomorrow;
              });
              
              setTodayAppointments(todayAppts);
              
              // Fetch patients
              const patientsResponse = await fetch('http://localhost:3000/api/users/patients');
              const patientsData = await patientsResponse.json();
              
              if (patientsData && patientsData.results) {
                // Format patients
                const formattedPatients = patientsData.results.map((patient: any) => ({
                  id: patient.id,
                  firstName: patient.first_name,
                  lastName: patient.last_name,
                  email: patient.email,
                  dob: new Date(),
                  phone: patient.phone || '',
                  address: patient.address || ''
                }));
                
                // Filter patients for this doctor
                const patientIds = new Set(formattedAppointments.map((appt: Appointment) => appt.patientId));
                const doctorPatients = formattedPatients.filter((patient: Patient) => patientIds.has(patient.id));
                
                setRecentPatients(doctorPatients.slice(0, 4));
              }
            }
          }
        } catch (error) {
          console.error("Doktor verileri yüklenirken hata oluştu:", error);
          toast.error("Veriler yüklenirken bir hata oluştu");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDoctorData();
  }, [user]);
  
  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    try {
      // API'ye durum güncellemesi gönder
      await fetch(`http://localhost:3000/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('clinicToken')}`
        },
        body: JSON.stringify({ status })
      });
      
      // UI'ı güncelle
      const updatedRecent = recentAppointments.map(appointment => 
        appointment.id === id ? { ...appointment, status } : appointment
      );
      
      const updatedToday = todayAppointments.map(appointment => 
        appointment.id === id ? { ...appointment, status } : appointment
      );
      
      setRecentAppointments(updatedRecent);
      setTodayAppointments(updatedToday);
      
      toast.success(`Randevu durumu ${status === 'completed' ? 'tamamlandı' : status} olarak güncellendi`);
    } catch (error) {
      console.error("Randevu durumu güncellenirken hata:", error);
      toast.error("Randevu durumu güncellenirken bir hata oluştu");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg">Veriler yükleniyor...</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hoş geldiniz, Dr. {user.firstName || user.first_name} {user.lastName || user.last_name}</h1>
          <p className="text-slate-500 mt-1">
            {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
          </p>
        </div>
        
        <Button onClick={() => navigate('/appointments/new')}>
          <CalendarDays className="mr-2 h-4 w-4" />
          Yeni Randevu
        </Button>
      </motion.div>
      
      {/* Stats kartları */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Toplam Hasta"
          value={doctor?.id ? recentPatients.length : 0}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Bugünkü Randevular"
          value={todayAppointments.length}
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatsCard
          title="Bekleyen Randevular"
          value={recentAppointments.filter(a => a.status === 'pending').length}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Tamamlanan Muayeneler"
          value={recentAppointments.filter(a => a.status === 'completed').length}
          icon={<Stethoscope className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
      </motion.div>
      
      {/* Ana içerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol kolon */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Bugünün randevuları */}
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
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/examinations/new?appointmentId=${appointment.id}`)}
                        >
                          <ClipboardList className="mr-1 h-4 w-4" />
                          Muayene Et
                        </Button>
                        <Button 
                          size="sm" 
                          variant={appointment.status === 'completed' ? 'ghost' : 'default'}
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          disabled={appointment.status === 'completed'}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Tamamla
                        </Button>
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
          
          {/* Son Muayeneler */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Son Muayeneler</CardTitle>
                  <CardDescription>Tamamladığınız son muayeneler</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments
                  .filter(appointment => appointment.status === 'completed')
                  .slice(0, 3)
                  .map((appointment) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-medium">
                            {appointment.patient 
                              ? `${appointment.patient.firstName} ${appointment.patient.lastName}` 
                              : 'Hasta bilgisi yok'}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {format(new Date(appointment.appointmentDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/examinations/${appointment.examination?.id || 0}`)}
                        >
                          Detaylar
                        </Button>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="text-slate-700 font-medium">Şikayet:</p>
                        <p className="text-slate-600">{appointment.description || 'Belirtilmemiş'}</p>
                      </div>
                      {appointment.examination && (
                        <div className="mt-2 text-sm">
                          <p className="text-slate-700 font-medium">Teşhis:</p>
                          <p className="text-slate-600">{appointment.examination.diagnosis}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/examinations')}>
                Tüm Muayeneleri Görüntüle
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Sağ kolon */}
        <motion.div variants={item} className="space-y-6">
          {/* Yaklaşan Randevular */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Yaklaşan Randevular</CardTitle>
              <CardDescription>Önümüzdeki randevularınız</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments
                  .filter(appointment => appointment.status === 'pending')
                  .slice(0, 4)
                  .map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      userRole="doctor"
                      onStatusChange={handleStatusChange}
                    />
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/appointments')}>
                Tüm Randevuları Görüntüle
              </Button>
            </CardFooter>
          </Card>
          
          {/* Son Hastalar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Son Hastalar</CardTitle>
                  <CardDescription>Son muayene ettiğiniz hastalar</CardDescription>
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DoctorDashboard;
