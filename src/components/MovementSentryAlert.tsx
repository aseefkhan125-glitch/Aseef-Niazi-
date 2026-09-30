import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Anchor, RefreshCw, VolumeX, BellRing, MapPin } from 'lucide-react';
import { formatDistance, soundFx } from '../utils/geoUtils';

interface MovementSentryAlertProps {
  movementAnchor: { lat: number; lng: number };
  isMovementDetected: boolean;
  movementDisplacement: number;
  movementAlertEnabled: boolean;
  onToggleMovementAlert: () => void;
  movementThresholdMeters: number;
  onChangeThreshold: (val: number) => void;
  onResetAnchorToLocation: (lat?: number, lng?: number) => void;
  onDismissAlarm: () => void;
}

export function MovementSentryAlert({
  movementAnchor,
  isMovementDetected,
  movementDisplacement,
  movementAlertEnabled,
  onToggleMovementAlert,
  movementThresholdMeters,
  onChangeThreshold,
  onResetAnchorToLocation,
  onDismissAlarm,
}: MovementSentryAlertProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="font-mono">
      {/* Active Movement Alarm Floating Banner */}
      {isMovementDetected && movementAlertEnabled && (
        <div className="p-3 mb-2 rounded-xl bg-gradient-to-r from-rose-950/95 via-red-900/90 to-rose-950/95 border-2 border-rose-500 shadow-2xl shadow-rose-950/70 text-white flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-600/30 border border-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-300 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                MOVEMENT DETECTED FROM MAIN LOCATION!
              </div>
              <div className="text-[11px] text-slate-200">
                Displaced by <span className="font-black text-amber-300">{formatDistance(movementDisplacement)}</span> from{' '}
                <span className="text-cyan-300 font-mono">32.280556, 71.442707</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onResetAnchorToLocation(32.280556, 71.442707);
                soundFx.playGeofenceWarning();
              }}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-black uppercase border border-rose-400 transition-colors"
              title="Reset anchor back to Google Maps link location"
            >
              RESET TO MAIN
            </button>

            <button
              onClick={onDismissAlarm}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
              title="Acknowledge alert"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sentry Anchor Control Card */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-400/50 flex items-center justify-center">
              <Anchor className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>MAIN LOCATION ANCHOR</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isMovementDetected
                      ? 'bg-rose-400 animate-ping'
                      : movementAlertEnabled
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-slate-600'
                  }`}
                />
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {movementAnchor.lat.toFixed(6)}, {movementAnchor.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <button
            onClick={onToggleMovementAlert}
            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border transition-colors ${
              movementAlertEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {movementAlertEnabled ? 'SENTRY ON' : 'DISABLED'}
          </button>
        </div>

        {/* Current status line */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          <span>
            Status:{' '}
            <strong className={isMovementDetected ? 'text-rose-400' : 'text-emerald-400'}>
              {isMovementDetected
                ? `MOVED ${formatDistance(movementDisplacement)} AWAY`
                : 'STATIONARY (WATCHING)'}
            </strong>
          </span>

          <button
            onClick={() => onResetAnchorToLocation(32.280556, 71.442707)}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            title="Snap anchor to Google Maps link location"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Reset Anchor
          </button>
        </div>
      </div>
    </div>
  );
}
