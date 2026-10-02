import { GeoPoint, SpeedUnit } from '../types/tracker';

/**
 * Calculates distance between two points in meters using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculates bearing between two coordinates in degrees [0, 360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (θ * 180 / Math.PI + 360) % 360;
}

/**
 * Converts degrees into Cardinal direction (e.g. N, NE, E...)
 */
export function degreesToCardinal(deg: number | null | undefined): string {
  if (deg === null || deg === undefined || isNaN(deg)) return '—';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/**
 * Format speed according to unit
 */
export function formatSpeed(speedMps: number | null | undefined, unit: SpeedUnit = 'kmh'): { value: string; unitLabel: string } {
  if (speedMps === null || speedMps === undefined || speedMps < 0 || isNaN(speedMps)) {
    return { value: '0.0', unitLabel: unit === 'kmh' ? 'km/h' : unit === 'mph' ? 'mph' : 'knots' };
  }

  let converted = speedMps * 3.6; // km/h
  let label = 'km/h';

  if (unit === 'mph') {
    converted = speedMps * 2.23694;
    label = 'mph';
  } else if (unit === 'knots') {
    converted = speedMps * 1.94384;
    label = 'kn';
  }

  return { value: converted.toFixed(1), unitLabel: label };
}

/**
 * Format distance in meters to readable metric/imperial string
 */
export function formatDistance(distanceMeters: number, isImperial: boolean = false): string {
  if (isImperial) {
    const miles = distanceMeters * 0.000621371;
    if (miles < 0.1) {
      return `${Math.round(distanceMeters * 3.28084)} ft`;
    }
    return `${miles.toFixed(2)} mi`;
  } else {
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)} m`;
    }
    return `${(distanceMeters / 1000).toFixed(2)} km`;
  }
}

/**
 * Formats duration milliseconds into HH:MM:SS or MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format coordinates into Degrees Minutes Seconds (DMS) string
 */
export function toDMS(lat: number, lng: number): string {
  const formatCoord = (coord: number, isLat: boolean) => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    const direction = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return `${formatCoord(lat, true)} ${formatCoord(lng, false)}`;
}

/**
 * Web Audio API synthesizer for Urgent Geofence Breaches and SOS alerts
 */
class SoundFxManager {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playGeofenceWarning() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35); // A4

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  startSosBeep() {
    if (this.intervalId !== null) return;
    this.init();

    const beep = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.setValueAtTime(1200, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300]);
      }
    };

    beep();
    this.intervalId = window.setInterval(beep, 1200);
  }

  stopSosBeep() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const soundFx = new SoundFxManager();

/**
 * Generate GPX file content from recorded points
 */
export function generateGPX(points: GeoPoint[], tripName: string = 'GeoPulse Tracked Route'): string {
  const trkpts = points
    .map(
      (p) =>
        `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}">
        <ele>${(p.altitude ?? 0).toFixed(1)}</ele>
        <time>${new Date(p.timestamp).toISOString()}</time>
        ${p.speed ? `<speed>${p.speed.toFixed(2)}</speed>` : ''}
      </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GeoPulse Location Tracker" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${tripName}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${tripName}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Trigger download of text data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a realistic 15-digit TAC-SNR-CD IMEI string
 */
export function generateRandomIMEI(): string {
  const prefixes = ['358249', '864201', '352940', '013928', '867192'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let remaining = '';
  for (let i = 0; i < 9; i++) {
    remaining += Math.floor(Math.random() * 10).toString();
  }
  return `${prefix}${remaining}`;
}

