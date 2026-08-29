/**
 * storyDataValidator.js - storyData 검증 시스템
 *
 * 기능:
 * - 필수 필드 누락 검사
 * - 타입 불일치 검사
 * - 값 유효성 검사
 * - 경로(path) 기반 오류 수집
 */

// Severity 레벨
export const SEVERITY = {
  ERROR: 'error',    // 게임 진행 불가
  WARNING: 'warning' // 대체 처리 가능
};

// Scene 타입
const SCENE_TYPES = ['normal', 'choice', 'ending', 'title'];

/**
 * 검증 결과 객체 생성
 */
const createValidationError = (path, type, message, severity = SEVERITY.ERROR) => ({
  path,
  type,
  message,
  severity
});

/**
 * 필수 필드 검증
 */
const validateRequired = (obj, field, path) => {
  if (obj[field] === undefined || obj[field] === null) {
    return createValidationError(
      `${path}.${field}`,
      'missing_required',
      `필수 필드 '${field}'가 누락되었습니다.`,
      SEVERITY.ERROR
    );
  }
  return null;
};

/**
 * 타입 검증
 */
const validateType = (value, expectedType, path, fieldName) => {
  const actualType = Array.isArray(value) ? 'array' : typeof value;

  if (actualType !== expectedType) {
    return createValidationError(
      path,
      'type_mismatch',
      `'${fieldName}'의 타입이 잘못되었습니다. 예상: ${expectedType}, 실제: ${actualType}`,
      SEVERITY.ERROR
    );
  }
  return null;
};

/**
 * 빈 문자열 검증
 */
const validateNotEmpty = (value, path, fieldName) => {
  if (typeof value === 'string' && value.trim() === '') {
    return createValidationError(
      path,
      'empty_value',
      `'${fieldName}'이 빈 문자열입니다.`,
      SEVERITY.WARNING
    );
  }
  return null;
};

/**
 * Enum 값 검증
 */
const validateEnum = (value, allowedValues, path, fieldName) => {
  if (!allowedValues.includes(value)) {
    return createValidationError(
      path,
      'invalid_enum',
      `'${fieldName}'의 값이 유효하지 않습니다. 허용된 값: ${allowedValues.join(', ')}`,
      SEVERITY.ERROR
    );
  }
  return null;
};

/**
 * gameInfo 검증
 */
const validateGameInfo = (gameInfo) => {
  const errors = [];
  const path = 'gameInfo';

  if (!gameInfo) {
    errors.push(createValidationError(path, 'missing_section', 'gameInfo 섹션이 누락되었습니다.'));
    return errors;
  }

  // 필수 필드
  ['title', 'subtitle', 'me'].forEach(field => {
    const error = validateRequired(gameInfo, field, path);
    if (error) errors.push(error);
  });

  // 타입 검증
  if (gameInfo.title) {
    const error = validateType(gameInfo.title, 'string', `${path}.title`, 'title');
    if (error) errors.push(error);
  }

  // 빈 문자열 검증
  if (gameInfo.title) {
    const error = validateNotEmpty(gameInfo.title, `${path}.title`, 'title');
    if (error) errors.push(error);
  }

  return errors;
};

/**
 * characters 검증
 */
const validateCharacters = (characters) => {
  const errors = [];
  const basePath = 'characters';

  if (!characters || typeof characters !== 'object') {
    errors.push(createValidationError(basePath, 'missing_section', 'characters 섹션이 누락되었거나 타입이 잘못되었습니다.'));
    return errors;
  }

  Object.entries(characters).forEach(([charId, char]) => {
    const path = `${basePath}.${charId}`;

    // 필수 필드
    ['id', 'name', 'color', 'imageFolder', 'emotions'].forEach(field => {
      const error = validateRequired(char, field, path);
      if (error) errors.push(error);
    });

    // emotions 검증
    if (char.emotions) {
      if (typeof char.emotions !== 'object') {
        errors.push(createValidationError(
          `${path}.emotions`,
          'type_mismatch',
          'emotions는 객체여야 합니다.',
          SEVERITY.ERROR
        ));
      } else {
        // 최소 1개 이상의 emotion 필요
        if (Object.keys(char.emotions).length === 0) {
          errors.push(createValidationError(
            `${path}.emotions`,
            'empty_object',
            '최소 1개 이상의 emotion이 필요합니다.',
            SEVERITY.WARNING
          ));
        }
      }
    }

    // 호감도 범위 검증
    if (char.minAffection !== undefined && char.maxAffection !== undefined) {
      if (char.minAffection > char.maxAffection) {
        errors.push(createValidationError(
          `${path}.minAffection`,
          'invalid_range',
          'minAffection이 maxAffection보다 큽니다.',
          SEVERITY.ERROR
        ));
      }
    }
  });

  return errors;
};

