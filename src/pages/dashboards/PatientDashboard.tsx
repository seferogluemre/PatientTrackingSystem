
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope,
  FileText,
  PlusCircle,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import AppointmentCard from '@/components/ui-custom/AppointmentCard';
import StatsCard from '@/components/ui-custom/StatsCard';
import { User, Appointment, Patient, AppointmentStatus, Examination } from '@/types';

interface PatientDashboardProps {
  user: User;
}

interface ApiAppointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: AppointmentStatus;
  description: string;
  completed_at?: string;
  secretaryId?: number;
  patient?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    tc_no: string;
  };
  doctor?: {
    id: number;
    specialty: string;
    clinic_id: number;
    tc_no: string;
    first_name?: string;
    last_name?: string;
  };
  examination?: {
    id: number;
    diagnosis: string;
    treatment: string;
    notes?: string;
  };
}

interface ApiPatientData {
  email: string;
  first_name: string;
  tc_no: string;
  appointments: ApiAppointment[];
  last_name: string;
  id: number;
}

const PatientDashboard = ({ user }: PatientDashboardProps) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (user && user.id) {
        setLoading(true);
        try {
          // Fetch patient profile with appointments
          const response = await fetch(`http://localhost:3000/api/appointments/patient/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('clinicToken')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch patient appointments');
          }
          
          const data = await response.json();
          
          if (data && data.results) {
            // Convert API appointments to our app's Appointment type
            const formattedAppointments: Appointment[] = await Promise.all(
              data.results.map(async (appt: ApiAppointment) => {
                let doctorInfo = appt.doctor || {
                  id: appt.doctor_id,
                  specialty: '',
                  clinic_id: 0,
                  tc_no: ''
                };
                
                // If doctor details missing, try to fetch them
                if (!doctorInfo.first_name && appt.doctor_id) {
                  try {
                    const doctorResponse = await fetch(`http://localhost:3000/api/users/doctor/${appt.doctor_id}`);
                    if (doctorResponse.ok) {
                      const doctorData = await doctorResponse.json();
                      if (doctorData.results && doctorData.results.length > 0) {
                        doctorInfo = {
                          ...doctorInfo,
                          ...doctorData.results[0]
                        };
                      }
                    }
                  } catch (error) {
                    console.error('Error fetching doctor details:', error);
                  }
                }
                
                return {
                  id: appt.id,
                  patientId: appt.patient_id,
                  doctorId: appt.doctor_id,
                  appointmentDate: new Date(appt.appointment_date),
                  status: appt.status,
                  description: appt.description,
                  patient: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    dob: new Date(),
                    phone: user.phone || '',
                    address: ''
                  },
                  doctor: {
                    id: doctorInfo.id,
                    userId: 0,
                    specialty: doctorInfo.specialty,
                    clinicId: doctorInfo.clinic_id,
                    user: {
                      id: doctorInfo.id,
                      firstName: doctorInfo.first_name || '',
                      lastName: doctorInfo.last_name || '',
                      email: '',
                      role: 'doctor'
                    }
                  },
                  examination: appt.examination ? {
                    id: appt.examination.id,
                    appointmentId: appt.id,
                    diagnosis: appt.examination.diagnosis,
                    treatment: appt.examination.treatment,
                    notes: appt.examination.notes
                  } : undefined
                };
              })
            );
            
            setAppointments(formattedAppointments);
            
            const today = new Date();
            
            const upcoming = formattedAppointments
              .filter(appt => new Date(appt.appointmentDate) >= today && appt.status === 'pending')
              .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
            
            setUpcomingAppointments(upcoming);
            
            if (upcoming.length > 0) {
              setNextAppointment(upcoming[0]);
            }
            
            const past = formattedAppointments
              .filter(appt => new Date(appt.appointmentDate) < today || appt.status === 'completed' || appt.status === 'cancelled')
              .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
            
            setPastAppointments(past);
          } else {
            setAppointments([]);
            setUpcomingAppointments([]);
            setPastAppointments([]);
          }
        } catch (error) {
          console.error("Randevular yüklenirken hata oluştu:", error);
          toast.error("Randevular yüklenirken bir hata oluştu");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [user]);
  
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
        <div className="animate-pulse text-lg">Randevular yükleniyor...</div>
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
          <h1 className="text-2xl font-bold">Hoş geldiniz, {user.firstName} {user.lastName}</h1>
          <p className="text-slate-500 mt-1">
            {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
          </p>
        </div>
        
        <Button onClick={() => navigate('/appointments/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Randevu Al
        </Button>
      </motion.div>
      
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Toplam Randevu"
          value={appointments.length}
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatsCard
          title="Yaklaşan Randevular"
          value={upcomingAppointments.length}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: upcomingAppointments.length, isPositive: true }}
        />
        <StatsCard
          title="Geçmiş Muayeneler"
          value={pastAppointments.filter(a => a.status === 'completed').length}
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Sonraki Randevunuz</CardTitle>
              <CardDescription>
                Yaklaşan randevu bilgileriniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <div className="p-6 border rounded-lg bg-gradient-to-r from-clinic/5 to-clinic/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xl">
                        {format(new Date(nextAppointment.appointmentDate), 'd MMMM yyyy, EEEE', { locale: tr })}
                      </h3>
                      <p className="text-lg font-medium mt-1">
                        {format(new Date(nextAppointment.appointmentDate), 'HH:mm')}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm text-slate-600">
                          Doktor: {nextAppointment.doctor && nextAppointment.doctor.user 
                            ? `Dr. ${nextAppointment.doctor.user.firstName} ${nextAppointment.doctor.user.lastName}` 
                            : 'Belirtilmemiş'}
                        </p>
                        <p className="text-sm text-slate-600">
                          Uzmanlık: {nextAppointment.doctor ? nextAppointment.doctor.specialty : 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" 
                        onClick={() => navigate(`/appointments/${nextAppointment.id}`)}>
                        Detaylar
                      </Button>
                      <Button variant="outline"
                        onClick={() => navigate(`/appointments/${nextAppointment.id}/reschedule`)}>
                        Randevuyu Değiştir
                      </Button>
                    </div>
                  </div>
                  {nextAppointment.description && (
                    <div className="mt-4 p-3 bg-white/80 rounded border">
                      <p className="text-sm font-medium">Şikayet:</p>
                      <p className="text-sm">{nextAppointment.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-2 text-lg font-medium">Aktif randevunuz bulunmuyor</h3>
                  <p className="text-sm text-slate-500 mt-1">Yeni bir randevu almak için "Randevu Al" butonunu kullanabilirsiniz.</p>
                  <Button className="mt-4" onClick={() => navigate('/appointments/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Randevu Al
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Randevu Durumunuz</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="upcoming" className="flex-1">Yaklaşan Randevular</TabsTrigger>
                  <TabsTrigger value="past" className="flex-1">Geçmiş Randevular</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-clinic/10 text-clinic">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {format(new Date(appointment.appointmentDate), 'd MMMM', { locale: tr })}, {format(new Date(appointment.appointmentDate), 'HH:mm')}
                              </p>
                              <p className="text-sm text-slate-500">
                                Dr. {appointment.doctor && appointment.doctor.user 
                                  ? `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}` 
                                  : 'Belirtilmemiş'}
                                {appointment.doctor ? ` (${appointment.doctor.specialty})` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/appointments/${appointment.id}`)}
                            >
                              Detaylar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Clock className="mx-auto h-10 w-10 text-slate-300" />
                      <h3 className="mt-2 font-medium">Yaklaşan randevunuz bulunmuyor</h3>
                      <p className="text-sm text-slate-500 mt-1">Yeni bir randevu almak için "Randevu Al" butonunu kullanabilirsiniz.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {pastAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {pastAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 
                              ${appointment.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'}`
                            }>
                              {appointment.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {format(new Date(appointment.appointmentDate), 'd MMMM yyyy', { locale: tr })}, {format(new Date(appointment.appointmentDate), 'HH:mm')}
                              </p>
                              <p className="text-sm text-slate-500">
                                Dr. {appointment.doctor && appointment.doctor.user 
                                  ? `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}` 
                                  : 'Belirtilmemiş'}
                                {appointment.doctor ? ` (${appointment.doctor.specialty})` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {appointment.status === 'completed' && appointment.examination && (
                              <Button 
                                size="sm"
                                onClick={() => navigate(`/examinations/${appointment.examination.id}`)}
                              >
                                <FileText className="mr-1 h-4 w-4" />
                                Muayene Sonucu
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/appointments/${appointment.id}`)}
                            >
                              Detaylar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                      <h3 className="mt-2 font-medium">Geçmiş randevunuz bulunmuyor</h3>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/appointments')}>
                Tüm Randevuları Görüntüle
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.div variants={item} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Son Muayeneleriniz</CardTitle>
              <CardDescription>Geçmiş muayene sonuçlarınız</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastAppointments
                  .filter(appt => appt.status === 'completed' && appt.examination)
                  .slice(0, 3)
                  .map((appointment) => (
                    <div key={appointment.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {format(new Date(appointment.appointmentDate), 'd MMMM yyyy', { locale: tr })}
                          </p>
                          <p className="text-sm text-slate-500">
                            Dr. {appointment.doctor && appointment.doctor.user 
                              ? `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}` 
                              : 'Belirtilmemiş'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/examinations/${appointment.examination?.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {appointment.examination && (
                        <>
                          <div className="mt-2">
                            <p className="text-xs text-slate-500 font-medium">Teşhis:</p>
                            <p className="text-sm">{appointment.examination.diagnosis}</p>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-slate-500 font-medium">Tedavi:</p>
                            <p className="text-sm">{appointment.examination.treatment}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                
                {pastAppointments.filter(appt => appt.status === 'completed' && appt.examination).length === 0 && (
                  <div className="text-center py-6">
                    <Stethoscope className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-2 font-medium">Geçmiş muayeneniz bulunmuyor</h3>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/examinations')}>
                Tüm Muayene Kayıtlarını Görüntüle
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Kişisel Bilgileriniz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Ad Soyad</span>
                  <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">E-posta</span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Telefon</span>
                    <span className="text-sm font-medium">{user.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                Profilimi Düzenle
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PatientDashboard;
