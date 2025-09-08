'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Gift, 
  History, 
  TrendingUp, 
  Clock,
  Award,
  Target,
  ChevronRight
} from 'lucide-react';
import LoyaltyPointsDisplay from '@/components/loyalty/LoyaltyPointsDisplay';
import RedeemPointsModal from '@/components/loyalty/RedeemPointsModal';
import { loyaltyAPI, LoyaltyAccount, LoyaltyHistory } from '@/services/loyaltyApi';
import { toast } from 'sonner';

export default function UserLoyaltyPage() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyAccount | null>(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);

  useEffect(() => {
    loadLoyaltyData();
    loadLoyaltyHistory();
    
    // Listen for redeem modal trigger
    const handleRedeemModal = (event: CustomEvent) => {
      setRedeemModalOpen(true);
    };
    
    window.addEventListener('openRedeemModal', handleRedeemModal as EventListener);
    
    return () => {
      window.removeEventListener('openRedeemModal', handleRedeemModal as EventListener);
    };
  }, []);

  const loadLoyaltyData = async () => {
    try {
      const data = await loyaltyAPI.getMyPoints();
      setLoyaltyData(data);
    } catch (error: any) {
      console.error('Error loading loyalty data:', error);
      if (error.response?.status !== 404) {
        toast.error('Không thể tải thông tin điểm thưởng');
      }
    }
  };

  const loadLoyaltyHistory = async () => {
    try {
      const history = await loyaltyAPI.getMyPointsHistory();
      setLoyaltyHistory(history);
    } catch (error: any) {
      console.error('Error loading loyalty history:', error);
      // Don't show error toast for history as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemSuccess = (redeemedPoints: number, discountValue: number) => {
    // Refresh loyalty data after successful redemption
    loadLoyaltyData();
    loadLoyaltyHistory();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const loyaltyTiers = [
    { name: 'Đồng', minPoints: 0, maxPoints: 99, color: 'bg-amber-100 text-amber-800', icon: '🥉' },
    { name: 'Bạc', minPoints: 100, maxPoints: 499, color: 'bg-gray-100 text-gray-800', icon: '🥈' },
    { name: 'Vàng', minPoints: 500, maxPoints: 999, color: 'bg-yellow-100 text-yellow-800', icon: '🥇' },
    { name: 'Kim cương', minPoints: 1000, maxPoints: Infinity, color: 'bg-blue-100 text-blue-800', icon: '💎' },
  ];

  const getCurrentTier = (points: number) => {
    return loyaltyTiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints);
  };

  const getNextTier = (points: number) => {
    return loyaltyTiers.find(tier => points < tier.minPoints);
  };

  const currentTier = loyaltyData ? getCurrentTier(loyaltyData.points) : null;
  const nextTier = loyaltyData ? getNextTier(loyaltyData.points) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Điểm thưởng của tôi</h1>
        <p className="text-gray-600">
          Theo dõi và quản lý điểm thưởng loyalty của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Points Display */}
        <div className="space-y-6">
          <LoyaltyPointsDisplay showRedeemButton={true} />

          {/* Tier Status */}
          {loyaltyData && currentTier && (
            <Card className="border-2 border-dashed border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Hạng thành viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Tier */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{currentTier.icon}</div>
                      <div>
                        <Badge className={currentTier.color}>
                          {currentTier.name}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">
                          Hạng hiện tại
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(loyaltyData.points)} điểm</div>
                    </div>
                  </div>

                  {/* Progress to Next Tier */}
                  {nextTier && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Tiến độ lên hạng {nextTier.name}</span>
                          <span className="text-sm text-gray-600">
                            {formatNumber(nextTier.minPoints - loyaltyData.points)} điểm nữa
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (loyaltyData.points / nextTier.minPoints) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round((loyaltyData.points / nextTier.minPoints) * 100)}% hoàn thành
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Hành động nhanh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setRedeemModalOpen(true)}
                  disabled={!loyaltyData || loyaltyData.points === 0}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    <span>Quy đổi điểm thưởng</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.location.href = '/menu'}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Đặt món để tích điểm</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History & Info */}
        <div className="space-y-6">
          {/* Points Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Quy tắc tích điểm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="font-semibold mb-2 text-yellow-800">Cách tích điểm</div>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Mỗi 1.000đ đơn hàng = 1 điểm</li>
                    <li>• Điểm tự động cộng khi đơn hàng hoàn thành</li>
                    <li>• Chỉ đơn hàng "Đã phục vụ" mới được tích điểm</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="font-semibold mb-2 text-green-800">Cách sử dụng điểm</div>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• 1 điểm = 1.000đ giảm giá</li>
                    <li>• Có thể sử dụng một phần hoặc toàn bộ điểm</li>
                    <li>• Mã giảm giá có thời hạn 30 ngày</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="font-semibold mb-2 text-blue-800">Hạng thành viên</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {loyaltyTiers.map((tier, index) => (
                      <div 
                        key={tier.name}
                        className={`p-2 rounded border ${
                          currentTier?.name === tier.name 
                            ? 'border-blue-400 bg-blue-100' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{tier.icon}</span>
                          <span className="font-medium">{tier.name}</span>
                        </div>
                        <div className="text-gray-600">
                          {tier.maxPoints === Infinity 
                            ? `${formatNumber(tier.minPoints)}+ điểm`
                            : `${formatNumber(tier.minPoints)}-${formatNumber(tier.maxPoints)} điểm`
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Lịch sử điểm
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải lịch sử...</p>
                </div>
              ) : loyaltyHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Chưa có lịch sử giao dịch</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Đặt món ngay để bắt đầu tích điểm!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loyaltyHistory.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {item.type === 'current_balance' ? 'Số dư hiện tại' : item.type}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(item.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-yellow-700">
                          {formatNumber(item.points)} điểm
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Redeem Modal */}
      {loyaltyData && (
        <RedeemPointsModal
          isOpen={redeemModalOpen}
          onClose={() => setRedeemModalOpen(false)}
          availablePoints={loyaltyData.points}
          onSuccess={handleRedeemSuccess}
        />
      )}
    </div>
  );
}
