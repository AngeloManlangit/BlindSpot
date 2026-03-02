<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    3-Day Hazard Forecast
  </h4>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
    <tr style="background: #f1f5f9;">
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Date</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Hazard</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Risk Level</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Summary</th>
    </tr>
    <tr v-for="forecast in data.threeDayForecast" :key="forecast.day">
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ forecast.date }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ forecast.hazard }}</td>
      <td :style="`padding: 8px; border: 1px solid #cbd5e1; color: ${hazardLevelColor(forecast.riskLevel)}; font-weight: bold;`">
        {{ forecast.riskLevel }}
      </td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ forecast.summary }}</td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RiskReport } from '@/type/types';
import { hazardLevelColor } from '@/utils/hazardLevelColor';

defineProps({
  data: { type: Object as PropType<RiskReport>, required: true },
});
</script>