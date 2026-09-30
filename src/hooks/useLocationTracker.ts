import { useState, useEffect, useRef, useCallback } from 'react';
import { GeoPoint, TripStats, GeofenceConfig, Checkpoint, TrackingMode } from '../types/tracker';
import { calculateDistance, calculateBearing, soundFx } from '../utils/geoUtils';
import { PRESET_SIMULATED_ROUTES, generateLocalSimulatedPath } from '../data/simulatedRoutes';

const DEFAULT_CENTER = { lat: 32.280556, lng: 71.442707 }; // Exact Google Maps Link: Hafiz Wala, Chak 7 ML

export function useLocationTracker() {
  const [currentPoint, setCurrentPoint] = useState<GeoPoint | null>(null);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('live');
  const [simulationSpeedMultiplier, setSimulationSpeedMultiplier] = useState<number>(1);
  const [selectedSimRouteId, setSelectedSimRouteId] = useState<string>('hafiz-wala-chak7ml-patrol');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAccuracyStatus, setGpsAccuracyStatus] = useState<'high' | 'medium' | 'low' | 'unknown'>('unknown');

  // Movement from main location detection
  const [movementAnchor, setMovementAnchor] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [movementAlertEnabled, setMovementAlertEnabled] = useState<boolean>(true);
  const [movementThresholdMeters, setMovementThresholdMeters] = useState<number>(25);
  const [isMovementDetected, setIsMovementDetected] = useState<boolean>(false);
  const [movementDisplacement, setMovementDisplacement] = useState<number>(0);

  // Geofence configuration (2 kilometers radius)
  const [geofence, setGeofence] = useState<GeofenceConfig>({
    enabled: true,
    center: DEFAULT_CENTER, // Exact Google Maps link location
    radiusMeters: 2000, // 2 kilometers (2000m)
    label: '2 KM Perimeter (Hafiz Wala)',
    alertOnExit: true,
  });
  const [isGeofenceBreached, setIsGeofenceBreached] = useState<boolean>(false);
  const [distanceToGeofenceCenter, setDistanceToGeofenceCenter] = useState<number | null>(null);

  // Checkpoints
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);

  // Trip statistics
  const [tripStats, setTripStats] = useState<TripStats>({
    distanceMeters: 0,
    elapsedTimeMs: 0,
    avgSpeedKmh: 0,
    maxSpeedKmh: 0,
    currentSpeedKmh: 0,
    pointCount: 0,
    elevationGainMeters: 0,
  });

  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedPauseDurationRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);
  const prevPointRef = useRef<GeoPoint | null>(null);
  const simStepRef = useRef<number>(0);
  const wasBreachedRef = useRef<boolean>(false);
  const wasMovementAlarmTriggeredRef = useRef<boolean>(false);

  // Calculate geofence status
  const evaluateGeofence = useCallback((point: GeoPoint, fence: GeofenceConfig) => {
    if (!fence.enabled || !fence.center) {
      setIsGeofenceBreached(false);
      setDistanceToGeofenceCenter(null);
      return;
    }

    const dist = calculateDistance(point.lat, point.lng, fence.center.lat, fence.center.lng);
    setDistanceToGeofenceCenter(dist);

    const isOutside = dist > fence.radiusMeters;
    const breached = fence.alertOnExit ? isOutside : !isOutside;

    if (breached && !wasBreachedRef.current) {
      soundFx.playGeofenceWarning();
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🚨 2KM PERIMETER BREACH!', {
            body: `Subject/Unit has crossed outside the 2 kilometer perimeter circle around Hafiz Wala Chak 7 ML (${Math.round(dist)}m from center).`,
          });
        } catch {
          // notification fallback
        }
      }
    }
    wasBreachedRef.current = breached;
    setIsGeofenceBreached(breached);
  }, []);

  // Update position and update stats
  const ingestPoint = useCallback((newPoint: GeoPoint) => {
    setCurrentPoint(newPoint);

    // Auto-initialize geofence center to initial position if empty
    setGeofence((prev) => {
      if (!prev.center) {
        return { ...prev, center: { lat: newPoint.lat, lng: newPoint.lng } };
      }
      return prev;
    });

    // Sentry Movement Detection from main location anchor (32.280556, 71.442707)
    if (movementAlertEnabled && movementAnchor) {
      const distFromAnchor = calculateDistance(
        newPoint.lat,
        newPoint.lng,
        movementAnchor.lat,
        movementAnchor.lng
      );
      setMovementDisplacement(distFromAnchor);

      if (distFromAnchor > movementThresholdMeters) {
        if (!wasMovementAlarmTriggeredRef.current) {
          wasMovementAlarmTriggeredRef.current = true;
          setIsMovementDetected(true);
          soundFx.playGeofenceWarning();
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('🚨 MOVEMENT DETECTED FROM MAIN LOCATION!', {
                body: `Movement detected from Hafiz Wala anchor! Target displaced ${Math.round(distFromAnchor)}m away from (32.280556, 71.442707).`,
              });
            } catch {
              // notification fallback
            }
          }
        }
      } else {
        wasMovementAlarmTriggeredRef.current = false;
        setIsMovementDetected(false);
      }
    }

    setPoints((prevPoints) => {
      const prev = prevPointRef.current;
      let newDist = 0;
      let elevGain = 0;

      if (prev) {
        newDist = calculateDistance(prev.lat, prev.lng, newPoint.lat, newPoint.lng);
        if (newPoint.altitude && prev.altitude && newPoint.altitude > prev.altitude) {
          elevGain = newPoint.altitude - prev.altitude;
        }
      }

      const updated = [...prevPoints, newPoint];
      prevPointRef.current = newPoint;

      // Update Trip Stats
      setTripStats((prevStats) => {
        const totalDist = prevStats.distanceMeters + newDist;
        const speedKmh = (newPoint.speed ?? 0) * 3.6;
        const maxSpeed = Math.max(prevStats.maxSpeedKmh, speedKmh);
        const pointCount = updated.length;
        const totalDuration = Math.max(1, Date.now() - startTimeRef.current - elapsedPauseDurationRef.current);
        const durationHours = totalDuration / 3600000;
        const avgSpeed = durationHours > 0 ? (totalDist / 1000) / durationHours : 0;

        return {
          distanceMeters: totalDist,
          elapsedTimeMs: totalDuration,
          avgSpeedKmh: avgSpeed,
          maxSpeedKmh: maxSpeed,
          currentSpeedKmh: speedKmh,
          pointCount,
          elevationGainMeters: prevStats.elevationGainMeters + elevGain,
        };
      });

      return updated;
    });

    evaluateGeofence(newPoint, geofence);
  }, [evaluateGeofence, geofence]);

  // LIVE GPS Tracking via Navigator Geolocation
  useEffect(() => {
    if (trackingMode !== 'live' || !isTracking || isPaused) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser environment.');
      return;
    }

    setGpsError(null);

    const onPosition = (pos: GeolocationPosition) => {
      const { latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed } = pos.coords;

      // Determine GPS accuracy status
      if (accuracy < 15) {
        setGpsAccuracyStatus('high');
      } else if (accuracy < 45) {
        setGpsAccuracyStatus('medium');
      } else {
        setGpsAccuracyStatus('low');
      }

      // Calculate bearing if browser heading is not provided
      let computedHeading = heading;
      if ((computedHeading === null || isNaN(computedHeading)) && prevPointRef.current) {
        const dist = calculateDistance(prevPointRef.current.lat, prevPointRef.current.lng, latitude, longitude);
        if (dist > 2) {
          computedHeading = calculateBearing(prevPointRef.current.lat, prevPointRef.current.lng, latitude, longitude);
        }
      }

      // Calculate speed if browser speed is null
      let computedSpeed = speed;
      if ((computedSpeed === null || isNaN(computedSpeed)) && prevPointRef.current) {
        const timeDiffSec = (pos.timestamp - prevPointRef.current.timestamp) / 1000;
        if (timeDiffSec > 0.5) {
          const dist = calculateDistance(prevPointRef.current.lat, prevPointRef.current.lng, latitude, longitude);
          computedSpeed = dist / timeDiffSec;
        }
      }

      ingestPoint({
        lat: latitude,
        lng: longitude,
        altitude,
        accuracy,
        speed: computedSpeed,
        heading: computedHeading,
        timestamp: pos.timestamp || Date.now(),
      });
    };

    const onError = (err: GeolocationPositionError) => {
      let msg = 'Unable to acquire GPS position.';
      if (err.code === err.PERMISSION_DENIED) {
        msg = 'Location permission denied. Please allow location access or switch to Simulation Mode.';
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        msg = 'GPS signal unavailable. You can use Simulation Mode to test live tracking.';
      } else if (err.code === err.TIMEOUT) {
        msg = 'GPS request timed out. Retrying high-accuracy signal...';
      }
      setGpsError(msg);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [trackingMode, isTracking, isPaused, ingestPoint]);

  // SIMULATED Tracking Runner
  useEffect(() => {
    if (trackingMode !== 'simulated' || !isTracking || isPaused) return;

    let routePoints = PRESET_SIMULATED_ROUTES.find((r) => r.id === selectedSimRouteId)?.points;
    if (!routePoints || routePoints.length === 0) {
      const center = currentPoint || DEFAULT_CENTER;
      routePoints = generateLocalSimulatedPath(center.lat, center.lng);
    }

    const intervalTime = Math.max(400, Math.floor(2000 / simulationSpeedMultiplier));

    const timer = setInterval(() => {
      simStepRef.current = (simStepRef.current + 1) % routePoints.length;
      const target = routePoints[simStepRef.current];
      const prev = prevPointRef.current || target;

      const heading = calculateBearing(prev.lat, prev.lng, target.lat, target.lng);

      ingestPoint({
        lat: target.lat,
        lng: target.lng,
        altitude: target.altitude,
        accuracy: 4,
        speed: (target.speedKmh * 1000) / 3600, // convert km/h to m/s
        heading,
        timestamp: Date.now(),
      });
      setGpsAccuracyStatus('high');
      setGpsError(null);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [trackingMode, isTracking, isPaused, selectedSimRouteId, simulationSpeedMultiplier, currentPoint, ingestPoint]);

  // Handle Pause / Resume timer bookkeeping
  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      if (!prev) {
        // Pausing
        pauseStartRef.current = Date.now();
        return true;
      } else {
        // Resuming
        if (pauseStartRef.current) {
          elapsedPauseDurationRef.current += Date.now() - pauseStartRef.current;
          pauseStartRef.current = null;
        }
        return false;
      }
    });
  }, []);

  // Clear / Reset Trip
  const resetTrip = useCallback(() => {
    setPoints([]);
    prevPointRef.current = null;
    startTimeRef.current = Date.now();
    elapsedPauseDurationRef.current = 0;
    pauseStartRef.current = null;
    simStepRef.current = 0;
    setTripStats({
      distanceMeters: 0,
      elapsedTimeMs: 0,
      avgSpeedKmh: 0,
      maxSpeedKmh: 0,
      currentSpeedKmh: 0,
      pointCount: 0,
      elevationGainMeters: 0,
    });
  }, []);

  // Add Checkpoint
  const addCheckpoint = useCallback((title: string, category: Checkpoint['category'] = 'waypoint', notes?: string) => {
    if (!currentPoint) return;
    const newCp: Checkpoint = {
      id: 'cp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      lat: currentPoint.lat,
      lng: currentPoint.lng,
      title,
      category,
      notes,
      timestamp: Date.now(),
    };
    setCheckpoints((prev) => [newCp, ...prev]);
  }, [currentPoint]);

  // Add Checkpoint at specific coordinates
  const addCheckpointAt = useCallback((lat: number, lng: number, title: string, category: Checkpoint['category'] = 'waypoint') => {
    const newCp: Checkpoint = {
      id: 'cp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      lat,
      lng,
      title,
      category,
      timestamp: Date.now(),
    };
    setCheckpoints((prev) => [newCp, ...prev]);
  }, []);

  const removeCheckpoint = useCallback((id: string) => {
    setCheckpoints((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Set Geofence Center to Current Location or Specific Location
  const setGeofenceCenter = useCallback((lat: number, lng: number) => {
    setGeofence((prev) => {
      const updated = { ...prev, center: { lat, lng } };
      if (currentPoint) {
        evaluateGeofence(currentPoint, updated);
      }
      return updated;
    });
  }, [currentPoint, evaluateGeofence]);

  return {
    currentPoint: currentPoint || { ...DEFAULT_CENTER, timestamp: Date.now() },
    hasAcquiredPosition: !!currentPoint,
    points,
    isTracking,
    setIsTracking,
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
    // Movement Sentry Alarm from main location
    movementAnchor,
    setMovementAnchor,
    movementAlertEnabled,
    setMovementAlertEnabled,
    movementThresholdMeters,
    setMovementThresholdMeters,
    isMovementDetected,
    movementDisplacement,
    resetMovementAnchor: (lat?: number, lng?: number) => {
      const targetPoint = lat && lng ? { lat, lng } : (currentPoint || DEFAULT_CENTER);
      setMovementAnchor(targetPoint);
      setIsMovementDetected(false);
      wasMovementAlarmTriggeredRef.current = false;
    },
    dismissMovementAlarm: () => {
      setIsMovementDetected(false);
    },
  };
}
