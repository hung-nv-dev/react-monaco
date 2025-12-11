import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SOCQueryEditor } from './SOCQueryEditor';
import type { SOCQueryEditorProps } from './types';

const meta: Meta<typeof SOCQueryEditor> = {
  title: 'Components/SOCQueryEditor',
  component: SOCQueryEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A Monaco-based query editor for SOC (Security Operations Center) queries with syntax highlighting, validation, autocomplete, and more.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['socql-light', 'socql-dark'],
      description: 'Editor color theme',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the editor',
    },
    readOnly: {
      control: 'boolean',
      description: 'Make the editor read-only',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    validateOnChange: {
      control: 'boolean',
      description: 'Validate query as user types',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SOCQueryEditor>;

// Default story - minimal editor
export const Default: Story = {
  args: {
    placeholder: 'Enter your SOCQL query...',
    theme: 'socql-light',
  },
};

// With default value
export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'source_ip = "192.168.1.1" AND event_type = "login"',
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    theme: 'socql-dark',
    defaultValue: 'destination_port IN (80, 443, 8080) | stats count by source_ip',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// With validation errors
export const WithValidationErrors: Story = {
  args: {
    defaultValue: 'invalid_field == "test" AND',
    validateOnChange: true,
  },
};

// Controlled component
const ControlledTemplate = (args: SOCQueryEditorProps) => {
  const [value, setValue] = useState('source_ip = "10.0.0.1"');
  return (
    <div>
      <SOCQueryEditor {...args} value={value} onChange={setValue} />
      <div style={{ marginTop: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
        <strong>Current value:</strong>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{value}</pre>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: ControlledTemplate,
  args: {},
};

// Disabled state
export const Disabled: Story = {
  args: {
    defaultValue: 'source_ip = "192.168.1.1"',
    disabled: true,
  },
};

// Read-only state
export const ReadOnly: Story = {
  args: {
    defaultValue: 'source_ip = "192.168.1.1" AND event_type = "login"',
    readOnly: true,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
  },
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    defaultValue: 'source_ip = "192.168.1.1"',
    className: 'custom-editor',
    style: {
      border: '2px solid #1890ff',
      borderRadius: 8,
      padding: 8,
    },
  },
};

// Full featured
const FullFeaturedTemplate = (args: SOCQueryEditorProps) => {
  const [value, setValue] = useState('');

  return (
    <SOCQueryEditor
      {...args}
      value={value}
      onChange={setValue}
    />
  );
};

export const FullFeatured: Story = {
  render: FullFeaturedTemplate,
  args: {
    validateOnChange: true,
  },
};
