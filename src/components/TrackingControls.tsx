import { TrackingMode } from '../types/tracker';
import { PRESET_SIMULATED_ROUTES } from '../data/simulatedRoutes';
import { Play, Pause, RotateCcw, Radio, Sliders, AlertOctagon, Car, Footprints, Bike, Zap } from 'lucide-react';

interface TrackingControlsProps {
  isTracking: boolean;
  isPaused: boolean;
  togglePause: () => void;
  resetTrip: () => void;
  trackingMode: TrackingMode;
  setTrackingMode: (mode: TrackingMode) => void;
  selectedSimRouteId: string;
  setSelectedSimRouteId: (id: string) => void;
  simMultiplier: number;
  setSimMultiplier: (mult: number) => void;
  onOpenSos: () => void;
  gpsError: string | null;
}

export function TrackingControls({
  isTracking,
  isPaused,
  togglePause,
  resetTrip,
  trackingMode,
  setTrackingMode,
  selectedSimRouteId,
  setSelectedSimRouteId,
  simMultiplier,
  setSimMultiplier,
  onOpenSos,
  gpsError,
}: TrackingControlsProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
      {/* Top Action Row: Tracking Controls & SOS */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={togglePause}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
            isPaused
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 fill-current" /> Resume Tracking
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 fill-current" /> Pause Tracking
            </>
          )}
        </button>

        {/* Reset / Clear Button */}
        <button
          onClick={() => {
            if (confirm('Clear recorded breadcrumb trail and reset trip stats?')) {
              resetTrip();
            }
          }}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          title="Reset Trip Stats & Route"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Urgent Emergency SOS Button */}
        <button
          onClick={onOpenSos}
          className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/50 animate-pulse transition-all"
        >
          <AlertOctagon className="w-4 h-4 fill-white" />
          <span>SOS</span>
        </button>
      </div>

      {/* GPS Error notice if any */}
      {gpsError && trackingMode === 'live' && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-1.5">
          <div>{gpsError}</div>
          <button
            onClick={() => setTrackingMode('simulated')}
            className="text-[11px] font-bold text-cyan-400 hover:underline self-start flex items-center gap-1"
          >
            <Zap className="w-3 h-3" /> Switch to Simulation Mode to test
          </button>
        </div>
      )}

      {/* Mode Switch: Live GPS vs Simulated Trip */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Source Mode
          </span>
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-[11px] font-mono">
            <button
              onClick={() => setTrackingMode('live')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                trackingMode === 'live'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3 h-3" /> Device GPS
            </button>
            <button
              onClick={() => setTrackingMode('simulated')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                trackingMode === 'simulated'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" /> Simulation
            </button>
          </div>
        </div>

        {/* Simulation Controls when in Simulation mode */}
        {trackingMode === 'simulated' && (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 mt-2">
            <div className="text-[10px] uppercase font-bold text-cyan-400">
              Select Preset Route
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESET_SIMULATED_ROUTES.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedSimRouteId(route.id)}
                  className={`p-2 rounded-lg text-left transition-colors border text-[11px] ${
                    selectedSimRouteId === route.id
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold truncate">{route.name.split(' ')[0]}</div>
                  <div className="text-[9px] opacity-75 truncate">{route.name.split(' ').slice(1).join(' ')}</div>
                </button>
              ))}
            </div>

            {/* Playback speed multiplier */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-mono">Speed Multiplier</span>
              <div className="flex items-center gap-1">
                {[1, 2, 5, 10].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setSimMultiplier(mult)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                      simMultiplier === mult
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
