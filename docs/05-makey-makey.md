# 5. Makey Makey

Makey Makey convierte el **contacto físico** con objetos conductores en eventos de teclado o mouse. El computador lo reconoce como un dispositivo **HID**, por lo que p5.js puede leerlo directamente sin usar Serial ni programar firmware.

## 5.1. ¿Cómo funciona?

El principio es sencillo:

```
cuerpo ──▶ objeto conductor ──▶ Makey Makey ──▶ tecla ──▶ p5.js ──▶ imagen + sonido
```

Para cerrar el circuito, una persona mantiene contacto con **EARTH** y toca un objeto conectado a una entrada del Makey Makey. Cuando el circuito se cierra, la placa envía una tecla al computador.

Ejemplo:

```
EARTH en la mano
      +
papel aluminio conectado a SPACE
      ↓
la persona toca el aluminio
      ↓
Makey Makey envía SPACE
      ↓
p5.js ejecuta una acción
```

Las entradas frontales más útiles para estos ejercicios son:

| Entrada Makey Makey | Evento en p5.js |
| --- | --- |
| Flecha izquierda | `LEFT_ARROW` |
| Flecha derecha | `RIGHT_ARROW` |
| Flecha arriba | `UP_ARROW` |
| Flecha abajo | `DOWN_ARROW` |
| SPACE | barra espaciadora |
| Entradas posteriores | W, A, S, D, F, G, según configuración |

!!! tip "Probar sin Makey Makey"
    Todos los ejemplos también funcionan con el **teclado del computador**. Esto permite probar primero el comportamiento y luego conectar las mismas teclas al Makey Makey.

## 5.2. Ejemplo 1 — grupos de columnas

Cada entrada activa un **grupo de columnas** distribuido con distancias inspiradas en la serie de Fibonacci. Las columnas apagadas permanecen blancas y, al activarse, aparecen colores intensos acompañados por acordes armónicos.

```
entrada 1 → columna 1
entrada 2 → columna 2
entrada 3 → columna 3
...
```

<a href="../examples/makey-columns/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-columns/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

**Controles:** ←, ↑, →, ↓, SPACE y W.  
**Versión:** V10.

## 5.3. Ejemplo 2 — barridos con Perlin Noise

Las columnas permanecen blancas hasta que el barrido las atraviesa. El ruido Perlin modifica la altura y el frente de color genera pequeñas partículas. El sonido utiliza síntesis FM con reverb y delay para acompañar el desplazamiento.

```
← → barrido de izquierda a derecha
→ → barrido de derecha a izquierda
```

<a href="../examples/makey-sweep/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-sweep/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

**Versión:** V11.

## 5.4. Ejemplo 3 — crecimiento de partículas

Cada contacto aumenta progresivamente la cantidad de partículas. Si los contactos se producen con mayor frecuencia, aumenta la energía y velocidad. El pulso sonoro hace crecer temporalmente el tamaño de las partículas, vinculando directamente sonido e imagen.

```
más contactos → más partículas
contactos rápidos → más velocidad + energía
```

<a href="../examples/makey-particle-growth/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-particle-growth/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

**Control:** SPACE.  
**Versión:** V11.

## 5.5. Ejemplo 4 — tres fuentes de partículas

Tres entradas activan fuentes más densas de partículas tipo agua desde tres zonas distintas. Las gotas rebotan, producen ondas y cada fuente genera un color y un conjunto sonoro diferente.

```
←     → fuente izquierda
SPACE → fuente central
→     → fuente derecha
```

<a href="../examples/makey-water/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-water/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

Cada zona utiliza un color y una nota diferente.  
**Versión:** V11.

## 5.6. Ejemplo 5 — juego de burbujas

Un ejemplo más lúdico. Dos entradas lanzan burbujas desde lados opuestos. Las nuevas burbujas chocan y empujan a las que ya están en pantalla.

```
← → lanza burbuja desde la izquierda
→ → lanza burbuja desde la derecha
       ↓
colisión y empuje entre burbujas
```

<a href="../examples/makey-bubble-game/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-bubble-game/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

**Versión:** V10.



## 5.7. Ejemplo 6 — fuego

Una variación del sistema de agua, pero con comportamiento ascendente, turbulencia, brasas y una paleta más cálida.

