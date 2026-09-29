<script setup lang="ts">
import { birthExamples } from '~/data/birthExamples'
import type { BirthFormData } from '~/types/birth'

const props = defineProps<{
  appearance?: 'umbral'
}>()

const { styleId } = useSkyStyle()
const look = computed(() => props.appearance ?? styleId.value)

const fields = [
  { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Cómo aparecerá en la carta', autocomplete: 'name' },
  { key: 'date', label: 'Fecha de nacimiento', type: 'date', placeholder: '', autocomplete: 'bday' },
  { key: 'time', label: 'Hora de nacimiento', type: 'time', placeholder: '', autocomplete: 'off' },
  { key: 'city', label: 'Ciudad', type: 'text', placeholder: 'Ciudad de nacimiento', autocomplete: 'address-level2' },
  { key: 'country', label: 'País', type: 'text', placeholder: 'País', autocomplete: 'country-name' },
] as const

type FieldKey = (typeof fields)[number]['key']

const form = useState<BirthFormData>('birth-form', () => ({
  name: '',
  date: '',
  time: '',
  city: '',
  country: '',
}))

const errors = reactive<Record<FieldKey, string>>({
  name: '',
  date: '',
  time: '',
  city: '',
  country: '',
})

const saved = useState<BirthFormData | null>('birth-saved', () => null)
const selectedExampleId = useState<string | null>('birth-example', () => null)

const today = localISODate()

const shellClass = computed(() => {
  if (look.value === 'linea') return 'border-t border-[var(--line)] pt-5'
  if (look.value === 'umbral') return 'w-full text-center'
  if (look.value === 'orbita') {
    return 'rounded-[1.8rem] border border-[var(--panel-border)] bg-[var(--panel)] p-4 backdrop-blur-md md:p-5'
  }
  return 'rounded-[1.8rem] border border-[var(--panel-border)] bg-[var(--panel)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md md:p-6'
})

const introClass = computed(() => {
  if (look.value === 'umbral') return 'mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]'
  return 'mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]'
})

const examplesClass = computed(() => {
  if (look.value === 'umbral') return 'flex flex-wrap items-center justify-center gap-x-5 gap-y-2'
  return 'flex flex-wrap items-center gap-2'
})

const gridClass = computed(() => {
  if (look.value === 'umbral') return 'mx-auto mt-8 grid w-full max-w-md grid-cols-1 gap-6 text-left'
  if (look.value === 'orbita') return 'mt-4 grid grid-cols-1 gap-3 md:grid-cols-6'
  return 'mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'
})

const inputClass = computed(() => {
  const shared = 'mt-2 w-full bg-transparent text-[var(--ink)] outline-none'
  if (look.value === 'orbita') {
    return `${shared} rounded-full border border-white/10 bg-black/25 px-4 py-2.5 text-sm placeholder:text-white/35 focus-visible:border-[var(--accent)]`
  }
  if (look.value === 'umbral') {
    return `${shared} border-b border-[var(--line)] pb-1.5 font-serif text-2xl placeholder:font-serif placeholder:text-xl placeholder:italic placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)]`
  }
  return `${shared} border-b border-white/25 pb-2 text-sm placeholder:text-white/35 focus-visible:border-[var(--accent)]`
})

const buttonClass = computed(() => {
  if (look.value === 'linea') {
    return 'inline-flex items-center gap-2 self-start border-b border-[var(--accent)] pb-1 text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]'
  }
  if (look.value === 'umbral') {
    return 'inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-medium tracking-wide text-[var(--button-ink)]'
  }
  return 'inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium tracking-wide text-[var(--button-ink)]'
})

const buttonCellClass = computed(() => {
  if (look.value === 'umbral') return 'flex justify-center pt-2'
  if (look.value === 'orbita') return 'flex items-end md:col-span-2'
  return 'sm:col-span-2'
})

const headingClass = computed(() => {
  if (look.value === 'linea') return 'text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]'
  if (look.value === 'umbral') return 'text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]'
  return 'font-serif text-[1.75rem] leading-none'
})

const labelClass = computed(() => {
  if (look.value === 'umbral') return 'block text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]'
  return 'block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]'
})

const savedGridClass = computed(() => {
  if (look.value === 'umbral') return 'mx-auto mt-6 grid max-w-md gap-4 text-left text-sm sm:grid-cols-2'
  return 'mt-4 grid gap-3 text-sm sm:grid-cols-2'
})

function colClass(key: FieldKey) {
  if (look.value === 'umbral') return ''
  if (look.value === 'orbita') return 'md:col-span-2'
  if (key === 'name') return 'sm:col-span-2'
  return ''
}

function exampleChipClass(id: string) {
  const selected = selectedExampleId.value === id
  if (look.value === 'umbral') {
    return selected
      ? 'text-[var(--ink)] underline decoration-[var(--accent)] underline-offset-[6px]'
      : 'text-[var(--muted)] hover:text-[var(--ink)]'
  }
  return selected
    ? 'rounded-full border border-[var(--accent)] px-3 py-1 text-[var(--ink)]'
    : 'rounded-full border border-white/20 px-3 py-1 text-[var(--muted)] hover:border-white/40 hover:text-[var(--ink)]'
}

function localISODate(date = new Date()) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return copy.toISOString().slice(0, 10)
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day))
}

