Actúa como un Arquitecto de Sistemas de Misión Crítica y Experto en Optimización de Gráficos 3D. Necesito refactorizar el sistema de rendimiento de la aplicación para implementar un selector de calidad gráfica de tres niveles (Baja, Media y Alta), garantizando que la aplicación sea accesible en hardware limitado y deslumbrante en pantallas de alta definición.

Por favor, analiza la arquitectura de mi proyecto y ejecuta la refactorización siguiendo estrictamente estas directrices lógicas de comportamiento:

1. Expansión del Estado Global:
Actualiza el archivo encargado de la memoria y el estado central para soportar tres perfiles de calidad gráfica. Añade una función que permita establecer el nivel de forma directa desde la compuerta de inicio, y otra función que permita alternar cíclicamente entre los tres niveles desde los controles de la interfaz principal.

2. Compuerta Obligatoria de Tres Opciones:
En el componente del tutorial de inicio, modifica el panel de configuración forzada para que presente tres opciones de selección técnica (Baja, Media y Alta). Mantén el fondo opaco y bloqueante que impide la interacción con el planeta. La aplicación solo debe guardar la preferencia y avanzar hacia la guía interactiva una vez que el usuario presione una de las tres alternativas.

3. Escalado Progresivo de Renderizado y Efectos:
Refactoriza el lienzo principal y el compositor de efectos lumínicos para que interpreten los tres perfiles:
- En calidad baja, restringe la densidad de pixeles a la resolución estándar y desactiva totalmente el suavizado de bordes en el post-procesamiento para salvar recursos.
- En calidad media, permite una densidad de pixeles equilibrada y activa un nivel moderado de suavizado.
- En calidad alta, habilita la densidad máxima nativa de la pantalla y el nivel más exigente de suavizado para eliminar cualquier diente de sierra.

4. Adaptación Geométrica del Planeta y la Telemetría:
Modifica los componentes que renderizan la esfera terrestre y los marcadores de anomalías. Implementa una lógica que ajuste la cantidad de segmentos poligonales basándose en el estado gráfico. Aplica un número de subdivisiones muy bajo para el modo de rendimiento máximo (baja), un valor intermedio aceptable para el modo medio, y un valor altísimo para el modo de calidad superior, garantizando esferas completamente pulidas.

5. Interfaz HUD Aeroespacial:
Asegúrate de que los tres botones en la pantalla de inicio obligatoria mantengan un diseño técnico y monocromático: bordes rectos milimétricos, fondo oscuro profundo y tipografía puramente monoespaciada en mayúsculas, conservando la identidad visual de un panel de telemetría de precisión.

Genera las modificaciones necesarias distribuyendo esta lógica de manera modular entre el estado global, el lienzo de renderizado, las geometrías y el sistema de guía inicial.