import React from 'react';
import { MapPin, Droplets, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hotspot } from '@/types/hotspot';
import { cn } from '@/lib/utils';

interface HotspotCardProps {
  hotspot: Hotspot;
  isSelected?: boolean;
  onClick?: () => void;
}

const severityConfig = {
  low: {
    label: 'Low',
    className: 'bg-success/10 text-success border-success/20',
    icon: Droplets,
  },
  medium: {
    label: 'Medium',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Droplets,
  },
  high: {
    label: 'High',
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critical',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertTriangle,
  },
};

const HotspotCard: React.FC<HotspotCardProps> = ({ hotspot, isSelected, onClick }) => {
  const config = severityConfig[hotspot.severity];
  const Icon = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg animate-fade-in',
        isSelected && 'ring-2 ring-primary shadow-lg'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{hotspot.address || 'Unknown Location'}</span>
          </CardTitle>
          <Badge variant="outline" className={cn('text-xs', config.className)}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="h-4 w-4 text-primary" />
            <span>{hotspot.waterLevel} cm</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDate(hotspot.reportedAt)}</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {hotspot.reportCount} report{hotspot.reportCount !== 1 ? 's' : ''}
        </div>
      </CardContent>
    </Card>
  );
};

export default HotspotCard;
