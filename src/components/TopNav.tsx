import { useState, useEffect } from 'react';
import { TrackingMode, TargetDevice } from '../types/tracker';
import { Radio, AlertOctagon, BarChart2, Share2, ShieldAlert, Check, Shield, Crosshair, Terminal, Clock } from 'lucide-react';

interface TopNavProps {
  trackingMode: TrackingMode;
  isTracking: boolean;
  isPaused: boolean;
  isGeofenceBreached: boolean;
  accuracy: number | null | undefined;
  onOpenSos: () => void;
  onOpenAnalytics: () => void;
  currentLat: number;
  currentLng: number;
  targets?: TargetDevice[];
  selectedTarget?: TargetDevice | null;
}

export function TopNav({
  trackingMode,
  isTracking,
  isPaused,
  isGeofenceBreached,
  accuracy,
  onOpenSos,
  onOpenAnalytics,
  currentLat,
  currentLng,
  targets = [],
  selectedTarget,
}: TopNavProps) {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [zuluTime, setZuluTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setZuluTime(now.toISOString().substring(11, 19) + 'Z');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    const url = `https://www.google.com/maps?q=${currentLat.toFixed(6)},${currentLng.toFixed(6)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="h-16 px-3 md:px-6 bg-slate-950/95 border-b border-cyan-500/30 flex items-center justify-between z-30 backdrop-blur-md shadow-2xl relative select-none">
      {/* Brand & Agency Title */}
      <div className="flex items-center gap-3">
        {/* FIA / Police Law Enforcement Emblem Badge */}
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-900 via-blue-950 to-slate-900 p-0.5 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30">
          <Shield className="w-6 h-6 text-cyan-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse border border-slate-950" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-black tracking-wider text-white font-mono flex items-center gap-2">
              <span className="text-cyan-400">FIA • NCCA</span>
              <span className="text-slate-400 text-xs font-normal hidden sm:inline">|</span>
              <span className="text-slate-100 text-xs md:text-sm font-bold tracking-tight">
                TACTICAL GEOLOCATION CAD
              </span>
            </h1>
            <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/60 text-[9px] font-black tracking-widest font-mono">
              LEVEL 1 // RESTRICTED
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  !isTracking || isPaused
                    ? 'bg-amber-400'
                    : trackingMode === 'live'
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-cyan-400 animate-pulse'
                }`}
              />
              <span className="text-slate-200 font-semibold">
                {isPaused
                  ? 'INTERCEPT PAUSED'
                  : trackingMode === 'live'
                  ? `LIVE CELLULAR GPS (±${Math.round(accuracy ?? 10)}m)`
                  : 'SIMULATION FEED ACTIVE'}
              </span>
            </span>

            {/* Target highlight tag */}
            {selectedTarget && (
              <span className="hidden md:inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                <Crosshair className="w-3 h-3 text-amber-400" />
                TARGET: {selectedTarget.name} [±{selectedTarget.uncertaintyRadiusMeters}m CEP]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Tactical Clock (Zulu / UTC) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-300">
        <Clock className="w-3.5 h-3.5 text-cyan-400" />
        <span>UTC: {zuluTime || '00:00:00Z'}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Quick GPS Link Share */}
        <button
          onClick={handleShare}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          title="Export Google Maps Dispatch Coordinates"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline text-emerald-300">COPIED</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">DISPATCH GPS</span>
            </>
          )}
        </button>

        {/* Analytics Modal Button */}
        <button
          onClick={onOpenAnalytics}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          title="View Telemetry Session Log"
        >
          <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">LOGS</span>
        </button>

        {/* Urgent Emergency SOS Button */}
        <button
          onClick={onOpenSos}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-xs font-mono font-black flex items-center gap-1.5 shadow-lg shadow-rose-900/50 ring-2 ring-rose-500/50 animate-pulse transition-all"
        >
          <AlertOctagon className="w-4 h-4 fill-white" />
          <span>URGENT SOS</span>
        </button>
      </div>
    </header>
  );
}
