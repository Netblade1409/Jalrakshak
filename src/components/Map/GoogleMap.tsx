/// <reference types="@types/google.maps" />

import React, { useEffect, useRef, useState } from 'react';
import { Hotspot } from '@/types/hotspot';

interface GoogleMapProps {
  hotspots: Hotspot[];
  center: { lat: number; lng: number };
  zoom: number;
  onMapClick?: (lat: number, lng: number) => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  apiKey: string;
}

const severityColors: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const severityLabels: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical',
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  hotspots,
  center,
  zoom,
  onMapClick,
  onHotspotClick,
  selectedLocation,
  apiKey,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const selectedMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof google !== 'undefined' && google.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#a3d5ff' }],
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#e8f4e8' }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Create info window instance
    infoWindowRef.current = new google.maps.InfoWindow();

    // Map click handler - always enabled
    mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onMapClick) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    });
  }, [isLoaded, center, zoom, onMapClick]);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // Update hotspot markers with InfoWindow popups
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    hotspots.forEach((hotspot) => {
      const marker = new google.maps.Marker({
        position: { lat: hotspot.latitude, lng: hotspot.longitude },
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12 + hotspot.reportCount * 2,
          fillColor: severityColors[hotspot.severity],
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: `Water Level: ${hotspot.waterLevel}cm`,
      });

      // Create popup content
      const contentString = `
        <div style="padding: 12px; max-width: 280px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${severityColors[hotspot.severity]};"></div>
            <span style="font-weight: 600; font-size: 14px; color: ${severityColors[hotspot.severity]};">
              ${severityLabels[hotspot.severity]}
            </span>
          </div>
          <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: #1a1a1a;">
            Water Level: ${hotspot.waterLevel}cm
          </h3>
          <div style="display: grid; gap: 8px; font-size: 13px; color: #666;">
            <div style="display: flex; justify-content: space-between;">
              <span>Reports:</span>
              <span style="font-weight: 600; color: #1a1a1a;">${hotspot.reportCount}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Reported:</span>
              <span style="font-weight: 600; color: #1a1a1a;">${new Date(hotspot.reportedAt).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Coordinates:</span>
              <span style="font-weight: 600; color: #1a1a1a;">${hotspot.latitude.toFixed(4)}, ${hotspot.longitude.toFixed(4)}</span>
            </div>
          </div>
        </div>
      `;

      marker.addListener('click', () => {
        if (infoWindowRef.current && mapInstanceRef.current) {
          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
        if (onHotspotClick) {
          onHotspotClick(hotspot);
        }
      });

      markersRef.current.push(marker);
    });
  }, [hotspots, isLoaded, onHotspotClick]);

  // Update selected location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setMap(null);
    }

    if (selectedLocation) {
      selectedMarkerRef.current = new google.maps.Marker({
        position: selectedLocation,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: '#0ea5e9',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        animation: google.maps.Animation.BOUNCE,
      });
    }
  }, [selectedLocation, isLoaded]);

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Please provide a Google Maps API key</p>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
  );
};

export default GoogleMap;