```
←     → fuego izquierda
SPACE → fuego centro
→     → fuego derecha
```

<a href="../examples/makey-fire/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-fire/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

El sonido combina síntesis percusiva grave con ruido filtrado para acompañar la aparición de las llamas.  
**Versión:** V8.

## 5.8. Ejemplo 7 — cámara con rejas Fibonacci

La cámara se muestra **únicamente mientras SPACE permanece presionada**. Al soltar SPACE, la pantalla vuelve completamente a negro. Durante la activación, las rejas Fibonacci pasan gradualmente de negro a blanco y siguen moviéndose.

```
SPACE presionado → cámara + rejas que cambian de negro a blanco
SPACE liberado    → pantalla completamente negra
← y → (con SPACE) → sonido y pulso de zoom
```

<a href="../examples/makey-camera-fibonacci/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-camera-fibonacci/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

Cada pulsación genera un acorde y aumenta temporalmente el **zoom digital**. Además, el encuadre mantiene una respiración orgánica muy suave, sin deformar la proporción de la cámara. La intensidad del pulso de zoom depende de la velocidad de las pulsaciones. Las rejas conservan la estructura `1, 1, 2, 3, 5, 8, 13...`, pero se desplazan y respiran de forma continua.

**Controles:** mantén SPACE para mostrar la cámara; ← y → generan pulsos adicionales.  
**Versión:** V11.



## 5.9. Ejemplo 8 — selector de videos

Este ejemplo permite cambiar entre tres videos utilizando las flechas del Makey Makey.

```
←     → video anterior
→     → video siguiente
SPACE → pausa / reproducción
```

<a href="../examples/makey-video-switcher/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-video-switcher/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

Los videos se muestran a pantalla completa manteniendo su proporción. Cada cambio produce una transición visual breve. El usuario puede seleccionar videos locales desde el equipo si los MP4 publicados no están disponibles.

La **música instrumental teatral de fondo** sustituye a los acordes que antes se reproducían en cada cambio: la pista permanece sonando sin reiniciarse al alternar videos. Pulsa **Activar música** para iniciar (los navegadores bloquean el audio automático), y ajusta el volumen con el deslizador. También se puede utilizar **Cambiar pista** para seleccionar un archivo de audio local.

