"use client";

/**
 * ValidationPanel.jsx - storyData 검증 결과 표시 팝업
 *
 * 기능:
 * - 검증 에러/경고 목록 표시
 * - 타이틀 화면에서 팝업으로 표시
 * - x버튼으로 닫기
 * - 한 번 닫으면 다시 표시하지 않음
 */

import React, { useState, useEffect } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { getValidationSummary, SEVERITY } from "@/utils/storyDataValidator";
import "./ValidationPanel.css";

const ValidationPanel = ({ showOnTitleScreen = false }) => {
  const { validationErrors } = useGameContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // 팝업 최초 표시 (타이틀 화면에서만)
  useEffect(() => {
    if (showOnTitleScreen && validationErrors.length > 0 && !isDismissed) {
      // sessionStorage에서 이전에 닫은 적이 있는지 확인 (탭 닫으면 초기화됨)
      if (typeof window !== "undefined") {
        const dismissed =
          sessionStorage.getItem("validation_popup_dismissed") === "true";
        if (!dismissed) {
          setIsOpen(true);
        } else {
          setIsDismissed(true);
        }
      } else {
        setIsOpen(true);
      }
    }
  }, [showOnTitleScreen, validationErrors, isDismissed]);

  const handleClose = () => {
    setIsOpen(false);
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("validation_popup_dismissed", "true");
    }
  };

  // 타이틀 화면이 아니거나, 에러가 없거나, 이미 닫았으면 표시하지 않음
  if (!showOnTitleScreen || validationErrors.length === 0 || !isOpen) {
    return null;
  }

  const summary = getValidationSummary(validationErrors);

  // severity별로 그룹화
  const errorItems = validationErrors.filter(
    (e) => e.severity === SEVERITY.ERROR
  );
  const warningItems = validationErrors.filter(
    (e) => e.severity === SEVERITY.WARNING
  );

  return (
    <div className="validation-popup-overlay">
      <div className="validation-popup">
        {/* 헤더 */}
        <div className="validation-popup-header">
          <div className="validation-popup-title">
            <span className="validation-popup-icon"></span>
            <span>storyData 검증 결과 ({summary.total}개 문제)</span>
          </div>
          <button className="close-button" onClick={handleClose}></button>
        </div>

        {/* 요약 */}
        <div className="validation-popup-summary">
          {summary.errors > 0 && (
            <span className="error-count">에러: {summary.errors}</span>
          )}
          {summary.warnings > 0 && (
            <span className="warning-count">경고: {summary.warnings}</span>
          )}
        </div>

        {/* 본문 */}
        <div className="validation-popup-body">
          {/* 에러 목록 */}
          {errorItems.length > 0 && (
            <div className="validation-section">
              <h4 className="section-title error-title">
                ❌ 에러 ({errorItems.length})
              </h4>
              <div className="validation-list">
                {errorItems.map((error, index) => (
                  <div key={index} className="validation-item error-item">
                    <div className="validation-item-path">{error.path}</div>
                    <div className="validation-item-message">
                      {error.message}
                    </div>
                    <div className="validation-item-type">{error.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 경고 목록 */}
          {warningItems.length > 0 && (
            <div className="validation-section">
              <h4 className="section-title warning-title">
                ⚠️ 경고 ({warningItems.length})
              </h4>
              <div className="validation-list">
                {warningItems.map((warning, index) => (
                  <div key={index} className="validation-item warning-item">
                    <div className="validation-item-path">{warning.path}</div>
                    <div className="validation-item-message">
                      {warning.message}
                    </div>
                    <div className="validation-item-type">{warning.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="validation-popup-footer">
            <p className="hint-text">
              💡 이 창은 storyData의 문제를 확인하기 위한 도구입니다.
              <br />
              콘솔에서도 동일한 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
