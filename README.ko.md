# portfolio-shot

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](tsconfig.json)

> 개발자 포트폴리오용 스크린샷을 자동으로 촬영하고, 최적화하고, 저장해주는 라이브러리입니다.

[English README](./README.md) · [Wiki](https://github.com/djsy01/portfolio-shot/wiki) · [기여 가이드](./CONTRIBUTING.md)

포트폴리오를 만들어본 개발자라면 다들 겪어봤을 겁니다. 배포된 사이트를 열고, 페이지마다 들어가서, 스크린샷을 찍고, 크기를 조정하고, WebP로 변환한 다음, `public/screenshots`에 옮겨 넣는 작업. **portfolio-shot**은 이 과정 전체를 명령어 한 번으로 자동화합니다.

```text
✔ Browser started
… Visiting /
✔ Saved home.webp
… Visiting /projects
✔ Saved projects.webp

Done in 4.2s
```

## 주요 기능

- **명령어 한 줄** — 배포된 사이트의 모든 페이지를 한 번에 캡처
- **Playwright 기반** — 실제 Chromium 렌더링, 전체 페이지/뷰포트 스크린샷 지원
- **Sharp 기반 이미지 최적화** — WebP/PNG 자동 변환, 품질 설정 가능
- **제로 설정 친화적** — `portfolio-shot init` 한 번이면 바로 수정 가능한 설정 파일 생성
- **타입 지원** — CLI뿐 아니라 `generate()`를 스크립트에서 직접 import 가능
- **포트폴리오에 맞춘 기본값** — `networkidle`, 풀페이지, WebP 품질 90
- **모바일/태블릿/다크 모드** — 한 번의 실행으로 여러 디바이스와 컬러 스킴 조합을 모두 캡처
- **인증 세션 지원** — 로그인을 한 번 자동화하거나, 쿠키/storageState를 재사용해서 로그인 뒤의 페이지도 캡처

## 동작 방식

`portfolio-shot generate`를 실행하면 내부적으로 다음 순서로 동작합니다.

1. **설정 로드** — 현재 디렉토리(또는 `-c`로 지정한 경로)에서 `portfolio-shot.config.(ts|js|mjs|cjs|json)`를 찾아 검증하고, 빠진 값은 기본값으로 채웁니다.
2. **Chromium 실행** — 헤드리스 Playwright 브라우저를 띄웁니다.
3. **인증 처리 (설정된 경우)** — 저장된 `storageState`를 불러오거나, 쿠키를 주입하거나, 로그인 자동화를 한 번 실행합니다. 이렇게 얻은 세션은 이후 모든 캡처에서 재사용됩니다.
4. **디바이스 × 컬러 스킴 조합마다** — 해당 조합에 맞는 뷰포트/유저 에이전트/`prefers-color-scheme`가 설정된 브라우저 컨텍스트를 열고, 앞서 얻은 인증 세션을 미리 로드합니다.
5. **페이지 방문** — `url + path`로 이동하고, `waitUntil` 조건(기본값 `networkidle`)이 충족될 때까지 기다려 페이지가 완전히 렌더링되게 합니다.
6. **캡처** — `fullPage` 여부에 따라 스크린샷을 raw PNG 버퍼로 찍습니다.
7. **최적화** — Sharp로 버퍼를 처리합니다. 필요하면 `resize`를 적용하고, 설정된 `quality`로 WebP/PNG 인코딩합니다.
8. **저장** — `<output>/<name>.<format>` 경로에 파일을 씁니다 (예: `public/screenshots/home.webp`, 디바이스/컬러 스킴이 여러 개면 `home-mobile-dark.webp`처럼 저장). 출력 디렉토리가 없으면 자동 생성됩니다.
9. **결과 출력** — 각 단계를 로그로 남기고 전체 소요 시간을 출력합니다. 어느 단계든 실패하면 프로세스가 그냥 죽지 않고 읽기 쉬운 에러로 잡힙니다 (자세한 내용은 [트러블슈팅](#트러블슈팅) 참고).

같은 동작을 `generate(config)`라는 일반 async 함수로도 그대로 제공하므로, CLI 대신 Node 스크립트에서 직접 호출할 수도 있습니다. [라이브러리로 사용하기](#라이브러리로-사용하기)를 참고하세요.

## 요구 사항

- Node.js 18 이상
- Playwright Chromium 브라우저 (`npm install` 시 자동 설치되며, 설치가 생략됐다면 `npx playwright install chromium` 실행)
- `.ts` 설정 파일을 쓰려면 프로젝트에 `typescript`가 있어야 함 (선택적 peer dependency — TypeScript 프로젝트라면 대부분 이미 있고, 없다면 `.js`/`.mjs`/`.cjs`/`.json`을 사용하면 됩니다)

## 설치

```bash
npm install --save-dev portfolio-shot
```

## 빠른 시작

```bash
npx portfolio-shot init
```

현재 디렉토리에 `portfolio-shot.config.ts` 파일이 생성됩니다.

```ts
import { defineConfig } from 'portfolio-shot';

export default defineConfig({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [
    { path: '/', name: 'home' },
    { path: '/projects', name: 'projects' },
  ],
  format: 'webp',
  quality: 90,
  fullPage: true,
});
```

프로젝트에 맞게 수정한 뒤 아래 명령어를 실행하세요.

```bash
npx portfolio-shot generate
```

`./public/screenshots/home.webp`, `projects.webp` 등으로 스크린샷이 저장됩니다.

## CLI 명령어

| 명령어                              | 설명                            |
| ----------------------------------- | ------------------------------- |
| `portfolio-shot init`               | `portfolio-shot.config.ts` 생성 |
| `portfolio-shot init --force`       | 기존 설정 파일 덮어쓰기         |
| `portfolio-shot generate`           | 설정에 정의된 모든 페이지 캡처  |
| `portfolio-shot generate -c <path>` | 다른 경로의 설정 파일 사용      |

## 기존 프로젝트에 적용하기

필요할 때마다(또는 빌드 과정에) 스크린샷을 재생성하도록 스크립트로 등록하세요.

```json
{
  "scripts": {
    "screenshots": "portfolio-shot generate",
    "build": "next build && npm run screenshots"
  }
}
```

포트폴리오 사이트라면 보통 이렇게 구성합니다.

- `url` — 배포된 사이트 주소 (Vercel/Netlify 프리뷰나 프로덕션 URL)
- `output` — `./public/screenshots`로 지정해서, 포트폴리오의 정적 자산과 함께 이미지가 배포되게 함
- 각 프로젝트 UI가 바뀔 때마다 로컬에서 `npm run screenshots`를 실행하고, 갱신된 이미지를 커밋

## 라이브러리로 사용하기

```ts
import { generate } from 'portfolio-shot';

const result = await generate({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [
    { path: '/', name: 'home' },
    { path: '/projects', name: 'projects' },
  ],
});

console.log(result.pages); // [{ page, device, colorScheme, file, durationMs }, ...]
```

전체 예제는 [`examples/`](./examples) 폴더를 참고하세요.

## 설정 옵션

| 옵션           | 타입                                                        | 기본값                         | 설명                                                                                                |
| -------------- | ----------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `url`          | `string`                                                    | —                              | 캡처할 사이트의 기본 URL (필수)                                                                     |
| `output`       | `string`                                                    | —                              | 스크린샷을 저장할 디렉토리 (필수)                                                                   |
| `pages`        | `{ path: string; name: string }[]`                          | —                              | 방문하고 캡처할 페이지 목록 (필수)                                                                  |
| `format`       | `"webp" \| "png"`                                           | `"webp"`                       | 출력 이미지 포맷                                                                                    |
| `quality`      | `number` (1~100)                                            | `90`                           | 이미지 품질 (WebP 인코딩에 적용)                                                                    |
| `fullPage`     | `boolean`                                                   | `true`                         | 스크롤 전체 페이지 캡처 여부                                                                        |
| `viewport`     | `{ width: number; height: number }`                         | `{ width: 1440, height: 900 }` | 기본(desktop) 디바이스가 사용하는 뷰포트 크기                                                       |
| `resize`       | `{ width?: number; height?: number }`                       | 없음                           | 저장 전 이미지 리사이즈                                                                             |
| `devices`      | `(string \| DeviceConfig)[]`                                | `["desktop"]`                  | 각 페이지를 캡처할 디바이스 프로필 — [디바이스, 뷰포트, 다크 모드](#디바이스-뷰포트-다크-모드) 참고 |
| `colorSchemes` | `("light" \| "dark" \| "no-preference")[]`                  | `["light"]`                    | 에뮬레이션할 컬러 스킴 — [디바이스, 뷰포트, 다크 모드](#디바이스-뷰포트-다크-모드) 참고             |
| `auth`         | `AuthConfig`                                                | 없음                           | 로그인/쿠키/storageState — [인증](#인증-로그인-쿠키-세션) 참고                                      |
| `waitUntil`    | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` | `"networkidle"`                | Playwright 페이지 로딩 대기 조건                                                                    |
| `timeout`      | `number` (ms)                                               | `30000`                        | 페이지 이동 타임아웃                                                                                |

설정 파일은 `.ts`, `.js`, `.mjs`, `.cjs`, `.json` 형식을 모두 지원합니다.

## 디바이스, 뷰포트, 다크 모드

기본값으로는 모든 페이지가 desktop `viewport`(1440×900), 라이트 모드로 한 번만 캡처되고, 파일명에는 접미사가 붙지 않습니다 (`home.webp`, v1.0과 동일).

`devices`와 `colorSchemes`를 추가하면 페이지마다 여러 조합으로 캡처합니다. 어느 한 축에 값이 2개 이상이면 그 값이 파일명에 붙습니다.

```ts
export default defineConfig({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [{ path: '/', name: 'home' }],
  devices: ['desktop', 'mobile', 'tablet'],
  colorSchemes: ['light', 'dark'],
});
```

이렇게 하면 `home-desktop-light.webp`, `home-desktop-dark.webp`, `home-mobile-light.webp`, `home-mobile-dark.webp`, `home-tablet-light.webp`, `home-tablet-dark.webp`가 생성됩니다.

`devices`에 넣을 수 있는 값:

- `"desktop"` — 설정된(또는 기본) `viewport`
- `"mobile"` / `"tablet"` — 실제 Playwright 디바이스 디스크립터에 대한 별칭 (iPhone 13 / iPad gen 7, 유저 에이전트와 터치 에뮬레이션 포함)
- 정확한 [Playwright 디바이스 이름](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json), 예: `"iPhone 15 Pro"`, `"Pixel 8"`
- 커스텀 객체: `{ name: "wide", viewport: { width: 1920, height: 1080 } }`

`colorSchemes`에는 `"light"`, `"dark"`, `"no-preference"`를 넣을 수 있습니다 — Playwright가 `prefers-color-scheme`을 에뮬레이션하므로, 이에 반응하는 CSS가 있다면 제대로 렌더링됩니다.

## 인증 (로그인, 쿠키, 세션)

로그인이 필요한 페이지는 `auth`를 아래 중 하나로 설정하세요.

**저장된 세션 사용** (가장 빠름 — 로그인 흐름을 다시 실행하지 않음):

```ts
auth: {
  storageStatePath: './storage-state.json',
}
```

**쿠키를 직접 지정** (이미 유효한 세션 토큰이 있는 경우):

```ts
auth: {
  cookies: [{ name: 'session', value: 'abc123', domain: 'example.vercel.app', path: '/' }],
}
```

**로그인 자동화** — 페이지를 캡처하기 전에 딱 한 번만 실행되며, 결과로 얻은 세션(쿠키 + localStorage)은 이후 모든 디바이스/컬러 스킴 조합에서 재사용됩니다.

```ts
auth: {
  login: {
    url: 'https://example.vercel.app/login',
    fields: [
      { selector: '#email', value: 'demo@example.com' },
      { selector: '#password', value: process.env.DEMO_PASSWORD! },
    ],
    submitSelector: '#submit',
    waitForSelector: '#dashboard',
  },
  saveStorageStatePath: './storage-state.json', // 캐싱해두면 다음엔 storageStatePath로 재사용 가능
}
```

**`storageStatePath`로 저장되는 파일이나 하드코딩된 비밀번호는 절대 커밋하지 마세요** — 실제 세션 쿠키가 그대로 들어있습니다. 실제 자격 증명은 위처럼 환경 변수로 불러오고, 저장된 storage-state 파일은 gitignore에 추가하세요.

전체 예제는 [`examples/auth-login.config.ts`](./examples/auth-login.config.ts)를, 셀렉터 작성 팁과 트러블슈팅은 [Authentication 위키 페이지](https://github.com/djsy01/portfolio-shot/wiki/Authentication)를 참고하세요.

## 에러 처리

잘못된 URL, 설정 파일 누락, 페이지 이동 타임아웃, 브라우저 실행 실패 등은 모두 잡아서 읽기 쉬운 에러 메시지와 함께 종료 코드 `1`로 안내합니다. 원인을 알 수 없는 stack trace로 그냥 죽는 일은 없습니다.

## 트러블슈팅

| 증상                                                 | 원인                                                                                               | 해결                                                                                                                                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Failed to launch Chromium...`                       | Playwright 브라우저 바이너리가 설치되지 않음                                                       | `npx playwright install chromium` 실행                                                                                                                                                                        |
| `Could not find a "portfolio-shot.config..." file`   | 현재 디렉토리에 설정 파일이 없음                                                                   | `portfolio-shot init` 실행, 또는 `-c <path>`로 경로 지정                                                                                                                                                      |
| `Failed to visit "..."` / 페이지 이동 타임아웃       | `timeout` 안에 `waitUntil` 조건이 충족되지 않음                                                    | 설정에서 `timeout`을 늘리거나, 백그라운드에서 계속 polling하는 사이트라면 `waitUntil`을 `"load"`로 완화                                                                                                       |
| 설정의 `url` / `format` / `quality`가 로드 시 거부됨 | 설정 검증 실패                                                                                     | 에러 메시지에 정확한 필드명이 나옵니다 — [설정 옵션](#설정-옵션) 참고                                                                                                                                         |
| `sharp` 설치 실패                                    | 네이티브 바이너리 불일치 (예: Apple Silicon vs. Rosetta Node)                                      | `npm rebuild sharp`로 재설치하거나, `node_modules`를 지우고 아키텍처가 맞는 Node로 재설치                                                                                                                     |
| 스크린샷이 빈 화면으로 나옴                          | `waitUntil` 조건 충족 이후에 페이지가 렌더링됨 (클라이언트 렌더링 지연)                            | `waitUntil`을 `"networkidle"`(기본값)로 두거나 `timeout`을 늘리기                                                                                                                                             |
| `Unknown device "..."`                               | `devices` 항목이 `"desktop"`/`"mobile"`/`"tablet"`도 아니고 정확한 Playwright 디바이스 이름도 아님 | [Playwright 디바이스 목록](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json)에서 철자를 확인하거나, 커스텀 `{ name, viewport }` 객체를 사용 |
| `requires the "typescript" package`                  | `typescript`가 없는 상태로 `.ts` 설정을 사용                                                       | `npm install --save-dev typescript`를 실행하거나 `.js`/`.mjs`/`.cjs`/`.json` 설정으로 전환                                                                                                                    |
| `Login flow failed: ...`                             | `auth.login`의 셀렉터가 안 맞거나, `waitForSelector`/`waitUntil`이 제시간에 충족되지 않음          | 실제 브라우저에서 셀렉터를 먼저 확인하고, `auth.login.timeout`을 늘리고, 로그인 폼에 추가 단계(2FA, CAPTCHA 등)가 없는지 확인                                                                                 |
| `Failed to apply configured cookies.`                | `auth.cookies`의 쿠키에 `url`과 `domain`이 둘 다 없음                                              | 각 쿠키는 `url` 또는 `domain`(+선택적 `path`)이 필요합니다 — [인증](#인증-로그인-쿠키-세션) 참고                                                                                                              |

더 많은 사례와 자세한 내용은 [Wiki](https://github.com/djsy01/portfolio-shot/wiki)에 정리되어 있습니다.

## 아키텍처

```text
src/
  browser/   Playwright 라이프사이클 (실행, 컨텍스트, 이동, 스크린샷, 디바이스, 인증)
  config/    설정 파일 탐색, 검증, 기본값 처리
  image/     Sharp 기반 이미지 최적화 및 포맷 변환
  cli/       Commander 기반 CLI (init, generate)
  utils/     로깅
  index.ts   공개 라이브러리 API (generate, defineConfig, loadConfig, 타입)
```

각 계층은 하위 계층에만 의존하도록 설계되어 있어서, 아래 로드맵에 있는 기능들을 기존 코드를 뜯어고치지 않고도 추가할 수 있습니다.

## 로드맵

- **v1.0** — CLI + Playwright + WebP 저장 ✅
- **v1.1** — 모바일/태블릿 뷰포트, 다크 모드, PNG 지원 ✅
- **v1.5** — 로그인, 쿠키, 인증 세션 처리 ✅ _(현재 버전)_
- **v2.0** — AI 자동 페이지 탐색 (`discover` 모드)
- **v3.0** — GitHub Actions 연동, 변경된 페이지만 재생성

## 문서

시작 가이드, 전체 설정 옵션, 트러블슈팅, 로드맵 상세 등 더 긴 문서는 [GitHub Wiki](https://github.com/djsy01/portfolio-shot/wiki)에서 관리합니다. 해당 문서의 원본은 이 저장소의 [`wiki/`](./wiki) 폴더에 있으며, `main` 브랜치에 푸시될 때마다 자동으로 동기화됩니다.

## 기여하기

이슈와 PR 모두 환영합니다. 로컬 개발 환경 설정, 스크립트, 코딩 컨벤션은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 라이선스

MIT
