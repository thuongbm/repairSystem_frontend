import { Alert, Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Tag } from 'antd';
import { BarcodeOutlined, DeleteOutlined, ImportOutlined, PlusOutlined, SnippetsOutlined } from '@ant-design/icons';
import './ImportReceiptModal.css';

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value);
const lineAmount = (line) => {
  const quantity = Number(line?.soLuongNhap);
  const price = Number(line?.donGiaNhap);
  return Number.isInteger(quantity) && quantity > 0 && Number.isFinite(price) && price >= 0
    && line?.donGiaNhap !== undefined && line?.donGiaNhap !== null
    ? quantity * price : null;
};

export default function ImportReceiptModal({
  open,
  form,
  submitting,
  onCancel,
  onSubmit,
  onFinish,
  khoList,
  nccList,
  linhKienList,
  partPolicies,
  partPolicyLoadState,
  catalogLoadError,
  loadPartPolicy,
  onOpenPasteSerialModal,
  onReloadCatalogs,
}) {
  const lines = Form.useWatch('chiTiet', form) || [];
  const filledLines = lines.filter((line) => line?.linhKienId).length;
  const totalQuantity = lines.reduce((sum, line) => sum + (Number(line?.soLuongNhap) || 0), 0);
  const completeAmounts = lines.map(lineAmount).filter((amount) => amount !== null);
  const totalAmount = completeAmounts.reduce((sum, amount) => sum + amount, 0);
  const catalogUnavailable = !khoList.length || !nccList.length || !linhKienList.length;

  return (
    <Modal
      className="warehouse-import-modal"
      title={
        <div className="warehouse-import-title">
          <span className="warehouse-import-title-icon"><ImportOutlined /></span>
          <span>
            <strong>Lập phiếu nhập kho</strong>
            <small>Ghi nhận hàng thực nhận từ nhà cung cấp</small>
          </span>
        </div>
      }
      open={open}
      centered
      width={920}
      onCancel={onCancel}
      forceRender
      footer={
        <div className="warehouse-import-footer">
          <div className="warehouse-import-footer-summary">
            <span>{filledLines} mặt hàng · {totalQuantity} sản phẩm</span>
            <strong>{completeAmounts.length ? `${formatNumber(totalAmount)} đ` : 'Chưa có giá trị'}</strong>
          </div>
          <div className="warehouse-import-footer-actions">
            <Button onClick={onCancel} disabled={submitting}>Hủy</Button>
            <Button onClick={() => onSubmit(false)} loading={submitting}
              disabled={catalogUnavailable || !!catalogLoadError}>Lưu nháp</Button>
            <Button type="primary" onClick={() => onSubmit(true)} loading={submitting}
              disabled={catalogUnavailable || !!catalogLoadError}>
              Xác nhận nhập kho
            </Button>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
        {catalogLoadError && (
          <Alert type="error" showIcon className="warehouse-import-catalog-alert"
            message={catalogLoadError}
            description="Danh mục hiện có thể đã cũ. Hãy tải lại trước khi xác nhận phiếu."
            action={<Button size="small" onClick={onReloadCatalogs}>Tải lại</Button>} />
        )}
        {catalogUnavailable && (
          <Alert
            type="warning"
            showIcon
            className="warehouse-import-catalog-alert"
            message="Chưa đủ danh mục để lập phiếu nhập"
            description="Cần có ít nhất một kho, một nhà cung cấp và một mẫu linh kiện. Kiểm tra danh mục hoặc tải lại dữ liệu."
            action={<Button size="small" onClick={onReloadCatalogs}>Tải lại</Button>}
          />
        )}

        <section className="warehouse-import-section" aria-labelledby="import-document-heading">
          <div className="warehouse-import-section-heading">
            <div>
              <h3 id="import-document-heading">Thông tin chứng từ</h3>
              <p>Chọn nơi nhận hàng và đối chiếu với chứng từ của nhà cung cấp.</p>
            </div>
          </div>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label="Nhà cung cấp" name="nhaCungCapId"
                rules={[{ required: true, message: 'Chọn nhà cung cấp.' }]}>
                <Select showSearch optionFilterProp="label" placeholder="Chọn nhà cung cấp"
                  options={nccList.map((ncc) => ({ value: ncc.id, label: `${ncc.tenNcc} (${ncc.maNcc})` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Kho tiếp nhận" name="khoId"
                rules={[{ required: true, message: 'Chọn kho tiếp nhận.' }]}>
                <Select showSearch optionFilterProp="label" placeholder="Chọn kho tiếp nhận"
                  options={khoList.map((kho) => ({ value: kho.id, label: `${kho.tenKho} (${kho.maKho})` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày nhận hàng" name="ngayNhap"
                rules={[{ required: true, message: 'Chọn ngày nhận hàng.' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" allowClear={false} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Số hóa đơn / chứng từ NCC" name="soChungTuNcc">
                <Input maxLength={50} placeholder="Nhập số hóa đơn hoặc phiếu giao hàng" />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <section className="warehouse-import-section" aria-labelledby="import-lines-heading">
          <div className="warehouse-import-section-heading">
            <div>
              <h3 id="import-lines-heading">Hàng hóa thực nhận</h3>
              <p>Nhập số lượng thực tế và đơn giá vốn theo từng linh kiện.</p>
            </div>
            <span className="warehouse-import-count">{filledLines} mặt hàng</span>
          </div>

          <Form.List name="chiTiet">
            {(fields, { add, remove }) => (
              <div className="warehouse-import-lines">
                {fields.map(({ key, name, ...restField }) => {
                  const line = lines[name] || {};
                  const policy = partPolicies[line.linhKienId];
                  const serials = line.danhSachSerial || [];
                  const quantity = Number(line.soLuongNhap) || 0;
                  const amount = lineAmount(line);
                  return (
                    <div className="warehouse-import-line" key={key}>
                      <div className="warehouse-import-line-heading">
                        <div className="warehouse-import-line-label">
                          <span className="warehouse-import-line-index">{String(name + 1).padStart(2, '0')}</span>
                          <strong>Mặt hàng {name + 1}</strong>
                        </div>
                        <div className="warehouse-import-line-tools">
                          <span>Thành tiền: <strong>{amount === null ? '—' : `${formatNumber(amount)} đ`}</strong></span>
                          {fields.length > 1 && <Button type="text" danger icon={<DeleteOutlined />}
                            aria-label={`Xóa mặt hàng ${name + 1}`} title="Xóa dòng" onClick={() => remove(name)} />}
                        </div>
                      </div>
                      <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                          <Form.Item {...restField} label="Linh kiện" name={[name, 'linhKienId']}
                            rules={[{ required: true, message: 'Chọn linh kiện.' }]}>
                            <Select showSearch optionFilterProp="label" placeholder="Tìm theo mã hoặc tên linh kiện"
                              options={linhKienList.map((item) => ({ value: item.id, label: `${item.maLk} · ${item.tenLinhKien}` }))}
                              onChange={(id) => {
                                form.setFieldValue(['chiTiet', name, 'soLuongNhap'], undefined);
                                form.setFieldValue(['chiTiet', name, 'donGiaNhap'], undefined);
                                form.setFieldValue(['chiTiet', name, 'danhSachSerial'], []);
                                loadPartPolicy(id);
                              }} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={5}>
                          <Form.Item {...restField} label="Số lượng" name={[name, 'soLuongNhap']}
                            rules={[{ required: true, message: 'Nhập số lượng.' },
                              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0.' }]}>
                            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="Số thực nhận" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={7}>
                          <Form.Item {...restField} label="Đơn giá nhập (đ)" name={[name, 'donGiaNhap']}
                            rules={[{ required: true, message: 'Nhập đơn giá.' },
                              { type: 'number', min: 0, message: 'Đơn giá không được âm.' }]}>
                            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="Giá vốn"
                              formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                              parser={(value) => (value || '').replace(/\./g, '')} />
                          </Form.Item>
                        </Col>
                      </Row>

                      {line.linhKienId && policy === true && (
                        <div className="warehouse-import-serial">
                          <div className="warehouse-import-serial-heading">
                            <div><BarcodeOutlined /> <strong>Serial từng chiếc</strong> <Tag color="blue">Bắt buộc</Tag></div>
                            <Button type="link" size="small" icon={<SnippetsOutlined />}
                              onClick={() => onOpenPasteSerialModal(name)}>Dán danh sách serial</Button>
                          </div>
                          <Form.Item {...restField} name={[name, 'danhSachSerial']} style={{ marginBottom: 8 }}>
                            <Select mode="tags" tokenSeparators={[',', ';', '\n', '\t']} maxTagCount={3}
                              placeholder="Quét mã hoặc nhập serial rồi nhấn Enter" notFoundContent={null} />
                          </Form.Item>
                          <div className={`warehouse-import-serial-status ${quantity && serials.length === quantity ? 'is-complete' : ''}`} aria-live="polite">
                            {quantity
                              ? `${serials.length}/${quantity} serial ${serials.length === quantity ? 'đã khớp số lượng' : '— cần đối chiếu với số lượng thực nhận'}`
                              : 'Nhập số lượng thực nhận để đối chiếu serial.'}
                          </div>
                        </div>
                      )}
                      {line.linhKienId && policy === false && (
                        <div className="warehouse-import-policy-note">Linh kiện này quản lý theo số lượng, không cần nhập serial.</div>
                      )}
                      {line.linhKienId && policy === undefined && (
                        <div className="warehouse-import-policy-note">Đang kiểm tra yêu cầu serial của linh kiện...</div>
                      )}
                      {line.linhKienId && policy === null && (
                        <div className="warehouse-import-policy-note is-error">
                          {partPolicyLoadState[line.linhKienId] === 'loading'
                            ? 'Đang kiểm tra yêu cầu serial...'
                            : 'Không tải được yêu cầu serial.'}
                          <Button type="link" size="small" onClick={() => loadPartPolicy(line.linhKienId)}
                            loading={partPolicyLoadState[line.linhKienId] === 'loading'}>Thử lại</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <Button className="warehouse-import-add" icon={<PlusOutlined />}
                  onClick={() => add({ danhSachSerial: [] })} block>Thêm linh kiện</Button>
              </div>
            )}
          </Form.List>
        </section>

        <section className="warehouse-import-section warehouse-import-notes" aria-labelledby="import-note-heading">
          <div className="warehouse-import-section-heading">
            <div>
              <h3 id="import-note-heading">Ghi chú nội bộ</h3>
              <p>Thông tin bổ sung cho người đối chiếu phiếu nhập, nếu có.</p>
            </div>
          </div>
          <Form.Item name="ghiChu" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Tình trạng hàng, quy cách đóng gói, chênh lệch chứng từ..." />
          </Form.Item>
        </section>
        <div className="warehouse-import-action-note">
          <strong>Lưu nháp</strong> chưa cập nhật tồn kho. <strong>Xác nhận nhập kho</strong> sẽ cộng tồn ngay sau khi lưu phiếu.
        </div>
      </Form>
    </Modal>
  );
}
