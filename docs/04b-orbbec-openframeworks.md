# 4B. Captura de profundidad: Orbbec + openFrameworks

Esta sección documenta una **ruta avanzada de captura corporal y espacial** mediante cámaras de profundidad Orbbec y openFrameworks.

La propuesta pedagógica del proyecto mantiene una progresión gradual:

```
webcam + ml5.js
      ↓
comprender coordenadas, gesto y mapeo
      ↓
Orbbec + profundidad 3D
      ↓
openFrameworks + C++
      ↓
prototipos escénicos de mayor complejidad
```

!!! info "Por qué Orbbec aparece después de webcam + ml5.js"
    La cámara web permite comprender primero la lógica básica de **captura → dato → mapeo → respuesta** con una barrera técnica baja. Orbbec añade profundidad real, flujos RGB-D, configuración del SDK, bibliotecas nativas y compilación en C++; por eso se plantea como una segunda etapa.

---

## 4B.1. ¿Qué aporta una cámara Orbbec?

Una cámara RGB-D combina imagen convencional con información de profundidad. En lugar de trabajar únicamente con coordenadas X/Y, cada punto puede incorporar una distancia respecto a la cámara.

```
cuerpo
  ↓
cámara RGB-D
  ↓
color + profundidad
  ↓
coordenadas / distancias / nube de puntos
  ↓
openFrameworks
  ↓
imagen + sonido + espacio escénico
```

Esto permite explorar:

- distancia real del intérprete a la cámara;
- zonas de presencia;
- segmentación por profundidad;
- volumen espacial;
- nubes de puntos;
- interacción con objetos y superficies;
- relaciones cuerpo–espacio más precisas que con una webcam convencional.

---

## 4B.2. Antes de instalar: identificar modelo, firmware y SDK

No todas las cámaras Orbbec utilizan exactamente el mismo protocolo.

Antes de instalar software:

1. Identifica el **modelo exacto** de la cámara.
2. Revisa la **versión de firmware**.
3. Verifica si el dispositivo está soportado por **Orbbec SDK v2**.
4. Si es un modelo heredado, revisa si requiere Orbbec SDK v1 / OpenNI.

Orbbec recomienda **SDK v2 para nuevos desarrollos** cuando el dispositivo esté soportado.

Referencias oficiales:

