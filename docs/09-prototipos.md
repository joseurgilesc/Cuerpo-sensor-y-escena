# 9. Prototipos integrados

## 9.1. Metodología de prototipado

Cada prototipo se construye en ciclos cortos:

1. **Definir** la interacción (qué hace el intérprete, qué responde el sistema).
2. **Montar** el mínimo necesario (una entrada, una salida).
3. **Probar** y observar qué funciona y qué no.
4. **Ajustar** el mapeo hasta que la relación sea expresiva.

Un prototipo mínimo viable es preferible a un sistema completo y frágil.

## 9.2. Prototipo cuerpo–imagen

- **Entrada**: posición de una articulación (mano).
- **Salida**: una forma en pantalla.
- **Mapeo**: X→posición horizontal, Y→posición vertical, Z→escala.

Ver [ejemplo en la sección 7](07-visuales.md#712-ejemplo-cuerpoimagen).

## 9.3. Prototipo sensor–sonido

- **Entrada**: un sensor (luz o distancia).
- **Salida**: un parámetro sonoro (filtro o volumen).
- **Mapeo**: valor del sensor → CC → parámetro de Ableton.

Ver [ejemplo en la sección 8](08-ableton.md#810-ejemplo-sensorsonido).

## 9.4. Prototipo cuerpo–sonido

- **Entrada**: altura y posición lateral de la mano.
- **Salida**: filtro y panorámica.
- **Mapeo**: altura→filtro, X→panorámica.

## 9.5. Prototipo sensor–imagen

- **Entrada**: luz y distancia.
- **Salida**: color y escala.
- **Mapeo**: luz→color, distancia→escala.

## 9.6. Prototipo cuerpo–imagen–sonido

Integra las dos salidas:

- **Entrada**: cuerpo (articulaciones) y sensores.
- **Salida**: imagen y sonido simultáneos.
- **Mapeo**: un mismo dato puede controlar un parámetro visual y uno sonoro a la vez.

Este es el prototipo central del proyecto y base del [Módulo 5] de Classroom.

## 9.7. Mapeos expresivos para danza

Para danza, prioriza relaciones que el cuerpo entienda de forma natural:

- **Salto** → impulso visual (escala) y sonoro (intensidad).
- **Desplazamiento** → movimiento de cámara o panorámica.
- **Agacharse/levantarse** → filtro o brillo.
- **Silencio/quietud** → estado base o respiración del sistema.

## 9.8. Configuración para aula

- Espacio acotado y bien iluminado.
- Una sola estación de prueba con instrucciones claras.
- Presets guardados para reproducir la demo rápidamente.

## 9.9. Configuración para ensayo

- Área de actuación marcada y calibrada.
- Latencia baja para que la respuesta sea inmediata.
- Registro de los ajustes que se modifican en cada ensayo.

## 9.10. Configuración para escena

- Comprobación previa con la [lista de verificación](11-operacion.md#112-lista-de-verificacion-antes-de-una-sesion).
- Plan de contingencia ante fallos (ver [11.8](11-operacion.md#118-recuperacion-ante-fallos)).
- Iluminación y fondo que no interfieran con la cámara de profundidad.

## 9.11. Descarga de código, presets y ejemplos

Todo el material se aloja en el repositorio:

- [github.com/joseurgilesc/Cuerpo-sensor-y-escena](https://github.com/joseurgilesc/Cuerpo-sensor-y-escena)

<!-- TODO: enlazar cada carpeta (arduino/, openframeworks/, p5js/, ableton/, presets/, ejemplos/) cuando exista -->
