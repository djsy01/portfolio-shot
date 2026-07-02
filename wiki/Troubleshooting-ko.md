# 트러블슈팅

## `Failed to launch Chromium...`

Playwright 브라우저 바이너리가 다운로드되지 않았습니다. 아래 명령어를 실행하세요.

```bash
npx playwright install chromium
```

새로 클론한 직후, 캐시가 없는 CI 환경, 혹은 네트워크 접근이 차단된 상태로 `npm install`이 실행됐을 때(`playwright` 패키지의 postinstall 다운로드가 생략됨) 발생할 수 있습니다.

## `Could not find a "portfolio-shot.config..." file`

현재 디렉토리에서 설정 파일을 찾지 못했습니다. 다음 중 하나를 시도하세요.

- `npx portfolio-shot init`으로 새로 생성하거나
- `npx portfolio-shot generate -c ./path/to/config.ts`처럼 경로를 명시적으로 지정

## `Failed to visit "..."` / 페이지 이동 타임아웃

`timeout` 밀리초 안에 설정된 `waitUntil` 상태에 도달하지 못했습니다. 흔한 원인:

- **느린 콜드 스타트** (서버리스/엣지 배포) — `timeout`을 늘리세요 (예: `60000`).
- **백그라운드 폴링이 끝나지 않음** — `networkidle`은 500ms 동안 네트워크 활동이 없어야 충족되는데, 앱이 롱폴링을 하거나 웹소켓을 계속 열어두면 이 조건이 영영 충족되지 않을 수 있습니다. `waitUntil`을 `"load"`나 `"domcontentloaded"`로 바꾸세요.
- **사이트가 실제로 다운됐거나 URL/경로가 잘못됨** — 먼저 일반 브라우저에서 URL이 정상적으로 열리는지 확인하세요.

## 설정 필드가 로드 시점에 거부됨 (`url`, `format`, `quality` 등)

설정 검증은 아무것도 실행되기 전에 이루어지며, 에러 메시지에 정확한 필드명과 이유가 나옵니다 (예: `Config "quality" must be between 1 and 100.`). [설정 옵션](Configuration-Reference-ko)과 대조해보세요.

## `sharp` 설치 실패 또는 런타임 에러

`sharp`는 플랫폼/아키텍처별로 미리 빌드된 네이티브 바이너리를 사용합니다. 다음 경우에 불일치가 자주 발생합니다.

- **Apple Silicon**에서 Rosetta(x64)로 설치된 Node를 쓰는 경우 — Node를 네이티브(arm64)로 재설치한 뒤 `npm rebuild sharp` 실행.
- **Docker/CI 이미지**가 로컬 개발 환경과 아키텍처가 다른 경우 — `node_modules`를 복사해오지 말고, 대상 이미지 안에서 `npm install`을 직접 실행하세요.

잘 모르겠다면: `rm -rf node_modules package-lock.json && npm install`.

## 스크린샷이 비어 있거나, 일부만 렌더링되거나, 콘텐츠가 빠짐

스크린샷은 `waitUntil`이 충족된 직후에 촬영됩니다 — 그 시점 이후에 앱이 콘텐츠를 더 렌더링한다면(예: 네트워크가 잠깐 idle 상태가 된 뒤에 resolve되는 느린 클라이언트 사이드 fetch), 너무 이르게 캡처하게 됩니다. 선호되는 순서대로 해결 방법:

1. `waitUntil: "networkidle"`(기본값)을 유지하세요 — 이미 네트워크 활동이 안정될 때까지 기다립니다.
2. 페이지가 단순히 느린 경우라면 `timeout`을 늘리세요.
3. 앱이 애니메이션이나 폴링 때문에 완전히 "안정"되지 않는다면, 이는 알려진 한계입니다 — 명시적 대기/셀렉터 지원 계획은 [로드맵](Roadmap-ko)을 참고하세요.

## 출력 디렉토리 / 권한 에러

`output`이 없으면 자동으로 생성됩니다 (`mkdir -p`와 동일). 생성이 실패한다면 거의 항상 해당 경로에 대한 권한 문제입니다 — 프로세스가 최종 `output` 디렉토리에 쓰기 권한이 있는지 확인하세요.

## 그래도 해결이 안 된다면

설정(실제 URL이 비공개라면 가려주세요), 실행한 정확한 명령어, 전체 에러 출력을 첨부해서 이슈를 열어주세요 — [CONTRIBUTING](https://github.com/djsy01/portfolio-shot/blob/main/CONTRIBUTING.md#reporting-bugs) 참고.
