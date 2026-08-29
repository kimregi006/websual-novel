// 동적으로 설정 가능한 스토리 데이터
let storyScenes = [];

/**
 * 스토리 데이터 설정
 * @param {Object} data - storyData 객체
 */
export const setStoryData = (data) => {
  if (data && data.storyScenes) {
    storyScenes = data.storyScenes;
  }
};

/**
 * 씬 ID가 존재하는지 확인합니다
 * @param {string} sceneId - 확인할 씬 ID
 * @returns {boolean} - 씬이 존재하면 true
 */
export const sceneExists = (sceneId) => {
  if (!sceneId) return false;
  return storyScenes.some((scene) => scene.id === sceneId);
};

/**
 * 현재 씬이 정상적으로 다음 씬으로 이동할 수 있는지 확인합니다
 * @param {object} scene - 확인할 씬 객체
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateSceneFlow = (scene) => {
  if (!scene) {
    return { isValid: false, error: "씬 데이터가 없습니다." };
  }

  // 엔딩 씬은 next가 없어도 괜찮음
  if (scene.type === "ending") {
    return { isValid: true };
  }

  // 타이틀 화면은 next가 있어야 함
  if (scene.type === "title") {
    if (!scene.next || !sceneExists(scene.next)) {
      return { isValid: false, error: "타이틀 화면의 다음 씬이 없습니다." };
    }
    return { isValid: true };
  }

  // 선택지 씬은 모든 choice에 next가 있어야 함
  if (scene.type === "choice") {
    if (!scene.choices || scene.choices.length === 0) {
      return { isValid: false, error: "선택지가 없습니다." };
    }

    const invalidChoice = scene.choices.find(
      (choice) => !choice.next || !sceneExists(choice.next)
    );
    if (invalidChoice) {
      return {
        isValid: false,
        error: `선택지 "${invalidChoice.text}"의 다음 씬이 없습니다.`,
      };
    }

    return { isValid: true };
  }

  // 일반 대화 씬은 next가 있거나 checkAffection이 있어야 함
  if (!scene.next && !scene.checkAffection) {
    return { isValid: false, error: "다음 씬이나 엔딩 분기가 없습니다." };
  }

  // next가 있는데 존재하지 않는 씬인 경우
  if (scene.next && !sceneExists(scene.next)) {
    return {
      isValid: false,
      error: `다음 씬 "${scene.next}"이(가) 존재하지 않습니다.`,
    };
  }

  return { isValid: true };
};

/**
 * 엔딩 씬 ID가 존재하는지 확인합니다
 * @param {string} endingSceneId - 확인할 엔딩 씬 ID
 * @returns {boolean} - 엔딩 씬이 존재하면 true
 */
export const endingSceneExists = (endingSceneId) => {
  if (!endingSceneId) return false;
  const scene = storyScenes.find((s) => s.id === endingSceneId);
  return scene && scene.type === "ending";
};

/**
 * 엔딩 정보가 유효한지 확인합니다
 * @param {object} endingInfo - 확인할 엔딩 정보
 * @returns {boolean} - 유효하면 true
 */
export const validateEndingInfo = (endingInfo) => {
  if (!endingInfo) return false;
  if (!endingInfo.type || !endingInfo.title || !endingInfo.message) {
    return false;
  }
  return true;
};
