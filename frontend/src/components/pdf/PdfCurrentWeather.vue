<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    Current Weather Conditions
  </h4>
  <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 25px; font-size: 11px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <div><b>Temperature:</b> {{ data.currentWeather.temperature }}</div>
      <div><b>Description:</b> {{ data.currentWeather.description }}</div>
      <div><b>Humidity:</b> {{ data.currentWeather.humidity }}</div>
      <div><b>Wind Speed:</b> {{ data.currentWeather.windSpeed }}</div>
      <div style="grid-column: 1 / -1;"><b>Visibility:</b> {{ data.currentWeather.visibility }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RiskReport } from '@/type/types';

defineProps({
  data: { type: Object as PropType<RiskReport>, required: true },
});
</script>