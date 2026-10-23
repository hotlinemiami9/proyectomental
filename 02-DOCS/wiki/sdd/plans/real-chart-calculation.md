---
type: plan
title: Plan — Carta real de Diseño Humano
description: Plan técnico de la carta real — arquitectura, contratos, flujo, pruebas y riesgos.
tags: [sdd, plan]
timestamp: 2026-10-23T07:30:17Z
topic: sdd
slug: real-chart-calculation
status: approved
---

# Plan — Carta real de Diseño Humano

> Spec: [../specs/real-chart-calculation.md](../specs/real-chart-calculation.md) ·
> Constitución: [../constitution.md](../constitution.md) · Estado: aprobado
> Última actualización: 2026-10-23

## 0. Global Constraints

- **Runtime:** Node 24.17.0; pnpm 11.17.0; un solo `pnpm-lock.yaml`.
- **Stack:** Nuxt 4.5.2, Vue 3.5.43, TypeScript, Nitro 2.13.4, Vite 8.3.1, Tailwind 4.3.3.
- **Cálculo:** solo en servidor; `free-human-design@1.0.1` (MIT) fijado. El motor no viaja al navegador.
- **Renderer:** `@gonzih/hd-bodygraph@1.4.1` (MIT) vendorizado como función SVG pura, sin React, con atribución.
- **Lugar:** Photon/OpenStreetMap desde el servidor, `tz-lookup`, sin clave; teselas OSM con atribución visible.
- **Rutas:** `/` y `/carta`; APIs `GET /api/places` y `POST /api/chart`.
- **Errores:** envoltura `{ code, message, fields? }`; códigos `INVALID_INPUT`, `AMBIGUOUS_TIME`, `NONEXISTENT_TIME`, `PLACE_NOT_FOUND`, `CALCULATION_FAILED`.
- **Datos:** sin persistencia en servidor ni logs de nacimiento; `localStorage` solo guarda la última entrada, clave `pm:last-chart:v1`.
- **Calidad:** `pnpm typecheck`, `pnpm test` y `pnpm build` pasan; 5/5 golden charts de Jovian para cambios de cálculo.
- **UI:** español, `lang="es"`; WCAG 2.2 AA; usable a 320 px.
- **Rendimiento:** cálculo p95 < 1 s sin geocodificación; SVG del bodygraph < 150 KB.
- **Git:** `main`; autoría humana; sin `Co-Authored-By` de IA; push/PR/merge solo con confirmación.

## 1. Context & constraints

- **Criterios que mandan:** spec §Criterios de aceptación #1–#12, en especial los cinco golden charts, la ambigüedad de Madrid, la persistencia local y la accesibilidad.
- **Constitución:** principios 3 (cálculo en servidor), 4 (licencias y atribución), 5–8 (calidad), 14–15 (privacidad), 16–17 (UX/DST), 18 (rendimiento).
- **Fuera de alcance:** interpretaciones, cuentas, historial, compartir, Supabase, tránsitos, variables, hora desconocida, otros idiomas.
- **Decisión de aislamiento:** el onboarding eligió `main`; el plan recomienda worktree por el tamaño del cambio. Se decide antes de implementar.

## 2. Architecture

```text
[Landing form] --GET /api/places--> [Places API] --Photon/OSM--> [Geocoder externo]
       |                                  |
       |                                  +--> [tz-lookup]
       |--POST /api/chart--> [Chart API] --free-human-design--> [Engine]
       |                           |--[Definition util]--> [Chart DTO]
       |                           +--> [DST resolver]
       |
       +--> [Carta page] --render--> [Bodygraph renderer] --SVG--> DOM
                    |--read/write--> [localStorage]
                    |--tiles--> [OpenStreetMap]
```

