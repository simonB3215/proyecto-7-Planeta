Actúa como un experto en UI/UX y React. Necesito implementar un sistema de alertas/notificaciones (Toasts) para la aplicación "EarthPulse 3D", el cual debe estar perfectamente alineado con nuestra estética "cyber-científica" y de centro de monitoreo espacial.

REQUERIMIENTO:
Diseña e implementa un sistema de alertas (puedes integrar 'react-hot-toast', 'sonner' o crear un componente personalizado con Framer Motion). Las alertas deben flotar sobre la interfaz (z-index máximo) sin interrumpir la interacción con el globo 3D. 
IMPORTANTE: Está estrictamente prohibido utilizar emojis en la interfaz. Para los indicadores de estado, debes utilizar una librería de íconos SVG profesional (como 'lucide-react') o formas geométricas puras construidas con CSS.

ESTÉTICA VISUAL (Usando Tailwind CSS):
Las tarjetas de alerta deben tener un diseño "Glassmorphism" técnico y limpio: 
- Fondo oscuro translúcido (ej. bg-slate-950/60 o bg-black/50).
- Desenfoque de fondo profundo (backdrop-blur-md).
- Texto principal en blanco (text-white) y texto secundario en gris claro (text-slate-300).
- Tipografía preferentemente monoespaciada para los códigos de error o fuentes de datos.

PALETA DE COLORES NEÓN PARA ESTADOS (USANDO ÍCONOS SVG):
Cada tipo de alerta debe diferenciarse mediante el color de su acento (borde lateral izquierdo, border-l-4), el color del ícono SVG y un sutil resplandor (drop-shadow), usando los siguientes tonos:
- Error (Fallo de API, sin conexión): Acento, ícono SVG (ej. AlertCircle o XOctagon) y brillo en Rojo Carmesí Neón (#FF3366).
- Advertencia (Datos parciales): Acento, ícono SVG (ej. AlertTriangle) y brillo en Ámbar Brillante (#FF9900).
- Información (Cargando datos, sistema): Acento, ícono SVG (ej. Info o Activity) y brillo en Cian Eléctrico (#00E5FF).
- Éxito (Datos cargados, conexión lista): Acento, ícono SVG (ej. CheckCircle2) y brillo en Esmeralda Neón (#10B981).

CÓDIGO REQUERIDO:
1. La configuración del 'Toaster' global, asegurando que tenga un z-index altísimo (z-[100]) para evitar que el Canvas de Three.js lo cubra.
2. Los estilos o componentes personalizados (Custom Toasts) aplicando las clases de Tailwind descritas, incorporando la importación de los íconos de 'lucide-react'.
3. Un ejemplo práctico de cómo disparar esta alerta (ej. un 'toast.error') dentro de un bloque 'try/catch' al consumir la API de NASA EONET o USGS.