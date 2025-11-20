'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, RotateCw, MapPin } from 'lucide-react';
import { Table, Zone } from '@/src/Types';
import { motion } from 'framer-motion';
import { getZones, createZone } from '@/src/lib/api/zoneApi';
import { updateTable } from '@/src/lib/api';
import { toast } from 'react-toastify';

interface TableLayout {
  _id?: string;
  name: string;
  gridCols: number;
  gridRows: number;
  zones?: {
    zoneId: string;
    zoneName: string;
    bounds: { x1: number; y1: number; x2: number; y2: number }; // Vùng của khu
  }[];
  tables: {
    tableId: string;
    tableName: string;
    position: { x: number; y: number; rotation?: number };
    width?: number; // Kích thước gốc của bàn
    height?: number; // Kích thước gốc của bàn
    zoneName?: string; // Tên khu mà bàn thuộc về
    type?: string;
    capacity?: number;
  }[];
  backgroundImage?: string;
  description?: string;
}

interface TableLayoutEditorProps {
  layout: TableLayout;
  tables: Table[];
  onSave: (layout: TableLayout) => void;
  onCancel: () => void;
}

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

  // Helper: Kiểm tra xem có bàn nào đang chiếm các ô này không
  const checkCollision = (
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
        cell.x >= layout.gridCols ||
        cell.y >= layout.gridRows
      ) {
        return true; // Vượt quá grid
      }
    }

    // Kiểm tra collision với các bàn khác
    for (const table of layout.tables) {
      if (excludeTableId && table.tableId === excludeTableId) continue;

      const tableWidth = table.width || 1;
      const tableHeight = table.height || 1;
      const tableRotation = table.position.rotation || 0;
      const tableCells = getTableOccupiedCells(
        table.position.x,
        table.position.y,
        tableWidth,
        tableHeight,
        tableRotation
      );

      // Kiểm tra xem có ô nào trùng không
      for (const cell of cells) {
        if (tableCells.some(tc => tc.x === cell.x && tc.y === cell.y)) {
          return true; // Có collision
        }
      }
    }

    return false;
  };

  const handleGridClick = (x: number, y: number) => {
    if (selectedTable) {
      placeTableAtPosition(selectedTable, x, y);
      setSelectedTable(null);
    }
  };

  const placeTableAtPosition = async (table: Table, x: number, y: number, rotation: number = 0) => {
    // Đảm bảo lấy width và height từ table object
    const tableWidth = table.width ?? 1;
    const tableHeight = table.height ?? 1;
    
    console.log('placeTableAtPosition:', {
      tableName: table.tableName,
      tableWidth,
      tableHeight,
      tableObject: table
    });

    // Kiểm tra xem có bàn nào đang chiếm vị trí này không
    const existing = layout.tables.find(t => {
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
        tables: layout.tables.filter(t => t.tableId !== existing.tableId),
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
      const zoneNameToUse = zoneForPosition?.zoneName || selectedZone?.name;

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
    
    console.log('Placing table:', {
      tableName: table.tableName,
      width: tableWidth,
      height: tableHeight,
      position: { x, y, rotation },
      newTable
    });
    
    setLayout({
      ...layout,
      tables: [...layout.tables, newTable],
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

  const handleDragStart = (e: React.DragEvent, table: Table) => {
    setDraggedTable(table);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', table._id);
  };

  const handleDragStartPlaced = (e: React.DragEvent, tableId: string) => {
    setDraggedPlacedTable(tableId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tableId);
  };

  const handleDragOver = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ x, y });
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = async (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    setDragOverCell(null);

    if (draggedTable) {
      // Kéo bàn từ danh sách - đặt bàn mới
      await placeTableAtPosition(draggedTable, x, y);
      setDraggedTable(null);
    } else if (draggedPlacedTable) {
      // Di chuyển bàn đã đặt - không tạo bản sao
      const table = layout.tables.find(t => t.tableId === draggedPlacedTable);
      if (table) {
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
            tables: layout.tables.map(t =>
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

  const handleRemoveTable = (tableId: string) => {
    setLayout({
      ...layout,
      tables: layout.tables.filter(t => t.tableId !== tableId),
    });
  };

  const handleRotateTable = (tableId: string) => {
    setLayout({
      ...layout,
      tables: layout.tables.map(t => {
        if (t.tableId !== tableId) return t;

        const currentRotation = t.position.rotation || 0;
        const newRotation = (currentRotation + 90) % 360;
        const tableWidth = t.width || 1;
        const tableHeight = t.height || 1;

        // Tính toán effective width/height sau khi xoay
        // Mỗi lần xoay 90°: swap width và height
        const isRotated = newRotation === 90 || newRotation === 270;
        const effectiveWidth = isRotated ? tableHeight : tableWidth;
        const effectiveHeight = isRotated ? tableWidth : tableHeight;

        // Kiểm tra collision sau khi xoay
        if (checkCollision(t.position.x, t.position.y, tableWidth, tableHeight, newRotation, tableId)) {
          alert('Không thể xoay bàn ở vị trí này. Vị trí sau khi xoay sẽ bị collision.');
          return t;
        }

        return {
          ...t,
          position: {
            ...t.position,
            rotation: newRotation,
          },
        };
      }),
    });
  };

  const getTableAtPosition = (x: number, y: number) => {
    return layout.tables.find(t => {
      const cells = getTableOccupiedCells(
        t.position.x,
        t.position.y,
        t.width || 1,
        t.height || 1,
        t.position.rotation || 0
      );
      return cells.some(cell => cell.x === x && cell.y === y);
    });
  };

  // Helper: Lấy ô chính (top-left) của bàn
  const getTableMainCell = (table: TableLayout['tables'][0]) => {
    return { x: table.position.x, y: table.position.y };
  };

  // Helper: Kiểm tra xem một ô có nằm trong zone không
  const isCellInZone = (x: number, y: number, zone: NonNullable<TableLayout['zones']>[0]) => {
    const { x1, y1, x2, y2 } = zone.bounds;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  };

  // Helper: Lấy zone mà một ô thuộc về
  const getZoneForCell = (x: number, y: number): TableLayout['zones'][0] | undefined => {
    if (!layout.zones) return undefined;
    return layout.zones.find(zone => isCellInZone(x, y, zone));
  };

  const handleZoneSelectionStart = (x: number, y: number) => {
    if (zoneSelectionMode) {
      setZoneSelectionStart({ x, y });
      setZoneSelectionEnd({ x, y });
    }
  };

  const handleZoneSelectionMove = (x: number, y: number) => {
    if (zoneSelectionMode && zoneSelectionStart) {
      setZoneSelectionEnd({ x, y });
    }
  };

  const handleZoneSelectionEnd = () => {
    if (zoneSelectionMode && zoneSelectionStart && zoneSelectionEnd) {
      // Kiểm tra xem có vùng được chọn không
      if (zoneSelectionStart.x !== zoneSelectionEnd.x || zoneSelectionStart.y !== zoneSelectionEnd.y) {
        setShowZoneSaveModal(true);
      } else {
        // Reset nếu không có vùng nào được chọn
        setZoneSelectionStart(null);
        setZoneSelectionEnd(null);
      }
    }
  };

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

    const newZone = {
      zoneId: zones.find(z => z.name === zoneSelectionName.trim())?._id || Date.now().toString(),
      zoneName: zoneSelectionName.trim(),
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

  const availableTables = (Array.isArray(tables) ? tables : []).filter(
    table => !layout.tables.some(lt => lt.tableId === table._id)
  );

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
            value={layout.gridCols}
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
            value={layout.gridRows}
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
                  {zone.zoneName} ({(zone.bounds.x2 - zone.bounds.x1 + 1)}x{zone.bounds.y2 - zone.bounds.y1 + 1})
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
                    {table.location || 'Chưa có vị trí'} • {table.width || 1}x{table.height || 1} ô
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
                gridTemplateColumns: `repeat(${layout.gridCols}, 48px)`,
                gridTemplateRows: `repeat(${layout.gridRows}, 48px)`,
                width: 'fit-content',
                margin: '0 auto'
              }}
            >
              {Array.from({ length: layout.gridRows * layout.gridCols }).map((_, index) => {
                const rowIndex = Math.floor(index / layout.gridCols);
                const colIndex = index % layout.gridCols;
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
                // Mỗi lần xoay 90°: swap width và height
                let displayWidth = 1;
                let displayHeight = 1;
                if (table && isMainCell) {
                  // Lấy width và height từ layout table (đã lưu khi đặt bàn)
                  // Nếu không có trong layout, fallback về original table từ props
                  const originalTable = tables.find(t => t._id === table.tableId);
                  const tableWidth = table.width ?? originalTable?.width ?? 1;
                  const tableHeight = table.height ?? originalTable?.height ?? 1;
                  const rotation = table.position.rotation || 0;
                  
                  // 0°: width x height
                  // 90°: height x width (swap)
                  // 180°: width x height
                  // 270°: height x width (swap)
                  const isRotated = rotation === 90 || rotation === 270;
                  displayWidth = isRotated ? tableHeight : tableWidth;
                  displayHeight = isRotated ? tableWidth : tableHeight;
                  
                  // Debug log để kiểm tra
                  if (tableWidth !== 1 || tableHeight !== 1) {
                    console.log(`Table ${table.tableName} display:`, {
                      layoutTable: { width: table.width, height: table.height },
                      originalTable: { width: originalTable?.width, height: originalTable?.height },
                      final: { width: tableWidth, height: tableHeight },
                      rotation: `${rotation}°`,
                      display: `${displayWidth}x${displayHeight}`,
                      isRotated
                    });
                  }
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
                        ? `${table.tableName} (${table.width || 1}x${table.height || 1}) - ${table.position.rotation || 0}° - Khu: ${table.zoneName || 'Chưa có'} - Kéo để di chuyển, Click để xóa`
                        : isInZoneSelection
                        ? 'Vùng đang chọn cho khu'
                        : zoneForCell
                        ? `Khu: ${zoneForCell.zoneName} - Bàn đặt vào đây sẽ tự động thuộc khu này`
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
                        onDragStart={(e) => handleDragStartPlaced(e, table.tableId)}
                        className="w-full h-full relative"
                        style={{
                          transform: `rotate(${table.position.rotation || 0}deg)`, // Xoay container/background
                        }}
                      >
                        <div 
                          className="text-xs font-bold absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{
                            transform: `rotate(${-(table.position.rotation || 0)}deg)`, // Xoay ngược lại để text giữ nguyên hướng
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
          {layout.tables.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Bàn đã đặt ({layout.tables.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {layout.tables.map((lt) => {
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
                          ({lt.position.x}, {lt.position.y}) - {lt.width || 1}x{lt.height || 1} - {lt.position.rotation || 0}°
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRotateTable(lt.tableId)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Xoay bàn"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveTable(lt.tableId)}
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
          disabled={!layout.name || layout.tables.length === 0}
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

