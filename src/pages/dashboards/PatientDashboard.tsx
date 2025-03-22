
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { 
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
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
import { 
  mockAppointments,
  mockPatients,
  getPatientAppointments,
} from '@/data/mockData';

interface PatientDashboardProps {
  user: User;
}

const PatientDashboard = ({ user }: PatientDashboardProps) => {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  
  useEffect(() => {
    if (user) {
      // Kullanıcı email'ine göre hasta bilgisini al
      const patientInfo = mockPatients.find(p => p.email === user.email);
      
      if (patientInfo) {
        setPatientId(patientInfo.id);
        
        // Hastanın randevularını al
        const patientAppointments = getPatientAppointments(patientInfo.id);
        
        setAppointments(patientAppointments);
        
        // Bugünün tarihi
        const today = new Date();
        
        // Gelecek randevular
        const upcoming = patientAppointments
          .filter(appt => new Date(appt.appointmentDate) >= today)
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
        
        setUpcomingAppointments(upcoming);
        
        // Bir sonraki randevu
        if (upcoming.length > 0) {
          setNextAppointment(upcoming[0]);
        }
        
        // Geçmiş randevular
        const past = patientAppointments
          .filter(appt => new Date(appt.appointmentDate) < today || appt.status === 'completed')
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
        
        setPastAppointments(past);
      }
    }
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
      
      {/* İstatistikler */}
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
      
      {/* Ana içerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol kolon */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Sonraki randevu */}
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
          
          {/* Randevu geçmişi ve yaklaşan randevular */}
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
        
        {/* Sağ kolon */}
        <motion.div variants={item} className="space-y-6">
          {/* Son Muayeneler */}
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
          
          {/* Kişisel Bilgiler */}
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
