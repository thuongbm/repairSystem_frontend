import { useState } from 'react';
import { 
  Modal, 
  Tag, 
  Input, 
  Button, 
  Row, 
  Col, 
  Card, 
  message 
} from 'antd';
import { 
  CheckCircleOutlined, 
  ToolOutlined 
} from '@ant-design/icons';
import { DIAGNOSIS_PRESETS } from './mockData';

const { Text } = Input.TextArea ? { Text: (props) => <span {...props} /> } : {};

const DiagnosisContent = ({ job, onCancel, onSave }) => {
  const [selectedTags, setSelectedTags] = useState(job?.actualDiagnosis?.tags || []);
  const [notes, setNotes] = useState(job?.actualDiagnosis?.notes || '');
  const [measurements, setMeasurements] = useState(job?.actualDiagnosis?.measurements || '');

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleApplyPresetGroup = (items) => {
    const newTags = Array.from(new Set([...selectedTags, ...items]));
    setSelectedTags(newTags);
  };

  const handleSave = () => {
    if (selectedTags.length === 0 && !notes.trim()) {
      message.warning('Vui lòng chọn mã lỗi hoặc nhập ghi chú kỹ thuật.');
      return;
    }

    const updatedDiagnosis = {
      tags: selectedTags,
      notes: notes.trim(),
      measurements: measurements.trim(),
      diagnosedAt: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onSave(job.key, updatedDiagnosis);
  };

  return (
    <div style={{ maxHeight: 'calc(85vh - 120px)', overflowY: 'auto', paddingRight: '4px' }}>
      {/* 2-column comparison */}
      <Row gutter={[12, 12]} style={{ marginTop: '8px' }}>
        <Col xs={24} md={12}>
          <Card 
            size="small" 
            title={<span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Khai báo ban đầu từ khách</span>}
            style={{ background: '#f8fafc', height: '100%' }}
          >
            <div style={{ fontSize: '13px', color: '#1e293b' }}>
              "{job.customerIssue}"
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
              <div>Serial: <Text style={{ fontFamily: 'monospace' }}>{job.deviceSerial || '—'}</Text></div>
              <div>Hẹn trả: <span style={{ fontWeight: 600, color: '#0f172a' }}>{job.appointmentDate}</span></div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            size="small" 
            title={<span style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>Mã lỗi thực tế xác nhận</span>}
            style={{ background: '#eff6ff', height: '100%', borderColor: '#dbeafe' }}
          >
            {selectedTags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {selectedTags.map((tag) => (
                  <Tag 
                    key={tag} 
                    color="blue" 
                    closable 
                    onClose={() => handleToggleTag(tag)}
                    style={{ fontSize: '12px' }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Chưa chọn mã lỗi (tích chọn danh mục bên dưới)
              </span>
            )}
          </Card>
        </Col>
      </Row>

      {/* Preset groups */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Danh mục mã lỗi phần cứng
        </span>
        {DIAGNOSIS_PRESETS.map((group) => (
          <Card 
            key={group.category} 
            size="small" 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{group.category}</span>
                <Button 
                  type="link" 
                  size="small" 
                  style={{ padding: 0, fontSize: '12px' }}
                  onClick={() => handleApplyPresetGroup(group.items)}
                >
                  Chọn tất cả
                </Button>
              </div>
            }
            bodyStyle={{ padding: '10px 14px' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {group.items.map((item) => {
                const isChecked = selectedTags.includes(item);
                return (
                  <Tag.CheckableTag
                    key={item}
                    checked={isChecked}
                    onChange={() => handleToggleTag(item)}
                    style={{
                      padding: '3px 10px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: isChecked ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      background: isChecked ? '#eff6ff' : '#ffffff',
                      color: isChecked ? '#1d4ed8' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    {item}
                  </Tag.CheckableTag>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Measurements and notes */}
      <Row gutter={[12, 12]} style={{ marginTop: '16px' }}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '4px', fontWeight: 500, fontSize: '12px', color: '#475569' }}>
            Thông số đo đạc điện áp / VOM:
          </div>
          <Input 
            placeholder="VD: Vin=19.5V, Standby 0.85A, Coil PL101 = 0.8Ω" 
            value={measurements} 
            onChange={(e) => setMeasurements(e.target.value)} 
            allowClear
          />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '4px', fontWeight: 500, fontSize: '12px', color: '#475569' }}>
            Chi tiết biện pháp xử lý:
          </div>
          <Input.TextArea 
            rows={2} 
            placeholder="Ghi chú chi tiết can thiệp..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
          />
        </Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
        <Button onClick={onCancel}>
          Đóng
        </Button>
        <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSave}>
          Lưu chẩn đoán
        </Button>
      </div>
    </div>
  );
};

const DiagnosisModal = ({ visible, job, onCancel, onSave }) => {
  if (!job) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ToolOutlined style={{ color: '#2563eb', fontSize: '18px' }} />
          <span>Chẩn đoán phần cứng — {job.code} ({job.device})</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      style={{ top: 24 }}
      footer={null}
      destroyOnClose
    >
      <DiagnosisContent 
        job={job} 
        onCancel={onCancel} 
        onSave={(key, diagnosis) => {
          onSave(key, diagnosis);
          message.success('Đã lưu kết quả chẩn đoán.');
        }} 
      />
    </Modal>
  );
};

export default DiagnosisModal;
