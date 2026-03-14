// frontend/src/components/common/LoadingSpinner.jsx
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullPage = false, message = 'Loading...' }) => {
  const content = (
    <div
      className="flex flex-col items-center justify-center gap-5 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Spinner container */}
      <div className="relative flex items-center justify-center">
        {/* Glowing background circle with pulse */}
        <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl animate-pulse" />
        {/* Spinner icon */}
        <Loader2 className="relative h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary" />
      </div>

      {/* Message */}
      <p className="text-sm sm:text-base text-muted-foreground font-medium tracking-tight">
        {message}
      </p>
    </div>
  );

  // Full page overlay
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm px-4">
        {content}
      </div>
    );
  }

  // Inline / partial spinner
  return <div className="py-10 flex items-center justify-center">{content}</div>;
};

export default LoadingSpinner;