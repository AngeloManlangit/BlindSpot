<script lang="ts" setup>
import type { RiskReport } from '@/type/types.ts'; 

const props = defineProps<{
    report: RiskReport
}>();
</script>

<template>
    <div class="dark-background" @click.self="$emit('close')">
        
        <div class="popup-window">
            <div class="window-header">
                <div class="drag-handle"></div>
                <button class="close-x" @click="$emit('close')">&times;</button>
            </div>

            <div class="dashboard-body">
                <header class="body-header">
                <div class="title-meta">
                    <h1>Risk Radar</h1>
                </div>
                </header>

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
    backdrop-filter: blur(12px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.popup-window {
    width: 100%;
    max-width: 1200px;
    height: 90vh;
    background: #0f172a; 
    border: 2px solid #1e3a8a; 
    border-radius: 28px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.window-header {
    background: rgba(30, 41, 59, 0.7);
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.drag-handle {
    width: 180px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
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
    padding: 30px;
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

</style>