<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import type { ThreeDayForecast } from '@/type/types';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

const props = defineProps<{
    forecast: ThreeDayForecast[],
    isDark: boolean
}>();

const chartData = computed(() => ({
    labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
    datasets: [
        {
            label: 'Temperature',
            data: [27, 29, 31, 33, 31, 28], // Map from props.forecast in production
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0
        },
        {
            label: 'Wind Speed',
            data: [9, 12, 18, 25, 35, 15], // Map from props.forecast in production
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0
        }
    ]
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
    },
    scales: {
        y: {
        grid: { color: props.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'},
        ticks: { color: props.isDark ? '#94a3b8' : '#475569', font: { size: 10 } }
        },
        x: {
        grid: { display: false },
        ticks: { color: props.isDark ? '#94a3b8' : '#475569', font: { size: 10 } }
        }
    }
}));
</script>

<template>
    <div :class="['timeline-card', isDark ? 'dark' : 'light']">
        <div class="card-header">
            <h3 class="title">Threat Timeline — Wind & Temperature</h3>
        </div>
        <div class="chart-container">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>

<style scoped>
.timeline-card.dark {
  --text-main: #ffffff;
  --text-muted: #94a3b8;
  --card-bg: linear-gradient(to bottom, rgba(5, 22, 62, 0.49), rgba(11, 24, 52, 0.49));
  --card-border: rgba(255, 255, 255, 0.1);
}

.timeline-card.light {
  --text-main: #0f172a;
  --text-muted: #475569;
  --card-bg:  linear-gradient(to bottom, rgba(208, 231, 246, 0.656), rgba(255, 255, 255, 0.656));
  --card-border: #ffffff;
}

.timeline-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 16px;
}

.chart-container {
    flex: 1;
    min-height: 200px;
}
</style>