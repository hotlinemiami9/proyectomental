export type SkyPalette = 'cristal' | 'linea' | 'orbita' | 'umbral'
export type SkyCometKind = 'polvo' | 'tenue' | 'suave' | 'brasa' | 'velo' | 'calma' | 'fugaz'

type Rgb = [number, number, number]

interface Star {
  nx: number
  ny: number
  mag: number
  r: number
  roll: number
  igniteAt: number
  igniteDur: number
  f1: number
  f2: number
  f3: number
  p1: number
  p2: number
  p3: number
  cycles: boolean
  cyclePeriod: number
  cyclePhase: number
  cross: number
}

interface Sample {
  nx: number
  ny: number
  vx: number
  vy: number
  px: number
  py: number
  born: number
  life: number
}

interface CometLook {
  duration: number
  tau: number
  width: number
  alpha: number
  grow: number
  coma: number
  core: number
  head: number
  sprite: 'dust' | 'ion'
  dustWidth: number
  dustAlpha: number
  dustOffset: number
  life: number
  coast: number
  even: boolean
  veil?: boolean
  snap?: boolean
}

interface Comet {
  age: number
  progress: number
  emit: number
  duration: number
  kind: SkyCometKind
  a: { x: number, y: number }
  b: { x: number, y: number }
  c: { x: number, y: number }
}

const STAR_FIRST = 1.8
const STAR_SPAN = 22
const STAR_MAG_LEAD = 5
const STAR_DUR = 9.5
const STAR_DUR_EXTRA = 2
const SKY_FULL = STAR_FIRST + STAR_MAG_LEAD + STAR_SPAN + STAR_DUR + STAR_DUR_EXTRA
const COMET_DELAY = SKY_FULL / 2
const COMET_GAPS = [3, 6, 9]
const COMET_ORDER: SkyCometKind[] = ['polvo', 'tenue', 'suave', 'brasa', 'velo', 'calma', 'fugaz']

const PALETTES: Record<SkyPalette, {
  sky: [string, string, string]
  horizon: string
  milk: string
  dust: Rgb
  ion: Rgb
  bias: number
}> = {
  cristal: {
    sky: ['#07091a', '#141a36', '#0b1022'],
    horizon: 'rgba(52, 68, 140, 0.28)',
    milk: 'rgba(198, 214, 255, 0.07)',
    dust: [255, 226, 196],
    ion: [186, 216, 255],
    bias: 0,
  },
  linea: {
    sky: ['#05070e', '#10182a', '#080d16'],
    horizon: 'rgba(40, 72, 120, 0.22)',
    milk: 'rgba(214, 228, 255, 0.05)',
    dust: [232, 238, 248],
    ion: [168, 206, 255],
    bias: -0.1,
  },
  orbita: {
    sky: ['#140e0c', '#2a1812', '#120c0b'],
    horizon: 'rgba(128, 68, 28, 0.32)',
    milk: 'rgba(255, 214, 170, 0.05)',
    dust: [255, 198, 140],
    ion: [214, 196, 255],
    bias: 0.14,
  },
  umbral: {
    sky: ['#140818', '#2c143c', '#1a1024'],
    horizon: 'rgba(140, 88, 28, 0.38)',
    milk: 'rgba(210, 170, 255, 0.07)',
    dust: [232, 196, 120],
    ion: [198, 160, 255],
    bias: 0.06,
  },
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function smoothstep(value: number) {
  const x = clamp(value)
  return x * x * (3 - 2 * x)
}

function rise(value: number) {
  const x = clamp(value)
  const eased = smoothstep(x)
  return eased * 0.62 + x * 0.38
}

function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ]
}

function rgba(rgb: Rgb, alpha: number) {
  return `rgba(${rgb[0] | 0}, ${rgb[1] | 0}, ${rgb[2] | 0}, ${alpha})`
}

