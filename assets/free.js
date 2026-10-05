/* 무료 간이 설문: 5개 영역 × 3문항, 브라우저 안에서만 계산 (저장·전송 없음) */
(function () {
  'use strict';
  var D = window.FREE;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var items = [];
  D.areas.forEach(function (a) { a.items.forEach(function (i) { items.push({ code: i.code, area: a }); }); });
  var TOTAL = items.length;
  var state = {};

  function renderQuiz() {
    var h = '<div class="sticky"><div class="sticky-in"><div class="track"><i id="trackFill"></i></div><div class="sticky-count" id="stickyCount">0 / ' + TOTAL + '</div></div></div>';
    D.areas.forEach(function (a) {
      h += '<div class="domain-card"><div class="domain-name">' + esc(a.name) + (a.self ? '<span class="area-self">부모님 본인의 모습으로 답해요</span>' : '') + '</div>';
      a.items.forEach(function (it) {
        var btns = '';
        for (var v = 1; v <= 5; v++) btns += '<button type="button" role="radio" aria-checked="false" aria-label="' + v + '점 ' + esc(D.scale[v - 1]) + '" data-val="' + v + '">' + v + '</button>';
        h += '<div class="item-row" data-code="' + it.code + '"><div class="item-label">' + esc(it.label) + '</div><div class="item-prompt">' + esc(it.text) + '</div>' +
          '<div class="scale-labels" aria-hidden="true"><span>' + esc(D.scale[0]) + '</span><span>' + esc(D.scale[4]) + '</span></div>' +
          '<div class="dichotomy" role="radiogroup" aria-label="' + esc(it.label) + '">' + btns + '</div></div>';
      });
      h += '</div>';
    });
    h += '<div class="submit-row"><p class="progress-note" id="progressNote"></p><button type="button" class="btn-primary" id="submitBtn">결과 보기</button></div>';
    $('quiz').innerHTML = h;
    $('quiz').addEventListener('click', function (e) {
      var b = e.target.closest('.dichotomy button');
      if (!b) return;
      var code = b.closest('.item-row').getAttribute('data-code');
      state[code] = parseInt(b.getAttribute('data-val'), 10);
      paint(code);
      progress();
      advance(code);
    });
    $('submitBtn').addEventListener('click', onSubmit);
  }

  function paint(code) {
    var row = document.querySelector('.item-row[data-code="' + code + '"]');
    if (!row) return;
    [].forEach.call(row.querySelectorAll('.dichotomy button'), function (b) {
      var on = parseInt(b.getAttribute('data-val'), 10) === state[code];
      b.classList.toggle('selected', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function answered() { return items.filter(function (i) { return state[i.code]; }).length; }
  function progress() {
    var n = answered();
    $('trackFill').style.width = (n / TOTAL * 100) + '%';
    $('stickyCount').textContent = n + ' / ' + TOTAL;
    $('progressNote').textContent = n + ' / ' + TOTAL + ' 문항 완료';
    $('submitBtn').style.opacity = n < TOTAL ? '.55' : '';
  }
  function advance(code) {
    var idx = -1, next = null, i;
    for (i = 0; i < items.length; i++) { if (items[i].code === code) { idx = i; break; } }
    for (i = idx + 1; i < items.length; i++) { if (!state[items[i].code]) { next = items[i]; break; } }
    if (!next) return;
    var row = document.querySelector('.item-row[data-code="' + next.code + '"]');
    setTimeout(function () {
      var r = row.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.68) window.scrollTo({ top: window.pageYOffset + r.top - window.innerHeight * 0.3, behavior: reduceMotion ? 'auto' : 'smooth' });
    }, 180);
  }
  function toast(msg) {
    var box = $('toastBox');
    box.innerHTML = '<div class="toast" role="status"><span>' + esc(msg) + '</span></div>';
    setTimeout(function () { box.innerHTML = ''; }, 3000);
  }

  function onSubmit() {
    var miss = null;
    for (var i = 0; i < items.length; i++) { if (!state[items[i].code]) { miss = items[i]; break; } }
    if (miss) {
      var row = document.querySelector('.item-row[data-code="' + miss.code + '"]');
      row.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      row.style.outline = '3px solid #D9A441';
      row.style.outlineOffset = '3px';
      setTimeout(function () { row.style.outline = ''; row.style.outlineOffset = ''; }, 1800);
      toast('아직 답하지 않은 문항이 ' + (TOTAL - answered()) + '개 있어요.');
      return;
    }
    showResult();
  }

  function levelOf(pct) { return pct >= D.thresholds.high ? 'high' : pct >= D.thresholds.mid ? 'mid' : 'low'; }

  function compute() {
    return D.areas.map(function (a) {
      var sum = 0;
      a.items.forEach(function (it) { sum += state[it.code]; });
      var avg = sum / a.items.length;
      var pct = Math.round(avg / 5 * 100);
      return { area: a, avg: avg, pct: pct, level: levelOf(pct) };
    });
  }

  function showResult() {
    var res = compute();
    var low = res[0];
    res.forEach(function (r) { if (r.pct < low.pct) low = r; });
    var allHigh = res.every(function (r) { return r.level === 'high'; });

    var h = '<div class="report-card"><div class="report-header"><div class="report-eyebrow">무료 간이 설문</div><h2>지금 우리 집 모습, 한눈에 보기</h2>' +
      '<div class="report-meta"><span>문항수 <b>' + TOTAL + '문항</b></span><span>영역 <b>' + D.areas.length + '개</b></span></div></div>' +
      '<div class="report-body">' +
      '<div class="report-section"><div class="report-section-head"><span class="roman">I.</span><h3>영역별 한눈에 보기</h3></div>';
    res.forEach(function (r) {
      h += '<div class="unit"><div class="bar-labels"><span class="lbl-left">' + esc(r.area.name) + '</span><span class="lbl-right"><span class="sense-chip lv-s-' + r.level + '">' + esc(D.levelLabels[r.level]) + '</span><b>' + r.pct + '%</b></span></div>' +
        '<div class="bar-track" role="img" aria-label="' + esc(r.area.name) + ' ' + r.pct + '%"><div class="bar-fill f-s-' + r.level + '" style="width:' + r.pct + '%"></div><div class="bar-marker" style="left:' + r.pct + '%"></div></div>' +
        '<p class="unit-text">' + esc(D.lines[r.area.key][r.level]) + '</p></div>';
    });
    h += '</div><div class="report-section"><div class="report-section-head"><span class="roman">II.</span><h3>다음으로 해보면 좋은 진단</h3></div>';

    if (allHigh) {
      h += '<div class="reco"><h4>모든 영역이 고르게 자라고 있어요</h4><p>전체 모습을 한 번에 정리해 보고 싶다면 종합 진단을 권해요. ' + esc(D.surveys.main.tagline) + '.</p>' +
        '<div class="row"><a class="btn-primary" href="p/main.html">' + esc(D.surveys.main.title) + ' 보기</a></div></div>';
    } else {
      var sv = D.surveys[low.area.survey];
      h += '<div class="reco"><h4>먼저 살펴보면 좋은 영역은 「' + esc(low.area.name) + '」예요</h4><p>' + esc(sv.title) + ' — ' + esc(sv.tagline) + '.</p>' +
        '<div class="row"><a class="btn-primary" href="p/' + low.area.survey + '.html">' + esc(sv.title) + ' 보기</a>' +
        '<a class="btn-outline" href="p/main.html">종합 진단 보기</a></div></div>';
    }
    h += '</div></div><div class="report-footer"><div class="result-actions">' +
      '<button type="button" class="btn-outline" id="againBtn">다시 해보기</button>' +
      '<a class="btn-outline" style="text-decoration:none;display:inline-flex;align-items:center" href="index.html#diagnoses">진단 6종 모두 보기</a></div>' +
      '<p class="pl">이 결과는 이 화면에서만 계산되었고, 어디에도 저장되지 않았어요.</p></div></div>' +
      '<p class="result-note">' + esc(D.disclaimer) + '</p>';

    $('toastBox').innerHTML = '';
    $('intro').hidden = true;
    $('quiz').hidden = true;
    $('result').hidden = false;
    $('result').innerHTML = h;
    window.scrollTo(0, 0);
    $('againBtn').addEventListener('click', function () {
      state = {};
      items.forEach(function (i) { paint(i.code); });
      progress();
      $('result').hidden = true;
      $('quiz').hidden = false;
      window.scrollTo(0, 0);
    });
  }

  renderQuiz();
  progress();
  $('startBtn').addEventListener('click', function () {
    $('intro').hidden = true;
    $('quiz').hidden = false;
    window.scrollTo(0, 0);
  });
})();
