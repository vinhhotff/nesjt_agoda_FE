'use client';

import { Table } from '@/src/Types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, X } from 'lucide-react';

interface TableSeatSelectorProps {
  tables: Table[];
  selectedTableId?: string | null;
  onSelectTable: (table: Table) => void;
  onDeselectTable?: () => void;
  disabled?: boolean;
  showGuestsCount?: boolean;
  guestsByTable?: Record<string, number>;
}

export default function TableSeatSelector({
  tables,
  selectedTableId,
  onSelectTable,
  onDeselectTable,
  disabled = false,
  showGuestsCount = false,
  guestsByTable = {},
}: TableSeatSelectorProps) {
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);

  const getTableStatus = (table: Table) => {
    return table.status || 'available';
  };

  const getTableColor = (table: Table, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) {
      return 'bg-amber-500 border-amber-600 text-white shadow-lg scale-105';
    }
    if (isHovered && !disabled) {
      return 'bg-amber-100 border-amber-400 text-amber-900 shadow-md';
    }

    const status = getTableStatus(table);
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case 'occupied':
        return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed opacity-75';
      case 'reserved':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'maintenance':
        return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-50';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const isTableSelectable = (table: Table) => {
    const status = getTableStatus(table);
    return status === 'available' || status === 'reserved';
  };

  const handleTableClick = (table: Table) => {
    if (disabled || !isTableSelectable(table)) return;

    if (selectedTableId === table._id && onDeselectTable) {
      onDeselectTable();
    } else {
      onSelectTable(table);
    }
  };

  // Group tables by location for better organization
  const tablesByLocation = tables.reduce((acc, table) => {
    const location = table.location || 'Khác';
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Chú thích:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-green-100 border-2 border-green-300"></div>
            <span className="text-xs text-gray-600">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-100 border-2 border-red-300"></div>
            <span className="text-xs text-gray-600">Đang dùng</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 border-2 border-amber-300"></div>
            <span className="text-xs text-gray-600">Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gray-100 border-2 border-gray-300"></div>
            <span className="text-xs text-gray-600">Bảo trì</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="space-y-6">
        {Object.entries(tablesByLocation).map(([location, locationTables]) => (
          <div key={location}>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">{location}</h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {locationTables.map((table) => {
                const isSelected = selectedTableId === table._id;
                const isHovered = hoveredTableId === table._id;
                const isSelectable = isTableSelectable(table);
                const guestCount = guestsByTable[table._id] || 0;

                return (
                  <motion.button
                    key={table._id}
                    onClick={() => handleTableClick(table)}
                    onMouseEnter={() => !disabled && setHoveredTableId(table._id)}
                    onMouseLeave={() => setHoveredTableId(null)}
                    disabled={disabled || !isSelectable}
                    whileHover={!disabled && isSelectable ? { scale: 1.05 } : {}}
                    whileTap={!disabled && isSelectable ? { scale: 0.95 } : {}}
                    className={`
                      relative p-3 rounded-xl border-2 font-semibold
                      transition-all duration-200
                      ${getTableColor(table, isSelected, isHovered)}
                      ${!isSelectable ? 'cursor-not-allowed' : 'cursor-pointer'}
                      ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2' : ''}
                    `}
                  >
                    {/* Table Number */}
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-sm font-bold">{table.tableName}</span>
                      
                      {/* Guest Count */}
                      {showGuestsCount && guestCount > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Users className="w-3 h-3" />
                          <span>{guestCount}</span>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Status Badge */}
                    {!isSelected && (
                      <div className="absolute top-1 right-1">
                        {getTableStatus(table) === 'occupied' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        {getTableStatus(table) === 'reserved' && (
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Table Info */}
      {selectedTableId && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Bàn đã chọn:</p>
                <p className="text-lg font-bold text-gray-900">
                  {tables.find((t) => t._id === selectedTableId)?.tableName}
                </p>
              </div>
              {onDeselectTable && (
                <button
                  onClick={onDeselectTable}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

