# 5. Arduino e interfaces físicas

## 5.1. Arquitectura de la interfaz

La interfaz física convierte una acción del intérprete en una señal eléctrica y luego en un valor numérico:

```
acción física ──▶ sensor ──▶ Arduino ──▶ Serial ──▶ computador
```

Cada interfaz se diseña alrededor de una **intención expresiva**: qué acción del cuerpo o del objeto queremos que el sistema perciba.

## 5.2. Alimentación y seguridad eléctrica

- Alimenta Arduino por **USB** para la mayoría de los prototipos.
- Usa una **fuente externa** solo si los sensores demandan más corriente.
- No excedas la corriente que puede entregar cada pin (<!-- TODO: límites según placa -->).
- Verifica la **polaridad** antes de conectar cualquier componente.

!!! danger "Seguridad"
    Trabaja con el circuito **desconectado** al montar o modificar conexiones. Usa resistencias de protección donde corresponda y evita cortocircuitos.

## 5.3. Diagramas de conexión y pinout

<!-- TODO: incluir los diagramas de conexión reales de cada interfaz -->

Cada interfaz documenta su **pinout**: qué pin de Arduino se conecta a qué terminal del sensor.

## 5.4. Entradas analógicas y digitales

| Tipo | Señales | Uso |
| --- | --- | --- |
| Analógica | Continua (0–1023) | Luz, presión, distancia |
| Digital | Dos estados (0/1) | Pulsadores, interruptores |

## 5.5. Sensores de luz

Miden la cantidad de luz que reciben. Se usan para responder a la presencia, a la sombra o a una linterna.

- Tipo común: fotorresistor (LDR) con divisor de tensión.
- <!-- TODO: modelo exacto y esquema -->

## 5.6. Sensores de presión

Miden la fuerza aplicada. Se usan en superficies sensibles al tacto o al peso.

- Tipo común: sensor de fuerza resistivo (FSR).
- <!-- TODO: modelo exacto y esquema -->

## 5.7. Sensores de movimiento o distancia

Miden la distancia a un objeto o detectan movimiento.

- Tipos: ultrasónico, infrarrojo, tiempo de vuelo.
- <!-- TODO: modelo exacto y esquema -->

## 5.8. Pulsadores y controles físicos

Entradas digitales simples para disparar eventos o cambiar estados.

- Pulsador con resistencia **pull-up** o **pull-down**.
- Potenciómetro como control continuo manual.

## 5.9. Lectura de sensores

En el firmware se leen las entradas y se preparan para enviarse:

```cpp
// TODO: verificar y pegar el código base real usado en las interfaces
int lectura = analogRead(A0);
```

## 5.10. Calibración y normalización de valores

1. Registra el **valor mínimo** y **máximo** real de cada sensor en uso.
2. Normaliza con la función de mapeo de Arduino (`map`) a un rango cómodo.
3. Guarda los valores de calibración como constantes al inicio del firmware.

## 5.11. Filtrado, suavizado y eliminación de ruido

- Usa un **promedio móvil** para suavizar lecturas inestables.
- Define un **umbral** para ignorar variaciones pequeñas.
- Aplica **histéresis** si un valor oscila alrededor de un límite.

## 5.12. Código base para Arduino

<!-- TODO: pegar el firmware base definitivo, con comentarios por sección -->

El firmware base sigue esta estructura:

1. Inclusión de librerías.
2. Definición de pines y constantes de calibración.
3. `setup()`: iniciar Serial y configurar pines.
4. `loop()`: leer sensores, filtrar, normalizar y enviar por Serial.

## 5.13. Pruebas individuales de los sensores

Antes de integrar, prueba **cada sensor por separado**:

1. Carga un sketch que muestre la lectura por el monitor Serial.
2. Actúa sobre el sensor y observa que el valor responde como se espera.
3. Registra el rango y el ruido observado.

## 5.14. Problemas frecuentes y soluciones

