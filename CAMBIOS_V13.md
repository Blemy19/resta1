# Ají Soltero · Aniversario — Versión 13

## Cambios para los invitados
- Eliminada la presentación que hablaba sobre «3D», modelos de referencia y explicaciones del diseño.
- Nueva sección real «Una noche llena de momentos especiales», con enlaces a gastronomía, barra libre y Tunantada.
- Retirados los comentarios técnicos y las notas sobre fotografías de referencia de las áreas visibles.
- Ocultas las indicaciones técnicas sobre año/zona horaria y confirmación por WhatsApp cuando faltan datos. El calendario y las confirmaciones siguen disponibles cuando se configuren.
- El salón móvil ahora tiene una fotografía principal completa y dos fotografías secundarias ordenadas en una cuadrícula real.
- Desactivadas en móvil las transformaciones del salón que antes encimaban y recortaban las imágenes.
- Cabecera y controles flotantes de música más compactos en celular.
- Fotografías de tres momentos en galería horizontal táctil en móvil.

## Funciones conservadas
- Puertas, video de avión y transición entre nubes.
- Reproducción de video con audio, música ambiental posterior y botón para pausarla.
- Gastronomía, barra, Tunantada, decoración, regalos interactivos y ubicación en Google Maps.
- Fecha y hora del evento, sin inventar el año aún pendiente.

## Archivos modificados
`index_modular.html`, `index.html`, `aniversario-v13.css` (nuevo), `events.js`, `music-manager.js`, `config.js`.

## Cómo visualizar
Abre `index.html` en un navegador o, preferentemente, desde Live Server en VS Code. Si editas archivos modulares, vuelve a generar `index.html` con:

```bash
python generar_index_autonomo.py --source index_modular.html --output index.html
```
