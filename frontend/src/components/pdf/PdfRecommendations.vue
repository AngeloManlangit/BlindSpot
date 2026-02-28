<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    Recommendations
  </h4>
  <ul style="margin: 0 0 25px 20px; padding: 0; font-size: 11px;">
    <li v-for="rec in data.recommendations" :key="rec.category" style="margin-bottom: 8px;">
      <b>{{ rec.category }} (Priority: {{ rec.priority }}):</b> {{ rec.action }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RiskReport } from '@/type/types';

defineProps({
  data: { type: Object as PropType<RiskReport>, required: true },
});
</script>