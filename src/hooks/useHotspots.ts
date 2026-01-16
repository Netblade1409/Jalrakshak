import { useState, useCallback } from 'react';
import { Hotspot, FeedbackReport } from '@/types/hotspot';

// Mock data for demonstration - this would be replaced with actual API calls
const generateMockHotspots = (centerLat: number, centerLng: number): Hotspot[] => {
  const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  const addresses = [
    'Main Street Junction',
    'Railway Underpass',
    'Market Square',
    'Hospital Road',
    'School Lane',
    'Bus Stand Area',
    'Industrial Zone',
    'Residential Block A',
    'Park Entrance',
    'Shopping Complex',
  ];

  return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => ({
    id: `hotspot-${i + 1}`,
    latitude: centerLat + (Math.random() - 0.5) * 0.05,
    longitude: centerLng + (Math.random() - 0.5) * 0.05,
    severity: severities[Math.floor(Math.random() * severities.length)],
    waterLevel: Math.floor(Math.random() * 60) + 10,
    reportedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    address: addresses[Math.floor(Math.random() * addresses.length)],
    reportCount: Math.floor(Math.random() * 10) + 1,
  }));
};

export const useHotspots = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotspots = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // This would be replaced with actual backend call
      // const response = await fetch(`/api/hotspots?lat=${lat}&lng=${lng}`);
      // const data = await response.json();
      
      const mockData = generateMockHotspots(lat, lng);
      setHotspots(mockData);
    } catch (err) {
      setError('Failed to fetch hotspots');
      console.error('Error fetching hotspots:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitReport = useCallback(async (report: FeedbackReport) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // This would be replaced with actual backend call
      // const response = await fetch('/api/reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });

      // Add the report as a new hotspot locally
      const newHotspot: Hotspot = {
        id: `hotspot-new-${Date.now()}`,
        latitude: report.latitude,
        longitude: report.longitude,
        severity: report.severity,
        waterLevel: report.severity === 'critical' ? 60 : report.severity === 'high' ? 40 : report.severity === 'medium' ? 25 : 10,
        reportedAt: report.timestamp,
        address: 'User Reported Location',
        reportCount: 1,
      };

      setHotspots((prev) => [...prev, newHotspot]);
      
      return true;
    } catch (err) {
      console.error('Error submitting report:', err);
      return false;
    }
  }, []);

  return {
    hotspots,
    isLoading,
    error,
    fetchHotspots,
    submitReport,
  };
};
