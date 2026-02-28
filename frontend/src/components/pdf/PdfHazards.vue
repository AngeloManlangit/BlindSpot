<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    Multi-Hazard Analysis
  </h4>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
    <tr style="background: #f1f5f9;">
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Hazard Type</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Score</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Level</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Key Factors</th>
    </tr>
    <tr v-for="hazard in data.hazards" :key="hazard.type">
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ hazard.type }}</td>
      <td style="text-align: center; border: 1px solid #cbd5e1;">{{ hazard.score }}/100</td>
      <td
        :style="`text-align: center; border: 1px solid #cbd5e1; font-weight: bold; color: ${hazardLevelColor(hazard.level)};`"
      >
        {{ hazard.level }}
      </td>
      <td style="border: 1px solid #cbd5e1;">{{ hazard.keyFactors }}</td>
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
