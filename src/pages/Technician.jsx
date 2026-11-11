import { useState } from 'react';
import { 
  Tabs, 
  Card, 
  Row, 
  Col, 
  Tag, 
  Badge 
} from 'antd';
import { 
  ToolOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  BarChartOutlined 
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

  const handleOpenDiagnosis = (job) => {
    setActiveJobForAction(job);
    setDiagnosisModalVisible(true);
  };

  const handleOpenProposal = (job) => {
    setActiveJobForAction(job);
    setProposalModalVisible(true);
  };

  const handleOpenRequisitionFromJob = (job) => {
    setActiveJobForAction(job);
    setActiveTab('parts_requisition');
  };

  const handleOpenCreateProposalGeneric = () => {
    if (jobs.length > 0) {
      setActiveJobForAction(jobs[0]);
      setProposalModalVisible(true);
    }
  };

  const tabItems = [
    {
      key: 'assigned_jobs',
      label: (
        <span style={{ fontSize: '13px', fontWeight: 500 }}>
          <ToolOutlined /> Ca máy phân công{' '}
          <Badge count={inProgressCount} style={{ backgroundColor: '#2563eb', marginLeft: '6px' }} />
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
        <span style={{ fontSize: '13px', fontWeight: 500 }}>
          <ShoppingCartOutlined /> Tra cứu & Lĩnh vật tư{' '}
          <Badge count={requisitions.length} style={{ backgroundColor: '#059669', marginLeft: '6px' }} />
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
        <span style={{ fontSize: '13px', fontWeight: 500 }}>
          <DollarOutlined /> Đề xuất phát sinh{' '}
          <Badge 
            count={proposals.filter(p => p.status === 'Chờ duyệt khách').length} 
            style={{ backgroundColor: '#d97706', marginLeft: '6px' }} 
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
        <span style={{ fontSize: '13px', fontWeight: 500 }}>
          <BarChartOutlined /> Năng suất & Thu nhập
        </span>
      ),
      children: <ProductivityTab />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Workspace Header */}
      <Card bodyStyle={{ padding: '14px 18px' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={10}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '6px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  fontSize: '18px'
                }}
              >
                <ToolOutlined />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                  {TECHNICIAN_INFO.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{TECHNICIAN_INFO.role}</span>
                  <span>•</span>
                  <span>{TECHNICIAN_INFO.workstation}</span>
                  {urgentCount > 0 && (
                    <Tag color="error" style={{ margin: 0, fontWeight: 600 }}>
                      {urgentCount} khẩn cấp
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={14}>
            <Row gutter={12}>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Tổng ca</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{totalAssigned}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Đang xử lý</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>{inProgressCount}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Chờ linh kiện/Duyệt</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>{waitingCount}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Hoàn thành</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>{completedTodayCount}</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
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
