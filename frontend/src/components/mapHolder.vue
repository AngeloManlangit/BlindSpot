<script setup lang ="ts">
import mapboxgl from 'mapbox-gl';
import { onMounted, ref } from 'vue';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapContainer = ref<HTMLElement | null>(null);
onMounted (() => {
    //imports the access token from the .env file
   

    mapboxgl.accessToken = 'pk.eyJ1IjoiY3VjdXJseXoiLCJhIjoiY21hMGx2ZjQ0MjZqNjJpcG1xNnhuZzN5eiJ9.9YAJFV1B_U8tY6bNL_aj9Q';

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
  height: 100%; /* Important: Tells the map to fill its parent div */
  min-height: 100vh; /* Ensures visibility during the hackathon */
}
</style>


