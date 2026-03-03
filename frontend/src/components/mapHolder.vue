<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { RiskReport } from '@/type/types'
import { hazardLevelColor } from '@/utils/hazardLevelColor'

const mapContainer = ref<HTMLElement | null>(null);
// Use relaxed typing for Mapbox objects to avoid deep/complex
// type-instantiation issues with the Mapbox type definitions.
const map = ref<any>(null);
const marker = ref<any>(null);
const noahLoaded = ref(false)

const props = defineProps<{
  currStyle: string,
  isDark: boolean,
  targetLocation?: { lng: number; lat: number; name?: string } | null,
  showHeatmap?: boolean,
  riskReport?: RiskReport,
  targetBbox?: [number, number, number, number] | null
}>();

type HeatPoint = { lng: number; lat: number; weight: number }

// Convert style prop into Mapbox style URL
const getMapStyle = (style: string, dark: boolean) => {
  if (style === 'Normal') {
    return dark
      ? 'mapbox://styles/mapbox/light-v11'
      : 'mapbox://styles/mapbox/dark-v11';
  }
  if (style === 'Streets') return 'mapbox://styles/mapbox/streets-v12';
  return 'mapbox://styles/mapbox/satellite-streets-v12';
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

// Convert meters to approx degrees latitude at equator (good enough for small radii)
const metersToDegrees = (meters: number) => meters / 111_320

const computeRiskScore0to100 = (report?: RiskReport): number => {
  if (!report) return 0

  // If the backend already computed an overall score, use it directly.
  const overall = Number(report.overallRisk)
  if (Number.isFinite(overall) && overall > 0) return clamp(overall, 0, 100)

  // Otherwise compute from the provided factors.
  const hazard = Number(report.hazard) || 0
  const capacity = Number(report.capacity) || 0
  const vulnerability = Number(report.vulnerability) || 0
  const exposure = Number(report.exposure) || 0

  // risk = (hazard*vulnerability*exposure)/capacity
  // Factors are 0–100. Normalize into 0–100.
  const raw = (hazard * vulnerability * exposure) / (capacity || 1)
  return clamp(raw / 100, 0, 100)
}

const buildHeatPoints = (center: { lng: number; lat: number }, baseRisk0to100: number): HeatPoint[] => {
  // Create a small cloud around the center so Mapbox can render a true heatmap.
  // Keep radius modest so it reads like a neighborhood risk surface.
  const points: HeatPoint[] = []
  const radiusMeters = 1200
  const count = 160

  for (let i = 0; i < count; i++) {
    // Box-Muller for roughly gaussian spread
    const u = 1 - Math.random()
    const v = 1 - Math.random()
    const r = Math.sqrt(-2.0 * Math.log(u))
    const theta = 2.0 * Math.PI * v

    // 0..~3 sigma; scale to radius
    const dxMeters = (r * Math.cos(theta)) * (radiusMeters / 3)
    const dyMeters = (r * Math.sin(theta)) * (radiusMeters / 3)

    const lat = center.lat + metersToDegrees(dyMeters)
    const lng = center.lng + (metersToDegrees(dxMeters) / Math.cos(center.lat * Math.PI / 180))

    const dist = Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters)
    const decay = clamp(1 - dist / radiusMeters, 0, 1)
    points.push({ lng, lat, weight: baseRisk0to100 * decay })
  }

  // Ensure the exact center exists
  points.push({ lng: center.lng, lat: center.lat, weight: baseRisk0to100 })
  return points
}

