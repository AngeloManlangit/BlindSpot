<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    7-Day Weather Forecast
  </h4>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
    <tr style="background: #f1f5f9;">
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Day</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Condition</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Temperature</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Precipitation Chance</th>
    </tr>
    <tr v-for="day in data.weekForecast" :key="day.day">
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ day.day }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ day.condition }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ day.temperature }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ day.precipitationChance }}</td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RiskReport } from '@/type/types';

defineProps({
  data: { type: Object as PropType<RiskReport>, required: true },
});
</script>