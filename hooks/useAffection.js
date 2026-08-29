'use client';

import { useState, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { clampAffection, getInitialAffection } from '../utils/affectionHelper';

export const useAffection = () => {
  const { characters } = useGameContext();

  // 초기 호감도: 각 캐릭터의 initialAffection을 clamp하여 사용
  const [affection, setAffection] = useState(() => getInitialAffection());

  const updateAffection = useCallback((changes) => {
    setAffection((prev) => {
      const updated = { ...prev };
      Object.entries(changes).forEach(([charId, change]) => {
        // 현재 값 가져오기 (없으면 캐릭터의 initialAffection 사용)
        const current =
          prev[charId] ?? (characters?.[charId]?.initialAffection ?? 0);
        const newValue = current + Number(change || 0);
        // 캐릭터별 min/max 범위로 clamp
        updated[charId] = clampAffection(charId, newValue);
      });
      return updated;
    });
  }, [characters]);

  const resetAffection = useCallback(() => {
    setAffection(getInitialAffection());
  }, []);

  return { affection, updateAffection, resetAffection, setAffection };
};