function quad(
  a: { x: number, y: number },
  b: { x: number, y: number },
  c: { x: number, y: number },
  t: number,
) {
  const u = 1 - t
  return {
    x: u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    y: u * u * a.y + 2 * u * t * b.y + t * t * c.y,
  }
}

function makeComaSprite() {
  const sprite = document.createElement('canvas')
  sprite.width = 180
  sprite.height = 180
  const context = sprite.getContext('2d')
  if (!context) return sprite
  const radius = 90
  const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.42, 'rgba(255,248,236,0.55)')
  gradient.addColorStop(0.7, 'rgba(255,240,220,0.22)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 180, 180)
  return sprite
}

function makeIonSprite(core: string, mid: string, edge: string) {
  const size = 128
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const context = sprite.getContext('2d')
  if (!context) return sprite
  const radius = size / 2
  const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius)
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.14, core)
  gradient.addColorStop(0.4, mid)
  gradient.addColorStop(0.74, edge)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  return sprite
}

function makeDustSprite(core: string, mid: string, veil: string) {
  const size = 128
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const context = sprite.getContext('2d')
  if (!context) return sprite
  const radius = size / 2
  const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius)
  gradient.addColorStop(0, core)
  gradient.addColorStop(0.2, mid)
  gradient.addColorStop(0.5, veil)
  gradient.addColorStop(0.78, 'rgba(255,255,255,0.05)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  return sprite
}

function makeSprite(size: number, inner: string, mid: string) {
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const context = sprite.getContext('2d')
  if (!context) return sprite
  const radius = size / 2
  const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius)
  gradient.addColorStop(0, inner)
  gradient.addColorStop(0.28, mid)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  return sprite
}

function makeSpikeSprite() {
  const width = 256
  const height = 64
  const sprite = document.createElement('canvas')
  sprite.width = width
  sprite.height = height
  const context = sprite.getContext('2d')
  if (!context) return sprite
  const along = context.createLinearGradient(0, 0, width, 0)
  along.addColorStop(0, 'rgba(255,255,255,0)')
  along.addColorStop(0.18, 'rgba(255,255,255,0.08)')
  along.addColorStop(0.5, 'rgba(255,255,255,1)')
  along.addColorStop(0.82, 'rgba(255,255,255,0.08)')
  along.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = along
  context.fillRect(0, 0, width, height)
  context.globalCompositeOperation = 'destination-in'
  const across = context.createLinearGradient(0, 0, 0, height)
  across.addColorStop(0, 'rgba(255,255,255,0)')
  across.addColorStop(0.32, 'rgba(255,255,255,0.2)')
  across.addColorStop(0.5, 'rgba(255,255,255,1)')
  across.addColorStop(0.68, 'rgba(255,255,255,0.2)')
  across.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = across
  context.fillRect(0, 0, width, height)
  return sprite
}

function moteFade(age: number, life: number, even: boolean) {
  const unit = age / life
  if (unit >= 1) return 0
  if (!even) return Math.exp(-unit * 2.15) * (1 - smoothstep((unit - 0.62) / 0.38))
  return 1 - smoothstep((unit - 0.72) / 0.28)
}

function starColor(roll: number): Rgb {
  if (roll < 0.08) return [255, 186, 146]
  if (roll < 0.24) return [255, 220, 190]
  if (roll > 0.84) return [190, 214, 255]
  return [246, 248, 255]
}

function createStar(nx: number, ny: number, mag: number, roll: number): Star {
  return {
    nx,
    ny,
    mag,
    r: 0.35 + mag * 1.9,
    roll,
    igniteAt: STAR_FIRST + (1 - mag) * STAR_MAG_LEAD + Math.random() * STAR_SPAN,
    igniteDur: STAR_DUR + (1 - mag) * STAR_DUR_EXTRA,
    f1: 0.8 + (1 - mag) * 4.8 + Math.random() * 0.6,
    f2: 2.1 + Math.random() * 3.4,
    f3: 0.25 + Math.random() * 0.45,
    p1: Math.random() * Math.PI * 2,
    p2: Math.random() * Math.PI * 2,
    p3: Math.random() * Math.PI * 2,
    cycles: mag < 0.84 && Math.random() < 0.7,
    cyclePeriod: 26 + Math.random() * 34,
    cyclePhase: Math.random() * Math.PI * 2,
    cross: Math.random(),
  }
}

