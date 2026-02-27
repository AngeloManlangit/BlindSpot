<template>
  <div style="margin-bottom: 25px;">
    <h2 style="margin: 0;">{{ data.location }}</h2>
    <p style="color: #64748b; font-size: 13px;">{{ data.city }}, {{ data.region }}</p>
    <p style="font-size: 12px; margin-top: 5px;">
      Coordinates: {{ data.coordinates }} |
      Elevation: {{ data.elevation }} |
      Population: {{ data.population }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RiskReport } from '@/type/types';

defineProps({
  data: { type: Object as PropType<RiskReport>, required: true },
});
</script>
