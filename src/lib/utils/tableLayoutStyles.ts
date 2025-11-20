/**
 * Shared styling utilities for table layout rendering
 * Đảm bảo consistency giữa TableLayoutEditor và TableSelectionModal
 */

export const GRID_CELL_SIZE = 48; // px - Kích thước mỗi ô trong grid
export const GRID_GAP = 4; // px - Khoảng cách giữa các ô

/**
 * Get cell color classes based on table status and state
 */
export function getTableCellColor(params: {
  isMainCell: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  isAvailable?: boolean;
  isReserved?: boolean;
  isOccupied?: boolean;
  isMaintenance?: boolean;
  isInEditor?: boolean;
}): string {
  const {
    isMainCell,
    isSelected,
    isHovered,
    isAvailable,
    isReserved,
    isOccupied,
    isMaintenance,
    isInEditor = false,
  } = params;

  if (!isMainCell) {
    return 'bg-white border-gray-300';
  }

  // Editor mode - always show tables as editable
  if (isInEditor) {
    return 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-600 text-white cursor-move shadow-md hover:shadow-lg transition-all';
  }

  // Customer view mode - show availability status
  if (isSelected) {
    return 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-600 text-white shadow-lg ring-2 ring-amber-400';
  }

  if (isHovered && isAvailable) {
    return 'bg-amber-100 border-amber-400 text-amber-900 shadow-md transition-all';
  }

  if (isMaintenance) {
    return 'bg-gray-100 border-gray-300 text-gray-500 opacity-50 cursor-not-allowed';
  }

  if (isOccupied || isReserved) {
    return 'bg-red-100 border-red-300 text-red-800 opacity-75 cursor-not-allowed';
  }

  if (isAvailable) {
    return 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200 cursor-pointer transition-all';
  }

  // Default
  return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
}

/**
 * Get empty cell color classes
 */
export function getEmptyCellColor(params: {
  isDragOver?: boolean;
  isSelectable?: boolean;
  isInZone?: boolean;
  isInZoneSelection?: boolean;
}): string {
  const { isDragOver, isSelectable, isInZone, isInZoneSelection } = params;

  if (isInZoneSelection) {
    return 'bg-amber-300 border-amber-500 border-dashed';
  }

  if (isInZone) {
    return 'bg-amber-50 border-amber-200';
  }

  if (isDragOver) {
    return 'bg-amber-200 border-amber-400 border-dashed';
  }

  if (isSelectable) {
    return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 cursor-pointer';
  }

  return 'bg-white border-gray-200 hover:bg-gray-50';
}

/**
 * Get grid container styles
 */
export function getGridContainerStyle(gridCols: number, gridRows: number) {
  return {
    gridTemplateColumns: `repeat(${gridCols}, ${GRID_CELL_SIZE}px)`,
    gridTemplateRows: `repeat(${gridRows}, ${GRID_CELL_SIZE}px)`,
    gap: `${GRID_GAP}px`,
    width: 'fit-content',
    margin: '0 auto',
  };
}

/**
 * Calculate display dimensions based on rotation
 */
export function getDisplayDimensions(
  width: number,
  height: number,
  rotation: number
): { displayWidth: number; displayHeight: number } {
  const isRotated = rotation === 90 || rotation === 270;
  return {
    displayWidth: isRotated ? height : width,
    displayHeight: isRotated ? width : height,
  };
}

/**
 * Get cell grid position style
 */
export function getCellGridStyle(
  colIndex: number,
  rowIndex: number,
  spanWidth: number = 1,
  spanHeight: number = 1
) {
  return {
    gridColumn: spanWidth > 1 ? `${colIndex + 1} / span ${spanWidth}` : `${colIndex + 1}`,
    gridRow: spanHeight > 1 ? `${rowIndex + 1} / span ${spanHeight}` : `${rowIndex + 1}`,
  };
}

/**
 * Legend items for table status
 */
export const TABLE_STATUS_LEGEND = [
  {
    color: 'bg-emerald-100 border-emerald-300',
    label: 'Trống - Có thể chọn',
    icon: '🟢',
  },
  {
    color: 'bg-amber-100 border-amber-300',
    label: 'Đã đặt - Có thể chọn',
    icon: '🟡',
  },
  {
    color: 'bg-red-100 border-red-300',
    label: 'Đã được chọn - Không thể chọn',
    icon: '🔴',
  },
  {
    color: 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-600',
    label: 'Bàn bạn đã chọn',
    icon: '🟠',
  },
  {
    color: 'bg-gray-100 border-gray-300',
    label: 'Bảo trì',
    icon: '⚫',
  },
];

/**
 * Common cell base classes
 */
export const CELL_BASE_CLASSES = 'rounded-lg border-2 transition-all relative';

/**
 * Screen indicator component props
 */
export const SCREEN_INDICATOR = {
  text: 'KHU VỰC PHỤC VỤ',
  className: 'inline-block bg-gradient-to-r from-gray-200 to-gray-300 px-8 py-2 rounded-lg',
  textClassName: 'text-sm font-semibold text-gray-600',
};
