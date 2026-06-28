Actúa como un Ingeniero de Software Principal experto en React, Three.js y UI/UX. Necesito refactorizar los requerimientos de la aplicación "EarthPulse 3D" para simplificar la visualización de datos y la arquitectura.

REQUERIMIENTO DE REDUCCIÓN DE CATEGORÍAS:
A partir de ahora, la aplicación SOLO debe procesar, renderizar y filtrar tres tipos de eventos naturales:
1. Incendios (Fires)
2. Volcanes (Volcanoes)
3. Terremotos (Earthquakes)

EXCLUSIÓN ESTRICTA:
Debes eliminar por completo cualquier lógica, estado de Zustand, componente 3D, filtro en el Sidebar o configuración visual relacionada con "Tormentas" (Storms/Severe Storms) y "Eventos Extremos". Asegúrate de que las funciones utilitarias que mapean las respuestas de la API (NASA EONET o USGS) descarten explícitamente esos datos para no sobrecargar el estado de la aplicación.

REQUERIMIENTOS VISUALES (SIN EMOJIS, SIN COLORES HARDCODEADOS):
- Mantén la estética "cyber-científica" (Glassmorphism oscuro y renderizado 3D), pero no apliques códigos de color específicos a los materiales; deja las propiedades de color genéricas o parametrizadas para que puedan ser inyectadas externamente.
- Utiliza íconos SVG profesionales de 'lucide-react' para la interfaz en lugar de emojis: 
  - Incendios: Ícono 'Flame'.
  - Volcanes: Ícono 'Mountain'.
  - Terremotos: Ícono 'Activity'.
- Para los terremotos en el componente 3D, mantén la lógica del anillo (RingGeometry) animado simulando una onda expansiva, pero sin forzar una paleta.

CÓDIGO REQUERIDO:
1. Actualiza la lógica de mapeo de la API en los servicios (ej. 'services/api.js') para que devuelva únicamente un array filtrado con los tres eventos permitidos.
2. Actualiza el componente 'EventMarker.jsx' para manejar únicamente los tres casos de renderizado.
3. Actualiza el componente 'Sidebar.jsx' (y el store de Zustand) para que los filtros (checkboxes o toggles) solo muestren las opciones de Incendios, Volcanes y Terremotos.