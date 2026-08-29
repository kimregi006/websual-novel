'use client';

/**
 * useDialogueState.js - 대사 진행 상태 관리 훅
 */

import { useState, useCallback, useEffect } from "react";
import { usePrevious } from "./usePrevious";

export const useDialogueState = (currentSceneId, currentScene) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showReaction, setShowReaction] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(null);
  const [pendingNextScene, setPendingNextScene] = useState(null);

  const prevSceneId = usePrevious(currentSceneId);

  // 씬 변경 시 대사 인덱스와 reaction 상태 리셋
  useEffect(() => {
    if (currentScene && prevSceneId !== currentSceneId) {
      queueMicrotask(() => {
        setDialogueIndex(0);
        setShowReaction(false);
        setCurrentReaction(null);
        setPendingNextScene(null);
      });
    }
  }, [currentScene, currentSceneId, prevSceneId]);

  const resetDialogueState = useCallback(() => {
    setDialogueIndex(0);
    setShowReaction(false);
    setCurrentReaction(null);
    setPendingNextScene(null);
  }, []);

  const incrementDialogueIndex = useCallback(() => {
    setDialogueIndex((prev) => prev + 1);
  }, []);

  const startReaction = useCallback((reaction, nextSceneId) => {
    setCurrentReaction(reaction);
    setPendingNextScene(nextSceneId);
    setShowReaction(true);
  }, []);

  const endReaction = useCallback(() => {
    setShowReaction(false);
    setCurrentReaction(null);
    return pendingNextScene;
  }, [pendingNextScene]);

  return {
    dialogueIndex,
    showReaction,
    currentReaction,
    pendingNextScene,
    setDialogueIndex,
    resetDialogueState,
    incrementDialogueIndex,
    startReaction,
    endReaction,
  };
};
