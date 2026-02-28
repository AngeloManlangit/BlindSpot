<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    Risk Factors (UNDRR Framework)
  </h4>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px;">
    <tr style="background: #0f172a; color: white;">
      <th style="padding: 10px; text-align: left;">Factor</th>
      <th style="padding: 10px; text-align: center;">Score</th>
      <th style="padding: 10px; text-align: left;">Description</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0;"><b>Hazard (H)</b></td>
      <td style="text-align: center; border: 1px solid #e2e8f0;">{{ data.hazard }}/100</td>
      <td style="border: 1px solid #e2e8f0;">Probability and intensity of natural hazard events</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0;"><b>Exposure (E)</b></td>
      <td style="text-align: center; border: 1px solid #e2e8f0;">{{ data.exposure }}/100</td>
      <td style="border: 1px solid #e2e8f0;">Population and assets in hazard-prone areas</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0;"><b>Vulnerability (V)</b></td>
      <td style="text-align: center; border: 1px solid #e2e8f0;">{{ data.vulnerability }}/100</td>
      <td style="border: 1px solid #e2e8f0;">Susceptibility to damage from hazard impact</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0;"><b>Capacity (C)</b></td>
      <td style="text-align: center; border: 1px solid #e2e8f0;">{{ data.capacity }}/100</td>
      <td style="border: 1px solid #e2e8f0;">Ability to cope with and recover from disasters</td>
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
