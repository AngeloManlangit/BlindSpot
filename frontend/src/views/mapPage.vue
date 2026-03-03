<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import '@/assets/theme-toggle/within.css'
import ThemeToggleButton from '@/components/themeToggleButton.vue'
import mapHolder from '@/components/mapHolder.vue'
import { Info, Layers, Map, ChartColumn, Search } from 'lucide-vue-next'

// Gemini AI + Risk Cards + PDF
import { useGemini } from '@/utils/useGemini'
import VulnerabilityGauge from '@/components/riskCards/VulnerabilityGauge.vue'
import EtrCard from '@/components/riskCards/EtrCard.vue'
import AdvisoriesCard from '@/components/riskCards/AdvisoriesCard.vue'
import ExportPdf from '@/components/pdf/ExportPdf.vue'

//static logo
import LogoDark from "@/assets/svgs/cyclone_dark.svg"
import LogoWhite from "@/assets/svgs/cyclone_light.svg"

//gifs
import LogoDS from "@/assets/svgs/spin_dark.gif"
import LogoWS from "@/assets/svgs/spin_white.gif"

const isDark = ref(true)
const location = ref('')
const hover = ref(false)
const panelopen = ref(false)
const showHeatmap = ref(false)
const showTowers = ref(false)

//map things here 
const mapStyles = [ 'Normal', 'Streets', 'Satellite']
const mapindex = ref(0)
const mapStyle = computed(() => mapStyles[mapindex.value] )
const changeMapStyle = () => {
  mapindex.value = (mapindex.value + 1) % mapStyles.length
}

import type { RiskReport } from '@/type/types'

// State
const router = useRouter()

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

// --- Gemini AI composable ---
const {
  analysis,
  loading: geminiLoading,
  error: geminiError,
  isOffline,
  lastUpdated,
  fetchWeatherAnalysis,
  loadFromCache,
  clearCache,
} = useGemini()

const geminiActive = ref(false)

/**
 * Single on-demand Gemini fetch. Clears stale error cache first so
 * the API is always called when the user explicitly presses the button.
 */
const fetchRealTimeData = async () => {
  geminiActive.value = true
  clearCache() // wipe old/stale data so cooldown doesn't block a fresh call
  await fetchWeatherAnalysis(
    reportData.value,                          // infrastructure data
    reportData.value.currentWeather,           // weather data
    JSON.stringify(reportData.value.hazards)   // historical data
  )
}

const home = () => router.push({ name: 'Landing' })
onMounted(() => {
  // Load cached Gemini data for instant UI
  const cached = loadFromCache()
  if (cached) geminiActive.value = true
})

const openDocumentation = () => {
  window.open('https://github.com/AngeloManlangit/BlindSpot', '_blank')
}

const toggleHeatmap = () => { showHeatmap.value = !showHeatmap.value }

// search bar
const handleSearch = async () => {
  console.log("poop, this needs to be done");
}

// for the risk statistics
import riskStatistics from '@/components/riskStatistics.vue'

const openStats = ref(false)

const toggleStats = () => {
  openStats.value = !openStats.value
}
</script>

