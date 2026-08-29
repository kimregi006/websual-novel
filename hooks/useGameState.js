'use client';

import { useState, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';

export const useGameState = () => {
  const { storyScenes } = useGameContext();
  const [currentSceneId, setCurrentSceneId] = useState('scene1');
  const [history, setHistory] = useState(['scene1']);

  const getCurrentScene = useCallback(() => {
    if (!storyScenes) return null;
    return storyScenes.find(scene => scene.id === currentSceneId);
  }, [currentSceneId, storyScenes]);

  const goToScene = useCallback((sceneId) => {
    setCurrentSceneId(sceneId);
    setHistory(prev => [...prev, sceneId]);
  }, []);

  // 타이틀 화면으로 돌아가기 (완전 초기화)
  const resetToTitle = useCallback(() => {
    setCurrentSceneId('scene1');
    setHistory(['scene1']);
  }, []);

  // 게임을 처음부터 다시 시작 (첫 씬부터)
  const resetGame = useCallback(() => {
    setCurrentSceneId('scene1');
    setHistory(['scene1']);
  }, []);

  return {
    currentSceneId,
    currentScene: getCurrentScene(),
    goToScene,
    resetGame,
    resetToTitle,
    history
  };
};
