/* Escenas 2.5D: fotografías en capas CSS, perspectiva y desplazamiento nativo.
   Un rAF por lote de eventos; sin bucle continuo, WebGL, dependencias ni red. */
(() => {
  'use strict';
  const init = () => {
    window.InvitationScenes?.destroy?.();
    const settings = window.INVITATION_CONFIG?.scenes || {};
    const elements = [...document.querySelectorAll('[data-scene]')];
    if (settings.enabled === false || !elements.length || !window.CSS?.supports('perspective', '1000px')) return;
    const body = document.body;
    const content = document.getElementById('site-content');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const precise = matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
    const pinnedLayout = matchMedia('(min-width: 900px) and (min-height: 650px)');
    const scenes = elements.map(element => ({ element, top: 0, height: 1, active: false, p: null, x: 0, y: 0 }));
    const lookup = new Map(scenes.map(scene => [scene.element, scene]));
    const removers = [];
    let frame = 0;
    let layoutDirty = true;
    let viewportHeight = innerHeight;
    let opened = !content || (!content.hidden && !content.inert);
    let destroyed = false;
    let pointerScene = null;
    let pointerX = 0;
    let pointerY = 0;
    let intersection;
    let resize;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const listen = (target, name, handler, options) => {
      target.addEventListener(name, handler, options);
      removers.push(() => target.removeEventListener(name, handler, options));
    };
    const listenMedia = (query, handler) => {
      if (query.addEventListener) listen(query, 'change', handler);
      else { query.addListener(handler); removers.push(() => query.removeListener(handler)); }
    };
    const setPointer = (scene, x, y) => {
      if (scene.x === x && scene.y === y) return;
      scene.x = x; scene.y = y;
      scene.element.style.setProperty('--pointer-x', x.toFixed(4));
      scene.element.style.setProperty('--pointer-y', y.toFixed(4));
    };
    const resetPointer = () => {
      pointerScene = null; pointerX = 0; pointerY = 0;
      scenes.forEach(scene => setPointer(scene, 0, 0));
    };
    const canAnimate = () => !destroyed && opened && !document.hidden && !reduced.matches && !!intersection;
    const cancel = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
    const render = () => {
      frame = 0;
      if (!canAnimate()) return;
      const scroll = window.scrollY;
      const refreshAll = layoutDirty;
      // Leer geometría únicamente cuando cambia el diseño, antes de escribir estilos.
      if (layoutDirty) {
        viewportHeight = innerHeight;
        scenes.forEach(scene => {
          const rect = scene.element.getBoundingClientRect();
          scene.top = rect.top + scroll;
          scene.height = rect.height || 1;
        });
        layoutDirty = false;
      }
      scenes.forEach(scene => {
        if (!scene.active && !refreshAll) return;
        const top = scene.top - scroll;
        const pinned = scene.element.hasAttribute('data-scene-pinned') && pinnedLayout.matches;
        const raw = pinned && scene.height > viewportHeight
          ? -top / (scene.height - viewportHeight)
          : (viewportHeight - top) / (scene.height + viewportHeight);
        const progress = Math.round(clamp(raw, 0, 1) * 10000) / 10000;
        if (progress !== scene.p) {
          scene.element.style.setProperty('--scene-p', progress.toFixed(4));
          scene.element.style.setProperty('--scene-q', (progress * 2 - 1).toFixed(4));
          scene.element.dataset.sceneStep = String(Math.min(2, Math.floor(progress * 3)));
          scene.p = progress;
        }
        const usePointer = scene === pointerScene && precise.matches && settings.pointer !== false;
        setPointer(scene, usePointer ? pointerX : 0, usePointer ? pointerY : 0);
      });
    };
    const request = () => { if (!frame && canAnimate()) frame = requestAnimationFrame(render); };
    const refresh = () => { layoutDirty = true; request(); };
    const sync = () => {
      // La pestaña oculta pausa el trabajo, conservando la geometría del tramo sticky.
      const enabled = !destroyed && opened && !reduced.matches && !!intersection;
      body.classList.toggle('scene-motion', enabled);
      if (enabled && !document.hidden) refresh();
      else { cancel(); resetPointer(); }
    };
    const destroy = () => {
      destroyed = true;
      cancel();
      intersection?.disconnect(); resize?.disconnect();
      removers.forEach(remove => remove());
      body.classList.remove('scenes-ready', 'scene-motion');
      scenes.forEach(({ element }) => {
        delete element.dataset.sceneStep;
        ['--scene-p', '--scene-q', '--pointer-x', '--pointer-y'].forEach(property => element.style.removeProperty(property));
      });
      if (window.InvitationScenes?.destroy === destroy) delete window.InvitationScenes;
    };
    window.InvitationScenes = { refresh, destroy };
    body.classList.add('scenes-ready');
    scenes.forEach(({ element }) => {
      element.style.setProperty('--scene-p', '.5');
      element.style.setProperty('--scene-q', '0');
      element.style.setProperty('--pointer-x', '0');
      element.style.setProperty('--pointer-y', '0');
    });
    // Sin IO se conserva una composición completamente estática y legible.
    if (!('IntersectionObserver' in window)) return;
    intersection = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const scene = lookup.get(entry.target);
        if (scene) scene.active = entry.isIntersecting;
      });
      request();
    }, { rootMargin: '200px 0px', threshold: 0 });
    scenes.forEach(scene => intersection.observe(scene.element));
    if ('ResizeObserver' in window) {
      resize = new ResizeObserver(refresh);
      resize.observe(content || body);
      scenes.forEach(scene => resize.observe(scene.element));
    }
    listen(window, 'scroll', request, { passive: true });
    listen(window, 'resize', refresh, { passive: true });
    // Captura load también para imágenes lazy; evita posiciones obsoletas aguas abajo.
    listen(content || document, 'load', event => { if (event.target.tagName === 'IMG') refresh(); }, true);
    listen(document, 'invitation:opened', () => { opened = true; sync(); });
    listen(document, 'invitation:reopened', () => { opened = false; sync(); });
    listen(document, 'visibilitychange', sync);
    listenMedia(reduced, sync);
    listenMedia(precise, () => { resetPointer(); refresh(); });
    listenMedia(pinnedLayout, refresh);
    if (settings.pointer !== false) {
      listen(window, 'pointermove', event => {
        if (!canAnimate() || !precise.matches || event.pointerType === 'touch') return;
        const target = event.target.closest?.('[data-scene]');
        const nextScene = lookup.get(target) || null;
        if (pointerScene && pointerScene !== nextScene) setPointer(pointerScene, 0, 0);
        pointerScene = nextScene;
        pointerX = clamp(event.clientX / Math.max(innerWidth, 1) * 2 - 1, -1, 1);
        pointerY = clamp(event.clientY / Math.max(innerHeight, 1) * 2 - 1, -1, 1);
        request();
      }, { passive: true });
      listen(document.documentElement, 'pointerleave', () => { resetPointer(); });
      listen(window, 'blur', resetPointer);
    }
    document.fonts?.ready.then(() => { if (!destroyed) refresh(); });
    sync();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
