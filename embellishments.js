/* Interacciones de la edición especial (no recolectan datos ni dependen de servicios externos). */
(() => {
  'use strict';
  const toTop = document.getElementById('to-top');
  const progress = document.getElementById('scroll-progress');
  const welcome = document.getElementById('welcome-screen');
  let queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.width = (max > 0 ? Math.min(100,Math.max(0,scrollY / max * 100)) : 0) + '%';
      if (toTop) toTop.hidden = !welcome?.hidden || scrollY < 650;
      queued = false;
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  document.addEventListener('invitation:opened',onScroll);
  document.addEventListener('invitation:reopened',()=>{
    if (toTop) toTop.hidden = true;
    if (progress) progress.style.width = '0%';
  });
  toTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  onScroll();
  const cheers = document.getElementById('toast-button');
  const phrase = document.getElementById('toast-phrase');
  const phrases = ['¡Por esta noche y todos los buenos recuerdos!','Por la alegría de reunirnos alrededor de la mesa.','Por los instantes que se vuelven inolvidables.','¡Que nunca falten motivos para celebrar!'];
  let i=0;
  cheers?.addEventListener('click',()=>{
    if (phrase) phrase.textContent = phrases[i++ % phrases.length];
    cheers.classList.remove('cheers');
    void cheers.offsetWidth;
    cheers.classList.add('cheers');
  });
})();
