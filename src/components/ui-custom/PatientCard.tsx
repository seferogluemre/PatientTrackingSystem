
import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { UserRound, Calendar, Phone, Mail, MapPin } from 'lucide-react';
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
import { Patient } from '@/types';

interface PatientCardProps {
  patient: Patient;
  onViewHistory?: (patientId: number) => void;
  onCreateAppointment?: (patientId: number) => void;
}

const PatientCard = ({ patient, onViewHistory, onCreateAppointment }: PatientCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const calculateAge = (dob: string | Date) => {
    const birthDate = new Date(dob);
    console.log("DOB:", patient.dob);

    if (isNaN(birthDate.getTime())) {
      console.error("Invalid date:", dob);
      return "Invalid Date";
    }

    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };


  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden transition-all hover:shadow-card-hover card-hover-effect">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-clinic/10 flex items-center justify-center flex-shrink-0">
              <UserRound className="h-6 w-6 text-clinic" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                {patient.first_name} {patient.last_name}
              </h3>
              <p className="text-sm text-slate-500">
                {calculateAge(patient.user?.birthDate)} yaşında
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                {format(new Date(patient.user?.birthDate), 'dd MMMM yyyy', { locale: tr })}
              </p>
            </div>

            {patient.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600">{patient.phone ? patient.phone : "Numara bulunmamaktadır"}</p>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">{patient.email}</p>
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(true)}>
              Detaylar
            </Button>

            <div className="space-x-2">
              {onViewHistory && (
                <Button variant="secondary" size="sm" onClick={() => onViewHistory(patient.id)}>
                  Geçmiş
                </Button>
              )}

              {onCreateAppointment && (
                <Button size="sm" onClick={() => onCreateAppointment(patient.id)}>
                  Randevu
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hasta Detayları</DialogTitle>
            <DialogDescription>
              ID: {patient.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-clinic/10 flex items-center justify-center flex-shrink-0">
                <UserRound className="h-8 w-8 text-clinic" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-slate-900">
                  {patient.first_name} {patient.last_name}
                </h3>
                <p className="text-sm text-slate-500">
                  {calculateAge(patient?.birthDate)} yaşında
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Doğum Tarihi</p>
                  <p className="text-sm font-medium">
                    {/* {format(new Date(patient.dob), 'dd MMMM yyyy', { locale: tr })} */}
                  </p>
                </div>
              </div>

              {patient.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Telefon</p>
                    <p className="text-sm font-medium">{patient.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">E-posta</p>
                  <p className="text-sm font-medium">{patient.email}</p>
                </div>
              </div>

              {patient.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Adres</p>
                    <p className="text-sm font-medium">{patient.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Kapat
            </Button>

            <div className="space-x-2">
              {onViewHistory && (
                <Button variant="secondary" onClick={() => {
                  onViewHistory(patient.id);
                  setIsDetailsOpen(false);
                }}>
                  Geçmiş
                </Button>
              )}

              {onCreateAppointment && (
                <Button onClick={() => {
                  onCreateAppointment(patient.id);
                  setIsDetailsOpen(false);
                }}>
                  Randevu
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientCard;