- [Orbbec SDK v2 — documentación](https://orbbec.github.io/OrbbecSDK_v2/)
- [Lista de dispositivos compatibles](https://orbbec.github.io/OrbbecSDK_v2/)
- [Descargas del SDK](https://www.orbbec.com/developers/orbbec-sdk/)
- [Repositorio oficial OrbbecSDK v2](https://github.com/orbbec/OrbbecSDK_v2)

!!! warning "No mezclar SDK sin verificar"
    Algunos dispositivos y firmwares antiguos usan protocolos distintos. Si la cámara no aparece en la lista de soporte de SDK v2, no conviene forzar la instalación: primero debe verificarse la ruta correspondiente al modelo.

---

## 4B.3. Requisitos recomendados

Para trabajo de aula y prototipado:

| Componente | Recomendación |
| --- | --- |
| Sistema operativo | Windows 10/11 o Ubuntu 20.04+ |
| CPU | 4 núcleos o más |
| RAM | 8 GB mínimo; 16 GB recomendado |
| USB | USB 3.0 |
| GPU | No obligatoria para captura básica; útil para visuales complejos |
| Compilador | Visual Studio en Windows / GCC-Clang en Linux/macOS |
| openFrameworks | Versión estable compatible con el compilador |
| SDK | Orbbec SDK v2 si el modelo lo soporta |

---

# 4B.4. Paso 1 — instalar Orbbec SDK y comprobar la cámara

## Windows

La ruta más simple es utilizar el instalador oficial.

1. Descarga el instalador **OrbbecSDK v2 para Windows**.
2. Ejecuta el archivo `.exe`.
3. Completa la instalación.
4. Conecta la cámara por USB 3.0.
5. Abre **Orbbec Viewer**.
6. Comprueba:
   - imagen de color;
   - profundidad;
   - resolución;
   - estabilidad del flujo.

En Windows, la documentación oficial indica además que debe configurarse el registro de **metadata/timestamps** cuando corresponda.

## Linux

Si utilizas el paquete `.deb`:

```bash
sudo dpkg -i OrbbecSDK_v2.x.x_amd64.deb
```

Si trabajas desde el SDK descomprimido o desde código fuente, instala las reglas `udev`:

```bash
cd OrbbecSDK_v2/scripts/env_setup
sudo chmod +x ./install_udev_rules.sh
sudo ./install_udev_rules.sh
sudo udevadm control --reload
sudo udevadm trigger
```

!!! success "No continuar hasta aquí"
    Antes de abrir openFrameworks, la cámara debe funcionar correctamente en **Orbbec Viewer**. Si el Viewer no recibe profundidad, el problema todavía no pertenece a openFrameworks.

---

## 4B.5. Paso 2 — probar los ejemplos oficiales de Orbbec

El SDK incluye ejemplos en C/C++.

Empieza por:

1. **quick_start**
2. **enumerate**
3. **depth**
4. **color**
5. **multi_streams**
6. **point_cloud**

Una estructura típica del SDK v2 utiliza un `Pipeline`:

```cpp
ob::Pipeline pipe;
pipe.start();

while(true) {
    auto frameSet = pipe.waitForFrameset();
    if(!frameSet) continue;

    // aquí se procesan color, profundidad, etc.
}

pipe.stop();
```

Para profundidad:

```cpp
auto depthFrameRaw = frameSet->getFrame(OB_FRAME_DEPTH);

if(depthFrameRaw) {
    auto depthFrame = depthFrameRaw->as<ob::DepthFrame>();

    uint32_t width  = depthFrame->getWidth();
    uint32_t height = depthFrame->getHeight();

    float scale = depthFrame->getValueScale();

    const uint16_t* data =
        reinterpret_cast<const uint16_t*>(depthFrame->getData());

    float centerDistance =
        data[width * height / 2 + width / 2] * scale;
}
```

El valor de profundidad se expresa normalmente como una distancia física tras aplicar la escala proporcionada por el frame.

Referencia:

- [Ejemplos oficiales Orbbec SDK v2](https://orbbec.github.io/OrbbecSDK_v2/examples/)

---

# 4B.6. Paso 3 — instalar openFrameworks

openFrameworks es un toolkit C++ para creative coding.

Sitio oficial:

- [Descarga de openFrameworks](https://openframeworks.cc/download/)
- [Guía de instalación](https://openframeworks.cc/learning/)
- [Crear un proyecto](https://openframeworks.cc/learning/01_basics/create_a_new_project/)

## Windows + Visual Studio

1. Instala Visual Studio.
2. Incluye las herramientas de desarrollo **C++ Desktop**.
3. Descarga la versión de openFrameworks para Visual Studio.
4. Descomprime la carpeta completa.
5. No cambies su estructura interna.
6. Abre primero un ejemplo incluido y compílalo.

Por ejemplo:

```
openFrameworks/
├── addons/
├── apps/
├── examples/
├── libs/
└── projectGenerator/
```

!!! tip "Regla práctica"
    Si un ejemplo oficial de openFrameworks no compila, todavía no conviene integrar Orbbec. Primero debe funcionar openFrameworks por sí solo.

---

## 4B.7. Paso 4 — crear un proyecto openFrameworks

Utiliza **Project Generator**.

Ruta recomendada:

```
openFrameworks/
└── apps/
    └── CuerpoSensorEscena/
        └── orbbecDepth/
```

Estructura básica:

```
orbbecDepth/
├── src/
│   ├── main.cpp
│   ├── ofApp.cpp
│   └── ofApp.h
├── bin/
└── orbbecDepth.sln
```

La lógica de openFrameworks se organiza normalmente en:

```cpp
void ofApp::setup() {
    // inicialización
}

void ofApp::update() {
    // lectura de frames y actualización de datos
}

void ofApp::draw() {
    // dibujo de imagen, profundidad o visuales
}
```

---

# 4B.8. Paso 5 — integrar Orbbec SDK dentro de openFrameworks

Para una integración estable conviene pensar en cuatro elementos:

```
headers
  +
libraries
  +
runtime DLL / shared libraries
  +
código C++
```

## A. Headers

El proyecto debe conocer la carpeta de cabeceras del SDK.

Ejemplo conceptual:

```
OrbbecSDK/
└── include/
```

## B. Librerías

El linker debe conocer la biblioteca Orbbec correspondiente a la plataforma.

En Windows será normalmente una biblioteca `.lib` asociada a las DLL del SDK.

En Linux se enlaza con la biblioteca compartida correspondiente.

## C. Librerías de ejecución

En Windows, las DLL requeridas deben quedar accesibles al ejecutable.

Una estrategia habitual durante el prototipado es copiarlas a:

```
bin/
```

del proyecto openFrameworks.

## D. Dependencias adicionales

Dependiendo del ejemplo o procesamiento:

- Orbbec SDK;
- OpenCV / `ofxOpenCv` si se requiere procesamiento de imagen;
- GLM, ya incluido en openFrameworks para trabajo vectorial;
- OSC si se decide enviar datos a otra aplicación.

!!! note "Integración por etapas"
    No intentes incluir profundidad, color, nube de puntos, seguimiento corporal y OSC al mismo tiempo. La secuencia recomendada es:

```
1. abrir cámara
2. recibir depth
3. visualizar depth
4. leer una distancia
5. mapear distancia a un parámetro
6. añadir color
7. añadir nube de puntos
8. integrar interacción artística
```

---

# 4B.9. Primer ejercicio: profundidad → círculo

Objetivo:

> Utilizar la distancia de una persona a la cámara para modificar el tamaño de un círculo.

```
distancia Orbbec
      ↓
normalización
      ↓
escala
      ↓
círculo
```

Pseudocódigo:

```cpp
float distancia = leerProfundidadCentro();

float valor = ofMap(
    distancia,
    distanciaMin,
    distanciaMax,
    1.0,
    0.0,
    true
);

float radio = ofMap(valor, 0.0, 1.0, 30, 300);
```

En `draw()`:

```cpp
ofDrawCircle(
    ofGetWidth() / 2,
    ofGetHeight() / 2,
    radio
);
```

### Para reflexionar

- ¿Qué ocurre cuando el intérprete se acerca?
- ¿Qué ocurre cuando se aleja?
- ¿Conviene invertir la relación?
- ¿La distancia debe controlar tamaño, brillo, sonido o varios parámetros?

---

# 4B.10. Segundo ejercicio: zonas de profundidad

El espacio puede dividirse en zonas:

```
0.5–1.0 m → zona cercana
1.0–2.0 m → zona media
2.0–3.5 m → zona lejana
```

Ejemplo:

```cpp
if(distancia < 1000) {
    // respuesta A
}
else if(distancia < 2000) {
    // respuesta B
}
else {
    // respuesta C
}
```

Aplicaciones escénicas:

- cambiar color;
- modificar densidad de partículas;
- activar capas sonoras;
- cambiar una escena;
- abrir/cerrar un filtro;
- controlar intensidad o reverberación.

---

# 4B.11. Tercer ejercicio: imagen de profundidad como textura

Una imagen de profundidad puede transformarse en una textura visual.

Principio:

```
pixel de profundidad
      ↓
distancia
      ↓
normalización 0–1
      ↓
brillo / color / desplazamiento
```

Esto permite crear:

- siluetas;
- máscaras;
- relieves;
- desplazamientos;
- campos de partículas;
- efectos de feedback;
- visuales que reaccionan al volumen corporal.

---

# 4B.12. Nube de puntos

Una de las ventajas de una cámara RGB-D es generar una representación 3D.

```
depth + calibración
      ↓
coordenadas X,Y,Z
      ↓
point cloud
      ↓
ofMesh / OpenGL
```

El SDK oficial incluye un ejemplo de **point cloud** que conviene probar antes de reimplementarlo dentro de openFrameworks.

En openFrameworks, una nube de puntos puede representarse con un `ofMesh`:

```cpp
ofMesh mesh;
mesh.setMode(OF_PRIMITIVE_POINTS);
```

Cada punto 3D se agrega como vértice.

Posibles transformaciones artísticas:

- dispersión;
- ruido Perlin;
- rotación;
- atracción/repulsión;
- deformación según sonido;
- persistencia temporal;
- múltiples capas del cuerpo.

---

# 4B.13. De Orbbec a sonido

La profundidad también puede convertirse en control sonoro.

```
distancia
  ↓
normalización
  ↓
OSC / MIDI / parámetro
  ↓
sonido
```

Por ejemplo:

| Gesto / dato | Parámetro sonoro |
| --- | --- |
| acercarse | aumentar brillo del sonido |
| alejarse | cerrar filtro |
| entrar en zona cercana | disparar evento |
| desplazarse lateralmente | paneo |
| altura del cuerpo | frecuencia |
| velocidad | densidad rítmica |

Si el sonido corre en otra aplicación, openFrameworks puede transmitir datos mediante OSC.

Referencia de openFrameworks:

- [Network / OSC en openFrameworks](https://openframeworks.cc/learning/)

---

# 4B.14. Ruta recomendada de aprendizaje

## Nivel 1 — verificar hardware

- Orbbec Viewer.
- Color.
- Depth.
- Distancia al centro.

## Nivel 2 — comprender el SDK

- Quick Start.
- Depth.
- Multi-stream.
- Point cloud.

## Nivel 3 — openFrameworks

- Compilar un ejemplo estándar.
- Crear proyecto.
- Dibujar formas.
- Incorporar datos de profundidad.

## Nivel 4 — interacción

- Distancia → escala.
- Posición → color.
- Zonas → eventos.
- Profundidad → partículas.

## Nivel 5 — escena

- nube de puntos;
- visuales;
- OSC;
- sonido;
- calibración escénica;
- pruebas de iluminación y distancia.

---

# 4B.15. Pruebas mínimas antes de usar en aula o escena

| Prueba | Resultado esperado |
| --- | --- |
| Orbbec Viewer reconoce dispositivo | Sí |
| Stream de profundidad estable | Sí |
| Stream de color estable | Sí |
| Ejemplo oficial `depth` ejecuta | Sí |
| Proyecto openFrameworks básico compila | Sí |
| SDK enlaza sin errores | Sí |
| DLL / shared libraries disponibles | Sí |
| Lectura de distancia coherente | Sí |
| Visual responde sin congelamientos | Sí |

---

# 4B.16. Problemas frecuentes

## La cámara no aparece

Revisar:

- cable;
- USB 3.0;
- alimentación;
- modelo y firmware;
- compatibilidad con SDK v1/v2;
- Orbbec Viewer.

## El Viewer funciona pero openFrameworks no compila

El problema suele estar en:

- headers no encontrados;
- biblioteca no enlazada;
- arquitectura x64/x86 incompatible;
- rutas incorrectas;
- configuración del compilador.

## Compila pero no inicia

Revisar DLL o bibliotecas compartidas requeridas por Orbbec SDK.

## Profundidad = 0

Un valor 0 puede indicar:

- objeto fuera del rango;
- superficie problemática;
- ausencia de lectura válida;
- configuración incorrecta.

## Depth y color no coinciden

Para superponer color y profundidad se debe revisar la alineación **D2C (Depth-to-Color)** y los parámetros de calibración.

Orbbec SDK incluye ejemplos específicos para alineación y transformación de coordenadas.

---

# 4B.17. Documentación y referencias

## Orbbec

- [Orbbec SDK v2](https://orbbec.github.io/OrbbecSDK_v2/)
- [Guía de instalación y desarrollo](https://orbbec.github.io/OrbbecSDK_v2/docs/tutorial/installation_and_development_guide.html)
- [Ejemplos oficiales](https://orbbec.github.io/OrbbecSDK_v2/examples/)
- [C++ API User Guide](https://orbbec.github.io/docs/OrbbecSDKv2_API_User_Guide/)
- [Descargas oficiales](https://www.orbbec.com/developers/orbbec-sdk/)
- [GitHub oficial de Orbbec](https://github.com/orbbec)

## openFrameworks

- [openFrameworks](https://openframeworks.cc/)
- [Descargas](https://openframeworks.cc/download/)
- [Visual Studio Setup](https://openframeworks.cc/setup/vs/)
- [Crear un nuevo proyecto](https://openframeworks.cc/learning/01_basics/create_a_new_project/)
- [Añadir addons](https://openframeworks.cc/learning/01_basics/how_to_add_addon_to_project/)

## Repositorio de desarrollo del proyecto

- [Danza-Interactiva-Orbecc](https://github.com/joseurgilesc/Danza-Interactiva-Orbecc)

!!! warning "Estado del repositorio Danza-Interactiva-Orbecc"
    Al momento de actualizar esta documentación, GitHub expone este repositorio sin archivos ni commits accesibles. Por ello, esta página se apoya en la arquitectura del proyecto «Cuerpo, sensor y escena» y en documentación oficial de Orbbec y openFrameworks. Cuando el código de pruebas de Orbbec esté publicado en el repositorio, conviene enlazar aquí sus ejemplos, versiones y configuraciones exactas.

---

# 4B.18. Resultado esperado de esta etapa

Al finalizar esta sección se debería poder:

- instalar y verificar una cámara Orbbec;
- ejecutar ejemplos oficiales del SDK;
- instalar y compilar openFrameworks;
- enlazar el SDK de Orbbec con un proyecto C++;
- leer profundidad;
- mapear distancia a parámetros visuales;
- utilizar profundidad para una interacción artística;
- preparar la base para nube de puntos, OSC y prototipos escénicos.

La meta no es solamente obtener una imagen de profundidad, sino transformar el espacio físico en un **material expresivo y programable**.
