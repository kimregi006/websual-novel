// 동적으로 설정 가능한 스토리 데이터
let endingConfig = {};
let characters = {};

/**
 * 스토리 데이터 설정
 * @param {Object} data - storyData 객체
 */
export const setStoryData = (data) => {
  if (data) {
    endingConfig = data.endingConfig || {};
    characters = data.characters || {};
  }
};

/**
 * 호감도를 기반으로 엔딩을 결정합니다
 * @param {object} affection - 각 캐릭터의 호감도 객체 { sage: 5, ruby: 3 }
 * @returns {object} - 엔딩 정보 { type, character, title, message, cutsceneImage? }
 *
 * 엔딩 우선순위:
 * 1. Bad 엔딩 (모든 캐릭터가 Bad 임계값 미만)
 * 2. Best 엔딩 (단독 캐릭터, 다른 캐릭터는 Best 미만)
 * 3. Duo/Multi 엔딩 (2명 이상 Best 조건 만족, 큰 그룹 우선)
 * 4. Individual Good/Normal 엔딩 (최고 호감도 캐릭터 기준)
 */
export const getEnding = (affection) => {
  const { thresholds, common, characterEndings, duo } = endingConfig;

  // 가장 높은 호감도를 가진 캐릭터 찾기
  const characterEntries = Object.entries(affection);
  const maxAffection = Math.max(...characterEntries.map(([, value]) => value));

  // 1. 배드 엔딩: 최고 호감도가 임계값보다 낮음
  if (maxAffection < thresholds.bad) {
    return {
      type: "bad",
      character: null,
      title: common.bad.title,
      message: common.bad.message,
    };
  }

  // Best 조건을 만족하는 캐릭터들 찾기
  const bestCharacters = characterEntries.filter(
    ([, value]) => value >= thresholds.best
  );
  const bestCharacterIds = bestCharacters.map(([id]) => id);

  // 2. 단독 Best 엔딩: Best 조건을 만족하는 캐릭터가 정확히 1명일 때
  if (bestCharacters.length === 1) {
    const [topCharacter] = bestCharacterIds;
    const charEndings = characterEndings?.[topCharacter];

    if (charEndings?.best) {
      return {
        type: "best",
        character: topCharacter,
        ...charEndings.best,
      };
    }

    // characterEndings가 없으면 common.best로 fallback (있다면)
    if (common?.best) {
      return {
        type: "best",
        character: topCharacter,
        title: common.best.title || `${getCharacterName(topCharacter)} - Best 엔딩`,
        message: common.best.message || `${getCharacterName(topCharacter)}와 최고의 관계를 맺었다.`,
        cutsceneImage: common.best.cutsceneImage,
      };
    }
  }

  // 3. Duo/Multi 엔딩: 2명 이상이 Best 조건을 만족할 때
  if (bestCharacters.length >= 2 && duo && Array.isArray(duo)) {
    // 캐릭터 배열 길이가 큰 순서로 정렬
    const sortedDuoConfigs = [...duo].sort(
      (a, b) => b.characters.length - a.characters.length
    );

    // 각 duo 설정을 확인
    for (const config of sortedDuoConfigs) {
      // 설정된 모든 캐릭터가 Best 조건을 만족하는지 확인
      const allMatch = config.characters.every((charId) =>
        bestCharacterIds.includes(charId)
      );

      if (allMatch) {
        return {
          type: "duo",
          character: null,
          characters: config.characters,
          title: config.title,
          message: config.message,
          cutsceneImage: config.cutsceneImage,
        };
      }
    }

    // duo 설정에 매칭되는 조합이 없으면 기본 duo 엔딩
    return {
      type: "duo",
      character: null,
      characters: bestCharacterIds,
      title: "함께한 길",
      message: "모두와 함께 걸어간 소중한 시간이었다.",
    };
  }

  // 4. 특정 캐릭터 개별 엔딩: 최고 호감도 캐릭터 기준
  const topCharacter = characterEntries.find(
    ([, value]) => value === maxAffection
  )[0];
  const topValue = maxAffection;

  // 캐릭터별 엔딩 데이터 가져오기
  const charEndings = characterEndings?.[topCharacter];

  // 호감도 수치에 따라 엔딩 등급 결정
  if (topValue >= thresholds.good) {
    // Good 엔딩: characterEndings가 있으면 사용, 없으면 common.good으로 fallback
    if (charEndings?.good) {
      return {
        type: "good",
        character: topCharacter,
        ...charEndings.good,
      };
    } else if (common?.good) {
      return {
        type: "good",
        character: topCharacter,
        title: common.good.title || `${getCharacterName(topCharacter)} - Good 엔딩`,
        message: common.good.message || `${getCharacterName(topCharacter)}와 좋은 관계를 맺었다.`,
        cutsceneImage: common.good.cutsceneImage,
      };
    } else {
      // common.good도 없으면 기본 good 엔딩
      return {
        type: "good",
        character: topCharacter,
        title: `${getCharacterName(topCharacter)} - Good 엔딩`,
        message: `${getCharacterName(topCharacter)}와 좋은 관계를 맺었다.`,
      };
    }
  } else {
    // Normal 엔딩: common normal 엔딩 사용
    if (common?.normal) {
      return {
        type: "normal",
        character: null,
        title: common.normal.title,
        message: common.normal.message,
        cutsceneImage: common.normal.cutsceneImage,
      };
    } else {
      // common.normal도 없으면 기본 normal 엔딩
      return {
        type: "normal",
        character: topCharacter,
        title: `${getCharacterName(topCharacter)} - Normal 엔딩`,
        message: `${getCharacterName(topCharacter)}와 친해졌다.`,
      };
    }
  }
};

