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

    if (onMapClick) {
      mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      });
    }
  }, [isLoaded, center, zoom, onMapClick]);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // Update hotspot markers
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

      marker.addListener('click', () => {
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
