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

## 4.9. Ejemplo: movimiento corporal controlando una imagen

Un prototipo básico: la **mano derecha** controla la posición de una forma en pantalla.

1. Lee la posición X, Y de la muñeca.
2. Normaliza X e Y al tamaño de la ventana.
3. Dibuja la forma en esa posición.

```
X de la muñeca  ──▶  posición horizontal de la forma
Y de la muñeca  ──▶  posición vertical de la forma
```

## 4.10. Ejemplo: gesto corporal controlando un parámetro sonoro

Un gesto (subir el brazo) controla un filtro de sonido.

1. Lee la altura (Y) de la muñeca.
2. Normaliza Y al rango del filtro.
3. Envía el valor a Tone.js.

```
altura de la mano  ──▶  frecuencia de corte del filtro
```

## 4.11. Ejemplo interactivo: seguimiento de manos (Handpose)

Un ejemplo en vivo de detección de manos con **ml5.js Handpose** desde la cámara web:

<iframe src="https://editor.p5js.org/jose.urgiles-tender/full/IcLn1JGo4" width="100%" height="500" style="border:1px solid #ddd; border-radius:8px;" allow="camera; fullscreen" allowfullscreen loading="lazy" title="Ejemplo de seguimiento de manos con ml5.js Handpose"></iframe>

!!! tip "Ver el código"
    [Abrir el código en el editor de p5.js](https://editor.p5js.org/jose.urgiles-tender/sketches/IcLn1JGo4)

## 4.12. Problemas frecuentes y soluciones

| Problema | Causa probable | Solución |
| --- | --- | --- |
| No se detecta la pose | Mala iluminación o persona fuera de encuadre | Mejorar la luz, centrar a la persona |
| El esqueleto tiembla | Ruido en la detección | Aumentar suavizado/filtrado |
| Se pierde la detección | Oclusión o salida del encuadre | Ajustar ángulo y distancia de la cámara |
| Valores fuera de rango | Espacio mal calibrado | Recalibrar límites |
| Latencia alta | Video de alta resolución o CPU saturada | Bajar resolución del video |
