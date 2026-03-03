<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  radiusKm: number,
  riskLevel: string,
  showRisk?: boolean
}>();

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

// Clean marker safely
const clearMarker = () => {
  if (marker.value) {
    marker.value.remove();
    marker.value = null;
  }
};

function createCircleGeoJSON(center: [number, number], radiusKm: number): GeoJSON.Feature {
  const [lng, lat] = center;
  const points = 64;
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {}
  };
}

const updateRiskLayer = () => {
  if (!map.value || !props.targetLocation) return;

  const sourceId = 'risk-circle-source';
  const fillId = 'risk-circle-fill';
  const roadHighlightId = 'risk-roads-highlight'; // New ID for road layer
  
  const center: [number, number] = [props.targetLocation.lng, props.targetLocation.lat];
  const geojson = createCircleGeoJSON(center, props.radiusKm);
  const color = hazardLevelColor(props.riskLevel);

  // 1. Update the circular area source
  if (!map.value.getSource(sourceId)) {
    map.value.addSource(sourceId, { type: 'geojson', data: geojson });
    
    // The existing transparent fill
    map.value.addLayer({
      id: fillId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': color,
        'fill-opacity': 0.15 // Lower opacity to make roads pop
      },
      layout: { visibility: props.showRisk ? 'visible' : 'none' }
    });
  } else {
    map.value.getSource(sourceId).setData(geojson);
  }

  // 2. Add or Update the Road Highlight Layer
  // We use the 'composite' source and 'road' layer from Mapbox's default tileset
  if (!map.value.getLayer(roadHighlightId)) {
    map.value.addLayer({
      id: roadHighlightId,
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      paint: {
        'line-color': color,
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 16, 6],
        'line-opacity': 0.8
      },
      layout: { 
        'line-join': 'round', 
        'line-cap': 'round',
        visibility: props.showRisk ? 'visible' : 'none' 
      }
    });
  }

  // 3. Apply the Spatial Filter
  // This tells Mapbox to ONLY show roads within the circle geometry
  map.value.setFilter(roadHighlightId, [
    'within', 
    geojson // This uses the Polygon we just generated
  ]);

  // Update visibility and colors reactively
  map.value.setPaintProperty(roadHighlightId, 'line-color', color);
  map.value.setLayoutProperty(roadHighlightId, 'visibility', props.showRisk ? 'visible' : 'none');
  map.value.setPaintProperty(fillId, 'fill-color', color);
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
      updateRiskLayer();
    }
  });

  // When the style is swapped (setStyle), custom layers/sources need re-adding.
  map.value.on('style.load', () => {
    noahLoaded.value = false
    ensureNoahFloodLayer()
    updateRiskLayer()
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

// Watch for changes to update the risk circle
watch(
  () => [props.targetLocation, props.radiusKm, props.riskLevel, props.showRisk],
  () => {
    if (props.targetLocation) {
      flyToLocation(props.targetLocation);
      updateRiskLayer();
    }
  },
  { deep: true }
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
    } else {
      map.value.once('load', () => {
        flyToLocation(newLoc)
      });
    }
  },
  { deep: true }
);

watch(
  () => [props.targetLocation, props.radiusKm, props.riskLevel],
  ([newLoc, newRadius, newLevel]) => {
    if (!map.value || !newLoc) {
      if (map.value?.getSource('risk-circle-source')) {
        map.value.getSource('risk-circle-source').setData({ type: 'FeatureCollection', features: [] });
      }
      return;
    }
    const radius = Number(newRadius);
    const center: [number, number] = [newLoc.lng, newLoc.lat];
    const geojson = createCircleGeoJSON(center, radius); // Uses your radiusKm prop
    const color = hazardLevelColor(newLevel as string); // Uses your overallLevel risk color

    if (!map.value.getSource('risk-circle-source')) {
      map.value.addSource('risk-circle-source', { type: 'geojson', data: geojson });
      map.value.addLayer({
        id: 'risk-circle-fill',
        type: 'fill',
        source: 'risk-circle-source',
        paint: {
          'fill-color': color,
          'fill-opacity': 0.3,
          'fill-outline-color': color
        }
      });
    } else {
      map.value.getSource('risk-circle-source').setData(geojson);
      map.value.setPaintProperty('risk-circle-fill', 'fill-color', color);
    }
  },
  { deep: true }
);

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