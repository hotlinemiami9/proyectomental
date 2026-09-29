<script setup lang="ts">
import { mountStarfield, type SkyPalette } from '~/utils/starfield'

const props = defineProps<{
  palette?: SkyPalette
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { styleId, cometKind } = useSkyStyle()

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const sky = mountStarfield(
    canvas,
    () => props.palette ?? styleId.value,
    () => cometKind.value,
    (kind) => {
      cometKind.value = kind
    },
  )
  onBeforeUnmount(() => sky.destroy())
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed inset-0 z-0 block h-svh w-full"
    aria-hidden="true"
  />
</template>
