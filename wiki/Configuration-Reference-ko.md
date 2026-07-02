# 설정 옵션

`portfolio-shot`은 현재 디렉토리의 `portfolio-shot.config.ts` (또는 `.js`/`.mjs`/`.cjs`/`.json`), 혹은 `generate -c <path>`로 넘긴 경로의 파일을 읽습니다.

## 필드

| 옵션        | 타입                                                        | 기본값                         | 필수 여부 |
| ----------- | ----------------------------------------------------------- | ------------------------------ | --------- |
| `url`       | `string`                                                    | —                              | 필수      |
| `output`    | `string`                                                    | —                              | 필수      |
| `pages`     | `{ path: string; name: string }[]`                          | —                              | 필수      |
| `format`    | `"webp" \| "png"`                                           | `"webp"`                       | 선택      |
| `quality`   | `number` (1~100)                                            | `90`                           | 선택      |
| `fullPage`  | `boolean`                                                   | `true`                         | 선택      |
| `viewport`  | `{ width: number; height: number }`                         | `{ width: 1440, height: 900 }` | 선택      |
| `resize`    | `{ width?: number; height?: number }`                       | 없음 (리사이즈 안 함)          | 선택      |
| `waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` | `"networkidle"`                | 선택      |
| `timeout`   | `number` (ms)                                               | `30000`                        | 선택      |

### `url`

배포된 사이트의 기본 URL입니다. 각 페이지의 `path`는 `URL` 생성자를 통해 이 값을 기준으로 해석되므로, `url: "https://example.com/app"` + `path: "/settings"` → `https://example.com/settings`가 됩니다 (경로가 대체되며 이어붙지 않음 — 표준 `new URL(path, base)` 동작). 뒤쪽 세그먼트를 유지하고 싶다면 `path`에 전체 경로를 명시하세요.

### `output`

스크린샷이 저장될 디렉토리로, 없으면 자동 생성됩니다. 상대 경로는 CLI를 실행한 현재 작업 디렉토리를 기준으로 해석됩니다.

### `pages`

각 항목은 `path`(방문할 경로, `url` 기준 상대 경로)와 `name`(확장자를 제외한 출력 파일명)이 필요합니다. 둘 다 필수 문자열이며, 하나라도 빠지면 검증 단계에서 상세한 에러 메시지와 함께 즉시 실패합니다.

### `format` / `quality`

`"webp"`(기본값) 또는 `"png"`. `quality`(1~100)는 WebP 인코딩에만 적용됩니다. PNG는 항상 무손실로 저장되므로 `quality`는 영향을 주지 않습니다 (PNG에는 손실 압축 품질 옵션이 없음 — `resize`는 그대로 적용됩니다).

### `fullPage`

`true`면 스크롤 가능한 전체 페이지 높이를 캡처하고, `false`면 `viewport`에 보이는 영역만 캡처합니다.

### `viewport`

렌더링과 `fullPage: false` 캡처에 사용되는 브라우저 창 크기입니다. 기본값은 흔히 쓰는 데스크톱 크기(1440×900)입니다.

### `resize`

캡처 후 인코딩 전에 Sharp로 적용되는 선택적 리사이즈입니다. 지정한 값만 제약되며(`fit: "inside"`, 확대 없음), 예를 들어 `{ width: 1280 }`은 최대 너비 1280px로 비율을 유지하며 축소합니다.

### `waitUntil`

Playwright 페이지 이동 대기 조건:

- `"load"` — `load` 이벤트 발생
- `"domcontentloaded"` — DOM 파싱 완료, 리소스는 아직 로딩 중일 수 있음
- `"networkidle"` (기본값) — 500ms 동안 네트워크 연결 없음; 클라이언트 사이드에서 데이터를 가져오는 SPA에 적합
- `"commit"` — 이동이 시작됨, 콘텐츠는 기다리지 않음 — 여기서는 거의 쓸모없음

### `timeout`

페이지 캡처가 `PageCaptureError`로 중단되기까지의 이동 타임아웃(밀리초)입니다.

## 예제: 전체 설정

```ts
import { defineConfig } from 'portfolio-shot';

export default defineConfig({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [
    { path: '/', name: 'home' },
    { path: '/projects', name: 'projects' },
    { path: '/contact', name: 'contact' },
  ],
  format: 'webp',
  quality: 90,
  fullPage: true,
  viewport: { width: 1440, height: 900 },
  resize: { width: 1280 },
  waitUntil: 'networkidle',
  timeout: 30000,
});
```

## 라이브러리 API

동일한 형태를 프로그래밍 방식 API에서도 그대로 사용할 수 있습니다.

```ts
import { generate } from 'portfolio-shot';

const result = await generate({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [{ path: '/', name: 'home' }],
});
```

`generate()`는 `{ outputDir, pages: [{ page, file, durationMs }], durationMs }`를 반환합니다.

함께 보기: [CLI 명령어](CLI-Reference-ko), [트러블슈팅](Troubleshooting-ko).
