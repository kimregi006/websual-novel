/**
 * endingConfig.js - 엔딩 관련 설정 및 상수
 *
 * 엔딩 타입별 씬 ID 매핑, 에러 메시지 등을 중앙에서 관리
 */

/**
 * 엔딩 타입별 씬 ID 매핑 함수
 * @param {Object} endingInfo - getEnding()에서 반환된 엔딩 정보
 * @returns {string|null} - 엔딩 씬 ID 또는 null
 */
export const getEndingSceneId = (endingInfo) => {
  if (!endingInfo) return null;

  const { type, character, characters } = endingInfo;

  // 캐릭터 없는 엔딩 (bad, duo, normal)
  if (type === "bad") return "bad_ending";

  // duo 엔딩: characters 배열을 기반으로 씬 ID 생성
  if (type === "duo") {
    if (characters && Array.isArray(characters) && characters.length > 0) {
      // characters 배열 순서대로 씬 ID 생성 (예: ["sage", "ruby"] → "duo_ending_sage_ruby")
      return `duo_ending_${characters.join("_")}`;
    }
    return "duo_ending";
  }

  // 캐릭터 없는 일반 엔딩 (common ending)
  if (type === "normal" && !character) return "normal_ending";

  // 캐릭터별 엔딩 (best, good, normal)
  if (character) {
    if (type === "best") return `best_ending_${character}`;
    if (type === "good") return `good_ending_${character}`;
    if (type === "normal") return `normal_ending_${character}`;
  }

  return null;
};

/**
 * 엔딩 관련 에러 메시지
 */
export const ENDING_ERROR_MESSAGES = {
  VALIDATION_ERROR:
    "엔딩 정보가 유효하지 않습니다. 필수 데이터(타입, 제목, 메시지)가 누락되었습니다.",
  SCENE_ID_ERROR: "엔딩 타입에 해당하는 씬 ID를 찾을 수 없습니다.",
  SCENE_NOT_FOUND: "엔딩 씬이 존재하지 않습니다. 스토리 데이터를 확인해주세요.",
  RESULT_DISPLAY_ERROR:
    "엔딩 결과를 표시할 수 없습니다. 엔딩 정보가 누락되었거나 유효하지 않습니다.",
};

/**
 * 스토리 관련 에러 메시지
 */
export const STORY_ERROR_MESSAGES = {
  FLOW_ERROR: (error) => `스토리가 끊겼습니다: ${error}`,
  CHOICE_ERROR: (choiceText) =>
    `선택지 "${choiceText}"에 다음 씬 정보가 없습니다.`,
};

/**
 * 확인 모달 메시지
 */
export const CONFIRM_MESSAGES = {
  RESET_TO_TITLE:
    "처음 화면으로 돌아가면 현재 진행 중인 내용이 사라질 수 있습니다. <strong>계속하시겠습니까?</strong>",
  STORY_ERROR: (errorMessage) =>
    `스토리 데이터 오류: <strong>${errorMessage}</strong><br/><br/>처음 화면으로 돌아갑니다.`,
};
