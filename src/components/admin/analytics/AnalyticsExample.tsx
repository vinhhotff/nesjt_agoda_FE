'use client';

import React, { useState } from 'react';
import OrderAnalyticsDashboard from './OrderAnalyticsDashboard';

/**
 * Example usage of the modular OrderAnalyticsDashboard
 * This demonstrates how to use the analytics components in different ways
 */
const AnalyticsExample: React.FC = () => {
  const [period, setPeriod] = useState('30d');

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive view of your order performance and trends
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Analytics Dashboard */}
        <OrderAnalyticsDashboard period={period} />
      </div>
    </div>
  );
};

export default AnalyticsExample;
