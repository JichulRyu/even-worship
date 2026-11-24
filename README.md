# Even Worship v0.2

Even Realities G2용 CCM 가사·코드 한 화면 우선 표시 앱 프로토타입.

## PC에서 실행 (Node.js 불필요)
1. ZIP 압축을 풀고 index.html을 Chrome/Edge에서 엽니다.
2. `주님을 향한 노래 A`를 검색하면 창작 테스트 악보를 A키로 전조하여 표시합니다.
3. 로컬에 없는 곡은 설정에서 권한 있는 악보 API를 사용하거나 Gemini로 검색 출처를 찾을 수 있습니다.
4. `콘티 추가`로 곡을 모아 `콘티 시작`을 누릅니다. 이전/다음으로 페이지 또는 곡을 넘깁니다.

## Gemini 구글 자동 검색
1. https://aistudio.google.com/apikey 에서 개인 API 키를 발급합니다.
2. 앱에서 Gemini 검색 설정을 열고 키를 입력한 뒤 검색 활성화 체크박스를 선택합니다. 키는 저장/백업하지 않으며 새로고침하면 사라집니다.
3. 제목과 원하는 키를 입력하고 자동 검색을 누릅니다. 기본 모델은 gemini-3.5-flash-lite입니다. 모델명은 변경 가능합니다.
4. 로컬에 곡이 없고 권한 있는 악보 API에서도 찾지 못하면 Gemini Interactions API(v1beta, Google Search tool)를 호출합니다. AI 추천 순서와 실제 응답의 URL 인용을 표시합니다. 검색 제안 HTML은 격리된 iframe에 표시합니다. 첫 인용은 우선 후보이며 실제 악보 적합성은 직접 확인합니다.
5. 원본 출처를 열고 이용 허락된 가사와 코드 자료를 확인합니다. `이 출처로 등록`을 선택하여 ChordPro 형식으로 붙여넣고 실제 원곡 키 및 이용 권한을 확인해 저장합니다. 이후 검색 시 자동 표시됩니다.

**비용:** 2026-11-24 기준 Gemini 3.5 Flash-Lite Google Search grounding은 무료 등급에서 지원하지 않습니다. 유료 등급은 Gemini 3 이상 모델 공유 월 5,000 검색 요청까지 검색 도구 요금이 무료이나 모델 토큰 비용은 별도입니다. 결제 활성화 전 https://ai.google.dev/gemini-api/docs/pricing 확인. Gemini 2.5 접근은 신규 사용자 제한이 있어 무료 검색을 보장하지 않습니다. 일반 구글 직접 검색과 로컬 악보는 키 없이 이용 가능합니다.

**보안:** 이 버전은 개인 브라우저 테스트용입니다. API 키를 공개 GitHub 코드에 넣거나 다른 사람에게 전달하지 마세요. 브라우저 메모리에만 입력하더라도 클라이언트 환경에서는 키 보호를 보장하지 못합니다. 공개 운영에는 인증 및 사용량 제한을 갖춘 서버 측 프록시가 필요합니다(미구현). 검색 제목은 Google에 전송됩니다. API 응답은 로컬 DB에 자동 저장하지 않습니다. 출처 검색만 수행하며 상용 악보 전문을 자동 복제하지 않습니다.

## 악보 등록 / 외부 정식 데이터 연동
`[G]가사 [D/F#]가사` 형식과 `{comment: Verse}` 구간 표기 사용. JSON 및 ChordPro 가져오기 지원. 출처와 이용 권한을 입력합니다. 외부 악보 API 설정은 이용 허락을 받은 HTTPS URL(브라우저 CORS 허용)만 사용하세요. `{title}` 자리표시자를 URL에 쓰거나, 생략하면 `q` 쿼리 매개변수를 추가합니다. 응답 예시:

```json
{"songs":[{"title":"창작 테스트 곡","key":"G","body":"[G]창작 가사 [D]창작 가사","source":"직접 작성"}]}
```

검색 제목과 일치하는 곡을 로컬에 저장하고 원하는 조로 전조합니다. 외부 인증 및 정식 악보 공급 서비스 구독은 별도로 마련해야 합니다. 반복 구간은 순서 보존을 위해 임의 삭제하지 않습니다. 한 화면에 표시하기 어려운 긴 곡만 페이지로 나눕니다.

## G2 연결 (실기기 미검증)
- index.html을 HTTPS 정적 호스팅(예: GitHub Pages)에 배포하고 Even Hub 개발자 테스트 절차에 따라 등록합니다. 공개 운영용 Gemini 프록시는 포함되지 않습니다.
- Even 앱 WebView에서 G2 연결을 누릅니다. 공식 SDK @evenrealities/even_hub_sdk 0.0.14를 jsDelivr ESM으로 가져옵니다. 576×288 캔버스의 네 타일을 순차 전송합니다. SDK 및 기기 호환성은 확인이 필요합니다.
- R1/G2 위/아래 스와이프: 이전/다음, 한 번 터치: 다음, 두 번 터치: 종료 확인. 일반 PC 브라우저는 화면 미리보기만 가능합니다.

## 검증
- Node.js JS 문법 검사 통과.
- Chromium에서 HTML 직접 주입 테스트: 로컬 제목+키 검색, A키 전조 및 한 화면 표시, 콘티 등록, 미등록 곡 설정 열기, Gemini 모의 응답 검색 요청 구조/출처 표시, 비HTTPS 링크 배제, 원본 등록/권한 확인 및 저장 동작 통과. 페이지 JS 오류 없음.
- 실제 Gemini 인증/네트워크 호출, 저장 지속성, HTTPS 배포, 실제 G2/R1 동작은 아직 검증하지 않았습니다.

## 공식 참고
- https://ai.google.dev/gemini-api/docs/google-search
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- https://ai.google.dev/gemini-api/docs/pricing
- https://github.com/even-realities/everything-evenhub/tree/main/plugins/everything-evenhub/skills/glasses-ui
