# 4. Captura corporal: Kinect y Orbbec

## 4.1. Características de los dispositivos

Las cámaras de profundidad permiten que el computador «vea» el cuerpo en tres dimensiones. Entregan, además de la imagen de color, un **mapa de profundidad**: la distancia de cada punto de la escena a la cámara.

<!-- TODO: incluir ficha técnica del modelo elegido: resolución, alcance, FPS, campo de visión -->

## 4.2. Diferencias entre Kinect y Orbbec

| Criterio | Kinect | Orbbec |
| --- | --- | --- |
| Fabricante | Microsoft | Orbbec |
| Tipo de sensor | Luz estructurada / tiempo de vuelo | Luz estructurada / tiempo de vuelo |
| Disponibilidad | Discontinuada, se consigue usada | En producción |
| Licencias / drivers | Varía según versión | SDK oficial |
| Integración | Amplia comunidad | Creciente |

<!-- TODO: completar comparativa con el modelo exacto y la versión usada -->

## 4.3. Conexión física e instalación

1. Ubica la cámara en un trípode o soporte estable, a la altura del torso.
2. Conecta la cámara al computador por USB.
3. Si el modelo lo requiere (Kinect v1/v2), conecta la fuente de alimentación.
4. Verifica que el LED de la cámara indique alimentación.

## 4.4. Instalación de controladores y librerías

1. Instala el **driver** del fabricante (ver [3.3](03-preparacion.md#33-instalacion-de-controladores)).
2. Instala la **librería/SDK** de captura para tu entorno (openFrameworks o Processing).
3. Verifica con un ejemplo del SDK que la cámara entrega imágenes de profundidad.

<!-- TODO: nombres exactos de drivers, SDK y addons para el modelo elegido -->

## 4.5. Captura de profundidad

La imagen de profundidad asigna a cada píxel un valor de distancia. Es la base de todo lo demás: a partir de ella se separa al cuerpo del fondo y se estima su forma.

- **Rango útil**: <!-- TODO: rango del modelo -->
- **Resolución**: <!-- TODO: resolución del modelo -->

## 4.6. Detección del cuerpo y articulaciones

El SDK detecta el cuerpo y devuelve un **esqueleto** con articulaciones. Los puntos más usados en las actividades son:

- Cabeza, cuello, hombros, codos, muñecas, manos.
- Caderas, rodillas, tobillos, pies.

Cada articulación se reporta con su posición y un **estado de seguimiento** (rastreada, inferida, no rastreada).

## 4.7. Coordenadas X, Y y Z

Cada articulación se expresa en tres ejes:

| Eje | Dirección | Uso expresivo |
| --- | --- | --- |
| **X** | Horizontal (izquierda–derecha) | Panorámica, posición horizontal |
| **Y** | Vertical (arriba–abajo) | Altura, salto, agacharse |
| **Z** | Profundidad (cerca–lejos) | Distancia, avance/retroceso |

## 4.8. Normalización y filtrado de datos

Los valores crudos de la cámara no se usan directamente: se **normalizan** y se **filtran**.

- **Normalización**: mapear los límites reales del espacio a un rango cómodo (por ejemplo, 0 a 1).
- **Filtrado**: suavizar los saltos del seguimiento (media móvil o filtro de suavizado) para evitar temblores en la imagen y el sonido.

## 4.9. Calibración del espacio escénico

1. Define el **área de actuación** (el rectángulo donde se moverá el intérprete).
2. Marca los **límites** en el suelo.
3. Registra los valores X, Y, Z mínimos y máximos alcanzados en los límites.
4. Guarda esos valores como referencia de calibración.

## 4.10. Delimitación de zonas de interacción

Divide el espacio en **zonas** para que cada zona dispare una respuesta distinta:

- **Zona central**: comportamiento base.
- **Zonas laterales**: modifican un parámetro (por ejemplo, panorámica).
- **Zona cercana/lejana**: modifica intensidad o volumen.

## 4.11. Ejemplo: movimiento corporal controlando una imagen

Un prototipo básico: la **mano derecha** controla la posición de una forma en pantalla.

1. Lee la posición X, Y de la mano.
2. Normaliza X e Y al tamaño de la ventana.
3. Dibuja la forma en esa posición.

```
X de la mano  ──▶  posición horizontal de la forma
Y de la mano  ──▶  posición vertical de la forma
```

## 4.12. Ejemplo: gesto corporal controlando un parámetro sonoro

Un gesto (subir el brazo) controla un filtro de sonido.

1. Lee la altura (Y) de la mano.
2. Normaliza Y al rango del filtro.
3. Envía el valor por MIDI u OSC a Ableton Live.

```
altura de la mano  ──▶  frecuencia de corte del filtro
```

## 4.13. Problemas frecuentes y soluciones

| Problema | Causa probable | Solución |
| --- | --- | --- |
| La cámara no se detecta | Driver no instalado o cable defectuoso | Reinstalar driver, cambiar cable/puerto |
| El esqueleto tiembla | Ruido en el seguimiento | Aumentar suavizado/filtrado |
| Se pierde el seguimiento al agacharse | Oclusión o salida del campo de visión | Ajustar ángulo y distancia de la cámara |
| Valores fuera de rango | Espacio mal calibrado | Recalibrar límites |
| Latencia alta | USB sobrecargado o resolución alta | Usar puerto directo, bajar resolución |