<template>
  <main :class="['main-container', isDark ? 'dark' : 'light']">

    <!-- Background & Map -->
    <div class="bg-layer">
      <div class="gradient-overlay"></div>
      <div class="map-container">
        <mapHolder :curr-style="mapStyles[mapindex] ?? 'Normal'" :is-dark="isDark"/>
      </div>
      <div v-if="isDark" class="grid-overlay"></div>
     
    </div>

    <!-- Logo & Actions -->
    <div class="logo-container" @mouseenter="hover = true" @mouseleave="hover = false">
      <div class="logo-wrapper">
        <img
          :src="hover ? (isDark ? LogoDS : LogoWS) : (isDark ? LogoDark : LogoWhite)"
          alt="BlindSpotPH Logo"
          @click="home"
          :class="['logo', isDark ? 'logo-glow' : 'logo-shadow']"
        />
      </div>

      <div class="top-actions">
        <ThemeToggleButton :is-dark="isDark" @toggle="isDark = !isDark" />
        <button @click="home" class="icon-btn" title="Info">
          <Info :size="18" color="#eacd3e" :stroke-width="2.5" />
        </button>
        <button @click="toggleStats" class="icon-btn">
          <ChartColumn color="#eacd3e" :stroke-width="3" />
        </button>
        <button @click="openDocumentation" class="icon-btn" title="GitHub">
          <img src="/github-icon.svg" alt="GitHub" :class="{ 'invert': isDark }" />
        </button>
        
      </div>
    </div>

    <!-- Search etx-->
    <div class="search">
      <div class="search-wrapper">
        <Search class="search-icon"/>
        <input v-model="location" type="text" placeholder="Search location..." class="search-input" @keyup.enter="handleSearch"/>
      </div>

      <div class="divider"></div>

      <button :class="['toggles', { active: showHeatmap }]" @click="toggleHeatmap">
        <Layers :size="15" :stroke-width="2" />
        <span>Heatmap</span>
      </button>

      <button :class="['toggles', { active: mapStyle === 'satellite' }]" @click="changeMapStyle">
        <Map :size="15" :stroke-width="2" />
        <span>{{ mapStyle }}</span>
      </button>

      
    </div>

    <!-- Right Panel -->
    <div :class="['right-panel', panelopen ? 'open' : 'closed']">
      <div class="panel-header">
        <span class="panel-title">Analysis</span>
        <span class="panel-subtitle">{{ location || 'Risk Overview' }}</span>
      </div>

      <div class="panel-body">
        <!-- Before Gemini is activated -->
        <div v-if="!geminiActive && !analysis" class="panel-placeholder">
          <p>Search a location to begin analysis.</p>
          <button class="fetch-btn" @click="fetchRealTimeData">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Fetch Real-time Data
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-else-if="geminiLoading && !analysis" class="skeleton-container">
          <div class="skeleton-card">
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-circle"></div>
            <div class="skeleton-line w-60"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton-line w-30"></div>
            <div class="skeleton-line w-full"></div>
            <div class="skeleton-line w-80"></div>
          </div>
        </div>

        <!-- Live analysis cards -->
        <div v-else-if="analysis" class="cards-container">
          <VulnerabilityGauge
            :score="analysis.vulnerabilityScore ?? 0"
            :system-status="analysis.systemStatus ?? 'Offline'"
          />

          <EtrCard
            :etr="analysis.etr ?? ''"
            :offline-brief="analysis.offlineBrief ?? ''"
            :last-updated="lastUpdated"
            :is-stale="isOffline"
          />

          <AdvisoriesCard
            :advisories="analysis.advisories ?? { work: '—', commute: '—', school: '—' }"
            :critical-action="analysis.criticalAction ?? ''"
          />

          <!-- Refresh button when active -->
          <button class="fetch-btn secondary" @click="fetchRealTimeData" :disabled="geminiLoading">
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2"
              :class="{ spinning: geminiLoading }"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            {{ geminiLoading ? 'Refreshing...' : 'Refresh Real-time Data' }}
          </button>

          <!-- PDF export via ExportPdf component -->
          <ExportPdf :analysis="analysis" :location="location" />
        </div>
      </div>

      <!-- Error banner -->
      <div v-if="geminiError" class="error-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ geminiError }} — using cached data</span>
      </div>

      <button class="toggle-btn" :class="{ rotated: !panelopen }" @click="panelopen = !panelopen">
        ❯
      </button>
    </div>
    
  </main>

  <!-- Stats overlay -->
  <Transition name="fade">
    <div v-if="openStats" class="stats-overlay">
        <riskStatistics :report="reportData" :is-dark="isDark" @close="openStats = false" />
    </div>
  </Transition>
  
  
</template>

<style scoped>

/* --- THEME VARIABLES --- */
.main-container.dark {
  --bg: #050c18;
  --text: #e8edf5;
  --muted: #f4f4f4;
  --glass-bg: rgba(8, 18, 38, 0.55);
  --glass-border: rgba(255, 255, 255, 0.07);
  --glass-shine: rgba(255, 255, 255, 0.04);
  --input-bg: rgba(5, 12, 30, 0.6);
  --accent: #e6eaf0;
  --accent-glow: rgba(59, 130, 246, 0.25);
  --gold: #eacd3e;
  --pill-active-bg: rgba(59, 130, 246, 0.2);
  --pill-active-border: rgba(59, 130, 246, 0.5);
  --grad-a: #050c18;
  --grad-b: #0d1f3c;
  --grad-c: #091428;
}

.main-container.light {
  --bg: #f0f4fa;
  --text: #0f172a;
  --muted: #64748b;
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-border: rgba(0, 0, 0, 0.06);
  --glass-shine: rgba(255, 255, 255, 0.8);
  --input-bg: rgba(255, 255, 255, 0.7);
  --accent: #2563eb;
  --accent-glow: rgba(37, 99, 235, 0.15);
  --gold: #b8970e;
  --pill-active-bg: rgba(37, 99, 235, 0.1);
  --pill-active-border: rgba(37, 99, 235, 0.4);
  --grad-a: #f0f4fa;
  --grad-b: #dbeafe;
  --grad-c: #e2e8f0;
}

* { box-sizing: border-box; }

/* --- CORE LAYOUT --- */
.main-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  width: 100vw;
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
}

.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.025;
  background-image:
    linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px);
  background-size: 48px 48px;
}


.map-container {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: auto;
}

.map-container > * {
  width: 100%;
  height: 100%;
}