const ensureRiskHeatmap = () => {
  if (!map.value) return

  const shouldShow = Boolean(props.showHeatmap && props.targetLocation)
  const sourceId = 'risk-heatmap-source'
  const layerId = 'risk-heatmap-layer'

  if (!shouldShow) {
    if (map.value.getLayer(layerId)) map.value.removeLayer(layerId)
    if (map.value.getSource(sourceId)) map.value.removeSource(sourceId)
    return
  }

  const center = { lng: props.targetLocation!.lng, lat: props.targetLocation!.lat }
  const baseRisk = computeRiskScore0to100(props.riskReport)
  const pts = buildHeatPoints(center, baseRisk)

  const data: GeoJSON.FeatureCollection<GeoJSON.Point, { weight: number }> = {
    type: 'FeatureCollection',
    features: pts.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { weight: p.weight },
    })),
  }

  if (map.value.getSource(sourceId)) {
    map.value.getSource(sourceId).setData(data)
  } else {
    map.value.addSource(sourceId, { type: 'geojson', data })
  }

  if (!map.value.getLayer(layerId)) {
    map.value.addLayer({
      id: layerId,
      type: 'heatmap',
      source: sourceId,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 100, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 0.7, 13, 1.3, 16, 2.0],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 18, 13, 32, 16, 48],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.65, 16, 0.85],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, 'rgba(59,130,246,0.35)',
          0.4, 'rgba(16,185,129,0.45)',
          0.6, 'rgba(234,179,8,0.55)',
          0.8, 'rgba(249,115,22,0.65)',
          1, 'rgba(239,68,68,0.75)',
        ],
      },
    })
  }
}

