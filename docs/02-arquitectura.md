# 2. Arquitectura general

## 2.1. Flujo cuerpo–sensor–datos–imagen–sonido

El sistema sigue un único principio: **el cuerpo se convierte en datos, y los datos se convierten en imagen y sonido**.

```
CUERPO ──▶ SENSOR ──▶ DATO ──▶ MAPEO ──▶ IMAGEN + SONIDO
```

1. El **intérprete** se mueve en el espacio o manipula un objeto con sensores.
2. Un **sensor** (cámara de profundidad o interfaz Arduino) captura ese movimiento o esa manipulación.
3. El sensor produce un **dato** numérico: coordenadas, distancias, niveles de luz o presión.
4. Un **mapeo** asocia cada dato a un parámetro visual o sonoro.
5. El resultado es **imagen y sonido** que responden en tiempo real a la acción.

## 2.2. Diagrama general de conexiones

```
                 ┌────────────────────────────────────────────┐
                 │                COMPUTADOR                  │
                 │                                            │
  Kinect/Orbbec──▶│ captura corporal      ┌─▶ visuales (oF/p5)│
  (USB)           │ (articulaciones)      │                   │
                 │                        │                   │
  Arduino ──────▶│ lectura de sensores    │─▶ Ableton Live    │
  + sensores     │ (Serial)               │   (MIDI/OSC)      │
  (USB)          └────────────────────────┴───────────────────┘
                        │                        │
                        ▼                        ▼
                   proyector/pantalla        sistema de audio
```

## 2.3. Arquitectura de hardware

El hardware se organiza en dos vías de entrada complementarias:

| Dispositivo | Tipo de dato | Conexión |
| --- | --- | --- |
| Kinect u Orbbec | Posición de articulaciones (X, Y, Z) | USB |
| Arduino + sensores | Niveles de luz, presión, distancia; pulsadores | USB |
| Computador | Procesamiento y salida | — |
| Proyector / pantalla | Salida visual | HDMI/VGA |
| Sistema de audio / interfaz | Salida sonora | USB/audio |

## 2.4. Arquitectura de software

Cada programa cumple un rol específico en la cadena:

| Programa | Rol | Entrada | Salida |
| --- | --- | --- | --- |
| Driver de la cámara | Entregar frames de profundidad | Hardware | Datos de captura |
| Aplicación de captura | Detectar articulaciones y enviar coordenadas | Driver | OSC |
| Arduino IDE (firmware) | Leer sensores y enviar valores | Sensores | Serial |
| openFrameworks / p5.js | Generar visuales a partir de datos | OSC/Serial | Imagen |
| Ableton Live | Generar y controlar sonido | MIDI/OSC | Audio |

## 2.5. Protocolos utilizados: Serial, MIDI y OSC

Tres protocolos conviven en el sistema, cada uno para una tarea:

| Protocolo | Uso típico | Ventaja |
| --- | --- | --- |
| **Serial** | Arduino → computador | Simple, directo, sin red |
| **MIDI** | Computador → Ableton Live | Estándar musical, mapeo nativo |
| **OSC** | Cámara → visuales; visuales → Ableton | Mensajes tipados, flexible, en red |

La elección del protocolo depende de qué habla con qué (ver [sección 6](06-comunicacion.md)).

## 2.6. Flujo de datos entre dispositivos y programas

Ruta típica de un dato desde el cuerpo hasta la escena:

1. **Cámara de profundidad** → frames de profundidad.
2. **Aplicación de captura** → articulaciones con coordenadas X, Y, Z.
3. **OSC** → mensajes como `/cuerpo/manoDerecha/x`.
4. **Visuales** (openFrameworks/p5.js) → reciben el mensaje y modifican un parámetro.
5. **OSC/MIDI** → el mismo dato (o uno derivado) llega a Ableton Live para controlar sonido.

En paralelo, la ruta de Arduino sigue: **sensor → Arduino → Serial → computador → OSC/MIDI → visual/sonido**.

## 2.7. Requisitos mínimos del sistema

<!-- TODO: confirmar requisitos reales según los equipos del laboratorio -->

| Componente | Requisito mínimo |
| --- | --- |
| Sistema operativo | Windows 10/11 o macOS (según drivers disponibles) |
| RAM | 8 GB (16 GB recomendado) |
| CPU | Procesador de 4 núcleos |
| Puertos USB | Al menos 2 libres (cámara + Arduino) |
| Salida de video | HDMI o VGA para proyector |
| Audio | Interfaz de audio con salida estéreo |
| Red | Para OSC local (localhost) no se requiere red externa |

## 2.8. Matriz de compatibilidad de equipos y software

<!-- TODO: completar con la matriz real tras las pruebas de la sección 10 -->

| Dispositivo / Software | Versión probada | Estado |
| --- | --- | --- |
| Kinect v1 / v2 | <!-- TODO --> | Pendiente de prueba |
| Orbbec (modelo) | <!-- TODO --> | Pendiente de prueba |
| Arduino (placa) | <!-- TODO --> | Pendiente de prueba |
| openFrameworks | <!-- TODO --> | Pendiente de prueba |
| p5.js | <!-- TODO --> | Pendiente de prueba |
| Ableton Live | <!-- TODO --> | Pendiente de prueba |

!!! tip "Matriz viva"
    Esta tabla se actualiza con los resultados de la sección [10. Pruebas y validación](10-pruebas.md).
