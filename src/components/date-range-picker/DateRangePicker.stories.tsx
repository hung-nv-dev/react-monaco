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

export const Default: Story = {
  args: {
    placeholder: 'Select date range',
  },
};

export const WithInitialValue: Story = {
  args: {
    value: {
      startDate: dayjs().subtract(7, 'day').startOf('day').valueOf(),
      endDate: dayjs().endOf('day').valueOf(),
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled picker',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Choose your date range...',
  },
};

// Interactive example with state management
const InteractiveTemplate = () => {
  const [value, setValue] = useState<DateRangeValue | undefined>();

  const handleChange = (newValue: DateRangeValue) => {
    setValue(newValue);
    console.log('Selected range:', {
      startDate: newValue.startDate,
      endDate: newValue.endDate,
      startFormatted: dayjs(newValue.startDate).format('YYYY-MM-DD HH:mm:ss'),
      endFormatted: dayjs(newValue.endDate).format('YYYY-MM-DD HH:mm:ss'),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DateRangePicker value={value} onChange={handleChange} />
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
                startDate: value.startDate,
                endDate: value.endDate,
                startFormatted: dayjs(value.startDate).format('YYYY-MM-DD HH:mm:ss'),
                endFormatted: dayjs(value.endDate).format('YYYY-MM-DD HH:mm:ss'),
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

// Example showing different quick range selections
const QuickRangeDemo = () => {
  const [value, setValue] = useState<DateRangeValue | undefined>();
  const [label, setLabel] = useState<string>('');

  const handleChange = (newValue: DateRangeValue) => {
    setValue(newValue);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <strong>Quick Range Selection Demo</strong>
        <p style={{ color: '#8c8c8c', fontSize: 13, margin: '4px 0 12px' }}>
          Click on the picker and select a quick range option to see how it works.
        </p>
      </div>
      <DateRangePicker value={value} onChange={handleChange} />
      {value && (
        <div
          style={{
            padding: 12,
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          <strong>Timestamp Output:</strong>
          <br />
          Start: {value.startDate} ({dayjs(value.startDate).format('YYYY-MM-DD HH:mm:ss')})
          <br />
          End: {value.endDate} ({dayjs(value.endDate).format('YYYY-MM-DD HH:mm:ss')})
        </div>
      )}
    </div>
  );
};

export const QuickRangeSelectionDemo: Story = {
  render: () => <QuickRangeDemo />,
};

// Controlled component example
const ControlledTemplate = () => {
  const [value, setValue] = useState<DateRangeValue>({
    startDate: dayjs().subtract(30, 'day').startOf('day').valueOf(),
    endDate: dayjs().endOf('day').valueOf(),
  });

  const resetToLast7Days = () => {
    setValue({
      startDate: dayjs().subtract(6, 'day').startOf('day').valueOf(),
      endDate: dayjs().endOf('day').valueOf(),
    });
  };

  const resetToLastMonth = () => {
    setValue({
      startDate: dayjs().subtract(29, 'day').startOf('day').valueOf(),
      endDate: dayjs().endOf('day').valueOf(),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DateRangePicker value={value} onChange={setValue} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={resetToLast7Days}>Set to Last 7 Days</button>
        <button onClick={resetToLastMonth}>Set to Last 30 Days</button>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledTemplate />,
};
