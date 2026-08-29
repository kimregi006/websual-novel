'use client';

import { useCallback } from "react";
import { useGameContext } from "@/contexts/GameContext";

const SAVE_KEY_PREFIX = "visualNovel_save_slot_";
const SLOT_COUNT = 3;

export const useSaveLoad = () => {
  const { storyScenes, characters, places } = useGameContext();
  // 특정 슬롯에 게임 상태 저장
  const saveGame = useCallback((slotId, gameState) => {
    // SSR 가드
    if (typeof window === 'undefined') {
      return { success: false, error: "localStorage not available" };
    }

    const {
      currentSceneId,
      affection,
      endingInfo,
      showEndingResult,
      dialogueIndex,
      currentPlace,
    } = gameState;

    // 현재 씬 정보 가져오기
    const currentScene = storyScenes.find(
      (scene) => scene.id === currentSceneId
    );
    const sceneName = getSceneName(currentScene, currentPlace, dialogueIndex, characters, places);

    const saveData = {
      slotId,
      timestamp: new Date().toISOString(),
      sceneId: currentSceneId,
      sceneName,
      affection,
      endingInfo,
      showEndingResult,
      dialogueIndex,
      currentPlace,
      version: "1.0", // 나중에 호환성을 위해
    };

    try {
      localStorage.setItem(
        `${SAVE_KEY_PREFIX}${slotId}`,
        JSON.stringify(saveData)
      );
      return { success: true, data: saveData };
    } catch (error) {
      console.error("Save failed:", error);
      return { success: false, error: error.message };
    }
  }, [storyScenes, characters, places]);

  // 특정 슬롯에서 게임 상태 불러오기
  const loadGame = useCallback((slotId) => {
    // SSR 가드
    if (typeof window === 'undefined') {
      return { success: false, error: "localStorage not available" };
    }

    try {
      const savedData = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
      if (!savedData) {
        return { success: false, error: "저장 데이터가 없습니다." };
      }

      const saveData = JSON.parse(savedData);
      return { success: true, data: saveData };
    } catch (error) {
      console.error("Load failed:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // 모든 슬롯 정보 가져오기
  const getAllSlots = useCallback(() => {
    // SSR 가드 - 빈 슬롯 배열 반환
    if (typeof window === 'undefined') {
      return Array.from({ length: SLOT_COUNT }, (_, i) => ({
        slotId: i + 1,
        isEmpty: true,
        timestamp: null,
        sceneName: null,
      }));
    }

    const slots = [];
    for (let i = 1; i <= SLOT_COUNT; i++) {
      try {
        const savedData = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`);
        if (savedData) {
          const data = JSON.parse(savedData);
          slots.push({
            slotId: i,
            isEmpty: false,
            ...data,
          });
        } else {
          slots.push({
            slotId: i,
            isEmpty: true,
            timestamp: null,
            sceneName: null,
          });
        }
      } catch (error) {
        console.error(`Error loading slot ${i}:`, error);
        slots.push({
          slotId: i,
          isEmpty: true,
          timestamp: null,
          sceneName: null,
        });
      }
    }
    return slots;
  }, []);

  // 특정 슬롯 삭제
  const deleteSlot = useCallback((slotId) => {
    // SSR 가드
    if (typeof window === 'undefined') {
      return { success: false, error: "localStorage not available" };
    }

    try {
      localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`);
      return { success: true };
    } catch (error) {
      console.error("Delete failed:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // 전체 세이브 데이터 내보내기
  const exportAllSaves = useCallback(() => {
    // SSR 가드
    if (typeof window === 'undefined') {
      return { success: false, error: "Browser API not available" };
    }

    try {
      const allSaves = {};
      for (let i = 1; i <= SLOT_COUNT; i++) {
        const savedData = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`);
        if (savedData) {
          allSaves[`slot_${i}`] = JSON.parse(savedData);
        }
      }

      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        saves: allSaves,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `visual_novel_saves_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      console.error("Export all saves failed:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // 전체 세이브 데이터 불러오기
  const importAllSaves = useCallback((file) => {
    // SSR 가드
    if (typeof window === 'undefined') {
      return Promise.resolve({ success: false, error: "Browser API not available" });
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);

          if (!importData.saves) {
            resolve({
              success: false,
              error: "유효하지 않은 세이브 파일입니다.",
            });
            return;
          }

          // 모든 기존 세이브 삭제
          for (let i = 1; i <= SLOT_COUNT; i++) {
            localStorage.removeItem(`${SAVE_KEY_PREFIX}${i}`);
          }

          // 새로운 세이브 데이터 저장
          Object.entries(importData.saves).forEach(([key, saveData]) => {
            const slotId =
              saveData.slotId || parseInt(key.replace("slot_", ""));
            localStorage.setItem(
              `${SAVE_KEY_PREFIX}${slotId}`,
              JSON.stringify(saveData)
            );
          });

          resolve({
            success: true,
            count: Object.keys(importData.saves).length,
          });
        } catch (error) {
          console.error("Import all saves failed:", error);
          resolve({ success: false, error: error.message });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, error: "파일을 읽을 수 없습니다." });
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    saveGame,
    loadGame,
    getAllSlots,
    deleteSlot,
    exportAllSaves,
    importAllSaves,
    SLOT_COUNT,
  };
};

// speaker ID를 표시 이름으로 변환
const getSpeakerName = (speakerId, characters) => {
  if (!speakerId) return "알 수 없음";

  if (speakerId === "narrator") return "나레이터";
  if (speakerId === "me") return "나";

  // characters 데이터에서 이름 찾기
  const character = characters[speakerId];
  return character?.name || speakerId;
};

// 씬 이름 생성 헬퍼 함수
const getSceneName = (scene, currentPlace, dialogueIndex = 0, characters, places) => {
  if (!scene) return "알 수 없는 장소";

  if (scene.type === "title") {
    return "타이틀 화면";
  }

  if (scene.type === "ending") {
    return "엔딩";
  }

  // place ID를 번역된 이름으로 변환
  const getPlaceName = (placeId) => {
    if (!placeId) return "스토리 진행 중";
    return places[placeId]?.name || placeId;
  };

  const placeName = getPlaceName(currentPlace);

  if (scene.type === "choice") {
    return `${placeName} - 선택`;
  }

  // 저장 시점의 정확한 현재 대사의 speaker 추출
  let speakerId = null;

  // 1. dialogues 배열 (새 구조)
  if (Array.isArray(scene.dialogues) && scene.dialogues.length > 0) {
    const currentDialogue = scene.dialogues[dialogueIndex] || scene.dialogues[0];
    speakerId = currentDialogue?.speaker;
  }
  // 2. dialogue 단일 객체 (이전 구조 호환)
  else if (scene.dialogue?.speaker) {
    speakerId = scene.dialogue.speaker;
  }

  const speakerName = getSpeakerName(speakerId, characters);

  return `${placeName} - ${speakerName}`;
};
