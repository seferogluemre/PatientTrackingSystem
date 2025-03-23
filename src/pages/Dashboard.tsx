
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/ui-custom/Layout';
import { User } from '@/types';
import DoctorDashboard from './dashboards/DoctorDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import SecretaryDashboard from './dashboards/SecretaryDashboard';
import { toast } from 'sonner';
import { getUser } from '@/services/userService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the user from localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const storedUser = localStorage.getItem('clinicUser');
      
      if (storedUser) {
        try {
          // Parse the user from localStorage
          const parsedUser = JSON.parse(storedUser);
          
          // Use the stored user as is, with all the fields from the backend
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          toast.error('Oturum bilgileri geçersiz');
          navigate('/');
        }
      } else {
        // No user in localStorage, redirect to login
        navigate('/');
      }
      
      setLoading(false);
    };
    
    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-lg">Yükleniyor...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    // Return null
    return null;
  }

  return (
    <Layout>
      {user.role === 'doctor' && <DoctorDashboard user={user} />}
      {user.role === 'patient' && <PatientDashboard user={user} />}
      {user.role === 'secretary' && <SecretaryDashboard user={user} />}
    </Layout>
  );
};

export default Dashboard;
