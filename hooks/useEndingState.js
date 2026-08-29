'use client';

/**
 * useEndingState.js - 엔딩 상태 관리 훅
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { getEnding } from "@/utils/endingLogic";
import {
  validateEndingInfo,
  endingSceneExists,
} from "@/utils/storyValidator";
import {
  getEndingSceneId,
  ENDING_ERROR_MESSAGES,
} from "@/constants/endingConfig";

export const useEndingState = (currentScene, currentSceneId, affection, lines, dialogueIndex, handleStoryError) => {
  const [endingInfo, setEndingInfo] = useState(null);
  const [showEndingResult, setShowEndingResult] = useState(false);

  // 엔딩 정보 설정 (checkAffection이 있는 씬)
  useEffect(() => {
    if (!currentScene?.checkAffection || showEndingResult || endingInfo) {
      return;
    }

    const computed = getEnding(affection);
    if (!validateEndingInfo(computed)) {
      queueMicrotask(() => {
        handleStoryError(ENDING_ERROR_MESSAGES.VALIDATION_ERROR);
      });
      return;
    }

    queueMicrotask(() => {
      setEndingInfo(computed);
    });
  }, [currentScene, affection, showEndingResult, endingInfo, handleStoryError]);

  // checkAffection 처리를 위한 엔딩 씬 ID 계산
  const computedEndingSceneId = useMemo(() => {
    if (!currentScene?.checkAffection) return null;
    if (showEndingResult) return null;
    if (currentScene.type === "ending") return null;

    // 모든 대사를 다 봤는지 확인
    if (lines.length > 0 && dialogueIndex < lines.length - 1) {
      return null;
    }

    // 엔딩 정보 계산
    let info = endingInfo;
    if (!info) {
      const computed = getEnding(affection);
      if (!validateEndingInfo(computed)) {
        return "VALIDATION_ERROR";
      }
      info = computed;
    }

    const targetSceneId = getEndingSceneId(info);

    if (!targetSceneId) return "SCENE_ID_ERROR";
    if (!endingSceneExists(targetSceneId)) return "SCENE_NOT_FOUND";
    if (currentSceneId === targetSceneId) return null;

    return targetSceneId;
  }, [
    currentScene,
    lines,
    dialogueIndex,
    showEndingResult,
    affection,
    endingInfo,
    currentSceneId,
  ]);

  const resetEndingState = useCallback(() => {
    setEndingInfo(null);
    setShowEndingResult(false);
  }, []);

  const showEnding = useCallback(() => {
    setShowEndingResult(true);
  }, []);

  return {
    endingInfo,
    showEndingResult,
    computedEndingSceneId,
    setEndingInfo,
    resetEndingState,
    showEnding,
  };
};
