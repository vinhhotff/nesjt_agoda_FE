"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { Table } from "@/src/Types";
import { getTables } from "@/src/lib/api";
import { AdminLayout } from "@/src/components/layout";
import { LoadingSpinner } from "@/src/components/ui";
import AdminPageHeader from "@/src/components/admin/common/AdminPageHeader";
import { Layout, Plus, Save, Trash2, Edit2, Check, Star } from "lucide-react";
import { toast } from "@/src/lib/utils/toast";
import TableLayoutEditor from "@/src/components/admin/tables/TableLayoutEditor";

interface TableLayout {
  _id?: string;
  name: string;
  gridCols: number;
  gridRows: number;
  isActive?: boolean; // Layout chính được hiển thị cho khách hàng
  zones?: {
    zoneId: string;
    zoneName: string;
    bounds: { x1: number; y1: number; x2: number; y2: number };
  }[];
  tables: {
    tableId: string;
    tableName: string;
    position: { x: number; y: number; rotation?: number };
    width?: number;
    height?: number;
    zoneName?: string;
    type?: string;
    capacity?: number;
  }[];
  backgroundImage?: string;
  description?: string;
}

export default function TableLayoutPage() {
  const { user, loading } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [layouts, setLayouts] = useState<TableLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<TableLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadData();
    // Migration: Fix layouts without isActive field
    fixLayoutsActiveStatus();
  }, []);

  // Migration function to fix existing layouts
  function fixLayoutsActiveStatus() {
    try {
      const saved = localStorage.getItem('table-layouts');
      if (!saved) return;

      let layouts: TableLayout[] = JSON.parse(saved);
      let needsUpdate = false;

      // 🔧 FIX 1: Remove "Default Layout" if other layouts exist
      const hasDefaultLayout = layouts.some(l => l.name === 'Default Layout');
      const hasOtherLayouts = layouts.some(l => l.name !== 'Default Layout');
      
      if (hasDefaultLayout && hasOtherLayouts) {
        console.log('🔧 Removing "Default Layout" because other layouts exist');
        layouts = layouts.filter(l => l.name !== 'Default Layout');
        needsUpdate = true;
      }

      // 🔧 FIX 2: Check if any layout has undefined isActive
      const hasUndefined = layouts.some(l => l.isActive === undefined);
      
      if (hasUndefined) {
        console.log('🔧 Fixing layouts with undefined isActive...');
        // Prefer non-default layout as active
        const nonDefaultLayout = layouts.find(l => l.name !== 'Default Layout');
        layouts.forEach((l, index) => {
          if (l.isActive === undefined) {
            l.isActive = nonDefaultLayout ? (l._id === nonDefaultLayout._id) : (index === 0);
            needsUpdate = true;
          }
        });
      }

      // 🔧 FIX 3: Ensure only one layout is active
      const activeLayouts = layouts.filter(l => l.isActive === true);
      if (activeLayouts.length > 1) {
        console.log('🔧 Multiple active layouts found, keeping first non-default...');
        const preferredActive = activeLayouts.find(l => l.name !== 'Default Layout') || activeLayouts[0];
        layouts.forEach(l => {
          l.isActive = (l._id === preferredActive._id);
        });
        needsUpdate = true;
      } else if (activeLayouts.length === 0 && layouts.length > 0) {
        console.log('🔧 No active layout, setting first as active...');
        layouts[0].isActive = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        localStorage.setItem('table-layouts', JSON.stringify(layouts));
        console.log('✅ Fixed layouts:', layouts.map(l => ({ name: l.name, isActive: l.isActive })));
        toast.info('🔧 Đã tự động sửa và dọn dẹp layouts');
        // Reload data
        loadData();
      }
    } catch (error) {
      console.error('Error fixing layouts:', error);
    }
  }

  async function loadData() {
    setIsLoading(true);
    try {
      const [tablesData, savedLayouts] = await Promise.all([
        getTables({}),
        loadSavedLayouts(),
      ]);
      // Ensure tables is always an array
      const tablesArray = Array.isArray(tablesData) ? tablesData : [];
      setTables(tablesArray);
      setLayouts(Array.isArray(savedLayouts) ? savedLayouts : []);
      
      if (tablesArray.length === 0) {
        console.log('No tables found. Please create tables first in /admin/tables');
        toast.info('ℹ️ Chưa có bàn nào. Vui lòng tạo bàn trước ở trang Quản lý bàn.');
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(`❌ ${error?.response?.data?.message || "Không thể tải dữ liệu"}`);
      setTables([]);
      setLayouts([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Load layouts from localStorage (tạm thời, có thể thay bằng API sau)
  function loadSavedLayouts(): TableLayout[] {
    try {
      const saved = localStorage.getItem('table-layouts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save layouts to localStorage (tạm thời)
  function saveLayouts(layouts: TableLayout[], showToast: boolean = true) {
    try {
      localStorage.setItem('table-layouts', JSON.stringify(layouts));
      if (showToast) {
        toast.success("💾 Đã lưu layout thành công!");
      }
    } catch (error) {
      toast.error("❌ Không thể lưu layout");
    }
  }

  function handleCreateLayout() {
    const newLayout: TableLayout = {
      name: `Layout ${layouts.length + 1}`,
      gridCols: 12,
      gridRows: 10,
      tables: [],
      description: '',
    };
    setSelectedLayout(newLayout);
    setShowEditor(true);
  }

  function handleEditLayout(layout: TableLayout) {
    setSelectedLayout(layout);
    setShowEditor(true);
  }

  function handleDeleteLayout(layoutId: string) {
    if (confirm('Bạn có chắc muốn xóa layout này?')) {
      const updated = layouts.filter(l => l._id !== layoutId);
      setLayouts(updated);
      saveLayouts(updated, false); // Không hiển thị toast từ saveLayouts
      toast.success("🗑️ Đã xóa layout thành công!");
    }
  }

  function handleSaveLayout(layout: TableLayout) {
    if (layout._id) {
      // Update existing
      const updated = layouts.map(l => l._id === layout._id ? layout : l);
      setLayouts(updated);
      saveLayouts(updated);
    } else {
      // Create new - nếu là layout đầu tiên, set làm active
      const isFirstLayout = layouts.length === 0;
      const newLayout = { 
        ...layout, 
        _id: Date.now().toString(),
        isActive: isFirstLayout 
      };
      const updated = [...layouts, newLayout];
      setLayouts(updated);
      saveLayouts(updated);
    }
    setShowEditor(false);
    setSelectedLayout(null);
  }

  function handleSetActiveLayout(layoutId: string) {
    // Set layout này làm active, các layout khác thành inactive
    const updated = layouts.map(l => ({
      ...l,
      isActive: l._id === layoutId
    }));
    setLayouts(updated);
    saveLayouts(updated, false); // Không hiển thị toast từ saveLayouts
    toast.success("✅ Đã đặt layout chính thành công!");
  }

  if (loading || !user) {
    return (
      <LoadingSpinner size="lg" text="Loading..." className="min-h-screen" />
    );
  }

  if (user.role !== "admin") {
    return <p className="text-center p-12">Not authorized</p>;
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Quản lý không gian quán"
          description="Tạo và quản lý layout không gian quán 2D cho việc chọn bàn"
          icon={<Layout className="w-6 h-6 text-white" />}
          action={
            <button
              onClick={handleCreateLayout}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Tạo layout mới
            </button>
          }
        />

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <LoadingSpinner size="lg" text="Đang tải..." className="py-12" />
          </div>
        ) : showEditor && selectedLayout ? (
          <TableLayoutEditor
            layout={selectedLayout}
            tables={tables}
            onSave={handleSaveLayout}
            onCancel={() => {
              setShowEditor(false);
              setSelectedLayout(null);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Info Card */}
            {layouts.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-blue-500 rounded-xl">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Layout Chính
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Layout được đánh dấu <strong className="text-blue-700">"LAYOUT CHÍNH"</strong> sẽ được hiển thị cho khách hàng khi họ đặt bàn trên trang web. 
                      Bạn có thể tạo nhiều layouts khác nhau cho các mục đích khác nhau (ví dụ: layout ngày thường, layout cuối tuần, layout sự kiện), 
                      nhưng chỉ có một layout được active tại một thời điểm.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 rounded-full font-medium">💡 Mẹo</span>
                      <span>Bấm "Đặt làm layout chính" để thay đổi layout hiển thị cho khách hàng</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
            {layouts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có layout nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Tạo layout mới để bắt đầu quản lý không gian quán
                </p>
                <button
                  onClick={handleCreateLayout}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                  Tạo layout đầu tiên
                </button>
              </div>
            ) : (
              layouts.map((layout) => (
                <div
                  key={layout._id}
                  className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all ${
                    layout.isActive 
                      ? 'border-yellow-400 ring-2 ring-yellow-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {layout.name}
                        </h3>
                        {layout.isActive && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-md">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            LAYOUT CHÍNH
                          </span>
                        )}
                      </div>
                      {layout.description && (
                        <p className="text-gray-600 mb-3">{layout.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Kích thước grid:</span>
                          <span className="font-semibold text-gray-900">{layout.gridCols} x {layout.gridRows}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Số bàn:</span>
                          <span className="font-semibold text-gray-900">{layout.tables.length}</span>
                        </div>
                        {layout.zones && layout.zones.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Số khu:</span>
                            <span className="font-semibold text-gray-900">{layout.zones.length}</span>
                            <span className="text-gray-400">({layout.zones.map(z => z.zoneName).join(', ')})</span>
                          </div>
                        )}
                        {layout.tables.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Bàn:</span>
                            <div className="flex flex-wrap gap-1">
                              {layout.tables.slice(0, 5).map((table, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium"
                                >
                                  {table.tableName}
                                  {table.zoneName && ` (${table.zoneName})`}
                                </span>
                              ))}
                              {layout.tables.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{layout.tables.length - 5} bàn khác
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Set Active Button */}
                      {!layout.isActive && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => layout._id && handleSetActiveLayout(layout._id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                          >
                            <Check className="w-4 h-4" />
                            Đặt làm layout chính
                          </button>
                          <p className="text-xs text-gray-500 mt-2">
                            Layout chính sẽ được hiển thị cho khách hàng khi đặt bàn
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditLayout(layout)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa layout"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => layout._id && handleDeleteLayout(layout._id)}
                        disabled={layout.isActive}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={layout.isActive ? "Không thể xóa layout chính" : "Xóa layout"}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

