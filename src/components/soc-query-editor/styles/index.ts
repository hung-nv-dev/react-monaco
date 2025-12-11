import styled, { css } from 'styled-components';

export const EditorWrapper = styled.div<{ $disabled?: boolean; $hasErrors?: boolean }>`
  display: flex;
  flex-direction: column;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: visible !important;
  background: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
  position: relative;
  z-index: 0;
  contain: none !important;
  box-sizing: border-box;
  min-height: 40px;

  &:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  ${({ $hasErrors }) =>
    $hasErrors &&
    css`
      border-color: #ff4d4f;

      &:focus-within {
        border-color: #ff4d4f;
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
      }
    `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.6;
      pointer-events: none;
      background: #f5f5f5;
    `}
`;

export const EditorContainer = styled.div`
  position: relative;
  flex: 1 1 auto;
  min-height: 100px;
  z-index: 1;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
`;

export const MonacoWrapper = styled.div`
  flex: 1;
  height: 100%;
  min-height: 100px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  box-sizing: border-box;
  background: #fff;
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
`;

export const ErrorIconContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding-top: 8px;
  padding-right: 4px;
  flex-shrink: 0;
`;

// Global styles for Monaco editor
export const MonacoGlobalStyles = css`
  .monaco-editor .margin {
    background: transparent !important;
  }

  .monaco-editor .scroll-decoration {
    display: none;
  }

  .monaco-editor .view-line .placeholder-text {
    color: #bfbfbf;
    font-style: italic;
  }

  /* Remove line highlight/hover effect */
  .monaco-editor .view-overlays .current-line {
    display: none !important;
    border: none !important;
    background: transparent !important;
  }

  .monaco-editor .margin-view-overlays .current-line-margin {
    display: none !important;
    border: none !important;
    background: transparent !important;
  }

  .monaco-editor .lines-content .current-line-margin {
    border: none !important;
  }
`;
