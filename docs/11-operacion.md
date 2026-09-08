# 11. Operación y mantenimiento

## 11.1. Guía rápida de montaje

1. Ubica la cámara en su soporte, apuntando al área de actuación.
2. Coloca los sensores en sus posiciones y conéctalos a Arduino.
3. Conecta cámara y Arduino al computador.
4. Conecta proyector e interfaz de audio.
5. Abre los programas en orden (ver [11.3](#113-encendido-seguro-del-sistema)).

## 11.2. Lista de verificación antes de una sesión

- [ ] Cámara conectada y reconocida.
- [ ] Arduino conectado y con el firmware correcto.
- [ ] Área de actuación despejada y bien iluminada.
- [ ] Calibración cargada (o recalibrar si cambió el espacio).
- [ ] Ableton Live y visuales abiertos y comunicados.
- [ ] Proyector e interfaz de audio funcionando.

## 11.3. Encendido seguro del sistema

Enciende los dispositivos en este orden:

1. Computador.
2. Cámara (con su fuente, si aplica).
3. Arduino.
4. Proyector y sistema de audio.
5. Programas de software (captura → visuales → Ableton).

## 11.4. Calibración previa al uso

- Verifica que los límites del espacio siguen siendo válidos.
- Si se movió la cámara o cambió la luz, **recalibra**.
- Confirma que los sensores responden en su rango completo.

## 11.5. Apagado seguro

1. Cierra los programas de software.
2. Apaga el sistema de audio y el proyector.
3. Desconecta Arduino y cámara.
4. Apaga el computador.

!!! warning "Apagar en orden"
    Cerrar el software **antes** de desconectar el hardware evita corromper archivos y deja el sistema listo para la siguiente sesión.

## 11.6. Desmontaje y almacenamiento

- Desconecta todos los cables y guárdalos sin dobleces.
- Guarda sensores y componentes en contenedores identificados.
- Protege la cámara del polvo y los golpes.
- Almacena todo en un lugar seco y seguro.

## 11.7. Mantenimiento preventivo

| Tarea | Frecuencia |
| --- | --- |
| Limpiar lente y sensores | Semanal |
| Revisar cables y conexiones | Antes de cada sesión |
| Verificar firmware y software | Mensual |
| Respaldo de presets y proyectos | Mensual |
| Limpieza de polvo de los equipos | Mensual |

## 11.8. Recuperación ante fallos

| Fallo | Acción |
| --- | --- |
| La cámara no responde | Reiniciar driver, cambiar cable/puerto |
| Arduino no se comunica | Verificar puerto, recargar firmware |
| Audio con cortes | Subir buffer, revisar interfaz |
| Visuales congelados | Reiniciar aplicación de visuales |
| Fallo general en escena | Usar preset de respaldo o respaldo simple |

Mantén siempre un **plan B**: un preset simple que funcione aunque falle parte del sistema.

## 11.9. Copias de seguridad y restauración

- Respalda el repositorio (código, presets, proyectos) en Git.
- Exporta copias de los racks y sesiones de Ableton.
- Guarda las configuraciones de calibración.
- Documenta el procedimiento de restauración.

## 11.10. Recomendaciones para futuras cohortes

- Documentar cada ajuste en el [registro de errores](10-pruebas.md#1010-registro-de-errores-y-correcciones).
- Mantener una **sesión base** de Ableton y presets visuales como punto de partida.
- Formar a un responsable del montaje por grupo.
- Revisar esta documentación al inicio de cada período.
