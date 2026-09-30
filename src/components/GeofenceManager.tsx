import { GeofenceConfig, GeoPoint } from '../types/tracker';
import { formatDistance } from '../utils/geoUtils';
import { Shield, ShieldAlert, ShieldCheck, MapPin, Volume2, Bell } from 'lucide-react';
import { soundFx } from '../utils/geoUtils';

interface GeofenceManagerProps {
  geofence: GeofenceConfig;
  setGeofence: React.Dispatch<React.SetStateAction<GeofenceConfig>>;
  isBreached: boolean;
  distanceToCenter: number | null;
  currentPoint: GeoPoint;
  onSetCenterToCurrent: () => void;
}

export function GeofenceManager({
  geofence,
  setGeofence,
  isBreached,
  distanceToCenter,
  currentPoint,
  onSetCenterToCurrent,
}: GeofenceManagerProps) {
  const distanceToEdge = distanceToCenter !== null ? distanceToCenter - geofence.radiusMeters : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          {isBreached ? (
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Perimeter Containment Zone
          </span>
        </div>

        {/* Toggle Enabled */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={geofence.enabled}
            onChange={(e) => setGeofence((prev) => ({ ...prev, enabled: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {/* Real-time Status Banner */}
      {geofence.enabled && geofence.center ? (
        <div
          className={`p-3 rounded-xl border mb-3 flex items-start gap-3 transition-colors ${
            isBreached
              ? 'bg-rose-950/80 border-rose-500/80 text-rose-200 animate-pulse'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {isBreached ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="text-xs font-black uppercase tracking-wider">
              {isBreached ? '⚠️ 2 KM BOUNDARY BREACH DETECTED!' : 'Secure: Inside Perimeter Circle'}
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {distanceToCenter !== null && (
                <span>
                  {isBreached
                    ? `${formatDistance(Math.abs(distanceToEdge ?? 0))} outside the ${formatDistance(geofence.radiusMeters)} radius limit!`
                    : `${formatDistance(Math.abs(distanceToEdge ?? 0))} remaining before boundary.`}
                  {' '}(Center: {formatDistance(distanceToCenter)})
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs mb-3">
          Perimeter monitoring is currently disabled.
        </div>
      )}

      {/* Radius Controls with 2km Highlighted */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Perimeter Radius:</span>
            <span className="font-mono text-cyan-400 font-bold">{formatDistance(geofence.radiusMeters)} ({geofence.radiusMeters}m)</span>
          </div>
          <input
            type="range"
            min="200"
            max="5000"
            step="100"
            value={geofence.radiusMeters}
            onChange={(e) =>
              setGeofence((prev) => ({ ...prev, radiusMeters: Number(e.target.value) }))
            }
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[500, 1000, 2000, 3000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGeofence((prev) => ({ ...prev, radiusMeters: preset }))}
                className={`py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                  geofence.radiusMeters === preset
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {preset >= 1000 ? `${preset / 1000} km` : `${preset} m`}
                {preset === 2000 ? ' (Active)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Set Center Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onSetCenterToCurrent}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Set Center to My Position
          </button>

          <button
            onClick={() => soundFx.playGeofenceWarning()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Test alert tone"
          >
            <Volume2 className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
