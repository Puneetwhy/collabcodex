// frontend/src/components/common/Header.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, Code2, ChevronRight } from 'lucide-react';

const Header = ({ projectName = '', unreadNotifications = 0 }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isProjectPage = location.pathname.includes('/projects/');

  return (
    <header className="h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left Section */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer group select-none transition-transform hover:scale-105"
          >
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:inline-block">
              CollabCodeX
            </span>
          </div>

          {/* Project Name with breadcrumb */}
          {isProjectPage && projectName && (
            <div className="flex items-center gap-1 min-w-0">
              <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:inline" />
              <span className="font-medium text-sm sm:text-base truncate max-w-[140px] sm:max-w-[220px] lg:max-w-[320px]">
                {projectName}
              </span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle with smooth rotation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl hover:bg-muted transition-all duration-300 transform"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 rotate-0 transition-transform duration-300" /> 
                               : <Moon className="h-5 w-5 rotate-12 transition-transform duration-300" />}
          </Button>

          {/* Notifications with red dot if unread */}
          <div className="relative">
            <NotificationBell />
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-background" />
            )}
          </div>

          {/* Logout */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-2 rounded-xl hover:bg-muted transition-colors flex items-center"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline text-sm">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;