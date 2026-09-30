import { useState, useEffect, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useLocationTracker } from './hooks/useLocationTracker';
import { MapContainer } from './components/MapContainer';
import { SpeedometerCompass } from './components/SpeedometerCompass';
import { GeofenceManager } from './components/GeofenceManager';
import { TrackingControls } from './components/TrackingControls';
import { CheckpointsManager } from './components/CheckpointsManager';
import { TargetLocator } from './components/TargetLocator';
import { ProximityFollowHud } from './components/ProximityFollowHud';
import { MovementSentryAlert } from './components/MovementSentryAlert';
import { CustomerSupervisorCard } from './components/CustomerSupervisorCard';
import { AdminYard500Control } from './components/AdminYard500Control';
import { AdminVoiceBroadcastPanel } from './components/AdminVoiceBroadcastPanel';
import { LoginModal } from './components/LoginModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { TripAnalyticsModal } from './components/TripAnalyticsModal';
import { TopNav } from './components/TopNav';
import { ShieldAlert, AlertOctagon, X, Crosshair, Smartphone, Gauge, Shield, MapPin, CircleDot, Volume2, LogIn } from 'lucide-react';
import { soundFx, formatDistance, calculateDistance, formatYards } from './utils/geoUtils';
import { speakAnnouncement } from './utils/speechUtils';
import { INITIAL_TRACKED_TARGETS } from './data/trackedTargets';
import { DEFAULT_ADMIN_SUPERVISORS } from './data/adminSupervisors';
import { TargetDevice, UserRole, AdminSupervisor, Yard500CircleConfig } from './types/tracker';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyD_dRNGinm25Peet_ae-R9t7R-H8YHPICA';

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [autoCenter, setAutoCenter] = useState<boolean>(false); // Start false so Amber Gull is immediately viewed
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'targets' | 'telemetry' | 'geofence' | 'checkpoints'>('targets');
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [isFollowCameraActive, setIsFollowCameraActive] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>('admin'); // 'admin' (Controller) vs 'customer' (Subject View)
  const [activeSupervisor, setActiveSupervisor] = useState<AdminSupervisor>(DEFAULT_ADMIN_SUPERVISORS[0]);

  // 500-Yard Circle Configuration (457.2 meters)
  const [yard500Config, setYard500Config] = useState<Yard500CircleConfig>({
    enabled: true,
    radiusYards: 500,
    radiusMeters: 457.2,
    center: { lat: 32.280556, lng: 71.442707 }, // Main location: Hafiz Wala Chak 7 ML
    targetPhoneNumber: '03019721327',
    targetName: 'Amber Gull',
    isBreached: false,
    lastDisplacementYards: 0,
    lastAlertTimestamp: null,
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [lastBroadcastMessage, setLastBroadcastMessage] = useState<string | null>(
    'Location changed at 30 yard circle North'
  );
  const [loggedInUsername, setLoggedInUsername] = useState<string>('Aumber Gull (03019721327)');

  // Targets state (including Amber Gull with 200m circle & IMEI)
  const [targets, setTargets] = useState<TargetDevice[]>(INITIAL_TRACKED_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>('target-amber-gull');

  // Hook for real-time tracking, simulation, geofencing, checkpoints, and analytics
  const {
    currentPoint,
    points,
    isTracking,
    isPaused,
    togglePause,
    trackingMode,
    setTrackingMode,
    simulationSpeedMultiplier,
    setSimulationSpeedMultiplier,
    selectedSimRouteId,
    setSelectedSimRouteId,
    gpsError,
    gpsAccuracyStatus,
    tripStats,
    resetTrip,
    geofence,
    setGeofence,
    setGeofenceCenter,
    isGeofenceBreached,
    distanceToGeofenceCenter,
    checkpoints,
    addCheckpoint,
    addCheckpointAt,
    removeCheckpoint,
    movementAnchor,
    setMovementAnchor,
    movementAlertEnabled,
    setMovementAlertEnabled,
    movementThresholdMeters,
    setMovementThresholdMeters,
    isMovementDetected,
    movementDisplacement,
    resetMovementAnchor,
    dismissMovementAlarm,
  } = useLocationTracker();

  // Tier 1 Google Maps Platform Quota Exceeded listener
  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  // Evaluate 500-Yard Circle (457.2m) when position updates
  useEffect(() => {
    if (!yard500Config.enabled || !currentPoint) return;

    const distMeters = calculateDistance(
      currentPoint.lat,
      currentPoint.lng,
      yard500Config.center.lat,
      yard500Config.center.lng
    );
    const distYards = Math.round(distMeters / 0.9144);
    const breached = distYards > 500;

    if (breached && !yard500Config.isBreached) {
      soundFx.playGeofenceWarning();
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🚨 500 YARD MOVEMENT NOTIFICATION!', {
            body: `Phone 03019721327 (Amber Gull) location changed by ${distYards} yards (exceeded 500-yard circle)!`,
          });
        } catch {
          // fallback
        }
      }
    }

    setYard500Config((prev) => ({
      ...prev,
      isBreached: breached,
      lastDisplacementYards: distYards,
      lastAlertTimestamp: breached ? Date.now() : prev.lastAlertTimestamp,
    }));
  }, [currentPoint, yard500Config.enabled, yard500Config.center.lat, yard500Config.center.lng]);

  const handleTest500YardNotification = useCallback(() => {
    soundFx.playGeofenceWarning();
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🚨 500 YARD MOVEMENT NOTIFICATION TEST', {
          body: `Supervising Admin ${activeSupervisor.name} tested 500-yard circle notification for Amber Gull (03019721327).`,
        });
      } catch {
        // fallback
      }
    }
  }, [activeSupervisor.name]);

  const handleRecenter500YardCircle = useCallback(() => {
    if (currentPoint) {
      setYard500Config((prev) => ({
        ...prev,
        center: { lat: currentPoint.lat, lng: currentPoint.lng },
        isBreached: false,
        lastDisplacementYards: 0,
      }));
      soundFx.playGeofenceWarning();
    }
  }, [currentPoint]);

  // Admin Move Location & Voice Announce: "when admin move location the notification to user is in English that location changed at 30 yard circle north"
  const handleAdminMoveTargetDirection = useCallback(
    (direction: 'North' | 'South' | 'East' | 'West', yards: number = 30, customMessage?: string) => {
      const meters = yards * 0.9144;
      const latDelta = meters / 111320;
      const baseLat = currentPoint ? currentPoint.lat : 32.280556;
      const lngDelta = meters / (111320 * Math.cos((baseLat * Math.PI) / 180));

      let dLat = 0;
      let dLng = 0;
      if (direction === 'North') dLat = latDelta;
      if (direction === 'South') dLat = -latDelta;
      if (direction === 'East') dLng = lngDelta;
      if (direction === 'West') dLng = -lngDelta;

      // Update target location for Amber Gull (03019721327)
      setTargets((prev) =>
        prev.map((t) =>
          t.phoneNumber.includes('03019721327')
            ? { ...t, lat: t.lat + dLat, lng: t.lng + dLng, lastPing: Date.now() }
            : t
        )
      );

      const msg = customMessage || `Location changed at ${yards} yard circle ${direction}`;
      setLastBroadcastMessage(msg);
      soundFx.playGeofenceWarning();
      speakAnnouncement(msg);
    },
    [currentPoint]
  );

  // Custom Admin Broadcast: "or Jo bhi admin likhy ga user ko wo hi sunai da ga"
  const handleBroadcastCustomMessage = useCallback((message: string) => {
    setLastBroadcastMessage(message);
    soundFx.playGeofenceWarning();
    speakAnnouncement(message);
  }, []);

  const handleLoginSuccess = useCallback((role: UserRole, username: string) => {
    setUserRole(role);
    setLoggedInUsername(username);
    setIsLoginModalOpen(false);
    if (role === 'customer') {
      setSelectedTargetId('target-amber-gull');
    }
    soundFx.playGeofenceWarning();
  }, []);

  // When user clicks anywhere on the map, offer to add a checkpoint or center geofence
  const handleMapClickCoord = useCallback(
    (lat: number, lng: number) => {
      const choice = window.prompt(
        `[FIA/NCCA TACTICAL GRID]\nCoordinates clicked: ${lat.toFixed(5)}, ${lng.toFixed(5)}\n\n1. Type a name to drop a Tactical Pin / Checkpoint\n2. Or leave empty and click Cancel`
      );
      if (choice && choice.trim()) {
        addCheckpointAt(lat, lng, choice.trim(), 'waypoint');
      }
    },
    [addCheckpointAt]
  );

  const handleSelectCheckpoint = (cp: { id: string; lat: number; lng: number } | null) => {
    if (!cp) {
      setSelectedCheckpointId(null);
      return;
    }
    setSelectedCheckpointId(cp.id);
  };

  const handleSelectTarget = (target: TargetDevice | null) => {
    setSelectedTargetId(target ? target.id : null);
    if (target) {
      setAutoCenter(false);
    }
  };

  const handleUpdateTargetRadius = (id: string, newRadius: number) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, uncertaintyRadiusMeters: newRadius } : t))
    );
  };

  const handleAddTarget = (newTargetData: Omit<TargetDevice, 'id' | 'lastPing'>) => {
    const newTarget: TargetDevice = {
      ...newTargetData,
      id: 'target-' + Date.now(),
      lastPing: Date.now(),
    };
    setTargets((prev) => [newTarget, ...prev]);
    setSelectedTargetId(newTarget.id);
  };

  const handleSaveTargetLocation = useCallback(
    (title: string, lat: number, lng: number, notes?: string) => {
      addCheckpointAt(lat, lng, title, 'safe');
      soundFx.playGeofenceWarning();
    },
    [addCheckpointAt]
  );

  const distanceToEdge =
    distanceToGeofenceCenter !== null ? distanceToGeofenceCenter - geofence.radiusMeters : null;

  const selectedTarget = targets.find((t) => t.id === selectedTargetId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Tier 1 Quota Defense Banner (Case A) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm font-mono">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* FIA / NCCA Law Enforcement Top Header */}
      <TopNav
        trackingMode={trackingMode}
        isTracking={isTracking}
        isPaused={isPaused}
        isGeofenceBreached={isGeofenceBreached}
        accuracy={currentPoint.accuracy}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        currentLat={currentPoint.lat}
        currentLng={currentPoint.lng}
        targets={targets}
        selectedTarget={selectedTarget}
        userRole={userRole}
        onToggleUserRole={() => setUserRole((prev) => (prev === 'admin' ? 'customer' : 'admin'))}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Voice Announcement Broadcast Banner ("or Jo bhi admin likhy ga user ko wo hi sunai da ga") */}
      {lastBroadcastMessage && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 text-white px-4 py-2 flex items-center justify-between text-xs md:text-sm font-mono font-bold shadow-xl border-b border-cyan-500/40">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span className="text-cyan-300 font-black uppercase text-[11px]">
              ADMIN VOICE DISPATCH:
            </span>
            <span className="text-white italic">
              "{lastBroadcastMessage}"
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playGeofenceWarning();
                speakAnnouncement(lastBroadcastMessage);
              }}
              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black uppercase flex items-center gap-1 transition-colors"
              title="Hear message spoken aloud in English"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>🔊 HEAR VOICE</span>
            </button>
            <button
              onClick={() => setLastBroadcastMessage(null)}
              className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 500 Yard Circle Relocation Alert Banner */}
      {yard500Config.isBreached && (
        <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-white px-4 py-2.5 flex items-center justify-between text-xs md:text-sm font-mono font-black shadow-2xl z-30 animate-pulse border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span>
              [500 YARD MOVEMENT NOTIFICATION] PHONE {yard500Config.targetPhoneNumber} ({yard500Config.targetName}) RELOCATED BY {yard500Config.lastDisplacementYards} YARDS FROM CIRCLE! SUPERVISING ADMIN: {activeSupervisor.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <button
                onClick={handleRecenter500YardCircle}
                className="px-3 py-1 rounded bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-black uppercase transition-colors"
              >
                RE-CENTER 500Y
              </button>
            )}
            <button
              onClick={() =>
                setYard500Config((prev) => ({ ...prev, isBreached: false }))
              }
              className="p-1 hover:bg-amber-950 rounded transition-colors text-slate-200"
              title="Acknowledge notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Urgent Geofence Breach Banner Alert */}
      {isGeofenceBreached && !bannerDismissed && (
        <div className="bg-rose-700 text-white px-4 py-2 flex items-center justify-between text-xs md:text-sm font-mono font-bold shadow-xl shadow-rose-950/60 z-30 animate-pulse border-b border-rose-500">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-300" />
            <span>
              [CRITICAL ALERT] SUBJECT EXITED SAFE ZONE BOUNDARY BY{' '}
              {formatDistance(Math.abs(distanceToEdge ?? 0))}!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-2.5 py-1 rounded bg-white text-rose-800 hover:bg-slate-100 text-xs font-black uppercase shadow-sm transition-colors"
            >
              DISPATCH SOS
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 hover:bg-rose-800 rounded transition-colors"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Urgent Movement Detected from Main Location Banner Alert */}
      {isMovementDetected && movementAlertEnabled && (
        <div className="bg-gradient-to-r from-rose-800 via-red-700 to-rose-800 text-white px-4 py-2.5 flex items-center justify-between text-xs md:text-sm font-mono font-black shadow-2xl shadow-rose-950/80 z-30 animate-pulse border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span>
              [MOVEMENT DETECTED] SUBJECT HAS MOVED {formatDistance(movementDisplacement)} AWAY FROM MAIN LOCATION (32.280556, 71.442707)!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetMovementAnchor(32.280556, 71.442707);
                soundFx.playGeofenceWarning();
              }}
              className="px-3 py-1 rounded bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-black uppercase transition-colors"
            >
              RESET TO MAIN
            </button>
            <button
              onClick={dismissMovementAlarm}
              className="p-1 hover:bg-rose-900 rounded transition-colors text-slate-200"
              title="Acknowledge alarm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'geometry']}>
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
          {/* Tactical Left Sidebar */}
          <aside className="w-full md:w-[420px] lg:w-[460px] bg-slate-950 border-r-2 border-cyan-500/20 flex flex-col h-1/2 md:h-full shrink-0 z-20 overflow-y-auto">
            <div className="p-3.5 space-y-3.5">
              {/* CUSTOMER TRANSPARENCY CARD (costomer will show which admin will see them) */}
              {userRole === 'customer' ? (
                <CustomerSupervisorCard
                  target={selectedTarget || targets[0]}
                  supervisor={activeSupervisor}
                  yard500Config={yard500Config}
                  lastBroadcastMessage={lastBroadcastMessage}
                  currentPoint={currentPoint}
                  onSwitchToAdmin={() => setUserRole('admin')}
                />
              ) : (
                /* ADMIN OPERATIONAL CONTROLS */
                <>
                  {/* Voice Dispatch & 30-Yard Movement Panel ("Jo bhi admin likhy ga user ko wo hi sunai da ga") */}
                  <AdminVoiceBroadcastPanel
                    target={selectedTarget || targets[0]}
                    onMoveTargetDirection={handleAdminMoveTargetDirection}
                    onBroadcastCustomMessage={handleBroadcastCustomMessage}
                    lastBroadcastMessage={lastBroadcastMessage}
                  />

                  <AdminYard500Control
                    yard500Config={yard500Config}
                    target={selectedTarget || targets[0]}
                    onToggleEnabled={() =>
                      setYard500Config((p) => ({ ...p, enabled: !p.enabled }))
                    }
                    onRecenterCircle={handleRecenter500YardCircle}
                    onTestNotification={handleTest500YardNotification}
                  />

                  {/* Main Location Movement Sentry & Alarm */}
                  <MovementSentryAlert
                    movementAnchor={movementAnchor}
                    isMovementDetected={isMovementDetected}
                    movementDisplacement={movementDisplacement}
                    movementAlertEnabled={movementAlertEnabled}
                    onToggleMovementAlert={() =>
                      setMovementAlertEnabled(!movementAlertEnabled)
                    }
                    movementThresholdMeters={movementThresholdMeters}
                    onChangeThreshold={setMovementThresholdMeters}
                    onResetAnchorToLocation={(lat, lng) => resetMovementAnchor(lat, lng)}
                    onDismissAlarm={dismissMovementAlarm}
                  />
                </>
              )}

              {/* Primary Tracking Controls */}
              <TrackingControls
                isTracking={isTracking}
                isPaused={isPaused}
                togglePause={togglePause}
                resetTrip={resetTrip}
                trackingMode={trackingMode}
                setTrackingMode={setTrackingMode}
                selectedSimRouteId={selectedSimRouteId}
                setSelectedSimRouteId={setSelectedSimRouteId}
                simMultiplier={simulationSpeedMultiplier}
                setSimMultiplier={setSimulationSpeedMultiplier}
                onOpenSos={() => setIsSosOpen(true)}
                gpsError={gpsError}
              />

              {/* Proximity & Live Follow Distance HUD */}
              {selectedTarget && (
                <ProximityFollowHud
                  currentPoint={currentPoint}
                  target={selectedTarget}
                  tripStats={tripStats}
                  geofence={geofence}
                  isGeofenceBreached={isGeofenceBreached}
                  onSaveLocation={handleSaveTargetLocation}
                  isFollowCameraActive={isFollowCameraActive}
                  onToggleFollowCamera={() => setIsFollowCameraActive(!isFollowCameraActive)}
                />
              )}

              {/* Navigation Tabs for Tactical Panels */}
              <div className="grid grid-cols-4 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono font-bold">
                <button
                  onClick={() => setActiveTab('targets')}
                  className={`py-1.5 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    activeTab === 'targets'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>TARGETS</span>
                </button>

                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`py-1.5 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    activeTab === 'telemetry'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>SPEED</span>
                </button>

                <button
                  onClick={() => setActiveTab('geofence')}
                  className={`py-1.5 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    activeTab === 'geofence'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>FENCE</span>
                  {isGeofenceBreached && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('checkpoints')}
                  className={`py-1.5 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    activeTab === 'checkpoints'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>PINS ({checkpoints.length})</span>
                </button>
              </div>

              {/* Active Tab Panel */}
              {activeTab === 'targets' && (
                <TargetLocator
                  targets={targets}
                  selectedTargetId={selectedTargetId}
                  onSelectTarget={handleSelectTarget}
                  onUpdateTargetRadius={handleUpdateTargetRadius}
                  onAddTarget={handleAddTarget}
                  currentPoint={currentPoint}
                />
              )}

              {activeTab === 'telemetry' && (
                <SpeedometerCompass
                  currentPoint={currentPoint}
                  tripStats={tripStats}
                  accuracyStatus={gpsAccuracyStatus}
                />
              )}

              {activeTab === 'geofence' && (
                <GeofenceManager
                  geofence={geofence}
                  setGeofence={setGeofence}
                  isBreached={isGeofenceBreached}
                  distanceToCenter={distanceToGeofenceCenter}
                  currentPoint={currentPoint}
                  onSetCenterToCurrent={() => setGeofenceCenter(currentPoint.lat, currentPoint.lng)}
                />
              )}

              {activeTab === 'checkpoints' && (
                <CheckpointsManager
                  checkpoints={checkpoints}
                  currentPoint={currentPoint}
                  onAddCheckpoint={addCheckpoint}
                  onRemoveCheckpoint={removeCheckpoint}
                  onSelectCheckpoint={(cp) => {
                    handleSelectCheckpoint(cp);
                    setAutoCenter(false);
                  }}
                />
              )}
            </div>
          </aside>

          {/* Interactive Google Map Area */}
          <main className="flex-1 h-1/2 md:h-full relative overflow-hidden">
            <MapContainer
              currentPoint={currentPoint}
              points={points}
              geofence={geofence}
              isGeofenceBreached={isGeofenceBreached}
              checkpoints={checkpoints}
              autoCenter={autoCenter}
              setAutoCenter={setAutoCenter}
              onMapClickCoord={handleMapClickCoord}
              selectedCheckpointId={selectedCheckpointId}
              onSelectCheckpoint={setSelectedCheckpointId}
              targets={targets}
              selectedTargetId={selectedTargetId}
              onSelectTarget={handleSelectTarget}
              isFollowCameraActive={isFollowCameraActive}
              onSaveTargetLocation={(target) =>
                handleSaveTargetLocation(
                  `Target Reached: ${target.name} (${target.phoneNumber})`,
                  target.lat,
                  target.lng,
                  `Saved at proximity. IMEI: ${target.imei}. Address: ${target.address || 'Hafiz Wala Chak 7 ML'}`
                )
              }
              movementAnchor={movementAnchor}
              isMovementDetected={isMovementDetected}
              yard500Circle={{
                enabled: yard500Config.enabled,
                center: yard500Config.center,
                isBreached: yard500Config.isBreached,
              }}
            />
          </main>
        </div>
      </APIProvider>

      {/* Urgent Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        currentPoint={currentPoint}
      />

      {/* Trip Analytics Modal */}
      <TripAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        stats={tripStats}
        points={points}
      />

      {/* Portal Login Modal (Id: AumberGull03019721327 / Password: 03001696099) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
