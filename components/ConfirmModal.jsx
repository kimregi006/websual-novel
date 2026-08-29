'use client';

import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">확인</h3>
        <p
          className="confirm-message"
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <div className="confirm-buttons">
          <button className="confirm-btn cancel" onClick={onCancel}>
            취소
          </button>
          <button className="confirm-btn confirm" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
