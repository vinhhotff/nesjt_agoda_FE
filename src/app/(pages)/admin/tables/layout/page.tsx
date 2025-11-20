"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { Table } from "@/src/Types";
import { getTables } from "@/src/lib/api";
import { AdminLayout } from "@/src/components/layout";
import { LoadingSpinner } from "@/src/components/ui";
import AdminPageHeader from "@/src/components/admin/common/AdminPageHeader";
import { Layout, Plus, Save, Trash2, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import TableLayoutEditor from "@/src/components/admin/tables/TableLayoutEditor";

interface TableLayout {
  _id?: string;
  name: string;
  gridCols: number;
  gridRows: number;
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
  }, []);

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
        toast.info('Chưa có bàn nào. Vui lòng tạo bàn trước ở trang Quản lý bàn.');
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu");
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
  function saveLayouts(layouts: TableLayout[]) {
    try {
      localStorage.setItem('table-layouts', JSON.stringify(layouts));
      toast.success("Đã lưu layout thành công!");
    } catch (error) {
      toast.error("Không thể lưu layout");
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
      saveLayouts(updated);
      toast.success("Đã xóa layout");
    }
  }

  function handleSaveLayout(layout: TableLayout) {
    if (layout._id) {
      // Update existing
      const updated = layouts.map(l => l._id === layout._id ? layout : l);
      setLayouts(updated);
      saveLayouts(updated);
    } else {
      // Create new
      const newLayout = { ...layout, _id: Date.now().toString() };
      const updated = [...layouts, newLayout];
      setLayouts(updated);
      saveLayouts(updated);
    }
    setShowEditor(false);
    setSelectedLayout(null);
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
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {layout.name}
                      </h3>
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
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa layout"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

