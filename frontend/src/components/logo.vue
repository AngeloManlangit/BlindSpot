<template>
    <a side class ="side">
        <img src="/cyclone_light.svg" alt="BlindSpotPH Logo" class="logo">
    </a>
</template>


<script setup lang="ts">
</script>

<style>

.side {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid var(--card-border);
    transition: all 0.2s ease-in-out;
}
</style>