const COMET_LOOK: Record<SkyCometKind, CometLook> = {
  polvo: {
    duration: 11,
    tau: 5.6,
    width: 20,
    alpha: 0.2,
    grow: 0.28,
    coma: 44,
    core: 10,
    head: 1,
    sprite: 'dust',
    dustWidth: 0,
    dustAlpha: 0,
    dustOffset: 0,
    life: 4.4,
    coast: 0.24,
    even: true,
  },
  tenue: {
    duration: 10,
    tau: 4.4,
    width: 11,
    alpha: 0.18,
    grow: 0.06,
    coma: 32,
    core: 7,
    head: 0.55,
    sprite: 'ion',
    dustWidth: 0,
    dustAlpha: 0,
    dustOffset: 0,
    life: 3.8,
    coast: 0.1,
    even: true,
  },
  suave: {
    duration: 11,
    tau: 5,
    width: 14,
    alpha: 0.18,
    grow: 0.16,
    coma: 43,
    core: 10,
    head: 0.78,
    sprite: 'dust',
    dustWidth: 0,
    dustAlpha: 0,
    dustOffset: 0,
    life: 4.2,
    coast: 0.18,
    even: true,
  },
  brasa: {
    duration: 9,
    tau: 4.2,
    width: 26,
    alpha: 0.24,
    grow: 0.36,
    coma: 62,
    core: 14,
    head: 1,
    sprite: 'dust',
    dustWidth: 0,
    dustAlpha: 0,
    dustOffset: 0,
    life: 3.2,
    coast: 0.3,
    even: false,
    veil: true,
  },
  velo: {
    duration: 12,
    tau: 7.4,
    width: 9,
    alpha: 0.14,
    grow: 0.04,
    coma: 24,
    core: 5,
    head: 0.42,
    sprite: 'ion',
    dustWidth: 0,
    dustAlpha: 0,
    dustOffset: 0,
    life: 4.8,
    coast: 0.08,
    even: false,
  },
  calma: {
    duration: 12,
    tau: 6.8,
    width: 16,
    alpha: 0.16,
    grow: 0.18,
    coma: 40,
    core: 9,
    head: 0.7,
    sprite: 'dust',
    dustWidth: 24,
    dustAlpha: 0.08,
    dustOffset: 5,
    life: 4.4,
    coast: 0.2,
    even: false,
    veil: true,
  },
  fugaz: {
    duration: 1.7,
    tau: 2.2,
    width: 12,
    alpha: 0.14,
    grow: 0.12,
    coma: 20,
    core: 5,
    head: 1,
    sprite: 'dust',
    dustWidth: 0,
    dustAlpha: 0,
    dustOffset: 0,
    life: 2.1,
    coast: 0.04,
    even: true,
    snap: true,
  },
}

function createComet(kind: SkyCometKind): Comet {
  const end = { x: 0.5, y: 0.4 }
  const paths: Record<SkyCometKind, Pick<Comet, 'a' | 'b' | 'c'>> = {
    polvo: {
      a: { x: -0.16, y: 0.34 },
      b: { x: 0.18, y: 0.26 },
      c: end,
    },
    tenue: {
      a: { x: 1.1, y: 0.32 },
      b: { x: 0.74, y: 0.3 },
      c: end,
    },
    suave: {
      a: { x: -0.14, y: 0.22 },
      b: { x: 0.2, y: 0.18 },
      c: end,
    },
    brasa: {
      a: { x: -0.1, y: 0.68 },
      b: { x: 0.2, y: 0.46 },
      c: end,
    },
    velo: {
      a: { x: 0.86, y: -0.08 },
      b: { x: 0.72, y: 0.14 },
      c: end,
    },
    calma: {
      a: { x: -0.22, y: 0.3 },
      b: { x: 0.06, y: 0.18 },
      c: end,
    },
    fugaz: {
      a: { x: -0.28, y: 0.14 },
      b: { x: 0.02, y: 0.24 },
      c: end,
    },
  }
  return {
    age: 0,
    progress: 0,
    emit: 0,
    duration: COMET_LOOK[kind].duration,
    kind,
    ...paths[kind],
  }
}

