import type { FC } from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Popover, Button, Calendar } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import {
  PopoverContent,
  QuickSelectPanel,
  QuickSelectItem,
  CalendarPanel,
  InputsRow,
  StyledInput,
  ButtonsRow,
  TriggerInput,
  CalendarWrapper,
  DateInputLabel,
  DateInputGroup,
  CalendarsRow,
} from './styles';
import type { DateRangePickerProps, DateRangeValue, QuickRangeOption } from './types';

const QUICK_RANGE_OPTIONS: QuickRangeOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'Last 90 Days', value: 'last90days' },
  { label: 'Last 180 Days', value: 'last180days' },
  { label: 'Last 365 Days', value: 'last365days' },
  { label: 'Custom Range', value: 'custom' },
];

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function getQuickRangeDates(value: string): { start: Dayjs; end: Dayjs } {
  const now = dayjs();
  const endOfDay = now.endOf('day');
  const startOfDay = now.startOf('day');

  switch (value) {
    case 'today':
      return { start: startOfDay, end: endOfDay };
    case 'yesterday':
      return {
        start: now.subtract(1, 'day').startOf('day'),
        end: now.subtract(1, 'day').endOf('day'),
      };
    case 'last7days':
      return { start: now.subtract(6, 'day').startOf('day'), end: endOfDay };
    case 'last30days':
      return { start: now.subtract(29, 'day').startOf('day'), end: endOfDay };
    case 'last90days':
      return { start: now.subtract(89, 'day').startOf('day'), end: endOfDay };
    case 'last180days':
      return { start: now.subtract(179, 'day').startOf('day'), end: endOfDay };
    case 'last365days':
      return { start: now.subtract(364, 'day').startOf('day'), end: endOfDay };
    default:
      return { start: startOfDay, end: endOfDay };
  }
}

