import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SOCQueryEditor } from './SOCQueryEditor';
import type { SOCQueryEditorProps, SavedQuery, DataSource } from './types';

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
    dataSource: {
      control: 'select',
      options: ['siem', 'edr', 'both'],
      description: 'Data source for queries',
    },
    showToolbar: {
      control: 'boolean',
      description: 'Show the toolbar with search/clear buttons',
    },
    showErrorPanel: {
      control: 'boolean',
      description: 'Show validation errors panel',
    },
    showQuickInsert: {
      control: 'boolean',
      description: 'Show quick insert buttons',
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
    isSearching: {
      control: 'boolean',
      description: 'Show searching state',
    },
    validateOnChange: {
      control: 'boolean',
      description: 'Validate query as user types',
    },
    enableLocalStorage: {
      control: 'boolean',
      description: 'Enable local storage for saved queries',
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

// With toolbar and panels
export const WithToolbar: Story = {
  args: {
    defaultValue: 'source_ip = "192.168.1.1"',
    showToolbar: true,
    showErrorPanel: true,
    showQuickInsert: true,
  },
};

// With validation errors
export const WithValidationErrors: Story = {
  args: {
    defaultValue: 'invalid_field == "test" AND',
    showErrorPanel: true,
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
  args: {
    showToolbar: true,
    showErrorPanel: true,
  },
};

// With search callback
const WithSearchTemplate = (args: SOCQueryEditorProps) => {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <div>
      <SOCQueryEditor
        {...args}
        onSearch={handleSearch}
        isSearching={isSearching}
        onCancel={() => setIsSearching(false)}
      />
      {searchQuery && (
        <div style={{ marginTop: 16, padding: 8, background: '#e6f7ff', borderRadius: 4 }}>
          <strong>Last search:</strong>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{searchQuery}</pre>
        </div>
      )}
    </div>
  );
};

export const WithSearch: Story = {
  render: WithSearchTemplate,
  args: {
    defaultValue: 'event_type = "authentication" AND status = "failed"',
    showToolbar: true,
  },
};

// With saved queries
const savedQueriesExample: SavedQuery[] = [
  {
    id: '1',
    name: 'Failed Logins',
    query: 'event_type = "login" AND status = "failed" | stats count by source_ip',
    description: 'Find all failed login attempts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['security', 'authentication'],
  },
  {
    id: '2',
    name: 'Suspicious Ports',
    query: 'destination_port IN (4444, 5555, 6666) | stats count by source_ip, destination_ip',
    description: 'Detect connections to suspicious ports',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['network', 'threat'],
  },
  {
    id: '3',
    name: 'High Volume Traffic',
    query: 'bytes_out > 1000000 | stats sum(bytes_out) by source_ip | sort -sum_bytes_out',
    description: 'Find high volume outbound traffic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['network', 'exfiltration'],
  },
];

export const WithSavedQueries: Story = {
  args: {
    showToolbar: true,
    savedQueries: savedQueriesExample,
    enableLocalStorage: false,
    onSave: (query: SavedQuery) => console.log('Saved:', query),
    onLoad: (query: SavedQuery) => console.log('Loaded:', query),
  },
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

// Searching state with progress
export const SearchingWithProgress: Story = {
  args: {
    defaultValue: 'event_type = "malware" | stats count',
    isSearching: true,
    searchProgress: 65,
    showToolbar: true,
  },
};

// With data source selector
export const WithDataSource: Story = {
  args: {
    defaultValue: 'process_name = "cmd.exe"',
    dataSource: 'edr',
    onDataSourceChange: (ds: DataSource) => console.log('Data source changed:', ds),
    showToolbar: true,
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
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSearch = (_query: string) => {
    setIsSearching(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsSearching(false);
          return 0;
        }
        return p + 10;
      });
    }, 200);
  };

  return (
    <SOCQueryEditor
      {...args}
      value={value}
      onChange={setValue}
      onSearch={handleSearch}
      isSearching={isSearching}
      searchProgress={progress}
      onCancel={() => setIsSearching(false)}
      savedQueries={savedQueriesExample}
      onSave={(query: SavedQuery) => console.log('Saved:', query)}
      onLoad={(query: SavedQuery) => setValue(query.query)}
    />
  );
};

export const FullFeatured: Story = {
  render: FullFeaturedTemplate,
  args: {
    showToolbar: true,
    showErrorPanel: true,
    showQuickInsert: true,
    enableLocalStorage: true,
    dataSource: 'both',
    onDataSourceChange: (ds: DataSource) => console.log('Data source:', ds),
  },
};
