export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  waterLevel: number; // in cm
  reportedAt: string;
  address?: string;
  reportCount: number;
}

export interface FeedbackReport {
  id?: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userLocation?: string;
}

export interface SearchResult {
  name: string;
  latitude: number;
  longitude: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
