<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import { onMounted, ref, watch } from 'vue';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<mapboxgl.Map | null>(null);

const props = defineProps<{
  currStyle: string,
  isDark: boolean
}>();

// Helper function to turn props into a Mapbox URL
const getMapStyle = (style: string, dark: boolean) => {
  if (style === 'Normal') {
    return dark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
  }
  if (style === 'Streets') return 'mapbox://styles/mapbox/streets-v12';
  return 'mapbox://styles/mapbox/satellite-streets-v12';
};

onMounted(() => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  if (mapContainer.value) {
    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: getMapStyle(props.currStyle, props.isDark),
      center: [123.8854, 10.3157],
      zoom: 12
    });
  }
});

watch([() => props.currStyle, () => props.isDark], ([newStyle, newDark]) => {
  if (map.value) {
    map.value.setStyle(getMapStyle(newStyle, newDark));
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