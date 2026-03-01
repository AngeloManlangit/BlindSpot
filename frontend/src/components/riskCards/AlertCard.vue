<script lang="ts" setup>
import type { BlindSpot } from '@/type/types.ts';

const props = defineProps<{
    spots: BlindSpot[]
}>();

// Helper to handle color coding based on severity level
const getSeverityClass = (severity: string) => {
    return {
        'severity-low': severity === 'LOW',
        'severity-medium': severity === 'MEDIUM',
        'severity-high': severity === 'HIGH'
    };
};
</script>

<template>
    <section class="alert-card">
        <div class="alert-header">
            <h2 class="title">Blind Spot Alerts</h2>
            <span v-if="spots.length > 0" class="badge">
                {{ spots.length }} detected
            </span>
        </div>

        <div class="alert-container">
            <div v-if="spots.length === 0" class="no-alerts">
                <p>No active blind spots detected in this area.</p>
            </div>

            <div 
                v-for="(spot, index) in spots" 
                :key="index" 
                class="alert-item"
                :class="getSeverityClass(spot.severity)"
            >
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <h3 class="alert-title">
                        {{ spot.issue }} 
                        <span class="severity-label">{{ spot.severity }}</span>
                    </h3>
                    <p class="alert-area">Detected in: {{ spot.area }}</p>
                    <a href="#" class="action-link">Prepare backup power sources.</a>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.alert-card {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
}

.alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.title {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
}

.badge {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
}

.alert-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: rgba(15, 23, 42, 0.6);
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    margin-bottom: 12px;
}

/* Severity Styling */
.severity-high { border-left-color: #ef4444; }
.severity-medium { border-left-color: #f59e0b; }
.severity-low { border-left-color: #10b981; }

.alert-icon { font-size: 1.2rem; }

.alert-title {
    margin: 0;
    font-size: 0.9rem;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 8px;
}

.severity-label {
    font-size: 0.65rem;
    color: #f59e0b;
    font-weight: bold;
}

.alert-area {
    margin: 4px 0;
    font-size: 0.8rem;
    color: #94a3b8;
}

.action-link {
    color: #3b82f6;
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 500;
}

.action-link:hover { text-decoration: underline; }

.no-alerts {
    text-align: center;
    padding: 20px;
    color: #475569;
    font-size: 0.85rem;
}
</style>