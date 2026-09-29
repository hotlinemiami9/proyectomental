<script setup lang="ts">
const { styleId } = useSkyStyle()

const stories = {
  cristal: {
    kicker: 'Cristal',
    title: 'El cielo de tu nacimiento',
    lede: 'Fecha, hora y lugar. Con eso se calcula la carta de Diseño Humano.',
    titleClass: 'max-w-[11ch] font-serif text-[clamp(2.8rem,6vw,5.35rem)] font-medium leading-[0.9]',
  },
  linea: {
    kicker: 'Línea',
    title: 'Fecha, hora, lugar.',
    lede: 'Tres datos del instante en que naciste. Nada más hace falta para empezar.',
    titleClass: 'max-w-[16ch] font-sans text-[clamp(2.6rem,6vw,4.7rem)] font-light leading-[1.02] tracking-[-0.03em]',
  },
  orbita: {
    kicker: 'Órbita',
    title: 'Una noche, un instante',
    lede: 'La hora es la del lugar de nacimiento, no la de donde vives ahora.',
    titleClass: 'max-w-[12ch] font-serif text-[clamp(2.7rem,5.4vw,4.3rem)] font-medium italic leading-[0.95]',
  },
  umbral: {
    kicker: 'Umbral',
    title: 'Oro y violeta',
    lede: 'La misma carta, bajo una noche distinta. Fecha, hora y lugar de nacimiento.',
    titleClass: 'max-w-[12ch] font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-medium italic leading-[0.95]',
  },
} as const

const story = computed(() => stories[styleId.value])
</script>

<template>
  <div class="sky-page" :data-sky="styleId">
    <NightSky />
    <p class="sr-only">
      Cielo nocturno: las estrellas aparecen poco a poco y un cometa cruza desde fuera hasta disolverse en el centro.
    </p>

    <div id="inicio" class="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 pb-8 md:px-8 md:pb-10">
      <SiteHeader />

      <div v-if="styleId === 'cristal'" class="flex flex-1 flex-col justify-end">
        <div class="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-14">
          <HeroCopy
            :kicker="story.kicker"
            :title="story.title"
            :lede="story.lede"
            :title-class="story.titleClass"
          />
          <BirthChartForm />
        </div>
      </div>

      <div v-else-if="styleId === 'linea'" class="flex flex-1 flex-col justify-center py-8">
        <HeroCopy
          class="max-w-3xl"
          :kicker="story.kicker"
          :title="story.title"
          :lede="story.lede"
          :title-class="story.titleClass"
        />
        <BirthChartForm class="mt-8" />
      </div>

      <div v-else-if="styleId === 'umbral'" class="flex flex-1 flex-col items-center justify-center py-8 text-center">
        <HeroCopy
          class="max-w-xl [&_p]:mx-auto"
          :kicker="story.kicker"
          :title="story.title"
          :lede="story.lede"
          :title-class="story.titleClass"
        />
        <BirthChartForm class="mt-8 w-full max-w-lg" />
      </div>

      <template v-else>
        <HeroCopy
          class="mt-3 max-w-3xl"
          :kicker="story.kicker"
          :title="story.title"
          :lede="story.lede"
          :title-class="story.titleClass"
        />
        <div class="min-h-8 flex-1" />
        <BirthChartForm class="mt-8" />
      </template>
    </div>
  </div>
</template>
