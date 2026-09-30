import { SimulationRouteConfig } from '../types/tracker';

export const PRESET_SIMULATED_ROUTES: SimulationRouteConfig[] = [
  {
    id: 'hafiz-wala-chak7ml-patrol',
    name: 'Hafiz Wala Anchor & Road Patrol',
    description: 'Direct route from main location (32.280556, 71.442707) across Chak 7 ML road towards 32.2861502, 71.4847041.',
    icon: 'Shield',
    points: [
      { lat: 32.280556, lng: 71.442707, speedKmh: 0, altitude: 198 }, // Stationary at anchor
      { lat: 32.280556, lng: 71.442707, speedKmh: 0, altitude: 198 }, // Stationary at anchor
      { lat: 32.280950, lng: 71.443500, speedKmh: 12, altitude: 198 }, // Starts moving (displaced 90m)
      { lat: 32.281800, lng: 71.446200, speedKmh: 28, altitude: 198 }, // Moving away (displaced 350m)
      { lat: 32.282900, lng: 71.451000, speedKmh: 42, altitude: 198 }, // Moving down road
      { lat: 32.284100, lng: 71.458000, speedKmh: 50, altitude: 197 }, // 1.5 km out
      { lat: 32.285200, lng: 71.468000, speedKmh: 55, altitude: 197 }, // Crossing 2 km perimeter!
      { lat: 32.286150, lng: 71.484704, speedKmh: 52, altitude: 196 }, // Reaching destination point
      { lat: 32.284800, lng: 71.470000, speedKmh: 48, altitude: 197 },
      { lat: 32.282200, lng: 71.450000, speedKmh: 35, altitude: 198 },
      { lat: 32.280556, lng: 71.442707, speedKmh: 0, altitude: 198 }, // Returning to anchor
    ]
  },
  {
    id: 'sf-coastal-drive',
    name: 'San Francisco Embarcadero Run',
    description: 'Scenic waterfront route with turns, variable acceleration, and high accuracy GPS pings.',
    icon: 'Car',
    points: [
      { lat: 37.7925, lng: -122.3934, speedKmh: 28, altitude: 8 },
      { lat: 37.7942, lng: -122.3951, speedKmh: 34, altitude: 9 },
      { lat: 37.7965, lng: -122.3970, speedKmh: 42, altitude: 10 },
      { lat: 37.7989, lng: -122.3995, speedKmh: 45, altitude: 11 },
      { lat: 37.8012, lng: -122.4018, speedKmh: 40, altitude: 10 },
      { lat: 37.8038, lng: -122.4035, speedKmh: 35, altitude: 12 },
    ]
  },
  {
    id: 'tokyo-shibuya-walk',
    name: 'Tokyo Shibuya Walk',
    description: 'Pedestrian pace walking route through urban crossways.',
    icon: 'Footprints',
    points: [
      { lat: 35.6595, lng: 139.7005, speedKmh: 4.8, altitude: 28 },
      { lat: 35.6608, lng: 139.7020, speedKmh: 5.1, altitude: 29 },
      { lat: 35.6622, lng: 139.7038, speedKmh: 4.5, altitude: 31 },
      { lat: 35.6640, lng: 139.7060, speedKmh: 4.9, altitude: 33 },
    ]
  }
];

/**
 * Creates a dynamic simulated circular or path around any given coordinate
 */
export function generateLocalSimulatedPath(centerLat: number, centerLng: number, numPoints = 12) {
  const points: { lat: number; lng: number; speedKmh: number; altitude: number }[] = [];
  const radiusDegrees = 0.0035; // approx 400m

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const r = radiusDegrees * (0.85 + 0.3 * Math.sin(angle * 2));
    const lat = centerLat + r * Math.cos(angle);
    const lng = centerLng + (r / Math.cos((centerLat * Math.PI) / 180)) * Math.sin(angle);
    const speed = 25 + 15 * Math.sin(angle);
    points.push({
      lat,
      lng,
      speedKmh: Math.max(5, speed),
      altitude: 198 + 4 * Math.cos(angle)
    });
  }

  return points;
}
