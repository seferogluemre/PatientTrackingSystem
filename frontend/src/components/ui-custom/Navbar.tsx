
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, CalendarDays, Users, LogOut, Menu, X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserType } from '@/types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <User className="w-5 h-5" /> },
    { name: 'Appointments', href: '/appointments', icon: <CalendarDays className="w-5 h-5" /> },
    { name: 'Patients', href: '/patients', icon: <Users className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Kullanıcı yoksa boş bir div döndür
  if (!user) {
    return <div className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm"></div>;
  }
  console.log("profile user", user)
  const userInitials = user && user.first_name && user.last_name
    ? `${user.first_name}${user.last_name}`
    : '';

  return (
    <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="app-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-clinic text-white flex items-center justify-center font-bold">
                KYS
              </div>
              <span className="text-lg font-semibold text-slate-800">Klinik Yönetim</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-1",
                    isActive(item.href)
                      ? "bg-clinic/10 text-clinic"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User dropdown */}
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative  h-14 w-16 rounded-full">
                  <div className="flex items-center justify-center overflow-hidden rounded-full bg-slate-100 hover:ring-2 hover:ring-slate-200 transition-all duration-200">
                    {user.profilePicture ? (
                      <img
                        src="https://randomuser.me/api/portraits/men/4.jpg"
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                    ) : (
                      <img
                        src="https://randomuser.me/api/portraits/men/4.jpg"
                        alt={`${user.first_name} ${user.last_name}`}
                        id='user-image'
                      />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium">{`${user.first_name} ${user.last_name}`}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                    <span className="text-xs capitalize px-2 py-0.5 bg-slate-100 rounded-full text-slate-700 w-fit">
                      {user.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Çıkış</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={cn("md:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-100">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3",
                isActive(item.href)
                  ? "bg-clinic/10 text-clinic"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            onClick={() => {
              onLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center space-x-3"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
