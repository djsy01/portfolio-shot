# 로드맵

아키텍처는 의도적으로 계층화되어 있어서 (`browser` / `config` / `image` / `cli`, 모두 `index.ts`를 통해 노출) 아래 각 마일스톤을 기존 코드를 뜯어고치지 않고도 추가할 수 있습니다. v1.0 이후 항목은 아직 구현되지 않았습니다 — 이 페이지는 현재 동작이 아니라 계획을 정리한 문서입니다.

## v1.0 — 현재

- CLI (`init`, `generate`) + 라이브러리 API (`generate()`)
- Playwright Chromium 캡처, 풀페이지 또는 뷰포트
- Sharp 기반 WebP/PNG 최적화, 품질과 리사이즈 설정 가능
- 타입이 지정된 설정, 검증과 합리적인 기본값 포함

## v1.1 — 모바일/태블릿, 다크 모드, PNG

- 흔히 쓰는 모바일/태블릿 크기를 위한 디바이스 프리셋 (뷰포트 + user agent)
- `colorScheme: "dark" | "light"` — `BrowserSession`이 내부적으로 이미 이 옵션을 받지만 아직 설정으로 노출되지 않음
- PNG 지원은 이미 존재 (`format: "png"`); 이 마일스톤은 PNG 관련 옵션(압축 레벨, 팔레트)을 다듬는 작업
- 참고: 이 절은 영어판 로드맵과 동일한 계획을 담고 있으며, PNG 항목은 이미 v1.0에 구현되어 있습니다.

## v1.5 — 로그인, 쿠키, 인증

- 보호된 페이지를 캡처할 수 있도록 Playwright `storageState`(쿠키 + localStorage) 지원
- 설정 레벨의 로그인 플로우 (한 번 폼을 채워서 세션을 저장하고, 모든 페이지에서 재사용)
- `BrowserSession`에 이를 위한 `storageStatePath` 훅이 이미 예약되어 있음

## v2.0 — AI 기반 페이지 탐색 (`discover`)

- `pages`에 모든 `path`를 수동으로 나열하는 대신, 사이트를 크롤링(내부 링크를 일정 깊이까지 따라가며)해서 모델이 포트폴리오에 넣을 만한 페이지를 판단하게 함
- opt-in `discover: true` 설정 플래그, 혹은 제안된 `pages` 배열을 써주는 별도의 `portfolio-shot discover` 명령어 형태가 될 가능성이 높음

## v3.0 — GitHub Actions 연동

- 배포 시 `portfolio-shot generate`를 실행하는 공식 액션(또는 문서화된 워크플로우)
- 매번 전체 세트를 다시 만드는 대신, 콘텐츠가 실제로 바뀐 페이지의 스크린샷만 다시 생성하는 diffing

## 로드맵에 기여하기

로드맵 항목은 의도적으로 미리 구현하지 않습니다 — [CONTRIBUTING](https://github.com/djsy01/portfolio-shot/blob/main/CONTRIBUTING.md#conventions) 참고. 특정 항목을 작업하고 싶다면 PR을 보내기 전에 이슈를 먼저 열어서 범위를 맞춰주세요.
