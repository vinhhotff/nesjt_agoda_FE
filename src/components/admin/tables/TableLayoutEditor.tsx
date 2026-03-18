'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, Save, Plus, Trash2, RotateCw, MapPin } from 'lucide-react';
import { Table, Zone, TableLayout, TableLayoutZone } from '@/src/Types';
import { motion } from 'framer-motion';
import { getZones, createZone } from '@/src/lib/api/zoneApi';
import { updateTable } from '@/src/lib/api';
import { toast } from 'react-toastify';

interface TableLayoutEditorProps {
  layout: TableLayout;
  tables: Table[];
  onSave: (layout: TableLayout) => void;
  onCancel: () => void;
}

// MEMOIZED CELL COMPONENT - Prevents unnecessary re-renders
interface GridCellProps {
  rowIndex: number;
  colIndex: number;
  table: any;
  isSelected: boolean;
  isMainCell: boolean;
  isDragOver: boolean;
  isInZoneSelection: boolean;
  zoneForCell: TableLayoutZone | undefined;
  displayWidth: number;
  displayHeight: number;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
  onDragStartPlaced: (e: React.DragEvent) => void;
  selectedZone: Zone | null;
}

const GridCell = React.memo<GridCellProps>(function GridCell({
  rowIndex,
  colIndex,
  table,
  isMainCell,
  isDragOver,
  isInZoneSelection,
  zoneForCell,
  displayWidth,
  displayHeight,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onDragStartPlaced,
  selectedZone,
}: GridCellProps) {
  if (!table) {
    // Empty cell
    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
        className={`
          rounded-lg border-2 transition-all relative
          ${isInZoneSelection
            ? 'bg-amber-300 border-amber-500 border-dashed'
            : zoneForCell
            ? 'bg-amber-100 border-amber-300'
            : isDragOver
            ? 'bg-amber-200 border-amber-400 border-dashed'
            : 'bg-white border-gray-300 hover:bg-gray-50'
          }
        `}
        style={{
          gridColumn: `${colIndex + 1}`,
          gridRow: `${rowIndex + 1}`,
        }}
      />
    );
  }

  // Table cell
  if (!isMainCell) {
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

  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`
        rounded-lg border-2 transition-all relative
        bg-gradient-to-br from-amber-500 to-orange-500 border-amber-600 text-white cursor-move shadow-md
      `}
      style={{
        gridColumn: `${colIndex + 1} / span ${displayWidth}`,
        gridRow: `${rowIndex + 1} / span ${displayHeight}`,
      }}
      title={`${table.tableName} (${table.width || 1}x${table.height || 1}) - ${table.position?.rotation || 0}° - Khu: ${table.zone || 'Chưa có'} - Kéo để di chuyển, Click để xóa`}
    >
      <div
        draggable
        onDragStart={onDragStartPlaced}
        className="w-full h-full relative"
        style={{
          transform: `rotate(${table.position?.rotation || 0}deg)`,
        }}
      >
        <div
          className="text-xs font-bold absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `rotate(${-(table.position?.rotation || 0)}deg)`,
          }}
        >
          {table.tableName}
        </div>
      </div>
    </div>
  );
});

