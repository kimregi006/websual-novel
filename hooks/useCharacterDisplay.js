'use client';

/**
 * useCharacterDisplay.js
 * - 이전 화면에 없던 캐릭터가 등장할 때만 isNew=true 부여
 * - characters: undefined → 이전 상태 유지
 * - characters: [] → 캐릭터 비우기(의도된 퇴장)
 * - characters: [...] → 캐릭터 정보 업데이트
 */

import { useState, useEffect, useCallback } from "react";
import { arrayToCharacterMap } from "@/utils/sceneHelpers";

export const useCharacterDisplay = (sceneId, currentDialogue) => {
  const [displayCharacters, setDisplayCharacters] = useState({});
  const [displayedCharacters, setDisplayedCharacters] = useState({});
  const [loadedPlace, setLoadedPlace] = useState(null);

  const stabilizeCharacterMap = useCallback((prev = {}, next = {}) => {
    const result = {};
    for (const id of Object.keys(next)) {
      const p = prev[id];
      const n = next[id];
      // 값이 완전히 같으면 이전 객체 재사용(렌더 안정화)
      if (
        p &&
        p.emotion === n.emotion &&
        p.position === n.position &&
        p.active === n.active &&
        p.isNew === n.isNew
      ) {
        result[id] = p;
      } else {
        result[id] = n;
      }
    }
    return result;
  }, []);

  // ✅ dialogue characters 반영
  useEffect(() => {
    if (!currentDialogue) return;

    queueMicrotask(() => {
      // ✅ characters가 undefined면 이전 상태 유지 (업데이트하지 않음)
      // ✅ characters가 []면 의도적 비우기
      // ✅ characters가 [...]면 새로운 캐릭터 정보로 업데이트
      if (currentDialogue.characters === undefined) {
        return; // 이전 상태 유지
      }

      const rawNext = arrayToCharacterMap(currentDialogue.characters);

      setDisplayCharacters((prev) => {
        const flaggedNext = {};
        for (const id of Object.keys(rawNext)) {
          flaggedNext[id] = {
            ...rawNext[id],
            // ✅ 이전에 화면에 있었으면 기존 isNew 값 유지
            // ✅ 이전에 화면에 없었으면 true (새로 등장)
            isNew: prev[id]?.isNew ?? true,
          };
        }

        return stabilizeCharacterMap(prev, flaggedNext);
      });
    });
  }, [currentDialogue, stabilizeCharacterMap]);

  // ✅ displayedCharacters는 그냥 따라가게만(필요하면 그대로 유지)
  const updateDisplayedCharacters = useCallback((nextCharacters) => {
    setDisplayedCharacters(nextCharacters || {});
  }, []);

  // 로드된 장소 초기화(필요 없으면 삭제 가능)
  useEffect(() => {
    if (loadedPlace && currentDialogue) {
      queueMicrotask(() => setLoadedPlace(null));
    }
  }, [loadedPlace, currentDialogue]);

  const resetCharacterDisplay = useCallback(() => {
    setDisplayCharacters({});
    setDisplayedCharacters({});
    setLoadedPlace(null);
  }, []);

  return {
    displayCharacters,
    displayedCharacters,
    loadedPlace,
    setLoadedPlace,
    resetCharacterDisplay,
    updateDisplayedCharacters,
  };
};
