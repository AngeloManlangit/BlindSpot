<script setup lang="ts">
import { computed } from 'vue';
import type { RiskReport, HazardRow, BlindSpot } from '@/type/types';
import { hazardLevelColor } from '@/utils/hazardLevelColor';

const props = defineProps<{
    type: 'weather' | 'power' | 'hazards' | 'comms';
    report: RiskReport,
    isDark: boolean
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
    return 'normal';
});

const statusColor = computed(() => {
    const colors = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' };
    return colors[getStatus.value];
});
</script>

<template>
    <div :class="[`border-${getStatus}`, 'status-card', isDark ? 'dark' : 'light']">
        <div class="card-header">
            <span class="title-group">
                <h3 class="status-title">{{ type.toUpperCase() }}</h3>
            </span>
            <div class="status-dot" :style="{ backgroundColor: statusColor }" />
        </div>

        <div class="items-list">
            <template v-if="type === 'weather'">
                <div class="item"><span>Temp</span><span>{{ report.currentWeather.temperature }}</span></div>
                <div class="item"><span>Wind</span><span>{{ report.currentWeather.windSpeed }}</span></div>
                <div class="item"><span>Humidity</span><span>{{ report.currentWeather.humidity }}</span></div>
            </template>

            <template v-if="type === 'hazards'">
                <div class="hazard-container">
                    <div v-for="hazard in report.hazards" :key="hazard.type" class="hazard-row">
                        <span class="hazard-name">{{ hazard.type }}</span>
                        
                        <div class="progress-container">
                            <div 
                                class="progress-bar" 
                                :style="{ 
                                    width: `${hazard.score}%`,
                                    backgroundColor: hazardLevelColor(hazard.level) 
                                }"
                            />
                        </div>
                        
                        <span class="hazard-score">{{ hazard.score }}</span>
                    </div>
                </div>
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
.status-card.dark {
    --text-main: #ffffff;
    --text-muted: #94a3b8;
    --card-bg: linear-gradient(to bottom, rgba(5, 22, 62, 0.49), rgba(11, 24, 52, 0.49));
    --card-border: rgba(255, 255, 255, 0.1);
    --bar-bg: #0d1529;
}

.status-card.light {
    --text-main: #0f172a;
    --text-muted: #475569;
    --card-bg:  linear-gradient(to bottom, rgba(208, 231, 246, 0.656), rgba(255, 255, 255, 0.656));
    --card-border: #ffffff;
    --bar-bg: #687b98;
}

.status-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
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
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.status-title {
    color: var(--text-main);
    font-size: 14px;
    font-weight: 800;
}
.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
}

.item {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-bottom: 4px;
    color: var(--text-muted);
}

/* Hazard stuff */
.hazard-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.hazard-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.75rem;
}

.hazard-name {
    width: 80px; 
    color: var(--text-muted);
    white-space: nowrap;
}

.progress-container {
    flex: 1;
    height: 6px;
    background: var(--bar-bg); 
    border-radius: 10px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    border-radius: 10px;
    transition: width 0.6s ease-out; 
}

.hazard-score {
    width: 25px;
    text-align: right;
    color: var(--text-muted);
    font-weight: 600;
}
</style>