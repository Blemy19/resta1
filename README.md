# Aniversario de Ají Soltero — Versión V12

**La música entregada empieza después del video de bienvenida**, al ocultarse el aterrizaje tras las nubes y revelarse la invitación. Está incluida dentro del proyecto y continúa en bucle. Puede pausarse desde el botón flotante. Para una guía de cambios consulta `CAMBIOS_V12_MUSICA_MOVIL.md`.

La invitación fue adaptada para celulares, tabletas y escritorio; las fotos y secciones están ajustadas por tamaño de pantalla. Abre `index.html` o ejecuta el proyecto con Live Server en VS Code.

---

# Invitación de aniversario · Ají Soltero (V11)

Invitación web editable basada en HTML, CSS y JavaScript. Esta versión integra **el video proporcionado el 6 de noviembre de 2026** y una transición de nubes que cubre la escena antes de revelar el aniversario. El sonido se intenta reproducir desde el toque en «Abrir invitación».

## Cómo verla

1. Descomprime el archivo ZIP.
2. Abre la carpeta `INVITACION_AJI_SOLTERO_ANIVERSARIO_V11_SONIDO_NUBES` con **Visual Studio Code**.
3. Puedes abrir `index.html` directamente en el navegador. Es la versión **autónoma**, con CSS, JavaScript, fotografías y video incorporados.
4. Si prefieres modificar archivos individuales, usa `index_modular.html` con **Live Server**.

## Nueva apertura con video

1. La primera pantalla muestra las puertas del restaurante.
2. Al presionar **Abrir invitación**, las puertas se abren y la imagen del video se expande desde el arco hasta la pantalla completa.
3. El video muestra un avión surcando las nubes y aterrizando.
4. Se sustituyó visualmente el texto original «04 / AVIACIÓN» y su descripción de vuelos privados por una presentación de **Ají Soltero · Aniversario**.
5. Antes de finalizar los aproximadamente 10 segundos del video, aparecen nubes que cubren la pantalla; después se disipan y revelan la portada.
6. El sonido está activado por defecto al pulsar «Abrir invitación». El botón inicial es **Silenciar video**, y se conserva **Saltar video**. Si un navegador bloquea la reproducción audible, la página intentará reproducir silenciado y mostrará el control para activar el audio.

**Importante:** este video no es una animación 3D programada ni un modelo aeronáutico; es la filmación facilitada por el usuario, con edición visual y transiciones web.

## Datos confirmados

- **Evento:** Aniversario de Ají Soltero.
- **Fecha:** 23 de diciembre, año pendiente.
- **Hora:** 7:00 p. m.
- **Restaurante:** Ají Soltero.
- **Dirección:** América Sur 4416.
- **Google Maps:** https://maps.app.goo.gl/FFGoJoN9sKyaPjwx7

## Modificar el proyecto

- `config.js`: nombre del restaurante, fecha, hora, enlace de Maps, fotografías y otros datos.
- `index_modular.html`: textos principales y estructura de las pantallas, incluido el cartel que aparece sobre el video.
- `welcome.js`: inicio de reproducción audible, apertura de puertas, activación de nubes, finalización y botones.
- `cloud-transition.css`: movimiento y densidad de la capa de nubes.
- `assets/clouds/`: imágenes y textura de nubes incorporadas en el proyecto.
- `generar_textura_nubes.py`: opcional, regenera la textura con Python (NumPy y Pillow).
- `welcome.css`: puertas, iluminación y portada inicial.
- `video-intro.css`: diseño de la secuencia de video y ajustes de celular.
- `assets/video/vuelo_aniversario_aji_soltero.mp4`: video editado y optimizado.
- `assets/video/portada_vuelo.jpg`: imagen de presentación por si el video tarda en cargar.

Para regenerar `index.html` después de modificar los archivos:

```bash
python generar_index_autonomo.py --source index_modular.html --output index.html
```

El comando anterior utiliza Python únicamente para **generar la versión autónoma del sitio**; la invitación funciona en el navegador sin Python y sin servidor backend.

## Consideraciones

- Las imágenes originales de gastronomía, coctelería, decoración y Tunantada se conservan.
- La ubicación usa exactamente el enlace de Maps enviado por el usuario.
- La música del video se intenta reproducir activada desde el botón «Abrir invitación». El visitante puede silenciarla.
- Algunos navegadores pueden bloquear incluso la reproducción audible iniciada por un clic. En ese caso, el video se intenta reproducir sin audio y el visitante puede activarlo con el control correspondiente. La opción «Saltar video» sigue disponible.
- Para movimientos reducidos, el video se omite y se entra directamente a la invitación.
- Las anotaciones antiguas de las versiones V9 y anteriores son históricas; la V10 sustituye la secuencia anterior.
