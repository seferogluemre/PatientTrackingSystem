
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/ui-custom/Layout';
import { User } from '@/types';
import DoctorDashboard from './dashboards/DoctorDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import SecretaryDashboard from './dashboards/SecretaryDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('clinicUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/');
    }
    setLoading(false);
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
