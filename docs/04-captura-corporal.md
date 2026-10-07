# 4. Captura corporal: cámara web y ml5.js

## 4.1. Características de la captura

La captura corporal usa la **cámara web** del computador y la biblioteca **ml5.js**, que aplica modelos de **machine learning** para detectar la pose del intérprete directamente en el navegador, en el mismo sketch que p5.js y Tone.js.

- No requiere hardware adicional ni controladores.
- ml5.js detecta los **puntos clave** del cuerpo (cabeza, hombros, codos, muñecas, caderas, rodillas, tobillos).
- Las coordenadas se expresan en dos ejes (X, Y); la distancia (Z) se **estima** por el tamaño del cuerpo en el encuadre.

<!-- TODO: indicar el modelo exacto de ml5.js (PoseNet, MoveNet o similar) -->

## 4.2. ml5.js y detección de pose

ml5.js es una biblioteca de machine learning para el navegador, construida sobre TensorFlow.js y pensada para usarse junto con p5.js. Su módulo de **detección de pose** (`ml5.poseNet()` o `ml5.handpose()`) estima la posición de los puntos clave a partir del video de la cámara web.

## 4.3. Configuración de la cámara web

1. Accede al video con `createCapture(VIDEO)` de p5.js.
2. Autoriza el uso de la cámara cuando el navegador lo solicite.
3. Verifica que la cámara entrega el video en el sketch.

## 4.4. Puntos clave del cuerpo (keypoints)

El modelo devuelve un conjunto de **puntos clave**, cada uno con su posición (x, y) y un **nivel de confianza**. Los más usados en las actividades son:

- Nariz, ojos, orejas.
- Hombros, codos, muñecas.
- Caderas, rodillas, tobillos.

## 4.5. Coordenadas X e Y (y distancia estimada)

Cada punto clave se expresa en dos ejes; la profundidad se estima a partir del tamaño del cuerpo en el encuadre:

| Eje | Dirección | Uso expresivo |
| --- | --- | --- |
| **X** | Horizontal (izquierda–derecha) | Panorámica, posición horizontal |
| **Y** | Vertical (arriba–abajo) | Altura, salto, agacharse |
| **Distancia estimada** | Cerca–lejos (por tamaño) | Escala, transparencia |

## 4.6. Normalización y filtrado de datos

Los valores crudos no se usan directamente: se **normalizan** y se **filtran**.

- **Normalización**: mapear los límites reales del encuadre a un rango cómodo (por ejemplo, 0 a 1).
- **Filtrado**: suavizar los saltos de la detección (media móvil o filtro de suavizado) para evitar temblores.

## 4.7. Calibración del espacio escénico

1. Define el **área de actuación** (el rectángulo donde se moverá el intérprete).
2. Marca los **límites** en el suelo.
3. Registra los valores X, Y mínimos y máximos alcanzados en los límites.
4. Guarda esos valores como referencia de calibración.

## 4.8. Delimitación de zonas de interacción

Divide el encuadre en **zonas** para que cada zona dispare una respuesta distinta:

- **Zona central**: comportamiento base.
- **Zonas laterales**: modifican un parámetro (por ejemplo, panorámica).
- **Zona cercana/lejana**: modifica intensidad o volumen (por tamaño estimado).

## 4.9. Ejemplo inicial: pintura táctil con mouse o dedo

Antes de trabajar con cámara y detección corporal, este ejemplo introduce la interacción de forma directa mediante **mouse, dedo o lápiz táctil**. El gesto deja un trazo pictórico con una paleta cálida y pequeñas variaciones producidas por **ruido Perlin**.

- **Mouse / dedo** → posición del pincel.
- **Velocidad del gesto** → grosor y cantidad de salpicaduras.
- **Perlin Noise** → irregularidad orgánica del trazo.
- **Punto ON/OFF** → muestra u oculta el indicador del puntero.
- **Limpiar** → borra la composición.
- **Pantalla completa** → amplía el lienzo al área disponible del dispositivo.

```
posición ──▶ trazo
velocidad ──▶ grosor + salpicaduras
Perlin Noise ──▶ variación orgánica
```

<a href="../examples/pointer-paint/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo interactivo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/pointer-paint/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

<div style="margin-top:0.8rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fjoseurgilesc.github.io%2FCuerpo-sensor-y-escena%2Fexamples%2Fpointer-paint%2F" alt="QR pointer-paint" width="150" height="150" loading="lazy">
  <small>Escanea el código QR para abrir este ejemplo directamente en un móvil o tablet.</small>
</div>

!!! info "Uso"
    Funciona sin cámara. En computador se pinta arrastrando el mouse; en móvil o tablet, arrastrando el dedo sobre la pantalla.

## 4.10. Ejemplo: movimiento corporal controlando una imagen