| Problema | Causa probable | Solución |
| --- | --- | --- |
| Lectura constante (sin cambio) | Cable suelto o pin mal configurado | Revisar conexión y pinMode |
| Valores que saltan | Ruido o contacto deficiente | Filtrar, revisar conexiones |
| Valor siempre 0 o 1023 | Cortocircuito o sensor dañado | Revisar circuito, probar otro sensor |
| Arduino no se comunica | Puerto o placa incorrectos | Verificar puerto y placa en el IDE |

## 5.15. Makey Makey como interfaz alternativa

Makey Makey convierte el **contacto físico** con objetos conductores en eventos de teclado o mouse. El computador lo reconoce como un dispositivo **HID**, por lo que p5.js puede leerlo directamente sin usar Serial ni programar firmware.

### 5.15.1. ¿Cómo funciona?

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

### 5.15.2. Ejemplo 1 — grupos de columnas

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

### 5.15.3. Ejemplo 2 — barridos con Perlin Noise

Las columnas permanecen blancas hasta que el barrido las atraviesa. El ruido Perlin modifica la altura y el frente de color genera pequeñas partículas. El sonido utiliza síntesis FM con reverb y delay para acompañar el desplazamiento.

```
← → barrido de izquierda a derecha
→ → barrido de derecha a izquierda
```

<a href="../examples/makey-sweep/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-sweep/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

**Versión:** V8.

### 5.15.4. Ejemplo 3 — crecimiento de partículas

Cada contacto aumenta progresivamente la cantidad de partículas. Si los contactos se producen con mayor frecuencia, aumenta la energía y velocidad. El pulso sonoro hace crecer temporalmente el tamaño de las partículas, vinculando directamente sonido e imagen.

```
más contactos → más partículas
contactos rápidos → más velocidad + energía
```

<a href="../examples/makey-particle-growth/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-particle-growth/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

**Control:** SPACE.  
**Versión:** V8.

### 5.15.5. Ejemplo 4 — tres fuentes de partículas

Tres entradas activan fuentes más densas de partículas tipo agua desde tres zonas distintas. Las gotas rebotan, producen ondas y cada fuente genera un color y un conjunto sonoro diferente.

```
←     → fuente izquierda
SPACE → fuente central
→     → fuente derecha
```

<a href="../examples/makey-water/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-water/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

Cada zona utiliza un color y una nota diferente.  
**Versión:** V8.

### 5.15.6. Ejemplo 5 — juego de burbujas

Un ejemplo más lúdico. Dos entradas lanzan burbujas desde lados opuestos. Las nuevas burbujas chocan y empujan a las que ya están en pantalla.

```
← → lanza burbuja desde la izquierda
→ → lanza burbuja desde la derecha
       ↓
colisión y empuje entre burbujas
```

<a href="../examples/makey-bubble-game/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-bubble-game/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

**Versión:** V8.



### 5.15.8. Ejemplo 6 — fuego

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

### 5.15.9. Ejemplo 7 — cámara con rejas Fibonacci

El primer contacto activa la cámara. Sobre la imagen aparecen **rejas negras verticales** con anchos inspirados en proporciones de la serie de Fibonacci.

```
contacto → activar cámara
contacto → sonido + pulso de zoom
```

<a href="../examples/makey-camera-fibonacci/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-camera-fibonacci/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

Cada pulsación genera un acorde y aumenta temporalmente el **zoom digital** de la imagen. La intensidad del zoom depende de la velocidad de las pulsaciones. Las rejas mantienen una estructura basada en la secuencia `1, 1, 2, 3, 5, 8, 13...`.

**Controles:** ←, SPACE y →.  
**Versión:** V8.



### 5.15.10. Ejemplo 8 — selector de videos

Este ejemplo permite cambiar entre cuatro videos utilizando las flechas del Makey Makey.

```
←     → video anterior
→     → video siguiente
SPACE → pausa / reproducción
```

<a href="../examples/makey-video-switcher/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/makey-video-switcher/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

Los videos se muestran a pantalla completa manteniendo su proporción. Cada cambio produce una transición visual breve y, si el sonido está activado, un acorde asociado al video seleccionado.

**Versión:** V8.

### 5.15.7. Sonido y uso en clase

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

