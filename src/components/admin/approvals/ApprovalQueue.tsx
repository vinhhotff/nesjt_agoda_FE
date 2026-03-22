'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  message,
  Popconfirm,
  Typography,
  Empty,
  Descriptions,
  Divider,
  Alert,
  Tooltip,
  Badge,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { api } from '@/src/lib/api';

interface Reservation {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  status: 'pending' | 'pending_approval' | 'confirmed' | 'completed' | 'cancelled';
  tableNumber?: string;
  table?: { _id: string; tableName: string; location?: string };
  bookingType: 'TABLE_ONLY' | 'FULL_BOOKING';
  items?: Array<{
    _id?: string;
    item?: string | { _id: string; name: string; price: number; category: string };
    menuItemName?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    note?: string;
  }>;
  totalAmount: number;
  depositAmount: number;
  depositPaid: number;
  isDepositPaid: boolean;
  usageDate?: string;
  requiresApproval?: boolean;
  requiresDeposit?: boolean;
  approvalStatus?: 'not_applicable' | 'pending' | 'approved' | 'rejected' | 'expired';
  approvalRequestedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  approvalNotes?: { adminNotes?: string; kitchenNotes?: string };
  approvalExpiresAt?: string;
  createdAt: string;
}

const reservationApi = {
  getPendingApprovals: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/reservations/pending-approvals', { params });
    return response.data;
  },
  approveReservation: async (id: string, data?: { adminNotes?: string; kitchenNotes?: string }) => {
    const response = await api.post(`/reservations/${id}/approve`, data || {});
    return response.data;
  },
  rejectReservation: async (id: string, reason: string) => {
    const response = await api.post(`/reservations/${id}/reject`, { reason });
    return response.data;
  },
};

const { Text, Title, Paragraph } = Typography;

interface ApprovalDetailModalProps {
  visible: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  loading?: boolean;
}

