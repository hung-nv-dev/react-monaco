import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Empty, Typography } from 'antd';
import type { HistogramDataPoint, TimeRange } from '../SOCQueryEditor.types';

const { Text } = Typography;

export interface EventHistogramProps {
  data: HistogramDataPoint[];
  timeRange?: TimeRange;
  height?: number;
  onBarClick?: (data: HistogramDataPoint) => void;
}

const MS = { MIN: 60000, HOUR: 3600000, DAY: 86400000 };

function getBucketConfig(timeRange?: TimeRange) {
  const defaultConfig = { bucketMs: MS.HOUR, labelFormat: 'HH:mm', bucketLabel: '1 hour' };
  if (!timeRange) return defaultConfig;

  let totalMs = 0;

  if (timeRange.type === 'relative' && timeRange.relativeValue) {
    const num = parseInt(timeRange.relativeValue, 10);
    const unit = timeRange.relativeValue.replace(/[0-9]/g, '');
    totalMs = unit === 'm' ? num * MS.MIN : unit === 'h' ? num * MS.HOUR : unit === 'd' ? num * MS.DAY : MS.DAY;
  } else if (timeRange.type === 'absolute' && timeRange.absoluteStart && timeRange.absoluteEnd) {
    totalMs = new Date(timeRange.absoluteEnd).getTime() - new Date(timeRange.absoluteStart).getTime();
  }

  if (totalMs === 0) return defaultConfig;
  if (totalMs < MS.HOUR) return { bucketMs: MS.MIN, labelFormat: 'HH:mm', bucketLabel: '1 min' };
  if (totalMs < MS.DAY) return { bucketMs: MS.HOUR, labelFormat: 'HH:mm', bucketLabel: '1 hour' };
  return { bucketMs: MS.DAY, labelFormat: 'MM/DD', bucketLabel: '1 day' };
}

function formatTimestamp(ts: number, format: string): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return format
    .replace('YYYY', d.getFullYear().toString())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()));
}

const CustomTooltip = ({ active, payload, labelFormat }: { active?: boolean; payload?: Array<{ payload: HistogramDataPoint }>; labelFormat: string }) => {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'white', border: '1px solid #e8e8e8', borderRadius: 4, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ fontWeight: 500 }}>{data.label || formatTimestamp(data.timestamp, labelFormat)}</div>
      <div style={{ color: '#1890ff' }}>Events: <strong>{data.count.toLocaleString()}</strong></div>
    </div>
  );
};

export const EventHistogram = ({ data, timeRange, height = 150, onBarClick }: EventHistogramProps) => {
  const bucketConfig = useMemo(() => getBucketConfig(timeRange), [timeRange]);

  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data.map((p) => ({ ...p, label: p.label || formatTimestamp(p.timestamp, bucketConfig.labelFormat) }));
  }, [data, bucketConfig.labelFormat]);

  if (!data?.length) {
    return (
      <div className="soc-query-editor__histogram">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data to display" style={{ padding: '20px 0' }} />
      </div>
    );
  }

  const totalCount = data.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="soc-query-editor__histogram">
      <div className="soc-query-editor__histogram-header">
        <Text type="secondary" style={{ fontSize: 12 }}>
          Event Distribution ({bucketConfig.bucketLabel} buckets) &bull; <strong>{totalCount.toLocaleString()}</strong> total events
        </Text>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} onClick={(e) => {
          const event = e as unknown as { activePayload?: Array<{ payload: HistogramDataPoint }> };
          if (event?.activePayload?.[0] && onBarClick) onBarClick(event.activePayload[0].payload);
        }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8c8c8c' }} tickLine={false} axisLine={{ stroke: '#e8e8e8' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: '#8c8c8c' }} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()} />
          <Tooltip content={<CustomTooltip labelFormat={bucketConfig.labelFormat} />} cursor={{ fill: 'rgba(24, 144, 255, 0.1)' }} />
          <Bar dataKey="count" fill="#1890ff" radius={[2, 2, 0, 0]} cursor={onBarClick ? 'pointer' : 'default'} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
