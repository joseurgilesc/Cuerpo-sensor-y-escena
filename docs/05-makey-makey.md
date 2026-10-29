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

Antes de activar la cámara, una estructura de **rejas verticales inspiradas en la serie de Fibonacci** se mueve lentamente sobre el fondo. El primer contacto activa la cámara y la retícula continúa en movimiento sobre la imagen.

```
contacto → activar cámara
contacto → sonido + pulso de zoom
```

<a href="../examples/makey-camera-fibonacci/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-camera-fibonacci/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

Cada pulsación genera un acorde y aumenta temporalmente el **zoom digital**. Además, el encuadre mantiene una respiración orgánica muy suave, sin deformar la proporción de la cámara. La intensidad del pulso de zoom depende de la velocidad de las pulsaciones. Las rejas conservan la estructura `1, 1, 2, 3, 5, 8, 13...`, pero se desplazan y respiran de forma continua.

**Controles:** ←, SPACE y →.  
**Versión:** V10.



## 5.9. Ejemplo 8 — selector de videos

Este ejemplo permite cambiar entre tres videos utilizando las flechas del Makey Makey.

```
←     → video anterior
→     → video siguiente
SPACE → pausa / reproducción
```

<a href="../examples/makey-video-switcher/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-video-switcher/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

Los videos se muestran a pantalla completa manteniendo su proporción. Cada cambio produce una transición visual breve y, si el sonido está activado, un acorde asociado al video seleccionado.

**Versión:** V9.

## 5.10. Sonido y uso en clase

Los ejemplos incorporan **Tone.js** de forma sencilla. Primero se pulsa **Activar sonido** y luego cada contacto del Makey Makey genera una respuesta visual y sonora.

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