**Pista de referencia:** [Horizon Flare, de Alexander Nakarada](https://commons.wikimedia.org/wiki/File:Horizon_Flare_by_Alexander_Nakarada.ogg), música de piano cinematográfica, licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Se reproduce mediante enlace a Wikimedia Commons; requiere conexión a internet. No se han introducido cambios en el audio de la composición, solo se controla reproducción y volumen.

**Versión:** V13.

## 5.10. Sonido y uso en clase

La mayoría de ejemplos incorpora **Tone.js** y síntesis en tiempo real. El **selector de videos** usa en cambio una pista instrumental pregrabada, que se inicia pulsando **Activar música** para respetar las restricciones de reproducción automática del navegador.

Una secuencia de trabajo recomendada es:

```
1. probar con teclado
2. conectar Makey Makey
3. conectar EARTH
4. conectar objetos conductores
5. probar cada entrada
6. modificar color, sonido o comportamiento
```

El objetivo no es solamente que una tecla dispare un efecto, sino explorar cómo el **material, el gesto, la respuesta visual y el sonido** pueden construir una interacción con sentido artístico.

## 5.11. Crear visuales y música con ChatGPT: ejemplo de prompt

Además de ejecutar los ejemplos anteriores, puedes usar **ChatGPT como asistente de programación creativa** para diseñar tu propia interacción entre el **Makey Makey, la imagen y el sonido**. No es necesario conocer previamente todo el código: lo importante es describir con claridad la experiencia artística, qué hará cada entrada y qué herramientas se utilizarán.

En este ejercicio trabajaremos con:

- **Makey Makey:** envía al computador las flechas del teclado.
- **p5.js:** dibuja y anima visuales generativos en el navegador.
- **Tone.js:** genera música y sonidos originales en tiempo real.
- **HTML, CSS y JavaScript:** integran el prototipo en una página web.

### Prompt de ejemplo para copiar en ChatGPT

Copia el siguiente texto en un chat nuevo. Puedes cambiar las correspondencias de las flechas, los colores, los sonidos y la propuesta estética.

```text
Actúa como artista de nuevos medios y programador especializado en
creative coding. Quiero crear una experiencia interactiva para una
clase de Artes Musicales y Artes Escénicas, utilizando Makey Makey,
p5.js y Tone.js.

OBJETIVO ARTÍSTICO
Diseña una pequeña pieza audiovisual generativa, abstracta y
experimental. Cada flecha del Makey Makey debe transformar tanto los
visuales como la música instrumental. Quiero transiciones suaves,
movimiento continuo y una estética adecuada para una escena teatral.

CONTROLES E INTERACCIÓN
El Makey Makey funciona como un teclado USB. Usa los eventos
ArrowLeft, ArrowRight, ArrowUp, ArrowDown y Space.

- Flecha izquierda: ondas horizontales azules, movimiento lento y
  música ambiental con notas graves y largas.
- Flecha derecha: partículas cálidas que se dispersan, pulsos
  rítmicos y sonidos percusivos suaves.
- Flecha arriba: columnas luminosas que crecen, arpegios ascendentes
  y una sensación de expansión.
- Flecha abajo: líneas y retículas que descienden, notas más graves,
  ritmo lento y una sensación de contracción.
- SPACE: detener o reanudar la animación y la música.

Cada flecha debe cambiar a una escena visual y sonora distinta.
La música debe ser ORIGINAL, generada con Tone.js, no una canción
preexistente ni un archivo de audio externo. Evita que al cambiar
de escena queden sintetizadores o secuencias duplicados sonando.

REQUISITOS TÉCNICOS
1. Usa p5.js para los visuales generativos y Tone.js para la música.
2. Entrégame un único archivo index.html con HTML, CSS y JavaScript,
   listo para abrir en el navegador y publicar con GitHub Pages.
3. Carga las bibliotecas desde un CDN; no uses servidores, archivos
   adicionales ni dependencias que requieran instalación.
4. El canvas debe ocupar la pantalla y adaptarse a su tamaño.
5. Incluye un botón visible "Activar sonido" porque el navegador
   exige una interacción del usuario antes de reproducir audio.
6. Añade control de volumen y un indicador de la escena activa.
7. Haz que las flechas funcionen primero con el teclado convencional
   y después con Makey Makey, sin cambiar el código.
8. Evita el desplazamiento de la página al presionar las flechas
   o SPACE. Gestiona las pulsaciones mantenidas sin errores.
9. Escribe funciones separadas para visuales, música y teclado.
   Añade comentarios claros para que estudiantes principiantes
   puedan modificar parámetros como colores, velocidad, notas,
   instrumentos y patrones rítmicos.
10. Prioriza estabilidad y funcionamiento real en Chrome o Firefox.
    No uses imágenes ni música con derechos de terceros.

FORMA DE ENTREGA
Primero explica brevemente qué ocurre con cada flecha.
Después entrega TODO el código completo de index.html.
Al final, indica cómo probarlo sin Makey Makey, cómo conectarlo
al Makey Makey y qué partes del código puedo modificar para crear
una versión artística propia.

Si debes elegir detalles no especificados, toma decisiones creativas
coherentes y entrega una primera versión funcional.
```

### Del prompt al prototipo

1. **Experimenta primero con el teclado:** comprueba la respuesta visual y musical de cada flecha.
2. **Prueba con Makey Makey:** conecta las entradas de las flechas a objetos conductores y utiliza **EARTH** para cerrar el circuito.
3. **Modifica tu idea:** solicita a ChatGPT cambios específicos, por ejemplo: «Haz que la flecha derecha genere partículas más lentas y una textura sonora menos rítmica».
4. **Documenta el resultado:** guarda tu código, registra una prueba audiovisual y describe cómo se relacionan el gesto, el sonido y la imagen.

!!! note "Importante"
    ChatGPT ayuda a **generar y revisar el código**, pero la interacción física sucede en la **página web abierta en el navegador**, con el Makey Makey conectado por USB. Para escuchar la música es necesario pulsar **Activar sonido**. Una vez generado, prueba el código y solicita correcciones si algún control no funciona.

**Para reflexionar:** ¿qué cambia en el significado escénico cuando una flecha no solo activa un efecto, sino que modifica simultáneamente el movimiento visual, el ritmo y la atmósfera sonora?