const ensureNoahFloodLayer = async () => {
  if (!map.value) return
  if (noahLoaded.value) return

  const sourceId = 'noah-fh-5yr'
  const fillId = 'noah-fh-5yr-fill'
  const lineId = 'noah-fh-5yr-line'

  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/noah/fh_5yr`)
    if (!res.ok) throw new Error(`NOAH dataset ${res.status}`)
    const data = await res.json()

    if (!map.value.getSource(sourceId)) {
      map.value.addSource(sourceId, { type: 'geojson', data })
    }

    if (!map.value.getLayer(fillId)) {
      map.value.addLayer(
        {
          id: fillId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': 'rgba(59, 130, 246, 0.25)',
            'fill-opacity': 0.18,
          },
        },
        // keep it beneath the risk area if possible
        map.value.getLayer('risk-area-fill') ? 'risk-area-fill' : undefined
      )
    }

    if (!map.value.getLayer(lineId)) {
      map.value.addLayer(
        {
          id: lineId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': 'rgba(59, 130, 246, 0.55)',
            'line-width': 1.5,
          },
        },
        map.value.getLayer('risk-area-fill') ? 'risk-area-fill' : undefined
      )
    }

    noahLoaded.value = true
  } catch (e) {
    console.warn('Failed to load NOAH dataset:', e)
  }
}

const buildCirclePolygon = (center: { lng: number; lat: number }, radiusMeters: number) => {
  const steps = 64
  const coords: [number, number][] = []
  const latRad = center.lat * Math.PI / 180

  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI
    const dx = Math.cos(theta) * radiusMeters
    const dy = Math.sin(theta) * radiusMeters

    const dLat = metersToDegrees(dy)
    const dLng = metersToDegrees(dx) / Math.cos(latRad)

    coords.push([center.lng + dLng, center.lat + dLat])
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords],
        },
        properties: {},
      },
    ],
  } as const
}

const ensureRiskAreaPolygon = () => {
  if (!map.value) return

  const hasCenter = Boolean(props.targetLocation)
  const sourceId = 'risk-area-source'
  const fillId = 'risk-area-fill'
  const lineId = 'risk-area-line'

  if (!hasCenter) {
    if (map.value.getLayer(fillId)) map.value.removeLayer(fillId)
    if (map.value.getLayer(lineId)) map.value.removeLayer(lineId)
    if (map.value.getSource(sourceId)) map.value.removeSource(sourceId)
    return
  }

  // Single focus area: circular zone around the selected point
  const center = { lng: props.targetLocation!.lng, lat: props.targetLocation!.lat }
  const data = buildCirclePolygon(center, 1500) // ~1.5km radius

  if (map.value.getSource(sourceId)) {
    map.value.getSource(sourceId).setData(data)
  } else {
    map.value.addSource(sourceId, { type: 'geojson', data })
  }

  const level = props.riskReport?.overallLevel ?? ''
  const fillColor = hazardLevelColor(level)

  if (!map.value.getLayer(fillId)) {
    map.value.addLayer({
      id: fillId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': fillColor,
        'fill-opacity': 0.22,
      },
    })
  } else {
    map.value.setPaintProperty(fillId, 'fill-color', fillColor)
  }

  if (!map.value.getLayer(lineId)) {
    map.value.addLayer({
      id: lineId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': fillColor,
        'line-width': 2,
        'line-opacity': 0.7,
      },
    })
  } else {
    map.value.setPaintProperty(lineId, 'line-color', fillColor)
  }
}

// Clean marker safely
const clearMarker = () => {
  if (marker.value) {
    marker.value.remove();
    marker.value = null;
  }
};

// Fly and add marker
const flyToLocation = (loc: { lng: number; lat: number; name?: string }) => {
  if (!map.value) return;

  clearMarker();

  map.value.flyTo({
    center: [loc.lng, loc.lat],
    zoom: 13,
    speed: 1.4,
    curve: 1.5,
  });

  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.innerHTML = `
    <div class="marker-pin"></div>
    <div class="marker-pulse"></div>
  `;

  const newMarker = new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat([loc.lng, loc.lat])
    .addTo(map.value!);

  if (loc.name) {
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false
    }).setText(loc.name);

    newMarker.setPopup(popup).togglePopup();
  }

  marker.value = newMarker;
};

onMounted(() => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  if (!mapContainer.value) return;
  
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: getMapStyle(props.currStyle, props.isDark),
    center: [123.8854, 10.3157],
    zoom: 12
  });

  map.value.on('load', () => {
    ensureNoahFloodLayer()
    if (props.targetLocation) {
      flyToLocation(props.targetLocation);
    }
    ensureRiskAreaPolygon()
    ensureRiskHeatmap()
  });

  // When the style is swapped (setStyle), custom layers/sources need re-adding.
  map.value.on('style.load', () => {
    noahLoaded.value = false
    ensureNoahFloodLayer()
    ensureRiskAreaPolygon()
    ensureRiskHeatmap()
  })
});

// Watch style changes
watch(
  [() => props.currStyle, () => props.isDark],
  ([newStyle, newDark]) => {
    if (map.value) {
      map.value.setStyle(getMapStyle(newStyle, newDark));
    }
  }
);

// Watch location changes
watch(
  () => props.targetLocation,
  (newLoc) => {
    if (!map.value) return;

    if (!newLoc) {
      clearMarker();
      return;
    }

    if (map.value.isStyleLoaded()) {
      flyToLocation(newLoc);
      ensureRiskAreaPolygon()
      ensureRiskHeatmap()
    } else {
      map.value.once('load', () => {
        flyToLocation(newLoc)
        ensureRiskAreaPolygon()
        ensureRiskHeatmap()
      });
    }
  },
  { deep: true }
);

watch(
  [() => props.showHeatmap, () => props.riskReport, () => props.targetBbox],
  () => {
    if (!map.value) return
    if (map.value.isStyleLoaded()) {
      ensureRiskAreaPolygon()
      ensureRiskHeatmap()
    } else {
      map.value.once('load', () => {
        ensureRiskAreaPolygon()
        ensureRiskHeatmap()
      })
    }
  },
  { deep: true }
)

// Cleanup on unmount
onUnmounted(() => {
  clearMarker();
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
</script>

<template>
  <div ref="mapContainer" class="map-inner-container"></div>
</template>

<style scoped>
.map-inner-container {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
</style>

<style>
.custom-marker {
  position: relative;
  width: 28px;
  height: 28px;
}

.marker-pin {
  width: 28px;
  height: 28px;
  border-radius: 50% 50% 50% 0;
  background: #2563eb;
  transform: rotate(-45deg);
  border: 3px solid white;
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.6);
}

.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.25);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

.mapboxgl-popup-content {
  border-radius: 10px !important;
  padding: 8px 14px !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.85rem !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
  color: #1e293b !important;   
  text-align: center;

}
</style>