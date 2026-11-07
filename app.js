/* Integración de contenido y animaciones; bienvenida y galerías viven en sus módulos. */
(() => {
  'use strict';
  const config = window.INVITATION_CONFIG || {};
  const clean = v => typeof v === 'string' ? v.trim() : '';
  document.querySelectorAll('[data-config]').forEach(node => {
    const value = clean(config[node.dataset.config]);
    if (value) node.textContent = value;
  });
  if (clean(config.honoree)) document.querySelector('#honoree').hidden = false;
  // Decorative date details follow the same editable labels as the event.
  const day = document.querySelector('[data-event-day]');
  const month = document.querySelector('[data-event-month]');
  if (day) day.textContent = String(config.date?.day || '23');
  if (month && Number.isInteger(config.date?.month)) {
    month.textContent = new Intl.DateTimeFormat('es', {month:'short',timeZone:'UTC'})
      .format(new Date(Date.UTC(2000, config.date.month - 1, 1))).replace('.', '').toUpperCase();
  }
  document.title = `Aniversario de ${clean(config.restaurantName) || 'Ají Soltero'} · Invitación`;
  const safeImage = src => {
    try { if (/^data:image\/(?:webp|jpeg|png|gif);base64,[a-z0-9+/=]+$/i.test(src)) return src; const url = new URL(src, document.baseURI); return ['file:', 'http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  };
  const setPhoto = (img, photo) => {
    if (!photo) return;
    const source = safeImage(photo.src);
    if (!source) return;
    img.alt = img.closest('[aria-hidden="true"]') ? '' : clean(photo.alt);
    if (Number.isInteger(photo.width) && photo.width > 0) img.width = photo.width;
    if (Number.isInteger(photo.height) && photo.height > 0) img.height = photo.height;
    const trigger = img.closest('[data-lightbox]');
    if (trigger && ['dance-encuentro', 'dance-pareja'].includes(photo.window)) trigger.dataset.photoWindow = photo.window;
    img.addEventListener('error', () => {
      const button = img.closest('[data-lightbox]');
      if (button) { button.disabled = true; button.title = 'Fotografía no disponible'; }
      img.alt = 'Fotografía no disponible. Revisa la ruta en config.js.';
    });
    img.src = source;
  };
  document.querySelectorAll('[data-photo]').forEach(img => setPhoto(img, config.photos?.[img.dataset.photo]));
  document.querySelectorAll('[data-photo-group]').forEach(img => {
    setPhoto(img, config.photos?.[img.dataset.photoGroup]?.[Number(img.dataset.photoIndex)]);
  });
  document.querySelectorAll('[data-photo-list]').forEach(track => {
    (config.photos?.[track.dataset.photoList] || []).forEach((photo, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'photo-card';
      button.dataset.lightbox = ''; button.dataset.caption = clean(photo.title); button.setAttribute('aria-label', `Ampliar: ${clean(photo.alt)}`);
      const img = document.createElement('img'); img.loading = 'lazy'; img.decoding = 'async'; setPhoto(img, photo);
      const caption = document.createElement('span'); caption.className = 'photo-caption';
      const number = document.createElement('small'); number.textContent = String(index + 1).padStart(2,'0');
      const title = document.createElement('span'); title.textContent = clean(photo.title);
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
      caption.append(number,title,arrow); button.append(img,caption); track.append(button);
    });
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('js-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('is-visible'); observer.unobserve(entry.target);}
    }), {threshold:.05});
    document.querySelectorAll('[data-reveal]').forEach(node => observer.observe(node));
  }
})();
