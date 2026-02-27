<template>
  <!-- Top logo (reused block) -->
  <div style="text-align: center; margin-bottom: 20px;">
    <div v-if="logoSvg" v-html="logoSvg" style="height: 60px; display: inline-block;"></div>
    <img
      v-else
      :src="logoUrl || '/blindspot-logo-white.svg'"
      alt="BlindSpot"
      style="height: 60px;"
      crossorigin="anonymous"
    />
  </div>

  <!-- Header with centered logo -->
  <div style="background: #0f172a; padding: 30px; margin: -50px -50px 30px -50px; color: white; text-align: center;">
    <div style="display: flex; justify-content: center; margin-bottom: 12px;">
      <div v-if="logoSvg" v-html="logoSvg" style="height: 48px; display: inline-block;"></div>
      <img
        v-else
        :src="logoUrl || '/blindspot-logo-white.svg'"
        alt="BlindSpot"
        style="height: 48px;"
        crossorigin="anonymous"
      />
    </div>
    <p style="margin: 5px 0; opacity: 0.8; font-size: 14px;">Disaster Risk Assessment Report</p>
    <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 11px;">
      <span>Generated: {{ data.generatedAt }}</span>
      <span>Confidence: {{ data.confidence }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RiskReport } from '@/type/types';

defineProps({
  logoSvg: String,
  logoUrl: String,
  data: {
    type: Object as PropType<RiskReport>,
    required: true,
  },
});
</script>
