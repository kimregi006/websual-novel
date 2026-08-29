/**
 * imageCollector.js - 스토리 데이터에서 이미지 경로 수집
 *
 * 기능:
 * - 현재 scene + 다음 N개 scene/dialogue에서 사용되는 이미지 수집
 * - 캐릭터 스프라이트, 배경, 컷신, reaction 이미지 추출
 * - 범위 제한으로 성능 최적화
 */

// 동적으로 설정 가능한 스토리 데이터
let characters = {};
let places = {};
let storyScenes = [];

/**
 * 스토리 데이터 설정 (GameContext에서 호출)
 * @param {Object} data - storyData 객체
 */
export const setStoryData = (data) => {
  if (data) {
    characters = data.characters || {};
    places = data.places || {};
    storyScenes = data.storyScenes || [];
  }
};

/**
 * 캐릭터 이미지 URL 생성
 * @param {string} charId - 캐릭터 ID
 * @param {string} emotion - 감정 상태
 * @returns {string|null} - 이미지 URL
 */
const getCharacterImageUrl = (charId, emotion) => {
  if (!charId || !emotion) return null;

  const char = characters[charId];
  if (!char || !char.imageFolder || !char.emotions || !char.emotions[emotion]) {
    return null;
  }

  try {
    return `/assets/characters/${char.imageFolder}/${char.emotions[emotion]}`;
  } catch (error) {
    console.error(
      `Failed to generate URL for ${charId} with emotion ${emotion}:`,
      error
    );
    return null;
  }
};

/**
 * 배경 이미지 URL 생성
 * @param {string} placeId - 장소 ID
 * @returns {string|null} - 이미지 URL
 */
const getPlaceImageUrl = (placeId) => {
  if (!placeId) return null;

  const place = places[placeId];
  if (!place || !place.image) return null;

  try {
    return `/assets/places/${place.image}`;
  } catch (error) {
    console.error(`Failed to generate URL for place ${placeId}:`, error);
    return null;
  }
};

/**
 * 컷신 이미지 URL 생성
 * @param {string} cutsceneImage - 컷신 이미지 파일명
 * @returns {string|null} - 이미지 URL
 */
const getCutsceneImageUrl = (cutsceneImage) => {
  if (!cutsceneImage) return null;

  try {
    return `/assets/cutscenes/${cutsceneImage}`;
  } catch (error) {
    console.error(`Failed to generate URL for cutscene ${cutsceneImage}:`, error);
    return null;
  }
};

/**
 * 대사(dialogue)에서 이미지 추출
 * @param {object} dialogue - 대사 객체
 * @returns {string[]} - 이미지 URL 배열
 */
const collectImagesFromDialogue = (dialogue) => {
  const images = [];

  if (!dialogue) return images;

  // 대사에 표시되는 캐릭터들
  if (dialogue.characters && Array.isArray(dialogue.characters)) {
    dialogue.characters.forEach((char) => {
      if (char.id && char.emotion) {
        const url = getCharacterImageUrl(char.id, char.emotion);
        if (url) images.push(url);
      }
    });
  }

  return images;
};

/**
 * choice의 reaction에서 이미지 추출
 * @param {object} choice - 선택지 객체
 * @returns {string[]} - 이미지 URL 배열
 */
const collectImagesFromChoice = (choice) => {
  const images = [];

  if (!choice || !choice.reaction) return images;

  const reaction = choice.reaction;

  // reaction의 캐릭터들
  if (reaction.characters && Array.isArray(reaction.characters)) {
    reaction.characters.forEach((char) => {
      if (char.id && char.emotion) {
        const url = getCharacterImageUrl(char.id, char.emotion);
        if (url) images.push(url);
      }
    });
  }

  return images;
};

/**
 * scene에서 이미지 추출
 * @param {object} scene - 씬 객체
 * @param {number} startDialogueIndex - 시작 dialogue 인덱스 (0부터 시작)
 * @param {number} maxDialogues - 최대 dialogue 개수 (제한)
 * @returns {string[]} - 이미지 URL 배열
 */
