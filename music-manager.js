/* Banda sonora del aniversario. Se autoriza desde el toque de abrir la invitación,
   permanece inaudible durante el vídeo y hace fade-in después del fundido de nubes.
   En iOS y navegadores restrictivos se mantiene el botón manual de reproducción. */
(() => {
  'use strict';
  function init() {
    const music = document.getElementById('music-toggle');
    const audio = document.getElementById('ambient-audio');
    const source = window.INVITATION_CONFIG?.audio;
    if (!music || !audio || !source) return;
    audio.loop = true;
    audio.preload = 'auto';
    audio.src = source;
    music.hidden = false;
    music.disabled = false;
    music.textContent = '♫ Música';
    music.setAttribute('aria-label', 'Activar música del aniversario');
    music.setAttribute('aria-pressed', 'false');
    const Context = window.AudioContext || window.webkitAudioContext;
    let context = null, gain = null, arming = false, armed = false, wantsMusic = true, audible = false;
    let transitionToken = 0;
    function initialiseGraph() {
      if (!Context || context) return;
      try {
        context = new Context();
        const sourceNode = context.createMediaElementSource(audio);
        gain = context.createGain();
        gain.gain.value = 0;
        sourceNode.connect(gain).connect(context.destination);
        audio.volume = 1;
      } catch (_) {
        context = null; gain = null;
        audio.volume = 0;
      }
    }
    function level(target, duration = .8) {
      if (context && gain) {
        try {
          const now = context.currentTime;
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(target, now + duration);
        } catch (_) { gain.gain.value = target; }
      } else {
        audio.volume = target;
      }
    }
    function render() {
      music.disabled = false;
      music.setAttribute('aria-pressed', String(audible && !audio.paused));
      music.textContent = audible && !audio.paused ? '♫ Pausar' : '♫ Música';
      music.setAttribute('aria-label', audible && !audio.paused ? 'Pausar música del aniversario' : 'Activar música del aniversario');
    }
    function arm() {
      // Se invoca *sin await*, directamente desde el click de «Abrir invitación».
      wantsMusic = true;
      armed = false;
      arming = true;
      initialiseGraph();
      level(0, 0);
      try { audio.currentTime = 0; } catch (_) {}
      if (context?.state === 'suspended') context.resume().catch(() => {});
      let promise;
      try { promise = audio.play(); } catch (error) { promise = Promise.reject(error); }
      Promise.resolve(promise).then(() => { armed = true; arming = false; })
        .catch(() => { arming = false; armed = false; });
      render();
    }
    async function begin() {
      // El vídeo ya se ha pausado; el sonido entra cuando se revela la invitación.
      wantsMusic = true;
      if (context?.state === 'suspended') {
        try { await context.resume(); } catch (_) {}
      }
      try { audio.currentTime = 0; } catch (_) {}
      if (audio.paused) {
        try { await audio.play(); } catch (_) {
          // Algunos dispositivos impiden reproducir sin otro gesto: dejar botón activo.
          audible = false;
          render();
          return;
        }
      }
      audible = true;
      level(.76, 1.55);
      render();
    }
    function stop() {
      wantsMusic = false;
      audible = false;
      transitionToken++;
      level(0, 0);
      audio.pause();
      try { audio.currentTime = 0; } catch (_) {}
      render();
    }
    music.addEventListener('click', () => {
      if (audible && !audio.paused) {
        audible = false;
        level(0, .2);
        audio.pause();
        render();
      } else {
        wantsMusic = true;
        if (context?.state === 'suspended') context.resume().catch(() => {});
        let play;
        try { play = audio.play(); } catch (_) { play = Promise.reject(); }
        Promise.resolve(play).then(() => {
          audible = true;
          level(.76, .6);
          render();
        }).catch(() => { audible = false; render(); });
      }
    });
    document.addEventListener('invitation:opening', arm);
    document.addEventListener('invitation:music-start', begin);
    document.addEventListener('invitation:opened', () => {
      // Compatibilidad con movimiento reducido / saltos directos.
      if (!audible && wantsMusic) begin();
    });
    document.addEventListener('invitation:reopened', stop);
    audio.addEventListener('error', () => {
      music.textContent = 'Audio no disponible';
      music.disabled = true;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && audible) {
        level(0, .05);
      } else if (!document.hidden && audible && !audio.paused) {
        if (context?.state === 'suspended') context.resume().catch(() => {});
        level(.76, .5);
      }
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
