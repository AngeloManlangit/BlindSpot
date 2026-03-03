<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import '@/assets/theme-toggle/within.css'
import ThemeToggleButton from '@/components/themeToggleButton.vue'
import mapHolder from '@/components/mapHolder.vue'
import { Info, Layers, Map, ChartColumn, Search, MapPin } from 'lucide-vue-next'

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
const riskRadius = ref(1.5) // default: 1.5km

//map things here 
const mapStyles = [ 'Normal', 'Streets', 'Satellite']
const mapindex = ref(0)
const mapStyle = computed(() => mapStyles[mapindex.value] )
const changeMapStyle = () => {
  mapindex.value = (mapindex.value + 1) % mapStyles.length
}

import { generateRiskReport } from '../../../backend/services/pdfReport';
import type { HazardRow, RiskReport, ThreeDayForecast, WeatherCondition, DayForecast, CellTower, BlindSpot, Recommendation } from '@/type/types'

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
const router = useRouter()
const route = useRoute()
const pdfLogoDataUrl = ref('')
const pdfLogoSvg = ref('')      
const reportTemplate = ref<HTMLElement | null>(null)

// Target location for the map
const targetLocation = ref<{ lng: number; lat: number; name: string } | null>(null)

const fetchRiskReport = async (loc: { lng: number; lat: number; name: string }) => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const res = await fetch(
      `${baseUrl}/api/risk?lat=${encodeURIComponent(String(loc.lat))}&lng=${encodeURIComponent(String(loc.lng))}&location=${encodeURIComponent(loc.name)}`
    )
    if (!res.ok) throw new Error(`Risk API ${res.status}`)
    const data = (await res.json()) as RiskReport
    reportData.value = data
  } catch (e) {
    console.warn('Failed to fetch risk report:', e)
  }
}

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

const legendLevels = [
  { key: 'LOW', label: 'Low', color: hazardLevelColor('LOW') },
  { key: 'GUARDED', label: 'Guarded', color: hazardLevelColor('GUARDED') },
  { key: 'ELEVATED', label: 'Elevated', color: hazardLevelColor('ELEVATED') },
  { key: 'HIGH', label: 'High', color: hazardLevelColor('HIGH') },
  { key: 'SEVERE', label: 'Severe', color: hazardLevelColor('SEVERE') },
] as const

const formatNow = (): string => {
  return new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const home = () => router.push({ name: 'Landing' })

type GeocodedLocation = { lng: number; lat: number; name: string; bbox?: [number, number, number, number] }

// Geocode a location string to [lng, lat] (+ bbox when available) using Mapbox
const geocodeLocation = async (query: string): Promise<GeocodedLocation | null> => {
  try {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    const encoded = encodeURIComponent(query)
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&limit=1&types=place,locality,neighborhood,district,region`
    )
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null
    const [lng, lat] = feature.center
    return { lng, lat, name: feature.place_name }
  } catch (e) {
    console.warn('Geocoding failed:', e)
    return null
  }
}

onMounted(async () => {
  // Load PDF logo
  try {
    const res = await fetch('/blindspot-logo-white.svg')
    const svg = await res.text()
    pdfLogoSvg.value = svg
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    pdfLogoDataUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    console.warn('Could not load PDF logo:', e)
  }

  // Read location from route query and fly to it
  const queryLocation = route.query.location as string | undefined
  if (queryLocation) {
    location.value = queryLocation
    const coords = await geocodeLocation(queryLocation)
    if (coords) {
      targetLocation.value = coords
      reportData.value.location = coords.name
      await fetchRiskReport(coords)
    }
  }
})

const openDocumentation = () => {
  window.open('https://github.com/AngeloManlangit/BlindSpot', '_blank')
}

const toggleHeatmap = () => { showHeatmap.value = !showHeatmap.value }

const downloadPDF = async () => {
  if (!reportTemplate.value) return
  reportData.value.generatedAt = formatNow()

  await generateRiskReport(
    reportTemplate.value,
    `BlindSpot_Risk_Report_${reportData.value.location.replace(/\s+/g, '_')}`
  )
}

// --- Autocomplete ---
const suggestions = ref<{ place_name: string }[]>([])
const showSuggestions = ref(false)
let debounceTimer: ReturnType<typeof setTimeout>

const fetchSuggestions = async (query: string) => {
  if (query.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  try {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    const encoded = encodeURIComponent(query)
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&limit=4&types=place,locality,neighborhood,district,region`
    )
    const data = await res.json()
    suggestions.value = data.features ?? []
    showSuggestions.value = suggestions.value.length > 0
  } catch {
    suggestions.value = []
  }
}

const onInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchSuggestions(location.value), 300)
}

const selectSuggestion = async (place: { place_name: string }) => {
  location.value = place.place_name
  suggestions.value = []
  showSuggestions.value = false
  await handleSearch()
}

const onBlur = () => {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

// search bar — geocodes the new query and flies the map
const handleSearch = async () => {
  const query = location.value.trim()
  if (!query) return

  suggestions.value = []
  showSuggestions.value = false

  const coords = await geocodeLocation(query)
  if (coords) {
    targetLocation.value = coords
    reportData.value.location = coords.name
    router.replace({ name: 'Map', query: { location: query } })
    await fetchRiskReport(coords)
  }
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
        <mapHolder
          :curr-style="mapStyles[mapindex] ?? 'Normal'"
          :is-dark="isDark"
          :target-location="targetLocation"
          :radius-km="riskRadius"
          :show-risk="showHeatmap"
          :risk-level="reportData.overallLevel"
        />
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

    <!-- Risk legend -->
    <div class="risk-legend">
      <div class="risk-legend-title">Risk Levels</div>
      <div
        v-for="lvl in legendLevels"
        :key="lvl.key"
        class="risk-legend-row"
      >
        <span class="risk-legend-swatch" :style="{ background: lvl.color }" />
        <span class="risk-legend-label">{{ lvl.label }}</span>
      </div>
    </div>

    <!-- Search bar -->
    <div class="search">
      <div class="search-wrapper">
        <Search class="search-icon"/>
        <div class="input-autocomplete">
          <input
            v-model="location"
            type="text"
            placeholder="Search location..."
            class="search-input"
            @keyup.enter="handleSearch"
            @input="onInput"
            @blur="onBlur"
            autocomplete="off"
          />
          <div v-if="showSuggestions" class="suggestions">
            <div
              v-for="s in suggestions"
              :key="s.place_name"
              class="suggestion-item"
              @mousedown.prevent="selectSuggestion(s)"
            >
              {{ s.place_name }}
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <button :class="['toggles', { active: showHeatmap }]" @click="toggleHeatmap">
        <MapPin :size="15" :stroke-width="2" />
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
        <span class="panel-subtitle">Risk Overview</span>
      </div>
      <div class="panel-body">
        <p v-if="!targetLocation">Search a location to begin analysis.</p>
        <p v-else>Analyzing: {{ reportData.location }}</p>
      </div>
      <button @click="downloadPDF" class="download-btn">Download Report</button>
      <button class="toggle-btn" :class="{ rotated: !panelopen }" @click="panelopen = !panelopen">
        ❯
      </button>
    </div>
    
    <!-- PDF Template -->
    <div style="position: absolute; left: -9999px; top: 0;">
      <div ref="reportTemplate" style="background: white; color: #0f172a; width: 800px; padding: 50px; font-family: 'Helvetica', sans-serif;">
        <PdfHeader :logo-svg="pdfLogoSvg" :logo-url="pdfLogoDataUrl" :data="reportData" />
        <PdfLocation :data="reportData" />
        <div
          :style="`background: ${hazardLevelColor(reportData.overallLevel)}; 
                  color: white; padding: 20px; border-radius: 8px; 
                  text-align: center; margin-bottom: 30px;`"
        >
          <h3 style="margin: 0;">
            OVERALL RISK: {{ reportData.overallRisk }}/100 — {{ reportData.overallLevel }}
          </h3>
          <p style="margin-top: 5px; font-size: 11px;">
            Risk = (Hazard × Vulnerability × Exposure) / Capacity
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


.risk-legend {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 50;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  box-shadow: 0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 var(--glass-shine);
  font-family: 'DM Sans', sans-serif;
}

.risk-legend-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  margin-bottom: 6px;
}

.risk-legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--text);
  margin-top: 2px;
}

.risk-legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(15,23,42,0.4);
}

.risk-legend-label {
  opacity: 0.9;
}


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

.input-autocomplete {
  position: relative;
  display: flex;
  flex-direction: column;
}

.suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 var(--glass-shine);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s;
}

.suggestion-item:hover {
  background: var(--pill-active-bg);
  color: var(--accent);
}

.suggestion-icon {
  font-size: 0.8rem;
  opacity: 0.7;
  flex-shrink: 0;
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
  align-items: center;
  justify-content: center;
}

.download-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px var(--accent-glow);
}

.download-btn:active {
  transform: scale(0.98);
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