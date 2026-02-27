<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/theme-toggle/within.css'

// Syncing your isDark ref with the layout logic
const isDark = ref(true)
const location = ref('')
const router = useRouter()

const handleSearch = () => {
  if (!location.value) return
  console.log("Checking risk for:", location.value)
}
const home = () => {
  router.push({ name: 'Landing' })
}
const openDocumentation = () => {
  window.open('https://github.com/AngeloManlangit/BlindSpot', '_blank')
}
const hover = ref(false)
const panelopen = ref(false)
import LogoDark from "@/assets/svgs/cyclone_dark.svg"
import LogoWhite from "@/assets/svgs/cyclone_light.svg"

import LogoDS from "@/assets/svgs/spin_dark.gif"
import LogoWS from "@/assets/svgs/spin_white.gif"

import ThemeToggleButton from '@/components/themeToggleButton.vue'
import mapHolder from '@/components/mapHolder.vue'
</script>

<template>
  <main :class="['main-container', isDark ? 'dark' : 'light']">
    <div class="bg-layer">
      <div class="gradient-overlay"></div>

      <div class="map-container">
        <mapHolder/>
      </div>

      <div v-if="isDark" class="grid-overlay"></div>
    </div>
    <div class="logo-container">
  <div class="logo-wrapper">
    <img
      :src="hover ? (isDark ? LogoDS : LogoWS) : (isDark ? LogoDark : LogoWhite)" 
      alt="BlindSpotPH Logo"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      @click="home"
      :class="['logo', isDark ? 'logo-glow' : 'logo-shadow']"
    />
  </div>

  <div class="top-actions">
    <ThemeToggleButton :is-dark="isDark" @toggle="isDark = !isDark" />

    <button @click="openDocumentation" class="icon-btn">
      <img src="/github-icon.svg" alt="GitHub" :class="{ 'invert': isDark }" />
      
    </button>
  </div>
</div>
    <div :class="['right-panel', panelopen ? 'open' : 'closed']"> 
      <button>  Download Report </button> 
      <button class="toggle-btn" :style="{ transform: panelopen ? 'translateY(-50%)' : 'translateY(-50%) rotate(180deg)' }" @click="panelopen = !panelopen">
  ❮
</button>
    </div>
  </main>
</template>

<style scoped>
/* Theme Variables */
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


.right-panel {
  position: absolute;
  top: 0;
  right: 0;

  width: 400px;
  height: 100%;

  background: linear-gradient(
    to bottom,
    #13233a,
    #0f1b2d
  );

  backdrop-filter: blur(20px);

  border-left: 1px solid rgba(255,255,255,0.05);

  padding: 30px;

  display: flex;
  flex-direction: column;

  box-shadow: -20px 0 60px rgba(0,0,0,0.5);

  z-index: 100;
  transition: transform 0.4s ease;
}

.right-panel.closed { 
  transform: translateX(calc(100% - 40px)); 
}

.right-panel.open { 
  transform: translateX(0); 
}

/* Layout */
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
.logo-container {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 60;
}

.top-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;

  opacity: 0;
  transform: translateY(-20px);
  visibility: hidden;
  pointer-events: none;

  transition: 
    opacity 0.35s ease,
    transform 0.35s ease,
    visibility 0.35s ease;
}
.top-actions .custom-toggle-btn {
  margin-top:100px;
}
.logo-container:hover .top-actions {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  pointer-events: auto;
}

.map-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  z-index: 1;
  pointer-events:  auto;
}
.map-container > * {
  width: 100%;
  height: 100%;
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

/* UI Elements */

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


.icon-btn:hover { opacity: 1; }
.custom-toggle-btn:hover, .icon-btn:hover { transform: scale(1.05); }

/* Main Card */
.logo-wrapper { 
  position: absolute;
  top: 12px;
  left: 10px;  
  z-index: 60;  
  display: flex;
  justify-content: center;
}
.logo { 
  width: 90px; 
  height: 90px;
  object-fit: contain;
  transition: transform 0.2s ease; 
}

@media (min-width: 768px) { .logo { width: 70px; } }

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
.toggle-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  width: 40px;
  height: 40px;

  border-radius: 8px;
  border: none;

  background: #1e293b;
  color: white;
  font-size: 18px;
  cursor: pointer;

  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #2563eb;
  transform: translateY(-50%) scale(1.05);
}


.toggle-btn.rotated {
  transform: translateY(-50%) rotate(180deg);
}
</style>