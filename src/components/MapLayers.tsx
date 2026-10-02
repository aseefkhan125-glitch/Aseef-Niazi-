import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GeoPoint, GeofenceConfig, TargetDevice } from '../types/tracker';

interface MapLayersProps {
  points: GeoPoint[];
  geofence: GeofenceConfig;
  currentPoint: GeoPoint;
  showTraffic: boolean;
  isBreached: boolean;
  targets?: TargetDevice[];
  selectedTargetId?: string | null;
  movementAnchor?: { lat: number; lng: number } | null;
  isMovementDetected?: boolean;
}

export function MapLayers({
  points,
  geofence,
  currentPoint,
  showTraffic,
  isBreached,
  targets = [],
  selectedTargetId,
  movementAnchor,
  isMovementDetected = false,
}: MapLayersProps) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const geofenceCircleRef = useRef<google.maps.Circle | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const targetCirclesRef = useRef<Map<string, google.maps.Circle>>(new Map());
  const targetLineRef = useRef<google.maps.Polyline | null>(null);
  const anchorCircleRef = useRef<google.maps.Circle | null>(null);

  // Polyline for user's breadcrumb trail
  useEffect(() => {
    if (!map) return;

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        map,
        strokeColor: '#2563eb', // Blue-600
        strokeOpacity: 0.9,
        strokeWeight: 5,
        geodesic: true,
      });
    }

    const path = points.map((p) => ({ lat: p.lat, lng: p.lng }));
    polylineRef.current.setPath(path);
  }, [map, points]);

  // Geofence Circle
  useEffect(() => {
    if (!map) return;

    if (!geofence.enabled || !geofence.center) {
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.setMap(null);
        geofenceCircleRef.current = null;
      }
      return;
    }

    const strokeColor = isBreached ? '#ef4444' : '#10b981'; // Red when breached, Emerald when safe
    const fillColor = isBreached ? '#ef4444' : '#10b981';

    if (!geofenceCircleRef.current) {
      geofenceCircleRef.current = new google.maps.Circle({
        map,
        center: geofence.center,
        radius: geofence.radiusMeters,
        strokeColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor,
        fillOpacity: 0.12,
        clickable: false,
      });
    } else {
      geofenceCircleRef.current.setCenter(geofence.center);
      geofenceCircleRef.current.setRadius(geofence.radiusMeters);
      geofenceCircleRef.current.setOptions({
        strokeColor,
        fillColor,
      });
    }

    return () => {
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.setMap(null);
        geofenceCircleRef.current = null;
      }
    };
  }, [map, geofence, isBreached]);

  // Target Uncertainty / Triangulation Circles (e.g. Amber Gull's 200m radius circle)
  useEffect(() => {
    if (!map) return;

    const existingMap = targetCirclesRef.current;
    const currentTargetIds = new Set(targets.map((t) => t.id));

    // Remove any circles for targets no longer present
    existingMap.forEach((circle, id) => {
      if (!currentTargetIds.has(id)) {
        circle.setMap(null);
        existingMap.delete(id);
      }
    });

    // Create or update circle for each target
    targets.forEach((target) => {
      const isSelected = selectedTargetId === target.id;
      const strokeColor = isSelected ? '#a855f7' : '#06b6d4'; // Purple when selected, Cyan otherwise
      const fillColor = isSelected ? '#c084fc' : '#22d3ee';

      let circle = existingMap.get(target.id);
      if (!circle) {
        circle = new google.maps.Circle({
          map,
          center: { lat: target.lat, lng: target.lng },
          radius: target.uncertaintyRadiusMeters, // exactly 200m for Amber Gull
          strokeColor,
          strokeOpacity: 0.85,
          strokeWeight: isSelected ? 3 : 2,
          fillColor,
          fillOpacity: isSelected ? 0.22 : 0.14,
          clickable: true,
        });
        existingMap.set(target.id, circle);
      } else {
        circle.setCenter({ lat: target.lat, lng: target.lng });
        circle.setRadius(target.uncertaintyRadiusMeters);
        circle.setOptions({
          strokeColor,
          strokeWeight: isSelected ? 3 : 2,
          fillColor,
          fillOpacity: isSelected ? 0.22 : 0.14,
        });
      }
    });

    return () => {
      // Keep circles on map during updates
    };
  }, [map, targets, selectedTargetId]);

  // Connection line between user and selected target
  useEffect(() => {
    if (!map) return;

    const selectedTarget = targets.find((t) => t.id === selectedTargetId);
    if (!selectedTarget || !currentPoint) {
      if (targetLineRef.current) {
        targetLineRef.current.setMap(null);
        targetLineRef.current = null;
      }
      return;
    }

    if (!targetLineRef.current) {
      targetLineRef.current = new google.maps.Polyline({
        map,
        strokeColor: '#f59e0b', // Amber-500 tactical follow line
        strokeOpacity: 0.9,
        strokeWeight: 3,
        geodesic: true,
      });
    }

    targetLineRef.current.setPath([
      { lat: currentPoint.lat, lng: currentPoint.lng },
      { lat: selectedTarget.lat, lng: selectedTarget.lng },
    ]);

    return () => {
      if (targetLineRef.current) {
        targetLineRef.current.setMap(null);
        targetLineRef.current = null;
      }
    };
  }, [map, targets, selectedTargetId, currentPoint]);

  // Accuracy Circle around user's live GPS
  useEffect(() => {
    if (!map || !currentPoint) return;

    const accuracy = currentPoint.accuracy ?? 15;

    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = new google.maps.Circle({
        map,
        center: { lat: currentPoint.lat, lng: currentPoint.lng },
        radius: accuracy,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.35,
        strokeWeight: 1,
        fillColor: '#60a5fa',
        fillOpacity: 0.1,
        clickable: false,
      });
    } else {
      accuracyCircleRef.current.setCenter({ lat: currentPoint.lat, lng: currentPoint.lng });
      accuracyCircleRef.current.setRadius(accuracy);
    }

    return () => {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setMap(null);
        accuracyCircleRef.current = null;
      }
    };
  }, [map, currentPoint]);

  // Main Location Movement Anchor Sentry Circle (32.280556, 71.442707)
  useEffect(() => {
    if (!map) return;

    if (!movementAnchor) {
      if (anchorCircleRef.current) {
        anchorCircleRef.current.setMap(null);
        anchorCircleRef.current = null;
      }
      return;
    }

    const strokeColor = isMovementDetected ? '#f43f5e' : '#06b6d4'; // Red if movement detected, Cyan if stationary
    const fillColor = isMovementDetected ? '#f43f5e' : '#06b6d4';

    if (!anchorCircleRef.current) {
      anchorCircleRef.current = new google.maps.Circle({
        map,
        center: movementAnchor,
        radius: 30, // 30m stationary anchor perimeter
        strokeColor,
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor,
        fillOpacity: isMovementDetected ? 0.3 : 0.15,
        clickable: false,
      });
    } else {
      anchorCircleRef.current.setCenter(movementAnchor);
      anchorCircleRef.current.setOptions({
        strokeColor,
        fillColor,
        fillOpacity: isMovementDetected ? 0.3 : 0.15,
      });
    }

    return () => {
      if (anchorCircleRef.current) {
        anchorCircleRef.current.setMap(null);
        anchorCircleRef.current = null;
      }
    };
  }, [map, movementAnchor, isMovementDetected]);

  // Real-time Traffic Layer
  useEffect(() => {
    if (!map) return;

    if (showTraffic) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
    } else {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, showTraffic]);

  return null;
}
