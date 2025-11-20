'use client';

import { useState, useEffect } from 'react';
import { X, Check, Users, MapPin, RotateCw, Layout } from 'lucide-react';
import { Table } from '@/src/Types';
import { getTables } from '@/src/lib/api';
import { reservationsAPI } from '@/src/lib/api/reservationsApi';
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
import { debugLayouts } from '@/src/lib/utils/debugLayout';

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

  // Load active layout from localStorage or create default
  const loadActiveLayout = (availableTables: Table[]): TableLayout | null => {
    try {
      const saved = localStorage.getItem('table-layouts');
      
      // Nếu có layouts trong localStorage
      if (saved) {
        let layouts: TableLayout[] = JSON.parse(saved);
        console.log('✅ Loaded layouts from localStorage:', {
          layoutsCount: layouts.length,
          layouts: layouts.map(l => ({ name: l.name, isActive: l.isActive, tablesCount: l.tables.length }))
        });
        
        // 🔧 FIX: Nếu có "Default Layout" và có layouts khác, xóa "Default Layout"
        const hasDefaultLayout = layouts.some(l => l.name === 'Default Layout');
        const hasOtherLayouts = layouts.some(l => l.name !== 'Default Layout');
        
        if (hasDefaultLayout && hasOtherLayouts) {
          console.log('🔧 Removing "Default Layout" because other layouts exist');
          layouts = layouts.filter(l => l.name !== 'Default Layout');
          // Ensure at least one layout is active
          const hasActive = layouts.some(l => l.isActive === true);
          if (!hasActive && layouts.length > 0) {
            layouts[0].isActive = true;
          }
          // Save cleaned layouts
          localStorage.setItem('table-layouts', JSON.stringify(layouts));
          console.log('✅ Cleaned layouts:', layouts.map(l => ({ name: l.name, isActive: l.isActive })));
        }
        
        // Tìm layout có isActive = true
        const activeLayouts = layouts.filter(l => l.isActive === true);
        
        // 🔧 FIX: Nếu có nhiều hơn 1 layout active, chỉ giữ layout đầu tiên (không phải Default Layout)
        if (activeLayouts.length > 1) {
          console.log('⚠️ Multiple active layouts found, fixing...');
          const preferredActive = activeLayouts.find(l => l.name !== 'Default Layout') || activeLayouts[0];
          layouts.forEach(l => {
            l.isActive = (l._id === preferredActive._id);
          });
          localStorage.setItem('table-layouts', JSON.stringify(layouts));
          console.log('✅ Fixed multiple active layouts, selected:', preferredActive.name);
          return preferredActive;
        }
        
        if (activeLayouts.length === 1) {
          console.log('✅ Found active layout:', activeLayouts[0].name);
          return activeLayouts[0];
        }
        
        // Fallback: nếu không có layout nào active, ưu tiên layout không phải "Default Layout"
        if (layouts.length > 0) {
          console.log('⚠️ No active layout found, selecting best layout...');
          const nonDefaultLayout = layouts.find(l => l.name !== 'Default Layout');
          const selectedLayout = nonDefaultLayout || layouts[0];
          
          // Set selected layout as active
          layouts.forEach(l => {
            l.isActive = (l._id === selectedLayout._id);
          });
          localStorage.setItem('table-layouts', JSON.stringify(layouts));
          console.log('✅ Set active layout:', selectedLayout.name);
          return selectedLayout;
        }
      }
      
      // CHỈ tạo default layout nếu KHÔNG CÓ layout nào trong localStorage
      console.log('⚠️ No layouts found in localStorage, creating default...');
      if (availableTables.length > 0) {
        console.log('📝 Creating default layout with', availableTables.length, 'tables');
        const defaultLayout = createDefaultLayout(availableTables);
        localStorage.setItem('table-layouts', JSON.stringify([defaultLayout]));
        console.log('✅ Default layout created and saved');
        return defaultLayout;
      }
      
      console.log('❌ No tables available to create default layout');
    } catch (error) {
      console.error('❌ Error loading layout:', error);
    }
    return null;
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
      console.log('🔵 Modal opened, loading tables...');
      console.log('🔍 Current layouts in localStorage:');
      debugLayouts();
      // Reset selected layout khi mở modal
      setSelectedLayout(null);
      loadTables();
    }
  }, [isOpen]);

  // Load layout after tables are loaded
  useEffect(() => {
    if (tables.length > 0 && !selectedLayout) {
      console.log('🔵 Tables loaded, loading active layout...', tables.length, 'tables');
      const layout = loadActiveLayout(tables);
      console.log('🔵 Active layout loaded:', layout ? {
        name: layout.name,
        isActive: layout.isActive,
        tablesCount: layout.tables.length,
        gridSize: `${layout.gridCols}x${layout.gridRows}`
      } : 'null');
      setSelectedLayout(layout);
      if (layout) {
        setGridCols(layout.gridCols);
        setGridRows(layout.gridRows);
      }
    }
  }, [tables, selectedLayout]);

  // Update filtered tables when tables or layout changes
  useEffect(() => {
    if (selectedLayout && tables.length > 0) {
      // Filter tables to only show those in the selected layout
      // Try matching by tableId first, then fallback to tableName
      const layoutTableIds = selectedLayout.tables.map(t => t.tableId);
      const layoutTableNames = selectedLayout.tables.map(t => t.tableName);
      
      console.log('Filtering tables:', {
        layoutName: selectedLayout.name,
        layoutTablesCount: selectedLayout.tables.length,
        layoutTableIds: layoutTableIds,
        layoutTableNames: layoutTableNames,
        allTablesCount: tables.length,
        allTableIds: tables.map(t => t._id),
        allTableNames: tables.map(t => t.tableName)
      });
      
      const filtered = tables.filter(table => {
        // Match by tableId (preferred)
        if (layoutTableIds.includes(table._id)) {
          return true;
        }
        // Fallback: match by tableName if tableId doesn't match
        if (layoutTableNames.includes(table.tableName)) {
          console.log(`Table ${table.tableName} matched by name (tableId mismatch)`);
          return true;
        }
        return false;
      });
      
      console.log('Filtered tables:', {
        filteredCount: filtered.length,
        filteredTableNames: filtered.map(t => t.tableName),
        filteredTableIds: filtered.map(t => t._id)
      });
      
      setFilteredTables(filtered);
      // Check availability after filtering
      checkTableAvailability(filtered);
    } else {
      // If no layout, show all tables
      console.log('No layout selected, showing all tables:', tables.length);
      setFilteredTables(tables);
      checkTableAvailability(tables);
    }
  }, [tables, selectedLayout, reservationDate, reservationTime]);

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

  const checkTableAvailability = async (tablesToCheck: Table[]) => {
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
  };

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

  // Helper: Lấy bàn tại vị trí (x, y) từ layout
  const getTableAtPosition = (x: number, y: number) => {
    if (!selectedLayout) return null;
    
    return selectedLayout.tables.find((lt) => {
      const mainX = lt.position.x;
      const mainY = lt.position.y;
      const tableWidth = lt.width || 1;
      const tableHeight = lt.height || 1;
      const rotation = lt.position.rotation || 0;
      
      // Tính toán kích thước hiển thị dựa trên rotation
      const isRotated = rotation === 90 || rotation === 270;
      const displayWidth = isRotated ? tableHeight : tableWidth;
      const displayHeight = isRotated ? tableWidth : tableHeight;
      
      // Kiểm tra xem (x, y) có nằm trong vùng của bàn không
      return x >= mainX && x < mainX + displayWidth && y >= mainY && y < mainY + displayHeight;
    });
  };

  // Helper: Lấy ô chính (top-left) của bàn
  const getTableMainCell = (layoutTable: TableLayout['tables'][0]) => {
    return { x: layoutTable.position.x, y: layoutTable.position.y };
  };

  // Helper: Lấy Table object từ layout table
  const getTableFromLayoutTable = (layoutTable: TableLayout['tables'][0]): Table | null => {
    return filteredTables.find(t => t._id === layoutTable.tableId || t.tableName === layoutTable.tableName) || null;
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
                console.log('🔄 Reloading layout...');
                const layout = loadActiveLayout(tables);
                setSelectedLayout(layout);
                if (layout) {
                  setGridCols(layout.gridCols);
                  setGridRows(layout.gridRows);
                }
              }}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
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
          ) : selectedLayout.tables.length === 0 ? (
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
                style={getGridContainerStyle(selectedLayout.gridCols, selectedLayout.gridRows)}
              >
                {Array.from({ length: selectedLayout.gridRows * selectedLayout.gridCols }).map((_, index) => {
                  const rowIndex = Math.floor(index / selectedLayout.gridCols);
                  const colIndex = index % selectedLayout.gridCols;
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
                    const rotation = layoutTable.position.rotation || 0;
                    
                    const isRotated = rotation === 90 || rotation === 270;
                    displayWidth = isRotated ? tableHeight : tableWidth;
                    displayHeight = isRotated ? tableWidth : tableHeight;
                  }

                  // Lấy Table object từ layout table
                  const table = layoutTable ? getTableFromLayoutTable(layoutTable) : null;
                  const availability = table ? tableAvailability[table._id] : undefined;
                  const isSelected = table && selectedTableId === table._id;
                  const isHovered = table && hoveredTable === table._id;
                  
                  // Xác định có thể chọn không
                  const isSelectable = table && (availability 
                    ? (availability.isAvailable && !availability.isReserved)
                    : (table.status === 'available' || table.status === 'reserved') && table.status !== 'maintenance');

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
                            transform: `rotate(${layoutTable.position.rotation || 0}deg)`,
                          }}
                        >
                          <div 
                            className="text-xs font-bold absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{
                              transform: `rotate(${-(layoutTable.position.rotation || 0)}deg)`,
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
                    {selectedTable.location && (
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
