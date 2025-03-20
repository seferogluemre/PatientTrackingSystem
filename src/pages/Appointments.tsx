
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/ui-custom/Layout';
import AppointmentCard from '@/components/ui-custom/AppointmentCard';
import { User, Appointment, AppointmentStatus, Doctor, Patient } from '@/types';
import { 
  mockAppointments, 
  mockDoctors, 
  mockPatients, 
  getDoctorByUserId,
  getPatientAppointments,
  getDoctorAppointments,
} from '@/data/mockData';

type FilterStatus = 'all' | AppointmentStatus;

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new appointment
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    description: '',
  });
  
  // Parse URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const patientId = queryParams.get('patientId');
    
    if (patientId) {
      setFormData(prev => ({ ...prev, patientId }));
      setIsCreateDialogOpen(true);
    }
  }, [location.search]);
  
  // Get the user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('clinicUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      if (parsedUser.role === 'doctor') {
        const doctorInfo = getDoctorByUserId(parsedUser.id);
        if (doctorInfo) {
          setDoctor(doctorInfo);
        }
      }
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  // Get appointments based on user role
  useEffect(() => {
    if (user) {
      let userAppointments: Appointment[] = [];
      
      if (user.role === 'doctor' && doctor) {
        userAppointments = getDoctorAppointments(doctor.id);
      } else if (user.role === 'patient') {
        const patientWithSameEmail = mockPatients.find(p => p.email === user.email);
        if (patientWithSameEmail) {
          userAppointments = getPatientAppointments(patientWithSameEmail.id);
        }
      } else if (user.role === 'secretary') {
        userAppointments = [...mockAppointments];
      }
      
      // Sort appointments by date (latest first)
      userAppointments.sort((a, b) => 
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      );
      
      setAppointments(userAppointments);
      setFilteredAppointments(userAppointments);
    }
  }, [user, doctor, navigate]);
  
  // Filter appointments based on search query and status filter
  useEffect(() => {
    if (appointments.length) {
      let filtered = [...appointments];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(appointment => appointment.status === statusFilter);
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(appointment => {
          const patientName = appointment.patient 
            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase() 
            : '';
          const doctorName = appointment.doctor && appointment.doctor.user
            ? `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`.toLowerCase()
            : '';
          const description = appointment.description?.toLowerCase() || '';
          
          return patientName.includes(query) || 
                 doctorName.includes(query) || 
                 description.includes(query);
        });
      }
      
      setFilteredAppointments(filtered);
    }
  }, [appointments, searchQuery, statusFilter]);
  
  const handleStatusChange = (id: number, status: AppointmentStatus) => {
    // Update the status in both appointments and filtered appointments
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status } : appointment
    );
    
    const updatedFiltered = filteredAppointments.map(appointment => 
      appointment.id === id ? { ...appointment, status } : appointment
    );
    
    setAppointments(updatedAppointments);
    setFilteredAppointments(updatedFiltered);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateAppointment = () => {
    // Validate form
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    // Combine date and time
    const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    
    // Create a new appointment
    const newAppointment: Appointment = {
      id: appointments.length + 1,
      patientId: parseInt(formData.patientId),
      doctorId: parseInt(formData.doctorId),
      appointmentDate: dateTime,
      status: 'pending',
      description: formData.description,
      patient: mockPatients.find(p => p.id === parseInt(formData.patientId)),
      doctor: mockDoctors.find(d => d.id === parseInt(formData.doctorId)),
    };
    
    // Add to appointments and filtered appointments
    setAppointments([newAppointment, ...appointments]);
    
    // Apply current filters to the new appointment
    if (statusFilter === 'all' || statusFilter === 'pending') {
      setFilteredAppointments([newAppointment, ...filteredAppointments]);
    }
    
    // Close dialog and reset form
    setIsCreateDialogOpen(false);
    setFormData({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      description: '',
    });
    
    toast.success('Randevu başarıyla oluşturuldu');
  };
  
  // Calculate stats
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Randevular</h1>
            <p className="text-slate-500 mt-1">Randevuları görüntüleyin ve yönetin</p>
          </div>
          
          {user.role !== 'patient' && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Randevu
            </Button>
          )}
        </motion.div>
        
        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam</p>
                <p className="text-2xl font-bold">{totalAppointments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Bekleyen</p>
                <p className="text-2xl font-bold">{pendingAppointments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tamamlanan</p>
                <p className="text-2xl font-bold">{completedAppointments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">İptal Edilen</p>
                <p className="text-2xl font-bold">{cancelledAppointments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Filters */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Hasta veya doktor adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Randevular</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="completed">Tamamlanan</SelectItem>
                <SelectItem value="cancelled">İptal Edilen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
        
        {/* Appointments list */}
        {filteredAppointments.length > 0 ? (
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                userRole={user.role}
                onStatusChange={handleStatusChange}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={item} className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-lg font-medium">Randevu bulunamadı</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || statusFilter !== 'all' ? 
                'Filtreleme kriterlerinize uygun randevu bulunamadı.' : 
                'Henüz randevu oluşturulmamış.'}
            </p>
          </motion.div>
        )}
      </motion.div>
      
      {/* Create appointment dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir randevu oluşturmak için aşağıdaki bilgileri doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patientId" className="text-right">
                Hasta
              </Label>
              <div className="col-span-3">
                <Select name="patientId" value={formData.patientId} onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hasta seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctorId" className="text-right">
                Doktor
              </Label>
              <div className="col-span-3">
                <Select name="doctorId" value={formData.doctorId} onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Doktor seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.user?.firstName} {doctor.user?.lastName} ({doctor.specialty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentDate" className="text-right">
                Tarih
              </Label>
              <div className="col-span-3">
                <Input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentTime" className="text-right">
                Saat
              </Label>
              <div className="col-span-3">
                <Input
                  id="appointmentTime"
                  name="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Açıklama
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Randevu açıklaması"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateAppointment}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Appointments;