/**
 * places 검증
 */
const validatePlaces = (places) => {
  const errors = [];
  const basePath = 'places';

  if (!places || typeof places !== 'object') {
    errors.push(createValidationError(basePath, 'missing_section', 'places 섹션이 누락되었거나 타입이 잘못되었습니다.'));
    return errors;
  }

  Object.entries(places).forEach(([placeId, place]) => {
    const path = `${basePath}.${placeId}`;

    // 필수 필드
    ['id', 'name'].forEach(field => {
      const error = validateRequired(place, field, path);
      if (error) errors.push(error);
    });

    // image 필드는 선택적이지만, 있으면 문자열이어야 함
    if (place.image !== undefined) {
      const error = validateType(place.image, 'string', `${path}.image`, 'image');
      if (error) errors.push(error);
    }
  });

  return errors;
};

/**
 * dialogue 검증
 */
const validateDialogue = (dialogue, index, scenePath, characters) => {
  const errors = [];
  const path = `${scenePath}.dialogues[${index}]`;

  if (!dialogue || typeof dialogue !== 'object') {
    errors.push(createValidationError(path, 'invalid_dialogue', 'dialogue가 유효하지 않습니다.'));
    return errors;
  }

  // speaker는 선택적이지만, 있으면 유효한 캐릭터여야 함
  if (dialogue.speaker !== undefined && dialogue.speaker !== 'narrator' && dialogue.speaker !== 'me' && dialogue.speaker !== '???') {
    const error = validateType(dialogue.speaker, 'string', `${path}.speaker`, 'speaker');
    if (error) {
      errors.push(error);
    } else if (characters && !characters[dialogue.speaker]) {
      errors.push(createValidationError(
        `${path}.speaker`,
        'invalid_character_reference',
        `존재하지 않는 캐릭터 참조: ${dialogue.speaker}`,
        SEVERITY.ERROR
      ));
    }
  }

  // text는 필수
  const textError = validateRequired(dialogue, 'text', path);
  if (textError) {
    errors.push(textError);
  } else {
    const typeError = validateType(dialogue.text, 'string', `${path}.text`, 'text');
    if (typeError) errors.push(typeError);

    const emptyError = validateNotEmpty(dialogue.text, `${path}.text`, 'text');
    if (emptyError) errors.push(emptyError);
  }

  // characters 검증 (선택적)
  if (dialogue.characters !== undefined) {
    const typeError = validateType(dialogue.characters, 'array', `${path}.characters`, 'characters');
    if (typeError) {
      errors.push(typeError);
    } else {
      dialogue.characters.forEach((char, charIndex) => {
        const charPath = `${path}.characters[${charIndex}]`;

        if (!char || typeof char !== 'object') {
          errors.push(createValidationError(charPath, 'invalid_character', 'character가 유효하지 않습니다.'));
          return;
        }

        ['id', 'emotion', 'position'].forEach(field => {
          const error = validateRequired(char, field, charPath);
          if (error) errors.push(error);
        });

        // 캐릭터 ID 참조 검증
        if (char.id && characters && !characters[char.id]) {
          errors.push(createValidationError(
            `${charPath}.id`,
            'invalid_character_reference',
            `존재하지 않는 캐릭터: ${char.id}`,
            SEVERITY.ERROR
          ));
        }

        // emotion 참조 검증
        if (char.id && char.emotion && characters && characters[char.id]) {
          const characterData = characters[char.id];
          if (characterData.emotions && !characterData.emotions[char.emotion]) {
            errors.push(createValidationError(
              `${charPath}.emotion`,
              'invalid_emotion_reference',
              `캐릭터 ${char.id}에 존재하지 않는 emotion: ${char.emotion}`,
              SEVERITY.ERROR
            ));
          }
        }
      });
    }
  }

  return errors;
};

/**
 * scene 검증
 */
