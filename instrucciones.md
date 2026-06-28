Actúa como un Ingeniero de Software Principal experto en React Three Fiber (R3F) y UX. Necesito implementar una funcionalidad de "Click Away" (Deselección) en mi aplicación "EarthPulse 3D" para mejorar la navegación del usuario.

REQUERIMIENTO PRINCIPAL:
El usuario debe poder cerrar o limpiar un evento seleccionado (almacenado en el estado de Zustand) simplemente haciendo clic fuera de los marcadores, ya sea en el espacio vacío del fondo o sobre la superficie del planeta (océano o tierra firme).

PLAN DE IMPLEMENTACIÓN:

1. Modificación en 'App.jsx' (Detección de Vacío Espacial):
- Localiza el componente principal del lienzo 3D.
- Implementa el manejador de eventos nativo de R3F diseñado para interceptar los clics que no impactan en ninguna malla 3D (clics perdidos o "missed").
- Cuando este evento ocurra, invoca la acción del store global (Zustand) correspondiente para anular (setear a null) el evento seleccionado actualmente.

2. Modificación en 'Globe.jsx' (Detección de Superficie del Planeta):
- Localiza el manejador de eventos que se dispara al soltar el clic sobre la malla principal de la esfera terrestre.
- Identifica la validación matemática existente que discrimina si el usuario hizo un clic intencional o si estaba arrastrando la cámara (comprobación de deltas X e Y).
- Inmediatamente después de confirmar que fue un clic real y no un arrastre, inyecta la invocación al store global para anular el evento seleccionado.
- Es crucial que esta nueva instrucción se ejecute en paralelo y NO bloquee ni modifique la lógica posterior que calcula el país seleccionado mediante GeoJSON.

Analiza la arquitectura actual de mis archivos 'App.jsx' y 'Globe.jsx' en el entorno, y devuélveme el código actualizado aplicando estrictamente esta lógica de deselección.