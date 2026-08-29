'use client';

// usePrevious.js
import { useState } from "react";

/**
 * 이전 렌더 시점의 value를 반환하는 Hook
 * - 첫 렌더에서는 undefined를 반환
 * - 이후에는 항상 "바뀌기 전 값"을 돌려줌
 *
 * React 18+ 패턴: 상태 튜플 [prev, current]를 사용하여
 * ref.current 접근 없이 이전 값을 추적합니다
 */
export const usePrevious = (value) => {
  // [이전값, 현재값] 튜플을 상태로 관리
  const [tuple, setTuple] = useState([undefined, value]);

  // 값이 변경되었으면 튜플 업데이트 (렌더 중 안전하게 처리)
  if (tuple[1] !== value) {
    setTuple([tuple[1], value]);
  }

  // 이전 값 반환
  return tuple[0];
};
