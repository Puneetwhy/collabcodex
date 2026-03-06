// frontend/src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth(); // Checks if user is logged in
  const location = useLocation();

  // While checking auth status, show a full-page loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">

          {/* Spinner */}
          <div className="relative">
            <div className="h-14 w-14 rounded-full border border-muted/40" />
            <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-primary" />
          </div>

          <p className="text-sm text-muted-foreground tracking-wide">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated: render child routes
  return <Outlet />;
};

export default ProtectedRoute;