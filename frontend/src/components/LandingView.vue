<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {Sun} from 'lucide-vue-next'
const isDarkMode = ref(true)
const location = ref('')

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}

const handleSearch = () => {
  if (!location.value) return
  console.log("Checking risk for:", location.value)
}

const openDocumentation = () => {
  window.open('https://github.com/AngeloManlangit/BlindSpot', '_blank')
}

// images
import LogoDark from "@/assets/svgs/blindspot-logo-white.svg"
import LogoLight from "@/assets/svgs/blindspot-logo-dark-gray.svg"
</script>

<template>
  <main :class="{ 'dark-mode': isDarkMode }">
    <div class="bg-container">
      <div class="bg-gradient"></div>
      <div class="ph-map-overlay">
        <img src="/ph.svg" alt="PH Map" class="ph-map" />
      </div>
      <div class="typhoon-tracks">
        <div v-for="n in 3" :key="n" :class="['typhoon-blur', `delay-${(n-1)*15}`]"></div>
      </div>
      <div class="dots-pattern"></div>
    </div>

    <div class="actions-wrapper">
      <button @click="toggleTheme" class="icon-btn theme-toggle" type="button">
        <svg viewBox="0 0 32 32" :style="{ transform: isDarkMode ? 'rotate(40deg)' : 'rotate(0deg)' }">
          </svg>
          <img src="/github-icon.svg" alt="GitHub" class="github-icon" />
        <span class="tooltip">Toggle {{ isDarkMode ? 'Light' : 'Dark' }} Mode</span>
      </button>

      <button @click="openDocumentation" class="icon-btn">
        <img src="/github-icon.svg" alt="GitHub" class="github-icon" />
        <span class="tooltip">Documentation</span>
      </button>
    </div>

    <div class="logo-container">
      <img :src="isDarkMode ? LogoDark : LogoLight" class="logo" alt="Logo" />
    </div>

    <section class="card">
      <h1 class="title">Stay Ahead</h1>
      <p class="description">
        Keep critical power outages out of your blind spot. Stay prepared for potential outages...
      </p>

      <div class="search-form">
        <div class="input-group">
          <label class="input-label">Enter your location</label>
          <input 
            v-model="location"
            type="text" 
            placeholder="e.g. Cebu City, Philippines"
            @keyup.enter="handleSearch"
          />
        </div>
        <button @click="handleSearch" class="submit-btn">Check Risk</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Variables and Theme Scoping */
:root {
  --bg-color: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --accent-blue: #2563eb;
  --accent-hover: #1d4ed8;
  --card-bg: rgba(255, 255, 255, 0.8);
  --card-border: #ffffff;
  --input-bg: #f8fafc;
  --input-border: #f1f5f9;
  --gradient-bg: linear-gradient(to bottom right, #ffffff, #eff6ff, #f1f5f9);
  --map-filter: grayscale(1);
  --typhoon-color: rgba(96, 165, 250, 0.4);
}

.dark-mode {
  --bg-color: #020617;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --accent-blue: #2563eb;
  --accent-hover: #1d4ed8;
  --card-bg: rgba(15, 23, 42, 0.4);
  --card-border: rgba(255, 255, 255, 0.1);
  --input-bg: rgba(2, 6, 23, 0.5);
  --input-border: rgba(255, 255, 255, 0.05);
  --gradient-bg: linear-gradient(to bottom right, #020617, #172554, #0f172a);
  --map-filter: invert(1) brightness(2);
  --typhoon-color: rgba(37, 99, 235, 0.2);
}

/* Layout */
main {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-primary);
  transition: background-color 0.1s ease;
}

/* Background & Animations */
.bg-container {
  inset: 0;
  z-index: 0;
  pointer-events: none;
  position: fixed
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: var(--gradient-bg);
  z-index: -20;
}

.ph-map-overlay {
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
  transform: scale(1.25);
  filter: var(--map-filter);
  transition: filter 0.1s ease;
}

.dots-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: radial-gradient(#fff 0.5px, transparent 0.5px);
  background-size: 40px 40px;
}

.dark-mode .dots-pattern { filter: invert(1); }

@keyframes typhoon-flow {
  0% { transform: translate(100vw, 80vh) rotate(0deg) scale(1); opacity: 0; }
  15% { opacity: 0.5; }
  85% { opacity: 0.5; }
  100% { transform: translate(-100vw, -80vh) rotate(180deg) scale(1.8); opacity: 0; }
}

.typhoon-blur {
  position: absolute;
  width: 850px;
  height: 500px;
  filter: blur(150px);
  background-color: var(--typhoon-color);
  animation: typhoon-flow 40s linear infinite;
  border-radius: 40% 60% 70% 30% / 40% 40% 60% 60%;
}

.delay-15 { animation-delay: 15s; }
.delay-30 { animation-delay: 30s; }

/* Components */
.actions-wrapper {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.icon-btn {
  padding: 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  cursor: pointer;
  position: relative;
}

.github-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.dark-mode .github-icon { filter: invert(1); }

.card {
  z-index: 10;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(24px);
  border-radius: 32px;
  padding: 2rem;
  width: 100%;
  max-width: 576px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.description {
  font-family: 'Judson', serif;
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* Form Styles */
.search-form {
  max-width: 340px;
  margin: 0 auto;
}

.input-label {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--accent-blue);
  margin-bottom: 0.6rem;
  text-align: left;
}

input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border-radius: 0.75rem;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  color: var(--text-primary);
  font-family: 'Judson', serif;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: var(--accent-blue);
}

.submit-btn {
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.875rem;
  background: var(--accent-blue);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
}

.submit-btn:hover { background: var(--accent-hover); }
.submit-btn:active { transform: scale(0.97); }

.logo-container {
  width: 20%;
  height: 20%;
  margin-bottom: 1.5rem;
}

/* Tooltips */
.tooltip {
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: #1e293b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.icon-btn:hover .tooltip { opacity: 1; }
</style>