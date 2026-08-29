'use client';

/**
 * useBGM.js - 배경음악(BGM) 관리 커스텀 훅
 *
 * 배경음악 재생/정지/교체 로직을 캡슐화
 * - Audio 객체 재사용
 * - 씬 변경 시 BGM 자동 제어
 * - 음소거 상태 연동
 * - TitleScreen BGM 지원
 */

import { useEffect, useRef } from "react";

/**
 * BGM을 관리하는 커스텀 훅
 *
 * @param {Object} params
 * @param {Object} params.currentScene - 현재 씬 객체
 * @param {string} params.currentSceneId - 현재 씬 ID
 * @param {boolean} params.showTitleScreen - 타이틀 화면 표시 여부
 * @param {boolean} params.isMuted - 음소거 상태
 * @param {boolean} params.hasInteracted - 사용자 상호작용 여부
 * @param {string} params.titleBGM - 타이틀 화면 BGM (선택적)
 * @returns {Object} BGM 관련 ref 객체
 */
export const useBGM = ({
  currentScene,
  currentSceneId,
  showTitleScreen,
  isMuted,
  hasInteracted,
  titleBGM = null,
}) => {
  // Audio 객체 (재사용)
  const audioRef = useRef(null);
  // 현재 재생 중인 BGM 파일명
  const currentBGMRef = useRef(null);
  // 재생 대기 중인 BGM (사용자 상호작용 전)
  const pendingBGMRef = useRef(null);

  // Effect: BGM 재생 제어
  // 씬 변경 시 backgroundMusic 필드를 확인하여 BGM 재생/정지/교체
  useEffect(() => {
    // BGM 결정: 타이틀 화면이면 titleBGM, 아니면 currentScene.backgroundMusic
    const newBGM = showTitleScreen ? titleBGM : currentScene?.backgroundMusic;

    // Audio 객체가 없으면 생성 (SSR 가드)
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.loop = true; // 배경음악은 반복 재생
      audioRef.current.volume = isMuted ? 0 : 1;
    }

    // 현재 씬에 backgroundMusic이 없으면 BGM 정지
    if (!newBGM) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      currentBGMRef.current = null;
      pendingBGMRef.current = null;
      return;
    }

    // 같은 BGM이면 계속 재생 (이어서 재생)
    if (currentBGMRef.current === newBGM) {
      // 사용자 상호작용이 있었고, 일시정지 상태면 재생
      if (hasInteracted && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch((error) => {
          console.error("[BGM] 재생 실패:", error);
        });
      }
      return;
    }

    // 다른 BGM으로 변경
    // src 설정 및 볼륨 조정
    audioRef.current.src = `/assets/musics/${newBGM}`;
    audioRef.current.volume = isMuted ? 0 : 1;

    // 사용자 상호작용 전: src만 설정하고 재생하지 않음
    if (!hasInteracted) {
      pendingBGMRef.current = newBGM;
      console.log("[BGM] 사용자 상호작용 대기 중, 재생 보류:", newBGM);
      return;
    }

    // 사용자 상호작용 후: BGM 재생
    currentBGMRef.current = newBGM;
    pendingBGMRef.current = null;
    audioRef.current.play().catch((error) => {
      console.error("[BGM] 재생 실패:", error);
    });
  }, [
    currentScene,
    currentSceneId,
    showTitleScreen,
    isMuted,
    hasInteracted,
    titleBGM,
  ]);

  // Effect: hasInteracted가 true가 될 때 대기 중인 BGM 재생
  useEffect(() => {
    if (hasInteracted && pendingBGMRef.current && audioRef.current) {
      const bgmToPlay = pendingBGMRef.current;
      currentBGMRef.current = bgmToPlay;
      pendingBGMRef.current = null;

      console.log("[BGM] 사용자 상호작용 감지, 재생 시작:", bgmToPlay);
      audioRef.current.play().catch((error) => {
        console.error("[BGM] 재생 실패:", error);
      });
    }
  }, [hasInteracted]);

  // Effect: 음소거 상태 변경 시 볼륨 제어
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  // Effect: 컴포넌트 언마운트 시 BGM 정지
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    audioRef,
    currentBGMRef,
  };
};
