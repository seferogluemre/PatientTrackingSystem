import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Appointment } from '@/types';
import { getDoctorExaminations, getExamination } from '@/services/examinationService';

interface AppointmentDetailsDialogProps {
  appointment: Appointment;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: {
    label: 'Bekliyor',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <Clock className="h-4 w-4" />,
  },
  completed: {
    label: 'Tamamlandı',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: 'İptal Edildi',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-4 w-4" />,
  },
};

const AppointmentDetailsDialog = ({ appointment, isOpen, onOpenChange }: AppointmentDetailsDialogProps) => {
  const [examinationData, setExaminationData] = useState<any>(null);
  const [doctorExaminations, setDoctorExaminations] = useState<any[]>([]);
  const [loadingExamination, setLoadingExamination] = useState(false);

  const { status, appointment_date, patient, doctor } = appointment;
  const statusInfo = statusConfig[status];

  useEffect(() => {
    // Eğer detay modalı açıldıysa ve randevu tamamlandıysa examination bilgisini getir
    if (isOpen && status === 'completed') {
      fetchExaminationData();
    }
  }, [isOpen, status, appointment.id]);

  const fetchExaminationData = async () => {
    try {
      setLoadingExamination(true);

      // localStorage'dan clinicUser bilgisini al ve JSON olarak parse et
      const clinicUserStr = localStorage.getItem('clinicUser');
      if (!clinicUserStr) {
        console.error("Kullanıcı bilgisi bulunamadı");
        return;
      }

      const clinicUser = JSON.parse(clinicUserStr);

      // Doktorun tüm muayenelerini getir
      const doctorExams = await getDoctorExaminations(clinicUser.id);
      setDoctorExaminations(doctorExams);
      console.log(doctorExams)
      // Bu randevuya ait muayene varsa detaylarını getir
      if (appointment.examination?.id) {
        const data = await getExamination(appointment.examination.id);
        setExaminationData(data);
      } else {
        // Bu randevuya ait muayene doktorun muayeneleri arasında mı?
        const appointmentExam = doctorExams.find(
          (exam) => exam.appointment.id === appointment.id
        );

        if (appointmentExam) {
          setExaminationData(appointmentExam);
        }
      }
    } catch (error) {
      console.error("Examination bilgisi getirilemedi:", error);
    } finally {
      setLoadingExamination(false);
    }
  };

  const formattedDate = appointment_date
    ? format(new Date(appointment_date), "dd MMM yyyy", { locale: tr })
    : "Geçersiz Tarih";

  console.log()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Randevu Detayı</DialogTitle>
          <DialogDescription>{formattedDate}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="font-medium">Durum:</p>
              <div className={cn('px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border', statusInfo.color)}>
                {statusInfo.icon}
                <span>{statusInfo.label}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <p className="font-medium">Hasta:</p>
              <p>{patient ? `${patient.first_name} ${patient.last_name}` : 'Bilinmiyor'}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-medium">Doktor:</p>
              <p>{doctor && doctor.user ? `Dr. ${doctor.user.first_name} ${doctor.user.last_name}` : 'Bilinmiyor'}</p>
            </div>

            {doctor && (
              <div className="flex justify-between">
                <p className="font-medium">Uzmanlık:</p>
                <p>{doctor.specialty}</p>
              </div>
            )}

            {doctor && doctor.clinic && (
              <div className="flex justify-between">
                <p className="font-medium">Klinik:</p>
                <p>{doctor.clinic.name}</p>
              </div>
            )}
          </div>

          {appointment.description && (
            <div className="space-y-2">
              <p className="font-medium">Açıklama:</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">{appointment.description}</p>
            </div>
          )}

          {/* Eğer randevu tamamlandıysa ve teşhis varsa göster */}
          {status === 'completed' && (
            <div className="space-y-2">
              <p className="font-medium">Teşhis ve Tedavi:</p>

              {loadingExamination ? (
                <div className="text-center p-3">
                  <p className="text-sm text-slate-500">Yükleniyor...</p>
                </div>
              ) : examinationData ? (
                <div className="bg-slate-50 p-3 rounded-md space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Teşhis</p>
                    <p className="text-sm">{examinationData.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tedavi</p>
                    <p className="text-sm">{examinationData.treatment}</p>
                  </div>
                  {examinationData.notes && (
                    <div>
                      <p className="text-xs text-slate-500">Notlar</p>
                      <p className="text-sm">{examinationData.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md">
                  Teşhis bilgisi bulunamadı
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;