Un prototipo básico: la **mano derecha** controla la posición de una forma en pantalla.

1. Lee la posición X, Y de la muñeca.
2. Normaliza X e Y al tamaño de la ventana.
3. Dibuja la forma en esa posición.

```
X de la muñeca  ──▶  posición horizontal de la forma
Y de la muñeca  ──▶  posición vertical de la forma
```

En el ejemplo interactivo, la mano derecha controla un **cartel gráfico generativo**: su posición mueve la composición, su altura modifica la escala y la orientación del brazo añade una ligera rotación.

<a href="../examples/bodypose-image/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo interactivo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/bodypose-image/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

<div style="margin-top:0.8rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fjoseurgilesc.github.io%2FCuerpo-sensor-y-escena%2Fexamples%2Fbodypose-image%2F" alt="QR bodypose-image" width="150" height="150" loading="lazy">
  <small>Escanea el código QR para abrir este ejemplo directamente en un móvil o tablet.</small>
</div>

!!! info "Uso"
    Pulsa **Play** para iniciar BodyPose. Mueve la mano derecha por el encuadre para desplazar la imagen. El botón **Vista cámara** muestra u oculta únicamente el video y **Stop** detiene la captura.

## 4.11. Ejemplo: gesto corporal controlando un parámetro sonoro

Un gesto (subir el brazo) controla un filtro de sonido.

1. Lee la altura (Y) de la muñeca.
2. Normaliza Y al rango del filtro.
3. Envía el valor a Tone.js.

```
altura de la mano  ──▶  frecuencia de corte del filtro
```

## 4.12. Ejemplo interactivo: seguimiento de manos (Handpose)

Un ejemplo de detección de manos con **ml5.js HandPose**. Las puntas de los dedos actúan como atractores de un sistema de partículas.

<a href="../examples/handpose/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo interactivo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/handpose/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

<div style="margin-top:0.8rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fjoseurgilesc.github.io%2FCuerpo-sensor-y-escena%2Fexamples%2Fhandpose%2F" alt="QR handpose" width="150" height="150" loading="lazy">
  <small>Escanea el código QR para abrir este ejemplo directamente en un móvil o tablet.</small>
</div>

!!! info "Uso"
    El ejemplo se abre en una nueva pestaña. Pulsa **Play** y autoriza el uso de la cámara cuando el navegador lo solicite.

## 4.13. Ejemplo interactivo: seguimiento corporal con BodyPose

Este segundo ejemplo amplía el seguimiento de manos hacia el **cuerpo completo** mediante **ml5.js BodyPose**. El sistema detecta articulaciones principales y dibuja un esqueleto sobre la imagen de cámara.

Además, los datos corporales controlan un comportamiento visual:

- **Mano derecha** → genera partículas.
- **Distancia entre ambas manos** → controla la cantidad de partículas.
- **Vista cámara** → muestra u oculta únicamente la imagen de video; la detección continúa activa.

```
mano derecha ──▶ emisión de partículas
distancia entre manos ──▶ densidad visual
```

<a href="../examples/bodypose/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo interactivo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/bodypose/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

!!! info "Uso"
    El ejemplo se abre en una nueva pestaña. Pulsa **Play** para iniciar la cámara y **Stop** para detenerla. En teléfono, usa preferentemente la cámara frontal.

## 4.14. Ejemplo interactivo: cuerpo, color y movimiento

Este ejemplo utiliza **BodyPose** para transformar el movimiento corporal en una visualidad más expresiva y colorida.

- **Muñecas** → dibujan trazos de color.
- **Velocidad de las manos** → aumenta el tamaño de los trazos y genera explosiones de partículas.
- **Distancia entre las manos** → genera un pulso visual central.
- **Vista cámara** → muestra u oculta únicamente la imagen de video; la detección continúa activa.

```
posición de las manos ──▶ trazos de color
velocidad ──▶ tamaño + explosiones
distancia entre manos ──▶ expansión visual
```

<a href="../examples/bodypose-color/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo interactivo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/bodypose-color/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

<div style="margin-top:0.8rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fjoseurgilesc.github.io%2FCuerpo-sensor-y-escena%2Fexamples%2Fbodypose-color%2F" alt="QR bodypose-color" width="150" height="150" loading="lazy">
  <small>Escanea el código QR para abrir este ejemplo directamente en un móvil o tablet.</small>
</div>

!!! info "Uso"
    El ejemplo se abre en una nueva pestaña. Pulsa **Play** para iniciar la cámara y **Stop** para detenerla. En teléfono, usa preferentemente la cámara frontal.

## 4.15. Ejemplo interactivo: partículas y audio con la mano derecha

Este ejemplo combina **BodyPose**, partículas y **Tone.js**. La muñeca derecha se convierte en el centro de atracción del sistema visual, mientras su posición controla un sonido continuo y sutil.

