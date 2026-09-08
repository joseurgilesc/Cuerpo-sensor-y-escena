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
- Computador → Ableton (MIDI/OSC).

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

<!-- TODO: completar con los resultados de las pruebas -->

| Dispositivo / Software | Versión | Resultado | Notas |
| --- | --- | --- | --- |
| Kinect / Orbbec | <!-- TODO --> | <!-- TODO --> | |
| Arduino | <!-- TODO --> | <!-- TODO --> | |
| openFrameworks | <!-- TODO --> | <!-- TODO --> | |
| p5.js | <!-- TODO --> | <!-- TODO --> | |
| Ableton Live | <!-- TODO --> | <!-- TODO --> | |

## 10.10. Registro de errores y correcciones

Mantén un **registro** con cada error: descripción, causa, corrección y fecha. Este registro alimenta las secciones de «Problemas frecuentes» de toda la documentación.

## 10.11. Criterios de aceptación del sistema

El sistema se considera aceptado cuando:

- [ ] Todos los prototipos integrados funcionan de forma reproducible.
- [ ] La latencia es imperceptible.
- [ ] El sistema es estable en uso prolongado.
- [ ] Un usuario puede montarlo y operarlo con la documentación.
- [ ] El material de entrega está completo (ver [sección 12](12-entrega.md)).

## 10.12. Evidencias de funcionamiento

- Videos cortos de cada prototipo.
- Capturas del estado calibrado.
- Registro de pruebas y resultados.
- Fotografías del montaje.

<!-- TODO: enlazar las evidencias cuando se publiquen -->
