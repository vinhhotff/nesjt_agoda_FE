"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { Table, TableLayout } from "@/src/Types";
import { getTables } from "@/src/lib/api";
import { AdminLayout } from "@/src/components/layout";
import { LoadingSpinner } from "@/src/components/ui";
import AdminPageHeader from "@/src/components/admin/common/AdminPageHeader";
import { Layout, Plus, Save, Trash2, Edit2, Check, Star } from "lucide-react";
import { toast } from "@/src/lib/utils/toast";
import TableLayoutEditor from "@/src/components/admin/tables/TableLayoutEditor";
import {
  fetchTableLayouts,
  createTableLayout,
  updateTableLayout,
  deleteTableLayout,
  setActiveTableLayout,
} from "@/src/lib/api/tableLayoutApi";

export default function TableLayoutPage() {
  const { user, loading } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [layouts, setLayouts] = useState<TableLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<TableLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [tablesData, savedLayouts] = await Promise.all([
        getTables({}),
        fetchTableLayouts(),
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

  async function handleDeleteLayout(layoutId: string, isActive?: boolean) {
    if (isActive) {
      toast.error("❌ Không thể xóa layout đang được sử dụng");
      return;
    }
    if (!confirm('Bạn có chắc muốn xóa layout này?')) return;
    try {
      await deleteTableLayout(layoutId);
      setLayouts((prev) => prev.filter((l) => l._id !== layoutId));
      toast.success("🗑️ Đã xóa layout thành công!");
    } catch (error: any) {
      console.error("Error deleting layout:", error);
      toast.error(error?.response?.data?.message || "Không thể xóa layout");
    }
  }

  async function handleSaveLayout(layout: TableLayout) {
    try {
      if (layout._id) {
        const updatedLayout = await updateTableLayout(layout._id, layout);
        setLayouts((prev) =>
          prev.map((l) => (l._id === updatedLayout._id ? updatedLayout : l))
        );
        toast.success("💾 Đã cập nhật layout thành công!");
      } else {
        const payload: Partial<TableLayout> = {
          ...layout,
          isActive: layouts.length === 0 ? true : layout.isActive,
        };
        const createdLayout = await createTableLayout(payload);
        setLayouts((prev) => [...prev, createdLayout]);
        toast.success("✨ Đã tạo layout mới!");
      }
      setShowEditor(false);
      setSelectedLayout(null);
    } catch (error: any) {
      console.error("Error saving layout:", error);
      toast.error(error?.response?.data?.message || "Không thể lưu layout");
    }
  }

  async function handleSetActiveLayout(layoutId: string) {
    try {
      const updatedLayout = await setActiveTableLayout(layoutId);
      setLayouts((prev) =>
        prev.map((layout) => ({
          ...layout,
          isActive: layout._id === updatedLayout._id,
        }))
      );
      toast.success("✅ Đã đặt layout chính thành công!");
    } catch (error: any) {
      console.error("Error setting active layout:", error);
      toast.error(error?.response?.data?.message || "Không thể cập nhật layout chính");
    }
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
                        onClick={() => layout._id && handleDeleteLayout(layout._id, layout.isActive)}
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

