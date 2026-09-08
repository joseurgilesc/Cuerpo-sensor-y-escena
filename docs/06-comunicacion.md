# 6. Comunicación entre hardware y software

## 6.1. Comunicación Serial

Serial es el canal directo entre Arduino y el computador.

- Arduino envía líneas de texto con los valores de los sensores.
- El computador lee el puerto serie y separa los valores.
- Convención recomendada: un valor por línea, separados por coma.

```
255,128,0
```

## 6.2. Conversión de datos a MIDI

Para que un dato controle Ableton Live por MIDI:

1. Normaliza el valor al rango MIDI (0–127).
2. Elige un **CC (Control Change)** y un canal.
3. Envía el mensaje MIDI desde el programa puente.

```
valor normalizado (0–1)  ──▶  valor MIDI (0–127)
```

## 6.3. Comunicación mediante OSC

OSC envía mensajes tipados entre programas. Un mensaje tiene una **dirección** y un **valor**:

```
/cuerpo/manoDerecha/x  0.73
```

La dirección organiza los datos por fuente y parámetro.

## 6.4. Estructura y nomenclatura de mensajes

<!-- TODO: fijar la nomenclatura definitiva de direcciones OSC -->

Convención propuesta:

```
/{fuente}/{articulacion_o_sensor}/{parametro}
```

| Fuente | Ejemplo |
| --- | --- |
| `cuerpo` | `/cuerpo/manoDerecha/x` |
| `sensor` | `/sensor/luz/valor` |
| `sistema` | `/sistema/calibracion/estado` |

## 6.5. Envío y recepción de datos

Cada programa tiene un rol de **emisor**, **receptor** o ambos:

- **Emisor**: Arduino (Serial), aplicación de captura (OSC).
- **Receptor**: visuales (OSC/Serial), Ableton Live (MIDI/OSC).
- **Puente**: programa intermedio que convierte Serial a OSC/MIDI.

## 6.6. Mapeo de valores y rangos

El mapeo convierte el rango de entrada al rango de salida:

1. Determina el **rango de entrada** (mín–máx del sensor o gesto).
2. Determina el **rango de salida** (límites del parámetro).
3. Aplica una **función de mapeo** (lineal, exponencial, invertida).

## 6.7. Control bidireccional

Además de enviar datos, el sistema puede **recibir** estados (por ejemplo, de calibración o de cambio de preset). Esto permite que los visuales o Ableton avisen a Arduino (encender un LED, por ejemplo).

## 6.8. Ejemplo Arduino–visual

Un sensor de luz controla el tamaño de una forma.

1. Arduino lee el sensor y envía el valor por Serial.
2. El puente convierte Serial → OSC (`/sensor/luz/valor`).
3. El visual recibe el valor y lo usa como escala.

## 6.9. Ejemplo Arduino–Ableton Live

Un sensor de distancia controla el volumen de una pista.

1. Arduino lee el sensor y envía el valor por Serial.
2. El puente convierte Serial → MIDI CC.
3. Ableton mapea ese CC al volumen.

## 6.10. Ejemplo cámara de profundidad–visual–sonido

La altura de la mano controla imagen y sonido a la vez.

1. La captura envía `/cuerpo/manoDerecha/y` por OSC.
2. Los visuales lo usan como posición vertical.
3. El mismo valor se reenvía a Ableton como filtro.

## 6.11. Diagnóstico de conexión y latencia

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| No llega ningún dato | Puerto o dirección OSC incorrectos | Verificar puerto y dirección |
| Dato intermitente | Buffer o red saturada | Reducir frecuencia de envío |
| Respuesta lenta | Latencia alta | Bajar resolución, simplificar mapeo |
| Valores incorrectos | Mapeo o rango mal definido | Revisar normalización |
