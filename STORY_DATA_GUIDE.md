# 스토리 데이터 수정 가이드

## 개요

이 프로젝트는 빌드 후에도 스토리 데이터를 쉽게 수정할 수 있도록 설계되었습니다.

## 파일 구조

```
visual-novel/
├── public/
│   └── storyData.json          # 수정 가능한 스토리 데이터 (JSON 형식)
├── data/
│   └── storyData.js            # 자동 생성된 스토리 데이터 (JS 형식)
└── scripts/
    ├── convertStoryData.js     # JS → JSON 변환 스크립트
    └── generateStoryData.js    # JSON → JS 변환 스크립트
```

## 스토리 데이터 수정 방법

### 개발 중 수정

1. **`public/storyData.json` 파일을 수정**합니다.
   - 캐릭터 정보, 씬, 대사, 엔딩 등을 자유롭게 수정할 수 있습니다.

2. **스토리 데이터를 코드에 반영**합니다:
   ```bash
   npm run generate:story
   ```

3. **개발 서버 재시작** (선택사항):
   ```bash
   npm run dev
   ```

### 빌드 후 수정

빌드할 때 자동으로 `public/storyData.json`에서 `data/storyData.js`가 생성됩니다:

```bash
npm run build
```

빌드 프로세스:
1. `prebuild` 스크립트가 자동으로 `npm run generate:story` 실행
2. `public/storyData.json` → `data/storyData.js` 변환
3. Next.js 빌드 실행

## 배포 후 스토리 수정

배포된 애플리케이션의 스토리를 수정하려면:

1. 배포된 서버의 `public/storyData.json` 파일을 수정
2. 애플리케이션을 재빌드
3. 재배포

**주의**: 런타임에 즉시 반영되지 않으며, 재빌드가 필요합니다.

## npm 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run generate:story` | JSON에서 JS 파일 생성 |
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 (자동으로 스토리 데이터 생성) |

## storyData.json 구조

```json
{
  "gameInfo": {
    "title": "게임 제목",
    "subtitle": "부제",
    "me": "주인공 이름",
    "backgroundMusic": "배경음악.mp3"
  },
  "characters": {
    "캐릭터id": {
      "id": "캐릭터id",
      "name": "캐릭터 이름",
      "color": "#색상코드",
      "initialAffection": 0,
      "minAffection": 0,
      "maxAffection": 6,
      "imageFolder": "폴더명",
      "emotions": { ... }
    }
  },
  "places": { ... },
  "storyScenes": [ ... ],
  "endingConfig": { ... }
}
```

## 주의사항

1. **JSON 문법**: `storyData.json`은 유효한 JSON 형식이어야 합니다.
2. **백업**: 수정 전에 항상 백업을 만드세요.
3. **유효성 검사**: 수정 후 게임을 테스트하여 오류가 없는지 확인하세요.

## 문제 해결

### 스토리 데이터가 반영되지 않는 경우

1. `npm run generate:story` 실행 확인
2. 개발 서버 재시작
3. 브라우저 캐시 삭제

### JSON 파싱 오류

- JSON 문법 검사기로 `storyData.json` 유효성 확인
- 쉼표, 중괄호, 따옴표 등 문법 오류 수정
