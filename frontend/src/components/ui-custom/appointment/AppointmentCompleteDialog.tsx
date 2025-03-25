
import { useState } from 'react';
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

interface AppointmentCompleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (notes: string) => void;
}

const AppointmentCompleteDialog = ({ 
  isOpen, 
  onOpenChange, 
  onComplete 
}: AppointmentCompleteDialogProps) => {
  const [notes, setNotes] = useState('');

  const handleComplete = () => {
    onComplete(notes);
    setNotes(''); // Reset notes after completion
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          <Button onClick={handleComplete}>Tamamla</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentCompleteDialog;
