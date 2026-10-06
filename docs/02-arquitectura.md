# 2. Arquitectura general

## 2.1. Flujo cuerpo–sensor–datos–imagen–sonido

El sistema sigue un único principio: **el cuerpo se convierte en datos, y los datos se convierten en imagen y sonido**.

```
CUERPO ──▶ SENSOR / INTERFAZ ──▶ DATO ──▶ MAPEO ──▶ IMAGEN + SONIDO
```

1. El **intérprete** se mueve en el espacio o manipula un objeto o superficie interactiva.
2. Un **sensor o interfaz** (cámara web, Arduino o Makey Makey) captura ese movimiento, contacto o manipulación.
3. El dispositivo produce un **dato**: coordenadas, distancias, niveles de luz o presión, o eventos discretos como teclas y clics.
4. Un **mapeo** asocia cada dato a un parámetro visual o sonoro.
5. El resultado es **imagen y sonido** que responden en tiempo real a la acción.

## 2.2. Diagrama general de conexiones

```
                         ┌────────────────────────────────────────────┐
                         │                COMPUTADOR                  │
                         │                                            │
 Webcam + ml5.js ───────▶│ captura corporal      ┌─▶ visuales (p5.js)│
 (navegador)             │ (articulaciones)      │                   │
                         │                        │                   │
 Arduino + sensores ────▶│ lectura de sensores   │─▶ Tone.js (sonido)│
 (USB / Serial)          │                        │   (Web Audio)     │
                         │                        │                   │
 Makey Makey ───────────▶│ teclado / mouse (HID) │                   │
 (USB)                   └────────────────────────┴───────────────────┘
                                │                        │
                                ▼                        ▼
                           proyector/pantalla        sistema de audio
```

**Makey Makey** se incorpora como una interfaz física de entrada sencilla: convierte el contacto con materiales conductores u objetos cotidianos en eventos de teclado o mouse. Esto permite construir prototipos interactivos sin programar firmware ni diseñar circuitos complejos.

## 2.3. Arquitectura de hardware

El hardware se organiza en tres vías de entrada complementarias:

| Dispositivo | Tipo de dato | Conexión |
| --- | --- | --- |
| Cámara web | Posición de articulaciones (X, Y) | USB |
| Arduino + sensores | Niveles de luz, presión, distancia; pulsadores | USB |
| Makey Makey | Contacto convertido en teclas o clics | USB (HID) |
| Computador | Procesamiento y salida | — |
| Proyector / pantalla | Salida visual | HDMI/VGA |
| Sistema de audio / interfaz | Salida sonora | USB/audio |

Las tres vías permiten trabajar con distintos niveles de complejidad:

- **Cámara + ml5.js**: interacción corporal y captura de movimiento sin contacto.
- **Arduino + sensores**: lectura continua o discreta de variables físicas.
- **Makey Makey**: interacción por contacto, especialmente útil para prototipos rápidos con objetos, superficies y materiales conductores.

## 2.4. Arquitectura de software

Cada programa cumple un rol específico en la cadena:

| Programa / interfaz | Rol | Entrada | Salida |
| --- | --- | --- | --- |
| Cámara web | Entregar frames de video | Hardware | Imagen de video |
| ml5.js | Detectar la pose (articulaciones) desde el video | Cámara web | Coordenadas |
| Arduino IDE (firmware) | Leer sensores y enviar valores | Sensores | Serial |
| Makey Makey | Emular teclado o mouse mediante USB HID | Contacto físico | Teclas / clics |
| p5.js | Generar visuales a partir de datos | OSC / Serial / teclado / mouse | Imagen |
| Tone.js | Generar y controlar sonido | Eventos y datos | Audio |

Makey Makey no requiere un programa intermedio para las funciones básicas: el computador lo reconoce como un dispositivo **HID** (*Human Interface Device*), similar a un teclado o mouse. Por ello, p5.js puede responder directamente a sus eventos mediante funciones de teclado o mouse.

## 2.5. Protocolos utilizados: Serial, OSC y HID

Tres formas de comunicación conviven en el sistema, cada una para una tarea:

| Protocolo / interfaz | Uso típico | Ventaja |
| --- | --- | --- |
| **Serial** | Arduino → computador | Simple, directo, sin red |
| **OSC** | Datos entre aplicaciones | Mensajes tipados, flexible, en red |
| **HID** | Makey Makey → computador | Plug-and-play; funciona como teclado o mouse |

La elección depende de qué dispositivo se conecta con qué programa (ver [sección 6](06-comunicacion.md)).

## 2.6. Flujo de datos entre dispositivos y programas

Ruta típica de un dato desde el cuerpo hasta la escena:

1. **Cámara web** → frames de video.
2. **ml5.js** → articulaciones con coordenadas X, Y.
3. **OSC** → mensajes como `/cuerpo/manoDerecha/x`.
4. **Visuales** (p5.js) → reciben el mensaje y modifican un parámetro.
5. **OSC** → el mismo dato (o uno derivado) controla Tone.js para generar sonido.

En paralelo, la ruta de Arduino sigue:

**sensor → Arduino → Serial → computador → visual/sonido**

Y una ruta con Makey Makey puede ser:

**cuerpo / objeto conductor → Makey Makey → HID (tecla o clic) → p5.js / Tone.js → visual/sonido**

Esta última ruta es especialmente útil para ejercicios de iniciación, instalaciones táctiles y prototipos rápidos donde un objeto cotidiano puede convertirse en una interfaz.

## 2.7. Requisitos mínimos del sistema

<!-- TODO: confirmar requisitos reales según los equipos del laboratorio -->

| Componente | Requisito mínimo |
| --- | --- |
| Sistema operativo | Windows, macOS o Linux (con navegador moderno) |
| RAM | 8 GB (16 GB recomendado) |
| CPU | Procesador de 4 núcleos |
| Puertos USB | Al menos 2 libres; 3 si se usan simultáneamente cámara, Arduino y Makey Makey |
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
| Makey Makey | <!-- TODO --> | Pendiente de prueba |
| p5.js | <!-- TODO --> | Pendiente de prueba |
| Tone.js | <!-- TODO --> | Pendiente de prueba |

!!! tip "Matriz viva"
    Esta tabla se actualiza con los resultados de la sección [10. Pruebas y validación](10-pruebas.md).
