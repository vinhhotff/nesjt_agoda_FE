'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Gift, TrendingUp, Clock } from 'lucide-react';
import { loyaltyAPI, LoyaltyAccount } from '@/services/loyaltyApi';
import { toast } from 'sonner';

interface LoyaltyPointsDisplayProps {
  userId?: string;
  showRedeemButton?: boolean;
  compact?: boolean;
}

export default function LoyaltyPointsDisplay({ 
  userId, 
  showRedeemButton = false,
  compact = false 
}: LoyaltyPointsDisplayProps) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLoyaltyData();
  }, [userId]);

  const loadLoyaltyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: LoyaltyAccount;
      if (userId) {
        data = await loyaltyAPI.getUserLoyalty(userId);
      } else {
        data = await loyaltyAPI.getMyPoints();
      }
      
      setLoyaltyData(data);
    } catch (err: any) {
      console.error('Error loading loyalty data:', err);
      if (err.response?.status === 404) {
        setError('Tài khoản loyalty chưa được tạo');
      } else {
        setError('Không thể tải thông tin điểm thưởng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = () => {
    // Trigger parent component's redeem modal
    const event = new CustomEvent('openRedeemModal', {
      detail: { points: loyaltyData?.points || 0 }
    });
    window.dispatchEvent(event);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500 mb-4">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{error}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadLoyaltyData}
          >
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium">
            {formatNumber(loyaltyData.points)} điểm
          </span>
        </div>
        <div className="text-xs text-gray-500">
          ≈ {formatNumber(loyaltyAPI.calculateDiscountFromPoints(loyaltyData.points))}đ
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-yellow-600" />
          Điểm thưởng
          <Badge variant="secondary" className="ml-auto">
            Loyalty
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Current Points */}
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-700 mb-1">
              {formatNumber(loyaltyData.points)}
            </div>
            <div className="text-sm text-gray-600">
              điểm có thể sử dụng
            </div>
          </div>

          {/* Points Value */}
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <Gift className="h-4 w-4" />
              <span>Giá trị quy đổi</span>
            </div>
            <div className="text-lg font-semibold text-green-700">
              {formatNumber(loyaltyAPI.calculateDiscountFromPoints(loyaltyData.points))}đ
            </div>
          </div>

          {/* Points Rule */}
          <div className="bg-white/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <TrendingUp className="h-3 w-3" />
              <span>Quy tắc tích điểm</span>
            </div>
            <div className="text-sm">
              • 1.000đ = 1 điểm<br/>
              • 1 điểm = 1.000đ giảm giá
            </div>
          </div>

          {/* User Info */}
          {loyaltyData.user && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                Thành viên từ {new Date(loyaltyData.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}

          {/* Action Button */}
          {showRedeemButton && loyaltyData.points > 0 && (
            <Button 
              onClick={handleRedeemClick}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Gift className="h-4 w-4 mr-2" />
              Quy đổi điểm
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
