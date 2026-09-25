# 2. Arquitectura general

## 2.1. Flujo cuerpo–sensor–datos–imagen–sonido

El sistema sigue un único principio: **el cuerpo se convierte en datos, y los datos se convierten en imagen y sonido**.

```
CUERPO ──▶ SENSOR ──▶ DATO ──▶ MAPEO ──▶ IMAGEN + SONIDO
```

1. El **intérprete** se mueve en el espacio o manipula un objeto con sensores.
2. Un **sensor** (cámara web o interfaz Arduino) captura ese movimiento o esa manipulación.
3. El sensor produce un **dato** numérico: coordenadas, distancias, niveles de luz o presión.
4. Un **mapeo** asocia cada dato a un parámetro visual o sonoro.
5. El resultado es **imagen y sonido** que responden en tiempo real a la acción.

## 2.2. Diagrama general de conexiones

```
                 ┌────────────────────────────────────────────┐
                 │                COMPUTADOR                  │
                 │                                            │
  Webcam + ml5.js▶│ captura corporal      ┌─▶ visuales (p5)│
  (navegador)     │ (articulaciones)      │                   │
                 │                        │                   │
  Arduino ──────▶│ lectura de sensores    │─▶ Tone.js (sonido)│
  + sensores     │ (Serial)               │   (Web Audio)     │
  (USB)          └────────────────────────┴───────────────────┘
                        │                        │
                        ▼                        ▼
                   proyector/pantalla        sistema de audio
```

## 2.3. Arquitectura de hardware

El hardware se organiza en dos vías de entrada complementarias:

| Dispositivo | Tipo de dato | Conexión |
| --- | --- | --- |
| Cámara web | Posición de articulaciones (X, Y) | USB |
| Arduino + sensores | Niveles de luz, presión, distancia; pulsadores | USB |
| Makey Makey | Contacto (teclas / clics) | USB |
| Computador | Procesamiento y salida | — |
| Proyector / pantalla | Salida visual | HDMI/VGA |
| Sistema de audio / interfaz | Salida sonora | USB/audio |

## 2.4. Arquitectura de software

Cada programa cumple un rol específico en la cadena:

| Programa | Rol | Entrada | Salida |
| --- | --- | --- | --- |
| Cámara web | Entregar frames de video | Hardware | Imagen de video |
| ml5.js | Detectar la pose (articulaciones) desde el video | Cámara web | Coordenadas |
| Arduino IDE (firmware) | Leer sensores y enviar valores | Sensores | Serial |
| p5.js | Generar visuales a partir de datos | OSC/Serial | Imagen |
| Tone.js | Generar y controlar sonido | Web Audio | Audio |

## 2.5. Protocolos utilizados: Serial y OSC

Dos protocolos conviven en el sistema, cada uno para una tarea:

| Protocolo | Uso típico | Ventaja |
| --- | --- | --- |
| **Serial** | Arduino → computador | Simple, directo, sin red |
| **OSC** | Cámara → visuales | Mensajes tipados, flexible, en red |

La elección del protocolo depende de qué habla con qué (ver [sección 6](06-comunicacion.md)).

## 2.6. Flujo de datos entre dispositivos y programas

Ruta típica de un dato desde el cuerpo hasta la escena:

1. **Cámara web** → frames de video.
2. **ml5.js** → articulaciones con coordenadas X, Y.
3. **OSC** → mensajes como `/cuerpo/manoDerecha/x`.
4. **Visuales** (p5.js) → reciben el mensaje y modifican un parámetro.
5. **OSC** → el mismo dato (o uno derivado) controla Tone.js para generar sonido.

En paralelo, la ruta de Arduino sigue: **sensor → Arduino → Serial → computador → OSC → visual/sonido**.

## 2.7. Requisitos mínimos del sistema

<!-- TODO: confirmar requisitos reales según los equipos del laboratorio -->

| Componente | Requisito mínimo |
| --- | --- |
| Sistema operativo | Windows, macOS o Linux (con navegador moderno) |
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
| Cámara web | <!-- TODO --> | Pendiente de prueba |
| ml5.js | <!-- TODO --> | Pendiente de prueba |
| Arduino (placa) | <!-- TODO --> | Pendiente de prueba |
| p5.js | <!-- TODO --> | Pendiente de prueba |
| Tone.js | <!-- TODO --> | Pendiente de prueba |

!!! tip "Matriz viva"
    Esta tabla se actualiza con los resultados de la sección [10. Pruebas y validación](10-pruebas.md).
