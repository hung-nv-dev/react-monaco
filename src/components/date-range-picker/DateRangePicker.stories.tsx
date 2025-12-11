import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import dayjs from 'dayjs';
import { DateRangePicker } from './DateRangePicker';
import type { DateRangeValue } from './types';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no value is selected',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the picker is disabled',
    },
    value: {
      control: false,
      description: 'The selected date range value (startDate and endDate as timestamps)',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when date range changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

// Helper component to show value output
const ValueDisplay = ({ value }: { value?: DateRangeValue }) => {
  if (!value) return null;
  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        background: '#f6ffed',
        border: '1px solid #b7eb8f',
        borderRadius: 6,
        fontSize: 13,
        fontFamily: 'monospace',
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 600, color: '#52c41a' }}>Output Value:</div>
      <div>timeFrom: {value.timeFrom}</div>
      <div>timeTo: {value.timeTo}</div>
      <div>label: {value.label}</div>
      <div style={{ marginTop: 8, color: '#8c8c8c' }}>
        Formatted: {dayjs(value.timeFrom).format('YYYY-MM-DD HH:mm:ss')} - {dayjs(value.timeTo).format('YYYY-MM-DD HH:mm:ss')}
      </div>
    </div>
  );
};

// Default story with value display
const DefaultTemplate = () => {
  const [value, setValue] = useState<DateRangeValue | undefined>();
  return (
    <div>
      <DateRangePicker
        value={value}
        onChange={setValue}
        placeholder="Select date range"
      />
      <ValueDisplay value={value} />
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultTemplate />,
};

// With initial value
const WithInitialValueTemplate = () => {
  const [value, setValue] = useState<DateRangeValue>({
    timeFrom: dayjs().subtract(7, 'day').startOf('day').valueOf(),
    timeTo: dayjs().endOf('day').valueOf(),
    label: 'Last 7 Days',
  });
  return (
    <div>
      <DateRangePicker value={value} onChange={setValue} />
      <ValueDisplay value={value} />
    </div>
  );
};

export const WithInitialValue: Story = {
  render: () => <WithInitialValueTemplate />,
};

// Disabled state
const DisabledTemplate = () => {
  const [value] = useState<DateRangeValue>({
    timeFrom: dayjs().subtract(30, 'day').startOf('day').valueOf(),
    timeTo: dayjs().endOf('day').valueOf(),
    label: 'Last 30 Days',
  });
  return (
    <div>
      <DateRangePicker
        value={value}
        disabled={true}
        placeholder="Disabled picker"
      />
      <ValueDisplay value={value} />
    </div>
  );
};

export const Disabled: Story = {
  render: () => <DisabledTemplate />,
};

// Custom placeholder
const CustomPlaceholderTemplate = () => {
  const [value, setValue] = useState<DateRangeValue | undefined>();
  return (
    <div>
      <DateRangePicker
        value={value}
        onChange={setValue}
        placeholder="Choose your date range..."
      />
      <ValueDisplay value={value} />
    </div>
  );
};

export const CustomPlaceholder: Story = {
  render: () => <CustomPlaceholderTemplate />,
};

// Interactive example with detailed output
const InteractiveTemplate = () => {
  const [value, setValue] = useState<DateRangeValue | undefined>();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DateRangePicker value={value} onChange={setValue} />
      {value && (
        <div
          style={{
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
          }}
        >
          <div>
            <strong>Output Value:</strong>
          </div>
          <pre style={{ margin: '8px 0 0 0' }}>
            {JSON.stringify(
              {
                timeFrom: value.timeFrom,
                timeTo: value.timeTo,
                label: value.label,
                timeFromFormatted: dayjs(value.timeFrom).format('YYYY-MM-DD HH:mm:ss'),
                timeToFormatted: dayjs(value.timeTo).format('YYYY-MM-DD HH:mm:ss'),
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
};

// Quick range selection demo
const QuickRangeDemo = () => {
  const [value, setValue] = useState<DateRangeValue | undefined>();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <strong>Quick Range Selection Demo</strong>
        <p style={{ color: '#8c8c8c', fontSize: 13, margin: '4px 0 12px' }}>
          Click on the picker and select a quick range option to see how it works.
        </p>
      </div>
      <DateRangePicker value={value} onChange={setValue} />
      <ValueDisplay value={value} />
    </div>
  );
};

export const QuickRangeSelectionDemo: Story = {
  render: () => <QuickRangeDemo />,
};

// Controlled component example
const ControlledTemplate = () => {
  const [value, setValue] = useState<DateRangeValue>({
    timeFrom: dayjs().subtract(30, 'day').startOf('day').valueOf(),
    timeTo: dayjs().endOf('day').valueOf(),
    label: 'Last 30 Days',
  });

  const resetToLast7Days = () => {
    setValue({
      timeFrom: dayjs().subtract(6, 'day').startOf('day').valueOf(),
      timeTo: dayjs().endOf('day').valueOf(),
      label: 'Last 7 Days',
    });
  };

  const resetToLastMonth = () => {
    setValue({
      timeFrom: dayjs().subtract(29, 'day').startOf('day').valueOf(),
      timeTo: dayjs().endOf('day').valueOf(),
      label: 'Last 30 Days',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DateRangePicker value={value} onChange={setValue} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={resetToLast7Days}>Set to Last 7 Days</button>
        <button onClick={resetToLastMonth}>Set to Last 30 Days</button>
      </div>
      <ValueDisplay value={value} />
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledTemplate />,
};
