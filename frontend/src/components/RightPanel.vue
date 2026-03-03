<template>
  <aside class="right-panel" :class="{ collapsed: isCollapsed }">
    <!-- Toggle Button -->
    <button class="panel-toggle" @click="isCollapsed = !isCollapsed">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        :style="{ transform: isCollapsed ? 'rotate(180deg)' : '' }"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div class="panel-scroll" v-show="!isCollapsed">
      <!-- Panel Header -->
      <div class="panel-header">
        <div class="header-top">
          <h2 class="panel-title">Risk Analysis</h2>
          <button class="refresh-btn" @click="manualRefresh" :disabled="loading">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="{ spinning: loading }"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        </div>
        <p class="panel-subtitle">
          {{ locationLabel || "Select a location" }}
        </p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading && !analysis" class="skeleton-container">
        <div class="skeleton-card">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-circle"></div>
          <div class="skeleton-line w-60"></div>
        </div>
        <div class="skeleton-card">
          <div class="skeleton-line w-30"></div>
          <div class="skeleton-line w-full"></div>
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-line w-full"></div>
        </div>
      </div>

      <!-- Data Cards -->
      <div v-else class="cards-container">
        <VulnerabilityGauge
          :score="analysis?.vulnerabilityScore ?? 0"
          :system-status="analysis?.systemStatus ?? 'Offline'"
        />

        <EtrCard
          :etr="analysis?.etr ?? ''"
          :offline-brief="analysis?.offlineBrief ?? ''"
          :last-updated="lastUpdated"
          :is-stale="isOffline"
        />

        <AdvisoriesCard
          :advisories="analysis?.advisories ?? { work: '—', commute: '—', school: '—' }"
          :critical-action="analysis?.criticalAction ?? ''"
        />

        <ExportPdf :analysis="analysis" :location="locationLabel" />
      </div>

      <!-- Error Banner -->
      <div v-if="error" class="error-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ error }} — using cached data</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useGemini } from "@backend/services/useGemini";
import VulnerabilityGauge from "./riskCards/VulnerabilityGauge.vue";
import EtrCard from "./riskCards/EtrCard.vue";
import AdvisoriesCard from "./riskCards/AdvisoriesCard.vue";
import ExportPdf from "./pdf/ExportPdf.vue";

const props = withDefaults(
  defineProps<{
    /** Current location label from the map / search */
    locationLabel?: string;
    /** Infrastructure data object from your backend or map layer */
    infraData?: object;
    /** Live weather data object (OpenWeather, etc.) */
    weatherData?: object;
    /** Historical disaster recovery data string */
    historicalData?: string;
  }>(),
  {
    locationLabel: "",
    infraData: () => ({}),
    weatherData: () => ({}),
    historicalData: "",
  }
);

const isCollapsed = ref(false);

const {
  analysis,
  loading,
  error,
  isOffline,
  lastUpdated,
  fetchWeatherAnalysis,
  startAutoRefresh,
  stopAutoRefresh,
  loadFromCache,
} = useGemini();

const manualRefresh = () => {
  fetchWeatherAnalysis(props.infraData, props.weatherData, props.historicalData);
};

// On mount: load cache first for instant UI, then start live cycle
onMounted(() => {
  loadFromCache();
  startAutoRefresh(
    props.infraData,
    props.weatherData,
    props.historicalData,
    30000 // 30s refresh in production (adjust as needed)
  );
});

// If location/data changes, restart the refresh cycle
watch(
  () => [props.infraData, props.weatherData, props.historicalData],
  () => {
    startAutoRefresh(
      props.infraData,
      props.weatherData,
      props.historicalData,
      30000
    );
  },
  { deep: true }
);

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap");

.right-panel {
  position: relative;
  width: 380px;
  height: 100%;
  background: rgba(12, 12, 25, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 10;
}

.right-panel.collapsed {
  width: 0;
  border-left: none;
}

.panel-toggle {
  position: absolute;
  left: -36px;
  top: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px 0 0 8px;
  background: rgba(12, 12, 25, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-right: none;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 20;
}

.panel-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(12, 12, 25, 1);
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.panel-scroll::-webkit-scrollbar {
  width: 4px;
}
.panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* Header */
.panel-header {
  margin-bottom: 4px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  letter-spacing: -0.3px;
}

.panel-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 4px 0 0;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.refresh-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Cards */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Skeleton */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-circle {
  width: 120px;
  height: 70px;
  margin: 8px auto;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }
.w-full { width: 100%; }

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 165, 2, 0.08);
  border: 1px solid rgba(255, 165, 2, 0.15);
  border-radius: 12px;
  color: #ffa502;
  font-size: 12px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
