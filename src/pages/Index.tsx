/// <reference types="@types/google.maps" />

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import GoogleMap from '@/components/Map/GoogleMap';
import SearchBar from '@/components/SearchBar';
import Sidebar from '@/components/Sidebar';
import FloatingReportButton from '@/components/FloatingReportButton';
import ReportModal from '@/components/ReportModal';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useHotspots } from '@/hooks/useHotspots';
import { Hotspot, FeedbackReport } from '@/types/hotspot';

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // Delhi, India
const DEFAULT_ZOOM = 13;

const Index = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isReportMode, setIsReportMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { hotspots, isLoading, fetchHotspots, submitReport } = useHotspots();

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('google_maps_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Fetch initial hotspots
  useEffect(() => {
    if (apiKey) {
      fetchHotspots(center.lat, center.lng);
    }
  }, [apiKey, fetchHotspots]);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem('google_maps_api_key', key);
    toast.success('API Key saved successfully!');
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!apiKey || typeof google === 'undefined' || !google.maps) return;

    setIsSearching(true);
    
    try {
      // Use Google Geocoding API
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newCenter = { lat: location.lat(), lng: location.lng() };
          
          setCenter(newCenter);
          setZoom(14);
          
          // Fetch hotspots for new area
          fetchHotspots(newCenter.lat, newCenter.lng);
          
          toast.success(`Showing hotspots for ${results[0].formatted_address}`);
        } else {
          toast.error('Location not found. Please try a different search.');
        }
        setIsSearching(false);
      });
    } catch (error) {
      toast.error('Failed to search location');
      setIsSearching(false);
    }
  }, [apiKey, fetchHotspots]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isReportMode) {
      setSelectedLocation({ lat, lng });
      setIsReportModalOpen(true);
    }
  }, [isReportMode]);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setCenter({ lat: hotspot.latitude, lng: hotspot.longitude });
    setZoom(16);
  }, []);

  const handleHotspotSelect = useCallback((hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setCenter({ lat: hotspot.latitude, lng: hotspot.longitude });
    setZoom(16);
  }, []);

  const handleReportModeToggle = () => {
    setIsReportMode(!isReportMode);
    setSelectedLocation(null);
    if (!isReportMode) {
      toast.info('Click on the map to select a location for your report');
    }
  };

  const handleReportSubmit = async (report: FeedbackReport) => {
    const success = await submitReport(report);
    if (success) {
      toast.success('Thank you! Your report has been submitted.');
      setIsReportMode(false);
      setSelectedLocation(null);
    } else {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  if (!apiKey) {
    return <ApiKeyInput onSubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <Sidebar
          hotspots={hotspots}
          selectedHotspot={selectedHotspot}
          onHotspotSelect={handleHotspotSelect}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-center">
          <SearchBar onSearch={handleSearch} isLoading={isSearching} apiKey={apiKey} />
        </div>

        {/* Report Mode Indicator */}
        {isReportMode && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium">
              Click on the map to select location
            </div>
          </div>
        )}

        {/* Map */}
        <GoogleMap
          apiKey={apiKey}
          hotspots={hotspots}
          center={center}
          zoom={zoom}
          onMapClick={handleMapClick}
          onHotspotClick={handleHotspotClick}
          selectedLocation={selectedLocation}
        />

        {/* Legend */}
        <div className="absolute bottom-24 left-4 z-10 hidden md:block animate-fade-in">
          <div className="glass-card rounded-lg p-4 shadow-lg">
            <h3 className="text-sm font-semibold mb-3">Severity Legend</h3>
            <div className="space-y-2">
              {[
                { label: 'Low', color: 'bg-success', desc: '< 15cm' },
                { label: 'Medium', color: 'bg-warning', desc: '15-30cm' },
                { label: 'High', color: 'bg-orange-500', desc: '30-45cm' },
                { label: 'Critical', color: 'bg-destructive', desc: '> 45cm' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Report Button */}
        <FloatingReportButton onClick={handleReportModeToggle} isActive={isReportMode} />

        {/* Report Modal */}
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedLocation(null);
          }}
          onSubmit={handleReportSubmit}
          location={selectedLocation}
        />
      </div>
    </div>
  );
};

export default Index;
