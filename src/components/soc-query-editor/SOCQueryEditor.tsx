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
  type ValidationError,
} from './lib/socql';
import { ErrorPanel } from './components/ErrorPanel';
import type { SOCQueryEditorProps } from './types';
import {
  EditorWrapper,
  EditorContainer,
  MonacoWrapper,
  LoadingOverlay,
  MonacoGlobalStyles,
  ErrorIconContainer,
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
  validateOnChange = true,
  validationDebounce = 300,
  theme = 'socql-light',
  editorOptions,
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

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

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
      readOnly: readOnly || disabled,
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
    editorRef.current?.updateOptions({ readOnly: readOnly || disabled });
  }, [readOnly, disabled]);

  // Handle theme changes
  useEffect(() => {
    if (isEditorReady) {
      monaco.editor.setTheme(theme);
    }
  }, [theme, isEditorReady]);

  const handleErrorClick = useCallback((error: ValidationError) => {
    if (editorRef.current) {
      editorRef.current.setPosition({ lineNumber: error.startLine, column: error.startColumn });
      editorRef.current.revealLineInCenter(error.startLine);
      editorRef.current.focus();
    }
  }, []);

  return (
    <>
      <GlobalStyles />
      <EditorWrapper $disabled={disabled} $hasErrors={errors.length > 0} className={className} style={style}>
        <EditorContainer>
          {loading && (
            <LoadingOverlay>
              <Spin />
            </LoadingOverlay>
          )}
          <MonacoWrapper ref={containerRef} />
          {errors.length > 0 && (
            <ErrorIconContainer>
              <ErrorPanel errors={errors} onErrorClick={handleErrorClick} />
            </ErrorIconContainer>
          )}
        </EditorContainer>
      </EditorWrapper>
    </>
  );
};
