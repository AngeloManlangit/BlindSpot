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
  // Transition to a results page or show a modal here
}

const openDocumentation = () => {
  window.open('https://github.com/AngeloManlangit/BlindSpot', '_blank')
}
</script>

<template>
  <main 
    :class="[isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900']"
    class="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden transition-colors duration-700"
  >
    <div class="absolute inset-0 z-0">
  <template v-if="!isDarkMode">
    <div class="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-slate-100 -z-20"></div>
    
    <div class="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-400 rounded-full blur-3xl opacity-60 animate-typhoon-1 z-0"></div>
    
    <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full blur-3xl opacity-70 animate-typhoon-2 z-0"></div>
    
    <div class="absolute top-[30%] right-[20%] w-[250px] h-[250px] bg-blue-200 rounded-full blur-2xl opacity-70 animate-typhoon-3 z-0"></div>
  </template>

  <template v-else>
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 -z-20"></div>
    
    <div class="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-30 animate-typhoon-1 z-0"></div>
    
    <div class="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-slate-600 rounded-full blur-[140px] opacity-30 animate-typhoon-2 z-0"></div>
    
    <div class="absolute inset-0 opacity-[0.03] invert" style="background-image: radial-gradient(#fff 0.5px, transparent 0.5px); background-size: 40px 40px;"></div>
  </template>
</div>

    <div class="absolute top-6 right-6 z-50 flex flex-col gap-3">
      <button 
        @click="toggleTheme"
        class="p-2.5 rounded-xl border transition-all duration-300 backdrop-blur-md shadow-sm"
        :class="isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'"
        title="Toggle Theme"
      >
        <span v-if="isDarkMode" class="text-lg">☀️</span>
        <span v-else class="text-lg">🌙</span>
      </button>

      <button 
        @click="openDocumentation"
        class="p-2.5 rounded-xl border transition-all duration-300 backdrop-blur-md shadow-sm group relative"
        :class="isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'"
      >
        <span class="text-lg">📄</span>
        <span class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wider">
          Documentation
        </span>
      </button>
    </div>

    <div class="flex justify-center w-full mb-6 relative z-10">
      <img
        src="../assets/Logo.png"
        alt="BlindSpotPH Logo"
        class="w-[240px] md:w-[300px] lg:w-[380px] transition-all duration-500"
        :class="isDarkMode ? 'drop-shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'drop-shadow-md'"
      />
    </div>

    <div
      class="
        backdrop-blur-xl rounded-[32px] lg:rounded-[48px] shadow-2xl text-center
        w-full max-w-[90%] sm:max-w-md lg:max-w-xl p-8 lg:p-12
        transition-all duration-700 relative z-10 border
      "
      :class="isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white/80 border-white shadow-blue-100/20'"
    >
      <h1 
        class="font-outfit font-bold text-3xl lg:text-5xl mb-2 tracking-tight transition-colors duration-500"
        :class="isDarkMode ? 'text-white' : 'text-slate-900'"
      >
        Stay Ahead
      </h1>
      <p 
        class="font-judson text-base lg:text-xl mb-8 transition-colors duration-500"
        :class="isDarkMode ? 'text-slate-400' : 'text-slate-600'"
      >
        Keep critical power outages out of your blind spot. Stay prepared for potential outages and detect risks to your area's electricity before they cause disruption. 
      </p>

      <div class="flex flex-col gap-5 items-center w-full max-w-[340px] mx-auto">
        <div class="w-full text-left">
          <label 
            class="block font-outfit font-semibold text-[11px] uppercase tracking-[0.2em] mb-2.5 ml-1"
            :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'"
          >
            Enter your location
          </label>
          <div class="relative group">
            <input 
              v-model="location"
              type="text" 
              placeholder="e.g. Cebu City, Philippines"
              class="
                w-full px-5 py-3.5 rounded-xl outline-none border-2
                transition-all duration-500 font-judson text-base
              "
              :class="isDarkMode 
                ? 'bg-slate-950/50 border-white/5 text-white focus:border-blue-500/50' 
                : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-400 focus:bg-white'"
              @keyup.enter="handleSearch"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm opacity-60"></span>
          </div>
        </div>

        <button 
          @click="handleSearch"
          class="
            w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white 
            font-outfit font-bold text-base rounded-xl shadow-lg 
            hover:shadow-blue-500/30 transition-all active:scale-[0.97]
          "
        >
          Check Infrastructure Risk
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Swirling "Typhoon" effect */
@keyframes drift {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  33% {
    /* Increased distance from 30px to 150px */
    transform: translate(150px, -100px) rotate(120deg) scale(1.2);
  }
  66% {
    /* Increased distance from -20px to -120px */
    transform: translate(-120px, 150px) rotate(240deg) scale(0.8);
  }
  100% {
    transform: translate(0, 0) rotate(360deg) scale(1);
  }
}

/* Let's speed them up slightly so the movement is obvious */
.animate-typhoon-1 {
  animation: drift 15s linear infinite; /* from 25s to 15s */
}

.animate-typhoon-2 {
  animation: drift 20s linear infinite reverse; /* from 35s to 20s */
}

.animate-typhoon-3 {
  animation: drift 25s ease-in-out infinite; /* from 45s to 25s */
}

/* Pulsing opacity for a "stormy" feel */
@keyframes atmospheric-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.25; }
}

.animate-typhoon-1 {
  animation: drift 25s linear infinite;
}

.animate-typhoon-2 {
  animation: drift 35s linear infinite reverse;
}

.animate-typhoon-3 {
  animation: drift 45s ease-in-out infinite;
}

/* Custom shadow for Light Mode card depth */
.shadow-blue-100\/20 {
  box-shadow: 0 20px 40px -15px rgba(30, 64, 175, 0.1);
}
</style>