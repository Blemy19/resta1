/* Galerías locales: sin dependencias, red ni almacenamiento. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.getElementById('photo-dialog');
  const fullImage = document.getElementById('lightbox-image');
  const imageFrame = document.getElementById('lightbox-frame');
  const caption = document.getElementById('lightbox-caption');
  const close = document.getElementById('close-lightbox');
  const previous = document.getElementById('photo-prev');
  const next = document.getElementById('photo-next');
  let collection = [];
  let current = 0;
  let trigger = null;
  let oldOverflow = '';

  function showPhoto(index) {
    if (!collection.length || !fullImage) return;
    current = (index + collection.length) % collection.length;
    const button = collection[current];
    const thumbnail = button.querySelector('img');
    if (!thumbnail) return;
    fullImage.src = button.dataset.full || thumbnail.getAttribute('src');
    fullImage.alt = thumbnail.alt;
    if (imageFrame) {
      const windowName = button.dataset.photoWindow;
      if (['dance-encuentro', 'dance-pareja'].includes(windowName)) imageFrame.dataset.photoWindow = windowName;
      else delete imageFrame.dataset.photoWindow;
    }
    if (caption) caption.textContent = `${button.dataset.caption || thumbnail.alt} · ${current + 1} / ${collection.length}`;
    if (previous) previous.hidden = collection.length < 2;
    if (next) next.hidden = collection.length < 2;
  }

  if (dialog && fullImage) {
    document.querySelectorAll('[data-lightbox]').forEach(button => {
      button.addEventListener('click', () => {
        trigger = button;
        const group = button.closest('[data-carousel], [data-gallery]');
        collection = group ? [...group.querySelectorAll('[data-lightbox]')] : [button];
        showPhoto(collection.indexOf(button));
        if (!dialog.open) {
          oldOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          dialog.showModal();
        }
        close?.focus();
      });
    });
    close?.addEventListener('click', () => dialog.close());
    previous?.addEventListener('click', () => showPhoto(current - 1));
    next?.addEventListener('click', () => showPhoto(current + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = oldOverflow;
      trigger?.focus({ preventScroll: true });
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;
    const slides = [...track.children];
    const prev = carousel.querySelector('[data-prev]');
    const forward = carousel.querySelector('[data-next]');
    const counter = carousel.querySelector('[data-counter]');
    let active = 0;
    let frame;
    function update() {
      const trackLeft = track.getBoundingClientRect().left;
      let distance = Infinity;
      slides.forEach((slide, index) => {
        const candidate = Math.abs(slide.getBoundingClientRect().left - trackLeft);
        if (candidate < distance) { distance = candidate; active = index; }
      });
      const atStart = track.scrollLeft < 3;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 3;
      if (prev) prev.disabled = atStart;
      if (forward) forward.disabled = atEnd;
      if (counter) counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }
    function move(direction) {
      const target = slides[Math.max(0, Math.min(slides.length - 1, active + direction))];
      if (!target) return;
      const left = target.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
      track.scrollTo({ left, behavior: reduced.matches ? 'instant' : 'smooth' });
    }
    prev?.addEventListener('click', () => move(-1));
    forward?.addEventListener('click', () => move(1));
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    else window.addEventListener('resize', update, { passive: true });
    update();
  });
})();
