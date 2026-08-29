/**
 * speakerHelper.js - DialogueBox speaker 정보 계산
 */

// 동적으로 설정 가능한 스토리 데이터
let characters = {};
let gameInfo = {};

/**
 * 스토리 데이터 설정
 * @param {Object} data - storyData 객체
 */
export const setStoryData = (data) => {
  if (data) {
    characters = data.characters || {};
    gameInfo = data.gameInfo || {};
  }
};

const DEFAULT_COLORS = {
  me: "#dfcb93",
  default: "#333",
};

/**
 * speaker 타입에 따른 표시 이름과 색상 계산
 * @param {string} speaker - speaker ID ("narrator", "me", "???", 또는 캐릭터 ID)
 * @returns {{ displayName: string, speakerColor: string }}
 */
export const getSpeakerInfo = (speaker) => {
  const character = characters[speaker];

  if (speaker === "narrator") {
    return {
      displayName: " ",
      speakerColor: " ",
    };
  }

  if (speaker === "me") {
    return {
      displayName: character?.name || gameInfo.me || "나",
      speakerColor: character?.color || DEFAULT_COLORS.me,
    };
  }

  if (speaker === "???") {
    return {
      displayName: character?.name || "???",
      speakerColor: character?.color || DEFAULT_COLORS.me,
    };
  }

  return {
    displayName: character?.name || speaker,
    speakerColor: character?.color || DEFAULT_COLORS.default,
  };
};
