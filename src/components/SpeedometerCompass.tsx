import { useState } from 'react';
import { GeoPoint, TripStats, SpeedUnit } from '../types/tracker';
import { formatSpeed, degreesToCardinal, formatDistance, formatDuration } from '../utils/geoUtils';
import { Compass, Gauge, Mountain, Satellite, Navigation } from 'lucide-react';

interface SpeedometerCompassProps {
  currentPoint: GeoPoint;
  tripStats: TripStats;
  accuracyStatus: 'high' | 'medium' | 'low' | 'unknown';
}

export function SpeedometerCompass({
  currentPoint,
  tripStats,
  accuracyStatus,
}: SpeedometerCompassProps) {
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('kmh');
  const speedData = formatSpeed(currentPoint.speed, speedUnit);
  const avgSpeedData = formatSpeed((tripStats.avgSpeedKmh * 1000) / 3600, speedUnit);
  const maxSpeedData = formatSpeed((tripStats.maxSpeedKmh * 1000) / 3600, speedUnit);

  const heading = currentPoint.heading ?? 0;
  const cardinal = degreesToCardinal(currentPoint.heading);

  // Speedometer circular gauge percentage (up to 120 km/h)
  const currentSpeedVal = parseFloat(speedData.value) || 0;
  const maxDial = speedUnit === 'mph' ? 80 : 120;
  const gaugePercent = Math.min(100, Math.round((currentSpeedVal / maxDial) * 100));

  const getAccuracyColor = () => {
    switch (accuracyStatus) {
      case 'high':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'low':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Telemetry
          </span>
        </div>

        {/* Speed Unit Toggle */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-[11px] font-mono">
          <button
            onClick={() => setSpeedUnit('kmh')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              speedUnit === 'kmh' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            KM/H
          </button>
          <button
            onClick={() => setSpeedUnit('mph')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              speedUnit === 'mph' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MPH
          </button>
          <button
            onClick={() => setSpeedUnit('knots')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              speedUnit === 'knots' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            KN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Speedometer Gauge */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Arc for Gauge */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-slate-800"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-cyan-400 transition-all duration-300"
                strokeWidth="7"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * gaugePercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Speed Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {speedData.value}
              </span>
              <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">
                {speedData.unitLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-2 text-[10px] font-mono text-slate-400 px-1">
            <span>Avg: {avgSpeedData.value}</span>
            <span>Max: {maxSpeedData.value}</span>
          </div>
        </div>

        {/* Compass & Heading Dial */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Compass Ring */}
            <div
              className="absolute inset-0 rounded-full border border-slate-700/60 transition-transform duration-300 flex items-center justify-center"
              style={{ transform: `rotate(${-heading}deg)` }}
            >
              <span className="absolute top-1 text-[10px] font-black text-rose-500">N</span>
              <span className="absolute right-1 text-[10px] font-bold text-slate-400">E</span>
              <span className="absolute bottom-1 text-[10px] font-bold text-slate-400">S</span>
              <span className="absolute left-1 text-[10px] font-bold text-slate-400">W</span>
            </div>

            {/* Center Heading Needle */}
            <div className="relative flex flex-col items-center">
              <Navigation className="w-6 h-6 text-cyan-400 fill-cyan-400 drop-shadow-md" />
              <div className="mt-1 flex flex-col items-center">
                <span className="text-xs font-black font-mono text-white">
                  {Math.round(heading)}°
                </span>
                <span className="text-[10px] font-bold text-cyan-400 tracking-wider">
                  {cardinal}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 mt-2">
            BEARING ORIENTATION
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar: Accuracy, Altitude, Distance, Time */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
        <div className="p-1.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-center gap-1">
            <Satellite className="w-2.5 h-2.5 text-slate-400" /> GPS
          </div>
          <div className={`text-xs font-mono font-bold mt-0.5 rounded px-1 border ${getAccuracyColor()}`}>
            ±{Math.round(currentPoint.accuracy ?? 10)}m
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-center gap-1">
            <Mountain className="w-2.5 h-2.5 text-slate-400" /> Alt
          </div>
          <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
            {currentPoint.altitude ? `${Math.round(currentPoint.altitude)}m` : '—'}
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
            Distance
          </div>
          <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
            {formatDistance(tripStats.distanceMeters, speedUnit === 'mph')}
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
            Duration
          </div>
          <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
            {formatDuration(tripStats.elapsedTimeMs)}
          </div>
        </div>
      </div>
    </div>
  );
}
