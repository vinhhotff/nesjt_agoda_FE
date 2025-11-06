import React, { useState, useEffect } from 'react';
import { voucherApi } from '../../services/voucherApi';

const CreateVoucherForm = ({ onCreated, onCancel }) => {
  // Form data state based on CreateVoucherDto
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: '',
    value: null,
    minOrderValue: null,
    maxDiscount: null,
    usageLimit: 1,
    usageLimitPerUser: 1,
    startDate: '',
    endDate: '',
    allowedUsers: [],
    allowedCategories: []
  });

  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [allowedUsersText, setAllowedUsersText] = useState('');
  const [allowedCategoriesText, setAllowedCategoriesText] = useState('');

  // Initialize form with default dates
  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 60000); // 1 minute from now
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
    
    setFormData(prev => ({
      ...prev,
      startDate: formatDateTimeLocal(startDate),
      endDate: formatDateTimeLocal(endDate)
    }));
  }, []);

  // Format date for datetime-local input
  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Parse allowed users from textarea
  const parseAllowedUsers = () => {
    const users = allowedUsersText
      .split('\n')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    setFormData(prev => ({
      ...prev,
      allowedUsers: users
    }));
  };

  // Parse allowed categories from textarea
  const parseAllowedCategories = () => {
    const categories = allowedCategoriesText
      .split('\n')
      .map(category => category.trim())
      .filter(category => category.length > 0);
    
    setFormData(prev => ({
      ...prev,
      allowedCategories: categories
    }));
  };

  // Handle voucher type change (ensure DTO compliance)
  const onTypeChange = (type) => {
    let newData = { type };
    
    // Handle value field based on type (value is REQUIRED in DTO)
    if (type === 'free_shipping') {
      // For free shipping, value should be 0 (still required by DTO)
      newData.value = 0;
    } else if (type === 'percentage') {
      // For percentage, default to 10% if no value
      newData.value = formData.value || 10;
    } else if (type === 'fixed_amount') {
      // For fixed amount, default to 10000 VND if no value
      newData.value = formData.value || 10000;
    } else {
      // For empty type, clear value but keep as number (DTO requires number type)
      newData.value = null;
    }
    
    // Reset max discount if not percentage (only applicable to percentage)
    if (type !== 'percentage') {
      newData.maxDiscount = null;
    }
    
    
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Validate form (exact match with backend DTO validation)
  const validateForm = () => {
    const newErrors = {};

    // DTO REQUIRED fields with @IsNotEmpty() validation
    if (!formData.code?.trim()) {
      newErrors.code = '❌ REQUIRED: Mã voucher không được để trống (@IsNotEmpty)';
    }
    if (!formData.name?.trim()) {
      newErrors.name = '❌ REQUIRED: Tên voucher không được để trống (@IsNotEmpty)';
    }
    if (!formData.type) {
      newErrors.type = '❌ REQUIRED: Loại voucher không được để trống (@IsEnum)';
    } else {
      // Validate enum values
      const validTypes = ['percentage', 'fixed_amount', 'free_shipping'];
      if (!validTypes.includes(formData.type)) {
        newErrors.type = `❌ ENUM: Loại voucher phải là một trong: ${validTypes.join(', ')}`;
      }
    }
    
    // VALUE field validation (@IsNotEmpty, @IsNumber, @Min(0))
    if (formData.value === null || formData.value === undefined || formData.value === '') {
      newErrors.value = '❌ REQUIRED: Giá trị voucher không được để trống (@IsNotEmpty)';
    } else {
      const numValue = parseFloat(formData.value);
      if (isNaN(numValue)) {
        newErrors.value = '❌ TYPE: Giá trị voucher phải là số (@IsNumber)';
      } else if (numValue < 0) {
        newErrors.value = '❌ RANGE: Giá trị voucher phải >= 0 (@Min(0))';
      } else if (formData.type === 'percentage' && numValue > 100) {
        newErrors.value = '❌ RANGE: Phần trăm không được vượt quá 100%';
      }
    }
    
    // USAGE LIMIT validation (@IsNotEmpty, @IsNumber, @Min(1))
    if (!formData.usageLimit) {
      newErrors.usageLimit = '❌ REQUIRED: Số lần sử dụng không được để trống (@IsNotEmpty)';
    } else {
      const numUsage = parseInt(formData.usageLimit);
      if (isNaN(numUsage)) {
        newErrors.usageLimit = '❌ TYPE: Số lần sử dụng phải là số nguyên (@IsNumber)';
      } else if (numUsage < 1) {
        newErrors.usageLimit = '❌ RANGE: Số lần sử dụng phải >= 1 (@Min(1))';
      }
    }
    
    // DATE validation (@IsNotEmpty, @IsDateString)
    if (!formData.startDate) {
      newErrors.startDate = '❌ REQUIRED: Ngày bắt đầu không được để trống (@IsNotEmpty)';
    } else {
      const startDate = new Date(formData.startDate);
      if (isNaN(startDate.getTime())) {
        newErrors.startDate = '❌ FORMAT: Ngày bắt đầu không đúng định dạng (@IsDateString)';
      }
    }
    
    if (!formData.endDate) {
      newErrors.endDate = '❌ REQUIRED: Ngày kết thúc không được để trống (@IsNotEmpty)';
    } else {
      const endDate = new Date(formData.endDate);
      if (isNaN(endDate.getTime())) {
        newErrors.endDate = '❌ FORMAT: Ngày kết thúc không đúng định dạng (@IsDateString)';
      }
    }
    
    // Cross-field date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
        newErrors.endDate = '❌ LOGIC: Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    // OPTIONAL fields validation (if provided)
    if (formData.minOrderValue && formData.minOrderValue !== '') {
      const numMin = parseFloat(formData.minOrderValue);
      if (isNaN(numMin) || numMin < 0) {
        newErrors.minOrderValue = '❌ OPTIONAL: Giá trị đơn hàng tối thiểu phải >= 0 (@Min(0))';
      }
    }
    
    if (formData.maxDiscount && formData.maxDiscount !== '') {
      const numMax = parseFloat(formData.maxDiscount);
      if (isNaN(numMax) || numMax < 0) {
        newErrors.maxDiscount = '❌ OPTIONAL: Giảm tối đa phải >= 0 (@Min(0))';
      }
    }
    
    if (formData.usageLimitPerUser && formData.usageLimitPerUser !== '') {
      const numPerUser = parseInt(formData.usageLimitPerUser);
      if (isNaN(numPerUser) || numPerUser < 1 || numPerUser > 100) {
        newErrors.usageLimitPerUser = '❌ OPTIONAL: Số lần sử dụng/user phải trong khoảng 1-100 (@Min(1), @Max(100))';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    
    return isValid;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API (convert to match DTO exactly)
      const submitData = {
        // REQUIRED fields (exact match with DTO)
        code: formData.code.trim(),
        name: formData.name.trim(),
        type: formData.type, // Must be exact enum value
        value: parseFloat(formData.value), // Must be number, not string
        usageLimit: parseInt(formData.usageLimit), // Must be number, not string
        startDate: new Date(formData.startDate).toISOString(), // Must be ISO string
        endDate: new Date(formData.endDate).toISOString(), // Must be ISO string
        
        // OPTIONAL fields (only send if they have values)
        ...(formData.description?.trim() && { description: formData.description.trim() }),
        ...(formData.minOrderValue && { minOrderValue: parseFloat(formData.minOrderValue) }),
        ...(formData.maxDiscount && { maxDiscount: parseFloat(formData.maxDiscount) }),
        ...(formData.usageLimitPerUser && { usageLimitPerUser: parseInt(formData.usageLimitPerUser) }),
        ...(formData.allowedUsers.length > 0 && { allowedUsers: formData.allowedUsers }),
        ...(formData.allowedCategories.length > 0 && { allowedCategories: formData.allowedCategories })
      };

    
      const response = await voucherApi.createVoucher(submitData);
      
      onCreated && onCreated(response);
      resetForm();
      
      // Show success message
      alert('✅ Voucher đã được tạo thành công!');
      
    } catch (error) {
      console.error('❌ Error creating voucher:', error);
      console.error('📋 Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        data: error.response?.data
      });
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        alert(`🚨 Validation Error (400): ${errorMsg}`);
      } else if (error.response?.status === 401) {
        alert('🔒 Unauthorized: Bạn cần đăng nhập để tạo voucher');
      } else if (error.response?.status === 403) {
        alert('🚫 Forbidden: Bạn không có quyền tạo voucher');
      } else {
        alert(`❌ Error ${error.response?.status || ''}: ${error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo voucher'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: '',
      value: null,
      minOrderValue: null,
      maxDiscount: null,
      usageLimit: 1,
      usageLimitPerUser: 1,
      startDate: '',
      endDate: '',
      allowedUsers: [],
      allowedCategories: []
    });
    
    setAllowedUsersText('');
    setAllowedCategoriesText('');
    setErrors({});
    
    // Reset default dates
    const now = new Date();
    const startDate = new Date(now.getTime() + 60000);
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    setFormData(prev => ({
      ...prev,
      startDate: formatDateTimeLocal(startDate),
      endDate: formatDateTimeLocal(endDate)
    }));
  };

  // Helper functions for preview
  const formatCurrency = (amount) => {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getDiscountText = () => {
    if (!formData.type || !formData.value) return '-';
    
    switch (formData.type) {
      case 'percentage':
        return `${formData.value}%`;
      case 'fixed_amount':
        return formatCurrency(formData.value);
      case 'free_shipping':
        return 'Miễn phí ship';
      default:
        return '-';
    }
  };

  const getValidityText = () => {
    if (!formData.startDate || !formData.endDate) return '-';
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div className="create-voucher-form max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tạo Voucher Mới</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Thông Tin Cơ Bản</h3>
          
          {/* Code & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="VD: SUMMER2024"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.code ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên Voucher <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="VD: Giảm giá mùa hè"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô Tả
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="3"
              placeholder="Mô tả chi tiết về voucher..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Voucher Configuration Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cấu Hình Voucher</h3>
          
          {/* Voucher Type */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Loại Voucher <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => onTypeChange(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.type ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">-- Chọn loại voucher --</option>
              <option value="percentage">Giảm theo phần trăm (%)</option>
              <option value="fixed_amount">Giảm số tiền cố định (VND)</option>
              <option value="free_shipping">Miễn phí vận chuyển</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Value & Order limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                Giá Trị <span className="text-red-500">*</span>
                {formData.type === 'percentage' && <span className="text-gray-500"> (1-100%)</span>}
                {formData.type === 'fixed_amount' && <span className="text-gray-500"> (VND)</span>}
              </label>
              <input
                id="value"
                type="number"
                value={formData.value || ''}
                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || null)}
                min="0"
                max={formData.type === 'percentage' ? 100 : undefined}
                placeholder={formData.type === 'percentage' ? '10' : '50000'}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.value ? 'border-red-500' : ''
                }`}
                disabled={formData.type === 'free_shipping'}
                required
              />
              {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
            </div>

            <div>
              <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-700 mb-2">
                Giá Trị Đơn Hàng Tối Thiểu (VND)
              </label>
              <input
                id="minOrderValue"
                type="number"
                value={formData.minOrderValue || ''}
                onChange={(e) => handleInputChange('minOrderValue', parseFloat(e.target.value) || null)}
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.type === 'percentage' && (
              <div>
                <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm Tối Đa (VND)
                </label>
                <input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount || ''}
                  onChange={(e) => handleInputChange('maxDiscount', parseFloat(e.target.value) || null)}
                  min="0"
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Usage Configuration Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cấu Hình Sử Dụng</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-2">
                Tổng Số Lần Sử Dụng <span className="text-red-500">*</span>
              </label>
              <input
                id="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 1)}
                min="1"
                placeholder="100"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.usageLimit ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.usageLimit && <p className="text-red-500 text-sm mt-1">{errors.usageLimit}</p>}
            </div>

            <div>
              <label htmlFor="usageLimitPerUser" className="block text-sm font-medium text-gray-700 mb-2">
                Số Lần Sử Dụng/Khách Hàng (1-100)
              </label>
              <input
                id="usageLimitPerUser"
                type="number"
                value={formData.usageLimitPerUser}
                onChange={(e) => handleInputChange('usageLimitPerUser', parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Date Configuration Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Thời Gian Hiệu Lực</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Bắt Đầu <span className="text-red-500">*</span>
              </label>
              <input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Kết Thúc <span className="text-red-500">*</span>
              </label>
              <input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        {/* Advanced Settings Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cấu Hình Nâng Cao (Tùy chọn)</h3>
          
          <div className="mb-4">
            <label htmlFor="allowedUsers" className="block text-sm font-medium text-gray-700 mb-2">
              Khách Hàng Được Phép Sử Dụng
            </label>
            <textarea
              id="allowedUsers"
              value={allowedUsersText}
              onChange={(e) => setAllowedUsersText(e.target.value)}
              onBlur={parseAllowedUsers}
              rows="3"
              placeholder="Nhập các User ID, mỗi ID một dòng (để trống = tất cả khách hàng)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="allowedCategories" className="block text-sm font-medium text-gray-700 mb-2">
              Danh Mục Được Áp Dụng
            </label>
            <textarea
              id="allowedCategories"
              value={allowedCategoriesText}
              onChange={(e) => setAllowedCategoriesText(e.target.value)}
              onBlur={parseAllowedCategories}
              rows="3"
              placeholder="Nhập các tên danh mục, mỗi danh mục một dòng (để trống = tất cả danh mục)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset Form
          </button>
          
          <div className="space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang Tạo...' : 'Tạo Voucher'}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Xem Trước Voucher</h3>
          <div className="bg-white p-4 rounded-md border">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg">{formData.name || 'Tên voucher'}</h4>
                <p className="text-gray-600">{formData.description || 'Không có mô tả'}</p>
                <p className="text-sm text-gray-500 mt-2">Mã: {formData.code || 'VOUCHERCODE'}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {getDiscountText()}
                </div>
                <div className="text-sm text-gray-500">
                  {getValidityText()}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {formData.minOrderValue && (
                <p>Đơn hàng tối thiểu: {formatCurrency(formData.minOrderValue)}</p>
              )}
              {formData.maxDiscount && formData.type === 'percentage' && (
                <p>Giảm tối đa: {formatCurrency(formData.maxDiscount)}</p>
              )}
              <p>Còn lại: {formData.usageLimit || 0}/{formData.usageLimit || 0} lượt sử dụng</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVoucherForm;
