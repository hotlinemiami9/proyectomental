---
type: spec
title: Spec — Carta real de Diseño Humano
description: QUÉ y POR QUÉ de la carta real — datos de nacimiento, resultado, hora ambigua y persistencia local.
tags: [sdd, spec]
timestamp: 2026-10-23T07:30:17Z
topic: sdd
slug: real-chart-calculation
status: planned
---

# Spec — Carta real de Diseño Humano

> Slug: `real-chart-calculation` · Estado: borrador · Creada: 2026-10-23
> Hereda: [constitución](../constitution.md)

## Problema y por qué

La landing recoge fecha, hora y lugar, pero no calcula nada: al enviar solo muestra
«Instante guardado» y el propio formulario promete que «el cálculo llega en el siguiente
paso». La persona no puede ver su tipo, autoridad, perfil, definición, centros, canales,
puertas ni bodygraph. La promesa central del producto queda sin cumplir.

## Coste de no construirlo

La web sigue siendo una maqueta visual. Ninguna persona obtiene una carta, el formulario
es un callejón sin salida y no se puede validar si el producto sirve. Todo lo que se
construya encima —interpretaciones, cuentas, compartir— carece de base.

## La alternativa más barata

Enlazar a un calculador externo (Jovian Archive, Genetic Matrix) con los datos ya
rellenados o con instrucciones. Entrega una carta, pero saca a la persona del sitio, rompe
la experiencia visual y no nos deja controlar ni validar la corrección. Una carta de
ejemplo estática sería engañosa.

## Objetivos

- Una persona puede introducir sus datos y obtener una carta esencial completa.
- La carta muestra tipo, autoridad, perfil, definición, centros definidos e indefinidos,
  canales, puertas activas y bodygraph.
- El resultado es reproducible y coincide con Jovian en las cinco cartas de referencia.
- La última carta se recuerda en el mismo navegador.
- El lugar, la zona horaria y los cambios de hora se resuelven sin ambigüedades
  silenciosas.

## No objetivos / fuera de alcance

- Interpretaciones escritas o lecturas generadas.
- Cuentas, historial, enlaces para compartir, persistencia en servidor o Supabase.
- Cartas de tránsito, compuestas, de retorno o de relación.
- Variables, PHS, cruce de encarnación y carta completa.
- Modo «hora desconocida».
- Varios idiomas; la UI es solo española.
- API pública para terceros.

## Usuarios y contexto

Una persona hispanohablante que conoce —o puede averiguar— su fecha, hora exacta y ciudad
de nacimiento. Llega a la landing, posiblemente desde el móvil, y espera ver su carta
después de enviar. Puede no saber la zona horaria ni si su hora cayó en un cambio de hora;
la app debe resolverlo desde el lugar y la fecha, y preguntar solo cuando no haya una
respuesta única.

## Comportamiento

- **Camino principal:** en `/`, la persona rellena nombre, fecha, hora, ciudad y país;
  elige una ciudad del autocompletado; envía. La app resuelve coordenadas y zona horaria,
  calcula y lleva a `/carta`.
- `/carta` muestra primero el resumen (tipo, autoridad, perfil, definición), después el
  bodygraph, después canales y puertas, y una tabla colapsable con las 26 activaciones
  (13 cuerpos × Diseño/Personalidad).
- La carta muestra el nombre y los datos de nacimiento usados.
- Si no hay una carta guardada, `/carta` muestra un estado vacío con un enlace para crearla;
  no una página rota.
- La última entrada se recuerda en el mismo navegador; al volver a `/carta` se recalcula y
  se muestra. Una acción explícita permite borrarla.
- Si la ciudad no aparece en el autocompletado, se puede fijar el lugar en un mapa con
  teselas de OpenStreetMap y su atribución; la zona horaria se deriva y se muestra para
  confirmar.
- Si la hora local es ambigua (se repite al atrasar el reloj), la app pide elegir el offset
  antes de calcular.
- Si la hora local no existe (se salta al adelantar el reloj), la app rechaza el envío con
  un mensaje claro y pide una hora válida.
- Si faltan datos o son inválidos, errores en línea; no se calcula.
- Si el cálculo falla, mensaje claro con opción de reintentar; no se muestran detalles
  internos.
- La carta no se guarda en el servidor. No se registran datos de nacimiento en logs.
- La página es usable con teclado, en móvil y con lector de pantalla; el bodygraph tiene
  una alternativa textual.

## Criterios de aceptación

- Dada la fecha, hora y lugar de Alba (1991-04-14 06:28, Santiago de Compostela), cuando se
  envían, entonces la carta coincide con Jovian en tipo, autoridad, perfil, definición,
  centros definidos, canales y las 26 activaciones.
