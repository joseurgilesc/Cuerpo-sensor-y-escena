# 8. Integración sonora con Tone.js

## 8.1. Preparación del proyecto en Tone.js

Tone.js es una biblioteca de JavaScript que usa la **Web Audio API** para sintetizar y procesar sonido directamente en el navegador, en el mismo sketch donde corren los visuales (p5.js).

1. Incluye Tone.js en el sketch (CDN o descarga local).
2. Inicia el contexto de audio con la primera interacción del usuario (requisito del navegador).
3. Crea las fuentes de sonido (sintetizadores o samples) y los efectos que usarás.
4. Guarda el sketch base como punto de partida.

<!-- TODO: enlazar el sketch base con Tone.js del proyecto -->

## 8.2. Conexión de datos entre p5.js y Tone.js

Al correr en el mismo sketch, p5.js y Tone.js comparten el contexto de JavaScript: los datos se pasan **directamente**, sin protocolos adicionales ni puentes.

1. p5.js recibe los datos (del cuerpo o de los sensores).
2. Normaliza y entrega cada valor a un parámetro de Tone.js.
3. Tone.js actualiza el sonido en tiempo real.

## 8.3. Recepción de datos de sensores y captura corporal

1. El sketch recibe los datos por OSC o Serial.
2. p5.js los procesa y los comparte con Tone.js.
3. Cada dato se asigna a un parámetro sonoro mediante mapeo.

## 8.4. Mapeo de gestos y sensores

Asigna cada dato a un parámetro sonoro. La regla de oro: **una acción → un resultado audible claro**.

| Dato | Parámetro sonoro típico |
| --- | --- |
| Altura de la mano | Frecuencia de filtro |
| Posición lateral | Panorámica |
| Distancia | Volumen |
| Luz | Apertura de filtro |
| Presión | Intensidad / ganancia |

## 8.5. Control de volumen y panorámica

- **Volumen**: mapea un dato continuo (distancia, presión) al volumen (`Tone.Volume`).
- **Panorámica**: mapea la posición lateral (X) al paneo izquierda–derecha (`Tone.Panner`).

## 8.6. Control de filtros y efectos

- Mapea datos a la **frecuencia de corte** de un filtro (`Tone.Filter`), a la **reverberación** (`Tone.Reverb`) o a un **delay** (`Tone.FeedbackDelay`).
- Usa un solo efecto por gesto para mantener la relación audible.

## 8.7. Disparo de notas y eventos

- Mapea **pulsadores** o **gestos discretos** al disparo de notas (`Tone.Synth`) o samples (`Tone.Player`).
- Usa eventos discretos para disparar sonidos o cambios de escena.

## 8.8. Escalamiento y suavizado de parámetros

- **Escalamiento**: ajusta el rango de entrada al rango útil del parámetro (curva lineal o exponencial).
- **Suavizado**: usa `rampTo` o un filtro de suavizado para evitar saltos bruscos y clics.

## 8.9. Presets reutilizables

Guarda cada configuración de sonido como un **preset** (un objeto con los parámetros). Un preset permite:

- Reutilizar la misma configuración en otros sketches.
- Cambiar de timbre sin rehacer el mapeo.

<!-- TODO: enlazar los presets de Tone.js del proyecto -->

## 8.10. Ejemplo sensor–sonido

Un sensor de luz controla el filtro de un sonido continuo:

```
luz ──▶ frecuencia de corte del filtro
```

## 8.11. Ejemplo cuerpo–sonido

La altura de la mano controla el filtro y la posición lateral la panorámica:

```
altura ──▶ filtro
posición X ──▶ panorámica
```

## 8.12. Configuración de latencia y audio

1. Inicia el contexto de audio (`Tone.start()`) tras una interacción del usuario.
2. Usa un **latencyHint** bajo (por ejemplo, `"interactive"`) si la respuesta lo requiere.
3. Baja la latencia hasta el punto en que no haya cortes ni chasquidos.
4. Verifica que el retardo entre acción y sonido sea imperceptible.

## 8.13. Problemas frecuentes y soluciones

| Problema | Causa probable | Solución |
| --- | --- | --- |
| No hay sonido | Contexto de audio no iniciado | Llamar `Tone.start()` tras un gesto del usuario |
| Clics o cortes de audio | Latencia muy baja o CPU saturada | Subir `latencyHint`, simplificar efectos |
| El parámetro salta | Falta suavizado | Aplicar `rampTo` o suavizado al mapeo |
| Respuesta lenta | Latencia alta | Bajar latencia, simplificar mapeo |
