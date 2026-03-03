<template>
  <div class="etr-card">
    <div class="card-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span class="header-label">Restoration Estimate</span>
    </div>

    <div class="etr-value">{{ etr || "—" }}</div>

    <div class="offline-brief" v-if="offlineBrief">
      <div class="brief-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>Crisis Brief</span>
      </div>
      <p class="brief-text">{{ offlineBrief }}</p>
    </div>

    <div class="cache-meta" v-if="lastUpdated">
      <span class="cache-dot" :class="{ stale: isStale }"></span>
      <span>{{ isStale ? "Stale cache" : "Live" }} · {{ formattedTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    etr: string;
    offlineBrief: string;
    lastUpdated: string | null;
    isStale: boolean;
  }>(),
  {
    etr: "",
    offlineBrief: "",
    lastUpdated: null,
    isStale: false,
  }
);

const formattedTime = computed(() => {
  if (!props.lastUpdated) return "";
  const d = new Date(props.lastUpdated);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
});
</script>

<style scoped>
.etr-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.header-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.etr-value {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  font-family: "JetBrains Mono", monospace;
  margin-bottom: 16px;
  line-height: 1.3;
}

.offline-brief {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}

.brief-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
}

.brief-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

.cache-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-family: "JetBrains Mono", monospace;
}

.cache-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2ed573;
  animation: pulse 2s infinite;
}

.cache-dot.stale {
  background: #ffa502;
  animation: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
