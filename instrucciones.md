Actúa como un Ingeniero de Software Principal y Diseñador UX de interfaces aeroespaciales (nivel SpaceX/Palantir). Tengo mi proyecto "EarthPulse 3D" construido con React, Three.js (R3F), Zustand y Tailwind CSS.

Necesito que realices una refactorización integral siguiendo ESTRICTAMENTE el siguiente PLAN DE IMPLEMENTACIÓN paso a paso. Tu tarea es analizar este plan y entregarme el código refactorizado para los componentes clave.

### PLAN DE IMPLEMENTACIÓN:

**PASO 1: Arquitectura de Datos y Corrección de Bugs (Estado y Filtrado)**
- Restricción de Categorías: Refactoriza la lógica para que la aplicación SOLO procese y renderice Incendios, Volcanes y Terremotos. Elimina cualquier rastro de "Tormentas" o "Eventos Extremos" en utilidades, store de Zustand y filtros de la UI.
- Bug de Filtrado Geográfico: En la lógica de selección de país, si el país seleccionado tiene 0 eventos activos, el estado de eventos a renderizar DEBE setearse explícitamente como un array vacío '[]' para garantizar que el Canvas desmonte los marcadores.
- Interfaz de Empty State: Si no hay eventos en el país filtrado, muestra un mensaje técnico en el panel lateral (ej. "SIN ACTIVIDAD DETECTADA EN LA REGIÓN").

**PASO 2: Entorno 3D HD y Vacío Espacial (App.jsx y Globe.jsx)**
- Fotorrealismo y Resolución: En '<Canvas>', inyecta 'dpr={[1, 2]}' y 'gl={{ antialias: true, powerPreference: "high-performance" }}'.
- Estética Espacial: El fondo de la aplicación debe ser negro puro ('bg-black'). Elimina luces ambientales innecesarias. El lado oscuro de la Tierra debe ser negro absoluto (alto contraste). El halo atmosférico debe ser ultradelgado (escala 1.005) y tenue.
- Post-Procesamiento Técnico: Usa '<EffectComposer multisampling={8}>' y ajusta el '<Bloom>' con un 'luminanceThreshold' alto para lograr una luz nítida, estilo láser o LED, eliminando brillos difusos.
- Estrellas: Reduce drásticamente el tamaño y aplica 'saturation={0}' en '<Stars>'.

**PASO 3: Marcadores de Telemetría Aeroespacial (EventMarker.jsx)**
- Geometría Perfecta: Actualiza las geometrías de las esferas a 'args={[size, 64, 64]}' para eliminar cualquier borde poligonal.
- Diseño de Precisión: Reemplaza los halos difusos por anillos finos ('RingGeometry') o mallas ('wireframe={true}') que simulen telemetría pura.
- Terremotos: Configura la onda expansiva con 'blending={THREE.AdditiveBlending}' simulando un barrido de radar.
- Nota de Color: NO hardcodees paletas de colores en este archivo; mantén la arquitectura donde los colores se inyectan por props, pero adapta los materiales emisivos ('emissiveIntensity') para que el brillo sea elegante.

**PASO 4: Interfaz HUD Táctica (Tailwind CSS)**
- Prohibición de Emojis: Reemplaza cualquier emoji en la UI por íconos vectoriales de 'lucide-react' (strokeWidth={1.5}).
- UI Minimalista: Elimina el glassmorphism grueso. Reemplázalo por paneles flotantes 'bg-black/80' con bordes rectos o mínimos ('rounded-sm') y un trazo muy fino ('border-white/10').
- Tipografía de Ingeniería: Aplica clases como 'font-mono text-[10px] tracking-widest uppercase text-neutral-300' para todos los datos, coordenadas y tooltips.
- Notificaciones: Estructura un sistema de alertas (Toasts) técnico y oscuro que respete esta misma estética para manejar los estados de la API.