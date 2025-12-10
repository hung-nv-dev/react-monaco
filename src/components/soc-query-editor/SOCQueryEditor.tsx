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
  validateOnChange = true,
  validationDebounce = 300,
  showToolbar = false,
  showErrorPanel = false,
  showQuickInsert = false,
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

  const storage = useQueryStorage({ storageKey, enabled: enableLocalStorage });

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [internalDataSource, setInternalDataSource] = useState<DataSource>('both');
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const currentDataSource = controlledDataSource ?? internalDataSource;
  const savedQueries = controlledSavedQueries ?? storage.savedQueries;

  // Initialize SOCQL language once
  useEffect(() => {
    if (!initialized) {
      initializeSOCQL();
      initialized = true;
    }
  }, []);

  // Create editor instance
  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: currentValue,
      language: SOCQL_LANGUAGE_ID,
      theme,
      automaticLayout: true,
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
      lineDecorationsWidth: 0,
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        vertical: 'auto',
        horizontal: 'hidden',
      },
      overviewRulerBorder: false,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      contextmenu: true,
      quickSuggestions: { other: true, comments: false, strings: true },
      suggestOnTriggerCharacters: true,
      parameterHints: { enabled: true },
      placeholder,
      ariaLabel,
      fixedOverflowWidgets: true,
    });

    editorRef.current = editor;
    setIsEditorReady(true);

    // Handle content changes
    const changeDisposable = editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();

      if (!isControlled) setInternalValue(newValue);
      onChange?.(newValue);

      if (validateOnChange) {
        if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
        validationTimeoutRef.current = setTimeout(() => {
          const model = editor.getModel();
          if (model) {
            const result = validateQuery(newValue);
            setErrors(result.errors);
            setValidationMarkers(model, result.errors);
            onValidationChange?.(result.errors);
          }
        }, validationDebounce);
      }
    });

    // Handle Ctrl+Enter for search
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isSearching) onSearch?.(editor.getValue());
    });

    // Initial validation
    if (validateOnChange && currentValue) {
      const model = editor.getModel();
      if (model) {
        const result = validateQuery(currentValue);
        setErrors(result.errors);
        setValidationMarkers(model, result.errors);
      }
    }

    return () => {
      changeDisposable.dispose();
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
      editor.dispose();
      editorRef.current = null;
      setIsEditorReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle controlled value changes
  useEffect(() => {
    if (isControlled && editorRef.current && isEditorReady) {
      const currentEditorValue = editorRef.current.getValue();
      if (currentEditorValue !== controlledValue) {
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

  // Handle readOnly changes
  useEffect(() => {
    editorRef.current?.updateOptions({ readOnly: readOnly || disabled || isSearching });
  }, [readOnly, disabled, isSearching]);

  // Handle theme changes
  useEffect(() => {
    if (isEditorReady) {
      monaco.editor.setTheme(theme);
    }
  }, [theme, isEditorReady]);

  const handleSearch = useCallback(() => {
    if (!isSearching) onSearch?.(editorRef.current?.getValue() || '');
  }, [onSearch, isSearching]);

  const handleClear = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.setValue('');
      const model = editorRef.current.getModel();
      if (model) clearValidationMarkers(model);
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

        <EditorContainer>
          {(loading || isSearching) && (
            <LoadingOverlay>
              <Spin tip={isSearching ? 'Searching...' : undefined} />
            </LoadingOverlay>
          )}
          <MonacoWrapper ref={containerRef} />
        </EditorContainer>

        {showErrorPanel && errors.length > 0 && <ErrorPanel errors={errors} onErrorClick={handleErrorClick} />}

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
