
import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarClock, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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
  
  const { status, appointmentDate, patient, doctor } = appointment;
  const statusInfo = statusConfig[status];
  
  const handleComplete = () => {
    if (onStatusChange) {
      onStatusChange(appointment.id, 'completed');
      toast.success('Randevu başarıyla tamamlandı');
    }
    setIsCompleteDialogOpen(false);
  };
  
  const handleCancel = () => {
    if (onStatusChange) {
      onStatusChange(appointment.id, 'cancelled');
      toast.success('Randevu başarıyla iptal edildi');
    }
    setIsCancelDialogOpen(false);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden transition-all hover:shadow-card-hover card-hover-effect">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <CalendarClock className="h-5 w-5 text-clinic" />
              <h3 className="text-lg font-medium text-slate-900">
                {format(new Date(appointmentDate), 'HH:mm')}
              </h3>
            </div>
            <div className={cn('px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border', statusInfo.color)}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-slate-500">
              {format(new Date(appointmentDate), 'dd MMMM yyyy, EEEE', { locale: tr })}
            </p>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-slate-700">Hasta:</p>
              <p className="text-sm text-slate-900">
                {patient ? `${patient.firstName} ${patient.lastName}` : 'Bilinmiyor'}
              </p>
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
            <DialogDescription>
              {format(new Date(appointmentDate), 'dd MMMM yyyy, EEEE', { locale: tr })} - {format(new Date(appointmentDate), 'HH:mm')}
            </DialogDescription>
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
            
            {appointment.examination && (
              <div className="space-y-2">
                <p className="font-medium">Teşhis ve Tedavi:</p>
                <div className="bg-slate-50 p-3 rounded-md space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Teşhis</p>
                    <p className="text-sm">{appointment.examination.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tedavi</p>
                    <p className="text-sm">{appointment.examination.treatment}</p>
                  </div>
                  {appointment.examination.notes && (
                    <div>
                      <p className="text-xs text-slate-500">Notlar</p>
                      <p className="text-sm">{appointment.examination.notes}</p>
                    </div>
                  )}
                </div>
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
            <DialogDescription>
              Randevuyu tamamlamak için notlarınızı ekleyebilirsiniz.
            </DialogDescription>
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
              İptal
            </Button>
            <Button onClick={handleComplete}>
              Tamamla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Appointment Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Randevuyu İptal Et</DialogTitle>
            <DialogDescription>
              Bu randevuyu iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-md border border-amber-100">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-amber-800">
              Randevu iptal edildiğinde, hasta ve doktor bilgilendirilecektir.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              İptal Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentCard;
