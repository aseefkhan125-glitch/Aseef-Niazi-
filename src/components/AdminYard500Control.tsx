import { useState } from 'react';
import { Yard500CircleConfig, TargetDevice } from '../types/tracker';
import { formatYards, formatDistance, soundFx } from '../utils/geoUtils';
import { CircleDot, ShieldAlert, ShieldCheck, RefreshCw, Bell, BellRing, Smartphone, MapPin } from 'lucide-react';

interface AdminYard500ControlProps {
  yard500Config: Yard500CircleConfig;
  target: TargetDevice;
  onToggleEnabled: () => void;
  onRecenterCircle: () => void;
  onTestNotification: () => void;
}

export function AdminYard500Control({
  yard500Config,
  target,
  onToggleEnabled,
  onRecenterCircle,
  onTestNotification,
}: AdminYard500ControlProps) {
  const [testSent, setTestSent] = useState<boolean>(false);

  const handleTest = () => {
    onTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md font-mono space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center">
            <CircleDot className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-300">
              500 YARD CIRCLE CONTROLLER (ADMIN)
            </div>
            <div className="text-[10px] text-slate-400">
              Target: <span className="text-white font-bold">{target.name}</span> ({target.phoneNumber})
            </div>
          </div>
        </div>

        {/* Enable / Disable Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={yard500Config.enabled}
            onChange={onToggleEnabled}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {/* Real-time Status Card */}
      <div
        className={`p-3 rounded-xl border transition-colors ${
          yard500Config.isBreached
            ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
            : 'bg-slate-950/80 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {yard500Config.isBreached ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-black uppercase tracking-wider">
                {yard500Config.isBreached
                  ? '🚨 500 YARD MOVEMENT NOTIFICATION ACTIVE!'
                  : '500 YARD PERIMETER SECURE'}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                Current displacement:{' '}
                <span className="font-bold text-amber-300">
                  {yard500Config.lastDisplacementYards} yards
                </span>{' '}
                / 500 yards (457m limit)
              </div>
            </div>
          </div>
        </div>

        {yard500Config.isBreached && (
          <div className="mt-2 text-[10px] text-rose-300 bg-rose-900/40 p-2 rounded border border-rose-600/50">
            ⚠️ Phone location changed by {yard500Config.lastDisplacementYards} yards! Instant notification triggered to Admin and customer log updated.
          </div>
        )}
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onRecenterCircle}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          title="Reset 500-yard circle to target's current position"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>RE-CENTER 500Y</span>
        </button>

        <button
          onClick={handleTest}
          disabled={testSent}
          className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          title="Test 500-yard movement notification tone and push"
        >
          <BellRing className="w-3.5 h-3.5 text-amber-400" />
          <span>{testSent ? 'ALERT TESTED!' : 'TEST NOTIFY'}</span>
        </button>
      </div>
    </div>
  );
}
