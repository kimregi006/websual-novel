'use client';

/**
 * GameModals.jsx - 게임 모달 통합 관리 컴포넌트
 *
 * 모든 모달(SaveLoad, Confirm, StoryError)을 한 곳에서 렌더링
 */

import React from "react";
import SaveLoadModal from "./SaveLoadModal";
import ConfirmModal from "./ConfirmModal";
import { MODAL_TYPES } from "@/hooks/useModal";

const GameModals = ({
  activeModal,
  modalData,
  onCloseModal,
  onLoad,
  currentGameState,
}) => {
  return (
    <>
      {/* 세이브/로드 모달 */}
      {activeModal === MODAL_TYPES.SAVE_LOAD && (
        <SaveLoadModal
          mode={modalData?.mode}
          onClose={onCloseModal}
          onLoad={onLoad}
          currentGameState={currentGameState}
        />
      )}

      {/* 확인 모달 (타이틀로 돌아가기) */}
      {activeModal === MODAL_TYPES.CONFIRM && (
        <ConfirmModal
          message={modalData?.message}
          onConfirm={modalData?.onConfirm}
          onCancel={onCloseModal}
        />
      )}

      {/* 스토리 에러 모달 */}
      {activeModal === MODAL_TYPES.STORY_ERROR && (
        <ConfirmModal
          message={modalData?.message}
          onConfirm={modalData?.onConfirm}
          onCancel={modalData?.onConfirm} // 에러 모달은 취소도 확인과 동일
        />
      )}
    </>
  );
};

export default GameModals;
