# 디바이스와 다크 모드

기본값으로 `portfolio-shot`은 각 페이지를 desktop `viewport`(1440×900), 라이트 모드로 한 번만 캡처하고, 파일명에 접미사를 붙이지 않습니다 (`home.webp`). 이는 v1.0 동작과 완전히 동일하며, `devices`/`colorSchemes` 추가는 전적으로 선택 사항입니다.

## 파일명 접미사 규칙

각 축은 값이 **2개 이상**일 때만 접미사가 붙습니다.

| `devices.length` | `colorSchemes.length` | 예시 파일명             |
| ---------------- | --------------------- | ----------------------- |
| 1                | 1                     | `home.webp`             |
| 1                | 2 이상                | `home-dark.webp`        |
| 2 이상           | 1                     | `home-mobile.webp`      |
| 2 이상           | 2 이상                | `home-mobile-dark.webp` |

따라서 `devices` 없이 `colorSchemes: ["light", "dark"]`만 설정하면 `home-light.webp` / `home-dark.webp`가 생성됩니다 — 디바이스는 하나(기본값 `"desktop"`)뿐이므로 디바이스 세그먼트는 붙지 않습니다.

## `devices`

```ts
devices: ['desktop', 'mobile', 'tablet'];
```

각 항목은 다음 중 하나일 수 있습니다.

- **`"desktop"`** — 최상위 `viewport` 설정(또는 기본값 1440×900)으로 해석됩니다. 내장 유저 에이전트/터치 에뮬레이션이 없는 유일한 프리셋입니다.
- **`"mobile"`** — Playwright의 `"iPhone 13"` 디바이스 디스크립터에 대한 별칭 (논리 해상도 390×844, 3배 스케일, 터치 + 모바일 UA).
- **`"tablet"`** — Playwright의 `"iPad (gen 7)"` 디바이스 디스크립터에 대한 별칭 (논리 해상도 810×1080, 2배 스케일, 터치 활성화).
- **정확한 Playwright 디바이스 이름** — 100개 이상의 전체 카탈로그(iPhone, iPad, Pixel, Galaxy 폰/태블릿/폴더블)를 사용할 수 있습니다. 정확한 이름은 [디바이스 디스크립터 소스](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json)를 참고하세요. 예: `"iPhone 15 Pro"`, `"Pixel 8 Pro"`, `"Galaxy Tab S9"`.
- **커스텀 객체** — 완전히 수동으로 제어:

  ```ts
  devices: [
    { name: 'wide', viewport: { width: 1920, height: 1080 } },
    { name: 'ultrawide', viewport: { width: 3440, height: 1440 } },
  ];
  ```

  `name`과 `viewport`만 필수이며, `userAgent`, `deviceScaleFactor`, `isMobile`, `hasTouch`는 선택 사항입니다.

인식되지 않는 문자열을 넣으면 브라우저가 실행되기 전에 `InvalidConfigError`가 발생하며, 잘못된 값을 그대로 알려줍니다.

## `colorSchemes`

```ts
colorSchemes: ['light', 'dark']; // "no-preference"도 추가 가능
```

Playwright가 CSS `prefers-color-scheme` 미디어 기능을 그에 맞게 에뮬레이션합니다. 사이트의 다크 모드가 이 미디어 쿼리로 동작한다면(버튼 클릭이 필요한 JS 토글 방식이 아니라면) 추가 설정 없이도 두 모드를 모두 정확히 캡처합니다. 버튼/localStorage 플래그로 다크 모드를 전환하는 사이트는 이 옵션으로 커버되지 않습니다 — 캡처 전 커스텀 단계가 필요한데, 아직 지원하지 않습니다 ([로드맵](Roadmap-ko) 참고).

## 성능 참고 사항

디바이스 × 컬러 스킴 조합마다 별도의 브라우저 컨텍스트가 열리고(Playwright는 `isMobile` 같은 뷰포트 관련 설정을 기존 컨텍스트에서 바꿀 수 없어서 필수입니다), `pages`의 모든 페이지를 다시 방문합니다. 디바이스 3개 × 컬러 스킴 2개 × 페이지 5개 설정은 스크린샷 30장을 순차적으로 캡처합니다. 아직 병렬 처리는 없으므로, 조합이 많을수록 시간도 비례해서 늘어납니다.

함께 보기: [설정 옵션](Configuration-Reference-ko), [인증](Authentication-ko).
