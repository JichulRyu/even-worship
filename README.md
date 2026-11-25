# Even Worship v0.4.1

Even Realities G2용 CCM 가사·코드 표시 프로토타입.

## 웹 테스트
https://jichulryu.github.io/even-worship/?v=041

API 키 없이 `작은 빛 (창작 테스트) A`를 검색합니다. scores.json에 있는 창작 예제 악보가 자동 표시되며 A키로 전조됩니다. 이 목록은 실제 CCM 카탈로그가 아니라 자동화 동작 검증용입니다.

## 무료 악보 검색
Tavily 키를 입력하면 블로그 및 무료 공개 악보 후보를 검색하고 알려진 유료 판매처를 제외합니다. 검색 결과만으로 무료 열람이나 재사용 허락을 확정할 수 없습니다. 일반 블로그 악보 전문은 자동 복제하지 않습니다. 이용 권한이 있는 사진은 직접 표시하거나 Gemini로 인식할 수 있습니다.

## 공용 서비스 (서버 소스 준비, 미배포)
Node 22 이상의 HTTPS 호스팅 환경에 저장소를 배포합니다. 서버 실행: `npm run server`. 환경 변수:
- EW_INVITE_TOKEN: 24자 이상의 임의 초대 코드
- TAVILY_API_KEY, GROQ_API_KEY: 운영자가 서버에만 등록
- EW_ORIGINS: 허용할 클라이언트 출처 목록 (기본 https://jichulryu.github.io)
- EW_DAILY_LIMIT: 외부 API 호출 총량 (기본 100, UTC 하루, 단일 프로세스 메모리 기준)
- PORT: 기본 8787
서버 URL과 초대 코드를 앱에서 입력합니다. 공급자 API 키는 사용자에게 노출하지 않습니다. 정식 공개 운영 전 사용자별 인증, 지속적인 사용량 제한, 개인정보 고지, 호스팅 및 요금 관리가 필요합니다. 초대 코드는 베타 테스트용이지 완성된 공용 사용자 인증이 아닙니다.
패키지 빌드 전 app.json 네트워크 whitelist에 실제 배포 서버의 HTTPS 도메인을 추가하세요. Even WebView의 실제 Origin과 CORS도 확인해야 합니다. 검색 서버는 허락된 scores.json에서 가사·코드를 조회하거나 Tavily로 출처 후보만 찾습니다. Groq 음성 전송은 사용자가 활성화한 경우에만 수행합니다.

## Even Hub 패키징 (미검증)
Node 22+ 환경:
```sh
npm install
npm run pack
```
SDK 0.0.14를 번들링하고 app.json에 정의한 앱으로 even-worship.ehpk 생성을 시도합니다. CLI가 npm에서 설치되어야 합니다. package_id는 com.jichulryu.evenworship (가칭; 사용 가능 여부 확인 필요). 실제 업로드에는 Even Hub 계정 로그인과 등록 절차가 필요합니다. Private build 또는 QR 개발 테스트로 G2 동작 확인 후 공개 심사.
https://hub.evenrealities.com/docs/cli/builds

## G2 음성 검색 (실기기 미검증)
Even Hub에서 G2 연결, Groq 키 또는 배포된 공용 서비스 연결, 음성 검색 허용 설정 후 안경/R1 두 번 터치로 5초간 제목과 키를 말합니다. 음성이 Groq로 전송됩니다. 스와이프는 곡/페이지 전환. 일반 브라우저에서는 안경 마이크를 사용할 수 없습니다. 실제 R1 이벤트, 전송, WebView 권한 및 음성 인식 테스트 필요.

## 허락된 악보 데이터
scores.json 또는 정식 HTTPS 악보 API에 title, key, body(ChordPro), source, access: "free", reuseAllowed: true, license를 제공해야 합니다. 구조화된 lines 또는 chordpro도 지원합니다. 운영자가 이용 허락 근거를 검증해야 합니다. 검색만으로 허락 여부를 추정하여 등록하지 않습니다.

## 검증 범위
JS 문법 검사, 데이터 변환 및 필터 모의 시험. 실제 npm 패키징, 호스팅, 기기 및 실시간 검색 서비스는 미검증.
