import React from 'react';
import { Droplets, AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import HotspotCard from './HotspotCard';
import { Hotspot } from '@/types/hotspot';

interface SidebarProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onHotspotSelect: (hotspot: Hotspot) => void;
  isLoading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  hotspots,
  selectedHotspot,
  onHotspotSelect,
  isLoading,
}) => {
  const stats = {
    total: hotspots.length,
    critical: hotspots.filter((h) => h.severity === 'critical').length,
    high: hotspots.filter((h) => h.severity === 'high').length,
    avgWaterLevel: hotspots.length
      ? Math.round(hotspots.reduce((acc, h) => acc + h.waterLevel, 0) / hotspots.length)
      : 0,
  };

  return (
    <div className="w-full h-full flex flex-col bg-card/95 backdrop-blur-xl border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Droplets className="h-7 w-7 text-primary" />
          <span className="water-gradient bg-clip-text text-transparent">AquaWatch</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time water logging monitoring
        </p>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Total Hotspots</span>
            </div>
            <p className="text-2xl font-bold font-display">{stats.total}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Critical</span>
            </div>
            <p className="text-2xl font-bold font-display text-destructive">{stats.critical}</p>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">High</span>
            </div>
            <p className="text-2xl font-bold font-display text-orange-500">{stats.high}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Avg Level</span>
            </div>
            <p className="text-2xl font-bold font-display text-primary">{stats.avgWaterLevel}cm</p>
          </div>
        </div>
      </div>

      {/* Hotspots List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Active Hotspots</h2>
        </div>
        <ScrollArea className="h-[calc(100%-49px)]">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : hotspots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Droplets className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No hotspots in this area</p>
              </div>
            ) : (
              hotspots
                .sort((a, b) => {
                  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                  return severityOrder[a.severity] - severityOrder[b.severity];
                })
                .map((hotspot) => (
                  <HotspotCard
                    key={hotspot.id}
                    hotspot={hotspot}
                    isSelected={selectedHotspot?.id === hotspot.id}
                    onClick={() => onHotspotSelect(hotspot)}
                  />
                ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;
