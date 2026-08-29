/**
 * sceneHelpers.js - 씬 관련 헬퍼 함수
 *
 * 파생 상태 계산 로직을 순수 함수로 분리
 */

/**
 * dialogue/dialogues를 공통 배열로 정규화
 * 새 구조: dialogues (배열)
 * 이전 구조: dialogue (단일 객체) → [dialogue]로 변환
 *
 * @param {Object} scene - 씬 객체
 * @returns {Array} 정규화된 대사 배열
 */
export const normalizeDialogues = (scene) => {
  if (!scene) return [];

  // 새 구조: dialogues 배열
  if (Array.isArray(scene.dialogues) && scene.dialogues.length > 0) {
    return scene.dialogues;
  }

  // 이전 구조: dialogue 단일 객체 → 배열로 변환
  if (scene.dialogue) {
    return [scene.dialogue];
  }

  return [];
};

/**
 * 배열을 캐릭터 맵(객체)으로 변환
 *
 * @param {Array} charArray - 캐릭터 배열
 * @returns {Object} 캐릭터 맵 { characterId: { emotion, position, active } }
 */
export const arrayToCharacterMap = (charArray) => {
  if (!Array.isArray(charArray)) return {};
  return charArray.reduce((map, char) => {
    if (char?.id) {
      map[char.id] = {
        emotion: char.emotion,
        position: char.position,
        active: char.active,
      };
    }
    return map;
  }, {});
};

/**
 * 현재 표시할 캐릭터 결정
 * 우선순위: reaction > 대사 레벨 > displayCharacters
 *
 * @param {Object} params
 * @param {boolean} params.showReaction - reaction 표시 여부
 * @param {Object} params.currentReaction - 현재 reaction 객체
 * @param {Object} params.currentLine - 현재 대사
 * @param {Object} params.dialogueForChoice - choice 씬의 마지막 대사
 * @param {boolean} params.shouldShowChoices - 선택지 표시 여부
 * @param {Object} params.displayCharacters - 씬 레벨 기본 캐릭터
 * @returns {Object} 캐릭터 맵
 */
export const computeCurrentCharacters = ({
  showReaction,
  currentReaction,
  currentLine,
  dialogueForChoice,
  shouldShowChoices,
  displayCharacters,
}) => {
  // 1순위: reaction
  if (showReaction && currentReaction?.characters) {
    const map = arrayToCharacterMap(currentReaction.characters);
    for (const id in map) {
      map[id].isNew = displayCharacters[id]?.isNew ?? false;
    }
    return map;
  }

  const lineToCheck = shouldShowChoices ? dialogueForChoice : currentLine;

  // 2순위: 현재 대사
  if (lineToCheck?.characters) {
    const map = arrayToCharacterMap(lineToCheck.characters);
    for (const id in map) {
      map[id].isNew = displayCharacters[id]?.isNew ?? false;
    }
    return map;
  }

  // 3순위: 훅이 만든 displayCharacters 그대로 사용
  return displayCharacters;
};

/**
 * 컷신 표시 여부 결정
 * 모든 씬 타입(normal, choice, ending)에서 사용 가능
 * 현재 대사에 cutscene: true가 있을 때만 표시
 *
 * @param {Object} currentScene - 현재 씬
 * @param {Object} currentLine - 현재 대사
 * @returns {boolean} 컷신 표시 여부
 */
export const shouldShowCutscene = (currentScene, currentLine) => {
  if (!currentScene?.cutsceneImage) return false;
  return currentLine?.cutscene === true;
};

/**
 * 선택지 표시 여부 결정
 * choice 씬에서 모든 대사를 다 본 경우에만 표시
 *
 * @param {boolean} isChoiceScene - choice 씬 여부
 * @param {number} linesLength - 대사 배열 길이
 * @param {number} dialogueIndex - 현재 대사 인덱스
 * @returns {boolean} 선택지 표시 여부
 */
export const shouldShowChoices = (
  isChoiceScene,
  linesLength,
  dialogueIndex
) => {
  if (!isChoiceScene) return false;
  // 대사가 없거나, 모든 대사를 다 봤으면 선택지 표시
  return linesLength === 0 || dialogueIndex >= linesLength;
};
