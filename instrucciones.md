Actúa como un experto en depuración de UI/UX y React Three Fiber. Estoy desarrollando la aplicación "EarthPulse 3D", pero me estoy encontrando con bugs visuales al combinar el Canvas 3D con la interfaz de Tailwind y el overlay del tutorial. 

Necesito que apliques las siguientes correcciones arquitectónicas a mi código:

1. CORRECCIÓN DE Z-INDEX Y SCROLL:
Configura el contenedor del `<Canvas>` de Three.js para que ocupe toda la pantalla sin generar barras de desplazamiento (usa 'fixed inset-0 w-full h-full -z-10' en Tailwind o estilos equivalentes). Asegúrate de que los componentes de la interfaz como el Sidebar tengan un 'z-index' superior (ej. z-20) y que el TutorialOverlay esté por encima de todo (ej. z-50).

2. POST-PROCESAMIENTO PARA LOS MARCADORES (GLOW):
Los marcadores tienen materiales emisivos pero no brillan de forma realista. Añade la configuración de '@react-three/postprocessing' en el archivo principal. Implementa '<EffectComposer>' con '<Bloom>' controlando el umbral (luminanceThreshold) para que solo brillen los marcadores de eventos y no la textura de la Tierra.

3. CORRECCIÓN DEL CÁLCULO DEL SPOTLIGHT Y RESIZE:
Si estás usando un componente de tutorial personalizado o react-joyride, asegúrate de que el recorte del fondo oscuro (spotlight) se actualice correctamente si el usuario cambia el tamaño de la ventana. Agrega un listener para el evento 'resize'.

4. CLIPPING DE LA CÁMARA (CORTES 3D):
Verifica la configuración de la cámara en el Canvas. Ajusta los planos 'near' y 'far' de la cámara (ej. near={0.1} far={1000}) para evitar que la Tierra o los marcadores desaparezcan o se corten de forma extraña al hacer zoom.

Proporcióname los fragmentos de código específicos o las clases de Tailwind que debo reemplazar para estabilizar la vista.