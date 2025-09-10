'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/button';
import Input from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { Gift, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { loyaltyAPI } from '@/src/services/loyaltyApi';
import { toast } from 'react-toastify';

interface RedeemPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePoints: number;
  onSuccess?: (redeemedPoints: number, discountValue: number) => void;
}

export default function RedeemPointsModal({
  isOpen,
  onClose,
  availablePoints,
  onSuccess
}: RedeemPointsModalProps) {
  const [pointsToRedeem, setPointsToRedeem] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPointsToRedeem('');
      setError(null);
    }
  }, [isOpen]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const pointsValue = parseInt(pointsToRedeem) || 0;
  const discountValue = loyaltyAPI.calculateDiscountFromPoints(pointsValue);
  const isValidAmount = pointsValue > 0 && pointsValue <= availablePoints;

  const handleRedeemSubmit = async () => {
    if (!isValidAmount) {
      setError('Số điểm quy đổi không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await loyaltyAPI.redeemMyPoints({ points: pointsValue });
      
      toast.success(`Quy đổi thành công ${formatNumber(pointsValue)} điểm! Bạn nhận được ${formatNumber(discountValue)}đ giảm giá`);

      onSuccess?.(pointsValue, discountValue);
      onClose();
    } catch (err: any) {
      console.error('Error redeeming points:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi quy đổi điểm';
      setError(errorMessage);
      toast.error(`Quy đổi thất bại: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (percentage: number) => {
    const points = Math.floor(availablePoints * (percentage / 100));
    setPointsToRedeem(points.toString());
    setError(null);
  };

  const handleMaxSelect = () => {
    setPointsToRedeem(availablePoints.toString());
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quy đổi điểm thưởng" size="md">
      <div className="space-y-6">
        {/* Available Points */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Điểm có sẵn</span>
            <Badge className="border border-yellow-400 text-yellow-700">
              <Star className="h-3 w-3 mr-1" />
              {formatNumber(availablePoints)} điểm
            </Badge>
          </div>
          <div className="text-xs text-gray-600">
            Tương đương {formatNumber(loyaltyAPI.calculateDiscountFromPoints(availablePoints))}đ
          </div>
        </div>

        {/* Quick Select */}
        <div>
          <div className="text-sm font-medium mb-3">Chọn nhanh</div>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => handleQuickSelect(25)}
              disabled={availablePoints < 4}
            >
              25%
            </Button>
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => handleQuickSelect(50)}
              disabled={availablePoints < 2}
            >
              50%
            </Button>
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => handleQuickSelect(75)}
              disabled={availablePoints < 2}
            >
              75%
            </Button>
            <Button
              variant="outline"
              className="text-xs"
              onClick={handleMaxSelect}
              disabled={availablePoints === 0}
            >
              Tất cả
            </Button>
          </div>
        </div>

        {/* Manual Input */}
        <div>
          <label htmlFor="pointsInput" className="text-sm font-medium">Nhập số điểm muốn quy đổi</label>
          <div className="mt-2">
            <Input
              id="pointsInput"
              type="number"
              placeholder="0"
              value={pointsToRedeem}
              onChange={(e) => {
                setPointsToRedeem(e.target.value);
                setError(null);
              }}
              min={1}
              className="text-center text-lg font-medium"
            />
          </div>
          {pointsToRedeem && (
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-600">= {formatNumber(discountValue)}đ giảm giá</span>
            </div>
          )}
        </div>

        {/* Validation */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {pointsToRedeem && isValidAmount && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">
              <div className="font-medium mb-1">Quy đổi {formatNumber(pointsValue)} điểm</div>
              <div>Bạn sẽ nhận được {formatNumber(discountValue)}đ mã giảm giá</div>
            </div>
          </div>
        )}

        <Separator />

        {/* Terms */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• 1 điểm = 1.000đ giảm giá</div>
          <div>• Mã giảm giá có thời hạn 30 ngày</div>
          <div>• Áp dụng cho tất cả sản phẩm</div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleRedeemSubmit}
            disabled={!isValidAmount || loading}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span>Quy đổi ngay</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
