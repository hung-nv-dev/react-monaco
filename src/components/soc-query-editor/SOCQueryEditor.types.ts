import type { ValidationError } from './lib/socql';

export type EditorMode = 'compact' | 'expanded' | 'auto';
export type DataSource = 'siem' | 'edr' | 'both';

export interface HistogramDataPoint {
  timestamp: number;
  count: number;
  label?: string;
}

export interface TimeRange {
  type: 'relative' | 'absolute';
  relativeValue?: string;
  absoluteStart?: string;
  absoluteEnd?: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  description?: string;
  timeRange?: TimeRange;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

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
  onSearch?: (query: string) => void;
  dataSource?: DataSource;
  onDataSourceChange?: (dataSource: DataSource) => void;
  isSearching?: boolean;
  onCancel?: () => void;
  /** Search progress percentage (0-100). If undefined, shows indeterminate progress when isSearching is true. */
  searchProgress?: number;
  showHistogram?: boolean;
  histogramData?: HistogramDataPoint[];
  histogramTimeRange?: TimeRange;
  validateOnChange?: boolean;
  validationDebounce?: number;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  showToolbar?: boolean;
  showErrorPanel?: boolean;
  showExamples?: boolean;
  showQuickInsert?: boolean;
  mode?: EditorMode;
  onModeChange?: (mode: 'compact' | 'expanded') => void;
  theme?: 'socql-light' | 'socql-dark';
  enableLocalStorage?: boolean;
  storageKey?: string;
  savedQueries?: SavedQuery[];
  onSave?: (query: SavedQuery) => void;
  onLoad?: (query: SavedQuery) => void;
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
