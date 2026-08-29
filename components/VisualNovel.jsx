'use client';

/**
 * VisualNovel.jsx - 비주얼 노벨 메인 컴포넌트
 *
 * 씬 구조:
 * - type: "normal" | "choice" | "ending"
 * - dialogues: 대사 배열 (이전 dialogue 단일 객체도 자동 변환)
 * - characters: 씬/대사 레벨 캐릭터 표시
 * - cutscene: 컷신 이미지 표시 (모든 씬 타입에서 사용 가능)
 * - checkAffection: 호감도 기반 엔딩 분기
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useGameState } from "@/hooks/useGameState";
import { useAffection } from "@/hooks/useAffection";
import { useDialogueState } from "@/hooks/useDialogueState";
import { useEndingState } from "@/hooks/useEndingState";
import { useCharacterDisplay } from "@/hooks/useCharacterDisplay";
import { useModal, MODAL_TYPES } from "@/hooks/useModal";
import { useGameContext } from "@/contexts/GameContext";
import { useBGM } from "@/hooks/useBGM";
import { useImagePreloader, useTitleScreenPreloader, useSceneBackgroundPreloader } from "@/hooks/useImagePreloader";
import { getBackgroundStyle } from "@/utils/backgroundHelper";
import { validateSceneFlow, validateEndingInfo } from "@/utils/storyValidator";
import { clampAffection } from "@/utils/affectionHelper";
import {
  ENDING_ERROR_MESSAGES,
  STORY_ERROR_MESSAGES,
  CONFIRM_MESSAGES,
} from "@/constants/endingConfig";
import {
  normalizeDialogues,
  computeCurrentCharacters,
  shouldShowCutscene as computeShouldShowCutscene,
  shouldShowChoices as computeShouldShowChoices,
} from "@/utils/sceneHelpers";
import { collectSceneImages, collectTitleScreenImages } from "@/utils/imageCollector";
import { preloadImagesBlocking } from "@/utils/imagePreloader";
import { parseEndingFromSceneId } from "@/utils/endingLogic";
import AffectionDisplay from "./AffectionDisplay";
import EndingResult from "./EndingResult";
import TitleScreen from "./TitleScreen";
import GameHeader from "./GameHeader";
import GameModals from "./GameModals";
import SceneContent from "./SceneContent";
import InitialLoadingScreen from "./InitialLoadingScreen";
import InGameLoadingScreen from "./InGameLoadingScreen";
import ValidationPanel from "./ValidationPanel";
import "./VisualNovel.css";

const VisualNovel = () => {
  const { currentScene, currentSceneId, goToScene, resetGame, resetToTitle } =
    useGameState();
  const { affection, updateAffection, resetAffection, setAffection } =
    useAffection();
  const { activeModal, modalData, openModal, closeModal } = useModal();
  const {
    isMuted,
    toggleMute,
    hasInteracted,
    setHasInteracted,
    storyData,
    isLoading: isStoryDataLoading,
    loadError,
    characters,
    places,
    gameInfo,
  } = useGameContext();

  const [showTitleScreen, setShowTitleScreen] = useState(true);

  // 대사 관련 상태 (커스텀 훅)
  const {
    dialogueIndex,
    showReaction,
    currentReaction,
    pendingNextScene,
    setDialogueIndex,
    incrementDialogueIndex,
    startReaction,
    endReaction,
    resetDialogueState,
  } = useDialogueState(currentSceneId, currentScene);

  // 엔딩 관련 상태 및 로직 (커스텀 훅)
  const lines = useMemo(() => normalizeDialogues(currentScene), [currentScene]);

  // handleStoryError를 useRef로 관리하여 순환 의존성 해결
  const handleStoryErrorRef = useRef();

  const handleStoryError = useCallback((errorMessage) => {
    if (handleStoryErrorRef.current) {
      handleStoryErrorRef.current(errorMessage);
    }
  }, []);

  const {
    endingInfo,
    showEndingResult,
    computedEndingSceneId,
    setEndingInfo,
    resetEndingState,
    showEnding,
  } = useEndingState(
    currentScene,
    currentSceneId,
    affection,
    lines,
    dialogueIndex,
    handleStoryError
  );

  // 캐릭터 디스플레이 관련 상태 (커스텀 훅)
  const currentLine = lines[dialogueIndex] || null;
  const isChoiceScene = currentScene?.type === "choice";
  const shouldShowChoices = useMemo(
    () => computeShouldShowChoices(isChoiceScene, lines.length, dialogueIndex),
    [isChoiceScene, lines.length, dialogueIndex]
  );
  const dialogueForChoice = useMemo(() => {
    if (!shouldShowChoices || lines.length === 0) return null;
    return lines[lines.length - 1];
  }, [shouldShowChoices, lines]);

  const {
    displayCharacters,
    displayedCharacters,
    loadedPlace,
    setLoadedPlace,
    resetCharacterDisplay,
    updateDisplayedCharacters,
  } = useCharacterDisplay(currentSceneId, currentLine);

  const currentCharacters = useMemo(
    () =>
      computeCurrentCharacters({
        showReaction,
        currentReaction,
        currentLine,
        dialogueForChoice,
        shouldShowChoices,
        displayCharacters,
      }),
    [
      showReaction,
      currentReaction,
      currentLine,
      dialogueForChoice,
      shouldShowChoices,
      displayCharacters,
    ]
  );

  // 캐릭터 표시 업데이트
  React.useEffect(() => {
    updateDisplayedCharacters(currentCharacters);
  }, [currentCharacters, updateDisplayedCharacters]);

  // handleStoryError 실제 구현 설정 (모든 reset 함수가 선언된 후)
  useEffect(() => {
    handleStoryErrorRef.current = (errorMessage) => {
      console.error("[Story Error]", errorMessage);
      openModal(MODAL_TYPES.STORY_ERROR, {
        message: CONFIRM_MESSAGES.STORY_ERROR(errorMessage),
        onConfirm: () => {
          closeModal();
          resetToTitle();
          setShowTitleScreen(true);
          resetAffection();
          resetDialogueState();
          resetEndingState();
          resetCharacterDisplay();
        },
      });
    };
  }, [
    openModal,
    closeModal,
    resetToTitle,
    setShowTitleScreen,
    resetAffection,
    resetDialogueState,
    resetEndingState,
    resetCharacterDisplay,
  ]);

  // BGM 관리
  const { audioRef, currentBGMRef } = useBGM({
    currentScene,
    currentSceneId,
    showTitleScreen,
    isMuted,
    hasInteracted,
    titleBGM: gameInfo?.backgroundMusic,
  });

  // 타이틀 화면 이미지 preload (차단형)
  const titleImages = useMemo(() => {
    return [...collectTitleScreenImages(), ...collectSceneImages("scene1")];
  }, []);

  const { isLoading: isTitleLoading, isReady: isTitleReady, progress: titleProgress } =
    useTitleScreenPreloader(titleImages, showTitleScreen);

  // Scene 배경 이미지 preload (비차단형 - 백그라운드에서 preload)
  // 배경은 준비되면 자연스럽게 전환, 로딩 중에도 화면 유지
  const { isReady: isSceneReady } = useSceneBackgroundPreloader(currentScene?.place);

  // 일반 이미지 preload 관리 (백그라운드)
  const { clearCache: clearImageCache } = useImagePreloader(currentSceneId, dialogueIndex, {
    enabled: !showTitleScreen && isSceneReady, // 타이틀 화면이 아니고 scene 배경이 준비되었을 때만 활성화
    lookAheadDialogues: 5, // 현재 scene에서 앞으로 5개 dialogue까지 preload
    lookAheadScenes: 2, // 다음 2개 scene까지 preload
  });

  // 파생 상태
  const currentPlaceId = useMemo(() => {
    if (loadedPlace) return loadedPlace;
    if (currentScene?.place && places[currentScene.place]) {
      return currentScene.place;
    }
    return "default";
  }, [currentScene, loadedPlace]);

  // 배경이 준비된 경우에만 업데이트, 아니면 이전 배경 유지
  const previousPlaceIdRef = useRef(currentPlaceId);
  const effectivePlaceId = useMemo(() => {
    if (isSceneReady) {
      previousPlaceIdRef.current = currentPlaceId;
      return currentPlaceId;
    }
    // 배경이 준비되지 않았으면 이전 배경 유지
    return previousPlaceIdRef.current;
  }, [currentPlaceId, isSceneReady]);

  const currentBackgroundStyle = useMemo(
    () => getBackgroundStyle(effectivePlaceId),
    [effectivePlaceId]
  );

  const shouldShowCutscene = useMemo(
    () => computeShouldShowCutscene(currentScene, currentLine),
    [currentScene, currentLine]
  );

  // 게임 상태 리셋 통합 함수
  const resetGameState = useCallback(
    (resetType) => {
      if (resetType === "restart") {
        resetGame();
        setShowTitleScreen(false);
        setHasInteracted(true);
      } else {
        resetToTitle();
        setShowTitleScreen(true);
        if (audioRef.current) {
          currentBGMRef.current = null;
        }
      }
      resetAffection();
      resetEndingState();
      resetDialogueState();
      resetCharacterDisplay();
      clearImageCache(); // 이미지 preload 캐시 초기화
    },
    [
      resetGame,
      resetToTitle,
      resetAffection,
      resetEndingState,
      resetDialogueState,
      resetCharacterDisplay,
      setHasInteracted,
      audioRef,
      currentBGMRef,
      clearImageCache,
    ]
  );

  // 엔딩 씬 전환 처리 (이미지 preload 대기)
  const [isPreloadingEnding, setIsPreloadingEnding] = React.useState(false);

  React.useEffect(() => {
    if (!computedEndingSceneId) return;

    if (computedEndingSceneId === "VALIDATION_ERROR") {
      queueMicrotask(() => {
        handleStoryError(ENDING_ERROR_MESSAGES.VALIDATION_ERROR);
      });
      return;
    }
    if (computedEndingSceneId === "SCENE_ID_ERROR") {
      queueMicrotask(() => {
        handleStoryError(ENDING_ERROR_MESSAGES.SCENE_ID_ERROR);
      });
      return;
    }
    if (computedEndingSceneId === "SCENE_NOT_FOUND") {
      queueMicrotask(() => {
        handleStoryError(ENDING_ERROR_MESSAGES.SCENE_NOT_FOUND);
      });
      return;
    }

    // ending scene의 이미지를 먼저 preload한 후 전환
    const preloadAndTransition = async () => {
      setIsPreloadingEnding(true);

      try {
        // ending scene의 이미지 수집
        const endingImages = collectSceneImages(computedEndingSceneId);

        if (endingImages.length > 0) {
          console.log(
            `[VisualNovel] Preloading ${endingImages.length} images for ending scene: ${computedEndingSceneId}`
          );

          // 차단형 preload (모든 이미지가 로드될 때까지 대기)
          const result = await preloadImagesBlocking(endingImages, { timeout: 15000 });

          if (result.success) {
            console.log("[VisualNovel] Ending scene images preloaded successfully");
          } else {
            console.warn(
              `[VisualNovel] Some ending images failed to load: ${result.failed.length}/${result.total}`
            );
          }
        }

        // 이미지 로드 완료 후 scene 전환
        goToScene(computedEndingSceneId);
      } catch (error) {
        console.error("[VisualNovel] Error preloading ending scene:", error);
        // 에러가 나도 전환은 진행
        goToScene(computedEndingSceneId);
      } finally {
        setIsPreloadingEnding(false);
      }
    };

    preloadAndTransition();
  }, [computedEndingSceneId, goToScene, handleStoryError]);

  // 엔딩 씬 진입 시 endingInfo 자동 생성 (checkAffection 없이 진입한 경우)
  React.useEffect(() => {
    if (currentScene?.type !== "ending") return;
    if (endingInfo) return; // 이미 endingInfo가 있으면 무시
    if (showEndingResult) return; // 이미 엔딩 표시 중이면 무시

    // 씬 ID로부터 엔딩 정보 생성
    const parsedEndingInfo = parseEndingFromSceneId(currentSceneId);

    if (parsedEndingInfo && validateEndingInfo(parsedEndingInfo)) {
      queueMicrotask(() => {
        setEndingInfo(parsedEndingInfo);
      });
    } else {
      // 파싱 실패 시 에러
      queueMicrotask(() => {
        handleStoryError(`엔딩 씬 ID "${currentSceneId}"로부터 엔딩 정보를 생성할 수 없습니다.`);
      });
    }
  }, [currentScene, currentSceneId, endingInfo, showEndingResult, setEndingInfo, handleStoryError]);

  // 엔딩 씬에서 dialogues가 비어있거나 모두 재생한 경우 자동으로 엔딩 표시
  React.useEffect(() => {
    if (currentScene?.type !== "ending") return;
    if (showEndingResult) return; // 이미 엔딩 표시 중이면 무시
    if (!endingInfo) return; // endingInfo가 없으면 대기 (위의 useEffect에서 생성 중)

    // dialogues가 비어있는 경우만 자동 표시
    // 대사가 있는 경우는 사용자가 모든 대사를 읽고 진행 버튼을 눌러야 함
    if (lines.length === 0) {
      // endingInfo 검증
      if (!validateEndingInfo(endingInfo)) {
        queueMicrotask(() => {
          handleStoryError(ENDING_ERROR_MESSAGES.RESULT_DISPLAY_ERROR);
        });
        return;
      }

      // 자동으로 엔딩 표시
      queueMicrotask(() => {
        showEnding();
      });
    }
  }, [currentScene, lines.length, showEndingResult, endingInfo, showEnding, handleStoryError]);

  // 이벤트 핸들러
  const handleNext = useCallback(() => {
    // 엔딩 결과가 표시 중이면 아무 동작도 하지 않음 (강제 종료)
    if (showEndingResult) {
      return;
    }

    if (lines.length > 0 && dialogueIndex < lines.length - 1) {
      incrementDialogueIndex();
      return;
    }

    if (isChoiceScene && dialogueIndex >= lines.length - 1) {
      if (dialogueIndex === lines.length - 1) {
        incrementDialogueIndex();
      }
      return;
    }

    if (currentScene?.type === "ending") {
      if (!endingInfo || !validateEndingInfo(endingInfo)) {
        handleStoryError(ENDING_ERROR_MESSAGES.RESULT_DISPLAY_ERROR);
        return;
      }
      showEnding();
      return;
    }

    if (currentScene?.checkAffection) {
      return;
    }

    if (currentScene?.next) {
      goToScene(currentScene.next);
    } else {
      const validation = validateSceneFlow(currentScene);
      if (!validation.isValid) {
        handleStoryError(STORY_ERROR_MESSAGES.FLOW_ERROR(validation.error));
      }
    }
  }, [
    isChoiceScene,
    lines.length,
    dialogueIndex,
    currentScene,
    endingInfo,
    handleStoryError,
    goToScene,
    incrementDialogueIndex,
    showEnding,
    showEndingResult,
  ]);

  const handleChoice = useCallback(
    (choice) => {
      if (choice.affectionChanges) {
        updateAffection(choice.affectionChanges);
      }

      const nextSceneId = choice.next || currentScene?.next;

      if (!nextSceneId) {
        handleStoryError(STORY_ERROR_MESSAGES.CHOICE_ERROR(choice.text));
        return;
      }

      if (choice.reaction) {
        startReaction(choice.reaction, nextSceneId);
      } else {
        goToScene(nextSceneId);
      }
    },
    [updateAffection, goToScene, handleStoryError, currentScene, startReaction]
  );

  const handleReactionNext = useCallback(() => {
    const nextScene = endReaction();
    if (nextScene) {
      goToScene(nextScene);
    }
  }, [endReaction, goToScene]);

  const handleRestartGame = useCallback(() => {
    resetGameState("restart");
  }, [resetGameState]);

  const handleConfirmResetToTitle = useCallback(() => {
    openModal(MODAL_TYPES.CONFIRM, {
      message: CONFIRM_MESSAGES.RESET_TO_TITLE,
      onConfirm: () => {
        closeModal();
        resetGameState("title");
      },
    });
  }, [openModal, closeModal, resetGameState]);

  const handleStartGame = useCallback(() => {
    setShowTitleScreen(false);
    setHasInteracted(true);
    goToScene("scene1");
  }, [goToScene, setHasInteracted]);

  const handleToggleMuteOnTitle = useCallback(() => {
    toggleMute();
    if (isMuted) {
      setHasInteracted(true);
    }
  }, [toggleMute, isMuted, setHasInteracted]);

  const handleOpenSave = useCallback(() => {
    openModal(MODAL_TYPES.SAVE_LOAD, { mode: "save" });
  }, [openModal]);

  const handleOpenLoad = useCallback(() => {
    openModal(MODAL_TYPES.SAVE_LOAD, { mode: "load" });
  }, [openModal]);

  const getCurrentGameState = useCallback(() => {
    return {
      currentSceneId,
      affection,
      endingInfo,
      showEndingResult,
      dialogueIndex,
      currentPlace: currentPlaceId,
      showReaction,
      currentReaction,
      pendingNextScene,
      displayCharacters,
      displayedCharacters,
    };
  }, [
    currentSceneId,
    affection,
    endingInfo,
    showEndingResult,
    dialogueIndex,
    currentPlaceId,
    showReaction,
    currentReaction,
    pendingNextScene,
    displayCharacters,
    displayedCharacters,
  ]);

  const handleLoadGameState = useCallback(
    (saveData) => {
      setShowTitleScreen(false);
      setHasInteracted(true);
      goToScene(saveData.sceneId);

      const loadedAffection = saveData.affection || {};
      const fixedAffection = {};
      Object.values(characters).forEach((char) => {
        const raw = loadedAffection[char.id] ?? char.initialAffection ?? 0;
        fixedAffection[char.id] = clampAffection(char.id, raw);
      });
      setAffection(fixedAffection);

      setEndingInfo(saveData.endingInfo);
      setDialogueIndex(saveData.dialogueIndex ?? 0);

      const placeId =
        saveData.currentPlace && places[saveData.currentPlace]
          ? saveData.currentPlace
          : "default";
      setLoadedPlace(placeId);

      closeModal();
    },
    [
      goToScene,
      setAffection,
      setEndingInfo,
      setDialogueIndex,
      setLoadedPlace,
      closeModal,
      setHasInteracted,
    ]
  );

  // 렌더링
  // storyData 로딩 중이거나 에러 발생 시 로딩 화면 표시
  if (isStoryDataLoading || !storyData) {
    return <InitialLoadingScreen progress={null} />;
  }

  // storyData 로드 실패 시 에러 표시
  if (loadError) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>스토리 데이터를 불러오는 데 실패했습니다</h2>
        <p>{loadError}</p>
      </div>
    );
  }

  if (showTitleScreen) {
    // 타이틀 이미지가 로딩 중이면 초기 로딩 화면 표시
    if (isTitleLoading || !isTitleReady) {
      return <InitialLoadingScreen progress={titleProgress} />;
    }

    return (
      <>
        <ValidationPanel showOnTitleScreen={true} />
        <TitleScreen
          onStart={handleStartGame}
          onLoad={handleOpenLoad}
          isMuted={isMuted}
          onToggleMute={handleToggleMuteOnTitle}
        />
        <GameModals
          activeModal={activeModal}
          modalData={modalData}
          onCloseModal={closeModal}
          onLoad={handleLoadGameState}
          currentGameState={getCurrentGameState()}
        />
      </>
    );
  }

  return (
    <>
      <div className="visual-novel" style={currentBackgroundStyle}>
        <div className="game-container">
        {currentScene && (
          <>
            {/* <AffectionDisplay affection={affection} /> */}

            <GameHeader
              currentPlaceId={currentPlaceId}
              onSaveClick={handleOpenSave}
              onLoadClick={handleOpenLoad}
              onResetClick={handleConfirmResetToTitle}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />

            <SceneContent
              displayedCharacters={displayedCharacters}
              shouldShowCutscene={shouldShowCutscene}
              currentScene={currentScene}
              showReaction={showReaction}
              currentReaction={currentReaction}
              handleReactionNext={handleReactionNext}
              shouldShowChoices={shouldShowChoices}
              dialogueForChoice={dialogueForChoice}
              currentLine={currentLine}
              handleNext={handleNext}
              onChoice={handleChoice}
            />

            {showEndingResult && endingInfo && (
              <EndingResult
                endingInfo={endingInfo}
                affection={affection}
                onRestart={handleRestartGame}
                onBackToTitle={() => resetGameState("title")}
              />
            )}

            <GameModals
              activeModal={activeModal}
              modalData={modalData}
              onCloseModal={closeModal}
              onLoad={handleLoadGameState}
              currentGameState={getCurrentGameState()}
            />
          </>
        )}

        {/* 게임 진행 중 로딩 화면 - 오버레이로 표시 */}
        {(isPreloadingEnding || !currentScene) && (
          <InGameLoadingScreen
            message={!currentScene ? "씬을 불러오는 중..." : "엔딩을 준비하는 중..."}
          />
        )}
        </div>
      </div>
    </>
  );
};

export default VisualNovel;
