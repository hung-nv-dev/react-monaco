import { useState } from 'react';
import { Badge, Typography } from 'antd';
import { ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import type { ValidationError } from '../lib/socql';

const { Text } = Typography;

export interface ErrorPanelProps {
  errors: ValidationError[];
  onErrorClick?: (error: ValidationError) => void;
}

const getSeverityIcon = (severity: ValidationError['severity']) => {
  const cls = 'soc-query-editor__error-icon';
  switch (severity) {
    case 'error': return <ExclamationCircleOutlined className={`${cls} ${cls}--error`} />;
    case 'warning': return <WarningOutlined className={`${cls} ${cls}--warning`} />;
    case 'info': return <InfoCircleOutlined className={`${cls} ${cls}--info`} />;
    default: return <ExclamationCircleOutlined className={cls} />;
  }
};

export const ErrorPanel = ({ errors, onErrorClick }: ErrorPanelProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') action();
  };

  return (
    <div className={`soc-query-editor__error-panel ${errorCount > 0 ? 'soc-query-editor__error-panel--has-errors' : ''}`}>
      <div
        className="soc-query-editor__error-header"
        onClick={() => setCollapsed(!collapsed)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, () => setCollapsed(!collapsed))}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {errorCount > 0 && (
            <Badge count={errorCount} style={{ backgroundColor: '#ff4d4f' }} size="small">
              <Text type="danger" style={{ paddingRight: 8 }}>Errors</Text>
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge count={warningCount} style={{ backgroundColor: '#faad14' }} size="small">
              <Text type="warning" style={{ paddingRight: 8 }}>Warnings</Text>
            </Badge>
          )}
        </div>
        {collapsed ? <DownOutlined /> : <UpOutlined />}
      </div>

      {!collapsed && (
        <ul className="soc-query-editor__error-list">
          {errors.map((error, index) => (
            <li
              key={`${error.startLine}-${error.startColumn}-${index}`}
              className="soc-query-editor__error-item"
              onClick={() => onErrorClick?.(error)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, () => onErrorClick?.(error))}
            >
              {getSeverityIcon(error.severity)}
              <div className="soc-query-editor__error-content">
                <div className="soc-query-editor__error-message">{error.message}</div>
                <div className="soc-query-editor__error-location">Line {error.startLine}, Column {error.startColumn}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
