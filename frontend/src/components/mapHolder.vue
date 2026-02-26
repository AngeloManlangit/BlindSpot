<script setup lang ="ts">
import mapboxgl from 'mapbox-gl';
import { onMounted, ref } from 'vue';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapContainer = ref<HTMLElement | null>(null);
  
onMounted (() => {   
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = token;
    if (mapContainer.value) {
    const map = new mapboxgl.Map({
      container: mapContainer.value, 
      style: 'mapbox://styles/mapbox/streets-v12', 
      center: [123.8854, 10.3157], 
      zoom: 12
    });
}
})
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