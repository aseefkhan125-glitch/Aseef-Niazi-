import React, { useState } from 'react';
import { TargetDevice } from '../types/tracker';
import { speakAnnouncement } from '../utils/speechUtils';
import { soundFx } from '../utils/geoUtils';
import {
  Volume2,
  Send,
  Navigation,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Radio,
  Sparkles,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

interface AdminVoiceBroadcastPanelProps {
  target: TargetDevice;
  onMoveTargetDirection: (direction: 'North' | 'South' | 'East' | 'West', yards: number, customMessage?: string) => void;
  onBroadcastCustomMessage: (message: string) => void;
  lastBroadcastMessage?: string | null;
}

export function AdminVoiceBroadcastPanel({
  target,
  onMoveTargetDirection,
  onBroadcastCustomMessage,
  lastBroadcastMessage,
}: AdminVoiceBroadcastPanelProps) {
  const [customText, setCustomText] = useState<string>('Location changed at 30 yard circle North');
  const [stepYards, setStepYards] = useState<number>(30); // 30 yards requested by user
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  const handleSendCustomBroadcast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customText.trim()) return;

    const messageToSpeak = customText.trim();
    soundFx.playGeofenceWarning();
    setIsSpeaking(true);
    speakAnnouncement(messageToSpeak, () => setIsSpeaking(false));
    onBroadcastCustomMessage(messageToSpeak);

    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 2500);
  };

  const handleMoveAndAnnounce = (direction: 'North' | 'South' | 'East' | 'West') => {
    const englishAnnouncement = `Location changed at ${stepYards} yard circle ${direction}`;
    soundFx.playGeofenceWarning();
    setIsSpeaking(true);
    speakAnnouncement(englishAnnouncement, () => setIsSpeaking(false));
    onMoveTargetDirection(direction, stepYards, englishAnnouncement);

    setCustomText(englishAnnouncement);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 2500);
  };

  const PRESET_MESSAGES = [
    'Location changed at 30 yard circle North',
    'Location changed at 30 yard circle South',
    'Location changed at 30 yard circle East',
    'Location changed at 30 yard circle West',
    'Admin is actively monitoring your location at Hafiz Wala Chak 7 ML',
    'Perimeter containment secure. Remain at present station.',
  ];

  return (
    <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md font-mono space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span>VOICE DISPATCH & MOVEMENT</span>
              {isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </div>
            <div className="text-[10px] text-slate-400">
              Target: <span className="text-white font-bold">{target.name}</span> ({target.phoneNumber})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/40">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>AUDIO LIVE</span>
        </div>
      </div>

      {/* 30-Yard Circle Movement Controller (Requested by user) */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-amber-300 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5" />
            ADMIN MOVEMENT (30 YARD CIRCLE)
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            Step: <span className="text-cyan-400">{stepYards} Yards</span>
          </span>
        </div>

        {/* Directional Pad */}
        <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto pt-1">
          <div />
          <button
            type="button"
            onClick={() => handleMoveAndAnnounce('North')}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex flex-col items-center justify-center gap-0.5 shadow-md shadow-cyan-600/30 transition-transform active:scale-95 cursor-pointer"
            title="Move 30 Yards North and Announce in English"
          >
            <ArrowUp className="w-4 h-4 stroke-[3]" />
            <span className="text-[9px]">NORTH</span>
          </button>
          <div />

          <button
            type="button"
            onClick={() => handleMoveAndAnnounce('West')}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex flex-col items-center justify-center gap-0.5 shadow-md shadow-cyan-600/30 transition-transform active:scale-95 cursor-pointer"
            title="Move 30 Yards West and Announce in English"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span className="text-[9px]">WEST</span>
          </button>

          <div className="rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-[9px] text-amber-300 font-bold p-1">
            <span>30 YD</span>
            <span className="text-[8px] text-slate-400">CIRCLE</span>
          </div>

          <button
            type="button"
            onClick={() => handleMoveAndAnnounce('East')}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex flex-col items-center justify-center gap-0.5 shadow-md shadow-cyan-600/30 transition-transform active:scale-95 cursor-pointer"
            title="Move 30 Yards East and Announce in English"
          >
            <ArrowRight className="w-4 h-4 stroke-[3]" />
            <span className="text-[9px]">EAST</span>
          </button>

          <div />
          <button
            type="button"
            onClick={() => handleMoveAndAnnounce('South')}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex flex-col items-center justify-center gap-0.5 shadow-md shadow-cyan-600/30 transition-transform active:scale-95 cursor-pointer"
            title="Move 30 Yards South and Announce in English"
          >
            <ArrowDown className="w-4 h-4 stroke-[3]" />
            <span className="text-[9px]">SOUTH</span>
          </button>
          <div />
        </div>
      </div>

      {/* Custom Admin Voice Announcer: "Jo bhi admin likhy ga user ko wo hi sunai da ga" */}
      <form onSubmit={handleSendCustomBroadcast} className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-300">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            ADMIN VOICE MESSAGE (SPOKEN TO USER)
          </span>
          <span className="text-[10px] text-amber-400">User will hear this voice</span>
        </div>

        <textarea
          rows={2}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Type whatever message the user should hear in English..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
        />

        {/* Quick Message Presets */}
        <div className="flex flex-wrap gap-1">
          {PRESET_MESSAGES.map((msg, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCustomText(msg)}
              className="text-[9px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 truncate max-w-full transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!customText.trim()}
          className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            sentSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30'
          }`}
        >
          {sentSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>ANNOUNCED & SPOKEN TO USER!</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>SPEAK & BROADCAST TO USER</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
