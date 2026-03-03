<script lang="ts" setup>

import LogoDark from "@/assets/svgs/blindspot-logo-white.svg"
import LogoWhite from "@/assets/svgs/blindspot-logo-dark-gray.svg"
const props = defineProps<{
    isDark: boolean
}>();
</script>

<template>
    <div class="dark-background" @click.self="$emit('close')">
        
        <div :class="['popup-window', isDark ? 'dark' : 'light']">
            <div class="window-header">
                <h1 class="title paytone-one-regular">BLIND SPOT</h1>
                <button class="close-x" @click="$emit('close')">&times;</button>
            </div>

            <div class="dashboard-body">
                <div class="stats-grid">
                <section class="left-column">
                    <div class="grid left-grid">
                        <img
                            :src="isDark ? LogoDark : LogoWhite"
                            alt="BlindSpotPH Logo"
                            :class="['logo', isDark ? 'logo-glow' : 'logo-shadow']"
                        />
                        <p class="sentence">Blind Spot is a predictive disaster intelligence platform designed to help Filipino communities anticipate infrastructure failures before typhoons strike. Instead of only tracking storm intensity, it analyzes how extreme weather may impact power grids, and other critical systems at a localized level. By modeling cascading failures—such as simultaneous electricity and cellular outages—it provides actionable risk assessments and early warnings for LGUs and residents. The goal is to shift disaster response in the Philippines from reactive recovery to proactive resilience, strengthening safer and more sustainable cities.
                        </p>
                    </div>
                </section>
            
                <section class="right-column">
                     <div class="grid-main-top">
                        <div class="grid">
                            <div>
                                <p class="grid-label">Vision</p>
                                <p>To build a future where Filipino cities—starting with Cebu—are powered by predictive infrastructure intelligence, ensuring that no community faces disasters blind to cascading failures.</p>
                                <p>Blind Spot envisions a resilient Philippines where data-driven foresight protects lives, safeguards essential services, and strengthens sustainable urban development in alignment with SDG 11: Sustainable Cities and Communities.</p>
                            </div>
                        </div>
                    <div class="grid">
                        <div>                                    <p class="grid-label">Mission</p>
                           <p>To transform disaster response in the Philippines from reactive recovery to predictive resilience by delivering localized, infrastructure-level intelligence that remains accessible even during total power and connectivity failures.</p>
                        <p>Blind Spot aims to empower communities, critical institutions, and local governments with actionable foresight—reducing economic losses, preventing chaotic evacuations, and enabling coordinated, sustainable disaster management.</p>                        </div>
                            </div>
                            <div class="grid">
                                <div>
                                    <p class="grid-label">How It Works</p>
                                    <p>Blind Spot integrates real-time wind speed and rainfall data, population density and exposure metrics, grid-specific metadata (feeder age, outage history), and infrastructure capacity indicators (backup generators, redundancy).</p>
                                    <p>Using a weighted risk formula aligned with UNDRR standards: <strong>Risk = (Hazard × Exposure × Vulnerability) ÷ Capacity</strong></p>
                                    
                                </div>
                            </div>
                            <div class="grid">
                                <div>
                                    <p class="grid-label">Target Beneficiaries</p>
                                    <p><strong>Primary:</strong> Local Government Units (DRRM Offices)</p>
                                    <p><strong>Secondary:</strong> Hospitals, data centers, banks, BPO companies, factories</p>
                                    <p><strong>Tertiary:</strong> Insurance companies, real estate developers, and residents in high-risk urban areas like Cebu City</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.logo { width: 180px; transition: all 0.2s; }
.logo-glow {
    filter: drop-shadow(0 0 12px rgba(99, 179, 255, 0.5));
}

.logo-shadow {
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}

.grid-label {
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 10px;
}
.title {
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--text-main);
}

.sentence {
    text-align: left;
    line-height: 1.7;
    font-size: 0.875rem;
    color: var(--text-main);
    margin: 0;
}

.dark-background {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;

    /* Sets the font for the whole thing */
    font-family: 'Outfit', sans-serif;
}

.popup-window.dark {
  --text-main: #ffffff;
  --text-muted: #94a3b8;
  --card-bg: radial-gradient(circle, rgba(11, 22, 46, 0.49), rgba(16, 40, 95, 0.49));
  --card-border: rgba(255, 255, 255, 0.1);
}

.popup-window.light {
  --text-main: #0f172a;
  --text-muted: #475569;
  --card-bg: radial-gradient(circle, rgba(162, 198, 238, 0.666), rgba(255, 255, 255, 0.656));
  --card-border: #ffffff;
}


.popup-window {
    width: 100%;
    max-width: 1500px;
    height: 90vh;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 28px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

::-webkit-scrollbar {
    display: none;
}

.window-header {
    margin-top: 20px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.title {
    position: absolute;
    left: 40px;
    color: var(--text-main);
}

.close-x {
    position: absolute;
    right: 20px;
    background: none;
    border: none;
    color: var(--text-main);
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
}

/* Content Layout */
.dashboard-body {
    color: white;
    padding: 12px 20px;
    flex: 1;
    padding-top: 0px;
    
}

.stats-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 20px;

    margin-top: 20px;
}

.left-column {
    grid-column: 1;
}

.right-column {
    grid-column: 2;
}

.left-column, .right-column {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.grid-main-top {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two equal columns */
    grid-template-rows: 1fr 1fr;   /* Two rows for the 4 cards */
    gap: 12px;
    height:100%;
    min-height: 0;
}

.stats-grid > * {
    animation: slide-up 0.6s ease-out forwards;
    opacity: 0;
}
.grid {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 12px;
    color: var(--text-main);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.65;
    overflow: hidden;
    min-height: 0;
    
    
}.left-grid {
    flex-direction: column;
    align-items: center;
    justify-content:top;
    gap: 50px;
    height: 100%;
}
/* Stagger the appearance of each card */
.grid-risk { animation-delay: 0.1s; }
.grid-main-top { animation-delay: 0.2s; }
.grid-alerts { animation-delay: 0.3s; }
.grid-chart { animation-delay: 0.4s; }

@keyframes slide-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>