.logo-container {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-wrapper {
  position: relative;
  z-index: 60;
}

.logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  display: block;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-glow {
  filter: drop-shadow(0 0 24px rgba(59, 130, 246, 0.3)) drop-shadow(0 2px 8px rgba(0,0,0,0.4));
}

.logo-shadow {
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
}

/* --- TOP ACTION BUTTONS --- */
.top-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  position: relative;
  overflow: visible;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.logo-container:hover .top-actions {
  opacity: 1;
  pointer-events: auto;
}
 /*exit ni */
.logo-container .top-actions > *:nth-child(1) { 
  transition-delay: 0.24s; 
}

.logo-container .top-actions > *:nth-child(2) { 
  transition-delay: 0.20s; 
}

.logo-container .top-actions > *:nth-child(3) { 
  transition-delay: 0.12s; 
}

.logo-container .top-actions > *:nth-child(4) { 
  transition-delay: 0.04s; 
}

.top-actions > * {
  opacity: 0;
  transform: translateY(-24px);
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
}

/* entaramce */
.logo-container:hover .top-actions > *:nth-child(1) {
  transition-delay: 0.05s;
  opacity: 1;
  transform: translateY(0);
}

.logo-container:hover .top-actions > *:nth-child(2) {
  transition-delay: 0.15s;
  opacity: 1;
  transform: translateY(0);
}

.logo-container:hover .top-actions > *:nth-child(3) {
  transition-delay: 0.25s;
  opacity: 1;
  transform: translateY(0);
}
.logo-container:hover .top-actions > *:nth-child(4) {
  transition-delay: 0.35s;
  opacity: 1;
  transform: translateY(0);
}

.icon-btn {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 var(--glass-shine);
}

.icon-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent), 0 4px 20px var(--accent-glow), inset 0 1px 0 var(--glass-shine);
  transform: translateY(-1px);
}

.icon-btn img {
  width: 18px;
  height: 18px;
}

.invert { filter: invert(1); }


.search {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 6px 8px 6px 6px;
  box-shadow:
    0 8px 32px rgba(0,0,0,0.2),
    0 2px 8px rgba(0,0,0,0.1),
    inset 0 1px 0 var(--glass-shine);
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--muted);
  pointer-events: none;
  z-index: 1;
  width: 18px;
  height: 18px;
}

.search-input {
  width: 420px;
  padding: 12px 16px 12px 40px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: var(--input-bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  outline: none;
  transition: all 0.25s ease;
}

.search-input::placeholder {
  color: var(--muted);
  font-style: italic;
}

.search-input:focus {
  border-color: var(--accent);
  background: var(--input-bg);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.divider {
  width: 1px;
  height: 28px;
  background: var(--glass-border);
  margin: 0 4px;
  flex-shrink: 0;
}

.toggles {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--muted);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toggles:hover {
  color: var(--text);
  border-color: rgba(255,255,255,0.15);
  background: var(--glass-shine);
}

.toggles.active {
  color: var(--accent);
  border-color: var(--pill-active-border);
  background: var(--pill-active-bg);
  box-shadow: 0 0 12px var(--accent-glow);
}

.right-panel {
  position: fixed;
  top: 55%;
  right: 24px;
  width: 380px;
  height: 78%;
  border-radius: 28px;
  background: var(--glass-bg);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border: 1px solid var(--glass-border);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow:
    0 24px 80px rgba(0,0,0,0.35),
    0 4px 16px rgba(0,0,0,0.15),
    inset 0 1px 0 var(--glass-shine);
  z-index: 100;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.right-panel.closed {
  transform: translateX(calc(100% + 32px)) translateY(-50%);
}

.right-panel.open {
  transform: translateX(0) translateY(-50%);
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.panel-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.panel-subtitle {
  font-size: 0.78rem;
  color: var(--muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.panel-body::-webkit-scrollbar { width: 4px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }
.panel-body::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }

.panel-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--muted);
  text-align: center;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 8px;
}

.fetch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
  border: 1px solid rgba(30, 144, 255, 0.3);
  background: linear-gradient(135deg, rgba(30, 144, 255, 0.18), rgba(0, 206, 209, 0.1));
  color: rgba(255, 255, 255, 0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.fetch-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(30, 144, 255, 0.3), rgba(0, 206, 209, 0.2));
  border-color: rgba(30, 144, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(30, 144, 255, 0.15);
}

.fetch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fetch-btn.secondary {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  padding: 10px 16px;
}

.fetch-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

/* Skeleton loading */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-circle {
  width: 120px;
  height: 70px;
  margin: 8px auto;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }
.w-full { width: 100%; }

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 165, 2, 0.08);
  border: 1px solid rgba(255, 165, 2, 0.15);
  border-radius: 12px;
  color: #ffa502;
  font-size: 12px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.toggle-btn {
  position: absolute;
  top: 50%;
  left: -30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 var(--glass-shine);
  transition: all 0.25s ease;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 4px 20px var(--accent-glow);
  transform: translateY(-50%);
}

.toggle-btn.rotated {
  transform: translateY(-50%) rotate(180deg);
  left: -60px;
}

/*  Risk Statistics  */
.stats-overlay {
  position: absolute;
  overflow: hidden;
  z-index: 70;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .stats-overlay {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    margin-top: 80px;
    padding: 0 12px;
  }
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
</style>