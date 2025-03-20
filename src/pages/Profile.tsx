
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Mail,
  Phone,
  UserCog,
  Shield,
  Building,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import Layout from '@/components/ui-custom/Layout';
import { User, Doctor, Clinic } from '@/types';
import { getDoctorByUserId } from '@/data/mockData';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Get the user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('clinicUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      setFormData({
        ...formData,
        firstName: parsedUser.firstName,
        lastName: parsedUser.lastName,
        email: parsedUser.email,
        phone: parsedUser.phone || '',
      });
      
      if (parsedUser.role === 'doctor') {
        const doctorInfo = getDoctorByUserId(parsedUser.id);
        if (doctorInfo) {
          setDoctor(doctorInfo);
          
          setFormData(prev => ({
            ...prev,
            specialty: doctorInfo.specialty,
            clinicName: doctorInfo.clinic?.name || '',
            clinicAddress: doctorInfo.clinic?.address || '',
            clinicPhone: doctorInfo.clinic?.phone || '',
          }));
        }
      }
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      // Update the user in localStorage
      const updatedUser: User = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      };
      
      localStorage.setItem('clinicUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profil başarıyla güncellendi');
    }
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    toast.success('Şifre başarıyla değiştirildi');
    
    // Reset password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        <motion.div variants={item} className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Profil</h1>
            <p className="text-slate-500 mt-1">Kişisel bilgilerinizi yönetin</p>
          </div>
          
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <UserCog className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          )}
        </motion.div>
        
        {/* Profile content */}
        <motion.div variants={item}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="info">Profil Bilgileri</TabsTrigger>
              <TabsTrigger value="security">Güvenlik</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profil Bilgileri</CardTitle>
                  <CardDescription>
                    Kişisel bilgilerinizi görüntüleyin ve düzenleyin
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-20 w-20 rounded-full bg-clinic/10 flex items-center justify-center flex-shrink-0">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <UserIcon className="h-10 w-10 text-clinic" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Adı</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Soyadı</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    {user.role === 'doctor' && doctor && (
                      <>
                        <div className="pt-2 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-700 mb-3">Doktor Bilgileri</h4>
                          
                          <div className="space-y-2 mb-4">
                            <Label htmlFor="specialty">Uzmanlık</Label>
                            <Input
                              id="specialty"
                              name="specialty"
                              value={formData.specialty}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-700 mb-3">Klinik Bilgileri</h4>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="clinicName">Klinik Adı</Label>
                              <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                  id="clinicName"
                                  name="clinicName"
                                  value={formData.clinicName}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="pl-9"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="clinicAddress">Adres</Label>
                                <Input
                                  id="clinicAddress"
                                  name="clinicAddress"
                                  value={formData.clinicAddress}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="clinicPhone">Telefon</Label>
                                <Input
                                  id="clinicPhone"
                                  name="clinicPhone"
                                  value={formData.clinicPhone}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {isEditing && (
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          İptal
                        </Button>
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Kaydet
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Güvenlik</CardTitle>
                  <CardDescription>
                    Şifrenizi değiştirin ve güvenlik ayarlarınızı yönetin
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Yeni Şifre</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-slate-500">En az 6 karakter</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="mt-4">
                      Şifreyi Değiştir
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Profile;
