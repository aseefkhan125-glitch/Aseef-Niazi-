import { useState, useEffect } from 'react';
import { GeoPoint } from '../types/tracker';
import { toDMS, soundFx } from '../utils/geoUtils';
import { AlertOctagon, PhoneCall, Share2, Copy, Check, Volume2, VolumeX, X, MapPin } from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoint: GeoPoint;
}

export function EmergencySOSModal({
  isOpen,
  onClose,
  currentPoint,
}: EmergencySOSModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);

  // Stop siren if modal is closed
  useEffect(() => {
    if (!isOpen && isSirenActive) {
      soundFx.stopSosBeep();
      setIsSirenActive(false);
    }
  }, [isOpen, isSirenActive]);

  if (!isOpen) return null;

  const lat = currentPoint.lat.toFixed(6);
  const lng = currentPoint.lng.toFixed(6);
  const dmsCoord = toDMS(currentPoint.lat, currentPoint.lng);
  const mapsUrl = `https://www.google.com/maps?q=${currentPoint.lat},${currentPoint.lng}`;
  const timestampStr = new Date(currentPoint.timestamp).toLocaleTimeString();

  const emergencyMessage = `🚨 URGENT EMERGENCY SOS ALERT!\nI need immediate assistance at this location:\nCoordinates: ${lat}, ${lng} (${dmsCoord})\nGoogle Maps: ${mapsUrl}\nTime: ${timestampStr}\nAccuracy: ±${Math.round(currentPoint.accuracy ?? 10)}m`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emergencyMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleSiren = () => {
    if (isSirenActive) {
      soundFx.stopSosBeep();
      setIsSirenActive(false);
    } else {
      soundFx.startSosBeep();
      setIsSirenActive(true);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(emergencyMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSmsShare = () => {
    const encoded = encodeURIComponent(emergencyMessage);
    window.location.href = `sms:?body=${encoded}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-rose-600/80 shadow-2xl shadow-rose-950/50 p-6 overflow-hidden">
        {/* Urgent pulsating top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 animate-pulse" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center animate-bounce">
              <AlertOctagon className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                  PRIORITY ALERT
                </span>
                <span className="text-xs text-rose-400 font-mono">{timestampStr}</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Urgent Location Dispatch
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSirenActive) soundFx.stopSosBeep();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Coordinates Callout */}
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-700/40 my-4">
          <div className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" /> Your Exact Live Coordinates
          </div>
          <div className="text-lg font-black font-mono text-white tracking-wide">
            {lat}, {lng}
          </div>
          <div className="text-xs font-mono text-rose-300/80 mt-0.5">
            {dmsCoord} (Accuracy ±{Math.round(currentPoint.accuracy ?? 10)}m)
          </div>
        </div>

        {/* Audio Distress Siren Toggle */}
        <div className="mb-4">
          <button
            onClick={handleToggleSiren}
            className={`w-full py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
              isSirenActive
                ? 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-500/30 animate-pulse'
                : 'bg-slate-800/90 text-rose-300 border-rose-800/40 hover:bg-slate-800'
            }`}
          >
            {isSirenActive ? (
              <>
                <VolumeX className="w-5 h-5" /> Stop Distress Siren
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" /> Sound Audible Audio Beacon Siren
              </>
            )}
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Copy GPS Link */}
          <button
            onClick={handleCopy}
            className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copied Link!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" /> Copy GPS & Message
              </>
            )}
          </button>

          {/* Share on WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-700/30"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>

          {/* Send SMS */}
          <button
            onClick={handleSmsShare}
            className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-700/30"
          >
            <Share2 className="w-4 h-4" /> Send Emergency SMS
          </button>

          {/* Direct Google Maps */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MapPin className="w-4 h-4 text-cyan-400" /> Open in Google Maps
          </a>
        </div>

        {/* Direct Emergency Call Hotlines */}
        <div className="pt-3 border-t border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Direct Emergency Hotlines
          </div>
          <div className="grid grid-cols-3 gap-2">
            <a
              href="tel:911"
              className="py-2 px-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-black text-center text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" /> 911 (US/CAN)
            </a>
            <a
              href="tel:112"
              className="py-2 px-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-black text-center text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" /> 112 (EU/Global)
            </a>
            <a
              href="tel:999"
              className="py-2 px-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-black text-center text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" /> 999 (UK/Asia)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
