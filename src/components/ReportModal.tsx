import React, { useState } from 'react';
import { MapPin, Droplets, Send, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FeedbackReport } from '@/types/hotspot';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: FeedbackReport) => void;
  location: { lat: number; lng: number } | null;
}

const severityOptions = [
  { value: 'low', label: 'Low', description: 'Minor puddles, passable', color: 'bg-success' },
  { value: 'medium', label: 'Medium', description: 'Ankle-deep water', color: 'bg-warning' },
  { value: 'high', label: 'High', description: 'Knee-deep water', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', description: 'Waist-deep or higher', color: 'bg-destructive' },
] as const;

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  location,
}) => {
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!location) return;

    setIsSubmitting(true);
    
    const report: FeedbackReport = {
      latitude: location.lat,
      longitude: location.lng,
      severity,
      description,
      timestamp: new Date().toISOString(),
    };

    await onSubmit(report);
    setIsSubmitting(false);
    setDescription('');
    setSeverity('medium');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Droplets className="h-5 w-5 text-primary" />
            Report Water Logging
          </DialogTitle>
          <DialogDescription>
            Help others by reporting water logging at your current location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Location Display */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-5 w-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Selected Location</p>
              {location ? (
                <p className="text-muted-foreground">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-muted-foreground">Click on the map to select</p>
              )}
            </div>
          </div>

          {/* Severity Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Water Level Severity</Label>
            <RadioGroup
              value={severity}
              onValueChange={(value) => setSeverity(value as typeof severity)}
              className="grid grid-cols-2 gap-3"
            >
              {severityOptions.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Additional Details (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the situation, road conditions, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!location || isSubmitting}
            className="water-gradient"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