- **Mano derecha** → atrae y hace girar las partículas.
- **Posición X** → controla el paneo estéreo.
- **Posición Y** → controla la altura del sonido y la frecuencia de corte de un filtro.
- **Play** → inicia la cámara y habilita Tone.js.
- **Stop** → detiene la cámara y silencia el audio.
- **Fader de volumen** → ajusta el nivel de la capa sonora.
- **Vista cámara** → muestra u oculta únicamente la imagen de video; BodyPose sigue funcionando.

```
mano derecha X ──▶ paneo
mano derecha Y ──▶ frecuencia + filtro
posición de la mano ──▶ atracción de partículas
```

El audio se mantiene deliberadamente suave para funcionar como una capa sonora complementaria y no como el elemento principal de la interacción.

<a href="../examples/bodypose-audio/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo interactivo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/bodypose-audio/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

<div style="margin-top:0.8rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fjoseurgilesc.github.io%2FCuerpo-sensor-y-escena%2Fexamples%2Fbodypose-audio%2F" alt="QR bodypose-audio" width="150" height="150" loading="lazy">
  <small>Escanea el código QR para abrir este ejemplo directamente en un móvil o tablet.</small>
</div>

!!! info "Uso"
    El ejemplo se abre en una nueva pestaña. Pulsa **Play** para iniciar cámara y audio, ajusta el **fader de volumen** y usa **Stop** para detener la experiencia.

## 4.16. Ejemplo interactivo: partículas y gesto sonoro

Este ejemplo combina **BodyPose**, partículas y **Tone.js**, pero el sonido no está activo de forma permanente: aparece mediante un gesto corporal.

- **Juntar ambas manos** → activa una textura sonora suave.
- **Separar las manos** → libera y apaga progresivamente el sonido.
- **Ambas muñecas** → atraen las partículas.
- **Fader de volumen** → controla la intensidad del audio.
- **Play / Stop** → inicia o detiene cámara y audio.
- **Vista cámara** → muestra u oculta únicamente la imagen de video; BodyPose sigue funcionando.

```
manos separadas ──▶ silencio
manos juntas ──▶ sonido + concentración de partículas
```

<a href="../examples/bodypose-gesture-audio/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo interactivo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/bodypose-gesture-audio/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

<div style="margin-top:0.8rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fjoseurgilesc.github.io%2FCuerpo-sensor-y-escena%2Fexamples%2Fbodypose-gesture-audio%2F" alt="QR bodypose-gesture-audio" width="150" height="150" loading="lazy">
  <small>Escanea el código QR para abrir este ejemplo directamente en un móvil o tablet.</small>
</div>

!!! info "Uso"
    Pulsa **Play** y autoriza la cámara. Acerca ambas manos entre sí para activar el sonido; sepáralas para apagarlo. El ejemplo está diseñado para ajustarse al tamaño de pantalla de computador o teléfono.

## 4.17. Ejemplo interactivo: pintura corporal con manos y pies

Este ejemplo convierte cuatro puntos del cuerpo en **pinceles digitales** y combina la pintura corporal con **música generativa en Tone.js**. El movimiento crea el trazo y, al mismo tiempo, la energía de la música modifica la respuesta visual.

La paleta utiliza cuatro colores diferenciados:

- **Mano izquierda** → coral.
- **Mano derecha** → turquesa.
- **Pie izquierdo** → amarillo.
- **Pie derecho** → índigo.
- Los movimientos rápidos generan pequeñas salpicaduras.
- **Ambiental** → acordes lentos y resonantes.
- **Pulso** → bajo y percusión con mayor sensación rítmica.
- **Arpegio** → secuencia melódica más activa.
- **Manos juntas** → dispara una **campana/acorde brillante** claramente separada de la música de fondo.
- **Ambos brazos arriba** → dispara un **ascenso melódico rápido**.
- **Brazos abiertos** → dispara un **impacto grave + acorde amplio**.
- **Volumen** → controla el nivel general de la música.
- **Silencio** → detiene únicamente la música.
- **Limpiar** → borra el lienzo para comenzar una nueva composición.

La visual también escucha el audio: cuando aumenta la energía sonora, los trazos se vuelven más gruesos, crecen las salpicaduras y aparecen pulsaciones gráficas en el centro del canvas. Los gestos corporales funcionan además como **disparadores musicales**. Cuando se reconoce uno, la música de fondo baja brevemente para que el sonido generado por el gesto quede en primer plano y aparece un rótulo visual indicando el evento sonoro.

```
manos + pies ──▶ pinceles
trayectoria corporal ──▶ trazo
velocidad ──▶ grosor + salpicadura

música ──▶ energía visual
energía sonora ──▶ grosor + pulso + salpicaduras

manos juntas ──▶ CAMPANA / ACORDE
brazos arriba ──▶ ASCENSO MELÓDICO
brazos abiertos ──▶ IMPACTO GRAVE + ACORDE
```

