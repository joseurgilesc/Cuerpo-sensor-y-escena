# Glosario técnico

Definiciones breves de los términos usados a lo largo de la documentación. Esta página se corresponde con el punto **1.6** del índice técnico.

## Captura y datos corporales

- **Detección de pose**: técnica de machine learning que estima la posición de los puntos clave del cuerpo (cabeza, hombros, codos, etc.) a partir del video de una cámara.
- **Cámara web**: cámara de video integrada o conectada al computador, usada como entrada para la detección de pose.
- **Articulación / joint**: punto del esqueleto corporal detectado por el sistema (cabeza, hombros, codos, muñecas, caderas, rodillas, tobillos, etc.).
- **Skeleton tracking / seguimiento de pose**: proceso que estima la posición de las articulaciones a partir del video de la cámara.
- **Coordenadas X, Y**: ejes de posición en el encuadre. X es horizontal e Y vertical; la distancia se estima por el tamaño del cuerpo.
- **Normalización**: transformación de valores a un rango común (por ejemplo, de 0 a 1) para poder mapearlos a parámetros visuales o sonoros.
- **Filtrado / suavizado**: procesamiento que reduce el ruido y los saltos de la señal para lograr movimientos continuos y estables.

## Electrónica y sensores

- **Arduino**: plataforma de prototipado electrónico de código abierto basada en un microcontrolador, usada aquí como interfaz física entre sensores y computador.
- **Entrada analógica**: lectura de una señal continua (por ejemplo, la cantidad de luz sobre un sensor) que el microcontrolador convierte en un valor numérico.
- **Entrada digital**: lectura de una señal de dos estados (encendido/apagado), típica de pulsadores.
- **Sensor**: componente que convierte una magnitud física (luz, presión, distancia) en una señal eléctrica medible.
- **Calibración**: proceso de ajuste para determinar los valores mínimos y máximos reales de un sensor y mapearlos correctamente.
- **Ruido**: variaciones no deseadas de la señal que deben filtrarse para obtener lecturas estables.
- **Pinout**: esquema que indica la función de cada pin o conexión de un dispositivo.

## Comunicación

- **Serial**: protocolo de comunicación punto a punto entre el microcontrolador y el computador a través de un puerto (USB o serie).
- **OSC (Open Sound Control)**: protocolo de mensajería en red que envía mensajes tipados (números, cadenas) entre programas y dispositivos, muy usado en artes escénicas.
- **Mensaje / address**: en OSC, la dirección simbólica a la que se envía un valor (por ejemplo, `/cuerpo/manoDerecha/x`).
- **Mapeo / mapping**: regla que asocia un dato de entrada (gesto o sensor) con un parámetro de salida (visual o sonoro).
- **Rango / scaling**: transformación de los valores de entrada a los límites útiles de un parámetro de salida.
- **Latencia**: tiempo que transcurre entre una acción del intérprete y la respuesta perceptible del sistema.

## Software y visuales

- **Creative coding / programación creativa**: práctica de programar con fines expresivos y artísticos más que puramente utilitarios.
- **p5.js**: biblioteca de JavaScript para programación creativa en el navegador.
- **ml5.js**: biblioteca de machine learning para el navegador, construida sobre TensorFlow.js, que permite detectar poses desde la cámara web.
- **Visual generativo**: imagen o animación producida a partir de reglas y datos en lugar de dibujarse manualmente.
- **Partículas / sistema de partículas**: técnica visual donde muchos elementos simples se mueven según reglas para crear comportamientos complejos.
- **Preset**: configuración guardada que reproduce un estado visual, sonoro o de mapeo determinado.

## Sonido

- **Tone.js**: biblioteca de JavaScript basada en la Web Audio API para sintetizar y procesar sonido en el navegador, integrada con p5.js.
- **Web Audio API**: API del navegador para generar, procesar y controlar audio en tiempo real.
- **Preset de sonido**: configuración guardada que reproduce un timbre y un mapeo determinados.
- **Panorámica / pan**: posición de un sonido en el campo estéreo.
