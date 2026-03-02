<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    Nearest Cell Towers
  </h4>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
    <tr style="background: #f1f5f9;">
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Tower Name</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Location</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Distance</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Signal</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Operator</th>
    </tr>
    <tr v-for="tower in data.cellTowers" :key="tower.name">
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ tower.name }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ tower.location }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ tower.distance }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ tower.signal }}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ tower.operator }}</td>
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