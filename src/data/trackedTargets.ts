import { TargetDevice } from '../types/tracker';

export const INITIAL_TRACKED_TARGETS: TargetDevice[] = [
  {
    id: 'target-amber-gull',
    name: 'Amber Gull',
    phoneNumber: '03019721327', // +92 301 9721327
    imei: '864201048291032', // 15-digit Device IMEI
    status: 'triangulated',
    lat: 32.280556,
    lng: 71.442707,
    uncertaintyRadiusMeters: 200, // 200m radius circle at exact Hafiz Wala coordinates
    carrier: 'Jazz 4G / BTS Tower CID-7821 (Thal Sector)',
    batteryLevel: 72,
    signalDbm: -74,
    lastPing: Date.now() - 15000,
    address: 'Hafiz Wala, Chak No. 7/ML (32.280556, 71.442707), Piplan, Mianwali, Punjab',
    speedKmh: 0, // Stationary at main location
    notes: 'Main anchor location (Google Maps: 32.280556, 71.442707). Sentry movement alarm active.',
  },
  {
    id: 'target-device-randi',
    name: 'Secondary Tracked Device',
    phoneNumber: '+92 321 8391049',
    imei: '358249098314562', // Random mobile IMEI number
    status: 'active',
    lat: 32.2825,
    lng: 71.4490,
    uncertaintyRadiusMeters: 200, // 200m radius circle
    carrier: 'Telenor 4G / BTS Sector 02',
    batteryLevel: 85,
    signalDbm: -69,
    lastPing: Date.now() - 15000,
    address: 'Chak No. 7/ML Main Road, Mianwali, Punjab',
    speedKmh: 28.5,
    notes: 'Real-time cellular sector beacon active with 200m uncertainty radius.',
  },
  {
    id: 'target-support-unit',
    name: 'FIA/Police Mobile Unit 7',
    phoneNumber: '+92 345 4389210',
    imei: '352940182749501',
    status: 'active',
    lat: 32.2760,
    lng: 71.4420,
    uncertaintyRadiusMeters: 50,
    carrier: 'Gov Tactical Secure Radio',
    batteryLevel: 94,
    signalDbm: -58,
    lastPing: Date.now() - 8000,
    address: 'Chak 7 ML Police Post, Piplan-Mianwali Road',
    speedKmh: 42.0,
    notes: 'Rapid response tactical patrol unit assigned to sector.',
  }
];
