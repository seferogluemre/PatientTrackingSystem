
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AppointmentCancelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

const AppointmentCancelDialog = ({ 
  isOpen, 
  onOpenChange, 
  onCancel 
}: AppointmentCancelDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Randevuyu İptal Et</DialogTitle>
          <DialogDescription>Randevuyu iptal etmek istediğinizden emin misiniz?</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          <Button onClick={onCancel} variant="destructive">
            İptal Et
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentCancelDialog;
