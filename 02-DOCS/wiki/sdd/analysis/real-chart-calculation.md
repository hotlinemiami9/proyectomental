---
type: analysis
title: Analysis — real-chart-calculation
description: Gate de consistencia entre constitución, spec, plan y tareas antes de implementar.
tags: [sdd, analysis]
timestamp: 2026-10-23T07:30:17Z
topic: sdd
slug: real-chart-calculation
status: complete
---

# Analysis — real-chart-calculation

> Gate de pre-implementación. Solo informa; no edita artefactos.
> Fecha: 2026-10-23

## Veredicto

**GATE: PASS** — 0 CRITICAL, 0 HIGH, 1 LOW aceptado.

## Mapa de cobertura

| ID | Requisito de la spec | Plan | Tareas | Estado |
|---|---|---|---|---|
| R1 | Cinco golden charts contra Jovian | §5, §6 | T001, T013 | covered |
| R2 | Datos incompletos o inválidos | §3, §5 | T011, T012, T019, T020 | covered |
| R3 | Autocompletado de lugar y zona | §3, §4 | T009, T010, T019, T020 | covered |
| R4 | Fallback de mapa con OSM y atribución | §3, §4 | T019, T020 | covered |
| R5 | Hora ambigua: preguntar offset | §3, §4 | T003, T004, T011, T012, T021 | covered |
| R6 | Hora inexistente: rechazar | §3, §4 | T003, T004, T011, T012, T021 | covered |
| R7 | `/carta`: resumen, bodygraph, tabla | §3, §6 | T016, T017, T018 | covered |
| R8 | Persistencia local de la última entrada | §3, §4 | T014, T015, T018, T021 | covered |
| R9 | Estado vacío de `/carta` | §4, §6 | T018, T021 | covered |
| R10 | Accesibilidad y teclado | §5 | T018, T021, T022 | covered |
| R11 | Errores claros y sin datos en logs | §3, §5 | T012, T021, T022 | covered |
| R12 | API inválida con código estable | §3, §5 | T011, T012 | covered |
| R13 | Rendimiento p95 y SVG < 150 KB | §0, §5 | T022, T023 | covered |

## Hallazgos

| # | Severidad | Tipo | Artefacto A | Artefacto B | Conflicto | Resolver en |
|---|---|---|---|---|---|---|
| 1 | LOW | AMBIGUOUS | T001 | spec §Acceptance #1–#5 | La captura de fixtures es manual; el done-check no valida el esquema del JSON | tasks (aceptado: captura única revisada; T013 usa los fixtures) |

Sin contradicciones, duplicaciones ni drift. Las decisiones de mapa (`Leaflet + OSM`), runner (`@playwright/test`) y aislamiento (`worktree`) están cerradas en el plan. La atribución MIT del renderer está en T016; la dependencia de axe está en T002.

## Routing recomendado

- No hay bloqueos. Se puede pasar a `implement`.
- T013 es la puerta crítica: si los cinco golden fallan, se corrige el mapeo o se cambia de engine antes de T016–T018.
- T001 se acepta como tarea manual de captura; su evidencia son los cinco JSON versionados.

## Evidencia

- Constitución v1.0.0 ratificada.
- Spec `real-chart-calculation` en estado `planned`.
- Plan aprobado con 23 tareas y done-checks.
- Cobertura R1–R13 sin gaps.
