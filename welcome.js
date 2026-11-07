/* V11: puertas -> vídeo con audio autorizado por el botón -> nube envolvente -> invitación.
   Los navegadores que rechazan audio ofrecen la alternativa silenciada y el control manual. */
(() => {
  'use strict';
  const entrance = document.getElementById('welcome-screen');
  const site = document.getElementById('site-content');
  const open = document.getElementById('open-invitation');
  const film = document.getElementById('anniversary-film');
  const video = document.getElementById('anniversary-film-video');
  const clouds = document.getElementById('cloud-transition');
  const skip = document.getElementById('film-skip');
  const sound = document.getElementById('film-sound');
  const soundLabel = document.getElementById('film-sound-label');
  const play = document.getElementById('film-play');
  const progress = document.getElementById('film-progress-bar');
  const error = document.getElementById('film-error');
  if (!entrance || !site || !open || !film || !video || !clouds || !skip) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const normalCloudMs = 3600;
  let phase = 'welcome';
  let priorFocus = null;
  let priorScroll = 0;
  let cloudStarted = false;
  let swapped = false;
  let timers = [];
  let attemptVersion = 0;
  const later = (fn, delay) => {
    const id = window.setTimeout(fn, delay);
    timers.push(id);
    return id;
  };
  const clearTimers = () => {
    timers.forEach(window.clearTimeout);
    timers = [];
  };
  function updateSoundUI() {
    const audible = !video.muted;
    sound?.setAttribute('aria-pressed', String(audible));
    sound?.setAttribute('aria-label', audible ? 'Silenciar video' : 'Activar sonido del video');
    if (soundLabel) soundLabel.textContent = audible ? 'Silenciar video' : 'Activar sonido';
  }
  function reset() {
    clearTimers();
    attemptVersion++;
    video.pause();
    try { video.currentTime = 0; } catch (_) {}
    // No usar atributo muted ni activar el silencio por defecto.
    video.muted = false;
    video.defaultMuted = false;
    updateSoundUI();
    clouds.hidden = true;
    clouds.classList.remove('is-active', 'is-fast');
    cloudStarted = false;
    swapped = false;
    film.hidden = true;
    film.classList.remove('is-visible', 'is-expanded', 'is-ending');
    entrance.classList.remove('is-opening', 'is-entering', 'is-leaving');
    if (play) play.hidden = true;
    if (error) error.hidden = true;
    if (progress) progress.style.width = '0%';
  }
  function show(initial = false) {
    if (['opening', 'playing', 'transitioning'].includes(phase)) return;
    priorScroll = initial ? 0 : window.scrollY;
    priorFocus = initial ? null : document.activeElement;
    reset();
    site.hidden = true;
    site.inert = true;
    entrance.hidden = false;
    document.body.classList.add('entrance-locked');
    open.disabled = false;
    phase = 'welcome';
    open.focus({ preventScroll: true });
    if (!initial) document.dispatchEvent(new CustomEvent('invitation:reopened'));
  }
  function exposeSite() {
    if (swapped || phase !== 'transitioning') return;
    swapped = true;
    // Solo cuando la pantalla está cubierta de nubes se reemplaza el vídeo.
    site.hidden = false;
    site.inert = true;
    entrance.hidden = true;
    film.hidden = true;
    video.pause();
    // La banda sonora entra cubierta por las nubes, sin mezclarse con el audio del avión.
    document.dispatchEvent(new CustomEvent('invitation:music-start'));
  }
  function complete() {
    if (phase === 'inside') return;
    clearTimers();
    site.hidden = false;
    site.inert = false;
    entrance.hidden = true;
    film.hidden = true;
    clouds.hidden = true;
    clouds.classList.remove('is-active','is-fast');
    cloudStarted = false;
    video.pause();
    document.body.classList.remove('entrance-locked');
    phase = 'inside';
    window.scrollTo({ top: priorScroll, behavior: 'instant' });
    const target = priorFocus && document.contains(priorFocus) ? priorFocus : (site.querySelector('#hero-title') || site);
    if (!target.hasAttribute('tabindex') && !target.matches('a,button')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('invitation:opened'));
  }
  function startClouds(fast = false) {
    if (cloudStarted || !['opening','playing'].includes(phase)) return;
    phase = 'transitioning';
    cloudStarted = true;
    clearTimers();
    if (play) play.hidden = true;
    clouds.hidden = false;
    clouds.classList.remove('is-active', 'is-fast');
    if (fast) clouds.classList.add('is-fast');
    // Forzar un frame intermedio para reiniciar las animaciones en reingresos.
    void clouds.offsetWidth;
    clouds.classList.add('is-active');
    const total = fast ? 1400 : normalCloudMs;
    // El pico de opacidad ocurre antes de mostrar el contenido debajo.
    later(exposeSite, fast ? 640 : 1640);
    later(complete, total + 80);
  }
  function beginVideoPlayback() {
    // Se ejecuta directamente dentro del click, NO en un setTimeout. Así
    // el navegador recibe la acción como una reproducción solicitada por el usuario.
    film.hidden = false;
    video.muted = false;
    video.defaultMuted = false;
    updateSoundUI();
    if (play) play.hidden = true;
    if (error) error.hidden = true;
    const version = ++attemptVersion;
    try { video.currentTime = 0; } catch (_) {}
    let promise;
    try { promise = video.play(); } catch (err) { promise = Promise.reject(err); }
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        if (version !== attemptVersion || !['opening','playing'].includes(phase)) return;
        // Safari, iOS u otros navegadores pueden restringir audio pese al click.
        video.muted = true;
        updateSoundUI();
        let mutedAttempt;
        try { mutedAttempt = video.play(); } catch (err) { mutedAttempt = Promise.reject(err); }
        Promise.resolve(mutedAttempt).catch(() => {
          if (version !== attemptVersion || !['opening','playing'].includes(phase)) return;
          if (play) play.hidden = false;
          if (error) { error.hidden = false; error.textContent = 'Tu navegador requiere tocar Reproducir para iniciar el video. También puedes saltarlo.'; }
        });
      });
    }
  }
  function showFilm() {
    if (phase !== 'opening') return;
    phase = 'playing';
    requestAnimationFrame(() => {
      film.classList.add('is-visible');
      requestAnimationFrame(() => film.classList.add('is-expanded'));
    });
    skip.focus({ preventScroll: true });
    // Respaldo para evitar bloqueos si falla ended o los eventos de tiempo.
    later(() => { if (phase === 'playing') startClouds(); }, 17000);
  }
  open.addEventListener('click', () => {
    if (phase !== 'welcome') return;
    phase = 'opening';
    open.disabled = true;
    entrance.classList.add('is-opening');
    document.dispatchEvent(new CustomEvent('invitation:opening'));
    if (reducedMotion.matches) { complete(); return; }
    beginVideoPlayback(); // Reproducción audible iniciada por gesto directo.
    later(() => { if (phase === 'opening') entrance.classList.add('is-entering'); }, 320);
    later(showFilm, 600);
  });
  video.addEventListener('timeupdate', () => {
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    if (progress) progress.style.width = `${Math.min(100, video.currentTime / duration * 100).toFixed(2)}%`;
    // Las nubes entran cuando faltan aproximadamente 1.7 s de vídeo.
    if (phase === 'playing' && duration - video.currentTime <= 1.78) startClouds();
  });
  video.addEventListener('ended', () => {
    if (['opening','playing'].includes(phase)) startClouds();
  });
  video.addEventListener('error', () => {
    if (!['opening','playing'].includes(phase)) return;
    if (error) { error.hidden = false; error.textContent = 'No se pudo cargar el video. Puedes entrar directamente a la invitación.'; }
    if (play) play.hidden = true;
  });
  skip.addEventListener('click', () => {
    if (['opening','playing'].includes(phase)) startClouds(true);
  });
  play?.addEventListener('click', () => {
    if (!['opening','playing'].includes(phase)) return;
    video.muted = false;
    updateSoundUI();
    const attempt = video.play();
    Promise.resolve(attempt).then(() => { play.hidden = true; if (error) error.hidden = true; skip.focus({ preventScroll: true }); })
      .catch(() => {
        video.muted = true;
        updateSoundUI();
        return video.play().then(() => { play.hidden = true; if (error) error.hidden = true; });
      }).catch(() => { if (error) error.hidden = false; });
  });
  sound?.addEventListener('click', () => {
    if (phase !== 'playing' && phase !== 'opening') return;
    video.muted = !video.muted;
    updateSoundUI();
    if (video.paused && !video.muted) {
      const attempt = video.play();
      Promise.resolve(attempt).catch(() => { video.muted = true; updateSoundUI(); });
    }
  });
  document.getElementById('show-welcome')?.addEventListener('click', () => show(false));
  entrance.addEventListener('keydown', event => {
    if (event.key === 'Tab') { event.preventDefault(); open.focus(); }
  });
  film.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); if (phase === 'playing') startClouds(true); return; }
    if (event.key !== 'Tab' || phase !== 'playing') return;
    const controls = [sound, skip, play && !play.hidden ? play : null].filter(Boolean);
    if (!controls.length) return;
    const index = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[(index + (event.shiftKey ? controls.length - 1 : 1)) % controls.length].focus();
  });
  window.addEventListener('pagehide', () => video.pause());
  show(true);
})();
