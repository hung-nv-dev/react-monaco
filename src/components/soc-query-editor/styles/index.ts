import styled, { css, keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

export const EditorWrapper = styled.div<{ $disabled?: boolean }>`
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

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.6;
      pointer-events: none;
      background: #f5f5f5;
    `}
`;

export const EditorContainer = styled.div<{ $expanded?: boolean }>`
  position: relative;
  flex: 0 0 auto;
  height: 40px;
  min-height: 40px;
  z-index: 1;
  overflow: visible;
  box-sizing: border-box;

  ${({ $expanded }) =>
    $expanded &&
    css`
      z-index: 1000;
    `}
`;

export const MonacoWrapper = styled.div<{ $expanded?: boolean; $height: number }>`
  width: 100%;
  min-height: 40px;
  position: relative;
  z-index: 1;
  overflow: visible !important;
  contain: none !important;
  box-sizing: border-box;
  background: #fff;
  height: ${({ $height }) => $height}px;
  transition: height 0.2s ease;

  ${({ $expanded }) =>
    $expanded &&
    css`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 0 0 6px 6px;
      max-height: 600px;
    `}
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

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  gap: 8px;
  position: relative;
  z-index: 0;
`;

export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const QuickInsertWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
  position: relative;
  z-index: 0;
`;

export const QuickInsertGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
`;

export const QuickInsertLabel = styled.span`
  font-size: 11px;
  color: #8c8c8c;
  margin-right: 4px;
`;

export const ErrorPanel = styled.div<{ $hasErrors?: boolean }>`
  border-top: 1px solid #e8e8e8;
  background: #fffbe6;
  max-height: 150px;
  overflow-y: auto;
  position: relative;
  z-index: 0;

  ${({ $hasErrors }) =>
    $hasErrors &&
    css`
      background: #fff2f0;
    `}
`;

export const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

export const ErrorList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`;

export const ErrorItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const ErrorIcon = styled.span<{ $severity?: 'error' | 'warning' | 'info' }>`
  flex-shrink: 0;
  margin-top: 2px;

  ${({ $severity }) => {
    switch ($severity) {
      case 'error':
        return css`color: #ff4d4f;`;
      case 'warning':
        return css`color: #faad14;`;
      case 'info':
        return css`color: #1890ff;`;
      default:
        return '';
    }
  }}
`;

export const ErrorContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ErrorMessage = styled.div`
  font-size: 13px;
  color: #262626;
  word-break: break-word;
`;

export const ErrorLocation = styled.div`
  font-size: 11px;
  color: #8c8c8c;
  margin-top: 2px;
`;

export const SuccessBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f6ffed;
  border-top: 1px solid #b7eb8f;
  color: #52c41a;
  font-size: 13px;
`;

export const ExamplesPanel = styled.div`
  border-left: 1px solid #e8e8e8;
  background: #fafafa;
  width: 280px;
  flex-shrink: 0;
`;

export const ExamplesHeader = styled.div`
  padding: 8px 12px;
  font-weight: 500;
  border-bottom: 1px solid #e8e8e8;
`;

export const ExamplesList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

export const ExamplesItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: #e6f7ff;
  }
`;

export const ExamplesItemTitle = styled.div`
  font-weight: 500;
  font-size: 13px;
  color: #262626;
`;

export const ExamplesItemDesc = styled.div`
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
`;

export const SearchProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export const SearchProgressText = styled.span`
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
  white-space: nowrap;
`;

// Global styles for Monaco editor - these need to be in a createGlobalStyle
export const MonacoGlobalStyles = css`
  .monaco-editor {
    padding-top: 4px;
    overflow: visible !important;
    contain: none !important;
  }

  .monaco-editor .monaco-editor-background,
  .monaco-editor .monaco-scrollable-element {
    overflow: visible !important;
  }

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

  .monaco-editor .suggest-widget,
  .editor-widget.suggest-widget,
  .monaco-editor .editor-widget.suggest-widget {
    z-index: 2147483647 !important;
    position: fixed !important;
    overflow: auto !important;
    contain: none !important;
    pointer-events: auto !important;
    max-height: 300px !important;
  }

  .monaco-editor .monaco-editor-overlaymessage {
    z-index: 2147483646 !important;
  }

  .monaco-editor .parameter-hints-widget {
    z-index: 2147483645 !important;
  }

  .monaco-editor .context-view {
    z-index: 2147483644 !important;
  }

  .monaco-editor .monaco-editor-overlay {
    z-index: 2147483640 !important;
  }

  .monaco-suggest-widget {
    z-index: 2147483647 !important;
  }

  .monaco-editor .monaco-editor-overlaywidgets {
    z-index: 2147483640 !important;
  }

  .monaco-editor .suggest-widget-container {
    z-index: 2147483647 !important;
  }

  body > .monaco-editor,
  body > .monaco-aria-container,
  body > .monaco-editor-overlaymessage,
  body > .suggest-widget,
  body > .editor-widget,
  body > .monaco-hover,
  body > .parameter-hints-widget {
    z-index: 2147483647 !important;
  }

  .overflow-guard,
  .monaco-editor .overflow-guard {
    overflow: visible !important;
  }

  .monaco-editor .overlayWidgets,
  .monaco-editor .contentWidgets {
    z-index: 2147483640 !important;
    overflow: visible !important;
  }
`;
