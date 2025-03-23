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
  UserPlus,
  CheckCircle,
  XCircle,
  ChevronRight,
  Clipboard,
  ListPlus,
  Building2,
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
import { User, Appointment, Patient, AppointmentStatus } from '@/types';
import { getAllAppointments, editAppointment } from '@/services/appointmentService';
import {
  mockStatsData,
  mockPatients,
} from '@/data/mockData';
import { getPatients } from '@/services/userService';

interface SecretaryDashboardProps {
  user: User;
}

const SecretaryDashboard = ({ user }: SecretaryDashboardProps) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchSecretaryData = async () => {
      setLoading(true);
      try {
        // Tüm randevuları getir
        const appointmentsData = await getAllAppointments();

        setAppointments(appointmentsData);

        // Bugünkü randevuları filtreleme
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        console.log("app data", appointmentsData)

        const todayAppts = appointmentsData?.results?.filter((appointment: Appointment) => {
          const apptDate = new Date(appointment.appointmentDate);
          return apptDate >= today && apptDate < tomorrow;
        });

        setTodayAppointments(todayAppts);

        // Son hastaları listeleme (şimdilik mock data)
        setRecentPatients(mockPatients.slice(0, 4));
      } catch (error) {
        console.error("Sekreter verileri yüklenirken hata oluştu:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    const getPatientsData = async () => {
      try {
        const patients = await getPatients();
        setPatients(patients)
      } catch (error) {

      }
    }

    fetchSecretaryData();
    getPatientsData();
  }, [user]);

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    try {
      // API'ye durum güncellemesi gönder
      await editAppointment(id, { status });

      // UI'ı güncelle
      const updatedAppointments = appointments.map(appointment =>
        appointment.id === id ? { ...appointment, status } : appointment
      );

      const updatedTodayAppointments = todayAppointments.map(appointment =>
        appointment.id === id ? { ...appointment, status } : appointment
      );

      setAppointments(updatedAppointments);
      setTodayAppointments(updatedTodayAppointments);

      toast.success(`Randevu durumu ${status === 'completed' ? 'tamamlandı' : status === 'cancelled' ? 'iptal edildi' : status} olarak güncellendi`);
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
          <h1 className="text-2xl font-bold">Hoş geldiniz, {user.first_name} {user.last_name}</h1>
          <p className="text-slate-500 mt-1">
            {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/patients/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Yeni Hasta
          </Button>
          <Button onClick={() => navigate('/appointments/new')}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Yeni Randevu
          </Button>
        </div>
      </motion.div>

      {/* İstatistik kartları */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Toplam Hasta"
          value={mockStatsData.totalPatients}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Toplam Randevu"
          value={appointments.length}
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatsCard
          title="Bugünkü Randevular"
          value={todayAppointments.length}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
        />
      </motion.div>

      {/* Ana içerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol kolon */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Bugünkü randevular */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Bugünkü Randevular</CardTitle>
                  <CardDescription>
                    {format(new Date(), 'd MMMM', { locale: tr })} tarihindeki randevular
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
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${appointment.status === 'pending'
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
                      <div className="flex flex-col md:flex-row gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Dr. {appointment.doctor && appointment.doctor.user ? `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}` : 'Doktor bilgisi yok'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {appointment.doctor ? appointment.doctor.specialty : ''}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                          >
                            Detaylar
                          </Button>
                          {appointment.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-2 text-lg font-medium">Bugün için randevu yok</h3>
                  <p className="text-sm text-slate-500 mt-1">Bugün için planlanmış randevu bulunmamaktadır.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hızlı İşlemler */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Hızlı İşlemler</CardTitle>
              <CardDescription>Sık kullanılan işlemlere hızlı erişim</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 py-2" onClick={() => navigate('/patients/new')}>
                  <UserPlus className="h-6 w-6" />
                  <span>Yeni Hasta Ekle</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 py-2" onClick={() => navigate('/appointments/new')}>
                  <CalendarDays className="h-6 w-6" />
                  <span>Randevu Oluştur</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 py-2" onClick={() => navigate('/patients')}>
                  <Users className="h-6 w-6" />
                  <span>Hasta Listesi</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 py-2" onClick={() => navigate('/appointments')}>
                  <ListPlus className="h-6 w-6" />
                  <span>Randevu Listesi</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 py-2" onClick={() => navigate('/clinics')}>
                  <Building2 className="h-6 w-6" />
                  <span>Klinik Yönetimi</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 py-2" onClick={() => navigate('/users')}>
                  <Users className="h-6 w-6" />
                  <span>Kullanıcı Yönetimi</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sağ kolon */}
        <motion.div variants={item} className="space-y-6">
          {/* Son eklenen hastalar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Son Eklenen Hastalar</CardTitle>
                  <CardDescription>Son eklenen hasta kayıtları</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
                  Tümünü Gör
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.slice(0, 3).map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onViewHistory={() => navigate(`/patients/${patient.tc_no}`)}
                    onCreateAppointment={() => navigate(`/appointments/new?patientId=${patient.id}`)}
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/patients/new')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Yeni Hasta Ekle
              </Button>
            </CardFooter>
          </Card>

          {/* Bekleyen Randevular */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Bekleyen Randevular</CardTitle>
              <CardDescription>Yaklaşan randevular</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments
                  ?.results?.filter(appointment => appointment.status === 'pending')
                  .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                  .slice(0, 3)
                  .map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      userRole="secretary"
                      onStatusChange={handleStatusChange}
                    />
                  ))}

                {appointments?.results?.filter(a => a.status === 'pending').length === 0 && (
                  <div className="text-center py-4">
                    <Clock className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-2 font-medium">Bekleyen randevu bulunmuyor</h3>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/appointments')}>
                Tüm Randevuları Görüntüle
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SecretaryDashboard;
