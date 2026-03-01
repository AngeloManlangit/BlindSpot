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
  Filler
} from 'chart.js';
import type { ThreeDayForecast } from '@/type/types';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

const props = defineProps<{
    forecast: ThreeDayForecast[]
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

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
    },
    scales: {
        y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
        },
        x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
        }
    }
};
</script>

<template>
    <div class="timeline-card">
        <div class="card-header">
            <h3 class="title">Threat Timeline — Wind & Temperature</h3>
        </div>
        <div class="chart-container">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>

<style scoped>
.timeline-card {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 0.875rem;
    color: #94a3b8;
    margin-bottom: 16px;
}

.chart-container {
    flex: 1;
    min-height: 200px;
}
</style>