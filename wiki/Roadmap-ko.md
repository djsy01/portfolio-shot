# 로드맵

아키텍처는 의도적으로 계층화되어 있어서 (`browser` / `config` / `image` / `cli`, 모두 `index.ts`를 통해 노출) 아래 각 마일스톤을 기존 코드를 뜯어고치지 않고도 추가할 수 있습니다. **v1.0부터 v1.5까지는 이미 구현되어 있습니다.** v2.0과 v3.0은 아직 구현되지 않았으며, 이 페이지는 그 두 항목에 대한 계획을 정리한 문서입니다.

## v1.0 — CLI + Playwright + WebP ✅

- CLI (`init`, `generate`) + 라이브러리 API (`generate()`)
- Playwright Chromium 캡처, 풀페이지 또는 뷰포트
- Sharp 기반 WebP/PNG 최적화, 품질과 리사이즈 설정 가능
- 타입이 지정된 설정, 검증과 합리적인 기본값 포함

## v1.1 — 모바일/태블릿, 다크 모드, PNG ✅

- `devices` 설정: `"desktop"` / `"mobile"` / `"tablet"` 프리셋(실제 Playwright 디바이스 디스크립터 기반), 정확한 Playwright 디바이스 이름, 또는 완전히 커스텀한 `{ name, viewport }` 프로필
- `colorSchemes` 설정: `"light"` / `"dark"` / `"no-preference"`, `prefers-color-scheme` 에뮬레이션
- 각 조합은 독립적으로 캡처되며, 파일명은 2개 이상 설정된 축에만 `-<device>`/`-<colorScheme>` 접미사가 붙습니다 — v1.0 설정 그대로 쓰면 여전히 접미사 없는 파일명이 생성됩니다
- PNG 지원 (`format: "png"`, 무손실, `resize`는 그대로 적용)

자세한 내용: [디바이스와 다크 모드](Devices-and-Dark-Mode-ko).

## v1.5 — 로그인, 쿠키, 인증 ✅ (현재 버전)

- `auth.storageStatePath` — 이전에 저장한 Playwright storageState(쿠키 + localStorage) 불러오기
- `auth.cookies` — 로그인 흐름 없이 쿠키를 직접 주입
- `auth.login` — 로그인 폼을 한 번 자동화(필드 채우기, 제출 클릭, 성공 확인 대기) — 결과로 얻은 세션은 이후 실행되는 모든 디바이스/컬러 스킴 조합에서 재사용됩니다
- `auth.saveStorageStatePath` — `login`/`cookies`로 얻은 세션을 저장해서, 다음 실행부터는 곧바로 `storageStatePath`를 쓸 수 있게 함
- 인증 실패는 raw Playwright 예외가 아니라 타입이 지정된 `AuthError`로 나타남

자세한 내용: [인증](Authentication-ko).

## v2.0 — AI 기반 페이지 탐색 (`discover`)

- `pages`에 모든 `path`를 수동으로 나열하는 대신, 사이트를 크롤링(내부 링크를 일정 깊이까지 따라가며)해서 모델이 포트폴리오에 넣을 만한 페이지를 판단하게 함
- opt-in `discover: true` 설정 플래그, 혹은 제안된 `pages` 배열을 써주는 별도의 `portfolio-shot discover` 명령어 형태가 될 가능성이 높음

## v3.0 — GitHub Actions 연동

- 배포 시 `portfolio-shot generate`를 실행하는 공식 액션(또는 문서화된 워크플로우)
- 매번 전체 세트를 다시 만드는 대신, 콘텐츠가 실제로 바뀐 페이지의 스크린샷만 다시 생성하는 diffing

## 로드맵에 기여하기

로드맵 항목은 의도적으로 미리 구현하지 않습니다 — [CONTRIBUTING](https://github.com/djsy01/portfolio-shot/blob/main/CONTRIBUTING.md#conventions) 참고. `discover`나 GitHub Actions 연동을 작업하고 싶다면 PR을 보내기 전에 이슈를 먼저 열어서 범위를 맞춰주세요.
