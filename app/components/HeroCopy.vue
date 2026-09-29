<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  lede: string
  titleClass: string
}>()
</script>

<template>
  <div>
    <p class="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">
      {{ kicker }}
    </p>
    <h1 :class="['night-text mt-3 text-[var(--ink)]', titleClass]">
      {{ title }}
    </h1>
    <p class="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)] md:text-base">
      {{ lede }}
    </p>
  </div>
</template>
