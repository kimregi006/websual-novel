# Visual Novel

`storyData.json` 하나로 시나리오를 구성하는 웹 비주얼 노벨 엔진입니다.
선택지, 호감도, 다중 엔딩, 세이브/로드를 지원합니다.

Next.js 15 · React 19 · 정적 사이트로 빌드됩니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 정적 빌드 → out/
```

빌드 결과물인 `out/` 폴더를 정적 호스팅에 그대로 올리면 됩니다.

## 스토리 수정

모든 시나리오는 `public/storyData.json` 에 들어 있고, 게임 실행 시 이 파일을 직접 읽습니다.

| 키 | 내용 |
|---|---|
| `gameInfo` | 제목, 부제, 주인공 이름, 배경음악 |
| `characters` | 캐릭터 정보, 표정별 이미지, 호감도 범위 |
| `places` | 배경 장소 |
| `storyScenes` | 씬 목록 (`normal` / `choice` / `ending`) |
| `endingConfig` | 엔딩 분기 조건 |

이미지와 음원은 `public/assets/` 아래에 두고, JSON에는 파일명만 적습니다.
자세한 작성 규칙은 [STORY_DATA_GUIDE.md](STORY_DATA_GUIDE.md) 참고.

## 구조

```
app/          Next.js 진입점
components/   화면 UI (대사창, 선택지, 타이틀, 세이브 모달 등)
contexts/     스토리 데이터 로드 및 전역 게임 상태
hooks/        게임 로직 (호감도, 엔딩, 세이브/로드, BGM)
utils/        헬퍼 및 스토리 데이터 유효성 검사
public/       storyData.json, 이미지, 아이콘
```

세이브 데이터는 브라우저 `localStorage` 에 저장됩니다.
