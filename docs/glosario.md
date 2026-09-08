# Glosario técnico

Definiciones breves de los términos usados a lo largo de la documentación. Esta página se corresponde con el punto **1.6** del índice técnico.

## Captura y datos corporales

- **Captura de profundidad**: técnica que mide, para cada píxel, la distancia entre la cámara y el objeto, generando una imagen de profundidad además de la imagen de color.
- **Cámara de profundidad**: dispositivo que combina un sensor de luz estructurada o de tiempo de vuelo con una cámara para reconstruir la escena en tres dimensiones (por ejemplo, Kinect u Orbbec).
- **Articulación / joint**: punto del esqueleto corporal detectado por el sistema (cabeza, hombros, codos, muñecas, caderas, rodillas, tobillos, etc.).
- **Skeleton tracking / seguimiento de esqueleto**: proceso que estima la posición de las articulaciones a partir de la imagen de profundidad.
- **Coordenadas X, Y, Z**: ejes de posición en el espacio. X es horizontal, Y vertical y Z la profundidad (distancia a la cámara).
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
- **MIDI**: protocolo estándar para comunicar instrumentos y equipos musicales; transporta eventos como notas, controladores y reloj.
- **OSC (Open Sound Control)**: protocolo de mensajería en red que envía mensajes tipados (números, cadenas) entre programas y dispositivos, muy usado en artes escénicas.
- **Mensaje / address**: en OSC, la dirección simbólica a la que se envía un valor (por ejemplo, `/cuerpo/manoDerecha/x`).
- **Mapeo / mapping**: regla que asocia un dato de entrada (gesto o sensor) con un parámetro de salida (visual o sonoro).
- **Rango / scaling**: transformación de los valores de entrada a los límites útiles de un parámetro de salida.
- **Latencia**: tiempo que transcurre entre una acción del intérprete y la respuesta perceptible del sistema.

## Software y visuales

- **Creative coding / programación creativa**: práctica de programar con fines expresivos y artísticos más que puramente utilitarios.
- **openFrameworks**: entorno de programación creativa en C++ para instalaciones y visuales generativos.
- **p5.js**: biblioteca de JavaScript para programación creativa en el navegador.
- **Processing**: entorno de programación creativa orientado a las artes visuales.
- **Visual generativo**: imagen o animación producida a partir de reglas y datos en lugar de dibujarse manualmente.
- **Partículas / sistema de partículas**: técnica visual donde muchos elementos simples se mueven según reglas para crear comportamientos complejos.
- **Preset**: configuración guardada que reproduce un estado visual, sonoro o de mapeo determinado.

## Sonido

- **Ableton Live**: software de producción e interpretación musical en vivo, usado aquí como motor de sonido interactivo.
- **Rack**: contenedor de instrumentos o efectos en Ableton Live que puede guardarse y reutilizarse.
- **CC (Control Change)**: mensaje MIDI que controla un parámetro continuo, como volumen o un filtro.
- **Mapeo MIDI / OSC**: asignación de un mensaje entrante a un parámetro de Ableton Live.
- **Panorámica / pan**: posición de un sonido en el campo estéreo.