- **Landing form** (interna) — recoge datos, autocompleta lugar, muestra errores y el diálogo de hora ambigua.
- **Places API** (interna) — busca lugares, devuelve coordenadas y zona; no persiste.
- **Chart API** (interna) — valida, resuelve el instante UTC, calcula y devuelve el DTO.
- **Engine adapter** (interna) — envuelve `free-human-design` y normaliza nombres de centros y activaciones.
- **Definition util** (interna) — calcula `none/single/split/triple split/quadruple split` desde los canales definidos.
- **DST resolver** (interna) — detecta horas ambiguas e inexistentes y devuelve los offsets posibles.
- **Carta page** (interna) — resumen, bodygraph, canales/puertas, tabla de activaciones y estado vacío.
- **Bodygraph renderer** (interna, vendorizada) — función pura `renderBodyGraph(input, theme) -> string`; sin React.
- **localStorage** (externa al servidor) — última entrada, no resultados.
- **Photon/OSM** (externa) — geocodificación y teselas; atribución obligatoria.
- **Jovian** (externa, solo fixtures) — fuente de los cinco valores esperados; no se llama en runtime.

**Decisión principal:** el cálculo vive en el servidor. `free-human-design` es Node-first y así el cliente queda ligero, la privacidad es más fácil de controlar y la validación se hace una sola vez. El renderer es una función pura en el cliente porque solo transforma datos ya calculados en SVG.

## 3. Interfaces & contracts

```text
GET /api/places?q=<texto>
  -> { places: Place[] } | { code: "PLACE_NOT_FOUND" | "INVALID_INPUT", message }
  - Place = { id, label, city, country, lat, lon, timezone }
  - máximo 8 resultados; sin persistencia; sin logs del texto de búsqueda.

POST /api/chart
  input: { name, date, time, place: { label, lat, lon, timezone } }
  -> { input, chart } | ChartError
  - chart = { type, authority, profile, definition, centers, channels, gates, activations, bodygraph }
  - centers = { defined: CenterKey[], open: CenterKey[] }
  - activations = { design: Activation[13], personality: Activation[13] }
  - Activation = { body, gate, line, color? }
  - bodygraph = { definedCenters, gateActivations, channels, type, profile, authority }
  - invariante: mismo input + misma zona -> mismo chart.
  - no escribe en disco ni en logs de nacimiento.

ChartError =
  | { code: "INVALID_INPUT", message, fields: Record<string,string> }
  | { code: "AMBIGUOUS_TIME", message, offsets: [{ label, offsetMinutes }] }
  | { code: "NONEXISTENT_TIME", message }
  | { code: "CALCULATION_FAILED", message }

resolveBirthInstant(date, time, timezone)
  -> { utc: string, offsetMinutes: number, ambiguous: false, nonexistent: false }
   | { ambiguous: true, offsets: [...] }
   | { nonexistent: true }
  - usa la base IANA histórica, no el offset actual.

computeDefinition(definedChannels: Channel[])
  -> { definition: "none"|"single"|"split"|"triple split"|"quadruple split", groups: CenterKey[][] }
  - componentes conexas de centros unidos por canales definidos.

renderBodyGraph(input: BodygraphInput, theme: BodygraphTheme) -> string
  - función pura, sin DOM, sin React; devuelve SVG con título y descripción accesibles.

lastChart
  - load(): BirthInput | null
  - save(input): void
  - clear(): void
  - clave `pm:last-chart:v1`; solo entrada, nunca el resultado calculado.
```

## 4. Data model & flow

**Entidades**

- **BirthInput** — `name`, `date` (YYYY-MM-DD), `time` (HH:mm), `place` (`label`, `city`, `country`, `lat`, `lon`, `timezone`).
- **Place** — resultado de geocodificación; `lat`/`lon` con signo, `timezone` IANA.
- **Chart** — tipo, autoridad, perfil, definición, centros, canales, puertas y 26 activaciones.
- **Activation** — cuerpo, puerta (1–64), línea (1–6), lado (`design`/`personality`).
- **Channel** — clave `"10-20"`, dos puertas, centros que une.
- **Center** — `head`, `ajna`, `throat`, `g`, `heart`, `sacral`, `solarplexus`, `spleen`, `root`; mapeado a los nombres del renderer.

