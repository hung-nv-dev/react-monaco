import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Radio, DatePicker, Space } from 'antd';
import type { SavedQuery, TimeRange } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export interface SaveQueryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (query: SavedQuery) => void;
  currentQuery: string;
  editingQuery?: SavedQuery;
}

const RELATIVE_TIME_OPTIONS = [
  { value: '15m', label: 'Last 15 minutes' },
  { value: '30m', label: 'Last 30 minutes' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '4h', label: 'Last 4 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export const SaveQueryModal = ({ open, onClose, onSave, currentQuery, editingQuery }: SaveQueryModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [timeRangeType, setTimeRangeType] = useState<'relative' | 'absolute'>('relative');

  useEffect(() => {
    if (open) {
      if (editingQuery) {
        const tr = editingQuery.timeRange;
        form.setFieldsValue({
          name: editingQuery.name,
          description: editingQuery.description,
          tags: editingQuery.tags,
          relativeTime: tr?.type === 'relative' ? tr.relativeValue : '24h',
          absoluteTime: tr?.type === 'absolute' && tr.absoluteStart && tr.absoluteEnd
            ? [dayjs(tr.absoluteStart), dayjs(tr.absoluteEnd)]
            : undefined,
        });
        setTimeRangeType(tr?.type || 'relative');
      } else {
        form.resetFields();
        form.setFieldsValue({ relativeTime: '24h' });
        setTimeRangeType('relative');
      }
    }
  }, [open, editingQuery, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let timeRange: TimeRange | undefined;
      if (timeRangeType === 'relative' && values.relativeTime) {
        timeRange = { type: 'relative', relativeValue: values.relativeTime };
      } else if (timeRangeType === 'absolute' && values.absoluteTime) {
        timeRange = { type: 'absolute', absoluteStart: values.absoluteTime[0].toISOString(), absoluteEnd: values.absoluteTime[1].toISOString() };
      }

      const now = new Date().toISOString();
      onSave({
        id: editingQuery?.id || `query-${Date.now()}`,
        name: values.name,
        query: currentQuery,
        description: values.description,
        timeRange,
        tags: values.tags,
        createdAt: editingQuery?.createdAt || now,
        updatedAt: now,
      });
      message.success(editingQuery ? 'Query updated successfully' : 'Query saved successfully');
      onClose();
    } catch (error) {
      if (error instanceof Error) message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingQuery ? 'Edit Saved Query' : 'Save Query'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
      width={500}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Query Name" rules={[{ required: true, message: 'Please enter a query name' }]}>
          <Input placeholder="e.g., Web Attack Detection" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea placeholder="Describe what this query does..." rows={3} />
        </Form.Item>

        <Form.Item label="Default Time Range">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio.Group value={timeRangeType} onChange={(e) => setTimeRangeType(e.target.value)} optionType="button" buttonStyle="solid" size="small">
              <Radio.Button value="relative">Relative</Radio.Button>
              <Radio.Button value="absolute">Absolute</Radio.Button>
            </Radio.Group>
            {timeRangeType === 'relative' ? (
              <Form.Item name="relativeTime" noStyle>
                <Select placeholder="Select time range" options={RELATIVE_TIME_OPTIONS} style={{ width: '100%' }} />
              </Form.Item>
            ) : (
              <Form.Item name="absoluteTime" noStyle>
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} placeholder={['Start time', 'End time']} />
              </Form.Item>
            )}
          </Space>
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Select mode="tags" placeholder="Add tags (e.g., threat-hunting, malware)" tokenSeparators={[',']} />
        </Form.Item>

        <Form.Item label="Query Preview">
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, maxHeight: 120, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {currentQuery || '(empty query)'}
          </pre>
        </Form.Item>
      </Form>
    </Modal>
  );
};
