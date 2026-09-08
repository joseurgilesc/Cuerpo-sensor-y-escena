# 7. Visuales generativos

## 7.1. Introducción a los visuales generativos

Un visual generativo se produce con **reglas y datos**, no dibujándose manualmente. El programa describe un comportamiento (una regla) y los datos (del cuerpo o de los sensores) modifican los parámetros de esa regla en tiempo real.

## 7.2. Recepción de datos en openFrameworks

openFrameworks recibe datos OSC con el addon `ofxOsc`.

<!-- TODO: indicar addon exacto y fragmento de código de recepción -->

1. Configura un **listener** en el puerto OSC.
2. Escucha las direcciones definidas.
3. Guarda cada valor en una variable del programa.

## 7.3. Recepción de datos en p5.js

p5.js recibe datos OSC con una biblioteca de OSC sobre WebSocket.

<!-- TODO: indicar biblioteca exacta (p5.osc, osc.js) y fragmento de código -->

1. Establece la conexión OSC.
2. Registra un **handler** por dirección.
3. Actualiza las variables del sketch con cada mensaje.

## 7.4. Transformación de datos en parámetros visuales

El dato de entrada se asocia a un parámetro visual. La clave está en elegir **qué dato** controla **qué parámetro** para que la relación sea legible y expresiva.

| Dato | Parámetro visual típico |
| --- | --- |
| Posición X | Posición horizontal |
| Posición Y | Posición vertical / escala |
| Profundidad Z | Escala / transparencia |
| Nivel de luz | Color / brillo |
| Presión | Intensidad / deformación |

## 7.5. Posición, escala y rotación

- **Posición**: mapea coordenadas a la posición de la forma.
- **Escala**: mapea distancia o presión al tamaño.
- **Rotación**: mapea un ángulo (por ejemplo, la inclinación del brazo) a la rotación.

## 7.6. Color y transparencia

- **Color**: mapea un dato a un matiz (hue) o a un valor de color.
- **Transparencia**: mapea profundidad o cercanía a la opacidad (cerca = opaco, lejos = transparente).

## 7.7. Partículas y sistemas de movimiento

Un sistema de partículas define muchos elementos con velocidad y vida. Los datos modifican su **atracción**, **velocidad** o **dirección**, creando comportamientos complejos a partir de reglas simples.

## 7.8. Deformación y comportamiento visual

Los datos pueden **deformar** una forma o un campo (ruido, distorsión) para que el visual parezca responder físicamente al cuerpo.

## 7.9. Mapeo de gestos corporales

- **Gesto alto/bajo** → escala o frecuencia.
- **Gesto lateral** → posición o panorámica.
- **Gesto circular** → rotación o recorrido.

## 7.10. Mapeo de sensores físicos

- **Luz** → color o brillo.
- **Presión** → intensidad o deformación.
- **Distancia** → escala o transparencia.

## 7.11. Presets visuales

Un preset guarda un estado visual completo (formas, colores, mapeos). Permite cambiar de escena con un solo mensaje y volver a un resultado conocido.

<!-- TODO: definir el formato de los presets (archivo JSON, etc.) -->

## 7.12. Ejemplo cuerpo–imagen

La mano controla posición y escala de una forma; la profundidad controla su transparencia. Ver [prototipo cuerpo–imagen](09-prototipos.md#92-prototipo-cuerpoimagen).

## 7.13. Ejemplo sensor–imagen

Un sensor de luz controla el color y un sensor de distancia la escala. Ver [prototipo sensor–imagen](09-prototipos.md#95-prototipo-sensorimagen).