function applyExample(id: string) {
  const example = birthExamples.find(item => item.id === id)
  if (!example) return
  Object.assign(form.value, example.data)
  selectedExampleId.value = id
  for (const field of fields) errors[field.key] = ''
}

function onEdit() {
  if (saved.value) Object.assign(form.value, saved.value)
  saved.value = null
}

function validate() {
  const draft = form.value
  errors.name = draft.name.trim() ? '' : 'Escribe el nombre que irá en la carta.'
  if (!draft.date) errors.date = 'Indica la fecha de nacimiento.'
  else if (draft.date > today) errors.date = 'La fecha tiene que haber pasado ya.'
  else errors.date = ''
  errors.time = draft.time ? '' : 'Indica la hora de nacimiento.'
  errors.city = draft.city.trim().length >= 2 ? '' : 'Escribe la ciudad de nacimiento.'
  errors.country = draft.country.trim().length >= 2 ? '' : 'Escribe el país de nacimiento.'
  return fields.every(field => !errors[field.key])
}

function onSubmit() {
  if (!validate()) {
    const firstInvalid = fields.find(field => errors[field.key])
    if (firstInvalid) document.getElementById(`campo-${firstInvalid.key}`)?.focus()
    return
  }
  const draft = form.value
  saved.value = {
    name: draft.name.trim(),
    date: draft.date,
    time: draft.time,
    city: draft.city.trim(),
    country: draft.country.trim(),
  }
}
</script>

<template>
  <section id="carta" :class="shellClass" aria-labelledby="carta-titulo">
    <h2 id="carta-titulo" :class="headingClass">
      Datos del nacimiento
    </h2>
    <p :class="introClass">
      La hora es la del lugar de nacimiento. Ese lugar fija la zona horaria del cálculo.
    </p>

    <div v-if="saved" class="mt-5" aria-live="polite">
      <p class="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
        Instante guardado
      </p>
      <dl :class="savedGridClass">
        <div>
          <dt class="text-[var(--muted)]">Nombre</dt>
          <dd>{{ saved.name }}</dd>
        </div>
        <div>
          <dt class="text-[var(--muted)]">Fecha</dt>
          <dd>{{ formatDate(saved.date) }}</dd>
        </div>
        <div>
          <dt class="text-[var(--muted)]">Hora</dt>
          <dd>{{ saved.time }} h</dd>
        </div>
        <div>
          <dt class="text-[var(--muted)]">Lugar</dt>
          <dd>{{ saved.city }}, {{ saved.country }}</dd>
        </div>
      </dl>
      <p class="mt-4 text-sm text-[var(--muted)]">
        Con estos datos ya se puede calcular la carta. El cálculo llega en el siguiente paso.
      </p>
      <button
        type="button"
        class="mt-5 text-sm text-[var(--accent)] underline-offset-4 hover:underline"
        @click="onEdit"
      >
        Editar datos
      </button>
    </div>

    <form v-else class="mt-6" novalidate @submit.prevent="onSubmit">
      <div :class="examplesClass">
        <span class="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Ejemplos</span>
        <button
          v-for="example in birthExamples"
          :key="example.id"
          type="button"
          class="inline-flex items-center gap-1.5 text-xs transition-colors"
          :class="exampleChipClass(example.id)"
          @click="applyExample(example.id)"
        >
          <span>{{ example.label }}</span>
          <span :class="selectedExampleId === example.id ? 'text-[var(--accent)]' : ''">{{ example.year }}</span>
        </button>
      </div>

      <div :class="gridClass">
        <label
          v-for="field in fields"
          :key="field.key"
          class="block"
          :class="colClass(field.key)"
        >
          <span :class="labelClass">{{ field.label }}</span>
          <input
            :id="`campo-${field.key}`"
            v-model="form[field.key]"
            :class="inputClass"
            :type="field.type"
            :name="field.key"
            :placeholder="field.placeholder || undefined"
            :autocomplete="field.autocomplete"
            :max="field.type === 'date' ? today : undefined"
            :min="field.type === 'date' ? '1900-01-01' : undefined"
            :maxlength="field.type === 'text' ? 80 : undefined"
            :aria-invalid="errors[field.key] ? true : undefined"
            :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
            @input="selectedExampleId = null"
          >
          <span
            v-if="errors[field.key]"
            :id="`${field.key}-error`"
            class="mt-1 block text-xs text-[#ffb7b7]"
          >
            {{ errors[field.key] }}
          </span>
        </label>

        <div :class="buttonCellClass">
          <button type="submit" :class="buttonClass">
            Guardar datos
          </button>
        </div>
      </div>
    </form>
  </section>
</template>
