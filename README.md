# PediKine v0.10 — corrección definitiva de icono PWA

Problema detectado:
iOS/Safari puede conservar en caché `apple-touch-icon.png` aunque el contenido del archivo haya cambiado.

Corrección:
- Nuevos nombres de archivo para forzar una URL distinta:
  - pedikine-v010-180.png
  - pedikine-v010-192.png
  - pedikine-v010-512.png
  - pedikine-v010-32.png
- `apple-touch-icon` y `apple-touch-icon-precomposed`.
- favicon explícito.
- manifest con nuevas URLs de icono.
- manifest versionado en el HTML.
- nueva caché `pedikine-v010`.
- versión visible actualizada a v0.10.

IMPORTANTE:
Sube TODOS los archivos del ZIP a GitHub, incluidos los nuevos PNG.

Luego en iPhone:
1. Borra PediKine de la pantalla de inicio.
2. Cierra esa pestaña de Safari.
3. Abre nuevamente la URL.
4. Recarga la página.
5. Compartir → Añadir a pantalla de inicio.

Los iconos anteriores pueden permanecer en el repositorio, pero ya no son referenciados.
