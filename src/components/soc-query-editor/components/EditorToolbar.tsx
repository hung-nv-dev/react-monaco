import React from 'react';
import { Button, Tooltip, Space, Select, Dropdown, Spin, Progress } from 'antd';
import type { MenuProps } from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  WarningOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  StopOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import type { DataSource, SavedQuery } from '../SOCQueryEditor.types';

export interface EditorToolbarProps {
  onSearch?: () => void;
  onClear?: () => void;
  disabled?: boolean;
  hasErrors?: boolean;
  dataSource?: DataSource;
  onDataSourceChange?: (dataSource: DataSource) => void;
  onSave?: () => void;
  onLoadQuery?: (query: SavedQuery) => void;
  savedQueries?: SavedQuery[];
  enableSave?: boolean;
  isSearching?: boolean;
  onCancel?: () => void;
  /** Search progress percentage (0-100). If undefined, shows indeterminate progress. */
  searchProgress?: number;
}

const DATA_SOURCE_OPTIONS = [
  { value: 'siem', label: 'SIEM' },
  { value: 'edr', label: 'EDR' },
  { value: 'both', label: 'All Sources' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onSearch,
  onClear,
  disabled = false,
  hasErrors = false,
  dataSource = 'both',
  onDataSourceChange,
  onSave,
  onLoadQuery,
  savedQueries = [],
  enableSave = false,
  isSearching = false,
  onCancel,
  searchProgress,
}) => {
  const getSavedQueriesMenuItems = (): MenuProps['items'] => {
    if (savedQueries.length === 0) {
      return [{ key: 'empty', label: <span style={{ color: '#999' }}>No saved queries</span>, disabled: true }];
    }

    return savedQueries.map((query) => ({
      key: query.id,
      label: (
        <div style={{ maxWidth: 250 }}>
          <div style={{ fontWeight: 500 }}>{query.name}</div>
          {query.description && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {query.description.length > 50 ? `${query.description.substring(0, 50)}...` : query.description}
            </div>
          )}
        </div>
      ),
      onClick: () => onLoadQuery?.(query),
    }));
  };

  return (
    <div className="soc-query-editor__toolbar">
      <div className="soc-query-editor__toolbar-left">
        <Space size={8}>
          {onDataSourceChange && (
            <Select
              size="small"
              value={dataSource}
              onChange={onDataSourceChange}
              options={DATA_SOURCE_OPTIONS}
              style={{ width: 120 }}
              disabled={disabled || isSearching}
              suffixIcon={<DatabaseOutlined />}
            />
          )}
          {hasErrors && (
            <Tooltip title="Query has validation errors">
              <WarningOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
            </Tooltip>
          )}
          {isSearching && (
            <div className="soc-query-editor__search-progress">
              {searchProgress !== undefined ? (
                <Progress
                  percent={searchProgress}
                  size="small"
                  style={{ width: 100 }}
                  strokeColor="#1890ff"
                  status="active"
                />
              ) : (
                <Spin size="small" />
              )}
              <span className="soc-query-editor__search-progress-text">
                {searchProgress !== undefined ? `${searchProgress}%` : 'Searching...'}
              </span>
            </div>
          )}
        </Space>
      </div>

      <div className="soc-query-editor__toolbar-right">
        <Space size={4}>
          {enableSave && (
            <Dropdown menu={{ items: getSavedQueriesMenuItems() }} trigger={['click']} disabled={disabled || isSearching}>
              <Tooltip title="Load saved query">
                <Button type="text" size="small" icon={<FolderOpenOutlined />} disabled={disabled || isSearching} />
              </Tooltip>
            </Dropdown>
          )}
          {enableSave && (
            <Tooltip title="Save query">
              <Button type="text" size="small" icon={<SaveOutlined />} onClick={onSave} disabled={disabled || isSearching} />
            </Tooltip>
          )}
          <Tooltip title="Clear query">
            <Button type="text" size="small" icon={<ClearOutlined />} onClick={onClear} disabled={disabled || isSearching} />
          </Tooltip>
          {isSearching ? (
            <Tooltip title="Stop search">
              <Button type="primary" danger size="small" icon={<StopOutlined />} onClick={onCancel}>
                Stop
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Search (Ctrl+Enter)">
              <Button type="primary" size="small" icon={<SearchOutlined />} onClick={onSearch} disabled={disabled || hasErrors}>
                Search
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>
    </div>
  );
};
