import { Tag } from 'antd';
import { statusColor, statusLabel } from '../utils/status';

export default function StatusTag({ value }) {
  return <Tag color={statusColor(value)}>{statusLabel(value)}</Tag>;
}
