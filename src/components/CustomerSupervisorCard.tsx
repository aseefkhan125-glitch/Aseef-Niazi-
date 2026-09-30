import { useState } from 'react';
import { AdminSupervisor, Yard500CircleConfig, GeoPoint, TargetDevice } from '../types/tracker';
import { formatYards, formatDistance } from '../utils/geoUtils';
import { speakAnnouncement } from '../utils/speechUtils';
import {
  ShieldCheck,
  ShieldAlert,
  Eye,
  UserCheck,
  Lock,
  Phone,
  Radio,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Shield,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';

interface CustomerSupervisorCardProps {
  currentPoint: GeoPoint;
  target: TargetDevice;
  supervisor: AdminSupervisor;
  yard500Config: Yard500CircleConfig;
  lastBroadcastMessage?: string | null;
  onSwitchToAdmin: () => void;
}

export function CustomerSupervisorCard({
  currentPoint,
  target,
  supervisor,
  yard500Config,
  lastBroadcastMessage,
  onSwitchToAdmin,
}: CustomerSupervisorCardProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activeMessage = lastBroadcastMessage || 'Location changed at 30 yard circle North';

  const handlePlayVoice = () => {
    setIsPlaying(true);
    speakAnnouncement(activeMessage, () => setIsPlaying(false));
  };

  return (
    <div className="bg-slate-950/95 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md font-mono space-y-4">
      {/* Customer Mode Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
              CUSTOMER / SUBJECT VIEW
            </div>
            <div className="text-[10px] text-slate-400">
              User ID: <span className="text-white font-bold">AumberGull03019721327</span> ({target.phoneNumber})
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchToAdmin}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 flex items-center gap-1 transition-colors"
          title="Switch to Admin operational controls"
        >
          <Shield className="w-3 h-3 text-cyan-400" />
          <span>ADMIN VIEW</span>
        </button>
      </div>

      {/* VOICE DISPATCH AUDIO RECEIVER (Requested by user) */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-amber-300">
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>ADMIN VOICE DISPATCH (SPOKEN IN ENGLISH)</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            SPEECH ACTIVE
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-white">
          <div className="text-[10px] text-slate-400 mb-1">Latest Voice Announcement from Admin:</div>
          <div className="font-semibold text-amber-200 italic">
            "{activeMessage}"
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlayVoice}
          disabled={isPlaying}
          className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/30 cursor-pointer"
        >
          <Play className={`w-3.5 h-3.5 fill-slate-950 ${isPlaying ? 'animate-spin' : ''}`} />
          <span>{isPlaying ? 'PLAYING VOICE...' : '🔊 REPLAY ENGLISH VOICE'}</span>
        </button>
      </div>

      {/* WHOM IS WATCHING YOU (Transparency Card) */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 relative overflow-hidden space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
            <Eye className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>ACTIVE SUPERVISING ADMIN</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            WATCHING YOU LIVE
          </span>
        </div>

        {/* Admin Details */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black text-white flex items-center gap-2">
              <span>{supervisor.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {supervisor.role}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Badge: <span className="text-slate-200">{supervisor.badgeNumber}</span>
            </span>
          </div>

          <div className="text-[11px] text-cyan-300 flex items-center gap-1">
            <span>Email:</span>
            <span className="font-semibold text-white underline">{supervisor.email}</span>
          </div>

          <div className="text-[10px] text-slate-400 leading-tight">
            {supervisor.agency}
          </div>
        </div>

        {/* Admin Control Notice */}
        <div className="text-[10px] text-amber-300/90 bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            All movements, 30-yard updates, and geofence alarms are controlled exclusively by Admin {supervisor.name}.
          </span>
        </div>
      </div>

      {/* 500 YARD CIRCLE STATUS */}
      <div
        className={`p-3 rounded-xl border transition-all ${
          yard500Config.isBreached
            ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
            : 'bg-slate-900/80 border-amber-500/40 text-amber-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
            {yard500Config.isBreached ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            )}
            <span>500 YARD CIRCLE BOUNDARY (457m)</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700">
            {yard500Config.isBreached ? 'EXCEEDED' : 'INSIDE'}
          </span>
        </div>

        <div className="text-xs font-bold mt-1">
          {yard500Config.isBreached ? (
            <span className="text-rose-300">
              🚨 Location changed by {yard500Config.lastDisplacementYards} yards! Admin {supervisor.name} notified.
            </span>
          ) : (
            <span className="text-emerald-300">
              ✅ Inside 500 yard circle ({yard500Config.lastDisplacementYards} yards from anchor).
            </span>
          )}
        </div>
      </div>

      {/* Customer Telemetry Summary */}
      <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-500">PHONE NUMBER</div>
          <div className="text-cyan-300 font-bold mt-0.5">{target.phoneNumber}</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-500">SUPERVISION</div>
          <div className="text-emerald-400 font-bold mt-0.5">ONLINE (ADMIN CONTROL)</div>
        </div>
      </div>
    </div>
  );
}
