/* ───────────────────────────────────────────────────────────────
 * Growth Edu Lab 학습연구소 — 사이트 설정
 * 이 파일만 고치면 돼요. 고친 뒤 이 파일(config.js) 하나만 다시 올리면 바로 반영돼요.
 * 따옴표("") 안의 글자만 바꾸고, 따옴표와 쉼표는 지우지 마세요.
 * ─────────────────────────────────────────────────────────────── */
window.GEL_CONFIG = {

  // ① 서버 주소: Apps Script 를 "웹 앱"으로 배포하고 나온 주소 (https://script.google.com/macros/s/.../exec)
  GAS_URL: "",

  // ② 카카오톡 채널 1:1 채팅 주소 (예: https://pf.kakao.com/_xxxxxx/chat)
  KAKAO_CHANNEL_URL: "",

  // ③ 문의 이메일 (푸터·약관에 표시)
  CONTACT_EMAIL: "",

  // ④ 카카오톡 앱 안에서 연 경우에만 열기 (true / false)
  //    true 로 바꾸면 크롬·사파리 등 일반 브라우저로 직접 접속한 경우에는 열리지 않아요.
  //    (카카오톡 안에서 링크를 눌렀는지 정도만 확인할 수 있어요. 자세한 설명은 설정가이드를 보세요.)
  REQUIRE_KAKAO_APP: false,

  // ⑤ 화면에 보여줄 안내 값 (실제 만료 시간은 Code.gs 의 LINK_VALID_HOURS 가 결정해요. 둘을 같게 맞춰 주세요)
  LINK_VALID_HOURS: 24,
  DATA_RETENTION_DAYS: 90,

  // ⑥ 결제 링크: 결제대행사에서 만든 상품별 결제 주소. 비워 두면 "결제 링크 준비 중"으로 보여요.
  PAY_URL: {
    main       : "",   // 아이 발달유형 · 관심도 진단
    learning   : "",   // 학습 양식 · 회복탄력성 진단
    temperament: "",   // 기질 · 성격 진단
    parenting  : "",   // 부모 양육태도 진단
    social     : "",   // 사회성 · 관계 조절 진단
    emotion    : "",   // 정서 · 욕구 진단
  },

  // ⑦ 판매 가격(원, 숫자만). 0 이면 "가격 준비 중"으로 보여요.
  PRICE: {
    main       : 0,   // 아이 발달유형 · 관심도 진단
    learning   : 0,   // 학습 양식 · 회복탄력성 진단
    temperament: 0,   // 기질 · 성격 진단
    parenting  : 0,   // 부모 양육태도 진단
    social     : 0,   // 사회성 · 관계 조절 진단
    emotion    : 0,   // 정서 · 욕구 진단
  },

  // ⑧ 사업자 정보 (푸터에 표시 · 비워 두면 그 줄은 숨겨져요)
  BIZ: {
    name: "Growth Edu Lab 학습연구소",
    owner: "",
    regNo: "",
    mailOrderNo: "",
    address: "",
    phone: "",
    email: ""
  }
};
