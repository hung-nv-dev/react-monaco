import { Button, Tooltip } from 'antd';

export interface QuickInsertButtonsProps {
  onInsert: (text: string) => void;
  disabled?: boolean;
}

const INSERT_GROUPS = [
  {
    label: 'Operators',
    items: [
      { label: 'AND', value: ' AND ', tooltip: 'Logical AND' },
      { label: 'OR', value: ' OR ', tooltip: 'Logical OR' },
      { label: 'NOT', value: ' NOT ', tooltip: 'Logical NOT' },
      { label: 'IN', value: ' IN ()', tooltip: 'Match any value in list' },
      { label: '~', value: ' ~ ', tooltip: 'Regex match' },
      { label: '!~', value: ' !~ ', tooltip: 'Regex not match' },
    ],
  },
  {
    label: 'Pipe',
    items: [
      { label: '|last', value: ' |last ', tooltip: 'Get last N records' },
      { label: '|dedup', value: ' |dedup ', tooltip: 'Remove duplicates' },
      { label: '|eval', value: ' |eval ', tooltip: 'Evaluate expression' },
      { label: '|agg', value: ' |agg ', tooltip: 'Aggregate data' },
      { label: '|order by', value: ' |order by ', tooltip: 'Sort results' },
    ],
  },
  {
    label: 'Functions',
    items: [
      { label: 'regex_match()', value: 'regex_match(field, "pattern")', tooltip: 'Match regex pattern' },
      { label: 'lower()', value: 'lower(field)', tooltip: 'Convert to lowercase' },
      { label: 'now()', value: 'now()', tooltip: 'Current timestamp' },
      { label: 'relative_time()', value: 'relative_time(now(), "-7d")', tooltip: 'Relative time calculation' },
    ],
  },
  {
    label: 'Time',
    items: [
      { label: '-1h', value: '"-1h"', tooltip: 'Last 1 hour' },
      { label: '-24h', value: '"-24h"', tooltip: 'Last 24 hours' },
      { label: '-7d', value: '"-7d"', tooltip: 'Last 7 days' },
      { label: '-30d', value: '"-30d"', tooltip: 'Last 30 days' },
    ],
  },
];

export const QuickInsertButtons = ({ onInsert, disabled = false }: QuickInsertButtonsProps) => (
  <div className="soc-query-editor__quick-insert">
    {INSERT_GROUPS.map((group) => (
      <div key={group.label} className="soc-query-editor__quick-insert-group">
        <span className="soc-query-editor__quick-insert-label">{group.label}:</span>
        {group.items.map((item) => (
          <Tooltip key={item.label} title={item.tooltip}>
            <Button size="small" type="dashed" onClick={() => onInsert(item.value)} disabled={disabled}>
              {item.label}
            </Button>
          </Tooltip>
        ))}
      </div>
    ))}
  </div>
);
