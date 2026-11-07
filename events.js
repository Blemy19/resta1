/* Funciones del evento. Sin servicios, claves ni dependencias externas. */
(() => {
  'use strict';
  const init = () => {
    const config = window.INVITATION_CONFIG || {};
    const get = (id) => document.getElementById(id);
    const maps = get('maps-link');
    const mapsNote = get('maps-note');
    const address = [config.address, config.city].filter(Boolean).join(', ');
    let mapsUrl = '';
    if (config.mapsUrl) {
      try {
        const url = new URL(config.mapsUrl);
        if (url.protocol === 'https:' && !url.username && !url.password &&
            /(^|\.)(google\.com|maps\.app\.goo\.gl|goo\.gl)$/.test(url.hostname)) mapsUrl = url.href;
      } catch (_) { /* La dirección permite ofrecer una búsqueda segura. */ }
    }
    if (maps) {
      maps.hidden = !mapsUrl && !address;
      if (mapsUrl || address) {
        maps.href = mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        maps.target = '_blank';
        maps.rel = 'noopener noreferrer';
      }
    }
    if (mapsNote) mapsNote.textContent = mapsUrl
      ? 'Te esperamos para celebrar juntos.'
      : address ? 'Búsqueda por dirección; ubicación exacta aún no verificada.' : 'La ubicación se compartirá próximamente.';

    // Convierte una fecha civil a UTC y comprueba el resultado en la zona IANA.
    // No utiliza la zona del dispositivo ni completa un año ausente.
    const eventInstant = (date) => {
      if (!date || !Number.isInteger(date.year) || date.year < 1970 || date.year > 9999 ||
          !Number.isInteger(date.month) || date.month < 1 || date.month > 12 ||
          !Number.isInteger(date.day) || date.day < 1 || date.day > 31 ||
          !Number.isInteger(date.hour) || date.hour < 0 || date.hour > 23 ||
          !Number.isInteger(date.minute) || date.minute < 0 || date.minute > 59 ||
          typeof date.timeZone !== 'string' || !date.timeZone.trim()) return null;
      try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: date.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
        });
        const partsAt = (value) => Object.fromEntries(formatter.formatToParts(new Date(value))
          .filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]));
        const target = Date.UTC(date.year, date.month - 1, date.day, date.hour, date.minute);
        let candidate = target;
        for (let i = 0; i < 5; i += 1) {
          const parts = partsAt(candidate);
          const projected = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
          const difference = target - projected;
          candidate += difference;
          if (!difference) break;
        }
        const result = partsAt(candidate);
        if (['year', 'month', 'day', 'hour', 'minute'].some((key) => result[key] !== date[key])) return null;
        return candidate;
      } catch (_) { return null; }
    };
    const instant = eventInstant(config.date);
    const status = get('date-status');
    const countdown = get('countdown');
    const calendar = get('calendar-button');
    if (calendar) calendar.hidden = instant === null;
    if (countdown) countdown.hidden = instant === null;
    if (instant === null) {
      if (status) { status.hidden = true; status.textContent = ''; }
    } else {
      let ticker;
      const update = () => {
        const remaining = Math.max(0, Math.floor((instant - Date.now()) / 1000));
        const units = { days: Math.floor(remaining / 86400), hours: Math.floor(remaining / 3600) % 24,
          minutes: Math.floor(remaining / 60) % 60, seconds: remaining % 60 };
        if (countdown) Object.entries(units).forEach(([unit, value]) => {
          const field = countdown.querySelector(`[data-unit="${unit}"]`);
          if (field) field.textContent = String(value).padStart(2, '0');
        });
        if (status) { status.hidden = true; status.textContent = ''; }
        if (!remaining && ticker) clearInterval(ticker);
      };
      update();
      if (instant > Date.now()) ticker = setInterval(update, 1000);
      const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
      const escape = (text) => String(text || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
      // RFC 5545: plegado en un máximo de 75 octetos por línea.
      const fold = (line) => {
        const encoder = new TextEncoder();
        let output = ''; let length = 0;
        for (const character of line) {
          const bytes = encoder.encode(character).length;
          if (length + bytes > 75) { output += '\r\n '; length = 1; }
          output += character; length += bytes;
        }
        return output;
      };
      if (calendar) calendar.addEventListener('click', () => {
        const title = `Aniversario de ${config.restaurantName || 'Ají Soltero'}`;
        const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invitacion Restaurante//ES', 'CALSCALE:GREGORIAN',
          'BEGIN:VEVENT', `UID:invitacion-${instant}@restaurante.local`, `DTSTAMP:${stamp(new Date())}`,
          `DTSTART:${stamp(new Date(instant))}`, `SUMMARY:${escape(title)}`, `LOCATION:${escape(address)}`,
          `DESCRIPTION:${escape('Invitación al aniversario del restaurante. Consulta la invitación para los detalles actualizados.')}`,
          'END:VEVENT', 'END:VCALENDAR'].map(fold).join('\r\n') + '\r\n';
        const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url; link.download = 'aniversario-aji-soltero.ics';
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    }

    const phone = typeof config.whatsapp === 'string' ? config.whatsapp.trim() : '';
    const validPhone = /^[1-9]\d{7,14}$/.test(phone);
    const rsvp = get('rsvp-link');
    if (rsvp) {
      rsvp.hidden = !validPhone;
      if (validPhone) {
        rsvp.href = `https://wa.me/${phone}?text=${encodeURIComponent('Hola, quiero confirmar mi asistencia al aniversario de Ají Soltero.')}`;
        rsvp.target = '_blank'; rsvp.rel = 'noopener noreferrer';
      }
    }
    if (get('rsvp-note')) { get('rsvp-note').hidden = !validPhone; get('rsvp-note').textContent = validPhone ? 'Confirma tu asistencia por WhatsApp.' : ''; }

    const gift = get('gift-button');
    const giftMessage = get('gift-message');
    if (gift && giftMessage) gift.addEventListener('click', () => {
      const expanded = gift.getAttribute('aria-expanded') !== 'true';
      gift.setAttribute('aria-expanded', String(expanded));
      gift.setAttribute('aria-label', expanded ? 'Cerrar regalo sorpresa' : 'Abrir regalo sorpresa');
      giftMessage.hidden = !expanded;
    });

    // La música del aniversario se gestiona en music-manager.js para sincronizarse con el vídeo.

  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
