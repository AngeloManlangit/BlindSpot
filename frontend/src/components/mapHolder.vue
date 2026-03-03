<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapContainer = ref<HTMLElement | null>(null);
// Use relaxed typing for Mapbox objects to avoid deep/complex
// type-instantiation issues with the Mapbox type definitions.
const map = ref<any>(null);
const marker = ref<any>(null);

const props = defineProps<{
  currStyle: string,
  isDark: boolean,
  targetLocation?: { lng: number; lat: number; name?: string } | null
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
    if (props.targetLocation) {
      flyToLocation(props.targetLocation);
    }
  });
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
    } else {
      map.value.once('load', () => flyToLocation(newLoc));
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