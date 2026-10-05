/* 홈 히어로: 한 문항 체험 */
(function () {
  'use strict';
  var demo = document.getElementById('demo');
  if (!demo) return;
  var out = document.getElementById('demoOut');
  var labels = ['전혀 아니다', '아니다', '보통이다', '그렇다', '매우 그렇다'];
  var notes = [
    '거의 보이지 않는 모습이에요.',
    '가끔 보이는 모습이에요.',
    '상황에 따라 달라요.',
    '자주 보이는 모습이에요.',
    '거의 언제나 보이는 모습이에요.'
  ];
  var group = demo.querySelector('.scale');
  var btns = Array.prototype.slice.call(group.querySelectorAll('button'));
  var current = 0;

  function pick(v, focus) {
    current = v;
    btns.forEach(function (b) {
      var on = parseInt(b.getAttribute('data-v'), 10) === v;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    demo.classList.add('answered');
    out.innerHTML = '<b>' + v + '점 · ' + labels[v - 1] + '</b> ' + notes[v - 1] + ' 이렇게 문항마다 숫자 하나만 고르면 돼요.';
  }

  group.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) pick(parseInt(b.getAttribute('data-v'), 10), false);
  });
  group.addEventListener('keydown', function (e) {
    var step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    var next = Math.min(5, Math.max(1, (current || (step > 0 ? 0 : 6)) + step));
    pick(next, true);
  });
})();
