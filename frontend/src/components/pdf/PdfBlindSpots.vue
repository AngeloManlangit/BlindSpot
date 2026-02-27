<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    Identified Blind Spots
  </h4>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
    <tr style="background: #f1f5f9;">
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Area</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Issue</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Severity</th>
    </tr>
    <tr v-for="spot in data.blindSpots" :key="spot.area">
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ spot.area }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ spot.issue }}</td>
      <td :style="`padding: 8px; border: 1px solid #cbd5e1; color: ${hazardLevelColor(spot.severity)}; font-weight: bold;`">
        {{ spot.severity }}
      </td>
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