import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, Switch, message } from 'antd';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import EditCatalogConfigModal from './EditCatalogConfigModal';

const errorText = (error) => error.response?.data?.message || error.message || 'Thao tác thất bại.';

export default function MauLinhKienModal({ open, editId, onClose, onCreated }) {
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configMode, setConfigMode] = useState(null);
  const [configSaving, setConfigSaving] = useState(false);
  const [editConfigOpen, setEditConfigOpen] = useState(false);
  const typeId = Form.useWatch('loaiLinhKienId', form);
  const selectedType = useMemo(() => types.find((t) => t.id === typeId), [types, typeId]);
  const attributes = useMemo(() => (selectedType?.thuocTinh || []).filter((t) => t.hoatDong), [selectedType]);

  const refreshTypes = useCallback(async () => {
    try {
      const result = await api.getLoaiLinhKienV3();
      setTypes(result.data || []);
    } catch (error) { message.error(errorText(error)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!open) return;
    let active = true;
    Promise.all([api.getLoaiLinhKienV3(), editId ? api.getMauLinhKienV3(editId) : Promise.resolve(null)])
      .then(([result, detail]) => {
        if (!active) return;
        setTypes(result.data || []);
        if (detail?.data) {
          const part = detail.data;
          form.setFieldsValue({
            loaiLinhKienId: part.loai?.loaiLinhKienId,
            tenLinhKien: part.tenLinhKien,
            hangSanXuat: part.hangSanXuat,
            maModel: part.maModel,
            donViTinh: part.donViTinh,
            donGiaBan: part.donGiaBan,
            thoiHanBaoHanhThang: part.thoiHanBaoHanhThang,
            theoDoiSerial: part.theoDoiSerial,
            thongSo: Object.fromEntries((part.thongSo || []).map((spec) => [spec.thuocTinhId,
              spec.giaTriVanBan ?? spec.giaTriSo ?? spec.giaTriDungSai ?? spec.luaChonId])),
          });
        }
      })
      .catch((error) => message.error(errorText(error)))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, editId, form]);

  const savePart = async (values) => {
    setSaving(true);
    try {
      const thongSo = attributes.flatMap((attr) => {
        const value = values.thongSo?.[attr.id];
        if (value === undefined || value === null || value === '') return [];
        const item = { thuocTinhId: attr.id };
        if (attr.kieuDuLieu === 'VAN_BAN') item.giaTriVanBan = String(value).trim();
        if (attr.kieuDuLieu === 'SO') item.giaTriSo = Number(value);
        if (attr.kieuDuLieu === 'DUNG_SAI') item.giaTriDungSai = value;
        if (attr.kieuDuLieu === 'LUA_CHON') item.luaChonId = value;
        return [item];
      });
      const payload = {
        loaiLinhKienId: values.loaiLinhKienId,
        tenLinhKien: values.tenLinhKien.trim(),
        hangSanXuat: values.hangSanXuat?.trim() || null,
        maModel: values.maModel?.trim() || null,
        donViTinh: values.donViTinh.trim(),
        donGiaBan: Number(values.donGiaBan),
        thoiHanBaoHanhThang: Number(values.thoiHanBaoHanhThang || 0),
        theoDoiSerial: Boolean(values.theoDoiSerial),
        thongSo,
      };
      const result = editId
        ? await api.capNhatMauLinhKienV3(editId, payload)
        : await api.taoMauLinhKienV3(payload);
      message.success(editId ? 'Đã cập nhật mẫu linh kiện.' : 'Đã tạo mẫu linh kiện. Bây giờ bạn có thể chọn mẫu này trong phiếu nhập.');
      form.resetFields();
      onCreated?.(result.data?.id, Boolean(editId));
      onClose();
    } catch (error) { message.error(errorText(error)); }
    finally { setSaving(false); }
  };

  const saveConfig = async (values) => {
    setConfigSaving(true);
    try {
      if (configMode === 'loai') {
        const result = await api.taoLoaiLinhKienV3({ ma: values.ma, ten: values.ten });
        form.setFieldValue('loaiLinhKienId', result.data?.id);
      }
      if (configMode === 'thuoc-tinh') {
        await api.taoThuocTinhLinhKienV3(values.loaiId, {
          ma: values.ma, ten: values.ten, kieuDuLieu: values.kieuDuLieu,
          donVi: values.donVi || null, batBuoc: Boolean(values.batBuoc), thuTu: Number(values.thuTu || 0),
        });
      }
      if (configMode === 'lua-chon') {
        await api.taoLuaChonLinhKienV3(values.thuocTinhId, {
          giaTri: values.giaTri, thuTu: Number(values.thuTu || 0),
        });
      }
      await refreshTypes();
      configForm.resetFields();
      setConfigMode(null);
      message.success('Đã cập nhật cấu hình loại linh kiện.');
    } catch (error) { message.error(errorText(error)); }
    finally { setConfigSaving(false); }
  };

  const configTypeId = Form.useWatch('loaiId', configForm);
  const configAttributes = types.find((t) => t.id === configTypeId)?.thuocTinh || [];

  return <>
    <Modal title={editId ? 'Sửa mẫu linh kiện' : 'Tạo mẫu linh kiện'} open={open} width={760}
      onCancel={() => { form.resetFields(); onClose(); }}
      onOk={() => form.submit()} okText="Lưu mẫu linh kiện" confirmLoading={saving} destroyOnHidden>
      <Alert type="info" showIcon style={{ marginBottom: 16 }}
        message="Tạo mẫu hàng một lần; mỗi lần nhập kho chỉ chọn mẫu, số lượng và serial nếu mẫu theo dõi serial." />
      {user?.role === 'admin' && <Space wrap style={{ marginBottom: 16 }}>
        <Button onClick={() => setConfigMode('loai')}>Thêm loại</Button>
        <Button onClick={() => { configForm.setFieldValue('loaiId', typeId); setConfigMode('thuoc-tinh'); }}>Thêm thuộc tính</Button>
        <Button onClick={() => { configForm.setFieldValue('loaiId', typeId); setConfigMode('lua-chon'); }}>Thêm lựa chọn</Button>
        <Button onClick={() => setEditConfigOpen(true)}>Sửa cấu hình loại</Button>
      </Space>}
      <Form form={form} layout="vertical" onFinish={savePart}
        initialValues={{ donViTinh: 'cái', thoiHanBaoHanhThang: 0, theoDoiSerial: false }}>
        <Row gutter={12}>
          <Col span={12}><Form.Item name="loaiLinhKienId" label="Loại linh kiện"
            rules={[{ required: true, message: 'Chọn loại linh kiện.' }]}>
            <Select loading={loading} placeholder="RAM, quạt, màn hình..." showSearch optionFilterProp="label"
              onChange={() => form.setFieldValue('thongSo', {})}
              options={types.filter((t) => t.hoatDong || (editId && t.id === typeId))
                .map((t) => ({ value: t.id, label: t.ten }))} />
          </Form.Item></Col>
          <Col span={12}><Form.Item name="tenLinhKien" label="Tên mẫu hàng"
            rules={[{ required: true, message: 'Nhập tên mẫu hàng.' }]}>
            <Input maxLength={150} placeholder="Ví dụ: Kingston DDR4 8GB 3200" />
          </Form.Item></Col>
          <Col span={12}><Form.Item name="hangSanXuat" label="Hãng sản xuất">
            <Input maxLength={100} placeholder="Kingston" />
          </Form.Item></Col>
          <Col span={12}><Form.Item name="maModel" label="Mã model / part number">
            <Input maxLength={100} />
          </Form.Item></Col>
        </Row>
        {attributes.length > 0 && <Divider orientation="left">Thông số theo loại</Divider>}
        <Row gutter={12}>
          {attributes.map((attr) => <Col span={12} key={attr.id}>
            <Form.Item name={['thongSo', attr.id]}
              label={`${attr.ten}${attr.donVi ? ` (${attr.donVi})` : ''}`}
              rules={[{ required: attr.batBuoc, message: `Chọn ${attr.ten}.` }]}>
              {attr.kieuDuLieu === 'LUA_CHON' ? <Select allowClear placeholder={`Chọn ${attr.ten}`}
                options={(attr.luaChon || []).filter((x) => x.hoatDong)
                  .map((x) => ({ value: x.id, label: x.giaTri }))} />
                : attr.kieuDuLieu === 'SO' ? <InputNumber style={{ width: '100%' }} />
                  : attr.kieuDuLieu === 'DUNG_SAI' ? <Select options={[
                    { value: true, label: 'Có' }, { value: false, label: 'Không' }]} />
                    : <Input maxLength={500} />}
            </Form.Item>
          </Col>)}
        </Row>
        <Divider />
        <Row gutter={12}>
          <Col span={8}><Form.Item name="donViTinh" label="Đơn vị tính" rules={[{ required: true }]}>
            <Input maxLength={20} /></Form.Item></Col>
          <Col span={8}><Form.Item name="donGiaBan" label="Giá bán" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="thoiHanBaoHanhThang" label="Bảo hành (tháng)">
            <InputNumber min={0} max={120} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Form.Item name="theoDoiSerial" label="Quản lý từng chiếc bằng serial" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>

    <EditCatalogConfigModal open={editConfigOpen} types={types} initialTypeId={typeId}
      onClose={() => setEditConfigOpen(false)} onSaved={refreshTypes} />

    <Modal title="Cấu hình loại linh kiện" open={Boolean(configMode)}
      onCancel={() => { setConfigMode(null); configForm.resetFields(); }}
      onOk={() => configForm.submit()} okText="Lưu" confirmLoading={configSaving} destroyOnHidden>
      <Form form={configForm} layout="vertical" onFinish={saveConfig}>
        {configMode !== 'loai' && <Form.Item name="loaiId" label="Loại linh kiện" rules={[{ required: true }]}>
          <Select options={types.map((t) => ({ value: t.id, label: t.ten }))} />
        </Form.Item>}
        {configMode === 'lua-chon' ? <>
          <Form.Item name="thuocTinhId" label="Thuộc tính lựa chọn" rules={[{ required: true }]}>
            <Select options={configAttributes.filter((t) => t.kieuDuLieu === 'LUA_CHON')
              .map((t) => ({ value: t.id, label: t.ten }))} />
          </Form.Item>
          <Form.Item name="giaTri" label="Giá trị mới" rules={[{ required: true }]}><Input maxLength={150} /></Form.Item>
        </> : <>
          <Form.Item name="ma" label="Mã" rules={[{ required: true }]}><Input maxLength={40} /></Form.Item>
          <Form.Item name="ten" label="Tên" rules={[{ required: true }]}><Input maxLength={100} /></Form.Item>
          {configMode === 'thuoc-tinh' && <>
            <Form.Item name="kieuDuLieu" label="Kiểu giá trị" rules={[{ required: true }]}>
              <Select options={[
                { value: 'LUA_CHON', label: 'Danh sách chọn' }, { value: 'VAN_BAN', label: 'Chữ' },
                { value: 'SO', label: 'Số' }, { value: 'DUNG_SAI', label: 'Có / Không' },
              ]} />
            </Form.Item>
            <Form.Item name="donVi" label="Đơn vị (nếu có)"><Input maxLength={30} /></Form.Item>
            <Form.Item name="batBuoc" label="Bắt buộc nhập" valuePropName="checked"><Switch /></Form.Item>
          </>}
        </>}
      </Form>
    </Modal>
  </>;
}
