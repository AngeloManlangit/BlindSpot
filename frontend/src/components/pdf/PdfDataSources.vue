<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    Data Sources
  </h4>
  <ul style="margin: 0 0 25px 20px; padding: 0; font-size: 11px;">
    <li v-for="source in data.dataSources" :key="source" style="margin-bottom: 4px;">
      {{ source }}
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