export default function TableLayoutEditor({
  layout: initialLayout,
  tables,
  onSave,
  onCancel,
}: TableLayoutEditorProps) {
  const [layout, setLayout] = useState<TableLayout>(initialLayout);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [draggedPlacedTable, setDraggedPlacedTable] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ x: number; y: number } | null>(null);
  const [zoneSelectionMode, setZoneSelectionMode] = useState(false);
  const [zoneSelectionStart, setZoneSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [zoneSelectionEnd, setZoneSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [zoneSelectionName, setZoneSelectionName] = useState('');
  const [showZoneSaveModal, setShowZoneSaveModal] = useState(false);

  // SPATIAL MAP: Tạo map để lookup nhanh hơn cho collision detection
  // Key: "x,y" -> Value: table info
  const spatialMapRef = useRef<Map<string, { tableId: string; cells: Array<{x: number; y: number}> }>>(new Map());

  useEffect(() => {
    // Rebuild spatial map khi layout.tables thay đổi
    const map = new Map<string, { tableId: string; cells: Array<{x: number; y: number}> }>();
    if (layout.tables) {
      for (const table of layout.tables) {
        if (!table.position) continue;
        const cells = getTableOccupiedCells(
          table.position.x,
          table.position.y,
          table.width || 1,
          table.height || 1,
          table.position.rotation || 0
        );
        for (const cell of cells) {
          map.set(`${cell.x},${cell.y}`, { tableId: table.tableId, cells });
        }
      }
    }
    spatialMapRef.current = map;
  }, [layout.tables, layout.gridCols, layout.gridRows]);

  // MEMOIZED: Zone lookup cache
  const zoneLookupCacheRef = useRef<Map<string, TableLayoutZone | undefined>>(new Map());

  useEffect(() => {
    // Clear zone cache khi layout.zones thay đổi
    zoneLookupCacheRef.current.clear();
  }, [layout.zones]);

  useEffect(() => {
    setLayout(initialLayout);
    loadZones();
  }, [initialLayout]);

  async function loadZones() {
    try {
      const zonesData = await getZones();
      setZones(Array.isArray(zonesData) ? zonesData : []);
    } catch (error: any) {
      console.error('Error loading zones:', error);
      toast.error('Không thể tải danh sách khu');
    }
  }

  async function handleCreateZone() {
    if (!newZoneName.trim()) {
      toast.error('Vui lòng nhập tên khu');
      return;
    }

    setIsCreatingZone(true);
    try {
      const newZone = await createZone({ name: newZoneName.trim() });
      setZones([...zones, newZone]);
      setSelectedZone(newZone);
      setNewZoneName('');
      setShowZoneModal(false);
      toast.success('Tạo khu thành công!');
    } catch (error: any) {
      console.error('Error creating zone:', error);
      toast.error(error?.response?.data?.message || 'Không thể tạo khu');
    } finally {
      setIsCreatingZone(false);
    }
  }

  // Helper: Tính toán các ô mà bàn chiếm dựa trên position, width, height, và rotation
  const getTableOccupiedCells = (
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number = 0
  ): Array<{ x: number; y: number }> => {
    // Khi xoay 90 hoặc 270 độ, swap width và height
    const isRotated = rotation === 90 || rotation === 270;
    const effectiveWidth = isRotated ? height : width;
    const effectiveHeight = isRotated ? width : height;

    const cells: Array<{ x: number; y: number }> = [];
    for (let dy = 0; dy < effectiveHeight; dy++) {
      for (let dx = 0; dx < effectiveWidth; dx++) {
        cells.push({ x: x + dx, y: y + dy });
      }
    }
    return cells;
  };

  // Helper: Kiểm tra xem có bàn nào đang chiếm các ô này không (OPTIMIZED với spatial map)
  const checkCollision = useCallback((
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number = 0,
    excludeTableId?: string
  ): boolean => {
    const cells = getTableOccupiedCells(x, y, width, height, rotation);

    // Kiểm tra xem các ô có nằm trong grid không
    for (const cell of cells) {
      if (
        cell.x < 0 ||
        cell.y < 0 ||
        (layout.gridCols !== undefined && cell.x >= layout.gridCols) ||
        (layout.gridRows !== undefined && cell.y >= layout.gridRows)
      ) {
        return true; // Vượt quá grid
      }
    }

    // Sử dụng spatial map để kiểm tra collision (O(cells) thay vì O(tables * cells))
    for (const cell of cells) {
      const key = `${cell.x},${cell.y}`;
      const existing = spatialMapRef.current.get(key);
      if (existing && existing.tableId !== excludeTableId) {
        return true; // Có collision
      }
    }

    return false;
  }, [layout.gridCols, layout.gridRows]);

  const handleGridClick = useCallback((x: number, y: number) => {
    if (selectedTable) {
      placeTableAtPosition(selectedTable, x, y);
      setSelectedTable(null);
    }
  }, [selectedTable]);

  const placeTableAtPosition = async (table: Table, x: number, y: number, rotation: number = 0) => {
    const tableWidth = table.width ?? 1;
    const tableHeight = table.height ?? 1;

    // Kiểm tra xem có bàn nào đang chiếm vị trí này không (sử dụng spatial map)
    const existing = layout.tables?.find(t => {
      if (!t.position) return false;
      const cells = getTableOccupiedCells(
        t.position.x,
        t.position.y,
        t.width || 1,
        t.height || 1,
        t.position.rotation || 0
      );
      return cells.some(cell => cell.x === x && cell.y === y);
    });

    if (existing) {
      // Nếu click vào bàn đã có, xóa bàn đó
      setLayout({
        ...layout,
        tables: (layout.tables || []).filter(t => t.tableId !== existing.tableId),
      });
      toast.success(`Đã xóa bàn ${existing.tableName} khỏi layout`);
      return;
    }

    // Kiểm tra collision trước khi thêm (không exclude gì vì đây là bàn mới)
    if (checkCollision(x, y, tableWidth, tableHeight, rotation)) {
      toast.error('Không thể đặt bàn ở vị trí này. Vị trí đã bị chiếm hoặc vượt quá grid.');
      return; // Không làm gì cả, giữ nguyên layout
    }

      // Tự động tìm zone cho vị trí này
      const zoneForPosition = getZoneForCell(x, y);
      const zoneNameToUse = zoneForPosition?.name || selectedZone?.name;

      // Add new table - đảm bảo lưu đúng width và height
      const newTable = {
        tableId: table._id,
        tableName: table.tableName,
        position: { x, y, rotation },
        width: tableWidth, // Lưu width gốc
        height: tableHeight, // Lưu height gốc
        zoneName: zoneNameToUse, // Tự động set zone từ vị trí hoặc zone đã chọn
        type: 'medium',
        capacity: 4,
      };
    
    setLayout({
      ...layout,
      tables: [...(layout.tables || []), newTable],
    });

    // Tự động cập nhật location của bàn trong database
    if (zoneNameToUse) {
      try {
        await updateTable(table._id, { location: zoneNameToUse });
        toast.success(`Đã đặt bàn ${table.tableName} vào khu ${zoneNameToUse}`);
      } catch (error: any) {
        console.error('Error updating table location:', error);
        // Không rollback layout vì bàn đã được thêm vào UI
      }
    } else {
      toast.success(`Đã đặt bàn ${table.tableName}`);
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, table: Table) => {
    setDraggedTable(table);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', table._id);
  }, []);

  const handleDragStartPlaced = useCallback((e: React.DragEvent, tableId: string) => {
    setDraggedPlacedTable(tableId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tableId);
  }, []);

  // Debounced drag over handler - reduce re-renders during drag
  const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Debounce drag over updates to reduce re-renders
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
    }
    dragOverTimeoutRef.current = setTimeout(() => {
      setDragOverCell({ x, y });
    }, 10); // 10ms debounce
  }, []);

  const handleDragLeave = useCallback(() => {
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
    }
    setDragOverCell(null);
  }, []);

  const handleDrop = async (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    setDragOverCell(null);

    if (draggedTable) {
      // Kéo bàn từ danh sách - đặt bàn mới
      await placeTableAtPosition(draggedTable, x, y);
      setDraggedTable(null);
    } else if (draggedPlacedTable) {
      // Di chuyển bàn đã đặt - không tạo bản sao
      if (!layout.tables) return;
      const table = layout.tables.find(t => t.tableId === draggedPlacedTable);
      if (table && table.position) {
        const originalTable = tables.find(t => t._id === table.tableId);
        if (originalTable) {
          // Kiểm tra xem vị trí mới có hợp lệ không (trừ bàn đang di chuyển)
          const tableWidth = originalTable.width ?? 1;
          const tableHeight = originalTable.height ?? 1;
          const rotation = table.position.rotation || 0;
          
          // Kiểm tra collision (exclude bàn đang di chuyển)
          if (checkCollision(x, y, tableWidth, tableHeight, rotation, draggedPlacedTable)) {
            toast.error('Không thể di chuyển bàn đến vị trí này. Vị trí đã bị chiếm hoặc vượt quá grid.');
            setDraggedPlacedTable(null);
            return;
          }

          // Nếu vị trí mới giống vị trí cũ, không làm gì
          if (table.position.x === x && table.position.y === y) {
            setDraggedPlacedTable(null);
            return;
          }

          // Cập nhật vị trí bàn (di chuyển, không tạo mới)
          setLayout({
            ...layout,
            tables: (layout.tables || []).map(t =>
              t.tableId === draggedPlacedTable
                ? {
                    ...t,
                    position: { ...t.position, x, y },
                  }
                : t
            ),
          });

          // Cập nhật location nếu có zone được chọn
          if (selectedZone) {
            try {
              await updateTable(originalTable._id, { location: selectedZone.name });
              toast.success(`Đã di chuyển bàn ${originalTable.tableName} đến vị trí mới`);
            } catch (error: any) {
              console.error('Error updating table location:', error);
            }
          } else {
            toast.success(`Đã di chuyển bàn ${originalTable.tableName}`);
          }
        }
      }
      setDraggedPlacedTable(null);
    }
  };

  const handleRemoveTable = useCallback((tableId: string) => {
    setLayout(prev => ({
      ...prev,
      tables: (prev.tables || []).filter(t => t.tableId !== tableId),
    }));
  }, []);

  const handleRotateTable = useCallback((tableId: string) => {
    setLayout(prev => {
      // Find the table first to check collision
      const table = (prev.tables || []).find(t => t.tableId === tableId && t.position);
      if (!table) return prev;

      const currentRotation = table.position.rotation || 0;
      const newRotation = (currentRotation + 90) % 360;
      const tableWidth = table.width || 1;
      const tableHeight = table.height || 1;

      // Check collision before rotating
      if (checkCollision(table.position.x, table.position.y, tableWidth, tableHeight, newRotation, tableId)) {
        alert('Không thể xoay bàn ở vị trí này. Vị trí sau khi xoay sẽ bị collision.');
        return prev;
      }

      return {
        ...prev,
        tables: (prev.tables || []).map(t =>
          t.tableId === tableId && t.position
            ? { ...t, position: { ...t.position, rotation: newRotation } }
            : t
        ),
      };
    });
  }, [checkCollision]);

  // Helper: Lấy bàn tại vị trí (OPTIMIZED với spatial map)
  const getTableAtPosition = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    const existing = spatialMapRef.current.get(key);
    if (existing && layout.tables) {
      return layout.tables.find(t => t.tableId === existing.tableId);
    }
    return undefined;
  }, [layout.tables]);

  // Helper: Lấy ô chính (top-left) của bàn
  const getTableMainCell = (table: NonNullable<TableLayout['tables']>[0]) => {
    if (!table.position) return { x: 0, y: 0 };
    return { x: table.position.x, y: table.position.y };
  };

  // Helper: Kiểm tra xem một ô có nằm trong zone không
  const isCellInZone = (x: number, y: number, zone: NonNullable<TableLayout['zones']>[0]) => {
    if (!zone.bounds) return false;
    const { x1, y1, x2, y2 } = zone.bounds;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  };

  // Helper: Lấy zone mà một ô thuộc về (OPTIMIZED với cache)
  const getZoneForCell = useCallback((x: number, y: number): TableLayoutZone | undefined => {
    if (!layout.zones) return undefined;
    
    const key = `${x},${y}`;
    
    // Check cache first
    if (zoneLookupCacheRef.current.has(key)) {
      return zoneLookupCacheRef.current.get(key);
    }
    
    // Find zone and cache result
    const zone = layout.zones.find(z => isCellInZone(x, y, z));
    zoneLookupCacheRef.current.set(key, zone);
    return zone;
  }, [layout.zones]);

  // Debounced zone selection move
  const zoneMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleZoneSelectionStart = useCallback((x: number, y: number) => {
    if (zoneSelectionMode) {
      setZoneSelectionStart({ x, y });
      setZoneSelectionEnd({ x, y });
    }
  }, [zoneSelectionMode]);

  const handleZoneSelectionMove = useCallback((x: number, y: number) => {
    if (zoneSelectionMode && zoneSelectionStart) {
      // Debounce zone selection moves
      if (zoneMoveTimeoutRef.current) {
        clearTimeout(zoneMoveTimeoutRef.current);
      }
      zoneMoveTimeoutRef.current = setTimeout(() => {
        setZoneSelectionEnd({ x, y });
      }, 16); // ~60fps
    }
  }, [zoneSelectionMode, zoneSelectionStart]);

  const handleZoneSelectionEnd = useCallback(() => {
    if (zoneMoveTimeoutRef.current) {
      clearTimeout(zoneMoveTimeoutRef.current);
    }
    if (zoneSelectionMode && zoneSelectionStart && zoneSelectionEnd) {
      if (zoneSelectionStart.x !== zoneSelectionEnd.x || zoneSelectionStart.y !== zoneSelectionEnd.y) {
        setShowZoneSaveModal(true);
      } else {
        setZoneSelectionStart(null);
        setZoneSelectionEnd(null);
      }
    }
  }, [zoneSelectionMode, zoneSelectionStart, zoneSelectionEnd]);

  const handleSaveZoneSelection = async () => {
    if (!zoneSelectionStart || !zoneSelectionEnd || !zoneSelectionName.trim()) {
      toast.error('Vui lòng nhập tên khu');
      return;
    }

    // Kiểm tra xem zone name đã tồn tại chưa
    const existingZone = zones.find(z => z.name === zoneSelectionName.trim());
    if (!existingZone) {
      // Tạo zone mới trong database
      try {
        const newZone = await createZone({ name: zoneSelectionName.trim() });
        setZones([...zones, newZone]);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Không thể tạo khu');
        return;
      }
    }

    // Lưu zone vào layout
    const zoneBounds = {
      x1: Math.min(zoneSelectionStart.x, zoneSelectionEnd.x),
      y1: Math.min(zoneSelectionStart.y, zoneSelectionEnd.y),
      x2: Math.max(zoneSelectionStart.x, zoneSelectionEnd.x),
      y2: Math.max(zoneSelectionStart.y, zoneSelectionEnd.y),
    };

    const newZone: TableLayoutZone = {
      _id: zones.find(z => z.name === zoneSelectionName.trim())?._id || Date.now().toString(),
      name: zoneSelectionName.trim(),
      bounds: zoneBounds,
    };

    setLayout({
      ...layout,
      zones: [...(layout.zones || []), newZone],
    });

    toast.success(`Đã tạo khu ${zoneSelectionName.trim()}`);
    setZoneSelectionMode(false);
    setZoneSelectionStart(null);
    setZoneSelectionEnd(null);
    setZoneSelectionName('');
    setShowZoneSaveModal(false);
  };

  const availableTables = useMemo(() => 
    (Array.isArray(tables) ? tables : []).filter(
      table => !(layout.tables || []).some(lt => lt.tableId === table._id)
    ), [tables, layout.tables]);

  // MEMOIZED: Grid cells array
  const gridCells = useMemo(() => {
    const cols = layout.gridCols ?? 10;
    const rows = layout.gridRows ?? 10;
    return Array.from({ length: rows * cols }).map((_, index) => ({
      rowIndex: Math.floor(index / cols),
      colIndex: index % cols,
    }));
  }, [layout.gridCols, layout.gridRows]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {layout._id ? 'Sửa layout' : 'Tạo layout mới'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Layout Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên layout *
          </label>
          <input
            type="text"
            value={layout.name}
            onChange={(e) => setLayout({ ...layout, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            placeholder="VD: Tầng 1, Khu VIP..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <input
            type="text"
            value={layout.description || ''}
            onChange={(e) => setLayout({ ...layout, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            placeholder="Mô tả về layout..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số cột (Grid Columns)
          </label>
          <input
            type="number"
            min="4"
            max="30"
            value={layout.gridCols ?? 12}
            onChange={(e) =>
              setLayout({ ...layout, gridCols: parseInt(e.target.value) || 12 })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số hàng (Grid Rows)
          </label>
          <input
            type="number"
            min="4"
            max="30"
            value={layout.gridRows ?? 10}
            onChange={(e) =>
              setLayout({ ...layout, gridRows: parseInt(e.target.value) || 10 })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Zone Selector */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Quản lý khu vực
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setZoneSelectionMode(!zoneSelectionMode);
                if (zoneSelectionMode) {
                  setZoneSelectionStart(null);
                  setZoneSelectionEnd(null);
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                zoneSelectionMode
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md'
              }`}
            >
              {zoneSelectionMode ? 'Hủy chọn khu' : 'Chọn khu trên grid'}
            </button>
            <button
              onClick={() => setShowZoneModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm shadow-md"
            >
              <Plus className="w-4 h-4" />
              Tạo khu mới
            </button>
          </div>
        </div>
        {zoneSelectionMode && (
          <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Hướng dẫn:</strong> Kéo từ ô này đến ô khác trên grid để chọn vùng khu, sau đó nhấn Save để tạo khu.
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {zones.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có khu nào. Tạo khu mới hoặc chọn khu trên grid để bắt đầu.</p>
          ) : (
            zones.map((zone) => (
              <button
                key={zone._id}
                onClick={() => setSelectedZone(zone)}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                  selectedZone?._id === zone._id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {zone.name}
              </button>
            ))
          )}
        </div>
        {selectedZone && !zoneSelectionMode && (
          <p className="text-sm text-gray-600 mt-2">
            Đã chọn: <span className="font-semibold">{selectedZone.name}</span> - Bàn đặt vào sẽ tự động thuộc khu này
          </p>
        )}
        {layout.zones && layout.zones.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Các khu đã tạo trên grid:</p>
            <div className="flex flex-wrap gap-2">
              {layout.zones.map((zone, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-300"
                >
                  {zone.name} {(zone.bounds ? `(${(zone.bounds.x2 - zone.bounds.x1 + 1)}x${zone.bounds.y2 - zone.bounds.y1 + 1})` : '')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Tables */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Danh sách bàn
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableTables.length === 0 ? (
              <p className="text-sm text-gray-500">
                Tất cả bàn đã được thêm vào layout
              </p>
            ) : (
              availableTables.map((table) => (
                <div
                  key={table._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, table)}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all cursor-move ${
                    selectedTable?._id === table._id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <span>📋</span>
                    <span>{table.tableName}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {typeof table.location === 'string' 
                      ? table.location 
                      : table.location 
                        ? `(${table.location.x}, ${table.location.y})`
                        : 'Chưa có vị trí'} • {table.width || 1}x{table.height || 1} ô
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Kéo thả vào grid để đặt bàn</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Grid Editor */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Kéo thả bàn vào vị trí
            </h3>
            <p className="text-sm text-gray-500">
              {selectedTable
                ? `Đã chọn: ${selectedTable.tableName} (${selectedTable.width || 1}x${selectedTable.height || 1}) - Kéo thả hoặc click vào ô để đặt bàn`
                : 'Kéo thả bàn từ danh sách bên trái vào grid, hoặc click chọn bàn rồi click vào ô'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 overflow-x-auto">
            {/* Screen indicator */}
            <div className="text-center mb-4">
              <div className="inline-block bg-gradient-to-r from-gray-200 to-gray-300 px-8 py-2 rounded-lg">
                <span className="text-sm font-semibold text-gray-600">
                  KHU VỰC PHỤC VỤ
                </span>
              </div>
            </div>

            {/* Grid */}
            <div 
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${layout.gridCols ?? 10}, 48px)`,
                gridTemplateRows: `repeat(${layout.gridRows ?? 10}, 48px)`,
                width: 'fit-content',
                margin: '0 auto'
              }}
            >
              {gridCells.map(({ rowIndex, colIndex }) => {
                const table = getTableAtPosition(colIndex, rowIndex);
                const isSelected = selectedTable !== null;
                const isMainCell = table && getTableMainCell(table).x === colIndex && getTableMainCell(table).y === rowIndex;
                const isPartOfTable = table && !isMainCell;

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
                if (table && isMainCell) {
                  const originalTable = tables.find(t => t._id === table.tableId);
                  const tableWidth = table.width ?? originalTable?.width ?? 1;
                  const tableHeight = table.height ?? originalTable?.height ?? 1;
                  const rotation = table.position?.rotation || 0;
                  
                  const isRotated = rotation === 90 || rotation === 270;
                  displayWidth = isRotated ? tableHeight : tableWidth;
                  displayHeight = isRotated ? tableWidth : tableHeight;
                }

                const isDragOver = dragOverCell?.x === colIndex && dragOverCell?.y === rowIndex;
                
                // Kiểm tra xem ô này có trong vùng chọn zone không
                const isInZoneSelection = zoneSelectionMode && zoneSelectionStart && zoneSelectionEnd && (
                  (colIndex >= Math.min(zoneSelectionStart.x, zoneSelectionEnd.x) &&
                   colIndex <= Math.max(zoneSelectionStart.x, zoneSelectionEnd.x) &&
                   rowIndex >= Math.min(zoneSelectionStart.y, zoneSelectionEnd.y) &&
                   rowIndex <= Math.max(zoneSelectionStart.y, zoneSelectionEnd.y))
                );
                
                // Kiểm tra xem ô này có thuộc zone nào không
                const zoneForCell = getZoneForCell(colIndex, rowIndex);

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onMouseDown={() => zoneSelectionMode && handleZoneSelectionStart(colIndex, rowIndex)}
                    onMouseEnter={() => zoneSelectionMode && handleZoneSelectionMove(colIndex, rowIndex)}
                    onMouseUp={() => zoneSelectionMode && handleZoneSelectionEnd()}
                    onDragOver={(e) => !zoneSelectionMode && handleDragOver(e, colIndex, rowIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => !zoneSelectionMode && handleDrop(e, colIndex, rowIndex)}
                    onClick={() => !zoneSelectionMode && handleGridClick(colIndex, rowIndex)}
                    className={`
                      rounded-lg border-2 transition-all relative
                      ${
                        table && isMainCell
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-600 text-white cursor-move shadow-md'
                          : isInZoneSelection
                          ? 'bg-amber-300 border-amber-500 border-dashed'
                          : zoneForCell
                          ? 'bg-amber-100 border-amber-300'
                          : isDragOver
                          ? 'bg-amber-200 border-amber-400 border-dashed'
                          : isSelected
                          ? 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200 cursor-pointer'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    style={{
                      gridColumn: table && isMainCell ? `${colIndex + 1} / span ${displayWidth}` : `${colIndex + 1}`,
                      gridRow: table && isMainCell ? `${rowIndex + 1} / span ${displayHeight}` : `${rowIndex + 1}`,
                    }}
                    title={
                      table && isMainCell
                        ? `${table.tableName} (${table.width || 1}x${table.height || 1}) - ${table.position?.rotation || 0}° - Khu: ${table.zone || 'Chưa có'} - Kéo để di chuyển, Click để xóa`
                        : isInZoneSelection
                        ? 'Vùng đang chọn cho khu'
                        : zoneForCell
                        ? `Khu: ${zoneForCell.name} - Bàn đặt vào đây sẽ tự động thuộc khu này`
                        : isDragOver
                        ? 'Thả bàn vào đây'
                        : isSelected
                        ? `Click hoặc kéo thả để đặt ${selectedTable?.tableName} (${selectedTable?.width || 1}x${selectedTable?.height || 1})`
                        : zoneSelectionMode
                        ? 'Kéo để chọn vùng khu'
                        : ''
                    }
                  >
                    {table && isMainCell ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStartPlaced(e, table.tableId || '')}
                        className="w-full h-full relative"
                        style={{
                          transform: `rotate(${table.position?.rotation || 0}deg)`, // Xoay container/background
                        }}
                      >
                        <div 
                          className="text-xs font-bold absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{
                            transform: `rotate(${-(table.position?.rotation || 0)}deg)`, // Xoay ngược lại để text giữ nguyên hướng
                          }}
                        >
                          {table.tableName}
                        </div>
                      </div>
                    ) : isDragOver ? (
                      <div className="text-xs text-blue-600 font-semibold absolute inset-0 flex items-center justify-center">
                        Thả vào đây
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Placed Tables List */}
          {(layout.tables || []).length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Bàn đã đặt ({(layout.tables || []).length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(layout.tables || []).map((lt) => {
                  const table = tables.find(t => t._id === lt.tableId);
                  return (
                    <div
                      key={lt.tableId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-semibold text-gray-900">
                          {lt.tableName}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {lt.position ? `(${lt.position.x}, ${lt.position.y}) - ${lt.width || 1}x${lt.height || 1} - ${lt.position.rotation || 0}°` : `N/A - ${lt.width || 1}x${lt.height || 1}`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => lt.tableId && handleRotateTable(lt.tableId)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Xoay bàn"
                          disabled={!lt.tableId}
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => lt.tableId && handleRemoveTable(lt.tableId)}
                          disabled={!lt.tableId}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa bàn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={() => onSave(layout)}
          disabled={!layout.name || (layout.tables || []).length === 0}
          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          <Save className="w-5 h-5" />
          Lưu layout
        </button>
      </div>

      {/* Zone Creation Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Tạo khu mới</h2>
              <button
                onClick={() => {
                  setShowZoneModal(false);
                  setNewZoneName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Khu A, Khu B, VIP, Sân vườn..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateZone();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowZoneModal(false);
                    setNewZoneName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateZone}
                  disabled={isCreatingZone || !newZoneName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isCreatingZone ? 'Đang tạo...' : 'Tạo khu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Save Modal (sau khi chọn vùng trên grid) */}
      {showZoneSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Lưu khu vực</h2>
              <button
                onClick={() => {
                  setShowZoneSaveModal(false);
                  setZoneSelectionName('');
                  setZoneSelectionStart(null);
                  setZoneSelectionEnd(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {zoneSelectionStart && zoneSelectionEnd && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-700">
                    Vùng đã chọn: ({Math.min(zoneSelectionStart.x, zoneSelectionEnd.x)}, {Math.min(zoneSelectionStart.y, zoneSelectionEnd.y)}) 
                    đến ({Math.max(zoneSelectionStart.x, zoneSelectionEnd.x)}, {Math.max(zoneSelectionStart.y, zoneSelectionEnd.y)})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Kích thước: {Math.abs(zoneSelectionEnd.x - zoneSelectionStart.x) + 1} x {Math.abs(zoneSelectionEnd.y - zoneSelectionStart.y) + 1} ô
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khu <span className="text-red-500">*</span>
                </label>
                <select
                  value={zoneSelectionName}
                  onChange={(e) => setZoneSelectionName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                >
                  <option value="">-- Chọn hoặc nhập tên khu --</option>
                  {zones.map((zone) => (
                    <option key={zone._id} value={zone.name}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={!zones.find(z => z.name === zoneSelectionName) ? zoneSelectionName : ''}
                  onChange={(e) => setZoneSelectionName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hoặc nhập tên khu mới..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveZoneSelection();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowZoneSaveModal(false);
                    setZoneSelectionName('');
                    setZoneSelectionStart(null);
                    setZoneSelectionEnd(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveZoneSelection}
                  disabled={!zoneSelectionName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Lưu khu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

