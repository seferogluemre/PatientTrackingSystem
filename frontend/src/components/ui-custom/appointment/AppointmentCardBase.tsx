
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarClock, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Appointment, AppointmentStatus } from '@/types';

interface AppointmentCardBaseProps {
  appointment: Appointment;
  userRole: 'doctor' | 'secretary' | 'patient';
  onViewDetails: () => void;
  onCompleteClick?: () => void;
  onCancelClick?: () => void;
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

const AppointmentCardBase = ({ 
  appointment, 
  userRole, 
  onViewDetails, 
  onCompleteClick, 
  onCancelClick 
}: AppointmentCardBaseProps) => {
  const { status, appointmentDate, patient, doctor } = appointment;
  const statusInfo = statusConfig[status];

  const formattedDate = appointmentDate
    ? format(new Date(appointmentDate), "dd MMM yyyy", { locale: tr })
    : "Geçersiz Tarih";

  return (
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
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            Detaylar
          </Button>

          {userRole === 'doctor' && status === 'pending' && onCompleteClick && (
            <Button size="sm" onClick={onCompleteClick}>
              Tamamla
            </Button>
          )}

          {(userRole === 'secretary' || userRole === 'patient') && status === 'pending' && onCancelClick && (
            <Button variant="destructive" size="sm" onClick={onCancelClick}>
              İptal Et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCardBase;
