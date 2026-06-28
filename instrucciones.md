Actúa como un Ingeniero de Software Principal experto en React, Zustand y lógica de filtrado de datos espaciales. Estoy experimentando un bug crítico en la aplicación "EarthPulse 3D".

DESCRIPCIÓN DEL BUG:
Cuando el usuario selecciona un país específico en el Sidebar que actualmente NO tiene eventos activos, el mapa 3D sigue mostrando marcadores (falsos positivos o mantiene el estado anterior) en lugar de quedar vacío. 

REQUERIMIENTO DE CORRECCIÓN:
Necesito que refactorices la función de filtrado (probablemente en el store de Zustand o en un custom hook) para garantizar que el filtrado geográfico sea estricto y que el estado de la UI se limpie correctamente.

PASOS A IMPLEMENTAR:
1. Limpieza de Estado (Stale State): Asegúrate de que si la función de filtrado determina que hay 0 eventos para el país seleccionado, el array de eventos a renderizar ('filteredEvents') se actualice explícitamente a un array vacío '[]'. El '<Canvas>' de Three.js debe reaccionar a esto y desmontar todos los '<EventMarker>'.
2. Filtrado Estricto: Revisa la lógica que compara el país seleccionado con los datos de la API. Si estás filtrando por texto, asegúrate de hacer una comparación exacta (exact match) en minúsculas. Si estás filtrando por coordenadas (Bounding Box), verifica que la validación matemática (latitud y longitud dentro de los límites del país) sea correcta.
3. Manejo de 'Empty State' (UI): Si el array resultante es '[]', la interfaz (Sidebar) debe mostrar un mensaje claro usando la estética Glassmorphism establecida. Ejemplo: "No hay eventos sísmicos, volcánicos ni incendios activos registrados en este territorio". Utiliza íconos de 'lucide-react' (ej. Map o SearchX).
4. Restricción de Categorías: Recuerda que la aplicación SOLO procesa Incendios, Volcanes y Terremotos.

CÓDIGO REQUERIDO:
1. El código corregido del store de Zustand (ej. 'useAppStore.js') o el bloque exacto de la función 'filterEventsByCountry'.
2. El fragmento del componente que renderiza los marcadores en Three.js, asegurando que escuche correctamente los cambios del store.
3. El componente de 'Empty State' para el Sidebar utilizando Tailwind CSS.