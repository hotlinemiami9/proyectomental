---
type: constitution
title: pm — Constitution
description: Los principios no negociables que todas las fases de rsc-sdd deben obedecer.
tags: [sdd, constitution]
timestamp: 2026-10-23T07:30:17Z
topic: sdd
version: v1.0.0
---

# pm — Constitution

> Versión: v1.0.0 · Ratificada: 2026-10-23 · Última enmienda: 2026-10-23
> Los principios no negociables de cada fase SDD. Los detalles de stack viven en
> `package.json`, `nuxt.config.ts` y `02-DOCS/wiki/`; aquí se ratifica el principio.

## 1. Stack canónico

1. Nuxt 4.5, Vue 3.5, TypeScript, Nitro, Vite 8 y Tailwind 4 vía `@tailwindcss/vite`.
   Cambiar un framework central es una enmienda MAJOR.
2. Node 24 y pnpm 11. Un solo lockfile (`pnpm-lock.yaml`); no se aceptan
   `package-lock.json` ni `yarn.lock`.
3. El cálculo de la carta corre en una ruta de servidor de Nuxt. El navegador nunca
   calcula la carta.
4. Solo dependencias con licencia permisiva (MIT, Apache-2.0, BSD). Nada AGPL ni sin
   licencia sin aprobación explícita. El motor y el renderer de la carta se fijan a una
   versión exacta. Las teselas de OpenStreetMap conservan su atribución visible.

## 2. Listón de calidad

5. TypeScript estricto: `pnpm typecheck` debe existir y pasar antes de mergear. Se añade
   con la primera feature.
6. `pnpm test` debe existir y pasar. La lógica pura de la carta sigue rojo → verde →
   refactor.
7. La corrección de la carta se valida contra las cinco cartas golden de Jovian. Sin 5/5
   no se construye la UI de la carta.
8. `pnpm build` pasa. No se mergea con errores de SSR ni de hidratación.

## 3. Convenciones

9. El código sigue el estilo existente: 2 espacios, comillas simples, sin punto y coma,
   `<script setup lang="ts">`. No hay formatter/linter automático todavía; lo exige la
   revisión. Añadirlo es una enmienda MINOR.
10. La UI está en español, con `lang="es"`. Cada término técnico se define la primera vez
    que aparece.
11. Los errores del servidor devuelven un código estable y un mensaje humano. Nunca se
    expone una traza ni datos de nacimiento.

## 4. Ramas y entrega

12. El trabajo aterriza en `main` (elegido en el onboarding). No se hace force-push.
13. La autoría de los commits es de la persona. Sin `Co-Authored-By` de una IA ni pies de
    «generated with». Push, PR y merge solo con confirmación explícita.

## 5. Seguridad y privacidad

14. Los datos de nacimiento son personales: no se registran en logs, no se persisten en el
    servidor y no se envían a terceros más allá de la consulta de geocodificación. El
    navegador solo recuerda la última carta.
15. Los secretos viven en `.env` (ignorado por git); `.env.example` solo contiene
    marcadores.

## 6. UX y accesibilidad

16. WCAG 2.2 AA: navegable con teclado, campos etiquetados, errores asociados, foco
    visible, bodygraph con alternativa textual y usable a 320 px.
17. Las horas ambiguas o inexistentes por cambio de hora nunca se adivinan en silencio: se
    pregunta el offset o se rechaza con un mensaje claro.

## 7. Rendimiento

18. El cálculo de la carta responde en p95 < 1 s, sin contar la geocodificación; el SVG del
    bodygraph pesa < 150 KB y el motor de cálculo no viaja al navegador.

## 8. Conocimiento y decisiones

19. Cada decisión significativa se añade a `02-DOCS/wiki/harness/decisions.md`. Los
    artefactos SDD viven en `02-DOCS/wiki/sdd/` y se indexan en `02-DOCS/wiki/index.md`.
20. Jovian Archive es la fuente de verdad de la carta. Una discrepancia es un bug, no una
    preferencia.

## Definition of Done (lo que `verify` comprueba)

Un cambio se entrega solo cuando todo esto se cumple:

- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm test` pasa; 5/5 golden charts si cambia el cálculo.
- [ ] `pnpm build` pasa.
- [ ] Sin datos de nacimiento en logs ni almacenamiento del servidor.
- [ ] Accesibilidad revisada: teclado, etiquetas, contraste y título del SVG.
- [ ] Decisiones registradas; spec y plan actualizados.
- [ ] Aceptación de la persona sobre el comportamiento visible.

## Registro de enmiendas

| Fecha | Versión | Cambio | Por qué |
|---|---|---|---|
| 2026-10-23 | draft | Borrador redactado tras el grilling y la calibración del repo. | Pendiente de ratificación. |
| 2026-10-23 | v1.0.0 | Ratificada la constitución inicial con 20 principios. | Aprobación explícita de la persona. |
