
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Appointment, AppointmentStatus } from '@/types';
import {
  AppointmentCardBase,
  AppointmentDetailsDialog,
  AppointmentCompleteDialog,
  AppointmentCancelDialog
} from './appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: 'doctor' | 'secretary' | 'patient';
  onStatusChange?: (id: number, status: AppointmentStatus) => void;
}

const AppointmentCard = ({ appointment, userRole, onStatusChange }: AppointmentCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleComplete = (notes: string) => {
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

  return (
    <>
      <AppointmentCardBase
        appointment={appointment}
        userRole={userRole}
        onViewDetails={() => setIsDetailsOpen(true)}
        onCompleteClick={() => setIsCompleteDialogOpen(true)}
        onCancelClick={() => setIsCancelDialogOpen(true)}
      />

      <AppointmentDetailsDialog
        appointment={appointment}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <AppointmentCompleteDialog
        isOpen={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        onComplete={handleComplete}
      />

      <AppointmentCancelDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onCancel={handleCancel}
      />
    </>
  );
};

export default AppointmentCard;
