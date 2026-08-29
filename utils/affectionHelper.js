// 동적으로 설정 가능한 스토리 데이터
let characters = {};

/**
 * 스토리 데이터 설정
 * @param {Object} data - storyData 객체
 */
export const setStoryData = (data) => {
  if (data && data.characters) {
    characters = data.characters;
  }
};

/**
 * 캐릭터별 호감도 값을 min/max 범위 내로 제한합니다
 * @param {string} characterId - 캐릭터 ID
 * @param {number} value - 제한할 호감도 값
 * @returns {number} - 범위 내로 제한된 값
 */
export function clampAffection(characterId, value) {
  const char = characters[characterId];
  const min = char?.minAffection ?? -10;
  const max = char?.maxAffection ?? 10;
  return Math.min(max, Math.max(min, value));
}

/**
 * 캐릭터별 초기 호감도를 생성합니다
 * @returns {object} - 각 캐릭터의 초기 호감도 객체 { sage: 0, ruby: 0, ... }
 */
export function getInitialAffection() {
  const initialAffection = {};
  Object.values(characters).forEach((char) => {
    const initial = char.initialAffection ?? 0;
    initialAffection[char.id] = clampAffection(char.id, initial);
  });
  return initialAffection;
}

/**
 * 호감도 바의 너비를 계산합니다 (0~100%)
 * @param {string} characterId - 캐릭터 ID
 * @param {number} value - 현재 호감도 값
 * @returns {string} - 퍼센트 문자열 (예: "50%")
 */
export function getAffectionBarWidth(characterId, value) {
  const char = characters[characterId];
  const min = char?.minAffection ?? -10;
  const max = char?.maxAffection ?? 10;
  const clamped = Math.min(max, Math.max(min, value));
  const ratio = (clamped - min) / (max - min || 1);
  return `${Math.round(ratio * 100)}%`;
}

/**
 * 호감도 퍼센트 값을 계산합니다 (0~100)
 * @param {string} characterId - 캐릭터 ID
 * @param {number} value - 현재 호감도 값
 * @returns {number} - 0~100 사이의 퍼센트 값
 */
export function getAffectionPercentage(characterId, value) {
  const char = characters[characterId];
  const min = char?.minAffection ?? -10;
  const max = char?.maxAffection ?? 10;
  const clamped = Math.min(max, Math.max(min, value));
  const ratio = (clamped - min) / (max - min || 1);
  return Math.round(ratio * 100);
}
