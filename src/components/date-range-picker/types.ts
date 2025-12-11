import type { CSSProperties } from 'react';

export interface DateRangeValue {
  startDate: number; // timestamp
  endDate: number; // timestamp
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
