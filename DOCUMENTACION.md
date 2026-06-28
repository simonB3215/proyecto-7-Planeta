# 🌍 EarthPulse 3D — Documentación Técnica

**EarthPulse 3D** es un dashboard de monitoreo planetario en tiempo real que visualiza
eventos naturales (terremotos, incendios, volcanes, tormentas y eventos extremos) sobre
un globo terráqueo 3D interactivo, con estética "cyber-scientific" tipo centro de comando
satelital.

---

## 📑 Índice

1. [Stack tecnológico](#-stack-tecnológico)
2. [Arquitectura general](#-arquitectura-general)
3. [Estructura de carpetas](#-estructura-de-carpetas)
4. [Fuentes de datos (APIs)](#-fuentes-de-datos-apis)
5. [Gestión de estado (Zustand)](#-gestión-de-estado-zustand)
6. [Sistema de marcadores y paleta neón](#-sistema-de-marcadores-y-paleta-neón)
7. [Tutorial interactivo (Spotlight)](#-tutorial-interactivo-spotlight)
8. [Referencia de componentes](#-referencia-de-componentes)
9. [Matemática de coordenadas](#-matemática-de-coordenadas)
10. [Sistema de diseño (Glassmorphism)](#-sistema-de-diseño-glassmorphism)
11. [Puesta en marcha](#-puesta-en-marcha)
12. [Notas de rendimiento y resiliencia](#-notas-de-rendimiento-y-resiliencia)

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | **React 19** + **Vite 8** |
| Renderizado 3D | **Three.js** + **React Three Fiber (R3F)** + **Drei** |
| Post-procesamiento | **@react-three/postprocessing** (Bloom selectivo) |
| Animación UI | **Framer Motion** |
| Notificaciones | **react-hot-toast** (toasts custom) + **lucide-react** (iconos SVG) |
| Estilos | **TailwindCSS 4** (plugin oficial de Vite) |
| Estado | **Zustand 5** (con middleware `persist`) |
| Geoespacial | **d3-geo** (`geoContains` para detección país/punto) |

---

## 🏛 Arquitectura general

La app sigue una arquitectura de **capas superpuestas (z-index)**:

```
┌─────────────────────────────────────────────┐
│  z-50  TutorialSpotlight (overlay onboarding) │
│  z-40  Timeline (línea de tiempo)             │
│  z-30  Controles globales + HelpButton        │
│  z-20  Sidebar / CountryPanel (paneles)       │
│  z-10  Header + capa UI (pointer-events-none) │
│  z-0   Grid overlay decorativo                │
│ -z-10  Canvas 3D fijo (Globo, marcadores...)  │
└─────────────────────────────────────────────┘
```

El `<Canvas>` usa `fixed inset-0 w-full h-full -z-10` para ocupar todo el viewport sin
generar scrollbars y quedar detrás de la UI. La cámara fija `near={0.1}` / `far={1000}`
para evitar cortes (clipping) de la Tierra o los marcadores al hacer zoom.

- La **capa UI** usa `pointer-events-none` por defecto y reactiva los eventos
  (`pointer-events-auto`) solo en los elementos interactivos, de modo que los clics
  "atraviesan" la UI y llegan al globo 3D cuando corresponde.
- **Dos stores Zustand independientes**: uno para **datos** (`useStore`) y otro para
  **UI/UX** (`useAppStore`). Esta separación evita re-renders cruzados y mantiene la
  persistencia (localStorage) acotada al estado de interfaz.

### Flujo de datos

```
apiServices.fetchAllData()  ──►  useStore (datos)  ──►  Markers / Sidebar / CountryPanel
        ▲                                                        │
        └──── setInterval cada 5 min ◄───── App.useEffect        ▼
                                                        Globe (Canvas R3F)
```

---

## 📁 Estructura de carpetas

```
src/
├── App.jsx                  # Layout raíz: capas, header, sidebar, controles
├── main.jsx                 # Punto de entrada React
├── index.css                # Tailwind + utilidades glass-panel / glass-card
│
├── components/
│   ├── Globe.jsx            # Esfera Tierra, luz solar real, nubes, atmósfera, hover país
│   ├── Markers.jsx          # Clustering por proximidad + render de marcadores
│   ├── EventMarker.jsx      # Marcador 3D individual (materiales neón + onda sísmica)
│   ├── CameraController.jsx # Vuelo suave de cámara al seleccionar un evento
│   ├── CountryBorders.jsx   # Fronteras del mundo (lineSegments desde GeoJSON)
│   ├── CountryPanel.jsx     # Panel de eventos filtrados por país seleccionado
│   ├── Sidebar.jsx          # Tarjeta de detalle del evento seleccionado
│   ├── Timeline.jsx         # Línea de tiempo / reproducción temporal (30 días)
│   ├── CategoryFilters.jsx  # Chips de filtrado por categoría (paleta neón)
│   ├── TutorialSpotlight.jsx# Onboarding con efecto spotlight + HelpButton
│   └── Notifications.jsx    # Toaster global (react-hot-toast) z-[100]
│
├── store/
│   ├── useStore.js          # Estado de DATOS (eventos, selección, modos de vista)
│   └── useAppStore.js       # Estado de UI (tutorial + filtros, persistido)
│
├── services/
│   └── apiServices.js       # Fetch de USGS, NASA EONET y NASA FIRMS (con fallbacks)
│
└── utils/
    ├── geoToVector3.js      # Conversión lat/lng → Vector3 sobre la esfera
    ├── palette.js           # Paleta "Cyber-Scientific" (fuente única de verdad)
    └── notify.jsx           # Helper de alertas: notify.error/warning/info/success
```

---

## 🌐 Fuentes de datos (APIs)

Definidas en [`src/services/apiServices.js`](src/services/apiServices.js). Todas las
llamadas usan `Promise.allSettled` y **tienen datos de respaldo (fallback)** para que la
app nunca quede vacía si una API falla o hay bloqueo CORS.

| Fuente | Endpoint | Datos | Fallback |
|--------|----------|-------|----------|
| **USGS** | `earthquake.usgs.gov/.../all_day.geojson` | Terremotos (24 h) | — |
| **NASA EONET** | `eonet.gsfc.nasa.gov/api/v3/events` | Volcanes, tormentas, eventos extremos | Tormentas simuladas |
| **NASA FIRMS** | `/api/firms/...MODIS_C6_1_Global_24h.csv` | Anomalías térmicas / incendios | ~22 focos simulados |

> ⚠️ **Proxy de FIRMS**: NASA FIRMS no permite CORS desde el navegador. [`vite.config.js`](vite.config.js)
> define un proxy `/api/firms → https://firms.modaps.eosdis.nasa.gov` para sortearlo en
> desarrollo. En producción se necesita un proxy equivalente (o el fallback se activa).

Los datos se refrescan automáticamente cada **5 minutos** (`App.jsx` → `useEffect`).

---

## 🗃 Gestión de estado (Zustand)

### `useStore.js` — Estado de datos

| Campo | Descripción |
|-------|-------------|
| `earthquakes`, `eonetEvents`, `firmsFires` | Arrays crudos de cada API |
| `isLoading`, `error` | Estado de carga / error |
| `selectedEvent` | Evento actualmente seleccionado (dispara vuelo de cámara) |
| `selectedCountry` | País seleccionado (abre `CountryPanel`) |
| `targetLocation` | Coordenada objetivo para la cámara |
| `isRotating` | Auto-rotación del globo |
| `lightingMode` | `'full'` (iluminación total) \| `'realtime'` (sol real UTC) |
| `radarMode` | Pulso sincronizado de todos los marcadores |
| `timelineDate`, `isPlaying` | Control de la línea de tiempo |
| `searchQuery` | Búsqueda de texto en el sidebar |
| `geoJsonData` | GeoJSON de fronteras (para `geoContains`) |

### `useAppStore.js` — Estado de UI (persistido)

Usa `persist` con clave **`earthpulse-ui`**. Solo persiste `hasSeenTutorial` y `filters`
(vía `partialize`); el paso actual del tutorial es efímero.

| Campo / acción | Descripción |
|----------------|-------------|
| `hasSeenTutorial` | (persistido) Si el usuario ya completó/omitió el onboarding |
| `isTutorialOpen`, `tutorialStep` | Estado efímero del tutorial |
| `startTutorial / nextStep / prevStep / skipTutorial` | Control del flujo |
| `filters` | (persistido) `{ Fire, Volcano, Storm, Earthquake, Extreme }` → bool |
| `toggleFilter(type)` | Alterna visibilidad de una categoría en el globo |
| `TUTORIAL_STEPS` | Definición de los 4 pasos (título, cuerpo, `target`) |

---

## ✨ Sistema de marcadores y paleta neón

### Paleta "Cyber-Scientific" — [`src/utils/palette.js`](src/utils/palette.js)

Fuente única de verdad reutilizada por marcadores 3D, chips de filtro y tooltips:

| Tipo | Color | Hex | Efecto especial |
|------|-------|-----|-----------------|
| 🔥 Incendios | Rojo Carmesí Neón | `#FF3366` | Parpadeo (flicker) |
| 🌋 Volcanes | Ámbar Brillante | `#FF9900` | Núcleo blanco incandescente |
| 🌪️ Tormentas | Cian Eléctrico | `#00E5FF` | Geometría translúcida |
| ⚡ Terremotos | Dorado Vibrante | `#FFD700` | Anillo sísmico expansivo |
| ☣️ Eventos Extremos | Magenta Profundo | `#B026FF` | — |

`eonetCategoryToType()` normaliza las categorías crudas de EONET
(`volcanoes`, `wildfires`, `severeStorms`, …) a estos tipos internos.

### Renderizado — [`EventMarker.jsx`](src/components/EventMarker.jsx)

- **Materiales emisivos** (`meshStandardMaterial` con `emissive` + `emissiveIntensity` alto
  y `toneMapped={false}`) para simular brillo neón/bloom.
- **Onda sísmica**: `ringGeometry` orientada tangente a la superficie (vía cuaternión
  `setFromUnitVectors`) que crece y se desvanece en bucle; la velocidad depende de la magnitud.
- **Flicker** de incendios mediante ruido pseudo-aleatorio de dos senoidales en `useFrame`.
- Las animaciones mutan **refs de materiales** dentro de `useFrame` (no disparan renders React).
- Componente `React.memo` + selectores Zustand derivados a booleano → mínimos re-renders.
- **Bloom selectivo**: el `<EffectComposer><Bloom/></EffectComposer>` (en [`App.jsx`](src/App.jsx))
  usa `luminanceThreshold={1}`. Como los marcadores llevan `toneMapped={false}` superan ese
  umbral y brillan; la textura de la Tierra (tone-mapped) queda por debajo y **no** hace bloom.

### Clustering — [`Markers.jsx`](src/components/Markers.jsx)

`clusterEvents()` agrupa por **proximidad geográfica** (radio de 8°) para no saturar el
globo. Un clúster con 1 evento se delega a `EventMarker`; con varios, se muestra una esfera
agregada cuyo tamaño crece con el conteo. Los **filtros de categoría** (`useAppStore`) se
aplican al render: `show(type)` oculta clústeres/marcadores de categorías desactivadas.

---

## 🎓 Tutorial interactivo (Spotlight)

[`TutorialSpotlight.jsx`](src/components/TutorialSpotlight.jsx) implementa onboarding con
**efecto hole-punch** sin dependencias externas (no usa `react-joyride`):

- **Fondo oscuro** a pantalla completa (`rgba(0,0,0,0.8)`).
- **Recorte (spotlight)** del elemento objetivo del paso mediante una **máscara SVG**
  (`<mask>`: rect blanco = oscuro, rect negro = transparente). La transición del recorte
  entre pasos se anima con `motion.rect` (spring de Framer Motion).
- **Borde luminoso cian** alrededor del área resaltada.
- **Diálogo glassmorphism siempre centrado** (Siguiente / Atrás / Omitir + progreso).
- `useTargetRect()`: hook que lee `getBoundingClientRect()` del target y se re-mide en
  `resize`/`scroll` (resiliente a cambios de layout).
- Auto-activación en la primera visita; `HelpButton` (?) para reiniciarlo cuando se quiera.

### Pasos y targets

| Paso | Target (`data-tutorial`) | Efecto |
|------|--------------------------|--------|
| 1. Bienvenida | `null` | Overlay completo, sin recorte |
| 2. Navegación | `canvas` (contenedor 3D) | Spotlight sobre el globo |
| 3. Filtros | `sidebar` (panel lateral) | Spotlight sobre el panel |
| 4. Detalles | `null` | Overlay completo |

Los targets se marcan con atributos `data-tutorial="..."` en [`App.jsx`](src/App.jsx).

---

## 🔔 Sistema de alertas (Toasts)

Gestionado con **react-hot-toast** (cola + posicionamiento) y render 100% custom. El
contenedor [`NotificationToaster`](src/components/Notifications.jsx) se monta una sola vez
en `App` con `z-[100]` y **no captura punteros** (solo las tarjetas), por lo que nunca
interrumpe la interacción con el globo 3D.

El helper [`notify`](src/utils/notify.jsx) expone cuatro estados, cada uno con su acento
neón, icono SVG de **lucide-react** y resplandor (`drop-shadow`). **Sin emojis** en toda la UI.

| Estado | Color | Icono (lucide) |
|--------|-------|----------------|
| `notify.error` | `#FF3366` Rojo Carmesí | `AlertCircle` |
| `notify.warning` | `#FF9900` Ámbar | `AlertTriangle` |
| `notify.info` | `#00E5FF` Cian | `Info` |
| `notify.success` | `#10B981` Esmeralda | `CheckCircle2` |

```js
notify.error('Sin datos sísmicos', {
  description: 'No se pudo conectar con el feed de terremotos de USGS.',
  source: 'USGS · HTTP 503',   // texto monoespaciado
});
```

Integrado en los `try/catch` de [`apiServices.js`](src/services/apiServices.js): error en
USGS, advertencias al usar respaldo de EONET/FIRMS, e info/éxito solo en la **primera**
sincronización (las recargas cada 5 min son silenciosas salvo error).

---

## 🧩 Referencia de componentes

| Componente | Responsabilidad |
|-----------|-----------------|
| [`App.jsx`](src/App.jsx) | Layout, capas z-index, header, sidebar de eventos activos, controles globales, montaje del tutorial y carga periódica de datos. |
| [`Globe.jsx`](src/components/Globe.jsx) | Esfera Tierra (texturas públicas de Three.js), **luz solar real** calculada por declinación/hora UTC, sprite de sol, halo atmosférico, estrellas, `OrbitControls`, hover de país (raycast UV → `geoContains`). |
| [`Markers.jsx`](src/components/Markers.jsx) | Clustering por proximidad, mapeo de tipos, aplicación de filtros, render de marcadores y clústeres. |
| [`EventMarker.jsx`](src/components/EventMarker.jsx) | Marcador neón individual con onda sísmica, flicker, núcleo de volcán y tooltip glass. |
| [`CameraController.jsx`](src/components/CameraController.jsx) | "Vuelo" suave (`lerp`) de la cámara hacia el evento seleccionado, respetando la rotación actual del globo; se cancela ante interacción manual. |
| [`CountryBorders.jsx`](src/components/CountryBorders.jsx) | Dibuja fronteras del mundo como `lineSegments` desde GeoJSON (memoizado). |
| [`CountryPanel.jsx`](src/components/CountryPanel.jsx) | Lista de eventos (sismos/incendios/tormentas) del país seleccionado, ordenados por fecha; incluye lógica especial de límites para EE.UU. |
| [`Sidebar.jsx`](src/components/Sidebar.jsx) | Tarjeta de detalle del evento seleccionado (tipo, ubicación, fecha, intensidad). |
| [`Timeline.jsx`](src/components/Timeline.jsx) | Slider temporal de 30 días con reproducción (avance de 6 h por tick). |
| [`CategoryFilters.jsx`](src/components/CategoryFilters.jsx) | Chips de filtro por categoría enlazados a `useAppStore`. |

---

## 📐 Matemática de coordenadas

[`geoToVector3.js`](src/utils/geoToVector3.js) convierte latitud/longitud a un punto sobre
la esfera (coordenadas esféricas → cartesianas):

```js
phi   = (90 - lat) * π/180     // ángulo polar
theta = (lng + 180) * π/180    // ángulo azimutal
x = -(r · sin(phi) · cos(theta))
z =  (r · sin(phi) · sin(theta))
y =  (r · cos(phi))
```

La misma fórmula se usa en `CountryBorders` (radio `1.001`), marcadores (`1.01`) y la
posición del sol en `Globe`. El hover inverso (clic en el globo → país) usa las coordenadas
UV del raycast: `lat = (uv.y - 0.5)·180`, `lng = (uv.x - 0.5)·360`, resueltas con
`geoContains` de d3-geo.

---

## 🎨 Sistema de diseño (Glassmorphism)

Definido en [`src/index.css`](src/index.css) bajo `@layer components`:

```css
.glass-panel { @apply bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-lg shadow-xl; }
.glass-card  { @apply bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl; }
```

Estética "centro de comando satelital": fondos translúcidos oscuros, desenfoque, bordes
suaves `white/10`. Tipografías: **Inter** (sans) y **JetBrains Mono** (datos técnicos).

---

## 🚀 Puesta en marcha

```bash
npm install        # instala dependencias
npm run dev        # servidor de desarrollo (con proxy FIRMS) → http://localhost:5173
npm run build      # build de producción en dist/
npm run preview    # sirve el build
npm run lint       # ESLint
```

**Requisitos**: Node.js 18+ y conexión a internet (texturas de la Tierra y APIs se cargan
en runtime). Sin conexión a las APIs, los fallbacks mantienen la app funcional.

---

## ⚡ Notas de rendimiento y resiliencia

- **Dos stores separados** (datos vs. UI) → menos re-renders y persistencia acotada.
- **Animaciones en `useFrame`** mutando refs de Three.js, nunca estado React.
- **`React.memo`** en marcadores y fronteras; **`useMemo`** en clustering, posiciones y cuaterniones.
- **Selectores Zustand derivados a booleano** para que cada marcador solo reaccione a *su* selección.
- **Throttling** del hover de país (50 ms) y diferenciación drag/clic (umbral 3 px).
- **Clustering por proximidad** para limitar el número de meshes en pantalla.
- **Fallbacks** en las tres APIs ante fallo de red o CORS.
- ⚠️ El bundle supera 500 kB (principalmente Three.js); para optimizar se puede aplicar
  code-splitting con `import()` dinámico.
```