/**
 * 캐릭터 ID로부터 이름을 가져옵니다
 * @param {string} characterId - 캐릭터 ID
 * @returns {string} - 캐릭터 이름
 */
const getCharacterName = (characterId) => {
  return characters[characterId]?.name || characterId;
};

/**
 * 엔딩 타입에 따른 색상을 반환합니다
 * @param {string} endingType - 엔딩 타입 (bad, normal, good, best)
 * @returns {string} - 색상 코드
 */
export const getEndingColor = (endingType) => {
  const colors = {
    bad: "#8b4513",
    normal: "#4682b4",
    good: "#32cd32",
    best: "#ffd700",
    duo: "#9370db",
  };
  return colors[endingType] || "#888";
};

/**
 * 엔딩 씬 ID로부터 엔딩 정보를 역으로 생성합니다
 * checkAffection 없이 바로 엔딩 씬으로 이동한 경우 사용
 * @param {string} sceneId - 엔딩 씬 ID (예: "best_ending_sage", "bad_ending")
 * @returns {object|null} - 엔딩 정보 { type, character, title, message }
 */
export const parseEndingFromSceneId = (sceneId) => {
  if (!sceneId) return null;

  const { common, characterEndings, duo } = endingConfig;

  // bad_ending
  if (sceneId === "bad_ending") {
    return {
      type: "bad",
      character: null,
      title: common?.bad?.title || "Bad 엔딩",
      message: common?.bad?.message || "모험이 좋지 않게 끝났다.",
    };
  }

  // normal_ending
  if (sceneId === "normal_ending") {
    return {
      type: "normal",
      character: null,
      title: common?.normal?.title || "Normal 엔딩",
      message: common?.normal?.message || "평범한 여정이었다.",
    };
  }

  // duo_ending_sage_ruby 같은 형식
  if (sceneId.startsWith("duo_ending_")) {
    const characterIds = sceneId.replace("duo_ending_", "").split("_");

    // duo 설정에서 매칭되는 조합 찾기
    if (duo && Array.isArray(duo)) {
      const duoConfig = duo.find(
        (d) =>
          d.characters.length === characterIds.length &&
          d.characters.every((c) => characterIds.includes(c))
      );

      if (duoConfig) {
        return {
          type: "duo",
          character: null,
          characters: duoConfig.characters,
          title: duoConfig.title,
          message: duoConfig.message,
          cutsceneImage: duoConfig.cutsceneImage,
        };
      }
    }

    // 기본 duo 엔딩
    return {
      type: "duo",
      character: null,
      characters: characterIds,
      title: "함께한 길",
      message: "모두와 함께 걸어간 소중한 시간이었다.",
    };
  }

  // best_ending_sage, good_ending_sage, normal_ending_sage 같은 형식
  const match = sceneId.match(/^(best|good|normal)_ending_(.+)$/);
  if (match) {
    const [, type, character] = match;
    const charEndings = characterEndings?.[character];

    // 캐릭터별 엔딩 설정이 있으면 사용
    if (charEndings?.[type]) {
      return {
        type,
        character,
        ...charEndings[type],
      };
    }

    // 없으면 common 설정 사용
    const commonEnding = common?.[type];
    if (commonEnding) {
      return {
        type,
        character,
        title: commonEnding.title || `${getCharacterName(character)} - ${type} 엔딩`,
        message: commonEnding.message || `${getCharacterName(character)}와 좋은 관계를 맺었다.`,
        cutsceneImage: commonEnding.cutsceneImage,
      };
    }

    // 기본값
    return {
      type,
      character,
      title: `${getCharacterName(character)} - ${type} 엔딩`,
      message: `${getCharacterName(character)}와 함께한 여정이었다.`,
    };
  }

  return null;
};
