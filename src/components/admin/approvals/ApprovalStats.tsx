'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Space, Typography, Skeleton, Tag } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { api } from '@/src/lib/api';

interface ApprovalStats {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
  expiredToday: number;
  totalValuePending: number;
}

const { Title, Text } = Typography;

interface ApprovalStatsProps {
  onRefresh?: () => void;
}

const ApprovalStats: React.FC<ApprovalStatsProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ApprovalStats | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reservations/approval-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch approval stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <Card>
        <Row gutter={16}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Col span={5} key={i}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Col>
          ))}
        </Row>
      </Card>
    );
  }

  return (
    <Card>
      <Title level={5} className="mb-4">
        <Space>
          <ClockCircleOutlined />
          Thống kê phê duyệt
        </Space>
      </Title>
      <Row gutter={16}>
        <Col span={5}>
          <Statistic
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#faad14' }} />
                <span>Chờ duyệt</span>
              </Space>
            }
            value={stats.pending}
            valueStyle={{ color: '#faad14' }}
            suffix="đơn"
          />
        </Col>

        <Col span={5}>
          <Statistic
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Đã duyệt hôm nay</span>
              </Space>
            }
            value={stats.approvedToday}
            valueStyle={{ color: '#52c41a' }}
            suffix="đơn"
          />
        </Col>

        <Col span={5}>
          <Statistic
            title={
              <Space>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                <span>Từ chối hôm nay</span>
              </Space>
            }
            value={stats.rejectedToday}
            valueStyle={{ color: '#ff4d4f' }}
            suffix="đơn"
          />
        </Col>

        <Col span={5}>
          <Statistic
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: '#8c8c8c' }} />
                <span>Hết hạn hôm nay</span>
              </Space>
            }
            value={stats.expiredToday}
            valueStyle={{ color: '#8c8c8c' }}
            suffix="đơn"
          />
        </Col>

        <Col span={4}>
          <Statistic
            title={
              <Space>
                <DollarOutlined style={{ color: '#1890ff' }} />
                <span>Giá trị chờ duyệt</span>
              </Space>
            }
            value={stats.totalValuePending / 1000000}
            precision={1}
            valueStyle={{ color: '#1890ff' }}
            prefix="~"
            suffix="M"
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {stats.totalValuePending.toLocaleString('vi-VN')} VNĐ
          </Text>
        </Col>
      </Row>

      {stats.pending > 0 && stats.totalValuePending > 5000000 && (
        <div className="mt-4">
          <Tag color="orange" icon={<ExclamationCircleOutlined />}>
            Có {stats.pending} đơn hàng lớn đang chờ xử lý
          </Tag>
        </div>
      )}
    </Card>
  );
};

export default ApprovalStats;
