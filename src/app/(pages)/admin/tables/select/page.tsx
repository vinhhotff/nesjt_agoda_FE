"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { Table, Guest, TableLayout } from "@/src/Types";
import { getTables, getGuests } from "@/src/lib/api";
import TableSeatSelector from "@/src/components/admin/tables/TableSeatSelector";
import { AdminLayout } from "@/src/components/layout";
import { LoadingSpinner } from "@/src/components/ui";
import AdminPageHeader from "@/src/components/admin/common/AdminPageHeader";
import { Table as TableIcon, Users } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { fetchTableLayouts } from "@/src/lib/api/tableLayoutApi";

export default function TableSelectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layouts, setLayouts] = useState<TableLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<TableLayout | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadGuestsForTable(selectedTable.tableName);
    }
  }, [selectedTable]);

  // Load layouts from backend
  async function loadSavedLayouts(): Promise<TableLayout[]> {
    try {
      return await fetchTableLayouts();
    } catch (error) {
      console.error("Error loading layouts:", error);
      toast.error("Không thể tải danh sách layout");
      return [];
    }
  }

  async function loadData() {
    setIsLoading(true);
    try {
      const [tablesData, guestsData] = await Promise.all([
        getTables({}),
        getGuests({}).catch((error: any) => {
          if (error?.response?.status === 404) {
            console.warn("Guests endpoint not available yet, will load per table");
            return [];
          }
          throw error;
        }),
      ]);
      setTables(Array.isArray(tablesData) ? tablesData : []);
      // getGuests always returns an array
      const guestsArray = Array.isArray(guestsData) ? guestsData : [];
      setGuests(guestsArray);
      
      // Load layouts
      const savedLayouts = await loadSavedLayouts();
      setLayouts(savedLayouts);
      
      // Auto-select active layout if available
      if (savedLayouts.length > 0) {
        const activeLayout = savedLayouts.find((layout) => layout.isActive);
        setSelectedLayout(activeLayout || savedLayouts[0]);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      if (error?.response?.status !== 404 || !error?.response?.config?.url?.includes('/guests')) {
        toast.error("Không thể tải dữ liệu");
      }
      setGuests([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadGuestsForTable(tableName: string) {
    try {
      const guestsData = await getGuests({ tableName });
      // getGuests always returns an array
      const guestsArray = Array.isArray(guestsData) ? guestsData : [];
      // Cập nhật guests, giữ lại guests từ các bàn khác
      setGuests(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        const filtered = prevArray.filter(g => g.tableName !== tableName);
        return [...filtered, ...guestsArray];
      });
    } catch (error: any) {
      console.error("Error loading guests:", error);
      // Không hiển thị toast vì đây là lỗi không quan trọng
      if (error?.response?.status !== 404) {
        console.warn("Could not load guests for table:", tableName);
      }
    }
  }

  // Filter tables based on selected layout
  const filteredTables = selectedLayout
    ? tables.filter(table => 
        selectedLayout.tables?.some(layoutTable => (layoutTable._id || layoutTable.tableId) === table._id) || false
      )
    : tables;

  // Calculate guests count per table
  const guestsByTable = (Array.isArray(guests) ? guests : []).reduce((acc, guest) => {
    const tableName = guest.tableName || guest.tableCode || '';
    if (tableName && !acc[tableName]) {
      acc[tableName] = 0;
    }
    if (tableName) {
      acc[tableName]++;
    }
    return acc;
  }, {} as Record<string, number>);

  // Map tableName to table _id for the selector
  const guestsByTableId = filteredTables.reduce((acc, table) => {
    const count = guestsByTable[table.tableName] || 0;
    acc[table._id] = count;
    return acc;
  }, {} as Record<string, number>);

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    toast.success(`Đã chọn bàn ${table.tableName}`);
  };

  const handleDeselectTable = () => {
    setSelectedTable(null);
  };

  if (loading || !user) {
    return (
      <LoadingSpinner size="lg" text="Loading..." className="min-h-screen" />
    );
  }

  if (user.role !== "admin" && user.role !== "staff") {
    return <p className="text-center p-12">Not authorized</p>;
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Chọn bàn"
          description="Chọn bàn để xem thông tin và quản lý khách hàng"
          icon={<TableIcon className="w-6 h-6 text-white" />}
        />

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <LoadingSpinner size="lg" text="Đang tải..." className="py-12" />
          </div>
        ) : (
          <>
            {/* Layout Selector */}
            {layouts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn layout không gian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {layouts.map((layout) => (
                    <button
                      key={layout._id}
                      onClick={() => {
                        setSelectedLayout(layout);
                        setSelectedTable(null);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                        selectedLayout?._id === layout._id
                          ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                          : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{layout.name}</h4>
                        {selectedLayout?._id === layout._id && (
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      {layout.description && (
                        <p className="text-sm text-gray-600 mb-2">{layout.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{layout.tables?.length || 0} bàn</span>
                        {layout.zones && layout.zones.length > 0 && (
                          <span>{layout.zones.length} khu</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tables Display */}
            {layouts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <TableIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có layout nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Vui lòng tạo layout ở trang "Không gian quán" trước
                </p>
                <button
                  onClick={() => router.push('/admin/tables/layout')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl"
                >
                  Đi tới Không gian quán
                </button>
              </div>
            ) : !selectedLayout ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <TableIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chọn một layout
                </h3>
                <p className="text-gray-500">
                  Vui lòng chọn layout ở trên để xem các bàn
                </p>
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <TableIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Layout chưa có bàn
                </h3>
                <p className="text-gray-500 mb-6">
                  Layout "{selectedLayout.name}" chưa có bàn nào được thêm vào
                </p>
                <button
                  onClick={() => router.push('/admin/tables/layout')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl"
                >
                  Chỉnh sửa layout
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Layout: {selectedLayout.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {filteredTables.length} bàn có sẵn
                    </p>
                  </div>
                </div>
                <TableSeatSelector
                  tables={filteredTables}
                  selectedTableId={selectedTable?._id || null}
                  onSelectTable={handleSelectTable}
                  onDeselectTable={handleDeselectTable}
                  showGuestsCount={true}
                  guestsByTable={guestsByTableId}
                />

                {/* Selected Table Info */}
                {selectedTable && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        Thông tin bàn: {selectedTable.tableName}
                      </h3>
                      <button
                        onClick={() => router.push(`/admin/tables?view=${selectedTable._id}`)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Vị trí</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {typeof selectedTable.location === 'string' 
                            ? selectedTable.location 
                            : selectedTable.location 
                              ? `${selectedTable.location.x}, ${selectedTable.location.y}` 
                              : "Chưa có"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Trạng thái</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedTable.status === "available"
                            ? "Trống"
                            : selectedTable.status === "occupied"
                            ? "Đang dùng"
                            : selectedTable.status === "reserved"
                            ? "Đã đặt"
                            : "Bảo trì"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số khách</p>
                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {guestsByTableId[selectedTable._id] || 0} khách
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

