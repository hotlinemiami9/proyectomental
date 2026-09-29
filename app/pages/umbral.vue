<script setup lang="ts">
useSeoMeta({
  title: 'Umbral — Diseño Humano',
  description: 'Una noche de oro y violeta para recoger la fecha, la hora y el lugar de nacimiento.',
})
</script>

<template>
  <div class="sky-page" data-sky="umbral">
    <NightSky palette="umbral" />

    <div class="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 pb-10 md:px-8">
      <header class="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 py-5 md:py-6">
        <NuxtLink to="/" class="night-text inline-flex items-center gap-2.5 text-[var(--ink)] no-underline">
          <svg class="text-[var(--accent)]" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M7 0.4 8.15 5.15 13.2 7 8.15 8.85 7 13.6 5.85 8.85 0.8 7 5.85 5.15Z"
            />
          </svg>
          <span class="font-serif text-[1.45rem]">Diseño Humano</span>
        </NuxtLink>
        <NuxtLink
          to="/"
          class="text-sm text-[var(--muted)] no-underline transition-colors hover:text-[var(--ink)]"
        >
          La noche
        </NuxtLink>
      </header>

      <div class="flex flex-1 flex-col items-center justify-center py-10">
        <div class="w-full max-w-xl text-center">
          <p class="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">
            Umbral
          </p>
          <h1 class="night-text mt-3 font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-medium italic leading-[0.95] text-[var(--ink)]">
            Oro y violeta
          </h1>
          <p class="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)] md:text-base">
            La misma carta, bajo una noche distinta. Fecha, hora y lugar de nacimiento.
          </p>
        </div>
        <BirthChartForm appearance="umbral" class="mt-8 w-full max-w-lg" />
      </div>
    </div>
  </div>
</template>