**Flujo principal**

1. La persona rellena `/` y elige una sugerencia de lugar.
2. `GET /api/places` devuelve coordenadas y zona; el formulario las guarda en el estado.
3. `POST /api/chart` valida, resuelve el instante UTC y llama al engine.
4. El engine devuelve activaciones, canales y centros; el adapter calcula la definición que falta.
5. La entrada se guarda en `localStorage`; el DTO calculado no se persiste. Se navega a `/carta`.
6. `/carta` reconstruye el `bodygraph` y renderiza resumen, SVG, canales/puertas y tabla.
7. Al volver, `lastChart.load()` recupera la entrada y se recalcula; si no hay, estado vacío.

**Flujo DST**

1. El resolver comprueba la hora local contra la base IANA.
2. Si es ambigua, `POST /api/chart` devuelve `AMBIGUOUS_TIME` con los offsets; la UI pregunta.
3. Si no existe, devuelve `NONEXISTENT_TIME`; la UI pide otra hora.
4. Si es única, devuelve el instante UTC y sigue.

**Consistencia y migración**

- Sin base de datos ni migraciones. `localStorage` es la única persistencia; se versiona la clave.
- El servidor no guarda nada; los logs solo registran códigos de error agregados, nunca entradas.

## 5. Testing strategy

| Criterio de aceptación | Nivel | Afirma | Fakes |
|---|---|---|---|
| Golden Alba, Río, Isla, Londres, Madrid CEST | integración | tipo, autoridad, perfil, definición, centros, canales y 26 activaciones contra Jovian | ninguno: engine real y fixtures reales |
| Fixtures versionados antes de implementar | contrato | los cinco JSON existen y tienen los valores esperados | ninguno |
| Datos incompletos o inválidos | unitario + contrato | errores en línea; API `INVALID_INPUT` con campos | Places API mockeada |
| Autocompletado y mapa | unitario + e2e | se guardan lat/lon/zona; atribución OSM visible | Photon mockeado en unitario; teselas no cargadas en e2e |
| Hora ambigua | unitario + e2e | la API devuelve dos offsets; la UI no calcula hasta elegir | ninguno |
| Hora inexistente | unitario + e2e | la API rechaza; la UI muestra el mensaje | ninguno |
| `/carta` con y sin carta | e2e | resumen antes del bodygraph; estado vacío correcto | ninguno |
| Persistencia local | unitario + e2e | se guarda solo la entrada; se recalcula; se borra | localStorage real en e2e |
| Accesibilidad | e2e | Tab alcanza todos los controles; SVG con título/desc; sin violaciones críticas | axe opcional |
| Error de cálculo | contrato + e2e | código estable, mensaje humano, reintento; sin datos en logs | engine forzado a fallar |
| Rendimiento | integración | p95 < 1 s; SVG < 150 KB | medición local |

- **Unidad:** definición, mapeo de centros/activaciones, DST, validación, storage.
- **Contrato:** APIs con Photon mockeado; formas de error.
- **Integración:** Chart API + engine real + cinco fixtures de Jovian.
- **E2E:** Playwright; formulario, `/carta`, persistencia, ambigüedad, teclado, 320 px y 1280 px.
- **Dependencia real que no se mockea:** el engine y los fixtures de Jovian; si se mockean, la prueba no vale.
- **Fixtures:** `test/fixtures/jovian/<slug>.json`, capturados de Jovian antes de escribir el cálculo.

## 6. Sequencing & dependencies

