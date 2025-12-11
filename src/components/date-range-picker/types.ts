import type { CSSProperties } from 'react';

export interface DateRangeValue {
  timeFrom: number; // 13 digit timestamp
  timeTo: number; // 13 digit timestamp
  label: string; // "Last 7 Days" or date format "YYYY-MM-DD HH:mm:ss - YYYY-MM-DD HH:mm:ss"
}

export interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface QuickRangeOption {
  label: string;
  value: string;
}
