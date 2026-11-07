import { useEffect, useMemo, useState } from 'react';
import { Alert, Form, Input, InputNumber, Modal, Select, Space, Switch, message } from 'antd';
import { api } from '../../services/api';

const errorText = (error) => error.response?.data?.message || error.message || 'Không lưu được cấu hình.';

export default function EditCatalogConfigModal({ open, types, initialTypeId, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [level, setLevel] = useState('type');
  const [typeId, setTypeId] = useState(null);
  const [attributeId, setAttributeId] = useState(null);
  const [choiceId, setChoiceId] = useState(null);
  const [saving, setSaving] = useState(false);
  const type = useMemo(() => types.find((item) => item.id === typeId), [types, typeId]);
  const attributes = type?.thuocTinh || [];
  const attribute = attributes.find((item) => item.id === attributeId);
  const choice = attribute?.luaChon?.find((item) => item.id === choiceId);
  const selected = level === 'type' ? type : level === 'attribute' ? attribute : choice;

  useEffect(() => {
    if (!open) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setTypeId(initialTypeId || types[0]?.id || null);
      setAttributeId(null);
      setChoiceId(null);
    });
    return () => { active = false; };
  }, [open, initialTypeId, types]);

  useEffect(() => {
    form.resetFields();
    if (!selected) return;
    form.setFieldsValue(level === 'type'
      ? { ma: selected.ma, ten: selected.ten, hoatDong: selected.hoatDong }
      : level === 'attribute'
        ? { ma: selected.ma, ten: selected.ten, kieuDuLieu: selected.kieuDuLieu,
          donVi: selected.donVi, batBuoc: selected.batBuoc, thuTu: selected.thuTu,
          hoatDong: selected.hoatDong }
        : { giaTri: selected.giaTri, thuTu: selected.thuTu, hoatDong: selected.hoatDong });
  }, [form, level, selected]);

  const save = async (values) => {
    if (!selected) return;
    setSaving(true);
    try {
      if (level === 'type') await api.capNhatLoaiLinhKienV3(typeId, values);
      if (level === 'attribute') await api.capNhatThuocTinhLinhKienV3(attributeId, values);
      if (level === 'choice') await api.capNhatLuaChonLinhKienV3(choiceId, values);
      await onSaved?.();
      message.success('Đã cập nhật cấu hình loại linh kiện.');
      onClose();
    } catch (error) { message.error(errorText(error)); }
    finally { setSaving(false); }
  };

  return <Modal title="Sửa cấu hình loại linh kiện" open={open} width={600}
    onCancel={onClose} onOk={() => form.submit()} okText="Lưu thay đổi"
    okButtonProps={{ disabled: !selected }} confirmLoading={saving}>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert type="info" showIcon message="Các giá trị đã sử dụng có giới hạn khi thay đổi"
        description="Hệ thống sẽ chặn đổi kiểu thuộc tính đang dùng và chặn biến thuộc tính thành bắt buộc nếu mẫu cũ chưa có giá trị." />
      <Select value={level} style={{ width: '100%' }} onChange={(value) => {
        setLevel(value); setAttributeId(null); setChoiceId(null);
      }} options={[
        { value: 'type', label: 'Loại linh kiện' },
        { value: 'attribute', label: 'Thuộc tính' },
        { value: 'choice', label: 'Lựa chọn của thuộc tính' },
      ]} />
      <Select value={typeId} style={{ width: '100%' }} placeholder="Chọn loại"
        onChange={(value) => { setTypeId(value); setAttributeId(null); setChoiceId(null); }}
        options={types.map((item) => ({ value: item.id, label: `${item.ma} — ${item.ten}` }))} />
      {level !== 'type' && <Select value={attributeId} style={{ width: '100%' }}
        placeholder="Chọn thuộc tính" onChange={(value) => { setAttributeId(value); setChoiceId(null); }}
        options={attributes.filter((item) => level !== 'choice' || item.kieuDuLieu === 'LUA_CHON')
          .map((item) => ({ value: item.id, label: `${item.ma} — ${item.ten}` }))} />}
      {level === 'choice' && <Select value={choiceId} style={{ width: '100%' }}
        placeholder="Chọn lựa chọn" onChange={setChoiceId}
        options={(attribute?.luaChon || []).map((item) => ({ value: item.id, label: item.giaTri }))} />}
      {selected && <Form form={form} layout="vertical" onFinish={save}>
        {level !== 'choice' && <>
          <Form.Item name="ma" label="Mã" rules={[{ required: true }]}><Input maxLength={40} /></Form.Item>
          <Form.Item name="ten" label="Tên" rules={[{ required: true }]}><Input maxLength={100} /></Form.Item>
        </>}
        {level === 'attribute' && <>
          <Form.Item name="kieuDuLieu" label="Kiểu dữ liệu" rules={[{ required: true }]}>
            <Select options={[
              { value: 'VAN_BAN', label: 'Chữ' }, { value: 'SO', label: 'Số' },
              { value: 'LUA_CHON', label: 'Danh sách chọn' }, { value: 'DUNG_SAI', label: 'Có / Không' },
            ]} />
          </Form.Item>
          <Form.Item name="donVi" label="Đơn vị"><Input maxLength={30} /></Form.Item>
          <Form.Item name="batBuoc" label="Bắt buộc" valuePropName="checked"><Switch /></Form.Item>
        </>}
        {level === 'choice' && <Form.Item name="giaTri" label="Giá trị" rules={[{ required: true }]}>
          <Input maxLength={150} />
        </Form.Item>}
        {level !== 'type' && <Form.Item name="thuTu" label="Thứ tự"><InputNumber style={{ width: '100%' }} /></Form.Item>}
        <Form.Item name="hoatDong" label="Đang dùng" valuePropName="checked"><Switch /></Form.Item>
      </Form>}
    </Space>
  </Modal>;
}