function followingKind(kind: SkyCometKind) {
  const index = COMET_ORDER.indexOf(kind)
  return COMET_ORDER[(index + 1) % COMET_ORDER.length] ?? 'polvo'
}

function quietGap(index: number) {
  return COMET_GAPS[index % COMET_GAPS.length] ?? COMET_GAPS[0]
}

export function mountStarfield(
  canvas: HTMLCanvasElement,
  getPalette: () => SkyPalette,
  getCometKind: () => SkyCometKind,
  setCometKind: (kind: SkyCometKind) => void,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { destroy() {} }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const stars: Star[] = []
  const samples: Sample[] = []
  let comet: Comet | null = null
  let nextCometAt = COMET_DELAY
  let gapIndex = 0
  let shownKind = getCometKind()
  let queuedKind = shownKind
  let width = 1
  let height = 1
  let dpr = 1
  let sizedWidth = 0
  let sizedHeight = 0
  let elapsed = 0
  let last = performance.now()
  let raf = 0
  let stopped = false
  let bgCanvas: HTMLCanvasElement | null = null
  let bgKey = ''

  const starGlow = makeSprite(128, 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0.22)')
  const spikeSprite = makeSpikeSprite()
  const dustSprites: Record<SkyPalette, HTMLCanvasElement> = {
    cristal: makeDustSprite('rgba(255, 244, 228, 0.95)', 'rgba(255, 214, 176, 0.62)', 'rgba(255, 196, 150, 0.3)'),
    linea: makeDustSprite('rgba(236, 244, 255, 0.92)', 'rgba(198, 216, 255, 0.58)', 'rgba(170, 198, 255, 0.26)'),
    orbita: makeDustSprite('rgba(255, 228, 190, 0.95)', 'rgba(255, 176, 112, 0.6)', 'rgba(255, 150, 80, 0.28)'),
    umbral: makeDustSprite('rgba(255, 224, 168, 0.94)', 'rgba(228, 176, 210, 0.55)', 'rgba(196, 150, 255, 0.26)'),
  }
  const ionSprites: Record<SkyPalette, HTMLCanvasElement> = {
    cristal: makeIonSprite('rgba(226, 236, 255, 0.82)', 'rgba(176, 208, 255, 0.5)', 'rgba(150, 190, 255, 0.16)'),
    linea: makeIonSprite('rgba(214, 228, 255, 0.78)', 'rgba(168, 198, 255, 0.46)', 'rgba(140, 180, 255, 0.14)'),
    orbita: makeIonSprite('rgba(236, 228, 255, 0.78)', 'rgba(196, 186, 255, 0.46)', 'rgba(180, 170, 255, 0.14)'),
    umbral: makeIonSprite('rgba(236, 214, 255, 0.82)', 'rgba(214, 186, 150, 0.48)', 'rgba(228, 190, 120, 0.16)'),
  }
  const comaSprite = makeComaSprite()
  const coreSprite = makeSprite(64, 'rgba(255,255,255,1)', 'rgba(255,255,255,0.45)')
  for (let index = 0; index < 360; index += 1) {
    stars.push(createStar(Math.random(), Math.random(), Math.random() ** 2.7, Math.random()))
  }

  for (let index = 0; index < 180; index += 1) {
    const along = Math.random()
    const across = (Math.random() + Math.random() + Math.random() - 1.5) / 3
    stars.push(createStar(
      clamp(0.04 + along * 0.92 + across * 0.08),
      clamp(0.9 - along * 0.74 + across * 0.18),
      Math.random() ** 1.8 * 0.48,
      0.35 + Math.random() * 0.5,
    ))
  }

  const anchors: Array<[number, number, number, number]> = [
    [0.16, 0.2, 1, 0.9],
    [0.74, 0.16, 0.97, 0.18],
    [0.86, 0.58, 0.9, 0.04],
    [0.28, 0.72, 0.86, 0.55],
    [0.58, 0.12, 0.84, 0.88],
    [0.08, 0.48, 0.8, 0.4],
    [0.93, 0.3, 0.76, 0.12],
  ]

  anchors.forEach(([nx, ny, mag, roll]) => {
    stars.push(createStar(nx, ny, mag, roll))
  })

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const nextWidth = Math.max(1, rect.width || window.innerWidth)
    const nextHeight = Math.max(1, rect.height || window.innerHeight)
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2)
    if (
      Math.abs(nextWidth - sizedWidth) < 2
      && Math.abs(nextHeight - sizedHeight) < 2
      && canvas.width === Math.round(nextWidth * nextDpr)
    ) return
    width = nextWidth
    height = nextHeight
    dpr = nextDpr
    sizedWidth = width
    sizedHeight = height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    samples.length = 0
    bgKey = ''
  }

  function paintBackground(paletteName: SkyPalette) {
    const key = `${width}x${height}:${paletteName}:${dpr}`
    if (bgKey === key && bgCanvas) return
    bgKey = key
    const palette = PALETTES[paletteName]
    bgCanvas = document.createElement('canvas')
    bgCanvas.width = Math.round(width * dpr)
    bgCanvas.height = Math.round(height * dpr)
    const background = bgCanvas.getContext('2d')
    if (!background) return
    background.setTransform(dpr, 0, 0, dpr, 0, 0)

    const sky = background.createLinearGradient(0, 0, 0, height)
    sky.addColorStop(0, palette.sky[0])
    sky.addColorStop(0.55, palette.sky[1])
    sky.addColorStop(1, palette.sky[2])
    background.fillStyle = sky
    background.fillRect(0, 0, width, height)

    background.save()
    background.translate(width * 0.56, height * 0.4)
    background.rotate(-0.68)
    const milk = background.createRadialGradient(0, 0, 0, 0, 0, width * 0.46)
    milk.addColorStop(0, palette.milk)
    milk.addColorStop(0.42, 'rgba(255,255,255,0.015)')
    milk.addColorStop(1, 'rgba(0,0,0,0)')
    background.fillStyle = milk
    background.fillRect(-width, -height, width * 2, height * 2)
    background.restore()

    const horizon = background.createLinearGradient(0, height * 0.62, 0, height)
    horizon.addColorStop(0, 'rgba(0,0,0,0)')
    horizon.addColorStop(1, palette.horizon)
    background.fillStyle = horizon
    background.fillRect(0, height * 0.62, width, height * 0.38)

    const vignette = background.createRadialGradient(
      width * 0.5,
      height * 0.42,
      height * 0.12,
      width * 0.5,
      height * 0.48,
      Math.max(width, height) * 0.72,
    )
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.5)')
    background.fillStyle = vignette
    background.fillRect(0, 0, width, height)

    const top = background.createLinearGradient(0, 0, 0, height * 0.26)
    top.addColorStop(0, 'rgba(0,0,0,0.4)')
    top.addColorStop(1, 'rgba(0,0,0,0)')
    background.fillStyle = top
    background.fillRect(0, 0, width, height * 0.26)
  }

  function drawStars(now: number, bias: number) {
    for (const star of stars) {
      const appear = reduceMotion ? 1 : rise((now - star.igniteAt) / star.igniteDur)
      if (appear <= 0.004) continue

      const s1 = Math.sin(now * star.f1 + star.p1)
      const s2 = Math.sin(now * star.f2 + star.p2)
      const s3 = Math.sin(now * star.f3 + star.p3)
      const scint = clamp(0.5 + 0.5 * (s1 * 0.62 + s2 * 0.28 + s3 * 0.1))
      const gate = reduceMotion ? 0 : smoothstep((appear - 0.45) / 0.55)
      const amp = (0.045 + (1 - star.mag) * 0.5) * (0.38 + 0.62 * star.ny)
      const twinkle = 1 - gate * amp * (1 - scint)
      const settled = star.igniteAt + star.igniteDur
      const cycleGate = reduceMotion || !star.cycles
        ? 0
        : smoothstep((now - (settled + 12)) / 26)
      const wave = 0.5 + 0.5 * Math.sin((now / star.cyclePeriod) * Math.PI * 2 + star.cyclePhase)
      const breath = smoothstep(wave)
      const alive = 1 - cycleGate + cycleGate * breath
      const alpha = (0.26 + star.mag * 0.74) * appear * alive * twinkle
      const x = star.nx * width
      const y = star.ny * height
      let rgb = starColor(star.roll)
      if (bias > 0) rgb = mix(rgb, [255, 206, 164], bias)
      if (bias < 0) rgb = mix(rgb, [186, 208, 255], -bias)

      if (star.mag > 0.62 && appear > 0.04) {
        const glowIn = smoothstep(appear / 0.85)
        const glow = star.r * (7 + star.mag * 9) * (0.55 + 0.45 * glowIn) * (0.92 + scint * 0.08)
        ctx.globalAlpha = alpha * 0.72 * glowIn
        ctx.drawImage(starGlow, x - glow / 2, y - glow / 2, glow, glow)
      }

      ctx.globalAlpha = 1
      ctx.fillStyle = rgba(rgb, alpha)
      ctx.beginPath()
      ctx.arc(x, y, Math.max(0.35, star.r * (0.55 + scint * 0.12)), 0, Math.PI * 2)
      ctx.fill()

      if (star.mag > 0.97 && appear > 0.04) {
        const spike = smoothstep(appear / 0.9)
        const len = (9 + star.cross * 13) * spike
        const girth = 0.7 + star.cross * 0.5
        const beam = alpha * 0.34 * spike
        ctx.save()
        ctx.translate(x, y)
        ctx.globalAlpha = beam * 0.42
        ctx.drawImage(spikeSprite, -len * 1.08, -3.5 * girth, len * 2.16, 7 * girth)
        ctx.globalAlpha = beam
        ctx.drawImage(spikeSprite, -len, -1.6 * girth, len * 2, 3.2 * girth)
        ctx.rotate(Math.PI / 2)
        ctx.globalAlpha = beam * 0.36
        ctx.drawImage(spikeSprite, -len * 0.9, -3.2 * girth, len * 1.8, 6.4 * girth)
        ctx.globalAlpha = beam * 0.9
        ctx.drawImage(spikeSprite, -len * 0.78, -1.4 * girth, len * 1.56, 2.8 * girth)
        ctx.restore()
      }
    }
    ctx.globalAlpha = 1
  }

  function drawStamp(sprite: HTMLCanvasElement, x: number, y: number, size: number, alpha: number) {
    if (alpha < 0.015 || size < 1) return
    ctx.globalAlpha = alpha
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size)
  }

  function drawTail(paletteName: SkyPalette, look: CometLook) {
    const sprite = look.sprite === 'ion' ? ionSprites[paletteName] : dustSprites[paletteName]
    for (let index = 0; index < samples.length; index += 1) {
      const sample = samples[index]
      if (!sample) continue
      const age = elapsed - sample.born
      const unit = clamp(age / Math.max(sample.life, 0.001))
      const fade = look.snap
        ? 1 - smoothstep((unit - 0.5) / 0.5)
        : moteFade(age, sample.life, look.even)
      if (fade < 0.012) continue
      const x = sample.nx * width
      const y = sample.ny * height
      if (look.even) {
        const body = 1
        const across = look.width * (look.snap ? 0.95 - unit * 0.28 : 0.42)
        const along = look.width * (look.snap ? 1.25 : 1.35)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.atan2(-sample.px, sample.py))
        if (look.snap) {
          ctx.globalAlpha = fade * look.alpha * 0.85 * body
          ctx.drawImage(sprite, -along * 0.7, -across * 0.85, along * 1.4, across * 1.7)
        }
        ctx.globalAlpha = fade * look.alpha * (look.snap ? 0.32 : 1) * body
        ctx.drawImage(sprite, -along / 2, -across * (look.snap ? 0.28 : 0.5), along, across * (look.snap ? 0.56 : 1))
        ctx.restore()
        continue
      }
      if (look.veil) {
        const unit = clamp(age / sample.life)
        const melt = smoothstep((unit - 0.08) / 0.62)
        const across = look.width * (0.62 + melt * 0.7)
        const along = look.width * (1.05 + melt * 2.1)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.atan2(-sample.px, sample.py))
        ctx.globalAlpha = fade * look.alpha * (1 - melt * 0.55)
        ctx.drawImage(sprite, -along * 0.42, -across * 0.38, along * 0.84, across * 0.76)
        ctx.globalAlpha = fade * look.alpha * (0.22 + melt * 0.7)
        ctx.drawImage(sprite, -along / 2, -across / 2, along, across)
        ctx.restore()
        continue
      }
      const growth = 1 + Math.min(look.grow, age * 0.05)
      drawStamp(sprite, x, y, look.width * growth, fade * look.alpha)
      if (look.dustWidth > 0) {
        const offset = Math.min(look.dustOffset + age * 1.4, look.dustOffset + 10)
        drawStamp(
          dustSprites[paletteName],
          x + sample.px * offset,
          y + sample.py * offset,
          look.dustWidth * (1 + Math.min(0.35, age * 0.04)),
          fade * look.dustAlpha,
        )
      }
    }
  }

  function drawHead(x: number, y: number, headAlpha: number, look: CometLook) {
    if (headAlpha < 0.025) return
    const scale = clamp(Math.min(width, height) / 900, 0.75, 1.1) * (0.62 + 0.38 * headAlpha)
    const coma = look.coma * scale
    ctx.globalAlpha = headAlpha * look.head
    ctx.drawImage(comaSprite, x - coma / 2, y - coma / 2, coma, coma)
    const core = look.core * scale
    ctx.globalAlpha = headAlpha * look.head
    ctx.drawImage(coreSprite, x - core / 2, y - core / 2, core, core)
  }

  function stepMotes(dt: number) {
    const drag = Math.exp(-dt * 0.42)
    let write = 0
    for (let index = 0; index < samples.length; index += 1) {
      const sample = samples[index]
      if (!sample) continue
      if (elapsed - sample.born >= sample.life) continue
      sample.vx *= drag
      sample.vy *= drag
      sample.nx += sample.vx * dt
      sample.ny += sample.vy * dt
      samples[write] = sample
      write += 1
    }
    samples.length = write
  }

  function updateComet(dt: number, paletteName: SkyPalette) {
    if (reduceMotion) return
    const kind = getCometKind()
    if (kind !== shownKind) {
      shownKind = kind
      queuedKind = kind
      comet = null
      samples.length = 0
      nextCometAt = Math.max(elapsed + 0.3, COMET_DELAY)
    }

    if (!comet && samples.length === 0 && elapsed >= nextCometAt) {
      shownKind = queuedKind
      if (getCometKind() !== queuedKind) setCometKind(queuedKind)
      comet = createComet(queuedKind)
      queuedKind = followingKind(queuedKind)
      nextCometAt = Number.POSITIVE_INFINITY
    }

    const look = COMET_LOOK[shownKind] ?? COMET_LOOK.polvo

    let head: { x: number, y: number, alpha: number } | null = null
    if (comet) {
      comet.age += dt
      const linear = clamp(comet.age / comet.duration)
      comet.progress = linear
      const p0 = { x: comet.a.x * width, y: comet.a.y * height }
      const p1 = { x: comet.b.x * width, y: comet.b.y * height }
      const p2 = { x: comet.c.x * width, y: comet.c.y * height }
      const pos = quad(p0, p1, p2, comet.progress)
      const dist = Math.hypot(pos.x - p2.x, pos.y - p2.y)
      const fadeRadius = Math.min(width, height) * 0.11
      const headAlpha = look.snap
        ? 1 - smoothstep((linear - 0.7) / 0.3)
        : (dist >= fadeRadius ? 1 : smoothstep(dist / fadeRadius))
      const prev = quad(p0, p1, p2, Math.max(0, comet.progress - 0.008))
      const dx = pos.x - prev.x
      const dy = pos.y - prev.y
      const length = Math.hypot(dx, dy) || 1
      const px = -dy / length
      const py = dx / length
      const last = samples[samples.length - 1]
      const moved = last ? Math.hypot(pos.x - last.nx * width, pos.y - last.ny * height) : 99
      const spacing = look.snap
        ? Math.max(1.4, look.width * 0.28)
        : look.even
          ? Math.max(1.1, look.width * 0.2)
          : Math.max(1.05, look.width * 0.11)
      if ((moved > spacing || !last) && headAlpha > 0.04) {
        const span = 0.008 * comet.duration
        const carry = look.coast * (0.82 + Math.random() * 0.36)
        const spread = (look.snap ? 1.6 : look.even ? 2 : look.sprite === 'dust' ? 16 : 5) * (Math.random() - 0.5)
        const fromX = last ? last.nx * width : pos.x
        const fromY = last ? last.ny * height : pos.y
        const gap = Math.hypot(pos.x - fromX, pos.y - fromY)
        const steps = look.snap ? Math.max(1, Math.ceil(gap / spacing)) : 1
        for (let step = 1; step <= steps; step += 1) {
          const t = step / steps
          samples.push({
            nx: (fromX + (pos.x - fromX) * t) / width,
            ny: (fromY + (pos.y - fromY) * t) / height,
            vx: (dx / span * carry + px * spread) / width,
            vy: (dy / span * carry + py * spread) / height,
            px,
            py,
            born: elapsed,
            life: look.life,
          })
        }
      }
      head = headAlpha > 0.025 ? { x: pos.x, y: pos.y, alpha: headAlpha } : null
      if (linear >= 1) comet = null
    }

    stepMotes(dt)
    drawTail(paletteName, look)
    if (head) drawHead(head.x, head.y, head.alpha, look)
    ctx.globalAlpha = 1

    if (!comet && samples.length === 0 && !Number.isFinite(nextCometAt)) {
      nextCometAt = elapsed + quietGap(gapIndex)
      gapIndex += 1
    }
  }
  function frame(now: number) {
    if (stopped) return
    raf = requestAnimationFrame(frame)
    if (document.hidden) {
      last = now
      return
    }
    try {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      elapsed += dt
      const paletteName = getPalette()
      const palette = PALETTES[paletteName]

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.clearRect(0, 0, width, height)
      paintBackground(paletteName)
      if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0, width, height)

      ctx.globalCompositeOperation = 'lighter'
      drawStars(reduceMotion ? 1000 : elapsed, palette.bias)
      updateComet(dt, paletteName)
    }
    catch (error) {
      const message = error instanceof Error ? error.stack ?? error.message : String(error)
      const target = window as Window & { __skyError?: string }
      if (target.__skyError !== message) {
        target.__skyError = message
        console.error(error)
      }
    }
  }

  resize()
  raf = requestAnimationFrame(frame)
  const onResize = () => resize()
  const observer = new ResizeObserver(onResize)
  observer.observe(canvas)
  window.addEventListener('resize', onResize)
  window.visualViewport?.addEventListener('resize', onResize)

  return {
    destroy() {
      stopped = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    },
  }
}
