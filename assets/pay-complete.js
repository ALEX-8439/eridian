/* 결제 완료 화면: 휴대폰 번호를 받아 개인 링크(카카오톡·문자) 발송을 요청한다
 * 결제대행사의 "결제 완료 후 이동 주소"가  pay-complete.html?item=<진단ID>&k=<확인키>[&order=<주문번호>]  형태여야 한다.
 */
(function () {
  'use strict';
  var C = window.GEL_CONFIG || {};
  var CAT = window.GEL_CATALOG || {};
  var $ = function (id) { return document.getElementById(id); };

  var q = new URLSearchParams(location.search);
  var item = q.get('item') || '';
  var key = q.get('k') || '';
  var order = q.get('order') || q.get('orderId') || q.get('order_id') || '';
  var info = CAT[item];

  function view(name) {
    ['vIdle', 'vBad', 'vDone'].forEach(function (id) { $(id).hidden = id !== name; });
    window.scrollTo(0, 0);
  }

  if (!info || !key) { view('vBad'); return; }

  // 진단 이름 표시
  var chip = $('itemChip');
  chip.hidden = false;
  chip.style.setProperty('--c', info.color);
  $('itemName').textContent = info.title;

  var phoneEl = $('phone');
  var agreeEl = $('agree');
  var submitBtn = $('submitBtn');
  var sending = false;
  var lastDigits = '';
  var timer = null;

  function digits(s) { return String(s).replace(/\D+/g, ''); }
  function format(d) {
    d = d.slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
    if (d.length === 10 && d.slice(0, 3) !== '010') return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  }
  function mask(d) { return d.slice(0, 3) + '-****-' + d.slice(-4); }
  function validPhone(d) { return /^01[016789]\d{7,8}$/.test(d); }

  phoneEl.addEventListener('input', function () {
    phoneEl.value = format(digits(phoneEl.value));
    $('phoneErr').hidden = true;
    $('formErr').hidden = true;
  });
  agreeEl.addEventListener('change', function () { $('agreeErr').hidden = true; });

  function showErr(msg) {
    var el = $('formErr');
    el.textContent = msg;
    el.hidden = false;
  }

  var MESSAGES = {
    'invalid-key': '결제 확인 주소가 올바르지 않아요. 카카오톡 채널로 문의해 주세요.',
    'invalid-phone': '휴대폰 번호를 다시 확인해 주세요.',
    'consent': '개인정보 수집·이용에 동의해야 링크를 보내드릴 수 있어요.',
    'rate-limit': '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.',
    'resend-limit': '이 번호로 보낼 수 있는 횟수를 모두 사용했어요. 카카오톡 채널로 문의해 주세요.',
    'daily-limit': '오늘 발송 가능한 횟수를 넘었어요. 카카오톡 채널로 문의해 주세요.',
    'send-failed': '링크를 보내지 못했어요. 번호를 확인해 다시 시도하거나, 카카오톡 채널로 문의해 주세요.',
    'closed': '지금은 링크 발송을 받지 않고 있어요. 카카오톡 채널로 문의해 주세요.',
    'busy': '지금 요청이 몰려 있어요. 잠시 후 다시 시도해 주세요.'
  };

  function request(digitsValue, isResend) {
    return fetch(C.GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'issue', survey: item, k: key, phone: digitsValue, order: order, consent: true, resend: !!isResend })
    }).then(function (r) { return r.json(); });
  }

  // note: 다시 받기에 실패했을 때 남겨 둘 안내 문구 (카운트다운 문구 앞에 함께 보여준다)
  function startCooldown(sec, note) {
    var btn = $('resendBtn');
    var hint = $('resendHint');
    clearInterval(timer);
    btn.disabled = true;
    var left = sec;
    function tick() {
      if (left <= 0) {
        clearInterval(timer);
        btn.disabled = false;
        hint.textContent = note || '링크가 오지 않았다면 다시 받을 수 있어요.';
        return;
      }
      hint.textContent = (note ? note + ' ' : '') + left + '초 뒤에 다시 받을 수 있어요.';
      left -= 1;
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  // 다시 시도해도 소용없는 오류: 버튼을 잠그고 안내만 남긴다
  var FINAL = { 'resend-limit': 1, 'daily-limit': 1, 'closed': 1, 'invalid-key': 1, 'consent': 1 };
  function resendFailed(code, msg) {
    if (FINAL[code]) {
      clearInterval(timer);
      $('resendBtn').disabled = true;
      $('resendHint').textContent = msg;
    } else {
      startCooldown(30, msg);
    }
  }

  function showDone(d, d10) {
    var hours = String(C.LINK_VALID_HOURS || 24);
    if (d.status === 'pending') {
      $('doneTitle').textContent = '접수되었어요';
      $('doneText').textContent = '결제 내역을 확인한 뒤 ' + mask(d10) + ' 번호로 링크를 보내드려요. 잠시만 기다려 주세요.';
      $('doneNote').textContent = '오래 걸리면 카카오톡 채널로 결제하신 진단 이름과 함께 문의해 주세요.';
      $('resendBox').hidden = true;
    } else {
      var how = d.channel === '알림톡' ? '카카오톡으로' : '문자로';
      $('doneTitle').textContent = '링크를 보냈어요';
      $('doneText').textContent = mask(d10) + ' 번호로 ' + how + ' 「' + info.title + '」 링크를 보냈어요.';
      $('doneNote').textContent = '링크는 지금부터 ' + hours + '시간 동안 열려요. 메시지 안의 링크를 눌러 시작해 주세요.';
      $('resendBox').hidden = false;
      startCooldown(60);
    }
    view('vDone');
  }

  function handle(promise, d10, isResend) {
    sending = true;
    submitBtn.disabled = true;
    submitBtn.textContent = '보내는 중이에요…';
    $('resendBtn').disabled = true;
    promise.then(function (d) {
      if (d && d.ok) {
        showDone(d, d10);
      } else {
        var msg = MESSAGES[d && d.error] || '처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
        if (isResend) resendFailed(d && d.error, msg);
        else { view('vIdle'); showErr(msg); }
      }
    }).catch(function () {
      var msg = '전달 여부를 확인하지 못했어요. 1~2분 안에 링크가 오지 않으면 다시 시도해 주세요.';
      if (isResend) resendFailed('', msg);
      else { view('vIdle'); showErr(msg); }
    }).then(function () {
      sending = false;
      submitBtn.disabled = false;
      submitBtn.textContent = '개인 링크 받기';
    });
  }

  $('form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    var d = digits(phoneEl.value);
    var ok = true;
    if (!validPhone(d)) {
      $('phoneErr').textContent = '휴대폰 번호를 다시 확인해 주세요. (예: 010-1234-5678)';
      $('phoneErr').hidden = false;
      phoneEl.focus();
      ok = false;
    }
    if (!agreeEl.checked) {
      $('agreeErr').hidden = false;
      if (ok) agreeEl.focus();
      ok = false;
    }
    if (!ok) return;
    if (!C.GAS_URL) {
      showErr('운영자 안내: config.js 의 GAS_URL 에 Apps Script 웹앱 주소를 넣어 주세요.');
      return;
    }
    lastDigits = d;
    handle(request(d, false), d, false);
  });

  $('resendBtn').addEventListener('click', function () {
    if (sending || !lastDigits) return;
    handle(request(lastDigits, true), lastDigits, true);
  });
})();