1. Capturar y versionar los cinco fixtures de Jovian — depende de: nada — serial y bloqueante.
2. Añadir Vitest, `pnpm test`, `pnpm typecheck` y la estructura de fixtures — depende de: nada — serial.
3. Places API + `tz-lookup` + DST resolver — depende de: #2 — paralelizable con #4.
4. Chart API + engine adapter + Definition util — depende de: #2 y del contrato de lugar — serial.
5. Golden tests contra los cinco fixtures — depende de: #1 y #4 — serial y bloqueante.
6. Vendorizar el renderer MIT, quitar React y aplicar el tema único — depende de: #4 (forma del DTO) — paralelizable con #5.
7. `/carta`: resumen, SVG, canales/puertas, tabla y estado vacío — depende de: #4 y #6 — serial.
8. Formulario: autocompletado, mapa OSM, diálogo DST y guardado local — depende de: #3 y #4 — serial.
9. E2E, accesibilidad, rendimiento y build — depende de: #5, #7 y #8 — serial.
10. Verify, review y ship — depende de: #9 — serial.

- **Paralelizables:** #3 y #4 con contratos fijados; #6 y #5.
- **Orden duro:** fixtures antes de golden; golden antes de UI; renderer después del DTO.

## 7. Risks & open decisions

**Riesgos**

| Riesgo | Disparador | Impacto | Mitigación / spike |
|---|---|---|---|
| `free-human-design` no coincide con Jovian | golden test rojo | alto: carta incorrecta | comparar tipo/autoridad/perfil/definición/activaciones; corregir mapeo o cambiar de engine antes de la UI |
| Jovian no acepta 1944 o la hora ambigua | calculador devuelve error | medio: se rompe el 5/5 | usar el instante UTC equivalente; si aun así falla, enmienda explícita a la constitución, nunca bajar el listón en silencio |
| Photon/OSM con límites o sin ciudad | búsqueda vacía o 429 | medio: no se puede calcular | proxy servidor, caché corta y fallback de mapa; atribución visible |
| DST mal resuelto | hora cerca del cambio | alto: cambia tipo/autoridad | tests unitarios con Madrid 1991, Londres 1944 y casos históricos |
| Renderer vendorizado con React o licencia | import falla / revisión legal | medio | copiar solo SVG, conservar MIT y atribución, test de render |
| Tema del bodygraph ilegible | revisión visual | medio | tema único oro/violeta, contraste y QA en móvil |
| Datos de nacimiento en logs | revisión de logs | alto: privacidad | no loguear entradas; test que inspecciona logs |
| `localStorage` con resultados obsoletos | cambio de engine | bajo | guardar solo la entrada y recalcular |
| Coolify no arranca Nitro | deploy | bajo | probar `pnpm build` y `node .output/server/index.mjs` antes de desplegar |

**Decisiones cerradas al aprobar el plan**

- **Aislamiento:** worktree/rama, elegido por la persona. `main` queda limpio.
- **Mapa:** Leaflet (MIT) + teselas OSM con atribución.
- **Runner e2e:** `@playwright/test` como dependencia de desarrollo; el MCP actual sirve para pruebas manuales, no para CI.

## Tasks

<!-- generated by tasks on 2026-10-23; IDs are stable, do not renumber -->

