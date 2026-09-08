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
