# 8. Integración sonora con Ableton Live

## 8.1. Preparación de la sesión de Ableton Live

Crea una **sesión base** reutilizable:

1. Configura la interfaz de audio y la latencia.
2. Crea pistas con los instrumentos o samples que usarás.
3. Organiza y nombra las pistas con claridad.
4. Guarda la sesión como plantilla (`.als`).

<!-- TODO: enlazar la plantilla .als del proyecto cuando exista -->

## 8.2. Configuración de entradas MIDI u OSC

- **MIDI**: habilita el puerto MIDI del programa puente en **Preferencias → Link/MIDI**.
- **OSC**: configura la conexión OSC entrante y el puerto.

<!-- TODO: indicar si se usa Ableton OSC (Live 12) o un puente externo -->

## 8.3. Recepción de datos de sensores y captura corporal

1. El puente convierte los datos a mensajes MIDI u OSC.
2. Ableton recibe esos mensajes.
3. Cada mensaje se asigna a un parámetro mediante mapeo.

## 8.4. Mapeo de gestos y sensores

Asigna cada dato a un parámetro musical. La regla de oro: **una acción → un resultado audible claro**.

| Dato | Parámetro musical típico |
| --- | --- |
| Altura de la mano | Frecuencia de filtro |
| Posición lateral | Panorámica |
| Distancia | Volumen |
| Luz | Apertura de filtro |
| Presión | Intensidad / ganancia |

## 8.5. Control de volumen y panorámica

- **Volumen**: mapea un dato continuo (distancia, presión) al volumen de una pista.
- **Panorámica**: mapea la posición lateral (X) al paneo izquierda–derecha.

## 8.6. Control de filtros y efectos

- Mapea datos a la **frecuencia de corte** de un filtro, a la **reverberación** o a un **delay**.
- Usa un solo efecto por gesto para mantener la relación audible.

## 8.7. Control de reproducción y lanzamiento de eventos

- Mapea **pulsadores** o **gestos discretos** al lanzamiento de clips y escenas.
- Usa eventos discretos (nota MIDI) para disparar samples o cambios de escena.

## 8.8. Escalamiento y suavizado de parámetros

- **Escalamiento**: ajusta el rango de entrada al rango útil del parámetro (curva lineal o exponencial).
- **Suavizado**: evita saltos bruscos que producen clics o cambios agresivos.

## 8.9. Presets y racks reutilizables

Guarda como **rack** cada conjunto de efectos mapeados. Un rack permite:

- Reutilizar la misma configuración en otras sesiones.
- Cambiar de timbre sin rehacer el mapeo.

<!-- TODO: enlazar los racks .adg del proyecto -->

## 8.10. Ejemplo sensor–sonido

Un sensor de luz controla el filtro de un sonido continuo:

```
luz ──▶ CC ──▶ frecuencia de corte del filtro
```

## 8.11. Ejemplo cuerpo–sonido

La altura de la mano controla el filtro y la posición lateral la panorámica:

```
altura ──▶ filtro
posición X ──▶ panorámica
```

## 8.12. Configuración de latencia y audio

1. Abre **Preferencias → Audio**.
2. Selecciona la interfaz y un **buffer** bajo (por ejemplo, 128 o 256 muestras).
3. Baja el buffer hasta el punto en que no haya cortes ni chasquidos.
4. Verifica que el retardo entre acción y sonido sea imperceptible.

## 8.13. Problemas frecuentes y soluciones

| Problema | Causa probable | Solución |
| --- | --- | --- |
| No llega MIDI/OSC | Puerto o canal incorrecto | Verificar puerto y habilitación |
| Clics o cortes de audio | Buffer muy bajo | Subir el tamaño del buffer |
| El parámetro salta | Falta suavizado | Aplicar suavizado al mapeo |
| Respuesta lenta | Latencia alta | Bajar buffer, simplificar mapeo |
