<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/theme-toggle/within.css'
const isDark = ref(true)
const location = ref('')
const router = useRouter()
const handleSearch = () => {
  if (!location.value) return
  console.log("Checking risk for:", location.value)

  router.push({ name: 'Map', query: { location: location.value } })
}

const openDocumentation = () => {
  window.open('https://github.com/AngeloManlangit/BlindSpot', '_blank')
}

import LogoDark from "@/assets/svgs/blindspot-logo-white.svg"
import LogoWhite from "@/assets/svgs/blindspot-logo-dark-gray.svg"

import ThemeToggleButton from '@/components/themeToggleButton.vue'
</script>

<template>
  <main :class="['main-container', isDark ? 'dark' : 'light']">
    <div class="bg-layer">
      <div class="gradient-overlay"></div>

      <div class="map-container">
        <img 
          src="/ph.svg" 
          alt="PH Map"
          :class="['ph-map', isDark ? 'dark-map' : 'light-map']"
        />
      </div>

      <div class="typhoon-container">
        <div v-for="n in 3" :key="n"
          :class="['typhoon-blob', `delay-${(n-1)*15}`]"
        ></div>
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
      <img
        :src="isDark ? LogoDark : LogoWhite"
        alt="BlindSpotPH Logo"
        :class="['logo', isDark ? 'logo-glow' : 'logo-shadow']"
      />
    </div>

    <div class="card">
      <h1 class="title">Stay Ahead</h1>
      <p class="description">
        Keep critical power outages out of your blind spot. Stay prepared for potential outages and detect risks to your area's electricity before they cause disruption.
      </p>

      <div class="search-section">
        <div class="input-group">
          <label class="label">Enter your location</label>
          <input 
            v-model="location"
            type="text" 
            placeholder="e.g. Cebu City, Philippines"
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>

        <button @click="handleSearch" class="submit-btn">
          Check Risk
        </button>
      </div>
    </div>
  </main>
</template>

<style>

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #020617;
}
</style>

<style scoped>
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
  opacity: 0.1;
  z-index: -10;
}

.ph-map {
  height: 200%;
  width: auto;
  object-fit: contain;
  transition: all 0.2s;
  transform: scale(1.25);
}

.dark-map { filter: invert(1) brightness(2); }
.light-map { filter: grayscale(1); }

.typhoon-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.typhoon-blob {
  position: absolute;
  width: 850px;
  height: 500px;
  filter: blur(150px);
  background-color: var(--accent);
  opacity: var(--blob-opacity);
  border-radius: 40% 60% 70% 30% / 40% 40% 60% 60%;
  animation: typhoon-flow 40s linear infinite;
}

@keyframes typhoon-flow {
  0% { transform: translate(100vw, 80vh) rotate(0deg) scale(1); opacity: 0; }
  15% { opacity: 0.5; }
  85% { opacity: 0.5; }
  100% { transform: translate(-100vw, -80vh) rotate(180deg) scale(1.8); opacity: 0; }
}

.delay-15 { animation-delay: 15s; }
.delay-30 { animation-delay: 30s; }

.grid-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  filter: invert(1);
  background-image: radial-gradient(#fff 0.5px, transparent 0.5px);
  background-size: 40px 40px;
}

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
.custom-toggle-btn:hover, .icon-btn:hover { transform: scale(1.05); }

.logo-wrapper { margin-bottom: 24px; z-index: 10; }
.logo { width: 180px; transition: all 0.2s; }
@media (min-width: 768px) { .logo { width: 240px; } }

.logo-glow { filter: drop-shadow(0 0 20px rgba(37,99,235,0.2)); }
.logo-shadow { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }

.card {
  backdrop-filter: blur(24px);
  border-radius: 32px;
  padding: 40px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  z-index: 10;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.title { font-family: 'Outfit', sans-serif; font-size: 2.5rem; margin: 0 0 8px 0; font-weight: 700; }
.description { font-family: 'Judson', serif; color: var(--text-muted); line-height: 1.4; margin-bottom: 32px; font-size: 1.1rem; }

.search-section { width: 100%; max-width: 340px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.label { display: block; font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; text-align: left; color: var(--accent); margin-bottom: 10px; }

.search-input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: var(--input-bg);
  color: inherit;
  font-family: 'Judson', serif;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.dark .search-input { border-color: rgba(255,255,255,0.05); }
.dark .search-input:focus { border-color: #3b82f6; }
.light .search-input { border-color: #f1f5f9; }
.light .search-input:focus { border-color: #2563eb; background: white; }

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Outfit', sans-serif;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
.submit-btn:active { transform: scale(0.97); }
</style>