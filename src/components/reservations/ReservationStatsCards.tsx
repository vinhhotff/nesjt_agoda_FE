'use client';

import { type ReservationStats } from '@/src/lib/api/reservationsApi';

interface ReservationStatsCardsProps {
  stats: ReservationStats;
}

export default function ReservationStatsCards({ stats }: ReservationStatsCardsProps) {
  const statCards = [
    {
      title: 'Tổng đặt bàn',
      value: stats.total,
      icon: '📊',
      trend: { value: 8, direction: 'up' as const },
      className: 'primary'
    },
    {
      title: 'Chờ xác nhận',
      value: stats.pending,
      icon: '⏳',
      trend: { value: 2, direction: 'neutral' as const },
      className: 'pending'
    },
    {
      title: 'Đã xác nhận',
      value: stats.confirmed,
      icon: '✅',
      trend: { value: 12, direction: 'up' as const },
      className: 'confirmed'
    },
    {
      title: 'Hoàn thành',
      value: stats.completed,
      icon: '🍽️',
      trend: { value: 5, direction: 'up' as const },
      className: 'completed'
    },
    {
      title: 'Hôm nay',
      value: stats.todayReservations,
      icon: '📅',
      trend: { value: 15, direction: 'up' as const },
      className: 'in-progress'
    },
    {
      title: 'Sắp tới',
      value: stats.upcomingReservations,
      icon: '🔮',
      trend: { value: 3, direction: 'down' as const },
      className: 'warning'
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((card, index) => (
        <div key={index} className={`stat-card ${card.className}`}>
          <div className="stat-header">
            <div className="stat-icon">
              {card.icon}
            </div>
            <div className={`stat-trend ${card.trend.direction}`}>
              {card.trend.direction === 'up' ? '↗️' : card.trend.direction === 'down' ? '↘️' : '➡️'}
              {card.trend.value}%
            </div>
          </div>
          
          <div>
            <p className="stat-value">{card.value.toLocaleString()}</p>
            <p className="stat-label">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
