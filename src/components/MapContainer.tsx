import { useEffect, useState, useCallback, useMemo } from 'react';
import { Map, AdvancedMarker, useMap, MapMouseEvent } from '@vis.gl/react-google-maps';
import { GeoPoint, GeofenceConfig, Checkpoint, MapTheme, TargetDevice } from '../types/tracker';
import { calculateDistance } from '../utils/geoUtils';
import { MapLayers } from './MapLayers';
import {
  Navigation2,
  Shield,
  AlertTriangle,
  MapPin,
  Car,
  Users,
  Crosshair,
  Layers,
  Smartphone,
  Signal,
  Radio,
  Eye,
  Activity,
  Maximize2,
  Bookmark,
  Check,
  Anchor
} from 'lucide-react';

interface MapContainerProps {
  currentPoint: GeoPoint;
  points: GeoPoint[];
  geofence: GeofenceConfig;
  isGeofenceBreached: boolean;
  checkpoints: Checkpoint[];
  autoCenter: boolean;
  setAutoCenter: (val: boolean) => void;
  onMapClickCoord?: (lat: number, lng: number) => void;
  selectedCheckpointId?: string | null;
  onSelectCheckpoint?: (id: string | null) => void;
  targets?: TargetDevice[];
  selectedTargetId?: string | null;
  onSelectTarget?: (target: TargetDevice | null) => void;
  isFollowCameraActive?: boolean;
  onSaveTargetLocation?: (target: TargetDevice) => void;
  movementAnchor?: { lat: number; lng: number } | null;
  isMovementDetected?: boolean;
  yard500Circle?: { enabled: boolean; center: { lat: number; lng: number }; isBreached: boolean } | null;
}

