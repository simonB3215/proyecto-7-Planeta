Actúa como un Diseñador de Interfaces Senior y Arquitecto de Sistemas de Misión Crítica. Necesito refactorizar el sistema de onboarding de la aplicación para introducir una compuerta de configuración gráfica obligatoria justo al iniciar el tutorial interactivo por primera vez.

Por favor, analiza la estructura de los archivos de mi entorno y ejecuta la refactorización siguiendo estas directrices lógicas de comportamiento:

1. Transformación del Paso Inicial del Tutorial:
Modifica el archivo encargado del tutorial interactivo para que el primer paso actúe como un panel de configuración forzado. En lugar de mostrar solo un texto de bienvenida, este panel debe presentar al usuario dos opciones claras de visualización técnica: Modo de Alto Rendimiento o Modo de Máxima Calidad.

2. Bloqueo Estricto y Opacidad de Fondo:
Asegúrate de que mientras el usuario se encuentre en este primer paso de selección, toda la pantalla permanezca cubierta por un fondo oscuro, denso y opaco de manera uniforme. Elimina o deshabilita los controles de navegación del tutorial, como los botones de avanzar o de omitir la guía. El sistema debe impedir cualquier tipo de navegación por el planeta o por la interfaz hasta que se haya elegido un perfil gráfico.

3. Enlace con el Almacén de Estado y Transición Fluida:
Configura los botones de selección gráfica para que, al ser presionados por el operario, guarden la configuración elegida de forma directa en el almacenamiento de estados global de la aplicación. Inmediatamente después de guardar el perfil gráfico en la memoria del sistema, la interfaz del tutorial debe desbloquearse y hacer una transición automática hacia el segundo paso de la guía (la explicación de los controles de navegación orbital del planeta).

4. Cohesión de Estilo HUD:
Diseña la caja de diálogo de este selector manteniendo la estética aeroespacial del proyecto: bordes completamente rectos, contorno fino de alta visibilidad sobre fondo negro opaco, y tipografía puramente monoespaciada en mayúsculas con espaciado expandido para los títulos de las modalidades gráficas y las descripciones técnicas de cada modo.

Genera la refactorización de los componentes del tutorial y la interfaz global respetando este orden de ejecución lógica y asegurando la consistencia con el estado general de la aplicación.