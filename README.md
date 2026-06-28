# 🌍 EarthPulse 3D

Dashboard de **monitoreo planetario en tiempo real**: visualiza terremotos, incendios,
volcanes, tormentas y eventos extremos sobre un globo terráqueo 3D interactivo, con
estética "cyber-scientific" tipo centro de comando satelital.

![stack](https://img.shields.io/badge/React-19-61dafb) ![vite](https://img.shields.io/badge/Vite-8-646cff) ![three](https://img.shields.io/badge/Three.js-R3F-000000) ![tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Características

- 🌐 **Globo 3D** con texturas reales, luz solar calculada por hora UTC y halo atmosférico.
- 📡 **Datos en vivo** de USGS (sismos), NASA EONET (volcanes/tormentas) y NASA FIRMS (incendios), refrescados cada 5 min.
- 💡 **Marcadores neón** con materiales emisivos: onda sísmica expansiva, flicker de incendios, núcleo de volcán, etc.
- 🔍 **Clustering por proximidad**, filtros por categoría y búsqueda por país/región.
- 🎓 **Tutorial interactivo** con efecto *spotlight* (hole-punch) y diálogo glassmorphism centrado.
- ⏱️ **Línea de tiempo** para reproducir la evolución de los eventos (30 días).
- 🛰️ **Vuelo de cámara** automático al seleccionar un evento.

## 🚀 Inicio rápido

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo (con proxy FIRMS) |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve el build |
| `npm run lint` | ESLint |

## 🛠 Stack

React 19 · Vite 8 · Three.js + React Three Fiber + Drei · Framer Motion · TailwindCSS 4 · Zustand 5 · d3-geo

## 📖 Documentación

La documentación técnica completa (arquitectura, estado, APIs, sistema de marcadores,
tutorial spotlight, matemática de coordenadas, etc.) está en **[DOCUMENTACION.md](DOCUMENTACION.md)**.
