# 6. Arduino e interfaces físicas

> **Meta práctica:** crear un instrumento físico que transforme gestos o contactos en letras (**A, S, D, F**) para controlar imagen y sonido, como con Makey Makey.

## 6.1. Conoce el Arduino UNO R3

Arduino UNO R3 es una placa basada en el microcontrolador ATmega328P. El programa («sketch») se carga por USB y se ejecuta en la placa, incluso sin mantener abierto el entorno de programación.

![Mapa de conectores de Arduino UNO R3](assets/arduino-uno-mapa.svg)

**Observa la placa real y contrasta el esquema:** [Fotografía y características oficiales](https://docs.arduino.cc/hardware/uno-rev3/) · [Mapa oficial completo de pines (PDF)](https://content.arduino.cc/assets/A000066-full-pinout.pdf).

| Zona | ¿Qué hace? | Uso creativo |
| --- | --- | --- |
| **USB tipo B** | Conecta Arduino al PC para alimentación, programación y datos serie | Envío de acciones al computador |
| **D2–D13 digitales** | Detectan HIGH/LOW o generan salidas | Pulsadores, contacto de materiales conductores |
| **D0/RX y D1/TX** | Comunicación serie UART | Evítalos en el primer ejercicio con USB |
| **A0–A5 analógicas** | Miden de 0 a 1023 en el UNO R3 (ADC de 10 bits) | Luz, presión, potenciómetro |
| **5V y 3.3V** | Alimentación de periféricos compatibles | Sensores |
| **GND** | Referencia eléctrica común | Retorno de pulsadores |
| **VIN** | Entrada de alimentación externa (no sensor) | Proyectos autónomos |
| **RESET** | Reinicia el programa | Diagnóstico |

!!! warning "Seguridad"
    Haz las conexiones con el USB desconectado. No conectes directamente 5 V a GND; no conectes tensiones superiores a las admitidas por los pines. El UNO R3 trabaja con lógica de **5 V**.

## 6.2. Instalar Arduino IDE y comprobar la placa

1. Descarga **[Arduino IDE 2 desde la web oficial](https://www.arduino.cc/en/software/)** e instálalo.
2. Conecta el UNO R3 usando un **cable USB de datos**.
3. En el IDE selecciona **Herramientas → Placa → Arduino AVR Boards → Arduino Uno**. Si no aparece, instala *Arduino AVR Boards* desde el gestor de placas.
4. Ve a **Herramientas → Puerto** y elige el puerto que aparece al conectar la placa.
5. Abre **Archivo → Ejemplos → 01.Basics → Blink** y pulsa **Subir** (flecha).
6. Comprueba que parpadea el LED integrado marcado **L**. ¡La instalación funciona!

=== "Windows"
    El puerto suele llamarse **COM3**, **COM4**, etc. Si falta, comprueba el cable, el controlador USB de la placa y el Administrador de dispositivos.
=== "macOS"
    Busca puertos del tipo **/dev/cu.usbmodem*** o **/dev/cu.usbserial***.
=== "Linux"
    Busca **/dev/ttyACM0** o **/dev/ttyUSB0**. Puede ser necesario configurar permisos del dispositivo serial y reglas udev según tu distribución.

Consulta también la [guía oficial de instalación](https://support.arduino.cc/hc/en-us/articles/360019833020-Download-and-install-Arduino-IDE).

## 6.3. Leer entradas digitales: una pulsación

**Materiales:** 1 Arduino UNO R3, 1 pulsador, una protoboard, cables Dupont, cable USB.

Conecta **D2 → pulsador → GND**. Activa la resistencia interna mediante \`INPUT_PULLUP\`. Así, **sin pulsar = HIGH** y **pulsado = LOW**. Un pulsador de cuatro terminales tiene pares de patas internamente unidos: verifica cuáles cierran el contacto.

~~~cpp
const byte boton = 2;

void setup() {
  pinMode(boton, INPUT_PULLUP);
  Serial.begin(115200);
}

void loop() {
  Serial.println(digitalRead(boton) == LOW ? "PULSADO" : "LIBRE");
  delay(100);
}
~~~

Abre **Herramientas → Monitor serie**, selecciona **115200 baudios** y comprueba que cambia el texto al pulsar. Cierra el monitor antes de utilizar cualquier programa externo que lea ese puerto.

## 6.4. Construir cuatro teclas físicas A, S, D y F

![Diagrama de cableado para cuatro teclas](assets/arduino-4-teclas.svg)

Conecta un extremo de cada pulsador al pin indicado y el otro extremo al **GND común**.

| Entrada Arduino | Acción | Letra enviada |
| --- | --- | --- |
| D2 | Contacto 1 | **A** |
| D3 | Contacto 2 | **S** |
| D4 | Contacto 3 | **D** |
| D5 | Contacto 4 | **F** |

Carga este **sketch completo**, que informa de cada cambio de estado (presionar o soltar) y elimina rebotes mecánicos:

~~~cpp
const byte pines[4] = {2, 3, 4, 5};
const char letras[4] = {'a', 's', 'd', 'f'};
bool estadoEstable[4] = {HIGH, HIGH, HIGH, HIGH};
bool lecturaAnterior[4] = {HIGH, HIGH, HIGH, HIGH};
unsigned long ultimoCambio[4] = {0, 0, 0, 0};
const unsigned long reboteMs = 30;

void setup() {
  Serial.begin(115200);
  for (byte i = 0; i < 4; i++) {
    pinMode(pines[i], INPUT_PULLUP);
    estadoEstable[i] = digitalRead(pines[i]);
    lecturaAnterior[i] = estadoEstable[i];
  }
}

void loop() {
  for (byte i = 0; i < 4; i++) {
    bool lectura = digitalRead(pines[i]);
    if (lectura != lecturaAnterior[i]) ultimoCambio[i] = millis();

    if (millis() - ultimoCambio[i] > reboteMs &&
        lectura != estadoEstable[i]) {
      estadoEstable[i] = lectura;
      Serial.print(letras[i]);
      Serial.println(estadoEstable[i] == LOW ? ",DOWN" : ",UP");
    }
    lecturaAnterior[i] = lectura;
  }
}
~~~

El Monitor serie mostrará, por ejemplo, \`a,DOWN\` al presionar y \`a,UP\` al soltar.

## 6.5. Hacer que Arduino UNO escriba letras como Makey Makey

!!! important "Arduino UNO R3 ≠ teclado USB nativo"
    En el **UNO R3**, \`Keyboard.h\` no funciona como en Arduino Leonardo o Micro: el UNO R3 transmite datos por **Serial**. Para convertir esos mensajes en teclas del sistema operativo necesitamos un **puente** en el PC. Para teclado USB directo, utiliza un Leonardo, Micro o una placa compatible HID.

Instala Python 3 desde [python.org](https://www.python.org/downloads/), abre una terminal y ejecuta:

~~~bash
python -m pip install pyserial pynput
~~~

Crea un archivo **\`arduino_teclado.py\`** con este contenido:

~~~python
import sys
import serial
from pynput.keyboard import Controller

if len(sys.argv) < 2:
    raise SystemExit("Uso: python arduino_teclado.py PUERTO")

teclado = Controller()
permitidas = {"a", "s", "d", "f"}
pulsadas = set()

with serial.Serial(sys.argv[1], 115200, timeout=1) as arduino:
    print("Controlador activo. Ctrl+C para salir.")
    try:
        while True:
            mensaje = arduino.readline().decode("ascii", errors="ignore").strip()
            if "," not in mensaje:
                continue
            letra, accion = mensaje.split(",", 1)
            if letra not in permitidas:
                continue
            if accion == "DOWN" and letra not in pulsadas:
                teclado.press(letra)
                pulsadas.add(letra)
            elif accion == "UP" and letra in pulsadas:
                teclado.release(letra)
                pulsadas.remove(letra)
    except KeyboardInterrupt:
        pass
    finally:
        for letra in pulsadas:
            teclado.release(letra)
~~~

Con el Monitor serie **cerrado**, ejecútalo sustituyendo el puerto:

~~~bash
# Windows (ejemplo)
python arduino_teclado.py COM3

# macOS (ejemplo)
python3 arduino_teclado.py /dev/cu.usbmodemXXXX

# Linux (ejemplo)
python3 arduino_teclado.py /dev/ttyACM0
~~~

Abre un editor de texto, selecciona su ventana y pulsa los contactos: deberían aparecer letras. La ventana activa recibe las teclas. En macOS, es posible que debas autorizar el control de accesibilidad; en Linux con **Wayland**, la simulación de teclado mediante \`pynput\` puede no funcionar. En ese caso usa X11, una solución compatible con tu compositor o envía los datos directamente por Serial a una aplicación propia.

!!! tip "Seguridad de software"
    Ejecuta el puente solo cuando sea necesario; para detenerlo usa **Ctrl+C**. Puede enviar letras a cualquier ventana que tenga el foco.

## 6.6. Conectar Makey Makey y Arduino: ¿son lo mismo?

**No.** Makey Makey ya se presenta como teclado USB: cierra el circuito entre una entrada (SPACE, LEFT, UP, W, A, S, D, F, G, etc., según modelo) y **EARTH**, y el computador recibe una tecla. Arduino UNO R3, en cambio, necesita el puente anterior para imitar ese comportamiento.

### Opción A — Recomendación para clase: ambos al mismo computador

~~~text
Objetos conductores → Makey Makey ─USB→ PC → p5.js / Tone.js
Botones o sensores  → Arduino UNO ─USB/Serial→ PC → aplicación
~~~

Puedes usar ambos a la vez: Makey Makey para letras y Arduino para valores continuos (luz, presión, distancia). En la aplicación, los eventos de teclado se leen con \`keydown\` y los datos Arduino con Web Serial o un puente. **No hace falta unir físicamente ambas placas.**

### Opción B — Conexión física Makey Makey → Arduino UNO

Para que Arduino detecte **si se ha activado alguna tecla Makey Makey**:

1. Localiza en la **cara posterior** de tu Makey Makey los pines rotulados **KEY_OUT** y **GND**. La disposición cambia entre revisiones: guíate por las etiquetas impresas, no por la posición.
2. Con ambas placas desconectadas, conecta **KEY_OUT → D2** del UNO y **GND → GND** del UNO.
3. Alimenta **cada placa por su propio USB** al computador y prueba con el siguiente programa.
4. En Makey Makey, une una entrada con **EARTH**. Arduino detectará cuándo se activa la salida KEY_OUT.

~~~cpp
const byte entradaMakey = 2;
bool anterior = LOW;

void setup() {
  pinMode(entradaMakey, INPUT);
  Serial.begin(115200);
}

void loop() {
  bool actual = digitalRead(entradaMakey) == HIGH;
  if (actual != anterior) {
    Serial.println(actual ? "MAKEY_ACTIVADO" : "MAKEY_LIBRE");
    anterior = actual;
  }
  delay(10);
}
~~~

!!! warning "Límite de KEY_OUT"
    **KEY_OUT no indica qué letra se pulsó**: solo señala que hay alguna entrada de teclado activada. No conectes por error el pin de alimentación **5V** a D2, ni unas entre sí las salidas de ambas placas. Consulta las etiquetas de tu versión de Makey Makey. Esta opción asume niveles de salida compatibles con una entrada de **5 V** del UNO R3 y masa compartida.

Para identificar **cada tecla por separado**, la vía más sencilla es usar Makey Makey por USB (el navegador sabe qué tecla llega) y Arduino por USB/Serial (el programa sabe qué sensor se mueve). Como alternativa avanzada, los contactos individuales pueden cablearse a entradas propias del UNO, siempre comprobando el circuito y las referencias de tierra.

Fuentes: [Makey Makey: parte posterior y KEY_OUT](https://makeymakey.com/blogs/how-to-instructions/back-of-the-board-tutorial) · [Makey Makey FAQ](https://makeymakey.com/pages/faq).

## 6.7. Entradas analógicas: luz y presión

Para obtener una variación continua, conecta un **potenciómetro de 10 kΩ**: extremos a 5V y GND, terminal central a **A0**. Lee el valor:

~~~cpp
void setup() { Serial.begin(115200); }
void loop() {
  int valor = analogRead(A0);
  Serial.println(valor); // 0 a 1023 en UNO R3
  delay(30);
}
~~~

Un **sensor LDR** requiere normalmente divisor de tensión; un **FSR** necesita una resistencia de referencia. No conectes una fotorresistencia o un FSR sin considerar el circuito de lectura.

## 6.8. Del sensor a una escena

1. **Acción corporal:** tocar una superficie conductora o presionar un botón.
2. **Lectura:** Makey Makey detecta una tecla o Arduino detecta LOW/HIGH.
3. **Comunicación:** teclado USB o Serial.
4. **Interpretación:** el navegador o programa recibe el evento.
5. **Respuesta:** reproducir un sonido en Tone.js, dibujar una forma en p5.js o cambiar una escena.

### Práctica de aula · instrumento de cuatro zonas

**Desafío:** construye cuatro contactos con papel aluminio, cartón, cinta conductora o pulsadores. Asigna A/S/D/F a cuatro sonidos o comportamientos gráficos diferentes. Debes demostrar una pulsación, una liberación y la respuesta observable.

**Entrega:** fotografía de conexiones, captura del Monitor serie, código comentado y video de 30–60 segundos del instrumento funcionando.

## 6.9. Diagnóstico rápido

| Síntoma | Qué revisar |
| --- | --- |
| No aparece el puerto | USB de datos, controlador, permisos |
| Error al subir Blink | Placa y puerto correctos; cierra programas que ocupen el puerto |
| El botón no cambia | D2→pulsador→GND, posición de patas, INPUT_PULLUP |
| Letras no aparecen | Programa Python ejecutándose, puerto correcto, ventana con foco |
| Mensaje de puerto ocupado | Cerrar Monitor serie antes del puente |
| Se envían muchas letras | Revisar antirrebote y contactos |
| Makey Makey no activa Arduino | Identificar KEY_OUT y GND de la revisión correcta; probar cada placa por separado |
| Wayland no permite teclado | Enviar Serial a la aplicación o elegir una solución compatible con Wayland |

**Siguiente unidad:** [7. Comunicación entre hardware y software](07-comunicacion.md).


---

## 6.10. Cinco sensores sencillos para *Cuerpo, sensor y escena*

Elige primero **una acción expresiva** (tocar, acercar la mano, mover una perilla, iluminar un objeto) y después el sensor. Para comenzar recomendamos los cinco siguientes:

| Dispositivo | Tipo de dato | Conexión de ejemplo | Interacción en p5.js / Tone.js |
| --- | --- | --- | --- |
| **Pulsador** | Discreto: pulsado / libre | D2 → pulsador → GND, con \`INPUT_PULLUP\` | Disparar una nota, iniciar/detener una animación |
| **LDR + resistencia de 10 kΩ** | Continuo: 0–1023 | Divisor de tensión con salida A0 | La sombra transforma el color y el timbre |
| **TTP223 táctil capacitivo** | Discreto: contacto / libre | VCC→5V, GND→GND, OUT→D3 | Activar una escena tocando un objeto |
| **Potenciómetro de 10 kΩ** | Continuo: 0–1023 | Extremos 5V/GND, centro A1 | Controlar volumen, filtro o tamaño |
| **HC-SR04 ultrasónico** | Continuo: distancia en cm | VCC→5V, GND→GND, TRIG→D9, ECHO→D10 | Instrumento gestual sin contacto |

**Fotografías y referencias:** [Pulsadores](https://docs.arduino.cc/built-in-examples/digital/Button/) · [LDR (fotorresistencia)](https://docs.arduino.cc/built-in-examples/analog/AnalogInput/) · [TTP223 (ejemplo de módulo)](https://learn.adafruit.com/adafruit-capacitive-touch-sensor-breakouts/overview) · [Potenciómetro](https://docs.arduino.cc/built-in-examples/analog/ReadAnalogVoltage/) · [HC-SR04 con fotografías](https://itp.nyu.edu/physcomp/labs/lab-ultrasonic-distance-sensor/).

!!! note "¿Qué es un sensor capacitivo?"
    La superficie conductora funciona como electrodo. Cuando un dedo se acerca o la toca, cambia la capacitancia y el **módulo TTP223** detecta ese cambio. En la configuración habitual, su salida **OUT** pasa a HIGH al tocar y vuelve a LOW al soltar. Algunos módulos tienen opciones de funcionamiento configurables (por ejemplo, modo conmutado), por lo que se debe comprobar el comportamiento real del módulo usado. **No es necesario tocar eléctricamente GND**, a diferencia del contacto básico de Makey Makey. La detección a través de materiales depende de su grosor y del montaje.

### Experimento A · Pulsador: activar y liberar una nota

**Montaje:** un terminal del pulsador a D2 y el otro a GND. Activa la resistencia interna \`INPUT_PULLUP\`.

~~~cpp
const byte boton = 2;
bool anterior = HIGH;
void setup() {
  pinMode(boton, INPUT_PULLUP);
  Serial.begin(115200);
}
void loop() {
  bool estado = digitalRead(boton);
  if (estado != anterior) {
    delay(25); // antirrebote didáctico
    estado = digitalRead(boton);
    if (estado != anterior) {
      Serial.println(estado == LOW ? "BOTON,1" : "BOTON,0");
      anterior = estado;
    }
  }
}
~~~

**Práctica:** pulsar = comenzar sonido; soltar = detenerlo. Observa la diferencia entre evento de activación y estado continuo.

### Experimento B · LDR: controlar visuales mediante sombra

**Montaje del divisor de tensión:**

~~~text
5V ── LDR ──┬── A0
            │
         10 kΩ
            │
           GND
~~~

Con este montaje, el valor normalmente **sube con la luz** y **baja al oscurecer** (puede variar según el componente). Nunca conectes un LDR solo entre 5 V y A0 esperando una lectura estable: necesita una resistencia de referencia.

~~~cpp
void setup() { Serial.begin(115200); }
void loop() {
  int luz = analogRead(A0);
  Serial.print("LUZ,");
  Serial.println(luz); // 0..1023
  delay(40);
}
~~~

**Práctica:** proyecta un círculo en p5.js; al tapar la LDR el círculo se contrae y se aplica un filtro más oscuro o más grave. Registra primero los valores de luz y sombra reales.

### Experimento C · Sensor táctil capacitivo TTP223: objeto sensible

**Montaje:** \`VCC → 5V\`, \`GND → GND\`, \`OUT → D3\`, para **módulos TTP223 compatibles con 5 V**. Sigue las etiquetas impresas en tu módulo y verifica su alimentación admitida.

~~~cpp
const byte tactil = 3;
bool anterior = LOW;
void setup() {
  pinMode(tactil, INPUT);
  Serial.begin(115200);
}
void loop() {
  bool actual = digitalRead(tactil);
  if (actual != anterior) {
    Serial.println(actual ? "TACTO,1" : "TACTO,0");
    anterior = actual;
  }
  delay(15);
}
~~~

**Práctica:** coloca el módulo detrás de una lámina fina de cartón o material no conductor y comprueba si todavía detecta el dedo. Úsalo para disparar una imagen o un sonido. Si hay falsas detecciones, revisa el cableado, el material y la alimentación.

### Experimento D · Potenciómetro: controlar un parámetro

**Montaje:** un terminal externo a 5V, el otro a GND, el central (cursor) a A1. No conectes el terminal central directamente a 5V y GND simultáneamente.

~~~cpp
void setup() { Serial.begin(115200); }
void loop() {
  Serial.print("PERILLA,");
  Serial.println(analogRead(A1));
  delay(40);
}
~~~

**Práctica:** asigna 0–1023 a un rango de frecuencia (por ejemplo 200–1000 Hz) o al tamaño de partículas. El mapeo final se realiza en el programa receptor.

### Experimento E · HC-SR04: acercar la mano para cambiar el sonido

**Montaje:** \`VCC → 5V\`, \`GND → GND\`, \`TRIG → D9\`, \`ECHO → D10\`, con un UNO R3 de lógica 5 V.

~~~cpp
const byte trigPin = 9;
const byte echoPin = 10;
void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(115200);
}
void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  unsigned long duracion = pulseIn(echoPin, HIGH, 30000UL);
  if (duracion > 0) {
    float centimetros = duracion * 0.0343f / 2.0f;
    if (centimetros >= 2 && centimetros <= 400) {
      Serial.print("DISTANCIA,");
      Serial.println(centimetros, 1);
    }
  }
  delay(60);
}
~~~

**Práctica:** acerca lentamente una mano: al disminuir la distancia, eleva la frecuencia de un oscilador o aumenta el tamaño de una figura. Si no recibe eco, el programa omite la lectura; no interpretes automáticamente un eco perdido como cero centímetros.

## 6.11. Laboratorio: del sensor a p5.js y Tone.js

Todas las prácticas anteriores transmiten **una línea de texto por lectura**:

~~~text
BOTON,1
BOTON,0
LUZ,683
TACTO,1
PERILLA,512
DISTANCIA,28.4
~~~

Cada ejemplo es **independiente**: se carga un programa a la vez. Si necesitas simultáneamente varios sensores, combina sus lecturas en un solo sketch, manteniendo los pines asignados y enviando mensajes con nombre.

En la escena web, interpreta cada línea separando por coma: \`tipo,valor\`. Por ejemplo:

~~~javascript
function procesarDato(linea) {
  const [tipo, texto] = linea.trim().split(",");
  const valor = Number(texto);
  if (!Number.isFinite(valor)) return;

  if (tipo === "LUZ") {
    const brillo = Math.max(0, Math.min(255, valor * 255 / 1023));
    // p5.js: usa brillo para color o tamaño
    console.log("Brillo visual:", brillo);
  }
  if (tipo === "BOTON" && valor === 1) {
    // Aquí puedes activar un evento musical (tras iniciar el audio con un gesto)
    console.log("Disparar sonido");
  }
  if (tipo === "DISTANCIA") {
    const v = Math.max(10, Math.min(100, valor));
    // Rango de trabajo expresivo: 10 a 100 cm
    console.log("Distancia medida:", v);
  }
}
~~~

Para recibir estas líneas en una web necesitas conectar la placa con **Web Serial** (en un navegador compatible, con autorización del usuario y contexto seguro) o usar un puente Serial→aplicación. El código anterior **procesa** mensajes, pero no abre por sí solo el puerto. Para sonidos con Tone.js, primero activa el contexto de audio mediante un gesto del usuario.

### Secuencia sugerida para estudiantes

1. **Primera sesión:** pulsador + tacto TTP223 (eventos discretos).
2. **Segunda sesión:** LDR + potenciómetro (valores continuos y mapeo).
3. **Tercera sesión:** HC-SR04 (gesto sin contacto).
4. **Proyecto corto:** elegir dos sensores e implementar una relación **gesto → dato → transformación visual o sonora**.

**Criterios de entrega:** fotografía del circuito, captura de lecturas Serial, código Arduino, captura o video de la escena y una explicación breve de la correspondencia expresiva.

!!! warning "Alimentación y verificación"
    Desconecta la alimentación antes de cambiar cables. Comprueba el nombre y tensión admitida de cada módulo: hay versiones de sensores diferentes. Los ejemplos anteriores están pensados para **Arduino UNO R3 de 5 V**; en otras placas podrían requerirse conversores de nivel.
