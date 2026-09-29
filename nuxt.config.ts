import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: [
    '@fontsource-variable/outfit/wght.css',
    '@fontsource/cormorant-garamond/500.css',
    '@fontsource/cormorant-garamond/600.css',
    '@fontsource/cormorant-garamond/500-italic.css',
    '~/assets/css/main.css',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Diseño Humano',
      meta: [
        {
          name: 'description',
          content: 'Recoge la fecha, la hora y el lugar de nacimiento para calcular una carta de Diseño Humano.',
        },
      ],
    },
  },
})