- Lo mismo para Río (1985-09-02 21:14, Montevideo), Isla (1998-01-29 11:03, Lisboa) y el
  histórico de Londres (1944-06-01 12:00).
- Dada la fecha, hora y lugar de Madrid (1991-09-29 02:30) con el offset CEST (UTC+2)
  fijado, cuando se calcula, entonces coincide con la referencia de Jovian para ese
  instante.
- Dados los cinco fixtures de Jovian versionados antes de implementar, cuando se ejecutan
  las pruebas, entonces la carta coincide con ellos; la implementación no genera sus
  propios valores esperados.
- Dados datos incompletos o inválidos, cuando se envía el formulario, entonces se muestran
  errores en línea y no se calcula.
- Dada una ciudad escrita, cuando se elige una sugerencia del autocompletado, entonces la
  carta usa las coordenadas y la zona horaria de esa sugerencia.
- Dada una ciudad sin resultados, cuando se fija un punto en el mapa, entonces la carta usa
  esas coordenadas y la zona horaria derivada.
- Dada la fecha, hora y lugar de Madrid (1991-09-29 02:30) sin offset fijado, cuando se
  envía, entonces la app pide elegir entre CEST y CET y no calcula hasta que se elige.
- Dada una hora inexistente, cuando se envía, entonces la app rechaza con un mensaje y no
  muestra carta.
- Dada una carta válida, cuando se abre `/carta`, entonces el resumen aparece antes del
  bodygraph y ambos se muestran sin scroll horizontal a 320 px y a 1280 px.
- Dada una carta guardada, cuando se vuelve en el mismo navegador, entonces se recalcula y
  se muestra la última.
- Dado `/carta` sin carta guardada, cuando se abre, entonces aparece un estado vacío con un
  enlace para crearla.
- Dada la carta, cuando se navega solo con teclado, entonces todos los controles son
  alcanzables con Tab y tienen nombre accesible; el bodygraph tiene texto alternativo.
- Dado un error de cálculo, cuando ocurre, entonces se muestra un mensaje claro y se puede
  reintentar; no aparecen datos de nacimiento en logs.
- Dada una petición inválida al cálculo, cuando se procesa, entonces devuelve un código
  estable y un mensaje en español, sin traza.

## Puntos a aclarar

- **suposición tomada** — las cinco referencias se generan con el calculador gratuito de
  Jovian; para Madrid se fija el primer offset (CEST, UTC+2) y se introduce el instante UTC
  equivalente. *Base:* es la fuente elegida y no requiere cuenta. *Riesgo:* si Jovian no
  acepta 1944, se busca la versión UTC del mismo instante; si aun así no se puede, se
  detiene la implementación y se enmienda la constitución explícitamente, nunca se baja el
  listón en silencio.
- **suposición tomada** — los cinco fixtures de Jovian se capturan y versionan antes de
  escribir el cálculo; la implementación no genera sus propios valores esperados. *Base:*
  evitar una validación circular. *Riesgo:* si un caso no se puede capturar, se aplica la
  regla de enmienda explícita.
- **suposición tomada** — la geocodificación y las teselas del mapa usan
  OpenStreetMap/Photon, sin clave, con atribución visible y uso ligero. *Base:* elección
  explícita de mapa OSM. *Riesgo:* políticas de uso y límites; si crece, self-host o
  proveedor con clave.
- **suposición tomada** — el tema del bodygraph es único (oro/violeta), no cambia con los
  cuatro estilos de cielo. *Base:* decisión de la ronda 4. *Riesgo:* si la carta se siente
  desconectada de la portada, se revisa el tema, no la estructura.
- **decisión diferida** — compartir por enlace, historial y cuentas; fuera de este ciclo.
- **decisión diferida** — interpretación escrita de tipo, autoridad y perfil; fuera de este
  ciclo.
- **área no formulable** — cómo explicar que una carta cambie si se actualiza el motor;
  todavía no está lo bastante definida para preguntarla.

## Revisions

- 2026-10-23 — Revisión fresca: Madrid fijado a CEST (UTC+2) para la golden; ambigüedad
  probada aparte; fixtures de Jovian versionados antes de implementar; fallback de mapa con
  OpenStreetMap y atribución; regla de enmienda explícita si Jovian no cubre 1944.
- 2026-10-23 — Aprobada por la persona. Clarify: sin preguntas abiertas; las suposiciones
  tipadas quedan validadas por la aprobación.
- 2026-10-23 — Plan técnico aprobado; tareas derivadas. Estado: `planned`.
