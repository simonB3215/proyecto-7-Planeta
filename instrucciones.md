Actúa como un Ingeniero de Software Principal experto en React, UI/UX y Three.js. Necesito implementar un sistema de Tutorial Interactivo (Onboarding) para la aplicación "EarthPulse 3D" con un requerimiento visual muy específico.

REQUERIMIENTO VISUAL DEL TUTORIAL (EFECTO SPOTLIGHT):
El tutorial debe guiar al usuario por las funcionalidades de la app. Cuando se active:
1. Toda la pantalla debe cubrirse con un fondo opaco (overlay oscuro, ej. rgba(0,0,0,0.8)).
2. El mensaje explicativo (texto y botones de "Siguiente" / "Omitir") debe aparecer siempre centrado en la pantalla con un diseño Glassmorphism elegante (fondo translúcido, bordes suaves).
3. El elemento de la interfaz al que se refiere el paso actual (por ejemplo, el Sidebar de filtros o el contenedor del Globo 3D) DEBE quedar expuesto, es decir, el fondo opaco no debe cubrir ese elemento específico (efecto spotlight / hole-punch).

IMPLEMENTACIÓN SUGERIDA:
Utiliza la librería 'react-joyride' configurada con un 'tooltipComponent' personalizado (para forzar que el mensaje de texto aparezca siempre centrado en la pantalla con position fixed, ignorando la posición del elemento) y asegúrate de que el 'spotlight' de Joyride resalte el target correcto. 
Si prefieres no usar react-joyride, implementa un 'TutorialOverlay.jsx' personalizado que use 'getBoundingClientRect()' del elemento objetivo para aplicar un 'clip-path' o un SVG mask sobre un fondo oscuro a pantalla completa, manejando las transiciones con Framer Motion.

PASOS DEL TUTORIAL:
- Paso 1 (Target: 'body' o centro): "Bienvenido a EarthPulse 3D. Monitoreo planetario en tiempo real." (Pantalla completa opaca, sin spotlight específico).
- Paso 2 (Target: contenedor del Canvas 3D): "Navegación: Arrastra para rotar el planeta, usa la rueda del mouse para hacer zoom." (Spotlight sobre el canvas).
- Paso 3 (Target: elemento del Sidebar): "Filtros: Usa este panel para ocultar o mostrar eventos por categoría." (Spotlight sobre el Sidebar lateral).
- Paso 4 (Target: un EventMarker ficticio o el centro del globo): "Detalles: Haz clic en cualquier marcador brillante para ver los datos específicos del evento."

CÓDIGO REQUERIDO:
1. El código completo del componente 'TutorialSpotlight.jsx' (ya sea usando react-joyride o custom).
2. Los estilos necesarios (Tailwind o CSS en línea) para asegurar que el cuadro de diálogo quede centrado y el efecto de recorte funcione perfectamente.
3. La integración con Zustand ('useAppStore') para guardar en localStorage si el usuario ya completó el tutorial.

Escribe un código modular, resiliente y listo para integrarse en un proyecto Vite + React.