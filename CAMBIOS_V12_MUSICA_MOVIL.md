# Aniversario Ají Soltero — V12 (música + edición móvil)

## Música incorporada
- Se agregó el MP3 proporcionado por el organizador, `assets/audio/musica_aniversario.mp3` (duración aproximada: 2:32).
- Al pulsar **Abrir invitación**, el navegador intenta preparar la canción dentro del gesto del usuario. La pista queda en silencio mientras suena el video de llegada.
- Al quedar cubierta la escena por las nubes y aparecer la invitación, la canción vuelve al inicio y entra progresivamente con un fundido de volumen.
- La pista se repite automáticamente mientras se recorre la invitación.
- Hay un botón flotante para **pausar / activar música**; al volver a la pantalla inicial se detiene para no mezclarse con el video si se vuelve a abrir.
- Algunos navegadores pueden exigir otro toque para permitir audio: el botón **Activar música ♫** ofrece esa alternativa.

## Adaptación móvil
Se revisaron las presentaciones en 360, 390, 768 y 1440 px de ancho. Se modificaron los estilos responsivos de:
- Navegación, portada y fotografía destacada.
- Salón y sus tres fotografías.
- Tarjetas de recorrido y gastronomía (escenas y galería).
- Bartender y cócteles.
- Tunantada (texto en una columna y fotografía grande).
- Decoración, regalos y brindis.
- Fecha, dirección, Google Maps, pie de página, botones y control musical.

Se corrigió además el contraste del texto sobre el fondo oscuro de la portada.

## Archivos principales
- `index.html`: versión autónoma (también incluye imágenes, video y audio).
- `index_modular.html`: fuente editable para VS Code.
- `config.js`: datos del evento y nombre del archivo de audio.
- `assets/audio/musica_aniversario.mp3`: canción proporcionada por el usuario.
- `music-manager.js`: preparación, inicio progresivo, bucle y controles de audio.
- `mobile-v12.css`: reglas de diseño móvil.
- `welcome.js`: emite el evento de música al cubrirse la escena con nubes.
- `events.js`: mantiene funciones de la invitación y delega la música al módulo nuevo.

## Abrir y modificar
Abrir `index.html` directamente o, preferiblemente, abrir la carpeta en Visual Studio Code y ejecutar con Live Server. Si se modifica la fuente modular, regenerar el HTML autónomo con:

```bash
python generar_index_autonomo.py --source index_modular.html --output index.html
```

### Nota técnica
El año de la celebración y el número de confirmación por WhatsApp siguen sin establecerse: no se añadieron datos inventados. Google Maps usa el enlace facilitado por el organizador.
