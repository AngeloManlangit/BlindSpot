<script lang="ts" setup>
import type { RiskReport } from '@/type/types.ts'; 

import RiskLevel from './riskCards/RiskLevel.vue';
import StatusCard from './riskCards/StatusCard.vue';
import ThreatTimeline from './riskCards/ThreatTimeline.vue';
import AlertCard from './riskCards/AlertCard.vue';

const props = defineProps<{
    report: RiskReport,
    isDark: boolean
}>();
</script>

<template>
    <div class="dark-background" @click.self="$emit('close')">
        
        <div :class="['popup-window', isDark ? 'dark' : 'light']">
            <div class="window-header">
                <h1 class="title paytone-one-regular">RISK RADAR</h1>
                <button class="close-x" @click="$emit('close')">&times;</button>
            </div>

            <div class="dashboard-body">

                <div class="stats-grid">
                    <section class="left-column">
                        <RiskLevel :report="report" :is-dark="isDark" />
                        <AlertCard :spots="report.blindSpots" :is-dark="isDark" />
                    </section>
                    
                    <section class="right-column">
                        <div class="grid-main-top">
                            <StatusCard type="weather" :report="report" :is-dark="isDark" />
                            <StatusCard type="power" :report="report" :is-dark="isDark"/>
                            <StatusCard type="water" :report="report" :is-dark="isDark" />
                            <StatusCard type="comms" :report="report" :is-dark="isDark" />
                        </div>

                        <ThreatTimeline :forecast="report.threeDayForecast" :is-dark="isDark" />
                    </section>
                    
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dark-background {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;

    /* Sets the font for the whole thing */
    font-family: 'Outfit', sans-serif;
}

.popup-window.dark {
  --text-main: #ffffff;
  --text-muted: #94a3b8;
  --card-bg: radial-gradient(circle, rgba(11, 22, 46, 0.49), rgba(16, 40, 95, 0.49));
  --card-border: rgba(255, 255, 255, 0.1);
}

.popup-window.light {
  --text-main: #0f172a;
  --text-muted: #475569;
  --card-bg: radial-gradient(circle, rgba(162, 198, 238, 0.666), rgba(255, 255, 255, 0.656));
  --card-border: #ffffff;
}

.popup-window {
    width: 100%;
    max-width: 1500px;
    height: 90vh;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 28px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.window-header {
    margin-top: 20px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.title {
    position: absolute;
    left: 40px;
    color: var(--text-main);
}

.close-x {
    position: absolute;
    right: 20px;
    background: none;
    border: none;
    color: var(--text-main);
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
}

/* Content Layout */
.dashboard-body {
    color: white;
    padding: 30px;
    flex: 1;
    padding-top: 0px;
    overflow-y: auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: 450px 1fr;
    gap: 20px;
    margin-top: 20px;
}

.left-column {
    grid-column: 1;
}

.right-column {
    grid-column: 2;
}

.left-column, .right-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.grid-main-top {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two equal columns */
    grid-template-rows: 1fr 1fr;   /* Two rows for the 4 cards */
    gap: 16px;
}

.stats-grid > * {
    animation: slide-up 0.6s ease-out forwards;
    opacity: 0;
}

/* Stagger the appearance of each card */
.grid-risk { animation-delay: 0.1s; }
.grid-main-top { animation-delay: 0.2s; }
.grid-alerts { animation-delay: 0.3s; }
.grid-chart { animation-delay: 0.4s; }

@keyframes slide-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>