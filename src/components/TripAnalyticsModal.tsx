import { GeoPoint, TripStats } from '../types/tracker';
import { formatDistance, formatDuration, generateGPX, downloadFile } from '../utils/geoUtils';
import { Activity, Download, FileText, X, TrendingUp, Navigation, Mountain, Clock } from 'lucide-react';

interface TripAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TripStats;
  points: GeoPoint[];
}

export function TripAnalyticsModal({
  isOpen,
  onClose,
  stats,
  points,
}: TripAnalyticsModalProps) {
  if (!isOpen) return null;

  const handleDownloadGPX = () => {
    const gpx = generateGPX(points, 'GeoPulse Track Session');
    downloadFile(gpx, `geopulse-track-${Date.now()}.gpx`, 'application/gpx+xml');
  };

  const handleDownloadJSON = () => {
    const json = JSON.stringify({ stats, points }, null, 2);
    downloadFile(json, `geopulse-track-${Date.now()}.json`, 'application/json');
  };

  // Compute pace: min / km
  const totalKm = stats.distanceMeters / 1000;
  const totalMinutes = stats.elapsedTimeMs / 60000;
  const paceMinPerKm = totalKm > 0 ? totalMinutes / totalKm : 0;
  const paceMinutes = Math.floor(paceMinPerKm);
  const paceSeconds = Math.round((paceMinPerKm - paceMinutes) * 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Trip Session Analytics</h2>
              <p className="text-xs text-slate-400">Breadcrumb telemetry & track profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Distance
            </div>
            <div className="text-lg font-black font-mono text-cyan-300">
              {formatDistance(stats.distanceMeters)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              ({formatDistance(stats.distanceMeters, true)})
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Duration
            </div>
            <div className="text-lg font-black font-mono text-white">
              {formatDuration(stats.elapsedTimeMs)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Active Time
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Pace
            </div>
            <div className="text-lg font-black font-mono text-emerald-400">
              {totalKm > 0.05 ? `${paceMinutes}'${paceSeconds.toString().padStart(2, '0')}"` : '—'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              min / km
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Max Speed
            </span>
            <span className="font-mono font-bold text-white">
              {stats.maxSpeedKmh.toFixed(1)} km/h
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" /> Average Speed
            </span>
            <span className="font-mono font-bold text-slate-200">
              {stats.avgSpeedKmh.toFixed(1)} km/h
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-amber-400" /> Elevation Gain
            </span>
            <span className="font-mono font-bold text-slate-200">
              +{Math.round(stats.elevationGainMeters)} m
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Total Recorded Points
            </span>
            <span className="font-mono font-bold text-cyan-400">
              {points.length} waypoints
            </span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadGPX}
            disabled={points.length === 0}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" /> Export GPX Route
          </button>

          <button
            onClick={handleDownloadJSON}
            disabled={points.length === 0}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4" /> Export JSON Log
          </button>
        </div>
      </div>
    </div>
  );
}
