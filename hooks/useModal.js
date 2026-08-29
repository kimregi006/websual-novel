'use client';

/**
 * useModal.js - 모달 상태 관리 커스텀 훅
 *
 * 여러 모달의 상태를 통합 관리하여 코드 중복을 줄이고 유지보수성을 향상
 */

import { useState, useCallback } from "react";

/**
 * 모달 타입 상수
 */
export const MODAL_TYPES = {
  NONE: null,
  SAVE_LOAD: "saveLoad",
  CONFIRM: "confirm",
  STORY_ERROR: "storyError",
};

/**
 * 모달 상태 관리 훅
 * @returns {Object} 모달 상태 및 제어 함수
 */
export const useModal = () => {
  const [activeModal, setActiveModal] = useState(MODAL_TYPES.NONE);
  const [modalData, setModalData] = useState(null);

  /**
   * 모달 열기
   * @param {string} type - 모달 타입 (MODAL_TYPES 중 하나)
   * @param {*} data - 모달에 전달할 데이터
   */
  const openModal = useCallback((type, data = null) => {
    setActiveModal(type);
    setModalData(data);
  }, []);

  /**
   * 모달 닫기
   */
  const closeModal = useCallback(() => {
    setActiveModal(MODAL_TYPES.NONE);
    setModalData(null);
  }, []);

  /**
   * 특정 모달이 열려있는지 확인
   * @param {string} type - 확인할 모달 타입
   * @returns {boolean}
   */
  const isModalOpen = useCallback(
    (type) => {
      return activeModal === type;
    },
    [activeModal]
  );

  return {
    activeModal,
    modalData,
    openModal,
    closeModal,
    isModalOpen,
  };
};
