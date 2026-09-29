<script setup lang="ts">
const { styleId, styles, cometKind, cometKinds } = useSkyStyle()

const wordmarkClass = computed(() => {
  if (styleId.value === 'linea') return 'font-sans text-lg font-light tracking-[0.14em]'
  if (styleId.value === 'orbita' || styleId.value === 'umbral') return 'font-serif text-[1.65rem] italic'
  return 'font-serif text-[1.45rem]'
})
</script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 py-5 md:py-6">
    <a href="#inicio" class="night-text inline-flex items-center gap-2.5 text-[var(--ink)] no-underline">
      <svg class="text-[var(--accent)]" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 0.4 8.15 5.15 13.2 7 8.15 8.85 7 13.6 5.85 8.85 0.8 7 5.85 5.15Z"
        />
      </svg>
      <span :class="wordmarkClass">Diseño Humano</span>
    </a>

    <div class="flex flex-col items-end gap-2">
      <div class="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:gap-x-6">
        <a
          href="#carta"
          class="hidden text-sm text-[var(--muted)] no-underline transition-colors hover:text-[var(--ink)] sm:inline"
        >
          La carta
        </a>

        <div class="flex items-center gap-2" role="radiogroup" aria-label="Ejemplos de estilo">
          <span class="px-1 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]" aria-hidden="true">
            Estilo
          </span>
          <div class="flex items-center rounded-full border border-white/15 p-0.5">
            <label
              v-for="style in styles"
              :key="style.id"
              class="cursor-pointer rounded-full px-2.5 py-1 text-[11px] tracking-[0.12em] focus-within:outline focus-within:outline-1 focus-within:outline-offset-2 focus-within:outline-[var(--accent)]"
              :class="styleId === style.id ? 'bg-white/12 text-[var(--ink)]' : 'text-[var(--muted)]'"
            >
              <input
                v-model="styleId"
                class="sr-only"
                type="radio"
                name="estilo"
                :value="style.id"
              >
              {{ style.label }}
            </label>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2" role="radiogroup" aria-label="Tipos de cometa">
        <span class="px-1 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]" aria-hidden="true">
          Cometa
        </span>
        <div class="flex flex-wrap items-center justify-end rounded-full border border-white/15 p-0.5">
          <label
            v-for="kind in cometKinds"
            :key="kind.id"
            class="cursor-pointer rounded-full px-2.5 py-1 text-[11px] tracking-[0.12em] focus-within:outline focus-within:outline-1 focus-within:outline-offset-2 focus-within:outline-[var(--accent)]"
            :class="cometKind === kind.id ? 'bg-white/12 text-[var(--ink)]' : 'text-[var(--muted)]'"
          >
            <input
              v-model="cometKind"
              class="sr-only"
              type="radio"
              name="cometa"
              :value="kind.id"
            >
            {{ kind.label }}
          </label>
        </div>
      </div>
    </div>
  </header>
</template>
