import React from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingReportButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

const FloatingReportButton: React.FC<FloatingReportButtonProps> = ({ onClick, isActive }) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg transition-all duration-300 z-50',
        isActive
          ? 'bg-destructive hover:bg-destructive/90'
          : 'water-gradient hover:opacity-90'
      )}
    >
      {isActive ? (
        <>
          <Plus className="h-5 w-5 mr-2 rotate-45" />
          Cancel
        </>
      ) : (
        <>
          <MapPin className="h-5 w-5 mr-2" />
          Report Water Logging
        </>
      )}
    </Button>
  );
};

export default FloatingReportButton;
