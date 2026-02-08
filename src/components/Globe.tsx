import { useEffect, useRef } from 'react';
import {
  Viewer,
  Ion,
  Cartesian3,
  Color,
  createWorldTerrainAsync,
  CallbackProperty,
  PolylineGlowMaterialProperty,
  ColorMaterialProperty,
} from 'cesium';
import type { ActiveRoute } from '../types/Shipment';

interface GlobeProps {
  activeRoute: ActiveRoute | null;
}

export function Globe({ activeRoute }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const routeIdRef = useRef<string | null>(null);

  // Initialize viewer once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      const terrainProvider = await createWorldTerrainAsync();
      if (cancelled) return;

      const viewer = new Viewer(container, {
        terrainProvider,
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement('div'),
      });

      viewerRef.current = viewer;

      const { scene } = viewer;
      if (scene.skyAtmosphere) {
        scene.skyAtmosphere.brightnessShift = -0.4;
      }
      scene.fog.enabled = true;
      scene.fog.density = 0.0002;
      scene.globe.enableLighting = true;
      scene.backgroundColor = Color.BLACK;

      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(0, 20, 22_000_000),
      });

      viewer.resize();

      resizeObserver = new ResizeObserver(() => {
        viewer.resize();
      });
      resizeObserver.observe(container);
    })();

    return () => {
      cancelled = true;
      if (resizeObserver) resizeObserver.disconnect();
      if (viewerRef.current) viewerRef.current.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Render active route when it changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Clear previous route entities
    if (routeIdRef.current) {
      const prefix = routeIdRef.current;
      const toRemove = viewer.entities.values.filter(
        (e) => typeof e.id === 'string' && e.id.startsWith(prefix)
      );
      toRemove.forEach((e) => viewer.entities.remove(e));
      routeIdRef.current = null;
    }

    if (!activeRoute) return;

    const rid = activeRoute.id;
    routeIdRef.current = rid;

    const fullPositions = Cartesian3.fromDegreesArray(
      activeRoute.path.flatMap((c) => [c.lon, c.lat])
    );
    const routeColor = Color.fromCssColorString(activeRoute.color);

    // Static dim underlay path
    viewer.entities.add({
      id: `${rid}-path`,
      polyline: {
        positions: fullPositions,
        width: 2,
        material: routeColor.withAlpha(0.2),
        clampToGround: true,
      },
    });

    // Animated growing line
    const startTime = Date.now();
    const durationMs = 3000;

    const animatedPositions = new CallbackProperty(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      const totalSegments = fullPositions.length - 1;
      const currentSegment = progress * totalSegments;
      const segmentIndex = Math.floor(currentSegment);
      const segmentFraction = currentSegment - segmentIndex;

      const positions: Cartesian3[] = [];
      for (let i = 0; i <= segmentIndex && i < fullPositions.length; i++) {
        positions.push(fullPositions[i]);
      }

      if (segmentIndex < totalSegments) {
        const from = fullPositions[segmentIndex];
        const to = fullPositions[segmentIndex + 1];
        positions.push(
          new Cartesian3(
            from.x + (to.x - from.x) * segmentFraction,
            from.y + (to.y - from.y) * segmentFraction,
            from.z + (to.z - from.z) * segmentFraction
          )
        );
      }

      return positions;
    }, false);

    viewer.entities.add({
      id: `${rid}-glow`,
      polyline: {
        positions: animatedPositions,
        width: 5,
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: routeColor,
        }),
        clampToGround: true,
      },
    });

    // Moving vessel (3D box + point)
    const vesselPosition = new CallbackProperty(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (durationMs * 2.5), 1);

      const totalSegments = fullPositions.length - 1;
      const currentSegment = progress * totalSegments;
      const segmentIndex = Math.min(Math.floor(currentSegment), totalSegments - 1);
      const segmentFraction = currentSegment - segmentIndex;

      const from = fullPositions[segmentIndex];
      const to = fullPositions[Math.min(segmentIndex + 1, fullPositions.length - 1)];

      return new Cartesian3(
        from.x + (to.x - from.x) * segmentFraction,
        from.y + (to.y - from.y) * segmentFraction,
        from.z + (to.z - from.z) * segmentFraction
      );
    }, false);

    viewer.entities.add({
      id: `${rid}-vessel`,
      position: vesselPosition as any,
      box: {
        dimensions: new Cartesian3(120000, 40000, 30000),
        material: new ColorMaterialProperty(routeColor.withAlpha(0.9)),
        outline: true,
        outlineColor: Color.WHITE.withAlpha(0.4),
      },
      point: {
        pixelSize: 10,
        color: routeColor,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
      },
    });

    // Origin label
    const first = activeRoute.path[0];
    viewer.entities.add({
      id: `${rid}-origin`,
      position: Cartesian3.fromDegrees(first.lon, first.lat),
      label: {
        text: activeRoute.origin.name,
        font: '13px Inter, system-ui, sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.BLACK,
        outlineWidth: 3,
        style: 2,
        pixelOffset: { x: 0, y: -22 } as any,
      },
      point: {
        pixelSize: 8,
        color: routeColor,
        outlineColor: Color.BLACK,
        outlineWidth: 1,
      },
    });

    // Destination label
    const last = activeRoute.path[activeRoute.path.length - 1];
    viewer.entities.add({
      id: `${rid}-dest`,
      position: Cartesian3.fromDegrees(last.lon, last.lat),
      label: {
        text: activeRoute.destination.name,
        font: '13px Inter, system-ui, sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.BLACK,
        outlineWidth: 3,
        style: 2,
        pixelOffset: { x: 0, y: -22 } as any,
      },
      point: {
        pixelSize: 8,
        color: routeColor,
        outlineColor: Color.BLACK,
        outlineWidth: 1,
      },
    });

    // Fly camera to route midpoint
    const mid = activeRoute.path[Math.floor(activeRoute.path.length / 2)];
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(mid.lon, mid.lat, 18_000_000),
      duration: 1.5,
    });

  }, [activeRoute]);

  return (
    <div
      id="cesiumContainer"
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    />
  );
}
