# 10. Pruebas y validación

## 10.1. Plan general de pruebas

El sistema se valida de forma progresiva, de lo simple a lo complejo:

1. Conectividad.
2. Calibración.
3. Latencia.
4. Estabilidad.
5. Uso prolongado.
6. Aula y laboratorio.
7. Condiciones escénicas.

Cada prueba registra: **qué se probó, cómo, qué se observó y qué se corrigió**.

## 10.2. Pruebas de conectividad

Verificar que cada enlace de la cadena funciona:

- Cámara → aplicación de captura.
- Arduino → computador (Serial).
- Computador → visuales (OSC).
- Computador → Tone.js (Web Audio).

## 10.3. Pruebas de calibración

- El espacio escénico responde a los límites marcados.
- Los sensores cubren su rango completo sin saturación.
- Los valores normalizados llegan a 0 y a 1 en los extremos.

## 10.4. Pruebas de latencia

- Mide el tiempo entre la acción y la respuesta perceptible.
- Objetivo: latencia **imperceptible** para el intérprete.
- Ajusta buffer de audio, resolución y frecuencia de envío.

## 10.5. Pruebas de estabilidad

- El sistema funciona de forma continua sin caídas.
- No hay desconexiones ni congelamientos.
- El uso de CPU y memoria se mantiene estable.

## 10.6. Pruebas de uso prolongado

- Sesión continua de larga duración (por ejemplo, 1–2 horas).
- Observa si aparecen degradaciones, calentamiento o pérdida de seguimiento.

## 10.7. Pruebas en aula y laboratorio

- El sistema se monta y opera siguiendo la documentación.
- Un usuario sin experiencia puede seguir los pasos.
- Los estudiantes logran completar los prototipos.

## 10.8. Pruebas en condiciones escénicas

- Iluminación escénica real (que puede confundir la cámara).
- Ruido y condiciones del espacio de presentación.
- Montaje y desmontaje en tiempo limitado.

## 10.9. Matriz de dispositivos y software

| Dispositivo / Software | Resultado | Evidencia / notas |
| --- | --- | --- |
| Webcam + ml5.js | Aprobado | BodyPose/HandPose, móvil, visuales y audio probados. |
| Orbbec RGB-D | Aprobado | Color + depth alineado D2C; profundidad real usada en joints y silueta. |
| MediaPipe PoseLandmarker | Aprobado | 33 landmarks procesados en servidor TCP local. |
| openFrameworks | Aprobado | SceneEngine, UI, mappings, OSC, MIDI y escenas 2D/3D operativas. |
| DepthStore | Aprobado | Grid 96×54, EMA temporal, threshold ajustable y contorno ordenado. |
| Makey Makey | Aprobado | Múltiples ejemplos interactivos y uso con teclado/Makey Makey. |
| Arduino | En desarrollo | Pendientes diagramas, firmware definitivo y validación física completa. |
| p5.js | Aprobado | Ejemplos generativos publicados. |
| Tone.js | Aprobado | Prototipos sonoros y audiovisuales funcionales. |

## 10.10. Registro de errores y correcciones

Mantén un **registro** con cada error: descripción, causa, corrección y fecha. Este registro alimenta las secciones de «Problemas frecuentes» de toda la documentación.

## 10.11. Criterios de aceptación del sistema

El sistema se considera aceptado cuando:

- [ ] Todos los prototipos integrados funcionan de forma reproducible.
- [ ] La latencia es imperceptible.
- [ ] El sistema es estable en uso prolongado.
- [ ] Un usuario puede montarlo y operarlo con la documentación.
- [ ] El material de entrega está completo (ver [sección 12](13-entrega.md)).

## 10.12. Evidencias de funcionamiento

- Videos cortos de cada prototipo.
- Capturas del estado calibrado.
- Registro de pruebas y resultados.
- Fotografías del montaje.

<!-- TODO: enlazar las evidencias cuando se publiquen -->


## 10.13. Registro resumido de validación Orbbec

El repositorio de desarrollo documenta iteraciones verificables:

- **15/10/2026**: integración Orbbec + D2C + MediaPipe + 18 joints con Z real.
- **20/10/2026**: silueta real del cuerpo mediante depth y nuevas escenas.
- **24/10/2026**: threshold de silueta ajustable.
- **27/10/2026**: feedback visual del threshold.
- **30/10/2026**: contorno corporal ordenado por ángulo.
- **04/11/2026**: persistencia del threshold entre sesiones.
- **09/11/2026**: pulido visual y estabilización.

Repositorio: [Danza-Interactiva-Orbecc](https://github.com/joseurgilesc/Danza-Interactiva-Orbecc)
