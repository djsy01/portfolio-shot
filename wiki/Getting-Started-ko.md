# 시작하기

## 요구 사항

- Node.js 18 이상
- Playwright Chromium 브라우저 — `npm install` 과정에서 자동으로 설치됩니다 (`playwright` 패키지가 postinstall로 다운로드). 오프라인 설치나 CI 캐시 등으로 생략됐다면 아래 명령어를 실행하세요.

  ```bash
  npx playwright install chromium
  ```

## 설치

```bash
npm install --save-dev portfolio-shot
```

## 설정 파일 생성

```bash
npx portfolio-shot init
```

현재 디렉토리에 `portfolio-shot.config.ts`가 생성됩니다.

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

`url`은 배포된 사이트 주소로, `pages`는 캡처하고 싶은 라우트로 수정하세요.

설정 파일이 이미 있는데 처음부터 다시 만들고 싶다면:

```bash
npx portfolio-shot init --force
```

## 실행

```bash
npx portfolio-shot generate
```

예상 출력:

```text
✔ Browser started
… Visiting /
✔ Saved home.webp
… Visiting /projects
✔ Saved projects.webp

Done in 4.2s
```

스크린샷은 `<output>/<name>.<format>`에 저장됩니다 — 위 예제 설정이라면 `./public/screenshots/home.webp`, `./public/screenshots/projects.webp`.

## 프로젝트 구조 (기여자용)

```text
src/
  browser/   Playwright 라이프사이클 (실행, 컨텍스트, 이동, 스크린샷)
  config/    설정 파일 탐색, 검증, 기본값 처리
  image/     Sharp 기반 이미지 최적화 및 포맷 변환
  cli/       Commander 기반 CLI (init, generate)
  utils/     로깅
  index.ts   공개 라이브러리 API (generate, defineConfig, loadConfig, 타입)
```

다음: 모든 옵션은 [설정 옵션](Configuration-Reference-ko), 명령어 플래그는 [CLI 명령어](CLI-Reference-ko)를 참고하세요.
