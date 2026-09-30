import { useState } from 'react';
import { Checkpoint, CheckpointCategory, GeoPoint } from '../types/tracker';
import { calculateDistance, formatDistance } from '../utils/geoUtils';
import { MapPin, Plus, Trash2, Shield, AlertTriangle, Car, Users, Crosshair } from 'lucide-react';

interface CheckpointsManagerProps {
  checkpoints: Checkpoint[];
  currentPoint: GeoPoint;
  onAddCheckpoint: (title: string, category: CheckpointCategory, notes?: string) => void;
  onRemoveCheckpoint: (id: string) => void;
  onSelectCheckpoint: (cp: Checkpoint) => void;
}

export function CheckpointsManager({
  checkpoints,
  currentPoint,
  onAddCheckpoint,
  onRemoveCheckpoint,
  onSelectCheckpoint,
}: CheckpointsManagerProps) {
  const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<CheckpointCategory>('waypoint');
  const [notes, setNotes] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddCheckpoint(title.trim(), category, notes.trim() || undefined);
    setTitle('');
    setNotes('');
    setIsOpenAdd(false);
  };

  const getCategoryIcon = (cat: CheckpointCategory) => {
    switch (cat) {
      case 'safe':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'hazard':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'parking':
        return <Car className="w-3.5 h-3.5 text-amber-400" />;
      case 'meeting':
        return <Users className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Checkpoints & Markers ({checkpoints.length})
          </span>
        </div>

        <button
          onClick={() => setIsOpenAdd(!isOpenAdd)}
          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> Pin Here
        </button>
      </div>

      {/* Add Checkpoint Form */}
      {isOpenAdd && (
        <form onSubmit={handleSave} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 mb-3">
          <input
            type="text"
            placeholder="Marker Title (e.g. Car Parked, Trailhead)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CheckpointCategory)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 flex-1"
            >
              <option value="waypoint">Waypoint (Blue)</option>
              <option value="safe">Safe Haven (Green)</option>
              <option value="hazard">Hazard / Caution (Red)</option>
              <option value="parking">Vehicle Parking (Amber)</option>
              <option value="meeting">Rendezvous Point (Purple)</option>
            </select>

            <button
              type="submit"
              disabled={!title.trim()}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors"
            >
              Save Pin
            </button>
          </div>
        </form>
      )}

      {/* Checkpoints List */}
      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
        {checkpoints.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            No checkpoints added yet. Pin a landmark or hazard at your live coordinates.
          </div>
        ) : (
          checkpoints.map((cp) => {
            const dist = calculateDistance(currentPoint.lat, currentPoint.lng, cp.lat, cp.lng);
            return (
              <div
                key={cp.id}
                className="p-2 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 flex items-center justify-between transition-colors group cursor-pointer"
                onClick={() => onSelectCheckpoint(cp)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-800 shrink-0">
                    {getCategoryIcon(cp.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {cp.title}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono">
                      {formatDistance(dist)} away
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCheckpoint(cp);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Pan to checkpoint"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCheckpoint(cp.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                    title="Delete checkpoint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