const validateScene = (scene, characters, places) => {
  const errors = [];
  const path = `scenes.${scene.id}`;

  if (!scene.id) {
    errors.push(createValidationError(path, 'missing_id', 'scene.id가 누락되었습니다.'));
    return errors;
  }

  // type 검증
  if (scene.type) {
    const enumError = validateEnum(scene.type, SCENE_TYPES, `${path}.type`, 'type');
    if (enumError) errors.push(enumError);
  }

  // place 검증 (선택적이지만, 있으면 유효해야 함)
  if (scene.place) {
    if (places && !places[scene.place]) {
      errors.push(createValidationError(
        `${path}.place`,
        'invalid_reference',
        `존재하지 않는 place: ${scene.place}`,
        SEVERITY.WARNING
      ));
    }
  }

  // dialogues 검증
  if (scene.dialogues) {
    const typeError = validateType(scene.dialogues, 'array', `${path}.dialogues`, 'dialogues');
    if (typeError) {
      errors.push(typeError);
    } else {
      if (scene.dialogues.length === 0) {
        errors.push(createValidationError(
          `${path}.dialogues`,
          'empty_array',
          'dialogues 배열이 비어있습니다.',
          SEVERITY.WARNING
        ));
      }

      scene.dialogues.forEach((dialogue, index) => {
        const dialogueErrors = validateDialogue(dialogue, index, path, characters);
        errors.push(...dialogueErrors);
      });
    }
  }

  // scene 레벨 characters 검증
  if (scene.characters && Array.isArray(scene.characters)) {
    scene.characters.forEach((char, index) => {
      const charPath = `${path}.characters[${index}]`;

      if (char.id && characters && !characters[char.id]) {
        errors.push(createValidationError(
          `${charPath}.id`,
          'invalid_character_reference',
          `존재하지 않는 캐릭터: ${char.id}`,
          SEVERITY.ERROR
        ));
      }

      if (char.id && char.emotion && characters && characters[char.id]) {
        const characterData = characters[char.id];
        if (characterData.emotions && !characterData.emotions[char.emotion]) {
          errors.push(createValidationError(
            `${charPath}.emotion`,
            'invalid_emotion_reference',
            `캐릭터 ${char.id}에 존재하지 않는 emotion: ${char.emotion}`,
            SEVERITY.ERROR
          ));
        }
      }
    });
  }

  // choice scene 검증
  if (scene.type === 'choice') {
    if (!scene.choices || !Array.isArray(scene.choices)) {
      errors.push(createValidationError(
        `${path}.choices`,
        'missing_choices',
        'choice scene에 choices 배열이 없습니다.',
        SEVERITY.ERROR
      ));
    } else if (scene.choices.length === 0) {
      errors.push(createValidationError(
        `${path}.choices`,
        'empty_choices',
        'choices 배열이 비어있습니다.',
        SEVERITY.ERROR
      ));
    } else {
      scene.choices.forEach((choice, index) => {
        const choicePath = `${path}.choices[${index}]`;

        // text는 필수
        const textError = validateRequired(choice, 'text', choicePath);
        if (textError) errors.push(textError);

        // next는 undefined인 경우만 에러 (null은 허용 - 엔딩 선택지 등)
        if (choice.next === undefined) {
          errors.push(createValidationError(
            `${choicePath}.next`,
            'missing_required',
            `필수 필드 'next'가 누락되었습니다.`,
            SEVERITY.ERROR
          ));
        }

        // reaction 검증 (선택적이지만 있으면 유효해야 함)
        if (choice.reaction && choice.reaction.characters && Array.isArray(choice.reaction.characters)) {
          choice.reaction.characters.forEach((char, charIndex) => {
            const reactionCharPath = `${choicePath}.reaction.characters[${charIndex}]`;

            if (char.id && characters && !characters[char.id]) {
              errors.push(createValidationError(
                `${reactionCharPath}.id`,
                'invalid_character_reference',
                `존재하지 않는 캐릭터: ${char.id}`,
                SEVERITY.ERROR
              ));
            }

            if (char.id && char.emotion && characters && characters[char.id]) {
              const characterData = characters[char.id];
              if (characterData.emotions && !characterData.emotions[char.emotion]) {
                errors.push(createValidationError(
                  `${reactionCharPath}.emotion`,
                  'invalid_emotion_reference',
                  `캐릭터 ${char.id}에 존재하지 않는 emotion: ${char.emotion}`,
                  SEVERITY.ERROR
                ));
              }
            }
          });
        }
      });
    }
  }

  // next 검증 (ending scene이 아닌 경우)
  if (scene.type !== 'ending' && scene.type !== 'choice' && !scene.checkAffection) {
    if (!scene.next) {
      errors.push(createValidationError(
        `${path}.next`,
        'missing_next',
        'next scene이 지정되지 않았습니다. (ending/choice scene이 아닌 경우 필수)',
        SEVERITY.WARNING
      ));
    }
  }

  return errors;
};

/**
 * storyScenes 검증
 */
