import type { ValidationError } from '../lib/socql';

export type EditorMode = 'compact' | 'expanded' | 'auto';

export interface SOCEditorOptions {
  fontSize?: number;
  lineNumbers?: 'on' | 'off' | 'relative';
  minimap?: boolean;
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  tabSize?: number;
  readOnly?: boolean;
}

export interface SOCQueryEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (errors: ValidationError[]) => void;
  validateOnChange?: boolean;
  validationDebounce?: number;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  mode?: EditorMode;
  onModeChange?: (mode: 'compact' | 'expanded') => void;
  theme?: 'socql-light' | 'socql-dark';
  editorOptions?: SOCEditorOptions;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  placeholder?: string;
}

export interface SOCQueryEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
  insertText: (text: string) => void;
  focus: () => void;
  getErrors: () => ValidationError[];
  validate: () => ValidationError[];
  clear: () => void;
}
