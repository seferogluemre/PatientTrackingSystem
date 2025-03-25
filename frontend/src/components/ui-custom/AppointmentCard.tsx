
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarClock, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
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
import { Textarea } from '@/components/ui/textarea';
import { Appointment, AppointmentStatus } from '@/types';
import { getExamination } from '@/services/examinationService';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: 'doctor' | 'secretary' | 'patient';
  onStatusChange?: (id: number, status: AppointmentStatus) => void;
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

const AppointmentCard = ({ appointment, userRole, onStatusChange }: AppointmentCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [examinationData, setExaminationData] = useState<any>(null);
  const [loadingExamination, setLoadingExamination] = useState(false);

  const { status, appointmentDate, patient, doctor } = appointment;
  const statusInfo = statusConfig[status];

  useEffect(() => {
    // Eğer detay modalı açıldıysa ve randevu tamamlandıysa examination bilgisini getir
    if (isDetailsOpen && status === 'completed') {
      fetchExaminationData();
    }
  }, [isDetailsOpen, status, appointment.id]);

  const fetchExaminationData = async () => {
    try {
      setLoadingExamination(true);
      // Burada randevu ID'sine göre examination bilgisini çekiyoruz
      // Backend'de bu ilişki kurulmuşsa çalışacaktır
      if (appointment.examination?.id) {
        const data = await getExamination(appointment.examination.id);
        setExaminationData(data);
      }
    } catch (error) {
      console.error("Examination bilgisi getirilemedi:", error);
    } finally {
      setLoadingExamination(false);
    }
  };

  const handleComplete = () => {
    if (onStatusChange) {
      onStatusChange(appointment.id, 'completed');
      toast({
        title: "Başarılı",
        description: "Randevu başarıyla tamamlandı",
      });
    }
    setIsCompleteDialogOpen(false);
  };

  const handleCancel = () => {
    if (onStatusChange) {
      onStatusChange(appointment.id, 'cancelled');
      toast({
        title: "Başarılı",
        description: "Randevu başarıyla iptal edildi",
      });
    }
    setIsCancelDialogOpen(false);
  };

  const formattedDate = appointmentDate
    ? format(new Date(appointmentDate), "dd MMM yyyy", { locale: tr })
    : "Geçersiz Tarih";

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden transition-all hover:shadow-card-hover card-hover-effect">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <CalendarClock className="h-5 w-5 text-clinic" />
              <h3 className="text-lg font-medium text-slate-900">{formattedDate}</h3>
            </div>
            <div className={cn('px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border', statusInfo.color)}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-slate-500">{formattedDate}</p>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-slate-700">Hasta:</p>
              <p className="text-sm text-slate-900">{patient ? `${patient.firstName} ${patient.lastName}` : 'Bilinmiyor'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-slate-700">Doktor:</p>
              <p className="text-sm text-slate-900">
                {doctor && doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Bilinmiyor'}
              </p>
            </div>
            {doctor && (
              <div className="flex justify-between">
                <p className="text-sm font-medium text-slate-700">Uzmanlık:</p>
                <p className="text-sm text-slate-900">{doctor.specialty}</p>
              </div>
            )}
          </div>

          {appointment.description && (
            <div className="border-t border-slate-100 pt-3 mb-3">
              <p className="text-sm text-slate-600 line-clamp-2">{appointment.description}</p>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(true)}>
              Detaylar
            </Button>

            {userRole === 'doctor' && status === 'pending' && (
              <Button size="sm" onClick={() => setIsCompleteDialogOpen(true)}>
                Tamamla
              </Button>
            )}

            {(userRole === 'secretary' || userRole === 'patient') && status === 'pending' && (
              <Button variant="destructive" size="sm" onClick={() => setIsCancelDialogOpen(true)}>
                İptal Et
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
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
                <p>{patient ? `${patient.firstName} ${patient.lastName}` : 'Bilinmiyor'}</p>
              </div>

              <div className="flex justify-between">
                <p className="font-medium">Doktor:</p>
                <p>{doctor && doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Bilinmiyor'}</p>
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
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Appointment Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Randevuyu Tamamla</DialogTitle>
            <DialogDescription>Randevuyu tamamlamak için notlarınızı ekleyebilirsiniz.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Notlar (isteğe bağlı)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Kapat
            </Button>
            <Button onClick={handleComplete}>Tamamla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Randevuyu İptal Et</DialogTitle>
            <DialogDescription>Randevuyu iptal etmek istediğinizden emin misiniz?</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Kapat
            </Button>
            <Button onClick={handleCancel} variant="destructive">
              İptal Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentCard;
