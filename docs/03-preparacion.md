# 3. Preparación del entorno

## 3.1. Inventario de equipos y componentes

Antes de instalar, verifica que dispones de todo el hardware:

| Elemento | Cantidad | Observaciones |
| --- | --- | --- |
| Cámara de profundidad (Kinect u Orbbec) | 1 | Con su adaptador de corriente si lo requiere |
| Arduino (placa) | 1 | <!-- TODO: indicar modelo --> |
| Sensores (luz, presión, distancia) | <!-- TODO --> | Según la actividad |
| Pulsadores y controles físicos | <!-- TODO --> | Según la actividad |
| Cables USB y de prototipado | <!-- TODO --> | Incluye jumpers |
| Computador | 1 | Ver requisitos en [2.7](02-arquitectura.md#27-requisitos-minimos-del-sistema) |
| Proyector o pantalla | 1 | Salida visual |
| Sistema de audio / interfaz | 1 | Salida sonora |

## 3.2. Versiones de software utilizadas

<!-- TODO: fijar las versiones exactas con las que se probó el sistema -->

| Software | Versión | Nota |
| --- | --- | --- |
| Arduino IDE | <!-- TODO --> | Para cargar el firmware |
| openFrameworks | <!-- TODO --> | Visuales en C++ |
| p5.js | <!-- TODO --> | Visuales en navegador |
| Processing | <!-- TODO --> | Alternativa de visuales |
| Ableton Live | <!-- TODO --> | Motor de sonido |
| Controladores de cámara | <!-- TODO --> | Driver Kinect u Orbbec |

!!! warning "Consistencia de versiones"
    Usar siempre la misma versión de cada software durante todo el proyecto. Cambiar de versión a mitad del proceso suele romper la comunicación y dificulta reproducir los resultados.

## 3.3. Instalación de controladores

1. Identifica la cámara (Kinect v1, Kinect v2 u Orbbec).
2. Descarga e instala el **driver oficial** del fabricante.
3. Reinicia el computador si el instalador lo solicita.
4. Conecta la cámara y verifica que el sistema operativo la reconoce.

<!-- TODO: enlazar los drivers exactos y los pasos específicos para la cámara elegida -->

!!! note "Pendiente de datos del ingeniero"
    Los enlaces de descarga y los pasos exactos dependen del modelo de cámara. Se documentan en la sección [4. Captura corporal](04-captura-corporal.md).

## 3.4. Configuración de Arduino IDE

1. Descarga e instala [Arduino IDE](https://www.arduino.cc/en/software).
2. Conecta la placa Arduino por USB.
3. En **Herramientas → Placa**, selecciona el modelo correcto.
4. En **Herramientas → Puerto**, selecciona el puerto que apareció al conectar la placa.
5. Carga un ejemplo simple (por ejemplo, `Blink`) para verificar la conexión.

<!-- TODO: indicar librerías adicionales que instalar desde el gestor de librerías -->

## 3.5. Configuración de openFrameworks

1. Descarga openFrameworks para tu sistema operativo.
2. Descomprime en una ruta sin espacios ni caracteres especiales.
3. Verifica que el **project generator** crea un proyecto sin errores.
4. Instala los **addons** necesarios para OSC y para la cámara de profundidad.

<!-- TODO: listar addons exactos (ofxOsc, addon de la cámara, etc.) -->

## 3.6. Configuración de p5.js o Processing

**p5.js**:

1. Usa el editor web o un servidor local con el archivo `index.html` base.
2. Incluye la biblioteca `p5.js` y, si se requiere, la de OSC (`p5.osc` u osc.js).
3. Verifica que un sketch básico dibuja en pantalla.

**Processing**:

1. Descarga e instala Processing.
2. Instala la biblioteca `oscP5` para comunicación OSC.
3. Verifica con un ejemplo de oscP5.

## 3.7. Configuración de Ableton Live

1. Instala Ableton Live y configura la **interfaz de audio** en **Preferencias → Audio**.
2. Configura la **latencia** de forma que el sonido responda sin cortes (ver [8.12](08-ableton.md#812-configuracion-de-latencia-y-audio)).
3. Habilita las **entradas MIDI** y las **salidas OSC** que vayas a usar.
4. Crea un proyecto base con pistas preparadas para mapear.

## 3.8. Configuración de puertos y dispositivos

1. Conecta la cámara y el Arduino en **puertos USB distintos** (evita hubs sobrecargados).
2. Anota el **nombre del puerto** que asigna el sistema a cada dispositivo.
3. Define **puertos OSC** fijos para cada ruta (por ejemplo, cámara→visuales en un puerto, visuales→Ableton en otro).

<!-- TODO: definir el esquema de puertos OSC por defecto -->

## 3.9. Prueba inicial del sistema

Una vez instalado todo, realiza una prueba de humo:

1. Enciende el computador y abre Arduino IDE → comprueba que la placa responde.
2. Abre la aplicación de captura → comprueba que la cámara entrega frames.
3. Abre un sketch visual → comprueba que se dibuja.
4. Abre Ableton Live → comprueba que emite sonido.
5. Envía un valor de prueba por OSC → comprueba que llega al destino.

## 3.10. Lista de verificación de la instalación

- [ ] Controladores de cámara instalados y cámara reconocida.
- [ ] Arduino IDE configurado (placa y puerto correctos).
- [ ] openFrameworks o p5.js/Processing funcionando.
- [ ] Ableton Live con interfaz de audio configurada.
- [ ] Puertos USB y OSC definidos y anotados.
- [ ] Prueba inicial completada sin errores.
