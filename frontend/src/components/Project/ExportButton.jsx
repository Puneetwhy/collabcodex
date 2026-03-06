// frontend/src/components/Project/ExportButton.jsx
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const ExportButton = ({
  projectId,
  variant = 'outline',
  size = 'default',
  className = '',
}) => {
  const { isAuthenticated } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!projectId || !isAuthenticated) {
      toast.error('Cannot export: project or authentication missing');
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading('Exporting project as ZIP...');

    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        let message = 'Export failed';
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch {}
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `collabcodex-${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Project exported successfully', { id: toastId });
    } catch (err) {
      toast.error(`Export failed: ${err.message}`, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting || !projectId}
      className={`transition-all duration-200 active:scale-[0.98] ${className}`}
    >
      {isExporting ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="tracking-tight">Exporting...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Download className="h-4 w-4 opacity-80" />
          <span className="tracking-tight">Export ZIP</span>
        </span>
      )}
    </Button>
  );
};

export default ExportButton;