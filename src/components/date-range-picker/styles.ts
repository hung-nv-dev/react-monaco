import styled, { css } from 'styled-components';
import { Input } from 'antd';

export const PopoverContent = styled.div`
  display: flex;
  width: 100%;
  max-width: 700px;
  background: #fff;
  border-radius: 8px;
`;

export const QuickSelectPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 160px;
  padding: 8px;
  border-right: 1px solid #f0f0f0;
  background: #fafafa;
  border-radius: 8px 0 0 8px;
`;

export const QuickSelectItem = styled.div<{ $active?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #262626;
  transition: all 0.2s;

  &:hover {
    background: #e6f7ff;
    color: #1890ff;
  }

  ${({ $active }) =>
    $active &&
    css`
      background: #e6f7ff;
      color: #1890ff;
      font-weight: 500;
    `}
`;

export const CalendarPanel = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

export const CalendarsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

export const InputsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

export const DateInputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DateInputLabel = styled.label`
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
`;

export const StyledInput = styled(Input)`
  font-size: 13px;
`;

export const CalendarWrapper = styled.div<{
  $hasStart?: boolean;
  $hasEnd?: boolean;
  $startDate?: string;
  $endDate?: string;
}>`
  flex: 1;

  .ant-picker-calendar {
    .ant-picker-panel {
      border: none;
    }

    .ant-picker-cell {
      &::before {
        height: 28px;
      }
    }

    .ant-picker-cell-inner {
      min-width: 28px;
      height: 28px;
      line-height: 28px;
      border-radius: 4px;
    }

    .ant-picker-cell-in-view {
      .range-start {
        background: #1890ff;
        color: #fff;
        border-radius: 4px 0 0 4px;
      }

      .range-end {
        background: #1890ff;
        color: #fff;
        border-radius: 0 4px 4px 0;
      }

      .in-range {
        background: #e6f7ff;
        border-radius: 0;
      }
    }
  }

  /* Style for date cells based on selection */
  ${({ $hasStart, $hasEnd, $startDate, $endDate }) => {
    if (!$hasStart || !$hasEnd || !$startDate || !$endDate) return '';

    return css`
      .ant-picker-cell-in-view {
        &[title="${$startDate}"] {
          .ant-picker-cell-inner {
            background: #1890ff !important;
            color: #fff !important;
            border-radius: 4px 0 0 4px !important;
          }
        }

        &[title="${$endDate}"] {
          .ant-picker-cell-inner {
            background: #1890ff !important;
            color: #fff !important;
            border-radius: 0 4px 4px 0 !important;
          }
        }
      }
    `;
  }}
`;

export const ButtonsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

export const TriggerInput = styled.div<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-width: 280px;
  height: 32px;
  padding: 4px 11px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;

  &:hover {
    border-color: #1890ff;
  }

  ${({ $disabled }) =>
    $disabled &&
    css`
      background: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        border-color: #d9d9d9;
      }
    `}
`;
