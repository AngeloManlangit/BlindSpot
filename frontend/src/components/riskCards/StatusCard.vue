<script setup lang="ts">
import { computed } from 'vue';
import type { RiskReport, HazardRow, BlindSpot } from '@/type/types';

const props = defineProps<{
    type: 'weather' | 'power' | 'water' | 'comms';
    report: RiskReport;
}>();

// Derived logic for utility cards
const powerIssue = computed(() => 
    props.report.blindSpots.find(b => b.issue.toLowerCase().includes('grid') || b.issue.toLowerCase().includes('power'))
);

const waterHazard = computed(() => 
    props.report.hazards.find(h => h.type.toLowerCase().includes('water') || h.type.toLowerCase().includes('flood'))
);

const getStatus = computed(() => {
    if (props.type === 'power') return powerIssue.value ? 'warning' : 'normal';
    if (props.type === 'water') return waterHazard.value?.level === 'SEVERE' ? 'critical' : 'normal';
    return 'normal';
});

const statusColor = computed(() => {
    const colors = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' };
    return colors[getStatus.value];
});
</script>

<template>
    <div class="status-card" :class="`border-${getStatus}`">
        <div class="card-header">
        <span class="title-group">
            <h3 class="">{{ type.toUpperCase() }}</h3>
        </span>
        <div class="status-dot" :style="{ backgroundColor: statusColor }"></div>
        </div>

        <div class="items-list">
        <template v-if="type === 'weather'">
            <div class="item"><span>Temp</span><span>{{ report.currentWeather.temperature }}</span></div>
            <div class="item"><span>Wind</span><span>{{ report.currentWeather.windSpeed }}</span></div>
            <div class="item"><span>Humidity</span><span>{{ report.currentWeather.humidity }}</span></div>
        </template>

        <template v-if="type === 'power'">
            <div class="item"><span>Status</span><span>{{ powerIssue ? 'Stressed' : 'Stable' }}</span></div>
            <div class="item"><span>Load</span><span>{{ powerIssue ? '87%' : 'Normal' }}</span></div>
        </template>

        <template v-if="type === 'comms'">
            <div class="item"><span>Towers</span><span>{{ report.cellTowers.length }} Online</span></div>
            <div class="item"><span>Internet</span><span>Stable</span></div>
        </template>
        </div>
    </div>
</template>

<style scoped>
.status-card {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;
}

.border-warning { border-color: rgba(245, 158, 11, 0.3); }
.border-critical { border-color: rgba(239, 68, 68, 0.3); }

.card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}

.status-title {
    font-size: 14px;
    font-weight: 600;
}
.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
}

.item {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-bottom: 4px;
    color: #94a3b8;
}
</style>