const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  visible,
  reservation,
  onClose,
  onApprove,
  onReject,
  loading = false,
}) => {
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    if (!reservation) return;
    await onApprove(reservation._id, notes);
    setActionType(null);
    setNotes('');
    onClose();
  };

  const handleReject = async () => {
    if (!reservation) return;
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }
    await onReject(reservation._id, rejectReason);
    setActionType(null);
    setRejectReason('');
    onClose();
  };

  if (!reservation) return null;

  const isExpiringSoon = reservation.approvalExpiresAt &&
    new Date(reservation.approvalExpiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={700}
      footer={null}
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>Chi tiết yêu cầu phê duyệt</span>
        </Space>
      }
    >
      {isExpiringSoon && (
        <Alert
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          message="Sắp hết hạn"
          description={`Yêu cầu này sẽ tự động hủy sau ${format(
            new Date(reservation.approvalExpiresAt!),
            'HH:mm dd/MM/yyyy',
            { locale: vi }
          )}`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Khách hàng" span={2}>
          <Text strong>{reservation.customerName}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {reservation.customerPhone}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {reservation.customerEmail || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {format(new Date(reservation.reservationDate), 'dd/MM/yyyy', { locale: vi })}
        </Descriptions.Item>
        <Descriptions.Item label="Giờ đặt">
          {reservation.reservationTime}
        </Descriptions.Item>
        <Descriptions.Item label="Số khách">
          {reservation.numberOfGuests} người
        </Descriptions.Item>
        <Descriptions.Item label="Bàn">
          {reservation.table?.tableName || 'Chưa chọn'}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sử dụng" span={2}>
          {reservation.usageDate
            ? format(new Date(reservation.usageDate), 'dd/MM/yyyy', { locale: vi })
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng giá trị" span={2}>
          <Text strong type="success">
            {reservation.totalAmount.toLocaleString('vi-VN')} VNĐ
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Đặt cọc">
          {reservation.depositAmount.toLocaleString('vi-VN')} VNĘ
        </Descriptions.Item>
        <Descriptions.Item label="Yêu cầu đặt cọc">
          {reservation.requiresDeposit ? 'Có' : 'Không'}
        </Descriptions.Item>
      </Descriptions>

      {reservation.items && reservation.items.length > 0 && (
        <>
          <Divider orientation="left">Danh sách món ăn</Divider>
          <Descriptions column={1} size="small">
            {reservation.items.map((item, index) => (
              <Descriptions.Item key={index} label={item.menuItemName || `Món ${index + 1}`}>
                <Space>
                  <Tag color="blue">{item.quantity} x</Tag>
                  <Text>
                    {item.unitPrice.toLocaleString('vi-VN')} VNĐ
                  </Text>
                  <Text type="secondary">
                    = {item.subtotal.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </Space>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </>
      )}

      {reservation.specialRequests && (
        <>
          <Divider orientation="left">Yêu cầu đặc biệt</Divider>
          <Paragraph type="secondary">{reservation.specialRequests}</Paragraph>
        </>
      )}

      <Divider />

      {actionType === null ? (
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Popconfirm
            title="Từ chối đơn hàng?"
            description="Khách hàng sẽ được thông báo về lý do từ chối."
            onConfirm={() => setActionType('reject')}
            okText="Tiếp tục"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<CloseOutlined />}>
              Từ chối
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => setActionType('approve')}
          >
            Phê duyệt
          </Button>
        </Space>
      ) : actionType === 'approve' ? (
        <Card size="small" title="Phê duyệt đơn hàng">
          <Paragraph type="secondary">
            Sau khi phê duyệt, khách hàng sẽ nhận được thông báo và có thể đặt cọc để xác nhận.
          </Paragraph>
          <textarea
            className="w-full border rounded p-2 min-h-[80px]"
            placeholder="Ghi chú (tùy chọn)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => setActionType(null)}>Hủy</Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApprove}
              loading={loading}
            >
              Xác nhận phê duyệt
            </Button>
          </Space>
        </Card>
      ) : (
        <Card size="small" title="Từ chối đơn hàng" className="border-red-200">
          <Paragraph type="secondary">
            Vui lòng cung cấp lý do từ chối. Khách hàng sẽ nhận được thông báo.
          </Paragraph>
          <textarea
            className="w-full border rounded p-2 min-h-[80px] border-red-300"
            placeholder="Lý do từ chối (bắt buộc)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => setActionType(null)}>Hủy</Button>
            <Button
              danger
              type="primary"
              icon={<CloseOutlined />}
              onClick={handleReject}
              loading={loading}
            >
              Xác nhận từ chối
            </Button>
          </Space>
        </Card>
      )}
    </Modal>
  );
};

interface ApprovalQueueProps {
  onRefresh?: () => void;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<{ pending: number; expiringSoon: number }>({
    pending: 0,
    expiringSoon: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingApprovals = async (page = 1) => {
    setLoading(true);
    try {
      const response = await reservationApi.getPendingApprovals({
        page,
        limit: pagination.pageSize,
      });
      setReservations(response.reservations);
      setStats(response.stats);
      setPagination((prev) => ({
        ...prev,
        page,
        total: response.total,
      }));
    } catch (error) {
      message.error('Không thể tải danh sách phê duyệt');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = async (id: string, notes?: string) => {
    setActionLoading(true);
    try {
      await reservationApi.approveReservation(id, { adminNotes: notes });
      message.success('Đã phê duyệt đơn hàng');
      fetchPendingApprovals(pagination.page);
      onRefresh?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể phê duyệt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setActionLoading(true);
    try {
      await reservationApi.rejectReservation(id, reason);
      message.success('Đã từ chối đơn hàng');
      fetchPendingApprovals(pagination.page);
      onRefresh?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể từ chối');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<Reservation> = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.customerName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.customerPhone}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Ngày sử dụng',
      key: 'usageDate',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            {record.usageDate
              ? format(new Date(record.usageDate), 'dd/MM/yyyy', { locale: vi })
              : '-'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.reservationTime}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Số khách',
      dataIndex: 'numberOfGuests',
      width: 100,
      align: 'center',
    },
    {
      title: 'Tổng giá trị',
      key: 'totalAmount',
      align: 'right',
      render: (_, record) => (
        <Text strong type="success">
          {record.totalAmount.toLocaleString('vi-VN')} VNĐ
        </Text>
      ),
    },
    {
      title: 'Đặt cọc',
      key: 'deposit',
      align: 'right',
      render: (_, record) => (
        <Text>
          {record.depositAmount.toLocaleString('vi-VN')} VNĐ
        </Text>
      ),
    },
    {
      title: 'Số món',
      key: 'itemCount',
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">
          {record.items?.length || 0} món
        </Tag>
      ),
    },
    {
      title: 'Hết hạn',
      key: 'expiresAt',
      align: 'center',
      render: (_, record) => {
        if (!record.approvalExpiresAt) return <Text type="secondary">-</Text>;
        const expiresAt = new Date(record.approvalExpiresAt);
        const now = Date.now();
        const hoursLeft = Math.max(0, (expiresAt.getTime() - now) / (1000 * 60 * 60));
        const isExpiring = hoursLeft < 24;

        return (
          <Tooltip title={`Hết hạn: ${format(expiresAt, 'HH:mm dd/MM/yyyy', { locale: vi })}`}>
            <Badge
              status={isExpiring ? 'error' : 'default'}
              text={
                <Text type={isExpiring ? 'danger' : 'secondary'}>
                  {hoursLeft > 0 ? `${Math.round(hoursLeft)}h` : 'Đã hết hạn'}
                </Text>
              }
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openDetail(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Phê duyệt đơn hàng này?"
            onConfirm={() => handleApprove(record._id)}
            okText="Phê duyệt"
            cancelText="Hủy"
          >
            <Tooltip title="Phê duyệt">
              <Button type="text" icon={<CheckOutlined />} className="text-green-600" />
            </Tooltip>
          </Popconfirm>
          <Popconfirm
            title="Từ chối đơn hàng này?"
            description="Vui lòng cung cấp lý do."
            onConfirm={() => {
              Modal.confirm({
                title: 'Lý do từ chối',
                content: (
                  <div>
                    <textarea
                      id="reject-reason"
                      style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 4, padding: 8, marginTop: 8 }}
                      placeholder="Nhập lý do từ chối..."
                      rows={3}
                    />
                  </div>
                ),
                onOk: async () => {
                  const reasonInput = document.getElementById('reject-reason') as HTMLTextAreaElement;
                  const reason = reasonInput?.value;
                  if (!reason?.trim()) {
                    message.error('Vui lòng nhập lý do từ chối');
                    return Promise.reject();
                  }
                  await handleReject(record._id, reason);
                },
              });
            }}
          >
            <Tooltip title="Từ chối">
              <Button type="text" icon={<CloseOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="approval-queue">
      <div className="flex items-center justify-between mb-4">
        <Title level={4} className="m-0">
          <Space>
            <WarningOutlined style={{ color: '#faad14' }} />
            Đơn hàng chờ phê duyệt
            {stats.pending > 0 && (
              <Tag color="orange">{stats.pending}</Tag>
            )}
          </Space>
        </Title>
        <Button onClick={() => fetchPendingApprovals(pagination.page)} loading={loading}>
          Làm mới
        </Button>
      </div>

      {stats.expiringSoon > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          message={`Có ${stats.expiringSoon} yêu cầu sắp hết hạn trong 24 giờ tới`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={columns}
        dataSource={reservations}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} yêu cầu`,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({ ...prev, pageSize }));
            fetchPendingApprovals(page);
          },
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có yêu cầu phê duyệt nào"
            />
          ),
        }}
      />

      <ApprovalDetailModal
        visible={detailModalVisible}
        reservation={selectedReservation}
        onClose={() => setDetailModalVisible(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />
    </div>
  );
};

export default ApprovalQueue;
