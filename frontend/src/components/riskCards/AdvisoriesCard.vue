<template>
  <div class="advisories-card">
    <div class="card-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" /><path d="M10 22h4" />
      </svg>
      <span class="header-label">Live Advisories</span>
    </div>

    <div class="advisory-list">
      <div class="advisory-item" v-for="item in advisoryItems" :key="item.key">
        <div class="advisory-icon" :style="{ background: item.bg }">
          <component :is="item.icon" />
        </div>
        <div class="advisory-content">
          <span class="advisory-type">{{ item.label }}</span>
          <span class="advisory-text">{{ item.text }}</span>
        </div>
      </div>
    </div>

    <!-- Critical Action Banner -->
    <div class="critical-action" v-if="criticalAction">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M13 2 L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      <span>{{ criticalAction }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from "vue";

const props = withDefaults(
  defineProps<{
    advisories: {
      work: string;
      commute: string;
      school: string;
    };
    criticalAction: string;
  }>(),
  {
    advisories: () => ({
      work: "No data available",
      commute: "No data available",
      school: "No data available",
    }),
    criticalAction: "",
  }
);

// Simple inline SVG icon render functions
const WorkIcon = () =>
  h("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2 }, [
    h("rect", { x: 2, y: 7, width: 20, height: 14, rx: 2 }),
    h("path", { d: "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" }),
  ]);

const CommuteIcon = () =>
  h("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2 }, [
    h("path", { d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6A2 2 0 0 0 13.7 5H6.3a2 2 0 0 0-1.6.9L2 9.5 1 11.1c-.4.6-.5 1.3-.3 2L2 17h2" }),
    h("circle", { cx: 7, cy: 17, r: 2 }),
    h("circle", { cx: 17, cy: 17, r: 2 }),
  ]);

const SchoolIcon = () =>
  h("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2 }, [
    h("path", { d: "M22 10v6M2 10l10-5 10 5-10 5z" }),
    h("path", { d: "M6 12v5c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-5" }),
  ]);

const advisoryItems = computed(() => [
  {
    key: "work",
    label: "Work",
    text: props.advisories.work,
    icon: WorkIcon,
    bg: "rgba(30, 144, 255, 0.15)",
  },
  {
    key: "commute",
    label: "Commute",
    text: props.advisories.commute,
    icon: CommuteIcon,
    bg: "rgba(255, 165, 2, 0.15)",
  },
  {
    key: "school",
    label: "School",
    text: props.advisories.school,
    icon: SchoolIcon,
    bg: "rgba(46, 213, 115, 0.15)",
  },
]);
</script>

<style scoped>
.advisories-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.header-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.advisory-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advisory-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.advisory-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.8);
}

.advisory-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.advisory-type {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.advisory-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.critical-action {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(255, 71, 87, 0.08);
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: 12px;
  color: #ff6b7a;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.critical-action svg {
  flex-shrink: 0;
}
</style>
