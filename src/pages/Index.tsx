import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserRound, KeyRound, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/ui-custom/Layout';
import { getRandomUser } from '@/data/mockData';
import { UserRole } from '@/types';
import { login } from '@/services/authService';

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login({ email, password });

      if (response.user) {
        toast.success('Giriş başarılı');
        navigate('/dashboard');
      } else {
        toast.error('Giriş başarısız');
      }
    } catch (error) {
      toast.error('Giriş sırasında bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (selectedRole: UserRole) => {
    setLoading(true);

    try {
      const user = getRandomUser(selectedRole);

      if (user) {
        toast.success(`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} olarak giriş yapıldı`);
        navigate('/dashboard');
      } else {
        toast.error('Giriş başarısız');
      }
    } catch (error) {
      toast.error('Giriş sırasında bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.4, 0.0, 0.2, 1],
      },
    }),
  };

  return (
    <Layout requireAuth={false}>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col md:flex-row">
        <motion.div
          className="w-full md:w-1/2 flex items-center justify-center p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex mb-4 p-3 rounded-xl bg-clinic/10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="h-12 w-12 rounded-lg bg-clinic text-white flex items-center justify-center text-xl font-bold">
                  KYS
                </div>
              </motion.div>
              <motion.h1
                className="text-3xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Klinik Yönetim Sistemi
              </motion.h1>
              <motion.p
                className="text-slate-500 mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Sağlık hizmetlerinizi yönetmek için giriş yapın
              </motion.p>
            </div>

            <motion.form
              onSubmit={handleLogin}
              className="space-y-4"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    placeholder="ornek@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doktor</SelectItem>
                    <SelectItem value="secretary">Sekreter</SelectItem>
                    <SelectItem value="patient">Hasta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </motion.form>

            <motion.div
              className="mt-8"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <p className="text-center text-sm text-slate-500 mb-4">veya hızlı demo giriş</p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleQuickLogin('doctor')}
                  disabled={loading}
                  className="text-xs py-1"
                >
                  Doktor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickLogin('secretary')}
                  disabled={loading}
                  className="text-xs py-1"
                >
                  Sekreter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickLogin('patient')}
                  disabled={loading}
                  className="text-xs py-1"
                >
                  Hasta
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 bg-clinic/5 flex items-center justify-center p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="max-w-lg">
            <div className="mb-6">
              <div className="inline-block px-3 py-1 bg-clinic/10 rounded-full text-clinic text-xs font-medium mb-2">
                Klinik Çözümler
              </div>
              <h2 className="text-3xl font-bold mb-3">Tüm klinik süreçlerinizi tek platformda yönetin</h2>
              <p className="text-slate-600">
                Randevu planlama ve yönetim, hasta kayıtları, doktor programları ve daha fazlası - hepsi kolay ve hızlı bir arayüzle.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                'Randevu planlama ve yönetim',
                'Hasta kayıtları ve geçmiş',
                'Doktor çalışma programları',
                'Teşhis ve tedavi takibi',
                'Klinik yönetimi',
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  custom={index * 0.2 + 1}
                >
                  <div className="h-6 w-6 rounded-full bg-clinic/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="h-4 w-4 text-clinic" />
                  </div>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
