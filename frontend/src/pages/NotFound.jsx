// frontend/src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"
      role="alert"
    >
      <AlertTriangle className="h-20 w-20 md:h-24 md:w-24 text-destructive mb-6 shrink-0" />

      <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">
        404
      </h1>

      <h2 className="text-2xl md:text-3xl font-semibold mb-4">
        Page Not Found
      </h2>

      <p className="text-base md:text-lg text-muted-foreground max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <Button size="lg" asChild>
        <Link
          to="/dashboard"
          className="flex items-center justify-center"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;