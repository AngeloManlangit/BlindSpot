<template>
  <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
    Methodology
  </h4>
  <p style="font-size: 11px; line-height: 1.5; margin-bottom: 25px;">
    {{ data.methodology }}
  </p>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RiskReport } from '@/type/types';

defineProps({
  data: { type: Object as PropType<RiskReport>, required: true },
});
</script>