const collectImagesFromScene = (scene, startDialogueIndex = 0, maxDialogues = Infinity) => {
  const images = [];

  if (!scene) return images;

  // 1. 배경 이미지
  if (scene.place) {
    const placeUrl = getPlaceImageUrl(scene.place);
    if (placeUrl) images.push(placeUrl);
  }

  // 2. 컷신 이미지
  if (scene.cutsceneImage) {
    const cutsceneUrl = getCutsceneImageUrl(scene.cutsceneImage);
    if (cutsceneUrl) images.push(cutsceneUrl);
  }

  // 3. 씬 레벨 캐릭터 (scene.characters)
  if (scene.characters && Array.isArray(scene.characters)) {
    scene.characters.forEach((char) => {
      if (char.id && char.emotion) {
        const url = getCharacterImageUrl(char.id, char.emotion);
        if (url) images.push(url);
      }
    });
  }

  // 4. dialogues 배열에서 이미지 추출
  if (scene.dialogues && Array.isArray(scene.dialogues)) {
    const endIndex = Math.min(
      scene.dialogues.length,
      startDialogueIndex + maxDialogues
    );

    for (let i = startDialogueIndex; i < endIndex; i++) {
      const dialogue = scene.dialogues[i];
      const dialogueImages = collectImagesFromDialogue(dialogue);
      images.push(...dialogueImages);
    }
  } else if (scene.dialogue) {
    // 이전 버전 호환성 (단일 dialogue 객체)
    const dialogueImages = collectImagesFromDialogue(scene.dialogue);
    images.push(...dialogueImages);
  }

  // 5. choice scene의 경우 choices에서 이미지 추출
  if (scene.type === "choice" && scene.choices && Array.isArray(scene.choices)) {
    scene.choices.forEach((choice) => {
      const choiceImages = collectImagesFromChoice(choice);
      images.push(...choiceImages);
    });
  }

  return images;
};

/**
 * scene ID로 scene 객체 찾기
 * @param {string} sceneId - 씬 ID
 * @returns {object|null} - 씬 객체
 */
const findSceneById = (sceneId) => {
  if (!sceneId) return null;
  return storyScenes.find((scene) => scene.id === sceneId) || null;
};

/**
 * 현재 scene의 다음 scene ID 가져오기
 * @param {object} scene - 현재 씬 객체
 * @returns {string|null} - 다음 씬 ID
 */
const getNextSceneId = (scene) => {
  if (!scene) return null;

  // choice scene의 경우 choices의 next들을 모두 반환
  if (scene.type === "choice" && scene.choices && Array.isArray(scene.choices)) {
    const nextIds = scene.choices
      .map((choice) => choice.next)
      .filter((id) => id);
    return nextIds.length > 0 ? nextIds : null;
  }

  // 일반 scene의 경우 scene.next 반환
  return scene.next || null;
};

/**
 * 현재 위치에서 preload할 이미지 URL 수집
 *
 * @param {string} currentSceneId - 현재 씬 ID
 * @param {number} currentDialogueIndex - 현재 dialogue 인덱스
 * @param {object} options - 옵션
 * @param {number} options.lookAheadDialogues - 현재 scene에서 미리 볼 dialogue 개수 (기본: 5)
 * @param {number} options.lookAheadScenes - 다음 scene 개수 (기본: 2)
 * @returns {string[]} - preload할 이미지 URL 배열 (중복 제거됨)
 */
