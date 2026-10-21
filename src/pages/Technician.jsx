import { useState } from 'react';
import { 
  Tabs, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Badge, 
  message 
} from 'antd';
import { 
  ToolOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  BarChartOutlined, 
  MobileOutlined
} from '@ant-design/icons';

import AssignedJobsTab from '../components/Technician/AssignedJobsTab';
import DiagnosisModal from '../components/Technician/DiagnosisModal';
import AdditionalProposalModal from '../components/Technician/AdditionalProposalModal';
import PartsRequisitionTab from '../components/Technician/PartsRequisitionTab';
import ProposalsTab from '../components/Technician/ProposalsTab';
import ProductivityTab from '../components/Technician/ProductivityTab';

import { 
  initialJobs, 
  initialRequisitions, 
  initialProposals, 
  TECHNICIAN_INFO 
} from '../components/Technician/mockData';

const { Title, Text } = Typography;

const Technician = () => {
  const [activeTab, setActiveTab] = useState('assigned_jobs');
  const [jobs, setJobs] = useState(initialJobs);
  const [requisitions, setRequisitions] = useState(initialRequisitions);
  const [proposals, setProposals] = useState(initialProposals);

  // Modal states
  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false);
  const [proposalModalVisible, setProposalModalVisible] = useState(false);
  const [activeJobForAction, setActiveJobForAction] = useState(null);

  // Stats calculations
  const totalAssigned = jobs.length;
  const inProgressCount = jobs.filter(j => ['Bắt đầu nhận máy', 'Đang kiểm tra', 'Đang sửa chữa'].includes(j.status)).length;
  const waitingCount = jobs.filter(j => ['Chờ linh kiện', 'Chờ duyệt phát sinh'].includes(j.status)).length;
  const completedTodayCount = jobs.filter(j => ['Hoàn thành', 'Đã trả máy'].includes(j.status)).length;
  const urgentCount = jobs.filter(j => j.priority === 'Khẩn cấp').length;

  // Handlers for job operations
  const handleUpdateJobStatus = (jobKey, newStatus) => {
    setJobs(prev =>
      prev.map(j => {
        if (j.key === jobKey) {
          return { ...j, status: newStatus };
        }
        return j;
      })
    );
  };

  const handleSaveDiagnosis = (jobKey, diagnosisData) => {
    setJobs(prev =>
      prev.map(j => {
        if (j.key === jobKey) {
          return {
            ...j,
            actualDiagnosis: diagnosisData,
            status: j.status === 'Bắt đầu nhận máy' ? 'Đang kiểm tra' : j.status,
          };
        }
        return j;
      })
    );
    setDiagnosisModalVisible(false);
  };

  const handleSubmitProposal = (jobKey, proposalData) => {
    setProposals(prev => [proposalData, ...prev]);

    // Update job's proposal list and status
    setJobs(prev =>
      prev.map(j => {
        if (j.key === jobKey) {
          const currentProposals = j.proposals || [];
          return {
            ...j,
            status: 'Chờ duyệt phát sinh',
            proposals: [
              ...currentProposals,
              {
                id: proposalData.proposalCode,
                title: proposalData.title,
                partCost: proposalData.partCost,
                laborCost: proposalData.laborCost,
                reason: proposalData.reason,
                status: 'Chờ duyệt',
                createdAt: proposalData.updatedAt,
              },
            ],
          };
        }
        return j;
      })
    );

    setProposalModalVisible(false);
  };

  const handleAddRequisition = (newRequisition) => {
    setRequisitions(prev => [newRequisition, ...prev]);

    // If attached to a job, reflect in job's spare parts & set status if needed
    setJobs(prev =>
      prev.map(j => {
        if (j.code === newRequisition.repairJobCode) {
          const parts = j.spareParts || [];
          return {
            ...j,
            status: 'Chờ linh kiện',
            spareParts: [
              ...parts,
              {
                id: newRequisition.requestCode,
                name: newRequisition.partName,
                code: newRequisition.partCode,
                qty: newRequisition.quantity,
                status: 'Chờ kho xuất',
              },
            ],
          };
        }
        return j;
      })
    );
  };

  // Open diagnosis modal for a job
  const handleOpenDiagnosis = (job) => {
    setActiveJobForAction(job);
    setDiagnosisModalVisible(true);
  };

  // Open proposal modal for a job
  const handleOpenProposal = (job) => {
    setActiveJobForAction(job);
    setProposalModalVisible(true);
  };

  // Open requisition tab with job targeted
  const handleOpenRequisitionFromJob = (job) => {
    setActiveJobForAction(job);
    setActiveTab('parts_requisition');
  };

  const handleOpenCreateProposalGeneric = () => {
    if (jobs.length > 0) {
      setActiveJobForAction(jobs[0]);
      setProposalModalVisible(true);
    } else {
      message.warning('Không có ca máy nào để tạo đề xuất.');
    }
  };

  const tabItems = [
    {
      key: 'assigned_jobs',
      label: (
        <span style={{ fontSize: '14px', fontWeight: 600 }}>
          <ToolOutlined /> Ca máy phân công{' '}
          <Badge count={inProgressCount} style={{ backgroundColor: '#1677ff', marginLeft: '4px' }} />
        </span>
      ),
      children: (
        <AssignedJobsTab
          jobs={jobs}
          onUpdateJobStatus={handleUpdateJobStatus}
          onOpenDiagnosis={handleOpenDiagnosis}
          onOpenProposal={handleOpenProposal}
          onOpenRequisition={handleOpenRequisitionFromJob}
        />
      ),
    },
    {
      key: 'parts_requisition',
      label: (
        <span style={{ fontSize: '14px', fontWeight: 600 }}>
          <ShoppingCartOutlined /> Tra cứu & Lĩnh vật tư{' '}
          <Badge count={requisitions.length} style={{ backgroundColor: '#52c41a', marginLeft: '4px' }} />
        </span>
      ),
      children: (
        <PartsRequisitionTab
          jobs={jobs}
          requisitions={requisitions}
          onAddRequisition={handleAddRequisition}
        />
      ),
    },
    {
      key: 'proposals',
      label: (
        <span style={{ fontSize: '14px', fontWeight: 600 }}>
          <DollarOutlined /> Đề xuất báo giá phát sinh{' '}
          <Badge 
            count={proposals.filter(p => p.status === 'Chờ duyệt khách').length} 
            style={{ backgroundColor: '#faad14', marginLeft: '4px' }} 
          />
        </span>
      ),
      children: (
        <ProposalsTab
          proposals={proposals}
          onOpenCreateProposal={handleOpenCreateProposalGeneric}
        />
      ),
    },
    {
      key: 'productivity',
      label: (
        <span style={{ fontSize: '14px', fontWeight: 600 }}>
          <BarChartOutlined /> Năng suất & Thu nhập KTV
        </span>
      ),
      children: <ProductivityTab />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner: Quick Summary & Touch Support Notification */}
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          background: '#ffffff'
        }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '10px', 
                background: '#e6f4ff', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                color: '#1677ff',
                fontSize: '22px'
              }}>
                <ToolOutlined />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1f2937' }}>
                  Bàn làm việc Kỹ thuật viên (KTV Workbench)
                </Title>
                <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>Thợ phụ trách: <Text strong style={{ color: '#1f2937' }}>{TECHNICIAN_INFO.name}</Text></span>
                  <span>•</span>
                  <span>Bàn B3 (Khu Bo mạch)</span>
                  <span>•</span>
                  <Tag color="cyan" icon={<MobileOutlined />} style={{ borderRadius: '10px', margin: 0 }}>
                    Tối ưu Mobile / Tablet / PC
                  </Tag>
                  {urgentCount > 0 && (
                    <Tag color="red" style={{ borderRadius: '10px', margin: 0, fontWeight: 'bold' }}>
                      ⚡ {urgentCount} ca khẩn cấp
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <Row gutter={12}>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Tổng ca nhận</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>{totalAssigned}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Đang xử lý</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1677ff' }}>{inProgressCount}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Chờ linh kiện/Duyệt</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>{waitingCount}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Đã hoàn tất</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>{completedTodayCount}</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={tabItems}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      />

      {/* Diagnosis Modal */}
      <DiagnosisModal
        visible={diagnosisModalVisible}
        job={activeJobForAction}
        onCancel={() => setDiagnosisModalVisible(false)}
        onSave={handleSaveDiagnosis}
      />

      {/* Additional Proposal Modal */}
      <AdditionalProposalModal
        visible={proposalModalVisible}
        job={activeJobForAction}
        onCancel={() => setProposalModalVisible(false)}
        onSubmitProposal={handleSubmitProposal}
      />
    </div>
  );
};

export default Technician;
