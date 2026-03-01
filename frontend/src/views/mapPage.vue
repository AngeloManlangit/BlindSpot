<script setup lang="ts">
import { ref,computed } from 'vue'
import { useRouter } from 'vue-router'

import '@/assets/theme-toggle/within.css'
import ThemeToggleButton from '@/components/themeToggleButton.vue'
import mapHolder from '@/components/mapHolder.vue'
import { Info, RadioTower, Layers, Map,ChartColumn, Search } from 'lucide-vue-next'

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
const mapStyles = [ 'Streets', 'Satellite', 'Dark', 'Light']
const mapindex = ref(0)
const mapStyle = computed(() => mapStyles[mapindex.value] )
const changeMapStyle = () => {
  mapindex.value = (mapindex.value + 1) % mapStyles.length
}

const router = useRouter()

const handleSearch = () => {
  if (!location.value) return
  console.log("Checking risk for:", location.value)
}

const home = () => router.push({ name: 'Landing' })

const openDocumentation = () => {
  window.open('https://github.com/AngeloManlangit/BlindSpot', '_blank')
}

const toggleHeatmap = () => { showHeatmap.value = !showHeatmap.value }

</script>

<template>
  <main :class="['main-container', isDark ? 'dark' : 'light']">

    <!-- Background & Map -->
    <div class="bg-layer">
      <div class="gradient-overlay"></div>
      <div class="map-container">
        <mapHolder />
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
        <button class="icon-btn">
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
        <span class="panel-subtitle">Risk Overview</span>
      </div>
      <div class="panel-body">
        <p >Search a location to begin analysis.</p>
      </div>
      <button class="download-btn">Download Report</button>
      <button class="toggle-btn" :class="{ rotated: !panelopen }" @click="panelopen = !panelopen">
        ❮
      </button>
    </div>

  </main>
</template>

<style scoped>

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
  align-items: center;
  justify-content: center;
}



.download-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: var(--accent);
  color: white;
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px var(--accent-glow);
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
  left: -22px;
  width: 44px;
  height: 44px;
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
}
</style>