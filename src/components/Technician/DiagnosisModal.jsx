import { useState } from 'react';
import { 
  Modal, 
  Tag, 
  Input, 
  Button, 
  Space, 
  Divider, 
  Row, 
  Col, 
  Card, 
  message,
  Alert
} from 'antd';
import { 
  CheckCircleOutlined, 
  ToolOutlined, 
  InfoCircleOutlined, 
  ThunderboltOutlined 
} from '@ant-design/icons';
import { DIAGNOSIS_PRESETS } from './mockData';

const { Text, Paragraph } = Input.TextArea ? { Text: (props) => <span {...props} />, Paragraph: (props) => <p {...props} /> } : {};

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
      message.warning('Vui lòng chọn ít nhất 1 lỗi chẩn đoán hoặc nhập ghi chú kỹ thuật!');
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
    <div style={{ maxHeight: 'calc(85vh - 120px)', overflowY: 'auto', paddingRight: '6px' }}>
      {/* So sánh 2 cột: Khách khai báo vs KTV chẩn đoán */}
      <Row gutter={[16, 16]} style={{ marginTop: '12px' }}>
        <Col xs={24} md={12}>
          <Card 
            size="small" 
            title={
              <Space>
                <InfoCircleOutlined style={{ color: '#fa8c16' }} />
                <span style={{ color: '#d46b08', fontWeight: 600 }}>1. Khai báo ban đầu của khách hàng</span>
              </Space>
            }
            style={{ background: '#fffbe6', borderColor: '#ffe58f', height: '100%' }}
          >
            <Paragraph style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: '#595959' }}>
              "{job.customerIssue}"
            </Paragraph>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#8c8c8c' }}>
              <div>Số Serial/IMEI: <Text style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '1px 4px' }}>{job.deviceSerial || 'Chưa cung cấp'}</Text></div>
              <div>Thời gian tiếp nhận: {job.receiveDate}</div>
              <div>Hẹn trả: <Tag color="red">{job.appointmentDate}</Tag></div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            size="small" 
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#1677ff' }} />
                <span style={{ color: '#0958d9', fontWeight: 600 }}>2. Kết luận chẩn đoán thực tế của thợ</span>
              </Space>
            }
            style={{ background: '#f0f5ff', borderColor: '#adc6ff', height: '100%' }}
          >
            {selectedTags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedTags.map((tag) => (
                  <Tag 
                    key={tag} 
                    color="blue" 
                    closable 
                    onClose={() => handleToggleTag(tag)}
                    style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#8c8c8c', fontStyle: 'italic' }}>
                Chưa chọn mã lỗi thực tế bên dưới. Tích chọn nhanh các ô bên dưới để ghi nhận.
              </span>
            )}
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '16px 0 12px 0' }}>
        <span style={{ fontWeight: 600, fontSize: '13px', color: '#595959' }}>
          MẪU GHI CHÚ TÍCH CHỌN NHANH THEO HẠNG MỤC PHẦN CỨNG
        </span>
      </Divider>

      {/* Các nhóm chẩn đoán tích chọn nhanh */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  style={{ padding: 0, fontSize: '11px' }}
                  onClick={() => handleApplyPresetGroup(group.items)}
                >
                  Chọn tất cả
                </Button>
              </div>
            }
            style={{ background: '#fafafa', borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {group.items.map((item) => {
                const isChecked = selectedTags.includes(item);
                return (
                  <Tag.CheckableTag
                    key={item}
                    checked={isChecked}
                    onChange={() => handleToggleTag(item)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '16px',
                      border: isChecked ? '1px solid #1677ff' : '1px dashed #d9d9d9',
                      background: isChecked ? '#e6f4ff' : '#ffffff',
                      color: isChecked ? '#0958d9' : '#595959',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isChecked ? '✓ ' : '+ '} {item}
                  </Tag.CheckableTag>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Đo đạc số liệu kỹ thuật & Ghi chú bổ sung */}
      <Divider style={{ margin: '16px 0 12px 0' }}>
        <span style={{ fontWeight: 600, fontSize: '13px', color: '#595959' }}>
          THÔNG SỐ ĐO ĐẠC & GHI CHÚ CHUYÊN SÂU
        </span>
      </Divider>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>
            Thông số điện áp & đo đạc đồng hồ (Oscilloscope / VOM):
          </div>
          <Input 
            placeholder="VD: Vin=19.5V, Ăn dòng standby 0.85A, Trở kháng cuộn cảm coil PL101 = 0.8Ω" 
            value={measurements} 
            onChange={(e) => setMeasurements(e.target.value)} 
            allowClear
          />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>
            Biện pháp can thiệp & Chi tiết xử lý:
          </div>
          <Input.TextArea 
            rows={3} 
            placeholder="Mô tả chi tiết giải pháp xử lý phần cứng: gỡ tụ, đóng lại chip BGA, vệ sinh tẩm sấy..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
          />
        </Col>
      </Row>

      <div style={{ marginTop: '16px' }}>
        <Alert 
          type="info" 
          showIcon 
          message="Minh bạch hóa can thiệp phần cứng" 
          description="Kết quả chẩn đoán này sẽ được lưu vào lịch sử bệnh án của máy, đồng thời gửi cho bộ phận lễ tân để tư vấn minh bạch cho khách hàng trước khi can thiệp linh kiện."
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
        <Button onClick={onCancel}>
          Đóng
        </Button>
        <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSave}>
          Lưu chẩn đoán & Đồng bộ hồ sơ máy
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
          <ToolOutlined style={{ color: '#1677ff', fontSize: '20px' }} />
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>
              Chẩn đoán lỗi thực tế phần cứng — Phiếu {job.code}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 'normal' }}>
              Thiết bị: {job.device} | Khách hàng: {job.customer} ({job.phone})
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={880}
      style={{ top: 20 }}
      footer={null}
      destroyOnClose
    >
      <DiagnosisContent 
        job={job} 
        onCancel={onCancel} 
        onSave={(key, diagnosis) => {
          onSave(key, diagnosis);
          message.success('Đã lưu kết quả chẩn đoán kỹ thuật thực tế thành công!');
        }} 
      />
    </Modal>
  );
};

export default DiagnosisModal;
