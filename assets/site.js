/* 사이트 공통 스크립트: config.js 의 값을 화면에 채워 넣는다 */
(function () {
  'use strict';
  var C = window.GEL_CONFIG || {};
  var BIZ = C.BIZ || {};

  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // 모바일 메뉴
  var hd = document.querySelector('.site-header');
  var mb = document.querySelector('.menu-btn');
  if (hd && mb) {
    mb.addEventListener('click', function () {
      var open = hd.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      mb.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    all('#nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        hd.classList.remove('open');
        mb.setAttribute('aria-expanded', 'false');
        mb.setAttribute('aria-label', '메뉴 열기');
      });
    });
  }

  // 카카오톡 채널 링크 (설정 전에는 숨김)
  all('[data-kakao]').forEach(function (a) {
    if (C.KAKAO_CHANNEL_URL) {
      a.href = C.KAKAO_CHANNEL_URL;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.hidden = true;
    }
  });

  // 사업자 정보 (푸터)
  var email = BIZ.email || C.CONTACT_EMAIL || '';
  var bizFormat = {
    name: function (v) { return v; },
    owner: function (v) { return '대표 ' + v; },
    regNo: function (v) { return '사업자등록번호 ' + v; },
    mailOrderNo: function (v) { return '통신판매업 신고번호 ' + v; },
    address: function (v) { return v; },
    phone: function (v) { return '전화 ' + v; },
    email: function (v) { return '이메일 ' + v; }
  };
  all('[data-biz]').forEach(function (el) {
    var k = el.getAttribute('data-biz');
    var v = k === 'email' ? email : BIZ[k];
    if (k === 'name' && !v) v = 'Growth Edu Lab 학습연구소';
    if (v) el.textContent = bizFormat[k](v);
    else el.hidden = true;
  });
  // 약관·방침 본문 안의 값
  all('[data-biz-inline]').forEach(function (el) {
    var k = el.getAttribute('data-biz-inline');
    var v = k === 'email' ? email : BIZ[k];
    if (v) el.textContent = v;
  });

  // 링크 유효 시간 · 보관 기간 (표시용)
  all('[data-hours]').forEach(function (el) { el.textContent = String(C.LINK_VALID_HOURS || 24); });
  all('[data-retention]').forEach(function (el) { el.textContent = String(C.DATA_RETENTION_DAYS || 90); });

  // 가격
  all('[data-price]').forEach(function (el) {
    var p = Number((C.PRICE || {})[el.getAttribute('data-price')]);
    if (p > 0) el.textContent = p.toLocaleString('ko-KR');
  });
  all('[data-price-box]').forEach(function (box) {
    var p = Number((C.PRICE || {})[box.getAttribute('data-price-box')]);
    if (!(p > 0)) {
      box.classList.add('unset');
      box.textContent = '가격 준비 중';
    }
  });

  // 결제 버튼
  all('[data-pay]').forEach(function (a) {
    var url = (C.PAY_URL || {})[a.getAttribute('data-pay')];
    if (url) {
      a.href = url;
    } else {
      a.setAttribute('aria-disabled', 'true');
      a.removeAttribute('href');
      a.textContent = '결제 링크 준비 중';
    }
  });

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
