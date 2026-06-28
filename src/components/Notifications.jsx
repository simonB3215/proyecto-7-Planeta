import { Toaster } from 'react-hot-toast';

/**
 * Contenedor global de notificaciones. Montar una sola vez (en App).
 * z-[100] para flotar sobre el Canvas 3D; el contenedor no captura punteros
 * (solo las tarjetas), de modo que no interrumpe la interacción con el globo.
 *
 * El helper para disparar alertas vive en `src/utils/notify.jsx` → `notify`.
 */
export function NotificationToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerClassName="z-[100]"
      containerStyle={{ top: 84, zIndex: 100 }}
    />
  );
}
