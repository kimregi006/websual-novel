'use client';

/**
 * Cutscene.jsx - 컷신 이미지 표시 컴포넌트
 *
 * 기능:
 * - 이미지 로드 완료 후 fadeIn 애니메이션 시작
 * - 로딩 중 상태 관리
 * - 에러 처리
 */

import React, { useState, useEffect } from "react";
import InGameLoadingScreen from "./InGameLoadingScreen";
import "./Cutscene.css";

const Cutscene = ({ imagePath, alt = "Cutscene" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // imagePath가 변경되면 로드 상태 초기화
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [imagePath]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoaded(false);
    setHasError(true);
    console.error(`[Cutscene] Failed to load image: ${imagePath}`);
  };

  if (!imagePath) {
    return null;
  }

  return (
    <div className="cutscene">
      {/* 로딩 중 InGameLoadingScreen 표시 */}
      {!isLoaded && !hasError && (
        <InGameLoadingScreen message="컷신을 불러오는 중..." />
      )}

      {/* 에러 발생 시 */}
      {hasError && (
        <div className="cutscene-error">
          <p>이미지를 불러올 수 없습니다</p>
        </div>
      )}

      {/* 실제 이미지 - 항상 렌더링하되, 로드 전에는 투명 */}
      <img
        src={`assets/cutscenes/${imagePath}`}
        alt={alt}
        className={`cutscene-image ${isLoaded ? "cutscene-image-loaded" : ""}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default Cutscene;
