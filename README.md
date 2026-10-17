# Lilium Beauty · Tu espacio de uñas

Aplicación web para gestionar el estudio de uñas: agenda, fichas de clientas, servicios, finanzas y ajustes.
Funciona en el navegador del PC y del móvil (se puede instalar con «Añadir a pantalla de inicio») y sincroniza
los datos con Supabase cuando se inicia sesión.

## Estructura
- `index.html` — página de entrada.
- `style.css` — diseño (modo claro y oscuro).
- `art.js` — iconos e ilustraciones vectoriales.
- `js/core.js` — datos, guardado local y sincronización con la nube.
- `js/ui.js` — marco, navegación, ventanas y menús.
- `js/home.js`, `js/clients.js`, `js/agenda.js`, `js/finance.js`, `js/settings.js` — pantallas.
- `sw.js` + `manifest.webmanifest` — instalación y uso sin conexión.
- `assets/` — imágenes.

## Publicar
Es una web estática: Vercel la publica tal cual (sin compilación). Cada `push` a `main` actualiza la web.

## Probar en local
`npx serve .` (o cualquier servidor estático) y abrir la dirección que indique.
