export interface GeoPoint {
  lat: number;
  lng: number;
  altitude?: number | null;
  accuracy?: number | null;
  speed?: number | null; // in m/s from Geolocation API
  heading?: number | null; // in degrees
  timestamp: number;
}

export interface TripStats {
  distanceMeters: number;
  elapsedTimeMs: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  currentSpeedKmh: number;
  pointCount: number;
  elevationGainMeters: number;
}

export interface GeofenceConfig {
  enabled: boolean;
  center: { lat: number; lng: number } | null;
  radiusMeters: number;
  label: string;
  alertOnExit: boolean;
}

export type CheckpointCategory = 'waypoint' | 'safe' | 'hazard' | 'parking' | 'meeting';

export interface Checkpoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: CheckpointCategory;
  notes?: string;
  timestamp: number;
}

export type TrackingMode = 'live' | 'simulated';

export type SpeedUnit = 'kmh' | 'mph' | 'knots';

export type MapTheme = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export interface SimulationRouteConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: { lat: number; lng: number; speedKmh: number; altitude: number }[];
}

export interface TargetDevice {
  id: string;
  name: string; // e.g. "Amber Gull"
  phoneNumber: string; // e.g. "03019721327"
  imei: string; // 15-digit International Mobile Equipment Identity
  status: 'active' | 'triangulating' | 'triangulated' | 'offline';
  lat: number;
  lng: number;
  uncertaintyRadiusMeters: number; // e.g. 200m circle
  carrier: string; // e.g. "Jazz 4G"
  batteryLevel: number; // percentage
  signalDbm: number; // e.g. -76 dBm
  lastPing: number;
  address?: string;
  speedKmh?: number;
  notes?: string;
}

export type UserRole = 'admin' | 'customer';

export interface AdminSupervisor {
  id: string;
  name: string;
  email: string;
  badgeNumber: string;
  agency: string;
  role: 'Super Admin' | 'Tactical Dispatcher' | 'Field Commander';
  isWatching: boolean;
  lastActive: number;
}

export interface Yard500CircleConfig {
  enabled: boolean;
  radiusYards: number; // 500 yards
  radiusMeters: number; // 457.2 meters
  center: { lat: number; lng: number };
  targetPhoneNumber: string; // 03019721327
  targetName: string; // Amber Gull
  isBreached: boolean;
  lastDisplacementYards: number;
  lastAlertTimestamp: number | null;
}


