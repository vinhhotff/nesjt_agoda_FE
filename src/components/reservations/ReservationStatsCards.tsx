'use client';

import { type ReservationStats } from '@/src/lib/api/reservationsApi';

interface ReservationStatsCardsProps {
  stats: ReservationStats;
}

export default function ReservationStatsCards({ stats }: ReservationStatsCardsProps) {
  const statCards = [
    {
      title: 'Tổng đặt bàn',
      value: stats?.total ?? 0,
      icon: '📊',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
    },
    {
      title: 'Chờ xác nhận',
      value: stats?.pending ?? 0,
      icon: '⏳',
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
      textColor: 'text-white',
    },
    {
      title: 'Đã xác nhận',
      value: stats?.confirmed ?? 0,
      icon: '✅',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-white',
    },
    {
      title: 'Hoàn thành',
      value: stats?.completed ?? 0,
      icon: '🍽️',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      textColor: 'text-white',
    },
    {
      title: 'Đã hủy',
      value: stats?.cancelled ?? 0,
      icon: '❌',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-white',
    },
    {
      title: 'Hôm nay',
      value: stats?.todayReservations ?? 0,
      icon: '📅',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} ${card.textColor} rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">{card.icon}</div>
            <div className="bg-white rounded-full px-3 py-1">
              <span className="text-2xl font-bold text-gray-900">{(card.value ?? 0).toLocaleString('vi-VN')}</span>
            </div>
          </div>
          <p className="text-sm font-medium opacity-90">{card.title}</p>
        </div>
      ))}
    </div>
  );
}