export function MapContainer({
  currentPoint,
  points,
  geofence,
  isGeofenceBreached,
  checkpoints,
  autoCenter,
  setAutoCenter,
  onMapClickCoord,
  selectedCheckpointId,
  onSelectCheckpoint,
  targets = [],
  selectedTargetId,
  onSelectTarget,
  isFollowCameraActive = false,
  onSaveTargetLocation,
  movementAnchor,
  isMovementDetected = false,
  yard500Circle,
}: MapContainerProps) {
  const map = useMap();
  const [mapTheme, setMapTheme] = useState<MapTheme>('hybrid'); // Tactical default: hybrid / satellite
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [justSavedTargetId, setJustSavedTargetId] = useState<string | null>(null);

  const selectedTarget = useMemo(
    () => targets.find((t) => t.id === selectedTargetId) || null,
    [targets, selectedTargetId]
  );

  const targetDistance = useMemo(() => {
    if (!selectedTarget) return null;
    return calculateDistance(currentPoint.lat, currentPoint.lng, selectedTarget.lat, selectedTarget.lng);
  }, [currentPoint.lat, currentPoint.lng, selectedTarget]);

  const isNearTarget = targetDistance !== null && targetDistance <= Math.max(250, selectedTarget?.uncertaintyRadiusMeters ?? 200);

  // Follow Camera effect: fits bounds to both currentPoint and selectedTarget
  useEffect(() => {
    if (!map || !isFollowCameraActive || !selectedTarget) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: currentPoint.lat, lng: currentPoint.lng });
    bounds.extend({ lat: selectedTarget.lat, lng: selectedTarget.lng });
    map.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 });
  }, [map, isFollowCameraActive, currentPoint.lat, currentPoint.lng, selectedTarget]);

  // Auto center map whenever currentPoint updates and autoCenter is true
  useEffect(() => {
    if (!map || !autoCenter || !currentPoint) return;
    map.panTo({ lat: currentPoint.lat, lng: currentPoint.lng });
  }, [map, autoCenter, currentPoint.lat, currentPoint.lng]);

  // Center on user action
  const handleRecenter = useCallback(() => {
    if (!map) return;
    map.setZoom(17);
    map.panTo({ lat: currentPoint.lat, lng: currentPoint.lng });
    setAutoCenter(true);
  }, [map, currentPoint, setAutoCenter]);

  // Handle manual map pan by user - disable autoCenter if user drags
  const handleDragStart = useCallback(() => {
    if (autoCenter) {
      setAutoCenter(false);
    }
  }, [autoCenter, setAutoCenter]);

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (e.detail?.latLng && onMapClickCoord) {
        onMapClickCoord(e.detail.latLng.lat, e.detail.latLng.lng);
      }
    },
    [onMapClickCoord]
  );

  const getCheckpointIcon = (category: Checkpoint['category']) => {
    switch (category) {
      case 'safe':
        return <Shield className="w-3.5 h-3.5 text-white" />;
      case 'hazard':
        return <AlertTriangle className="w-3.5 h-3.5 text-white" />;
      case 'parking':
        return <Car className="w-3.5 h-3.5 text-white" />;
      case 'meeting':
        return <Users className="w-3.5 h-3.5 text-white" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-white" />;
    }
  };

  const getCheckpointBadgeColor = (category: Checkpoint['category']) => {
    switch (category) {
      case 'safe':
        return 'bg-emerald-600 border-emerald-400 shadow-emerald-600/50';
      case 'hazard':
        return 'bg-rose-600 border-rose-400 shadow-rose-600/50';
      case 'parking':
        return 'bg-amber-600 border-amber-400 shadow-amber-600/50';
      case 'meeting':
        return 'bg-purple-600 border-purple-400 shadow-purple-600/50';
      default:
        return 'bg-cyan-600 border-cyan-400 shadow-cyan-600/50';
    }
  };

  const currentCenter = useMemo(
    () => ({ lat: currentPoint.lat, lng: currentPoint.lng }),
    [currentPoint.lat, currentPoint.lng]
  );

  return (
    <div className="relative w-full h-full min-h-[450px] bg-slate-950 overflow-hidden select-none">
      {/* Tactical HUD Corner Reticles (Law Enforcement CAD UI) */}
      <div className="absolute top-2 left-2 z-20 pointer-events-none flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-400 backdrop-blur-md rounded shadow-md">
          <div className="w-1.5 h-1.5 bg-emerald-400 animate-ping rounded-full" />
          <span className="font-bold tracking-widest uppercase">FIA-NCCA CELLULAR SECTOR SCAN</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">GRID: 38T-KL94</span>
        </div>
      </div>

      {/* Top Right Tactical Coordinate Stamp */}
      <div className="absolute top-2 right-24 z-20 pointer-events-none hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-300 backdrop-blur-md rounded shadow-md">
        <span className="text-amber-400 font-bold">LAT: {currentPoint.lat.toFixed(5)}</span>
        <span className="text-slate-600">/</span>
        <span className="text-amber-400 font-bold">LNG: {currentPoint.lng.toFixed(5)}</span>
        <span className="text-slate-600">/</span>
        <span className="text-emerald-400 font-bold">ALT: {Math.round(currentPoint.altitude ?? 15)}m</span>
      </div>

      {/* Floating Proximity Alert on Map (When Reaching Near Target) */}
      {isNearTarget && selectedTarget && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/95 border-2 border-emerald-400 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-black text-emerald-300 uppercase tracking-tight">
              NEAR TARGET: {selectedTarget.name} ({selectedTarget.phoneNumber}) • {Math.round(targetDistance!)}m
            </span>
          </div>

          <button
            onClick={() => {
              if (onSaveTargetLocation) {
                onSaveTargetLocation(selectedTarget);
                setJustSavedTargetId(selectedTarget.id);
                setTimeout(() => setJustSavedTargetId(null), 3000);
              }
            }}
            disabled={justSavedTargetId === selectedTarget.id}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 shadow-md transition-all ${
              justSavedTargetId === selectedTarget.id
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-105 active:scale-95'
            }`}
          >
            {justSavedTargetId === selectedTarget.id ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>SAVED!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>SAVE LOCATION</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tactical HUD Corner Brackets */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-500/60 pointer-events-none z-10" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none z-10" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-500/60 pointer-events-none z-10" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none z-10" />

      {/* Optional Crosshair Radar Overlay */}
      {showGridOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at center, transparent 0, transparent 400px, rgba(6, 182, 212, 0.08) 401px), linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 60px 60px, 60px 60px',
          }}
        />
      )}

      <Map
        id="main-map"
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={currentCenter}
        defaultZoom={16}
        mapTypeId={mapTheme}
        disableDefaultUI={true}
        gestureHandling="greedy"
        onDragstart={handleDragStart}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Polyline, Geofence Circle, Accuracy, Target Triangulation Circles, Anchor Circle, 500-Yard Circle, and Traffic Layers */}
        <MapLayers
          points={points}
          geofence={geofence}
          currentPoint={currentPoint}
          showTraffic={showTraffic}
          isBreached={isGeofenceBreached}
          targets={targets}
          selectedTargetId={selectedTargetId}
          movementAnchor={movementAnchor}
          isMovementDetected={isMovementDetected}
          yard500Circle={yard500Circle}
        />

        {/* Main Location Anchor Sentry Marker */}
        {movementAnchor && (
          <AdvancedMarker
            position={movementAnchor}
            title={`MAIN LOCATION ANCHOR (32.280556, 71.442707) - Hafiz Wala Chak 7 ML`}
            zIndex={250}
          >
            <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer group">
              <div
                className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 ${
                  isMovementDetected
                    ? 'bg-rose-950 border-rose-400 text-rose-300 shadow-rose-500/60 animate-bounce'
                    : 'bg-slate-950 border-cyan-400 text-cyan-300 shadow-cyan-500/50'
                }`}
              >
                <Anchor className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="w-1 h-2 bg-slate-800" />
              <div className="px-2 py-0.5 mt-0.5 rounded bg-slate-950/95 text-[10px] text-cyan-300 font-mono font-bold border border-cyan-500/40 shadow-xl backdrop-blur-sm whitespace-nowrap">
                MAIN LOCATION (32.280556, 71.442707)
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Live Patrol Unit / Investigator Advanced Marker */}
        <AdvancedMarker
          position={{ lat: currentPoint.lat, lng: currentPoint.lng }}
          title={`Patrol / Intercept Unit (${currentPoint.lat.toFixed(5)}, ${currentPoint.lng.toFixed(5)})`}
          zIndex={999}
        >
          <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            {/* Outer radar pulse rings */}
            <div className="absolute w-16 h-16 rounded-full bg-cyan-500/20 animate-pulse-ring pointer-events-none" />
            <div className="absolute w-11 h-11 rounded-full bg-cyan-400/30 animate-ping opacity-60 pointer-events-none" />

            {/* Tactical Compass Directional Indicator */}
            <div
              className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-slate-900 to-cyan-950 border-2 border-cyan-400 shadow-xl shadow-cyan-500/50 flex items-center justify-center transition-transform duration-300"
              style={{
                transform: `rotate(${currentPoint.heading ?? 0}deg)`,
              }}
            >
              <Navigation2 className="w-5 h-5 text-cyan-300 fill-cyan-400 drop-shadow-md" />
            </div>

            {/* Tactical Central Dot */}
            <div className="absolute w-3 h-3 rounded-full bg-white border border-cyan-900" />
          </div>
        </AdvancedMarker>

        {/* Tracked Target Markers with Corners Tag, Number, Name & IMEI */}
        {targets.map((target) => {
          const isSelected = selectedTargetId === target.id;
          return (
            <AdvancedMarker
              key={target.id}
              position={{ lat: target.lat, lng: target.lng }}
              title={`TARGET RECORD: ${target.name} | PHONE: ${target.phoneNumber} | IMEI: ${target.imei} | RADIUS: ${target.uncertaintyRadiusMeters}m`}
              zIndex={isSelected ? 600 : 300}
              onClick={() => {
                onSelectTarget?.(target);
                if (map) {
                  map.panTo({ lat: target.lat, lng: target.lng });
                  setAutoCenter(false);
                }
              }}
            >
              <div
                className={`relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 ${
                  isSelected ? 'scale-110 z-50' : 'hover:scale-105'
                }`}
              >
                {/* Tactical Radar Pulsing Ring */}
                <div
                  className={`absolute -inset-4 rounded-full opacity-70 animate-ping pointer-events-none ${
                    isSelected ? 'bg-amber-400' : 'bg-cyan-500'
                  }`}
                />

                {/* Professional Police / FIA Tactical Reticle Box with Corner Brackets */}
                <div className="relative">
                  {/* Four Corner Marks around Target Icon */}
                  <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400" />
                  <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />

                  {/* Center Target Badge */}
                  <div
                    className={`w-11 h-11 rounded-lg border-2 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md ${
                      isSelected
                        ? 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-amber-500/50'
                        : 'bg-slate-950/95 border-cyan-400 text-cyan-200 shadow-cyan-500/40'
                    }`}
                  >
                    <Crosshair className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                </div>

                {/* Tactical Law Enforcement Evidence Card Banner */}
                <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-slate-950/95 border-2 border-amber-500/80 shadow-2xl backdrop-blur-xl flex flex-col items-start gap-0.5 whitespace-nowrap min-w-[170px]">
                  {/* Name and 200m Radius Badge */}
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      {target.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-mono text-[9px] font-extrabold">
                      ±{target.uncertaintyRadiusMeters}m CEP
                    </span>
                  </div>

                  {/* Corner Marks & Phone Number */}
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-white">
                    <span className="text-amber-500">TEL:</span>
                    <span className="text-cyan-300 font-mono tracking-tight">{target.phoneNumber}</span>
                  </div>

                  {/* Mobile IMEI Number Display */}
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-slate-900/90 px-1.5 py-0.5 rounded w-full border border-slate-800">
                    <span className="text-rose-400 font-extrabold">IMEI:</span>
                    <span className="text-slate-100 font-mono tracking-wider font-semibold">
                      {target.imei}
                    </span>
                  </div>

                  {/* Sector / Cell BTS Details */}
                  <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between w-full pt-0.5 border-t border-slate-800/80">
                    <span>SIG: {target.signalDbm}dBm</span>
                    <span className="text-emerald-400 font-semibold">{target.carrier.split('/')[0]}</span>
                  </div>
                </div>
              </div>
            </AdvancedMarker>
          );
        })}

        {/* Geofence Center Pin */}
        {geofence.enabled && geofence.center && (
          <AdvancedMarker
            position={geofence.center}
            title={`Geofence Tactical Perimeter: ${geofence.label} (Radius: ${geofence.radiusMeters}m)`}
            zIndex={200}
          >
            <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer group">
              <div
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                  isGeofenceBreached
                    ? 'bg-rose-700 border-rose-300 shadow-rose-600/50'
                    : 'bg-emerald-700 border-emerald-300 shadow-emerald-600/50'
                }`}
              >
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="w-1 h-2 bg-slate-800" />
              <div className="px-2 py-0.5 mt-0.5 rounded bg-slate-950/90 text-[10px] text-emerald-300 font-mono font-bold border border-emerald-500/40 shadow-md backdrop-blur-sm whitespace-nowrap">
                PERIMETER: {geofence.label} ({geofence.radiusMeters}m)
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Tactical Checkpoint Markers */}
        {checkpoints.map((cp) => {
          const isSelected = selectedCheckpointId === cp.id;
          return (
            <AdvancedMarker
              key={cp.id}
              position={{ lat: cp.lat, lng: cp.lng }}
              title={`TAC-PIN: ${cp.title} (${cp.category})`}
              zIndex={isSelected ? 300 : 150}
              onClick={() => onSelectCheckpoint?.(isSelected ? null : cp.id)}
            >
              <div
                className={`relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer transition-transform duration-200 ${
                  isSelected ? 'scale-125 z-50' : 'hover:scale-110'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shadow-md ${getCheckpointBadgeColor(
                    cp.category
                  )}`}
                >
                  {getCheckpointIcon(cp.category)}
                </div>
                <div className="w-0.5 h-2 bg-slate-700" />
                <div className="px-2 py-0.5 rounded bg-slate-950/95 text-[10px] text-slate-100 font-mono font-semibold border border-slate-700 shadow-md backdrop-blur-sm whitespace-nowrap max-w-[130px] truncate">
                  {cp.title}
                </div>
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>

      {/* Map Floating HUD Overlay Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        {/* Recenter / Lock Crosshair Button */}
        <button
          onClick={handleRecenter}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold shadow-lg backdrop-blur-md transition-all ${
            autoCenter
              ? 'bg-cyan-600 text-slate-950 shadow-cyan-500/40 ring-2 ring-cyan-300'
              : 'bg-slate-950/90 text-cyan-400 hover:bg-slate-900 border border-cyan-500/40'
          }`}
          title="Lock camera on live coordinates"
        >
          <Crosshair className={`w-4 h-4 ${autoCenter ? 'animate-spin' : ''}`} />
          <span>{autoCenter ? 'AUTO-LOCKED' : 'TRACK LOCK'}</span>
        </button>

        {/* Map Layers Menu Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            className="w-10 h-10 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-200 shadow-lg backdrop-blur-md flex items-center justify-center transition-colors"
            title="Tactical Map Layers & Overlays"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
          </button>

          {showLayersMenu && (
            <div className="absolute right-0 top-12 w-52 p-2.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl flex flex-col gap-1 z-30 animate-in fade-in zoom-in-95 font-mono">
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2 py-1 flex items-center justify-between">
                <span>TACTICAL MAP THEME</span>
              </div>
              {(['hybrid', 'satellite', 'roadmap', 'terrain'] as MapTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    setMapTheme(theme);
                    setShowLayersMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs capitalize font-medium transition-colors ${
                    mapTheme === theme
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {theme} {theme === 'hybrid' ? '(Tactical HQ)' : ''}
                </button>
              ))}

              <div className="h-px bg-slate-800 my-1.5" />

              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2 py-1">
                RADAR & TRAFFIC
              </div>
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  showTraffic
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>Live Traffic Overlay</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">
                  {showTraffic ? 'ACTIVE' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => setShowGridOverlay(!showGridOverlay)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  showGridOverlay
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>Tactical Reticle Grid</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">
                  {showGridOverlay ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800 shadow-lg backdrop-blur-md">
          <button
            onClick={() => map && map.setZoom((map.getZoom() ?? 16) + 1)}
            className="w-10 h-9 flex items-center justify-center text-slate-200 hover:bg-slate-900 text-base font-bold border-b border-slate-800 transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => map && map.setZoom((map.getZoom() ?? 16) - 1)}
            className="w-10 h-9 flex items-center justify-center text-slate-200 hover:bg-slate-900 text-base font-bold transition-colors"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>

      {/* Bottom Status bar overlay */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-slate-950/95 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md flex items-center gap-2.5 shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-white font-bold">
            LAT: {currentPoint.lat.toFixed(5)} | LNG: {currentPoint.lng.toFixed(5)}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-bold uppercase">
            TARGETS ACTIVE: {targets.length}
          </span>
        </div>
      </div>
    </div>
  );
}
