Actúa como un Ingeniero de Software Principal experto en React, Three.js y UI/UX. Genera los componentes necesarios para la aplicación "EarthPulse 3D" siguiendo una arquitectura limpia y modular.

CONTESTO Y TECNOLOGÍAS:
- Framework: React (Vite) + TailwindCSS.
- 3D: React Three Fiber (R3F) + Drei.
- Animaciones e Interfaz: Framer Motion (para UI) y Shaders/Materiales Emisivos (para 3D).
- Estado: Zustand (para almacenar si el usuario ya vio el tutorial y el evento seleccionado).

REQUERIMIENTO 1: PALETA DE COLORES "CYBER-SCIENTIFIC" Y ESTÉTICA PREMIUM
Modifica el renderizado de los marcadores 3D en el globo para que utilicen materiales avanzados de Three.js (MeshBasicMaterial o MeshStandardMaterial con valores 'emissive' y 'emissiveIntensity' altos para simular brillo neón/bloom). Los colores exactos deben ser:
- Incendios: Rojo Carmesí Neón (#FF3366) con un leve parpadeo (flicker).
- Volcanes: Ámbar Brillante (#FF9900) con un núcleo blanco.
- Tormentas: Cian Eléctrico (#00E5FF) con geometría translúcida.
- Terremotos: Dorado Vibrante (#FFD700) que incluya un anillo (RingGeometry) que se expanda hacia afuera simulando una onda sísmica interactiva.
- Eventos Extremos: Magenta Profundo (#B026FF).

La interfaz de usuario (Sidebar y Tarjetas de información) debe usar un estilo "Glassmorphism" con TailwindCSS (bg-slate-950/40, backdrop-blur-md, border border-white/10) para que parezca un centro de comando satelital flotando sobre el espacio.

REQUERIMIENTO 2: SISTEMA DE TUTORIAL INTERACTIVO (ONBOARDING)
Crea un componente modular llamado 'TutorialOverlay.jsx' utilizando Framer Motion para controlar las transiciones. 
- Debe activarse automáticamente la primera vez que se entra a la app (usa localStorage mediante Zustand para recordar el estado).
- Debe ser un sistema de "guía por pasos" con un diseño oscuro/translúcido elegante.
- Pasos del tutorial:
  1. Bienvenida: "Bienvenido a EarthPulse 3D. Monitoreo planetario en tiempo real".
  2. Control de Globo: "Arrastra para rotar el planeta, usa la rueda del mouse para hacer zoom".
  3. Filtros: "Usa el panel lateral para filtrar eventos por categoría".
  4. Detalles: "Haz clic en cualquier marcador brillante sobre el globo para ver sus datos específicos".
- Incluye botones de "Siguiente", "Omitir" y un botón permanente de "Ayuda" (ícono de pregunta) en la esquina de la pantalla para reiniciar el tutorial cuando el usuario quiera.

CÓDIGO REQUERIDO:
Proporcióname la estructura de código limpia para:
1. 'store/useAppStore.js' (Estado de Zustand para el tutorial y filtros).
2. 'components/EventMarker.jsx' (Marcadores con la nueva paleta neón, emisividad y la onda expansiva para terremotos).
3. 'components/TutorialOverlay.jsx' (El flujo interactivo paso a paso con Framer Motion).
4. Los estilos o clases de Tailwind sugeridas para el acabado Glassmorphism de la UI.

Escribe el código de manera estrictamente modular, optimizado para rendimiento (evitando re-renders innecesarios en R3F) y listo para producción.