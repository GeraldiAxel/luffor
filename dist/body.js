/* The inspected concept: choosing a decision moves the crop (and its outline on the whole screen)
   to that part of the interface. data-crop is "x,y,size" in the artwork's 1280 x 800 coordinates.
   Without JavaScript the first crop and all three descriptions are still shown. */
(() => {
  'use strict';
  document.querySelectorAll('[data-inspect]').forEach(root => {
    const controls = [...root.querySelectorAll('[data-crop]')];
    root.addEventListener('click', event => {
      const chosen = event.target.closest('[data-crop]');
      if (!chosen) return;
      const [x, y, size] = chosen.dataset.crop.split(',');
      root.style.setProperty('--cx', x); root.style.setProperty('--cy', y); root.style.setProperty('--cw', size);
      controls.forEach(control => control.setAttribute('aria-pressed', String(control === chosen)));
    });
  });
})();
