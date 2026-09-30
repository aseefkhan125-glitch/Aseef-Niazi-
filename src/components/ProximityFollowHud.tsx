import { useState, useEffect, useRef } from 'react';
import { TargetDevice, GeoPoint, TripStats, GeofenceConfig } from '../types/tracker';
import {
  calculateDistance,
  calculateBearing,
  degreesToCardinal,
  formatDistance,
  formatDuration,
  soundFx
} from '../utils/geoUtils';
import {
  Crosshair,
  Navigation,
  Bookmark,
  Check,
  ShieldCheck,
  ShieldAlert,
  Bell,
  BellRing,
  Route,
  Activity,
  Compass
} from 'lucide-react';

interface ProximityFollowHudProps {
  currentPoint: GeoPoint;
  target: TargetDevice | null;
  tripStats: TripStats;
  geofence: GeofenceConfig;
  isGeofenceBreached: boolean;
  onSaveLocation: (title: string, lat: number, lng: number, notes?: string) => void;
  isFollowCameraActive: boolean;
  onToggleFollowCamera: () => void;
}

export function ProximityFollowHud({
  currentPoint,
  target,
  tripStats,
  geofence,
  isGeofenceBreached,
  onSaveLocation,
  isFollowCameraActive,
  onToggleFollowCamera,
}: ProximityFollowHudProps) {
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [notificationsGranted, setNotificationsGranted] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const wasNearRef = useRef<boolean>(false);

  if (!target) return null;

  const distanceToTarget = calculateDistance(currentPoint.lat, currentPoint.lng, target.lat, target.lng);
  const bearingToTarget = calculateBearing(currentPoint.lat, currentPoint.lng, target.lat, target.lng);
  const cardinal = degreesToCardinal(bearingToTarget);

  // Near threshold: within 250 meters or inside uncertainty radius
  const isNear = distanceToTarget <= Math.max(250, target.uncertaintyRadiusMeters);

  // 2 KM perimeter calculation (default 2000m)
  const centerLat = geofence.center ? geofence.center.lat : target.lat;
  const centerLng = geofence.center ? geofence.center.lng : target.lng;
  const distFromCenter = calculateDistance(currentPoint.lat, currentPoint.lng, centerLat, centerLng);
  const twoKmRadius = geofence.radiusMeters || 2000;
  const isOutside2Km = distFromCenter > twoKmRadius;

  // Sound chime when entering near zone
  useEffect(() => {
    if (isNear && !wasNearRef.current) {
      soundFx.playGeofenceWarning();
    }
    wasNearRef.current = isNear;
  }, [isNear]);

  const handleSave = () => {
    onSaveLocation(
      `Saved Location: ${target.name} (${target.phoneNumber})`,
      currentPoint.lat,
      currentPoint.lng,
      `Traveled ${formatDistance(tripStats.distanceMeters)}. Distance to target: ${Math.round(distanceToTarget)}m. IMEI: ${target.imei}. Address: ${target.address || 'Hafiz Wala Chak 7 ML'}`
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsGranted(true);
        new Notification('FIA/NCCA Alert System Active', {
          body: '2 Kilometer perimeter boundary notifications enabled for Hafiz Wala Chak 7 ML.',
        });
      }
    }
  };

  return (
    <div className="bg-slate-950/95 border-2 border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md space-y-3 font-mono relative overflow-hidden">
      {/* Corner Bracket Accents */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />

      {/* Proximity Arrival Banner (When Near Target) */}
      {isNear && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-2 border-emerald-400 shadow-xl shadow-emerald-950/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                REACHED NEAR LOCATION ({formatDistance(distanceToTarget)})
              </div>
              <div className="text-[10px] text-slate-300">
                {target.name} • {target.phoneNumber}
              </div>
            </div>
          </div>

          {/* SAVE LOCATION BUTTON */}
          <button
            onClick={handleSave}
            disabled={savedSuccess}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95 shadow-emerald-600/30'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> LOCATION SAVED!
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 fill-white" /> SAVE LOCATION
              </>
            )}
          </button>
        </div>
      )}

      {/* 2 KILOMETER PERIMETER MONITOR BAR */}
      <div
        className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
          isOutside2Km || isGeofenceBreached
            ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse shadow-lg shadow-rose-950/50'
            : 'bg-slate-900/80 border-cyan-500/40 text-cyan-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOutside2Km || isGeofenceBreached ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          )}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span>2 KM PERIMETER CIRCLE:</span>
              <span className={isOutside2Km ? 'text-rose-400' : 'text-emerald-400'}>
                {isOutside2Km ? '⚠️ BOUNDARY CROSSED!' : 'SECURE (INSIDE 2 KM)'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {isOutside2Km
                ? `${formatDistance(distFromCenter - twoKmRadius)} outside 2 km limit! Alert triggered.`
                : `${formatDistance(twoKmRadius - distFromCenter)} remaining before 2 km boundary.`}
            </div>
          </div>
        </div>

        {/* Browser Notification Permission Button */}
        {!notificationsGranted && (
          <button
            onClick={handleRequestNotification}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1 shrink-0"
            title="Enable browser notifications when crossing 2km circle"
          >
            <Bell className="w-3 h-3 text-cyan-400" />
            <span>NOTIFY ME</span>
          </button>
        )}
      </div>

      {/* TRAVEL DISTANCE & REMAINING DISTANCE BAR */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* How far we travel */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
            <span className="flex items-center gap-1">
              <Route className="w-3 h-3 text-cyan-400" /> DISTANCE TRAVELED
            </span>
          </div>
          <div className="text-xl font-black text-cyan-300 font-mono tracking-tight">
            {formatDistance(tripStats.distanceMeters)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Active: {formatDuration(tripStats.elapsedTimeMs)}
          </div>
        </div>

        {/* Distance to Target (Amber Gull) */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> REMAINING TO TARGET
            </span>
          </div>
          <div className="text-xl font-black text-amber-300 font-mono tracking-tight">
            {formatDistance(distanceToTarget)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Bearing: {Math.round(bearingToTarget)}° {cardinal}
          </div>
        </div>
      </div>

      {/* Follow Distance Controls Bar */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-7 h-7 rounded-lg bg-slate-950 border border-amber-400/60 flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${bearingToTarget}deg)` }}
          >
            <Navigation className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-slate-300 font-semibold text-[11px]">
            Follow Vector: {target.name} ({target.phoneNumber})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Manual Save Location Button */}
          <button
            onClick={handleSave}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-colors"
            title="Save current location"
          >
            <Bookmark className="w-3 h-3 text-cyan-400" />
            <span>SAVE PIN</span>
          </button>

          {/* Follow Camera Toggle */}
          <button
            onClick={onToggleFollowCamera}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono flex items-center gap-1 border transition-all ${
              isFollowCameraActive
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-sm'
                : 'bg-slate-950 text-cyan-400 hover:bg-slate-800 border-slate-700'
            }`}
            title="Auto-follow camera"
          >
            <Crosshair className={`w-3 h-3 ${isFollowCameraActive ? 'animate-spin' : ''}`} />
            <span>{isFollowCameraActive ? 'LOCKED' : 'FOLLOW'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
