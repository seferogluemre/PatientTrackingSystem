
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/ui-custom/Layout';
import { User } from '@/types';
import DoctorDashboard from './dashboards/DoctorDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import SecretaryDashboard from './dashboards/SecretaryDashboard';
import { toast } from 'sonner';

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
          const parsedUser = JSON.parse(storedUser);
          
          // If we have a valid user with id and token, try to verify with backend
          if (parsedUser.id && localStorage.getItem('clinicToken')) {
            try {
              const response = await fetch(`http://localhost:3000/api/users/${parsedUser.tc_no || parsedUser.id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('clinicToken')}`
                }
              });
              
              if (response.ok) {
                const userData = await response.json();
                
                // Update user data if we got a valid response
                if (userData) {
                  // Transform the backend user data to match our app's User type
                  const updatedUser: User = {
                    id: userData.id || parsedUser.id,
                    firstName: userData.first_name || parsedUser.firstName,
                    lastName: userData.last_name || parsedUser.lastName,
                    email: userData.email || parsedUser.email,
                    role: parsedUser.role, // Keep role from stored user as it might not be in response
                    phone: userData.phone || parsedUser.phone,
                    profilePicture: parsedUser.profilePicture
                  };
                  
                  // Update localStorage with fresh data
                  localStorage.setItem('clinicUser', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                } else {
                  // If we couldn't get updated data, use what we have in localStorage
                  setUser(parsedUser);
                }
              } else {
                // If verification fails, fallback to stored user
                setUser(parsedUser);
              }
            } catch (error) {
              console.error('Error verifying user with backend:', error);
              setUser(parsedUser); // Fallback to stored user on error
            }
          } else {
            // Just use the stored user if we don't have enough info for verification
            setUser(parsedUser);
          }
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
