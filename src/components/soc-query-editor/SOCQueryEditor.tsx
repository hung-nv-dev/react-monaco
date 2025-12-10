import type { FC } from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { Spin } from 'antd';
import { createGlobalStyle } from 'styled-components';
import {
  initializeSOCQL,
  SOCQL_LANGUAGE_ID,
  validateQuery,
  setValidationMarkers,
  clearValidationMarkers,
  type ValidationError,
} from './lib/socql';
import { EditorToolbar } from './components/EditorToolbar';
import { ErrorPanel } from './components/ErrorPanel';
import { QuickInsertButtons } from './components/QuickInsertButtons';
import { SaveQueryModal } from './components/SaveQueryModal';
import { EventHistogram } from './components/EventHistogram';
import { useQueryStorage } from './hooks/useQueryStorage';
import type { SOCQueryEditorProps, SavedQuery, DataSource } from './types';
import {
  EditorWrapper,
  EditorContainer,
  MonacoWrapper,
  LoadingOverlay,
  MonacoGlobalStyles,
} from './styles';

const GlobalStyles = createGlobalStyle`
  ${MonacoGlobalStyles}
`;

let initialized = false;

export const SOCQueryEditor: FC<SOCQueryEditorProps> = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onValidationChange,
  onSearch,
  dataSource: controlledDataSource,
  onDataSourceChange,
  isSearching = false,
  onCancel,
  searchProgress,
  showHistogram = false,
  histogramData,
  histogramTimeRange,
  validateOnChange = true,
  validationDebounce = 300,
  showToolbar = true,
  showErrorPanel = true,
  showQuickInsert = true,
  theme = 'socql-light',
  editorOptions,
  enableLocalStorage = false,
  storageKey,
  savedQueries: controlledSavedQueries,
  onSave,
  onLoad,
  disabled = false,
  readOnly = false,
  loading = false,
  className = '',
  style,
  ariaLabel = 'SOC Query Editor',
  placeholder = 'Enter your query here...',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocusedRef = useRef(false);
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const storage = useQueryStorage({ storageKey, enabled: enableLocalStorage });

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [internalDataSource, setInternalDataSource] = useState<DataSource>('both');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [editorHeight, setEditorHeight] = useState(40);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const currentDataSource = controlledDataSource ?? internalDataSource;
  const savedQueries = controlledSavedQueries ?? storage.savedQueries;

  useEffect(() => {
    if (!initialized) {
      initializeSOCQL();
      initialized = true;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: currentValue,
      language: SOCQL_LANGUAGE_ID,
      theme,
      automaticLayout: false,
      minimap: { enabled: false },
      fontSize: editorOptions?.fontSize ?? 14,
      lineNumbers: 'off',
      wordWrap: editorOptions?.wordWrap ?? 'on',
      tabSize: editorOptions?.tabSize ?? 2,
      readOnly: readOnly || disabled || isSearching,
      scrollBeyondLastLine: false,
      renderLineHighlight: 'none',
      glyphMargin: false,
      folding: false,
      foldingStrategy: 'indentation',
      showFoldingControls: 'never',
      unfoldOnClickAfterEndOfLine: false,
      lineDecorationsWidth: 0,
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        vertical: 'auto',
        horizontal: 'hidden',
      },
      overviewRulerBorder: false,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: false,
      contextmenu: true,
      quickSuggestions: { other: true, comments: false, strings: true },
      suggestOnTriggerCharacters: true,
      parameterHints: { enabled: true },
      placeholder,
      ariaLabel,
    });

    editorRef.current = editor;
    setIsEditorReady(true);

    if (containerRef.current) {
      containerRef.current.style.height = '40px';
    }
    editor.layout();
    setTimeout(() => editor.layout(), 10);

    const updateEditorHeight = () => {
      if (!isFocusedRef.current) return;

      try {
        editor.getAction('editor.unfoldAll')?.run();
      } catch {
        // Ignore
      }

      const contentHeight = editor.getContentHeight();
      const padding = editor.getOption(monaco.editor.EditorOption.padding);
      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
      const lineCount = editor.getModel()?.getLineCount() || 1;
      const calculatedHeight = lineCount * lineHeight;
      const actualContentHeight = Math.max(contentHeight, calculatedHeight);
      const totalHeight = actualContentHeight + (padding.top || 4) + (padding.bottom || 4) + 4;
      const newHeight = Math.min(Math.max(totalHeight, 40), 600);

      setEditorHeight(newHeight);
      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight}px`;
      }

      requestAnimationFrame(() => {
        editor.layout();
        setTimeout(() => {
          editor.layout();
          try {
            editor.getAction('editor.unfoldAll')?.run();
          } catch {
            // Ignore
          }
        }, 10);
      });
    };

    const focusDisposable = editor.onDidFocusEditorText(() => {
      isFocusedRef.current = true;
      setIsFocused(true);
      setTimeout(updateEditorHeight, 0);
    });

    const blurDisposable = editor.onDidBlurEditorText(() => {
      isFocusedRef.current = false;
      setIsFocused(false);
      setEditorHeight(40);
      if (containerRef.current) {
        containerRef.current.style.height = '40px';
      }
      editor.layout();
    });

    const calculateSuggestionPosition = (): boolean => {
      const position = editor.getPosition();
      if (!position || !containerRef.current) return false;

      const editorRect = containerRef.current.getBoundingClientRect();
      const domNode = editor.getDomNode();
      if (!domNode) return false;

      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
      const fontSize = editor.getOption(monaco.editor.EditorOption.fontSize);
      const coords = editor.getScrolledVisiblePosition(position);

      let top: number, left: number;
      if (coords) {
        top = editorRect.top + coords.top + lineHeight + 4;
        left = editorRect.left + coords.left;
      } else {
        top = editorRect.top + (position.lineNumber - 1) * lineHeight + lineHeight + 4;
        left = editorRect.left + (position.column - 1) * fontSize * 0.6;
      }

      const suggestWidget = document.querySelector('.monaco-editor .suggest-widget, .editor-widget.suggest-widget') as HTMLElement;
      if (suggestWidget) {
        const widgetHeight = suggestWidget.offsetHeight || 200;
        const viewportHeight = window.innerHeight;

        if (top + widgetHeight > viewportHeight - 20) {
          const cursorTop = coords
            ? editorRect.top + coords.top
            : editorRect.top + (position.lineNumber - 1) * lineHeight;
          top = cursorTop - widgetHeight - 4;
          if (top < 10) top = 10;
        }

        suggestWidget.style.top = `${top}px`;
        suggestWidget.style.left = `${left}px`;
        suggestWidget.style.position = 'fixed';
        suggestWidget.style.maxHeight = `${Math.min(300, viewportHeight - top - 20)}px`;
        return true;
      }
      return false;
    };

    const adjustSuggestionPosition = () => {
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
      if (calculateSuggestionPosition()) return;

      let attempts = 0;
      const tryAdjust = () => {
        attempts++;
        if (attempts > 1 && isTypingRef.current) return;
        if (calculateSuggestionPosition() || attempts >= 5) return;
        suggestionTimeoutRef.current = setTimeout(tryAdjust, attempts * 50);
      };
      tryAdjust();
    };

    const changeDisposable = editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      isTypingRef.current = true;
      setTimeout(() => { isTypingRef.current = false; }, 200);

      if (!isControlled) setInternalValue(newValue);
      onChange?.(newValue);
      if (isFocusedRef.current) setTimeout(updateEditorHeight, 0);
      adjustSuggestionPosition();

      if (validateOnChange) {
        if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
        validationTimeoutRef.current = setTimeout(() => {
          const result = validateQuery(newValue);
          setErrors(result.errors);
          setValidationMarkers(editor.getModel()!, result.errors);
          onValidationChange?.(result.errors);
        }, validationDebounce);
      }
    });

    const cursorDisposable = editor.onDidChangeCursorPosition(() => {
      if (!isTypingRef.current) adjustSuggestionPosition();
    });

    const suggestDisposable = editor.onDidChangeCursorSelection(() => {
      if (!isTypingRef.current) adjustSuggestionPosition();
    });

    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        if (document.querySelector('.monaco-editor .suggest-widget, .editor-widget.suggest-widget')) {
          requestAnimationFrame(calculateSuggestionPosition);
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isSearching) onSearch?.(editor.getValue());
    });

    if (validateOnChange && currentValue) {
      const result = validateQuery(currentValue);
      setErrors(result.errors);
      setValidationMarkers(editor.getModel()!, result.errors);
    }

    return () => {
      focusDisposable.dispose();
      blurDisposable.dispose();
      changeDisposable.dispose();
      cursorDisposable.dispose();
      suggestDisposable.dispose();
      mutationObserver?.disconnect();
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
      editor.dispose();
      editorRef.current = null;
      setIsEditorReady(false);
    };
  }, [theme, isFocused]);

  useEffect(() => {
    if (isControlled && editorRef.current && isEditorReady) {
      const currentEditorValue = editorRef.current.getValue();
      if (currentEditorValue !== controlledValue && !isTypingRef.current) {
        const position = editorRef.current.getPosition();
        editorRef.current.setValue(controlledValue || '');
        if (position) {
          const model = editorRef.current.getModel();
          if (model) {
            const lineCount = model.getLineCount();
            const restoredLine = Math.min(position.lineNumber, lineCount);
            const restoredColumn = Math.min(position.column, model.getLineMaxColumn(restoredLine));
            editorRef.current.setPosition({ lineNumber: restoredLine, column: restoredColumn });
          }
        }
      }
    }
  }, [controlledValue, isControlled, isEditorReady]);

  useEffect(() => {
    editorRef.current?.updateOptions({ readOnly: readOnly || disabled || isSearching });
  }, [readOnly, disabled, isSearching]);

  const handleSearch = useCallback(() => {
    if (!isSearching) onSearch?.(editorRef.current?.getValue() || '');
  }, [onSearch, isSearching]);

  const handleClear = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.setValue('');
      clearValidationMarkers(editorRef.current.getModel()!);
    }
    if (!isControlled) setInternalValue('');
    setErrors([]);
    onChange?.('');
  }, [isControlled, onChange]);

  const handleInsertText = useCallback((text: string) => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition();
      if (position) {
        editorRef.current.executeEdits('insert', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text,
          forceMoveMarkers: true,
        }]);
        editorRef.current.focus();
      }
    }
  }, []);

  const handleErrorClick = useCallback((error: ValidationError) => {
    if (editorRef.current) {
      editorRef.current.setPosition({ lineNumber: error.startLine, column: error.startColumn });
      editorRef.current.revealLineInCenter(error.startLine);
      editorRef.current.focus();
    }
  }, []);

  const handleDataSourceChange = useCallback((ds: DataSource) => {
    onDataSourceChange ? onDataSourceChange(ds) : setInternalDataSource(ds);
  }, [onDataSourceChange]);

  const handleSaveQuery = useCallback((query: SavedQuery) => {
    if (enableLocalStorage) storage.saveQuery(query);
    onSave?.(query);
    setSaveModalOpen(false);
  }, [enableLocalStorage, storage, onSave]);

  const handleLoadQuery = useCallback((query: SavedQuery) => {
    editorRef.current?.setValue(query.query);
    if (!isControlled) setInternalValue(query.query);
    onChange?.(query.query);
    onLoad?.(query);
  }, [isControlled, onChange, onLoad]);

  return (
    <>
      <GlobalStyles />
      <EditorWrapper $disabled={disabled} className={className} style={style}>
        {showToolbar && (
          <EditorToolbar
            onSearch={handleSearch}
            onClear={handleClear}
            disabled={disabled}
            hasErrors={errors.some((e) => e.severity === 'error')}
            dataSource={currentDataSource}
            onDataSourceChange={onDataSourceChange ? handleDataSourceChange : undefined}
            onSave={() => setSaveModalOpen(true)}
            onLoadQuery={handleLoadQuery}
            savedQueries={savedQueries}
            enableSave={enableLocalStorage || !!onSave}
            isSearching={isSearching}
            onCancel={onCancel}
            searchProgress={searchProgress}
          />
        )}

        {showQuickInsert && <QuickInsertButtons onInsert={handleInsertText} disabled={disabled || isSearching} />}

        <EditorContainer $expanded={isFocused}>
          {(loading || isSearching) && (
            <LoadingOverlay>
              <Spin tip={isSearching ? 'Searching...' : undefined} />
            </LoadingOverlay>
          )}
          <MonacoWrapper ref={containerRef} $expanded={isFocused} $height={editorHeight} />
        </EditorContainer>

        {showErrorPanel && errors.length > 0 && <ErrorPanel errors={errors} onErrorClick={handleErrorClick} />}

        {showHistogram && histogramData && histogramData.length > 0 && (
          <EventHistogram data={histogramData} timeRange={histogramTimeRange} />
        )}

        <SaveQueryModal
          open={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          onSave={handleSaveQuery}
          currentQuery={currentValue}
        />
      </EditorWrapper>
    </>
  );
};
