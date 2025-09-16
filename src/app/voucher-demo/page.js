'use client';

import React, { useState, useEffect } from 'react';
import CreateVoucherForm from '../../components/admin/CreateVoucherForm';
import { voucherApi } from '../../services/voucherApi';

export default function VoucherDemoPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    expiredVouchers: 0,
    totalUsage: 0,
    totalDiscountGiven: 0
  });

  // Load vouchers
  const loadVouchers = async () => {
    setLoading(true);
    try {
      const response = await voucherApi.getVouchers({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      setVouchers(response.items);
    } catch (error) {
      console.error('❌ Error loading vouchers:', error);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const statsData = await voucherApi.getVoucherStats();
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error loading voucher stats:', error);
    }
  };

  // Handle voucher created
  const handleVoucherCreated = (voucher) => {
    setShowCreateForm(false);
    loadVouchers();
    loadStats();
  };

  // Test API functions
  const testAPIFunctions = async () => {
    
    try {
      // Test get active vouchers
      const activeVouchers = await voucherApi.getActiveVouchers();

      // Test validate voucher (if we have any)
      if (vouchers.length > 0) {
        const validationResult = await voucherApi.validateVoucher({
          code: vouchers[0].code,
          orderValue: 100000
        });
      }

      // Test stats
      const freshStats = await voucherApi.getVoucherStats();

    } catch (error) {
      console.error('❌ API test error:', error);
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getValueText = (voucher) => {
    switch (voucher.type) {
      case 'percentage':
        return `${voucher.value}%`;
      case 'fixed_amount':
        return formatCurrency(voucher.value);
      case 'free_shipping':
        return 'Miễn phí ship';
      default:
        return voucher.value?.toString() || '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'expired':
        return 'Hết hạn';
      case 'used_up':
        return 'Hết lượt';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'used_up':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadVouchers();
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🧪 Voucher API Demo</h1>
                <p className="text-gray-600 mt-1">Test form tạo voucher và tất cả API functions</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={testAPIFunctions}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  🧪 Test APIs
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-semibold"
                >
                  ➕ Tạo Voucher Mới
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-blue-600 text-2xl mr-3">🎫</div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Tổng Vouchers</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalVouchers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-600 text-2xl mr-3">✅</div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Đang Hoạt Động</p>
                    <p className="text-2xl font-bold text-green-700">{stats.activeVouchers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-600 text-2xl mr-3">❌</div>
                  <div>
                    <p className="text-sm font-medium text-red-900">Hết Hạn</p>
                    <p className="text-2xl font-bold text-red-700">{stats.expiredVouchers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-purple-600 text-2xl mr-3">👥</div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">Lượt Sử Dụng</p>
                    <p className="text-2xl font-bold text-purple-700">{stats.totalUsage}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-yellow-600 text-2xl mr-3">💰</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Tổng Giảm Giá</p>
                    <p className="text-lg font-bold text-yellow-700">{formatCurrency(stats.totalDiscountGiven)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Functions Test Panel */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 Available API Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <h3 className="font-semibold text-blue-800">CRUD Operations</h3>
                <ul className="text-blue-600 mt-2 space-y-1">
                  <li>• createVoucher()</li>
                  <li>• getVouchers() with pagination</li>
                  <li>• getVoucherById()</li>
                  <li>• updateVoucher()</li>
                  <li>• deleteVoucher()</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <h3 className="font-semibold text-green-800">Voucher Usage</h3>
                <ul className="text-green-600 mt-2 space-y-1">
                  <li>• getActiveVouchers()</li>
                  <li>• validateVoucher()</li>
                  <li>• applyVoucher()</li>
                  <li>• useVoucher()</li>
                  <li>• getVoucherByCode()</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-3 rounded">
                <h3 className="font-semibold text-purple-800">Analytics & Management</h3>
                <ul className="text-purple-600 mt-2 space-y-1">
                  <li>• getVoucherStats()</li>
                  <li>• updateExpiredVouchers()</li>
                  <li>• Filtering & Searching</li>
                  <li>• Sorting & Pagination</li>
                  <li>• Error Handling</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-sm text-gray-700">
                <strong>💡 Tip:</strong> Mở Developer Console (F12) và nhấn "Test APIs" để xem log chi tiết của tất cả API calls.
              </p>
            </div>
          </div>
        </div>

        {/* Vouchers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Danh Sách Vouchers</h2>
              <button
                onClick={loadVouchers}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                🔄 Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🎫</div>
                <p>Chưa có voucher nào</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Tạo voucher đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {vouchers.map((voucher) => (
                  <div key={voucher._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{voucher.name}</h3>
                            <p className="text-sm text-gray-600">Mã: {voucher.code}</p>
                            {voucher.description && (
                              <p className="text-sm text-gray-500 mt-1">{voucher.description}</p>
                            )}
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-blue-600">
                              {getValueText(voucher)}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(voucher.status)}`}>
                              {getStatusText(voucher.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Thời gian:</span>
                            <p className="text-gray-600">
                              {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                            </p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-gray-700">Sử dụng:</span>
                            <p className="text-gray-600">
                              {voucher.usedCount}/{voucher.usageLimit} lần
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            {voucher.minOrderValue && (
                              <p>
                                <span className="font-medium text-gray-700">Đơn tối thiểu:</span>
                                <span className="text-gray-600"> {formatCurrency(voucher.minOrderValue)}</span>
                              </p>
                            )}
                            {voucher.maxDiscount && (
                              <p>
                                <span className="font-medium text-gray-700">Giảm tối đa:</span>
                                <span className="text-gray-600"> {formatCurrency(voucher.maxDiscount)}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Voucher Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                onClick={() => setShowCreateForm(false)}
              ></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      🧪 Demo: Tạo Voucher Mới
                    </h3>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <CreateVoucherForm
                    onCreated={handleVoucherCreated}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 bg-gray-800 text-green-400 rounded-lg p-4 font-mono text-sm">
          <h3 className="text-lg font-semibold mb-2">🔍 Debug Info:</h3>
          <p>• Backend API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/vouchers</p>
          <p>• Total vouchers loaded: {vouchers.length}</p>
          <p>• Form status: {showCreateForm ? 'Open' : 'Closed'}</p>
          <p>• Loading: {loading ? 'Yes' : 'No'}</p>
          <p>• Demo URL: <a href="/voucher-demo" className="text-blue-400 underline">localhost:3000/voucher-demo</a></p>
        </div>
        
        {/* DTO Validation Requirements */}
        <div className="mt-6 bg-red-900 text-red-100 rounded-lg p-4 text-sm">
          <h3 className="text-lg font-semibold mb-2">🚨 Backend DTO Requirements (Fix 400 Errors):</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-red-200 mb-2">❌ REQUIRED Fields (@IsNotEmpty):</h4>
              <ul className="space-y-1 text-red-300">
                <li>• <code>code</code>: string (unique voucher code)</li>
                <li>• <code>name</code>: string (voucher name)</li>
                <li>• <code>type</code>: enum ['percentage', 'fixed_amount', 'free_shipping']</li>
                <li>• <code>value</code>: number (@Min(0))</li>
                <li>• <code>usageLimit</code>: number (@Min(1))</li>
                <li>• <code>startDate</code>: ISO date string</li>
                <li>• <code>endDate</code>: ISO date string</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-200 mb-2">✓ OPTIONAL Fields:</h4>
              <ul className="space-y-1 text-red-300">
                <li>• <code>description</code>: string</li>
                <li>• <code>minOrderValue</code>: number (@Min(0))</li>
                <li>• <code>maxDiscount</code>: number (@Min(0))</li>
                <li>• <code>usageLimitPerUser</code>: number (@Min(1), @Max(100))</li>
                <li>• <code>allowedUsers</code>: string[]</li>
                <li>• <code>allowedCategories</code>: string[]</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-red-800 rounded">
            <p className="text-red-200">
              <strong>🔒 Authentication:</strong> Create voucher endpoint requires <code>@Permission('voucher:create')</code>. 
              Make sure you're logged in and have proper authorization headers.
            </p>
          </div>
          
          <div className="mt-2 p-3 bg-red-800 rounded">
            <p className="text-red-200">
              <strong>📋 Data Types:</strong> Ensure <code>value</code> & <code>usageLimit</code> are numbers, 
              not strings. Dates must be ISO format strings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
