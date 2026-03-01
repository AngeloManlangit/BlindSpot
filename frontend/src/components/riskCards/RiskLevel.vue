<script lang="ts" setup>
import { computed } from 'vue';
import type { RiskReport } from '@/type/types.ts'; 
import { hazardLevelColor } from '@/utils/hazardLevelColor';

const props = defineProps<{
    report: RiskReport
}>();

// for the gauge
const radius = 80;
const circumference = Math.PI * radius; // semicircle

// Map overallRisk (0-100) to the dash offset
const dashOffset = computed(() => {
    const progress = (props.report.overallRisk / 100) * circumference;
    return circumference - progress;
});

const themeColor = computed(() => hazardLevelColor(props.report.overallLevel));

// Factor Bar color logic
const getBarColor = (value: number, invert?: boolean) => {
    if (invert) {
        return value > 60 ? '#10B981' : value > 30 ? '#F59E0B' : '#EF4444';
    }
    
    return value > 60 ? '#EF4444' : value > 30 ? '#F59E0B' : '#10B981';
};
</script>

<template>
    <section class="risk-card">
        <h2 class="title">Risk Level</h2>

        <div class="gauge">
            <svg viewBox="0 0 200 110" class="gauge-svg">
                <!-- For the gauge pathing -->
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#1e293b"
                    stroke-width="12"
                    stroke-linecap="round"
                />
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    :stroke="themeColor"
                    stroke-width="12"
                    stroke-linecap="round"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset"
                    class="progress-path"
                />
            </svg>

            <div class="score-display">
                <span class="score-number" :style="{ color: themeColor }">
                    {{ report.overallRisk }}
                </span>
            </div>
        </div>

        <div class="status">
            <div class="pulse-dot" :style="{ backgroundColor: themeColor }"></div>
            <span class="status-text" :style="{ color: themeColor }">
                {{ report.overallLevel }}
            </span>
        </div>

        <div class="factor-list">
            <!-- For each factor that affects the Risk -->
            <div v-for="factor in [
                { label: 'Hazard', val: report.hazard },
                { label: 'Exposure', val: report.exposure },
                { label: 'Vulnerability', val: report.vulnerability },
                { label: 'Capacity', val: report.capacity, invert: true }
            ]" :key="factor.label" class="factor-row">

                <span class="factor-label">{{ factor.label }}</span>
                <div class="bar-bg">
                    <div
                        class="bar-filling"
                        :style="{
                            width: factor.val + '%',
                            backgroundColor: getBarColor(factor.val, factor.invert)
                        }"
                    />
                </div>
                <span class="factor-value">{{ factor.val }}</span>

            </div>
        </div>
    </section>
</template>

<style scoped>
.risk-card {
    background: rgba(5, 26, 61, 0.432);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 16px;
}

.gauge {
    position: relative;
    width: 192px;
    height: 112px;
}

.gauge-svg {
    width: 100%;
    height: 100%;
}

.progress-path {
    transition: stroke-dashoffset 1s ease-out;
}

.score-display {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 4px;
}

.score-number {
    font-size: 2.25rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.status {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.pulse-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.status-text {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.factor-list {
    width: 100%;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.factor-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
}

.factor-label {
    width: 96px;
    color: #94a3b8;
}

.bar-bg {
    flex: 1;
    height: 6px;
    background: #0f172a;
    border-radius: 999px;
    overflow: hidden;
}

.bar-filling {
    height: 100%;
    border-radius: 999px;
    transition: width 0.7s ease-in-out;
}

.factor-value {
    width: 32px;
    text-align: right;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
}

@keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.7; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.7; }
}

</style>