<a href="../examples/bodypose-paint/" target="_blank" rel="noopener" class="md-button md-button--primary">▶ Abrir ejemplo interactivo</a>
<a href="https://github.com/joseurgilesc/Cuerpo-sensor-y-escena/blob/main/docs/examples/bodypose-paint/sketch.js" target="_blank" rel="noopener" class="md-button">Ver código</a>

<div style="margin-top:0.8rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fjoseurgilesc.github.io%2FCuerpo-sensor-y-escena%2Fexamples%2Fbodypose-paint%2F" alt="QR bodypose-paint" width="150" height="150" loading="lazy">
  <small>Escanea el código QR para abrir este ejemplo directamente en un móvil o tablet.</small>
</div>

!!! info "Uso"
    Pulsa **Play** para iniciar BodyPose y habilitar el audio. El ejemplo comienza con la escena **Ambiental**; puedes cambiar en cualquier momento a **Pulso** o **Arpegio**, ajustar el volumen o usar **Silencio**. Prueba juntar las manos, levantar ambos brazos por encima de los hombros y abrir los brazos lateralmente. Cada gesto dispara un sonido distinto y muestra en pantalla el nombre del evento sonoro. Sitúa el cuerpo completo dentro del encuadre para que BodyPose detecte manos y tobillos. Para trabajar con los pies, conviene alejarse de la cámara hasta que se vea la figura completa.

## 4.18. Compatibilidad móvil y controles

Los ejemplos de esta sección se han unificado con los mismos controles básicos:

- **Play**: inicia la cámara y la detección.
- **Stop**: es el único control que realmente detiene la captura de cámara y la detección.
- **Vista cámara**: muestra u oculta **solo la imagen de video en el canvas**. La cámara y la detección continúan funcionando en segundo plano.
- **Esqueleto**: activa o desactiva conjuntamente los **puntos (keypoints)** y las **líneas de conexión** del esqueleto detectado por HandPose o BodyPose.
- **Modo amplio**: en móvil evita el fullscreen nativo del navegador y expande el canvas sobre todo el **viewport visible**, reduciendo errores y pantallazos blancos.
- **Modo escena móvil**: al pulsar **Play**, los controles y textos de ayuda se ocultan automáticamente para dejar libre el canvas. En el ejemplo táctil, este modo se activa al comenzar a dibujar.
- **Recuperar controles**: toca la **esquina superior derecha**; los controles reaparecen durante unos segundos y luego vuelven a ocultarse.
- Los ejemplos con Tone.js incluyen control de volumen y requieren una interacción inicial del usuario para habilitar audio.

El **canvas** se calcula a partir del área real disponible del navegador y se reajusta cuando cambia la orientación o el tamaño de la ventana. La cámara toma como referencia la **proporción real entregada por el dispositivo** y nunca se estira.

- En **pantalla vertical**, se solicita preferentemente una captura cercana a **3:4**. Si el navegador entrega realmente una señal vertical, se aprovecha directamente.
- Si el dispositivo devuelve una señal horizontal, se usa **contain** para conservar el fotograma completo y evitar un recorte que produzca sensación de zoom.
- En **pantalla horizontal**, también se conserva el fotograma completo.

La misma transformación se aplica a los puntos y líneas del esqueleto de HandPose y BodyPose, por lo que permanecen alineados con la imagen. La resolución también se limita según el tipo de dispositivo para equilibrar calidad y rendimiento. En teléfonos se solicita preferentemente la cámara frontal.

!!! note "Compatibilidad"
    El funcionamiento depende del navegador, permisos de cámara y capacidad gráfica del dispositivo. En móviles recientes se recomienda Chrome o Safari actualizado y cerrar otras aplicaciones que estén usando la cámara. En móvil ya no se usa el **Fullscreen API** para el modo escena: el canvas se fija al viewport visible y se reajusta con `visualViewport`, lo que evita el pantallazo blanco observado en algunos navegadores. La barra propia del navegador puede seguir visible, pero el ejemplo utiliza toda el área útil disponible.

## 4.19. Problemas frecuentes y soluciones

| Problema | Causa probable | Solución |
| --- | --- | --- |
| No se detecta la pose | Mala iluminación o persona fuera de encuadre | Mejorar la luz, centrar a la persona |
| El esqueleto tiembla | Ruido en la detección | Aumentar suavizado/filtrado |
| Se pierde la detección | Oclusión o salida del encuadre | Ajustar ángulo y distancia de la cámara |
| Valores fuera de rango | Espacio mal calibrado | Recalibrar límites |
| Latencia alta | Video de alta resolución o CPU saturada | Bajar resolución del video |
