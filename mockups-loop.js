// Animaciones en bucle de las maquetas: lista de la compra, batch cooking
// y el anillo de calorías. Solo visuales, no hay app real detrás.
// Respeta prefers-reduced-motion: si el usuario lo pide, se queda con el
// estado estático que ya trae el HTML.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Punto de millar manual (coincide con "2.120" ya escrito en el HTML;
  // toLocaleString('es-ES') no pone el punto por debajo de 10.000).
  function fmt(n) {
    n = Math.round(n);
    return n >= 1000 ? String(n).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') : String(n);
  }

  function loopChecklist(mockSelector, opts) {
    var mock = document.querySelector(mockSelector);
    if (!mock) return;
    var items = [].slice.call(mock.querySelectorAll('.mk-buy'));
    if (!items.length) return;
    opts = opts || {};
    var progEl = opts.progressBar ? mock.querySelector(opts.progressBar) : null;
    var statEl = opts.statText ? mock.querySelector(opts.statText) : null;

    function setState(doneCount) {
      items.forEach(function (it, i) { it.classList.toggle('done', i < doneCount); });
      if (progEl) progEl.style.width = Math.round((doneCount / items.length) * 100) + '%';
      if (statEl && opts.statTemplate) statEl.textContent = opts.statTemplate(doneCount, items.length);
    }

    var i = 0, dir = 1;
    setState(0);
    function tick() {
      i += dir;
      if (i > items.length) { i = items.length; dir = -1; setTimeout(tick, 1700); return; }
      if (i < 0) { i = 0; dir = 1; setTimeout(tick, 900); return; }
      setState(i);
      setTimeout(tick, dir > 0 ? 650 : 220);
    }
    setTimeout(tick, 900);
  }

  function loopCalories() {
    var hero = document.querySelector('.hero-phone .mock');
    if (!hero) return;
    var circle = hero.querySelector('.mk-ring svg circle:nth-child(2)');
    var kcalText = hero.querySelector('.mk-rn');
    var leftText = hero.querySelector('.mk-left');
    var consumedStat = hero.querySelectorAll('.mk-stat b')[0];
    var rows = [].slice.call(hero.querySelectorAll('.mk-meal'));
    if (!circle || !rows.length) return;

    var target = 2120;
    var circumference = 339;
    // kcal reales de las dos comidas que se muestran en "Mi día"
    var amounts = [320, 720];

    function render(sum) {
      var pct = Math.min(1, sum / target);
      circle.setAttribute('stroke-dasharray', (pct * circumference).toFixed(0) + ' ' + circumference);
      if (kcalText) kcalText.textContent = fmt(sum);
      if (consumedStat) consumedStat.textContent = fmt(sum);
      if (leftText) leftText.textContent = 'Te quedan ' + fmt(target - sum) + ' kcal';
    }

    rows.forEach(function (r) { r.style.opacity = '0.18'; });

    var state = 0;
    function tick() {
      if (state === 0) { render(0); rows[0].style.opacity = '0.18'; if (rows[1]) rows[1].style.opacity = '0.18'; }
      else if (state === 1) { render(amounts[0]); rows[0].style.opacity = '1'; if (rows[1]) rows[1].style.opacity = '0.18'; }
      else { render(amounts[0] + amounts[1]); rows[0].style.opacity = '1'; if (rows[1]) rows[1].style.opacity = '1'; }
      var wait = state === 2 ? 2300 : 1100;
      state = (state + 1) % 3;
      setTimeout(tick, wait);
    }
    tick();
  }

  // Lista de la compra: tiene el "X en la cesta" + barra de progreso
  loopChecklist('.band .mock.m-l', {
    progressBar: '.mk-prog i',
    statText: '.mk-stat span',
    statTemplate: function (d, t) { return d + ' de ' + t + ' en la cesta'; },
  });
  // Batch cooking: solo los checkboxes de las dos sesiones, sin stat propio
  loopChecklist('.band-dark .mock.m-r');
  loopCalories();
})();
