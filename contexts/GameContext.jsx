'use client';

/**
 * GameContext.jsx - 전역 게임 설정 및 스토리 데이터 관리
 *
 * 음소거 상태, 사용자 상호작용, 스토리 데이터를 전역으로 관리
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { setStoryData as setImageCollectorData } from "@/utils/imageCollector";
import { setStoryData as setAffectionHelperData } from "@/utils/affectionHelper";
import { setStoryData as setBackgroundHelperData } from "@/utils/backgroundHelper";
import { setStoryData as setEndingLogicData } from "@/utils/endingLogic";
import { setStoryData as setStoryValidatorData } from "@/utils/storyValidator";
import { setStoryData as setSpeakerHelperData } from "@/utils/speakerHelper";
import { validateStoryData, logValidationErrors } from "@/utils/storyDataValidator";

const GameContext = createContext(null);

export const GameContextProvider = ({ children }) => {
  // BGM 음소거 상태
  const [isMuted, setIsMuted] = useState(true);

  // 사용자 상호작용 여부 (게임 시작 버튼 클릭 여부)
  const [hasInteracted, setHasInteracted] = useState(false);

  // 스토리 데이터 (public/storyData.json에서 로드)
  const [storyData, setStoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // 검증 결과
  const [validationErrors, setValidationErrors] = useState([]);

  // 스토리 데이터 로드
  useEffect(() => {
    const loadStoryData = async () => {
      try {
        // Cache-busting: 항상 최신 데이터를 가져오기 위해 timestamp 추가
        const timestamp = Date.now();
        const response = await fetch(`/storyData.json?v=${timestamp}`, {
          cache: 'no-cache', // 브라우저 캐시 비활성화
        });
        if (!response.ok) {
          throw new Error(`Failed to load story data: ${response.status}`);
        }
        const data = await response.json();
        setStoryData(data);

        // 데이터 검증
        const errors = validateStoryData(data);
        setValidationErrors(errors);

        // 콘솔에 검증 결과 출력
        logValidationErrors(errors);

        // utils 파일들에 스토리 데이터 설정
        setImageCollectorData(data);
        setAffectionHelperData(data);
        setBackgroundHelperData(data);
        setEndingLogicData(data);
        setStoryValidatorData(data);
        setSpeakerHelperData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('[GameContext] 스토리 데이터 로드 실패:', error);
        setLoadError(error.message);
        setIsLoading(false);
      }
    };

    loadStoryData();
  }, []);

  // 음소거 토글 함수
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const value = {
    isMuted,
    setIsMuted,
    toggleMute,
    hasInteracted,
    setHasInteracted,
    // 스토리 데이터
    storyData,
    isLoading,
    loadError,
    // 검증 결과
    validationErrors,
    // 개별 데이터 접근용 헬퍼
    gameInfo: storyData?.gameInfo,
    characters: storyData?.characters,
    places: storyData?.places,
    storyScenes: storyData?.storyScenes,
    endingConfig: storyData?.endingConfig,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// GameContext를 쉽게 사용하기 위한 커스텀 훅
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameContextProvider");
  }
  return context;
};
