
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Stethoscope, CalendarDays, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExaminationCardProps {
  examination: any;
}

const ExaminationCard = ({ examination }: ExaminationCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/examinations/${examination.id}`);
  };
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Stethoscope className="h-8 w-8 text-clinic mr-2" />
            <div>
              <h3 className="font-medium">
                {examination.appointment?.patient?.first_name} {examination.appointment?.patient?.last_name}
              </h3>
              <p className="text-sm text-slate-500">
                Dr. {examination.appointment?.doctor?.user?.first_name} {examination.appointment?.doctor?.user?.last_name}
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {examination.appointment?.appointment_date 
              ? format(new Date(examination.appointment.appointment_date), 'dd MMM yyyy', { locale: tr })
              : 'Tarih yok'}
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-slate-500">Teşhis</p>
            <p className="text-sm line-clamp-1">{examination.diagnosis}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tedavi</p>
            <p className="text-sm line-clamp-1">{examination.treatment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExaminationCard;