export const collectPreloadImages = (
  currentSceneId,
  currentDialogueIndex = 0,
  options = {}
) => {
  const {
    lookAheadDialogues = 5, // 현재 scene에서 앞으로 볼 dialogue 개수
    lookAheadScenes = 2, // 다음 scene 개수
  } = options;

  const imageSet = new Set();

  const currentScene = findSceneById(currentSceneId);
  if (!currentScene) {
    console.warn(`[ImageCollector] Scene not found: ${currentSceneId}`);
    return [];
  }

  // 1. 현재 scene의 이미지 수집 (현재 dialogue부터 lookAheadDialogues개까지)
  const currentSceneImages = collectImagesFromScene(
    currentScene,
    currentDialogueIndex,
    lookAheadDialogues + 1 // 현재 + 앞으로 N개
  );
  currentSceneImages.forEach((url) => imageSet.add(url));

  // 2. checkAffection이 있는 scene이면 모든 ending scene의 배경 + cutscene preload
  if (currentScene.checkAffection) {
    console.log("[ImageCollector] checkAffection scene detected, preloading all ending images");
    const endingScenes = storyScenes.filter(scene => scene.type === "ending");
    endingScenes.forEach((endingScene) => {
      // ending scene의 배경 preload
      if (endingScene.place) {
        const placeUrl = getPlaceImageUrl(endingScene.place);
        if (placeUrl) imageSet.add(placeUrl);
      }

      // ending scene의 cutscene 이미지 preload
      if (endingScene.cutsceneImage) {
        const cutsceneUrl = getCutsceneImageUrl(endingScene.cutsceneImage);
        if (cutsceneUrl) imageSet.add(cutsceneUrl);
      }
    });
  }

  // 3. 다음 scene들의 이미지 수집
  const nextSceneIds = getNextSceneId(currentScene);

  if (nextSceneIds) {
    const sceneIdsToProcess = Array.isArray(nextSceneIds)
      ? nextSceneIds
      : [nextSceneIds];

    sceneIdsToProcess.forEach((nextSceneId) => {
      const nextScene = findSceneById(nextSceneId);
      if (!nextScene) return;

      // 다음 scene의 이미지 전체 수집 (dialogue 제한 없음)
      const nextSceneImages = collectImagesFromScene(nextScene);
      nextSceneImages.forEach((url) => imageSet.add(url));

      // lookAheadScenes > 1인 경우, 그 다음 scene도 수집
      if (lookAheadScenes > 1) {
        const nextNextSceneIds = getNextSceneId(nextScene);
        if (nextNextSceneIds) {
          const nextNextIdsToProcess = Array.isArray(nextNextSceneIds)
            ? nextNextSceneIds
            : [nextNextSceneIds];

          nextNextIdsToProcess.forEach((nextNextSceneId) => {
            const nextNextScene = findSceneById(nextNextSceneId);
            if (!nextNextScene) return;

            const nextNextSceneImages = collectImagesFromScene(nextNextScene);
            nextNextSceneImages.forEach((url) => imageSet.add(url));
          });
        }
      }
    });
  }

  return Array.from(imageSet);
};

/**
 * 모든 캐릭터의 모든 감정 이미지 URL 수집 (타이틀 화면에서 사용)
 * @returns {string[]} - 모든 캐릭터 이미지 URL
 */
export const collectAllCharacterImages = () => {
  const images = [];

  Object.values(characters).forEach((char) => {
    if (char.emotions) {
      Object.keys(char.emotions).forEach((emotion) => {
        const url = getCharacterImageUrl(char.id, emotion);
        if (url) images.push(url);
      });
    }
  });

  return images;
};

/**
 * 모든 배경 이미지 URL 수집 (타이틀 화면에서 사용)
 * @returns {string[]} - 모든 배경 이미지 URL
 */
export const collectAllPlaceImages = () => {
  const images = [];

  Object.values(places).forEach((place) => {
    const url = getPlaceImageUrl(place.id);
    if (url) images.push(url);
  });

  return images;
};

/**
 * 특정 scene의 모든 이미지 수집
 * @param {string} sceneId - 씬 ID
 * @returns {string[]} - 이미지 URL 배열
 */
export const collectSceneImages = (sceneId) => {
  const scene = findSceneById(sceneId);
  if (!scene) return [];

  return collectImagesFromScene(scene);
};

/**
 * 타이틀 화면에서 사용되는 이미지 수집
 * @returns {string[]} - 타이틀 이미지 URL 배열
 */
export const collectTitleScreenImages = () => {
  const images = [];

  try {
    // 타이틀 배경 이미지
    const titleBg = "/assets/title.png";
    images.push(titleBg);

    // 타이틀 화면 아이콘들
    const icons = ["story.svg", "musicon.svg", "musicoff.svg"];
    icons.forEach((icon) => {
      try {
        const iconUrl = `/assets/icon/${icon}`;
        images.push(iconUrl);
      } catch (error) {
        console.warn(`Failed to generate URL for icon ${icon}:`, error);
      }
    });
  } catch (error) {
    console.error("Failed to collect title screen images:", error);
  }

  return images;
};
