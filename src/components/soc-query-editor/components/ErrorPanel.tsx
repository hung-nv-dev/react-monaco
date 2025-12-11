import { Popover, Badge } from 'antd';
import { ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ValidationError } from '../lib/socql';
import styled from 'styled-components';

export interface ErrorPanelProps {
  errors: ValidationError[];
  onErrorClick?: (error: ValidationError) => void;
}

const ErrorIconWrapper = styled.div<{ $hasErrors: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  cursor: pointer;
  color: ${({ $hasErrors }) => ($hasErrors ? '#ff4d4f' : '#faad14')};
  transition: color 0.2s;

  &:hover {
    color: ${({ $hasErrors }) => ($hasErrors ? '#ff7875' : '#ffc53d')};
  }
`;

const ErrorList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  min-width: 280px;
`;

const ErrorItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ErrorIconStyled = styled.span<{ $severity: ValidationError['severity'] }>`
  flex-shrink: 0;
  margin-top: 2px;
  color: ${({ $severity }) => {
    switch ($severity) {
      case 'error': return '#ff4d4f';
      case 'warning': return '#faad14';
      case 'info': return '#1890ff';
      default: return '#ff4d4f';
    }
  }};
`;

const ErrorContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ErrorMessage = styled.div`
  font-size: 13px;
  color: #262626;
  word-break: break-word;
`;

const ErrorLocation = styled.div`
  font-size: 11px;
  color: #8c8c8c;
  margin-top: 2px;
`;

const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
`;

const getSeverityIcon = (severity: ValidationError['severity']) => {
  switch (severity) {
    case 'error': return <ExclamationCircleOutlined />;
    case 'warning': return <WarningOutlined />;
    case 'info': return <InfoCircleOutlined />;
    default: return <ExclamationCircleOutlined />;
  }
};

export const ErrorPanel = ({ errors, onErrorClick }: ErrorPanelProps) => {
  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;
  const hasErrors = errorCount > 0;

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const content = (
    <>
      <PopoverHeader>
        {errorCount > 0 && (
          <Badge count={errorCount} style={{ backgroundColor: '#ff4d4f' }} size="small">
            <span style={{ paddingRight: 8, color: '#ff4d4f' }}>Errors</span>
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge count={warningCount} style={{ backgroundColor: '#faad14' }} size="small">
            <span style={{ paddingRight: 8, color: '#faad14' }}>Warnings</span>
          </Badge>
        )}
      </PopoverHeader>
      <ErrorList>
        {errors.map((error, index) => (
          <ErrorItem
            key={`${error.startLine}-${error.startColumn}-${index}`}
            onClick={() => onErrorClick?.(error)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => onErrorClick?.(error))}
          >
            <ErrorIconStyled $severity={error.severity}>
              {getSeverityIcon(error.severity)}
            </ErrorIconStyled>
            <ErrorContent>
              <ErrorMessage>{error.message}</ErrorMessage>
              <ErrorLocation>Line {error.startLine}, Column {error.startColumn}</ErrorLocation>
            </ErrorContent>
          </ErrorItem>
        ))}
      </ErrorList>
    </>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      overlayStyle={{ maxWidth: 400 }}
    >
      <ErrorIconWrapper $hasErrors={hasErrors}>
        {hasErrors ? <ExclamationCircleOutlined style={{ fontSize: 16 }} /> : <WarningOutlined style={{ fontSize: 16 }} />}
      </ErrorIconWrapper>
    </Popover>
  );
};
