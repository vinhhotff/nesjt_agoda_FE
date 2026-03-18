'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, Check, Users, MapPin, RotateCw, Layout } from 'lucide-react';
import { Table, TableLayout } from '@/src/Types';
import { getTables } from '@/src/lib/api';
import { reservationsAPI } from '@/src/lib/api/reservationsApi';
import { getActiveTableLayout } from '@/src/lib/api/tableLayoutApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getTableCellColor,
  getEmptyCellColor,
  getGridContainerStyle,
  getDisplayDimensions,
  getCellGridStyle,
  CELL_BASE_CLASSES,
  SCREEN_INDICATOR,
} from '@/src/lib/utils/tableLayoutStyles';

interface TableSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (tableId: string, tableName: string) => void;
  selectedTableId?: string | null;
  numberOfGuests: number;
  reservationDate?: string; // Date to check availability
  reservationTime?: string; // Time to check availability
}

interface TableAvailability {
  tableId: string;
  isAvailable: boolean;
  isReserved: boolean;
  reservedBy?: string; // Customer name who reserved
}

export default function TableSelectionModal({
  isOpen,
  onClose,
  onSelectTable,
  selectedTableId,
  numberOfGuests,
  reservationDate,
  reservationTime,
}: TableSelectionModalProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [tableAvailability, setTableAvailability] = useState<Record<string, TableAvailability>>({});
  const [gridCols, setGridCols] = useState(12); // Default grid columns
  const [gridRows, setGridRows] = useState(10); // Default grid rows
  const [selectedLayout, setSelectedLayout] = useState<TableLayout | null>(null);
  const [isLayoutFetching, setIsLayoutFetching] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  // SPATIAL MAP: Tạo map để lookup nhanh hơn cho getTableAtPosition
  const spatialMapRef = useRef<Map<string, string>>(new Map());

  // Rebuild spatial map when selectedLayout changes
  useEffect(() => {
    const map = new Map<string, string>();
    if (selectedLayout?.tables) {
      for (const table of selectedLayout.tables) {
        if (!table.position) continue;
        
        const tableWidth = table.width || 1;
        const tableHeight = table.height || 1;
        const rotation = table.position.rotation || 0;
        const isRotated = rotation === 90 || rotation === 270;
        const displayWidth = isRotated ? tableHeight : tableWidth;
        const displayHeight = isRotated ? tableWidth : tableHeight;
        
        for (let dy = 0; dy < displayHeight; dy++) {
          for (let dx = 0; dx < displayWidth; dx++) {
            const x = table.position.x + dx;
            const y = table.position.y + dy;
            map.set(`${x},${y}`, table.tableId);
          }
        }
      }
    }
    spatialMapRef.current = map;
  }, [selectedLayout]);

  // MEMOIZED: Grid cells array
  const gridCells = useMemo(() => {
    const cols = selectedLayout?.gridCols ?? 12;
    const rows = selectedLayout?.gridRows ?? 10;
    return Array.from({ length: rows * cols }).map((_, index) => ({
      rowIndex: Math.floor(index / cols),
      colIndex: index % cols,
    }));
  }, [selectedLayout?.gridCols, selectedLayout?.gridRows]);

  // MEMOIZED: Layout table IDs set for faster lookup
  const layoutTableIdsSet = useMemo(() => {
    if (!selectedLayout?.tables) return new Set<string>();
    return new Set(selectedLayout.tables.map(t => t.tableId));
  }, [selectedLayout?.tables]);

  const fetchActiveLayout = async (availableTables: Table[]) => {
    setIsLayoutFetching(true);
    setLayoutError(null);
    try {
      const layout = await getActiveTableLayout();
      console.log('📋 Fetched active layout:', layout);
      
      // Check if layout exists and has tables
      if (layout && layout.tables && Array.isArray(layout.tables) && layout.tables.length > 0) {
        console.log('✅ Using active layout from backend:', layout.name || layout._id);
        setSelectedLayout(layout);
        setGridCols(layout.gridCols ?? 12);
        setGridRows(layout.gridRows ?? 10);
        return;
      }

      // If layout exists but has no tables, log warning
      if (layout && (!layout.tables || layout.tables.length === 0)) {
        console.warn('⚠️ Active layout found but has no tables, using fallback');
      } else if (!layout) {
        console.log('ℹ️ No active layout found, using default layout');
      }

      // Use fallback default layout
      if (availableTables.length > 0) {
        const fallbackLayout = createDefaultLayout(availableTables);
        console.log('📐 Using default fallback layout');
        setSelectedLayout(fallbackLayout);
        setGridCols(fallbackLayout.gridCols ?? 12);
        setGridRows(fallbackLayout.gridRows ?? 10);
        setLayoutError(null);
        return;
      }

      setSelectedLayout(null);
    } catch (error: any) {
      console.error('❌ Error fetching layout:', error);
      // Only show error for actual errors, not for missing endpoint
      const statusCode = error?.response?.status;
      if (statusCode && statusCode !== 404) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Unable to load layout. Using default layout temporarily.';
        setLayoutError(message);
      } else {
        // 404 or missing endpoint - use fallback silently
        setLayoutError(null);
      }
      
      if (availableTables.length > 0) {
        const fallbackLayout = createDefaultLayout(availableTables);
        console.log('📐 Using default fallback layout (error case)');
        setSelectedLayout(fallbackLayout);
        setGridCols(fallbackLayout.gridCols ?? 12);
        setGridRows(fallbackLayout.gridRows ?? 10);
      } else {
        setSelectedLayout(null);
      }
    } finally {
      setIsLayoutFetching(false);
    }
  };

  // Helper: Tạo layout mặc định
  const createDefaultLayout = (tables: Table[]): TableLayout => {
    const tablesPerRow = 4;
    
    const layoutTables = tables.map((table, index) => {
      const row = Math.floor(index / tablesPerRow);
      const col = index % tablesPerRow;
      
      return {
        tableId: table._id,
        tableName: table.tableName,
        position: {
          x: col * 3,
          y: row * 3,
          rotation: 0
        },
        width: 2,
        height: 2,
        type: 'rectangle',
        capacity: 4
      };
    });

    const gridCols = Math.min(tablesPerRow * 3, 12);
    const gridRows = Math.ceil(tables.length / tablesPerRow) * 3;

    return {
      name: 'Default Layout',
      gridCols,
      gridRows,
      tables: layoutTables,
      description: 'Auto-generated layout',
      isActive: true // Layout mặc định luôn là active
    };
  };

  useEffect(() => {
    if (isOpen) {
      // Reset selected layout khi mở modal
      setSelectedLayout(null);
      loadTables();
    }
  }, [isOpen]);

  // Load layout after tables are loaded or modal reopened
  useEffect(() => {
    if (!isOpen) return;
    if (tables.length === 0) return;
    fetchActiveLayout(tables);
  }, [tables, isOpen]);

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await getTables({});
      // Ensure data is always an array
      const tablesArray = Array.isArray(data) ? data : [];
      setTables(tablesArray);
    } catch (error) {
      console.error('Error loading tables:', error);
      setTables([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const checkTableAvailability = useCallback(async (tablesToCheck: Table[]) => {
    try {
      // Get all reservations for the selected date/time
      if (reservationDate && reservationTime) {
        const reservations = await reservationsAPI.getReservations(1, 100);
        
        // Filter reservations for the same date/time slot
        const relevantReservations = reservations.items.filter((res) => {
          if (!res.reservationDate || !res.reservationTime) return false;
          
          const resDate = new Date(res.reservationDate);
          const selectedDate = new Date(`${reservationDate}T${reservationTime}`);
          
          // Check if same date and within 2 hours
          const timeDiff = Math.abs(resDate.getTime() - selectedDate.getTime());
          return timeDiff < 2 * 60 * 60 * 1000 && // Within 2 hours
                 (res.status === 'pending' || res.status === 'confirmed');
        });

        // Create availability map
        const availability: Record<string, TableAvailability> = {};
        
        if (Array.isArray(tablesToCheck)) {
          tablesToCheck.forEach((table) => {
            const reserved = relevantReservations.find(
              (res) => res.table === table.tableName
            );
            
            availability[table._id] = {
              tableId: table._id,
              isAvailable: !reserved && (table.status === 'available' || table.status === 'reserved'),
              isReserved: !!reserved,
              reservedBy: reserved?.customerName,
            };
          });
        }

        setTableAvailability(availability);
      } else {
        // If no date/time, just check current status
        const availability: Record<string, TableAvailability> = {};
        if (Array.isArray(tablesToCheck)) {
          tablesToCheck.forEach((table) => {
            availability[table._id] = {
              tableId: table._id,
              isAvailable: table.status === 'available' || table.status === 'reserved',
              isReserved: table.status === 'occupied',
            };
          });
        }
        setTableAvailability(availability);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      // Fallback: set availability based on table status only
      const availability: Record<string, TableAvailability> = {};
      if (Array.isArray(tablesToCheck)) {
        tablesToCheck.forEach((table) => {
          availability[table._id] = {
            tableId: table._id,
            isAvailable: table.status === 'available' || table.status === 'reserved',
            isReserved: table.status === 'occupied',
          };
        });
      }
      setTableAvailability(availability);
    }
  }, [reservationDate, reservationTime]);

  // Update filtered tables when tables or layout changes
  useEffect(() => {
    if (selectedLayout && tables.length > 0) {
      // Filter tables to only show those in the selected layout
      // Try matching by tableId first, then fallback to tableName
      if (!selectedLayout.tables) return;
      const layoutTableIds = selectedLayout.tables.map(t => t.tableId);
      const layoutTableNames = selectedLayout.tables.map(t => t.tableName);
      
      const filtered = tables.filter(table => {
        // Match by tableId (preferred)
        if (layoutTableIds.includes(table._id)) {
          return true;
        }
        // Fallback: match by tableName if tableId doesn't match
        if (layoutTableNames.includes(table.tableName)) {
          return true;
        }
        return false;
      });
      
      setFilteredTables(filtered);
      // Check availability after filtering
      checkTableAvailability(filtered);
    } else {
      // If no layout, show all tables
      setFilteredTables(tables);
      checkTableAvailability(tables);
    }
  }, [tables, selectedLayout, checkTableAvailability]);

  const handleTableClick = (table: Table) => {
    const availability = tableAvailability[table._id];
    // Allow selection if:
    // 1. Availability check says it's available, OR
    // 2. Availability check hasn't run yet (fallback to table status)
    const isAvailable = availability 
      ? (availability.isAvailable && !availability.isReserved)
      : (table.status === 'available' || table.status === 'reserved');
    
    if (isAvailable && table.status !== 'maintenance') {
      onSelectTable(table._id, table.tableName);
    }
  };

  const getTableColor = (
    table: Table,
    availability: TableAvailability | undefined,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    if (isSelected) {
      return 'bg-amber-500 border-amber-600 text-white shadow-lg ring-2 ring-amber-400 ring-offset-2';
    }
    
    // Fallback to table status if availability check hasn't completed
    const isAvailable = availability 
      ? (availability.isAvailable && !availability.isReserved)
      : (table.status === 'available' || table.status === 'reserved');
    
    if (isHovered && isAvailable) {
      return 'bg-amber-100 border-amber-400 text-amber-900 shadow-md';
    }
    if (!isAvailable || (availability?.isReserved) || table.status === 'occupied') {
      return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed opacity-75';
    }
    if (table.status === 'maintenance') {
      return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-50';
    }
    if (table.status === 'available') {
      return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 cursor-pointer';
    }
    if (table.status === 'reserved') {
      return 'bg-amber-100 border-amber-300 text-amber-800 cursor-pointer';
    }
    return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-50';
  };

  // Helper: Lấy bàn tại vị trí (x, y) từ layout (OPTIMIZED với spatial map)
  const getTableAtPosition = useCallback((x: number, y: number) => {
    if (!selectedLayout || !selectedLayout.tables) return null;
    
    // Use spatial map for O(1) lookup
    const tableId = spatialMapRef.current.get(`${x},${y}`);
    if (tableId) {
      return selectedLayout.tables.find(t => t.tableId === tableId);
    }
    return null;
  }, [selectedLayout]);

  // Helper: Lấy ô chính (top-left) của bàn
  const getTableMainCell = (layoutTable: NonNullable<TableLayout['tables']>[0]) => {
    if (!layoutTable.position) return { x: 0, y: 0 };
    return { x: layoutTable.position.x, y: layoutTable.position.y };
  };

  // Helper: Lấy Table object từ layout table
  // Ưu tiên match theo tableId, chỉ fallback về tableName nếu tableId không có hoặc không match
  const getTableFromLayoutTable = (layoutTable: NonNullable<TableLayout['tables']>[0]): Table | null => {
    // Nếu layoutTable có tableId, chỉ match theo tableId (chính xác hơn)
    if (layoutTable.tableId) {
      const table = filteredTables.find(t => t._id === layoutTable.tableId);
      if (table) return table;
    }
    // Chỉ fallback về tableName nếu không có tableId hoặc không tìm thấy theo tableId
    // Nhưng cần đảm bảo chỉ match 1 bàn duy nhất
    if (layoutTable.tableName) {
      // Tìm tất cả bàn có cùng tên
      const tablesWithSameName = filteredTables.filter(t => t.tableName === layoutTable.tableName);
      // Nếu có nhiều hơn 1 bàn cùng tên, không thể xác định được, return null
      if (tablesWithSameName.length === 1) {
        return tablesWithSameName[0];
      }
      // Nếu có nhiều bàn cùng tên, cần match theo tableId hoặc position để xác định chính xác
      // Trong trường hợp này, nếu layoutTable có tableId nhưng không match, có thể là data không đồng bộ
      // Return null để tránh highlight nhầm
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Chọn bàn</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedLayout && (
                <>
                  Layout: <span className="font-semibold">{selectedLayout.name}</span>
                  {selectedLayout.isActive && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                      ACTIVE
                    </span>
                  )}
                  {' • '}
                </>
              )}
              Số khách: <span className="font-semibold">{numberOfGuests} người</span>
              {reservationDate && reservationTime && (
                <>
                  {' • '}
                  Ngày: <span className="font-semibold">{reservationDate}</span>
                  {' • '}
                  Giờ: <span className="font-semibold">{reservationTime}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchActiveLayout(tables);
              }}
              disabled={isLayoutFetching}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
              title="Reload layout"
            >
              <RotateCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
        {layoutError && (
          <div className="px-6 py-2 bg-yellow-50 border-b border-yellow-100 text-sm text-yellow-700">
            {layoutError} — Using default layout temporarily.
          </div>
        )}

        {/* Legend */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 border-2 border-emerald-300 shadow-sm"></div>
              <span className="text-gray-700 font-medium">Trống - Có thể chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 border-2 border-amber-300 shadow-sm"></div>
              <span className="text-gray-700 font-medium">Đã đặt - Có thể chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-100 border-2 border-red-300 shadow-sm"></div>
              <span className="text-gray-700 font-medium">Đã được chọn - Không thể chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-amber-600 shadow-md"></div>
              <span className="text-gray-700 font-medium">Bàn bạn đã chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-100 border-2 border-gray-300 shadow-sm"></div>
              <span className="text-gray-700 font-medium">Bảo trì</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 border-t-transparent"></div>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có bàn nào
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Hiện tại nhà hàng chưa có bàn nào. Vui lòng liên hệ với nhà hàng để đặt bàn.
              </p>
            </div>
          ) : !selectedLayout ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                <Layout className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Đang tạo layout...
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Hệ thống đang tự động tạo layout cho bạn.
              </p>
            </div>
          ) : (!selectedLayout.tables || selectedLayout.tables.length === 0) ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Layout chưa có bàn
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Layout "{selectedLayout.name}" chưa có bàn nào. Vui lòng liên hệ với nhà hàng.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 overflow-x-auto">
              {/* Screen indicator */}
              <div className="text-center mb-4">
                <div className={SCREEN_INDICATOR.className}>
                  <span className={SCREEN_INDICATOR.textClassName}>{SCREEN_INDICATOR.text}</span>
                </div>
              </div>

              {/* Grid Layout - Đồng bộ với TableLayoutEditor */}
              <div 
                className="grid"
                style={getGridContainerStyle(selectedLayout.gridCols ?? 12, selectedLayout.gridRows ?? 10)}
              >
                {gridCells.map(({ rowIndex, colIndex }) => {
                  const layoutTable = getTableAtPosition(colIndex, rowIndex);
                  const isMainCell = layoutTable && getTableMainCell(layoutTable).x === colIndex && getTableMainCell(layoutTable).y === rowIndex;
                  const isPartOfTable = layoutTable && !isMainCell;

                  // Nếu ô này là một phần của bàn nhưng không phải main cell, render ô trống
                  if (isPartOfTable) {
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="w-12 h-12"
                        style={{ 
                          gridColumn: colIndex + 1,
                          gridRow: rowIndex + 1
                        }}
                      />
                    );
                  }

                  // Tính toán kích thước hiển thị dựa trên rotation
                  let displayWidth = 1;
                  let displayHeight = 1;
                  if (layoutTable && isMainCell) {
                    const tableWidth = layoutTable.width ?? 1;
                    const tableHeight = layoutTable.height ?? 1;
                    const rotation = layoutTable.position?.rotation || 0;
                    
                    const isRotated = rotation === 90 || rotation === 270;
                    displayWidth = isRotated ? tableHeight : tableWidth;
                    displayHeight = isRotated ? tableWidth : tableHeight;
                  }

                  // Lấy Table object từ layout table
                  const table = layoutTable ? getTableFromLayoutTable(layoutTable) : null;
                  const availability = table ? tableAvailability[table._id] : undefined;
                  const isSelected = table ? selectedTableId === table._id : false;
                  const isHovered = table ? hoveredTable === table._id : false;
                  
                  // Xác định có thể chọn không
                  const isSelectable = table ? (availability 
                    ? (availability.isAvailable && !availability.isReserved)
                    : (table.status === 'available' || table.status === 'reserved')) : false;

                  // Sử dụng shared color function
                  const cellColor = layoutTable && isMainCell && table
                    ? getTableCellColor({
                        isMainCell: true,
                        isSelected: isSelected,
                        isHovered: isHovered,
                        isAvailable: isSelectable,
                        isReserved: availability?.isReserved || table.status === 'reserved',
                        isOccupied: table.status === 'occupied',
                        isMaintenance: table.status === 'maintenance',
                        isInEditor: false,
                      })
                    : getEmptyCellColor({
                        isDragOver: false,
                        isSelectable: false,
                        isInZone: false,
                        isInZoneSelection: false,
                      });
                  
                  const cursorStyle = layoutTable && isMainCell && table && isSelectable
                    ? 'cursor-pointer'
                    : 'cursor-default';

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => {
                        if (layoutTable && isMainCell && table && isSelectable) {
                          handleTableClick(table);
                        }
                      }}
                      onMouseEnter={() => {
                        if (layoutTable && isMainCell && table) {
                          setHoveredTable(table._id);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredTable(null);
                      }}
                      className={`${CELL_BASE_CLASSES} ${cellColor} ${cursorStyle}`}
                      style={getCellGridStyle(
                        colIndex,
                        rowIndex,
                        layoutTable && isMainCell ? displayWidth : 1,
                        layoutTable && isMainCell ? displayHeight : 1
                      )}
                      title={
                        layoutTable && isMainCell && table
                          ? `${table.tableName} - ${table.location || 'Chưa có vị trí'}${availability?.isReserved ? ` - Đã được đặt bởi ${availability.reservedBy}` : ''}`
                          : ''
                      }
                    >
                      {layoutTable && isMainCell && table ? (
                        <div
                          className="w-full h-full relative"
                          style={{
                            transform: `rotate(${layoutTable.position?.rotation || 0}deg)`,
                          }}
                        >
                          <div 
                            className="text-xs font-bold absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{
                              transform: `rotate(${-(layoutTable.position?.rotation || 0)}deg)`,
                            }}
                          >
                            {table.tableName}
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 text-white shadow-md" />
                          )}
                          {availability?.isReserved && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <X className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              {selectedTableId && (() => {
                const selectedTable = filteredTables.find(t => t._id === selectedTableId);
                return selectedTable ? (
                  <p className="text-sm text-gray-600">
                    Bàn đã chọn: <span className="font-semibold text-gray-900">{selectedTable.tableName}</span>
                    {selectedTable.location && typeof selectedTable.location === 'string' && (
                      <span className="text-gray-500 ml-2">({selectedTable.location})</span>
                    )}
                  </p>
                ) : null;
              })()}
              {!selectedTableId && (
                <p className="text-sm text-gray-500">
                  Vui lòng chọn một bàn để tiếp tục
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (selectedTableId) {
                    const selectedTable = filteredTables.find(t => t._id === selectedTableId);
                    if (selectedTable) {
                      onSelectTable(selectedTable._id, selectedTable.tableName);
                      onClose();
                    }
                  }
                }}
                disabled={!selectedTableId}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Xác nhận chọn bàn
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