export const DateRangePicker: FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date range',
  disabled = false,
  className,
  style,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedQuickRange, setSelectedQuickRange] = useState<string | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Dayjs | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Dayjs | null>(null);
  const [startInputValue, setStartInputValue] = useState('');
  const [endInputValue, setEndInputValue] = useState('');
  const [leftCalendarMonth, setLeftCalendarMonth] = useState<Dayjs>(dayjs());
  const [rightCalendarMonth, setRightCalendarMonth] = useState<Dayjs>(dayjs().add(1, 'month'));
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);

  // Initialize temp values when popover opens
  useEffect(() => {
    if (open) {
      if (value) {
        const start = dayjs(value.timeFrom);
        const end = dayjs(value.timeTo);
        setTempStartDate(start);
        setTempEndDate(end);
        setStartInputValue(start.format(DATE_FORMAT));
        setEndInputValue(end.format(DATE_FORMAT));
        setLeftCalendarMonth(start.startOf('month'));
        setRightCalendarMonth(start.add(1, 'month').startOf('month'));
      } else {
        setTempStartDate(null);
        setTempEndDate(null);
        setStartInputValue('');
        setEndInputValue('');
        setLeftCalendarMonth(dayjs());
        setRightCalendarMonth(dayjs().add(1, 'month'));
      }
      setSelectedQuickRange(null);
    }
  }, [open, value]);

  const displayValue = useMemo(() => {
    if (value) {
      return value.label;
    }
    return '';
  }, [value]);

  const isApplyEnabled = useMemo(() => {
    if (selectedQuickRange && selectedQuickRange !== 'custom') {
      return true;
    }
    return tempStartDate && tempEndDate && tempStartDate.isBefore(tempEndDate);
  }, [selectedQuickRange, tempStartDate, tempEndDate]);

  const handleQuickRangeSelect = useCallback((option: QuickRangeOption) => {
    if (option.value === 'custom') {
      setSelectedQuickRange('custom');
      return;
    }

    const { start, end } = getQuickRangeDates(option.value);
    const newValue: DateRangeValue = {
      timeFrom: start.valueOf(),
      timeTo: end.valueOf(),
      label: option.label,
    };

    onChange?.(newValue);
    setOpen(false);
  }, [onChange]);

  const handleCalendarSelect = useCallback((date: Dayjs) => {
    setSelectedQuickRange('custom');

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(date.startOf('day'));
      setTempEndDate(null);
      setStartInputValue(date.startOf('day').format(DATE_FORMAT));
      setEndInputValue('');
    } else {
      // Complete selection
      if (date.isBefore(tempStartDate)) {
        setTempEndDate(tempStartDate.endOf('day'));
        setTempStartDate(date.startOf('day'));
        setStartInputValue(date.startOf('day').format(DATE_FORMAT));
        setEndInputValue(tempStartDate.endOf('day').format(DATE_FORMAT));
      } else {
        setTempEndDate(date.endOf('day'));
        setEndInputValue(date.endOf('day').format(DATE_FORMAT));
      }
    }
  }, [tempStartDate, tempEndDate]);

  const handleStartInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setStartInputValue(inputValue);
    setSelectedQuickRange('custom');

    const parsed = dayjs(inputValue, DATE_FORMAT, true);
    if (parsed.isValid()) {
      setTempStartDate(parsed);
    }
  }, []);

  const handleEndInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEndInputValue(inputValue);
    setSelectedQuickRange('custom');

    const parsed = dayjs(inputValue, DATE_FORMAT, true);
    if (parsed.isValid()) {
      setTempEndDate(parsed);
    }
  }, []);

  const handleApply = useCallback(() => {
    if (!tempStartDate || !tempEndDate) return;

    const customLabel = `${tempStartDate.format(DATE_FORMAT)} - ${tempEndDate.format(DATE_FORMAT)}`;
    const newValue: DateRangeValue = {
      timeFrom: tempStartDate.valueOf(),
      timeTo: tempEndDate.valueOf(),
      label: customLabel,
    };

    onChange?.(newValue);
    setOpen(false);
  }, [tempStartDate, tempEndDate, onChange]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const createCellRender = useCallback((calendarMonth: Dayjs) => {
    return (current: Dayjs) => {
      const isStart = tempStartDate && current.isSame(tempStartDate, 'day');
      const isEnd = tempEndDate && current.isSame(tempEndDate, 'day');
      const isInRange = tempStartDate && tempEndDate &&
        current.isAfter(tempStartDate, 'day') &&
        current.isBefore(tempEndDate, 'day');

      // Hover preview: show range between start date and hovered date when selecting end date
      const isSelectingEnd = tempStartDate && !tempEndDate;
      const isHoverEnd = isSelectingEnd && hoverDate && current.isSame(hoverDate, 'day');
      const isInHoverRange = isSelectingEnd && hoverDate && (
        (hoverDate.isAfter(tempStartDate, 'day') &&
          current.isAfter(tempStartDate, 'day') &&
          current.isBefore(hoverDate, 'day')) ||
        (hoverDate.isBefore(tempStartDate, 'day') &&
          current.isBefore(tempStartDate, 'day') &&
          current.isAfter(hoverDate, 'day'))
      );

      // Only show today highlight if this calendar is showing the current month
      const isToday = current.isSame(dayjs(), 'day');
      const isCurrentMonth = calendarMonth.isSame(dayjs(), 'month');
      const showTodayHighlight = isToday && isCurrentMonth;

      let className = '';
      if (isStart) className = 'range-start';
      else if (isEnd) className = 'range-end';
      else if (isInRange) className = 'in-range';
      else if (isHoverEnd) className = 'hover-end';
      else if (isInHoverRange) className = 'in-hover-range';
      if (showTodayHighlight) className += ' today-highlight';

      const handleMouseEnter = () => {
        if (isSelectingEnd) {
          setHoverDate(current);
        }
      };

      return (
        <div
          className={`ant-picker-cell-inner ${className}`}
          onMouseEnter={handleMouseEnter}
        >
          {current.date()}
        </div>
      );
    };
  }, [tempStartDate, tempEndDate, hoverDate]);

  const handleCalendarsMouseLeave = useCallback(() => {
    if (tempStartDate && !tempEndDate) {
      setHoverDate(null);
    }
  }, [tempStartDate, tempEndDate]);

  const leftCellRender = useMemo(() => createCellRender(leftCalendarMonth), [createCellRender, leftCalendarMonth]);
  const rightCellRender = useMemo(() => createCellRender(rightCalendarMonth), [createCellRender, rightCalendarMonth]);

  const handleLeftPanelChange = useCallback((date: Dayjs) => {
    setLeftCalendarMonth(date);
    // Ensure right calendar is always after left
    if (date.isSameOrAfter(rightCalendarMonth, 'month')) {
      setRightCalendarMonth(date.add(1, 'month'));
    }
  }, [rightCalendarMonth]);

  const handleRightPanelChange = useCallback((date: Dayjs) => {
    setRightCalendarMonth(date);
    // Ensure left calendar is always before right
    if (date.isSameOrBefore(leftCalendarMonth, 'month')) {
      setLeftCalendarMonth(date.subtract(1, 'month'));
    }
  }, [leftCalendarMonth]);

  const content = (
    <PopoverContent>
      <QuickSelectPanel>
        {QUICK_RANGE_OPTIONS.map((option) => (
          <QuickSelectItem
            key={option.value}
            $active={selectedQuickRange === option.value}
            onClick={() => handleQuickRangeSelect(option)}
          >
            {option.label}
          </QuickSelectItem>
        ))}
      </QuickSelectPanel>
      <CalendarPanel>
        <CalendarsRow onMouseLeave={handleCalendarsMouseLeave}>
          <CalendarWrapper
            $hasStart={!!tempStartDate}
            $hasEnd={!!tempEndDate}
            $startDate={tempStartDate?.format('YYYY-MM-DD')}
            $endDate={tempEndDate?.format('YYYY-MM-DD')}
            $isCurrentMonth={leftCalendarMonth.isSame(dayjs(), 'month')}
          >
            <Calendar
              fullscreen={false}
              value={leftCalendarMonth}
              onSelect={handleCalendarSelect}
              onPanelChange={handleLeftPanelChange}
              fullCellRender={leftCellRender}
            />
          </CalendarWrapper>
          <CalendarWrapper
            $hasStart={!!tempStartDate}
            $hasEnd={!!tempEndDate}
            $startDate={tempStartDate?.format('YYYY-MM-DD')}
            $endDate={tempEndDate?.format('YYYY-MM-DD')}
            $isCurrentMonth={rightCalendarMonth.isSame(dayjs(), 'month')}
          >
            <Calendar
              fullscreen={false}
              value={rightCalendarMonth}
              onSelect={handleCalendarSelect}
              onPanelChange={handleRightPanelChange}
              fullCellRender={rightCellRender}
            />
          </CalendarWrapper>
        </CalendarsRow>
        <InputsRow>
          <DateInputGroup>
            <DateInputLabel>Start Date</DateInputLabel>
            <StyledInput
              placeholder="YYYY-MM-DD HH:mm:ss"
              value={startInputValue}
              onChange={handleStartInputChange}
            />
          </DateInputGroup>
          <DateInputGroup>
            <DateInputLabel>End Date</DateInputLabel>
            <StyledInput
              placeholder="YYYY-MM-DD HH:mm:ss"
              value={endInputValue}
              onChange={handleEndInputChange}
            />
          </DateInputGroup>
        </InputsRow>
        <ButtonsRow>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleApply}
            disabled={!isApplyEnabled}
          >
            Apply
          </Button>
        </ButtonsRow>
      </CalendarPanel>
    </PopoverContent>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
    >
      <TriggerInput
        className={className}
        style={style}
        $disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
      >
        <span style={{ flex: 1, color: displayValue ? '#262626' : '#bfbfbf' }}>
          {displayValue || placeholder}
        </span>
        <CalendarOutlined style={{ marginLeft: 8, color: '#bfbfbf' }} />
      </TriggerInput>
    </Popover>
  );
};