const validateStoryScenes = (storyScenes, characters, places) => {
  const errors = [];
  const basePath = 'storyScenes';

  if (!storyScenes || !Array.isArray(storyScenes)) {
    errors.push(createValidationError(basePath, 'missing_section', 'storyScenes 섹션이 누락되었거나 배열이 아닙니다.'));
    return errors;
  }

  if (storyScenes.length === 0) {
    errors.push(createValidationError(basePath, 'empty_array', 'storyScenes가 비어있습니다.'));
    return errors;
  }

  // scene1 존재 검증
  const hasScene1 = storyScenes.some(scene => scene.id === 'scene1');
  if (!hasScene1) {
    errors.push(createValidationError(
      basePath,
      'missing_scene1',
      '시작 scene (scene1)이 존재하지 않습니다.',
      SEVERITY.ERROR
    ));
  }

  storyScenes.forEach((scene, index) => {
    const sceneErrors = validateScene(scene, characters, places);
    errors.push(...sceneErrors);
  });

  return errors;
};

/**
 * endingConfig 검증
 */
const validateEndingConfig = (endingConfig, characters) => {
  const errors = [];
  const basePath = 'endingConfig';

  if (!endingConfig) {
    errors.push(createValidationError(basePath, 'missing_section', 'endingConfig 섹션이 누락되었습니다.', SEVERITY.WARNING));
    return errors;
  }

  // thresholds 검증
  if (endingConfig.thresholds) {
    ['bad', 'normal', 'good', 'best'].forEach(level => {
      if (endingConfig.thresholds[level] === undefined) {
        errors.push(createValidationError(
          `${basePath}.thresholds.${level}`,
          'missing_threshold',
          `threshold ${level}이 누락되었습니다.`,
          SEVERITY.WARNING
        ));
      }
    });
  }

  // characterEndings 검증
  if (endingConfig.characterEndings && characters) {
    Object.keys(endingConfig.characterEndings).forEach(charId => {
      if (!characters[charId]) {
        errors.push(createValidationError(
          `${basePath}.characterEndings.${charId}`,
          'invalid_character_reference',
          `존재하지 않는 캐릭터: ${charId}`,
          SEVERITY.ERROR
        ));
      }
    });
  }

  // duo 검증
  if (endingConfig.duo && characters) {
    Object.keys(endingConfig.duo).forEach(duoKey => {
      const duo = endingConfig.duo[duoKey];
      if (duo.characters && Array.isArray(duo.characters)) {
        duo.characters.forEach(charId => {
          if (!characters[charId]) {
            errors.push(createValidationError(
              `${basePath}.duo.${duoKey}.characters`,
              'invalid_character_reference',
              `존재하지 않는 캐릭터: ${charId}`,
              SEVERITY.ERROR
            ));
          }
        });
      }
    });
  }

  return errors;
};

/**
 * 전체 storyData 검증
 * @param {Object} storyData - 검증할 storyData 객체
 * @returns {Array} 검증 에러 배열 [{ path, type, message, severity }]
 */
export const validateStoryData = (storyData) => {
  const errors = [];

  if (!storyData || typeof storyData !== 'object') {
    errors.push(createValidationError('root', 'invalid_data', 'storyData가 유효하지 않습니다.'));
    return errors;
  }

  // 각 섹션 검증
  errors.push(...validateGameInfo(storyData.gameInfo));
  errors.push(...validateCharacters(storyData.characters));
  errors.push(...validatePlaces(storyData.places));
  errors.push(...validateStoryScenes(
    storyData.storyScenes,
    storyData.characters,
    storyData.places
  ));
  errors.push(...validateEndingConfig(storyData.endingConfig, storyData.characters));

  return errors;
};

/**
 * 검증 결과 요약
 */
export const getValidationSummary = (errors) => {
  const errorCount = errors.filter(e => e.severity === SEVERITY.ERROR).length;
  const warningCount = errors.filter(e => e.severity === SEVERITY.WARNING).length;

  return {
    total: errors.length,
    errors: errorCount,
    warnings: warningCount,
    hasErrors: errorCount > 0,
    hasWarnings: warningCount > 0
  };
};

/**
 * 콘솔에 검증 결과 출력 (중복 방지)
 */
let lastLoggedErrors = [];

export const logValidationErrors = (errors) => {
  // 이전과 동일한 에러면 출력하지 않음
  const errorSignature = errors.map(e => e.path + e.type).join(',');
  const lastSignature = lastLoggedErrors.map(e => e.path + e.type).join(',');

  if (errorSignature === lastSignature) {
    return;
  }

  lastLoggedErrors = errors;

  if (errors.length === 0) {
    console.log('[StoryData Validation] ✅ 검증 완료. 문제 없음.');
    return;
  }

  const summary = getValidationSummary(errors);

  console.group(`[StoryData Validation] ⚠️ ${summary.total}개 문제 발견 (에러: ${summary.errors}, 경고: ${summary.warnings})`);

  errors.forEach(error => {
    const icon = error.severity === SEVERITY.ERROR ? '❌' : '⚠️';
    console.log(`${icon} [${error.severity.toUpperCase()}] ${error.path}: ${error.message}`);
  });

  console.groupEnd();
};
