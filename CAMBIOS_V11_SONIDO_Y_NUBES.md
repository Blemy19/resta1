# V11 — Sonido activado y transición entre nubes

## Inicio y sonido
- Al tocar **Abrir invitación**, la página solicita la reproducción del vídeo **con sonido** en ese mismo gesto del usuario.
- El control aparece como **Silenciar video**; si se silencia, pasa a **Activar sonido**.
- En navegadores que rechazan audio, se intenta reproducir sin sonido y se mantiene el control manual de audio y la posibilidad de saltar el clip.
- No se inicia audio sin que el invitado pulse Abrir invitación.

## Transición natural
- Aproximadamente 1,8 segundos antes de terminar el vídeo, entran capas de nubes desde los costados, arriba y abajo.
- Las nubes crecen y cubren completamente el vídeo.
- Con la imagen ya cubierta, la portada se coloca detrás de la niebla, y las nubes se disipan para revelarla sin un corte brusco.
- En «Saltar video», se usa una versión breve de la misma transición.

## Archivos modificados
- `welcome.js`: reproducción con sonido y sincronización de la transición.
- `video-intro.css`: mantiene las puertas y el estilo de vídeo.
- `cloud-transition.css`: capas de nubes y fundido.
- `index_modular.html`: nueva capa de nubes y control de sonido activado inicialmente.
- `assets/clouds`: imágenes de las nubes y textura de cobertura.
- `index.html`: versión autónoma regenerada con todos los recursos incorporados.

## Comprobaciones
- Chromium de escritorio y modo móvil: el video arrancó con `muted=false` y volumen `1` tras pulsar el botón.
- Probada transición a nubes y revelado de la portada.
- Verificado «Saltar video», reingreso y ausencia de excepciones JavaScript en las pruebas.

Las políticas de reproducción con audio varían entre navegadores; aunque se usa el gesto «Abrir invitación» para habilitarlo, no puede garantizarse en todos los dispositivos.
