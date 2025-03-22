
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'framer-motion';
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
import { 
  mockStatsData, 
  mockAppointments, 
  mockPatients, 
  getDoctorByUserId,
  getDoctorAppointments,
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
  
  useEffect(() => {
    if (user) {
      const doctorInfo = getDoctorByUserId(user.id);
      if (doctorInfo) {
        setDoctor(doctorInfo);
        
        // Doktorun randevularını al
        const appointments = getDoctorAppointments(doctorInfo.id);
        
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
        
        // Son hastaları al (doktorun hastalarını)
        const patientIds = new Set(appointments.map(appt => appt.patientId));
        const doctorPatients = mockPatients.filter(patient => patientIds.has(patient.id));
        setRecentPatients(doctorPatients.slice(0, 4));
      }
    }
  }, [user]);
  
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hoş geldiniz, Dr. {user.firstName} {user.lastName}</h1>
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
          value={doctor?.id ? mockStatsData.totalPatients / 2 : 0}
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
