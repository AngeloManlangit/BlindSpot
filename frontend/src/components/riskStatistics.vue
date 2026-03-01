<script lang="ts" setup>
import type { RiskReport } from '@/type/types.ts'; 

import RiskLevel from './riskCards/RiskLevel.vue';
import StatusCard from './riskCards/StatusCard.vue';
import ThreatTimeline from './riskCards/ThreatTimeline.vue';
import AlertCard from './riskCards/AlertCard.vue';

const props = defineProps<{
    report: RiskReport
}>();
</script>

<template>
    <div class="dark-background" @click.self="$emit('close')">
        
        <div class="popup-window">
            <div class="window-header">
                <h1 class="title paytone-one-regular">RISK RADAR</h1>
                <button class="close-x" @click="$emit('close')">&times;</button>
            </div>

            <div class="dashboard-body">

                <div class="stats-grid">
                <RiskLevel class="grid-sidebar" :report="report" />
                
                <div class="grid-main-top">
                    <StatusCard type="weather" :data="report.currentWeather" />
                    <StatusCard type="power" />
                    <StatusCard type="water" />
                    <StatusCard type="comms" />
                </div>

                <AlertCard class="grid-alerts" :spots="report.blindSpots" />
                <ThreatTimeline class="grid-chart" :forecast="report.threeDayForecast" />
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
}

.popup-window {
    width: 100%;
    max-width: 1500px;
    height: 90vh;
    background: #18183a7f; 
    border: 1px solid #ffffff3a; 
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
    color: white;
}

.close-x {
    position: absolute;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
}

/* Content Layout */
.dashboard-body {
    color: white;
    padding: 30px;
    padding-top: 0px;
    flex: 1;
    overflow-y: auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
    margin-top: 20px;
}

.grid-sidebar {
    grid-row: span 2;
}

.grid-main-top {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 2x2 grid for StatusCards */
    gap: 20px;
}

.stats-grid > * {
    animation: slide-up 0.6s ease-out forwards;
    opacity: 0;
}

/* Stagger the appearance of each card */
.grid-sidebar { animation-delay: 0.1s; }
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