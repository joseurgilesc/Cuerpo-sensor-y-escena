# Cuerpo, sensor y escena

*Metodologías generativas en tiempo real para artes escénicas y musicales.*

Este sitio reúne la **documentación técnica** del proyecto «Cuerpo, sensor y escena»: cómo funciona, se instala, se conecta, se calibra, se prueba y se mantiene el sistema interactivo que vincula el cuerpo del intérprete con imagen y sonido generados en tiempo real.

## Qué es este proyecto

«Cuerpo, sensor y escena» es un laboratorio de prototipado artístico que integra:

- **Captura corporal** mediante cámaras de profundidad (Kinect u Orbbec).
- **Interfaces físicas** construidas con Arduino y sensores (luz, presión, movimiento, distancia).
- **Visuales generativos** programados en openFrameworks, p5.js o Processing.
- **Sonido interactivo** controlado desde Ableton Live mediante MIDI, OSC o Serial.

El resultado es un sistema que transforma gesto, movimiento y presencia física en **imagen y sonido expresivos**, pensado para el aula, el ensayo y la escena.

## Cómo está organizada esta documentación

La documentación se estructura en doce secciones que siguen el ciclo de vida del proyecto, desde su presentación hasta la entrega y transferencia:

| # | Sección | Qué responde |
| --- | --- | --- |
| 1 | Presentación del sistema | Qué es, para quién y qué componentes lo integran. |
| 2 | Arquitectura general | Cómo fluye el dato desde el cuerpo hasta la imagen y el sonido. |
| 3 | Preparación del entorno | Cómo instalar y configurar todo el software necesario. |
| 4 | Captura corporal | Cómo funciona la captura con Kinect u Orbbec. |
| 5 | Arduino e interfaces físicas | Cómo construir y leer los sensores físicos. |
| 6 | Comunicación hardware–software | Cómo viaja el dato por Serial, MIDI y OSC. |
| 7 | Visuales generativos | Cómo convertir datos en comportamiento visual. |
| 8 | Integración sonora | Cómo controlar Ableton Live desde el cuerpo y los sensores. |
| 9 | Prototipos integrados | Ejemplos completos que combinan los sistemas. |
| 10 | Pruebas y validación | Cómo verificar que el sistema funciona y es estable. |
| 11 | Operación y mantenimiento | Cómo montar, encender, apagar y conservar el sistema. |
| 12 | Entrega y transferencia | Qué se entrega y cómo se transfiere al equipo docente. |

## Relación con Google Classroom

Este sitio es la **fuente técnica** del proyecto. El proceso de aprendizaje se organiza en la clase de Google Classroom **«Cuerpo, sensor, escena»**, donde cada actividad enlaza a la página técnica necesaria para realizarla.

| Espacio | Función |
| --- | --- |
| **MkDocs** (este sitio) | Documentación técnica: instalación, conexión, calibración, pruebas y mantenimiento. |
| **Google Classroom** | Proceso de aprendizaje: contenidos, instrucciones, actividades, entregas, rúbricas y seguimiento. |

## Roles

- La **implementación y documentación técnica** está a cargo del ingeniero electrónico.
- El **diseño pedagógico** está a cargo del equipo docente, con apoyo técnico del ingeniero en los ejercicios y prototipos.

## Repositorio

El código, los presets, los diagramas y los ejemplos se alojan en el repositorio:

- [github.com/joseurgilesc/Cuerpo-sensor-y-escena](https://github.com/joseurgilesc/Cuerpo-sensor-y-escena)

!!! info "Público y contextos de uso"
    El sistema está pensado para estudiantes y docentes de artes escénicas y musicales que trabajan con interacción en tiempo real, y se adapta a tres contextos: **aula** (laboratorio), **ensayo** y **escena**.
