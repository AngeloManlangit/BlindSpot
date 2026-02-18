<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isDarkMode = ref(true)
const location = ref('')
const router = useRouter()

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
</script>

<template>
  <main 
    :class="[isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900']"
    class="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden transition-colors duration-100"
  >
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div :class="isDarkMode ? 'from-slate-950 via-blue-950 to-slate-900' : 'from-white via-blue-50 to-slate-100'" 
           class="absolute inset-0 bg-gradient-to-br -z-20 transition-all duration-100"></div>

      <div class="absolute inset-0 flex items-center justify-center opacity-[0.1] z-[-10]">
        <img 
            src="/ph.svg" 
            alt="PH Map"
            class="h-[200%] w-auto object-contain transition-all duration-100 scale-125"
            :class="isDarkMode ? 'invert brightness-200' : 'grayscale'"
        />
      </div>

      <div class="absolute inset-0 overflow-hidden">
        <div v-for="n in 3" :key="n"
          class="absolute w-[850px] h-[500px] blur-[150px] animate-typhoon-track"
          :class="[
            isDarkMode ? 'bg-blue-600/20' : 'bg-blue-400/40',
            n === 1 ? 'delay-0' : n === 2 ? 'delay-15' : 'delay-30'
          ]"
        ></div>
      </div>

      <div v-if="isDarkMode" class="absolute inset-0 opacity-[0.03] invert transition-opacity duration-100" style="background-image: radial-gradient(#fff 0.5px, transparent 0.5px); background-size: 40px 40px;"></div>
    </div>

    <div class="absolute top-6 right-6 z-50 flex flex-col gap-3">
      <button
        @click="toggleTheme"
        class="theme-toggle p-3.5 rounded-xl border transition-all duration-100 backdrop-blur-md shadow-sm group relative flex items-center justify-center"
        :class="isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-white border-slate-200 text-slate-700'"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          width="1.5em"
          height="1.5em"
          fill="currentColor"
          stroke-linecap="round"
          class="theme-toggle__classic transition-transform duration-500"
          :style="{ transform: isDarkMode ? 'rotate(40deg)' : 'rotate(0deg)' }"
          viewBox="0 0 32 32"
        >
          <clipPath id="theme-toggle__classic__cutout">
            <path d="M0-5h30a1 1 0 0 0 9 13v24H0Z" class="transition-all duration-500" :style="{ transform: isDarkMode ? 'translate(-12px, 8px)' : 'translate(0, 0)' }" />
          </clipPath>
          <g clip-path="url(#theme-toggle__classic__cutout)">
            <circle cx="16" cy="16" r="9.34" />
            <g stroke="currentColor" stroke-width="1.5" class="transition-opacity duration-300" :style="{ opacity: isDarkMode ? '0' : '1' }">
              <path d="M16 5.5v-4" />
              <path d="M16 30.5v-4" />
              <path d="M1.5 16h4" />
              <path d="M26.5 16h4" />
              <path d="m23.4 8.6 2.8-2.8" />
              <path d="m5.7 26.3 2.9-2.9" />
              <path d="m5.8 5.8 2.8 2.8" />
              <path d="m23.4 23.4 2.9 2.9" />
            </g>
          </g>
        </svg>
        <span class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wider">
          {{ isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode' }}
        </span>
      </button>

      <button 
        @click="openDocumentation"
        class="p-3.5 rounded-xl border transition-all duration-100 backdrop-blur-md shadow-sm group relative"
        :class="isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'"
      >
        <img 
          src="/github-icon.svg" 
          alt="GitHub" 
          class="w-6 h-6 transition-all duration-100"
          :class="isDarkMode ? 'invert' : ''"
        />
        <span class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wider">
          Documentation
        </span>
      </button>
    </div>

    <div class="flex justify-center w-full mb-6 relative z-10">
      <img
        :src="isDarkMode ? '/blindspot-logo-light.svg' : '/blindspot-logo.svg'"
        alt="BlindSpotPH Logo"
        class="w-[180px] md:w-[240px] lg:w-[260px] transition-all duration-100"
        :class="isDarkMode ? 'drop-shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'drop-shadow-md'"
      />
    </div>

    <div
      class="backdrop-blur-xl rounded-[32px] lg:rounded-[48px] shadow-2xl text-center w-full max-w-[90%] sm:max-w-md lg:max-w-xl p-8 lg:p-12 transition-all duration-100 relative z-10 border"
      :class="isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white/80 border-white shadow-blue-100/20'"
    >
      <h1 
        class="font-outfit font-bold text-3xl lg:text-5xl mb-2 tracking-tight transition-colors duration-100"
        :class="isDarkMode ? 'text-white' : 'text-slate-900'"
      >
        Stay Ahead
      </h1>
      <p 
        class="font-judson text-base lg:text-lg mb-8 leading-snug transition-colors duration-100"
        :class="isDarkMode ? 'text-slate-400' : 'text-slate-600'"
      >
        Keep critical power outages out of your blind spot. Stay prepared for potential outages and detect risks to your area's electricity before they cause disruption. 
      </p>

      <div class="flex flex-col gap-5 items-center w-full max-w-[340px] mx-auto">
        <div class="w-full text-left">
          <label 
            class="block font-outfit font-semibold text-[11px] uppercase tracking-[0.2em] mb-2.5 ml-1 transition-colors duration-100"
            :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'"
          >
            Enter your location
          </label>
          <div class="relative group">
            <input 
              v-model="location"
              type="text" 
              placeholder="e.g. Cebu City, Philippines"
              class="w-full px-5 py-3.5 rounded-xl outline-none border-2 transition-all duration-100 font-judson text-base"
              :class="isDarkMode 
                ? 'bg-slate-950/50 border-white/5 text-white focus:border-blue-500/50' 
                : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-400 focus:bg-white'"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>

        <button 
          @click="handleSearch"
          class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-outfit font-bold text-base rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.97]"
        >
          Check Risk
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
@keyframes typhoon-flow {
  0% { transform: translate(100vw, 80vh) rotate(0deg) scale(1); opacity: 0; }
  15% { opacity: 0.5; }
  85% { opacity: 0.5; }
  100% { transform: translate(-100vw, -80vh) rotate(180deg) scale(1.8); opacity: 0; }
}

.animate-typhoon-track {
  animation: typhoon-flow 40s linear infinite;
  border-radius: 40% 60% 70% 30% / 40% 40% 60% 60%;
}

.delay-0 { animation-delay: 0s; }
.delay-15 { animation-delay: 15s; }
.delay-30 { animation-delay: 30s; }

.shadow-blue-100\/20 {
  box-shadow: 0 20px 40px -15px rgba(30, 64, 175, 0.1);
}

.theme-toggle:hover {
  transform: scale(1.05);
}
.theme-toggle:active {
  transform: scale(0.95);
}
</style>