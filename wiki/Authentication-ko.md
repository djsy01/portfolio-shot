# 인증

로그인이 필요한 페이지는 `auth`로 캡처할 수 있습니다. `auth`가 만들어내는 세션(`storageStatePath`, `cookies`, `login` 중 무엇으로 얻었든)은 **한 번만** 해석되고, 이후 모든 디바이스/컬러 스킴 조합에서 재사용됩니다 — 조합마다 로그인 흐름이 다시 실행되지 않습니다.

## 인증하는 세 가지 방법

### 1. 저장된 세션 (`storageStatePath`)

가장 빠른 방법 — 브라우저 흐름이 전혀 실행되지 않고, Playwright가 파일을 그대로 불러옵니다.

```ts
auth: {
  storageStatePath: "./storage-state.json",
}
```

이 파일은 [Playwright storageState JSON](https://playwright.dev/docs/auth#reuse-signed-in-state) 형식입니다(오리진별 쿠키 + localStorage). `saveStorageStatePath`로 로그인을 한 번 실행해서 만들거나(아래 참고), `playwright test`나 `browser.newContext().storageState()`로 다른 곳에서 추출해도 됩니다.

### 2. 쿠키 직접 지정 (`cookies`)

이미 유효한 세션 토큰이 있고(예: 백엔드 스크립트로 발급) 전체 로그인 폼을 거칠 필요가 없을 때:

```ts
auth: {
  cookies: [
    { name: "session", value: "abc123", domain: "example.vercel.app", path: "/" },
    // 또는: { name: "session", value: "abc123", url: "https://example.vercel.app" },
  ],
}
```

각 쿠키는 `name`, `value`, 그리고 `url` 또는 `domain`(+선택적 `path`) 중 하나가 필요합니다 — [Playwright의 `addCookies`](https://playwright.dev/docs/api/class-browsercontext#browser-context-add-cookies) 요구사항과 동일합니다. 둘 다 없으면 아무것도 실행되기 전에 `InvalidConfigError`가 발생합니다.

### 3. 로그인 자동화 (`login`)

페이지를 캡처하기 전에, 별도의 스크래치 브라우저 컨텍스트에서 폼을 채우고 딱 한 번 제출합니다.

```ts
auth: {
  login: {
    url: "https://example.vercel.app/login",
    fields: [
      { selector: "#email", value: "demo@example.com" },
      { selector: "#password", value: process.env.DEMO_PASSWORD! },
    ],
    submitSelector: "#submit",
    waitForSelector: "#dashboard", // 로그인이 실제로 성공했는지 확인
    // waitUntil: "networkidle",   // waitForSelector가 없을 때 사용됨
    // timeout: 30000,
  },
  saveStorageStatePath: "./storage-state.json", // 다음번을 위해 캐싱
}
```

- `fields`는 순서대로 `page.fill(selector, value)`로 채워집니다 — 실제 브라우저에서 먼저 확인한 진짜 CSS 셀렉터(`#id`, `[name="..."]` 등)를 사용하세요.
- `submitSelector`는 필드를 다 채운 뒤 클릭됩니다.
- `waitForSelector`(권장)는 로그인 후에만 나타나는 요소를 기다립니다 — 이게 로그인 성공을 직접 확인하는 방법이며, 제출 후 내비게이션과의 경쟁 상태를 피하게 해줍니다. 생략하면 대신 `waitUntil`(기본값 `"networkidle"`)을 기다립니다.
- `saveStorageStatePath`와 함께 쓰면 _다음_ 실행에서는 로그인을 다시 하지 않고 곧바로 `storageStatePath`로 넘어갈 수 있습니다.

이 흐름 어디서든 실패하면(잘못된 셀렉터, 타임아웃, 잘못된 자격 증명) raw Playwright 스택 트레이스가 아니라 읽기 쉬운 메시지와 함께 `AuthError`가 발생합니다.

## 방법 조합하기

`storageStatePath`와 `cookies`는 함께 쓸 수 있습니다: 같은 스크래치 컨텍스트에서 storage state가 먼저 로드되고, 그 위에 추가 쿠키가 더해집니다. `login`도 `storageStatePath`와 함께 쓸 수 있습니다(예: 부분적으로 인증된 상태에서 시작) — 로그인 단계는 storage state가 로드된 뒤에 실행됩니다.

## 보안

- **저장된 `storageStatePath` 파일은 절대 커밋하지 마세요.** 실제 세션 쿠키(및 localStorage)가 들어있어서, 파일을 가진 사람은 만료 전까지 그 세션을 그대로 도용할 수 있습니다. `.gitignore`에 추가하세요.
- **설정 파일에 자격 증명을 하드코딩하지 마세요.** 환경 변수(`process.env.DEMO_PASSWORD`)를 사용하고, 실제 값은 `.gitignore`된 `.env` 파일이나 CI 시크릿 저장소에 보관하세요.
- CI에서 이 기능을 실행한다면(예: 배포 시 포트폴리오 스크린샷 갱신) 자격 증명을 암호화된 시크릿으로 저장하고, 실행 시점에 환경 변수로 주입하세요 — 로그에 노출하지 마세요(portfolio-shot의 로그는 필드 값이 아니라 셀렉터와 페이지 경로만 출력합니다).

## 트러블슈팅

로그인 관련 실패(셀렉터 불일치, 타임아웃, 쿠키 검증 에러)는 [트러블슈팅](Troubleshooting-ko)에 정리되어 있습니다.

함께 보기: [설정 옵션](Configuration-Reference-ko), [`examples/auth-login.config.ts`](https://github.com/djsy01/portfolio-shot/blob/main/examples/auth-login.config.ts).
