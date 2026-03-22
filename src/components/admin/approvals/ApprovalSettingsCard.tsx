'use client';

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Form, InputNumber, Typography, message, Skeleton } from 'antd';
import { SettingOutlined, EditOutlined } from '@ant-design/icons';
import { api } from '@/src/lib/api';

const { Text } = Typography;

interface ApprovalSettings {
  minItemsThreshold: number;
  minValueThreshold: number;
  autoExpireHours: number;
}

interface ApprovalSettingsCardProps {
  onRefresh?: () => void;
}

const ApprovalSettingsCard: React.FC<ApprovalSettingsCardProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ApprovalSettings | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    minItemsThreshold: 20,
    minValueThreshold: 5000000,
    autoExpireHours: 48,
  });
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reservations/approval-settings');
      const data = response.data;
      setSettings(data);
      setFormData({
        minItemsThreshold: data.minItemsThreshold,
        minValueThreshold: data.minValueThreshold,
        autoExpireHours: data.autoExpireHours,
      });
    } catch (error) {
      console.error('Failed to fetch approval settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/reservations/approval-settings', formData);
      message.success('Cập nhật cấu hình thành công');
      setEditing(false);
      fetchSettings();
      onRefresh?.();
    } catch (error) {
      message.error('Không thể cập nhật cấu hình');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading || !settings) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          Cấu hình phê duyệt
        </Space>
      }
      extra={
        !editing && (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
          >
            Chỉnh sửa
          </Button>
        )
      }
    >
      {editing ? (
        <Form layout="vertical">
          <Form.Item label="Ngưỡng số lượng món">
            <InputNumber
              min={1}
              value={formData.minItemsThreshold}
              onChange={(value) => setFormData({ ...formData, minItemsThreshold: value || 1 })}
              suffix="món"
              style={{ width: '100%' }}
            />
            <Text type="secondary" className="text-xs">
              Đơn hàng có tổng số lượng món vượt ngưỡng này sẽ cần phê duyệt
            </Text>
          </Form.Item>

          <Form.Item label="Ngưỡng giá trị">
            <InputNumber
              min={0}
              value={formData.minValueThreshold}
              onChange={(value) => setFormData({ ...formData, minValueThreshold: value || 0 })}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              suffix="VNĐ"
              style={{ width: '100%' }}
            />
            <Text type="secondary" className="text-xs">
              Đơn hàng có tổng giá trị vượt ngưỡng này sẽ cần phê duyệt
            </Text>
          </Form.Item>

          <Form.Item label="Thời gian hết hạn">
            <InputNumber
              min={1}
              max={168}
              value={formData.autoExpireHours}
              onChange={(value) => setFormData({ ...formData, autoExpireHours: value || 48 })}
              suffix="giờ"
              style={{ width: '100%' }}
            />
            <Text type="secondary" className="text-xs">
              Yêu cầu phê duyệt sẽ tự động hủy sau thời gian này
            </Text>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" onClick={handleSave} loading={saving}>
                Lưu
              </Button>
              <Button onClick={() => setEditing(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Ngưỡng số lượng món">
            <Text strong>{settings.minItemsThreshold}</Text>
            <Text type="secondary"> món</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngưỡng giá trị">
            <Text strong>{settings.minValueThreshold.toLocaleString('vi-VN')}</Text>
            <Text type="secondary"> VNĐ</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian hết hạn">
            <Text strong>{settings.autoExpireHours}</Text>
            <Text type="secondary"> giờ</Text>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default ApprovalSettingsCard;
