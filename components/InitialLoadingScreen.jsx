'use client';

/**
 * InitialLoadingScreen.jsx - 초기 로딩 화면 (타이틀 이전)
 *
 * 타이틀 화면 표시 전에 필수 리소스를 모두 로드하는 동안 표시
 * - 타이틀 이미지
 * - 기본 UI 이미지
 * - 첫 scene 배경 및 캐릭터 이미지
 */

import React from "react";
import "./InitialLoadingScreen.css";

const InitialLoadingScreen = ({ progress = null }) => {
  const percentage =
    progress && progress.total > 0
      ? Math.round((progress.loaded / progress.total) * 100)
      : 0;

  return (
    <div className="initial-loading-screen">
      <div className="initial-loading-content">
        <h1 className="initial-loading-text">{percentage}</h1>
        <p className="initial-loading-percentage"> %</p>
      </div>
    </div>
  );
};

export default InitialLoadingScreen;
