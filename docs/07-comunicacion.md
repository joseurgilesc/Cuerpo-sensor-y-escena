# 7. Comunicación entre hardware y software

## 7.1. Comunicación Serial

Serial es el canal de datos entre Arduino y el computador. **No es lo mismo que un teclado USB**: el UNO R3 requiere un programa puente para convertir los mensajes de Serial en pulsaciones de letras. Consulta primero la [práctica Arduino + Makey Makey](06-arduino.md).

- Arduino envía líneas de texto con los valores de los sensores.
- El computador lee el puerto serie y separa los valores.
- Convención recomendada: un valor por línea, separados por coma.

```
255,128,0
```

## 7.2. Tres rutas de comunicación para las prácticas

| Dispositivo | Qué recibe el computador | ¿Requiere puente? | Ejemplo |
| --- | --- | --- | --- |
| **Makey Makey** | Eventos de teclado USB | No | A, S, D, F, SPACE |
| **Arduino UNO R3** | Texto o números por Serial | Sí, para convertir a teclas del sistema; o lectura Serial directa | `a,DOWN`, `a,UP`, `512` |
| **Arduino Leonardo/Micro** | Puede presentarse como teclado USB HID | No, usando firmware apropiado | Keyboard.press('a') |

Para trabajar con **p5.js / Tone.js** en el navegador, Makey Makey puede escucharse con `keydown` y `keyup`. Arduino UNO puede incorporarse por Web Serial en navegadores compatibles, con permiso del usuario, o mediante un puente que reenvíe sus mensajes. El Monitor serie y otro programa normalmente no pueden abrir el mismo puerto simultáneamente.

### Ejemplo mínimo de teclado en una página web

~~~html
<script>
const activas = new Set();
window.addEventListener('keydown', (e) => {
  const tecla = e.key.toLowerCase();
  if (!['a','s','d','f'].includes(tecla) || e.repeat) return;
  activas.add(tecla);
  console.log('Inicio:', tecla); // aquí puedes disparar Tone.js o p5.js
});
window.addEventListener('keyup', (e) => {
  const tecla = e.key.toLowerCase();
  activas.delete(tecla);
  console.log('Fin:', tecla);
});
</script>
~~~

!!! tip "Integración recomendada"
    Usa **Makey Makey para eventos discretos** (tocar/soltar) y **Arduino para sensores continuos** (distancia, presión o luz). No necesitas conectar físicamente ambas placas para controlarlas desde la misma escena. Si conectas `KEY_OUT` de Makey Makey al UNO, solo obtendrás una señal general de que se activó alguna tecla; **no la identidad de cada letra**.

## 7.3. Comunicación mediante OSC

OSC envía mensajes tipados entre programas. Un mensaje tiene una **dirección** y un **valor**:

```
/cuerpo/manoDerecha/x  0.73
```

La dirección organiza los datos por fuente y parámetro.

## 7.4. Estructura y nomenclatura de mensajes

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

## 7.5. Envío y recepción de datos

Cada programa tiene un rol de **emisor**, **receptor** o ambos:

- **Emisor**: Arduino (Serial), aplicación de captura (OSC).
- **Receptor**: visuales (OSC/Serial), Tone.js (Web Audio).
- **Puente**: programa intermedio que convierte Serial a OSC.

## 7.6. Mapeo de valores y rangos

El mapeo convierte el rango de entrada al rango de salida:

1. Determina el **rango de entrada** (mín–máx del sensor o gesto).
2. Determina el **rango de salida** (límites del parámetro).
3. Aplica una **función de mapeo** (lineal, exponencial, invertida).

## 7.7. Control bidireccional

Además de enviar datos, el sistema puede **recibir** estados (por ejemplo, de calibración o de cambio de preset). Esto permite que los visuales o Tone.js avisen a Arduino (encender un LED, por ejemplo).

## 7.8. Ejemplo Arduino–visual

Un sensor de luz controla el tamaño de una forma.

1. Arduino lee el sensor y envía el valor por Serial.
2. El puente convierte Serial → OSC (`/sensor/luz/valor`).
3. El visual recibe el valor y lo usa como escala.

## 7.9. Ejemplo Arduino–sonido (Tone.js)

Un sensor de distancia controla el volumen.

1. Arduino lee el sensor y envía el valor por Serial.
2. El puente convierte Serial → OSC.
3. Tone.js recibe el valor y lo mapea al volumen.

## 7.10. Ejemplo webcam–visual–sonido

La altura de la mano controla imagen y sonido a la vez.

1. La captura envía `/cuerpo/manoDerecha/y` por OSC.
2. Los visuales lo usan como posición vertical.
3. El mismo valor se reenvía a Tone.js como filtro.

## 7.11. Diagnóstico de conexión y latencia

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| No llega ningún dato | Puerto o dirección OSC incorrectos | Verificar puerto y dirección |
| Dato intermitente | Buffer o red saturada | Reducir frecuencia de envío |
| Respuesta lenta | Latencia alta | Bajar resolución, simplificar mapeo |
| Valores incorrectos | Mapeo o rango mal definido | Revisar normalización |
