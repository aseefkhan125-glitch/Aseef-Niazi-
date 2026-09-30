import { useState } from 'react';
import { TargetDevice, GeoPoint } from '../types/tracker';
import {
  calculateDistance,
  calculateBearing,
  degreesToCardinal,
  formatDistance,
  soundFx,
  generateRandomIMEI,
} from '../utils/geoUtils';
import {
  Smartphone,
  Signal,
  Radio,
  Search,
  Plus,
  Crosshair,
  RefreshCw,
  Zap,
  Shield,
  Check,
  Phone,
  Binary,
  Layers,
  Fingerprint,
} from 'lucide-react';

interface TargetLocatorProps {
  targets: TargetDevice[];
  selectedTargetId: string | null;
  onSelectTarget: (target: TargetDevice) => void;
  onUpdateTargetRadius: (id: string, newRadius: number) => void;
  onAddTarget: (newTarget: Omit<TargetDevice, 'id' | 'lastPing'>) => void;
  currentPoint: GeoPoint;
}

export function TargetLocator({
  targets,
  selectedTargetId,
  onSelectTarget,
  onUpdateTargetRadius,
  onAddTarget,
  currentPoint,
}: TargetLocatorProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newImei, setNewImei] = useState<string>('');
  const [newRadius, setNewRadius] = useState<number>(200); // 200m circle
  const [pingingId, setPingingId] = useState<string | null>(null);

  const filteredTargets = targets.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phoneNumber.includes(searchQuery) ||
      t.imei.includes(searchQuery)
  );

  const handlePing = (target: TargetDevice, e: React.MouseEvent) => {
    e.stopPropagation();
    setPingingId(target.id);
    soundFx.playGeofenceWarning();
    setTimeout(() => {
      setPingingId(null);
    }, 1500);
  };

  const handleOpenAdd = () => {
    setIsAdding(!isAdding);
    setNewImei(generateRandomIMEI());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    onAddTarget({
      name: newName.trim(),
      phoneNumber: newPhone.trim(),
      imei: newImei.trim() || generateRandomIMEI(),
      status: 'triangulated',
      lat: currentPoint.lat + (Math.random() - 0.5) * 0.005,
      lng: currentPoint.lng + (Math.random() - 0.5) * 0.005,
      uncertaintyRadiusMeters: newRadius,
      carrier: 'Carrier Triangulation Sector 04',
      batteryLevel: Math.floor(Math.random() * 40) + 60,
      signalDbm: -74,
      address: 'Triangulated BTS Sector',
    });

    setNewName('');
    setNewPhone('');
    setNewImei('');
    setNewRadius(200);
    setIsAdding(false);
  };

  return (
    <div className="bg-slate-950/95 border-2 border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3 font-mono relative overflow-hidden">
      {/* Corner Bracket Reticles */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Fingerprint className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                FIA • NCCA TARGET DIRECTORY
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-cyan-400/90">
              Cellular Triangulation & IMEI Forensics
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1 transition-colors shadow-md shadow-cyan-600/30"
        >
          <Plus className="w-3.5 h-3.5" /> ADD TARGET
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter by Name, MSISDN or IMEI..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
        />
      </div>

      {/* Add New Target Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-3.5 rounded-xl bg-slate-900 border-2 border-cyan-500/40 space-y-2.5 shadow-xl"
        >
          <div className="flex items-center justify-between text-[11px] font-black text-cyan-300 uppercase tracking-wider">
            <span>DISPATCH NEW TRACKING WARRANT</span>
            <span className="text-slate-500 text-[10px]">AUTH: NCCA-CCW</span>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">TARGET IDENTITY / NAME</label>
            <input
              type="text"
              placeholder="e.g. Amber Gull"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">MSISDN / PHONE</label>
              <input
                type="text"
                placeholder="+1 555-728-4921"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 block mb-1">DEVICE IMEI</label>
                <button
                  type="button"
                  onClick={() => setNewImei(generateRandomIMEI())}
                  className="text-[9px] text-cyan-400 hover:underline"
                >
                  RANDOMIZE
                </button>
              </div>
              <input
                type="text"
                placeholder="15-digit IMEI"
                value={newImei}
                onChange={(e) => setNewImei(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-300 font-mono mb-1">
              <span>Cellular Triangulation CEP Radius:</span>
              <span className="text-amber-400 font-bold">{newRadius}m circle</span>
            </div>
            <input
              type="range"
              min="50"
              max="600"
              step="25"
              value={newRadius}
              onChange={(e) => setNewRadius(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!newName.trim() || !newPhone.trim()}
              className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase transition-colors"
            >
              INITIALIZE INTERCEPT
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
            >
              CANCEL
            </button>
          </div>
        </form>
      )}

      {/* Target Devices Dossiers */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filteredTargets.map((target) => {
          const isSelected = selectedTargetId === target.id;
          const isPinging = pingingId === target.id;
          const dist = calculateDistance(currentPoint.lat, currentPoint.lng, target.lat, target.lng);
          const bearing = calculateBearing(currentPoint.lat, currentPoint.lng, target.lat, target.lng);
          const cardinal = degreesToCardinal(bearing);

          return (
            <div
              key={target.id}
              onClick={() => onSelectTarget(target)}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-950/40'
                  : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Corner reticle marks on target card */}
              <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-cyan-500/40 pointer-events-none" />
              <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-500/40 pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-cyan-500/40 pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-cyan-500/40 pointer-events-none" />

              {/* Target Header: Name & 200m Radius */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-950 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-cyan-500/50 text-cyan-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        {target.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/50">
                        ±{target.uncertaintyRadiusMeters}m CEP
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-amber-400" />
                      {target.phoneNumber}
                    </div>
                  </div>
                </div>

                {/* Target Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handlePing(target, e)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isPinging
                        ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                    title="Ping Base Transceiver Station"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTarget(target);
                    }}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                    title="Focus on Map"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* IMEI Number Banner */}
              <div className="mt-2.5 p-1.5 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Binary className="w-3 h-3 text-cyan-400" /> IMEI IDENTIFIER:
                </span>
                <span className="text-emerald-400 font-black tracking-widest">
                  {target.imei}
                </span>
              </div>

              {/* Triangulation Telemetry */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500">RANGE:</span>{' '}
                  <span className="text-white font-bold">
                    {formatDistance(dist)} ({cardinal})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">SIGNAL:</span>{' '}
                  <span className="text-emerald-400 font-bold">{target.signalDbm} dBm (Active)</span>
                </div>
              </div>

              {target.address && (
                <div className="text-[10px] text-slate-400 truncate mt-1">
                  📍 {target.address}
                </div>
              )}

              {/* Uncertainty Circle Slider */}
              <div className="mt-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Triangulation Uncertainty Radius:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    {target.uncertaintyRadiusMeters} meters
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="25"
                  value={target.uncertaintyRadiusMeters}
                  onChange={(e) => onUpdateTargetRadius(target.id, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
