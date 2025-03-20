
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Users,
  UserPlus,
  CalendarDays,
  ClipboardList,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/ui-custom/Layout';
import PatientCard from '@/components/ui-custom/PatientCard';
import { User, Patient } from '@/types';
import { mockPatients } from '@/data/mockData';

const Patients = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new patient
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: '',
    address: '',
  });
  
  // Get the user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('clinicUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      if (parsedUser.role === 'patient') {
        // Patients should not have access to patient list
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  // Set patients data
  useEffect(() => {
    if (user && (user.role === 'doctor' || user.role === 'secretary')) {
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
    }
  }, [user]);
  
  // Filter patients based on search query
  useEffect(() => {
    if (patients.length) {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const filtered = patients.filter(patient => {
          const name = `${patient.firstName} ${patient.lastName}`.toLowerCase();
          const email = patient.email.toLowerCase();
          const phone = patient.phone?.toLowerCase() || '';
          
          return name.includes(query) || email.includes(query) || phone.includes(query);
        });
        
        setFilteredPatients(filtered);
      } else {
        setFilteredPatients(patients);
      }
    }
  }, [patients, searchQuery]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreatePatient = () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.email) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    // Create a new patient
    const newPatient: Patient = {
      id: patients.length + 1,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: new Date(formData.dob),
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    };
    
    // Add to patients and filtered patients
    setPatients([newPatient, ...patients]);
    setFilteredPatients([newPatient, ...filteredPatients]);
    
    // Close dialog and reset form
    setIsCreateDialogOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      email: '',
      phone: '',
      address: '',
    });
    
    toast.success('Hasta başarıyla oluşturuldu');
  };
  
  const handleViewHistory = (patientId: number) => {
    navigate(`/patients/${patientId}`);
  };
  
  const handleCreateAppointment = (patientId: number) => {
    navigate(`/appointments/new?patientId=${patientId}`);
  };
  
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

  if (!user || user.role === 'patient') {
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
            <h1 className="text-2xl font-bold">Hastalar</h1>
            <p className="text-slate-500 mt-1">Hasta listesi ve detayları</p>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Hasta
          </Button>
        </motion.div>
        
        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Hasta</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Bu Ay Eklenen</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-clinic/10 flex items-center justify-center text-clinic">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktif Randevular</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-clinic/10 flex items-center justify-center text-clinic">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Search */}
        <motion.div variants={item} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Hasta adı, e-posta veya telefon ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </motion.div>
        
        {/* Patients list */}
        {filteredPatients.length > 0 ? (
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onViewHistory={handleViewHistory}
                onCreateAppointment={handleCreateAppointment}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={item} className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-lg font-medium">Hasta bulunamadı</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery ? 
                'Arama kriterinize uygun hasta bulunamadı.' : 
                'Henüz hasta kaydı oluşturulmamış.'}
            </p>
          </motion.div>
        )}
      </motion.div>
      
      {/* Create patient dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Hasta Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir hasta kaydı oluşturmak için aşağıdaki bilgileri doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Adı</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Adı"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyadı</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Soyadı"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob">Doğum Tarihi</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+90 xxx xxx xxxx"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Adres"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCreatePatient}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Patients;
