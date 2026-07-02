# CLI 명령어

## `portfolio-shot init`

현재 디렉토리에 `portfolio-shot.config.ts`를 생성합니다.

```bash
npx portfolio-shot init
```

| 플래그 | 설명 |
| --- | --- |
| `-f, --force` | 기존 설정 파일을 덮어쓰기 |

설정 파일이 이미 있고 `--force`를 넘기지 않으면 경고와 함께 실패합니다 (종료 코드 `1`).

## `portfolio-shot generate`

설정을 불러와 `pages`에 정의된 모든 페이지를 캡처합니다.

```bash
npx portfolio-shot generate
```

| 플래그 | 설명 |
| --- | --- |
| `-c, --config <path>` | 자동 탐색 대신 지정한 경로의 설정 파일 사용 |

성공하면 종료 코드 `0`, 설정 로딩이나 캡처가 실패하면 `1`입니다 — 에러는 raw stack trace가 아니라 읽기 쉬운 메시지(`✖ ...`)로 출력됩니다.

## 전역 플래그

| 플래그 | 설명 |
| --- | --- |
| `-V, --version` | 설치된 버전 출력 |
| `-h, --help` | 명령어 도움말 표시 |

## 종료 코드

| 코드 | 의미 |
| --- | --- |
| `0` | 성공 |
| `1` | 설정 파일 없음/유효하지 않음, 페이지 이동 실패, 브라우저 실행 실패 |

각 실패 상황에 대한 대처법은 [트러블슈팅](Troubleshooting-ko)을 참고하세요.