| ID | [P] | Task | Done-check | Depends-on | Trace |
| --- | --- | --- | --- | --- | --- |
| T001 | [P] | Capturar los cinco fixtures de Jovian | `test -f test/fixtures/jovian/{alba,rio,isla,londres-1944,madrid-cest}.json` y cada uno contiene 26 activaciones revisadas contra Jovian | — | spec §Acceptance #1–#5 |
| T002 | [P] | Añadir Vitest, `@playwright/test`, `@axe-core/playwright`, `pnpm test`, `pnpm test:e2e`, `pnpm typecheck` y un smoke test | `pnpm test`, `pnpm test:e2e --list` y `pnpm typecheck` terminan en 0 | — | constitution §2.5–6 |
| T003 | [P] | Escribir tests DST que fallan | `pnpm test tests/server/dst.spec.ts` falla por la razón correcta | T002 | spec §Behaviour DST |
| T004 |  | Implementar el resolver DST | T003 verde; Madrid ambiguo y hora inexistente cubiertos | T003 | spec §Acceptance DST |
| T005 | [P] | Escribir tests de definición que fallan | `pnpm test tests/server/definition.spec.ts` falla por la razón correcta | T002 | spec §Behaviour definición |
| T006 |  | Implementar el calculador de definición | T005 verde; `none/single/split/triple split/quadruple split` | T005 | spec §Acceptance #1–#5 |
| T007 |  | Escribir tests del adaptador de engine | `pnpm test tests/server/engine-adapter.spec.ts` falla por la razón correcta | T004, T006 | spec §Behaviour |
| T008 |  | Implementar adaptador + DTO de carta | T007 verde; centros, activaciones y canales normalizados | T007 | spec §Acceptance #1–#5 |
| T009 | [P] | Escribir tests del Places API | `pnpm test tests/server/places.spec.ts` falla por la razón correcta | T002 | spec §Behaviour autocompletado |
| T010 |  | Implementar Places API + Photon + `tz-lookup` | T009 verde; `GET /api/places?q=Santiago` devuelve lat/lon/zona | T009 | spec §Acceptance autocompletado |
| T011 |  | Escribir tests de contrato de `POST /api/chart` | `pnpm test tests/server/chart-api.spec.ts` falla por la razón correcta | T008, T010 | spec §Acceptance #10–#11 |
| T012 |  | Implementar `POST /api/chart` + errores + no logs | T011 verde; códigos `INVALID_INPUT`, `AMBIGUOUS_TIME`, `NONEXISTENT_TIME`, `CALCULATION_FAILED` | T011 | spec §Acceptance #10–#11 |
| T013 |  | Golden tests contra los cinco fixtures | `pnpm test tests/server/chart.golden.spec.ts` verde 5/5 | T001, T012 | spec §Acceptance #1–#5 |
| T014 | [P] | Escribir tests de `lastChart` | `pnpm test tests/client/last-chart.spec.ts` falla por la razón correcta | T002 | spec §Behaviour persistencia |
| T015 |  | Implementar `lastChart` | T014 verde; guarda solo la entrada y borra con `clear()` | T014 | spec §Acceptance persistencia |
| T016 | [P] | Vendorizar el renderer MIT, aplicar el tema único y conservar la atribución | `pnpm test tests/client/bodygraph.spec.ts` verde; SVG contiene centros/canales; sin React; < 150 KB; `NOTICE` con MIT | T008 | constitution §1.4, spec §Acceptance bodygraph |
| T017 |  | Escribir tests de mapeo de `/carta` | `pnpm test tests/client/chart-page.spec.ts` falla por la razón correcta | T008 | spec §Acceptance #6 |
| T018 |  | Implementar `/carta` + resumen + bodygraph + tabla + vacío | T017 verde; `pnpm build` pasa | T017, T015, T016 | spec §Acceptance #6–#9 |
| T019 |  | Escribir tests de integración del formulario | `pnpm test tests/client/form.spec.ts` falla por la razón correcta | T010, T012 | spec §Acceptance autocompletado/DST |
| T020 |  | Implementar formulario: autocompletado, mapa OSM y diálogo DST | T019 verde; flujo manual completo | T019 | spec §Behaviour |
| T021 |  | E2E Playwright: flujo, ambigüedad, vacío, local, teclado | `pnpm test:e2e` verde | T013, T018, T020 | spec §Acceptance #6–#10 |
| T022 |  | Accesibilidad y rendimiento | axe sin violaciones críticas; navegación con Tab; p95 < 1 s; SVG < 150 KB | T021 | constitution §6–7 |
| T023 |  | Verificación final y handoff a review | `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build` y golden 5/5 en verde | T022, T013 | constitution §2 |

**Forecast de revisión**

- ~20 tareas, cambio por encima del presupuesto de 400 líneas: revisar por cortes, no en un solo diff.
- Revisión crítica en T013 (golden 5/5) y T023 (verificación final).
- Estrategia de entrega: worktree/rama propia; sin push ni merge sin confirmación.
- Riesgo alto si T013 falla: se corrige el mapeo o se cambia de engine antes de T016–T018.
