import { useEffect, useRef } from 'react';
import {
  Viewer,
  Ion,
  Cartesian3,
  Color,
  createWorldTerrainAsync,
  CallbackProperty,
  PolylineGlowMaterialProperty,
} from 'cesium';
import type { Route } from '../types/Shipment';
import shipments from '../data/shipments.json';

export function Globe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);

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
      });

      viewerRef.current = viewer;

      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(30, 15, 25_000_000),
      });

      // --- Add trade routes ---
      const routes = shipments as Route[];

      routes.forEach((route) => {
        const fullPositions = Cartesian3.fromDegreesArray(
          route.coordinates.flatMap((c) => [c.lon, c.lat])
        );

        // Static full path (dim underlay)
        viewer.entities.add({
          id: `${route.id}-path`,
          name: `${route.from} to ${route.to}`,
          polyline: {
            positions: fullPositions,
            width: 2,
            material: Color.fromCssColorString(route.color).withAlpha(0.25),
            clampToGround: true,
          },
        });

        // Animated growing line
        const startTime = Date.now();
        const durationMs = 4000 + Math.random() * 2000; // 4-6s per route

        const animatedPositions = new CallbackProperty(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / durationMs, 1);

          // Interpolate how many points to show
          const totalSegments = fullPositions.length - 1;
          const currentSegment = progress * totalSegments;
          const segmentIndex = Math.floor(currentSegment);
          const segmentFraction = currentSegment - segmentIndex;

          const positions: Cartesian3[] = [];
          for (let i = 0; i <= segmentIndex && i < fullPositions.length; i++) {
            positions.push(fullPositions[i]);
          }

          // Interpolate partial segment
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
          id: `${route.id}-animated`,
          polyline: {
            positions: animatedPositions,
            width: 4,
            material: new PolylineGlowMaterialProperty({
              glowPower: 0.25,
              color: Color.fromCssColorString(route.color),
            }),
            clampToGround: true,
          },
        });

        // Endpoint labels
        const first = route.coordinates[0];
        const last = route.coordinates[route.coordinates.length - 1];

        viewer.entities.add({
          id: `${route.id}-label-from`,
          position: Cartesian3.fromDegrees(first.lon, first.lat),
          label: {
            text: route.from,
            font: '14px sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: 2, // FILL_AND_OUTLINE
            pixelOffset: { x: 0, y: -20 } as any,
          },
          point: {
            pixelSize: 6,
            color: Color.fromCssColorString(route.color),
          },
        });

        viewer.entities.add({
          id: `${route.id}-label-to`,
          position: Cartesian3.fromDegrees(last.lon, last.lat),
          label: {
            text: route.to,
            font: '14px sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: 2,
            pixelOffset: { x: 0, y: -20 } as any,
          },
          point: {
            pixelSize: 6,
            color: Color.fromCssColorString(route.color),
          },
        });
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
