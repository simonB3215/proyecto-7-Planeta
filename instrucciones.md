Actúa como un Arquitecto de Software Principal y Diseñador de Experiencia de Usuario (UX) de sistemas aeroespaciales. Necesito refactorizar el sistema de iniciación y guía interactiva (onboarding) de mi aplicación para transformarlo en una compuerta de configuración técnica obligatoria.

Tu misión es analizar los archivos correspondientes a la guía interactiva, la memoria central y el ciclo de vida de la aplicación, y aplicar las siguientes directrices arquitectónicas de manera estricta:

FASE 1: VERIFICACIÓN DE SESIÓN Y ARRANQUE FORZADO
Interviene el ciclo de vida inicial de la aplicación. Configura una comprobación rigurosa en el almacenamiento persistente del navegador para detectar si el usuario es nuevo. Si no existe un registro de finalización de la guía, el sistema debe interrumpir cualquier interacción libre y desplegar de forma inmediata el panel del tutorial, priorizando su aparición por encima de la descarga de datos satelitales externos.

FASE 2: AISLAMIENTO VISUAL Y BLOQUEO DE INTERFAZ
Refactoriza la capa visual del sistema de guía. Mientras el usuario se encuentre en la etapa inicial de configuración, la pantalla entera debe quedar cubierta por un fondo oscuro, denso y completamente opaco que oculte el planeta y los paneles de mandos. Deshabilita o retira por completo cualquier botón de escape, cierre o la opción de "omitir tutorial". El usuario no debe poder interactuar con la aplicación de ninguna forma hasta superar este paso.

FASE 3: COMPUERTA DE RENDIMIENTO TRIPARTITA
Modifica el flujo de la guía para que el primer panel no sea un mensaje de bienvenida, sino un selector gráfico obligatorio. Este panel debe ofrecer tres alternativas de configuración técnica claras: Calidad Baja (máximo rendimiento), Calidad Media (equilibrio) y Calidad Alta (máxima fidelidad). Diseña estos controles manteniendo una estética de telemetría estricta: formas rectangulares precisas, fondo oscuro de alto contraste y tipografía monoespaciada en mayúsculas.

FASE 4: TRANSICIÓN Y DESBLOQUEO AUTOMÁTICO
Conecta las tres opciones de calidad con el almacén de estado global. La única forma de salir de esta pantalla bloqueante es presionando una de las alternativas. Al hacerlo, el sistema debe registrar de inmediato el perfil gráfico elegido, aplicar los cambios de renderizado en segundo plano y avanzar de forma automática hacia la primera fase explicativa real del tutorial (los controles del planeta), restaurando al mismo tiempo los botones habituales de navegación de la guía.

Ejecuta esta reestructuración garantizando que el flujo sea a prueba de fallos y que el usuario no pueda evadir la selección de rendimiento bajo ninguna circunstancia en su primera visita.