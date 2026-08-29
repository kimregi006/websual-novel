'use client';

/**
 * useImagePreloader.js - 이미지 preload 관리 Hook
 *
 * 기능:
 * - scene, dialogueIndex 변경 시 자동으로 이미지 preload
 * - 렌더링과 분리된 비동기 preload
 * - 타이틀 화면 진입 시 초기 이미지 preload
 */

import { useEffect, useRef, useState } from "react";
import { preloadImages, preloadImagesBlocking, clearPreloadCache } from "@/utils/imagePreloader";
import { collectPreloadImages } from "@/utils/imageCollector";
import { useGameContext } from "@/contexts/GameContext";

/**
 * 이미지 preload 관리 Hook
 *
 * @param {string} currentSceneId - 현재 씬 ID
 * @param {number} dialogueIndex - 현재 dialogue 인덱스
 * @param {object} options - 옵션
 * @param {boolean} options.enabled - preload 활성화 여부 (기본: true)
 * @param {number} options.lookAheadDialogues - 현재 scene에서 미리 볼 dialogue 개수 (기본: 5)
 * @param {number} options.lookAheadScenes - 다음 scene 개수 (기본: 2)
 * @param {boolean} options.resetOnMount - 마운트 시 캐시 초기화 여부 (기본: false)
 */
export const useImagePreloader = (
  currentSceneId,
  dialogueIndex = 0,
  options = {}
) => {
  const {
    enabled = true,
    lookAheadDialogues = 5,
    lookAheadScenes = 2,
    resetOnMount = false,
  } = options;

  const previousSceneIdRef = useRef(null);
  const previousDialogueIndexRef = useRef(null);
  const preloadInProgressRef = useRef(false);

  // 마운트 시 캐시 초기화 (옵션)
  useEffect(() => {
    if (resetOnMount) {
      clearPreloadCache();
    }
  }, [resetOnMount]);

  // scene 또는 dialogueIndex 변경 시 preload 실행
  useEffect(() => {
    if (!enabled || !currentSceneId) return;

    // 이전과 동일한 상태면 skip
    if (
      previousSceneIdRef.current === currentSceneId &&
      previousDialogueIndexRef.current === dialogueIndex
    ) {
      return;
    }

    // 이미 preload 진행 중이면 skip (중복 방지)
    if (preloadInProgressRef.current) {
      return;
    }

    // preload 실행
    const performPreload = async () => {
      preloadInProgressRef.current = true;

      try {
        // 이미지 URL 수집
        const imageUrls = collectPreloadImages(currentSceneId, dialogueIndex, {
          lookAheadDialogues,
          lookAheadScenes,
        });

        if (imageUrls.length > 0) {
          console.log(
            `[useImagePreloader] Preloading ${imageUrls.length} images for scene: ${currentSceneId}, dialogue: ${dialogueIndex}`
          );

          // 비동기로 preload (렌더링 차단 없음)
          await preloadImages(imageUrls);
        }
      } catch (error) {
        console.error("[useImagePreloader] Preload error:", error);
      } finally {
        preloadInProgressRef.current = false;
        previousSceneIdRef.current = currentSceneId;
        previousDialogueIndexRef.current = dialogueIndex;
      }
    };

    // 렌더링 차단 방지를 위해 setTimeout으로 비동기 실행
    const timeoutId = setTimeout(() => {
      performPreload();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentSceneId, dialogueIndex, enabled, lookAheadDialogues, lookAheadScenes]);

  return {
    clearCache: clearPreloadCache,
  };
};

/**
 * 타이틀 화면용 초기 이미지 preload Hook (차단형)
 * 모든 이미지가 로드될 때까지 대기하고 로딩 상태를 반환
 *
 * @param {string[]} titleImages - 타이틀 이미지 URL 배열
 * @param {boolean} enabled - preload 활성화 여부
 * @returns {{isLoading: boolean, isReady: boolean, progress: {loaded: number, total: number}}}
 */
export const useTitleScreenPreloader = (titleImages = [], enabled = true) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasStartedRef.current) return;

    if (titleImages.length === 0) {
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    hasStartedRef.current = true;

    const performPreload = async () => {
      console.log(
        `[useTitleScreenPreloader] Blocking preload for ${titleImages.length} title images`
      );

      setIsLoading(true);
      setIsReady(false);

      try {
        const result = await preloadImagesBlocking(titleImages, { timeout: 30000 });

        setProgress({ loaded: result.loaded, total: result.total });

        if (result.success) {
          console.log("[useTitleScreenPreloader] All title images loaded successfully");
          setIsReady(true);
        } else {
          console.warn(
            `[useTitleScreenPreloader] Some images failed to load: ${result.failed.length}/${result.total}`
          );
          // 일부 실패해도 화면은 표시 (최소한의 이미지만 로드되면 OK)
          setIsReady(result.loaded > 0);
        }
      } catch (error) {
        console.error("[useTitleScreenPreloader] Preload error:", error);
        setIsReady(true); // 에러가 나도 화면은 표시
      } finally {
        setIsLoading(false);
      }
    };

    performPreload();
  }, [titleImages, enabled]);

  return { isLoading, isReady, progress };
};

/**
 * Scene 배경 이미지 preload Hook (차단형)
 * 배경 이미지가 로드될 때까지 대기
 *
 * @param {string} placeId - 장소 ID
 * @returns {{isLoading: boolean, isReady: boolean}}
 */
export const useSceneBackgroundPreloader = (placeId) => {
  const { places } = useGameContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const previousPlaceIdRef = useRef(null);

  useEffect(() => {
    if (!placeId) {
      setIsReady(true);
      return;
    }

    // 같은 배경이면 skip
    if (previousPlaceIdRef.current === placeId) {
      setIsReady(true);
      return;
    }

    const performPreload = async () => {
      setIsLoading(true);
      setIsReady(false);

      try {
        // 배경 이미지 URL 생성
        const place = places[placeId];

        if (!place || !place.image) {
          setIsReady(true);
          setIsLoading(false);
          return;
        }

        const bgUrl = `/assets/places/${place.image}`;

        console.log(`[useSceneBackgroundPreloader] Preloading background: ${placeId}`);

        const result = await preloadImagesBlocking([bgUrl], { timeout: 10000 });

        if (result.success) {
          console.log(`[useSceneBackgroundPreloader] Background loaded: ${placeId}`);
          setIsReady(true);
          previousPlaceIdRef.current = placeId;
        } else {
          console.warn(`[useSceneBackgroundPreloader] Failed to load background: ${placeId}`);
          setIsReady(true); // 실패해도 화면은 표시
        }
      } catch (error) {
        console.error("[useSceneBackgroundPreloader] Preload error:", error);
        setIsReady(true); // 에러가 나도 화면은 표시
      } finally {
        setIsLoading(false);
      }
    };

    performPreload();
  }, [placeId]);

  return { isLoading, isReady };
};
