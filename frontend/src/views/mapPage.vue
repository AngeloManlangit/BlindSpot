<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/theme-toggle/within.css'
// import { generateRiskReport } from '../../../backend/services/pdfReport';
import type { HazardRow, RiskReport, ThreeDayForecast, WeatherCondition, DayForecast, CellTower, BlindSpot, Recommendation } from '@/type/types'

import LogoDark from "@/assets/svgs/blindspot-logo-white.svg"
import LogoWhite from "@/assets/svgs/blindspot-logo-dark-gray.svg"
import ThemeToggleButton from '@/components/themeToggleButton.vue'
import mapHolder from '@/components/mapHolder.vue'

import PdfHeader from '@/components/pdf/PdfHeader.vue'
import PdfLocation from '@/components/pdf/PdfLocation.vue'
import PdfRiskFactors from '@/components/pdf/PdfRiskFactors.vue'
import PdfHazards from '@/components/pdf/PdfHazards.vue'
import PdfThreeDayForecast from '@/components/pdf/PdfThreeDayForecast.vue'
import PdfCurrentWeather from '@/components/pdf/PdfCurrentWeather.vue'
import PdfWeekForecast from '@/components/pdf/PdfWeekForecast.vue'
import PdfCellTowers from '@/components/pdf/PdfCellTowers.vue'
import PdfBlindSpots from '@/components/pdf/PdfBlindSpots.vue'
import PdfRecommendations from '@/components/pdf/PdfRecommendations.vue'
import PdfMethodology from '@/components/pdf/PdfMethodology.vue'
import PdfDataSources from '@/components/pdf/PdfDataSources.vue'
import PdfFooter from '@/components/pdf/PdfFooter.vue'

// State

const isDark = ref(true)
const router = useRouter()
const pdfLogoDataUrl = ref('')
const pdfLogoSvg = ref('')      
const reportTemplate = ref<HTMLElement | null>(null)

// Reactive report data,,, populate from API / map click 
const reportData = ref<RiskReport>({
  location: '',
  city: '',
  region: '',
  coordinates: '',
  elevation: '',
  population: '',
  generatedAt: '',
  confidence: 0,
  overallRisk: 0,
  overallLevel: '',
  hazard: 0,
  exposure: 0,
  vulnerability: 0,
  capacity: 0,
  hazards: [],
  threeDayForecast: [],
  currentWeather: {
    temperature: '',
    description: '',
    humidity: '',
    windSpeed: '',
    visibility: '',
  },
  weekForecast: [],
  cellTowers: [],
  blindSpots: [],
  recommendations: [],
  methodology: '',
  dataSources: [],
})

import { hazardLevelColor } from '@/utils/hazardLevelColor'

