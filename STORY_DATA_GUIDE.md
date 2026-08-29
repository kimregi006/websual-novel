# 스토리 데이터 작성 가이드

모든 시나리오는 `public/storyData.json` 한 파일에 들어 있습니다.
게임은 실행할 때마다 이 파일을 그대로 읽어오므로, **JSON을 고치고 새로고침하면 바로 반영됩니다.** 빌드나 변환 과정은 없습니다.

배포한 뒤에도 마찬가지로 서버에 올라간 `storyData.json`만 교체하면 됩니다.

## 전체 구조

```json
{
  "gameInfo":    { ... },   // 게임 기본 정보
  "characters":  { ... },   // 등장인물
  "places":      { ... },   // 배경 장소
  "storyScenes": [ ... ],   // 씬 목록 (진행 순서)
  "endingConfig":{ ... }    // 엔딩 분기 설정
}
```

## gameInfo

```json
"gameInfo": {
  "title": "게임 제목",
  "subtitle": "부제",
  "me": "주인공 이름",
  "backgroundMusic": "title.mp3"
}
```

`title`, `subtitle`, `me` 는 필수입니다. `backgroundMusic` 은 타이틀 화면 BGM이며 비워두면 재생하지 않습니다.

## characters

키 이름이 곧 캐릭터 ID입니다.

```json
"aa": {
  "id": "aa",
  "name": "에이",
  "color": "#ffffff",
  "initialAffection": 0,
  "minAffection": 0,
  "maxAffection": 10,
  "imageFolder": "aa",
  "emotions": { "default": "aa_01_default.png" }
}
```

| 필드 | 설명 |
|---|---|
| `id` | 키 이름과 같게 |
| `name` | 대사창에 표시될 이름 |
| `color` | 이름 표시 색상 |
| `initialAffection` | 시작 호감도 |
| `min` / `maxAffection` | 호감도 상·하한 |
| `imageFolder` | `public/assets/characters/` 아래 폴더명 |
| `emotions` | 표정 이름 → 파일명 |

`id`, `name`, `color`, `imageFolder`, `emotions` 는 필수입니다.
이미지 경로는 `public/assets/characters/{imageFolder}/{emotions의 파일명}` 으로 조합됩니다.

## places

```json
"forest": {
  "id": "forest",
  "name": "숲속",
  "image": "forest.jpg",
  "color": ""
}
```

`id`, `name` 은 필수입니다. `image` 는 `public/assets/places/` 안의 파일명이고, 비워두면 `color` 가 배경색으로 쓰입니다.

## storyScenes

씬 배열입니다. **시작 씬의 id는 반드시 `scene1`** 이어야 합니다.

```json
{
  "id": "scene1",
  "type": "normal",
  "place": "forest",
  "backgroundMusic": "bgm.mp3",
  "dialogues": [
    {
      "speaker": "aa",
      "text": "안녕하세요.",
      "characters": [
        { "id": "aa", "emotion": "default", "position": "left", "active": true }
      ]
    }
  ],
  "next": "scene2"
}
```

| 필드 | 설명 |
|---|---|
| `id` | 씬 고유 ID (필수) |
| `type` | `normal` · `choice` · `ending` |
| `place` | `places` 의 키 |
| `backgroundMusic` | `public/assets/musics/` 안의 파일명. 없으면 BGM 정지 |
| `dialogues` | 대사 목록 |
| `next` | 다음 씬 id. `ending` 이거나 `checkAffection` 이 있으면 생략 |
| `checkAffection` | `true` 면 호감도를 계산해 엔딩 씬으로 분기 |

`dialogues` 의 각 항목에서 `text` 는 필수이고, `characters` 는 그 대사 동안 화면에 세울 캐릭터 목록입니다. `active: true` 인 캐릭터가 밝게 강조됩니다. `position` 은 `left` / `center` / `right` 를 씁니다.

### 선택지 씬

`type` 을 `choice` 로 두고 `choices` 배열을 추가합니다.

```json
"choices": [
  {
    "text": "선택지 문구",
    "next": null,
    "affectionChanges": { "aa": 2 },
    "reaction": { "speaker": "aa", "text": "예쁜 이름이네요.", "characters": [ ... ] }
  }
]
```

- `text` 는 필수, `next` 는 **반드시 적어야 합니다.** 이어질 씬이 따로 없고 씬의 `next` 로 합류시킬 거라면 `null` 을 명시하세요.
- `affectionChanges` 는 캐릭터별 호감도 증감입니다.
- `reaction` 은 선택 직후 한 번 나오는 대사로, 생략할 수 있습니다.

## endingConfig

`checkAffection: true` 인 씬에 도달하면 호감도로 엔딩을 결정합니다.

```json
"endingConfig": {
  "thresholds": { "bad": 0, "normal": 1, "good": 2, "best": 4 },
  "common": { "normal": { "title": "...", "message": "..." } },
  "duo": [],
  "characterEndings": {
    "aa": { "good": { "title": "...", "message": "..." } }
  }
}
```

판정 순서는 다음과 같습니다.

1. 최고 호감도가 `bad` 미만 → 배드 엔딩
2. `best` 이상인 캐릭터가 **1명** → 그 캐릭터의 `best` 엔딩
3. `best` 이상인 캐릭터가 **2명 이상** → `duo` 목록에서 일치하는 조합
4. 그 외 → 최고 호감도 캐릭터의 `good` 또는 `common.normal`

각 엔딩에는 `title`, `message` 를 적고, 컷신을 넣으려면 `cutsceneImage` 에 `public/assets/cutscenes/` 안의 파일명을 지정합니다.

### 엔딩 씬 이름 규칙

판정 결과는 아래 규칙으로 만들어진 id의 씬을 찾아갑니다. **해당 id의 씬이 `storyScenes` 에 없으면 엔딩이 표시되지 않습니다.**

| 엔딩 | 씬 id |
|---|---|
| 배드 | `bad_ending` |
| 공통 노멀 | `normal_ending` |
| 캐릭터별 | `best_ending_{캐릭터id}`, `good_ending_{캐릭터id}`, `normal_ending_{캐릭터id}` |
| 듀오 | `duo_ending_{캐릭터id}_{캐릭터id}` |

## 에셋 위치

```
public/assets/characters/{폴더}/   캐릭터 이미지
public/assets/places/              배경 이미지
public/assets/cutscenes/           컷신 이미지
public/assets/musics/              배경음악
public/assets/icon/                UI 아이콘
```

JSON에는 폴더 경로 없이 **파일명만** 적습니다.

## 확인하기

JSON은 게임 시작 시 자동으로 검사됩니다. 필수 필드 누락, 없는 캐릭터·장소 참조, 끊긴 `next` 등이 있으면 브라우저 콘솔에 경고가 출력되니 수정 후 콘솔을 확인하세요.

반영이 안 되면 JSON 문법 오류(쉼표, 중괄호, 따옴표)를 먼저 의심하면 됩니다. 파일 하나가 통째로 시나리오이므로 크게 고치기 전에는 백업해 두세요.