const formatNow = (): string => {
  return new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

onMounted(async () => {
  try {
    const res = await fetch('/blindspot-logo-white.svg')
    const svg = await res.text()
    pdfLogoSvg.value = svg

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    pdfLogoDataUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    console.warn('Could not load PDF logo:', e)
  }
})

const openDocumentation = () => {
  window.open('https://github.com/AngeloManlangit/BlindSpot', '_blank')
}

/*
const downloadPDF = async () => {
  if (!reportTemplate.value) return
  reportData.value.generatedAt = formatNow()

  await generateRiskReport(
    reportTemplate.value,
    `BlindSpot_Risk_Report_${reportData.value.location.replace(/\s+/g, '_')}`
  )
}
*/
</script>

<template>
  <main :class="['main-container', isDark ? 'dark' : 'light']">
    <div class="bg-layer">
      <div class="gradient-overlay"></div>
      <div class="map-container"><mapHolder/></div>
      <div class="typhoon-container">
        <div v-for="n in 3" :key="n" :class="['typhoon-blob', `delay-${(n-1)*15}`]"></div>
      </div>
      <div v-if="isDark" class="grid-overlay"></div>
    </div>

    <div class="top-actions">
      <ThemeToggleButton :is-dark="isDark" @toggle="isDark = !isDark" />
      <button @click="openDocumentation" class="icon-btn">
        <img src="/github-icon.svg" alt="GitHub" :class="{ 'invert': isDark }" />
        <span class="tooltip">Documentation</span>
      </button>
    </div>

    <div class="logo-wrapper">
      <img :src="isDark ? LogoDark : LogoWhite" alt="BlindSpotPH Logo" :class="['logo', isDark ? 'logo-glow' : 'logo-shadow']" />
    </div>

    <!--
    <div class="central-card-wrapper">
      <div class="card">
        <button @click="downloadPDF" class="submit-btn">
          Generate Risk Report
        </button>
      </div>
    </div>
    -->
    
    <!-- PDF Template -->
    <div style="position: absolute; left: -9999px; top: 0;">
      <div ref="reportTemplate" style="background: white; color: #0f172a; width: 800px; padding: 50px; font-family: 'Helvetica', sans-serif;">
        <PdfHeader :logo-svg="pdfLogoSvg" :logo-url="pdfLogoDataUrl" :data="reportData" />
        <PdfLocation :data="reportData" />
        <div
          :style="`background: ${hazardLevelColor(reportData.overallLevel)}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;`"
        >
          <h3 style="margin: 0;">
            OVERALL RISK: {{ reportData.overallRisk }}/100 — {{ reportData.overallLevel }}
          </h3>
          <p style="margin-top: 5px; font-size: 11px;">
            Risk = (Hazard × Exposure × Vulnerability) / Capacity
          </p>
        </div>
        <PdfRiskFactors :data="reportData" />
        <PdfHazards :data="reportData" />
        <PdfThreeDayForecast :data="reportData" />
        <PdfCurrentWeather :data="reportData" />
        <PdfWeekForecast :data="reportData" />
        <PdfCellTowers :data="reportData" />
        <PdfBlindSpots :data="reportData" />
        <PdfRecommendations :data="reportData" />
        <PdfMethodology :data="reportData" />
        <PdfDataSources :data="reportData" />
        <PdfFooter />
      </div>
    </div>
  </main>
</template>

<style scoped>
/* --- THEME VARIABLES --- */
.main-container.dark {
  --bg-main: #020617;
  --text-main: #ffffff;
  --text-muted: #94a3b8;
  --card-bg: rgba(15, 23, 42, 0.4);
  --card-border: rgba(255, 255, 255, 0.1);
  --input-bg: rgba(2, 6, 23, 0.5);
  --accent: #3b82f6;
  --grad-start: #020617;
  --grad-mid: #172554;
  --grad-end: #0f172a;
  --blob-opacity: 0.2;
}

.main-container.light {
  --bg-main: #f8fafc;
  --text-main: #0f172a;
  --text-muted: #475569;
  --card-bg: rgba(255, 255, 255, 0.8);
  --card-border: #ffffff;
  --input-bg: #f8fafc;
  --accent: #2563eb;
  --grad-start: #ffffff;
  --grad-mid: #eff6ff;
  --grad-end: #f1f5f9;
  --blob-opacity: 0.4;
}

/* --- CORE LAYOUT --- */
.main-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  width: 100vw;
  padding: 24px;
  overflow: hidden;
  transition: background-color 0.2s;
  background-color: var(--bg-main);
  color: var(--text-main);
  box-sizing: border-box;
}

.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, var(--grad-start), var(--grad-mid), var(--grad-end));
  z-index: -20;
}

.map-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  z-index: 1;
  pointer-events: auto;
}

.map-container > * {
  width: 100%;
  height: 100%;
}

/* --- TOP ACTION BUTTONS --- */
.top-actions {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.icon-btn img { width: 24px; height: 24px; }
.invert { filter: invert(1); }

.tooltip {
  position: absolute;
  right: 100%;
  margin-right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 8px;
  background: #1e293b;
  color: white;
  font-size: 10px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  white-space: nowrap;
  pointer-events: none;
  text-transform: uppercase;
}

.icon-btn:hover .tooltip { opacity: 1; }
.icon-btn:hover { transform: scale(1.05); }

/* --- LOGO --- */
.logo-wrapper {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 60;
}
.logo { width: 130px; transition: all 0.2s; }
@media (min-width: 768px) { .logo { width: 100px; } }

.logo-glow { filter: drop-shadow(0 0 20px rgba(37,99,235,0.2)); }
.logo-shadow { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }

/* --- CENTRAL CARD & BUTTON --- */
.central-card-wrapper {
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.card {
  backdrop-filter: blur(24px);
  border-radius: 32px;
  padding: 40px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.5rem;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.description {
  font-family: 'Judson', serif;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 32px;
  font-size: 1.1rem;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Outfit', sans-serif;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
}

.submit-btn:active { transform: scale(0.98); }
</style>
